"""NAM-002 — đo quần áo khi chuyển động: da xuyên vải, vướng (vải tự cắt / vải cắt vải), rách (giãn/co cạnh, mặt lật), lộ da.

Chạy:  <bpy python> kiem_tra.py --bo xanh|all [--khong-anh]
Đầu ra: out/<bộ>/ket-qua.json, ảnh out/<bộ>/*.png, bảng anh/<bộ>.webp
Ngưỡng (spec): xuyên sâu > 1 mm, vướng ≥ 1 cặp mặt mới so với lúc nghỉ, rách: cạnh > 1,6× hoặc < 0,5×, mặt lật; lộ da: đỉnh da
lúc nghỉ được che (tia pháp tuyến chạm vải ≤ 6 cm) mà ở dáng đang đo tia ra/vào đều không chạm vải; xuyên: tia ra không chạm, tia vào chạm vải sâu > 1 mm.
"""
import sys, os, json, math, subprocess, argparse
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import bpy
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree
import do_than as DT
import may_quan_ao as MQ
import gan_rig as GR
import chup as CH

RG = DT.RG
WALK = os.path.join(DT.OUT, 'nam-002-di-bo.blend')
XUYEN_MM = 1.0
GIAN, CO = 1.6, 0.5
COVER = 0.06
N_KHUNG = 32
HUONG_MAY = [(0, -1, 0), (0, 1, 0), (1, 0, 0), (-1, 0, 0), (0, 0, 1), (0, -0.7, -0.7), (0, 0.7, -0.7)]
STRIDE = 3             # đo trên 1/3 số đỉnh da (lưới 128k đỉnh, mật độ ~3 mm)


def _tay_truoc(a): RG.arms(a, 80, 80)
def _cui(a): RG.rot_world(a, 'Spine', (1, 0, 0), 15); RG.rot_world(a, 'Spine1', (1, 0, 0), 15)


EXTRA = {'tay_truoc_80': _tay_truoc, 'cui_30': _cui, 'dang_dung': lambda a: RG.arms(a, MQ.DANG_DUNG)}
TU_THE = ('tay_buong', 'tay_xien_45', 'gio_tay_cao', 'tay_truoc_80', 'khuyu_gap', 'nam_tay', 'buoc_chan', 'ngoi_xom', 'cui_30', 'xoay_than')


def load_walk():
    if not os.path.exists(WALK):
        DT.load_rig()
        subprocess.run([sys.executable, os.path.join(DT.NAM, 'di_bo_nam002.py'), '--rig', DT.RIG, '--out', WALK], check=True, cwd=DT.NAM)
    return DT.load_rig(WALK)


def set_pose(sc, arm, ten):
    """ten: tên dáng tĩnh (TU_THE / 'nghi_T') hoặc 'khung_<n>' (vòng đi bộ)."""
    ad = arm.animation_data
    if ten.startswith('khung_'):
        if ad and arm.get('_act'): ad.action = bpy.data.actions[arm['_act']]
        RG.reset(arm); sc.frame_set(int(ten[6:])); return
    if ad and ad.action: arm['_act'] = ad.action.name; ad.action = None
    for b in arm.pose.bones: b.rotation_quaternion = (1, 0, 0, 0); b.scale = (1, 1, 1)    # xương ở chế độ quaternion: RG.reset chỉ xoá euler → còn tư thế khung đi bộ
    RG.reset(arm)
    if ten in EXTRA: EXTRA[ten](arm)
    elif ten != 'nghi_T': RG.POSES[ten](arm)
    bpy.context.view_layer.update()


def _eval(ob, mods_off=('SOLIDIFY',)):
    off = [m for m in ob.modifiers if m.type in mods_off and m.show_viewport]
    for m in off: m.show_viewport = False
    dg = bpy.context.evaluated_depsgraph_get(); ev = ob.evaluated_get(dg); me = ev.to_mesh()
    P = np.array([v.co[:] for v in me.vertices]); polys = [tuple(p.vertices) for p in me.polygons]; ev.to_mesh_clear()
    for m in off: m.show_viewport = True
    return (np.array([ob.matrix_world @ Vector(p) for p in P]) if ob.matrix_world != ob.matrix_world.Identity(4) else P), polys


def _normals(P, polys, n):
    N = np.zeros((n, 3))
    for f in polys:
        c = np.cross(P[f[1]] - P[f[0]], P[f[-1]] - P[f[0]])
        for v in f: N[v] += c
    return N / np.linalg.norm(N, axis=1, keepdims=True).clip(1e-12)


class Do:
    """Giữ số liệu lúc nghỉ (vùng che, độ dài cạnh, giao lúc nghỉ) cho một bộ đồ đã gắn rig."""

    def __init__(self, sc, arm, body, clothes):
        self.sc, self.arm, self.body = sc, arm, body
        self.cl = [o for o in clothes if not o.name.startswith(('Dep', 'Quai'))]
        set_pose(sc, arm, 'dang_dung')       # mốc = dáng dựng vải (tay xiên 65°)
        self.ed = {o.name: np.array([e.vertices[:] for e in o.data.edges]) for o in self.cl}
        Pb, pb = _eval(body, ()); self.bpoly = pb
        Nb = _normals(Pb, pb, len(Pb)); C = self._cloth()
        self.l0 = {o.name: np.linalg.norm(C[o.name][0][self.ed[o.name][:, 0]] - C[o.name][0][self.ed[o.name][:, 1]], axis=1) for o in self.cl}
        self.fn0 = {o.name: self._fnorm(*C[o.name]) for o in self.cl}
        hit = self._ray(Pb, Nb, C, np.arange(0, len(Pb), STRIDE)); self.cover = np.nonzero(hit)[0]
        names = {g.index: g.name for g in body.vertex_groups}; wa = np.zeros(len(Pb))           # da tay (weight xương tay > 0,5): lộ khi giơ tay là thiết kế áo cộc
        for v in body.data.vertices:
            wa[v.index] = sum(g.weight for g in v.groups if names[g.group].startswith(('Left', 'Right')) and not names[g.group].endswith(('UpLeg', 'Leg', 'Foot', 'ToeBase')))
        self.da_tay = wa > 0.5
        self.hits0 = self._overlaps(C)

    def _cloth(self):
        return {o.name: _eval(o) for o in self.cl}

    @staticmethod
    def _fnorm(P, polys):
        return np.array([np.cross(P[f[1]] - P[f[0]], P[f[-1]] - P[f[0]]) for f in polys])

    def _ray(self, Pb, Nb, C, idx=None):
        idx = np.arange(len(Pb)) if idx is None else idx; trees = [BVHTree.FromPolygons([tuple(p) for p in P], f) for P, f in C.values()]; hit = np.zeros(len(Pb), bool)
        for i in idx:
            o = Vector(Pb[i] + Nb[i] * 0.0005); d = Vector(Nb[i])
            for t in trees:
                if t.ray_cast(o, d, COVER)[0] is not None: hit[i] = True; break
        return hit

    def _overlaps(self, C):
        trees = {k: (BVHTree.FromPolygons([tuple(p) for p in P], f), f) for k, (P, f) in C.items()}; out = set(); ks = list(trees)
        for i, a in enumerate(ks):
            for b in ks[i:]:
                ta, fa = trees[a]; tb, fb = trees[b]
                for x, y in ta.overlap(tb):
                    if a == b and (x >= y or set(fa[x]) & set(fa[y])): continue
                    out.add((a, b, x, y))
        return out

    @staticmethod
    def _thay(o, n, trees, tb):
        """Da nhìn thấy được: theo ít nhất một hướng máy (4 hướng ngang, trên, xiên dưới) nằm cùng phía pháp tuyến, tia không vướng vải hay thân."""
        for d in HUONG_MAY:
            d = Vector(d)
            if d.dot(n) <= 0.1: continue
            s = o + n * 0.001
            if tb.ray_cast(s, d, 3.0)[0] is not None: continue
            if any(t.ray_cast(s, d, 3.0)[0] is not None for t in trees): continue
            return True
        return False

    def do(self, ten):
        set_pose(self.sc, self.arm, ten)
        Pb, pb = _eval(self.body, ()); Nb = _normals(Pb, pb, len(Pb)); C = self._cloth(); r = dict(ten=ten)
        # theo tia: ra ngoài (pháp tuyến da) chạm vải ≤ COVER → còn che; không chạm mà tia vào trong chạm vải ≤ 5 cm → da đã xuyên
        # qua vải (độ sâu = khoảng tới chỗ chạm); không chạm cả hai → lộ da
        trees = [BVHTree.FromPolygons([tuple(p) for p in P], f) for P, f in C.values()]; xu = []; lo = []
        tb = BVHTree.FromPolygons([tuple(p) for p in Pb], pb)                     # thân: che khuất + giới hạn tia vào
        for i in self.cover:
            o = Vector(Pb[i]); n = Vector(Nb[i])
            if any(t.ray_cast(o + n * 0.0005, n, COVER)[0] is not None for t in trees): continue
            hb = tb.ray_cast(o - n * 0.0005, -n, 0.05); lim = hb[3] if hb[0] is not None else 0.05     # vải phải nằm trước chỗ tia ra khỏi thân
            hs = [t.ray_cast(o - n * 0.0005, -n, lim) for t in trees]; ds = [h[3] for h in hs if h[0] is not None]
            if ds and min(ds) * 1000 > XUYEN_MM: xu.append((int(i), round(min(ds) * 1000, 1)))
            elif not ds and not self.da_tay[i] and self._thay(o, n, trees, tb): lo.append(int(i))
        r['xuyen'] = len(xu); r['xuyen_max_mm'] = max([x[1] for x in xu], default=0.0); r['xuyen_vi_tri'] = _vt(Pb, [x[0] for x in xu])
        r['lo_da'] = len(lo); r['lo_da_vi_tri'] = _vt(Pb, lo)
        # vướng: cặp mặt giao mới so với lúc nghỉ
        h = self._overlaps(C) - self.hits0; r['vuong'] = len(h); r['vuong_vat'] = sorted({f'{a}~{b}' for a, b, _, _ in h})[:6]
        # rách: giãn/co cạnh, mặt lật
        g = c = lat = 0; gmax = 1.0
        for o in self.cl:
            P, f = C[o.name]; e = self.ed[o.name]; st = np.linalg.norm(P[e[:, 0]] - P[e[:, 1]], axis=1) / self.l0[o.name].clip(1e-9)
            g += int((st > GIAN).sum()); c += int((st < CO).sum()); gmax = max(gmax, float(st.max()))
            fn = self._fnorm(P, f); fl = ((fn * self.fn0[o.name]).sum(1) < 0); lat += int(fl.sum())
            bad = np.unique(e[(st > GIAN) | (st < CO)].ravel()); P0 = np.array([v.co[:] for v in o.data.vertices])
            if len(bad) or fl.any(): r.setdefault('theo_manh', {})[o.name] = dict(gian_co=int(((st > GIAN) | (st < CO)).sum()), lat=int(fl.sum()), vi_tri=_vt(P0, bad.tolist()))
        r.update(rach_gian=g, rach_co=c, rach_lat=lat, gian_max=round(gmax, 2))
        r['dat'] = r['xuyen'] == 0 and r['lo_da'] == 0 and r['vuong'] == 0 and g == 0 and c == 0 and lat == 0
        return r


def _vt(P, idx):
    if not idx: return ''
    Q = P[idx]; return f'x {Q[:, 0].min():+.2f}…{Q[:, 0].max():+.2f} z {Q[:, 2].min():.2f}…{Q[:, 2].max():.2f}'


def chay(name, anh=True, khung=range(1, N_KHUNG + 1)):
    sc, arm, body = load_walk(); sd = DT.measure(body, save=False); cl = MQ.build_outfit(sc, body, sd, name, arm=arm)
    D = Do(sc, arm, body, cl); res = []
    for t in ('dang_dung', 'nghi_T') + TU_THE + tuple(f'khung_{k}' for k in khung):
        r = D.do(t); res.append(r)
        print(f'  {name:12s} {t:12s} {"ĐẠT" if r["dat"] else "LỖI"}  xuyên {r["xuyen"]:4d} ({r["xuyen_max_mm"]} mm)  lộ {r["lo_da"]:4d}  vướng {r["vuong"]:4d}  giãn {r["rach_gian"]:4d} (max {r["gian_max"]})  co {r["rach_co"]:4d}  lật {r["rach_lat"]:3d}', flush=True)
    od = os.path.join(DT.OUT, name); os.makedirs(od, exist_ok=True); json.dump(res, open(os.path.join(od, 'ket-qua.json'), 'w'), ensure_ascii=False, indent=1)
    if anh:
        CH.setup(sc); rows = []
        for t in ('tay_buong', 'gio_tay_cao', 'tay_truoc_80', 'khuyu_gap', 'ngoi_xom', 'buoc_chan'):
            set_pose(sc, arm, t); rows.append((t, [CH.shot(sc, os.path.join(od, f'{t}_{v}.png'), v) for v in ('truoc', 'nghieng', 'sau')]))
        ps = []
        for k in (1, 9, 17, 25):
            set_pose(sc, arm, f'khung_{k}'); ps.append(CH.shot(sc, os.path.join(od, f'khung_{k}.png'), 'nghieng'))
        rows.append(('di_bo 1/9/17/25', ps)); os.makedirs(os.path.join(HERE, 'anh'), exist_ok=True)
        CH.ghep(rows, os.path.join(HERE, 'anh', f'{name}.webp'), cell=(120, 184))
    return res


if __name__ == '__main__':
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--bo', default='xanh'); ap.add_argument('--khong-anh', action='store_true'); ap.add_argument('--nhanh', action='store_true', help='4 khung đi bộ (1, 9, 17, 25)'); a = ap.parse_args(argv)
    for nm in (list(MQ.QA.OUTFITS) if a.bo == 'all' else a.bo.split(',')):
        chay(nm, anh=not a.khong_anh, khung=(1, 9, 17, 25) if a.nhanh else range(1, N_KHUNG + 1))
