"""Chi tiết đời sống cho 3 bối cảnh Hồi 3 (15/11/2026): cho đỡ đơn điệu mà ít tốn render.

Quy tắc giữ nhanh:
- Vật lặp lại = instance (mỗi loại một lưới mẫu, `_mau()`), lưới mẫu ít mặt.
- Không thêm đèn, không thêm vật phát sáng, không thêm kính.
- Vật trôi/bay chuyển động bằng driver theo khung (không keyframe, không mô phỏng).
Gọi: chi_tiet_hoi3.giang_duong(m, c) · san_truong(m, c) · bo_ke(m, c) — ở cuối phần dựng, TRƯỚC toi_uu.apply.
"""
import math, random
import bpy
import vat_lieu as M, hinh_khoi as K


def _mau(ten, ham):
    """Dựng lưới mẫu từ hàm ham(tmp) trả về list vật → gộp thành 1 lưới instance."""
    tmp = K.coll('_mau_ct'); me = K.gop(ten, ham(tmp)); bpy.data.collections.remove(tmp); return me


def _troi_theo_khung(ob, truc, toc_do, goc):
    d = ob.driver_add('location', truc).driver; d.expression = f'{goc:.3f} + frame * {toc_do:.4f}'


def _mat(ten, mau, r=0.7, mt=0.0):
    return bpy.data.materials.get(ten) or M.solid(ten, mau, r, mt)


# ---------------------------------------------------------------------------------------------- GIẢNG ĐƯỜNG
def giang_duong(m, c, so_hang=14, y_hang0=4.2, sau_hang=0.95, cao_bac=0.32, cum_x=(-6.6, -4.25, -1.9, 1.9, 4.25, 6.6), xw=8.5, tran=7.4):
    rnd = random.Random(55)
    giay = _mat('ct_giay', '#f3efe4', 0.9); bia = [_mat(f'ct_bia_{i}', h, 0.6) for i, h in enumerate(('#2f5c9a', '#b23a3a', '#e0b84a', '#3f7a4f'))]
    nhua = _mat('ct_nhua_trong', '#cfe3ea', 0.25); nap = _mat('ct_nap', '#2a6fd6', 0.4); den = _mat('ct_den', '#1d1f22', 0.4)
    bac = _mat('ct_vo_laptop', '#a9adb2', 0.35, 0.6); vai = [_mat(f'ct_cap_{i}', h, 0.85) for i, h in enumerate(('#2d3a2a', '#1f2a44', '#5a2e2e', '#3b3b3b'))]
    mau = {
        'sach': [_mau(f'ct_sach_{i}', lambda t, i=i: [K.box('a', -0.1, 0.1, -0.14, 0.14, 0, 0.025, bia[i], t), K.box('b', -0.095, 0.098, -0.135, 0.135, 0.003, 0.022, giay, t)]) for i in range(4)],
        'vo': _mau('ct_vo_mo', lambda t: [K.box('t', -0.17, 0, -0.11, 0.11, 0, 0.006, giay, t, rot=(0, math.radians(-3), 0)), K.box('p', 0, 0.17, -0.11, 0.11, 0, 0.006, giay, t, rot=(0, math.radians(3), 0)),
                                         K.box('but', -0.02, 0.12, 0.05, 0.06, 0.006, 0.014, nap, t)]),
        'chai': _mau('ct_chai', lambda t: [K.cyl('c', 0, 0, 0, 0.033, 0.2, nhua, t, seg=10), K.cyl('n', 0, 0, 0.2, 0.016, 0.025, nap, t, seg=8)]),
        'laptop': _mau('ct_laptop', lambda t: [K.box('d', -0.16, 0.16, -0.11, 0.11, 0, 0.015, bac, t), K.box('m', -0.16, 0.16, 0.1, 0.115, 0.015, 0.22, bac, t, rot=(math.radians(-12), 0, 0)),
                                              K.box('s', -0.15, 0.15, 0.097, 0.1, 0.025, 0.21, den, t, rot=(math.radians(-12), 0, 0))]),
        'dt': _mau('ct_dien_thoai', lambda t: [K.box('d', -0.035, 0.035, -0.075, 0.075, 0, 0.008, den, t)]),
        'cap': [_mau(f'ct_cap_sach_{i}', lambda t, i=i: [K.box('than', -0.15, 0.15, -0.08, 0.08, 0, 0.4, vai[i], t), K.box('tui', -0.11, 0.11, -0.11, -0.08, 0.05, 0.22, vai[i], t)]) for i in range(4)],
    }
    n = 0
    for r in range(so_hang):
        y0 = y_hang0 + r * sau_hang + 0.03; z = (r + 1) * cao_bac
        for j, cx in enumerate(cum_x):
            for s in range(4):
                x = cx - 0.82 + 0.55 * s
                if rnd.random() < 0.75:   # đồ trên mặt bàn (0,75 m), đặt ngay trước chỗ ngồi
                    k = rnd.choice(['sach', 'vo', 'vo', 'chai', 'laptop', 'dt', 'sach'])
                    me = mau[k][rnd.randrange(4)] if k == 'sach' else mau[k]
                    K.inst(f'ct_gd_{k}_{r}_{j}_{s}', me, (x + rnd.uniform(-0.1, 0.1), y0 + 0.2 + rnd.uniform(-0.05, 0.05), z + 0.75), c, rot=(0, 0, math.radians(rnd.uniform(-25, 25)))); n += 1
                if rnd.random() < 0.3:    # cặp sách dựng dưới chân / trên ghế trống
                    K.inst(f'ct_gd_cap_{r}_{j}_{s}', mau['cap'][rnd.randrange(4)], (x, y0 + 0.62, z + (0.47 if rnd.random() < 0.4 else 0.0)), c, rot=(0, 0, rnd.uniform(-0.4, 0.4))); n += 1
    # chữ phấn trên bảng: nét phấn là hộp mỏng vật liệu thường (KHÔNG phát sáng); vài dòng công thức + khung hình vẽ
    phan = _mat('ct_net_phan', '#b9c7bb', 0.95)
    for dong in range(6):
        x = -6.2; zc = 2.55 - dong * 0.2
        while x < -1.4 - rnd.uniform(0, 2.0):
            w = rnd.uniform(0.015, 0.06); h = rnd.uniform(0.012, 0.05); zz = zc + rnd.uniform(-0.012, 0.012)
            K.box(f'ct_chu_{dong}_{x:.2f}', x, x + w, -0.917, -0.915, zz, zz + h, phan, c); x += w + (rnd.uniform(0.1, 0.22) if rnd.random() < 0.18 else rnd.uniform(0.008, 0.02)); n += 1
    for (a, b, z0, z1) in ((-3.1, -1.2, 1.45, 1.47), (-3.1, -3.08, 1.45, 2.0), (-1.22, -1.2, 1.45, 2.0), (-3.1, -1.2, 1.98, 2.0)):
        K.box(f'ct_khung_ve_{a}_{z0}', a, b, -0.917, -0.915, z0, z1, phan, c)
    # loa treo tường, dây điện + ổ cắm, đồng hồ, tờ thông báo, thùng rác, khăn lau bảng
    loa = _mau('ct_loa', lambda t: [K.box('v', -0.15, 0.15, -0.12, 0.12, -0.22, 0.22, den, t), K.box('g', -0.03, 0.03, -0.03, 0.03, 0.22, 0.32, _mat('ct_gia_sat', '#555a5f', 0.4, 0.7), t)])
    for k, (x, y) in enumerate(((-xw + 0.15, 3.0), (xw - 0.15, 3.5), (-xw + 0.15, 11.5), (xw - 0.15, 11.5))):
        K.inst(f'ct_loa_{k}', loa, (x, y, 5.6), c, rot=(0, 0, math.radians(90 if x < 0 else -90))); n += 1
    day = _mat('ct_day_dien', '#e9e6dd', 0.6)
    K.box('ct_day_dien_truoc', -xw, xw, -0.995, -0.985, tran - 0.4, tran - 0.37, day, c)
    for x in (-7.5, 7.5): K.box(f'ct_day_dien_xuong_{x}', x - 0.015, x + 0.015, -0.995, -0.985, 0.35, tran - 0.37, day, c)
    for x in (-7.5, 7.5): K.box(f'ct_o_cam_{x}', x - 0.06, x + 0.06, -0.99, -0.96, 0.3, 0.4, day, c)
    dh = K.cyl('ct_dong_ho', 0.0, -0.99, 5.2, 0.22, 0.04, giay, c, seg=24, rot=(math.radians(90), 0, 0)); K.cyl('ct_vien_dong_ho', 0.0, -0.995, 5.2, 0.24, 0.03, den, c, seg=24, rot=(math.radians(90), 0, 0))
    K.box('ct_kim_gio', -0.005, 0.005, -0.955, -0.95, 5.2, 5.33, den, c, rot=(0, math.radians(40), 0)); K.box('ct_kim_phut', -0.004, 0.004, -0.955, -0.95, 5.2, 5.38, den, c, rot=(0, math.radians(-70), 0))
    to = [_mat(f'ct_to_{i}', h, 0.9) for i, h in enumerate(('#f6f1e4', '#f2e48a', '#f0c3c3'))]
    for k, (x, y, z) in enumerate(((xw - 0.02, 3.6, 1.5), (xw - 0.02, 3.95, 1.55), (xw - 0.02, 3.75, 1.25), (-xw + 0.02, 1.0, 1.6), (-xw + 0.02, 1.3, 1.45))):
        K.box(f'ct_thong_bao_{k}', x - 0.005, x + 0.005, y - 0.105, y + 0.105, z - 0.15, z + 0.15, to[k % 3], c, rot=(math.radians(rnd.uniform(-4, 4)), 0, 0)); n += 1
    K.cyl('ct_thung_rac', 6.8, 0.2, 0.32, 0.16, 0.42, _mat('ct_thung_xanh', '#2f7a54', 0.5), c, seg=16)
    K.box('ct_khan_lau', -1.1, -0.95, -0.9, -0.84, 1.22, 1.26, _mat('ct_khan', '#7a6e5c', 0.95), c)
    K.box('ct_bien_phong', xw - 0.02, xw, 1.9, 2.7, 2.55, 2.8, _mat('ct_bien_xanh', '#1d3f74', 0.5), c)
    return n


# ---------------------------------------------------------------------------------------------- SÂN TRƯỜNG
def san_truong(m, c, hl=3.2, y0=-5.0, y1=60.0):
    rnd = random.Random(77); n = 0
    la_kho = [_mat(f'ct_la_{i}', h, 0.9) for i, h in enumerate(('#b98a3a', '#8a6a2a', '#a8452e', '#6e7a3a'))]
    me_la = [_mau(f'ct_mau_la_{i}', lambda t, i=i: [K.box('l', -0.07, 0.07, -0.04, 0.04, 0, 0.004, la_kho[i], t)]) for i in range(4)]
    goc = [(9, 2), (9, 16), (9, 40), (9, 52), (24, 6), (24, 26), (24, 46), (38, 14), (38, 36)]
    for k in range(420):   # lá rụng quanh gốc + bị gió lùa vào chân hành lang
        if k < 340: gx, gy = goc[k % len(goc)]; a = rnd.uniform(0, 6.28); r = rnd.uniform(1.4, 4.5); x, y = gx + r * math.cos(a), gy + r * math.sin(a)
        else: x, y = hl + rnd.uniform(0.0, 0.6), rnd.uniform(y0, y1)
        K.inst(f'ct_la_{k}', me_la[rnd.randrange(4)], (x, y, 0.003), c, rot=(0, 0, rnd.uniform(0, 6.28))); n += 1
    da = _mat('ct_da_mai', '#b7b2a8', 0.8)
    ghe = _mau('ct_ghe_da', lambda t: [K.box('m', -0.8, 0.8, -0.22, 0.22, 0.4, 0.48, da, t, ), K.box('c1', -0.65, -0.5, -0.18, 0.18, 0, 0.4, da, t), K.box('c2', 0.5, 0.65, -0.18, 0.18, 0, 0.4, da, t)])
    for k, (x, y, a) in enumerate(((11.0, 2.0, 90), (11.0, 16.0, 90), (22.0, 26.0, 90), (26.2, 46.0, 90), (36.0, 14.0, 90), (11.0, 40.0, 90))):
        K.inst(f'ct_ghe_da_{k}', ghe, (x, y, 0), c, rot=(0, 0, math.radians(a))); n += 1
    thung = _mau('ct_thung_rac_san', lambda t: [K.cyl('t', 0, 0, 0, 0.25, 0.8, _mat('ct_thung_cam', '#d9822b', 0.5), t, seg=14), K.cyl('n', 0, 0, 0.8, 0.27, 0.06, _mat('ct_nap_xam', '#4a4f55', 0.5), t, seg=14)])
    for k, (x, y) in enumerate(((3.7, 4.0), (3.7, 22.0), (3.7, 40.0), (12.5, 2.0), (25.5, 28.0), (37.0, 50.0))):
        K.inst(f'ct_thung_{k}', thung, (x, y, 0), c); n += 1
    sat = _mat('st_sat', '#3b3f44', 0.45, 0.8); bien = _mat('ct_bien_huong', '#1d5fa8', 0.5); trang = _mat('ct_trang', '#f2f2ee', 0.6)
    for k, (x, y) in enumerate(((5.0, 12.0), (20.0, 33.0), (30.0, 20.0))):
        K.cyl(f'ct_cot_bien_{k}', x, y, 0, 0.04, 2.3, sat, c, seg=8)
        K.box(f'ct_bien_{k}', x - 0.02, x + 0.02, y - 0.55, y + 0.55, 1.8, 2.25, bien, c)
        K.box(f'ct_chu_bien_{k}', x + 0.021, x + 0.024, y - 0.45, y + 0.1, 2.0, 2.06, trang, c); K.box(f'ct_mui_ten_{k}', x + 0.021, x + 0.024, y + 0.2, y + 0.45, 1.97, 2.09, trang, c); n += 3
    o = _mat('ct_vet_o', '#6f6a5f', 0.95)
    for k in range(17): K.box(f'ct_o_chan_cot_{k}', hl - 0.42, hl + 0.02, y0 + 4.0 * k - 0.22, y0 + 4.0 * k + 0.22, 0.08, 0.08 + rnd.uniform(0.25, 0.5), o, c); n += 1  # vết ố/rêu chân cột
    go = _mat('ct_bang_tin_go', '#8a5a30', 0.7)
    for k, y in enumerate((18.0, 34.0)):   # bảng tin hành lang dán giấy
        K.box(f'ct_bang_tin_{k}', 0.0, 0.05, y - 0.9, y + 0.9, 1.2, 2.2, go, c)
        for j in range(6): K.box(f'ct_giay_tin_{k}_{j}', 0.05, 0.056, y - 0.8 + 0.28 * j + rnd.uniform(0, 0.05), y - 0.58 + 0.28 * j, 1.35 + (j % 2) * 0.4, 1.68 + (j % 2) * 0.4, _mat(f'ct_to_{j % 3}', ('#f6f1e4', '#f2e48a', '#f0c3c3')[j % 3], 0.9), c); n += 1
    K.cyl('ct_binh_chua_chay', 0.25, 26.0, 0.08, 0.09, 0.55, _mat('ct_do', '#c42a1f', 0.4), c, seg=12); K.box('ct_bang_pccc', 0.0, 0.03, 25.8, 26.2, 0.9, 1.25, _mat('ct_do', '#c42a1f', 0.4), c)
    # sinh viên ngồi ghế đá / gốc cây: dùng lại lưới mẫu đứng sẵn có (st_mau_nguoi_*) nhưng hạ thấp (ngồi)
    for k, (x, y) in enumerate(((11.0, 1.4), (11.0, 2.7), (22.0, 25.6), (36.0, 14.5))):
        me = bpy.data.meshes.get(f'st_mau_nguoi_{k % 4}')
        if me: K.inst(f'ct_sv_ngoi_{k}', me, (x, y, -0.35), c, rot=(0, 0, math.radians(-90 + rnd.uniform(-20, 20)))); n += 1
    banh = _mat('ct_banh_xe', '#1d1f22', 0.6); khung = _mat('ct_xe_dap_xanh', '#2f7a9a', 0.4, 0.5)
    xe_dap = _mau('ct_xe_dap', lambda t: [K.cyl('b1', 0, -0.5, 0.33, 0.33, 0.03, banh, t, seg=16, rot=(0, math.radians(90), 0)), K.cyl('b2', 0, 0.5, 0.33, 0.33, 0.03, banh, t, seg=16, rot=(0, math.radians(90), 0)),
                                         K.box('k', -0.02, 0.02, -0.5, 0.5, 0.5, 0.54, khung, t), K.box('y', -0.06, 0.06, 0.2, 0.42, 0.78, 0.82, banh, t)])
    for k in range(5): K.inst(f'ct_xe_dap_{k}', xe_dap, (5.0 + 0.8 * k, 56.0, 0), c, rot=(0, 0, math.radians(90 + rnd.uniform(-8, 8)))); n += 1
    return n


# ---------------------------------------------------------------------------------------------- BỜ KÈ
def bo_ke(m, c, chan_ke_y=-6.6, nuoc_z=0.2, de_z=4.5, bac_sau=0.55, so_bac=12):
    rnd = random.Random(99); n = 0
    lb = _mat('ct_luc_binh', '#4f7a3a', 0.8); hoa = _mat('ct_hoa_luc_binh', '#a58ad1', 0.7)
    me_lb = _mau('ct_mau_luc_binh', lambda t: [K.sphere(f'l{i}', 0.25 * math.cos(i * 2.1), 0.25 * math.sin(i * 2.1), 0.03, 0.22, lb, t, scale=(1, 1, 0.35), seg=8) for i in range(3)]
                 + [K.sphere('h', 0, 0, 0.14, 0.06, hoa, t, seg=6)])
    for k in range(36):   # cụm lục bình trôi chậm theo dòng (driver: x tăng theo khung)
        x = rnd.uniform(-80, 60); y = chan_ke_y - rnd.uniform(1.0, 40.0)
        ob = K.inst(f'ct_luc_binh_{k}', me_lb, (x, y, nuoc_z), c, rot=(0, 0, rnd.uniform(0, 6.28)), scale=(s := rnd.uniform(0.7, 1.6), s, 1)); _troi_theo_khung(ob, 0, 0.012, x); n += 1
    rac = [_mau('ct_chai_nhua', lambda t: [K.cyl('c', 0, 0, 0, 0.04, 0.24, _mat('ct_nhua_trong', '#cfe3ea', 0.25), t, seg=8, rot=(0, math.radians(90), 0))]),
           _mau('ct_tui_nilon', lambda t: [K.sphere('t', 0, 0, 0, 0.12, _mat('ct_nilon', '#e8e4dc', 0.5), t, scale=(1.4, 1, 0.25), seg=8)]),
           _mau('ct_coc_xop', lambda t: [K.cyl('c', 0, 0, 0, 0.045, 0.1, _mat('ct_xop', '#f4f2ee', 0.8), t, seg=8, r2=0.035, rot=(math.radians(90), 0, 0))])]
    for k in range(30):   # rác dạt sát chân kè (gom ở mép nước) + vài cái trôi
        x = rnd.uniform(-25, 25); y = chan_ke_y - rnd.uniform(0.05, 1.2 if k < 22 else 12)
        ob = K.inst(f'ct_rac_{k}', rac[k % 3], (x, y, nuoc_z + 0.01), c, rot=(0, 0, rnd.uniform(0, 6.28)))
        if k >= 22: _troi_theo_khung(ob, 0, 0.012, x)
        n += 1
    lau = _mat('ct_co_lau', '#d8cdb0', 0.9); than_lau = _mat('ct_than_lau', '#8a8a5a', 0.9)
    me_lau = _mau('ct_mau_lau', lambda t: [K.cyl(f's{i}', 0.08 * math.cos(i), 0.08 * math.sin(i), 0, 0.008, 1.3 + 0.1 * (i % 3), than_lau, t, seg=4) for i in range(5)]
                   + [K.sphere(f'b{i}', 0.08 * math.cos(i) + 0.05, 0.08 * math.sin(i), 1.35 + 0.1 * (i % 3), 0.05, lau, t, scale=(0.6, 0.6, 2.2), seg=6) for i in range(5)])
    for k in range(70):   # cỏ lau mọc ở bãi đất hai đầu kè (ngoài vùng bậc đá)
        x = rnd.choice((-1, 1)) * rnd.uniform(32, 90); y = chan_ke_y + rnd.uniform(-0.5, 5.5)
        z = max(nuoc_z, de_z - (y / -bac_sau) * (de_z - nuoc_z + 0.4) / so_bac) if y < 0 else de_z - 0.3
        K.inst(f'ct_lau_{k}', me_lau, (x, y, z), c, rot=(0, 0, rnd.uniform(0, 6.28)), scale=(1, 1, rnd.uniform(0.7, 1.3))); n += 1
    go = _mat('ct_go_thuyen', '#5b4128', 0.8); mui = _mat('ct_mui_thuyen', '#2f5a6e', 0.6)
    thuyen = _mau('ct_mau_thuyen', lambda t: [K.box('than', -3.0, 3.0, -0.9, 0.9, -0.2, 0.5, go, t), K.box('mui', 3.0, 4.0, -0.5, 0.5, 0.0, 0.5, go, t),
                                             K.box('cabin', -2.4, 0.4, -0.75, 0.75, 0.5, 1.6, mui, t), K.box('mai', -2.6, 0.6, -0.85, 0.85, 1.6, 1.7, go, t)])
    for k, (x, y, v) in enumerate(((-40.0, -120.0, 0.04), (90.0, -260.0, -0.03), (-150.0, -420.0, 0.02))):   # thuyền chạy rất chậm (đủ thấy trong 20 s)
        ob = K.inst(f'ct_thuyen_{k}', thuyen, (x, y, nuoc_z), c, rot=(0, 0, 0 if v > 0 else math.pi), scale=(1.2, 1.2, 1.2)); _troi_theo_khung(ob, 0, v, x); n += 1
    chim_m = _mat('ct_chim', '#1e1c1c', 0.8)
    chim = _mau('ct_mau_chim', lambda t: [K.box('t', -0.25, 0.0, -0.03, 0.03, 0, 0.02, chim_m, t, rot=(0, math.radians(-20), 0)), K.box('p', 0.0, 0.25, -0.03, 0.03, 0, 0.02, chim_m, t, rot=(0, math.radians(20), 0))])
    for k in range(9):    # đàn chim bay ngang trời về phía cầu
        x0 = -120 + rnd.uniform(-10, 10) - 6 * k; ob = K.inst(f'ct_chim_{k}', chim, (x0, -90 - 4 * (k % 3) + rnd.uniform(-2, 2), 26 + 3 * math.sin(k)), c, scale=(3, 3, 3)); _troi_theo_khung(ob, 0, 0.18, x0); n += 1
    bt = _mat('ct_be_tong_moc', '#c9c4b8', 0.85); do = _mat('ct_son_do', '#c42a1f', 0.6)
    moc = _mau('ct_mau_cot_moc', lambda t: [K.box('c', -0.12, 0.12, -0.12, 0.12, 0, 0.7, bt, t), K.box('d', -0.125, 0.125, -0.125, 0.125, 0.55, 0.7, do, t)])
    for k in range(-12, 13): K.inst(f'ct_cot_moc_{k}', moc, (k * 15.0 + 7.0, 0.55, de_z), c); n += 1
    dep = _mat('ct_dep', '#e6e2d4', 0.8); quai = _mat('ct_quai_dep', '#3a6aa8', 0.6)
    i = 7; z = de_z - (i + 1) * (de_z - nuoc_z + 0.4) / so_bac   # đôi dép tổ ong ai bỏ quên hai bậc dưới chỗ Nam
    for s, dx in ((0, 0.0), (1, 0.13)):
        K.box(f'ct_dep_{s}', 1.1 + dx, 1.19 + dx, -(i + 1) * bac_sau + 0.12, -(i + 1) * bac_sau + 0.38, z, z + 0.025, dep, c, rot=(0, 0, math.radians(8 + 10 * s)))
        K.box(f'ct_quai_{s}', 1.1 + dx, 1.19 + dx, -(i + 1) * bac_sau + 0.2, -(i + 1) * bac_sau + 0.24, z + 0.025, z + 0.045, quai, c, rot=(0, 0, math.radians(8 + 10 * s)))
    return n
