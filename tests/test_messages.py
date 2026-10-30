"""Exercise stable message descriptors and backward-compatible wire payloads."""
import ast
from copy import deepcopy
import json
from pathlib import Path
import runpy
from string import Formatter
from types import SimpleNamespace
import unittest

ROOT = Path(__file__).resolve().parents[1] / "custom_components/matter_binding_studio"
messages = runpy.run_path(str(ROOT / "messages.py"))
message = messages["message"]
wire_payload = messages["wire_payload"]


class MessageTests(unittest.TestCase):
    def test_catalog_languages_and_parameters_match(self):
        for code, translations in messages["CATALOG"].items():
            with self.subTest(code=code):
                self.assertEqual(set(translations), {"en", "zh-Hant", "zh-Hans"})
                placeholders = lambda text: {field for _, field, _, _ in Formatter().parse(text) if field}
                self.assertEqual(placeholders(translations["en"]), placeholders(translations["zh-Hant"]))
                self.assertEqual(placeholders(translations["en"]), placeholders(translations["zh-Hans"]))

    def test_payload_preserves_english_for_old_frontend(self):
        payload = wire_payload({"message": message("acl_reclaimed", count=2),
                                "steps": [message("step_remove_acl", count=2)],
                                "warnings": [message("bindings_read_failed", name="Study light")]})
        result = json.loads(json.dumps(payload))
        self.assertEqual(result["message"], "2 unused target ACL rule(s) were reclaimed and read back.")
        self.assertEqual(result["message_i18n"]["params"], {"count": 2})
        self.assertEqual(result["steps_i18n"][0]["code"], "step_remove_acl")
        self.assertEqual(result["warnings_i18n"][0]["params"]["name"], "Study light")

    def test_copy_and_acl_labels_keep_descriptors(self):
        original = message("acl_full", used=3, maximum=4)
        self.assertEqual(deepcopy(original).descriptor, original.descriptor)
        value = wire_payload({"subjects": [message("all_subjects"), "Study knob"],
                              "targets": [{"endpoint": message("all_endpoints"), "capability": message("capability_onoff")}]})
        self.assertEqual(value["subjects_i18n"][1], "Study knob")
        self.assertEqual(value["targets"][0]["capability_i18n"]["code"], "capability_onoff")

    def test_every_explicit_message_code_exists(self):
        for name in ("writer.py", "bulk.py", "api.py", "matter.py"):
            for node in ast.walk(ast.parse((ROOT / name).read_text())):
                if not isinstance(node, ast.Call):
                    continue
                function = getattr(node.func, "id", getattr(node.func, "attr", ""))
                if function == "message" and node.args and isinstance(node.args[0], ast.Constant):
                    self.assertIn(node.args[0].value, messages["CATALOG"])
                    template = messages["CATALOG"][node.args[0].value]["en"]
                    fields = {field for _,field,_,_ in Formatter().parse(template) if field}
                    self.assertEqual(fields, {kw.arg for kw in node.keywords})
                if function == "StudioWriteError":
                    self.assertIsInstance(node.args[0], ast.Call, f"Untranslated error in {name}:{node.lineno}")

    def test_websocket_error_keeps_code_and_translation_metadata(self):
        tree = ast.parse((ROOT / "api.py").read_text())
        node = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == "_send_error")
        env = {"StudioWriteError": RuntimeError, "LocalizedMessage": messages["LocalizedMessage"],
               "_record_outcome": lambda **kwargs: None}
        exec(compile(ast.Module(body=[node], type_ignores=[]), "api.py", "exec"), env)
        sent = []
        env["_send_error"](SimpleNamespace(send_message=sent.append), 7, "plan_failed", RuntimeError(message("acl_full", used=3, maximum=3)))
        result = sent[0]
        self.assertFalse(result["success"])
        self.assertEqual(result["error"]["code"], "plan_failed")
        self.assertEqual(result["error"]["studio_message"]["params"], {"used": 3, "maximum": 3})
        self.assertIsInstance(result["error"]["message"], str)

    def test_repair_result_is_localizable_for_both_outcomes(self):
        tree = ast.parse((ROOT / "writer.py").read_text())
        node = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == "_repair_needed_result")
        env = {"message": message, "Any": object}
        exec(compile(ast.Module(body=[node], type_ignores=[]), "writer.py", "exec"), env)
        for added in (False, True):
            result = wire_payload(env["_repair_needed_result"](added))
            self.assertEqual(result["repair_needed"], added)
            self.assertIn("message_i18n", result)


if __name__ == "__main__":
    unittest.main()
