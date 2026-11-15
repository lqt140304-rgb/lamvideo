"""Lông mày 3D theo tham số cho khuôn NAM-003.

Mỗi bên một dải lưới `LongMay.L/R` bám mặt da (raycast lên da đã tính, gồm subsurf), gắn xương Head (bone-parent).
Dáng: đường giữa đi từ đầu trong (gần sống mũi) tới đuôi; độ cao 5 điểm = p['may_dang'] × bán kính hốc trên đỉnh khe mắt;
độ dày = p['may_day'] × DAY, dày ở đầu trong, thon về đuôi. Shape key mỗi bên: nhuong, ha, cau, buon — mỗi khóa dựng lại
dải với điểm điều khiển dịch rồi chiếu lại lên da, nên mày luôn nằm trên da.
Driver theo thuộc tính trên Head: may_nhuong, may_ha, may_cau, may_buon, may_trai_nhuong, may_phai_nhuong.
"""
import math
import numpy as np, bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree
import mat3d_nam003 as M3

DAY = 0.0058        # bề dày mày chuẩn (m) ở đầu trong
NOI = 0.0005        # mày nổi trên da
PHONG = 0.0010      # mày phồng giữa theo bề ngang
NS, NW = 40, 7      # số điểm dọc mày, số điểm ngang
BIEN = 0.008        # biên độ dịch khi nhướn/hạ (m)
PROPS = ('may_nhuong', 'may_ha', 'may_cau', 'may_buon', 'may_trai_nhuong', 'may_phai_nhuong')


def _duong(moc, p, side, dz_trong=0.0, dz_duoi=0.0, dz=0.0, dx_trong=0.0):
    """Đường giữa mày (NS×2: x, z) và bề dày (NS)."""
    mx, _, mz = moc['mat']; a = moc['r_hoc'] * p['mat_rong']; b = a * p['mat_cao']; r = moc['r_hoc']
    s = np.linspace(0, 1, NS)
    x = mx - 1.30 * a + dx_trong * (1 - s) + s * (2.70 * a - dx_trong)          # phủ qua vòng hốc mắt (lỗ khoét ~1,3a)
    h = np.interp(s, np.linspace(0, 1, 5), p['may_dang'])
    z = mz + 1.20 * b + r * h + dz + dz_trong * (1 - s) + dz_duoi * s
    w = p['may_day'] * DAY * (1.0 - 0.55 * s) * np.clip(np.minimum(s / 0.06, (1 - s) / 0.10), 0, 1) ** 0.5
    return side * x, z, w


def _dai(bvh, x, z, w):
    """Lưới dải mày: chiếu từng điểm lên da theo hướng +Y. Trả co (NS*NW×3)."""
    out = []
    dxz = np.gradient(np.c_[x, z], axis=0); dxz /= np.linalg.norm(dxz, axis=1)[:, None]
    nxz = np.c_[-dxz[:, 1], dxz[:, 0]]                       # pháp tuyến trong mặt phẳng nhìn thẳng
    for j, c in enumerate(np.linspace(-0.5, 0.5, NW)):
        for i in range(NS):
            px, pz = x[i] + nxz[i, 0] * c * w[i], z[i] + nxz[i, 1] * c * w[i]
            hit = bvh.ray_cast(Vector((px, -0.5, pz)), Vector((0, 1, 0)), 1.0)
            assert hit[0] is not None, 'mày: tia không trúng da'
            n = hit[1]; n = n if n.y < 0 else -n
            out.append(hit[0] + n * (NOI + PHONG * (1 - (2 * c) ** 2) * (w[i] > 1e-5)))
    return np.array(out)


def tao_may(sc, arm, body, moc, p):
    for n in PROPS: M3._prop(arm, n)
    dg = bpy.context.evaluated_depsgraph_get(); bvh = BVHTree.FromObject(body, dg)
    mat = M3._mat('LongMay_' + p['ten'], p['may_mau'], 0.85)
    faces = [(j * NS + i, j * NS + i + 1, (j + 1) * NS + i + 1, (j + 1) * NS + i) for j in range(NW - 1) for i in range(NS - 1)]
    objs = []
    for side, sfx, rieng in ((1, 'L', 'may_trai_nhuong'), (-1, 'R', 'may_phai_nhuong')):
        co = _dai(bvh, *_duong(moc, p, side))
        f = faces; q = f[len(f) // 2]
        if np.cross(co[q[1]] - co[q[0]], co[q[2]] - co[q[0]])[1] > 0: f = [t[::-1] for t in f]   # pháp tuyến hướng −Y (ra trước)
        ob = M3._tao_mesh(f'LongMay.{sfx}', co, f, mat, sc)
        ob.shape_key_add(name='Basis')
        khoa = dict(nhuong=dict(dz=BIEN), ha=dict(dz=-0.7 * BIEN),
                    cau=dict(dz_trong=-1.0 * BIEN, dz_duoi=0.5 * BIEN, dx_trong=-0.004),
                    buon=dict(dz_trong=1.0 * BIEN, dz_duoi=-0.6 * BIEN))
        for kn, kw in khoa.items():
            k = ob.shape_key_add(name=kn); k.data.foreach_set('co', _dai(bvh, *_duong(moc, p, side, **kw)).ravel())
        kb = ob.data.shape_keys.key_blocks
        M3.noi_driver(kb['nhuong'], arm, ['may_nhuong', rieng], f'min(1, max(may_nhuong, {rieng}))')
        M3.noi_driver(kb['ha'], arm, ['may_ha'], 'may_ha')
        M3.noi_driver(kb['cau'], arm, ['may_cau'], 'may_cau')
        M3.noi_driver(kb['buon'], arm, ['may_buon'], 'may_buon')
        M3._bone_parent(ob, arm); objs.append(ob)
    print(f'  mày: dày {p["may_day"] * DAY * 1000:.1f} mm ở đầu trong, dài {abs(co[NS - 1, 0] - co[0, 0]) * 1000:.0f} mm')
    return objs


def kiem_may(objs, arm, body, moc, p):
    a = moc['r_hoc'] * p['mat_rong']; top = moc['mat'][2] + a * p['mat_cao']
    for ob in objs:
        assert ob.parent == arm and ob.parent_type == 'BONE' and ob.parent_bone == 'Head', ob.name
        co = np.array([v.co for v in ob.data.vertices])
        assert co[:, 2].min() > top + 0.15 * moc['r_hoc'] - 0.003, f'{ob.name}: mép dưới mày chạm khe mắt'
    pb = arm.pose.bones['Head']; z0 = M3._eval_co(objs[0])[:, 2].mean()
    pb['may_nhuong'] = 1.0; M3.tinh(arm); z1 = M3._eval_co(objs[0])[:, 2].mean(); pb['may_nhuong'] = 0.0; M3.tinh(arm)
    assert z1 - z0 > 0.003, f'nhướn mày chỉ dịch {(z1 - z0) * 1000:.1f} mm'
    print('PASS may')
