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


def tao_xuong(rig, ds, deform=False):
    """ds: [(tên, cha, đầu, đuôi, roll_z_vec)] — thêm xương vào rig (mặc định không biến dạng)."""
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode='EDIT')
    eb = rig.data.edit_bones
    for ten, cha, h, t, up in ds:
        e = eb.new(ten)
        e.head, e.tail = Vector(h), Vector(t)
        e.use_deform = deform
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
    G = np.array([-1.0, 1, 1])
    trai = _do_mat(body, px, 1)
    tam_trai = [np.array(body.data.polygons[i].center) for i in trai[0]]
    for k, sg in (('L', 1), ('R', -1)):
        if k == 'L':
            faces, tam_ve, r_mong, mat_ve = trai
        else:
            # mắt phải = ảnh gương mắt trái (dò riêng thì hốc phải hẹp và tròn hơn hẳn); lưới đầu gần đối xứng
            P = np.array([p.center[:] for p in body.data.polygons])
            faces = []
            for c in tam_trai:
                d = np.linalg.norm(P - c * G, axis=1)
                i = int(np.argmin(d))
                assert d[i] < 0.006, f'Không có mặt gương cho hốc mắt phải ({d[i]:.4f} m)'
                faces.append(i)
            faces = sorted(set(faces))
            tam_ve, r_mong, mat_ve = trai[1] * G, trai[2], trai[3] * G
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
        D_LT, D_LV = 0.94, 1.15  # ngang sát khóe (hở khóe khi nhắm), dọc nới cho mống mắt lớn
        qm_ = mat_ve - c
        am_, tp_, bt_ = np.abs(qm_ @ u).max(), (qm_ @ up).max(), abs((qm_ @ up).min())
        bo = [v for v in bm.verts if abs((np.array(v.co) - c) @ u) > ru0 * 1.2
              or abs((np.array(v.co) - c) @ up) > rz0 * 1.4 or (np.array(v.co) - C) @ n < -0.002]
        bmesh.ops.delete(bm, geom=bo, context='VERTS')
        for v in bm.verts:  # lòng trắng chỉ cần lộ qua khe mí: phần xa cung mắt hạnh nhân dồn về cung (không xoá: lưới thưa sẽ thành ô vuông)
            q_ = np.array(v.co) - c
            a_, b_ = q_ @ u, q_ @ up
            d_ = math.hypot(a_ / (am_ * D_LT), b_ / ((tp_ if b_ > 0 else bt_) * D_LV))
            if d_ > 1.0:
                s_ = 1.0 / d_
                v.co = Vector(c + u * (a_ * s_) + up * (b_ * s_) + n * (q_ @ n - 0.002))
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
        D_KEP = 1.03  # vòng ngoài cùng của mí, tính theo bán trục viền hốc
        T_BAM = 0.4  #hàng từ đây trở đi bám da gốc (cả khi mở lẫn khi nhắm): mí nối liền da
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

            qv_ = vien - c  # viền hốc thật (đa giác, góc hốc vượt elip bao): bán kính viền theo hướng, đơn vị bán trục
            ang_ = np.arctan2((qv_ @ up) / rz0, (qv_ @ u) / ru0)
            od_ = np.argsort(ang_)
            th_v, r_v = ang_[od_], np.hypot((qv_ @ u) / ru0, (qv_ @ up) / rz0)[od_]

            def kep(v):
                """Mí nằm gọn trong hốc (học theo bản Nam): phần vượt viền hốc bị kéo về vòng d = 1,03 và lùi sau mặt phẳng hốc,
                da thân che mép; không còn tấm mí phủ lên da (hết bậc, mảng lệch sáng quanh mắt)."""
                q = np.array(v[:]) - c
                a, b, dn = q @ u, q @ up, q @ n
                d = math.hypot(a / ru0, b / rz0) / np.interp(math.atan2(b / rz0, a / ru0), th_v, r_v, period=2 * math.pi)
                if d > 1.0:
                    s = min(1.0, D_KEP / d)
                    a, b, dn = a * s, b * s, min(dn, -0.0008)
                return Vector(c + u * a + up * b + n * dn)

            vi_tri = [[kep(diem(e_mep(p) + t * (e_xa - e_mep(p)), p)) for p in phm] for t in t_hang]
            vi_tri = [[bam(v) if t >= T_BAM else v for v in hang] for t, hang in zip(t_hang, vi_tri)]  # phần trong hốc bám da gốc chưa khoét
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
                    sk.data[i * len(phm) + j].co = vi_tri[i][j] if t >= T_BAM else bam(kep(diem(e_gap + t / T_BAM * (e_mep(p) + T_BAM * (e_xa - e_mep(p)) - e_gap), p)))
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


# ---------- lông mày ----------

def dung_may(body, rig, coll):
    """Tách dải mày nổi thành Nu_May.L/R (3 xương mỗi bên), dồn phẳng chỗ cũ về mặt trán, tô da."""
    px = anh_diffuse(body)
    me = body.data
    xuong, cho = [], []
    for k, sg in (('L', 1), ('R', -1)):
        F = []
        for p in me.polygons:
            c = p.center
            if 1.47 < c.z < 1.58 and 0.01 < sg * c.x < 0.2 and c.y < -0.08:
                _, col = mau_mat_luoi(body, px, p)
                l, s_ = lum_sat(col)
                if ((l < 0.35) & (s_ > 0.3)).mean() > 0.5:
                    F.append(p.index)
        assert len(F) >= 4, f'Không thấy mày {k}: {len(F)} mặt'
        Fs = set(F)
        bm = bmesh.new()  # thêm 2 vòng mặt sát dải mày còn tối (thành bên của dải mày)
        bm.from_mesh(me)
        bm.faces.ensure_lookup_table()
        for _ in range(2):
            vong = {g.index for i in Fs for e in bm.faces[i].edges for g in e.link_faces} - Fs
            for i in vong:
                _, col = mau_mat_luoi(body, px, me.polygons[i])
                l, s_ = lum_sat(col)
                if ((l < 0.35) & (s_ > 0.3)).mean() > 0.4:  # 0.25 gom cả mặt da lớn
                    Fs.add(i)
        bm.free()
        # object mày riêng: bản sao các mặt mày (giữ UV, vật liệu)
        bm = bmesh.new()
        bm.from_mesh(me)
        bm.faces.ensure_lookup_table()
        bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.index not in Fs], context='FACES')
        me_may = bpy.data.meshes.new(f'Nu_May.{k}')
        goc = np.array([v.co[:] for v in bm.verts])
        bm.free()
        _may_tron(me_may, goc, sg)
        may = bpy.data.objects.new(f'Nu_May.{k}', me_may)
        may.visible_shadow = False  # bóng mày lên trán thành răng cưa (EEVEE) và vệt tối dưới mày
        coll.objects.link(may)
        # thân: dồn đỉnh mày (trừ đỉnh chung với da) về mặt cầu khớp vòng da quanh mày; tô UV da trán
        bm = bmesh.new()
        bm.from_mesh(me)
        bm.faces.ensure_lookup_table()
        bm.verts.ensure_lookup_table()
        vm = {v for i in Fs for v in bm.faces[i].verts}
        bien = {v for v in vm if any(f.index not in Fs for f in v.link_faces)}
        vong = {w for v in bien for e in v.link_edges for w in (e.other_vert(v),) if w not in vm} | bien
        P = np.array([v.co[:] for v in vong])
        A = np.c_[2 * P, np.ones(len(P))]
        sol = np.linalg.lstsq(A, (P ** 2).sum(1), rcond=None)[0]
        tam, R = sol[:3], math.sqrt(sol[3] + sol[:3] @ sol[:3])
        for v in vm:  # cả đỉnh viền: thành dưới mày cũ còn thành bậc răng cưa
            d = np.array(v.co) - tam
            v.co = Vector(tam + d / np.linalg.norm(d) * (R - 0.001))  # mày mới là dải nổi, chỉ lùi nhẹ
        uvb = bm.loops.layers.uv[0]
        cen = np.array([v.co[:] for v in vm]).mean(0)
        goc_uv, best = None, 9.0
        dich = Vector(cen) + Vector((0, 0, 0.035))
        for f in bm.faces:  # mặt da gần điểm ngay trên mày nhất
            c = f.calc_center_median()
            if f.index in Fs or c.y > 0 or not (0.01 < c.z - cen[2] < 0.09) or (c - dich).length >= best:
                continue
            _, col = mau_mat_luoi(body, px, me.polygons[f.index], 2)
            l, s_ = lum_sat(col)
            if l.mean() > 0.55 and s_.mean() > 0.25:
                goc_uv, best = f.loops[0][uvb].uv.copy(), (c - dich).length
        assert goc_uv is not None, f'Không tìm được da trên mày {k}'
        for i in Fs:
            for l in bm.faces[i].loops:
                l[uvb].uv = goc_uv
        bm.to_mesh(me)
        bm.free()
        _dan_may(me_may, me)
        # xương: đầu / giữa / đuôi mày theo trục X
        co = np.array([v.co[:] for v in me_may.vertices])
        x0, x1 = (co[:, 0].min(), co[:, 0].max()) if sg > 0 else (co[:, 0].max(), co[:, 0].min())
        ten3 = (f'brow_in.{k}', f'brow_mid.{k}', f'brow_out.{k}')
        xs = (x0, (x0 + x1) / 2, x1)
        for ten, x in zip(ten3, xs):
            m = np.abs(co[:, 0] - x) < 0.015
            p0 = Vector((x, co[m, 1].min(), co[m, 2].mean()))
            xuong.append((ten, 'head', tuple(p0), tuple(p0 + Vector((0, -0.02, 0))), (0, 0, 1)))
        cho.append((may, co, ten3, xs))
    tao_xuong(rig, xuong, deform=True)
    for may, co, ten3, xs in cho:
        t = (co[:, 0] - xs[0]) / (xs[2] - xs[0])  # 0 đầu mày → 1 đuôi mày
        w = (np.clip(1 - 2 * t, 0, 1), 1 - np.abs(2 * t - 1).clip(0, 1), np.clip(2 * t - 1, 0, 1))
        for ten, wi in zip(ten3, w):
            vg = may.vertex_groups.new(name=ten)
            for i in np.where(wi > 1e-3)[0]:
                vg.add([int(i)], float(wi[i]), 'REPLACE')
        may.parent = rig
        md = may.modifiers.new('Armature', 'ARMATURE')
        md.object = rig
    bo_suu_tap(rig, 'Mat', [n for _, _, t3, _ in cho for n in t3])
    _to_da_manh_vun(body, px)


def _may_tron(me_may, P, sg, n=28):
    """Dựng lại mày thành dải cong trơn, thuôn hai đầu (mày cũ là mặt cắt răng cưa) theo khối mày gốc P."""
    x0, x1 = (P[:, 0].min(), P[:, 0].max()) if sg > 0 else (P[:, 0].max(), P[:, 0].min())
    t = (P[:, 0] - x0) / (x1 - x0)
    tb = np.linspace(0, 1, 9)
    hi, lo, tr, tc = [], [], [], []
    for a, b in zip(tb[:-1], tb[1:]):
        m = (t >= a) & (t <= b)
        if m.sum():
            hi.append(P[m, 2].max()); lo.append(P[m, 2].min()); tr.append(P[m, 1].min()); tc.append((a + b) / 2)
    fz = np.polyfit(tc, (np.array(hi) + np.array(lo)) / 2, 2)
    fh = np.polyfit(tc, np.array(hi) - np.array(lo), 1)
    fy = np.polyfit(tc, tr, 2)
    vong = 8
    V, F = [], []
    for i in range(n + 1):
        u = i / n
        x = x0 + (x1 - x0) * u
        nho = math.sin(math.pi * min(1.0, 0.15 + 0.85 * u)) ** 0.35 if u > 0.5 else (0.55 + 0.45 * math.sin(math.pi * u / 1.0)) ** 0.5
        h = max(np.polyval(fh, u), 0.004) * 0.62 * nho  # phủ kín chỗ mày cũ (thành dưới còn lộ bậc tối)
        zc, yc = np.polyval(fz, u) - 0.0025, np.polyval(fy, u) + 0.001
        for j in range(vong):
            g = 2 * math.pi * j / vong
            V.append((x, yc - 0.0018 * (1 + math.sin(g)) * nho, zc + h * math.cos(g)))
    for i in range(n):
        for j in range(vong):
            a, b = i * vong + j, i * vong + (j + 1) % vong
            F.append((a, b, b + vong, a + vong))
    F.append(tuple(range(vong))[::-1]); F.append(tuple(n * vong + j for j in range(vong)))
    me_may.from_pydata(V, [], F)
    for p in me_may.polygons:
        p.use_smooth = True
    me_may.materials.append(bpy.data.materials.get('Nu_MauMay') or mat_phang('Nu_MauMay', (0.06, 0.035, 0.025, 1), 0.6))


def _dan_may(me_may, me, vong=8):
    """Dán mày lên da: mỗi lát mày dời theo Y để mép sau nằm sát 0,3 mm trước mặt da (không nổi khe đổ bóng)."""
    from mathutils.bvhtree import BVHTree
    bvh = BVHTree.FromPolygons([v.co[:] for v in me.vertices], [p.vertices[:] for p in me.polygons])
    co = np.array([v.co[:] for v in me_may.vertices])
    for i in range(0, len(co) - vong + 1, vong):
        lat = co[i:i + vong]
        lui = lat[:, 1].max()  # mép sau của lát
        sau = []
        for x, _, z in lat:
            hit = bvh.ray_cast(Vector((x, -1.0, z)), Vector((0, 1, 0)), 2.0)
            if hit[0] is not None:
                sau.append(hit[0].y)
        if sau:
            lat[:, 1] += min(sau) - 0.0003 - lui
    for v, c in zip(me_may.vertices, co):
        v.co = c


def la_phang_quanh_mat(body, lan=40):
    """Là phẳng da quanh mắt, mày (mảnh mi/mày cũ dựng đứng, nếp nhăn): Taubin trên vùng trán–mắt, ghim viền hốc mắt."""
    bm = bmesh.new()
    bm.from_mesh(body.data)
    vung = {v for v in bm.verts if 1.43 < v.co.z < 1.63 and abs(v.co.x) < 0.2 and v.co.y < -0.03}
    ghim = {v for v in vung if v.is_boundary or any(w not in vung for e in v.link_edges for w in (e.other_vert(v),))}
    chay = [v for v in vung if v not in ghim]
    ke = [[e.other_vert(v) for e in v.link_edges] for v in chay]
    for k in range(lan * 2):
        lam = 0.5 if k % 2 == 0 else -0.53
        moi = [v.co + lam * (sum((w.co for w in ws), Vector()) / len(ws) - v.co) for v, ws in zip(chay, ke)]
        for v, c in zip(chay, moi):
            v.co = c
    vong = {v for v in vung if v.is_boundary}  # viền hốc mắt (ghim)
    da_qua, gan = set(vong), []
    for _ in range(4):
        vong = {e.other_vert(v) for v in vong for e in v.link_edges} - da_qua
        da_qua |= vong
        gan += [v for v in vong if v in vung and not v.is_boundary]
    for _ in range(20):  # mảng gồ quanh hốc mắt: Laplace mạnh 4 vòng ngoài viền
        moi = [sum((e.other_vert(v).co for e in v.link_edges), Vector()) / len(v.link_edges) for v in gan]
        for v, c in zip(gan, moi):
            v.co = v.co.lerp(c, 0.5)
    for _ in range(10):  # gọt đỉnh còn nhô (cục cạnh sống mũi): kéo hẳn về trung bình láng giềng
        for v in vung:
            if not v.is_boundary:
                m = sum((e.other_vert(v).co for e in v.link_edges), Vector()) / len(v.link_edges)
                if (v.co - m).length > 0.002:
                    v.co = m
    bm.to_mesh(body.data)
    bm.free()
    print(f'là phẳng {len(chay)} đỉnh quanh mắt/mày')


def _to_da_manh_vun(body, px):
    """Mảnh mi/mày cũ (nâu đen) còn lại quanh mắt và mày trên thân: tô UV da trán cùng bên."""
    me = body.data
    uvl = me.uv_layers[0].data
    uv_tran = {}
    for sg in (1, -1):
        best = None
        for p in me.polygons:
            c = p.center
            if 0.04 < sg * c.x < 0.1 and 1.57 < c.z < 1.62 and c.y < 0:
                _, col = mau_mat_luoi(body, px, p, 2)
                l, s_ = lum_sat(col)
                if l.mean() > 0.55 and s_.mean() > 0.25:
                    best = uvl[p.loop_indices[0]].uv.copy()
                    break
        assert best is not None, 'Không tìm được da trán'
        uv_tran[sg] = best
    n = 0
    for p in me.polygons:
        c = p.center
        if 1.38 < c.z < 1.58 and abs(c.x) < 0.19 and c.y < -0.08:
            for li in p.loop_indices:  # cả dải mắt–mày một màu da trơn: texture gốc ở đây là các mảng lệch màu, vân mày cũ
                uvl[li].uv = uv_tran[1]
            n += 1
    for o in bpy.data.objects:  # mí dùng chung texture thân: vân mi cũ thành vết tối ở đuôi mắt, dưới mày
        if o.name.startswith(('Nu_MiTren', 'Nu_MiDuoi')) and o.data.uv_layers:
            for l in o.data.uv_layers[0].data:
                l.uv = uv_tran[1]
    print(f'tô da {n} mảnh mi/mày cũ')



def dan_mi_vao_da(body):
    """Mí trên/dưới là tấm rời: phần ngoài cách da tới 20 mm (nổi bậc) hoặc chìm sau da (mí dưới). Ép phần ngoài khe mắt
    về sát mặt da (0,3 mm), giữ nguyên phần sát lông mi."""
    from mathutils.bvhtree import BVHTree
    me = body.data
    bvh = BVHTree.FromPolygons([v.co[:] for v in me.vertices], [p.vertices[:] for p in me.polygons])
    for k in 'LR':
        lt = np.array([v.co[:] for v in bpy.data.objects[f'Nu_LongTrang.{k}'].data.vertices])
        c, r = (lt.max(0) + lt.min(0)) / 2, (lt.max(0) - lt.min(0)) / 2
        for ten in (f'Nu_MiTren.{k}', f'Nu_MiDuoi.{k}'):
            ob = bpy.data.objects[ten]
            md = ob.data
            n = 0
            vg = ob.vertex_groups.new(name='NgoaiMi')
            for v in md.vertices:
                hit = bvh.ray_cast(Vector((v.co.x, -1.0, v.co.z)), Vector((0, 1, 0)), 2.0)
                if hit[0] is None:
                    continue
                gap = hit[0].y - v.co.y  # >0: mí nổi trước da; <0: mí chìm sau da
                if not -0.015 < gap < 0.025:  # xa hơn là xuyên qua hốc mắt tới mặt trong đầu
                    continue
                d = math.hypot((v.co.x - c[0]) / r[0], (v.co.z - c[2]) / r[2])
                f = _ss(1.0, 1.4, d)
                v.co.y += f * (gap - 0.0003)
                n += f > 0.5
                if f > 1e-3:
                    vg.add([v.index], float(f), 'REPLACE')
            dt = ob.modifiers.new('NormalDa', 'DATA_TRANSFER')  # phần ngoài mí lấy normal da: hết bậc sáng–tối ở viền tấm mí
            dt.object, dt.use_loop_data, dt.data_types_loops = body, True, {'CUSTOM_NORMAL'}
            dt.loop_mapping = 'POLYINTERP_NEAREST'
            dt.vertex_group, dt.mix_mode, dt.mix_factor = 'NgoaiMi', 'REPLACE', 1.0
            print(f'dán mí {ten}: {n} đỉnh ép về da')


def da_mat_tron(body, z0=1.18, z1=1.26):
    """Da mặt một màu trơn kiểu hoạt hình: thuộc tính đỉnh `mat_tron` (1 trên cằm → 0 ở cổ) trộn màu da trơn
    với texture; `ma_hong` thêm má hồng. Mí dùng chung vật liệu nên gán mat_tron = 1."""
    me = body.data
    co = np.array([v.co[:] for v in me.vertices])
    w = np.clip((co[:, 2] - z0) / (z1 - z0), 0, 1)
    w = w * w * (3 - 2 * w)
    d = np.minimum(*(np.linalg.norm(co - np.array([sx * 0.075, -0.17, 1.40]), axis=1) for sx in (1, -1)))
    h = np.clip(1 - d / 0.035, 0, 1)
    h = h * h * (3 - 2 * h)
    for ten, val in (('mat_tron', w), ('ma_hong', h)):
        if ten in me.attributes:
            me.attributes.remove(me.attributes[ten])
        me.attributes.new(ten, 'FLOAT', 'POINT').data.foreach_set('value', val.astype(np.float32))
    for o in bpy.data.objects:
        if o.name.startswith(('Nu_MiTren', 'Nu_MiDuoi')):
            a = o.data.attributes.new('mat_tron', 'FLOAT', 'POINT')
            a.data.foreach_set('value', np.ones(len(o.data.vertices), np.float32))
    # màu trơn: trung vị texture trên da trán
    px = anh_diffuse(body)
    uvl = me.uv_layers[0].data
    uv = np.array([uvl[li].uv[:] for p in me.polygons if 1.60 < p.center.z < 1.68 and abs(p.center.x) < 0.08 and p.center.y < 0
                   for li in p.loop_indices])
    tron = np.median(mau_tai(px, uv), axis=0)
    tron = np.where(tron <= 0.04045, tron / 12.92, ((tron + 0.055) / 1.055) ** 2.4)  # điểm ảnh sRGB → màu tuyến tính của node
    hong = tron * np.array([1.12, 0.78, 0.78])
    nt = me.materials[0].node_tree
    b = nt.nodes['Principled BSDF']
    nguon = b.inputs['Base Color'].links[0].from_socket
    at, ah = nt.nodes.new('ShaderNodeAttribute'), nt.nodes.new('ShaderNodeAttribute')
    at.attribute_name, ah.attribute_name = 'mat_tron', 'ma_hong'
    m1, m2 = nt.nodes.new('ShaderNodeMix'), nt.nodes.new('ShaderNodeMix')
    for m in (m1, m2):
        m.data_type = 'RGBA'
    nt.links.new(at.outputs['Fac'], m1.inputs['Factor'])
    nt.links.new(nguon, m1.inputs['A'])
    m1.inputs['B'].default_value = (*tron, 1)
    mh = nt.nodes.new('ShaderNodeMath')
    mh.operation, mh.inputs[1].default_value = 'MULTIPLY', 0.35
    nt.links.new(ah.outputs['Fac'], mh.inputs[0])
    nt.links.new(mh.outputs[0], m2.inputs['Factor'])
    nt.links.new(m1.outputs['Result'], m2.inputs['A'])
    m2.inputs['B'].default_value = (*hong, 1)
    nt.links.new(m2.outputs['Result'], b.inputs['Base Color'])
    print('da trơn', np.round(tron, 3))


# ---------- miệng ----------

def _ss(a, b, x):
    t = np.clip((np.asarray(x) - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def _dai_cong(ten, C, ax, nua_rong, lui, cao, day, mat, n=24):
    """Dải cong chữ U (răng, lợi): đường giữa x ∈ [−nua_rong, nua_rong], lùi −w·lui·(x/nua_rong)², tiết diện cao × dày;
    Subdivision 2 cho bo tròn kiểu hoạt hình."""
    u, w, v = ax
    bm = bmesh.new()
    secs = []
    for x in np.linspace(-nua_rong, nua_rong, n):
        P = C + u * x - w * (lui * (x / nua_rong) ** 2)
        secs.append([bm.verts.new(P + w * (sw * day / 2) + v * (sv * cao / 2))
                     for sw, sv in ((1, 1), (1, -1), (-1, -1), (-1, 1))])
    for a_, b_ in zip(secs, secs[1:]):
        for i in range(4):
            bm.faces.new((a_[i], a_[(i + 1) % 4], b_[(i + 1) % 4], b_[i]))
    bm.faces.new(secs[0][::-1])
    bm.faces.new(secs[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(ten)
    bm.to_mesh(me)
    bm.free()
    me.materials.append(mat)
    for f in me.polygons:
        f.use_smooth = True
    ob = bpy.data.objects.new(ten, me)
    sd = ob.modifiers.new('Subdivision', 'SUBSURF')
    sd.levels = sd.render_levels = 2
    return ob


def _luoi(ten, C, ax, R, mat):
    """Lưỡi: elip dẹt, nửa trước thuôn thành đầu lưỡi."""
    ob = _hop(ten, C, ax, R, mat)
    u, w, v = ax
    for p in ob.data.vertices:
        d = p.co - C
        t = max(0.0, d.dot(w) / R[1])  # 0 ở giữa → 1 ở đầu lưỡi
        p.co = C + u * (d.dot(u) * (1 - 0.45 * t)) + w * d.dot(w) + v * (d.dot(v) * (1 - 0.3 * t))
    return ob


def _hop(ten, C, ax, R, mat, n=(24, 12)):
    """Elip đặc tâm C, trục ax=(u, w, v), bán kính R=(ru, rw, rv)."""
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=n[0], v_segments=n[1], radius=1.0)
    u, w, v = ax
    for p in bm.verts:
        x, y, z = p.co
        p.co = C + u * (x * R[0]) + w * (y * R[1]) + v * (z * R[2])
    me = bpy.data.meshes.new(ten)
    bm.to_mesh(me)
    bm.free()
    me.materials.append(mat)
    for f in me.polygons:
        f.use_smooth = True
    return bpy.data.objects.new(ten, me)


def dung_mieng(body, rig, coll):
    """Lưới miệng dày quanh khe môi, xương jaw, khoang miệng, răng, lưỡi. Trả {'tam_mieng', 'vung_dinh'}."""
    from mathutils.bvhtree import BVHTree
    from mathutils.geometry import barycentric_transform
    sc = bpy.context.scene
    me = body.data
    px = anh_diffuse(body)
    # nét miệng vẽ: tâm và bề ngang
    P, Cc = [], []
    for p in me.polygons:
        c = p.center
        if 1.27 < c.z < 1.35 and abs(c.x) < 0.09 and c.y < -0.12:
            pos, col = mau_mat_luoi(body, px, p, 10)
            P.append(pos)
            Cc.append(col)
    P, Cc = np.concatenate(P), np.concatenate(Cc)
    l, _ = lum_sat(Cc)
    m = (l < 0.5) & (Cc[:, 0] > Cc[:, 2] + 0.05) & (P[:, 2] > 1.285) & (P[:, 2] < 1.335)
    assert m.sum() > 20, 'Không thấy nét miệng vẽ'
    a = (P[m][:, 0].max() - P[m][:, 0].min()) / 2 + 0.003
    m0 = np.array([0.0, P[m][:, 1].mean(), P[m][:, 2].mean()])
    u, v, w = np.array([1.0, 0, 0]), np.array([0, 0, 1.0]), np.array([0, -1.0, 0])  # w: ra trước
    A, B_up, B_dn = a + 0.03, 0.028, 0.034
    # lưới gốc (UV, mặt da) trước khi sửa
    bm0 = bmesh.new()
    bm0.from_mesh(me)
    bmesh.ops.triangulate(bm0, faces=bm0.faces[:])
    bm0.faces.ensure_lookup_table()
    uv0 = bm0.loops.layers.uv[0]
    bvh0 = BVHTree.FromBMesh(bm0)

    def len_mat(p):  # chiếu lên da gốc theo hướng −w
        hit = bvh0.ray_cast(Vector(p + w * 0.05), Vector(-w), 0.2)
        return hit[0].copy() if hit[0] is not None else Vector(p)

    def uv_goc(p):
        _, _, fi, _ = bvh0.find_nearest(Vector(p))
        f = bm0.faces[fi]
        A_, B_, C_ = (q.vert.co for q in f.loops)
        ua, ub, uc = (q[uv0].uv.to_3d() for q in f.loops)
        return barycentric_transform(Vector(p), A_, B_, C_, ua, ub, uc).to_2d()

    def trong_elip(c, k=1.0):
        bb = B_up if c.z > m0[2] else B_dn
        return ((c.x - m0[0]) / (A * k)) ** 2 + ((c.z - m0[2]) / (bb * k)) ** 2

    sc['so_dinh_mieng_goc'] = int(sum(1 for q in me.vertices if q.co.y < -0.1 and trong_elip(q.co) < 1))
    N = 40
    t0 = np.linspace(0, 2 * np.pi, N, endpoint=False)
    tt = t0 + 0.25 * np.sin(2 * t0)  # dồn đoạn về hai khóe
    # tiết diện: (dời ra từ khe m, nhô ra trước m) — 0 khe, 1–2 mặt môi, 3 mép môi; 4–8 da (chiếu lên mặt)
    MOI = [(0.0, 0.0), (0.001, 0.0), (0.003, 0.0), (0.005, 0.0)]  # chủ repo bỏ phần môi: vòng môi nằm sát da
    f_da = [0.25, 0.42, 0.6, 0.8, 1.0]
    bm = bmesh.new()
    bm.from_mesh(me)
    deform = bm.verts.layers.deform.verify()
    # khoét rộng hơn vòng ngoài cùng (1.0): viền lỗ luôn nằm ngoài, khoảng lấp không bị lật
    xoa = [f for f in bm.faces if f.calc_center_median().y < -0.1
           and min(trong_elip(q.co) for q in f.verts) < 1.08]
    bmesh.ops.delete(bm, geom=xoa, context='FACES')
    bmesh.ops.delete(bm, geom=[q for q in bm.verts if not q.link_faces], context='VERTS')
    # viền lỗ: đi dọc các cạnh hở liền nhau, bắt đầu từ cạnh hở gần tâm miệng nhất (đủ vòng kín)
    hob = [e for e in bm.edges if e.is_boundary]
    e0 = min(hob, key=lambda e: (((e.verts[0].co + e.verts[1].co) / 2) - Vector(m0)).length)
    vien, st = {e0}, [e0]
    while st:
        e = st.pop()
        for q in e.verts:
            for e2 in q.link_edges:
                if e2.is_boundary and e2 not in vien:
                    vien.add(e2)
                    st.append(e2)
    vien = list(vien)
    assert len(vien) < 200, f'Viền lỗ miệng nối vào lỗ khác ({len(vien)} cạnh)'
    rings = []
    for k in range(len(MOI) + len(f_da)):
        ring = []
        for t in tt:
            tren = math.sin(t) > 0
            if k < len(MOI):
                d, nho = MOI[k]
                ak, bk = a + d, d
            else:
                f = f_da[k - len(MOI)]
                ak, bk, nho = a + (A - a) * f, (B_up if tren else B_dn) * f, 0.0
            p = m0 + u * (ak * math.cos(t)) + v * (bk * math.sin(t))
            if k < len(MOI):  # các vòng sát khe theo nét cười
                p = p + v * (0.004 * math.cos(t) ** 2)
            ring.append(bm.verts.new(len_mat(p) + Vector(w) * nho))
        rings.append(ring)
    # mặt gốc lệch hai bên tới ~8 mm theo chiều sâu: lấy trung bình độ sâu với đỉnh đối xứng ở các vòng trong,
    # hòa dần về độ sâu thật ở vòng ngoài để vẫn bám da (miệng đối xứng, khẩu hình không gấp riêng một bên)
    hoa_vong = [1, 1, 1, 1, 1, 1, 0.66, 0.33, 0.0]
    for k, ring in enumerate(rings):
        ys = [q.co.y for q in ring]
        for j, q in enumerate(ring):
            j_g = (N // 2 - j) % N
            q.co.y = ys[j] + hoa_vong[k] * ((ys[j] + ys[j_g]) / 2 - ys[j])
    trong = [bm.verts.new(q.co - Vector(w) * 0.004) for q in rings[0]]
    mat_trong = bpy.data.materials.get('Nu_TrongMieng') or mat_phang('Nu_TrongMieng', (0.35, 0.06, 0.07, 1), 0.5)
    if 'Nu_TrongMieng' not in [x.name for x in me.materials]:
        me.materials.append(mat_trong)
    mi_trong = [x.name for x in me.materials].index('Nu_TrongMieng')
    moi = []
    for k in range(len(rings) - 1):
        for j in range(N):
            j2 = (j + 1) % N
            f = bm.faces.new((rings[k][j], rings[k][j2], rings[k + 1][j2], rings[k + 1][j]))
            moi.append(f)
    for j in range(N):  # thành trong môi; bỏ mặt ở khóe (khe khép)
        j2 = (j + 1) % N
        if j in (0, N // 2 - 1, N // 2, N - 1):
            continue
        f = bm.faces.new((rings[0][j2], rings[0][j], trong[j], trong[j2]))
        f.material_index = mi_trong
    ngoai = [bm.edges.get((rings[-1][j], rings[-1][(j + 1) % N])) for j in range(N)]
    lap = bmesh.ops.triangle_fill(bm, edges=vien + ngoai, use_beauty=True, normal=Vector(w))
    lap_f = [g for g in lap['geom'] if isinstance(g, bmesh.types.BMFace)]
    bo = [f for f in lap_f if trong_elip(f.calc_center_median(), 1.9) >= 1 or trong_elip(f.calc_center_median()) < 0.97]
    for f in bo:
        bm.faces.remove(f)
    lap_f = [f for f in lap_f if f not in bo]
    for f in moi + lap_f:
        f.smooth = True
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])  # pháp tuyến nhất quán toàn lưới (lật từng mặt gây khía khi chia mịn)
    # crease khe môi + thành trong: Subdivision không bo tròn mép môi (môi khép khít khi ngậm)
    cr = bm.edges.layers.float.get('crease_edge') or bm.edges.layers.float.new('crease_edge')
    for vong in (rings[0], trong):
        for j in range(N):
            e = bm.edges.get((vong[j], vong[(j + 1) % N]))
            if e:
                e[cr] = 0.7  # 0.7: môi vẫn khép, khóe được bo tròn khi mở
    for j in range(N):
        e = bm.edges.get((rings[0][j], trong[j]))
        if e:
            e[cr] = 0.7
    uvl = bm.loops.layers.uv[0]
    moi_vien = set(rings[0]) | set(rings[1])

    def uv_da_quanh(p):
        """Da quanh môi: lấy màu ở vành elip 1.35 cùng hướng (đường nối UV gốc chạy qua vùng miệng gây vệt gợn)."""
        e = math.sqrt(trong_elip(p))
        if e >= 1.35:
            return uv_goc(p)
        d = Vector((p.x - m0[0], 0, p.z - m0[2]))
        k = 1.35 / max(e, 1e-3)
        return uv_goc(len_mat(np.array((m0[0] + d.x * k, m0[1], m0[2] + d.z * k))))

    for f in moi + lap_f:
        for q in f.loops:
            q[uvl].uv = uv_goc(q.vert.co) if q.vert in moi_vien else uv_da_quanh(q.vert.co)
    for f in moi + lap_f:  # mặt có UV trải qua nhiều đảo → kéo texture thành vệt: cả mặt lấy UV tại tâm
        u_ = np.array([q[uvl].uv[:] for q in f.loops])
        if np.ptp(u_, axis=0).max() > 0.03:
            uc = uv_da_quanh(f.calc_center_median())
            for q in f.loops:
                q[uvl].uv = uc
    for f in bm.faces:
        if f.material_index == mi_trong:
            for q in f.loops:
                q[uvl].uv = uv_goc(rings[0][0].co)
    gi = {g.name: g.index for g in body.vertex_groups}
    for ten in ('MIENG_VUNG', 'MIENG_LO', 'MIENG_MOI_TREN', 'MIENG_MOI_DUOI', 'MIENG_TREN', 'MIENG_DUOI',
                'MIENG_MOI_BE', 'MIENG_DA_TRONG', 'MIENG_MUOT', 'jaw'):
        if ten not in gi:
            gi[ten] = body.vertex_groups.new(name=ten).index
    nhan = tuple(gi[t] for t in ('MIENG_VUNG', 'MIENG_LO', 'MIENG_MOI_TREN', 'MIENG_MOI_DUOI', 'MIENG_TREN',
                                  'MIENG_DUOI', 'MIENG_MOI_BE', 'MIENG_DA_TRONG', 'MIENG_MUOT'))
    for q in rings[2]:
        q[deform][gi['MIENG_MOI_BE']] = 1.0
    for q in rings[4]:
        q[deform][gi['MIENG_DA_TRONG']] = 1.0
    muot = set(q for r in rings for q in r) | set(trong) | {q for f in lap_f for q in f.verts}
    for _ in range(2):  # thêm 2 vòng mặt lưới quanh vùng lấp
        muot |= {w_ for q in list(muot) for e in q.link_edges for w_ in (e.other_vert(q),)}
    for q in muot:
        q[deform][gi['MIENG_MUOT']] = 1.0
    for vong in rings + [trong]:  # nửa trên / dưới của mọi vòng (khe: hai đỉnh trùng vị trí)
        for j, q in enumerate(vong):
            if 0 < j < N // 2:
                q[deform][gi['MIENG_TREN']] = 1.0
            elif j > N // 2:
                q[deform][gi['MIENG_DUOI']] = 1.0
    for ring in rings:
        for q in ring:
            q[deform][gi['MIENG_VUNG']] = 1.0
    for q in trong:
        q[deform][gi['MIENG_LO']] = 1.0
    for j, q in enumerate(rings[0]):
        if 0 < j < N // 2:
            q[deform][gi['MIENG_MOI_TREN']] = 1.0
        elif j > N // 2:
            q[deform][gi['MIENG_MOI_DUOI']] = 1.0
    duoi = {q for ring in rings for j, q in enumerate(ring) if j > N // 2}
    duoi |= {trong[j] for j in range(N // 2 + 1, N)}
    khe = set(rings[0]) | set(trong)
    hd = gi['head']
    for q in bm.verts:
        p = np.array(q.co)
        if p[2] < 1.215 or p[1] > 0.05:
            continue
        du, dv = abs(p[0] - m0[0]), p[2] - m0[2]
        if q in duoi:
            wj = 1.0 - 0.5 * float(_ss(a * 0.7, a, du))
        elif q in khe:
            wj = 0.5 if (q is rings[0][0] or q is rings[0][N // 2]) else 0.0
        else:
            wj = float(_ss(-0.002, -0.012, dv)) * (1 - float(_ss(A * 0.9, A * 1.5, du)))
        wj *= float(_ss(1.215, 1.235, p[2]))
        for g in list(q[deform].keys()):
            if g not in nhan:
                del q[deform][g]
        if wj > 1e-3:
            q[deform][gi['jaw']] = wj
        if wj < 1 - 1e-3:
            q[deform][hd] = 1 - wj
    # làm trơn trọng số hàm trong vùng MIENG_MUOT (giữ cố định khe môi và viền vùng): hết nếp gấp khi há
    jg = gi['jaw']
    W_ = {q: q[deform].get(jg, 0.0) for q in muot}
    co_dinh = {q for q in muot if q in khe or any(e.other_vert(q) not in muot for e in q.link_edges)}
    co_dinh |= {q for r in rings[:4] for q in r}  # 4 vòng môi giữ trọng số (môi trên 0); chỉ làm trơn da
    for _ in range(15):
        W_ = {q: (W_[q] if q in co_dinh else
                  sum(W_[e.other_vert(q)] for e in q.link_edges) / len(q.link_edges)) for q in muot}
    for q, wj in W_.items():
        if q.co.z < 1.215:
            continue
        for g in (jg, hd):
            if g in q[deform]:
                del q[deform][g]
        if wj > 1e-3:
            q[deform][jg] = wj
        if wj < 1 - 1e-3:
            q[deform][hd] = 1 - wj
    lech = []
    for f in moi:
        for q in f.loops:
            c1 = mau_tai(px, np.array([q[uvl].uv]))[0]
            c0 = mau_tai(px, np.array([uv_goc(q.vert.co)]))[0]
            lech.append(np.abs(c1 - c0).mean())
    sc['lech_mau_mieng'] = float(np.mean(lech))
    bm.to_mesh(me)
    bm.free()
    bm0.free()
    sc['tam_mieng'] = tuple(float(x) for x in m0)
    goc_ham = Vector((0, m0[1] + 0.075, m0[2] + 0.02))
    cam = Vector((0, m0[1] + 0.005, 1.245))
    tao_xuong(rig, [('jaw', 'head', tuple(goc_ham), tuple(cam), (0, -1, 0))], deform=True)
    pj = rig.pose.bones['jaw']
    pj.rotation_mode = 'XYZ'
    pj.rotation_euler.x = 0.3
    bpy.context.view_layer.update()
    xuong_cam = (rig.matrix_world @ pj.tail).z < cam.z
    pj.rotation_euler.x = 0
    if not xuong_cam:  # X+ phải mở hàm
        bpy.context.view_layer.objects.active = rig
        bpy.ops.object.mode_set(mode='EDIT')
        rig.data.edit_bones['jaw'].roll += math.pi
        bpy.ops.object.mode_set(mode='OBJECT')
    C = Vector(m0)
    ax = (Vector(u), Vector(w), Vector(v))
    mr = mat_phang('Nu_Rang', (0.93, 0.92, 0.88, 1), 0.3)
    ml = mat_phang('Nu_LuoiMat', (0.75, 0.3, 0.32, 1), 0.45)
    mg = mat_phang('Nu_Loi', (0.85, 0.45, 0.47, 1), 0.4)
    obs = {
        'Nu_KhoangMieng': (_hop('Nu_KhoangMieng', C - Vector(w) * 0.016 - Vector(v) * 0.004, ax, (a * 0.82, 0.009, 0.017), mat_trong), 'head'),
        'Nu_RangTren': (_dai_cong('Nu_RangTren', C - Vector(w) * 0.0045 - Vector(v) * 0.0005, ax, a * 0.8, 0.008, 0.0035, 0.0025, mr), 'head'),
        'Nu_LoiTren': (_dai_cong('Nu_LoiTren', C - Vector(w) * 0.0053 + Vector(v) * 0.0027, ax, a * 0.84, 0.008, 0.003, 0.003, mg), 'head'),
        'Nu_RangDuoi': (_dai_cong('Nu_RangDuoi', C - Vector(w) * 0.0055 - Vector(v) * 0.0035, ax, a * 0.75, 0.008, 0.003, 0.0025, mr), 'jaw'),
        'Nu_LoiDuoi': (_dai_cong('Nu_LoiDuoi', C - Vector(w) * 0.0063 - Vector(v) * 0.0065, ax, a * 0.79, 0.008, 0.003, 0.003, mg), 'jaw'),
        'Nu_Luoi': (_luoi('Nu_Luoi', C - Vector(w) * 0.013 - Vector(v) * 0.011, ax, (a * 0.62, 0.012, 0.004), ml), 'jaw'),
    }
    for ten, (ob, xg) in obs.items():
        coll.objects.link(ob)
        gan_vao_xuong(ob, rig, xg)
    bo_suu_tap(rig, 'Mat', ['jaw'])
    vung = [q.index for q in me.vertices if any(x.group == gi['MIENG_VUNG'] for x in q.groups)]
    return {'tam_mieng': C, 'vung_dinh': vung}


# ---------- shape key miệng ----------

# (nhóm âm, shape key, độ mở hàm gợi ý — độ)
KHAU_HINH = {
    'A': (['a', 'ă', 'â'], 'vs_A', 18), 'E': (['e', 'ê'], 'vs_E', 8), 'I': (['i', 'y'], 'vs_I', 5),
    'O': (['o', 'ô', 'ơ'], 'vs_O', 14), 'U': (['u', 'ư'], 'vs_U', 6), 'MBP': (['m', 'b', 'p'], 'vs_MBP', 0),
    'PHV': (['ph', 'v'], 'vs_PHV', 3), 'NT': (['n', 't', 'đ', 'd', 'l'], 'vs_NT', 6),
    'CH': (['ch', 'tr', 's', 'x', 'gi'], 'vs_CH', 6), 'KG': (['c', 'k', 'g', 'ng', 'nh', 'kh'], 'vs_KG', 12),
    'nghi': ([], 'vs_nghi', 0),
}


def dung_shape_key_mieng(body, vung, tam, out_json=None):
    """10 shape key nền + 11 khẩu hình; chỉ dời đỉnh vùng miệng (MIENG_VUNG ∪ MIENG_LO), vòng ngoài cùng đứng yên."""
    import json
    me = body.data
    gi = {g.name: g.index for g in body.vertex_groups}

    def trong_nhom(ten):
        g = gi[ten]
        return np.array([any(x.group == g and x.weight > 0.5 for x in v.groups) for v in me.vertices])

    dong = trong_nhom('MIENG_VUNG') | trong_nhom('MIENG_LO')
    tren, duoi = trong_nhom('MIENG_TREN'), trong_nhom('MIENG_DUOI')
    co = np.array([v.co[:] for v in me.vertices])
    m = np.array(tam)
    du, dv = co[:, 0] - m[0], co[:, 2] - m[2]
    q = co[dong]
    a = np.abs(q[:, 0] - m[0]).max()                       # nửa bề ngang vòng ngoài
    B = np.where(dv > 0, dv[dong].max(), -dv[dong].min())
    rho = np.sqrt((du / a) ** 2 + (dv / np.maximum(B, 1e-6)) ** 2)
    g = (1 - _ss(0.35, 0.97, rho)) * dong                   # vòng ngoài (ρ≈1) đứng yên
    moi = (1 - _ss(0.05, 0.8, rho)) * dong                  # sát khe môi, tắt dần mềm ra má
    khe = trong_nhom('MIENG_MOI_TREN') | trong_nhom('MIENG_MOI_DUOI')
    ak = np.abs(du[khe]).max() + 0.002                      # nửa bề ngang khe môi
    c = np.clip(np.abs(du) / ak, 0, 1) ** 2 * g             # trọng số khóe
    s = np.sign(du)
    hoa = _ss(0.8, 1.05, np.abs(du) / ak)                   # gần khóe: trên/dưới hòa về 0.5 → khe khép mềm ở khóe
    bu = 0.0004 * (trong_nhom('MIENG_MOI_TREN').astype(float) - trong_nhom('MIENG_MOI_DUOI'))  # bù Corrective Smooth khi mím
    o_ = np.argsort(co[khe, 0])
    dvk = co[:, 2] - np.interp(co[:, 0], co[khe, 0][o_], co[khe, 2][o_])  # khoảng cách tới đường khe (cong theo nét cười)
    T = (tren * (1 - hoa) + 0.5 * hoa * (tren | duoi | (np.abs(dv) < 0.004))) * moi
    D = (duoi * (1 - hoa) + 0.5 * hoa * (tren | duoi | (np.abs(dv) < 0.004))) * moi
    X, Y, Z = (np.eye(3)[i] for i in range(3))

    def vec(dx=0, dy=0, dz=0):
        return dx[:, None] * X + (dy if np.ndim(dy) else np.full(len(co), dy))[:, None] * Y + (dz if np.ndim(dz) else np.full(len(co), dz))[:, None] * Z

    z0 = np.zeros(len(co))
    L, R = (du > 0).astype(float), (du < 0).astype(float)
    dk = {
        'cuoi': vec(0.005 * s * c, 0.003 * c, 0.012 * c),
        'meu': vec(0.001 * s * c, -0.002 * D, -0.010 * c),
        'chu_moi': vec(-0.5 * du * g, -0.009 * g, 0.0015 * T - 0.0015 * D),  # chu: thu hẹp, đẩy ra trước, hé tròn
        'mim_moi': vec(z0, 0.002 * moi, -0.3 * dvk * (T + D) + 1.5 * bu),
        'keo_khoe.L': vec(0.006 * c * L, z0, 0.001 * c * L), 'keo_khoe.R': vec(-0.006 * c * R, z0, 0.001 * c * R),
        'ha_khoe.L': vec(z0, z0, -0.006 * c * L), 'ha_khoe.R': vec(z0, z0, -0.006 * c * R),
        'nhech.L': vec(0.002 * c * L, z0, 0.007 * c * L), 'nhech.R': vec(-0.002 * c * R, z0, 0.007 * c * R),
        'vs_A': vec(-0.05 * du * g, z0, 0.003 * T - 0.006 * D),        # mở to (hàm 18° làm phần chính)
        'vs_E': vec(0.25 * du * g, z0, 0.002 * T - 0.004 * D),
        'vs_I': vec(0.3 * du * g, z0, 0.001 * T - 0.002 * D + 0.002 * c),
        'vs_O': vec(-0.4 * du * g, -0.005 * g, (0.006 * T - 0.009 * D) * (1 - 0.7 * np.clip(du / ak, -1, 1) ** 2)),
        'vs_U': vec(-0.4 * du * g, -0.007 * g, 0.0015 * T - 0.002 * D),
        'vs_MBP': vec(z0, 0.003 * moi, -0.4 * dvk * (T + D) + 2 * bu),          # mím: nén về khe, đẩy lùi; mép khe không vượt nhau
        'vs_PHV': vec(z0, 0.004 * D, 0.001 * T + 0.002 * D),
        'vs_NT': vec(0.18 * du * g, z0, 0.0005 * T - 0.0015 * D),      # răng gần khép, môi hé, bè
        'vs_CH': vec(0.1 * du * g, -0.002 * g, 0.003 * T - 0.004 * D),
        'vs_KG': vec(0.12 * du * g, z0, 0.002 * T - 0.003 * D),        # hé, bè ngang (âm cuối lưỡi)
        'vs_nghi': vec(z0, 0.0008 * moi, -0.05 * dvk * (T + D) + 0.5 * bu),
        # sửa dáng khi mở hàm (driver theo jaw): khóe trễ xuống, kéo vào; môi trên cong nhẹ → miệng mở tròn
        'mo_ham_khoe': vec(-0.004 * s * c, z0, -0.006 * c - 0.002 * c * D + 0.0025 * T * (1 - c)),
    }
    if not me.shape_keys:
        body.shape_key_add(name='Basis', from_mix=False)
    # làm trơn độ dời 3 lượt theo cạnh lưới (trong vùng miệng) → không chỗ chuyển gắt
    E_ = np.array([e.vertices[:] for e in me.edges])
    E_ = E_[dong[E_[:, 0]] & dong[E_[:, 1]]]
    deg = np.bincount(E_.ravel(), minlength=len(co)).astype(float)
    for ten, d in dk.items():
        d = d * dong[:, None]
        d0 = d.copy()
        for _ in range(3):
            tong = np.zeros_like(d)
            np.add.at(tong, E_[:, 0], d[E_[:, 1]])
            np.add.at(tong, E_[:, 1], d[E_[:, 0]])
            tb = np.where(deg[:, None] > 0, tong / np.maximum(deg, 1)[:, None], d)
            d = np.where(dong[:, None], 0.5 * d + 0.5 * tb, 0)
        d[khe] = d0[khe]  # mép khe giữ độ dời riêng (làm trơn kéo mép trên/dưới vượt nhau khi mím)
        kb = body.shape_key_add(name=ten, from_mix=False)
        kb.data.foreach_set('co', (co + d).astype(np.float32).ravel())
        kb.slider_min, kb.slider_max = 0.0, 1.0
        kb.value = 0.0  # shape key mới mặc định 1.0: phải tắt để file ở dáng nghỉ
    rig = body.find_armature()
    if rig:
        fc = me.shape_keys.key_blocks['mo_ham_khoe'].driver_add('value')
        v = fc.driver.variables.new()
        v.name, v.type = 'r', 'TRANSFORMS'
        t = v.targets[0]
        t.id, t.bone_target, t.transform_type, t.transform_space = rig, 'jaw', 'ROT_X', 'LOCAL_SPACE'
        fc.driver.expression = 'max(0.0, min(1.5, r / 0.314))'  # 18° = bật hết
    if out_json:
        Path_ = __import__('pathlib').Path
        Path_(out_json).write_text(json.dumps({k: {'am': v[0], 'shape_key': v[1], 'jaw_do': v[2]}
                                               for k, v in KHAU_HINH.items()}, ensure_ascii=False, indent=1), encoding='utf-8')
