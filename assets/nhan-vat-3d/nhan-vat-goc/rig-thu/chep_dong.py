"""CHÉP ĐỘNG TÁC (retarget) từ một file rig chuẩn Mixamo (GLB/FBX) sang Goc_Rig đã đổi tên Mixamo (rig_goc.py --ten-mixamo).

Chạy:
  blender -b --factory-startup --python chep_dong.py -- --rig nhan-vat-goc-rig-thu.blend --nguon base.glb --out co-dong.blend [--anh xem-dong]
Cách chép: mỗi khung, độ xoay THẾ GIỚI của xương nguồn so với dáng nghỉ nguồn (D = R_pose · R_nghi⁻¹) được áp lên dáng nghỉ của
xương đích cùng tên ⇒ không phụ thuộc trục/roll riêng của hai rig. Vị trí hông dời theo tỉ lệ chiều cao hông.
IK chân của Goc_Rig: ik_foot/pole_knee được đặt theo bàn chân/gối FK rồi tạo khoá ⇒ kết quả ≈ FK nguồn.
"""
import sys, os, math, argparse
import bpy
from mathutils import Matrix, Vector


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--rig', required=True); ap.add_argument('--nguon', required=True)
    ap.add_argument('--out', required=True); ap.add_argument('--anh'); ap.add_argument('--buoc', type=int, default=1)
    a = ap.parse_args(argv)
    bpy.ops.wm.open_mainfile(filepath=os.path.abspath(a.rig)); sc = bpy.context.scene
    tgt = bpy.data.objects['Goc_Rig']
    before = set(bpy.data.objects)
    if a.nguon.lower().endswith(('.glb', '.gltf')): bpy.ops.import_scene.gltf(filepath=os.path.abspath(a.nguon))
    else: bpy.ops.import_scene.fbx(filepath=os.path.abspath(a.nguon))
    new = [o for o in bpy.data.objects if o not in before]
    src = next(o for o in new if o.type == 'ARMATURE')
    act = src.animation_data.action; f0, f1 = (int(round(x)) for x in act.frame_range)
    print(f'  nguồn: {src.name}, động tác {act.name}, khung {f0}–{f1}')
    names = [b.name for b in tgt.data.bones if b.name in src.data.bones]
    order = [b.name for b in tgt.data.bones if b.name in names]          # bones duyệt cha trước con
    print(f'  xương trùng tên: {len(names)}')
    Ws, Wt = src.matrix_world, tgt.matrix_world
    rest_s = {n: (Ws @ src.data.bones[n].matrix_local) for n in names}
    rest_t = {n: (Wt @ tgt.data.bones[n].matrix_local) for n in tgt.data.bones.keys()}
    k = rest_t['Hips'].translation.z / max(rest_s['Hips'].translation.z, 1e-6)
    pbt = tgt.pose.bones
    leg_cons = [c for b in pbt for c in b.constraints if c.type in ('IK', 'COPY_ROTATION') and b.name.endswith(('Leg', 'Foot'))]
    tgt.animation_data_create(); tgt.animation_data.action = bpy.data.actions.new(f'{act.name}_goc')
    for b in pbt: b.rotation_mode = 'QUATERNION'
    sc.frame_start, sc.frame_end = f0, f1
    for f in range(f0, f1 + 1, a.buoc):
        sc.frame_set(f)
        for c in leg_cons: c.mute = True
        for b in pbt: b.location = (0, 0, 0); b.rotation_quaternion = (1, 0, 0, 0)
        bpy.context.view_layer.update()
        pose_w = {}
        for n in order:
            ps = Ws @ src.pose.bones[n].matrix
            D = (ps.to_3x3() @ rest_s[n].to_3x3().inverted())
            bone = tgt.data.bones[n]
            if bone.parent is None or n == 'Hips':
                head = rest_t[n].translation + (ps.translation - rest_s[n].translation) * k
            else:
                par = bone.parent.name
                Mp = pose_w.get(par, Wt @ pbt[par].matrix)
                head = Mp @ (rest_t[par].inverted() @ rest_t[n].translation)
            M = Matrix.Translation(head) @ (D @ rest_t[n].to_3x3()).to_4x4()
            pose_w[n] = M
            pbt[n].matrix = Wt.inverted() @ M
            bpy.context.view_layer.update()
        for s_ in ('Left', 'Right'):                      # IK chân theo FK
            foot, leg, up = pbt[f'{s_}Foot'], pbt[f'{s_}Leg'], pbt[f'{s_}UpLeg']
            kk = 'L' if s_ == 'Left' else 'R'
            ik = pbt[f'ik_foot.{kk}']; ik.matrix = foot.matrix.copy()
            knee = leg.head; mid = (up.head + foot.head) / 2; d = (knee - mid)
            d = d.normalized() if d.length > 1e-4 else Vector((0, -1, 0))
            pl = pbt[f'pole_knee.{kk}']; pl.matrix = Matrix.Translation(knee + d * 0.45) @ pl.bone.matrix_local.to_3x3().to_4x4()
            bpy.context.view_layer.update()
        for n in names + ['ik_foot.L', 'ik_foot.R', 'pole_knee.L', 'pole_knee.R']:
            pbt[n].keyframe_insert('rotation_quaternion', frame=f)
            if n in ('Hips',) or n.startswith(('ik_', 'pole_')): pbt[n].keyframe_insert('location', frame=f)
    for c in leg_cons: c.mute = False
    for o in new: bpy.data.objects.remove(o, do_unlink=True)
    print(f'  đã chép {len(range(f0, f1 + 1, a.buoc))} khung')
    if a.anh: render(sc, tgt, os.path.abspath(a.anh), f0, f1)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.out), compress=True)
    print('PASS: đã lưu', a.out)


def render(sc, arm, out, f0, f1):
    os.makedirs(out, exist_ok=True)
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 12; sc.render.resolution_x = 320; sc.render.resolution_y = 320
    w = bpy.data.worlds.new('xem'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (.8, .8, .8, 1)
    cd = bpy.data.cameras.new('cam_xem'); cd.type = 'ORTHO'; cd.ortho_scale = 1.6
    cam = bpy.data.objects.new('cam_xem', cd); sc.collection.objects.link(cam); sc.camera = cam
    arm.hide_render = True
    for i in range(6):
        f = int(f0 + (f1 - f0) * i / 5); sc.frame_set(f)
        t = (arm.matrix_world @ arm.pose.bones['Hips'].head) + Vector((0, 0, 0.1))
        cam.location = t + Vector((1.2, -2.6, 0.9)); cam.rotation_euler = (t - cam.location).to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = os.path.join(out, f'f{f:04d}.png'); bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(cam)


main()
