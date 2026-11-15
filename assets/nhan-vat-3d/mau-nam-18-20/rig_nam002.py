"""RIG cho NAM-002 (mô hình chữ T, cao 1,70 m) — Blender 5.2.x / bpy.

Chạy trong thư mục này:
  blender -b --factory-startup --python rig_nam002.py -- --out nam-002-rig.blend [--glb nam-002-rig.glb] [--anh xem-rig]
Đọc nam-002.glb (không sửa). Mặt hướng −Y, trái nhân vật = +X. Tên xương theo Mixamo:
  Hips → Spine → Spine1 → Spine2 → Neck → Head;  Spine2 → LeftShoulder → LeftArm → LeftForeArm → LeftHand → LeftHand{Thumb,Index,Middle,Ring,Pinky}{1,2,3}
  Hips → LeftUpLeg → LeftLeg → LeftFoot → LeftToeBase  (và Right…)
Điều khiển (không biến dạng): root, ik_foot.L/R + pole_knee.L/R (IK chân), ik_hand.L/R + pole_elbow.L/R (IK tay, thuộc tính `ik` 0=FK…1=IK).
Thuộc tính trên LeftHand/RightHand: `nam` (nắm cả bàn tay) và nam_tro/nam_giua/nam_ap/nam_ut/nam_cai, 0–1.
Trọng số: bone heat trên bản giản lược (12,5 %) → chuyển sang lưới gốc → luật vùng (trái/phải, đầu cứng, ngón theo hình học) → làm mượt.
"""
import sys, os, math, argparse, time
import bpy
import numpy as np
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'nam-002.glb')

# ---- mốc khớp bên trái (+X), đo bằng lát cắt lưới nam-002.glb ----
J = dict(
    hips=(0, 0.005, 0.93), spine=(0, 0.005, 1.02), spine1=(0, 0.010, 1.11), spine2=(0, 0.015, 1.20),
    neck=(0, 0.020, 1.33), head=(0, 0.020, 1.40), head_top=(0, 0.010, 1.70),
    clav=(0.030, 0.020, 1.300), shoulder=(0.170, 0.030, 1.258), elbow=(0.370, 0.045, 1.255),      # khuỷu lùi sau 1 cm so với đường vai–cổ tay ⇒ IK gập đúng chiều
    wrist=(0.505, 0.037, 1.253), hand_end=(0.585, 0.038, 1.258),
    hip=(0.085, 0.005, 0.86), knee=(0.095, -0.005, 0.48), ankle=(0.105, 0.020, 0.090),   # gối nằm trên đường hông–cổ chân theo x, nhô trước 1,7 cm
    ball=(0.110, -0.075, 0.025), toe=(0.115, -0.145, 0.020),
)
# ngón: (tên, z gốc tại x=0,585, dải z ở đầu ngón)  — bàn tay dựng đứng, ngón cái hướng lên (+Z), lòng bàn tay hướng −Y
FING = [('Index', 1.300, (1.285, 1.315)), ('Middle', 1.263, (1.248, 1.278)), ('Ring', 1.232, (1.216, 1.245)), ('Pinky', 1.205, (1.185, 1.215))]
THUMB = [(0.540, 0.030, 1.285), (0.575, 0.033, 1.318), (0.598, 0.036, 1.338)]       # gốc, khớp 1, khớp 2 (đầu ngón đo tự động)
SPLIT = (0.42, 0.32, 0.26)
CURL = {'Index': (55, 75, 45), 'Middle': (55, 75, 45), 'Ring': (55, 75, 45), 'Pinky': (55, 75, 45), 'Thumb': (35, 45, 50)}
PROPS = {'Index': 'nam_tro', 'Middle': 'nam_giua', 'Ring': 'nam_ap', 'Pinky': 'nam_ut', 'Thumb': 'nam_cai'}
HEAD_Z = 1.40
CH = {}


def V(n, s=1): x, y, z = J[n]; return Vector((s * x, y, z))


def mesh_co(ob):
    a = np.zeros(len(ob.data.vertices) * 3); ob.data.vertices.foreach_get('co', a)
    M = np.array(ob.matrix_world); return a.reshape(-1, 3) @ M[:3, :3].T + M[:3, 3]


def edges_np(me):
    e = np.zeros(len(me.edges) * 2, np.int64); me.edges.foreach_get('vertices', e); return e[0::2], e[1::2]


def split_poly(P, fr):
    P = np.asarray(P, float); L = np.r_[0, np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=1))]; out = []
    for f in np.r_[0, np.cumsum(fr)]:
        t = min(f, 1.0) * L[-1]; j = min(np.searchsorted(L, t, side='right') - 1, len(P) - 2)
        u = (t - L[j]) / max(L[j + 1] - L[j], 1e-9); out.append(P[j] + u * (P[j + 1] - P[j]))
    return [Vector(p) for p in out]


def measure_fingers(co):
    x, y, z = co.T
    for nm, z0, (za, zb) in FING:
        band = (x > 0.585) & (z > za) & (z < zb) & (y > 0.0) & (y < 0.07)
        pts = [(0.585, 0.038, z0)]
        for xx in np.arange(0.595, 0.70, 0.008):
            m = band & (np.abs(x - xx) < 0.003)
            if m.sum() >= 5: pts.append((xx, y[m].mean(), z[m].mean()))
        tip = co[band][np.argmax(x[band])]; pts.append(tuple(tip))
        CH[nm] = split_poly(pts, SPLIT)
    band = (x > 0.53) & (x < 0.64) & (z > 1.315) & (y > 0.0) & (y < 0.07)
    tip = co[band][np.argmax(z[band])]
    CH['Thumb'] = [Vector(p) for p in THUMB] + [Vector(tip)]
    for nm, P in CH.items():
        print(f'  ngón {nm:6s}: gốc ({P[0].x:.3f},{P[0].z:.3f}) → đầu ({P[3].x:.3f},{P[3].z:.3f}), dài {sum((P[i + 1] - P[i]).length for i in range(3)) * 1000:.0f} mm')


def bone_table():
    B = []
    A = lambda n, par, h, t, d=True: B.append((n, par, Vector(h), Vector(t), d))
    A('root', None, (0, 0, 0), (0, 0, 0.15), False)
    A('Hips', 'root', V('hips'), V('spine')); A('Spine', 'Hips', V('spine'), V('spine1')); A('Spine1', 'Spine', V('spine1'), V('spine2'))
    A('Spine2', 'Spine1', V('spine2'), V('neck')); A('Neck', 'Spine2', V('neck'), V('head')); A('Head', 'Neck', V('head'), V('head_top'))
    for s, S, k in ((1, 'Left', 'L'), (-1, 'Right', 'R')):
        A(f'{S}Shoulder', 'Spine2', V('clav', s), V('shoulder', s))
        A(f'{S}Arm', f'{S}Shoulder', V('shoulder', s), V('elbow', s))
        A(f'{S}ArmBlend', f'{S}Shoulder', V('shoulder', s), V('shoulder', s).lerp(V('elbow', s), 0.35))     # xương phụ vai (biến dạng)
        A(f'{S}ForeArm', f'{S}Arm', V('elbow', s), V('wrist', s))
        A(f'{S}Hand', f'{S}ForeArm', V('wrist', s), V('hand_end', s))
        M = lambda v: Vector((s * v.x, v.y, v.z))
        for nm, P in CH.items():
            for i in range(3):
                A(f'{S}Hand{nm}{i + 1}', f'{S}Hand' if i == 0 else f'{S}Hand{nm}{i}', M(P[i]), M(P[i + 1]))
        A(f'{S}UpLeg', 'Hips', V('hip', s), V('knee', s)); A(f'{S}Leg', f'{S}UpLeg', V('knee', s), V('ankle', s))
        A(f'{S}Foot', f'{S}Leg', V('ankle', s), V('ball', s)); A(f'{S}ToeBase', f'{S}Foot', V('ball', s), V('toe', s))
        A(f'ik_foot.{k}', 'root', V('ankle', s), V('ball', s), False)
        A(f'pole_knee.{k}', 'root', V('knee', s) + Vector((0, -0.5, 0)), V('knee', s) + Vector((0, -0.55, 0)), False)
        A(f'ik_hand.{k}', 'root', V('wrist', s), V('hand_end', s), False)
        A(f'pole_elbow.{k}', 'root', V('elbow', s) + Vector((0, 0.45, 0)), V('elbow', s) + Vector((0, 0.5, 0)), False)
    return B


def build_armature(sc):
    ad = bpy.data.armatures.new('Nam_Rig'); ob = bpy.data.objects.new('Nam_Rig', ad); sc.collection.objects.link(ob)
    ad.display_type = 'STICK'; ob.show_in_front = True
    bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.object.mode_set(mode='EDIT')
    eb = ad.edit_bones; T = bone_table()
    for n, par, h, t, d in T:
        b = eb.new(n); b.head = h; b.tail = t; b.use_deform = d
    for n, par, h, t, d in T:
        if par:
            eb[n].parent = eb[par]
            eb[n].use_connect = (not n.endswith(('Shoulder', 'UpLeg')) and not n.startswith(('ik_', 'pole_')) and 'Hand' not in n[len('Left'):] or n.endswith(('Hand2', 'Hand3')) or n[-1] in '23') and (eb[n].head - eb[par].tail).length < 1e-5
    for S in ('Left', 'Right'):
        k = S[0]
        for n in (f'{S}Arm', f'{S}ArmBlend', f'{S}ForeArm', f'{S}Hand', f'ik_hand.{k}'): eb[n].align_roll(Vector((0, -1, 0)))
        for n in (f'{S}UpLeg', f'{S}Leg'): eb[n].align_roll(Vector((0, -1, 0)))
        for nm in CH:
            for i in (1, 2, 3): eb[f'{S}Hand{nm}{i}'].align_roll(Vector((0, -1, 0)))
    bpy.ops.object.mode_set(mode='POSE'); pb = ob.pose.bones
    for b in pb: b.rotation_mode = 'XYZ'
    for S, k in (('Left', 'L'), ('Right', 'R')):
        c = pb[f'{S}Leg'].constraints.new('IK'); c.target = ob; c.subtarget = f'ik_foot.{k}'; c.chain_count = 2
        c.pole_target = ob; c.pole_subtarget = f'pole_knee.{k}'; c.pole_angle = math.radians(-90)
        cf = pb[f'{S}Foot'].constraints.new('COPY_ROTATION'); cf.target = ob; cf.subtarget = f'ik_foot.{k}'
        h = pb[f'ik_hand.{k}']; h['ik'] = 0.0; h.id_properties_ui('ik').update(min=0.0, max=1.0, description='0 = FK, 1 = IK')
        ca = pb[f'{S}ForeArm'].constraints.new('IK'); ca.target = ob; ca.subtarget = f'ik_hand.{k}'; ca.chain_count = 2
        ca.pole_target = ob; ca.pole_subtarget = f'pole_elbow.{k}'; ca.pole_angle = math.radians(-90)
        ch = pb[f'{S}Hand'].constraints.new('COPY_ROTATION'); ch.target = ob; ch.subtarget = f'ik_hand.{k}'
        for con in (ca, ch):
            d = con.driver_add('influence').driver; d.type = 'AVERAGE'
            v = d.variables.new(); v.type = 'SINGLE_PROP'; v.targets[0].id = ob; v.targets[0].data_path = f'pose.bones["ik_hand.{k}"]["ik"]'
    bpy.ops.object.mode_set(mode='OBJECT')
    calibrate_poles(ob); finger_drivers(ob)
    for S in ('Left', 'Right'):            # xương phụ vai lấy 50 % góc xoay cục bộ của bắp tay ⇒ đỉnh vai gập trên dải rộng hơn
        c = ob.pose.bones[f'{S}ArmBlend'].constraints.new('COPY_ROTATION'); c.target = ob; c.subtarget = f'{S}Arm'
        c.owner_space = c.target_space = 'LOCAL'; c.influence = 0.5
    groups = {'Than': ('root', 'Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head'),
              'Tay_FK': tuple(f'{S}{n}' for S in ('Left', 'Right') for n in ('Shoulder', 'Arm', 'ArmBlend', 'ForeArm', 'Hand')),
              'Tay_IK': tuple(f'{n}.{k}' for k in 'LR' for n in ('ik_hand', 'pole_elbow')),
              'Ngon': tuple(f'{S}Hand{nm}{i}' for S in ('Left', 'Right') for nm in CH for i in (1, 2, 3)),
              'Chan_IK': tuple(f'{n}.{k}' for k in 'LR' for n in ('ik_foot', 'pole_knee')),
              'Chan_deform': tuple(f'{S}{n}' for S in ('Left', 'Right') for n in ('UpLeg', 'Leg', 'Foot', 'ToeBase'))}
    for nm, bones in groups.items():
        c = ad.collections.new(nm)
        for b in bones: c.assign(ad.bones[b])
    return ob


def calibrate_poles(ob):
    """Chọn pole_angle để IK không xoắn ở dáng nghỉ; mốc gối/khuỷu đã đặt hơi lệch về phía pole nên chiều gập là đúng.
    In thêm kiểm tra: ở dáng gập, khớp giữa phải nằm về phía pole (cos > 0,9)."""
    pb = ob.pose.bones
    for S, k in (('Left', 'L'), ('Right', 'R')):
        for mid, tgt, pole, ctl, pull in ((f'{S}Leg', f'ik_foot.{k}', f'pole_knee.{k}', None, (0, 0, 0.25)),
                                          (f'{S}ForeArm', f'ik_hand.{k}', f'pole_elbow.{k}', f'ik_hand.{k}', (-0.12 if k == 'L' else 0.12, 0, 0))):
            con = pb[mid].constraints['IK']; chain = (pb[mid].parent.name, mid)
            if ctl: pb[ctl]['ik'] = 1.0
            def err():
                bpy.context.view_layer.update()
                return sum(sum(abs(a - b) for ra, rb in zip(pb[n].matrix, pb[n].bone.matrix_local) for a, b in zip(ra, rb)) for n in chain)
            best = min(range(-180, 180, 2), key=lambda d: (setattr(con, 'pole_angle', math.radians(d)), err())[1])
            fine = min((best + q * 0.25 for q in range(-8, 9)), key=lambda d: (setattr(con, 'pole_angle', math.radians(d)), err())[1])
            con.pole_angle = math.radians(fine); e0 = err()
            t = pb[tgt]; t.location = t.bone.matrix_local.to_3x3().inverted() @ Vector(pull); bpy.context.view_layer.update()
            root = pb[mid].parent.head; m = pb[mid].head; e = pb[mid].tail; P = ob.matrix_world @ pb[pole].bone.head_local
            ax = (e - root).normalized(); proj = lambda q: (q - root) - ax * (q - root).dot(ax); cs = proj(m).normalized().dot(proj(P).normalized())
            t.location = (0, 0, 0)
            if ctl: pb[ctl]['ik'] = 0.0
            bpy.context.view_layer.update()
            print(f'  pole {mid}: {fine:.2f}°, sai lệch nghỉ {e0:.5f}, cos khớp→pole khi gập {cs:.3f}')
    bpy.context.view_layer.update()


def finger_drivers(ob):
    pb = ob.pose.bones
    for S, sx in (('Left', 1), ('Right', -1)):
        hb = pb[f'{S}Hand']
        for pr in ('nam',) + tuple(PROPS.values()):
            hb[pr] = 0.0; hb.id_properties_ui(pr).update(min=0.0, max=1.0, description='Nắm 0–1')
        for nm, angs in CURL.items():
            want = Vector((0, -1, -1)).normalized() if nm == 'Thumb' else Vector((0, -1, 0))   # lòng bàn tay hướng −Y
            for i, deg in enumerate(angs, 1):
                b = pb[f'{S}Hand{nm}{i}']
                best = None
                for ax in range(3):
                    for sg in (1, -1):
                        e = [0, 0, 0]; b.rotation_euler = e; bpy.context.view_layer.update(); t0 = b.tail.copy()
                        e[ax] = 0.3 * sg; b.rotation_euler = e; bpy.context.view_layer.update(); dv = (b.tail - t0).normalized().dot(want)
                        if best is None or dv > best[0]: best = (dv, ax, sg)
                b.rotation_euler = (0, 0, 0)
                _, ax, sg = best
                d = b.driver_add('rotation_euler', ax).driver; d.type = 'SCRIPTED'
                for vn, pr in (('n', 'nam'), ('m', PROPS[nm])):
                    v = d.variables.new(); v.name = vn; v.type = 'SINGLE_PROP'; v.targets[0].id = ob; v.targets[0].data_path = f'pose.bones["{S}Hand"]["{pr}"]'
                d.expression = f'{sg * math.radians(deg):.4f}*min(1.0, n + m)'
    bpy.context.view_layer.update()


def bind(sc, arm, body):
    t0 = time.time()
    proxy = bpy.data.objects.new('proxy_w', body.data.copy()); sc.collection.objects.link(proxy)
    rm = proxy.modifiers.new('Remesh', 'REMESH'); rm.mode = 'VOXEL'; rm.voxel_size = 0.004     # lưới Rodin không kín → bone heat thất bại; dùng lưới voxel kín
    dm = proxy.modifiers.new('Dec', 'DECIMATE'); dm.ratio = 0.3
    bpy.ops.object.select_all(action='DESELECT'); bpy.context.view_layer.objects.active = proxy; proxy.select_set(True)
    bpy.ops.object.modifier_apply(modifier=rm.name); bpy.ops.object.modifier_apply(modifier=dm.name)
    bpy.ops.object.select_all(action='DESELECT'); proxy.select_set(True); arm.select_set(True); bpy.context.view_layer.objects.active = arm
    bpy.ops.object.parent_set(type='ARMATURE_AUTO')
    nz = sum(1 for v in proxy.data.vertices if sum(g.weight for g in v.groups) > 1e-3)
    print(f'  bone heat trên {len(proxy.data.vertices)} đỉnh: {time.time() - t0:.1f}s, {len(proxy.vertex_groups)} nhóm, {nz} đỉnh có trọng số')
    for vg in proxy.vertex_groups:
        if vg.name not in body.vertex_groups: body.vertex_groups.new(name=vg.name)
    dt = body.modifiers.new('DT', 'DATA_TRANSFER'); dt.object = proxy; dt.use_vert_data = True; dt.data_types_verts = {'VGROUP_WEIGHTS'}
    dt.vert_mapping = 'POLYINTERP_NEAREST'; dt.layers_vgroup_select_src = 'ALL'; dt.layers_vgroup_select_dst = 'NAME'
    bpy.ops.object.select_all(action='DESELECT'); body.select_set(True); bpy.context.view_layer.objects.active = body
    bpy.ops.object.modifier_apply(modifier=dt.name)
    bpy.data.objects.remove(proxy, do_unlink=True)
    clean_weights(body)
    m = body.modifiers.new('Armature', 'ARMATURE'); m.object = arm
    co = mesh_co(body); ax = np.abs(co[:, 0]); z = co[:, 2]
    reg = ((z > 1.10) & (z < HEAD_Z) & (ax > 0.05) & (ax < 0.34)) | ((z > 0.68) & (z < 1.00) & (ax < 0.18))
    vg = body.vertex_groups.new(name='cs_vai_hang'); vg.add(np.nonzero(reg)[0].tolist(), 1.0, 'REPLACE')
    cs = body.modifiers.new('CorrectiveSmooth', 'CORRECTIVE_SMOOTH'); cs.iterations = 30; cs.smooth_type = 'LENGTH_WEIGHTED'
    cs.rest_source = 'ORCO'; cs.vertex_group = 'cs_vai_hang'; cs.use_only_smooth = False
    body.parent = arm; body.matrix_parent_inverse = arm.matrix_world.inverted()
    print(f'  gán trọng số xong sau {time.time() - t0:.1f}s')


def fill_missing(W, co, names, arm):
    """Đỉnh bone heat bỏ sót (tổng ≈ 0) hoặc vùng tay/chân bị gán nhầm cho thân: trọng số theo khoảng cách tới đoạn xương gần nhất."""
    segs = []
    for i, n in enumerate(names):
        b = arm.data.bones.get(n)
        if b and b.use_deform: segs.append((i, np.array(b.head_local), np.array(b.tail_local)))
    D = np.full((len(co), len(segs)), 9.0)
    for j, (i, h, t) in enumerate(segs):
        ab = t - h; tt = np.clip(((co - h) @ ab) / max(ab @ ab, 1e-12), 0, 1); D[:, j] = np.linalg.norm(co - (h + tt[:, None] * ab), axis=1)
    ax = np.abs(co[:, 0]); s = W.sum(1)
    miss = s < 1e-3
    limb = ax > 0.22                                                  # tay chữ T: mọi đỉnh ngoài vai phải theo xương tay
    side = np.sign(co[:, 0])
    ok_side = np.array([[not ((names[i].startswith('Left') and sd < 0) or (names[i].startswith('Right') and sd > 0)) for i, _, _ in segs] for sd in (-1, 1)])
    D = np.where(ok_side[(side > 0).astype(int)], D, 9.0)
    near = np.argsort(D, 1)[:, :2]; d0 = np.take_along_axis(D, near, 1)
    w = 1 / np.maximum(d0, 1e-4) ** 4; w /= w.sum(1, keepdims=True)
    G = np.zeros_like(W)
    for k in range(2):
        G[np.arange(len(co)), [segs[j][0] for j in near[:, k]]] += w[:, k]
    arm_cols = [i for i, n in enumerate(names) if any(k in n for k in ('Arm', 'Hand'))]
    wrong = limb & (W[:, arm_cols].sum(1) < 0.5 * np.maximum(s, 1e-9))
    fix = miss | wrong
    W[fix] = G[fix]
    print(f'  bổ sung trọng số theo khoảng cách: {int(miss.sum())} đỉnh thiếu, {int((wrong & ~miss).sum())} đỉnh tay gán nhầm')
    return W


def clean_weights(body):
    me = body.data; nv = len(me.vertices); names = [g.name for g in body.vertex_groups]; ng = len(names); I = {n: i for i, n in enumerate(names)}
    W = np.zeros((nv, ng), np.float32)
    for v in me.vertices:
        for g in v.groups: W[v.index, g.group] = g.weight
    co = mesh_co(body); x, y, z = co.T; ax = np.abs(x)
    arm_ob = body.parent if body.parent else bpy.data.objects['Nam_Rig']
    W = fill_missing(W, co, names, arm_ob)
    ea, eb = edges_np(me); deg = np.bincount(np.concatenate([ea, eb]), minlength=nv).astype(np.float32).clip(1)
    sm = lambda e0, e1, t: (lambda u: u * u * (3 - 2 * u))(np.clip((t - e0) / (e1 - e0), 0, 1))
    head = (z > HEAD_Z) & (ax < 0.2)
    arm_i = [i for n, i in I.items() if any(k in n for k in ('Shoulder', 'Arm', 'Hand'))]
    leg_i = [i for n, i in I.items() if any(k in n for k in ('UpLeg', 'Leg', 'Foot', 'ToeBase'))]
    trunk_i = [I[n] for n in ('Hips', 'Spine', 'Spine1', 'Spine2') if n in I]
    arm_zone = ax > 0.20                                                    # tay chữ T: ngoài vai
    leg_zone = z < 0.80

    crotch_w = 0.01 + 0.035 * sm(0.92, 0.84, z) * sm(0.66, 0.74, z)      # đáy háng: vùng chuyển trái–phải rộng ±4,5 cm thay vì ±1 cm

    def rules(W):
        fL = sm(-crotch_w, crotch_w, x)
        for n, i in I.items():
            if n.startswith('Left'): W[:, i] *= fL
            elif n.startswith('Right'): W[:, i] *= 1 - fL
        fa = sm(0.17, 0.26, ax)[:, None]                                    # chuyển tiếp mềm thân → tay (tránh rách ở vai)
        W[:, leg_i + trunk_i] *= (1 - fa)
        W[:, [i for i in arm_i if 'Shoulder' not in names[i]]] *= sm(0.09, 0.16, ax)[:, None]
        W[:, leg_i] *= sm(1.00, 0.88, z)[:, None]
        W[:, arm_i] *= np.maximum(sm(0.70, 0.85, z), sm(0.22, 0.30, ax))[:, None]
        W[head] = 0; W[head, I['Head']] = 1
        s = W.sum(1); W[s < 1e-6, I['Spine1']] = 1
        return W / W.sum(1, keepdims=True)

    def lap(W, mask, it, a):
        for _ in range(it):
            acc = np.stack([np.bincount(ea, W[eb, j], nv) + np.bincount(eb, W[ea, j], nv) for j in range(ng)], 1)
            W[mask] = (1 - a) * W[mask] + a * acc[mask] / deg[mask, None]
        return W
    W = rules(W); W = lap(W, ~head, 20, 0.5); W = rules(W)
    band = (~head) & (z > 1.30) & (ax < 0.10)                              # cổ: Spine2 → Neck → Head
    t = np.clip((z[band] - 1.30) / (HEAD_Z - 1.30), 0, 1); Wn = np.zeros((band.sum(), ng), np.float32)
    Wn[:, I['Spine2']] = np.clip(1 - 2 * t, 0, 1); Wn[:, I['Head']] = np.clip(2 * t - 1, 0, 1); Wn[:, I['Neck']] = 1 - Wn[:, I['Spine2']] - Wn[:, I['Head']]
    W[band] = Wn
    W = lap(W, (~head) & (z > 1.15) & (ax > 0.08) & (ax < 0.30), 60, 0.6)   # vai–nách
    W = lap(W, (~head) & (z > 0.70) & (z < 1.00) & (ax < 0.18), 60, 0.6)    # háng
    W = rules(W)
    W = lap(W, (~head) & (z > 1.12) & (ax > 0.12) & (ax < 0.32), 40, 0.5)   # làm mượt lại sau luật (vai)
    for S, sx in (('Left', 1), ('Right', -1)):                              # chia trọng số bắp tay gần vai cho xương phụ
        a_ = np.array(V('shoulder', sx)); b_ = np.array(V('elbow', sx)); ab = b_ - a_
        tt = ((co - a_) @ ab) / (ab @ ab); f = 0.7 * sm(0.45, 0.0, tt) * (sx * x > 0)
        u_, v_ = I[f'{S}Arm'], I[f'{S}ArmBlend']; mv = W[:, u_] * f; W[:, u_] -= mv; W[:, v_] += mv
    W = lap(W, (~head) & (z > 1.20) & (ax > 0.06) & (ax < 0.28), 150, 0.6)  # đỉnh vai: trải rộng chuyển tiếp Spine2–Shoulder–Arm để không gập nếp
    W = lap(W, (~head) & (z > 0.72) & (z < 0.98) & (ax < 0.18), 40, 0.5)   # làm mượt lại sau luật (háng)
    W = rules(W)
    # ngón: trọng số hình học theo đường tâm
    for S, sx in (('Left', 1), ('Right', -1)):
        H = (sx * x > 0.555)
        P = co[H] * np.array([sx, 1, 1]); n = len(P); Wh = np.zeros((n, ng), np.float32); D = []; U = []; S0 = []
        for nm, pts in CH.items():
            Q = np.array([p[:] for p in pts]); seg = np.diff(Q, axis=0); ln = np.linalg.norm(seg, axis=1); cum = np.r_[0, np.cumsum(ln)]
            dmin = np.full(n, 9.0); u = np.zeros(n)
            for j in range(3):
                tt = np.clip(((P - Q[j]) @ seg[j]) / ln[j] ** 2, 0, 1); d = np.linalg.norm(P - (Q[j] + tt[:, None] * seg[j]), axis=1)
                b = d < dmin; dmin[b] = d[b]; u[b] = cum[j] + tt[b] * ln[j]
            D.append(dmin); U.append((u, cum)); S0.append(((P - Q[0]) @ seg[0]) / ln[0])
        D = np.array(D); Aw = np.exp(-(D / 0.005) ** 2) + 1e-12; Aw /= Aw.sum(0)
        for c, nm in enumerate(CH):
            u, cum = U[c]; inside = sm(-0.010, 0.006, S0[c]) * (D[c] < 0.03); bl = 0.006
            wb = [sm(cum[1] + bl, cum[1] - bl, u), None, sm(cum[2] - bl, cum[2] + bl, u)]; wb[1] = 1 - wb[0] - wb[2]
            for i in range(3): Wh[:, I[f'{S}Hand{nm}{i + 1}']] += Aw[c] * inside * wb[i]
        Wh[:, I[f'{S}Hand']] += 1 - Wh.sum(1)
        al = sm(0.555, 0.575, P[:, 0])[:, None]
        W[H] = (1 - al) * W[H] + al * Wh
    crotch = (~head) & (ax < 0.06) & (z > 0.68) & (z < 0.88)               # đáy háng: pha 35 % Hips để da giữa hai chân không bị xé khi bước
    fc = (0.35 * sm(0.06, 0.02, ax) * sm(0.68, 0.74, z) * sm(0.88, 0.82, z))[:, None]
    eh = np.zeros(ng, np.float32); eh[I['Hips']] = 1; W = (1 - fc) * W + fc * eh
    W = lap(W, crotch, 60, 0.5)
    W = lap(W, (~head) & (z > 0.78) & (z < 1.02) & (ax < 0.18) & (y > 0.0), 120, 0.6)   # mông: chuyển Hips–UpLeg dài hơn cho dáng ngồi
    W = rules(W)
    W[W < 0.01] = 0; W /= W.sum(1, keepdims=True)
    for g in body.vertex_groups: g.remove(list(range(nv)))
    nz = np.nonzero(W > 1e-4)
    for vi, gj in zip(nz[0].tolist(), nz[1].tolist()): body.vertex_groups[gj].add([vi], float(W[vi, gj]), 'REPLACE')
    print(f'  trọng số: {len(nz[0]) / nv:.2f} xương/đỉnh; đầu cứng {int(head.sum())} đỉnh')


# ---- dáng thử (góc so với dáng chữ T) ----
def rot_world(arm, bn, axis, deg):
    pb = arm.pose.bones[bn]; bpy.context.view_layer.update()
    M = pb.matrix.copy(); h = M.translation.copy()
    pb.matrix = Matrix.Translation(h) @ Matrix.Rotation(math.radians(deg), 4, Vector(axis)) @ Matrix.Translation(-h) @ M
    bpy.context.view_layer.update()


def move_world(arm, bn, d):
    pb = arm.pose.bones[bn]; pb.location = pb.bone.matrix_local.to_3x3().inverted() @ Vector(d); bpy.context.view_layer.update()


def reset(arm):
    for b in arm.pose.bones: b.location = (0, 0, 0); b.rotation_euler = (0, 0, 0)
    for S in ('Left', 'Right'):
        for pr in ('nam',) + tuple(PROPS.values()): arm.pose.bones[f'{S}Hand'][pr] = 0.0
    bpy.context.view_layer.update()


def arms(arm, down_deg, fwd=0):
    for S, s in (('Left', 1), ('Right', -1)):
        rot_world(arm, f'{S}Arm', (0, 1, 0), s * down_deg)       # hạ tay (quay quanh trục trước–sau)
        if fwd: rot_world(arm, f'{S}Arm', (0, 0, 1), -s * fwd)


POSES = {
    'nghi_T': lambda a: None,
    'tay_buong': lambda a: arms(a, 80),
    'tay_xien_45': lambda a: arms(a, 45),
    'gio_tay_cao': lambda a: arms(a, -60),
    'khuyu_gap': lambda a: (arms(a, 70), [rot_world(a, f'{S}ForeArm', (1, 0, 0), -100) for S in ('Left', 'Right')]),
    'nam_tay': lambda a: (arms(a, 80), [a.pose.bones[f'{S}Hand'].__setitem__('nam', 1.0) for S in ('Left', 'Right')]),
    'quay_dau': lambda a: rot_world(a, 'Head', (0, 0, 1), 35),
    'cui_dau': lambda a: (rot_world(a, 'Neck', (1, 0, 0), 15), rot_world(a, 'Head', (1, 0, 0), 15)),
    'xoay_than': lambda a: (arms(a, 70), rot_world(a, 'Spine1', (0, 0, 1), 20), rot_world(a, 'Spine2', (0, 0, 1), 10)),
    'buoc_chan': lambda a: (arms(a, 80), move_world(a, 'ik_foot.L', (0, -0.22, 0.06)), move_world(a, 'ik_foot.R', (0, 0.12, 0)), move_world(a, 'Hips', (0, -0.04, -0.03))),
    'ngoi_xom': lambda a: (arms(a, 60, 40), move_world(a, 'Hips', (0, 0.10, -0.35)), rot_world(a, 'Spine', (1, 0, 0), 20)),
}


def apply_pose(arm, nm):
    reset(arm); POSES[nm](arm); bpy.context.view_layer.update()


def stretch(arm, body):
    def pos():
        dg = bpy.context.evaluated_depsgraph_get(); ev = body.evaluated_get(dg); me = ev.to_mesh()
        a = np.zeros(len(me.vertices) * 3); me.vertices.foreach_get('co', a); ev.to_mesh_clear(); return a.reshape(-1, 3)
    apply_pose(arm, 'nghi_T'); p0 = pos(); r0 = np.zeros(len(body.data.vertices) * 3); body.data.vertices.foreach_get('co', r0)
    print(f'  dáng nghỉ lệch tối đa {np.linalg.norm(p0 - r0.reshape(-1, 3), axis=1).max() * 1000:.2f} mm')
    ea, eb = edges_np(body.data); l0 = np.linalg.norm(p0[ea] - p0[eb], axis=1); ok = l0 > 1e-3
    for nm in POSES:
        apply_pose(arm, nm); p = pos(); st = np.where(ok, np.linalg.norm(p[ea] - p[eb], axis=1) / l0.clip(1e-6), 1)
        print(f'  {nm:12s} cạnh giãn >2×: {int((st > 2).sum()):5d}  max {st.max():.2f}×')
    apply_pose(arm, 'nghi_T')


def render_sheet(sc, arm, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 12; sc.cycles.use_denoising = False
    sc.render.resolution_x = 320; sc.render.resolution_y = 400
    w = bpy.data.worlds.new('xem'); sc.world = w; w.use_nodes = True
    w.node_tree.nodes['Background'].inputs[0].default_value = (.8, .8, .8, 1)
    cd = bpy.data.cameras.new('cam'); cd.type = 'ORTHO'; cd.ortho_scale = 2.0
    cam = bpy.data.objects.new('cam', cd); sc.collection.objects.link(cam); sc.camera = cam; arm.hide_render = True
    for nm in POSES:
        apply_pose(arm, nm)
        for view, ang in (('truoc', -90), ('cheo', -40)):
            a = math.radians(ang); t = Vector((0, 0, 0.88)); cam.location = t + Vector((3 * math.cos(a), 3 * math.sin(a), 0))
            cam.rotation_euler = (t - cam.location).to_track_quat('-Z', 'Y').to_euler()
            sc.render.filepath = os.path.join(out_dir, f'{nm}_{view}.png'); bpy.ops.render.render(write_still=True)
    apply_pose(arm, 'nghi_T'); bpy.data.objects.remove(cam); arm.hide_render = False


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--out', required=True); ap.add_argument('--glb'); ap.add_argument('--anh'); ap.add_argument('--src', default=SRC)
    a = ap.parse_args(argv)
    bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.abspath(a.src)); sc = bpy.context.scene
    body = next(o for o in bpy.data.objects if o.type == 'MESH')
    for o in [o for o in bpy.data.objects if o is not body]: bpy.data.objects.remove(o, do_unlink=True)
    body.name = 'Nam_Body'
    bpy.context.view_layer.objects.active = body; body.select_set(True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    import bmesh                                   # GLB tách đỉnh ở đường nối UV → hàn lại, nếu không đường nối sẽ hở khi biến dạng
    bm = bmesh.new(); bm.from_mesh(body.data); n0 = len(bm.verts)
    bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=1e-5); bm.to_mesh(body.data); body.data.update()
    print(f'  hàn đỉnh trùng: {n0} → {len(bm.verts)} đỉnh, cạnh hở còn {sum(e.is_boundary for e in bm.edges)}'); bm.free()
    measure_fingers(mesh_co(body))
    arm = build_armature(sc)
    bind(sc, arm, body)
    stretch(arm, body)
    if a.anh: render_sheet(sc, arm, os.path.abspath(a.anh))
    sc['ma_asset'] = 'NAM-002 / RIG'; sc['trang_thai'] = 'Rig thân/tay/ngón/chân, IK chân, IK/FK tay, tên Mixamo; chưa rig mặt; chưa nghiệm thu'
    bpy.ops.object.select_all(action='DESELECT'); arm.select_set(True); bpy.context.view_layer.objects.active = arm
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.out), compress=True)
    if a.glb:
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.export_scene.gltf(filepath=os.path.abspath(a.glb), export_format='GLB', export_animations=False)
    print('PASS: đã lưu', a.out)


main()
