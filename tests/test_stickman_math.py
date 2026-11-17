import os
import sys
import unittest

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MODULE_DIR = os.path.join(
    REPO_ROOT, "episodes", "hem-co-chuyen", "ho-so-02-nguoi-lam-thay", "assets", "nhan-vat-3d"
)
sys.path.insert(0, MODULE_DIR)

class TestStickmanMath(unittest.TestCase):
    def test_total_height_exact_160(self):
        import stickman_math
        dims = stickman_math.get_base_dimensions()
        self.assertAlmostEqual(dims["total_height"], 1.60, places=3)
        self.assertAlmostEqual(dims["floor_z"], 0.0, places=3)

    def test_head_radius_and_center(self):
        import stickman_math
        dims = stickman_math.get_base_dimensions()
        self.assertAlmostEqual(dims["head_radius"], 0.14, places=3)
        self.assertAlmostEqual(dims["head_center_z"], 1.46, places=3)
        # Top of head must be exactly 1.46 + 0.14 = 1.60
        self.assertAlmostEqual(dims["head_center_z"] + dims["head_radius"], 1.60, places=3)

    def test_torso_capsule_bounds(self):
        import stickman_math
        dims = stickman_math.get_base_dimensions()
        self.assertGreaterEqual(dims["torso_z_min"], 0.75)
        self.assertLessEqual(dims["torso_z_max"], 1.30)
        self.assertGreater(dims["torso_r_top"], 0.08)
        self.assertGreater(dims["torso_r_bottom"], 0.08)

    def test_generate_capsule_levels(self):
        import stickman_math
        levels = stickman_math.generate_capsule_levels(num_rings=7)
        self.assertEqual(len(levels), 7)
        # Verify Z is monotonic increasing
        z_vals = [lvl["z"] for lvl in levels]
        self.assertEqual(z_vals, sorted(z_vals))
        # Verify all radii are positive
        for lvl in levels:
            self.assertGreater(lvl["radius"], 0.05)

    def test_verify_mesh_constraints(self):
        import stickman_math
        report = stickman_math.verify_mesh_constraints()
        self.assertTrue(report["valid"])
        self.assertEqual(len(report["errors"]), 0)

if __name__ == "__main__":
    unittest.main()
