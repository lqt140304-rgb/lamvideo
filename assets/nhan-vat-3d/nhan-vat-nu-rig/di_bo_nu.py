"""CHU KỲ ĐI BỘ cho Nu_Rig (học theo di_bo_nam002.py của bản Nam) — Blender 5.2.x.

  blender -b nhan-vat-nu-rig.blend --python di_bo_nu.py -- --out di-bo.blend [--anh thư-mục] [--tien] [--chu-ky 3]
Action `di_bo`: 32 khung/chu kỳ ở 24 fps, bước 0,58 m. Mặc định đi tại chỗ; `--tien` thì root tiến về −Y.
Chân bằng IK (ik_foot): chân đứng trượt đều ra sau, chân vung nhấc rồi đặt gót. Hông nhún 2 lần/chu kỳ và đảo ngang,
vai xoay ngược hông, tay đánh ngược chân (tay buông sẵn từ dáng nghỉ), ngón thả lỏng và gập đổi theo nhịp tay.
Không sửa file rig gốc; lưu sang --out.
"""
import argparse
import math
import os
import sys

import bpy
from mathutils import Matrix, Vector

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument('--out', required=True)
ap.add_argument('--anh')
ap.add_argument('--khung', type=int, default=32)
ap.add_argument('--buoc', type=float, default=0.58)
ap.add_argument('--tien', action='store_true')
ap.add_argument('--chu-ky', type=int, default=1)
a = ap.parse_args(argv)

sc = bpy.context.scene
arm = bpy.data.objects['Nu_Rig']
pb = arm.pose.bones
N, S, H = a.khung, a.buoc, 0.07
for b in pb:
    b.rotation_mode = 'QUATERNION'
rest = {b.name: arm.matrix_world @ b.bone.matrix_local for b in pb}
NGON = (('index', 0.14), ('middle', 0.24), ('ring', 0.34), ('pinky', 0.44), ('thumb', 0.12))


def set_world_rot(bn, R):
    """Quay xương bằng R (hệ thế giới, quanh đầu xương) so với dáng nghỉ tương quan với cha."""
    b = pb[bn]
    bpy.context.view_layer.update()
    par = b.parent
    M_par = (arm.matrix_world @ par.matrix) if par else arm.matrix_world
    rel = (rest[par.name].inverted() @ rest[bn]) if par else rest[bn]
    Mw = M_par @ rel
    h = (arm.matrix_world @ b.matrix).translation.copy()
    Mw.translation = h
    Mw = Matrix.Translation(h) @ R.to_4x4() @ Matrix.Translation(-h) @ Mw
    b.matrix = arm.matrix_world.inverted() @ Mw
    bpy.context.view_layer.update()


def Rot(axis, deg):
    return Matrix.Rotation(math.radians(deg), 3, Vector(axis))


def move_loc(bn, d):
    b = pb[bn]
    b.location = b.bone.matrix_local.to_3x3().inverted() @ Vector(d)


def foot(phi):
    """(dy, dz, pitch°); phi 0 = chạm gót trước. 0–0,6 đứng (trượt sau), 0,6–1 vung."""
    if phi < 0.6:
        t = phi / 0.6
        dy = -S / 2 + S * t
        pitch = 12 * max(0, 1 - t / 0.12) if t < 0.12 else (-25 * ((t - 0.85) / 0.15) if t > 0.85 else 0)
        dz = 0.0 if t < 0.85 else 0.03 * ((t - 0.85) / 0.15)
        return dy, dz, pitch
    t = (phi - 0.6) / 0.4
    e = 0.5 - 0.5 * math.cos(math.pi * t)
    dy = S / 2 - S * e
    dz = 0.03 * (1 - t) + H * math.sin(math.pi * t) ** 1.3
    pitch = -25 * (1 - t) ** 2 + 12 * t ** 3
    return dy, dz, pitch


act = bpy.data.actions.new('di_bo')
arm.animation_data_create()
arm.animation_data.action = act
sc.frame_start, sc.frame_end, sc.render.fps = 1, N * a.chu_ky, 24
for p in pb:
    if p.name.startswith('hand.'):
        p['ik_fk'] = 0.0
for f in range(N * a.chu_ky + 1):
    phi = (f % N) / N
    fr = f + 1
    for b in pb:
        b.location = (0, 0, 0)
        b.rotation_quaternion = (1, 0, 0, 0)
    bpy.context.view_layer.update()
    move_loc('root', (0, -(S * 2) * (f / N) if a.tien else 0.0, 0))
    for k, off in (('L', 0.0), ('R', 0.5)):
        dy, dz, pitch = foot((phi + off) % 1.0)
        move_loc(f'ik_foot.{k}', (0, dy, dz))
        ik = pb[f'ik_foot.{k}']
        m3 = ik.bone.matrix_local.to_3x3()
        ik.rotation_quaternion = (m3.inverted() @ Rot((1, 0, 0), pitch) @ m3).to_quaternion()
    bob = -0.022 - 0.016 * math.cos(4 * math.pi * phi)
    sway = 0.02 * math.sin(2 * math.pi * phi)
    move_loc('pelvis', (sway, 0.0, bob))
    bpy.context.view_layer.update()
    yaw = 6 * math.cos(2 * math.pi * phi)
    set_world_rot('pelvis', Rot((0, 0, 1), yaw) @ Rot((0, 1, 0), -3 * math.cos(2 * math.pi * phi)))
    set_world_rot('spine1', Rot((0, 0, 1), -yaw * 0.5) @ Rot((1, 0, 0), 2))
    set_world_rot('spine2', Rot((0, 0, 1), -yaw * 0.4))
    set_world_rot('chest', Rot((0, 0, 1), -yaw * 0.4))
    set_world_rot('neck', Rot((0, 0, 1), yaw * 0.3))
    set_world_rot('head', Rot((0, 0, 1), yaw * 0.3) @ Rot((1, 0, 0), -2))
    swing = 22 * math.cos(2 * math.pi * phi)   # chân trái trước (phi 0) ⇒ tay trái ra sau
    for k, sg in (('L', 1), ('R', -1)):
        set_world_rot(f'upper_arm.{k}', Rot((1, 0, 0), sg * swing))
        el = 14 + 14 * max(0.0, -sg * math.cos(2 * math.pi * phi))
        set_world_rot(f'forearm.{k}', Rot((1, 0, 0), -el))
        hd = pb[f'hand.{k}']
        sw = sg * math.cos(2 * math.pi * phi)
        hd['fist'] = 0.0
        for n, base in NGON:
            for j in (1, 2, 3):
                pb[f'{n}{j}.{k}'].rotation_quaternion = Matrix.Rotation(math.radians(
                    (base + 0.07 * sw) * (60 if n != 'thumb' else 30) * (1.0 if j == 1 else 1.2)), 3, 'X').to_quaternion()
    bpy.context.view_layer.update()
    for b in pb:
        if b.name.startswith('pole_'):
            continue
        b.keyframe_insert('rotation_quaternion', frame=fr)
        if b.name in ('root', 'pelvis') or b.name.startswith('ik_foot'):
            b.keyframe_insert('location', frame=fr)

hmin = 9.0
for f in range(1, N + 1):
    sc.frame_set(f)
    bpy.context.view_layer.update()
    for k in ('L', 'R'):
        hmin = min(hmin, (arm.matrix_world @ pb[f'foot.{k}'].head).z)
print(f'  chu kỳ {N} khung @24fps; bước {S:.2f} m; mắt cá thấp nhất {hmin:.3f} m')


def chup(out):
    os.makedirs(out, exist_ok=True)
    sc.render.engine = 'BLENDER_EEVEE'
    sc.render.resolution_x, sc.render.resolution_y = 280, 380
    for n, rot in (('k1', (0.9, 0, 0.5)), ('k2', (1.1, 0, 3.6))):
        L = bpy.data.lights.new(n, 'SUN')
        L.energy = 3
        o = bpy.data.objects.new(n, L)
        sc.collection.objects.link(o)
        o.rotation_euler = rot
    sc.world = sc.world or bpy.data.worlds.new('w')
    sc.world.use_nodes = True
    sc.world.node_tree.nodes['Background'].inputs[0].default_value = (.8, .8, .8, 1)
    sc.world.node_tree.nodes['Background'].inputs[1].default_value = 0.6
    cd = bpy.data.cameras.new('cam')
    cd.type = 'ORTHO'
    cd.ortho_scale = 1.9
    cam = bpy.data.objects.new('cam', cd)
    sc.collection.objects.link(cam)
    sc.camera = cam
    for view, d in (('ben', (1, 0, 0.05)), ('truoc', (0.35, -1, 0.1))):
        for i in range(8):
            sc.frame_set(1 + int(N * i / 8))
            bpy.context.view_layer.update()
            rh = arm.matrix_world @ pb['root'].head
            t = Vector((rh.x, rh.y, 0.85))
            cam.location = t + 3 * Vector(d).normalized()
            cam.rotation_euler = (t - cam.location).to_track_quat('-Z', 'Y').to_euler()
            sc.render.filepath = os.path.join(out, f'{view}_{i}.png')
            bpy.ops.render.render(write_still=True)


if a.anh:
    chup(os.path.abspath(a.anh))
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.out), compress=True)
print('PASS: đã lưu', a.out)
