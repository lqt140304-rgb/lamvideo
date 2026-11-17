"""Script dựng dàn nhân vật Stickman 3D (Kiểu B) và Rigging trong Blender.

Chuẩn hóa theo Quyết định 17/11/2026:
  - Dùng chung 1 phôi Stickman Base V1 (1,60 m): Đầu tròn trơn, thân viên nang, chi ống.
  - Phân biệt bằng Module Tóc và Module Trang phục cho 5 nhân vật:
      1. Nam (Bản thể thật): Tóc anime rối, áo phông xanh rêu, quần xám, thuận tay phải.
      2. Người Kia (Bản sao): Giống Nam 100%, thuận tay trái, gáy rỉ nước.
      3. Tùng: Tóc vuốt nhọn thể thao, áo thun cam viền trắng, quần đùi đen.
      4. Giảng viên: Tóc rẽ ngôi 7/3, kính cận, áo sơ mi kem, quần âu xanh than.
      5. Người Truy Vết: Áo hoodie than viền đỏ, quần túi hộp.
  
TỰ CHỨA ĐẦY ĐỦ (SELF-CONTAINED): Chạy mượt mà trong Blender GUI (Scripting tab),
Blender headless CLI, hoặc Python độc lập mà không cần bất kỳ file phụ thuộc nào khác.
"""

import argparse
import math
import os
import sys
from typing import Any, Dict, List, Tuple

# Thêm đường dẫn hiện tại vào sys.path để an toàn
HERE = os.path.dirname(os.path.abspath(__file__)) if "__file__" in globals() else os.getcwd()
if HERE not in sys.path:
    sys.path.insert(0, HERE)

try:
    import bpy
    import mathutils
    from mathutils import Vector, Euler, Matrix
    HAS_BLENDER = True
except ImportError:
    bpy = None
    mathutils = None
    HAS_BLENDER = False

# ==============================================================================
# 1. HÌNH HỌC THAM SỐ STICKMAN BASE V1 (TÍCH HỢP ĐỘC LẬP)
# ==============================================================================

def get_base_dimensions() -> Dict[str, float]:
    """Trả về từ điển chứa toàn bộ kích thước hình học chuẩn của Stickman Base V1 (1,60 m)."""
    return {
        "total_height": 1.60,
        "floor_z": 0.0,
        # Đầu & Cổ
        "head_radius": 0.14,
        "head_center_z": 1.46,
        "head_top_z": 1.60,
        "neck_radius": 0.04,
        "neck_z_min": 1.28,
        "neck_z_max": 1.36,
        # Thân Capsule
        "torso_z_min": 0.78,
        "torso_z_max": 1.28,
        "torso_height": 0.50,
        "torso_r_top": 0.12,
        "torso_r_bottom": 0.10,
        # Chi trên (Tay)
        "shoulder_z": 1.24,
        "shoulder_x": 0.15,
        "arm_radius": 0.035,
        "arm_length": 0.55,
        "hand_length": 0.12,
        # Chi dưới (Chân)
        "hip_z": 0.76,
        "hip_x": 0.08,
        "leg_radius": 0.045,
        "leg_length": 0.70,
        "knee_z": 0.40,
        "ankle_z": 0.08,
        # Bàn chân
        "foot_length": 0.22,
        "foot_width": 0.08,
        "foot_height": 0.08,
    }

def generate_capsule_levels(num_rings: int = 7) -> List[Dict[str, Any]]:
    """Sinh danh sách các lát cắt và bán kính dọc theo trục Z cho thân viên nang."""
    dims = get_base_dimensions()
    z_min = dims["torso_z_min"]
    z_max = dims["torso_z_max"]
    height = z_max - z_min
    levels = []
    for i in range(num_rings):
        t = i / (num_rings - 1)
        z = z_min + t * height
        base_r = dims["torso_r_bottom"] + t * (dims["torso_r_top"] - dims["torso_r_bottom"])
        capsule_factor = math.sin(t * math.pi) ** 0.35
        r = base_r * (0.75 + 0.25 * capsule_factor)
        name = f"ring_{i}"
        if i == 0:
            name = "day_chau"
        elif i == num_rings - 1:
            name = "vai_nguc"
        elif i == num_rings // 2:
            name = "eo_bung"
        levels.append({"name": name, "z": round(z, 4), "radius": round(r, 4), "t": round(t, 4)})
    return levels

def verify_mesh_constraints() -> Dict[str, Any]:
    """Kiểm tra tính hợp lệ toán học của Stickman Base."""
    dims = get_base_dimensions()
    errors = []
    calculated_top = dims["head_center_z"] + dims["head_radius"]
    if abs(calculated_top - dims["total_height"]) > 1e-4:
        errors.append(f"Top of head {calculated_top} != total_height {dims['total_height']}")
    if abs(dims["floor_z"] - 0.0) > 1e-4:
        errors.append(f"Floor Z {dims['floor_z']} != 0.0")
    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "calculated_top_z": calculated_top,
        "floor_z": dims["floor_z"],
    }

# Fallback module import compatibility
try:
    from . import stickman_math
except (ImportError, ValueError):
    try:
        import stickman_math
    except ImportError:
        stickman_math = sys.modules[__name__]

# ==============================================================================
# 2. CẤU HÌNH NHẬN DIỆN & TRANG PHỤC CỦA 5 NHÂN VẬT
# ==============================================================================

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
                {"name": "gau_ao", "z": 0.84, "radius": 0.125},
            ],
            "pants_rings": [
                {"name": "cap_quan", "z": 0.85, "radius": 0.128},
                {"name": "day_quan", "z": 0.76, "radius": 0.130},
                {"name": "gau_quan", "z": 0.10, "radius": 0.065},
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

def get_hair_presets() -> Dict[str, Dict[str, Any]]:
    """Trả về đặc tả hình học cho từng module tóc."""
    return {
        "Hair_Messy_Anime": {
            "type": "messy_anime_clumps",
            "base_cap_radius": 0.146,
            "clumps": [
                {"pos": (0.00, -0.13, 1.54), "scale": (0.06, 0.04, 0.08), "rot": (0.2, 0.0, 0.0)},
                {"pos": (0.08, -0.11, 1.52), "scale": (0.05, 0.04, 0.07), "rot": (0.1, 0.3, -0.2)},
                {"pos": (-0.08, -0.11, 1.52), "scale": (0.05, 0.04, 0.07), "rot": (0.1, -0.3, 0.2)},
                {"pos": (0.12, 0.02, 1.48), "scale": (0.05, 0.05, 0.09), "rot": (0.0, 0.4, 0.0)},
                {"pos": (-0.12, 0.02, 1.48), "scale": (0.05, 0.05, 0.09), "rot": (0.0, -0.4, 0.0)},
                {"pos": (0.00, 0.12, 1.46), "scale": (0.08, 0.05, 0.10), "rot": (-0.2, 0.0, 0.0)},
            ]
        },
        "Hair_Spiky_Sport": {
            "type": "spiky_upward_cones",
            "base_cap_radius": 0.145,
            "clumps": [
                {"pos": (0.00, -0.05, 1.62), "scale": (0.04, 0.04, 0.08), "rot": (-0.1, 0.0, 0.0)},
                {"pos": (0.05, -0.03, 1.61), "scale": (0.04, 0.04, 0.07), "rot": (-0.1, 0.2, 0.0)},
                {"pos": (-0.05, -0.03, 1.61), "scale": (0.04, 0.04, 0.07), "rot": (-0.1, -0.2, 0.0)},
                {"pos": (0.00, 0.04, 1.60), "scale": (0.04, 0.04, 0.06), "rot": (0.1, 0.0, 0.0)},
            ]
        },
        "Hair_Parted_Neat": {
            "type": "parted_neat_with_glasses",
            "base_cap_radius": 0.146,
            "part_offset_x": 0.04,
            "has_spectacles": True,
            "glasses_pos": (0.0, -0.14, 1.46),
            "glasses_width": 0.12
        },
        "Hair_Hoodie_Dark": {
            "type": "hoodie_cowl",
            "cowl_radius": 0.165,
            "cowl_z": 1.46,
            "has_drawstrings": True
        }
    }

def get_bone_definitions() -> List[Dict[str, Any]]:
    """Trả về danh sách định nghĩa khung xương Armature chuẩn cho Stickman Base V1."""
    dims = get_base_dimensions()
    
    bones = [
        {"name": "root", "parent": None, "head": (0.0, 0.0, 0.0), "tail": (0.0, 0.0, 0.10), "deform": False},
        {"name": "pelvis", "parent": "root", "head": (0.0, 0.0, dims["hip_z"]), "tail": (0.0, 0.0, 0.86), "deform": True},
        {"name": "spine", "parent": "pelvis", "head": (0.0, 0.0, 0.86), "tail": (0.0, 0.0, 1.05), "deform": True},
        {"name": "chest", "parent": "spine", "head": (0.0, 0.0, 1.05), "tail": (0.0, 0.0, dims["neck_z_min"]), "deform": True},
        {"name": "neck", "parent": "chest", "head": (0.0, 0.0, dims["neck_z_min"]), "tail": (0.0, 0.0, dims["neck_z_max"]), "deform": True},
        {"name": "head", "parent": "neck", "head": (0.0, 0.0, dims["neck_z_max"]), "tail": (0.0, 0.0, dims["total_height"]), "deform": True},
    ]

    for side, sign in [("L", 1.0), ("R", -1.0)]:
        # Tay
        bones.extend([
            {
                "name": f"clavicle.{side}",
                "parent": "chest",
                "head": (sign * 0.03, 0.0, dims["shoulder_z"]),
                "tail": (sign * dims["shoulder_x"], 0.0, dims["shoulder_z"]),
                "deform": True
            },
            {
                "name": f"upper_arm.{side}",
                "parent": f"clavicle.{side}",
                "head": (sign * dims["shoulder_x"], 0.0, dims["shoulder_z"]),
                "tail": (sign * (dims["shoulder_x"] + 0.03), 0.0, dims["shoulder_z"] - 0.28),
                "deform": True
            },
            {
                "name": f"forearm.{side}",
                "parent": f"upper_arm.{side}",
                "head": (sign * (dims["shoulder_x"] + 0.03), 0.0, dims["shoulder_z"] - 0.28),
                "tail": (sign * (dims["shoulder_x"] + 0.05), 0.0, dims["shoulder_z"] - 0.55),
                "deform": True
            },
            {
                "name": f"hand.{side}",
                "parent": f"forearm.{side}",
                "head": (sign * (dims["shoulder_x"] + 0.05), 0.0, dims["shoulder_z"] - 0.55),
                "tail": (sign * (dims["shoulder_x"] + 0.05), 0.0, dims["shoulder_z"] - 0.55 - dims["hand_length"]),
                "deform": True
            },
            # Chân
            {
                "name": f"thigh.{side}",
                "parent": "pelvis",
                "head": (sign * dims["hip_x"], 0.0, dims["hip_z"]),
                "tail": (sign * dims["hip_x"], 0.0, dims["knee_z"]),
                "deform": True
            },
            {
                "name": f"shin.{side}",
                "parent": f"thigh.{side}",
                "head": (sign * dims["hip_x"], 0.0, dims["knee_z"]),
                "tail": (sign * dims["hip_x"], 0.0, dims["ankle_z"]),
                "deform": True
            },
            {
                "name": f"foot.{side}",
                "parent": f"shin.{side}",
                "head": (sign * dims["hip_x"], 0.0, dims["ankle_z"]),
                "tail": (sign * dims["hip_x"], -0.15, dims["floor_z"]),
                "deform": True
            },
            # IK Bones
            {
                "name": f"ik_foot.{side}",
                "parent": "root",
                "head": (sign * dims["hip_x"], 0.0, dims["ankle_z"]),
                "tail": (sign * dims["hip_x"], -0.15, dims["floor_z"]),
                "deform": False
            },
            {
                "name": f"pole_knee.{side}",
                "parent": "root",
                "head": (sign * dims["hip_x"], -0.40, dims["knee_z"]),
                "tail": (sign * dims["hip_x"], -0.45, dims["knee_z"]),
                "deform": False
            }
        ])

    return bones

# ==============================================================================
# 3. PHẦN BLENDER ENGINE (DỰNG MESH & RIGGING)
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

def create_stickman_body(name: str = "Stickman", color: str = "#eae6df", collection: Any = None, offset_x: float = 0.0) -> List[Any]:
    """Tạo toàn bộ phôi Stickman Base V1 (Đầu tròn trơn, cổ, thân capsule, tay chân ống)."""
    if not HAS_BLENDER:
        return []

    dims = get_base_dimensions()
    parts = []

    # 1. Đầu (UV Sphere)
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=32, ring_count=16,
        radius=dims["head_radius"],
        location=(offset_x, 0.0, dims["head_center_z"])
    )
    head = bpy.context.active_object
    head.name = f"{name}_Head"
    parts.append(head)

    # 2. Cổ (Cylinder)
    h_neck = dims["neck_z_max"] - dims["neck_z_min"]
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=16, radius=dims["neck_radius"], depth=h_neck,
        location=(offset_x, 0.0, (dims["neck_z_max"] + dims["neck_z_min"]) / 2.0)
    )
    neck = bpy.context.active_object
    neck.name = f"{name}_Neck"
    parts.append(neck)

    # 3. Thân Capsule (Cylinder bo tròn hai đầu)
    h_torso = dims["torso_z_max"] - dims["torso_z_min"]
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=24, radius=dims["torso_r_top"], depth=h_torso,
        location=(offset_x, 0.0, (dims["torso_z_max"] + dims["torso_z_min"]) / 2.0)
    )
    torso = bpy.context.active_object
    torso.name = f"{name}_Torso"
    parts.append(torso)

    # 4. Tay và Bàn tay (Left & Right)
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        # Cánh tay trên
        arm_z = dims["shoulder_z"] - 0.14
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=16, radius=dims["arm_radius"], depth=0.28,
            location=(offset_x + sign * (dims["shoulder_x"] + 0.015), 0.0, arm_z)
        )
        uarm = bpy.context.active_object
        uarm.name = f"{name}_UpperArm_{side}"
        parts.append(uarm)

        # Cẳng tay
        farm_z = dims["shoulder_z"] - 0.415
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=16, radius=dims["arm_radius"] * 0.9, depth=0.27,
            location=(offset_x + sign * (dims["shoulder_x"] + 0.04), 0.0, farm_z)
        )
        farm = bpy.context.active_object
        farm.name = f"{name}_Forearm_{side}"
        parts.append(farm)

        # Bàn tay (Oval sphere kèm ngón cái)
        hand_z = dims["shoulder_z"] - 0.55 - 0.05
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=16, ring_count=8, radius=0.035,
            location=(offset_x + sign * (dims["shoulder_x"] + 0.05), 0.0, hand_z)
        )
        hand = bpy.context.active_object
        hand.name = f"{name}_Hand_{side}"
        parts.append(hand)

    # 5. Chân và Bàn chân (Left & Right)
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        # Đùi
        thigh_z = (dims["hip_z"] + dims["knee_z"]) / 2.0
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=16, radius=dims["leg_radius"], depth=(dims["hip_z"] - dims["knee_z"]),
            location=(offset_x + sign * dims["hip_x"], 0.0, thigh_z)
        )
        thigh = bpy.context.active_object
        thigh.name = f"{name}_Thigh_{side}"
        parts.append(thigh)

        # Bắp chân
        shin_z = (dims["knee_z"] + dims["ankle_z"]) / 2.0
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=16, radius=dims["leg_radius"] * 0.9, depth=(dims["knee_z"] - dims["ankle_z"]),
            location=(offset_x + sign * dims["hip_x"], 0.0, shin_z)
        )
        shin = bpy.context.active_object
        shin.name = f"{name}_Shin_{side}"
        parts.append(shin)

        # Bàn chân (đế phẳng tiếp sàn Z=0)
        bpy.ops.mesh.primitive_cube_add(
            size=1.0,
            location=(offset_x + sign * dims["hip_x"], -0.06, dims["foot_height"] / 2.0)
        )
        foot = bpy.context.active_object
        foot.name = f"{name}_Foot_{side}"
        foot.scale = (dims["foot_width"], dims["foot_length"], dims["foot_height"])
        bpy.ops.object.transform_apply(scale=True)
        parts.append(foot)

    # Gán vật liệu da cho toàn bộ các phần thân
    mat_skin = create_material(f"Mat_{name}_Skin", color, roughness=0.6)
    for p in parts:
        if p and p.data:
            p.data.materials.clear()
            p.data.materials.append(mat_skin)
            if collection and p.name not in collection.objects:
                collection.objects.link(p)

    return parts

def create_hair_module(name: str, char_id: str, collection: Any = None, offset_x: float = 0.0) -> List[Any]:
    """Dựng module tóc đặc trưng cho từng nhân vật theo preset."""
    if not HAS_BLENDER:
        return []

    profiles = get_character_profiles()
    char_info = profiles[char_id]
    hair_type = char_info["hair_module"]
    hair_color = char_info["hair_color"]
    hair_parts = []

    dims = get_base_dimensions()
    mat_hair = create_material(f"Mat_{name}_{hair_type}", hair_color, roughness=0.7)

    if hair_type == "Hair_Messy_Anime":
        # Mũ tóc nền
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=24, ring_count=12,
            radius=0.146,
            location=(offset_x, 0.01, dims["head_center_z"] + 0.01)
        )
        cap = bpy.context.active_object
        cap.name = f"{name}_HairCap"
        hair_parts.append(cap)

        # Các lọn tóc khối lòa xòa
        clumps = get_hair_presets()["Hair_Messy_Anime"]["clumps"]
        for idx, cl in enumerate(clumps):
            pos_x = offset_x + cl["pos"][0]
            pos_y = cl["pos"][1]
            pos_z = cl["pos"][2]
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(pos_x, pos_y, pos_z))
            tuft = bpy.context.active_object
            tuft.name = f"{name}_HairTuft_{idx}"
            tuft.scale = cl["scale"]
            tuft.rotation_euler = cl["rot"]
            bpy.ops.object.transform_apply(scale=True, rotation=True)
            hair_parts.append(tuft)

    elif hair_type == "Hair_Spiky_Sport":
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=24, ring_count=12,
            radius=0.145,
            location=(offset_x, 0.0, dims["head_center_z"])
        )
        cap = bpy.context.active_object
        cap.name = f"{name}_HairCap_Sport"
        hair_parts.append(cap)

        # Chỏm tóc vuốt nhọn
        clumps = get_hair_presets()["Hair_Spiky_Sport"]["clumps"]
        for idx, cl in enumerate(clumps):
            pos_x = offset_x + cl["pos"][0]
            bpy.ops.mesh.primitive_cone_add(
                vertices=8, radius1=0.035, depth=0.08,
                location=(pos_x, cl["pos"][1], cl["pos"][2])
            )
            spike = bpy.context.active_object
            spike.name = f"{name}_HairSpike_{idx}"
            spike.rotation_euler = cl["rot"]
            bpy.ops.object.transform_apply(rotation=True)
            hair_parts.append(spike)

    elif hair_type == "Hair_Parted_Neat":
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=24, ring_count=12,
            radius=0.146,
            location=(offset_x, 0.005, dims["head_center_z"] + 0.005)
        )
        cap = bpy.context.active_object
        cap.name = f"{name}_HairCap_Neat"
        hair_parts.append(cap)

        # Gọng kính đen
        bpy.ops.mesh.primitive_torus_add(
            major_radius=0.04, minor_radius=0.006,
            location=(offset_x - 0.045, -0.138, dims["head_center_z"]),
            rotation=(math.radians(90), 0.0, 0.0)
        )
        glass_l = bpy.context.active_object
        glass_l.name = f"{name}_Glasses_L"
        hair_parts.append(glass_l)

        bpy.ops.mesh.primitive_torus_add(
            major_radius=0.04, minor_radius=0.006,
            location=(offset_x + 0.045, -0.138, dims["head_center_z"]),
            rotation=(math.radians(90), 0.0, 0.0)
        )
        glass_r = bpy.context.active_object
        glass_r.name = f"{name}_Glasses_R"
        hair_parts.append(glass_r)

    elif hair_type == "Hair_Hoodie_Dark":
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=24, ring_count=12,
            radius=0.165,
            location=(offset_x, 0.02, dims["head_center_z"] - 0.01)
        )
        cowl = bpy.context.active_object
        cowl.name = f"{name}_HoodieCowl"
        hair_parts.append(cowl)

    # Gán vật liệu tóc
    for hp in hair_parts:
        if hp and hp.data:
            hp.data.materials.clear()
            hp.data.materials.append(mat_hair)
            if collection and hp.name not in collection.objects:
                collection.objects.link(hp)

    return hair_parts

def create_outfit_module(name: str, char_id: str, collection: Any = None, offset_x: float = 0.0) -> List[Any]:
    """Dựng module trang phục (Áo + Quần + Giày) bọc ngoài thân theo preset."""
    if not HAS_BLENDER:
        return []

    profiles = get_character_profiles()
    char_info = profiles[char_id]
    outfit_type = char_info["outfit_module"]
    outfit_parts = []

    mat_shirt = create_material(f"Mat_{name}_Shirt", char_info["shirt_color"], roughness=0.65)
    mat_pants = create_material(f"Mat_{name}_Pants", char_info["pants_color"], roughness=0.70)
    mat_shoe = create_material(f"Mat_{name}_Shoe", char_info["shoe_color"], roughness=0.55)

    # 1. Thân áo bọc ngoài Torso
    shirt_rings = get_outfit_presets()[outfit_type]["shirt_rings"]
    z_min = min(r["z"] for r in shirt_rings)
    z_max = max(r["z"] for r in shirt_rings)
    h_shirt = z_max - z_min
    r_shirt = max(r["radius"] for r in shirt_rings)

    bpy.ops.mesh.primitive_cylinder_add(
        vertices=24, radius=r_shirt, depth=h_shirt,
        location=(offset_x, 0.0, (z_min + z_max) / 2.0)
    )
    shirt = bpy.context.active_object
    shirt.name = f"{name}_Shirt"
    shirt.data.materials.append(mat_shirt)
    outfit_parts.append(shirt)

    # 2. Quần bọc ngoài chậu & đùi
    pants_rings = get_outfit_presets()[outfit_type]["pants_rings"]
    pz_min = min(r["z"] for r in pants_rings)
    pz_max = max(r["z"] for r in pants_rings)
    h_pants = pz_max - pz_min
    r_pants = max(r["radius"] for r in pants_rings)

    bpy.ops.mesh.primitive_cylinder_add(
        vertices=24, radius=r_pants, depth=h_pants,
        location=(offset_x, 0.0, (pz_min + pz_max) / 2.0)
    )
    pants = bpy.context.active_object
    pants.name = f"{name}_Pants"
    pants.data.materials.append(mat_pants)
    outfit_parts.append(pants)

    # 3. Dép / Giày
    dims = get_base_dimensions()
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        bpy.ops.mesh.primitive_cube_add(
            size=1.0,
            location=(offset_x + sign * dims["hip_x"], -0.06, 0.02)
        )
        shoe = bpy.context.active_object
        shoe.name = f"{name}_Shoe_{side}"
        shoe.scale = (dims["foot_width"] * 1.08, dims["foot_length"] * 1.05, 0.04)
        bpy.ops.object.transform_apply(scale=True)
        shoe.data.materials.append(mat_shoe)
        outfit_parts.append(shoe)

    for op in outfit_parts:
        if collection and op.name not in collection.objects:
            collection.objects.link(op)

    return outfit_parts

def create_armature_rig(name: str = "Stickman_Rig", handedness: str = "right", collection: Any = None, offset_x: float = 0.0) -> Any:
    """Tạo Armature Rig hoàn chỉnh với IK chân và thuộc tính tay thuận."""
    if not HAS_BLENDER:
        return None

    arm_data = bpy.data.armatures.new(f"{name}_Data")
    arm_obj = bpy.data.objects.new(name, arm_data)
    
    if collection:
        collection.objects.link(arm_obj)
    else:
        bpy.context.collection.objects.link(arm_obj)

    bpy.context.view_layer.objects.active = arm_obj
    arm_obj.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")

    eb = arm_data.edit_bones
    bone_defs = get_bone_definitions()

    for bd in bone_defs:
        b = eb.new(bd["name"])
        b.head = (offset_x + bd["head"][0], bd["head"][1], bd["head"][2])
        b.tail = (offset_x + bd["tail"][0], bd["tail"][1], bd["tail"][2])
        b.use_deform = bd["deform"]

    for bd in bone_defs:
        if bd["parent"]:
            eb[bd["name"]].parent = eb[bd["parent"]]

    bpy.ops.object.mode_set(mode="OBJECT")

    # Thiết lập IK chân
    bpy.ops.object.mode_set(mode="POSE")
    pb = arm_obj.pose.bones
    for side in ["L", "R"]:
        shin_bone = pb.get(f"shin.{side}")
        if shin_bone:
            ik_con = shin_bone.constraints.new("IK")
            ik_con.target = arm_obj
            ik_con.subtarget = f"ik_foot.{side}"
            ik_con.chain_count = 2
            ik_con.pole_target = arm_obj
            ik_con.pole_subtarget = f"pole_knee.{side}"
            ik_con.pole_angle = math.radians(-90)

    # Gán custom property tay thuận
    arm_obj["handedness"] = handedness

    bpy.ops.object.mode_set(mode="OBJECT")
    return arm_obj

def build_character(char_id: str, collection_name: str = None, offset_x: float = 0.0) -> Dict[str, Any]:
    """Sinh hoàn chỉnh 1 nhân vật Stickman trong Blender kèm tóc, áo quần và rig."""
    profiles = get_character_profiles()
    if char_id not in profiles:
        raise ValueError(f"Unknown character id '{char_id}'. Available: {list(profiles.keys())}")

    p = profiles[char_id]
    result = {
        "id": char_id,
        "name": p["name"],
        "handedness": p["handedness"],
        "modules": [p["hair_module"], p["outfit_module"]],
        "created": False,
        "body_parts_count": 0,
        "hair_parts_count": 0,
        "outfit_parts_count": 0,
        "has_rig": False
    }

    if HAS_BLENDER:
        c_name = collection_name or f"Char_{char_id.upper()}"
        col = bpy.data.collections.get(c_name)
        if col is None:
            col = bpy.data.collections.new(c_name)
            bpy.context.scene.collection.children.link(col)

        # 1. Dựng Rig
        rig = create_armature_rig(f"Rig_{char_id}", handedness=p["handedness"], collection=col, offset_x=offset_x)
        result["has_rig"] = rig is not None

        # 2. Dựng Thân
        body_parts = create_stickman_body(name=f"Body_{char_id}", color=p["body_color"], collection=col, offset_x=offset_x)
        result["body_parts_count"] = len(body_parts)

        # 3. Dựng Tóc
        hair_parts = create_hair_module(name=f"Hair_{char_id}", char_id=char_id, collection=col, offset_x=offset_x)
        result["hair_parts_count"] = len(hair_parts)

        # 4. Dựng Trang phục
        outfit_parts = create_outfit_module(name=f"Cloth_{char_id}", char_id=char_id, collection=col, offset_x=offset_x)
        result["outfit_parts_count"] = len(outfit_parts)

        result["created"] = True

    return result

CHAR_LINEUP_OFFSETS = {
    "nam": -1.2,
    "nguoikia": -0.6,
    "tung": 0.0,
    "giangvien": 0.6,
    "truyvet": 1.2,
}

def build_cast_in_blender(characters: List[str] = None, save_path: str = None) -> List[Dict[str, Any]]:
    """Dựng toàn bộ dàn nhân vật hoặc danh sách được chỉ định trong Blender và lưu file .blend."""
    if characters is None:
        characters = ["nam", "nguoikia", "tung", "giangvien", "truyvet"]
    
    # Xoá Cube mặc định nếu có
    if HAS_BLENDER and "Cube" in bpy.data.objects and len(bpy.data.objects) <= 3:
        cube = bpy.data.objects.get("Cube")
        if cube:
            bpy.data.objects.remove(cube, do_unlink=True)

    results = []
    # Nếu dựng 1 nhân vật -> đặt ở tâm (offset = 0)
    # Nếu dựng nhiều nhân vật -> dàn hàng ngang theo CHAR_LINEUP_OFFSETS
    use_offsets = len(characters) > 1

    for c_id in characters:
        ox = CHAR_LINEUP_OFFSETS.get(c_id, 0.0) if use_offsets else 0.0
        res = build_character(c_id, offset_x=ox)
        results.append(res)

    if HAS_BLENDER and save_path:
        out_dir = os.path.dirname(os.path.abspath(save_path))
        os.makedirs(out_dir, exist_ok=True)
        bpy.ops.wm.save_as_mainfile(filepath=save_path)
        print(f"[BLENDER] Da luu tap tin blend tai: {save_path}")

    return results

def setup_studio_lighting(sc: Any):
    """Thiết lập 3 nguồn sáng chuẩn Studio Chiaroscuro: Key Light, Fill Light, Rim Light."""
    if not HAS_BLENDER or sc is None:
        return
    # Key Light
    kd = bpy.data.lights.new('Light_Key', 'AREA')
    kd.energy = 160.0
    kd.size = 1.5
    ko = bpy.data.objects.new('Light_Key', kd)
    ko.location = (2.2, -2.5, 2.5)
    sc.collection.objects.link(ko)

    # Fill Light
    fd = bpy.data.lights.new('Light_Fill', 'AREA')
    fd.energy = 60.0
    fd.size = 2.0
    fo = bpy.data.objects.new('Light_Fill', fd)
    fo.location = (-2.2, -2.0, 1.8)
    sc.collection.objects.link(fo)

    # Rim Light
    rd = bpy.data.lights.new('Light_Rim', 'SPOT')
    rd.energy = 220.0
    ro = bpy.data.objects.new('Light_Rim', rd)
    ro.location = (0.0, 3.2, 2.6)
    sc.collection.objects.link(ro)

def render_views(sc: Any, out_dir: str, samples: int = 24) -> List[str]:
    """Render 4 góc nhìn chuẩn (trước, nghiêng, sau, góc 3/4) xuất ảnh PNG."""
    if not HAS_BLENDER or sc is None:
        return []
    os.makedirs(out_dir, exist_ok=True)
    if hasattr(sc, 'cycles'):
        sc.render.engine = 'CYCLES'
        sc.cycles.samples = samples
    sc.render.resolution_x, sc.render.resolution_y = 720, 1080

    views = {
        'truoc': (0.0, -4.5, 0.9),
        'nghieng': (4.5, 0.0, 0.9),
        'sau': (0.0, 4.5, 0.9),
        'goc34': (3.2, -3.2, 0.9),
    }
    rendered_files = []
    for vname, loc in views.items():
        cd = bpy.data.cameras.new(f'cam_{vname}')
        cd.type = 'ORTHO'
        cd.ortho_scale = 1.95
        co = bpy.data.objects.new(f'cam_{vname}', cd)
        co.location = loc
        d = Vector((0.0, 0.0, 0.9)) - Vector(loc)
        co.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
        sc.collection.objects.link(co)
        sc.camera = co
        out_file = os.path.join(out_dir, f'{vname}.png')
        sc.render.filepath = out_file
        bpy.ops.render.render(write_still=True)
        rendered_files.append(out_file)
        bpy.data.objects.remove(co, do_unlink=True)
        bpy.data.cameras.remove(cd)
    return rendered_files

def main():
    parser = argparse.ArgumentParser(description="Script dựng dàn nhân vật Stickman 3D Kiểu B")
    parser.add_argument("--character", choices=["nam", "nguoikia", "tung", "giangvien", "truyvet", "all"], default="all")
    parser.add_argument("--save", "--blend", dest="save", type=str, default="", help="Đường dẫn lưu file .blend")
    parser.add_argument("--render", type=str, default="", help="Thư mục xuất ảnh render turnaround")
    parser.add_argument("--samples", type=int, default=24, help="Số samples khi render")
    
    # Nếu chạy trong Blender GUI, sys.argv có thể chứa đường dẫn file blend -> chỉ parse sau '--'
    if HAS_BLENDER:
        argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    else:
        argv = sys.argv[1:]

    args = parser.parse_args(argv)

    chars = ["nam", "nguoikia", "tung", "giangvien", "truyvet"] if args.character == "all" else [args.character]

    if HAS_BLENDER:
        print("=== BẮT ĐẦU DỰNG DÀN NHÂN VẬT STICKMAN 3D TRONG BLENDER ===")
        save_target = args.save if args.save else None
        results = build_cast_in_blender(characters=chars, save_path=save_target)
        print(f"Đã hoàn thành {len(results)} nhân vật: {[r['id'] for r in results]}")

        if args.render:
            sc = bpy.context.scene
            setup_studio_lighting(sc)
            out_render = os.path.abspath(args.render)
            print(f"Đang render 4 góc nhìn vào thư mục: {out_render} ...")
            render_views(sc, out_render, samples=args.samples)
            print(f"Render hoàn tất!")
    else:
        print(f"[MÔI TRƯỜNG PYTHON STANDALONE] Định nghĩa 5 nhân vật và mô-đun toán học sẵn sàng cho: {chars}")

if __name__ == "__main__":
    main()
