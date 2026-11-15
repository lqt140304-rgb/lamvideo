"""Kiểm may_quan_ao (dựng) và gan_rig (gắn). Chạy: <bpy python> test_may_quan_ao.py [tên bộ …]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
import numpy as np
from mathutils.bvhtree import BVHTree
import do_than as DT
import may_quan_ao as MQ


def _bm(ob):
    bm = bmesh.new(); bm.from_mesh(ob.data); return bm


def test_tung_bo_dung_duoc(cl):
    assert len(cl) >= 2, [o.name for o in cl]
    for o in cl:
        bm = _bm(o)
        assert not [e for e in bm.edges if len(e.link_faces) > 2], o.name
        bm.verts.ensure_lookup_table(); seen = set(); stack = [bm.verts[0]]
        while stack:
            v = stack.pop()
            if v.index in seen: continue
            seen.add(v.index); stack += [e.other_vert(v) for e in v.link_edges]
        assert len(seen) == len(bm.verts), f'{o.name}: {len(bm.verts) - len(seen)} đỉnh rời mảnh'


def test_khong_xuyen_luc_nghi(cl, body):
    bvh = BVHTree.FromObject(body, bpy.context.evaluated_depsgraph_get())
    for o in cl:
        if o.name.startswith('Dep'): continue
        dmin = min(bvh.find_nearest(o.matrix_world @ v.co)[3] for v in o.data.vertices)
        lim = 0.002 if o.name.startswith(('Tat', 'Quai')) else 0.005          # tất, quai dép ôm da (nổi 3 mm)
        assert dmin >= lim, f'{o.name}: {dmin * 1000:.1f} mm'


def test_ao_chong_quan(cl):
    ao = next(o for o in cl if o.name.startswith('Ao') and not o.name.startswith('Ao_Trong'))
    quan = next(o for o in cl if o.name.startswith('Quan'))
    z_gau = min(v.co.z for v in ao.data.vertices); z_cap = max(v.co.z for v in quan.data.vertices)
    assert z_gau <= z_cap - 0.06, (z_gau, z_cap)


def _eval_co(o):
    dg = bpy.context.evaluated_depsgraph_get(); ev = o.evaluated_get(dg); me = ev.to_mesh(); a = np.array([v.co[:] for v in me.vertices]); ev.to_mesh_clear(); return a


def test_nghi_khong_doi(cl, arm):
    import gan_rig as GR
    for o in cl:
        mods = [m for m in o.modifiers if m.type != 'ARMATURE']
        for m in mods: m.show_viewport = False
        GR.reset_pose(arm); P = _eval_co(o); P0 = np.array([v.co[:] for v in o.data.vertices])
        for m in mods: m.show_viewport = True
        assert np.abs(P - P0).max() <= 1e-4, f'{o.name}: {np.abs(P - P0).max() * 1000:.3f} mm'


def test_ong_quan_khong_lay_chan_kia(cl):
    q = next(o for o in cl if o.name.startswith('Quan')); gi = {g.index: g.name for g in q.vertex_groups}
    for v in q.data.vertices:
        if v.co.x > 0.02:
            w = sum(g.weight for g in v.groups if gi[g.group].startswith('Right'))
            assert w == 0, (v.index, tuple(v.co), w)


if __name__ == '__main__':
    names = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else list(MQ.QA.OUTFITS)
    bad = 0
    for nm in names:
        sc, arm, body = DT.load_rig(); sd = DT.measure(body, save=False); cl = MQ.build_outfit(sc, body, sd, nm)
        import gan_rig as GR; GR.bind(arm, body, cl)
        for t, a in ((test_tung_bo_dung_duoc, (cl,)), (test_khong_xuyen_luc_nghi, (cl, body)), (test_ao_chong_quan, (cl,)), (test_nghi_khong_doi, (cl, arm)), (test_ong_quan_khong_lay_chan_kia, (cl,))):
            try: t(*a); print('PASS', nm, t.__name__)
            except AssertionError as e: bad += 1; print('FAIL', nm, t.__name__, str(e)[:200])
    print('KẾT QUẢ:', 'PASS' if not bad else f'FAIL {bad}'); sys.exit(1 if bad else 0)
