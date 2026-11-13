"""Lệnh duyệt biểu cảm cho đầu Nam (kiểm tự động, ảnh nhỏ, lưu .blend).
  python bieu_cam_nam.py --kiem                 # dựng, áp dụng bộ biểu cảm, kiểm; in báo cáo; thoát khác 0 nếu có lỗi
  python bieu_cam_nam.py --anh <thư_mục>        # ảnh nhỏ: 7 trạng thái (nghỉ + 6 key) × 3 góc (chính diện, 3/4, nghiêng), ẩn tóc
  python bieu_cam_nam.py --blend Nam_BieuCam.blend
  python bieu_cam/bang_anh.py <thư_mục> bang.png   # ghép bảng (Pillow, chạy ngoài Blender)
Trong Blender: blender -b -P bieu_cam_nam.py -- --kiem. Hoặc module bpy: python bieu_cam_nam.py --kiem."""
import os, sys, argparse
import bpy
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bieu_cam import kiem, tao_key, ap_dung_bo
import dung_dau_nam as D

CAMS = {'chinh_dien': 'Cam_Front', '3q': 'Cam_34', 'nghieng': 'Cam_Right'}


def chay_anh(dau, thu_muc, size=360):
    sc = bpy.context.scene; cams = D.studio(sc)
    for o in bpy.data.collections['04_Hair'].objects: o.hide_render = True          # tóc che trán/mày/nốt ruồi
    sc.render.resolution_x = sc.render.resolution_y = size
    if sc.render.engine == 'CYCLES': sc.cycles.samples = 12
    os.makedirs(thu_muc, exist_ok=True); kb = dau.head.data.shape_keys.key_blocks
    for k in ['nghi'] + [x['ten'] for x in tao_key.nap_dinh_nghia()]:
        for b in kb:
            if b != dau.head.data.shape_keys.reference_key: b.value = 0.0
        if k != 'nghi': kb[k].value = 1.0
        bpy.context.view_layer.update()
        for g, c in CAMS.items():
            sc.camera = cams[c]; sc.render.filepath = os.path.join(thu_muc, f'{k}__{g}.png'); bpy.ops.render.render(write_still=True)


def main(argv):
    ap = argparse.ArgumentParser(); ap.add_argument('--kiem', action='store_true'); ap.add_argument('--anh', default=''); ap.add_argument('--blend', default='')
    a = ap.parse_args(argv)
    dau = ap_dung_bo.dung_va_ap_dung(); ten = [x['ten'] for x in tao_key.nap_dinh_nghia()]; ma = 0
    if a.kiem:
        loi = kiem.chay_kiem(dau, ten)
        for l in loi: print('LOI', l.key, l.gia_tri, l.goc, l.kieu, l.vat, round(l.do, 4), l.chi_tiet)
        print(('PASS' if not loi else 'FAIL'), f'{len(ten)} key × 2 giá trị × {len(kiem.GOCS)} góc: {len(loi)} lỗi'); ma = 1 if loi else 0
    if a.anh: chay_anh(dau, a.anh); print('ảnh ->', a.anh)
    if a.blend: bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))
    return ma


if __name__ == '__main__':
    sys.exit(main(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]))
