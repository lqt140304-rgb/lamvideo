"""Bàn tay riêng của Nam (cách B trong THIET-KE-TAY-CHAN.md): dựng, rig thử, kiểm tư thế, render bảng.

Toạ độ trùng tay trái của Nam (+X, cổ tay ≈ (0.236, -0.008, 0.545), ngón chỉ xuống -Z, lòng tay quay vào thân -X, ngón cái phía trước -Y)
để sau này gắn vào rig không phải dời. Tay phải = lật gương X.

Chạy:  bpyv/bin/python dung_tay_nam.py --blend OUT.blend --render DIR --samples 24 --check
"""
import sys, os, math, argparse, itertools
import bpy, bmesh
import numpy as np
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree

FINGERS = ('index', 'middle', 'ring', 'pinky')
HAND_POSES = ('tha_long', 'nam_tay', 'cam_coc', 'xoe')


# ---------------------------------------------------------------- khung bàn tay
WRIST = Vector((0.236, -0.008, 0.545))                      # cổ tay trái của Nam (đầu xương hand trong rig_nam)
_D = Vector((0.020, -0.005, -0.083)).normalized()           # hướng ngón (xuống, hơi toè ra ngoài như tay Nam)
_S0 = Vector((0.0, 1.0, 0.0))                               # hướng ngang lòng tay: từ ngón trỏ (-Y, trước) sang ngón út (+Y)
_N = _S0.cross(_D).normalized()                             # pháp tuyến phía LÒNG tay (quay vào thân: x âm)
if _N.x > 0: _N = -_N
_S = _D.cross(_N).normalized()
if _S.y < 0: _S = -_S

PALM_L = 0.082        # dài lòng tay (cổ tay → khớp gốc ngón)
PALM_HW = 0.070       # nửa bề ngang lòng tay ở khớp gốc ngón
PALM_HT = 0.027       # nửa bề dày lòng tay
WRIST_R = 0.033       # bán kính đoạn cổ tay (khớp cẳng tay Nam ≈ 0,034)
#            v (ngang)  dài    r gốc   r đầu
FINGER_DEF = {'index': (-0.054, 0.068, 0.0158, 0.0145), 'middle': (-0.018, 0.074, 0.0162, 0.0148),   # tâm cách nhau 36 mm, ngón Ø ~31–32 mm → khe ~4–5 mm
              'ring':  (0.018, 0.070, 0.0158, 0.0145), 'pinky':  (0.053, 0.058, 0.0148, 0.0136)}           # (bản đầu Ø 34 mm cách 34 mm → các ngón dính nhau)
SEG = (0.40, 0.32, 0.28)          # tỉ lệ 3 đốt
KNUCKLE_U = 0.076                 # khớp gốc ngón nằm hơi lùi trong lòng tay
# ngón cái: khối gốc + 3 điểm khớp (u, v, w) — lệch ra trước mặt lòng tay (w > 0), không cắm ngang
THUMB_PTS = [(0.012, -0.045, 0.010), (0.035, -0.071, 0.022), (0.051, -0.085, 0.032), (0.065, -0.092, 0.039)]   # gọn hơn bản đầu ~10%
THUMB_R = (0.020, 0.0190, 0.0172, 0.0156)


def L(u, v, w, sx=1.0):
    p = WRIST + _D * u + _S * v + _N * w
    return Vector((p.x * sx, p.y, p.z))


def _loft(bm, pts, rads, nseg=20):
    """Ống tròn qua các điểm (đã ở toạ độ thế giới), nắp bán cầu ở hai đầu."""
    pts = [Vector(p) for p in pts]; rings = []
    def frame(t):
        a = Vector((0, 0, 1)) if abs(t.z) < 0.9 else Vector((1, 0, 0)); x = t.cross(a).normalized(); return x, t.cross(x).normalized()
    seq = []
    t0 = (pts[1] - pts[0]).normalized(); t1 = (pts[-1] - pts[-2]).normalized()
    for k in range(1, 6):          # nắp đầu gốc
        ang = math.pi / 2 * (1 - k / 6); seq.append((pts[0] - t0 * rads[0] * math.sin(ang), rads[0] * math.cos(ang), t0))
    for i, p in enumerate(pts):
        t = (pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]).normalized(); seq.append((p, rads[i], t))
    for k in range(1, 6):          # nắp đầu ngón
        ang = math.pi / 2 * k / 6; seq.append((pts[-1] + t1 * rads[-1] * math.sin(ang), rads[-1] * math.cos(ang), t1))
    prev = None
    for c, r, t in seq:
        x, y = frame(t); ring = [bm.verts.new(c + (x * math.cos(2 * math.pi * j / nseg) + y * math.sin(2 * math.pi * j / nseg)) * r) for j in range(nseg)]
        if prev:
            for j in range(nseg): bm.faces.new((prev[j], prev[(j + 1) % nseg], ring[(j + 1) % nseg], ring[j]))
        prev = ring; rings.append(ring)
    bm.faces.new(list(reversed(rings[0]))); bm.faces.new(rings[-1])


def finger_pts(name, sx=1.0):
    v, ln, r0, r1 = FINGER_DEF[name]; u0 = KNUCKLE_U; us = [u0, u0 + ln * SEG[0], u0 + ln * (SEG[0] + SEG[1]), u0 + ln]
    curve = [0.0, 0.002, 0.004, 0.005]                                    # ngón hơi cong nhẹ về phía lòng tay khi thả
    return [L(u, v, curve[i], sx) for i, u in enumerate(us)], [r0, r0 * 0.96 + r1 * 0.04, r0 * 0.5 + r1 * 0.5, r1]


def _ring_frame(sx):
    s = Vector((_S.x * sx, _S.y, _S.z)); n = Vector((_N.x * sx, _N.y, _N.z)); return s, n


def _loft_sections(bm, sec, sx, nseg=48, cap_end=0.0):
    """Nối các lát cắt siêu elip vuông góc hướng ngón; đóng nắp phẳng ở cổ tay, nắp vòm (cap_end) ở phía ngón."""
    s, n = _ring_frame(sx); rings = []
    def ring(u, a, b, e, shrink=1.0):
        out = []
        for j in range(nseg):
            t = 2 * math.pi * j / nseg; c, si = math.cos(t), math.sin(t)
            x = a * shrink * math.copysign(abs(c) ** (2 / e), c); y = b * shrink * math.copysign(abs(si) ** (2 / e), si)
            out.append(bm.verts.new(L(u, 0, 0, sx) + s * x + n * y))
        return out
    for u, a, b, e in sec: rings.append(ring(u, a, b, e))
    u, a, b, e = sec[-1]
    for k in range(1, 5):
        ang = math.pi / 2 * k / 5; rings.append(ring(u + cap_end * math.sin(ang), a, b, e, math.cos(ang)))
    for r0, r1 in zip(rings, rings[1:]):
        for j in range(nseg): bm.faces.new((r0[j], r0[(j + 1) % nseg], r1[(j + 1) % nseg], r1[j]))
    bm.faces.new(list(reversed(rings[0]))); bm.faces.new(rings[-1])


def _ellipsoid(bm, c, axis, radii, sx):
    """Elip 3 trục: trục chính theo `axis` (toạ độ u,v,w của khung tay)."""
    s, n = _ring_frame(sx); d = Vector((_D.x * sx, _D.y, _D.z))
    a = (d * axis.x + s * axis.y + n * axis.z).normalized(); b = n - a * n.dot(a); b.normalize(); c3 = a.cross(b)
    res = bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=16, radius=1.0)
    M = Matrix((a * radii[0], c3 * radii[1], b * radii[2])).transposed()
    for v in res['verts']: v.co = c + M @ v.co


def build_shape(side='L', voxel=0.0012):
    sx = 1.0 if side == 'L' else -1.0
    # (1) lòng tay + cổ tay: các lát cắt chữ nhật bo tròn (siêu elip) nối dọc cổ tay → khớp gốc ngón
    me = bpy.data.meshes.new(f'Tay_Nam.{side}'); ob = bpy.data.objects.new(f'Tay_Nam.{side}', me); bpy.context.scene.collection.objects.link(ob)
    bm = bmesh.new()
    #        u       nửa ngang   nửa dày   số mũ (2 = elip, lớn = vuông)
    SEC = [(-0.034, WRIST_R, WRIST_R, 2.0), (-0.010, WRIST_R, WRIST_R * 0.96, 2.0), (0.008, 0.042, 0.026, 2.3), (0.028, 0.056, 0.027, 2.8),
           (0.050, 0.066, 0.027, 3.2), (0.068, PALM_HW, 0.026, 3.4), (0.080, 0.068, 0.023, 3.0)]
    _loft_sections(bm, SEC, sx, cap_end=0.008)
    # gò ngón cái: khối elip phồng ở cạnh lòng tay phía trước, lệch về mặt lòng tay
    p0, p1 = Vector(THUMB_PTS[0]), Vector(THUMB_PTS[1]); pm = p0 * 0.45 + p1 * 0.55
    _ellipsoid(bm, L(pm.x, pm.y, pm.z, sx), (p1 - p0), (0.027, 0.019, 0.017), sx)
    bm.to_mesh(me); bm.free()
    # (2) bốn ngón + hai đốt ngoài ngón cái: ống tròn đầu bo
    bm = bmesh.new(); bm.from_mesh(me)
    for f in FINGERS:
        pts, rads = finger_pts(f, sx); start = L(KNUCKLE_U - 0.020, FINGER_DEF[f][0], -0.002, sx)
        _loft(bm, [start] + pts, [rads[0]] + rads)
    tp = [L(*t, sx) for t in THUMB_PTS]; _loft(bm, tp[1:], list(THUMB_R[1:]))
    bm.to_mesh(me); bm.free()
    # (3) hợp khối + mượt
    md = ob.modifiers.new('rm', 'REMESH'); md.mode = 'VOXEL'; md.voxel_size = voxel; md.use_smooth_shade = True
    bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.object.modifier_apply(modifier='rm')
    _smooth_roots(ob, sx)
    for p in me.polygons: p.use_smooth = True
    return ob


def _uvw(co, sx):
    p = Vector((co.x * sx, co.y, co.z)) - WRIST; return p.dot(_D), p.dot(_S), p.dot(_N)


def _smooth_roots(ob, sx):
    """Mượt chung nhẹ + mượt thêm ở gốc ngón và gốc ngón cái (chỗ ống ngón gặp lòng tay) để khối nối mềm."""
    bm = bmesh.new(); bm.from_mesh(ob.data)
    for _ in range(2): bmesh.ops.smooth_vert(bm, verts=bm.verts, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
    roots = []
    for v in bm.verts:
        u, s_, w = _uvw(v.co, sx)
        if 0.060 < u < 0.092 or (s_ < -0.055 and 0.025 < u < 0.060): roots.append(v)
    for _ in range(10): bmesh.ops.smooth_vert(bm, verts=roots, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
    bm.to_mesh(ob.data); bm.free(); ob.data.update()


# ---------------------------------------------------------------- rig thử
def build_rig(side='L'):
    sx = 1.0 if side == 'L' else -1.0; n = Vector((_N.x * sx, _N.y, _N.z))
    ad = bpy.data.armatures.new(f'Rig_Tay.{side}'); arm = bpy.data.objects.new(f'Rig_Tay.{side}', ad); bpy.context.scene.collection.objects.link(arm)
    bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode='EDIT'); eb = ad.edit_bones
    def B(name, parent, h, t):
        b = eb.new(f'{name}.{side}'); b.head, b.tail = h, t; b.align_roll(n)
        if parent: b.parent = eb[f'{parent}.{side}']; b.use_connect = (b.parent.tail - b.head).length < 1e-5
        return b
    B('hand', None, L(0, 0, 0, sx), L(KNUCKLE_U, 0, 0, sx))
    for f in FINGERS:
        pts, _ = finger_pts(f, sx); B(f'{f}1', 'hand', pts[0], pts[1]); B(f'{f}2', f'{f}1', pts[1], pts[2]); B(f'{f}3', f'{f}2', pts[2], pts[3])
    tp = [L(*t, sx) for t in THUMB_PTS]; tip = tp[3] + (tp[3] - tp[2]).normalized() * THUMB_R[3] * 0.8
    B('thumb1', 'hand', tp[0], tp[1]); B('thumb2', 'thumb1', tp[1], tp[2]); B('thumb3', 'thumb2', tp[2], tip)
    for b in eb:
        if b.name.startswith('thumb'): b.align_roll(n)
    bpy.ops.object.mode_set(mode='OBJECT')
    for pb in arm.pose.bones: pb.rotation_mode = 'XYZ'
    return arm


def _seg_dist(P, a, b):
    ab = b - a; t = np.clip(((P - a) @ ab) / (ab @ ab), 0, 1); return np.linalg.norm(P - (a + t[:, None] * ab), axis=1)


def _ss(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)


def _poly_param(P, pts):
    """Tham số độ dài cung của điểm gần nhất trên đường gấp khúc (cho phép âm trước điểm đầu) và khoảng cách vuông góc."""
    best_d = np.full(len(P), np.inf); best_s = np.zeros(len(P)); acc = 0.0
    for k in range(len(pts) - 1):
        a, b = pts[k], pts[k + 1]; ab = b - a; ln = np.linalg.norm(ab); t = ((P - a) @ ab) / (ln * ln)
        tc = np.clip(t, 0 if k else -np.inf, 1 if k < len(pts) - 2 else np.inf)
        d = np.linalg.norm(P - (a + tc[:, None] * ab), axis=1); m = d < best_d
        best_d[m] = d[m]; best_s[m] = acc + tc[m] * ln; acc += ln
    return best_s, best_d


def skin(ob, arm, side='L'):
    """Trọng số bone heat của Blender (kẽ ngón chuyển mềm tự nhiên). Đã thử 2 cách tự tính theo khoảng cách → nắm tay giãn 7–12×."""
    apply_hand_pose(arm, None)
    bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True); arm.select_set(True); bpy.context.view_layer.objects.active = arm
    bpy.ops.object.parent_set(type='ARMATURE_AUTO')
    m = ob.modifiers['Armature']
    cs = ob.modifiers.new('CS', 'CORRECTIVE_SMOOTH'); cs.iterations = 60; cs.factor = 1.0; cs.rest_source = 'ORCO'; cs.smooth_type = 'LENGTH_WEIGHTED'


# ---------------------------------------------------------------- tư thế (thuộc tính trên xương hand → các đốt)
#                     đốt1 đốt2 đốt3 (độ, cuộn vào lòng tay)
CURL = {'fist': (62, 72, 54), 'grip': (40, 50, 35), 'relax': (12, 18, 10)}
THUMB_CURL = {'fist': (35, 40, 45), 'grip': (30, 15, 15), 'relax': (5, 8, 8)}
THUMB_ACROSS = {'fist': 25, 'grip': 5, 'relax': 0}         # ngón cái quay ngang trước lòng tay (độ)
SPREAD = {'index': -15, 'middle': -5, 'ring': 5, 'pinky': 16}
PINKY_MORE = {'index': 0.0, 'middle': 0.1, 'ring': 0.2, 'pinky': 0.3}      # thả lỏng: ngón út cuộn nhiều hơn

POSE_VALUES = {None: {}, 'tha_long': {'relax': 1.0}, 'nam_tay': {'fist': 1.0}, 'cam_coc': {'grip': 1.0}, 'xoe': {'spread': 1.0}}


def _axis_signs(arm, side):
    """Đo thực nghiệm: quay +0.3 quanh trục cục bộ nào thì đầu ngón đi vào lòng tay / toả ra phía ngón út."""
    sx = 1.0 if side == 'L' else -1.0; n = Vector((_N.x * sx, _N.y, _N.z)); s = Vector((_S.x * sx, _S.y, _S.z)); pb = arm.pose.bones
    def tip(b): bpy.context.view_layer.update(); return arm.matrix_world @ pb[b].tail
    out = {}
    for b, vec in ((f'middle1.{side}', n), (f'thumb1.{side}', n)):
        t0 = tip(b); best = None
        for ax in range(3):
            e = [0, 0, 0]; e[ax] = 0.3; pb[b].rotation_euler = e; d = (tip(b) - t0).dot(vec); pb[b].rotation_euler = (0, 0, 0)
            if best is None or abs(d) > abs(best[1]): best = (ax, d)
        out[b.split('.')[0]] = (best[0], 1.0 if best[1] > 0 else -1.0)
    t0 = tip(f'index1.{side}'); best = None
    for ax in range(3):
        e = [0, 0, 0]; e[ax] = 0.3; pb[f'index1.{side}'].rotation_euler = e; d = (tip(f'index1.{side}') - t0).dot(s); pb[f'index1.{side}'].rotation_euler = (0, 0, 0)
        if best is None or abs(d) > abs(best[1]): best = (ax, d)
    out['spread'] = (best[0], 1.0 if best[1] > 0 else -1.0)
    return out


def add_controls(arm, side='L'):
    """Thuộc tính trên hand: fist/grip/relax/spread (0–1). Mỗi ngón có hệ số riêng trên đốt 1 (k_fist, k_grip; ngón cái thêm
    ka_fist, ka_grip cho góc quay ngang) — calibrate() tự dò các hệ số này sau khi dựng."""
    sg = _axis_signs(arm, side); pb = arm.pose.bones; hb = pb[f'hand.{side}']
    for k in ('fist', 'grip', 'relax', 'spread'):
        hb[k] = 0.0
        try: hb.id_properties_ui(k).update(min=0.0, max=1.0)
        except Exception: pass
    for f in FINGERS:
        b1 = pb[f'{f}1.{side}']; b1['k_fist'] = 1.0; b1['k_grip'] = 1.0
    def drv(bone, ax, expr, props):
        d = pb[bone].driver_add('rotation_euler', ax).driver; d.type = 'SCRIPTED'
        for vn, pr in props.items():
            bn, key = pr[0], pr[1]; ix = f'[{pr[2]}]' if len(pr) > 2 else ''
            v = d.variables.new(); v.name = vn; v.type = 'SINGLE_PROP'; v.targets[0].id = arm; v.targets[0].data_path = f'pose.bones["{bn}.{side}"]["{key}"]{ix}'
        d.expression = expr
    hp = {k: ('hand', k) for k in ('fist', 'grip', 'relax', 'spread')}
    ac, sc_ = sg['middle1']; aspr, ssp = sg['spread']
    for f in FINGERS:
        kp = {'kf': (f'{f}1', 'k_fist'), 'kg': (f'{f}1', 'k_grip')}
        for i in range(3):
            c = [sc_ * math.radians(CURL[k][i] * (1 + (PINKY_MORE[f] if k == 'relax' else 0))) for k in ('fist', 'grip', 'relax')]
            drv(f'{f}{i + 1}.{side}', ac, f'fist*kf*{c[0]:.4f}+grip*kg*{c[1]:.4f}+relax*{c[2]:.4f}', {**{k: hp[k] for k in ('fist', 'grip', 'relax')}, **kp})
        drv(f'{f}1.{side}', aspr, f'spread*{ssp * math.radians(SPREAD[f]):.4f}', {'spread': hp['spread']})
    # ngón cái: mỗi đốt có 3 mảng góc (fist_rot / grip_rot / relax_rot, rad theo X,Y,Z cục bộ) → driver từng trục; calibrate() điền giá trị
    at, st = sg['thumb1']
    t0 = arm.matrix_world @ pb[f'thumb1.{side}'].tail; s = Vector((_S.x * (1 if side == 'L' else -1), _S.y, _S.z)); best = None
    for ax in range(3):
        if ax == at: continue
        e = [0, 0, 0]; e[ax] = 0.3; pb[f'thumb1.{side}'].rotation_euler = e; bpy.context.view_layer.update(); d = ((arm.matrix_world @ pb[f'thumb1.{side}'].tail) - t0).dot(s); pb[f'thumb1.{side}'].rotation_euler = (0, 0, 0)
        if best is None or abs(d) > abs(best[1]): best = (ax, d)
    acr, sa = best[0], (1.0 if best[1] > 0 else -1.0)
    b1 = pb[f'thumb1.{side}']; b1['ax_curl'] = at; b1['sg_curl'] = st; b1['ax_across'] = acr; b1['sg_across'] = sa
    for i in range(3):
        bt = pb[f'thumb{i + 1}.{side}']
        for key, src in (('fist_rot', 'fist'), ('grip_rot', 'grip'), ('relax_rot', 'relax')):
            r = [0.0, 0.0, 0.0]; r[at] = st * math.radians(THUMB_CURL[src][i])
            if i == 0: r[acr] += sa * math.radians(THUMB_ACROSS[src])
            bt[key] = r
        for ax in range(3):
            drv(f'thumb{i + 1}.{side}', ax, 'fist*f+grip*g+relax*r',
                {'fist': hp['fist'], 'grip': hp['grip'], 'relax': hp['relax'], 'f': (f'thumb{i + 1}', 'fist_rot', ax), 'g': (f'thumb{i + 1}', 'grip_rot', ax), 'r': (f'thumb{i + 1}', 'relax_rot', ax)})
    bpy.context.view_layer.update()


def _set(arm, pose_vals, side):
    pb = arm.pose.bones; hb = pb[f'hand.{side}']
    for k in ('fist', 'grip', 'relax', 'spread'): hb[k] = pose_vals.get(k, 0.0)
    arm.update_tag(); bpy.context.scene.frame_set(bpy.context.scene.frame_current); bpy.context.view_layer.update()


def _tip_index(ob, P0, f, sx):
    idx = _region(ob, (f'{f}3',)); U = np.array([_uvw(Vector(p), sx) for p in P0[idx]])
    if f == 'thumb': return idx[np.argmax(U[:, 0] - U[:, 1] * 0.3)]
    return idx[np.argmax(U[:, 0])]


def fist_contact_fn(ob, arm, side='L', with_thumb=(True,)):
    """contact(f) → (khoảng cách nhỏ nhất đốt cuối ngón f tới lòng tay [m], số cặp tam giác xuyên). Dùng chung calibrate/check."""
    _set(arm, {}, side); palm = _region(ob, ('hand',)); thumb = _region(ob, ('thumb1', 'thumb2', 'thumb3')); tip = {f: _region(ob, (f'{f}3',)) for f in FINGERS}
    # đích là LÒNG TAY, không tính gò ngón cái (gò dịch khi ngón cái vắt ngang)
    fing = {f: _region(ob, (f'{f}2', f'{f}3')) for f in FINGERS}
    def contact(f):
        P = _verts(ob); bp = _bvh_sub(P, ob, palm); bt = _bvh_sub(P, ob, tip[f])
        pen = len(bp.overlap(bt)) + (len(_bvh_sub(P, ob, thumb).overlap(_bvh_sub(P, ob, fing[f]))) if with_thumb[0] else 0)   # không xuyên lòng tay; lượt 2 không xuyên ngón cái
        return min(bp.find_nearest(Vector(P[i]))[3] for i in tip[f][::2]), pen
    return contact


def calibrate(ob, arm, cup, side='L'):
    """Dò hệ số cuộn từng ngón: nắm tay → đầu ngón cách mặt lòng tay +1 mm; cầm cốc → ngón vừa chạm cốc (≤1 mm) không xuyên;
    ngón cái dò lưới (cuộn × quay ngang) để không xuyên ngón trỏ/giữa (nắm) / cốc (cầm) và nằm sát nhất."""
    sx = 1.0 if side == 'L' else -1.0; pb = arm.pose.bones
    wt = [False]; _set(arm, {}, side); contact = fist_contact_fn(ob, arm, side, wt)
    def scan(fn, lo, hi, step):                  # fn(k) → (khe, xuyên); tăng k tới khi chạm (≤1 mm) hoặc vừa xuyên thì lùi lại
        k = lo; last_ok = lo
        while k <= hi:
            d, pen = fn(k)
            if pen: return last_ok
            last_ok = k
            if d <= 0.001: return k
            k += step
        return last_ok
    def fit_fist_fingers():
        for f in FINGERS:
            def g(k): pb[f'{f}1.{side}']['k_fist'] = k; _set(arm, {'fist': 1.0}, side); return contact(f)
            k = scan(g, 0.5, 2.0, 0.02); pb[f'{f}1.{side}']['k_fist'] = k; d, pen = g(k); print(f'    hiệu chỉnh nắm {f}: k={k:.3f} khe {d * 1000:.1f} mm, xuyên {pen}')
    fit_fist_fingers()                               # lượt 1: chốt độ cuộn bốn ngón (ngón cái chưa vắt ngang)
    # cầm cốc
    Pc = _verts(cup); bvc = BVHTree.FromPolygons([Vector(p) for p in Pc], [list(p.vertices) for p in cup.data.polygons], all_triangles=False)
    def cup_contact(f):
        P = _verts(ob); idx = _region(ob, (f'{f}2', f'{f}3'))
        return min(bvc.find_nearest(Vector(P[i]))[3] for i in idx[::2]), len(bvc.overlap(_bvh_sub(P, ob, idx)))
    for f in FINGERS:
        def g(k): pb[f'{f}1.{side}']['k_grip'] = k; _set(arm, {'grip': 1.0}, side); return cup_contact(f)
        k = scan(g, 0.0, 2.0, 0.02); pb[f'{f}1.{side}']['k_grip'] = k; d, pen = g(k); print(f'    hiệu chỉnh cốc {f}: k={k:.3f} khe {d * 1000:.1f} mm, xuyên {pen}')
    # ngón cái
    b1 = pb[f'thumb1.{side}']; _set(arm, {}, side); Q0 = _verts(ob); ed = np.array([e.vertices[:] for e in ob.data.edges])
    l0 = np.linalg.norm(Q0[ed[:, 0]] - Q0[ed[:, 1]], axis=1); ok_e = l0 > 0.5 * np.median(l0)
    def n_stretch(P): return int((np.where(ok_e, np.linalg.norm(P[ed[:, 0]] - P[ed[:, 1]], axis=1) / l0.clip(1e-9), 0) > 2.0).sum())
    th = _region(ob, ('thumb2', 'thumb3')); th3 = _region(ob, ('thumb3',)); fingers4 = _region(ob, FINGERS); palm_only = _region(ob, ('hand',))
    at, st, acr, sa = int(b1['ax_curl']), b1['sg_curl'], int(b1['ax_across']), b1['sg_across']
    tb = [pb[f'thumb{i + 1}.{side}'] for i in range(3)]
    # cầm cốc: dò lưới (độ cuộn × góc quay ngang) — không xuyên cốc, sát cốc nhất, ít kéo da
    best = None
    for k in (0.4, 0.7, 1.0, 1.3, 1.6):
        for a in (0.0, 0.5, 1.0, 1.5, 2.0):
            for i in range(3):
                r = [0.0, 0.0, 0.0]; r[at] = st * math.radians(THUMB_CURL['grip'][i]) * k
                if i == 0: r[acr] += sa * math.radians(max(THUMB_ACROSS['grip'], 5)) * a
                tb[i]['grip_rot'] = r
            _set(arm, {'grip': 1.0}, side); P = _verts(ob); bt = _bvh_sub(P, ob, th)
            pen = len(bt.overlap(bvc)); dm = min(bvc.find_nearest(Vector(P[i]))[3] for i in th3[::2]); ns = n_stretch(P)
            score = pen * 1.0 + dm * 100 + ns * 0.002
            if best is None or score < best[0]: best = (score, k, a, pen, dm, ns, [list(t['grip_rot']) for t in tb])
    for i in range(3): tb[i]['grip_rot'] = best[6][i]
    # tinh chỉnh 3 trục gốc ngón cái (±20°) để bớt kéo da kẽ ngón cái–trỏ mà vẫn không xuyên cốc, vẫn sát cốc
    g0 = list(best[6][0]); gb = (best[0], g0)
    for d in itertools.product((-0.35, -0.17, 0, 0.17, 0.35), repeat=3):
        r1 = [g0[j] + d[j] for j in range(3)]; tb[0]['grip_rot'] = r1; _set(arm, {'grip': 1.0}, side); P = _verts(ob)
        pen = len(_bvh_sub(P, ob, th).overlap(bvc)); dm = min(bvc.find_nearest(Vector(P[i]))[3] for i in th3[::2]); ns = n_stretch(P)
        sc_ = pen * 1.0 + dm * 100 + ns * 0.01
        if sc_ < gb[0]: gb = (sc_, r1, pen, dm, ns)
    tb[0]['grip_rot'] = gb[1]
    print(f'    hiệu chỉnh ngón cái cầm cốc: k={best[1]} quay={best[2]} → tinh chỉnh 3 trục: ' + (f'xuyên {gb[2]} khe {gb[3] * 1000:.1f} mm, cạnh giãn {gb[4]}' if len(gb) > 2 else 'giữ nguyên'))
    # nắm tay: quét 3 trục xoay đốt gốc ngón cái (cuộn / xoắn dọc / ngả) × độ cuộn 2 đốt ngoài, sau khi bốn ngón đã cuộn.
    # Điều kiện: không xuyên bốn ngón, đốt cuối không xuyên lòng tay; chọn đốt cuối áp sát đốt giữa ngón trỏ/giữa nhất, ít kéo da.
    # (Quét 2 trục cũ không có tư thế hợp lệ: ngón cái phải XOẮN ~40° quanh trục dọc mới vắt lên được đốt giữa.)
    mid2 = _region(ob, ('index2', 'middle2')); best = None; deg = [-60, -40, -20, 0, 20, 40, 60]
    def try_fist(r1, k2):
        tb[0]['fist_rot'] = r1
        for i in (1, 2):
            r = [0.0, 0.0, 0.0]; r[at] = st * math.radians(THUMB_CURL['fist'][i]) * k2; tb[i]['fist_rot'] = r
        _set(arm, {'fist': 1.0}, side); P = _verts(ob)
        pen = len(_bvh_sub(P, ob, th).overlap(_bvh_sub(P, ob, fingers4))) + len(_bvh_sub(P, ob, th3).overlap(_bvh_sub(P, ob, palm_only)))
        if pen: return None
        bm2 = _bvh_sub(P, ob, mid2); dm = min(bm2.find_nearest(Vector(P[i]))[3] for i in th3[::3]); ns = n_stretch(P)
        return dm * 100 + ns * 0.002, dm, ns
    for k2 in (0.6, 1.0):
        for a_ in deg:
            for b_ in deg:
                for c_ in deg:
                    r1 = [math.radians(a_), math.radians(b_), math.radians(c_)]; v = try_fist(r1, k2)
                    if v and (best is None or v[0] < best[0]): best = (v[0], v[1], v[2], r1, k2)
    for _ in range(2):                                   # tinh chỉnh ±10° quanh nghiệm tốt nhất
        r0, k2 = best[3], best[4]
        for d in itertools.product((-0.17, 0, 0.17), repeat=3):
            r1 = [r0[j] + d[j] for j in range(3)]; v = try_fist(r1, k2)
            if v and v[0] < best[0]: best = (v[0], v[1], v[2], r1, k2)
    try_fist(best[3], best[4])
    print(f'    hiệu chỉnh ngón cái nắm: gốc {[round(math.degrees(x)) for x in best[3]]}° cuộn đốt ngoài ×{best[4]} khe {best[1] * 1000:.1f} mm, cạnh giãn {best[2]}')
    wt[0] = True; fit_fist_fingers()                # lượt 2: bốn ngón cuộn lại khi gò ngón cái đã dịch, không xuyên ngón cái
    _set(arm, {}, side)


def apply_hand_pose(arm, name):
    side = arm.name.split('.')[-1]; hb = arm.pose.bones[f'hand.{side}']
    for k in ('fist', 'grip', 'relax', 'spread'): hb[k] = POSE_VALUES[name].get(k, 0.0)
    arm.update_tag(); bpy.context.scene.frame_set(bpy.context.scene.frame_current); bpy.context.view_layer.update()


def mirror_shape(obL, side='R'):
    """Tay phải = lật gương X đúng từng đỉnh của tay trái (đảo chiều mặt để pháp tuyến vẫn hướng ra ngoài)."""
    me = obL.data.copy(); me.name = f'Tay_Nam.{side}'
    for v in me.vertices: v.co.x = -v.co.x
    me.flip_normals(); ob = bpy.data.objects.new(f'Tay_Nam.{side}', me); bpy.context.scene.collection.objects.link(ob)
    return ob


def build_hand(side='L', shapeL=None):
    ob = build_shape(side) if side == 'L' else mirror_shape(shapeL, side)
    arm = build_rig(side); skin(ob, arm, side); add_controls(arm, side); return ob, arm


def _cam(sc, name, loc, target, scale):
    cd = bpy.data.cameras.new(name); cd.type = 'ORTHO'; cd.ortho_scale = scale; co = bpy.data.objects.new(name, cd); sc.collection.objects.link(co)
    co.location = loc; co.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler(); return co


def setup_render(sc, samples):
    sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = samples; sc.render.resolution_x = sc.render.resolution_y = 500
    sc.view_settings.view_transform = 'Standard'
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (0.62, 0.61, 0.6, 1); w.node_tree.nodes['Background'].inputs[1].default_value = 0.9
    for nm, rot, e in (('key', (50, 0, 35), 3.0), ('fill', (60, 0, -140), 1.2)):
        ld = bpy.data.lights.new(nm, 'SUN'); ld.energy = e; lo = bpy.data.objects.new(nm, ld); sc.collection.objects.link(lo); lo.rotation_euler = [math.radians(x) for x in rot]


def skin_material():
    m = bpy.data.materials.get('Da') or bpy.data.materials.new('Da'); m.use_nodes = True
    bs = m.node_tree.nodes.get('Principled BSDF'); bs.inputs['Base Color'].default_value = (0.80, 0.47, 0.33, 1); bs.inputs['Roughness'].default_value = 0.55
    try: bs.inputs['Subsurface Weight'].default_value = 0.15; bs.inputs['Subsurface Radius'].default_value = (0.02, 0.008, 0.005)
    except Exception: pass
    return m


def render_sheet(sc, ob, arm, cup, out, side='L'):
    """4 tư thế × 4 góc (lòng tay, mu tay, nghiêng phía ngón cái, chéo); cốc chỉ hiện ở tư thế cầm cốc."""
    os.makedirs(out, exist_ok=True); sx = 1.0 if side == 'L' else -1.0
    c = L(0.070, 0.0, 0.0, sx); n = Vector((_N.x * sx, _N.y, _N.z)); s = Vector((_S.x * sx, _S.y, _S.z))
    views = {'long_tay': c + n * 2, 'mu_tay': c - n * 2, 'nghieng': c - s * 2, 'cheo': c + (n - s * 0.8 + Vector((0, 0, 0.5))).normalized() * 2}
    files = []
    for p in HAND_POSES:
        apply_hand_pose(arm, p); cup.hide_render = (p != 'cam_coc')
        for vn, loc in views.items():
            sc.camera = _cam(sc, f'{p}_{vn}', loc, c, 0.24); sc.render.filepath = os.path.join(out, f'{p}_{vn}.png'); bpy.ops.render.render(write_still=True); files.append(sc.render.filepath)
    apply_hand_pose(arm, None); return files


def copy_calibration(src, dst):
    """Tay phải dùng đúng hệ số của tay trái (hình đối xứng)."""
    ss, ds = src.name.split('.')[-1], dst.name.split('.')[-1]
    for b in src.pose.bones:
        nm = b.name.rsplit('.', 1)[0]
        if nm.startswith(FINGERS + ('thumb',)):
            for key, val in b.items():
                if not key.startswith('ax_') and not key.startswith('sg_'): dst.pose.bones[f'{nm}.{ds}'][key] = val


def make_cup():
    """Cốc thử: trụ bán kính 38 mm, cao 90 mm, trục song song bề ngang lòng tay, áp sát lòng tay trái."""
    r = 0.038; c = L(0.066, 0.010, PALM_HT + r + 0.010)            # cốc lệch về phía ngón út: ngón cái ôm ở đầu cốc, không nằm trong thân cốc
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=r, depth=0.100, location=c); cup = bpy.context.object; cup.name = 'Coc_thu'
    cup.rotation_euler = _S.to_track_quat('Z', 'Y').to_euler(); bpy.context.view_layer.update()
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    return cup


# ---------------------------------------------------------------- kiểm tra
def _verts(ob):
    dg = bpy.context.evaluated_depsgraph_get(); ev = ob.evaluated_get(dg); me = ev.to_mesh()
    a = np.zeros(len(me.vertices) * 3, dtype=np.float64); me.vertices.foreach_get('co', a); ev.to_mesh_clear()
    return (np.array(ob.matrix_world) @ np.c_[a.reshape(-1, 3), np.ones(len(a) // 3)].T).T[:, :3]


def _region(ob, prefixes):
    """Đỉnh mà nhóm xương mạnh nhất bắt đầu bằng một trong prefixes."""
    names = {g.index: g.name for g in ob.vertex_groups}; out = []
    for v in ob.data.vertices:
        if not v.groups: continue
        g = max(v.groups, key=lambda g_: g_.weight)
        if names[g.group].startswith(prefixes): out.append(v.index)
    return np.array(out, dtype=np.int64)


_POLY_CACHE = {}


def _polys(ob):
    key = (ob.data.name, len(ob.data.polygons))
    if key not in _POLY_CACHE:
        n = len(ob.data.polygons); tot = np.zeros(n, dtype=np.int32); ob.data.polygons.foreach_get('loop_total', tot)
        lv = np.zeros(len(ob.data.loops), dtype=np.int32); ob.data.loops.foreach_get('vertex_index', lv)
        if (tot == 4).all(): arr = lv.reshape(-1, 4)
        else:
            st = np.zeros(n, dtype=np.int32); ob.data.polygons.foreach_get('loop_start', st)
            arr = np.array([lv[a:a + 4] if t == 4 else np.r_[lv[a:a + 3], lv[a + 2]] for a, t in zip(st, tot)])   # tam giác → tứ giác suy biến
        _POLY_CACHE[key] = arr
    return _POLY_CACHE[key]


def _bvh_sub(P, ob, idx):
    """BVH của các mặt có đủ đỉnh nằm trong idx (lọc bằng numpy, nhanh)."""
    arr = _polys(ob); m = np.zeros(len(P), dtype=bool); m[idx] = True; sel = arr[m[arr].all(1)]
    if not len(sel): return None
    used, inv = np.unique(sel, return_inverse=True)
    return BVHTree.FromPolygons(P[used].tolist(), inv.reshape(sel.shape).tolist(), all_triangles=False)


def check_hand(ob, arm, cup=None):
    """Trả dict tên-kiểm → (đạt?, chi tiết). In PASS/FAIL từng mục."""
    res = {}
    def rec(k, ok, msg): res[k] = (bool(ok), msg); print(f'    {"PASS" if ok else "FAIL"}  {k}: {msg}')
    bones = arm.data.bones
    need = ['hand'] + [f'{f}{i}' for f in FINGERS + ('thumb',) for i in (1, 2, 3)]
    sfx = ob.name.split('.')[-1]
    miss = [b for b in need if f'{b}.{sfx}' not in bones]
    rec('xuong', not miss, 'đủ xương hand + 5 ngón × 3 đốt' if not miss else f'thiếu {len(miss)}: {miss[:5]}')
    if miss: return res
    # (a) giãn cạnh
    apply_hand_pose(arm, None); P0 = _verts(ob)
    ed = np.array([e.vertices[:] for e in ob.data.edges]); l0 = np.linalg.norm(P0[ed[:, 0]] - P0[ed[:, 1]], axis=1); ok_e = l0 > 0.5 * np.median(l0)   # bỏ cạnh quá ngắn (đỉnh gần trùng) theo độ mịn thực của lưới
    worst = {}
    for p in HAND_POSES:
        apply_hand_pose(arm, p); P = _verts(ob); st = np.where(ok_e, np.linalg.norm(P[ed[:, 0]] - P[ed[:, 1]], axis=1) / l0.clip(1e-9), 0)
        worst[p] = (int((st > 2.0).sum()), float(st.max()))
    rec('gian_canh', all(n == 0 for n, _ in worst.values()), ', '.join(f'{p} {n} cạnh/max {m:.2f}×' for p, (n, m) in worst.items()))
    # (b1) nắm tay: đầu ngón chạm lòng tay ≤ 3 mm, không lún vào
    contact = fist_contact_fn(ob, arm, sfx); apply_hand_pose(arm, 'nam_tay'); P = _verts(ob)
    bh = _bvh_sub(P, ob, _region(ob, ('hand', 'thumb'))); ct = []
    for f in FINGERS:                                # chạm = đốt cuối sát lòng tay HOẶC gò/ngón cái (ngón trỏ tì vào gò ngón cái như nắm thật); xuyên chỉ tính với lòng tay
        d_palm, pen = contact(f); tipv = _region(ob, (f'{f}3',)); ct.append((min(d_palm, min(bh.find_nearest(Vector(P[i]))[3] for i in tipv[::2])), pen))
    rec('nam_tay_dau_ngon', all(d <= 0.003 and pen == 0 for d, pen in ct), 'đốt cuối→lòng tay/ngón cái (mm/cặp xuyên): ' + ', '.join(f'{d * 1000:.1f}/{pen}' for d, pen in ct))
    # (b2) ngón cái không xuyên ngón trỏ/giữa
    th = _region(ob, ('thumb2', 'thumb3')); ix = _region(ob, ('index', 'middle'))
    a_, b_ = _bvh_sub(P, ob, th), _bvh_sub(P, ob, ix); n_ov = len(a_.overlap(b_)) if a_ and b_ else -1
    rec('nam_tay_ngon_cai', n_ov == 0, f'cặp tam giác xuyên ngón cái↔trỏ/giữa: {n_ov}')
    # (b3) cầm cốc: không xuyên cốc, ≥3 ngón chạm cốc (≤ 3 mm)
    if cup is None: rec('cam_coc', False, 'chưa có cốc thử')
    else:
        apply_hand_pose(arm, 'cam_coc'); P = _verts(ob); Pc = _verts(cup)
        bv_c = BVHTree.FromPolygons([Vector(p) for p in Pc], [list(p.vertices) for p in cup.data.polygons], all_triangles=False)
        bv_h = BVHTree.FromPolygons([Vector(p) for p in P], [list(p.vertices) for p in ob.data.polygons], all_triangles=False)
        n_x = len(bv_h.overlap(bv_c)); touch = 0
        for f in FINGERS + ('thumb',):
            idx = _region(ob, (f'{f}2', f'{f}3')); dm = min(bv_c.find_nearest(Vector(P[i]))[3] for i in idx[::3])
            touch += dm <= 0.003
        rec('cam_coc', n_x == 0 and touch >= 3, f'xuyên cốc {n_x} cặp, ngón chạm cốc {touch}/5')
    apply_hand_pose(arm, None)
    return res


def check_mirror(obL, obR):
    from mathutils.kdtree import KDTree
    PL, PR = _verts(obL), _verts(obR); kd = KDTree(len(PR))
    for i, p in enumerate(PR): kd.insert(Vector(p), i)
    kd.balance(); d = max(kd.find(Vector((-p[0], p[1], p[2])))[2] for p in PL[::7]) if len(PL) == len(PR) else 1.0
    ok = len(PL) == len(PR) and d <= 0.0001; print(f'    {"PASS" if ok else "FAIL"}  guong: {len(PL)} / {len(PR)} đỉnh, lệch max {d * 1000:.3f} mm'); return ok


# ---------------------------------------------------------------- chạy
def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--blend', default=''); ap.add_argument('--render', default=''); ap.add_argument('--samples', type=int, default=24); ap.add_argument('--check', action='store_true')
    a = ap.parse_args(argv)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    obL, armL = build_hand('L'); obR, armR = build_hand('R', obL)
    cup = make_cup(); mat = skin_material()
    calibrate(obL, armL, cup, 'L'); copy_calibration(armL, armR)
    for o in (obL, obR): o.data.materials.append(mat)
    obR.location.x = -0.0; obR.hide_render = True
    if a.check:
        print('KIỂM TAY TRÁI'); r = check_hand(obL, armL, cup); okm = check_mirror(obL, obR)
        ok = all(v[0] for v in r.values()) and okm; print('KẾT QUẢ:', 'PASS' if ok else 'FAIL')
    if a.render:
        sc = bpy.context.scene; setup_render(sc, a.samples); render_sheet(sc, obL, armL, cup, a.render)
    if a.blend: os.makedirs(os.path.dirname(os.path.abspath(a.blend)), exist_ok=True); bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))


if __name__ == '__main__':
    main()
