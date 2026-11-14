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
    for r in (0, 1, 2, 11, 12):                          # trán trên/chân tóc, đáy cằm và dưới: không thuộc vùng dựng lại
        assert V.isdisjoint({i for i in I['grid'][r] if i is not None})
    for r in range(13):                                  # cột 5 trở ra (gò tai, thái dương, sau): ngoài vùng
        for k in range(5, 9): assert I['grid'][r][k] not in V
    assert all(i in V for ring in I['eye'] + I['mouth'] for i in ring)


def test_duong_khau_lien_ke_va_ngoai_vung():
    I = idx_gia(); V = MT.vung_mat(I); K = MT.duong_khau(I); G = I['grid']
    assert len(K) >= 20 and len(set(K)) == len(K) and V.isdisjoint(K)
    pos = {G[r][k]: (r, k) for r in range(13) for k in range(9) if G[r][k] is not None}
    for a, b in zip(K, K[1:]):
        (r0, k0), (r1, k1) = pos[a], pos[b]; assert abs(r0 - r1) + abs(k0 - k1) == 1, (a, b)   # hai đỉnh liền nhau trên lưới
    assert pos[K[0]] == (2, 0) and pos[K[-1]] == (11, 0)   # hai đầu nằm ở mặt phẳng đối xứng
