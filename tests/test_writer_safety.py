"""Regression tests for real transaction code using isolated device boundaries."""
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from studio_test_support import w


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
