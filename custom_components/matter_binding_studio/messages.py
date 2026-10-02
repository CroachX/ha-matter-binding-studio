"""Stable message codes with English compatibility for older panel bundles."""

import json
from pathlib import Path

CATALOG = json.loads(Path(__file__).with_name("messages.json").read_text(encoding="utf-8"))


class LocalizedMessage(str):
    """Behave as English text in logs/storage, carrying a wire descriptor."""

    def __new__(cls, code, **params):
        text = CATALOG[code]["en"].format(**params)
        result = super().__new__(cls, text)
        result.descriptor = {"code": code, "params": params, "fallback": text}
        return result

    def __getnewargs_ex__(self):
        return (self.descriptor["code"],), self.descriptor["params"]


def message(code, **params):
    return LocalizedMessage(code, **params)


def wire_payload(value):
    """Add descriptors without removing fields consumed by older frontends."""
    if isinstance(value, dict):
        result = {}
        for key, item in value.items():
            result[key] = wire_payload(item)
            if isinstance(item, LocalizedMessage):
                result[f"{key}_i18n"] = item.descriptor
            elif isinstance(item, list) and any(isinstance(entry, LocalizedMessage) for entry in item):
                result[f"{key}_i18n"] = [
                    entry.descriptor if isinstance(entry, LocalizedMessage) else entry
                    for entry in item
                ]
        return result
    if isinstance(value, list):
        return [wire_payload(item) for item in value]
    return value
