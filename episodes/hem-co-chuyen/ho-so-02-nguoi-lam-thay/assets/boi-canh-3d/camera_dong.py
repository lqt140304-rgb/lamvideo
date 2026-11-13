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
    pos = (2.05, 1.6, 1.0); tgt = (2.62, 0.6, 0.9)
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


def _liquid(sc, N=72, pov=False, tran0=0.0):
    import kinh_nuoc, cong_guong
    g = bpy.data.objects['mat_guong']
    kinh_nuoc.apply(g, wp((0.14, 3.26, 0.7)), N, pov=pov, tran0=tran0)
    fr = bpy.data.objects.get('khung_guong')
    if fr: fr.data.materials.clear(); fr.data.materials.append(kinh_nuoc.nen_nuoc_material())
    return kinh_nuoc, cong_guong.mirror_plane(g)


def _nam_chim(sc, objs, x0, x1, f0, f1, kn, plane, keep_front):
    """Nam đi xuyên mặt kính: x thiết kế x0 → x1 trong khung f0..f1; phần qua mặt phẳng gương trong suốt (cắt bằng shader)."""
    p0, n = plane
    for o in objs:
        for sl in o.material_slots:
            base = sl.material; sl.link = 'OBJECT'; sl.material = kn.plane_cut(base, p0, n, keep_front)
        o.location.x = X.mx(x0); o.keyframe_insert('location', frame=1); o.keyframe_insert('location', frame=f0)
        o.location.x = X.mx(x1); o.keyframe_insert('location', frame=f1); o.keyframe_insert('location', frame=sc.frame_end if sc.frame_end > f1 else f1)
        for fc in _fcurves(o):
            for kp in fc.keyframe_points: kp.interpolation = 'BEZIER'


def shot_kinh_nuoc(sc):
    """P3.05 (camera phía phòng): Nam bước vào mặt kính; kính hóa nước từ điểm chạm, phần thân đã qua kính biến mất; 50 mm f/2.0 đẩy chậm."""
    rig, cam = new_rig('KINH_NUOC', 50, 2.0); fo = focus_empty(cam); N = 72
    objs = _nam_truoc_guong(sc, 0.9, 3.26); kn, plane = _liquid(sc, N)
    sc.frame_end = N; _nam_chim(sc, objs, 0.9, -0.1, 14, 58, kn, plane, True)
    for f in range(1, N + 1):
        t = smooth((f - 1) / (N - 1)); key_pose(rig, f, (2.2 - 0.4 * t, 2.0 - 0.1 * t, 1.25), (0.14, 3.3, 0.9))
        fo.location = wp((0.14, 3.3, 0.8)); fo.keyframe_insert('location', frame=f)
    handheld(cam, 0.05, 0.002, f1=N); set_range(sc, 1, N)
    return dict(build=dict(hide_front=False), proxy=False)


def shot_kinh_nuoc_pov(sc):
    """P3.05 Submersion: camera BÊN TRONG thế giới gương nhìn ra qua mặt kính hóa nước; Nam lọt qua kính về phía camera (thấy phần đã qua)."""
    rig, cam = new_rig('KINH_NUOC_POV', 35, 2.0); fo = focus_empty(cam); N = 72
    objs = _nam_truoc_guong(sc, 0.9, 3.26); kn, plane = _liquid(sc, N, pov=True, tran0=0.9)
    sc.frame_end = N; _nam_chim(sc, objs, 0.9, -0.25, 14, 58, kn, plane, False)
    for f in range(1, N + 1):
        key_pose(rig, f, (-0.9, 3.26, 1.2), (1.2, 3.26, 1.0)); fo.location = wp((0.0, 3.26, 1.0)); fo.keyframe_insert('location', frame=f)
    handheld(cam, 0.05, 0.002, f1=N); set_range(sc, 1, N)
    return dict(build=dict(hide_front=False, guong='pov'), proxy=False, hide_prefix=('khung_guong',))



# ------------------------------------------------------------------ shot khai báo (đẩy/trượt/pan/xoay): p0→p1, t0→t1, lens, roll
def lerp3(a, b, t): return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))


GEN = {
    'ESTABLISH_SAN': dict(doc='Mở: máy từ đầu sân đẩy chậm lên dọc nhà trọ (dây điện, đèn lồng), 20→24 mm', p0=(-3.2, -10.5, 3.6), t0=(-3.0, 12.0, 3.2), p1=(-3.0, -5.5, 3.6), t1=(-3.0, 12.0, 3.0), lens=(20, 24), f=4.0, N=96, build=dict(hide_front=False)),
    'HL_DOLLY': dict(doc='Steadicam thẳng dọc hành lang 24 m (HALL_LONG), 28 mm, handheld nhẹ', p0=(-0.75, 0.3, 1.5), t0=(-0.75, 24.0, 1.4), p1=(-0.75, 9.0, 1.5), t1=(-0.75, 24.0, 1.4), lens=(28, 28), f=2.8, N=96, hh=(0.03, 0.002), build=dict(hide_front=False)),
    'A03_ARC': dict(doc='A03 Dolly Arc 30° sau vai Nam nhìn về bếp, 50 mm f/1.4', arc=dict(c=(1.9, 2.7, 1.25), r=0.8, a0=56, a1=86, z=1.3, look=(0.4, 0.45, 1.2)), lens=(50, 50), f=1.4, N=72, hh=(0.08, 0.003), figure=(1.9, 2.7, 1.2), build=dict(hide_front=False)),
    'PAN_BEP_CUA': dict(doc='P2.03_01 Pan ~90° không cắt: then cửa → bếp, Dutch 8°, 35 mm', p0=(0.95, 1.9, 1.4), t0=(0.0, 2.15, 1.2), p1=(0.95, 1.9, 1.4), t1=(0.4, 0.45, 1.2), lens=(35, 35), f=2.8, N=72, roll=8, hh=(0.06, 0.003), build=dict(hide_front=False)),
    'TOP_XOAY': dict(doc='P2.05 Top-down 90° xoay chậm quanh nệm, 24 mm (trần ẩn)', p0=(1.5, 2.0, 5.4), t0=(1.5, 2.001, 0.0), p1=(1.5, 2.0, 5.4), t1=(1.5, 2.001, 0.0), lens=(24, 24), f=4.0, N=96, spin=180, build=dict(hide_front=False, cutaway=True), hide=('env_mai_t3', 'env_mai_ton', 'env_tuong_t3', 'env_lancan_t3', 'env_tay_vin_t3', 'env_song_t3', 'env_be_', 'env_angten')),
    'SAN_VAP': dict(doc='A05/P2.07 Sàn thấp, xung va chạm ở khung 30, 35 mm', p0=(1.9, 1.7, 0.15), t0=(2.3, 0.85, 0.35), p1=(1.9, 1.7, 0.15), t1=(2.3, 0.85, 0.35), lens=(35, 35), f=2.8, N=60, hh=(0.1, 0.004), impact=30, build=dict(hide_front=False)),
    'TT_GIUONG_PUSH': dict(doc='Toàn thân Nam cạnh nệm, đẩy nhẹ 22 mm', p0=(4.0, 0.6, 1.5), t0=(2.3, 3.0, 0.8), p1=(3.7, 1.0, 1.5), t1=(2.3, 3.0, 0.8), lens=(22, 22), f=4.0, N=72, hh=(0.04, 0.002), figure=(2.3, 3.0), build=dict(hide_front=False), hide_walls=True),
    'TT_BEP_PUSH': dict(doc='Toàn thân Người Kia ở bồn rửa, đẩy nhẹ 22 mm', p0=(2.6, 2.2, 1.5), t0=(0.4, 0.45, 0.8), p1=(2.3, 1.9, 1.5), t1=(0.4, 0.45, 0.8), lens=(22, 22), f=4.0, N=72, hh=(0.04, 0.002), figure=(0.4, 0.45), build=dict(hide_front=False)),
    'TT_CUA_PUSH': dict(doc='Toàn thân người ở ngưỡng cửa, 22 mm', p0=(2.9, 3.7, 1.5), t0=(0.4, 2.5, 0.8), p1=(2.6, 3.4, 1.5), t1=(0.4, 2.5, 0.8), lens=(22, 22), f=4.0, N=72, hh=(0.04, 0.002), figure=(0.4, 2.5), build=dict(hide_front=False)),
    'TOAN_CANH_DEM': dict(doc='Toàn cảnh đêm: đẩy vào sân, đèn lồng + cửa sổ sáng', p0=(-3.2, -10.5, 4.2), t0=(-3.0, 12.0, 3.2), p1=(-3.1, -6.0, 3.8), t1=(-3.0, 12.0, 3.0), lens=(20, 20), f=4.0, N=72, mode='night', build=dict(hide_front=False)),
}


def shot_generic(name):
    g = GEN[name]
    def fn(sc):
        rig, cam = new_rig(name, g['lens'][0], g['f']); fo = focus_empty(cam); N = g['N']
        if g.get('figure'):
            fig = X.figure_proxy('nguoi_chuan', g['figure'][0], g['figure'][1], X.M.solid('nguoi_chuan', '#4f7fb0', 0.6), bpy.data.collections['Phong_tro_3D'], h=g['figure'][2] if len(g['figure']) > 2 else 1.6)
        for f in range(1, N + 1):
            t = smooth((f - 1) / (N - 1))
            if 'arc' in g:
                a = math.radians(g['arc']['a0'] + (g['arc']['a1'] - g['arc']['a0']) * t); c = g['arc']['c']; r = g['arc']['r']
                pos = (c[0] + r * math.cos(a), c[1] + r * math.sin(a), g['arc']['z']); tgt = g['arc'].get('look', c)
            else:
                pos = lerp3(g['p0'], g['p1'], t); tgt = lerp3(g['t0'], g['t1'], t)
            roll = g.get('roll', 0.0) + g.get('spin', 0.0) * t
            key_pose(rig, f, pos, tgt, roll_deg=roll)
            cam.data.lens = g['lens'][0] + (g['lens'][1] - g['lens'][0]) * t; cam.data.keyframe_insert('lens', frame=f)
            fo.location = wp(tgt); fo.keyframe_insert('location', frame=f)
        if g.get('hide_walls'): X.an_tuong_theo_camera(bpy.data.collections['Phong_tro_3D'], g['p0'])
        hh = g.get('hh', (0.0, 0.0))
        if hh[0] > 0: handheld(cam, hh[0], hh[1], f1=N)
        if g.get('impact'): impact(cam, g['impact'])
        set_range(sc, 1, N)
        return dict(build=g.get('build', {}), proxy=False, mode=g.get('mode'), hide_prefix=g.get('hide', ()))
    return fn


for _n in GEN: pass

def shot_doi_gio(sc):
    """Chuyển giờ mượt: sáng sớm → trưa → chiều tà → tối (đèn bàn bật, laptop sáng), camera DESK đứng yên + handheld nhẹ."""
    import chuyen_gio
    rig, cam = new_rig('DOI_GIO', 32, 2.8); fo = focus_empty(cam); N = 96
    pos, tgt, f = X.CAMERAS['DESK']
    for fr in range(1, N + 1):
        key_pose(rig, fr, pos, tgt); fo.location = wp((2.6, 0.35, 0.9)); fo.keyframe_insert('location', frame=fr)
    chuyen_gio.ap_dung(X, sc, N)
    handheld(cam, 0.04, 0.002, f1=N); set_range(sc, 1, N)
    return dict(build=dict(hide_front=False, den_ban=True), proxy=False, mode='dawn')


def shot_mua_goc_do(sc):
    """S07: góc đồ cho tặng chiều muộn sau mưa; mưa rơi, nước chảy từ mép sàn, vũng gợn; đẩy chậm vào gương cũ."""
    rig, cam = new_rig('MUA_GOC_DO', 26, 2.8); fo = focus_empty(cam); N = 72
    for fr in range(1, N + 1):
        t = smooth((fr - 1) / (N - 1)); key_pose(rig, fr, lerp3((-3.0, -10.5, -1.6), (-2.4, -8.4, -1.7), t), lerp3((-0.5, -6.6, -2.2), (-0.2, -7.0, -1.9), t))
        fo.location = wp((-0.3, -7.0, -2.0)); fo.keyframe_insert('location', frame=fr)
    handheld(cam, 0.05, 0.002, f1=N); set_range(sc, 1, N)
    return dict(build=dict(hide_front=False, goc_do=True), proxy=False, mode='rain')


SHOTS = {'DOI_GIO': shot_doi_gio, 'MUA_GOC_DO': shot_mua_goc_do, 'KINH_NUOC': shot_kinh_nuoc, 'KINH_NUOC_POV': shot_kinh_nuoc_pov, 'ORBIT_GUONG': shot_orbit, 'VERTIGO_GUONG': shot_vertigo, 'STEADI_RA_HL': shot_steadicam, 'RACK_FOCUS_BAN': shot_rack, 'HANDHELD_A04': shot_handheld}
for _n in GEN: SHOTS[_n] = shot_generic(_n)


if __name__ == '__main__':
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--shot', required=True); ap.add_argument('--mode', default='day')
    ap.add_argument('--frames', default='1'); ap.add_argument('--out', default='/tmp/camdong'); ap.add_argument('--samples', type=int, default=32); ap.add_argument('--width', type=int, default=720)
    ap.add_argument('--blend', default=''); ap.add_argument('--all', action='store_true'); ap.add_argument('--step', type=int, default=1)
    a = ap.parse_args(argv)
    res = (a.width, round(a.width / 2.39))
    # lượt 1: dựng thử để lấy yêu cầu dựng của shot (tham số build, hình nhân, vật ẩn)
    sc0 = X.build(a.mode, cam='WIDE', res=res)
    info = SHOTS[a.shot](sc0)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bp = dict(info.get('build', {})); bp.setdefault('hide_front', False)
    mode = info.get('mode') or a.mode
    sc = X.build(mode, cam='WIDE', res=res, proxy=info.get('proxy', False), **bp)
    for o in list(bpy.data.objects):
        if o.type == 'CAMERA': bpy.data.objects.remove(o)
    info = SHOTS[a.shot](sc)
    for o in bpy.data.objects:
        if any(o.name.startswith(p) for p in info.get('hide_prefix', ())): o.visible_camera = False
    sc.cycles.samples = a.samples
    sc.render.use_persistent_data = True  # giữ BVH/dữ liệu giữa các khung (cảnh tĩnh, chỉ camera/vật liệu keyframe đổi): ≈ −20% thời gian/khung
    os.makedirs(a.out, exist_ok=True)
    if a.blend: bpy.ops.wm.save_as_mainfile(filepath=a.blend)
    frs = list(range(sc.frame_start, sc.frame_end + 1, a.step)) if a.all else [int(x) for x in a.frames.split(',') if x]
    for f in frs:
        sc.frame_set(f); sc.render.filepath = f'{a.out}/{a.shot}_{f:03d}.png'; bpy.ops.render.render(write_still=True)


# ------------------------------------------------------------------ chuỗi shot cuối (dùng cho video): (shot, số khung 24 fps)
SEQUENCE = [('ESTABLISH_SAN', 96), ('TOAN_CANH_DEM', 72), ('HL_DOLLY', 96), ('STEADI_RA_HL', 96), ('TT_CUA_PUSH', 72), ('A03_ARC', 72), ('PAN_BEP_CUA', 72),
            ('TT_BEP_PUSH', 72), ('RACK_FOCUS_BAN', 60), ('HANDHELD_A04', 48), ('SAN_VAP', 60), ('TT_GIUONG_PUSH', 72), ('TOP_XOAY', 96), ('ORBIT_GUONG', 72),
            ('VERTIGO_GUONG', 72), ('KINH_NUOC', 72), ('KINH_NUOC_POV', 72)]
