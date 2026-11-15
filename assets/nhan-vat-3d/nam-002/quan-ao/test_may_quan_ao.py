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


if __name__ == '__main__':
    names = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else list(MQ.QA.OUTFITS)
    bad = 0
    for nm in names:
        sc, arm, body = DT.load_rig(); sd = DT.measure(body, save=False); cl = MQ.build_outfit(sc, body, sd, nm)
        for t, a in ((test_tung_bo_dung_duoc, (cl,)), (test_khong_xuyen_luc_nghi, (cl, body)), (test_ao_chong_quan, (cl,))):
            try: t(*a); print('PASS', nm, t.__name__)
            except AssertionError as e: bad += 1; print('FAIL', nm, t.__name__, str(e)[:200])
    print('KẾT QUẢ:', 'PASS' if not bad else f'FAIL {bad}'); sys.exit(1 if bad else 0)
