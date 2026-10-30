"""Public support data must fail closed on arbitrary private extension fields."""
import importlib
import json
from pathlib import Path
import sys
from types import ModuleType
import unittest
from unittest.mock import patch

package = ModuleType("support_under_test")
package.__path__ = [str(Path(__file__).resolve().parents[1] / "custom_components/matter_binding_studio")]
with patch.dict(sys.modules, {"support_under_test": package}):
    support = importlib.import_module("support_under_test.support_data")


class SupportDataTests(unittest.TestCase):
    def test_snapshot_uses_allowlist_not_recursive_redaction(self):
        secret = "DO-NOT-EXPORT-secret-home-token"
        raw = {
            "devices": [{"node_id": 879234, "endpoint_id": 62, "name": secret,
                         "node_name": secret, "area_name": secret, "extra": {"key": secret},
                         "can_bind": True, "can_be_target": False,
                         "client_capabilities": [6, 8, 768, secret, True], "server_capabilities": []}],
            "relationships": [{"route": "direct", "source": {"name": secret}}, {"route": secret}],
            "native_control_sets": [{"status": "repair_needed", "epoch_key": secret}, {"status": secret}],
            "capacities": [{"name": secret, "max_groups_per_fabric": 4,
                            "max_group_keys_per_fabric": secret, "group_table_entries": True}],
            "warnings": [secret], "credentials": secret,
        }
        result = support.snapshot_summary(raw)
        serialized = json.dumps(result)
        self.assertNotIn(secret, serialized)
        self.assertNotIn("879234", serialized)
        self.assertEqual(result["endpoint_capabilities"][0]["client_clusters"], [6, 8, 768])
        self.assertEqual(result["capacities"][0]["max_groups_per_fabric"], 4)
        self.assertIsNone(result["capacities"][0]["group_table_entries"])
        self.assertFalse(result["binding_inventory_complete"])

    def test_error_exports_only_known_codes_not_text_or_params(self):
        result = support.operation_summary("apply_groupcast", error={
            "code": "write_failed", "message": "private", "trace": "private",
            "studio_message": {"code": "acl_full", "params": {"name": "private"}, "fallback": "private"},
        })
        self.assertEqual(result["message_code"], "acl_full")
        self.assertNotIn("private", json.dumps(result))
        unknown = support.operation_summary("apply_unicast", error={"code": "private"})
        self.assertEqual(unknown["error_code"], "unknown")
        self.assertIsNone(support.operation_summary("private", error={}))

    def test_batch_summary_is_counts_only_and_never_atomic_success(self):
        result = support.operation_summary("apply_bulk_remove_bindings", result={
            "success": True, "results": [
                {"status": "verified", "source": {"name": "private"}},
                {"status": "unverified", "relationship_ids": ["private"]}],
        })
        self.assertEqual(result["status"], "partial")
        self.assertEqual(result["source_results"], {"verified": 1, "unverified": 1})
        self.assertNotIn("private", json.dumps(result))

    def test_missing_verification_never_claims_verified(self):
        self.assertEqual(support.operation_summary("apply_unicast", result={"success": True})["status"], "unverified")
        self.assertEqual(support.operation_summary("prepare_unicast", result={"plan_id": "private"})["status"], "planned")
