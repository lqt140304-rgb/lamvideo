"""MẶT theo tham số cho khuôn NAM-003 — Blender 5.2.x.

  blender -b --factory-startup --python rig_mat_nam003.py -- --in nam-003-rig.blend --nv tung --out tung.blend [--anh xem] [--kiem]

Thứ tự: bóp mặt → đo mốc → mắt → mày → miệng → biểu cảm/khẩu hình → da → scale.
Mọi kích thước tương đối với mốc đo trên lưới sau khi bóp, nên dùng được cho mọi bộ trong nhan_vat_nam003.NHAN_VAT.
"""
import sys, os, math, argparse
import numpy as np, bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import nhan_vat_nam003 as NV  # noqa: E402

H0 = 1.824   # chiều cao lưới khuôn


def mesh_co(ob):
    a = np.empty(len(ob.data.vertices) * 3); ob.data.vertices.foreach_get('co', a); return a.reshape(-1, 3)


def set_co(ob, co):
    ob.data.vertices.foreach_set('co', co.ravel()); ob.data.update()


# ---------------------------------------------------------------- đo mốc
def _ban_do_mat(co, x0, x1, z0, z1, d=0.002):
    """Lưới (x,z) → y trước nhất của da (min y). Trả xs, zs, Y (nan nếu trống)."""
    xs = np.arange(x0, x1 + 1e-9, d); zs = np.arange(z0, z1 + 1e-9, d)
    Y = np.full((len(zs), len(xs)), np.nan)
    sel = co[(co[:, 1] < 0) & (co[:, 0] > x0 - d) & (co[:, 0] < x1 + d) & (co[:, 2] > z0 - d) & (co[:, 2] < z1 + d)]
    ix = np.round((sel[:, 0] - x0) / d).astype(int); iz = np.round((sel[:, 2] - z0) / d).astype(int)
    ok = (ix >= 0) & (ix < len(xs)) & (iz >= 0) & (iz < len(zs))
    for i, j, y in zip(iz[ok], ix[ok], sel[ok, 1]):
        if not (Y[i, j] <= y): Y[i, j] = y
    return xs, zs, Y


def do_moc(body):
    co = mesh_co(body)
    # mũi: điểm trước nhất trên đường giữa trong dải mặt
    mid = co[(np.abs(co[:, 0]) < 0.004) & (co[:, 2] > 1.60) & (co[:, 2] < 1.74)]
    mui = mid[np.argmin(mid[:, 1])]
    # cằm: đáy mặt trên đường giữa = z thấp nhất mà da còn nhô trước (y < −0,06)
    mid2 = co[(np.abs(co[:, 0]) < 0.004) & (co[:, 1] < -0.06) & (co[:, 2] > 1.50)]
    s = mid2[mid2[:, 2] < mid2[:, 2].min() + 0.008]; cam = (0.0, float(s[:, 1].min()), float(s[:, 2].mean()))
    # miệng: lưới khuôn không có rãnh miệng → đặt theo tỉ lệ mũi–cằm.
    # shortcut: tỉ lệ 0,42 cố định; khi khuôn mới có rãnh miệng thì tìm rãnh (y lõm) thay vì tỉ lệ.
    mz = cam[2] + 0.42 * (mui[2] - cam[2])
    s = co[(np.abs(co[:, 0]) < 0.006) & (np.abs(co[:, 2] - mz) < 0.006) & (co[:, 1] < 0)]
    mieng = (0.0, float(s[:, 1].min()), float(mz))
    # hốc mắt: độ lõm theo chiều dọc C = y(z) − trung bình y(z±h) (giữa gờ mày và gò má), bên +X
    d = 0.004; h = 0.020
    xs, zs, Y = _ban_do_mat(co, 0.0, 0.08, mui[2] - 0.03, mui[2] + 0.11, d)
    for _ in range(6):                                           # lấp ô trống bằng trung bình lân cận
        P = np.pad(Y, 1, constant_values=np.nan); nb = np.stack([P[:-2, 1:-1], P[2:, 1:-1], P[1:-1, :-2], P[1:-1, 2:]])
        Y = np.where(np.isnan(Y), np.nanmean(nb, 0), Y) if np.isnan(Y).any() else Y
    k = int(round(h / d)); C = np.full_like(Y, np.nan); C[k:-k] = Y[k:-k] - 0.5 * (Y[:-2 * k] + Y[2 * k:])
    X, Z = np.meshgrid(xs, zs); C[(X < 0.015) | (Z < mui[2] + 0.005) | (Z > mui[2] + 0.075)] = np.nan
    cmax = np.nanmax(C); vung = C > 0.45 * cmax
    r_hoc = float(math.sqrt(vung.sum() * d * d / math.pi))
    w = np.where(vung, C, 0); mx = float((w * X).sum() / w.sum()); mzz = float((w * Z).sum() / w.sum())
    mat = (mx, float(Y[np.argmin(np.abs(zs - mzz)), np.argmin(np.abs(xs - mx))]), mzz)
    # tai: trọng tâm khối đỉnh xa ngoài nhất ở tầm mắt
    t = co[(co[:, 0] > 0.105) & (co[:, 2] > mui[2] - 0.04) & (co[:, 2] < mui[2] + 0.11) & (np.abs(co[:, 1]) < 0.06)]
    tai = tuple(map(float, t.mean(0)))
    return dict(mat=mat, r_hoc=r_hoc, mui=(0.0, float(mui[1]), float(mui[2])), mieng=mieng, cam=cam, tai=tai)


def doi_moc(m, body, co0):
    """Mốc sau khi bóp = mốc trước + độ dịch của đỉnh gần nhất. Không đo lại, vì bóp làm mũi thấp đi thì
    'điểm trước nhất' đổi nghĩa (Ruling trong ledger)."""
    co = mesh_co(body); out = dict(m)
    for k in ('mat', 'mui', 'mieng', 'cam', 'tai'):
        i = int(np.argmin(np.linalg.norm(co0 - np.array(m[k]), axis=1))); out[k] = tuple(map(float, np.array(m[k]) + co[i] - co0[i]))
    return out


def kiem_moc(m):
    assert m['mat'][0] > 0.02, m['mat']
    assert m['mui'][1] < m['mat'][1], 'mũi phải nhô trước mắt'
    assert m['cam'][2] < m['mieng'][2] < m['mui'][2] < m['mat'][2], m
    assert 0.01 < m['r_hoc'] < 0.05, m['r_hoc']
    print('PASS moc')


# ---------------------------------------------------------------- bóp mặt
def bop(body, p, m):
    """Dịch đỉnh đầu theo vùng lan mềm Gauss, đối xứng hai bên. Hệ số trong p['bop'] (1 = mức chuẩn).
    Giảm về 0 trong vùng hốc mắt (1,3 r_hoc) để mắt không lệch khỏi hốc. Không thêm/bớt đỉnh."""
    b = p['bop']
    if not b: return 0.0
    co = mesh_co(body); d = np.zeros_like(co); x, y, z = co.T; ax = np.abs(x); sx = np.sign(x)
    g = lambda c, r: np.exp(-(((ax - c[0]) ** 2 + (y - c[1]) ** 2 + (z - c[2]) ** 2) / r ** 2))
    mui, cam, mie, tai, mat = m['mui'], m['cam'], m['mieng'], m['tai'], m['mat']
    if b.get('tai'):          # co tai về gốc tai (phía đầu)
        w = np.clip((ax - 0.095) / 0.02, 0, 1) * (z > tai[2] - 0.06) * (z < tai[2] + 0.07) * (np.abs(y - tai[1]) < 0.06)
        goc = np.array([0.095, tai[1], tai[2]]); k = 1 - b['tai']
        rel = np.c_[ax, y, z] - goc; dd = -rel * k * w[:, None]; dd[:, 0] *= sx; d += dd
    if b.get('ham'):          # hàm bạnh: góc hàm ra ngoài 4 mm
        w = g((0.060, mie[1] + 0.035, cam[2] + 0.012), 0.030); d[:, 0] += sx * 0.004 * b['ham'] * w
    if b.get('cam'):          # cằm dài: đáy cằm xuống 5 mm, ra trước 1,5 mm
        w = g((0.0, cam[1], cam[2]), 0.028) * (z < mie[2]); d[:, 2] -= 0.005 * b['cam'] * w; d[:, 1] -= 0.0015 * b['cam'] * w
    if b.get('mui_thap'):     # mũi thấp: đầu mũi lùi 3 mm
        w = g((0.0, mui[1], mui[2]), 0.016); d[:, 1] += 0.003 * b['mui_thap'] * w
    if b.get('mui_thon'):     # mũi thon: cánh mũi khép 15 %
        w = g((0.0, mui[1] + 0.008, mui[2] - 0.004), 0.018); d[:, 0] -= x * 0.15 * b['mui_thon'] * w
    if b.get('ma_hop'):       # má hóp nhẹ 1,5 mm
        w = g((0.058, mie[1] + 0.028, mie[2] + 0.012), 0.020); d[:, 0] -= sx * 0.0015 * b['ma_hop'] * w; d[:, 1] += 0.001 * b['ma_hop'] * w
    # giữ hốc mắt nguyên
    dm = np.sqrt((ax - mat[0]) ** 2 + (z - mat[2]) ** 2); keep = np.clip((dm - 1.3 * m['r_hoc']) / m['r_hoc'], 0, 1)
    d *= keep[:, None] * (z > 1.50)[:, None]
    set_co(body, co + d)
    return float(np.linalg.norm(d, axis=1).max())


# ---------------------------------------------------------------- ảnh xem
def anh_mat(sc, path, goc=(0, 35), z=None, khung=0.30, px=360):
    """Ảnh mặt trực giao (EEVEE). z: tâm khung theo tọa độ world. Ghép ngang các góc bằng ảnh tạm."""
    sc.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
    sc.render.resolution_x = sc.render.resolution_y = px; sc.render.image_settings.file_format = 'PNG'
    if not sc.world:
        sc.world = bpy.data.worlds.new('nen'); sc.world.color = (0.22, 0.23, 0.26)
    if 'Den_xem' not in bpy.data.objects:
        L = bpy.data.objects.new('Den_xem', bpy.data.lights.new('Den_xem', 'SUN')); L.data.energy = 3.0; L.rotation_euler = (0.9, 0, 0.5); sc.collection.objects.link(L)
    cam = bpy.data.objects.get('Cam_xem')
    if not cam:
        cam = bpy.data.objects.new('Cam_xem', bpy.data.cameras.new('Cam_xem')); sc.collection.objects.link(cam); cam.data.type = 'ORTHO'
    sc.camera = cam; cam.data.ortho_scale = khung
    files = []
    for a in goc:
        r = math.radians(a); t = Vector((0, 0, z)); cam.location = t + Vector((math.sin(r), -math.cos(r), 0)); cam.rotation_euler = (math.pi / 2, 0, r)
        f = f'{path}__{len(files)}.png'; sc.render.filepath = f; bpy.ops.render.render(write_still=True); files.append(f)
    return files


def anh_trang_thai(sc, arm, path, z, ds, khung=0.16, goc=(0,)):
    """Mỗi phần tử ds: {thuộc tính Head: giá trị} hoặc {'nhin': (x,y,z)}; chụp rồi trả về mặc định."""
    pb = arm.pose.bones; files = []
    for i, d in enumerate(ds):
        for k, v in d.items():
            if k == 'nhin': pb['nhin'].location = v
            else: pb['Head'][k] = float(v)
        arm.update_tag(); sc.frame_set(sc.frame_current)
        files += anh_mat(sc, f'{path}_{i:02d}', goc=goc, z=z, khung=khung)
        for k in d:
            if k == 'nhin': pb['nhin'].location = (0, 0, 0)
            else: pb['Head'][k] = 0.0
    return files


# ---------------------------------------------------------------- chính
def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser()
    ap.add_argument('--in', dest='inp', required=True); ap.add_argument('--nv', required=True); ap.add_argument('--out', required=True)
    ap.add_argument('--anh'); ap.add_argument('--kiem', action='store_true')
    a = ap.parse_args(argv)
    p = NV.lay(a.nv)
    bpy.ops.wm.open_mainfile(filepath=os.path.abspath(a.inp))
    sc = bpy.context.scene; body = bpy.data.objects['Nam_Body']; arm = bpy.data.objects['Nam_Rig']
    if a.kiem: NV.kiem_lay()
    m0 = do_moc(body); co0 = mesh_co(body)
    if a.anh: os.makedirs(a.anh, exist_ok=True); anh_mat(sc, os.path.join(a.anh, 'bop_truoc'), z=m0['mui'][2] + 0.01)
    dmax = bop(body, p, m0)
    m = doi_moc(m0, body, co0)
    print('  mốc:', {k: (tuple(round(v, 4) for v in val) if isinstance(val, tuple) else round(val, 4)) for k, val in m.items()}, f'bóp tối đa {dmax * 1000:.1f} mm')
    if a.kiem: kiem_moc(m)
    if a.anh: anh_mat(sc, os.path.join(a.anh, 'bop_sau'), z=m['mui'][2] + 0.01)
    import mat3d_nam003 as M3
    mat = M3.tao_mat(sc, arm, body, m, p)
    M3.lam_moi_driver()
    if a.kiem: M3.kiem_mat(mat, arm, body)
    if a.anh: anh_trang_thai(sc, arm, os.path.join(a.anh, 'mat'), m['mat'][2], [
        {}, {'nhin': (0.12, 0, 0)}, {'nhin': (-0.12, 0, 0)}, {'nhin': (0, 0, 0.10)}, {'nhin': (0, 0, -0.10)},
        {'mo_to': 1}, {'chop_mat': 0.5}, {'chop_mat': 1}, {'chop_trai': 1}])
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.out), compress=True)
    print('PASS: đã lưu', a.out)


main()
