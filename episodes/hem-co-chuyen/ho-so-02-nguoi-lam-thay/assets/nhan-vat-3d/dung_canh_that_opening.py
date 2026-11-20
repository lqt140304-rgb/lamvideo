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
ap.add_argument('--rong', type=int, default=640); ap.add_argument('--blend', default=''); ap.add_argument('--che-do', default='night'); a = ap.parse_args(argv)
import xay_phong_tro as X
import dung_stickman_cast as dsc
W = X.W
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
os.makedirs(a.ra, exist_ok=True)
sc.render.filepath = os.path.join(a.ra, f'that_{a.cam}.png')
bpy.ops.render.render(write_still=True)
if a.blend: bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))
