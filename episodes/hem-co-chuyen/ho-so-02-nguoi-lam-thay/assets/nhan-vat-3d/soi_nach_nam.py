"""So thân cage có tay/chân mới trước/sau sửa nách; kiểm geometry và xuất cùng camera.

blender -b -t 4 --python-exit-code 1 --python soi_nach_nam.py -- \
  --before before.blend --after after.blend --out render-than/nach --render
Không dựng lại nhân vật hoặc thay đổi file Blender đầu vào.
"""
import argparse
import json
import os
import sys

import bpy
import numpy as np
from mathutils.kdtree import KDTree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dung_than_cage_nam as C
import gan_tay_chan_nam as G


def coords(ob):
    a = np.empty(len(ob.data.vertices) * 3)
    ob.data.vertices.foreach_get('co', a)
    return a.reshape(-1, 3)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--before', required=True)
    ap.add_argument('--after', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--render', action='store_true')
    ap.add_argument('--samples', type=int, default=48)
    args = ap.parse_args(sys.argv[sys.argv.index('--') + 1:])
    os.makedirs(args.out, exist_ok=True)
    names = ['Nam_Dau_Than', 'Head_Base', 'Nam_BanTay.L', 'Nam_BanTay.R', 'Nam_BanChan.L', 'Nam_BanChan.R']
    bpy.ops.wm.open_mainfile(filepath=os.path.abspath(args.before))
    before = {n: coords(bpy.data.objects[n]) for n in names}
    bpy.ops.wm.open_mainfile(filepath=os.path.abspath(args.after))
    asm = bpy.data.objects['Nam_Dau_Than']
    A, B = before['Nam_Dau_Than'], coords(asm)
    assert A.shape == B.shape, 'Phải giữ số đỉnh của bản lắp ráp trong lượt sửa cục bộ này'
    d = np.linalg.norm(B - A, axis=1)
    changed = d > 1e-7
    # Subdivision truyền ảnh hưởng từ vòng nách sang mặt ngực kề bên.
    # Bảo vệ cổ/đầu, bụng dưới, chân và đoạn tay xa thay vì cắt một hộp nhỏ giả tạo.
    local = (np.abs(A[:, 0]) < .28) & (A[:, 2] > .58) & (A[:, 2] < .88)
    preserved = {n: np.array_equal(before[n], coords(bpy.data.objects[n])) for n in names[1:]}
    body = B[(B[:, 2] > .58) & (B[:, 2] < .88)]
    tree = KDTree(len(body))
    for i, p in enumerate(body): tree.insert(p.tolist(), i)
    tree.balance()
    symmetry = max(tree.find((-p[0], p[1], p[2]))[2] for p in body)
    check = {
        'co_thay_doi_hinh_hoc': bool(changed.any()),
        'chi_thay_doi_vung_nach_va_nguc_ke_can': bool((d[~local] < 1e-7).all()),
        'than_doi_xung': symmetry < 1e-6,
        **{'giu_nguyen_' + n: bool(ok) for n, ok in preserved.items()},
    }
    cage_checks = C.check_all(bpy.context.scene)
    # Kiểm cũ đòi bàn chân có biên hở vì lấy từ thân voxel cũ.
    # Tay/chân mới của 538aef4 là mesh kín; dùng 9 check_seams của chính entry gắn thay thế.
    cage_checks.pop('tay_chan_trong_ong')
    cw, direction, radius, _ = G.measure_wrist(asm)
    fc, fr, _ = G.measure_ankle(asm)
    parts = {n: bpy.data.objects[n] for n in names if n.startswith(('Nam_BanTay', 'Nam_BanChan'))}
    seams = G.check_seams(asm, parts, {'hand': {'c': cw, 'd': direction, 'rf': radius}, 'foot': {'c': fc, 'r': fr}})
    ok = all(check.values()) and all(v[0] for v in cage_checks.values()) and G.ok_all(seams)
    report = {
        'dat': ok, 'bao_toan': check, 'so_dinh_doi': int(changed.sum()),
        'dich_chuyen_lon_nhat_mm': float(d.max() * 1000),
        'sai_so_doi_xung_mm': symmetry * 1000,
        'cage': cage_checks, 'noi_tay_chan_moi': seams,
        'kiem_cu_khong_ap_dung': 'tay_chan_trong_ong đòi vòng cắt chân cũ; thay bằng check_seams của gan_tay_chan_nam.py',
        'gioi_han': 'Chỉ kiểm hình tĩnh; chưa rig hoặc kiểm biến dạng vai/nách.',
    }
    with open(os.path.join(args.out, 'kiem-tra-nach.json'), 'w') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    assert ok, 'Còn lỗi geometry hoặc thay đổi ngoài phạm vi; xem kiem-tra-nach.json'
    if args.render:
        C.CLAY = '#c8997b'
        C.VIEWS.update({
            'nach_can': ((.5, -4, .745), (.17, 0, .745), .28, (760, 760)),
            'nach_cheo': ((3, -3, .72), (.17, 0, .72), .32, (760, 760)),
        })
        for tag, path in [('truoc_sua_', args.before), ('sau_sua_', args.after)]:
            bpy.ops.wm.open_mainfile(filepath=os.path.abspath(path))
            scene = bpy.context.scene
            import _cycles
            scene.cycles.use_denoising = bool(getattr(_cycles, 'with_openimagedenoise', False))
            scene.cycles.device = 'CPU'
            C.render_views(scene, args.out, ['nach_can', 'nach_cheo', 'truoc'], args.samples, prefix=tag)


if __name__ == '__main__':
    main()
