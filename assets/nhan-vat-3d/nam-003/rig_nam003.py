"""RIG cho NAM-003 (khuôn mẫu sạch từ Hyper3D: nguon/base_2.glb) — Blender 5.2.x.

  blender -b --factory-startup --python rig_nam003.py -- --out nam-003-rig.blend [--glb nam-003-rig.glb] [--anh dir]

Mô hình: người lớn T-pose cao 1,824 m, sải tay 1,774 m, lưới tam giác ~44,6 nghìn đỉnh sau khi hàn đỉnh trùng ở đường nối UV, KHÔNG có texture, mặt chưa có mắt/mày/miệng.
BÀN TAY 4 NGÓN (3 ngón dài + ngón cái) theo mô hình gốc: dùng tên Mixamo Index, Middle, Ring, Thumb (không có Pinky).
Không viết lại thuật toán: đọc ../nam-002/rig_nam002.py, bỏ dòng gọi main(), vá hằng số rồi chạy lại các hàm build_armature / bind / stretch.
Hai chỗ là XẤP XỈ, không phải đo chắc: (1) khuỷu, gối, cổ chân (tay chân duỗi thẳng nên không có điểm nổi bật) đã được chọn bằng cách thử nhiều vị trí và đo biến dạng (README);
(2) clean_weights của nam-002 có ngưỡng theo tọa độ riêng, nên ở đây tọa độ được ánh xạ tuyến tính từng đoạn (MAPCO) về khung của nam-002 chỉ để tính trọng số.
Cổ: xương phụ NeckBlend1/2 + Corrective Smooth riêng (co_nam003.py, đo bằng kiem_co_nam003.py). Chưa có: mắt, mày, miệng, biểu cảm.
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
    rep("H = (sx * x > 0.555)\n        P = co[H] * np.array([sx, 1, 1])", "H = (sx * co_real[:, 0] > 0.70 - VAI.HEP)\n        P = co_real[H] * np.array([sx, 1, 1])")
    rep("al = sm(0.555, 0.575, P[:, 0])[:, None]", "al = sm(0.70 - VAI.HEP, 0.72 - VAI.HEP, P[:, 0])[:, None]")
    rep("    co = mesh_co(body); ax = np.abs(co[:, 0]); z = co[:, 2]\n    reg =", "    co = MAPCO(mesh_co(body)); ax = np.abs(co[:, 0]); z = co[:, 2]\n    reg =")
    g = {'__name__': 'rig_nam002_vá', '__file__': RIG002}
    zr = [0, 0.10, 0.46, 0.88, 1.18, 1.452, 1.50, 1.58, 1.824]; zn = [0, 0.09, 0.48, 0.86, 1.11, 1.258, 1.33, 1.40, 1.70]
    xr = [0, 0.12, 0.20, 0.47, 0.66, 0.887]; xn = [0, 0.11, 0.17, 0.37, 0.505, 0.70]

    import vai_nam003 as VAI; g['VAI'] = VAI

    def MAPCO(c):
        c = np.array(c, float).copy(); c[:, 0] = [VAI.khoi_phuc(x_, z_) for x_, z_ in zip(c[:, 0], c[:, 2])]   # về toạ độ lưới gốc trước khi ánh xạ
        c2 = np.array(c, float).copy(); c2[:, 2] = np.interp(c[:, 2], zr, zn); c2[:, 0] = np.sign(c[:, 0]) * np.interp(np.abs(c[:, 0]), xr, xn); return c2
    g['MAPCO'] = MAPCO
    exec(compile(src, 'rig_nam002_vá', 'exec'), g)
    # 16/11: gối/háng dời gần tâm mặt cắt thật của chân (đo trên lưới: tâm gối x 0,134 y 0,064; mốc cũ lệch vào trong 1,4 cm, ra trước 2,9 cm): hông y 0,065, gối (0,1235; 0,045) — gối vẫn nằm trên đường hông–mắt cá theo x và trước 1,2 cm để IK gập về trước (thử gối y 0,052 cho IK lệch ngang +18 cm). mốc khớp bên +X (m). GỐI nằm TRÊN đường hông–mắt cá theo x (0,1205) và lệch về phía TRƯỚC (y nhỏ hơn đường nối) để IK gập thẳng về trước (xem test_ik_goi_ve_truoc); mốc gối cũ (x 0,132, y 0,04) nằm sau/lệch đường nối làm gối vòng kiềng 13–19 cm khi đi. Khuỷu x=0,50 và gối y=0,04 chọn bằng đo biến dạng 15/11 (thử khuỷu 0,41–0,56, gối y 0,02–0,056, hông x 0,09–0,105: xem README). Cổ chân chọn 15/11 bằng chon_co_chan_nam003.py (z 0,08–0,14 × y 0,04–0,06). Đo chắc: trục tay z≈1,45, cổ tay x≈0,66, đáy háng z≈0,90, đỉnh đầu 1,824. Ước: khuỷu, gối, cổ chân (xem docstring).
    # 17/11: theo vị trí khớp của rig Hyper3D chủ repo gửi (base.glb): xương đòn, vai, khuỷu, cổ tay, cột sống, gối z 0,58, cổ chân z 0,118, ngón cái chân.
    # Chỉnh để dùng được: háng z 0,95 (bản kia 1,047 làm háng giãn 264–378 cạnh), gối x trên đường hông–cổ chân và y 0,02 (trước đường 1 cm) để IK gập về trước,
    # khuỷu y 0,045 (bản kia 0,055 gần thẳng hàng làm IK tay yếu). Cổ/đầu giữ nguyên (phần mặt đang làm dựa vào Head).
    g['J'].update(dict(
        hips=(0, 0.02, 1.0), spine=(0, 0.028, 1.185), spine1=(0, 0.036, 1.285), spine2=(0, 0.048, 1.396), neck=(0, 0.04, 1.50), head=(0, 0.04, 1.58), head_top=(0, 0.02, 1.824),
        clav=(0.063, 0.063, 1.505), shoulder=(0.189, 0.062, 1.465), elbow=(0.415, 0.045, 1.445), wrist=(0.667, 0.035, 1.455), hand_end=(0.79, 0.03, 1.455),
        hip=(0.084, 0.03, 0.95), knee=(0.1111, 0.02, 0.58), ankle=(0.145, 0.05, 0.118), ball=(0.141, -0.089, 0.005), toe=(0.16, -0.14, 0.005)))
    if os.environ.get('NAM003_J'):   # thử vị trí khớp khác: NAM003_J='{"elbow":[0.44,0.058,1.447]}'
        import json
        print(f"CẢNH BÁO: NAM003_J đang đặt ({os.environ['NAM003_J']}) → vị trí khớp KHÁC mặc định. Bỏ biến này (unset NAM003_J) nếu không cố ý thử.", file=sys.stderr)
        g['J'].update({k: tuple(v) for k, v in json.loads(os.environ['NAM003_J']).items()})
    for k_, v_ in list(g['J'].items()): g['J'][k_] = (VAI.hep_vai(v_[0], v_[2]) if v_[2] > 1.2 else v_[0], v_[1], v_[2])   # mốc khớp tay dịch cùng lưới
    V3 = Vector
    CH = g['CH']; CH.clear()
    CH['Index'] = [V3(p) for p in [(0.79, 0.025, 1.497), (0.822, 0.024, 1.499), (0.852, 0.022, 1.500), (0.887, 0.021, 1.501)]]
    CH['Middle'] = [V3(p) for p in [(0.79, 0.025, 1.452), (0.822, 0.024, 1.450), (0.852, 0.022, 1.449), (0.884, 0.021, 1.448)]]
    CH['Ring'] = [V3(p) for p in [(0.78, 0.026, 1.430), (0.805, 0.025, 1.415), (0.828, 0.024, 1.403), (0.845, 0.023, 1.395)]]
    CH['Thumb'] = [V3(p) for p in [(0.72, 0.025, 1.47), (0.745, 0.024, 1.520), (0.76, 0.023, 1.555), (0.768, 0.022, 1.577)]]
    for k_ in CH: CH[k_] = [V3((VAI.hep_vai(q_.x, q_.z), q_.y, q_.z)) for q_ in CH[k_]]
    g['PROPS'].clear(); g['PROPS'].update({'Index': 'nam_tro', 'Middle': 'nam_giua', 'Ring': 'nam_ap', 'Thumb': 'nam_cai'})
    g['CURL'].clear(); g['CURL'].update({'Index': (55, 75, 45), 'Middle': (55, 75, 45), 'Ring': (55, 75, 45), 'Thumb': (35, 45, 50)})
    return g


def nap_mo_hinh():
    bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=SRC_GLB)
    body = [o for o in bpy.data.objects if o.type == 'MESH'][0]; body.name = 'Nam_Body'
    bm = bmesh.new(); bm.from_mesh(body.data); n0 = len(bm.verts); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)   # đường nối UV tách đôi đỉnh
    bm.to_mesh(body.data); bm.free()
    for p in body.data.polygons: p.use_smooth = True
    import vai_nam003 as VAI
    import chan_nam003 as CHAN
    if CHAN.GOI_K > 0 or CHAN.GOI_KY > 0:   # làm thon gối
        for v in body.data.vertices: v.co.x, v.co.y, v.co.z = CHAN.thu_goi(v.co.x, v.co.y, v.co.z)
        print(f'  thon gối: ngang {CHAN.GOI_K * 100:.0f}%, trước–sau {CHAN.GOI_KY * 100:.0f}%')
    if VAI.DELTA_K > 0 or VAI.NACH_HA > 0:   # bắp vai to hơn, hạ nách (trước thu hẹp vai)
        for v in body.data.vertices: v.co.x, v.co.y, v.co.z = VAI.dinh_hinh_vai(v.co.x, v.co.y, v.co.z)
        print(f'  bắp vai +{VAI.DELTA_K * 100:.0f}%, hạ nách {VAI.NACH_HA * 100:.1f} cm')
    if VAI.HEP > 0:   # thu hẹp vai–tay vào trong (nguồn GLB giữ nguyên); mốc khớp và ánh xạ trọng số dịch cùng
        for v in body.data.vertices: v.co.x = VAI.hep_vai(v.co.x, v.co.z)
        print(f'  thu hẹp vai {VAI.HEP * 100:.1f} cm mỗi bên')
    print(f'  nạp {os.path.basename(SRC_GLB)}: hàn đỉnh trùng {n0} → {len(body.data.vertices)}')
    return body


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--out', required=True); ap.add_argument('--glb'); ap.add_argument('--anh')
    a = ap.parse_args(argv)
    g = patched_namespace(); sc = bpy.context.scene
    body = nap_mo_hinh(); sc = bpy.context.scene
    t0 = time.time(); arm = g['build_armature'](sc); g['bind'](sc, arm, body)
    import co_nam003 as CO; CO.add_neck_bones(arm); CO.set_neck_weights(body); CO.add_neck_cs(body)   # xương phụ cổ + trọng số gradient (thiết kế 15/11)
    print(f'  rig xong {time.time() - t0:.1f}s; {len(body.vertex_groups)} nhóm trọng số')
    import vai_nam003 as VAI; VAI.them_driver_vai(arm)   # vai hạ theo tay buông (khe nách)
    import rang_buoc_nam003 as RB; RB.them_rang_buoc(arm, body)   # ràng buộc giải phẫu (thay driver vai cũ)
    import trong_so_nam003 as TS; TS.lam_muot(body)   # làm mượt trọng số háng/cổ chân/gối/bàn tay (đo bằng kiem_rom_nam003.py)
    # tối đa 4 xương/đỉnh (giới hạn Unity/Unreal/web)
    bpy.context.view_layer.objects.active = body; bpy.ops.object.vertex_group_limit_total(group_select_mode='BONE_DEFORM', limit=4)
    bpy.ops.object.vertex_group_normalize_all(group_select_mode='BONE_DEFORM', lock_active=False)
    g['stretch'](arm, body)
    if a.anh: g['render_sheet'](sc, arm, os.path.abspath(a.anh))
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.out), compress=True)
    if a.glb: bpy.ops.export_scene.gltf(filepath=os.path.abspath(a.glb), export_format='GLB', export_apply=False, export_animations=False)
    print('PASS: đã lưu', a.out)


if '--out' in sys.argv:   # import rig_nam003 (vd từ kiem_co_nam003.py) không dựng rig
    main()
