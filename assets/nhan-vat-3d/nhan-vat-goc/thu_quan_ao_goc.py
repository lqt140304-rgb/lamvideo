"""THỬ 10 BỘ QUẦN ÁO 3D DÁNG RỘNG CHO NHÂN VẬT NAM MỚI (NHAN-VAT-GOC-001).

Mở không phá huỷ `nhan-vat-goc.blend` (giữ `model_LOD0`), dựng các bộ quần áo dáng rộng
(boxy / drop-shoulder / wide-leg / layering) khớp theo mốc khớp đo thực tế của NHAN-VAT-GOC-001
(cao 1,723 m, vai ±0,172 m, khuỷu ±0,250 m, cổ tay ±0,279 m, hông ±0,100 m, cổ chân ±0,130 m).

Chạy (từ thư mục này hoặc đường dẫn đầy đủ):
  D:/blender/blender.exe -b --factory-startup --python thu_quan_ao_goc.py -- --outfit all --check --render xem-thu-quan-ao --samples 24
  D:/blender/blender.exe -b --factory-startup --python thu_quan_ao_goc.py -- --outfit xanh --check --render xem-thu-quan-ao/xanh --blend nhan-vat-goc-xanh.blend --samples 32
"""
import sys
import os
import math
import argparse

HERE = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
NV_HO_SO_02 = os.path.join(REPO_ROOT, 'episodes', 'hem-co-chuyen', 'ho-so-02-nguoi-lam-thay', 'assets', 'nhan-vat-3d')
for p in (HERE, NV_HO_SO_02):
    if p not in sys.path:
        sys.path.insert(0, p)

import bpy
import bmesh
from mathutils import Vector
from mathutils.bvhtree import BVHTree

import dung_quan_ao_nam as QA

SRC_BLEND = os.path.join(HERE, 'nhan-vat-goc.blend')
CLOTH_COLL = '03_Clothes_Goc'
SOLE_H = 0.016

# Mốc khớp đo thực tế trên model_LOD0 của NHAN-VAT-GOC-001 (rig_goc.py)
J_GOC = dict(
    pelvis=(0, -0.010, 0.50), spine1=(0, -0.005, 0.60), spine2=(0, 0.000, 0.70), chest=(0, 0.005, 0.80),
    neck=(0, 0.010, 0.93), head=(0, 0.005, 1.015),
    shoulder=(0.172, 0.018, 0.875), elbow=(0.250, 0.024, 0.705), wrist=(0.279, -0.025, 0.525),
    hip=(0.100, -0.015, 0.530), knee=(0.124, -0.030, 0.285), ankle=(0.130, -0.005, 0.100),
)


# ================================================================== HÀM PHỤ HÌNH HỌC
def _new_obj(name, bm, coll, mat):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    if mat:
        me.materials.append(mat)
    ob = bpy.data.objects.new(name, me)
    coll.objects.link(ob)
    return ob


def _limb_ring(c, prev_c, next_c, rx, ry, ax=None):
    ax = Vector(ax).normalized() if ax else (Vector(next_c) - Vector(prev_c)).normalized()
    X = ax.cross(Vector((0, 1, 0))).normalized()
    if X.length < 1e-4:
        X = Vector((1, 0, 0))
    Y = X.cross(ax).normalized()
    if Y.y < 0:
        Y = -Y
    return [Vector(c) + X * (rx * math.cos(math.pi * j / 4)) - Y * (ry * math.sin(math.pi * j / 4)) for j in range(8)]


def _ensure_coll(sc, name):
    c = bpy.data.collections.get(name)
    if not c:
        c = bpy.data.collections.new(name)
        sc.collection.children.link(c)
    for ob in list(c.objects):
        bpy.data.objects.remove(ob, do_unlink=True)
    return c


# ================================================================== THÔNG SỐ CAGE CHO NHAN-VAT-GOC-001 (1,723 m)
def _shirt_levels_goc(wide_neck=False, extra_margin=0.0):
    d_neck = 0.014 if wide_neck else 0.0
    m = extra_margin
    return [
        dict(ten='co_ao',     z=0.945 - d_neck * 0.5, w=0.108 + d_neck + m * 0.4, f=0.105 + d_neck + m * 0.4, b=0.088 + m * 0.4, n=2.0, yc=0.005),
        dict(ten='vai_ao',    z=0.895 + m * 0.2, w=0.242 + m, f=0.152 + m, b=0.132 + m, n=2.2, yc=0.010),
        dict(ten='nguc_ao',   z=0.820, w=0.205 + m, f=0.172 + m, b=0.132 + m, n=2.2, yc=0.005),
        dict(ten='duoi_nguc', z=0.730, w=0.200 + m, f=0.195 + m, b=0.138 + m, n=2.2, yc=0.000),
        dict(ten='bung_ao',   z=0.650, w=0.208 + m, f=0.212 + m, b=0.148 + m, n=2.2, yc=-0.005),
        dict(ten='eo_ao',     z=0.575, w=0.214 + m, f=0.212 + m, b=0.164 + m, n=2.2, yc=-0.008),
        dict(ten='gau_ao',    z=0.495, w=0.220 + m, f=0.206 + m, b=0.168 + m, n=2.2, yc=-0.010),
    ]


SLEEVE_SHORT_GOC = [
    dict(ten='tay_vai',  c=(0.212, 0.018, 0.785), rx=0.088, ry=0.090, ax=(0.64, 0.0, -0.768)),
    dict(ten='tay_giua', c=(0.234, 0.022, 0.730), rx=0.090, ry=0.090),
    dict(ten='tay_gau',  c=(0.252, 0.024, 0.675), rx=0.092, ry=0.092),
]

SLEEVE_LONG_GOC = [
    dict(ten='tay_vai',   c=(0.212, 0.018, 0.785), rx=0.090, ry=0.092, ax=(0.64, 0.0, -0.768)),
    dict(ten='tay_giua',  c=(0.234, 0.022, 0.730), rx=0.090, ry=0.090),
    dict(ten='tay_khuyu', c=(0.252, 0.024, 0.680), rx=0.086, ry=0.086),
    dict(ten='tay_cang',  c=(0.268, 0.000, 0.600), rx=0.078, ry=0.078),
    dict(ten='tay_bo',    c=(0.278, -0.022, 0.535), rx=0.066, ry=0.066),
]


def _pants_levels_goc():
    return [
        dict(ten='cap_quan',  z=0.580, w=0.198, f=0.194, b=0.152, n=2.2, yc=-0.008),
        dict(ten='chau_quan', z=0.530, w=0.208, f=0.188, b=0.162, n=2.3, yc=-0.012),
        dict(ten='day_quan',  z=0.465, w=0.210, f=0.162, b=0.154, n=2.3, yc=-0.015),
    ]


PANTS_LONG_GOC = [
    dict(ten='dui_tren', c=(0.108, -0.018, 0.410), rx=0.112, ry=0.116),
    dict(ten='dui_giua', c=(0.118, -0.024, 0.325), rx=0.108, ry=0.112),
    dict(ten='goi_quan', c=(0.124, -0.028, 0.250), rx=0.104, ry=0.106),
    dict(ten='ong_duoi', c=(0.128, -0.016, 0.175), rx=0.102, ry=0.104),
    dict(ten='gau_quan', c=(0.130, -0.006, 0.115), rx=0.102, ry=0.104),
]

PANTS_JOGGER_GOC = [
    dict(ten='dui_tren',   c=(0.108, -0.018, 0.410), rx=0.115, ry=0.118),
    dict(ten='dui_giua',   c=(0.118, -0.024, 0.325), rx=0.110, ry=0.112),
    dict(ten='goi_quan',   c=(0.124, -0.028, 0.250), rx=0.102, ry=0.104),
    dict(ten='ong_duoi',   c=(0.128, -0.016, 0.175), rx=0.092, ry=0.094),
    dict(ten='bo_co_chan', c=(0.130, -0.006, 0.115), rx=0.078, ry=0.080),
]

PANTS_SHORT_GOC = [
    dict(ten='dui_tren', c=(0.108, -0.018, 0.410), rx=0.114, ry=0.116),
    dict(ten='dui_giua', c=(0.118, -0.024, 0.335), rx=0.112, ry=0.114),
    dict(ten='gau_dui',  c=(0.124, -0.028, 0.290), rx=0.112, ry=0.114),
]


def _level_ring(L):
    e = 2.0 / L['n']
    pts = []
    for k in range(7):
        th = math.pi * k / 6
        s, c = math.sin(th), math.cos(th)
        x = 0.0 if k in (0, 6) else L['w'] * abs(s) ** e
        y = L['yc'] - L['f'] * abs(c) ** e if c >= 0 else L['yc'] + L['b'] * abs(c) ** e
        z = L['z']
        if L['ten'] == 'co_ao':
            z += -0.024 * max(0.0, c) + 0.008 * max(0.0, -c)
        pts.append(Vector((x, y, z)))
    return pts


def _push_outside_bvh(bm, bvh_body, min_clear=0.008):
    """Đẩy các đỉnh của cage áo/quần ra ngoài bề mặt model_LOD0 tối thiểu min_clear (m) để đảm bảo 0 xuyên thân."""
    if not bvh_body:
        return
    for v in bm.verts:
        # Kiểm tra cả nửa +X và -X (sau khi mirror)
        for sign in (1.0, -1.0):
            p = Vector((v.co.x * sign, v.co.y, v.co.z))
            loc, nrm, _, dist = bvh_body.find_nearest(p)
            if not loc:
                continue
            # Ray parity theo +X để biết p có nằm bên trong mesh kín không
            hits, cur = 0, p.copy()
            d = Vector((1.0, 0.0, 0.0))
            while True:
                h_loc, _, _, _ = bvh_body.ray_cast(cur, d)
                if not h_loc:
                    break
                hits += 1
                cur = h_loc + d * 1e-4
            inside = (hits % 2) == 1
            if inside or dist < min_clear:
                out_dir = (p - loc).normalized() if (not inside and (p - loc).length > 1e-5) else nrm
                pushed = loc + out_dir * min_clear
                if sign > 0:
                    v.co = pushed
                else:
                    v.co = Vector((max(0.0, -pushed.x), pushed.y, pushed.z))


# ================================================================== DỰNG ÁO & QUẦN TRÊN GOC-001
def _build_shirt_shell_goc(name, coll, mat, bvh_body, wide_neck=False, sleeve_len='short', extra_margin=0.0, open_front=False):
    lv = _shirt_levels_goc(wide_neck=wide_neck, extra_margin=extra_margin)
    iv, ing, idn = 1, 2, 3

    bm = bmesh.new()
    V = []
    for i, L in enumerate(lv):
        row = []
        for k, p in enumerate(_level_ring(L)):
            if i == ing and k == 3:
                row.append(None)
                continue
            co = p.copy()
            if open_front and k == 0:
                co.x = 0.026
            row.append(bm.verts.new(co))
        V.append(row)

    for i in range(len(lv) - 1):
        for k in range(6):
            if i in (iv, ing) and k in (2, 3):
                continue
            bm.faces.new((V[i][k], V[i + 1][k], V[i + 1][k + 1], V[i][k + 1]))

    rings_src = SLEEVE_LONG_GOC if sleeve_len == 'long' else SLEEVE_SHORT_GOC
    hole = [V[iv][3], V[iv][2], V[ing][2], V[idn][2], V[idn][3], V[idn][4], V[ing][4], V[iv][4]]
    cs = [sum((v.co for v in hole), Vector()) / 8] + [Vector(r['c']) for r in rings_src]
    prev = hole
    sleeve_end = None
    for n_, r in enumerate(rings_src):
        nxt = cs[n_ + 2] if n_ + 2 < len(cs) else cs[n_ + 1] + (cs[n_ + 1] - cs[n_])
        ring = [bm.verts.new(p) for p in _limb_ring(r['c'], cs[n_], nxt, r['rx'] + extra_margin, r['ry'] + extra_margin, r.get('ax'))]
        for j in range(8):
            bm.faces.new((prev[j], ring[j], ring[(j + 1) % 8], prev[(j + 1) % 8]))
        prev = ring
        sleeve_end = ring

    _push_outside_bvh(bm, bvh_body, min_clear=0.012 + extra_margin)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    ob = _new_obj(name, bm, coll, mat)
    QA._apply_cloth_mods(ob, thickness=0.0032, levels=2)
    return ob, lv, sleeve_end


def build_clothes_goc(sc, outfit='xanh', lift_for_sandals=True):
    if outfit not in QA.OUTFITS:
        raise ValueError(f'Không có bộ đồ "{outfit}". Chọn trong: {list(QA.OUTFITS)}')
    cfg = QA.OUTFITS[outfit]
    coll = _ensure_coll(sc, CLOTH_COLL)

    body = bpy.data.objects.get('model_LOD0')
    dg = bpy.context.evaluated_depsgraph_get()
    bvh_body = BVHTree.FromObject(body, dg) if body else None

    mats = {
        'shirt': QA.mat_cloth(f'Goc_Ao_{outfit}', cfg['shirt']),
        'collar': QA.mat_cloth(f'Goc_CoAo_{outfit}', cfg['collar']),
        'pants': QA.mat_cloth(f'Goc_Quan_{outfit}', cfg['pants']),
        'sandal': QA.mat_simple(f'Goc_Dep_{outfit}', cfg['sandal'], rough=0.78),
        'sole': QA.mat_simple(f'Goc_DeDep_{outfit}', cfg['sole'], rough=0.88),
        'inner': QA.mat_cloth(f'Goc_AoTrong_{outfit}', cfg['inner_shirt']) if cfg.get('inner_shirt') else None,
        'badge': QA.mat_cloth('Goc_PhuHieu', cfg['badge']) if cfg.get('badge') else None,
        'trim': QA.mat_cloth(f'Goc_Vien_{outfit}', cfg['sleeve_trim']) if cfg.get('sleeve_trim') else None,
        'stripe': QA.mat_cloth(f'Goc_Soc_{outfit}', cfg['stripe']) if cfg.get('stripe') else None,
        'socks': QA.mat_cloth(f'Goc_Tat_{outfit}', cfg['high_socks']) if cfg.get('high_socks') else None,
    }

    extras = []
    open_front = bool(cfg.get('open_jacket'))
    extra_m = 0.012 if open_front else 0.0

    if open_front and mats.get('inner'):
        inner_ob, _, _ = _build_shirt_shell_goc(
            'Goc_AoTrong', coll, mats['inner'], bvh_body,
            wide_neck=False, sleeve_len='short', extra_margin=0.0, open_front=False,
        )
        extras.append(inner_ob)

    shirt, lv, sleeve_end = _build_shirt_shell_goc(
        'Goc_Ao', coll, mats['shirt'], bvh_body,
        wide_neck=(cfg['collar_type'] == 'wide_crew'),
        sleeve_len=cfg.get('sleeve_len', 'short'),
        extra_margin=extra_m,
        open_front=open_front,
    )

    # Cổ áo
    ctype = cfg['collar_type']
    if ctype in ('crew', 'wide_crew', 'vneck', 'hoodie'):
        bm_c = bmesh.new()
        L0 = lv[0]
        pts = _level_ring(L0)
        n_seg, m_seg, r_tube = len(pts), 8, 0.0085
        ring_verts = []
        for idx, p in enumerate(pts):
            rad = Vector((p.x, p.y - L0['yc'], 0.0)).normalized()
            if rad.length < 1e-4:
                rad = Vector((0, -1 if idx == 0 else 1, 0))
            sub = [bm_c.verts.new(p + rad * (r_tube * math.cos(2 * math.pi * j / m_seg)) + Vector((0, 0, r_tube * math.sin(2 * math.pi * j / m_seg)))) for j in range(m_seg)]
            ring_verts.append(sub)
        for i in range(n_seg - 1):
            for j in range(m_seg):
                jn = (j + 1) % m_seg
                bm_c.faces.new((ring_verts[i][j], ring_verts[i + 1][j], ring_verts[i + 1][jn], ring_verts[i][jn]))
        bmesh.ops.recalc_face_normals(bm_c, faces=bm_c.faces[:])
        co = _new_obj('Goc_CoAo', bm_c, coll, mats['collar'])
        m = co.modifiers.new('Mirror', 'MIRROR')
        m.use_axis = (True, False, False)
        m.use_clip = True
        m.use_mirror_merge = True
        s = co.modifiers.new('Subsurf', 'SUBSURF')
        s.levels = 1
        s.render_levels = 1
        for p in co.data.polygons:
            p.use_smooth = True
        extras.append(co)

    elif ctype in ('polo_shirt', 'stand_zip'):
        bm_c = bmesh.new()
        L0 = lv[0]
        pts = _level_ring(L0)
        h_top = 0.034 if ctype == 'stand_zip' else 0.020
        h_out = 0.028 if ctype == 'stand_zip' else -0.014
        out_k = 0.06 if ctype == 'stand_zip' else 0.28
        top_v = [bm_c.verts.new((Vector((0.026, p.y, p.z)) if (open_front and idx == 0) else p) + Vector((0, 0, h_top))) for idx, p in enumerate(pts)]
        out_v = [bm_c.verts.new((Vector((0.026, p.y, p.z)) if (open_front and idx == 0) else p) + Vector((p.x * out_k, (p.y - L0['yc']) * out_k, h_out))) for idx, p in enumerate(pts)]
        for i in range(len(pts) - 1):
            bm_c.faces.new((top_v[i], out_v[i], out_v[i + 1], top_v[i + 1]))
        bmesh.ops.recalc_face_normals(bm_c, faces=bm_c.faces[:])
        co = _new_obj('Goc_CoAo', bm_c, coll, mats['collar'])
        QA._apply_cloth_mods(co, thickness=0.0025, levels=1)
        extras.append(co)

    if cfg.get('hood'):
        bm_h = bmesh.new()
        bmesh.ops.create_uvsphere(bm_h, u_segments=16, v_segments=10, radius=1.0)
        for v in bm_h.verts:
            v.co = Vector((v.co.x * 0.145, 0.145 + v.co.y * 0.080, 0.990 + v.co.z * 0.090))
        hood = _new_obj('Goc_MuHoodie', bm_h, coll, mats['shirt'])
        s = hood.modifiers.new('Subsurf', 'SUBSURF')
        s.levels = 1
        s.render_levels = 1
        for p in hood.data.polygons:
            p.use_smooth = True
        extras.append(hood)

    if cfg.get('kangaroo'):
        bm_k = bmesh.new()
        bmesh.ops.create_cube(bm_k, size=1.0)
        for v in bm_k.verts:
            v.co = Vector((v.co.x * 0.255, -0.222 + v.co.y * 0.018, 0.585 + v.co.z * 0.120))
        kg = _new_obj('Goc_TuiKangaroo', bm_k, coll, mats['collar'])
        bv = kg.modifiers.new('Bevel', 'BEVEL')
        bv.width = 0.006
        bv.segments = 3
        for p in kg.data.polygons:
            p.use_smooth = True
        extras.append(kg)

    if cfg.get('pocket'):
        bm_p = bmesh.new()
        bmesh.ops.create_cube(bm_p, size=1.0)
        y_off = -0.198 if open_front else -0.184
        for v in bm_p.verts:
            v.co = Vector((0.095 + v.co.x * 0.060, y_off + v.co.y * 0.006, 0.770 + v.co.z * 0.072))
        tui = _new_obj('Goc_TuiAo', bm_p, coll, mats['collar'])
        bv = tui.modifiers.new('Bevel', 'BEVEL')
        bv.width = 0.002
        bv.segments = 2
        extras.append(tui)

        if cfg.get('badge'):
            bm_b = bmesh.new()
            bmesh.ops.create_cube(bm_b, size=1.0)
            for v in bm_b.verts:
                v.co = Vector((0.095 + v.co.x * 0.038, -0.189 + v.co.y * 0.003, 0.820 + v.co.z * 0.018))
            extras.append(_new_obj('Goc_PhuHieu', bm_b, coll, mats['badge']))

    if cfg.get('placket'):
        bm_k = bmesh.new()
        bmesh.ops.create_cube(bm_k, size=1.0)
        for v in bm_k.verts:
            v.co = Vector((v.co.x * 0.024, -0.214 + v.co.y * 0.005, 0.710 + v.co.z * 0.360))
        extras.append(_new_obj('Goc_NepCuc', bm_k, coll, mats['collar']))
        for idx, zb in enumerate((0.86, 0.77, 0.68, 0.59)):
            bm_bt = bmesh.new()
            bmesh.ops.create_uvsphere(bm_bt, u_segments=12, v_segments=6, radius=0.0055)
            for v in bm_bt.verts:
                v.co = Vector((v.co.x, -0.218 + v.co.y * 0.4, zb + v.co.z))
            extras.append(_new_obj(f'Goc_CucAo_{idx}', bm_bt, coll, mats['collar']))

    # Quần ống suông rộng
    lv_p = _pants_levels_goc()
    bm_q = bmesh.new()
    VP = [[bm_q.verts.new(p) for p in _level_ring(L)] for L in lv_p]
    for i in range(len(lv_p) - 1):
        for k in range(6):
            bm_q.faces.new((VP[i][k], VP[i + 1][k], VP[i + 1][k + 1], VP[i][k + 1]))
    L_bot = lv_p[-1]
    hang = bm_q.verts.new((0.0, (L_bot['b'] - L_bot['f']) / 2 + L_bot['yc'], 0.430))
    loop = [VP[-1][3], VP[-1][2], VP[-1][1], VP[-1][0], hang, VP[-1][6], VP[-1][5], VP[-1][4]]

    plen = cfg.get('pants_len', 'long')
    rings_p = PANTS_SHORT_GOC if plen == 'short' else (PANTS_JOGGER_GOC if plen == 'jogger' else PANTS_LONG_GOC)
    cs_p = [sum((v.co for v in loop), Vector()) / 8] + [Vector(r['c']) for r in rings_p]
    prev_p = loop
    for n_, r in enumerate(rings_p):
        nxt = cs_p[n_ + 2] if n_ + 2 < len(cs_p) else cs_p[n_ + 1] + (cs_p[n_ + 1] - cs_p[n_])
        ring = [bm_q.verts.new(p) for p in _limb_ring(r['c'], cs_p[n_], nxt, r['rx'], r['ry'])]
        for j in range(8):
            bm_q.faces.new((prev_p[j], ring[j], ring[(j + 1) % 8], prev_p[(j + 1) % 8]))
        prev_p = ring

    _push_outside_bvh(bm_q, bvh_body, min_clear=0.014)
    bmesh.ops.recalc_face_normals(bm_q, faces=bm_q.faces[:])
    pants = _new_obj('Goc_Quan', bm_q, coll, mats['pants'])
    QA._apply_cloth_mods(pants, thickness=0.0035, levels=2)

    # Dép xỏ ngón đế dày khớp chân NHAN-VAT-GOC-001 (x ≈ ±0.132, y ≈ -0.07)
    sandals = []
    for k, s in (('L', 1), ('R', -1)):
        sole = QA._slab(f'Goc_DeDep.{k}', 0.130, 0.295, SOLE_H, 0.005, mats['sole'], coll)
        sole.location = (s * 0.132, -0.095, SOLE_H * 0.5)
        bx = s * 0.110
        post = Vector((bx, -0.190, SOLE_H + 0.002))
        apex = Vector((bx + s * 0.004, -0.150, SOLE_H + 0.045))
        a1 = Vector((s * 0.080, -0.105, SOLE_H + 0.045))
        a2 = Vector((s * 0.185, -0.105, SOLE_H + 0.045))
        s1 = QA._tube(f'Goc_QuaiA.{k}', [post, apex, a1, Vector((s * 0.070, -0.075, SOLE_H + 0.002))], 0.008, mats['sandal'], coll)
        s2 = QA._tube(f'Goc_QuaiB.{k}', [post, apex, a2, Vector((s * 0.194, -0.075, SOLE_H + 0.002))], 0.008, mats['sandal'], coll)
        sandals.extend([sole, s1, s2])

    if lift_for_sandals and body:
        body.location.z = SOLE_H
        for ob in [shirt, pants] + extras:
            if ob:
                ob.location.z += SOLE_H
        bpy.context.view_layer.update()

    return dict(coll=coll, shirt=shirt, pants=pants, extras=extras, sandals=sandals, cfg=cfg)


def check_clothes_goc(sc):
    res = {}
    dg = bpy.context.evaluated_depsgraph_get()
    body = bpy.data.objects.get('model_LOD0')
    if not body:
        return {'body_missing': (False, 'Không tìm thấy model_LOD0')}

    bvh_body = BVHTree.FromObject(body, dg)

    def is_inside(pt):
        hits, cur = 0, pt.copy()
        d = Vector((1.0, 0.0, 0.0))
        while True:
            loc, _, _, _ = bvh_body.ray_cast(cur, d)
            if not loc:
                break
            hits += 1
            cur = loc + d * 1e-4
        return (hits % 2) == 1

    for name in ('Goc_Ao', 'Goc_Quan'):
        ob = bpy.data.objects.get(name)
        if not ob:
            res[f'exists_{name}'] = (False, 'thiếu')
            continue
        bm = bmesh.new()
        bm.from_object(ob, dg)
        bm.transform(ob.matrix_world)
        inside_cnt = 0
        dists = []
        step = max(1, len(bm.verts) // 400)
        for v in list(bm.verts)[::step]:
            if is_inside(v.co):
                inside_cnt += 1
            loc, _, _, dist = bvh_body.find_nearest(v.co)
            if loc:
                dists.append(dist)
        bm.free()
        mean_gap = (sum(dists) / len(dists) * 1000.0) if dists else 0.0
        res[f'no_clipping_{name}'] = (inside_cnt == 0, f'đỉnh xuyên vào model_LOD0: {inside_cnt}')
        res[f'loose_fit_{name}'] = (mean_gap >= 10.0, f'khoảng hở TB: {mean_gap:.1f} mm (yêu cầu ≥ 10 mm)')

    return res


def _render_goc(sc, out_dir, samples=24):
    os.makedirs(out_dir, exist_ok=True)
    # Đèn studio 3 điểm đơn giản
    for nm, loc, eng in (('Key', (2.5, -3.0, 2.8), 180), ('Fill', (-2.5, -2.5, 1.8), 90), ('Rim', (0.0, 3.0, 2.4), 120)):
        if nm not in bpy.data.objects:
            ld = bpy.data.lights.new(nm, 'AREA')
            ld.energy = eng
            ld.size = 2.0
            lo = bpy.data.objects.new(nm, ld)
            lo.location = loc
            sc.collection.objects.link(lo)
            d = Vector((0, 0, 0.9)) - Vector(loc)
            lo.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()

    sc.render.engine = 'CYCLES'
    sc.cycles.samples = samples
    sc.render.resolution_x, sc.render.resolution_y = 640, 1024
    views = {
        'truoc': (0, -5.5, 0.9),
        'nghieng': (5.5, 0, 0.9),
        'sau': (0, 5.5, 0.9),
        'goc34': (3.9, -3.9, 0.9),
    }
    for vname, loc in views.items():
        cd = bpy.data.cameras.new(f'cam_{vname}')
        cd.type = 'ORTHO'
        cd.ortho_scale = 1.95
        co = bpy.data.objects.new(f'cam_{vname}', cd)
        co.location = loc
        co.rotation_euler = (Vector((0, 0, 0.9)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
        sc.collection.objects.link(co)
        sc.camera = co
        sc.render.filepath = os.path.join(out_dir, f'{vname}.png')
        bpy.ops.render.render(write_still=True)


if __name__ == '__main__':
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    ap = argparse.ArgumentParser()
    ap.add_argument('--outfit', default='xanh', help='Tên bộ đồ hoặc "all"')
    ap.add_argument('--check', action='store_true')
    ap.add_argument('--render', default='')
    ap.add_argument('--blend', default='')
    ap.add_argument('--samples', type=int, default=24)
    a = ap.parse_args(argv)

    bpy.ops.wm.open_mainfile(filepath=SRC_BLEND)
    sc = bpy.context.scene

    targets = list(QA.OUTFITS.keys()) if a.outfit == 'all' else [a.outfit]
    all_ok = True
    for idx, name in enumerate(targets):
        print(f'\n=== THỬ TRANG PHỤC TRÊN NHAN-VAT-GOC-001: {name} ({QA.OUTFITS[name]["ten"]}) ===')
        build_clothes_goc(sc, outfit=name, lift_for_sandals=(idx == 0))
        if a.check:
            ok = QA.report(check_clothes_goc(sc))
            all_ok &= ok
        if a.render:
            out_dir = os.path.join(os.path.abspath(a.render), name) if a.outfit == 'all' else os.path.abspath(a.render)
            _render_goc(sc, out_dir, samples=a.samples)

    if a.blend:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))
    if a.check:
        print('\nKẾT QUẢ TỔNG (NHAN-VAT-GOC-001):', 'TẤT CẢ PASS' if all_ok else 'CÒN FAIL')
        sys.stdout.flush()
        os._exit(0 if all_ok else 1)
