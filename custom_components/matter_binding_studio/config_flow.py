"""Config flow for Matter Binding Studio."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components.matter import DOMAIN as MATTER_DOMAIN
from homeassistant.config_entries import ConfigFlow, ConfigFlowResult

from .const import DOMAIN


class MatterBindingStudioConfigFlow(ConfigFlow, domain=DOMAIN):
    """Configure the single administrator-facing Studio panel."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Create the Studio entry after Matter is configured."""
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if not self.hass.config_entries.async_entries(MATTER_DOMAIN):
            return self.async_abort(reason="matter_not_configured")

        if user_input is not None:
            return self.async_create_entry(title="Matter Binding Studio", data={})

        return self.async_show_form(step_id="user", data_schema=vol.Schema({}))
