"""Dựng lại vùng mặt đầu Nam theo ảnh mẫu (Hồ sơ 02): định vùng mặt, đường khâu với sọ cũ, rồi mắt / mũi / má / miệng / cằm.
Dùng chỉ số HEAD_IDX của dung_dau_cage_nam (grid 13 hàng × 9 cột: hàng 0 đỉnh sọ … 12 dưới hàm; cột 0 giữa trước … 8 giữa sau).
Vùng mặt chỉ gồm lưới trán dưới → cằm, phần trước; sọ, tai, cổ, tóc không đụng."""
import math

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


def shepard(pos, movers, ghim, tu_do, mu=2.0, eps=1e-6):
    """Nội suy độ dịch kiểu Shepard (trọng số nghịch đảo khoảng cách^mu): pos id → (x, y, z); movers id → độ dịch (dx, dy, dz); ghim = id đứng yên (độ dịch 0);
    tu_do = id cần tính. Trả id → độ dịch. Không ghim thì mọi điểm tự do dịch đúng bằng trung bình có trọng số của movers; có ghim thì giảm về 0 gần ghim."""
    nguon = [(pos[i], movers[i]) for i in movers] + [(pos[i], (0.0, 0.0, 0.0)) for i in ghim]
    out = {}
    for i in tu_do:
        p = pos[i]; sw = 0.0; s = [0.0, 0.0, 0.0]
        for q, d in nguon:
            w = 1.0 / (((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2) + eps) ** (mu / 2)
            sw += w; s[0] += w * d[0]; s[1] += w * d[1]; s[2] += w * d[2]
        out[i] = (s[0] / sw, s[1] / sw, s[2] / sw)
    return out


def kiem_khau(head, idx, ten_key='Mo_Ham'):
    """Mép khâu mặt/sọ trên cage đầu. Trả (ok, mô tả). Đo trên MẶT GIỚI HẠN (sau Subdivision) vì góc cạnh của lưới điều khiển (mép cằm–đáy hàm ≈ 95–119°) là hình dạng tự nhiên chứ không phải nếp.
    • pháp tuyến mặt giới hạn đổi ≤ 35° giữa hai đỉnh khâu liền nhau;
    • trung bình ≤ 27° giữa mỗi đỉnh khâu và đỉnh vùng mặt kề nó (đường cơ sở của cage cũ đo được 24,9°: độ cong tự nhiên giữa các ô; ngưỡng = cơ sở + 2°, tức mép khâu không được xấu đi);
    • khi mở hàm (shape key `ten_key` = 1): chiều dài cạnh dọc đường khâu và cạnh nối khâu–vùng mặt đổi ≤ 15% so với lúc nghỉ."""
    import bpy
    K = duong_khau(idx); V = vung_mat(idx); me = head.data; kv = set(K)
    dg = bpy.context.evaluated_depsgraph_get(); ev = head.evaluated_get(dg); em = ev.to_mesh(); nrm = {i: em.vertices[i].normal.copy() for i in range(len(me.vertices))}; ev.to_mesh_clear()
    gap = [math.degrees(nrm[a].angle(nrm[b])) for a, b in zip(K, K[1:])]
    cheo = []
    for e in me.edges:
        a, b = e.vertices
        if (a in kv and b in V) or (b in kv and a in V): cheo.append(math.degrees(nrm[a].angle(nrm[b])))
    kb = me.shape_keys.key_blocks.get(ten_key); gian = 0.0
    if kb:
        base = me.shape_keys.key_blocks['Basis'].data
        for e in me.edges:
            a, b = e.vertices
            if (a in kv or b in kv) and (a in kv or a in V) and (b in kv or b in V):
                l0 = (base[a].co - base[b].co).length; l1 = (kb.data[a].co - kb.data[b].co).length
                if l0 > 1e-6: gian = max(gian, abs(l1 / l0 - 1.0))
    gm = max(gap) if gap else 0.0; cm = sum(cheo) / len(cheo) if cheo else 0.0
    ok = gm <= 35.0 and cm <= 27.0 and gian <= 0.15
    return ok, f'đường khâu (mặt giới hạn): pháp tuyến đổi lớn nhất {gm:.1f}° giữa hai đỉnh liền nhau (≤ 35), trung bình qua cạnh khâu–mặt {cm:.1f}° (≤ 27; cơ sở 24,9); khi {ten_key} cạnh giãn tối đa {gian * 100:.1f}% (≤ 15)'
