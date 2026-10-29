"""Regression tests for real transaction code using isolated device boundaries."""
import asyncio
import time
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from studio_test_support import w, matter


def binding(node, cluster=6):
    return dict(target_node_id=node, target_endpoint_id=1,
                target_group_id=None, cluster_id=cluster)


class VerificationTests(unittest.IsolatedAsyncioTestCase):
    async def test_acl_write_rejects_readback_missing_administrator(self):
        admin = dict(privilege=5, authMode=2, subjects=[999], targets=None)
        grant = dict(privilege=3, authMode=2, subjects=[1],
                     targets=[dict(endpoint=1, cluster=6, deviceType=None)])
        client = SimpleNamespace(send_raw_command=AsyncMock(return_value=None))
        with (patch.object(w, "_read_acl", AsyncMock(return_value=[grant])),
              patch.object(w, "_VERIFY_ATTEMPTS", 1),
              patch.object(w, "_VERIFY_DELAY_SECONDS", 0)):
            with self.assertRaises(w.StudioWriteError):
                await w._write_acl(client, 2, [admin, grant])

    async def test_group_members_are_awaited_and_failure_is_reported(self):
        members = [dict(node_id=2, endpoint_id=1), dict(node_id=3, endpoint_id=1)]
        for responses, expected in (([True, True], True), ([True, False], False)):
            with patch.object(w, "_verify_group_membership", AsyncMock(side_effect=responses)) as verify:
                self.assertEqual(await w._verify_group_memberships(None, members=members, group_id=32768), expected)
                self.assertEqual(verify.await_count, 2)

    async def test_unicast_rejects_readback_that_loses_old_entries(self):
        client = SimpleNamespace(write_attribute=AsyncMock(return_value=None))
        expected = [binding(7), binding(8)]
        with (patch.object(w, "_read_fabric_index", AsyncMock(return_value=1)),
              patch.object(w, "_read_bindings", AsyncMock(return_value=[binding(8)])),
              patch.object(w, "_VERIFY_ATTEMPTS", 1),
              patch.object(w, "_VERIFY_DELAY_SECONDS", 0)):
            self.assertFalse(await w._write_and_verify_bindings(client, 1, 1, expected, 8, 1, [6]))

    async def test_complete_unicast_readback_passes(self):
        expected = [binding(7), binding(8)]
        client = SimpleNamespace(write_attribute=AsyncMock(return_value=None))
        with (patch.object(w, "_read_fabric_index", AsyncMock(return_value=1)),
              patch.object(w, "_read_bindings", AsyncMock(return_value=expected))):
            self.assertTrue(await w._write_and_verify_bindings(client, 1, 1, expected, 8, 1, [6]))


class BindingParsingTests(unittest.TestCase):
    def test_wildcard_survives_roundtrip(self):
        rows = matter._parse_bindings([{"node": 7, "endpoint": 1}, {"group": 33}])
        self.assertEqual(len(rows), 2)
        self.assertIsNone(rows[0]["cluster_id"])
        self.assertTrue(w._binding_exists(rows, node_id=7, endpoint_id=1, cluster_id=8))
        for tagged in (True, False):
            encoded = [w._encode_binding(row, 1, tagged) for row in rows]
            self.assertEqual(matter._parse_bindings(encoded), rows)

    def test_unknown_shapes_fail_closed(self):
        for value in ({"error": "offline"}, None, [{}], [{"node": 2}],
                      [{"node": 2, "group": 3, "endpoint": 1}],
                      [{"node": 2, "endpoint": 1, "cluster": "invalid"}]):
            with self.subTest(value=value), self.assertRaises(ValueError):
                matter._parse_bindings(value)

    def test_wildcard_conversion_is_rejected(self):
        with self.assertRaises(w.StudioWriteError):
            w._matching_direct_entries([binding(7, None)], [{"node_id": 7, "endpoint_id": 1}], [6])

    def test_missing_target_keeps_technical_identity_for_removal(self):
        source = {"node_id": 1, "endpoint_id": 1, "name": "Controller", "client_capabilities": [6, 8]}
        rows = matter._relationships_from_bindings({(1, 1): [binding(7, None)]}, {(1, 1): source}, {})
        self.assertEqual(rows[0]["targets"]["members"][0]["node_id"], 7)
        self.assertTrue(rows[0]["has_wildcard_cluster"])
        self.assertEqual(rows[0]["clusters"], [6, 8])


class SerializationTests(unittest.IsolatedAsyncioTestCase):
    async def test_different_sources_share_target_transaction_lock(self):
        hass = SimpleNamespace(data={})
        entered = asyncio.Event()
        release = asyncio.Event()
        acl = []

        @w.serialized_write
        async def mutate(hass, source):
            before = list(acl)
            if source == 1:
                entered.set()
                await release.wait()
            acl[:] = before + [source]

        first = asyncio.create_task(mutate(hass, 1))
        await entered.wait()
        second = asyncio.create_task(mutate(hass, 2))
        await asyncio.sleep(0)
        self.assertFalse(second.done())
        release.set()
        await asyncio.gather(first, second)
        self.assertEqual(acl, [1, 2])

    async def test_lock_released_after_exception(self):
        hass = SimpleNamespace(data={})

        @w.serialized_write
        async def mutate(hass, fail):
            if fail:
                raise RuntimeError("device unavailable")
            return True

        with self.assertRaises(RuntimeError):
            await mutate(hass, True)
        self.assertTrue(await asyncio.wait_for(mutate(hass, False), 1))

    def test_all_apply_entrypoints_are_serialized(self):
        for name in dir(w):
            if name.startswith("async_apply_"):
                self.assertTrue(hasattr(getattr(w, name), "__wrapped__"), name)


class CleanupSafetyTests(unittest.IsolatedAsyncioTestCase):
    async def test_single_removal_supports_wildcard_entries(self):
        hass = SimpleNamespace(data={})
        source = dict(node_id=1, endpoint_id=1, can_bind=True)
        with (patch.object(w, "async_get_snapshot", AsyncMock(return_value={"devices": [source]})),
              patch.object(w, "_require_client", return_value=object()),
              patch.object(w, "_read_bindings", AsyncMock(return_value=[binding(2, None)])),
              patch.object(w, "_write_and_verify_binding_table", AsyncMock(return_value=True))):
            plan = await w.async_prepare_remove_binding(hass, source_node_id=1, source_endpoint_id=1,
                target_kind="endpoint", target_node_id=2, target_endpoint_id=1, target_group_id=None)
            self.assertTrue(plan["has_wildcard_cluster"])
            result = await w.async_apply_remove_binding(hass, plan_id=plan["plan_id"])
            self.assertTrue(result["verified"])

    def test_group_cleanup_preserves_ambiguous_wildcard_acl(self):
        for target in ({"endpoint": 1, "cluster": None},
                       {"endpoint": 1, "cluster": 6, "deviceType": 256}):
            entry = dict(privilege=3, authMode=3, subjects=[33], targets=[target])
            remaining, changed, ambiguous = w._without_group_acl_targets(
                [entry], group_id=33, endpoint_id=1, clusters={6})
            self.assertEqual(remaining, [entry])
            self.assertFalse(changed)
            self.assertTrue(ambiguous)

    async def test_group_acl_cleanup_rejects_lost_unrelated_rule(self):
        owned = dict(privilege=3, authMode=3, subjects=[33],
                     targets=[dict(endpoint=1, cluster=6, deviceType=None)])
        other = dict(privilege=5, authMode=2, subjects=[99], targets=None)
        with (patch.object(w, "_read_acl", AsyncMock(side_effect=[[owned, other], []])),
              patch.object(w, "_write_recorded_acl", AsyncMock()),
              patch.object(w, "_VERIFY_ATTEMPTS", 1),
              patch.object(w, "_VERIFY_DELAY_SECONDS", 0)):
            with self.assertRaises(w.StudioWriteError):
                await w._remove_group_acl_grants(None, hass=None, node_id=2, endpoint_id=1, group_id=33, clusters=[6])

    def test_unknown_acl_usage_is_never_reclaimable(self):
        for targets in (None, [], [{"endpoint": None, "cluster": None}],
                        [{"endpoint": 1, "cluster": 6}]):
            entry = dict(privilege=3, authMode=2, subjects=[99], targets=targets)
            result = w._public_acl_entry(entry, index=0, target_node_id=2,
                endpoint_names={}, node_names={}, group_names={}, relationships=[])
            self.assertFalse(result["usage"]["safe_to_reclaim"])
            self.assertEqual(result["usage"]["state"], "unknown")

    async def test_prepare_and_legacy_apply_never_write_acl(self):
        hass = SimpleNamespace(data={})
        with patch.object(w, "_write_acl", AsyncMock()) as write:
            with self.assertRaises(w.StudioWriteError):
                await w.async_prepare_remove_acl(hass, target_node_id=2, target_endpoint_id=1, entry_index=0)
            w._pending_plans(hass)["legacy"] = {"kind": "remove_acl", "created_at": time.monotonic()}
            with self.assertRaises(w.StudioWriteError):
                await w.async_apply_remove_acl(hass, plan_id="legacy")
            write.assert_not_awaited()

    def test_group_cleanup_fails_closed_on_partial_or_cached_inventory(self):
        for snapshot in ({"relationships": []},
                         {"relationships": [], "binding_inventory_complete": True, "warnings": ["offline"]}):
            with self.assertRaises(w.StudioWriteError):
                w._require_group_is_idle(snapshot, 33)
        w._require_group_is_idle({"relationships": [], "binding_inventory_complete": True}, 33)
        with self.assertRaises(w.StudioWriteError):
            w._require_group_is_idle({"binding_inventory_complete": True, "relationships": [
                {"route": "native_group", "targets": {"group_id": 33}}]}, 33)

    async def test_fresh_binding_read_ignores_empty_cache(self):
        client = SimpleNamespace(read_attribute=AsyncMock(return_value={"1/30/0": [{"group": 33}]}))
        with patch.object(matter, "_cached_attribute", return_value=[]):
            rows, failed = await matter._async_read_bindings(client, None, 1, 1, fresh=True)
            self.assertFalse(failed)
            self.assertEqual(rows[0]["target_group_id"], 33)
            client.read_attribute.assert_awaited_once()

    async def test_unreachable_binding_read_is_unknown_not_idle(self):
        client = SimpleNamespace(read_attribute=AsyncMock(side_effect=RuntimeError("offline")))
        with patch.object(matter, "_cached_attribute", return_value=[]):
            self.assertEqual(await matter._async_read_bindings(client, None, 1, 1, fresh=True), ([], True))


class GroupResourceTests(unittest.IsolatedAsyncioTestCase):
    async def test_bridge_endpoints_share_one_acl_budget(self):
        admin = {"privilege": 5, "authMode": 2, "subjects": [1], "targets": None}
        members = [dict(node_id=10, endpoint_id=ep, server_capabilities=[6]) for ep in (1, 2)]
        async def capacity(client, node, entries):
            return dict(used=len(entries), maximum=4, targets_per_entry=3)
        with (patch.object(w, "_read_acl", AsyncMock(return_value=[admin] * 3)),
              patch.object(w, "_read_acl_capacity", side_effect=capacity)):
            with self.assertRaises(w.StudioWriteError):
                await w._preflight_group_acl_capacity(None, members=members, group_id=33, clusters=[6])

    async def test_independent_nodes_have_independent_acl_budgets(self):
        admin = {"privilege": 5, "authMode": 2, "subjects": [1], "targets": None}
        members = [dict(node_id=n, endpoint_id=1, server_capabilities=[6]) for n in (10, 11)]
        async def capacity(client, node, entries):
            return dict(used=len(entries), maximum=4, targets_per_entry=3)
        with (patch.object(w, "_read_acl", AsyncMock(return_value=[admin] * 3)),
              patch.object(w, "_read_acl_capacity", side_effect=capacity)):
            result = await w._preflight_group_acl_capacity(None, members=members, group_id=33, clusters=[6])
            self.assertEqual([row["entries_to_add"] for row in result], [1, 1])

    async def test_key_inventory_uses_command_and_rejects_unknown_response(self):
        with patch.object(w, "_key_set_read_all_command", return_value=object()):
            for response in ({"groupKeySetIDs": [0, 256]}, {"0": [0, 256]}, SimpleNamespace(groupKeySetIDs=[0, 256])):
                with patch.object(w, "_send_device_command", AsyncMock(return_value=response)):
                    self.assertEqual(await w._read_key_set_ids(None, 1), {0, 256})
            for response in ({}, {"groupKeySetIDs": None}, {"groupKeySetIDs": ["bad"]}):
                with patch.object(w, "_send_device_command", AsyncMock(return_value=response)), self.assertRaises(w.StudioWriteError):
                    await w._read_key_set_ids(None, 1)

    async def test_unmapped_key_sets_count_against_capacity(self):
        async def read(client, node, path):
            return {"0/63/0": [], "0/63/1": [], "0/63/2": 4, "0/63/3": 2}[path]
        with (patch.object(w, "_read_attribute", side_effect=read),
              patch.object(w, "_read_key_set_ids", AsyncMock(return_value={0, 256}))):
            with self.assertRaises(w.StudioWriteError):
                await w._preflight_group_capacity(None, source_node_id=1, member_node_ids=[2])

    async def test_map_removal_preserves_other_mapping_and_encodes_wire_fields(self):
        before = [{"groupId": 33, "groupKeySetID": 256}, {"groupId": 34, "groupKeySetID": 257}]
        client = SimpleNamespace(write_attribute=AsyncMock(return_value=None))
        with (patch.object(w, "_read_attribute", AsyncMock(side_effect=[before, before[1:]])),
              patch.object(w, "_read_fabric_index", AsyncMock(return_value=1))):
            await w._remove_group_key_mapping(client, node_id=2, group_id=33, key_set_id=256)
            self.assertEqual(client.write_attribute.call_args.kwargs["value"],
                             [{"groupId": 34, "groupKeySetID": 257, "fabricIndex": 1}])

    def test_group_name_truncates_utf8_safely(self):
        value = w._group_wire_name("Study 主臥室智慧燈群組")
        self.assertLessEqual(len(value.encode("utf-8")), 16)
        self.assertTrue("Study 主臥室智慧燈群組".startswith(value))


class GroupDiscoveryTests(unittest.TestCase):
    def test_external_group_members_come_from_root_group_table(self):
        groups = {}
        rows = [{"groupId": 33, "endpoints": [1, 3], "groupName": "Room"}]
        def cached(node, endpoint, cluster, attribute):
            self.assertEqual((endpoint, cluster, attribute), (0, 63, 1))
            return rows
        with patch.object(matter, "_cached_attribute", side_effect=cached):
            for ep in (1, 2, 3):
                matter._add_cached_group_memberships(groups, None, ep,
                    {"node_id": 7, "endpoint_id": ep, "capabilities": [6]})
        self.assertEqual([m["endpoint_id"] for m in groups[33]["members"]], [1, 3])
        self.assertFalse(groups[33]["managed_by_studio"])

    def test_tagged_group_table(self):
        groups = {}
        with patch.object(matter, "_cached_attribute", return_value=[{"1": 33, "2": [1], "3": "Room"}]):
            matter._add_cached_group_memberships(groups, None, 1,
                {"node_id": 7, "endpoint_id": 1, "capabilities": [6]})
        self.assertEqual(groups[33]["name"], "Room")

    def test_cached_capacity_does_not_guess_key_slots(self):
        values = {0: [], 1: [], 2: 4, 3: 3}
        with patch.object(matter, "_cached_attribute", side_effect=lambda n, e, c, a: values[a]):
            result = matter._group_capacity(None, 1, "Test")
        self.assertIsNone(result["available_group_key_slots"])
