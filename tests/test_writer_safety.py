"""Regression tests for real transaction code using isolated device boundaries."""
import asyncio
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
