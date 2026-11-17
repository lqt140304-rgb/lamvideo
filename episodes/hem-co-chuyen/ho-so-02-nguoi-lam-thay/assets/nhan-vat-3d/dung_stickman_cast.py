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
    import bmesh
    import mathutils
    from mathutils import Vector, Euler, Matrix
    HAS_BLENDER = True
except ImportError:
    bpy = None
    bmesh = None
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
            "expression": "anxious",
            "hair_module": "Hair_Messy_Anime",
            "hair_color": "#1a1a1e",
            "outfit_module": "Outfit_Oversized_Green",
            "shirt_color": "#5c7a70",
            "pants_color": "#707370",
            "shoe_color": "#425850",
            "accessory": "slippers",
            "body_color": "#f2cfb6",
            "eerie_water_leak": False,
        },
        "nguoikia": {
            "name": "Người Kia (Bản sao gương)",
            "role": "doppelganger_antagonist",
            "handedness": "left",
            "expression": "eerie_calm",
            "hair_module": "Hair_Messy_Anime",
            "hair_color": "#1a1a1e",
            "outfit_module": "Outfit_Oversized_Green",
            "shirt_color": "#5c7a70",
            "pants_color": "#707370",
            "shoe_color": "#425850",
            "accessory": "slippers",
            "body_color": "#f2cfb6",
            "eerie_water_leak": True,
        },
        "tung": {
            "name": "Tùng (Bạn phòng trọ)",
            "role": "roommate",
            "handedness": "right",
            "expression": "confident",
            "hair_module": "Hair_Spiky_Sport",
            "hair_color": "#1a1a1e",
            "outfit_module": "Outfit_Sport_Orange",
            "shirt_color": "#d4673f",
            "pants_color": "#2c3138",
            "shoe_color": "#ffffff",
            "accessory": "sneakers",
            "body_color": "#e2b091",
            "eerie_water_leak": False,
        },
        "giangvien": {
            "name": "Giảng viên Lab 402",
            "role": "lecturer",
            "handedness": "right",
            "expression": "serious",
            "hair_module": "Hair_Parted_Neat",
            "hair_color": "#18181c",
            "outfit_module": "Outfit_Formal_Cream",
            "shirt_color": "#f3f0e6",
            "pants_color": "#2f3b53",
            "shoe_color": "#1f1f22",
            "accessory": "spectacles",
            "body_color": "#ecc8b2",
            "eerie_water_leak": False,
        },
        "truyvet": {
            "name": "Người Truy Vết",
            "role": "series_investigator",
            "handedness": "right",
            "expression": "mysterious",
            "hair_module": "Hair_Hoodie_Dark",
            "hair_color": "#111114",
            "outfit_module": "Outfit_Tracker_Charcoal",
            "shirt_color": "#2b2b2e",
            "pants_color": "#3f423b",
            "shoe_color": "#1a1c1c",
            "accessory": "crimson_trim",
            "body_color": "#ecc8b2",
            "eerie_water_leak": False,
        },
    }


def get_crowd_profiles() -> Dict[str, Dict[str, Any]]:
    """Trả về từ điển định nghĩa 4 nhân vật quần chúng (khu trọ, giảng đường, hẻm phố)."""
    return {
        "qc_sinhvien_nam": {
            "name": "Sinh viên Nam (Quần chúng)",
            "role": "crowd_student_male",
            "handedness": "right",
            "expression": "neutral_calm",
            "hair_module": "Hair_Neat_Short",
            "hair_color": "#1e1e22",
            "outfit_module": "Outfit_Student_Blue",
            "shirt_color": "#5a7896",
            "pants_color": "#3b4656",
            "shoe_color": "#2a2d34",
            "accessory": "sneakers",
            "body_color": "#f0cbb2",
            "eerie_water_leak": False,
        },
        "qc_sinhvien_nu": {
            "name": "Sinh viên Nữ (Quần chúng)",
            "role": "crowd_student_female",
            "handedness": "right",
            "expression": "confident",
            "hair_module": "Hair_Bob_Cut",
            "hair_color": "#261e1c",
            "outfit_module": "Outfit_Student_Pastel",
            "shirt_color": "#c98a82",
            "pants_color": "#333842",
            "shoe_color": "#e8e4dc",
            "accessory": "sneakers",
            "body_color": "#f4d5c0",
            "eerie_water_leak": False,
        },
        "qc_baove": {
            "name": "Chú Bảo vệ (Quần chúng)",
            "role": "crowd_security_guard",
            "handedness": "right",
            "expression": "serious",
            "hair_module": "Hair_Guard_Cap",
            "hair_color": "#223042",
            "outfit_module": "Outfit_Guard_Uniform",
            "shirt_color": "#3d5a73",
            "pants_color": "#232830",
            "shoe_color": "#18181b",
            "accessory": "guard_cap",
            "body_color": "#d9a484",
            "eerie_water_leak": False,
        },
        "qc_hangxom": {
            "name": "Hàng xóm (Quần chúng)",
            "role": "crowd_neighbor",
            "handedness": "right",
            "expression": "neutral_calm",
            "hair_module": "Hair_Bun_Neat",
            "hair_color": "#222024",
            "outfit_module": "Outfit_Neighbor_Casual",
            "shirt_color": "#7c6a58",
            "pants_color": "#56595e",
            "shoe_color": "#3c3834",
            "accessory": "slippers",
            "body_color": "#e5bca2",
            "eerie_water_leak": False,
        },
    }


def get_vietnamese_crowd_profiles() -> Dict[str, Dict[str, Any]]:
    """Trả về từ điển định nghĩa 4 nhân vật phụ đặc trưng đời sống đường phố / xóm trọ Việt Nam."""
    return {
        "vn_xeom_congnghe": {
            "name": "Tài xế Công nghệ (Xe ôm)",
            "role": "vn_moto_driver",
            "handedness": "right",
            "expression": "confident",
            "hair_module": "Hair_Helmet_Moto",
            "hair_color": "#1b5e20",
            "outfit_module": "Outfit_Moto_Driver",
            "shirt_color": "#2e7d32",
            "pants_color": "#263238",
            "shoe_color": "#1c1c1e",
            "accessory": "stripe_reflector",
            "body_color": "#e8b99b",
            "eerie_water_leak": False,
        },
        "vn_banhang_viahe": {
            "name": "Cô Bán Quán Vỉa Hè",
            "role": "vn_street_vendor",
            "handedness": "right",
            "expression": "neutral_calm",
            "hair_module": "Hair_Non_La",
            "hair_color": "#dfc599",
            "outfit_module": "Outfit_Street_Vendor",
            "shirt_color": "#c4883b",
            "pants_color": "#373330",
            "shoe_color": "#eaeaea",
            "accessory": "apron",
            "body_color": "#d49d7d",
            "eerie_water_leak": False,
        },
        "vn_chutro": {
            "name": "Cô Chủ Trọ",
            "role": "vn_landlady",
            "handedness": "right",
            "expression": "serious",
            "hair_module": "Hair_Claw_Clip",
            "hair_color": "#1f1d20",
            "outfit_module": "Outfit_Landlady",
            "shirt_color": "#884d72",
            "pants_color": "#3a3b45",
            "shoe_color": "#2d282a",
            "accessory": "waist_bag_keys",
            "body_color": "#f0c8b0",
            "eerie_water_leak": False,
        },
        "vn_bac_mucoi": {
            "name": "Bác Xe Ôm Mũ Cối (Cựu binh)",
            "role": "vn_veteran_driver",
            "handedness": "right",
            "expression": "neutral_calm",
            "hair_module": "Hair_Pith_Helmet",
            "hair_color": "#354f33",
            "outfit_module": "Outfit_Veteran_Kaki",
            "shirt_color": "#5a6b52",
            "pants_color": "#434a3e",
            "shoe_color": "#222222",
            "accessory": "pith_helmet",
            "body_color": "#c98967",
            "eerie_water_leak": False,
        },
    }


def get_all_character_profiles() -> Dict[str, Dict[str, Any]]:
    """Trả về toàn bộ dàn nhân vật chính, quần chúng sinh viên và nhân vật phụ Việt Nam."""
    merged = dict(get_character_profiles())
    merged.update(get_crowd_profiles())
    merged.update(get_vietnamese_crowd_profiles())
    return merged

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
        },
        "Outfit_Student_Blue": {
            "type": "casual_tshirt_and_jeans",
            "shirt_rings": [
                {"name": "co_ao", "z": 1.30, "radius": 0.062},
                {"name": "vai_ao", "z": 1.25, "radius": 0.140},
                {"name": "nguc_ao", "z": 1.15, "radius": 0.136},
                {"name": "eo_ao", "z": 0.95, "radius": 0.132},
                {"name": "gau_ao", "z": 0.83, "radius": 0.134},
            ],
            "pants_rings": [
                {"name": "cap_quan", "z": 0.85, "radius": 0.128},
                {"name": "day_quan", "z": 0.76, "radius": 0.130},
                {"name": "gau_quan", "z": 0.10, "radius": 0.066},
            ]
        },
        "Outfit_Student_Pastel": {
            "type": "long_sleeve_pastel_and_trousers",
            "shirt_rings": [
                {"name": "co_ao", "z": 1.30, "radius": 0.060},
                {"name": "vai_ao", "z": 1.25, "radius": 0.136},
                {"name": "nguc_ao", "z": 1.15, "radius": 0.132},
                {"name": "eo_ao", "z": 0.95, "radius": 0.126},
                {"name": "gau_ao", "z": 0.83, "radius": 0.128},
            ],
            "pants_rings": [
                {"name": "cap_quan", "z": 0.85, "radius": 0.126},
                {"name": "day_quan", "z": 0.76, "radius": 0.128},
                {"name": "gau_quan", "z": 0.10, "radius": 0.064},
            ]
        },
        "Outfit_Guard_Uniform": {
            "type": "guard_uniform_shirt_and_trousers",
            "shirt_rings": [
                {"name": "co_ao", "z": 1.30, "radius": 0.062},
                {"name": "vai_ao", "z": 1.25, "radius": 0.142},
                {"name": "nguc_ao", "z": 1.15, "radius": 0.138},
                {"name": "eo_ao", "z": 0.95, "radius": 0.134},
                {"name": "gau_ao", "z": 0.84, "radius": 0.130},
            ],
            "pants_rings": [
                {"name": "cap_quan", "z": 0.85, "radius": 0.130},
                {"name": "day_quan", "z": 0.76, "radius": 0.132},
                {"name": "gau_quan", "z": 0.10, "radius": 0.066},
            ]
        },
        "Outfit_Neighbor_Casual": {
            "type": "casual_cardigan_and_pants",
            "shirt_rings": [
                {"name": "co_ao", "z": 1.30, "radius": 0.064},
                {"name": "vai_ao", "z": 1.25, "radius": 0.144},
                {"name": "nguc_ao", "z": 1.15, "radius": 0.140},
                {"name": "eo_ao", "z": 0.95, "radius": 0.138},
                {"name": "gau_ao", "z": 0.81, "radius": 0.140},
            ],
            "pants_rings": [
                {"name": "cap_quan", "z": 0.83, "radius": 0.130},
                {"name": "day_quan", "z": 0.76, "radius": 0.132},
                {"name": "gau_quan", "z": 0.10, "radius": 0.068},
            ]
        },
        "Outfit_Moto_Driver": {
            "type": "windbreaker_jacket_and_jeans",
            "shirt_rings": [
                {"name": "co_ao", "z": 1.30, "radius": 0.065},
                {"name": "vai_ao", "z": 1.25, "radius": 0.146},
                {"name": "nguc_ao", "z": 1.15, "radius": 0.142},
                {"name": "eo_ao", "z": 0.95, "radius": 0.138},
                {"name": "gau_ao", "z": 0.81, "radius": 0.142},
            ],
            "pants_rings": [
                {"name": "cap_quan", "z": 0.83, "radius": 0.130},
                {"name": "day_quan", "z": 0.76, "radius": 0.132},
                {"name": "gau_quan", "z": 0.10, "radius": 0.068},
            ]
        },
        "Outfit_Street_Vendor": {
            "type": "traditional_blouse_and_apron",
            "shirt_rings": [
                {"name": "co_ao", "z": 1.30, "radius": 0.062},
                {"name": "vai_ao", "z": 1.25, "radius": 0.140},
                {"name": "nguc_ao", "z": 1.15, "radius": 0.136},
                {"name": "eo_ao", "z": 0.95, "radius": 0.132},
                {"name": "gau_ao", "z": 0.82, "radius": 0.136},
            ],
            "pants_rings": [
                {"name": "cap_quan", "z": 0.84, "radius": 0.128},
                {"name": "day_quan", "z": 0.76, "radius": 0.130},
                {"name": "gau_quan", "z": 0.10, "radius": 0.072},
            ]
        },
        "Outfit_Landlady": {
            "type": "mature_blouse_and_trousers",
            "shirt_rings": [
                {"name": "co_ao", "z": 1.30, "radius": 0.063},
                {"name": "vai_ao", "z": 1.25, "radius": 0.142},
                {"name": "nguc_ao", "z": 1.15, "radius": 0.138},
                {"name": "eo_ao", "z": 0.95, "radius": 0.134},
                {"name": "gau_ao", "z": 0.82, "radius": 0.136},
            ],
            "pants_rings": [
                {"name": "cap_quan", "z": 0.84, "radius": 0.128},
                {"name": "day_quan", "z": 0.76, "radius": 0.130},
                {"name": "gau_quan", "z": 0.10, "radius": 0.066},
            ]
        },
        "Outfit_Veteran_Kaki": {
            "type": "kaki_shirt_and_trousers",
            "shirt_rings": [
                {"name": "co_ao", "z": 1.30, "radius": 0.062},
                {"name": "vai_ao", "z": 1.25, "radius": 0.142},
                {"name": "nguc_ao", "z": 1.15, "radius": 0.138},
                {"name": "eo_ao", "z": 0.95, "radius": 0.134},
                {"name": "gau_ao", "z": 0.83, "radius": 0.132},
            ],
            "pants_rings": [
                {"name": "cap_quan", "z": 0.85, "radius": 0.130},
                {"name": "day_quan", "z": 0.76, "radius": 0.132},
                {"name": "gau_quan", "z": 0.10, "radius": 0.066},
            ]
        }
    }

def get_hair_presets() -> Dict[str, Dict[str, Any]]:
    """Trả về đặc tả hình học cho từng module tóc."""
    return {
        "Hair_Messy_Anime": {
            "type": "messy_anime_locks",
            "base_cap_radius": 0.146,
            "locks": [
                # 5 lọn tóc mái rủ trán mềm mại (dừng trên Z=1.50 để không che mắt/lông mày)
                {"points": [(0.00, -0.04, 1.595), (0.005, -0.105, 1.565), (0.012, -0.136, 1.525), (0.018, -0.138, 1.498)], "radii": [0.028, 0.024, 0.015, 0.004]},
                {"points": [(-0.03, -0.04, 1.590), (-0.045, -0.100, 1.558), (-0.058, -0.128, 1.522), (-0.065, -0.125, 1.496)], "radii": [0.026, 0.022, 0.014, 0.004]},
                {"points": [(0.03, -0.04, 1.590), (0.048, -0.100, 1.558), (0.064, -0.125, 1.520), (0.072, -0.120, 1.495)], "radii": [0.026, 0.022, 0.014, 0.004]},
                {"points": [(-0.06, -0.02, 1.575), (-0.095, -0.072, 1.542), (-0.114, -0.088, 1.508), (-0.118, -0.085, 1.482)], "radii": [0.024, 0.020, 0.013, 0.004]},
                {"points": [(0.06, -0.02, 1.575), (0.095, -0.072, 1.542), (0.114, -0.088, 1.508), (0.118, -0.085, 1.482)], "radii": [0.024, 0.020, 0.013, 0.004]},
                # 2 lọn tóc mai ôm thái dương
                {"points": [(-0.09, 0.01, 1.545), (-0.130, -0.015, 1.495), (-0.138, -0.025, 1.455), (-0.134, -0.028, 1.425)], "radii": [0.024, 0.019, 0.012, 0.004]},
                {"points": [(0.09, 0.01, 1.545), (0.130, -0.015, 1.495), (0.138, -0.025, 1.455), (0.134, -0.028, 1.425)], "radii": [0.024, 0.019, 0.012, 0.004]},
                # 3 lọn tóc gáy rủ sau đầu
                {"points": [(0.00, 0.08, 1.555), (0.00, 0.135, 1.495), (0.00, 0.148, 1.430), (0.00, 0.138, 1.375)], "radii": [0.032, 0.028, 0.018, 0.005]},
                {"points": [(-0.05, 0.07, 1.545), (-0.075, 0.122, 1.485), (-0.082, 0.130, 1.425), (-0.076, 0.118, 1.380)], "radii": [0.028, 0.024, 0.015, 0.004]},
                {"points": [(0.05, 0.07, 1.545), (0.075, 0.122, 1.485), (0.082, 0.130, 1.425), (0.076, 0.118, 1.380)], "radii": [0.028, 0.024, 0.015, 0.004]},
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
        },
        "Hair_Neat_Short": {
            "type": "neat_short_locks",
            "base_cap_radius": 0.145,
            "locks": [
                {"points": [(-0.02, -0.04, 1.592), (0.01, -0.105, 1.565), (0.04, -0.130, 1.530), (0.06, -0.125, 1.505)], "radii": [0.026, 0.020, 0.013, 0.004]},
                {"points": [(-0.05, -0.03, 1.582), (-0.07, -0.092, 1.552), (-0.09, -0.112, 1.520)], "radii": [0.022, 0.016, 0.005]},
                {"points": [(0.04, -0.03, 1.582), (0.07, -0.090, 1.552), (0.09, -0.108, 1.518)], "radii": [0.022, 0.016, 0.005]},
            ]
        },
        "Hair_Bob_Cut": {
            "type": "bob_cut_locks",
            "base_cap_radius": 0.147,
            "locks": [
                # Tóc mái thưa nhẹ
                {"points": [(-0.02, -0.04, 1.592), (-0.03, -0.105, 1.565), (-0.04, -0.132, 1.525), (-0.045, -0.130, 1.502)], "radii": [0.022, 0.018, 0.012, 0.004]},
                {"points": [(0.02, -0.04, 1.592), (0.03, -0.105, 1.565), (0.04, -0.132, 1.525), (0.045, -0.130, 1.502)], "radii": [0.022, 0.018, 0.012, 0.004]},
                # 2 lọn tóc bob dài ôm má/cằm xuống vai
                {"points": [(-0.08, 0.00, 1.565), (-0.136, -0.020, 1.490), (-0.142, -0.030, 1.410), (-0.125, -0.025, 1.345)], "radii": [0.032, 0.028, 0.024, 0.012]},
                {"points": [(0.08, 0.00, 1.565), (0.136, -0.020, 1.490), (0.142, -0.030, 1.410), (0.125, -0.025, 1.345)], "radii": [0.032, 0.028, 0.024, 0.012]},
                # Tóc bob sau gáy
                {"points": [(0.00, 0.07, 1.555), (0.00, 0.142, 1.475), (0.00, 0.148, 1.395), (0.00, 0.135, 1.340)], "radii": [0.042, 0.038, 0.032, 0.016]},
            ]
        },
        "Hair_Guard_Cap": {
            "type": "guard_cap_with_visor",
            "base_cap_radius": 0.152,
        },
        "Hair_Bun_Neat": {
            "type": "bun_neat",
            "base_cap_radius": 0.146,
            "bun_radius": 0.052,
        },
        "Hair_Helmet_Moto": {
            "type": "moto_helmet_half",
            "base_cap_radius": 0.155,
        },
        "Hair_Non_La": {
            "type": "traditional_conical_hat",
            "base_cap_radius": 0.145,
            "cone_radius": 0.28,
            "cone_depth": 0.16,
        },
        "Hair_Claw_Clip": {
            "type": "claw_clip_updo",
            "base_cap_radius": 0.146,
        },
        "Hair_Pith_Helmet": {
            "type": "pith_helmet_kaki",
            "base_cap_radius": 0.154,
            "brim_radius": 0.21,
        }
    }


def get_expression_presets() -> Dict[str, Dict[str, Any]]:
    """Trả về thông số biểu cảm khuôn mặt 3D tối giản (Mắt, Lông mày, Miệng)."""
    return {
        "anxious": {
            "eye_x": 0.045,
            "eye_z": 1.460,
            "eye_scale": (0.013, 0.008, 0.018),
            "brow_z": 1.490,
            "brow_tilt_deg": 14.0,     # Đầu trong nhíu lên lo âu
            "mouth_z": 1.412,
            "mouth_width": 0.022,
            "mouth_curve": -0.006,     # Mím nhẹ hơi lo lắng
            "mouth_asymmetry": 0.0,
        },
        "eerie_calm": {
            "eye_x": 0.045,
            "eye_z": 1.460,
            "eye_scale": (0.014, 0.008, 0.014),
            "brow_z": 1.486,
            "brow_tilt_deg": -4.0,     # Bình thản lạnh lùng
            "mouth_z": 1.412,
            "mouth_width": 0.025,
            "mouth_curve": 0.007,      # Cười mỉm bí hiểm
            "mouth_asymmetry": 0.003,
        },
        "confident": {
            "eye_x": 0.045,
            "eye_z": 1.460,
            "eye_scale": (0.014, 0.008, 0.018),
            "brow_z": 1.490,
            "brow_tilt_deg": -7.0,     # Tự tin năng động
            "mouth_z": 1.412,
            "mouth_width": 0.026,
            "mouth_curve": 0.009,      # Cười tươi thân thiện
            "mouth_asymmetry": 0.0,
        },
        "serious": {
            "eye_x": 0.045,            # Khớp chính giữa gọng kính Giảng viên
            "eye_z": 1.460,
            "eye_scale": (0.012, 0.008, 0.015),
            "brow_z": 1.488,
            "brow_tilt_deg": 0.0,      # Nghiêm nghị điềm đạm
            "mouth_z": 1.410,
            "mouth_width": 0.022,
            "mouth_curve": 0.0,        # Miệng thẳng nghiêm túc
            "mouth_asymmetry": 0.0,
        },
        "mysterious": {
            "eye_x": 0.045,
            "eye_z": 1.460,
            "eye_scale": (0.013, 0.008, 0.013),
            "brow_z": 1.486,
            "brow_tilt_deg": -6.0,     # Trầm tư bí ẩn dưới mũ hoodie
            "mouth_z": 1.412,
            "mouth_width": 0.020,
            "mouth_curve": 0.0,
            "mouth_asymmetry": 0.0,
        },
        "neutral_calm": {
            "eye_x": 0.045,
            "eye_z": 1.460,
            "eye_scale": (0.013, 0.008, 0.016),
            "brow_z": 1.488,
            "brow_tilt_deg": -2.0,     # Tự nhiên, thư thái
            "mouth_z": 1.412,
            "mouth_width": 0.022,
            "mouth_curve": 0.004,      # Cười nhẹ tự nhiên
            "mouth_asymmetry": 0.0,
        },
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
                "name": f"ik_hand.{side}",
                "parent": "root",
                "head": (sign * (dims["shoulder_x"] + 0.05), 0.0, dims["shoulder_z"] - 0.55),
                "tail": (sign * (dims["shoulder_x"] + 0.05), 0.0, dims["shoulder_z"] - 0.55 - dims["hand_length"]),
                "deform": False
            },
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

def create_material(
    name: str,
    hex_color: str,
    roughness: float = 0.65,
    sss_weight: float = 0.0,
    sheen_weight: float = 0.0,
    transmission: float = 0.0,
    specular: float = 0.5,
    metallic: float = 0.0
) -> Any:
    """Tạo vật liệu Principled BSDF PBR nâng cao (SSS men sứ, Sheen sợi vải, Transmission kính)."""
    if not HAS_BLENDER:
        return None
    
    mat = bpy.data.materials.get(name)
    if mat is None:
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
    
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        rgba = hex_to_rgb(hex_color)
        if "Base Color" in bsdf.inputs:
            bsdf.inputs["Base Color"].default_value = rgba
        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = roughness
        if "Metallic" in bsdf.inputs:
            bsdf.inputs["Metallic"].default_value = metallic

        # Subsurface Scattering cho men sứ / đất sét mỹ thuật
        sss_key = "Subsurface Weight" if "Subsurface Weight" in bsdf.inputs else ("Subsurface" if "Subsurface" in bsdf.inputs else None)
        if sss_key and sss_weight > 0.0:
            bsdf.inputs[sss_key].default_value = sss_weight
            if "Subsurface Radius" in bsdf.inputs:
                bsdf.inputs["Subsurface Radius"].default_value = (0.12, 0.06, 0.03)

        # Sheen cho vải vóc
        sheen_key = "Sheen Weight" if "Sheen Weight" in bsdf.inputs else ("Sheen" if "Sheen" in bsdf.inputs else None)
        if sheen_key and sheen_weight > 0.0:
            bsdf.inputs[sheen_key].default_value = sheen_weight
            if "Sheen Roughness" in bsdf.inputs:
                bsdf.inputs["Sheen Roughness"].default_value = 0.5

        # Transmission cho tròng kính
        trans_key = "Transmission Weight" if "Transmission Weight" in bsdf.inputs else ("Transmission" if "Transmission" in bsdf.inputs else None)
        if trans_key and transmission > 0.0:
            bsdf.inputs[trans_key].default_value = transmission

        # Specular
        spec_key = "Specular IOR Level" if "Specular IOR Level" in bsdf.inputs else ("Specular" if "Specular" in bsdf.inputs else None)
        if spec_key:
            bsdf.inputs[spec_key].default_value = specular

    return mat

def smooth_object(obj: Any, subsurf: int = 0, bevel_width: float = 0.0):
    """Làm mịn mesh:
    - Nếu là cylinder/box: làm mịn mặt bên quads và thêm Bevel để bo tròn góc mà không làm méo hai đầu.
    - Nếu là sphere/torus: làm mịn toàn bộ và hỗ trợ Subdivision Surface.
    """
    if not HAS_BLENDER or not obj or obj.type != 'MESH':
        return
    poly_count = len(obj.data.polygons)
    for p in obj.data.polygons:
        if len(p.vertices) == 4 or poly_count > 60:
            p.use_smooth = True
        else:
            p.use_smooth = False
    if bevel_width > 0:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = bevel_width
        bev.segments = 2
        bev.limit_method = 'ANGLE'
    if subsurf > 0:
        mod = obj.modifiers.new(name="Subdivision", type='SUBSURF')
        mod.levels = subsurf
        mod.render_levels = subsurf


def create_loft_mesh(
    name: str,
    rings: List[Tuple[float, float, float, float]],
    segments: int = 32,
    scale_y: float = 1.0,
    cap_bottom: bool = True,
    cap_top: bool = True,
) -> Any:
    """Dựng mesh liền mạch bằng cách nối các vòng tròn (cx, cy, z, radius) qua bmesh."""
    if not HAS_BLENDER:
        return None
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()

    ring_verts_list = []
    for cx, cy, z, r in rings:
        curr_verts = []
        for i in range(segments):
            ang = 2.0 * math.pi * i / segments
            vx = cx + r * math.cos(ang)
            vy = cy + r * scale_y * math.sin(ang)
            curr_verts.append(bm.verts.new((vx, vy, z)))
        ring_verts_list.append(curr_verts)

    for r_idx in range(len(ring_verts_list) - 1):
        v1 = ring_verts_list[r_idx]
        v2 = ring_verts_list[r_idx + 1]
        for i in range(segments):
            ni = (i + 1) % segments
            bm.faces.new((v1[i], v1[ni], v2[ni], v2[i]))

    if cap_bottom and ring_verts_list and rings:
        cx, cy, z, r = rings[0]
        inner_v = []
        for i in range(segments):
            ang = 2.0 * math.pi * i / segments
            inner_v.append(bm.verts.new((cx + r * 0.82 * math.cos(ang), cy + r * 0.82 * scale_y * math.sin(ang), z + 0.003)))
        v0 = ring_verts_list[0]
        for i in range(segments):
            ni = (i + 1) % segments
            bm.faces.new((inner_v[i], inner_v[ni], v0[ni], v0[i]))
        c_bot = bm.verts.new((cx, cy, z + 0.004))
        for i in range(segments):
            ni = (i + 1) % segments
            bm.faces.new((c_bot, inner_v[ni], inner_v[i]))

    if cap_top and ring_verts_list and rings:
        cx, cy, z, r = rings[-1]
        inner_v = []
        for i in range(segments):
            ang = 2.0 * math.pi * i / segments
            inner_v.append(bm.verts.new((cx + r * 0.82 * math.cos(ang), cy + r * 0.82 * scale_y * math.sin(ang), z - 0.003)))
        vt = ring_verts_list[-1]
        for i in range(segments):
            ni = (i + 1) % segments
            bm.faces.new((vt[i], vt[ni], inner_v[ni], inner_v[i]))
        c_top = bm.verts.new((cx, cy, z - 0.004))
        for i in range(segments):
            ni = (i + 1) % segments
            bm.faces.new((inner_v[i], inner_v[ni], c_top))

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return obj


def create_curved_tube_mesh(
    name: str,
    points: List[Tuple[float, float, float]],
    radii: List[float],
    segments: int = 16,
) -> Any:
    """Dựng ống tròn hữu cơ dọc theo đường cong 3D với bán kính thay đổi (tóc, lông mày, miệng)."""
    if not HAS_BLENDER or len(points) < 2:
        return None
    from mathutils import Vector

    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()

    vecs = [Vector(p) for p in points]
    ring_verts_list = []
    prev_normal = None

    for idx, p in enumerate(vecs):
        if idx == 0:
            t = (vecs[1] - vecs[0]).normalized()
        elif idx == len(vecs) - 1:
            t = (vecs[-1] - vecs[-2]).normalized()
        else:
            t = (vecs[idx + 1] - vecs[idx - 1]).normalized()

        if t.length < 1e-6:
            t = Vector((0.0, 0.0, 1.0))

        if prev_normal is None:
            ref = Vector((0.0, 1.0, 0.0)) if abs(t.y) < 0.85 else Vector((1.0, 0.0, 0.0))
            n = t.cross(ref).normalized()
        else:
            n = prev_normal - prev_normal.dot(t) * t
            if n.length < 1e-6:
                ref = Vector((0.0, 1.0, 0.0)) if abs(t.y) < 0.85 else Vector((1.0, 0.0, 0.0))
                n = t.cross(ref).normalized()
            else:
                n.normalize()
        prev_normal = n
        b = t.cross(n).normalized()

        r = radii[idx]
        curr_verts = []
        for s in range(segments):
            ang = 2.0 * math.pi * s / segments
            offset = r * (math.cos(ang) * n + math.sin(ang) * b)
            curr_verts.append(bm.verts.new(p + offset))
        ring_verts_list.append(curr_verts)

    for r_idx in range(len(ring_verts_list) - 1):
        v1 = ring_verts_list[r_idx]
        v2 = ring_verts_list[r_idx + 1]
        for s in range(segments):
            ns = (s + 1) % segments
            bm.faces.new((v1[s], v1[ns], v2[ns], v2[s]))

    # Cap start and end with center fan
    c_start = bm.verts.new(vecs[0])
    v0 = ring_verts_list[0]
    for s in range(segments):
        ns = (s + 1) % segments
        bm.faces.new((c_start, v0[ns], v0[s]))

    c_end = bm.verts.new(vecs[-1])
    vt = ring_verts_list[-1]
    for s in range(segments):
        ns = (s + 1) % segments
        bm.faces.new((vt[s], vt[ns], c_end))

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return obj


def create_stickman_body(name: str = "Stickman", color: str = "#eae6df", collection: Any = None, offset_x: float = 0.0) -> List[Any]:
    """Tạo toàn bộ phôi Stickman Base V1 liền mạch (Đầu, cổ, thân capsule hữu cơ, tay chân liên tục)."""
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

    # 2. Cổ liền thân và đầu (cắm sâu vào thân z=1.23 và đầu z=1.37)
    neck_rings = [
        (offset_x, 0.0, 1.23, dims["neck_radius"] * 1.35),
        (offset_x, 0.0, 1.27, dims["neck_radius"] * 1.05),
        (offset_x, 0.0, 1.32, dims["neck_radius"]),
        (offset_x, 0.0, 1.37, dims["neck_radius"] * 1.05),
    ]
    neck = create_loft_mesh(f"{name}_Neck", neck_rings, segments=24)
    parts.append(neck)

    # 3. Thân Capsule Hữu Cơ liền vai (dẹt nhẹ trước-sau scale_y=0.78)
    torso_rings = [
        (offset_x, 0.0, 0.72, 0.045),
        (offset_x, 0.0, 0.76, 0.115),
        (offset_x, 0.0, 0.88, 0.110),
        (offset_x, 0.0, 1.05, 0.122),
        (offset_x, 0.0, 1.22, 0.124),
        (offset_x, 0.0, 1.27, 0.095),
        (offset_x, 0.0, 1.29, 0.055),
    ]
    torso = create_loft_mesh(f"{name}_Torso", torso_rings, segments=32, scale_y=0.78)
    parts.append(torso)

    # 4. Tay và Bàn tay liền mạch từ Vai -> Khuỷu -> Cổ tay -> Bàn tay
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        sx = offset_x + sign * dims["shoulder_x"]
        sz = dims["shoulder_z"] - 0.025
        ex = offset_x + sign * (dims["shoulder_x"] + 0.025)
        ez = dims["shoulder_z"] - 0.28
        wx = offset_x + sign * (dims["shoulder_x"] + 0.045)
        hand_z = dims["shoulder_z"] - 0.55 - 0.05

        # Khớp cầu vai nối vào thân (nằm gọn bên trong vai áo)
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=20, ring_count=10, radius=dims["arm_radius"] * 0.95,
            location=(sx - sign * 0.015, 0.0, sz - 0.005)
        )
        sh_joint = bpy.context.active_object
        sh_joint.name = f"{name}_ShoulderJoint_{side}"
        parts.append(sh_joint)

        # Ống tay liên tục cắm sâu từ vai xuống lòng bàn tay
        arm_rings = [
            (sx - sign * 0.015, 0.0, sz - 0.005, dims["arm_radius"] * 0.92),
            (sx, 0.0, sz - 0.055, dims["arm_radius"]),
            (ex, 0.0, ez, dims["arm_radius"] * 0.92),
            (wx, 0.0, hand_z + 0.04, dims["arm_radius"] * 0.85),
            (wx, 0.0, hand_z + 0.005, dims["arm_radius"] * 0.78),
        ]
        arm = create_loft_mesh(f"{name}_Arm_{side}", arm_rings, segments=24)
        parts.append(arm)

        # Bàn tay cách điệu (Stylized Mitten Hand: Lòng bàn tay Palm + Ngón cái Thumb)
        hand_x = wx
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=24, ring_count=12, radius=0.032,
            location=(hand_x, 0.0, hand_z)
        )
        palm = bpy.context.active_object
        palm.name = f"{name}_Hand_Palm_{side}"
        palm.scale = (0.9, 0.8, 1.18)
        bpy.ops.object.transform_apply(scale=True)
        parts.append(palm)

        # Ngón cái (Thumb - nghiêng 35 độ hướng ra trước, cắm liền vào lòng bàn tay)
        thumb_x = hand_x - sign * 0.015
        thumb_y = -0.015
        thumb_z = hand_z + 0.008
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=16, radius=0.010, depth=0.028,
            location=(thumb_x, thumb_y, thumb_z),
            rotation=(math.radians(35), 0.0, -sign * math.radians(25))
        )
        thumb = bpy.context.active_object
        thumb.name = f"{name}_Hand_Thumb_{side}"
        parts.append(thumb)

    # 5. Chân và Bàn chân liền mạch từ Hông -> Đùi -> Gối -> Cổ chân -> Bàn chân
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        lx = offset_x + sign * dims["hip_x"]
        leg_rings = [
            (lx, 0.0, 0.02, dims["leg_radius"] * 0.85),
            (lx, 0.0, dims["ankle_z"], dims["leg_radius"] * 0.88),
            (lx, 0.0, dims["knee_z"], dims["leg_radius"] * 0.96),
            (lx, 0.0, (dims["hip_z"] + dims["knee_z"]) / 2.0, dims["leg_radius"] * 1.02),
            (lx, 0.0, dims["hip_z"] + 0.03, dims["leg_radius"] * 1.05),
        ]
        leg = create_loft_mesh(f"{name}_Leg_{side}", leg_rings, segments=24)
        parts.append(leg)

        # Bàn chân (đế phẳng tiếp sàn Z=0)
        bpy.ops.mesh.primitive_cube_add(
            size=1.0,
            location=(lx, -0.06, dims["foot_height"] / 2.0)
        )
        foot = bpy.context.active_object
        foot.name = f"{name}_Foot_{side}"
        foot.scale = (dims["foot_width"], dims["foot_length"], dims["foot_height"])
        bpy.ops.object.transform_apply(scale=True)
        parts.append(foot)

    # Gán vật liệu da cho toàn bộ các phần thân và làm mịn
    mat_skin = create_material(f"Mat_{name}_Skin", color, roughness=0.52, sss_weight=0.12)
    for p in parts:
        if p and p.data:
            if "Foot" in p.name:
                smooth_object(p, bevel_width=0.012)
            else:
                smooth_object(p, subsurf=1)
            p.data.materials.clear()
            p.data.materials.append(mat_skin)
            if collection and p.name not in collection.objects:
                collection.objects.link(p)

    return parts


def create_hair_module(name: str, char_id: str, collection: Any = None, offset_x: float = 0.0) -> List[Any]:
    """Dựng module tóc đặc trưng cho từng nhân vật theo preset."""
    if not HAS_BLENDER:
        return []

    profiles = get_all_character_profiles()
    char_info = profiles[char_id]
    hair_type = char_info["hair_module"]
    hair_color = char_info["hair_color"]
    hair_parts = []

    dims = get_base_dimensions()
    mat_hair = create_material(f"Mat_{name}_{hair_type}", hair_color, roughness=0.7)

    if hair_type == "Hair_Messy_Anime":
        # Mũ tóc nền ôm sát đỉnh đầu & sau gáy (100% giống nhau giữa Nam và Người Kia)
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=28, ring_count=14,
            radius=0.146,
            location=(offset_x, 0.018, dims["head_center_z"] + 0.018)
        )
        cap = bpy.context.active_object
        cap.name = f"{name}_HairCap"
        cap.scale = (1.02, 1.03, 0.98)
        bpy.ops.object.transform_apply(scale=True)
        smooth_object(cap, subsurf=1)
        hair_parts.append(cap)

        # Các lọn tóc cong hữu cơ ôm sát đầu (tóc mái, tóc mai, tóc gáy)
        locks = get_hair_presets()["Hair_Messy_Anime"]["locks"]
        for idx, lk in enumerate(locks):
            pts = [(offset_x + px, py, pz) for (px, py, pz) in lk["points"]]
            lock_obj = create_curved_tube_mesh(f"{name}_HairLock_{idx}", pts, lk["radii"], segments=14)
            smooth_object(lock_obj, subsurf=1)
            hair_parts.append(lock_obj)

    elif hair_type == "Hair_Spiky_Sport":
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=24, ring_count=12,
            radius=0.147,
            location=(offset_x, 0.015, dims["head_center_z"] + 0.01)
        )
        cap = bpy.context.active_object
        cap.name = f"{name}_HairCap_Sport"
        smooth_object(cap, subsurf=1)
        hair_parts.append(cap)

        # Chỏm tóc vuốt nhọn thể thao
        clumps = get_hair_presets()["Hair_Spiky_Sport"]["clumps"]
        for idx, cl in enumerate(clumps):
            pos_x = offset_x + cl["pos"][0]
            bpy.ops.mesh.primitive_cone_add(
                vertices=12, radius1=0.035, depth=0.09,
                location=(pos_x, cl["pos"][1], cl["pos"][2])
            )
            spike = bpy.context.active_object
            spike.name = f"{name}_HairSpike_{idx}"
            spike.rotation_euler = cl["rot"]
            bpy.ops.object.transform_apply(rotation=True)
            smooth_object(spike, bevel_width=0.005)
            hair_parts.append(spike)

    elif hair_type == "Hair_Parted_Neat":
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=24, ring_count=12,
            radius=0.148,
            location=(offset_x, 0.025, dims["head_center_z"] + 0.015)
        )
        cap = bpy.context.active_object
        cap.name = f"{name}_HairCap_Neat"
        smooth_object(cap, subsurf=1)
        hair_parts.append(cap)

        # Gọng kính đen: Mắt kính Trái, Phải
        mat_glass = create_material(f"Mat_{name}_Glasses", "#1a1a1a", roughness=0.3)
        bpy.ops.mesh.primitive_torus_add(
            major_radius=0.038, minor_radius=0.006,
            location=(offset_x - 0.045, -0.142, dims["head_center_z"]),
            rotation=(math.radians(90), 0.0, 0.0)
        )
        glass_l = bpy.context.active_object
        glass_l.name = f"{name}_Glasses_L"
        smooth_object(glass_l, subsurf=1)
        glass_l.data.materials.append(mat_glass)
        hair_parts.append(glass_l)

        bpy.ops.mesh.primitive_torus_add(
            major_radius=0.038, minor_radius=0.006,
            location=(offset_x + 0.045, -0.142, dims["head_center_z"]),
            rotation=(math.radians(90), 0.0, 0.0)
        )
        glass_r = bpy.context.active_object
        glass_r.name = f"{name}_Glasses_R"
        smooth_object(glass_r, subsurf=1)
        glass_r.data.materials.append(mat_glass)
        hair_parts.append(glass_r)

        # Cầu nối gọng kính ở giữa sống mũi
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=12, radius=0.004, depth=0.02,
            location=(offset_x, -0.142, dims["head_center_z"]),
            rotation=(0.0, math.radians(90), 0.0)
        )
        bridge = bpy.context.active_object
        bridge.name = f"{name}_Glasses_Bridge"
        smooth_object(bridge, bevel_width=0.002)
        bridge.data.materials.append(mat_glass)
        hair_parts.append(bridge)

        # Tròng kính trong suốt (Glass Lenses)
        mat_lens = create_material(f"Mat_{name}_Glass_Lens", "#e8f4f8", roughness=0.05, transmission=0.92, specular=0.8)
        for side_sign, s_name in [(-1, "L"), (1, "R")]:
            bpy.ops.mesh.primitive_cylinder_add(
                vertices=24, radius=0.036, depth=0.002,
                location=(offset_x + side_sign * 0.045, -0.142, dims["head_center_z"]),
                rotation=(math.radians(90), 0.0, 0.0)
            )
            lens = bpy.context.active_object
            lens.name = f"{name}_Glass_Lens_{s_name}"
            lens.data.materials.append(mat_lens)
            smooth_object(lens, subsurf=1)
            hair_parts.append(lens)

    elif hair_type == "Hair_Hoodie_Dark":
        # Mũ trùm đầu (Hoodie Cowl) đặt lùi về sau để lộ phần khuôn mặt bên trong vành mũ
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=32, ring_count=16,
            radius=0.165,
            location=(offset_x, 0.042, dims["head_center_z"] - 0.01)
        )
        cowl = bpy.context.active_object
        cowl.name = f"{name}_HoodieCowl"
        smooth_object(cowl, subsurf=1)
        hair_parts.append(cowl)

        # Viền mũ trùm mặt (Torus vành mũ)
        bpy.ops.mesh.primitive_torus_add(
            major_radius=0.140, minor_radius=0.022,
            location=(offset_x, -0.042, dims["head_center_z"] - 0.01),
            rotation=(math.radians(82), 0.0, 0.0)
        )
        rim = bpy.context.active_object
        rim.name = f"{name}_HoodieRim"
        smooth_object(rim, subsurf=1)
        hair_parts.append(rim)

    elif hair_type in ("Hair_Neat_Short", "Hair_Bob_Cut"):
        preset = get_hair_presets()[hair_type]
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=28, ring_count=14,
            radius=preset["base_cap_radius"],
            location=(offset_x, 0.018, dims["head_center_z"] + 0.016)
        )
        cap = bpy.context.active_object
        cap.name = f"{name}_HairCap"
        cap.scale = (1.02, 1.03, 0.98)
        bpy.ops.object.transform_apply(scale=True)
        smooth_object(cap, subsurf=1)
        hair_parts.append(cap)

        for idx, lk in enumerate(preset["locks"]):
            pts = [(offset_x + px, py, pz) for (px, py, pz) in lk["points"]]
            lock_obj = create_curved_tube_mesh(f"{name}_HairLock_{idx}", pts, lk["radii"], segments=14)
            smooth_object(lock_obj, subsurf=1)
            hair_parts.append(lock_obj)

    elif hair_type == "Hair_Guard_Cap":
        # Mũ lưỡi trai bảo vệ + chóp mũ + vành lưỡi trai đặt trên trán (không che mắt/lông mày)
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=28, ring_count=14,
            radius=0.148,
            location=(offset_x, 0.012, dims["head_center_z"] + 0.055)
        )
        cap = bpy.context.active_object
        cap.name = f"{name}_GuardCap"
        cap.scale = (1.02, 1.04, 0.72)
        bpy.ops.object.transform_apply(scale=True)
        smooth_object(cap, subsurf=1)
        hair_parts.append(cap)

        # Vành lưỡi trai hướng ra trước (-Y) ngay trên chân mày
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=24, radius=0.112, depth=0.010,
            location=(offset_x, -0.102, dims["head_center_z"] + 0.058),
            rotation=(math.radians(8), 0.0, 0.0)
        )
        visor = bpy.context.active_object
        visor.name = f"{name}_GuardVisor"
        visor.scale = (1.0, 0.85, 1.0)
        bpy.ops.object.transform_apply(scale=True)
        smooth_object(visor, bevel_width=0.003)
        hair_parts.append(visor)

    elif hair_type == "Hair_Bun_Neat":
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=28, ring_count=14,
            radius=0.146,
            location=(offset_x, 0.018, dims["head_center_z"] + 0.016)
        )
        cap = bpy.context.active_object
        cap.name = f"{name}_HairCap"
        cap.scale = (1.02, 1.03, 0.98)
        bpy.ops.object.transform_apply(scale=True)
        smooth_object(cap, subsurf=1)
        hair_parts.append(cap)

        # Búi tóc tròn gọn sau gáy
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=20, ring_count=12,
            radius=0.052,
            location=(offset_x, 0.145, dims["head_center_z"] + 0.010)
        )
        bun = bpy.context.active_object
        bun.name = f"{name}_HairBun"
        smooth_object(bun, subsurf=1)
        hair_parts.append(bun)

    elif hair_type == "Hair_Helmet_Moto":
        # Mũ bảo hiểm nửa đầu xe ôm công nghệ (xanh lá đậm)
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=28, ring_count=14,
            radius=0.150,
            location=(offset_x, 0.008, dims["head_center_z"] + 0.045)
        )
        helmet = bpy.context.active_object
        helmet.name = f"{name}_MotoHelmet"
        helmet.scale = (1.03, 1.05, 0.78)
        bpy.ops.object.transform_apply(scale=True)
        smooth_object(helmet, subsurf=1)
        hair_parts.append(helmet)

        # Viền cao su đen quanh vành mũ
        mat_trim = create_material(f"Mat_{name}_HelmetTrim", "#151515", roughness=0.5)
        bpy.ops.mesh.primitive_torus_add(
            major_radius=0.142, minor_radius=0.008,
            location=(offset_x, -0.010, dims["head_center_z"] + 0.038),
            rotation=(math.radians(10), 0.0, 0.0)
        )
        trim = bpy.context.active_object
        trim.name = f"{name}_HelmetTrim"
        trim.data.materials.append(mat_trim)
        smooth_object(trim, subsurf=1)
        hair_parts.append(trim)

        # Quai cài cằm màu đen
        pts_strap = [
            (offset_x - 0.140, 0.0, dims["head_center_z"] + 0.02),
            (offset_x - 0.08, -0.02, dims["head_center_z"] - 0.10),
            (offset_x, -0.025, dims["head_center_z"] - 0.11),
            (offset_x + 0.08, -0.02, dims["head_center_z"] - 0.10),
            (offset_x + 0.140, 0.0, dims["head_center_z"] + 0.02),
        ]
        strap = create_curved_tube_mesh(f"{name}_HelmetStrap", pts_strap, [0.0035] * 5, segments=10)
        strap.data.materials.append(mat_trim)
        hair_parts.append(strap)

    elif hair_type == "Hair_Non_La":
        # Tóc búi gọn sau gáy bên dưới nón
        mat_hair_inner = create_material(f"Mat_{name}_HairInner", "#221e1a", roughness=0.7)
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=24, ring_count=12,
            radius=0.144,
            location=(offset_x, 0.022, dims["head_center_z"] + 0.010)
        )
        cap = bpy.context.active_object
        cap.name = f"{name}_HairInner"
        cap.data.materials.append(mat_hair_inner)
        smooth_object(cap, subsurf=1)
        hair_parts.append(cap)

        # Nón lá hình nón chóp truyền thống Việt Nam
        mat_nonla = create_material(f"Mat_{name}_NonLa", hair_color, roughness=0.65, sheen_weight=0.3)
        bpy.ops.mesh.primitive_cone_add(
            vertices=32, radius1=0.285, depth=0.165,
            location=(offset_x, -0.015, dims["head_center_z"] + 0.085),
            rotation=(math.radians(-6), 0.0, 0.0)
        )
        hat = bpy.context.active_object
        hat.name = f"{name}_NonLa"
        hat.data.materials.append(mat_nonla)
        smooth_object(hat, bevel_width=0.002)
        hair_parts.append(hat)

        # Quai nón lụa mềm mại vòng dưới cằm
        mat_ribbon = create_material(f"Mat_{name}_NonLaRibbon", "#a84343", roughness=0.6)
        pts_ribbon = [
            (offset_x - 0.135, -0.01, dims["head_center_z"] + 0.03),
            (offset_x - 0.07, -0.02, dims["head_center_z"] - 0.09),
            (offset_x, -0.025, dims["head_center_z"] - 0.105),
            (offset_x + 0.07, -0.02, dims["head_center_z"] - 0.09),
            (offset_x + 0.135, -0.01, dims["head_center_z"] + 0.03),
        ]
        ribbon = create_curved_tube_mesh(f"{name}_NonLaRibbon", pts_ribbon, [0.0035] * 5, segments=10)
        ribbon.data.materials.append(mat_ribbon)
        hair_parts.append(ribbon)

    elif hair_type == "Hair_Claw_Clip":
        # Tóc bới cao gọn gàng kiểu phụ nữ Việt Nam trung niên
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=28, ring_count=14,
            radius=0.147,
            location=(offset_x, 0.018, dims["head_center_z"] + 0.020)
        )
        cap = bpy.context.active_object
        cap.name = f"{name}_HairCap"
        smooth_object(cap, subsurf=1)
        hair_parts.append(cap)

        # Búi tóc cuộn lượn lên sau đầu
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=20, ring_count=12,
            radius=0.046,
            location=(offset_x, 0.138, dims["head_center_z"] + 0.030)
        )
        bun = bpy.context.active_object
        bun.name = f"{name}_HairTwist"
        bun.scale = (0.85, 1.10, 1.25)
        bpy.ops.object.transform_apply(scale=True)
        smooth_object(bun, subsurf=1)
        hair_parts.append(bun)

        # Kẹp càng cua (Claw Clip) màu nâu hổ phách bóng
        mat_clip = create_material(f"Mat_{name}_ClawClip", "#3a1e12", roughness=0.25, specular=0.7)
        bpy.ops.mesh.primitive_cube_add(
            size=1.0,
            location=(offset_x, 0.156, dims["head_center_z"] + 0.030)
        )
        clip = bpy.context.active_object
        clip.name = f"{name}_ClawClip"
        clip.scale = (0.042, 0.022, 0.028)
        bpy.ops.object.transform_apply(scale=True)
        clip.data.materials.append(mat_clip)
        smooth_object(clip, bevel_width=0.003)
        hair_parts.append(clip)

    elif hair_type == "Hair_Pith_Helmet":
        # Chóp mũ cối quân đội xanh lá
        mat_helmet = create_material(f"Mat_{name}_PithHelmet", hair_color, roughness=0.75)
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=28, ring_count=14,
            radius=0.150,
            location=(offset_x, 0.005, dims["head_center_z"] + 0.045)
        )
        dome = bpy.context.active_object
        dome.name = f"{name}_PithDome"
        dome.scale = (1.02, 1.05, 0.82)
        bpy.ops.object.transform_apply(scale=True)
        dome.data.materials.append(mat_helmet)
        smooth_object(dome, subsurf=1)
        hair_parts.append(dome)

        # Vành mũ cối tròn rộng hơi dốc xuống
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=32, radius=0.205, depth=0.010,
            location=(offset_x, -0.008, dims["head_center_z"] + 0.035),
            rotation=(math.radians(6), 0.0, 0.0)
        )
        brim = bpy.context.active_object
        brim.name = f"{name}_PithBrim"
        brim.data.materials.append(mat_helmet)
        smooth_object(brim, bevel_width=0.003)
        hair_parts.append(brim)

        # Núm thông gió kim loại trên đỉnh mũ
        mat_knob = create_material(f"Mat_{name}_PithKnob", "#8b7355", roughness=0.3, metallic=0.7)
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=16, radius=0.014, depth=0.012,
            location=(offset_x, 0.005, dims["head_center_z"] + 0.168)
        )
        knob = bpy.context.active_object
        knob.name = f"{name}_PithKnob"
        knob.data.materials.append(mat_knob)
        smooth_object(knob, bevel_width=0.001)
        hair_parts.append(knob)

    # Gán vật liệu tóc cho các phần chưa có vật liệu riêng
    for hp in hair_parts:
        if hp and hp.data and not hp.data.materials:
            hp.data.materials.append(mat_hair)
        if collection and hp.name not in collection.objects:
            collection.objects.link(hp)

    return hair_parts


def create_face_expression_module(name: str, char_id: str, collection: Any = None, offset_x: float = 0.0) -> List[Any]:
    """Dựng biểu cảm khuôn mặt 3D tối giản (Mắt, Lông mày, Miệng) bám sát mặt cầu đầu."""
    if not HAS_BLENDER:
        return []

    profiles = get_all_character_profiles()
    expr_id = profiles[char_id].get("expression", "anxious")
    expr = get_expression_presets()[expr_id]
    dims = get_base_dimensions()
    R = dims["head_radius"]
    cz = dims["head_center_z"]

    def surf_y(dx: float, dz: float, push: float = 0.0015) -> float:
        r2 = max(0.0001, R * R - dx * dx - (dz - cz) * (dz - cz))
        return -math.sqrt(r2) - push

    mat_face = create_material(f"Mat_{name}_Face_{expr_id}", "#18181c", roughness=0.40, specular=0.55)
    face_parts = []

    # 1. Mắt 3D (Stylized Clay Eyes)
    ex = expr["eye_x"]
    ez = expr["eye_z"]
    esx, esy, esz = expr["eye_scale"]
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        dx = sign * ex
        ey = surf_y(dx, ez, push=0.001)
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=20, ring_count=10, radius=1.0,
            location=(offset_x + dx, ey, ez)
        )
        eye = bpy.context.active_object
        eye.name = f"{name}_Eye_{side}"
        eye.scale = (esx, esy, esz)
        eye.rotation_euler = (0.0, 0.0, math.atan2(dx, -ey))
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        smooth_object(eye, subsurf=1)
        eye.data.materials.append(mat_face)
        face_parts.append(eye)

    # 2. Lông mày biểu cảm (Curved Eyebrows)
    bz = expr["brow_z"]
    tilt_rad = math.radians(expr["brow_tilt_deg"])
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        # sign=+1 (Right side of image / Char Left), inner is closer to 0, outer is further
        dx_in = sign * (ex - 0.017)
        dx_mid = sign * ex
        dx_out = sign * (ex + 0.017)
        dz_offset = 0.016 * math.sin(tilt_rad)
        z_in = bz + dz_offset
        z_mid = bz + 0.003
        z_out = bz - dz_offset
        pts = [
            (offset_x + dx_in, surf_y(dx_in, z_in, push=0.002), z_in),
            (offset_x + dx_mid, surf_y(dx_mid, z_mid, push=0.0025), z_mid),
            (offset_x + dx_out, surf_y(dx_out, z_out, push=0.002), z_out),
        ]
        brow = create_curved_tube_mesh(f"{name}_Brow_{side}", pts, [0.0036, 0.0042, 0.0032], segments=12)
        smooth_object(brow, subsurf=1)
        brow.data.materials.append(mat_face)
        face_parts.append(brow)

    # 3. Miệng tối giản (Curved Mouth)
    mz = expr["mouth_z"]
    mw = expr["mouth_width"]
    mc = expr["mouth_curve"]
    masym = expr.get("mouth_asymmetry", 0.0)
    mouth_pts = []
    mouth_radii = []
    for i in range(5):
        t = -1.0 + 0.5 * i  # -1.0, -0.5, 0.0, 0.5, 1.0
        dx = t * mw
        # Parabolic curve: center is lower for smile (mc > 0) and corners go up
        dz = mz + mc * (t * t - 0.5) + masym * max(0.0, t)
        mouth_pts.append((offset_x + dx, surf_y(dx, dz, push=0.0018), dz))
        mouth_radii.append(0.0024 if abs(t) > 0.7 else 0.0032)

    mouth = create_curved_tube_mesh(f"{name}_Mouth", mouth_pts, mouth_radii, segments=12)
    smooth_object(mouth, subsurf=1)
    mouth.data.materials.append(mat_face)
    face_parts.append(mouth)

    for fp in face_parts:
        if collection and fp.name not in collection.objects:
            collection.objects.link(fp)

    return face_parts


def create_outfit_module(name: str, char_id: str, collection: Any = None, offset_x: float = 0.0) -> List[Any]:
    """Dựng module trang phục (Áo + Quần riêng 2 chân + Giày) bọc ngoài thân theo preset."""
    if not HAS_BLENDER:
        return []

    profiles = get_all_character_profiles()
    char_info = profiles[char_id]
    outfit_type = char_info["outfit_module"]
    outfit_parts = []
    dims = get_base_dimensions()

    # Hệ thống vật liệu PBR nâng cao cho trang phục (Khử hoàn toàn cảm giác nhựa)
    mat_shirt = create_material(f"Mat_{name}_Shirt", char_info["shirt_color"], roughness=0.82, sheen_weight=0.55)
    mat_pants = create_material(f"Mat_{name}_Pants", char_info["pants_color"], roughness=0.86, sheen_weight=0.45)
    mat_white = create_material(f"Mat_{name}_Stripe_White", "#ffffff", roughness=0.75, sheen_weight=0.35)
    mat_metal = create_material(f"Mat_{name}_Metal", "#c0c0c0", roughness=0.25, metallic=0.9)
    mat_gold = create_material(f"Mat_{name}_Belt_Gold", "#d4af37", roughness=0.3, metallic=0.8)
    mat_button = create_material(f"Mat_{name}_Shirt_Button", "#f4f1e8", roughness=0.4, sss_weight=0.05)
    mat_belt = create_material(f"Mat_{name}_Belt_Leather", "#1f1c19", roughness=0.35, specular=0.6)

    if "Formal" in outfit_type or "Guard" in outfit_type:
        mat_shoe = create_material(f"Mat_{name}_Shoe", char_info["shoe_color"], roughness=0.32, specular=0.65)
    elif "Sport" in outfit_type or "Student" in outfit_type:
        mat_shoe = create_material(f"Mat_{name}_Shoe", char_info["shoe_color"], roughness=0.65, sheen_weight=0.3)
    else:
        mat_shoe = create_material(f"Mat_{name}_Shoe", char_info["shoe_color"], roughness=0.60)

    shirt_rings = get_outfit_presets()[outfit_type]["shirt_rings"]
    z_min = min(r["z"] for r in shirt_rings)
    z_max = max(r["z"] for r in shirt_rings)
    r_shirt = max(r["radius"] for r in shirt_rings)
    scale_y_body = 0.80

    # 1. Thân áo liền vai hữu cơ (Lofted Shirt từ cổ -> vai xuôi -> ngực -> eo -> gấu áo)
    loft_shirt_rings = [(offset_x, 0.0, r["z"], r["radius"]) for r in sorted(shirt_rings, key=lambda x: x["z"])]
    shirt = create_loft_mesh(f"{name}_Shirt", loft_shirt_rings, segments=32, scale_y=scale_y_body)
    shirt.data.materials.append(mat_shirt)
    smooth_object(shirt, subsurf=1)
    outfit_parts.append(shirt)

    front_chest_y = -r_shirt * scale_y_body

    # 1b. Cổ áo may đo (Collars)
    if "Oversized" in outfit_type or "Student" in outfit_type or "Neighbor" in outfit_type or "Street_Vendor" in outfit_type or "Landlady" in outfit_type or "Moto_Driver" in outfit_type:
        # Bo viền cổ tròn (Crewneck collar ring)
        bpy.ops.mesh.primitive_torus_add(
            major_radius=0.056, minor_radius=0.008,
            location=(offset_x, 0.0, z_max - 0.01)
        )
        collar = bpy.context.active_object
        collar.name = f"{name}_Collar_Crewneck"
        collar.scale = (1.0, scale_y_body, 1.0)
        bpy.ops.object.transform_apply(scale=True)
        collar.data.materials.append(mat_shirt)
        smooth_object(collar, subsurf=1)
        outfit_parts.append(collar)
    elif "Sport" in outfit_type:
        # Bo cổ viền trắng thể thao (Sport collar ring)
        bpy.ops.mesh.primitive_torus_add(
            major_radius=0.056, minor_radius=0.008,
            location=(offset_x, 0.0, z_max - 0.01)
        )
        collar = bpy.context.active_object
        collar.name = f"{name}_Collar_Sport"
        collar.scale = (1.0, scale_y_body, 1.0)
        bpy.ops.object.transform_apply(scale=True)
        collar.data.materials.append(mat_white)
        smooth_object(collar, subsurf=1)
        outfit_parts.append(collar)
    elif "Formal" in outfit_type or "Guard" in outfit_type or "Veteran_Kaki" in outfit_type:
        # 2 vạt cổ bẻ sơ mi (Collar Lapels) ôm khít chân cổ
        for side, sign in [("L", 1.0), ("R", -1.0)]:
            bpy.ops.mesh.primitive_cube_add(
                size=1.0,
                location=(offset_x + sign * 0.032, -0.042, z_max - 0.02)
            )
            lapel = bpy.context.active_object
            lapel.name = f"{name}_Collar_Lapel_{side}"
            lapel.scale = (0.024, 0.012, 0.032)
            lapel.rotation_euler = (math.radians(-25), math.radians(sign * 20), math.radians(sign * 15))
            bpy.ops.object.transform_apply(scale=True, rotation=True)
            lapel.data.materials.append(mat_shirt)
            smooth_object(lapel, bevel_width=0.003)
            outfit_parts.append(lapel)

        # Nẹp cúc áo giữa ngực (Button Placket) bám sát bề mặt áo
        bpy.ops.mesh.primitive_cube_add(
            size=1.0,
            location=(offset_x, front_chest_y - 0.002, (z_min + z_max) / 2.0 - 0.01)
        )
        placket = bpy.context.active_object
        placket.name = f"{name}_Shirt_Placket"
        placket.scale = (0.016, 0.004, (z_max - z_min) * 0.82)
        bpy.ops.object.transform_apply(scale=True)
        placket.data.materials.append(mat_shirt)
        smooth_object(placket, bevel_width=0.002)
        outfit_parts.append(placket)

        # 4 cúc áo nhỏ (Buttons)
        for b_idx, b_z in enumerate([1.22, 1.14, 1.06, 0.98]):
            bpy.ops.mesh.primitive_cylinder_add(
                vertices=12, radius=0.005, depth=0.004,
                location=(offset_x, front_chest_y - 0.005, b_z),
                rotation=(math.radians(90), 0.0, 0.0)
            )
            btn = bpy.context.active_object
            btn.name = f"{name}_Shirt_Button_{b_idx + 1}"
            btn.data.materials.append(mat_button)
            smooth_object(btn, bevel_width=0.001)
            outfit_parts.append(btn)

    if "Tracker" in outfit_type:
        # Đường khóa kéo kim loại chạy dọc giữa áo (Zipper)
        bpy.ops.mesh.primitive_cube_add(
            size=1.0,
            location=(offset_x, front_chest_y - 0.002, (z_min + z_max) / 2.0 - 0.01)
        )
        zipper = bpy.context.active_object
        zipper.name = f"{name}_Zipper"
        zipper.scale = (0.008, 0.004, (z_max - z_min) * 0.85)
        bpy.ops.object.transform_apply(scale=True)
        zipper.data.materials.append(mat_metal)
        smooth_object(zipper, bevel_width=0.002)
        outfit_parts.append(zipper)

        # 2 dây rút mũ hoodie rủ xuống ngực
        for side, sign in [("L", 1.0), ("R", -1.0)]:
            bpy.ops.mesh.primitive_cylinder_add(
                vertices=12, radius=0.003, depth=0.18,
                location=(offset_x + sign * 0.035, front_chest_y - 0.005, 1.17)
            )
            drawstring = bpy.context.active_object
            drawstring.name = f"{name}_Drawstring_{side}"
            drawstring.data.materials.append(mat_metal)
            smooth_object(drawstring, bevel_width=0.001)
            outfit_parts.append(drawstring)

    elif "Moto_Driver" in outfit_type:
        # Khóa kéo áo khoác gió xe ôm
        bpy.ops.mesh.primitive_cube_add(
            size=1.0,
            location=(offset_x, front_chest_y - 0.002, (z_min + z_max) / 2.0)
        )
        zipper = bpy.context.active_object
        zipper.name = f"{name}_MotoZipper"
        zipper.scale = (0.008, 0.004, (z_max - z_min) * 0.85)
        bpy.ops.object.transform_apply(scale=True)
        zipper.data.materials.append(mat_metal)
        smooth_object(zipper, bevel_width=0.002)
        outfit_parts.append(zipper)

        # Dải phản quang bạc ngang ngực
        mat_refl = create_material(f"Mat_{name}_Reflector", "#e0e0e0", roughness=0.30, metallic=0.7)
        bpy.ops.mesh.primitive_cube_add(
            size=1.0,
            location=(offset_x, front_chest_y - 0.003, 1.15)
        )
        refl = bpy.context.active_object
        refl.name = f"{name}_ReflectorStripe"
        refl.scale = (0.134, 0.004, 0.022)
        bpy.ops.object.transform_apply(scale=True)
        refl.data.materials.append(mat_refl)
        smooth_object(refl, bevel_width=0.001)
        outfit_parts.append(refl)

    elif "Street_Vendor" in outfit_type:
        # Tạp dề quấn trước bụng/eo (Apron)
        mat_apron = create_material(f"Mat_{name}_Apron", "#5a3a2e", roughness=0.82, sheen_weight=0.45)
        bpy.ops.mesh.primitive_cube_add(
            size=1.0,
            location=(offset_x, front_chest_y - 0.004, 0.86)
        )
        apron = bpy.context.active_object
        apron.name = f"{name}_Apron"
        apron.scale = (0.136, 0.006, 0.120)
        bpy.ops.object.transform_apply(scale=True)
        apron.data.materials.append(mat_apron)
        smooth_object(apron, bevel_width=0.003)
        outfit_parts.append(apron)

    elif "Landlady" in outfit_type:
        # Túi bao tử đeo hông
        mat_bag = create_material(f"Mat_{name}_WaistBag", "#342219", roughness=0.40, specular=0.6)
        bpy.ops.mesh.primitive_cube_add(
            size=1.0,
            location=(offset_x + 0.11, -0.05, 0.82)
        )
        bag = bpy.context.active_object
        bag.name = f"{name}_WaistBag"
        bag.scale = (0.045, 0.024, 0.038)
        bag.rotation_euler = (0.0, math.radians(15), math.radians(-10))
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        bag.data.materials.append(mat_bag)
        smooth_object(bag, bevel_width=0.004)
        outfit_parts.append(bag)

        # Chùm chìa khóa kim loại lủng lẳng bên hông
        bpy.ops.mesh.primitive_torus_add(
            major_radius=0.012, minor_radius=0.0025,
            location=(offset_x + 0.135, -0.05, 0.80)
        )
        keyring = bpy.context.active_object
        keyring.name = f"{name}_KeyRing"
        keyring.data.materials.append(mat_gold)
        smooth_object(keyring)
        outfit_parts.append(keyring)

    elif "Veteran_Kaki" in outfit_type:
        # 2 túi áo nắp gập trước ngực áo lính
        for side, sign in [("L", 1.0), ("R", -1.0)]:
            bpy.ops.mesh.primitive_cube_add(
                size=1.0,
                location=(offset_x + sign * 0.065, front_chest_y - 0.003, 1.10)
            )
            pocket = bpy.context.active_object
            pocket.name = f"{name}_ShirtPocket_{side}"
            pocket.scale = (0.026, 0.005, 0.032)
            bpy.ops.object.transform_apply(scale=True)
            pocket.data.materials.append(mat_shirt)
            smooth_object(pocket, bevel_width=0.002)
            outfit_parts.append(pocket)

    # 1c. Ống tay áo liền vai (Seamless Shoulder & Sleeves)
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        sx = offset_x + sign * dims["shoulder_x"]
        sz = dims["shoulder_z"] - 0.02
        ex = offset_x + sign * (dims["shoulder_x"] + 0.025)
        ez = dims["shoulder_z"] - 0.28
        wx = offset_x + sign * (dims["shoulder_x"] + 0.045)
        hand_z = dims["shoulder_z"] - 0.55 - 0.05

        if "Oversized" in outfit_type or "Sport" in outfit_type or "Student_Blue" in outfit_type or "Street_Vendor" in outfit_type or "Landlady" in outfit_type:
            sleeve_r = dims["arm_radius"] * 1.44
            # Khớp cầu vai áo xuôi mượt nối liền thân áo và tay áo
            bpy.ops.mesh.primitive_uv_sphere_add(
                segments=24, ring_count=12, radius=sleeve_r * 0.92,
                location=(sx - sign * 0.018, 0.0, sz - 0.005)
            )
            sh_cap = bpy.context.active_object
            sh_cap.name = f"{name}_ShoulderCap_{side}"
            sh_cap.scale = (1.0, 0.88, 0.88)
            bpy.ops.object.transform_apply(scale=True)
            sh_cap.data.materials.append(mat_shirt)
            smooth_object(sh_cap, subsurf=1)
            outfit_parts.append(sh_cap)

            # Ống tay cộc liền mạch từ vai xuống bắp tay
            slv_rings = [
                (sx - sign * 0.018, 0.0, sz - 0.005, sleeve_r * 0.90),
                (sx - sign * 0.005, 0.0, sz - 0.055, sleeve_r * 0.96),
                (sx + sign * 0.010, 0.0, sz - 0.16, sleeve_r * 0.95),
            ]
            slv = create_loft_mesh(f"{name}_Sleeve_{side}", slv_rings, segments=24)
            slv.data.materials.append(mat_shirt)
            smooth_object(slv, subsurf=1)
            outfit_parts.append(slv)

            # Sọc trắng bắp tay thể thao cho Tùng (Stripe) ôm sát ống tay
            if "Sport" in outfit_type:
                bpy.ops.mesh.primitive_torus_add(
                    major_radius=sleeve_r * 0.96, minor_radius=0.003,
                    location=(sx + sign * 0.008, 0.0, sz - 0.14)
                )
                strp_slv = bpy.context.active_object
                strp_slv.name = f"{name}_Stripe_Sleeve_{side}"
                strp_slv.data.materials.append(mat_white)
                smooth_object(strp_slv, subsurf=1)
                outfit_parts.append(strp_slv)

        else:
            sleeve_r = dims["arm_radius"] * 1.30
            # Khớp cầu vai áo dài tay xuôi mượt
            bpy.ops.mesh.primitive_uv_sphere_add(
                segments=24, ring_count=12, radius=sleeve_r * 0.95,
                location=(sx - sign * 0.018, 0.0, sz - 0.005)
            )
            sh_cap = bpy.context.active_object
            sh_cap.name = f"{name}_ShoulderCap_{side}"
            sh_cap.scale = (1.0, 0.88, 0.88)
            bpy.ops.object.transform_apply(scale=True)
            sh_cap.data.materials.append(mat_shirt)
            smooth_object(sh_cap, subsurf=1)
            outfit_parts.append(sh_cap)

            # 1 ống tay dài liên tục từ vai -> khuỷu -> cổ tay (không cắt khúc)
            slv_long_rings = [
                (sx - sign * 0.018, 0.0, sz - 0.005, sleeve_r * 0.92),
                (sx - sign * 0.005, 0.0, sz - 0.055, sleeve_r * 0.98),
                (ex, 0.0, ez, sleeve_r * 0.93),
                (wx, 0.0, hand_z + 0.055, sleeve_r * 0.87),
            ]
            slv_long = create_loft_mesh(f"{name}_Sleeve_Long_{side}", slv_long_rings, segments=24)
            slv_long.data.materials.append(mat_shirt)
            smooth_object(slv_long, subsurf=1)
            outfit_parts.append(slv_long)

    # 2. Quần liền mạch hông và 2 ống chân:
    pants_rings = get_outfit_presets()[outfit_type]["pants_rings"]
    pz_min = min(r["z"] for r in pants_rings)
    pz_max = max(r["z"] for r in pants_rings)
    crotch_z = 0.76
    waist_r = max(r["radius"] for r in pants_rings)

    # 2a. Phần hông/cạp quần bo tròn đáy chậu nối liền vào 2 ống quần
    waist_loft_rings = [
        (offset_x, 0.0, crotch_z - 0.04, waist_r * 0.55),
        (offset_x, 0.0, crotch_z, waist_r * 0.98),
        (offset_x, 0.0, (crotch_z + pz_max) / 2.0, waist_r),
        (offset_x, 0.0, pz_max, waist_r * 0.98),
    ]
    waist = create_loft_mesh(f"{name}_Pants_Waist", waist_loft_rings, segments=32, scale_y=0.82)
    waist.data.materials.append(mat_pants)
    smooth_object(waist, subsurf=1)
    outfit_parts.append(waist)

    # Thắt lưng da & mặt khóa cho Giảng viên (Belt)
    if "Formal" in outfit_type:
        bpy.ops.mesh.primitive_torus_add(
            major_radius=waist_r * 0.98, minor_radius=0.008,
            location=(offset_x, 0.0, pz_max - 0.015)
        )
        belt = bpy.context.active_object
        belt.name = f"{name}_Belt"
        belt.scale = (1.0, 0.82, 1.0)
        bpy.ops.object.transform_apply(scale=True)
        belt.data.materials.append(mat_belt)
        smooth_object(belt, subsurf=1)
        outfit_parts.append(belt)

        bpy.ops.mesh.primitive_cube_add(
            size=1.0,
            location=(offset_x, -waist_r * 0.82 - 0.006, pz_max - 0.015)
        )
        buckle = bpy.context.active_object
        buckle.name = f"{name}_Belt_Buckle"
        buckle.scale = (0.025, 0.006, 0.020)
        bpy.ops.object.transform_apply(scale=True)
        buckle.data.materials.append(mat_gold)
        smooth_object(buckle, bevel_width=0.002)
        outfit_parts.append(buckle)

    # 2b. Hai ống quần mọc liền từ trong hông quần xuống (không có khe hở ở đùi/háng)
    leg_r = dims["leg_radius"] * (1.45 if ("Oversized" in outfit_type or "Tracker" in outfit_type) else 1.30)
    leg_h = max(0.14, crotch_z - pz_min)
    leg_center_z = crotch_z - leg_h / 2.0

    for side, sign in [("L", 1.0), ("R", -1.0)]:
        lx = offset_x + sign * dims["hip_x"]
        leg_pants_rings = [
            (lx, 0.0, pz_min, leg_r * 0.94),
            (lx, 0.0, leg_center_z, leg_r),
            (lx, 0.0, crotch_z + 0.04, leg_r * 1.15),
        ]
        pleg = create_loft_mesh(f"{name}_Pants_Leg_{side}", leg_pants_rings, segments=24)
        pleg.data.materials.append(mat_pants)
        smooth_object(pleg, subsurf=1)
        outfit_parts.append(pleg)

        # Sọc trắng sườn quần thể thao cho Tùng (Stripe)
        if "Sport" in outfit_type:
            bpy.ops.mesh.primitive_cube_add(
                size=1.0,
                location=(lx + sign * (leg_r + 0.001), 0.0, (pz_min + crotch_z) / 2.0)
            )
            strp_pnt = bpy.context.active_object
            strp_pnt.name = f"{name}_Stripe_Pants_{side}"
            strp_pnt.scale = (0.004, 0.012, leg_h * 0.92)
            bpy.ops.object.transform_apply(scale=True)
            strp_pnt.data.materials.append(mat_white)
            smooth_object(strp_pnt, bevel_width=0.002)
            outfit_parts.append(strp_pnt)

    # 2c. Túi hộp hai bên kèm nắp vát cho Người Truy Vết (Cargo Pockets)
    if "Tracker" in outfit_type:
        for side, sign in [("L", 1.0), ("R", -1.0)]:
            # Thân túi hộp
            bpy.ops.mesh.primitive_cube_add(
                size=1.0,
                location=(offset_x + sign * (dims["hip_x"] + leg_r + 0.012), 0.0, crotch_z - 0.20)
            )
            pocket = bpy.context.active_object
            pocket.name = f"{name}_CargoPocket_{side}"
            pocket.scale = (0.02, 0.06, 0.08)
            bpy.ops.object.transform_apply(scale=True)
            pocket.data.materials.append(mat_pants)
            smooth_object(pocket, bevel_width=0.005)
            outfit_parts.append(pocket)

            # Nắp túi hộp
            bpy.ops.mesh.primitive_cube_add(
                size=1.0,
                location=(offset_x + sign * (dims["hip_x"] + leg_r + 0.014), 0.0, crotch_z - 0.155)
            )
            flap = bpy.context.active_object
            flap.name = f"{name}_CargoPocket_Flap_{side}"
            flap.scale = (0.022, 0.065, 0.018)
            bpy.ops.object.transform_apply(scale=True)
            flap.data.materials.append(mat_pants)
            smooth_object(flap, bevel_width=0.003)
            outfit_parts.append(flap)

    # 3. Dép / Giày
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        bpy.ops.mesh.primitive_cube_add(
            size=1.0,
            location=(offset_x + sign * dims["hip_x"], -0.06, 0.022)
        )
        shoe = bpy.context.active_object
        shoe.name = f"{name}_Shoe_{side}"
        shoe.scale = (dims["foot_width"] * 1.15, dims["foot_length"] * 1.08, 0.045)
        bpy.ops.object.transform_apply(scale=True)
        shoe.data.materials.append(mat_shoe)
        smooth_object(shoe, bevel_width=0.012)
        outfit_parts.append(shoe)

        # Đế cao su trắng cho giày thể thao của Tùng
        if "Sport" in outfit_type:
            bpy.ops.mesh.primitive_cube_add(
                size=1.0,
                location=(offset_x + sign * dims["hip_x"], -0.06, 0.010)
            )
            sole = bpy.context.active_object
            sole.name = f"{name}_Shoe_Sole_{side}"
            sole.scale = (dims["foot_width"] * 1.18, dims["foot_length"] * 1.10, 0.020)
            bpy.ops.object.transform_apply(scale=True)
            sole.data.materials.append(mat_white)
            smooth_object(sole, bevel_width=0.005)
            outfit_parts.append(sole)

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

    # Thiết lập IK chân và tay
    bpy.ops.object.mode_set(mode="POSE")
    pb = arm_obj.pose.bones
    for side in ["L", "R"]:
        # IK chân
        shin_bone = pb.get(f"shin.{side}")
        if shin_bone:
            ik_con = shin_bone.constraints.new("IK")
            ik_con.target = arm_obj
            ik_con.subtarget = f"ik_foot.{side}"
            ik_con.chain_count = 2
            ik_con.pole_target = arm_obj
            ik_con.pole_subtarget = f"pole_knee.{side}"
            ik_con.pole_angle = math.radians(-90)

        # IK tay
        forearm_bone = pb.get(f"forearm.{side}")
        if forearm_bone:
            ik_arm_con = forearm_bone.constraints.new("IK")
            ik_arm_con.target = arm_obj
            ik_arm_con.subtarget = f"ik_hand.{side}"
            ik_arm_con.chain_count = 2

    # Gán custom property tay thuận
    arm_obj["handedness"] = handedness

    bpy.ops.object.mode_set(mode="OBJECT")
    return arm_obj

def bind_stickman_to_armature(char_id: str, rig_obj: Any, body_parts: List[Any] = None, outfit_parts: List[Any] = None) -> None:
    """Gán Armature Modifier và nhóm đỉnh (Vertex Groups) liên kết các phần mesh vào khung xương rig."""
    if not HAS_BLENDER or rig_obj is None:
        return

    all_parts = (body_parts or []) + (outfit_parts or [])
    for obj in all_parts:
        if obj is None or obj.type != "MESH":
            continue
        # Thêm Armature modifier nếu chưa có
        mod = obj.modifiers.get("Armature")
        if not mod:
            mod = obj.modifiers.new("Armature", "ARMATURE")
            mod.object = rig_obj
        
        # Phân loại nhóm đỉnh cơ bản theo tên mesh
        name_lower = obj.name.lower()
        target_bone = "root"
        if any(k in name_lower for k in ["head", "hair", "eye", "brow", "mouth", "spectacles", "glasses", "helmet", "non_la"]):
            target_bone = "head"
        elif "neck" in name_lower:
            target_bone = "neck"
        elif any(k in name_lower for k in ["torso", "chest", "shirt", "collar", "button", "tie", "zipper", "pocket", "stripe_chest"]):
            target_bone = "chest"
        elif any(k in name_lower for k in ["pelvis", "pants", "belt", "waist", "fannypack", "bag", "keyring", "apron"]):
            target_bone = "pelvis"
        elif "hand" in name_lower and "_l" in name_lower:
            target_bone = "hand.L"
        elif "hand" in name_lower and "_r" in name_lower:
            target_bone = "hand.R"
        elif any(k in name_lower for k in ["arm", "sleeve", "shouldercap"]) and "_l" in name_lower:
            target_bone = "upper_arm.L"
        elif any(k in name_lower for k in ["arm", "sleeve", "shouldercap"]) and "_r" in name_lower:
            target_bone = "upper_arm.R"
        elif any(k in name_lower for k in ["thigh", "leg"]) and "_l" in name_lower:
            target_bone = "thigh.L"
        elif any(k in name_lower for k in ["thigh", "leg"]) and "_r" in name_lower:
            target_bone = "thigh.R"
        elif any(k in name_lower for k in ["foot", "shoe", "sole"]) and "_l" in name_lower:
            target_bone = "foot.L"
        elif any(k in name_lower for k in ["foot", "shoe", "sole"]) and "_r" in name_lower:
            target_bone = "foot.R"

        # Tạo vertex group và gán weight = 1.0 cho toàn bộ vertices
        vg = obj.vertex_groups.get(target_bone)
        if not vg:
            vg = obj.vertex_groups.new(name=target_bone)
        all_v_indices = list(range(len(obj.data.vertices)))
        if all_v_indices:
            vg.add(all_v_indices, 1.0, "REPLACE")

def build_character(char_id: str, collection_name: str = None, offset_x: float = 0.0) -> Dict[str, Any]:
    """Sinh hoàn chỉnh 1 nhân vật Stickman trong Blender kèm tóc, áo quần và rig."""
    profiles = get_all_character_profiles()
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
        "face_parts_count": 0,
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

        # 4. Dựng Biểu cảm khuôn mặt
        face_parts = create_face_expression_module(name=f"Face_{char_id}", char_id=char_id, collection=col, offset_x=offset_x)
        result["face_parts_count"] = len(face_parts)

        # 5. Dựng Trang phục
        outfit_parts = create_outfit_module(name=f"Cloth_{char_id}", char_id=char_id, collection=col, offset_x=offset_x)
        result["outfit_parts_count"] = len(outfit_parts)

        # 6. Ràng buộc xương và gán Armature Modifier
        bind_stickman_to_armature(char_id, rig, body_parts + hair_parts + face_parts, outfit_parts)

        result["created"] = True

    return result

CHAR_LINEUP_OFFSETS = {
    "nam": -1.2,
    "nguoikia": -0.6,
    "tung": 0.0,
    "giangvien": 0.6,
    "truyvet": 1.2,
    "qc_sinhvien_nam": -0.9,
    "qc_sinhvien_nu": -0.3,
    "qc_baove": 0.3,
    "qc_hangxom": 0.9,
    "vn_xeom_congnghe": -0.9,
    "vn_banhang_viahe": -0.3,
    "vn_chutro": 0.3,
    "vn_bac_mucoi": 0.9,
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

def create_studio_backdrop(sc: Any):
    """Tạo mặt sàn studio phẳng rộng bắt bóng tiếp xúc cho mọi góc nhìn 360 độ."""
    if not HAS_BLENDER or sc is None:
        return
    bpy.ops.mesh.primitive_plane_add(size=30.0, location=(0.0, 0.0, 0.0))
    floor = bpy.context.active_object
    floor.name = "Studio_Floor"
    mat_floor = create_material("Mat_Studio_Floor", "#242327", roughness=0.94, specular=0.04)
    floor.data.materials.append(mat_floor)

    # Đặt màu môi trường World đồng bộ với màu sàn studio
    if sc.world and sc.world.node_tree:
        bg = sc.world.node_tree.nodes.get("Background")
        if bg:
            bg.inputs["Color"].default_value = (0.038, 0.036, 0.042, 1.0)
            bg.inputs["Strength"].default_value = 0.6


def setup_studio_lighting(sc: Any):
    """Thiết lập 4 nguồn sáng chuẩn Studio Chiaroscuro 360: Key Light, Fill Light, Rim Light, Back Light."""
    if not HAS_BLENDER or sc is None:
        return
    # Key Light - Ánh sáng chính ấm dịu (3200K)
    kd = bpy.data.lights.new('Light_Key', 'AREA')
    kd.energy = 220.0
    kd.size = 1.8
    kd.color = (1.0, 0.96, 0.90)
    ko = bpy.data.objects.new('Light_Key', kd)
    ko.location = (2.2, -3.2, 2.6)
    ko.rotation_euler = (math.radians(50), math.radians(15), math.radians(35))
    sc.collection.objects.link(ko)

    # Fill Light - Ánh sáng bù lạnh dịu (5400K)
    fd = bpy.data.lights.new('Light_Fill', 'AREA')
    fd.energy = 75.0
    fd.size = 2.4
    fd.color = (0.88, 0.94, 1.0)
    fo = bpy.data.objects.new('Light_Fill', fd)
    fo.location = (-2.5, -2.5, 1.9)
    fo.rotation_euler = (math.radians(45), math.radians(-20), math.radians(-35))
    sc.collection.objects.link(fo)

    # Rim Light - Ánh sáng ven hổ phách tách viền nhân vật khỏi nền tối
    rd = bpy.data.lights.new('Light_Rim', 'SPOT')
    rd.energy = 280.0
    rd.spot_size = math.radians(70)
    rd.spot_blend = 0.35
    rd.color = (1.0, 0.92, 0.82)
    ro = bpy.data.objects.new('Light_Rim', rd)
    ro.location = (0.0, 3.2, 2.8)
    ro.rotation_euler = (math.radians(-45), 0.0, math.radians(180))
    sc.collection.objects.link(ro)

    # Back Light - Chiếu sáng lưng khi chụp góc sau
    bd = bpy.data.lights.new('Light_Back', 'AREA')
    bd.energy = 160.0
    bd.size = 2.2
    bd.color = (1.0, 0.96, 0.90)
    bo = bpy.data.objects.new('Light_Back', bd)
    bo.location = (0.0, 3.5, 2.5)
    bo.rotation_euler = (math.radians(-45), 0.0, math.radians(180))
    sc.collection.objects.link(bo)

def render_views(sc: Any, out_dir: str, samples: int = 24) -> List[str]:
    """Render 4 góc nhìn chuẩn (trước, nghiêng, sau, góc 3/4) xuất ảnh PNG."""
    if not HAS_BLENDER or sc is None:
        return []
    os.makedirs(out_dir, exist_ok=True)
    if hasattr(sc, 'cycles'):
        sc.render.engine = 'CYCLES'
        sc.cycles.samples = samples
    sc.render.resolution_x, sc.render.resolution_y = 1920, 1080

    views = {
        'truoc': (0.0, -4.5, 0.9),
        'goc34': (3.2, -3.2, 0.9),
        'sau': (0.0, 4.5, 0.9),
        'nghieng': (-3.2, -3.2, 0.9),
    }
    rendered_files = []
    for vname, loc in views.items():
        cd = bpy.data.cameras.new(f'cam_{vname}')
        cd.type = 'ORTHO'
        cd.ortho_scale = 3.6
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
    parser.add_argument(
        "--character",
        choices=[
            "nam", "nguoikia", "tung", "giangvien", "truyvet",
            "qc_sinhvien_nam", "qc_sinhvien_nu", "qc_baove", "qc_hangxom",
            "vn_xeom_congnghe", "vn_banhang_viahe", "vn_chutro", "vn_bac_mucoi",
            "all", "crowd", "vn_crowd"
        ],
        default="all",
    )
    parser.add_argument("--save", "--blend", dest="save", type=str, default="", help="Đường dẫn lưu file .blend")
    parser.add_argument("--render", type=str, default="", help="Thư mục xuất ảnh render turnaround")
    parser.add_argument("--samples", type=int, default=24, help="Số samples khi render")
    
    if '--' in sys.argv:
        argv = sys.argv[sys.argv.index('--') + 1:]
    elif "blender" in os.path.basename(sys.executable).lower():
        argv = []
    else:
        argv = sys.argv[1:]

    args = parser.parse_args(argv)

    if args.character == "all":
        chars = ["nam", "nguoikia", "tung", "giangvien", "truyvet"]
    elif args.character == "crowd":
        chars = ["qc_sinhvien_nam", "qc_sinhvien_nu", "qc_baove", "qc_hangxom"]
    elif args.character == "vn_crowd":
        chars = ["vn_xeom_congnghe", "vn_banhang_viahe", "vn_chutro", "vn_bac_mucoi"]
    else:
        chars = [args.character]

    if HAS_BLENDER:
        print("=== BẮT ĐẦU DỰNG DÀN NHÂN VẬT STICKMAN 3D TRONG BLENDER ===")
        save_target = args.save if args.save else None
        results = build_cast_in_blender(characters=chars, save_path=save_target)
        print(f"Đã hoàn thành {len(results)} nhân vật: {[r['id'] for r in results]}")

        if args.render:
            sc = bpy.context.scene
            create_studio_backdrop(sc)
            setup_studio_lighting(sc)
            out_render = os.path.abspath(args.render)
            print(f"Đang render 4 góc nhìn vào thư mục: {out_render} ...")
            render_views(sc, out_render, samples=args.samples)
            print(f"Render hoàn tất!")
    else:
        print(f"[MÔI TRƯỜNG PYTHON STANDALONE] Định nghĩa 5 nhân vật và mô-đun toán học sẵn sàng cho: {chars}")

if __name__ == "__main__":
    main()
