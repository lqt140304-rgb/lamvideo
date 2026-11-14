"""NAM — QUẦN ÁO 3D DÁNG RỘNG (OVERSIZED / RELAXED STREETWEAR FIT).

Thiết kế: THIET-KE-QUAN-AO.md · Kế hoạch: KE-HOACH-QUAN-AO.md
Thân cơ sở: dung_than_cage_nam.py (Control Cage 1,60 m).

Chạy:
  D:/blender/blender.exe -b --factory-startup --python dung_quan_ao_nam.py -- [--outfit xanh|ngu|xam-tui|dong-phuc|the-thao|all] [--check] [--render DIR] [--blend FILE] [--samples N]

Cấu trúc:
  03_Clothes: Nam_Ao, Nam_CoAo, Nam_Quan, Nam_Dep.L/.R (+ chi tiết theo bộ đồ: Nam_TuiAo, Nam_NepCuc, Nam_PhuHieu, Nam_VienTay, Nam_SocQuan).
  Dáng áo boxy/drop-shoulder rộng thoải mái, tay lửng rộng; quần ống suông rộng (hoặc quần đùi rộng cho bộ ngủ/thể thao).
"""
import sys, os, math, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
from mathutils import Vector
from mathutils.bvhtree import BVHTree
import dung_dau_nam as D
import dung_than_nam as T
import dung_than_cage_nam as C

CLOTH_COLL = '03_Clothes'
SOLE_H = 0.015  # chiều cao đế dép (m)

# ================================================================== 5 BỘ TRANG PHỤC CHUẨN
OUTFITS = {
    'xanh': dict(
        ten='Thường nhật (Áo xanh rêu + Quần xám ống rộng)',
        shirt='#5c7a70', collar='#4f6960', pants='#515451',
        sandal='#425850', sole='#353937',
        collar_type='crew', pants_len='long',
        pocket=False, badge=False, placket=False, sleeve_trim=None, stripe=None,
    ),
    'ngu': dict(
        ten='Đồ ngủ ở phòng (Áo xám nhạt + Quần đùi rộng)',
        shirt='#8a8783', collar='#7c7975', pants='#454746',
        sandal='#425850', sole='#353937',
        collar_type='wide_crew', pants_len='short',
        pocket=False, badge=False, placket=False, sleeve_trim=None, stripe=None,
    ),
    'xam-tui': dict(
        ten='Áo xám túi ngực + Quần dài suông',
        shirt='#a7a8a0', collar='#96978f', pants='#515451',
        sandal='#425850', sole='#353937',
        collar_type='crew', pants_len='long',
        pocket=True, badge=False, placket=False, sleeve_trim=None, stripe=None,
    ),
    'dong-phuc': dict(
        ten='Đồng phục giảng đường (Sơ mi trắng + Quần âu xanh than)',
        shirt='#f3f0e6', collar='#eae6da', pants='#2f3b53',
        sandal='#3b4048', sole='#26292e',
        collar_type='polo_shirt', pants_len='long',
        pocket=True, badge='#3f6aa1', placket=True, sleeve_trim=None, stripe=None,
    ),
    'the-thao': dict(
        ten='Đồ thể thao (Áo cam viền trắng + Quần đùi sọc)',
        shirt='#d4673f', collar='#f6efe0', pants='#2c3138',
        sandal='#3a3f47', sole='#22252a',
        collar_type='vneck', pants_len='short',
        pocket=False, badge=False, placket=False, sleeve_trim='#f6efe0', stripe='#f6efe0',
    ),
}


# ================================================================== VẬT LIỆU VẢI & DÉP
def hexc(h, a=1.0):
    h = h.lstrip('#')
    r, g, b = (int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4))
    return (r ** 2.2, g ** 2.2, b ** 2.2, a)


def mat_cloth(name, col, rough=0.84, sheen=0.35, bump=0.12):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    b = nt.nodes.new('ShaderNodeBsdfPrincipled')
    b.inputs['Base Color'].default_value = hexc(col)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Specular IOR Level'].default_value = 0.28
    b.inputs['Sheen Weight'].default_value = sheen
    b.inputs['Sheen Roughness'].default_value = 0.65
    if bump > 0:
        tc = nt.nodes.new('ShaderNodeTexCoord')
        n1 = nt.nodes.new('ShaderNodeTexNoise')
        n1.inputs['Scale'].default_value = 850.0
        n1.inputs['Detail'].default_value = 4.0
        n2 = nt.nodes.new('ShaderNodeTexNoise')
        n2.inputs['Scale'].default_value = 130.0
        n2.inputs['Detail'].default_value = 2.0
        mix = nt.nodes.new('ShaderNodeMath')
        mix.operation = 'ADD'
        bp = nt.nodes.new('ShaderNodeBump')
        bp.inputs['Strength'].default_value = bump
        bp.inputs['Distance'].default_value = 0.0006
        nt.links.new(tc.outputs['Object'], n1.inputs['Vector'])
        nt.links.new(tc.outputs['Object'], n2.inputs['Vector'])
        nt.links.new(n1.outputs['Fac'], mix.inputs[0])
        nt.links.new(n2.outputs['Fac'], mix.inputs[1])
        nt.links.new(mix.outputs[0], bp.inputs['Height'])
        nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    nt.links.new(b.outputs['BSDF'], out.inputs['Surface'])
    return m


def mat_simple(name, col, rough=0.75):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes.get('Principled BSDF')
    if b:
        b.inputs['Base Color'].default_value = hexc(col)
        b.inputs['Roughness'].default_value = rough
        b.inputs['Specular IOR Level'].default_value = 0.35
    return m


def _ensure_coll(sc, name):
    c = bpy.data.collections.get(name)
    if not c:
        c = bpy.data.collections.new(name)
        sc.collection.children.link(c)
    for ob in list(c.objects):
        bpy.data.objects.remove(ob, do_unlink=True)
    return c


# ================================================================== THÔNG SỐ CAGE DÁNG RỘNG (OVERSIZED)
def _shirt_levels(wide_neck=False):
    """Lát cắt thân áo dáng boxy / drop-shoulder (mở rộng từ CAGE_LEVELS)."""
    d_neck = 0.012 if wide_neck else 0.0
    return [
        dict(ten='co_ao',     z=0.892 - d_neck * 0.5, w=0.095 + d_neck, f=0.092 + d_neck, b=0.072, n=2.0, yc=-0.012),
        dict(ten='vai_ao',    z=0.842, w=0.224, f=0.142, b=0.120, n=2.2, yc=0.0),
        dict(ten='nguc_ao',   z=0.775, w=0.190, f=0.160, b=0.120, n=2.2, yc=0.0),
        dict(ten='duoi_nguc', z=0.690, w=0.184, f=0.188, b=0.126, n=2.2, yc=0.0),
        dict(ten='bung_ao',   z=0.630, w=0.192, f=0.204, b=0.136, n=2.2, yc=0.0),
        dict(ten='eo_ao',     z=0.560, w=0.198, f=0.204, b=0.156, n=2.2, yc=0.0),
        dict(ten='gau_ao',    z=0.485, w=0.204, f=0.196, b=0.162, n=2.2, yc=0.0),
    ]


SLEEVE_RINGS = [
    dict(ten='tay_vai',  c=(0.202, 0.000, 0.720), rx=0.080, ry=0.082, ax=(0.7071, 0.0, -0.7071)),
    dict(ten='tay_giua', c=(0.214, -0.002, 0.665), rx=0.082, ry=0.082),
    dict(ten='tay_gau',  c=(0.224, -0.004, 0.625), rx=0.084, ry=0.084),
]


def _level_ring_custom(L):
    """Nửa vòng 7 đỉnh siêu elip; riêng co_ao cho phép trễ cổ phía trước (-Y)."""
    e = 2.0 / L['n']
    pts = []
    for k in range(7):
        th = math.pi * k / 6
        s, c = math.sin(th), math.cos(th)
        x = 0.0 if k in (0, 6) else L['w'] * abs(s) ** e
        y = L['yc'] - L['f'] * abs(c) ** e if c >= 0 else L['yc'] + L['b'] * abs(c) ** e
        z = L['z']
        if L['ten'] == 'co_ao':
            # Cổ trước (-Y, k=0) trễ xuống 2.2 cm, cổ sau (k=6) cao hơn 0.8 cm
            z += -0.022 * max(0.0, c) + 0.008 * max(0.0, -c)
        pts.append(Vector((x, y, z)))
    return pts


def _apply_cloth_mods(ob, thickness=0.003, levels=2):
    m = ob.modifiers.new('Mirror', 'MIRROR')
    m.use_axis = (True, False, False)
    m.use_clip = True
    m.use_mirror_merge = True
    m.merge_threshold = 1e-4

    s = ob.modifiers.new('Subsurf', 'SUBSURF')
    s.levels = levels
    s.render_levels = levels

    sol = ob.modifiers.new('Solidify', 'SOLIDIFY')
    sol.thickness = thickness
    sol.offset = 1.0  # dày hướng ra ngoài để không bao giờ ăn vào da
    sol.use_rim = True
    for p in ob.data.polygons:
        p.use_smooth = True


# ================================================================== DỰNG ÁO & CHI TIẾT
def build_shirt(coll, cfg, mats):
    """Áo dáng rộng boxy / drop-shoulder, tay lửng rộng."""
    wide_neck = (cfg['collar_type'] == 'wide_crew')
    lv = _shirt_levels(wide_neck=wide_neck)
    iv, ing, idn = 1, 2, 3  # vai_ao, nguc_ao, duoi_nguc

    bm = bmesh.new()
    V = []
    for i, L in enumerate(lv):
        row = []
        for k, p in enumerate(_level_ring_custom(L)):
            if i == ing and k == 3:
                row.append(None)
                continue
            row.append(bm.verts.new(p))
        V.append(row)

    def quad(a, b, c, d):
        bm.faces.new((a, d, c, b))

    for i in range(len(lv) - 1):
        for k in range(6):
            if i in (iv, ing) and k in (2, 3):
                continue
            quad(V[i][k], V[i][k + 1], V[i + 1][k + 1], V[i + 1][k])

    # Ống tay áo rộng (mở ở gấu tay)
    hole = [V[iv][3], V[iv][2], V[ing][2], V[idn][2], V[idn][3], V[idn][4], V[ing][4], V[iv][4]]
    cs = [sum((v.co for v in hole), Vector()) / 8] + [Vector(r['c']) for r in SLEEVE_RINGS]
    prev = hole
    sleeve_end = None
    for n_, r in enumerate(SLEEVE_RINGS):
        nxt = cs[n_ + 2] if n_ + 2 < len(cs) else cs[n_ + 1] + (cs[n_ + 1] - cs[n_])
        ring = [bm.verts.new(p) for p in C.limb_ring(r['c'], cs[n_], nxt, r['rx'], r['ry'], r.get('ax'))]
        for j in range(8):
            bm.faces.new((prev[j], ring[j], ring[(j + 1) % 8], prev[(j + 1) % 8]))
        prev = ring
        sleeve_end = ring

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    ob = D.new_obj('Nam_Ao', bm, coll, mats['shirt'])
    _apply_cloth_mods(ob, thickness=0.003, levels=2)

    extras = []

    # 1. Cổ áo
    if cfg['collar_type'] in ('crew', 'wide_crew', 'vneck'):
        bm_c = bmesh.new()
        L0 = lv[0]
        pts = _level_ring_custom(L0)
        # Dựng vành bo cổ ôm sát miệng cổ áo
        n_seg, m_seg, r_tube = len(pts), 8, 0.0075
        ring_verts = []
        for idx, p in enumerate(pts):
            # Hướng hướng tâm từ trục cổ
            rad = Vector((p.x, p.y - L0['yc'], 0.0)).normalized()
            if rad.length < 1e-4:
                rad = Vector((0, -1 if idx == 0 else 1, 0))
            sub = []
            for j in range(m_seg):
                ang = 2 * math.pi * j / m_seg
                off = rad * (r_tube * math.cos(ang)) + Vector((0, 0, r_tube * math.sin(ang)))
                sub.append(bm_c.verts.new(p + off))
            ring_verts.append(sub)
        for i in range(n_seg - 1):
            for j in range(m_seg):
                jn = (j + 1) % m_seg
                bm_c.faces.new((ring_verts[i][j], ring_verts[i + 1][j], ring_verts[i + 1][jn], ring_verts[i][jn]))
        bmesh.ops.recalc_face_normals(bm_c, faces=bm_c.faces[:])
        co = D.new_obj('Nam_CoAo', bm_c, coll, mats['collar'])
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

    elif cfg['collar_type'] == 'polo_shirt':
        # Cổ bẻ sơ mi cho đồng phục
        bm_c = bmesh.new()
        L0 = lv[0]
        pts = _level_ring_custom(L0)
        top_v = [bm_c.verts.new(p + Vector((0, 0, 0.018))) for p in pts]
        out_v = [bm_c.verts.new(p + Vector((p.x * 0.28, (p.y - L0['yc']) * 0.28, -0.012))) for p in pts]
        for i in range(len(pts) - 1):
            bm_c.faces.new((top_v[i], out_v[i], out_v[i + 1], top_v[i + 1]))
        bmesh.ops.recalc_face_normals(bm_c, faces=bm_c.faces[:])
        co = D.new_obj('Nam_CoAo', bm_c, coll, mats['collar'])
        _apply_cloth_mods(co, thickness=0.0025, levels=1)
        extras.append(co)

    # 2. Viền gấu tay áo (đồ thể thao)
    if cfg.get('sleeve_trim') and sleeve_end:
        bm_t = bmesh.new()
        r_trim = 0.005
        ring_v = []
        c_end = sum((v.co for v in sleeve_end), Vector()) / 8
        for v in sleeve_end:
            rad = (v.co - c_end).normalized()
            sub = []
            for j in range(8):
                ang = 2 * math.pi * j / 8
                off = rad * (r_trim * math.cos(ang)) + Vector((0, 0, r_trim * math.sin(ang)))
                sub.append(bm_t.verts.new(v.co + off))
            ring_v.append(sub)
        for i in range(8):
            inxt = (i + 1) % 8
            for j in range(8):
                jn = (j + 1) % 8
                bm_t.faces.new((ring_v[i][j], ring_v[inxt][j], ring_v[inxt][jn], ring_v[i][jn]))
        bmesh.ops.recalc_face_normals(bm_t, faces=bm_t.faces[:])
        vt = D.new_obj('Nam_VienTay', bm_t, coll, mats['trim'])
        m = vt.modifiers.new('Mirror', 'MIRROR')
        m.use_axis = (True, False, False)
        for p in vt.data.polygons:
            p.use_smooth = True
        extras.append(vt)

    # 3. Túi ngực trái (+X, -Y) cho xam-tui & dong-phuc
    if cfg.get('pocket'):
        bm_p = bmesh.new()
        bmesh.ops.create_cube(bm_p, size=1.0)
        for v in bm_p.verts:
            v.co = Vector((0.088 + v.co.x * 0.058, -0.172 + v.co.y * 0.006, 0.725 + v.co.z * 0.068))
        tui = D.new_obj('Nam_TuiAo', bm_p, coll, mats['collar'])
        bv = tui.modifiers.new('Bevel', 'BEVEL')
        bv.width = 0.002
        bv.segments = 2
        extras.append(tui)

        if cfg.get('badge'):
            bm_b = bmesh.new()
            bmesh.ops.create_cube(bm_b, size=1.0)
            for v in bm_b.verts:
                v.co = Vector((0.088 + v.co.x * 0.036, -0.176 + v.co.y * 0.003, 0.772 + v.co.z * 0.018))
            ph = D.new_obj('Nam_PhuHieu', bm_b, coll, mats['badge'])
            extras.append(ph)

    # 4. Nẹp cúc áo sơ mi (dong-phuc)
    if cfg.get('placket'):
        bm_k = bmesh.new()
        bmesh.ops.create_cube(bm_k, size=1.0)
        for v in bm_k.verts:
            v.co = Vector((v.co.x * 0.022, -0.194 + v.co.y * 0.005, 0.680 + v.co.z * 0.340))
        nep = D.new_obj('Nam_NepCuc', bm_k, coll, mats['collar'])
        extras.append(nep)
        for idx, zb in enumerate((0.81, 0.73, 0.65, 0.57)):
            bm_bt = bmesh.new()
            bmesh.ops.create_uvsphere(bm_bt, u_segments=12, v_segments=6, radius=0.005)
            for v in bm_bt.verts:
                v.co = Vector((v.co.x, -0.198 + v.co.y * 0.4, zb + v.co.z))
            bt = D.new_obj(f'Nam_CucAo_{idx}', bm_bt, coll, mats['collar'])
            extras.append(bt)

    return ob, extras


# ================================================================== DỰNG QUẦN ỐNG SUÔNG RỘNG
def _pants_levels():
    """Các mức hông quần: cạp tại z=0.565, đũng hạ thấp thoải mái z=0.425."""
    return [
        dict(ten='cap_quan',   z=0.565, w=0.184, f=0.184, b=0.144, n=2.2, yc=0.0),
        dict(ten='chau_quan',  z=0.520, w=0.194, f=0.178, b=0.154, n=2.3, yc=0.0),
        dict(ten='day_quan',   z=0.460, w=0.196, f=0.152, b=0.146, n=2.3, yc=0.0),
    ]


PANTS_LEG_LONG = [
    dict(ten='dui_tren', c=(0.097, 0.000, 0.400), rx=0.105, ry=0.108),
    dict(ten='dui_giua', c=(0.099, 0.000, 0.320), rx=0.102, ry=0.104),
    dict(ten='goi_quan', c=(0.099, -0.002, 0.240), rx=0.098, ry=0.100),
    dict(ten='ong_duoi', c=(0.096, 0.002, 0.165), rx=0.095, ry=0.098),
    dict(ten='gau_quan', c=(0.094, 0.002, 0.120), rx=0.095, ry=0.098),
]

PANTS_LEG_SHORT = [
    dict(ten='dui_tren', c=(0.097, 0.000, 0.400), rx=0.106, ry=0.108),
    dict(ten='dui_giua', c=(0.099, 0.000, 0.325), rx=0.104, ry=0.106),
    dict(ten='gau_dui',  c=(0.099, -0.002, 0.285), rx=0.105, ry=0.106),
]


def build_pants(coll, cfg, mats):
    """Quần ống suông rộng (dài hoặc đùi), mở cạp và mở gấu hai ống."""
    lv = _pants_levels()
    bm = bmesh.new()
    V = []
    for L in lv:
        V.append([bm.verts.new(p) for p in _level_ring_custom(L)])

    for i in range(len(lv) - 1):
        for k in range(6):
            bm.faces.new((V[i][k], V[i + 1][k], V[i + 1][k + 1], V[i][k + 1]))

    # Đũng quần hạ thấp (z = 0.425 m, thấp hơn đũng thật 2.5 cm)
    L_bot = lv[-1]
    hang = bm.verts.new((0.0, (L_bot['b'] - L_bot['f']) / 2, 0.425))
    loop = [V[-1][3], V[-1][2], V[-1][1], V[-1][0], hang, V[-1][6], V[-1][5], V[-1][4]]

    rings = PANTS_LEG_LONG if cfg['pants_len'] == 'long' else PANTS_LEG_SHORT
    cs = [sum((v.co for v in loop), Vector()) / 8] + [Vector(r['c']) for r in rings]
    prev = loop
    for n_, r in enumerate(rings):
        nxt = cs[n_ + 2] if n_ + 2 < len(cs) else cs[n_ + 1] + (cs[n_ + 1] - cs[n_])
        ring = [bm.verts.new(p) for p in C.limb_ring(r['c'], cs[n_], nxt, r['rx'], r['ry'])]
        for j in range(8):
            bm.faces.new((prev[j], ring[j], ring[(j + 1) % 8], prev[(j + 1) % 8]))
        prev = ring

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    ob = D.new_obj('Nam_Quan', bm, coll, mats['pants'])
    _apply_cloth_mods(ob, thickness=0.0035, levels=2)

    extras = []
    if cfg.get('stripe'):
        # Sọc trắng hai bên hông quần thể thao
        bm_s = bmesh.new()
        bmesh.ops.create_cube(bm_s, size=1.0)
        for v in bm_s.verts:
            v.co = Vector((0.203 + v.co.x * 0.004, v.co.y * 0.016, 0.415 + v.co.z * 0.250))
        st = D.new_obj('Nam_SocQuan', bm_s, coll, mats['stripe'])
        m = st.modifiers.new('Mirror', 'MIRROR')
        m.use_axis = (True, False, False)
        extras.append(st)

    return ob, extras


# ================================================================== DỰNG DÉP LÊ & NÂNG MẶT SÀN
def _slab(name, w, d, h, r, mat, coll):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * w, v.co.y * d, v.co.z * h))
    ob = D.new_obj(name, bm, coll, mat)
    bv = ob.modifiers.new('Bevel', 'BEVEL')
    bv.width = r
    bv.segments = 4
    for p in ob.data.polygons:
        p.use_smooth = True
    return ob


def _tube(name, pts, r, mat, coll):
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = r
    cu.bevel_resolution = 4
    cu.use_fill_caps = True
    sp = cu.splines.new('BEZIER')
    sp.bezier_points.add(len(pts) - 1)
    for bp, p in zip(sp.bezier_points, pts):
        bp.co = p
        bp.handle_left_type = bp.handle_right_type = 'AUTO'
    tmp = bpy.data.objects.new(name + '_tmp', cu)
    coll.objects.link(tmp)
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(tmp.evaluated_get(dg))
    me.name = name
    bpy.data.objects.remove(tmp, do_unlink=True)
    bpy.data.curves.remove(cu)
    me.shade_smooth()
    me.materials.append(mat)
    ob = bpy.data.objects.new(name, me)
    coll.objects.link(ob)
    return ob


def build_sandals(coll, mats, feet_objs):
    """Dép xỏ ngón đế dày ôm sát mặt bàn chân qua BVH ray_cast."""
    dg = bpy.context.evaluated_depsgraph_get()
    out = []
    for k, s in (('L', 1), ('R', -1)):
        foot = feet_objs.get(f'Nam_BanChan.{k}')
        if foot:
            bvh = BVHTree.FromObject(foot, dg)
            def top(x, y, lift):
                hit = bvh.ray_cast(Vector((x, y, 0.110)), Vector((0, 0, -1)))
                z_val = (hit[0].z if hit[0] else 0.025) + SOLE_H + lift
                return Vector((x, y, z_val))
        else:
            def top(x, y, lift):
                return Vector((x, y, 0.030 + SOLE_H + lift))

        sole = _slab(f'Nam_DeDep.{k}', 0.118, 0.278, SOLE_H, 0.005, mats['sole'], coll)
        sole.location = (s * 0.093, -0.042, SOLE_H * 0.5)

        bx = s * 0.075
        post = Vector((bx, -0.134, SOLE_H + 0.002))
        apex = top(bx + s * 0.004, -0.100, 0.009)
        a1 = top(s * 0.048, -0.060, 0.009)
        a2 = top(s * 0.136, -0.060, 0.009)
        s1 = _tube(f'Nam_QuaiA.{k}', [post, apex, a1, Vector((s * 0.038, -0.038, SOLE_H + 0.002))], 0.007, mats['sandal'], coll)
        s2 = _tube(f'Nam_QuaiB.{k}', [post, apex, a2, Vector((s * 0.144, -0.038, SOLE_H + 0.002))], 0.007, mats['sandal'], coll)
        out.extend([sole, s1, s2])
    return out


# ================================================================== HÀM DỰNG CHÍNH
def build_clothes(sc, outfit='xanh', lift_for_sandals=True):
    """Dựng đầy đủ bộ quần áo cho thân Control Cage trong scene `sc`."""
    if outfit not in OUTFITS:
        raise ValueError(f'Không có bộ đồ "{outfit}". Chọn trong: {list(OUTFITS)}')
    cfg = OUTFITS[outfit]
    coll = _ensure_coll(sc, CLOTH_COLL)

    mats = {
        'shirt': mat_cloth(f'Nam_Ao_{outfit}', cfg['shirt']),
        'collar': mat_cloth(f'Nam_CoAo_{outfit}', cfg['collar']),
        'pants': mat_cloth(f'Nam_Quan_{outfit}', cfg['pants']),
        'sandal': mat_simple(f'Nam_Dep_{outfit}', cfg['sandal'], rough=0.78),
        'sole': mat_simple(f'Nam_DeDep_{outfit}', cfg['sole'], rough=0.88),
        'badge': mat_cloth('Nam_PhuHieu', cfg['badge']) if cfg.get('badge') else None,
        'trim': mat_cloth('Nam_VienTheThao', cfg['sleeve_trim']) if cfg.get('sleeve_trim') else None,
        'stripe': mat_cloth('Nam_SocQuan', cfg['stripe']) if cfg.get('stripe') else None,
    }

    shirt, shirt_extras = build_shirt(coll, cfg, mats)
    pants, pants_extras = build_pants(coll, cfg, mats)
    feet = {n: bpy.data.objects.get(n) for n in ('Nam_BanChan.L', 'Nam_BanChan.R')}
    sandals = build_sandals(coll, mats, feet)

    if lift_for_sandals:
        # Nâng nhân vật và áo quần lên bằng độ dày đế dép để mặt dưới đế chạm sàn Z=0
        to_lift = [bpy.data.objects.get('Nam_Dau_Than'), feet.get('Nam_BanChan.L'), feet.get('Nam_BanChan.R'),
                   shirt, pants] + shirt_extras + pants_extras
        for ob in to_lift:
            if ob:
                ob.location.z += SOLE_H
        bpy.context.view_layer.update()

    return dict(coll=coll, shirt=shirt, pants=pants, extras=shirt_extras + pants_extras, sandals=sandals, cfg=cfg)


# ================================================================== KIỂM TRA TỰ ĐỘNG (--check)
def _eval_mesh(ob, dg):
    bm = bmesh.new()
    bm.from_object(ob, dg)
    bm.transform(ob.matrix_world)
    return bm


def check_clothes(sc):
    """Kiểm tra hình học, độ hở dáng rộng và chống xuyên cơ thể qua BVH."""
    res = {}
    dg = bpy.context.evaluated_depsgraph_get()
    body = bpy.data.objects.get('Nam_Dau_Than')
    if not body:
        return {'body_missing': (False, 'Không tìm thấy Nam_Dau_Than')}

    for name in ('Nam_Ao', 'Nam_Quan', 'Nam_DeDep.L', 'Nam_DeDep.R'):
        ob = bpy.data.objects.get(name)
        res[f'exists_{name}'] = (ob is not None and name in bpy.data.collections[CLOTH_COLL].objects, 'có' if ob else 'thiếu')

    bvh_body = BVHTree.FromObject(body, dg)

    def is_inside_body(pt):
        # Đếm số lần giao tia hướng +X (ray parity) để biết điểm có nằm bên trong mesh kín Nam_Dau_Than không
        hits, p = 0, pt.copy()
        d = Vector((1.0, 0.0, 0.0))
        while True:
            loc, _, _, dist = bvh_body.ray_cast(p, d)
            if not loc:
                break
            hits += 1
            p = loc + d * 1e-4
        return (hits % 2) == 1

    for name in ('Nam_Ao', 'Nam_Quan'):
        ob = bpy.data.objects.get(name)
        if not ob:
            continue
        bm = _eval_mesh(ob, dg)
        non_manifold = sum(1 for e in bm.edges if len(e.link_faces) > 2)
        res[f'manifold_{name}'] = (non_manifold == 0, f'cạnh > 2 mặt: {non_manifold}')

        inside_cnt = 0
        dists = []
        step = max(1, len(bm.verts) // 400)
        for v in list(bm.verts)[::step]:
            if is_inside_body(v.co):
                inside_cnt += 1
            loc, _, _, dist = bvh_body.find_nearest(v.co)
            if loc:
                dists.append(dist)
        bm.free()

        mean_gap = (sum(dists) / len(dists) * 1000.0) if dists else 0.0
        res[f'no_clipping_{name}'] = (inside_cnt == 0, f'đỉnh xuyên vào thân: {inside_cnt}')
        res[f'loose_fit_{name}'] = (mean_gap >= 10.0, f'khoảng hở TB: {mean_gap:.1f} mm (yêu cầu ≥ 10 mm)')

    return res


def report(res):
    ok = True
    for k, (passed, msg) in res.items():
        print(f'  [{"PASS" if passed else "FAIL"}] {k}: {msg}')
        ok &= passed
    return ok


# ================================================================== CHẠY TỪ CLI
if __name__ == '__main__':
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    ap = argparse.ArgumentParser()
    ap.add_argument('--outfit', default='xanh', help='xanh | ngu | xam-tui | dong-phuc | the-thao | all')
    ap.add_argument('--check', action='store_true')
    ap.add_argument('--render', default='')
    ap.add_argument('--blend', default='')
    ap.add_argument('--samples', type=int, default=24)
    ap.add_argument('--no-sandal-lift', action='store_true')
    a = ap.parse_args(argv)

    # Dựng nhân vật Control Cage cơ sở
    sc = C.build_old()
    cb = bpy.data.collections[C.NEW_COLL]
    C.split_hands_feet(bpy.data.objects['Nam_Than_goc'], cb)
    cage = C.build_cage(cb)
    C.assemble_cage(bpy.data.objects['Head_Base'], cage, bpy.data.objects['Nam_Than_goc'].data.materials[0])
    cage.hide_render = True

    targets = list(OUTFITS.keys()) if a.outfit == 'all' else [a.outfit]
    all_ok = True
    for idx, name in enumerate(targets):
        print(f'\n=== DỰNG TRANG PHỤC: {name} ({OUTFITS[name]["ten"]}) ===')
        # Chỉ nâng đế dép ở lượt đầu nếu chạy 'all'
        build_clothes(sc, outfit=name, lift_for_sandals=(not a.no_sandal_lift and idx == 0))
        if a.check:
            ok = report(check_clothes(sc))
            all_ok &= ok
        if a.render:
            T.lights(sc)
            out_dir = os.path.join(os.path.abspath(a.render), name) if a.outfit == 'all' else os.path.abspath(a.render)
            C.render_views(sc, out_dir, ['truoc', 'nghieng', 'sau', 'goc34'], samples=a.samples, clay=False)

    if a.blend:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))
    if a.check:
        print('\nKẾT QUẢ TỔNG:', 'TẤT CẢ PASS' if all_ok else 'CÒN FAIL')
        sys.stdout.flush()
        os._exit(0 if all_ok else 1)
