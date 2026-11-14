"""Đo độ bám ảnh mẫu của vùng mặt đầu Nam (Hồ sơ 02).

Nguồn mẫu: `../thiet-ke/thu-3d/mau-3d-dau.webp` (1672×941) — ảnh DUY NHẤT có mắt/mũi/miệng; ba hình trong ảnh là ba góc quay liên tiếp
(mặt gần chính diện, 3/4, nghiêng), mặt quay sang phải ảnh. Các ảnh mau-dau-tran-*/mau-dau-luoi-* chỉ là sọ trọc, dùng để so sọ chứ không có mốc mặt.

Cách đo: chiếu trực giao các mốc của cage ở góc quay xấp xỉ của từng hình, khớp một phép tương đồng (tỉ lệ + tịnh tiến, KHÔNG xoay) với mốc trên mẫu
rồi báo sai lệch còn lại của từng mốc, tính bằng % chiều cao mặt (cằm → đường mí trên) trong ảnh mẫu. Tỉ lệ chung được khớp nên chỉ lệch HÌNH DẠNG mới bị phạt.

Toạ độ ảnh mẫu là pixel của mau-3d-dau.webp (đọc trên lưới 20 px). Góc quay YAW là ƯỚC LƯỢNG (chưa đo): cổng 1 kiểm bằng ảnh chồng.
"""
import math

# toạ độ pixel (x, y) trong mau-3d-dau.webp. 'mat_*' = hộp (x0, y0, x1, y1) của VÒNG MẮT ĐẦY ĐỦ (vòm mí → viền dưới) ↔ cage idx['eye'][0];
# 'khe_*' = hộp KHE HỞ (đường mí trên đậm → viền dưới) ↔ cage idx['eye'][4]. Bên R = bên phải nhân vật = bên trái ảnh = −X
MOC_MAU = {
    'truoc': {     # hình 1 (x 40–560)
        'mat_R': (200, 422, 317, 526), 'mat_L': (351, 419, 460, 521),
        'khe_R': (200, 466, 317, 526), 'khe_L': (351, 463, 460, 521),
        'mui': (341, 535), 'mieng': (344, 620), 'cam': (340, 700), 'not_ruoi': (181, 396),
        'tai_R_tren': (110, 442), 'tai_R_duoi': (115, 582),
    },
    'goc34': {     # hình 2 (x 600–1100)
        'mat_R': (840, 421, 952, 521), 'mat_L': (980, 412, 1051, 508),
        'khe_R': (840, 460, 952, 521), 'khe_L': (980, 457, 1051, 508),
        'mui': (988, 535), 'mieng': (995, 611), 'not_ruoi': (810, 395),   # không có 'cam': ở 3/4 cằm là điểm thấp nhất của đường viền, không phải điểm cố định trên mặt
        'tai_R_tren': (690, 438), 'tai_R_duoi': (700, 581),
    },
    'nghieng': {   # hình 3 (x 1140–1672)
        'mat_R': (1530, 416, 1595, 517), 'khe_R': (1530, 457, 1595, 517),
        'mui': (1636, 533), 'mieng': (1620, 610), 'cam': (1535, 694), 'not_ruoi': (1495, 391),
        'tai_R_tren': (1360, 435), 'tai_R_duoi': (1365, 580),
    },
}
# độ, ƯỚC LƯỢNG từ chính ảnh mẫu: mũi lệch khỏi đường giữa hai mắt (+10 px ở hình 1, +33 px ở hình 2; mũi nhô ≈ 5 cm trước mặt phẳng mắt, 1 px ≈ 1,06 mm)
# → sin θ ≈ 0,21 và 0,70. 0 = nhìn thẳng vào mặt, 90 = camera ở −X. Ảnh mẫu là phối cảnh còn phép đo là trực giao: mắt xa (L) ở hai góc quay kém tin cậy hơn mắt gần.
YAW = {'truoc': 12.0, 'goc34': 44.0, 'nghieng': 90.0}
HF_PX = {'truoc': 236.0, 'goc34': 234.0, 'nghieng': 237.0}         # cằm → đường mí trên trong ảnh mẫu (px)
NGUONG = {'truoc': 3.0, 'nghieng': 3.0, 'goc34': 4.0}              # % HF
SAI_SO_DOC = 1.3                                                   # % HF: sai số đọc toạ độ mốc trên lưới 20 px (±3 px); cộng vào ngưỡng khi gộp theo trung vị
CHAN_DOAN = {'tai_R_tren', 'tai_R_duoi'}                           # đo để báo, không tính vào khớp và ngưỡng (tai giữ nguyên theo thiết kế)


def chieu(p, yaw_deg):
    """Chiếu trực giao điểm thế giới (m) → (u, v) mét trên ảnh; v hướng xuống. Mặt nhân vật nhìn −Y; yaw dương = camera dịch sang −X."""
    t = math.radians(yaw_deg); x, y, z = p
    return (x * math.cos(t) - y * math.sin(t), -z)


def diem_tu_hop(h):
    """Hộp mắt (x0, y0, x1, y1) → 4 điểm trung điểm các cạnh."""
    x0, y0, x1, y1 = h; xm, ym = (x0 + x1) / 2, (y0 + y1) / 2
    return {'trai': (x0, ym), 'phai': (x1, ym), 'tren': (xm, y0), 'duoi': (xm, y1)}


def _khop(src, dst):
    """Bình phương tối thiểu: dst ≈ s·src + t (s vô hướng). Trả (s, tx, ty)."""
    n = len(src); sx = sum(p[0] for p in src) / n; sy = sum(p[1] for p in src) / n; dx = sum(p[0] for p in dst) / n; dy = sum(p[1] for p in dst) / n
    num = sum((a[0] - sx) * (b[0] - dx) + (a[1] - sy) * (b[1] - dy) for a, b in zip(src, dst))
    den = sum((a[0] - sx) ** 2 + (a[1] - sy) ** 2 for a in src)
    s = num / den; return s, dx - s * sx, dy - s * sy


def _sai_lech_anh(anh, dst_px, hf_px, bo_khop=()):
    """anh: tên → (u, v) mét trên ảnh; dst_px: tên → (px, py). Khớp tương đồng trên các mốc ngoài bo_khop; trả tên → % hf_px cho mọi mốc chung."""
    ten = [k for k in anh if k in dst_px]; kh = [k for k in ten if k.split('.')[0] not in bo_khop]
    s, tx, ty = _khop([anh[k] for k in kh], [dst_px[k] for k in kh])
    return {k: 100.0 * math.hypot(s * anh[k][0] + tx - dst_px[k][0], s * anh[k][1] + ty - dst_px[k][1]) / hf_px for k in ten}


def sai_lech_diem(pts_world, dst_px, yaw_deg, hf_px, bo_khop=()):
    """Bản cho mốc điểm: pts_world tên → (x, y, z) m."""
    return _sai_lech_anh({k: chieu(p, yaw_deg) for k, p in pts_world.items()}, dst_px, hf_px, bo_khop)


def _cuc_mat(pts_world, yaw_deg):
    """Điểm biên khe mắt của cage → 4 điểm cực của hộp trong ảnh (cùng quy ước diem_tu_hop với mẫu)."""
    uv = [chieu(p, yaw_deg) for p in pts_world]; u0, u1 = min(q[0] for q in uv), max(q[0] for q in uv); v0, v1 = min(q[1] for q in uv), max(q[1] for q in uv)
    return {'trai': (u0, (v0 + v1) / 2), 'phai': (u1, (v0 + v1) / 2), 'tren': ((u0 + u1) / 2, v0), 'duoi': ((u0 + u1) / 2, v1)}


def sai_lech(moc_cage):
    """moc_cage: {'mat_R': [điểm thế giới…], 'mat_L': […], 'khe_R': […], 'khe_L': […], 'mui': p, 'mieng': p, 'cam': p, 'not_ruoi': p, 'tai_R_tren': p, 'tai_R_duoi': p} (m, thế giới).
    Trả {góc: {mốc: % sai lệch}}; mắt và khe thành 4 mốc mỗi cái: 'mat_R.trai/phai/tren/duoi', 'khe_R.…'."""
    kq = {}
    for g, tab in MOC_MAU.items():
        yaw = YAW[g]; anh, dst = {}, {}
        for ten, val in tab.items():
            if ten not in moc_cage: continue
            if ten.startswith(('mat_', 'khe_')):
                cuc = _cuc_mat(moc_cage[ten], yaw)
                for c, q in diem_tu_hop(val).items(): anh[f'{ten}.{c}'] = cuc[c]; dst[f'{ten}.{c}'] = q
            else: anh[ten] = chieu(moc_cage[ten], yaw); dst[ten] = val
        kq[g] = _sai_lech_anh(anh, dst, HF_PX[g], CHAN_DOAN)
    return kq


def vuot_nguong(kq):
    """{góc: [(mốc, %)…]} các mốc vượt NGUONG, lớn nhất trước (mốc chẩn đoán không tính)."""
    return {g: sorted([(k, round(e, 2)) for k, e in d.items() if k.split('.')[0] not in CHAN_DOAN and e > NGUONG[g]], key=lambda x: -x[1]) for g, d in kq.items()}


def lay_moc_cage(head, ev_vs, ev_ps, to_world, idx):
    """Mốc của cage đang dựng, đọc từ bề mặt ĐÃ ĐÁNH GIÁ (Mirror + Subdivision, toạ độ thế giới) để đo đúng cái được render.
    head: object cage đầu (nửa x ≥ 0 = bên L); ev_vs/ev_ps: đỉnh/mặt của bản lắp ráp đã đánh giá; to_world: đổi hệ đầu gốc → thế giới; idx: HEAD_IDX."""
    import bpy
    from mathutils import Vector
    from mathutils.bvhtree import BVHTree
    bvh = BVHTree.FromPolygons(ev_vs, ev_ps); hv = head.data.vertices
    snap = lambda i: Vector(bvh.find_nearest(to_world(hv[i].co))[0])
    mir = lambda p: Vector((-p.x, p.y, p.z))
    vong = [snap(i) for i in idx['eye'][0]]                                   # 8 đỉnh viền mắt đầy đủ (nửa L)
    khe = [snap(i) for i in idx['eye'][4]]                                    # 8 đỉnh khe mắt hở (mép mí, nửa L)
    M = [snap(i) for i in idx['mouth'][3]]                                    # vòng khe môi (7 đỉnh nửa): giữa trên … khoé … giữa dưới
    tam_mieng = (M[0] + M[6]) / 2
    zm, ze = tam_mieng.z, sum(p.z for p in vong) / len(vong)
    mui = min((p for p in ev_vs if abs(p.x) < 0.015 and zm + 0.02 < p.z < ze - 0.02), key=lambda p: p.y)
    cam = min((p for p in ev_vs if p.y < tam_mieng.y + 0.10 and abs(p.x) < 0.02 and p.z > zm - 0.12), key=lambda p: p.z)   # điểm thấp nhất của cằm, trong 10 cm sau mặt miệng (loại cổ và thân; mẫu: cùng quy ước)
    ear = [p for p in (bpy.data.objects['Ear.R'].matrix_world @ v.co for v in bpy.data.objects['Ear.R'].data.vertices)]
    return {'mat_L': vong, 'mat_R': [mir(p) for p in vong], 'khe_L': khe, 'khe_R': [mir(p) for p in khe], 'mui': mui, 'mieng': tam_mieng, 'cam': cam,
            'not_ruoi': bpy.data.objects['Mole'].matrix_world.translation.copy(),
            'tai_R_tren': max(ear, key=lambda p: p.z), 'tai_R_duoi': min(ear, key=lambda p: p.z)}


def bang(kq):
    """Chuỗi bảng sai lệch (%) theo góc, đánh dấu vượt ngưỡng."""
    d = []
    for g, e in kq.items():
        d.append(f'{g} (ngưỡng {NGUONG[g]}%):  ' + '  '.join(f'{k} {v:.1f}{"!" if v > NGUONG[g] and k.split(".")[0] not in CHAN_DOAN else ""}' for k, v in sorted(e.items())))
    return '\n'.join(d)


def goi_y_dich(pts_world, dst_px, yaw_deg, bo_khop=()):
    """Sai lệch CÓ DẤU sau khi khớp tương đồng, đổi sang mm trong mặt phẳng ảnh để sửa: trả tên → (dx_mm, dz_mm), dx theo +x ảnh (phải), dz theo +z (lên).
    Gợi ý dịch cage = −(cage − mẫu): cage lệch phải thì dịch trái; cage thấp hơn mẫu thì dịch lên."""
    anh = {k: chieu(p, yaw_deg) for k, p in pts_world.items() if k in dst_px}
    kh = [k for k in anh if k.split('.')[0] not in bo_khop]
    s, tx, ty = _khop([anh[k] for k in kh], [dst_px[k] for k in kh]); out = {}
    for k, (u, v) in anh.items():
        rx, ry = s * u + tx - dst_px[k][0], s * v + ty - dst_px[k][1]       # px, + = cage ở bên phải / thấp hơn
        out[k] = (-rx / s * 1000.0, ry / s * 1000.0)
    return out


def _anh_dst(moc_cage, tab, yaw):
    """Gom mốc cage (chiếu trong ảnh, mét) và mốc mẫu (px) của một góc: mắt/khe thành 4 điểm cực, mốc điểm chiếu thẳng."""
    anh, dst = {}, {}
    for ten, val in tab.items():
        if ten not in moc_cage: continue
        if ten.startswith(('mat_', 'khe_')):
            cuc = _cuc_mat(moc_cage[ten], yaw)
            for c, q in diem_tu_hop(val).items(): anh[f'{ten}.{c}'] = cuc[c]; dst[f'{ten}.{c}'] = q
        else: anh[ten] = chieu(moc_cage[ten], yaw); dst[ten] = val
    return anh, dst


def goi_y_tu_cage(moc_cage):
    """{mốc điểm: {góc: (dx_mm, dz_mm)}}: lượng cần dịch cage (theo +x ảnh phải và +z lên) để hết lệch ở góc đó; khớp tỉ lệ + tịnh tiến dùng cả mắt làm điểm neo.
    Mặt nghiêng: ảnh phải = −y, nên dx của mặt nghiêng là −dy thế giới."""
    kq = {}
    for g, tab in MOC_MAU.items():
        anh, dst = _anh_dst(moc_cage, tab, YAW[g]); kh = [k for k in anh if k.split('.')[0] not in CHAN_DOAN]
        s, tx, ty = _khop([anh[k] for k in kh], [dst[k] for k in kh])
        for k in anh:
            if k.startswith(('mat_', 'khe_')) or k in CHAN_DOAN: continue
            kq.setdefault(k, {})[g] = (-(s * anh[k][0] + tx - dst[k][0]) / s * 1000.0, (s * anh[k][1] + ty - dst[k][1]) / s * 1000.0)
    return kq


# bề ngang toàn phần của khuôn mặt (px) ở hàng ảnh y của hình 1 (mặt trước) — đọc trên lưới 20 px; đường viền hàm của mẫu tròn rộng, không nhọn
HAM_MAU = {580: 347.0, 620: 317.0, 640: 291.0, 660: 238.0, 680: 143.0}
NGUONG_HAM = 4.5                         # % HF, trung vị các hàng (3,0 + sai số đọc 1,3 + 0,2 làm tròn)


def be_rong(vs, z, yaw_deg, dz=0.0015):
    """Bề ngang (m) trong ảnh của các đỉnh có |z − z0| < dz; None nếu không có."""
    us = [chieu(p, yaw_deg)[0] for p in vs if abs(p[2] - z) < dz]
    return (max(us) - min(us)) if us else None


def do_rong_ham(moc_cage, vs):
    """{hàng ảnh: (rộng cage px, rộng mẫu px, sai lệch % HF)} ở mặt trước, theo phép khớp của mặt trước. vs: đỉnh bề mặt đã đánh giá (thế giới, chỉ vùng đầu)."""
    anh, dst = _anh_dst(moc_cage, MOC_MAU['truoc'], YAW['truoc']); kh = [k for k in anh if k.split('.')[0] not in CHAN_DOAN]
    s, tx, ty = _khop([anh[k] for k in kh], [dst[k] for k in kh]); out = {}
    for hang, wm in HAM_MAU.items():
        w = be_rong(vs, -(hang - ty) / s, YAW['truoc'])
        if w is not None: out[hang] = (w * s, wm, 100.0 * abs(w * s - wm) / HF_PX['truoc'])
    return out
