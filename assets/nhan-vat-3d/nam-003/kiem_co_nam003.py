"""KIỂM CỔ NAM-003 (đóng vai test cho rig_nam003.py) — Blender 5.2.x.

  <bpy-python> kiem_co_nam003.py --rig nam-003-rig.blend [--scale 1.0]

Đặt đầu vào các tư thế cổ (NECK_POSES), đo trên lưới Nam_Body đã biến dạng: cạnh dài thêm tối đa (mm, theo đơn vị mô hình gốc, đo trong toạ độ cục bộ nên không phụ thuộc scale)
và số cạnh giãn >1,5× trong vùng cổ z 1,40–1,66 (chỉ cạnh dài >3 mm lúc nghỉ). Thoát mã 1 nếu có tư thế vượt ngưỡng hoặc test hỏng.
"""
import sys, os, argparse
import numpy as np, bpy

HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import rig_nam003 as R

NGUONG_MM = 6.0
NGUONG_GIAN = 1.5
MIN_VISIBLE_MM = 3.0
Z_LO, Z_HI = 1.40, 1.66
X, Y, Z = (1, 0, 0), (0, 1, 0), (0, 0, 1)
# (xương, trục thế giới, độ). Head quanh Z = quay; quanh X = cúi (+) / ngửa (−) vì mặt hướng −Y; quanh Y = nghiêng.
NECK_POSES = {
    'nghi': [],
    'quay+35': [('Head', Z, 35)], 'quay-35': [('Head', Z, -35)],
    'cui+25': [('Head', X, 25)], 'ngua-25': [('Head', X, -25)],
    'nghieng+20': [('Head', Y, 20)], 'nghieng-20': [('Head', Y, -20)],
    'kq1': [('Head', Z, 35), ('Head', X, 15)],
    'kq2': [('Head', Z, -35), ('Head', X, -15)],
    'kq3': [('Head', Y, 20), ('Head', Z, 25)],
    'kq4': [('Spine', Z, 30), ('Head', Z, 25)],
}


def _pos(body):
    e = body.evaluated_get(bpy.context.evaluated_depsgraph_get()); m = e.to_mesh()
    a = np.zeros(len(m.vertices) * 3); m.vertices.foreach_get('co', a); e.to_mesh_clear(); return a.reshape(-1, 3)


def mo_rig(rig_path, scale=1.0):
    bpy.ops.wm.open_mainfile(filepath=os.path.abspath(rig_path))
    arm = bpy.data.objects['Nam_Rig']; body = bpy.data.objects['Nam_Body']; arm.scale = (scale,) * 3
    return arm, body


def measure_neck(rig_path: str, scale: float = 1.0, ctx=None) -> dict:
    """{pose: {'max_mm': float, 'n_over_1_5': int}}; ctx=(arm, body) nếu đã mở sẵn."""
    g = R.patched_namespace()
    arm, body = mo_rig(rig_path, scale) if ctx is None else ctx
    me = body.data; ea, eb = g['edges_np'](me)
    g['reset'](arm); bpy.context.view_layer.update(); p0 = _pos(body)
    l0 = np.linalg.norm(p0[ea] - p0[eb], axis=1); zm = (p0[ea][:, 2] + p0[eb][:, 2]) / 2
    sel = (l0 > 0.003) & (zm > Z_LO) & (zm < Z_HI)
    out = {}
    for name, ops in NECK_POSES.items():
        g['reset'](arm)
        for bn, ax, deg in ops: g['rot_world'](arm, bn, ax, deg)
        p = _pos(body); l = np.linalg.norm(p[ea] - p[eb], axis=1)
        ratio = l / np.maximum(l0, 1e-6)
        out[name] = {'max_mm': float(((l - l0)[sel]).max() * 1000),
                     'n_over_1_5': int(((ratio > NGUONG_GIAN) & ((l - l0) > MIN_VISIBLE_MM / 1000) & sel).sum()),     # giãn >1,5× VÀ dài thêm >3 mm (nhìn thấy được)
                     'n_over_1_5_all': int(((ratio > NGUONG_GIAN) & sel).sum())}                                       # không lọc, để minh bạch
    g['reset'](arm)
    return out


def render_closeups(arm, body, out_dir, scale=1.0, poses=('quay+35', 'kq1', 'cui+25')):
    """Ảnh cận cổ/cằm: chính diện, 3/4, bên, nhìn từ dưới cằm; mỗi tư thế một dải 4 ảnh (png) trong out_dir."""
    from mathutils import Vector
    g = R.patched_namespace(); sc = bpy.context.scene; os.makedirs(out_dir, exist_ok=True)
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 24; sc.cycles.use_denoising = False; sc.render.resolution_x = 560; sc.render.resolution_y = 560
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (.82, .82, .82, 1)
    L = bpy.data.lights.new('s', 'SUN'); L.energy = 3.5; lo = bpy.data.objects.new('s', L); lo.rotation_euler = (0.9, 0.2, 0.6); sc.collection.objects.link(lo)
    cd = bpy.data.cameras.new('c'); cd.type = 'ORTHO'; cd.ortho_scale = 0.30 * scale; cam = bpy.data.objects.new('c', cd); sc.collection.objects.link(cam); sc.camera = cam
    arm.hide_render = True; c = Vector((0, 0.04 * scale, 1.52 * scale)); d = 4.0
    views = {'truoc': (0, -d, 0), '3_4': (d * .7, -d * .7, 0), 'ben': (d, 0, 0), 'duoi_cam': (0, -d * .75, -d * .6)}
    for pose in poses:
        g['reset'](arm)
        for bn, ax, deg in NECK_POSES[pose]: g['rot_world'](arm, bn, ax, deg)
        bpy.context.view_layer.update()
        for vn, off in views.items():
            cam.location = c + Vector(off); cam.rotation_euler = (c - cam.location).to_track_quat('-Z', 'Y').to_euler()
            sc.render.filepath = os.path.join(out_dir, f'{pose}_{vn}.png'); bpy.ops.render.render(write_still=True)
    g['reset'](arm)


def test_rest_is_zero(res): return abs(res['nghi']['max_mm']) < 1e-3 and res['nghi']['n_over_1_5'] == 0
def test_helper_bones(arm):
    """Có NeckBlend1/2, deform, Copy Rotation từ Head với ảnh hưởng NECK_INFLUENCE (0,33; 0,66)."""
    for nm, inf in (('NeckBlend1', 0.33), ('NeckBlend2', 0.66)):
        b = arm.data.bones.get(nm)
        if b is None or not b.use_deform: return False
        cs = [c for c in arm.pose.bones[nm].constraints if c.type == 'COPY_ROTATION' and c.subtarget == 'Head']
        if len(cs) != 1 or abs(cs[0].influence - inf) > 1e-6: return False
    return True


def test_head_unchanged(arm, body):
    """Xương Head và trọng số đầu (z >= 1,60) không đổi: bên làm mặt gắn 100 % Head."""
    h = arm.data.bones['Head']
    if (np.array(h.head_local) - (0, 0.04, 1.58)).__abs__().max() > 1e-4 or (np.array(h.tail_local) - (0, 0.02, 1.824)).__abs__().max() > 1e-4: return False
    gi = body.vertex_groups['Head'].index
    for v in body.data.vertices:
        if v.co.z >= 1.60:
            w = sum(g.weight for g in v.groups if g.group == gi)
            if w < 0.999: return False
    return True


def test_four_influence(arm, body):
    """Mỗi đỉnh tối đa 4 nhóm xương (không tính nhóm phụ như cs_*), tổng trọng số xương = 1 ± 0,02."""
    bones = set(arm.data.bones.keys()); names = {g.index: g.name for g in body.vertex_groups}
    for v in body.data.vertices:
        ws = [g.weight for g in v.groups if names[g.group] in bones and g.weight > 1e-4]
        if len(ws) > 4 or abs(sum(ws) - 1.0) > 0.02: return False
    return True


def test_cs_modifier(body):
    """Có nhóm cs_co và modifier CorrectiveSmoothCo (sau Armature); nhóm cs_vai_hang và modifier CorrectiveSmooth cũ còn nguyên."""
    mods = [m.name for m in body.modifiers]
    if 'CorrectiveSmoothCo' not in mods or 'CorrectiveSmooth' not in mods: return False
    if mods.index('CorrectiveSmoothCo') < mods.index('Armature'): return False
    return 'cs_co' in body.vertex_groups and 'cs_vai_hang' in body.vertex_groups and body.modifiers['CorrectiveSmoothCo'].vertex_group == 'cs_co'


def test_cs_spares_face(body):
    """Corrective Smooth cổ không chạm vùng mặt: đỉnh z >= 1,61 phải có trọng số cs_co = 0 (bên làm mặt có shape key miệng/cằm ở đó)."""
    gi = body.vertex_groups['cs_co'].index
    for v in body.data.vertices:
        if v.co.z >= 1.61 and any(g.group == gi and g.weight > 1e-6 for g in v.groups): return False
    return True


def test_symmetry(res): return abs(res['quay+35']['max_mm'] - res['quay-35']['max_mm']) <= 1.0
def test_thresholds(res): return all(v['max_mm'] <= NGUONG_MM and v['n_over_1_5'] == 0 for k, v in res.items() if k != 'nghi')


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--rig', required=True); ap.add_argument('--scale', type=float, default=1.0); ap.add_argument('--anh')
    a = ap.parse_args(argv)
    arm, body = mo_rig(a.rig, a.scale)
    res = measure_neck(a.rig, a.scale, ctx=(arm, body))
    print(f'{"tư thế":12s} {"dài thêm max (mm)":>18s} {"giãn>1,5× & >3 mm":>18s} {"giãn>1,5× (mọi cạnh)":>21s}')
    for k, v in res.items(): print(f'{k:12s} {v["max_mm"]:18.2f} {v["n_over_1_5"]:18d} {v["n_over_1_5_all"]:21d}')
    tests = [('test_rest_is_zero', lambda: test_rest_is_zero(res)), ('test_symmetry', lambda: test_symmetry(res)), ('test_thresholds', lambda: test_thresholds(res)),
             ('test_helper_bones', lambda: test_helper_bones(arm)), ('test_cs_modifier', lambda: test_cs_modifier(body)), ('test_cs_spares_face', lambda: test_cs_spares_face(body)), ('test_head_unchanged', lambda: test_head_unchanged(arm, body)), ('test_four_influence', lambda: test_four_influence(arm, body))]
    bad = 0
    for nm, f in tests:
        ok = f(); bad += (not ok); print(('PASS ' if ok else 'FAIL ') + nm)
    if a.anh: render_closeups(arm, body, a.anh, a.scale)
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
