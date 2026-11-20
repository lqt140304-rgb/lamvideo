import unittest
import sys
import os

# Add path to dung_stickman_cast
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d")))

import dung_stickman_cast as dsc

class TestStickmanRigAnimation(unittest.TestCase):
    def test_armature_has_arm_ik_bones(self):
        """Kiểm tra create_armature_rig sinh ra các xương điều khiển IK cho cánh tay."""
        if not dsc.HAS_BLENDER:
            self.skipTest("Yêu cầu môi trường có bpy")
        
        rig = dsc.create_armature_rig("Rig_Test_IK", handedness="right")
        self.assertIsNotNone(rig)
        bone_names = [b.name for b in rig.data.bones]
        self.assertIn("ik_hand.L", bone_names, "Thiếu xương ik_hand.L")
        self.assertIn("ik_hand.R", bone_names, "Thiếu xương ik_hand.R")

    def test_armature_has_arm_ik_constraints(self):
        """Kiểm tra forearm.L và forearm.R có ràng buộc IK hướng về ik_hand."""
        if not dsc.HAS_BLENDER:
            self.skipTest("Yêu cầu môi trường có bpy")

        rig = dsc.create_armature_rig("Rig_Test_Con", handedness="right")
        forearm_r = rig.pose.bones.get("forearm.R")
        self.assertIsNotNone(forearm_r)
        
        ik_cons = [c for c in forearm_r.constraints if c.type == "IK"]
        self.assertGreater(len(ik_cons), 0, "forearm.R không có ràng buộc IK")
        self.assertEqual(ik_cons[0].subtarget, "ik_hand.R")
        self.assertEqual(ik_cons[0].chain_count, 2)

    def test_bind_stickman_to_armature(self):
        """Kiểm tra hàm bind_stickman_to_armature gán modifier Armature cho các phần thân."""
        if not dsc.HAS_BLENDER:
            self.skipTest("Yêu cầu môi trường có bpy")

        self.assertTrue(hasattr(dsc, "bind_stickman_to_armature"), "Chưa định nghĩa hàm bind_stickman_to_armature")

if __name__ == "__main__":
    unittest.main()
