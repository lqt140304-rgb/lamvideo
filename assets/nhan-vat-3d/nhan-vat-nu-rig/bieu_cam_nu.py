"""BIỂU CẢM CÓ TÊN cho Nu_Rig (học theo bieu_cam_nam002.py: 8 biểu cảm ghép từ điều khiển nền).

Dùng trong Blender (file rig đã mở):
    import bieu_cam_nu as bc; bc.dung_bieu_cam('vui')          # đặt biểu cảm, giữ nguyên thứ khác
Chụp 8 biểu cảm cận mặt:
    blender -b nhan-vat-nu-rig.blend --python bieu_cam_nu.py -- <thư mục ảnh>
Biểu cảm chỉ đặt: shape key miệng, xương mày (brow_in/mid/out), `blink_*`/`squint_*` trên head, góc hàm `jaw`.
Không đụng mắt nhìn (`look`), tay, chân hay khẩu hình. Gọi lại với 'mac_dinh' để về nét nghỉ.
"""
import math
import sys
from pathlib import Path

import bpy
from mathutils import Matrix, Vector

# Mỗi biểu cảm: sk = shape key (0–1), jaw = độ mở hàm, sq = nheo mắt, bl = chớp (khép một phần),
# may = {(đầu, bên): (dx_vào_trong, dz)} tính bằng m, bên 'L'/'R'/'*' (cả hai); dx > 0 là vào phía giữa mặt.
MAY_K = 2.5  # xương mày chỉ kéo mày đi ~55% độ dời đặt, nên nhân lên để nét biểu cảm đủ rõ

BIEU_CAM = {
    'mac_dinh': {},
    'ngac_nhien': {'jaw': 12, 'may': {('*', '*'): (0, 0.009)}},
    'tuc_gian': {'sk': {'mim_moi': 0.6, 'meu': 0.3}, 'sq': 0.4,
                 'may': {('in', '*'): (0.003, -0.008), ('mid', '*'): (0, -0.004), ('out', '*'): (0, 0.001)}},
    'buon': {'sk': {'meu': 1.0}, 'may': {('in', '*'): (0.004, 0.007), ('mid', '*'): (0, 0.002), ('out', '*'): (0, -0.003)}},
    'vui': {'sk': {'cuoi': 1.0}, 'sq': 0.4, 'may': {('mid', '*'): (0, 0.002), ('out', '*'): (0, 0.001)}},
    'nghi_ngo': {'sk': {'meu': 0.3, 'nhech.L': 0.6}, 'sq': 0.15,
                 'may': {('*', 'L'): (0, 0.008), ('in', 'R'): (0.002, -0.004), ('mid', 'R'): (0, -0.003)}},
    'so_hai': {'jaw': 12, 'sk': {'meu': 0.4},
               'may': {('in', '*'): (0.004, 0.008), ('mid', '*'): (0, 0.006), ('out', '*'): (0, 0.001)}},
    'mo_mang': {'sk': {'meu': 0.2}, 'bl': 0.35, 'may': {('*', '*'): (0, -0.004)}},
}


def _doi(pb, ten, d):
    p = pb[ten]
    p.matrix = Matrix.Translation(Vector(d)) @ p.matrix


def dung_bieu_cam(ten, arm=None, body=None):
    arm = arm or bpy.data.objects['Nu_Rig']
    body = body or bpy.data.objects['Nu_Than']
    pb, kb = arm.pose.bones, body.data.shape_keys.key_blocks
    for ch in ('brow_in', 'brow_mid', 'brow_out'):
        for k in 'LR':
            p = pb[f'{ch}.{k}']
            p.location, p.rotation_euler = (0, 0, 0), (0, 0, 0)
    for k in kb[1:]:
        if k.name in ('cuoi', 'meu', 'chu_moi', 'mim_moi', 'keo_khoe.L', 'keo_khoe.R', 'ha_khoe.L', 'ha_khoe.R', 'nhech.L', 'nhech.R'):
            k.value = 0
    for q in ('blink_L', 'blink_R', 'squint_L', 'squint_R'):
        pb['head'][q] = 0.0
    pb['jaw'].rotation_euler.x = 0
    bpy.context.view_layer.update()
    e = BIEU_CAM[ten]
    for n, v in e.get('sk', {}).items():
        kb[n].value = v
    pb['jaw'].rotation_euler.x = math.radians(e.get('jaw', 0))
    for k in 'LR':
        pb['head'][f'squint_{k}'] = e.get('sq', 0.0)
        pb['head'][f'blink_{k}'] = e.get('bl', 0.0)
    bpy.context.view_layer.update()
    for (dau, ben), (dx, dz) in e.get('may', {}).items():
        for ch in (('brow_in', 'brow_mid', 'brow_out') if dau == '*' else (f'brow_{dau}',)):
            for k in ('LR' if ben == '*' else ben):
                s = 1 if k == 'L' else -1      # .L ở +X: vào trong = −X
                _doi(pb, f'{ch}.{k}', (-s * dx * MAY_K, 0, dz * MAY_K))
    bpy.context.view_layer.update()


def chup(out):
    sc = bpy.context.scene
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
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
    cam.data.lens = 100
    cam.location = (0, -1.25, 1.42)
    cam.rotation_euler = (Vector((0, 0, 1.40)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
    for ten in BIEU_CAM:
        dung_bieu_cam(ten)
        sc.render.filepath = str(out / f'{ten}.png')
        bpy.ops.render.render(write_still=True)
    print('PASS: 8 biểu cảm ở', out)


if '--' in sys.argv:
    chup(sys.argv[sys.argv.index('--') + 1])
