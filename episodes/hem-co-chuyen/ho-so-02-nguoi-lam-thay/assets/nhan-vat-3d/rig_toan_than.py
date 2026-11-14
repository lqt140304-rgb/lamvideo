"""NAM — RIG TOÀN THÂN trên lưới liền da (thân cage nách mới + tay/chân nối liền: dung_cage_tay_chan.py).

Chạy:  bpyv/bin/python rig_toan_than.py --nguon Nam_lien_da.blend --blend Nam_RigToanThan.blend [--test DIR] [--samples 16]
Armature `Nam_Rig` (m, mặt −Y, trái nhân vật = +X ⇒ .L):
  root → pelvis → spine1 → spine2 → chest → neck → neck2 → head (+ brow/eye điều khiển mày, con ngươi)
  chest → clavicle → upper_arm → forearm → hand → index/middle/ring/pinky 1–3, thumb 1–3
  pelvis → thigh → shin → foot → toe;  điều khiển: ik_foot, pole_knee (IK chân), root
Xương thân/cổ/đầu/IK như rig_nam.py; vai/khuỷu/gối theo vòng cage; cổ tay → ngón và mắt cá → ngón chân theo rig thử cục bộ (rig_thu_tay_chan.py, đã kiểm).
Weights thân: theo vùng — thuộc tính 'tay'/'chan' của cage khuếch tán theo cạnh lưới (vai/háng), chuỗi sống chuyển mượt theo z; từ khuỷu/gối trở xuống thay bằng weights rig thử (lật gương cho bên phải); đầu = 100% head.
Điều khiển: hand.L/R['fist'], ['grip'] (0–1) lái các đốt ngón + ngón cái theo hệ số đã hiệu chỉnh trên lưới; Corrective Smooth gò ngón cái theo 'fist';
xương đòn tự nâng theo độ dạng cánh tay. Kiểm: --test (tư thế thử, giãn cạnh, ảnh). Chưa quần áo, chưa mí/miệng.
"""
import sys, os, math, argparse, time, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
import numpy as np
from mathutils import Vector, Matrix
import dung_than_nam as T
import dung_than_cage_nam as C
import dung_cage_tay_chan as N
import dung_tay_nam as HT
import dung_chan_nam as FT
import rig_nam as RN
import rig_thu_tay_chan as RT

KZ = T.KZ
P = RN.P
ss = N.ss
FINGERS = HT.FINGERS
# hệ số nắm/cầm cốc đã hiệu chỉnh trên lưới liền da (rig_thu_tay_chan.py, 14/11): độ cuộn từng ngón × CURL; ngón cái: euler thumb1 (độ) + cuộn thumb2/3
CAL = {'fist': dict(ks={'index': 1.00, 'middle': 1.00, 'ring': 0.98, 'pinky': 0.96}, th1=(-20, 40, 0), th23=(30, 35)),
       'grip': dict(ks={'index': 0.74, 'middle': 0.64, 'ring': 0.62, 'pinky': 0.62}, th1=(20, 40, 0), th23=(15, 15))}
SHOULDER = (0.145, 0.0, 0.808)      # khớp vai (đuôi xương đòn = đầu bắp tay)
HIP_Z = 0.540                        # tâm khớp háng
SPINE = ('pelvis', 'spine1', 'spine2', 'chest', 'neck', 'neck2', 'head')
JOINT_W = (0, 0.045, 0.045, 0.045, 0.02, 0.012, 0.010)   # nửa bề rộng dải chuyển tại khớp dưới của từng xương sống
ARM_DIFF, LEG_DIFF = 60, 80          # số vòng khuếch tán thuộc tính tay/chân (độ rộng dải chuyển vai/háng)
CROTCH_X = 0.035                     # bề rộng dải đáy háng theo pelvis
CLAV_W = 0.6                         # phần xương đòn ở bả vai


def _diffuse(x, ed, it):
    n = len(x); deg = np.bincount(ed.ravel(), minlength=n).clip(1); x = x.astype(float).copy()
    for _ in range(it): x = 0.5 * x + 0.5 * (np.bincount(ed[:, 0], weights=x[ed[:, 1]], minlength=n) + np.bincount(ed[:, 1], weights=x[ed[:, 0]], minlength=n)) / deg
    return x


# ================================================================== xương
def bone_table(F):
    """(tên, cha, đầu, đuôi, deform, roll_tới) — bên trái; bên phải lật X."""
    B = []
    A = lambda n, par, h, t, d=True, roll=None: B.append((n, par, Vector(h), Vector(t), d, roll))
    for n, par, h, t, d in RN.bone_table():                      # thân/cổ/đầu/mày/mắt/root như rig_nam
        if n in ('root', 'pelvis', 'spine1', 'spine2', 'chest', 'neck', 'neck2', 'head') or n.startswith(('brow.', 'eye.')): A(n, par, h, t, d)
    for s, k in ((1, 'L'), (-1, 'R')):
        M = lambda v: Vector((s * v[0], v[1], v[2])); R_ = lambda v: Vector((s * v[0], v[1], v[2])) if v is not None else None
        sh = M(SHOULDER); el = M(Vector(C.ARM_RINGS[-3]['c'])); wr = M(F['c_w']); kn = M(F['K'])
        A(f'clavicle.{k}', 'chest', P(s * 0.020, -0.004, 0.935), sh)
        A(f'upper_arm.{k}', f'clavicle.{k}', sh, el, True, Vector((0, 1, 0)))      # Z cục bộ → sau: X ≈ ngang (X = đưa trước/sau, Z = dạng/khép như rig_nam)
        A(f'forearm.{k}', f'upper_arm.{k}', el, wr, True, Vector((0, 1, 0)))
        A(f'hand.{k}', f'forearm.{k}', wr, kn, True, R_(F['N']))
        for fn, pts in F['fing'].items():
            A(f'{fn}1.{k}', f'hand.{k}', M(pts[0]), M(pts[1]), True, R_(F['N'])); A(f'{fn}2.{k}', f'{fn}1.{k}', M(pts[1]), M(pts[2]), True, R_(F['N']))
            A(f'{fn}3.{k}', f'{fn}2.{k}', M(pts[2]), M(pts[3]), True, R_(F['N']))
        tp = F['thumb']
        A(f'thumb1.{k}', f'hand.{k}', M(tp[0]), M(tp[1]), True, R_(F['N'])); A(f'thumb2.{k}', f'thumb1.{k}', M(tp[1]), M(tp[2]), True, R_(F['N']))
        A(f'thumb3.{k}', f'thumb2.{k}', M(tp[2]), M(tp[4]), True, R_(F['N']))
        hip = Vector((s * 0.0925, 0.0, HIP_Z)); kn_ = M(F['knee']); an = M(F['ankle']); ba = M(F['ball']); to = M(F['toe'])
        A(f'thigh.{k}', 'pelvis', hip, kn_); A(f'shin.{k}', f'thigh.{k}', kn_, an); A(f'foot.{k}', f'shin.{k}', an, ba); A(f'toe.{k}', f'foot.{k}', ba, to)
        A(f'ik_foot.{k}', 'root', an, ba, False)
        A(f'pole_knee.{k}', 'root', Vector((s * 0.0925, -0.45, kn_.z)), Vector((s * 0.0925, -0.50, kn_.z)), False)
    return B


def build_armature(sc, F):
    ad = bpy.data.armatures.new('Nam_Rig'); ob = bpy.data.objects.new('Nam_Rig', ad); sc.collection.objects.link(ob)
    bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.object.mode_set(mode='EDIT'); eb = ad.edit_bones; tab = bone_table(F)
    for n, par, h, t, d, roll in tab:
        b = eb.new(n); b.head = h; b.tail = t; b.use_deform = d
        if roll is not None: b.align_roll(roll)
    for n, par, h, t, d, roll in tab:
        if par:
            eb[n].parent = eb[par]
            if not n.startswith(('ik_', 'pole_', 'thigh', 'pelvis', 'thumb1', 'clavicle')) and not any(n.startswith(f + '1') for f in FINGERS):
                eb[n].use_connect = (eb[n].head - eb[par].tail).length < 1e-4
    bpy.ops.object.mode_set(mode='POSE'); pb = ob.pose.bones
    for b in pb: b.rotation_mode = 'XYZ'
    for k in ('L', 'R'):
        c = pb[f'shin.{k}'].constraints.new('IK'); c.target = ob; c.subtarget = f'ik_foot.{k}'; c.chain_count = 2
        c.pole_target = ob; c.pole_subtarget = f'pole_knee.{k}'; c.pole_angle = math.radians(-90)
        cf = pb[f'foot.{k}'].constraints.new('COPY_ROTATION'); cf.target = ob; cf.subtarget = f'ik_foot.{k}'
        for pn in (f'thigh.{k}', f'shin.{k}'): pb[pn].lock_ik_y = True
    bpy.ops.object.mode_set(mode='OBJECT')
    return ob


# ================================================================== weights
def limb_weights(P, tay, chan, F, ed):
    """Weights cẳng tay→ngón và cẳng chân→ngón chân như rig_thu_tay_chan.skin (bên trái, toạ độ thế giới); trả dict tên xương cục bộ → mảng, và 'khoa' (phần còn lại)."""
    n = len(P); W = {}; L = P[:, 0] > 0
    arm_m = L & (tay > 0.5); ue = (P - np.array(F['c_e'])) @ np.array(F['de']); fore = ss(-0.02, 0.02, ue) * arm_m
    u = (P - np.array(F['c_w'])) @ np.array(F['d']); hand = ss(-RT.WRIST_W, RT.WRIST_W, u) * fore
    W['forearm'] = fore - hand; lab = N.label_hand(P); Wh = np.zeros(n) + hand
    for fn in FINGERS:
        pts = F['fing'][fn]; s, _ = RT._arc(P, pts); seg = [np.linalg.norm(np.array(tuple(pts[i + 1] - pts[i]))) for i in range(3)]
        ws = RT._chain_w(s, [0.0, seg[0], seg[0] + seg[1]], [0.009, 0.008, 0.007]); m = hand * (lab == fn)
        for i in range(3): W[f'{fn}{i + 1}'] = ws[i] * m
        Wh -= (ws[0] + ws[1] + ws[2]) * m
    tp = F['thumb']; s, dist = RT._arc(P, tp[:4] + [tp[4]]); seg = [(tp[i + 1] - tp[i]).length for i in range(3)]
    ws = RT._chain_w(s, [0.0, seg[0] + 0.006, seg[0] + seg[1]], [0.012, 0.009, 0.006])
    near = hand * ((lab == 'thumb') | ((lab == 'palm') & (dist < RT.MOUND_R))); mound = np.where(lab == 'thumb', 1.0, RT.MOUND_W * ss(RT.MOUND_R, RT.MOUND_R0, dist))
    for i in range(3): W[f'thumb{i + 1}'] = ws[i] * near * mound
    Wh -= (ws[0] + ws[1] + ws[2]) * near * mound; W['hand'] = np.clip(Wh, 0, 1)
    leg_m = L & (chan > 0.5); knee = ss(0.02, -0.02, P[:, 2] - F['knee'].z) * leg_m
    foot = (1 - ss(RT.ANKLE_Z - RT.ANKLE_W[0], RT.ANKLE_Z + RT.ANKLE_W[1], P[:, 2])) * knee
    toe = ss(FT.BALL_Y + RT.TOE_W, FT.BALL_Y - RT.TOE_W, P[:, 1]) * foot
    W['shin'] = knee - foot; W['foot'] = foot - toe; W['toe'] = toe
    names = list(W); Mx = np.stack([W[k] for k in names], 1); deg = np.bincount(ed.ravel(), minlength=n).clip(1); limb = (arm_m | leg_m).astype(float)
    for _ in range(4):
        tot = Mx.sum(1, keepdims=True); khoa = np.clip(1 - tot, 0, 1); A_ = np.c_[Mx, khoa]; acc = np.zeros_like(A_)
        for j in range(A_.shape[1]): acc[:, j] = np.bincount(ed[:, 0], weights=A_[ed[:, 1], j], minlength=n) + np.bincount(ed[:, 1], weights=A_[ed[:, 0], j], minlength=n)
        A_ = A_ * (1 - 0.5 * limb[:, None]) + 0.5 * limb[:, None] * acc / deg[:, None]; A_ /= A_.sum(1, keepdims=True).clip(1e-9); Mx = A_[:, :-1]
    return {k: Mx[:, j] for j, k in enumerate(names)}, np.clip(1 - Mx.sum(1), 0, 1)


def bind(sc, arm, asm, F, proxy):
    t0 = time.time(); me = asm.data; n = len(me.vertices)
    # (1) thân: weights theo vùng (thuộc tính 'tay'/'chan' của cage, khuếch tán theo cạnh lưới — không rò qua khe nách/háng như bone heat)
    ed = np.array([e.vertices[:] for e in me.edges]); Pw = N._world(asm)
    tay = np.zeros(n); me.attributes['tay'].data.foreach_get('value', tay); chan = np.zeros(n); me.attributes['chan'].data.foreach_get('value', chan)
    a_s = ss(0.1, 0.9, _diffuse(tay, ed, ARM_DIFF)); l_s = ss(0.1, 0.9, _diffuse(chan, ed, LEG_DIFF))
    l_s *= 1 - (1 - ss(0.004, CROTCH_X, np.abs(Pw[:, 0]))) * ss(0.36, 0.42, Pw[:, 2])  # đáy háng giữa hai đùi theo pelvis: bước chân không xé đường giữa
    W = {}; z = Pw[:, 2]; J = [arm.data.bones[b].head_local.z for b in SPINE] + [T.RING_Z + 0.012]
    lo = np.ones(n)
    for i, b in enumerate(SPINE):                                                   # chuỗi sống: chuyển mượt quanh mỗi khớp theo z
        w = JOINT_W[i + 1] if i + 1 < len(JOINT_W) else 0.01
        up = ss(J[i + 1] - w, J[i + 1] + w, z) if i + 1 < len(SPINE) else np.zeros(n); W[b] = lo * (1 - up); lo = up
    tor = 1 - a_s - l_s
    for b in SPINE: W[b] = W[b] * tor
    for k, sg in (('L', 1.0), ('R', -1.0)):
        side = ss(-0.006, 0.006, sg * Pw[:, 0]); sh = np.array((sg * SHOULDER[0], SHOULDER[1], SHOULDER[2]))
        cl = CLAV_W * ss(0.085, 0.035, np.linalg.norm(Pw - sh, axis=1)) * side * (z > 0.70)
        for b in SPINE: W[b] = W[b] * (1 - cl)
        W[f'clavicle.{k}'] = tor * cl; W[f'upper_arm.{k}'] = a_s * side; W[f'thigh.{k}'] = l_s * side
    # (2) từ khuỷu/gối trở xuống: weights rig thử (bên trái, rồi lật gương cho bên phải); phần còn lại nhân với weights thân
    for k, sg in (('L', 1.0), ('R', -1.0)):
        Pm = Pw.copy(); Pm[:, 0] *= sg; Wl, khoa = limb_weights(Pm, tay, chan, F, ed); side = (Pw[:, 0] * sg > 0)
        f = np.where(side, khoa, 1.0)
        for b in W: W[b] = W[b] * f
        for b, w in Wl.items(): W[f'{b}.{k}'] = W.get(f'{b}.{k}', 0) + np.where(side, w, 0)
    names = list(W); H = np.stack([W[b] for b in names], 1); H /= H.sum(1, keepdims=True).clip(1e-9)
    asm.vertex_groups.clear()
    for j, nm in enumerate(names):
        if nm not in arm.data.bones: continue
        g = asm.vertex_groups.new(name=nm); nz = np.nonzero(H[:, j] > 0.001)[0]
        for vi in nz.tolist(): g.add([vi], float(H[vi, j]), 'REPLACE')
    head = asm.vertex_groups['head']; others = [g for g in asm.vertex_groups if g.name != 'head']
    top = np.nonzero(Pw[:, 2] > T.RING_Z + 0.012)[0].tolist()
    for g in others: g.remove(top)
    head.add(top, 1.0, 'REPLACE')
    # (3) modifiers: Armature → Corrective Smooth nách/háng (như rig_nam) → Corrective Smooth gò ngón cái theo 'fist' (mỗi bên)
    for m in list(asm.modifiers): asm.modifiers.remove(m)
    md = asm.modifiers.new('Armature', 'ARMATURE'); md.object = arm; asm.parent = arm
    xs, zs = np.abs(Pw[:, 0]), Pw[:, 2]
    body_cs = ((zs > 0.62) & (zs < 0.92) & (xs > 0.05) & (xs < 0.22)) | ((zs > 0.26) & (zs < 0.58) & (xs < 0.16))
    g = asm.vertex_groups.new(name='corr_body'); g.add(np.nonzero(body_cs)[0].tolist(), 1.0, 'REPLACE')
    cs = asm.modifiers.new('CS_corr_body', 'CORRECTIVE_SMOOTH'); cs.factor = 1.0; cs.iterations = 250; cs.smooth_type = 'LENGTH_WEIGHTED'; cs.rest_source = 'ORCO'; cs.vertex_group = 'corr_body'
    col = {nm: np.zeros(n) for nm in [g.name for g in asm.vertex_groups]}
    for v in me.vertices:
        for gg in v.groups: col[asm.vertex_groups[gg.group].name][v.index] = gg.weight
    for k, sg in (('L', 1.0), ('R', -1.0)):
        u_ = (Pw - np.array((sg * F['c_w'].x, F['c_w'].y, F['c_w'].z))) @ np.array((sg * F['d'].x, F['d'].y, F['d'].z))
        dm_hand = col[f'hand.{k}'] > 0.5
        w = np.maximum(np.clip(col[f'thumb1.{k}'] * 3 + col[f'thumb2.{k}'] * RT.CS_T2, 0, 1), (dm_hand & (u_ > 0.03)).astype(float) * RT.CS_PALM)
        g = asm.vertex_groups.new(name=f'cs_tay.{k}'); nz = np.nonzero(w > 0.01)[0]
        for vi in nz.tolist(): g.add([vi], float(w[vi]), 'REPLACE')
        c2 = asm.modifiers.new(f'CS_tay.{k}', 'CORRECTIVE_SMOOTH'); c2.vertex_group = f'cs_tay.{k}'; c2.iterations = RT.CS_ITER; c2.factor = 0.0; c2.rest_source = 'ORCO'; c2.smooth_type = 'LENGTH_WEIGHTED'
    print(f'    weights xong sau {time.time() - t0:.0f}s; đỉnh thiếu weight: {int((H.sum(1) < 0.99).sum())}/{n}')


# ================================================================== điều khiển
def _drv(owner, path, idx, expr, vars_):
    d = owner.driver_add(path, idx).driver; d.type = 'SCRIPTED'
    for vn, (idb, dp) in vars_.items():
        v = d.variables.new(); v.name = vn; v.type = 'SINGLE_PROP'; v.targets[0].id = idb; v.targets[0].data_path = dp
    d.expression = expr


def controls(arm, asm, F):
    pb = arm.pose.bones
    for k, sg in (('L', 1.0), ('R', -1.0)):
        # xương đòn tự nâng theo độ dạng cánh tay (như rig_nam)
        zs = {}
        for ax in 'XYZ':
            pbc = pb[f'clavicle.{k}']; pbc.rotation_euler = (0, 0, 0); b0 = RN._world_head(arm, f'upper_arm.{k}').z; e = [0, 0, 0]; e['XYZ'.index(ax)] = 0.2; pbc.rotation_euler = e
            zs[ax] = RN._world_head(arm, f'upper_arm.{k}').z - b0; pbc.rotation_euler = (0, 0, 0)
        ax_c = max(zs, key=lambda a_: abs(zs[a_])); lc = 1.0 if zs[ax_c] > 0 else -1.0
        pbu = pb[f'upper_arm.{k}']; x0 = abs(RN._world_head(arm, f'forearm.{k}').x); pbu.rotation_euler = (0, 0, 0.3); x1 = abs(RN._world_head(arm, f'forearm.{k}').x); pbu.rotation_euler = (0, 0, 0)
        up_s = 1.0 if x1 > x0 else -1.0
        _drv(pb[f'clavicle.{k}'], 'rotation_euler', 'XYZ'.index(ax_c), f'{lc * 0.15:.3f}*min(2.0, max(0, {up_s:.0f}*v))', {'v': (arm, f'pose.bones["upper_arm.{k}"].rotation_euler[2]')})
        # nắm / cầm cốc: trục cuộn đo thực nghiệm (đuôi xương đi về phía lòng tay)
        hb = pb[f'hand.{k}']; Nw = Vector((sg * F['N'].x, F['N'].y, F['N'].z))
        for p_ in ('fist', 'grip'):
            hb[p_] = 0.0
            try: hb.id_properties_ui(p_).update(min=0.0, max=1.0, soft_min=0.0, soft_max=1.0, description={'fist': 'Nắm tay 0–1', 'grip': 'Cầm cốc 0–1'}[p_])
            except Exception: pass
        hv = {'f': (arm, f'pose.bones["hand.{k}"]["fist"]'), 'g': (arm, f'pose.bones["hand.{k}"]["grip"]')}
        for fn in FINGERS:
            for i in (1, 2, 3):
                ax, sgn = RT.local_axis(arm, f'{fn}{i}.{k}', Nw)
                cf = sgn * math.radians(RT.CURL['fist'][i - 1] * CAL['fist']['ks'][fn]); cg = sgn * math.radians(RT.CURL['grip'][i - 1] * CAL['grip']['ks'][fn])
                _drv(pb[f'{fn}{i}.{k}'], 'rotation_euler', ax, f'f*{cf:.4f}+g*{cg:.4f}', hv)
        mir = (1, -1, -1) if sg < 0 else (1, 1, 1)           # euler thumb1 hiệu chỉnh ở tay trái; tay phải lật gương (đổi dấu quay quanh Y, Z cục bộ)
        for ax in range(3):
            a_f = math.radians(CAL['fist']['th1'][ax]) * mir[ax]; a_g = math.radians(CAL['grip']['th1'][ax]) * mir[ax]
            _drv(pb[f'thumb1.{k}'], 'rotation_euler', ax, f'f*{a_f:.4f}+g*{a_g:.4f}', hv)
        for i in (2, 3):
            ax, sgn = RT.local_axis(arm, f'thumb{i}.{k}', Nw)
            _drv(pb[f'thumb{i}.{k}'], 'rotation_euler', ax, f'f*{sgn * math.radians(CAL["fist"]["th23"][i - 2]):.4f}+g*{sgn * math.radians(CAL["grip"]["th23"][i - 2]):.4f}', hv)
        _drv(asm.modifiers[f'CS_tay.{k}'], 'factor', -1, 'f', {'f': hv['f']})        # Corrective Smooth gò ngón cái theo mức nắm
    ad = arm.data; groups = {'Than': ('pelvis', 'spine1', 'spine2', 'chest', 'neck', 'neck2', 'head'),
                             'Tay': tuple(f'{n}.{k}' for k in 'LR' for n in ('clavicle', 'upper_arm', 'forearm', 'hand')),
                             'Ngon': tuple(f'{n}{i}.{k}' for k in 'LR' for n in FINGERS + ('thumb',) for i in (1, 2, 3)),
                             'Chan_IK': tuple(f'{n}.{k}' for k in 'LR' for n in ('ik_foot', 'pole_knee')) + ('root',),
                             'Chan_deform': tuple(f'{n}.{k}' for k in 'LR' for n in ('thigh', 'shin', 'foot', 'toe')), 'Mat': tuple(f'{n}.{k}' for k in 'LR' for n in ('brow', 'eye'))}
    for nm, bones in groups.items():
        c = ad.collections.new(nm)
        for b in bones: c.assign(ad.bones[b])
    bpy.context.view_layer.update()


# ================================================================== tư thế thử
POSES = {k: v for k, v in RN.POSES.items() if k not in ('nam_tay', 'nam_tay_chat')}
POSES.update({'nam_tay_chat': 'fist', 'cam_coc': 'grip',
              'gio_tay_cao': {'upper_arm.L': ('Z', -130), 'upper_arm.R': ('Z', 130)},   # bắp tay nghỉ đã nghiêng ~20°: 130° ⇒ tay gần thẳng đứng
              'gap_co_tay': {'hand.L': ('Z', 0), 'hand.R': ('Z', 0)}})      # đặt trục thật lúc chạy (gập về lòng tay 45°); nhấc gót đã kiểm ở rig thử cục bộ
SHEET = ('nghi', 'tay_nang_45', 'gio_tay_cao', 'tay_truoc', 'khuyu_gap', 'nam_tay_chat', 'cam_coc', 'cui_dau', 'quay_dau', 'xoay_thun', 'gap_hong', 'ngoi', 'buoc_chan', 'gap_co_tay')


def apply_pose(arm, name, F=None):
    pb = arm.pose.bones
    for b in pb:
        b.location = (0, 0, 0)
        if not b.name.startswith(('clavicle',)): b.rotation_euler = (0, 0, 0)
        for p_ in ('fist', 'grip'):
            if p_ in b.keys(): b[p_] = 0.0
    spec = POSES[name]
    if spec == 'fist' or spec == 'grip':
        for k in 'LR': pb[f'hand.{k}'][spec] = 1.0
        pb['upper_arm.L'].rotation_euler = (math.radians(-40), 0, 0); pb['upper_arm.R'].rotation_euler = (math.radians(-40), 0, 0)
        pb['forearm.L'].rotation_euler = (math.radians(-50), 0, 0); pb['forearm.R'].rotation_euler = (math.radians(-50), 0, 0)   # đưa tay ra trước để thấy bàn tay
    elif name == 'gap_co_tay':
        for k, sg in (('L', 1.0), ('R', -1.0)):
            ax, s_ = RT.local_axis(arm, f'hand.{k}', Vector((sg * F['N'].x, F['N'].y, F['N'].z))); e = [0, 0, 0]; e[ax] = s_ * math.radians(45); pb[f'hand.{k}'].rotation_euler = e
    elif spec in ('sit', 'step'):
        RN.apply_pose.__globals__['POSES'] = RN.POSES; RN.apply_pose(arm, name)
    else:
        for bn, (ax, deg) in spec.items():
            e = list(pb[bn].rotation_euler); e['XYZ'.index(ax)] = math.radians(deg); pb[bn].rotation_euler = e
    bpy.context.view_layer.update()


def stretch(arm, asm, names, F):
    def pos():
        dg = bpy.context.evaluated_depsgraph_get(); ev = asm.evaluated_get(dg); me = ev.to_mesh(); a = np.zeros(len(me.vertices) * 3); me.vertices.foreach_get('co', a); ev.to_mesh_clear(); return a.reshape(-1, 3)
    apply_pose(arm, 'nghi', F); p0 = pos(); ed = np.array([e.vertices[:] for e in asm.data.edges]); l0 = np.linalg.norm(p0[ed[:, 0]] - p0[ed[:, 1]], axis=1); ok = l0 > 0.5 * np.median(l0); res = {}
    for nm in names:
        apply_pose(arm, nm, F); p = pos(); st = np.where(ok, np.linalg.norm(p[ed[:, 0]] - p[ed[:, 1]], axis=1) / l0.clip(1e-9), 1.0)
        bad = np.nonzero(st > 2.0)[0]; cb = np.nonzero(st < 0.4)[0]
        reg = '-' if not len(bad) else f'z {p0[ed[bad, 0], 2].min():.2f}-{p0[ed[bad, 0], 2].max():.2f} |x| {np.abs(p0[ed[bad, 0], 0]).min():.2f}-{np.abs(p0[ed[bad, 0], 0]).max():.2f}'
        res[nm] = dict(gian=int(len(bad)), gian_max=round(float(st.max()), 2), co=int(len(cb)), co_min=round(float(st[ok].min()), 2), vung=reg)
        print(f'    {nm:14s} giãn > 2×: {len(bad):5d} (max {st.max():.2f}×)  co < 0,4×: {len(cb):5d} (min {st[ok].min():.2f}×)  vùng giãn {reg}')
    apply_pose(arm, 'nghi', F); return res


def render_sheet(sc, arm, F, out, samples):
    os.makedirs(out, exist_ok=True); sc.cycles.samples = samples; sc.render.resolution_x, sc.render.resolution_y = 480, 820; files = []
    for name in SHEET:
        apply_pose(arm, name, F)
        for vn, loc in (('truoc', (0.0, -6.0, 0.80)), ('nghieng', (6.0, -1.2, 0.80))):
            sc.camera = T.cam(sc, f'c_{name}_{vn}', loc, (0, 0, 0.78), 1.75); sc.render.filepath = os.path.join(out, f'{name}_{vn}.png'); bpy.ops.render.render(write_still=True); files.append(sc.render.filepath)
    apply_pose(arm, 'nghi', F); return files


# ================================================================== chạy
def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--nguon', required=True); ap.add_argument('--blend', default=''); ap.add_argument('--test', default='')
    ap.add_argument('--samples', type=int, default=16); ap.add_argument('--proxy', type=float, default=0.5)
    a = ap.parse_args(argv)
    bpy.ops.wm.open_mainfile(filepath=os.path.abspath(a.nguon)); sc = bpy.context.scene
    for o in list(sc.objects):
        if o.type in ('LIGHT', 'CAMERA'): bpy.data.objects.remove(o, do_unlink=True)
    T.lights(sc)
    asm = bpy.data.objects['Nam_Dau_Than']; F = RT.frames()
    arm = build_armature(sc, F); bind(sc, arm, asm, F, a.proxy); controls(arm, asm, F)
    RN.attach_head(arm, sc); RN.attach_face_controls(arm)
    if a.blend: os.makedirs(os.path.dirname(os.path.abspath(a.blend)), exist_ok=True); bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))
    if a.test:
        res = stretch(arm, asm, list(POSES), F)
        with open(os.path.join(a.test, 'gian.json') if os.path.isdir(a.test) else a.test + '_gian.json', 'w') as fh: json.dump(res, fh, ensure_ascii=False, indent=1)
        print('ảnh:', len(render_sheet(sc, arm, F, a.test, a.samples)))


if __name__ == '__main__':
    main()
