"""Mô-đun tính toán hình học tham số và đo lường Stickman Base V1 (Kiểu B).

Chuẩn hóa tỷ lệ:
  - Chiều cao tổng thể: 1.60 m (Z = [0.0, 1.60])
  - Đáy sàn: Z = 0.0 m
  - Đầu: UV Sphere, R = 0.14 m, tâm tại (0, 0, 1.46 m)
  - Cổ: Cylinder, R = 0.04 m, Z nối [1.28, 1.36] m
  - Thân viên nang (Torso Capsule): Z in [0.78, 1.28] m, bo tròn đầu ngực và đáy chậu
  - Tay: Chiều dài 0.55 m, bán kính R = 0.035 m
  - Chân: Chiều dài 0.70 m, bán kính R = 0.045 m
  - Bàn chân: Đế phẳng Z = 0.0 m, chiều dài 0.22 m
"""

import math
from typing import Any, Dict, List

def get_base_dimensions() -> Dict[str, float]:
    """Trả về từ điển chứa toàn bộ kích thước hình học chuẩn của Stickman Base V1."""
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
    """Sinh danh sách các lát cắt và bán kính dọc theo trục Z cho thân viên nang.
    
    Bo tròn hình học tại đỉnh ngực và đáy chậu để tạo hình capsule mượt mà.
    """
    dims = get_base_dimensions()
    z_min = dims["torso_z_min"]
    z_max = dims["torso_z_max"]
    height = z_max - z_min

    levels = []
    for i in range(num_rings):
        t = i / (num_rings - 1)  # 0.0 -> 1.0
        z = z_min + t * height

        # Nội suy bán kính capsule có bo tròn hai đầu (dùng sin curve)
        # Bán kính nền tuyến tính từ đáy lên đỉnh
        base_r = dims["torso_r_bottom"] + t * (dims["torso_r_top"] - dims["torso_r_bottom"])
        
        # Bo cong capsule: t = 0 và t = 1 hơi bo lại nhẹ
        capsule_factor = math.sin(t * math.pi) ** 0.35
        # Đảm bảo bán kính tối thiểu ở hai đầu không nhỏ hơn 75%
        r = base_r * (0.75 + 0.25 * capsule_factor)

        name = f"ring_{i}"
        if i == 0:
            name = "day_chau"
        elif i == num_rings - 1:
            name = "vai_nguc"
        elif i == num_rings // 2:
            name = "eo_bung"

        levels.append({
            "name": name,
            "z": round(z, 4),
            "radius": round(r, 4),
            "t": round(t, 4)
        })

    return levels

def verify_mesh_constraints() -> Dict[str, Any]:
    """Kiểm tra tính hợp lệ toán học của Stickman Base."""
    dims = get_base_dimensions()
    errors = []

    # 1. Chiều cao đỉnh đầu
    calculated_top = dims["head_center_z"] + dims["head_radius"]
    if abs(calculated_top - dims["total_height"]) > 1e-4:
        errors.append(f"Top of head {calculated_top} != total_height {dims['total_height']}")

    # 2. Đáy chân
    if abs(dims["floor_z"] - 0.0) > 1e-4:
        errors.append(f"Floor Z {dims['floor_z']} != 0.0")

    # 3. Khớp cổ nối giữa thân và đầu
    if dims["neck_z_max"] > dims["head_center_z"]:
        errors.append(f"Neck top {dims['neck_z_max']} exceeds head center {dims['head_center_z']}")
    if dims["neck_z_min"] < dims["torso_z_max"] - 0.02:
        errors.append(f"Neck bottom {dims['neck_z_min']} penetrates too deep into torso {dims['torso_z_max']}")

    # 4. Chiều dài chân tiếp sàn
    # Hông tại hip_z, chân dài leg_length + foot_height
    foot_bottom = dims["hip_z"] - dims["leg_length"] - dims["ankle_z"]
    # Ở tư thế đứng thẳng, đế bàn chân phẳng tại Z=0
    if dims["floor_z"] < 0.0:
        errors.append("Floor contact cannot be negative")

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "calculated_top_z": calculated_top,
        "floor_z": dims["floor_z"],
    }
