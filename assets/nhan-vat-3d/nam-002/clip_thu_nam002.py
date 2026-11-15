"""ĐOẠN THỬ 4 giây: đi tới + chớp mắt + liếc + đổi biểu cảm + khẩu hình. Blender 5.2.x.

  # 1) tạo đi bộ liên tục 3 chu kỳ:  di_bo_nam002.py --rig nam-002-rig.blend --out walk3.blend --tien --chu-ky 3
  blender -b --factory-startup --python clip_thu_nam002.py -- --in walk3.blend --out clip-thu.blend --anh khung-clip [--mp4 clip-thu.mp4]
Lịch (khung 1–96 @24fps): đi suốt đoạn; chớp mắt ở 18 và 62; liếc trái 26–44, phải 50–68, về giữa 74;
biểu cảm: 1–30 mặc định → 31–58 vui → 59–80 ngạc nhiên → 81–96 mặc định; khẩu hình a-e-i-o-u-mbp trong 40–88 (nhóm 6 khung).
Camera bám theo nhân vật, góc 3/4 trước. Kết quả kiểm tra bằng ảnh, không thay cho xem video.
"""
import sys, os, math, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from mathutils import Vector
import bieu_cam_nam002 as BC

PROPS = BC.PROPS_MAY + BC.PROPS_MIENG + ('chop_mat', 'chop_trai', 'chop_phai', 'mo_to')


def key(h, pr, f, v):
    h[pr] = float(v); h.keyframe_insert(f'["{pr}"]', frame=f)


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--in', dest='inp', required=True); ap.add_argument('--out', required=True)
    ap.add_argument('--anh'); ap.add_argument('--mp4'); ap.add_argument('--thu-nho', type=int, default=1, help='chỉ render mỗi n khung (xem nhanh)')
    a = ap.parse_args(argv)
    bpy.ops.wm.open_mainfile(filepath=os.path.abspath(a.inp)); sc = bpy.context.scene
    arm = bpy.data.objects['Nam_Rig']; pb = arm.pose.bones; h = pb['Head']
    sc.frame_start, sc.frame_end = 1, 96
    # mọi thuộc tính mặt về 0 ở khung 1 để các khóa sau nội suy từ 0
    for pr in PROPS: key(h, pr, 1, 0)
    # chớp mắt: đóng 3 khung rồi mở
    for f0 in (18, 62):
        for f, v in ((f0 - 2, 0), (f0, 1), (f0 + 2, 1), (f0 + 4, 0)): key(h, 'chop_mat', f, v)
    # biểu cảm (mày + khóe miệng) mượt qua các khoảng
    for pr, ks in {'cuoi': ((30, 0), (36, 1), (56, 1), (60, 0)), 'mieng_rong': ((30, 0), (36, 0.4), (56, 0.4), (60, 0)),
                   'may_nhuong': ((30, 0), (36, 0.3), (56, 0.3), (60, 1.0), (78, 1.0), (84, 0)), 'mo_to': ((58, 0), (62, 1), (78, 1), (84, 0))}.items():
        for f, v in ks: key(h, pr, f, v)
    # khẩu hình: giữ không nội suy (đổi tức thì) mỗi nhóm 6 khung
    seq = ['a', 'e', 'i', 'o', 'u', 'mbp', 'a', 'khac']
    for i, vs in enumerate(seq):
        f = 40 + 6 * i
        for pr in ('mieng_ha', 'mieng_hep', 'mieng_rong', 'mieng_khep'):
            v = BC.VISEME[vs].get(pr, 0.0); key(h, pr, f, v)
    for f in (88, 94):
        for pr in ('mieng_ha', 'mieng_hep', 'mieng_rong', 'mieng_khep'): key(h, pr, f, 0)
    # liếc: dời xương nhin (thế giới, tương đối đầu nghỉ)
    nh = pb['nhin']; nh.rotation_mode = 'XYZ'
    for f, dx in ((1, 0), (26, 0), (30, 0.25), (44, 0.25), (50, -0.25), (68, -0.25), (74, 0), (96, 0)):
        nh.location = nh.bone.matrix_local.to_3x3().inverted() @ Vector((dx, 0, 0)); nh.keyframe_insert('location', frame=f)
    # camera 3/4 trước, bám root
    cd = bpy.data.cameras.new('cam_clip'); cd.lens = 55; cam = bpy.data.objects.new('cam_clip', cd); sc.collection.objects.link(cam); sc.camera = cam
    tgt = bpy.data.objects.new('cam_tgt', None); sc.collection.objects.link(tgt)
    ct = cam.constraints.new('TRACK_TO'); ct.target = tgt; ct.track_axis = 'TRACK_NEGATIVE_Z'; ct.up_axis = 'UP_Y'
    for f in range(1, 97):                                  # camera bám hông: khóa vị trí từng khung (ràng buộc Copy Location bị trễ)
        sc.frame_set(f); bpy.context.view_layer.update(); hp = arm.matrix_world @ pb['Hips'].head
        tgt.location = (hp.x, hp.y, 0.85); tgt.keyframe_insert('location', frame=f)
        cam.location = (hp.x + 1.6, hp.y - 3.6, 1.3); cam.keyframe_insert('location', frame=f)
    # môi trường nhẹ: nền, đèn, sàn
    w = sc.world or bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (.72, .74, .78, 1)
    L = bpy.data.lights.new('k', 'SUN'); L.energy = 3.0; lo = bpy.data.objects.new('k', L); lo.rotation_euler = (0.9, 0.2, -0.6); sc.collection.objects.link(lo)
    bpy.ops.mesh.primitive_plane_add(size=40, location=(0, -4, 0)); fl = bpy.context.object; fl.name = 'San'
    mt = bpy.data.materials.new('san'); mt.use_nodes = True; mt.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (.35, .38, .42, 1); fl.data.materials.append(mt)
    arm.hide_render = True
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 6; sc.cycles.use_denoising = False; sc.cycles.device = 'CPU'
    sc.render.resolution_x = 360; sc.render.resolution_y = 480; sc.render.fps = 24
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.out), compress=True)
    if a.anh:
        os.makedirs(a.anh, exist_ok=True)
        for f in range(1, 97, a.thu_nho):
            sc.frame_set(f); sc.render.filepath = os.path.join(a.anh, f'f{f:03d}.png'); bpy.ops.render.render(write_still=True)
    print('PASS: đã lưu', a.out)


main()
