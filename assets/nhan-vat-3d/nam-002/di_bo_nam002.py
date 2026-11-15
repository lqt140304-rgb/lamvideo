"""CHU KỲ ĐI BỘ cho Nam_Rig (rig_nam002.py, dáng nghỉ chữ T) — Blender 5.2.x.

  blender -b --factory-startup --python di_bo_nam002.py -- --rig nam-002-rig.blend --out nam-002-di-bo.blend [--anh xem-di] [--tien]
Action `di_bo`: 1 chu kỳ 32 khung ở 24 fps (≈ 1,33 s), bước 0,62 m (sải 1,24 m/chu kỳ ≈ 0,93 m/s, đi thường).
Mặc định đi tại chỗ (để lặp/ghép), `--tien` thì gốc tiến về −Y đều theo tốc độ bước.
Chân: IK (ik_foot) — chân đứng trượt đều ra sau, chân vung nhấc và đặt gót trước (bàn chân gập lên khi chạm gót, gập xuống khi nhấc mũi).
Thân: hông nhún 2 lần/chu kỳ, đảo ngang, xoay ngược vai; tay hạ từ chữ T rồi đánh ngược chân, khuỷu gập nhẹ.
"""
import sys, os, math, argparse
import bpy
import numpy as np
from mathutils import Vector, Matrix, Quaternion


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--rig', required=True); ap.add_argument('--out', required=True); ap.add_argument('--anh')
    ap.add_argument('--khung', type=int, default=32); ap.add_argument('--buoc', type=float, default=0.62); ap.add_argument('--tien', action='store_true'); ap.add_argument('--chu-ky', type=int, default=1, help='số chu kỳ liên tiếp (dùng với --tien để đi liên tục)')
    a = ap.parse_args(argv)
    bpy.ops.wm.open_mainfile(filepath=os.path.abspath(a.rig)); sc = bpy.context.scene
    arm = bpy.data.objects['Nam_Rig']; pb = arm.pose.bones
    N, S = a.khung, a.buoc; H = 0.075
    for b in pb: b.rotation_mode = 'QUATERNION'
    rest = {b.name: arm.matrix_world @ b.bone.matrix_local for b in pb}

    def set_world_rot(bn, R):
        """Đặt xương = R (quay thế giới quanh đầu xương) ∘ dáng hiện tại của cha (giữ tương quan cha–con như lúc nghỉ)."""
        b = pb[bn]; bpy.context.view_layer.update()
        par = b.parent
        M_par = (arm.matrix_world @ par.matrix) if par else arm.matrix_world
        rel = (rest[par.name].inverted() @ rest[bn]) if par else rest[bn]
        Mw = M_par @ rel; h = (arm.matrix_world @ b.matrix).translation.copy(); Mw.translation = h      # giữ vị trí hiện tại (vd. hông đã nhún/đảo)
        Mw = Matrix.Translation(h) @ R.to_4x4() @ Matrix.Translation(-h) @ Mw
        b.matrix = arm.matrix_world.inverted() @ Mw; bpy.context.view_layer.update()

    def Rot(axis, deg): return Matrix.Rotation(math.radians(deg), 3, Vector(axis))

    def move_loc(bn, d):
        b = pb[bn]; b.location = b.bone.matrix_local.to_3x3().inverted() @ Vector(d)

    def foot(phi):
        """(dy, dz, pitch°) cho bàn chân; phi 0 = chạm gót trước. 0–0,6 đứng (trượt sau), 0,6–1 vung."""
        if phi < 0.6:
            t = phi / 0.6; dy = -S / 2 + S * t
            pitch = 12 * max(0, 1 - t / 0.12) if t < 0.12 else (-25 * ((t - 0.85) / 0.15) if t > 0.85 else 0)   # gót chạm: mũi hếch; cuối: nhón mũi
            dz = 0.0 if t < 0.85 else 0.03 * ((t - 0.85) / 0.15)
            return dy, dz, pitch
        t = (phi - 0.6) / 0.4; e = 0.5 - 0.5 * math.cos(math.pi * t)
        dy = S / 2 - S * e; dz = 0.03 * (1 - t) + H * math.sin(math.pi * t) ** 1.3
        pitch = -25 * (1 - t) ** 2 + 12 * t ** 3
        return dy, dz, pitch

    act = bpy.data.actions.new('di_bo'); arm.animation_data_create(); arm.animation_data.action = act
    sc.frame_start, sc.frame_end = 1, N * a.chu_ky; sc.render.fps = 24
    for f in range(N * a.chu_ky + 1):
        phi = (f % N) / N; fr = f + 1
        for b in pb: b.location = (0, 0, 0); b.rotation_quaternion = (1, 0, 0, 0)
        bpy.context.view_layer.update()
        fwd = -(S * 2) * (f / N) if a.tien else 0.0      # tiến đều: mỗi chu kỳ đi 2 bước = 1,24 m
        move_loc('root', (0, fwd, 0))
        for k, off in (('L', 0.0), ('R', 0.5)):
            dy, dz, pitch = foot((phi + off) % 1.0)
            move_loc(f'ik_foot.{k}', (0, dy, dz + 0.012))
            ik = pb[f'ik_foot.{k}']; ik.rotation_quaternion = (ik.bone.matrix_local.to_3x3().inverted() @ Rot((1, 0, 0), pitch) @ ik.bone.matrix_local.to_3x3()).to_quaternion()
        bob = -0.025 - 0.018 * math.cos(4 * math.pi * phi)            # thấp nhất khi hai chân chạm (phi 0; 0,5), cao nhất giữa pha một chân
        sway = 0.022 * math.sin(2 * math.pi * phi)                     # dồn sang chân trái giữa pha trái đứng (phi ≈ 0,25)
        move_loc('Hips', (sway, 0.0, bob)); bpy.context.view_layer.update()
        yaw = 7 * math.cos(2 * math.pi * phi)                           # hông xoay theo chân trước
        set_world_rot('Hips', Rot((0, 0, 1), yaw) @ Rot((0, 1, 0), -3 * math.cos(2 * math.pi * phi)))
        set_world_rot('Spine', Rot((0, 0, 1), -yaw * 0.5) @ Rot((1, 0, 0), 3))
        set_world_rot('Spine1', Rot((0, 0, 1), -yaw * 0.4))
        set_world_rot('Spine2', Rot((0, 0, 1), -yaw * 0.4))
        set_world_rot('Neck', Rot((0, 0, 1), yaw * 0.3)); set_world_rot('Head', Rot((0, 0, 1), yaw * 0.3) @ Rot((1, 0, 0), -2))
        swing = 24 * math.cos(2 * math.pi * phi)                        # chân trái trước (phi 0) ⇒ tay trái ra sau
        for S_, s in (('Left', 1), ('Right', -1)):
            sg = 1 if S_ == 'Left' else -1
            set_world_rot(f'{S_}Arm', Rot((1, 0, 0), sg * swing) @ Rot((0, 1, 0), s * 78))          # hạ tay 78° rồi đánh trước–sau
            el = 18 + 12 * max(0.0, -sg * math.cos(2 * math.pi * phi))                               # khuỷu gập nhiều hơn khi tay ra trước
            set_world_rot(f'{S_}ForeArm', Rot((1, 0, 0), -el))
            set_world_rot(f'{S_}Hand', Rot((0, 0, 1), -s * 8))
            hb = pb[f'{S_}Hand']; hb['nam'] = 0.0
            # ngón thả lỏng tự nhiên: gập tăng dần từ trỏ đến út, ngón cái ít; gập nhiều hơn khi tay ra sau, duỗi hơn khi tay ra trước
            sw = sg * math.cos(2 * math.pi * phi)                        # +1 khi tay ở phía sau
            for pr, base in (('nam_tro', 0.14), ('nam_giua', 0.24), ('nam_ap', 0.34), ('nam_ut', 0.44), ('nam_cai', 0.12)):
                hb[pr] = max(0.0, min(1.0, base + 0.07 * sw))
        bpy.context.view_layer.update()
        for b in pb:
            if b.name.startswith(('pole_',)): continue
            b.keyframe_insert('rotation_quaternion', frame=fr)
            if b.name in ('root', 'Hips') or b.name.startswith('ik_foot'): b.keyframe_insert('location', frame=fr)
        for S_ in ('Left', 'Right'):
            for pr in ('nam_tro', 'nam_giua', 'nam_ap', 'nam_ut', 'nam_cai'): pb[f'{S_}Hand'].keyframe_insert(f'["{pr}"]', frame=fr)
    # kiểm: trượt chân đứng (so với mặt đất, khi đi tại chỗ phải trượt đúng tốc độ thân = S/(0,6N) mỗi khung)
    sl, hmin = [], 9.0
    for f in range(1, N + 1):
        sc.frame_set(f); bpy.context.view_layer.update()
        for k in ('Left', 'Right'):
            p = arm.matrix_world @ pb[f'{k}Foot'].head; hmin = min(hmin, p.z)
    print(f'  chu kỳ {N} khung @24fps; bước {S:.2f} m; mắt cá thấp nhất {hmin:.3f} m (nghỉ 0,090)')
    if a.anh: render(sc, arm, os.path.abspath(a.anh), N)
    sc['hoat_anh'] = f'di_bo: {N} khung @24fps, bước {S:.2f} m, ' + ('tiến −Y' if a.tien else 'tại chỗ')
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.out), compress=True)
    print('PASS: đã lưu', a.out)


def render(sc, arm, out, N):
    os.makedirs(out, exist_ok=True)
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 10; sc.cycles.use_denoising = False
    sc.render.resolution_x = 280; sc.render.resolution_y = 380
    w = sc.world or bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (.8, .8, .8, 1)
    cd = bpy.data.cameras.new('cam'); cd.type = 'ORTHO'; cd.ortho_scale = 1.95
    cam = bpy.data.objects.new('cam', cd); sc.collection.objects.link(cam); sc.camera = cam; arm.hide_render = True
    for view, d in (('ben', (1, 0, 0.05)), ('truoc', (0.35, -1, 0.1))):
        for i in range(8):
            f = 1 + int(N * i / 8); sc.frame_set(f)
            t = Vector(((arm.matrix_world @ arm.pose.bones['root'].head).x, (arm.matrix_world @ arm.pose.bones['root'].head).y, 0.85))
            cam.location = t + 3 * Vector(d).normalized(); cam.rotation_euler = (t - cam.location).to_track_quat('-Z', 'Y').to_euler()
            sc.render.filepath = os.path.join(out, f'{view}_{i}.png'); bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(cam)


main()
