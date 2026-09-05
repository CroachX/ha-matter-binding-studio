"""Guarded native-Matter binding transactions.

The Studio offers a relationship-first workflow.  A one-target relationship
uses unicast; a multi-target relationship provisions an automatic native Group
and writes groupcast entries.  Both flows are review-first and only claim
success after their Binding Cluster readback succeeds.
"""

from __future__ import annotations

import asyncio
import logging
import secrets
import time
from collections.abc import Mapping, Sequence
from typing import Any

from homeassistant.core import HomeAssistant

from .const import (
    ATTR_ACCESS_CONTROL_ENTRIES_PER_FABRIC,
    ATTR_ACL,
    ATTR_BINDING,
    ATTR_CURRENT_FABRIC_INDEX,
    ATTR_GROUP_KEY_MAP,
    ATTR_GROUP_TABLE,
    ATTR_TARGETS_PER_ACCESS_CONTROL_ENTRY,
    CLUSTER_ACCESS_CONTROL,
    CLUSTER_BINDING,
    CLUSTER_GROUP_KEY_MANAGEMENT,
    CLUSTER_OPERATIONAL_CREDENTIALS,
    DOMAIN,
    STUDIO_GROUP_ID_END,
    STUDIO_GROUP_ID_START,
    STUDIO_KEY_SET_ID_START,
)
from .group_store import ManagedGroup, get_managed_group_store, new_epoch_key
from .matter import _get_matter_client, _parse_bindings, async_get_snapshot

_LOGGER = logging.getLogger(__name__)

_PLAN_TTL_SECONDS = 5 * 60
_VERIFY_ATTEMPTS = 5
_VERIFY_DELAY_SECONDS = 1.0
_FABRIC_INDEX_TAG = 254
_BINDING_TAGS = {"node": 1, "group": 2, "endpoint": 3, "cluster": 4}
_ACL_PRIVILEGE_ADMINISTER = 5
_ACL_PRIVILEGE_OPERATE = 3
_ACL_AUTH_MODE_CASE = 2
_ACL_AUTH_MODE_GROUP = 3
_GROUP_KEY_MAP_TAGS = {"groupId": 1, "groupKeySetID": 2}
_GROUP_NAME_MAX_LENGTH = 16


class StudioWriteError(RuntimeError):
    """A user-safe write transaction error."""


async def async_get_acl_overview(
    hass: HomeAssistant,
    *,
    target_node_id: int,
    target_endpoint_id: int,
) -> dict[str, Any]:
    """Return one target's ACL with named, Binding-aware safe diagnostics.

    This intentionally reads one operator-selected target rather than making
    every Fabric refresh query every device's Access Control cluster.  The
    response has no key material and keeps raw Matter identifiers out of the
    normal UI while retaining the table index required for a later reviewed
    cleanup transaction.
    """
    snapshot = await async_get_snapshot(hass)
    target = _find_endpoint(
        snapshot.get("devices", []), target_node_id, target_endpoint_id
    )
    if target is None or not target.get("can_be_target"):
        raise StudioWriteError("Choose a valid Matter output target.")
    client = _require_client(hass)
    entries = await _read_acl(client, target_node_id)
    capacity = await _read_acl_capacity(client, target_node_id, entries)
    endpoint_names = {
        int(endpoint["endpoint_id"]): _endpoint_presentation_name(endpoint)
        for endpoint in snapshot.get("devices", [])
        if endpoint.get("node_id") == target_node_id
        and endpoint.get("endpoint_id") is not None
    }
    node_names = _node_name_index(snapshot.get("devices", []))
    group_names = {
        int(group["group_id"]): str(group.get("name") or "Native group")
        for group in snapshot.get("native_control_sets", [])
    }
    return {
        "target": target,
        "capacity": _public_acl_capacity(capacity),
        "entries": [
            _public_acl_entry(
                entry,
                index=index,
                target_node_id=target_node_id,
                endpoint_names=endpoint_names,
                node_names=node_names,
                group_names=group_names,
                relationships=snapshot.get("relationships", []),
            )
            for index, entry in enumerate(entries)
        ],
    }


async def async_prepare_remove_acl(
    hass: HomeAssistant,
    *,
    target_node_id: int,
    target_endpoint_id: int,
    entry_index: int,
) -> dict[str, Any]:
    """Prepare a guarded reclaim of one explicitly unused ACL entry."""
    snapshot = await async_get_snapshot(hass)
    target = _find_endpoint(
        snapshot.get("devices", []), target_node_id, target_endpoint_id
    )
    if target is None or not target.get("can_be_target"):
        raise StudioWriteError("Choose a valid Matter output target.")
    client = _require_client(hass)
    entries = await _read_acl(client, target_node_id)
    if entry_index < 0 or entry_index >= len(entries):
        raise StudioWriteError("This ACL entry changed or no longer exists. Refresh first.")

    entry = entries[entry_index]
    public_entry = _public_acl_entry(
        entry,
        index=entry_index,
        target_node_id=target_node_id,
        endpoint_names={
            int(endpoint["endpoint_id"]): _endpoint_presentation_name(endpoint)
            for endpoint in snapshot.get("devices", [])
            if endpoint.get("node_id") == target_node_id
            and endpoint.get("endpoint_id") is not None
        },
        node_names=_node_name_index(snapshot.get("devices", [])),
        group_names={
            int(group["group_id"]): str(group.get("name") or "Native group")
            for group in snapshot.get("native_control_sets", [])
        },
        relationships=snapshot.get("relationships", []),
    )
    if not public_entry["usage"]["safe_to_reclaim"]:
        raise StudioWriteError(
            "Only an unused, non-administrator ACL entry with concrete source and target rules can be reclaimed."
        )

    entries_after = [entry for index, entry in enumerate(entries) if index != entry_index]
    plan_id = secrets.token_urlsafe(24)
    _pending_plans(hass)[plan_id] = {
        "kind": "remove_acl",
        "plan_id": plan_id,
        "created_at": time.monotonic(),
        "target": target,
        "target_node_id": target_node_id,
        "target_endpoint_id": target_endpoint_id,
        "acl_before": entries,
        "acl_after": entries_after,
        "entry": public_entry,
    }
    _purge_expired_plans(hass)
    return {
        "plan_id": plan_id,
        "expires_in_seconds": _PLAN_TTL_SECONDS,
        "target": target,
        "entry": public_entry,
        "capacity_before": _public_acl_capacity(
            await _read_acl_capacity(client, target_node_id, entries)
        ),
        "steps": [
            "Read the latest target ACL table.",
            "Remove only the reviewed unused operate rule.",
            "Keep every administrator and in-use ACL rule.",
            "Write the remaining ACL table and read it back.",
        ],
    }


async def async_apply_remove_acl(hass: HomeAssistant, *, plan_id: str) -> dict[str, Any]:
    """Apply a reviewed ACL reclaim transaction and verify the whole table."""
    plan = _take_plan(hass, plan_id, expected_kind="remove_acl")
    target_node_id = int(plan["target_node_id"])
    client = _require_client(hass)
    current = await _read_acl(client, target_node_id)
    if _acl_signature(current) != _acl_signature(plan["acl_before"]):
        raise StudioWriteError(
            "The target ACL changed after review. Refresh and review a new reclaim plan."
        )
    try:
        await _write_acl(client, target_node_id, list(plan["acl_after"]))
        for _ in range(_VERIFY_ATTEMPTS):
            readback = await _read_acl(client, target_node_id)
            if _acl_signature(readback) == _acl_signature(plan["acl_after"]):
                return {
                    "success": True,
                    "verified": True,
                    "message": "The unused target ACL rule was reclaimed and read back.",
                    "target": plan["target"],
                }
            await asyncio.sleep(_VERIFY_DELAY_SECONDS)
    except Exception as err:  # noqa: BLE001 - report uncertain configuration safely
        _LOGGER.warning("Studio ACL reclaim could not be verified: %s", err)
    return {
        "success": False,
        "verified": False,
        "repair_needed": True,
        "message": "The ACL reclaim could not be verified. Refresh before retrying or changing this target.",
        "target": plan["target"],
    }


async def async_prepare_cleanup_group(
    hass: HomeAssistant, *, group_id: int
) -> dict[str, Any]:
    """Review cleanup for a Studio-owned group with no remaining Binding."""
    store = get_managed_group_store(hass)
    await store.async_load()
    group = store.get(group_id)
    if group is None:
        raise StudioWriteError("This native group is not managed by Matter Binding Studio.")
    snapshot = await async_get_snapshot(hass)
    _require_group_is_idle(snapshot, group_id)
    source = _find_endpoint(
        snapshot.get("devices", []), group.source_node_id, group.source_endpoint_id
    )
    if source is None:
        raise StudioWriteError("The managed group's source endpoint is no longer available.")
    members = [
        _find_endpoint(snapshot.get("devices", []), member["node_id"], member["endpoint_id"])
        for member in group.members
    ]
    if any(member is None for member in members):
        raise StudioWriteError(
            "One or more managed group members are no longer available. Keep this group marked for repair."
        )
    plan_id = secrets.token_urlsafe(24)
    _pending_plans(hass)[plan_id] = {
        "kind": "cleanup_group",
        "plan_id": plan_id,
        "created_at": time.monotonic(),
        "group": group,
        "source": source,
        "members": [member for member in members if member is not None],
    }
    _purge_expired_plans(hass)
    return {
        "plan_id": plan_id,
        "expires_in_seconds": _PLAN_TTL_SECONDS,
        "group_id": group.group_id,
        "name": group.name,
        "source": source,
        "members": [member for member in members if member is not None],
        "clusters": list(group.clusters),
        "steps": [
            "Re-read every source Binding table to confirm this group is idle.",
            "Remove only this group's operate ACL targets from its recorded members.",
            "Remove this group from its recorded member endpoints and read membership back.",
            "Remove this group's Group Key mapping and Key Set from every participant.",
            "Remove Studio metadata only after the native cleanup has verified.",
        ],
    }


async def async_apply_cleanup_group(
    hass: HomeAssistant, *, plan_id: str
) -> dict[str, Any]:
    """Clean an idle Studio-owned native group with repair-safe sequencing."""
    plan = _take_plan(hass, plan_id, expected_kind="cleanup_group")
    group: ManagedGroup = plan["group"]
    source_key = (group.source_node_id, group.source_endpoint_id)
    lock = _source_locks(hass).setdefault(source_key, asyncio.Lock())
    async with lock:
        store = get_managed_group_store(hass)
        await store.async_load()
        current_group = store.get(group.group_id)
        if current_group is None or current_group != group:
            raise StudioWriteError(
                "This managed group changed after review. Refresh and review a new cleanup plan."
            )
        snapshot = await async_get_snapshot(hass)
        _require_group_is_idle(snapshot, group.group_id)
        client = _require_client(hass)
        members = list(plan["members"])
        participant_node_ids = sorted(
            {group.source_node_id, *(int(member["node_id"]) for member in members)}
        )
        try:
            for member in members:
                member_clusters = [
                    cluster
                    for cluster in group.clusters
                    if cluster in {int(value) for value in member.get("server_capabilities", [])}
                ]
                await _remove_group_acl_grants(
                    client,
                    node_id=int(member["node_id"]),
                    endpoint_id=int(member["endpoint_id"]),
                    group_id=group.group_id,
                    clusters=member_clusters,
                )

            for member in members:
                await _remove_group_member_if_present(
                    client,
                    node_id=int(member["node_id"]),
                    endpoint_id=int(member["endpoint_id"]),
                    group_id=group.group_id,
                )

            for node_id in participant_node_ids:
                await _remove_group_key_mapping(
                    client,
                    node_id=node_id,
                    group_id=group.group_id,
                    key_set_id=group.key_set_id,
                )
            for node_id in participant_node_ids:
                await _remove_group_key_set(
                    client, node_id=node_id, key_set_id=group.key_set_id
                )
        except Exception as err:  # noqa: BLE001 - preserve repair record for all partial cleanup
            _LOGGER.warning("Studio native group cleanup needs repair: %s", err)
            await store.async_set_status(group.group_id, "repair_needed")
            return {
                "success": False,
                "verified": False,
                "repair_needed": True,
                "message": "Native group cleanup stopped before full verification. The recorded group remains available for repair.",
            }

        await store.async_remove(group.group_id)
        return {
            "success": True,
            "verified": True,
            "message": "The idle native group, access rules, memberships, and Group Key mapping were cleaned up.",
            "group_id": group.group_id,
        }


def _require_group_is_idle(snapshot: Mapping[str, Any], group_id: int) -> None:
    active = [
        relationship
        for relationship in snapshot.get("relationships", [])
        if relationship.get("route") == "native_group"
        and _optional_int((relationship.get("targets") or {}).get("group_id")) == group_id
    ]
    if active:
        raise StudioWriteError(
            "Remove every Binding that targets this native group before cleaning it up."
        )


def _node_name_index(devices: list[Mapping[str, Any]]) -> dict[int, str]:
    result: dict[int, str] = {}
    for device in devices:
        node_id = _optional_int(device.get("node_id"))
        name = str(device.get("node_name") or "").strip()
        if node_id is not None and name:
            result.setdefault(node_id, name)
    return result


def _endpoint_presentation_name(endpoint: Mapping[str, Any]) -> str:
    area = str(endpoint.get("area_name") or "").strip()
    name = str(endpoint.get("name") or "Matter endpoint").strip()
    return f"{area} - {name}" if area else name


def _public_acl_entry(
    entry: Mapping[str, Any],
    *,
    index: int,
    target_node_id: int,
    endpoint_names: Mapping[int, str],
    node_names: Mapping[int, str],
    group_names: Mapping[int, str],
    relationships: list[Mapping[str, Any]],
) -> dict[str, Any]:
    privilege = int(entry["privilege"])
    auth_mode = int(entry["authMode"])
    relationship_names = _acl_relationship_names(
        entry, target_node_id=target_node_id, relationships=relationships
    )
    subjects = entry.get("subjects")
    concrete_subjects = isinstance(subjects, list) and bool(subjects)
    concrete_targets = isinstance(entry.get("targets"), list)
    protected = privilege >= _ACL_PRIVILEGE_ADMINISTER
    safe_to_reclaim = (
        not protected
        and not relationship_names
        and concrete_subjects
        and concrete_targets
    )
    return {
        "entry_index": index,
        "kind": "administrator" if protected else "operate",
        "auth_mode": _acl_auth_mode_label(auth_mode),
        "subjects": _acl_subject_labels(
            subjects, auth_mode=auth_mode, node_names=node_names, group_names=group_names
        ),
        "targets": _acl_target_labels(entry.get("targets"), endpoint_names),
        "usage": {
            "state": (
                "protected"
                if protected
                else "used"
                if relationship_names
                else "unused"
                if safe_to_reclaim
                else "unknown"
            ),
            "relationship_names": relationship_names,
            "safe_to_reclaim": safe_to_reclaim,
        },
    }


def _acl_auth_mode_label(auth_mode: int) -> str:
    if auth_mode == _ACL_AUTH_MODE_CASE:
        return "case"
    if auth_mode == _ACL_AUTH_MODE_GROUP:
        return "group"
    return "other"


def _acl_subject_labels(
    subjects: Any,
    *,
    auth_mode: int,
    node_names: Mapping[int, str],
    group_names: Mapping[int, str],
) -> list[str]:
    if not isinstance(subjects, list) or not subjects:
        return ["All subjects"]
    labels: list[str] = []
    for subject in subjects:
        subject_id = _optional_int(subject)
        if subject_id is None:
            labels.append("Unknown subject")
        elif auth_mode == _ACL_AUTH_MODE_GROUP:
            labels.append(group_names.get(subject_id, "Unknown native group"))
        else:
            labels.append(node_names.get(subject_id, "Unknown Matter node"))
    return labels


def _acl_target_labels(
    targets: Any, endpoint_names: Mapping[int, str]
) -> list[dict[str, str]]:
    if not isinstance(targets, list) or not targets:
        return [{"endpoint": "All endpoints", "capability": "All capabilities"}]
    labels: list[dict[str, str]] = []
    for target in targets:
        endpoint_id = _optional_int(target.get("endpoint")) if isinstance(target, Mapping) else None
        cluster_id = _optional_int(target.get("cluster")) if isinstance(target, Mapping) else None
        labels.append(
            {
                "endpoint": endpoint_names.get(endpoint_id, "All endpoints")
                if endpoint_id is not None
                else "All endpoints",
                "capability": _cluster_label(cluster_id),
            }
        )
    return labels


def _cluster_label(cluster_id: int | None) -> str:
    return {
        6: "On / Off",
        8: "Brightness",
        768: "Color temperature",
    }.get(cluster_id, "All capabilities" if cluster_id is None else "Other capability")


def _acl_relationship_names(
    entry: Mapping[str, Any],
    *,
    target_node_id: int,
    relationships: list[Mapping[str, Any]],
) -> list[str]:
    names: list[str] = []
    for relationship in relationships:
        source = relationship.get("source") or {}
        source_node_id = _optional_int(source.get("node_id"))
        route = relationship.get("route")
        clusters = [int(cluster) for cluster in relationship.get("clusters", [])]
        targets = relationship.get("targets") or {}
        members = targets.get("members") or []
        if route == "direct":
            if source_node_id is None:
                continue
            relevant_members = [
                member
                for member in members
                if _optional_int(member.get("node_id")) == target_node_id
            ]
            if any(
                _acl_grants_case(
                    [dict(entry)],
                    source_node_id,
                    int(member["endpoint_id"]),
                    cluster_id,
                )
                for member in relevant_members
                for cluster_id in clusters
            ):
                names.append(_relationship_presentation_name(relationship))
        elif route == "native_group":
            group_id = _optional_int(targets.get("group_id"))
            if group_id is None:
                continue
            relevant_members = [
                member
                for member in members
                if _optional_int(member.get("node_id")) == target_node_id
            ]
            if any(
                _acl_grants_group(
                    [dict(entry)], group_id, int(member["endpoint_id"]), cluster_id
                )
                for member in relevant_members
                for cluster_id in clusters
            ):
                names.append(_relationship_presentation_name(relationship))
    return list(dict.fromkeys(names))


def _relationship_presentation_name(relationship: Mapping[str, Any]) -> str:
    source = relationship.get("source") or {}
    source_name = str(source.get("name") or "Matter control")
    targets = relationship.get("targets") or {}
    target_name = str(targets.get("name") or "Matter target")
    return f"{source_name} → {target_name}"


async def async_prepare_unicast(
    hass: HomeAssistant,
    *,
    source_node_id: int,
    source_endpoint_id: int,
    target_node_id: int,
    target_endpoint_id: int,
    clusters: list[int],
) -> dict[str, Any]:
    """Validate one direct relationship and return a short-lived write plan."""
    source, target, selected_clusters = await _validate_request(
        hass,
        source_node_id,
        source_endpoint_id,
        target_node_id,
        target_endpoint_id,
        clusters,
    )
    client = _require_client(hass)
    bindings = await _read_bindings(client, source_node_id, source_endpoint_id)
    for cluster_id in selected_clusters:
        if _binding_exists(
            bindings,
            node_id=target_node_id,
            endpoint_id=target_endpoint_id,
            cluster_id=cluster_id,
        ):
            raise StudioWriteError("This control relationship already exists.")

    acl_entries = await _read_acl(client, target_node_id)
    if not _has_admin_acl(acl_entries):
        raise StudioWriteError(
            "The target ACL cannot be safely updated because no administrator entry was found."
        )

    required_acl_clusters = _required_case_acl_clusters(
        acl_entries, source_node_id, target_endpoint_id, selected_clusters
    )
    acl_capacity = await _read_acl_capacity(client, target_node_id, acl_entries)
    acl_entries_to_add = _new_case_acl_entries(
        source_node_id, target_endpoint_id, required_acl_clusters, acl_capacity
    )
    _require_acl_capacity(acl_capacity, len(acl_entries_to_add))
    acl_needed = bool(required_acl_clusters)
    plan_id = secrets.token_urlsafe(24)
    plan = {
        "plan_id": plan_id,
        "created_at": time.monotonic(),
        "source": source,
        "target": target,
        "clusters": selected_clusters,
        "bindings_before": bindings,
        "acl_needed": acl_needed,
        "acl_capacity": acl_capacity,
    }
    _pending_plans(hass)[plan_id] = plan
    _purge_expired_plans(hass)
    return {
        "plan_id": plan_id,
        "expires_in_seconds": _PLAN_TTL_SECONDS,
        "route": "direct",
        "source": source,
        "target": target,
        "clusters": selected_clusters,
        "existing_binding_count": len(bindings),
        "acl": "will_add" if acl_needed else "already_granted",
        "acl_capacity": _public_acl_capacity(
            acl_capacity, entries_to_add=len(acl_entries_to_add)
        ),
        "steps": [
            "Read the latest Binding list and target ACL capacity.",
            *(
                ["Grant the source device operate access on the target."]
                if acl_needed
                else []
            ),
            "Write the source Binding Cluster list.",
            "Read the Binding Cluster back from the source device.",
        ],
    }


async def async_apply_unicast(hass: HomeAssistant, *, plan_id: str) -> dict[str, Any]:
    """Apply one reviewed plan and return only verified transaction state."""
    plan = _take_plan(hass, plan_id)
    source = plan["source"]
    target = plan["target"]
    source_key = (int(source["node_id"]), int(source["endpoint_id"]))
    lock = _source_locks(hass).setdefault(source_key, asyncio.Lock())
    async with lock:
        client = _require_client(hass)
        source_node_id, source_endpoint_id = source_key
        target_node_id = int(target["node_id"])
        target_endpoint_id = int(target["endpoint_id"])
        clusters = [int(cluster) for cluster in plan["clusters"]]

        current_bindings = await _read_bindings(
            client, source_node_id, source_endpoint_id
        )
        if _binding_signature(current_bindings) != _binding_signature(
            plan["bindings_before"]
        ):
            raise StudioWriteError(
                "The source Binding list changed after review. Refresh and review a new plan."
            )

        acl_added = False
        current_acl = await _read_acl(client, target_node_id)
        required_acl_clusters = [
            cluster_id
            for cluster_id in clusters
            if not _acl_grants_case(
                current_acl, source_node_id, target_endpoint_id, cluster_id
            )
        ]
        if required_acl_clusters:
            if not _has_admin_acl(current_acl):
                raise StudioWriteError(
                    "The target ACL changed and is no longer safe to update. Review a new plan."
                )
            acl_capacity = await _read_acl_capacity(client, target_node_id, current_acl)
            acl_entries_to_add = _new_case_acl_entries(
                source_node_id,
                target_endpoint_id,
                required_acl_clusters,
                acl_capacity,
            )
            _require_acl_capacity(acl_capacity, len(acl_entries_to_add))
            acl_payload = list(current_acl)
            acl_payload.extend(acl_entries_to_add)
            await _write_acl(client, target_node_id, acl_payload)
            verified_acl = await _verify_acl(
                client,
                target_node_id,
                source_node_id,
                target_endpoint_id,
                required_acl_clusters,
            )
            if not verified_acl:
                raise StudioWriteError(
                    "The target ACL write could not be verified; no Binding was written."
                )
            acl_added = True

        new_bindings = [*current_bindings]
        new_bindings.extend(
            {
                "target_node_id": target_node_id,
                "target_endpoint_id": target_endpoint_id,
                "target_group_id": None,
                "cluster_id": cluster_id,
            }
            for cluster_id in clusters
        )
        try:
            verified = await _write_and_verify_bindings(
                client,
                source_node_id,
                source_endpoint_id,
                new_bindings,
                target_node_id,
                target_endpoint_id,
                clusters,
            )
        except Exception as err:  # noqa: BLE001 - user-safe transaction result below
            _LOGGER.warning("Studio Binding write failed: %s", err)
            return _repair_needed_result(acl_added)
        if not verified:
            return _repair_needed_result(acl_added)
        return {
            "success": True,
            "verified": True,
            "message": "Native unicast binding was written and read back from the source device.",
            "source": source,
            "target": target,
            "clusters": clusters,
        }


async def async_prepare_groupcast(
    hass: HomeAssistant,
    *,
    source_node_id: int,
    source_endpoint_id: int,
    targets: list[dict[str, int]],
    clusters: list[int],
) -> dict[str, Any]:
    """Create a review-only plan for one automatic multi-target groupcast.

    The group id, key-set id and epoch key stay server-side in the short-lived
    plan.  The UI receives only the user-meaningful route, capability coverage,
    and the exact classes of device changes that will occur.
    """
    source, members, selected_clusters = await _validate_groupcast_request(
        hass,
        source_node_id=source_node_id,
        source_endpoint_id=source_endpoint_id,
        targets=targets,
        clusters=clusters,
    )
    client = _require_client(hass)
    source_bindings = await _read_bindings(client, source_node_id, source_endpoint_id)
    capacity = await _preflight_group_capacity(
        client,
        source_node_id=source_node_id,
        member_node_ids=[int(member["node_id"]) for member in members],
    )
    used_group_ids = {
        group_id
        for state in capacity.values()
        for group_id in state["group_ids"]
    }
    used_key_set_ids = {
        key_set_id
        for state in capacity.values()
        for key_set_id in state["key_set_ids"]
    }
    store = get_managed_group_store(hass)
    await store.async_load()
    used_group_ids.update(group.group_id for group in store.list_groups())
    used_key_set_ids.update(group.key_set_id for group in store.list_groups())
    group_id = _allocate_group_id(used_group_ids)
    key_set_id = _allocate_key_set_id(used_key_set_ids)
    relationship_name = _automatic_group_name(source)
    group = ManagedGroup(
        group_id=group_id,
        key_set_id=key_set_id,
        epoch_key=new_epoch_key(),
        name=relationship_name,
        source_node_id=source_node_id,
        source_endpoint_id=source_endpoint_id,
        members=[
            {
                "node_id": int(member["node_id"]),
                "endpoint_id": int(member["endpoint_id"]),
            }
            for member in members
        ],
        clusters=selected_clusters,
        status="pending",
    )
    acl_capacity = await _preflight_group_acl_capacity(
        client, members=members, group_id=group.group_id, clusters=selected_clusters
    )
    coverage = _group_capability_coverage(source, members, selected_clusters)
    replaced_direct_entries = _matching_direct_entries(
        source_bindings, members, selected_clusters
    )
    plan_id = secrets.token_urlsafe(24)
    _pending_plans(hass)[plan_id] = {
        "kind": "groupcast",
        "plan_id": plan_id,
        "created_at": time.monotonic(),
        "source": source,
        "members": members,
        "clusters": selected_clusters,
        "bindings_before": source_bindings,
        "capacity": capacity,
        "group": group,
        "replaced_direct_entries": replaced_direct_entries,
        "acl_capacity": acl_capacity,
    }
    _purge_expired_plans(hass)
    return {
        "plan_id": plan_id,
        "expires_in_seconds": _PLAN_TTL_SECONDS,
        "route": "native_group",
        "source": source,
        "targets": members,
        "clusters": selected_clusters,
        "coverage": coverage,
        "replaces_direct_binding": bool(replaced_direct_entries),
        "acl_capacity": [
            _public_acl_capacity(item["capacity"], entries_to_add=item["entries_to_add"])
            | {"target": item["target"]}
            for item in acl_capacity
        ],
        "steps": [
            "Read the latest Binding, ACL, group capacity, and group key maps.",
            "Provision one new Group Key on the control source and each target device.",
            "Add each selected target endpoint to the automatic native group.",
            "Grant group operate access only to member endpoints that support each selected capability.",
            "Replace matching direct bindings only after all group provisioning succeeds.",
            "Read the source Binding Cluster and target group configuration back from the devices.",
        ],
    }


async def async_apply_groupcast(hass: HomeAssistant, *, plan_id: str) -> dict[str, Any]:
    """Provision and verify one reviewed automatic groupcast relationship."""
    plan = _take_plan(hass, plan_id, expected_kind="groupcast")
    source = plan["source"]
    source_key = (int(source["node_id"]), int(source["endpoint_id"]))
    lock = _source_locks(hass).setdefault(source_key, asyncio.Lock())
    async with lock:
        client = _require_client(hass)
        members = list(plan["members"])
        clusters = [int(cluster) for cluster in plan["clusters"]]
        group: ManagedGroup = plan["group"]
        source_bindings = await _read_bindings(client, *source_key)
        if _binding_signature(source_bindings) != _binding_signature(
            plan["bindings_before"]
        ):
            raise StudioWriteError(
                "The source Binding list changed after review. Refresh and review a new plan."
            )

        participant_node_ids = sorted(
            {source_key[0], *(int(member["node_id"]) for member in members)}
        )
        current_capacity = await _preflight_group_capacity(
            client,
            source_node_id=source_key[0],
            member_node_ids=[int(member["node_id"]) for member in members],
        )
        if any(group.group_id in state["group_ids"] for state in current_capacity.values()):
            raise StudioWriteError(
                "The automatic group id was claimed after review. Refresh and review a new plan."
            )
        if any(group.key_set_id in state["key_set_ids"] for state in current_capacity.values()):
            raise StudioWriteError(
                "The automatic Group Key slot was claimed after review. Refresh and review a new plan."
            )
        await _preflight_group_acl_capacity(
            client, members=members, group_id=group.group_id, clusters=clusters
        )

        store = get_managed_group_store(hass)
        await store.async_load()
        if store.get(group.group_id) is not None:
            raise StudioWriteError(
                "This automatic group is already being maintained. Refresh and review a new plan."
            )
        # Persist before device writes: a partial key/membership transaction must
        # be repairable later, because epoch key material is not readable back
        # from Matter devices.
        await store.async_put(group)

        try:
            for node_id in participant_node_ids:
                await _provision_group_key(
                    client,
                    node_id=node_id,
                    group_id=group.group_id,
                    key_set_id=group.key_set_id,
                    epoch_key=group.epoch_key,
                )

            for member in members:
                await _add_group_member(
                    client,
                    node_id=int(member["node_id"]),
                    endpoint_id=int(member["endpoint_id"]),
                    group_id=group.group_id,
                    name=group.name,
                )

            for member in members:
                member_supported = set(member.get("server_capabilities", []))
                member_clusters = [
                    cluster_id for cluster_id in clusters if cluster_id in member_supported
                ]
                if member_clusters:
                    await _ensure_group_acl(
                        client,
                        node_id=int(member["node_id"]),
                        endpoint_id=int(member["endpoint_id"]),
                        group_id=group.group_id,
                        clusters=member_clusters,
                    )

            next_bindings = _groupcast_binding_replacement(
                source_bindings,
                members=members,
                clusters=clusters,
                group_id=group.group_id,
            )
            binding_verified = await _write_and_verify_group_bindings(
                client,
                source_node_id=source_key[0],
                source_endpoint_id=source_key[1],
                bindings=next_bindings,
                group_id=group.group_id,
                clusters=clusters,
            )
            memberships_verified = await _verify_group_memberships(
                client, members=members, group_id=group.group_id
            )
            if not binding_verified or not memberships_verified:
                await store.async_set_status(group.group_id, "repair_needed")
                return {
                    "success": False,
                    "verified": False,
                    "repair_needed": True,
                    "message": "The automatic group was provisioned but could not be fully verified. No unverified relationship is shown as ready.",
                }
        except Exception as err:  # noqa: BLE001 - retain private repair state
            _LOGGER.warning("Studio groupcast transaction needs repair: %s", err)
            await store.async_set_status(group.group_id, "repair_needed")
            return {
                "success": False,
                "verified": False,
                "repair_needed": True,
                "message": "The automatic group transaction stopped before Binding verification. Review the recorded group before retrying.",
            }

        await store.async_set_status(group.group_id, "active")
        return {
            "success": True,
            "verified": True,
            "message": "Native groupcast binding was provisioned and read back from the source device.",
            "source": source,
            "targets": members,
            "clusters": clusters,
        }


async def async_prepare_remove_binding(
    hass: HomeAssistant,
    *,
    source_node_id: int,
    source_endpoint_id: int,
    target_kind: str,
    target_node_id: int | None,
    target_endpoint_id: int | None,
    target_group_id: int | None,
) -> dict[str, Any]:
    """Prepare the deletion of exactly one displayed Binding relationship.

    A relationship can contain several cluster-specific Binding entries.  The
    reviewed plan removes only entries with the same target identity, leaving
    unrelated source bindings and every target ACL untouched.
    """
    snapshot = await async_get_snapshot(hass)
    source = _find_endpoint(
        snapshot.get("devices", []), source_node_id, source_endpoint_id
    )
    if source is None or not source.get("can_bind"):
        raise StudioWriteError("The Binding source is no longer available. Refresh first.")

    if target_kind == "endpoint":
        if target_node_id is None or target_endpoint_id is None:
            raise StudioWriteError("The direct Binding target is incomplete. Refresh first.")
    elif target_kind == "group":
        if target_group_id is None:
            raise StudioWriteError("The native group target is incomplete. Refresh first.")
    else:
        raise StudioWriteError("The Binding target type is not supported.")

    client = _require_client(hass)
    bindings = await _read_bindings(client, source_node_id, source_endpoint_id)
    removed_entries = [
        entry
        for entry in bindings
        if _binding_matches_target(
            entry,
            target_kind=target_kind,
            target_node_id=target_node_id,
            target_endpoint_id=target_endpoint_id,
            target_group_id=target_group_id,
        )
    ]
    if not removed_entries:
        raise StudioWriteError(
            "This Binding relationship changed or no longer exists. Refresh and review again."
        )

    next_bindings = [entry for entry in bindings if entry not in removed_entries]
    plan_id = secrets.token_urlsafe(24)
    _pending_plans(hass)[plan_id] = {
        "kind": "remove_binding",
        "plan_id": plan_id,
        "created_at": time.monotonic(),
        "source": source,
        "target_kind": target_kind,
        "target_node_id": target_node_id,
        "target_endpoint_id": target_endpoint_id,
        "target_group_id": target_group_id,
        "bindings_before": bindings,
        "bindings_after": next_bindings,
        "removed_entries": removed_entries,
    }
    _purge_expired_plans(hass)
    return {
        "plan_id": plan_id,
        "expires_in_seconds": _PLAN_TTL_SECONDS,
        "route": "native_group" if target_kind == "group" else "direct",
        "source": source,
        "clusters": sorted({int(entry["cluster_id"]) for entry in removed_entries}),
        "removed_entry_count": len(removed_entries),
        "keeps_native_group": target_kind == "group",
        "steps": [
            "Read the latest source Binding Cluster list.",
            "Remove only the entries that match this displayed relationship.",
            *(
                ["Keep the native group, Group Key, membership, and ACLs unchanged."]
                if target_kind == "group"
                else ["Keep target ACLs unchanged."]
            ),
            "Write the complete remaining Binding Cluster list.",
            "Read the Binding Cluster back from the source device.",
        ],
    }


async def async_apply_remove_binding(
    hass: HomeAssistant, *, plan_id: str
) -> dict[str, Any]:
    """Delete one reviewed relationship and verify the complete source table."""
    plan = _take_plan(hass, plan_id, expected_kind="remove_binding")
    source = plan["source"]
    source_key = (int(source["node_id"]), int(source["endpoint_id"]))
    lock = _source_locks(hass).setdefault(source_key, asyncio.Lock())
    async with lock:
        client = _require_client(hass)
        current_bindings = await _read_bindings(client, *source_key)
        if _binding_signature(current_bindings) != _binding_signature(
            plan["bindings_before"]
        ):
            raise StudioWriteError(
                "The source Binding list changed after review. Refresh and review a new plan."
            )

        try:
            verified = await _write_and_verify_binding_table(
                client,
                source_node_id=source_key[0],
                source_endpoint_id=source_key[1],
                bindings=list(plan["bindings_after"]),
            )
        except Exception as err:  # noqa: BLE001 - report uncertain device state safely
            _LOGGER.warning("Studio Binding removal could not be verified: %s", err)
            verified = False
        if not verified:
            return {
                "success": False,
                "verified": False,
                "repair_needed": True,
                "message": "The Binding removal could not be verified. Refresh before retrying or changing the group.",
            }

        route = "native group" if plan["target_kind"] == "group" else "direct"
        return {
            "success": True,
            "verified": True,
            "message": f"The {route} Binding was removed and the source Binding Cluster was read back.",
            "source": source,
            "clusters": sorted(
                {int(entry["cluster_id"]) for entry in plan["removed_entries"]}
            ),
            "keeps_native_group": plan["target_kind"] == "group",
        }


async def _validate_request(
    hass: HomeAssistant,
    source_node_id: int,
    source_endpoint_id: int,
    target_node_id: int,
    target_endpoint_id: int,
    clusters: list[int],
) -> tuple[dict[str, Any], dict[str, Any], list[int]]:
    if (source_node_id, source_endpoint_id) == (target_node_id, target_endpoint_id):
        raise StudioWriteError("A source endpoint cannot bind to itself.")
    snapshot = await async_get_snapshot(hass)
    devices = snapshot.get("devices", [])
    source = _find_endpoint(devices, source_node_id, source_endpoint_id)
    target = _find_endpoint(devices, target_node_id, target_endpoint_id)
    if source is None or not source.get("can_bind"):
        raise StudioWriteError("Choose a valid Matter control source.")
    if target is None or not target.get("can_be_target"):
        raise StudioWriteError("Choose a valid Matter output target.")
    supported = set(source.get("client_capabilities", [])) & set(
        target.get("server_capabilities", [])
    )
    selected = sorted({int(cluster) for cluster in clusters})
    if not selected:
        raise StudioWriteError("Choose at least one supported capability.")
    if not set(selected).issubset(supported):
        raise StudioWriteError(
            "One or more selected capabilities are not supported by both endpoints."
        )
    return source, target, selected


async def _validate_groupcast_request(
    hass: HomeAssistant,
    *,
    source_node_id: int,
    source_endpoint_id: int,
    targets: list[dict[str, int]],
    clusters: list[int],
) -> tuple[dict[str, Any], list[dict[str, Any]], list[int]]:
    """Validate a relationship-first multi-target request from the panel."""
    snapshot = await async_get_snapshot(hass)
    devices = snapshot.get("devices", [])
    source = _find_endpoint(devices, source_node_id, source_endpoint_id)
    if source is None or not source.get("can_bind"):
        raise StudioWriteError("Choose a valid Matter control source.")
    normalized_keys: set[tuple[int, int]] = set()
    members: list[dict[str, Any]] = []
    for target in targets:
        try:
            key = (int(target["node_id"]), int(target["endpoint_id"]))
        except (KeyError, TypeError, ValueError) as err:
            raise StudioWriteError("Choose valid Matter output targets.") from err
        if key == (source_node_id, source_endpoint_id):
            raise StudioWriteError("A source endpoint cannot bind to itself.")
        if key in normalized_keys:
            continue
        endpoint = _find_endpoint(devices, *key)
        if endpoint is None or not endpoint.get("can_be_target"):
            raise StudioWriteError("Choose valid Matter output targets.")
        normalized_keys.add(key)
        members.append(endpoint)
    if len(members) < 2:
        raise StudioWriteError("Choose at least two output targets for an automatic native group.")

    source_capabilities = {int(cluster) for cluster in source.get("client_capabilities", [])}
    selected = sorted({int(cluster) for cluster in clusters})
    if not selected:
        raise StudioWriteError("Choose at least one supported capability.")
    available = {
        cluster
        for member in members
        for cluster in member.get("server_capabilities", [])
        if int(cluster) in source_capabilities
    }
    if not set(selected).issubset(available):
        raise StudioWriteError(
            "One or more selected capabilities are not supported by the source and any selected target."
        )
    return source, members, selected


def _group_capability_coverage(
    source: Mapping[str, Any],
    members: list[Mapping[str, Any]],
    selected_clusters: list[int],
) -> list[dict[str, Any]]:
    """Describe complete/partial support without hiding a selectable cluster."""
    source_clusters = {int(cluster) for cluster in source.get("client_capabilities", [])}
    coverage: list[dict[str, Any]] = []
    for cluster_id in selected_clusters:
        supported = [
            member
            for member in members
            if cluster_id in source_clusters
            and cluster_id in {int(value) for value in member.get("server_capabilities", [])}
        ]
        unsupported = [member for member in members if member not in supported]
        coverage.append(
            {
                "cluster_id": cluster_id,
                "supported_members": len(supported),
                "total_members": len(members),
                "unsupported_members": [member["name"] for member in unsupported],
            }
        )
    return coverage


def _matching_direct_entries(
    bindings: list[dict[str, int | None]],
    members: list[Mapping[str, Any]],
    clusters: list[int],
) -> list[dict[str, int | None]]:
    selected_targets = {
        (int(member["node_id"]), int(member["endpoint_id"])) for member in members
    }
    selected_clusters = set(clusters)
    return [
        entry
        for entry in bindings
        if entry.get("target_group_id") is None
        and (entry.get("target_node_id"), entry.get("target_endpoint_id"))
        in selected_targets
        and entry.get("cluster_id") in selected_clusters
    ]


def _groupcast_binding_replacement(
    bindings: list[dict[str, int | None]],
    *,
    members: list[Mapping[str, Any]],
    clusters: list[int],
    group_id: int,
) -> list[dict[str, int | None]]:
    """Convert matching direct routes only after group provisioning succeeds."""
    replaced = {
        (
            entry.get("target_node_id"),
            entry.get("target_endpoint_id"),
            entry.get("cluster_id"),
        )
        for entry in _matching_direct_entries(bindings, members, clusters)
    }
    next_bindings = [
        entry
        for entry in bindings
        if (
            entry.get("target_node_id"),
            entry.get("target_endpoint_id"),
            entry.get("cluster_id"),
        )
        not in replaced
    ]
    next_bindings.extend(
        {
            "target_node_id": None,
            "target_endpoint_id": None,
            "target_group_id": group_id,
            "cluster_id": cluster_id,
        }
        for cluster_id in clusters
    )
    return next_bindings


def _automatic_group_name(source: Mapping[str, Any]) -> str:
    area = str(source.get("area_name") or "").strip()
    name = str(source.get("name") or "Control").strip()
    return f"{area} {name} control set".strip()


async def _preflight_group_acl_capacity(
    client: Any,
    *,
    members: list[Mapping[str, Any]],
    group_id: int,
    clusters: list[int],
) -> list[dict[str, Any]]:
    """Check ACL entry capacity before any Group Key or membership write.

    Group provisioning previously discovered a full member ACL only after it
    had written Group Key and membership state.  Capacity is now validated in
    the review phase and immediately before the transaction begins.
    """
    results: list[dict[str, Any]] = []
    for member in members:
        node_id = int(member["node_id"])
        endpoint_id = int(member["endpoint_id"])
        supported = {int(cluster) for cluster in member.get("server_capabilities", [])}
        selected = [cluster for cluster in clusters if cluster in supported]
        entries = await _read_acl(client, node_id)
        required = _required_group_acl_clusters(entries, group_id, endpoint_id, selected)
        capacity = await _read_acl_capacity(client, node_id, entries)
        entries_to_add = _new_group_acl_entries(
            group_id, endpoint_id, required, capacity
        )
        _require_acl_capacity(capacity, len(entries_to_add))
        results.append(
            {
                "target": dict(member),
                "capacity": capacity,
                "entries_to_add": len(entries_to_add),
            }
        )
    return results


async def _preflight_group_capacity(
    client: Any,
    *,
    source_node_id: int,
    member_node_ids: list[int],
) -> dict[int, dict[str, Any]]:
    """Fail closed unless every device has the capacity it actually needs.

    The control source needs a Group Key map entry in order to send a
    groupcast.  Only selected member nodes need a Group Table slot: an
    ``AddGroup`` command is never sent to the source merely because it is the
    sender.  A node can be both source and member through different endpoints,
    in which case it needs both resources.
    """
    states: dict[int, dict[str, Any]] = {}
    member_node_id_set = {int(node_id) for node_id in member_node_ids}
    node_ids = sorted({int(source_node_id), *member_node_id_set})
    for node_id in node_ids:
        group_map_value = await _read_attribute(
            client, node_id, f"0/{CLUSTER_GROUP_KEY_MANAGEMENT}/{ATTR_GROUP_KEY_MAP}"
        )
        group_table_value = await _read_attribute(
            client, node_id, f"0/{CLUSTER_GROUP_KEY_MANAGEMENT}/{ATTR_GROUP_TABLE}"
        )
        max_groups_value = await _read_attribute(
            client,
            node_id,
            f"0/{CLUSTER_GROUP_KEY_MANAGEMENT}/2",
        )
        max_keys_value = await _read_attribute(
            client,
            node_id,
            f"0/{CLUSTER_GROUP_KEY_MANAGEMENT}/3",
        )
        group_map = _parse_group_key_map(group_map_value)
        group_table = _struct_entries(group_table_value)
        max_groups = _optional_int(max_groups_value)
        max_keys = _optional_int(max_keys_value)
        requires_group_slot = node_id in member_node_id_set
        if max_keys is None or (requires_group_slot and max_groups is None):
            raise StudioWriteError(
                "A participating device did not report Group and Group Key capacity."
            )
        if len(group_map) >= max_keys or (
            requires_group_slot and len(group_table) >= max_groups
        ):
            raise StudioWriteError(
                "A participating device does not have one free native Group and Group Key slot."
            )
        group_ids = {entry["group_id"] for entry in group_map}
        group_ids.update(_group_ids_from_group_table(group_table))
        states[node_id] = {
            "group_map": group_map,
            "group_table": group_table,
            "group_ids": group_ids,
            "key_set_ids": {entry["key_set_id"] for entry in group_map},
            "max_groups": max_groups,
            "max_keys": max_keys,
            "requires_group_slot": requires_group_slot,
        }
    return states


def _allocate_group_id(used: set[int]) -> int:
    for group_id in range(STUDIO_GROUP_ID_START, STUDIO_GROUP_ID_END + 1):
        if group_id not in used:
            return group_id
    raise StudioWriteError("No automatic native Group ID is available on this fabric.")


def _allocate_key_set_id(used: set[int]) -> int:
    for key_set_id in range(STUDIO_KEY_SET_ID_START, 0x10000):
        if key_set_id not in used:
            return key_set_id
    raise StudioWriteError("No automatic Group Key set ID is available on this fabric.")


async def _read_attribute(client: Any, node_id: int, attribute_path: str) -> Any:
    value = await client.read_attribute(node_id=node_id, attribute_path=attribute_path)
    if isinstance(value, Mapping):
        value = value.get(attribute_path, value)
    return _unwrap_value(value)


def _struct_entries(value: Any) -> list[Any]:
    value = _unwrap_value(value)
    if _is_sequence_struct(value):
        return list(value)
    if isinstance(value, Mapping):
        if _field(value, ("groupId", "GroupID", "group_id", 0, 1)) is not None:
            return [value]
        return [item for child in value.values() for item in _struct_entries(child)]
    return []


def _parse_group_key_map(value: Any) -> list[dict[str, int]]:
    entries: list[dict[str, int]] = []
    for entry in _struct_entries(value):
        group_id = _optional_int(
            _field(entry, ("groupId", "GroupID", "group_id", 1, 0))
        )
        key_set_id = _optional_int(
            _field(entry, ("groupKeySetID", "group_key_set_id", "keySetId", 2, 1))
        )
        if group_id is not None and key_set_id is not None:
            entries.append({"group_id": group_id, "key_set_id": key_set_id})
    return entries


def _group_ids_from_group_table(entries: list[Any]) -> set[int]:
    return {
        group_id
        for entry in entries
        if (
            group_id := _optional_int(
                _field(entry, ("groupId", "GroupID", "group_id", "group", 0, 1))
            )
        )
        is not None
    }


async def _provision_group_key(
    client: Any,
    *,
    node_id: int,
    group_id: int,
    key_set_id: int,
    epoch_key: str,
) -> None:
    """Write a group key set and fabric-scoped GroupId -> key-set mapping."""
    try:
        key_bytes = bytes.fromhex(epoch_key)
    except ValueError as err:  # pragma: no cover - generated locally, defensive only
        raise StudioWriteError("The generated Group Key was invalid.") from err
    result = await _send_device_command(
        client,
        node_id=node_id,
        endpoint_id=0,
        command=_key_set_write_command(key_set_id, key_bytes),
    )
    if _write_result_failed(result):
        raise StudioWriteError("A participating device rejected the Group Key write.")

    path = f"0/{CLUSTER_GROUP_KEY_MANAGEMENT}/{ATTR_GROUP_KEY_MAP}"
    existing = _parse_group_key_map(await _read_attribute(client, node_id, path))
    entries = [
        {
            "groupId": entry["group_id"],
            "groupKeySetID": entry["key_set_id"],
        }
        for entry in existing
        if entry["group_id"] != group_id
    ]
    entries.append({"groupId": group_id, "groupKeySetID": key_set_id})
    if not await _write_and_verify_group_key_map(
        client,
        node_id=node_id,
        entries=entries,
        group_id=group_id,
        key_set_id=key_set_id,
    ):
        raise StudioWriteError("A participating device did not confirm its Group Key mapping.")


def _key_set_write_command(key_set_id: int, epoch_key: bytes) -> Any:
    """Build the CHIP command lazily so normal discovery never imports CHIP."""
    from chip.clusters import Objects as clusters
    from chip.clusters.Types import NullValue

    key_set = clusters.GroupKeyManagement.Structs.GroupKeySetStruct(
        groupKeySetID=key_set_id,
        groupKeySecurityPolicy=0,
        epochKey0=epoch_key,
        epochStartTime0=1,
        epochKey1=NullValue,
        epochStartTime1=NullValue,
        epochKey2=NullValue,
        epochStartTime2=NullValue,
    )
    return clusters.GroupKeyManagement.Commands.KeySetWrite(groupKeySet=key_set)


async def _write_and_verify_group_key_map(
    client: Any,
    *,
    node_id: int,
    entries: list[dict[str, int]],
    group_id: int,
    key_set_id: int,
) -> bool:
    path = f"0/{CLUSTER_GROUP_KEY_MANAGEMENT}/{ATTR_GROUP_KEY_MAP}"
    fabric_index = await _read_fabric_index(client, node_id)
    for tag_keys in (False, True):
        payload = [
            _encode_fabric_struct(
                entry, _GROUP_KEY_MAP_TAGS, fabric_index, tag_keys
            )
            for entry in entries
        ]
        result = await client.write_attribute(
            node_id=node_id, attribute_path=path, value=payload
        )
        if _write_result_failed(result):
            continue
        for _ in range(_VERIFY_ATTEMPTS):
            readback = _parse_group_key_map(await _read_attribute(client, node_id, path))
            if any(
                entry["group_id"] == group_id
                and entry["key_set_id"] == key_set_id
                for entry in readback
            ):
                return True
            await asyncio.sleep(_VERIFY_DELAY_SECONDS)
    return False


async def _remove_group_key_mapping(
    client: Any, *, node_id: int, group_id: int, key_set_id: int
) -> None:
    """Remove exactly this Studio group's GroupId-to-KeySet mapping."""
    path = f"0/{CLUSTER_GROUP_KEY_MANAGEMENT}/{ATTR_GROUP_KEY_MAP}"
    existing = _parse_group_key_map(await _read_attribute(client, node_id, path))
    matches = [entry for entry in existing if entry["group_id"] == group_id]
    if not matches:
        return
    if any(entry["key_set_id"] != key_set_id for entry in matches):
        raise StudioWriteError(
            "The managed Group Key mapping changed and cannot be safely removed."
        )
    remaining = [entry for entry in existing if entry["group_id"] != group_id]
    fabric_index = await _read_fabric_index(client, node_id)
    for tag_keys in (False, True):
        payload = [
            _encode_fabric_struct(entry, _GROUP_KEY_MAP_TAGS, fabric_index, tag_keys)
            for entry in remaining
        ]
        result = await client.write_attribute(
            node_id=node_id, attribute_path=path, value=payload
        )
        if _write_result_failed(result):
            continue
        for _ in range(_VERIFY_ATTEMPTS):
            readback = _parse_group_key_map(await _read_attribute(client, node_id, path))
            if not any(entry["group_id"] == group_id for entry in readback):
                return
            await asyncio.sleep(_VERIFY_DELAY_SECONDS)
    raise StudioWriteError("A participant did not confirm its Group Key mapping removal.")


async def _remove_group_key_set(
    client: Any, *, node_id: int, key_set_id: int
) -> None:
    """Request removal of one private key set after its mapping is gone.

    Epoch key material is deliberately unreadable.  The successful command
    result is therefore the available device acknowledgement; a non-success
    result remains repair-needed instead of being interpreted as absent.
    """
    from chip.clusters import Objects as clusters

    result = await _send_device_command(
        client,
        node_id=node_id,
        endpoint_id=0,
        command=clusters.GroupKeyManagement.Commands.KeySetRemove(
            groupKeySetID=key_set_id
        ),
    )
    if _write_result_failed(result):
        raise StudioWriteError("A participant rejected Group Key Set removal.")


def _encode_fabric_struct(
    entry: Mapping[str, Any],
    tags: Mapping[str, int],
    fabric_index: int,
    tag_keys: bool,
) -> dict[str, Any]:
    payload = {
        (str(tags[name]) if tag_keys else name): value
        for name, value in entry.items()
        if value is not None
    }
    payload[str(_FABRIC_INDEX_TAG) if tag_keys else "fabricIndex"] = fabric_index
    return payload


async def _send_device_command(
    client: Any, *, node_id: int, endpoint_id: int, command: Any
) -> Any:
    send_command = getattr(client, "send_device_command", None)
    if not callable(send_command):
        raise StudioWriteError(
            "This Home Assistant Matter client cannot send native Group commands."
        )
    return await send_command(
        node_id=node_id, endpoint_id=endpoint_id, command=command
    )


async def _add_group_member(
    client: Any, *, node_id: int, endpoint_id: int, group_id: int, name: str
) -> None:
    from chip.clusters import Objects as clusters

    result = await _send_device_command(
        client,
        node_id=node_id,
        endpoint_id=endpoint_id,
        command=clusters.Groups.Commands.AddGroup(
            groupID=group_id, groupName=name[:_GROUP_NAME_MAX_LENGTH]
        ),
    )
    if _write_result_failed(result):
        raise StudioWriteError("A selected target rejected automatic group membership.")
    if not await _verify_group_membership(
        client, node_id=node_id, endpoint_id=endpoint_id, group_id=group_id
    ):
        raise StudioWriteError("A selected target did not confirm automatic group membership.")


async def _remove_group_member_if_present(
    client: Any, *, node_id: int, endpoint_id: int, group_id: int
) -> None:
    """Remove one member idempotently, then read the GroupTable back."""
    path = f"0/{CLUSTER_GROUP_KEY_MANAGEMENT}/{ATTR_GROUP_TABLE}"
    existing = _struct_entries(await _read_attribute(client, node_id, path))
    if not _group_table_has_member(existing, group_id=group_id, endpoint_id=endpoint_id):
        return
    from chip.clusters import Objects as clusters

    result = await _send_device_command(
        client,
        node_id=node_id,
        endpoint_id=endpoint_id,
        command=clusters.Groups.Commands.RemoveGroup(groupID=group_id),
    )
    if _write_result_failed(result):
        raise StudioWriteError("A managed group member rejected group removal.")
    for _ in range(_VERIFY_ATTEMPTS):
        readback = _struct_entries(await _read_attribute(client, node_id, path))
        if not _group_table_has_member(readback, group_id=group_id, endpoint_id=endpoint_id):
            return
        await asyncio.sleep(_VERIFY_DELAY_SECONDS)
    raise StudioWriteError("A managed group member did not confirm group removal.")


async def _verify_group_memberships(
    client: Any, *, members: list[Mapping[str, Any]], group_id: int
) -> bool:
    return all(
        await _verify_group_membership(
            client,
            node_id=int(member["node_id"]),
            endpoint_id=int(member["endpoint_id"]),
            group_id=group_id,
        )
        for member in members
    )


async def _verify_group_membership(
    client: Any, *, node_id: int, endpoint_id: int, group_id: int
) -> bool:
    # GroupTable lives on the root Group Key Management cluster.  Its
    # GroupInfoMapStruct records the endpoints populated through Groups.AddGroup.
    path = f"0/{CLUSTER_GROUP_KEY_MANAGEMENT}/{ATTR_GROUP_TABLE}"
    for _ in range(_VERIFY_ATTEMPTS):
        entries = _struct_entries(await _read_attribute(client, node_id, path))
        if _group_table_has_member(entries, group_id=group_id, endpoint_id=endpoint_id):
            return True
        await asyncio.sleep(_VERIFY_DELAY_SECONDS)
    return False


def _group_table_has_member(
    entries: list[Any], *, group_id: int, endpoint_id: int
) -> bool:
    """Return whether a root GroupTable confirms this endpoint's membership."""
    for entry in entries:
        candidate_group_id = _optional_int(
            _field(entry, ("groupId", "GroupID", "group_id", "group", 0, 1))
        )
        if candidate_group_id != group_id:
            continue
        endpoints = _group_info_endpoints(entry)
        if endpoint_id in endpoints:
            return True
    return False


def _group_info_endpoints(entry: Any) -> set[int]:
    """Read GroupInfoMapStruct.Endpoints across Matter Server representations."""
    value = _field(entry, ("endpoints", "Endpoints", "endpointList", "EndpointList"))
    if value is None:
        if isinstance(entry, Mapping):
            value = _field(entry, (2,))
        elif _is_sequence_struct(entry) and len(entry) > 1:
            value = entry[1]
    value = _unwrap_value(value)
    if not _is_sequence_struct(value):
        return set()
    return {parsed for item in value if (parsed := _optional_int(item)) is not None}


async def _ensure_group_acl(
    client: Any,
    *,
    node_id: int,
    endpoint_id: int,
    group_id: int,
    clusters: list[int],
) -> None:
    entries = await _read_acl(client, node_id)
    required = _required_group_acl_clusters(entries, group_id, endpoint_id, clusters)
    if not required:
        return
    if not _has_admin_acl(entries):
        raise StudioWriteError(
            "A selected target ACL cannot be safely updated because no administrator entry was found."
        )
    capacity = await _read_acl_capacity(client, node_id, entries)
    entries_to_add = _new_group_acl_entries(group_id, endpoint_id, required, capacity)
    _require_acl_capacity(capacity, len(entries_to_add))
    await _write_acl(client, node_id, [*entries, *entries_to_add])
    for _ in range(_VERIFY_ATTEMPTS):
        verified = await _read_acl(client, node_id)
        if all(
            _acl_grants_group(verified, group_id, endpoint_id, cluster_id)
            for cluster_id in required
        ):
            return
        await asyncio.sleep(_VERIFY_DELAY_SECONDS)
    raise StudioWriteError("A selected target did not confirm the group access rule.")


async def _remove_group_acl_grants(
    client: Any,
    *,
    node_id: int,
    endpoint_id: int,
    group_id: int,
    clusters: list[int],
) -> None:
    """Remove only concrete group ACL targets owned by one recorded member."""
    if not clusters:
        return
    entries = await _read_acl(client, node_id)
    remaining, changed, ambiguous = _without_group_acl_targets(
        entries,
        group_id=group_id,
        endpoint_id=endpoint_id,
        clusters=set(clusters),
    )
    if ambiguous:
        raise StudioWriteError(
            "A managed group has a wildcard ACL rule that cannot be safely removed."
        )
    if not changed:
        return
    await _write_acl(client, node_id, remaining)
    for _ in range(_VERIFY_ATTEMPTS):
        verified = await _read_acl(client, node_id)
        if not any(
            _acl_grants_group(verified, group_id, endpoint_id, cluster_id)
            for cluster_id in clusters
        ):
            return
        await asyncio.sleep(_VERIFY_DELAY_SECONDS)
    raise StudioWriteError("A member did not confirm removal of the group access rule.")


def _without_group_acl_targets(
    entries: list[dict[str, Any]],
    *,
    group_id: int,
    endpoint_id: int,
    clusters: set[int],
) -> tuple[list[dict[str, Any]], bool, bool]:
    """Return ACL table without exact group grants, preserving other targets."""
    result: list[dict[str, Any]] = []
    changed = False
    ambiguous = False
    for entry in entries:
        if not (
            entry["privilege"] < _ACL_PRIVILEGE_ADMINISTER
            and entry["authMode"] == _ACL_AUTH_MODE_GROUP
            and entry.get("subjects") == [group_id]
            and isinstance(entry.get("targets"), list)
        ):
            result.append(entry)
            continue
        targets = entry["targets"]
        kept_targets: list[dict[str, Any]] = []
        entry_changed = False
        for target in targets:
            endpoint = target.get("endpoint")
            cluster = target.get("cluster")
            if endpoint is None:
                # A wildcard endpoint could authorize another unrecorded member.
                ambiguous = True
                kept_targets.append(target)
                continue
            matches_member = endpoint == endpoint_id
            matches_cluster = cluster is None or cluster in clusters
            if matches_member and matches_cluster:
                entry_changed = True
                changed = True
                continue
            kept_targets.append(target)
        if not entry_changed:
            result.append(entry)
        elif kept_targets:
            result.append({**entry, "targets": kept_targets})
    return result, changed, ambiguous


def _acl_grants_group(
    entries: list[dict[str, Any]],
    group_id: int,
    endpoint_id: int,
    cluster_id: int,
) -> bool:
    for entry in entries:
        if entry["privilege"] < _ACL_PRIVILEGE_OPERATE:
            continue
        if entry["authMode"] != _ACL_AUTH_MODE_GROUP:
            continue
        subjects = entry["subjects"]
        if subjects and group_id not in subjects:
            continue
        targets = entry["targets"]
        if not targets:
            return True
        for target in targets:
            if (
                (target["endpoint"] is None or target["endpoint"] == endpoint_id)
                and (target["cluster"] is None or target["cluster"] == cluster_id)
            ):
                return True
    return False


def _required_group_acl_clusters(
    entries: list[dict[str, Any]],
    group_id: int,
    endpoint_id: int,
    clusters: list[int],
) -> list[int]:
    return [
        cluster_id
        for cluster_id in clusters
        if not _acl_grants_group(entries, group_id, endpoint_id, cluster_id)
    ]


def _new_group_acl(
    group_id: int, endpoint_id: int, clusters: Sequence[int]
) -> dict[str, Any]:
    return {
        "privilege": _ACL_PRIVILEGE_OPERATE,
        "authMode": _ACL_AUTH_MODE_GROUP,
        "subjects": [group_id],
        "targets": [
            {"cluster": cluster_id, "endpoint": endpoint_id, "deviceType": None}
            for cluster_id in clusters
        ],
        "fabricIndex": 0,
    }


def _new_group_acl_entries(
    group_id: int,
    endpoint_id: int,
    clusters: Sequence[int],
    capacity: Mapping[str, int | None],
) -> list[dict[str, Any]]:
    return [
        _new_group_acl(group_id, endpoint_id, chunk)
        for chunk in _acl_target_chunks(clusters, capacity)
    ]


async def _write_and_verify_group_bindings(
    client: Any,
    *,
    source_node_id: int,
    source_endpoint_id: int,
    bindings: list[dict[str, int | None]],
    group_id: int,
    clusters: list[int],
) -> bool:
    fabric_index = await _read_fabric_index(client, source_node_id)
    path = f"{source_endpoint_id}/{CLUSTER_BINDING}/{ATTR_BINDING}"
    for tag_keys in (False, True):
        payload = [_encode_binding(entry, fabric_index, tag_keys) for entry in bindings]
        result = await client.write_attribute(
            node_id=source_node_id, attribute_path=path, value=payload
        )
        if _write_result_failed(result):
            continue
        for _ in range(_VERIFY_ATTEMPTS):
            readback = await _read_bindings(
                client, source_node_id, source_endpoint_id
            )
            if (
                _binding_signature(readback) == _binding_signature(bindings)
                and all(
                    _binding_group_exists(
                        readback, group_id=group_id, cluster_id=cluster
                    )
                    for cluster in clusters
                )
            ):
                return True
            await asyncio.sleep(_VERIFY_DELAY_SECONDS)
    return False


def _binding_group_exists(
    bindings: list[dict[str, int | None]], *, group_id: int, cluster_id: int
) -> bool:
    return any(
        entry.get("target_group_id") == group_id
        and entry.get("cluster_id") == cluster_id
        for entry in bindings
    )


def _find_endpoint(
    devices: list[dict[str, Any]], node_id: int, endpoint_id: int
) -> dict[str, Any] | None:
    return next(
        (
            item
            for item in devices
            if item.get("node_id") == node_id and item.get("endpoint_id") == endpoint_id
        ),
        None,
    )


def _require_client(hass: HomeAssistant) -> Any:
    client = _get_matter_client(hass)
    if client is None:
        raise StudioWriteError("Home Assistant's Matter client is not available.")
    return client


async def _read_bindings(
    client: Any, node_id: int, endpoint_id: int
) -> list[dict[str, int | None]]:
    path = f"{endpoint_id}/{CLUSTER_BINDING}/{ATTR_BINDING}"
    value = await client.read_attribute(node_id=node_id, attribute_path=path)
    if isinstance(value, Mapping):
        value = value.get(path, value)
    return _parse_bindings(value)


async def _read_acl(client: Any, node_id: int) -> list[dict[str, Any]]:
    path = f"0/{CLUSTER_ACCESS_CONTROL}/{ATTR_ACL}"
    value = await client.read_attribute(node_id=node_id, attribute_path=path)
    if isinstance(value, Mapping):
        value = value.get(path, value)
    value = _unwrap_value(value)
    raw_entries = _acl_entries(value)
    entries: list[dict[str, Any]] = []
    for index, raw_entry in enumerate(raw_entries):
        if _is_fabric_index_marker(raw_entry):
            # Some servers expose foreign-fabric ACLs as a FabricIndex-only
            # marker. ACL writes are fabric-scoped, so this marker must not be
            # echoed into the local fabric's replacement list.
            _LOGGER.debug("Ignoring an opaque foreign-fabric ACL marker")
            continue
        entry = _normalise_acl_entry(raw_entry)
        if entry is None:
            raise StudioWriteError(
                "The target Access Control list has an unsupported entry shape "
                f"at entry {index}: {_acl_shape_summary(raw_entry)} "
                f"(table: {_acl_table_shape(value)})."
            )
        entries.append(entry)
    return entries


async def _read_acl_capacity(
    client: Any, node_id: int, entries: list[dict[str, Any]] | None = None
) -> dict[str, int | None]:
    """Read the target ACL limits without treating an unavailable limit as zero.

    The ACL table itself is the authoritative used count.  The two capacity
    attributes are optional in practice, so discovery remains useful when a
    device does not expose them; writes only fail closed when a reported limit
    is known to be insufficient.
    """
    if entries is None:
        entries = await _read_acl(client, node_id)
    maximum = await _read_optional_attribute(
        client,
        node_id,
        f"0/{CLUSTER_ACCESS_CONTROL}/{ATTR_ACCESS_CONTROL_ENTRIES_PER_FABRIC}",
    )
    targets_per_entry = await _read_optional_attribute(
        client,
        node_id,
        f"0/{CLUSTER_ACCESS_CONTROL}/{ATTR_TARGETS_PER_ACCESS_CONTROL_ENTRY}",
    )
    return {
        "used": len(entries),
        "maximum": maximum,
        "available": _remaining_capacity(maximum, len(entries)),
        "targets_per_entry": targets_per_entry,
    }


async def _read_optional_attribute(
    client: Any, node_id: int, attribute_path: str
) -> int | None:
    try:
        return _optional_int(await _read_attribute(client, node_id, attribute_path))
    except Exception:  # noqa: BLE001 - optional Matter capacity attribute
        return None


def _remaining_capacity(maximum: int | None, used: int) -> int | None:
    return max(0, maximum - used) if maximum is not None else None


def _require_acl_capacity(capacity: Mapping[str, int | None], entries_to_add: int) -> None:
    maximum = capacity.get("maximum")
    used = capacity.get("used")
    if maximum is None or used is None:
        return
    if used + entries_to_add > maximum:
        raise StudioWriteError(
            f"The target ACL is full ({used}/{maximum}). Reclaim an unused ACL rule before creating this Binding."
        )


def _public_acl_capacity(
    capacity: Mapping[str, int | None], *, entries_to_add: int = 0
) -> dict[str, int | None]:
    used = capacity.get("used")
    maximum = capacity.get("maximum")
    available = capacity.get("available")
    return {
        "used": used,
        "maximum": maximum,
        "available": available,
        "targets_per_entry": capacity.get("targets_per_entry"),
        "entries_to_add": entries_to_add,
    }


async def _read_fabric_index(client: Any, node_id: int) -> int:
    path = f"0/{CLUSTER_OPERATIONAL_CREDENTIALS}/{ATTR_CURRENT_FABRIC_INDEX}"
    value = await client.read_attribute(node_id=node_id, attribute_path=path)
    if isinstance(value, Mapping):
        value = value.get(path, value)
    try:
        index = int(value)
    except (TypeError, ValueError) as err:
        raise StudioWriteError("The source fabric index could not be read.") from err
    if index < 1:
        raise StudioWriteError("The source fabric index is invalid.")
    return index


async def _write_and_verify_bindings(
    client: Any,
    source_node_id: int,
    source_endpoint_id: int,
    bindings: list[dict[str, int | None]],
    target_node_id: int,
    target_endpoint_id: int,
    clusters: list[int],
) -> bool:
    fabric_index = await _read_fabric_index(client, source_node_id)
    path = f"{source_endpoint_id}/{CLUSTER_BINDING}/{ATTR_BINDING}"
    for tag_keys in (False, True):
        payload = [_encode_binding(entry, fabric_index, tag_keys) for entry in bindings]
        await client.write_attribute(
            node_id=source_node_id, attribute_path=path, value=payload
        )
        for _ in range(_VERIFY_ATTEMPTS):
            readback = await _read_bindings(client, source_node_id, source_endpoint_id)
            if all(
                _binding_exists(
                    readback,
                    node_id=target_node_id,
                    endpoint_id=target_endpoint_id,
                    cluster_id=cluster_id,
                )
                for cluster_id in clusters
            ):
                return True
            await asyncio.sleep(_VERIFY_DELAY_SECONDS)
    return False


async def _write_and_verify_binding_table(
    client: Any,
    *,
    source_node_id: int,
    source_endpoint_id: int,
    bindings: list[dict[str, int | None]],
) -> bool:
    """Replace one source Binding table and verify every remaining entry.

    Matter writes the whole Binding list, so removal verification compares the
    complete normalized table rather than only checking that one entry vanished.
    """
    fabric_index = await _read_fabric_index(client, source_node_id)
    expected_signature = _binding_signature(bindings)
    path = f"{source_endpoint_id}/{CLUSTER_BINDING}/{ATTR_BINDING}"
    for tag_keys in (False, True):
        payload = [_encode_binding(entry, fabric_index, tag_keys) for entry in bindings]
        result = await client.write_attribute(
            node_id=source_node_id, attribute_path=path, value=payload
        )
        if _write_result_failed(result):
            continue
        for _ in range(_VERIFY_ATTEMPTS):
            readback = await _read_bindings(client, source_node_id, source_endpoint_id)
            if _binding_signature(readback) == expected_signature:
                return True
            await asyncio.sleep(_VERIFY_DELAY_SECONDS)
    return False


def _encode_binding(
    entry: dict[str, int | None], fabric_index: int, tag_keys: bool
) -> dict[str, int]:
    values = {
        "node": entry.get("target_node_id"),
        "group": entry.get("target_group_id"),
        "endpoint": entry.get("target_endpoint_id"),
        "cluster": entry.get("cluster_id"),
    }
    payload = {
        (str(_BINDING_TAGS[name]) if tag_keys else name): int(value)
        for name, value in values.items()
        if value is not None
    }
    payload[str(_FABRIC_INDEX_TAG) if tag_keys else "fabricIndex"] = fabric_index
    return payload


def _binding_exists(
    bindings: list[dict[str, int | None]],
    *,
    node_id: int,
    endpoint_id: int,
    cluster_id: int,
) -> bool:
    return any(
        entry.get("target_group_id") is None
        and entry.get("target_node_id") == node_id
        and entry.get("target_endpoint_id") == endpoint_id
        and entry.get("cluster_id") == cluster_id
        for entry in bindings
    )


def _binding_matches_target(
    entry: Mapping[str, int | None],
    *,
    target_kind: str,
    target_node_id: int | None,
    target_endpoint_id: int | None,
    target_group_id: int | None,
) -> bool:
    """Return whether a Binding entry belongs to the reviewed relationship."""
    if target_kind == "group":
        return entry.get("target_group_id") == target_group_id
    return (
        entry.get("target_group_id") is None
        and entry.get("target_node_id") == target_node_id
        and entry.get("target_endpoint_id") == target_endpoint_id
    )


def _binding_signature(bindings: list[dict[str, int | None]]) -> list[tuple[Any, ...]]:
    return sorted(
        (
            entry.get("target_node_id"),
            entry.get("target_group_id"),
            entry.get("target_endpoint_id"),
            entry.get("cluster_id"),
        )
        for entry in bindings
    )


def _acl_signature(entries: list[Mapping[str, Any]]) -> list[tuple[Any, ...]]:
    """Compare ACL tables semantically while ignoring transport ordering."""
    result: list[tuple[Any, ...]] = []
    for entry in entries:
        targets = entry.get("targets")
        target_signature = None
        if isinstance(targets, list):
            target_rows = [
                (
                    _optional_int(target.get("endpoint")),
                    _optional_int(target.get("cluster")),
                    _optional_int(target.get("deviceType")),
                )
                for target in targets
                if isinstance(target, Mapping)
            ]
            target_signature = tuple(
                sorted(
                    target_rows,
                    key=lambda value: tuple(-1 if item is None else item for item in value),
                )
            )
        subjects = entry.get("subjects")
        subject_signature = (
            tuple(sorted(int(subject) for subject in subjects))
            if isinstance(subjects, list)
            else None
        )
        result.append(
            (
                int(entry["privilege"]),
                int(entry["authMode"]),
                subject_signature,
                target_signature,
            )
        )
    return sorted(result, key=repr)


def _normalise_acl_entry(entry: Any) -> dict[str, Any] | None:
    privilege, auth_mode, subjects, targets = _acl_entry_fields(entry)
    try:
        subjects = _unwrap_value(subjects)
        targets = _unwrap_value(targets)
        normalised_targets = (
            [_normalise_acl_target(target) for target in targets]
            if _is_sequence_struct(targets)
            else None
        )
        if normalised_targets is not None and any(
            target is None for target in normalised_targets
        ):
            return None
        return {
            "privilege": int(privilege),
            "authMode": int(auth_mode),
            "subjects": [int(subject) for subject in subjects]
            if _is_sequence_struct(subjects)
            else None,
            "targets": normalised_targets,
            "fabricIndex": 0,
        }
    except (TypeError, ValueError):
        return None


def _acl_entries(value: Any) -> list[Any]:
    """Flatten a Matter Server ACL table into individual ACL entry structs.

    Matter Server versions have represented the table as a list, a mapping
    keyed by list index, and a list containing that mapping. Keep the
    interpretation strict: only a value with scalar privilege and auth-mode
    fields is treated as an ACL entry.
    """
    value = _unwrap_value(value)
    if _is_fabric_index_marker(value):
        return [value]
    if _looks_like_acl_entry(value):
        return [value]
    if _is_sequence_struct(value):
        return [entry for item in value for entry in _acl_entries(item)]
    if isinstance(value, Mapping):
        return [entry for item in value.values() for entry in _acl_entries(item)]
    return [value]


def _looks_like_acl_entry(value: Any) -> bool:
    privilege, auth_mode, _, _ = _acl_entry_fields(value)
    try:
        int(privilege)
        int(auth_mode)
    except (TypeError, ValueError):
        return False
    return True


def _acl_entry_fields(entry: Any) -> tuple[Any, Any, Any, Any]:
    """Read ACL fields from named, Matter-tagged, or zero-based structs."""
    entry = _unwrap_value(entry)
    if _is_sequence_struct(entry):
        return (
            entry[0] if len(entry) > 0 else None,
            entry[1] if len(entry) > 1 else None,
            entry[2] if len(entry) > 2 else None,
            entry[3] if len(entry) > 3 else None,
        )

    standard = (
        _field(entry, ("privilege", "Privilege", 1)),
        _field(entry, ("authMode", "auth_mode", "AuthMode", 2)),
        _field(entry, ("subjects", "Subjects", 3)),
        _field(entry, ("targets", "Targets", 4)),
    )
    if _fields_start_with_scalars(standard):
        return standard
    return (
        _field(entry, ("privilege", "Privilege", 0)),
        _field(entry, ("authMode", "auth_mode", "AuthMode", 1)),
        _field(entry, ("subjects", "Subjects", 2)),
        _field(entry, ("targets", "Targets", 3)),
    )


def _fields_start_with_scalars(fields: tuple[Any, Any, Any, Any]) -> bool:
    try:
        int(fields[0])
        int(fields[1])
    except (TypeError, ValueError):
        return False
    return True


def _is_fabric_index_marker(entry: Any) -> bool:
    """Recognise an ACL marker that reveals only a foreign FabricIndex."""
    entry = _unwrap_value(entry)
    if not isinstance(entry, Mapping) or len(entry) != 1:
        return False
    key = next(iter(entry))
    return key in (254, "254", "fabricIndex", "FabricIndex")


def _acl_shape_summary(value: Any) -> str:
    """Return safe structural evidence without exposing ACL values."""
    value = _unwrap_value(value)
    if isinstance(value, Mapping):
        keys = ", ".join(str(key) for key in list(value)[:6])
        return f"mapping with keys [{keys}]"
    if _is_sequence_struct(value):
        return f"sequence with {len(value)} items"
    return type(value).__name__


def _acl_table_shape(value: Any, depth: int = 0) -> str:
    """Describe only the container shape of an ACL table for safe diagnostics."""
    value = _unwrap_value(value)
    if depth >= 2:
        return _acl_shape_summary(value)
    if isinstance(value, Mapping):
        preview = ", ".join(
            f"{key}:{_acl_table_shape(child, depth + 1)}"
            for key, child in list(value.items())[:4]
        )
        suffix = ", …" if len(value) > 4 else ""
        return f"mapping({preview}{suffix})"
    if _is_sequence_struct(value):
        preview = ", ".join(
            _acl_table_shape(child, depth + 1) for child in value[:4]
        )
        suffix = ", …" if len(value) > 4 else ""
        return f"sequence({preview}{suffix})"
    return type(value).__name__


def _normalise_acl_target(target: Any) -> dict[str, int | None] | None:
    target = _unwrap_value(target)
    try:
        return {
            "cluster": _optional_int(_field(target, ("cluster", "Cluster", 0))),
            "endpoint": _optional_int(_field(target, ("endpoint", "Endpoint", 1))),
            "deviceType": _optional_int(
                _field(target, ("deviceType", "device_type", "DeviceType", 2))
            ),
        }
    except (TypeError, ValueError):
        return None


def _field(value: Any, names: tuple[str | int, ...]) -> Any:
    if isinstance(value, Mapping):
        for name in names:
            if name in value:
                return value[name]
            if str(name) in value:
                return value[str(name)]
    elif _is_sequence_struct(value):
        for name in names:
            if isinstance(name, int) and 0 <= name < len(value):
                return value[name]
    else:
        for name in names:
            if isinstance(name, str) and hasattr(value, name):
                return getattr(value, name)
    return None


def _is_sequence_struct(value: Any) -> bool:
    return isinstance(value, Sequence) and not isinstance(value, (str, bytes, bytearray))


def _unwrap_value(value: Any) -> Any:
    """Unwrap Matter Server's serialised value envelope, if present."""
    while isinstance(value, Mapping) and "value" in value:
        value = value["value"]
    return value


def _optional_int(value: Any) -> int | None:
    if value is None or isinstance(value, bool):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _has_admin_acl(entries: list[dict[str, Any]]) -> bool:
    return any(entry["privilege"] == _ACL_PRIVILEGE_ADMINISTER for entry in entries)


def _acl_grants_case(
    entries: list[dict[str, Any]],
    source_node_id: int,
    endpoint_id: int,
    cluster_id: int,
) -> bool:
    for entry in entries:
        if entry["privilege"] < _ACL_PRIVILEGE_OPERATE:
            continue
        if entry["authMode"] != _ACL_AUTH_MODE_CASE:
            continue
        subjects = entry["subjects"]
        if subjects and source_node_id not in subjects:
            continue
        targets = entry["targets"]
        if not targets:
            return True
        for target in targets:
            endpoint_matches = (
                target["endpoint"] is None or target["endpoint"] == endpoint_id
            )
            cluster_matches = (
                target["cluster"] is None or target["cluster"] == cluster_id
            )
            if endpoint_matches and cluster_matches:
                return True
    return False


def _required_case_acl_clusters(
    entries: list[dict[str, Any]],
    source_node_id: int,
    endpoint_id: int,
    clusters: list[int],
) -> list[int]:
    return [
        cluster_id
        for cluster_id in clusters
        if not _acl_grants_case(entries, source_node_id, endpoint_id, cluster_id)
    ]


def _new_case_acl(
    source_node_id: int, endpoint_id: int, clusters: Sequence[int]
) -> dict[str, Any]:
    return {
        "privilege": _ACL_PRIVILEGE_OPERATE,
        "authMode": _ACL_AUTH_MODE_CASE,
        "subjects": [source_node_id],
        "targets": [
            {"cluster": cluster_id, "endpoint": endpoint_id, "deviceType": None}
            for cluster_id in clusters
        ],
        "fabricIndex": 0,
    }


def _new_case_acl_entries(
    source_node_id: int,
    endpoint_id: int,
    clusters: Sequence[int],
    capacity: Mapping[str, int | None],
) -> list[dict[str, Any]]:
    return [
        _new_case_acl(source_node_id, endpoint_id, chunk)
        for chunk in _acl_target_chunks(clusters, capacity)
    ]


def _acl_target_chunks(
    clusters: Sequence[int], capacity: Mapping[str, int | None]
) -> list[list[int]]:
    """Pack least-privilege targets without assuming an unknown device limit.

    Matter permits several TargetStructs in one ACL entry.  A device that
    reports its per-entry target capacity can therefore grant On/Off, Level,
    and Color Control in one entry instead of consuming three table slots.
    When the limit is unavailable we retain the old one-target-per-entry shape
    rather than making an unsafe assumption about what a device accepts.
    """
    normalized = sorted({int(cluster) for cluster in clusters})
    if not normalized:
        return []
    limit = max(capacity.get("targets_per_entry") or 1, 1)
    return [normalized[index : index + limit] for index in range(0, len(normalized), limit)]


async def _write_acl(client: Any, node_id: int, entries: list[dict[str, Any]]) -> None:
    ordered = sorted(
        (_encode_acl_entry(entry) for entry in entries),
        key=lambda entry: entry["privilege"] != _ACL_PRIVILEGE_ADMINISTER,
    )
    if not _has_admin_acl(ordered):
        raise StudioWriteError(
            "Refusing to write an ACL without an administrator entry."
        )
    send_command = getattr(client, "send_raw_command", None)
    if not callable(send_command):
        send_command = getattr(client, "send_command", None)
    if not callable(send_command):
        raise StudioWriteError(
            "This Home Assistant Matter client cannot safely update ACLs."
        )
    result = await send_command("set_acl_entry", node_id=node_id, entry=ordered)
    if _write_result_failed(result):
        raise StudioWriteError("The target device rejected the Access Control update.")


def _encode_acl_entry(entry: dict[str, Any]) -> dict[str, Any]:
    """Encode a local-fabric ACL entry for both Matter Server backends."""
    targets = entry.get("targets")
    encoded_targets = (
        [
            {
                "cluster": target.get("cluster"),
                "endpoint": target.get("endpoint"),
                "deviceType": target.get("deviceType"),
                "device_type": target.get("deviceType"),
            }
            for target in targets
        ]
        if targets is not None
        else None
    )
    return {
        "privilege": entry["privilege"],
        "authMode": entry["authMode"],
        "auth_mode": entry["authMode"],
        "subjects": entry.get("subjects"),
        "targets": encoded_targets,
    }


def _write_result_failed(result: Any) -> bool:
    if result is None:
        return False
    rows = result if isinstance(result, list) else [result]
    for row in rows:
        status = _field(row, ("status", "Status"))
        try:
            if status is not None and int(status) != 0:
                return True
        except (TypeError, ValueError):
            return True
    return False


async def _verify_acl(
    client: Any,
    target_node_id: int,
    source_node_id: int,
    target_endpoint_id: int,
    clusters: list[int],
) -> bool:
    for _ in range(_VERIFY_ATTEMPTS):
        entries = await _read_acl(client, target_node_id)
        if all(
            _acl_grants_case(entries, source_node_id, target_endpoint_id, cluster_id)
            for cluster_id in clusters
        ):
            return True
        await asyncio.sleep(_VERIFY_DELAY_SECONDS)
    return False


def _repair_needed_result(acl_added: bool) -> dict[str, Any]:
    message = "The Binding write was not verified on the source device."
    if acl_added:
        message += " Target access was added; review the target ACL before retrying."
    return {
        "success": False,
        "verified": False,
        "repair_needed": acl_added,
        "message": message,
    }


def _pending_plans(hass: HomeAssistant) -> dict[str, dict[str, Any]]:
    return hass.data.setdefault(DOMAIN, {}).setdefault("_pending_write_plans", {})


def _source_locks(hass: HomeAssistant) -> dict[tuple[int, int], asyncio.Lock]:
    return hass.data.setdefault(DOMAIN, {}).setdefault("_source_write_locks", {})


def _purge_expired_plans(hass: HomeAssistant) -> None:
    now = time.monotonic()
    plans = _pending_plans(hass)
    for plan_id, plan in list(plans.items()):
        if now - float(plan["created_at"]) > _PLAN_TTL_SECONDS:
            plans.pop(plan_id, None)


def _take_plan(
    hass: HomeAssistant, plan_id: str, expected_kind: str | None = None
) -> dict[str, Any]:
    _purge_expired_plans(hass)
    plan = _pending_plans(hass).pop(plan_id, None)
    if plan is None:
        raise StudioWriteError(
            "This review expired. Generate a new plan before writing."
        )
    if expected_kind is not None and plan.get("kind") != expected_kind:
        raise StudioWriteError("This review does not match the requested native Matter operation.")
    return plan
