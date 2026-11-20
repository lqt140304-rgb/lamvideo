"""Cảnh mở đầu Hồ sơ 02 trên BỐI CẢNH THẬT (../boi-canh-3d/xay_phong_tro.py), thay bối cảnh giả (sàn phẳng + giường tự tạo) của dung_canh_opening_30s.py.
  <bpy-python> dung_canh_that_opening.py --ra thư_mục [--khung 0,60] [--cam BED] [--mau 12] [--rong 640] [--blend out.blend]
Toạ độ: phòng thật phản chiếu trục x qua x_thế_giới = 3 − x_thiết_kế (mx()); nệm thiết kế x 1,58–2,98, y 2,05–3,95, mặt 0,25 → thế giới x 0,02–1,42.
Lỗi cũ: dung_canh_opening_30s.py đặt Nam ở x = 2,05 (toạ độ thiết kế) trong khi nệm thật nằm ở x 0,02–1,42 trong thế giới → Nam nằm lệch khỏi giường.
"""
import sys, os, math, argparse
import bpy
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)); BC = os.path.abspath(os.path.join(HERE, '..', 'boi-canh-3d'))
sys.path[:0] = [BC, HERE]
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
ap = argparse.ArgumentParser(); ap.add_argument('--ra', required=True); ap.add_argument('--khung', default='0'); ap.add_argument('--cam', default='BED'); ap.add_argument('--mau', type=int, default=12)
ap.add_argument('--rong', type=int, default=640); ap.add_argument('--dong', action='store_true', help='diễn hoạt khung 360-720: nằm → ngồi dậy → đứng → bước tới gương'); ap.add_argument('--blend', default=''); ap.add_argument('--che-do', default='dawn'); a = ap.parse_args(argv)
import xay_phong_tro as X
import dung_stickman_cast as dsc
W = X.W
X.CAMERAS['MO_DAU'] = ((1.5, 0.2, 1.75), (1.2, 3.1, 0.95), 20)   # từ góc bàn nhìn qua phòng: thấy nệm, lối đi và gương (toạ độ thiết kế)
X.CAMERAS['MO_DAU_CAO'] = ((2.9, 0.3, 2.3), (1.0, 3.0, 0.4), 24)
sc = X.build(a.che_do, 10.0, 0.0, 0.0, a.cam, (a.rong, round(a.rong / 2.39)), den_ban=(a.che_do == 'night'))
sc.cycles.samples = a.mau
# chăn/cuộn chăn thật nằm trên nệm; Nam nằm đè lên nên ẩn chăn trong cảnh này
for n in ('chan_nem', 'chan_cuon'):
    if n in bpy.data.objects: bpy.data.objects[n].hide_render = True; bpy.data.objects[n].hide_viewport = True
res = dsc.build_character('nam', collection_name='Char_Nam', offset_x=0.0)
rig = bpy.data.objects['Rig_nam']
# nằm ngửa trên nệm, đầu trên gối (gối thiết kế x 2,0, y ≈ 3,71 → thế giới x 1,0), chân hướng cửa phòng (y nhỏ)
HEAD = Vector((W - 2.0, 3.66, 0.0)); H = 1.60
rig.rotation_euler = (math.radians(-90), 0, 0)
rig.location = (HEAD.x, HEAD.y - H, 0.25 + 0.10)
bpy.context.view_layer.update()
# điện thoại thật trên nệm cạnh gối (thế giới)
ph = bpy.data.objects.new('dien_thoai', None)
bpy.ops.mesh.primitive_cube_add(size=1, location=(W - 2.45, 3.30, 0.265)); p = bpy.context.active_object; p.name = 'dien_thoai'; p.scale = (0.035, 0.07, 0.004)

# ---------------- diễn hoạt 360–720 (FK; trục xoay đã đo: X+ = đùi/tay ra sau, thân/cổ gập ra trước, cẳng chân gập gối)
R = math.radians
for b in rig.pose.bones:
    b.rotation_mode = 'XYZ'
    for c_ in b.constraints: c_.influence = 0.0
def ss(t): t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)
def lerp(x, y, t): return x + (y - x) * t
F_SIT, F_LONG, F_SWING, F_DEP, F_STAND, F_WALK0, F_WALK1, F_END = 360, 400, 432, 492, 540, 566, 646, 720
def osc(f, period, ph=0.0): return math.sin(2 * math.pi * f / period + ph)
def pose(f):
    """Chuyển động chính + lớp phụ. Trục xoay cục bộ (đã đo): X = gập/duỗi (đùi/tay +X ra sau; thân/cổ +X gập trước; cẳng chân +X gập gối),
    Y = xoắn quanh trục xương (xoay mặt/hông/vai), Z = nghiêng/dạng sang bên."""
    P = {'loc': [HEAD.x, HEAD.y - H, 0.35], 'eul': [-90.0, 0.0, 0.0], 'b': {}}
    B = P['b']
    def add(n, x=0.0, y=0.0, z=0.0):
        o = B.get(n, (0.0, 0.0, 0.0)); B[n] = (o[0] + x, o[1] + y, o[2] + z)
    # --- chính ---
    walking = F_WALK0 <= f <= F_WALK1; env = 0.0; ph = 0.0
    if f <= F_SIT:                                             # nằm ngửa, ngủ
        sit = 0.0
    elif f <= F_LONG:                                          # ngồi dậy: đầu dẫn trước, tay chống
        t = ss((f - F_SIT) / (F_LONG - F_SIT)); t += 0.035 * math.sin(2 * math.pi * t) * 0   # không overshoot ở đây (vật lý: chống tay)
        P['eul'][0] = lerp(-90.0, 0.0, t); P['loc'] = [lerp(HEAD.x, 1.0, t), lerp(HEAD.y - H, 2.82, t), lerp(0.35, -0.40, t)]
        add('thigh.L', -90 * t); add('thigh.R', -90 * t); add('spine', 12 * t); add('neck', -8 * t)
        lead = ss((f - F_SIT) / 14.0) * (1 - ss((f - F_SIT - 10) / 20.0))                  # đầu ngẩng trước thân
        add('neck', 10 * lead); add('head', 6 * lead)
        push = math.sin(math.pi * t)                                                          # hai tay chống ra sau đẩy người lên
        for sd in 'LR': add(f'upper_arm.{sd}', 38 * push); add(f'forearm.{sd}', -8 * push)
        sit = t
    elif f <= F_SWING:                                         # xoay người, thả chân xuống mép giường
        t = ss((f - F_LONG) / (F_SWING - F_LONG)); P['eul'] = [0.0, 0.0, 90.0 * t]; P['loc'] = [1.0, 2.82, -0.40]
        add('thigh.L', -90); add('thigh.R', -90); add('shin.L', 85 * t); add('shin.R', 85 * t); add('spine', 12)
        for sd in 'LR': add(f'upper_arm.{sd}', 14 * (1 - t) + 6); add(f'forearm.{sd}', -12)   # tay đặt xuống mép nệm
        add('spine', 0, -10 * math.sin(math.pi * t))                                           # thân xoắn theo hướng quay
        sit = 1.0
    elif f <= F_DEP:                                           # ngồi mép giường, xỏ dép: chân trái dò tìm dép rồi xỏ, tới chân phải
        P['eul'] = [0.0, 0.0, 90.0]; P['loc'] = [1.0, 2.82, -0.40]
        add('thigh.L', -90); add('thigh.R', -90); add('shin.L', 85); add('shin.R', 85); add('spine', 12)
        for sd in 'LR': add(f'upper_arm.{sd}', 6); add(f'forearm.{sd}', -12)
        for sd, f0 in (('L', F_SWING + 4), ('R', F_SWING + 32)):
            u = (f - f0) / 22.0
            if 0.0 <= u <= 1.0:
                add(f'shin.{sd}', -10 * math.sin(math.pi * u) + 6 * ss(u * 2 - 1)); add(f'foot.{sd}', 24 * math.sin(math.pi * u) ** 0.7 - 14 * ss(u * 2 - 1.0) * (1 - ss((u - 0.8) * 5)))
                add('spine', 5 * math.sin(math.pi * u), 0, 2.0 * (1 if sd == 'L' else -1) * math.sin(math.pi * u))   # cúi và nghiêng người xuống tay với
                add('neck', 8 * math.sin(math.pi * u))
        sit = 1.0
    elif f <= F_STAND:                                         # đứng lên: nghiêng trước, đẩy đùi, rồi thẳng người
        t = ss((f - F_DEP) / (F_STAND - F_DEP)); P['eul'] = [0.0, 0.0, 90.0]; P['loc'] = [lerp(1.0, 1.55, t), lerp(2.82, 2.95, t), lerp(-0.40, 0.0, t)]
        add('thigh.L', -90 * (1 - t)); add('thigh.R', -90 * (1 - t)); add('shin.L', 85 * (1 - t)); add('shin.R', 85 * (1 - t))
        add('spine', 12 + 16 * math.sin(math.pi * t) * (1 - 0.3 * t) - 12 * t); add('neck', -6 * math.sin(math.pi * t))
        for sd in 'LR': add(f'upper_arm.{sd}', -10 * math.sin(math.pi * t)); add(f'forearm.{sd}', -14 * math.sin(math.pi * t))   # tay đưa ra trước giữ thăng bằng
        sit = 0.0
    else:                                                      # đứng, đi tới gương, dừng nhìn
        wt = ss((f - F_WALK0) / (F_WALK1 - F_WALK0)); P['eul'] = [0.0, 0.0, 90.0]; P['loc'] = [lerp(1.55, 2.45, wt), lerp(2.95, 3.25, wt), 0.0]
        env = min(1.0, (f - F_WALK0) / 10.0, (F_WALK1 - f) / 10.0) if walking else 0.0; ph = 2 * math.pi * (f - F_WALK0) / 40.0
        for side, off, sg in (('L', 0.0, 1.0), ('R', math.pi, -1.0)):
            sp = math.sin(ph + off); cp = math.cos(ph + off)
            add(f'thigh.{side}', 26 * sp * env); add(f'shin.{side}', 5 * env + 44 * max(0.0, -cp) ** 1.3 * env)
            add(f'foot.{side}', (-12 * max(0.0, math.sin(ph + off + 1.9)) + 20 * max(0.0, math.sin(ph + off - 1.2))) * env)   # gót chạm → lăn → đẩy mũi
            add(f'upper_arm.{side}', -17 * sp * env + 3); add(f'forearm.{side}', -(12 + 14 * max(0.0, sp)) * env)
            add(f'upper_arm.{side}', 0, 0, sg * 2.0)                                              # tay hơi dạng khỏi thân
        add('pelvis', 0, 7 * math.sin(ph) * env, 2.5 * math.sin(ph) * env)                       # hông xoay + nghiêng theo bước
        add('spine', 0, -5 * math.sin(ph) * env); add('chest', 0, -4 * math.sin(ph) * env)        # thân trên xoắn ngược hông
        add('neck', 0, 1.5 * math.sin(ph - 0.6) * env); add('head', 0, 1.5 * math.sin(ph - 0.6) * env)   # đầu giữ ổn định, trễ pha
        add('spine', 2 * env)                                                                     # hơi gập trước khi đi
        P['loc'][2] = 0.016 * math.cos(2 * ph) * env; P['loc'][1] += 0.014 * math.sin(ph) * env  # nhún lên xuống + đổi trọng tâm sang bên
        if f > F_WALK1:                                        # dừng trước gương: đầu cúi nhẹ nhìn kính, đổi trọng tâm
            t = ss((f - F_WALK1) / 30.0); add('neck', 6 * t); add('head', -3 * t); add('pelvis', 0, 0, 1.5 * math.sin((f - F_WALK1) / 18.0) * t)
            for sd in 'LR': add(f'upper_arm.{sd}', 3); add(f'forearm.{sd}', -10)
        sit = 0.0
    # --- lớp phụ liên tục ---
    breath = osc(f, 90.0); add('chest', 1.2 * breath); add('spine', 0.6 * breath)                  # thở
    for sd in 'LR':                                            # khuỷu và gối luôn hơi cong (không duỗi thẳng cứng)
        if not walking: add(f'forearm.{sd}', -6)
        add(f'shin.{sd}', 2.5 if f > F_SWING and not walking else 0.0)
    add('head', 0, 2.0 * osc(f, 150.0, 0.7) * (1.0 - env), 0)                                    # đầu xoay vi mô
    add('neck', 0.8 * osc(f, 110.0) * (1.0 - env))
    if f <= F_SIT: add('head', 0, 0, 1.5 * osc(f, 130.0)); add('spine', 0, 0, 0.5 * breath)       # ngủ: đầu lắc nhẹ theo nhịp thở
    return P
def aplicar(f):
    P = pose(f); rig.location = P['loc']; rig.rotation_euler = [R(x) for x in P['eul']]
    for b in rig.pose.bones: b.rotation_euler = (0, 0, 0)
    for n, (x, y, z) in P['b'].items():
        if n in rig.pose.bones: rig.pose.bones[n].rotation_euler = (R(x), R(y), R(z))

def fcs(ob):
    """fcurves của object (Blender 5.x: action theo slot → layers/strips/channelbags)."""
    act = ob.animation_data.action
    if hasattr(act, 'fcurves'): return list(act.fcurves)
    out = []
    for layer in act.layers:
        for strip in layer.strips:
            for cb in strip.channelbags: out += list(cb.fcurves)
    return out
# ---------------- dép: ngủ không đi dép (bỏ giày của stickman), dép nằm dưới sàn cạnh giường, xỏ vào trước khi đứng
for n in ('Cloth_nam_Shoe_L', 'Cloth_nam_Shoe_R'):
    if n in bpy.data.objects: bpy.data.objects.remove(bpy.data.objects[n], do_unlink=True)
import dung_stickman_cast as _d
mat_dep = _d.create_material('Mat_dep', '#3f5a52', roughness=0.7); mat_quai = _d.create_material('Mat_dep_quai', '#d9d2c3', roughness=0.6)
def tao_dep(ten):
    bpy.ops.mesh.primitive_cube_add(size=1); d = bpy.context.active_object; d.name = ten; d.scale = (0.095, 0.25, 0.018); bpy.ops.object.transform_apply(scale=True); d.data.materials.append(mat_dep)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.02, 0.016)); q = bpy.context.active_object; q.name = ten + '_quai'; q.scale = (0.095, 0.07, 0.016); bpy.ops.object.transform_apply(scale=True); q.data.materials.append(mat_quai)
    q.parent = d; return d
aplicar(F_DEP); bpy.context.view_layer.update()
dep_san, dep_chan = {}, {}
for sd in 'LR':
    pb = rig.pose.bones[f'foot.{sd}']; wm = rig.matrix_world @ pb.matrix; hd = wm.translation
    # vị trí cuối: dưới bàn chân khi xỏ xong, đặt trên sàn, mũi hướng +X (hướng người)
    fin = Vector((hd.x + 0.02, hd.y, 0.010)); yaw = math.radians(90)
    from mathutils import Matrix as _M
    des = _M.Translation(fin) @ _M.Rotation(yaw, 4, 'Z') @ _M.Rotation(0, 4, 'X')
    d0 = tao_dep(f'dep_san_{sd}'); d0.matrix_world = _M.Translation(fin + Vector((0.07, 0.035 * (1 if sd == 'L' else -1), 0))) @ _M.Rotation(yaw + math.radians(20 if sd == 'L' else -26), 4, 'Z')   # dép bị đá lệch lúc cởi
    dep_san[sd] = (d0, des, fin)
    d1 = tao_dep(f'dep_chan_{sd}'); d1.parent = rig; d1.parent_type = 'BONE'; d1.parent_bone = f'foot.{sd}'
    d1.matrix_parent_inverse = (rig.matrix_world @ pb.matrix).inverted() @ des
    dep_chan[sd] = d1
aplicar(F_SIT); bpy.context.view_layer.update()
for sd in 'LR':
    d0, des, fin = dep_san[sd]; hien_off = F_DEP + 1
    d0.hide_render = False; d0.keyframe_insert('hide_render', frame=F_SIT); d0.hide_render = True; d0.keyframe_insert('hide_render', frame=hien_off)
    for fc in fcs(d0): [setattr(k, 'interpolation', 'CONSTANT') for k in fc.keyframe_points]
    for ch in d0.children:
        ch.hide_render = False; ch.keyframe_insert('hide_render', frame=F_SIT); ch.hide_render = True; ch.keyframe_insert('hide_render', frame=hien_off)
        for fc in fcs(ch): [setattr(k, 'interpolation', 'CONSTANT') for k in fc.keyframe_points]
    # dép lết vào vị trí lúc chân xỏ: nội suy từ vị trí lệch tới vị trí cuối trong khoảng xỏ
    t0 = F_SWING + (4 if sd == 'L' else 32); t1 = t0 + 22; l0 = d0.location.copy(); r0 = d0.rotation_euler.copy()
    d0.keyframe_insert('location', frame=F_SIT); d0.keyframe_insert('rotation_euler', frame=F_SIT); d0.keyframe_insert('location', frame=t0 + 8); d0.keyframe_insert('rotation_euler', frame=t0 + 8)
    d0.location = fin; d0.rotation_euler = (0, 0, math.radians(90)); d0.keyframe_insert('location', frame=t1); d0.keyframe_insert('rotation_euler', frame=t1)
    d1 = dep_chan[sd]; d1.hide_render = True; d1.keyframe_insert('hide_render', frame=F_SIT); d1.hide_render = False; d1.keyframe_insert('hide_render', frame=F_DEP + 1)
    for fc in fcs(d1): [setattr(k, 'interpolation', 'CONSTANT') for k in fc.keyframe_points]
    for ch in d1.children:
        ch.hide_render = True; ch.keyframe_insert('hide_render', frame=F_SIT); ch.hide_render = False; ch.keyframe_insert('hide_render', frame=F_DEP + 1)
        for fc in fcs(ch): [setattr(k, 'interpolation', 'CONSTANT') for k in fc.keyframe_points]
# ---------------- camera tự nhiên: nhiều góc cắt cảnh, hơi rung tay, bám theo người (không gò bó một góc)
tgt = bpy.data.objects.new('muc_tieu_nam', None); sc.collection.objects.link(tgt); tgt.parent = rig; tgt.parent_type = 'BONE'; tgt.parent_bone = 'chest'
def cam_moi(ten, pos, nhin, f_mm, f0, f1, rung=1.0, theo=True):
    pos = (X.mx(pos[0]), pos[1], pos[2]); nhin = (X.mx(nhin[0]), nhin[1], nhin[2])
    cd = bpy.data.cameras.new(ten); cd.lens = f_mm; cd.sensor_width = 36.0; cd.clip_start = 0.05; cd.dof.use_dof = True; cd.dof.focus_object = tgt; cd.dof.aperture_fstop = 2.8
    ob = bpy.data.objects.new(ten, cd); sc.collection.objects.link(ob); ob.location = pos
    d_ = Vector(nhin) - Vector(pos); ob.rotation_euler = d_.to_track_quat('-Z', 'Y').to_euler()
    if theo:
        tc = ob.constraints.new('TRACK_TO'); tc.target = tgt; tc.track_axis = 'TRACK_NEGATIVE_Z'; tc.up_axis = 'UP_Y'; tc.influence = 0.85    # bám theo người nhưng không dính cứng
    # trôi chậm + rung tay
    ob.keyframe_insert('location', frame=f0); ob.location = (pos[0] + 0.05 * (1 if f_mm < 30 else -1), pos[1] + 0.04, pos[2] + 0.02); ob.keyframe_insert('location', frame=f1)
    for fc in fcs(ob):
        m = fc.modifiers.new('NOISE'); m.scale = 18.0; m.strength = 0.012 * rung; m.phase = hash(ten) % 50
    mk = sc.timeline_markers.new(ten, frame=f0); mk.camera = ob
    return ob
sc.timeline_markers.clear()
cam_moi('CAM_1_chan_giuong', (2.35, 1.2, 0.85), (2.3, 3.1, 0.7), 26, F_SIT, F_SWING, 1.0)                       # từ chân giường, thấp, nhìn Nam ngồi dậy
cam_moi('CAM_2_dep', (0.2, 2.1, 0.55), (1.6, 2.85, 0.18), 32, F_SWING, F_DEP, 1.2, theo=False)                          # sát sàn: xỏ dép
cam_moi('CAM_3_cua_so', (0.2, 1.7, 1.4), (1.7, 3.2, 1.0), 24, F_DEP, F_WALK0 + 30, 1.0)                       # từ phía cửa sổ: đứng lên, quay người
cam_moi('CAM_4_theo', (1.5, 0.35, 1.6), (1.2, 3.1, 1.0), 20, F_WALK0 + 30, F_END, 0.8)                           # rộng: đi tới gương
if a.dong:
    for f in range(F_SIT, F_END + 1, 2):
        aplicar(f); rig.keyframe_insert('location', frame=f); rig.keyframe_insert('rotation_euler', frame=f)
        for b in rig.pose.bones: b.keyframe_insert('rotation_euler', frame=f)
    sc.frame_start, sc.frame_end = F_SIT, F_END; sc.render.fps = 24
os.makedirs(a.ra, exist_ok=True)
if os.environ.get('DT_DEBUG'):
    for f in (380, 450, 520, 600):
        sc.frame_set(f); bpy.context.view_layer.update(); cm = sc.camera; print('DBG f', f, 'camera', cm.name, tuple(round(x, 2) for x in cm.matrix_world.translation), 'ngực', tuple(round(x, 2) for x in tgt.matrix_world.translation), 'hông rig', tuple(round(x, 2) for x in rig.location))
if a.dong:
    for f in [int(x) for x in a.khung.split(',')]:
        sc.frame_set(f); sc.render.filepath = os.path.join(a.ra, f'd_{f:03d}.png'); bpy.ops.render.render(write_still=True)
else:
    sc.render.filepath = os.path.join(a.ra, f'that_{a.cam}.png'); bpy.ops.render.render(write_still=True)
if a.blend: bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))
