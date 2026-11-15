"""Bộ đo phải bắt được lỗi cố ý. Chạy: <bpy python> test_kiem_tra.py"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
import numpy as np
import bmesh
import do_than as DT, may_quan_ao as MQ, gan_rig as GR, kiem_tra as KT


def setup():
    sc, arm, body = KT.load_walk(); sd = DT.measure(body, save=False); cl = MQ.build_outfit(sc, body, sd, 'xanh'); GR.bind(arm, body, cl)
    return sc, arm, body, cl


def main():
    bad = 0
    sc, arm, body, cl = setup(); D = KT.Do(sc, arm, body, cl); r = D.do('nghi_T')
    ok = r['xuyen'] == 0 and r['lo_da'] == 0 and r['vuong'] == 0 and r['rach_gian'] == 0 and r['rach_lat'] == 0
    print('PASS' if ok else 'FAIL', 'test_nghi_sach', {k: r[k] for k in ('xuyen', 'lo_da', 'vuong', 'rach_gian', 'rach_lat')}); bad += not ok
    ao = next(o for o in cl if o.name == 'Ao'); P0 = np.array([v.co[:] for v in ao.data.vertices])
    sel = np.nonzero((np.abs(P0[:, 0]) < 0.06) & (np.abs(P0[:, 2] - 1.10) < 0.03) & (P0[:, 1] < 0))[0][:50]
    P = P0.copy(); P[sel, 1] += 0.06; ao.data.vertices.foreach_set('co', P.ravel()); ao.data.update()        # kéo 50 đỉnh áo vào trong bụng
    r = D.do('nghi_T'); ok = r['xuyen'] > 0; print('PASS' if ok else 'FAIL', 'test_bat_xuyen', r['xuyen']); bad += not ok
    ao.data.vertices.foreach_set('co', P0.ravel()); ao.data.update()
    bm = bmesh.new(); bm.from_mesh(ao.data); bmesh.ops.delete(bm, geom=[v for v in bm.verts if 0.98 < v.co.z < 1.06], context='VERTS'); bm.to_mesh(ao.data); bm.free()
    sc, arm, body, cl2 = sc, arm, body, cl; D2 = KT.Do.__new__(KT.Do); D2.__dict__.update(D.__dict__); D2.cl = [o for o in D.cl if o.name != 'Ao'] + [ao]
    D2.ed = dict(D.ed); D2.ed['Ao'] = np.array([e.vertices[:] for e in ao.data.edges])
    C = D2._cloth(); D2.l0 = dict(D.l0); D2.fn0 = dict(D.fn0)
    D2.l0['Ao'] = np.linalg.norm(C['Ao'][0][D2.ed['Ao'][:, 0]] - C['Ao'][0][D2.ed['Ao'][:, 1]], axis=1); D2.fn0['Ao'] = D2._fnorm(*C['Ao']); D2.hits0 = D2._overlaps(C)
    r = D2.do('nghi_T'); ok = r['lo_da'] > 0; print('PASS' if ok else 'FAIL', 'test_bat_lo_da', r['lo_da']); bad += not ok
    print('KẾT QUẢ:', 'PASS' if not bad else f'FAIL {bad}'); sys.exit(1 if bad else 0)


main()
