"""Read-only native Matter discovery for Matter Binding Studio.

The Studio intentionally derives its initial model directly from Home
Assistant's Matter client and HA registries.  It does not create a group,
write a Binding Cluster entry, provision an ACL, or access Group Key material.
"""

from __future__ import annotations

import logging
import re
from collections.abc import Iterable, Mapping
from typing import Any

from homeassistant.components.matter import DOMAIN as MATTER_DOMAIN
from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

from .group_store import get_managed_group_store
from .const import (
    ATTR_BINDING,
    ATTR_CLIENT_LIST,
    ATTR_GROUP_KEY_MAP,
    ATTR_GROUP_TABLE,
    ATTR_MAX_GROUP_KEYS_PER_FABRIC,
    ATTR_MAX_GROUPS_PER_FABRIC,
    ATTR_SERVER_LIST,
    CLUSTER_BINDING,
    CLUSTER_COLOR_CONTROL,
    CLUSTER_DESCRIPTOR,
    CLUSTER_GROUP_KEY_MANAGEMENT,
    CLUSTER_GROUPS,
    CLUSTER_LEVEL_CONTROL,
    CLUSTER_ON_OFF,
)

_LOGGER = logging.getLogger(__name__)

_CONTROL_CLUSTERS = frozenset(
    (CLUSTER_ON_OFF, CLUSTER_LEVEL_CONTROL, CLUSTER_COLOR_CONTROL)
)
_MATTER_IDENTIFIER_RE = re.compile(
    r"^deviceid_.+-(?P<node>[0-9A-Fa-f]{16})-"
    r"(?P<suffix>MatterNodeDevice|[0-9]+)$"
)


async def async_get_snapshot(hass: HomeAssistant) -> dict[str, Any]:
    """Create the complete operator-facing Studio read model.

    The only live device request permitted in this function is a Binding Cluster
    attribute read when that attribute is absent from the Matter-server cache.
    This is a read operation. All group and Group Key capacity information is
    derived from cached attributes only.
    """
    client = _get_matter_client(hass)
    if client is None:
        return _empty_snapshot("Matter integration is not currently available.")

    try:
        raw_nodes = list(client.get_nodes())
    except Exception as err:  # noqa: BLE001 - return a safe empty model to the panel
        _LOGGER.warning("Studio could not obtain Matter nodes: %s", err)
        return _empty_snapshot("Matter node inventory is temporarily unavailable.")

    names = _build_name_index(hass)
    endpoints: dict[tuple[int, int], dict[str, Any]] = {}
    raw_endpoint_nodes: dict[tuple[int, int], Any] = {}
    node_rows: list[tuple[Any, int, str]] = []
    groups: dict[int, dict[str, Any]] = {}

    for raw_node in raw_nodes:
        node_id = _as_int(getattr(raw_node, "node_id", None))
        if node_id is None:
            continue
        node_name = names["node_names"].get(node_id) or _raw_node_name(raw_node)
        node_rows.append((raw_node, node_id, node_name))

        for endpoint_id, raw_endpoint in _raw_endpoints(raw_node).items():
            server_clusters, client_clusters = _endpoint_clusters(
                raw_node, endpoint_id, raw_endpoint
            )
            server_controls = sorted(server_clusters & _CONTROL_CLUSTERS)
            client_controls = sorted(client_clusters & _CONTROL_CLUSTERS)
            has_binding = (
                CLUSTER_BINDING in server_clusters or CLUSTER_BINDING in client_clusters
            )
            endpoint = {
                "node_id": node_id,
                "endpoint_id": endpoint_id,
                "node_name": node_name,
                "name": _endpoint_name(names, node_id, endpoint_id, node_name),
                "area_name": _endpoint_area(names, node_id, endpoint_id),
                "capabilities": server_controls or client_controls,
                "client_capabilities": client_controls,
                "server_capabilities": server_controls,
                "can_bind": bool(has_binding and client_controls),
                "can_be_target": bool(server_controls),
            }
            endpoints[(node_id, endpoint_id)] = endpoint
            raw_endpoint_nodes[(node_id, endpoint_id)] = raw_node

            if server_controls:
                _add_cached_group_memberships(groups, raw_node, endpoint_id, endpoint)

    await _merge_managed_group_metadata(hass, groups, endpoints)

    warnings: list[str] = []
    bindings_by_source: dict[tuple[int, int], list[dict[str, int | None]]] = {}
    for source_key, endpoint in endpoints.items():
        if not endpoint["can_bind"]:
            continue
        raw_node = raw_endpoint_nodes[source_key]
        bindings, warning = await _async_read_bindings(
            client, raw_node, source_key[0], source_key[1]
        )
        bindings_by_source[source_key] = bindings
        if warning:
            warnings.append(f"Could not read bindings for {endpoint['name']}.")

    relationships = _relationships_from_bindings(bindings_by_source, endpoints, groups)
    for relationship in relationships:
        if relationship["route"] == "native_group":
            group_id = relationship["targets"].get("group_id")
            if group_id in groups:
                groups[group_id]["active_relationships"] += 1

    capacities = [
        _group_capacity(raw_node, node_id, node_name)
        for raw_node, node_id, node_name in node_rows
    ]
    devices = [
        endpoint
        for endpoint in endpoints.values()
        if endpoint["can_bind"] or endpoint["can_be_target"]
    ]
    devices.sort(key=lambda item: (item["area_name"] or "", item["name"]))

    native_control_sets = list(groups.values())
    native_control_sets.sort(key=lambda item: (item["name"], item["group_id"]))
    return {
        "devices": devices,
        "relationships": relationships,
        "native_control_sets": native_control_sets,
        "capacities": capacities,
        "warnings": list(dict.fromkeys(warnings)),
    }


async def _merge_managed_group_metadata(
    hass: HomeAssistant,
    groups: dict[int, dict[str, Any]],
    endpoints: Mapping[tuple[int, int], dict[str, Any]],
) -> None:
    """Overlay Studio-owned names and pending repair records onto discovery.

    A device's Groups table can take a moment to reach HA's cache after an
    AddGroup command.  The private registry prevents a successfully reviewed
    relationship from disappearing in that short window, while still using the
    physical Groups table as the source of truth for ordinary native groups.
    """
    store = get_managed_group_store(hass)
    await store.async_load()
    for record in store.list_groups():
        members = [
            dict(endpoints.get((member["node_id"], member["endpoint_id"]), _unavailable_endpoint()))
            for member in record.members
        ]
        group = groups.setdefault(
            record.group_id,
            {
                "group_id": record.group_id,
                "name": record.name,
                "members": members,
                "clusters": list(record.clusters),
                "active_relationships": 0,
                "managed_by_studio": True,
                "status": record.status,
            },
        )
        group["name"] = record.name
        group["managed_by_studio"] = True
        group["status"] = record.status
        for member in members:
            if not any(
                existing["node_id"] == member["node_id"]
                and existing["endpoint_id"] == member["endpoint_id"]
                for existing in group["members"]
            ):
                group["members"].append(member)
        group["clusters"] = sorted(set(group["clusters"]) | set(record.clusters))


def _get_matter_client(hass: HomeAssistant) -> Any | None:
    """Resolve HA's owned Matter client without opening a second connection."""
    for entry in hass.config_entries.async_entries(MATTER_DOMAIN):
        runtime_data = getattr(entry, "runtime_data", None)
        adapter = getattr(runtime_data, "adapter", None)
        client = getattr(adapter, "matter_client", None)
        if client is not None:
            return client
        client = getattr(runtime_data, "matter_client", None)
        if client is not None:
            return client

    for entry_data in (hass.data.get(MATTER_DOMAIN) or {}).values():
        client = getattr(entry_data, "matter_client", None)
        if client is not None:
            return client
        adapter = getattr(entry_data, "adapter", None)
        client = getattr(adapter, "matter_client", None)
        if client is not None:
            return client
    return None


def _build_name_index(hass: HomeAssistant) -> dict[str, dict[Any, Any]]:
    """Resolve HA's current names for node and functional endpoint presentation."""
    index: dict[str, dict[Any, Any]] = {
        "node_names": {},
        "node_areas": {},
        "endpoint_names": {},
        "endpoint_name_priorities": {},
        "endpoint_areas": {},
        "endpoint_device_names": {},
    }
    try:
        device_registry = dr.async_get(hass)
        entity_registry = er.async_get(hass)
        area_registry = ar.async_get(hass)
    except Exception as err:  # noqa: BLE001 - HA registries are optional metadata
        _LOGGER.debug("Studio could not access HA registries: %s", err)
        return index

    entities_by_device: dict[str, list[Any]] = {}
    for entity in entity_registry.entities.values():
        if entity.device_id:
            entities_by_device.setdefault(entity.device_id, []).append(entity)

    for device in device_registry.devices.values():
        parsed_identifier = next(
            (
                parsed
                for identifier in device.identifiers
                if (parsed := _parse_matter_identifier(identifier)) is not None
            ),
            None,
        )
        if parsed_identifier is None:
            continue
        node_id, bridge_root = parsed_identifier
        device_name = str(device.name_by_user or device.name or "").strip()
        area_name = None
        if device.area_id:
            area = area_registry.async_get_area(device.area_id)
            area_name = area.name if area else None

        if bridge_root is None:
            if device_name:
                index["node_names"].setdefault(node_id, device_name)
            if area_name:
                index["node_areas"].setdefault(node_id, area_name)
        else:
            endpoint_key = (node_id, bridge_root)
            if device_name:
                index["endpoint_device_names"].setdefault(endpoint_key, device_name)
            if area_name:
                index["endpoint_areas"].setdefault(endpoint_key, area_name)

        for entity in entities_by_device.get(device.id, []):
            if entity.disabled:
                continue
            endpoint_id = _endpoint_from_unique_id(
                entity.unique_id, node_id, bridge_root
            )
            if endpoint_id is None:
                continue
            priority = _entity_name_priority(entity)
            entity_name = str(entity.name or entity.original_name or "").strip()
            # HA's primary light entity can intentionally inherit its name
            # from the device and therefore have no entity/original name.
            # Prefer that functional light's device name over an Identify
            # button or a configuration number on the same Matter endpoint.
            if not entity_name and priority >= 250:
                entity_name = device_name
            if entity_name:
                _set_endpoint_name(
                    index,
                    (node_id, endpoint_id),
                    entity_name,
                    priority,
                )
            if area_name:
                index["endpoint_areas"].setdefault((node_id, endpoint_id), area_name)
    return index


def _set_endpoint_name(
    index: dict[str, dict[Any, Any]],
    endpoint_key: tuple[int, int],
    candidate: str,
    priority: int,
) -> None:
    """Keep the most meaningful HA entity label for one Matter endpoint.

    A functional light endpoint often exposes several HA entities: a light,
    identify button, start-up behaviour select, and level numbers. Registry
    iteration order must not make the identify button become its device name.
    """
    existing_priority = index["endpoint_name_priorities"].get(endpoint_key, -1)
    if priority > existing_priority:
        index["endpoint_names"][endpoint_key] = candidate
        index["endpoint_name_priorities"][endpoint_key] = priority


def _entity_name_priority(entity: Any) -> int:
    """Rank control entities above auxiliary and diagnostic entities."""
    domain = str(getattr(entity, "domain", "") or "").lower()
    if not domain:
        domain = str(getattr(entity, "entity_id", "")).split(".", maxsplit=1)[0]
    if domain in {"light", "fan", "cover", "climate", "lock", "media_player"}:
        return 300
    if domain in {"switch", "valve", "vacuum", "water_heater"}:
        return 250
    if domain in {
        "button",
        "event",
        "sensor",
        "binary_sensor",
        "number",
        "select",
        "update",
    }:
        return 100
    return 150


def _parse_matter_identifier(
    identifier: tuple[str, ...],
) -> tuple[int, int | None] | None:
    """Return Matter node ID and optional bridged-device root endpoint."""
    if len(identifier) < 2 or identifier[0] != "matter":
        return None
    match = _MATTER_IDENTIFIER_RE.match(str(identifier[1]))
    if match is None:
        return None
    suffix = match.group("suffix")
    return int(match.group("node"), 16), None if suffix == "MatterNodeDevice" else int(
        suffix
    )


def _endpoint_from_unique_id(
    unique_id: str | None, node_id: int, bridge_root: int | None
) -> int | None:
    if not unique_id:
        return None
    marker = f"-{node_id:016X}-"
    suffix_index = unique_id.upper().find(marker)
    if suffix_index == -1:
        return None
    suffix_segments = unique_id[suffix_index + len(marker) :].split("-")
    # Root Matter devices use unique IDs such as
    # ``…-000000000000000D-MatterNodeDevice-2-MatterLight-6-0``.
    # The endpoint is the first numeric segment after ``MatterNodeDevice``;
    # bridged entities keep the older numeric-leading representation.
    if suffix_segments and suffix_segments[0].casefold() == "matternodedevice":
        suffix_segments = suffix_segments[1:]

    numeric_segments: list[int] = []
    for segment in suffix_segments:
        if not segment.isdigit():
            break
        numeric_segments.append(int(segment))
    if not numeric_segments:
        return None
    if bridge_root is not None and numeric_segments[0] == bridge_root:
        return numeric_segments[1] if len(numeric_segments) > 1 else bridge_root
    return numeric_segments[0]


def _raw_endpoints(raw_node: Any) -> dict[int, Any]:
    raw_endpoints = getattr(raw_node, "endpoints", None)
    if isinstance(raw_endpoints, Mapping):
        return {
            endpoint_id: endpoint
            for key, endpoint in raw_endpoints.items()
            if (endpoint_id := _as_int(key)) is not None
        }
    if isinstance(raw_endpoints, Iterable):
        return {
            endpoint_id: endpoint
            for position, endpoint in enumerate(raw_endpoints)
            if (endpoint_id := _as_int(getattr(endpoint, "endpoint_id", position)))
            is not None
        }
    return {}


def _endpoint_clusters(
    raw_node: Any, endpoint_id: int, raw_endpoint: Any
) -> tuple[set[int], set[int]]:
    clusters = getattr(raw_endpoint, "clusters", None)
    if not isinstance(clusters, Mapping) and isinstance(raw_endpoint, Mapping):
        clusters = raw_endpoint.get("clusters")
    server_clusters = {
        cluster_id
        for key in (clusters or {})
        if (cluster_id := _as_int(key)) is not None
    }
    descriptor_server = _as_cluster_set(
        _cached_attribute(raw_node, endpoint_id, CLUSTER_DESCRIPTOR, ATTR_SERVER_LIST)
    )
    descriptor_client = _as_cluster_set(
        _cached_attribute(raw_node, endpoint_id, CLUSTER_DESCRIPTOR, ATTR_CLIENT_LIST)
    )
    return descriptor_server or server_clusters, descriptor_client


def _cached_attribute(
    raw_node: Any, endpoint_id: int, cluster_id: int, attribute_id: int
) -> Any | None:
    """Read an already-cached Matter attribute without sending a command."""
    raw_endpoint = _raw_endpoints(raw_node).get(endpoint_id)
    if raw_endpoint is not None:
        cluster = None
        get_cluster = getattr(raw_endpoint, "get_cluster", None)
        if callable(get_cluster):
            try:
                cluster = get_cluster(cluster_id)
            except Exception as err:  # noqa: BLE001 - cache shapes vary by HA release
                _LOGGER.debug("Studio could not access a cached cluster: %s", err)
        clusters = getattr(raw_endpoint, "clusters", None)
        if cluster is None and isinstance(clusters, Mapping):
            cluster = clusters.get(cluster_id)
        value = _cluster_attribute(cluster, attribute_id)
        if value is not None:
            return _unwrap(value)
        get_attribute_value = getattr(raw_endpoint, "get_attribute_value", None)
        if callable(get_attribute_value):
            try:
                value = get_attribute_value(cluster_id, attribute_id)
            except Exception as err:  # noqa: BLE001 - cache shapes vary by HA release
                _LOGGER.debug(
                    "Studio could not access a cached endpoint attribute: %s", err
                )
            else:
                if value is not None:
                    return _unwrap(value)

    for owner in (getattr(raw_node, "node_data", None), raw_node):
        attributes = getattr(owner, "attributes", None)
        if not isinstance(attributes, Mapping):
            continue
        for path, value in attributes.items():
            if _matches_attribute(path, endpoint_id, cluster_id, attribute_id):
                return _unwrap(value)
    return None


def _cluster_attribute(cluster: Any, attribute_id: int) -> Any | None:
    if cluster is None:
        return None
    get_attribute_value = getattr(cluster, "get_attribute_value", None)
    if callable(get_attribute_value):
        try:
            value = get_attribute_value(attribute_id)
        except Exception as err:  # noqa: BLE001 - cached values are optional
            _LOGGER.debug("Studio could not access a cached cluster value: %s", err)
        else:
            if value is not None:
                return value
    if isinstance(cluster, Mapping):
        return _mapping_value(cluster, attribute_id)
    attributes = getattr(cluster, "attributes", None)
    if isinstance(attributes, Mapping):
        return _mapping_value(attributes, attribute_id)
    return None


def _matches_attribute(
    path: Any, endpoint_id: int, cluster_id: int, attribute_id: int
) -> bool:
    endpoint = _as_int(getattr(path, "EndpointId", getattr(path, "endpoint_id", None)))
    cluster = _as_int(getattr(path, "ClusterId", getattr(path, "cluster_id", None)))
    attribute = _as_int(
        getattr(path, "AttributeId", getattr(path, "attribute_id", None))
    )
    if endpoint is not None and cluster is not None and attribute is not None:
        return (endpoint, cluster, attribute) == (endpoint_id, cluster_id, attribute_id)
    return str(path) == f"{endpoint_id}/{cluster_id}/{attribute_id}"


async def _async_read_bindings(
    client: Any, raw_node: Any, node_id: int, endpoint_id: int
) -> tuple[list[dict[str, int | None]], bool]:
    cached = _cached_attribute(raw_node, endpoint_id, CLUSTER_BINDING, ATTR_BINDING)
    if cached is not None:
        return _parse_bindings(cached), False

    attribute_path = f"{endpoint_id}/{CLUSTER_BINDING}/{ATTR_BINDING}"
    try:
        value = await client.read_attribute(
            node_id=node_id, attribute_path=attribute_path
        )
    except Exception as err:  # noqa: BLE001 - one unavailable device must not hide others
        _LOGGER.debug("Studio binding read was unavailable: %s", err)
        return [], True
    if isinstance(value, Mapping):
        value = value.get(attribute_path, value)
    return _parse_bindings(_unwrap(value)), False


def _parse_bindings(value: Any) -> list[dict[str, int | None]]:
    value = _unwrap(value)
    if not isinstance(value, list):
        return []
    parsed: list[dict[str, int | None]] = []
    for entry in value:
        group_id = _field_int(
            entry, ("Group", "group", "GroupId", "groupId", "group_id", 2)
        )
        node_id = _field_int(entry, ("Node", "node", "NodeId", "nodeId", "node_id", 1))
        endpoint_id = _field_int(
            entry,
            ("Endpoint", "endpoint", "EndpointId", "endpointId", "endpoint_id", 3),
        )
        cluster_id = _field_int(
            entry, ("Cluster", "cluster", "ClusterId", "clusterId", "cluster_id", 4)
        )
        if cluster_id is None or (group_id is None and node_id is None):
            continue
        parsed.append(
            {
                "target_group_id": group_id,
                "target_node_id": node_id,
                "target_endpoint_id": endpoint_id,
                "cluster_id": cluster_id,
            }
        )
    return parsed


def _add_cached_group_memberships(
    groups: dict[int, dict[str, Any]],
    raw_node: Any,
    endpoint_id: int,
    endpoint: dict[str, Any],
) -> None:
    """Merge the endpoint's cached Groups cluster table into a native set view."""
    entries = _cached_attribute(raw_node, endpoint_id, CLUSTER_GROUPS, ATTR_GROUP_TABLE)
    if not isinstance(entries, list):
        return
    for entry in entries:
        group_id = _field_int(entry, ("GroupID", "groupID", "group_id", "group", 0))
        if group_id is None:
            continue
        name = _field_text(entry, ("GroupName", "groupName", "group_name", "name", 1))
        group = groups.setdefault(
            group_id,
            {
                "group_id": group_id,
                "name": name or "Native control set",
                "members": [],
                "clusters": [],
                "active_relationships": 0,
                "managed_by_studio": False,
            },
        )
        member = dict(endpoint)
        if not any(
            existing["node_id"] == member["node_id"]
            and existing["endpoint_id"] == member["endpoint_id"]
            for existing in group["members"]
        ):
            group["members"].append(member)
        group["clusters"] = sorted(set(group["clusters"]) | set(member["capabilities"]))


def _relationships_from_bindings(
    bindings_by_source: Mapping[tuple[int, int], list[dict[str, int | None]]],
    endpoints: Mapping[tuple[int, int], dict[str, Any]],
    groups: Mapping[int, dict[str, Any]],
) -> list[dict[str, Any]]:
    relationship_map: dict[tuple[Any, ...], dict[str, Any]] = {}
    for source_key, bindings in bindings_by_source.items():
        source = endpoints.get(source_key)
        if source is None:
            continue
        for binding in bindings:
            target_group_id = binding["target_group_id"]
            if target_group_id is not None:
                group = groups.get(target_group_id)
                target = {
                    "kind": "group",
                    "group_id": target_group_id,
                    "name": group["name"] if group else "Unavailable native group",
                    "members": group["members"] if group else [],
                }
                route = "native_group"
                key = (*source_key, "group", target_group_id)
            else:
                target_key = (
                    binding["target_node_id"],
                    binding["target_endpoint_id"],
                )
                endpoint = endpoints.get(target_key, _unavailable_endpoint())
                target = {
                    "kind": "endpoint",
                    "name": endpoint["name"],
                    "members": [endpoint],
                }
                route = "direct"
                key = (*source_key, "endpoint", *target_key)
            relationship = relationship_map.setdefault(
                key,
                {
                    "id": "-".join(str(part) for part in key),
                    "source": source,
                    "targets": target,
                    "route": route,
                    "clusters": [],
                },
            )
            relationship["clusters"].append(binding["cluster_id"])

    relationships = list(relationship_map.values())
    for relationship in relationships:
        relationship["clusters"] = sorted(set(relationship["clusters"]))
    relationships.sort(key=lambda item: (item["source"]["name"], item["id"]))
    return relationships


def _group_capacity(raw_node: Any, node_id: int, name: str) -> dict[str, Any]:
    """Return cached Group Key Management limits without exposing key material."""
    group_map = _cached_attribute(
        raw_node, 0, CLUSTER_GROUP_KEY_MANAGEMENT, ATTR_GROUP_KEY_MAP
    )
    group_table = _cached_attribute(
        raw_node, 0, CLUSTER_GROUP_KEY_MANAGEMENT, ATTR_GROUP_TABLE
    )
    max_groups = _as_int(
        _cached_attribute(
            raw_node,
            0,
            CLUSTER_GROUP_KEY_MANAGEMENT,
            ATTR_MAX_GROUPS_PER_FABRIC,
        )
    )
    max_keys = _as_int(
        _cached_attribute(
            raw_node,
            0,
            CLUSTER_GROUP_KEY_MANAGEMENT,
            ATTR_MAX_GROUP_KEYS_PER_FABRIC,
        )
    )
    group_map_count = _entry_count(group_map)
    group_table_count = _entry_count(group_table)
    return {
        "node_id": node_id,
        "name": name,
        "max_groups_per_fabric": max_groups,
        "max_group_keys_per_fabric": max_keys,
        "group_table_entries": group_table_count,
        "group_key_map_entries": group_map_count,
        "available_group_slots": _remaining_capacity(max_groups, group_table_count),
        "available_group_key_slots": _remaining_capacity(max_keys, group_map_count),
        "status": "available"
        if max_groups is not None or max_keys is not None
        else "unavailable",
    }


def _endpoint_name(
    names: Mapping[str, Mapping[Any, Any]],
    node_id: int,
    endpoint_id: int,
    node_name: str,
) -> str:
    key = (node_id, endpoint_id)
    return (
        names["endpoint_names"].get(key)
        or names["endpoint_device_names"].get(key)
        or node_name
    )


def _endpoint_area(
    names: Mapping[str, Mapping[Any, Any]], node_id: int, endpoint_id: int
) -> str | None:
    return names["endpoint_areas"].get(
        (node_id, endpoint_id), names["node_areas"].get(node_id)
    )


def _raw_node_name(raw_node: Any) -> str:
    name = str(getattr(raw_node, "name", "") or "").strip()
    if name:
        return name
    device_info = getattr(raw_node, "device_info", None)
    for field in ("node_label", "nodeLabel", "product_name", "productName"):
        value = str(getattr(device_info, field, "") or "").strip()
        if value:
            return value
    return "Unnamed Matter device"


def _unavailable_endpoint() -> dict[str, Any]:
    return {
        "node_id": None,
        "endpoint_id": None,
        "node_name": "Unavailable Matter node",
        "name": "Unavailable Matter endpoint",
        "area_name": None,
        "capabilities": [],
        "client_capabilities": [],
        "server_capabilities": [],
        "can_bind": False,
        "can_be_target": False,
    }


def _empty_snapshot(warning: str) -> dict[str, Any]:
    return {
        "devices": [],
        "relationships": [],
        "native_control_sets": [],
        "capacities": [],
        "warnings": [warning],
    }


def _as_cluster_set(value: Any) -> set[int]:
    value = _unwrap(value)
    if not isinstance(value, (list, tuple, set)):
        return set()
    return {item for raw in value if (item := _as_int(raw)) is not None}


def _mapping_value(mapping: Mapping[Any, Any], key: int) -> Any | None:
    for candidate in (key, str(key)):
        if candidate in mapping:
            return mapping[candidate]
    return None


def _field_int(entry: Any, names: tuple[str | int, ...]) -> int | None:
    value = _field_value(entry, names)
    return _as_int(value)


def _field_text(entry: Any, names: tuple[str | int, ...]) -> str | None:
    value = _field_value(entry, names)
    if isinstance(value, str) and value.strip():
        return value.strip()
    return None


def _field_value(entry: Any, names: tuple[str | int, ...]) -> Any | None:
    if isinstance(entry, Mapping):
        for name in names:
            if name in entry:
                return _unwrap(entry[name])
            string_name = str(name)
            if string_name in entry:
                return _unwrap(entry[string_name])
        return None
    for name in names:
        if isinstance(name, str) and hasattr(entry, name):
            return _unwrap(getattr(entry, name))
    return None


def _unwrap(value: Any) -> Any:
    if isinstance(value, Mapping) and "value" in value:
        return value["value"]
    return value


def _as_int(value: Any) -> int | None:
    value = _unwrap(value)
    if isinstance(value, bool):
        return None
    try:
        return int(value) if value is not None else None
    except (TypeError, ValueError):
        return None


def _entry_count(value: Any) -> int | None:
    value = _unwrap(value)
    if isinstance(value, (list, tuple, set, Mapping)):
        return len(value)
    return None


def _remaining_capacity(maximum: int | None, used: int | None) -> int | None:
    if maximum is None or used is None:
        return None
    return max(maximum - used, 0)
