"""WebSocket API for Matter Binding Studio's read and reviewed write flows."""

from __future__ import annotations

import logging
from contextvars import ContextVar
from functools import wraps
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

from .const import (
    DOMAIN,
    WS_TYPE_APPLY_CLEANUP_GROUP,
    WS_TYPE_APPLY_GROUPCAST,
    WS_TYPE_APPLY_REMOVE_ACL,
    WS_TYPE_APPLY_REMOVE_BINDING,
    WS_TYPE_APPLY_UNICAST,
    WS_TYPE_GET_ACL_OVERVIEW,
    WS_TYPE_GET_SNAPSHOT,
    WS_TYPE_PREPARE_CLEANUP_GROUP,
    WS_TYPE_PREPARE_GROUPCAST,
    WS_TYPE_PREPARE_REMOVE_ACL,
    WS_TYPE_PREPARE_REMOVE_BINDING,
    WS_TYPE_PREPARE_UNICAST,
)
from .messages import message, wire_payload, LocalizedMessage

from .matter import async_get_snapshot
from . import bulk
from .diagnostics import async_get_config_entry_diagnostics
from .support_data import operation_summary, snapshot_summary
from .writer import (
    StudioWriteError,
    async_apply_cleanup_group,
    async_apply_groupcast,
    async_apply_remove_acl,
    async_apply_remove_binding,
    async_apply_unicast,
    async_get_acl_overview,
    async_prepare_cleanup_group,
    async_prepare_groupcast,
    async_prepare_remove_acl,
    async_prepare_remove_binding,
    async_prepare_unicast,
)

_LOGGER = logging.getLogger(__name__)
_OPERATION_CONTEXT = ContextVar("studio_support_operation", default=None)


def _require_active_admin(handler):
    """Protect every command, including reads and calls after entry unload."""
    @wraps(handler)
    async def guarded(hass, connection, msg):
        if not _is_admin(connection):
            _send_error(connection, msg["id"], "forbidden", message("admin_only"))
            return
        if not hass.data.get(DOMAIN, {}).get("_entry_active"):
            _send_error(connection, msg["id"], "not_loaded", message("studio_not_loaded"))
            return
        token = _OPERATION_CONTEXT.set((hass, msg["type"].removeprefix(f"{DOMAIN}/")))
        try:
            await handler(hass, connection, msg)
        finally:
            _OPERATION_CONTEXT.reset(token)
    return guarded


def _record_outcome(**kwargs):
    context = _OPERATION_CONTEXT.get()
    if context is None:
        return
    hass, operation = context
    try:
        record = operation_summary(operation, **kwargs)
    except Exception:  # Diagnostics must never turn an applied write into an error.
        _LOGGER.debug("Studio support summary unavailable")
        return
    if record is not None:
        history = hass.data[DOMAIN].setdefault("_support_operations", [])
        history.append(record)
        del history[:-10]


async def async_setup(hass: HomeAssistant) -> None:
    """Register Studio WebSocket commands once for this HA instance."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    if domain_data.get("_ws_registered"):
        return
    websocket_api.async_register_command(hass, ws_get_snapshot)
    websocket_api.async_register_command(hass, ws_get_diagnostics)
    websocket_api.async_register_command(hass, ws_get_acl_overview)
    websocket_api.async_register_command(hass, ws_prepare_remove_acl)
    websocket_api.async_register_command(hass, ws_apply_remove_acl)
    websocket_api.async_register_command(hass, ws_prepare_cleanup_group)
    websocket_api.async_register_command(hass, ws_apply_cleanup_group)
    websocket_api.async_register_command(hass, ws_prepare_unicast)
    websocket_api.async_register_command(hass, ws_apply_unicast)
    websocket_api.async_register_command(hass, ws_prepare_groupcast)
    websocket_api.async_register_command(hass, ws_apply_groupcast)
    websocket_api.async_register_command(hass, ws_prepare_remove_binding)
    websocket_api.async_register_command(hass, ws_apply_remove_binding)
    websocket_api.async_register_command(hass, ws_prepare_bulk_remove)
    websocket_api.async_register_command(hass, ws_apply_bulk_remove)
    domain_data["_ws_registered"] = True


def _send_result(connection, message_id, result):
    payload = wire_payload(result)
    _record_outcome(result=payload)
    connection.send_result(message_id, payload)


def _send_error(connection, message_id, code, value):
    if isinstance(value, StudioWriteError):
        value = value.args[0]
    error = {"code": code, "message": str(value)}
    if isinstance(value, LocalizedMessage):
        error["studio_message"] = value.descriptor
    _record_outcome(error=error)
    connection.send_message({"id": message_id, "type": "result", "success": False, "error": error})


def _send_matter_operation_error(
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    *,
    operation: str,
    err: Exception,
) -> None:
    """Avoid leaking a raw Matter stack trace into an operator-facing panel."""
    _LOGGER.warning("Studio %s failed: %s", operation, err)
    _send_error(connection,
        msg["id"],
        "matter_operation_failed",
        message("operation_failed"),
    )


@websocket_api.websocket_command({vol.Required("type"): WS_TYPE_GET_SNAPSHOT})
@websocket_api.async_response
@_require_active_admin
async def ws_get_snapshot(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return a native-Matter read model without changing the fabric."""
    snapshot = await async_get_snapshot(hass)
    try:
        hass.data[DOMAIN]["_support_snapshot"] = snapshot_summary(snapshot)
    except Exception:
        hass.data[DOMAIN].pop("_support_snapshot", None)
        _LOGGER.debug("Studio support snapshot unavailable")
    _send_result(connection, msg["id"], snapshot)


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/get_diagnostics"})
@websocket_api.async_response
@_require_active_admin
async def ws_get_diagnostics(hass, connection, msg):
    """Export only sanitized cached data, never the raw Matter fabric."""
    _send_result(connection, msg["id"], await async_get_config_entry_diagnostics(hass))


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_GET_ACL_OVERVIEW,
        vol.Required("target_node_id"): vol.Coerce(int),
        vol.Required("target_endpoint_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
@_require_active_admin
async def ws_get_acl_overview(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Read one selected target's ACL without changing the Matter fabric."""
    if not _is_admin(connection):
        _send_error(connection,
            msg["id"], "forbidden", message("admin_only")
        )
        return
    try:
        overview = await async_get_acl_overview(
            hass,
            target_node_id=msg["target_node_id"],
            target_endpoint_id=msg["target_endpoint_id"],
        )
    except StudioWriteError as err:
        _send_error(connection, msg["id"], "acl_read_failed", err)
        return
    except Exception as err:  # noqa: BLE001 - preserve a safe operator-facing error
        _send_matter_operation_error(connection, msg, operation="ACL read", err=err)
        return
    _send_result(connection, msg["id"], overview)


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_PREPARE_REMOVE_ACL,
        vol.Required("target_node_id"): vol.Coerce(int),
        vol.Required("target_endpoint_id"): vol.Coerce(int),
        vol.Optional("entry_index"): vol.Coerce(int),
        vol.Optional("entry_indexes"): [vol.Coerce(int)],
    }
)
@websocket_api.async_response
@_require_active_admin
async def ws_prepare_remove_acl(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Create a reviewed plan for reclaiming selected unused ACL entries."""
    if not _is_admin(connection):
        _send_error(connection, msg["id"], "forbidden", message("admin_only"))
        return
    try:
        plan = await async_prepare_remove_acl(
            hass,
            target_node_id=msg["target_node_id"],
            target_endpoint_id=msg["target_endpoint_id"],
            entry_index=msg.get("entry_index"),
            entry_indexes=msg.get("entry_indexes"),
        )
    except StudioWriteError as err:
        _send_error(connection, msg["id"], "plan_failed", err)
        return
    except Exception as err:  # noqa: BLE001 - preserve a safe operator-facing error
        _send_matter_operation_error(connection, msg, operation="ACL reclaim planning", err=err)
        return
    _send_result(connection, msg["id"], plan)


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_APPLY_REMOVE_ACL,
        vol.Required("plan_id"): str,
        vol.Required("confirm"): True,
    }
)
@websocket_api.async_response
@_require_active_admin
async def ws_apply_remove_acl(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Apply one reviewed ACL reclaim plan and verify the full table."""
    if not _is_admin(connection):
        _send_error(connection, msg["id"], "forbidden", message("admin_only"))
        return
    try:
        result = await async_apply_remove_acl(hass, plan_id=msg["plan_id"])
    except StudioWriteError as err:
        _send_error(connection, msg["id"], "write_failed", err)
        return
    except Exception as err:  # noqa: BLE001 - preserve a safe operator-facing error
        _send_matter_operation_error(connection, msg, operation="ACL reclaim", err=err)
        return
    _send_result(connection, msg["id"], result)


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_PREPARE_CLEANUP_GROUP,
        vol.Required("group_id"): vol.Coerce(int),
    }
)
@websocket_api.async_response
@_require_active_admin
async def ws_prepare_cleanup_group(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Review cleanup for one idle Studio-owned native group."""
    if not _is_admin(connection):
        _send_error(connection, msg["id"], "forbidden", message("admin_only"))
        return
    try:
        plan = await async_prepare_cleanup_group(hass, group_id=msg["group_id"])
    except StudioWriteError as err:
        _send_error(connection, msg["id"], "plan_failed", err)
        return
    except Exception as err:  # noqa: BLE001 - preserve a safe operator-facing error
        _send_matter_operation_error(connection, msg, operation="group cleanup planning", err=err)
        return
    _send_result(connection, msg["id"], plan)


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_APPLY_CLEANUP_GROUP,
        vol.Required("plan_id"): str,
        vol.Required("confirm"): True,
    }
)
@websocket_api.async_response
@_require_active_admin
async def ws_apply_cleanup_group(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Apply a reviewed idle native-group cleanup transaction."""
    if not _is_admin(connection):
        _send_error(connection, msg["id"], "forbidden", message("admin_only"))
        return
    try:
        result = await async_apply_cleanup_group(hass, plan_id=msg["plan_id"])
    except StudioWriteError as err:
        _send_error(connection, msg["id"], "write_failed", err)
        return
    except Exception as err:  # noqa: BLE001 - preserve a safe operator-facing error
        _send_matter_operation_error(connection, msg, operation="group cleanup", err=err)
        return
    _send_result(connection, msg["id"], result)


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
@_require_active_admin
async def ws_prepare_unicast(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Build an admin-reviewed native unicast write plan."""
    if not _is_admin(connection):
        _send_error(connection,
            msg["id"], "forbidden", message("admin_only")
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
        _send_error(connection, msg["id"], "plan_failed", err)
        return
    except Exception as err:  # noqa: BLE001 - preserve a safe operator-facing error
        _send_matter_operation_error(connection, msg, operation="Binding planning", err=err)
        return
    _send_result(connection, msg["id"], plan)


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_APPLY_UNICAST,
        vol.Required("plan_id"): str,
        vol.Required("confirm"): True,
    }
)
@websocket_api.async_response
@_require_active_admin
async def ws_apply_unicast(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Execute one reviewed admin-confirmed native unicast plan."""
    if not _is_admin(connection):
        _send_error(connection,
            msg["id"], "forbidden", message("admin_only")
        )
        return
    try:
        result = await async_apply_unicast(hass, plan_id=msg["plan_id"])
    except StudioWriteError as err:
        _send_error(connection, msg["id"], "write_failed", err)
        return
    except Exception as err:  # noqa: BLE001 - preserve a safe operator-facing error
        _send_matter_operation_error(connection, msg, operation="Binding write", err=err)
        return
    _send_result(connection, msg["id"], result)


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
@_require_active_admin
async def ws_prepare_groupcast(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Build an admin-reviewed automatic native groupcast plan."""
    if not _is_admin(connection):
        _send_error(connection,
            msg["id"], "forbidden", message("admin_only")
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
        _send_error(connection, msg["id"], "plan_failed", err)
        return
    except Exception as err:  # noqa: BLE001 - preserve a safe operator-facing error
        _send_matter_operation_error(connection, msg, operation="group Binding planning", err=err)
        return
    _send_result(connection, msg["id"], plan)


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_APPLY_GROUPCAST,
        vol.Required("plan_id"): str,
        vol.Required("confirm"): True,
    }
)
@websocket_api.async_response
@_require_active_admin
async def ws_apply_groupcast(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Apply one reviewed automatic native groupcast plan."""
    if not _is_admin(connection):
        _send_error(connection,
            msg["id"], "forbidden", message("admin_only")
        )
        return
    try:
        result = await async_apply_groupcast(hass, plan_id=msg["plan_id"])
    except StudioWriteError as err:
        _send_error(connection, msg["id"], "write_failed", err)
        return
    except Exception as err:  # noqa: BLE001 - preserve a safe operator-facing error
        _send_matter_operation_error(connection, msg, operation="group Binding write", err=err)
        return
    _send_result(connection, msg["id"], result)


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
@_require_active_admin
async def ws_prepare_remove_binding(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Build an admin-reviewed plan that removes one native relationship."""
    if not _is_admin(connection):
        _send_error(connection,
            msg["id"], "forbidden", message("admin_only")
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
        _send_error(connection, msg["id"], "plan_failed", err)
        return
    except Exception as err:  # noqa: BLE001 - preserve a safe operator-facing error
        _send_matter_operation_error(connection, msg, operation="Binding removal planning", err=err)
        return
    _send_result(connection, msg["id"], plan)


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_APPLY_REMOVE_BINDING,
        vol.Required("plan_id"): str,
        vol.Required("confirm"): True,
    }
)
@websocket_api.async_response
@_require_active_admin
async def ws_apply_remove_binding(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Apply a reviewed deletion and return its Binding-table readback result."""
    if not _is_admin(connection):
        _send_error(connection,
            msg["id"], "forbidden", message("admin_only")
        )
        return
    try:
        result = await async_apply_remove_binding(hass, plan_id=msg["plan_id"])
    except StudioWriteError as err:
        _send_error(connection, msg["id"], "write_failed", err)
        return
    except Exception as err:  # noqa: BLE001 - preserve a safe operator-facing error
        _send_matter_operation_error(connection, msg, operation="Binding removal", err=err)
        return
    _send_result(connection, msg["id"], result)


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/prepare_bulk_remove_bindings",
    vol.Required("relationship_ids"): vol.All([str], vol.Length(min=1, max=200)),
})
@websocket_api.async_response
@_require_active_admin
async def ws_prepare_bulk_remove(hass, connection, msg):
    if not _is_admin(connection):
        _send_error(connection, msg["id"], "forbidden", message("admin_only"))
        return
    try:
        result = await bulk.prepare(hass, msg["relationship_ids"])
    except StudioWriteError as err:
        _send_error(connection, msg["id"], "plan_failed", err)
        return
    except Exception as err:
        _send_matter_operation_error(connection, msg, operation="bulk removal planning", err=err)
        return
    _send_result(connection, msg["id"], result)


@websocket_api.websocket_command({
    vol.Required("type"): f"{DOMAIN}/apply_bulk_remove_bindings",
    vol.Required("plan_id"): str,
    vol.Required("confirm"): True,
})
@websocket_api.async_response
@_require_active_admin
async def ws_apply_bulk_remove(hass, connection, msg):
    if not _is_admin(connection):
        _send_error(connection, msg["id"], "forbidden", message("admin_only"))
        return
    try:
        result = await bulk.apply(hass, msg["plan_id"])
    except StudioWriteError as err:
        _send_error(connection, msg["id"], "write_failed", err)
        return
    except Exception as err:
        _send_matter_operation_error(connection, msg, operation="bulk removal", err=err)
        return
    _send_result(connection, msg["id"], result)


def _is_admin(connection: websocket_api.ActiveConnection) -> bool:
    """Keep write commands protected even if called outside the sidebar panel."""
    user = getattr(connection, "user", None)
    return bool(getattr(user, "is_admin", False))
