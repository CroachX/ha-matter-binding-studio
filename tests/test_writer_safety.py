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
