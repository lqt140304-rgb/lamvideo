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


# ---------------------------------------------------------------------------------------------- HÀNH LANG TRƯỜNG (bổ sung 15/11 chiều)
def hanh_lang(m, c, hl=3.2, y0=-5.0, y1=60.0, tang=3.6, cua_y=10.0):
    """Hành lang cho đỡ trống: băng rôn 20/11, đèn tuýp + quạt trần + ống điện trên trần, chậu cây, ghế inox, cây nước, bồn rửa tay,
    poster câu lạc bộ, biển sàn ướt, camera an ninh, nhóm sinh viên đứng/ngồi/tựa lan can. Toàn instance, không thêm đèn."""
    import noi_dung_bang as ND
    rnd = random.Random(2011); n = 0
    sat = _mat('st_sat', '#3b3f44', 0.45, 0.8); inox = _mat('ct_inox', '#c9ccd0', 0.25, 0.9); trang = _mat('ct_trang', '#f2f2ee', 0.6)
    nhua = _mat('ct_nhua_trang', '#e9e7e0', 0.45); den_tat = _mat('ct_tuyp_tat', '#f4f1e6', 0.35)
    tay = ND._font('PatrickHand-Regular.ttf')
    def chu(ten, body, x, y, z, size, mat, rz, align='CENTER'):
        cu = bpy.data.curves.new(ten, 'FONT'); cu.body = body; cu.font = tay; cu.size = size; cu.align_x = align; cu.align_y = 'CENTER'
        ob = bpy.data.objects.new(ten, cu); ob.location = (x, y, z); ob.rotation_euler = (math.radians(90), 0, rz); cu.materials.append(mat); c.objects.link(ob)
    # trần mỗi tầng: máng đèn tuýp (tắt, ban ngày) mỗi 4 m, quạt trần mỗi 8 m, ống điện chạy dọc
    me_den = _mau('ct_mau_mang_den', lambda t: [K.box('m', -0.06, 0.06, -0.62, 0.62, -0.05, 0.0, nhua, t), K.box('b', -0.02, 0.02, -0.6, 0.6, -0.08, -0.05, den_tat, t)])
    me_quat = _mau('ct_mau_quat_tran', lambda t: [K.cyl('tr', 0, 0, -0.45, 0.012, 0.45, sat, t, seg=6), K.cyl('mt', 0, 0, -0.55, 0.1, 0.1, trang, t, seg=12)]
                   + [K.box(f'c{i}', 0, 0.55, -0.05, 0.05, -0.5, -0.49, trang, t, rot=(0, 0, i * 2.094)) for i in range(3)])
    for f in range(3):
        zt = (f + 1) * tang - 0.3
        K.box(f'ct_ong_dien_{f}', 0.05, 0.08, y0, y1, zt - 0.05, zt - 0.02, trang, c)
        for k in range(16):
            y = y0 + 2.0 + 4.0 * k
            K.inst(f'ct_den_hl_{f}_{k}', me_den, (1.5, y, zt), c); n += 1
            if k % 2: K.inst(f'ct_quat_hl_{f}_{k}', me_quat, (1.6, y, zt), c, rot=(0, 0, rnd.uniform(0, 2))); n += 1
    # băng rôn 20/11 căng giữa 2 cột ở tầng trệt (chữ cả hai mặt)
    vai_do = _mat('ct_vai_do', '#c8241b', 0.8); vang = _mat('ct_chu_vang', '#ffd84a', 0.6)
    yb0, yb1 = 15.0, 27.0
    K.box('ct_bang_ron', hl - 0.23, hl - 0.21, yb0, yb1, 2.6, 3.2, vai_do, c)
    for sx, rz in ((hl - 0.235, -math.pi / 2), (hl - 0.205, math.pi / 2)):
        chu(f'ct_chu_bang_ron_{rz:.1f}', 'CHÀO MỪNG NGÀY NHÀ GIÁO VIỆT NAM 20-11', sx, (yb0 + yb1) / 2, 2.9, 0.34, vang, rz)
    # chậu cây giữa các cột, ghế inox sát tường, cây nước, bồn rửa tay
    gom = _mat('ct_chau_gom', '#b4643c', 0.7); la = _mat('st_la_bang', '#4f7a35', 0.85)
    chau = _mau('ct_mau_chau_cay', lambda t: [K.cyl('ch', 0, 0, 0, 0.22, 0.42, gom, t, seg=14, r2=0.27)] + [K.sphere(f'l{i}', 0.12 * math.cos(i * 1.6), 0.12 * math.sin(i * 1.6), 0.62 + 0.12 * (i % 2), 0.2, la, t, scale=(1, 1, 1.3), seg=10) for i in range(4)])
    for k in range(16):
        if k % 2: K.inst(f'ct_chau_hl_{k}', chau, (hl - 0.25, y0 + 2.0 + 4.0 * k + 1.2, 0.08), c); n += 1
    ghe = _mau('ct_mau_ghe_inox', lambda t: [K.box('m', -0.2, 0.2, -0.9, 0.9, 0.42, 0.45, inox, t), K.box('t', -0.2, -0.17, -0.9, 0.9, 0.45, 0.85, inox, t)]
               + [K.box(f'c{i}', -0.18, 0.18, y_ - 0.02, y_ + 0.02, 0, 0.42, sat, t) for i, y_ in enumerate((-0.8, 0.8))])
    for k in range(16):
        y = y0 + 2.0 + 4.0 * k
        if k % 2 and abs(y - cua_y) > 3: K.inst(f'ct_ghe_inox_{k}', ghe, (0.22, y + (1.4 if k % 4 == 1 else -1.4), 0.08), c); n += 1
    K.box('ct_cay_nuoc', 0.05, 0.4, 21.6, 21.95, 0.08, 1.15, trang, c); K.cyl('ct_binh_nuoc', 0.22, 21.78, 1.15, 0.14, 0.4, _mat('ct_nhua_xanh', '#7fb6d6', 0.2), c, seg=14)
    K.box('ct_bon_rua', 0.05, 0.55, y1 - 2.2, y1 - 0.8, 0.85, 1.0, inox, c); K.box('ct_chan_bon', 0.1, 0.5, y1 - 2.1, y1 - 0.9, 0.08, 0.85, _mat('ct_gach_op', '#d6d0c2', 0.5), c)
    for i in range(3): K.cyl(f'ct_voi_{i}', 0.12, y1 - 1.9 + 0.5 * i, 1.0, 0.012, 0.2, inox, c, seg=6)
    # poster CLB dán tường giữa cửa sổ và cửa lớp (màu rực), biển sàn ướt, camera an ninh
    mau_poster = ['#e94f37', '#3f88c5', '#f6ae2d', '#44bba4', '#8e5572', '#f2f2ee']
    for k in range(10):
        y = y0 + 4.0 + 4.0 * k + rnd.uniform(-0.3, 0.3)
        if abs(y - cua_y) < 2.5: continue
        K.box(f'ct_poster_{k}', 0.0, 0.006, y - 0.22, y + 0.22, 1.35, 1.95, _mat(f'ct_poster_{k % 6}', mau_poster[k % 6], 0.8), c)
        K.box(f'ct_poster_le_{k}', 0.006, 0.008, y - 0.16, y + 0.16, 1.75, 1.85, trang, c); n += 1
    vang_canh_bao = _mat('ct_vang_canh_bao', '#f5c400', 0.5)
    K.box('ct_bien_san_uot_a', 1.6, 1.62, 31.75, 32.25, 0.08, 0.68, vang_canh_bao, c, rot=(0, math.radians(12), 0))
    K.box('ct_bien_san_uot_b', 1.78, 1.8, 31.75, 32.25, 0.08, 0.68, vang_canh_bao, c, rot=(0, math.radians(-12), 0))
    chu('ct_chu_san_uot', 'CẨN THẬN\nSÀN ƯỚT', 1.58, 32.0, 0.42, 0.08, _mat('ct_den', '#1d1f22', 0.4), -math.pi / 2)
    for y in (y0 + 0.3, y1 - 0.3):
        K.box(f'ct_cctv_{y}', 0.05, 0.3, y - 0.06, y + 0.06, 3.05, 3.15, trang, c); K.cyl(f'ct_cctv_kinh_{y}', 0.3, y, 3.1, 0.03, 0.02, _mat('ct_den', '#1d1f22', 0.4), c, seg=8, rot=(0, math.radians(90), 0))
    # sinh viên: nhóm đứng nói chuyện trước cửa lớp, tựa cột, ngồi ghế inox, tựa lan can tầng trên
    vai = [_mat(f'ct_cap_{i}', h, 0.85) for i, h in enumerate(('#2d3a2a', '#1f2a44', '#5a2e2e', '#3b3b3b'))]
    nguoi = [bpy.data.meshes.get(f'st_mau_nguoi_{i}') for i in range(4)]
    balo = _mau('ct_mau_balo', lambda t: [K.box('b', -0.15, 0.15, 0.13, 0.3, 0.95, 1.38, vai[1], t)])
    vi_tri = []
    for g, yc in enumerate((-1.0, 6.0, 16.0, 26.5, 34.0, 42.0, 50.5)):   # nhóm 2–3 người
        for j in range(rnd.choice((2, 3))):
            a = j * 2.2 + rnd.uniform(-0.3, 0.3); vi_tri.append((0.75 + 0.35 * math.cos(a), yc + 0.45 * math.sin(a), 0.08, a + math.pi))   # sát tường, chừa lối chạy của Nam (x ≈ 1,6)
    for k in (1, 11, 13): vi_tri.append((hl - 0.55, y0 + 4.0 * k + 0.3, 0.08, math.pi / 2))     # tựa cột nhìn ra sân
    for i, (x, y, z, rz) in enumerate(vi_tri):
        me = nguoi[i % 4]
        if me:
            K.inst(f'ct_sv_hl_{i}', me, (x, y, z), c, rot=(0, 0, rz + math.pi / 2)); n += 1
            if i % 3 == 0: K.inst(f'ct_balo_hl_{i}', balo, (x, y, z), c, rot=(0, 0, rz + math.pi / 2)); n += 1
    for f in (1, 2):
        for k in range(5):
            me = nguoi[(k + f) % 4]
            if me: K.inst(f'ct_sv_lan_can_{f}_{k}', me, (hl - 0.45, 4.0 + 11.0 * k + f * 3.0, f * tang), c, rot=(0, 0, math.radians(rnd.uniform(-20, 20)))); n += 1
    return n


# ---------------------------------------------------------------------------------------------- BỜ KÈ (bổ sung 15/11 chiều)
def bo_ke_nguoi(m, c, de_z=4.5, nuoc_z=0.2, bac_sau=0.55, so_bac=12):
    """Cho bờ kè có sự sống mà vẫn giữ Nam cô độc ở giữa khung: người xung quanh đều ở xa (≥ 12 m), mải việc riêng, không nhìn Nam.
    Ông cụ câu cá, đôi bạn ngồi xa, người chạy bộ + đi bộ trên đê, xe máy chạy hai chiều, xe đạp bán bóng bay, gánh hàng rong,
    cọc tre + lưới vó dưới sông, diều trên trời. Chuyển động bằng driver vòng lặp (không keyframe)."""
    rnd = random.Random(4242); n = 0
    def z_bac(i): return de_z - (i + 1) * (de_z - nuoc_z + 0.4) / so_bac
    def y_bac(i): return -(i + 1) * bac_sau + 0.25
    da = _mat('bk_da_nguoi', '#d6a57e', 0.6); quan = _mat('bk_quan', '#252a35', 0.8)
    ao = [_mat(f'ct_bk_ao_{i}', h, 0.85) for i, h in enumerate(('#5b6e8c', '#8a4b3a', '#d9d4c4', '#3f5e45', '#c9a23a'))]
    non = _mat('ct_non_la', '#d8c49a', 0.8)
    def nguoi_dung(i):
        return _mau(f'ct_bk_nguoi_dung_{i}', lambda t: [K.cyl('ch', 0, 0, 0, 0.13, 0.8, quan, t, seg=10), K.cyl('th', 0, 0, 0.8, 0.18, 0.62, ao[i], t, seg=10, r2=0.15), K.sphere('d', 0, 0, 1.56, 0.12, da, t, seg=12)])
    def nguoi_ngoi(i, mu=False):
        p = lambda t: ([K.box('h', -0.17, 0.17, -0.15, 0.15, 0, 0.16, quan, t), K.box('du', -0.16, 0.16, -0.5, -0.1, 0.12, 0.3, quan, t),
                        K.cyl('th', 0, 0.02, 0.14, 0.17, 0.55, ao[i], t, seg=10, r2=0.14, rot=(math.radians(12), 0, 0)), K.sphere('d', 0, -0.08, 0.8, 0.115, da, t, seg=12)]
                       + ([K.cyl('non', 0, -0.08, 0.86, 0.3, 0.14, non, t, seg=16, r2=0.01)] if mu else []))
        return _mau(f'ct_bk_nguoi_ngoi_{i}_{int(mu)}', p)
    dung = [nguoi_dung(i) for i in range(5)]
    # ông cụ câu cá (đội nón lá) ở bậc sát nước, cần câu + dây, xô nhựa
    i = 10; x = -9.0
    K.inst('ct_ong_cu', nguoi_ngoi(2, True), (x, y_bac(i), z_bac(i)), c, rot=(0, 0, math.radians(-10))); n += 1
    tre = _mat('ct_tre', '#b59a5a', 0.7)
    cu = bpy.data.curves.new('ct_can_cau', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.012
    sp = cu.splines.new('POLY'); sp.points.add(2)
    for p_, co in zip(sp.points, ((x + 0.1, y_bac(i) - 0.3, z_bac(i) + 0.45), (x + 0.6, y_bac(i) - 1.8, z_bac(i) + 1.5), (x + 1.0, y_bac(i) - 3.3, z_bac(i) + 2.2))): p_.co = (*co, 1)
    cu.materials.append(tre); ob = bpy.data.objects.new('ct_can_cau', cu); c.objects.link(ob)
    K.cyl('ct_day_cau', x + 1.0, y_bac(i) - 3.3, nuoc_z, 0.002, z_bac(i) + 2.2 - nuoc_z, _mat('ct_day', '#e0e0e0', 0.5), c, seg=4)
    K.cyl('ct_xo_ca', x + 0.6, y_bac(i) + 0.1, z_bac(i), 0.14, 0.25, _mat('ct_xo_xanh', '#2a7fb8', 0.5), c, seg=12); n += 3
    # đôi bạn ngồi xa phía bên kia, bậc 3
    for k, dx in enumerate((0.0, 0.5)): K.inst(f'ct_doi_ban_{k}', nguoi_ngoi(3 + k), (11.0 + dx, y_bac(3), z_bac(3)), c); n += 1
    # lan can inox dọc lối xuống bậc (x = −13 và +15, ngoài khung cận Nam) + đồ lặt vặt người ngồi để lại quanh Nam (cách ≥ 1,5 m)
    inox = _mat('ct_inox', '#c9ccd0', 0.25, 0.9)
    for xl in (-13.0, 15.0):
        pts = [(xl, y_bac(j) - 0.2, z_bac(j) + 0.9) for j in range(so_bac)]
        for j in range(0, so_bac, 2): K.cyl(f'ct_tru_lc_{xl}_{j}', xl, y_bac(j) - 0.2, z_bac(j), 0.025, 0.9, inox, c, seg=8)
        cu2 = bpy.data.curves.new(f'ct_tay_vin_{xl}', 'CURVE'); cu2.dimensions = '3D'; cu2.bevel_depth = 0.022
        sp2 = cu2.splines.new('POLY'); sp2.points.add(len(pts) - 1)
        for p_, co in zip(sp2.points, pts): p_.co = (*co, 1)
        cu2.materials.append(inox); ob2 = bpy.data.objects.new(f'ct_tay_vin_{xl}', cu2); c.objects.link(ob2); n += 1
    vo = _mat('ct_vo_hat', '#3a3530', 0.8); la_kho = _mat('ct_la_kho_bk', '#9a7a3a', 0.9)
    me_vo = _mau('ct_mau_vo_hat', lambda t: [K.box('v', -0.006, 0.006, -0.003, 0.003, 0, 0.003, vo, t)])
    me_la = _mau('ct_mau_la_kho', lambda t: [K.box('l', -0.06, 0.06, -0.035, 0.035, 0, 0.004, la_kho, t)])
    for k in range(70):
        j = rnd.randrange(2, 10); x_ = rnd.uniform(-7, 9)
        if abs(x_) < 1.5 and j in (4, 5, 6): continue
        K.inst(f'ct_la_kho_bk_{k}', me_la if k % 3 else me_vo, (x_, y_bac(j) + rnd.uniform(-0.15, 0.2), z_bac(j) + 0.002), c, rot=(0, 0, rnd.uniform(0, 6.3))); n += 1
    K.cyl('ct_chai_tra_da', -2.6, y_bac(5), z_bac(5), 0.04, 0.22, _mat('ct_nhua_trong', '#cfe3ea', 0.25), c, seg=10)
    K.box('ct_tui_nilon_bk', 3.0, 3.3, y_bac(4) - 0.1, y_bac(4) + 0.1, z_bac(4), z_bac(4) + 0.12, _mat('ct_nilon_do', '#c84a3a', 0.5), c)
    # trên đê: chạy bộ / đi bộ qua lại (vòng lặp x ∈ [−120, 120])
    def di_chuyen(ob, x0, v, truc_y=None):
        d = ob.driver_add('location', 0).driver; d.expression = f'(({x0:.2f} + frame * {v:.3f} + 120) % 240) - 120'
    for k, (x0, v, y) in enumerate(((-30, 0.11, 2.0), (40, -0.05, 1.4), (-70, 0.045, 2.6), (10, -0.06, 9.0))):
        ob = K.inst(f'ct_nguoi_de_{k}', dung[k % 5], (x0, y, de_z), c, rot=(0, 0, -math.pi / 2 if v > 0 else math.pi / 2)); di_chuyen(ob, x0, v); n += 1
    # xe máy có người lái chạy hai chiều trên mặt đê (làn y 4,5 và 7)
    son = [_mat(f'ct_bk_xe_{i}', h, 0.4, 0.3) for i, h in enumerate(('#b72b2b', '#1f1f22', '#e4e2dc', '#2f5c9a'))]; banh = _mat('ct_banh_xe', '#1d1f22', 0.6)
    mu_bh = _mat('ct_mu_bh', '#e8c21c', 0.4)
    def xe(i):
        return _mau(f'ct_bk_xe_may_{i}', lambda t: [K.box('t', -0.55, 0.55, -0.15, 0.15, 0.35, 0.75, son[i], t),
                                                     K.cyl('b1', -0.62, 0, 0.3, 0.3, 0.08, banh, t, seg=12, rot=(math.radians(90), 0, 0)), K.cyl('b2', 0.62, 0, 0.3, 0.3, 0.08, banh, t, seg=12, rot=(math.radians(90), 0, 0)),
                                                     K.cyl('ng', 0.05, 0, 0.75, 0.17, 0.6, ao[i], t, seg=10, r2=0.14), K.sphere('mu', 0.05, 0, 1.45, 0.14, mu_bh, t, seg=12)])
    mxe = [xe(i) for i in range(4)]
    for k in range(8):
        v = rnd.choice((0.35, 0.45, 0.55)) * (1 if k % 2 else -1); x0 = rnd.uniform(-120, 120)
        ob = K.inst(f'ct_xe_de_{k}', mxe[k % 4], (x0, 4.6 if v > 0 else 7.0, de_z), c, rot=(0, 0, 0 if v > 0 else math.pi)); di_chuyen(ob, x0, v); n += 1
    # xe đạp bán bóng bay + gánh hàng rong đứng yên trên đê
    sat = _mat('st_sat', '#3b3f44', 0.45, 0.8)
    xd = _mau('ct_bk_xe_dap', lambda t: [K.cyl('b1', 0, -0.5, 0.33, 0.33, 0.03, banh, t, seg=16, rot=(0, math.radians(90), 0)), K.cyl('b2', 0, 0.5, 0.33, 0.33, 0.03, banh, t, seg=16, rot=(0, math.radians(90), 0)),
                                         K.box('k', -0.02, 0.02, -0.5, 0.5, 0.5, 0.54, sat, t), K.box('gio', -0.2, 0.2, 0.45, 0.85, 0.6, 0.9, _mat('ct_gio_may', '#a8844f', 0.9), t)])
    xb = -9.0
    if xd: K.inst('ct_xe_dap_bong', xd, (xb, 1.5, de_z), c, rot=(0, 0, math.radians(90))); n += 1
    for k in range(9):
        h = _mat(f'ct_bong_{k % 4}', ('#e94f37', '#f6ae2d', '#3f88c5', '#e85d9a')[k % 4], 0.3)
        bx, by, bz = xb + rnd.uniform(-0.35, 0.35), 1.5 + rnd.uniform(-0.35, 0.35), de_z + 2.2 + rnd.uniform(0, 0.5)
        K.sphere(f'ct_bong_bay_{k}', bx, by, bz, 0.16, h, c, scale=(1, 1, 1.2), seg=12); K.cyl(f'ct_day_bong_{k}', bx, by, de_z + 0.9, 0.002, bz - de_z - 0.9, _mat('ct_day', '#e0e0e0', 0.5), c, seg=4); n += 1
    K.inst('ct_chu_xe_bong', dung[4], (xb + 0.6, 1.9, de_z), c, rot=(0, 0, math.radians(200))); n += 1
    quang = _mat('ct_quang_ganh', '#8a6a3a', 0.8)
    K.inst('ct_nguoi_ganh', nguoi_ngoi(1, True), (-4.5, 2.4, de_z), c, rot=(0, 0, math.radians(160)))
    for k, dx in enumerate((-0.55, 0.55)): K.cyl(f'ct_thung_ganh_{k}', -4.5 + dx, 2.0, de_z, 0.25, 0.22, quang, c, seg=14)
    # cọc tre + lưới vó dưới sông, diều trên trời
    for k in range(14):
        x = -40 + 6 * k + rnd.uniform(-1, 1); y = -16 - (k % 3) * 2.5
        K.cyl(f'ct_coc_tre_{k}', x, y, -1.0, 0.04, 2.6 + rnd.uniform(0, 0.8), tre, c, seg=6); n += 1
    luoi = _mat('ct_luoi', '#3b3a33', 0.9)
    for k, x in enumerate((-28.0, 8.0)):
        for j in range(4):
            K.cyl(f'ct_vo_{k}_{j}', x + 1.2 * math.cos(j * 1.57), -22 + 1.2 * math.sin(j * 1.57), nuoc_z, 0.015, 2.0, tre, c, seg=5, rot=(math.radians(20 * math.sin(j * 1.57)), math.radians(-20 * math.cos(j * 1.57)), 0))
        K.box(f'ct_vo_luoi_{k}', x - 1.0, x + 1.0, -23.0, -21.0, nuoc_z + 0.02, nuoc_z + 0.03, luoi, c); n += 1
    dieu_m = _mat('ct_dieu', '#d93b3b', 0.6)
    dieu = K.box('ct_dieu', -0.6, 0.6, -0.02, 0.02, -0.6, 0.6, dieu_m, c, rot=(0, math.radians(45), 0))
    dieu.location = (35.0, -60.0, 38.0); d = dieu.driver_add('location', 2).driver; d.expression = '38 + 1.5 * sin(frame * 0.05)'
    for k in range(6): K.box(f'ct_duoi_dieu_{k}', 35.0 - 0.06, 35.0 + 0.06, -60.02, -59.98, 36.5 - 0.6 * k, 36.9 - 0.6 * k, _mat('ct_duoi_dieu', '#f6ae2d', 0.6), c)
    n += 7
    return n
