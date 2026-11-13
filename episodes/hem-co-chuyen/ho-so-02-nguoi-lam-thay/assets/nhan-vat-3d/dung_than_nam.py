"""NAM — THÂN NHẴN (02_Body_Base), tỉ lệ chibi, nối vào đầu của `dung_dau_nam.py` (đầu/tóc/mặt giữ nguyên, không scale).

Chạy:  python dung_than_nam.py --render <thư mục> [--blend file.blend]
Đơn vị mét, sàn Z = 0, nhân vật quay mặt −Y, trái nhân vật = +X.

Cấu trúc: collection `02_Body_Base` gồm `Nam_Than` — MỘT mesh liền: cổ → vai → ngực/lưng → bụng → hông/mông → đùi → gối → cẳng → cổ chân → bàn chân 5 ngón;
vai → bắp tay → khuỷu → cẳng tay → cổ tay → bàn tay 4 ngón + ngón cái. Dựng từ các ống/vòng cắt chồng nhau rồi gộp bằng voxel remesh (liền khối, không cầu/trụ rời), làm mượt.
Dùng cùng màu da với Head_Base. Chưa có quần áo, chưa gắn rig.
"""
import sys, os, math, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
from mathutils import Vector
import dung_dau_nam as D

M_CT = 32


def sg(v): return 1.0 if v >= 0 else -1.0


def ring(c, a, bf, bb, n, X=Vector((1, 0, 0)), Y=Vector((0, 1, 0)), m=M_CT):
    """Vòng siêu elip quanh c cùng quy ước điểm với Head_Base: θ = 0 ở phía TRƯỚC (−Y), x = a·sin; bf/bb = nửa sâu phía trước/sau."""
    pts = []; e = 2.0 / n
    for k in range(m):
        th = 2 * math.pi * k / m; cs, sn = math.cos(th), math.sin(th)
        py = -bf * abs(cs) ** e if cs >= 0 else bb * abs(cs) ** e
        pts.append(c + X * (a * sg(sn) * abs(sn) ** e) + Y * py)
    return pts


def loft_obj(name, rings, coll):
    bm = bmesh.new(); rv = [[bm.verts.new(p) for p in r] for r in rings]; m = len(rv[0])
    for a, b in zip(rv, rv[1:]):
        for j in range(m): bm.faces.new((a[j], a[(j + 1) % m], b[(j + 1) % m], b[j]))
    for r, rev in ((rv[0], True), (rv[-1], False)):
        cv = bm.verts.new(sum((v.co for v in r), Vector()) / m)
        for j in range(m): bm.faces.new((cv, r[(j + 1) % m], r[j]) if rev else (cv, r[j], r[(j + 1) % m]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    return D.new_obj(name, bm, coll, None)


def _cr(P, t):
    n = len(P) - 1; i = min(int(t), n - 1); f = t - i; p0, p1, p2, p3 = P[max(i - 1, 0)], P[i], P[i + 1], P[min(i + 2, n)]
    return [0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * f + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * f * f + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * f ** 3) for k in range(len(p1))]


def tube(name, knots, coll, step=0.008, n=2.0, along='z'):
    """Ống theo các nút (x,y,z,rx,ry). along='z': vòng nằm ngang. along='y': vòng thẳng đứng, (rx = nửa ngang, ry = nửa cao)."""
    ax = 2 if along == 'z' else 1
    N = max(8, int(abs(knots[-1][ax] - knots[0][ax]) / step)); rings = []
    for i in range(N + 1):
        v = _cr(knots, i / N * (len(knots) - 1)); c = Vector(v[:3])
        rings.append(ring(c, v[3], v[4], v[4], n, m=24) if along == 'z' else ring(c, v[3], v[4], v[4], n, X=Vector((1, 0, 0)), Y=Vector((0, 0, 1)), m=24))
    return loft_obj(name, rings, coll)


def torso(name, table, coll, step=0.008, extra=()):
    zs = [t[0] for t in table]; N = int((zs[-1] - zs[0]) / step); rings = []
    for i in range(N + 1):
        v = _cr(table, i / N * (len(table) - 1)); rings.append(ring(Vector((0, v[4], v[0])), v[1], v[2], v[3], v[5], m=96))
    rings += list(extra)
    return loft_obj(name, rings, coll)


def join(objs, name):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]; bpy.ops.object.join(); o = bpy.context.view_layer.objects.active; o.name = name; o.data.name = name; return o


def apply_mod(ob, mod):
    bpy.context.view_layer.objects.active = ob; bpy.ops.object.modifier_apply(modifier=mod.name)


def remesh(ob, voxel, smooth):
    r = ob.modifiers.new('Remesh', 'REMESH'); r.mode = 'VOXEL'; r.voxel_size = voxel; apply_mod(ob, r)
    s = ob.modifiers.new('Smooth', 'SMOOTH'); s.factor = 0.55; s.iterations = smooth; apply_mod(ob, s); ob.data.shade_smooth()


# ---------------------------------------------------------------- số đo (m), chibi: đầu+tóc ≈ 34% chiều cao
#           z      a      bf     bb     yc     n     (vòng ngang theo độ cao)
TORSO = [(0.52, 0.112, 0.084, 0.100, 0.000, 2.3), (0.58, 0.128, 0.094, 0.122, 0.000, 2.3), (0.65, 0.128, 0.114, 0.098, 0.000, 2.2), (0.74, 0.124, 0.100, 0.084, 0.000, 2.2),
         (0.83, 0.130, 0.090, 0.080, 0.000, 2.2), (0.90, 0.142, 0.086, 0.078, 0.000, 2.2), (0.935, 0.126, 0.084, 0.076, -0.002, 2.1), (0.948, 0.106, 0.086, 0.080, -0.005, 2.1),
         (0.958, 0.0985, 0.0855, 0.0855, -0.007, 2.0), (0.968, 0.0950, 0.0850, 0.0850, -0.007, 2.0)]
NECK_Z = (0.976, 0.984, 0.992, 1.000, 1.010, 1.024)
NECK_SHRINK = [(0.976, -0.0020), (0.984, -0.0020), (0.992, -0.0020), (1.000, -0.0020), (1.010, -0.0020), (1.024, -0.0020)]   # thân trùm ra ngoài cổ của đầu 2 mm suốt chiều dài cổ → chỉ còn nếp tự nhiên dưới hàm, không gờ ở chân cổ


def neck_rings(m=96):
    t = D.LOFT_TAB; out = []
    for z in NECK_Z:
        for (z0, f0, b0, w0), (z1, f1, b1, w1) in zip(t[::-1], t[::-1][1:]):
            if z0 <= z <= z1:
                u = (z - z0) / (z1 - z0); yf, yb, w = f0 + (f1 - f0) * u, b0 + (b1 - b0) * u, w0 + (w1 - w0) * u; break
        shrink = next(v for zz, v in NECK_SHRINK if abs(zz - z) < 1e-6)
        mm, nf, nb = D.section_params(z, D.SECTION_MODE); ym = yf + mm * (yb - yf); af, ab = ym - yf - shrink, yb - ym - shrink; w -= shrink; pts = []
        for j in range(m):
            th = 2 * math.pi * j / m; c, s_ = math.cos(th), math.sin(th); n = nf if c >= 0 else nb; e = 2.0 / n
            y = ym - af * abs(c) ** e if c >= 0 else ym + ab * abs(c) ** e
            pts.append(Vector((w * math.copysign(abs(s_) ** e, s_), y, z)))
        out.append(pts)
    return out


#         x      y       z     rx     ry   (tay TRÁI nhân vật = +X; tay phải lấy đối xứng)
ARM = [(0.118, 0.002, 0.940, 0.036, 0.040), (0.142, 0.002, 0.905, 0.047, 0.049), (0.154, 0.000, 0.84, 0.047, 0.047), (0.162, 0.000, 0.76, 0.044, 0.044), (0.168, 0.002, 0.67, 0.037, 0.037),
       (0.172, -0.002, 0.585, 0.034, 0.033), (0.175, -0.004, 0.515, 0.027, 0.025)]
# bàn tay: lòng bàn tay hướng vào đùi (dẹt theo x), 4 ngón buông rủ, ngón cái ở cạnh trước (−Y) chúc xuống
PALM = [(0.175, -0.004, 0.515, 0.027, 0.025), (0.175, -0.006, 0.490, 0.020, 0.039), (0.175, -0.007, 0.455, 0.019, 0.042), (0.175, -0.007, 0.435, 0.015, 0.038)]
FINGERS = [  # (dy so với tâm bàn, độ dài, bán kính)
    (-0.0285, 0.058, 0.0108), (-0.0095, 0.068, 0.0112), (0.0095, 0.060, 0.0108), (0.0280, 0.047, 0.0098)]
THUMB = [(0.169, -0.030, 0.495, 0.015, 0.015), (0.168, -0.043, 0.468, 0.0135, 0.0135), (0.169, -0.050, 0.440, 0.0115, 0.0115), (0.169, -0.052, 0.424, 0.008, 0.008)]
LEG = [(0.068, 0.002, 0.585, 0.064, 0.070), (0.069, 0.000, 0.50, 0.064, 0.068), (0.070, -0.002, 0.40, 0.056, 0.058), (0.069, -0.006, 0.29, 0.046, 0.048), (0.069, 0.004, 0.20, 0.047, 0.049),
       (0.069, 0.002, 0.12, 0.035, 0.036), (0.069, 0.000, 0.085, 0.032, 0.033)]
#           x     y      z    rx(ngang) ry(cao): bàn chân (vòng đứng dọc theo y), đế ở z = 0
FOOT = [(0.069, 0.058, 0.026, 0.026, 0.026), (0.069, 0.040, 0.034, 0.033, 0.034), (0.069, 0.010, 0.058, 0.035, 0.050), (0.069, -0.035, 0.036, 0.041, 0.034), (0.069, -0.075, 0.025, 0.046, 0.025),
        (0.069, -0.100, 0.020, 0.047, 0.020)]
TOES = [  # (dx so với tâm chân; ngón cái ở trong = âm), độ dài, bán kính, độ cao z)
    (-0.028, 0.050, 0.0125, 0.0148), (-0.007, 0.042, 0.0095, 0.0125), (0.010, 0.037, 0.0088, 0.0118), (0.025, 0.033, 0.0082, 0.0110), (0.038, 0.028, 0.0075, 0.0102)]

def mir(knots): return [(-k[0],) + tuple(k[1:]) for k in knots]


def build_body(coll, mat):
    parts = [torso('t', TORSO, coll, extra=neck_rings())]
    for s in (1, -1):
        sx = lambda kn: kn if s > 0 else mir(kn)
        parts += [tube('arm', sx(ARM), coll), tube('palm', sx(PALM), coll, step=0.006), tube('thumb', sx(THUMB), coll, step=0.005),
                  tube('leg', sx(LEG), coll), tube('foot', sx(FOOT), coll, along='y', step=0.008)]
        x0, y0 = s * 0.175, -0.007
        for dy, L, r in FINGERS:   # ngón tay: ống nhỏ, hơi cong về trước ở đầu ngón
            z0 = 0.452; kn = [(x0, y0 + dy, z0, r, r), (x0, y0 + dy - 0.002, z0 - L * 0.5, r * 0.97, r * 0.97), (x0, y0 + dy - 0.006, z0 - L, r * 0.78, r * 0.78), (x0, y0 + dy - 0.007, z0 - L - 0.003, r * 0.4, r * 0.4)]
            parts.append(tube('ngon', kn, coll, step=0.004))
        for dx, L, r, zc in TOES:   # ngón chân: ống ngắn dọc theo −Y, ngón cái ở phía trong (hướng vào trục đối xứng)
            xc = (0.069 + dx) * s
            kn = [(xc, -0.090, zc, r, r), (xc, -0.090 - L * 0.55, zc - 0.001, r * 1.0, r * 0.95), (xc, -0.090 - L, zc - 0.003, r * 0.88, r * 0.82), (xc, -0.090 - L - 0.004, zc - 0.004, r * 0.45, r * 0.45)]
            parts.append(tube('ngon_chan', kn, coll, along='y', step=0.004))
    body = join(parts, 'Nam_Than'); body.data.materials.append(mat); remesh(body, 0.0035, 6); return body


# ---------------------------------------------------------------- lắp ráp + render
def build_scene():
    sc = D.build()
    cb = bpy.data.collections.new('02_Body_Base'); sc.collection.children.link(cb)
    skin = D.mat('Da_Than', D.COL['da'], 0.65, 0.08, sss_radius=(0.1, 0.05, 0.03))
    build_body(cb, skin); return sc


def visible(o): return not o.hide_render and not any(c.hide_render for c in o.users_collection)


def bbox(objs, dg):
    lo, hi = Vector((9, 9, 9)), Vector((-9, -9, -9))
    for o in objs:
        if o.type not in ('MESH', 'CURVE'): continue
        ev = o.evaluated_get(dg); me = ev.to_mesh()
        for v in me.vertices:
            w = ev.matrix_world @ v.co
            for i in range(3): lo[i] = min(lo[i], w[i]); hi[i] = max(hi[i], w[i])
        ev.to_mesh_clear()
    return lo, hi


def measure(sc):
    dg = bpy.context.evaluated_depsgraph_get(); objs = [o for o in sc.objects if o.type in ('MESH', 'CURVE') and visible(o) and o.name != 'San']
    lo, hi = bbox(objs, dg); print(f'--- Chiều cao thực đo: đáy {lo.z:.4f} → đỉnh {hi.z:.4f} m = {hi.z - lo.z:.4f} m')
    lo2, hi2 = bbox([bpy.data.objects['Nam_Than']], dg); print(f'    thân: z {lo2.z:.4f} → {hi2.z:.4f}, rộng x {lo2.x:.3f} → {hi2.x:.3f}, sâu y {lo2.y:.3f} → {hi2.y:.3f}')
    ev = bpy.data.objects['Nam_Than'].evaluated_get(dg); me = ev.to_mesh(); vs = [v.co for v in me.vertices]
    def wid(z, tol=0.004): xs = [v.x for v in vs if abs(v.z - z) < tol]; return (round(min(xs), 3), round(max(xs), 3)) if xs else None
    print('    bề ngang theo độ cao: vai z0.91', wid(0.91), '| ngực 0.80', wid(0.80), '| eo 0.70', wid(0.70), '| hông 0.58', wid(0.58), '| gối 0.29', wid(0.29), '| cổ chân 0.085', wid(0.085)); ev.to_mesh_clear(); print(f'    số đỉnh thân: {len(vs)}')


def lights(sc):
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; bg = w.node_tree.nodes['Background']; bg.inputs['Color'].default_value = D.hexc('#f4ece6'); bg.inputs['Strength'].default_value = 0.7
    def area(name, loc, size, energy, col):
        d = bpy.data.lights.new(name, 'AREA'); d.size = size; d.energy = energy; d.color = D.hexc(col)[:3]
        o = bpy.data.objects.new(name, d); sc.collection.objects.link(o); o.location = loc; o.rotation_euler = (Vector((0, 0, 0.8)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    area('Key', (-2.2, -3.4, 3.2), 3.0, 330, '#fff3e4'); area('Fill', (3.2, -2.6, 1.8), 3.5, 130, '#eef2ff'); area('Rim', (0.8, 3.4, 3.0), 2.0, 260, '#ffffff'); area('Top', (0.0, -0.6, 4.2), 2.5, 140, '#fff8f0')
    bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=2, y_segments=2, size=1.2); D.new_obj('San', bm, sc.collection, D.mat('San', '#a9a39d', 0.95))
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 24; sc.cycles.use_denoising = True; sc.view_settings.view_transform = 'AgX'; sc.view_settings.exposure = -0.3; sc.cycles.device = 'CPU'


def cam(sc, name, loc, target, scale):
    cd = bpy.data.cameras.new(name); cd.type = 'ORTHO'; cd.ortho_scale = scale; cd.clip_end = 30; o = bpy.data.objects.new(name, cd); sc.collection.objects.link(o)
    o.location = loc; o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler(); return o


if __name__ == '__main__':
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--render', default=''); ap.add_argument('--blend', default=''); ap.add_argument('--samples', type=int, default=24)
    a = ap.parse_args(argv)
    sc = build_scene()
    for c in list(sc.objects):
        if c.type in ('LIGHT', 'CAMERA'): bpy.data.objects.remove(c, do_unlink=True)
    lights(sc); sc.cycles.samples = a.samples; measure(sc)
    if a.blend: bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))
    if a.render:
        os.makedirs(a.render, exist_ok=True); zc = 0.80; R = 6.0
        full = {'truoc': (0, -R), 'goc34_phai': (R * 0.7071, -R * 0.7071), 'nghieng_phai': (R, 0), 'sau': (0, R), 'nghieng_trai': (-R, 0), 'goc34_trai': (-R * 0.7071, -R * 0.7071)}
        sc.render.resolution_x, sc.render.resolution_y = 560, 900
        for n, (x, y) in full.items():
            sc.camera = cam(sc, n, (x, y, zc), (0, 0, zc), 1.72); sc.render.filepath = os.path.join(a.render, f'{n}.png'); bpy.ops.render.render(write_still=True)
        sc.render.resolution_x = sc.render.resolution_y = 700
        for n, loc, tg, scl in (('can_co_vai_truoc', (0, -4, 0.98), (0, 0, 0.98), 0.62), ('can_co_vai_34', (2.8, -2.8, 0.98), (0, 0, 0.98), 0.62), ('can_ban_tay', (4, -2, 0.50), (0.17, 0, 0.48), 0.34),
                                ('can_ban_chan', (3, -3, 0.07), (0.067, -0.04, 0.06), 0.34), ('can_than_nghieng', (4, 0, 0.74), (0, 0, 0.74), 0.62)):
            sc.camera = cam(sc, n, loc, tg, scl); sc.render.filepath = os.path.join(a.render, f'{n}.png'); bpy.ops.render.render(write_still=True)
