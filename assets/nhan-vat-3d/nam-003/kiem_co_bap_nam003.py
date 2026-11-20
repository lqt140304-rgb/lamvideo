"""KIỂM CƠ CHUYỂN ĐỘNG nam-003 (co_bap_nam003.py). <bpy-python> kiem_co_bap_nam003.py --rig nam-003-rig.blend"""
import sys, os, math, argparse
import numpy as np, bpy
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import chuyen_dong_nam003 as C
X, Y, Z = C.X, C.Y, C.Z


def run(rig):
    c = C.Ctx(rig); c.body.hide_viewport = False; kb = c.body.data.shape_keys.key_blocks if c.body.data.shape_keys else {}; res = []
    for m in c.body.modifiers:
        if m.type == 'CORRECTIVE_SMOOTH': m.show_viewport = True
    def T(nm, ok, info=''): print(('PASS ' if ok else 'FAIL ') + nm + (f'  ({info})' if info else '')); res.append(ok)
    ten = [f'co_{n}_{s}' for n in ('bap_tay', 'delta', 'cang_tay', 'bap_chan') for s in 'LR']
    T('test_co_shape_key', all(n in kb for n in ten), ', '.join(n for n in ten if n not in kb) or 'đủ 8')
    if not all(n in kb for n in ten): print('CÓ FAIL'); return False
    val = lambda n: kb[n].evaluated if hasattr(kb[n], 'evaluated') else c.body.evaluated_get(bpy.context.evaluated_depsgraph_get()).data.shape_keys.key_blocks[n].value
    def v(n): c.upd(); c.body.update_tag(); bpy.context.view_layer.update(); return c.body.evaluated_get(bpy.context.evaluated_depsgraph_get()).data.shape_keys.key_blocks[n].value
    c.reset(); T('test_nghi_bang_0', all(v(n) < 1e-3 for n in ten), str([round(v(n), 3) for n in ten]))
    c.reset(); [c.rot(b, a, d) for b, a, d in C.ARM_DOWN]; c.rot('LeftForeArm', X, -120); T('test_bap_tay_khi_gap_khuyu', v('co_bap_tay_L') > 0.8 and v('co_bap_tay_R') < 0.15, f'L {v("co_bap_tay_L"):.2f} R {v("co_bap_tay_R"):.2f}')
    c.reset(); c.rot('LeftArm', Y, -90); c.rot('RightArm', Y, 90); T('test_delta_khi_gio_tay', v('co_delta_L') > 0.8 and v('co_delta_R') > 0.8, f'L {v("co_delta_L"):.2f} R {v("co_delta_R"):.2f}')
    c.reset(); [c.rot(b, a, d) for b, a, d in C.ARM_DOWN]; T('test_delta_tat_khi_buong', v('co_delta_L') < 0.05, f'{v("co_delta_L"):.2f}')
    c.reset(); c.pb['LeftHand']['nam'] = 1.0; T('test_cang_tay_khi_nam', v('co_cang_tay_L') > 0.95, f'{v("co_cang_tay_L"):.2f}')
    c.reset(); t = c.pb['ik_foot.L']; from mathutils import Vector; t.location = t.bone.matrix_local.to_3x3().inverted() @ Vector((0, 0.25, 0.35))
    for b in c.pb:
        for k in b.constraints:
            if k.type == 'IK': k.influence = 1.0
    T('test_bap_chan_khi_gap_goi_IK', v('co_bap_chan_L') > 0.4, f'{v("co_bap_chan_L"):.2f} (gối gập bằng IK)')
    # biên độ thực và không giãn lưới
    c.reset(); [c.rot(b, a, d) for b, a, d in C.ARM_DOWN]; c.rot('LeftForeArm', X, -120); c.upd()
    me = c.body.data; ea = np.zeros(len(me.edges) * 2, int); me.edges.foreach_get('vertices', ea); ea = ea.reshape(-1, 2)
    def pos():
        e = c.body.evaluated_get(bpy.context.evaluated_depsgraph_get()).to_mesh(); p = np.zeros(len(e.vertices) * 3); e.vertices.foreach_get('co', p); return p.reshape(-1, 3)
    p1 = pos(); kb['co_bap_tay_L'].mute = True; c.body.update_tag(); bpy.context.view_layer.update(); p0 = pos(); kb['co_bap_tay_L'].mute = False
    mv = np.linalg.norm(p1 - p0, axis=1).max() * 1000
    T('test_bap_tay_phong_thay_duoc', 6 < mv < 16, f'phồng tối đa {mv:.1f} mm')
    co0 = np.array([vv.co[:] for vv in me.vertices]); l0 = np.linalg.norm(co0[ea[:, 0]] - co0[ea[:, 1]], axis=1)
    r1 = np.linalg.norm(p1[ea[:, 0]] - p1[ea[:, 1]], axis=1) / np.maximum(l0, 1e-6); r0 = np.linalg.norm(p0[ea[:, 0]] - p0[ea[:, 1]], axis=1) / np.maximum(l0, 1e-6)
    ok = l0 > 0.002; T('test_khong_them_gian', int(((r1 > 2) & ok).sum()) <= int(((r0 > 2) & ok).sum()), f'>2×: có cơ {int(((r1 > 2) & ok).sum())}, không cơ {int(((r0 > 2) & ok).sum())}')
    prev = None; jump = 0
    for a in range(0, 151, 5):
        c.reset(); [c.rot(b, aa, d) for b, aa, d in C.ARM_DOWN]; c.rot('LeftForeArm', X, -a); x = v('co_bap_tay_L')
        if prev is not None: jump = max(jump, abs(x - prev))
        prev = x
    T('test_lien_tuc', jump < 0.1, f'bước lớn nhất {jump:.3f} / 5°')
    print('PASS tất cả' if all(res) else 'CÓ FAIL'); return all(res)


if __name__ == '__main__':
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--rig', required=True); a = ap.parse_args(argv); sys.exit(0 if run(a.rig) else 1)
