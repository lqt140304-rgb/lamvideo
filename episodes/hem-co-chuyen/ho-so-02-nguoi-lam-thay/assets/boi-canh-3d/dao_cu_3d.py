"""Đạo cụ 3D (Hero Props) cho Hồ sơ 02 — dựng bằng khối + tròn xoay (lathe) theo toạ độ thiết kế (mét), mỗi vật có điểm neo tay `grip_*` (Empty).
Chạy bảng đạo cụ: `python dao_cu_3d.py --out dao_cu.png [--width 1400]`. Dùng trong cảnh: `dao_cu_3d.hammer(X, coll, (x, y, z))`…
Quy ước: (x, y, z) là điểm đặt (tâm đáy); `ax`: 'z' (dựng đứng), 'y' hoặc 'x' (nằm dọc trục đó)."""
import bpy, bmesh, math, sys, os, argparse
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
_c = {}


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
    p = _P(X, coll, *at, ax); wood = mat(X, '#a8774a', 0.7); iron = mat(X, '#5a5d60', 0.45, 0.8); rust = mat(X, '#7a4a2a', 0.9)
    p.box('bua_can', -0.016, 0.016, 0.0, 0.34, -0.012, 0.012, wood, 0.008)            # cán gỗ (dẹt, sờn)
    p.box('bua_can_dau', -0.02, 0.02, 0.3, 0.325, -0.016, 0.016, wood, 0.01)           # cổ cán loe lên đầu búa
    p.box('bua_dau', -0.025, 0.045, 0.315, 0.36, -0.02, 0.02, iron, 0.006)             # thân đầu búa: nằm NGANG so với cán
    p.box('bua_mat', 0.045, 0.068, 0.31, 0.365, -0.026, 0.026, iron, 0.008)            # mặt đập (to hơn)
    p.box('bua_mong1', -0.06, -0.025, 0.322, 0.352, -0.014, 0.014, iron, 0.005)        # móng nhổ đinh cong ra phía sau
    p.box('bua_mong2', -0.085, -0.06, 0.328, 0.346, -0.01, 0.01, iron, 0.004)
    p.box('bua_mong3', -0.1, -0.085, 0.332, 0.342, -0.006, 0.006, iron, 0.003)
    p.box('bua_ri', -0.02, 0.03, 0.317, 0.358, 0.0185, 0.0205, rust, 0.0)              # vệt gỉ trên đầu
    _grip(X, coll, 'bua', at[0], at[1], at[2])
    return p


# ---------------------------------------------------------------- thẻ CCCD / thẻ sinh viên
def card(X, coll, at, kind='cccd', mole='left'):
    x, y, z = at; blue = mat(X, '#2f7fb8' if kind == 'cccd' else '#1d3a6b', 0.4); white = mat(X, '#f4f4ee', 0.5)
    X.box('env_dc_the_' + kind, x, x + 0.0856, y, y + 0.054, z, z + 0.001, blue, bevel=0.0004, coll=coll)
    X.box('env_dc_the_vien_' + kind, x + 0.004, x + 0.0816, y + 0.004, y + 0.05, z + 0.001, z + 0.0016, white if kind == 'cccd' else mat(X, '#d8dce4', 0.5), coll=coll)
    X.box('env_dc_the_chip_' + kind, x + 0.062, x + 0.074, y + 0.032, y + 0.042, z + 0.0016, z + 0.0021, mat(X, '#d9b24a', 0.3, 0.8), bevel=0.0008, coll=coll)
    X.box('env_dc_the_anh_' + kind, x + 0.008, x + 0.028, y + 0.01, y + 0.04, z + 0.0016, z + 0.002, mat(X, '#c9a88a', 0.6), coll=coll)   # ảnh chân dung
    mx_ = x + (0.012 if mole == 'left' else 0.024)
    X.sphere('env_dc_not_ruoi_' + kind, mx_, y + 0.034, z + 0.0022, 0.0013, mat(X, '#2a1a10', 0.5), coll=coll)                       # nốt ruồi đuôi lông mày
    for i in range(4): X.box(f'env_dc_the_chu_{kind}{i}', x + 0.032, x + 0.058 - 0.004 * i, y + 0.036 - i * 0.007, y + 0.038 - i * 0.007, z + 0.0016, z + 0.0019, mat(X, '#444444', 0.6), coll=coll)
    if kind == 'sv': X.box('env_dc_day_deo', x + 0.03, x + 0.036, y + 0.054, y + 0.3, z, z + 0.002, mat(X, '#1d3a6b', 0.7), coll=coll)
    _grip(X, coll, 'the_' + kind, x + 0.0428, y + 0.027, z + 0.001)


# ---------------------------------------------------------------- phong bì 3 triệu
def envelope(X, coll, at):
    x, y, z = at; paper = mat(X, '#f2efe6', 0.8); money = mat(X, '#3f8fd0', 0.5)
    for i in range(6):
        X.box(f'env_dc_tien{i}', x + 0.02 + i * 0.004, x + 0.17 + i * 0.004, y + 0.03 + i * 0.006, y + 0.095 + i * 0.006, z + 0.002 + i * 0.0007, z + 0.0027 + i * 0.0007, money, coll=coll)
        X.box(f'env_dc_tien_vien{i}', x + 0.024 + i * 0.004, x + 0.166 + i * 0.004, y + 0.034 + i * 0.006, y + 0.09 + i * 0.006, z + 0.0027 + i * 0.0007, z + 0.0029 + i * 0.0007, mat(X, '#d8ecf8', 0.5), coll=coll)
    X.box('env_dc_phongbi', x, x + 0.22, y, y + 0.11, z, z + 0.0035, paper, bevel=0.0008, coll=coll)
    X.box('env_dc_phongbi_nap', x, x + 0.22, y + 0.055, y + 0.11, z + 0.0035, z + 0.0042, mat(X, '#e8e4d6', 0.8), coll=coll)
    _grip(X, coll, 'phongbi', x + 0.11, y + 0.055, z + 0.004)


# ---------------------------------------------------------------- điện thoại + màn hình UI
def phone(X, coll, at, screen='#e8eef4', glow=0.0):
    x, y, z = at; body = mat(X, '#1d1f24', 0.3, 0.4)
    X.box('env_dc_dt_than', x, x + 0.072, y, y + 0.152, z, z + 0.0078, body, bevel=0.0035, coll=coll)
    sm = X.M.emission('dc_man_hinh_' + screen.strip('#') + str(glow), screen, glow) if glow > 0 else mat(X, screen, 0.15)
    X.box('env_dc_dt_man', x + 0.004, x + 0.068, y + 0.008, y + 0.144, z + 0.0078, z + 0.0082, sm, coll=coll)
    X.box('env_dc_dt_cam', x + 0.006, x + 0.026, y + 0.128, y + 0.146, z - 0.0016, z, mat(X, '#101216', 0.25), bevel=0.003, coll=coll)
    _grip(X, coll, 'dien_thoai', x + 0.036, y + 0.076, z + 0.0078)


# ---------------------------------------------------------------- bát sứ + đũa
def bowl(X, coll, at, soap=True):
    x, y, z = at; porcelain = mat(X, '#f2f4f2', 0.25)
    prof = [(0.0, 0.0), (0.03, 0.0), (0.034, 0.008), (0.05, 0.03), (0.062, 0.055), (0.067, 0.07), (0.064, 0.072), (0.058, 0.055), (0.045, 0.03), (0.028, 0.012), (0.0, 0.01)]
    lathe(X, 'bat_su', prof, x, y, z, porcelain, coll)
    lathe(X, 'bat_vien_xanh', [(0.0668, 0.064), (0.0678, 0.07), (0.0655, 0.0725), (0.0645, 0.066)], x, y, z, mat(X, '#3d6fb0', 0.3), coll)
    for k in range(8):  # họa tiết hoa xanh quanh thân
        a = k * math.pi / 4
        X.sphere(f'env_dc_bat_hoa{k}', x + 0.058 * math.cos(a), y + 0.058 * math.sin(a), z + 0.045, 0.006, mat(X, '#3d6fb0', 0.3), scale=(1, 1, 0.8), coll=coll)
    if soap:
        for k in range(7): X.sphere(f'env_dc_bot{k}', x + 0.05 * math.cos(k * 1.1), y + 0.05 * math.sin(k * 1.1), z + 0.072, 0.006 + 0.002 * (k % 3), mat(X, '#f8fcff', 0.05), coll=coll)
    for s in (-1, 1): X.cyl('env_dc_dua%d' % s, x + 0.14, y + 0.012 * s, z + 0.004, 0.0035, 0.24, mat(X, '#7a4a2a', 0.5), axis='Y', coll=coll)
    _grip(X, coll, 'bat', x, y, z + 0.07)


# ---------------------------------------------------------------- hộp cơm sườn trứng ốp la
def com_suon(X, coll, at):
    x, y, z = at; foam = mat(X, '#f4f1e8', 0.8)
    X.box('env_dc_hop_day', x, x + 0.22, y, y + 0.17, z, z + 0.004, foam, bevel=0.003, coll=coll)
    for (a, b, c, d) in [(0, 0.22, 0, 0.006), (0, 0.22, 0.164, 0.17), (0, 0.006, 0, 0.17), (0.214, 0.22, 0, 0.17)]:
        X.box('env_dc_hop_thanh', x + a, x + b, y + c, y + d, z, z + 0.035, foam, bevel=0.002, coll=coll)
    X.sphere('env_dc_com', x + 0.07, y + 0.085, z + 0.02, 0.06, mat(X, '#faf8f2', 0.9), scale=(1.15, 1.0, 0.5), coll=coll)
    for i in range(3): X.box(f'env_dc_suon{i}', x + 0.125, x + 0.205, y + 0.015 + i * 0.045, y + 0.05 + i * 0.045, z + 0.006, z + 0.026, mat(X, '#6a3a1c', 0.7), bevel=0.006, coll=coll)
    X.sphere('env_dc_trung_trang', x + 0.1, y + 0.12, z + 0.012, 0.035, mat(X, '#fbf8ee', 0.4), scale=(1.1, 1, 0.22), coll=coll)
    X.sphere('env_dc_trung_long_do', x + 0.1, y + 0.12, z + 0.016, 0.014, mat(X, '#f2a516', 0.25), coll=coll)
    for k in range(6): X.box(f'env_dc_mo_hanh{k}', x + 0.04 + 0.012 * k, x + 0.046 + 0.012 * k, y + 0.03 + 0.006 * (k % 3), y + 0.036 + 0.006 * (k % 3), z + 0.034, z + 0.036, mat(X, '#5fae4a', 0.7), coll=coll)
    _grip(X, coll, 'com_suon', x + 0.11, y + 0.085, z + 0.036)


# ---------------------------------------------------------------- bún chả + nem + nước mắm
def bun_cha(X, coll, at):
    x, y, z = at
    lathe(X, 'bat_nuoc_mam', [(0.0, 0.0), (0.035, 0.0), (0.06, 0.04), (0.066, 0.052), (0.062, 0.054), (0.054, 0.04), (0.03, 0.006), (0.0, 0.008)], x, y, z, mat(X, '#f2f4f2', 0.25), coll)
    lathe(X, 'nuoc_mam', [(0.0, 0.034), (0.056, 0.034), (0.0, 0.034)], x, y, z, mat(X, '#b0702a', 0.2), coll)
    for k in range(5): X.cyl(f'env_dc_ca_rot{k}', x - 0.025 + 0.012 * k, y + 0.01 * (k % 3) - 0.01, z + 0.036, 0.007, 0.003, mat(X, '#e8782a', 0.6), coll=coll)
    for k in range(6): X.sphere(f'env_dc_cha{k}', x - 0.03 + 0.018 * (k % 3), y - 0.01 + 0.02 * (k // 3), z + 0.034, 0.011, mat(X, '#5a2a14', 0.8), scale=(1, 1, 0.5), coll=coll)
    X.sphere('env_dc_ot', x + 0.04, y + 0.02, z + 0.036, 0.007, mat(X, '#d8352a', 0.4), scale=(1.4, 0.5, 0.5), coll=coll)
    X.box('env_dc_bun', x + 0.11, x + 0.2, y - 0.045, y + 0.045, z, z + 0.04, mat(X, '#f6f4ec', 0.9), bevel=0.01, coll=coll)
    for k in range(6): X.box(f'env_dc_rau{k}', x + 0.1 + 0.014 * k, x + 0.12 + 0.014 * k, y - 0.06 + 0.02 * k, y - 0.03 + 0.02 * k, z, z + 0.012, mat(X, '#5fae4a', 0.7), bevel=0.004, coll=coll)
    for k in range(3): X.cyl(f'env_dc_nem{k}', x + 0.07, y - 0.08 - 0.022 * k, z + 0.012, 0.011, 0.07, mat(X, '#b0702a', 0.6), axis='X', coll=coll)
    _grip(X, coll, 'bun_cha', x, y, z + 0.06)


# ---------------------------------------------------------------- xôi gấc lá chuối + giò lụa
def xoi_gac(X, coll, at):
    x, y, z = at
    X.box('env_dc_la_chuoi', x, x + 0.2, y, y + 0.15, z, z + 0.003, mat(X, '#3f7a3a', 0.6), bevel=0.0015, coll=coll)
    X.box('env_dc_la_chuoi2', x + 0.02, x + 0.18, y + 0.01, y + 0.14, z + 0.003, z + 0.005, mat(X, '#5a9a4a', 0.6), coll=coll)
    X.sphere('env_dc_xoi', x + 0.1, y + 0.075, z + 0.02, 0.06, mat(X, '#c92a1c', 0.5), scale=(1.15, 0.9, 0.55), coll=coll)
    for k in range(4): X.sphere(f'env_dc_gac{k}', x + 0.08 + 0.014 * k, y + 0.06 + 0.012 * (k % 2), z + 0.04, 0.006, mat(X, '#f0a020', 0.4), coll=coll)
    for k in range(3): X.cyl(f'env_dc_gio{k}', x + 0.16, y + 0.03 + 0.03 * k, z + 0.02, 0.014, 0.01, mat(X, '#f0dcd0', 0.6), axis='X', coll=coll, bevel=0.002)
    _grip(X, coll, 'xoi_gac', x + 0.1, y + 0.075, z + 0.04)


# ---------------------------------------------------------------- túi hoa quả
def tui_qua(X, coll, at):
    x, y, z = at
    X.box('env_dc_tui', x, x + 0.22, y, y + 0.14, z, z + 0.22, mat(X, '#c9a370', 0.8), bevel=0.01, coll=coll)
    X.box('env_dc_tui_cua', x + 0.01, x + 0.21, y - 0.001, y + 0.001, z + 0.04, z + 0.1, mat(X, '#e8d8b8', 0.8), coll=coll)
    for s in (0.05, 0.17): X.cyl(f'env_dc_tui_quai{s}', x + s, y + 0.07, z + 0.23, 0.002, 0.14, mat(X, '#8a6a40', 0.8), axis='Y', coll=coll)
    for k, (c, r) in enumerate([('#f2a516', 0.034), ('#d8352a', 0.032), ('#f2a516', 0.03), ('#c9301f', 0.03)]):
        X.sphere(f'env_dc_qua{k}', x + 0.05 + 0.05 * (k % 3), y + 0.045 + 0.05 * (k // 3), z + 0.225 + 0.012 * (k % 2), r, mat(X, c, 0.35), coll=coll)
    _grip(X, coll, 'tui_qua', x + 0.11, y + 0.07, z + 0.31)


# ---------------------------------------------------------------- phấn gãy + bột
def phan(X, coll, at):
    x, y, z = at
    X.cyl('env_dc_phan_a', x, y, z + 0.007, 0.0045, 0.048, mat(X, '#f4f4ee', 0.95), axis='Y', coll=coll)
    X.cyl('env_dc_phan_b', x + 0.03, y + 0.02, z + 0.007, 0.0045, 0.035, mat(X, '#f4f4ee', 0.95), axis='Y', coll=coll, rot=(math.radians(90), 0, math.radians(35)))
    for k in range(12): X.sphere(f'env_dc_bot_phan{k}', x + 0.01 * ((k * 7) % 9 - 4) * 0.5, y + 0.01 * ((k * 5) % 7 - 3) * 0.5, z + 0.0012, 0.002 + 0.0006 * (k % 3), mat(X, '#f8f8f4', 0.95), scale=(1, 1, 0.4), coll=coll)


# ---------------------------------------------------------------- then sắt cài cửa (2 trạng thái)
def then_sat(X, coll, at, locked=True):
    x, y, z = at; iron = mat(X, '#3a3d40', 0.5, 0.8); rust = mat(X, '#6a3f22', 0.85)
    X.box('env_dc_then_de', x, x + 0.012, y, y + 0.26, z, z + 0.05, iron, bevel=0.003, coll=coll)           # đế gắn cánh cửa
    for k, yy in enumerate((0.04, 0.13, 0.22)): X.box(f'env_dc_then_vong{k}', x + 0.012, x + 0.03, y + yy, y + yy + 0.03, z + 0.008, z + 0.042, iron, bevel=0.005, coll=coll)
    sl = 0.2 if locked else 0.02
    X.cyl('env_dc_then_thanh', x + 0.02, y + sl + 0.02, z + 0.025, 0.009, 0.24, iron, axis='Y', coll=coll)  # thanh trượt tròn
    X.box('env_dc_then_nut', x + 0.012, x + 0.04, y + sl + 0.12, y + sl + 0.15, z + 0.036, z + 0.062, iron, bevel=0.004, coll=coll)  # núm kéo
    X.box('env_dc_then_ri', x + 0.012, x + 0.04, y + 0.1, y + 0.115, z + 0.01, z + 0.04, rust, coll=coll)
    X.box('env_dc_then_tai', x - 0.03, x + 0.0, y + 0.27, y + 0.34, z, z + 0.05, iron, bevel=0.003, coll=coll)  # tai khóa trên khung
    _grip(X, coll, 'then_sat', x + 0.026, y + sl + 0.135, z + 0.05)


def bang_dao_cu(X, coll):
    """Bàn trưng bày: toàn bộ đạo cụ trên một mặt bàn dài (để kiểm tạo hình/tỉ lệ)."""
    X.box('env_bang_ban', -0.3, 1.9, -0.5, 0.7, -0.03, 0.0, mat(X, '#59687a', 0.8), bevel=0.01, coll=coll)
    hammer(X, coll, (0.0, -0.4, 0.016), ax='y'); card(X, coll, (0.42, -0.35, 0.0), 'cccd', 'left'); card(X, coll, (0.55, -0.12, 0.0), 'sv', 'right')
    envelope(X, coll, (0.8, -0.4, 0.0)); phone(X, coll, (1.1, -0.4, 0.0), '#cfe4ff', 1.2); bowl(X, coll, (1.45, -0.3, 0.0))
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
    pos = Vector((X.mx(0.8), -1.15, 1.75)); cam.location = pos; cam.rotation_euler = (pos_tgt := Vector((X.mx(0.8), 0.12, 0.0)) - pos).to_track_quat('-Z', 'Y').to_euler(); sc.camera = cam
    sc.render.engine = 'CYCLES'; sc.cycles.samples = a.samples; sc.cycles.use_denoising = True; sc.render.resolution_x = a.width; sc.render.resolution_y = round(a.width / 2.39)
    sc.view_settings.view_transform = 'AgX'; sc.render.filepath = a.out; bpy.ops.render.render(write_still=True)
