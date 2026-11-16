"""Miệng thật theo tham số cho khuôn NAM-003: môi may liền vào da, khoang miệng, răng, lưỡi, xương jaw.

Cách làm giống mắt (mat3d_nam003): khoét lỗ elip trên Nam_Body (sau gán trọng số), dựng hai môi theo cột từ khe miệng
ra mép lỗ, rồi gộp + hàn vào Nam_Body. Tọa độ góc quanh tâm ảo C đặt sau miệng R_AO; U, V = nửa rộng / nửa cao vùng môi.
Shape key trên Nam_Body: mieng_ha, mieng_rong, mieng_hep, cuoi, meu, mieng_khep (driver = thuộc tính cùng tên trên Head).
Răng dưới + lưỡi con của xương `jaw` (xoay theo mieng_ha); răng trên + khoang miệng con của Head.
"""
import math
import numpy as np, bpy, bmesh
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree
import mat3d_nam003 as M3

R_AO = 0.05          # tâm ảo sau miệng
NUA_RONG = 0.022     # nửa rộng miệng chuẩn (m), nhân p['mieng_rong']
DAY_MOI = (0.0032, 0.0038)   # độ dày môi trên / dưới (m), nhân p['mieng_cao']
CAO_MOI = 0.011     # nửa cao vùng môi (m) tính từ khe, nhân p['mieng_cao']
HA_TREN, HA_DUOI = 0.006, 0.019   # há to: môi trên lên, môi dưới xuống (m)
GOC_JAW = 13.0       # độ xoay xương jaw khi há to
KHE0 = 0.00008       # khe nhỏ giữa hai môi khi ngậm (để không bị hàn dính)
PROPS = ('mieng_ha', 'mieng_hep', 'mieng_rong', 'cuoi', 'meu', 'mieng_khep')


def _mat_moi(p):
    m = M3._mat('Moi_' + p['ten'], p['da'], 0.5); nt = m.node_tree; b = nt.nodes['Principled BSDF']
    at = nt.nodes.new('ShaderNodeAttribute'); at.attribute_name = 'moi'
    mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'
    mix.inputs['A'].default_value = (*p['da'], 1); mix.inputs['B'].default_value = (*(p['moi_mau'] if p['moi'] else p['da']), 1)
    nt.links.new(at.outputs['Fac'], mix.inputs['Factor']); nt.links.new(mix.outputs['Result'], b.inputs['Base Color'])
    b.inputs['Subsurface Weight'].default_value = 0.15; b.inputs['Subsurface Radius'].default_value = (0.9, 0.35, 0.2)
    return m


def _moi(ch, C, U, R, tren, p, ha=0.0, rong=1.0, cuoi=0.0, khep=0.0, phong=1.0):
    """Lưới một môi. Cột k: từ khe miệng (góc ue, e) tới điểm mép lỗ Q_k. Trả co, faces, moi(0–1)."""
    Q = np.array(ch); uq, vq, rq = M3._uv(Q, C, np.eye(3))
    ue = (-U + 2 * U * (uq - uq[0]) / (uq[-1] - uq[0])) * rong
    q = np.clip(1 - (ue / (U * rong)) ** 2, 0, 1)
    sg = 1 if tren else -1
    e = (KHE0 if tren else -KHE0) / R * q + (cuoi * 0.009 / R) * (ue / (U * rong)) ** 2 \
        + (HA_TREN if tren else -HA_DUOI) / R * ha * np.sqrt(q)
    day = DAY_MOI[0 if tren else 1] * p['mieng_cao'] * phong * (1 - 0.6 * khep) * (1.0 if p['moi'] else 0.25)   # không môi: chỉ phồng nhẹ quanh khe
    ts = [0.0, 0.03, 0.08, 0.15, 0.24, 0.34, 0.45, 0.58, 0.72, 0.86, 1.0]
    rows = []; moi = []
    for t in ts:
        uu = ue + (uq - ue) * t; vv = e + (vq - e) * t
        d = np.stack([np.sin(uu) * np.cos(vv), -np.cos(uu) * np.cos(vv), np.sin(vv)], -1)
        rs = np.array([M3._r_da(C, x, R) for x in d])
        cong = np.sin(np.pi * min(t / 0.62, 1.0)) ** 0.8 * np.sqrt(q)          # phồng môi, 0 ở khe và ngoài vùng môi
        cuon = -0.0012 * (1 - min(t / 0.08, 1.0)) * (1 + 1.5 * khep) * q ** 0.7   # mép cuộn vào khe, tắt dần ở 2 đầu khe (hết vạch xám)
        rr = rs + day * cong + cuon
        pts = C + rr[:, None] * d
        if t == 1.0: pts = Q
        rows.append(pts)
        moi.append(np.full(len(Q), float(np.clip((0.50 - t) / 0.14, 0, 1))) * (0.35 + 0.65 * np.sqrt(q)))
    nu = len(Q); co = np.concatenate(rows)
    faces = [(i * nu + j, i * nu + j + 1, (i + 1) * nu + j + 1, (i + 1) * nu + j) for i in range(len(ts) - 1) for j in range(nu - 1)]
    f0 = faces[len(faces) // 2]
    if np.dot(np.cross(co[f0[1]] - co[f0[0]], co[f0[2]] - co[f0[0]]), co[f0[0]] - C) < 0: faces = [f[::-1] for f in faces]
    return co, faces, np.concatenate(moi)


def _jaw(arm, moc):
    bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode='EDIT')
    eb = arm.data.edit_bones; j = eb.get('jaw') or eb.new('jaw')
    j.head = (0, moc['tai'][1] - 0.01, moc['mieng'][2] + 0.025); j.tail = (0, moc['cam'][1] + 0.01, moc['cam'][2] + 0.005)
    j.parent = eb['Head']; j.use_deform = False
    bpy.ops.object.mode_set(mode='OBJECT')
    col = arm.data.collections.get('Mat') or arm.data.collections.new('Mat'); col.assign(arm.data.bones['jaw'])
    pb = arm.pose.bones['jaw']; pb.rotation_mode = 'XYZ'
    fc = pb.driver_add('rotation_euler', 0); d = fc.driver; d.type = 'SCRIPTED'
    v = d.variables.new(); v.name = 'h'; v.type = 'SINGLE_PROP'; v.targets[0].id = arm; v.targets[0].data_path = 'pose.bones["Head"]["mieng_ha"]'
    d.expression = f'h * {math.radians(GOC_JAW):.5f}'


def _vat(sc, arm, ten, co_fn, mat, bone):
    ob = co_fn(); ob.name = ten; ob.data.materials.append(mat)
    for pl in ob.data.polygons: pl.use_smooth = True
    M3._bone_parent(ob, arm, bone); return ob


def tao_mieng(sc, arm, body, moc, p):
    for n in PROPS: M3._prop(arm, n)
    sm = body.modifiers.get('Muot'); sm.show_viewport = False
    dg = bpy.context.evaluated_depsgraph_get(); bvh = BVHTree.FromObject(body, dg); M3._BVH = bvh
    A = NUA_RONG * p['mieng_rong']; H = CAO_MOI * p['mieng_cao']
    mo = np.array(moc['mieng']); C = mo + np.array([0, R_AO, 0])
    U = math.asin(A / R_AO); V = math.asin(H / R_AO)
    tren_ch, duoi_ch = M3._khoet(body, C, np.eye(3), U, V, bvh, r_gan=R_AO + 0.025, goc_gan=3.0, chia_truoc=2)   # vùng môi dẹt, lưới thưa: lọc rộng theo góc
    m_moi = _mat_moi(p); obs = []
    for tren, ch, ten in ((True, tren_ch, 'MoiTren'), (False, duoi_ch, 'MoiDuoi')):
        co, fa, moi = _moi(ch, C, U, R_AO, tren, p)
        ob = M3._tao_mesh(ten, co, fa, m_moi, sc)
        at = ob.data.attributes.new('moi', 'FLOAT', 'POINT'); at.data.foreach_set('value', moi)
        mep = np.zeros(len(co), int); mep[:len(ch)] = 3 if tren else 4
        at = ob.data.attributes.new('mep', 'INT', 'POINT'); at.data.foreach_set('value', mep)
        g = ob.vertex_groups.new(name='Head'); g.add(range(len(co)), 1.0, 'REPLACE')
        ob.shape_key_add(name='Basis')
        for kn, kw in (('mieng_ha', dict(ha=1.0)), ('mieng_rong', dict(rong=1.28)), ('mieng_hep', dict(rong=0.46, phong=3.0, ha=0.22)),
                       ('cuoi', dict(cuoi=1.0, rong=1.12)), ('meu', dict(cuoi=-1.0, rong=0.94)), ('mieng_khep', dict(khep=1.0))):
            k = ob.shape_key_add(name=kn); k.data.foreach_set('co', _moi(ch, C, U, R_AO, tren, p, **kw)[0].ravel())
        obs.append(ob)
    # gộp môi vào da, hàn mép
    bpy.ops.object.select_all(action='DESELECT')
    for o in obs: o.select_set(True)
    body.select_set(True); bpy.context.view_layer.objects.active = body; bpy.ops.object.join()
    bm = bmesh.new(); bm.from_mesh(body.data); n0 = len(bm.verts)
    vung = [x for x in bm.verts if abs(x.co.z - mo[2]) < 0.03 and abs(x.co.x) < 0.05 and x.co.y < 0]
    bmesh.ops.remove_doubles(bm, verts=vung, dist=2e-6)
    vs = {x for x in bm.verts if abs(x.co.z - mo[2]) < 0.03 and abs(x.co.x) < 0.05 and x.co.y < 0}
    bmesh.ops.recalc_face_normals(bm, faces=[f for f in bm.faces if all(x in vs for x in f.verts)])
    bm.to_mesh(body.data); bm.free(); body.data.update()
    for pl in body.data.polygons: pl.use_smooth = True
    sm.show_viewport = True
    kb = body.data.shape_keys.key_blocks
    for n in PROPS: M3.noi_driver(kb[n], arm, [n], n)
    # khoang miệng, răng, lưỡi, jaw
    _jaw(arm, moc)
    sau = mo + np.array([0, 0.004, 0])                              # mặt trước khoang/răng nằm sau môi
    m_toi = M3._mat('KhoangMieng', (0.10, 0.025, 0.03), 0.7); m_rang = M3._mat('Rang', (0.92, 0.90, 0.85), 0.3); m_luoi = M3._mat('Luoi', (0.62, 0.22, 0.22), 0.6)
    def tui():
        bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=1, location=tuple(sau + np.array([0, 0.026, -0.002])))
        o = bpy.context.object; o.scale = (A * 1.10, 0.017, 0.018); bpy.ops.object.transform_apply(scale=True)
        bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.flip_normals(); bpy.ops.object.mode_set(mode='OBJECT'); return o
    def rang(dz, ten):
        bpy.ops.mesh.primitive_torus_add(major_radius=A * 0.68, minor_radius=0.0028, major_segments=48, minor_segments=8,
                                         location=tuple(sau + np.array([0, A * 0.68 + 0.003, dz])))
        o = bpy.context.object; o.scale = (1, 1, 1.6); bpy.ops.object.transform_apply(scale=True)
        bm2 = bmesh.new(); bm2.from_mesh(o.data)
        bmesh.ops.delete(bm2, geom=[v for v in bm2.verts if v.co.y > -A * 0.25], context='VERTS'); bm2.to_mesh(o.data); bm2.free()
        return o
    def luoi():
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=1, location=tuple(sau + np.array([0, 0.016, -0.009])))
        o = bpy.context.object; o.scale = (A * 0.62, 0.016, 0.0045); bpy.ops.object.transform_apply(scale=True); return o
    trong = [_vat(sc, arm, 'KhoangMieng', tui, m_toi, 'Head'), _vat(sc, arm, 'RangTren', lambda: rang(0.0042, 't'), m_rang, 'Head'),
             _vat(sc, arm, 'RangDuoi', lambda: rang(-0.0050, 'd'), m_rang, 'jaw'), _vat(sc, arm, 'Luoi', luoi, m_luoi, 'jaw')]
    print(f'  miệng: rộng {2 * A * 1000:.0f} mm, mép lỗ {len(tren_ch) + len(duoi_ch) - 2} đỉnh, hàn {n0 - len(body.data.vertices)} đỉnh')
    return trong


def kiem_mieng(trong, arm, body, moc):
    for ob in trong:
        assert ob.parent == arm and ob.parent_type == 'BONE', ob.name
    # mỗi đỉnh tối đa 4 xương
    nmax = max(sum(1 for g in v.groups if g.weight > 0) for v in body.data.vertices)
    assert nmax <= 4, f'{nmax} xương/đỉnh'
    pb = arm.pose.bones['Head']; sc = bpy.context.scene; mo = Vector(moc['mieng'])
    pb['mieng_ha'] = 1.0; M3.tinh(arm)
    dg = bpy.context.evaluated_depsgraph_get(); trung = {}; sai = 0
    for dx in np.linspace(-0.008, 0.008, 5):
        for dz in np.linspace(-0.004, 0.0, 3):
            ok, loc, nor, idx, ob, _ = sc.ray_cast(dg, mo + Vector((dx, -0.2, dz - 0.002)), Vector((0, 1, 0)))
            ten = ob.name if ok else 'không trúng'; trung[ten] = trung.get(ten, 0) + 1
            if ten not in ('KhoangMieng', 'RangTren', 'RangDuoi', 'Luoi', 'NhanCau.L'): sai += 1
    pb['mieng_ha'] = 0.0; M3.tinh(arm)
    assert sai <= 2, f'há miệng: tia qua khe trúng {trung}'
    print('PASS mieng', trung)
