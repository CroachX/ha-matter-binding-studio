"""Matter Binding Studio Home Assistant integration."""

from __future__ import annotations

from homeassistant.components import frontend, panel_custom
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN, PANEL_ICON, PANEL_NAME, PANEL_TITLE


async def async_setup(hass: HomeAssistant, _config: dict) -> bool:
    """Set up the integration namespace."""
    hass.data.setdefault(DOMAIN, {})
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up one Studio config entry."""
    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = {}
    await _async_register_panel(hass)

    from . import api

    await api.async_setup(hass)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload the Studio panel."""
    frontend.async_remove_panel(hass, PANEL_NAME)
    hass.data[DOMAIN].pop(entry.entry_id, None)
    return True


async def _async_register_panel(hass: HomeAssistant) -> None:
    """Register the administrator-only Studio panel and its static bundle."""
    from homeassistant.components.http import StaticPathConfig

    try:
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(
                    url_path=f"/{DOMAIN}/frontend",
                    path=hass.config.path(f"custom_components/{DOMAIN}/frontend"),
                    cache_headers=False,
                )
            ]
        )
    except RuntimeError:
        # A config-entry reload can re-register an unchanged static path.
        pass

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
