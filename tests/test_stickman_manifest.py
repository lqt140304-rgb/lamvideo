import json
import os
import unittest

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

class TestStickmanManifest(unittest.TestCase):
    def test_manifest_json(self):
        manifest_path = os.path.join(
            REPO_ROOT, "what-if-studio", "library", "characters", "stickman-base-v1", "manifest.json"
        )
        self.assertTrue(os.path.exists(manifest_path), f"File {manifest_path} must exist")
        with open(manifest_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        self.assertEqual(data.get("id"), "STICKMAN-BASE-V1")
        self.assertEqual(data.get("version"), 1)
        self.assertEqual(data.get("height"), 1.60)
        self.assertEqual(data.get("type"), "B")
        self.assertEqual(data.get("status"), "active-production-standard")
        self.assertIn("hair", data.get("modules", []))
        self.assertIn("outfits", data.get("modules", []))
        self.assertIn("rig", data.get("modules", []))

    def test_readme_md(self):
        readme_path = os.path.join(
            REPO_ROOT, "what-if-studio", "library", "characters", "stickman-base-v1", "README.md"
        )
        self.assertTrue(os.path.exists(readme_path), f"File {readme_path} must exist")
        with open(readme_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("Stickman Base V1", content)
        self.assertIn("Kiểu B", content)
        self.assertIn("1,60 m", content)

if __name__ == "__main__":
    unittest.main()
