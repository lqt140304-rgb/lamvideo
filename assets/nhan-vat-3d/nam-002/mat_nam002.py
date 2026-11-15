"""MẮT 3D cho NAM-002: đục hốc mắt theo viền vẽ, lắp nhãn cầu xoay được và mí trên đóng/mở.

Dùng từ rig_nam002.py:
  khoet_hoc(body)          — trước khi rig: xoá phần mắt vẽ bên trong viền, dựng thành hốc (tường hốc màu tối)
  tao_mat(sc)              — tạo nhãn cầu + mí (object riêng)
  gan_mat(arm, objs)       — sau khi có armature: thêm xương Eye/Lid, điều khiển `nhin`, thuộc tính chớp mắt trên Head
Số đo viền mắt (khớp elip trên ảnh mặt nhìn thẳng, toạ độ thế giới, mét): tâm x = ±0,052, z = 1,5295;
bán trục ngang 0,0340, dọc 0,0405 (viền ngoài cùng). Mí vẽ nằm ngang qua tâm ⇒ mặc định mí che nửa trên.
"""
import math
import bpy, bmesh
import numpy as np
from mathutils import Vector, Matrix

EYE_X, EYE_Z = 0.052, 1.5295
RX, RZ = 0.0340, 0.0405          # bán trục viền ngoài (ngang, dọc)
VIEN = 0.0040                    # bề dày nét viền vẽ: lỗ khoét nằm bên trong nét
SAU_HOC = 0.012                  # độ sâu tường hốc
HO = 0.0030                      # mặt trước nhãn cầu lùi sau mặt da
MI_MAC_DINH = 0.0                # góc mí mặc định (độ): mép mí nằm ngang qua tâm = lim dim như mẫu
MI_NHAM = 88.0                   # góc khi nhắm
MI_MO = -32.0                    # góc khi mở to
DA = (0.961, 0.690, 0.498)


def _mat(name, col, rough=0.5):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True; b = m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value = (*[c ** 2.2 for c in col], 1); b.inputs['Roughness'].default_value = rough
    return m


def _surface_y(body, x, z):
    """y của mặt da phía trước tại (x, z): bắn tia từ trước ra sau."""
    dg = bpy.context.evaluated_depsgraph_get()
    ok, loc, n, i = body.ray_cast(body.matrix_world.inverted() @ Vector((x, -1.0, z)), Vector((0, 1, 0)), depsgraph=dg)
    return (body.matrix_world @ loc).y if ok else -0.10


def khoet_hoc(body):
    me = body.data
    bm = bmesh.new(); bm.from_mesh(me)
    sock = _mat('hoc_mat', (0.10, 0.06, 0.05), 0.9)
    if sock.name not in me.materials: me.materials.append(sock)
    si = list(me.materials).index(sock)
    bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table()
    tong = 0
    for s in (1, -1):
        cx = s * EYE_X
        ins = lambda v: (v.co.y < -0.04) and (((v.co.x - cx) / (RX - VIEN)) ** 2 + ((v.co.z - EYE_Z) / (RZ - VIEN)) ** 2 < 1.0)
        faces = [f for f in bm.faces if any(ins(v) for v in f.verts)]          # bỏ mọi mặt chạm vào elip ⇒ không sót mẩu mắt vẽ
        tong += len(faces)
        bmesh.ops.delete(bm, geom=faces, context='FACES_ONLY')
        bm.verts.ensure_lookup_table()
        bnd = [e for e in bm.edges if e.is_boundary and all(ins(v) or (((v.co.x - cx) / (RX - VIEN)) ** 2 + ((v.co.z - EYE_Z) / (RZ - VIEN)) ** 2 < 1.15) for v in e.verts) and all(v.co.y < -0.04 for v in e.verts)]
        for v in {v for e in bnd for v in e.verts}:      # kéo mép lỗ về đúng elip ⇒ mép trơn, không răng cưa
            dx, dz = v.co.x - cx, v.co.z - EYE_Z; q = math.sqrt((dx / (RX - VIEN)) ** 2 + (dz / (RZ - VIEN)) ** 2)
            if q > 1e-6: v.co.x = cx + dx / q; v.co.z = EYE_Z + dz / q
        r = bmesh.ops.extrude_edge_only(bm, edges=bnd)
        nv = [g for g in r['geom'] if isinstance(g, bmesh.types.BMVert)]
        for v in nv:                                   # đẩy vào trong và co về tâm ⇒ tường hốc
            d = Vector((v.co.x - cx, 0, v.co.z - EYE_Z)); v.co.x = cx + d.x * 0.97; v.co.z = EYE_Z + d.z * 0.97; v.co.y += SAU_HOC
        for f in {f for v in nv for f in v.link_faces}: f.material_index = si; f.smooth = True
        # không lấp đáy: nhãn cầu bầu dục che kín lòng hốc
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    bm.to_mesh(me); me.update(); bm.free()
    print(f'  khoét hốc mắt: bỏ {tong} mặt vẽ mắt, tường hốc sâu {SAU_HOC * 1000:.0f} mm')


R_NHAN = 0.036                    # bán kính hình cầu chuẩn; nhãn cầu thật = cầu này co theo E (bầu dục khớp lỗ hốc)
E = (0.0292 / 0.036, 0.018 / 0.036, 0.0357 / 0.036)   # hệ số co x, y, z: rộng 58 mm, sâu 36 mm, cao 71 mm (lỗ hốc 60 × 73 mm)
FLAT = E[1]
R_MI = R_NHAN + 0.0012
GOC_MI = (0.0, 22.0, 44.0, 66.0, 88.0)   # các mốc shape key mí (độ quay quanh trục ngang, 0 = lim dim như mẫu)


def _eye_material(k):
    """Con ngươi tính theo hướng (đã bỏ dẹt) của điểm trên nhãn cầu; hướng nhìn quay bằng nút Mapping lái từ xương `nhin`."""
    m = bpy.data.materials.new(f'nhan_cau.{k}'); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial'); b = nt.nodes.new('ShaderNodeBsdfPrincipled'); nt.links.new(b.outputs[0], out.inputs[0])
    b.inputs['Roughness'].default_value = 0.25
    tc = nt.nodes.new('ShaderNodeTexCoord')
    sc_ = nt.nodes.new('ShaderNodeVectorMath'); sc_.operation = 'MULTIPLY'; sc_.inputs[1].default_value = (1 / E[0], 1 / E[1], 1 / E[2]); nt.links.new(tc.outputs['Object'], sc_.inputs[0])
    mp = nt.nodes.new('ShaderNodeMapping'); mp.name = 'huong_nhin'; mp.vector_type = 'VECTOR'; nt.links.new(sc_.outputs[0], mp.inputs['Vector'])
    nrm = nt.nodes.new('ShaderNodeVectorMath'); nrm.operation = 'NORMALIZE'; nt.links.new(mp.outputs[0], nrm.inputs[0])
    sp = nt.nodes.new('ShaderNodeSeparateXYZ'); nt.links.new(nrm.outputs[0], sp.inputs[0])
    neg = nt.nodes.new('ShaderNodeMath'); neg.operation = 'MULTIPLY'; neg.inputs[1].default_value = -1.0; nt.links.new(sp.outputs['Y'], neg.inputs[0])
    ramp = nt.nodes.new('ShaderNodeValToRGB'); nt.links.new(neg.outputs[0], ramp.inputs[0]); cr = ramp.color_ramp; cr.interpolation = 'EASE'
    cr.elements[0].position = math.cos(math.radians(30)); cr.elements[0].color = (0.92, 0.91, 0.89, 1)
    e = cr.elements.new(math.cos(math.radians(27))); e.color = (0.12, 0.06, 0.035, 1)
    e = cr.elements.new(math.cos(math.radians(16))); e.color = (0.10, 0.05, 0.03, 1)
    e = cr.elements.new(math.cos(math.radians(14))); e.color = (0.012, 0.008, 0.006, 1)
    cr.elements[-1].position = 1.0; cr.elements[-1].color = (0.012, 0.008, 0.006, 1)
    nt.links.new(ramp.outputs[0], b.inputs['Base Color'])
    return m


def _lid_material():
    m = bpy.data.materials.get('mi_mat') or bpy.data.materials.new('mi_mat'); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial'); b = nt.nodes.new('ShaderNodeBsdfPrincipled'); nt.links.new(b.outputs[0], out.inputs[0])
    b.inputs['Roughness'].default_value = 0.55
    at = nt.nodes.new('ShaderNodeAttribute'); at.attribute_name = 'mep_mi'
    ramp = nt.nodes.new('ShaderNodeValToRGB'); nt.links.new(at.outputs['Fac'], ramp.inputs[0]); cr = ramp.color_ramp; cr.interpolation = 'CONSTANT'
    cr.elements[0].position = 0.0; cr.elements[0].color = (*[c ** 2.2 for c in DA], 1)
    cr.elements[1].position = 0.5; cr.elements[1].color = (0.04, 0.025, 0.02, 1)                       # dải đường mi ở mép mí
    nt.links.new(ramp.outputs[0], b.inputs['Base Color'])
    return m


def _hemi(R, ang):
    """Nửa cầu trên bán kính R, quay `ang`° quanh trục X (dương = mép đưa xuống, đỉnh ra trước −Y), rồi dẹt theo Y."""
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=32, radius=R)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -1e-6], context='VERTS')
    return bm


def tao_mat(sc, body):
    objs = {}; lm = _lid_material()
    for s, k in ((1, 'L'), (-1, 'R')):
        cx = s * EYE_X; ys = _surface_y(body, cx, EYE_Z); cy = ys + HO + R_NHAN * FLAT
        me = bpy.data.meshes.new(f'NhanCau.{k}'); bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=64, v_segments=40, radius=R_NHAN)
        for v in bm.verts: v.co.x *= E[0]; v.co.y *= E[1]; v.co.z *= E[2]
        bm.to_mesh(me); bm.free(); e = bpy.data.objects.new(f'NhanCau.{k}', me); sc.collection.objects.link(e); e.location = (cx, cy, EYE_Z)
        me.materials.append(_eye_material(k))
        for p in me.polygons: p.use_smooth = True
        # mí: lưới gốc = nửa cầu trên (mép mí ngang qua tâm); shape key cho từng góc quay; dẹt theo Y sau khi quay
        bm = _hemi(R_MI, 0); edge = [v.co.z < 0.004 for v in bm.verts]; base = [v.co.copy() for v in bm.verts]
        for v in bm.verts: v.co.x *= E[0]; v.co.y *= E[1]; v.co.z *= E[2]
        lme = bpy.data.meshes.new(f'Mi.{k}'); bm.to_mesh(lme); bm.free()
        at = lme.attributes.new('mep_mi', 'FLOAT', 'POINT'); at.data.foreach_set('value', np.array(edge, np.float32))
        l = bpy.data.objects.new(f'Mi.{k}', lme); sc.collection.objects.link(l); l.location = (cx, cy, EYE_Z)
        l.shape_key_add(name='Basis')
        for ang in GOC_MI[1:] + (-32.0,):
            kb = l.shape_key_add(name=f'mi_{int(ang):+d}', from_mix=False); R = Matrix.Rotation(math.radians(ang), 3, 'X')
            for i, p0 in enumerate(base):
                q = R @ Vector((p0.x, p0.y, p0.z)); kb.data[i].co = Vector((q.x * E[0], q.y * E[1], q.z * E[2]))
        sol = l.modifiers.new('day', 'SOLIDIFY'); sol.thickness = 0.0012; sol.offset = 1
        lme.materials.append(lm)
        for p in lme.polygons: p.use_smooth = True
        objs[k] = (e, l, Vector((cx, cy, EYE_Z)))
        print(f'  mắt {k}: tâm ({cx:+.3f}, {cy:+.3f}, {EYE_Z:.3f}), mặt da y = {ys:+.3f}, nhãn cầu {2 * R_NHAN * E[0] * 1000:.0f} × {2 * R_NHAN * E[2] * 1000:.0f} mm, sâu {2 * R_NHAN * E[1] * 1000:.0f} mm')
    return objs


def gan_mat(arm, objs):
    """Xương `nhin` (dời để liếc), mắt và mí gắn cứng vào Head. Thuộc tính trên Head: chop_mat, chop_trai, chop_phai, mo_to (0–1).
    Liếc: driver đọc vị trí `nhin` → quay hướng con ngươi trong vật liệu (±1 đơn vị dời ≈ ±45°)."""
    bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode='EDIT'); eb = arm.data.edit_bones
    c0 = (objs['L'][2] + objs['R'][2]) / 2
    t = eb.new('nhin'); t.head = c0 + Vector((0, -0.45, 0)); t.tail = t.head + Vector((0, -0.05, 0)); t.parent = eb['Head']; t.use_deform = False
    bpy.ops.object.mode_set(mode='POSE'); pb = arm.pose.bones; h = pb['Head']
    for pr, desc in (('chop_mat', 'Nhắm cả hai mắt 0–1'), ('chop_trai', 'Nhắm mắt trái 0–1'), ('chop_phai', 'Nhắm mắt phải 0–1'), ('mo_to', 'Mở to 0–1')):
        h[pr] = 0.0; h.id_properties_ui(pr).update(min=0.0, max=1.0, description=desc)
    bpy.ops.object.mode_set(mode='OBJECT')
    hb = arm.data.bones['Head']
    for k in ('L', 'R'):
        e, l, c = objs[k]
        for ob in (e, l):
            w = ob.matrix_world.copy(); ob.parent = arm; ob.parent_type = 'BONE'; ob.parent_bone = 'Head'
            bpy.context.view_layer.update(); ob.matrix_world = w
        # liếc: góc = atan(dời / 0,45 m) theo hai trục (dời ngang thế giới X → quay quanh Z; dời dọc Z → quay quanh X)
        mp = e.data.materials[0].node_tree.nodes['huong_nhin']
        z0 = c0.z   # đầu xương nhin lúc nghỉ (thế giới)
        # con ngươi nằm nơi R·v = −Y ⇒ để con ngươi sang +X cần quay quanh Z một góc âm; lên +Z cần quay quanh X góc dương
        for idx, comp, expr in ((2, 'LOC_X', '-atan(p/0.45)'), (0, 'LOC_Z', f'atan((p - {z0:.5f})/0.45)')):
            d = mp.inputs['Rotation'].driver_add('default_value', idx).driver; d.type = 'SCRIPTED'
            v = d.variables.new(); v.name = 'p'; v.type = 'TRANSFORMS'; tg = v.targets[0]; tg.id = arm; tg.bone_target = 'nhin'; tg.transform_type = comp; tg.transform_space = 'WORLD_SPACE'
            d.expression = expr
        # mí
        keys = l.data.shape_keys.key_blocks
        def var(d):
            for vn, pr in (('c', 'chop_mat'), ('r', 'chop_trai' if k == 'L' else 'chop_phai'), ('o', 'mo_to')):
                v = d.variables.new(); v.name = vn; v.type = 'SINGLE_PROP'; v.targets[0].id = arm; v.targets[0].data_path = f'pose.bones["Head"]["{pr}"]'
        G = GOC_MI
        for j in range(1, len(G)):
            d = keys[f'mi_{int(G[j]):+d}'].driver_add('value').driver; d.type = 'SCRIPTED'; var(d)
            a0 = G[j - 1]; a1 = G[j]; a2 = G[j + 1] if j + 1 < len(G) else None
            g = f'({G[-1]}*min(1.0, c + r))'
            d.expression = (f'max(0.0, min(({g}-{a0})/{a1 - a0}, ({a2}-{g})/{a2 - a1})) if {g} > {a0} else 0.0' if a2 is not None
                            else f'max(0.0, min(1.0, ({g}-{a0})/{a1 - a0}))')
        d = keys['mi_-32'].driver_add('value').driver; d.type = 'SCRIPTED'; var(d); d.expression = 'o*(1 - min(1.0, c + r))'
    c = arm.data.collections.new('Mat'); c.assign(arm.data.bones['nhin'])
    bpy.context.view_layer.update()
