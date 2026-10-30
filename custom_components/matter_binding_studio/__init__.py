"""Matter Binding Studio Home Assistant integration."""

from __future__ import annotations

from homeassistant.components import frontend, panel_custom
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from . import api
from .const import DOMAIN, PANEL_ICON, PANEL_NAME, PANEL_TITLE


async def async_setup(hass: HomeAssistant, _config: dict) -> bool:
    """Set up the integration namespace."""
    hass.data.setdefault(DOMAIN, {})
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up one Studio config entry."""
    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = {}
    await _async_register_panel(hass)

    await api.async_setup(hass)
    hass.data[DOMAIN]["_entry_active"] = True
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload the Studio panel."""
    frontend.async_remove_panel(hass, PANEL_NAME)
    hass.data[DOMAIN]["_entry_active"] = False
    hass.data[DOMAIN].pop("_pending_write_plans", None)
    hass.data[DOMAIN].pop(entry.entry_id, None)
    return True


async def _async_register_panel(hass: HomeAssistant) -> None:
    """Register the administrator-only Studio panel and its static bundle."""
    from homeassistant.components.http import StaticPathConfig

    if not hass.data[DOMAIN].get("_static_registered"):
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(
                    url_path=f"/{DOMAIN}/frontend",
                    path=hass.config.path(f"custom_components/{DOMAIN}/frontend"),
                    cache_headers=False,
                )
            ]
        )
        hass.data[DOMAIN]["_static_registered"] = True

    await panel_custom.async_register_panel(
        hass,
        webcomponent_name=PANEL_NAME,
        frontend_url_path=PANEL_NAME,
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        module_url=f"/{DOMAIN}/frontend/matter-binding-studio-panel.js",
        embed_iframe=False,
        require_admin=True,
    )
