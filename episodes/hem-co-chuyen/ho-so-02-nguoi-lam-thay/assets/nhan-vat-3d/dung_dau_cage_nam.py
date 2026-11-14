"""NAM — ĐẦU DỰNG LẠI BẰNG CONTROL CAGE (Hồ sơ 02). Kết quả và lệnh chạy: KET-QUA-DAU-CAGE.md.

Chạy:  D:/blender/blender.exe -b --factory-startup --python dung_dau_cage_nam.py -- [--check] [--render DIR] [--clip DIR] [--blend FILE] [--samples N] [--mau ẢNH]
Toạ độ cage = hệ đầu GỐC của dung_dau_nam.py (cằm 1,032, mặt −Y, trái nhân vật +X); cả cụm đầu phóng HEAD_K quanh cằm qua empty Cum_Dau như thân cage.

Trong file Blender
  00_Dau_Cu (ẩn render): collection 03_Head_And_Face cũ (Head_Base, Pupil, Eyeline, Eyebrow, Mole, Mouth_line, Ear) + Nam_Dau_Than_cu (bản đã duyệt 8a9d771).
  Nam_Dau/03_Dau_Cage: Nam_Dau_Cage (nửa cage, Mirror + Subdivision 1, shape key thử), Mat_Goc.L/R (empty tỉ lệ nhãn cầu), Nhan_Cau.L/R (nhãn cầu + con ngươi),
                       Eyebrow.L/R, Mole, Ear.L/R (bản sao tai cũ, dán vào đầu mới).
  Nam_Dau/04_Hair: tóc v4 giữ nguyên.
  02_Body_Base: Nam_Dau_Than (cage đầu + cage thân là MỘT lưới, Mirror + Subdivision 2, cùng shape key), Nam_Than_Cage, Nam_BanChan.L/R.
Chỉ là các phép thử biến dạng (shape key), chưa phải rig mặt.
"""
import sys, os, math, argparse, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import bpy, bmesh
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree
import dung_dau_nam as D
import dung_than_nam as T
import dung_than_cage_nam as B
import mat_theo_mau_nam as MT
import do_mau_nam as DM

K, ZCH, C0 = T.HEAD_K, T.ZCH, T.CHIN0
OLD_COLL, NEW_COLL = '00_Dau_Cu', '03_Dau_Cage'
def to_world(p): return Vector((p[0] * K, p[1] * K, ZCH + (p[2] - C0) * K))
def to_head(p): return Vector((p[0] / K, p[1] / K, (p[2] - ZCH) / K + C0))


# ================================================================== BẢNG CAGE (hệ đầu gốc, m)
# Mỗi vòng nửa đầu có 9 đỉnh (cột k = 0 giữa trước … 8 giữa sau, góc tham số superellipse `th`, độ).
# Vòng không ghi 'w' lấy đúng tiết diện đầu cũ (LOFT_TAB) ở độ cao của từng đỉnh, nhân sx (bề ngang), sf (nhô trước), sb (nhô sau): chỉnh rộng ở trước, chỉnh sâu ở nghiêng.
# Vòng ghi 'w' là superellipse tự do (w nửa ngang, f/b nhô trước/sau tính từ yc, n độ vuông). z = độ cao ở giữa trước, zb = ở giữa sau (vòng nghiêng theo đường hàm).
TH = [0, 9, 25, 45, 68, 95, 122, 152, 180]
RINGS = [
    dict(ten='dinh',       z=1.432, th=[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180]),
    dict(ten='so',         z=1.392, th=[0, 16, 35, 56, 79, 101, 126, 154, 180]),
    dict(ten='tran',       z=1.340),
    dict(ten='mi_tren',    z=1.281),
    dict(ten='mat',        z=1.227),
    dict(ten='duoi_mat',   z=1.173, zb=1.194),
    dict(ten='chan_mui',   z=1.147, zb=1.172, sx=1.02),
    dict(ten='mieng_tren', z=1.122, zb=1.150, sx=1.03),
    dict(ten='mieng',      z=1.099, zb=1.130, sx=1.04),
    dict(ten='mieng_duoi', z=1.076, zb=1.110, sx=1.00),
    dict(ten='cam',        z=1.052, zb=1.094, sx=1.08, sf=1.06),
    dict(ten='day_cam',    z=1.038, zb=1.066, w=0.090, yc=-0.046, f=0.128, b=0.128, n=2.0),
    dict(ten='duoi_ham',   z=1.030, zb=1.050, w=0.074, yc=-0.022, f=0.096, b=0.094, n=2.0),
]
OVERRIDE = {('mieng_duoi', 4): (-0.003, 0, 0), ('cam', 3): (-0.003, 0, 0), ('cam', 4): (-0.004, 0, 0.002)}          # (tên vòng, cột k) → (dx, dy, dz): chỉnh riêng một đỉnh của bảng
NECK_N0_K = 1.04       # vòng cổ trên (7 đỉnh) rộng hơn vòng cổ thân một chút, chuyển mềm vào hàm

# Mắt (hệ khung EYE_FRAMES của đầu cũ: u ngang, w dọc, h hướng ra khỏi mặt). Nhãn cầu là elip tròn xoay A × A × DD, đỉnh nhô APEX trước mặt phẳng tâm mắt.
EYE_A, EYE_DD, EYE_APEX = 0.060, 0.0192, 0.008       # cầu dẹt: ngang mặt phẳng mắt ở mép mắt (r 4,87 cm), phần còn lại chìm dưới da
# Chỉnh mắt theo ảnh mẫu (Task 4): es = tỉ lệ toàn bộ cụm mắt trong mặt phẳng khung (nhãn cầu, mí, hốc cùng tỉ lệ); du, dw = dịch (m, hệ thế giới) theo trục ngang/dọc của khung mắt; yaw = xoay khung mắt quanh trục dọc (độ), dương = mắt nhìn thẳng hơn (bớt bọc quanh mặt).
# Giá trị do tìm tối ưu trên hàm đo do_mau_nam (mat_*/khe_*) — xem GHI-CHU.md. es=1, du=dw=yaw=0 là đầu cage cũ.
EYE_TUNE = dict(es=1.11, du=0.0065, dw=0.015, yaw=9.0)
ES = EYE_TUNE['es']
# Chỉnh mũi / cằm / nốt ruồi theo ảnh mẫu (Task 5; đọc bằng do_mau_nam.goi_y_tu_cage): độ dịch (m, thế giới: x ngang, y sâu — dương ra sau, z lên) của các đỉnh mũi và đáy cằm; mole_dx = dịch nốt ruồi vào giữa mặt.
FACE_TUNE = dict(mui=(0.0, 0.0044, 0.0135), cam=(0.0, 0.0, -0.010), mole_dx=0.0065)
EYE_FLAT = 1.0         # mặt da quanh mắt của đầu cũ là yên ngựa (±8–13 mm trong r 5 cm): vòng biên mắt làm phẳng theo mặt phẳng khớp nhất; 0 = giữ nguyên yên ngựa
T_LID = 0.0035         # bề dày mí trên (mẫu: mí dày trùm; trước 0,0025)
W_LID = 0.0090         # độ cao đường mí trên so với tâm mắt (mẫu ≈ 8,6 mm; đầu cũ D.W_LID0 = 13,5 mm); chỉ cage này, không đổi đầu cũ
RO = 0.0487            # bán kính khe mắt phía dưới (mép tròng trắng)
PUPIL_DEG = 14.5       # nửa góc chỏm con ngươi trên nhãn cầu đơn vị
PUPIL_REST = (-0.004, -0.003)   # tâm con ngươi lúc nghỉ (u về phía mũi, w hơi thấp) như đầu cũ
# Miệng (khung MOUTH_FRAME: u ngang, w dọc, h ra ngoài)
CORNER_K = 0.75        # mặt trong mí + hốc ở hai cột sát khoé mắt xoay ít hơn (không kéo chéo qua nhãn cầu)
MOUTH_GAP = 0.0012     # khe môi lúc trung tính (khép, vẫn là khe thật)
# Shape key thử
JAW_PIVOT, JAW_DEG = (0.0, -0.010, 1.168), 10.0
SMILE = Vector((0.004, 0.003, 0.006))   # khoé miệng: ra ngoài, lùi sau, lên


# ================================================================== bề mặt tham chiếu
def loft_at(z):
    t = D.LOFT_TAB
    if z >= t[0][0]: return t[0][1], t[0][2], t[0][3]
    for a, b in zip(t, t[1:]):
        if a[0] >= z >= b[0]:
            u = (a[0] - z) / (a[0] - b[0]); return tuple(a[i] + (b[i] - a[i]) * u for i in (1, 2, 3))
    return t[-1][1], t[-1][2], t[-1][3]


def ring_pt(R, thd):
    th = math.radians(thd); c, s = math.cos(th), math.sin(th)
    z = R['z'] + (R.get('zb', R['z']) - R['z']) * (1 - c) / 2
    if 'w' in R:
        e = 2.0 / R['n']; x = R['w'] * abs(s) ** e
        y = R['yc'] - R['f'] * abs(c) ** e if c >= 0 else R['yc'] + R['b'] * abs(c) ** e
    else:
        yf, yb, w = loft_at(z); m, nf, nb = D.section_params(z, D.SECTION_MODE); ym = yf + m * (yb - yf)
        e = 2.0 / (nf if c >= 0 else nb); x = w * R.get('sx', 1.0) * abs(s) ** e
        y = ym - (ym - yf) * R.get('sf', 1.0) * abs(c) ** e if c >= 0 else ym + (yb - ym) * R.get('sb', 1.0) * abs(c) ** e
    return Vector((x, y, z))


def plain_loft_bvh():
    """BVH của mặt loft đầu cũ KHÔNG có gò mắt/rãnh miệng/mũi (mặt nền để đặt vòng mắt, miệng)."""
    sf, nb = D.shape_face, D.nose_bump
    D.shape_face = lambda bm: None; D.nose_bump = lambda bm: None
    try: bm = D.head_loft(M=96)
    finally: D.shape_face, D.nose_bump = sf, nb
    bvh = BVHTree.FromBMesh(bm); bm.free(); return bvh


def mesh_bvh(ob, local=True):
    dg = bpy.context.evaluated_depsgraph_get(); ev = ob.evaluated_get(dg); me = ev.to_mesh()
    mw = Matrix.Identity(4) if local else ev.matrix_world
    vs = [mw @ v.co for v in me.vertices]; ps = [tuple(p.vertices) for p in me.polygons]; mats = [p.material_index for p in me.polygons]
    ev.to_mesh_clear(); return BVHTree.FromPolygons(vs, ps), vs, ps, mats


def hit_along(bvh, origin, d):
    h = bvh.ray_cast(origin, d)
    return h[0]


# ================================================================== CAGE ĐẦU
class Cage:
    def __init__(self): self.bm = bmesh.new(); self.mid = self.bm.verts.layers.float.new('duong_giua'); self.design = {}; self.fit = set(); self.idx = {}

    def v(self, p, fit=False, mid=False, design=None):
        p = Vector(p)
        if mid: p.x = 0.0
        x = self.bm.verts.new(p); x[self.mid] = 1.0 if mid else 0.0
        if fit: self.fit.add(x); self.design[x] = (design if design is not None else p).copy()
        return x

    def f(self, vs, m=0): fc = self.bm.faces.new(vs); fc.material_index = m; return fc


EYE_FR = {}


def fit_eye_frame(S):
    """Khung mắt xoay theo mặt phẳng khớp nhất của da quanh vòng biên (hai vòng lặp); điền EYE_FR[±1] (bên phải là ảnh gương của bên trái, cùng quy ước D.EYE_FRAMES)."""
    p0, f, X, Z = (Vector(v) for v in D.EYE_FRAMES[1]); r = EYE_R0
    for _ in range(2):
        def h(u, w): hp = hit_along(S, p0 + X * u + Z * w + f * 0.15, -f); return (hp - p0).dot(f) if hp else 0.0
        a = (h(r, 0) - h(-r, 0)) / (2 * r); b = (h(0, r) - h(0, -r)) / (2 * r); c = sum(h(r * math.cos(t), r * math.sin(t)) for t in [i * math.pi / 4 for i in range(8)]) / 8
        f = (f - a * X - b * Z).normalized(); Z = (Z - f * Z.dot(f)).normalized(); X = (-f).cross(Z); p0 = p0 + f * c
    mir = lambda v: Vector((-v.x, v.y, v.z)); EYE_FR[1] = (p0, f, X, Z); EYE_FR[-1] = (mir(p0), mir(f), -mir(X), mir(Z))
    print(f'    khung mắt khớp mặt da: nghiêng thêm {math.degrees(math.acos(min(1.0, f.dot(Vector(D.EYE_FRAMES[1][1]))))):.1f}°')
    return EYE_FR[1]


def tune_eye_frame(p0, f, X, Z):
    """Áp EYE_TUNE lên khung mắt đã khớp da: xoay (X, f) quanh trục dọc thế giới, dịch tâm theo trục ngang/dọc của khung; cập nhật EYE_FR cho nhãn cầu và shape key."""
    R = Matrix.Rotation(math.radians(-EYE_TUNE['yaw']), 3, 'Z'); X2 = (R @ X).normalized(); f2 = (R @ f).normalized(); Z2 = (Z - f2 * Z.dot(f2)).normalized()
    p2 = p0 + (X2 * EYE_TUNE['du'] + Z2 * EYE_TUNE['dw']) / K
    mir = lambda v: Vector((-v.x, v.y, v.z)); EYE_FR[1] = (p2, f2, X2, Z2); EYE_FR[-1] = (mir(p2), mir(f2), -mir(X2), mir(Z2))
    return p2, f2, X2, Z2


def eyeball_h(u, w):
    r2 = (u * u + w * w) / EYE_A ** 2
    return EYE_APEX - EYE_DD + (EYE_DD * math.sqrt(1 - r2) if r2 < 1 else 0.0)


def lid_w(u): return W_LID + 0.004 * (u / D.EYE_R[0]) ** 2
def wline(u): return -0.003 * (u / 0.030) ** 2


def ear_bump(p):
    """Gò gốc tai của đầu cũ (shape_face): cage theo đúng mặt sọ cũ ở vùng này để tóc/tai không đổi."""
    if abs(p.x) <= 0.08: return p
    sg_ = 1.0 if p.x > 0 else -1.0; m = 0.014 * math.exp(-(((p.y - D.EAR_Y) / 0.070) ** 2 + ((p.z - D.EAR_Z) / 0.072) ** 2))
    return Vector((p.x + sg_ * m, p.y, p.z))


NOSE_DISP = {(4, 0): 0.008, (5, 0): 0.034, (6, 0): 0.021, (5, 1): 0.010, (6, 1): 0.008}   # mũi = chỗ nhô của chính lưới mặt (đỉnh mũi ở hàng 5), không thêm vòng riêng
EYE_MAP = [(4, 3), (3, 3), (3, 2), (3, 1), (4, 1), (5, 1), (5, 2), (5, 3)]              # j: E NE N NW W SW S SE — 8 đỉnh biên của ô 3×3, tâm (4,2) bỏ
MOUTH_MAP = [(7, 0), (7, 1), (7, 2), (8, 2), (9, 2), (9, 1), (9, 0)]                      # nửa vòng miệng: trên giữa … khoé … dưới giữa; (8,0),(8,1) bỏ
EYE_R0 = 0.052                                                                           # bán kính vòng biên mắt = vòng viền mắt thật
MOUTH_AB = (0.052, 0.024)


def build_head_cage(coll, mats, S_old, S_nen):
    cg = Cage(); bm = cg.bm; NR = len(RINGS)
    p0, fe, Xe, Ze = fit_eye_frame(S_nen)
    def ept0(u, w, h): return p0 + Xe * u + Ze * w + fe * h       # khung gốc (khớp mặt da đầu cũ): chỉ để tính độ dịch so với khung đã chỉnh
    p0, fe, Xe, Ze = tune_eye_frame(p0, fe, Xe, Ze)
    def ept(u, w, h): return p0 + Xe * (u * ES) + Ze * (w * ES) + fe * h
    def eface(u, w, bvh=S_nen):
        q = ept0(u, w, 0.15); hp = hit_along(bvh, q, -fe); return (1 - EYE_FLAT) * (hp - p0).dot(fe) if hp else 0.0
    hm = hit_along(S_nen, Vector((0, -1.5, D.FACE['mouth_z'])), Vector((0, 1, 0))); fm = Vector(D.MOUTH_FRAME['f']).normalized()
    Xm = Vector((1, 0, 0)); Zm = (Vector((0, 0, 1)) - fm * fm.z).normalized()
    def mpt(u, w, h): return hm + Xm * u + Zm * w + fm * h
    def mface(u, w): q = mpt(u, w, 0.15); hp = hit_along(S_nen, q, -fm); return (hp - hm).dot(fm) if hp else 0.0

    # --- lưới vòng × cột; vòng biên mắt và miệng đặt trên mặt nền (không gò), chi tiết mí/môi nằm ở các vòng trong
    holes = {(4, 2), (8, 0), (8, 1)}
    over = {}; over0 = {}
    for j, rk in enumerate(EYE_MAP):
        a = math.radians([0, 45, 90, 135, 180, 225, 270, 315][j]); u, w = EYE_R0 * math.cos(a), EYE_R0 * math.sin(a); over[rk] = ept(u, w, eface(u, w)); over0[rk] = ept0(u, w, eface(u, w))
    PHI = [90, 62, 35, 0, -35, -62, -90]
    for j, rk in enumerate(MOUTH_MAP):
        a = math.radians(PHI[j]); u = MOUTH_AB[0] * math.cos(a); w = MOUTH_AB[1] * math.sin(a) + wline(min(u, 0.032)); over[rk] = mpt(u, w, mface(u, w))
    G = [[None] * 9 for _ in range(NR)]
    for r, R in enumerate(RINGS):
        th = R.get('th', TH)
        for k in range(9):
            if (r, k) in holes: continue
            p = over.get((r, k))
            if p is None:
                p = ear_bump(ring_pt(R, th[k]))
                d = OVERRIDE.get((R['ten'], k))
                if d: p = p + Vector(d)
            if (r, k) in NOSE_DISP: p = p + Vector((0, -NOSE_DISP[(r, k)], 0))
            G[r][k] = cg.v(p, fit=r < NR - 1, mid=k in (0, 8))
    cg.idx['grid'] = G
    # --- kéo các đỉnh lưới lân cận theo độ dịch của vòng viền mắt (khung mắt đã chỉnh), ghim đường khâu và vòng miệng đứng yên
    mov = {rk: tuple(over[rk] - over0[rk]) for rk in over0}
    kk = 1.0 / K; ro = {}                                           # độ dịch tường minh (hệ đầu gốc) của mũi và đáy cằm
    for rk, f in (((5, 0), 1.0), ((6, 0), 1.0), ((5, 1), 1.0), ((6, 1), 1.0), ((4, 0), 0.5)): ro[rk] = Vector(FACE_TUNE['mui']) * kk * f
    for r in (10, 11, 12):
        for k, f in zip(range(5), (1.0, 1.0, 1.0, 0.8, 0.5)): ro[(r, k)] = Vector(FACE_TUNE['cam']) * kk * f
    mov.update({rk: tuple(d) for rk, d in ro.items()})
    pos = {(r, k): tuple(G[r][k].co) for r in range(NR) for k in range(9) if G[r][k] is not None}
    ghim = [(2, k) for k in range(6)] + [(r, 5) for r in range(3, 13)] + [(11, 5)] + [rk for rk in over if rk not in mov]
    tu_do = [(r, k) for r in MT.HANG_MAT for k in MT.COT_MAT if G[r][k] is not None and (r, k) not in over and (r, k) not in ro]
    dd = MT.shepard(pos, mov, ghim, tu_do); dd.update({rk: tuple(d) for rk, d in ro.items() if G[rk[0]][rk[1]] is not None})
    for rk, d in dd.items():
        v = G[rk[0]][rk[1]]; dv = Vector(d)
        if rk[1] == 0: dv.x = 0.0
        v.co += dv
        if v in cg.design: cg.design[v] += dv
    # --- nắp đỉnh: lưới 2×4 nửa (biên = vòng 'dinh')
    R0 = G[0]; Cc = Vector((0.0, 0.010, 1.25))
    bnd = {(0, 0): R0[0], (1, 0): R0[1], (2, 0): R0[2], (2, 1): R0[3], (2, 2): R0[4], (2, 3): R0[5], (2, 4): R0[6], (1, 4): R0[7], (0, 4): R0[8]}
    cap = dict(bnd)
    for i in (0, 1):
        for j in (1, 2, 3):
            t = j / 4; s = i / 2
            q = Vector((s * bnd[(2, j)].co.x, (1 - t) * bnd[(i, 0)].co.y + t * bnd[(i, 4)].co.y, 1.47))
            d = (q - Cc).normalized(); hp = hit_along(S_old, Cc + d * 0.6, -d)
            cap[(i, j)] = cg.v(hp if hp else q, fit=True, mid=i == 0)
    for i in (0, 1):
        for j in range(4): cg.f((cap[(i, j)], cap[(i + 1, j)], cap[(i + 1, j + 1)], cap[(i, j + 1)]))
    # --- ô lưới thường (trừ ô trong khối mắt và khối miệng)
    skip = {(3, 1), (3, 2), (4, 1), (4, 2), (7, 0), (7, 1), (8, 0), (8, 1)}
    for r in range(NR - 1):
        for k in range(8):
            if (r, k) not in skip: cg.f((G[r][k], G[r][k + 1], G[r + 1][k + 1], G[r + 1][k]))

    # --- MẮT: vòng viền mắt (ngoài, mực) → vành mí → vòm mí → nét mí → khe mắt → mặt trong mí → hốc ôm nhãn cầu → đáy hốc (kín)
    c0 = math.degrees(math.asin(W_LID / RO)); AM = [c0, None, None, None, 180 - c0, 217, 270, 323]; ANG = [0, 45, 90, 135, 180, 225, 270, 315]
    def circ(r, a): a = math.radians(a); return r * math.cos(a), r * math.sin(a)
    up_u = [0.034, 0.0, -0.034]
    def loop(spec): return [cg.v(ept(*s_)) for s_ in spec]
    def ring_spec(r, angs, hfun):
        out = []
        for a in angs: u, w = circ(r, a); out.append((u, w, hfun(u, w)))
        return out
    L = [[G[r][k] for r, k in EYE_MAP]]
    angs3 = [AM[j] if AM[j] is not None else [0, 48, 90, 132][j] for j in range(8)]
    L.append(loop(ring_spec(0.0505, angs3, lambda u, w: max(eyeball_h(u, w) + T_LID, eface(u, w) + 0.003))))   # L1 vành mí
    def lid_loop(r_low, off_low, up_w, up_h, r_corner=None):
        spec = []
        for j in range(8):
            if j in (1, 2, 3):
                u = [0.036, 0.0, -0.036][j - 1] if up_w == "dome" else up_u[j - 1]
                w = (math.sqrt(max(0.0, 0.0505 ** 2 - u * u)) + lid_w(u)) / 2 if up_w == 'dome' else lid_w(u) + up_w
                spec.append((u, w, eyeball_h(u, w) + up_h))
            else:
                u, w = circ(r_corner if (r_corner and j in (0, 4)) else r_low, AM[j]); spec.append((u, w, eyeball_h(u, w) + off_low))
        return loop(spec)
    L.append(lid_loop(0.0498, 0.0016, 'dome', T_LID))           # L2 vòm mí
    L.append(lid_loop(0.0492, 0.0011, 0.0032, T_LID))            # L3 mép trên nét mí đậm
    L.append(lid_loop(RO, 0.0006, 0.0, 0.6 * T_LID))             # L4 khe mắt (mép mí)
    L.append(lid_loop(RO + 0.0028, 0.0006, 0.0035, 0.0006, RO + 0.0025))   # L5 mặt trong mí, nằm trên nhãn cầu
    spec = []
    for j in range(8):                                                             # L6 mặt trong mí đi tiếp sát nhãn cầu lên dưới vòm mí (dải sau không cắt qua cầu)
        if j in (1, 2, 3): u = [0.030, 0.0, -0.030][j - 1]; w = 0.046 - 0.008 * (u / 0.03) ** 2
        else: u, w = circ(RO + 0.0065, AM[j])
        spec.append((u, w, eyeball_h(u, w) + 0.0008))
    L.append(loop(spec))
    hc = EYE_APEX - EYE_DD
    L.append(loop(ring_spec(EYE_A * 1.04, ANG, lambda u, w: hc - 0.002)))           # L6 hốc: ôm quanh xích đạo nhãn cầu
    L.append(loop(ring_spec(EYE_A * 0.60, ANG, lambda u, w: hc - 1.35 * EYE_DD)))   # L7 đáy hốc, sau nhãn cầu
    MAT = {0: [5] * 4 + [1] * 4, 1: [0] * 4 + [1] * 4, 2: [0] * 4 + [1] * 4, 3: [1] * 8, 4: [1] * 8, 5: [2] * 8, 6: [2] * 8, 7: [2] * 8}
    for b in range(len(L) - 1):
        A_, B_ = L[b], L[b + 1]
        for j in range(8): cg.f((A_[j], A_[(j + 1) % 8], B_[(j + 1) % 8], B_[j]), MAT[b][j])
    Lc = L[-1]
    for q in ((0, 1, 2, 3), (0, 3, 4, 7), (4, 5, 6, 7)): cg.f(tuple(Lc[i] for i in q[::-1]), 2)
    cg.idx['eye'] = L
    for x in L[0]: cg.fit.discard(x); cg.design.pop(x, None)       # vòng biên mắt giữ đúng vị trí thiết kế (bù co ở đây kéo vòng vào 18 mm, chồng lên mí)

    # --- MIỆNG: nửa vòng 7 đỉnh (0 trên giữa, 3 khoé, 6 dưới giữa)
    M = [[G[r][k] for r, k in MOUTH_MAP]]
    def mloop(spec): return [cg.v(mpt(*s_), mid=(j in (0, 6))) for j, s_ in enumerate(spec)]
    def ell(a, bu, bd, hf):
        out = []
        for p in PHI:
            t = math.radians(p); u = a * math.cos(t); w = (bu if p > 0 else bd) * math.sin(t) + wline(min(u, 0.032)); out.append((u, w, hf(u, w)))
        return out
    M.append(mloop(ell(0.040, 0.0165, 0.0175, lambda u, w: mface(u, w) + 0.0012)))
    M.append(mloop(ell(0.0345, 0.0085, 0.0095, lambda u, w: mface(u, w) + 0.0022)))
    us = [0, 0.016, 0.027, 0.0315, 0.027, 0.016, 0]; g = MOUTH_GAP / 2
    sp = []
    for j, u in enumerate(us):
        w = wline(u) + (g if j < 3 else -g if j > 3 else 0.0); sp.append((u, w, mface(u, w) + (0.0018 if j != 3 else -0.001)))
    M.append(mloop(sp))                                                             # M3 khe môi
    M.append(mloop([(u * 0.9, wline(u) + (0.0045 if j < 3 else -0.0045 if j > 3 else 0), mface(u, wline(u)) - 0.006) for j, u in enumerate(us)]))
    M.append(mloop([(min(u, 0.027) * 0.95, (0.014 if j < 3 else -0.014 if j > 3 else 0), -0.020) for j, u in enumerate(us)]))
    M.append(mloop([(0.022 * math.cos(math.radians(p)), 0.016 * math.sin(math.radians(p)), -0.042) for p in PHI]))
    MM = {0: [0] * 6, 1: [0] * 6, 2: [0] * 6, 3: [3] * 6, 4: [3] * 6, 5: [3, 3, 3, 4, 4, 4]}
    for b in range(len(M) - 1):
        A_, B_ = M[b], M[b + 1]
        for j in range(6): cg.f((A_[j], A_[j + 1], B_[j + 1], B_[j]), MM[b][j])
    Mc = M[-1]; cg.f((Mc[6], Mc[5], Mc[1], Mc[0]), 3); cg.f((Mc[5], Mc[4], Mc[2], Mc[1]), 4); cg.f((Mc[4], Mc[3], Mc[2]), 4)
    cg.idx['mouth'] = M
    for x in M[0]: cg.fit.discard(x); cg.design.pop(x, None)

    # --- CỔ: vòng duoi_ham (9) → N0 (7) bằng mẫu giảm 3→1 ở hông cổ; N0 → N1 = vòng 'co' của thân cage
    lv0 = B._levels()[0]; N1w = B.level_ring(lv0); N1 = [cg.v(to_head(p), mid=j in (0, 6)) for j, p in enumerate(N1w)]
    yc = to_head(Vector((0, lv0['yc'], 0))).y
    N0 = []
    for j, p in enumerate(N1w):
        q = to_head(p); q = Vector((q.x * NECK_N0_K, yc + (q.y - yc) * NECK_N0_K, q.z + 0.013)); N0.append(cg.v(q, mid=j in (0, 6)))
    R10 = G[NR - 1]
    m1 = cg.v(R10[3].co * 0.5 + N0[2].co * 0.25 + N0[3].co * 0.25); m2 = cg.v(R10[4].co * 0.5 + N0[3].co * 0.5)
    for a, b_, c, d in ((R10[0], R10[1], N0[1], N0[0]), (R10[1], R10[2], N0[2], N0[1]), (R10[2], R10[3], m1, N0[2]), (R10[3], R10[4], m2, m1),
                        (R10[4], R10[5], N0[3], m2), (m1, m2, N0[3], N0[2]), (R10[5], R10[6], N0[4], N0[3]), (R10[6], R10[7], N0[5], N0[4]), (R10[7], R10[8], N0[6], N0[5])):
        cg.f((a, b_, c, d))
    for j in range(6): cg.f((N0[j], N0[j + 1], N1[j + 1], N1[j]))
    cg.idx['neck'] = (N0, N1)
    for x in G[NR - 1]: cg.fit.discard(x); cg.design.pop(x, None)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    bm.verts.index_update()
    def ix(o):
        if isinstance(o, bmesh.types.BMVert): return o.index
        if isinstance(o, (list, tuple)): return [ix(x) for x in o]
        return o
    idx = {k: ix(v) for k, v in cg.idx.items()}
    design = {x.index: cg.design.get(x, x.co).copy() for x in cg.fit}
    mid = [x[cg.mid] > 0.5 for x in bm.verts]
    ob = D.new_obj('Nam_Dau_Cage', bm, coll, mats)
    for p in ob.data.polygons: p.use_smooth = True
    m = ob.modifiers.new('Mirror', 'MIRROR'); m.use_axis = (True, False, False); m.use_clip = True; m.use_mirror_merge = True; m.merge_threshold = 1e-4
    s = ob.modifiers.new('Subsurf', 'SUBSURF'); s.levels = 2; s.render_levels = 2; s.use_limit_surface = True
    fit_cage(ob, design, mid)
    s.levels = 1
    return ob, idx, (p0, fe, Xe, Ze), (hm, fm, Xm, Zm)


def fit_cage(ob, design, mid, iters=10, k=0.9):
    """Bù co Subdivision: dời đỉnh cage (nhóm khớp) để điểm giới hạn của chính đỉnh đó trùng điểm thiết kế (mặt đầu cũ / bảng). Thứ tự đỉnh Subdivision giữ nguyên chỉ số đỉnh gốc."""
    for it in range(iters):
        dg = bpy.context.evaluated_depsgraph_get(); ev = ob.evaluated_get(dg); me = ev.to_mesh(); lim = {i: me.vertices[i].co.copy() for i in design}; ev.to_mesh_clear()
        err = 0.0
        for i, tgt in design.items():
            d = (tgt - lim[i]); err = max(err, d.length); v = ob.data.vertices[i]; v.co += d * k
            if mid[i]: v.co.x = 0.0
        ob.data.update()
    print(f'    khớp cage: sai lệch lớn nhất còn {err * 1000:.2f} mm sau {iters} vòng')


# ================================================================== NHÃN CẦU, MÀY, NỐT RUỒI, TAI
def build_eyes(coll, frames, white, black, cum):
    out = {}
    for s, k in ((1, 'L'), (-1, 'R')):
        p0, f, X, Z = EYE_FR[s]
        Ce = p0 + f * (EYE_APEX - EYE_DD)
        em = bpy.data.objects.new(f'Mat_Goc.{k}', None); coll.objects.link(em); em.empty_display_size = 0.03
        em.matrix_world = Matrix.Translation(Ce) @ Matrix((X, -f, Z)).transposed().to_4x4() @ Matrix.Diagonal((EYE_A * ES, EYE_DD, EYE_A * ES, 1.0))
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=72, radius=1.0)
        ca = math.cos(math.radians(PUPIL_DEG + 0.4))
        me = bpy.data.meshes.new(f'Nhan_Cau.{k}')
        pu, pw = PUPIL_REST[0] * s, PUPIL_REST[1]
        d = Vector((pu / EYE_A, -math.sqrt(1 - (pu / EYE_A) ** 2 - (pw / EYE_A) ** 2), pw / EYE_A))
        rot = Vector((0, 0, 1)).rotation_difference(d).to_matrix().to_4x4()
        for fc in bm.faces: fc.material_index = 1 if fc.calc_center_median().normalized().z > ca else 0
        bm.transform(rot); bm.to_mesh(me); bm.free(); me.materials.append(white); me.materials.append(black); me.shade_smooth()
        ob = bpy.data.objects.new(f'Nhan_Cau.{k}', me); coll.objects.link(ob); ob.parent = em
        out[k] = (em, ob)
    return out


def surf_front(bvh, x, z, off):
    hp = bvh.ray_cast(Vector((x, -1.5, z)), Vector((0, 1, 0)))
    n = hp[1].normalized(); n = n if n.y < 0 else -n; return hp[0] + n * off, n


NOSE_LINE = dict(r=0.93, cung=(95.0, -115.0), day=0.055)   # nét viền mũi: bán kính cung trên mặt cầu đơn vị, góc đầu/cuối (độ, 0 = phía +X, 90 = trên), độ dày theo r
NOSE_BALL = dict(r=0.030, nho=0.45, dep=(1.0, 0.85, 0.92))   # cục mũi tròn như mẫu: bán kính (hệ đầu gốc), phần nhô ra khỏi da theo r, tỉ lệ dẹt (ngang, sâu, cao)


def build_nose_ball(coll, bvh, skin, muc=None):
    """Cục mũi tròn riêng (vật liệu da) cắm một phần vào đỉnh mũi của lưới mặt: lưới chỉ cho gờ, mẫu là cục cầu rõ khối."""
    best = None
    for i in range(41):
        z = D.FACE['nose_base_z'] - 0.02 + i * 0.0015
        hp = bvh.ray_cast(Vector((0, -1.5, z)), Vector((0, 1, 0)))
        if hp[0] is not None and (best is None or hp[0].y < best[0].y): best = hp
    p = best[0]; n = Vector((0, -1, 0)); r = NOSE_BALL['r']
    ob = D.uv_sphere('Mui_Tron', coll, skin, (32, 20))
    D.place(ob, p + n * (r * (NOSE_BALL['nho'] - 1.0)) + Vector((0, 0, -0.25 * r)), D.frame(n, 0), tuple(r * k for k in NOSE_BALL['dep']))
    for f in ob.data.polygons: f.use_smooth = True
    if muc is None: return ob
    # nét viền mũi như mẫu: cung mực ôm cạnh +X (bên trái nhân vật = bên phải ảnh) từ đỉnh xuống đáy, cong vào ở cuối
    bpy.context.view_layer.update(); mw = ob.matrix_world.copy()
    cu = bpy.data.curves.new('Vien_Mui', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = NOSE_LINE['day'] * r; cu.bevel_resolution = 3; cu.use_fill_caps = True
    sp = cu.splines.new('POLY'); n_ = 24; t0, t1 = NOSE_LINE['cung']; sp.points.add(n_ - 1)
    for i in range(n_):
        t = math.radians(t0 + (t1 - t0) * i / (n_ - 1)); rr = NOSE_LINE['r']
        x, z = rr * math.cos(t), rr * math.sin(t); y = -math.sqrt(max(0.0, 1.0 - x * x - z * z))
        q = mw @ (Vector((x, y, z)) * 1.02); sp.points[i].co = (q.x, q.y, q.z, 1.0)
    lo = bpy.data.objects.new('Vien_Mui', cu); coll.objects.link(lo); cu.materials.append(bpy.data.materials['Vien_Den'])
    return ob


def build_brows_mole(coll, bvh, M):
    for s, k in ((1, 'L'), (-1, 'R')):
        pts = [surf_front(bvh, s * x, z, 0.0012)[0] for x, z in zip(D.FACE['brow_x'], (D.FACE['brow_z'] - 0.004, D.FACE['brow_z'] + 0.005, D.FACE['brow_z'] - 0.006))]
        D.sweep(f'Eyebrow.{k}', coll, pts, lambda u: 0.0145 * (1 - 0.35 * u) * math.sin(math.pi * (0.03 + 0.94 * u)) ** 0.35,
                lambda u: 0.0080 * (1 - 0.3 * u) * math.sin(math.pi * (0.03 + 0.94 * u)) ** 0.35, lambda c: (c - D.C).normalized(), M['toc'], 32, 16, fb=0.2)
    p, n = surf_front(bvh, D.MOLE_SIDE * (D.FACE['mole_x'] - FACE_TUNE['mole_dx'] / K), D.FACE['mole_z'], 0.0022); mo = D.uv_sphere('Mole', coll, M['muc'], (16, 10)); D.place(mo, p, D.frame(n, 0), (0.0068, 0.0028, 0.0068))


# ================================================================== BẢN LẮP RÁP ĐẦU + THÂN (một lưới)
def assemble(head, body_cage, mats):
    """Nam_Dau_Than = cage thân (giữ nguyên) + cage đầu (đổi sang toạ độ thế giới), vòng cổ dưới của đầu CHÍNH LÀ vòng 'co' của thân (7 đỉnh đầu tiên của cage thân).
    Không bridge, không dải nối: một lưới, Mirror + Subdivision 2; shape key của đầu chép sang."""
    bm = bmesh.new(); bm.from_mesh(body_cage.data); nb = len(bm.verts); bm.verts.ensure_lookup_table()
    for f in bm.faces: f.material_index = 0
    mid = bm.verts.layers.float.get('duong_giua')
    hm = head.data; N1 = HEAD_IDX['neck'][1]; remap = {}
    for j, i in enumerate(N1): remap[i] = bm.verts[j]
    hmid = [0.0] * len(hm.vertices); hm.attributes['duong_giua'].data.foreach_get('value', hmid)
    order = []
    for v in hm.vertices:
        if v.index in remap: continue
        x = bm.verts.new(to_world(v.co)); x[mid] = hmid[v.index]; remap[v.index] = x; order.append(v.index)
    for p in hm.polygons:
        f = bm.faces.new([remap[i] for i in p.vertices]); f.material_index = p.material_index; f.smooth = True
    for f in bm.faces: f.smooth = True
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new('Nam_Dau_Than'); bm.to_mesh(me); bm.free()
    for m in mats: me.materials.append(m)
    ob = bpy.data.objects.new('Nam_Dau_Than', me); body_cage.users_collection[0].objects.link(ob)
    m = ob.modifiers.new('Mirror', 'MIRROR'); m.use_axis = (True, False, False); m.use_clip = True; m.use_mirror_merge = True; m.merge_threshold = 1e-4
    s = ob.modifiers.new('Subsurf', 'SUBSURF'); s.levels = 2; s.render_levels = 3      # render mịn hơn một mức: mép viền mắt bớt góc cạnh
    amap = {hi: nb + n for n, hi in enumerate(order)}          # chỉ số đầu → chỉ số bản lắp ráp
    for j, i in enumerate(N1): amap[i] = j
    if hm.shape_keys:
        ob.shape_key_add(name='Basis', from_mix=False)
        for kb in hm.shape_keys.key_blocks[1:]:
            nk = ob.shape_key_add(name=kb.name, from_mix=False)
            for hi, ai in amap.items():
                if hi in N1: continue
                nk.data[ai].co = to_world(kb.data[hi].co)
    ob['so_dinh_than'] = nb; ob['so_dinh_dau'] = len(hm.vertices)
    return ob, amap


# ================================================================== SHAPE KEY THỬ (trên cage đầu)
def add_shape_keys(ob, idx, ef, mf):
    p0, fe, Xe, Ze = ef; me = ob.data
    base = [v.co.copy() for v in me.vertices]
    Ce = p0 + fe * (EYE_APEX - EYE_DD)
    def nq(p): d = p - Ce; return Vector((d.dot(Xe) / (EYE_A * ES), d.dot(Ze) / (EYE_A * ES), d.dot(fe) / EYE_DD))
    def dq(q): return Ce + Xe * (q.x * EYE_A * ES) + Ze * (q.y * EYE_A * ES) + fe * (q.z * EYE_DD)
    def rot_to(q, t):     # góc xoay quanh trục u (trong không gian chuẩn hoá) để q.y·A = t
        Rr = math.hypot(q.y, q.z); dl = math.atan2(q.z, q.y); c = max(-1.0, min(1.0, t / (EYE_A * ES) / Rr)); return math.acos(c) - dl
    def rot(q, a): return Vector((q.x, q.y * math.cos(a) - q.z * math.sin(a), q.y * math.sin(a) + q.z * math.cos(a)))
    L = idx['eye']; mg = L[4]
    ob.shape_key_add(name='Basis', from_mix=False)
    lower = lambda u: -math.sqrt(max(0.0, (RO * ES) ** 2 - u * u)) + 0.0008     # nhắm: mép mí trên xuống sát mép dưới
    upper = lambda u: math.sqrt(max(0.0, (RO * ES) ** 2 - u * u)) - 0.016      # mở to: mép mí lên gần đỉnh vòng mắt
    # mí trên xoay quanh trục ngang của nhãn cầu (trong không gian elip chuẩn hoá → trượt trên mặt nhãn cầu, không xuyên); vòng ngoài theo tỉ lệ
    for name, tw, fr in (('Nham_Mat', lower, {1: 0.15, 2: 0.62, 3: 0.95, 4: 1.0, 5: 1.0, 6: 1.0, 7: 1.0, 8: 1.0}), ('Mo_Mat', upper, {1: 0.25, 2: 0.72, 3: 0.96, 4: 1.0, 5: 1.0, 6: 1.0, 7: 1.0, 8: 0.0})):
        kb = ob.shape_key_add(name=name, from_mix=False)
        for j in (1, 2, 3):
            q = nq(base[mg[j]]); a = rot_to(q, tw(q.x * EYE_A * ES))
            for li, f_ in fr.items():
                vi = L[li][j]; kc = CORNER_K if (j != 2 and li >= 5) else 1.0; kb.data[vi].co = dq(rot(nq(base[vi]), a * f_ * kc))
            if j == 2:                                                       # đỉnh khoé (E, W) của vòm mí trượt theo một phần nhỏ, dải góc không cắt chéo qua cầu
                for li, f_ in ((1, 0.10), (2, 0.22), (3, 0.22)):
                    for jc in (0, 4): vi = L[li][jc]; kb.data[vi].co = dq(rot(nq(base[vi]), a * f_))
    # hàm: xoay quanh trục X qua JAW_PIVOT, trọng số theo vùng
    w = jaw_weights(ob, idx); piv = Vector(JAW_PIVOT); a = math.radians(JAW_DEG)
    R = Matrix.Rotation(a, 3, 'X')
    kb = ob.shape_key_add(name='Mo_Ham', from_mix=False)
    for i, wt in w.items():
        if wt <= 0: continue
        p = base[i]; q = piv + Matrix.Rotation(a * wt, 3, 'X') @ (p - piv); kb.data[i].co = q
    vg = ob.vertex_groups.new(name='Ham')
    for i, wt in w.items():
        if wt > 0: vg.add([i], wt, 'REPLACE')
    # cười nhẹ: khoé miệng lên/ra/lùi, má đầy lên
    kb = ob.shape_key_add(name='Cuoi_Nhe', from_mix=False); M = idx['mouth']; G = idx['grid']
    def mv(i, d): kb.data[i].co = kb.data[i].co + d
    for li, f_ in ((0, 0.45), (1, 0.85), (2, 1.0), (3, 1.0), (4, 0.9), (5, 0.6)):
        mv(M[li][3], SMILE * f_)
        for j in (2, 4): mv(M[li][j], SMILE * f_ * 0.45)
        for j in (1, 5): mv(M[li][j], Vector((SMILE.x * 0.1, 0, SMILE.z * 0.15)) * f_)
    for r, k, d in ((6, 3, (0.002, -0.002, 0.003)), (7, 3, (0.002, -0.001, 0.002)), (6, 2, (0.001, -0.001, 0.002))):
        mv(G[r][k], Vector(d))


def jaw_weights(ob, idx):
    G = idx['grid']; M = idx['mouth']; N0, N1 = idx['neck']; w = {}
    col = [1.0, 1.0, 1.0, 1.0, 0.7, 0.35, 0.0, 0.0, 0.0]
    for r, f_ in ((10, 1.0), (11, 1.0), (12, 0.85)):
        for k in range(9):
            if G[r][k] is not None: w[G[r][k]] = col[k] * f_
    for r, wk in ((8, (0.30, 0.18, 0.06)), (9, (0.62, 0.42, 0.16))):
        for k, f_ in zip((3, 4, 5), wk): w[G[r][k]] = f_
    for li, loop in enumerate(M):                    # môi dưới theo hàm, chuyển dần về khoé; môi trên đứng yên
        for j, wt in ((2, 0.06), (3, 0.45), (4, 0.82), (5, 0.96), (6, 1.0)): w[loop[j]] = wt
        if li >= 5:
            for j in (0, 1, 2): w[loop[j]] = 0.12          # túi miệng phía trên giãn nhẹ
    for j, f_ in ((0, 0.3), (1, 0.25), (2, 0.15)): w[N0[j]] = f_
    return w


# ================================================================== DỰNG CẢNH
HEAD_IDX = {}


def build(args):
    global HEAD_IDX
    sc = B.build_old()
    cb = bpy.data.collections[B.NEW_COLL]
    B.split_hands_feet(bpy.data.objects['Nam_Than_goc'], cb)
    cage_than = B.build_cage(cb); skin = bpy.data.objects['Nam_Than_goc'].data.materials[0]
    old_asm = B.assemble_cage(bpy.data.objects['Head_Base'], cage_than, skin); cage_than.hide_render = True
    old_asm.name = 'Nam_Dau_Than_cu'
    # đầu cũ → collection đối chiếu (không ghi đè, không nạp vào phòng)
    oc = bpy.data.collections.new(OLD_COLL); sc.collection.children.link(oc); oc.hide_render = True
    hf = bpy.data.collections['03_Head_And_Face']; bpy.data.collections['Nam_Dau'].children.unlink(hf); oc.children.link(hf)
    cb.objects.unlink(old_asm); oc.objects.link(old_asm)
    landmarks_old()
    for o in list(hf.objects):
        if o.name != 'Head_Base': o.name = o.name + '_cu'          # tên gốc để dành cho bộ phận đầu mới
    # vật liệu
    M = {k: bpy.data.materials[n] for k, n in (('toc', 'Toc'), ('trang', 'Mat_Trang'), ('muc', 'Muc'), ('khoang', 'Khoang_Mieng'), ('luoi', 'Luoi'))}
    hoc = D.mat('Hoc_Mat', '#2a1a18', 0.9)
    vien_mi = D.mat('Vien_Mi', '#5a3524', 0.7)                     # cung mí phía trên: đường mảnh nâu sẫm như mẫu (mép dưới mới là mực đen dày)
    vien_den = D.mat('Vien_Den', '#0d0b0a', 0.95)                  # viền mắt/nét mí: đen nhám (mực cũ xám bóng nên viền nhòe)
    mats = [skin, vien_den, hoc, M['khoang'], M['luoi'], vien_mi]
    nc = bpy.data.collections.new(NEW_COLL); bpy.data.collections['Nam_Dau'].children.link(nc)
    S_old = old_head_bvh()
    S_nen = plain_loft_bvh()
    head, HEAD_IDX, ef, mf = build_head_cage(nc, mats, S_old, S_nen)
    add_shape_keys(head, HEAD_IDX, ef, mf)
    bvh_new = mesh_bvh(head)[0]
    eyes = build_eyes(nc, ef, M['trang'], bpy.data.materials['Vien_Den'], None)
    build_brows_mole(nc, bvh_new, M)
    build_nose_ball(nc, bvh_new, skin, M['muc'])
    for k in ('L', 'R'):
        e = bpy.data.objects[f'Ear.{k}_cu'].copy(); e.data = e.data.copy(); e.name = f'Ear.{k}'; nc.objects.link(e)
        e.data.materials.clear(); e.data.materials.append(skin)
    asm, amap = assemble(head, cage_than, mats)
    for k in ('L', 'R'): bpy.data.objects[f'Ear.{k}'].modifiers['Dan_vao_dau'].target = asm      # gốc tai dán vào đúng mặt được render
    # cụm mới theo Cum_Dau như đầu cũ
    cum = bpy.data.objects['Cum_Dau']
    for o in nc.objects:
        if o.parent is None or o.parent.name == 'Cum_Dau': o.parent = cum; o.matrix_parent_inverse = Matrix.Translation((0, 0, -C0))
    head.hide_render = True; bpy.context.view_layer.update()
    fit_eyeballs(asm); conform_brows(asm)
    return sc, head, asm, amap, eyes


def fit_eyeballs(asm, margin=1.012):
    """Nhãn cầu thu đều quanh tâm cho vừa dưới da ở mọi shape key mắt (trung tính, nhắm, mở to): không đỉnh da nào lọt vào cầu."""
    worst = 9.0
    for kv in ({}, {'Nham_Mat': 1}, {'Mo_Mat': 1}):
        set_keys(asm, **kv); vs, _, _ = ev_mesh(asm); mw = eye_world('L'); inv = mw.inverted(); c = mw.translation
        for p in vs:
            if (p - c).length < 0.09: worst = min(worst, (inv @ p).length)
    set_keys(asm); k = min(1.0, worst / margin)
    for s_ in ('L', 'R'): em = bpy.data.objects[f'Mat_Goc.{s_}']; em.scale = em.scale * k
    bpy.context.view_layer.update(); print(f'    nhãn cầu thu đều ×{k:.3f} cho vừa dưới mí (bán kính ngang {EYE_A * k * 1000:.1f} mm, khe mắt {RO * 1000:.1f} mm)')


def conform_brows(asm):
    """Mày bám mặt trán: đỉnh nào lún vào da thì đẩy ra theo pháp tuyến da, chỉ giữ chạm 0,3 mm."""
    set_keys(asm); vs, ps, _ = ev_mesh(asm); bv = BVHTree.FromPolygons(vs, ps)
    for s_ in ('L', 'R'):
        o = bpy.data.objects[f'Eyebrow.{s_}']; mw = o.matrix_world; inv = mw.inverted()
        for v in o.data.vertices:
            p = mw @ v.co; hit, nrm, _, d = bv.find_nearest(p)
            if (p - hit).dot(nrm) < 0.0003: v.co = inv @ (hit + nrm * 0.0003)
    bpy.context.view_layer.update()


def old_head_bvh():
    me = bpy.data.objects['Head_Base'].data
    return BVHTree.FromPolygons([v.co.copy() for v in me.vertices], [tuple(p.vertices) for p in me.polygons])


def landmarks_old():
    hb = bpy.data.objects['Head_Base']; vs = [v.co for v in hb.data.vertices]
    p0 = D.EYE_FRAMES[1][0]; front = [v for v in vs if abs(v.x) < 0.004]
    nose = min(vs, key=lambda v: v.y); chin = min([v for v in front if v.y < -0.1], key=lambda v: v.z)
    bpy.context.view_layer.update(); ear = bpy.data.objects['Ear.L'].matrix_world.translation
    rows = [('đỉnh sọ', Vector((0, 0, max(v.z for v in vs)))), ('tâm mắt trái', p0), ('chân mày (giữa)', Vector((D.FACE['brow_x'][1], 0, D.FACE['brow_z']))),
            ('đỉnh mũi', nose), ('miệng', Vector(D.MOUTH_FRAME['p'])), ('cằm (thấp nhất giữa trước)', chin), ('tâm tai trái (thế giới)', to_head(ear)), ('vòng nối cổ', Vector((0, 0, T.RING_Z0)))]
    print('--- MỐC ĐẦU CŨ (hệ đầu gốc → thế giới, m):')
    for n, p in rows: print(f'    {n:28s} {tuple(round(c, 4) for c in p)} → {tuple(round(c, 4) for c in to_world(p))}')
    print(f'    sọ nửa ngang lớn nhất {max(v.x for v in vs):.4f}, sâu {min(v.y for v in vs):.4f}…{max(v.y for v in vs):.4f}')


# ================================================================== KIỂM TRA
def ev_mesh(ob):
    dg = bpy.context.evaluated_depsgraph_get(); ev = ob.evaluated_get(dg); me = ev.to_mesh()
    vs = [ev.matrix_world @ v.co for v in me.vertices]; ps = [tuple(p.vertices) for p in me.polygons]; mi = [p.material_index for p in me.polygons]
    ev.to_mesh_clear(); return vs, ps, mi


def set_keys(ob, **vals):
    for kb in ob.data.shape_keys.key_blocks[1:]: kb.value = vals.get(kb.name, 0.0)
    bpy.context.view_layer.update()


def eye_world(k):
    em = bpy.data.objects[f'Mat_Goc.{k}']; return em.matrix_world.copy()


def inside_eyeball(vs, mw, margin=0.999):
    inv = mw.inverted(); c = mw.translation; n = 0
    for p in vs:
        if (p - c).length > 0.09: continue
        if (inv @ p).length < margin: n += 1
    return n


def eye_rays(asm, k, key_vals, n=9, dirs=None):
    """Bắn tia vào vùng mắt: trả (số tia trúng nhãn cầu trước, số tia lọt vào hốc mắt, tổng)."""
    set_keys(asm, **key_vals); vs, ps, mi = ev_mesh(asm); bv = BVHTree.FromPolygons(vs, ps)
    eb = bpy.data.objects[f'Nhan_Cau.{k}']; evs, eps, _ = ev_mesh(eb); be = BVHTree.FromPolygons(evs, eps)
    mw = eye_world(k); c = mw.translation; X = (mw.col[0].xyz).normalized(); Z = (mw.col[2].xyz).normalized(); F = -(mw.col[1].xyz).normalized()
    R = EYE_A * ES * K * 0.95; hit_eye = leak = tot = 0
    for d in (dirs or [F]):
        for i in range(n):
            for j in range(n):
                u = -R + 2 * R * i / (n - 1); w = -R + 2 * R * j / (n - 1)
                if u * u + w * w > R * R: continue
                o = c + X * u + Z * w + d * 0.3; tot += 1
                h1 = bv.ray_cast(o, -d); h2 = be.ray_cast(o, -d)
                d1 = h1[3] if h1[0] else 9; d2 = h2[3] if h2[0] else 9
                if d2 < d1: hit_eye += 1
                elif h1[0] and mi[h1[2]] == 2: leak += 1
    return hit_eye, leak, tot


def self_hits_ev(vs, ps, zmin=None):
    bm = bmesh.new(); vv = [bm.verts.new(p) for p in vs]
    for p in ps:
        try: bm.faces.new([vv[i] for i in p])
        except ValueError: pass
    bm.faces.ensure_lookup_table(); bvh = BVHTree.FromBMesh(bm); out = []
    for a, b in bvh.overlap(bvh):
        if a < b and not set(bm.faces[a].verts) & set(bm.faces[b].verts):
            c = (bm.faces[a].calc_center_median() + bm.faces[b].calc_center_median()) / 2
            if zmin is None or c.z > zmin: out.append(tuple(round(x * 1000) for x in c))
    bm.free(); return out


def open_edges(vs, ps):
    cnt = {}
    for p in ps:
        for a, b in zip(p, p[1:] + p[:1]): e = (min(a, b), max(a, b)); cnt[e] = cnt.get(e, 0) + 1
    return sum(1 for c in cnt.values() if c == 1), sum(1 for c in cnt.values() if c > 2)


def check_all(sc, head, asm, amap):
    res = {}; ok = lambda c, m: (bool(c), m)
    # bản gốc giữ lại
    oc = bpy.data.collections.get(OLD_COLL)
    res['dau_cu_giu'] = ok(oc and bpy.data.objects.get('Nam_Dau_Than_cu') and bpy.data.objects.get('Head_Base') and '03_Head_And_Face' in [c.name for c in oc.children],
                           'collection 00_Dau_Cu có Head_Base + 03_Head_And_Face + Nam_Dau_Than_cu')
    # cage
    ms = [m.type for m in head.modifiers]; sub = head.modifiers.get('Subsurf')
    res['cage_mirror_subsurf'] = ok(ms == ['MIRROR', 'SUBSURF'] and sub.levels == 1, f'modifier {ms}, Subdivision xem {sub.levels}')
    xs = [v.co.x for v in head.data.vertices]; md = [0.0] * len(xs); head.data.attributes['duong_giua'].data.foreach_get('value', md)
    bad = sum(1 for x, m in zip(xs, md) if m > 0.5 and abs(x) > 1e-6); neg = sum(1 for x in xs if x < -1e-6)
    res['cage_duong_giua'] = ok(bad == 0 and neg == 0, f'{len(xs)} đỉnh nửa cage, {int(sum(md))} đỉnh giữa, lệch {bad}, x âm {neg}')
    nf = len(head.data.polygons); nq = sum(1 for p in head.data.polygons if len(p.vertices) == 4); ntri = sum(1 for p in head.data.polygons if len(p.vertices) == 3)
    res['cage_quad'] = ok(nf - nq - ntri == 0 and ntri <= 2, f'{nf} mặt: {nq} quad, {ntri} tam giác (đáy túi miệng), n-gon {nf - nq - ntri}')
    # lưới lắp ráp (đã đánh giá Mirror + Subdivision 2)
    set_keys(asm); vs, ps, mi = ev_mesh(asm); oe, nm = open_edges(vs, ps)
    res['asm_kin'] = ok(oe == 0 and nm == 0, f'{len(vs)} đỉnh sau Subdivision; cạnh hở {oe}, cạnh >2 mặt {nm}')
    vol = 0.0
    for p in ps:
        a = vs[p[0]]
        for i in range(1, len(p) - 1): vol += a.dot(vs[p[i]].cross(vs[p[i + 1]])) / 6
    res['asm_phap_tuyen'] = ok(vol > 0, f'thể tích có dấu {vol:.4f} m³')
    hits = self_hits_ev(vs, ps); res['asm_tu_giao'] = ok(not hits, f'cặp mặt tự giao {len(hits)}' + (f' ví dụ (mm) {hits[:6]}' if hits else ''))
    lo = min(v.z for v in vs); hi_objs = [o for o in sc.objects if o.type in ('MESH', 'CURVE') and T.visible(o) and o.name not in ('San',)]
    lo_, hi_ = T.bbox(hi_objs, bpy.context.evaluated_depsgraph_get()); h = hi_.z - lo_.z
    res['chieu_cao'] = ok(abs(h - B.H_TARGET) <= B.H_TOL and abs(lo_.z) < 0.001, f'đáy {lo_.z:.4f} đỉnh {hi_.z:.4f} cao {h:.4f} m')
    # nối cổ: vòng dưới của đầu = 7 đỉnh đầu của cage thân, cùng vị trí
    N1 = HEAD_IDX['neck'][1]; cage_than = bpy.data.objects['Nam_Than_Cage']
    dmax = max((to_world(head.data.vertices[i].co) - cage_than.data.vertices[j].co).length for j, i in enumerate(N1))
    res['co_chung_vong'] = ok(dmax < 1e-5 and all(amap[i] == j for j, i in enumerate(N1)), f'vòng cổ đầu ≡ vòng "co" thân (7 đỉnh nửa), lệch {dmax * 1000:.4f} mm, một lưới liền')
    # sọ mới sát sọ cũ ở vùng tóc
    res['so_sat_toc'] = skull_vs_old(head)
    # mắt
    for k in ('L', 'R'):
        mw = eye_world(k); bad = {}
        for nm_, kv in (('trung_tinh', {}), ('nham', {'Nham_Mat': 1}), ('mo_to', {'Mo_Mat': 1})):
            set_keys(asm, **kv); v2, _, _ = ev_mesh(asm); bad[nm_] = inside_eyeball(v2, mw)
        res[f'mi_khong_xuyen_nhan_cau.{k}'] = ok(sum(bad.values()) == 0, f'đỉnh da lọt vào nhãn cầu: {bad}')
    he, lk, tot = eye_rays(asm, 'L', {'Nham_Mat': 1}); res['nham_mat_kin'] = ok(he == 0 and lk == 0, f'nhắm: {he}/{tot} tia còn thấy nhãn cầu, {lk} tia lọt hốc')
    F = -(eye_world('L').col[1].xyz).normalized(); dirs = [F, (F + Vector((0.5, 0, 0))).normalized(), (F + Vector((-0.4, 0, 0.3))).normalized(), Vector((0, -1, 0))]
    for nm_, kv in (('trung_tinh', {}), ('mo_to', {'Mo_Mat': 1})):
        he, lk, tot = eye_rays(asm, 'L', kv, 11, dirs); res[f'khong_ho_hoc_mat.{nm_}'] = ok(lk == 0, f'{tot} tia (4 hướng): {he} trúng nhãn cầu, {lk} lọt vào hốc/trong đầu')
    res['huong_nhin'] = gaze_test(asm)
    # miệng
    for nm_, kv in (('trung_tinh', {}), ('mo_ham', {'Mo_Ham': 1}), ('cuoi', {'Cuoi_Nhe': 1}), ('nham_mat', {'Nham_Mat': 1}), ('mo_mat', {'Mo_Mat': 1})):
        set_keys(asm, **kv); v2, p2, _ = ev_mesh(asm); hh = self_hits_ev(v2, p2, zmin=0.9)
        res[f'tu_giao_dau.{nm_}'] = ok(not hh, f'cặp mặt tự giao vùng đầu–cổ {len(hh)}' + (f' ví dụ (mm) {hh[:6]}' if hh else ''))
    res['mieng_mo_that'] = mouth_open_test(asm)
    res['ham_cam'] = jaw_shape_test(asm)
    res['so_dinh_shape_key'] = ok(all(len(kb.data) == len(head.data.vertices) for kb in head.data.shape_keys.key_blocks) and
                                  all(len(kb.data) == len(asm.data.vertices) for kb in asm.data.shape_keys.key_blocks),
                                  f'{len(head.data.shape_keys.key_blocks) - 1} key trên cage đầu ({len(head.data.vertices)} đỉnh), {len(asm.data.shape_keys.key_blocks) - 1} key trên bản lắp ráp ({len(asm.data.vertices)} đỉnh)')
    # phụ kiện
    res['not_ruoi_dung_ben'] = ok((bpy.data.objects['Mole'].matrix_world.translation.x < 0) == (D.MOLE_SIDE < 0), f'Mole x = {bpy.data.objects["Mole"].matrix_world.translation.x:.4f} (bên phải nhân vật = −X)')
    res['may_bam_tran'] = brow_test(asm)
    set_keys(asm); vs_n, ps_n, _ = ev_mesh(asm); mo_ = bpy.data.objects['Mole']; bv_n = BVHTree.FromPolygons(vs_n, ps_n); mp_ = mo_.matrix_world.translation
    hit_n = bv_n.find_nearest(mp_); mv_ = [mo_.matrix_world @ v.co for v in mo_.data.vertices]; sau = min((p - hit_n[0]).dot(hit_n[1]) for p in mv_)
    res['not_ruoi_tren_da'] = ok(hit_n[3] < 0.004 and sau > -0.0015, f'tâm nốt ruồi cách da {hit_n[3] * 1000:.2f} mm; đỉnh chìm sâu nhất dưới da {max(0.0, -sau) * 1000:.2f} mm (≤ 1,5)')
    res['tai_dan_dau'] = ear_test(asm)
    res['khau_lien'] = MT.kiem_khau(head, HEAD_IDX)
    res['vung_mat'] = MT.kiem_vung_mat(head, HEAD_IDX, to_world, jaw_weights(head, HEAD_IDX), bpy.data.objects['Ear.L'].matrix_world.translation.copy())

    # đo bám ảnh mẫu (mắt, khe mắt; mũi, miệng, cằm, nốt ruồi): sai lệch hình dạng sau khi khớp tỉ lệ + tịnh tiến, % chiều cao mặt
    set_keys(asm); vs_m, ps_m, _ = ev_mesh(asm); kq_m = DM.sai_lech(DM.lay_moc_cage(head, vs_m, ps_m, to_world, HEAD_IDX)); vuot = DM.vuot_nguong(kq_m)
    rh = DM.do_rong_ham(DM.lay_moc_cage(head, vs_m, ps_m, to_world, HEAD_IDX), [p for p in vs_m if p.z > 0.93 and abs(p.x) < 0.3])
    res['ham_tron'] = ok(bool(rh) and sorted(e for _, _, e in rh.values())[len(rh) // 2] <= DM.NGUONG_HAM and max(e for _, _, e in rh.values()) <= 7.5, 'bề ngang hàm cage|mẫu px (sai lệch %HF; trung vị ≤ ' + f'{DM.NGUONG_HAM:.1f}, lớn nhất ≤ 7,5): ' + ', '.join(f'y{h}: {w:.0f}|{wm:.0f} ({e:.1f}%)' for h, (w, wm, e) in sorted(rh.items())))
    for nhom, ten in (('mat', ('mat_', 'khe_')), ('khung', ('mui', 'mieng', 'cam', 'not_ruoi'))):
        # đạt = trung vị nhóm ≤ ngưỡng của góc + sai số đọc ảnh (SAI_SO_DOC), và không mốc nào quá 2,5 × ngưỡng (ảnh mẫu là phối cảnh, mắt xa lệch cả khi mắt gần khớp)
        loi, tom = [], []
        for g, e in kq_m.items():
            xs = sorted(v for k, v in e.items() if k.startswith(ten)); med = xs[len(xs) // 2] if len(xs) % 2 else (xs[len(xs) // 2 - 1] + xs[len(xs) // 2]) / 2
            tom.append(f'{g} trung vị {med:.1f}% (≤ {DM.NGUONG[g]} + {DM.SAI_SO_DOC} đọc ảnh), lớn nhất {xs[-1]:.1f}% (≤ {2.5 * DM.NGUONG[g]:.1f})')
            if med > DM.NGUONG[g] + DM.SAI_SO_DOC or xs[-1] > 2.5 * DM.NGUONG[g]: loi.append(g)
        res[f'{nhom}_dung_mau'] = ok(not loi, '; '.join(tom))
    set_keys(asm); return res


def skull_vs_old(head):
    """Bán kính sọ mới − sọ cũ (hệ đầu gốc) theo lưới hướng ở vùng có tóc (trên chân tóc v4 + 4°)."""
    S_old = old_head_bvh(); S_new = mesh_bvh(head)[0]; dd = []
    for az in range(0, 360, 10):
        for el in range(int(D.hairline_v4(az)) + 4, 86, 6):
            a, e = math.radians(az), math.radians(el); d = Vector((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e)))
            o = D.C + d * 0.6; h1 = S_old.ray_cast(o, -d); h2 = S_new.ray_cast(o, -d)
            if h1[0] and h2[0]: dd.append(((h2[0] - D.C).length - (h1[0] - D.C).length, az, el))
    mx = max(dd); mn = min(dd); mean = sum(x[0] for x in dd) / len(dd)
    return (mx[0] < 0.0015 and mn[0] > -0.0035, f'{len(dd)} hướng: lệch {mn[0] * 1000:+.1f} (phương vị {mn[1]}°, cao {mn[2]}°) … {mx[0] * 1000:+.1f} mm (pv {mx[1]}°, cao {mx[2]}°), trung bình {mean * 1000:+.1f} mm; ngưỡng −3,5…+1,5 (tóc dày ≥ 4 mm)')


def gaze_test(asm):
    set_keys(asm); vs, ps, _ = ev_mesh(asm); bv = BVHTree.FromPolygons(vs, ps); res = []; bad = 0
    for k in ('L', 'R'):
        eb = bpy.data.objects[f'Nhan_Cau.{k}']; mw = eye_world(k)
        for yaw, pitch in ((0, 0), (18, 0), (-18, 0), (0, -10), (12, -6)):
            eb.rotation_euler = (math.radians(pitch), 0, math.radians(yaw)); bpy.context.view_layer.update()
            dg = bpy.context.evaluated_depsgraph_get(); ev = eb.evaluated_get(dg); me = ev.to_mesh()
            pts = [ev.matrix_world @ me.vertices[i].co for p in me.polygons if p.material_index == 1 for i in p.vertices]
            on = max(abs((mw.inverted() @ p).length - 1) for p in pts)
            c = sum(pts, Vector()) / len(pts); ev.to_mesh_clear()
            o = c + Vector((0, -0.5, 0)); h = bv.ray_cast(o, Vector((0, 1, 0)))
            vis = not h[0] or h[3] > (c - o).length - 0.0005
            bad += (on > 1e-3) + (not vis); res.append(f'{k}{yaw:+d}/{pitch:+d}:{"thấy" if vis else "KHUẤT"}')
        eb.rotation_euler = (0, 0, 0)
    bpy.context.view_layer.update()
    return (bad == 0, 'con ngươi nằm trên nhãn cầu (lệch < 0,1%), tâm con ngươi nhìn thấy từ trước: ' + ' '.join(res))


def mouth_open_test(asm):
    """Khe môi thật: tia từ trước vào giữa miệng trúng mặt khoang (vật liệu 3/4); lúc mở hàm thì nhiều tia trúng khoang, không tia nào xuyên ra sau đầu."""
    out = []; good = True
    for nm_, kv in (('trung_tinh', {}), ('mo_ham', {'Mo_Ham': 1})):
        set_keys(asm, **kv); vs, ps, mi = ev_mesh(asm); bv = BVHTree.FromPolygons(vs, ps); mz = to_world(Vector((0, 0, D.FACE['mouth_z']))).z
        n_k = n_t = 0; through = 0
        zs = [j * 0.0004 for j in range(-12, 13)] if nm_ == 'trung_tinh' else [j * 0.004 for j in range(-9, 5)]
        for i in range(-6, 7):
            for dz in zs:
                o = Vector((i * 0.004, -0.6, mz + dz)); h = bv.ray_cast(o, Vector((0, 1, 0))); n_t += 1
                if h[0] and mi[h[2]] in (3, 4): n_k += 1
                if h[0] and mi[h[2]] in (3, 4):
                    h2 = bv.ray_cast(h[0] + Vector((0, 0.0005, 0)), Vector((0, 1, 0)))
                    if not h2[0]: through += 1
        out.append(f'{nm_}: {n_k}/{n_t} tia thấy khoang, {through} xuyên ra ngoài')
        good &= through == 0 and (n_k > 0 if nm_ == 'trung_tinh' else n_k > 20)
    set_keys(asm); return good, '; '.join(out)


def jaw_shape_test(asm):
    """Mở hàm: cằm không tóp (bề ngang hàm ở mức cằm−1 cm còn ≥ 85%), má không sụp (điểm má z miệng không lùi vào > 2 mm), khoé miệng không rách (cạnh khoé giãn < 3×)."""
    def width_at(vs, zc, ymax):
        xs = [abs(v.x) for v in vs if abs(v.z - zc) < 0.003 and v.y < ymax]; return 2 * max(xs) if xs else 0
    set_keys(asm); v0, p0, _ = ev_mesh(asm)
    chin0 = min(v.z for v in v0 if abs(v.x) < 0.003 and v.y < -0.12 and v.z > 0.86); w0 = width_at(v0, chin0 + 0.03, -0.08)
    set_keys(asm, Mo_Ham=1); v1, p1, _ = ev_mesh(asm)
    chin1 = min(v.z for v in v1 if abs(v.x) < 0.003 and v.y < -0.12 and v.z > 0.86); w1 = width_at(v1, chin1 + 0.03, -0.08)
    cheek0 = min((v.y for v in v0 if abs(v.x - 0.13) < 0.012 and abs(v.z - to_world(Vector((0, 0, 1.12))).z) < 0.008), default=0)
    cheek1 = min((v.y for v in v1 if abs(v.x - 0.13) < 0.012 and abs(v.z - to_world(Vector((0, 0, 1.12))).z) < 0.008), default=0)
    M = HEAD_IDX['mouth']; me = asm.data; kb0 = me.shape_keys.key_blocks['Basis']; kb1 = me.shape_keys.key_blocks['Mo_Ham']; amap = ASM_MAP
    st = 0.0
    for li in range(1, 5):
        c = amap[M[li][3]]
        for nb in (amap[M[li][2]], amap[M[li][4]], amap[M[li - 1][3]]):
            l0 = (kb0.data[c].co - kb0.data[nb].co).length; l1 = (kb1.data[c].co - kb1.data[nb].co).length; st = max(st, l1 / max(l0, 1e-6))
    set_keys(asm)
    ok_ = w1 >= 0.85 * w0 and cheek1 - cheek0 < 0.003 and st < 3.5
    return ok_, f'cằm hạ {(chin0 - chin1) * 1000:.0f} mm; bề ngang hàm {w0 * 1000:.0f} → {w1 * 1000:.0f} mm; má (x 13 cm) lùi {(cheek1 - cheek0) * 1000:+.1f} mm; cạnh khoé giãn tối đa {st:.2f}×'


def brow_test(asm):
    set_keys(asm); vs, ps, _ = ev_mesh(asm); bv = BVHTree.FromPolygons(vs, ps); deep = 0.0; gap = 0.0; n = 0
    for k in ('L', 'R'):
        o = bpy.data.objects[f'Eyebrow.{k}']; ev = o.evaluated_get(bpy.context.evaluated_depsgraph_get()); me = ev.to_mesh()
        pts = [ev.matrix_world @ v.co for v in me.vertices]; ev.to_mesh_clear(); dmin = 9.0
        for p in pts:
            hit, nrm, _, d = bv.find_nearest(p); s = (p - hit).dot(nrm); n += 1
            if s < 0: deep = max(deep, d)
            dmin = min(dmin, s)
        gap = max(gap, dmin)
    return (deep < 0.0015 and gap < 0.0008, f'{n} đỉnh mày: lún vào da sâu nhất {deep * 1000:.2f} mm (đáy mày chạm da), mặt gần da nhất cách {gap * 1000:.2f} mm')


def ear_test(asm):
    set_keys(asm); vs, ps, _ = ev_mesh(asm); bv = BVHTree.FromPolygons(vs, ps); worst = 0.0
    for k in ('L', 'R'):
        o = bpy.data.objects[f'Ear.{k}']; vg = o.vertex_groups['goc'].index; sub = o.modifiers.get('Subdivision'); sub.show_viewport = False   # đo đỉnh gốc sau Shrinkwrap, trước Subdivision
        bpy.context.view_layer.update(); ev = o.evaluated_get(bpy.context.evaluated_depsgraph_get()); me = ev.to_mesh()
        root = [i for i, v in enumerate(o.data.vertices) if any(g.group == vg and g.weight > 0.95 for g in v.groups)]
        for i in root:
            p = ev.matrix_world @ me.vertices[i].co; hit, nrm, _, d = bv.find_nearest(p)
            worst = max(worst, d)
        ev.to_mesh_clear(); sub.show_viewport = True
    return (worst < 0.0025, f'gốc tai (trọng số > 0,95) cách da tối đa {worst * 1000:.2f} mm (Shrinkwrap offset 2 mm, như tai cũ ±2,3 mm); ngưỡng 2,5')


def report(res):
    for k, (ok, msg) in res.items(): print(f'{"PASS" if ok else "FAIL"} {k} — {msg}')
    return all(ok for ok, _ in res.values())


# ================================================================== RENDER
CLAY = '#b8b0a8'
HC = 1.185   # tâm khung đầu (thế giới)
HVIEWS = {'truoc': ((0, -4, HC), 0.66), 'nghieng': ((-4, 0, HC), 0.66), 'sau': ((0, 4, HC), 0.66), 'goc34': ((-2.83, -2.83, HC), 0.66)}


def set_version(ver, hair=True):
    oc = bpy.data.collections[OLD_COLL]; nc = bpy.data.collections[NEW_COLL]
    oc.hide_render = ver != 'cu'; nc.hide_render = ver == 'cu'
    bpy.data.objects['Nam_Dau_Than'].hide_render = ver == 'cu'; bpy.data.objects['Nam_Dau_Than_cu'].hide_render = ver != 'cu'
    for o in bpy.data.collections['03_Head_And_Face'].objects: o.hide_render = o.name == 'Head_Base'
    bpy.data.objects['Nam_Dau_Cage'].hide_render = True
    bpy.data.collections['04_Hair'].hide_render = not hair


def shot(sc, out, name, loc, target, scale, res=(640, 640), clay=False):
    vl = sc.view_layers[0]; vl.material_override = bpy.data.materials.get('Dat_Set') or D.mat('Dat_Set', CLAY, 0.7) if clay else None
    sc.render.resolution_x, sc.render.resolution_y = res; sc.camera = T.cam(sc, 'cam_' + name, loc, target, scale)
    f = os.path.join(out, name + '.png'); sc.render.filepath = f; bpy.ops.render.render(write_still=True); vl.material_override = None; return f


def render_all(sc, out, samples):
    os.makedirs(out, exist_ok=True); sc.cycles.samples = samples; files = []
    asm = bpy.data.objects['Nam_Dau_Than']; set_keys(asm)
    for ver in ('cu', 'moi'):
        for hair in (False, True):
            set_version(ver, hair)
            for n, (loc, scl) in HVIEWS.items():
                files.append(shot(sc, out, f'{ver}_{"toc" if hair else "tran"}_{n}', loc, (0, 0, HC), scl))
    set_version('moi', False)
    for n, (loc, scl) in HVIEWS.items(): files.append(shot(sc, out, f'moi_datset_{n}', loc, (0, 0, HC), scl, clay=True))
    # cage dây và Subdivision (đầu, hệ thế giới qua Cum_Dau)
    head = bpy.data.objects['Nam_Dau_Cage']; others = [o for o in sc.objects if not o.hide_render and o.type in ('MESH', 'CURVE') and o.name != 'San']
    for o in others: o.hide_render = True
    head.hide_render = False; sub = head.modifiers['Subsurf']
    wire = head.copy(); wire.data = head.data.copy(); wire.name = 'Cage_Day'; head.users_collection[0].objects.link(wire); wire.modifiers.remove(wire.modifiers['Subsurf'])
    wm = wire.modifiers.new('Day', 'WIREFRAME'); wm.thickness = 0.0012; wm.use_replace = True; wire.data.materials.clear(); wire.data.materials.append(D.mat('Day_Den', '#202020', 0.8))
    for mode in ('day', 'min'):
        sub.show_render = mode == 'min'; wire.hide_render = mode == 'min'; head.hide_render = False
        if mode == 'day':
            head.modifiers['Subsurf'].show_render = False
        for n, (loc, scl) in HVIEWS.items(): files.append(shot(sc, out, f'cage_{mode}_{n}', loc, (0, 0, HC), scl, clay=True))
    sub.show_render = True; bpy.data.objects.remove(wire, do_unlink=True); head.hide_render = True
    for o in others: o.hide_render = False
    # cận mắt, miệng, nối cổ (có màu, có tóc)
    set_version('moi', True)
    eL = to_world(D.EYE_FRAMES[1][0]); mz = to_world(Vector((0, 0, D.FACE['mouth_z']))).z
    mo = to_world(Vector(D.MOUTH_FRAME['p']))   # miệng thật (thế giới, y ≈ −0,243); nhắm y = −0,15 thì miệng ra ngoài khung ±8,5 cm
    close = {'can_mat_truoc': ((eL.x, -3, eL.z), (eL.x, 0, eL.z), 0.17), 'can_mat_34': ((eL.x + 2.0, -2.6, eL.z), (eL.x, eL.y, eL.z), 0.19),
             'can_mieng_truoc': ((0, -3, mz), (0, 0, mz), 0.15), 'can_mieng_nghieng': ((-3, mo.y + 0.03, mo.z), (0, mo.y + 0.03, mo.z), 0.17),
             'can_co_truoc': ((0, -3, 0.93), (0, 0, 0.93), 0.30), 'can_co_nghieng': ((-3, 0, 0.93), (0, 0, 0.93), 0.30), 'can_co_sau': ((0, 3, 0.93), (0, 0, 0.93), 0.30)}
    for n, (loc, tg, scl) in close.items(): files.append(shot(sc, out, n, loc, tg, scl, (600, 600)))
    for ver in ('cu', 'moi'):
        set_version(ver, True)
        for n in ('can_mat_truoc', 'can_mieng_truoc', 'can_co_nghieng'):
            loc, tg, scl = close[n]; files.append(shot(sc, out, f'{ver}_{n}', loc, tg, scl, (600, 600)))
    # các shape key (trước + nghiêng)
    set_version('moi', True)
    for kn in ('Nham_Mat', 'Mo_Mat', 'Mo_Ham', 'Cuoi_Nhe'):
        set_keys(asm, **{kn: 1.0})
        for n in ('truoc', 'nghieng'):
            loc, scl = HVIEWS[n]; files.append(shot(sc, out, f'key_{kn}_{n}', loc, (0, 0, HC), scl, (520, 520)))
    set_keys(asm)
    for yaw, pitch, n in ((18, 0, 'phai'), (-18, 0, 'trai'), (0, -10, 'xuong')):
        for k in ('L', 'R'): bpy.data.objects[f'Nhan_Cau.{k}'].rotation_euler = (math.radians(pitch), 0, math.radians(yaw))
        files.append(shot(sc, out, f'nhin_{n}', (0, -3, eL.z), (0, 0, eL.z), 0.34, (600, 380)))
    for k in ('L', 'R'): bpy.data.objects[f'Nhan_Cau.{k}'].rotation_euler = (0, 0, 0)
    # toàn thân cũ/mới
    for ver in ('cu', 'moi'):
        set_version(ver, True); files.append(shot(sc, out, f'{ver}_toan_than', (0, -6, 0.80), (0, 0, 0.80), 1.72, (560, 900)))
    set_version('moi', True); return files


def render_clip(sc, out, samples=8):
    """Clip thử: nhắm mắt → mở hàm → cười nhẹ → nhìn trái/phải (trước + 3/4 ghép ngang)."""
    os.makedirs(out, exist_ok=True); asm = bpy.data.objects['Nam_Dau_Than']; set_version('moi', True); sc.cycles.samples = samples
    kb = asm.data.shape_keys.key_blocks
    def env(f, a, b):   # 0→1→0 trong [a, b]
        if f <= a or f >= b: return 0.0
        t = (f - a) / (b - a); return math.sin(math.pi * t) ** 2
    frames = 96; files = []
    for fr in range(frames):
        vals = {'Nham_Mat': env(fr, 2, 26), 'Mo_Ham': env(fr, 26, 54), 'Cuoi_Nhe': env(fr, 54, 80)}
        for x in kb[1:]: x.value = vals.get(x.name, 0.0)
        yaw = 18 * math.sin(2 * math.pi * (fr - 80) / 16) if fr >= 80 else 0
        for k in ('L', 'R'): bpy.data.objects[f'Nhan_Cau.{k}'].rotation_euler = (0, 0, math.radians(yaw))
        bpy.context.view_layer.update()
        for n, loc in (('a', (0, -4, HC - 0.02)), ('b', (-2.83, -2.83, HC - 0.02))):
            files.append(shot(sc, out, f'{n}_{fr:03d}', loc, (0, 0, HC - 0.02), 0.52, (400, 400)))
    for k in ('L', 'R'): bpy.data.objects[f'Nhan_Cau.{k}'].rotation_euler = (0, 0, 0)
    set_keys(asm)
    mp4 = os.path.join(out, 'thu_bieu_cam.mp4')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '24', '-i', os.path.join(out, 'a_%03d.png'), '-framerate', '24', '-i', os.path.join(out, 'b_%03d.png'),
                    '-filter_complex', 'hstack=inputs=2', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '20', mp4], check=False)
    return mp4


# đối chiếu ảnh mẫu NAM — 3D TURNAROUND (mau-3d-xoay.webp, 1536×1024): đỉnh lọn tóc hàng 44, sàn hàng 545 (cả hai hình hàng trên);
# trục: trước = giữa cổ cột 346, nghiêng (mặt quay phải) = giữa cổ cột 1191, đo ở hàng 262 ngay dưới cằm.
MAU = dict(top=44, floor=545, row_c=262, axes={'truoc': 346, 'nghieng': 1191}, y0=20, h=280, w=240)


def overlay_mau(sc, out, mau):
    import numpy as np
    if not mau or not os.path.exists(mau): print('CHƯA ĐỐI CHIẾU MẪU: thiếu ảnh'); return
    S = 1.6004 / (MAU['floor'] - MAU['top']); W, H = MAU['w'], MAU['h']; ref = B._img_np(os.path.abspath(mau)); bg = ref[5, 5, :3]
    mref = np.abs(ref[..., :3] - bg).sum(2) > 40 / 255
    zc = 1.6004 - (MAU['y0'] + H / 2 - MAU['top']) * S; ycn = T.neck_target()[3]
    sc.render.film_transparent = True; san = bpy.data.objects.get('San'); san.hide_render = True
    sc.render.resolution_x, sc.render.resolution_y = W, H
    for ver in ('cu', 'moi'):
        set_version(ver, True)
        for v, loc, tg in (('truoc', (0, -6, zc), (0, 0, zc)), ('nghieng', (-6, ycn, zc), (0, ycn, zc))):
            sc.camera = T.cam(sc, f'sil_{v}', loc, tg, H * S); f = os.path.join(out, f'sil_{ver}_{v}.png'); sc.render.filepath = f; bpy.ops.render.render(write_still=True)
    sc.render.film_transparent = False; san.hide_render = False
    print('--- đối chiếu mẫu (cùng tỉ lệ theo chiều cao toàn thân; mm từ trục: trái/phải hoặc trước/sau — mẫu | cũ | mới):')
    for v in ('truoc', 'nghieng'):
        x0 = int(MAU['axes'][v] - W / 2); crop = ref[MAU['y0']:MAU['y0'] + H, x0:x0 + W, :3]; mc = mref[MAU['y0']:MAU['y0'] + H, x0:x0 + W]
        o = np.ones((H, W, 4), dtype=np.float32); o[..., :3] = 0.45 + 0.55 * crop
        ms = {}
        for ver, col in (('cu', (0.1, 0.3, 0.95)), ('moi', (0.9, 0.05, 0.05))):
            sil = B._img_np(os.path.join(out, f'sil_{ver}_{v}.png')); m = sil[..., 3] > 0.5; ms[ver] = m
            er = m.copy(); er[1:] &= m[:-1]; er[:-1] &= m[1:]; er[:, 1:] &= m[:, :-1]; er[:, :-1] &= m[:, 1:]; o[m & ~er, :3] = col
        B._save_np(np.kron(o, np.ones((3, 3, 1), dtype=np.float32)), os.path.join(out, f'so_mau_{v}.png'))
        for row in range(70, 250, 15):
            z = 1.6004 - (MAU['y0'] + row - MAU['top']) * S; vals = []
            for m in (mc, ms['cu'], ms['moi']):
                r = B._run_at(m[row], W / 2); vals.append((round((W / 2 - r[0]) * S * 1000), round((r[1] - W / 2) * S * 1000)) if r else None)
            print(f'    {v:8s} z {z:.3f}  mẫu {vals[0]}  cũ {vals[1]}  mới {vals[2]}')


# ================================================================== chạy
if __name__ == '__main__':
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    ap = argparse.ArgumentParser(); ap.add_argument('--check', action='store_true'); ap.add_argument('--render', default=''); ap.add_argument('--clip', default='')
    ap.add_argument('--blend', default=''); ap.add_argument('--samples', type=int, default=24); ap.add_argument('--mau', default='')
    a = ap.parse_args(argv)
    sc, head, asm, ASM_MAP, eyes = build(a)
    print(f'--- cage đầu: {len(head.data.vertices)} đỉnh nửa, {len(head.data.polygons)} mặt; bản lắp ráp {len(asm.data.vertices)} đỉnh cage')
    if a.blend: os.makedirs(os.path.dirname(os.path.abspath(a.blend)), exist_ok=True); bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))
    if a.render or a.clip or a.mau:
        T.lights(sc)
    if a.render: print('ảnh:', len(render_all(sc, os.path.abspath(a.render), a.samples)))
    if a.mau: overlay_mau(sc, os.path.abspath(a.render or a.clip or '.'), a.mau)
    if a.clip: print('clip:', render_clip(sc, os.path.abspath(a.clip)))
    if a.check:
        ok = report(check_all(sc, head, asm, ASM_MAP)); print('KẾT QUẢ:', 'TẤT CẢ PASS' if ok else 'CÒN FAIL'); sys.stdout.flush(); os._exit(0 if ok else 1)
