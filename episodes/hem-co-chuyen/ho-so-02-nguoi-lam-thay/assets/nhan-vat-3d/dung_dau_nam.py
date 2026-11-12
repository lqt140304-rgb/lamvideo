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
HEAD = (0.200, 0.198, 0.228)                       # nửa rộng (x), nửa sâu (y), nửa cao (z): sọ tròn đều, mặt không dẹt bè
# Khuôn hộp sọ trần của chủ repo (ảnh profile xám `../thiet-ke/thu-3d/mau-dau-tran-profile.webp`, mặt hướng trái): bán kính hình bóng nghiêng theo góc
# quanh tâm sọ, mỗi 5° bắt đầu từ hướng nhìn ra trước (−Y), ngược chiều kim đồng hồ (lên trên → sau gáy → cổ → cằm). Đơn vị mét (đỉnh sọ → đáy cằm = 0,435 m).
# Hộp sọ được kéo về đúng hình bóng này (warp_to_profile); mũ tóc nằm phía ngoài.
PROFILE_PX = [0.19282, 0.19348, 0.19414, 0.1948, 0.19447, 0.19414, 0.19447, 0.19414, 0.19414, 0.19512, 0.19512, 0.19578, 0.19644, 0.1971, 0.19743, 0.19809, 0.19842, 0.1994, 0.19973, 0.20072, 0.20171, 0.20368, 0.20368, 0.20368, 0.20467, 0.20533, 0.20598, 0.2073, 0.20598, 0.20598, 0.20598, 0.20598, 0.20631, 0.20631, 0.20631, 0.20664, 0.20631, 0.20664, 0.20697, 0.20697, 0.20697, 0.20664, 0.20664, 0.20631, 0.20631, 0.20631, 0.20664, 0.20697, 0.20796, 0.20829, 0.21487, 0.24255, 0.2379, 0.23518, 0.23428, 0.23518, 0.2379, 0.24255, 0.24932, 0.25699, 0.26719, 0.27607, 0.28068, 0.27969, 0.27311, 0.26258, 0.24843, 0.23, 0.20993, 0.19809, 0.19348, 0.19216]
PROFILE_M_PER_PX = 1.0                             # PROFILE_PX đã tính sẵn bằng mét
PROFILE_CENTER = (0.0, 1.2643)                      # (y, z) tâm sọ
HAIR_INSET = 0.0                                   # sọ trần: không thụt cho tóc
# Độ rộng sọ theo độ cao (z, nửa rộng) đo từ ảnh chính diện + sau lưng của khuôn (`mau-dau-tran-front/back`), tai đã được nội suy bỏ đi.
WIDTH_TAB = [[1.465, 0.0366], [1.4469, 0.0952], [1.4288, 0.1242], [1.4106, 0.1435], [1.3925, 0.1586], [1.3744, 0.1703], [1.3563, 0.1779], [1.3381, 0.1846], [1.32, 0.1892], [1.3019, 0.1911], [1.2838, 0.1914], [1.2656, 0.1888], [1.2475, 0.1884], [1.2294, 0.1873], [1.2113, 0.1859], [1.1931, 0.1842], [1.175, 0.1827], [1.1569, 0.1814], [1.1388, 0.1806], [1.1206, 0.1803], [1.1025, 0.1582], [1.0844, 0.1476], [1.0663, 0.131], [1.0481, 0.1069], [1.03, 0.1069]]
MOLE_SIDE = -1   # nốt ruồi theo ảnh mẫu: đuôi mày PHẢI nhân vật (−X, bên TRÁI ảnh chính diện). Đổi thành +1 nếu muốn đuôi mày trái.

COL = {'da': '#d57d4a', 'toc': '#121110', 'trang': '#f3efe7', 'muc': '#1c1a19', 'khoang_mieng': '#4a1c1a', 'luoi': '#c2675f', 'rang': '#f4efe6'}


def hexc(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4) for x in c) + (1.0,)


def mat(name, col, rough, sss=0.0, spec=None, sss_radius=(0.9, 0.35, 0.2)):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = hexc(col); b.inputs['Roughness'].default_value = rough
    if spec is not None: b.inputs['Specular IOR Level'].default_value = spec
    if sss:
        b.inputs['Subsurface Weight'].default_value = sss; b.inputs['Subsurface Radius'].default_value = sss_radius; b.inputs['Subsurface Scale'].default_value = 0.01   # Blender 5: màu tán xạ = Base Color (không còn Subsurface Color)
    return m


def make_mats():
    return {'da': mat('Da', COL['da'], 0.65, 0.08, sss_radius=(0.1, 0.05, 0.03)), 'toc': mat('Toc', COL['toc'], 0.90, spec=0.15), 'trang': mat('Mat_Trang', COL['trang'], 0.3),
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
def warp_to_profile(bm, iters=3):
    """Kéo hình bóng nghiêng của hộp sọ về đúng viền mẫu: theo từng góc quanh tâm viền, nhân (y, z) với R_mẫu / R_hiện_tại (nội suy mượt giữa các góc).
    R_hiện_tại đo bằng hàm đỡ max(r·cos Δ) (không phụ thuộc đỉnh nào rơi vào góc nào); lặp vài lượt cho hội tụ."""
    ys, zs = PROFILE_CENTER; N = len(PROFILE_PX); two = 2 * math.pi
    def ang(v): return math.atan2(v.co.z - zs, -(v.co.y - ys)) % two
    def inset_w(deg):
        d = deg % 360
        if 20 <= d <= 200: return 1.0
        if 200 < d < 250: return 1.0 - smooth01(200, 250, d)
        if d <= 20: return smooth01(-10, 20, d)
        if d > 340: return smooth01(-10, 20, d - 360)
        return 0.0
    tar = [(PROFILE_PX[k] * PROFILE_M_PER_PX - HAIR_INSET * inset_w(k * 360 / N)) * 1.025 for k in range(N)]   # ×1,025: bù phần co của Subsurf trên lồng điều khiển
    for _ in range(iters):
        # bán kính hiện tại theo góc: nội suy tuyến tính giữa các đỉnh nằm trên lát cắt giữa (x = 0), sắp theo góc (hình lõm như cằm nhô vẫn đúng)
        pts = sorted((ang(v), math.hypot(v.co.y - ys, v.co.z - zs)) for v in bm.verts if abs(v.co.x) < 1e-6)
        pts = [(a - two, r) for a, r in pts[-1:]] + pts + [(a + two, r) for a, r in pts[:1]]
        cur = []; j = 0
        for k in range(N):
            ph = k * two / N
            while pts[j + 1][0] < ph: j += 1
            (a0, r0), (a1, r1) = pts[j], pts[j + 1]; cur.append(r0 + (r1 - r0) * (ph - a0) / max(1e-9, a1 - a0))
        f = [tar[k] / cur[k] for k in range(N)]
        for _ in range(2):   # làm mượt hệ số kéo (±2 góc) để không sinh gờ/nếp trên mặt sọ
            w = (1, 2, 3, 2, 1); f = [sum(w[j + 2] * f[(k + j) % N] for j in range(-2, 3)) / 9 for k in range(N)]
        for v in bm.verts:
            a = ang(v) / two * N - 0.5; k0 = int(math.floor(a)) % N; k1 = (k0 + 1) % N; t = a - math.floor(a)
            fac = f[k0] * (1 - t) + f[k1] * t
            v.co.y = ys + (v.co.y - ys) * fac; v.co.z = zs + (v.co.z - zs) * fac


def warp_width(bm, iters=3):
    """Kéo độ rộng sọ về đúng hình bóng chính diện/sau lưng của khuôn: theo từng độ cao nhân x với (nửa rộng mẫu / nửa rộng hiện tại)."""
    zs = [t[0] for t in WIDTH_TAB]; ws = [t[1] for t in WIDTH_TAB]
    def interp(tab_z, tab_v, z):                       # tab_z giảm dần
        if z >= tab_z[0]: return tab_v[0]
        if z <= tab_z[-1]: return tab_v[-1]
        for i in range(len(tab_z) - 1):
            if tab_z[i] >= z >= tab_z[i + 1]:
                t = (tab_z[i] - z) / (tab_z[i] - tab_z[i + 1]); return tab_v[i] + (tab_v[i + 1] - tab_v[i]) * t
    for _ in range(iters):
        cur = []
        for z0 in zs:
            xs = [abs(v.co.x) for v in bm.verts if abs(v.co.z - z0) < 0.016]
            cur.append(max(xs) if xs else None)
        for i in range(len(cur)):                      # bin trống: nội suy từ lân cận
            if cur[i] is None:
                a = next((cur[j] for j in range(i - 1, -1, -1) if cur[j] is not None), None); b = next((cur[j] for j in range(i + 1, len(cur)) if cur[j] is not None), None)
                cur[i] = a if b is None else (b if a is None else (a + b) / 2)
        f = [ws[i] / max(1e-6, cur[i]) for i in range(len(zs))]
        f = [(f[max(i - 1, 0)] + 2 * f[i] + f[min(i + 1, len(f) - 1)]) / 4 for i in range(len(f))]
        for v in bm.verts: v.co.x *= interp(zs, f, v.co.z)


def head_cage():
    """Lồng điều khiển đầu: cube chia 16 đoạn/cạnh (có vòng cạnh giữa x = 0 cho Mirror) → bo về cầu 78% → má phính, cằm ngắn bầu tròn."""
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=2.0)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=15, use_grid_fill=True)   # 16×16 mỗi mặt: đủ đỉnh để hình bóng chính diện/sau tròn, không nhọn như lều
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    for v in bm.verts:
        p = v.co.copy(); s = p.normalized(); p = p.lerp(s, 0.97)                                    # gần như cầu hoàn toàn: sọ tròn trơn như khuôn, không còn mặt phẳng kiểu hộp
        u, w, h = p.x, p.y, p.z                                              # w < 0 là mặt trước
        front = smooth01(0.1, -0.7, w)
        cheek = math.exp(-((h + 0.38) / 0.32) ** 2) * (0.35 + 0.65 * front)  # má phính ở nửa dưới
        p.x *= 1.0 + 0.03 * cheek                                            # má phính nhẹ, nối liền thái dương thành oval mềm
        low = smooth01(-0.35, -0.95, h)                                      # cằm ngắn, bầu tròn, hơi đưa ra trước
        # đáy cằm: không thu hẹp, bo chữ U đầy
        p.y -= 0.05 * low * front
        p.y -= 0.11 * front * smooth01(0.05, 0.65, h) * (1.0 - smooth01(0.75, 1.0, h))   # trán đứng hơn: phần mặt trên đẩy ra trước, đỉnh cao nhất ở giữa
        if h < -0.62: p.z = -0.62 + (h + 0.62) * (0.88 - 0.50 * smooth01(0.05, 0.6, w))   # đáy hàm phẳng dần về phía cổ; cằm trước vẫn bầu chữ U
        p.y *= 1.0 - 0.06 * front * smooth01(-0.2, 0.6, h)                   # trán–mặt hơi phẳng phía trước, không hốc mắt sâu
        p.y *= 1.0 - 0.145 * smooth01(0.0, 0.7, w)                           # sau gáy thu ~9% bề sâu (so với viền mẫu), sọ sau vẫn là cầu tròn
        vong = math.exp(-((h + 0.45) / 0.33) ** 2) * front                    # nửa dưới mặt (dưới mắt → cằm) vồng tròn ra trước
        shear = -0.030 * smooth01(0.0, -1.0, h) ** 1.4                       # trục quả xoài: cằm vươn trước 3,0 cm (tổng cụm cằm ~5,6 cm)
        v.co = Vector((p.x * HEAD[0], p.y * HEAD[1] - 0.010 * low * front - 0.016 * vong + shear, p.z * HEAD[2])) + C   # + cụm môi–mũi–cằm vồng ra trước, cằm U
    warp_to_profile(bm)
    warp_width(bm)
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
    p, n = S.front(0.0, C.z - 0.068); no = uv_sphere('Nose', coll, M['da'], (32, 20)); place(no, p + n * 0.017, frame(n, 0.7), (0.038, 0.036, 0.037))   # nhô hẳn khỏi mặt: tiến ra trước ~2,8 cm so với bản cũ, bán kính 1,1×; subsurf(no, 1, 1)
    # miệng: khoét hốc (Boolean) + khoang tối + răng trên + lưỡi + viền môi cực mảnh màu da
    p, n = S.front(0.0, C.z - 0.142); p = p + n * 0.002; R3 = frame(n, 0.8); X, Y, Z = R3.col[0], R3.col[1], R3.col[2]   # miệng nằm trên phần nhô ra trước của môi
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
    for v in bm.verts:   # nở 1,02× + phồng thêm ở đỉnh cho khối tóc đầy
        d = v.co - C; up = max(0.0, d.z / HEAD[2]); back = max(0.0, d.y / HEAD[1])
        v.co = C + Vector((d.x * (1.02 + 0.06 * up), d.y * (1.02 + 0.03 * up), d.z * (1.02 + 0.10 * up)))   # không nở thêm phía sau gáy
    cap = new_obj('Hair_Cap', bm, coll, M['toc'])
    so = cap.modifiers.new('Solidify', 'SOLIDIFY'); so.thickness = 0.022; so.offset = 1.0; so.use_rim = True
    subsurf(cap, 2, 2)
    nref = lambda c: (c - C).normalized()
    def lobe(name, path, W, off=None):
        off = off or ((0.010, 0.024, 0.020, 0.012) if len(path) == 4 else (0.012, 0.042, 0.030))   # bám sát độ cong trán, không dựng như răng lược
        pts = [S.at(az, el, o)[0] for (az, el), o in zip(path, off)]
        return sweep(name, coll, pts, drop_w(W), lambda u, W=W: drop_w(W)(u) * 0.5, nref, M['toc'], 40, 24)
    # mái: lọn giọt nước dẹt, gốc chìm vào mũ tóc, thân đầy, ngọn bo tròn, uốn chéo sang phải màn hình (+X)
    lobe('Hair_Lobe.1', [(-36, 70), (-16, 56), (4, 44), (20, 34)], 0.072)
    lobe('Hair_Lobe.2', [(-10, 72), (10, 58), (28, 46), (42, 36)], 0.070)
    lobe('Hair_Lobe.3', [(16, 70), (36, 58), (52, 46), (64, 37)], 0.064)
    lobe('Hair_Lobe.4', [(-64, 66), (-58, 55), (-50, 47), (-44, 42)], 0.056)   # chừa khoảng trán lộ nốt ruồi
    lobe('Hair_Lobe.5', [(44, 68), (62, 56), (76, 46), (86, 38)], 0.058)
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
    for name, loc, rot in (('Cam_Front', (0, -3, C.z + 0.04), (math.radians(90), 0, 0)), ('Cam_Right', (3, 0, C.z + 0.04), (math.radians(90), 0, math.radians(90))),
                           ('Cam_34', (2.12, -2.12, C.z + 0.04), (math.radians(90), 0, math.radians(45))),
                           ('Cam_Back', (0, 3, C.z + 0.04), (math.radians(90), 0, math.radians(180))),
                           ('Cam_14sau', (2.12, 2.12, C.z + 0.04), (math.radians(90), 0, math.radians(135)))):
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


def fuse_neck(head, neck):
    """Hợp nhất cổ vào hộp sọ thành MỘT bề mặt liền: Boolean union → Remesh voxel (lưới đều) → Smooth làm tròn chỗ lõm hàm–cổ thành đường cong liền.
    Thứ tự: Mirror, Subsurf, [Union, Remesh, Smooth], Mouth (khoét miệng vẫn ở cuối)."""
    bo = head.modifiers.new('Neck_Union', 'BOOLEAN'); bo.operation = 'UNION'; bo.object = neck; bo.solver = 'EXACT'
    rm = head.modifiers.new('Neck_Remesh', 'REMESH'); rm.mode = 'VOXEL'; rm.voxel_size = 0.0035; rm.use_smooth_shade = True
    sm = head.modifiers.new('Neck_Smooth', 'SMOOTH'); sm.factor = 0.6; sm.iterations = 14
    n = len(head.modifiers); names = [m.name for m in head.modifiers]
    if 'Mouth' in names: head.modifiers.move(names.index('Mouth'), n - 1)
    neck.hide_render = True; neck.hide_viewport = True


def build_neck(coll, M):
    """Trụ cổ theo khuôn: dày 15,8 cm theo chiều sâu, rộng ~13 cm, đi thẳng xuống từ sau hàm. Đầu trên chìm trong hộp sọ."""
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=40, radius1=1.0, radius2=1.0, depth=1.0)
    for v in bm.verts: v.co = Vector((v.co.x * 0.078, v.co.y * 0.079 - 0.006, 1.02 + v.co.z * 0.34))
    ob = new_obj('Neck', bm, coll, M['da'])
    bv = ob.modifiers.new('Bevel', 'BEVEL'); bv.width = 0.02; bv.segments = 4; bv.limit_method = 'ANGLE'
    return ob


def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene; top = bpy.data.collections.new('Nam_Dau'); sc.collection.children.link(top)
    cf = bpy.data.collections.new('03_Head_And_Face'); ch = bpy.data.collections.new('04_Hair'); top.children.link(cf); top.children.link(ch)
    M = make_mats()
    head, cage = build_head(cf, M)
    S = build_face(cf, M, head)
    build_hair(ch, M, cage, S)
    neck = build_neck(cf, M); fuse_neck(head, neck)
    return sc


if __name__ == '__main__':
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--render', default=''); ap.add_argument('--blend', default=''); ap.add_argument('--no-hair', action='store_true', help='ẩn collection 04_Hair để soi riêng hộp sọ')
    a = ap.parse_args(argv)
    sc = build(); cams = studio(sc)
    if a.no_hair:
        for c in bpy.data.collections['04_Hair'].objects: c.hide_render = True; c.hide_viewport = True
    if a.blend: bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))
    if a.render:
        os.makedirs(a.render, exist_ok=True)
        for name, o in cams.items():
            sc.camera = o; sc.render.filepath = os.path.join(a.render, f'{name}.png'); bpy.ops.render.render(write_still=True)
