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
        if k not in _cache: _cache[k] = M.mottled('ep_' + color.strip('#'), color, rough=0.95, scale=0.8, vary=0.1, bump=0.12)
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
    B('san_tang1', -30, EX, -14, 96, GZ - 0.2, GZ, M.tiles('env_san', '#b3ad9b', '#8a8577', 0.6), coll=coll)
    for (x0, x1, y0, y1, c) in [(-7.0, -6.0, 4, 9, '#7b9a5b'), (-3.2, -2.1, 11, 14, '#6f9455'), (-6.8, -5.4, 17, 21, '#7b9a5b'), (-3.0, -2.0, -2.2, 0.8, '#6f9455')]:
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
    for i in range(9):
        a = 1.0 + i * 2.55 + rnd.uniform(-0.15, 0.15)
        B(f'cua_t3_{i}', EX - 0.04, EX, a, a + 0.85, z3, z3 + 2.1, mat(cols3[i % 8], 0.55), bevel=0.006, coll=coll)
        B(f'khuon_t3_{i}', EX - 0.03, EX + 0.02, a - 0.06, a + 0.91, z3, z3 + 2.16, white, coll=coll)
        if i % 3 == 1: B(f'phoi_t3_{i}', X0 + 0.1, X0 + 0.9, a - 0.2, a + 0.5, z3 + 1.9, z3 + 1.94, mat('#3a3a3a', 0.5), coll=coll)
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
                    sphere(f'env_la{nm}{k}', cx - 0.2, y + 0.1 + k * 0.3, zb + 0.4, 0.13, mat('#4f7a4a', 0.8), scale=(1, 1, 0.8), coll=coll)
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
    def tree(x, y, h, tint='#4f7a4a'):
        for k in range(4):  # cành chính toả ra từ thân
            a = k * 1.57 + rnd.uniform(0, 0.6); canh(x, y, GZ + h * 0.5, 0.9 * math.cos(a), 0.9 * math.sin(a), h * 0.22, 0.07)
        for k in range(14):  # cụm lá nhỏ ở đầu cành, nhiều tông xanh
            a = rnd.uniform(0, 6.283); rr = rnd.uniform(0.4, 1.4)
            sphere(f'env_cum_la{x:.0f}{y:.0f}{k}', x + rr * math.cos(a), y + rr * math.sin(a), GZ + h * 0.7 + rnd.uniform(-0.4, 0.9), rnd.uniform(0.38, 0.6), mat(rnd.choice(['#5f8d54', '#7aa35f', '#4a7a47', '#8db36a']), 0.85), scale=(1, 1, 0.75), coll=coll)
    def tree_old(x, y, h, tint='#4f7a4a'):
        cyl(f'env_than_cay{x:.0f}{y:.0f}', x, y, GZ + h * 0.3, 0.16, h * 0.6, mat('#5a4636', 0.95), coll=coll, bevel=0.02)
        for k in range(9):
            a = rnd.uniform(0, 6.283); rr = rnd.uniform(0.0, 1.1)
            sphere(f'env_tan{x:.0f}{y:.0f}{k}', x + rr * math.cos(a), y + rr * math.sin(a), GZ + h * 0.72 + rnd.uniform(-0.3, 1.0), rnd.uniform(0.7, 1.15), mat(rnd.choice([tint, '#5f8d54', '#44704a']), 0.85), scale=(1, 1, 0.8), coll=coll)
    tree(-4.2, 6.5, 6.5); tree(-5.2, 18.0, 7.5); tree(-2.6, 12.6, 3.2, '#6f9455')
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
    for i in range(14):
        xe_may(rnd.uniform(-3.4, -1.9), 1.0 + i * 1.15 + rnd.uniform(-0.2, 0.2), rnd.choice([math.pi / 2, math.pi / 2, 1.2]), colors[i % 7])
    for i in range(6): xe_may(-7.0 + rnd.uniform(-0.3, 0.4), 4 + i * 3.1, math.pi / 2, colors[(i + 2) % 7])
    for i in range(5):  # thùng rác, chậu, xô
        cyl(f'env_thung_rac{i}', -2.2, 19.5 + i * 0.5, GZ + 0.4, 0.28, 0.8, mat(rnd.choice(['#3b6e4b', '#2b4a7a', '#8a8a8a']), 0.55), coll=coll, bevel=0.02)
    # cột điện + dây
    def pole(y, x=-4.8):
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
    B('hem_tuong_nha_ben', AX, AX + 0.4, -12, 16, GZ, GZ + FL * 4 + 1.5, plaster('#a89c7c'), coll=coll)
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
            for q in range(7): sphere(f'env_rieng_la{q}', EX - 0.35 + 0.15 * math.cos(q * 0.9), a - 0.2 + 0.15 * math.sin(q * 0.9), 0.75 + 0.06 * q % 4 * 0.2, 0.12, mat('#4f7a4a', 0.8), scale=(1, 1, 1.5), coll=coll)
        # đèn cửa + số phòng riêng
        B(f'rieng_den{k}', EX - 0.09, EX, a + 0.3, a + 0.5, 2.18, 2.28, mat('#d8d4c8', 0.5), bevel=0.01, coll=coll)
        sphere(f'env_rieng_bong{k}', EX - 0.06, a + 0.4, 2.12, 0.05, glow('#fff1d6', 12.0 if night else 1.5), coll=coll)


def sky(nt, bg, night):
    """Bầu trời: gradient chân trời → thiên đỉnh + mây (ngày) hoặc sao + ánh phố (đêm). Ghi đè màu nền của world."""
    N, L = nt.nodes, nt.links
    tc = N.new('ShaderNodeTexCoord'); sp = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Generated'], sp.inputs['Vector'])
    ramp = N.new('ShaderNodeValToRGB'); L.new(sp.outputs['Z'], ramp.inputs['Fac'])
    e = ramp.color_ramp.elements
    if not night:
        e[0].position = 0.5; e[0].color = (0.86, 0.91, 0.94, 1); e[1].position = 0.95; e[1].color = (0.36, 0.58, 0.82, 1)
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
        if k not in _cache: _cache[k] = M.mottled('ep2_' + color.strip('#'), color, rough=0.95, scale=0.8, vary=0.1, bump=0.1)
        return _cache[k]
    def B(name, *a, **kw): return box('env_' + name, *a, **kw)
    glass_dark = mat('#5d727c', 0.5); steel = mat('#2b2d2e', 0.45, 0.7); white = mat('#ece8dc', 0.6)
    # ---- khối nhà trọ phía sau/trước phòng Nam (đặc, có mặt tiền hướng hẻm)
    B('khoi_sau', 0.0, W + T, -9.0, -T, GZ, ZT + 0.15, plaster('#d4c8a8'), coll=coll)
    B('khoi_truoc', 0.0, W + T, D + T, YF + 2, GZ, ZT + 0.15, plaster('#d4c8a8'), coll=coll)
    B('khoi_mai', 0.0, W + T + 0.25, -9.0, YF + 2, ZT + 0.15, ZT + 0.3, plaster('#b9b5a8'), coll=coll)
    AXF = W + T
    for (ya, yb) in [(-9.0 + 0.6, -T - 0.6), (D + T + 0.6, YF)]:
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
    if not night: X.add_area('env_hat_hem', (4.2, 6.0, 9.0), 7.0, 3500, '#fff0d8', rot=(0, 0, 0), coll=coll)  # ánh hắt xuống hẻm hẹp (nhà 4 tầng che sáng)
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
