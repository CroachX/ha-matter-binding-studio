"""Allowlisted support data. Never serialize raw devices, errors or storage."""
from collections import Counter
from datetime import datetime, timezone

from .messages import CATALOG

OPERATIONS = frozenset(
    f"{phase}_{name}"
    for phase in ("prepare", "apply")
    for name in ("unicast", "groupcast", "remove_binding", "bulk_remove_bindings", "cleanup_group", "remove_acl")
)
STATUSES = frozenset(("verified", "changed", "failed", "unverified"))
ERROR_CODES = frozenset(("plan_failed", "write_failed", "matter_operation_failed", "acl_read_failed", "forbidden", "not_loaded"))


def now():
    return datetime.now(timezone.utc).isoformat()


def number(value):
    return value if type(value) is int and 0 <= value <= 0xFFFFFFFF else None


def clusters(values):
    return sorted({value for value in values if type(value) is int and value in (6, 8, 768)})


def snapshot_summary(snapshot):
    """Deliberately omit names, IDs, topology and unrecognized extension fields."""
    return {
        "captured_at": now(),
        "binding_inventory_complete": snapshot.get("binding_inventory_complete") is True,
        "endpoint_capabilities": [{
            "source": row.get("can_bind") is True,
            "target": row.get("can_be_target") is True,
            "client_clusters": clusters(row.get("client_capabilities", [])),
            "server_clusters": clusters(row.get("server_capabilities", [])),
        } for row in snapshot.get("devices", [])],
        "relationships": dict(Counter(
            row.get("route") if row.get("route") in ("direct", "native_group") else "unknown"
            for row in snapshot.get("relationships", [])
        )),
        "groups": dict(Counter(
            row.get("status") if row.get("status") in ("active", "pending", "repair_needed") else "unknown"
            for row in snapshot.get("native_control_sets", [])
        )),
        "capacities": [{key: number(row.get(key)) for key in (
            "max_groups_per_fabric", "max_group_keys_per_fabric", "group_table_entries", "group_key_map_entries"
        )} for row in snapshot.get("capacities", [])],
        "warning_count": len(snapshot.get("warnings", [])),
    }


def operation_summary(operation, *, result=None, error=None):
    """Small volatile outcome record, NOT a persistent write-step journal."""
    if operation not in OPERATIONS:
        return None
    summary = {"operation": operation, "completed_at": now()}
    if error is not None:
        code = error.get("code")
        summary.update(status="error", error_code=code if code in ERROR_CODES else "unknown")
        descriptor = error.get("studio_message")
    else:
        result = result or {}
        summary["status"] = "planned" if operation.startswith("prepare_") else (
            "verified" if result.get("success") is True and result.get("verified") is True else "unverified"
        )
        if isinstance(result.get("results"), list):
            statuses = [r.get("status") if r.get("status") in STATUSES else "unknown" for r in result["results"]]
            summary["source_results"] = dict(Counter(statuses))
            summary["status"] = ("verified" if statuses and all(s == "verified" for s in statuses)
                                 else "partial" if "verified" in statuses else "unverified")
        summary["repair_needed"] = result.get("repair_needed") is True
        descriptor = result.get("message_i18n")
    if isinstance(descriptor, dict) and descriptor.get("code") in CATALOG:
        summary["message_code"] = descriptor["code"]
    return summary
