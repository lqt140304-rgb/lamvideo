"""RIG cho NAM-003 (khuôn mẫu sạch từ Hyper3D: nguon/base_2.glb) — Blender 5.2.x.

  blender -b --factory-startup --python rig_nam003.py -- --out nam-003-rig.blend [--glb nam-003-rig.glb] [--anh dir]

Mô hình: người lớn T-pose cao 1,824 m, sải tay 1,774 m, lưới tam giác ~44,6 nghìn đỉnh sau khi hàn đỉnh trùng ở đường nối UV, KHÔNG có texture, mặt chưa có mắt/mày/miệng.
BÀN TAY 4 NGÓN (3 ngón dài + ngón cái) theo mô hình gốc: dùng tên Mixamo Index, Middle, Ring, Thumb (không có Pinky).
Không viết lại thuật toán: đọc ../nam-002/rig_nam002.py, bỏ dòng gọi main(), vá hằng số rồi chạy lại các hàm build_armature / bind / stretch.
Hai chỗ là ƯỚC LƯỢNG, không phải đo chắc: (1) khuỷu, gối, cổ chân (tay chân duỗi thẳng nên không có điểm nổi bật); khuỷu và gối đã được chọn bằng cách thử nhiều vị trí và đo biến dạng (README), cổ chân vẫn ước;
(2) clean_weights của nam-002 có ngưỡng theo tọa độ riêng, nên ở đây tọa độ được ánh xạ tuyến tính từng đoạn (MAPCO) về khung của nam-002 chỉ để tính trọng số.
Chưa có: mắt, mày, miệng, biểu cảm; trọng số cổ cần chỉnh (quay đầu 35° nếp dưới hàm, đo thử dài thêm ~13 mm).
"""
import sys, os, math, time, argparse
import numpy as np, bpy, bmesh
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
SRC_GLB = os.path.join(HERE, 'nguon', 'base_2.glb')
RIG002 = os.path.join(HERE, '..', 'nam-002', 'rig_nam002.py')


def patched_namespace():
    src = open(RIG002, encoding='utf-8').read().replace('\nmain()\n', '\n')
    src = src.replace("HERE = os.path.dirname(os.path.abspath(__file__))", f"HERE = {os.path.dirname(os.path.abspath(RIG002))!r}")

    def rep(a, b):
        nonlocal src
        assert a in src, 'không tìm thấy đoạn cần vá: ' + a[:70]; src = src.replace(a, b)
    rep("    co = mesh_co(body); x, y, z = co.T; ax = np.abs(x)\n    arm_ob", "    co_real = mesh_co(body); co = MAPCO(co_real); x, y, z = co.T; ax = np.abs(x)\n    arm_ob")
    rep("W = fill_missing(W, co, names, arm_ob)", "W = fill_missing(W, co_real, names, arm_ob)")
    rep("tt = ((co - a_) @ ab) / (ab @ ab); f = 0.7", "tt = ((co_real - a_) @ ab) / (ab @ ab); f = 0.7")
    rep("H = (sx * x > 0.555)\n        P = co[H] * np.array([sx, 1, 1])", "H = (sx * co_real[:, 0] > 0.70)\n        P = co_real[H] * np.array([sx, 1, 1])")
    rep("al = sm(0.555, 0.575, P[:, 0])[:, None]", "al = sm(0.70, 0.72, P[:, 0])[:, None]")
    rep("    co = mesh_co(body); ax = np.abs(co[:, 0]); z = co[:, 2]\n    reg =", "    co = MAPCO(mesh_co(body)); ax = np.abs(co[:, 0]); z = co[:, 2]\n    reg =")
    g = {'__name__': 'rig_nam002_vá', '__file__': RIG002}
    zr = [0, 0.10, 0.46, 0.88, 1.18, 1.452, 1.50, 1.58, 1.824]; zn = [0, 0.09, 0.48, 0.86, 1.11, 1.258, 1.33, 1.40, 1.70]
    xr = [0, 0.12, 0.20, 0.47, 0.66, 0.887]; xn = [0, 0.11, 0.17, 0.37, 0.505, 0.70]

    def MAPCO(c):
        c2 = np.array(c, float).copy(); c2[:, 2] = np.interp(c[:, 2], zr, zn); c2[:, 0] = np.sign(c[:, 0]) * np.interp(np.abs(c[:, 0]), xr, xn); return c2
    g['MAPCO'] = MAPCO
    exec(compile(src, 'rig_nam002_vá', 'exec'), g)
    # mốc khớp bên +X (m). Khuỷu x=0,50 và gối y=0,04 chọn bằng đo biến dạng 15/11 (thử khuỷu 0,41–0,56, gối y 0,02–0,056, hông x 0,09–0,105: xem README). Đo chắc: trục tay z≈1,45, cổ tay x≈0,66, đáy háng z≈0,90, đỉnh đầu 1,824. Ước: khuỷu, gối, cổ chân (xem docstring).
    g['J'].update(dict(
        hips=(0, 0.02, 0.96), spine=(0, 0.025, 1.06), spine1=(0, 0.015, 1.18), spine2=(0, 0.02, 1.31), neck=(0, 0.04, 1.50), head=(0, 0.04, 1.58), head_top=(0, 0.02, 1.824),
        clav=(0.03, 0.04, 1.46), shoulder=(0.21, 0.045, 1.452), elbow=(0.50, 0.058, 1.447), wrist=(0.66, 0.04, 1.452), hand_end=(0.79, 0.03, 1.455),
        hip=(0.09, 0.02, 0.88), knee=(0.132, 0.04, 0.46), ankle=(0.148, 0.05, 0.105), ball=(0.155, -0.07, 0.03), toe=(0.16, -0.14, 0.02)))
    if os.environ.get('NAM003_J'):   # thử vị trí khớp khác: NAM003_J='{"elbow":[0.44,0.058,1.447]}'
        import json
        g['J'].update({k: tuple(v) for k, v in json.loads(os.environ['NAM003_J']).items()})
    V3 = Vector
    CH = g['CH']; CH.clear()
    CH['Index'] = [V3(p) for p in [(0.79, 0.025, 1.497), (0.822, 0.024, 1.499), (0.852, 0.022, 1.500), (0.887, 0.021, 1.501)]]
    CH['Middle'] = [V3(p) for p in [(0.79, 0.025, 1.452), (0.822, 0.024, 1.450), (0.852, 0.022, 1.449), (0.884, 0.021, 1.448)]]
    CH['Ring'] = [V3(p) for p in [(0.78, 0.026, 1.430), (0.805, 0.025, 1.415), (0.828, 0.024, 1.403), (0.845, 0.023, 1.395)]]
    CH['Thumb'] = [V3(p) for p in [(0.72, 0.025, 1.47), (0.745, 0.024, 1.520), (0.76, 0.023, 1.555), (0.768, 0.022, 1.577)]]
    g['PROPS'].clear(); g['PROPS'].update({'Index': 'nam_tro', 'Middle': 'nam_giua', 'Ring': 'nam_ap', 'Thumb': 'nam_cai'})
    g['CURL'].clear(); g['CURL'].update({'Index': (55, 75, 45), 'Middle': (55, 75, 45), 'Ring': (55, 75, 45), 'Thumb': (35, 45, 50)})
    return g


def nap_mo_hinh():
    bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=SRC_GLB)
    body = [o for o in bpy.data.objects if o.type == 'MESH'][0]; body.name = 'Nam_Body'
    bm = bmesh.new(); bm.from_mesh(body.data); n0 = len(bm.verts); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)   # đường nối UV tách đôi đỉnh
    bm.to_mesh(body.data); bm.free()
    for p in body.data.polygons: p.use_smooth = True
    print(f'  nạp {os.path.basename(SRC_GLB)}: hàn đỉnh trùng {n0} → {len(body.data.vertices)}')
    return body


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--out', required=True); ap.add_argument('--glb'); ap.add_argument('--anh')
    a = ap.parse_args(argv)
    g = patched_namespace(); sc = bpy.context.scene
    body = nap_mo_hinh(); sc = bpy.context.scene
    t0 = time.time(); arm = g['build_armature'](sc); g['bind'](sc, arm, body)
    import co_nam003 as CO; CO.add_neck_bones(arm); CO.set_neck_weights(body)   # xương phụ cổ + trọng số gradient (thiết kế 15/11)
    print(f'  rig xong {time.time() - t0:.1f}s; {len(body.vertex_groups)} nhóm trọng số')
    # tối đa 4 xương/đỉnh (giới hạn Unity/Unreal/web)
    bpy.context.view_layer.objects.active = body; bpy.ops.object.vertex_group_limit_total(group_select_mode='ALL', limit=4)
    bpy.ops.object.vertex_group_normalize_all(group_select_mode='ALL', lock_active=False)
    g['stretch'](arm, body)
    if a.anh: g['render_sheet'](sc, arm, os.path.abspath(a.anh))
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.out), compress=True)
    if a.glb: bpy.ops.export_scene.gltf(filepath=os.path.abspath(a.glb), export_format='GLB', export_apply=False, export_animations=False)
    print('PASS: đã lưu', a.out)


if '--out' in sys.argv:   # import rig_nam003 (vd từ kiem_co_nam003.py) không dựng rig
    main()
