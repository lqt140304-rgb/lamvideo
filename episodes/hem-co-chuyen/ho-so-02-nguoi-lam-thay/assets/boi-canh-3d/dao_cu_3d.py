"""Đạo cụ 3D (Hero Props) cho Hồ sơ 02 — dựng bằng khối + tròn xoay (lathe) theo toạ độ thiết kế (mét), mỗi vật có điểm neo tay `grip_*` (Empty).
Chạy bảng đạo cụ: `python dao_cu_3d.py --out dao_cu.png [--width 1400]`. Dùng trong cảnh: `dao_cu_3d.hammer(X, coll, (x, y, z))`…
Quy ước: (x, y, z) là điểm đặt (tâm đáy); `ax`: 'z' (dựng đứng), 'y' hoặc 'x' (nằm dọc trục đó)."""
import bpy, bmesh, math, sys, os, argparse
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
_c = {}


_SEG = {'0': 'abcdef', '1': 'bc', '2': 'abdeg', '3': 'abcdg', '4': 'bcfg', '5': 'acdfg', '6': 'acdefg', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg'}


def digit(X, coll, ch, x, y, z, h, mt, name='so'):
    """Chữ số 7 đoạn nằm trên mặt phẳng z (tờ giấy/màn hình): x ngang, y dọc, cao h, đoạn dày h/9."""
    w = h * 0.55; t = h / 9
    segs = {'a': (0, w, h - t, h), 'g': (0, w, h / 2 - t / 2, h / 2 + t / 2), 'd': (0, w, 0, t), 'f': (0, t, h / 2, h), 'b': (w - t, w, h / 2, h), 'e': (0, t, 0, h / 2), 'c': (w - t, w, 0, h / 2)}
    for sg in _SEG.get(ch, ''):
        x0, x1, y0, y1 = segs[sg]
        X.box(f'env_dc_{name}_{ch}_{sg}', x + x0, x + x1, y + y0, y + y1, z, z + 0.0004, mt, coll=coll)
    return w + t


def text_line(X, coll, s, x, y, z, h, mt, name='txt'):
    cx = x
    for ch in s:
        if ch == ':': 
            for k in (0.3, 0.7): X.box(f'env_dc_{name}_dot{k}', cx + h * 0.05, cx + h * 0.05 + h / 9, y + h * k, y + h * k + h / 9, z, z + 0.0004, mt, coll=coll)
            cx += h * 0.3
        elif ch == '.': X.box(f'env_dc_{name}_cham', cx, cx + h / 9, y, y + h / 9, z, z + 0.0004, mt, coll=coll); cx += h * 0.25
        elif ch == ' ': cx += h * 0.4
        else: cx += digit(X, coll, ch, cx, y, z, h, mt, name) + h * 0.15
    return cx


def lat_y(X, coll, before, cy):
    """Phản xạ y (qua y = cy) mọi đối tượng mới tạo từ lúc `before`: vì toạ độ thiết kế bị đảo x khi ra thế giới và camera phòng nhìn về −y, \
    chữ/giao diện vẽ theo quy ước "trên = +y" phải lật y để người ngồi ghế (y+, nhìn về −y) đọc xuôi."""
    from mathutils import Matrix
    M_ = Matrix.Translation((0, cy, 0)) @ Matrix.Scale(-1, 4, (0, 1, 0)) @ Matrix.Translation((0, -cy, 0))
    for o in list(coll.objects):
        if o not in before:
            o.matrix_world = M_ @ o.matrix_world


def mat(X, color, rough=0.6, metal=0.0):
    k = (color, rough, metal)
    if k not in _c or _c[k].name not in bpy.data.materials: _c[k] = X.M.solid('dc_' + color.strip('#') + f'_{int(rough*10)}_{int(metal*10)}', color, rough, metal)
    return _c[k]


def lathe(X, name, pts, x, y, z, mt, coll, seg=28, smooth=True):
    """Tròn xoay quanh trục z: pts = [(bán kính, cao)…] từ đáy lên miệng."""
    bm = bmesh.new(); rings = []
    for (r, h) in pts:
        rings.append([bm.verts.new((r * math.cos(2 * math.pi * i / seg), r * math.sin(2 * math.pi * i / seg), h)) for i in range(seg)])
    for a in range(len(rings) - 1):
        for i in range(seg):
            try: bm.faces.new((rings[a][i], rings[a][(i + 1) % seg], rings[a + 1][(i + 1) % seg], rings[a + 1][i]))
            except ValueError: pass
    if pts[0][0] > 1e-5:
        try: bm.faces.new(rings[0][::-1])
        except ValueError: pass
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return X._mesh_obj('env_dc_' + name, bm, (X.mx(x), y, z), mt, smooth, coll)


def _grip(X, coll, name, x, y, z):
    e = bpy.data.objects.new('grip_' + name, None); e.empty_display_type = 'ARROWS'; e.empty_display_size = 0.04
    e.location = (X.mx(x), y, z); coll.objects.link(e); return e


class _P:  # bộ vẽ theo trục: u (ngang), v (dọc vật), w (cao/phủ) → x,y,z
    def __init__(s, X, coll, x, y, z, ax): s.X, s.coll, s.x, s.y, s.z, s.ax = X, coll, x, y, z, ax
    def box(s, name, u0, u1, v0, v1, w0, w1, mt, bevel=0.0):
        if s.ax == 'z': a = (s.x + u0, s.x + u1, s.y + w0, s.y + w1, s.z + v0, s.z + v1)  # đứng: v = chiều cao
        elif s.ax == 'y': a = (s.x + u0, s.x + u1, s.y + v0, s.y + v1, s.z + w0, s.z + w1)  # nằm dọc y: w = cao
        else: a = (s.x + v0, s.x + v1, s.y + u0, s.y + u1, s.z + w0, s.z + w1)
        return s.X.box('env_dc_' + name, *a, mt, bevel=bevel, coll=s.coll)


# ---------------------------------------------------------------- búa đinh
def hammer(X, coll, at, ax='y'):
    p = _P(X, coll, *at, ax); wood = mat(X, '#a8774a', 0.7); wood_d = mat(X, '#7a5230', 0.8); iron = mat(X, '#5a5d60', 0.45, 0.8); rust = mat(X, '#7a4a2a', 0.9); steel = mat(X, '#8a8d90', 0.3, 0.9)
    p.box('bua_can', -0.016, 0.016, 0.0, 0.31, -0.012, 0.012, wood, 0.008)               # cán gỗ dẹt, sờn
    p.box('bua_can_duoi', -0.02, 0.02, -0.02, 0.025, -0.015, 0.015, wood, 0.01)           # đuôi cán loe để khỏi tuột tay
    for k in range(9):                                                                     # vân gỗ dọc cán + vết mòn do tay cầm
        p.box(f'bua_van{k}', -0.014 + 0.0035 * k, -0.0125 + 0.0035 * k, 0.03 + 0.012 * (k % 4), 0.28 - 0.015 * (k % 3), 0.0118, 0.0124, wood_d, 0)
    p.box('bua_mon', -0.0165, 0.0165, 0.09, 0.19, 0.0, 0.0125, mat(X, '#c28a58', 0.45), 0.006)  # chỗ tay cầm mòn bóng
    p.box('bua_can_dau', -0.02, 0.02, 0.3, 0.325, -0.016, 0.016, wood, 0.01)
    p.box('bua_nem', -0.004, 0.004, 0.31, 0.335, 0.0165, 0.0185, steel, 0.0)               # nêm sắt chốt đầu búa
    p.box('bua_dau', -0.025, 0.045, 0.315, 0.36, -0.02, 0.02, iron, 0.006)
    p.box('bua_mat', 0.045, 0.068, 0.31, 0.365, -0.026, 0.026, iron, 0.008)
    p.box('bua_mat_vien', 0.0675, 0.0685, 0.3125, 0.3625, -0.0235, 0.0235, steel, 0.0)       # mặt đập sáng do va chạm
    p.box('bua_mong1', -0.06, -0.025, 0.322, 0.352, -0.014, 0.014, iron, 0.005)
    p.box('bua_mong2', -0.085, -0.06, 0.328, 0.346, -0.01, 0.01, iron, 0.004)
    p.box('bua_mong3', -0.1, -0.085, 0.332, 0.342, -0.006, 0.006, iron, 0.003)
    p.box('bua_khe', -0.1, -0.062, 0.3365, 0.3375, -0.007, 0.007, mat(X, '#1d1d1f', 0.8), 0)  # khe móng nhổ đinh
    for k in range(5): p.box(f'bua_ri{k}', -0.02 + 0.014 * k, -0.01 + 0.014 * k, 0.318 + 0.008 * (k % 3), 0.326 + 0.008 * (k % 3), 0.0198, 0.0208, rust, 0)  # gỉ lốm đốm
    _grip(X, coll, 'bua', at[0], at[1], at[2] + 0.1)


# ---------------------------------------------------------------- thẻ CCCD / thẻ sinh viên
def card(X, coll, at, kind='cccd', mole='left'):
    x, y, z = at; blue = mat(X, '#2f7fb8' if kind == 'cccd' else '#1d3a6b', 0.4); white = mat(X, '#f4f4ee', 0.5); ink = mat(X, '#333a44', 0.6); red = mat(X, '#c8352a', 0.5); gold = mat(X, '#d9b24a', 0.3, 0.8)
    X.box('env_dc_the_' + kind, x, x + 0.0856, y, y + 0.054, z, z + 0.001, blue, bevel=0.0006, coll=coll)
    X.box('env_dc_the_vien_' + kind, x + 0.003, x + 0.0826, y + 0.003, y + 0.051, z + 0.001, z + 0.0016, white if kind == 'cccd' else mat(X, '#e4e8f0', 0.5), coll=coll)
    X.box('env_dc_the_dau_' + kind, x + 0.003, x + 0.0826, y + 0.0425, y + 0.051, z + 0.0016, z + 0.0019, blue, coll=coll)                       # dải tiêu đề
    if kind == 'cccd':
        X.sphere('env_dc_quoc_huy', x + 0.012, y + 0.0467, z + 0.002, 0.0028, red, scale=(1, 1, 0.12), coll=coll)                               # quốc huy tròn đỏ + sao vàng
        X.sphere('env_dc_quoc_huy_sao', x + 0.012, y + 0.0467, z + 0.0023, 0.0013, gold, scale=(1, 1, 0.1), coll=coll)
    else:
        X.sphere('env_dc_logo_truong', x + 0.012, y + 0.0467, z + 0.002, 0.0028, mat(X, '#e8b030', 0.4), scale=(1, 1, 0.12), coll=coll)           # logo trường
    text_line(X, coll, '2007', x + 0.026, y + 0.0447, z + 0.0019, 0.0045, white, 'nam_' + kind)
    X.box('env_dc_the_chip_' + kind, x + 0.062, x + 0.074, y + 0.026, y + 0.036, z + 0.0016, z + 0.0021, gold, bevel=0.0008, coll=coll)
    for k in range(3): X.box(f'env_dc_chip_van{kind}{k}', x + 0.062, x + 0.074, y + 0.0285 + 0.0035 * k, y + 0.0292 + 0.0035 * k, z + 0.0021, z + 0.0023, mat(X, '#8a6a20', 0.4, 0.8), coll=coll)
    # ảnh chân dung: nền xanh + vai + đầu + tóc + nốt ruồi
    X.box('env_dc_the_anh_' + kind, x + 0.006, x + 0.028, y + 0.006, y + 0.04, z + 0.0016, z + 0.002, mat(X, '#9fb8d0', 0.6), coll=coll)
    X.sphere('env_dc_anh_vai_' + kind, x + 0.017, y + 0.0075, z + 0.0021, 0.0085, mat(X, '#2d3a4f', 0.7), scale=(1, 0.8, 0.1), coll=coll)
    X.sphere('env_dc_anh_dau_' + kind, x + 0.017, y + 0.022, z + 0.0022, 0.0075, mat(X, '#d9b08c', 0.6), scale=(0.85, 1.05, 0.12), coll=coll)
    X.sphere('env_dc_anh_toc_' + kind, x + 0.017, y + 0.0265, z + 0.0023, 0.0072, mat(X, '#1c1613', 0.7), scale=(0.9, 0.55, 0.12), coll=coll)
    mx_ = x + (0.0128 if mole == 'left' else 0.0212)
    X.sphere('env_dc_not_ruoi_' + kind, mx_, y + 0.0256, z + 0.0026, 0.0007, mat(X, '#1a0f08', 0.5), coll=coll)                                  # nốt ruồi đuôi lông mày
    for i in range(5): X.box(f'env_dc_the_chu_{kind}{i}', x + 0.032, x + 0.058 - 0.003 * (i % 3), y + 0.0345 - i * 0.0055, y + 0.0360 - i * 0.0055, z + 0.0016, z + 0.0019, ink, coll=coll)
    for i in range(6): X.box(f'env_dc_qr_{kind}{i}', x + 0.062 + 0.002 * (i % 3), x + 0.0635 + 0.002 * (i % 3), y + 0.006 + 0.003 * (i // 3), y + 0.0075 + 0.003 * (i // 3), z + 0.0016, z + 0.0019, ink, coll=coll)   # mã QR/vạch
    X.box('env_dc_holo_' + kind, x + 0.074, x + 0.081, y + 0.006, y + 0.0165, z + 0.0016, z + 0.002, mat(X, '#b8d8e8', 0.2, 0.6), coll=coll)    # dải ánh kim
    if kind == 'sv':
        X.box('env_dc_day_deo', x + 0.03, x + 0.036, y + 0.054, y + 0.34, z, z + 0.002, mat(X, '#1d3a6b', 0.7), coll=coll)
        X.box('env_dc_day_kep', x + 0.028, x + 0.038, y + 0.054, y + 0.064, z + 0.0005, z + 0.003, mat(X, '#b9bdbb', 0.3, 0.8), bevel=0.001, coll=coll)
    _grip(X, coll, 'the_' + kind, x + 0.0428, y + 0.027, z + 0.001)


# ---------------------------------------------------------------- phong bì 3 triệu
def envelope(X, coll, at):
    x, y, z = at; paper = mat(X, '#f2efe6', 0.8); money = mat(X, '#3f8fd0', 0.5); ink = mat(X, '#1d4a78', 0.6)
    for i in range(6):
        o = i * 0.004; zz = z + 0.002 + i * 0.0007
        X.box(f'env_dc_tien{i}', x + 0.02 + o, x + 0.17 + o, y + 0.03 + i * 0.006, y + 0.095 + i * 0.006, zz, zz + 0.0006, money, coll=coll)
        X.box(f'env_dc_tien_vien{i}', x + 0.024 + o, x + 0.166 + o, y + 0.034 + i * 0.006, y + 0.09 + i * 0.006, zz + 0.0006, zz + 0.0008, mat(X, '#d8ecf8', 0.5), coll=coll)
    zt = z + 0.002 + 5 * 0.0007 + 0.0008; o = 5 * 0.004
    text_line(X, coll, '500', x + 0.03 + o, y + 0.037 + 0.03, zt, 0.012, ink, 'menh_gia')                                    # mệnh giá trên tờ trên cùng
    X.sphere('env_dc_tien_cua_so', x + 0.145 + o, y + 0.0645 + 0.03, zt + 0.0002, 0.012, mat(X, '#e8f4fb', 0.3), scale=(0.8, 1, 0.05), coll=coll)  # cửa sổ trong suốt trên tiền polyme
    X.box('env_dc_tien_dai', x + 0.115 + o, x + 0.118 + o, y + 0.034 + 0.03, y + 0.09 + 0.03, zt, zt + 0.0003, mat(X, '#d8352a', 0.4), coll=coll)
    X.box('env_dc_phongbi', x, x + 0.22, y, y + 0.11, z, z + 0.0035, paper, bevel=0.0008, coll=coll)
    X.box('env_dc_phongbi_nap', x, x + 0.22, y + 0.055, y + 0.11, z + 0.0035, z + 0.0042, mat(X, '#e8e4d6', 0.8), coll=coll)
    X.box('env_dc_phongbi_mep_nhan', x + 0.0, x + 0.004, y, y + 0.11, z + 0.0035, z + 0.0045, mat(X, '#dedacb', 0.9), coll=coll)           # mép nhăn
    X.box('env_dc_phongbi_dan', x + 0.1, x + 0.12, y + 0.052, y + 0.058, z + 0.0042, z + 0.0046, mat(X, '#d8d2c0', 0.5), coll=coll)           # dải keo dán
    X.box('env_dc_phongbi_chu', x + 0.02, x + 0.07, y + 0.015, y + 0.019, z + 0.0035, z + 0.0037, mat(X, '#6a6a6a', 0.8), coll=coll)         # dòng chữ viết tay
    _grip(X, coll, 'phongbi', x + 0.11, y + 0.055, z + 0.004)


# ---------------------------------------------------------------- điện thoại + màn hình UI (báo thức / Zalo / điểm)
def phone(X, coll, at, screen='bao_thuc', glow=1.2):
    x, y, z = at; body = mat(X, '#1d1f24', 0.3, 0.4); zs = z + 0.0082
    X.box('env_dc_dt_than', x, x + 0.072, y, y + 0.152, z, z + 0.0078, body, bevel=0.0035, coll=coll)
    X.box('env_dc_dt_vien_kim_loai', x - 0.0008, x + 0.0728, y - 0.0008, y + 0.1528, z + 0.002, z + 0.0058, mat(X, '#b9bdbb', 0.25, 0.9), bevel=0.0038, coll=coll)
    def em(c, st=glow): return X.M.emission('dc_ui_' + c.strip('#') + str(st), c, st)
    bg = {'bao_thuc': '#0e1a2e', 'zalo': '#dfe9f5', 'diem': '#f2f6fb'}[screen]
    X.box('env_dc_dt_man', x + 0.004, x + 0.068, y + 0.008, y + 0.144, z + 0.0078, z + 0.0082, em(bg, glow * (0.6 if screen == 'bao_thuc' else 1.0)), coll=coll)
    X.box('env_dc_dt_thanh_trang_thai', x + 0.004, x + 0.068, y + 0.1385, y + 0.144, zs, zs + 0.0003, em('#222a38' if screen != 'bao_thuc' else '#05080f'), coll=coll)
    X.box('env_dc_dt_pill', x + 0.028, x + 0.044, y + 0.1295, y + 0.1365, zs, zs + 0.0006, body, bevel=0.002, coll=coll)                       # đảo camera trước
    if screen == 'bao_thuc':
        text_line(X, coll, '06:30', x + 0.013, y + 0.09, zs, 0.022, em('#ffffff', glow * 1.5), 'gio')
        X.box('env_dc_dt_bt_nut1', x + 0.012, x + 0.036, y + 0.03, y + 0.044, zs, zs + 0.0003, em('#3a4a6a', glow), bevel=0.002, coll=coll)   # Báo lại
        X.box('env_dc_dt_bt_nut2', x + 0.038, x + 0.06, y + 0.03, y + 0.044, zs, zs + 0.0003, em('#e8523a', glow), bevel=0.002, coll=coll)   # Dừng
        X.box('env_dc_dt_bt_rung', x + 0.004, x + 0.068, y + 0.008, y + 0.0095, zs, zs + 0.0002, em('#e8523a', glow * 1.5), coll=coll)           # thanh rung viền đỏ
    elif screen == 'zalo':
        X.box('env_dc_dt_z_dau', x + 0.004, x + 0.068, y + 0.12, y + 0.1385, zs, zs + 0.0003, em('#2d7fd8', glow), coll=coll)
        for k, (u0, u1, c) in enumerate([(0.008, 0.045, '#ffffff'), (0.028, 0.064, '#bfe0ff'), (0.008, 0.052, '#ffffff'), (0.03, 0.064, '#bfe0ff'), (0.008, 0.04, '#ffffff')]):
            X.box(f'env_dc_dt_z_tn{k}', x + u0, x + u1, y + 0.095 - k * 0.019, y + 0.108 - k * 0.019, zs, zs + 0.0004, em(c, glow), bevel=0.0015, coll=coll)
        X.box('env_dc_dt_z_nhap', x + 0.006, x + 0.066, y + 0.01, y + 0.02, zs, zs + 0.0003, em('#ffffff', glow), bevel=0.003, coll=coll)
    else:
        text_line(X, coll, '9.5', x + 0.02, y + 0.075, zs, 0.03, em('#1a8a4a', glow), 'diem')
        X.box('env_dc_dt_d_dong', x + 0.01, x + 0.062, y + 0.052, y + 0.056, zs, zs + 0.0003, em('#c8d0dc', glow), coll=coll)
        X.box('env_dc_dt_d_dong2', x + 0.01, x + 0.05, y + 0.043, y + 0.047, zs, zs + 0.0003, em('#c8d0dc', glow), coll=coll)
    X.box('env_dc_dt_cam', x + 0.005, x + 0.03, y + 0.122, y + 0.147, z - 0.0018, z, mat(X, '#101216', 0.25), bevel=0.004, coll=coll)
    for k, (cx, cy) in enumerate([(0.012, 0.14), (0.022, 0.14), (0.012, 0.13), (0.022, 0.13)]): X.cyl(f'env_dc_dt_ong_kinh{k}', x + cx, y + cy, z - 0.0032, 0.0034, 0.003, mat(X, '#2a3a4a', 0.1, 0.5), coll=coll)
    X.box('env_dc_dt_nut_nguon', x + 0.0722, x + 0.0742, y + 0.09, y + 0.115, z + 0.002, z + 0.005, mat(X, '#b9bdbb', 0.3, 0.9), bevel=0.0006, coll=coll)
    X.box('env_dc_dt_nut_am', x - 0.0022, x - 0.0002, y + 0.1, y + 0.13, z + 0.002, z + 0.005, mat(X, '#b9bdbb', 0.3, 0.9), bevel=0.0006, coll=coll)
    _grip(X, coll, 'dien_thoai', x + 0.036, y + 0.076, z + 0.0078)


# ---------------------------------------------------------------- bát sứ + đũa
def bowl(X, coll, at, soap=True):
    x, y, z = at; porcelain = mat(X, '#f2f4f2', 0.25); blue = mat(X, '#3d6fb0', 0.3)
    prof = [(0.0, 0.0), (0.03, 0.0), (0.033, 0.004), (0.031, 0.008), (0.036, 0.012), (0.05, 0.032), (0.062, 0.055), (0.067, 0.07), (0.064, 0.072), (0.058, 0.055), (0.045, 0.032), (0.028, 0.015), (0.0, 0.012)]
    lathe(X, 'bat_su', prof, x, y, z, porcelain, coll)                                                                        # có chân đế
    lathe(X, 'bat_vien_xanh', [(0.0668, 0.064), (0.0678, 0.07), (0.0655, 0.0725), (0.0645, 0.066)], x, y, z, blue, coll)
    lathe(X, 'bat_vien_chan', [(0.0305, 0.0), (0.0335, 0.004), (0.0315, 0.006)], x, y, z, blue, coll)
    for k in range(10):                                                                                                      # họa tiết hoa: cánh + nhụy + lá, 10 bông quanh thân
        a = k * math.pi / 5; cx_, cy_ = x + 0.0585 * math.cos(a), y + 0.0585 * math.sin(a)
        for q in range(5):
            b = a + (q - 2) * 0.09
            X.sphere(f'env_dc_bat_canh{k}_{q}', x + 0.0592 * math.cos(b), y + 0.0592 * math.sin(b), z + 0.044 + 0.005 * (q % 2), 0.0042, blue, scale=(0.6, 0.6, 1.3), coll=coll)
        X.sphere(f'env_dc_bat_nhuy{k}', x + 0.0597 * math.cos(a), y + 0.0597 * math.sin(a), z + 0.044, 0.0022, mat(X, '#e8c24a', 0.4), coll=coll)
    X.sphere('env_dc_bat_me', x + 0.064 * math.cos(1.0), y + 0.064 * math.sin(1.0), z + 0.0705, 0.0035, mat(X, '#e8e4d6', 0.4), scale=(1, 1, 0.5), coll=coll)    # mẻ nhỏ ở miệng bát
    if soap:
        for k in range(12): X.sphere(f'env_dc_bot{k}', x + 0.05 * math.cos(k * 0.9), y + 0.05 * math.sin(k * 0.9), z + 0.072 - 0.004 * (k % 2), 0.005 + 0.0022 * (k % 3), mat(X, '#f8fcff', 0.05), coll=coll)
        for k in range(4): X.sphere(f'env_dc_giot{k}', x + 0.064 * math.cos(1.8 + k * 1.2), y + 0.064 * math.sin(1.8 + k * 1.2), z + 0.03 - 0.008 * k, 0.0032, mat(X, '#cfe8f4', 0.05), scale=(1, 1, 1.5), coll=coll)  # giọt nước chảy xuống thân
    for s_ in (-1, 1):
        X.cyl('env_dc_dua%d' % s_, x + 0.14, y + 0.012 * s_ + 0.0, z + 0.004, 0.0035, 0.24, mat(X, '#7a4a2a', 0.5), axis='Y', coll=coll)
        X.cyl('env_dc_dua_dau%d' % s_, x + 0.02, y + 0.012 * s_, z + 0.004, 0.0028, 0.01, mat(X, '#d8c8a0', 0.4), axis='Y', coll=coll)
    _grip(X, coll, 'bat', x, y, z + 0.07)


# ---------------------------------------------------------------- hộp cơm sườn trứng ốp la
def com_suon(X, coll, at):
    x, y, z = at; foam = mat(X, '#f4f1e8', 0.8)
    X.box('env_dc_hop_day', x, x + 0.22, y, y + 0.17, z, z + 0.004, foam, bevel=0.003, coll=coll)
    for (a_, b_, c_, d_) in [(0, 0.22, 0, 0.006), (0, 0.22, 0.164, 0.17), (0, 0.006, 0, 0.17), (0.214, 0.22, 0, 0.17)]:
        X.box('env_dc_hop_thanh', x + a_, x + b_, y + c_, y + d_, z, z + 0.035, foam, bevel=0.002, coll=coll)
    X.box('env_dc_hop_nap', x, x + 0.22, y + 0.17, y + 0.2, z + 0.034, z + 0.04, foam, bevel=0.002, coll=coll, rot=(math.radians(-70), 0, 0), pivot=(x + 0.11, y + 0.17, z + 0.035))   # nắp mở dựng phía sau
    X.box('env_dc_hop_chun', x + 0.0, x + 0.22, y + 0.164, y + 0.17, z + 0.03, z + 0.036, mat(X, '#e8e4d6', 0.8), coll=coll)
    X.box('env_dc_hop_chia', x + 0.09, x + 0.094, y + 0.006, y + 0.164, z + 0.004, z + 0.03, foam, coll=coll)                       # ngăn
    X.sphere('env_dc_com', x + 0.05, y + 0.085, z + 0.018, 0.04, mat(X, '#faf8f2', 0.9), scale=(1.1, 1.8, 0.5), coll=coll)
    for k in range(18): X.sphere(f'env_dc_hat_com{k}', x + 0.03 + 0.012 * (k % 4) + 0.004 * (k // 6), y + 0.04 + 0.014 * (k // 4), z + 0.034 + 0.002 * (k % 3), 0.0032, mat(X, '#f6f4ee', 0.7), scale=(1.6, 0.7, 0.7), coll=coll)
    for i in range(3):
        X.box(f'env_dc_suon{i}', x + 0.105, x + 0.205, y + 0.012 + i * 0.05, y + 0.052 + i * 0.05, z + 0.006, z + 0.026, mat(X, '#6a3a1c', 0.7), bevel=0.007, coll=coll)
        for k in range(4): X.box(f'env_dc_suon_chay{i}{k}', x + 0.11 + 0.022 * k, x + 0.116 + 0.022 * k, y + 0.016 + i * 0.05, y + 0.048 + i * 0.05, z + 0.0258, z + 0.0268, mat(X, '#1d0e06', 0.8), coll=coll)   # vết nướng cháy
        X.box(f'env_dc_suon_xuong{i}', x + 0.19, x + 0.2, y + 0.022 + i * 0.05, y + 0.042 + i * 0.05, z + 0.0262, z + 0.0275, mat(X, '#f0e0c0', 0.5), coll=coll)             # đầu xương sườn
    X.sphere('env_dc_trung_vien', x + 0.098, y + 0.125, z + 0.011, 0.04, mat(X, '#b0702a', 0.6), scale=(1.1, 1, 0.18), coll=coll)       # rìa trứng vàng giòn
    X.sphere('env_dc_trung_trang', x + 0.098, y + 0.125, z + 0.013, 0.036, mat(X, '#fbf8ee', 0.4), scale=(1.1, 1, 0.22), coll=coll)
    X.sphere('env_dc_trung_long_do', x + 0.098, y + 0.125, z + 0.0185, 0.014, mat(X, '#f2a516', 0.25), coll=coll)
    X.sphere('env_dc_trung_bong', x + 0.092, y + 0.131, z + 0.0285, 0.003, mat(X, '#ffffff', 0.05), coll=coll)
    for k in range(10): X.box(f'env_dc_mo_hanh{k}', x + 0.04 + 0.01 * k, x + 0.045 + 0.01 * k, y + 0.03 + 0.007 * (k % 4), y + 0.037 + 0.007 * (k % 4), z + 0.034, z + 0.0365, mat(X, '#5fae4a', 0.7), coll=coll)
    for k in range(4): X.cyl(f'env_dc_dua_chuot{k}', x + 0.04 + 0.012 * k, y + 0.145, z + 0.01 + 0.002 * k, 0.012, 0.003, mat(X, '#9acb6a', 0.5), coll=coll)       # dưa chuột
    X.box('env_dc_dua_chua', x + 0.15, x + 0.2, y + 0.15, y + 0.162, z + 0.005, z + 0.02, mat(X, '#e8c85a', 0.5), bevel=0.003, coll=coll)               # dưa chua
    _grip(X, coll, 'com_suon', x + 0.11, y + 0.085, z + 0.036)


# ---------------------------------------------------------------- bún chả + nem + nước mắm
def bun_cha(X, coll, at):
    x, y, z = at
    lathe(X, 'bat_nuoc_mam', [(0.0, 0.0), (0.035, 0.0), (0.06, 0.04), (0.066, 0.052), (0.062, 0.054), (0.054, 0.04), (0.03, 0.006), (0.0, 0.008)], x, y, z, mat(X, '#f2f4f2', 0.25), coll)
    lathe(X, 'nuoc_mam', [(0.0, 0.034), (0.056, 0.034), (0.0, 0.034)], x, y, z, mat(X, '#b0702a', 0.2), coll)
    for k in range(8): X.cyl(f'env_dc_ca_rot{k}', x - 0.03 + 0.009 * k, y + 0.012 * (k % 3) - 0.012, z + 0.0345 + 0.001 * (k % 2), 0.0065, 0.003, mat(X, '#e8782a' if k % 2 else '#f4f0e0', 0.6), coll=coll)  # cà rốt + su hào ngâm
    for k in range(8): X.sphere(f'env_dc_cha{k}', x - 0.035 + 0.02 * (k % 4), y - 0.012 + 0.026 * (k // 4), z + 0.036, 0.011, mat(X, '#5a2a14', 0.8), scale=(1.1, 1, 0.5), coll=coll)
    for k in range(5): X.sphere(f'env_dc_cha_chay{k}', x - 0.035 + 0.02 * (k % 4), y - 0.012 + 0.026 * (k // 4), z + 0.0395, 0.005, mat(X, '#1d0e06', 0.8), scale=(1, 1, 0.3), coll=coll)
    X.sphere('env_dc_ot', x + 0.04, y + 0.02, z + 0.036, 0.007, mat(X, '#d8352a', 0.4), scale=(1.4, 0.5, 0.5), coll=coll)
    X.sphere('env_dc_toi', x + 0.03, y - 0.03, z + 0.036, 0.005, mat(X, '#f4f0e0', 0.5), coll=coll)
    X.box('env_dc_bun', x + 0.11, x + 0.2, y - 0.045, y + 0.045, z, z + 0.04, mat(X, '#f6f4ec', 0.9), bevel=0.01, coll=coll)
    for k in range(10): X.box(f'env_dc_soi_bun{k}', x + 0.11 + 0.009 * k, x + 0.113 + 0.009 * k, y - 0.045, y + 0.045, z + 0.0401, z + 0.0425, mat(X, '#efece2', 0.9), coll=coll)   # sợi bún
    for k in range(8): X.sphere(f'env_dc_rau{k}', x + 0.105 + 0.012 * k, y - 0.06 + 0.017 * k, z + 0.006, 0.014, mat(X, ['#5fae4a', '#7ac060', '#4f9a3a'][k % 3], 0.7), scale=(1, 0.5, 0.25), coll=coll)
    for k in range(3):
        X.cyl(f'env_dc_nem{k}', x + 0.07, y - 0.085 - 0.022 * k, z + 0.012, 0.011, 0.07, mat(X, '#b0702a', 0.6), axis='X', coll=coll)
        X.cyl(f'env_dc_nem_cat{k}', x + 0.106, y - 0.085 - 0.022 * k, z + 0.012, 0.0095, 0.002, mat(X, '#d8b07a', 0.7), axis='X', coll=coll)    # mặt cắt nhân nem
    _grip(X, coll, 'bun_cha', x, y, z + 0.06)


# ---------------------------------------------------------------- xôi gấc lá chuối + giò lụa
def xoi_gac(X, coll, at):
    x, y, z = at
    X.box('env_dc_la_chuoi', x, x + 0.2, y, y + 0.15, z, z + 0.003, mat(X, '#3f7a3a', 0.6), bevel=0.0015, coll=coll)
    X.box('env_dc_la_chuoi2', x + 0.02, x + 0.18, y + 0.01, y + 0.14, z + 0.003, z + 0.005, mat(X, '#5a9a4a', 0.6), coll=coll)
    X.box('env_dc_la_gan', x + 0.0, x + 0.2, y + 0.0745, y + 0.0755, z + 0.005, z + 0.0056, mat(X, '#6aa858', 0.6), coll=coll)             # gân lá
    for k in range(7): X.box(f'env_dc_la_gan_ngang{k}', x + 0.01 + 0.028 * k, x + 0.011 + 0.028 * k, y + 0.01, y + 0.14, z + 0.0052, z + 0.0056, mat(X, '#4f8a42', 0.6), coll=coll)
    X.box('env_dc_la_chay', x + 0.18, x + 0.2, y + 0.04, y + 0.11, z + 0.0035, z + 0.0045, mat(X, '#7a6a2a', 0.8), coll=coll)             # mép lá hơ lửa cháy xém
    X.sphere('env_dc_xoi', x + 0.1, y + 0.075, z + 0.02, 0.06, mat(X, '#c92a1c', 0.5), scale=(1.15, 0.9, 0.55), coll=coll)
    for k in range(40):  # hạt xôi
        a = k * 2.4; r = 0.052 * ((k % 8) / 8.0 + 0.1)
        X.sphere(f'env_dc_hat_xoi{k}', x + 0.1 + r * math.cos(a) * 1.1, y + 0.075 + r * math.sin(a) * 0.9, z + 0.02 + 0.026 * (1 - ((r / 0.06) ** 2)) + 0.002, 0.0045, mat(X, ['#d4301f', '#e04a2a', '#b82616'][k % 3], 0.4), scale=(1.5, 0.8, 0.7), coll=coll)
    for k in range(6): X.sphere(f'env_dc_gac{k}', x + 0.075 + 0.012 * k, y + 0.06 + 0.01 * (k % 3), z + 0.041, 0.0065, mat(X, '#f0a020', 0.4), coll=coll)
    X.cyl('env_dc_lat_buoc', x + 0.1, y + 0.075, z + 0.02, 0.052, 0.003, mat(X, '#b89a60', 0.8), coll=coll, rot=(0, 0, 0))                    # dây lạt buộc
    for k in range(3):
        X.cyl(f'env_dc_gio{k}', x + 0.16, y + 0.03 + 0.03 * k, z + 0.02, 0.014, 0.01, mat(X, '#f0dcd0', 0.6), axis='X', coll=coll, bevel=0.002)
        X.cyl(f'env_dc_gio_vien{k}', x + 0.16, y + 0.03 + 0.03 * k, z + 0.02, 0.0145, 0.002, mat(X, '#8a9a5a', 0.6), axis='X', coll=coll)  # lớp lá bọc giò
    _grip(X, coll, 'xoi_gac', x + 0.1, y + 0.075, z + 0.045)


# ---------------------------------------------------------------- túi hoa quả
def tui_qua(X, coll, at):
    x, y, z = at; paper = mat(X, '#c9a370', 0.8)
    X.box('env_dc_tui', x, x + 0.22, y, y + 0.14, z, z + 0.22, paper, bevel=0.01, coll=coll)
    X.box('env_dc_tui_cua', x + 0.01, x + 0.21, y - 0.001, y + 0.001, z + 0.04, z + 0.1, mat(X, '#e8d8b8', 0.8), coll=coll)
    X.box('env_dc_tui_nhan', x + 0.05, x + 0.17, y - 0.0015, y - 0.0005, z + 0.06, z + 0.09, mat(X, '#d83a2a', 0.6), coll=coll)             # nhãn đỏ
    for k in range(5): X.box(f'env_dc_tui_nhan_chu{k}', x + 0.07 + 0.016 * k, x + 0.078 + 0.016 * k, y - 0.002, y - 0.0015, z + 0.07, z + 0.082, mat(X, '#f8f0d8', 0.6), coll=coll)
    for k in range(6): X.box(f'env_dc_tui_nep{k}', x + 0.02 + 0.034 * k, x + 0.022 + 0.034 * k, y - 0.0008, y + 0.0, z + 0.01, z + 0.2, mat(X, '#b8905a', 0.9), coll=coll)       # nếp gấp giấy
    X.box('env_dc_tui_mieng', x + 0.0, x + 0.22, y + 0.0, y + 0.14, z + 0.215, z + 0.22, mat(X, '#b8905a', 0.9), coll=coll, rot=(0, math.radians(3), 0), pivot=(x + 0.11, y, z + 0.22))  # miệng túi vênh
    for s_ in (0.05, 0.17): X.cyl(f'env_dc_tui_quai{s_}', x + s_, y + 0.07, z + 0.235, 0.002, 0.14, mat(X, '#8a6a40', 0.8), axis='Y', coll=coll)
    fr = [('#f2a516', 0.034, 'cam'), ('#d8352a', 0.032, 'tao'), ('#f2a516', 0.03, 'cam'), ('#c9301f', 0.03, 'tao')]
    for k, (c, r, kind) in enumerate(fr):
        cx_, cy_, cz_ = x + 0.05 + 0.05 * (k % 3), y + 0.045 + 0.05 * (k // 3), z + 0.225 + 0.012 * (k % 2)
        X.sphere(f'env_dc_qua{k}', cx_, cy_, cz_, r, mat(X, c, 0.35 if kind == 'cam' else 0.25), scale=(1, 1, 0.95 if kind == 'cam' else 0.88), coll=coll)
        X.cyl(f'env_dc_qua_cuong{k}', cx_, cy_, cz_ + r * 0.9, 0.0015, 0.012, mat(X, '#5a4a2a', 0.8), coll=coll)
        X.sphere(f'env_dc_qua_la{k}', cx_ + 0.008, cy_, cz_ + r * 0.95, 0.007, mat(X, '#4f8a42', 0.6), scale=(1.5, 0.7, 0.25), coll=coll)
        X.sphere(f'env_dc_qua_bong{k}', cx_ - r * 0.35, cy_ - r * 0.5, cz_ + r * 0.45, r * 0.18, mat(X, '#ffffff', 0.05), scale=(1, 0.5, 0.7), coll=coll)   # điểm sáng bóng
    _grip(X, coll, 'tui_qua', x + 0.11, y + 0.07, z + 0.31)


# ---------------------------------------------------------------- phấn gãy + bột + giẻ lau
def phan(X, coll, at):
    x, y, z = at; ph = mat(X, '#f4f4ee', 0.95)
    X.cyl('env_dc_phan_a', x, y, z + 0.007, 0.0045, 0.048, ph, axis='Y', coll=coll)
    X.cyl('env_dc_phan_a_dau', x, y + 0.024, z + 0.007, 0.0043, 0.002, mat(X, '#e8e8e0', 0.9), axis='Y', coll=coll)
    X.cyl('env_dc_phan_b', x + 0.03, y + 0.02, z + 0.007, 0.0045, 0.035, ph, axis='Y', coll=coll, rot=(math.radians(90), 0, math.radians(35)))
    for k in range(3): X.box(f'env_dc_phan_vun{k}', x + 0.012 + 0.006 * k, x + 0.016 + 0.006 * k, y - 0.012 + 0.008 * k, y - 0.008 + 0.008 * k, z + 0.001, z + 0.005, ph, bevel=0.0008, coll=coll)  # mảnh vụn nhọn
    for k in range(28): X.sphere(f'env_dc_bot_phan{k}', x + 0.012 * ((k * 7) % 11 - 5) * 0.5, y + 0.012 * ((k * 5) % 9 - 4) * 0.5, z + 0.0012, 0.0016 + 0.0006 * (k % 3), mat(X, '#f8f8f4', 0.95), scale=(1, 1, 0.4), coll=coll)
    X.box('env_dc_gie_lau', x - 0.14, x - 0.08, y - 0.03, y + 0.03, z, z + 0.012, mat(X, '#d8d4c4', 0.95), bevel=0.004, coll=coll)               # giẻ lau bảng
    X.box('env_dc_gie_lau_vet', x - 0.14, x - 0.08, y - 0.03, y - 0.015, z + 0.0121, z + 0.0125, ph, coll=coll)
    _grip(X, coll, 'phan', x, y, z + 0.01)


# ---------------------------------------------------------------- then sắt cài cửa (2 trạng thái)
def then_sat(X, coll, at, locked=True):
    x, y, z = at; iron = mat(X, '#3a3d40', 0.5, 0.8); rust = mat(X, '#6a3f22', 0.85); bright = mat(X, '#7a7d80', 0.3, 0.9)
    X.box('env_dc_then_de', x, x + 0.012, y, y + 0.26, z, z + 0.05, iron, bevel=0.003, coll=coll)
    for k, yy in enumerate((0.04, 0.13, 0.22)):
        X.box(f'env_dc_then_vong{k}', x + 0.012, x + 0.03, y + yy, y + yy + 0.03, z + 0.008, z + 0.042, iron, bevel=0.005, coll=coll)
        X.cyl(f'env_dc_then_lo{k}', x + 0.03, y + yy + 0.015, z + 0.025, 0.0075, 0.002, mat(X, '#101012', 0.8), axis='X', coll=coll)             # lỗ xỏ thanh
    for k, (yy, zz) in enumerate([(0.01, 0.01), (0.25, 0.01), (0.01, 0.04), (0.25, 0.04)]):                                             # đinh vít bắt đế
        X.cyl(f'env_dc_then_dinh{k}', x + 0.0125, y + yy, z + zz, 0.0035, 0.003, bright, axis='X', coll=coll)
        X.box(f'env_dc_then_dinh_ranh{k}', x + 0.0135, x + 0.0142, y + yy - 0.003, y + yy + 0.003, z + zz - 0.0004, z + zz + 0.0004, mat(X, '#1a1a1c', 0.8), coll=coll)
    sl = 0.2 if locked else 0.02
    X.cyl('env_dc_then_thanh', x + 0.02, y + sl + 0.02, z + 0.025, 0.009, 0.24, iron, axis='Y', coll=coll)
    X.cyl('env_dc_then_thanh_sang', x + 0.0195, y + sl + 0.02, z + 0.033, 0.0014, 0.236, bright, axis='Y', coll=coll)                          # vệt mòn sáng trên thanh
    X.box('env_dc_then_nut', x + 0.012, x + 0.04, y + sl + 0.12, y + sl + 0.15, z + 0.036, z + 0.062, iron, bevel=0.004, coll=coll)
    X.box('env_dc_then_ri', x + 0.012, x + 0.04, y + 0.1, y + 0.115, z + 0.01, z + 0.04, rust, coll=coll)
    for k in range(5): X.box(f'env_dc_then_ri_dom{k}', x + 0.0122, x + 0.0128, y + 0.02 + 0.045 * k, y + 0.035 + 0.045 * k, z + 0.004 + 0.008 * (k % 3), z + 0.012 + 0.008 * (k % 3), rust, coll=coll)
    X.box('env_dc_then_tai', x - 0.03, x + 0.0, y + 0.27, y + 0.34, z, z + 0.05, iron, bevel=0.003, coll=coll)
    X.cyl('env_dc_then_tai_lo', x - 0.015, y + 0.3, z + 0.025, 0.0105, 0.04, mat(X, '#0a0a0c', 0.8), axis='Y', coll=coll)               # lỗ tai khóa
    _grip(X, coll, 'then_sat', x + 0.026, y + sl + 0.135, z + 0.05)


def bang_dao_cu(X, coll):
    """Bàn trưng bày: toàn bộ đạo cụ trên một mặt bàn dài (để kiểm tạo hình/tỉ lệ)."""
    X.box('env_bang_ban', -0.3, 2.1, -0.5, 0.7, -0.03, 0.0, mat(X, '#59687a', 0.8), bevel=0.01, coll=coll)
    hammer(X, coll, (0.0, -0.4, 0.016), ax='y'); b4 = set(coll.objects); card(X, coll, (0.42, -0.35, 0.0), 'cccd', 'left'); lat_y(X, coll, b4, -0.323); b4 = set(coll.objects); card(X, coll, (0.55, -0.12, 0.0), 'sv', 'right'); lat_y(X, coll, b4, -0.093)
    for fn, args, cy in [(envelope, ((0.8, -0.4, 0.0),), -0.345), (phone, ((1.1, -0.4, 0.0), 'bao_thuc', 1.2), -0.324), (phone, ((1.25, -0.4, 0.0), 'zalo', 1.0), -0.324), (phone, ((1.4, -0.4, 0.0), 'diem', 1.0), -0.324)]:
        b4 = set(coll.objects); fn(X, coll, *args); lat_y(X, coll, b4, cy); bowl(X, coll, (1.75, -0.3, 0.0))
    com_suon(X, coll, (0.0, 0.1, 0.0)); bun_cha(X, coll, (0.45, 0.2, 0.0)); xoi_gac(X, coll, (0.85, 0.1, 0.0)); tui_qua(X, coll, (1.2, 0.1, 0.0))
    phan(X, coll, (1.55, 0.3, 0.0)); then_sat(X, coll, (1.62, -0.05, 0.0), locked=True); then_sat(X, coll, (1.62, 0.45, 0.0), locked=False)


if __name__ == '__main__':
    import xay_phong_tro as X
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--out', default='/tmp/dao_cu.png'); ap.add_argument('--width', type=int, default=1400); ap.add_argument('--samples', type=int, default=48)
    a = ap.parse_args(argv)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene; coll = bpy.data.collections.new('Dao_cu'); sc.collection.children.link(coll)
    bang_dao_cu(X, coll)
    w = bpy.data.worlds.new('troi'); sc.world = w; w.use_nodes = True
    w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.8, 0.85, 0.9, 1); w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.55
    bpy.ops.object.light_add(type='AREA', location=(X.mx(0.8), -1.2, 1.6)); L = bpy.context.object; L.data.energy = 220; L.data.size = 2.5; L.rotation_euler = (math.radians(35), 0, 0)
    cd = bpy.data.cameras.new('c'); cd.lens = 32; cd.sensor_width = 36; cam = bpy.data.objects.new('c', cd); sc.collection.objects.link(cam)
    pos = Vector((X.mx(0.8), 1.2, 1.75)); cam.location = pos; cam.rotation_euler = (pos_tgt := Vector((X.mx(0.8), -0.1, 0.0)) - pos).to_track_quat('-Z', 'Y').to_euler(); sc.camera = cam
    sc.render.engine = 'CYCLES'; sc.cycles.samples = a.samples; sc.cycles.use_denoising = True; sc.render.resolution_x = a.width; sc.render.resolution_y = round(a.width / 2.39)
    sc.view_settings.view_transform = 'AgX'; sc.render.filepath = a.out; bpy.ops.render.render(write_still=True)
