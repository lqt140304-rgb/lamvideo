import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d")))

import dung_canh_opening_30s as scene_mod

class TestOpeningAnimationTiming(unittest.TestCase):
    def test_keyframe_timing_manifest(self):
        """Kiểm tra các mốc keyframe then chốt và độ trễ 5 frames chuẩn kịch bản."""
        timing = scene_mod.get_animation_timing_manifest()
        self.assertEqual(timing["nam_reach_start"], 160)
        self.assertEqual(timing["nguoikia_reach_start"], 165)
        self.assertEqual(timing["nguoikia_reach_start"] - timing["nam_reach_start"], 5)
        self.assertEqual(timing["alarm_hit_frame"], 210)
        self.assertEqual(timing["shot2_situp_frame"], 360)
        self.assertEqual(timing["shot2_walk_frame"], 560)
        self.assertEqual(timing["mirror_pause_look_frame"], 640)
        self.assertEqual(timing["shot2_end"], 720)

    def test_animate_opening_30s_function_exists(self):
        """Kiểm tra hàm animate_opening_30s được định nghĩa và có thể gọi."""
        self.assertTrue(hasattr(scene_mod, "animate_opening_30s"), "Thiếu hàm animate_opening_30s")

    def test_animation_curves_created_in_blender(self):
        """Kiểm tra keyframes thực tế được tạo trên Rig của Nam và Người Kia."""
        if not getattr(scene_mod, "HAS_BLENDER", False):
            self.skipTest("Yêu cầu môi trường có bpy")

        scene_info = scene_mod.setup_opening_30s_scene()
        scene_mod.animate_opening_30s(scene_info)

        rig_nam = scene_info["nam"]["rig"]
        self.assertIsNotNone(rig_nam.animation_data)
        self.assertIsNotNone(rig_nam.animation_data.action)

        rig_nk = scene_info["nguoikia"]["rig"]
        self.assertIsNotNone(rig_nk.animation_data)
        self.assertIsNotNone(rig_nk.animation_data.action)

if __name__ == "__main__":
    unittest.main()
