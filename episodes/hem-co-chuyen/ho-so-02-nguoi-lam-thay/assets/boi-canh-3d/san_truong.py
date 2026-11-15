"""SÂN TRƯỜNG + HÀNH LANG CỘT BÊ TÔNG — chuyển cảnh 3.1 → 3.2, Shot 1 "chạy trốn" (15/11/2026).

Chạy:  /tmp/bpyenv/bin/python san_truong.py --cam ST_STEADICAM --frame 60 --muc nhap --out /tmp/st.png
Camera: ST_HANH_LANG (dọc hành lang, bóng cột vuông) · ST_TOAN (toàn cảnh sân từ tầng cao khu B) · ST_CUA (cửa giảng đường, Nam lao ra)
        · ST_STEADICAM (khung 1–144 = 6 s: máy chạy giật lùi trước mặt Nam, từ cửa giảng đường dọc hành lang rồi ra giữa sân nắng).
Mode: trua (12h30 nắng gắt gần đỉnh đầu, hơi xiên để cột đổ bóng vuông lên sàn hành lang) · chieu (14h, bóng dài hơn).

Toạ độ: khối giảng đường x −12…0, dọc y −5…60, 3 tầng × 3,6 m; hành lang tầng trệt x 0…3,2, cột 0,4 × 0,4 m mỗi 4 m ở x 2,8–3,2;
cửa giảng đường (cửa đôi) trên mặt tiền x = 0 tại y 9,4…10,6. Sân gạch x 3,2…45. Khu nhà B (5 tầng) x 50…62 làm nền xa.
Đối tượng `st_`. Cây, xe máy, người là instance. Đồ xa (nhà B, phố) tự giảm chi tiết qua toi_uu theo vị trí máy.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from mathutils import Vector
import vat_lieu as M, hinh_khoi as K, toi_uu

TANG = 3.6; Y0, Y1 = -5.0, 60.0; HL = 3.2; CUA_Y = 10.0
# đường chạy của Nam (khung, x, y) và máy đi trước 2,6 m nhìn lại
DUONG = [(1, 0.6, CUA_Y), (20, 1.6, 13.0), (60, 1.6, 22.0), (96, 6.0, 29.0), (144, 16.0, 34.0)]
CAMS = {
    'ST_HANH_LANG': ((1.3, 32.0, 1.55), (1.7, 8.0, 1.3), 35),
    'ST_TOAN':      ((48.0, 58.0, 13.0), (8.0, 18.0, 1.0), 28),
    'ST_CUA':       ((3.0, CUA_Y + 0.3, 1.5), (0.0, CUA_Y, 1.35), 24),
}


def vat_lieu():
    m = {}
    m['tuong'] = M.mottled('st_tuong_vang', '#e9c46a', rough=0.85, vary=0.1)
    m['chi'] = M.mottled('st_chi_trang', '#efe9dc', rough=0.85)
    m['be_tong'] = M.mottled('st_be_tong', '#a9a69e', rough=0.9, vary=0.14, bump=0.25)
    m['san_hl'] = M.tiles('st_san_hl', '#c9a27a', '#a8845e', 0.4)
    m['san'] = M.tiles('st_san', '#b8a48a', '#8f7e68', 0.6)
    m['co'] = M.mottled('st_co', '#7c9a4e', rough=0.95, vary=0.2)
    m['mai'] = M.mottled('st_mai_ngoi', '#a4553a', rough=0.8)
    m['kinh'] = M.glass('st_kinh')
    m['khung'] = M.solid('st_khung', '#5b6b5f', 0.5, 0.3)
    m['cua'] = M.wood('st_cua', '#7c5532', scale=6)
    m['sat'] = M.solid('st_sat', '#3b3f44', 0.45, 0.8)
    m['ton'] = M.solid('st_ton', '#8c9aa3', 0.35, 0.7)
    m['than_cay'] = M.mottled('st_than_cay', '#5a4635', rough=0.95)
    m['la'] = [M.mottled('st_la_bang', '#4f7a35', rough=0.85, vary=0.2), M.mottled('st_la_phuong', '#5e8c3a', rough=0.85, vary=0.2), M.mottled('st_hoa_phuong', '#c9452e', rough=0.85, vary=0.15)]
    m['bon'] = M.mottled('st_bon_cay', '#c9c3b6', rough=0.85)
    m['dat'] = M.solid('st_dat', '#5b4a3a', 0.95)
    m['co_do'] = M.solid('st_co_do', '#d8271c', 0.7)
    m['sao'] = M.solid('st_sao', '#ffd400', 0.6)
    m['xe'] = [M.solid(f'st_xe_{i}', c, 0.4, 0.3) for i, c in enumerate(('#b72b2b', '#1f1f22', '#e4e2dc', '#2f5c9a', '#8a8f94'))]
    m['banh'] = M.solid('st_banh', '#151515', 0.8)
    m['ao'] = [M.solid(f'st_ao_{i}', c, 0.85) for i, c in enumerate(('#f2f2ee', '#3b5b8a', '#2e2e33', '#d7c9a0'))]
    m['da'] = M.solid('st_da', '#d6a57e', 0.6)
    m['nha_xa'] = M.mottled('st_nha_xa', '#cfc6b6', rough=0.9)
    m['cua_so_xa'] = M.solid('st_cua_so_xa', '#5d7380', 0.3)
    m['kinh_toi'] = M.solid('st_kinh_toi', '#2f3c44', 0.15)
    m['khung_go'] = M.wood('st_khung_go', '#6b4426', scale=8)
    return m


ME = {}


def chu_phong(ten, y, z, c):
    """Biển tên phòng (chữ thật) trên cửa lớp."""
    import noi_dung_bang as ND
    tay = ND._font('DejaVuSansMono.ttf')
    K.box(f'st_bien_{ten}', 0.0, 0.025, y - 0.32, y + 0.32, z - 0.03, z + 0.17, _BIEN[0], c)
    cu = bpy.data.curves.new(f'st_chu_{ten}', 'FONT'); cu.body = ten; cu.font = tay; cu.size = 0.12; cu.align_x = 'CENTER'
    ob = bpy.data.objects.new(f'st_chu_{ten}', cu); ob.location = (0.027, y, z + 0.02); ob.rotation_euler = (math.radians(90), 0, math.radians(90))
    cu.materials.append(_BIEN[1]); c.objects.link(ob)


_BIEN = []


def mau_mat_tien(m):
    """Lưới mẫu (instance) cho cửa lớp và cửa sổ: có khung bao nổi, bậu, song sắt → liền khối với mặt tường thay vì tấm phẳng dán lên."""
    _BIEN[:] = [M.solid('st_bien_phong', '#1d3f74', 0.5), M.solid('st_chu_bien', '#f2f2ee', 0.6)]
    def cua_so(t):
        p = [K.box('lo', 0.0, 0.012, -0.9, 0.9, 1.0, 2.4, m['kinh_toi'], t)]                         # ô kính tối sát mặt tường
        p += [K.box('kt', 0.0, 0.06, -0.98, 0.98, 2.4, 2.48, m['chi'], t), K.box('kd', 0.0, 0.11, -1.02, 1.02, 0.92, 1.0, m['chi'], t),  # khung trên, bậu dưới nhô ra
              K.box('kl', 0.0, 0.06, -0.98, -0.9, 1.0, 2.4, m['chi'], t), K.box('kr', 0.0, 0.06, 0.9, 0.98, 1.0, 2.4, m['chi'], t)]
        p += [K.box('dg', 0.0, 0.04, -0.025, 0.025, 1.0, 2.4, m['khung'], t), K.box('ng', 0.0, 0.04, -0.9, 0.9, 1.68, 1.72, m['khung'], t)]   # đố cửa
        p += [K.box(f's{i}', 0.04, 0.055, -0.85 + 0.17 * i, -0.84 + 0.17 * i, 1.0, 2.4, m['sat'], t) for i in range(11)]          # song sắt
        return p
    def cua_lop(t):
        p = [K.box('canh', 0.0, 0.03, -0.55, 0.55, 0.0, 2.25, m['cua'], t), K.box('o_kinh', 0.03, 0.035, -0.3, 0.3, 1.4, 1.95, m['kinh_toi'], t)]
        p += [K.box('kl', 0.0, 0.07, -0.68, -0.55, 0.0, 2.38, m['khung_go'], t), K.box('kr', 0.0, 0.07, 0.55, 0.68, 0.0, 2.38, m['khung_go'], t),
              K.box('kt', 0.0, 0.07, -0.68, 0.68, 2.25, 2.38, m['khung_go'], t), K.cyl('tn', 0.06, 0.42, 1.0, 0.02, 0.1, m['sat'], t, seg=8),
              K.box('o_thoang', 0.0, 0.012, -0.55, 0.55, 2.42, 2.62, m['kinh_toi'], t)]
        return p
    import chi_tiet_hoi3 as CT
    ME['cua_so'] = CT._mau('st_mau_cua_so', cua_so); ME['cua_lop'] = CT._mau('st_mau_cua_lop', cua_lop)


def khoi_giang_duong(m, c):
    B = K.box
    mau_mat_tien(m)
    for f in range(3):
        z0 = f * TANG
        B(f'st_tuong_tang_{f}', -12, 0, Y0, Y1, z0, z0 + TANG, m['tuong'], c)
        B(f'st_san_hl_{f}', 0, HL, Y0, Y1, z0 - 0.15 if f else -0.05, z0 + 0.0 if f else 0.08, m['san_hl'] if f == 0 else m['be_tong'], c)
        B(f'st_chi_tang_{f}', -0.02, HL, Y0, Y1, z0 + TANG - 0.3, z0 + TANG, m['chi'], c)
        # mặt tiền x = 0: xen kẽ cửa lớp (k chẵn) và cửa sổ (k lẻ), mỗi ô 4 m; trừ cửa giảng đường tầng trệt
        for k in range(16):
            y = Y0 + 2.0 + 4.0 * k
            if f == 0 and abs(y - CUA_Y) < 2.1: continue
            if k % 2 == 0:
                K.inst(f'st_cua_lop_{f}_{k}', ME['cua_lop'], (0, y, z0 + (0.08 if f == 0 else 0.0)), c)
                chu_phong(f'P.{f + 1}{k // 2 + 1:02d}', y, z0 + 2.55, c)
            else:
                K.inst(f'st_cua_so_{f}_{k}', ME['cua_so'], (0, y, z0), c)
        if f > 0:  # lan can tầng trên
            B(f'st_lan_can_{f}', HL - 0.12, HL, Y0, Y1, z0, z0 + 1.0, m['chi'], c)
    B('st_mai', -12.6, HL + 0.6, Y0 - 0.6, Y1 + 0.6, 3 * TANG, 3 * TANG + 0.25, m['mai'], c)
    # cửa giảng đường: ô cửa + 2 cánh mở toang (Nam vừa lao ra)
    for ten, yh, huong in (('trai', CUA_Y - 1.19, 1), ('phai', CUA_Y + 1.19, -1)):   # cánh cửa xoay quanh BẢN LỀ ở mép khung, mở ra hành lang
        me = K.luoi_hop(f'st_canh_{ten}', 0.0, 0.05, 0.0, 1.17 * huong, 0.0, 2.3) if huong > 0 else K.luoi_hop(f'st_canh_{ten}', 0.0, 0.05, -1.17, 0.0, 0.0, 2.3)
        me.materials.append(m['cua']); ob = K.inst(f'st_cua_{ten}', me, (0.06, yh, 0.09), c, rot=(0, 0, math.radians(-75 * huong)))
        K.cyl(f'st_tay_nam_{ten}', 0.06 + 1.0 * math.sin(math.radians(75)), yh + huong * 1.0 * math.cos(math.radians(75)), 1.0, 0.018, 0.14, m['sat'], c, seg=8)
    for ten, a_, b_ in (('trai', CUA_Y - 1.32, CUA_Y - 1.2), ('phai', CUA_Y + 1.2, CUA_Y + 1.32)): B(f'st_khung_gd_{ten}', -0.02, 0.07, a_, b_, 0.08, 2.52, m['khung_go'], c)
    B('st_khung_gd_tren', -0.02, 0.07, CUA_Y - 1.32, CUA_Y + 1.32, 2.4, 2.52, m['khung_go'], c)
    B('st_o_cua_toi', 0.0, 0.006, CUA_Y - 1.2, CUA_Y + 1.2, 0.08, 2.4, M.solid('st_trong_toi', '#3a3c3a', 0.9), c)
    chu_phong('GD-A2', CUA_Y, 2.62, c)
    # cột bê tông (mẫu instance) — đổ bóng vuông lên sàn hành lang dưới nắng trưa
    me_cot = K.luoi_hop('st_mau_cot', -0.2, 0.2, -0.2, 0.2, 0.0, 3 * TANG); me_cot.materials.append(m['be_tong'])
    for k in range(17):
        K.inst(f'st_cot_{k}', me_cot, (HL - 0.2, Y0 + 4.0 * k, 0.08), c)
    for yy in (Y0 - 0.2, Y1):  # đầu hồi hành lang (có ô thoáng) để cuối hành lang không trống
        B(f'st_dau_hoi_{yy}', 0, HL, yy, yy + 0.2, 0, 3 * TANG, m['tuong'], c)
        B(f'st_o_thoang_{yy}', 0.8, 2.4, yy - 0.01, yy + 0.21, 1.0, 2.6, m['cua_so_xa'], c)
    B('st_bac_hl', HL, HL + 0.3, Y0, Y1, -0.05, 0.08, m['be_tong'], c)


def mau_cay(m, la, cao, tan, ten):
    tmp = K.coll('_mau_cay')
    p = [K.cyl('t', 0, 0, 0, 0.18, cao, m['than_cay'], tmp, seg=10, r2=0.12)]
    rnd = random.Random(len(ten))
    for i in range(7):
        a = i * 0.9; r = tan * (0.45 if i else 0.0)
        p.append(K.sphere(f'l{i}', r * math.cos(a), r * math.sin(a), cao + rnd.uniform(-0.4, 0.6), tan * rnd.uniform(0.55, 0.75), la, tmp, scale=(1, 1, 0.6), seg=14))
    me = K.gop(ten, p); bpy.data.collections.remove(tmp); return me


def mau_xe(m, i):
    tmp = K.coll('_mau_xe')
    p = [K.box('than', -0.15, 0.15, -0.55, 0.55, 0.35, 0.75, m['xe'][i], tmp), K.box('yen', -0.14, 0.14, -0.1, 0.55, 0.75, 0.82, m['banh'], tmp),
         K.cyl('b1', 0, -0.62, 0.3, 0.3, 0.08, m['banh'], tmp, seg=14, rot=(0, math.radians(90), 0)),
         K.cyl('b2', 0, 0.62, 0.3, 0.3, 0.08, m['banh'], tmp, seg=14, rot=(0, math.radians(90), 0)),
         K.cyl('ghi', 0, -0.6, 0.75, 0.02, 0.35, m['sat'], tmp, seg=6), K.box('tay', -0.35, 0.35, -0.62, -0.58, 1.08, 1.11, m['sat'], tmp)]
    me = K.gop(f'st_mau_xe_{i}', p); bpy.data.collections.remove(tmp); return me


def mau_nguoi(m, i):
    tmp = K.coll('_mau_ng')
    p = [K.cyl('chan', 0, 0, 0, 0.13, 0.8, M.solid('st_quan', '#2b3140', 0.8), tmp, seg=10), K.cyl('than', 0, 0, 0.8, 0.18, 0.62, m['ao'][i], tmp, seg=10, r2=0.15),
         K.sphere('dau', 0, 0, 1.56, 0.12, m['da'], tmp, seg=12)]
    me = K.gop(f'st_mau_nguoi_{i}', p); bpy.data.collections.remove(tmp); return me


def san(m, c):
    B = K.box; rnd = random.Random(7)
    B('st_san_gach', HL + 0.3, 46, Y0 - 20, Y1 + 20, -0.06, 0.0, m['san'], c)
    B('st_bai_co_xa', 46, 300, -200, 300, -0.08, -0.02, m['co'], c)
    B('st_bai_co_truoc', -300, HL + 0.3, Y1 + 0.5, 300, -0.08, -0.02, m['co'], c)
    # bồn cây + cây bàng / phượng (instance)
    me_bang = mau_cay(m, m['la'][0], 4.2, 3.0, 'st_mau_bang'); me_phuong = mau_cay(m, m['la'][1], 5.0, 3.6, 'st_mau_phuong'); me_hoa = mau_cay(m, m['la'][2], 5.0, 3.4, 'st_mau_phuong_hoa')
    for k, (x, y) in enumerate([(9, 2), (9, 16), (9, 40), (9, 52), (24, 6), (24, 26), (24, 46), (38, 14), (38, 36)]):
        K.cyl(f'st_bon_{k}', x, y, 0, 1.3, 0.45, m['bon'], c, seg=20); K.cyl(f'st_dat_bon_{k}', x, y, 0.3, 1.18, 0.16, m['dat'], c, seg=20)
        K.inst(f'st_cay_{k}', (me_bang, me_phuong, me_hoa)[k % 3], (x, y, 0.4), c, rot=(0, 0, rnd.uniform(0, 6.28)))
    # cột cờ
    K.cyl('st_cot_co', 30, 36, 0, 0.06, 11, m['sat'], c, seg=10)
    K.cyl('st_be_co', 30, 36, 0, 1.0, 0.4, m['bon'], c, seg=16)
    co = K.box('st_la_co', 30.05, 30.07, 36.05, 37.85, 9.6, 10.8, m['co_do'], c)
    K.box('st_sao_co', 30.08, 30.09, 36.75, 37.15, 10.0, 10.4, m['sao'], c)
    # nhà xe mái tôn + xe máy (instance)
    for k in range(6): K.cyl(f'st_cot_nha_xe_{k}', 40.5 + (k % 2) * 4.5, 42 + 6 * (k // 2), 0, 0.06, 3.0, m['sat'], c, seg=8)
    B('st_mai_nha_xe', 40.0, 45.5, 41.5, 54.5, 3.0, 3.08, m['ton'], c, rot=(0, math.radians(4), 0))
    mxe = [mau_xe(m, i) for i in range(5)]
    for k in range(18):
        K.inst(f'st_xe_{k}', mxe[rnd.randrange(5)], (41.2 + (k % 2) * 3.0 + rnd.uniform(-0.1, 0.1), 42.3 + 0.7 * (k // 2), 0), c, rot=(0, 0, math.radians(90 + rnd.uniform(-10, 10))))
    # sinh viên lác đác dưới bóng cây (nắng gắt nên sân vắng)
    mng = [mau_nguoi(m, i) for i in range(4)]
    for k, (x, y) in enumerate([(10.5, 3.0), (11, 4.2), (25.5, 27.5), (26, 26.5), (39, 15), (36, 50), (20, 55)]):
        K.inst(f'st_sv_{k}', mng[k % 4], (x, y, 0), c, rot=(0, 0, rnd.uniform(0, 6.28)))
    # khu nhà B 5 tầng + phố xa (vòng xa / chân trời: toi_uu tự giảm chi tiết, tắt bóng)
    for f in range(5):
        B(f'st_nha_b_{f}', 50, 62, -10, 70, f * 3.5, f * 3.5 + 3.5, m['tuong'], c)
        for k in range(20): B(f'st_nha_b_cs_{f}_{k}', 49.95, 50.0, -8 + 4 * k, -6.5 + 4 * k, f * 3.5 + 1.0, f * 3.5 + 2.4, m['cua_so_xa'], c)
    for k in range(26):
        a = -0.9 + k * 0.11; d = rnd.uniform(160, 380)
        B(f'st_pho_{k}', 20 + d * math.cos(a) - 8, 20 + d * math.cos(a) + 8, 25 + d * math.sin(a) - 8, 25 + d * math.sin(a) + 8, 0, rnd.uniform(12, 55), m['nha_xa'], c)


def nam_proxy(m, c):
    """Hình nhân Nam chạy (chỉ để canh khung Steadicam), keyframe theo DUONG."""
    tmp = K.coll('_nam')
    me = K.gop('st_nam_proxy', [K.cyl('ch', 0, 0, 0, 0.13, 0.82, M.solid('st_quan_nam', '#252a35', 0.8), tmp, seg=10),
                               K.cyl('th', 0, 0, 0.82, 0.19, 0.62, M.solid('st_ao_nam', '#e9e6dc', 0.8), tmp, seg=10, r2=0.16),
                               K.sphere('d', 0, 0, 1.58, 0.12, m['da'], tmp, seg=12),
                               K.box('balo', -0.17, 0.17, 0.12, 0.34, 0.95, 1.4, M.solid('st_balo', '#2d3a2a', 0.8), tmp)])
    bpy.data.collections.remove(tmp)
    ob = K.inst('st_nam', me, (0, 0, 0), c); ob['giu_chi_tiet'] = True
    for i, (f, x, y) in enumerate(DUONG):
        nx, ny = (DUONG[min(i + 1, len(DUONG) - 1)][1:] if i < len(DUONG) - 1 else (x + (x - DUONG[i - 1][1]), y + (y - DUONG[i - 1][2])))
        ob.location = (x, y, 0.08 if x < HL else 0.0); ob.rotation_euler = (0, 0, math.atan2(ny - y, nx - x) + math.pi / 2)
        ob.keyframe_insert('location', frame=f); ob.keyframe_insert('rotation_euler', frame=f)
    return ob


def steadicam(nam):
    """Máy đi trước Nam 2,6 m, cao 1,5 m, nhìn lại mặt Nam; rung tay nhẹ bằng nhiễu F-curve."""
    cam = bpy.data.cameras.new('ST_STEADICAM'); cam.lens = 32; cam.sensor_width = 36.0; cam.clip_end = 3000
    ob = bpy.data.objects.new('ST_STEADICAM', cam); bpy.context.scene.collection.objects.link(ob)
    for i, (f, x, y) in enumerate(DUONG):
        if i < len(DUONG) - 1: dx, dy = DUONG[i + 1][1] - x, DUONG[i + 1][2] - y
        else: dx, dy = x - DUONG[i - 1][1], y - DUONG[i - 1][2]
        L = math.hypot(dx, dy) or 1.0; ux, uy = dx / L, dy / L
        p = Vector((x + 2.6 * ux, y + 2.6 * uy, 1.5)); t = Vector((x, y, 1.35))
        ob.location = p; ob.rotation_euler = (t - p).to_track_quat('-Z', 'Y').to_euler()
        ob.keyframe_insert('location', frame=f); ob.keyframe_insert('rotation_euler', frame=f)
    try:
        for fc in ob.animation_data.action.fcurves:
            md = fc.modifiers.new('NOISE'); md.scale = 14; md.strength = 0.03 if fc.data_path == 'location' else 0.012
    except AttributeError:
        pass  # Blender 5: action layered — bỏ rung tay nếu API khác
    bpy.context.scene.frame_start, bpy.context.scene.frame_end = 1, 144
    return ob


def build(mode='trua', cam='ST_STEADICAM', muc='duyet', nguoi=True):
    bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
    c = K.coll('San_truong'); m = vat_lieu()
    khoi_giang_duong(m, c); san(m, c); nam = nam_proxy(m, c) if nguoi else None
    import chi_tiet_hoi3; print('[chi_tiet]', chi_tiet_hoi3.san_truong(m, c) + chi_tiet_hoi3.hanh_lang(m, c, hl=HL, y0=Y0, y1=Y1, tang=TANG, cua_y=CUA_Y), 'vật')
    K.troi('#e4eef4', '#7fb0dc', 1.0)
    if mode == 'trua': K.sun('st_nang', (-0.42, 0.22, -0.88), 7.0, '#fff6e2', 0.6, c)   # gần đỉnh đầu, hơi xiên ra sân → bóng cột vuông trên sàn hành lang
    else: K.sun('st_nang', (-0.7, 0.3, -0.62), 6.0, '#ffe9c4', 0.8, c)
    for k, (p, t, f) in CAMS.items(): K.camera(k, p, t, f)
    sd = steadicam(nam or bpy.data.objects.new('_tam', None))
    sc.camera = bpy.data.objects[cam]
    # điểm tính LOD: máy tĩnh dùng vị trí máy; Steadicam dùng 5 điểm dọc đường đi để vật gần bất kỳ đoạn nào cũng giữ chi tiết
    if cam == 'ST_STEADICAM':
        pts = []
        for f in (1, 30, 60, 100, 144): sc.frame_set(f); pts.append(sd.matrix_world.translation.copy())
    else: pts = [Vector(CAMS[cam][0])]
    toi_uu.apply(sc, pts, muc)
    sc.view_settings.exposure = -0.3 if mode == 'trua' else 0.0
    return sc


if __name__ == '__main__':
    a = K.tham_so('ST_STEADICAM', ['trua', 'chieu'])
    sc = build(a.mode, a.cam, a.muc, not a.khong_nguoi)
    K.ket_thuc(sc, a, f'/tmp/st_{a.cam}.png')
