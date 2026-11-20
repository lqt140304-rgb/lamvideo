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
F_SIT, F_LONG, F_SWING, F_STAND, F_WALK0, F_WALK1, F_END = 360, 400, 450, 500, 560, 640, 720
def pose(f):
    P = {'loc': [HEAD.x, HEAD.y - H, 0.35], 'eul': [-90.0, 0.0, 0.0], 'b': {}}
    B = P['b']
    def setb(n, x=0.0, z=0.0): B[n] = (x, z)
    if f <= F_SIT:                                             # nằm ngửa
        pass
    elif f <= F_LONG:                                          # ngồi dậy, chân duỗi về phía −Y
        t = ss((f - F_SIT) / (F_LONG - F_SIT)); P['eul'][0] = lerp(-90.0, 0.0, t); P['loc'] = [lerp(HEAD.x, 1.0, t), lerp(HEAD.y - H, 2.82, t), lerp(0.35, -0.40, t)]
        setb('thigh.L', -90 * t); setb('thigh.R', -90 * t); setb('spine', 12 * t); setb('neck', -8 * t)
    elif f <= F_SWING:                                         # xoay người, thả chân xuống mép giường (+X), gối gập
        t = ss((f - F_LONG) / (F_SWING - F_LONG)); P['eul'] = [0.0, 0.0, 90.0 * t]; P['loc'] = [1.0, 2.82, -0.40]
        setb('thigh.L', -90); setb('thigh.R', -90); setb('shin.L', 85 * t); setb('shin.R', 85 * t); setb('spine', 12)
    elif f <= F_STAND:                                         # đứng lên, người nghiêng trước rồi thẳng
        t = ss((f - F_SWING) / (F_STAND - F_SWING)); P['eul'] = [0.0, 0.0, 90.0]; P['loc'] = [lerp(1.0, 1.55, t), lerp(2.82, 2.95, t), lerp(-0.40, 0.0, t)]
        setb('thigh.L', -90 * (1 - t)); setb('thigh.R', -90 * (1 - t)); setb('shin.L', 85 * (1 - t)); setb('shin.R', 85 * (1 - t)); setb('spine', 12 + 14 * math.sin(math.pi * t) * (1 - t) - 12 * t)
    else:                                                      # đứng, đi tới gương, dừng nhìn gương
        wt = ss((f - F_WALK0) / (F_WALK1 - F_WALK0)); P['eul'] = [0.0, 0.0, 90.0]; P['loc'] = [lerp(1.55, 2.45, wt), lerp(2.95, 3.25, wt), 0.0]
        walking = F_WALK0 <= f <= F_WALK1
        k = 1.0 if walking else 0.0; ph = 2 * math.pi * (f - F_WALK0) / 40.0; env = min(1.0, (f - F_WALK0) / 8.0, (F_WALK1 - f) / 8.0) if walking else 0.0
        for side, off in (('L', 0.0), ('R', math.pi)):
            sp = math.sin(ph + off); cp = math.cos(ph + off)
            setb(f'thigh.{side}', 24 * sp * env); setb(f'shin.{side}', 6 * env + 42 * max(0.0, -cp) * env)
            setb(f'upper_arm.{side}', -16 * sp * env); setb(f'forearm.{side}', -14 * env)
        P['loc'][2] = 0.012 * math.cos(2 * ph) * env
        if f > F_WALK1: setb('neck', 4 * ss((f - F_WALK1) / 30.0)); setb('head', -4 * ss((f - F_WALK1) / 30.0))
    return P
def aplicar(f):
    P = pose(f); rig.location = P['loc']; rig.rotation_euler = [R(x) for x in P['eul']]
    for b in rig.pose.bones: b.rotation_euler = (0, 0, 0)
    for n, (x, z) in P['b'].items():
        if n in rig.pose.bones: rig.pose.bones[n].rotation_euler = (R(x), 0, R(z))
if a.dong:
    for f in range(F_SIT, F_END + 1, 4):
        aplicar(f); rig.keyframe_insert('location', frame=f); rig.keyframe_insert('rotation_euler', frame=f)
        for b in rig.pose.bones: b.keyframe_insert('rotation_euler', frame=f)
    sc.frame_start, sc.frame_end = F_SIT, F_END; sc.render.fps = 24
os.makedirs(a.ra, exist_ok=True)
if a.dong:
    for f in [int(x) for x in a.khung.split(',')]:
        sc.frame_set(f); sc.render.filepath = os.path.join(a.ra, f'd_{f:03d}.png'); bpy.ops.render.render(write_still=True)
else:
    sc.render.filepath = os.path.join(a.ra, f'that_{a.cam}.png'); bpy.ops.render.render(write_still=True)
if a.blend: bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))
