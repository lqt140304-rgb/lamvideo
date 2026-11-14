"""Dựng lại vùng mặt đầu Nam theo ảnh mẫu (Hồ sơ 02): định vùng mặt, đường khâu với sọ cũ, rồi mắt / mũi / má / miệng / cằm.
Dùng chỉ số HEAD_IDX của dung_dau_cage_nam (grid 13 hàng × 9 cột: hàng 0 đỉnh sọ … 12 dưới hàm; cột 0 giữa trước … 8 giữa sau).
Vùng mặt chỉ gồm lưới trán dưới → cằm, phần trước; sọ, tai, cổ, tóc không đụng."""

HANG_MAT = range(3, 11)        # 'mi_tren' … 'cam' (hàng 2 'tran' là hàng khâu dưới chân tóc; hàng 11–12 là đáy cằm/hàm giữ nguyên)
COT_MAT = range(0, 5)          # cột 0 (giữa trước) … 4 (góc 68°, má/thái dương); cột 5 là cột khâu ở ngoài vùng
HANG_KHAU_TREN, HANG_KHAU_DUOI, COT_KHAU = 2, 11, 5


def vung_mat(idx):
    """Tập chỉ số đỉnh cage đầu thuộc vùng dựng lại: ô lưới hàng 3–10 × cột 0–4, cùng mọi đỉnh vòng mắt và vòng miệng."""
    G = idx['grid']; v = {G[r][k] for r in HANG_MAT for k in COT_MAT if G[r][k] is not None}
    for ring in list(idx['eye']) + list(idx['mouth']): v.update(ring)
    return v


def duong_khau(idx):
    """Chuỗi đỉnh có thứ tự bao quanh vùng mặt (ngoài vùng, nơi mặt mới khâu vào sọ cũ): hàng 2 từ cột 0 → 5, cột 5 từ hàng 3 → 10, hàng 11 từ cột 5 → 0.
    Hai đầu nằm ở mặt phẳng đối xứng (cột 0)."""
    G = idx['grid']; ds = [G[HANG_KHAU_TREN][k] for k in range(0, COT_KHAU + 1)]
    ds += [G[r][COT_KHAU] for r in range(HANG_KHAU_TREN + 1, HANG_KHAU_DUOI)]
    ds += [G[HANG_KHAU_DUOI][k] for k in range(COT_KHAU, -1, -1)]
    return [i for i in ds if i is not None]


def kiem_vung_mat(head, idx, to_world, jaw_w, tam_tai):
    """Kiểm hình học trên cage đầu thật. Trả (ok, mô tả).
    • đường khâu ≥ 20 đỉnh, kín (đầu cuối ở mặt phẳng đối xứng);
    • trọng số hàm đổi ≤ 0,35 qua mỗi cạnh nối đường khâu với vùng mặt (hàm không kéo rách mép khâu);
    • mọi đỉnh vùng mặt cách tâm tai ≥ 6 cm (gò tai, thái dương không bị vùng mặt chạm tới)."""
    V = vung_mat(idx); K = duong_khau(idx); hv = head.data.vertices
    kv = set(K); gmax = 0.0
    for e in head.data.edges:
        a, b = e.vertices
        if (a in kv and b in V) or (b in kv and a in V): gmax = max(gmax, abs(jaw_w.get(a, 0.0) - jaw_w.get(b, 0.0)))
    dmin = min((to_world(hv[i].co) - tam_tai).length for i in V)
    dau = [abs(hv[K[0]].co.x), abs(hv[K[-1]].co.x)]
    ok = len(K) >= 20 and max(dau) < 1e-6 and gmax <= 0.35 and dmin >= 0.06
    return ok, f'vùng mặt {len(V)} đỉnh, đường khâu {len(K)} đỉnh (đầu cuối x {max(dau):.1e}); chênh trọng số hàm qua mép khâu {gmax:.2f} (≤ 0,35); cách tâm tai gần nhất {dmin * 100:.1f} cm (≥ 6)'
