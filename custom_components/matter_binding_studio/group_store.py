"""Private registry for native groups automatically owned by Studio.

Matter does not retain an operator-friendly relationship label or the group
epoch key in a form that can later be read back.  The Studio therefore keeps a
small, HA-local registry for the groups it creates.  This is deliberately not a
second group-management surface: it exists only to explain, repair, and later
remove an automatically managed groupcast relationship.
"""

from __future__ import annotations

import secrets
from dataclasses import dataclass
from typing import Any

from homeassistant.core import HomeAssistant

from .const import DOMAIN

_STORE_KEY = f"{DOMAIN}_managed_groups"
_STORE_VERSION = 1
_RUNTIME_KEY = "_managed_group_store"


@dataclass(frozen=True)
class ManagedGroup:
    """The non-discoverable metadata needed to maintain one groupcast route."""

    group_id: int
    key_set_id: int
    epoch_key: str
    name: str
    source_node_id: int
    source_endpoint_id: int
    members: list[dict[str, int]]
    clusters: list[int]
    status: str

    def as_public_dict(self) -> dict[str, Any]:
        """Return presentation metadata without exposing group key material."""
        return {
            "group_id": self.group_id,
            "name": self.name,
            "source_node_id": self.source_node_id,
            "source_endpoint_id": self.source_endpoint_id,
            "members": [dict(member) for member in self.members],
            "clusters": list(self.clusters),
            "status": self.status,
        }

    def to_dict(self) -> dict[str, Any]:
        return {
            **self.as_public_dict(),
            "key_set_id": self.key_set_id,
            "epoch_key": self.epoch_key,
        }

    @classmethod
    def from_dict(cls, value: dict[str, Any]) -> ManagedGroup:
        return cls(
            group_id=int(value["group_id"]),
            key_set_id=int(value["key_set_id"]),
            epoch_key=str(value["epoch_key"]),
            name=str(value["name"]),
            source_node_id=int(value["source_node_id"]),
            source_endpoint_id=int(value["source_endpoint_id"]),
            members=[
                {"node_id": int(member["node_id"]), "endpoint_id": int(member["endpoint_id"])}
                for member in value.get("members", [])
            ],
            clusters=sorted({int(cluster) for cluster in value.get("clusters", [])}),
            status=str(value.get("status", "active")),
        )


class ManagedGroupStore:
    """Async persistence for Studio-owned group metadata and epoch keys."""

    def __init__(self, hass: HomeAssistant, store: Any | None = None) -> None:
        if store is None:
            from homeassistant.helpers.storage import Store

            store = Store(hass, _STORE_VERSION, _STORE_KEY)
        self._store = store
        self._data: dict[str, Any] | None = None

    async def async_load(self) -> None:
        if self._data is not None:
            return
        raw = await self._store.async_load()
        self._data = {"groups": dict((raw or {}).get("groups", {}))}

    def list_groups(self) -> list[ManagedGroup]:
        data = self._require_loaded()
        return sorted(
            (ManagedGroup.from_dict(item) for item in data["groups"].values()),
            key=lambda group: group.group_id,
        )

    def get(self, group_id: int) -> ManagedGroup | None:
        value = self._require_loaded()["groups"].get(str(group_id))
        return ManagedGroup.from_dict(value) if value else None

    async def async_put(self, group: ManagedGroup) -> None:
        data = self._require_loaded()
        data["groups"][str(group.group_id)] = group.to_dict()
        await self._store.async_save(data)

    async def async_set_status(self, group_id: int, status: str) -> ManagedGroup:
        group = self.get(group_id)
        if group is None:
            raise KeyError(f"Unknown Studio group {group_id}")
        updated = ManagedGroup(
            group_id=group.group_id,
            key_set_id=group.key_set_id,
            epoch_key=group.epoch_key,
            name=group.name,
            source_node_id=group.source_node_id,
            source_endpoint_id=group.source_endpoint_id,
            members=group.members,
            clusters=group.clusters,
            status=status,
        )
        await self.async_put(updated)
        return updated

    def _require_loaded(self) -> dict[str, Any]:
        if self._data is None:
            raise RuntimeError("ManagedGroupStore.async_load() must be called first")
        return self._data


def new_epoch_key() -> str:
    """Generate the 128-bit epoch key required for a Matter application group."""
    return secrets.token_bytes(16).hex()


def get_managed_group_store(hass: HomeAssistant) -> ManagedGroupStore:
    domain_data = hass.data.setdefault(DOMAIN, {})
    store = domain_data.get(_RUNTIME_KEY)
    if store is None:
        store = ManagedGroupStore(hass)
        domain_data[_RUNTIME_KEY] = store
    return store
