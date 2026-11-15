"""NAM-002 — dựng 10 bộ quần áo (QA.OUTFITS của dung_quan_ao_nam.py) từ lát cắt thân thật, dáng nghỉ chữ T.

Cách dựng: vỏ thân (các vòng siêu elip theo lát cắt + khoảng dư, dáng hộp: rộng không nhỏ hơn ngực) và ống tay dọc trục
vai→cổ tay (hoặc thân quần + hai ống chân) được hợp khối bằng remesh voxel → một lưới kín liền mạch ở nách/đáy, rồi cắt
mở cổ/gấu/ống, làm mượt và đẩy ra khỏi da ≥ CLEAR_MIN. Chi tiết (túi, nẹp, viền, bo, sọc, phù hiệu) là mảng cắt từ vỏ
áo/quần nổi 2,5 mm; mũ hoodie là vỏ elip quanh đầu; tất, quai dép lấy từ da chân nổi ra; đế dép là khối dưới bàn chân.

Chạy:  <bpy python> may_quan_ao.py --bo xanh [--anh out/nghi] [--blend out/xanh.blend]
"""
import sys, os, math, argparse
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', 'episodes', 'hem-co-chuyen', 'ho-so-02-nguoi-lam-thay', 'assets', 'nhan-vat-3d')))
import bpy, bmesh
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree
import do_than as DT
import dung_quan_ao_nam as QA

J = DT.J
DU = dict(than=0.022, tay=0.020, ong_quan=0.030, quan_dui=0.035)   # khoảng dư dáng rộng (m)
CLEAR_MIN = 0.006            # vải cách da tối thiểu lúc nghỉ
VOXEL = 0.007                # cỡ voxel hợp khối
N_RING = 32
Z_GAU_AO = 0.875             # gấu áo
Z_CAP = 0.965                # cạp quần (gấu áo thấp hơn ≥ 6 cm → còn chồng khi giơ tay)


# ------------------------------------------------------------------ hình học cơ bản
def _ring_se(z, w, f, b, yc, n=2.2, N=N_RING):
    P = []
    for i in range(N):
        a = 2 * math.pi * i / N; ca, sa = math.cos(a), math.sin(a)
        x = w * math.copysign(abs(ca) ** (2 / n), ca); r = f if sa < 0 else b
        P.append((x, yc + r * math.copysign(abs(sa) ** (2 / n), sa), z))
    return np.array(P)


def _ring_axis(c, d, r, N=N_RING):
    d = np.array(d) / np.linalg.norm(d); up = np.array((0, 0, 1.0)) if abs(d[2]) < 0.9 else np.array((0, 1.0, 0))
    X = np.cross(d, up); X /= np.linalg.norm(X); Y = np.cross(X, d)
    return np.array([np.array(c) + r[0] * math.cos(2 * math.pi * i / N) * X + r[1] * math.sin(2 * math.pi * i / N) * Y for i in range(N)])


def _loft(bm, rings, cap=(True, True)):
    V = [[bm.verts.new(p) for p in R] for R in rings]; N = len(rings[0])
    for a, b in zip(V[:-1], V[1:]):
        for i in range(N): bm.faces.new((a[i], a[(i + 1) % N], b[(i + 1) % N], b[i]))
    for k, ok in ((0, cap[0]), (-1, cap[1])):
        if ok: bm.faces.new(V[k] if k else V[k][::-1])


def _obj(name, bm, coll, mat=None):
    me = bpy.data.meshes.new(name); bm.normal_update(); bm.to_mesh(me); bm.free(); ob = bpy.data.objects.new(name, me); coll.objects.link(ob)
    if mat: me.materials.append(mat)
    for p in me.polygons: p.use_smooth = True
    return ob


def _remesh(ob, voxel=VOXEL):
    m = ob.modifiers.new('rm', 'REMESH'); m.mode = 'VOXEL'; m.voxel_size = voxel; m.use_smooth_shade = True
    dg = bpy.context.evaluated_depsgraph_get(); me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg)); ob.modifiers.remove(m)
    old = ob.data; ob.data = me; bpy.data.meshes.remove(old)


def _cut(ob, keep, smooth=6):
    """Xoá đỉnh keep(co)=False, giữ mảnh lớn nhất, làm mượt toàn lưới + mép."""
    bm = bmesh.new(); bm.from_mesh(ob.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not keep(np.array(v.co))], context='VERTS')
    _largest(bm); bmesh.ops.smooth_vert(bm, verts=bm.verts[:], factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True) if smooth else None
    for _ in range(smooth):
        bnd = [v for v in bm.verts if v.is_boundary]
        bmesh.ops.smooth_vert(bm, verts=bnd, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
    bm.to_mesh(ob.data); bm.free()


def _largest(bm):
    bm.verts.ensure_lookup_table(); comp = {}; cid = 0
    for v in bm.verts:
        if v.index in comp: continue
        st = [v]
        while st:
            u = st.pop()
            if u.index in comp: continue
            comp[u.index] = cid; st += [e.other_vert(u) for e in u.link_edges]
        cid += 1
    if cid > 1:
        cnt = np.bincount(list(comp.values())); keep = int(cnt.argmax())
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if comp[v.index] != keep], context='VERTS')


def _co(ob):
    a = np.zeros(len(ob.data.vertices) * 3); ob.data.vertices.foreach_get('co', a); return a.reshape(-1, 3)


def _set_co(ob, P):
    ob.data.vertices.foreach_set('co', P.ravel()); ob.data.update()


def push_out(ob, bvh, clear=CLEAR_MIN, it=4):
    """Đỉnh vải nằm trong da hoặc gần hơn `clear` được đưa ra theo pháp tuyến da; xen kẽ làm mượt nhẹ."""
    for k in range(it):
        P = _co(ob); moved = 0
        for i, p in enumerate(P):
            loc, nor, _, d = bvh.find_nearest(Vector(p))
            if loc is None: continue
            s = (Vector(p) - loc).dot(nor)
            if s < clear: P[i] = np.array(loc + nor * clear); moved += 1
        _set_co(ob, P)
        if not moved: break
        bm = bmesh.new(); bm.from_mesh(ob.data); bmesh.ops.smooth_vert(bm, verts=bm.verts[:], factor=0.3, use_axis_x=True, use_axis_y=True, use_axis_z=True); bm.to_mesh(ob.data); bm.free()
    P = _co(ob)
    for i, p in enumerate(P):                          # lượt cuối không làm mượt: bảo đảm khoảng cách
        loc, nor, _, d = bvh.find_nearest(Vector(p))
        if loc is not None and (Vector(p) - loc).dot(nor) < clear: P[i] = np.array(loc + nor * clear)
    _set_co(ob, P)


def patch(src, name, mask, coll, mat, off=0.0025):
    """Mảng chi tiết: các mặt của src có mọi đỉnh thoả mask(co), tách thành vật thể riêng nổi `off` theo pháp tuyến."""
    bm = bmesh.new(); bm.from_mesh(src.data); bm.normal_update()
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if not all(mask(np.array(v.co)) for v in f.verts)], context='FACES_ONLY')
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    if not bm.verts: bm.free(); return None
    _largest(bm)
    for v in bm.verts: v.co += v.normal * off
    return _obj(name, bm, coll, mat)


# ------------------------------------------------------------------ thân / tay / chân
def _torso_levels(sd, z0, z1):
    return [L for L in sd['torso'] if z0 - 1e-6 <= L['z'] <= z1 + 1e-6]


def _box(levels, z_chest=1.20):
    """Dáng hộp: dưới ngực, rộng/dày không nhỏ hơn mức ngực (áo suông, không bó eo)."""
    ch = min(levels, key=lambda L: abs(L['z'] - z_chest)); out = []
    for L in levels:
        L = dict(L)
        if L['z'] < ch['z']:
            L['w'] = max(L['w'], ch['w'] * 0.97); L['f'] = max(L['f'], ch['f'] * 0.95); L['b'] = max(L['b'], ch['b'] * 0.95)
        out.append(L)
    return out


def shirt_shell(sd, coll, mat, name, du=DU['than'], du_tay=DU['tay'], sleeve='short', z_gau=Z_GAU_AO, neck=('crew', 0.0)):
    bm = bmesh.new(); sh_z = J['shoulder'][2]
    lv = _box(_torso_levels(sd, z_gau - 0.02, J['neck'][2]))
    rings = []
    for L in lv:
        d = du if L['z'] <= sh_z else du * 0.6                                       # dốc vai: ôm hơn
        rings.append(_ring_se(L['z'], L['w'] + d, L['f'] + d, L['b'] + d, L['yc']))
    _loft(bm, rings)
    A = sd['arm']; a0 = np.array(J['shoulder']); d = np.array(J['wrist']) - a0; Ltay = np.linalg.norm(d); d /= Ltay
    u_end = 0.45 * Ltay if sleeve == 'short' else Ltay - 0.01
    r_box = max(R['r'] for R in A[:3])
    for s in (1, -1):
        rs = []
        for u in np.arange(-0.05, u_end + 1e-6, 0.02):
            R = min(A, key=lambda R: abs(R['u'] - max(u, 0)))
            r = (max(R['r'], r_box * (0.92 if sleeve == 'short' else 0.75)) + du_tay)
            c = np.array(R['c']) + d * (u - R['u']); c[0] *= s
            rs.append(_ring_axis(c, d * np.array((s, 1, 1)), (r, r)))
        rs.append(_ring_axis(np.array(rs[-1]).mean(0) + d * np.array((s, 1, 1)) * 0.02, d * np.array((s, 1, 1)), (r, r)))
        _loft(bm, rs)
    ob = _obj(name, bm, coll, mat); _remesh(ob)
    kind, extra = neck; nl = sd['co']; r_neck = max(nl['w'], (nl['f'] + nl['b']) / 2)
    r_hole = r_neck + {'crew': 0.012, 'wide_crew': 0.035, 'vneck': 0.012, 'polo_shirt': 0.010, 'stand_zip': 0.012, 'hoodie': 0.016}.get(kind, 0.012) + extra
    nc = np.array((nl["x"], nl["yc"]))

    def keep(p):
        if p[2] < z_gau: return False
        if p[2] > 1.24 and np.hypot(p[0] - nc[0], p[1] - nc[1]) < r_hole: return False
        if kind == 'vneck' and p[1] < nc[1] and p[2] > 1.19 + 2.2 * abs(p[0]): return False
        ax = abs(p[0])
        if ax > J['shoulder'][0] - 0.03:
            u = (np.array((ax, p[1], p[2])) - a0) @ d
            if u > u_end: return False
        return True
    _cut(ob, keep)
    ob['u_end'] = float(u_end); ob['z_gau'] = float(z_gau); ob['r_co'] = float(r_hole)
    return ob


def pants_shell(sd, coll, mat, name, kind='long', du=DU['ong_quan']):
    bm = bmesh.new()
    lv = _torso_levels(sd, sd['torso'][0]['z'], Z_CAP + 0.03)
    _loft(bm, [_ring_se(L['z'], L['w'] + DU['quan_dui'] * 0.6, L['f'] + DU['quan_dui'] * 0.6, L['b'] + DU['quan_dui'] * 0.6, L['yc']) for L in lv])
    G = sd['leg']; z_end = {'long': J['ankle'][2] + 0.035, 'jogger': J['ankle'][2] + 0.03, 'short': J['knee'][2] + 0.06}[kind]
    r_top = max(G[0]['rx'], G[0]['ry'])
    for s in (1, -1):
        rs = []
        for L in G:
            if L['z'] < z_end - 0.03: break
            if kind == 'jogger' and L['z'] < J['knee'][2]: rx = ry = max(L['rx'], L['ry']) + du * (0.4 + 0.6 * (L['z'] - z_end) / (J['knee'][2] - z_end))
            else: rx = max(L['rx'], r_top * 0.80) + du; ry = max(L['ry'], r_top * 0.80) + du
            c = np.array(L['c']); c[0] *= s; rs.append(_ring_se(c[2], rx, ry, ry, c[1], n=2.0) + np.array((c[0], 0, 0)))
        _loft(bm, rs)
    ob = _obj(name, bm, coll, mat); _remesh(ob)
    _cut(ob, lambda p: z_end <= p[2] <= Z_CAP)
    ob['z_end'] = float(z_end)
    return ob


# ------------------------------------------------------------------ bộ đồ
def build_outfit(sc, body, sd, name):
    cfg = QA.OUTFITS[name]; coll = bpy.data.collections.get(f'Quan_Ao_{name}')
    if coll:
        for o in list(coll.objects): bpy.data.objects.remove(o, do_unlink=True)
    else: coll = bpy.data.collections.new(f'Quan_Ao_{name}'); sc.collection.children.link(coll)
    dg = bpy.context.evaluated_depsgraph_get(); bvh = BVHTree.FromObject(body, dg)
    M = lambda k, c, **kw: QA.mat_cloth(f'{name}_{k}', c, **kw)
    out = []
    jacket = cfg.get('open_jacket'); sleeve = cfg.get('sleeve_len', 'short')
    if jacket:
        inner = shirt_shell(sd, coll, M('trong', cfg['inner_shirt']), 'Ao_Trong', du=0.010, du_tay=0.009, sleeve='short', z_gau=Z_GAU_AO + 0.01)
        push_out(inner, bvh); out.append(inner)
    ao = shirt_shell(sd, coll, M('ao', cfg['shirt']), 'Ao', du=DU['than'] + (0.012 if jacket else 0), du_tay=DU['tay'] + (0.010 if jacket else 0),
                     sleeve=sleeve, neck=(cfg.get('collar_type', 'crew'), 0.02 if jacket else 0.0))
    if jacket:
        _cut(ao, lambda p: not (p[1] < 0 and abs(p[0]) < 0.022 and p[2] > Z_GAU_AO - 0.01), smooth=3)     # mở vạt trước
    push_out(ao, bvh); out.append(ao)
    if jacket: push_out(ao, BVHTree.FromObject(out[0], bpy.context.evaluated_depsgraph_get()), clear=0.004, it=2)
    quan = pants_shell(sd, coll, M('quan', cfg['pants']), 'Quan', kind=cfg.get('pants_len', 'long'))
    push_out(quan, bvh); out.append(quan)
    # chi tiết
    col = M('vien', cfg.get('collar', cfg['shirt']))
    a0 = np.array(J['shoulder']); d = np.array(J['wrist']) - a0; d /= np.linalg.norm(d)
    uax = lambda p: (np.array((abs(p[0]), p[1], p[2])) - a0) @ d
    if cfg.get('pocket'): out.append(patch(ao, 'Tui', lambda p: 0.035 < p[0] < 0.105 and 1.10 < p[2] < 1.19 and p[1] < -0.02, coll, M('tui', cfg['shirt'])))
    if cfg.get('kangaroo'): out.append(patch(ao, 'Tui', lambda p: abs(p[0]) < 0.10 and 0.92 < p[2] < 1.04 and p[1] < -0.03, coll, M('tui', cfg['shirt'])))
    if cfg.get('badge'): out.append(patch(ao, 'Phu_Hieu', lambda p: -0.105 < p[0] < -0.060 and 1.14 < p[2] < 1.18 and p[1] < -0.02, coll, QA.mat_simple(f'{name}_badge', cfg['badge'])))
    if cfg.get('placket'): out.append(patch(ao, 'Nep', lambda p: abs(p[0]) < 0.014 and 1.12 < p[2] < 1.30 and p[1] < 0, coll, col))
    if cfg.get('sleeve_trim') or cfg.get('cuff_rib'):
        ue = ao['u_end']; out.append(patch(ao, 'Vien_Tay', lambda p: abs(p[0]) > 0.15 and uax(p) > ue - 0.022, coll, M('vien_tay', cfg.get('sleeve_trim') or cfg['collar'])))
    if cfg.get('cuff_rib') and cfg.get('pants_len') == 'jogger':
        ze = quan['z_end']; out.append(patch(quan, 'Bo_Ong', lambda p: p[2] < ze + 0.03, coll, M('bo', cfg['pants'])))
    if cfg.get('stripe'):
        out.append(patch(quan, 'Soc', lambda p: abs(p[0]) > 0.12 and abs(p[1] - 0.005) < 0.012 and p[2] < 0.90, coll, M('soc', cfg['stripe'])))
    if cfg.get('collar_type') in ('polo_shirt', 'stand_zip', 'hoodie'):
        rc = ao['r_co']; nc = (sd['co']['x'], sd['co']['yc']); out.append(patch(ao, 'Co_Ao', lambda p: p[2] > 1.22 and np.hypot(p[0] - nc[0], p[1] - nc[1]) < rc + 0.025, coll, col))
    if cfg.get('hood'):
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=40, v_segments=24, radius=1.0)
        for v in bm.verts: v.co = Vector((v.co.x * 0.125, 0.045 + v.co.y * 0.135, 1.49 + v.co.z * 0.17))
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < 1.30 or (v.co.y < -0.02 and v.co.z > 1.36)], context='VERTS')
        hood = _obj('Mu', bm, coll, M('mu', cfg['shirt'])); push_out(hood, bvh, clear=0.012); out.append(hood)
    if cfg.get('high_socks'):
        for s, k in ((1, 'L'), (-1, 'R')):
            t = patch(body, f'Tat.{k}', lambda p, s=s: s * p[0] > 0.02 and 0.05 < p[2] < 0.42, coll, M('tat', cfg['high_socks']), off=0.003)
            if t: out.append(t)
    for s, k in ((1, 'L'), (-1, 'R')):                                   # dép: đế dưới bàn chân + quai từ da mu bàn chân
        x0 = s * J['ball'][0]; bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=1.0)
        for v in bm.verts: v.co = Vector((x0 + v.co.x * 0.10, -0.045 + v.co.y * 0.27, -0.008 + v.co.z * 0.016))
        out.append(_obj(f'Dep.{k}', bm, coll, QA.mat_simple(f'{name}_de', cfg.get('sole', '#353937'))))
        q = patch(body, f'Quai.{k}', lambda p, s=s: s * p[0] > 0.02 and -0.10 < p[1] < -0.06 and 0.008 < p[2] < 0.07, coll, QA.mat_simple(f'{name}_quai', cfg.get('sandal', '#425850')), off=0.003)
        if q: out.append(q)
    out = [o for o in out if o is not None]
    for o in out:
        if o.name.startswith(('Ao', 'Quan', 'Mu')):
            s_ = o.modifiers.new('Solidify', 'SOLIDIFY'); s_.thickness = 0.003; s_.offset = 1.0
    return out


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--bo', default='xanh'); ap.add_argument('--blend', default=''); a = ap.parse_args(argv)
    sc, arm, body = DT.load_rig(); sd = DT.measure(body, save=False); cl = build_outfit(sc, body, sd, a.bo)
    print('dựng:', [(o.name, len(o.data.vertices)) for o in cl])
    if a.blend: bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))


if __name__ == '__main__':
    main()
