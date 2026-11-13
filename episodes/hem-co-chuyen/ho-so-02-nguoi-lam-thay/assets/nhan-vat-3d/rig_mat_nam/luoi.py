"""Topology đầu diễn hoạt của Nam: BẢN SAO của Head_Base (đầu gốc giữ nguyên làm đối chiếu) có lỗ mắt và khe miệng thật.

Đầu gốc (dung_dau_nam.py) là một lưới kín theo vòng (≈330 vòng × 144 đỉnh): mắt chỉ là gò da + mặt nạ vật liệu, con ngươi và
viền mắt là vật dán; miệng chỉ là rãnh lõm. Ở đây, trên bản sao:
  • MẮT: xoá mặt da trong một vùng quanh mắt rồi dựng lại bằng các VÒNG CẠNH ĐỒNG TÂM quanh lỗ mắt (vòng 0 = mép mí), mọi đỉnh
    đặt đúng lên bề mặt đầu gốc (giữ silhouette). Từ mép mí, một "tay áo" mí đi vào trong ôm theo mặt cầu nhãn cầu (độ dày mí,
    và là phần mí lộ ra khi nhắm). Nhãn cầu là vật riêng; tâm và bán kính chọn để mặt trước nhãn cầu ở đúng chỗ gò mắt cũ và
    mọi đỉnh da quanh đó nằm ngoài mặt cầu.
  • MIỆNG: khe miệng theo đúng đường rãnh cũ; mép môi trên và mép môi dưới là hai dãy đỉnh riêng TRÙNG NHAU lúc khép, chung
    hai đỉnh khoé. Từ mép môi, mặt trong môi đi vào khoang miệng kín (túi khép) để không nhìn xuyên đầu.
  • Răng trên, răng dưới, lưỡi dạng đơn giản đặt trong khoang.
Không dùng Boolean. Thuộc tính đỉnh ghi vùng/vòng/nguồn/phía để module shape key và trọng số dùng lại.
  vung: 0 da gốc · 11/21 mảng da mắt L/R · 12/22 tay áo mí L/R · 31 mảng da miệng · 32 mặt trong môi · 33 khoang miệng
  vong: vòng k của mảng (0 = mép); tay áo −j; khoang −10−p; đỉnh đáy khoang −20; da gốc 99
  nguon: chỉ số đỉnh mép (vòng 0) mà đỉnh này dựng từ đó (miệng: mép trên i và mép dưới đối xứng dùng chung chỉ số)
  phia: +1 mí/môi trên · −1 dưới · 0 khoé
Quy ước bên: .L = +X = bên TRÁI của nhân vật (bên phải ảnh nhìn chính diện)."""
import math, os, sys
from collections import defaultdict
from dataclasses import dataclass, field
import bpy, bmesh
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree

AQ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if AQ not in sys.path: sys.path.insert(0, AQ)
import dung_dau_nam as D

# ---------------------------------------------------------------- hằng số mắt
N_TREN, N_DUOI = 15, 25                  # đỉnh mép mí trên / dưới (không kể hai khoé)
K_MAT = 8                                # số vòng da quanh lỗ mắt (vòng K_MAT cố định khi mí chuyển động)
D_TREN, D_DUOI, D_BEN = 0.032, 0.026, 0.008   # m: mảng da kéo lên trên / xuống dưới / sang ngang tính từ mép mí
VIEN_ONG_NOI = 0.0009                   # m: ống viền mắt nằm ngoài mép mí (theo bán kính nhãn cầu)
VIEN, VIEN_TREN = 0.0024, 0.0032          # m: dải viền mắt tối (vòng 0 → 1), mí trên đậm hơn như mẫu
J_MI = 7                                 # số hàng tay áo mí
GOC_MI = [0, 4, 8, 12, 16, 20, 24]       # độ: hàng tay áo đi ra sau mép mí theo mặt cầu (ngắn để không chạm hốc mắt bên kia)
KHE_CAU = 0.0013                         # m: tay áo cách mặt nhãn cầu
KHE_MEP = 0.0025                         # m: mép mí cách mặt nhãn cầu (thành mí tối giữa mép và nhãn cầu là một phần nét viền)
LUI_DINH = 0.0005                        # m: đỉnh trước nhãn cầu lùi sau đỉnh gò mắt cũ
LE_DA = 0.0008                           # m: mọi đỉnh da trong vùng chỏm cầu cách mặt nhãn cầu tối thiểu
LIEC_MM = 0.022                          # m: quãng con ngươi đi tối đa khi liếc (chỏm nhãn cầu phải phủ thêm quãng này)
DU_CHOM_MM = 0.008                       # m: chỏm rộng thêm ngoài lỗ mắt + quãng liếc
# ---------------------------------------------------------------- hằng số miệng
N_MIENG = 32                             # đỉnh mép miệng (2 khoé + 15 trên + 15 dưới)
K_MIENG = 8
UC_MIENG = 0.030                         # m: nửa bề rộng khe miệng (khoé)
DH_MIENG, DV_TREN, DV_DUOI = 0.014, 0.034, 0.036
VIEN_MIENG = 0.0012
SAU_MOI = [0.0015, 0.004, 0.008]         # m: mặt trong môi đi vào trong
TUI = [(0.005, 0.006, 1.00), (0.012, 0.011, 0.95), (0.019, 0.012, 0.80), (0.025, 0.008, 0.50)]   # (sâu thêm, nửa cao, tỉ lệ ngang)
DAY_TUI = 0.036

LAP = []                                 # tam giác lấp giữa biên lỗ và mảng (để gỡ gấp sau khi định hướng pháp tuyến)
TEN_VAT_GIU = ['Eyebrow.L', 'Eyebrow.R', 'Mole', 'Ear.L', 'Ear.R']


@dataclass
class Rig:
    head: object
    coll: object
    mat: dict = field(default_factory=dict)        # 'L'/'R' → nhãn cầu
    goc_mat: dict = field(default_factory=dict)    # 'L'/'R' → empty gốc nhãn cầu (tâm, hướng nghỉ)
    n_mat: int = 0
    info: dict = field(default_factory=dict)


# ---------------------------------------------------------------- tiện ích hình học
def _trong(poly, u, w):
    """Điểm (u, w) có trong đa giác (danh sách (u, w)) không."""
    c = False; n = len(poly)
    for i in range(n):
        (u1, w1), (u2, w2) = poly[i], poly[(i + 1) % n]
        if (w1 > w) != (w2 > w) and u < (u2 - u1) * (w - w1) / (w2 - w1 + 1e-15) + u1: c = not c
    return c


def _len_da(bvh, goc, f, X, Z, u, w):
    o = goc + X * u + Z * w + f * 0.08; h = bvh.ray_cast(o, -f)
    if h[0] is None: raise RuntimeError(f'không chạm da tại u={u:.4f} w={w:.4f}')
    return h[0]


def _vong_bien(bm, loc):
    """Vòng cạnh hở (sau khi xoá mặt) gồm các đỉnh thoả loc(v), theo thứ tự đi quanh."""
    E = [e for e in bm.edges if e.is_boundary and all(loc(v) for v in e.verts)]
    if not E: raise RuntimeError('không thấy biên lỗ')
    ke = defaultdict(list)
    for e in E:
        a, b = e.verts; ke[a].append(b); ke[b].append(a)
    if any(len(x) != 2 for x in ke.values()): raise RuntimeError('biên lỗ không phải một vòng đơn')
    dau = E[0].verts[0]; vong = [dau]; truoc = None; cur = dau
    while True:
        nx = [n for n in ke[cur] if n is not truoc][0]
        if nx is dau: break
        vong.append(nx); truoc, cur = cur, nx
    if len(vong) != len(ke): raise RuntimeError('biên lỗ có nhiều vòng')
    return vong


def _khoa_keo(bm, A, B, goc_uw, mat=0):
    """Nối vòng A (biên lỗ) với vòng B (vòng ngoài cùng của mảng) bằng dải tam giác, đi cùng chiều góc quanh tâm."""
    def ang(v):
        u, w = goc_uw(v.co); return math.atan2(w, u)
    def chieu(L):
        s = 0.0
        for i in range(len(L)):
            a, b = ang(L[i]), ang(L[(i + 1) % len(L)]); d = (b - a + math.pi) % (2 * math.pi) - math.pi; s += d
        return s
    if chieu(A) < 0: A = A[::-1]
    if chieu(B) < 0: B = B[::-1]
    a0 = ang(B[0]); i0 = min(range(len(A)), key=lambda i: abs((ang(A[i]) - a0 + math.pi) % (2 * math.pi) - math.pi)); A = A[i0:] + A[:i0]
    def tron(L):
        out = [0.0]
        for i in range(1, len(L) + 1):
            d = (ang(L[i % len(L)]) - ang(L[i - 1]) + math.pi) % (2 * math.pi) - math.pi; out.append(out[-1] + d)
        base = (ang(L[0]) - a0 + math.pi) % (2 * math.pi) - math.pi
        return [x + base for x in out]
    ga, gb = tron(A), tron(B); m, n = len(A), len(B); i = j = 0; mf = []
    while i < m or j < n:
        if j >= n or (i < m and ga[i + 1] <= gb[j + 1]):
            f = bm.faces.new((A[i % m], A[(i + 1) % m], B[j % n])); i += 1
        else:
            f = bm.faces.new((A[i % m], B[(j + 1) % n], B[j % n])); j += 1
        f.material_index = mat; f.smooth = True; mf.append(f)
    return mf


def _lap_khe(bm, A, B, huong):
    """Lấp dải giữa biên lỗ răng cưa A và vòng ngoài B bằng tam giác hoá có ràng buộc (chiếu theo `huong`)."""
    def canh(L):
        out = []
        for i in range(len(L)):
            e = bm.edges.get((L[i], L[(i + 1) % len(L)]))
            if e is None: raise RuntimeError('thiếu cạnh vòng')
            out.append(e)
        return out
    r = bmesh.ops.triangle_fill(bm, use_beauty=True, use_dissolve=False, edges=canh(A) + canh(B), normal=huong)
    moi = [fa for fa in r['geom'] if isinstance(fa, bmesh.types.BMFace)]
    for fa in moi: fa.material_index = 0; fa.smooth = True
    return moi


def _go_gap(bm, faces, bvh, lan=6):
    """Tam giác hoá chiếu nghiêng có thể sinh tam giác gấp (pháp tuyến ngược bề mặt gốc). Xoay cạnh chéo bên trong dải
    cho tới khi mọi tam giác cùng chiều với bề mặt gốc. Trả số tam giác còn gấp."""
    tap = set(faces)
    def gap(fa): return fa.is_valid and fa.normal.dot(bvh.find_nearest(fa.calc_center_median())[1]) < 0
    for _ in range(lan):
        bm.normal_update(); xau = [fa for fa in tap if gap(fa)]
        if not xau: return 0
        for fa in xau:
            if not fa.is_valid: continue
            for e in fa.edges:
                if len(e.link_faces) == 2 and all(f2 in tap for f2 in e.link_faces):
                    cu = list(e.link_faces); e2 = bmesh.utils.edge_rotate(e, True)
                    if e2 is not None:
                        for f2 in cu: tap.discard(f2)
                        tap.update(e2.link_faces); bm.normal_update()
                        if not any(gap(f2) for f2 in e2.link_faces): break
    # dự phòng: xoá tam giác còn gấp cùng tam giác kề trong dải rồi lấp lại, chiếu theo pháp tuyến gốc tại chỗ
    for _ in range(3):
        bm.normal_update(); xau = [fa for fa in tap if gap(fa)]
        if not xau: break
        for fa in xau:
            if not fa.is_valid: continue
            n_goc = bvh.find_nearest(fa.calc_center_median())[1]
            cum = {fa} | {f2 for e in fa.edges for f2 in e.link_faces if f2 in tap}
            canh = {e for f2 in cum for e in f2.edges}
            for f2 in cum: tap.discard(f2)
            bmesh.ops.delete(bm, geom=list(cum), context='FACES_ONLY')
            bien = [e for e in canh if e.is_valid and len(e.link_faces) == 1]
            r = bmesh.ops.triangle_fill(bm, use_beauty=True, use_dissolve=False, edges=bien, normal=n_goc)
            for f2 in r['geom']:
                if isinstance(f2, bmesh.types.BMFace): f2.smooth = True; f2.material_index = 0; tap.add(f2)
        bmesh.ops.recalc_face_normals(bm, faces=list(tap))
    bm.normal_update(); return sum(1 for fa in tap if gap(fa))


def _quad_vong(bm, L1, L2, mat, kin=True):
    out = []; n = len(L1)
    for i in range(n if kin else n - 1):
        f = bm.faces.new((L1[i], L1[(i + 1) % n], L2[(i + 1) % n], L2[i])); f.material_index = mat; f.smooth = True; out.append(f)
    return out


def _gan(v, L, **kw):
    for k, x in kw.items(): v[L[k]] = x


def _xoa_trong(bm, poly, goc, f, X, Z, gioi, vung):
    """Xoá mọi mặt có đỉnh DA GỐC (vung = 0) nằm trong đa giác (u, w) quanh `goc` (chỉ phía trước). Không đụng phần đã dựng."""
    vin = []
    for v in bm.verts:
        if v[vung] != 0: continue
        q = v.co - goc
        if q.dot(f) < -0.08: continue
        u, w = q.dot(X), q.dot(Z)
        if abs(u) < gioi and abs(w) < gioi and _trong(poly, u, w): vin.append(v)
    faces = list({fa for v in vin for fa in v.link_faces})
    bmesh.ops.delete(bm, geom=faces, context='FACES')
    loose = [v for v in bm.verts if not v.link_faces]
    if loose: bmesh.ops.delete(bm, geom=loose, context='VERTS')
    return len(faces)


# ---------------------------------------------------------------- mắt
def _vien_mo_mat():
    """Đường mép lỗ mắt (u, w) đúng hình mắt nhìn thấy ở tư thế nghỉ: trên là đường mí, dưới là cung elip tròng trắng."""
    a = D.EYE_R[0] * D.WHITE_R2 ** 0.5
    top = D.lid_line; ell = lambda u: a * math.sqrt(max(0.0, 1 - (u / a) ** 2))
    lo, hi = 0.0, a
    for _ in range(60):
        mi = (lo + hi) / 2
        if ell(mi) > top(mi): lo = mi
        else: hi = mi
    uc = lo; wc = top(uc); pts = [(-uc, wc)]; phia = [0]
    for i in range(1, N_TREN + 1):
        u = -uc + 2 * uc * i / (N_TREN + 1); pts.append((u, top(u))); phia.append(1)
    pts.append((uc, wc)); phia.append(0)
    psic = math.atan2(wc, uc)
    for i in range(1, N_DUOI + 1):
        p = psic - (math.pi + 2 * psic) * i / (N_DUOI + 1); pts.append((a * math.cos(p), a * math.sin(p))); phia.append(-1)
    return pts, phia, (0.0, (top(0.0) - a) / 2)


def _khop_cau(mat_cu, mep, da_ngoai, p0):
    """Nhãn cầu = mặt cầu khớp bình phương tối thiểu với BỀ MẶT MẮT CŨ (vùng tròng trắng nhìn thấy ở tư thế nghỉ, gồm mép),
    nên mắt 3D xấp xỉ đúng chỗ và độ cong người xem đã thấy. (Vùng mắt cũ cong ngang theo đầu nhưng gần phẳng theo chiều
    dọc nên không khớp hoàn toàn: sai số được ghi lại.) Kiểm nhãn cầu không xuyên da ngoài mảng quanh mắt trong vùng chỏm.
    Trả (C, R, góc_chỏm_độ, rms_mặt_cũ, xuyên_da_min)."""
    import numpy as np
    P = np.array([tuple(x) for x in list(mat_cu) + list(mep)])
    A = np.hstack([2 * P, np.ones((len(P), 1))]); b = (P ** 2).sum(1); sol = np.linalg.lstsq(A, b, rcond=None)[0]
    C = sol[:3]; R = float(math.sqrt(sol[3] + C @ C)); rms = float(np.sqrt(np.mean((np.linalg.norm(P - C, axis=1) - R) ** 2)))
    M = np.array([tuple(x) for x in mep]); truc = np.array(tuple(p0)) - C; truc /= np.linalg.norm(truc)
    mo = float(np.max(np.arccos(np.clip((M - C) @ truc / np.linalg.norm(M - C, axis=1), -1, 1))))
    chom = mo + math.asin(min(0.99, (LIEC_MM + DU_CHOM_MM) / R))
    Q = np.array([tuple(x) for x in da_ngoai]); dq = Q - C; lq = np.linalg.norm(dq, axis=1); trong = (dq @ truc / lq) > math.cos(chom)
    xuyen = float(np.min(lq[trong] - R)) if trong.any() else 1.0
    if os.environ.get('RIG_DEBUG'): print(f'[nhãn cầu] R={R:.4f} rms_mặt_cũ={rms*1000:.2f}mm chỏm={math.degrees(chom):.1f}° da_ngoài_min={xuyen*1000:.2f}mm')
    return Vector(C), R, math.degrees(chom), rms, xuyen


def _om_cau(vong_3d, C, R):
    """Kéo mép mí (vòng 0) về cách mặt cầu đúng KHE_MEP, các vòng sau chuyển dần về da gốc (vòng cuối giữ nguyên).
    Chỉ đổi khoảng cách tới tâm cầu (dọc tia từ C), nên hình lỗ mắt nhìn chính diện gần như giữ nguyên."""
    out = []
    for k, row in enumerate(vong_3d):
        b = 1.0 if k == 0 else 0.35 * (1.0 - k / K_MAT) ** 3; r_ = []     # vòng sau mép gần da cũ → dải viền + thành mí nhìn thấy như nét viền gốc
        for P in row:
            d = P - C; l = d.length; muc = R + KHE_MEP + (0.0 if k == 0 else 0.0004 * k)
            l2 = l + b * (muc - l); l2 = max(l2, R + KHE_MEP) if k < K_MAT else l
            r_.append(C + d / l * l2)
        out.append(r_)
    return out


def _mo_mat(bm, L, s, bvh, goc_vs):
    p0, f, X, Z = D.EYE_FRAMES[s]; vien, phia, O = _vien_mo_mat(); n = len(vien)
    uw = lambda co: ((co - p0).dot(X), (co - p0).dot(Z))
    # vòng da: vòng 0 = mép mí; các vòng ngoài lệch theo pháp tuyến hướng tâm O
    vong_uw = []
    for k in range(K_MAT + 1):
        row = []
        for (u, w) in vien:
            nu, nw = u - O[0], w - O[1]; l = math.hypot(nu, nw); nu, nw = nu / l, nw / l
            Dn = math.hypot(D_BEN * nu, (D_TREN if nw > 0 else D_DUOI) * nw)
            v_ = VIEN_TREN if nw > 0.5 else VIEN
            d = 0.0 if k == 0 else v_ + (Dn - v_) * (((k - 1) / (K_MAT - 1)) ** 1.3)
            row.append((u + nu * d, w + nw * d))
        vong_uw.append(row)
    vong_3d = [[_len_da(bvh, p0, f, X, Z, u, w) for (u, w) in row] for row in vong_uw]
    # nhãn cầu: đỉnh trước ở chỗ gò mắt cũ; mọi điểm da NGOÀI mảng (vòng cuối + da gốc ngoài vùng xoá) nằm ngoài mặt cầu
    diem = list(vong_3d[-1])
    for co in goc_vs:
        q = co - p0
        if q.dot(f) > -0.15 and abs(q.dot(X)) < 0.16 and abs(q.dot(Z)) < 0.16 and not _trong(vong_uw[-1], q.dot(X), q.dot(Z)): diem.append(co)
    mat_cu = []
    for co in goc_vs:
        q = co - p0
        if q.dot(f) > -0.06 and abs(q.dot(X)) < 0.06 and abs(q.dot(Z)) < 0.06 and _trong(vien, q.dot(X), q.dot(Z)): mat_cu.append(co)
    C, R, chom, rms, xuyen = _khop_cau(mat_cu, vong_3d[0], diem, p0)
    if xuyen < LE_DA: raise RuntimeError(f'nhãn cầu xuyên da ngoài mảng quanh mắt {xuyen*1000:.1f} mm')
    vong_3d = _om_cau(vong_3d, C, R)
    # xoá da cũ trong vùng vòng ngoài cùng (nới 1,5 mm), lấy biên lỗ
    ngoai = [(u + (u - O[0]) / math.hypot(u - O[0], w - O[1]) * 0.0015, w + (w - O[1]) / math.hypot(u - O[0], w - O[1]) * 0.0015) for (u, w) in vong_uw[-1]]
    _xoa_trong(bm, ngoai, p0, f, X, Z, 0.15, L['vung'])
    def gan_mat(v):
        q = v.co - p0; return v[L['vung']] == 0 and q.dot(f) > -0.08 and abs(q.dot(X)) < 0.15 and abs(q.dot(Z)) < 0.15
    bien = _vong_bien(bm, gan_mat)
    vung_da, vung_ao = (11, 12) if s == 1 else (21, 22)
    rings = []
    for k, row in enumerate(vong_3d):
        R_ = []
        for i, p in enumerate(row):
            v = bm.verts.new(p); _gan(v, L, vung=vung_da, vong=k, nguon=i, phia=phia[i]); v[L['t']] = vien[i][0]; R_.append(v)
        rings.append(R_)
    for k in range(K_MAT): _quad_vong(bm, rings[k], rings[k + 1], 1 if k == 0 else 0)
    LAP.extend(_lap_khe(bm, bien, rings[-1], f))
    # tay áo mí: từ mép mí đi vào trong, ôm mặt cầu nhãn cầu
    hang = [rings[0]]
    for j in range(1, J_MI + 1):
        Rj = []
        for i, v0 in enumerate(rings[0]):
            d0 = (v0.co - C).normalized(); ax = f.cross(d0)
            ax = ax.normalized() if ax.length > 1e-9 else X.copy()
            d = Matrix.Rotation(math.radians(GOC_MI[j - 1]), 3, ax) @ d0
            v = bm.verts.new(C + d * (R + KHE_CAU)); _gan(v, L, vung=vung_ao, vong=-j, nguon=i, phia=phia[i]); v[L['t']] = vien[i][0]; Rj.append(v)
        hang.append(Rj)
    for j in range(J_MI): _quad_vong(bm, hang[j], hang[j + 1], 1 if j < 2 else 0)
    return dict(C=C, R=R, p0=p0, f=f, X=X, Z=Z, n=n, O=O, vien=vien, phia=phia, rms=rms, chom=chom, xuyen=xuyen, truc=(p0 - C).normalized(),
                mep=[v.co.copy() for v in rings[0]])


# ---------------------------------------------------------------- miệng
def _khung_mieng():
    p = D.MOUTH_FRAME['p'].copy(); f = D.MOUTH_FRAME['f'].normalized()
    Z = (Vector((0, 0, 1)) - f * f.z).normalized(); X = (-f).cross(Z)
    return p, f, X, Z


def _ranh(u, p):
    """Độ cao (w) của đường rãnh miệng cũ tại u, so với tâm miệng p."""
    return D.FACE['mouth_z'] - 0.003 * (u / 0.030) ** 2 - p.z


def _mo_mieng(bm, L, bvh):
    p, f, X, Z = _khung_mieng(); N = N_MIENG
    ts = [2 * math.pi * i / N for i in range(N)]
    def phia_t(i): return 0 if i in (0, N // 2) else (1 if i < N // 2 else -1)
    def nguon_t(i): return i if i <= N // 2 else N - i
    vong_uw = []
    for k in range(K_MIENG + 1):
        g = 0.0 if k == 0 else (((k - 1) / (K_MIENG - 1)) ** 1.3)
        dh = 0.0 if k == 0 else 0.0008 + (DH_MIENG - 0.0008) * g
        row = []
        for i, t in enumerate(ts):
            u0 = UC_MIENG * math.cos(t); sg = phia_t(i)
            dv = 0.0 if k == 0 else VIEN_MIENG + ((DV_TREN if sg >= 0 else DV_DUOI) - VIEN_MIENG) * g
            row.append(((UC_MIENG + dh) * math.cos(t), _ranh(u0, p) + sg * dv * abs(math.sin(t)) ** 0.8))
        vong_uw.append(row)
    vong_3d = [[_len_da(bvh, p, f, X, Z, u, w) for (u, w) in row] for row in vong_uw]
    ngoai = [(u * 1.0 + math.copysign(0.0015, u), w + math.copysign(0.0015, w - _ranh(0.0, p))) for (u, w) in vong_uw[-1]]
    _xoa_trong(bm, ngoai, p, f, X, Z, 0.12, L['vung'])
    def gan_mieng(v):
        q = v.co - p; return v[L['vung']] == 0 and q.dot(f) > -0.08 and abs(q.dot(X)) < 0.12 and abs(q.dot(Z)) < 0.12
    bien = _vong_bien(bm, gan_mieng)
    rings = []
    for k, row in enumerate(vong_3d):
        R_ = []
        for i, q in enumerate(row):
            v = bm.verts.new(q); _gan(v, L, vung=31, vong=k, nguon=nguon_t(i), phia=phia_t(i)); v[L['t']] = ts[i]; R_.append(v)
        rings.append(R_)
    for k in range(K_MIENG): _quad_vong(bm, rings[k], rings[k + 1], 2 if k == 0 else 0)
    LAP.extend(_lap_khe(bm, bien, rings[-1], f))
    # mặt trong môi + khoang miệng kín
    hang = [rings[0]]
    for j, sau in enumerate(SAU_MOI, start=1):
        Rj = []
        for i, v0 in enumerate(rings[0]):
            v = bm.verts.new(v0.co - f * sau); _gan(v, L, vung=32, vong=-j, nguon=nguon_t(i), phia=phia_t(i)); v[L['t']] = ts[i]; Rj.append(v)
        hang.append(Rj)
    for j, (sau, cao, ti) in enumerate(TUI, start=1):
        Rj = []
        for i, v0 in enumerate(rings[0]):
            u = (v0.co - p).dot(X); sg = phia_t(i)
            q = v0.co + X * (u * ti - u) + Z * (sg * cao * abs(math.sin(ts[i]))) - f * (SAU_MOI[-1] + sau)
            v = bm.verts.new(q); _gan(v, L, vung=33, vong=-10 - j, nguon=nguon_t(i), phia=phia_t(i)); v[L['t']] = ts[i]; Rj.append(v)
        hang.append(Rj)
    for j in range(len(hang) - 1): _quad_vong(bm, hang[j], hang[j + 1], 2)
    day = bm.verts.new(p + Z * _ranh(0.0, p) - f * DAY_TUI); _gan(day, L, vung=33, vong=-20, nguon=-1, phia=0)
    last = hang[-1]
    for i in range(N):
        fa = bm.faces.new((last[i], last[(i + 1) % N], day)); fa.material_index = 2; fa.smooth = True
    return dict(p=p, f=f, X=X, Z=Z, n=N)


def _thanh_rang(ten, coll, m, u0, u1, w0, w1, sau0, sau1, mieng, bvh, nseg=14):
    """Dải răng đơn giản cong theo cung miệng: hộp kéo dài theo u, nằm sâu sau mép miệng."""
    p, f, X, Z = mieng['p'], mieng['f'], mieng['X'], mieng['Z']
    bm = bmesh.new(); cols = []
    for i in range(nseg + 1):
        u = u0 + (u1 - u0) * i / nseg; base = _len_da(bvh, p, f, X, Z, u, _ranh(u, p))
        ring = [bm.verts.new(base + Z * w - f * d) for (w, d) in ((w1, sau0), (w0, sau0), (w0, sau1), (w1, sau1))]
        cols.append(ring)
    for i in range(nseg):
        for a in range(4):
            bm.faces.new((cols[i][a], cols[i][(a + 1) % 4], cols[i + 1][(a + 1) % 4], cols[i + 1][a]))
    bm.faces.new(cols[0][::-1]); bm.faces.new(cols[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    for fa in bm.faces: fa.smooth = True
    me = bpy.data.meshes.new(ten); bm.to_mesh(me); bm.free(); ob = bpy.data.objects.new(ten, me); coll.objects.link(ob); me.materials.append(m)
    return ob


def _luoi_thit(ten, coll, m, tam, ban_kinh, mieng):
    p, f, X, Z = mieng['p'], mieng['f'], mieng['X'], mieng['Z']
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=12, radius=1.0)
    M3 = Matrix((X, -f, Z)).transposed()
    for v in bm.verts: v.co = tam + M3 @ Vector((v.co.x * ban_kinh[0], v.co.y * ban_kinh[1], v.co.z * ban_kinh[2]))
    for fa in bm.faces: fa.smooth = True
    me = bpy.data.meshes.new(ten); bm.to_mesh(me); bm.free(); ob = bpy.data.objects.new(ten, me); coll.objects.link(ob); me.materials.append(m)
    return ob


# ---------------------------------------------------------------- nhãn cầu
def _vat_lieu_nhan_cau(goc_dong_tu):
    m = bpy.data.materials.get('Nhan_Cau')
    if m: return m
    m = bpy.data.materials.new('Nhan_Cau'); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; Lk = nt.links
    b = N['Principled BSDF']; b.inputs['Roughness'].default_value = 0.5; b.inputs['Specular IOR Level'].default_value = 0.2   # mờ như mắt vẽ gốc, con ngươi không loá
    tc = N.new('ShaderNodeTexCoord'); nr = N.new('ShaderNodeVectorMath'); nr.operation = 'NORMALIZE'; Lk.new(tc.outputs['Object'], nr.inputs[0])
    dt = N.new('ShaderNodeVectorMath'); dt.operation = 'DOT_PRODUCT'; dt.inputs[1].default_value = (0, -1, 0); Lk.new(nr.outputs[0], dt.inputs[0])
    mr = N.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = math.cos(goc_dong_tu + 0.012); mr.inputs['From Max'].default_value = math.cos(goc_dong_tu - 0.012)
    Lk.new(dt.outputs['Value'], mr.inputs['Value'])
    mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.inputs[6].default_value = D.hexc(D.COL['trang']); mx.inputs[7].default_value = D.hexc(D.COL['muc'])
    Lk.new(mr.outputs['Result'], mx.inputs[0]); Lk.new(mx.outputs[2], b.inputs['Base Color'])
    return m


def _tao_nhan_cau(k, s, info, coll, bvh):
    p0, f, X, Z, C, R = info['p0'], info['f'], info['X'], info['Z'], info['C'], info['R']
    q = _len_da(bvh, p0, f, X, Z, -s * 0.004, D.W_LID0 - 0.0165)                 # tâm con ngươi cũ
    huong = (q - C).normalized(); zl = (Z - huong * huong.dot(Z)).normalized(); yl = -huong; xl = yl.cross(zl)
    Mx = Matrix((xl, yl, zl)).transposed().to_4x4(); Mx.translation = C
    goc = bpy.data.objects.new(f'Mat_Goc.{k}', None); goc.empty_display_type = 'SPHERE'; goc.empty_display_size = R; coll.objects.link(goc); goc.matrix_world = Mx
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=96, v_segments=96, radius=R)
    bmesh.ops.rotate(bm, verts=bm.verts[:], cent=(0, 0, 0), matrix=Matrix.Rotation(math.radians(90), 3, 'X'))   # cực cầu về trục Y cục bộ
    # chỉ giữ CHỎM phía trước (quanh −Y cục bộ): đủ phủ lỗ mắt + biên độ liếc; phần sau bỏ để không chọc ra thái dương
    cos_chom = math.cos(math.radians(info['chom']))
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if -v.co.y / R < cos_chom], context='VERTS')
    for fa in bm.faces: fa.smooth = True
    me = bpy.data.meshes.new(f'Nhan_Cau.{k}'); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(f'Nhan_Cau.{k}', me); coll.objects.link(ob); ob.parent = goc; ob.matrix_parent_inverse = Matrix.Identity(4); ob.matrix_basis = Matrix.Identity(4)
    me.materials.append(_vat_lieu_nhan_cau(math.asin(min(0.95, 0.0155 / R))))
    ob['ban_kinh'] = R; ob['goc_chom'] = info['chom']
    return ob, goc


# ---------------------------------------------------------------- dựng toàn bộ
def _sao_vat(o, coll, ten):
    c = o.copy()
    if o.data is not None and o.type == 'MESH' and not o.name.startswith('Hair'): c.data = o.data.copy()
    c.name = ten; coll.objects.link(c); return c


def dung(mole_side=None):
    """Dựng đầu Nam gốc (giữ nguyên trong Nam_Dau, ẩn khi render) và đầu diễn hoạt trong collection Nam_DienHoat."""
    if mole_side is not None: D.MOLE_SIDE = mole_side
    D.build(); sc = bpy.context.scene
    goc = bpy.data.objects['Head_Base']
    coll = bpy.data.collections.new('Nam_DienHoat'); sc.collection.children.link(coll)
    head = goc.copy(); head.data = goc.data.copy(); head.name = 'Head_Rig'; head.data.name = 'Head_Rig'; coll.objects.link(head)
    da = D.mat('Da_Rig', D.COL['da'], 0.65, 0.08, sss_radius=(0.1, 0.05, 0.03)); muc = bpy.data.materials['Muc']; kh = bpy.data.materials['Khoang_Mieng']
    head.data.materials.clear(); head.data.materials.append(da); head.data.materials.append(muc); head.data.materials.append(kh)
    bpy.context.view_layer.update()
    bvh = BVHTree.FromObject(goc, bpy.context.evaluated_depsgraph_get()); goc_vs = [v.co.copy() for v in goc.data.vertices]
    bm = bmesh.new(); bm.from_mesh(head.data)
    L = {n: bm.verts.layers.int.new(n) for n in ('vung', 'vong', 'nguon', 'phia')}; L['t'] = bm.verts.layers.float.new('t')
    for v in bm.verts: v[L['vong']] = 99
    for fa in bm.faces: fa.material_index = 0
    info = {}; LAP.clear()
    for s, k in ((1, 'L'), (-1, 'R')): info[k] = _mo_mat(bm, L, s, bvh, goc_vs)
    info['mieng'] = _mo_mieng(bm, L, bvh)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    # lưới hở (tay áo mí) nên recalc có thể chọn ngược cả lưới: da gốc phải quay ra ngoài tâm đầu
    goc_da = [fa for fa in bm.faces if all(v[L['vung']] == 0 for v in fa.verts)]
    nguoc = sum(1 for fa in goc_da if fa.normal.dot(fa.calc_center_median() - D.C) < 0)
    if nguoc > len(goc_da) / 2: bmesh.ops.reverse_faces(bm, faces=bm.faces[:])
    con = _go_gap(bm, [fa for fa in LAP if fa.is_valid], bvh)
    if con: print(f'[luoi] còn {con} tam giác gấp sau khi xoay cạnh')
    bm.to_mesh(head.data); bm.free(); head.data.update()
    r = Rig(head=head, coll=coll, n_mat=info['L']['n'], info=info)
    for s, k in ((1, 'L'), (-1, 'R')): r.mat[k], r.goc_mat[k] = _tao_nhan_cau(k, s, info[k], coll, bvh)
    # viền mắt: ống tối như Eyeline gốc (rộng 2,6 mm, dày 2,2 mm) nhưng chạy dọc MÉP MÍ mới; sẽ gắn vào da để đi theo mí
    for k in 'LR':
        C = info[k]['C']; mep = [C + (q - C).normalized() * ((q - C).length + VIEN_ONG_NOI) for q in info[k]['mep']]
        D.sweep(f'Vien_Mat.{k}', coll, mep + [mep[0], mep[1]], lambda u: 0.0026, lambda u: 0.0022, lambda c, C=C: (c - C).normalized(), muc, 160, 10)
    for k in 'LR':
        for n in ('C', 'p0', 'f', 'X', 'Z'): head[f'mat_{k}_{n}'] = list(info[k][n])
        head[f'mat_{k}_R'] = info[k]['R']
    for n in ('p', 'f', 'X', 'Z'): head[f'mieng_{n}'] = list(info['mieng'][n])
    M = {n: bpy.data.materials[n] for n in ('Rang', 'Luoi')}
    _thanh_rang('Rang_Tren', coll, M['Rang'], -0.017, 0.017, 0.0006, 0.0045, 0.0160, 0.0185, info['mieng'], bvh)
    _thanh_rang('Rang_Duoi', coll, M['Rang'], -0.016, 0.016, -0.0042, -0.0008, 0.0160, 0.0185, info['mieng'], bvh)
    pm = info['mieng']; tam_luoi = pm['p'] + pm['Z'] * (_ranh(0.0, pm['p']) - 0.0055) - pm['f'] * 0.026
    _luoi_thit('Luoi', coll, M['Luoi'], tam_luoi, (0.0135, 0.0060, 0.0028), pm)
    for n in TEN_VAT_GIU:
        c = _sao_vat(bpy.data.objects[n], coll, n.replace('.', '_Rig.') if '.' in n else n + '_Rig')
        for m in c.modifiers:
            if m.type == 'SHRINKWRAP' and m.target == goc: m.target = head
    for o in list(bpy.data.collections['04_Hair'].objects): _sao_vat(o, coll, o.name + '_Rig')
    nd = bpy.data.collections['Nam_Dau']; nd.hide_render = True
    bpy.context.view_layer.layer_collection.children['Nam_Dau'].hide_viewport = True
    bpy.context.view_layer.update()
    return r
