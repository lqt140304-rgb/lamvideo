"""Hoạt cảnh camera Blender: Follow Path (Steadicam), Orbit, Vertigo Dolly Zoom, Rack Focus (DoF), Handheld (Noise) + xung va chạm.

Cấu trúc mỗi camera: `rig` (Empty, mang chuyển động chính) → `camera` (con, chỉ có Noise handheld và xung).
Toạ độ trong file này là toạ độ THIẾT KẾ (như CAMERAS); hàm `wp` đổi sang toạ độ thế giới (đảo x).
Chạy:  python camera_dong.py --shot ORBIT_GUONG --frames 1,18,36,54,72 --out /tmp/orbit [--mode day|night]
"""
import bpy, math, sys, os, argparse
from mathutils import Vector, Quaternion, Euler

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import xay_phong_tro as X

FPS = 24


def wp(p):
    return Vector((X.mx(p[0]), p[1], p[2]))


def smooth(t):
    t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)


def _fcurves(ob):
    ad = ob.animation_data
    if not ad or not ad.action: return []
    ac = ad.action
    if hasattr(ac, 'fcurves'):
        try: return list(ac.fcurves)
        except Exception: pass
    out = []
    for layer in ac.layers:
        for strip in layer.strips:
            for cb in strip.channelbags: out += list(cb.fcurves)
    return out


def new_rig(name, lens=35, fstop=None, sensor=36.0):
    sc = bpy.context.scene
    rig = bpy.data.objects.new(name + '_rig', None); rig.empty_display_type = 'ARROWS'; sc.collection.objects.link(rig)
    cd = bpy.data.cameras.new(name); cd.lens = lens; cd.sensor_width = sensor; cd.sensor_fit = 'HORIZONTAL'; cd.clip_start = 0.05; cd.clip_end = 200
    cam = bpy.data.objects.new(name, cd); sc.collection.objects.link(cam); cam.parent = rig
    if fstop:
        cd.dof.use_dof = True; cd.dof.aperture_fstop = fstop
    sc.camera = cam
    return rig, cam


def focus_empty(cam):
    f = bpy.data.objects.new('focus_' + cam.name, None); bpy.context.scene.collection.objects.link(f)
    f.empty_display_type = 'PLAIN_AXES'; f.empty_display_size = 0.1
    cam.data.dof.use_dof = True; cam.data.dof.focus_object = f
    return f


def key_pose(rig, f, pos, tgt, roll_deg=0.0, prev=[None]):
    rig.location = wp(pos)
    q = (wp(tgt) - wp(pos)).to_track_quat('-Z', 'Y') @ Quaternion((0, 0, 1), math.radians(roll_deg))
    e = q.to_euler('XYZ', rig.rotation_euler)
    rig.rotation_euler = e
    rig.keyframe_insert('location', frame=f); rig.keyframe_insert('rotation_euler', frame=f)


def handheld(cam, rot_deg=0.1, loc_m=0.004, period_s=5.0, f0=1, f1=240):
    """Noise Modifier lên location/rotation cục bộ của camera (0,2 Hz, biên 0,05°–0,15° theo chuẩn 3D-0)."""
    cam.location = (0, 0, 0); cam.rotation_euler = (0, 0, 0)
    cam.keyframe_insert('location', frame=f0); cam.keyframe_insert('rotation_euler', frame=f0)
    cam.keyframe_insert('location', frame=f1); cam.keyframe_insert('rotation_euler', frame=f1)
    for i, fc in enumerate(_fcurves(cam)):
        amp = math.radians(rot_deg) if fc.data_path == 'rotation_euler' else loc_m
        for k, (scale, st) in enumerate([(period_s * FPS, amp), (period_s * FPS / 3.2, amp * 0.35)]):
            m = fc.modifiers.new('NOISE'); m.scale = scale; m.strength = st; m.phase = 3.7 * i + 11 * k; m.depth = 1; m.use_restricted_range = False


def impact(cam, frame, rot_deg=1.2, dur=5):
    """Xung va chạm: xoay lệch rồi tắt dần trong ~0,2 s (3D-0)."""
    base = Euler(cam.rotation_euler)
    for i in range(dur + 1):
        d = math.radians(rot_deg) * math.exp(-i * 0.9) * (1 if i % 2 == 0 else -1)
        cam.rotation_euler = (base.x + d, base.y, base.z + d * 0.6)
        cam.keyframe_insert('rotation_euler', frame=frame + i)


def set_range(sc, a, b):
    sc.frame_start, sc.frame_end = a, b


# ------------------------------------------------------------------ các shot
def shot_orbit(sc):
    """P3.04: Dolly Orbit 180° quanh trục (người đứng trước gương), Dutch 12°, 35 mm f/2.0, handheld nhẹ."""
    rig, cam = new_rig('ORBIT_GUONG', 35, 2.0); fo = focus_empty(cam)
    c = (1.2, 2.6, 1.25); r = 1.0; N = 72
    for f in range(1, N + 1):
        t = smooth((f - 1) / (N - 1)); a = math.radians(-90 + 180 * t)
        pos = (c[0] + r * math.cos(a), c[1] + r * math.sin(a), 1.45)
        key_pose(rig, f, pos, c, roll_deg=12 * math.sin(math.pi * t))
        fo.location = wp(c); fo.keyframe_insert('location', frame=f)
    handheld(cam, 0.08, 0.003, f1=N); set_range(sc, 1, N)
    return dict(build=dict(hide_front=False), proxy=True)


def shot_vertigo(sc):
    """P3.03_03: Dolly Zoom 28→85 mm vào mặt gương: giữ kích thước gương, hậu cảnh biến dạng. Cần lùi 3,3 m → máy vượt tường cửa sổ (ẩn khỏi camera)."""
    rig, cam = new_rig('VERTIGO_GUONG', 28, 4.0); fo = focus_empty(cam)
    sub = (0.14, 3.26, 0.75); d0, f0, f1, N = 1.1, 28.0, 85.0, 72
    for f in range(1, N + 1):
        t = smooth((f - 1) / (N - 1)); lens = f0 + (f1 - f0) * t; d = d0 * lens / f0
        key_pose(rig, f, (sub[0] + d, sub[1], 1.0), sub)
        cam.data.lens = lens; cam.data.keyframe_insert('lens', frame=f)
        fo.location = wp(sub); fo.keyframe_insert('location', frame=f)
    handheld(cam, 0.05, 0.002, f1=N); set_range(sc, 1, N)
    return dict(build=dict(hide_front=False), proxy=True, hide_prefix=('tuong_phai', 'op_phai', 'phao_phai'))


def shot_steadicam(sc):
    """C01–C03: Steadicam dẫn đường (Follow Path) từ trong phòng, qua cửa, ra hành lang; mục tiêu đi trước máy (Track To)."""
    rig, cam = new_rig('STEADI_RA_HL', 28, 2.8); fo = focus_empty(cam)
    pts = [(2.0, 3.0, 1.5), (1.1, 2.5, 1.5), (0.1, 2.47, 1.5), (-0.7, 2.7, 1.5), (-0.8, 4.6, 1.5), (-0.8, 7.0, 1.5)]
    tg = [(1.2, 2.47, 1.4), (0.0, 2.47, 1.4), (-0.7, 3.0, 1.4), (-0.8, 5.5, 1.4), (-0.8, 8.0, 1.4), (-0.8, 9.0, 1.4)]
    cu = bpy.data.curves.new('duong_steadi', 'CURVE'); cu.dimensions = '3D'
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(len(pts) - 1)
    for b, p in zip(sp.bezier_points, pts):
        b.co = wp(p); b.handle_left_type = b.handle_right_type = 'AUTO'
    co = bpy.data.objects.new('duong_steadi', cu); sc.collection.objects.link(co)
    fp = rig.constraints.new('FOLLOW_PATH'); fp.target = co; fp.use_fixed_location = True; fp.use_curve_follow = False
    look = bpy.data.objects.new('muc_tieu', None); sc.collection.objects.link(look)
    tt = rig.constraints.new('TRACK_TO'); tt.target = look; tt.track_axis = 'TRACK_NEGATIVE_Z'; tt.up_axis = 'UP_Y'
    N = 96
    cu_t = bpy.data.curves.new('muc_tieu_c', 'CURVE'); cu_t.dimensions = '3D'
    s2 = cu_t.splines.new('BEZIER'); s2.bezier_points.add(len(tg) - 1)
    for b, p in zip(s2.bezier_points, tg):
        b.co = wp(p); b.handle_left_type = b.handle_right_type = 'AUTO'
    ct = bpy.data.objects.new('duong_muc_tieu', cu_t); sc.collection.objects.link(ct)
    lp = look.constraints.new('FOLLOW_PATH'); lp.target = ct; lp.use_fixed_location = True; lp.use_curve_follow = False
    fo.parent = look
    for f in (1, N):
        v = smooth((f - 1) / (N - 1))
        fp.offset_factor = v; lp.offset_factor = v
        fp.keyframe_insert('offset_factor', frame=f); lp.keyframe_insert('offset_factor', frame=f)
    for fc in (_fcurves(rig) + _fcurves(look)):
        for kp in fc.keyframe_points: kp.interpolation = 'BEZIER'
    handheld(cam, 0.03, 0.002, f1=N); set_range(sc, 1, N)
    return dict(build=dict(door_open=85.0, hide_front=False), proxy=False)


def shot_rack(sc):
    """Rack Focus 65 mm f/1.4: lưng ghế (gần, 0,7 m) → màn hình laptop (xa, 1,4 m) trong 1,5 s rồi giữ. Hai vật gần như thẳng hàng trước ống kính."""
    rig, cam = new_rig('RACK_FOCUS_BAN', 65, 1.4); fo = focus_empty(cam)
    pos = (2.15, 1.55, 1.05); tgt = (2.65, 0.62, 0.9)
    A = (2.48, 0.98, 0.9); B = (2.79, 0.33, 0.88); N = 60
    for f in range(1, N + 1):
        t = smooth((f - 14) / 36.0)
        key_pose(rig, f, pos, tgt)
        fo.location = wp((A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t)); fo.keyframe_insert('location', frame=f)
    handheld(cam, 0.06, 0.002, f1=N); set_range(sc, 1, N)
    return dict(build=dict(hide_front=False), proxy=False)


def shot_handheld(sc):
    """Handheld + xung va chạm (3D-0): cận ngang tầm mắt, đầu gối va ghế ở khung 24."""
    rig, cam = new_rig('HANDHELD_A04', 65, 2.0); fo = focus_empty(cam)
    for f in range(1, 49):
        key_pose(rig, f, (1.35, 1.7, 1.5), (0.45, 0.35, 1.5)); fo.location = wp((0.45, 0.35, 1.5)); fo.keyframe_insert('location', frame=f)
    handheld(cam, 0.12, 0.004, f1=48); impact(cam, 24); set_range(sc, 1, 48)
    return dict(build=dict(hide_front=False), proxy=False)


def _nam_truoc_guong(sc, x=0.9, y=3.26):
    coll = bpy.data.collections['Phong_tro_3D']
    nam = X.M.solid('proxy_nam', '#4f7fb0', 0.6)
    return X.figure_proxy('nam_proxy', x, y, nam, coll)


def _liquid(sc, N=72):
    import kinh_nuoc
    g = bpy.data.objects['mat_guong']
    kinh_nuoc.apply(g, wp((0.14, 3.26, 0.7)), N)


def shot_kinh_nuoc(sc):
    """P3.05 (bản camera phía phòng): Nam đứng trước gương, mặt kính hóa nước từ tâm; 50 mm f/2.0, đẩy vào chậm."""
    rig, cam = new_rig('KINH_NUOC', 50, 2.0); fo = focus_empty(cam); N = 72
    _nam_truoc_guong(sc, 1.5, 2.2); _liquid(sc, N)
    for f in range(1, N + 1):
        t = smooth((f - 1) / (N - 1)); key_pose(rig, f, (1.8 - 0.4 * t, 2.6 - 0.2 * t, 1.3), (0.14, 3.3, 0.9))
        fo.location = wp((0.14, 3.26, 0.8)); fo.keyframe_insert('location', frame=f)
    handheld(cam, 0.05, 0.002, f1=N); set_range(sc, 1, N)
    return dict(build=dict(hide_front=False), proxy=False)


SHOTS = {'KINH_NUOC': shot_kinh_nuoc, 'ORBIT_GUONG': shot_orbit, 'VERTIGO_GUONG': shot_vertigo, 'STEADI_RA_HL': shot_steadicam, 'RACK_FOCUS_BAN': shot_rack, 'HANDHELD_A04': shot_handheld}


if __name__ == '__main__':
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--shot', required=True); ap.add_argument('--mode', default='day')
    ap.add_argument('--frames', default='1'); ap.add_argument('--out', default='/tmp/camdong'); ap.add_argument('--samples', type=int, default=32); ap.add_argument('--width', type=int, default=720)
    ap.add_argument('--blend', default='')
    a = ap.parse_args(argv)
    res = (a.width, round(a.width / 2.39))
    # lượt 1: dựng thử để lấy yêu cầu dựng của shot (tham số build, hình nhân, vật ẩn)
    sc0 = X.build(a.mode, cam='WIDE', res=res)
    info = SHOTS[a.shot](sc0)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bp = dict(info.get('build', {})); bp.setdefault('hide_front', False)
    sc = X.build(a.mode, cam='WIDE', res=res, proxy=info.get('proxy', False), **bp)
    for o in list(bpy.data.objects):
        if o.type == 'CAMERA': bpy.data.objects.remove(o)
    info = SHOTS[a.shot](sc)
    for o in bpy.data.objects:
        if any(o.name.startswith(p) for p in info.get('hide_prefix', ())): o.visible_camera = False
    sc.cycles.samples = a.samples
    os.makedirs(a.out, exist_ok=True)
    if a.blend: bpy.ops.wm.save_as_mainfile(filepath=a.blend)
    for f in [int(x) for x in a.frames.split(',') if x]:
        sc.frame_set(f); sc.render.filepath = f'{a.out}/{a.shot}_{f:03d}.png'; bpy.ops.render.render(write_still=True)
