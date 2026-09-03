"""Guarded native-Matter unicast binding transactions.

This first writable slice deliberately handles one source endpoint and one
target endpoint. It first creates a short-lived reviewed plan, then writes a
target ACL (only when required), replaces the source's fabric-scoped Binding
list, and finally reads the Binding Cluster back from the device.

Multi-target groupcast is intentionally separate: it also provisions a Group
Key, Groups membership, and group ACLs on several nodes.
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
    ATTR_ACL,
    ATTR_BINDING,
    ATTR_CURRENT_FABRIC_INDEX,
    CLUSTER_ACCESS_CONTROL,
    CLUSTER_BINDING,
    CLUSTER_OPERATIONAL_CREDENTIALS,
    DOMAIN,
)
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


class StudioWriteError(RuntimeError):
    """A user-safe write transaction error."""


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

    acl_needed = any(
        not _acl_grants_case(
            acl_entries, source_node_id, target_endpoint_id, cluster_id
        )
        for cluster_id in selected_clusters
    )
    plan_id = secrets.token_urlsafe(24)
    plan = {
        "plan_id": plan_id,
        "created_at": time.monotonic(),
        "source": source,
        "target": target,
        "clusters": selected_clusters,
        "bindings_before": bindings,
        "acl_needed": acl_needed,
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
        "steps": [
            "Read the latest Binding and ACL lists.",
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
            acl_payload = list(current_acl)
            acl_payload.extend(
                _new_case_acl(source_node_id, target_endpoint_id, cluster_id)
                for cluster_id in required_acl_clusters
            )
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
        entry = _normalise_acl_entry(raw_entry)
        if entry is None:
            raise StudioWriteError(
                "The target Access Control list has an unsupported entry shape "
                f"at entry {index}: {_acl_shape_summary(raw_entry)}."
            )
        entries.append(entry)
    return entries


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


def _normalise_acl_entry(entry: Any) -> dict[str, Any] | None:
    entry = _unwrap_value(entry)
    if _is_sequence_struct(entry):
        privilege = entry[0] if len(entry) > 0 else None
        auth_mode = entry[1] if len(entry) > 1 else None
        subjects = entry[2] if len(entry) > 2 else None
        targets = entry[3] if len(entry) > 3 else None
    else:
        privilege = _field(entry, ("privilege", "Privilege", 1))
        auth_mode = _field(entry, ("authMode", "auth_mode", "AuthMode", 2))
        subjects = _field(entry, ("subjects", "Subjects", 3))
        targets = _field(entry, ("targets", "Targets", 4))
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
    if _looks_like_acl_entry(value):
        return [value]
    if _is_sequence_struct(value):
        return [entry for item in value for entry in _acl_entries(item)]
    if isinstance(value, Mapping):
        return [entry for item in value.values() for entry in _acl_entries(item)]
    return [value]


def _looks_like_acl_entry(value: Any) -> bool:
    if _is_sequence_struct(value):
        privilege = value[0] if len(value) > 0 else None
        auth_mode = value[1] if len(value) > 1 else None
    else:
        privilege = _field(value, ("privilege", "Privilege", 1))
        auth_mode = _field(value, ("authMode", "auth_mode", "AuthMode", 2))
    try:
        int(privilege)
        int(auth_mode)
    except (TypeError, ValueError):
        return False
    return True


def _acl_shape_summary(value: Any) -> str:
    """Return safe structural evidence without exposing ACL values."""
    value = _unwrap_value(value)
    if isinstance(value, Mapping):
        keys = ", ".join(str(key) for key in list(value)[:6])
        return f"mapping with keys [{keys}]"
    if _is_sequence_struct(value):
        return f"sequence with {len(value)} items"
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
    return int(value) if value is not None else None


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


def _new_case_acl(
    source_node_id: int, endpoint_id: int, cluster_id: int
) -> dict[str, Any]:
    return {
        "privilege": _ACL_PRIVILEGE_OPERATE,
        "authMode": _ACL_AUTH_MODE_CASE,
        "subjects": [source_node_id],
        "targets": [
            {"cluster": cluster_id, "endpoint": endpoint_id, "deviceType": None}
        ],
        "fabricIndex": 0,
    }


async def _write_acl(client: Any, node_id: int, entries: list[dict[str, Any]]) -> None:
    ordered = sorted(
        entries,
        key=lambda entry: entry["privilege"] != _ACL_PRIVILEGE_ADMINISTER,
    )
    if not _has_admin_acl(ordered):
        raise StudioWriteError(
            "Refusing to write an ACL without an administrator entry."
        )
    send_raw_command = getattr(client, "send_raw_command", None)
    if not callable(send_raw_command):
        raise StudioWriteError(
            "This Home Assistant Matter client cannot safely update ACLs."
        )
    result = await send_raw_command("set_acl_entry", node_id=node_id, entry=ordered)
    if _write_result_failed(result):
        raise StudioWriteError("The target device rejected the Access Control update.")


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
    return hass.data.setdefault(DOMAIN, {}).setdefault("_pending_unicast_plans", {})


def _source_locks(hass: HomeAssistant) -> dict[tuple[int, int], asyncio.Lock]:
    return hass.data.setdefault(DOMAIN, {}).setdefault("_source_write_locks", {})


def _purge_expired_plans(hass: HomeAssistant) -> None:
    now = time.monotonic()
    plans = _pending_plans(hass)
    for plan_id, plan in list(plans.items()):
        if now - float(plan["created_at"]) > _PLAN_TTL_SECONDS:
            plans.pop(plan_id, None)


def _take_plan(hass: HomeAssistant, plan_id: str) -> dict[str, Any]:
    _purge_expired_plans(hass)
    plan = _pending_plans(hass).pop(plan_id, None)
    if plan is None:
        raise StudioWriteError(
            "This review expired. Generate a new plan before writing."
        )
    return plan
