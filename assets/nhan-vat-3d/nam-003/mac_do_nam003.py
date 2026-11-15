"""MẶC ĐỒ CHO NAM-003: chuyển trọng số từ thân sang áo quần (cách "1B") + bài đo so với chuyển thô — Blender 5.2.x.

  <bpy-python> mac_do_nam003.py --rig nam-003-rig.blend [--scale 1.0]     (bài đo trên áo phông và quần dài thử)

API cho người mặc đồ thật:
  chuyen_trong_so(ob, body, arm, loai, tho=False) -> None   ob là lưới áo/quần đã parent Nam_Rig; loai 'ao' | 'quan'
Cách làm mặc định ('tho'): Data Transfer (điểm gần nhất, nội suy mặt) → bỏ nhóm phụ cs_* → tối đa 4 xương, tổng 1.
Hai cách thêm để so ('lam_muot': làm mượt có chọn lọc khuỷu/hông/gối; 'chuan': cách 1B của phiên thử quần áo độc lập: dồn trọng số chân về Hips cho áo; dồn tay/vai/cổ/đầu về Spine, tách trái–phải ở |x| > 2 cm, pha 45 % Hips ở đáy háng, làm mượt cho quần).
KẾT QUẢ ĐO (15/11/2026, rig v3, áo phông thử +12 mm và quần dài thử +10 mm): tổng đỉnh xuyên mới so với dáng nghỉ qua 8 tư thế: thô 358, làm mượt 365, chuẩn 369 → KHÔNG cách nào hơn rõ rệt; chọn thô (đơn giản nhất).
Xuyên còn lại: áo ở khuỷu gập 107 đỉnh (sâu 7,5 mm); quần nhấc chân 49, ngồi xổm 193 (sâu 7,8 mm). Rig v2 của nam-002 cho quần nhấc chân 856, ngồi xổm 1669 (cùng cách đo), nên bản này đã tốt hơn nhiều.
Hạn chế: chưa thử áo quần thật; đo trên áo/quần đơn giản copy từ thân.
"""
import sys, os, argparse
import numpy as np, bpy, bmesh
from mathutils import Vector
from mathutils.bvhtree import BVHTree

HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)

LEGS = {s: tuple(f'{s}{n}' for n in ('UpLeg', 'Leg', 'Foot', 'ToeBase')) for s in ('Left', 'Right')}
UPPER = ('Shoulder', 'Arm', 'ArmBlend', 'ForeArm', 'Hand')


def _sm(a, b, t):
    u = np.clip((t - a) / (b - a), 0, 1); return u * u * (3 - 2 * u)


def _weights(ob):
    me = ob.data; names = [g.name for g in ob.vertex_groups]; W = np.zeros((len(me.vertices), len(names)), np.float32)
    for v in me.vertices:
        for g in v.groups: W[v.index, g.group] = g.weight
    return W, names


def _write(ob, W, names, keep=('cs_',)):
    me = ob.data
    for g in ob.vertex_groups: g.remove(list(range(len(me.vertices))))
    nz = np.nonzero(W > 1e-4)
    for vi, gj in zip(nz[0].tolist(), nz[1].tolist()): ob.vertex_groups[gj].add([vi], float(W[vi, gj]), 'REPLACE')


def _lap(W, ea, eb, mask, it, al):
    n, ng = W.shape; deg = np.bincount(np.concatenate([ea, eb]), minlength=n).astype(np.float32).clip(1)
    for _ in range(it):
        acc = np.stack([np.bincount(ea, W[eb, j], n) + np.bincount(eb, W[ea, j], n) for j in range(ng)], 1)
        W[mask] = (1 - al) * W[mask] + al * acc[mask] / deg[mask, None]
    return W


def chuyen_trong_so(ob, body, arm, loai: str, che_do: str = 'tho') -> None:
    """che_do: 'tho' (chỉ Data Transfer) | 'lam_muot' (thêm làm mượt khuỷu/hông/gối) | 'chuan' (cách 1B đầy đủ)."""
    for g in body.vertex_groups: ob.vertex_groups.get(g.name) or ob.vertex_groups.new(name=g.name)
    dt = ob.modifiers.new('dt', 'DATA_TRANSFER'); dt.object = body; dt.use_vert_data = True; dt.data_types_verts = {'VGROUP_WEIGHTS'}
    dt.vert_mapping = 'POLYINTERP_NEAREST'; dt.layers_vgroup_select_src = 'ALL'; dt.layers_vgroup_select_dst = 'NAME'
    bpy.context.view_layer.objects.active = ob; bpy.ops.object.modifier_apply(modifier='dt')
    bones = set(arm.data.bones.keys())
    for g in list(ob.vertex_groups):
        if g.name not in bones: ob.vertex_groups.remove(g)            # bỏ nhóm phụ (cs_vai_hang, cs_co...)
    if che_do != 'tho':
        W, names = _weights(ob); I = {n: i for i, n in enumerate(names)}; me = ob.data
        co = np.array([v.co[:] for v in me.vertices]); x, z = co[:, 0], co[:, 2]
        ea = np.zeros(len(me.edges) * 2, int); me.edges.foreach_get('vertices', ea); ea = ea.reshape(-1, 2); i0, i1 = ea[:, 0], ea[:, 1]
        def move(src, dst):
            cols = [I[n] for n in src if n in I]
            if cols: W[:, I[dst]] += W[:, cols].sum(1); W[:, cols] = 0
        fingers = [n for n in names if n.startswith(('LeftHand', 'RightHand')) and n not in ('LeftHand', 'RightHand')]
        if che_do == 'lam_muot':
            ax_ = np.abs(x)
            mask = ((ax_ > 0.35) & (ax_ < 0.62) & (z > 1.30)) if loai == 'ao' else (((z > 0.38) & (z < 0.58)) | ((z > 0.76) & (z < 1.0) & (ax_ < 0.2)))
            W = _lap(W, i0, i1, mask, 30, 0.5)
        elif loai == 'ao':
            for s in ('Left', 'Right'): move(LEGS[s], 'Hips')
            mask = (z > 1.25) & (np.abs(x) > 0.06) & (np.abs(x) < 0.45)
            W = _lap(W, i0, i1, mask, 15, 0.5)
        else:
            for s in ('Left', 'Right'): move([f'{s}{n}' for n in UPPER] + [n for n in fingers if n.startswith(s)], 'Spine')
            move(('Neck', 'NeckBlend1', 'NeckBlend2', 'Head', 'Spine2', 'Spine1'), 'Spine')
            for s, o in (('Left', 'Right'), ('Right', 'Left')):
                side = (x > 0.02) if s == 'Left' else (x < -0.02)
                for n in LEGS[o]:
                    if n in I: W[side, I[n]] = 0
            cr = (np.abs(x) < 0.03) & (z > 0.78) & (z < 0.98); e = np.zeros(W.shape[1], np.float32); e[I['Hips']] = 1
            fc = (0.45 * (1 - _sm(0.0, 0.03, np.abs(x))))[:, None] * cr[:, None]
            W = (1 - fc) * W + fc * e
            mask = (z > 0.38) & (z < 1.0)
            W = _lap(W, i0, i1, mask, 35, 0.5)
        s_ = W.sum(1, keepdims=True); s_[s_ < 1e-6] = 1; W = W / s_
        _write(ob, W, names)
    bpy.context.view_layer.objects.active = ob      # 'ALL' là đủ: nhóm phụ cs_* đã bị bỏ ở trên (BONE_DEFORM chưa dùng được khi chưa có modifier Armature)
    bpy.ops.object.vertex_group_limit_total(group_select_mode='ALL', limit=4); bpy.ops.object.vertex_group_normalize_all(group_select_mode='ALL', lock_active=False)
    if not any(m.type == 'ARMATURE' for m in ob.modifiers):
        m = ob.modifiers.new('arm', 'ARMATURE'); m.object = arm
    ob.parent = arm


def tao_do_thu(body, arm, ten: str):
    """Áo phông (thân + tay ngắn, phồng 12 mm) hoặc quần dài (phồng 10 mm) copy từ thân, chỉ để đo."""
    me = body.data.copy(); ob = bpy.data.objects.new(ten, me); bpy.context.scene.collection.objects.link(ob)
    bm = bmesh.new(); bm.from_mesh(me)
    if ten == 'ao': keep = lambda c: 0.98 < c.z < 1.55 and abs(c.x) < 0.52 and (abs(c.x) < 0.27 or c.z > 1.36); off = 0.012
    else: keep = lambda c: 0.14 < c.z < 1.04 and abs(c.x) < 0.30; off = 0.010
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if not keep(f.calc_center_median())], context='FACES')
    bm.verts.ensure_lookup_table(); bm.normal_update()
    for v in bm.verts: v.co += v.normal * off
    bm.to_mesh(me); bm.free()
    if me.shape_keys: ob.shape_key_clear()
    for g in list(ob.vertex_groups): ob.vertex_groups.remove(g)
    return ob


def do_xuyen(body, garment, tree_rest=None):
    e = body.evaluated_get(bpy.context.evaluated_depsgraph_get()); m = e.to_mesh(); m.transform(body.matrix_world); m.calc_loop_triangles()
    tree = BVHTree.FromPolygons([v.co.copy() for v in m.vertices], [tuple(p.vertices) for p in m.polygons])
    eg = garment.evaluated_get(bpy.context.evaluated_depsgraph_get()); gm = eg.to_mesh(); gm.transform(garment.matrix_world)
    d = np.zeros(len(gm.vertices))
    for v in gm.vertices:
        h = tree.find_nearest(v.co); d[v.index] = (v.co - h[0]).dot(h[1]) if h[0] is not None else 9
    e.to_mesh_clear(); eg.to_mesh_clear(); return d


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--rig', required=True); ap.add_argument('--scale', type=float, default=1.0); a = ap.parse_args(argv)
    import rig_nam003 as R
    g = R.patched_namespace()
    res = {}
    CACH = ('tho', 'lam_muot', 'chuan')
    for cach in CACH:
        bpy.ops.wm.open_mainfile(filepath=os.path.abspath(a.rig)); arm = bpy.data.objects['Nam_Rig']; body = bpy.data.objects['Nam_Body']; arm.scale = (a.scale,) * 3
        for o in bpy.data.objects:
            if o not in (arm, body): o.hide_render = True
        garments = {}
        for ten in ('ao', 'quan'):
            ob = tao_do_thu(body, arm, ten); chuyen_trong_so(ob, body, arm, ten, che_do=cach); garments[ten] = ob
        g['reset'](arm); bpy.context.view_layer.update(); base = {k: do_xuyen(body, ob) < 0 for k, ob in garments.items()}
        poses = {
            'tay_buong': lambda: g['apply_pose'](arm, 'tay_buong'), 'gio_tay_cao': lambda: g['apply_pose'](arm, 'gio_tay_cao'), 'khuyu_gap': lambda: g['apply_pose'](arm, 'khuyu_gap'),
            'cui+30': lambda: (g['rot_world'](arm, 'Spine', (1, 0, 0), 30), g['rot_world'](arm, 'Spine1', (1, 0, 0), 25)),
            'xoay_than': lambda: g['apply_pose'](arm, 'xoay_than'), 'buoc_chan': lambda: g['apply_pose'](arm, 'buoc_chan'),
            'nhac_chan_IK': lambda: (g['move_world'](arm, 'ik_foot.L', (0, -0.30, 0.35)), g['move_world'](arm, 'Hips', (0, 0, -0.02))), 'ngoi_xom': lambda: g['apply_pose'](arm, 'ngoi_xom')}
        for nm, f in poses.items():
            g['reset'](arm); f(); bpy.context.view_layer.update(); row = {}
            for k, ob in garments.items():
                d = do_xuyen(body, ob); new = (d < 0) & ~base[k]; row[k] = (int(new.sum()), float(d[new].min() * 1000) if new.any() else 0.0)
            res.setdefault(nm, {})[cach] = row
    print(f'{"tư thế":14s} | ' + ' '.join(f'{"ÁO "+c:>13s}' for c in CACH) + ' | ' + ' '.join(f'{"QUẦN "+c:>13s}' for c in CACH) + '   (đỉnh xuyên MỚI, sâu nhất mm)')
    for nm, r in res.items():
        print(f'{nm:14s} | ' + ' '.join(f'{r[c]["ao"][0]:5d},{r[c]["ao"][1]:6.1f}' for c in CACH) + ' | ' + ' '.join(f'{r[c]["quan"][0]:5d},{r[c]["quan"][1]:6.1f}' for c in CACH))
    tong = {c: sum(r[c][k][0] for r in res.values() for k in ('ao', 'quan')) for c in CACH}
    print('TỔNG đỉnh xuyên mới:', tong)


if __name__ == '__main__':
    main()
