"""Exercise production registry resolution without requiring a running HA host."""

import ast
from collections.abc import Iterable
from pathlib import Path
import re
from types import SimpleNamespace as NS
from typing import Any
import unittest


SOURCE = Path(__file__).resolve().parents[1] / "custom_components/matter_binding_studio/matter.py"
FUNCTIONS = {
    "_build_name_index", "_parse_matter_identifier", "_endpoint_from_unique_id",
    "_entity_endpoint_key", "_entity_name_priority", "_set_endpoint_name",
}
# Execute the actual production functions; only HA registry access is substituted.
tree = ast.parse(SOURCE.read_text())
nodes = [node for node in tree.body if isinstance(node, ast.FunctionDef) and node.name in FUNCTIONS]
namespace = dict(Any=Any, Iterable=Iterable, HomeAssistant=Any)
pattern = next(node for node in tree.body if isinstance(node, ast.Assign)
               and any(isinstance(target, ast.Name) and target.id == "_MATTER_IDENTIFIER_RE" for target in node.targets))
namespace["re"] = re
exec(compile(ast.Module(body=[pattern, *nodes], type_ignores=[]), str(SOURCE), "exec"), namespace)


def identifier(root, fabric="ABC", node=16):
    return ("matter", f"deviceid_{fabric}-{node:016X}-{root}")


class MatterNamesTest(unittest.TestCase):
    def resolve(self, value, identifiers):
        return namespace["_entity_endpoint_key"](value, identifiers)

    def test_repaired_bridge_order_does_not_change_endpoint(self):
        for roots in ((51, 75), (75, 51), (75,)):
            with self.subTest(roots=roots):
                self.assertEqual(self.resolve("ABC-0000000000000010-75-76-MatterLight-6-0",
                                             [identifier(root) for root in roots]), (16, 76))

    def test_arbitrary_roots_and_root_level_sensor(self):
        self.assertEqual(self.resolve("ABC-0000000000000010-203-207-MatterLight-6-0",
                                     [identifier(9), identifier(203)]), (16, 207))
        self.assertEqual(self.resolve("ABC-0000000000000010-203-203-Power-144-8",
                                     [identifier(203)]), (16, 203))

    def test_wrong_fabric_node_root_and_missing_data_are_rejected(self):
        for value in (None, "", "DEF-0000000000000010-75-76-MatterLight",
                      "ABC-0000000000000011-75-76-MatterLight",
                      "ABC-0000000000000010-750-76-MatterLight",
                      "ABC-0000000000000010-51-52-MatterLight"):
            with self.subTest(value=value):
                self.assertIsNone(self.resolve(value, [identifier(75)]))

    def test_non_bridged_current_and_legacy_formats(self):
        for suffix in ("MatterNodeDevice-2-MatterLight-6-0", "2-MatterLight-6-0"):
            self.assertEqual(self.resolve(f"ABC-0000000000000010-{suffix}",
                                         [identifier("MatterNodeDevice")]), (16, 2))

    def test_registry_names_and_areas_follow_each_entity(self):
        for roots in ((51, 75), (75, 51)):
            device = NS(id="switch", identifiers=[identifier(root) for root in roots],
                        name_by_user="Study switch", name=None, area_id="study")
            entities = {
                "light": NS(device_id="switch", disabled=False, domain="light",
                            unique_id="ABC-0000000000000010-75-76-MatterLight-6-0",
                            name="Study light", original_name=None),
                "identify": NS(device_id="switch", disabled=False, domain="button",
                               unique_id="ABC-0000000000000010-75-76-IdentifyButton-3-1",
                               name="Identify", original_name=None),
            }
            namespace.update(
                dr=NS(async_get=lambda _: NS(devices={"switch": device})),
                er=NS(async_get=lambda _: NS(entities=entities)),
                ar=NS(async_get=lambda _: NS(async_get_area=lambda _: NS(name="Study"))),
            )
            result = namespace["_build_name_index"](None)
            self.assertEqual(result["endpoint_names"], {(16, 76): "Study light"})
            self.assertEqual(result["endpoint_areas"][(16, 76)], "Study")


if __name__ == "__main__":
    unittest.main()
