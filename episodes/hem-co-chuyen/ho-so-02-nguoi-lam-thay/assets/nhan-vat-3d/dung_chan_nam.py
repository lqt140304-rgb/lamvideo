"""Bàn chân riêng của Nam (cách B trong THIET-KE-TAY-CHAN.md): dựng, rig thử, kiểm tư thế đứng / nhấc gót, render bảng.

Toạ độ thế giới của Nam, chân TRÁI = +X: đế chân z = 0, mũi chân hướng -Y, gót ở +Y; tâm vòng mắt cá của cage ≈ (0.0925, 0.002, 0.129), bán kính ≈ 65 mm.
Chân phải = lật gương X.

Chạy:  bpyv/bin/python dung_chan_nam.py --blend OUT.blend --render DIR --samples 24 --check
"""
import sys, os, math, argparse, itertools
import bpy, bmesh
import numpy as np
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dung_tay_nam as H            # dùng lại: _verts, _region, _bvh_sub, _loft, _cam, setup_render, skin_material, check_mirror

FOOT_POSES = ('dung', 'nhac_got')
ANKLE = Vector((0.0925, 0.003, 0.129))         # tâm mắt cá (khớp vòng mat_ca của cage)
ANKLE_R = 0.065                                # bán kính ống chân tại mắt cá


# ---------------------------------------------------------------- hình dáng
X0 = 0.100                                     # trục dọc bàn chân (hơi lệch ra ngoài so với mắt cá 0.0925, như chân Nam)
#        y       nửa ngang   đỉnh z   (khối nêm: gót nhỏ cao dần lên mắt cá, mũi rộng thấp)
#   Quét các elip nhỏ dọc chiều dài chân theo đường cong kích thước mượt (gót nhỏ → mu cao → mũi rộng, thấp), hợp bằng voxel remesh rồi làm mượt Taubin.
#   Không dùng mặt cắt vuông: mỗi lát là elip → gót, mu, mũi chân đều tròn; đáy cắt phẳng ở sàn z=0.
#   y: từ gót (+Y) tới đầu mũi bàn chân (−Y); top = chiều cao đỉnh mu chân so với sàn; hw = nửa bề ngang
PROFILE_Y = [0.087, 0.077, 0.063, 0.044, 0.022, 0.000, -0.022, -0.045, -0.065, -0.080, -0.090]      # (cộng bán trục y của elip đầu/cuối → gót sau ~0,117, mũi bàn chân ~−0,120)
PROFILE_TOP = [0.044, 0.072, 0.097, 0.110, 0.114, 0.105, 0.092, 0.080, 0.069, 0.059, 0.050]       # gót thấp, bo; mu chân giảm ~6%
PROFILE_HW = [0.033, 0.046, 0.056, 0.062, 0.066, 0.068, 0.072, 0.077, 0.080, 0.078, 0.072]            # gót tròn (không vuông, không nhọn)
NECK = [dict(c=(ANKLE.x, ANKLE.y + 0.004, 0.138), r=(0.050, 0.054, 0.050)), dict(c=(ANKLE.x, ANKLE.y, 0.176), r=(0.047, 0.050, 0.040))]   # cổ chân: tiếp mu chân, thon dần vào ống chân
#          x lệch   y     bán kính   (ngón cái → ngón út; ngón cái ở PHÍA TRONG = phía thân; ngón như nụ tròn, mập, ngắn dần)
TOES = [(-0.053, -0.129, 0.0262), (-0.021, -0.122, 0.0200), (0.006, -0.118, 0.0180), (0.031, -0.114, 0.0160), (0.053, -0.110, 0.0142)]   # dàn rộng hơn để ngón không dính nhau
BALL_Y = -0.105
BALL = Vector((X0, BALL_Y, 0.040))
SWEEP_STEP = 0.003
SWEEP_RY = 0.030


def _smooth_curve(arr, n=3):
    a = np.array(arr, dtype=float)
    for _ in range(n): a[1:-1] = 0.25 * a[:-2] + 0.5 * a[1:-1] + 0.25 * a[2:]
    return a


def _ellipsoid(bm, c, r):
    res = bmesh.ops.create_uvsphere(bm, u_segments=28, v_segments=18, radius=1.0)
    for v in res['verts']: v.co = Vector((c[0] + r[0] * v.co.x, c[1] + r[1] * v.co.y, c[2] + r[2] * v.co.z))


def _taubin(bm, verts, n, lam=0.5, mu=-0.53):
    for _ in range(n):
        bmesh.ops.smooth_vert(bm, verts=verts, factor=lam, use_axis_x=True, use_axis_y=True, use_axis_z=True)
        bmesh.ops.smooth_vert(bm, verts=verts, factor=mu, use_axis_x=True, use_axis_y=True, use_axis_z=True)


def _carve_toe_grooves(bm, depth=0.0030, sigma=0.0050):
    """Khắc rãnh giữa các ngón (dịch đỉnh vào trong theo pháp tuyến, Gauss nông): ngón tách nhau rõ nhưng vẫn mềm."""
    bm.normal_update(); n_hit = 0
    for i in range(len(TOES) - 1):
        (d0, _, r0), (d1, _, r1) = TOES[i], TOES[i + 1]; xg = X0 + d0 + (d1 - d0) * r0 / (r0 + r1)
        for v in bm.verts:
            if v.co.z < 0.006 or v.co.y > BALL_Y - 0.004: continue
            ramp = min(1.0, max(0.0, (-0.106 - v.co.y) / 0.014))
            d = depth * ramp * math.exp(-((v.co.x - xg) / sigma) ** 2)
            if d > 1e-6: v.co -= v.normal * d; n_hit += 1
    return n_hit


def build_shape(side='L', voxel=0.0015):
    me = bpy.data.meshes.new(f'Chan_Nam.{side}'); ob = bpy.data.objects.new(f'Chan_Nam.{side}', me); bpy.context.scene.collection.objects.link(ob)
    bm = bmesh.new()
    ys = np.arange(PROFILE_Y[0], PROFILE_Y[-1] - 1e-9, -SWEEP_STEP); py = np.array(PROFILE_Y)[::-1]
    top = np.interp(ys, py, np.array(PROFILE_TOP)[::-1]); hw = np.interp(ys, py, np.array(PROFILE_HW)[::-1])
    top, hw = _smooth_curve(top, 4), _smooth_curve(hw, 4)
    for y, t, w in zip(ys, top, hw):                                      # mỗi elip: đáy chìm 4 mm dưới sàn để cắt phẳng
        _ellipsoid(bm, (X0, y, (t - 0.0025) / 2), (w, SWEEP_RY, (t + 0.0025) / 2))
    for b in NECK: _ellipsoid(bm, b['c'], b['r'])
    for dx, y, r in TOES: _ellipsoid(bm, (X0 + dx, y, r - 0.002), (r * 0.92, r * 1.45, r))        # ngón: elip dài theo y, hơi thon bề ngang, nằm trên sàn
    bm.to_mesh(me); bm.free()
    md = ob.modifiers.new('rm', 'REMESH'); md.mode = 'VOXEL'; md.voxel_size = voxel; md.use_smooth_shade = True
    bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.object.modifier_apply(modifier='rm')
    bm = bmesh.new(); bm.from_mesh(me)
    for v in bm.verts: v.co.z = max(0.0, v.co.z)                          # cắt phẳng đế tại sàn
    body = [v for v in bm.verts if v.co.y > BALL_Y - 0.004]; toes = [v for v in bm.verts if v.co.y <= BALL_Y - 0.004]
    _taubin(bm, body, 40); _taubin(bm, toes, 3)                           # thân mượt mạnh, ngón nhẹ để giữ hình
    _carve_toe_grooves(bm)
    toes = [v for v in bm.verts if v.co.y <= BALL_Y - 0.004]; _taubin(bm, toes, 22)      # làm mượt lại sau khi khắc rãnh: bỏ gợn gai do pháp tuyến lưới không đều
    for v in bm.verts:
        if v.co.z < 0.0035: v.co.z = 0.0                                  # đế phẳng sau khi mượt (mép đế vẫn bo)
    bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = True
    return ob


def mirror_shape(obL, side='R'):
    me = obL.data.copy(); me.name = f'Chan_Nam.{side}'
    for v in me.vertices: v.co.x = -v.co.x
    me.flip_normals(); ob = bpy.data.objects.new(f'Chan_Nam.{side}', me); bpy.context.scene.collection.objects.link(ob); return ob


# ---------------------------------------------------------------- rig thử
def build_rig(side='L'):
    sx = 1.0 if side == 'L' else -1.0; V = lambda x, y, z: Vector((sx * x, y, z))
    ad = bpy.data.armatures.new(f'Rig_Chan.{side}'); arm = bpy.data.objects.new(f'Rig_Chan.{side}', ad); bpy.context.scene.collection.objects.link(arm)
    bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode='EDIT'); eb = ad.edit_bones
    def B(name, parent, h, t):
        b = eb.new(f'{name}.{side}'); b.head, b.tail = h, t
        if parent: b.parent = eb[f'{parent}.{side}']
        return b
    B('shin', None, V(ANKLE.x, ANKLE.y, 0.30), V(ANKLE.x, ANKLE.y, ANKLE.z))
    B('foot', 'shin', V(ANKLE.x, ANKLE.y, ANKLE.z), V(X0, BALL_Y, BALL.z))
    B('toe', 'foot', V(X0, BALL_Y, BALL.z), V(X0, -0.185, 0.032))
    bpy.ops.object.mode_set(mode='OBJECT')
    for pb in arm.pose.bones: pb.rotation_mode = 'XYZ'
    return arm


def _ss(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)


def skin(ob, arm, side='L'):
    """Trọng số theo vị trí: ngón (trước đường gập ±16 mm) → toe; phần cổ chân phía trên → shin; còn lại → foot. Chuyển mềm."""
    me = ob.data; P = np.array([tuple(v.co) for v in me.vertices]); y, z = P[:, 1], P[:, 2]
    w_toe = _ss(BALL_Y + 0.016, BALL_Y - 0.016, y); w_shin = _ss(0.125, 0.185, z); w_foot = np.clip(1 - w_toe - w_shin, 0, 1)
    tot = w_toe + w_shin + w_foot; names = {'toe': w_toe, 'shin': w_shin, 'foot': w_foot}
    for nm, w in names.items():
        g = ob.vertex_groups.new(name=f'{nm}.{side}')
        for vi in np.nonzero(w / tot > 0.002)[0].tolist(): g.add([vi], float(w[vi] / tot[vi]), 'REPLACE')
    m = ob.modifiers.new('Armature', 'ARMATURE'); m.object = arm
    cs = ob.modifiers.new('CS', 'CORRECTIVE_SMOOTH'); cs.iterations = 30; cs.factor = 0.6; cs.rest_source = 'ORCO'; cs.smooth_type = 'LENGTH_WEIGHTED'


def _rot_about(pt, ang):
    """Quay quanh trục X thế giới qua điểm pt."""
    return Matrix.Translation(pt) @ Matrix.Rotation(ang, 4, 'X') @ Matrix.Translation(-pt)


NHAC_GOT_DEG = 18.0     # mũi chân hạ (gập gan chân); ngón gập ngược lại để vẫn phẳng sàn


def apply_foot_pose(arm, name):
    """dung: nghỉ. nhac_got: gót nhấc, đường gập ngón ở nguyên chỗ trên sàn, ngón vẫn phẳng sàn (kiểu kiễng chân)."""
    side = arm.name.split('.')[-1]; sx = 1.0 if side == 'L' else -1.0; pb = arm.pose.bones
    for b in pb: b.matrix_basis = Matrix.Identity(4)
    bpy.context.view_layer.update()
    if name != 'nhac_got': return
    # Quay bàn chân quanh đường gập ngón (BALL) để gót nhấc: dùng chính xương foot quay quanh khớp mắt cá rồi dời cả cụm shin để BALL về chỗ cũ.
    ang = math.radians(NHAC_GOT_DEG); ank = Vector((sx * ANKLE.x, ANKLE.y, ANKLE.z)); ball = Vector((sx * X0, BALL_Y, BALL.z))
    R = _rot_about(ank, ang); new_ball = R @ ball; shift = ball - new_ball
    arm.matrix_world = Matrix.Identity(4)
    pb[f'shin.{side}'].matrix = Matrix.Translation(shift) @ arm.data.bones[f'shin.{side}'].matrix_local; bpy.context.view_layer.update()
    pb[f'foot.{side}'].matrix = Matrix.Translation(shift) @ R @ arm.data.bones[f'foot.{side}'].matrix_local; bpy.context.view_layer.update()
    Rt = _rot_about(ball, -ang)                    # ngón quay ngược quanh BALL: song song sàn như lúc nghỉ
    pb[f'toe.{side}'].matrix = Rt @ Matrix.Translation(shift) @ R @ arm.data.bones[f'toe.{side}'].matrix_local; bpy.context.view_layer.update()


def build_foot(side='L', shapeL=None):
    ob = build_shape(side) if side == 'L' else mirror_shape(shapeL, side)
    arm = build_rig(side); skin(ob, arm, side); return ob, arm


# ---------------------------------------------------------------- kiểm tra
def _down_area_on_floor(P, ob, tol):
    arr = H._polys(ob); tri = [(arr[:, 0], arr[:, 1], arr[:, 2])]; a, b, c = P[arr[:, 0]], P[arr[:, 1]], P[arr[:, 2]]
    n = np.cross(b - a, c - a); area = np.linalg.norm(n, axis=1) / 2; nz = n[:, 2] / np.linalg.norm(n, axis=1).clip(1e-12)
    down = nz < -0.8; on = down & (np.maximum(np.maximum(a[:, 2], b[:, 2]), c[:, 2]) < tol)
    return float(area[on].sum()), float(area[down].sum())


def check_foot(ob, arm):
    """Trả dict tên-kiểm → (đạt?, chi tiết). In PASS/FAIL từng mục."""
    res = {}
    def rec(k, ok, msg): res[k] = (bool(ok), msg); print(f'    {"PASS" if ok else "FAIL"}  {k}: {msg}')
    sfx = ob.name.split('.')[-1]; bones = arm.data.bones
    miss = [b for b in ('shin', 'foot', 'toe') if f'{b}.{sfx}' not in bones]
    rec('xuong', not miss, 'đủ xương shin/foot/toe' if not miss else f'thiếu {miss}')
    if miss: return res
    apply_foot_pose(arm, 'dung'); P0 = H._verts(ob)
    # (a) giãn cạnh
    ed = np.array([e.vertices[:] for e in ob.data.edges]); l0 = np.linalg.norm(P0[ed[:, 0]] - P0[ed[:, 1]], axis=1); ok_e = l0 > 0.5 * np.median(l0)
    worst = {}
    for p in FOOT_POSES:
        apply_foot_pose(arm, p); P = H._verts(ob); st = np.where(ok_e, np.linalg.norm(P[ed[:, 0]] - P[ed[:, 1]], axis=1) / l0.clip(1e-9), 0)
        worst[p] = (int((st > 2.0).sum()), float(st.max()))
    rec('gian_canh', all(n == 0 for n, _ in worst.values()), ', '.join(f'{p} {n} cạnh/max {m:.2f}×' for p, (n, m) in worst.items()))
    # (b) đứng: đế phẳng
    apply_foot_pose(arm, 'dung'); P = H._verts(ob); on, down = _down_area_on_floor(P, ob, 0.004)
    rec('dung_de_phang', abs(P[:, 2].min()) <= 0.001 and down > 0 and on / down >= 0.6, f'đáy thấp nhất z={P[:, 2].min() * 1000:.1f} mm, diện tích đế chạm sàn {on / max(down, 1e-9) * 100:.0f}% (≥60%)')
    # (c) kích thước
    L_ = P[:, 1].max() - P[:, 1].min(); ball = P[(P[:, 1] > -0.115) & (P[:, 1] < -0.095)]; W_ = ball[:, 0].max() - ball[:, 0].min() if len(ball) else 0
    rec('kich_thuoc', 0.24 <= L_ <= 0.285 and 0.14 <= W_ <= 0.19, f'dài {L_ * 1000:.0f} mm (240–285), rộng ở mũi {W_ * 1000:.0f} mm (140–190)')
    # (d) cổ chân nằm trong ống chân
    top = P[P[:, 2] > ANKLE.z + 0.012]; rad = np.linalg.norm(top[:, :2] - np.array([ANKLE.x, ANKLE.y]), axis=1).max() if len(top) else 9
    rec('co_chan_trong_ong', len(top) > 0 and top[:, 2].max() >= ANKLE.z + 0.03 and rad <= ANKLE_R - 0.003, f'đoạn cổ cao tới z={P[:, 2].max() * 1000:.0f} mm (≥159), bán kính lớn nhất {rad * 1000:.0f} mm (≤{(ANKLE_R - 0.003) * 1000:.0f})')
    # (e) ngón cái ở phía trong và dài nhất
    cx = P[:, 0].mean(); sg = 1.0 if cx > 0 else -1.0; medial = P[(P[:, 0] - cx) * sg < -0.030]; lateral = P[(P[:, 0] - cx) * sg > 0.040]
    d_front = (lateral[:, 1].min() - medial[:, 1].min()) if len(medial) and len(lateral) else -9
    rec('ngon_cai_noi_bat', d_front >= 0.008, f'đầu ngón cái nhô trước ngón út {d_front * 1000:.0f} mm (≥8)')
    # (f) nhấc gót
    apply_foot_pose(arm, 'nhac_got'); P = H._verts(ob); toes = P[P[:, 1] < -0.125]; heel = P[P[:, 1] > 0.085]
    rec('nhac_got', toes[:, 2].min() <= 0.002 and heel[:, 2].min() >= 0.025, f'đầu ngón thấp nhất z={toes[:, 2].min() * 1000:.1f} mm (≤2), gót thấp nhất z={heel[:, 2].min() * 1000:.0f} mm (≥25)')
    apply_foot_pose(arm, 'dung')
    return res


# ---------------------------------------------------------------- render
def render_sheet(sc, ob, arm, out, side='L'):
    """2 tư thế × 4 góc (trên, bên [mặt trong], chéo trước, chéo sau) + nhìn dưới đế; có sàn để thấy tiếp đất."""
    os.makedirs(out, exist_ok=True)
    bpy.ops.mesh.primitive_plane_add(size=1.2, location=(0.1, 0, -0.0005)); fl = bpy.context.object; fl.name = 'San'
    m = bpy.data.materials.new('san'); m.use_nodes = True; m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.42, 0.46, 0.40, 1); fl.data.materials.append(m)
    me_l = bpy.data.meshes.new('Ong_chan_thu'); leg = bpy.data.objects.new('Ong_chan_thu', me_l); bpy.context.scene.collection.objects.link(leg)
    bml = bmesh.new()                                              # ống chân giả: trụ đầu dưới bán cầu (vòng mắt cá của cage đóng nắp tròn), không bậc cứng
    H._loft(bml, [Vector((ANKLE.x, ANKLE.y, 0.118 + ANKLE_R)), Vector((ANKLE.x, ANKLE.y, 0.30)), Vector((ANKLE.x, ANKLE.y, 0.34))], [ANKLE_R, ANKLE_R, ANKLE_R], nseg=64)
    bml.to_mesh(me_l); bml.free()
    leg.data.materials.append(ob.data.materials[0]); [setattr(p_, 'use_smooth', True) for p_ in leg.data.polygons]
    vg = leg.vertex_groups.new(name=f'shin.{side}'); vg.add(list(range(len(leg.data.vertices))), 1.0, 'REPLACE')     # ống chân giả đi theo xương shin
    am = leg.modifiers.new('Armature', 'ARMATURE'); am.object = arm
    c = Vector((0.100, -0.02, 0.09)); views = {'tren': c + Vector((0, -0.2, 2)), 'ben': c + Vector((2, 0, 0.1)), 'cheo_truoc': c + Vector((1.1, -1.6, 0.9)),
                                               'cheo_sau': c + Vector((-1.2, 1.5, 0.9)), 'de': c + Vector((0, -0.2, -2))}
    leg.hide_render = False
    files = []
    for p in FOOT_POSES:
        apply_foot_pose(arm, p)
        if p == 'dung':
            fl.hide_render = False; leg.hide_render = True; tg = Vector((X0, -0.135, 0.025))
            sc.camera = H._cam(sc, 'dung_ngon', tg + Vector((0.5, -1.4, 0.9)), tg, 0.20); sc.render.filepath = os.path.join(out, 'dung_ngon.png'); bpy.ops.render.render(write_still=True); files.append(sc.render.filepath)
        for vn, loc in views.items():
            if vn == 'de' and p != 'dung': continue
            fl.hide_render = (vn == 'de'); leg.hide_render = (vn == 'de')
            sc.camera = H._cam(sc, f'{p}_{vn}', loc, c, 0.55); sc.render.filepath = os.path.join(out, f'{p}_{vn}.png'); bpy.ops.render.render(write_still=True); files.append(sc.render.filepath)
    apply_foot_pose(arm, 'dung'); return files


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--blend', default=''); ap.add_argument('--render', default=''); ap.add_argument('--samples', type=int, default=24); ap.add_argument('--check', action='store_true')
    a = ap.parse_args(argv)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    obL, armL = build_foot('L'); obR, armR = build_foot('R', obL)
    if a.check:
        print('KIỂM CHÂN TRÁI'); r = check_foot(obL, armL); okm = H.check_mirror(obL, obR)
        ok = all(v[0] for v in r.values()) and okm; print('KẾT QUẢ:', 'PASS' if ok else 'FAIL')
    if a.render:
        mat = H.skin_material(); obL.data.materials.append(mat); obR.data.materials.append(mat); obR.hide_render = True
        sc = bpy.context.scene; H.setup_render(sc, a.samples); render_sheet(sc, obL, armL, a.render)
    if a.blend: os.makedirs(os.path.dirname(os.path.abspath(a.blend)), exist_ok=True); bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))


if __name__ == '__main__':
    main()
