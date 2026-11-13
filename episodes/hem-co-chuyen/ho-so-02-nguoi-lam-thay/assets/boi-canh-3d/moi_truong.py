"""Không gian xung quanh phòng trọ — dựng mới, mỗi chỗ một kiểu (không lặp mô-đun).

Bố cục (toạ độ thiết kế: x = 0 là tường cửa phòng, hành lang ở x < 0, sân giữa ở x ≈ −1,5…−7,6, y chạy dọc hành lang):
  • Nhà trọ chữ I 4 tầng quanh sân: tầng 1 (trệt, cột + cửa cuốn + xe), tầng 2 (phòng Nam), tầng 3, mái (bể nước, ăng-ten).
  • Dãy trọ đối diện 4 tầng: mỗi phòng một màu cửa, đồ trước cửa, ánh đèn, lồng sắt, quần áo (sinh ngẫu nhiên có hạt giống, không sao chép).
  • Sân: gạch lát, bồn cây, 2 cây lớn, xe máy đủ màu, thùng rác, cột điện + dây chằng chịt, cổng.
  • Hẻm bên cửa sổ phòng Nam: tường nhà hàng xóm 2,2 m với cửa sổ có lồng sắt, máy lạnh, dây điện, quần áo, ống nước.
  • Chân trời: lớp nhà cao tầng xa mờ sương, hai phía; bầu trời có mây (ngày) / sao + trăng (đêm).
Mọi đối tượng bắt đầu bằng `env_` (camera ngoài phòng không ẩn chúng).
"""
import bpy, math, random
from mathutils import Vector

_cache = {}


def build(X, m, coll, night, hl_y1):
    _cache.clear()  # vật liệu cũ có thể đã bị xoá khi dựng lại cảnh
    box, cyl, sphere, torus, M = X.box, X.cyl, X.sphere, X.torus, X.M
    W, D, H, T = X.W, X.D, X.H, X.T
    GZ = -2.92            # mặt sân (tầng 1)
    FL = 2.92             # chiều cao một tầng
    X0 = -1.45            # lan can hành lang phía phòng Nam
    EX = -T
    Y0, Y1 = -0.6, hl_y1
    BX = -7.6             # mặt lan can dãy đối diện

    def mat(color, rough=0.7, metal=0.0):
        k = (color, rough, metal)
        if k not in _cache: _cache[k] = M.solid('e_' + color.strip('#') + f'_{int(rough*10)}', color, rough, metal)
        return _cache[k]

    def plaster(color, name=None):
        k = ('p', color)
        if k not in _cache: _cache[k] = M.phong_tran('ep_' + color.strip('#'), color)
        return _cache[k]

    def glow(color, s):
        k = ('g', color, s)
        if k not in _cache: _cache[k] = M.emission('eg_' + color.strip('#') + str(s), color, s)
        return _cache[k]

    def B(name, *a, **kw): return box('env_' + name, *a, **kw)
    rnd = random.Random(2026)
    glass_dark = mat('#5d727c', 0.5)
    inox = mat('#b9bdbb', 0.35, 0.8); steel = mat('#2b2d2e', 0.45, 0.7); white = mat('#ece8dc', 0.6); concrete = plaster('#a9a69b')

    # ------------------------------------------------------------ sân + sàn các tầng của nhà trọ
    if getattr(X, 'MODE_HIEN_TAI', 'day') == 'rain':
        _wet = M.tiles('env_san_uot', '#7d7a6c', '#575448', 0.6)
        for _n in _wet.node_tree.nodes:
            if _n.type == 'BSDF_PRINCIPLED': _n.inputs['Roughness'].default_value = 0.1
    B('san_tang1', -30, EX, -14, 96, GZ - 0.2, GZ, (M.tiles('env_san_uot', '#7d7a6c', '#575448', 0.6) if getattr(X, 'MODE_HIEN_TAI', 'day') == 'rain' else M.tiles('env_san', '#b3ad9b', '#8a8577', 0.6)), coll=coll)
    for (x0, x1, y0, y1, c) in [(-2.8, -2.1, 4, 9, '#7b9a5b'), (-2.8, -2.1, 11, 14, '#6f9455'), (-2.8, -2.1, 17, 21, '#7b9a5b'), (-2.8, -2.1, -2.2, 0.8, '#6f9455')]:
        B('bon_cay', x0, x1, y0, y1, GZ, GZ + 0.28, plaster('#8a8272'), bevel=0.01, coll=coll)
        B('dat_bon', x0 + 0.06, x1 - 0.06, y0 + 0.06, y1 - 0.06, GZ + 0.26, GZ + 0.3, mat(c, 0.95), coll=coll)
    # cột + dầm tầng trệt dưới hành lang, tường tầng trệt có cửa cuốn
    for i in range(int((Y1 - Y0) / 3.3) + 1):
        y = Y0 + 0.2 + i * 3.3
        B(f'cot_t1_{i}', X0, X0 + 0.28, y, y + 0.28, GZ, -0.1, plaster('#c8c3b2'), coll=coll)
    B('dam_t1', X0 - 0.02, X0 + 0.3, Y0, Y1, -0.5, -0.1, plaster('#c8c3b2'), coll=coll)
    B('tuong_t1', EX, 0.0, Y0, Y1, GZ, -0.1, plaster('#d8cdb0'), coll=coll)
    shop = [(1.2, 3.4, '#b64a3c', 'TẠP HÓA'), (4.1, 6.6, '#3c6e88', 'CÀ PHÊ'), (9.0, 11.2, '#c89b3c', 'GIẶT ỦI'), (14.2, 16.0, '#6b8a5a', 'SỬA XE')]
    for i, (a, b, c, tx) in enumerate(shop):
        B(f'cua_cuon{i}', EX - 0.1, EX, a, b, GZ, GZ + 2.4, mat('#9ea4a6' if i % 2 else '#8f9a98', 0.45, 0.6), coll=coll)
        for k in range(14): B(f'cuon_ke{i}_{k}', EX - 0.11, EX - 0.1, a, b, GZ + 0.15 + k * 0.17, GZ + 0.17 + k * 0.17, mat('#7b8284', 0.5, 0.6), coll=coll)
        B(f'bang_hieu{i}', EX - 0.18, EX - 0.04, a - 0.25, b + 0.25, GZ + 2.45, GZ + 2.85, mat(c, 0.55), bevel=0.01, coll=coll)
        B(f'chu_hieu{i}', EX - 0.2, EX - 0.18, a, b, GZ + 2.55, GZ + 2.75, glow('#fff1c9', 1.5 if night else 0.2), coll=coll)
    for i in range(7):  # đồ trưng trước tiệm: ghế nhựa, thùng, quạt
        y = rnd.uniform(1.2, 16.5)
        B(f'ghe_nhua{i}', X0 + 0.4, X0 + 0.8, y, y + 0.4, GZ, GZ + 0.45, mat(rnd.choice(['#c24a3a', '#3b6ea5', '#e3b84a']), 0.55), bevel=0.03, coll=coll)
    # tầng 3: sàn = trần hành lang phòng Nam; tường, cửa, lan can, mái
    z3 = H + 0.12
    B('tuong_t3', EX, 0.0, Y0, Y1, z3, z3 + 2.8, plaster('#d8c9a6'), coll=coll)
    B('mai_t3', X0 - 0.3, 0.0, Y0 - 1.3, Y1, z3 + 2.8, z3 + 2.95, plaster('#b9b5a8'), coll=coll)
    B('mai_ton', X0 - 0.6, 0.6, Y0 - 1.3, Y1 + 0.4, z3 + 2.95, z3 + 3.12, mat('#8c8f86', 0.55, 0.6), coll=coll)
    B('lancan_t3', X0, X0 + 0.14, Y0, Y1, z3, z3 + 0.5, plaster('#d8c9a6'), coll=coll)
    B('tay_vin_t3', X0 - 0.01, X0 + 0.15, Y0, Y1, z3 + 1.0, z3 + 1.04, steel, coll=coll)
    for i in range(int((Y1 - Y0) / 0.14)): B(f'song_t3_{i}', X0 + 0.05, X0 + 0.09, Y0 + 0.05 + i * 0.14, Y0 + 0.07 + i * 0.14, z3 + 0.5, z3 + 1.0, steel, coll=coll)
    cols3 = ['#7f9a6f', '#a65a4a', '#5c7b9c', '#c4a259', '#6d6b78', '#8a6a4a', '#4f8a80', '#b88a8a']
    X.DOORS3 = []; a = 1.0 + rnd.uniform(0, 0.6); prev = -1
    while a < Y1 - 2.0:   # cửa không đều nhau: bề rộng, khoảng cách, màu, lưới sắt, cửa sổ nhỏ, giày dép, chậu cây, ghế, biển số — mỗi nhà một kiểu
        w = rnd.choice([0.8, 0.85, 0.9, 0.95]); ci = rnd.randrange(8)
        while ci == prev: ci = rnd.randrange(8)
        prev = ci; X.DOORS3.append((a - 0.1, a + w + 0.1)); tg = f'{a:.1f}'
        B(f'cua_t3_{tg}', EX - 0.04, EX, a, a + w, z3, z3 + rnd.choice([2.05, 2.1, 2.15]), mat(cols3[ci], 0.55), bevel=0.006, coll=coll)
        B(f'khuon_t3_{tg}', EX - 0.03, EX + 0.02, a - 0.06, a + w + 0.06, z3, z3 + 2.16, rnd.choice([white, mat('#cfc4a4', 0.6), mat('#a8a08a', 0.6)]), coll=coll)
        v = rnd.random()
        if v < 0.3:   # cửa lưới sắt bên ngoài
            B(f'luoi_khung_t3_{tg}', EX - 0.09, EX - 0.07, a - 0.02, a + w + 0.02, z3, z3 + 2.12, steel, coll=coll)
            for j in range(7): B(f'luoi_t3_{tg}_{j}', EX - 0.09, EX - 0.07, a + 0.03 + j * (w - 0.06) / 6, a + 0.045 + j * (w - 0.06) / 6, z3, z3 + 2.12, steel, coll=coll)
        elif v < 0.5:  # rèm hoa phía trên cửa (ô thoáng)
            B(f'rem_t3_{tg}', EX - 0.07, EX - 0.06, a + 0.05, a + w - 0.05, z3 + 1.2, z3 + 1.95, mat(rnd.choice(['#d8b8b8', '#b8c8d8', '#d8d0a0']), 0.95), coll=coll)
        if rnd.random() < 0.45:   # cửa sổ nhỏ bên cạnh có song sắt
            sa = a + w + rnd.uniform(0.18, 0.35); sw = rnd.choice([0.45, 0.55])
            B(f'sonho_t3_{tg}', EX - 0.03, EX, sa, sa + sw, z3 + 1.0, z3 + 1.65, glass_dark, coll=coll)
            for j in range(3): B(f'sonho_song_{tg}_{j}', EX - 0.05, EX - 0.04, sa + 0.08 + j * (sw - 0.16) / 2, sa + 0.1 + j * (sw - 0.16) / 2, z3 + 1.0, z3 + 1.65, steel, coll=coll)
        if rnd.random() < 0.4:   # giày dép trước cửa
            for j in range(rnd.randint(2, 4)): B(f'giay_t3_{tg}_{j}', EX - 0.32 + 0.05 * (j % 2), EX - 0.2 + 0.05 * (j % 2), a + 0.05 + j * 0.2, a + 0.13 + j * 0.2, z3, z3 + 0.07, mat(rnd.choice(['#3a3a3a', '#8a4a3a', '#2a4a6a', '#d8d0b0']), 0.8), coll=coll, rot=(0, 0, rnd.uniform(-0.3, 0.3)))
        if rnd.random() < 0.3:   # chậu cây trước cửa
            cyl(f'env_chau_t3_{tg}', EX - 0.3, a + w + 0.1, z3 + 0.14, 0.13, 0.28, mat('#b0623a', 0.85), coll=coll)
            for j in range(4): sphere(f'env_la_chau_t3_{tg}_{j}', EX - 0.3 + rnd.uniform(-0.08, 0.08), a + w + 0.1 + rnd.uniform(-0.08, 0.08), z3 + 0.4 + 0.1 * j, rnd.uniform(0.1, 0.16), mat(rnd.choice(['#4f7a3a', '#6a9a4a', '#3a6a3a']), 0.85), coll=coll)
        if rnd.random() < 0.25: cyl(f'env_ghe_t3_{tg}', EX - 0.4, a - 0.25, z3 + 0.15, 0.15, 0.3, mat(rnd.choice(['#c24a3a', '#3b6ea5', '#e3b84a']), 0.55), coll=coll, bevel=0.02)
        if rnd.random() < 0.5: B(f'so_phong_t3_{tg}', EX - 0.03, EX, a + w / 2 - 0.07, a + w / 2 + 0.07, z3 + 2.2, z3 + 2.32, mat(rnd.choice(['#2f5f9a', '#d8d4c8', '#8a2a2a']), 0.5), coll=coll)
        if rnd.random() < 0.3: B(f'phoi_t3_{tg}', X0 + 0.1, X0 + rnd.uniform(0.5, 1.2), a - 0.2, a + rnd.uniform(0.3, 0.8), z3 + 1.9, z3 + 1.94, mat('#3a3a3a', 0.5), coll=coll)
        a += w + rnd.uniform(0.9, 2.4)
    # mái: bể nước, ăng-ten, giàn năng lượng mặt trời
    rt = z3 + 3.12
    for k, (y, r) in enumerate([(4.0, 0.62), (11.0, 0.55), (19.0, 0.62)]):
        B(f'be_dau{k}', -0.9, -0.2, y - 0.5, y + 0.5, rt, rt + 0.55, plaster('#b4b0a2'), coll=coll)
        cyl(f'env_be_nuoc{k}', -0.55, y, rt + 0.55 + r * 0.9, r, r * 1.8, mat('#2f6fb0' if k % 2 == 0 else '#b9bdbb', 0.35, 0.3 if k % 2 else 0.0), coll=coll, bevel=0.02)
    for k, y in enumerate([2.0, 8.0, 15.5]):
        cyl(f'env_angten{k}', -0.4, y, rt + 1.2, 0.012, 2.4, steel, coll=coll)
        for j in range(4): B(f'angten_n{k}_{j}', -0.4 - 0.5 + j * 0.0, -0.4 + 0.5, y - 0.01, y + 0.01, rt + 0.9 + j * 0.3, rt + 0.92 + j * 0.3, steel, coll=coll)

    # ------------------------------------------------------------ nhà đối diện 4 tầng, mỗi phòng một kiểu
    BACK = -9.2
    B('nha_doi_dien_than', -16, BACK, Y0 - 12, Y1 + 12, GZ, GZ + FL * 4 + 0.2, plaster('#d9cba5'), coll=coll)
    for fl in range(4):
        zb = GZ + fl * FL
        B(f'dd_san{fl}', BACK, BX, Y0 - 12, Y1 + 12, zb - 0.12, zb, plaster('#cfc9b6'), coll=coll)
        B(f'dd_tuong_thap{fl}', BX - 0.14, BX, Y0 - 12, Y1 + 12, zb, zb + 0.55, plaster('#d8d0b8'), coll=coll)
        B(f'dd_tay_vin{fl}', BX - 0.15, BX + 0.01, Y0 - 12, Y1 + 12, zb + 1.02, zb + 1.06, steel, coll=coll)
        for i in range(int((Y1 - Y0 + 24) / 0.16)):
            B(f'dd_song{fl}_{i}', BX - 0.1, BX - 0.07, Y0 - 12 + 0.06 + i * 0.16, Y0 - 12 + 0.08 + i * 0.16, zb + 0.55, zb + 1.02, steel, coll=coll)
        for i, y in enumerate([Y0 - 12 + k * 3.0 for k in range(int((Y1 - Y0 + 24) / 3.0) + 1)]):
            B(f'dd_tru{fl}_{i}', BX - 0.16, BX, y, y + 0.14, zb + 0.55, zb + 1.04, plaster('#d8d0b8'), coll=coll)
        # phòng: cửa chính + cửa sổ lồng sắt, mỗi phòng khác nhau
        y = Y0 - 11.0
        pal = ['#6d887c', '#9a6f5e', '#5c7b9c', '#c4a259', '#7f6a8a', '#8c8c8c', '#a85a4a', '#4f8a80', '#b09a78']
        idx = 0
        while y < Y1 + 10:
            r = random.Random(hash((fl, idx)) & 0xffff)
            wdoor = r.choice([0.8, 0.85, 0.9]); cc = r.choice(pal)
            lit = night and r.random() < 0.55
            open_door = r.random() < 0.12
            nm = f'{fl}_{idx}'
            B(f'dd_cua{nm}', BACK, BACK + 0.04, y, y + wdoor, zb, zb + 2.05, mat(cc, 0.55), bevel=0.006, coll=coll) if not open_door else B(f'dd_cua_mo{nm}', BACK, BACK + 0.7, y, y + 0.03, zb, zb + 2.05, mat(cc, 0.55), coll=coll)
            if open_door:  # cửa mở thấy ánh đèn trong phòng
                B(f'dd_trong{nm}', BACK, BACK + 0.03, y, y + wdoor, zb, zb + 2.05, glow('#ffd79a' if night else '#8b7f6a', 2.5 if night else 0.4), coll=coll)
            wy = y + wdoor + 0.25; ww = r.choice([0.7, 0.9, 1.1])
            B(f'dd_so{nm}', BACK, BACK + 0.03, wy, wy + ww, zb + 0.95, zb + 1.9, glow(r.choice(['#ffd79a', '#ffc88a', '#e8dcc0']), 0.9) if lit else glass_dark, coll=coll)
            B(f'dd_vien_so{nm}', BACK - 0.09, BACK - 0.05, wy - 0.05, wy + ww + 0.05, zb + 0.9, zb + 1.95, white, coll=coll) if False else None
            if lit:  # rèm
                B(f'dd_rem{nm}', BACK + 0.03, BACK + 0.05, wy, wy + ww * r.uniform(0.25, 0.5), zb + 0.95, zb + 1.9, mat(r.choice(['#b88a6a', '#8aa0b8', '#c9b07a', '#9a6a7a']), 0.9), coll=coll)
            if r.random() < 0.6:  # lồng sắt ("chuồng cọp") phía ngoài cửa sổ
                B(f'dd_long{nm}', BACK - 0.5, BACK - 0.05, wy - 0.05, wy + ww + 0.05, zb + 0.9, zb + 1.95, mat('#3b3d3e', 0.5, 0.6), coll=coll) if False else None
                for k in range(5): B(f'dd_longsat{nm}_{k}', BACK + 0.35, BACK + 0.37, wy - 0.05 + k * (ww + 0.1) / 4, wy - 0.03 + k * (ww + 0.1) / 4, zb + 0.9, zb + 1.95, steel, coll=coll)
            # đồ trước cửa: mỗi phòng một thứ khác
            kind = r.choice(['xe_dap', 'cay', 'phoi', 'may_giat', 'giay', 'ghe', 'quat', 'binh', 'trong', 'thung'])
            cx = BACK + 0.7 + r.uniform(0, 0.4)
            if kind == 'xe_dap':
                torus(f'env_banh{nm}a', cx - 0.1, y + 0.2, zb + 0.32, 0.3, 0.012, steel, rot=(math.pi / 2, 0, 0), coll=coll); torus(f'env_banh{nm}b', cx - 0.1, y + 0.9, zb + 0.32, 0.3, 0.012, steel, rot=(math.pi / 2, 0, 0), coll=coll)
                B(f'khung_xd{nm}', cx - 0.11, cx - 0.09, y + 0.2, y + 0.9, zb + 0.55, zb + 0.58, mat('#c24a3a', 0.5), coll=coll)
            elif kind == 'cay':
                for k in range(r.randint(2, 4)):
                    cyl(f'env_chau{nm}{k}', cx - 0.2, y + 0.1 + k * 0.3, zb + 0.15, 0.1, 0.3, mat(r.choice(['#b0605a', '#6a8aa6', '#c9a15a']), 0.7), coll=coll, bevel=0.01)
                    sphere(f'env_la{nm}{k}', cx - 0.2, y + 0.1 + k * 0.3, zb + 0.37, 0.13, mat('#4f7a4a', 0.8), scale=(1, 1, 0.8), coll=coll)
                    cyl(f'env_than_la{nm}{k}', cx - 0.2, y + 0.1 + k * 0.3, zb + 0.33, 0.012, 0.08, mat('#5a4a2a', 0.9), coll=coll)
            elif kind == 'phoi':
                B(f'phoi_k{nm}', BX - 0.25, BX - 0.2, y, y + 1.4, zb + 1.7, zb + 1.72, steel, coll=coll)
                for k in range(r.randint(2, 4)): B(f'ao{nm}{k}', BX - 0.24, BX - 0.22, y + 0.1 + k * 0.33, y + 0.38 + k * 0.33, zb + 1.2, zb + 1.7, mat(r.choice(['#e8e4d8', '#7fa0c0', '#d8a05a', '#8a6a9a', '#5a7a5a']), 0.9), coll=coll)
            elif kind == 'may_giat':
                B(f'may_giat{nm}', cx - 0.3, cx + 0.05, y + 0.1, y + 0.45, zb, zb + 0.9, mat('#d8dcdc', 0.4), bevel=0.02, coll=coll)
            elif kind == 'giay':
                for k in range(3): B(f'giay{nm}{k}', cx - 0.15, cx - 0.02, y + 0.05 + k * 0.2, y + 0.18 + k * 0.2, zb, zb + 0.07, mat(r.choice(['#3d4a6b', '#9a6a4a', '#d8d2c2']), 0.7), bevel=0.02, coll=coll)
            elif kind == 'ghe':
                B(f'ghe_n{nm}', cx - 0.3, cx - 0.0, y + 0.05, y + 0.35, zb, zb + 0.45, mat(r.choice(['#c24a3a', '#3b6ea5', '#e3b84a']), 0.55), bevel=0.03, coll=coll)
            elif kind == 'quat':
                cyl(f'env_quat{nm}', cx - 0.15, y + 0.2, zb + 0.5, 0.012, 1.0, steel, coll=coll); cyl(f'env_quat_c{nm}', cx - 0.15, y + 0.2, zb + 1.05, 0.2, 0.05, mat('#99aabb', 0.4), axis='X', coll=coll)
            elif kind == 'binh':
                cyl(f'env_binh{nm}', cx - 0.15, y + 0.15, zb + 0.28, 0.16, 0.55, mat('#4a7a9a', 0.45), coll=coll)
            elif kind == 'thung':
                B(f'thung{nm}', cx - 0.4, cx - 0.05, y + 0.05, y + 0.45, zb, zb + 0.4, mat('#b89a6a', 0.9), bevel=0.01, coll=coll)
            if r.random() < 0.3:  # máy lạnh treo ngoài
                B(f'may_lanh{nm}', BX - 0.3, BX - 0.0, y + wdoor + 0.45 + r.uniform(0, 0.3), y + wdoor + 1.3, zb + 2.15, zb + 2.55, mat('#e3e0d8', 0.4), bevel=0.02, coll=coll) if False else None
            y += wdoor + ww + 0.6 + r.uniform(0.1, 0.4); idx += 1
    # mái dãy đối diện: bể nước, lan can, ăng-ten, dây phơi
    rz = GZ + FL * 4 + 0.2
    B('dd_mai', -16, BACK + 0.1, Y0 - 12, Y1 + 12, rz, rz + 0.18, plaster('#b4b0a2'), coll=coll)
    B('dd_ranh_mai', BX - 0.2, BX + 0.0, Y0 - 12, Y1 + 12, rz, rz + 0.5, plaster('#cfc9b6'), coll=coll)
    for k in range(7):
        y = Y0 - 8 + k * 5.2 + rnd.uniform(-0.8, 0.8)
        cyl(f'env_dd_be{k}', -11.5 - rnd.uniform(0, 1.5), y, rz + 0.18 + 0.55 + rnd.uniform(0, 0.1), rnd.uniform(0.5, 0.72), 1.3, mat(rnd.choice(['#2f6fb0', '#b9bdbb', '#c9c2ae']), 0.4), coll=coll, bevel=0.02)

    # ------------------------------------------------------------ sân: cây, xe máy, cột điện, dây
    def canh(x, y, z, dx, dy, dz, r=0.05):
        L = math.sqrt(dx * dx + dy * dy + dz * dz)
        bm_ = None
        ob = cyl(f'env_canh{x:.0f}{y:.0f}{z:.1f}', x + dx / 2, y + dy / 2, z + dz / 2, r, L, mat('#5a4636', 0.95), coll=coll)
        ob.rotation_mode = 'QUATERNION'; ob.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(Vector((-dx, dy, dz)).normalized())
    def tree(x, y, h, tint='#4f7a4a', kind='tron'):
        if kind == 'cau':   # cau/dừa cảnh: thân mảnh cao, tán lá dài toả ra
            cyl(f'env_than_cay{x:.0f}{y:.0f}', x, y, GZ + h * 0.45, 0.08, h * 0.9, mat('#8a7a5a', 0.9), coll=coll)
            for k in range(8):
                a_ = k * 0.785; canh(x, y, GZ + h * 0.9, 1.2 * math.cos(a_), 1.2 * math.sin(a_), -0.25, 0.025)
                sphere(f'env_la_cau{x:.0f}{y:.0f}{k}', x + 1.0 * math.cos(a_), y + 1.0 * math.sin(a_), GZ + h * 0.9 - 0.2, 0.55, mat('#5a8a3a', 0.85), scale=(1, 0.25, 0.12), coll=coll)
            return
        cyl(f'env_than_cay{x:.0f}{y:.0f}', x, y, GZ + h * 0.4, 0.16, h * 0.8, mat('#5a4636', 0.95), coll=coll, bevel=0.02)          # THÂN cây (đã thiếu sau lần thêm cành)
        cyl(f'env_goc_cay{x:.0f}{y:.0f}', x, y, GZ + 0.18, 0.24, 0.36, mat('#4a3a2c', 0.95), coll=coll, bevel=0.03)                 # gốc loe
        for k in range(5):  # rễ nổi
            a_ = k * 1.26; canh(x + 0.2 * math.cos(a_), y + 0.2 * math.sin(a_), GZ + 0.12, 0.28 * math.cos(a_), 0.28 * math.sin(a_), -0.1, 0.05)
        for k in range(4):  # cành chính toả ra từ thân
            a = k * 1.57 + rnd.uniform(0, 0.6); canh(x, y, GZ + h * 0.5, 0.9 * math.cos(a), 0.9 * math.sin(a), h * 0.22, 0.07)
        wide = 1.7 if kind == 'phuong' else 1.0
        sphere(f'env_tan_chinh{x:.0f}{y:.0f}', x, y, GZ + h * (0.66 if kind == 'phuong' else 0.72), 0.95 * wide, mat(tint, 0.85), scale=(1, 1, 0.5 if kind == 'phuong' else 0.8), coll=coll)  # tán chính ôm đỉnh thân
        if kind == 'phuong':
            for k in range(14): a = rnd.uniform(0, 6.283); rr = rnd.uniform(0.3, 1.5); sphere(f'env_hoa_phuong{x:.0f}{y:.0f}{k}', x + rr * math.cos(a), y + rr * math.sin(a), GZ + h * 0.66 + rnd.uniform(0.1, 0.35), 0.16, mat('#d8402a', 0.7), coll=coll)
        for k in range(14):  # cụm lá nhỏ ở đầu cành, nhiều tông xanh
            a = rnd.uniform(0, 6.283); rr = rnd.uniform(0.2, 0.95)
            sphere(f'env_cum_la{x:.0f}{y:.0f}{k}', x + rr * math.cos(a), y + rr * math.sin(a), GZ + h * 0.7 + rnd.uniform(-0.3, 0.7), rnd.uniform(0.38, 0.6), mat(rnd.choice(['#5f8d54', '#7aa35f', '#4a7a47', '#8db36a']), 0.85), scale=(1, 1, 0.75), coll=coll)
    def tree_old(x, y, h, tint='#4f7a4a'):
        cyl(f'env_than_cay{x:.0f}{y:.0f}', x, y, GZ + h * 0.3, 0.16, h * 0.6, mat('#5a4636', 0.95), coll=coll, bevel=0.02)
        for k in range(9):
            a = rnd.uniform(0, 6.283); rr = rnd.uniform(0.0, 1.1)
            sphere(f'env_tan{x:.0f}{y:.0f}{k}', x + rr * math.cos(a), y + rr * math.sin(a), GZ + h * 0.72 + rnd.uniform(-0.3, 1.0), rnd.uniform(0.7, 1.15), mat(rnd.choice([tint, '#5f8d54', '#44704a']), 0.85), scale=(1, 1, 0.8), coll=coll)
    tree(-2.45, 6.5, 6.5); tree(-2.45, 19.0, 7.0, '#7a9a4a', 'phuong'); tree(-2.45, 12.6, 4.2, '#6f9455', 'cau')
    tree_old = None
    for (x, y, h) in [(-6.5, 5.0, 2.0), (-6.4, 19.0, 2.4)]:  # cau/dừa cảnh
        cyl(f'env_cau{x:.0f}{y:.0f}', x, y, GZ + h / 2, 0.07, h, mat('#7a6a4a', 0.9), coll=coll)
        for k in range(6): sphere(f'env_cau_la{x:.0f}{y:.0f}{k}', x + 0.55 * math.cos(k), y + 0.55 * math.sin(k), GZ + h, 0.5, mat('#4a8a4a', 0.8), scale=(1, 0.25, 0.25), coll=coll)

    def xe_may(x, y, yaw, color):
        c = math.cos(yaw); s = math.sin(yaw)
        def p(dx): return x + dx * c, y + dx * s
        for dx in (-0.55, 0.55):
            px, py = p(dx); torus(f'env_banh_xm{x:.1f}{y:.1f}{dx}', px, py, GZ + 0.28, 0.27, 0.07, mat('#202020', 0.8), rot=(math.pi / 2, 0, yaw), coll=coll)
        for dx, w, z0, z1, cc in [(0.0, 0.7, GZ + 0.35, GZ + 0.62, color), (0.1, 0.45, GZ + 0.62, GZ + 0.72, '#222222'), (0.5, 0.25, GZ + 0.5, GZ + 1.0, color)]:
            px, py = p(dx); cyl(f'env_xm_b{x:.1f}{y:.1f}{dx}', px, py, (z0 + z1) / 2, 0.16, z1 - z0, mat(cc, 0.45), rot=(0, 0, 0), coll=coll, bevel=0.03)
        px, py = p(0.55); B(f'xm_ghi_dong{x:.1f}{y:.1f}', px - 0.2, px + 0.2, py - 0.03, py + 0.03, GZ + 1.0, GZ + 1.03, steel, coll=coll)
    colors = ['#b3362c', '#1f3a5f', '#d8d2c2', '#2f2f2f', '#e0a030', '#3d6e5a', '#8a2f5a']
    for i, yp in enumerate([1.2, 2.5, 3.8, 9.6, 10.9, 14.5, 15.8]):   # xe đỗ sát hè phía nhà trọ, chừa làn đường giữa sân
        xe_may(-2.3 + rnd.uniform(-0.05, 0.05), yp, math.pi / 2, colors[i % 7])
    for i in range(5):  # thùng rác, chậu, xô
        cyl(f'env_thung_rac{i}', -2.2, 19.5 + i * 0.5, GZ + 0.4, 0.28, 0.8, mat(rnd.choice(['#3b6e4b', '#2b4a7a', '#8a8a8a']), 0.55), coll=coll, bevel=0.02)
    # cột điện + dây
    def pole(y, x=-1.75):
        cyl(f'env_cot_dien{y:.0f}', x, y, GZ + 4.8, 0.14, 9.6, mat('#8a8780', 0.9), coll=coll)
        B(f'xa_dien{y:.0f}', x - 1.0, x + 1.0, y - 0.05, y + 0.05, GZ + 9.0, GZ + 9.12, steel, coll=coll)
        B(f'xa_dien2{y:.0f}', x - 0.8, x + 0.8, y - 0.05, y + 0.05, GZ + 8.5, GZ + 8.62, steel, coll=coll)
        for dx in (-0.9, -0.3, 0.3, 0.9): cyl(f'env_su{y:.0f}{dx}', x + dx, y, GZ + 9.2, 0.04, 0.12, mat('#d8d8d0', 0.5), coll=coll)
        return x
    ps = [pole(-3.0), pole(8.0), pole(19.0), pole(30.0)]

    def wire(p0, p1, sag=0.5, n=6, r=0.012, nm='day'):
        cu = bpy.data.curves.new('env_' + nm, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = r; cu.bevel_resolution = 1
        sp = cu.splines.new('BEZIER'); sp.bezier_points.add(2)
        mid = ((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2 - sag)
        for b, p in zip(sp.bezier_points, (p0, mid, p1)):
            b.co = (X.mx(p[0]), p[1], p[2]); b.handle_left_type = b.handle_right_type = 'AUTO'
        ob = bpy.data.objects.new('env_' + nm, cu); ob.data.materials.append(mat('#1a1a1a', 0.6)); bpy.context.scene.collection.objects.link(ob)
        X._link(ob, coll)
    for (ya, yb) in [(-3.0, 8.0), (8.0, 19.0), (19.0, 30.0)]:  # dây trục chính: 4 sợi
        for dx in (-0.9, -0.3, 0.3, 0.9): wire((-4.8 + dx, ya, GZ + 9.15), (-4.8 + dx, yb, GZ + 9.15), 0.6, nm=f'day_chinh{ya}{dx}')
    for k, y in enumerate([-3.0, 8.0, 19.0]):  # dây rẽ sang hai toà nhà
        for j in range(3):
            wire((-4.8, y, GZ + 8.6), (X0 + 0.1, y + rnd.uniform(-0.6, 0.6), z3 + 2.0 + j * 0.2), 0.9, nm=f'day_re_a{k}{j}')
            wire((-4.8, y, GZ + 8.6), (BX - 0.1, y + rnd.uniform(-0.8, 0.8), GZ + FL * 2 + 1.4 + j * 0.3), 1.0, nm=f'day_re_b{k}{j}')
    # đèn lồng đỏ + cờ tam giác giăng ngang sân (dây có võng)
    def day_treo(y, z_a, z_b, kind):
        p0 = (X0 + 0.25, y, z_a); p1 = (BX - 0.15, y, z_b); sag = 0.9
        wire(p0, p1, sag, nm=f'day_treo_{kind}{y:.0f}', r=0.008)
        n = 9 if kind == 'long' else 16
        for i in range(1, n):
            t = i / n; x = p0[0] + (p1[0] - p0[0]) * t; z = p0[2] + (p1[2] - p0[2]) * t - sag * 2 * t * (1 - t) * 0.5
            if kind == 'long':
                sphere(f'env_den_long{y:.0f}_{i}', x, y, z - 0.2, 0.13, glow('#ff4a2a', 4.0 if night else 0.5), scale=(1, 1, 1.25), coll=coll)
                cyl(f'env_long_cuong{y:.0f}_{i}', x, y, z - 0.05, 0.004, 0.12, steel, coll=coll)
            else:
                B(f'co{y:.0f}_{i}', x - 0.1, x + 0.1, y - 0.01, y + 0.01, z - 0.25, z - 0.02, mat(rnd.choice(['#d8a030', '#c24a3a', '#3b6ea5', '#e8e4d8', '#5a8a5a']), 0.8), coll=coll)
    day_treo(8.0, z3 + 1.6, GZ + FL * 2 + 2.2, 'long'); day_treo(15.0, z3 + 1.5, GZ + FL * 2 + 2.1, 'co'); day_treo(20.5, z3 + 1.6, GZ + FL * 2 + 2.2, 'long')
    # cổng + tường rào đầu sân
    B('rao_cuoi', -16, EX, 78.0, 78.3, GZ, GZ + 2.2, plaster('#cfc9b6'), coll=coll)
    B('cong_sat', -5.5, -3.0, 77.95, 78.05, GZ, GZ + 1.9, mat('#3b3d3e', 0.5, 0.6), coll=coll)
    for i in range(14): B(f'cong_thanh{i}', -5.45 + i * 0.18, -5.42 + i * 0.18, 77.9, 78.1, GZ, GZ + 1.95, steel, coll=coll)
    B('rao_dau', -16, EX, Y0 - 12.5, Y0 - 12.2, GZ, GZ + 2.2, plaster('#cfc9b6'), coll=coll)

    # ------------------------------------------------------------ hẻm bên cửa sổ phòng Nam (x > W): nhà hàng xóm cách 2,2 m
    AX = W + T + 2.2
    B('hem_san', W + T, AX + 0.4, -12, 16, GZ - 0.2, GZ, M.tiles('env_hem', '#6c6a61', '#4a4841', 0.8), coll=coll)
    B('hem_tuong_nha_ben', AX, AX + 0.4, -13, 16, GZ, GZ + FL * 4 + 1.5, plaster('#a89c7c'), coll=coll)
    B('hem_tuong_nha_ben_chan', AX - 0.03, AX, -12, 16, GZ, GZ + 1.1, plaster('#8c8a7a'), coll=coll)
    for fl in range(4):
        zb = GZ + fl * FL
        B(f'hem_san_tang{fl}', AX - 0.5, AX, -12, 16, zb - 0.1, zb, plaster('#9c9684'), coll=coll)
        y = -10.0
        while y < 14.5:
            r = random.Random(7000 + int(y * 10) + fl * 977)
            ww = r.choice([0.9, 1.1, 1.3]); lit = night and r.random() < 0.5
            if r.random() < 0.8:
                B(f'hem_so{fl}_{y:.1f}', AX - 0.06, AX, y, y + ww, zb + 1.0, zb + 2.0, glow(r.choice(['#ffd79a', '#ffc88a']), 0.9) if lit else glass_dark, coll=coll)
                B(f'hem_khung_so{fl}_{y:.1f}', AX - 0.1, AX - 0.06, y - 0.05, y + ww + 0.05, zb + 0.95, zb + 2.05, white, coll=coll)
                if r.random() < 0.7:
                    for k in range(6): B(f'hem_long{fl}_{y:.1f}_{k}', AX - 0.22, AX - 0.2, y + k * ww / 5, y + 0.02 + k * ww / 5, zb + 0.95, zb + 2.05, steel, coll=coll)
                    B(f'hem_long_n{fl}_{y:.1f}', AX - 0.23, AX - 0.19, y - 0.03, y + ww + 0.05, zb + 1.5, zb + 1.54, steel, coll=coll)
            if r.random() < 0.35:
                B(f'hem_may_lanh{fl}_{y:.1f}', AX - 0.4, AX - 0.06, y + ww + 0.2, y + ww + 1.0, zb + 2.15, zb + 2.55, mat('#e6e3da', 0.4), bevel=0.02, coll=coll)
            if r.random() < 0.3:
                B(f'hem_phoi{fl}_{y:.1f}', AX - 0.65, AX - 0.6, y, y + 1.6, zb + 1.9, zb + 1.92, steel, coll=coll)
                for k in range(3): B(f'hem_ao{fl}_{y:.1f}_{k}', AX - 0.64, AX - 0.62, y + 0.15 + k * 0.5, y + 0.45 + k * 0.5, zb + 1.3, zb + 1.9, mat(r.choice(['#e8e4d8', '#7fa0c0', '#d8a05a', '#8a6a9a', '#c24a3a']), 0.9), coll=coll)
            y += ww + r.uniform(0.7, 2.0)
    for k in range(5):  # ống nước + đồng hồ gas + dây điện chéo
        cyl(f'env_hem_ong{k}', AX - 0.05, -9 + k * 5.6 + rnd.uniform(-0.6, 0.6), GZ + FL * 2, 0.04, FL * 4, mat('#cfd3cf', 0.45), coll=coll)
    for k in range(7):
        wire((W + T + 0.1, 3.0 + k * 0.4, 7.0 + k * 0.2), (AX - 0.1, rnd.uniform(-8, 12), 8.0 + rnd.uniform(-1.5, 2.5)), 0.6, nm=f'hem_day{k}')
    for k in range(4): xe_may(W + T + 1.0 + rnd.uniform(0, 0.4), -6 + k * 3.8, 0.0, colors[(k + 3) % 7])

    # ------------------------------------------------------------ chân trời: lớp nhà cao tầng xa, mờ sương
    def skyline_mat(tag, c1, fog):
        k = ('sky', tag, night)
        if k in _cache: return _cache[k]
        mm = M.mottled('env_sk_' + tag, c1, rough=1.0, scale=0.3, vary=0.08, bump=0.0)
        _cache[k] = mm; return mm
    sk_cols = [('#9fa8ad', 80), ('#aab3b8', 140), ('#b7bec2', 220)]
    for li, (cc, dist) in enumerate(sk_cols):
        mm = skyline_mat(str(li), cc, 0.0)
        for k in range(26):
            a = math.radians(rnd.uniform(0, 360)); rx = dist + rnd.uniform(-10, 30)
            cx, cy = math.cos(a) * rx - 8, math.sin(a) * rx * 0.9 + 12
            hh = rnd.uniform(18, 60) * (1 + li * 0.15); w1 = rnd.uniform(8, 18); d1 = rnd.uniform(8, 16)
            B(f'chan_troi{li}_{k}', cx - w1 / 2, cx + w1 / 2, cy - d1 / 2, cy + d1 / 2, GZ - 1, GZ + hh, mm, coll=coll)
            if night and rnd.random() < 0.9:  # dải cửa sổ sáng
                for z in range(int(hh / 4)):
                    if rnd.random() < 0.5:
                        px = cx - w1 / 2 + rnd.uniform(1, w1 - 2)
                        B(f'chan_so{li}_{k}_{z}', px, px + 1.2, cy - d1 / 2 - 0.05, cy - d1 / 2, GZ + 3 + z * 4, GZ + 4.5 + z * 4, glow('#ffd79a', 3.0), coll=coll)
    # trăng thấy được (đêm): đĩa phát sáng ở chân trời phía dãy đối diện
    if night: sphere('env_trang', -70, 40, 55, 4.0, glow('#fff3d2', 6.0), coll=coll)
    # ------------------------------------------------------------ ánh sáng ban đêm từ môi trường
    if night:
        for k, (yy, zz, xx) in enumerate([(2.0, 3.8, -8.5), (9.0, 3.8, -8.5), (16.0, 3.8, -8.5), (5.0, 0.9, -8.5), (13.0, 0.9, -8.5), (21.0, 0.9, -8.5), (6.0, -1.6, -8.5)]):
            X.add_area(f'env_hat_dd{k}', (xx, yy, zz), 2.0, 260, '#ffd9a0', rot=(0, math.radians(90), 0), coll=coll)
        for k, y in enumerate([0.5, 6.0, 12.0, 18.0]):
            X.add_area(f'env_den_san{k}', (-4.2, y, GZ + 3.4), 1.2, 400, '#ffe3b0', rot=(math.pi, 0, 0), coll=coll)
            B(f'den_san_vo{k}', -4.5, -3.9, y - 0.2, y + 0.2, GZ + 3.3, GZ + 3.4, glow('#ffe9c0', 8.0), coll=coll)

    mo_rong(X, m, coll, night, hl_y1)
    hem_chi_tiet(X, coll, night)
    tranh_tuong(X, coll, night)
    xa_chi_tiet(X, coll, night)
    # ------------------------------------------------------------ cửa hành lang phòng Nam: mỗi cửa một cảnh riêng
    items = ['giay', 'may_giat', 'xe_dap', 'ghe_ban', 'ban_tho', 'carton', 'phoi_quat', 'khoa_cay']
    for k, kind in enumerate(items):
        a = 4.35 + 2.2 * k
        if a + 0.85 > Y1 - 0.5: break
        cx = EX - 0.18
        if kind == 'giay':
            B('rieng_tham0', EX - 0.7, EX - 0.05, a + 0.1, a + 0.75, 0, 0.012, mat('#7a4a3a', 0.95), coll=coll)
            for i in range(4): B(f'rieng_giay{i}', EX - 0.5, EX - 0.3, a + 0.1 + i * 0.16, a + 0.22 + i * 0.16, 0, 0.09, mat(['#3d4a6b', '#9a6a4a', '#d8d2c2', '#5b7a5e'][i], 0.7), bevel=0.025, coll=coll)
        elif kind == 'may_giat':
            B('rieng_mg', EX - 0.7, EX - 0.12, a + 0.05, a + 0.65, 0, 0.9, mat('#dcdfde', 0.4), bevel=0.03, coll=coll)
            cyl('rieng_mg_cua', EX - 0.71, a + 0.35, 0.45, 0.19, 0.03, mat('#2b3a44', 0.2), axis='X', coll=coll)
            cyl('rieng_xo', EX - 0.4, a + 0.9, 0.15, 0.13, 0.3, mat('#c24a3a', 0.5), coll=coll, bevel=0.01)
        elif kind == 'xe_dap':
            torus('env_rieng_banh_a', EX - 0.5, a + 0.0, 0.34, 0.33, 0.014, steel, rot=(math.pi / 2, 0, 0), coll=coll); torus('env_rieng_banh_b', EX - 0.5, a + 0.8, 0.34, 0.33, 0.014, steel, rot=(math.pi / 2, 0, 0), coll=coll)
            B('rieng_khung_xd', EX - 0.52, EX - 0.48, a, a + 0.8, 0.55, 0.59, mat('#1f5f9a', 0.45), coll=coll)
            B('rieng_ghi_dong', EX - 0.55, EX - 0.45, a + 0.72, a + 0.9, 0.95, 0.98, steel, coll=coll)
            cyl('rieng_gas', EX - 0.25, a + 1.1, 0.2, 0.14, 0.4, mat('#b32f2f', 0.45), coll=coll, bevel=0.01)
        elif kind == 'ghe_ban':
            for i in range(2): B(f'rieng_ghe{i}', EX - 0.55, EX - 0.2, a + 0.02 + i * 0.5, a + 0.4 + i * 0.5, 0, 0.42, mat('#e3b84a' if i else '#3b6ea5', 0.55), bevel=0.03, coll=coll)
            B('rieng_ban_nho', EX - 0.6, EX - 0.2, a + 0.42, a + 0.58, 0.3, 0.34, mat('#9a6a3a', 0.6), coll=coll)
            cyl('rieng_ly', EX - 0.4, a + 0.5, 0.38, 0.04, 0.08, white, coll=coll)
            cyl('rieng_chau_hoa', EX - 0.6, a + 1.1, 0.18, 0.12, 0.35, mat('#b0605a', 0.7), coll=coll, bevel=0.01)
            for q in range(4): sphere(f'env_rieng_hoa{q}', EX - 0.6 + 0.07 * math.cos(q), a + 1.1 + 0.07 * math.sin(q), 0.42, 0.07, mat(['#d86a8a', '#e8c84a', '#d86a8a', '#e86a4a'][q], 0.7), coll=coll)
        elif kind == 'ban_tho':  # bàn thờ nhỏ treo tường có đèn đỏ + chén nước + hương
            B('rieng_ke_tho', EX - 0.3, EX, a + 0.15, a + 0.7, 1.55, 1.6, mat('#7a3a2a', 0.6), coll=coll)
            B('rieng_bang_tho', EX - 0.02, EX, a + 0.15, a + 0.7, 1.6, 2.0, mat('#c4392f', 0.55), coll=coll)
            cyl('rieng_den_do', EX - 0.15, a + 0.43, 1.65, 0.03, 0.08, glow('#ff3a2a', 6.0), coll=coll)
            cyl('rieng_chen', EX - 0.15, a + 0.3, 1.62, 0.03, 0.04, white, coll=coll); cyl('rieng_nhang', EX - 0.15, a + 0.55, 1.7, 0.004, 0.2, mat('#7a4a2a', 0.8), coll=coll)
            B('rieng_tham_nhang', EX - 0.7, EX - 0.05, a + 0.1, a + 0.75, 0, 0.012, mat('#4a6a8a', 0.95), coll=coll)
        elif kind == 'carton':
            for i, (yy, hh) in enumerate([(a + 0.05, 0.45), (a + 0.55, 0.38), (a + 0.1, 0.3)]):
                z0 = 0.45 if i == 2 else 0.0
                B(f'rieng_thung{i}', EX - 0.6, EX - 0.15, yy, yy + 0.42, z0, z0 + hh, mat('#b89a6a', 0.9), bevel=0.01, coll=coll)
            B('rieng_khoa_cua', EX - 0.06, EX - 0.04, a + 0.62, a + 0.7, 1.2, 1.32, inox, coll=coll)
        elif kind == 'phoi_quat':
            B('rieng_gia_phoi', EX - 0.6, EX - 0.2, a + 0.1, a + 0.9, 1.3, 1.33, steel, coll=coll)
            for i in range(3): B(f'rieng_do{i}', EX - 0.45, EX - 0.42, a + 0.15 + i * 0.25, a + 0.4 + i * 0.25, 0.6, 1.3, mat(['#e8e4d8', '#7fa0c0', '#d8a05a'][i], 0.9), coll=coll)
            cyl('rieng_quat_cot', EX - 0.4, a + 1.05, 0.45, 0.012, 0.9, steel, coll=coll); cyl('rieng_quat_c', EX - 0.4, a + 1.05, 0.95, 0.19, 0.05, mat('#7fa0c0', 0.4), axis='X', coll=coll)
        elif kind == 'khoa_cay':
            B('rieng_khoa', EX - 0.06, EX - 0.03, a + 0.7, a + 0.78, 1.0, 1.15, steel, coll=coll)
            cyl('rieng_chau_cay', EX - 0.35, a - 0.2, 0.3, 0.15, 0.6, mat('#b0605a', 0.7), coll=coll, bevel=0.015)
            for q in range(7): sphere(f'env_rieng_la{q}', EX - 0.35 + 0.15 * math.cos(q * 0.9), a - 0.2 + 0.15 * math.sin(q * 0.9), 0.66 + 0.05 * (q % 4), 0.12, mat('#4f7a4a', 0.8), scale=(1, 1, 1.5), coll=coll)
        # đèn cửa + số phòng riêng
        B(f'rieng_den{k}', EX - 0.09, EX, a + 0.3, a + 0.5, 2.18, 2.28, mat('#d8d4c8', 0.5), bevel=0.01, coll=coll)
        sphere(f'env_rieng_bong{k}', EX - 0.06, a + 0.4, 2.12, 0.05, glow('#fff1d6', 12.0 if night else 1.5), coll=coll)


def sky(nt, bg, night, mode='day'):
    """Bầu trời: gradient chân trời → thiên đỉnh + mây (ngày) hoặc sao + ánh phố (đêm). Ghi đè màu nền của world."""
    N, L = nt.nodes, nt.links
    tc = N.new('ShaderNodeTexCoord'); sp = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Generated'], sp.inputs['Vector'])
    ramp = N.new('ShaderNodeValToRGB'); ramp.label = 'sky_ramp'; L.new(sp.outputs['Z'], ramp.inputs['Fac'])
    e = ramp.color_ramp.elements
    if not night:
        pal = {'day': ((0.86, 0.91, 0.94, 1), (0.36, 0.58, 0.82, 1)), 'noon': ((0.88, 0.93, 0.96, 1), (0.30, 0.54, 0.86, 1)),
               'dawn': ((0.98, 0.86, 0.78, 1), (0.45, 0.58, 0.82, 1)), 'sunset': ((1.0, 0.62, 0.36, 1), (0.42, 0.38, 0.58, 1)),
               'rain': ((0.62, 0.66, 0.70, 1), (0.40, 0.44, 0.50, 1))}[mode]
        e[0].position = 0.5; e[0].color = pal[0]; e[1].position = 0.95; e[1].color = pal[1]
        nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 2.2; nz.inputs['Detail'].default_value = 7.0; nz.inputs['Roughness'].default_value = 0.62
        mp = N.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1.0, 1.0, 2.4); L.new(tc.outputs['Generated'], mp.inputs['Vector']); L.new(mp.outputs['Vector'], nz.inputs['Vector'])
        cr = N.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].position = 0.52; cr.color_ramp.elements[1].position = 0.68; L.new(nz.outputs['Fac'], cr.inputs['Fac'])
        fade = N.new('ShaderNodeMath'); fade.operation = 'MULTIPLY'; L.new(cr.outputs['Color'], fade.inputs[0])
        zz = N.new('ShaderNodeMapRange'); zz.inputs['From Min'].default_value = 0.52; zz.inputs['From Max'].default_value = 0.72; L.new(sp.outputs['Z'], zz.inputs['Value']); L.new(zz.outputs['Result'], fade.inputs[1])
        mix = N.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.inputs['B'].default_value = (1, 1, 1, 1)
        L.new(ramp.outputs['Color'], mix.inputs['A']); L.new(fade.outputs[0], mix.inputs['Factor'])
        L.new(mix.outputs['Result'], bg.inputs['Color'])
    else:
        e[0].position = 0.5; e[0].color = (0.30, 0.34, 0.52, 1); e[1].position = 0.95; e[1].color = (0.04, 0.07, 0.16, 1)
        vr = N.new('ShaderNodeTexVoronoi'); vr.inputs['Scale'].default_value = 420.0; L.new(tc.outputs['Generated'], vr.inputs['Vector'])
        st = N.new('ShaderNodeValToRGB'); st.color_ramp.elements[0].position = 0.0; st.color_ramp.elements[1].position = 0.04; st.color_ramp.elements[0].color = (1, 1, 1, 1); st.color_ramp.elements[1].color = (0, 0, 0, 1)
        L.new(vr.outputs['Distance'], st.inputs['Fac'])
        zz = N.new('ShaderNodeMapRange'); zz.inputs['From Min'].default_value = 0.6; zz.inputs['From Max'].default_value = 0.9; L.new(sp.outputs['Z'], zz.inputs['Value'])
        mul = N.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'; L.new(st.outputs['Color'], mul.inputs[0]); L.new(zz.outputs['Result'], mul.inputs[1])
        mix = N.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.inputs['B'].default_value = (1.4, 1.4, 1.6, 1)
        L.new(ramp.outputs['Color'], mix.inputs['A']); L.new(mul.outputs[0], mix.inputs['Factor']); L.new(mix.outputs['Result'], bg.inputs['Color'])


def an_khoi(coll, pos, X):
    """Camera nằm trong khối nhà trước/sau phòng (ngoài tường trước/sau) thì ẩn khối đó VÀ cửa sổ/lồng sắt/máy lạnh của nó khỏi tia camera."""
    W, D = X.W, X.D
    front = pos[1] > D and 0 <= pos[0] <= W + 0.12
    back = pos[1] < 0 and 0 <= pos[0] <= W + 0.12
    if not (front or back): return
    for o in coll.objects:
        if not o.name.startswith('env_khoi_') or o.type != 'MESH' or not o.data.vertices: continue
        ys = [(o.matrix_world @ v.co).y for v in o.data.vertices]
        if (front and min(ys) >= D - 0.01) or (back and max(ys) <= 0.01): o.visible_camera = False


def mo_rong(X, m, coll, night, hl_y1):
    """Mở rộng giảm dần chi tiết: khối nhà trọ (hết cảnh hành lang 'lơ lửng'), hành lang dài tới y = 66 (LOD: đủ chi tiết ≤ 24 m, đơn giản 24–40 m,
    tấm phẳng 40–66 m), dãy đối diện kéo dài, cột điện, kết thúc bằng tường đầu hành lang có cửa sổ lớn."""
    box = X.box; M = X.M; W, D, H, T = X.W, X.D, X.H, X.T
    GZ, FL = -2.92, 2.92; X0, EX = -1.45, -T; Y1 = hl_y1; YF = 66.0; BX = -7.6; BACK = -9.2
    z3 = H + 0.12; ZT = z3 + 2.8
    rnd = random.Random(77)
    def mat(color, rough=0.7, metal=0.0):
        k = ('m2', color, rough, metal)
        if k not in _cache: _cache[k] = M.solid('e2_' + color.strip('#') + f'_{int(rough*10)}', color, rough, metal)
        return _cache[k]
    def plaster(color):
        k = ('p2', color)
        if k not in _cache: _cache[k] = M.phong_tran('ep2_' + color.strip('#'), color)
        return _cache[k]
    def B(name, *a, **kw): return box('env_' + name, *a, **kw)
    glass_dark = mat('#5d727c', 0.5); steel = mat('#2b2d2e', 0.45, 0.7); white = mat('#ece8dc', 0.6)
    # ---- khối nhà trọ phía sau/trước phòng Nam (đặc, có mặt tiền hướng hẻm)
    B('khoi_sau', 0.0, W + T, -13.0, -T, GZ, ZT + 0.15, plaster('#d4c8a8'), coll=coll)   # kéo tới tường rào đầu sân (hết hụt khoảng trống)
    B('khoi_truoc', 0.0, W + T, D + T, YF + 2, GZ, ZT + 0.15, plaster('#d4c8a8'), coll=coll)
    B('khoi_mai', 0.0, W + T + 0.25, -13.0, YF + 2, ZT + 0.15, ZT + 0.3, plaster('#b9b5a8'), coll=coll)
    AXF = W + T
    for (ya, yb) in [(-13.0 + 0.6, -T - 0.6), (D + T + 0.6, YF)]:
        y = ya
        while y < yb:
            r = random.Random(int(y * 10) + 31)
            ww = r.choice([0.9, 1.1, 1.3])
            for fl in range(3):
                zb = GZ + fl * FL
                lit = night and r.random() < 0.45
                B(f'khoi_so{fl}_{y:.1f}', AXF, AXF + 0.05, y, y + ww, zb + 1.0, zb + 2.0, X.M.emission('e_ls', '#ffd79a', 0.9) if lit else glass_dark, coll=coll)
                if y < 40 and r.random() < 0.7:
                    for k in range(5): B(f'khoi_long{fl}_{y:.1f}_{k}', AXF + 0.18, AXF + 0.2, y + k * ww / 4, y + 0.02 + k * ww / 4, zb + 0.95, zb + 2.05, steel, coll=coll)
                if y < 30 and r.random() < 0.3:
                    B(f'khoi_ml{fl}_{y:.1f}', AXF, AXF + 0.35, y + ww + 0.15, y + ww + 0.95, zb + 2.15, zb + 2.55, mat('#e6e3da', 0.4), bevel=0.02, coll=coll)
            y += ww + r.uniform(0.8, 2.2)
    if not night: X.add_area('env_hat_hem', (4.2, 6.0, 9.0), 7.0, 2500, '#fff0d8', rot=(0, 0, 0), coll=coll); X.add_area('env_hat_hem2', (3.9, 1.5, 1.8), 2.5, 25, '#fff0d8', rot=(0, math.radians(90), 0), coll=coll)  # ánh hắt xuống hẻm hẹp (nhà 4 tầng che sáng)
    # ---- hành lang kéo dài: LOD
    B('hl_far_san', X0, EX, Y1, YF, -0.1, 0.0, mat('#c4bca8', 0.4), coll=coll)
    B('hl_far_mai', X0 - 0.15, EX, Y1, YF, H, H + 0.12, plaster('#d8cdb0'), coll=coll)
    B('hl_far_tuong', EX, 0.0, Y1, YF, -0.1, H, plaster('#d8cdb0'), coll=coll)
    B('hl_far_duoi', EX - 0.004, EX, Y1, YF, 0, 1.1, plaster('#b9c4a8'), coll=coll)
    B('hl_far_lancan', X0, X0 + 0.14, Y1, YF, 0, 0.5, plaster('#d8cdb0'), coll=coll)
    B('hl_far_tayvin', X0 - 0.01, X0 + 0.15, Y1, YF, 1.0, 1.04, steel, coll=coll)
    y = Y1 + 0.1
    while y < 40: B(f'hl_far_song{y:.2f}', X0 + 0.05, X0 + 0.09, y, y + 0.025, 0.5, 1.0, steel, coll=coll); y += 0.28
    y = 40.0
    while y < YF: B(f'hl_far_song_l{y:.1f}', X0 + 0.05, X0 + 0.09, y, y + 0.05, 0.5, 1.0, steel, coll=coll); y += 0.9
    cols = ['#6d887c', '#8a7a62', '#6b7f95', '#9a6f5e', '#b0954f', '#6d6a7e', '#a3503f', '#4f857a']
    y = 4.35 + 2.2 * 8
    k = 0
    while y < YF - 1:
        B(f'hl_far_cua{k}', EX - 0.03, EX, y, y + 0.85, 0, 2.1, mat(cols[(k + 3) % 8], 0.55), coll=coll)
        if y < 40:
            B(f'hl_far_khuon{k}', EX - 0.02, EX + 0.02, y - 0.05, y + 0.9, 0, 2.15, white, coll=coll)
            B(f'hl_far_tay{k}', EX - 0.06, EX - 0.03, y + 0.07, y + 0.1, 1.0, 1.03, mat('#b9bdbb', 0.35, 0.8), coll=coll)
            if k % 2 == 0: B(f'hl_far_giay{k}', EX - 0.45, EX - 0.25, y + 0.1, y + 0.4, 0, 0.1, mat(rnd.choice(['#3d4a6b', '#9a6a4a', '#d8d2c2']), 0.7), bevel=0.02, coll=coll)
        y += 2.2; k += 1
    y = 2.3 + 4.9 * 5
    while y < YF - 1:
        B(f'hl_far_den{y:.0f}', -1.0, -0.4, y, y + 0.04, H - 0.04, H - 0.01, X.M.emission('e_dh', '#fff1d6', 14.0 if night else 2.5) if y < 45 else mat('#e8e4d8', 0.4), coll=coll); y += 4.9
    # tầng 1 và 3 phía hành lang kéo dài (đơn giản)
    for z0, z1, nm in [(GZ, -0.1, 't1'), (z3, ZT, 't3')]:
        B(f'hl_far_{nm}', EX, 0.0, Y1, YF, z0, z1, plaster('#d4c6a4'), coll=coll)
    B('hl_far_mai3', X0 - 0.3, 0.0, Y1, YF, ZT, ZT + 0.15, plaster('#b9b5a8'), coll=coll)
    B('hl_far_lc3', X0, X0 + 0.14, Y1, YF, z3, z3 + 0.9, plaster('#d4c6a4'), coll=coll)
    y = Y1
    while y < YF:
        B(f'hl_far_cot{y:.0f}', X0, X0 + 0.28, y, y + 0.28, GZ, -0.1, plaster('#c8c3b2'), coll=coll); y += 3.3
    B('hl_far_dam', X0 - 0.02, X0 + 0.3, Y1, YF, -0.5, -0.1, plaster('#c8c3b2'), coll=coll)
    # tường cuối hành lang: cửa sổ lớn + biển thoát hiểm
    B('hl_cuoi', X0 - 0.3, 0.0, YF, YF + 0.25, GZ, ZT + 0.15, plaster('#d8cdb0'), coll=coll)
    B('hl_cuoi_so', X0 + 0.2, EX - 0.2, YF - 0.03, YF, 0.9, 2.3, X.M.emission('e_cuoi', '#cfe6ff' if not night else '#243456', 4.0 if not night else 0.8), coll=coll)
    B('hl_cuoi_bien', -0.8, -0.4, YF - 0.03, YF, 2.45, 2.65, X.M.emission('e_exit', '#3aff7a', 3.0), coll=coll)
    # ---- khối nhà cuối sân (sau tường rào đầu sân, y < −13): mặt tiền có cửa sổ, ban công, cổng, tranh — che chỗ trống phía xa
    YR = -13.1
    B('khoi_cuoi', -16.5, W + T, -28, YR, GZ, GZ + FL * 4 + 0.2, plaster('#d8ccb0'), coll=coll)
    B('khoi_cuoi_mai', -16.7, W + T + 0.2, -28, YR + 0.2, GZ + FL * 4 + 0.2, GZ + FL * 4 + 0.4, plaster('#b9b5a8'), coll=coll)
    for fl in range(4):
        zb = GZ + fl * FL
        B(f'kc_ban_cong{fl}', -15.0, 2.0, YR, YR + 0.9, zb - 0.1, zb, plaster('#cfc9b6'), coll=coll) if fl > 0 else None
        if fl > 0:
            B(f'kc_lan_can{fl}', -15.0, 2.0, YR + 0.86, YR + 0.9, zb, zb + 1.0, steel, coll=coll)
            for i in range(int(17 / 0.16)): B(f'kc_song{fl}_{i}', -15.0 + i * 0.16, -14.985 + i * 0.16, YR + 0.86, YR + 0.9, zb, zb + 1.0, steel, coll=coll) if False else None
        xx = -14.6
        while xx < 1.6:
            r = random.Random(int(xx * 10) + fl * 77)
            wdt = r.choice([0.9, 1.1, 1.3]); lit = night and r.random() < 0.5
            if fl == 0 and -5.8 < xx < -2.5: xx += 3.6; continue   # chỗ cổng sắt
            B(f'kc_so{fl}_{xx:.1f}', xx, xx + wdt, YR, YR + 0.05, zb + 1.0, zb + 2.0, X.M.emission('e_lskc', '#ffd79a', 0.9) if lit else glass_dark, coll=coll)
            B(f'kc_khung{fl}_{xx:.1f}', xx - 0.05, xx + wdt + 0.05, YR + 0.05, YR + 0.08, zb + 0.95, zb + 2.05, white, coll=coll)
            if r.random() < 0.6: B(f'kc_rem{fl}_{xx:.1f}', xx, xx + wdt * r.uniform(0.3, 0.5), YR + 0.02, YR + 0.04, zb + 1.0, zb + 2.0, mat(r.choice(['#b88a6a', '#8aa0b8', '#c9b07a']), 0.9), coll=coll)
            xx += wdt + r.uniform(0.8, 1.6)
    B('kc_cong', -5.5, -2.8, YR, YR + 0.06, GZ, GZ + 2.4, mat('#4f7a62', 0.5, 0.4), coll=coll)           # cổng sắt xanh rêu
    for i in range(9): B(f'kc_cong_thanh{i}', -5.4 + i * 0.3, -5.38 + i * 0.3, YR + 0.06, YR + 0.1, GZ, GZ + 2.4, steel, coll=coll)
    B('kc_bien', -5.2, -3.1, YR, YR + 0.05, GZ + 2.6, GZ + 3.2, mat('#2f6fb0', 0.5), coll=coll)
    for k in range(6): B(f'kc_bien_chu{k}', -5.0 + 0.3 * k, -4.88 + 0.3 * k, YR + 0.05, YR + 0.06, GZ + 2.75, GZ + 3.05, white, coll=coll)
    for k in range(7):  # bụi cây + chậu dọc chân tường rào
        px = -14 + k * 2.3 + rnd.uniform(-0.3, 0.3)
        X.sphere(f'env_kc_bui{k}', px, -12.5, GZ + 0.5, rnd.uniform(0.6, 0.9), mat(rnd.choice(['#4a7a47', '#5f8d54', '#3f6e45']), 0.85), scale=(1, 1, 0.8), coll=coll)
    # ---- dãy đối diện kéo dài (đơn giản)
    YA, YB = 36.0, 76.0
    B('nha_dd_dai', -16, BACK, YA, YB, GZ, GZ + FL * 4 + 0.2, plaster('#d9cba5'), coll=coll)
    for fl in range(4):
        zb = GZ + fl * FL
        B(f'dd2_san{fl}', BACK, BX, YA, YB, zb - 0.12, zb, plaster('#cfc9b6'), coll=coll)
        B(f'dd2_thap{fl}', BX - 0.14, BX, YA, YB, zb, zb + 1.06, plaster('#d8d0b8'), coll=coll)
        y = YA + 0.3; k = 0
        while y < YB - 1:
            r = random.Random(900 + fl * 100 + k)
            B(f'dd2_cua{fl}_{k}', BACK, BACK + 0.04, y, y + 0.85, zb, zb + 2.05, mat(r.choice(cols), 0.55), coll=coll)
            B(f'dd2_so{fl}_{k}', BACK, BACK + 0.03, y + 1.1, y + 1.9, zb + 0.95, zb + 1.9, X.M.emission('e_ls2', '#ffc88a', 0.8) if (night and r.random() < 0.5) else glass_dark, coll=coll)
            y += 2.6 + r.uniform(0, 0.6); k += 1
    B('dd2_mai', -16, BACK + 0.1, YA, YB, GZ + FL * 4 + 0.2, GZ + FL * 4 + 0.38, plaster('#b4b0a2'), coll=coll)
    # cột điện + dây phía xa
    for yy in (41.0, 52.0, 63.0):
        X.cyl(f'env_cot_dien_xa{yy:.0f}', -4.8, yy, GZ + 4.8, 0.14, 9.6, mat('#8a8780', 0.9), coll=coll)
        B(f'xa_dien_xa{yy:.0f}', -5.8, -3.8, yy - 0.05, yy + 0.05, GZ + 9.0, GZ + 9.12, steel, coll=coll)
    # lớp nhà cao tầng xa phía cuối sân
    for k in range(10):
        cx = rnd.uniform(-30, 12); cy = rnd.uniform(90, 140); hh = rnd.uniform(15, 55)
        B(f'chan_troi_cuoi{k}', cx - 7, cx + 7, cy - 7, cy + 7, GZ - 1, GZ + hh, mat('#a9b2b7', 1.0), coll=coll)


def hem_chi_tiet(X, coll, night, rnd_seed=303):
    """Ngoại cảnh qua cửa sổ phòng Nam: ban công nhà hàng xóm đối diện cùng độ cao (cây, quần áo phơi, ghế, mèo, cửa kính có rèm), mái hiên tôn,
    biển cho thuê phòng, chảo ăng-ten, bể nước, dây điện/dây đèn chằng ngang hẻm, lồng chim, chậu treo, xe máy và thùng rác dưới hẻm."""
    box, cyl, sphere, M = X.box, X.cyl, X.sphere, X.M
    W, T = X.W, X.T; GZ, FL = -2.92, 2.92; AX = W + T + 2.2; XB = W + T
    rnd = random.Random(rnd_seed)
    def mat(color, rough=0.7, metal=0.0):
        k = ('h', color, rough, metal)
        if k not in _cache: _cache[k] = M.solid('eh_' + color.strip('#') + f'_{int(rough*10)}', color, rough, metal)
        return _cache[k]
    def glow(color, st):
        k = ('hg', color, st)
        if k not in _cache: _cache[k] = M.emission('ehg_' + color.strip('#') + str(st), color, st)
        return _cache[k]
    def B(name, *a, **kw): return box('env_hc_' + name, *a, **kw)
    steel = mat('#2b2d2e', 0.45, 0.7); white = mat('#ece8dc', 0.6); rust = mat('#8a5a3a', 0.8)
    def wire(p0, p1, sag=0.5, r=0.008, nm='w'):
        cu = bpy.data.curves.new('env_hc_' + nm, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = r; cu.bevel_resolution = 1
        sp = cu.splines.new('BEZIER'); sp.bezier_points.add(2)
        mid = tuple((p0[i] + p1[i]) / 2 for i in range(3)); mid = (mid[0], mid[1], mid[2] - sag)
        for b_, p_ in zip(sp.bezier_points, (p0, mid, p1)):
            b_.co = (X.mx(p_[0]), p_[1], p_[2]); b_.handle_left_type = b_.handle_right_type = 'AUTO'
        ob = bpy.data.objects.new('env_hc_' + nm, cu); ob.data.materials.append(mat('#1a1a1a', 0.6)); bpy.context.scene.collection.objects.link(ob); X._link(ob, coll)
    # ---- ban công đối diện cửa sổ (tầng 2, cùng cao độ z = 0), rộng y 0,0 → 2,9
    zb = 0.0; y0, y1 = 0.0, 2.9; d = 0.95
    # ---- CHUỒNG CỌP sắt đua ra ngoài + TÉC NƯỚC INOX trên mái (nhìn qua cửa sổ phòng Nam là nhận ra khu tập thể Hà Nội)
    cx0 = AX - d - 0.14; cy0, cy1 = y0 - 0.12, y1 + 0.12
    B('cg_san', cx0, AX - d, cy0, cy1, zb - 0.1, zb, mat('#9a948a', 0.9), coll=coll)
    for i in range(int((cy1 - cy0) / 0.22) + 1): B(f'cg_song{i}', cx0, cx0 + 0.016, cy0 + i * 0.22, cy0 + i * 0.22 + 0.016, zb, zb + 2.0, steel, coll=coll)
    for z_ in (zb + 0.55, zb + 1.1, zb + 1.7, zb + 2.0): B(f'cg_ngang{z_:.2f}', cx0, cx0 + 0.025, cy0, cy1, z_, z_ + 0.025, steel, coll=coll)
    for yy_ in (cy0, cy1 - 0.02):
        for z_ in (zb + 1.0, zb + 2.0): B(f'cg_hong{yy_:.2f}_{z_:.1f}', cx0, AX - d, yy_, yy_ + 0.02, z_, z_ + 0.025, steel, coll=coll)
        B(f'cg_cot{yy_:.2f}', cx0, cx0 + 0.03, yy_, yy_ + 0.03, zb, zb + 2.05, steel, coll=coll)
    B('cg_mai', cx0 - 0.1, AX - 0.1, cy0 - 0.1, cy1 + 0.1, zb + 2.02, zb + 2.05, mat('#8c8f86', 0.55, 0.6), coll=coll)
    inox = mat('#c8cbca', 0.2, 0.9)
    cyl('env_hc_tec_inox', AX - 0.55, (y0 + y1) / 2, zb + 2.05 + 0.4, 0.4, 1.3, inox, axis='Y', coll=coll)
    for sg in (-1, 1): sphere(f'env_hc_tec_nap{sg}', AX - 0.55, (y0 + y1) / 2 + sg * 0.65, zb + 2.45, 0.4, inox, scale=(1, 0.18, 1), coll=coll)
    for yy_ in (0.9, 2.0): B(f'tec_chan{yy_}', AX - 0.75, AX - 0.35, yy_, yy_ + 0.05, zb + 2.05, zb + 2.15, steel, coll=coll)
    cyl('env_hc_tec_ong', AX - 0.2, (y0 + y1) / 2, zb + 2.5, 0.025, 1.1, mat('#d8d4c8', 0.5), coll=coll)
    B('bc_san', AX - d, AX, y0, y1, zb - 0.12, zb, mat('#b9b2a0', 0.9), bevel=0.01, coll=coll)
    B('bc_tay_vin', AX - d, AX - d + 0.04, y0, y1, zb + 0.95, zb + 0.99, steel, coll=coll)
    B('bc_tay_vin_s1', AX - d, AX, y0, y0 + 0.04, zb + 0.95, zb + 0.99, steel, coll=coll); B('bc_tay_vin_s2', AX - d, AX, y1 - 0.04, y1, zb + 0.95, zb + 0.99, steel, coll=coll)
    for i in range(int((y1 - y0) / 0.12)): B(f'bc_song{i}', AX - d + 0.01, AX - d + 0.03, y0 + 0.04 + i * 0.12, y0 + 0.055 + i * 0.12, zb + 0.1, zb + 0.95, steel, coll=coll)
    for i in range(int(d / 0.14)):
        B(f'bc_song_s{i}', AX - d + 0.06 + i * 0.14, AX - d + 0.075 + i * 0.14, y0 + 0.01, y0 + 0.03, zb + 0.1, zb + 0.95, steel, coll=coll)
        B(f'bc_song_t{i}', AX - d + 0.06 + i * 0.14, AX - d + 0.075 + i * 0.14, y1 - 0.03, y1 - 0.01, zb + 0.1, zb + 0.95, steel, coll=coll)
    # cửa kính trượt + rèm (sáng đèn nếu ban đêm)
    B('bc_cua_khung', AX - 0.06, AX, y0 + 0.3, y1 - 0.3, zb, zb + 2.1, white, coll=coll)
    B('bc_cua_kinh', AX - 0.07, AX - 0.06, y0 + 0.36, y1 - 0.36, zb + 0.06, zb + 2.04, glow('#ffd79a', 1.1) if night else mat('#7d95a0', 0.15), coll=coll)
    B('bc_rem', AX - 0.09, AX - 0.07, y0 + 0.36, y0 + 1.0, zb + 0.06, zb + 2.04, mat('#c9a98a', 0.9), coll=coll)
    B('bc_rem2', AX - 0.09, AX - 0.07, y1 - 0.7, y1 - 0.36, zb + 0.06, zb + 2.04, mat('#c9a98a', 0.9), coll=coll)
    # chậu cây dọc lan can + giàn hoa treo
    for i in range(6):
        yy = y0 + 0.25 + i * 0.45
        cyl(f'env_hc_chau{i}', AX - d + 0.14, yy, zb + 0.18, 0.12, 0.3, mat(rnd.choice(['#b0605a', '#c8a15a', '#6a8aa6']), 0.7), coll=coll, bevel=0.01)
        for q in range(4): sphere(f'env_hc_la{i}_{q}', AX - d + 0.14 + 0.08 * math.cos(q * 1.6), yy + 0.08 * math.sin(q * 1.6), zb + 0.38 + 0.04 * (q % 3), 0.12, mat(rnd.choice(['#4f7a4a', '#6f9a55']), 0.8), scale=(1, 1, 1.2), coll=coll)
        if i % 2 == 0:
            for q in range(3): sphere(f'env_hc_hoa{i}_{q}', AX - d + 0.14 + 0.05 * q, yy + 0.04 * q, zb + 0.5, 0.05, mat(rnd.choice(['#e86a8a', '#f2d24a', '#e8e4d8']), 0.7), coll=coll)
    # dây phơi ngang ban công + quần áo (khác nhau)
    B('bc_day_phoi', AX - d + 0.1, AX - 0.1, y0 + 0.2, y0 + 0.215, zb + 1.9, zb + 1.915, steel, coll=coll)
    for q in range(5):
        yy = y0 + 0.5 + q * 0.5 + rnd.uniform(-0.05, 0.05)
        B(f'bc_ao{q}', AX - 0.55, AX - 0.53, yy, yy + rnd.uniform(0.28, 0.4), zb + 1.25, zb + 1.9, mat(rnd.choice(['#e8e4d8', '#7fa0c0', '#d8a05a', '#8a6a9a', '#c24a3a', '#5a8a5a']), 0.9), coll=coll)
    B('bc_day_phoi2', AX - d + 0.2, AX - d + 0.215, y0 + 0.2, y1 - 0.2, zb + 1.9, zb + 1.915, steel, coll=coll)
    # ghế nhựa + bàn nhỏ + lồng chim + mèo
    B('bc_ghe', AX - 0.5, AX - 0.15, y1 - 0.9, y1 - 0.5, zb, zb + 0.45, mat('#c24a3a', 0.55), bevel=0.03, coll=coll)
    B('bc_ghe_lung', AX - 0.5, AX - 0.46, y1 - 0.9, y1 - 0.5, zb + 0.45, zb + 0.85, mat('#c24a3a', 0.55), bevel=0.02, coll=coll)
    cyl('env_hc_long_chim', AX - 0.4, y0 + 2.0, zb + 1.75, 0.13, 0.28, mat('#d8c8a0', 0.5), coll=coll); sphere('env_hc_long_chim_nap', AX - 0.4, y0 + 2.0, zb + 1.93, 0.13, mat('#d8c8a0', 0.5), scale=(1, 1, 0.6), coll=coll)
    cyl('env_hc_long_moc', AX - 0.4, y0 + 2.0, zb + 2.02, 0.005, 0.2, steel, coll=coll)
    sphere('env_hc_meo_than', AX - 0.35, y0 + 0.45, zb + 0.2, 0.16, mat('#d8a860', 0.9), scale=(0.9, 1.5, 0.8), coll=coll)
    sphere('env_hc_meo_dau', AX - 0.35, y0 + 0.65, zb + 0.34, 0.1, mat('#d8a860', 0.9), coll=coll)
    for sg in (-1, 1): sphere(f'env_hc_meo_tai{sg}', AX - 0.35 + sg * 0.06, y0 + 0.66, zb + 0.43, 0.035, mat('#d8a860', 0.9), scale=(1, 0.5, 1.4), coll=coll)
    cyl('env_hc_meo_duoi', AX - 0.35, y0 + 0.15, zb + 0.18, 0.025, 0.4, mat('#d8a860', 0.9), rot=(math.radians(80), 0, 0), coll=coll)
    # mái hiên tôn trên ban công + biển cho thuê phòng + chảo ăng-ten + bể nước + máy lạnh nhỏ
    B('hien_ton', AX - 1.2, AX, y0 - 0.2, y1 + 0.2, zb + 2.4, zb + 2.45, mat('#8c8f86', 0.55, 0.6), coll=coll, rot=(0, math.radians(-8), 0), pivot=(AX, 0, zb + 2.45))
    B('bien_cho_thue', AX - 0.04, AX, y1 + 0.3, y1 + 1.5, zb + 2.55, zb + 3.2, mat('#2f6fb0', 0.5), coll=coll)
    for k in range(6): B(f'bien_chu{k}', AX - 0.06, AX - 0.04, y1 + 0.4 + k * 0.17, y1 + 0.5 + k * 0.17, zb + 2.7 + (k % 2) * 0.1, zb + 3.0, white, coll=coll)
    sphere('env_hc_chao', AX - 0.3, y0 - 0.8, zb + 3.3, 0.34, mat('#d8d8d0', 0.5), scale=(0.5, 1, 1), coll=coll)
    cyl('env_hc_chao_can', AX - 0.2, y0 - 0.8, zb + 3.0, 0.015, 0.6, steel, coll=coll)
    B('may_lanh_n', AX - 0.4, AX, y0 - 2.4, y0 - 1.5, zb + 2.5, zb + 2.95, mat('#e6e3da', 0.4), bevel=0.02, coll=coll)
    cyl('env_hc_be_nuoc', AX - 0.8, y1 + 2.2, zb + 8.9, 0.6, 1.4, mat('#b9bdbb', 0.35, 0.3), coll=coll, bevel=0.02)
    B('be_nuoc_dung', AX - 1.1, AX - 0.4, y1 + 1.8, y1 + 2.6, zb + 7.2, zb + 8.2, mat('#8a8780', 0.8), coll=coll)
    # dây điện + dây đèn chằng ngang hẻm
    for k in range(6): wire((XB + 0.1, 0.3 + k * 0.55, 3.2 + k * 0.1), (AX - 0.15, 0.1 + k * 0.45, 3.7 + (k % 3) * 0.2), 0.7, nm=f'ngang{k}')
    for k in range(2):
        yy = 1.0 + k * 3.5; p0 = (XB + 0.1, yy, 4.0); p1 = (AX - 0.15, yy + 0.2, 4.1)
        wire(p0, p1, 0.8, nm=f'den_hem{k}')
        for i in range(1, 9):
            t = i / 9; x = p0[0] + (p1[0] - p0[0]) * t; z = p0[2] + (p1[2] - p0[2]) * t - 0.8 * 2 * t * (1 - t) * 0.5
            sphere(f'env_hc_bong{k}_{i}', x, yy + 0.2 * t, z - 0.05, 0.045, glow(rnd.choice(['#ffd79a', '#ffa860', '#fff1c8']), 5.0 if night else 0.8), coll=coll)
    # dưới hẻm: xe máy, thùng rác, chậu cây, ống nước, vũng nước
    for k, (yy, col) in enumerate([(0.6, '#b3362c'), (2.4, '#1f3a5f'), (4.8, '#3d6e5a')]):
        cyl(f'env_hc_bxm{k}a', W + T + 1.4, yy - 0.5, GZ + 0.28, 0.27, 0.12, mat('#202020', 0.8), rot=(0, math.pi / 2, 0) if False else None, coll=coll)
        B(f'xm{k}', W + T + 1.1, W + T + 1.6, yy - 0.4, yy + 0.4, GZ + 0.3, GZ + 0.75, mat(col, 0.45), bevel=0.05, coll=coll)
        B(f'xm_yen{k}', W + T + 1.15, W + T + 1.55, yy - 0.1, yy + 0.35, GZ + 0.75, GZ + 0.85, mat('#222222', 0.6), bevel=0.04, coll=coll)
    for k in range(3): cyl(f'env_hc_thung{k}', W + T + 1.9, -2.0 + k * 0.6, GZ + 0.4, 0.26, 0.8, mat(rnd.choice(['#3b6e4b', '#2b4a7a', '#8a8a8a']), 0.55), coll=coll, bevel=0.02)
    for k in range(5):
        cyl(f'env_hc_chau_hem{k}', W + T + 0.4, -3.5 + k * 1.1, GZ + 0.15, 0.17, 0.3, mat(rnd.choice(['#b0605a', '#c8a15a']), 0.7), coll=coll, bevel=0.01)
        for q in range(4): sphere(f'env_hc_la_hem{k}_{q}', W + T + 0.4 + 0.09 * math.cos(q * 1.6), -3.5 + k * 1.1 + 0.09 * math.sin(q * 1.6), GZ + 0.38 + 0.04 * q, 0.14, mat('#4f7a4a', 0.8), scale=(1, 1, 1.3), coll=coll)
    B('vung_nuoc', W + T + 0.5, W + T + 1.5, 1.0, 2.6, GZ + 0.002, GZ + 0.006, mat('#6f8590', 0.05), coll=coll)
    B('ong_thoat_nuoc', W + T + 0.02, W + T + 0.08, 4.2, 4.26, GZ, GZ + FL * 3, mat('#cfd3cf', 0.45), coll=coll)


def tranh_tuong(X, coll, night=False):
    """Tranh vẽ đường phố (mural) trên các mảng tường ngoài còn trống: làng quê, hoa sen, phố xe máy, graffiti trừu tượng, mặt cười.
    Mỗi tranh gồm các hình phẳng xếp lớp (chữ nhật + elip dẹt), không dùng ảnh nền."""
    box, sphere, M = X.box, X.sphere, X.M
    GZ = -2.92
    def mat(c):
        k = ('mu', c)
        if k not in _cache: _cache[k] = M.solid('emu_' + c.strip('#'), c, 0.85)
        return _cache[k]
    cnt = [0]

    def mural(name, face, wall, u0, v0, w, h, shapes):
        cnt[0] += 1
        for i, sh in enumerate(shapes):
            d = 0.01 + 0.003 * i
            if sh[0] == 'r':
                _, ua, ub, va, vb, c = sh
                if face == '-x': box(f'env_mu_{name}_{i}', wall - d - 0.003, wall - d, u0 + ua * w, u0 + ub * w, v0 + va * h, v0 + vb * h, mat(c), coll=coll)
                elif face == '+x': box(f'env_mu_{name}_{i}', wall + d, wall + d + 0.003, u0 + ua * w, u0 + ub * w, v0 + va * h, v0 + vb * h, mat(c), coll=coll)
                else: box(f'env_mu_{name}_{i}', u0 + ua * w, u0 + ub * w, wall + d, wall + d + 0.003, v0 + va * h, v0 + vb * h, mat(c), coll=coll)
            else:
                _, cu, cv, ru, rv, c = sh
                U = u0 + cu * w; V = v0 + cv * h; RU = ru * w; RV = rv * h
                if face == '-x': sphere(f'env_mu_{name}_{i}', wall - d - 0.0015, U, V, 1.0, mat(c), scale=(0.0015, RU, RV), coll=coll)
                elif face == '+x': sphere(f'env_mu_{name}_{i}', wall + d + 0.0015, U, V, 1.0, mat(c), scale=(0.0015, RU, RV), coll=coll)
                else: sphere(f'env_mu_{name}_{i}', U, wall + d + 0.0015, V, 1.0, mat(c), scale=(RU, 0.0015, RV), coll=coll)

    # u, v chuẩn hoá 0..1 theo chiều rộng/cao tranh. 'r' = chữ nhật (u0,u1,v0,v1), 'e' = elip (cu,cv,ru,rv)
    LANG_QUE = [('r', 0, 1, 0, 1, '#8fd0e8'), ('e', 0.78, 0.78, 0.07, 0.15, '#f4c542'), ('e', 0.22, 0.4, 0.55, 0.32, '#4f9a5a'), ('e', 0.65, 0.38, 0.5, 0.28, '#3f8a4f'),
                ('e', 0.9, 0.36, 0.3, 0.22, '#5aa860'), ('r', 0, 1, 0, 0.28, '#4a9fc8'), ('e', 0.3, 0.13, 0.12, 0.03, '#ffffff'), ('e', 0.7, 0.1, 0.1, 0.025, '#ffffff'),
                ('e', 0.5, 0.2, 0.13, 0.05, '#c24a3a'), ('r', 0.495, 0.505, 0.2, 0.5, '#4a3a2a'), ('e', 0.55, 0.38, 0.05, 0.1, '#f2f2f2'),
                ('e', 0.2, 0.85, 0.03, 0.045, '#e8506a'), ('e', 0.4, 0.9, 0.025, 0.04, '#f2d24a'), ('e', 0.12, 0.7, 0.02, 0.03, '#ffffff'), ('e', 0.33, 0.8, 0.02, 0.03, '#ffffff')]
    HOA_SEN = [('r', 0, 1, 0, 1, '#2a7f86'), ('e', 0.25, 0.25, 0.22, 0.18, '#3fa060'), ('e', 0.75, 0.2, 0.25, 0.17, '#35905a'), ('e', 0.5, 0.12, 0.3, 0.1, '#58b070'),
               ('r', 0.495, 0.505, 0.1, 0.55, '#2f6a3a'), ('e', 0.5, 0.62, 0.17, 0.2, '#f08aa8'), ('e', 0.4, 0.58, 0.1, 0.17, '#f4a6bc'), ('e', 0.6, 0.58, 0.1, 0.17, '#f4a6bc'),
               ('e', 0.5, 0.68, 0.08, 0.14, '#f8c4d2'), ('e', 0.5, 0.56, 0.05, 0.06, '#f4c542'), ('e', 0.15, 0.7, 0.05, 0.08, '#f4a6bc'), ('e', 0.86, 0.66, 0.04, 0.07, '#f08aa8'),
               ('e', 0.2, 0.9, 0.025, 0.04, '#ffffff'), ('e', 0.78, 0.88, 0.03, 0.05, '#f2f2f2')]
    PHO_XE = [('r', 0, 1, 0, 1, '#f2c14e'), ('e', 0.85, 0.82, 0.08, 0.16, '#e8743c'), ('r', 0.03, 0.17, 0.2, 0.7, '#c24a3a'), ('r', 0.17, 0.3, 0.2, 0.55, '#3b6ea5'), ('r', 0.3, 0.46, 0.2, 0.82, '#6a4a8a'),
              ('r', 0.46, 0.58, 0.2, 0.6, '#2f8a6a'), ('r', 0.58, 0.74, 0.2, 0.75, '#c8504a'), ('r', 0.74, 0.97, 0.2, 0.5, '#4a7ab0'), ('r', 0, 1, 0, 0.22, '#3a3a3a'),
              ('r', 0.0, 1.0, 0.09, 0.105, '#f2f2f2'), ('e', 0.3, 0.2, 0.05, 0.1, '#111111'), ('e', 0.43, 0.2, 0.05, 0.1, '#111111'), ('r', 0.31, 0.43, 0.2, 0.3, '#d8352a'), ('e', 0.37, 0.4, 0.035, 0.09, '#f2d0a8'),
              ('e', 0.68, 0.2, 0.05, 0.1, '#111111'), ('e', 0.81, 0.2, 0.05, 0.1, '#111111'), ('r', 0.69, 0.81, 0.2, 0.3, '#2f5f9a'), ('e', 0.75, 0.4, 0.035, 0.09, '#f2d0a8'), ('e', 0.75, 0.47, 0.06, 0.03, '#d8c060')]
    GRAFFITI = [('r', 0, 1, 0, 1, '#1b1b22'), ('e', 0.3, 0.5, 0.22, 0.4, '#ff4f8b'), ('e', 0.55, 0.45, 0.18, 0.33, '#34d1bf'), ('e', 0.78, 0.55, 0.15, 0.3, '#ffd23f'),
                ('r', 0.05, 0.95, 0.12, 0.2, '#6a5acd'), ('r', 0.1, 0.9, 0.83, 0.9, '#ff7a2f'), ('e', 0.3, 0.5, 0.09, 0.16, '#1b1b22'), ('e', 0.55, 0.45, 0.07, 0.13, '#ffffff'),
                ('e', 0.78, 0.55, 0.06, 0.12, '#ff4f8b'), ('r', 0.2, 0.25, 0.3, 0.75, '#34d1bf'), ('r', 0.7, 0.74, 0.25, 0.8, '#ffd23f'), ('e', 0.9, 0.2, 0.04, 0.08, '#ffffff'), ('e', 0.08, 0.8, 0.04, 0.08, '#ff4f8b')]
    MAT_CUOI = [('r', 0, 1, 0, 1, '#f08a3c'), ('e', 0.5, 0.5, 0.42, 0.42, '#f6d7a8'), ('e', 0.36, 0.58, 0.07, 0.09, '#ffffff'), ('e', 0.64, 0.58, 0.07, 0.09, '#ffffff'),
                ('e', 0.37, 0.57, 0.035, 0.045, '#222222'), ('e', 0.63, 0.57, 0.035, 0.045, '#222222'), ('e', 0.5, 0.33, 0.2, 0.08, '#c8352a'), ('e', 0.5, 0.36, 0.2, 0.045, '#f6d7a8'),
                ('e', 0.28, 0.4, 0.06, 0.05, '#f2a08a'), ('e', 0.72, 0.4, 0.06, 0.05, '#f2a08a'), ('e', 0.5, 0.88, 0.3, 0.1, '#3a2a1a')]
    # tường hướng sân phía đầu nhà (x = 0, nhìn về −x): hai tranh lớn
    if getattr(X, 'MODE_HIEN_TAI', 'day') != 'rain':   # cảnh S07 (một tuần trước): tường góc đồ cho tặng còn trơ, chưa có tranh
        mural('lang_que', '-x', 0.0, -8.6, GZ + 0.2, 5.2, 2.5, LANG_QUE)
        mural('graffiti', '-x', 0.0, -3.4, GZ + 0.25, 2.2, 1.8, GRAFFITI)
    mural('pho_xe', '-x', 0.0, -8.6, 0.35, 4.6, 2.2, PHO_XE)
    mural('mat_cuoi', '-x', 0.0, -3.4, 0.45, 2.1, 2.1, MAT_CUOI)
    # tường rào đầu sân phía y âm (y = −14,5, hướng +y)
    mural('hoa_sen', '+y', -14.2, -8.5, GZ + 0.2, 3.2, 2.2, HOA_SEN)
    mural('graffiti2', '+y', -14.2, -4.6, GZ + 0.2, 3.0, 2.0, GRAFFITI)
    # tường nhà hàng xóm bên hẻm (hướng −x): chỗ trống tầng trệt + giữa hai tầng
    AX = X.W + X.T + 2.2
    mural('hem_hoa_sen', '-x', AX, -9.0, GZ + 0.3, 3.4, 2.3, HOA_SEN)
    mural('hem_pho_xe', '-x', AX, 5.2, GZ + 0.3, 4.4, 2.1, PHO_XE)
    mural('hem_mat_cuoi', '-x', AX, -4.6, GZ + 0.3, 1.9, 1.9, MAT_CUOI)


def vat_lieu_nha_xa(tag, mau_tuong, mau_cua, night):
    """Mặt tiền nhà xa: lưới cửa sổ (Checker theo toạ độ vật thể), đậm dần theo chiều cao; ban đêm một phần ô phát sáng."""
    k = ('xa', tag, night)
    if k in _cache: return _cache[k]
    m = bpy.data.materials.new('exa_' + tag); m.use_nodes = True; nt = m.node_tree; N, L = nt.nodes, nt.links
    for n in list(N): N.remove(n)
    import mathutils
    def hx(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)) + (1,)
    tc = N.new('ShaderNodeTexCoord'); mp = N.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (0.5, 0.5, 0.3); L.new(tc.outputs['Object'], mp.inputs['Vector'])
    ck = N.new('ShaderNodeTexChecker'); ck.inputs['Scale'].default_value = 1.0; L.new(mp.outputs['Vector'], ck.inputs['Vector'])
    ck.inputs['Color1'].default_value = hx(mau_tuong); ck.inputs['Color2'].default_value = hx(mau_cua)
    nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 4.0; L.new(tc.outputs['Object'], nz.inputs['Vector'])
    mix = N.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.inputs['Factor'].default_value = 0.12; L.new(ck.outputs['Color'], mix.inputs['A']); L.new(nz.outputs['Color'], mix.inputs['B'])
    bs = N.new('ShaderNodeBsdfPrincipled'); bs.inputs['Roughness'].default_value = 1.0; L.new(mix.outputs['Result'], bs.inputs['Base Color'])
    out = N.new('ShaderNodeOutputMaterial')
    if night:
        em = N.new('ShaderNodeEmission'); em.inputs['Color'].default_value = (1.0, 0.82, 0.55, 1); em.inputs['Strength'].default_value = 2.2
        fl = N.new('ShaderNodeVectorMath'); fl.operation = 'FLOOR'; L.new(mp.outputs['Vector'], fl.inputs[0])
        nz2 = N.new('ShaderNodeTexNoise'); nz2.inputs['Scale'].default_value = 2.7; nz2.inputs['Detail'].default_value = 0.0; L.new(fl.outputs['Vector'], nz2.inputs['Vector'])
        ths = N.new('ShaderNodeMath'); ths.operation = 'GREATER_THAN'; ths.inputs[1].default_value = 0.52; L.new(nz2.outputs['Fac'], ths.inputs[0])
        win = N.new('ShaderNodeMath'); win.operation = 'LESS_THAN'; win.inputs[1].default_value = 0.5; L.new(ck.outputs['Fac'], win.inputs[0])
        both = N.new('ShaderNodeMath'); both.operation = 'MULTIPLY'; L.new(ths.outputs[0], both.inputs[0]); L.new(win.outputs[0], both.inputs[1])
        mx = N.new('ShaderNodeMixShader'); L.new(both.outputs[0], mx.inputs[0]); L.new(bs.outputs[0], mx.inputs[1]); L.new(em.outputs[0], mx.inputs[2]); L.new(mx.outputs[0], out.inputs['Surface'])
    else:
        L.new(bs.outputs[0], out.inputs['Surface'])
    _cache[k] = m; return m


def xa_chi_tiet(X, coll, night):
    """Vài chi tiết đơn giản ở xa: toà nhà có lưới cửa sổ, bể nước + ăng-ten + hộp kỹ thuật trên mái, cần cẩu công trường, tháp phát sóng có đèn đỏ,
    dãy cây xa, đàn chim, ống khói/khối điều hoà trung tâm."""
    box, cyl, sphere, M = X.box, X.cyl, X.sphere, X.M
    GZ = -2.92; rnd = random.Random(555)
    def mat(color, rough=0.8, metal=0.0):
        k = ('xs', color, rough, metal)
        if k not in _cache: _cache[k] = M.solid('exs_' + color.strip('#') + f'_{int(rough*10)}', color, rough, metal)
        return _cache[k]
    def glow(color, st):
        k = ('xg', color, st)
        if k not in _cache: _cache[k] = M.emission('exg_' + color.strip('#') + str(st), color, st)
        return _cache[k]
    def B(name, *a, **kw): return box('env_xa_' + name, *a, **kw)
    pal = [('#c9ccc8', '#9aa8b2'), ('#d8c9a8', '#97a2aa'), ('#b8c2c8', '#8797a4'), ('#cfc2b0', '#a09890'), ('#c2cdbd', '#8c9c94')]
    for li, dist in enumerate((90, 150, 230)):
        for k in range(18):
            a = math.radians(rnd.uniform(0, 360)); r = dist + rnd.uniform(-12, 40)
            cx, cy = math.cos(a) * r - 8, math.sin(a) * r * 0.9 + 12
            hh = rnd.uniform(16, 52) * (1 + li * 0.18); w1 = rnd.uniform(9, 20); d1 = rnd.uniform(9, 18)
            col = pal[(li + k) % len(pal)]
            mm = vat_lieu_nha_xa(f'{li}_{k % 5}', col[0], col[1], night)
            B(f'toa{li}_{k}', cx - w1 / 2, cx + w1 / 2, cy - d1 / 2, cy + d1 / 2, GZ - 1, GZ + hh, mm, coll=coll)
            top = GZ + hh
            B(f'toa_mai{li}_{k}', cx - w1 / 2 - 0.3, cx + w1 / 2 + 0.3, cy - d1 / 2 - 0.3, cy + d1 / 2 + 0.3, top, top + 0.5, mat('#9a9a94'), coll=coll)
            if rnd.random() < 0.6: cyl(f'env_xa_be{li}_{k}', cx + rnd.uniform(-w1 / 4, w1 / 4), cy + rnd.uniform(-d1 / 4, d1 / 4), top + 1.6, rnd.uniform(1.0, 1.6), 2.4, mat(rnd.choice(['#2f6fb0', '#b9bdbb', '#c9c2ae']), 0.4), coll=coll)
            if rnd.random() < 0.5:
                cyl(f'env_xa_angten{li}_{k}', cx, cy, top + 3, 0.12, 6.0, mat('#444444'), coll=coll)
                B(f'angten_n{li}_{k}', cx - 1.2, cx + 1.2, cy - 0.06, cy + 0.06, top + 4.2, top + 4.35, mat('#444444'), coll=coll)
            if rnd.random() < 0.35: B(f'hop_kt{li}_{k}', cx - 2, cx + 2, cy - 1.5, cy + 1.5, top + 0.5, top + 2.2, mat('#b5b2a8'), coll=coll)
    # cần cẩu công trường (xa, bên trái)
    for (cx, cy) in [(-60, 120), (35, 150)]:
        B(f'can_cau_thap{cx}', cx - 0.8, cx + 0.8, cy - 0.8, cy + 0.8, GZ, GZ + 62, mat('#e0a030', 0.6), coll=coll)
        B(f'can_cau_tay{cx}', cx - 22, cx + 14, cy - 0.5, cy + 0.5, GZ + 62, GZ + 63.2, mat('#e0a030', 0.6), coll=coll)
        B(f'can_cau_doi{cx}', cx + 14, cx + 18, cy - 0.5, cy + 0.5, GZ + 59, GZ + 63.2, mat('#555555'), coll=coll)
        B(f'can_cau_cap{cx}', cx - 15, cx - 14.9, cy - 0.05, cy + 0.05, GZ + 50, GZ + 62, mat('#222222'), coll=coll)
        B(f'can_cau_moc{cx}', cx - 15.5, cx - 14.5, cy - 0.5, cy + 0.5, GZ + 49, GZ + 50, mat('#222222'), coll=coll)
        sphere(f'env_xa_den_cau{cx}', cx, cy, GZ + 64.2, 0.6, glow('#ff3a2a', 9.0 if night else 1.0), coll=coll)
    # tháp phát sóng xa có đèn đỏ nhấp nháy tĩnh
    B('thap_phat_song', -97, -95, 197, 199, GZ, GZ + 150, mat('#c24a3a', 0.6), coll=coll)
    for z in (40, 80, 120): B(f'thap_ngang{z}', -100, -92, 196.2, 199.8, GZ + z, GZ + z + 0.8, mat('#e8e4d8', 0.6), coll=coll)
    sphere('env_xa_den_thap', -96, 198, GZ + 151, 1.2, glow('#ff3a2a', 12.0 if night else 1.0), coll=coll)
    # dãy cây xa (lùm tròn thấp) phía ngoài hai đầu sân
    for k in range(40):
        cx = rnd.uniform(-60, 30); cy = rnd.choice([-1, 1]) * rnd.uniform(110, 150) + (40 if k % 2 else 0)
        sphere(f'env_xa_cay{k}', cx, cy, GZ + rnd.uniform(5, 9), rnd.uniform(4, 7), mat(rnd.choice(['#4a7a47', '#5f8d54', '#3f6e45']), 0.9), scale=(1, 1, 0.8), coll=coll)
    # đàn chim (ban ngày) — chữ V dẹt
    if not night:
        for k in range(12):
            bx_ = rnd.uniform(-40, -10) + k * 1.5; by_ = 12 + rnd.uniform(-8, 8) + k * 1.2; bz = 30 + rnd.uniform(-3, 3) + (k % 3)
            B(f'chim_a{k}', bx_ - 0.4, bx_ + 0.0, by_ - 0.02, by_ + 0.02, bz, bz + 0.06, mat('#222222'), coll=coll, rot=(0, 0, math.radians(18)), pivot=(bx_, by_, bz))
            B(f'chim_b{k}', bx_, bx_ + 0.4, by_ - 0.02, by_ + 0.02, bz, bz + 0.06, mat('#222222'), coll=coll, rot=(0, 0, math.radians(-18)), pivot=(bx_, by_, bz))
