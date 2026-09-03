"""WebSocket API for the read-only Matter Binding Studio."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

from .const import DOMAIN, WS_TYPE_GET_SNAPSHOT
from .matter import async_get_snapshot


async def async_setup(hass: HomeAssistant) -> None:
    """Register Studio WebSocket commands once for this HA instance."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    if domain_data.get("_ws_registered"):
        return
    websocket_api.async_register_command(hass, ws_get_snapshot)
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
