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
sc = X.build(a.che_do, 0.0, 0.0, 0.0, a.cam, (a.rong, round(a.rong / 2.39)), den_ban=(a.che_do == 'night'))
sc.cycles.samples = a.mau
sc.render.use_motion_blur = True; sc.render.motion_blur_shutter = 0.5          # nhòe chuyển động: bù khi chỉ render 12 khung/giây rồi nội suy
sc.render.fps = 24
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

# ---------------- diễn hoạt 360–720: tư thế khoá + nội suy, hông luôn ghim trên nệm/sàn (không bay), lớp phụ cộng thêm
# trục xoay cục bộ đã đo: X = gập/duỗi (đùi/tay +X ra sau; thân/cổ +X gập trước; cẳng chân +X gập gối), Y = xoắn quanh trục xương, Z = nghiêng/dạng sang bên
R = math.radians
for b in rig.pose.bones:
    b.rotation_mode = 'XYZ'
    for c_ in b.constraints: c_.influence = 0.0
from mathutils import Euler, Quaternion
def ss(t): t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)
def lerp(x, y, t): return x + (y - x) * t
def osc(f, period, ph=0.0): return math.sin(2 * math.pi * f / period + ph)
def bump(f, c, w): return max(0.0, 1.0 - abs(f - c) / w)
# mốc thời gian (24 fps): ngủ → trở mình → vươn vai/ngáp → nằm nghiêng ra mép → chống tay ngồi dậy → ngồi, dụi mắt → xỏ dép → đứng → đi → nhìn gương
F_SIT, F_STIR, F_STRETCH, F_ROLL, F_PUSH, F_SEAT, F_SWING, F_DEP, F_STAND, F_WALK0, F_WALK1, F_END = 360, 372, 388, 410, 424, 452, 476, 536, 580, 604, 684, 720
HIP = 0.76                                                                    # cao độ khớp háng (đầu xương pelvis) so với bàn chân khi đứng
SLEEP = {'neck': (4, 12, 3), 'head': (6, 30, -4), 'spine': (9, 8, 3), 'chest': (0, 5, 0), 'thigh.L': (-46, 0, -6), 'shin.L': (78, 0, 0), 'foot.L': (12, 0, 0), 'thigh.R': (-12, 0, 0), 'shin.R': (26, 0, 0),
         'upper_arm.L': (-148, 0, 10), 'forearm.L': (-32, 0, 0), 'upper_arm.R': (-22, 0, -18), 'forearm.R': (-78, 0, 0)}
STIR = {'neck': (2, 6, 0), 'head': (3, 10, 0), 'spine': (3, 2, 0), 'thigh.L': (-25, 0, -3), 'shin.L': (45, 0, 0), 'thigh.R': (-6, 0, 0), 'shin.R': (12, 0, 0),
        'upper_arm.L': (-95, 0, 25), 'forearm.L': (-115, 0, 0), 'upper_arm.R': (-10, 0, -10), 'forearm.R': (-20, 0, 0)}
STRETCH = {'neck': (-6, 0, 0), 'head': (-8, 0, 0), 'spine': (-6, 0, 0), 'chest': (-4, 0, 0), 'foot.L': (28, 0, 0), 'foot.R': (28, 0, 0),
           'upper_arm.L': (-168, 0, 18), 'forearm.L': (-8, 0, 0), 'upper_arm.R': (-168, 0, -18), 'forearm.R': (-8, 0, 0)}
RELAX = {'thigh.L': (-8, 0, 0), 'shin.L': (10, 0, 0), 'thigh.R': (-6, 0, 0), 'shin.R': (8, 0, 0), 'upper_arm.L': (5, 0, 8), 'forearm.L': (-12, 0, 0), 'upper_arm.R': (5, 0, -8), 'forearm.R': (-12, 0, 0), 'neck': (3, 0, 0)}
SIDE = {'thigh.L': (-60, 0, 0), 'shin.L': (75, 0, 0), 'thigh.R': (-55, 0, 0), 'shin.R': (70, 0, 0), 'upper_arm.L': (-40, 0, 0), 'forearm.L': (-60, 0, 0), 'upper_arm.R': (-20, 0, 0), 'forearm.R': (-90, 0, 0), 'spine': (8, 0, 0), 'neck': (6, 0, 0)}
SEATED = {'thigh.L': (-90, 0, 0), 'thigh.R': (-90, 0, 0), 'shin.L': (85, 0, 0), 'shin.R': (85, 0, 0), 'spine': (12, 0, 0), 'neck': (10, 0, 0), 'head': (8, 0, 0),
          'upper_arm.L': (14, 0, 0), 'upper_arm.R': (14, 0, 0), 'forearm.L': (-12, 0, 0), 'forearm.R': (-12, 0, 0)}
STAND0 = {'spine': (2, 0, 0)}
# (khung, vị trí khớp háng thế giới, góc Euler thân (độ), tư thế xương). Khớp háng được ghim: người xoay quanh háng chứ không quanh bàn chân.
KEYS = [(F_SIT, (1.03, 2.82, 0.355), (-90, 24, 0), SLEEP), (F_STIR, (1.02, 2.82, 0.355), (-90, 6, 0), STIR), (F_STRETCH, (1.00, 2.82, 0.355), (-90, 0, 0), STRETCH),
        (F_ROLL, (1.00, 2.82, 0.355), (-90, 0, 0), RELAX), (F_PUSH, (1.03, 2.82, 0.355), (-90, 78, 0), SIDE), (F_SEAT, (1.16, 2.82, 0.36), (0, 0, 90), SEATED),
        (F_DEP, (1.16, 2.82, 0.36), (0, 0, 90), SEATED), (F_STAND, (1.58, 2.92, HIP), (0, 0, 90), STAND0)]
def quat(e): return Euler([R(x) for x in e], 'XYZ').to_quaternion()
def noi_suy(f):
    """(vị trí hông, quaternion thân, bones) tại khung f từ bảng KEYS (ease giữa hai mốc)."""
    f = max(KEYS[0][0], min(f, KEYS[-1][0]))
    for i in range(len(KEYS) - 1):
        f0, h0, e0, b0 = KEYS[i]; f1, h1, e1, b1 = KEYS[i + 1]
        if f0 <= f <= f1:
            t = ss((f - f0) / max(1, f1 - f0)); hw = Vector([lerp(h0[k], h1[k], t) for k in range(3)])
            bones = {n: tuple(lerp(b0.get(n, (0, 0, 0))[k], b1.get(n, (0, 0, 0))[k], t) for k in range(3)) for n in set(b0) | set(b1)}
            return hw, quat(e0).slerp(quat(e1), t), bones, t, i
def pose(f):
    """Trả về (vị trí hông, quaternion thân, {xương: (x,y,z) độ}). Chuyển động chính + lớp phụ."""
    B = {}
    def add(n, x=0.0, y=0.0, z=0.0):
        o = B.get(n, (0.0, 0.0, 0.0)); B[n] = (o[0] + x, o[1] + y, o[2] + z)
    walking = F_WALK0 <= f <= F_WALK1; env = 0.0
    if f <= F_STAND:
        hw, q, bones, t, seg = noi_suy(f); B.update(bones)
        if F_STIR <= f <= F_STRETCH:                                           # trở mình: tay trái dụi mắt
            add('forearm.L', 9 * osc(f, 7.0) * bump(f, (F_STIR + F_STRETCH) / 2, 8.0)); add('head', 0, 6 * osc(f, 11.0) * bump(f, 380, 8.0))
        if F_PUSH <= f <= F_SEAT:                                              # chống tay đẩy người lên: tay ra sau, đầu dẫn
            push = math.sin(math.pi * (f - F_PUSH) / (F_SEAT - F_PUSH))
            for sd in 'LR': add(f'upper_arm.{sd}', 40 * push); add(f'forearm.{sd}', -6 * push)
            add('neck', -8 * push); add('spine', 10 * push)
        if F_SEAT <= f <= F_SWING:                                             # ngồi mép giường, gãi đầu/dụi mặt, nhìn quanh
            g = bump(f, (F_SEAT + F_SWING) / 2 - 2, 10.0)
            add('upper_arm.L', -118 * g); add('forearm.L', -98 * g + 7 * g * osc(f, 6.0)); add('head', 8 * g, 14 * g * osc(f, 18.0), 0); add('spine', -3 * g)
        if F_SWING <= f <= F_DEP:                                              # xỏ dép: chân trái dò tìm rồi xỏ, tới chân phải
            for sd, f0 in (('L', F_SWING + 4), ('R', F_SWING + 32)):
                u = (f - f0) / 22.0
                if 0.0 <= u <= 1.0:
                    add(f'shin.{sd}', -10 * math.sin(math.pi * u) + 6 * ss(u * 2 - 1)); add(f'foot.{sd}', 24 * math.sin(math.pi * u) ** 0.7 - 14 * ss(u * 2 - 1.0) * (1 - ss((u - 0.8) * 5)))
                    add('spine', 5 * math.sin(math.pi * u), 0, 2.0 * (1 if sd == 'L' else -1) * math.sin(math.pi * u)); add('neck', 8 * math.sin(math.pi * u))
        if F_DEP <= f <= F_STAND:                                              # đứng lên: nghiêng trước, đẩy tay lên đùi, rồi thẳng người
            u = (f - F_DEP) / (F_STAND - F_DEP)
            add('spine', 16 * math.sin(math.pi * u) * (1 - 0.3 * u)); add('neck', -6 * math.sin(math.pi * u))
            for sd in 'LR': add(f'upper_arm.{sd}', -10 * math.sin(math.pi * u)); add(f'forearm.{sd}', -14 * math.sin(math.pi * u))
        sw = 1.0 - ss((f - F_SIT) / 14.0)                                      # nhịp thở sâu khi ngủ
        add('chest', 2.4 * sw * osc(f, 84.0)); add('pelvis', 0, 0, 1.2 * sw * osc(f, 84.0, 0.4))
    else:                                                                      # đứng, đi tới gương, dừng nhìn
        wt = ss((f - F_WALK0) / (F_WALK1 - F_WALK0)); hw = Vector((lerp(1.58, 2.45, wt), lerp(2.92, 3.25, wt), HIP)); q = quat((0, 0, 90)); B.update(STAND0)
        env = min(1.0, (f - F_WALK0) / 10.0, (F_WALK1 - f) / 10.0) if walking else 0.0; ph = 2 * math.pi * (f - F_WALK0) / 40.0
        for side, off, sg in (('L', 0.0, 1.0), ('R', math.pi, -1.0)):
            sp = math.sin(ph + off); cp = math.cos(ph + off)
            add(f'thigh.{side}', 26 * sp * env); add(f'shin.{side}', 5 * env + 44 * max(0.0, -cp) ** 1.3 * env)
            add(f'foot.{side}', (-12 * max(0.0, math.sin(ph + off + 1.9)) + 20 * max(0.0, math.sin(ph + off - 1.2))) * env)       # gót chạm → lăn → đẩy mũi
            add(f'upper_arm.{side}', -17 * sp * env + 3); add(f'forearm.{side}', -(12 + 14 * max(0.0, sp)) * env); add(f'upper_arm.{side}', 0, 0, sg * 2.0)
        add('pelvis', 0, 7 * math.sin(ph) * env, 2.5 * math.sin(ph) * env); add('spine', 0, -5 * math.sin(ph) * env); add('chest', 0, -4 * math.sin(ph) * env)        # hông xoay, thân trên xoắn ngược
        add('neck', 0, 1.5 * math.sin(ph - 0.6) * env); add('head', 0, 1.5 * math.sin(ph - 0.6) * env); add('spine', 2 * env)                                          # đầu giữ ổn định, trễ pha
        hw.z += 0.016 * math.cos(2 * ph) * env; hw.y += 0.014 * math.sin(ph) * env                                                                                    # nhún lên xuống, đổi trọng tâm
        if f > F_WALK1:
            t = ss((f - F_WALK1) / 30.0); add('neck', 6 * t); add('head', -3 * t); add('pelvis', 0, 0, 1.5 * math.sin((f - F_WALK1) / 18.0) * t)
            for sd in 'LR': add(f'upper_arm.{sd}', 3); add(f'forearm.{sd}', -10)
    sw = 1.0 - ss((f - F_SIT) / 22.0) if f >= F_SIT else 1.0
    breath = osc(f, 90.0); add('chest', 1.2 * breath); add('spine', 0.6 * breath)                                                                                      # thở
    for sd in 'LR':
        if not walking: add(f'forearm.{sd}', -6 if f > F_ROLL else 0)                                                                                                    # khuỷu luôn hơi cong
    add('head', 0, 2.0 * osc(f, 150.0, 0.7) * (1.0 - env), 0); add('neck', 0.8 * osc(f, 110.0) * (1.0 - env))
    if f <= F_STIR: add('head', 0, 0, 1.5 * osc(f, 130.0))
    return hw, q, B
def aplicar(f):
    hw, q, B = pose(f); rig.rotation_mode = 'QUATERNION'; rig.rotation_quaternion = q; rig.location = hw - q @ Vector((0, 0, HIP))      # xoay quanh khớp háng
    for b in rig.pose.bones: b.rotation_euler = (0, 0, 0)
    for n, (x, y, z) in B.items():
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

# ---------------- chăn xộc xệch phủ lên chân/hông Nam, hất ra khi tỉnh (shape key)
import bmesh, random
_mat_chan = bpy.data.objects['chan_nem'].active_material if 'chan_nem' in bpy.data.objects else None
bm = bmesh.new(); NX, NY = 52, 40; X0, X1, Y0, Y1 = 0.06, 1.40, 2.08, 3.12
vs = [[bm.verts.new((lerp(X0, X1, i / NX), lerp(Y0, Y1, j / NY), 0.30)) for j in range(NY + 1)] for i in range(NX + 1)]
for i in range(NX):
    for j in range(NY): bm.faces.new((vs[i][j], vs[i + 1][j], vs[i + 1][j + 1], vs[i][j + 1]))
me_c = bpy.data.meshes.new('chan_xoc_xech'); bm.to_mesh(me_c); bm.free(); chan = bpy.data.objects.new('chan_xoc_xech', me_c); sc.collection.objects.link(chan)
if _mat_chan: chan.data.materials.append(_mat_chan)
random.seed(7)
def z_phu(x, y):
    xb = 1.0 + 0.04 * (y - 2.5)                                           # trục thân nghiêng nhẹ
    body = 0.15 * math.exp(-((x - xb) / 0.13) ** 2) * (1.0 if y < 2.85 else math.exp(-((y - 2.85) / 0.13) ** 2) * 0.6 + 0.4 * math.exp(-((y - 2.85) / 0.3) ** 2))
    # chân co lên (trái): gò cao hơn, lệch về mép giường
    knee = 0.10 * math.exp(-(((x - 1.14) / 0.10) ** 2 + ((y - 2.55) / 0.2) ** 2))
    ng = 0.014 * math.sin(21 * x + 6 * y + 1.3) + 0.010 * math.sin(33 * x - 9 * y) + 0.018 * math.sin(7 * y + 3 * x)   # nếp nhăn
    rua = 0.10 * max(0.0, (y - 2.78) / 0.34) ** 2                          # mép trên chăn hất xuống, nhàu về một phía
    edge = min(1.0, (x - X0) / 0.12, (X1 - x) / 0.12, (y - Y0) / 0.10)
    return max(0.266, 0.268 + (body + knee + ng * 1.0) * (0.35 + 0.65 * ss(edge * 1.2)) * (1 - 0.7 * rua / 0.10 * 0.2) - 0.012 * (1 - ss(edge * 2.0)))
for i in range(NX + 1):
    for j in range(NY + 1):
        v = me_c.vertices[i * (NY + 1) + j]; v.co.z = z_phu(v.co.x, v.co.y)
chan.shape_key_add(name='Basis', from_mix=False)
kd = chan.shape_key_add(name='da_di', from_mix=False)
for i in range(NX + 1):
    for j in range(NY + 1):
        v = me_c.vertices[i * (NY + 1) + j]; x, y = v.co.x, v.co.y
        # chăn bị đá về phía chân giường (y nhỏ): dồn cục, ngoại hình thấp trên thân
        yy = Y0 + (y - Y0) * 0.38; bunch = 0.10 * math.exp(-((y - Y0 - 0.22) / 0.18) ** 2) * (0.6 + 0.4 * math.sin(14 * x))
        kd.data[i * (NY + 1) + j].co = (x + 0.05 * math.sin(3 * y), yy, max(0.266, 0.268 + bunch + 0.01 * math.sin(19 * x + 4 * y)))
for p_ in me_c.polygons: p_.use_smooth = True
chan.modifiers.new('day', 'SOLIDIFY').thickness = 0.018
if a.dong:
    for f_, v_ in ((F_SIT, 0.0), (F_STRETCH, 0.0), (F_PUSH, 1.0), (F_END, 1.0)):                      # chăn bị đá ra khi vươn vai/lăn ra mép
        kd.value = v_; kd.keyframe_insert('value', frame=f_)
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

# ---------------- biểu cảm khuôn mặt (shape key: mắt nham/lim/mo_to, mày nang/ha/lo/gian, miệng cuoi/buon/o)
FACE = {}
for o in bpy.data.objects:
    if o.name.startswith('Face_nam_') and o.type == 'MESH' and o.data.shape_keys:
        for k in o.data.shape_keys.key_blocks:
            if k.name != 'Basis': FACE.setdefault((('Eye' if '_Eye_' in o.name else 'Brow' if '_Brow_' in o.name else 'Mouth'), k.name), []).append(k)
def bump(f, c, w): return max(0.0, 1.0 - abs(f - c) / w)
def blink_val(f):                                                          # chớp mắt định kỳ, hơi ngẫu nhiên
    v = 0.0
    for c in (F_SIT + 52, F_SIT + 118, F_SIT + 190, F_SIT + 262, F_SIT + 330): v = max(v, bump(f, c, 4.0))
    return v
def bieu_cam(f):
    E = {k: 0.0 for k in FACE}
    def put(part, key, v):
        if (part, key) in E: E[(part, key)] = max(E[(part, key)], min(1.0, v))
    def blend(a, b, t): return a + (b - a) * ss(t)
    if f <= F_STIR:                                                         # đang ngủ, miệng hé, mày xệ
        put('Eye', 'nham', blend(1.0, 0.8, (f - F_SIT) / (F_STIR - F_SIT))); put('Mouth', 'o', 0.18); put('Mouth', 'buon', 0.15); put('Brow', 'ha', 0.25)
    elif f <= F_STRETCH:                                                    # trở mình, dụi mắt
        rub = bump(f, 380, 7.0); put('Eye', 'nham', 0.55 + 0.35 * rub); put('Brow', 'ha', 0.30); put('Mouth', 'buon', 0.2)
    elif f <= F_ROLL:                                                       # vươn vai + ngáp
        yawn = bump(f, 398, 9.0); put('Mouth', 'o', yawn); put('Eye', 'nham', 0.85 * yawn); put('Brow', 'nang', 0.55 * yawn); put('Eye', 'lim', 0.5 * (1 - yawn)); put('Brow', 'ha', 0.2 * (1 - yawn))
    elif f <= F_SEAT:                                                       # lười, mơ màng chuẩn bị ngồi dậy
        put('Eye', 'lim', 0.45); put('Brow', 'ha', 0.15); put('Mouth', 'buon', 0.15)
    elif f <= F_SWING:                                                      # ngồi gãi đầu, dụi mặt, hơi ngơ ngác
        put('Eye', 'lim', 0.35 + 0.4 * bump(f, 464, 8.0)); put('Brow', 'ha', 0.15); put('Mouth', 'buon', 0.2)
    elif f <= F_DEP:                                                        # tập trung xỏ dép
        put('Eye', 'lim', 0.30); put('Brow', 'gian', 0.30); put('Brow', 'ha', 0.10)
    elif f <= F_WALK0:                                                      # đứng lên, mặt hơi uể oải
        put('Eye', 'lim', 0.20 * (1 - (f - F_DEP) / (F_WALK0 - F_DEP))); put('Mouth', 'buon', 0.2); put('Brow', 'nang', 0.15)
    else:                                                                   # tới gần gương: lo dần, mắt mở to
        t = ss((f - F_WALK0) / (F_END - F_WALK0))
        put('Brow', 'lo', 0.8 * t); put('Eye', 'mo_to', 0.65 * t); put('Mouth', 'buon', 0.6 * t); put('Brow', 'nang', 0.2 * t)
        if f > F_WALK1: put('Mouth', 'o', 0.35 * ss((f - F_WALK1) / 30.0))
    put('Eye', 'nham', blink_val(f) if f > F_SIT + 14 else 0.0)
    return E
if a.dong:
    for f in range(F_SIT, F_END + 1, 2):
        for key, v in bieu_cam(f).items():
            for kb in FACE[key]: kb.value = v; kb.keyframe_insert('value', frame=f)
# ---------------- camera tự nhiên: nhiều góc cắt cảnh, hơi rung tay, bám theo người (không gò bó một góc)
tgt = bpy.data.objects.new('muc_tieu_nam', None); sc.collection.objects.link(tgt); tgt.parent = rig; tgt.parent_type = 'BONE'; tgt.parent_bone = 'chest'
tgt_dau = bpy.data.objects.new('muc_tieu_dau', None); sc.collection.objects.link(tgt_dau); tgt_dau.parent = rig; tgt_dau.parent_type = 'BONE'; tgt_dau.parent_bone = 'head'; tgt_dau.location = (0, -0.13, 0)
def cam_moi(ten, pos, nhin, f_mm, f0, f1, rung=1.0, theo=True, muc=None):
    muc = muc or tgt
    pos = (X.mx(pos[0]), pos[1], pos[2]); nhin = (X.mx(nhin[0]), nhin[1], nhin[2])
    cd = bpy.data.cameras.new(ten); cd.lens = f_mm; cd.sensor_width = 36.0; cd.clip_start = 0.05; cd.dof.use_dof = True; cd.dof.focus_object = muc; cd.dof.aperture_fstop = 2.8
    ob = bpy.data.objects.new(ten, cd); sc.collection.objects.link(ob); ob.location = pos
    d_ = Vector(nhin) - Vector(pos); ob.rotation_euler = d_.to_track_quat('-Z', 'Y').to_euler()
    if theo:
        tc = ob.constraints.new('TRACK_TO'); tc.target = muc; tc.track_axis = 'TRACK_NEGATIVE_Z'; tc.up_axis = 'UP_Y'; tc.influence = 0.85    # bám theo người nhưng không dính cứng
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
cam_moi('CAM_4_theo', (1.5, 0.35, 1.6), (1.2, 3.1, 1.0), 20, F_WALK0 + 30, F_WALK1 + 8, 0.8)
cam_moi('CAM_5_mat', (0.25, 2.15, 1.62), (0.52, 3.25, 1.6), 40, F_WALK1 + 8, F_END, 0.8, muc=tgt_dau)   # cận mặt Nam trước gương: thấy biểu cảm (đặt phía sau-trái người, nhìn qua vai về phía gương)                           # rộng: đi tới gương
if a.dong:
    for f in range(F_SIT, F_END + 1, 2):
        aplicar(f); rig.keyframe_insert('location', frame=f); rig.keyframe_insert('rotation_quaternion', frame=f)
        for b in rig.pose.bones: b.keyframe_insert('rotation_euler', frame=f)
    sc.frame_start, sc.frame_end = F_SIT, F_END; sc.render.fps = 24
os.makedirs(a.ra, exist_ok=True)
if os.environ.get('DT_DEBUG'):
    for f in (692, 704, 716):
        sc.frame_set(f); print('DBG cam5', f, 'dau', tuple(round(v, 2) for v in tgt_dau.matrix_world.translation), 'cam', tuple(round(v, 2) for v in sc.camera.matrix_world.translation), sc.camera.name)
    for f in (365, 394, 460, 700):
        sc.frame_set(f); print('DBG mặt', f, {k: round(v[0].value, 2) for k, v in FACE.items() if v[0].value > 0.05})
    for f in (380, 450, 520, 600):
        sc.frame_set(f); bpy.context.view_layer.update(); cm = sc.camera; print('DBG f', f, 'camera', cm.name, tuple(round(x, 2) for x in cm.matrix_world.translation), 'ngực', tuple(round(x, 2) for x in tgt.matrix_world.translation), 'hông rig', tuple(round(x, 2) for x in rig.location))
if a.dong:
    for f in [int(x) for x in a.khung.split(',')]:
        sc.frame_set(f); sc.render.filepath = os.path.join(a.ra, f'd_{f:03d}.png'); bpy.ops.render.render(write_still=True)
else:
    sc.render.filepath = os.path.join(a.ra, f'that_{a.cam}.png'); bpy.ops.render.render(write_still=True)
if a.blend: bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))
