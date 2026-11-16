"""Driver 'vai hạ theo tay' cho nam-003: khi tay buông (bắp tay khép về thân) xương đòn LeftShoulder/RightShoulder tự hạ tối đa HA độ
(nhịp vai–cánh tay như người thật), nên vai không còn cao nhô ở tư thế buông. Cùng với tay buông 86° (không phải 78°) khe tay–thân còn ~2 cm ở nách.
(Đo 15/11: góc 78° cũ cho khe 4 cm ở nách → 10 cm ở cổ tay; dịch LeftArm bằng location KHÔNG có tác dụng vì LeftArm nối liền xương đòn.)

  them_driver_vai(arm)   gọi một lần sau khi dựng rig.
Xoay Z cục bộ của LeftArm = −góc khép (Right: +) khi quay quanh trục Y thế giới; xoay X cục bộ của LeftShoulder = −góc hạ (Right: +... đo bằng test).
Driver không đi theo GLB (như driver ngón tay): ở engine khác phải bake.
"""
import math, bpy

HA = 6.0             # độ, hạ vai tối đa
KHEP_MAX = 86.0      # độ khép ứng với hạ tối đa


def them_driver_vai(arm):
    ds = arm.animation_data.drivers if arm.animation_data else []
    for S, sg in (('Left', -1), ('Right', 1)):
        path = f'pose.bones["{S}Shoulder"].rotation_euler'
        for f in [f for f in ds if f.data_path == path and f.array_index == 0]: arm.animation_data.drivers.remove(f)
        fc = arm.pose.bones[f'{S}Shoulder'].driver_add('rotation_euler', 0); d = fc.driver; d.type = 'SCRIPTED'
        v = d.variables.new(); v.name = 'z'; v.type = 'SINGLE_PROP'; v.targets[0].id = arm; v.targets[0].data_path = f'pose.bones["{S}Arm"].rotation_euler[2]'
        d.expression = f'{-math.radians(HA):.6f}*max(0.0, min(1.0, {sg}*z/{math.radians(KHEP_MAX):.6f}))'


# ---- thu hẹp vai trong lưới (áp trước khi dựng rig; nguồn GLB giữ nguyên) ----
import os
HEP = float(os.environ.get('NAM003_VAI_HEP', '0.04'))   # m, dịch tối đa của tay vào trong (mỗi bên)
U0, U1 = float(os.environ.get('NAM003_U0', '0.0')), float(os.environ.get('NAM003_U1', '0.30'))   # |x| bắt đầu / dịch đủ (chuyển tiếp càng rộng càng ít nén lưới: nén cực đại ≈ 1 − 1,5·HEP/(U1−U0))
Z0, Z1 = 1.15, 1.25                                      # chỉ phần trên (vai–tay); thân dưới, chân không đổi


def _sm(t):
    t = min(1.0, max(0.0, t)); return t * t * (3 - 2 * t)


def dich(u, z):
    """Độ dịch vào (m, ≥0) của điểm có |x|=u, độ cao z."""
    return HEP * _sm((u - U0) / (U1 - U0)) * _sm((z - Z0) / (Z1 - Z0))


def hep_vai(x, z):
    """x' mới của điểm (x, z): dịch về phía trục."""
    u = abs(x); return math.copysign(max(0.0, u - dich(u, z)), x) if x else 0.0


def khoi_phuc(x, z):
    """Nghịch đảo hep_vai (tìm x gốc từ x' đã thu hẹp): lặp điểm cố định."""
    u2 = abs(x); u = u2
    for _ in range(6): u = u2 + dich(u, z)
    return math.copysign(u, x) if x else 0.0


# ---- bắp vai (cơ delta) to hơn và hạ nách (áp trước thu hẹp vai; chủ repo 16/11: "nách cao quá, bắp vai hơi nhỏ") ----
DELTA_K = float(os.environ.get('NAM003_DELTA_K', '0.12'))       # phình bán kính bắp vai tối đa (tỉ lệ)
NACH_HA = float(os.environ.get('NAM003_NACH_HA', '0.012'))       # m, hạ phần dưới bắp tay/nách tối đa
AX_Y, AX_Z = 0.05, 1.45                                         # trục bắp tay (dáng chữ T)


def _bump(u):   # 0 ở |x|≤0.05, đỉnh ~0.25–0.30, về 0 ở 0.45 (chuyển tiếp rộng để không có nếp ở chân vai)
    return _sm((u - 0.05) / 0.20) * (1 - _sm((u - 0.30) / 0.15))


def dinh_hinh_vai(x, y, z):
    """(x, y, z) mới: phình quanh trục bắp tay và hạ phần dưới. Chỉ ảnh hưởng điểm gần trục tay (r<0,12 m)."""
    b = _bump(abs(x)); dy, dz = y - AX_Y, z - AX_Z; r = math.hypot(dy, dz); w = _sm((0.12 - r) / 0.08) * b
    if w <= 0: return x, y, z
    f = 1 + DELTA_K * w; y2 = AX_Y + dy * f; z2 = AX_Z + dz * f
    if dz < 0: z2 -= NACH_HA * w * _sm(-dz / 0.03)      # nửa dưới (phía nách) hạ thêm
    return x, y2, z2
