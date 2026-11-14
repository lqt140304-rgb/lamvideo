"""Mặt diễn xuất cho base nữ: mắt (lòng trắng, con ngươi, mí), mày, miệng. rig_nu.py import và gọi.

Quy ước: nhân vật nhìn −Y, .L = +X. Mọi object mặt nằm trong collection của rig, cha là xương của Nu_Rig.
"""
import math

import bmesh
import bpy
import numpy as np
from mathutils import Matrix, Vector


# ---------- tiện ích chung ----------

def anh_diffuse(body):
    """Mảng điểm ảnh (H, W, 3) của texture diffuse trên vật liệu thân."""
    im = next(n.image for n in body.data.materials[0].node_tree.nodes
              if n.type == 'TEX_IMAGE' and n.image and 'diffuse' in n.image.name)
    w, h = im.size
    px = np.empty(w * h * 4, np.float32)
    im.pixels.foreach_get(px)
    return px.reshape(h, w, 4)[..., :3]


def mau_tai(px, uv):
    h, w = px.shape[:2]
    return px[np.clip((uv[:, 1] * h).astype(int), 0, h - 1), np.clip((uv[:, 0] * w).astype(int), 0, w - 1)]


def mau_mat_luoi(body, px, f, n=4):
    """Lấy mẫu đều trên mặt lưới f: trả (vị trí 3D, màu) của các điểm mẫu."""
    me = body.data
    uvl = me.uv_layers[0].data
    li = list(f.loop_indices)
    P = np.array([me.vertices[me.loops[l].vertex_index].co for l in li])
    U = np.array([uvl[l].uv for l in li])
    pos, uv = [], []
    for t in range(1, len(li) - 1):  # quạt tam giác
        for i in range(n + 1):
            for j in range(n + 1 - i):
                a, b = i / n, j / n
                c = 1 - a - b
                pos.append(P[0] * c + P[t] * a + P[t + 1] * b)
                uv.append(U[0] * c + U[t] * a + U[t + 1] * b)
    pos, uv = np.array(pos), np.array(uv)
    return pos, mau_tai(px, uv)


def lum_sat(c):
    mx, mn = c.max(1), c.min(1)
    return c.mean(1), (mx - mn) / np.maximum(mx, 1e-6)


def uv_da(body, px):
    """Một toạ độ UV rơi vào da (trán) để tô vật liệu da cho mí."""
    me = body.data
    uvl = me.uv_layers[0].data
    best = None
    for p in me.polygons:
        c = p.center
        if abs(c.x) < 0.03 and 1.55 < c.z < 1.62 and c.y < 0:
            u = np.array(uvl[p.loop_indices[0]].uv)
            col = mau_tai(px, u[None])[0]
            if col.mean() > 0.55:
                return u
            best = u
    return best


def _uv_theo_da(me, body, tam=None, lui=0.0):
    """UV của mỗi đỉnh = UV điểm da gần nhất trên thân: mí liền màu/vân với da quanh mắt."""
    from mathutils.bvhtree import BVHTree
    from mathutils.geometry import barycentric_transform
    bme = bmesh.new()
    bme.from_mesh(body.data)
    bmesh.ops.triangulate(bme, faces=bme.faces[:])
    bme.faces.ensure_lookup_table()
    uvb = bme.loops.layers.uv[0]
    bvh = BVHTree.FromBMesh(bme)
    uvl = me.uv_layers.new(name='UVMap')
    for li, lp in enumerate(me.loops):
        p = me.vertices[lp.vertex_index].co
        if tam is not None:  # lấy mẫu xa tâm hốc hơn `lui`: mép hốc còn vệt lòng trắng vẽ
            d = p - tam
            d.y = 0
            p = p + d.normalized() * lui
        _, _, fi, _ = bvh.find_nearest(p)
        f = bme.faces[fi]
        a, b, c = (l.vert.co for l in f.loops)
        ua, ub, uc = (l[uvb].uv.to_3d() for l in f.loops)
        uvl.data[li].uv = barycentric_transform(p, a, b, c, ua, ub, uc).to_2d()
    bme.free()


def mat_phang(ten, rgba, rough=0.4):
    m = bpy.data.materials.new(ten)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = rgba
    b.inputs['Roughness'].default_value = rough
    return m


def tao_xuong(rig, ds):
    """ds: [(tên, cha, đầu, đuôi, roll_z_vec)] — thêm xương không biến dạng vào rig."""
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode='EDIT')
    eb = rig.data.edit_bones
    for ten, cha, h, t, up in ds:
        e = eb.new(ten)
        e.head, e.tail = Vector(h), Vector(t)
        e.use_deform = False
        if cha:
            e.parent = eb[cha]
        e.align_roll(Vector(up))
    bpy.ops.object.mode_set(mode='OBJECT')


def gan_vao_xuong(ob, rig, xuong):
    """Đặt ob làm con của xương, giữ nguyên vị trí thế giới hiện tại."""
    mw = ob.matrix_world.copy()
    ob.parent = rig
    ob.parent_type = 'BONE'
    ob.parent_bone = xuong
    bpy.context.view_layer.update()
    ob.matrix_world = mw


def bo_suu_tap(rig, ten, xuong):
    bc = rig.data.collections.get(ten) or rig.data.collections.new(ten)
    for x in xuong:
        bc.assign(rig.data.bones[x])


def them_driver(id_, path, idx, rig, bien, expr):
    fc = id_.driver_add(path, idx) if idx is not None else id_.driver_add(path)
    for ten, dp in bien.items():
        v = fc.driver.variables.new()
        v.name = ten
        v.targets[0].id = rig
        v.targets[0].data_path = dp
    fc.driver.expression = expr
    return fc


# ---------- mắt ----------

def _do_mat(body, px, sg):
    """Tìm các mặt lưới bên trong hốc mắt bên dấu sg và tâm mống mắt vẽ trên texture."""
    me = body.data
    cand = {}
    for p in me.polygons:
        c = p.center
        if 1.36 < c.z < 1.56 and 0.025 < sg * c.x < 0.18 and c.y < -0.1 and p.normal.y < -0.2:
            pos, col = mau_mat_luoi(body, px, p)
            l, s = lum_sat(col)
            cand[p.index] = (pos, col, max(((s < 0.3) & (l < 0.97)).mean(), 1.2 * ((l < 0.15) & (s < 0.5)).mean()))
    den = []  # điểm đen, ít sắc: mống mắt (đĩa lớn) lẫn hàng mi (nét mảnh); mày nâu bị loại
    for pos, col, _ in cand.values():
        l, s = lum_sat(col)
        den.append(pos[(l < 0.15) & (s < 0.5)])
    den = np.concatenate(den)
    assert len(den) > 20, f'Không thấy mống mắt bên {sg:+d}'
    tam = np.median(den, 0)
    for _ in range(8):  # dồn về cụm dày nhất = đĩa mống mắt
        mong = den[np.linalg.norm(den - tam, axis=1) < 0.022]
        tam = mong.mean(0)
    # mặt trong hốc: khung bao các mặt chắc chắn là mắt (≥ 0.6), nới 1.5 cm, lấy mọi mặt ≥ 0.3 trong khung
    # (lưới thưa: các mặt nhiều màu mắt không liền cạnh nhau, không loang được)
    chac = np.array([me.polygons[i].center[:] for i, (_, _, fr) in cand.items()
                     if fr >= 0.6 and np.linalg.norm(np.array(me.polygons[i].center) - tam) < 0.08])
    assert len(chac) >= 4, f'Quá ít mặt chắc là mắt bên {sg:+d}'
    lo, hi = chac.min(0) - 0.015, chac.max(0) + 0.015
    vung = [i for i, (_, _, fr) in cand.items() if fr >= 0.3
            and all(lo[a] <= me.polygons[i].center[a] <= hi[a] for a in (0, 2))]
    # thêm đúng một vòng mặt sát hốc mang màu mi nâu đen (vạt mi cũ); dải mi của mí mới thay chúng
    bm = bmesh.new()
    bm.from_mesh(me)
    bm.faces.ensure_lookup_table()
    sat_hoc = {g.index for i in vung for e in bm.faces[i].edges for g in e.link_faces} - set(vung)
    bm.free()
    for i in sat_hoc:
        if i in cand:
            l, s = lum_sat(cand[i][1])
            if ((l < 0.35) & (s > 0.4)).mean() > 0.15:
                vung.append(i)
    r_mong = math.sqrt(2) * np.sqrt(((mong - tam) ** 2).sum(1).mean())
    trang = []  # điểm lòng trắng vẽ: sáng, ít sắc
    for i in vung:
        pos, col, _ = cand[i]
        l, s = lum_sat(col)
        trang.append(pos[(l > 0.75) & (s < 0.25)])
    mat_ve = np.concatenate(trang + [mong])  # hình mắt vẽ = lòng trắng + mống
    return sorted(vung), tam, r_mong, mat_ve


def _vo_elip(C, ax, R, eps_rows, phi, ten, mats=None):
    """Lưới dải trên vỏ elip tâm C, trục ax=(u, fwd, up), bán kính R=(ru, rf, rz):
    hàng theo độ cao eps_rows (rad), cột theo phương vị phi (rad, 0 = nhìn thẳng)."""
    u, fw, up = ax

    def diem(e, p):
        return C + u * (R[0] * math.cos(e) * math.sin(p)) + fw * (R[1] * math.cos(e) * math.cos(p)) + up * (R[2] * math.sin(e))

    bm = bmesh.new()
    rows = [[bm.verts.new(diem(e, p)) for p in phi] for e in eps_rows]
    for i in range(len(rows) - 1):
        for j in range(len(phi) - 1):
            bm.faces.new((rows[i][j], rows[i][j + 1], rows[i + 1][j + 1], rows[i + 1][j]))
    me = bpy.data.meshes.new(ten)
    bm.to_mesh(me)
    bm.free()
    return me, diem


def dung_mat(body, rig, coll):
    px = anh_diffuse(body)
    sc = bpy.context.scene
    uv_skin = uv_da(body, px)
    m_lt = mat_phang('Nu_LongTrang', (0.93, 0.93, 0.95, 1), 0.3)
    m_mi = mat_phang('Nu_Mi', (0.03, 0.025, 0.03, 1), 0.6)
    ket = {'tam': {}, 'ban_kinh': 0.0}
    from mathutils.bvhtree import BVHTree
    bm0 = bmesh.new()
    bm0.from_mesh(body.data)
    bvh_goc = BVHTree.FromBMesh(bm0)  # mặt da gốc trước khi khoét: mí mở bám lên đây
    bm0.free()
    xuong = [('look', 'head', (0, -0.55, 1.46), (0, -0.60, 1.46), (0, 0, 1))]
    cho_sau = []
    for k, sg in (('L', 1), ('R', -1)):
        faces, tam_ve, r_mong, mat_ve = _do_mat(body, px, sg)
        sc[f'tam_mong_mat_ve_{k}'] = tuple(float(v) for v in tam_ve)  # mống mắt vẽ trong mẫu (đang liếc)
        # khoét hốc, lấy viền
        bm = bmesh.new()
        bm.from_mesh(body.data)
        bm.faces.ensure_lookup_table()
        bmesh.ops.delete(bm, geom=[bm.faces[i] for i in faces], context='FACES_ONLY')
        bm.verts.ensure_lookup_table()
        vien = np.array([v.co[:] for v in bm.verts if v.is_boundary and v.link_faces  # khóe ngoài lùi sau: lọc theo khoảng cách
                         and (v.co - Vector(tam_ve)).length < 0.1 and sg * v.co.x > 0.02])
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
        bm.to_mesh(body.data)
        bm.free()
        assert len(vien) >= 6, f'Viền hốc mắt {k} quá ít đỉnh: {len(vien)}'
        c = vien.mean(0)
        _, _, vt = np.linalg.svd(vien - c)
        n = vt[2] if vt[2][1] < 0 else -vt[2]          # pháp tuyến hướng ra trước (−Y)
        up = np.array([0, 0, 1.0]) - n * n[2]
        up /= np.linalg.norm(up)
        u = np.cross(n, up) * -1                        # trục ngang (+X)
        u *= np.sign(u[0]) or 1
        q = vien - c
        ru0, rz0 = np.abs(q @ u).max() + 0.002, np.abs(q @ up).max() + 0.002
        # elip nông: mũi lồi 3 mm trước mặt phẳng hốc, mặt cắt tại mặt phẳng hốc vẫn rộng hơn viền
        rf, lui = 0.012, 0.009
        k_cat = math.sqrt(1 - (lui / rf) ** 2)
        ru, rz = ru0 / k_cat, rz0 / k_cat
        C = c - n * lui
        ax = (Vector(u), Vector(n), Vector(up))
        # lòng trắng (cố định theo đầu)
        phi = np.linspace(-math.pi * 0.95, math.pi * 0.95, 33)
        eps = np.linspace(-math.pi / 2 * 0.98, math.pi / 2 * 0.98, 17)
        me_lt, _ = _vo_elip(Vector(C), ax, (ru, rf, rz), eps, phi, f'Nu_LongTrang.{k}')
        # lòng trắng cố định: chỉ giữ phần sau hốc (elip rộng hơn hốc sẽ xuyên da ở thái dương)
        bm = bmesh.new()
        bm.from_mesh(me_lt)
        bo = [v for v in bm.verts if abs((np.array(v.co) - c) @ u) > ru0 * 1.2
              or abs((np.array(v.co) - c) @ up) > rz0 * 1.4 or (np.array(v.co) - C) @ n < -0.002]
        bmesh.ops.delete(bm, geom=bo, context='VERTS')
        bm.to_mesh(me_lt)
        bm.free()
        me_lt.materials.append(m_lt)
        lt = bpy.data.objects.new(f'Nu_LongTrang.{k}', me_lt)
        coll.objects.link(lt)
        for p in me_lt.polygons:
            p.use_smooth = True
        # mí trên/dưới: vỏ elip lớn hơn 6 %. Khi mở, mép mí theo cung hạnh nhân của mắt vẽ (che phần hốc thừa);
        # shape key 'dong' kéo mép về đường gặp ngay dưới tâm.
        R_mi = (ru * 1.06, rf * 1.06 + 0.001, rz * 1.06)
        qv = mat_ve - c
        w, top, bot = np.abs(qv @ u).max(), (qv @ up).max(), (qv @ up).min()
        xs = np.linspace(-ru0 * 1.2, ru0 * 1.2, 21)  # cột mí giữ toạ độ ngang cố định ở mọi hàng
        phm = xs
        t_hang = np.array([0, 0.05, 0.2, 0.4, 0.6, 0.8, 1.0])
        T_BAM = 0.4  # hàng từ đây trở đi bám da gốc (cả khi mở lẫn khi nhắm): mí nối liền da
        e_gap = math.asin(max(-0.99, 0.2 * bot / R_mi[2]))
        mi = {}
        for ten, z_mep, e_xa in (('Tren', top, math.pi / 2 * 0.95), ('Duoi', bot, -math.pi / 2 * 0.95)):
            def diem(e, x):
                ce = max(math.cos(e), 1e-3)
                p = math.asin(max(-1.0, min(1.0, x / (R_mi[0] * ce))))
                return (Vector(C) + Vector(u) * (R_mi[0] * ce * math.sin(p))
                        + Vector(n) * (R_mi[1] * ce * math.cos(p)) + Vector(up) * (R_mi[2] * math.sin(e)))

            def e_mep(x):
                z = z_mep * math.sqrt(max(0.0, 1 - (x / w) ** 2))
                return math.asin(max(-0.99, min(0.99, z / R_mi[2])))

            bm = bmesh.new()
            def bam(v):
                hit = bvh_goc.find_nearest(v)
                return hit[0] - hit[1] * 0.0008 if hit[0] is not None and (hit[0] - v) @ Vector(n) > 0 else v  # lùi sau da: chỗ còn da thì da che

            vi_tri = [[diem(e_mep(p) + t * (e_xa - e_mep(p)), p) for p in phm] for t in t_hang]
            vi_tri = [[bam(v) if t >= T_BAM else v for v in hang] for t, hang in zip(t_hang, vi_tri)]
            rows = [[bm.verts.new(v) for v in hang] for hang in vi_tri]
            for i in range(len(rows) - 1):
                for j in range(len(phm) - 1):
                    f = bm.faces.new((rows[i][j], rows[i][j + 1], rows[i + 1][j + 1], rows[i + 1][j]))
                    xg = abs((phm[j] + phm[j + 1]) / 2)
                    f.material_index = 1 if (i == 0 and ten == 'Tren' and xg < 0.92 * w) else 0  # hàng mi
                    f.smooth = True
            me_mi = bpy.data.meshes.new(f'Nu_Mi{ten}.{k}')
            bm.to_mesh(me_mi)
            bm.free()
            me_mi.materials.append(body.data.materials[0])
            me_mi.materials.append(m_mi)
            ob = bpy.data.objects.new(f'Nu_Mi{ten}.{k}', me_mi)
            coll.objects.link(ob)
            _uv_theo_da(me_mi, body, Vector(c), 0.012)
            ob.shape_key_add(name='Basis')
            sk = ob.shape_key_add(name='dong', from_mix=False)
            for i, t in enumerate(t_hang):
                for j, p in enumerate(phm):
                    sk.data[i * len(phm) + j].co = vi_tri[i][j] if t >= T_BAM else diem(e_gap + t / T_BAM * (e_mep(p) + T_BAM * (e_xa - e_mep(p)) - e_gap), p)
            mi[ten] = ob
        # xương mắt
        truc = Vector(c) - Vector(n) * 0.04            # điểm xoay lùi sâu: mống mắt dời đủ xa khi liếc
        xuong.append((f'eye.{k}', 'head', tuple(truc), tuple(truc + Vector(n) * 0.03), (0, 0, 1)))
        dich = truc + Vector(n) * 0.6                   # dáng nghỉ nhìn thẳng theo pháp tuyến hốc
        xuong.append((f'look.{k}', 'look', tuple(dich), tuple(dich + Vector((0, -0.05, 0))), (0, 0, 1)))
        # con ngươi: đĩa (mống + con ngươi tô theo bán kính), bám lòng trắng
        bm = bmesh.new()
        r_mong = 0.72 * rz0                             # mống mắt đen lớn như mẫu (≈ 3/4 chiều cao hốc)
        bmesh.ops.create_circle(bm, cap_ends=True, cap_tris=True, segments=32, radius=r_mong)
        bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=Matrix.Rotation(math.pi / 2, 3, 'X'), verts=bm.verts)
        bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=2, use_grid_fill=True)
        me_cn = bpy.data.meshes.new(f'Nu_ConNguoi.{k}')
        bm.to_mesh(me_cn)
        bm.free()
        me_cn.materials.append(_mat_mong(r_mong))
        cn = bpy.data.objects.new(f'Nu_ConNguoi.{k}', me_cn)
        coll.objects.link(cn)
        # mặt đĩa vuông góc trục mắt, đặt ở mũi lòng trắng
        rot = Vector(n).to_track_quat('-Y', 'Z').to_matrix().to_4x4()
        cn.matrix_world = Matrix.Translation(Vector(C) + Vector(n) * rf) @ rot
        sw = cn.modifiers.new('BAM_LONG_TRANG', 'SHRINKWRAP')
        sw.target, sw.wrap_method, sw.wrap_mode, sw.offset = lt, 'NEAREST_SURFACEPOINT', 'OUTSIDE_SURFACE', 0.0004
        sc[f'tam_hoc_mat_{k}'] = tuple(float(v) for v in c)
        cho_sau.append((k, lt, mi, cn))
        ket['tam'][k] = Vector(C)
        ket['ban_kinh'] = float(max(ket['ban_kinh'], ru))
    tao_xuong(rig, xuong)
    pb = rig.pose.bones
    head = pb['head']
    for k, lt, mi, cn in cho_sau:
        t = pb[f'eye.{k}'].constraints.new('DAMPED_TRACK')
        t.target, t.subtarget, t.track_axis = rig, f'look.{k}', 'TRACK_Y'
        gan_vao_xuong(cn, rig, f'eye.{k}')
        for ob in (lt, *mi.values()):
            gan_vao_xuong(ob, rig, 'head')
        for ten in ('blink', 'squint'):
            head[f'{ten}_{k}'] = 0.0
            head.id_properties_ui(f'{ten}_{k}').update(min=0.0, max=1.0, soft_min=0.0, soft_max=1.0)
        bien = {'b': f'pose.bones["head"]["blink_{k}"]', 's': f'pose.bones["head"]["squint_{k}"]'}
        them_driver(mi['Tren'].data.shape_keys.key_blocks['dong'], 'value', None, rig, bien, 'b')
        them_driver(mi['Duoi'].data.shape_keys.key_blocks['dong'], 'value', None, rig, bien, 'max(b, s*0.6)')
    bo_suu_tap(rig, 'Mat', ['look', 'look.L', 'look.R', 'eye.L', 'eye.R'])
    return ket


def _mat_mong(r):
    """Đĩa mống mắt: đen, viền nâu sẫm, một đốm sáng lệch lên trên – sang trái (toạ độ object)."""
    m = bpy.data.materials.new('Nu_Mong')
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes['Principled BSDF']
    b.inputs['Roughness'].default_value = 0.12
    tc = nt.nodes.new('ShaderNodeTexCoord')
    ln = nt.nodes.new('ShaderNodeVectorMath')
    ln.operation = 'LENGTH'
    mr = nt.nodes.new('ShaderNodeMapRange')
    mr.inputs['From Max'].default_value = r
    cr = nt.nodes.new('ShaderNodeValToRGB')
    el = cr.color_ramp.elements
    el[0].position, el[0].color = 0.0, (0.004, 0.004, 0.005, 1)
    el[1].position, el[1].color = 1.0, (0.03, 0.02, 0.015, 1)
    e = el.new(0.8)
    e.color = (0.012, 0.009, 0.008, 1)
    nt.links.new(tc.outputs['Object'], ln.inputs[0])
    nt.links.new(ln.outputs['Value'], mr.inputs['Value'])
    nt.links.new(mr.outputs['Result'], cr.inputs['Fac'])
    # đốm sáng: khoảng cách tới điểm (−0.35r, 0, +0.35r) < 0.2r → trắng
    off = nt.nodes.new('ShaderNodeVectorMath')
    off.operation = 'SUBTRACT'
    off.inputs[1].default_value = (-0.35 * r, 0, 0.35 * r)
    l2 = nt.nodes.new('ShaderNodeVectorMath')
    l2.operation = 'LENGTH'
    st = nt.nodes.new('ShaderNodeMath')
    st.operation = 'LESS_THAN'
    st.inputs[1].default_value = 0.2 * r
    mx = nt.nodes.new('ShaderNodeMix')
    mx.data_type = 'RGBA'
    mx.inputs['B'].default_value = (0.95, 0.95, 0.95, 1)
    nt.links.new(tc.outputs['Object'], off.inputs[0])
    nt.links.new(off.outputs['Vector'], l2.inputs[0])
    nt.links.new(l2.outputs['Value'], st.inputs[0])
    nt.links.new(st.outputs['Value'], mx.inputs['Factor'])
    nt.links.new(cr.outputs['Color'], mx.inputs['A'])
    nt.links.new(mx.outputs['Result'], b.inputs['Base Color'])
    return m
