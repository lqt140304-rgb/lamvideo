"""GIẢNG ĐƯỜNG BẬC THANG — Cảnh 3.1 Hồ sơ 02 (15/11/2026).

Chạy:  /tmp/bpyenv/bin/python giang_duong.py --cam GD_TOAN --muc nhap --out /tmp/gd.png
Camera: GD_TOAN (cuối phòng nhìn xuống bục) · GD_BUC (tĩnh 6 s lên bục) · GD_CRANE (từ trần) · GD_SV (qua vai sinh viên hàng đầu)
        · GD_PHAN (cận tay cầm phấn trước bảng) · GD_CUA (cửa ra, Nam bỏ chạy) · GD_NAM (từ bục nhìn lên cả hội trường)
Mode: sang (8h sáng, nắng xiên qua cửa sổ trái + đèn tuýp 6500K bật) · u_am (chỉ đèn tuýp, lạnh hơn).
--khong-nguoi: bỏ hình nhân sinh viên.

Toạ độ (1 BU = 1 m): X ngang (−8,5 tường cửa sổ … +8,5 tường cửa ra), Y sâu (bục ở y 0…3, hàng ghế y 4,2 → 17,5), Z lên.
14 hàng × 6 cụm bàn liền ghế 4 chỗ = 336 chỗ; mỗi bậc cao 0,32 m. Cụm bàn ghế và hình nhân là instance (một lưới dùng chung).
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from mathutils import Vector
import vat_lieu as M, hinh_khoi as K, toi_uu

XW = 8.5; Y_BUC = 3.0; Y_HANG0 = 4.2; SAU_HANG = 0.95; CAO_BAC = 0.32; SO_HANG = 14; Y_SAU = Y_HANG0 + SO_HANG * SAU_HANG + 0.6; TRAN = 7.4
CUM_X = (-6.6, -4.25, -1.9, 1.9, 4.25, 6.6)   # tâm 6 cụm bàn (rộng 2,2 m), lối đi giữa 1,6 m và hai bên
CAMS = {
    'GD_TOAN':  ((0.0, Y_SAU - 0.6, 6.4), (0.0, 0.8, 1.7), 22),
    'GD_BUC':   ((0.0, 9.0, 2.9), (0.0, 1.0, 1.55), 35),
    'GD_CRANE': ((0.4, 4.6, 7.0), (0.0, 1.4, 0.4), 20),
    'GD_SV':    ((-1.25, Y_HANG0 + 0.45, 1.25), (0.2, 1.4, 1.55), 50),
    'GD_PHAN':  ((-1.4, 2.4, 1.75), (-3.2, -0.9, 1.25), 45),
    'GD_CUA':   ((2.0, 2.0, 1.6), (XW, 2.2, 1.3), 28),
    'GD_BANG':  ((-0.05, 9.0, 2.9), (-0.05, -0.9, 2.75), 22),   # góc duyệt chính diện bảng + màn chiếu
    'GD_NAM':   ((-0.6, 1.3, 1.6), (0.0, 14.0, 3.6), 24),
}


def vat_lieu(mode):
    m = {}
    m['tuong'] = M.wall_plaster('gd_tuong', '#efe6c8')
    m['chan_tuong'] = M.mottled('gd_chan_tuong', '#5f8f86', rough=0.6)
    m['tran'] = M.mottled('gd_tran', '#f2efe6', rough=0.95)
    m['san'] = M.tiles('gd_san', '#c8bfae', '#a69d8b', 0.5)
    m['bac'] = M.mottled('gd_bac', '#b9ad97', rough=0.8)
    m['go'] = M.wood('gd_go', '#9a6a3c', '#6e4524', scale=10)
    m['go_toi'] = M.wood('gd_go_toi', '#6b4426', '#432812', scale=10)
    m['sat'] = M.solid('gd_sat', '#3b3f44', 0.45, 0.8)
    m['bang'] = M.mottled('gd_bang', '#2f4a3c', rough=0.9, vary=0.15)
    m['phan'] = M.solid('gd_phan', '#f4f2ea', 0.95)
    m['vien'] = M.wood('gd_vien_bang', '#8a5a30', scale=8)
    m['kinh'] = M.glass('gd_kinh')
    m['khung'] = M.solid('gd_khung_cua_so', '#e8e4d8', 0.5)
    m['den'] = M.emission('gd_den_tuyp', '#eef4ff', 18.0)
    for k in ('den',): m[k].cycles.emission_sampling = 'NONE'   # vật phát sáng trang trí không bị lấy mẫu như đèn (đèn area thật lo chiếu sáng)
    m['nhua'] = M.solid('gd_nhua', '#d9d9d6', 0.45)
    m['den_may'] = M.solid('gd_den_may', '#26292c', 0.4)
    m['rem'] = M.mottled('gd_rem', '#c9b27c', rough=0.95)
    m['cua'] = M.wood('gd_cua', '#7c5532', scale=6)
    m['man'] = M.emission('gd_man_nen', '#1e1e1e', 2.2); m['man'].cycles.emission_sampling = 'NONE'   # nền IDE tối; chữ code ở noi_dung_bang.man_chieu
    m['ao'] = [M.solid(f'gd_ao_{i}', c, 0.85) for i, c in enumerate(('#f2f2ee', '#3b5b8a', '#2e2e33', '#8a3b3b', '#d7c9a0', '#5f7f5a'))]
    m['da'] = M.solid('gd_da', '#d6a57e', 0.6, sss=0.1)
    m['toc'] = M.solid('gd_toc', '#1b1712', 0.7)
    return m


def vo_phong(m, c):
    B = K.box
    B('gd_san', -XW, XW, -1.0, Y_SAU, -0.1, 0.0, m['san'], c)
    B('gd_tran', -XW, XW, -1.0, Y_SAU, TRAN, TRAN + 0.1, m['tran'], c)
    B('gd_tuong_truoc', -XW, XW, -1.1, -1.0, 0, TRAN, m['tuong'], c)
    B('gd_chan_tuong_truoc', -XW, XW, -1.0, -0.98, 0, 0.9, m['chan_tuong'], c)
    B('gd_tuong_sau', -XW, XW, Y_SAU, Y_SAU + 0.12, 0, TRAN, m['tuong'], c)
    # tường cửa sổ (x = −XW): 5 cửa sổ cao, chừa ô kính
    ys = [(4.6 + 2.8 * i, 5.0 + 2.8 * i + 1.0) for i in range(5)]
    z0, z1 = 2.2, 5.6; prev = -1.0
    for i, (a, b) in enumerate(ys):
        B(f'gd_tuong_trai_{i}', -XW - 0.25, -XW, prev, a, 0, TRAN, m['tuong'], c)
        B(f'gd_tuong_trai_duoi_{i}', -XW - 0.25, -XW, a, b, 0, z0, m['tuong'], c)
        B(f'gd_tuong_trai_tren_{i}', -XW - 0.25, -XW, a, b, z1, TRAN, m['tuong'], c)
        B(f'gd_kinh_{i}', -XW - 0.14, -XW - 0.12, a, b, z0, z1, m['kinh'], c)
        for k in range(4):  # khung chia ô
            yy = a + (b - a) * k / 3
            B(f'gd_khung_d_{i}_{k}', -XW - 0.16, -XW - 0.1, yy - 0.03, yy + 0.03, z0, z1, m['khung'], c)
        for zz in (z0, (z0 + z1) / 2, z1):
            B(f'gd_khung_n_{i}_{zz:.1f}', -XW - 0.16, -XW - 0.1, a, b, zz - 0.03, zz + 0.03, m['khung'], c)
        B(f'gd_rem_{i}', -XW + 0.02, -XW + 0.08, b - 0.35, b + 0.1, z0 - 0.2, z1 + 0.4, m['rem'], c)   # rèm vén một bên
        prev = b
    B('gd_tuong_trai_cuoi', -XW - 0.25, -XW, prev, Y_SAU, 0, TRAN, m['tuong'], c)
    # tường cửa ra (x = +XW): cửa đôi gần bục (y 1,6 … 3,0) — Nam bỏ chạy qua đây; cửa sau ở cuối phòng
    B('gd_tuong_phai_a', XW, XW + 0.25, -1.0, 1.6, 0, TRAN, m['tuong'], c)
    B('gd_tuong_phai_tren', XW, XW + 0.25, 1.6, 3.0, 2.4, TRAN, m['tuong'], c)
    B('gd_tuong_phai_b', XW, XW + 0.25, 3.0, Y_SAU - 2.0, 0, TRAN, m['tuong'], c)
    B('gd_tuong_phai_c', XW, XW + 0.25, Y_SAU - 0.6, Y_SAU, 0, TRAN, m['tuong'], c)
    z_sau = SO_HANG * CAO_BAC
    B('gd_tuong_phai_tren2', XW, XW + 0.25, Y_SAU - 2.0, Y_SAU - 0.6, z_sau + 2.2, TRAN, m['tuong'], c)
    B('gd_cua_canh_1', XW - 0.02, XW + 0.03, 1.62, 2.28, 0, 2.38, m['cua'], c, rot=(0, 0, math.radians(-70)))
    B('gd_cua_canh_2', XW + 0.0, XW + 0.05, 2.32, 2.98, 0, 2.38, m['cua'], c)
    B('gd_ngoai_cua', XW + 0.25, XW + 3.0, 0.5, 4.0, -0.1, 0.0, m['san'], c)   # sàn hành lang ngoài cửa (thấy qua khe)
    B('gd_ngoai_tuong', XW + 2.6, XW + 2.8, 0.5, 4.0, 0, 3.0, m['tuong'], c)   # tường hành lang đối diện cửa
    B('gd_ngoai_chan', XW + 2.58, XW + 2.6, 0.5, 4.0, 0, 0.9, m['chan_tuong'], c)
    B('gd_ngoai_tran', XW + 0.25, XW + 2.8, 0.5, 4.0, 3.0, 3.1, m['tran'], c)
    B('gd_chan_tuong_phai', XW - 0.02, XW, 3.0, Y_SAU - 2.0, 0, 0.9, m['chan_tuong'], c)
    B('gd_chan_tuong_trai', -XW, -XW + 0.02, -1.0, Y_SAU, 0, 0.9, m['chan_tuong'], c)


def bac_va_ghe(m, c, nguoi=True):
    B = K.box
    for r in range(SO_HANG):
        y0 = Y_HANG0 + r * SAU_HANG; z = (r + 1) * CAO_BAC
        B(f'gd_bac_{r}', -XW, XW, y0, Y_SAU if r == SO_HANG - 1 else y0 + SAU_HANG, 0, z, m['bac'], c)
        B(f'gd_mep_bac_{r}', -0.8, 0.8, y0 - 0.02, y0 + 0.02, z - 0.02, z + 0.005, m['sat'], c)   # nẹp mép bậc lối giữa
    # mẫu cụm "bàn liền ghế" 4 chỗ (2,2 m), gốc toạ độ: giữa mép trước bàn, mặt bậc
    tmp = K.coll('_mau')
    p = [B('m_mat_ban', -1.1, 1.1, 0.0, 0.42, 0.72, 0.75, m['go'], tmp),
         B('m_yem', -1.1, 1.1, 0.0, 0.03, 0.30, 0.72, m['go_toi'], tmp),
         B('m_ngan', -1.08, 1.08, 0.05, 0.40, 0.58, 0.60, m['go_toi'], tmp),
         B('m_mat_ghe', -1.1, 1.1, 0.52, 0.86, 0.44, 0.47, m['go'], tmp),
         B('m_tua', -1.1, 1.1, 0.86, 0.89, 0.55, 0.88, m['go'], tmp)]
    for sx in (-1.05, 1.05):
        p += [B(f'm_chan_{sx}', sx - 0.025, sx + 0.025, 0.0, 0.9, 0.0, 0.05, m['sat'], tmp),
              B(f'm_tru_ban_{sx}', sx - 0.02, sx + 0.02, 0.18, 0.22, 0.0, 0.72, m['sat'], tmp),
              B(f'm_tru_ghe_{sx}', sx - 0.02, sx + 0.02, 0.68, 0.72, 0.0, 0.88, m['sat'], tmp)]
    me_ban = K.gop('gd_mau_ban_ghe', p)
    bpy.data.collections.remove(tmp)
    # hình nhân sinh viên ngồi (proxy, cao ngồi ~1,25 m): 3 lưới khác màu áo, dùng chung theo màu
    me_nguoi = []
    for i, ao in enumerate(m['ao']):
        tmp = K.coll('_mau_n')
        q = [K.cyl('n_than', 0, 0, 0.47, 0.17, 0.52, ao, tmp, seg=12, r2=0.13), K.sphere('n_dau', 0, -0.02, 1.13, 0.11, m['da'], tmp, seg=12),
             K.sphere('n_toc', 0, 0.015, 1.17, 0.115, m['toc'], tmp, scale=(1, 1, 0.8), seg=12),
             K.box('n_dui', -0.15, 0.15, -0.38, 0.05, 0.42, 0.56, M.solid('gd_quan', '#2b3140', 0.8), tmp),
             K.box('n_tay', -0.2, 0.2, -0.36, -0.12, 0.74, 0.8, ao, tmp)]
        me_nguoi.append(K.gop(f'gd_mau_nguoi_{i}', q)); bpy.data.collections.remove(tmp)
    rnd = random.Random(31); so_ghe = 0; so_nguoi = 0
    for r in range(SO_HANG):
        y0 = Y_HANG0 + r * SAU_HANG + 0.03; z = (r + 1) * CAO_BAC if r else CAO_BAC
        z = (r + 1) * CAO_BAC
        for j, cx in enumerate(CUM_X):
            K.inst(f'gd_ban_{r}_{j}', me_ban, (cx, y0, z), c); so_ghe += 4
            if not nguoi: continue
            for s in range(4):
                if r == 0 and j in (2, 3): continue          # hàng đầu giữa: chỗ Nam + Tùng, để trống cho nhân vật thật
                if rnd.random() < (0.85 if r < 9 else 0.45):
                    K.inst(f'gd_sv_{r}_{j}_{s}', me_nguoi[rnd.randrange(len(me_nguoi))], (cx - 0.82 + 0.55 * s + rnd.uniform(-0.05, 0.05), y0 + 0.66, z),
                           c, rot=(0, 0, math.radians(rnd.uniform(-12, 12)))); so_nguoi += 1
    return so_ghe, so_nguoi


def buc_bang_man(m, c):
    B = K.box
    B('gd_buc', -XW, XW, -1.0, Y_BUC, 0.0, 0.32, m['go_toi'], c, bevel=0.01)
    B('gd_bac_len_buc', -0.9, 0.9, Y_BUC, Y_BUC + 0.35, 0.0, 0.16, m['go_toi'], c)
    # bục giảng gỗ (lectern) + bàn giáo viên
    B('gd_buc_giang', 1.2, 2.0, 0.6, 1.25, 0.32, 1.42, m['go'], c, bevel=0.015)
    B('gd_buc_giang_mat', 1.15, 2.05, 0.55, 1.3, 1.42, 1.46, m['go_toi'], c, rot=(math.radians(-8), 0, 0))
    B('gd_ban_gv', 3.0, 4.6, 0.4, 1.2, 1.05, 1.09, m['go'], c)
    for (x, y) in ((3.05, 0.45), (4.55, 0.45), (3.05, 1.15), (4.55, 1.15)): K.cyl(f'gd_chan_ban_gv_{x}_{y}', x, y, 0.32, 0.025, 0.73, m['sat'], c, seg=8)
    K.box('gd_laptop_gv', 3.6, 3.95, 0.6, 0.85, 1.09, 1.105, m['den_may'], c)
    # bảng phấn xanh (lệch trái) + máng phấn + phấn
    B('gd_vien_bang', -6.6, -0.6, -0.99, -0.94, 1.15, 2.85, m['vien'], c)
    B('gd_bang', -6.5, -0.7, -0.94, -0.92, 1.25, 2.75, m['bang'], c)
    B('gd_mang_phan', -6.5, -0.7, -0.94, -0.84, 1.18, 1.22, m['vien'], c)
    for i, x in enumerate((-5.9, -5.8, -2.3)): K.cyl(f'gd_phan_{i}', x, -0.89, 1.22, 0.006, 0.07, m['phan'], c, seg=8, rot=(0, math.radians(90), 0.3 * i))
    # nét phấn mờ (công thức cũ chưa xoá sạch)
    import noi_dung_bang; noi_dung_bang.bang(c)   # chữ phấn, sơ đồ, góc meme (bố cục 3 vùng không đè)
    # màn chiếu (lệch phải) hiện code + hộp cuộn màn
    B('gd_hop_man', 0.6, 6.6, -0.95, -0.8, 4.4, 4.55, m['nhua'], c)
    sc = B('gd_man_chieu', 0.8, 6.4, -0.86, -0.85, 1.4, 4.4, m['man'], c)
    me = sc.data; me.uv_layers.new(name='UV')
    for poly in me.polygons:
        for li in poly.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            me.uv_layers[0].data[li].uv = ((co.x - 0.8) / 5.6, (co.z - 1.4) / 3.0)
    sc['giu_chi_tiet'] = True
    noi_dung_bang.man_chieu(c)
    # máy chiếu treo trần + vệt sáng mềm lên màn
    B('gd_may_chieu', 3.3, 3.9, 8.4, 8.8, TRAN - 0.8, TRAN - 0.55, m['nhua'], c, bevel=0.02)
    K.cyl('gd_can_may_chieu', 3.6, 8.6, TRAN - 0.55, 0.03, 0.55, m['sat'], c, seg=8)
    K.area('gd_anh_may_chieu', (3.6, -0.5, 2.9), 3.0, 18, '#cfe6ff', rot=(math.radians(-90), 0, 0), size_y=2.0, c=c)  # màn hắt ánh xanh lạnh ra bục


def tran_den_quat(m, c, mode):
    """Đèn tuýp 6500K (dải phát sáng + đèn area thật), quạt trần, miệng thông gió ù ù."""
    n = 0
    for iy, y in enumerate([0.5 + 2.6 * k for k in range(7)]):
        for ix, x in enumerate((-5.5, -1.8, 1.8, 5.5)):
            K.box(f'gd_mang_den_{iy}_{ix}', x - 0.65, x + 0.65, y - 0.08, y + 0.08, TRAN - 0.06, TRAN, m['nhua'], c)
            K.box(f'gd_tuyp_{iy}_{ix}', x - 0.6, x + 0.6, y - 0.025, y + 0.025, TRAN - 0.09, TRAN - 0.06, m['den'], c)
            n += 1
        # mỗi hàng 1 đèn area dài 13 m thay cho 4 bóng tuýp: ít nguồn sáng hơn → ít nhiễu, nhanh hơn; dải tuýp phát sáng chỉ để nhìn
        K.area(f'gd_sang_{iy}', (0.0, y, TRAN - 0.15), 13.0, 520 if mode == 'u_am' else 360, '#eef4ff', rot=(0, 0, 0), size_y=0.3, c=c)
    me_quat = None
    for k, (x, y) in enumerate(((-3.6, 6.0), (3.6, 6.0), (-3.6, 11.5), (3.6, 11.5))):
        K.cyl(f'gd_quat_truc_{k}', x, y, TRAN - 0.7, 0.015, 0.7, m['sat'], c, seg=8)
        K.cyl(f'gd_quat_motor_{k}', x, y, TRAN - 0.8, 0.12, 0.12, m['nhua'], c, seg=16)
        for b in range(3):
            K.box(f'gd_quat_canh_{k}_{b}', x, x + 0.6, y - 0.06, y + 0.06, TRAN - 0.76, TRAN - 0.75, m['nhua'], c).rotation_euler = (0, 0, b * 2.094 + k)
    for k, y in enumerate((3.0, 9.0, 15.0)):
        K.box(f'gd_thong_gio_{k}', XW - 0.05, XW, y - 0.4, y + 0.4, TRAN - 0.9, TRAN - 0.4, m['den_may'], c)
    return n


def build(mode='sang', cam='GD_TOAN', muc='duyet', nguoi=True):
    bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
    c = K.coll('Giang_duong')
    m = vat_lieu(mode)
    vo_phong(m, c); so_ghe, so_nguoi = bac_va_ghe(m, c, nguoi); buc_bang_man(m, c); tran_den_quat(m, c, mode)
    import chi_tiet_hoi3; print('[chi_tiet]', chi_tiet_hoi3.giang_duong(m, c), 'vật')
    # ngoài cửa sổ: trời sáng + vài khối cây/toà nhà xa (để kính không trống)
    K.troi('#dfe9ef', '#9fc0dc', 1.0 if mode == 'sang' else 0.6)
    for i in range(6):
        K.sphere(f'gd_ngoai_cay_{i}', -XW - 6 - (i % 2) * 3, 4 + 3 * i, 4.5, 2.6, M.solid('gd_cay', '#5d7d4a', 0.9), c, scale=(1, 1.3, 1))
        K.box(f'gd_ngoai_nha_{i}', -XW - 30 - 6 * (i % 3), -XW - 22, -5 + 5 * i, -1 + 5 * i, 0, 10 + 4 * (i % 3), M.solid('gd_nha_xa', '#c9c1b3', 0.9), c)
    if mode == 'sang':  # 8h sáng: nắng thấp, xiên qua cửa sổ trái, vệt sáng chéo lên dãy bàn
        K.sun('gd_nang', (0.82, -0.25, -0.5), 5.0, '#ffe9c4', 1.0, c)
    cams = {}
    for k, (p, t, f) in CAMS.items(): cams[k] = K.camera(k, p, t, f)
    sc.camera = cams[cam]
    toi_uu.apply(sc, [Vector(CAMS[cam][0])], muc)
    sc.view_settings.exposure = 0.1
    print(f'[giang_duong] {so_ghe} chỗ ngồi, {so_nguoi} hình nhân, camera {cam}')
    sc['so_ghe'] = so_ghe
    return sc


if __name__ == '__main__':
    a = K.tham_so('GD_TOAN', ['sang', 'u_am'])
    sc = build(a.mode, a.cam, a.muc, not a.khong_nguoi)
    K.ket_thuc(sc, a, f'/tmp/gd_{a.cam}.png')
