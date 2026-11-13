"""NAM — THÂN DỰNG BẰNG CONTROL CAGE (thiết kế: THIET-KE-THAN-CAGE.md, kế hoạch: KE-HOACH-THAN-CAGE.md).

Chạy:  D:/blender/blender.exe -b --factory-startup --python dung_than_cage_nam.py -- [--check] [--render DIR] [--blend FILE] [--samples N] [--mau ẢNH] [--phong-dir DIR]
Đơn vị m, sàn Z = 0, mặt −Y, trái nhân vật = +X. Đầu/tóc/mặt từ dung_dau_nam.py (không sửa), phóng đều HEAD_K như v2.11.

Cấu trúc
  00_Than_Cu_v211 (ẩn render): Nam_Dau_Than_v211 + Nam_Than_goc — bản cũ dựng lại bằng dung_than_nam.py để đối chiếu.
  02_Body_Base: Nam_Than_Cage (nửa cage, Mirror + Subdivision 1, sửa được), Nam_Dau_Than (bản lắp ráp), Nam_BanTay.L/.R, Nam_BanChan.L/.R.
Chỉ đạt hình khối tĩnh; chưa rig, chưa kiểm biến dạng.
"""
import sys, os, math, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from mathutils.kdtree import KDTree
import dung_dau_nam as D
import dung_than_nam as T

KZ = T.KZ
H_TARGET, H_TOL = 1.6004, 0.001
GAP_MIN = 0.004                                   # khe nách / khe háng tối thiểu (m)
OLD_COLL, NEW_COLL = '00_Than_Cu_v211', '02_Body_Base'


# ================================================================== bản cũ
def build_old():
    sc = T.build_scene(voxel=0.0025)
    c = bpy.data.collections[NEW_COLL]; c.name = OLD_COLL; c.hide_render = True
    bpy.data.objects['Nam_Dau_Than'].name = 'Nam_Dau_Than_v211'
    sc.collection.children.link(bpy.data.collections.new(NEW_COLL))
    return sc


# ================================================================== đo
def _mesh_world(ob, dg=None):
    dg = dg or bpy.context.evaluated_depsgraph_get(); ev = ob.evaluated_get(dg); me = ev.to_mesh()
    vs = [ev.matrix_world @ v.co for v in me.vertices]; return ev, me, vs


def _attr(me, name):
    a = me.attributes.get(name)
    if not a: return None
    out = [0.0] * len(me.vertices); a.data.foreach_get('value', out); return out


def body_levels():
    """Các mức đo thân (tên, z thế giới): theo CAGE_LEVELS nếu có, không thì theo bảng TORSO của v2.11."""
    lv = globals().get('CAGE_LEVELS')
    if lv: return [(l['ten'], l['z']) for l in lv]
    return [(n, z * KZ) for n, z in (('chan_co', 0.95), ('vai', 0.90), ('nguc', 0.85), ('duoi_nguc', 0.79), ('bung', 0.70), ('eo', 0.63), ('chau', 0.565), ('day_chau', 0.50))]


def widths_table(ob):
    """Bề ngang toàn phần (bỏ tay), nhô trước (−y) và sau (+y) của thân theo các mức; bỏ tay bằng thuộc tính `tay` nếu có,
    không thì giữ cụm đỉnh liền từ đường giữa ra (dừng ở khe |x| > 6 mm đầu tiên = khe nách)."""
    ev, me, vs = _mesh_world(ob); tay = _attr(me, 'tay'); ev.to_mesh_clear(); out = {}
    for name, z in body_levels():
        pts = [v for i, v in enumerate(vs) if abs(v.z - z) < 0.004 and (tay is None or tay[i] < 0.5)]
        if tay is None and pts:
            xs = sorted(abs(p.x) for p in pts); lim = xs[-1]
            for a_, b_ in zip(xs, xs[1:]):
                if b_ - a_ > 0.006: lim = a_; break
            pts = [p for p in pts if abs(p.x) <= lim]
        out[name] = (round(z, 3), round(2 * max(abs(p.x) for p in pts), 3), round(-min(p.y for p in pts), 3), round(max(p.y for p in pts), 3)) if pts else None
    return out


def _height(sc):
    objs = [o for o in sc.objects if o.type in ('MESH', 'CURVE') and T.visible(o) and o.name != 'San' and o.name != 'Nam_Than_Cage']
    lo, hi = T.bbox(objs, bpy.context.evaluated_depsgraph_get()); return lo.z, hi.z


def _boundary_loops(bm):
    edges = [e for e in bm.edges if len(e.link_faces) == 1]; seen, loops = set(), []
    for e in edges:
        if e.index in seen: continue
        stack, n = [e], 0
        while stack:
            x = stack.pop()
            if x.index in seen: continue
            seen.add(x.index); n += 1
            for v in x.verts:
                stack += [y for y in v.link_edges if len(y.link_faces) == 1 and y.index not in seen]
        loops.append(n)
    return loops


def _slice_gap(vs, a_idx, b_idx, z0, z1):
    """Khoảng cách nhỏ nhất giữa hai tập đỉnh trong dải z0..z1 (KD tree)."""
    A = [vs[i] for i in a_idx if z0 <= vs[i].z <= z1]; B = [vs[i] for i in b_idx if z0 <= vs[i].z <= z1]
    if not A or not B: return None
    kd = KDTree(len(B))
    for i, p in enumerate(B): kd.insert(p, i)
    kd.balance(); return min(kd.find(p)[2] for p in A)


def check_all(sc):
    res = {}; obj = bpy.data.objects.get
    asm = obj('Nam_Dau_Than'); cage = obj('Nam_Than_Cage')
    asm_ok = asm is not None and NEW_COLL in [c.name for c in asm.users_collection]
    miss = lambda n: (False, f'thiếu {n}')
    # chiều cao
    if asm_ok:
        lo, hi = _height(sc); h = hi - lo; res['chieu_cao'] = (abs(h - H_TARGET) <= H_TOL and abs(lo) < 0.001, f'đáy {lo:.4f} đỉnh {hi:.4f} cao {h:.4f} m')
    else: res['chieu_cao'] = miss('Nam_Dau_Than')
    # cage
    if cage:
        ms = {m.type: m for m in cage.modifiers}; sub = ms.get('SUBSURF')
        res['cage_co'] = ('MIRROR' in ms and sub is not None and sub.levels == 1, f'modifier {list(ms)}')
        mid = _attr(cage.data, 'duong_giua'); xs = [v.co.x for v in cage.data.vertices]
        if mid is None: res['cage_duong_giua'] = (False, 'thiếu thuộc tính duong_giua')
        else:
            bad = [i for i, m in enumerate(mid) if m > 0.5 and abs(xs[i]) > 1e-6]; neg = [x for x in xs if x < -1e-6]
            res['cage_duong_giua'] = (sum(m > 0.5 for m in mid) > 0 and not bad and not neg, f'{int(sum(m > 0.5 for m in mid))} đỉnh giữa, lệch {len(bad)}, x âm {len(neg)}')
        if sub: sub.show_viewport = False
        ev, me, _ = _mesh_world(cage); bm = bmesh.new(); bm.from_mesh(me); ev.to_mesh_clear()
        if sub: sub.show_viewport = True
        loops = _boundary_loops(bm); nm = sum(1 for e in bm.edges if len(e.link_faces) > 2); bm.free()
        res['cage_bien'] = (len(loops) == 5 and nm == 0, f'{len(loops)} vòng biên {sorted(loops)} (cần 5: cổ, 2 cổ tay, 2 mắt cá), cạnh >2 mặt {nm}')
    else:
        for k in ('cage_co', 'cage_duong_giua', 'cage_bien'): res[k] = miss('Nam_Than_Cage')
    # bản lắp ráp
    if asm_ok:
        o_e, nm, vol, selfi = T.mesh_checks(asm)
        res['asm_co'] = (True, f'{len(asm.data.vertices)} đỉnh')
        res['asm_kin'] = (o_e == 0 and nm == 0, f'cạnh hở {o_e}, cạnh >2 mặt {nm}')
        res['asm_phap_tuyen'] = (vol > 0, f'thể tích có dấu {vol:.4f} m³')
        res['asm_tu_giao'] = (selfi == 0, f'cặp mặt tự giao {selfi}')
        m, n, nh, zr = (asm.get(k) for k in ('co_m', 'co_n', 'co_nh', 'co_z'))
        if None in (m, n, nh, zr): res['co_khop_vong'] = (False, 'thiếu co_m/co_n/co_nh/co_z')
        else:
            above = sum(1 for v in asm.data.vertices[nh:] if v.co.z > zr + 0.0005)
            res['co_khop_vong'] = (m % n == 0 and m // n in (1, 2, 3) and above == 0, f'vòng đầu {m}, vòng thân {n}, đỉnh thân trên vòng cắt {above}')
        ev, me, vs = _mesh_world(asm); tay = _attr(me, 'tay'); chan = _attr(me, 'chan'); ev.to_mesh_clear()
        zn, zh = asm.get('z_nach'), asm.get('z_hang')
        if tay is None or chan is None or zn is None or zh is None:
            res['khe_nach'] = res['khe_hang'] = (False, 'thiếu thuộc tính tay/chan hoặc z_nach/z_hang')
        else:
            arm = [i for i, t in enumerate(tay) if t > 0.5 and vs[i].x > 0]; tor = [i for i, t in enumerate(tay) if t <= 0.5 and chan[i] <= 0.5 and vs[i].x > 0]
            g = _slice_gap(vs, arm, tor, zn - 0.12, zn - 0.02)
            res['khe_nach'] = (g is not None and g >= GAP_MIN, f'khe tay–thân nhỏ nhất {g if g is None else round(g * 1000, 1)} mm ở z {zn - 0.12:.3f}–{zn - 0.02:.3f}')
            L = [i for i, c in enumerate(chan) if c > 0.5 and vs[i].x > 0]; R = [i for i, c in enumerate(chan) if c > 0.5 and vs[i].x < 0]
            g = _slice_gap(vs, L, R, zh - 0.10, zh - 0.03)
            res['khe_hang'] = (g is not None and g >= GAP_MIN, f'khe hai đùi nhỏ nhất {g if g is None else round(g * 1000, 1)} mm ở z {zh - 0.10:.3f}–{zh - 0.03:.3f}')
        # bàn tay/chân: vòng mặt cắt nằm trong khối thân
        bvh = BVHTree.FromObject(asm, bpy.context.evaluated_depsgraph_get()); bad = []; total = 0
        for nmn in ('Nam_BanTay.L', 'Nam_BanTay.R', 'Nam_BanChan.L', 'Nam_BanChan.R'):
            o = obj(nmn)
            if not o: bad.append(f'thiếu {nmn}'); continue
            bm = bmesh.new(); bm.from_mesh(o.data)
            ring = {v for e in bm.edges if len(e.link_faces) == 1 for v in e.verts}
            for v in ring:
                p = o.matrix_world @ v.co; hit, nrm, _, d = bvh.find_nearest(p); total += 1
                if (p - hit).dot(nrm) > 0 and d > 0.0005: bad.append(f'{nmn} hở {d * 1000:.1f} mm'); break
            if not ring: bad.append(f'{nmn} không có vòng cắt')
            bm.free()
        res['tay_chan_trong_ong'] = (not bad, f'{total} đỉnh vòng cắt; ' + ('; '.join(bad) if bad else 'đều nằm trong ống'))
    else:
        for k in ('asm_co', 'asm_kin', 'asm_phap_tuyen', 'asm_tu_giao', 'co_khop_vong', 'khe_nach', 'khe_hang', 'tay_chan_trong_ong'): res[k] = miss('Nam_Dau_Than')
    return res


def report(res):
    for k, (ok, msg) in res.items(): print(f'{"PASS" if ok else "FAIL"} {k} — {msg}')
    return all(ok for ok, _ in res.values())


# ================================================================== chạy
if __name__ == '__main__':
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    ap = argparse.ArgumentParser(); ap.add_argument('--check', action='store_true'); ap.add_argument('--render', default=''); ap.add_argument('--blend', default='')
    ap.add_argument('--samples', type=int, default=24); ap.add_argument('--mau', default=''); ap.add_argument('--phong-dir', default='')
    a = ap.parse_args(argv)
    sc = build_old()
    print('--- bản cũ v2.11:', widths_table(bpy.data.objects['Nam_Dau_Than_v211']))
    if a.blend: bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))
    if a.check:
        ok = report(check_all(sc)); print('KẾT QUẢ:', 'TẤT CẢ PASS' if ok else 'CÒN FAIL'); sys.stdout.flush(); os._exit(0 if ok else 1)
