"""PHÒNG TRỌ + HÀNH LANG HỒ SƠ 02 — dựng 3D bằng Blender (12/11/2026).

Chạy:  python xay_phong_tro.py [--mode day|night] [--cam WIDE|DESK|BED|DOOR|KITCHEN|HALL|HALL_DOOR|TOP|LOW] [--out ảnh.png] [--blend file.blend]
Cần Blender (module `bpy` 5.x): `pip install bpy` trong Python 3.11, hoặc chạy bằng `blender -b -P xay_phong_tro.py -- ...`.

Đơn vị: 1 Blender Unit = 1 mét (QUY-CHUAN-3D §3). Trục: X từ tường cửa (0) sang tường cửa sổ (3,0); Y từ tường sau (0) ra phía tường trước (4,0);
Z lên trên, trần cao 2,8. Phòng 3,0 × 4,0 m = 12 m². Hành lang ngoài tường cửa (x < 0), cầu thang xuống ở đầu y âm.
Bố trí giữ đúng tương quan đã duyệt ở bản 2D (DUNG-CANH.md): cửa tường trái, bếp sau–trái, tủ quần áo sau–giữa, bàn Nam sau–phải cạnh cửa sổ tường phải,
nệm đôi phía trước–phải. Chiều cao đồ là kích thước THẬT (bàn 0,75, mặt ghế 0,46, mặt nệm 0,24) — không còn bị hạ theo chân ngắn của rig 2D.
"""
import sys, math, json, argparse
import bpy, bmesh
from mathutils import Vector, Euler
sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
import vat_lieu as M

W, D, H, T = 3.0, 4.0, 2.8, 0.12
HL_Y1 = 24.0  # hành lang dài 24,6 m, mỗi cửa/đồ đạc một kiểu (không lặp mô-đun)
DOOR = dict(y0=2.05, y1=2.90, top=2.10)      # cửa chính 0,85 × 2,10 m trên tường x = 0
WIN = dict(y0=0.75, y1=2.00, z0=0.95, z1=2.05)  # cửa sổ trên tường x = W
SEAT = dict(x=2.48, y=0.98)                    # chỗ ghế làm việc
ANCHORS = {'san': 0.0, 'mat_ghe': 0.46, 'mat_ban': 0.75, 'mat_nem': 0.24, 'mat_bep': 0.84, 'tay_nam_cua': 1.0}


def mx(x):
    """Blender dùng hệ toạ độ thuận tay phải: nhìn dọc −Y thì +X nằm bên TRÁI. Bản 2D/bố cục đã duyệt có tường cửa bên trái và cửa sổ bên phải khi
    camera đứng phía trước nhìn vào, nên mọi toạ độ thiết kế ở đây được phản chiếu qua mặt phẳng x = W/2 khi tạo đối tượng (x_thế_giới = W − x_thiết_kế)."""
    return W - x


def mrot(r):
    return (r[0], -r[1], -r[2])


def hexc(h):
    return M._hex(h)


# ------------------------------------------------------------------ hình khối cơ bản
def _link(obj, coll):
    for c in list(obj.users_collection): c.objects.unlink(obj)
    coll.objects.link(obj)


def box(name, x0, x1, y0, y1, z0, z1, mat, bevel=0.0, coll=None, rot=None, pivot=None):
    """Hộp theo toạ độ thế giới (đỉnh ghi thẳng toạ độ để texture thủ tục theo mét). `rot`: Euler quanh `pivot`."""
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((x1 if v.co.x > 0 else x0, y1 if v.co.y > 0 else y0, z1 if v.co.z > 0 else z0))
    if rot is not None:
        p = Vector(pivot or ((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)); e = Euler(rot).to_matrix().to_4x4()
        for v in bm.verts: v.co = p + (e @ (v.co - p))
    for v in bm.verts: v.co.x = mx(v.co.x)
    bmesh.ops.reverse_faces(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); (coll or bpy.context.scene.collection).objects.link(ob)
    if mat: ob.data.materials.append(mat)
    if bevel > 0:
        md = ob.modifiers.new('bevel', 'BEVEL'); md.width = bevel; md.segments = 3; md.limit_method = 'ANGLE'; md.angle_limit = math.radians(35)
    return ob


def _mesh_obj(name, bm, loc, mat, smooth, coll, rot=None, scale=None, quat=None):
    """Tạo đối tượng từ bmesh KHÔNG dùng bpy.ops (mỗi bpy.ops cập nhật depsgraph toàn cảnh → rất chậm khi có hàng nghìn vật)."""
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    if smooth:
        for p in me.polygons: p.use_smooth = True
    ob = bpy.data.objects.new(name, me); ob.location = loc
    if quat is not None: ob.rotation_mode = 'QUATERNION'; ob.rotation_quaternion = quat
    elif rot is not None: ob.rotation_euler = rot
    if scale is not None: ob.scale = scale
    me.materials.append(mat)
    (coll or bpy.context.scene.collection).objects.link(ob)
    return ob


def cyl(name, x, y, z, r, h, mat, axis='Z', verts=28, coll=None, rot=None, bevel=0.0, smooth=True):
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=verts, radius1=r, radius2=r, depth=h)
    e = None
    if axis == 'X': e = (0, math.pi / 2, 0)
    elif axis == 'Y': e = (math.pi / 2, 0, 0)
    if rot: e = mrot(rot)
    ob = _mesh_obj(name, bm, (mx(x), y, z), mat, smooth, coll, rot=e)
    if bevel > 0:
        md = ob.modifiers.new('bevel', 'BEVEL'); md.width = bevel; md.segments = 2
    return ob


def sphere(name, x, y, z, r, mat, scale=(1, 1, 1), coll=None):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=32, v_segments=16, radius=r)
    return _mesh_obj(name, bm, (mx(x), y, z), mat, True, coll, scale=scale)


def torus(name, x, y, z, R, r, mat, rot=(0, 0, 0), coll=None, major=48, minor=10):
    bm = bmesh.new(); verts = []
    for i in range(major):
        a = 2 * math.pi * i / major; ca, sa = math.cos(a), math.sin(a); ring = []
        for j in range(minor):
            b = 2 * math.pi * j / minor; rr = R + r * math.cos(b)
            ring.append(bm.verts.new((rr * ca, rr * sa, r * math.sin(b))))
        verts.append(ring)
    for i in range(major):
        for j in range(minor):
            bm.faces.new((verts[i][j], verts[(i + 1) % major][j], verts[(i + 1) % major][(j + 1) % minor], verts[i][(j + 1) % minor]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return _mesh_obj(name, bm, (mx(x), y, z), mat, True, coll, rot=mrot(rot))


def rounded(ob, level=2, width=0.03):
    md = ob.modifiers.new('sub', 'SUBSURF'); md.levels = level; md.render_levels = level
    return ob


# ------------------------------------------------------------------ vật liệu dùng chung
def make_materials():
    m = {}
    m['tuong'] = M.wall_plaster('tuong', '#ece1cb')
    m['tuong_duoi'] = M.mottled('tuong_duoi', '#c9d0ba', rough=0.8, scale=2.5, vary=0.08, bump=0.1)
    m['tran'] = M.mottled('tran', '#e6decb', rough=0.95, scale=1.2, vary=0.06, bump=0.08)
    m['gach'] = M.tiles('gach', '#d6ccb6', '#b3a890', 0.4)
    m['gach_hl'] = M.tiles('gach_hanh_lang', '#cfc7b3', '#a89d86', 0.3)
    m['gach_op'] = M.solid('gach_op', '#f1ede0', 0.28)
    m['gach_op2'] = M.solid('gach_op2', '#ebe6d6', 0.28)
    m['gach_op_mach'] = M.solid('gach_op_mach', '#c9c3b2', 0.7)
    m['viền'] = M.solid('vien_tuong', '#f3ead6', 0.7)
    m['cua'] = M.mottled('cua_xanh', '#6d887c', rough=0.55, scale=3, vary=0.05, bump=0.05)
    m['kim_loai_cu'] = M.solid('kim_loai_cu', '#6f6b63', rough=0.5, metal=0.85)
    m['gi'] = M.mottled('gi_set', '#7a5a3f', rough=0.7, scale=40, vary=0.3, bump=0.5, bump_scale=200)
    m['thep'] = M.solid('thep_den', '#2b2d2e', rough=0.45, metal=0.7)
    m['inox'] = M.solid('inox', '#c9cccb', rough=0.28, metal=1.0)
    m['go_ban'] = M.wood('go_ban', '#d9b482', '#b78d5c', rough=0.55)
    m['go_ban_cu'] = M.wood('go_ban_hong', '#a07d58', '#7a5b3d', rough=0.6)
    m['go_tu'] = M.wood('go_tu', '#c4965a', '#a37740', rough=0.6)
    m['go_toi'] = M.wood('go_toi', '#715c45', '#5a4837', rough=0.6)
    m['go_ghe'] = M.solid('ghe_xanh', '#a5b8a0', 0.65)
    m['khung_ghe'] = M.solid('khung_ghe', '#5f7468', 0.5, metal=0.2)
    m['tu_bep'] = M.mottled('tu_bep', '#9ab09a', rough=0.6, scale=4, vary=0.05, bump=0.05)
    m['mat_bep'] = M.solid('mat_bep', '#f4f1e6', 0.35)
    m['nem'] = M.mottled('nem', '#a5b8a0', rough=0.95, scale=25, vary=0.1, bump=0.25, bump_scale=300)
    m['ga'] = M.mottled('ga_giuong', '#c3d1c2', rough=0.95, scale=30, vary=0.08, bump=0.2, bump_scale=300)
    m['chan'] = M.mottled('chan', '#5f7468', rough=0.97, scale=14, vary=0.15, bump=0.4, bump_scale=120)
    m['goi'] = M.mottled('goi', '#efe6d2', rough=0.95, scale=30, vary=0.06, bump=0.2, bump_scale=300)
    m['rem'] = M.mottled('rem', '#f0e2bd', rough=0.95, scale=12, vary=0.08, bump=0.25, bump_scale=200)
    m['carton'] = M.mottled('carton', '#c98f5f', rough=0.9, scale=6, vary=0.12, bump=0.2, bump_scale=200)
    m['nhua_trang'] = M.solid('nhua_trang', '#e8e6dc', 0.4)
    m['nhua_xanh'] = M.solid('nhua_xanh', '#7fa9bd', 0.3)
    m['xam_nhua'] = M.solid('nhua_xam', '#7f8f94', 0.45)
    m['den'] = M.solid('den', '#202224', 0.5)
    m['kinh'] = M.glass('kinh')
    m['guong'] = M.mirror_mat()
    m['laptop'] = M.solid('laptop_vo', '#4a4f52', 0.4, metal=0.5)
    m['cay'] = M.solid('cay', '#4f7a4a', 0.8)
    m['bia'] = [M.solid(f'bia{i}', c, 0.7) for i, c in enumerate(['#c9825f', '#7ca2a8', '#b0605a', '#d5b46a', '#6d8a6b'])]
    m['ao'] = [M.mottled(f'ao{i}', c, rough=0.95, scale=20, vary=0.1, bump=0.2, bump_scale=200) for i, c in enumerate(['#8fb0a2', '#d9c9a0', '#8a8783', '#7c8da8'])]
    return m


# ------------------------------------------------------------------ vỏ phòng + cửa + cửa sổ
def shell(m, coll, door_open, cutaway=False, hide_front=False):
    wall = m['tuong']
    box('san_phong', 0, W, 0, D + 3.0, -0.10, 0.0, m['gach'], coll=coll)  # sàn kéo dài ra ngoài tường trước (ẩn với camera) để góc máy đứng ngoài không thấy khoảng trống
    ceil = box('tran_phong', -0.12, W + 0.12, -0.12, D + 0.12, H, H + 0.1, m['tran'], coll=coll)
    if cutaway: ceil.visible_camera = False; ceil.visible_shadow = False; ceil.visible_diffuse = False; ceil.visible_glossy = False; ceil.visible_transmission = False  # góc từ trên xuống: ẩn trần (và bỏ bóng của trần) để thấy cả phòng sáng
    box('tuong_sau', -T, W + T, -T, 0, -0.1, H, wall, coll=coll)
    front = box('tuong_truoc', 0, W, D, D + T, -0.1, H, wall, coll=coll); front.visible_camera = not hide_front  # camera ngoài tường trước mới ẩn tường này
    box('tuong_truoc_goc_trai', -T, 0, D, D + T, -0.1, H, wall, coll=coll)  # hai đầu tường là mặt ngoài của hành lang / tường phải: luôn hiện
    box('tuong_truoc_goc_phai', W, W + T, D, D + T, -0.1, H, wall, coll=coll)
    # tường trái (cửa chính): chừa ô cửa 0,85 × 2,10
    box('tuong_trai_a', -T, 0, 0, DOOR['y0'], -0.1, H, wall, coll=coll)
    box('tuong_trai_b', -T, 0, DOOR['y1'], D, -0.1, H, wall, coll=coll)
    box('tuong_trai_tren_cua', -T, 0, DOOR['y0'], DOOR['y1'], DOOR['top'], H, wall, coll=coll)
    # tường phải (cửa sổ)
    box('tuong_phai_a', W, W + T, 0, WIN['y0'], -0.1, H, wall, coll=coll)
    box('tuong_phai_b', W, W + T, WIN['y1'], D, -0.1, H, wall, coll=coll)
    box('tuong_phai_duoi_so', W, W + T, WIN['y0'], WIN['y1'], -0.1, WIN['z0'], wall, coll=coll)
    box('tuong_phai_tren_so', W, W + T, WIN['y0'], WIN['y1'], WIN['z1'], H, wall, coll=coll)
    # ốp chân tường sơn xanh nhạt (0–1,1 m) và phào
    lo = m['tuong_duoi']; e = 0.004
    box('op_sau', 0, W, e - 0.0, e + 0.0 + 0.001, 0, 0.001, None, coll=coll)  # giữ tên; bỏ qua
    bpy.data.objects.remove(bpy.data.objects['op_sau'], do_unlink=True)
    box('op_sau', 0, W, 0, e, 0, 1.1, lo, coll=coll)
    box('op_truoc', 0, W, D - e, D, 0, 1.1, lo, coll=coll).visible_camera = not hide_front
    box('op_trai_a', 0, e, 0, DOOR['y0'], 0, 1.1, lo, coll=coll)
    box('op_trai_b', 0, e, DOOR['y1'], D, 0, 1.1, lo, coll=coll)
    box('op_phai_a', W - e, W, 0, WIN['y0'], 0, 1.1, lo, coll=coll)
    box('op_phai_b', W - e, W, WIN['y1'], D, 0, 1.1, lo, coll=coll)
    box('op_phai_so', W - e, W, WIN['y0'], WIN['y1'], 0, WIN['z0'], lo, coll=coll)
    for i, (a, b2) in enumerate([(0, DOOR['y0']), (DOOR['y1'], D)]):
        box(f'phao_trai{i}', 0, 0.012, a, b2, 1.1, 1.13, m['viền'], coll=coll)
    box('phao_sau', 0, W, 0, 0.012, 1.1, 1.13, m['viền'], coll=coll)
    box('phao_phai_a', W - 0.012, W, 0, WIN['y0'], 1.1, 1.13, m['viền'], coll=coll)
    box('phao_phai_b', W - 0.012, W, WIN['y1'], D, 1.1, 1.13, m['viền'], coll=coll)
    box('phao_truoc', 0, W, D - 0.012, D, 1.1, 1.13, m['viền'], coll=coll).visible_camera = not hide_front
    # chân tường
    box('chan_sau', 0, W, 0, 0.012, 0, 0.09, m['viền'], coll=coll)
    # ----- cửa chính: khuôn + cánh xanh rêu, bản lề ở y = DOOR['y1'], mở vào phòng
    w = DOOR['y1'] - DOOR['y0']
    for nm, a, b2, z0, z1 in [('khuon_a', DOOR['y0'] - 0.06, DOOR['y0'], 0, DOOR['top'] + 0.06), ('khuon_b', DOOR['y1'], DOOR['y1'] + 0.06, 0, DOOR['top'] + 0.06), ('khuon_tren', DOOR['y0'] - 0.06, DOOR['y1'] + 0.06, DOOR['top'], DOOR['top'] + 0.06)]:
        box(nm, -0.04, 0.03, a, b2, z0, z1, m['viền'], bevel=0.004, coll=coll)
    ang = math.radians(door_open)
    # cánh cửa chia 3 phần: thân dưới, KHE THÔNG GIÓ bằng nan ngang (z 1,66–1,96, có khe hở nhìn xuyên), thân trên
    VZ0, VZ1 = 1.66, 1.96
    pv = (0, DOOR['y1'], 0)
    leaf = box('canh_cua', -0.02, 0.02, DOOR['y0'], DOOR['y1'], 0.0, VZ0, m['cua'], bevel=0.006, coll=coll, rot=(0, 0, ang), pivot=pv)
    box('canh_cua_tren', -0.02, 0.02, DOOR['y0'], DOOR['y1'], VZ1, DOOR['top'], m['cua'], bevel=0.006, coll=coll, rot=(0, 0, ang), pivot=pv)
    box('canh_cua_khung_trai', -0.02, 0.02, DOOR['y0'], DOOR['y0'] + 0.05, VZ0, VZ1, m['cua'], coll=coll, rot=(0, 0, ang), pivot=pv)
    box('canh_cua_khung_phai', -0.02, 0.02, DOOR['y1'] - 0.05, DOOR['y1'], VZ0, VZ1, m['cua'], coll=coll, rot=(0, 0, ang), pivot=pv)
    for k in range(8):  # nan: dày 1,6 cm, cách 3,75 cm → khe hở 2,1 cm
        zz = VZ0 + 0.01 + k * 0.0375
        box(f'nan_thong_gio{k}', -0.015, 0.015, DOOR['y0'] + 0.05, DOOR['y1'] - 0.05, zz, zz + 0.016, m['cua'], coll=coll, rot=(0, 0, ang), pivot=pv)
    # tay nắm, then sắt gỉ, mắt thần — gắn theo cánh (xoay cùng pivot)
    piv = (0, DOOR['y1'], 0)
    # Khóa cửa: thân khóa dán trên mặt trong cánh gần mép tự do, núm xoay, chốt đẩy vào ổ chốt trên khung.
    # Cửa mở (góc ≠ 0) thì chốt thu vào thân khóa, không còn đâm vào khung.
    bolt = 0.07 if abs(door_open) < 1 else 0.0
    HZ = 0.98  # tay gạt cao ≈ 1,0 m
    for side, (xa, xb) in (('trong', (0.02, 0.032)), ('ngoai', (-0.032, -0.02))):  # hoa tay nắm (đế tròn bo) hai mặt cánh
        box(f'hoa_tay_{side}', xa, xb, DOOR['y0'] + 0.04, DOOR['y0'] + 0.1, HZ - 0.03, HZ + 0.03, m['inox'], bevel=0.025, coll=coll, rot=(0, 0, ang), pivot=piv)
        sg = 1 if side == 'trong' else -1
        box(f'co_tay_{side}', (0.032 if sg > 0 else -0.05), (0.05 if sg > 0 else -0.032), DOOR['y0'] + 0.065, DOOR['y0'] + 0.08, HZ - 0.008, HZ + 0.008, m['inox'], bevel=0.005, coll=coll, rot=(0, 0, ang), pivot=piv)
        box(f'can_gat_{side}', (0.045 if sg > 0 else -0.075), (0.06 if sg > 0 else -0.045), DOOR['y0'] + 0.058, DOOR['y0'] + 0.2, HZ - 0.012, HZ + 0.012, m['inox'], bevel=0.007, coll=coll, rot=(0, 0, ang), pivot=piv)  # cần gạt hướng về phía bản lề
    # ổ khóa chốt phụ (hoa + tay vặn bên trong, ổ chìa bên ngoài) ở cao 1,12 m
    box('hoa_khoa_trong', 0.02, 0.03, DOOR['y0'] + 0.055, DOOR['y0'] + 0.095, 1.09, 1.15, m['inox'], bevel=0.015, coll=coll, rot=(0, 0, ang), pivot=piv)
    box('tay_van_khoa', 0.03, 0.05, DOOR['y0'] + 0.065, DOOR['y0'] + 0.085, 1.105, 1.135, m['inox'], bevel=0.006, coll=coll, rot=(0, 0, ang), pivot=piv)
    box('o_chia_ngoai', -0.03, -0.02, DOOR['y0'] + 0.06, DOOR['y0'] + 0.09, 1.1, 1.14, m['gi'], bevel=0.008, coll=coll, rot=(0, 0, ang), pivot=piv)
    if bolt:
        box('chot_day', 0.0, 0.015, DOOR['y0'] - 0.05, DOOR['y0'] + 0.01, 1.11, 1.13, m['inox'], bevel=0.003, coll=coll, rot=(0, 0, ang), pivot=piv)
    box('o_then', 0.0, 0.03, DOOR['y0'] - 0.03, DOOR['y0'], 1.08, 1.16, m['gi'], bevel=0.003, coll=coll)  # ổ chốt trên khung
    box('o_then_lo', 0.0, 0.03, DOOR['y0'] - 0.035, DOOR['y0'] - 0.03, 1.06, 1.18, m['gi'], bevel=0.002, coll=coll)  # viền ổ chốt
    # ----- cửa sổ: khuôn, kính, song sắt, rèm
    for nm, y0, y1, z0, z1 in [('so_duoi', WIN['y0'] - 0.04, WIN['y1'] + 0.04, WIN['z0'] - 0.05, WIN['z0']), ('so_tren', WIN['y0'] - 0.04, WIN['y1'] + 0.04, WIN['z1'], WIN['z1'] + 0.05), ('so_trai', WIN['y0'] - 0.04, WIN['y0'], WIN['z0'], WIN['z1']), ('so_phai', WIN['y1'], WIN['y1'] + 0.04, WIN['z0'], WIN['z1'])]:
        box(nm, W - 0.06, W + 0.02, y0, y1, z0, z1, m['viền'], bevel=0.004, coll=coll)
    box('kinh_so', W - 0.005, W + 0.005, WIN['y0'], WIN['y1'], WIN['z0'], WIN['z1'], m['kinh'], coll=coll)
    box('nep_so', W - 0.02, W + 0.01, (WIN['y0'] + WIN['y1']) / 2 - 0.012, (WIN['y0'] + WIN['y1']) / 2 + 0.012, WIN['z0'], WIN['z1'], m['thep'], coll=coll)
    for i in range(9):
        y = WIN['y0'] + 0.07 + i * (WIN['y1'] - WIN['y0'] - 0.14) / 8
        cyl(f'song{i}', W + 0.045, y, (WIN['z0'] + WIN['z1']) / 2, 0.008, WIN['z1'] - WIN['z0'] + 0.1, m['thep'], coll=coll)
    for z in (WIN['z0'] + 0.02, WIN['z1'] - 0.02):
        box(f'thanh_song_{z:.2f}', W + 0.035, W + 0.055, WIN['y0'] - 0.02, WIN['y1'] + 0.02, z - 0.012, z + 0.012, m['thep'], coll=coll)
    # rèm dồn về phía y lớn (kéo hé), nhiều nếp
    for i in range(8):
        y = WIN['y1'] + 0.03 - i * 0.032; d = 0.03 + 0.012 * (i % 2)
        box(f'rem{i}', W - 0.07 - d, W - 0.07, y - 0.036, y, WIN['z0'] - 0.18, WIN['z1'] + 0.12, m['rem'], bevel=0.008, coll=coll)
    cyl('thanh_rem', W - 0.08, (WIN['y0'] + WIN['y1']) / 2, WIN['z1'] + 0.14, 0.012, WIN['y1'] - WIN['y0'] + 0.5, m['thep'], axis='Y', coll=coll)


# ------------------------------------------------------------------ đồ đạc
def kitchen(m, coll):
    x0, x1, y0, y1, h = 0.02, 1.05, 0.02, 0.57, 0.84
    box('tu_bep', x0, x1, y0, y1, 0.07, h, m['tu_bep'], bevel=0.01, coll=coll)
    box('chan_tu_bep', x0 + 0.02, x1 - 0.02, y0 + 0.02, y1 - 0.04, 0, 0.07, m['den'], coll=coll)
    box('mat_bep', x0 - 0.0, x1 + 0.01, y0, y1 + 0.03, h, h + 0.035, m['mat_bep'], bevel=0.008, coll=coll)
    for i in range(3):  # 3 cánh tủ + tay nắm
        a = x0 + 0.015 + i * 0.335
        box(f'canh_tu{i}', a, a + 0.31, y1, y1 + 0.018, 0.1, h - 0.03, m['tu_bep'], bevel=0.008, coll=coll)
        box(f'nam_tu{i}', a + 0.12, a + 0.18, y1 + 0.018, y1 + 0.032, 0.7, 0.72, m['inox'], bevel=0.004, coll=coll)
    box('chau_rua', 0.18, 0.62, 0.08, 0.5, h + 0.005, h + 0.036, m['inox'], coll=coll)  # mặt chậu inox
    box('long_chau', 0.2, 0.60, 0.1, 0.48, h - 0.06, h + 0.04, m['den'], coll=coll)  # lòng chậu sâu (tối)
    cyl('voi_dung', 0.4, 0.07, h + 0.15, 0.011, 0.3, m['inox'], coll=coll)
    cyl('voi_ngang', 0.4, 0.16, h + 0.295, 0.011, 0.19, m['inox'], axis='Y', coll=coll)
    cyl('voi_dau', 0.4, 0.25, h + 0.275, 0.014, 0.04, m['inox'], coll=coll)
    box('nen_gach_op', x0, x1, 0, 0.008, h + 0.036, 1.5, m['gach_op_mach'], coll=coll)
    nx, nz = 5, 3  # ốp gạch 20 × 20 cm: từng viên là khối riêng, có vát cạnh, hai tông màu xen kẽ
    tw, th = (x1 - x0) / nx, (1.5 - h - 0.036) / nz
    for i in range(nx):
        for j in range(nz):
            box(f'gach_op{i}_{j}', x0 + i * tw + 0.003, x0 + (i + 1) * tw - 0.003, 0.012, 0.02, h + 0.036 + j * th + 0.003, h + 0.036 + (j + 1) * th - 0.003, m['gach_op'] if (i + j) % 2 else m['gach_op2'], bevel=0.002, coll=coll)
    box('ke_bep', x0, x1, 0, 0.16, 1.5, 1.525, m['go_ban_cu'], bevel=0.004, coll=coll)
    for i, c in enumerate(['#d5b46a', '#a83f3a', '#efeadc', '#7ca87a']):  # cốc trên kệ
        cyl(f'coc{i}', 0.2 + i * 0.1, 0.08, 1.525 + 0.045, 0.032, 0.09, M.solid(f'coc{i}', c, 0.45), coll=coll)
    # giá bát và đĩa úp
    box('gia_bat', 0.66, 0.99, 0.09, 0.31, h + 0.035, h + 0.04, m['inox'], coll=coll)
    for i in range(5):  # đĩa úp trong giá, đứng sát nhau nhưng không chồng khối
        cyl(f'dia{i}', 0.70 + i * 0.055, 0.2, h + 0.13, 0.09, 0.008, m['nhua_trang'], axis='X', coll=coll, smooth=False)
    box('khan_mat', 0.7, 0.98, 0.34, 0.5, h + 0.036, h + 0.05, M.solid('khan', '#7fa9bd', 0.8), bevel=0.005, coll=coll)


def wardrobe(m, coll):
    x0, x1, y0, y1 = 1.30, 2.05, 0.02, 0.55
    wood = m['go_tu']
    box('tu_trai', x0, x0 + 0.025, y0, y1, 0, 1.92, wood, bevel=0.004, coll=coll)
    box('tu_phai', x1 - 0.025, x1, y0, y1, 0, 1.92, wood, bevel=0.004, coll=coll)
    box('tu_lung', x0 + 0.025, x1 - 0.025, y0, y0 + 0.012, 0, 1.92, m['go_toi'], coll=coll)
    for i, z in enumerate([0.0, 0.5, 1.0, 1.45, 1.89]):
        box(f'ke_tu{i}', x0, x1, y0 + 0.012, y1 - 0.004, z, z + 0.025, wood, bevel=0.003, coll=coll)
    cyl('thanh_ao', (x0 + x1) / 2, 0.3, 1.62, 0.009, x1 - x0 - 0.05, m['inox'], axis='X', coll=coll)
    for i in range(5):  # áo treo
        c = m['ao'][i % 4]
        box(f'ao_treo{i}', x0 + 0.1 + i * 0.12, x0 + 0.17 + i * 0.12, 0.2, 0.4, 1.12, 1.6, c, bevel=0.012, coll=coll)
    for k, (z, n) in enumerate([(0.525, 3), (1.025, 4), (0.025, 2)]):  # đồ gấp
        for i in range(n):
            box(f'ao_gap{k}{i}', x0 + 0.06 + i * 0.2, x0 + 0.24 + i * 0.2, 0.1, 0.46, z, z + 0.12 + 0.02 * (i % 2), m['ao'][(i + k) % 4], bevel=0.02, coll=coll)
    box('carton_noc', x0 + 0.05, x1 - 0.1, 0.1, 0.5, 1.915, 2.1, m['carton'], bevel=0.01, coll=coll)


def desk_and_chair(m, coll, chair_pos=None, chair_rot=0.0):
    x0, x1, y0, y1 = 2.10, 2.98, 0.02, 0.57
    top = m['go_ban']
    box('mat_ban', x0 - 0.02, x1, y0, y1 + 0.03, 0.71, 0.75, top, bevel=0.006, coll=coll)
    box('chan_ban_trai', x0, x0 + 0.04, y0 + 0.02, y1 - 0.02, 0, 0.71, m['go_ban_cu'], bevel=0.004, coll=coll)
    box('hop_tu', x1 - 0.42, x1 - 0.005, y0, y1, 0.0, 0.71, m['go_ban_cu'], bevel=0.005, coll=coll)
    for i, z in enumerate([0.07, 0.40]):
        box(f'ngan_keo{i}', x1 - 0.40, x1 - 0.025, y1, y1 + 0.02, z, z + 0.28, m['go_ban'], bevel=0.006, coll=coll)
        box(f'nam_keo{i}', x1 - 0.30, x1 - 0.13, y1 + 0.02, y1 + 0.035, z + 0.21, z + 0.23, m['inox'], bevel=0.004, coll=coll)
    box('hoc_lung', x0 + 0.04, x1 - 0.42, y0, y0 + 0.012, 0.0, 0.71, m['go_toi'], coll=coll)
    # giá sách trên bàn
    box('ke_sach_trai', x0 + 0.0, x0 + 0.02, y0, y0 + 0.2, 0.75, 1.25, m['go_toi'], coll=coll)
    box('ke_sach_phai', x0 + 0.46, x0 + 0.48, y0, y0 + 0.2, 0.75, 1.25, m['go_toi'], coll=coll)
    for i, z in enumerate([0.75, 1.0, 1.24]):
        box(f'ke_sach_t{i}', x0, x0 + 0.48, y0 + 0.003, y0 + 0.197, z, z + 0.02, m['go_toi'], coll=coll)
    for i in range(9):
        w = 0.025 + 0.01 * (i % 3); xx = x0 + 0.04 + sum(0.03 + 0.008 * (j % 3) for j in range(i))
        box(f'sach{i}', xx, xx + w, y0 + 0.02, y0 + 0.17, 0.77, 0.77 + 0.17 + 0.03 * (i % 2), m['bia'][i % 5], bevel=0.002, coll=coll)
    for i in range(6):
        box(f'sach_t{i}', x0 + 0.04 + i * 0.05, x0 + 0.08 + i * 0.05, y0 + 0.02, y0 + 0.17, 1.02, 1.2, m['bia'][(i + 2) % 5], bevel=0.002, coll=coll)
    # laptop (màn hình là nguồn sáng ban đêm — vật liệu `man_hinh` đổi theo chế độ)
    lx, ly = 2.79, 0.33  # đặt sát mép phải bàn, cách kệ sách 3 cm
    box('laptop_day', lx - 0.17, lx + 0.17, ly - 0.115, ly + 0.115, 0.75, 0.765, m['laptop'], bevel=0.005, coll=coll)
    # Bản lề ở mép sau (y nhỏ, phía tường); người ngồi ở y lớn. Màn hình dựng lên, ngả về phía tường; mặt hiển thị quay về người.
    scr = box('laptop_manhinh', lx - 0.17, lx + 0.17, ly - 0.12, ly - 0.105, 0.765, 0.765 + 0.23, m['laptop'], bevel=0.005, coll=coll, rot=(math.radians(14), 0, 0), pivot=(lx, ly - 0.11, 0.765))
    face = box('laptop_mat', lx - 0.158, lx + 0.158, ly - 0.1045, ly - 0.1005, 0.775, 0.765 + 0.215, m['man_hinh'], coll=coll, rot=(math.radians(14), 0, 0), pivot=(lx, ly - 0.11, 0.765))
    for i in range(3):  # sổ và giấy
        box(f'giay{i}', 2.80 + i * 0.01, 2.92 + i * 0.01, 0.33, 0.52, 0.75 + i * 0.004, 0.754 + i * 0.004, M.solid(f'giay{i}', '#ece3cf', 0.8), rot=(0, 0, math.radians(8 * i - 6)), coll=coll)
    # đèn bàn
    cyl('den_de', 2.66, 0.12, 0.76, 0.06, 0.02, M.solid('den_de', '#c7826a', 0.5), coll=coll)
    cyl('den_than', 2.66, 0.12, 0.93, 0.008, 0.34, M.solid('den_than', '#c7826a', 0.5), coll=coll)
    # chao đèn hình nón hở đáy (ánh sáng chiếu xuống), bóng đèn phát sáng khi bật
    bm_ = bmesh.new(); seg = 28; rg = [(0.035, 0.0), (0.085, -0.075)]
    rings_ = [[bm_.verts.new((r_ * math.cos(2 * math.pi * i / seg), r_ * math.sin(2 * math.pi * i / seg), h_)) for i in range(seg)] for (r_, h_) in rg]
    for i in range(seg):
        bm_.faces.new((rings_[0][i], rings_[0][(i + 1) % seg], rings_[1][(i + 1) % seg], rings_[1][i]))
    bmesh.ops.recalc_face_normals(bm_, faces=bm_.faces)
    shade = _mesh_obj('den_chup', bm_, (mx(2.66), 0.12, 1.14), M.solid('den_chup', '#d99379', 0.45), True, coll)
    md_ = shade.modifiers.new('day', 'SOLIDIFY'); md_.thickness = 0.004
    sphere('den_bong', 2.66, 0.12, 1.085, 0.022, M.emission('den_bong', '#ffc890', 25.0) if DEN_BAN_ON else M.solid('den_bong_tat', '#f2e6d0', 0.3), coll=coll)
    # ghế làm việc (mặt ghế thật 0,46 m) — quay mặt vào bàn (−y); tâm (x, y) chỗ ngồi
    cx, cy = chair_pos or (SEAT['x'], SEAT['y'])
    chair(m, coll, cx, cy, chair_rot)


def chair(m, coll, cx, cy, rot=0.0):
    """Ghế bốn chân. `rot` (rad) quay quanh trục đứng, 0 = mặt ghế hướng −y (về phía bàn); lưng ghế ở +y."""
    objs = []
    c, s = math.cos(rot), math.sin(rot)
    def at(lx, ly): return (cx + lx * c - ly * s, cy + lx * s + ly * c)
    def part(name, lx0, lx1, ly0, ly1, z0, z1, mat, bevel=0.006):
        pts = [at(lx0, ly0), at(lx1, ly0), at(lx1, ly1), at(lx0, ly1)]
        xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
        return box(name, min(xs), max(xs), min(ys), max(ys), z0, z1, mat, bevel=bevel, coll=coll, rot=(0, 0, rot), pivot=(cx, cy, 0))
    part('ghe_mat', -0.21, 0.21, -0.21, 0.21, 0.42, 0.46, m['go_ghe'], 0.012)
    for i, (lx, ly) in enumerate([(-0.18, -0.18), (0.18, -0.18), (-0.18, 0.18), (0.18, 0.18)]):
        part(f'ghe_chan{i}', lx - 0.016, lx + 0.016, ly - 0.016, ly + 0.016, 0, 0.42, m['khung_ghe'], 0.004)
    for i, lx in enumerate([-0.17, 0.17]):
        part(f'ghe_lung_cot{i}', lx - 0.016, lx + 0.016, 0.18, 0.21, 0.46, 0.92, m['khung_ghe'], 0.004)
    part('ghe_lung', -0.20, 0.20, 0.17, 0.205, 0.66, 0.92, m['go_ghe'], 0.012)


def bed(m, coll):
    x0, x1, y0, y1 = 1.58, 2.98, 2.05, 3.95
    box('nem', x0, x1, y0, y1, 0.0, 0.24, m['nem'], bevel=0.05, coll=coll)
    box('ga_giuong', x0 + 0.01, x1 - 0.01, y0 + 0.01, y1 - 0.01, 0.235, 0.25, m['ga'], bevel=0.012, coll=coll)
    for i, x in enumerate([2.0, 2.52]):
        p = box(f'goi{i}', x - 0.25, x + 0.25, y1 - 0.42, y1 - 0.06, 0.25, 0.34, m['goi'], bevel=0.035, coll=coll, rot=(math.radians(3), 0, math.radians(2 - 4 * i)), pivot=(x, y1 - 0.24, 0.25))
    cb = box('chan_nem', x0 + 0.02, x1 - 0.02, y0 + 0.75, y1 - 0.45, 0.25, 0.31, m['chan'], bevel=0.04, coll=coll, rot=(0, 0, math.radians(2)), pivot=((x0 + x1) / 2, (y0 + y1) / 2, 0.25))
    box('chan_cuon', x0 + 0.05, x0 + 0.55, y0 + 0.62, y0 + 0.88, 0.25, 0.37, m['chan'], bevel=0.05, coll=coll, rot=(0, 0, math.radians(12)), pivot=(x0 + 0.3, y0 + 0.75, 0.25))


def fan(m, coll, x=0.42, y=3.72, yaw=0.0, blade=0.0):
    cyl('quat_de', x, y, 0.015, 0.17, 0.03, m['den'], coll=coll)
    cyl('quat_cot', x, y, 0.55, 0.014, 1.0, m['thep'], coll=coll)
    cyl('quat_motor', x, y, 1.12, 0.07, 0.16, m['nhua_trang'], axis='X', coll=coll)
    for i, rr in enumerate([0.2, 0.15, 0.1, 0.05]):
        torus(f'quat_long{i}', x + 0.075, y, 1.12, rr, 0.003, m['thep'], rot=(0, math.pi / 2, 0), coll=coll)
    for i in range(3):
        a = blade + i * 2 * math.pi / 3
        b = box(f'quat_canh{i}', x + 0.09, x + 0.097, y - 0.02, y + 0.02, 1.12 + 0.01, 1.12 + 0.17, M.solid('canh_quat', '#8fb0a2', 0.5), bevel=0.003, coll=coll, rot=(a, 0, 0), pivot=(x + 0.09, y, 1.12))
    sphere('quat_tam', x + 0.1, y, 1.12, 0.022, m['nhua_trang'], coll=coll)


def wire(name, p1, p2, r, mat, coll=None):
    """Dây điện mảnh giữa hai điểm (toạ độ thiết kế, hàm tự phản chiếu)."""
    a = Vector((mx(p1[0]), p1[1], p1[2])); b = Vector((mx(p2[0]), p2[1], p2[2]))
    d = b - a; ln = d.length
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=8, radius1=r, radius2=r, depth=ln)
    return _mesh_obj(name, bm, (a + b) / 2, mat, False, coll, quat=Vector((0, 0, 1)).rotation_difference(d.normalized()))


def wall_details(m, coll):
    """Chi tiết sinh hoạt: giấy note cạnh kệ bàn học, ổ điện + dây sạc laptop, lịch treo đầu nệm, công tắc đèn đầu giường,
    móc khăn/muôi cạnh bếp, thảm chùi chân trước cửa, chai nước và lọ gia vị trên kệ bếp. Toạ độ thiết kế."""
    for i, (x, z, c, rot) in enumerate([(2.22, 1.45, '#f4e7a1', 4), (2.40, 1.22, '#bfe3d6', -3), (2.58, 1.50, '#f7c9b6', 2)]):
        box(f'note{i}', x, x + 0.11, 0.0, 0.003, z, z + 0.14, M.solid(f'note_{i}', c, 0.9), coll=coll, rot=(0, 0, math.radians(rot)), pivot=(x, 0, z))
    box('tkb', 2.66, 2.84, 0.0, 0.003, 1.02, 1.30, M.solid('tkb', '#efeee6', 0.9), coll=coll)
    box('o_dien_ban', 2.02, 2.12, 0.0, 0.012, 0.80, 0.88, m['viền'], bevel=0.003, coll=coll)
    wire('day_sac', (2.07, 0.012, 0.80), (2.84, 0.22, 0.765), 0.0045, m['den'], coll=coll)
    box('lich_khung', 2.15, 2.45, D - 0.012, D, 1.25, 1.55, m['go_toi'], bevel=0.004, coll=coll)  # trên tường đầu giường (trước đây nằm lọt khung cửa)
    box('lich_giay', 2.19, 2.41, D - 0.016, D - 0.012, 1.28, 1.52, M.solid('lich', '#f4f1e6', 0.9), coll=coll)
    box('cong_tac_giuong', 0.0, 0.012, 2.20, 2.27, 1.02, 1.09, m['viền'], bevel=0.003, coll=coll)
    box('thanh_khan', 0.10, 0.45, 0.0, 0.02, 1.12, 1.13, m['inox'], bevel=0.004, coll=coll)
    box('khan_treo', 0.14, 0.22, 0.0, 0.006, 0.86, 1.10, M.solid('khan_bep', '#e9d3a4', 0.95), bevel=0.005, coll=coll)
    box('muoi_moc', 0.30, 0.34, 0.0, 0.015, 1.12, 1.15, m['inox'], coll=coll)
    cyl('muoi_can', 0.32, 0.12, 1.05, 0.006, 0.20, m['inox'], coll=coll, rot=(math.radians(-90), 0, 0))
    cyl('muoi_dau', 0.32, 0.24, 1.03, 0.028, 0.012, m['inox'], axis='Y', coll=coll)
    box('tham_chui', 0.10, 0.60, 2.10, 2.80, 0.0, 0.015, M.mottled('tham', '#7c6f5a', rough=1.0, scale=40, vary=0.12, bump=0.6, bump_scale=300), bevel=0.006, coll=coll)
    for i, (x, c, r) in enumerate([(0.56, '#c9e0ea', 0.034), (0.66, '#d9b48a', 0.030), (0.76, '#b84a3c', 0.026)]):
        cyl(f'lo_gia_vi{i}', x, 0.07, 1.545 + 0.06, r, 0.12, M.solid(f'gia_vi{i}', c, 0.25), coll=coll, bevel=0.004)
    cyl('chai_nuoc', 0.9, 0.09, 1.545 + 0.12, 0.05, 0.24, M.solid('chai_nuoc_nh', '#dfeef4', 0.15), coll=coll)


def mirror(m, coll):
    # gương đứng khung gỗ 0,5 × 1,2, dựa tường trái, nghiêng nhẹ
    box('khung_guong', 0.16, 0.19, 3.0, 3.52, 0.0, 1.22, m['go_toi'], bevel=0.008, coll=coll, rot=(0, math.radians(-6), 0), pivot=(0.16, 3.26, 0))  # chân gương cách tường 16 cm, đỉnh tựa tường
    box('mat_guong', 0.188, 0.192, 3.025, 3.495, 0.03, 1.19, m['guong'], coll=coll, rot=(0, math.radians(-6), 0), pivot=(0.16, 3.26, 0))


def clutter(m, coll, dep_san=False):
    # bình nước 20 L
    cyl('binh_nuoc', 1.17, 0.2, 0.2, 0.125, 0.4, m['nhua_xanh'], coll=coll)
    cyl('binh_co', 1.17, 0.2, 0.43, 0.05, 0.07, m['nhua_xanh'], coll=coll)
    box('carton_san', 0.12, 0.5, 0.75, 1.0, 0.0, 0.2, m['carton'], bevel=0.01, coll=coll, rot=(0, 0, math.radians(14)))
    # chổi dựa tường đầu bếp
    cyl('choi_can', 0.06, 0.64, 0.6, 0.011, 1.2, m['go_ban_cu'], coll=coll, rot=(math.radians(-5), 0, 0))
    box('choi_dau', 0.03, 0.1, 0.58, 0.66, 0.0, 0.1, M.solid('choi', '#d5b46a', 0.8), bevel=0.01, coll=coll)
    # thùng gạo/rác nhựa trắng
    cyl('thung', 1.5, 0.75, 0.15, 0.14, 0.3, m['nhua_trang'], coll=coll)
    # dép
    for i, (x, y, r) in enumerate([(0.4, 2.55, 20), (0.5, 2.7, 25)] if dep_san else []):
        box(f'dep{i}', x - 0.05, x + 0.05, y - 0.13, y + 0.13, 0.0, 0.025, M.solid('dep', '#425850', 0.7), bevel=0.01, coll=coll, rot=(0, 0, math.radians(r)))
    # tô mì trên sàn cạnh nệm
    cyl('to_mi', 1.35, 3.25, 0.05, 0.1, 0.1, m['nhua_trang'], coll=coll)
    # ổ cắm, công tắc
    box('o_cam', 2.06, 2.12, 0.0, 0.012, 0.9, 0.96, m['viền'], bevel=0.003, coll=coll)
    box('cong_tac', 0.0, 0.012, 2.96, 3.02, 1.25, 1.31, m['viền'], bevel=0.003, coll=coll)


def lights_fixture(m, coll):
    tube = box('den_tuyp', 1.0, 2.2, 1.9, 1.94, H - 0.09, H - 0.05, m['den_tuyp'], bevel=0.004, coll=coll)  # ống tuýp treo dưới trần 5 cm, không chạm mặt trần
    box('den_tuyp_chup', 0.98, 2.22, 1.88, 1.96, H - 0.05, H - 0.04, m['nhua_trang'], coll=coll)  # chụp nhựa mỏng dưới trần, không trùng mặt


# ------------------------------------------------------------------ hành lang (ngoài tường cửa, x < 0)
def hallway(m, coll, night):
    ex = -T  # mặt ngoài tường cửa
    X0 = -1.45  # mép ngoài lan can
    Y0, Y1 = -0.6, HL_Y1  # hành lang chạy dọc y; cầu thang xuống ở y < Y0
    box('san_hl', X0, ex, Y0, Y1, -0.1, 0.0, m['gach_hl'], coll=coll)
    box('mai_hl', X0 - 0.15, ex, Y0 - 1.3, Y1, H, H + 0.12, m['tran'], coll=coll)
    # tường dọc hành lang (các phòng khác) + cửa phòng bên cạnh
    wall = m['tuong']; lo = m['tuong_duoi']
    box('tuong_hl_a', ex - 0.0, 0.0, Y0, 0.0, -0.1, H, wall, coll=coll)  # nối góc sau của phòng Nam
    box('tuong_hl_b', ex, 0.0, D + T, Y1, -0.1, H, wall, coll=coll)  # từ sau góc trước (tránh trùng mặt với tuong_truoc_goc_trai → vệt đen)
    box('tuong_hl_a_duoi', ex - 0.004, ex, Y0, 0.0, 0, 1.1, lo, coll=coll)
    box('tuong_hl_b_duoi', ex - 0.004, ex, D + T, Y1, 0, 1.1, lo, coll=coll)
    box('tuong_hl_ngoai_phong_nam_duoi', ex - 0.004, ex, 0, DOOR['y0'], 0, 1.1, lo, coll=coll)
    box('tuong_hl_ngoai_phong_nam_duoi2', ex - 0.004, ex, DOOR['y1'], D, 0, 1.1, lo, coll=coll)
    for nm, a in [(f'cua_phong_{k}', 4.35 + 2.2 * k) for k in range(int((Y1 - 5.5) / 2.2))]:
        box(nm + '_khuon', ex - 0.03, ex + 0.02, a - 0.06, a + 0.91, 0, 2.16, m['viền'], bevel=0.004, coll=coll)
        box(nm, ex - 0.04, ex - 0.0, a, a + 0.85, 0, 2.10, M.mottled(nm + '_mau', ['#6d887c', '#8a7a62', '#6b7f95', '#9a6f5e', '#b0954f', '#6d6a7e', '#a3503f', '#4f857a'][int(round((a - 4.35) / 2.2)) % 8], rough=0.55, scale=3, vary=0.05, bump=0.05), bevel=0.006, coll=coll)
        box(nm + '_hoa', ex - 0.055, ex - 0.04, a + 0.04, a + 0.1, 0.96, 1.02, m['inox'], bevel=0.02, coll=coll)
        box(nm + '_tay', ex - 0.08, ex - 0.055, a + 0.065, a + 0.2, 0.985, 1.005, m['inox'], bevel=0.006, coll=coll)
        box(nm + '_so', ex - 0.045, ex - 0.04, a + 0.33, a + 0.52, 1.7, 1.82, M.solid('so_cua', '#efeadc', 0.5), coll=coll)
    # biển số phòng Nam + đồng hồ điện bên cạnh cửa
    box('so_phong_nam', ex - 0.012, ex, DOOR['y1'] + 0.12, DOOR['y1'] + 0.3, 1.78, 1.9, M.solid('so_nam', '#efeadc', 0.5), coll=coll)
    box('hop_dien', ex - 0.1, ex, DOOR['y0'] - 0.5, DOOR['y0'] - 0.25, 1.4, 1.75, M.solid('hop_dien', '#8a8783', 0.5), bevel=0.006, coll=coll)
    cyl('ong_nuoc', ex - 0.05, DOOR['y0'] - 0.12, 1.4, 0.022, 2.8, M.solid('ong_nuoc', '#cfd3cf', 0.45), coll=coll)
    # lan can: tường thấp + song sắt + tay vịn
    box('lancan_thap', X0, X0 + 0.14, Y0, Y1, 0.0, 0.5, m['tuong'], bevel=0.008, coll=coll)
    box('lancan_tay_vin', X0 - 0.01, X0 + 0.15, Y0, Y1, 1.0, 1.04, m['thep'], bevel=0.006, coll=coll)
    for i in range(int((Y1 - Y0) / 0.13)):
        cyl(f'lc_song{i}', X0 + 0.07, Y0 + 0.07 + i * 0.13, 0.75, 0.009, 0.5, m['thep'], coll=coll)
    for i in range(int((Y1 - Y0) / 2.0) + 1):
        box(f'lc_tru{i}', X0, X0 + 0.14, Y0 + i * 2.0, Y0 + i * 2.0 + 0.1, 0.5, 1.0, m['tuong'], bevel=0.005, coll=coll)
    # cầu thang xuống (y < Y0): 17 bậc 0,28 × 0,1718 chạm sân (z = −2,92); thành thấp bậc thang hai bên, tay vịn dốc + trụ + con tiện
    NB = 17; RI = 2.92 / NB; TR = 0.28; GZ = -2.92
    for i in range(NB):
        top = -RI * (i + 1); ya, yb = Y0 - TR * (i + 1), Y0 - TR * i
        box(f'bac{i}', X0 + 0.14, ex, ya, yb, top - 0.35, top, m['gach_hl'], bevel=0.004, coll=coll)
        box(f'bac_gio{i}', X0 + 0.14, ex, ya, ya + 0.012, top, top + RI, m['viền'], coll=coll)
        box(f'thang_ngoai{i}', X0, X0 + 0.14, ya, yb, GZ, top + 0.5, m['tuong'], bevel=0.004, coll=coll)   # thành ngoài bậc thang
        box(f'thang_trong{i}', ex - 0.12, ex, ya, yb, GZ, top + 1.1, m['tuong'], coll=coll)              # thành sát tường nhà
        if i % 2 == 0:  # con tiện tay vịn
            box(f'thang_contien{i}', X0 + 0.05, X0 + 0.08, ya + 0.1, ya + 0.13, top + 0.5, top + 0.98, m['thep'], coll=coll)
    ang_t = math.atan(RI / TR); Lr = math.hypot(TR * NB, RI * NB)
    box('lancan_cau_thang', X0 - 0.01, X0 + 0.15, Y0 - Lr, Y0, 1.0, 1.04, m['thep'], bevel=0.006, coll=coll, rot=(ang_t, 0, 0), pivot=(X0 + 0.07, Y0, 1.0))
    for i in (0, 4, 8, 12, 16):  # trụ đỡ tay vịn dốc
        ya = Y0 - TR * i - 0.12
        box(f'thang_tru{i}', X0 + 0.01, X0 + 0.13, ya, ya + 0.1, -RI * (i + 1) + 0.5, -RI * (i + 1) + 1.0 + 0.05, m['tuong'], bevel=0.005, coll=coll)
    box('thang_tru_cuoi', X0 - 0.01, X0 + 0.15, Y0 - TR * NB - 0.02, Y0 - TR * NB + 0.14, GZ, GZ + 1.1, m['tuong'], bevel=0.006, coll=coll)
    box('lancan_t1_cau_thang_chan', X0 - 0.02, X0 + 0.16, Y0 - 0.1, Y0 + 0.1, 0.5, 1.06, m['tuong'], bevel=0.006, coll=coll)  # trụ đầu thang
    # lan can che phần hở ở đầu nhà: (1) mép sàn tầng 3 nhô ra trên cầu thang, (2) chiếu nghỉ tầng 2 bên mép sân, (3) mép sàn đầu hành lang tầng 3
    z3_ = H + 0.12; yE = Y0 - 1.3
    def rail_h(nm, xa, xb, ya, yb, zf):  # tay vịn + thành thấp + con tiện trên mặt sàn z = zf
        box(nm + '_thap', xa, xb, ya, yb, zf, zf + 0.5, m['tuong'], bevel=0.005, coll=coll)
        box(nm + '_tay', xa - 0.01, xb + 0.01, ya - 0.01, yb + 0.01, zf + 1.0, zf + 1.04, m['thep'], bevel=0.005, coll=coll)
    rail_h('lc_dau_t3_ngang', X0 - 0.15, ex, yE, yE + 0.12, z3_)
    rail_h('lc_dau_t3_ngoai', X0 - 0.15, X0 - 0.03, yE, Y0, z3_)
    for i in range(int((ex - X0 + 0.15) / 0.14)):
        xx = X0 - 0.14 + i * 0.14
        box(f'lc_dau_t3_song_n{i}', xx, xx + 0.025, yE + 0.04, yE + 0.065, z3_ + 0.5, z3_ + 1.0, m['thep'], coll=coll)
    for i in range(int((Y0 - yE) / 0.14)):
        yy = yE + 0.14 + i * 0.14
        box(f'lc_dau_t3_song_o{i}', X0 - 0.10, X0 - 0.075, yy, yy + 0.025, z3_ + 0.5, z3_ + 1.0, m['thep'], coll=coll)
    # chiếu nghỉ tầng 2: lan can chắn ngang miệng cầu thang (chừa lối xuống ở giữa) + trụ góc
    box('lc_chieu_nghi_trai', X0, X0 + 0.14, Y0 - 0.02, Y0 + 0.06, 0.0, 1.06, m['tuong'], bevel=0.006, coll=coll)
    box('lc_chieu_nghi_phai', ex - 0.12, ex, Y0 - 0.02, Y0 + 0.06, 0.0, 1.06, m['tuong'], coll=coll)
    box('lc_chieu_nghi_dam', X0, ex, Y0 + 0.0, Y0 + 0.03, 2.25, 2.3, m['viền'], coll=coll)  # dầm cổng chiếu nghỉ
    # đèn tuýp hành lang
    for k in range(int((Y1 - 2.3) / 4.9) + 1):
        box(f'den_tuyp_hl{k}', -1.0, -0.4, 2.3 + 4.9 * k, 2.34 + 4.9 * k, H - 0.04, H - 0.01, m['den_tuyp_hl'], bevel=0.004, coll=coll)
    # đồ phơi + chậu cây + giày dép đặt dọc hành lang
    cyl('chau_cay', -1.15, 5.2, 0.16, 0.15, 0.3, M.solid('chau', '#b0605a', 0.6), coll=coll, bevel=0.012)
    cyl('dat_chau', -1.15, 5.2, 0.31, 0.13, 0.02, M.solid('dat', '#5a4a3a', 0.95), coll=coll, smooth=False)
    import random; rnd = random.Random(7)
    cyl('chau_cay_than', -1.15, 5.2, 0.4, 0.014, 0.26, M.solid('than_cay', '#5a4a2a', 0.9), coll=coll)  # thân/cành nối đất với tán lá
    for i in range(11):
        a = rnd.uniform(0, 6.283); r = rnd.uniform(0.0, 0.12); h = 0.38 + rnd.uniform(0.0, 0.14)
        sphere(f'la{i}', -1.15 + r * math.cos(a), 5.2 + r * math.sin(a), h, rnd.uniform(0.08, 0.12), m['cay'], scale=(1.0, 1.0, 0.55), coll=coll)
    for i in range(3):
        box(f'giay{i}', -0.45, -0.25, 4.7 + i * 0.22, 4.86 + i * 0.22, 0.0, 0.08, M.solid('giay_hl', '#8a8783', 0.7), bevel=0.02, coll=coll, rot=(0, 0, math.radians(10 * i)))
    import moi_truong; moi_truong.build(sys.modules[__name__], m, coll, night, HL_Y1)
    import canh_dong; canh_dong.build(sys.modules[__name__], coll, night, MODE_HIEN_TAI)   # trời (mặt trời/trăng/mây), xe chạy, người đi, chim
    import ktt_ha_noi; ktt_ha_noi.build(sys.modules[__name__], coll, night, MODE_HIEN_TAI)   # chi tiết khu tập thể Hà Nội + hàng rong


def hallway_details(m, coll, night):
    """Chi tiết đời sống hành lang: dây điện, kệ giày, dây phơi, bình chữa cháy, bảng thông báo, đèn cửa, dầm mái."""
    ex = -T; X0 = -1.45; Y0, Y1 = -0.6, HL_Y1
    dark = M.solid('day_dien', '#2a2a2a', 0.5); red = M.solid('binh_cc', '#b3362c', 0.45)
    paper = M.solid('giay_tb', '#efe9d8', 0.8); cork = M.solid('bang_tb', '#b78c5a', 0.9)
    # dây điện chạy dọc tường, kẹp mỗi 0,6 m, rẽ xuống hộp điện
    box('day_dien_hl', ex - 0.012, ex, Y0, Y1, 2.52, 2.535, dark, coll=coll)
    for i in range(int((Y1 - Y0) / 0.6)):
        box(f'kep_day{i}', ex - 0.016, ex, Y0 + 0.3 + i * 0.6, Y0 + 0.33 + i * 0.6, 2.50, 2.555, m['viền'], coll=coll)
    box('day_dien_xuong', ex - 0.012, ex, DOOR['y0'] - 0.4, DOOR['y0'] - 0.385, 1.75, 2.52, dark, coll=coll)
    # dầm mái ngang mỗi 2,4 m
    for i in range(int((Y1 - Y0 - 1.2) / 2.4)):
        y = Y0 + 1.2 + i * 2.4
        box(f'dam_mai{i}', X0 - 0.15, ex, y, y + 0.18, H - 0.2, H, m['tuong'], bevel=0.006, coll=coll)
    # bóng đèn cầu chì trên cửa phòng Nam
    cyl('den_cua_de', -0.2, 2.47, H - 0.08, 0.03, 0.05, m['inox'], coll=coll)
    sphere('den_cua', -0.2, 2.47, H - 0.16, 0.06, m['den_tuyp_hl'], coll=coll)
    # kệ giày cạnh cửa phòng Nam (y 3.1–3.8), 2 tầng
    for k, z in enumerate([0.0, 0.32]):
        box(f'ke_giay{k}', ex - 0.30, ex - 0.02, 3.1, 3.8, z + 0.02, z + 0.04, m['go_ban'] if 'go_ban' in m else M.solid('ke_giay', '#8a6a46', 0.7), bevel=0.004, coll=coll)
    for xx in (ex - 0.30, ex - 0.04):
        for yy in (3.1, 3.77):
            box(f'ke_giay_chan_{xx:.2f}_{yy:.2f}', xx, xx + 0.03, yy, yy + 0.03, 0.0, 0.64, M.solid('ke_giay_c', '#8a6a46', 0.7), coll=coll)
    box('ke_giay_tren', ex - 0.30, ex - 0.02, 3.1, 3.8, 0.62, 0.65, M.solid('ke_giay_t', '#8a6a46', 0.7), bevel=0.004, coll=coll)
    cols = ['#3d4a6b', '#9a6a4a', '#d8d2c2', '#5b7a5e', '#a84a4a']
    for i in range(5):
        for k, z in enumerate([0.04, 0.34]):
            box(f'dep{k}_{i}', ex - 0.25, ex - 0.1, 3.16 + i * 0.13, 3.16 + i * 0.13 + 0.09, z, z + 0.07, M.solid(f'dep_{k}_{i}', cols[(i + k) % 5], 0.7), bevel=0.02, coll=coll, rot=(0, 0, math.radians(8 * ((i + k) % 3) - 8)))
    # dây phơi ngang hành lang (y = 6.0) + vài món đồ treo
    box('day_phoi', X0 + 0.07, ex - 0.02, 5.99, 6.01, 2.15, 2.17, dark, coll=coll)
    cyl('cot_phoi', X0 + 0.07, 6.0, 1.6, 0.012, 1.1, m['thep'], coll=coll)  # cột dựng từ tay vịn lan can
    box('moc_phoi', ex - 0.03, ex, 5.98, 6.02, 2.13, 2.19, m['thep'], coll=coll)
    for nm, y0, c, w, h in [('ao1', 6.03, '#9bb4c8', 0.42, 0.62), ('quan1', 6.50, '#586a8a', 0.30, 0.82), ('ao2', 6.92, '#e1c27a', 0.40, 0.58)]:
        box('phoi_' + nm, -0.95, -0.62, y0, y0 + 0.03, 2.17 - h, 2.17, M.solid('phoi_' + nm, c, 0.9), coll=coll)
    # bình chữa cháy + bảng thông báo gần cầu thang
    cyl('binh_cc', ex - 0.09, 0.15, 0.33, 0.07, 0.55, red, coll=coll, bevel=0.01)
    cyl('binh_cc_co', ex - 0.09, 0.15, 0.66, 0.03, 0.07, m['inox'], coll=coll)
    box('bang_cc', ex - 0.015, ex, 0.04, 0.26, 1.15, 1.45, M.solid('bang_cc', '#d9d3c0', 0.7), coll=coll)
    box('bang_cc_do', ex - 0.02, ex - 0.015, 0.04, 0.26, 1.35, 1.45, red, coll=coll)
    box('bang_tb', ex - 0.02, ex, 5.7, 6.5, 1.35, 1.95, cork, bevel=0.004, coll=coll)
    for i, (a, b, z) in enumerate([(5.74, 5.98, 1.65), (6.04, 6.28, 1.70), (5.80, 6.05, 1.40), (6.12, 6.42, 1.45)]):
        box(f'tb_giay{i}', ex - 0.026, ex - 0.02, a, b, z, z + 0.24, paper, coll=coll)
    # xô + chậu giặt + chổi trước phòng B
    cyl('xo_nuoc', -0.35, 4.1, 0.14, 0.12, 0.28, M.solid('xo_nuoc', '#4f86b5', 0.5), coll=coll, bevel=0.01)
    cyl('chau_nhua', -0.62, 4.0, 0.06, 0.22, 0.12, M.solid('chau_nhua', '#d9806a', 0.5), coll=coll, bevel=0.01)
    cyl('choi_hl', ex - 0.06, 3.95, 0.7, 0.01, 1.4, M.solid('choi_hl', '#8a6a46', 0.7), coll=coll, rot=(0, math.radians(4), 0))
    # vết ố chân tường + rãnh thoát nước sát lan can
    box('o_chan_tuong', ex - 0.006, ex, Y0, Y1, 0.0, 0.07, M.solid('o_chan', '#a89f8a', 0.9), coll=coll)
    box('ranh_nuoc', X0 + 0.14, X0 + 0.22, Y0, Y1, 0.0, 0.012, M.solid('ranh', '#8c8576', 0.8), coll=coll)


# ------------------------------------------------------------------ ánh sáng, thế giới, camera
# Chế độ thời gian: ang = góc tia nắng lệch khỏi phương thẳng đứng (độ), az = hướng ngang (độ)
TIME_MODES = {
    'day':    dict(energy=4.5, color='#fff0cf', ang=52, az=-12, bg='#cfe2ee', bgs=1.1, hat=60, exp=0.0),
    'dawn':   dict(energy=4.5, color='#d9e4ff', dirw=(0.55, 0.80, -0.22), bg='#a8bfe0', bgs=0.5, hat=22, exp=0.35),   # 06:30: nắng xiên xanh lơ lạnh pha vàng nhạt
    'noon':   dict(energy=14.0, color='#fffaf0', dirw=(0.30, -0.80, -0.56), bg='#d6e8f4', bgs=1.25, hat=32, exp=-0.15),  # trưa gắt: vệt nắng vuông lên mặt bàn
    'sunset': dict(energy=6.0, color='#ff9a48', dirw=(0.62, -0.74, -0.25), bg='#f0b484', bgs=0.45, hat=38, exp=0.2),   # Golden Hour: cam thẫm trườn từ bàn sang nệm
    'rain':   dict(energy=0.35, color='#c8d4dc', ang=60, az=0, bg='#8e99a2', bgs=0.95, hat=30, exp=0.3),   # chiều muộn sau mưa: u ám, không nắng
}
MODE_HIEN_TAI = 'day'
DEN_BAN_ON = False


def world_and_lights(mode, coll):
    w = bpy.data.worlds.new('troi'); bpy.context.scene.world = w; w.use_nodes = True
    nt = w.node_tree; bg = nt.nodes['Background']
    if mode != 'night':
        T = TIME_MODES[mode]
        bg.inputs['Color'].default_value = M._hex(T['bg']); bg.inputs['Strength'].default_value = T['bgs']
        import moi_truong; moi_truong.sky(nt, bg, False, mode)
        bpy.ops.object.light_add(type='SUN', location=(mx(8), 2, 6)); sun = bpy.context.object; sun.name = 'nang_cua_so'
        sun.data.energy = T['energy']; sun.data.color = M._hex(T['color'])[:3]; sun.data.angle = math.radians(0.5 if mode == 'noon' else 1.2 if mode != 'rain' else 12)
        if 'dirw' in T:  # hướng nắng cho trước trong toạ độ THẾ GIỚI (nắng sớm/chiều chạy xiên dọc hẻm, lọt cửa sổ chéo)
            sun.rotation_euler = Vector(T['dirw']).normalized().to_track_quat('-Z', 'Y').to_euler()
        else:
            sun.rotation_euler = mrot((0, math.radians(T['ang']), math.radians(T['az'])))  # ang>0 (thiết kế): nắng từ phía cửa sổ (+x) đi vào phòng
        _link(sun, coll)
    else:
        bg.inputs['Color'].default_value = M._hex('#243456'); bg.inputs['Strength'].default_value = 0.55
        tc = nt.nodes.new('ShaderNodeTexCoord'); sp = nt.nodes.new('ShaderNodeSeparateXYZ'); cr = nt.nodes.new('ShaderNodeValToRGB')
        nt.links.new(tc.outputs['Generated'], sp.inputs['Vector']); nt.links.new(sp.outputs['Z'], cr.inputs['Fac'])
        cr.color_ramp.elements[0].position = 0.45; cr.color_ramp.elements[0].color = M._hex('#4a5f8c')
        cr.color_ramp.elements[1].position = 0.85; cr.color_ramp.elements[1].color = M._hex('#0c1530')
        nt.links.new(cr.outputs['Color'], bg.inputs['Color'])
        import moi_truong; moi_truong.sky(nt, bg, True)
        bpy.ops.object.light_add(type='SUN', location=(8, 2, 6)); mo = bpy.context.object; mo.name = 'trang'
        mo.data.energy = 0.6; mo.data.color = M._hex('#6f8fd6')[:3]; mo.rotation_euler = mrot((0, math.radians(-40), math.radians(-12))); _link(mo, coll)


def add_area(name, loc, size, energy, color, rot=(0, 0, 0), shape='RECTANGLE', size_y=None, coll=None):
    bpy.ops.object.light_add(type='AREA', location=(mx(loc[0]), loc[1], loc[2])); l = bpy.context.object; l.name = name
    l.data.shape = shape; l.data.size = size
    if shape == 'RECTANGLE': l.data.size_y = size_y or size
    l.data.energy = energy; l.data.color = M._hex(color)[:3]; l.rotation_euler = mrot(rot)
    _link(l, coll or bpy.context.scene.collection)
    return l


def lighting(mode, coll):
    if mode != 'night':
        # đèn tuýp phòng tắt ban ngày; bổ sung ánh hắt mềm từ cửa sổ cho vùng khuất
        add_area('hat_cua_so', (W - 0.2, 2.0, 1.5), 1.2, TIME_MODES[mode]['hat'], '#ffe6c8' if mode == 'sunset' else ('#dfe8ff' if mode in ('dawn', 'rain') else '#fff3dc'), rot=(0, math.radians(90), 0), size_y=1.1, coll=coll)
    else:
        # nguồn chính ban đêm: màn hình laptop xanh lạnh 6500K (LAPTOP_LIGHT) + đèn tuýp hành lang ấm 4000K; đèn tuýp phòng tắt
        add_area('laptop_sang', (2.66, 0.20, 0.95), 0.3, 55, '#8fd0ff', rot=(math.radians(-80), 0, 0), size_y=0.2, coll=coll)
        add_area('hat_laptop_chan', (2.5, 0.5, 0.78), 0.8, 8, '#8fd0ff', rot=(0, 0, 0), coll=coll)
    if DEN_BAN_ON: den_ban_that(coll)
    for k in range(int((HL_Y1 - 2.3) / 4.9) + 1):
        add_area(f'tuyp_hanh_lang_{k}', (-0.7, 2.32 + 4.9 * k, H - 0.1), 0.6, 120 if mode == 'night' else 40, '#ffe9c8' if mode == 'night' else '#fff4e0', rot=(math.pi, 0, 0), size_y=0.05, coll=coll)


def khung_nang_ban(coll, w=0.46, h=0.30, tam=(0.55, 0.36, 0.75), s=1.2):
    """Khung chắn nắng (chỉ cản sáng, camera không thấy) vuông góc tia nắng, đặt ngay sau cửa sổ: nắng trưa lọt qua ô chữ nhật w×h → in thành HÌNH CHỮ NHẬT đúng lên mặt bàn (tâm `tam`)."""
    d = Vector(TIME_MODES['noon']['dirw']).normalized(); q = d.to_track_quat('-Z', 'Y')
    c = Vector(tam) - d * s; bm = bmesh.new(); R = 1.2; t = 0.01
    for (a0, a1, b0, b1) in [(-R, R, h / 2, R), (-R, R, -R, -h / 2), (-R, -w / 2, -h / 2, h / 2), (w / 2, R, -h / 2, h / 2)]:
        g = bmesh.ops.create_cube(bm, size=1.0)
        for v in g['verts']: v.co = Vector((a1 if v.co.x > 0 else a0, b1 if v.co.y > 0 else b0, t if v.co.z > 0 else -t))
    ob = _mesh_obj('khung_nang_ban', bm, c, M.solid('khung_nang', '#222222', 0.9), False, coll, quat=q)
    ob.visible_camera = False; ob.visible_diffuse = False; ob.visible_glossy = False; ob.visible_transmission = False
    return ob


def rem_khe(m, coll):
    """Rèm kéo gần kín, chừa khe hẹp giữa cửa sổ để nắng sớm lọt thành vệt xiên (06:30)."""
    cloth = M.solid('rem_sang_som', '#cdbfa6', 0.95)
    box('rem_khe_trai', W - 0.07, W - 0.04, WIN['y0'] - 0.05, 1.45, WIN['z0'] - 0.1, WIN['z1'] + 0.12, cloth, coll=coll)
    box('rem_khe_phai', W - 0.07, W - 0.04, 1.80, WIN['y1'] + 0.05, WIN['z0'] - 0.1, WIN['z1'] + 0.12, cloth, coll=coll)
    for i in range(7):  # nếp rèm
        yy = WIN['y0'] + i * 0.09
        box(f'rem_nep{i}', W - 0.075, W - 0.07, yy, yy + 0.012, WIN['z0'] - 0.1, WIN['z1'] + 0.12, M.solid('rem_nep', '#bfb094', 0.95), coll=coll)


def den_ban_that(coll):
    """Đèn bàn thật: đèn Spot 3200K chiếu từ chao xuống mặt bàn/bàn phím + bóng đèn phát sáng."""
    bpy.ops.object.light_add(type='SPOT', location=(mx(2.66), 0.12, 1.08)); sp = bpy.context.object; sp.name = 'den_ban_spot'
    sp.data.energy = 40; sp.data.color = M._hex('#ffa84a')[:3]; sp.data.spot_size = math.radians(95); sp.data.spot_blend = 0.55; sp.data.shadow_soft_size = 0.04
    tgt = Vector((mx(2.62), 0.38, 0.72)); sp.rotation_euler = (tgt - Vector((mx(2.66), 0.12, 1.08))).to_track_quat('-Z', 'Y').to_euler()
    _link(sp, coll)
    add_area('den_ban_hat', (2.5, 0.3, 1.0), 1.4, 6, '#ffa84a', rot=(0, 0, 0), coll=coll)   # ánh hắt mềm lên trần/tường quanh bàn


CAMERAS = {  # tên: (vị trí, điểm nhìn, tiêu cự mm)
    'WIDE': ((1.45, 5.0, 1.55), (1.5, 1.2, 1.0), 22),  # đứng ngoài tường trước (tường trước ẩn với camera) để thấy cả phòng 3 × 4 m
    'DESK': ((1.45, 1.9, 1.3), (2.55, 0.35, 0.95), 32),
    'BED': ((0.35, 0.9, 1.25), (2.3, 3.0, 0.45), 24),
    'DOOR': ((2.2, 3.0, 1.55), (0.0, 2.45, 1.15), 24),
    'KITCHEN': ((1.1, 2.1, 1.45), (0.45, 0.25, 1.0), 28),
    'HALL': ((-0.75, 9.3, 1.5), (-0.75, -1.8, 1.0), 24),
    'HALL_DOOR': ((-1.25, 5.2, 1.45), (-0.05, 2.5, 1.2), 28),
    'HALL_FACE': ((-1.3, 0.2, 1.5), (-0.05, 3.6, 1.2), 22),  # nhìn dọc hành lang về cửa phòng Nam từ phía cầu thang
    'HALL_STAIR': ((-0.7, 1.4, 1.6), (-0.7, -1.6, 0.2), 24),
    'HALL_END': ((-0.7, 0.1, 1.55), (-0.75, 9.0, 1.4), 22),
    'HALL_LONG': ((-0.75, 0.3, 1.5), (-0.75, 24.0, 1.4), 28),  # trục dài toàn hành lang
    'GUONG': ((1.8, 3.26, 1.35), (0.12, 3.26, 0.9), 28),  # đứng trước gương nhìn thẳng
    'GUONG_XIEN': ((1.7, 2.3, 1.35), (0.12, 3.3, 0.9), 30),  # nhìn xiên: gương hiện phần phòng đối diện + Người Kia
    'GUONG_VAI': ((1.3, 2.7, 1.45), (0.05, 3.26, 1.05), 40),  # qua vai Nam, thấy cả mặt gương
    'GUONG_POV': ((0.05, 3.26, 1.2), (2.0, 2.6, 1.0), 34),  # camera trong gương nhìn ra phòng
    # ---- máy theo danh sách shot (DUNG-CANH.md); mắt đứng ≈ 1,50 m, mắt ngồi ≈ 1,15 m cho nhân vật 1,60 m
    'A01': ((0.95, 0.35, 1.45), (2.3, 3.0, 0.55), 35),   # OTS từ bồn rửa sang nệm
    'A02': ((2.25, 3.0, 0.45), (2.1, 3.75, 0.33), 65),   # sát gối nệm
    'A02B': ((1.2, 1.4, 1.25), (2.3, 3.0, 0.7), 40),     # chéo 45° từ chân giường
    'A03': ((2.35, 3.75, 1.3), (0.5, 0.5, 1.2), 50),     # sau vai Nam nhìn về bếp
    'A04': ((1.35, 1.7, 1.5), (0.45, 0.35, 1.5), 65),    # reverse cận Người Kia ở bồn rửa
    'A04B': ((1.15, 1.9, 1.2), (1.95, 2.6, 1.1), 65),    # cận Nam ngồi mép nệm
    'A05': ((1.9, 1.7, 0.15), (2.3, 0.85, 0.35), 35),    # sàn thấp cạnh chân ghế
    'C05': ((0.6, 2.4, 1.1), (0.0, 2.15, 1.04), 85),   # macro then cửa
    'C06': ((2.9, 0.2, 2.25), (1.0, 2.4, 0.8), 35),      # cao 30° từ góc bàn xuống Nam và cửa
    'P203': ((1.7, 1.1, 0.82), (2.5, 0.3, 0.85), 40),    # thấp sát mặt bàn
    'P201VENT': ((0.25, 2.5, 1.85), (-1.4, 3.2, 1.6), 50),  # qua khe thông gió cửa nhìn hành lang
    'ORBIT_A': ((1.9, 2.2, 1.45), (0.12, 3.26, 1.0), 35),   # vòng cung quanh gương, góc 1
    'ORBIT_B': ((1.6, 3.26, 1.45), (0.12, 3.26, 1.0), 35),  # góc 2 (thẳng góc)
    'ORBIT_C': ((1.9, 4.3, 1.45), (0.12, 3.26, 1.0), 35),   # góc 3
    # ---- máy TOÀN THÂN (hướng A): ≤ 24 mm, máy ngoài tường (tường chắn ẩn). Người 1,60 m đứng ở điểm nhìn.
    'TT_GIUONG': ((4.0, 0.6, 1.5), (2.3, 3.0, 0.8), 22),    # A01/A02B: Nam trên/cạnh nệm
    'TT_BEP': ((2.6, 2.2, 1.5), (0.4, 0.45, 0.8), 22),      # A04: Người Kia ở bồn rửa
    'TT_GUONG': ((3.6, 3.26, 1.5), (0.9, 3.26, 0.8), 22),   # đứng trước gương nhìn xuyên tường cửa sổ
    'TT_CUA': ((2.9, 3.7, 1.5), (0.4, 2.5, 0.8), 22),       # C: người ở cửa/ngưỡng
    'TT_BAN': ((0.4, 2.2, 1.2), (2.48, 0.98, 0.7), 22),     # Nam ngồi bàn (người ngồi cao ≈ 1,2 m)
    'TOAN_CANH': ((-3.2, -10.5, 4.2), (-3.0, 12.0, 3.2), 20),  # từ sân nhìn lên nhà trọ + hành lang tầng 2
    'CUA_SO': ((2.55, 1.375, 1.5), (5.0, 1.375, 1.35), 24),     # nhìn ra hẻm qua cửa sổ phòng Nam
    'SAN_THUONG': ((-1.3, 9.0, 4.2), (-9.0, 14.0, 2.5), 20),
    'MAT_TIEN': ((-6.4, 7.0, 3.2), (-1.4, 7.0, 3.8), 24),   # nhìn thẳng mặt tiền nhà trọ từ sân (tầng 1–3, lan can, sàn)
    'DAU_NHA': ((-5.5, -7.0, 1.8), (-1.0, -0.5, 1.2), 22),   # đầu hành lang/cầu thang nhìn từ sân
    'TAY_NAM': ((1.0, 2.55, 1.15), (0.0, 2.12, 1.02), 50),   # nhìn tay nắm + ổ khóa cửa từ trong phòng
    'TAY_NAM_NGOAI': ((-0.8, 2.3, 1.15), (0.0, 2.12, 1.0), 50),  # tay nắm từ hành lang (cửa đóng: --door 0)
    'CAY': ((-0.9, 1.0, -0.4), (-4.2, 6.5, 0.2), 28),    # cây lớn ở sân (thân, cành, tán)
    'CAU': ((-3.4, 2.0, -1.8), (-6.5, 5.0, -1.2), 35),    # cau cảnh + bồn cây
    'CHAU_HL': ((-0.6, 3.6, 1.0), (-1.15, 5.2, 0.4), 35),  # chậu cây hành lang
    'GOC_DO': ((-3.6, -12.4, -1.2), (-0.6, -8.0, -2.0), 22),   # S07: góc đồ cho tặng ở chân cầu thang, nhìn từ sân
    'GOC_DO_TO_GIAY': ((-1.2, -6.4, -1.5), (0.0, -6.4, -1.4), 50),   # cận tờ giấy "Ai cần cứ lấy"
    'GOC_DO_QUAY': ((-2.4, -12.0, -1.9), (-0.5, -10.4, -2.3), 32),   # cận bàn nhận đồ
    'TROI_NANG': ((-4.7, 0.0, 22.0), (20.8, 39.0, 62.0), 24),   # ngước nhìn mặt trời + mây
    'TROI_TRANG': ((-4.7, 0.0, 22.0), (-22.0, -30.0, 71.0), 24),   # ngước nhìn trăng
    'SAN_XE': ((-7.0, -12.0, -1.6), (-4.8, 0.0, -2.4), 30),   # ngang tầm mắt nhìn dọc sân: xe, ô tô, người
    'VIA_HE': ((-5.0, 3.2, -1.9), (-7.1, -1.5, -2.5), 30),   # nhìn dọc vỉa hè: người bán ngồi ven đường
    'VIA_HE_2': ((-5.2, 8.0, -1.9), (-7.0, 16.0, -2.5), 30),
    'GOC_DO_GUONG': ((-1.6, -5.2, -1.9), (-0.15, -7.0, -1.9), 40),   # cận chiếc gương cũ bám bụi
    'TUONG_CUA': ((2.5, 1.2, 1.3), (0.0, 1.2, 0.9), 28),   # nhìn tường cửa từ phía cửa sổ (kiểm vệt nắng sớm/chiều)
    'TOP': ((1.5, 2.0, 5.6), (1.5, 2.0, 0.0), 24),
    'LOW': ((1.0, 3.7, 0.35), (2.2, 0.6, 1.0), 24),
}


def add_camera(name, mm=28, w=1280, h=536):
    pos, tgt, f = CAMERAS[name]
    pos = (mx(pos[0]), pos[1], pos[2]); tgt = (mx(tgt[0]), tgt[1], tgt[2])
    cam = bpy.data.cameras.new(name); cam.lens = f; cam.sensor_width = 36.0; cam.sensor_fit = 'HORIZONTAL'
    cam.clip_start = 0.05; cam.clip_end = 200
    ob = bpy.data.objects.new(name, cam); bpy.context.scene.collection.objects.link(ob)
    ob.location = pos
    d = Vector(tgt) - Vector(pos); ob.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    if name == 'TOP': ob.rotation_euler = (0, 0, math.radians(-90))
    return ob


def an_tuong_theo_camera(coll, pos):
    """Camera đặt ngoài phòng thì ẩn (chỉ với tia camera; bóng/phản xạ giữ nguyên) mọi vật nằm hẳn ở phía tường chắn:
    cửa sổ (x > W), cửa (x < 0), sau (y < 0), trước (y > D). Dùng hộp bao theo toạ độ thiết kế; giữ sàn/trần/gương."""
    keep = ('san_', 'tran_', 'mat_guong', 'khung_guong', 'nguoi_chuan', 'proxy', 'env_')
    def design_bbox(o):
        vs = [o.matrix_world @ v.co for v in o.data.vertices]
        xs = [W - v.x for v in vs]; ys = [v.y for v in vs]
        return min(xs), max(xs), min(ys), max(ys)
    for o in coll.objects:
        if o.type != 'MESH' or not o.data.vertices or o.name.startswith(keep): continue
        x0, x1, y0, y1 = design_bbox(o)
        hide = (pos[0] > W and x0 >= W - 0.13) or (pos[0] < 0 and x1 <= 0.03) or (pos[1] < 0 and y1 <= 0.03) or (pos[1] > D and y0 >= D - 0.03)
        if hide: o.visible_camera = False


def figure_proxy(name, x, y, mat, coll, h=1.6):
    """Hình nhân tạm cao 1,60 m (để thử bố cục/gương trước khi có nhân vật modular)."""
    o1 = cyl(name + '_than', x, y, h * 0.42, 0.17, h * 0.84, mat, coll=coll, bevel=0.02)
    o2 = sphere(name + '_dau', x, y, h - 0.12, 0.11, mat, coll=coll)
    return [o1, o2]


def proxies(m, coll, room_objs):
    """Nam (thật, ẩn khỏi phản xạ gương) và Người Kia (chỉ hiện trong gương, đặt ở điểm đối xứng của chỗ muốn hiện)."""
    import cong_guong as G
    nam = M.solid('proxy_nam', '#4f7fb0', 0.6); kia = M.solid('proxy_kia', '#b0504f', 0.6)
    nam_o = figure_proxy('nam_proxy', 1.3, 1.5, nam, coll)
    G.hide_from_mirror(nam_o)  # gương không phản chiếu Nam: Người Kia chiếm kính
    kx, ky, _ = G.reflect_point(-0.8, 4.0, 0)  # muốn hiện ở (x, y) = (−0,8, 4,0) sau kính
    kia_o = figure_proxy('kia_proxy', kx, ky, kia, coll)
    G.only_in_mirror(kia_o)


def _thiet_bi(sc):
    """Chọn thiết bị Cycles: mặc định CPU; đặt biến môi trường BLENDER_DEVICE=GPU để dùng GPU (thử OPTIX → CUDA → HIP → METAL → ONEAPI).
    Không có GPU thì tự quay về CPU và in cảnh báo."""
    import os
    want = os.environ.get('BLENDER_DEVICE', 'CPU').upper()
    sc.cycles.device = 'CPU'
    if want == 'CPU': return
    try:
        try: bpy.ops.preferences.addon_enable(module='cycles')
        except Exception: pass
        prefs = bpy.context.preferences.addons['cycles'].preferences
        for t in ('OPTIX', 'CUDA', 'HIP', 'METAL', 'ONEAPI'):
            try:
                prefs.compute_device_type = t; prefs.get_devices()
            except Exception:
                continue
            gpus = [d for d in prefs.devices if d.type == t]
            if gpus:
                for d in prefs.devices: d.use = (d.type == t)
                sc.cycles.device = 'GPU'
                print(f'[render] dùng GPU {t}: ' + ', '.join(d.name for d in gpus))
                return
        print('[render] không thấy GPU, dùng CPU')
    except Exception as e:
        print('[render] không bật được GPU, dùng CPU:', e)


def build(mode='day', door_open=10.0, chair_rot=0.0, fan_angle=0.0, cam='WIDE', res=(1280, 536), dep_san=False, guong='real', proxy=False, hide_front=None, cutaway=None, figure=None, den_ban=None, goc_do=None):
    global MODE_HIEN_TAI, DEN_BAN_ON
    MODE_HIEN_TAI = mode; DEN_BAN_ON = (mode == 'night') if den_ban is None else bool(den_ban)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    coll = bpy.data.collections.new('Phong_tro_3D'); sc.collection.children.link(coll)
    m = make_materials()
    m['man_hinh'] = M.emission('man_hinh', '#a9dcff' if mode == 'night' else '#7e8d9a', 6.0 if mode == 'night' else 0.9)
    m['den_tuyp'] = M.solid('den_tuyp_tat', '#f4f1e6', 0.35)  # đèn tuýp trần đang tắt: sứ mờ, không đen
    m['den_tuyp_hl'] = M.emission('den_tuyp_hl', '#fff1d6', 14.0 if mode == 'night' else 2.5)
    m['dd_cua_so'] = M.emission('dd_cua_so', '#ffd89a', 3.0) if mode == 'night' else M.solid('dd_cua_so_ngay', '#4f6670', 0.2)
    shell(m, coll, door_open, cutaway=(cam in ('TOP',)) if cutaway is None else cutaway, hide_front=(CAMERAS[cam][0][1] > D) if hide_front is None else hide_front); kitchen(m, coll); wardrobe(m, coll); desk_and_chair(m, coll, chair_rot=chair_rot); bed(m, coll); fan(m, coll, blade=fan_angle)
    if MODE_HIEN_TAI == 'dawn': rem_khe(m, coll)
    if MODE_HIEN_TAI == 'noon': khung_nang_ban(coll)
    mirror(m, coll); clutter(m, coll, dep_san=dep_san); wall_details(m, coll); lights_fixture(m, coll); room_objs = set(coll.objects); hallway(m, coll, mode == 'night'); hallway_details(m, coll, mode == 'night')
    world_and_lights(mode, coll); lighting(mode, coll)
    if mode != 'night' and mode != 'rain':
        # Hẻm hẹp bị nhà hàng xóm 4 tầng che hết nắng trực tiếp (đúng thực tế); để có vệt nắng điện ảnh qua cửa sổ, các khối nhà bên hẻm không đổ bóng của MẶT TRỜI
        for o in coll.objects:
            if o.name.startswith(('env_hem_tuong', 'env_hem_san', 'env_khoi_', 'env_nha_doi_dien', 'env_nha_dd', 'env_dd_', 'env_dd2', 'env_hem_long', 'env_hc_hien', 'env_hc_bc_san', 'env_xa_toa', 'env_hem_ong')):
                o.visible_shadow = False
        # đồ xa (nhà cao tầng chân trời, cần cẩu, tháp, cây xa, cột điện…) cũng không đổ bóng nắng thấp vào phòng
        ctr = Vector((mx(1.5), 2.0, 1.0))
        for o in coll.objects:
            if o.name.startswith('env_') and o.type == 'MESH' and (o.matrix_world.translation - ctr).length > 7.0 and not o.name.startswith(('env_hc_', 'env_hem_')):
                o.visible_shadow = False
            elif o.name.startswith('env_') and o.type == 'MESH' and o.data.vertices:
                bb = [o.matrix_world @ v.co for v in list(o.data.vertices)[:40]]
                if min((b - ctr).length for b in bb) > 14.0: o.visible_shadow = False
    if goc_do or (goc_do is None and mode == 'rain'):
        import goc_cho_tang; goc_cho_tang.build(sys.modules[__name__], coll, mua=(mode == 'rain'))
    if proxy: proxies(m, coll, room_objs)
    if figure: figure_proxy('nguoi_chuan', figure[0], figure[1], M.solid('nguoi_chuan', '#4f7fb0', 0.6), coll, h=figure[2] if len(figure) > 2 else 1.6)
    _hf = (CAMERAS[cam][0][1] > D) if hide_front is None else hide_front
    for _n in ('lich_khung', 'lich_giay'):
        if _n in bpy.data.objects: bpy.data.objects[_n].visible_camera = not _hf  # gắn trên tường trước: ẩn cùng tường khi máy ở ngoài
    if cam.startswith('TT_'): an_tuong_theo_camera(coll, CAMERAS[cam][0])
    import moi_truong; moi_truong.an_khoi(coll, CAMERAS[cam][0], sys.modules[__name__])
    if guong == 'pov':
        import cong_guong; cong_guong.pov_trong_guong(coll)
    co = add_camera(cam); sc.camera = co
    sc.render.engine = 'CYCLES'; _thiet_bi(sc); sc.cycles.samples = 96; sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 6; sc.cycles.diffuse_bounces = 4; sc.cycles.glossy_bounces = 3; sc.cycles.transmission_bounces = 4; sc.cycles.transparent_max_bounces = 8
    sc.render.resolution_x, sc.render.resolution_y = res; sc.render.resolution_percentage = 100
    sc.view_settings.view_transform = 'AgX'; sc.view_settings.exposure = 0.4 if mode == 'night' else TIME_MODES[mode]['exp']
    sc.render.image_settings.file_format = 'PNG'
    return sc


if __name__ == '__main__':
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser()
    ap.add_argument('--mode', default='day'); ap.add_argument('--cam', default='WIDE'); ap.add_argument('--out', default='/tmp/phong_tro.png')
    ap.add_argument('--blend', default=''); ap.add_argument('--door', type=float, default=10.0); ap.add_argument('--chair-rot', type=float, default=0.0)
    ap.add_argument('--dep-san', action='store_true'); ap.add_argument('--guong', default='real'); ap.add_argument('--den-ban', default=None, choices=['on', 'off']); ap.add_argument('--goc-do', action='store_true', default=None); ap.add_argument('--proxy', action='store_true'); ap.add_argument('--figure', default=''); ap.add_argument('--samples', type=int, default=96); ap.add_argument('--width', type=int, default=1280); ap.add_argument('--no-render', action='store_true')
    a = ap.parse_args(argv)
    sc = build(a.mode, a.door, a.chair_rot, 0.0, a.cam, (a.width, round(a.width / 2.39)), dep_san=a.dep_san, guong=a.guong, proxy=a.proxy, den_ban=(None if a.den_ban is None else a.den_ban == 'on'), goc_do=a.goc_do, figure=tuple(float(v) for v in a.figure.split(',')) if a.figure else None)
    sc.cycles.samples = a.samples
    if a.blend: bpy.ops.wm.save_as_mainfile(filepath=a.blend)
    if not a.no_render:
        sc.render.filepath = a.out; bpy.ops.render.render(write_still=True)
