"""ĐẦU TRỌC cho NHAN-VAT-GOC-001: bỏ tóc liền lưới, dựng hộp sọ theo khuôn FBX trọc (Blender 5.2.x).

Chạy (trong thư mục này):
  blender -b --factory-startup --python dau_troc.py -- --out nhan-vat-goc-troc.blend [--anh xem-dau]
Đọc ../nhan-vat-goc.blend và ../nguon/dau-troc-tham-chieu.fbx; KHÔNG sửa hai file đó.
Các bước: (1) tóc = vùng tối trên texture diffuse, loang từ đỉnh đầu (lông mày/mắt/nốt ruồi là đảo riêng nên giữ);
 (2) cắt phẳng mép tóc lởm chởm trên trán; (3) căn khuôn trọc vào mặt–tai–cổ còn lại bằng ICP (dời, xoay, co giãn đều);
 (4) lấy phần sọ của khuôn (đã chia mịn) nằm ngoài vùng da còn lại, nối với mép lỗ bằng bridge;
 (5) làm mượt dải nối; (6) da đầu mới dùng chung vật liệu, UV trỏ vào một điểm da trơn trên trán ⇒ cùng màu/độ nhám.
Chỉ giữ LOD0. Kết quả là lưới nền tĩnh, chưa rig.
"""
import sys, os, math, argparse
import bpy, bmesh
import numpy as np
from mathutils import Vector, Matrix
from mathutils.kdtree import KDTree
from mathutils.bvhtree import BVHTree

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'nhan-vat-goc.blend')
KHUON = os.path.join(HERE, '..', 'nguon', 'dau-troc-tham-chieu.fbx')
HAIR_LUM = 0.30          # độ sáng trung bình RGB của texel; tóc ≈ 0,1–0,2, da ≈ 0,6
EDGE_LUM = 0.45         # loang thêm qua texel tối vừa nối liền với tóc
GROW = 2                # nới vùng cắt thêm số vòng đỉnh
FRONT_CUT_Z = 1.415      # mép tóc trên trán: bỏ da thừa cao hơn mức này ở nửa trước (y < 0)
BLEND_RINGS = 10        # dải pha màu da quanh đường nối (số vòng đỉnh về phía da cũ)
SEAM_RINGS = 8           # số vòng đỉnh quanh đường nối được làm mượt


def vert_colors(ob):
    me = ob.data; mat = me.materials[0]
    im = next(n.image for n in mat.node_tree.nodes if n.type == 'TEX_IMAGE' and 'diffuse' in n.image.name.lower())
    w, h = im.size; px = np.array(im.pixels[:], np.float32).reshape(h, w, 4)
    uv = np.zeros(len(me.loops) * 2); me.uv_layers.active.data.foreach_get('uv', uv); uv = uv.reshape(-1, 2)
    lv = np.zeros(len(me.loops), np.int64); me.loops.foreach_get('vertex_index', lv)
    c = px[np.clip((uv[:, 1] * h).astype(int), 0, h - 1), np.clip((uv[:, 0] * w).astype(int), 0, w - 1), :3]
    n = len(me.vertices); cnt = np.maximum(np.bincount(lv, minlength=n), 1)
    vc = np.stack([np.bincount(lv, c[:, k], n) / cnt for k in range(3)], 1)
    return vc, uv, lv, px


def edges_of(me):
    ed = np.zeros(len(me.edges) * 2, np.int64); me.edges.foreach_get('vertices', ed); return ed[0::2], ed[1::2]


def flood(seed_mask, allow, ea, eb):
    A = seed_mask.copy()
    while True:
        n = A.sum(); A[eb[A[ea] & allow[eb]]] = True; A[ea[A[eb] & allow[ea]]] = True
        if A.sum() == n: return A


def umeyama(P, Q, scale=False):
    """Q ≈ s R P + t (s = 1 nếu không co giãn)."""
    mp, mq = P.mean(0), Q.mean(0); Pc, Qc = P - mp, Q - mq
    U, S, Vt = np.linalg.svd(Qc.T @ Pc / len(P)); D = np.eye(3); D[2, 2] = np.sign(np.linalg.det(U @ Vt))
    R = U @ D @ Vt; s = np.trace(np.diag(S) @ D) / Pc.var(0).sum() if scale else 1.0; return s, R, mq - s * R @ mp


def icp(moving, target, iters=40):
    kd = KDTree(len(target))
    for i, p in enumerate(target): kd.insert(p, i)
    kd.balance(); M = np.eye(4); X = moving.copy()
    for it in range(iters):
        Y = np.array([kd.find(p)[0] for p in X]); d = np.linalg.norm(X - Y, axis=1); keep = d < np.percentile(d, 80)
        s, R, t = umeyama(X[keep], Y[keep]); X = s * X @ R.T + t
        T = np.eye(4); T[:3, :3] = s * R; T[:3, 3] = t; M = T @ M
    d = np.linalg.norm(X - np.array([kd.find(p)[0] for p in X]), axis=1)
    return M, float(np.median(d)), float(np.percentile(d, 95))


def load_khuon(path):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.fbx(filepath=path)
    new = [o for o in bpy.data.objects if o not in before]
    k = next(o for o in new if o.name.startswith('model_LOD0'))
    for o in new:
        if o is not k: bpy.data.objects.remove(o, do_unlink=True)
    k.name = 'KHUON_TROC'; return k


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--out', required=True); ap.add_argument('--anh')
    ap.add_argument('--src', default=SRC); ap.add_argument('--khuon', default=KHUON)
    a = ap.parse_args(argv)
    bpy.ops.wm.open_mainfile(filepath=os.path.abspath(a.src)); sc = bpy.context.scene
    body = bpy.data.objects['model_LOD0']
    for o in list(sc.objects):
        if o.type == 'MESH' and o is not body: bpy.data.objects.remove(o, do_unlink=True)
    me = body.data; nv = len(me.vertices)
    co = np.zeros(nv * 3); me.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
    vc, uv, lv, px = vert_colors(body); lum = vc.mean(1); ea, eb = edges_of(me)

    # (1)(2) vùng bỏ
    seed = np.zeros(nv, bool); seed[np.argmax(co[:, 2])] = True
    hair = flood(seed, (lum < HAIR_LUM) & (co[:, 2] > 1.0), ea, eb)
    edge_lum = (lum < EDGE_LUM) & (co[:, 2] > 1.0)
    hair = flood(hair, edge_lum, ea, eb)                       # viền tóc pha màu (khử răng cưa trên texture)
    cut = hair | ((co[:, 2] > FRONT_CUT_Z) & (co[:, 1] < 0))
    deg = np.bincount(np.concatenate([ea, eb]), minlength=nv)
    for _ in range(GROW):                                       # nới thêm vài vòng
        g = cut.copy(); g[eb[cut[ea]]] = True; g[ea[cut[eb]]] = True; cut = g & (co[:, 2] > 1.0)
    for _ in range(40):                                         # lấp răng cưa: đỉnh có ≥ 50 % láng giềng bị cắt
        k = np.bincount(ea, cut[eb], nv) + np.bincount(eb, cut[ea], nv)
        add = (~cut) & (k >= 0.5 * deg) & (co[:, 2] > 1.0)
        if not add.any(): break
        cut |= add
    print(f'  tóc: {int(hair.sum())} đỉnh; bỏ thêm mép trán: {int((cut & ~hair).sum())}')
    # điểm da trơn cho UV da đầu: đỉnh giữa trán còn lại, cao nhất
    face = (~cut) & (co[:, 2] > 1.1) & (co[:, 2] < 1.40) & (co[:, 1] < -0.12) & (lum > 0.4)
    med = np.median(vc[face], 0); cand = np.nonzero(face)[0]
    skin_v = int(cand[np.argmin(np.linalg.norm(vc[cand] - med, axis=1))])
    skin_uv = uv[np.nonzero(lv == skin_v)[0][0]].copy()
    print(f'  điểm da mẫu: đỉnh {skin_v}, màu {np.round(vc[skin_v], 3)}')

    bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table()
    bmesh.ops.delete(bm, geom=[bm.verts[i] for i in np.nonzero(cut)[0]], context='VERTS')
    # bỏ mảnh rời nhỏ còn sót
    bm.verts.ensure_lookup_table(); comp = {}; cid = 0
    for v in bm.verts:
        if v in comp: continue
        st = [v]; comp[v] = cid
        while st:
            x = st.pop()
            for e in x.link_edges:
                y = e.other_vert(x)
                if y not in comp: comp[y] = cid; st.append(y)
        cid += 1
    sizes = np.bincount(list(comp.values()))
    small = [v for v in bm.verts if sizes[comp[v]] < 0.5 * sizes.max()]
    if small: bmesh.ops.delete(bm, geom=small, context='VERTS')
    print(f'  mảnh rời bỏ đi: {len(small)} đỉnh')
    for _ in range(20):                                          # mép lỗ phải là vòng đơn: bỏ đỉnh mép có > 2 cạnh biên hoặc mặt treo
        bad = [v for v in bm.verts if sum(e.is_boundary for e in v.link_edges) > 2 or (v.is_boundary and len(v.link_faces) < 2)]
        if not bad: break
        bmesh.ops.delete(bm, geom=bad, context='VERTS')
    rest = np.array([v.co[:] for v in bm.verts])
    bvh_rest = BVHTree.FromBMesh(bm)

    # (3) căn khuôn
    k = load_khuon(os.path.abspath(a.khuon))
    sub = k.modifiers.new('sub', 'SUBSURF'); sub.levels = 3; sub.render_levels = 3
    dg = bpy.context.evaluated_depsgraph_get(); km = bpy.data.meshes.new_from_object(k.evaluated_get(dg))
    kco = np.array([k.matrix_world @ v.co for v in km.vertices])
    reg = (rest[:, 2] > 1.0) & (rest[:, 2] < 1.40)
    M, med, p95 = icp(rest[reg][::3], kco[kco[:, 2] > 0.9])      # mặt–tai–cổ còn lại là tập con của bề mặt khuôn
    M = np.linalg.inv(M)
    print(f'  ICP mặt↔khuôn: lệch trung vị {med * 1000:.1f} mm, p95 {p95 * 1000:.1f} mm, tỉ lệ khuôn {np.cbrt(np.linalg.det(M[:3, :3])):.3f}')
    kco = kco @ M[:3, :3].T + M[:3, 3]

    # (4) mảnh sọ = đỉnh khuôn ở vùng đầu, cách da còn lại > GAP, chỉ giữ mảnh lớn nhất
    kb = bmesh.new(); kb.from_mesh(km); kb.verts.ensure_lookup_table()
    for v, p in zip(kb.verts, kco): v.co = Vector(p)
    kd0 = KDTree(nv)
    for i, p in enumerate(co): kd0.insert(p, i)
    kd0.balance()
    far = np.array([cut[kd0.find(p)[1]] for p in kco]) & (kco[:, 2] > 1.0)   # gần tóc cũ hơn gần da ⇒ thuộc da đầu mới
    bmesh.ops.delete(kb, geom=[v for v, f in zip(kb.verts, far) if not f], context='VERTS')
    kb.verts.ensure_lookup_table(); comp = {}; cid = 0
    for v in kb.verts:
        if v in comp: continue
        st = [v]; comp[v] = cid
        while st:
            x = st.pop()
            for e in x.link_edges:
                y = e.other_vert(x)
                if y not in comp: comp[y] = cid; st.append(y)
        cid += 1
    sizes = np.bincount(list(comp.values())); big = int(np.argmax(sizes))
    bmesh.ops.delete(kb, geom=[v for v in kb.verts if comp[v] != big], context='VERTS')
    print(f'  mảnh sọ: {len(kb.verts)} đỉnh (bỏ {int(sizes.sum() - sizes[big])} đỉnh mảnh nhỏ)')
    # lấp lỗ nhỏ bên trong mảnh sọ (vd. chỗ tai khuôn bị cắt)
    holes = [e for e in kb.edges if e.is_boundary]
    patch_me = bpy.data.meshes.new('so_tmp'); kb.to_mesh(patch_me)
    bpy.data.objects.remove(k, do_unlink=True); bpy.data.meshes.remove(km)

    # gộp vào thân, đánh dấu đỉnh mới
    old_vs = set(bm.verts)
    bm.from_mesh(patch_me); bpy.data.meshes.remove(patch_me)
    bm.verts.index_update(); bm.verts.ensure_lookup_table(); bm.edges.ensure_lookup_table()
    is_new = lambda v: v not in old_vs
    bnd = [e for e in bm.edges if e.is_boundary]
    loops = boundary_loops(bnd)
    old_loops = [L for L in loops if not is_new(L[0].verts[0])]; new_loops = [L for L in loops if is_new(L[0].verts[0])]
    old_loops.sort(key=len, reverse=True); new_loops.sort(key=len, reverse=True)
    print(f'  mép lỗ cũ: {[len(L) for L in old_loops]}; mép mảnh sọ: {[len(L) for L in new_loops]}')
    for L in old_loops + new_loops:
        P = np.array([v.co[:] for e in L for v in e.verts]); print('    ', len(L), 'x', P[:, 0].min().round(3), P[:, 0].max().round(3), 'y', P[:, 1].min().round(3), P[:, 1].max().round(3), 'z', P[:, 2].min().round(3), P[:, 2].max().round(3))
    # mép phụ của mảnh sọ (không phải mép chính) → lấp bằng fill
    for L in new_loops[1:]:
        bmesh.ops.holes_fill(bm, edges=L, sides=0)
    res = bmesh.ops.bridge_loops(bm, edges=old_loops[0] + new_loops[0], use_pairs=False, use_cyclic=False, twist_offset=0)
    bridge_faces = res['faces']
    left = boundary_loops([e for e in bm.edges if e.is_boundary])
    if left:
        print(f'  mép còn hở sau nối: {[len(L) for L in left]} ⇒ lấp')
        for L in left: bridge_faces += bmesh.ops.holes_fill(bm, edges=L, sides=0)['faces']
    print(f'  nối: {len(bridge_faces)} mặt')
    bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table()
    bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 4])

    # (5) làm mượt dải nối: các đỉnh trong SEAM_RINGS vòng quanh mép cũ (cả hai phía), giữ các đỉnh xa
    seam = set(v for L in old_loops[:1] for e in L for v in e.verts)
    ring = set(seam)
    for _ in range(SEAM_RINGS):
        ring |= {e.other_vert(v) for v in list(ring) for e in v.link_edges}
    ring_l = list(ring)
    for it in range(30):
        newp = {}
        for v in ring_l:
            nb = [e.other_vert(v).co for e in v.link_edges]
            if nb: newp[v] = v.co.lerp(sum(nb, Vector()) / len(nb), 0.5)
        for v, p in newp.items(): v.co = p
    # (6) UV da đầu: mọi mặt có đỉnh mới hoặc là mặt nối → UV về điểm da mẫu
    uvl = bm.loops.layers.uv.active
    nf = 0
    for f in bm.faces:
        if any(is_new(v) for v in f.verts) or f in set(bridge_faces):
            f.material_index = 0; nf += 1
            for l in f.loops: l[uvl].uv = Vector(skin_uv)
    bm.normal_update()
    bmesh.ops.recalc_face_normals(bm, faces=[f for f in bm.faces if any(is_new(v) for v in f.verts)])
    nbd = sum(1 for e in bm.edges if e.is_boundary)
    print(f'  mặt da đầu mới: {nf}; cạnh biên còn lại: {nbd}')
    # dải pha màu: 1 trên da đầu mới, giảm dần về 0 sau BLEND_RINGS vòng vào da cũ (chỉ trên da, không lan vào mày/mắt)
    bm.verts.index_update()
    fac = {v: 1.0 for v in bm.verts if is_new(v)}
    front = set(v for L in old_loops[:1] for e in L for v in e.verts)
    for v in front: fac[v] = 1.0
    for r in range(1, BLEND_RINGS + 1):
        nxt = set()
        for v in front:
            for e in v.link_edges:
                u = e.other_vert(v)
                if u not in fac and u.co.z > 1.0:
                    nxt.add(u)
        for u in nxt: fac[u] = (1 - r / (BLEND_RINGS + 1)) ** 2
        front = nxt
    vals = np.zeros(len(bm.verts), np.float32)
    for v, f in fac.items(): vals[v.index] = f
    bm.to_mesh(me); me.update(); bm.free()
    at = me.attributes.new('pha_da', 'FLOAT', 'POINT')
    # không phủ lên các texel tối (mày, nốt ruồi): giữ màu gốc ở đó
    vc2, _, _, _ = vert_colors(body); vals[vc2.mean(1) < 0.45] = 0.0
    at.data.foreach_set('value', vals)
    add_skin_mix(me.materials[0], skin_uv)
    for p in me.polygons: p.use_smooth = True
    body.name = 'model_LOD0'
    for c in list(bpy.data.collections):
        if not c.objects and not c.children: bpy.data.collections.remove(c)
    sc['ma_asset'] = 'NHAN-VAT-GOC-001 / DAU-TROC'
    sc['trang_thai'] = 'Lưới nền đầu trọc (tóc bỏ, sọ dựng theo khuôn FBX trọc); chưa rig; chưa nghiệm thu'
    if a.anh: render_head(sc, body, os.path.abspath(a.anh))
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.out), compress=True)
    print('PASS: đã lưu', a.out, f'({len(me.vertices)} đỉnh, cạnh biên {nbd})')


def add_skin_mix(mat, skin_uv):
    """Base Color = trộn(texture, texture tại điểm da mẫu, pha_da)."""
    nt = mat.node_tree; bsdf = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    tex = next(n for n in nt.nodes if n.type == 'TEX_IMAGE' and 'diffuse' in n.image.name.lower())
    t2 = nt.nodes.new('ShaderNodeTexImage'); t2.image = tex.image; t2.interpolation = 'Closest'; t2.label = 'mau_da_mau'
    cv = nt.nodes.new('ShaderNodeCombineXYZ'); cv.inputs[0].default_value = float(skin_uv[0]); cv.inputs[1].default_value = float(skin_uv[1])
    nt.links.new(cv.outputs[0], t2.inputs['Vector'])
    at = nt.nodes.new('ShaderNodeAttribute'); at.attribute_name = 'pha_da'
    mx = nt.nodes.new('ShaderNodeMix'); mx.data_type = 'RGBA'
    nt.links.new(at.outputs['Fac'], mx.inputs['Factor']); nt.links.new(tex.outputs['Color'], mx.inputs[6]); nt.links.new(t2.outputs['Color'], mx.inputs[7])
    nt.links.new(mx.outputs[2], bsdf.inputs['Base Color'])


def boundary_loops(bnd):
    adj = {}
    for e in bnd:
        for v in e.verts: adj.setdefault(v, []).append(e)
    seen = set(); out = []
    for e in bnd:
        if e in seen: continue
        st = [e]; comp = []
        while st:
            x = st.pop()
            if x in seen: continue
            seen.add(x); comp.append(x)
            for v in x.verts: st += [y for y in adj[v] if y not in seen]
        out.append(comp)
    return out


def render_head(sc, body, out):
    os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 16; sc.cycles.device = 'CPU'
    sc.render.resolution_x = 320; sc.render.resolution_y = 320
    w = bpy.data.worlds.new('xem'); sc.world = w; w.use_nodes = True
    w.node_tree.nodes['Background'].inputs[0].default_value = (.8, .8, .8, 1)
    cd = bpy.data.cameras.new('cam_xem'); cd.type = 'ORTHO'; cd.ortho_scale = 0.85
    cam = bpy.data.objects.new('cam_xem', cd); sc.collection.objects.link(cam); sc.camera = cam
    t = Vector((0, 0, 1.33))
    for i, (az, el) in enumerate(((-90, 0), (-45, 15), (0, 0), (90, 0), (-90, 70), (135, 20))):
        A, E = math.radians(az), math.radians(el)
        cam.location = t + 3 * Vector((math.cos(A) * math.cos(E), math.sin(A) * math.cos(E), math.sin(E)))
        cam.rotation_euler = (t - cam.location).to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = f'{out}_{i}.png'; bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(cam); bpy.data.worlds.remove(w)


main()
