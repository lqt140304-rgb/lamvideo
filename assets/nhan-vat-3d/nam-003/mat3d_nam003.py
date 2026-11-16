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

KHE = 0.0016          # khe giữa nhãn cầu và vỏ mí
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
    bvh = BVHTree.FromObject(body, bpy.context.evaluated_depsgraph_get())   # da gốc, trước khi khoét
    global _BVH; _BVH = bvh
    mi = []
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
        tren_ch, duoi_ch = _khoet(body, C, M, U, V, bvh)
        for tren, fn, ten, ch in ((True, tren_fn, 'MiTren', tren_ch), (False, duoi_fn, 'MiDuoi', duoi_ch)):
            co, fa, vien = _mi_may(ch, C, M, Rm, U, side, tren, fn, p)
            ob = _tao_mesh(f'{ten}.{sfx}', co, fa, m_mi, sc)
            at = ob.data.attributes.new('vien', 'FLOAT', 'POINT'); at.data.foreach_set('value', vien)
            mep = np.zeros(len(co), int); mep[:len(ch)] = side * (1 if tren else 2)      # hàng mép khe mắt, để kiểm
            at = ob.data.attributes.new('mep', 'INT', 'POINT'); at.data.foreach_set('value', mep)
            g = ob.vertex_groups.new(name='Head'); g.add(range(len(co)), 1.0, 'REPLACE')
            ob.shape_key_add(name='Basis')
            for kn, f2 in (('nham', dong_fn), ('mo_to', (lambda u: _mep(u, U, V * 1.35, tan_ng, side, True)) if tren else (lambda u: _mep(u, U, V * 1.12, tan_ng, side, False)))):
                co2, _, _ = _mi_may(ch, C, M, Rm, U, side, tren, f2, p)
                k = ob.shape_key_add(name=f'{kn}.{sfx}'); k.data.foreach_set('co', co2.ravel())
            mi.append(ob)
        print(f'  mắt {sfx}: R={R * 1000:.1f} mm, mở {2 * a * 1000:.0f}×{2 * b * 1000:.0f} mm, mép lỗ {len(tren_ch) + len(duoi_ch) - 2} đỉnh')
    _gop_mi(body, mi, arm)
    return objs


def _gop_mi(body, mi, arm):
    """Gộp vỏ mí vào Nam_Body và hàn hàng ngoài với mép lỗ da → một mặt liền, đổ bóng liên tục (hết vành 'mặt nạ').
    Shape key nham.L/R, mo_to.L/R chuyển sang Nam_Body; driver nối lại theo thuộc tính trên Head."""
    import bmesh
    zc = float(np.mean([o.location.z + np.mean([v.co.z for v in o.data.vertices]) for o in mi]))
    if not body.data.shape_keys: body.shape_key_add(name='Basis')
    bpy.ops.object.select_all(action='DESELECT')
    for o in mi: o.select_set(True)
    body.select_set(True); bpy.context.view_layer.objects.active = body
    bpy.ops.object.join()
    bm = bmesh.new(); bm.from_mesh(body.data)
    ia = bm.verts.layers.int.get('mep'); n0 = len(bm.verts)
    # chỉ hàn trong vùng mắt (đỉnh mí + mép da trùng vị trí)
    vung = [x for x in bm.verts if abs(x.co.z - zc) < 0.06 and x.co.y < 0]
    bmesh.ops.remove_doubles(bm, verts=vung, dist=2e-6)
    vs = {x for x in bm.verts if abs(x.co.z - zc) < 0.06 and x.co.y < 0}
    bmesh.ops.recalc_face_normals(bm, faces=[f for f in bm.faces if f.is_valid and all(x in vs for x in f.verts)])   # chấm tối = mặt lật
    bm.to_mesh(body.data); bm.free(); body.data.update()
    for pl in body.data.polygons: pl.use_smooth = True
    print(f'  gộp mí vào da: hàn {n0 - len(body.data.vertices)} đỉnh')
    m = body.modifiers.new('Muot', 'SUBSURF'); m.levels = 1; m.render_levels = 1   # mí + da chung lưới: subsurf làm bóng đều, hết vành nối
    kb = body.data.shape_keys.key_blocks
    for sfx, rieng in (('L', 'chop_trai'), ('R', 'chop_phai')):
        noi_driver(kb[f'nham.{sfx}'], arm, ['chop_mat', rieng], f'min(1, max(chop_mat, {rieng}))')
        noi_driver(kb[f'mo_to.{sfx}'], arm, ['mo_to', 'chop_mat', rieng], f'mo_to * (1 - min(1, max(chop_mat, {rieng})))')


PHONG = 0.0    # m: độ nâng vùng mí giữa mép mắt và mép da
SC = 1.30        # lỗ khoét: elip góc lớn hơn khe mắt 30 % (đủ chỗ cho mí)
CHIA = 3         # mỗi đoạn mép lỗ chia 3 cột mí (mép da thẳng giữa hai đỉnh nên vẫn khít)


def _uv(P, C, M):
    """Tọa độ góc (u ngang, v dọc) và bán kính của điểm P (N×3) trong khung mắt."""
    rel = (np.asarray(M).T @ (np.atleast_2d(P) - C).T).T; d = np.linalg.norm(rel, axis=1)
    return np.arctan2(rel[:, 0], -rel[:, 1]), np.arcsin(np.clip(rel[:, 2] / d, -1, 1)), d


def _khoet(body, C, M, U, V, bvh, r_gan=0.06, goc_gan=1.8, chia_truoc=0):
    """Khoét lỗ elip (góc SC×U, SC×V) trên Nam_Body, kéo đỉnh mép lỗ về đúng elip trên mặt da gốc.
    Trả hai chuỗi điểm mép (trên, dưới), cùng đi từ khóe u<0 sang khóe u>0, chung hai đầu."""
    import bmesh
    bm = bmesh.new(); bm.from_mesh(body.data); bm.verts.ensure_lookup_table()
    co = np.array([v.co for v in bm.verts]); u, v, d = _uv(co, C, M); R_GAN = r_gan
    sa = np.sqrt((u / U) ** 2 + (v / V) ** 2); truoc = (np.abs(u) < 1.4) & (d < np.linalg.norm(C - co, axis=1).min() + 0.04)
    if chia_truoc:   # lưới thưa (miệng): chia nhỏ vùng quanh lỗ trước khi khoét để mép là một vòng đơn
        vung_f = [f for f in bm.faces if np.mean([sa[x.index] for x in f.verts]) < SC * 1.8 and all(truoc[x.index] for x in f.verts)]
        bmesh.ops.subdivide_edges(bm, edges=list({e for f in vung_f for e in f.edges}), cuts=chia_truoc, use_grid_fill=True)
        bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 4])
        bm.verts.ensure_lookup_table(); bm.verts.index_update()
        co = np.array([v.co for v in bm.verts]); u, v, d = _uv(co, C, M)
        sa = np.sqrt((u / U) ** 2 + (v / V) ** 2); truoc = (np.abs(u) < 1.4) & (d < np.linalg.norm(C - co, axis=1).min() + 0.04)
    xoa = [f for f in bm.faces if np.mean([sa[x.index] for x in f.verts]) < SC and all(truoc[x.index] for x in f.verts)]
    print(f'  khoét: xóa {len(xoa)} mặt, U={U:.3f} V={V:.3f}, sa<1 có {int((sa < 1).sum())} đỉnh, trước {int(truoc.sum())}')
    bv = {x for f in xoa for x in f.verts}          # đỉnh quanh mặt bị xóa = ứng viên mép lỗ (không lẫn lỗ khác)
    bmesh.ops.delete(bm, geom=xoa, context='FACES_ONLY')
    bmesh.ops.delete(bm, geom=[x for x in bm.verts if not x.link_faces], context='VERTS')
    bm.verts.ensure_lookup_table(); bm.edges.ensure_lookup_table()
    # vòng mép lỗ: cạnh biên có đỉnh gần mắt
    def gan(x):
        return x in bv
    for lan in range(8):   # khoét lặp: nuốt lỗ phụ/đỉnh chạc ba (lỗ chỉ dính lỗ chính qua một đỉnh) cho tới khi còn một vòng đơn
        bm.verts.ensure_lookup_table(); bm.edges.ensure_lookup_table(); bm.verts.index_update()
        bien = [e for e in bm.edges if e.is_boundary and all(gan(x) for x in e.verts)]
        ke = {}
        for e in bien:
            a_, b_ = e.verts; ke.setdefault(a_, []).append(b_); ke.setdefault(b_, []).append(a_)
        vongs = []; con = set(ke)
        while con:
            v0 = min(con, key=lambda x: x.index); vg = [v0]; tv = None   # chọn theo chỉ số: set duyệt theo địa chỉ bộ nhớ, mỗi lần chạy khác
            while True:
                nx = [x for x in ke[vg[-1]] if x is not tv and x in con]
                if not nx or nx[0] is v0 or nx[0] in vg: break
                tv = vg[-1]; vg.append(nx[0])
            con -= set(vg); vongs.append(vg)
        vongs.sort(key=len, reverse=True); vong = vongs[0]
        xau = {x for x in ke if len(ke[x]) != 2} | {x for vg in vongs[1:] for x in vg}
        if not xau and len(vong) == len(ke): break
        ff = list({f for x in xau for f in x.link_faces}); bv |= {x for f in ff for x in f.verts}
        bmesh.ops.delete(bm, geom=ff, context='FACES_ONLY')
        bmesh.ops.delete(bm, geom=[x for x in bm.verts if not x.link_faces], context='VERTS')
    assert not xau and len(vong) == len(ke), f'mép lỗ chưa thành một vòng đơn sau {lan + 1} lần ({[len(x) for x in vongs]})'
    # kéo về elip góc SC, dán lên mặt da gốc
    P = np.array([x.co for x in vong]); u, v, _ = _uv(P, C, M)
    phi = np.arctan2(v / V, u / U); Mi = np.asarray(M)
    dp = np.angle(np.exp(1j * np.diff(np.r_[phi, phi[0]]))); chieu = np.sign(dp.sum())
    ph = np.unwrap(chieu * phi); ph = np.maximum.accumulate(ph) + 1e-3 * np.arange(len(ph))   # chỉ sửa chỗ gập (đơn điệu), giữ vị trí gốc nơi khác
    phi = chieu * ph
    for x, ph in zip(vong, phi):
        uu, vv = SC * U * math.cos(ph), SC * V * math.sin(ph)
        dr = Vector(Mi @ np.array([math.sin(uu) * math.cos(vv), -math.cos(uu) * math.cos(vv), math.sin(vv)]))
        hit = bvh.ray_cast(Vector(C), dr, 0.08)
        if hit[0] is not None: x.co = hit[0]
    # chia mỗi cạnh mép thành CHIA đoạn (đỉnh mới nằm trên mép da) để mí hàn khít từng cột, không có chữ T
    p_dau = Vector(vong[0].co)   # subdivide_edges (Blender 5.2) làm chết cả đỉnh cũ: nhớ tọa độ để tìm lại
    canh = [e for e in bm.edges if e.is_boundary and all(x in set(vong) for x in e.verts)]
    kq = bmesh.ops.subdivide_edges(bm, edges=canh, cuts=CHIA - 1); bv |= {x for x in kq['geom'] if isinstance(x, bmesh.types.BMVert)}
    bm.verts.ensure_lookup_table(); bm.edges.ensure_lookup_table()
    bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 4])
    v_dau = min((x for x in bm.verts if x.is_boundary), key=lambda x: (x.co - p_dau).length); tap = {e for e in bm.edges if e.is_boundary}   # đi dọc biên từ một đỉnh của lỗ: vòng đơn nên không lạc sang lỗ khác
    ke = {}
    for e in tap:
        a_, b_ = e.verts; ke.setdefault(a_, []).append(b_); ke.setdefault(b_, []).append(a_)
    vong = [v_dau]; tv = None
    while True:
        nx = [x for x in ke[vong[-1]] if x is not tv]
        if nx[0] is vong[0]: break
        tv = vong[-1]; vong.append(nx[0])
    assert len(vong) > 8 and vong[0] in ke[vong[-1]], 'mép lỗ sau khi chia không khép vòng'
    P = np.array([x.co for x in vong]); n = len(P)
    u, v, _ = _uv(P, C, M); phi = np.arctan2(v / V, u / U)
    bm.to_mesh(body.data); bm.free(); body.data.update()
    # tách hai chuỗi theo góc phi; chuỗi trên đi từ phi=π (u<0) qua π/2 tới 0
    i0 = int(np.argmin(np.abs(np.angle(np.exp(1j * phi))))); i1 = int(np.argmin(np.abs(np.angle(np.exp(1j * (phi - np.pi))))))
    def di(a_, b_, buoc):
        out = [a_]
        while out[-1] != b_: out.append((out[-1] + buoc) % n)
        return out
    huong = 1 if np.sin(phi[(i1 + 1) % n]) > 0 else -1          # từ i1 đi theo huong là phía trên
    ti = di(i1, i0, huong); di_ = di(i1, i0, -huong)
    return P[ti], P[di_]


def _mi_may(ch, C, M, Rm, U, side, tren, edge_fn, p):
    """Vỏ mí may vào mép lỗ: cột k chạy từ mép khe mắt (trên mặt cầu Rm) tới điểm mép lỗ Q_k (hàng cuối = Q_k)."""
    Q = np.array(ch); uq, vq, rq = _uv(Q, C, M)               # mép đã được chia sẵn trong _khoet
    ue = -U + 2 * U * (uq - uq[0]) / (uq[-1] - uq[0])          # hai đầu chuỗi = đúng hai khóe khe mắt (e=0)
    e = edge_fn(ue); sg = 1 if tren else -1; w0 = p['mat_vien'] / Rm * np.sqrt(np.clip(1 - (ue / U) ** 2, 0, 1))   # khoảng chừa nét mi về 0 ở khóe (không hở hình thoi)
    ts = [0.0, 0.02, 0.035, 0.08] + list(np.linspace(0.16, 1.0, 9))
    Mi = np.asarray(M); rows = []; vien = []
    for t in ts:
        if t < 0.1:
            off = {0.0: 0.0, 0.02: 0.45 * w0, 0.035: 0.80 * w0, 0.08: 1.6 * w0}[t]
            uu, vv, rr = ue, e + sg * off, np.full_like(ue, Rm)
        else:
            k = (t - 0.08) / 0.92; g = k * k * (3 - 2 * k)
            uu = ue + (uq - ue) * k; vv = (e + sg * 1.6 * w0) + (vq - e - sg * 1.6 * w0) * k
            g2 = np.clip(k / 0.55, 0, 1); g2 = g2 * g2 * (3 - 2 * g2)
            dr0 = np.stack([np.sin(uu) * np.cos(vv), -np.cos(uu) * np.cos(vv), np.sin(vv)], -1) @ Mi.T
            rs = np.array([_r_da(C, x, Rm) for x in dr0])            # bám mặt da gốc: hết rãnh lún quanh mắt
            rr = Rm + (np.maximum(rs, Rm) - Rm) * g2 + PHONG * np.sin(np.pi * np.minimum(k / 0.75, 1)) ** 2   # nâng vùng giữa cho đầy, hai đầu giữ nguyên (mép mắt, mép da)
        dr = np.stack([np.sin(uu) * np.cos(vv), -np.cos(uu) * np.cos(vv), np.sin(vv)], -1) @ Mi.T
        pts = C + rr[:, None] * dr
        if t == 1.0: pts = Q                                  # khít tuyệt đối với mép da
        rows.append(pts)
        band = (1.0 if t < 0.03 else 0.0) if tren else (0.12 if t < 0.01 else 0.0)
        vien.append(band * np.clip((1 - np.abs(ue) / U) / 0.30, 0, 1))
    nu = len(Q); co = np.concatenate(rows)
    faces = [(i * nu + j, i * nu + j + 1, (i + 1) * nu + j + 1, (i + 1) * nu + j) for i in range(len(ts) - 1) for j in range(nu - 1)]
    # hướng mặt ra ngoài (pháp tuyến cùng chiều C→điểm)
    f0 = faces[len(faces) // 2]; a_, b_, c_ = co[f0[0]], co[f0[1]], co[f0[2]]
    if np.dot(np.cross(b_ - a_, c_ - a_), a_ - C) < 0: faces = [f[::-1] for f in faces]
    return co, faces, np.concatenate(vien)


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
        co_, mp_ = _eval_mep(body); sg_ = 1 if s == 'L' else -1; t = co_[mp_ == sg_ * 1]; d = co_[mp_ == sg_ * 2]; d = d[np.argsort(d[:, 0])]
        assert len(t) > 5 and len(d) > 5, 'không thấy hàng mép mí trong Nam_Body'
        t = t[np.argsort(t[:, 0])][3:-3]   # bỏ khóe: đỉnh khóe đã hàn chung, mất nhãn mep
        gap = max(_dpl(q, d) for q in t); assert gap < 0.001, f'nhắm {s}: khe {gap * 1000:.2f} mm'
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


def _dpl(q, L):
    """Khoảng cách từ điểm q tới đường gấp khúc L (N×3)."""
    a = L[:-1]; ab = L[1:] - a; t = np.clip(((q - a) * ab).sum(1) / np.maximum((ab * ab).sum(1), 1e-12), 0, 1)
    return float(np.linalg.norm(a + ab * t[:, None] - q, axis=1).min())


_BVH = None


def _r_da(C, d, mac_dinh):
    """Bán kính từ tâm nhãn cầu C tới mặt da gốc theo hướng d (raycast); không trúng thì trả mac_dinh."""
    hit = _BVH.ray_cast(Vector(C), Vector(d), 0.08)
    return (hit[0] - Vector(C)).length if hit[0] is not None else mac_dinh




def _eval_mep(body):
    """Tọa độ đã tính (shape key + armature) và thuộc tính `mep` của Nam_Body."""
    sm = body.modifiers.get('Muot'); bat = sm.show_viewport if sm else None
    if sm: sm.show_viewport = False
    dg = bpy.context.evaluated_depsgraph_get(); e = body.evaluated_get(dg); me = e.to_mesh()
    co = np.array([e.matrix_world @ v.co for v in me.vertices]); a = np.zeros(len(co), int)
    me.attributes['mep'].data.foreach_get('value', a); e.to_mesh_clear()
    if sm: sm.show_viewport = bat
    return co, a


