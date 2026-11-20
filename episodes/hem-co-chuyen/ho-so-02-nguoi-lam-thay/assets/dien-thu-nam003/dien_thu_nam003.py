"""Diễn thử NAM-003 trong phòng trọ Hồ sơ 02 (Blender 5.2.x): Nam vào phòng ban đêm, đi tới bàn, quay mặt vào bàn, kéo ghế ngồi, tay đặt lên bàn.

  <bpy-python> dien_thu_nam003.py --ra thu_muc [--khung 1,2,...] [--mau 24] [--rong 640] [--cam NAM_THU] [--blend out.blend] [--che-do night|day]
Phòng: ../boi-canh-3d/xay_phong_tro.py (build). Nhân vật: assets/nhan-vat-3d/nam-003/nam-003-rig.blend (append Nam_Body + Nam_Rig). Hoạt ảnh tư thế dựng bằng chuyen_dong_nam003
(Ctx ở khung nhân vật, armature đứng yên ở gốc), vị trí/hướng trong phòng bằng chuyển động của OBJECT armature (location, rotation Z) từng khung.
Toạ độ: thế giới = x_thiết_kế phản chiếu (x_w = 3 − x_tk); mặt nhân vật −Y.
"""
import sys, os, math, argparse, json
import numpy as np, bpy
from mathutils import Vector, Matrix, Euler, Quaternion
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', '..'))
BC = os.path.join(HERE, '..', 'boi-canh-3d'); NAM = os.path.join(REPO, 'assets', 'nhan-vat-3d', 'nam-003'); RIG = os.path.join(NAM, 'nam-003-rig.blend')
sys.path[:0] = [BC, NAM]
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
ap = argparse.ArgumentParser(); ap.add_argument('--ra', required=True); ap.add_argument('--khung', default=''); ap.add_argument('--mau', type=int, default=24); ap.add_argument('--rong', type=int, default=640)
ap.add_argument('--cam', default='NAM_THU'); ap.add_argument('--blend', default=''); ap.add_argument('--che-do', default='night'); ap.add_argument('--chi-tu-the', action='store_true')
a = ap.parse_args(argv)
import xay_phong_tro as X
import chuyen_dong_nam003 as C

# ---- phòng: ghế kéo ra (tâm thiết kế x 2,32, y 1,36), camera riêng
X.SEAT['x'], X.SEAT['y'] = 2.32, 1.36
X.CAMERAS['NAM_THU'] = ((0.55, 3.3, 1.55), (1.9, 1.0, 0.95), 24)
X.CAMERAS['NAM_THU2'] = ((0.6, 1.2, 1.35), (2.3, 0.8, 0.95), 28)     # cận hơn từ phía cửa, nhìn dọc bàn
sc = X.build(a.che_do, 10.0, 0.0, 0.0, a.cam, (a.rong, round(a.rong / 2.39)), den_ban=(a.che_do == 'night'))
sc.cycles.samples = a.mau
# ---- nhân vật
with bpy.data.libraries.load(RIG, link=False) as (src, dst): dst.objects = [n for n in src.objects if n in ('Nam_Rig', 'Nam_Body')]
for o in dst.objects:
    if o is not None: bpy.context.scene.collection.objects.link(o)
arm = bpy.data.objects['Nam_Rig']; body = bpy.data.objects['Nam_Body']; arm.location = (0, 0, 0); arm.rotation_euler = (0, 0, 0)
c = C.Ctx.__new__(C.Ctx); c.sc = sc; c.arm = arm; c.body = body; c.pb = arm.pose.bones; c.g = C.R.patched_namespace()
c.rest = {b.name: arm.matrix_world @ b.bone.matrix_local for b in c.pb}; c.head = {n: m.translation.copy() for n, m in c.rest.items()}
for m_ in body.modifiers:
    if m_.type == 'CORRECTIVE_SMOOTH': m_.show_viewport = False
for k in 'LR':
    for b in c.pb:
        for cn in b.constraints:
            if cn.type == 'IK': pass
bpy.context.view_layer.update()
ss = C.ss; lerp = C.lerp
# ---- đường đi: cửa (thế giới) → góc R → điểm đứng S; làm trơn góc
W = 3.0
D0 = np.array([2.85, 2.55]); R_ = np.array([1.50, 1.10]); S_ = np.array([0.68, 1.10])
def path(L=2.8):
    pts = [D0]; seg = [R_ - D0, S_ - R_]
    P = []
    for p0, p1 in ((D0, R_), (R_, S_)):
        n = int(np.linalg.norm(p1 - p0) / 0.01); P += [p0 + (p1 - p0) * i / n for i in range(n)]
    P += [S_]; P = np.array(P); pad = 60
    Q = np.vstack([P[0] + (P[0] - P[min(pad, len(P) - 1)]) * 0, np.repeat(P[:1], pad, 0) + (P[0] - R_) / np.linalg.norm(P[0] - R_) * 0.01 * np.arange(pad, 0, -1)[:, None], P, np.repeat(P[-1:], pad, 0) + (S_ - R_) / np.linalg.norm(S_ - R_) * 0.01 * np.arange(1, pad + 1)[:, None]])
    k = np.exp(-0.5 * (np.arange(-60, 61) / 25.0) ** 2); k /= k.sum()
    Sm = np.stack([np.convolve(Q[:, i], k, mode='same') for i in range(2)], 1)[pad + 1: -pad]
    return Sm
PATH = path(); seglen = np.r_[0, np.cumsum(np.linalg.norm(np.diff(PATH, axis=0), axis=1))]
def at_s(s):
    s = min(max(s, 0), seglen[-1] - 1e-6); i = np.searchsorted(seglen, s) - 1; i = max(i, 0)
    t = (s - seglen[i]) / max(seglen[i + 1] - seglen[i], 1e-9); p = PATH[i] + (PATH[i + 1] - PATH[i]) * t; d = PATH[i + 1] - PATH[i]
    return p, math.atan2(-d[0], d[1] * -1.0) if False else math.atan2(d[0], -d[1]) * -1.0   # hướng nhìn −Y cục bộ → θ sao cho (sinθ, −cosθ)=d
def heading(d): return math.atan2(d[0], -d[1])
WALK_N = 32; WALK_LEN = 2 * 2 * 0.70                           # 2 chu kỳ, mỗi chu kỳ 2·S = 1,4 m
T_WALK, T_SETTLE, T_TURN, T_SIT, T_SCOOT, T_END = 64, 72, 90, 142, 166, 190
SCOOT = 0.40; STAND = dict(ik=((0.11, 0.05, 0.118), (-0.11, 0.05, 0.118)))
def pose_stand(arm_fwd=0.0):
    c.reset()
    P = {'fk': list(C.ARM_DOWN) + ([('LeftArm', C.X, -arm_fwd), ('RightArm', C.X, -arm_fwd)] if arm_fwd else []), 'root': ((0, 0, 0), (0, 0, 0)), 'ik_foot': {'L': (0.11, 0.05, 0.118), 'R': (-0.11, 0.05, 0.118)},
         'ngon': {'nam_tro': 0.15, 'nam_giua': 0.18, 'nam_ap': 0.2, 'nam_cai': 0.1}}
    C.ap_dung(c, P)
def pose_sit(t, scoot):
    h = ss(t); hb = ss((t - 0.12) / 0.88)
    lean = 14 * math.sin(math.pi * min(1.0, t * 1.15)) * (1 - 0.3 * scoot) + 8 * scoot
    P = {'fk': [('Spine', C.X, lean * 0.5), ('Spine1', C.X, lean * 0.3), ('Spine2', C.X, lean * 0.2), ('Head', C.X, -lean * 0.3 + 14 * scoot)] + list(C.ARM_DOWN) + [('LeftArm', C.X, -(20 * h + 14 * scoot)), ('RightArm', C.X, -(20 * h + 14 * scoot))],
         'root': ((0, 0, 0), (0, 0, 0)), 'hips': (0, 0.02 + 0.24 * hb, 1.0 - 0.335 * h),
         'ik_foot': {'L': (0.15, lerp(0.05, -0.12, h), 0.118), 'R': (-0.15, lerp(0.05, -0.12, h), 0.118)}, 'ngon': {'nam_tro': 0.15, 'nam_giua': 0.18, 'nam_ap': 0.2, 'nam_cai': 0.1}}
    if scoot > 0:
        P['ik_hand'] = {'L': (0.20, lerp(0.20, -0.06, scoot), lerp(0.80, 0.80, scoot)), 'R': (-0.20, lerp(0.20, -0.06, scoot), 0.80)}
        P['fk'] = [(b, ax, d) for b, ax, d in P['fk'] if b not in ('LeftArm', 'RightArm')] + [('LeftArm', C.Y, 78 * (1 - scoot)), ('RightArm', C.Y, -78 * (1 - scoot))]
    C.ap_dung(c, P)
def snapshot(): return {b.name: b.matrix.copy() for b in c.pb}
def blend(m0, m1, t):
    for n in m0:
        a0, a1 = m0[n], m1[n]; q = a0.to_quaternion().slerp(a1.to_quaternion(), t); loc = a0.translation.lerp(a1.translation, t)
        c.pb[n].matrix = Matrix.Translation(loc) @ q.to_matrix().to_4x4(); 
    bpy.context.view_layer.update()
# ---- hoạt ảnh
for b in c.pb:
    for k_ in b.constraints:
        pass
chair_objs = [o for o in bpy.data.objects if o.name.startswith('ghe_')]
c0 = {o.name: o.location.copy() for o in chair_objs}
frames = [int(x) for x in a.khung.split(',')] if a.khung else list(range(0, T_END + 1))
act = bpy.data.actions.new('dien_thu'); arm.animation_data_create(); arm.animation_data.action = act
sc.frame_start, sc.frame_end = 0, T_END; sc.render.fps = 24
def place_obj(hl, P, th):
    R = Matrix.Rotation(th, 2); off = R @ Vector((hl.x, hl.y)); arm.rotation_euler = (0, 0, th); arm.location = (P[0] - off.x, P[1] - off.y, 0)
last = None
for f in range(0, T_END + 1):
    sc.frame_set(f); arm.location = (0, 0, 0); arm.rotation_euler = (0, 0, 0); bpy.context.view_layer.update()   # tư thế tính ở khung nhân vật (armature ở gốc)
    if f <= T_WALK:
        C.dong_di(c, f, WALK_N, False); s = -(C.dong_di.__defaults__ and 0) or 0
        s = 2 * 0.70 * f / WALK_N; p, d = None, None
        s = min(s, seglen[-1]); i = max(np.searchsorted(seglen, s) - 1, 0); i = min(i, len(PATH) - 2); t = (s - seglen[i]) / max(seglen[i + 1] - seglen[i], 1e-9)
        P = PATH[i] + (PATH[i + 1] - PATH[i]) * t; th = heading(PATH[min(i + 1, len(PATH) - 1)] - PATH[i]); last = snapshot(); hl = c.world_head('Hips')
        place_obj(hl, P, th); th_end = th; P_end = P.copy()
    elif f <= T_SETTLE:
        t = ss((f - T_WALK) / (T_SETTLE - T_WALK)); pose_stand(); ms = snapshot(); blend(last, ms, t); hl = c.world_head('Hips'); place_obj(hl, P_end, th_end)
    elif f <= T_TURN:
        pose_stand(); th = lerp(th_end, 0.0, ss((f - T_SETTLE) / (T_TURN - T_SETTLE))); place_obj(c.world_head('Hips'), P_end, th)
    elif f <= T_SIT:
        t = (f - T_TURN) / (T_SIT - T_TURN); pose_sit(t, 0.0); place_obj(c.head['Hips'] if False else Vector((0, 0.02, 1.0)), P_end, 0.0)
    elif f <= T_SCOOT:
        t = ss((f - T_SIT) / (T_SCOOT - T_SIT)); pose_sit(1.0, t); place_obj(Vector((0, 0.02, 1.0)), P_end + np.array([0, -SCOOT * t]), 0.0)
        for o in chair_objs: o.location = c0[o.name] + Vector((0, -SCOOT * t, 0))
    else:
        pose_sit(1.0, 1.0); place_obj(Vector((0, 0.02, 1.0)), P_end + np.array([0, -SCOOT]), 0.0)
        for o in chair_objs: o.location = c0[o.name] + Vector((0, -SCOOT, 0))
    c.keyframe(f); arm.keyframe_insert('location', frame=f); arm.keyframe_insert('rotation_euler', frame=f)
    for o in chair_objs: o.keyframe_insert('location', frame=f)
if os.environ.get('DT_DEBUG'):
    print('DBG path đầu', PATH[0].round(2), 'cuối', PATH[-1].round(2), 'dài', round(seglen[-1], 2), 'P_end', P_end.round(2), 'th_end', round(math.degrees(th_end)))
    for f in (0, 30, 64, 100, 142, 190):
        sc.frame_set(f); bpy.context.view_layer.update(); dg = bpy.context.evaluated_depsgraph_get(); ea = arm.evaluated_get(dg); print('DBG mw', ea.matrix_world.translation.to_tuple(2), 'fcurves', [(fc.data_path, fc.array_index) for fc in act.fcurves if fc.data_path in ('location','rotation_euler')][:6] if hasattr(act, 'fcurves') else 'khong co fcurves', 'khung', f, 'hông thế giới (evaluated)', (ea.matrix_world @ ea.pose.bones['Hips'].head).to_tuple(2), 'body parent', body.parent.name if body.parent else None, 'obj', arm.location.to_tuple(2), round(math.degrees(arm.rotation_euler.z)))
if os.environ.get('DT_DEBUG'):
    body.hide_viewport = False
    for f in (0, 64, 100, 142, 190):
        sc.frame_set(f); bpy.context.view_layer.update(); dg = bpy.context.evaluated_depsgraph_get(); eb = body.evaluated_get(dg); me_ = eb.to_mesh(); M_ = eb.matrix_world
        v = np.array([(M_ @ vv.co)[:] for vv in me_.vertices]); eb.to_mesh_clear(); print('DBG mw body', eb.matrix_world.translation.to_tuple(2), 'arm eval', arm.evaluated_get(dg).matrix_world.translation.to_tuple(2), 'rot', round(math.degrees(arm.evaluated_get(dg).rotation_euler.z)), 'pidx', [r[:] for r in body.matrix_parent_inverse][:1], 'thân thế giới khung', f, 'x', v[:, 0].min().round(2), v[:, 0].max().round(2), 'y', v[:, 1].min().round(2), v[:, 1].max().round(2), 'z', v[:, 2].min().round(2), v[:, 2].max().round(2), 'scale', tuple(round(x, 2) for x in arm.scale))
if os.environ.get('DT_DEBUG'):
    print('DBG parent_type', body.parent_type, 'bone', body.parent_bone, 'cons body', [k.type for k in body.constraints], 'cons arm', [k.type for k in arm.constraints], 'mods', [(m.type, m.object.name if getattr(m, 'object', None) else None) for m in body.modifiers], 'rig objs', [(o.name, o.type) for o in bpy.data.objects if 'Nam' in o.name])
if os.environ.get('DT_DEBUG'):
    for f in (0, 190):
        sc.frame_set(f); bpy.context.view_layer.update(); dg = bpy.context.evaluated_depsgraph_get(); eb = body.evaluated_get(dg); me_ = eb.to_mesh()
        vi = int(np.argmax([v.co.z for v in body.data.vertices])); print('DBG đỉnh cao nhất', f, 'thô', body.data.vertices[vi].co[:], 'evaluated co', tuple(round(x, 3) for x in me_.vertices[vi].co), 'world', tuple(round(x, 3) for x in (eb.matrix_world @ me_.vertices[vi].co)), 'bone Head head', tuple(round(x, 3) for x in arm.evaluated_get(dg).pose.bones['Head'].head)); eb.to_mesh_clear()
if a.chi_tu_the:
    if a.blend: bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))
    sys.exit(0)
for m_ in body.modifiers:
    if m_.type == 'CORRECTIVE_SMOOTH': m_.show_viewport = True
body.hide_viewport = False; body.hide_render = False
os.makedirs(a.ra, exist_ok=True)
for f in frames:
    sc.frame_set(f); sc.render.filepath = os.path.join(a.ra, f'f_{f:03d}.png'); bpy.ops.render.render(write_still=True)
if a.blend: bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))
