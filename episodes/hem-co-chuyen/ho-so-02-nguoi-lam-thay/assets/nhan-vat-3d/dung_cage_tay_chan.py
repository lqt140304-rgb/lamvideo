"""Nối bàn tay / bàn chân vào cage thân thành MỘT lưới liền da (THIET-KE-NOI-TAY-CHAN.md, cách A).

Cage thân (dung_than_cage_nam.py, không sửa) → bỏ nắp cuối ống tay/chân → cage tay (vòng 8 qua cổ tay, đổi mật độ 8→12 ở lòng tay,
4 ngón vòng 6, ngón cái vòng 8) và cage chân (ống bàn chân vòng 12, ô 2×2 mặt trên nối ống chân, 5 ngón vòng 4) → lắp ráp (Mirror +
Subdivision 2 như thân) → ép hình bám bàn tay/bàn chân đã duyệt (dung_tay_nam / dung_chan_nam, đặt như gan_tay_chan_nam).

Chạy:  bpyv/bin/python dung_cage_tay_chan.py --check --render DIR --blend OUT.blend --samples 24 [--chua-ep]
"""
import sys, os, math, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
import numpy as np
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree
import dung_than_cage_nam as C
import dung_than_nam as T

KZ = T.KZ


# ================================================================== kiểm topology
def _world(ob):
    me = ob.data; a = np.zeros(len(me.vertices) * 3); me.vertices.foreach_get('co', a); a = a.reshape(-1, 3)
    return (np.array(ob.matrix_world) @ np.c_[a, np.ones(len(a))].T).T[:, :3]


def arm_frame():
    """Tâm vòng cổ tay của cage, trục cẳng tay (khuỷu → cổ tay), tâm khuỷu."""
    c_w = Vector(C.ARM_RINGS[-1]['c']); c_e = Vector(C.ARM_RINGS[-3]['c']); d = (c_w - Vector(C.ARM_RINGS[-2]['c'])).normalized()
    return c_w, d, c_e


def _zones(P):
    """Mặt nạ vùng nối cổ tay (±4 cm dọc trục cẳng tay quanh cổ tay) và mắt cá (z 0,04–0,16 quanh trục ống chân), hai bên."""
    c_w, d, _ = arm_frame(); out = {}
    for sg in (1.0, -1.0):
        cw = np.array((sg * c_w.x, c_w.y, c_w.z)); dd = np.array((sg * d.x, d.y, d.z)); rel = P - cw; u = rel @ dd
        rad = np.linalg.norm(rel - np.outer(u, dd), axis=1); out[f'co_tay_{sg:+.0f}'] = (np.abs(u) < 0.04) & (rad < 0.08)
        lc = next(r for r in C.LEG_RINGS if r['ten'] == 'mat_ca')['c']; rr = np.hypot(P[:, 0] - sg * lc[0], P[:, 1] - lc[1])
        out[f'mat_ca_{sg:+.0f}'] = (P[:, 2] > 0.04) & (P[:, 2] < 0.16) & (rr < 0.10)
    return out


def check_topology(asm, base_asm=None):
    """1 mảnh, 0 cạnh hở, 0 cạnh > 2 mặt, chỉ tứ giác vùng nối, có bàn tay/bàn chân trong lưới, thân ngoài chi không đổi, chiều cao, thể tích dương."""
    res = {}
    def rec(k, ok, msg): res[k] = (bool(ok), msg); print(f'    {"PASS" if ok else "FAIL"}  {k}: {msg}')
    bm = bmesh.new(); bm.from_mesh(asm.data); bm.transform(asm.matrix_world); bm.verts.ensure_lookup_table()
    seen, parts = set(), 0
    for v in bm.verts:
        if v in seen: continue
        parts += 1; st = [v]
        while st:
            x = st.pop()
            if x in seen: continue
            seen.add(x); st += [e.other_vert(x) for e in x.link_edges]
    n_open = sum(1 for e in bm.edges if len(e.link_faces) == 1); n_nm = sum(1 for e in bm.edges if len(e.link_faces) > 2)
    rec('mot_manh', parts == 1, f'{parts} mảnh liền'); rec('canh_ho', n_open == 0, f'{n_open} cạnh hở'); rec('canh_tren_2_mat', n_nm == 0, f'{n_nm} cạnh > 2 mặt')
    vol = bm.calc_volume(signed=True); rec('the_tich_duong', vol > 0, f'thể tích có hướng {vol * 1000:.2f} lít')
    P = np.array([tuple(v.co) for v in bm.verts]); zs = _zones(P); bad = {}
    for f in bm.faces:
        if len(f.verts) == 4: continue
        for k, m in zs.items():
            if all(m[v.index] for v in f.verts): bad[k] = bad.get(k, 0) + 1
    rec('chi_tu_giac_vung_noi', not bad, 'mặt không tứ giác trong vùng nối: ' + (str(bad) if bad else '0'))
    c_w, d, _ = arm_frame(); rel = P - np.array(c_w); u = rel @ np.array(d); rad = np.linalg.norm(rel - np.outer(u, np.array(d)), axis=1)
    n_ngon_tay = int(((u > 0.10) & (rad < 0.07) & (P[:, 0] > 0.15)).sum()); n_ngon_chan = int(((P[:, 1] < -0.13) & (P[:, 2] < 0.05) & (P[:, 0] > 0.02)).sum())
    rec('co_ban_tay_ban_chan', n_ngon_tay > 0 and n_ngon_chan > 0, f'đỉnh vùng ngón tay {n_ngon_tay}, vùng ngón chân {n_ngon_chan} (bên trái)')
    lo, hi = C._height(bpy.context.scene); rec('chieu_cao', abs(lo) <= 0.001 and abs(hi - C.H_TARGET) <= C.H_TOL, f'đáy {lo * 1000:.1f} mm, đỉnh {hi:.4f} m')
    if base_asm is not None:
        Q = _world(base_asm); _, _, c_e = arm_frame()
        u_e = np.abs(Q[:, 0]) > 0.0                                   # mọi đỉnh
        arm = (np.abs(Q[:, 0]) > 0.16) & (Q[:, 2] < c_e.z + 0.01); leg = Q[:, 2] < 0.26
        keep = ~(arm | leg); from mathutils.kdtree import KDTree
        kd = KDTree(len(P))
        for i, p in enumerate(P): kd.insert(Vector(p), i)
        kd.balance(); dmax = max(kd.find(Vector(q))[2] for q in Q[keep][::5])
        rec('than_ngoai_chi_khong_doi', dmax <= 0.0001, f'lệch lớn nhất {dmax * 1000:.3f} mm (trên khuỷu, trên gối)')
    bm.free(); return res


def ok_all(res): return all(v[0] for v in res.values())


# ================================================================== cage tay / chân
import dung_tay_nam as HT
import dung_chan_nam as FT
CAGE_K_TAY = 1.12          # vòng cage tay rộng hơn tiết diện đích: Subdivision co bề mặt vào trong vỏ cage
CAGE_K_CHAN = 1.10


def hand_xf():
    """Biến đổi toạ độ bàn tay (dung_tay_nam, chưa nén) → thế giới cổ tay cage: co KZ, xoay trục ngón theo trục cẳng tay, dời về tâm cổ tay."""
    c_w, d, _ = arm_frame(); R = HT._D.normalized().rotation_difference(d).to_matrix()
    return lambda p: c_w + R @ ((Vector(p) - HT.WRIST) * KZ)


def _ring_uvw(u, cv, cw, av, aw, n=8, e=2.0):
    """Vòng n đỉnh trong mặt (v, w) của khung bàn tay tại u; (0,−aw) mu tay, (−av,0) phía ngón cái, (0,+aw) lòng tay, (+av,0) phía ngón út."""
    pts = []
    for j in range(n):
        th = 2 * math.pi * j / n; s_, c_ = math.sin(th), math.cos(th)
        v = cv - av * math.copysign(abs(s_) ** (2 / e), s_); w = cw - aw * math.copysign(abs(c_) ** (2 / e), c_); pts.append(HT.L(u, v, w))
    return pts


def _ring_axis(c, t, r1, r2, n, ref):
    """Vòng n đỉnh quanh trục t tại c (r1 theo hướng ref chiếu vuông góc t, r2 theo hướng còn lại)."""
    t = Vector(t).normalized(); e1 = (Vector(ref) - t * Vector(ref).dot(t)).normalized(); e2 = t.cross(e1)
    return [Vector(c) + e1 * (r1 * math.cos(2 * math.pi * j / n)) + e2 * (r2 * math.sin(2 * math.pi * j / n)) for j in range(n)]


def connect(bm, A, B, faces):
    """Nối hai vòng cùng số đỉnh bằng tứ giác, tự chọn độ xoay + chiều để tổng độ dài cạnh nối nhỏ nhất."""
    n = len(A); assert n == len(B), (n, len(B)); best = None
    for dr in (1, -1):
        for s_ in range(n):
            Bs = [B[(s_ + dr * i) % n] for i in range(n)]; L_ = sum((A[i].co - Bs[i].co).length for i in range(n))
            if best is None or L_ < best[0]: best = (L_, Bs)
    Bs = best[1]
    for i in range(n): faces.append(bm.faces.new((A[i], A[(i + 1) % n], Bs[(i + 1) % n], Bs[i])))
    return Bs


def _boundary_loop(bm, verts):
    """Xếp các cạnh biên (1 mặt) có cả hai đỉnh trong `verts` thành vòng liên tiếp."""
    vs = set(verts); edges = [e for e in bm.edges if len(e.link_faces) == 1 and all(v in vs for v in e.verts)]
    nb = {}
    for e in edges:
        a, b = e.verts; nb.setdefault(a, []).append(b); nb.setdefault(b, []).append(a)
    start = edges[0].verts[0]; loop = [start]; prev = None; cur = start
    while True:
        nxt = [x for x in nb[cur] if x is not prev][0]
        if nxt is start: break
        loop.append(nxt); prev, cur = cur, nxt
    return loop


def add_hand(bm, lay):
    """Bỏ nắp ống cẳng tay, dựng cage bàn tay trái nối vào vòng cổ tay. Trả số mặt đã tạo."""
    c_w, d, _ = arm_frame(); X = hand_xf(); faces = []
    cap = [v for v in bm.verts if v[lay['tay']] > 0.5 and (v.co - c_w).dot(d) > 0.004]
    bmesh.ops.delete(bm, geom=cap, context='VERTS')
    wrist = _boundary_loop(bm, [v for v in bm.verts if v[lay['tay']] > 0.5 and abs((v.co - c_w).dot(d)) < 0.01])
    def V(p):
        v = bm.verts.new(p); v[lay['tay']] = 1.0; v[lay['moi']] = 1.0; return v
    K = CAGE_K_TAY
    # các vòng 8 đỉnh: cổ tay tròn → lòng tay dẹt (đoạn chuyển ~5 cm, cùng số đỉnh)
    A = [V(X(p)) for p in _ring_uvw(0.014, 0.0, 0.0, 0.036 * K, 0.028 * K, e=2.0)]
    B = [V(X(p)) for p in _ring_uvw(0.032, 0.0, 0.0, 0.052 * K, 0.028 * K, e=2.4)]
    Cc = [V(X(p)) for p in _ring_uvw(0.050, 0.0, -0.001, 0.064 * K, 0.027 * K, e=2.8)]
    A = connect(bm, wrist, A, faces)
    # ô ngón cái (2×2) ở mặt bên phía ngón cái (j 1..3) giữa A, B, Cc: không tạo 4 mặt đó, đỉnh giữa B[2] bỏ
    for R0, R1 in ((A, B), (B, Cc)):
        R1[:] = connect_keep(bm, R0, R1, faces, skip={1, 2})
    th_loop = [A[1], A[2], A[3], B[3], Cc[3], Cc[2], Cc[1], B[1]]
    bmesh.ops.delete(bm, geom=[B[2]], context='VERTS') if not B[2].link_faces else None
    # vòng 12 (đổi mật độ 8→12: một cạnh mu và một cạnh lòng chia 1→3) tại u 0,066
    D = _ring12(bm, V, X, Cc, faces, K)
    # mặt đầu lòng tay lưới 4×2 → 4 ngón vòng 6
    _fingers(bm, V, X, D, faces, K)
    _thumb(bm, V, X, th_loop, faces, K)
    return len(faces)


def connect_keep(bm, A, B, faces, skip):
    """Như connect nhưng KHÔNG tạo mặt i ∈ skip (i: cạnh A[i]–A[i+1]); trả B đã xoay khớp A."""
    n = len(A); best = None
    for dr in (1, -1):
        for s_ in range(n):
            Bs = [B[(s_ + dr * i) % n] for i in range(n)]; L_ = sum((A[i].co - Bs[i].co).length for i in range(n))
            if best is None or L_ < best[0]: best = (L_, Bs)
    Bs = best[1]
    for i in range(n):
        if i in skip: continue
        faces.append(bm.faces.new((A[i], A[(i + 1) % n], Bs[(i + 1) % n], Bs[i])))
    return Bs


def _ring12(bm, V, X, Cc, faces, K):
    """Vòng 12 tại u 0,066; Cc (8, đã khớp thứ tự với vòng A: 0 mu, 2 ngón cái, 4 lòng, 6 ngón út). Mu & lòng mỗi bên 4 cạnh."""
    u = 0.066; av, aw = 0.068 * K, 0.026 * K
    vs = [-av, -av * 0.5, 0.0, av * 0.5, av]                       # 5 đỉnh ngang (từ phía ngón cái → ngón út)
    dor = [V(X(HT.L(u, v, -aw * (0.85 if abs(v) > av * 0.9 else 1.0)))) for v in vs]
    pal = [V(X(HT.L(u, v, aw * (0.85 if abs(v) > av * 0.9 else 1.0)))) for v in vs]
    fm = V(X(HT.L(u, -av * 1.08, 0.0))); bmid = V(X(HT.L(u, av * 1.08, 0.0)))
    # Cc: 0 mu giữa, 1 góc mu–ngón cái, 2 bên ngón cái, 3 góc lòng–ngón cái, 4 lòng giữa, 5 góc lòng–ngón út, 6 bên ngón út, 7 góc mu–ngón út
    q = lambda a, b, c, d: faces.append(bm.faces.new((a, b, c, d)))
    q(Cc[1], Cc[2], fm, dor[0]); q(Cc[2], Cc[3], pal[0], fm)                  # bên ngón cái
    q(Cc[5], Cc[6], bmid, pal[4]); q(Cc[6], Cc[7], dor[4], bmid)              # bên ngón út
    q(Cc[0], Cc[1], dor[0], dor[1])                                           # mu: cạnh (0,1) → 1 cạnh
    _one_to_three(bm, V, Cc[7], Cc[0], [dor[4], dor[3], dor[2], dor[1]], faces)   # mu: cạnh (7,0) → 3 cạnh
    q(Cc[4], Cc[3], pal[0], pal[1]) if False else q(Cc[3], Cc[4], pal[1], pal[0])  # lòng: cạnh (3,4) → 1 cạnh
    _one_to_three(bm, V, Cc[4], Cc[5], [pal[1], pal[2], pal[3], pal[4]], faces)    # lòng: cạnh (4,5) → 3 cạnh
    return dict(dor=dor, pal=pal, fm=fm, bm=bmid)


def _one_to_three(bm, V, p0, p1, q, faces):
    """Chuyển tiếp tứ giác 1 cạnh (p0,p1) → 3 cạnh (q0..q3) bằng 2 đỉnh trong c0, c1 (4 tứ giác, không tam giác)."""
    c0 = V(p0.co * 0.55 + q[1].co * 0.45); c1 = V(p1.co * 0.55 + q[2].co * 0.45)
    for f in ((p0, c0, q[1], q[0]), (c0, c1, q[2], q[1]), (c1, p1, q[3], q[2]), (p0, p1, c1, c0)): faces.append(bm.faces.new(f))


def _fingers(bm, V, X, D, faces, K):
    """Hàng giữa đầu lòng tay (3 đỉnh trong) + 4 ngón ống vòng 6 (gốc + 3 khớp + nắp 1×2)."""
    dor, pal, fm, bmid = D['dor'], D['pal'], D['fm'], D['bm']; u = 0.080
    mid = [fm] + [V(X(HT.L(u, (dor[k].co - dor[k].co).length * 0 + [-0.036, 0.0, 0.036][k - 1] * K, 0.0))) for k in (1, 2, 3)] + [bmid]
    for k, f in enumerate(HT.FINGERS):
        base = [dor[k], dor[k + 1], mid[k + 1], pal[k + 1], pal[k], mid[k]]
        pts, rads = HT.finger_pts(f); prev = base
        for i in (1, 2, 3):
            t = pts[min(i, 3)] - pts[i - 1]; r = rads[i] * K
            ring = [V(X(p)) for p in _ring_axis(pts[i] if i < 3 else pts[3] - t.normalized() * r * 0.2, t, r, r * 1.05, 6, HT._N)]
            prev = connect(bm, prev, ring, faces)
        tip = [V(X(p)) for p in _ring_axis(pts[3] + (pts[3] - pts[2]).normalized() * rads[3] * 0.7, pts[3] - pts[2], rads[3] * 0.6 * K, rads[3] * 0.6 * K, 6, HT._N)]
        tip = connect(bm, prev, tip, faces)
        faces.append(bm.faces.new((tip[0], tip[1], tip[2], tip[3]))); faces.append(bm.faces.new((tip[3], tip[4], tip[5], tip[0])))


def _thumb(bm, V, X, loop, faces, K):
    """Ngón cái: vòng 8 nối ô 2×2 mặt bên, 3 vòng khớp theo THUMB_PTS, nắp 2×2 (1 đỉnh trong)."""
    tp = [Vector(HT.L(*t)) for t in HT.THUMB_PTS]; prev = loop
    for i in (1, 2, 3):
        t = tp[i] - tp[i - 1]; r = HT.THUMB_R[i] * K
        ring = [V(X(p)) for p in _ring_axis(tp[i], t, r, r, 8, HT._N)]; prev = connect(bm, prev, ring, faces)
    t = (tp[3] - tp[2]).normalized(); r = HT.THUMB_R[3] * 0.6 * K
    tip = [V(X(p)) for p in _ring_axis(tp[3] + t * HT.THUMB_R[3] * 0.7, t, r, r, 8, HT._N)]; tip = connect(bm, prev, tip, faces)
    c = V(X(tp[3] + t * HT.THUMB_R[3] * 1.0))
    for j in (0, 2, 4, 6): faces.append(bm.faces.new((tip[j], tip[(j + 1) % 8], tip[(j + 2) % 8], c)))


def add_foot(bm, lay):
    """Bỏ vòng mắt cá + nắp ống chân; vòng chuyển ở mắt cá; ống bàn chân vòng 12 dọc y; ô 2×2 mặt trên nối ống chân; 5 ngón vòng 4."""
    faces = []; bc = next(r for r in C.LEG_RINGS if r['ten'] == 'bap_chan'); mc = next(r for r in C.LEG_RINGS if r['ten'] == 'mat_ca')
    drop = [v for v in bm.verts if v[lay['chan']] > 0.5 and v.co.z < bc['c'][2] - 0.02]
    bmesh.ops.delete(bm, geom=drop, context='VERTS')
    leg = _boundary_loop(bm, [v for v in bm.verts if v[lay['chan']] > 0.5 and abs(v.co.z - bc['c'][2]) < 0.02])
    def V(p):
        v = bm.verts.new(Vector(p)); v[lay['chan']] = 1.0; v[lay['moi']] = 1.0; return v
    K = CAGE_K_CHAN; cx, cy = mc['c'][0], mc['c'][1]
    ank = [V(p) for p in _ring_axis((cx, cy, 0.150), (0, 0, -1), mc['rx'] * 1.12, mc['ry'] * 1.12, 8, (1, 0, 0))]     # nới 12%: tránh eo thắt ở mắt cá
    ank = connect(bm, leg, ank, faces)
    # ống bàn chân: vòng 12 (mặt trên 5 cạnh, đáy 5, hai bên 1) tại các y; x từ ngoài (lớn) → trong
    Ys = [0.100, 0.078, 0.046, 0.012, -0.022, -0.052, -0.080, -0.104]
    rings = []
    for y in Ys:
        hw = float(np.interp(-y, -np.array(FT.PROFILE_Y), FT.PROFILE_HW)) * K; top = float(np.interp(-y, -np.array(FT.PROFILE_Y), FT.PROFILE_TOP)) * K
        if y == Ys[0]: hw *= 0.75; top *= 0.8
        even = np.array((1.0, 0.6, 0.2, -0.2, -0.6, -1.0)); wide = np.array((1.0, 0.80, 0.0, -0.80, -0.91, -1.0))   # vòng dưới mắt cá: ô nối rộng ~ống chân
        a_ = float(np.interp(y, [-0.104, -0.052, -0.022, 0.046, 0.078, 0.100], [0.0, 0.0, 1.0, 1.0, 0.5, 0.0])); ts = even * (1 - a_) + wide * a_
        xs = [FT.X0 + hw * t + (cx - FT.X0) * (1 - t * t) * a_ for t in ts]
        topr = [V((x, y, top * (0.80 if abs(x - FT.X0) > hw * 0.9 else 1.0))) for x in xs]
        bot = [V((x, y, -0.006)) for x in xs]
        rings.append(dict(top=topr, bot=bot))
    q = lambda a, b, c, d: faces.append(bm.faces.new((a, b, c, d)))
    patch_rows = (2, 3, 4)                                         # vòng y 0,046 / 0,012 / −0,022: ô mặt trên dưới mắt cá
    k0 = 1                                                          # ô nối: 3 đỉnh trên (t 0,80 / 0 / −0,80) của các vòng dưới mắt cá
    for i in range(len(rings) - 1):
        r0, r1 = rings[i], rings[i + 1]
        for k in range(5):
            if not (i in (2, 3) and k in (k0, k0 + 1)):               # bỏ 4 mặt trên của ô nối ống chân (đáy giữ nguyên)
                q(r0['top'][k], r0['top'][k + 1], r1['top'][k + 1], r1['top'][k])
            q(r0['bot'][k + 1], r0['bot'][k], r1['bot'][k], r1['bot'][k + 1])
        q(r0['top'][0], r1['top'][0], r1['bot'][0], r0['bot'][0]); q(r0['top'][5], r0['bot'][5], r1['bot'][5], r1['top'][5])
    bmesh.ops.delete(bm, geom=[rings[3]['top'][k0 + 1]], context='VERTS')
    patch = [rings[2]['top'][k0], rings[2]['top'][k0 + 1], rings[2]['top'][k0 + 2], rings[3]['top'][k0 + 2], rings[4]['top'][k0 + 2], rings[4]['top'][k0 + 1], rings[4]['top'][k0], rings[3]['top'][k0]]
    connect(bm, ank, patch, faces)
    r0 = rings[0]                                                   # nắp gót 5×1
    for k in range(5): q(r0['top'][k + 1], r0['top'][k], r0['bot'][k], r0['bot'][k + 1])
    rl = rings[-1]; toes = sorted(FT.TOES, key=lambda t: -t[0])     # cột ngón theo x giảm (ngoài → trong): ngón út … ngón cái
    dxs = [t[0] for t in toes]
    for k, (dx, y, r) in enumerate(toes):
        base = [rl['top'][k], rl['top'][k + 1], rl['bot'][k + 1], rl['bot'][k]]; prev = base; xc = FT.X0 + dx
        gap = min([abs(dx - o) for o in dxs if o != dx]); rx = min(r * 1.05, 0.45 * gap)      # ngón không chồng ngón bên cạnh (cage cũ: chồng → tự giao)
        y1 = min(y + r * 0.3, Ys[-1] - 0.010)                                               # vòng đầu ngón luôn ở trước vòng mũi bàn chân
        for yy, rr, kx in ((y1, 1.05, rx / r), (min(y - r * 0.7, y1 - 0.010), 0.85, 0.85 * rx / r)):
            ring = [V((xc + r * kx * sx_, yy, r + r * rr * sz)) for sx_, sz in ((1, 1), (-1, 1), (-1, -1.1), (1, -1.1))]
            prev = connect(bm, prev, ring, faces)
        faces.append(bm.faces.new((prev[0], prev[1], prev[2], prev[3])))
    return len(faces)


def build_cage_full(coll):
    """Nửa cage thân (C.build_cage) + cage tay/chân trái; Mirror + Subsurf giữ nguyên."""
    cage = C.build_cage(coll); bm = bmesh.new(); bm.from_mesh(cage.data)
    lay = {k: bm.verts.layers.float.get(k) for k in ('tay', 'chan')}; lay['moi'] = bm.verts.layers.float.get('moi') or bm.verts.layers.float.new('moi')
    nh = add_hand(bm, lay); nf = add_foot(bm, lay)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:]); bm.to_mesh(cage.data); bm.free(); cage.data.update()
    for p in cage.data.polygons: p.use_smooth = True
    print(f'    cage: thêm {nh} mặt tay, {nf} mặt chân')
    return cage


# ================================================================== hình đích + kiểm hình
import gan_tay_chan_nam as G


def _to_hand(P):
    """Toạ độ thế giới (tay trái) → toạ độ bàn tay dung_tay_nam (ngược hand_xf) → (u, v, w)."""
    c_w, d, _ = arm_frame(); R = np.array(HT._D.normalized().rotation_difference(d).to_matrix())
    Q = (P - np.array(c_w)) @ R / KZ + np.array(HT.WRIST); W = np.array(HT.WRIST)
    D_, S_, N_ = (np.array(x) for x in (HT._D, HT._S, HT._N)); rel = Q - W
    return rel @ D_, rel @ S_, rel @ N_, Q


def _seg_d(Q, pts):
    best = np.full(len(Q), np.inf)
    for a_, b_ in zip(pts, pts[1:]):
        a_, b_ = np.array(a_), np.array(b_); ab = b_ - a_; t = np.clip(((Q - a_) @ ab) / (ab @ ab), 0, 1)
        best = np.minimum(best, np.linalg.norm(Q - (a_ + t[:, None] * ab), axis=1))
    return best


def label_hand(P):
    """Nhãn từng đỉnh (tay trái, toạ độ thế giới): 'thumb', 'palm', hoặc tên ngón — cùng quy tắc cho lưới và hình đích."""
    u, v, w, Q = _to_hand(P); lab = np.full(len(P), 'palm', dtype=object)
    fd = np.stack([_seg_d(Q, [tuple(p) for p in HT.finger_pts(f)[0]]) for f in HT.FINGERS], 1); fl = np.array(HT.FINGERS, dtype=object)[np.argmin(fd, 1)]
    lab = np.where(u > 0.074, fl, lab)
    td = _seg_d(Q, [tuple(HT.L(*t)) for t in HT.THUMB_PTS[1:]] + [tuple(Vector(HT.L(*HT.THUMB_PTS[3])) + (Vector(HT.L(*HT.THUMB_PTS[3])) - Vector(HT.L(*HT.THUMB_PTS[2]))).normalized() * 0.02)])
    lab = np.where((td < 0.026) & (v < -0.058), 'thumb', lab); return lab


def label_foot(P):
    """Nhãn bàn chân trái: 'foot' hoặc 'toe0'..'toe4' (phía trước đường gốc ngón, theo tâm ngón gần nhất)."""
    lab = np.full(len(P), 'foot', dtype=object); xs = np.array([FT.X0 + t[0] for t in FT.TOES])
    k = np.argmin(np.abs(P[:, 0:1] - xs[None, :]), 1); front = P[:, 1] < -0.110
    return np.where(front, np.array([f'toe{i}' for i in range(len(FT.TOES))], dtype=object)[k], lab)


def _bvh_by_label(ob, labfn):
    P = _world(ob); lab = labfn(P); out = {}
    polys = [list(p.vertices) for p in ob.data.polygons]
    for L_ in set(lab.tolist()):
        fs = [f for f in polys if sum(lab[i] == L_ for i in f) >= 3]
        if fs: out[L_] = BVHTree.FromPolygons(P.tolist(), fs, all_triangles=False)
    return out


def targets(asm):
    """Bàn tay / bàn chân đã duyệt, đặt đúng chỗ (như gan_tay_chan_nam); BVH theo từng phần (lòng tay, từng ngón, ngón cái, thân bàn chân, từng ngón chân)."""
    hand = HT.build_shape('L'); X = hand_xf()                        # bàn tay đã duyệt NGUYÊN GỐC (chỉ co KZ, xoay, dời) — không dùng bản đã vá chỗ nối của gan_tay_chan_nam
    Ph = np.array([tuple(X(v.co)) for v in hand.data.vertices]); hand.data.vertices.foreach_set('co', Ph.astype(np.float32).ravel()); hand.data.update()
    foot, _ = G.place_foot(asm, verbose=False)
    out = {'tay': _bvh_by_label(hand, label_hand), 'chan': _bvh_by_label(foot, label_foot)}
    out['tay_all'] = BVHTree.FromPolygons(_world(hand).tolist(), [list(p.vertices) for p in hand.data.polygons], all_triangles=False)
    out['chan_all'] = BVHTree.FromPolygons(_world(foot).tolist(), [list(p.vertices) for p in foot.data.polygons], all_triangles=False)
    for ob in (hand, foot): bpy.data.objects.remove(ob, do_unlink=True)
    return out


_ATTR = {}


def fit_weights(P, asm=None):
    """Trọng số ép (0–1) và vùng theo NHÃN TOPOLOGY của cage (thuộc tính 'tay'/'chan' qua Subdivision): tay theo u dọc trục cẳng tay
    (0 tại u ≤ 0, 1 tại u ≥ 0,03); chân theo z (1 dưới 0,075, 0 trên 0,105). Đùi/thân không bao giờ bị ép (lần đầu chọn theo khoảng cách → kéo đùi vào tay)."""
    if asm is not None:
        for n in ('tay', 'chan'):
            a_ = np.zeros(len(asm.data.vertices)); asm.data.attributes[n].data.foreach_get('value', a_); _ATTR[n] = a_
    c_w, d, _ = arm_frame(); w = np.zeros(len(P)); reg = np.full(len(P), '', dtype=object)
    for sg in (1.0, -1.0):
        cw = np.array((sg * c_w.x, c_w.y, c_w.z)); dd = np.array((sg * d.x, d.y, d.z)); u = (P - cw) @ dd; side = (P[:, 0] * sg > 0)
        m = side & (_ATTR['tay'] > 0.5) & (u > -0.01)
        Pl = P.copy(); Pl[:, 0] *= sg; uh, vh, wh, _ = _to_hand(Pl)
        crotch = ss(0.068, 0.078, uh) * ss(0.102, 0.092, uh) * ss(0.014, 0.008, np.abs(wh))     # kẽ ngón (giữa mu và lòng): ép nhẹ, tránh hai ngón cắt chéo
        w = np.where(m, np.maximum(w, ss(0.0, 0.05, u) * (1 - 0.85 * crotch)), w); reg[m] = 'tay'     # dải chuyển cổ tay 5 cm
        f = side & (_ATTR['chan'] > 0.5) & (P[:, 2] < 0.13)
        wf = (1 - ss(0.060, 0.120, P[:, 2])) * (1 - ss(-0.088, -0.104, P[:, 1]))                # dải chuyển mắt cá rộng; ngón chân giữ hình cage (ép → tự giao ở kẽ)
        w = np.where(f, np.maximum(w, wf), w); reg[f] = 'chan'
    return w, reg


def ss(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)


def _nearest(bvh, P, mirror, labfn=None):
    """Điểm gần nhất trên bề mặt đích; nếu bvh là dict theo nhãn thì chỉ tìm trong cùng phần (ngón ↔ ngón đó)."""
    Q = P.copy()
    if mirror: Q[:, 0] = -Q[:, 0]
    if isinstance(bvh, dict):
        lab = labfn(Q); out = np.zeros_like(Q)
        for i, q in enumerate(Q):
            b_ = bvh.get(lab[i]) or bvh.get('palm') or bvh.get('foot'); out[i] = tuple(b_.find_nearest(Vector(q))[0])
    else:
        out = np.array([tuple(bvh.find_nearest(Vector(q))[0]) for q in Q])
    if mirror: out[:, 0] = -out[:, 0]
    return out


def check_shape(asm, tg):
    res = {}
    def rec(k, ok, msg): res[k] = (bool(ok), msg); print(f'    {"PASS" if ok else "FAIL"}  {k}: {msg}')
    P = _world(asm); w, reg = fit_weights(P, asm)
    for k in ('tay', 'chan'):
        m = (reg == k) & (w > 0.99) & (P[:, 0] > 0); near = _nearest(tg[k + '_all'], P[m], False); dist = np.linalg.norm(P[m] - near, axis=1)
        rec(f'sai_lech_{k}', dist.mean() <= 0.0015 and dist.max() <= 0.004, f'cách bề mặt đích TB {dist.mean() * 1000:.2f} mm, max {dist.max() * 1000:.2f} mm (≤1,5 / ≤4)')
    bm = bmesh.new(); bm.from_mesh(asm.data); bm.transform(asm.matrix_world); bm.normal_update(); zs = _zones(P); worst = {}
    for e in bm.edges:
        if len(e.link_faces) != 2: continue
        i0, i1 = e.verts[0].index, e.verts[1].index
        for k, m in zs.items():
            if m[i0] and m[i1]: worst[k] = max(worst.get(k, 0.0), math.degrees(e.link_faces[0].normal.angle(e.link_faces[1].normal, 0.0)))
    lim = {k: (40 if k.startswith('co_tay') else 35) for k in worst}      # cổ tay 40°: lõm giải phẫu kẽ gò ngón cái / mép lòng tay phía ngón út (đã soi cận: không bậc)
    rec('goc_gay_vung_noi', all(v <= lim[k] for k, v in worst.items()), 'góc nhị diện lớn nhất (°): ' + ', '.join(f'{k} {v:.0f}/≤{lim[k]}' for k, v in worst.items()))
    vs = [v for v in bm.verts if reg[v.index] in ('tay', 'chan') and v.co.x > 0]; fs = list({f for v in vs for f in v.link_faces})
    sub = BVHTree.FromPolygons([tuple(v.co) for v in bm.verts], [[v.index for v in f.verts] for f in fs], all_triangles=False)
    pairs = sub.overlap(sub); fv = [set(v.index for v in f.verts) for f in fs]; n_x = sum(1 for a_, b_ in pairs if a_ < b_ and not (fv[a_] & fv[b_]))
    rec('tu_giao_tay_chan', n_x == 0, f'{n_x} cặp mặt tự giao vùng tay/chân (trái)')
    from mathutils.kdtree import KDTree
    L_ = P[(reg != '') & (P[:, 0] > 0)]; R_ = P[(reg != '') & (P[:, 0] < 0)]; kd = KDTree(len(R_))
    for i, p in enumerate(R_): kd.insert(Vector(p), i)
    kd.balance(); dm = max(kd.find(Vector((-p[0], p[1], p[2])))[2] for p in L_[::11]) if len(R_) else 9
    rec('guong', dm <= 0.0001, f'lệch gương lớn nhất {dm * 1000:.3f} mm')
    lo, hi = C._height(bpy.context.scene); rec('chieu_cao', abs(lo) <= 0.001 and abs(hi - C.H_TARGET) <= C.H_TOL, f'đáy {lo * 1000:.1f} mm, đỉnh {hi:.4f} m')
    bm.free(); return res


def fit_shape(asm, tg, n_iter=3, smooth=2):
    """Ép vùng tay/chân bám bề mặt đích: P += w·(gần nhất − P), xen Taubin nhẹ chỉ trong vùng ép (w > 0,02); đế chân không dưới sàn."""
    me = asm.data
    for it in range(n_iter):
        P = _world(asm); w, reg = fit_weights(P, asm); Pn = P.copy()
        for k in ('tay', 'chan'):
            for sg in (1.0, -1.0):
                m = (reg == k) & (w > 0) & (P[:, 0] * sg > 0)
                if m.any(): Pn[m] = P[m] + w[m, None] * (_nearest(tg[k], P[m], sg < 0, label_hand if k == 'tay' else label_foot) - P[m])
        me.vertices.foreach_set('co', Pn.astype(np.float32).ravel()); me.update()
        bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table(); band = [bm.verts[i] for i in np.nonzero(w > 0.02)[0]]
        for _ in range(smooth if it < n_iter - 1 else 3):
            bmesh.ops.smooth_vert(bm, verts=band, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
            bmesh.ops.smooth_vert(bm, verts=band, factor=-0.53, use_axis_x=True, use_axis_y=True, use_axis_z=True)
        for v in bm.verts:
            if reg[v.index] == 'chan' and v.co.z < 0.0: v.co.z = 0.0
        bm.to_mesh(me); bm.free(); me.update()
    P = _world(asm); w, reg = fit_weights(P, asm); m = (reg == 'chan') & (P[:, 2] < 0.0015); P[m, 2] = 0.0
    me.vertices.foreach_set('co', P.astype(np.float32).ravel()); me.update()
    bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table(); low = [bm.verts[i] for i in np.nonzero((reg == 'chan') & (P[:, 2] < 0.004))[0]]
    for _ in range(6): bmesh.ops.smooth_vert(bm, verts=low, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=False)   # gỡ nếp gập ở gót do ép đế về sàn (chỉ ngang)
    bm.to_mesh(me); bm.free(); me.update()


# ================================================================== ảnh: clay / wireframe / ánh sáng xiên
def _mat(name, rgb, rough=0.6):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name); m.use_nodes = True
    bs = m.node_tree.nodes.get('Principled BSDF'); bs.inputs['Base Color'].default_value = (*rgb, 1); bs.inputs['Roughness'].default_value = rough; return m


def close_views():
    c_w, d, _ = arm_frame(); hand = c_w + d * 0.06; ank = Vector((0.10, -0.01, 0.08))
    return {'co_tay_truoc': (c_w + d * 0.02, Vector((0.2, -2.0, 0.1)), 0.20), 'co_tay_ben': (c_w + d * 0.02, Vector((2.0, 0.0, 0.1)), 0.20),
            'co_tay_cheo': (c_w + d * 0.02, Vector((1.4, -1.4, 0.5)), 0.20), 'ban_tay_long': (hand, Vector((-2.0, -0.4, 0.0)), 0.26),
            'mat_ca_truoc': (Vector((0.10, 0.0, 0.09)), Vector((0.0, -2.0, 0.1)), 0.30), 'mat_ca_ben': (Vector((0.10, 0.0, 0.09)), Vector((2.1, 0.0, 0.05)), 0.30),
            'mat_ca_cheo': (Vector((0.10, 0.0, 0.09)), Vector((1.3, -1.5, 0.7)), 0.30), 'mat_ca_sau': (Vector((0.10, 0.0, 0.09)), Vector((-0.5, 2.0, 0.4)), 0.30)}


def render_close(sc, asm, out, samples, tag, wire=True, raking=True):
    """Ảnh cận: clay (vật liệu xám đều) + wireframe chồng; ánh sáng xiên (đèn thấp, gắt) để lộ bậc. Không đổi shading của lưới.
    `asm` có thể là danh sách vật (bản cũ: thân + bàn tay/chân rời)."""
    objs = asm if isinstance(asm, (list, tuple)) else [asm]
    os.makedirs(out, exist_ok=True); sc.cycles.samples = samples; sc.render.resolution_x = sc.render.resolution_y = 600
    clay = _mat('clay', (0.62, 0.60, 0.58)); day = _mat('day', (0.05, 0.05, 0.08), 0.9); keep = []; wos = []
    for o in objs:
        keep.append((o, list(o.data.materials))); o.data.materials.clear(); o.data.materials.append(clay)
        if wire:
            wo = o.copy(); wo.data = o.data; sc.collection.objects.link(wo); wo.name = 'wire_' + o.name
            m = wo.modifiers.new('wf', 'WIREFRAME'); m.thickness = 0.0005; m.use_replace = True; m.material_offset = 1; o.data.materials.append(day); wos.append(wo)
    wo = None
    if raking:
        ld = bpy.data.lights.new('xien', 'SUN'); ld.energy = 4.0; lo = bpy.data.objects.new('xien', ld); sc.collection.objects.link(lo); lo.rotation_euler = (math.radians(78), 0, math.radians(60))
    files = []
    for nm, (tg, off, scl) in close_views().items():
        sc.camera = T.cam(sc, nm, tg + off, tg, scl); sc.render.filepath = os.path.join(out, f'{tag}_{nm}.png'); bpy.ops.render.render(write_still=True); files.append(sc.render.filepath)
    for wo in wos: bpy.data.objects.remove(wo, do_unlink=True)
    for o, mats in keep:
        o.data.materials.clear()
        for m in mats: o.data.materials.append(m)
    if raking: bpy.data.objects.remove(lo, do_unlink=True)
    return files


# ================================================================== dựng thân cage gốc
def build_base(sc=None):
    """Cảnh như dung_than_cage_nam (bản cũ v2.11 + cage + lắp ráp). Trả (sc, cb, cage, asm, skin)."""
    sc = C.build_old(); cb = bpy.data.collections[C.NEW_COLL]; parts = C.split_hands_feet(bpy.data.objects['Nam_Than_goc'], cb)
    for nm in ('Nam_BanChan.L', 'Nam_BanChan.R'):
        o = bpy.data.objects.get(nm)
        if o: bpy.data.objects.remove(o, do_unlink=True)
    cage = C.build_cage(cb); skin = bpy.data.objects['Nam_Than_goc'].data.materials[0]
    return sc, cb, cage, skin


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--check', action='store_true'); ap.add_argument('--render', default=''); ap.add_argument('--blend', default='')
    ap.add_argument('--samples', type=int, default=24); ap.add_argument('--chua-ep', action='store_true'); ap.add_argument('--ban-cu', action='store_true')
    a = ap.parse_args(argv)
    sc, cb, cage, skin = build_base()
    if a.ban_cu:                                  # bản cũ: cage gốc có nắp, không tay/chân trong lưới
        asm = C.assemble_cage(bpy.data.objects['Head_Base'], cage, skin); cage.hide_render = True; base = None; r2 = {}
    else:
        base = C.assemble_cage(bpy.data.objects['Head_Base'], cage, skin); base.name = 'Nam_Dau_Than_cu'; base.hide_render = True; base.hide_set(True)
        cage_f = build_cage_full(cb); asm = C.assemble_cage(bpy.data.objects['Head_Base'], cage_f, skin); cage_f.hide_render = True; cage.hide_render = True
    tg = targets(asm)
    if not a.chua_ep and not a.ban_cu: fit_shape(asm, tg)
    if a.check:
        print('KIỂM HÌNH'); r2 = check_shape(asm, tg)
    if a.render:
        T.lights(sc); print('ảnh cận:', len(render_close(sc, asm, os.path.join(a.render, 'can'), a.samples, 'chua_ep' if a.chua_ep else 'moi')))
    if a.blend: os.makedirs(os.path.dirname(os.path.abspath(a.blend)), exist_ok=True); bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))
    if a.check:
        print('KIỂM TOPOLOGY'); r1 = check_topology(asm, base); ok = ok_all(r1) and ok_all(r2); print('KẾT QUẢ:', 'PASS' if ok else 'FAIL'); sys.stdout.flush(); os._exit(0 if ok else 1)


if __name__ == '__main__':
    main()
