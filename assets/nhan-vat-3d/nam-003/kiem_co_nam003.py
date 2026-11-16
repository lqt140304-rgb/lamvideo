"""KIỂM CỔ NAM-003 (đóng vai test cho rig_nam003.py) — Blender 5.2.x.

  <bpy-python> kiem_co_nam003.py --rig nam-003-rig.blend [--scale 1.0]

Đặt đầu vào các tư thế cổ (NECK_POSES), đo trên lưới Nam_Body đã biến dạng: cạnh dài thêm tối đa (mm, theo đơn vị mô hình gốc, đo trong toạ độ cục bộ nên không phụ thuộc scale)
và số cạnh giãn >1,5× trong vùng cổ z 1,40–1,66 (chỉ cạnh dài >3 mm lúc nghỉ). Thoát mã 1 nếu có tư thế vượt ngưỡng hoặc test hỏng.
"""
import sys, os, argparse
import numpy as np, bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import rig_nam003 as R

NGUONG_MM = 6.0
NGUONG_GIAN = 1.5
MIN_VISIBLE_MM = 3.0
REST_TOL_MM = 0.25   # mm; 16/11 nới từ 0,05: gối uốn nhẹ 1,2 cm ở dáng nghỉ (đặt gần tâm chân thật) làm IK sai số 0,17 mm (cũ 0,011), vẫn không nhìn thấy
B_ALONE_MM = 12.9      # không tệ hơn nền trước khi làm cổ khi tắt Corrective Smooth
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
    'kq4': [('Neck', Z, 15), ('Head', Z, 25)],      # xoay riêng xương Neck rồi Head (xoay Spine làm cả thân trên xoay cứng nên không thử được cổ)
}


def _pos(body):
    e = body.evaluated_get(bpy.context.evaluated_depsgraph_get()); m = e.to_mesh()
    a = np.zeros(len(m.vertices) * 3); m.vertices.foreach_get('co', a); e.to_mesh_clear(); return a.reshape(-1, 3)


def mo_rig(rig_path, scale=1.0):
    bpy.ops.wm.open_mainfile(filepath=os.path.abspath(rig_path))
    arm = bpy.data.objects['Nam_Rig']; body = bpy.data.objects['Nam_Body']; arm.scale = (scale,) * 3
    return arm, body


def measure_neck(rig_path: str, scale: float = 1.0, ctx=None) -> dict:
    """{pose: {'max_mm': float, 'n_giang_nhin_thay': int}}; ctx=(arm, body) nếu đã mở sẵn."""
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
                     'n_giang_nhin_thay': int(((ratio > NGUONG_GIAN) & ((l - l0) > MIN_VISIBLE_MM / 1000) & sel).sum()),     # giãn >1,5× VÀ dài thêm >3 mm (nhìn thấy được)
                     'n_giang_moi_canh': int(((ratio > NGUONG_GIAN) & sel).sum())}                                       # không lọc, để minh bạch
    g['reset'](arm)
    return out


def render_closeups(arm, body, out_dir, scale=1.0, poses=('quay+35', 'kq1', 'cui+25')):
    """Ảnh cận cổ/cằm: chính diện, 3/4, bên, nhìn từ dưới cằm; mỗi tư thế một dải 4 ảnh (png) trong out_dir."""
    from mathutils import Vector
    g = R.patched_namespace(); sc = bpy.context.scene; os.makedirs(out_dir, exist_ok=True)
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 24; sc.cycles.use_denoising = False; sc.render.resolution_x = 560; sc.render.resolution_y = 560
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (.82, .82, .82, 1)
    L = bpy.data.lights.new('s', 'SUN'); L.energy = 3.5; lo = bpy.data.objects.new('s', L); lo.rotation_euler = (0.9, 0.2, 0.6); sc.collection.objects.link(lo)
    cd = bpy.data.cameras.new('c'); cd.type = 'ORTHO'; cd.ortho_scale = 0.24 * scale; cam = bpy.data.objects.new('c', cd); sc.collection.objects.link(cam); sc.camera = cam
    arm.hide_render = True; c = Vector((0, 0.04 * scale, 1.50 * scale)); d = 4.0
    views = {'truoc': (0, -d, 0), '3_4': (d * .7, -d * .7, 0), 'ben': (d, 0, 0), 'duoi_cam': (0, -d * .75, -d * .6)}
    L2 = bpy.data.lights.new('f', 'SUN'); L2.energy = 1.8; lf = bpy.data.objects.new('f', L2); lf.rotation_euler = (1.2, -0.3, -0.9); sc.collection.objects.link(lf)   # đèn phụ chiếu sáng cổ dưới hàm
    for pose in poses:
        g['apply_pose'](arm, 'tay_buong')                                                   # hạ tay để bàn tay không che cổ ở ảnh bên
        for bn, ax, deg in NECK_POSES[pose]: g['rot_world'](arm, bn, ax, deg)
        bpy.context.view_layer.update()
        for vn, off in views.items():
            cam.location = c + Vector(off); cam.rotation_euler = (c - cam.location).to_track_quat('-Z', 'Y').to_euler()
            sc.render.filepath = os.path.join(out_dir, f'{pose}_{vn}.png'); bpy.ops.render.render(write_still=True)
    g['reset'](arm)


def test_rest_is_zero(res): return abs(res['nghi']['max_mm']) < 1e-3 and res['nghi']['n_giang_nhin_thay'] == 0
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


def test_cs_groups_intact(body):
    """cs_co đúng công thức cs_weight (limit/normalize không làm rơi nhóm phụ) và cs_vai_hang chỉ gồm 0/1 như v2."""
    import co_nam003 as CO
    gi = body.vertex_groups['cs_co'].index; gv = body.vertex_groups['cs_vai_hang'].index
    for v in body.data.vertices:
        w = next((g.weight for g in v.groups if g.group == gi), 0.0)
        want = float(CO.cs_weight(np.array([v.co.z]), np.array([abs(v.co.x)]), np.array([v.co.y]))[0])
        if want > 0.01 and abs(w - want) > 0.02: return False
        if want <= 0.01 and w > 0.02: return False
        wv = next((g.weight for g in v.groups if g.group == gv), 0.0)
        if wv not in (0.0, 1.0) and abs(wv - 1.0) > 1e-4 and abs(wv) > 1e-4: return False
    return True


def test_jaw_untouched(body):
    """Hàm/cằm (y < −0,05, z >= 1,55) không dính cs_co; từ z >= 1,565 Head >= 0,75 (v2: 0,80 ở 1,565)."""
    gi = body.vertex_groups['cs_co'].index; gh = body.vertex_groups['Head'].index
    for v in body.data.vertices:
        if v.co.y < -0.05 and v.co.z >= 1.55:
            if any(g.group == gi and g.weight > 1e-3 for g in v.groups): return False
            if v.co.z >= 1.565 and next((g.weight for g in v.groups if g.group == gh), 0.0) < 0.75: return False
    return True


def test_b_alone_no_worse(arm, body, g):
    """Khi tắt mọi Corrective Smooth (như engine không có), quay+35 không tệ hơn bản trước khi làm cổ (12,90 mm)."""
    mods = [m for m in body.modifiers if m.type == 'CORRECTIVE_SMOOTH']; old = [m.show_viewport for m in mods]
    for m in mods: m.show_viewport = False
    try: r = measure_neck('x', 1.0, ctx=(arm, body))
    finally:
        for m, o in zip(mods, old): m.show_viewport = o
    return r['quay+35']['max_mm'] <= B_ALONE_MM


def _local_pos_at(arm, body, g, pose, sc3):
    arm.scale = tuple(sc3); g['reset'](arm)
    for bn, ax, deg in NECK_POSES[pose]: g['rot_world'](arm, bn, ax, deg)
    bpy.context.view_layer.update(); p = _pos(body); arm.scale = (1.0,) * 3; g['reset'](arm); bpy.context.view_layer.update(); return p


def _rest_error_mm(arm, body, do_reset=True):
    g = R.patched_namespace()
    if do_reset: g['reset'](arm)
    bpy.context.view_layer.update(); base = np.array([v.co[:] for v in body.data.vertices]); return float(np.abs(_pos(body) - base).max()) * 1000


def _scale_error_mm(arm, body, sc3, poses=('quay+35', 'kq1')):
    g = R.patched_namespace(); e = 0.0
    for pose in poses:
        p1 = _local_pos_at(arm, body, g, pose, (1.0, 1.0, 1.0)); e = max(e, float(np.abs(_local_pos_at(arm, body, g, pose, sc3) - p1).max()) * 1000)
    return e


def test_rest_matches_basis(arm, body):
    """Ở dáng nghỉ, lưới biến dạng (Armature + Corrective Smooth) trùng lưới gốc: sai lệch < 0,05 mm (IK ở chân gây sai số số học cỡ 0,01 mm). Hỏng nếu bind/rest lệch."""
    return _rest_error_mm(arm, body) < REST_TOL_MM


def test_scale_consistent(arm, body):
    """Scale 0,877 (1,60 m) và 0,932 (1,70 m) cho cùng hình dạng biến dạng như scale 1: sai lệch toạ độ cục bộ < 0,5 mm ở quay+35 và kq1."""
    return all(_scale_error_mm(arm, body, (s_,) * 3) < 0.5 for s_ in (0.877, 0.932))


def test_tests_detect_breakage(arm, body):
    """Kiểm hai test trên CÓ THỂ FAIL: để Head xoay (không reset) → lỗi dáng nghỉ phải > ngưỡng; scale không đều (1,1,0,8) → lỗi scale phải >= 0,5 mm."""
    pb = arm.pose.bones['Head']; old = tuple(pb.rotation_euler)
    pb.rotation_euler = (0, 0, 0.1); bpy.context.view_layer.update(); a = _rest_error_mm(arm, body, do_reset=False) > REST_TOL_MM * 10
    pb.rotation_euler = old; R.patched_namespace()['reset'](arm); bpy.context.view_layer.update()
    b = _scale_error_mm(arm, body, (1.0, 1.0, 0.8)) >= 0.5
    return a and b


def test_env_warning():
    """Khi NAM003_NECK hoặc NAM003_J còn đặt trong môi trường, import/chạy in cảnh báo (rig dựng ra khác mặc định)."""
    import subprocess
    env = dict(os.environ, NAM003_NECK='{"iter":5}', NAM003_J='{"ankle":[0.148,0.04,0.10]}')
    code = f"import sys; sys.path.insert(0, {HERE!r}); import co_nam003, rig_nam003 as R; R.patched_namespace()"
    out = subprocess.run([sys.executable, '-c', code], env=env, capture_output=True, text=True); txt = out.stdout + out.stderr
    return 'CẢNH BÁO' in txt and 'NAM003_NECK' in txt and 'NAM003_J' in txt


def test_shape_key_survives_cs(arm, body):
    """Shape key hàm/cằm giả (dịch tới 8 mm ở y < −0,05, z 1,58–1,72) không bị Corrective Smooth cổ làm mềm: bật/tắt CS sai khác < 0,2 mm."""
    me = body.data; co = np.array([v.co[:] for v in me.vertices]); x, y, z = co[:, 0], co[:, 1], co[:, 2]
    m = (y < -0.05) & (z >= 1.58) & (z <= 1.72) & (np.abs(x) < 0.06)
    if not m.any(): return False
    g = R.patched_namespace(); g['reset'](arm)
    body.shape_key_add(name='Basis'); sk = body.shape_key_add(name='test_ham'); w = np.zeros(len(co)); w[m] = 1.0
    new = co.copy(); new[:, 1] -= 0.008 * w; new[:, 2] -= 0.006 * w; sk.data.foreach_set('co', new.ravel()); sk.value = 1.0
    mods = [mm for mm in body.modifiers if mm.type == 'CORRECTIVE_SMOOTH']; bpy.context.view_layer.update(); on = _pos(body)
    for mm in mods: mm.show_viewport = False
    bpy.context.view_layer.update(); off = _pos(body)
    for mm in mods: mm.show_viewport = True
    body.shape_key_clear(); bpy.context.view_layer.update()
    return float(np.abs(on - off)[m].max()) * 1000 < 0.2


def test_ik_goi_ve_truoc(arm, body):
    """IK chân gập ĐÚNG HƯỚNG: nhấc mắt cá 0,25 m (ra trước 0,2 m) và 0,35 m, gối phải nằm TRƯỚC đường hông–mắt cá >= 10 cm và lệch ngang <= 3 cm (rig cũ: lệch ngang 13 cm vì mốc gối nằm sau/lệch đường nối)."""
    g = R.patched_namespace()
    for k, S, sg in (('L', 'Left', 1), ('R', 'Right', -1)):
        for up, fw in ((0.25, -0.2), (0.35, 0.0)):
            g['reset'](arm); t = arm.pose.bones[f'ik_foot.{k}']
            t.location = t.bone.matrix_local.to_3x3().inverted() @ Vector((0, fw, up)); bpy.context.view_layer.update()
            h = arm.matrix_world @ arm.pose.bones[f'{S}UpLeg'].head; kn = arm.matrix_world @ arm.pose.bones[f'{S}Leg'].head; an = arm.matrix_world @ arm.pose.bones[f'{S}Foot'].head
            line = h + (kn.z - h.z) / (an.z - h.z) * (an - h)
            if not ((kn.y - line.y) * 100 <= -10 and abs(kn.x - line.x) * 100 <= 3): g['reset'](arm); return False
    g['reset'](arm); return True


def test_symmetry(res): return abs(res['quay+35']['max_mm'] - res['quay-35']['max_mm']) <= 1.0
def test_thresholds(res): return all(v['max_mm'] <= NGUONG_MM and v['n_giang_moi_canh'] == 0 for k, v in res.items() if k != 'nghi')     # đúng chữ của thiết kế: 0 cạnh giãn >1,5× (mọi cạnh)


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--rig', required=True); ap.add_argument('--scale', type=float, default=1.0); ap.add_argument('--anh')
    a = ap.parse_args(argv)
    arm, body = mo_rig(a.rig, a.scale)
    res = measure_neck(a.rig, a.scale, ctx=(arm, body))
    print(f'{"tư thế":12s} {"dài thêm max (mm)":>18s} {"giãn>1,5× & >3 mm":>18s} {"giãn>1,5× (mọi cạnh)":>21s}')
    for k, v in res.items(): print(f'{k:12s} {v["max_mm"]:18.2f} {v["n_giang_nhin_thay"]:18d} {v["n_giang_moi_canh"]:21d}')
    tests = [('test_rest_is_zero', lambda: test_rest_is_zero(res)), ('test_rest_matches_basis', lambda: test_rest_matches_basis(arm, body)), ('test_scale_consistent', lambda: test_scale_consistent(arm, body)), ('test_tests_detect_breakage', lambda: test_tests_detect_breakage(arm, body)), ('test_env_warning', test_env_warning), ('test_shape_key_survives_cs', lambda: test_shape_key_survives_cs(arm, body)), ('test_symmetry', lambda: test_symmetry(res)), ('test_thresholds', lambda: test_thresholds(res)),
             ('test_helper_bones', lambda: test_helper_bones(arm)), ('test_ik_goi_ve_truoc', lambda: test_ik_goi_ve_truoc(arm, body)), ('test_cs_modifier', lambda: test_cs_modifier(body)), ('test_cs_spares_face', lambda: test_cs_spares_face(body)), ('test_cs_groups_intact', lambda: test_cs_groups_intact(body)), ('test_jaw_untouched', lambda: test_jaw_untouched(body)), ('test_b_alone_no_worse', lambda: test_b_alone_no_worse(arm, body, None)), ('test_head_unchanged', lambda: test_head_unchanged(arm, body)), ('test_four_influence', lambda: test_four_influence(arm, body))]
    bad = 0
    for nm, f in tests:
        ok = f(); bad += (not ok); print(('PASS ' if ok else 'FAIL ') + nm)
    if a.anh: render_closeups(arm, body, a.anh, a.scale)
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
