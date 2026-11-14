"""Vùng mặt và đường khâu trên lưới giả 13×9 đúng hình dạng HEAD_IDX của cage (không cần bpy)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import mat_theo_mau_nam as MT


def idx_gia():
    G = [[r * 9 + k for k in range(9)] for r in range(13)]; G[4][2] = None; G[8][0] = G[8][1] = None   # ô mắt giữa và hai ô môi bỏ như cage thật
    n = 13 * 9
    eye = [list(range(n + 8 * i, n + 8 * i + 8)) for i in range(9)]; n += 72
    mouth = [list(range(n + 7 * i, n + 7 * i + 7)) for i in range(7)]; n += 49
    neck = [list(range(n, n + 7)), list(range(n + 7, n + 14))]
    return {'grid': G, 'eye': eye, 'mouth': mouth, 'neck': neck}


def test_vung_mat_khong_chua_co_va_hang_ngoai():
    I = idx_gia(); V = MT.vung_mat(I)
    assert V.isdisjoint(set(I['neck'][0]) | set(I['neck'][1]))
    for r in (0, 1, 2, 12):                              # trán trên/chân tóc và hàng dưới hàm (hàng khâu với cổ): không thuộc vùng dựng lại
        assert V.isdisjoint({i for i in I['grid'][r] if i is not None})
    for r in range(13):                                  # cột 5 trở ra (gò tai, thái dương, sau): ngoài vùng
        for k in range(5, 9): assert I['grid'][r][k] not in V
    assert all(i in V for ring in I['eye'] + I['mouth'] for i in ring)


def test_duong_khau_lien_ke_va_ngoai_vung():
    I = idx_gia(); V = MT.vung_mat(I); K = MT.duong_khau(I); G = I['grid']
    assert len(K) >= 21 and len(set(K)) == len(K) and V.isdisjoint(K)
    pos = {G[r][k]: (r, k) for r in range(13) for k in range(9) if G[r][k] is not None}
    for a, b in zip(K, K[1:]):
        (r0, k0), (r1, k1) = pos[a], pos[b]; assert abs(r0 - r1) + abs(k0 - k1) == 1, (a, b)   # hai đỉnh liền nhau trên lưới
    assert pos[K[0]] == (2, 0) and pos[K[-1]] == (12, 0)   # hai đầu nằm ở mặt phẳng đối xứng


def test_shepard_dich_deu_va_ghim():
    """Không có điểm ghim: mọi điểm tự do dịch đúng bằng độ dịch chung. Có điểm ghim đứng yên: điểm sát ghim ≈ 0, điểm sát mover ≈ độ dịch của mover."""
    P = {1: (0.0, 0, 0), 2: (0.05, 0, 0), 3: (0.10, 0, 0), 4: (0.30, 0, 0)}
    d = MT.shepard(P, {1: (0.0, 0.0, 0.01)}, [], [2, 3, 4])
    assert all(abs(v[2] - 0.01) < 1e-9 for v in d.values())
    d = MT.shepard({**P, 5: (0.31, 0, 0)}, {1: (0.0, 0.0, 0.01)}, [5], [2, 3, 4])
    assert d[2][2] > 0.8 * 0.01 and d[4][2] < 0.2 * 0.01 and d[2][2] > d[3][2] > d[4][2]
