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

EYE_X, EYE_Z = 0.052, 1.5268      # theo nếp hốc trên lưới (viền vẽ cũ: z 1,5295)
RX, RZ = 0.0415, 0.0435  # nếp hốc: rộng hơn viền vẽ 22 %, cao hơn 7,5 % (trễ xuống dưới); viền vẽ cũ 0,0340 × 0,0405
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


def lam_muot_may(body, it=90):
    """Làm mượt Taubin lưới vùng lông mày (gờ nổi sần ⇒ mép sáng lởm chởm)."""
    me = body.data; n = len(me.vertices); co = np.zeros(n * 3); me.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
    e = np.zeros(len(me.edges) * 2, np.int64); me.edges.foreach_get('vertices', e); a, b = e[0::2], e[1::2]
    dg = np.bincount(np.concatenate([a, b]), minlength=n).clip(1)[:, None]
    x, y, z = co.T
    w = np.clip(np.minimum.reduce([(z - 1.548) / 0.008, (1.675 - z) / 0.01, (-0.04 - y) / 0.01, (0.125 - np.abs(x)) / 0.012]), 0, 1)
    R = w > 0
    for _ in range(it):
        for lam in (0.5, -0.53):
            acc = np.stack([np.bincount(a, co[b, j], n) + np.bincount(b, co[a, j], n) for j in range(3)], 1) / dg
            co[R] += (lam * w[R])[:, None] * (acc[R] - co[R])
    me.vertices.foreach_set('co', co.ravel()); me.update()
    print(f'  làm mượt lưới lông mày: {int(R.sum())} đỉnh')


def khoet_hoc(body):
    me = body.data
    bm = bmesh.new(); bm.from_mesh(me)
    sock = _mat('hoc_mat', (0.62, 0.42, 0.30), 0.9)          # màu da tối: mép cắt lộ ra không thành gai đen
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
    tc = nt.nodes.new('ShaderNodeAttribute'); tc.attribute_name = 'goc'           # toạ độ trước khi uốn mép ⇒ con ngươi không méo
    sc_ = nt.nodes.new('ShaderNodeVectorMath'); sc_.operation = 'MULTIPLY'; sc_.inputs[1].default_value = (1 / E[0], 1 / E[1], 1 / E[2]); nt.links.new(tc.outputs['Vector'], sc_.inputs[0])
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


LOI = 0.006      # mặt trước nhãn cầu nhô trước mặt phẳng mép hốc
KHIT = 1.02      # nhãn cầu rộng hơn lỗ 2 % (vừa đủ che khe, không lấn nét viền vẽ)
NGHIENG_DUOI = 0.0  # độ: ngả nhãn cầu quanh trục ngang để nửa dưới nhô ra (da gò má dưới mắt cao hơn)
LUI_MEP = 0.0025 # ở mép lỗ, mặt nhãn cầu nằm sau mặt phẳng mép hốc chừng này


def _khung_mep(body, cx):
    """Mặt phẳng khớp với mép lỗ hốc (bắn tia lên da theo elip lỗ) → (tâm, pháp tuyến hướng ra ngoài, ma trận khung)."""
    a_, b_ = RX - VIEN, RZ - VIEN; P = []
    for th in np.linspace(0, 2 * np.pi, 48, endpoint=False):
        x = cx + a_ * math.cos(th); z = EYE_Z + b_ * math.sin(th); P.append((x, _surface_y(body, x, z), z))
    P = np.array(P); c = P.mean(0); _, _, Vt = np.linalg.svd(P - c); n = Vt[2]
    if n[1] > 0: n = -n                                         # hướng ra trước (−Y)
    n = Vector(n); up = Vector((0, 0, 1)); xa = up.cross(-n).normalized() if False else (Vector((0, 0, 1)).cross(n)).normalized()
    za = n.cross(xa).normalized()                                # khung: x ngang, −y = n (ra ngoài), z lên
    M = Matrix((xa, -n, za)).transposed()
    if M.determinant() < 0: xa = -xa; M = Matrix((xa, -n, za)).transposed()
    q = (P - c) @ np.array(M)                                   # toạ độ cục bộ của điểm mép; +y cục bộ = vào trong
    th = np.arctan2(q[:, 2] / b_, q[:, 0] / a_); h = -q[:, 1]   # h > 0: da ở góc đó nhô ra trước mặt phẳng
    o = np.argsort(th); print(f'  mép hốc nhô so với mặt phẳng: {h.min() * 1000:+.1f}…{h.max() * 1000:+.1f} mm')
    global _MEP; _MEP = (th[o], h[o])
    return Vector(c), n, M, a_, b_


_MEP = None


def _uon(co, ax_, az_):
    """Uốn phía trước: dời ra ngoài theo độ nhô của da mép tại cùng góc, tăng dần từ tâm (0) ra mép (1)."""
    th0, h0 = _MEP
    x, y, z = co.x, co.y, co.z
    if y > 0: return co
    th = math.atan2(z / az_, x / ax_); w = min(1.0, (x / ax_) ** 2 + (z / az_) ** 2)
    h = float(np.interp(th, th0, h0, period=2 * np.pi))
    return Vector((x, y - h * w, z))


_VANH = {}
VIEN_R = 0.0013   # bán kính ống viền 3D (nét ≈ 2,6 mm)


def _vien_3d(sc, body, cx, k):
    """Đường viền 3D trơn ôm mép hốc: NURBS khép kín qua 64 điểm trên da ngay ngoài mép lỗ, tiết diện tròn."""
    a_, b_ = RX - VIEN, RZ - VIEN                      # đúng mép lỗ ⇒ ống viền che mép cắt
    pts = []
    for th in np.linspace(0, 2 * np.pi, 64, endpoint=False):
        x = cx + a_ * math.cos(th); z = EYE_Z + b_ * math.sin(th); pts.append((x, _surface_y(body, x, z) - 0.0002, z))
    cu = bpy.data.curves.new(f'Vien.{k}', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = VIEN_R; cu.bevel_resolution = 4; cu.resolution_u = 6
    sp = cu.splines.new('NURBS'); sp.points.add(len(pts) - 1)
    for p_, q in zip(sp.points, pts): p_.co = (*q, 1)
    sp.use_cyclic_u = True; sp.order_u = 4
    ob = bpy.data.objects.new(f'Vien.{k}', cu); sc.collection.objects.link(ob)
    # vành da mỏng ngay ngoài nét viền: che mép cắt lởm chởm của lưới da
    a2, b2 = a_ + 0.0026, b_ + 0.0026; cu2 = bpy.data.curves.new(f'VanhDa.{k}', 'CURVE'); cu2.dimensions = '3D'; cu2.bevel_depth = 0.0017; cu2.bevel_resolution = 4; cu2.resolution_u = 6
    sp2 = cu2.splines.new('NURBS'); sp2.points.add(63)
    for p_, th in zip(sp2.points, np.linspace(0, 2 * np.pi, 64, endpoint=False)):
        xx = cx + a2 * math.cos(th); zz = EYE_Z + b2 * math.sin(th); p_.co = (xx, _surface_y(body, xx, zz) + 0.0009, zz, 1)
    sp2.use_cyclic_u = True; sp2.order_u = 4
    ob2 = bpy.data.objects.new(f'VanhDa.{k}', cu2); sc.collection.objects.link(ob2)
    cu2.materials.append(body.data.materials[0]); _VANH[k] = ob2
    m = bpy.data.materials.get('vien_mat') or _mat('vien_mat', (0.18, 0.11, 0.08), 0.6); cu.materials.append(m)
    return ob


MAY_NANG_DUOI = 0.004   # nâng mép dưới lông mày (m) ⇒ mày mảnh hơn, không lem xuống viền mắt
_MAY = {}


def tao_may(sc, body):
    """Lông mày 3D: tấm cong bám da theo dáng mày vẽ (du-lieu/long-may.json: mép dưới/trên theo x), phồng giữa 1,6 mm, hai đầu bo tròn."""
    import json, os
    D_ = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'du-lieu', 'long-may.json')))
    m = bpy.data.materials.get('may_mat') or _mat('may_mat', (0.13, 0.095, 0.08), 0.8); out = {}
    for k in ('L', 'R'):
        x = np.array(D_[k]['x']); zd = np.array(D_[k]['zd']); zt = np.array(D_[k]['zt']); o = np.argsort(x); x, zd, zt = x[o], zd[o], zt[o]
        pd, pt = np.polyfit(x, zd + MAY_NANG_DUOI, 2), np.polyfit(x, zt, 4)      # mép dưới: nâng lên & bậc 2 cho trơn
        x0, x1 = x.min() - 0.002, x.max() + 0.003; NU, NV = 48, 10
        bm = bmesh.new(); grid = []
        for i in range(NU + 1):
            t = i / NU; xx = x0 + (x1 - x0) * t
            zc = (np.polyval(pd, xx) + np.polyval(pt, xx)) / 2; hw = (np.polyval(pt, xx) - np.polyval(pd, xx)) / 2
            hw *= 1.10 * math.sqrt(max(0.0, 1 - (2 * t - 1) ** 8))                     # bo tròn hai đầu
            row = []
            for j in range(NV + 1):
                u = j / NV * 2 - 1; zz = zc + hw * u
                y = _surface_y(body, xx, zz) - (0.0013 + 0.0016 * math.sqrt(max(0.0, 1 - u * u)) * (hw > 1e-4))
                row.append(bm.verts.new((xx, y, zz)))
            grid.append(row)
        for i in range(NU):
            for j in range(NV): bm.faces.new((grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]))
        bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=1e-5); bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
        me = bpy.data.meshes.new(f'LongMay.{k}'); bm.to_mesh(me); bm.free()
        for p in me.polygons: p.use_smooth = True
        ob = bpy.data.objects.new(f'LongMay.{k}', me); sc.collection.objects.link(ob); me.materials.append(m)
        sub = ob.modifiers.new('muot', 'SUBSURF'); sub.levels = sub.render_levels = 1
        out[k] = ob
    print('  lông mày 3D: 2 tấm'); _MAY.update(out)
    return out


def tao_mat(sc, body):
    objs = {}; lm = _lid_material()
    for s, k in ((1, 'L'), (-1, 'R')):
        cx = s * EYE_X
        c, n, M, a_, b_ = _khung_mep(body, cx)
        ax_, az_ = KHIT * a_, KHIT * b_
        dep = (LOI + LUI_MEP) / (1 - math.sqrt(1 - 1 / KHIT ** 2))      # bán trục sâu để mép lỗ lùi LUI_MEP sau mặt phẳng
        Ek = (ax_ / R_NHAN, dep / R_NHAN, az_ / R_NHAN)
        M = M @ Matrix.Rotation(math.radians(-NGHIENG_DUOI), 3, 'X')
        ctr = c + n * (LOI - dep)
        me = bpy.data.meshes.new(f'NhanCau.{k}'); bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=64, v_segments=40, radius=R_NHAN)
        for v in bm.verts: v.co.x *= Ek[0]; v.co.y *= Ek[1]; v.co.z *= Ek[2]
        goc = np.array([v.co[:] for v in bm.verts], np.float32)
        for v in bm.verts: v.co = _uon(v.co, ax_, az_)
        bm.to_mesh(me); me.attributes.new('goc', 'FLOAT_VECTOR', 'POINT').data.foreach_set('vector', goc.ravel()); bm.free(); e = bpy.data.objects.new(f'NhanCau.{k}', me); sc.collection.objects.link(e)
        e.matrix_world = Matrix.Translation(ctr) @ M.to_4x4()
        mat = _eye_material(k); mat.node_tree.nodes['Vector Math'].inputs[1].default_value = (1 / Ek[0], 1 / Ek[1], 1 / Ek[2])
        me.materials.append(mat)
        for p in me.polygons: p.use_smooth = True
        Rm = R_NHAN + 0.0012; El = ((ax_ + 0.0012) / Rm, (dep + 0.0012) / Rm, (az_ + 0.0012) / Rm)
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=32, radius=Rm)
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -1e-6], context='VERTS')
        edge = [v.co.z < 0.004 for v in bm.verts]; base = [v.co.copy() for v in bm.verts]
        for v in bm.verts: v.co.x *= El[0]; v.co.y *= El[1]; v.co.z *= El[2]; v.co = _uon(v.co, ax_ + 0.0012, az_ + 0.0012)
        lme = bpy.data.meshes.new(f'Mi.{k}'); bm.to_mesh(lme); bm.free()
        at = lme.attributes.new('mep_mi', 'FLOAT', 'POINT'); at.data.foreach_set('value', np.array(edge, np.float32))
        l = bpy.data.objects.new(f'Mi.{k}', lme); sc.collection.objects.link(l); l.matrix_world = Matrix.Translation(ctr) @ M.to_4x4()
        l.shape_key_add(name='Basis')
        for ang in GOC_MI[1:] + (-32.0,):
            kb = l.shape_key_add(name=f'mi_{int(ang):+d}', from_mix=False); R = Matrix.Rotation(math.radians(ang), 3, 'X')
            for i, p0 in enumerate(base):
                q = R @ p0; kb.data[i].co = _uon(Vector((q.x * El[0], q.y * El[1], q.z * El[2])), ax_ + 0.0012, az_ + 0.0012)
        sol = l.modifiers.new('day', 'SOLIDIFY'); sol.thickness = 0.0012; sol.offset = 1
        lme.materials.append(lm)
        for p in lme.polygons: p.use_smooth = True
        objs[k] = (e, l, ctr.copy(), _vien_3d(sc, body, cx, k))
        tilt = math.degrees(math.acos(max(-1, min(1, -n.y))))
        print(f'  mắt {k}: mép hốc nghiêng {tilt:.1f}° so với nhìn thẳng; nhãn cầu {2 * ax_ * 1000:.0f} × {2 * az_ * 1000:.0f} mm, sâu {2 * dep * 1000:.0f} mm, nhô {LOI * 1000:.0f} mm trước mép')
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
        e, l, c, vn = objs[k]
        for ob in (e, l, vn, _VANH[k], _MAY.get(k)):
            if ob is None: continue
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
