"""Dữ liệu chung cho bộ biểu cảm: dựng đầu, lấy điểm neo mặt. Không sửa dung_dau_nam.py (bản đã duyệt)."""
import os, sys
from dataclasses import dataclass, field
import bpy
from mathutils import Vector

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
    neo['chin'] = _mat_x(0.0, D.FACE['chin_z'], surf)
    return neo


def ty_le_mat(neo):
    """Thước đo mọi độ dời: khoảng cách hai tâm mắt (mét)."""
    return (neo['eye_c.L'] - neo['eye_c.R']).length


def dung_nam(mole_side=None, x_scale=1.0):
    """Dựng đầu Nam (có tóc, vì build() dựng chung). mole_side đổi bên nốt ruồi; x_scale nhân nửa rộng đầu (đầu khác để thử tái sử dụng)."""
    old_side, old_tab = D.MOLE_SIDE, D.LOFT_TAB
    try:
        if mole_side is not None: D.MOLE_SIDE = mole_side
        if x_scale != 1.0: D.LOFT_TAB = [[r[0], r[1], r[2], r[3] * x_scale] for r in old_tab]
        D.build()
    finally:
        D.MOLE_SIDE, D.LOFT_TAB = old_side, old_tab
    head = bpy.data.objects['Head_Base']; parts = {n: bpy.data.objects[n] for n in TEN_VAT}
    bpy.context.view_layer.update()
    S = D.Surf(head)
    return Dau(head, parts, S, lay_neo(head, parts, S), 'Nam' if mole_side is None else f'Nam(ruoi={mole_side:+d},x={x_scale})')
