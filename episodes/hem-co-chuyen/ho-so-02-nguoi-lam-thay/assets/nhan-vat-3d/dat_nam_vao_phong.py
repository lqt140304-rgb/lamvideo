"""Đặt Nam (Nam_than_dau.blend do dung_than_nam.py --blend xuất ra) vào BỐI CẢNH CÓ SẴN của repo — phòng trọ Blender `boi-canh-3d/xay_phong_tro.py`
(nằm trên nhánh claude/keen-darwin-txydqa; trích ra thư mục bằng `git archive` rồi truyền --phong-dir). Không tạo phòng thay thế, không scale phòng.

  python dat_nam_vao_phong.py --phong-dir <.../boi-canh-3d> --nam-blend Nam_than_dau.blend --out nam_trong_phong.png [--pos 1.35,1.7] [--yaw 180] [--cam WIDE]
Toạ độ --pos theo hệ THIẾT KẾ của phòng (x phản chiếu qua W/2 như xay_phong_tro.mx). yaw 180° = Nam quay mặt về camera đặt ở y lớn.
Chỉ kiểm tư thế đứng (chưa rig): bàn chân tại Z = 0 (sàn), tỉ lệ thế giới giữ nguyên (cao ≈ 1,60 m, cửa 2,10 m, mặt bàn 0,75 m).
"""
import sys, os, math, argparse
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
ap = argparse.ArgumentParser(); ap.add_argument('--phong-dir', required=True); ap.add_argument('--nam-blend', required=True); ap.add_argument('--out', default='nam_trong_phong.png')
ap.add_argument('--pos', default='1.35,1.7'); ap.add_argument('--yaw', type=float, default=180.0); ap.add_argument('--cam', default='WIDE'); ap.add_argument('--mode', default='day'); ap.add_argument('--samples', type=int, default=64); ap.add_argument('--width', type=int, default=1600)
ap.add_argument('--blend', default='')
a = ap.parse_args(argv)
sys.path.insert(0, os.path.abspath(a.phong_dir))
import bpy
import xay_phong_tro as R
sc = R.build(a.mode, 10.0, 0.0, 0.0, a.cam, (a.width, round(a.width / 2.39)))
# --- nạp Nam
with bpy.data.libraries.load(os.path.abspath(a.nam_blend), link=False) as (src, dst):
    dst.collections = [c for c in src.collections if c in ('Nam_Dau', '02_Body_Base')]
root = bpy.data.objects.new('Nam_Goc', None); sc.collection.objects.link(root)
objs = []
for c in dst.collections:
    sc.collection.children.link(c)
    def walk(col):
        for o in col.objects: objs.append(o)
        for ch in col.children: walk(ch)
    walk(c)
for o in objs:
    if o.parent is None: o.parent = root
x, y = (float(v) for v in a.pos.split(','))
root.location = (R.mx(x), y, 0.0); root.rotation_euler = (0, 0, math.radians(a.yaw))
sc.cycles.samples = a.samples
if a.blend: bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))
sc.render.filepath = os.path.abspath(a.out); bpy.ops.render.render(write_still=True)
