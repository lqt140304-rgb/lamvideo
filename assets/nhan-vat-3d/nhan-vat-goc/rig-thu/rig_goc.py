"""RIG THỬ cho NHAN-VAT-GOC-001 (Blender 5.2.x, bpy).

Chạy (trong thư mục này):
  blender -b --factory-startup --python rig_goc.py -- --out nhan-vat-goc-rig-thu.blend [--anh xem-thu]
  hoặc: python rig_goc.py --out ... (khi cài gói bpy)

Không sửa file nguồn `../nhan-vat-goc.blend`; mở nó, chỉ giữ LOD0, thêm armature rồi lưu ra file khác.
Armature `Goc_Rig` (m, mặt −Y, trái nhân vật = +X ⇒ đuôi .L), tên xương theo rig_nam.py của Hồ sơ 02:
  root → pelvis → spine1 → spine2 → chest → neck → head
  chest → clavicle → upper_arm → forearm → hand;  pelvis → thigh → shin → foot → toe
  Điều khiển: ik_foot/pole_knee (IK chân), ik_hand/pole_elbow (IK tay, thuộc tính `ik` 0=FK…1=IK trên ik_hand).
Trọng số: bone heat trên LOD3 (cùng hình khối, 27k đỉnh) → Data Transfer sang LOD0 → luật vùng
  (bên trái/phải, tay không kéo đùi, đầu+tóc cứng theo head) → làm mượt Laplace.
Chưa có: xương ngón, hàm/mắt/mí, shape key; tóc liền đầu nên đi cứng theo đầu.
"""
import sys, os, math, argparse, time
import bpy
import numpy as np
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'nhan-vat-goc.blend')

# ---- mốc khớp, đo trên lưới LOD0 (lát cắt theo z, xem README) — bên trái nhân vật (+X) ----
J = dict(
    pelvis=(0, -0.010, 0.50), spine1=(0, -0.005, 0.60), spine2=(0, 0.000, 0.70), chest=(0, 0.005, 0.80),
    neck=(0, 0.010, 0.93), head=(0, 0.005, 1.015), head_top=(0, 0.005, 1.45),
    clav=(0.025, 0.010, 0.905), shoulder=(0.172, 0.018, 0.875), elbow=(0.250, 0.024, 0.705),
    wrist=(0.279, -0.025, 0.525), hand_end=(0.276, -0.050, 0.400),
    hip=(0.100, -0.015, 0.530), knee=(0.124, -0.030, 0.285), ankle=(0.130, -0.005, 0.100),
    ball=(0.135, -0.150, 0.030), toe=(0.135, -0.250, 0.030),
)
HEAD_Z = 1.035          # trên mức này (và cằm) = 100% xương head
ARM_CUT = (0.17, 0.86)  # loang từ đầu ngón tay, không qua |x|<0,17 hay z>0,86 ⇒ vùng tay (tay chỉ dính thân từ nách z≈0,70 trở lên)


def V(name, s=1):
    x, y, z = J[name]; return Vector((s * x, y, z))


def bone_table():
    B = []
    A = lambda n, par, h, t, d=True: B.append((n, par, Vector(h), Vector(t), d))
    A('root', None, (0, 0, 0), (0, 0, 0.12), False)
    A('pelvis', 'root', V('pelvis'), V('spine1'))
    A('spine1', 'pelvis', V('spine1'), V('spine2'))
    A('spine2', 'spine1', V('spine2'), V('chest'))
    A('chest', 'spine2', V('chest'), V('neck'))
    A('neck', 'chest', V('neck'), V('head'))
    A('head', 'neck', V('head'), V('head_top'))
    for s, k in ((1, 'L'), (-1, 'R')):
        A(f'clavicle.{k}', 'chest', V('clav', s), V('shoulder', s))
        A(f'upper_arm.{k}', f'clavicle.{k}', V('shoulder', s), V('elbow', s))
        A(f'forearm.{k}', f'upper_arm.{k}', V('elbow', s), V('wrist', s))
        A(f'hand.{k}', f'forearm.{k}', V('wrist', s), V('hand_end', s))
        A(f'thigh.{k}', 'pelvis', V('hip', s), V('knee', s))
        A(f'shin.{k}', f'thigh.{k}', V('knee', s), V('ankle', s))
        A(f'foot.{k}', f'shin.{k}', V('ankle', s), V('ball', s))
        A(f'toe.{k}', f'foot.{k}', V('ball', s), V('toe', s))
        A(f'ik_foot.{k}', 'root', V('ankle', s), V('ball', s), False)
        A(f'pole_knee.{k}', 'root', V('knee', s) + Vector((0, -0.45, 0)), V('knee', s) + Vector((0, -0.50, 0)), False)
        A(f'ik_hand.{k}', 'root', V('wrist', s), V('hand_end', s), False)
        A(f'pole_elbow.{k}', 'root', V('elbow', s) + Vector((0, 0.40, 0)), V('elbow', s) + Vector((0, 0.45, 0)), False)
    return B


def build_armature(sc):
    ad = bpy.data.armatures.new('Goc_Rig'); ob = bpy.data.objects.new('Goc_Rig', ad); sc.collection.objects.link(ob)
    ad.display_type = 'STICK'; ob.show_in_front = True
    bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.object.mode_set(mode='EDIT')
    eb = ad.edit_bones; T = bone_table()
    for n, par, h, t, d in T:
        b = eb.new(n); b.head = h; b.tail = t; b.use_deform = d
    for n, par, h, t, d in T:
        if par:
            eb[n].parent = eb[par]
            eb[n].use_connect = (not n.startswith(('thigh', 'clavicle', 'ik_', 'pole_'))) and (eb[n].head - eb[par].tail).length < 1e-5
    # roll: gập khuỷu/gối quanh trục X cục bộ ⇒ đặt trục Z cục bộ của xương tay/chân về −Y (phía trước)
    for k in 'LR':
        for n in (f'upper_arm.{k}', f'forearm.{k}', f'hand.{k}', f'ik_hand.{k}', f'thigh.{k}', f'shin.{k}'):
            eb[n].align_roll(Vector((0, -1, 0)))
    bpy.ops.object.mode_set(mode='POSE'); pb = ob.pose.bones
    for b in pb: b.rotation_mode = 'XYZ'
    for k in 'LR':
        c = pb[f'shin.{k}'].constraints.new('IK'); c.target = ob; c.subtarget = f'ik_foot.{k}'; c.chain_count = 2
        c.pole_target = ob; c.pole_subtarget = f'pole_knee.{k}'; c.pole_angle = math.radians(-90)
        cf = pb[f'foot.{k}'].constraints.new('COPY_ROTATION'); cf.target = ob; cf.subtarget = f'ik_foot.{k}'
        for n in (f'thigh.{k}', f'shin.{k}'): pb[n].lock_ik_y = True
        h = pb[f'ik_hand.{k}']; h['ik'] = 0.0
        h.id_properties_ui('ik').update(min=0.0, max=1.0, description='0 = FK (xoay tay), 1 = IK (kéo ik_hand)')
        c = pb[f'forearm.{k}'].constraints.new('IK'); c.target = ob; c.subtarget = f'ik_hand.{k}'; c.chain_count = 2
        c.pole_target = ob; c.pole_subtarget = f'pole_elbow.{k}'; c.pole_angle = math.radians(-90)
        ch = pb[f'hand.{k}'].constraints.new('COPY_ROTATION'); ch.target = ob; ch.subtarget = f'ik_hand.{k}'
        for con in (c, ch):
            d = con.driver_add('influence').driver; d.type = 'AVERAGE'
            v = d.variables.new(); v.type = 'SINGLE_PROP'; v.targets[0].id = ob; v.targets[0].data_path = f'pose.bones["ik_hand.{k}"]["ik"]'
    bpy.ops.object.mode_set(mode='OBJECT')
    calibrate_poles(ob)
    groups = {'Than': ('root', 'pelvis', 'spine1', 'spine2', 'chest', 'neck', 'head'),
              'Tay_FK': tuple(f'{n}.{k}' for k in 'LR' for n in ('clavicle', 'upper_arm', 'forearm', 'hand')),
              'Tay_IK': tuple(f'{n}.{k}' for k in 'LR' for n in ('ik_hand', 'pole_elbow')),
              'Chan_IK': tuple(f'{n}.{k}' for k in 'LR' for n in ('ik_foot', 'pole_knee')),
              'Chan_deform': tuple(f'{n}.{k}' for k in 'LR' for n in ('thigh', 'shin', 'foot', 'toe'))}
    for nm, bones in groups.items():
        c = ad.collections.new(nm)
        for b in bones: c.assign(ad.bones[b])
    return ob


def calibrate_poles(ob):
    """Chọn pole_angle để IK không xoắn tay/chân ở dáng nghỉ (sai lệch ma trận xương so với rest nhỏ nhất)."""
    pb = ob.pose.bones
    for k in 'LR':
        for chain, ctl in (((f'thigh.{k}', f'shin.{k}'), None), ((f'upper_arm.{k}', f'forearm.{k}'), f'ik_hand.{k}')):
            con = pb[chain[1]].constraints['IK']
            if ctl: pb[ctl]['ik'] = 1.0
            def err():
                bpy.context.view_layer.update()
                return sum((pb[n].matrix - pb[n].bone.matrix_local).to_3x3().to_scale().length + sum(abs(a - b) for ra, rb in zip(pb[n].matrix, pb[n].bone.matrix_local) for a, b in zip(ra, rb)) for n in chain)
            best = min(range(-180, 180, 2), key=lambda d: (setattr(con, 'pole_angle', math.radians(d)), err())[1])
            fine = min((best + t * 0.25 for t in range(-8, 9)), key=lambda d: (setattr(con, 'pole_angle', math.radians(d)), err())[1])
            con.pole_angle = math.radians(fine); e = err()
            if ctl: pb[ctl]['ik'] = 0.0
            print(f'  pole {chain[1]}: {fine:.2f}°, sai lệch {e:.5f}')
    bpy.context.view_layer.update()


def mesh_co(ob):
    a = np.zeros(len(ob.data.vertices) * 3); ob.data.vertices.foreach_get('co', a); return a.reshape(-1, 3)


def bind(sc, arm, body, proxy):
    t0 = time.time()
    bpy.ops.object.select_all(action='DESELECT'); proxy.select_set(True); arm.select_set(True); bpy.context.view_layer.objects.active = arm
    bpy.ops.object.parent_set(type='ARMATURE_AUTO')
    print(f'  bone heat trên proxy {len(proxy.data.vertices)} đỉnh: {time.time() - t0:.1f}s, {len(proxy.vertex_groups)} nhóm')
    for vg in proxy.vertex_groups:
        if vg.name not in body.vertex_groups: body.vertex_groups.new(name=vg.name)
    dt = body.modifiers.new('DT', 'DATA_TRANSFER'); dt.object = proxy; dt.use_vert_data = True; dt.data_types_verts = {'VGROUP_WEIGHTS'}
    dt.vert_mapping = 'POLYINTERP_NEAREST'; dt.layers_vgroup_select_src = 'ALL'; dt.layers_vgroup_select_dst = 'NAME'
    bpy.ops.object.select_all(action='DESELECT'); body.select_set(True); bpy.context.view_layer.objects.active = body
    bpy.ops.object.modifier_apply(modifier=dt.name)
    print(f'  chuyển trọng số sang LOD0: {time.time() - t0:.1f}s')
    clean_weights(body)
    m = body.modifiers.new('Armature', 'ARMATURE'); m.object = arm
    body.parent = arm
    cs = body.modifiers.new('CorrectiveSmooth', 'CORRECTIVE_SMOOTH'); cs.iterations = 8; cs.smooth_type = 'LENGTH_WEIGHTED'; cs.rest_source = 'ORCO'


def arm_region(co, ea, eb):
    x, z = co[:, 0], co[:, 2]; keep = ~((np.abs(x) < ARM_CUT[0]) | (z > ARM_CUT[1])); A = np.zeros(len(co), bool)
    for s in (1, -1):
        A[np.argmin(np.where((s * x > 0.2) & (z > 0.3), z, 9))] = True
    while True:
        n = A.sum(); A[eb[A[ea] & keep[eb]]] = True; A[ea[A[eb] & keep[ea]]] = True
        if A.sum() == n: return A


def clean_weights(body):
    me = body.data; nv = len(me.vertices); names = [g.name for g in body.vertex_groups]; ng = len(names)
    W = np.zeros((nv, ng), dtype=np.float32)
    for v in me.vertices:
        for g in v.groups: W[v.index, g.group] = g.weight
    co = mesh_co(body); x, y, z = co[:, 0], co[:, 1], co[:, 2]; ax = np.abs(x)
    ed = np.zeros(len(me.edges) * 2, dtype=np.int32); me.edges.foreach_get('vertices', ed); ea, eb = ed[0::2], ed[1::2]
    deg = np.bincount(np.concatenate([ea, eb]), minlength=nv).astype(np.float32).clip(min=1)
    I = {n: i for i, n in enumerate(names)}
    sm = lambda e0, e1, t: (lambda u: u * u * (3 - 2 * u))(np.clip((t - e0) / (e1 - e0), 0, 1))
    head = (z > HEAD_Z) | ((z > 0.985) & (y < -0.10))
    arm_i = [i for n, i in I.items() if n.startswith(('clavicle', 'upper_arm', 'forearm', 'hand'))]
    leg_i = [i for n, i in I.items() if n.startswith(('thigh', 'shin', 'foot', 'toe'))]
    trunk_i = [I[n] for n in ('pelvis', 'spine1', 'spine2', 'chest') if n in I]
    arm_reg = arm_region(co, ea, eb)
    shoulder = (z > 0.68) & (ax > 0.10)                 # vùng pha vai–ngực–nách
    print(f'  vùng tay (loang): {int(arm_reg.sum())} đỉnh')

    def rules(W):
        fL = sm(-0.01, 0.01, x)
        for n, i in I.items():
            if n.endswith('.L'): W[:, i] *= fL
            elif n.endswith('.R'): W[:, i] *= 1 - fL
        W[np.ix_(arm_reg, leg_i)] = 0                        # bàn tay buông cạnh đùi: không theo chân
        W[np.ix_(arm_reg & (z < 0.78), trunk_i)] = 0          # tay dưới nách: không theo thân
        W[np.ix_(~arm_reg & ~shoulder, arm_i)] = 0            # thân/đùi: không theo tay (trừ vùng vai)
        W[np.ix_(~arm_reg, [I[n] for n in names if n.startswith(('forearm', 'hand'))])] = 0
        W[np.ix_(z < 0.40, trunk_i)] *= 0                   # dưới đùi giữa không theo thân
        W[np.ix_(z > 0.70, leg_i)] = 0
        W[head] = 0; W[head, I['head']] = 1
        s = W.sum(1); W[s < 1e-6, I['spine2']] = 1
        return W / W.sum(1, keepdims=True)

    def lap(W, mask, it, a):
        for _ in range(it):
            acc = np.stack([np.bincount(ea, W[eb, j], nv) + np.bincount(eb, W[ea, j], nv) for j in range(ng)], 1)
            W[mask] = (1 - a) * W[mask] + a * acc[mask] / deg[mask, None]
        return W
    W = rules(W)
    W = lap(W, ~head, 25, 0.5); W = rules(W)
    # cổ: pha chest → neck → head theo z, rồi làm mượt
    band = (~head) & (z > 0.90) & (ax < 0.11)
    t = np.clip((z[band] - 0.90) / (HEAD_Z - 0.90), 0, 1)
    Wn = np.zeros((band.sum(), ng), np.float32)
    Wn[:, I['chest']] = np.clip(1 - 2 * t, 0, 1); Wn[:, I['head']] = np.clip(2 * t - 1, 0, 1); Wn[:, I['neck']] = 1 - Wn[:, I['chest']] - Wn[:, I['head']]
    f = (1 - sm(0.07, 0.11, ax[band]))[:, None]; W[band] = (1 - f) * W[band] + f * Wn
    W = lap(W, ~head, 20, 0.5)
    W = lap(W, (~head) & (z > 0.40) & (z < 0.62) & (ax < 0.20), 60, 0.6)     # háng
    W = lap(W, (~head) & (z > 0.72) & (z < 0.95) & (ax > 0.08) & (ax < 0.22), 60, 0.6)   # nách–vai
    W = rules(W)
    W[W < 0.01] = 0; W /= W.sum(1, keepdims=True)
    for g in body.vertex_groups: g.remove(list(range(nv)))
    nz = np.nonzero(W > 1e-4)
    for vi, gj in zip(nz[0].tolist(), nz[1].tolist()): body.vertex_groups[gj].add([vi], float(W[vi, gj]), 'REPLACE')
    print(f'  trọng số sạch: {len(nz[0]) / nv:.2f} xương/đỉnh; đầu cứng {int(head.sum())} đỉnh')


# ---- dáng thử ----
POSES = {
    'nghi': {},
    'tay_dang_60': {'upper_arm.L': ('Y', 0, 'Z', 60)},
    'gio_tay_cao': {'upper_arm.L': ('Y', 0, 'Z', 140)},
    'khuyu_gap': {'upper_arm.L': ('X', 30), 'forearm.L': ('X', 100), 'upper_arm.R': ('X', 30), 'forearm.R': ('X', 100)},
    'quay_dau': {'head': ('Y', 35), 'neck': ('Y', 10)},
    'cui_dau': {'head': ('X', 20), 'neck': ('X', 10), 'spine2': ('X', 10)},
    'xoay_than': {'spine1': ('Y', 15), 'spine2': ('Y', 15), 'chest': ('Y', 10)},
    'buoc_chan': 'step',
    'ngoi_xom': 'squat',
}


def set_rot(pb, bn, spec):
    e = list(pb[bn].rotation_euler)
    for ax, deg in zip(spec[0::2], spec[1::2]): e['XYZ'.index(ax)] = math.radians(deg)
    pb[bn].rotation_euler = e


def move_world(p, d):
    """Dời xương theo vectơ thế giới (armature không xoay/scale)."""
    p.location = p.bone.matrix_local.to_3x3().inverted() @ Vector(d)


def apply_pose(arm, name):
    pb = arm.pose.bones
    for b in pb:
        b.location = (0, 0, 0)
        b.rotation_euler = (0, 0, 0)
    spec = POSES[name]
    if spec == 'step':
        move_world(pb['ik_foot.L'], (0, -0.13, 0.05)); move_world(pb['ik_foot.R'], (0, 0.07, 0.0))
        move_world(pb['pelvis'], (0, -0.03, -0.025))
        set_rot(pb, 'upper_arm.L', ('X', -20)); set_rot(pb, 'upper_arm.R', ('X', 20))
    elif spec == 'squat':
        move_world(pb['pelvis'], (0, 0.08, -0.17))
        set_rot(pb, 'spine1', ('X', 20)); set_rot(pb, 'spine2', ('X', 10))
        for k in 'LR': set_rot(pb, f'upper_arm.{k}', ('X', 50))
    else:
        for bn, sp in spec.items():
            set_rot(pb, bn, sp)
            if bn.endswith('.L') and bn.replace('.L', '.R') not in spec:
                sp2 = list(sp)
                for i in range(1, len(sp2), 2):
                    if sp2[i - 1] in 'YZ': sp2[i] = -sp2[i]
                set_rot(pb, bn.replace('.L', '.R'), tuple(sp2))
    bpy.context.view_layer.update()


def stretch(arm, body):
    def pos():
        dg = bpy.context.evaluated_depsgraph_get(); ev = body.evaluated_get(dg); me = ev.to_mesh()
        a = np.zeros(len(me.vertices) * 3, np.float32); me.vertices.foreach_get('co', a); ev.to_mesh_clear(); return a.reshape(-1, 3)
    apply_pose(arm, 'nghi'); p0 = pos()
    r0 = mesh_co(body); print(f'  dáng nghỉ lệch so với lưới gốc: tối đa {np.linalg.norm(p0 - r0, axis=1).max() * 1000:.2f} mm')
    ed = np.zeros(len(body.data.edges) * 2, np.int32); body.data.edges.foreach_get('vertices', ed); ea, eb = ed[0::2], ed[1::2]
    l0 = np.linalg.norm(p0[ea] - p0[eb], axis=1); ok = l0 > 1e-3
    for nm in POSES:
        apply_pose(arm, nm); p = pos(); st = np.where(ok, np.linalg.norm(p[ea] - p[eb], axis=1) / l0.clip(1e-6), 1)
        bad = st > 2.0
        print(f'  {nm:12s} cạnh giãn >2×: {int(bad.sum()):5d}  max {st.max():.2f}×')
    apply_pose(arm, 'nghi')


def render_sheet(sc, arm, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 12; sc.cycles.device = 'CPU'; sc.cycles.use_denoising = False
    sc.render.resolution_x = 320; sc.render.resolution_y = 400
    w = bpy.data.worlds.new('xem_thu'); sc.world = w; w.use_nodes = True
    bg = w.node_tree.nodes['Background']; bg.inputs[0].default_value = (.8, .8, .8, 1); bg.inputs[1].default_value = 1.0
    cd = bpy.data.cameras.new('cam_xem'); cd.type = 'ORTHO'; cd.ortho_scale = 2.0
    cam = bpy.data.objects.new('cam_xem', cd); sc.collection.objects.link(cam); sc.camera = cam
    files = []
    for nm in POSES:
        apply_pose(arm, nm)
        for view, ang in (('truoc', -90), ('cheo', -40)):
            a = math.radians(ang); cam.location = (3 * math.cos(a), 3 * math.sin(a), 0.85)
            cam.rotation_euler = (Vector((0, 0, 0.85)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
            sc.render.filepath = os.path.join(out_dir, f'{nm}_{view}.png'); bpy.ops.render.render(write_still=True); files.append(sc.render.filepath)
    apply_pose(arm, 'nghi'); bpy.data.objects.remove(cam)
    return files


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--out', required=True); ap.add_argument('--anh'); ap.add_argument('--src', default=SRC)
    a = ap.parse_args(argv)
    bpy.ops.wm.open_mainfile(filepath=os.path.abspath(a.src)); sc = bpy.context.scene
    if bpy.context.object and bpy.context.object.mode != 'OBJECT': bpy.ops.object.mode_set(mode='OBJECT')
    body = bpy.data.objects['model_LOD0']; proxy = bpy.data.objects['model_LOD3']
    for o in list(sc.objects):
        if o.type == 'MESH' and o not in (body, proxy): bpy.data.objects.remove(o, do_unlink=True)
    proxy.hide_set(False); body.hide_set(False); body.hide_render = False
    arm = build_armature(sc)
    bind(sc, arm, body, proxy)
    bpy.data.objects.remove(proxy, do_unlink=True)
    for c in list(bpy.data.collections):
        if c.name.startswith('LOD') and not c.objects: bpy.data.collections.remove(c)
    arm.users_collection[0].objects.unlink(arm); body.users_collection[0].objects.link(arm)
    stretch(arm, body)
    if a.anh: render_sheet(sc, arm, os.path.abspath(a.anh))
    sc['ma_asset'] = 'NHAN-VAT-GOC-001 / RIG-THU'
    sc['trang_thai'] = 'Rig thử: thân/tay/chân, IK chân, IK/FK tay; chưa ngón, mặt, shape key; chưa nghiệm thu'
    bpy.ops.object.select_all(action='DESELECT'); arm.select_set(True); bpy.context.view_layer.objects.active = arm
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.out), compress=True)
    print('PASS: đã lưu', a.out)


main()
