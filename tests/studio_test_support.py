"""Import production modules with a small HA boundary stub, without device I/O."""
import importlib
from pathlib import Path
import sys
from types import ModuleType
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1] / "custom_components/matter_binding_studio"


def load_studio():
    package = ModuleType("studio_under_test")
    package.__path__ = [str(ROOT)]
    modules = {"studio_under_test": package}
    for name in ("homeassistant", "homeassistant.core", "homeassistant.components",
                 "homeassistant.components.matter", "homeassistant.helpers",
                 "homeassistant.helpers.area_registry", "homeassistant.helpers.device_registry",
                 "homeassistant.helpers.entity_registry"):
        modules[name] = ModuleType(name)
    modules["homeassistant.core"].HomeAssistant = object
    modules["homeassistant.components.matter"].DOMAIN = "matter"
    with patch.dict(sys.modules, modules):
        return (importlib.import_module("studio_under_test.writer"),
                importlib.import_module("studio_under_test.matter"),
                importlib.import_module("studio_under_test.group_store"))


w, matter, group_store = load_studio()
