"""Mắt 3D theo tham số cho khuôn NAM-003.

Cấu tạo mỗi bên (đều gắn xương Head bằng bone-parent, nên đi theo đầu và scale của Nam_Rig):
- NhanCau.L/R : quả cầu bán kính R, tâm C sau mặt da; Damped Track tới xương `nhin` nên cả cầu xoay → mống/đồng tử
  (vẽ bằng shader theo tọa độ object) trượt đúng trên mặt cầu, không méo.
- MiTren / MiDuoi .L/R : vỏ cầu đồng tâm bán kính R + KHE, màu da. Lưới sinh theo tọa độ góc (u ngang, v dọc):
  mép mí là đường elip (rộng mat_rong, cao mat_cao, nghiêng mat_nghieng) → dáng mắt là tham số.
  Ra ngoài mép, vỏ thụt dần vào trong để mép ngoài vùi dưới da. Shape key: `nham` (mép trên/dưới gặp nhau), `mo_to`.
- Da Nam_Body trong vùng mắt được đẩy lùi ra sau vỏ mí (không thêm/bớt đỉnh) để da không che nhãn cầu.
Thuộc tính trên Head: chop_mat, chop_trai, chop_phai, mo_to (0–1).
"""
import math, os
import numpy as np, bpy
from mathutils import Vector, Matrix

KHE = 0.0008          # khe giữa nhãn cầu và vỏ mí
R_HE_SO = 1.45        # bán kính nhãn cầu = R_HE_SO × nửa rộng mắt (cầu dẹt hơn → mép mắt ít lẹm vào da)
NHO = 0.0035          # mặt trước nhãn cầu nhô trước da đáy hốc
LUON = 22.0           # độ: nhãn cầu xoay ra ngoài theo mặt cong
NU, NT = 48, 14       # độ phân giải lưới mí: số cột theo u, số hàng từ mép ra ngoài
DONG = 0.30           # khi nhắm: mép mí gặp nhau ở 30 % từ dưới lên trong khe mắt


def _mat(name, col, rough=0.5):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (*col, 1); b.inputs['Roughness'].default_value = rough
    return m


def _mat_mi(p):
    """Vật liệu mí: màu da, trộn sang màu viền theo thuộc tính đỉnh `vien` (0–1)."""
    m = _mat('Mi_da', p['da'], 0.55); nt = m.node_tree; b = nt.nodes['Principled BSDF']
    at = nt.nodes.new('ShaderNodeAttribute'); at.attribute_name = 'vien'
    mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'
    mix.inputs['A'].default_value = (*p['da'], 1); mix.inputs['B'].default_value = (0.008, 0.006, 0.006, 1)
    nt.links.new(at.outputs['Fac'], mix.inputs['Factor']); nt.links.new(mix.outputs['Result'], b.inputs['Base Color'])
    b.inputs['Subsurface Weight'].default_value = 0.15; b.inputs['Subsurface Radius'].default_value = (0.9, 0.35, 0.2)
    rr = nt.nodes.new('ShaderNodeMapRange'); rr.inputs['To Min'].default_value = 0.55; rr.inputs['To Max'].default_value = 0.35
    nt.links.new(at.outputs['Fac'], rr.inputs['Value']); nt.links.new(rr.outputs['Result'], b.inputs['Roughness'])
    return m


def _mat_nhan(p, R):
    """Tròng trắng → mống → đồng tử theo khoảng cách tới trục −Y của object (đơn vị theo R)."""
    m = bpy.data.materials.new('NhanCau_' + p['ten']); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; L = nt.links
    b = N['Principled BSDF']; b.inputs['Roughness'].default_value = 0.12
    tc = N.new('ShaderNodeTexCoord'); sp = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Object'], sp.inputs[0])
    def op(o, a, bb=None):
        n = N.new('ShaderNodeMath'); n.operation = o
        for i, v in enumerate((a, bb)):
            if v is None: continue
            (L.new(v, n.inputs[i]) if not isinstance(v, (int, float)) else n.inputs[i].__setattr__('default_value', v))
        return n.outputs[0]
    r = op('SQRT', op('ADD', op('MULTIPLY', sp.outputs['X'], sp.outputs['X']), op('MULTIPLY', sp.outputs['Z'], sp.outputs['Z'])))
    r = op('DIVIDE', r, R)
    r = op('ADD', r, op('MULTIPLY', op('GREATER_THAN', sp.outputs['Y'], 0.0), 5.0))   # nửa sau: coi như xa trục
    cr = N.new('ShaderNodeValToRGB'); L.new(r, cr.inputs[0]); e = cr.color_ramp; e.interpolation = 'LINEAR'
    mt = p['mong_to']; mc = p['mong_mau']
    e.elements[0].position = 0.0; e.elements[0].color = (0.005, 0.004, 0.004, 1)
    e.elements[1].position = 1.0; e.elements[1].color = (0.97, 0.96, 0.94, 1)
    for pos, col in ((mt * 0.40, (0.004, 0.003, 0.003)), (mt * 0.44, mc), (mt * 0.80, tuple(min(1, c * 1.5) for c in mc)), (mt * 0.95, tuple(c * 0.6 for c in mc)), (mt * 1.0, (0.012, 0.009, 0.008)), (mt * 1.03, (0.97, 0.96, 0.94))):
        el = e.elements.new(pos); el.color = (*col, 1)
    L.new(cr.outputs['Color'], b.inputs['Base Color'])
    return m


def _bone_parent(ob, arm, bone='Head'):
    mw = ob.matrix_world.copy(); ob.parent = arm; ob.parent_type = 'BONE'; ob.parent_bone = bone; ob.matrix_world = mw


def _khung(C, side):
    """Ma trận quay khung mắt: −Y ra trước, xoay ra ngoài LUON độ quanh Z."""
    return Matrix.Rotation(math.radians(-side * LUON) * -1, 3, 'Z')   # side=+1 (mắt trái, +X) quay mặt về +X


def _dir(u, v):
    return np.stack([np.sin(u) * np.cos(v), -np.cos(u) * np.cos(v), np.sin(v)], -1)


def _mep(u, U, V, tan_ng, side, tren):
    """Mép mí (góc v) tại góc ngang u: elip U×V, nghiêng đuôi mắt lên theo tan_ng."""
    q = np.clip(1 - (u / U) ** 2, 0, None); e = V * np.sqrt(q)
    return (e if tren else -e) + tan_ng * u * side


def _luoi_mi(C, Rm, U, V, tan_ng, side, tren, mep_fn, p):
    """Trả (co, faces, vien) của vỏ mí. Hàng t=0 là mép; t=1 là rìa ngoài (thụt sâu vào trong)."""
    Umax = U * 1.12; Vmax = V * 1.55
    us = np.linspace(-Umax, Umax, NU)
    ts = np.concatenate([[0.0, 0.02, 0.035, 0.08], np.linspace(0.14, 1.0, NT - 4)])
    rows = []; vien = []; sas = []
    for t in ts:
        e = mep_fn(us)
        far = (Vmax if tren else -Vmax) + tan_ng * us * side
        sg = 1 if tren else -1; w0 = p['mat_vien'] / Rm
        v = e + sg * {0.0: 0.0, 0.02: 0.45 * w0, 0.035: 0.62 * w0, 0.08: 1.6 * w0}[t] if t < 0.1 else e + (far - e) * t   # 3 hàng đầu cách mép theo góc cố định: nét mi không dày lên khi nhắm
        uu = us * (1 + 0.10 * t)                                   # rìa ngoài loe ra
        sa = np.sqrt((uu / U) ** 2 + (v / V) ** 2); s = np.clip((sa - 1.32) / 0.25, 0, 1); s = s * s * (3 - 2 * s)   # thụt theo vị trí, ngoài khe mắt
        r = Rm - s * 0.0                                         # thụt vào để vùi dưới da
        pass
        rows.append(np.asarray(C) + r[..., None] * _dir(uu, v) if np.ndim(r) else np.asarray(C) + r * _dir(uu, v))
        sas.append(np.maximum(np.broadcast_to(sa, (NU,)), 1.0 + 2.2 * np.clip(np.abs(uu) / U - 0.95, 0, None)))   # khóe mắt: dán da sớm
        w = p['mat_vien'] / Rm                                     # bề rộng nét viền theo góc
        if tren:
            band = 1.0 if t < 0.025 else 0.0
            # mi_doi: nét tô màu đã bỏ vì vẫn hiện khi nhắm; cần làm bằng hình khối (chưa làm)
        else:
            band = 0.12 if t < 0.01 else 0.0
        vien.append(band * np.clip((1 - np.abs(us) / U) / 0.30, 0, 1))   # nét thon và ngắn dần về hai khóe
    co = np.concatenate(rows); vien = np.concatenate(vien)
    faces = [(i * NU + j, i * NU + j + 1, (i + 1) * NU + j + 1, (i + 1) * NU + j) for i in range(len(ts) - 1) for j in range(NU - 1)]
    if not tren: faces = [f[::-1] for f in faces]
    return co, faces, vien, ts, np.concatenate(sas)


def _xoay(co, C, M):
    return (np.asarray(M) @ (co - C).T).T + C


def _tao_mesh(name, co, faces, mat, sc):
    me = bpy.data.meshes.new(name); me.from_pydata([tuple(c) for c in co], [], faces); me.update()
    for pl in me.polygons: pl.use_smooth = True
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); me.materials.append(mat); return ob


def _prop(arm, name):
    pb = arm.pose.bones['Head']
    if name not in pb: pb[name] = 0.0
    pb.id_properties_ui(name).update(min=0.0, max=1.0, soft_min=0.0, soft_max=1.0)


def noi_driver(key, arm, names, expr):
    fc = key.driver_add('value'); d = fc.driver; d.type = 'SCRIPTED'
    for n in names:
        v = d.variables.new(); v.name = n; v.type = 'SINGLE_PROP'
        v.targets[0].id = arm; v.targets[0].data_path = f'pose.bones["Head"]["{n}"]'
    d.expression = expr


def _day_da(body, C, Rm, U, V, M, side):
    """Đẩy đỉnh da trong vùng mắt lùi vào trong, nằm sau vỏ mí ≥ 1,5 mm. Trả số đỉnh đã dịch."""
    co = np.empty(len(body.data.vertices) * 3); body.data.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
    Mi = np.asarray(M).T
    rel = (Mi @ (co - C).T).T; d = np.linalg.norm(rel, axis=1)
    u = np.arctan2(rel[:, 0], -rel[:, 1]); v = np.arcsin(np.clip(rel[:, 2] / np.maximum(d, 1e-9), -1, 1))
    s = np.sqrt((u / (U * 0.92)) ** 2 + (v / (V * 1.20)) ** 2)         # 1 = mép vùng đẩy
    vung = (s < 1.35) & (rel[:, 1] < 0) & (d < Rm + 0.02)
    tgt = Rm - 0.0015 - 0.004 * np.clip((s - 0.0) / 1.0, 0, 1)
    w = np.clip((1.35 - s) / 0.35, 0, 1); w = w * w * (3 - 2 * w)
    nd = np.where(vung & (d > tgt), d + (tgt - d) * w, d)
    co2 = co.copy(); k = vung & (nd != d)
    co2[k] = C + (co[k] - C) * (nd[k] / d[k])[:, None]
    # làm mượt độ dịch trên lưới (vùng s < 2) để hết nếp hình sao; lõi s < 0,9 giữ đủ độ lùi
    disp = co2 - co; mien = (s < 2.0) & (rel[:, 1] < 0.01); loi = k & (s < 0.9)
    e = np.empty(len(body.data.edges) * 2, int); body.data.edges.foreach_get('vertices', e); e = e.reshape(-1, 2)
    deg = np.bincount(e.ravel(), minlength=len(co)).astype(float)
    for _ in range(25):
        acc = np.zeros_like(disp); np.add.at(acc, e[:, 0], disp[e[:, 1]]); np.add.at(acc, e[:, 1], disp[e[:, 0]])
        avg = acc / np.maximum(deg, 1)[:, None]
        disp = np.where((mien & ~loi)[:, None], 0.5 * disp + 0.5 * avg, disp)
    co2 = co + disp
    body.data.vertices.foreach_set('co', co2.ravel()); body.data.update()
    return int((np.linalg.norm(disp, axis=1) > 1e-5).sum())


def tao_mat(sc, arm, body, moc, p):
    objs = []
    # xương nhin
    bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode='EDIT')
    eb = arm.data.edit_bones; nb = eb.get('nhin') or eb.new('nhin')
    mx, my, mz = moc['mat']; nb.head = (0, my - 0.45, mz); nb.tail = (0, my - 0.48, mz); nb.parent = eb['Head']; nb.use_deform = False
    bpy.ops.object.mode_set(mode='OBJECT')
    col = arm.data.collections.get('Mat') or arm.data.collections.new('Mat'); col.assign(arm.data.bones['nhin'])
    for n in ('chop_mat', 'chop_trai', 'chop_phai', 'mo_to'): _prop(arm, n)
    a = moc['r_hoc'] * p['mat_rong']; b = a * p['mat_cao']; R = a * R_HE_SO
    U = math.asin(min(a / R, 0.95)); V = math.asin(min(b / R, 0.95)); tan_ng = math.tan(math.radians(p['mat_nghieng']))
    m_mi = _mat_mi(p); m_nhan = _mat_nhan(p, R)
    from mathutils.bvhtree import BVHTree
    bvh = BVHTree.FromObject(body, bpy.context.evaluated_depsgraph_get())   # da gốc, trước khi đẩy
    for side, sfx in ((1, 'L'), (-1, 'R')):
        C = np.array([side * mx, my - NHO + R, mz])
        M = Matrix.Rotation(math.radians(side * LUON), 3, 'Z')
        # nhãn cầu
        bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=32, radius=R, location=tuple(C))
        nc = bpy.context.object; nc.name = f'NhanCau.{sfx}'; nc.data.materials.append(m_nhan)
        for pl in nc.data.polygons: pl.use_smooth = True
        _bone_parent(nc, arm)
        c = nc.constraints.new('DAMPED_TRACK'); c.target = arm; c.subtarget = 'nhin'; c.track_axis = 'TRACK_NEGATIVE_Y'
        objs.append(nc)
        # mí trên / dưới, với shape key nham và mo_to
        Rm = R + KHE
        tren_fn = lambda u: _mep(u, U, V, tan_ng, side, True)
        duoi_fn = lambda u: _mep(u, U, V, tan_ng, side, False)
        dong_fn = lambda u: duoi_fn(u) + DONG * (tren_fn(u) - duoi_fn(u))
        for tren, fn, ten in ((True, tren_fn, 'MiTren'), (False, duoi_fn, 'MiDuoi')):
            co, fa, vien, ts, sa = _luoi_mi(C, Rm, U, V, tan_ng, side, tren, fn, p)
            ob = _tao_mesh(f'{ten}.{sfx}', _dan(_xoay(co, C, M), C, sa, bvh), fa, m_mi, sc)
            at = ob.data.attributes.new('vien', 'FLOAT', 'POINT'); at.data.foreach_set('value', vien)
            ob.shape_key_add(name='Basis')
            for kn, f2 in (('nham', dong_fn), ('mo_to', (lambda u: _mep(u, U, V * 1.35, tan_ng, side, True)) if tren else (lambda u: _mep(u, U, V * 1.12, tan_ng, side, False)))):
                co2, _, _, _, sa2 = _luoi_mi(C, Rm, U, V, tan_ng, side, tren, f2, p)
                k = ob.shape_key_add(name=kn); k.data.foreach_set('co', _dan(_xoay(co2, C, M), C, sa2, bvh).ravel())
            kb = ob.data.shape_keys.key_blocks
            rieng = 'chop_trai' if side == 1 else 'chop_phai'
            noi_driver(kb['nham'], arm, ['chop_mat', rieng], f'min(1, max(chop_mat, {rieng}))')
            noi_driver(kb['mo_to'], arm, ['mo_to', 'chop_mat', rieng], f'mo_to * (1 - min(1, max(chop_mat, {rieng})))')
            _bone_parent(ob, arm); objs.append(ob)
        n = 0 if os.environ.get('KHONG_DAY') else _day_da(body, C, Rm, U, V, M, side)
        print(f'  mắt {sfx}: R={R * 1000:.1f} mm, mở {2 * a * 1000:.0f}×{2 * b * 1000:.0f} mm, đẩy {n} đỉnh da')
    return objs


# ---------------------------------------------------------------- kiểm
def _eval_co(ob):
    dg = bpy.context.evaluated_depsgraph_get(); e = ob.evaluated_get(dg); me = e.to_mesh()
    co = np.array([e.matrix_world @ v.co for v in me.vertices]); e.to_mesh_clear(); return co


def kiem_mat(objs, arm, body):
    for ob in objs:
        assert ob.parent == arm and ob.parent_type == 'BONE' and ob.parent_bone == 'Head', ob.name
    pb = arm.pose.bones['Head']; vl = bpy.context.view_layer
    pb['chop_mat'] = 1.0; tinh(arm)
    for s in 'LR':
        t = _eval_co(bpy.data.objects[f'MiTren.{s}'])[:NU]; d = _eval_co(bpy.data.objects[f'MiDuoi.{s}'])[:NU]
        gap = np.linalg.norm(t - d, axis=1).max(); assert gap < 0.0005, f'nhắm {s}: khe {gap * 1000:.2f} mm'
    pb['chop_mat'] = 0.0; tinh(arm)
    nc = bpy.data.objects['NhanCau.L']; R = nc.dimensions[0] / 2 / max(nc.matrix_world.to_scale())
    truoc = (nc.matrix_world @ Vector((0, -R, 0))).copy()
    nb = arm.pose.bones['nhin']; nb.location = (0.05, 0, 0); tinh(arm)
    sau = nc.matrix_world @ Vector((0, -R, 0)); nb.location = (0, 0, 0); tinh(arm)
    assert abs(sau.x - truoc.x) > 0.001, f'liếc: đồng tử dịch {abs(sau.x - truoc.x) * 1000:.2f} mm'
    # mặt trước nhãn cầu không bị da che
    co = _eval_co(body)
    for s in 'LR':
        f = bpy.data.objects[f'NhanCau.{s}'].matrix_world @ Vector((0, -R, 0))
        near = co[(np.abs(co[:, 0] - f.x) < 0.004) & (np.abs(co[:, 2] - f.z) < 0.004) & (co[:, 1] < f.y + 0.02)]
        assert len(near) == 0 or near[:, 1].min() > f.y - 0.0005, f'da che nhãn cầu {s}: {(f.y - near[:, 1].min()) * 1000:.1f} mm'
    print('PASS mat')


def lam_moi_driver():
    """Driver tạo trong lúc dựng có thể bị đánh dấu hỏng ở lần tính đầu; gán lại biểu thức để xóa cờ, rồi tính lại."""
    for k in bpy.data.shape_keys:
        if k.animation_data:
            for fc in k.animation_data.drivers:
                fc.driver.expression = fc.driver.expression; fc.update()
    tinh(bpy.data.objects['Nam_Rig'])


def tinh(arm):
    """Ép tính lại driver ở chế độ nền: chỉ view_layer.update() là chưa đủ (đo trên Blender 5.2.3)."""
    arm.update_tag(); sc = bpy.context.scene; sc.frame_set(sc.frame_current)


def to_da(body, p):
    """Da Soft PBR một màu cho Nam_Body và mí (lưới khuôn không có texture). Thay mọi khe vật liệu."""
    m = _mat('Da_' + p['ten'], p['da'], 0.55)
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Subsurface Weight'].default_value = 0.15; b.inputs['Subsurface Radius'].default_value = (0.9, 0.35, 0.2)
    body.data.materials.clear(); body.data.materials.append(m)
    return m


def muot_da(body):
    """Subdivision 1 cấp sau Armature: lưới khuôn ~3 mm/cạnh làm mép da quanh mắt răng cưa. Không đổi đỉnh gốc."""
    m = body.modifiers.get('Muot') or body.modifiers.new('Muot', 'SUBSURF'); m.levels = 1; m.render_levels = 1
    return m


def _dan(co, C, sa, bvh, a0=1.0, a1=1.45, noi=0.0003):
    """Rìa ngoài vỏ mí dán dần vào mặt da gốc (tia từ tâm nhãn cầu ra ngoài), nên chỗ nối mí–da liền, không gờ.
    Pha từ sa=a0 (mép khe mắt, giữ vỏ cầu) tới sa=a1 (nằm trên da, nhô `noi`)."""
    out = co.copy(); b = np.clip((sa - a0) / (a1 - a0), 0, 1); b = b * b * (3 - 2 * b)
    for i in np.nonzero(b > 0)[0]:
        d = Vector(co[i] - C); r0 = d.length; d.normalize()
        hit = bvh.ray_cast(Vector(C), d, 0.08)
        if hit[0] is None: continue
        r1 = (hit[0] - Vector(C)).length + noi
        out[i] = C + np.array(d) * (r0 + (r1 - r0) * b[i])
    return out
