"""Real HA runtime/WS tests. Matter transport is mocked; no household I/O."""
import json
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest
from homeassistant.components import frontend
from homeassistant.config_entries import SOURCE_USER
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components import matter_binding_studio as studio
from custom_components.matter_binding_studio import api
from custom_components.matter_binding_studio import diagnostics
from custom_components.matter_binding_studio.messages import message
from custom_components.matter_binding_studio.acl_store import ACLProvenanceStore
from custom_components.matter_binding_studio.group_store import ManagedGroupStore, ManagedGroup
from custom_components.matter_binding_studio.const import DOMAIN, PANEL_NAME

pytestmark = pytest.mark.asyncio


def requests():
    """Valid requests reach authorization instead of failing schema validation."""
    source = {"source_node_id": 1, "source_endpoint_id": 1}
    target = {"target_node_id": 2, "target_endpoint_id": 1}
    args = {
        "get_snapshot": {}, "get_diagnostics": {}, "get_acl_overview": target,
        "prepare_remove_acl": {**target, "entry_index": 1},
        "prepare_cleanup_group": {"group_id": 32768},
        "prepare_unicast": {**source, **target, "clusters": [6]},
        "prepare_groupcast": {**source, "targets": [
            {"node_id": 2, "endpoint_id": 1}, {"node_id": 3, "endpoint_id": 1}], "clusters": [6]},
        "prepare_remove_binding": {**source, **target, "target_kind": "endpoint"},
        "prepare_bulk_remove_bindings": {"relationship_ids": ["test"]},
    }
    for name in ("unicast", "groupcast", "remove_acl", "cleanup_group", "remove_binding", "bulk_remove_bindings"):
        args[f"apply_{name}"] = {"plan_id": "not-a-real-plan", "confirm": True}
    return [{"id": 1, "type": f"{DOMAIN}/{name}", **fields} for name, fields in args.items()]


@pytest.mark.parametrize("request_message", requests())
async def test_all_commands_reject_non_admin(hass, hass_ws_client, hass_read_only_access_token, request_message):
    client = await hass_ws_client(hass, access_token=hass_read_only_access_token)
    hass.data[DOMAIN] = {"_entry_active": True}
    await api.async_setup(hass)
    with patch.object(api, "async_get_snapshot", AsyncMock()) as read:
        await client.send_json(request_message)
        response = await client.receive_json()
        assert response["error"]["code"] == "forbidden"
        read.assert_not_awaited()


@pytest.mark.parametrize("request_message", requests())
async def test_all_commands_reject_after_unload(hass, hass_ws_client, request_message):
    client = await hass_ws_client(hass)
    await api.async_setup(hass)
    await client.send_json(request_message)
    response = await client.receive_json()
    assert response["error"]["code"] == "not_loaded"


async def test_setup_unload_reload_and_static_errors(hass, hass_ws_client):
    await hass_ws_client(hass)
    entry = MockConfigEntry(domain=DOMAIN, unique_id=DOMAIN)
    entry.add_to_hass(hass)
    with patch.object(hass.http, "async_register_static_paths", AsyncMock()) as register:
        assert await studio.async_setup_entry(hass, entry)
        assert hass.data[frontend.DATA_PANELS][PANEL_NAME].require_admin
        commands = dict(hass.data["websocket_api"])
        hass.data[DOMAIN]["_pending_write_plans"] = {"old": {}}
        assert await studio.async_unload_entry(hass, entry)
        assert PANEL_NAME not in hass.data[frontend.DATA_PANELS]
        assert "_pending_write_plans" not in hass.data[DOMAIN]
        assert await studio.async_setup_entry(hass, entry)
        assert hass.data["websocket_api"] == commands
        assert register.await_count == 1
        await studio.async_unload_entry(hass, entry)
    hass.data[DOMAIN].pop("_static_registered")
    with patch.object(hass.http, "async_register_static_paths", AsyncMock(side_effect=RuntimeError("test"))):
        with pytest.raises(RuntimeError):
            await studio.async_setup_entry(hass, entry)
        assert not hass.data[DOMAIN]["_entry_active"]


async def test_invalid_apply_confirmation_never_reaches_writer(hass, hass_ws_client):
    client = await hass_ws_client(hass)
    hass.data[DOMAIN] = {"_entry_active": True}
    await api.async_setup(hass)
    with patch.object(api, "async_apply_unicast", AsyncMock()) as write:
        await client.send_json({"id": 1, "type": f"{DOMAIN}/apply_unicast", "plan_id": "x", "confirm": False})
        result = await client.receive_json()
        assert result["error"]["code"] == "invalid_format"
        write.assert_not_awaited()


async def test_config_flow_requires_matter_and_is_singleton(hass, enable_custom_integrations):
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    assert result["reason"] == "matter_not_configured"
    MockConfigEntry(domain="matter").add_to_hass(hass)
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    assert result["type"] == "form"
    with patch.object(studio, "async_setup_entry", AsyncMock(return_value=True)), patch(
        "homeassistant.config_entries.ConfigEntries.async_setup", AsyncMock(return_value=True)
    ):
        result = await hass.config_entries.flow.async_configure(result["flow_id"], {})
        assert result["type"] == "create_entry"
        await hass.async_block_till_done()
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    assert result["reason"] == "already_configured"


async def test_diagnostics_cached_only_and_bounded_outcomes(hass, hass_ws_client):
    client = await hass_ws_client(hass)
    hass.data[DOMAIN] = {"_entry_active": True}
    await api.async_setup(hass)
    private = "PRIVATE-HOUSE-ADDRESS-KEY"
    with patch.object(api, "async_get_snapshot", AsyncMock(return_value={
        "devices": [{"name": private, "node_id": 87654}], "warnings": [private],
    })):
        await client.send_json_auto_id({"type": f"{DOMAIN}/get_snapshot"})
        assert (await client.receive_json())["success"]
    with patch.object(api, "async_apply_unicast", AsyncMock(side_effect=api.StudioWriteError(message("acl_full", used=3, maximum=3)))):
        for _ in range(12):
            await client.send_json_auto_id({"type": f"{DOMAIN}/apply_unicast", "plan_id": private, "confirm": True})
            assert not (await client.receive_json())["success"]
    with patch.object(api, "async_get_snapshot", AsyncMock(side_effect=AssertionError("must not refresh"))) as snapshot, patch.object(
        diagnostics, "_get_matter_client", return_value=SimpleNamespace(
            server_info=SimpleNamespace(schema_version=11, sdk_version=private, fabric_id=private)
        )
    ):
        await client.send_json_auto_id({"type": f"{DOMAIN}/get_diagnostics"})
        result = (await client.receive_json())["result"]
        assert result["versions"]["homeassistant"]
        assert len(result["versions"]["panel_sha256"]) == 64
        assert result["snapshot"]["warning_count"] == 1
        assert len(result["recent_operations"]) == 10
        assert result["recent_operations"][0]["message_code"] == "acl_full"
        assert result["server"]["sdk_version"] is None
        assert private not in json.dumps(result)
        assert "87654" not in json.dumps(result)
        snapshot.assert_not_awaited()


async def test_actual_ha_store_roundtrip_keeps_pending_evidence(hass):
    """Exercise HA Store serialization; no claim of power-loss durability."""
    groups = ManagedGroupStore(hass)
    await groups.async_load()
    await groups.async_put(ManagedGroup(32768, 256, "11" * 16, "Private group", 1, 1,
                                       [{"node_id": 2, "endpoint_id": 1}], [6], "repair_needed"))
    reloaded = ManagedGroupStore(hass)
    await reloaded.async_load()
    assert reloaded.get(32768).status == "repair_needed"
    assert reloaded.get(32768).epoch_key == "11" * 16
    journal = ACLProvenanceStore(hass)
    await journal.async_load()
    operation = await journal.async_begin(scope=None, node_id=2, before=[], after=[], origin={"kind": "unicast"})
    restored = ACLProvenanceStore(hass)
    await restored.async_load()
    assert restored.operations()[0]["operation_id"] == operation
    assert restored.operations()[0]["status"] == "pending"


async def test_registered_commands_are_all_in_permission_matrix(hass):
    await api.async_setup(hass)
    assert set(hass.data["websocket_api"]) == {request["type"] for request in requests()}


async def test_diagnostics_failure_does_not_change_outcome_history(hass, hass_ws_client):
    client = await hass_ws_client(hass)
    hass.data[DOMAIN] = {"_entry_active": True}
    await api.async_setup(hass)
    with patch.object(api, "async_get_config_entry_diagnostics", AsyncMock(side_effect=OSError("test failure"))):
        await client.send_json_auto_id({"type": f"{DOMAIN}/get_diagnostics"})
        assert not (await client.receive_json())["success"]
    assert not hass.data[DOMAIN].get("_support_operations")


async def test_summary_failure_cannot_turn_a_verified_write_into_an_error(hass, hass_ws_client):
    client = await hass_ws_client(hass)
    hass.data[DOMAIN] = {"_entry_active": True}
    await api.async_setup(hass)
    with patch.object(api, "async_apply_unicast", AsyncMock(return_value={"success": True, "verified": True})), patch.object(
        api, "operation_summary", side_effect=TypeError("unsupported summary")
    ):
        await client.send_json_auto_id({"type": f"{DOMAIN}/apply_unicast", "plan_id": "test", "confirm": True})
        result = await client.receive_json()
        assert result["success"]
        assert result["result"]["verified"]
