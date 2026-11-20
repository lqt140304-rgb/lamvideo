"""Ghép hoạt ảnh Mixamo (FBX, Without Skin) vào nam-003-rig.blend — Blender 5.2.x.

  <bpy-python> mixamo_nam003.py --rig nam-003-rig.blend --fbx Walking.fbx [--ra out.blend] [--anh dir] [--luoi] [--tai-cho]
Cách ghép: theo tên xương (bỏ tiền tố 'mixamorig:'), chuyển ĐỘ XOAY THẾ GIỚI so với dáng nghỉ của từng xương
(R_đích = R_nguồn(khung) · R_nguồn(nghỉ)⁻¹ · R_đích(nghỉ)) nên khác hướng xương/roll giữa hai rig không ảnh hưởng; hông dịch theo tỉ lệ chiều cao háng.
Tắt IK chân/tay khi phát (hoạt ảnh Mixamo là FK). Ngón út Mixamo bỏ qua (lưới 4 ngón). Bàn chân bám sàn: hạ/nâng cả người theo điểm thấp nhất từng khung (--san).
"""
import sys, os, math, argparse
import bpy, numpy as np
from mathutils import Matrix, Vector
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import chuyen_dong_nam003 as C

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
ap = argparse.ArgumentParser(); ap.add_argument('--rig', required=True); ap.add_argument('--fbx', required=True); ap.add_argument('--ra'); ap.add_argument('--anh')
ap.add_argument('--luoi', action='store_true'); ap.add_argument('--tai-cho', action='store_true'); ap.add_argument('--res', default='360,480'); ap.add_argument('--buoc', type=int, default=1); ap.add_argument('--xoay-tay', type=float, default=90.0, help='bù xoay quanh trục tay (độ): lòng bàn tay dáng nghỉ của nam-003 dựng đứng, Mixamo úp xuống')
ap.add_argument('--khung', default=''); ap.add_argument('--xoay-cang', action='store_true'); ap.add_argument('--mo-tay', type=float, default=6.0, help='mở bắp tay ra ngoài (độ) để tay không xuyên hông'); ap.add_argument('--do-ngon', action='store_true')
ap.add_argument('--vai', type=float, default=1.0, help='hệ số chuyển động phụ của xương đòn theo tay (0 = tắt)'); ap.add_argument('--hong', type=float, default=1.5, help='khuếch đại xoay/nghiêng khung chậu (1 = như Mixamo)')
a = ap.parse_args(argv)

c = C.Ctx(a.rig); arm = c.arm; pb = c.pb
for b in pb:                                            # FK thuần
    for k in b.constraints:
        if k.type == 'IK': k.influence = 0.0
for k in 'LR': pb[f'ik_hand.{k}']['ik'] = 0.0
for b in pb:                               # ràng buộc 'cộng thêm' (cột sống, ngón, xương đòn, chậu) tắt: Mixamo đã có các chuyển động đó; giữ xương xoắn cẳng tay
    for k in b.constraints:
        if k.name == 'GP': k.influence = 0.0
for fc in arm.animation_data.drivers:      # driver vai hạ theo tay đọc Euler bắp tay: nhảy giữa hai nghiệm tương đương khi ghép → vai/tay giật; Mixamo đã có chuyển động vai
    if 'Shoulder"].rotation_euler' in fc.data_path: fc.mute = True
c.reset(); c.upd()
REST_T = {b.name: (arm.matrix_world @ b.matrix).to_3x3().normalized() for b in pb}
bpy.ops.import_scene.fbx(filepath=os.path.abspath(a.fbx)); src = [o for o in bpy.context.selected_objects if o.type == 'ARMATURE'][0]
act = src.animation_data.action; f0, f1 = int(act.frame_range[0]), int(act.frame_range[1])
SP = src.pose.bones
nm = lambda n: n.split(':')[-1]
MAP = {nm(b.name): b.name for b in SP if nm(b.name) in pb and 'Pinky' not in b.name}
src.data.pose_position = 'REST'; bpy.context.view_layer.update()
REST_S = {k: (src.matrix_world @ SP[v].matrix).to_3x3().normalized() for k, v in MAP.items()}
hips_rest_s = (src.matrix_world @ SP[MAP['Hips']].matrix).translation.copy()
src.data.pose_position = 'POSE'
k_h = c.head['LeftUpLeg'].z / max(1e-6, (src.matrix_world @ SP[MAP['LeftUpLeg']].bone.head_local).z)
order = [b.name for b in pb if b.name in MAP]            # pb theo thứ tự cha → con
order.sort(key=lambda n: len([p for p in pb[n].parent_recursive]))
print(f'FBX {os.path.basename(a.fbx)}: khung {f0}–{f1}, ghép {len(MAP)} xương, tỉ lệ hông {k_h:.3f}')
sc = bpy.context.scene; N = (f1 - f0) // a.buoc + 1
act_t = bpy.data.actions.new('mixamo'); arm.animation_data_create(); arm.animation_data.action = act_t
for i in range(N):
    fs = f0 + i * a.buoc; sc.frame_set(fs); bpy.context.view_layer.update()
    c.reset()
    for n in order:
        Rs = (src.matrix_world @ SP[MAP[n]].matrix).to_3x3().normalized()
        Q = Matrix.Identity(3)
        if ('Arm' in n or 'Hand' in n) and 'Shoulder' not in n:
            # dáng nghỉ nam-003: lòng bàn tay hướng trước, ngón cái lên; Mixamo: úp xuống, ngón cái ra trước → quay +90° quanh X thế giới (CÙNG dấu hai bên)
            Q = Matrix.Rotation(math.radians(a.xoay_tay), 3, 'X')
        D = Rs @ REST_S[n].inverted()
        if n == 'Hips' and a.hong != 1.0:          # khuếch đại xoay/nghiêng khung chậu (thân trên vẫn giữ hướng gốc → xoắn ngược tự nhiên)
            ax_, an_ = D.to_quaternion().to_axis_angle(); D = Matrix.Rotation(an_ * a.hong, 3, ax_)
        Rt = D @ Q @ REST_T[n]
        if n.endswith('Shoulder') and a.vai:        # xương đòn theo tay: vung trước → vai nhô, vung sau → lùi, nhấc tay → nâng vai
            sg = 1 if n.startswith('Left') else -1
            ad = (src.matrix_world @ SP[MAP[n.replace('Shoulder', 'Arm')]].matrix).to_3x3().col[1].normalized()   # hướng bắp tay nguồn
            swing = math.degrees(math.atan2(-ad.y, max(1e-6, -ad.z)))        # + = ra trước
            raise_ = math.degrees(math.acos(max(-1.0, min(1.0, -ad.z))))      # 0 = buông thẳng
            pro = max(-12.0, min(12.0, 0.25 * swing)) * a.vai; ele = max(0.0, min(25.0, 0.3 * (raise_ - 25))) * a.vai
            Rt = (Matrix.Rotation(math.radians(-sg * pro), 3, 'Z') @ Matrix.Rotation(math.radians(-sg * ele), 3, 'Y')) @ Rt
        b = pb[n]; bpy.context.view_layer.update(); head = (arm.matrix_world @ b.matrix).translation
        if n == 'Hips':
            d = ((src.matrix_world @ SP[MAP[n]].matrix).translation - hips_rest_s) * k_h
            if a.tai_cho: d.y = 0.0; d.x = 0.0
            head = c.head['Hips'] + d
        b.matrix = arm.matrix_world.inverted() @ (Matrix.Translation(head) @ Rt.to_4x4())
    if a.mo_tay:
        for S_, s_ in (('Left', 1), ('Right', -1)): c.g['rot_world'](arm, f'{S_}Arm', (0, 1, 0), -s_ * a.mo_tay)
    bpy.context.view_layer.update()
    c.keyframe(i + 1)
    if a.do_ngon and i + 1 in (20, 35, 50):
        W = arm.matrix_world; h = W @ pb['LeftHand'].head; t = W @ pb['LeftHandThumb1'].head; m = W @ pb['LeftHandMiddle1'].head
        nrm = (t - h).cross(m - h).normalized()
        print(f'khung {i+1}: ngón cái so với cổ tay {tuple(round(x,2) for x in (t-h).normalized())} (trước = −Y); pháp tuyến bàn tay {tuple(round(x,2) for x in nrm)}; cổ tay x {h.x:.3f}')
sc.frame_start, sc.frame_end = 1, N; sc.render.fps = 30
for o in list(bpy.data.objects):
    if o.type == 'ARMATURE' and o is not arm: bpy.data.objects.remove(o, do_unlink=True)
for o in list(bpy.data.objects):
    if o.name.startswith('mixamorig') or (o.type == 'EMPTY' and o.parent is None and 'Armature' in o.name): bpy.data.objects.remove(o, do_unlink=True)
print('đã ghép', N, 'khung')
if a.luoi:
    r = C.do_luoi(c, N); print(f'mixamo: cạnh giãn >2× nhiều nhất mỗi khung {r["g2"]}; giãn max {r["gmax"]:.2f}×; điểm thấp nhất lưới {r["zmin"]*100:.1f} cm')
if a.anh: C.render_dong(c, N, a.anh, views=('truoc', 'ben'), res=tuple(int(x) for x in a.res.split(',')), khung=[int(x) for x in a.khung.split(',')] if a.khung else None)
if a.ra: bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.ra), compress=True)
