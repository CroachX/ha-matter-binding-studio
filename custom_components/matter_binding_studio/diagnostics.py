"""Cached-only, allowlisted diagnostics for HA and the Studio panel."""
from copy import deepcopy
from hashlib import sha256
from importlib.metadata import PackageNotFoundError, version
import json
from pathlib import Path
import re

from .const import DOMAIN
from .matter import _get_matter_client
from .support_data import number


def _local_versions():
    """File/package reads run in HA's executor, never its event loop."""
    root = Path(__file__).parent
    versions = {"studio": json.loads((root / "manifest.json").read_text())["version"]}
    for package in ("homeassistant", "matter-python-client", "python-matter-server"):
        try:
            versions[package] = version(package)
        except PackageNotFoundError:
            versions[package] = None
    versions["panel_sha256"] = sha256((root / "frontend/matter-binding-studio-panel.js").read_bytes()).hexdigest()
    return versions


async def async_get_config_entry_diagnostics(hass, entry=None):
    """No live reads, new connections, device writes or private Store access."""
    versions = await hass.async_add_executor_job(_local_versions)
    server = {"release_version": None, "schema_version": None, "sdk_version": None}
    try:
        info = getattr(_get_matter_client(hass), "server_info", None)
        server["schema_version"] = number(getattr(info, "schema_version", None))
        sdk = getattr(info, "sdk_version", None)
        # Never pass an arbitrary server string through a public diagnostic.
        if isinstance(sdk, str) and re.fullmatch(r"[0-9]+(?:\.[0-9]+){1,3}", sdk):
            server["sdk_version"] = sdk
    except Exception:
        pass  # Disconnected/unavailable runtime metadata stays unknown.
    data = hass.data.get(DOMAIN, {})
    return {
        "format_version": 1,
        "versions": versions,
        "server": server,
        "snapshot": deepcopy(data.get("_support_snapshot")),
        "recent_operations": deepcopy(data.get("_support_operations", [])),
        "limitations": ["cached_snapshot_not_live", "operations_since_restart_only",
                        "server_release_not_reported", "no_device_identities_or_names",
                        "no_physical_control_verification"],
    }
