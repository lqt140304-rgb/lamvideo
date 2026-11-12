"""ĐẦU + TÓC NAM 3D — dựng modular (Box Modeling + Subsurf), Blender 5.x bpy (12/11/2026).

Khác bản metaball (`dung_nam.py`): mỗi bộ phận là một đối tượng riêng, topology quad sạch, để chỉnh từng phần như dựng tay.
Đối chiếu ảnh mẫu `../thiet-ke/thu-3d/mau-3d-dau.webp` (NAM — 3D TURNAROUND).

Chạy:
  python dung_dau_nam.py --render <thư mục>      # ảnh trực giao chính diện (Numpad 1) + nghiêng phải (Numpad 3)
  python dung_dau_nam.py --blend Nam_Dau.blend   # lưu file
Trong Blender: blender -b -P dung_dau_nam.py -- --render ...

Collection `Nam_Dau` →
  03_Head_And_Face: Head_Base (khối hộp bo tròn, Mirror X + Subsurf 2, Boolean khoét miệng), Eyeball.L/R, Pupil.L/R (con của nhãn cầu),
                    Eyelid.L/R (dải mí ôm nhãn cầu, Solidify + Subsurf; nghỉ = sụp 40%), Eyeline.L/R, Eyebrow.L/R, Mole, Nose,
                    Mouth_Cavity / Teeth / Tongue / Lip, Ear.L/R
  04_Hair: Hair_Cap (mũ tóc nhân bản từ nửa trên sọ, nở 1,02×, Solidify), Hair_Lobe.* (giọt nước dẹt), Hair_Wing.L/R, Hair_Tuft (Bézier + Bevel) + Hair_Tuft_Tip
Đơn vị mét, nhân vật quay mặt −Y, bên trái nhân vật là +X (.L). Tâm đầu C, cằm ~1,04 m.
"""
import sys, os, math, argparse
import bpy, bmesh
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree

C = Vector((0.0, 0.0, 1.25))                       # tâm hộp sọ
HEAD = (0.210, 0.225, 0.215)                       # nửa rộng (x), nửa sâu (y), nửa cao (z): sọ chibi tròn bè, sâu gáy, không nhọn dài
MOLE_SIDE = -1   # nốt ruồi theo ảnh mẫu: đuôi mày PHẢI nhân vật (−X, bên TRÁI ảnh chính diện). Đổi thành +1 nếu muốn đuôi mày trái.

COL = {'da': '#df9668', 'toc': '#2a2928', 'trang': '#f3efe7', 'muc': '#1c1a19', 'khoang_mieng': '#4a1c1a', 'luoi': '#c2675f', 'rang': '#f4efe6'}


def hexc(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4) for x in c) + (1.0,)


def mat(name, col, rough, sss=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = hexc(col); b.inputs['Roughness'].default_value = rough
    if sss:
        b.inputs['Subsurface Weight'].default_value = sss; b.inputs['Subsurface Radius'].default_value = (0.9, 0.35, 0.2); b.inputs['Subsurface Scale'].default_value = 0.01
    return m


def make_mats():
    return {'da': mat('Da', COL['da'], 0.65, 0.05), 'toc': mat('Toc', COL['toc'], 0.75), 'trang': mat('Mat_Trang', COL['trang'], 0.3),
            'muc': mat('Muc', COL['muc'], 0.5), 'khoang': mat('Khoang_Mieng', COL['khoang_mieng'], 0.8), 'luoi': mat('Luoi', COL['luoi'], 0.55),
            'rang': mat('Rang', COL['rang'], 0.3)}


def new_obj(name, bm_or_me, coll, m=None, smooth=True):
    if isinstance(bm_or_me, bmesh.types.BMesh):
        me = bpy.data.meshes.new(name); bm_or_me.to_mesh(me); bm_or_me.free()
    else:
        me = bm_or_me
    if smooth: me.shade_smooth()
    if m:
        for x in (m if isinstance(m, (list, tuple)) else [m]): me.materials.append(x)
    ob = bpy.data.objects.new(name, me); coll.objects.link(ob); return ob


def subsurf(ob, v=1, r=2):
    s = ob.modifiers.new('Subdivision', 'SUBSURF'); s.levels = v; s.render_levels = r; return s


def smooth01(a, b, x):
    t = min(1.0, max(0.0, (x - a) / (b - a))); return t * t * (3 - 2 * t)


# ------------------------------------------------------------------ Head_Base: hộp bo tròn
def head_cage():
    """Lồng điều khiển đầu: cube chia 8 đoạn/cạnh (có vòng cạnh giữa x = 0 cho Mirror) → bo về cầu 78% → má phính, cằm ngắn bầu tròn."""
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=2.0)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=7, use_grid_fill=True)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    for v in bm.verts:
        p = v.co.copy(); s = p.normalized(); p = p.lerp(s, 0.78 + 0.17 * smooth01(-0.2, 0.6, p.y))   # hộp bo tròn; sau đầu tròn hẳn (không vách phẳng)
        u, w, h = p.x, p.y, p.z                                              # w < 0 là mặt trước
        front = smooth01(0.1, -0.7, w)
        cheek = math.exp(-((h + 0.38) / 0.32) ** 2) * (0.35 + 0.65 * front)  # má phính ở nửa dưới
        p.x *= 1.0 + 0.03 * cheek                                            # má phính nhẹ, nối liền thái dương thành oval mềm
        low = smooth01(-0.35, -0.95, h)                                      # cằm ngắn, bầu tròn, hơi đưa ra trước
        p.x *= 1.0 - 0.08 * low * low                                       # đáy cằm rộng, bầu
        p.y -= 0.10 * low * front
        if h < -0.75: p.z = -0.75 + (h + 0.75) * 0.65                         # đáy cằm bầu, không nhọn
        p.y *= 1.0 - 0.06 * front * smooth01(-0.2, 0.6, h)                   # trán–mặt hơi phẳng phía trước, không hốc mắt sâu
        p.y *= 1.0 + 0.20 * smooth01(0.0, 0.8, w) * math.exp(-((h + 0.05) / 0.6) ** 2)   # chẩm sau đầu phồng tròn lẳn, ôm xuống cổ
        v.co = Vector((p.x * HEAD[0], p.y * HEAD[1] - 0.025 * low * front, p.z * HEAD[2])) + C   # cằm dưới đẩy ra trước 2,5 cm: cong môi–cằm rõ khi nhìn nghiêng
    return bm


def build_head(coll, M):
    bm = head_cage(); cage_copy = bm.copy()
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.x < -1e-5], context='VERTS')
    for v in bm.verts:
        if abs(v.co.x) < 1e-5: v.co.x = 0.0
    ob = new_obj('Head_Base', bm, coll, M['da'])
    mi = ob.modifiers.new('Mirror', 'MIRROR'); mi.use_axis = (True, False, False); mi.use_clip = True; mi.use_mirror_merge = True
    subsurf(ob, 2, 2)
    return ob, cage_copy


class Surf:
    """Dò mặt da đầu đã Mirror + Subsurf (tia bắn từ ngoài vào tâm)."""
    def __init__(self, ob):
        self.bvh = BVHTree.FromObject(ob, bpy.context.evaluated_depsgraph_get())

    def at(self, az, el, off=0.0):
        a, e = math.radians(az), math.radians(el)
        d = Vector((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e)))
        hit = self.bvh.ray_cast(C + d * 1.5, -d)
        n = hit[1].normalized() if hit[1].dot(d) > 0 else -hit[1].normalized()
        return hit[0] + n * off, n

    def front(self, x, z, off=0.0):
        hit = self.bvh.ray_cast(Vector((x, -1.5, z)), Vector((0, 1, 0)))
        n = hit[1].normalized(); n = n if n.y < 0 else -n
        return hit[0] + n * off, n


def frame(n, blend_front=0.5):
    """Hệ trục cục bộ: −Y cục bộ = hướng nhìn ra (pha giữa pháp tuyến và −Y thế giới), Z = lên."""
    f = (n * (1 - blend_front) + Vector((0, -1, 0)) * blend_front).normalized(); Y = -f
    Z = (Vector((0, 0, 1)) - Y * Y.z).normalized(); X = Y.cross(Z)
    return Matrix((X, Y, Z)).transposed()


def place(ob, loc, R3, scale=(1, 1, 1)):
    ob.matrix_world = Matrix.Translation(loc) @ R3.to_4x4() @ Matrix.Diagonal((*scale, 1.0))


def uv_sphere(name, coll, m, seg=(40, 24)):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=seg[0], v_segments=seg[1], radius=1.0)
    return new_obj(name, bm, coll, m)


# ------------------------------------------------------------------ dải quét (mày, lọn tóc giọt nước)
def sweep(name, coll, pts, wfun, tfun, nref, m, nseg=36, nring=20):
    """Quét tiết diện elip dọc đường Catmull–Rom qua `pts`; bề rộng w(t), bề dày t(t) theo pháp tuyến nref(c) (mảng dẹt ôm mặt)."""
    P = [Vector(p) for p in pts]; curve = []
    for k in range(nseg + 1):
        t = k / nseg * (len(P) - 1); i = min(int(t), len(P) - 2); f = t - i
        p0, p1, p2, p3 = P[max(i - 1, 0)], P[i], P[i + 1], P[min(i + 2, len(P) - 1)]
        curve.append(0.5 * ((2 * p1) + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (-p0 + 3 * p1 - 3 * p2 + p3) * f ** 3))
    bm = bmesh.new(); rings = []
    for k, c in enumerate(curve):
        T = (curve[min(k + 1, nseg)] - curve[max(k - 1, 0)]).normalized(); N = nref(c); N = (N - T * N.dot(T)).normalized(); B = T.cross(N)
        u = k / nseg; W, Th = wfun(u), tfun(u)
        rings.append([bm.verts.new(c + B * math.cos(2 * math.pi * j / nring) * W + N * math.sin(2 * math.pi * j / nring) * Th) for j in range(nring)])
    for a, b in zip(rings, rings[1:]):
        for j in range(nring): bm.faces.new((a[j], a[(j + 1) % nring], b[(j + 1) % nring], b[j]))
    for ring, rev in ((rings[0], True), (rings[-1], False)):
        cv = bm.verts.new(sum((v.co for v in ring), Vector()) / nring)
        for j in range(nring):
            q = (cv, ring[(j + 1) % nring], ring[j]) if rev else (cv, ring[j], ring[(j + 1) % nring]); bm.faces.new(q)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    return new_obj(name, bm, coll, m)


def drop_w(wmax, tip=0.18, root=0.55):
    """Giọt nước: gốc vừa, thân đầy, ngọn bo tròn (không nhọn hoắt)."""
    return lambda u: wmax * (root + (1 - root) * math.sin(math.pi * min(1.0, u * 1.25)) ** 0.6 if u < 0.4 else 1.0) * (1 if u < 0.62 else max(tip, math.sqrt(max(0.0, 1 - ((u - 0.62) / 0.38) ** 2))))


# ------------------------------------------------------------------ mặt
def build_face(coll, M, head):
    S = Surf(head); parts = {}
    TH = math.acos(0.2)                      # mí trên che 40% chiều cao nhãn cầu: (1 − cos θ)/2 = 0,40
    EYE = (0.049 * 1.2, 0.026 * 1.2, 0.045 * 1.2)              # nửa rộng, nửa sâu, nửa cao nhãn cầu
    for s, k in ((1, 'L'), (-1, 'R')):
        p, n = S.front(s * 0.094, C.z); R3 = frame(n, 0.55); X, Y, Z = R3.col[0], R3.col[1], R3.col[2]
        ce = p + Y * (EYE[1] * 0.35)             # nhãn cầu nhô nửa trên mặt, không khoét hốc sâu
        eb = uv_sphere(f'Eyeball.{k}', coll, M['trang'], (48, 32)); place(eb, ce, R3, EYE)
        # con ngươi: đĩa cong nhỏ sát mặt nhãn cầu, ngay dưới mép mí (mép mí che phần trên con ngươi)
        hz = EYE[2] * 0.12; yz = EYE[1] * math.sqrt(max(0.0, 1 - (hz / EYE[2]) ** 2))
        pu = uv_sphere(f'Pupil.{k}', coll, M['muc'], (24, 14)); place(pu, ce - Y * (yz * 0.985) + Z * hz - X * s * 0.004, R3, (0.0115 * 1.2, 0.0035 * 1.2, 0.0125 * 1.2))
        bpy.context.view_layer.update(); pu.parent = eb; pu.matrix_parent_inverse = eb.matrix_world.inverted()
        # mí trên: dải chỏm elip ôm nhãn cầu từ đỉnh xuống θ (Solidify + Subsurf); hàng cuối là mép mí đậm
        bm = bmesh.new(); nu, nv = 48, 12; rows = []
        sx, sy, sz = EYE[0] * 1.07, EYE[1] * 1.30, EYE[2] * 1.07
        for j in range(nv + 1):
            th = 0.02 + (TH - 0.02) * j / nv
            rows.append([bm.verts.new(ce + X * (math.sin(th) * math.sin(2 * math.pi * i / nu) * sx) + Z * (math.cos(th) * sz) - Y * (math.sin(th) * math.cos(2 * math.pi * i / nu) * sy)) for i in range(nu)])
        for j, (a, b) in enumerate(zip(rows, rows[1:])):
            for i in range(nu):
                f = bm.faces.new((a[i], a[(i + 1) % nu], b[(i + 1) % nu], b[i])); f.material_index = 1 if j >= nv - 2 else 0
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
        lid = new_obj(f'Eyelid.{k}', bm, coll, [M['da'], M['muc']])
        so = lid.modifiers.new('Solidify', 'SOLIDIFY'); so.thickness = 0.003; so.offset = 1.0; subsurf(lid, 1, 1)
        # đường viền dưới mắt mảnh (mẫu có nét đậm quanh mắt)
        bm = bmesh.new(); nu, nr, tr = 64, 8, 0.0022; ring = []
        for i in range(nu):
            a = 2 * math.pi * i / nu; c = ce + X * (math.sin(a) * EYE[0] * 1.02) + Z * (math.cos(a) * EYE[2] * 1.02) - Y * (EYE[1] * 0.15)
            rad = (X * math.sin(a) + Z * math.cos(a)).normalized()
            ring.append([bm.verts.new(c + rad * math.cos(2 * math.pi * j / nr) * tr - Y * math.sin(2 * math.pi * j / nr) * tr) for j in range(nr)])
        for i in range(nu):
            a, b = ring[i], ring[(i + 1) % nu]
            for j in range(nr): bm.faces.new((a[j], a[(j + 1) % nr], b[(j + 1) % nr], b[j]))
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:]); new_obj(f'Eyeline.{k}', bm, coll, M['muc'])
        # mày: giọt nước dẹt cong ôm trán, dày, đầu trong to, hai đầu bo tròn
        pts = [S.front(s * x, z, 0.004)[0] for x, z in ((0.032, C.z + 0.084), (0.094, C.z + 0.096), (0.152, C.z + 0.082))]
        sweep(f'Eyebrow.{k}', coll, pts, lambda u: 0.0145 * (1 - 0.35 * u) * math.sin(math.pi * (0.03 + 0.94 * u)) ** 0.35,
              lambda u: 0.0080 * (1 - 0.3 * u) * math.sin(math.pi * (0.03 + 0.94 * u)) ** 0.35, lambda c: (c - C).normalized(), M['toc'], 32, 16)
        parts[k] = (eb, ce, R3)
    # nốt ruồi
    p, n = S.front(MOLE_SIDE * 0.140, C.z + 0.120, 0.001); mo = uv_sphere('Mole', coll, M['muc'], (16, 10)); place(mo, p, frame(n, 0), (0.0068, 0.0028, 0.0068))
    # mũi: khối bầu tròn nhỏ nhô nhẹ
    p, n = S.front(0.0, C.z - 0.068); no = uv_sphere('Nose', coll, M['da'], (32, 20)); place(no, p - n * 0.011, frame(n, 0.7), (0.035, 0.030, 0.031)); subsurf(no, 1, 1)
    # miệng: khoét hốc (Boolean) + khoang tối + răng trên + lưỡi + viền môi cực mảnh màu da
    p, n = S.front(0.0, C.z - 0.135); R3 = frame(n, 0.8); X, Y, Z = R3.col[0], R3.col[1], R3.col[2]
    cut = uv_sphere('Mouth_Cutter', coll, None, (24, 16)); place(cut, p, R3, (0.021, 0.026, 0.021)); cut.display_type = 'WIRE'; cut.hide_render = True
    cav = uv_sphere('Mouth_Cavity', coll, M['khoang'], (24, 16)); place(cav, p + Y * 0.014, R3, (0.024, 0.019, 0.023))
    te = uv_sphere('Teeth', coll, M['rang'], (20, 10)); place(te, p + Y * 0.005 + Z * 0.0135, R3, (0.0145, 0.005, 0.0045))
    tg = uv_sphere('Tongue', coll, M['luoi'], (20, 12)); place(tg, p + Y * 0.008 - Z * 0.011, R3, (0.0145, 0.0075, 0.007))
    bm = bmesh.new(); nu, nr, tr = 48, 8, 0.0012; ring = []
    for i in range(nu):
        a = 2 * math.pi * i / nu; c = p + X * (math.sin(a) * 0.021) + Z * (math.cos(a) * 0.021) + Y * 0.0008
        rad = (X * math.sin(a) + Z * math.cos(a)).normalized()
        ring.append([bm.verts.new(c + rad * math.cos(2 * math.pi * j / nr) * tr - Y * math.sin(2 * math.pi * j / nr) * tr) for j in range(nr)])
    for i in range(nu):
        a, b = ring[i], ring[(i + 1) % nu]
        for j in range(nr): bm.faces.new((a[j], a[(j + 1) % nr], b[(j + 1) % nr], b[j]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:]); new_obj('Lip', bm, coll, M['da'])
    bo = head.modifiers.new('Mouth', 'BOOLEAN'); bo.operation = 'DIFFERENCE'; bo.object = cut; bo.solver = 'EXACT'
    # tai: vành to tròn, hốc nông bên trong, vểnh nhẹ
    for s, k in ((1, 'L'), (-1, 'R')):
        p, n = S.at(s * 90, -10)
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=32, v_segments=24, radius=1.0)
        for v in bm.verts:   # mặt ngoài (x > 0) lõm vào thành hốc nông
            r2 = v.co.y ** 2 + v.co.z ** 2
            if v.co.x > 0 and r2 < 0.62: v.co.x -= 1.15 * (1 - r2 / 0.62) * v.co.x
        ear = new_obj(f'Ear.{k}', bm, coll, M['da'])
        R3 = Matrix.Rotation(s * math.radians(-28), 3, 'Z') @ Matrix(((s, 0, 0), (0, 1, 0), (0, 0, 1))) @ Matrix.Rotation(math.radians(8), 3, 'Y')
        place(ear, Vector((p.x + s * 0.010, 0.02, p.z)), R3, (0.030, 0.052, 0.068)); subsurf(ear, 1, 2)
    return S


# ------------------------------------------------------------------ tóc
def hairline_el(az):
    """Độ cao chân tóc (độ) theo phương vị (0 = trước): trán cao, trên tai, sau gáy phủ thấp sát cổ."""
    a = abs(az)
    if a < 40: return 34
    if a < 70: return 34 - 22 * smooth01(40, 70, a)
    if a < 112: return 12
    if a < 150: return 12 - 62 * smooth01(112, 150, a)
    return -50


def build_hair(coll, M, cage, S):
    # mũ tóc: nhân bản lồng sọ, chỉ giữ phần trên chân tóc, nở 1,02×, Solidify ra ngoài
    bm = cage
    kill = []
    for f in bm.faces:
        c = f.calc_center_median() - C; az = math.degrees(math.atan2(c.x, -c.y)); el = math.degrees(math.asin(max(-1, min(1, c.z / c.length))))
        if el < hairline_el(az): kill.append(f)
    bmesh.ops.delete(bm, geom=kill, context='FACES')
    for v in bm.verts:   # nở 1,02× + phồng thêm ở đỉnh và sau đầu cho khối tóc đầy
        d = v.co - C; up = max(0.0, d.z / HEAD[2]); back = max(0.0, d.y / HEAD[1])
        v.co = C + Vector((d.x * (1.02 + 0.06 * up), d.y * (1.02 + 0.07 * up + 0.10 * back), d.z * (1.02 + 0.10 * up)))
    cap = new_obj('Hair_Cap', bm, coll, M['toc'])
    so = cap.modifiers.new('Solidify', 'SOLIDIFY'); so.thickness = 0.022; so.offset = 1.0; so.use_rim = True
    subsurf(cap, 2, 2)
    nref = lambda c: (c - C).normalized()
    def lobe(name, path, W, off=(0.012, 0.042, 0.030)):
        pts = [S.at(az, el, o)[0] for (az, el), o in zip(path, off)]
        return sweep(name, coll, pts, drop_w(W), lambda u, W=W: drop_w(W)(u) * 0.5, nref, M['toc'], 40, 24)
    # mái: lọn giọt nước dẹt, gốc chìm vào mũ tóc, thân đầy, ngọn bo tròn, uốn chéo sang phải màn hình (+X)
    lobe('Hair_Lobe.1', [(-38, 64), (-8, 46), (16, 30)], 0.066)
    lobe('Hair_Lobe.2', [(-12, 68), (14, 48), (36, 32)], 0.064)
    lobe('Hair_Lobe.3', [(14, 66), (38, 48), (56, 34)], 0.060)
    lobe('Hair_Lobe.4', [(-62, 60), (-52, 48), (-38, 39)], 0.054)
    lobe('Hair_Lobe.5', [(42, 62), (62, 46), (76, 34)], 0.056)
    for s, k in ((1, 'L'), (-1, 'R')):   # cánh tóc thái dương vểnh nhẹ ra ngoài
        lobe(f'Hair_Wing.{k}', [(s * 72, 48), (s * 90, 32), (s * 100, 22)], 0.052, (0.014, 0.042, 0.050))
    # chỏm xoắn: Bézier + Bevel, giữa phình to, uốn cong vòng về trước, ngọn tròn dày
    top, _ = S.at(0, 88, 0.0)
    pts = [top + Vector(v) for v in ((0, 0.012, -0.01), (0.004, 0.008, 0.045), (0.020, -0.012, 0.080), (0.050, -0.036, 0.086), (0.070, -0.054, 0.064))]
    rad = [1.0, 1.25, 1.15, 0.95, 0.80]
    cu = bpy.data.curves.new('Hair_Tuft', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.031; cu.bevel_resolution = 6; cu.use_fill_caps = True; cu.resolution_u = 16
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(len(pts) - 1)
    for bp, p, r in zip(sp.bezier_points, pts, rad): bp.co = p; bp.radius = r; bp.handle_left_type = bp.handle_right_type = 'AUTO'
    tuft = bpy.data.objects.new('Hair_Tuft', cu); coll.objects.link(tuft); cu.materials.append(M['toc'])
    tip = uv_sphere('Hair_Tuft_Tip', coll, M['toc'], (24, 16)); place(tip, pts[-1], Matrix.Identity(3), (0.025, 0.025, 0.025))   # ngọn tròn dày, không nhọn


# ------------------------------------------------------------------ ánh sáng + camera trực giao
def studio(sc):
    w = bpy.data.worlds.new('studio'); sc.world = w; w.use_nodes = True
    bg = w.node_tree.nodes['Background']; bg.inputs['Color'].default_value = hexc('#f4ece6'); bg.inputs['Strength'].default_value = 0.6
    def area(name, loc, size, energy, col):
        d = bpy.data.lights.new(name, 'AREA'); d.size = size; d.energy = energy; d.color = hexc(col)[:3]
        o = bpy.data.objects.new(name, d); sc.collection.objects.link(o); o.location = loc
        o.rotation_euler = (C - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    area('Key', (-1.0, -1.6, 2.2), 1.4, 120, '#fff3e4')
    area('Fill', (1.4, -1.2, 1.4), 1.8, 45, '#eef2ff')
    area('Rim', (0.4, 1.6, 2.0), 1.0, 70, '#ffffff')
    cams = {}
    for name, loc, rot in (('Cam_Front', (0, -3, C.z + 0.04), (math.radians(90), 0, 0)), ('Cam_Right', (3, 0, C.z + 0.04), (math.radians(90), 0, math.radians(90)))):
        cd = bpy.data.cameras.new(name); cd.type = 'ORTHO'; cd.ortho_scale = 0.86
        o = bpy.data.objects.new(name, cd); sc.collection.objects.link(o); o.location = loc; o.rotation_euler = rot; cams[name] = o
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 32; sc.cycles.use_denoising = True; sc.view_settings.view_transform = 'AgX'; sc.view_settings.exposure = -0.5
    try:
        pr = bpy.context.preferences.addons['cycles'].preferences; pr.compute_device_type = 'OPTIX'; pr.refresh_devices()
        sc.cycles.device = 'GPU' if any(d.type == 'OPTIX' for d in pr.devices) else 'CPU'
    except Exception:
        sc.cycles.device = 'CPU'
    sc.render.resolution_x = sc.render.resolution_y = 900
    return cams


def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene; top = bpy.data.collections.new('Nam_Dau'); sc.collection.children.link(top)
    cf = bpy.data.collections.new('03_Head_And_Face'); ch = bpy.data.collections.new('04_Hair'); top.children.link(cf); top.children.link(ch)
    M = make_mats()
    head, cage = build_head(cf, M)
    S = build_face(cf, M, head)
    build_hair(ch, M, cage, S)
    return sc


if __name__ == '__main__':
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--render', default=''); ap.add_argument('--blend', default='')
    a = ap.parse_args(argv)
    sc = build(); cams = studio(sc)
    if a.blend: bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))
    if a.render:
        os.makedirs(a.render, exist_ok=True)
        for name, o in cams.items():
            sc.camera = o; sc.render.filepath = os.path.join(a.render, f'{name}.png'); bpy.ops.render.render(write_still=True)
