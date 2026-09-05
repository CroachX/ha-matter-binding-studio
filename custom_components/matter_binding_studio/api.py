"""WebSocket API for Matter Binding Studio's read and reviewed write flows."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

from .const import (
    WS_TYPE_APPLY_GROUPCAST,
    WS_TYPE_APPLY_REMOVE_BINDING,
    DOMAIN,
    WS_TYPE_APPLY_UNICAST,
    WS_TYPE_GET_SNAPSHOT,
    WS_TYPE_PREPARE_GROUPCAST,
    WS_TYPE_PREPARE_REMOVE_BINDING,
    WS_TYPE_PREPARE_UNICAST,
)
from .matter import async_get_snapshot
from .writer import (
    StudioWriteError,
    async_apply_groupcast,
    async_apply_remove_binding,
    async_apply_unicast,
    async_prepare_groupcast,
    async_prepare_remove_binding,
    async_prepare_unicast,
)


async def async_setup(hass: HomeAssistant) -> None:
    """Register Studio WebSocket commands once for this HA instance."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    if domain_data.get("_ws_registered"):
        return
    websocket_api.async_register_command(hass, ws_get_snapshot)
    websocket_api.async_register_command(hass, ws_prepare_unicast)
    websocket_api.async_register_command(hass, ws_apply_unicast)
    websocket_api.async_register_command(hass, ws_prepare_groupcast)
    websocket_api.async_register_command(hass, ws_apply_groupcast)
    websocket_api.async_register_command(hass, ws_prepare_remove_binding)
    websocket_api.async_register_command(hass, ws_apply_remove_binding)
    domain_data["_ws_registered"] = True


@websocket_api.websocket_command({vol.Required("type"): WS_TYPE_GET_SNAPSHOT})
@websocket_api.async_response
async def ws_get_snapshot(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return a native-Matter read model without changing the fabric."""
    connection.send_result(msg["id"], await async_get_snapshot(hass))


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_PREPARE_UNICAST,
        vol.Required("source_node_id"): vol.Coerce(int),
        vol.Required("source_endpoint_id"): vol.Coerce(int),
        vol.Required("target_node_id"): vol.Coerce(int),
        vol.Required("target_endpoint_id"): vol.Coerce(int),
        vol.Required("clusters"): vol.All([vol.Coerce(int)], vol.Length(min=1, max=3)),
    }
)
@websocket_api.async_response
async def ws_prepare_unicast(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Build an admin-reviewed native unicast write plan."""
    if not _is_admin(connection):
        connection.send_error(
            msg["id"], "forbidden", "Matter Binding Studio is admin-only."
        )
        return
    try:
        plan = await async_prepare_unicast(
            hass,
            source_node_id=msg["source_node_id"],
            source_endpoint_id=msg["source_endpoint_id"],
            target_node_id=msg["target_node_id"],
            target_endpoint_id=msg["target_endpoint_id"],
            clusters=msg["clusters"],
        )
    except StudioWriteError as err:
        connection.send_error(msg["id"], "plan_failed", str(err))
        return
    connection.send_result(msg["id"], plan)


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_APPLY_UNICAST,
        vol.Required("plan_id"): str,
        vol.Required("confirm"): True,
    }
)
@websocket_api.async_response
async def ws_apply_unicast(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Execute one reviewed admin-confirmed native unicast plan."""
    if not _is_admin(connection):
        connection.send_error(
            msg["id"], "forbidden", "Matter Binding Studio is admin-only."
        )
        return
    try:
        result = await async_apply_unicast(hass, plan_id=msg["plan_id"])
    except StudioWriteError as err:
        connection.send_error(msg["id"], "write_failed", str(err))
        return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_PREPARE_GROUPCAST,
        vol.Required("source_node_id"): vol.Coerce(int),
        vol.Required("source_endpoint_id"): vol.Coerce(int),
        vol.Required("targets"): vol.All(
            [
                {
                    vol.Required("node_id"): vol.Coerce(int),
                    vol.Required("endpoint_id"): vol.Coerce(int),
                }
            ],
            vol.Length(min=2, max=32),
        ),
        vol.Required("clusters"): vol.All([vol.Coerce(int)], vol.Length(min=1, max=3)),
    }
)
@websocket_api.async_response
async def ws_prepare_groupcast(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Build an admin-reviewed automatic native groupcast plan."""
    if not _is_admin(connection):
        connection.send_error(
            msg["id"], "forbidden", "Matter Binding Studio is admin-only."
        )
        return
    try:
        plan = await async_prepare_groupcast(
            hass,
            source_node_id=msg["source_node_id"],
            source_endpoint_id=msg["source_endpoint_id"],
            targets=msg["targets"],
            clusters=msg["clusters"],
        )
    except StudioWriteError as err:
        connection.send_error(msg["id"], "plan_failed", str(err))
        return
    connection.send_result(msg["id"], plan)


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_APPLY_GROUPCAST,
        vol.Required("plan_id"): str,
        vol.Required("confirm"): True,
    }
)
@websocket_api.async_response
async def ws_apply_groupcast(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Apply one reviewed automatic native groupcast plan."""
    if not _is_admin(connection):
        connection.send_error(
            msg["id"], "forbidden", "Matter Binding Studio is admin-only."
        )
        return
    try:
        result = await async_apply_groupcast(hass, plan_id=msg["plan_id"])
    except StudioWriteError as err:
        connection.send_error(msg["id"], "write_failed", str(err))
        return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_PREPARE_REMOVE_BINDING,
        vol.Required("source_node_id"): vol.Coerce(int),
        vol.Required("source_endpoint_id"): vol.Coerce(int),
        vol.Required("target_kind"): vol.In(("endpoint", "group")),
        vol.Optional("target_node_id"): vol.Coerce(int),
        vol.Optional("target_endpoint_id"): vol.Coerce(int),
        vol.Optional("target_group_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
async def ws_prepare_remove_binding(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Build an admin-reviewed plan that removes one native relationship."""
    if not _is_admin(connection):
        connection.send_error(
            msg["id"], "forbidden", "Matter Binding Studio is admin-only."
        )
        return
    try:
        plan = await async_prepare_remove_binding(
            hass,
            source_node_id=msg["source_node_id"],
            source_endpoint_id=msg["source_endpoint_id"],
            target_kind=msg["target_kind"],
            target_node_id=msg.get("target_node_id"),
            target_endpoint_id=msg.get("target_endpoint_id"),
            target_group_id=msg.get("target_group_id"),
        )
    except StudioWriteError as err:
        connection.send_error(msg["id"], "plan_failed", str(err))
        return
    connection.send_result(msg["id"], plan)


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_APPLY_REMOVE_BINDING,
        vol.Required("plan_id"): str,
        vol.Required("confirm"): True,
    }
)
@websocket_api.async_response
async def ws_apply_remove_binding(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Apply a reviewed deletion and return its Binding-table readback result."""
    if not _is_admin(connection):
        connection.send_error(
            msg["id"], "forbidden", "Matter Binding Studio is admin-only."
        )
        return
    try:
        result = await async_apply_remove_binding(hass, plan_id=msg["plan_id"])
    except StudioWriteError as err:
        connection.send_error(msg["id"], "write_failed", str(err))
        return
    connection.send_result(msg["id"], result)


def _is_admin(connection: websocket_api.ActiveConnection) -> bool:
    """Keep write commands protected even if called outside the sidebar panel."""
    user = getattr(connection, "user", None)
    return bool(getattr(user, "is_admin", False))
