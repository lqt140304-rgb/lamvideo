"""Chụp 12 ảnh duyệt từ file rig đã lưu (không sửa file).

D:/blender/blender.exe -b nhan-vat-nu-rig.blend --python chup_duyet.py -- <thư mục ra>
Ảnh: mặt (nghỉ, liếc, chớp, A, O, MBP, cười, buồn), toàn thân, cổ–cổ tay, chỉ tay, nắm tay.
"""
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Matrix, Vector

OUT = Path(sys.argv[sys.argv.index('--') + 1])
sc = bpy.context.scene
R, B = bpy.data.objects['Nu_Rig'], bpy.data.objects['Nu_Than']
pb, kb = R.pose.bones, B.data.shape_keys.key_blocks
bang = json.loads((Path(bpy.data.filepath).parent / 'khau-hinh.json').read_text(encoding='utf-8'))
sc.render.engine = 'BLENDER_EEVEE'
sc.render.resolution_x = sc.render.resolution_y = 384
for n, rot in (('k1', (0.9, 0, 0.5)), ('k2', (1.1, 0, 3.6))):
    L = bpy.data.lights.new(n, 'SUN')
    L.energy = 3
    o = bpy.data.objects.new(n, L)
    sc.collection.objects.link(o)
    o.rotation_euler = rot
sc.world = sc.world or bpy.data.worlds.new('w')
sc.world.use_nodes = True
sc.world.node_tree.nodes['Background'].inputs[1].default_value = 0.6
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
sc.collection.objects.link(cam)
sc.camera = cam
MAT = ((0, -1.25, 1.42), (0, 0, 1.40), 100)


def nghi():
    for p in pb:
        p.location, p.rotation_euler, p.scale = (0, 0, 0), (0, 0, 0), (1, 1, 1)
        p.rotation_mode = 'XYZ'
        for k in ('fist', 'blink_L', 'blink_R', 'squint_L', 'squint_R'):
            if k in p:
                p[k] = 0.0
    for k in kb[1:]:
        k.value = 0


def doi(b, d):
    p = pb[b]
    p.matrix = Matrix.Translation(Vector(d)) @ p.matrix


def chup(ten, loc, aim, lens):
    R.update_tag()
    bpy.context.view_layer.update()
    cam.data.lens = lens
    cam.location = loc
    cam.rotation_euler = (Vector(aim) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = str(OUT / f'{ten}.png')
    bpy.ops.render.render(write_still=True)


def khau(k):
    nghi()
    kb[bang[k]['shape_key']].value = 1
    pb['jaw'].rotation_euler.x = math.radians(bang[k]['jaw_do'])


nghi(); chup('01_mat_nghi', *MAT)
nghi(); doi('look', (0.3, 0, 0)); chup('02_liec', *MAT)
nghi(); pb['head']['blink_L'] = pb['head']['blink_R'] = 1; chup('03_chop', *MAT)
for i, k in enumerate(('A', 'O', 'MBP')):
    khau(k); chup(f'0{4 + i}_khau_{k}', *MAT)
nghi(); kb['cuoi'].value = 1; pb['head']['squint_L'] = pb['head']['squint_R'] = 0.4; chup('07_cuoi', *MAT)
nghi(); kb['meu'].value = 1
for k, s in (('L', 1), ('R', -1)):
    doi(f'brow_in.{k}', (-s * 0.004, 0, 0.006)); doi(f'brow_mid.{k}', (0, 0, 0.002))
chup('08_buon', *MAT)
nghi(); chup('09_toan_than', (0.9, -3.4, 0.95), (0, 0, 0.86), 50)
nghi(); chup('10_co_co_tay', (0.55, -0.75, 0.95), (0.18, 0, 0.85), 45)
nghi()
pb['upper_arm.L'].rotation_euler.x = math.radians(80)
for n in ('thumb', 'middle', 'ring', 'pinky'):
    for j in (1, 2, 3):
        pb[f'{n}{j}.L'].rotation_euler.x = 1.1
chup('11_chi_tay', (0.9, -0.9, 1.0), (0.2, -0.25, 0.95), 70)
nghi(); pb['upper_arm.L'].rotation_euler.x = math.radians(80); pb['hand.L']['fist'] = 1
chup('12_nam_tay', (0.9, -0.9, 1.0), (0.2, -0.25, 0.95), 70)
print('PASS: 12 ảnh ở', OUT)
