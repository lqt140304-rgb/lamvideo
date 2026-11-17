import os
import re
import sys
import unittest

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MODULE_DIR = os.path.join(
    REPO_ROOT, "episodes", "hem-co-chuyen", "ho-so-02-nguoi-lam-thay", "assets", "nhan-vat-3d"
)
sys.path.insert(0, MODULE_DIR)

class TestStickmanCastMath(unittest.TestCase):
    def test_cast_profiles_exist(self):
        import dung_stickman_cast
        profiles = dung_stickman_cast.get_character_profiles()
        expected = ["nam", "nguoikia", "tung", "giangvien", "truyvet"]
        for char_id in expected:
            self.assertIn(char_id, profiles, f"Character {char_id} must be in profiles")

    def test_nam_and_nguoikia_twin_invariance(self):
        import dung_stickman_cast
        profiles = dung_stickman_cast.get_character_profiles()
        nam = profiles["nam"]
        nguoikia = profiles["nguoikia"]

        # Hair and outfit must be identical
        self.assertEqual(nam["hair_module"], nguoikia["hair_module"])
        self.assertEqual(nam["hair_color"], nguoikia["hair_color"])
        self.assertEqual(nam["outfit_module"], nguoikia["outfit_module"])
        self.assertEqual(nam["shirt_color"], nguoikia["shirt_color"])
        self.assertEqual(nam["pants_color"], nguoikia["pants_color"])

        # Handedness MUST be different
        self.assertEqual(nam["handedness"], "right")
        self.assertEqual(nguoikia["handedness"], "left")

    def test_outfit_clearance_over_body(self):
        import dung_stickman_cast
        import stickman_math
        capsule_levels = stickman_math.generate_capsule_levels(num_rings=7)
        outfits = dung_stickman_cast.get_outfit_presets()

        dims = stickman_math.get_base_dimensions()
        for outfit_id, outfit in outfits.items():
            shirt_rings = outfit.get("shirt_rings", [])
            for s_ring in shirt_rings:
                z = s_ring["z"]
                name = s_ring["name"]
                if "co" in name:
                    # Collar is around neck (neck radius = 0.04m)
                    body_r = dims["neck_radius"]
                    min_clearance = 0.015
                else:
                    # Torso rings
                    body_r = 0.11
                    for b_lvl in capsule_levels:
                        if abs(b_lvl["z"] - z) <= 0.08:
                            body_r = b_lvl["radius"]
                            break
                    min_clearance = 0.008

                self.assertGreaterEqual(
                    s_ring["radius"],
                    body_r + min_clearance,
                    f"Outfit {outfit_id} ring {name} at z={z} penetrates body: {s_ring['radius']} vs body {body_r}"
                )


    def test_hex_colors_valid(self):
        import dung_stickman_cast
        profiles = dung_stickman_cast.get_character_profiles()
        hex_pattern = re.compile(r"^#[0-9a-fA-F]{6}$")

        for char_id, p in profiles.items():
            for key, val in p.items():
                if key.endswith("_color") and isinstance(val, str):
                    self.assertTrue(
                        hex_pattern.match(val),
                        f"Color {val} in {char_id}.{key} is not valid 6-char hex"
                    )

if __name__ == "__main__":
    unittest.main()
