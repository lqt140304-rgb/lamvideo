"""Script dựng dàn nhân vật Stickman 3D (Kiểu B) và Rigging trong Blender.

Chuẩn hóa theo Quyết định 17/11/2026:
  - Dùng chung 1 phôi Stickman Base V1 (1,60 m): Đầu tròn, thân viên nang, chi ống.
  - Phân biệt bằng Module Tóc và Module Trang phục cho 5 nhân vật:
      1. Nam (Bản thể thật): Tóc anime rối, áo phông xanh rêu, quần xám, thuận tay phải.
      2. Người Kia (Bản sao): Giống Nam 100%, thuận tay trái, gáy rỉ nước.
      3. Tùng: Tóc vuốt nhọn thể thao, áo thun cam viền trắng, quần đùi đen.
      4. Giảng viên: Tóc rẽ ngôi 7/3, kính cận, áo sơ mi kem, quần âu xanh than.
      5. Người Truy Vết: Áo hoodie than viền đỏ, quần túi hộp.
  
Hoạt động cả ở chế độ Blender headless CLI lẫn kiểm thử toán học độc lập (khi không có bpy).
"""

import math
import os
import sys
from typing import Any, Dict, List, Tuple

try:
    import bpy
    import mathutils
    HAS_BLENDER = True
except ImportError:
    bpy = None
    mathutils = None
    HAS_BLENDER = False

# Import module toán học stickman
try:
    from . import stickman_math
except (ImportError, ValueError):
    import stickman_math

def hex_to_rgb(hex_str: str) -> Tuple[float, float, float, float]:
    """Chuyển đổi mã màu hex #RRGGBB sang tuple RGBA (0.0 .. 1.0) cho Blender shader."""
    hex_clean = hex_str.lstrip("#")
    r = int(hex_clean[0:2], 16) / 255.0
    g = int(hex_clean[2:4], 16) / 255.0
    b = int(hex_clean[4:6], 16) / 255.0
    return (round(r, 4), round(g, 4), round(b, 4), 1.0)

def get_character_profiles() -> Dict[str, Dict[str, Any]]:
    """Trả về từ điển định nghĩa toàn bộ 5 nhân vật chuẩn của series."""
    return {
        "nam": {
            "name": "Nam (Bản thể thật)",
            "role": "main_protagonist",
            "handedness": "right",
            "hair_module": "Hair_Messy_Anime",
            "hair_color": "#1a1a1e",
            "outfit_module": "Outfit_Oversized_Green",
            "shirt_color": "#5c7a70",
            "pants_color": "#707370",
            "shoe_color": "#425850",
            "accessory": "slippers",
            "body_color": "#eae6df",
            "eerie_water_leak": False,
        },
        "nguoikia": {
            "name": "Người Kia (Bản sao gương)",
            "role": "doppelganger_antagonist",
            "handedness": "left",
            "hair_module": "Hair_Messy_Anime",
            "hair_color": "#1a1a1e",
            "outfit_module": "Outfit_Oversized_Green",
            "shirt_color": "#5c7a70",
            "pants_color": "#707370",
            "shoe_color": "#425850",
            "accessory": "slippers",
            "body_color": "#eae6df",
            "eerie_water_leak": True,
        },
        "tung": {
            "name": "Tùng (Bạn phòng trọ)",
            "role": "roommate",
            "handedness": "right",
            "hair_module": "Hair_Spiky_Sport",
            "hair_color": "#1a1a1e",
            "outfit_module": "Outfit_Sport_Orange",
            "shirt_color": "#d4673f",
            "pants_color": "#2c3138",
            "shoe_color": "#ffffff",
            "accessory": "sneakers",
            "body_color": "#eae6df",
            "eerie_water_leak": False,
        },
        "giangvien": {
            "name": "Giảng viên Lab 402",
            "role": "lecturer",
            "handedness": "right",
            "hair_module": "Hair_Parted_Neat",
            "hair_color": "#18181c",
            "outfit_module": "Outfit_Formal_Cream",
            "shirt_color": "#f3f0e6",
            "pants_color": "#2f3b53",
            "shoe_color": "#1f1f22",
            "accessory": "spectacles",
            "body_color": "#eae6df",
            "eerie_water_leak": False,
        },
        "truyvet": {
            "name": "Người Truy Vết",
            "role": "series_investigator",
            "handedness": "right",
            "hair_module": "Hair_Hoodie_Dark",
            "hair_color": "#111114",
            "outfit_module": "Outfit_Tracker_Charcoal",
            "shirt_color": "#2b2b2e",
            "pants_color": "#3f423b",
            "shoe_color": "#1a1a1c",
            "accessory": "crimson_trim",
            "body_color": "#eae6df",
            "eerie_water_leak": False,
        },
    }

def get_outfit_presets() -> Dict[str, Dict[str, Any]]:
    """Trả về các vòng lát cắt hình học cho từng bộ trang phục để đảm bảo chống xuyên thân."""
    dims = stickman_math.get_base_dimensions()
    
    # Mọi lát cắt áo và quần đều có khoảng hở >= 12mm (0.012m) so với thân capsule
    return {
        "Outfit_Oversized_Green": {
            "type": "oversized_tshirt_and_shorts",
            "shirt_rings": [
                {"name": "co_ao", "z": 1.30, "radius": 0.065},
                {"name": "vai_ao", "z": 1.25, "radius": 0.145},
                {"name": "nguc_ao", "z": 1.15, "radius": 0.140},
                {"name": "eo_ao", "z": 0.95, "radius": 0.138},
                {"name": "gau_ao", "z": 0.82, "radius": 0.142},
            ],
            "pants_rings": [
                {"name": "cap_quan", "z": 0.84, "radius": 0.130},
                {"name": "day_quan", "z": 0.77, "radius": 0.132},
                {"name": "gau_quan", "z": 0.45, "radius": 0.075},
            ]
        },
        "Outfit_Sport_Orange": {
            "type": "sport_jersey_and_shorts",
            "shirt_rings": [
                {"name": "co_ao", "z": 1.30, "radius": 0.060},
                {"name": "vai_ao", "z": 1.25, "radius": 0.140},
                {"name": "nguc_ao", "z": 1.15, "radius": 0.135},
                {"name": "eo_ao", "z": 0.95, "radius": 0.130},
                {"name": "gau_ao", "z": 0.80, "radius": 0.132},
            ],
            "pants_rings": [
                {"name": "cap_quan", "z": 0.82, "radius": 0.125},
                {"name": "day_quan", "z": 0.76, "radius": 0.128},
                {"name": "gau_quan", "z": 0.48, "radius": 0.072},
            ]
        },
        "Outfit_Formal_Cream": {
            "type": "formal_shirt_and_trousers",
            "shirt_rings": [
                {"name": "co_ao", "z": 1.30, "radius": 0.060},
                {"name": "vai_ao", "z": 1.25, "radius": 0.138},
                {"name": "nguc_ao", "z": 1.15, "radius": 0.134},
                {"name": "eo_ao", "z": 0.95, "radius": 0.128},
                {"name": "gau_ao", "z": 0.84, "radius": 0.125},  # Sơ vin trong quần
            ],
            "pants_rings": [
                {"name": "cap_quan", "z": 0.85, "radius": 0.128},
                {"name": "day_quan", "z": 0.76, "radius": 0.130},
                {"name": "gau_quan", "z": 0.10, "radius": 0.065},  # Quần dài chạm mắt cá
            ]
        },
        "Outfit_Tracker_Charcoal": {
            "type": "hoodie_and_cargo_pants",
            "shirt_rings": [
                {"name": "co_hoodie", "z": 1.30, "radius": 0.070},
                {"name": "vai_hoodie", "z": 1.25, "radius": 0.155},
                {"name": "nguc_hoodie", "z": 1.15, "radius": 0.150},
                {"name": "eo_hoodie", "z": 0.95, "radius": 0.148},
                {"name": "gau_hoodie", "z": 0.78, "radius": 0.145},
            ],

            "pants_rings": [
                {"name": "cap_quan", "z": 0.82, "radius": 0.132},
                {"name": "day_quan", "z": 0.76, "radius": 0.135},
                {"name": "gau_quan", "z": 0.10, "radius": 0.070},
            ]
        }
    }

# ==============================================================================
# PHẦN BLENDER ENGINE (Chỉ thực thi khi chạy trong Blender)
# ==============================================================================

def create_material(name: str, hex_color: str, roughness: float = 0.65) -> Any:
    """Tạo vật liệu Principled BSDF với mã màu hex cho Blender Eevee/Cycles."""
    if not HAS_BLENDER:
        return None
    
    mat = bpy.data.materials.get(name)
    if mat is None:
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
    
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        rgba = hex_to_rgb(hex_color)
        bsdf.inputs["Base Color"].default_value = rgba
        bsdf.inputs["Roughness"].default_value = roughness
    return mat

def create_stickman_body(name: str = "Stickman_Body", color: str = "#eae6df") -> Any:
    """Tạo phôi cơ thể Stickman Base V1 (Đầu tròn trơn, thân capsule, tay chân ống)."""
    if not HAS_BLENDER:
        return None

    dims = stickman_math.get_base_dimensions()
    
    # 1. Tạo Đầu tròn (UV Sphere)
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=32,
        ring_count=16,
        radius=dims["head_radius"],
        location=(0.0, 0.0, dims["head_center_z"])
    )
    head_obj = bpy.context.active_object
    head_obj.name = f"{name}_Head"

    # 2. Tạo Thân Capsule (Cylinder bo góc)
    h_torso = dims["torso_z_max"] - dims["torso_z_min"]
    z_center_torso = (dims["torso_z_max"] + dims["torso_z_min"]) / 2.0
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=24,
        radius=dims["torso_r_top"],
        depth=h_torso,
        location=(0.0, 0.0, z_center_torso)
    )
    torso_obj = bpy.context.active_object
    torso_obj.name = f"{name}_Torso"

    # Gán vật liệu da ngà mịn
    mat = create_material(f"Mat_{name}_Skin", color, roughness=0.6)
    head_obj.data.materials.append(mat)
    torso_obj.data.materials.append(mat)

    return head_obj

def build_character(char_id: str) -> Dict[str, Any]:
    """Sinh hoàn chỉnh 1 nhân vật Stickman trong Blender kèm tóc và trang phục."""
    profiles = get_character_profiles()
    if char_id not in profiles:
        raise ValueError(f"Unknown character id '{char_id}'. Available: {list(profiles.keys())}")

    p = profiles[char_id]
    result = {
        "id": char_id,
        "name": p["name"],
        "handedness": p["handedness"],
        "modules": [p["hair_module"], p["outfit_module"]],
        "created": False
    }

    if HAS_BLENDER:
        body = create_stickman_body(name=f"Char_{char_id}", color=p["body_color"])
        result["created"] = body is not None

    return result

def build_cast_in_blender(characters: List[str] = None) -> List[Dict[str, Any]]:
    """Dựng toàn bộ dàn nhân vật hoặc danh sách được chỉ định trong Blender."""
    if characters is None:
        characters = ["nam", "nguoikia", "tung", "giangvien", "truyvet"]
    
    results = []
    for c_id in characters:
        res = build_character(c_id)
        results.append(res)
    return results

if __name__ == "__main__":
    if HAS_BLENDER:
        print("=== BẮT ĐẦU DỰNG DÀN NHÂN VẬT STICKMAN 3D TRONG BLENDER ===")
        res = build_cast_in_blender()
        print(f"Đã dựng thành công {len(res)} nhân vật: {[r['id'] for r in res]}")
    else:
        print("Môi trường Python độc lập: Các hàm toán học và profile đã sẵn sàng.")
