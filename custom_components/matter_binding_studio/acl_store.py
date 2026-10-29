"""Local evidence of Studio ACL writes, never an authorization to reclaim ACLs.

Records identify complete semantic entries, not mutable list indexes. A write
intent is durable before device I/O; only full-table readback can verify it.
Unknown/legacy entries are never adopted. No secrets or group keys are stored.
"""
from __future__ import annotations

import asyncio
from collections import Counter
from copy import deepcopy
from datetime import datetime, timezone
import hashlib
import json
import secrets
from typing import Any

from .const import DOMAIN


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def canonical_entry(entry: dict[str, Any]) -> dict[str, Any]:
    """Canonicalize normalized ACLs, ignoring local fabric index and ordering."""
    subjects = entry.get("subjects")
    targets = entry.get("targets")
    return {
        "privilege": int(entry["privilege"]), "authMode": int(entry["authMode"]),
        "subjects": sorted(subjects) if subjects else None,
        "targets": sorted(({
            "endpoint": t.get("endpoint"), "cluster": t.get("cluster"),
            "deviceType": t.get("deviceType"),
        } for t in targets), key=lambda t: json.dumps(t, sort_keys=True)) if targets else None,
    }


def fingerprint(entry: dict[str, Any]) -> str:
    return hashlib.sha256(json.dumps(canonical_entry(entry), sort_keys=True).encode()).hexdigest()


def identity_scope(client: Any, node_id: int) -> dict[str, Any] | None:
    """Bind evidence to the fabric AND this node's commissioning incarnation.

    Missing identity means unscoped evidence only; never fall back to an IP,
    fabric index, friendly name or bare node ID as an ownership identity.
    """
    try:
        info = client.server_info
        fabric_id = info.compressed_fabric_id
        node = client.get_node(node_id)
        data = getattr(node, "node_data", node)
        commissioned = data.date_commissioned
        if isinstance(commissioned, str):
            commissioned = datetime.fromisoformat(commissioned.replace("Z", "+00:00"))
        if (isinstance(fabric_id, bool) or not isinstance(fabric_id, int)
                or fabric_id <= 0 or not isinstance(commissioned, datetime)
                or commissioned.tzinfo is None):
            return None
        return {"compressed_fabric_id": str(fabric_id), "node_id": node_id,
                "date_commissioned": commissioned.astimezone(timezone.utc).isoformat()}
    except Exception:  # Identity is optional metadata; never guess on client errors.
        return None


def _concrete_operate(entry: dict[str, Any]) -> bool:
    return (entry["privilege"] == 3 and entry["authMode"] in (2, 3)
            and bool(entry["subjects"]) and bool(entry["targets"])
            and all(t["endpoint"] is not None and t["cluster"] is not None
                    and t["deviceType"] is None for t in entry["targets"]))


class ACLProvenanceStore:
    """Copy-on-save journal; failed disk writes cannot publish verified evidence."""

    def __init__(self, hass: Any, store: Any = None) -> None:
        if store is None:
            from homeassistant.helpers.storage import Store
            store = Store(hass, 1, f"{DOMAIN}_acl_provenance")
        self._store = store
        self._data: dict[str, Any] | None = None
        self._lock = asyncio.Lock()

    async def async_load(self) -> None:
        async with self._lock:
            if self._data is not None:
                return
            raw = await self._store.async_load()
            if raw is not None and (not isinstance(raw, dict)
                    or not isinstance(raw.get("operations"), dict)):
                raise ValueError("Unsupported ACL provenance store")
            self._data = deepcopy(raw) if raw is not None else {"operations": {}}

    def operations(self) -> list[dict[str, Any]]:
        if self._data is None:
            raise RuntimeError("Load ACL provenance before use")
        return deepcopy(list(self._data["operations"].values()))

    async def async_begin(self, *, scope: dict[str, Any] | None, node_id: int,
                          before: list[dict], after: list[dict], origin: dict) -> str:
        before_rows = [canonical_entry(e) for e in before]
        after_rows = [canonical_entry(e) for e in after]
        before_counts = Counter(fingerprint(e) for e in before_rows)
        after_counts = Counter(fingerprint(e) for e in after_rows)
        # Claim only unique, concrete entries that were absent before this write.
        added = {fingerprint(e): e for e in after_rows
                 if before_counts[fingerprint(e)] == 0
                 and after_counts[fingerprint(e)] == 1 and _concrete_operate(e)
                 and origin.get("kind") in ("unicast", "groupcast")}
        operation_id = secrets.token_urlsafe(18)
        async with self._lock:
            data = deepcopy(self._data)
            if data is None:
                raise RuntimeError("Load ACL provenance before use")
            self._invalidate(data, scope, before_counts)
            data["operations"][operation_id] = {
                "operation_id": operation_id, "scope": deepcopy(scope),
                "target_node_id": node_id, "origin": deepcopy(origin),
                "created_at": _now(), "verified_at": None, "status": "pending",
                "before": sorted(before_counts.elements()),
                "after": sorted(after_counts.elements()),
                "added": added, "invalidated": [],
            }
            await self._store.async_save(data)
            self._data = data
        return operation_id

    async def async_finish(self, operation_id: str, *, verified: bool) -> None:
        async with self._lock:
            data = deepcopy(self._data)
            operation = data["operations"][operation_id]
            if operation["status"] != "pending":
                raise ValueError("ACL provenance operation is already finished")
            operation["status"] = "verified" if verified else "uncertain"
            if verified:
                operation["verified_at"] = _now()
            # A failed/partial replacement may have removed previous grants.
            self._invalidate(data, operation["scope"], Counter(operation["after"])
                             if verified else Counter(), exclude=operation_id)
            await self._store.async_save(data)
            self._data = data

    @staticmethod
    def _invalidate(data: dict, scope: dict | None, counts: Counter,
                    exclude: str | None = None) -> None:
        if scope is None:
            return
        for op_id, op in data["operations"].items():
            if op_id == exclude or op["scope"] != scope or op["status"] != "verified":
                continue
            invalid = set(op["invalidated"])
            invalid.update(key for key in op["added"] if counts[key] != 1)
            op["invalidated"] = sorted(invalid)

    async def async_observe(self, scope: dict | None, entries: list[dict]) -> None:
        """Retire missing/duplicate evidence; reappearance cannot revive it."""
        async with self._lock:
            data = deepcopy(self._data)
            self._invalidate(data, scope, Counter(fingerprint(e) for e in entries))
            if data != self._data:
                await self._store.async_save(data)
                self._data = data

    def describe(self, scope: dict | None, entries: list[dict], entry: dict) -> dict:
        key = fingerprint(entry)
        # Pending writes are persisted across restarts. They cannot establish
        # ownership, and supersede earlier proof on the same target node.
        operations = self.operations()
        blocked = any(op["scope"] == scope and op["status"] in ("pending", "uncertain")
                      for op in operations) if scope is not None else True
        candidates = [op for op in operations if scope is not None and op["scope"] == scope
                      and op["status"] == "verified" and key in op["added"]
                      and key not in op["invalidated"]]
        exact = sum(fingerprint(e) == key for e in entries) == 1
        record = candidates[-1] if candidates and exact and not blocked else None
        return {
            "state": "studio_recorded" if record else "unknown",
            "entry_fingerprint": key,
            "operation_id": record["operation_id"] if record else None,
            "created_at": record["created_at"] if record else None,
            "verified_at": record["verified_at"] if record else None,
            "origin": deepcopy(record["origin"]) if record else None,
            "safe_to_reclaim": False,
        }


def get_acl_store(hass: Any) -> ACLProvenanceStore:
    data = hass.data.setdefault(DOMAIN, {})
    if "_acl_provenance_store" not in data:
        data["_acl_provenance_store"] = ACLProvenanceStore(hass)
    return data["_acl_provenance_store"]
