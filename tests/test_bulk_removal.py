"""Source transaction tests using real planning code and fake device I/O."""
import ast
import asyncio
from collections.abc import Mapping
from copy import deepcopy
import logging
import runpy
from pathlib import Path
import time
from types import SimpleNamespace
from typing import Any
import unittest
from unittest.mock import AsyncMock

ROOT = Path(__file__).resolve().parents[1] / "custom_components/matter_binding_studio"
message = runpy.run_path(str(ROOT / "messages.py"))["message"]


class PlanError(Exception):
    pass


def entry(node, endpoint=1, cluster=6, group=None):
    return dict(target_node_id=node, target_endpoint_id=endpoint, cluster_id=cluster, target_group_id=group)


def relationship(identity, source=(1, 1), target=2, group=None):
    return {"id": identity, "source": {"node_id": source[0], "endpoint_id": source[1], "can_bind": True},
            "targets": {"kind": "group" if group is not None else "endpoint", "group_id": group,
                        "members": [] if group is not None else [{"node_id": target, "endpoint_id": 1}]}}


class BulkRemovalTest(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        names = {"_binding_matches_target", "_binding_signature", "_pending_plans", "_source_locks", "_purge_expired_plans", "_take_plan"}
        tree = ast.parse((ROOT / "writer.py").read_text())
        env = dict(Any=Any, Mapping=Mapping, HomeAssistant=Any, asyncio=asyncio,
                   time=time, DOMAIN="studio", _PLAN_TTL_SECONDS=300, StudioWriteError=PlanError, message=message)
        exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name in names], type_ignores=[]), "writer.py", "exec"), env)
        self.w = SimpleNamespace(**env)
        self.hass = SimpleNamespace(data={})
        self.rows = [relationship("a", target=2), relationship("b", target=3)]
        self.tables = {(1, 1): [entry(2), entry(2, cluster=8), entry(3), entry(9)]}
        self.writes = []
        self.read_failure = set()
        self.unverified = set()

        async def read(client, node, ep):
            if (node, ep) in self.read_failure:
                raise RuntimeError("offline")
            return deepcopy(self.tables[(node, ep)])

        async def write(client, *, source_node_id, source_endpoint_id, bindings):
            key = (source_node_id, source_endpoint_id)
            self.writes.append((key, deepcopy(bindings)))
            self.tables[key] = deepcopy(bindings)
            return key not in self.unverified

        self.w.async_get_snapshot = AsyncMock(side_effect=lambda _: {"relationships": deepcopy(self.rows)})
        self.w._require_client = lambda _: object()
        self.w._read_bindings = read
        self.w._write_and_verify_binding_table = write
        self.w._LOGGER = logging.getLogger("test.bulk")
        tree = ast.parse((ROOT / "bulk.py").read_text())
        tree.body = [n for n in tree.body if not isinstance(n, ast.ImportFrom)]
        self.api = {"w": self.w}
        exec(compile(tree, "bulk.py", "exec"), self.api)

    async def prepare(self, ids):
        return await self.api["prepare"](self.hass, ids)

    async def apply(self, plan):
        return await self.api["apply"](self.hass, plan["plan_id"])

    async def test_same_source_one_write_preserves_unselected(self):
        plan = await self.prepare(["a", "b", "a"])
        self.assertEqual(plan["source_count"], 1)
        self.assertEqual(plan["removed_entry_count"], 3)
        self.assertEqual(self.writes, [])
        result = await self.apply(plan)
        self.assertTrue(result["success"])
        self.assertEqual(self.writes, [((1, 1), [entry(9)])])
        with self.assertRaises(PlanError):
            await self.apply(plan)

    async def test_changed_table_does_not_write(self):
        plan = await self.prepare(["a"])
        self.tables[(1, 1)].append(entry(10))
        result = await self.apply(plan)
        self.assertEqual(result["results"][0]["status"], "changed")
        self.assertEqual(self.writes, [])

    async def test_offline_source_does_not_prevent_other_sources(self):
        self.rows.append(relationship("c", source=(4, 1)))
        self.tables[(4, 1)] = [entry(2)]
        plan = await self.prepare(["a", "c"])
        self.read_failure.add((1, 1))
        with self.assertLogs("test.bulk", level="WARNING"):
            result = await self.apply(plan)
        self.assertEqual([r["status"] for r in result["results"]], ["failed", "verified"])
        self.assertFalse(result["success"])
        self.assertEqual(len(self.writes), 1)

    async def test_mixed_group_and_direct_and_uncertain_readback(self):
        self.rows.append(relationship("g", group=200))
        self.tables[(1, 1)].append(entry(None, endpoint=None, group=200))
        plan = await self.prepare(["a", "g"])
        self.unverified.add((1, 1))
        result = await self.apply(plan)
        self.assertEqual(result["results"][0]["status"], "unverified")
        self.assertEqual(self.tables[(1, 1)], [entry(3), entry(9)])

    async def test_expired_plan_and_unknown_ids_rejected(self):
        for ids in ([], ["missing"]):
            with self.assertRaises(PlanError):
                await self.prepare(ids)
        plan = await self.prepare(["a"])
        self.w._pending_plans(self.hass)[plan["plan_id"]]["created_at"] -= 301
        with self.assertRaises(PlanError):
            await self.apply(plan)
        self.assertEqual(self.writes, [])

    async def test_missing_binding_blocks_entire_prepare(self):
        self.tables[(1, 1)] = [entry(2)]
        with self.assertRaises(PlanError):
            await self.prepare(["a", "b"])
        self.assertEqual(self.w._pending_plans(self.hass), {})

    async def test_incomplete_identities_never_create_a_plan(self):
        original = deepcopy(self.rows)
        for kind in ("source", "endpoint", "group", "unknown"):
            self.rows = deepcopy(original)
            if kind == "source":
                self.rows[0]["source"]["node_id"] = None
            elif kind == "endpoint":
                self.rows[0]["targets"]["members"][0]["endpoint_id"] = None
            else:
                self.rows[0]["targets"] = {"kind": kind, "members": []}
            with self.subTest(kind=kind), self.assertRaises(PlanError):
                await self.prepare(["a"])
            self.assertEqual(self.w._pending_plans(self.hass), {})
        self.assertEqual(self.writes, [])

    async def test_overlapping_plans_share_the_source_lock(self):
        first = await self.prepare(["a"])
        second = await self.prepare(["b"])
        lock = self.w._source_locks(self.hass).setdefault((1, 1), asyncio.Lock())
        await lock.acquire()
        first_task = asyncio.create_task(self.apply(first))
        second_task = asyncio.create_task(self.apply(second))
        await asyncio.sleep(0)
        self.assertEqual(self.writes, [])
        lock.release()
        results = await asyncio.gather(first_task, second_task)
        self.assertEqual([r["results"][0]["status"] for r in results], ["verified", "changed"])
        self.assertEqual(len(self.writes), 1)


if __name__ == "__main__":
    unittest.main()
