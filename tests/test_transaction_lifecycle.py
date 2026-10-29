"""Offline integration tests: real writer/store with an in-memory Matter transport.

This exercises orchestration, encoding and readback, not CHIP or real hardware.
"""
from contextlib import ExitStack
from copy import deepcopy
from types import ModuleType, SimpleNamespace as NS
import unittest
from unittest.mock import AsyncMock, patch

from studio_test_support import w, matter, group_store, acl_store


def command(name):
    return lambda **kwargs: NS(operation=name, **kwargs)


class Fabric:
    def __init__(self):
        self.server_info = NS(compressed_fabric_id=1234)
        self.attributes = {}
        self.keys = {node: {0} for node in (1, 2, 3)}
        self.operations = []
        self.fail_operation = None
        for node in self.keys:
            self.attributes[node] = {
                "0/62/5": 1, "0/63/0": [], "0/63/1": [],
                "0/63/2": 4, "0/63/3": 4,
                "0/31/0": [dict(privilege=5, authMode=2, subjects=[999], targets=None)],
                "0/31/3": 3, "0/31/4": 8, "1/30/0": [],
            }
        self.devices = [dict(node_id=node, endpoint_id=1, name=f"Device {node}",
            can_bind=node == 1, can_be_target=node != 1,
            client_capabilities=[6, 8] if node == 1 else [],
            server_capabilities=[6, 8] if node != 1 else []) for node in self.keys]

    def get_node(self, node_id):
        return NS(node_data=NS(date_commissioned="2026-10-01T00:00:00+00:00"))

    async def snapshot(self, _hass, *, fresh_bindings=False):
        bindings = {(1, 1): matter._parse_bindings(self.attributes[1]["1/30/0"])}
        endpoints = {(d["node_id"], d["endpoint_id"]): d for d in self.devices}
        return dict(devices=self.devices, warnings=[], binding_inventory_complete=fresh_bindings,
            relationships=matter._relationships_from_bindings(bindings, endpoints, {}))

    async def read_attribute(self, *, node_id, attribute_path):
        return {attribute_path: deepcopy(self.attributes[node_id][attribute_path])}

    async def write_attribute(self, *, node_id, attribute_path, value):
        self.operations.append(("write", node_id, attribute_path))
        if self.fail_operation == attribute_path:
            raise RuntimeError("simulated transport failure")
        self.attributes[node_id][attribute_path] = deepcopy(value)
        return None

    async def send_raw_command(self, name, *, node_id, entry):
        if name != "set_acl_entry":
            raise AssertionError(name)
        return await self.write_attribute(node_id=node_id, attribute_path="0/31/0", value=entry)

    async def send_device_command(self, *, node_id, endpoint_id, command):
        op = command.operation
        if op == "KeySetReadAllIndices":
            return {"groupKeySetIDs": sorted(self.keys[node_id])}
        self.operations.append((op, node_id, endpoint_id))
        if op == self.fail_operation:
            raise RuntimeError("simulated command failure")
        if op == "KeySetWrite":
            self.keys[node_id].add(command.groupKeySet.groupKeySetID)
        elif op == "KeySetRemove":
            self.keys[node_id].discard(command.groupKeySetID)
        elif op == "AddGroup":
            table = self.attributes[node_id]["0/63/1"]
            entry = next((e for e in table if e["groupId"] == command.groupID), None)
            if entry is None:
                entry = dict(groupId=command.groupID, endpoints=[], groupName=command.groupName)
                table.append(entry)
            entry["endpoints"].append(endpoint_id)
        elif op == "RemoveGroup":
            table = self.attributes[node_id]["0/63/1"]
            for entry in table:
                if entry["groupId"] == command.groupID:
                    entry["endpoints"].remove(endpoint_id)
            self.attributes[node_id]["0/63/1"] = [e for e in table if e["endpoints"]]
        else:
            raise AssertionError(op)
        return {"status": 0}


class LifecycleTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.fabric = Fabric()
        self.hass = NS(data={})
        self.storage = NS(async_load=AsyncMock(return_value=None), async_save=AsyncMock())
        self.store = group_store.ManagedGroupStore(self.hass, self.storage)
        self.hass.data[w.DOMAIN] = {"_managed_group_store": self.store}
        self.acl_storage = NS(async_load=AsyncMock(return_value=None), async_save=AsyncMock())
        self.acl_store = acl_store.ACLProvenanceStore(self.hass, self.acl_storage)
        self.hass.data[w.DOMAIN]["_acl_provenance_store"] = self.acl_store
        clusters = ModuleType("chip.clusters")
        clusters.Objects = NS(
            Groups=NS(Commands=NS(AddGroup=command("AddGroup"), RemoveGroup=command("RemoveGroup"))),
            GroupKeyManagement=NS(Commands=NS(
                KeySetWrite=command("KeySetWrite"), KeySetRemove=command("KeySetRemove"),
                KeySetReadAllIndices=command("KeySetReadAllIndices")),
                Structs=NS(GroupKeySetStruct=lambda **kwargs: NS(**kwargs))))
        types = ModuleType("chip.clusters.Types")
        types.NullValue = None
        self.stack = ExitStack()
        self.addCleanup(self.stack.close)
        self.stack.enter_context(patch.dict("sys.modules", {
            "chip": ModuleType("chip"), "chip.clusters": clusters, "chip.clusters.Types": types}))
        self.stack.enter_context(patch.object(w, "_require_client", return_value=self.fabric))
        self.stack.enter_context(patch.object(w, "async_get_snapshot", side_effect=self.fabric.snapshot))
        self.stack.enter_context(patch.object(w, "_VERIFY_DELAY_SECONDS", 0))
        self.stack.enter_context(patch.object(w, "_VERIFY_ATTEMPTS", 1))

    async def prepare_group(self):
        return await w.async_prepare_groupcast(self.hass, source_node_id=1, source_endpoint_id=1,
            targets=[dict(node_id=2, endpoint_id=1), dict(node_id=3, endpoint_id=1)], clusters=[6, 8])

    async def create_direct(self):
        plan = await w.async_prepare_unicast(self.hass, source_node_id=1, source_endpoint_id=1,
            target_node_id=2, target_endpoint_id=1, clusters=[6, 8])
        result = await w.async_apply_unicast(self.hass, plan_id=plan["plan_id"])
        self.assertTrue(result["verified"])

    async def test_unicast_groupcast_delete_cleanup_lifecycle(self):
        # Preserve an unrelated wildcard Binding throughout every mutation.
        unrelated = dict(node=99, endpoint=1)
        self.fabric.attributes[1]["1/30/0"] = [unrelated]
        await self.create_direct()
        direct_acl = await w._read_acl(self.fabric, 2)
        plan = await self.prepare_group()
        self.assertTrue(plan["replaces_direct_binding"])
        result = await w.async_apply_groupcast(self.hass, plan_id=plan["plan_id"])
        self.assertTrue(result["verified"])
        group = self.store.list_groups()[0]
        self.assertEqual(group.status, "active")
        bindings = await w._read_bindings(self.fabric, 1, 1)
        self.assertEqual(len(bindings), 3)
        self.assertEqual(sum(e["target_group_id"] == group.group_id for e in bindings), 2)
        # An active source must block cleanup before any destructive operation.
        with self.assertRaises(w.StudioWriteError):
            await w.async_prepare_cleanup_group(self.hass, group_id=group.group_id)
        plan = await w.async_prepare_remove_binding(self.hass, source_node_id=1, source_endpoint_id=1,
            target_kind="group", target_node_id=None, target_endpoint_id=None, target_group_id=group.group_id)
        result = await w.async_apply_remove_binding(self.hass, plan_id=plan["plan_id"])
        self.assertTrue(result["verified"])
        self.assertEqual(await w._read_bindings(self.fabric, 1, 1), matter._parse_bindings([unrelated]))
        self.assertIn(group.key_set_id, self.fabric.keys[2])
        plan = await w.async_prepare_cleanup_group(self.hass, group_id=group.group_id)
        result = await w.async_apply_cleanup_group(self.hass, plan_id=plan["plan_id"])
        self.assertTrue(result["verified"])
        self.assertEqual(self.store.list_groups(), [])
        for node in (1, 2, 3):
            self.assertEqual(self.fabric.keys[node], {0})
            self.assertEqual(self.fabric.attributes[node]["0/63/0"], [])
            self.assertEqual(self.fabric.attributes[node]["0/63/1"], [])
        self.assertEqual(w._acl_signature(await w._read_acl(self.fabric, 2)), w._acl_signature(direct_acl))

    async def test_failed_provision_preserves_direct_route_and_repair_record(self):
        await self.create_direct()
        before = await w._read_bindings(self.fabric, 1, 1)
        plan = await self.prepare_group()
        self.fabric.fail_operation = "AddGroup"
        result = await w.async_apply_groupcast(self.hass, plan_id=plan["plan_id"])
        self.assertTrue(result["repair_needed"])
        self.assertFalse(result["verified"])
        self.assertEqual(await w._read_bindings(self.fabric, 1, 1), before)
        self.assertEqual(self.store.list_groups()[0].status, "repair_needed")

    async def test_binding_changed_since_review_writes_nothing(self):
        plan = await self.prepare_group()
        self.assertEqual(self.fabric.operations, [])
        self.fabric.attributes[1]["1/30/0"] = [dict(node=99, endpoint=1, cluster=6)]
        with self.assertRaises(w.StudioWriteError):
            await w.async_apply_groupcast(self.hass, plan_id=plan["plan_id"])
        self.assertEqual(self.fabric.operations, [])

    async def test_failed_metadata_save_prevents_device_writes(self):
        plan = await self.prepare_group()
        self.storage.async_save.side_effect = OSError("disk full")
        with self.assertRaises(OSError):
            await w.async_apply_groupcast(self.hass, plan_id=plan["plan_id"])
        self.assertEqual(self.fabric.operations, [])

    async def test_partial_cleanup_retains_metadata_and_can_be_retried(self):
        plan = await self.prepare_group()
        self.fabric.fail_operation = "AddGroup"
        await w.async_apply_groupcast(self.hass, plan_id=plan["plan_id"])
        group = self.store.list_groups()[0]
        # Provisioned keys exist, but no Binding route was committed.
        plan = await w.async_prepare_cleanup_group(self.hass, group_id=group.group_id)
        self.fabric.fail_operation = "KeySetRemove"
        result = await w.async_apply_cleanup_group(self.hass, plan_id=plan["plan_id"])
        self.assertTrue(result["repair_needed"])
        self.assertIsNotNone(self.store.get(group.group_id))
        self.fabric.fail_operation = None
        plan = await w.async_prepare_cleanup_group(self.hass, group_id=group.group_id)
        result = await w.async_apply_cleanup_group(self.hass, plan_id=plan["plan_id"])
        self.assertTrue(result["verified"])
        self.assertIsNone(self.store.get(group.group_id))

    async def test_expired_plan_never_writes(self):
        plan = await self.prepare_group()
        w._pending_plans(self.hass)[plan["plan_id"]]["created_at"] -= w._PLAN_TTL_SECONDS + 1
        with self.assertRaises(w.StudioWriteError):
            await w.async_apply_groupcast(self.hass, plan_id=plan["plan_id"])
        self.assertEqual(self.fabric.operations, [])
