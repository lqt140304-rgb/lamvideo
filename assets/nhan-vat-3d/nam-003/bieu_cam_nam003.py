"""Biểu cảm, khẩu hình, nốt ruồi, scale cho khuôn NAM-003. Shape key + driver đã do mắt/mày/miệng tạo; ở đây chỉ đặt giá trị.

dung_bieu_cam(arm, ten): đặt cả mày + miệng theo BIEU_CAM (giá trị theo nam-002).
dung_viseme(arm, ten): chỉ đặt thuộc tính miệng theo VISEME (11 khẩu hình tiếng Việt; tên cũ nam-002 là bí danh).
"""
import numpy as np, bpy
from mathutils import Vector
import mat3d_nam003 as M3
import may3d_nam003 as MY
import mieng_nam003 as MI

BIEU_CAM = {
    'mac_dinh': {},
    'ngac_nhien': {'may_nhuong': 1.0, 'mieng_ha': 0.8},
    'tuc_gian': {'may_cau': 1.0, 'mieng_hep': 0.5},
    'buon': {'may_buon': 1.0, 'meu': 0.8},
    'vui': {'may_nhuong': 0.3, 'cuoi': 1.0, 'mieng_rong': 0.6},
    'nghi_ngo': {'may_trai_nhuong': 1.0, 'may_cau': 0.3, 'meu': 0.3},
    'so_hai': {'may_buon': 1.0, 'mieng_ha': 1.0, 'mieng_rong': 0.5},
    'mo_mang': {'may_ha': 0.5, 'meu': 0.2},
}
VISEME = {
    'nghi': {},
    'A': {'mieng_ha': 1.0, 'mieng_rong': 0.3},            # a, ă, â
    'E': {'mieng_ha': 0.45, 'mieng_rong': 0.7},           # e, ê
    'I': {'mieng_ha': 0.12, 'mieng_rong': 0.9},           # i, y
    'O': {'mieng_ha': 0.55, 'mieng_hep': 0.55},           # o, ô, ơ
    'U': {'mieng_ha': 0.1, 'mieng_hep': 0.9},             # u, ư
    'MBP': {'mieng_khep': 1.0, 'mieng_rong': 0.2},        # m, b, p: môi khép
    'PHV': {'mieng_ha': 0.12, 'mieng_khep': 0.5},         # ph, v: hé, môi dưới thu
    'NT': {'mieng_ha': 0.25, 'mieng_rong': 0.35},         # n, t, đ, l, d
    'CH': {'mieng_ha': 0.2, 'mieng_hep': 0.35},           # ch, tr, s, x, gi
    'KG': {'mieng_ha': 0.35, 'mieng_rong': 0.15},         # k, g, ng, h, kh
}
BI_DANH = {'a': 'A', 'e': 'E', 'i': 'I', 'o': 'O', 'u': 'U', 'mbp': 'MBP', 'khac': 'KG'}
H0 = 1.824


def _dat(arm, props, d):
    h = arm.pose.bones['Head']
    for n in props: h[n] = 0.0
    for n, v in d.items(): h[n] = float(v)
    M3.tinh(arm)


def dung_bieu_cam(arm, ten):
    _dat(arm, MY.PROPS + MI.PROPS, BIEU_CAM[ten])


def dung_viseme(arm, ten):
    _dat(arm, MI.PROPS, VISEME[BI_DANH.get(ten, ten)])


def not_ruoi(sc, arm, body, moc, p):
    """Nốt ruồi nhỏ trên má (trái = +X), chiếu lên da theo +Y. None nếu p['ruoi'] rỗng."""
    if not p['ruoi']: return None
    x = 0.034 if p['ruoi'] == 'trai' else -0.034
    dg = bpy.context.evaluated_depsgraph_get(); ev = body.evaluated_get(dg)
    o = Vector((x, -0.3, moc['mieng'][2] + 0.022)); mi = ev.matrix_world.inverted()
    ok, loc, nor, _ = ev.ray_cast(mi @ o, Vector((0, 1, 0)))
    assert ok, 'nốt ruồi: tia không trúng da'
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=6, radius=0.0011, location=tuple(ev.matrix_world @ loc))
    ob = bpy.context.object; ob.name = 'NotRuoi'; ob.scale = (1, 0.4, 1); bpy.ops.object.transform_apply(scale=True)
    ob.data.materials.append(M3._mat('NotRuoi', (0.09, 0.05, 0.035), 0.6))
    M3._bone_parent(ob, arm, 'Head'); return ob


def dat_cao(arm, p):
    arm.scale = (p['cao'] / H0,) * 3; bpy.context.view_layer.update()


def kiem_bieu_cam(arm, body, p):
    h = arm.pose.bones['Head']
    for n in MY.PROPS + MI.PROPS + ('chop_mat', 'chop_trai', 'chop_phai', 'mo_to'):
        assert n in h, f'thiếu thuộc tính {n}'
    for t in list(BIEU_CAM): dung_bieu_cam(arm, t)
    for t in list(VISEME) + list(BI_DANH): dung_viseme(arm, t)
    assert VISEME['A']['mieng_ha'] > VISEME['I']['mieng_ha'] and VISEME['MBP']['mieng_khep'] == 1
    dung_viseme(arm, 'nghi')
    dg = bpy.context.evaluated_depsgraph_get(); ev = body.evaluated_get(dg)
    z = [(ev.matrix_world @ v.co).z for v in ev.to_mesh().vertices]; ev.to_mesh_clear()
    cao = max(z) - min(z)
    assert abs(cao - p['cao']) < 0.005, f'cao {cao:.4f} ≠ {p["cao"]}'
    nmax = max(sum(1 for g in v.groups if g.weight > 0) for v in body.data.vertices)
    assert nmax <= 4, f'{nmax} xương/đỉnh'
    print(f'PASS bieu_cam cao {cao:.3f} m')
