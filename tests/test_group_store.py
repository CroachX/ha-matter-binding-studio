"""Persistence failures must not erase the private repair record in memory."""
import asyncio
import unittest
from unittest.mock import AsyncMock
from types import SimpleNamespace

from studio_test_support import w, group_store

ManagedGroupStore = group_store.ManagedGroupStore


def group():
    return w.ManagedGroup(33, 44, "00" * 16, "Test group", 1, 1,
                          [dict(node_id=2, endpoint_id=1)], [6], "pending")


class GroupStoreTests(unittest.IsolatedAsyncioTestCase):
    async def test_concurrent_load_only_reads_once(self):
        storage = SimpleNamespace(async_load=AsyncMock(return_value=None))
        store = ManagedGroupStore(None, store=storage)
        await asyncio.gather(store.async_load(), store.async_load())
        storage.async_load.assert_awaited_once()

    async def test_failed_save_preserves_last_durable_state(self):
        storage = SimpleNamespace(async_load=AsyncMock(return_value=None), async_save=AsyncMock())
        store = ManagedGroupStore(None, store=storage)
        await store.async_load()
        await store.async_put(group())
        storage.async_save.side_effect = OSError("disk full")
        with self.assertRaises(OSError):
            await store.async_set_status(33, "active")
        self.assertEqual(store.get(33).status, "pending")
        with self.assertRaises(OSError):
            await store.async_remove(33)
        self.assertIsNotNone(store.get(33))

    async def test_initial_save_failure_does_not_publish_group(self):
        storage = SimpleNamespace(async_load=AsyncMock(return_value=None),
                                  async_save=AsyncMock(side_effect=OSError("disk full")))
        store = ManagedGroupStore(None, store=storage)
        await store.async_load()
        with self.assertRaises(OSError):
            await store.async_put(group())
        self.assertEqual(store.list_groups(), [])
