"""Bộ kiểm biến dạng cho đầu diễn hoạt: đặt điều khiển, đo môi/con ngươi, phát hiện xuyên nhãn cầu, khe sáng khi nhắm,
môi hở khi đóng, răng/lưỡi xuyên, nhìn xuyên đầu qua miệng, lật mặt (gấp/rách), mày trôi khỏi da."""
import math
import numpy as np
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree

DIEU_KHIEN_ARM = ('jaw_open', 'look_x', 'look_y')

# Các tổ hợp trong yêu cầu kiểm biến dạng (mục 8)
TRANG_THAI_KIEM = [
    {'ten': 'nghỉ', 'dk': {}, 'mieng_dong': True},
    {'ten': 'nhắm hai mắt', 'dk': {'blink_L': 1, 'blink_R': 1}, 'mieng_dong': True},
    {'ten': 'nhắm trái', 'dk': {'blink_L': 1}}, {'ten': 'nhắm phải', 'dk': {'blink_R': 1}},
    {'ten': 'nhìn trái + chớp nửa', 'dk': {'look_x': -1, 'blink_L': 0.5, 'blink_R': 0.5}},
    {'ten': 'nhìn phải + chớp nửa', 'dk': {'look_x': 1, 'blink_L': 0.5, 'blink_R': 0.5}},
    {'ten': 'nhìn lên + mở to', 'dk': {'look_y': 1, 'eye_wide_L': 1, 'eye_wide_R': 1}},
    {'ten': 'nhìn xuống + nhắm', 'dk': {'look_y': -1, 'blink_L': 1, 'blink_R': 1}},
    {'ten': 'hàm 0.25', 'dk': {'jaw_open': 0.25}}, {'ten': 'hàm 0.5', 'dk': {'jaw_open': 0.5}},
    {'ten': 'hàm 0.75', 'dk': {'jaw_open': 0.75}}, {'ten': 'hàm 1', 'dk': {'jaw_open': 1.0}},
    {'ten': 'cười + mở hàm', 'dk': {'smile_L': 1, 'smile_R': 1, 'cheek_raise_L': 1, 'cheek_raise_R': 1, 'jaw_open': 0.5}},
    {'ten': 'buồn + nhắm', 'dk': {'brow_inner_up_L': 1, 'brow_inner_up_R': 1, 'frown_L': 1, 'frown_R': 1, 'blink_L': 1, 'blink_R': 1}},
    {'ten': 'mở to + nâng mày', 'dk': {'eye_wide_L': 1, 'eye_wide_R': 1, 'brow_inner_up_L': 1, 'brow_inner_up_R': 1, 'brow_outer_up_L': 1, 'brow_outer_up_R': 1}},
    {'ten': 'nheo + cười', 'dk': {'squint_L': 1, 'squint_R': 1, 'smile_L': 1, 'smile_R': 1, 'cheek_raise_L': 1, 'cheek_raise_R': 1}},
    {'ten': 'cau mày', 'dk': {'brow_down_L': 1, 'brow_down_R': 1, 'brow_knit': 1}},
    {'ten': 'mím môi', 'dk': {'lip_press': 1}, 'mieng_dong': True},
    {'ten': 'chúm môi', 'dk': {'mouth_pucker': 1}, 'mieng_dong': True},
    {'ten': 'kéo rộng miệng', 'dk': {'mouth_wide': 1}, 'mieng_dong': True},
    {'ten': 'mếu', 'dk': {'frown_L': 1, 'frown_R': 1}, 'mieng_dong': True},
    {'ten': 'nâng môi trên', 'dk': {'upper_lip_raise_L': 1, 'upper_lip_raise_R': 1}},
]


def cap_nhat(r):
    r.head.update_tag(); r.arm.update_tag(); bpy.context.view_layer.update()


def dat_lai(r):
    sk = r.head.data.shape_keys
    for kb in sk.key_blocks:
        if kb != sk.reference_key and not kb.name.endswith('_sua'): kb.value = 0.0   # key hiệu chỉnh do driver điều khiển
    for p in DIEU_KHIEN_ARM: r.arm[p] = 0.0
    cap_nhat(r)


def dat(r, **dk):
    kb = r.head.data.shape_keys.key_blocks
    for k, v in dk.items():
        if k in DIEU_KHIEN_ARM: r.arm[k] = float(v)
        else: kb[k].value = float(v)
    cap_nhat(r)


def _luoi(ob):
    dg = bpy.context.evaluated_depsgraph_get(); ev = ob.evaluated_get(dg); me = ev.to_mesh(); M = ev.matrix_world.copy()
    vs = [M @ v.co for v in me.vertices]; ps = [tuple(p.vertices) for p in me.polygons]; ev.to_mesh_clear(); return vs, ps


def bvh(ob):
    vs, ps = _luoi(ob); return BVHTree.FromPolygons(vs, ps)


def tam(ob):
    vs, _ = _luoi(ob); return sum(vs, Vector()) / len(vs)


def _dinh_mep_mieng(r):
    me = r.head.data; A = {n: me.attributes[n].data for n in ('vung', 'vong', 'phia', 'nguon')}
    return [(i, A['phia'][i].value, A['nguon'][i].value) for i in range(len(me.vertices)) if A['vung'][i].value == 31 and A['vong'][i].value == 0]


def moi(r):
    vs, _ = _luoi(r.head); mep = _dinh_mep_mieng(r); me = r.head.data
    tren = [i for i, ph, _ in mep if ph == 1]; duoi = [i for i, ph, _ in mep if ph == -1]; khoe = [i for i, ph, _ in mep if ph == 0]
    co0 = lambda i: me.vertices[i].co
    return {'tren_giua': vs[min(tren, key=lambda i: abs(co0(i).x))], 'duoi_giua': vs[min(duoi, key=lambda i: abs(co0(i).x))],
            'khoe_L': vs[max(khoe, key=lambda i: co0(i).x)], 'khoe_R': vs[min(khoe, key=lambda i: co0(i).x)]}


def dong_tu(r, k):
    """Tâm con ngươi (thế giới): điểm −Y cục bộ của nhãn cầu."""
    ob = r.mat[k]; return ob.matrix_world @ Vector((0, -ob['ban_kinh'], 0))


def khe_sang(r, k, luoi_n=(11, 9)):
    """Số tia (lưới trong vùng lỗ mắt, nhìn từ trước) chạm nhãn cầu trước mọi bề mặt khác = phần nhãn cầu còn lộ."""
    i = r.info[k]; p0, f, X, Z = i['p0'], i['f'], i['X'], i['Z']
    h, e, v = bvh(r.head), bvh(r.mat[k]), bvh(bpy.data.objects[f'Vien_Mat.{k}']); dem = 0
    for a in range(luoi_n[0]):
        for b in range(luoi_n[1]):
            u = -0.040 + 0.080 * a / (luoi_n[0] - 1); w = -0.036 + 0.046 * b / (luoi_n[1] - 1)
            o = p0 + X * u + Z * w + f * 0.3; d = -f
            he = e.ray_cast(o, d)
            if he[0] is None: continue
            de = (he[0] - o).length
            if all(t[0] is None or (t[0] - o).length > de for t in (h.ray_cast(o, d), v.ray_cast(o, d))): dem += 1
    return dem


# GIỚI HẠN ĐÃ BIẾT (ghi trong README rig): lỗ mắt gần tròn nên sát khoé độ cao lỗ đổi rất dốc; khi nhắm hẳn còn tối đa 3 mặt
# da nhỏ ở khoé mỗi mắt bị nén gập và ống viền chồng thành mảng tối ở khoé trong. Chỉ cho phép khi mí khép từ 40 % (blink ≥ 0,4).
GAP_CHO_PHEP_KHI_NHAM = 3


def loi_bien_dang(r, mieng_dong=False):
    loi = []; h = bvh(r.head)
    for k in 'LR':
        e = bvh(r.mat[k])
        if h.overlap(e): loi.append(f'mí/da xuyên nhãn cầu {k} ({len(h.overlap(e))} cặp mặt)')
        if bvh(bpy.data.objects[f'Vien_Mat.{k}']).overlap(e): loi.append(f'viền mắt xuyên nhãn cầu {k}')
    for t in ('Rang_Tren', 'Rang_Duoi', 'Luoi'):
        if h.overlap(bvh(bpy.data.objects[t])): loi.append(f'{t} xuyên môi/khoang')
    vs, ps = _luoi(r.head); mep = _dinh_mep_mieng(r)
    if mieng_dong:
        tren = {ng: i for i, ph, ng in mep if ph == 1}; duoi = {ng: i for i, ph, ng in mep if ph == -1}
        ho = max((vs[tren[n]] - vs[duoi[n]]).length for n in tren)
        if ho > 0.0006: loi.append(f'môi hở khi đóng {ho*1000:.1f} mm')
    # nhìn xuyên đầu qua miệng: tia từ trước vào vùng miệng chạm mặt quay lưng của đầu
    m = r.info['mieng']; p, f, X, Z = m['p'], m['f'], m['X'], m['Z']; o_ = [bvh(bpy.data.objects[t]) for t in ('Rang_Tren', 'Rang_Duoi', 'Luoi')]
    for a in range(9):
        for b in range(9):
            o = p + X * (-0.028 + 0.056 * a / 8) + Z * (-0.035 + 0.045 * b / 8) + f * 0.3; d = -f; hh = h.ray_cast(o, d)
            if hh[0] is None: continue
            gan = min([(t[0] - o).length for t in (x.ray_cast(o, d) for x in o_) if t[0] is not None] or [1e9])
            if (hh[0] - o).length < gan and hh[1].dot(d) > 0.05: loi.append('nhìn xuyên đầu qua miệng'); break
        else: continue
        break
    # lật/gấp mặt so với tư thế nghỉ (khoé rách, môi lộn, nếp gấp)
    if not hasattr(r, '_n0'):
        me = r.head.data; r._n0 = np.array([tuple(pp.normal) for pp in me.polygons])
        vz = np.empty(len(me.vertices), int); me.attributes['vung'].data.foreach_get('value', vz); r._da = np.array([all(vz[j] in (0, 11, 21, 31) for j in pp.vertices) for pp in me.polygons])
    V = np.array([tuple(x) for x in vs]); n_now = []
    for pp in ps:
        a_, b_, c_ = V[pp[0]], V[pp[1]], V[pp[2]]; n = np.cross(b_ - a_, c_ - a_); l = np.linalg.norm(n); n_now.append(n / l if l > 1e-14 else n)
    n_now = np.array(n_now); lat = int(np.sum(((n_now * r._n0).sum(1) < -0.2) & r._da))
    kb = r.head.data.shape_keys.key_blocks; nham = sum(1 for k in 'LR' if kb[f'blink_{k}'].value >= 0.4)
    if lat > GAP_CHO_PHEP_KHI_NHAM * nham: loi.append(f'{lat} mặt da lật/gấp')
    # mày trôi khỏi da
    for k in 'LR':
        ob = bpy.data.objects[f'Eyebrow_Rig.{k}']; ev, _ = _luoi(ob)
        dmin = min(h.find_nearest(x)[3] for x in ev[::7])
        if dmin > 0.004: loi.append(f'mày {k} nổi khỏi da {dmin*1000:.1f} mm')
    return loi
