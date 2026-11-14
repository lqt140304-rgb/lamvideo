"""Gắn bàn tay và bàn chân riêng (dung_tay_nam.py, dung_chan_nam.py) vào thân cage của Nam (cách B trong THIET-KE-TAY-CHAN.md).

Dựng thân cage (dung_than_cage_nam.py) → bỏ bàn chân cũ → đặt bàn tay/bàn chân mới theo vòng cổ tay/mắt cá ĐO THỰC trên thân lắp ráp
→ khớp bán kính chỗ giao (tay), căn trục (chân) → kiểm nối (check_seams) → render cận cổ tay/mắt cá và toàn thân.
Thân cage chưa rig nên đây là bản TĨNH: nếp nối khi gập cổ tay/bàn chân chưa kiểm được (xem THIET-KE-TAY-CHAN.md).

Chạy:  bpyv/bin/python gan_tay_chan_nam.py --check --render DIR --blend OUT.blend --samples 24
"""
import sys, os, math, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
import numpy as np
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree
import dung_than_cage_nam as C
import dung_than_nam as T
import dung_tay_nam as HT
import dung_chan_nam as FT

KZ = T.KZ
HAND_SCALE = KZ                       # bàn tay dựng theo kích thước chưa nén z; thân Nam nén theo KZ → bàn tay cũng nhân KZ để đúng tỉ lệ
SEAM_TOL = 0.0015                     # sai lệch bán kính chỗ giao cho phép (m)
WRIST_SMOOTH = 70                     # số vòng Taubin ở vùng chuyển cổ tay → lòng tay
ANKLE_FILLET_A = 0.012                # mu chân dâng lên tối đa (m) ở sát ống chân
ANKLE_FILLET_W = 0.020                # bề rộng vùng dâng (m) tính từ mặt ống chân ra ngoài


def ss(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)


def _world(ob):
    me = ob.data; a = np.zeros(len(me.vertices) * 3); me.vertices.foreach_get('co', a); a = a.reshape(-1, 3)
    return (np.array(ob.matrix_world) @ np.c_[a, np.ones(len(a))].T).T[:, :3]


def _set_verts(ob, P):
    me = ob.data; me.vertices.foreach_set('co', P.astype(np.float32).ravel()); me.update()


def measure_wrist(asm):
    """Tâm, trục (từ khuỷu → cổ tay) và bán kính ống cẳng tay tại vòng cổ tay của cage, đo trên thân đã lắp."""
    r_prev, r_w = C.ARM_RINGS[-2], C.ARM_RINGS[-1]; c_w = Vector(r_w['c']); d = (c_w - Vector(r_prev['c'])).normalized()
    P = _world(asm); rel = P - np.array(c_w); u = rel @ np.array(d); rad = np.linalg.norm(rel - np.outer(u, np.array(d)), axis=1)
    sel = (np.abs(u) < 0.004) & (rad < 0.07) & (P[:, 0] > 0.15)
    return c_w, d, float(rad[sel].mean()), float(rad[sel].max())


def place_hand(asm, side='L', verbose=True):
    """Dời/co/xoay bàn tay (dựng ở toạ độ riêng) về cổ tay cage, rồi nở đoạn cổ tay cho bằng bán kính cẳng tay tại chỗ giao."""
    c_w, d, rf_mean, rf_max = measure_wrist(asm)
    ob = HT.build_shape('L'); P = _world(ob)
    D_h = HT._D.normalized(); P = (P - np.array(HT.WRIST)) * HAND_SCALE                        # gốc ở cổ tay, thu theo KZ
    R = np.array(D_h.rotation_difference(d).to_matrix()); P = P @ R.T + np.array(c_w)
    rel = P - np.array(c_w); u = rel @ np.array(d); radial = rel - np.outer(u, np.array(d)); rh = np.linalg.norm(radial, axis=1)
    stub = (u > -0.014) & (u < -0.004); rh0 = float(rh[stub].mean()); target = rf_mean * 0.92                   # nhỏ hơn 8%: tiết diện cẳng tay hơi dẹt, đoạn cổ tay phải nằm trọn trong ống, không cùng mặt
    f = 1.0 + (target / rh0 - 1.0) * (1.0 - ss(-0.002, 0.010, u))
    P = np.array(c_w) + np.outer(u, np.array(d)) + radial * f[:, None]
    # bề ngang gốc lòng tay thu hẹp dần từ bán kính ống (u = 0) tới bề ngang đầy đủ ở khớp ngón (u ≈ 0,07): bỏ hai góc nhô như "tai" ngay chỗ ra khỏi ống
    S_dir = np.array((R @ np.array(HT._S.normalized())).tolist() if False else (Matrix(R.tolist()) @ HT._S.normalized())); sv = (P - np.array(c_w)) @ S_dir
    full = HT.PALM_HW * HAND_SCALE * 0.92; wlim = target / 0.92 * 0.99 + (full - target / 0.92 * 0.99) * ss(0.0, 0.07, u)
    over = np.abs(sv) > wlim; sv2 = np.sign(sv) * (wlim + 0.30 * (np.abs(sv) - wlim))
    keep = over & (u > -0.002) & (((sv > 0) & (u < 0.07)) | ((sv <= 0) & (u < 0.016) & (np.abs(sv) < 0.050)))     # phía ngón cái chỉ ép sát cổ tay: gò ngón cái và ngón cái giữ nguyên
    P = np.where(keep[:, None], P + np.outer(sv2 - sv, S_dir), P)
    _set_verts(ob, P)
    # vùng chuyển ống tròn → lòng tay dẹt: làm mượt (Taubin) để hai góc lòng tay không nhô ra như tai ngay chỗ ra khỏi ống
    bm = bmesh.new(); bm.from_mesh(ob.data); bm.verts.ensure_lookup_table(); band = [v for v, uu in zip(bm.verts, u) if -0.002 < uu < 0.034]
    for _ in range(WRIST_SMOOTH):
        bmesh.ops.smooth_vert(bm, verts=band, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
        bmesh.ops.smooth_vert(bm, verts=band, factor=-0.53, use_axis_x=True, use_axis_y=True, use_axis_z=True)
    bm.to_mesh(ob.data); bm.free(); ob.data.update()
    if verbose: print(f'    tay: cẳng tay r = {rf_mean * 1000:.1f} mm (max {rf_max * 1000:.1f}), cổ tay dựng r = {rh0 * 1000:.1f} mm → nở về {target * 1000:.1f} mm; trục lệch {math.degrees(D_h.angle(d)):.1f}°')
    return ob, dict(c=c_w, d=d, rf=rf_mean, target=target)


def measure_ankle(asm, z0=0.100):
    """Tâm ống chân tại z0 (trục thẳng đứng), bán kính trung bình."""
    P = _world(asm); sel = (np.abs(P[:, 2] - z0) < 0.004) & (P[:, 0] > 0.03) & (P[:, 0] < 0.16) & (P[:, 1] > -0.1) & (P[:, 1] < 0.1)
    Q = P[sel]; c = np.array([(Q[:, 0].min() + Q[:, 0].max()) / 2, (Q[:, 1].min() + Q[:, 1].max()) / 2]); r = np.linalg.norm(Q[:, :2] - c, axis=1)
    return Vector((c[0], c[1], z0)), float(r.mean()), float(r.max())


def place_foot(asm, verbose=True):
    """Chân dựng sẵn ở toạ độ thế giới của Nam; chỉ dời ngang cho trục cổ chân trùng tâm ống chân đo thực."""
    c, r_mean, r_max = measure_ankle(asm)
    ob = FT.build_shape('L'); P = _world(ob)
    sel = (np.abs(P[:, 2] - 0.150) < 0.004); cf = np.array([(P[sel, 0].min() + P[sel, 0].max()) / 2, (P[sel, 1].min() + P[sel, 1].max()) / 2])
    d_xy = np.array([c.x, c.y]) - cf; P[:, 0] += d_xy[0]; P[:, 1] += d_xy[1]; _set_verts(ob, P)
    if verbose: print(f'    chân: ống chân r = {r_mean * 1000:.1f} mm (max {r_max * 1000:.1f}), tâm ({c.x:.4f}, {c.y:.4f}); dời cổ chân ({d_xy[0] * 1000:.1f}, {d_xy[1] * 1000:.1f}) mm')
    return ob, dict(c=c, r=r_mean)


def fillet_ankle(ob, c, r_leg, A=None, W=None):
    """Gờ bo mềm ở mắt cá: các đỉnh mặt trên của bàn chân sát ống chân được nâng dần (A ở mặt ống, về 0 sau W) → mu chân dâng lên gặp ống chân thay vì có đường gờ cứng."""
    A = ANKLE_FILLET_A if A is None else A; W = ANKLE_FILLET_W if W is None else W
    P = _world(ob); rho = np.hypot(P[:, 0] - c.x, P[:, 1] - c.y); z = P[:, 2]
    top = (z > 0.045) & (z < 0.13)                                  # chỉ mặt trên; đế và ngón không bị nâng
    w = (1.0 - ss(r_leg - 0.004, r_leg + W, rho)) * ss(0.045, 0.075, z) * (1.0 - ss(0.115, 0.13, z)) * top
    P[:, 2] += A * w; _set_verts(ob, P)
    bm = bmesh.new(); bm.from_mesh(ob.data); bm.verts.ensure_lookup_table(); band = [v for v, ww in zip(bm.verts, w) if ww > 0.02]
    for _ in range(10):
        bmesh.ops.smooth_vert(bm, verts=band, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
        bmesh.ops.smooth_vert(bm, verts=band, factor=-0.53, use_axis_x=True, use_axis_y=True, use_axis_z=True)
    bm.to_mesh(ob.data); bm.free(); ob.data.update()


def attach(asm, skin):
    """Bỏ bàn chân cũ, đặt tay/chân mới (trái + gương phải), gán vật liệu da. Trả dict vật + thông số chỗ giao."""
    for nm in ('Nam_BanChan.L', 'Nam_BanChan.R'):
        o = bpy.data.objects.get(nm)
        if o: bpy.data.objects.remove(o, do_unlink=True)
    coll = asm.users_collection[0]; out, info = {}, {}
    handL, info['hand'] = place_hand(asm); footL, info['foot'] = place_foot(asm)
    fillet_ankle(footL, info['foot']['c'], info['foot']['r'])
    for nm, ob in (('Nam_BanTay.L', handL), ('Nam_BanChan.L', footL)):
        ob.name = nm; ob.data.name = nm
        for c in list(ob.users_collection): c.objects.unlink(ob)
        coll.objects.link(ob); out[nm] = ob
    for nm, src, fn in (('Nam_BanTay.R', handL, HT.mirror_shape), ('Nam_BanChan.R', footL, FT.mirror_shape)):
        ob = fn(src, 'R'); ob.name = nm; ob.data.name = nm
        for c in list(ob.users_collection): c.objects.unlink(ob)
        coll.objects.link(ob); out[nm] = ob
    for ob in out.values():
        ob.data.materials.clear(); ob.data.materials.append(skin)
        for p in ob.data.polygons: p.use_smooth = True
    return out, info


# ---------------------------------------------------------------- kiểm nối
def _inside(bvh, pts):
    """Điểm nằm trong lưới kín (pháp tuyến ngoài) ⇔ (p − gần nhất)·n < 0."""
    res = []
    for p in pts:
        loc, nrm, _, _ = bvh.find_nearest(Vector(p)); res.append((Vector(p) - loc).dot(nrm) < 0 if loc is not None else False)
    return np.array(res)


def check_seams(asm, parts, info):
    """Trả dict tên-kiểm → (đạt?, chi tiết). In PASS/FAIL từng mục."""
    res = {}
    def rec(k, ok, msg): res[k] = (bool(ok), msg); print(f'    {"PASS" if ok else "FAIL"}  {k}: {msg}')
    A = _world(asm); me = asm.data; polys = [list(p.vertices) for p in me.polygons]; bv = BVHTree.FromPolygons(A.tolist(), polys, all_triangles=False)
    for sfx in ('L', 'R'):
        hand, foot = parts[f'Nam_BanTay.{sfx}'], parts[f'Nam_BanChan.{sfx}']
        Ph, Pf = _world(hand), _world(foot); sg = 1.0 if sfx == 'L' else -1.0
        c, d = info['hand']['c'], info['hand']['d']; cc = Vector((sg * c.x, c.y, c.z)); dd = Vector((sg * d.x, d.y, d.z))
        u = (Ph - np.array(cc)) @ np.array(dd); stub = Ph[(u < -0.004) & (u > -0.020)]
        ins = _inside(bv, stub[::7]); rec(f'tay_{sfx}_co_tay_trong_ong', len(stub) > 0 and ins.all(), f'{int(ins.sum())}/{len(ins)} đỉnh đoạn cổ tay nằm trong ống cẳng tay')
        rad = np.linalg.norm((Ph - np.array(cc)) - np.outer(u, np.array(dd)), axis=1); sel = (u > 0.000) & (u < 0.003)
        dr = abs(float(rad[sel].mean()) - info['hand']['rf']) if sel.any() else 9
        rec(f'tay_{sfx}_khop_ban_kinh', dr <= 0.004, f'bán kính tay tại chỗ ra khỏi ống {float(rad[sel].mean()) * 1000:.1f} mm, ống {info["hand"]["rf"] * 1000:.1f} mm (lệch {dr * 1000:.1f} mm, ≤4)')
        neck = Pf[Pf[:, 2] > 0.125]; ins = _inside(bv, neck[::9]); rec(f'chan_{sfx}_co_chan_trong_ong', len(neck) > 0 and ins.mean() >= 0.97, f'{int(ins.sum())}/{len(ins)} đỉnh đoạn cổ chân nằm trong ống chân (z > 125 mm)')
        rec(f'chan_{sfx}_de_cham_san', abs(Pf[:, 2].min()) <= 0.001, f'đáy thấp nhất z = {Pf[:, 2].min() * 1000:.1f} mm')
    lo, hi = C._height(bpy.context.scene); rec('chieu_cao', abs(lo) <= 0.001 and abs(hi - C.H_TARGET) <= C.H_TOL, f'đáy {lo * 1000:.1f} mm, đỉnh {hi:.4f} m (đích {C.H_TARGET} ± {C.H_TOL})')
    return res


def ok_all(res): return all(v[0] for v in res.values())


# ---------------------------------------------------------------- render
def render_close(sc, parts, out, samples):
    os.makedirs(out, exist_ok=True); sc.cycles.samples = samples; sc.render.resolution_x = sc.render.resolution_y = 600; files = []
    hand, foot = parts['Nam_BanTay.L'], parts['Nam_BanChan.L']
    wr = info_c['hand']['c']
    views = {
        'co_tay_truoc': (wr, wr + Vector((0.2, -2.0, 0.1)), 0.20), 'co_tay_ben': (wr, wr + Vector((2.0, 0.0, 0.1)), 0.20), 'co_tay_cheo': (wr, wr + Vector((1.4, -1.4, 0.5)), 0.20),
        'mat_ca_truoc': (Vector((0.10, 0.0, 0.09)), Vector((0.10, -2.0, 0.2)), 0.30), 'mat_ca_ben': (Vector((0.10, 0.0, 0.09)), Vector((2.2, 0.0, 0.15)), 0.30),
        'mat_ca_cheo': (Vector((0.10, 0.0, 0.09)), Vector((1.4, -1.6, 0.8)), 0.30), 'mat_ca_sau': (Vector((0.10, 0.0, 0.09)), Vector((-0.6, 2.0, 0.5)), 0.30)}
    for nm, (tg, loc, sc_) in views.items():
        sc.camera = T.cam(sc, nm, loc, tg, sc_); sc.render.filepath = os.path.join(out, nm + '.png'); bpy.ops.render.render(write_still=True); files.append(sc.render.filepath)
    return files


info_c = {}


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--check', action='store_true'); ap.add_argument('--render', default=''); ap.add_argument('--blend', default=''); ap.add_argument('--samples', type=int, default=24); ap.add_argument('--chi-can', action='store_true')
    a = ap.parse_args(argv); a.render = os.path.abspath(a.render) if a.render else ''
    sc = C.build_old()
    cb = bpy.data.collections[C.NEW_COLL]; C.split_hands_feet(bpy.data.objects['Nam_Than_goc'], cb); cage = C.build_cage(cb)
    skin = bpy.data.objects['Nam_Than_goc'].data.materials[0]
    asm = C.assemble_cage(bpy.data.objects['Head_Base'], cage, skin); cage.hide_render = True
    parts, info = attach(asm, skin); info_c.update(info)
    if a.render:
        T.lights(sc); print('ảnh cận:', render_close(sc, parts, os.path.join(a.render, 'can'), a.samples))
        if not a.chi_can: print('ảnh toàn thân:', C.render_views(sc, os.path.join(a.render, 'than'), list(C.VIEWS), a.samples))
    if a.blend: os.makedirs(os.path.dirname(os.path.abspath(a.blend)), exist_ok=True); bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))
    if a.check:
        print('KIỂM NỐI'); ok = ok_all(check_seams(asm, parts, info)); print('KẾT QUẢ:', 'PASS' if ok else 'FAIL'); sys.stdout.flush(); os._exit(0 if ok else 1)


if __name__ == '__main__':
    main()
