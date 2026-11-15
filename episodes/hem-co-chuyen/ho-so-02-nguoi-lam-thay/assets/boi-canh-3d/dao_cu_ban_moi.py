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


def matt(mau, r=0.8, vary=0.12, bump=0.2, scale=40.0):
    """Vật liệu có loang màu + vân sần (xốp, carton, vải, nhựa cũ) → bề mặt có chất liệu, không phẳng lì."""
    k = ('t', mau, r, vary, bump)
    if k not in _m or _m[k].name not in bpy.data.materials: _m[k] = M.mottled(f'dc2t_{mau.strip("#")}_{int(r * 10)}_{int(bump * 100)}', mau, rough=r, vary=vary, bump=bump, bump_scale=scale)
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



def _mem(ob, lv=2):
    """Làm mềm khối (Subdivision) để ra dáng vải/nhựa đúc tròn trịa thay vì hộp vuông."""
    md = ob.modifiers.new('mem', 'SUBSURF'); md.levels = lv; md.render_levels = lv
    for p_ in ob.data.polygons: p_.use_smooth = True
    return ob


def tron_xoay(ten, pts, m, c, seg=36, x=0, y=0, z=0, dong_day=True):
    """Tròn xoay quanh trục z từ dãy (bán kính, cao); dong_day: bịt đáy. Mép mượt (smooth)."""
    bm = bmesh.new(); rings = []
    for (r, h) in pts: rings.append([bm.verts.new((x + r * math.cos(2 * math.pi * i / seg), y + r * math.sin(2 * math.pi * i / seg), z + h)) for i in range(seg)])
    for a_ in range(len(rings) - 1):
        for i in range(seg): bm.faces.new((rings[a_][i], rings[a_][(i + 1) % seg], rings[a_ + 1][(i + 1) % seg], rings[a_ + 1][i]))
    if dong_day: bm.faces.new(list(reversed(rings[0])))
    me = bpy.data.meshes.new(ten); bm.to_mesh(me); bm.free(); me.materials.append(m)
    for p_ in me.polygons: p_.use_smooth = True
    ob = bpy.data.objects.new(ten, me); c.objects.link(ob); return ob


def _w_dep(y):
    """Nửa bề rộng nền đế theo y, đổi mượt: gót 0,040 → eo 0,034 → mũi 0,046 (chưa nhân hệ số bo tròn đầu mũi/gót)."""
    ss = lambda a: a * a * (3 - 2 * a)
    if y <= -0.06: return 0.040
    if y <= 0.0: return 0.040 - 0.006 * ss((y + 0.06) / 0.06)
    if y <= 0.06: return 0.034 + 0.012 * ss(y / 0.06)
    return 0.046


def _r_quai(y):
    """Bán kính quai tại y: bám đúng bề rộng đế tại y đó (nhỏ hơn 4 mm) nên quai ngồi lên đế, không chìa ra ngoài."""
    return _w_dep(y) * math.sqrt(max(0.0, 1 - (y / 0.125) ** 2)) - 0.004


def de_dep(ten, dx, m, c, day=0.024):
    """Đế dép hình bàn chân: mũi tròn rộng, eo thắt, gót tròn (đùn từ đường viền)."""
    bm = bmesh.new(); pts = []
    for i in range(40):
        t_ = 2 * math.pi * i / 40; y = 0.125 * math.sin(t_)
        pts.append((dx + _w_dep(y) * math.cos(t_), y))                  # mũi rộng, eo, gót (đổi mượt)
    vb = [bm.verts.new((x_, y_, 0)) for x_, y_ in pts]; vt = [bm.verts.new((x_, y_, day)) for x_, y_ in pts]
    bm.faces.new(list(reversed(vb))); bm.faces.new(vt)
    for i in range(40): bm.faces.new((vb[i], vb[(i + 1) % 40], vt[(i + 1) % 40], vt[i]))
    me = bpy.data.meshes.new(ten); bm.to_mesh(me); bm.free(); me.materials.append(m)
    ob = bpy.data.objects.new(ten, me); c.objects.link(ob)
    md = ob.modifiers.new('bevel', 'BEVEL'); md.width = 0.006; md.segments = 3
    for p_ in ob.data.polygons: p_.use_smooth = True
    return ob


# ------------------------------------------------------------------------------------------------ SỬA ĐỒ LỆCH KỊCH BẢN
def bua_cao_su(c, at, rz=0.0):
    """Búa sắt cán bọc cao su đen (đồ thợ sửa nhà trọ bỏ quên) — nằm dọc trục y, đầu búa ở y = +0.3."""
    with _tao(c) as t:
        thep = mat('#5d6166', 0.35, 0.9); cao_su = mat('#151515', 0.85); gi = mat('#6b4a2f', 0.9, 0.3)
        K.box('dc_bua_chuoi', -0.012, 0.012, 0.0, 0.28, 0.008, 0.03, thep, c)                     # chuôi thép
        K.box('dc_bua_boc', -0.017, 0.017, 0.0, 0.17, 0.0, 0.038, cao_su, c, bevel=0.008)         # bọc cao su
        for i in range(6): K.box(f'dc_bua_ran_{i}', -0.018, 0.018, 0.02 + 0.024 * i, 0.03 + 0.024 * i, 0.0, 0.039, mat('#0b0b0b', 0.9), c)  # rãnh chống trượt
        sang = mat('#8a8e93', 0.25, 0.95)
        K.box('dc_bua_co', -0.015, 0.015, 0.267, 0.313, -0.03, 0.04, thep, c, bevel=0.005)                  # cổ búa (thân đầu)
        K.cyl('dc_bua_mat_khoi', 0, 0.29, 0.04, 0.0235, 0.04, thep, c, seg=20)                              # khối mặt đập (đầu tròn to, đối xứng với móng)
        K.cyl('dc_bua_vat_mat', 0, 0.29, 0.08, 0.0235, 0.008, thep, c, seg=20, r2=0.02)                    # vát mép mặt đập
        K.cyl('dc_bua_mat_dap', 0, 0.29, 0.088, 0.02, 0.002, sang, c, seg=20)                               # mặt đập bóng
        K.box('dc_bua_nem', -0.0125, 0.0125, 0.284, 0.296, 0.04, 0.043, mat('#3b3f44', 0.4, 0.8), c)         # nêm chốt đầu cán
        N = 8; zc0, zc1 = -0.03, -0.125                                                                    # móng nhổ đinh: thon dần, cong về phía cán, chẻ đôi
        for k in range(N):
            t0, t1 = k / N, (k + 1) / N; tm = (t0 + t1) / 2
            za, zb = zc0 + (zc1 - zc0) * t0, zc0 + (zc1 - zc0) * t1 - 0.004
            ym = 0.29 - 0.03 * tm * tm; day = 0.044 * (1 - tm) + 0.007 * tm; rong = 0.0145 * (1 - 0.55 * tm)
            goc = math.atan(-0.03 * 2 * tm / abs(zc1 - zc0))
            if tm < 0.3: K.box(f'dc_bua_nhanh_{k}', -rong, rong, ym - day / 2, ym + day / 2, zb, za, thep, c, rot=(goc, 0, 0))
            else:
                khe = 0.0025 + 0.003 * (tm - 0.3)
                for sx in (-1, 1): K.box(f'dc_bua_nhanh_{sx}_{k}', min(sx * khe, sx * rong), max(sx * khe, sx * rong), ym - day / 2, ym + day / 2, zb, za, thep, c, rot=(goc, 0, 0))
        K.box('dc_bua_gi', -0.015, 0.015, 0.275, 0.29, 0.0, 0.03, gi, c)                                    # vệt gỉ ở cổ
        K.cyl('dc_bua_duoi_loe', 0, 0.0, 0.019, 0.022, 0.012, cao_su, c, seg=16, rot=(math.radians(-90), 0, 0))  # đuôi cán loe chống tuột
        chu('dc_bua_chu', 'STEEL 500g', 0, 0.1, 0.0392, 0.009, mat('#2a2a2a', 0.7), c, 'LiberationSans-Bold.ttf', 'CENTER', rot=(0, 0, math.radians(90)))
        for i in range(5): K.sphere(f'dc_bua_gi_dom_{i}', random.Random(i).uniform(-0.017, 0.017), 0.276 + 0.006 * i, random.Random(i + 9).uniform(-0.03, 0.07), 0.0035, gi, c, seg=6)
        grip('bua', 0, 0.08, 0.02, c)
    g = _nhom('bua_cao_su', at, rz, t.moi, c)
    g.rotation_euler = (0, math.radians(-90), rz); g.location = (at[0], at[1], at[2] + 0.022)   # nằm nghiêng như búa đặt trên sàn: đầu búa nằm ngang
    return g


def hop_xoi(c, at, rz=0.0, do=False):
    """Hộp xôi trắng hành phi (hộp xốp nắp liền). do=True: hộp lật nghiêng trên sàn, xôi + hành văng tung toé (cảnh 2.4)."""
    rnd = random.Random(8)
    with _tao(c) as t:
        xop = matt('#e8ebed', 0.9, 0.05, 0.35, 90); xoi = mat('#e6d49a', 0.38); hanh = mat('#9a5a22', 0.6); mo = mat('#e9c46a', 0.4)
        L, Wd, Hh = 0.17, 0.13, 0.05
        if not do:
            K.box('dc_xoi_hop', -L / 2, L / 2, -Wd / 2, Wd / 2, 0, Hh, xop, c, bevel=0.006)
            K.box('dc_xoi_long', -L / 2 + 0.006, L / 2 - 0.006, -Wd / 2 + 0.006, Wd / 2 - 0.006, Hh - 0.004, Hh + 0.001, xoi, c)
            K.sphere('dc_xoi_u', 0, 0, Hh, 0.06, xoi, c, scale=(1.3, 1, 0.35), seg=16)
            K.box('dc_xoi_ban_le', -L / 2, L / 2, Wd / 2 - 0.003, Wd / 2 + 0.003, Hh - 0.008, Hh + 0.002, xop, c)      # bản lề liền thân hộp
            al = math.radians(62); nap = K.box('dc_xoi_nap', -L / 2, L / 2, -Wd / 2, Wd / 2, -0.0035, 0.0035, xop, c, bevel=0.003, rot=(al, 0, 0))   # nắp lật dựng ra sau, xoay quanh đúng mép bản lề
            nap.location = (0, Wd / 2 + 0.002 + math.cos(al) * Wd / 2, Hh - 0.002 + math.sin(al) * Wd / 2)
            for i in range(40):
                a = rnd.uniform(0, 6.28); r = rnd.uniform(0, 0.06)
                K.box(f'dc_xoi_hanh_{i}', -0.005, 0.005, -0.003, 0.003, 0, 0.002, hanh, c, rot=(0, 0, a)).location = (r * math.cos(a) * 1.2, r * math.sin(a) * 0.8, Hh + 0.018 + rnd.uniform(0, 0.004))
            K.sphere('dc_xoi_mo_hanh', 0.02, -0.01, Hh + 0.02, 0.012, mo, c, scale=(1.5, 1, 0.3), seg=10)
            hat = K.coll('_hat2'); me_h = K.gop('dc_mau_hat_xoi_mat', [K.sphere('h', 0, 0, 0, 0.0042, xoi, hat, scale=(1.7, 1, 0.8), seg=6)]); bpy.data.collections.remove(hat)
            for i in range(120):   # hạt nếp rời trên mặt xôi (mặt không còn là khối trơn)
                a = rnd.uniform(0, 6.28); r = 0.06 * math.sqrt(rnd.random())
                K.inst(f'dc_xoi_hat_mat_{i}', me_h, (1.25 * r * math.cos(a), 0.85 * r * math.sin(a), Hh + 0.019 * (1 - (r / 0.06) ** 2) + 0.002), c, rot=(rnd.uniform(-0.4, 0.4), 0, rnd.uniform(0, 6.3)))
            for i in range(10):    # hành phi khoanh tròn
                a = rnd.uniform(0, 6.28); r = rnd.uniform(0, 0.045)
                h_ = bpy.data.curves.new(f'dc_xoi_khoanh_{i}', 'CURVE'); h_.dimensions = '3D'; h_.bevel_depth = 0.0012; sp = h_.splines.new('POLY'); sp.points.add(9); sp.use_cyclic_u = True
                for j, p_ in enumerate(sp.points): b_ = 2 * math.pi * j / 10; p_.co = (r * math.cos(a) + 0.005 * math.cos(b_), r * math.sin(a) + 0.004 * math.sin(b_), Hh + 0.021, 1)
                h_.materials.append(hanh); c.objects.link(bpy.data.objects.new(f'dc_xoi_khoanh_{i}', h_))
            thia = mat('#f7f4ee', 0.3)
            K.box('dc_xoi_can_thia', 0.03, 0.11, 0.06, 0.068, 0.051, 0.054, thia, c, rot=(0, 0, 0.35))
            K.sphere('dc_xoi_long_thia', 0.025, 0.045, Hh + 0.012, 0.012, thia, c, scale=(1.3, 1, 0.3), seg=12)
            K.box('dc_xoi_chun', L / 2 - 0.004, L / 2 + 0.002, -Wd / 2 - 0.002, Wd / 2 + 0.002, 0.018, 0.022, mat('#d93b3b', 0.5), c)   # dây chun đỏ tuột xuống thành hộp
            K.box('dc_xoi_giay_an', -L / 2 - 0.07, -L / 2 - 0.005, -0.04, 0.03, 0, 0.002, matt('#fbfaf6', 0.95, 0.05, 0.4, 120), c, rot=(0, 0, 0.2))
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
        K.box('dc_thuoc_nap_gai', -0.06, 0.06, -0.0352, -0.034, 0.122, 0.13, mat('#2f6f3d', 0.5), c)           # mép nắp gài
        K.box('dc_thuoc_dai', -0.06, 0.06, -0.0355, -0.035, 0.0, 0.025, mat('#f2c230', 0.5), c)                  # dải vàng chân hộp
        for i in range(16): K.box(f'dc_thuoc_vach_{i}', 0.035 + 0.0012 * i * (1 + i % 3 * 0.5), 0.0355 + 0.0012 * i * (1 + i % 3 * 0.5), 0.0352, 0.0356, 0.02, 0.04, mat('#111111', 0.6), c)  # mã vạch mặt sau
        K.box('dc_thuoc_ma_vach_nen', 0.03, 0.058, 0.0351, 0.0352, 0.015, 0.045, trang, c)
        bac = mat('#c9ccd0', 0.25, 0.9)
        K.box('dc_vi_thuoc', 0.075, 0.155, -0.04, 0.01, 0, 0.002, bac, c, rot=(0, 0, 0.25))                       # vỉ thuốc bóc dở cạnh hộp
        for i in range(2):
            for j in range(5):
                v_ = Matrix.Rotation(0.25, 3, 'Z') @ Vector((0.087 + 0.014 * j, -0.028 + 0.025 * i, 0)); da_boc = (i == 0 and j < 2)
                K.sphere(f'dc_vien_{i}_{j}', v_.x, v_.y, 0.002, 0.0055, mat('#e9e3cf', 0.5) if not da_boc else mat('#7d8896', 0.9), c, scale=(1.4, 1, 0.5), seg=10)
        K.box('dc_bang_dinh_note', -0.012, 0.012, -0.06, -0.04, 0.131, 0.1322, mat('#e8e2c8', 0.2), c, rot=(0, 0, -0.14))
        grip('thuoc', 0, 0, 0.065, c)
    return _nhom('hop_thuoc_khop', at, rz, t.moi, c)


def note_lab402(c, at, rz=0.0):
    with _tao(c) as t:
        K.box('dc_note_lab', -0.045, 0.045, -0.045, 0.045, 0, 0.0008, mat('#ffb3c7', 0.95), c)
        K.box('dc_note_lab_bang_dinh', -0.02, 0.02, 0.038, 0.052, 0.0008, 0.0011, mat('#e8e2c8', 0.2), c, rot=(0, 0, 0.08))
        K.box('dc_note_lab_goc', 0.03, 0.045, -0.045, -0.03, 0.0008, 0.0016, mat('#f095ad', 0.95), c, rot=(0, math.radians(-25), math.radians(45)))
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
        for i in range(4): K.box(f'dc_hd_ke_{i}', -0.045, 0.045, 0.028 - 0.016 * i, 0.0285 - 0.016 * i, 0.0006, 0.0007, mat('#8fb2c4', 0.9), c)
        K.box('dc_hd_nep_gap', -0.05, 0.05, -0.001, 0.001, 0.0006, 0.0008, mat('#b5d0de', 0.95), c)                    # nếp gấp đôi
        K.box('dc_hd_ghim', -0.04, -0.03, 0.068, 0.0695, 0.0006, 0.0014, mat('#b0b4b8', 0.3, 0.9), c)
        K.cyl('dc_hd_dau', 0.03, -0.022, 0.0006, 0.013, 0.0002, mat('#d24a4a', 0.8), c, seg=24)
        chu('dc_hd_chu_dau', 'ĐÃ GHI SỐ', 0.03, -0.024, 0.00085, 0.0045, mat('#f6e3e3', 0.8), c, 'LiberationSans-Bold.ttf', 'CENTER')
        chu('dc_hd_tong', 'TIỀN ĐIỆN: 650.000đ', 0, -0.045, 0.0008, 0.0095, do, c, 'LiberationSans-Bold.ttf', 'CENTER')
        chu('dc_hd_ghi', 'Tháng này dùng nhiều quá nha em!', 0, -0.064, 0.0008, 0.0075, mat('#2a3a8a', 0.8), c, align='CENTER')
    g = _nhom('hoa_don', at, rz, t.moi, c)
    if dung: g.rotation_euler = (math.radians(90), 0, rz); g.location = (at[0], at[1], at[2] + 0.075)
    return g


def dep_to_ong(c, at, rz=0.0):
    """Đôi dép tổ ong: đế hình bàn chân (mũi rộng, eo, gót), quai liền mũi khum tròn phủ 2/3 trước, lưới lỗ lục giác 4 hàng,
    nhựa trắng ố vàng, gót mòn vẹt (đế mỏng hẳn + sẫm màu), mép quai bẩn."""
    with _tao(c) as t:
        nhua = mat('#efe9cc', 0.7); o = mat('#ddd2aa', 0.85); lo = mat('#4a4535', 0.95); ban = mat('#9c9070', 0.9)
        for s_, dx, goc in (('trai', -0.058, 0), ('phai', 0.058, 0)):
            de = de_dep(f'dc_dep_de_{s_}', dx, nhua, c)
            g_ = K.cyl(f'dc_dep_got_mon_{s_}', dx, -0.088, 0.0245, 0.026, 0.0012, o, c, seg=20); g_.scale = (1, 1.35, 1)   # vệt gót mòn sẫm màu trên mặt đế
            # quai liền mũi: nửa ống khum (bán kính 0,045) chạy từ y −0,01 tới mũi, dày 4 mm
            bm = bmesh.new(); seg = 14; ys = [-0.01 + 0.0125 * k for k in range(11)]
            for k, y_ in enumerate(ys):
                sc_ = 1.0 if y_ < 0.08 else max(0.35, 1 - (y_ - 0.08) / 0.06)
                for side in (0, 1):
                    r = _r_quai(y_) - side * 0.004
                    for i in range(seg + 1):
                        a_ = math.pi * i / seg; bm.verts.new((dx + r * math.cos(a_), y_, 0.016 + 0.042 * sc_ * math.sin(a_) * (1 - side * 0.08)))
            bm.verts.ensure_lookup_table(); n_ = seg + 1
            def V(k, side, i): return bm.verts[(k * 2 + side) * n_ + i]
            for k in range(len(ys) - 1):
                for i in range(seg):
                    bm.faces.new((V(k, 0, i), V(k, 0, i + 1), V(k + 1, 0, i + 1), V(k + 1, 0, i)))
                    bm.faces.new((V(k, 1, i + 1), V(k, 1, i), V(k + 1, 1, i), V(k + 1, 1, i + 1)))
            me = bpy.data.meshes.new(f'dc_dep_quai_{s_}'); bm.to_mesh(me); bm.free(); me.materials.append(nhua)
            for p_ in me.polygons: p_.use_smooth = True
            q = bpy.data.objects.new(f'dc_dep_quai_{s_}', me); c.objects.link(q)
            for hang in range(4):          # lỗ lục giác (tổ ong) trên lưng quai
                for j in range(5 if hang % 2 == 0 else 4):
                    a_ = math.radians(35 + 27.5 * j + (13.75 if hang % 2 else 0)); y_ = 0.005 + 0.019 * hang
                    r = _r_quai(y_) + 0.0004
                    h_ = K.cyl(f'dc_dep_lo_{s_}_{hang}_{j}', dx + r * math.cos(a_), y_, 0.016 + 0.042 * math.sin(a_), 0.0058, 0.0015, lo, c, seg=6)
                    h_.rotation_euler = (Vector((math.cos(a_) / r, 0, math.sin(a_) / 0.042)).normalized().to_track_quat('Z', 'Y')).to_euler()
            for o_ in (de, q): o_.rotation_euler = (0, 0, math.radians(goc)); o_.location = (dx * (1 - math.cos(math.radians(goc))), 0, 0)
    return _nhom('dep_to_ong', at, rz, t.moi, c)

def noi_com_dien(c, at, rz=0.0):
    """Nồi cơm điện cũ kiểu nắp rời: thân tròn xoay vai thắt (trắng ngà ố), chân nhựa, vành inox, nắp vòm có núm hơi và quai xách,
    bảng điều khiển trước: cần gạt NẤU + 2 đèn (NẤU đỏ / HÂM cam đang sáng), dây điện, vệt nước cơm khô chảy dọc thân."""
    with _tao(c) as t:
        than = mat('#efe9da', 0.4); o = mat('#d4c391', 0.7); inox = mat('#b6babe', 0.25, 0.9); den = mat('#2b2d31', 0.5)
        tron_xoay('dc_noi_than', [(0.118, 0.012), (0.13, 0.03), (0.135, 0.08), (0.133, 0.16), (0.125, 0.19), (0.122, 0.2)], than, c)
        for i in range(4): K.cyl(f'dc_noi_chan_{i}', 0.09 * math.cos(i * 1.571 + 0.785), 0.09 * math.sin(i * 1.571 + 0.785), 0, 0.016, 0.014, den, c, seg=12)
        tron_xoay('dc_noi_vanh', [(0.122, 0.198), (0.128, 0.2), (0.128, 0.212), (0.12, 0.214)], inox, c, dong_day=False)
        tron_xoay('dc_noi_nap', [(0.126, 0.212), (0.12, 0.235), (0.1, 0.258), (0.06, 0.272), (0.0, 0.276)], than, c, dong_day=False)
        K.cyl('dc_noi_nut_hoi', 0.04, 0.0, 0.266, 0.014, 0.014, inox, c, seg=14)
        for x_ in (-0.06, 0.06): K.cyl(f'dc_noi_chan_quai_{x_}', x_, 0, 0.262, 0.012, 0.012, den, c, seg=10)
        bm = bmesh.new()   # quai xách: cung bán nguyệt
        cu = bpy.data.curves.new('dc_noi_quai', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.006; sp = cu.splines.new('POLY'); sp.points.add(10)
        for i, p_ in enumerate(sp.points): a_ = math.pi * i / 10; p_.co = (-0.06 * math.cos(a_), 0, 0.272 + 0.04 * math.sin(a_), 1)
        cu.materials.append(den); c.objects.link(bpy.data.objects.new('dc_noi_quai', cu))
        K.box('dc_noi_bang_dk', -0.05, 0.05, -0.136, -0.12, 0.035, 0.105, den, c, bevel=0.006)
        K.box('dc_noi_can_gat', -0.012, 0.012, -0.15, -0.13, 0.04, 0.075, mat('#c8342b', 0.4), c, bevel=0.004)
        K.sphere('dc_noi_den_nau', -0.03, -0.137, 0.09, 0.0055, mat('#5a1a1a', 0.4), c, seg=8)
        K.sphere('dc_noi_den_ham', 0.03, -0.137, 0.09, 0.0055, M.emission('dc2_den_ham', '#ffb04a', 3.0), c, seg=8)
        chu('dc_noi_chu_nau', 'NẤU', -0.03, -0.1365, 0.096, 0.007, mat('#e9e6dd', 0.6), c, 'LiberationSans-Bold.ttf', 'CENTER', rot=(math.radians(90), 0, 0))
        chu('dc_noi_chu_ham', 'HÂM', 0.03, -0.1365, 0.096, 0.007, mat('#e9e6dd', 0.6), c, 'LiberationSans-Bold.ttf', 'CENTER', rot=(math.radians(90), 0, 0))
        for i, (a_, l) in enumerate(((0.35, 0.09), (0.95, 0.06), (2.4, 0.11), (-1.2, 0.05))):   # vệt nước cơm khô chảy từ vành xuống
            v = K.box(f'dc_noi_vet_{i}', -0.006, 0.006, -0.0015, 0.0015, 0.2 - l, 0.2, o, c); v.location = (0.1345 * math.cos(a_), 0.1345 * math.sin(a_), 0); v.rotation_euler = (0, 0, a_ + math.pi / 2)
        cu2 = bpy.data.curves.new('dc_noi_day', 'CURVE'); cu2.dimensions = '3D'; cu2.bevel_depth = 0.004; sp2 = cu2.splines.new('BEZIER'); sp2.bezier_points.add(2)
        for bp, co in zip(sp2.bezier_points, ((0.0, 0.13, 0.05), (0.12, 0.25, 0.005), (0.3, 0.2, 0.005))): bp.co = co; bp.handle_left_type = bp.handle_right_type = 'AUTO'
        cu2.materials.append(mat('#1b1b1b', 0.6)); c.objects.link(bpy.data.objects.new('dc_noi_day', cu2))
        grip('noi_quai', 0, 0, 0.312, c)
    return _nhom('noi_com_dien', at, rz, t.moi, c)

def thung_mi(c, at, rz=0.0):
    """Thùng carton mì gói (nhãn tự chế, không hãng thật) bóc dở nắp, vài gói lộ ra; cạnh sọt rác đầy vỏ gói gia vị bạc."""
    rnd = random.Random(3)
    with _tao(c) as t:
        cart = matt('#c49a62', 0.9, 0.12, 0.25, 30); do = mat('#d8352a', 0.6); bac = mat('#c9ccd0', 0.25, 0.9); vang = mat('#f6c945', 0.6)
        K.box('dc_mi_thung', -0.2, 0.2, -0.13, 0.13, 0, 0.26, cart, c)
        for ten, (x0, x1, y0, y1), (rx, ry) in (('sau', (-0.2, 0.2, 0.13, 0.25), (-35, 0)), ('truoc', (-0.2, 0.2, -0.25, -0.13), (30, 0)),
                                                ('trai', (-0.32, -0.2, -0.13, 0.13), (0, -40)), ('phai', (0.2, 0.32, -0.13, 0.13), (0, 25))):   # 4 nắp bung
            n_ = K.box(f'dc_mi_nap_{ten}', x0, x1, y0, y1, 0.258, 0.262, cart, c)
            piv = Vector((0 if ten in ('sau', 'truoc') else (-0.2 if ten == 'trai' else 0.2), 0.13 if ten == 'sau' else -0.13 if ten == 'truoc' else 0, 0.26))
            for v in n_.data.vertices: v.co -= piv
            n_.location = piv; n_.rotation_euler = (math.radians(rx), math.radians(ry), 0)
        K.box('dc_mi_bang_keo', -0.2, 0.2, -0.02, 0.02, 0.2595, 0.2615, mat('#d9c48a', 0.3), c)
        K.box('dc_mi_nhan', -0.15, 0.15, -0.131, -0.13, 0.06, 0.2, do, c)
        chu('dc_mi_chu', 'MÌ TÔM\nCHUA CAY', 0, -0.1315, 0.15, 0.04, vang, c, 'LiberationSans-Bold.ttf', 'CENTER', rot=(math.radians(90), 0, 0))
        chu('dc_mi_chu_2', '30 gói × 75g', 0, -0.1315, 0.075, 0.016, mat('#ffffff', 0.6), c, 'LiberationSans-Bold.ttf', 'CENTER', rot=(math.radians(90), 0, 0))
        for i in range(5): K.box(f'dc_mi_goi_{i}', -0.18 + 0.075 * i, -0.12 + 0.075 * i, -0.1, 0.1, 0.2, 0.235 + 0.01 * (i % 2), do, c, rot=(0, math.radians(rnd.uniform(-8, 8)), 0))
        for i in range(40): K.box(f'dc_mi_song_{i}', -0.2 + 0.01 * i, -0.196 + 0.01 * i, -0.1312, -0.13, 0.255, 0.26, mat('#a37d4c', 0.9), c)   # sóng carton mép trên
        K.cyl('dc_mi_hinh_to', -0.09, -0.1312, 0.12, 0.035, 0.0005, mat('#f2f2ee', 0.6), c, seg=24, rot=(math.radians(90), 0, 0))
        K.cyl('dc_mi_hinh_soi', -0.09, -0.1318, 0.125, 0.026, 0.0005, mat('#e9c46a', 0.6), c, seg=24, rot=(math.radians(90), 0, 0))
        for i in range(3): K.sphere(f'dc_mi_hinh_tom_{i}', -0.105 + 0.015 * i, -0.132, 0.13, 0.006, mat('#f08a5d', 0.5), c, scale=(1.4, 0.3, 1), seg=8)
        chu('dc_mi_hsd', 'HSD: 05/2027', 0.15, -0.1315, 0.035, 0.009, mat('#3a2a1a', 0.8), c, 'LiberationSans-Bold.ttf', 'CENTER', rot=(math.radians(90), 0, 0))
        goi = K.box('dc_mi_goi_le', -0.08, 0.08, -0.055, 0.055, 0, 0.022, do, c, bevel=0.008); goi.location = (-0.05, -0.27, 0); goi.rotation_euler = (0, 0, 0.3)   # 1 gói rơi ra
        tx = chu('dc_mi_goi_chu', 'TÔM CHUA CAY', 0, 0, 0, 0.016, vang, c, 'LiberationSans-Bold.ttf', 'CENTER'); tx.location = (-0.05, -0.27, 0.0235); tx.rotation_euler = (0, 0, 0.3)
        K.box('dc_mi_goi_rach', -0.13, -0.05, -0.31, -0.24, 0.0225, 0.024, mat('#f6c945', 0.6), c, rot=(0, 0, 0.3))
        for i in range(12): K.cyl(f'dc_mi_soi_{i}', -0.12 + 0.006 * i, -0.3 + 0.004 * i, 0.024, 0.0018, 0.03, mat('#e3c27a', 0.6), c, seg=4, rot=(math.radians(90), 0, 0.3 + 0.2 * math.sin(i)))
        K.cyl('dc_mi_sot_rac', 0.33, -0.02, 0, 0.12, 0.28, mat('#4a7a5a', 0.6), c, seg=20, r2=0.14)
        for i in range(22):
            a = rnd.uniform(0, 6.28); r = rnd.uniform(0, 0.11)
            K.box(f'dc_mi_vo_gv_{i}', -0.02, 0.02, -0.014, 0.014, 0, 0.002, bac, c, rot=(rnd.uniform(-0.5, 0.5), rnd.uniform(-0.5, 0.5), a)).location = (0.33 + r * math.cos(a), -0.02 + r * math.sin(a), 0.28 + rnd.uniform(0, 0.05))
    return _nhom('thung_mi', at, rz, t.moi, c)


def chau_quan_ao(c, at, rz=0.0):
    """Chậu nhựa đỏ đựng quần áo ngâm bột giặt 3 hôm: nước xám đục, bọt váng, mép áo ướt sẫm thò ra ngoài."""
    rnd = random.Random(5)
    with _tao(c) as t:
        nhua = mat('#c8342b', 0.4); nuoc = mat('#8d8b7a', 0.35); bot = mat('#e6e3d8', 0.7)
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
            ao = K.box(f'dc_chau_ao_{i}', -0.09, 0.09, -0.06, 0.06, -0.012, 0.012, mat(mau, 0.55), c); ao.location = (rnd.uniform(-0.08, 0.08), rnd.uniform(-0.08, 0.08), 0.155 + 0.008 * i)
            ao.rotation_euler = (rnd.uniform(-0.3, 0.3), rnd.uniform(-0.3, 0.3), rnd.uniform(0, 3)); _mem(ao, 2)
            for v in ao.data.vertices: v.co.z += 0.008 * math.sin(v.co.x * 60) * math.cos(v.co.y * 50)   # nếp nhăn vải
        K.box('dc_chau_tay_ao', 0.2, 0.36, -0.03, 0.03, 0.17, 0.19, mat('#2b3a55', 0.5), c, rot=(0, math.radians(35), 0))
        for i in range(24):
            a = rnd.uniform(0, 6.28); r = rnd.uniform(0.05, 0.22)
            K.sphere(f'dc_chau_bot_{i}', r * math.cos(a), r * math.sin(a), 0.166, rnd.uniform(0.008, 0.02), bot, c, seg=8)
        for sx in (-1, 1): K.box(f'dc_chau_quai_{sx}', sx * 0.255 - 0.012, sx * 0.255 + 0.012, -0.05, 0.05, 0.17, 0.2, nhua, c, bevel=0.005)
        bot_giat = _mem(K.box('dc_bot_giat', 0.3, 0.42, -0.05, 0.05, 0.0, 0.2, matt('#2a6fd6', 0.5, 0.08, 0.1, 50), c), 1)
        chu('dc_bot_giat_chu', 'BỘT GIẶT\n3kg', 0.36, -0.0515, 0.13, 0.016, mat('#ffffff', 0.5), c, 'LiberationSans-Bold.ttf', 'CENTER', rot=(math.radians(90), 0, 0))
        K.box('dc_ban_chai', -0.06, 0.06, -0.34, -0.3, 0.0, 0.02, mat('#f2b705', 0.5), c, bevel=0.006)
        for i in range(10): K.cyl(f'dc_long_chai_{i}', -0.05 + 0.011 * i, -0.32, 0.02, 0.003, 0.012, mat('#f2f2ee', 0.6), c, seg=4)
        grip('chau_mieng', 0.25, 0, 0.2, c)
    return _nhom('chau_quan_ao', at, rz, t.moi, c)


def _loft(ten, st, m, c, n=16, mem=True):
    """Đùn mặt cắt elip theo các trạm st=[(y, cx, cz, rx, rz)] dọc trục y (hai đầu bịt kín) → khối tròn liền, không ghép hộp."""
    bm = bmesh.new()
    for (y, cx, cz, rx, rz_) in st:
        for i in range(n): a_ = 2 * math.pi * i / n; bm.verts.new((cx + rx * math.cos(a_), y, cz + rz_ * math.sin(a_)))
    bm.verts.ensure_lookup_table()
    for k in range(len(st) - 1):
        for i in range(n): bm.faces.new((bm.verts[k * n + i], bm.verts[k * n + (i + 1) % n], bm.verts[(k + 1) * n + (i + 1) % n], bm.verts[(k + 1) * n + i]))
    bm.faces.new([bm.verts[i] for i in reversed(range(n))]); bm.faces.new([bm.verts[(len(st) - 1) * n + i] for i in range(n)])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(ten); bm.to_mesh(me); bm.free(); me.materials.append(m)
    for p_ in me.polygons: p_.use_smooth = mem
    ob = bpy.data.objects.new(ten, me); c.objects.link(ob); return ob


def dao_got(c, at, rz=0.0):
    """Dao gọt hoa quả cán nhựa vàng (giấu dưới mép nệm). Nằm dọc y, mũi dao ở +y. Cán tròn bầu + khâu thép + lưỡi cong cùng một trục (z = 0,009)."""
    with _tao(c) as t:
        vang = mat('#f2b705', 0.4); thep = mat('#c9ced3', 0.22, 0.95); khau = mat('#9aa0a6', 0.3, 0.9); gi = mat('#7a4a28', 0.9)
        ZC = 0.009
        _loft('dc_dao_can', [(0.0, 0, ZC, 0.003, 0.003), (0.004, 0, ZC, 0.0090, 0.0078), (0.02, 0, ZC, 0.0112, 0.0090), (0.05, 0, ZC, 0.0122, 0.0094),
                             (0.08, 0, ZC, 0.0112, 0.0088), (0.095, 0, ZC, 0.0100, 0.0078)], vang, c)                    # cán: đuôi bo tròn, giữa phình, cổ thon
        _loft('dc_dao_khau', [(0.094, 0, ZC, 0.0104, 0.0082), (0.106, 0, ZC, 0.0104, 0.0082)], khau, c)                    # khâu thép nối cán–lưỡi (ôm sát đầu cán)
        ys = [0.105, 0.115, 0.13, 0.145, 0.16, 0.172, 0.183, 0.192, 0.2]
        xe = [0.0100, 0.0105, 0.0108, 0.0104, 0.0092, 0.0072, 0.0046, 0.0018, -0.0080]; xs = -0.0080
        bm = bmesh.new(); st = []
        for y, e in zip(ys, xe):
            h = 0.0017 - 0.0013 * (y - 0.105) / 0.095
            st.append((bm.verts.new((xs, y, ZC + h)), bm.verts.new((xs, y, ZC - h)), bm.verts.new((e, y, ZC))))
        for (A0, B0, C0), (A1, B1, C1) in zip(st[:-1], st[1:]):
            for q in ((A0, A1, C1, C0), (C0, C1, B1, B0), (B0, B1, A1, A0)):
                try: bm.faces.new(q)
                except ValueError: bm.faces.new([v for i, v in enumerate(q) if v not in q[:i]])
        bm.faces.new(st[0]); bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        me = bpy.data.meshes.new('dc_dao_luoi'); bm.to_mesh(me); bm.free(); me.materials.append(thep)
        c.objects.link(bpy.data.objects.new('dc_dao_luoi', me))                                                               # lưỡi: sống dày, mép mỏng, mũi nhọn
        for i in range(2): K.sphere(f'dc_dao_dinh_{i}', 0, 0.032 + 0.036 * i, ZC + 0.0090, 0.0034, khau, c, scale=(1, 1, 0.35), seg=10)   # đinh tán nằm trên mặt cán
        for i in range(4): K.sphere(f'dc_dao_gi_{i}', -0.003 + 0.003 * i, 0.125 + 0.012 * i, ZC + 0.0016 - 0.0002 * i, 0.0013, gi, c, seg=6)
        grip('dao', 0, 0.05, ZC, c)
    return _nhom('dao_got', at, rz, t.moi, c)


def tuyp_dau(c, at, rz=0.0):
    with _tao(c) as t:
        xanh = mat('#2f8f6a', 0.4); trang = mat('#f2f2ee', 0.5)
        K.cyl('dc_tuyp_than', 0, 0, 0.012, 0.016, 0.1, xanh, c, seg=16, rot=(math.radians(-90), 0, 0))
        K.box('dc_tuyp_duoi', -0.019, 0.019, 0.1, 0.112, 0.008, 0.016, xanh, c)
        K.cyl('dc_tuyp_nap', 0, 0, 0.012, 0.01, 0.022, trang, c, seg=12, rot=(math.radians(90), 0, 0))
        chu('dc_tuyp_chu', 'DẦU XOA BÓP', 0.0, 0.05, 0.0285, 0.0075, trang, c, 'LiberationSans-Bold.ttf', 'CENTER', rot=(0, 0, math.radians(90)))
        for i in range(9): K.box(f'dc_tuyp_rang_{i}', -0.019 + 0.0042 * i, -0.017 + 0.0042 * i, 0.108, 0.113, 0.0075, 0.0165, mat('#24735a', 0.4), c)   # mép đuôi răng cưa
        K.cyl('dc_tuyp_bang_nhan', 0, 0.035, 0.012, 0.0162, 0.035, trang, c, seg=16, rot=(math.radians(-90), 0, 0))
        chu('dc_tuyp_chu2', 'Xoa bóp · Nhức mỏi', 0.0, 0.052, 0.0285, 0.0055, xanh, c, 'LiberationSans-Bold.ttf', 'CENTER', rot=(0, 0, math.radians(90)))
        for i in range(10): a_ = 2 * math.pi * i / 10; K.box(f'dc_tuyp_gan_{i}', -0.0008, 0.0008, -0.022, -0.001, -0.0008, 0.0008, trang, c).location = (0.0102 * math.cos(a_), 0, 0.012 + 0.0102 * math.sin(a_))
        K.box('dc_tuyp_bop_lom', -0.017, 0.017, 0.07, 0.09, 0.022, 0.025, mat('#24735a', 0.4), c)               # chỗ bóp lõm
        grip('tuyp', 0, 0.05, 0.012, c)
    return _nhom('tuyp_dau', at, rz, t.moi, c)


def chia_khoa(c, at, rz=0.0):
    """Chùm 2 chìa khoá (đồng + bạc) xỏ vòng thép, kèm thẻ nhựa xanh ghi số phòng 201. Chìa: tay cầm có lỗ, cổ, thân răng cưa."""
    with _tao(c) as t:
        dong = mat('#c9a64a', 0.3, 0.9); bac = mat('#b0b4b8', 0.3, 0.9); lo = mat('#7d8896', 0.85)
        bm = bmesh.new(); bmesh.ops.create_circle(bm, cap_ends=False, segments=24, radius=0.018)
        cu = bpy.data.curves.new('dc_khoa_vong', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.0015; sp = cu.splines.new('POLY'); sp.points.add(23); sp.use_cyclic_u = True
        for i, p_ in enumerate(sp.points): a_ = 2 * math.pi * i / 24; p_.co = (0.018 * math.cos(a_), 0.018 * math.sin(a_), 0.0015, 1)
        cu.materials.append(bac); c.objects.link(bpy.data.objects.new('dc_khoa_vong', cu)); bm.free()
        for i, (goc, m_) in enumerate(((20, dong), (-35, bac))):
            parts = []
            parts.append(K.cyl(f'dc_khoa_dau_{i}', 0.0, 0, 0, 0.013, 0.0025, m_, c, seg=20))                  # tay cầm tròn
            parts.append(K.cyl(f'dc_khoa_lo_{i}', 0.0, 0, 0.0026, 0.0035, 0.0003, mat('#22252a', 0.8), c, seg=12))
            parts.append(K.box(f'dc_khoa_co_{i}', 0.012, 0.02, -0.004, 0.004, 0, 0.0025, m_, c))
            parts.append(K.box(f'dc_khoa_than_{i}', 0.02, 0.062, -0.0035, 0.0035, 0, 0.0025, m_, c))
            for k in range(5): parts.append(K.box(f'dc_khoa_rang_{i}_{k}', 0.026 + 0.0075 * k, 0.031 + 0.0075 * k, -0.0035 - (0.003 if k % 2 else 0.0015), -0.0035, 0, 0.0025, m_, c))
            g = bpy.data.objects.new(f'dc_khoa_{i}', None); c.objects.link(g)
            for o_ in parts: o_.parent = g
            g.location = (0.018 * math.cos(math.radians(goc)) + 0.012 * math.cos(math.radians(goc)), 0.03 * math.sin(math.radians(goc)), 0); g.rotation_euler = (0, 0, math.radians(goc))
        K.box('dc_khoa_the', -0.014, 0.014, -0.058, -0.016, 0, 0.004, mat('#2a6fd6', 0.5), c, bevel=0.003)
        K.cyl('dc_khoa_lo_the', 0, -0.021, 0.0041, 0.0025, 0.0003, mat('#22252a', 0.8), c, seg=10)
        chu('dc_khoa_so', '201', 0, -0.044, 0.0042, 0.013, mat('#ffffff', 0.6), c, 'LiberationSans-Bold.ttf', 'CENTER')
        grip('khoa', 0.04, 0.02, 0.002, c)
    return _nhom('chia_khoa', at, rz, t.moi, c)

def ba_lo(c, at, rz=0.0):
    """Ba lô vải xanh rêu dáng tròn (làm mềm): thân, túi trước có khoá kéo + tay kéo, 2 túi lưới hông (một bên cắm chai nước),
    quai đeo đệm dày cong ra sau, quai xách trên, miếng logo vải, đường may viền."""
    with _tao(c) as t:
        vai = mat('#3d4a35', 0.9); vai_toi = mat('#2a3325', 0.9); kh = mat('#141414', 0.6); keo = mat('#b0b4b8', 0.3, 0.9); luoi = mat('#1f2a1f', 0.95)
        _mem(K.box('dc_balo_than', -0.15, 0.15, -0.085, 0.085, 0.0, 0.43, vai, c), 2)
        _mem(K.box('dc_balo_tui_truoc', -0.115, 0.115, -0.125, -0.07, 0.04, 0.24, vai_toi, c), 2)
        K.box('dc_balo_keo_than', -0.13, 0.13, -0.0905, -0.088, 0.33, 0.336, keo, c)
        K.box('dc_balo_keo_tui', -0.1, 0.1, -0.1265, -0.124, 0.215, 0.221, keo, c)
        for i, (x_, z_) in enumerate(((0.12, 0.333), (0.09, 0.218))):
            K.box(f'dc_balo_tay_keo_{i}', x_ - 0.006, x_ + 0.006, -0.135 if i else -0.1, -0.124 if i else -0.088, z_ - 0.035, z_, kh, c)
        for sx in (-1, 1):
            _mem(K.box(f'dc_balo_tui_hong_{sx}', sx * 0.15 - 0.03, sx * 0.15 + 0.03, -0.06, 0.06, 0.03, 0.17, luoi, c), 1)
        tron_xoay('dc_balo_chai', [(0.03, 0.0), (0.032, 0.02), (0.032, 0.19), (0.016, 0.22), (0.016, 0.24)], mat('#7fb6d6', 0.15), c, seg=16, x=0.165, y=0.0, z=0.06)
        K.cyl('dc_balo_nap_chai', 0.165, 0.0, 0.3, 0.017, 0.02, mat('#2a6fd6', 0.4), c, seg=12)
        for sx in (-0.075, 0.075):   # quai đeo đệm dày cong ra sau lưng
            cu = bpy.data.curves.new(f'dc_balo_quai_{sx}', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.022; cu.bevel_resolution = 2; sp = cu.splines.new('BEZIER'); sp.bezier_points.add(2)
            for bp, co in zip(sp.bezier_points, ((sx, 0.09, 0.4), (sx * 1.2, 0.17, 0.22), (sx * 1.4, 0.1, 0.04))): bp.co = co; bp.handle_left_type = bp.handle_right_type = 'AUTO'
            cu.materials.append(kh); ob = bpy.data.objects.new(f'dc_balo_quai_{sx}', cu); ob.scale = (1, 0.45, 1); c.objects.link(ob)
        cu = bpy.data.curves.new('dc_balo_quai_xach', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.008; sp = cu.splines.new('POLY'); sp.points.add(6)
        for i, p_ in enumerate(sp.points): a_ = math.pi * i / 6; p_.co = (-0.04 * math.cos(a_), 0.02, 0.43 + 0.035 * math.sin(a_), 1)
        cu.materials.append(kh); c.objects.link(bpy.data.objects.new('dc_balo_quai_xach', cu))
        K.box('dc_balo_logo', -0.03, 0.03, -0.1275, -0.125, 0.15, 0.18, mat('#c9a23a', 0.7), c)
        chu('dc_balo_chu_logo', 'K66', 0, -0.1278, 0.158, 0.014, kh, c, 'LiberationSans-Bold.ttf', 'CENTER', rot=(math.radians(90), 0, 0))
        grip('balo', 0, 0.02, 0.47, c)
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
        for i in range(6): K.box(f'dc_gt_mep_giay_{i}', 0.0872, 0.0874, -0.116, 0.116, 0.005 + 0.004 * i, 0.0055 + 0.004 * i, mat('#d8d2c2', 0.9), c)   # vân mép giấy
        K.box('dc_gt_gay', -0.087, -0.083, -0.12, 0.12, 0.0, 0.032, mat('#163d6c', 0.6), c, bevel=0.002)
        K.box('dc_gt_ruy_bang', 0.03, 0.036, -0.12, -0.085, 0.031, 0.0325, mat('#c62828', 0.6), c)
        K.cyl('dc_but_bi', 0.15, -0.14, 0.006, 0.005, 0.14, mat('#2a6fd6', 0.4), c, seg=10, rot=(0, math.radians(90), 0.4))
        K.cyl('dc_but_da_quang', 0.3, 0.02, 0.009, 0.009, 0.12, mat('#e8f23a', 0.45), c, seg=12, rot=(math.radians(90), 0, 0.2))
        K.cyl('dc_vet_ca_phe', 0.24, 0.06, 0.0014, 0.03, 0.0002, mat('#b08a5a', 0.9), c, seg=28)
        K.cyl('dc_vet_ca_phe_trong', 0.24, 0.06, 0.0015, 0.026, 0.0002, mat('#f3efe4', 0.9), c, seg=28)
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
    m_ = _mat_anh(ui.split('.')[0], ui, sang); ngang = m_.node_tree.nodes['Image Texture'].image.size[0] > m_.node_tree.nodes['Image Texture'].image.size[1]
    with _tao(c) as t:   # ảnh ngang (game) → máy cầm NGANG: thân xoay 90°, màn trải theo trục x
        if ngang:
            K.box('dc_dt_than', -0.076, 0.076, -0.037, 0.037, 0, 0.008, mat('#2b2d31', 0.35, 0.6), c, bevel=0.004)
            _mat_phang_uv('dc_dt_man', -0.0725, 0.0725, -0.0345, 0.0345, 0.0082, m_, c)
        else:
            K.box('dc_dt_than', -0.037, 0.037, -0.076, 0.076, 0, 0.008, mat('#2b2d31', 0.35, 0.6), c, bevel=0.004)
            _mat_phang_uv('dc_dt_man', -0.0345, 0.0345, -0.0725, 0.0725, 0.0082, m_, c)
        if ngang:
            for i, x_ in enumerate((-0.02, 0.01)): K.box(f'dc_dt_nut_{i}', x_, x_ + 0.02, 0.037, 0.039, 0.003, 0.006, mat('#5d6166', 0.3, 0.9), c)
            K.cyl('dc_dt_loa', 0.074, 0, 0.0081, 0.0008, 0.0002, mat('#111111', 0.5), c, seg=6)
        else:
            for i, y_ in enumerate((0.02, 0.045)): K.box(f'dc_dt_nut_{i}', 0.037, 0.039, y_, y_ + 0.018, 0.003, 0.006, mat('#5d6166', 0.3, 0.9), c)
        K.box('dc_dt_vien', -0.0375 if not ngang else -0.0765, 0.0375 if not ngang else 0.0765, -0.0765 if not ngang else -0.0375, 0.0765 if not ngang else 0.0375, 0.0035, 0.0045, mat('#9aa0a6', 0.25, 0.95), c)
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
        for r_ in range(5):
            for k_ in range(14): K.box(f'dc_lt_phim_{r_}_{k_}', -0.133 + 0.0192 * k_, -0.118 + 0.0192 * k_, 0.07 - 0.019 * r_, 0.085 - 0.019 * r_, 0.0165, 0.0185, mat('#1b1c1f', 0.55), c)
        K.box('dc_lt_space', -0.05, 0.05, -0.025, -0.012, 0.0165, 0.0185, mat('#1b1c1f', 0.55), c)
        for i, (x_, mau) in enumerate(((0.08, '#e94f37'), (0.11, '#44bba4'))): K.cyl(f'dc_lt_sticker_{i}', x_, -0.085, 0.0162, 0.012, 0.0003, mat(mau, 0.6), c, seg=16)
        K.sphere('dc_lt_den_nguon', 0.14, -0.105, 0.012, 0.002, M.emission('dc2_den_lt', '#7fffb0', 3.0), c, seg=6)
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


THE = [('Búa cán cao su', bua_cao_su, {}), ('Hộp xôi', hop_xoi, {}), ('Xôi bị hất', hop_xoi, {'do': True}), ('Thuốc + note mẹ', hop_thuoc_khop, {}),
       ('Note Lab 402', note_lab402, {}), ('Hoá đơn 650k', hoa_don, {}), ('Dép tổ ong', dep_to_ong, {}), ('Nồi cơm điện', noi_com_dien, {}),
       ('Thùng mì + sọt rác', thung_mi, {}), ('Chậu đồ ngâm', chau_quan_ao, {}), ('Dao gọt', dao_got, {}), ('Tuýp dầu', tuyp_dau, {}),
       ('Chìa khoá', chia_khoa, {}), ('Ba lô', ba_lo, {}), ('Giáo trình + ghi chép', giao_trinh, {}), ('ĐT: Mẹ gọi', dien_thoai, {'ui': 'UI-05_me-goi-video.png'}),
       ('ĐT ngang: game', dien_thoai, {'ui': 'UI-09_game-moba-thua-ngang.png'}), ('Laptop: tiểu luận', laptop, {})]


def the_dao_cu(out_dir, w=480, mau=24):
    """Render TỪNG đạo cụ một ảnh riêng (camera tự canh theo hộp bao, góc 3/4 từ trên) rồi ghép bảng có nhãn → dễ nhận ra từng món."""
    import subprocess
    sc = bpy.context.scene; c = bpy.data.collections['Dao_cu_moi']; files = []
    goc = []
    for i, (nhan, fn, kw) in enumerate(THE):
        g = fn(c, (i * 3.0, 0, 0), **kw); goc.append(g)
        K.box(f'dc_nen_{i}', i * 3.0 - 0.6, i * 3.0 + 0.6, -0.6, 0.6, -0.01, 0.0, mat('#7d8896', 0.85), c)
    bpy.context.view_layer.update()
    cam = K.camera('cam_the', (0, -1, 1), (0, 0, 0), 50); sc.camera = cam
    sc.render.resolution_x, sc.render.resolution_y = w, round(w * 0.75)
    for i, g in enumerate(goc):
        pts = []
        for o in g.children_recursive:
            if o.type in ('MESH', 'CURVE', 'FONT'): pts += [o.matrix_world @ Vector(b) for b in o.bound_box]
        lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts))); hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
        ctr = (lo + hi) / 2; r = max((hi - lo).length / 2, 0.03)
        d = r / math.tan(math.radians(17)) * 1.15
        cam.location = ctr + Vector((0.35, -0.75, 0.62)).normalized() * d; cam.rotation_euler = (ctr - cam.location).to_track_quat('-Z', 'Y').to_euler()
        f = os.path.join(out_dir, f'the_{i:02d}.png'); sc.render.filepath = f; bpy.ops.render.render(write_still=True); files.append((THE[i][0], f))
    args = ['montage', '-font', os.path.join(FD, 'LiberationSans-Bold.ttf')]
    for nhan, f in files: args += ['-label', nhan, f]
    args += ['-font', os.path.join(FD, 'LiberationSans-Bold.ttf'), '-tile', '6x', '-geometry', f'{w // 1}x{round(w * 0.75)}+4+4', '-pointsize', '22', '-background', '#30343c', '-fill', '#ffffff', os.path.join(out_dir, 'THE-DAO-CU.jpg')]
    subprocess.run(args, check=True)


if __name__ == '__main__':
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--bang', action='store_true'); ap.add_argument('--out', default='/tmp/dao_cu_moi.png')
    ap.add_argument('--width', type=int, default=1600); ap.add_argument('--samples', type=int, default=32); ap.add_argument('--cam', default='toan'); ap.add_argument('--the', default='', help='thư mục: render từng đạo cụ một thẻ')
    a = ap.parse_args(argv)
    bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene; c = K.coll('Dao_cu_moi')
    if not a.the: bang(c)
    K.troi('#cfd8e2', '#9fb4cc', 0.6)
    K.area('dc_den_chinh', (1.2, -1.6, 2.2), 3.0, 260, '#fff4e6', rot=(math.radians(40), 0, 0), c=c)
    K.area('dc_den_phu', (1.2, 1.8, 1.6), 3.0, 80, '#dfe8ff', rot=(math.radians(-50), 0, 0), c=c)
    cams = {'toan': ((1.2, -1.55, 1.75), (1.2, 0.0, 0.0), 30), 'gan_trai': ((0.4, -0.95, 0.55), (0.4, -0.3, 0.05), 45), 'gan_phai': ((1.75, -0.95, 0.55), (1.75, -0.4, 0.02), 45),
            'ui': ((2.25, -0.45, 0.5), (2.25, 0.45, 0.12), 35), 'note': ((1.22, -0.72, 0.42), (1.22, -0.42, 0.1), 50)}
    import toi_uu; toi_uu.cau_hinh(sc, 'duyet'); sc.cycles.samples = a.samples; sc.view_settings.view_transform = 'AgX'
    if a.the:
        bpy.data.objects.remove(bpy.data.objects['dc_den_chinh']); bpy.data.objects.remove(bpy.data.objects['dc_den_phu'])
        K.sun('dc_nang_the', (0.4, 0.6, -0.7), 3.5, '#fff4e6', 3.0, c); bpy.context.scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value = 1.0
        os.makedirs(a.the, exist_ok=True); the_dao_cu(a.the); sys.exit(0)
    p, tg, f = cams[a.cam]; sc.camera = K.camera('cam', p, tg, f)
    sc.render.resolution_x = a.width; sc.render.resolution_y = round(a.width / 2.39); sc.render.resolution_percentage = 100
    sc.view_settings.view_transform = 'AgX'; sc.render.filepath = a.out; bpy.ops.render.render(write_still=True)
