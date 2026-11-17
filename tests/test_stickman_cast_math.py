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

    def test_bone_hierarchy_structure(self):
        import dung_stickman_cast
        bones = dung_stickman_cast.get_bone_definitions()
        bone_names = [b["name"] for b in bones]
        expected_bones = [
            "root", "pelvis", "spine", "chest", "neck", "head",
            "upper_arm.L", "forearm.L", "hand.L",
            "upper_arm.R", "forearm.R", "hand.R",
            "thigh.L", "shin.L", "foot.L",
            "thigh.R", "shin.R", "foot.R",
            "ik_foot.L", "ik_foot.R"
        ]
        for eb in expected_bones:
            self.assertIn(eb, bone_names, f"Bone {eb} missing from armature")

    def test_hair_presets_defined(self):
        import dung_stickman_cast
        hair_presets = dung_stickman_cast.get_hair_presets()
        expected = ["Hair_Messy_Anime", "Hair_Spiky_Sport", "Hair_Parted_Neat", "Hair_Hoodie_Dark"]
        for hp in expected:
            self.assertIn(hp, hair_presets, f"Hair preset {hp} must be defined")

    def test_pbr_material_parameters_signature(self):
        import dung_stickman_cast
        import inspect
        sig = inspect.signature(dung_stickman_cast.create_material)
        for param in ["sss_weight", "sheen_weight", "transmission", "specular"]:
            self.assertIn(param, sig.parameters, f"Parameter {param} must be supported by create_material")

    def test_hand_geometry_naming(self):
        import dung_stickman_cast
        import inspect
        src = inspect.getsource(dung_stickman_cast.create_stickman_body)
        self.assertIn("Thumb", src, "create_stickman_body must define Thumb for stylized hand")
        self.assertIn("Palm", src, "create_stickman_body must define Palm for stylized hand")

if __name__ == "__main__":
    unittest.main()
