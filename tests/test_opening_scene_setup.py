import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d")))

class TestOpeningSceneSetup(unittest.TestCase):
    def test_opening_scene_manifest(self):
        """Kiểm tra manifest thông số kỹ thuật của cảnh 30s mở đầu."""
        import dung_canh_opening_30s as scene_mod
        manifest = scene_mod.get_scene_manifest()
        self.assertIn("nam_pos", manifest)
        self.assertIn("nguoikia_pos", manifest)
        self.assertIn("phone_pos", manifest)
        self.assertIn("mirror_pos", manifest)
        self.assertIn("cameras", manifest)
        self.assertEqual(len(manifest["cameras"]), 3)
        self.assertEqual(manifest["cameras"][0]["focal_length"], 85.0)
        self.assertEqual(manifest["cameras"][1]["focal_length"], 28.0)
        self.assertEqual(manifest["cameras"][2]["focal_length"], 32.0)

    def test_opening_scene_objects_and_ray_visibility(self):
        """Kiểm tra khởi tạo các đối tượng và cờ Ray Visibility."""
        import dung_canh_opening_30s as scene_mod
        if not getattr(scene_mod, "HAS_BLENDER", False):
            self.skipTest("Yêu cầu môi trường có bpy")

        scene_info = scene_mod.setup_opening_30s_scene()
        self.assertIn("nam", scene_info)
        self.assertIn("nguoikia", scene_info)
        self.assertIn("phone", scene_info)
        self.assertIn("mirror", scene_info)
        self.assertIn("bed", scene_info)
        self.assertEqual(len(scene_info["cameras"]), 3)

        # Kiểm tra cờ Ray Visibility cho Người Kia trong gương
        nguoikia_root = scene_info["nguoikia"].get("root")
        if nguoikia_root:
            self.assertFalse(nguoikia_root.visible_camera)
            self.assertTrue(nguoikia_root.visible_glossy)

if __name__ == "__main__":
    unittest.main()
