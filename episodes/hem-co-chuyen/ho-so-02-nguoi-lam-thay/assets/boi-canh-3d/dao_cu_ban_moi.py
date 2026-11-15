"""Đạo cụ theo KICH-BAN-15P-HOAN-CHINH.md (15/11/2026): sửa đồ lệch kịch bản + đạo cụ còn thiếu + điện thoại/laptop gắn UI thật.

Chạy bàn trưng bày:  /tmp/bpyenv/bin/python dao_cu_ban_moi.py --bang --out /tmp/dc.png [--width 1600]
Dùng trong cảnh:     import dao_cu_ban_moi as DC; DC.bua_cao_su(c, (x, y, z), rz=0.3)
Quy ước: toạ độ THẾ GIỚI (không phản chiếu như dao_cu_3d.py), `at` = tâm đáy, `rz` = quay quanh Z (rad). Chữ in nằm ngửa, đọc xuôi khi nhìn
từ phía −y xuống. Mỗi vật có Empty `grip_<tên>` = chỗ bàn tay cầm (gắn Child-Of vào xương tay khi có rig). Không dùng nhãn hãng thật.

Đạo cụ (cảnh trong master):
  bua_cao_su (1.1, 3.4)       búa sắt cán bọc cao su đen — THAY búa cán gỗ cũ
  hop_xoi (2.4) do=False|True hộp xôi trắng hành phi: nguyên / hất văng xuống sàn — THAY gói xôi gấc cũ
  hop_thuoc_khop (1.1, 1.4)   hộp thuốc bổ xương khớp + tờ note vàng của mẹ (chữ viết tay đúng câu master)
  note_lab402 (1.1)           mẩu note dán cạnh laptop
  hoa_don (1.1)               hoá đơn điện nước xanh nhạt 650.000đ (kẹp khe cửa)
  dep_to_ong (1.1)            đôi dép tổ ong trắng ố vàng mòn gót
  noi_com_dien (1.1)          nồi cơm điện cũ bám vệt nước cơm khô
  thung_mi (1.1)              thùng mì gói bóc dở + vỏ gói gia vị bạc
  chau_quan_ao (1.1, 2.1)     chậu đồ ngâm 3 hôm, nước đục bọt
  dao_got (1.3, 2.1)          dao gọt hoa quả cán nhựa vàng
  tuyp_dau (2.2)              tuýp dầu xoa bóp
  chia_khoa (3.1→3.2)         chùm chìa khoá phòng trọ
  ba_lo (3.1)                 ba lô Nam
  giao_trinh (2.4→3.1)        giáo trình Kỹ thuật Lập trình + 3 trang ghi chép thức trắng
  dien_thoai(ui=…), laptop(ui=…)  màn hình phát sáng dùng ảnh trong ./ui (ui_man_hinh.py)
"""
import os, sys, math, random, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
from mathutils import Vector, Matrix
import vat_lieu as M, hinh_khoi as K

DIR = os.path.dirname(os.path.abspath(__file__)); UI = os.path.join(DIR, 'ui'); FD = os.path.join(DIR, 'font')
_m = {}


def mat(mau, r=0.6, mt=0.0):
    k = (mau, r, mt)
    if k not in _m or _m[k].name not in bpy.data.materials: _m[k] = M.solid(f'dc2_{mau.strip("#")}_{int(r * 10)}_{int(mt * 10)}', mau, r, mt)
    return _m[k]


def _nhom(ten, at, rz, objs, c):
    """Gom các vật vừa tạo dưới một Empty gốc `dc_<tên>` đặt tại `at`, quay rz → di chuyển/quay cả đạo cụ một lần."""
    goc = bpy.data.objects.new(f'dc_{ten}', None); goc.empty_display_size = 0.05; c.objects.link(goc)
    for o in objs: o.parent = goc
    goc.location = at; goc.rotation_euler = (0, 0, rz); return goc


def grip(ten, x, y, z, c):
    e = bpy.data.objects.new(f'grip_{ten}', None); e.empty_display_type = 'SPHERE'; e.empty_display_size = 0.015; e.location = (x, y, z); c.objects.link(e); return e


def chu(ten, body, x, y, z, size, m, c, font='PatrickHand-Regular.ttf', align='LEFT', w=None, rot=(0, 0, 0)):
    import unicodedata; cu = bpy.data.curves.new(ten, 'FONT'); cu.body = unicodedata.normalize('NFC', body); cu.font = bpy.data.fonts.load(os.path.join(FD, font), check_existing=True)
    cu.size = size; cu.align_x = align; cu.space_line = 1.0
    if w: cu.text_boxes[0].width = w; cu.overflow = 'NONE'
    ob = bpy.data.objects.new(ten, cu); ob.location = (x, y, z); ob.rotation_euler = rot; cu.materials.append(m); c.objects.link(ob); return ob


def _tao(c):
    """Ghi lại các vật tạo ra trong khối with để gom nhóm."""
    class T:
        def __enter__(s): s.truoc = set(c.objects); return s
        def __exit__(s, *a): s.moi = [o for o in c.objects if o not in s.truoc and o.parent is None]
    return T()


# ------------------------------------------------------------------------------------------------ SỬA ĐỒ LỆCH KỊCH BẢN
def bua_cao_su(c, at, rz=0.0):
    """Búa sắt cán bọc cao su đen (đồ thợ sửa nhà trọ bỏ quên) — nằm dọc trục y, đầu búa ở y = +0.3."""
    with _tao(c) as t:
        thep = mat('#5d6166', 0.35, 0.9); cao_su = mat('#151515', 0.85); gi = mat('#6b4a2f', 0.9, 0.3)
        K.box('dc_bua_chuoi', -0.012, 0.012, 0.0, 0.28, 0.008, 0.03, thep, c)                     # chuôi thép
        K.box('dc_bua_boc', -0.017, 0.017, 0.0, 0.17, 0.0, 0.038, cao_su, c, bevel=0.008)         # bọc cao su
        for i in range(6): K.box(f'dc_bua_ran_{i}', -0.018, 0.018, 0.02 + 0.024 * i, 0.03 + 0.024 * i, 0.0, 0.039, mat('#0b0b0b', 0.9), c)  # rãnh chống trượt
        K.box('dc_bua_dau', -0.016, 0.016, 0.27, 0.31, -0.04, 0.085, thep, c, bevel=0.004)          # đầu búa đứng
        K.cyl('dc_bua_mat_dap', 0, 0.29, 0.085, 0.017, 0.02, mat('#8a8e93', 0.25, 0.95), c, seg=16)
        K.box('dc_bua_mong', -0.012, 0.012, 0.275, 0.305, -0.1, -0.04, thep, c, rot=(math.radians(-12), 0, 0))
        K.box('dc_bua_khe_mong', -0.003, 0.003, 0.27, 0.31, -0.1, -0.06, mat('#0a0a0c', 0.8), c)
        K.box('dc_bua_gi', -0.017, 0.017, 0.275, 0.29, 0.02, 0.05, gi, c)
        grip('bua', 0, 0.08, 0.02, c)
    return _nhom('bua_cao_su', at, rz, t.moi, c)


def hop_xoi(c, at, rz=0.0, do=False):
    """Hộp xôi trắng hành phi (hộp xốp nắp liền). do=True: hộp lật nghiêng trên sàn, xôi + hành văng tung toé (cảnh 2.4)."""
    rnd = random.Random(8)
    with _tao(c) as t:
        xop = mat('#f4f2ec', 0.85); xoi = mat('#f3efe2', 0.75); hanh = mat('#9a5a22', 0.6); mo = mat('#e9c46a', 0.4)
        L, Wd, Hh = 0.17, 0.13, 0.05
        if not do:
            K.box('dc_xoi_hop', -L / 2, L / 2, -Wd / 2, Wd / 2, 0, Hh, xop, c, bevel=0.006)
            K.box('dc_xoi_long', -L / 2 + 0.006, L / 2 - 0.006, -Wd / 2 + 0.006, Wd / 2 - 0.006, Hh - 0.004, Hh + 0.001, xoi, c)
            K.sphere('dc_xoi_u', 0, 0, Hh, 0.06, xoi, c, scale=(1.3, 1, 0.35), seg=16)
            K.box('dc_xoi_nap', -L / 2, L / 2, Wd / 2 + 0.002, Wd / 2 + Wd, 0, 0.012, xop, c, bevel=0.004)   # nắp liền lật ngửa ra sau
            K.box('dc_xoi_ban_le', -L / 2, L / 2, Wd / 2 - 0.002, Wd / 2 + 0.004, 0.0, Hh, xop, c)
            for i in range(40):
                a = rnd.uniform(0, 6.28); r = rnd.uniform(0, 0.06)
                K.box(f'dc_xoi_hanh_{i}', -0.005, 0.005, -0.003, 0.003, 0, 0.002, hanh, c, rot=(0, 0, a)).location = (r * math.cos(a) * 1.2, r * math.sin(a) * 0.8, Hh + 0.018 + rnd.uniform(0, 0.004))
            K.sphere('dc_xoi_mo_hanh', 0.02, -0.01, Hh + 0.02, 0.012, mo, c, scale=(1.5, 1, 0.3), seg=10)
            grip('xoi', 0, -Wd / 2, Hh / 2, c)
        else:
            hop = K.box('dc_xoi_hop_do', -L / 2, L / 2, -Wd / 2, Wd / 2, 0, Hh, xop, c, bevel=0.006); hop.rotation_euler = (0, math.radians(100), math.radians(25)); hop.location = (0.05, 0.02, 0.06)
            hat = K.coll('_hat'); me_hat = K.gop('dc_mau_hat_xoi', [K.sphere('h', 0, 0, 0, 0.004, xoi, hat, scale=(1.6, 1, 0.8), seg=6)]); bpy.data.collections.remove(hat)
            for i in range(160):   # hạt xôi văng: dày ở giữa, thưa ra ngoài theo hướng hất
                r = abs(rnd.gauss(0, 0.12)); a = rnd.gauss(0.4, 0.8)
                K.inst(f'dc_xoi_hat_{i}', me_hat, (r * math.cos(a), r * math.sin(a), 0.003), c, rot=(0, 0, rnd.uniform(0, 6.3)))
            for i in range(6): K.sphere(f'dc_xoi_cuc_{i}', rnd.gauss(0.02, 0.04), rnd.gauss(0.02, 0.04), 0.0, rnd.uniform(0.012, 0.02), xoi, c, scale=(1.3, 1, 0.5), seg=10)
            for i in range(30):
                r = abs(rnd.gauss(0, 0.14)); a = rnd.gauss(0.4, 0.9)
                K.box(f'dc_xoi_hanh_do_{i}', -0.005, 0.005, -0.003, 0.003, 0, 0.002, hanh, c, rot=(0, 0, a)).location = (r * math.cos(a), r * math.sin(a), 0.001)
            grip('xoi_nhat', 0.03, 0.01, 0.004, c)
    return _nhom('hop_xoi_do' if do else 'hop_xoi', at, rz, t.moi, c)


# ------------------------------------------------------------------------------------------------ ĐẠO CỤ MỚI
NOTE_ME = ('Nam nhớ uống đều ngày 2 viên đỡ mỏi lưng còng gù nha con. Mẹ dạo này uống thuốc này khớp gối đỡ đau nhức '
           'mỗi khi trời trở lạnh nhiều rồi. Lo ăn uống đừng nhịn đói nha con trai.')


def hop_thuoc_khop(c, at, rz=0.0):
    """Hộp thuốc bổ xương khớp (xanh lá, nhãn chung không hãng) + tờ note vàng viết tay của mẹ kẹp trên nắp (manh mối 1.4)."""
    with _tao(c) as t:
        xanh = mat('#3f8f4f', 0.5); trang = mat('#f4f2ea', 0.6); muc = mat('#2a3a8a', 0.8); vang = mat('#f7e27a', 0.95)
        K.box('dc_thuoc_hop', -0.06, 0.06, -0.035, 0.035, 0, 0.13, xanh, c, bevel=0.003)
        K.box('dc_thuoc_nhan', -0.055, 0.055, -0.036, -0.035, 0.03, 0.1, trang, c)
        chu('dc_thuoc_chu_1', 'GLUCOSAMINE', 0, -0.0365, 0.075, 0.016, xanh, c, 'LiberationSans-Bold.ttf', 'CENTER', rot=(math.radians(90), 0, 0))
        chu('dc_thuoc_chu_2', 'Bổ xương khớp · 60 viên', 0, -0.0365, 0.05, 0.009, mat('#333333', 0.6), c, 'LiberationSans-Bold.ttf', 'CENTER', rot=(math.radians(90), 0, 0))
        note = K.box('dc_note_me', -0.055, 0.055, -0.05, 0.05, 0.1305, 0.1315, vang, c); note.rotation_euler = (0, 0, math.radians(-8))
        tx = chu('dc_note_me_chu', NOTE_ME, -0.05, 0.044, 0.1318, 0.0078, muc, c, align='LEFT', w=0.1)
        tx.rotation_euler = (0, 0, math.radians(-8)); tx.location = Matrix.Rotation(math.radians(-8), 3, 'Z') @ Vector((-0.05, 0.044, 0.1318))
        tx.data.align_y = 'TOP'
        grip('thuoc', 0, 0, 0.065, c)
    return _nhom('hop_thuoc_khop', at, rz, t.moi, c)


def note_lab402(c, at, rz=0.0):
    with _tao(c) as t:
        K.box('dc_note_lab', -0.045, 0.045, -0.045, 0.045, 0, 0.0008, mat('#ffb3c7', 0.95), c)
        tx = chu('dc_note_lab_chu', '13h00 Chiều Thứ 5:\nThực hành Lab 402 -\nKỹ thuật Lập trình\n(Có mặt ký tên\n& nộp code)', -0.04, 0.036, 0.001, 0.0105, mat('#1d2a6a', 0.8), c); tx.data.align_y = 'TOP'
    return _nhom('note_lab402', at, rz, t.moi, c)


def hoa_don(c, at, rz=0.0, dung=False):
    """Hoá đơn điện nước xanh nhạt, 650.000đ. dung=True: dựng đứng kẹp khe cửa (mép dưới ở at)."""
    with _tao(c) as t:
        giay = mat('#cfe6f2', 0.95); den = mat('#1d2730', 0.7); do = mat('#c62828', 0.7)
        K.box('dc_hd_giay', -0.05, 0.05, -0.075, 0.075, 0, 0.0006, giay, c)
        chu('dc_hd_1', 'HÓA ĐƠN TIỀN ĐIỆN NƯỚC', 0, 0.06, 0.0008, 0.0085, den, c, 'LiberationSans-Bold.ttf', 'CENTER')
        chu('dc_hd_2', 'Phòng 201 · Tháng 11', 0, 0.045, 0.0008, 0.007, den, c, 'LiberationSans-Bold.ttf', 'CENTER')
        for i, (a, b) in enumerate((('Điện: 162 số × 4.000đ', '648.000đ'), ('Nước: khoán', '…'), ('Rác + mạng', '…'))):
            chu(f'dc_hd_l{i}', a, -0.044, 0.02 - 0.016 * i, 0.0008, 0.0065, den, c, 'LiberationSans-Bold.ttf'); chu(f'dc_hd_r{i}', b, 0.044, 0.02 - 0.016 * i, 0.0008, 0.0065, den, c, 'LiberationSans-Bold.ttf', 'RIGHT')
        chu('dc_hd_tong', 'TIỀN ĐIỆN: 650.000đ', 0, -0.045, 0.0008, 0.0095, do, c, 'LiberationSans-Bold.ttf', 'CENTER')
        chu('dc_hd_ghi', 'Tháng này dùng nhiều quá nha em!', 0, -0.064, 0.0008, 0.0075, mat('#2a3a8a', 0.8), c, align='CENTER')
    g = _nhom('hoa_don', at, rz, t.moi, c)
    if dung: g.rotation_euler = (math.radians(90), 0, rz); g.location = (at[0], at[1], at[2] + 0.075)
    return g


def dep_to_ong(c, at, rz=0.0):
    """Đôi dép tổ ong (nhựa xốp đục lỗ) trắng ố vàng, gót mòn vẹt."""
    with _tao(c) as t:
        nhua = mat('#ece6c8', 0.75); o = mat('#c9bd8a', 0.85); lo = mat('#6b6450', 0.9)
        for s, dx in (('trai', -0.06), ('phai', 0.06)):
            K.box(f'dc_dep_de_{s}', dx - 0.045, dx + 0.045, -0.12, 0.13, 0, 0.022, nhua, c, bevel=0.012)
            K.box(f'dc_dep_got_mon_{s}', dx - 0.04, dx + 0.04, -0.12, -0.07, 0.0, 0.006, o, c)
            K.box(f'dc_dep_mu_{s}', dx - 0.047, dx + 0.047, 0.0, 0.12, 0.022, 0.06, nhua, c, bevel=0.015)
            for i in range(4):
                for j in range(2): K.cyl(f'dc_dep_lo_{s}_{i}_{j}', dx - 0.02 + 0.04 * j, 0.02 + 0.026 * i, 0.058, 0.007, 0.004, lo, c, seg=6)
            K.box(f'dc_dep_vet_o_{s}', dx - 0.046, dx + 0.046, 0.06, 0.12, 0.059, 0.0605, o, c)
    return _nhom('dep_to_ong', at, rz, t.moi, c)


def noi_com_dien(c, at, rz=0.0):
    """Nồi cơm điện cũ: thân trắng ngà ố, nắp vòm, quai, đèn nấu/hâm, vệt nước cơm khô chảy dọc thân."""
    with _tao(c) as t:
        than = mat('#ece7da', 0.45); o = mat('#d7c9a2', 0.7); xam = mat('#8f9295', 0.4, 0.6)
        K.cyl('dc_noi_than', 0, 0, 0, 0.13, 0.2, than, c, seg=32)
        K.cyl('dc_noi_vien', 0, 0, 0.2, 0.135, 0.015, xam, c, seg=32)
        K.sphere('dc_noi_nap', 0, 0, 0.212, 0.13, than, c, scale=(1, 1, 0.35), seg=28)
        K.box('dc_noi_quai', -0.06, 0.06, -0.012, 0.012, 0.255, 0.27, xam, c, bevel=0.005)
        K.box('dc_noi_bang_dk', -0.04, 0.04, -0.131, -0.125, 0.05, 0.11, mat('#5a5f66', 0.4), c)
        K.sphere('dc_noi_den_ham', -0.015, -0.132, 0.09, 0.006, M.emission('dc2_den_ham', '#ffb04a', 2.0), c, seg=8)
        for i, (a, l) in enumerate(((0.3, 0.09), (0.9, 0.06), (2.4, 0.11))):   # vệt nước cơm khô
            K.box(f'dc_noi_vet_{i}', -0.008, 0.008, -0.002, 0.002, 0.2 - l, 0.2, o, c).location = (0.131 * math.cos(a), 0.131 * math.sin(a), 0)
        K.cyl('dc_noi_day', -0.13, 0.05, 0.03, 0.006, 0.12, mat('#202020', 0.6), c, seg=6, rot=(0, math.radians(90), 0.4))
        grip('noi_quai', 0, 0, 0.262, c)
    return _nhom('noi_com_dien', at, rz, t.moi, c)


def thung_mi(c, at, rz=0.0):
    """Thùng carton mì gói (nhãn tự chế, không hãng thật) bóc dở nắp, vài gói lộ ra; cạnh sọt rác đầy vỏ gói gia vị bạc."""
    rnd = random.Random(3)
    with _tao(c) as t:
        cart = mat('#c49a62', 0.85); do = mat('#d8352a', 0.6); bac = mat('#c9ccd0', 0.25, 0.9); vang = mat('#f6c945', 0.6)
        K.box('dc_mi_thung', -0.2, 0.2, -0.13, 0.13, 0, 0.26, cart, c)
        nap = K.box('dc_mi_nap_mo', -0.2, 0.2, 0.13, 0.25, 0.258, 0.262, cart, c); nap.rotation_euler = (math.radians(-35), 0, 0)
        K.box('dc_mi_nhan', -0.15, 0.15, -0.131, -0.13, 0.06, 0.2, do, c)
        chu('dc_mi_chu', 'MÌ TÔM\nCHUA CAY', 0, -0.1315, 0.15, 0.04, vang, c, 'LiberationSans-Bold.ttf', 'CENTER', rot=(math.radians(90), 0, 0))
        chu('dc_mi_chu_2', '30 gói × 75g', 0, -0.1315, 0.075, 0.016, mat('#ffffff', 0.6), c, 'LiberationSans-Bold.ttf', 'CENTER', rot=(math.radians(90), 0, 0))
        for i in range(5): K.box(f'dc_mi_goi_{i}', -0.18 + 0.075 * i, -0.12 + 0.075 * i, -0.1, 0.1, 0.2, 0.235 + 0.01 * (i % 2), do, c, rot=(0, math.radians(rnd.uniform(-8, 8)), 0))
        K.cyl('dc_mi_sot_rac', 0.33, -0.02, 0, 0.12, 0.28, mat('#4a7a5a', 0.6), c, seg=20, r2=0.14)
        for i in range(22):
            a = rnd.uniform(0, 6.28); r = rnd.uniform(0, 0.11)
            K.box(f'dc_mi_vo_gv_{i}', -0.02, 0.02, -0.014, 0.014, 0, 0.002, bac, c, rot=(rnd.uniform(-0.5, 0.5), rnd.uniform(-0.5, 0.5), a)).location = (0.33 + r * math.cos(a), -0.02 + r * math.sin(a), 0.28 + rnd.uniform(0, 0.05))
    return _nhom('thung_mi', at, rz, t.moi, c)


def chau_quan_ao(c, at, rz=0.0):
    """Chậu nhựa đỏ đựng quần áo ngâm bột giặt 3 hôm: nước xám đục, bọt váng, mép áo ướt sẫm thò ra ngoài."""
    rnd = random.Random(5)
    with _tao(c) as t:
        nhua = mat('#c8342b', 0.4); nuoc = mat('#8d8b7a', 0.08); bot = mat('#e6e3d8', 0.7)
        bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=False, segments=36, radius1=0.17, radius2=0.25, depth=0.2)   # thành chậu hở miệng
        for v in bm.verts: v.co.z += 0.1
        bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=0.006)
        me = bpy.data.meshes.new('dc_chau'); bm.to_mesh(me); bm.free(); me.materials.append(nhua)
        for p_ in me.polygons: p_.use_smooth = True
        c.objects.link(bpy.data.objects.new('dc_chau', me))
        K.cyl('dc_chau_day', 0, 0, 0, 0.17, 0.006, nhua, c, seg=36)
        bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=False, segments=36, radius1=0.255, radius2=0.255, depth=0.012)
        for v in bm.verts: v.co.z += 0.2
        bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=0.012); me = bpy.data.meshes.new('dc_chau_vanh'); bm.to_mesh(me); bm.free(); me.materials.append(nhua); c.objects.link(bpy.data.objects.new('dc_chau_vanh', me))
        K.cyl('dc_chau_nuoc', 0, 0, 0.12, 0.23, 0.045, nuoc, c, seg=32)
        for i, mau in enumerate(('#2b3a55', '#4a4a4a', '#6b3a3a', '#3f5e45')):
            K.sphere(f'dc_chau_ao_{i}', rnd.uniform(-0.1, 0.1), rnd.uniform(-0.1, 0.1), 0.16, 0.09, mat(mau, 0.5), c, scale=(1.3, 1, 0.3), seg=12)
        K.box('dc_chau_tay_ao', 0.2, 0.36, -0.03, 0.03, 0.17, 0.19, mat('#2b3a55', 0.5), c, rot=(0, math.radians(35), 0))
        for i in range(24):
            a = rnd.uniform(0, 6.28); r = rnd.uniform(0.05, 0.22)
            K.sphere(f'dc_chau_bot_{i}', r * math.cos(a), r * math.sin(a), 0.166, rnd.uniform(0.008, 0.02), bot, c, seg=8)
        grip('chau_mieng', 0.25, 0, 0.2, c)
    return _nhom('chau_quan_ao', at, rz, t.moi, c)


def dao_got(c, at, rz=0.0):
    """Dao gọt hoa quả cán nhựa vàng (giấu dưới mép nệm). Nằm dọc y, mũi dao ở +y."""
    with _tao(c) as t:
        vang = mat('#f2b705', 0.45); thep = mat('#b9bec4', 0.2, 0.95)
        K.box('dc_dao_can', -0.011, 0.011, 0.0, 0.1, 0.0, 0.016, vang, c, bevel=0.005)
        for i in range(2): K.cyl(f'dc_dao_dinh_{i}', 0, 0.03 + 0.04 * i, 0.016, 0.003, 0.001, thep, c, seg=8)
        bm = bmesh.new()
        v = [bm.verts.new(p) for p in ((-0.009, 0.1, 0.002), (0.009, 0.1, 0.002), (0.004, 0.19, 0.002), (-0.009, 0.2, 0.002),
                                      (-0.009, 0.1, 0.004), (0.009, 0.1, 0.004), (0.004, 0.19, 0.004), (-0.009, 0.2, 0.004))]
        for f in ((0, 1, 2, 3), (7, 6, 5, 4), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)): bm.faces.new([v[i] for i in f])
        me = bpy.data.meshes.new('dc_dao_luoi'); bm.to_mesh(me); bm.free(); me.materials.append(thep)
        ob = bpy.data.objects.new('dc_dao_luoi', me); c.objects.link(ob)
        grip('dao', 0, 0.05, 0.008, c)
    return _nhom('dao_got', at, rz, t.moi, c)


def tuyp_dau(c, at, rz=0.0):
    with _tao(c) as t:
        xanh = mat('#2f8f6a', 0.4); trang = mat('#f2f2ee', 0.5)
        K.cyl('dc_tuyp_than', 0, 0, 0.012, 0.016, 0.1, xanh, c, seg=16, rot=(math.radians(-90), 0, 0))
        K.box('dc_tuyp_duoi', -0.019, 0.019, 0.1, 0.112, 0.008, 0.016, xanh, c)
        K.cyl('dc_tuyp_nap', 0, 0, 0.012, 0.01, 0.022, trang, c, seg=12, rot=(math.radians(90), 0, 0))
        chu('dc_tuyp_chu', 'DẦU XOA BÓP', 0.0, 0.05, 0.0285, 0.0075, trang, c, 'LiberationSans-Bold.ttf', 'CENTER', rot=(0, 0, math.radians(90)))
        grip('tuyp', 0, 0.05, 0.012, c)
    return _nhom('tuyp_dau', at, rz, t.moi, c)


def chia_khoa(c, at, rz=0.0):
    with _tao(c) as t:
        dong = mat('#c9a64a', 0.3, 0.9); bac = mat('#b0b4b8', 0.3, 0.9)
        bm = bmesh.new(); bmesh.ops.create_circle(bm, cap_ends=False, segments=24, radius=0.016)
        me = bpy.data.meshes.new('dc_khoa_vong'); bm.to_mesh(me); bm.free()
        K.cyl('dc_khoa_vong_tron', 0, 0, 0, 0.017, 0.002, bac, c, seg=24); K.cyl('dc_khoa_vong_lo', 0, 0, 0.0021, 0.014, 0.0005, mat('#000000', 0.9), c, seg=24)
        for i, (a, m_) in enumerate(((0.5, dong), (-0.4, bac))):
            K.cyl(f'dc_khoa_dau_{i}', 0.035 * math.cos(a), 0.035 * math.sin(a), 0, 0.014, 0.003, m_, c, seg=16)
            K.box(f'dc_khoa_than_{i}', -0.004, 0.004, 0.0, 0.045, 0, 0.0025, m_, c, rot=(0, 0, a - math.pi / 2)).location = (0.045 * math.cos(a), 0.045 * math.sin(a), 0)
        K.box('dc_khoa_the', -0.012, 0.012, -0.05, -0.016, 0, 0.004, mat('#2a6fd6', 0.5), c)
        chu('dc_khoa_so', '201', 0, -0.036, 0.0042, 0.012, mat('#ffffff', 0.6), c, 'LiberationSans-Bold.ttf', 'CENTER')
        grip('khoa', 0.04, 0.02, 0.002, c)
    return _nhom('chia_khoa', at, rz, t.moi, c)


def ba_lo(c, at, rz=0.0):
    with _tao(c) as t:
        vai = mat('#2d3a2a', 0.85); kh = mat('#1a1a1a', 0.6)
        K.box('dc_balo_than', -0.15, 0.15, -0.09, 0.09, 0, 0.42, vai, c, bevel=0.05)
        K.box('dc_balo_tui', -0.11, 0.11, -0.13, -0.09, 0.06, 0.22, vai, c, bevel=0.025)
        for x in (-0.08, 0.08): K.box(f'dc_balo_quai_{x}', x - 0.025, x + 0.025, 0.09, 0.11, 0.05, 0.4, kh, c, bevel=0.008)
        K.box('dc_balo_khoa_keo', -0.12, 0.12, -0.131, -0.128, 0.215, 0.222, mat('#b0b4b8', 0.3, 0.9), c)
        K.box('dc_balo_moc', -0.03, 0.03, -0.01, 0.01, 0.42, 0.45, kh, c)
        grip('balo', 0, 0, 0.44, c)
    return _nhom('ba_lo', at, rz, t.moi, c)


def giao_trinh(c, at, rz=0.0):
    """Giáo trình dày + 3 trang giấy ghi chép kín chữ (đêm thức trắng trước buổi giảng đường)."""
    rnd = random.Random(12)
    with _tao(c) as t:
        bia = mat('#1d4f8a', 0.6); giay = mat('#f3efe4', 0.9); muc = mat('#25336e', 0.8)
        K.box('dc_gt_bia', -0.085, 0.085, -0.12, 0.12, 0, 0.032, bia, c, bevel=0.002)
        K.box('dc_gt_ruot', -0.082, 0.087, -0.117, 0.117, 0.002, 0.03, giay, c)
        chu('dc_gt_ten', 'GIÁO TRÌNH\nKỸ THUẬT\nLẬP TRÌNH', 0, 0.07, 0.0325, 0.019, mat('#ffffff', 0.6), c, 'LiberationSans-Bold.ttf', 'CENTER')
        chu('dc_gt_nxb', 'Khoa Công nghệ Thông tin', 0, -0.1, 0.0325, 0.008, mat('#cfe0f5', 0.6), c, 'LiberationSans-Bold.ttf', 'CENTER')
        dong = ['Thread pool: N luồng dùng chung hàng đợi', 'mutex → khoá trước khi đọc/ghi', 'cv.wait(lk, điều kiện) — tránh đánh thức giả',
                'notify_one vs notify_all ??', 'deadlock: 2 luồng giữ khoá chéo nhau', 'race condition → dùng atomic?', 'stop = true thì thoát vòng lặp',
                'hỏi thầy: vì sao phải unique_lock?', 'emplace vs push', 'ÔN LẠI CẢ ĐOẠN submit()!!!']
        for k in range(3):
            dx, dy, a = 0.2 + 0.012 * k, -0.01 * k, math.radians(-6 + 7 * k)
            p = K.box(f'dc_gt_to_{k}', -0.074, 0.074, -0.105, 0.105, 0.0005 * k, 0.0005 * k + 0.0004, giay, c); p.location = (dx, dy, 0); p.rotation_euler = (0, 0, a)
            tx = chu(f'dc_gt_ghi_{k}', '\n'.join(rnd.sample(dong, 8)) if k < 2 else '\n'.join(dong[:8]), -0.068, 0.095, 0.0005 * k + 0.0006, 0.0072, muc, c)
            tx.data.align_y = 'TOP'; tx.location = Vector((dx, dy, 0)) + Matrix.Rotation(a, 3, 'Z') @ Vector((-0.068, 0.095, 0.0005 * k + 0.0006)); tx.rotation_euler = (0, 0, a)
            chu(f'dc_gt_trang_{k}', f'{k + 1}/3', 0, 0, 0, 0.007, muc, c).location = Vector((dx, dy, 0)) + Matrix.Rotation(a, 3, 'Z') @ Vector((0.055, -0.098, 0.0005 * k + 0.0006))
        grip('giao_trinh', 0, -0.12, 0.016, c)
    return _nhom('giao_trinh', at, rz, t.moi, c)


# ------------------------------------------------------------------------------------------------ MÀN HÌNH CÓ UI
def _mat_anh(ten, file, sang=2.2):
    m = bpy.data.materials.get(f'dc2_ui_{ten}')
    if m: return m
    m = bpy.data.materials.new(f'dc2_ui_{ten}'); m.use_nodes = True; nt = m.node_tree; N, L = nt.nodes, nt.links
    for n in list(N): N.remove(n)
    out = N.new('ShaderNodeOutputMaterial'); em = N.new('ShaderNodeEmission'); em.inputs['Strength'].default_value = sang
    tex = N.new('ShaderNodeTexImage'); tex.image = bpy.data.images.load(os.path.join(UI, file), check_existing=True)
    L.new(tex.outputs['Color'], em.inputs['Color']); L.new(em.outputs[0], out.inputs['Surface'])
    m.cycles.emission_sampling = 'NONE'   # màn hình nhỏ: phát sáng nhìn thấy, không lấy mẫu như đèn (đặt đèn area riêng nếu cần hắt sáng mặt)
    return m


def _mat_phang_uv(ten, x0, x1, y0, y1, z, m, c, rot=None):
    """Mặt phẳng có UV phủ trọn ảnh (u theo x, v theo y)."""
    bm = bmesh.new(); vs = [bm.verts.new(p) for p in ((x0, y0, z), (x1, y0, z), (x1, y1, z), (x0, y1, z))]; f = bm.faces.new(vs)
    uv = bm.loops.layers.uv.new('UV')
    for lp, co in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[uv].uv = co
    me = bpy.data.meshes.new(ten); bm.to_mesh(me); bm.free(); me.materials.append(m)
    ob = bpy.data.objects.new(ten, me); c.objects.link(ob)
    if rot: ob.rotation_euler = rot
    return ob


def dien_thoai(c, at, rz=0.0, ui='UI-01_bao-thuc-0630.png', sang=2.2):
    """Điện thoại nằm ngửa, màn hình hiện ảnh UI (624×1040 → 0,069 × 0,145 m)."""
    with _tao(c) as t:
        K.box('dc_dt_than', -0.037, 0.037, -0.076, 0.076, 0, 0.008, mat('#2b2d31', 0.35, 0.6), c, bevel=0.004)
        _mat_phang_uv('dc_dt_man', -0.0345, 0.0345, -0.0725, 0.0725, 0.0082, _mat_anh(ui.split('.')[0], ui, sang), c)
        grip('dien_thoai', 0, -0.03, 0.004, c)
    return _nhom('dien_thoai_' + ui.split('_')[0], at, rz, t.moi, c)


def laptop(c, at, rz=0.0, ui='UI-07_laptop-tieu-luan.png', mo=105, sang=2.0):
    """Laptop 14", màn hình mở `mo` độ, hiện ảnh UI 16:9."""
    with _tao(c) as t:
        vo = mat('#9fa3a8', 0.35, 0.7)
        K.box('dc_lt_de', -0.16, 0.16, -0.11, 0.11, 0, 0.016, vo, c, bevel=0.004)
        K.box('dc_lt_phim', -0.14, 0.14, -0.02, 0.09, 0.016, 0.0165, mat('#24262a', 0.6), c)
        K.box('dc_lt_touch', -0.05, 0.05, -0.1, -0.03, 0.016, 0.0163, mat('#8c9095', 0.3, 0.6), c)
        np = bpy.data.objects.new('dc_lt_ban_le', None); c.objects.link(np); np.location = (0, 0.11, 0.016)
        nap = K.box('dc_lt_nap', -0.16, 0.16, 0, 0.006, 0, 0.2, vo, c); nap.parent = np
        man = _mat_phang_uv('dc_lt_man', -0.15, 0.15, 0.01, 0.1788, 0.0004, _mat_anh(ui.split('.')[0], ui, sang), c, rot=(math.radians(90), 0, 0)); man.parent = np
        man.location = (0, 0, 0)
        np.rotation_euler = (math.radians(-(mo - 90)), 0, 0)
        grip('laptop_nap', 0, 0.11, 0.2, c)
    return _nhom('laptop_' + ui.split('_')[0], at, rz, t.moi, c)


# ------------------------------------------------------------------------------------------------ BÀN TRƯNG BÀY
def bang(c):
    K.box('dc_ban_trung_bay', -0.2, 2.6, -0.6, 0.9, -0.03, 0.0, mat('#59687a', 0.8), c)
    bua_cao_su(c, (0.0, -0.45, 0.0)); hop_xoi(c, (0.35, -0.4, 0.0)); hop_xoi(c, (0.75, -0.35, 0.0), do=True)
    hop_thuoc_khop(c, (1.15, -0.4, 0.0)); note_lab402(c, (1.35, -0.45, 0.0), 0.1); hoa_don(c, (1.55, -0.42, 0.0), -0.05)
    dao_got(c, (1.75, -0.5, 0.0), -0.3); tuyp_dau(c, (1.9, -0.5, 0.0)); chia_khoa(c, (2.05, -0.45, 0.0)); giao_trinh(c, (2.3, -0.4, 0.0))
    dep_to_ong(c, (0.0, 0.1, 0.0)); noi_com_dien(c, (0.35, 0.15, 0.0)); thung_mi(c, (0.8, 0.25, 0.0)); chau_quan_ao(c, (1.5, 0.3, 0.0))
    ba_lo(c, (1.95, 0.45, 0.0)); dien_thoai(c, (2.1, 0.05, 0.0), ui='UI-05_me-goi-video.png'); dien_thoai(c, (2.22, 0.05, 0.0), ui='UI-04_diem-lab402.png')
    laptop(c, (2.3, 0.55, 0.0), ui='UI-07_laptop-tieu-luan.png')


if __name__ == '__main__':
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--bang', action='store_true'); ap.add_argument('--out', default='/tmp/dao_cu_moi.png')
    ap.add_argument('--width', type=int, default=1600); ap.add_argument('--samples', type=int, default=32); ap.add_argument('--cam', default='toan')
    a = ap.parse_args(argv)
    bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene; c = K.coll('Dao_cu_moi')
    bang(c)
    K.troi('#cfd8e2', '#9fb4cc', 0.6)
    K.area('dc_den_chinh', (1.2, -1.6, 2.2), 3.0, 260, '#fff4e6', rot=(math.radians(40), 0, 0), c=c)
    K.area('dc_den_phu', (1.2, 1.8, 1.6), 3.0, 80, '#dfe8ff', rot=(math.radians(-50), 0, 0), c=c)
    cams = {'toan': ((1.2, -1.55, 1.75), (1.2, 0.0, 0.0), 30), 'gan_trai': ((0.4, -0.95, 0.55), (0.4, -0.3, 0.05), 45), 'gan_phai': ((1.75, -0.95, 0.55), (1.75, -0.4, 0.02), 45),
            'ui': ((2.25, -0.45, 0.5), (2.25, 0.45, 0.12), 35), 'note': ((1.22, -0.72, 0.42), (1.22, -0.42, 0.1), 50)}
    p, tg, f = cams[a.cam]; sc.camera = K.camera('cam', p, tg, f)
    import toi_uu; toi_uu.cau_hinh(sc, 'duyet'); sc.cycles.samples = a.samples
    sc.render.resolution_x = a.width; sc.render.resolution_y = round(a.width / 2.39); sc.render.resolution_percentage = 100
    sc.view_settings.view_transform = 'AgX'; sc.render.filepath = a.out; bpy.ops.render.render(write_still=True)
