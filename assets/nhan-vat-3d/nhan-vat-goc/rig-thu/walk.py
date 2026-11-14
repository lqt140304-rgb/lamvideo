"""CHU KỲ ĐI BỘ tại chỗ cho Goc_Rig (rig_goc.py --chu-a 80 --ten-mixamo). Blender 5.2.x.

  blender -b --factory-startup --python walk.py -- --rig nhan-vat-goc-rig-thu.blend --out di-bo.blend [--anh xem-di] [--khung 28] [--buoc 0.40]
Tạo action `di_bo` lặp 1 chu kỳ (mặc định 28 khung ở 24 fps ≈ 1,17 s). Nhân vật đi tại chỗ (không di chuyển gốc) hướng −Y:
chân đặt bằng IK (ik_foot, pole_knee) nên chân đỡ trượt ngược đúng tốc độ thân; tay đánh ngược chân; hông nhún, đảo vai/hông.
Tay hạ về buông từ dáng nghỉ chữ A bằng độ dang đọc ở thuộc tính cảnh `dang_nghi`.
"""
import sys, os, math, argparse, re
import bpy
import numpy as np
from mathutils import Vector


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--rig', required=True); ap.add_argument('--out', required=True); ap.add_argument('--anh')
    ap.add_argument('--khung', type=int, default=28); ap.add_argument('--buoc', type=float, default=0.40); ap.add_argument('--nang', type=float, default=0.07)
    a = ap.parse_args(argv)
    bpy.ops.wm.open_mainfile(filepath=os.path.abspath(a.rig)); sc = bpy.context.scene
    arm = bpy.data.objects['Goc_Rig']; pb = arm.pose.bones
    m = re.search(r'(\d+)', sc.get('dang_nghi', '0')); a_deg = float(m.group(1)) if m else 0.0
    N = a.khung; S = a.buoc; H = a.nang
    for b in pb: b.rotation_mode = 'XYZ'

    def world_loc(p, d): p.location = p.bone.matrix_local.to_3x3().inverted() @ Vector(d)
    def rot(bn, **kw):
        e = list(pb[bn].rotation_euler)
        for ax, deg in kw.items(): e['XYZ'.index(ax.upper())] = math.radians(deg)
        pb[bn].rotation_euler = e

    def foot(phi):                    # (dy, dz, pitch°): y tiến = −Y
        if phi < 0.5:                 # đứng: chân trượt từ trước ra sau
            t = phi / 0.5; return (-S / 2 + S * t, 0.0, 0.0)
        t = (phi - 0.5) / 0.5; e = 0.5 - 0.5 * math.cos(math.pi * t)   # nhấc: vung ra trước, mượt hai đầu
        return (S / 2 - S * e, H * math.sin(math.pi * t) ** 1.2, 0.0)

    act = bpy.data.actions.new('di_bo'); arm.animation_data_create(); arm.animation_data.action = act
    for f in range(N + 1):
        phi = (f % N) / N
        for b in pb:
            b.location = (0, 0, 0); b.rotation_euler = (0, 0, 0)
        for k, off in (('L', 0.0), ('R', 0.5)):
            dy, dz, _ = foot((phi + off) % 1.0); world_loc(pb[f'ik_foot.{k}'], (0, dy, dz))
        bob = -0.016 * math.cos(4 * math.pi * phi) - 0.004
        sway = 0.018 * math.sin(2 * math.pi * phi) * -1
        world_loc(pb['Hips'], (sway, 0.0, bob))
        yaw = 6 * math.sin(2 * math.pi * phi)
        rot('Hips', Y=-yaw); rot('Spine', Y=yaw * 0.6); rot('Spine1', Y=yaw * 0.7); rot('Spine2', Y=yaw * 0.7)
        rot('Head', Y=-yaw * 0.6); rot('Spine1', X=-3)
        swing = 22 * math.cos(2 * math.pi * phi)       # tay trái ra sau khi chân trái ra trước (biên tay trùng biên chân)
        for k, s, sg in (('Left', 1, -1), ('Right', -1, 1)):
            rot(f'{k}Arm', Z=s * -a_deg + s * 6, X=sg * swing)
            rot(f'{k}ForeArm', X=-12 - 10 * (1 + sg * math.cos(2 * math.pi * phi)))
        for bn in ['Hips', 'Spine', 'Spine1', 'Spine2', 'Head', 'LeftArm', 'RightArm', 'LeftForeArm', 'RightForeArm']:
            pb[bn].keyframe_insert('rotation_euler', frame=f + 1)
        for bn in ['Hips', 'ik_foot.L', 'ik_foot.R']: pb[bn].keyframe_insert('location', frame=f + 1)
    sc.frame_start, sc.frame_end = 1, N; sc.render.fps = 24
    # kiểm tra: độ cao mắt cá thấp nhất, trượt chân đứng
    body = bpy.data.objects['model_LOD0']; mins = []; slide = []
    prev = None
    for f in range(1, N + 1):
        sc.frame_set(f); bpy.context.view_layer.update()
        ank = {k: (arm.matrix_world @ pb[f'{k}Foot'].head) for k in ('Left', 'Right')}
        mins.append(min(v.z for v in ank.values()))
        if prev is not None:
            for k in ('Left', 'Right'):
                if ank[k].z < prev[k].z + 1e-4 and ank[k].z < 0.12 and abs(prev[k].z - ank[k].z) < 0.004: slide.append(abs((ank[k].y - prev[k].y)))
        prev = ank
    print(f'  mắt cá thấp nhất {min(mins):.3f} m, cao nhất khi đứng {max(mins):.3f} m; chu kỳ {N} khung; bước {S:.2f} m')
    if a.anh: render(sc, arm, os.path.abspath(a.anh), N)
    sc['hoat_anh'] = f'di_bo: {N} khung @24fps, đi tại chỗ −Y, bước {S:.2f} m'
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.out), compress=True)
    print('PASS: đã lưu', a.out)


def render(sc, arm, out, N):
    os.makedirs(out, exist_ok=True)
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 10; sc.render.resolution_x = 280; sc.render.resolution_y = 360
    w = bpy.data.worlds.new('xem'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (.8, .8, .8, 1)
    cd = bpy.data.cameras.new('cam_xem'); cd.type = 'ORTHO'; cd.ortho_scale = 1.9
    cam = bpy.data.objects.new('cam_xem', cd); sc.collection.objects.link(cam); sc.camera = cam
    arm.hide_render = True
    for view, d in (('ben', (1, 0, 0)), ('truoc', (0, -1, 0.05))):
        for i in range(8):
            f = 1 + int(N * i / 8); sc.frame_set(f); t = Vector((0, 0, 0.8))
            cam.location = t + 3 * Vector(d); cam.rotation_euler = (t - cam.location).to_track_quat('-Z', 'Y').to_euler()
            sc.render.filepath = os.path.join(out, f'{view}_{i}.png'); bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(cam)


main()
