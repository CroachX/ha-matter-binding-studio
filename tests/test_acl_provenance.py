"""ACL history is diagnostic evidence, not permission to delete shared grants."""
from copy import deepcopy
from types import SimpleNamespace as NS
import unittest
from unittest.mock import AsyncMock, patch

from studio_test_support import acl_store as a, w

SCOPE = dict(compressed_fabric_id="1234", node_id=2,
             date_commissioned="2026-10-01T00:00:00+00:00")
ORIGIN = dict(kind="unicast", source_node_id=1, source_endpoint_id=1, target_endpoint_id=1)
ADMIN = dict(privilege=5, authMode=2, subjects=[999], targets=None)


def grant(clusters=(6, 8), subject=1, mode=2):
    return dict(privilege=3, authMode=mode, subjects=[subject], targets=[
        dict(endpoint=1, cluster=cluster, deviceType=None) for cluster in clusters])


class MemoryStorage:
    def __init__(self):
        self.data = None
        self.fail = False

    async def async_load(self):
        return deepcopy(self.data)

    async def async_save(self, data):
        if self.fail:
            raise OSError("disk full")
        self.data = deepcopy(data)


class ProvenanceTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.storage = MemoryStorage()
        self.store = a.ACLProvenanceStore(None, self.storage)
        await self.store.async_load()

    async def record(self, before=None, after=None, scope=SCOPE, origin=ORIGIN):
        return await self.store.async_begin(scope=scope, node_id=2,
            before=before if before is not None else [ADMIN],
            after=after if after is not None else [ADMIN, grant()], origin=origin)

    def describe(self, entry=None, table=None, scope=SCOPE):
        return self.store.describe(scope, table if table is not None else [ADMIN, grant()],
                                   entry if entry is not None else grant())

    async def test_only_verified_new_grants_have_provenance(self):
        self.assertEqual(self.describe()["state"], "unknown")
        op = await self.record()
        self.assertEqual(self.describe()["state"], "unknown")
        await self.store.async_finish(op, verified=True)
        result = self.describe()
        self.assertEqual(result["state"], "studio_recorded")
        self.assertEqual(result["origin"], ORIGIN)
        self.assertIsNotNone(result["verified_at"])
        self.assertFalse(result["safe_to_reclaim"])
        reloaded = a.ACLProvenanceStore(None, self.storage)
        await reloaded.async_load()
        self.assertEqual(reloaded.describe(SCOPE, [ADMIN, grant()], grant()), result)

    async def test_legacy_grant_and_admin_are_never_adopted(self):
        op = await self.record(before=[ADMIN, grant()], after=[ADMIN, grant(), grant((768,))])
        await self.store.async_finish(op, verified=True)
        self.assertEqual(self.describe()["state"], "unknown")
        self.assertEqual(self.describe(ADMIN)["state"], "unknown")
        self.assertEqual(self.describe(grant((768,)), [ADMIN, grant(), grant((768,))])["state"], "studio_recorded")

    async def test_reordering_does_not_change_entry_identity(self):
        op = await self.record()
        await self.store.async_finish(op, verified=True)
        reordered = grant((8, 6)) | {"fabricIndex": 77}
        self.assertEqual(a.fingerprint(reordered), a.fingerprint(grant()))
        self.assertEqual(self.describe(reordered, [reordered, ADMIN])["state"], "studio_recorded")

    async def test_new_fabric_or_recommissioned_node_cannot_reuse_record(self):
        op = await self.record()
        await self.store.async_finish(op, verified=True)
        for scope in (None, SCOPE | {"compressed_fabric_id": "5678"},
                      SCOPE | {"date_commissioned": "2026-10-02T00:00:00+00:00"},
                      SCOPE | {"node_id": 3}):
            self.assertEqual(self.describe(scope=scope)["state"], "unknown")

    async def test_missing_identity_stays_unknown_even_after_verified_write(self):
        op = await self.record(scope=None)
        await self.store.async_finish(op, verified=True)
        self.assertEqual(self.describe(scope=None)["state"], "unknown")
        self.assertEqual(self.describe()["state"], "unknown")

    async def test_edited_missing_or_duplicate_grant_cannot_reappear_as_owned(self):
        for observed in ([ADMIN], [ADMIN, grant((6,))], [ADMIN, grant(), grant()]):
            op = await self.record()
            await self.store.async_finish(op, verified=True)
            await self.store.async_observe(SCOPE, observed)
            self.assertEqual(self.describe()["state"], "unknown")

    async def test_failed_write_cannot_create_or_preserve_ownership(self):
        op = await self.record()
        await self.store.async_finish(op, verified=True)
        failed = await self.record(before=[ADMIN, grant()], after=[ADMIN, grant(), grant((768,))])
        self.assertEqual(self.describe()["state"], "unknown")
        await self.store.async_finish(failed, verified=False)
        self.assertEqual(self.describe()["state"], "unknown")
        self.assertEqual(self.store.operations()[-1]["status"], "uncertain")

    async def test_save_failure_keeps_durable_pending_evidence_after_restart(self):
        op = await self.record()
        self.storage.fail = True
        with self.assertRaises(OSError):
            await self.store.async_finish(op, verified=True)
        self.assertEqual(self.store.operations()[0]["status"], "pending")
        reloaded = a.ACLProvenanceStore(None, self.storage)
        await reloaded.async_load()
        self.assertEqual(reloaded.describe(SCOPE, [ADMIN, grant()], grant())["state"], "unknown")

    async def test_cleanup_cannot_adopt_remainder_of_legacy_packed_rule(self):
        op = await self.record(before=[ADMIN, grant()], after=[ADMIN, grant((8,))],
                               origin={"kind": "group_cleanup", "group_id": 33})
        await self.store.async_finish(op, verified=True)
        self.assertEqual(self.describe(grant((8,)), [ADMIN, grant((8,))])["state"], "unknown")

    async def test_wildcards_and_duplicate_additions_are_not_claimed(self):
        for entry, table in ((grant((None,)), [ADMIN, grant((None,))]),
                             (grant(), [ADMIN, grant(), grant()])):
            op = await self.record(after=table)
            await self.store.async_finish(op, verified=True)
            self.assertEqual(self.describe(entry, table)["state"], "unknown")

    async def test_failed_intent_save_prevents_device_write(self):
        self.storage.fail = True
        hass = NS(data={w.DOMAIN: {"_acl_provenance_store": self.store}})
        with patch.object(w, "_write_acl", AsyncMock()) as write:
            with self.assertRaises(OSError):
                await w._write_recorded_acl(hass, NS(), 2, before=[ADMIN],
                                            after=[ADMIN, grant()], origin=ORIGIN)
            write.assert_not_awaited()
        self.assertEqual(self.store.operations(), [])

    async def test_corrupt_storage_is_not_silently_replaced(self):
        self.storage.data = {"operations": []}
        store = a.ACLProvenanceStore(None, self.storage)
        with self.assertRaises(ValueError):
            await store.async_load()


class ReferenceTests(unittest.TestCase):
    def relationship(self, identity, endpoint, *, group=False):
        return dict(id=identity, source=dict(node_id=1, endpoint_id=endpoint, name="Same label"),
            route="native_group" if group else "direct", clusters=[6, 8],
            targets=dict(group_id=33 if group else None, name="Light",
                         members=[dict(node_id=2, endpoint_id=1)]))

    def test_shared_node_acl_keeps_each_source_endpoint_reference(self):
        rows = [self.relationship("a", 1), self.relationship("b", 2)]
        refs = w._acl_relationship_references(grant(), target_node_id=2, relationships=rows)
        self.assertEqual([r["relationship_id"] for r in refs], ["a", "b"])
        self.assertEqual([r["source_endpoint_id"] for r in refs], [1, 2])
        remaining = w._acl_relationship_references(grant(), target_node_id=2, relationships=rows[1:])
        self.assertEqual([r["relationship_id"] for r in remaining], ["b"])

    def test_group_acl_and_duplicate_snapshot_rows(self):
        rows = [self.relationship("a", 1, group=True), self.relationship("b", 2, group=True)]
        refs = w._acl_relationship_references(grant(subject=33, mode=3), target_node_id=2,
                                             relationships=[*rows, rows[0]])
        self.assertEqual(len(refs), 2)
        self.assertEqual(w._acl_relationship_references(grant(subject=34, mode=3),
                         target_node_id=2, relationships=rows), [])

    def test_identity_requires_fabric_and_commissioned_timestamp(self):
        client = NS(server_info=NS(compressed_fabric_id=1234),
                    get_node=lambda _: NS(node_data=NS(date_commissioned=SCOPE["date_commissioned"])))
        self.assertEqual(a.identity_scope(client, 2), SCOPE)
        self.assertIsNone(a.identity_scope(NS(), 2))
        client.get_node = lambda _: NS(node_data=NS(date_commissioned="invalid"))
        self.assertIsNone(a.identity_scope(client, 2))
