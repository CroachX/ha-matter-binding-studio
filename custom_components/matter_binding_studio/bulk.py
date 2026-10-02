"""Reviewed Binding deletion, grouped by source endpoint."""

import asyncio
import secrets
import time

from . import writer as w


def group_selections(snapshot, relationship_ids):
    """Resolve stable relationship identities from a fresh server snapshot."""
    ids = set(relationship_ids)
    if not ids or len(ids) > 200:
        raise w.StudioWriteError(w.message("bulk_selection_size"))
    relationships = {row["id"]: row for row in snapshot["relationships"]}
    if not ids.issubset(relationships):
        raise w.StudioWriteError(w.message("bulk_selection_changed"))
    groups = {}
    for identity in sorted(ids):
        row = relationships[identity]
        source = row["source"]
        if (not source.get("can_bind") or source.get("node_id") is None
                or source.get("endpoint_id") is None):
            raise w.StudioWriteError(w.message("bulk_source_unavailable"))
        key = (source["node_id"], source["endpoint_id"])
        groups.setdefault(key, []).append(row)
    return groups


def matches(entry, relationship):
    target = relationship["targets"]
    member = target["members"][0] if target.get("members") else None
    if target["kind"] == "endpoint":
        if (member is None or member.get("node_id") is None
                or member.get("endpoint_id") is None):
            raise w.StudioWriteError(w.message("bulk_target_incomplete"))
    elif target["kind"] == "group":
        if target.get("group_id") is None:
            raise w.StudioWriteError(w.message("bulk_group_incomplete"))
    else:
        raise w.StudioWriteError(w.message("bulk_target_unsupported"))
    return w._binding_matches_target(
        entry, target_kind=target["kind"],
        target_node_id=member["node_id"] if member else None,
        target_endpoint_id=member["endpoint_id"] if member else None,
        target_group_id=target.get("group_id"),
    )


async def prepare(hass, relationship_ids):
    snapshot = await w.async_get_snapshot(hass)
    groups = group_selections(snapshot, relationship_ids)
    client = w._require_client(hass)
    tables = []
    for key, rows in groups.items():
        before = await w._read_bindings(client, *key)
        for row in rows:
            if not any(matches(entry, row) for entry in before):
                raise w.StudioWriteError(w.message("bulk_table_changed"))
        after = [entry for entry in before if not any(matches(entry, row) for row in rows)]
        tables.append({"key": key, "before": before, "after": after, "rows": rows})
    plan_id = secrets.token_urlsafe(24)
    w._pending_plans(hass)[plan_id] = {
        "kind": "bulk_remove_bindings", "created_at": time.monotonic(),
        "tables": tables,
    }
    w._purge_expired_plans(hass)
    return {
        "plan_id": plan_id, "expires_in_seconds": w._PLAN_TTL_SECONDS,
        "relationships": [row for table in tables for row in table["rows"]],
        "source_count": len(tables),
        "removed_entry_count": sum(len(t["before"]) - len(t["after"]) for t in tables),
    }


async def apply(hass, plan_id):
    plan = w._take_plan(hass, plan_id, expected_kind="bulk_remove_bindings")
    client = w._require_client(hass)
    results = []
    # Sequential source transactions keep progress independent without claiming
    # atomicity across devices. Each source uses the same lock as single writes.
    for table in plan["tables"]:
        key = table["key"]
        result = {
            "relationship_ids": [row["id"] for row in table["rows"]],
            "source": table["rows"][0]["source"], "status": "failed",
        }
        lock = w._source_locks(hass).setdefault(key, asyncio.Lock())
        async with lock:
            writing = False
            try:
                current = await w._read_bindings(client, *key)
                if w._binding_signature(current) != w._binding_signature(table["before"]):
                    result["status"] = "changed"
                else:
                    writing = True
                    verified = await w._write_and_verify_binding_table(
                        client, source_node_id=key[0], source_endpoint_id=key[1],
                        bindings=table["after"],
                    )
                    result["status"] = "verified" if verified else "unverified"
            except Exception as err:  # Per-source failure must not hide other results.
                w._LOGGER.warning("Studio bulk Binding removal failed for %s: %s", key, err)
                result["status"] = "unverified" if writing else "failed"
        results.append(result)
    return {"success": all(r["status"] == "verified" for r in results), "results": results}
