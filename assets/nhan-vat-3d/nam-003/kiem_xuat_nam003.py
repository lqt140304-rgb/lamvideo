"""KIỂM XUẤT GLB VÀ TỐC ĐỘ CỔ NAM-003 — Blender 5.2.x.

  <bpy-python> kiem_xuat_nam003.py --rig nam-003-rig.blend [--glb out.glb] [--lan 20]

1) GLB THẬT: xuất nam-003-rig.blend ra GLB (ràng buộc Copy Rotation và Corrective Smooth KHÔNG đi theo), nhập lại vào cảnh mới, rồi đo cạnh dài thêm ở vùng cổ khi xoay xương Head:
   (a) chỉ Head xoay (engine không có ràng buộc, không bake);  (b) Head + NeckBlend1/2 xoay 33 %/66 % (engine tái tạo ràng buộc hoặc bake animation).
2) TỐC ĐỘ: thời gian tính biến dạng lưới thân cho mỗi lần đổi tư thế, bật hết Corrective Smooth / tắt riêng CS cổ (150 vòng) / tắt mọi CS.
"""
import sys, os, math, time, argparse
import numpy as np, bpy
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import rig_nam003 as R
import kiem_co_nam003 as K


def rot_pose(arm, bn, axis, deg):
    pb = arm.pose.bones[bn]; bpy.context.view_layer.update(); M = pb.matrix.copy(); h = M.translation.copy()
    pb.matrix = Matrix.Translation(h) @ Matrix.Rotation(math.radians(deg), 4, Vector(axis)) @ Matrix.Translation(-h) @ M; bpy.context.view_layer.update()


def reset_pose(arm):
    for b in arm.pose.bones: b.location = (0, 0, 0); b.rotation_mode = 'QUATERNION'; b.rotation_quaternion = (1, 0, 0, 0); b.scale = (1, 1, 1)
    bpy.context.view_layer.update()


def glb_neck(glb_path):
    bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=glb_path)
    arm = [o for o in bpy.data.objects if o.type == 'ARMATURE'][0]; body = bpy.data.objects['Nam_Body']      # bỏ qua 'Icosphere' (object hiển thị xương do bộ nhập GLB tạo)
    me = body.data; n = len(me.vertices); ea = np.zeros(len(me.edges) * 2, int); me.edges.foreach_get('vertices', ea); ea = ea.reshape(-1, 2)

    def pos():
        e = body.evaluated_get(bpy.context.evaluated_depsgraph_get()); m = e.to_mesh(); a = np.zeros(len(m.vertices) * 3); m.vertices.foreach_get('co', a); e.to_mesh_clear(); return a.reshape(-1, 3)
    reset_pose(arm); p0 = pos(); l0 = np.linalg.norm(p0[ea[:, 0]] - p0[ea[:, 1]], axis=1); zm = (p0[ea[:, 0]][:, 2] + p0[ea[:, 1]][:, 2]) / 2
    sel = (l0 > 0.003) & (zm > 1.40) & (zm < 1.66); res = {}
    cases = {'quay+35': [('Head', (0, 0, 1), 35)], 'cui+25': [('Head', (1, 0, 0), 25)], 'kq1': [('Head', (0, 0, 1), 35), ('Head', (1, 0, 0), 15)]}
    for blend_frac in (False, True):
        for nm, ops in cases.items():
            reset_pose(arm)
            for bn, ax, deg in ops:
                rot_pose(arm, bn, ax, deg)
                if blend_frac:
                    for b2, f in (('NeckBlend1', 0.33), ('NeckBlend2', 0.66)):
                        if b2 in arm.pose.bones: rot_pose(arm, b2, ax, deg * f)
            p = pos(); l = np.linalg.norm(p[ea[:, 0]] - p[ea[:, 1]], axis=1)
            res[(nm, 'Head+NeckBlend 33/66%' if blend_frac else 'chỉ Head')] = float(((l - l0)[sel]).max() * 1000)
    return res


def toc_do(rig_path, lan):
    arm, body = K.mo_rig(rig_path); g = R.patched_namespace(); cs = [m for m in body.modifiers if m.type == 'CORRECTIVE_SMOOTH']; out = {}
    def tinh():
        t0 = time.perf_counter()
        for i in range(lan):
            g['reset'](arm); g['rot_world'](arm, 'Head', (0, 0, 1), 5 + 25 * (i % 2)); bpy.context.view_layer.update()
            e = body.evaluated_get(bpy.context.evaluated_depsgraph_get()); m = e.to_mesh(); e.to_mesh_clear()
        return (time.perf_counter() - t0) / lan * 1000
    tinh()   # khởi động
    for nm, on in (('bật hết Corrective Smooth', {m.name: True for m in cs}), ('tắt riêng CorrectiveSmoothCo (cổ)', {m.name: m.name != 'CorrectiveSmoothCo' for m in cs}), ('tắt mọi Corrective Smooth', {m.name: False for m in cs})):
        for m in cs: m.show_viewport = on[m.name]
        out[nm] = tinh()
    return out


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--rig', required=True); ap.add_argument('--glb', default='/tmp/nam003_kiem.glb'); ap.add_argument('--lan', type=int, default=20)
    a = ap.parse_args(argv)
    t = toc_do(os.path.abspath(a.rig), a.lan)
    print('TỐC ĐỘ (ms mỗi lần đổi tư thế, tính lưới thân 44,6 nghìn đỉnh):'); [print(f'  {k:40s} {v:8.1f} ms') for k, v in t.items()]
    arm, body = K.mo_rig(os.path.abspath(a.rig)); bpy.ops.export_scene.gltf(filepath=a.glb, export_format='GLB', export_apply=False, export_animations=False)
    print(f'GLB xuất: {a.glb} ({os.path.getsize(a.glb) / 1e6:.1f} MB)')
    r = glb_neck(a.glb); print('CỔ TRONG GLB NHẬP LẠI (cạnh dài thêm max mm, không Corrective Smooth):')
    for (pose, mode), v in r.items(): print(f'  {pose:8s} {mode:24s} {v:6.2f} mm')


if __name__ == '__main__':
    main()
