"""Dữ liệu chung cho bộ biểu cảm: dựng đầu, lấy điểm neo mặt. Không sửa dung_dau_nam.py (bản đã duyệt)."""
import os, sys
from dataclasses import dataclass, field
import bpy
from mathutils import Vector, Matrix

AQ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if AQ not in sys.path: sys.path.insert(0, AQ)
import dung_dau_nam as D

TEN_VAT = ['Eyebrow.L', 'Eyebrow.R', 'Pupil.L', 'Pupil.R', 'Eyeline.L', 'Eyeline.R', 'Mouth_line', 'Mole']


@dataclass
class Dau:
    head: bpy.types.Object
    parts: dict
    surf: object
    neo: dict
    ten: str = 'Nam'
    nghi: dict = None   # ảnh chụp trạng thái nghỉ (kiem.chup_nghi)


def _mat_x(x, z, surf):
    """Điểm trên mặt da tại (x, z) nhìn từ phía trước (-Y)."""
    return surf.front(x, z)[0]


def lay_neo(head, parts, surf):
    """Điểm neo mặt theo toạ độ thế giới, suy từ khung mắt/miệng và hằng số FACE của dung_dau_nam."""
    neo = {}; Rz = D.EYE_R[1]
    for s, k in ((1, 'L'), (-1, 'R')):
        p0, f, X, Z = D.EYE_FRAMES[s]
        neo[f'eye_c.{k}'] = _mat_x(p0.x, p0.z, surf)
        up = p0 + Z * D.W_LID0; lo = p0 - Z * (Rz * D.WHITE_R2 ** 0.5 * 0.9)
        neo[f'lid_up.{k}'] = _mat_x(up.x, up.z, surf)
        neo[f'lid_low.{k}'] = _mat_x(lo.x, lo.z, surf)
        for nm, x, dz in zip(('in', 'mid', 'out'), D.FACE['brow_x'], (-0.004, 0.005, -0.006)):
            neo[f'brow_{nm}.{k}'] = _mat_x(s * x, D.FACE['brow_z'] + dz, surf)
        xm = 0.032; zm = D.FACE['mouth_z'] - 0.003 * (xm / 0.030) ** 2
        neo[f'mouth_corner.{k}'] = _mat_x(s * xm, zm, surf)
    neo['mouth_c'] = _mat_x(0.0, D.FACE['mouth_z'], surf)
    # điểm neo môi: trên/dưới rãnh miệng 5 mm, tại giữa (c), x = 15 mm (1) và 26 mm (2) mỗi bên
    for tn, dz in (('up', 0.005), ('low', -0.005)):
        neo[f'lip_{tn}_c'] = _mat_x(0.0, D.FACE['mouth_z'] + dz, surf)
        for idx, xm in (('1', 0.015), ('2', 0.026)):
            for s, k in ((1, 'L'), (-1, 'R')):
                neo[f'lip_{tn}_{idx}.{k}'] = _mat_x(s * xm, D.FACE['mouth_z'] - 0.003 * (xm / 0.030) ** 2 + dz, surf)
    neo['chin'] = _mat_x(0.0, D.FACE['chin_z'], surf)
    # neo cho nhắm mắt, má, mũi, thái dương
    Rx = D.EYE_R[0] * D.WHITE_R2 ** 0.5
    for s, k in ((1, 'L'), (-1, 'R')):
        p0 = D.EYE_FRAMES[s][0]
        neo[f'eye_in.{k}'] = _mat_x(p0.x - s * Rx, p0.z, surf); neo[f'eye_out.{k}'] = _mat_x(p0.x + s * Rx, p0.z, surf)
        neo[f'cheek.{k}'] = _mat_x(s * 0.100, 1.150, surf); neo[f'nose_wing.{k}'] = _mat_x(s * 0.028, 1.162, surf)
        neo[f'temple.{k}'] = _mat_x(s * 0.165, D.FACE['eye_z'] + 0.030, surf)
    neo['nose_bridge'] = _mat_x(0.0, 1.205, surf)
    return neo


def ty_le_mat(neo):
    """Thước đo mọi độ dời: khoảng cách hai tâm mắt (mét)."""
    return (neo['eye_c.L'] - neo['eye_c.R']).length


def dung_nam(mole_side=None, x_scale=1.0):
    """Dựng đầu Nam (có tóc, vì build() dựng chung). mole_side đổi bên nốt ruồi. x_scale nhân bề rộng đầu VÀ khoảng cách
    hai mắt/mày/nốt ruồi (đầu khác để thử tái sử dụng: ty_le_mat đổi theo)."""
    old_side, old_tab, old_face = D.MOLE_SIDE, D.LOFT_TAB, dict(D.FACE)
    try:
        if mole_side is not None: D.MOLE_SIDE = mole_side
        if x_scale != 1.0:
            D.LOFT_TAB = [[r[0], r[1], r[2], r[3] * x_scale] for r in old_tab]
            D.FACE['eye_x'] *= x_scale; D.FACE['mole_x'] *= x_scale; D.FACE['brow_x'] = tuple(x * x_scale for x in D.FACE['brow_x'])
        D.build()
        head = bpy.data.objects['Head_Base']; parts = {n: bpy.data.objects[n] for n in TEN_VAT}
        for ob in parts.values():            # đưa toàn bộ phép biến đổi vào lưới: hình học thế giới giữ nguyên, vật nằm ở gốc với scale 1, không xoay.
            if ob.matrix_world != Matrix.Identity(4):   # Displace tính theo đơn vị cục bộ, Shrinkwrap PROJECT theo trục cục bộ → cần ma trận đơn vị
                ob.data.transform(ob.matrix_world); ob.matrix_world = Matrix.Identity(4)
        bpy.context.view_layer.update()
        S = D.Surf(head); neo = lay_neo(head, parts, S)      # neo phải tính khi FACE còn là bản của đầu này
    finally:
        D.MOLE_SIDE, D.LOFT_TAB = old_side, old_tab; D.FACE.clear(); D.FACE.update(old_face)
    return Dau(head, parts, S, neo, 'Nam' if mole_side is None and x_scale == 1.0 else f'Nam(ruoi={mole_side},x={x_scale})')
