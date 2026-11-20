"""ĐOẠN THỬ 4 giây cho mặt NAM-003 (đứng yên) + kiểm tổng. Blender 5.2.x.

  blender -b --factory-startup --python clip_thu_nam003.py -- --in tung.blend --out clip-thu.blend [--kiem] [--anh khung] [--thu-nho 8] [--mp4 clip.mp4]
--kiem: in chữ ký (số đỉnh từng object, để so hai lần dựng) và đo xuyên da của mày/nốt ruồi khi quay đầu ±35°, cúi 25° (< 0,5 mm).
Lịch (1–96 @24fps): quay đầu trái 10–22, phải 28–40, về 46; cúi 50–58, ngẩng 64; chớp 18, 62; liếc 26–44;
biểu cảm vui 30–56, ngạc nhiên 60–80; khẩu hình A E I O U MBP PHV NT CH KG 40–88 (mỗi 5 khung).
Render EEVEE (nhanh hơn Cycles mẫu thấp); ảnh chỉ để duyệt, không thay video.
"""
import sys, os, math, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np, bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree
import bieu_cam_nam003 as BC
import mieng_nam003 as MI, may3d_nam003 as MY

PROPS = MY.PROPS + MI.PROPS + ('chop_mat', 'chop_trai', 'chop_phai', 'mo_to')


def key(h, pr, f, v):
    h[pr] = float(v); h.keyframe_insert(f'["{pr}"]', frame=f)


def chu_ky():
    return {o.name: len(o.data.vertices) for o in sorted(bpy.data.objects, key=lambda o: o.name) if o.type == 'MESH'}


def xuyen(sc, arm):
    """Độ xuyên sâu nhất (m) của mày + nốt ruồi vào da ở các tư thế đầu."""
    hd = arm.pose.bones['Head']; hd.rotation_mode = 'XYZ'; kq = {}
    for ten, rot in (('thang', (0, 0, 0)), ('quay+35', (0, math.radians(35), 0)), ('quay-35', (0, math.radians(-35), 0)), ('cui25', (math.radians(25), 0, 0))):
        hd.rotation_euler = rot; arm.update_tag(); sc.frame_set(sc.frame_current)
        dg = bpy.context.evaluated_depsgraph_get()
        bvh = BVHTree.FromObject(bpy.data.objects['Nam_Body'], dg)   # tọa độ local của body
        mi = bpy.data.objects['Nam_Body'].matrix_world.inverted(); sau = 0.0
        for ob in bpy.data.objects:
            if not (ob.name.startswith('LongMay') or ob.name == 'NotRuoi'): continue
            ev = ob.evaluated_get(dg); me = ev.to_mesh()
            for v in me.vertices:
                p = mi @ (ev.matrix_world @ v.co); loc, nor, _, _ = bvh.find_nearest(p)
                sau = max(sau, -(p - loc).dot(nor))
            ev.to_mesh_clear()
        kq[ten] = sau
    hd.rotation_euler = (0, 0, 0); arm.update_tag(); sc.frame_set(sc.frame_current)
    return kq


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--in', dest='inp', required=True); ap.add_argument('--out', required=True)
    ap.add_argument('--kiem', action='store_true'); ap.add_argument('--anh'); ap.add_argument('--mp4'); ap.add_argument('--thu-nho', type=int, default=1)
    a = ap.parse_args(argv)
    bpy.ops.wm.open_mainfile(filepath=os.path.abspath(a.inp)); sc = bpy.context.scene
    arm = bpy.data.objects['Nam_Rig']; pb = arm.pose.bones; h = pb['Head']
    if a.kiem:
        print('CHU_KY', chu_ky())
        kq = xuyen(sc, arm); print('  xuyên da (mm):', {k: round(v * 1000, 2) for k, v in kq.items()})
        assert max(kq.values()) < 0.0005, kq
        print('PASS xuyen')
    sc.frame_start, sc.frame_end = 1, 96
    for pr in PROPS: key(h, pr, 1, 0)
    for f0 in (18, 62):
        for f, v in ((f0 - 2, 0), (f0, 1), (f0 + 2, 1), (f0 + 4, 0)): key(h, 'chop_mat', f, v)
    for pr, ks in {'cuoi': ((30, 0), (36, 1), (52, 1), (56, 0)), 'may_nhuong': ((30, 0), (36, 0.3), (56, 0.3), (60, 1.0), (78, 1.0), (84, 0)),
                   'mo_to': ((58, 0), (62, 1), (78, 1), (84, 0))}.items():
        for f, v in ks: key(h, pr, f, v)
    mieng = ('mieng_ha', 'mieng_hep', 'mieng_rong', 'mieng_khep')
    for i, vs in enumerate(['A', 'E', 'I', 'O', 'U', 'MBP', 'PHV', 'NT', 'CH', 'KG']):
        for pr in mieng: key(h, pr, 40 + 5 * i, BC.VISEME[vs].get(pr, 0.0))
    for pr in mieng: key(h, pr, 92, 0)
    h.rotation_mode = 'XYZ'
    for f, rx, ry in ((1, 0, 0), (10, 0, 0), (22, 0, 35), (28, 0, 35), (40, 0, -35), (46, 0, 0), (50, 0, 0), (58, 25, 0), (64, 0, 0), (96, 0, 0)):
        h.rotation_euler = (math.radians(rx), math.radians(ry), 0); h.keyframe_insert('rotation_euler', frame=f)
    nh = pb['nhin']
    for f, dx in ((1, 0), (26, 0), (30, 0.12), (40, 0.12), (44, 0), (96, 0)):
        nh.location = (dx, 0, 0); nh.keyframe_insert('location', frame=f)
    # camera 3/4 trước nhìn mặt
    sc.frame_set(1); hp = arm.matrix_world @ h.head
    cd = bpy.data.cameras.new('cam_clip'); cd.lens = 85; cam = bpy.data.objects.new('cam_clip', cd); sc.collection.objects.link(cam); sc.camera = cam
    cam.location = hp + Vector((0.45, -1.05, 0.08)); cam.rotation_euler = (math.radians(87), 0, math.radians(23))
    w = sc.world or bpy.data.worlds.new('w'); sc.world = w; w.color = (0.30, 0.31, 0.34)
    L = bpy.data.lights.new('k', 'SUN'); L.energy = 1.4; lo = bpy.data.objects.new('k', L); lo.rotation_euler = (0.9, 0.2, -0.6); sc.collection.objects.link(lo)
    sc.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
    sc.view_settings.view_transform = 'Standard'; sc.render.resolution_x = 360; sc.render.resolution_y = 400; sc.render.fps = 24
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.out), compress=True)
    if a.anh:
        os.makedirs(a.anh, exist_ok=True)
        for f in range(1, 97, a.thu_nho):
            sc.frame_set(f); sc.render.filepath = os.path.join(a.anh, f'f{f:03d}.png'); bpy.ops.render.render(write_still=True)
    if a.mp4:
        sc.render.image_settings.media_type = 'VIDEO'; sc.render.ffmpeg.format = 'MPEG4'; sc.render.ffmpeg.codec = 'H264'
        sc.render.filepath = os.path.abspath(a.mp4); bpy.ops.render.render(animation=True)
    print('PASS: đã lưu', a.out)


main()
