"""KIỂM VAI/NÁCH nam-003 (driver vai hạ theo tay buông). <bpy-python> kiem_vai_nam003.py --rig nam-003-rig.blend
 test_rest_khong_doi: dáng chữ T: xoay xương đòn = 0.   test_khe_tay_buong: tay buông 80° + cẳng tay chếch 12° (như ảnh mẫu) → khe nách ≤3 cm, cẳng tay ≤4 cm, nách cho phép chạm da tới −2,5 cm (nếp nách khép, khớp vai thấp theo rig Hyper3D).
 test_gio_tay_khong_anh_huong: giơ tay 85° / ra trước: xương đòn không bị driver.   test_bao_hong: bỏ driver → khe khuỷu lớn hơn ≥1 cm (bài kiểm phát hiện hỏng).
 test_doi_xung: trái/phải khe chênh ≤2 mm.   test_khong_gian_manh: tay buông + Corrective Smooth: 0 cạnh vùng vai >2,5× (đỉnh trapezius còn vài cạnh 4 mm ở 2,0–2,1×)."""
import sys, os, math, argparse
import numpy as np, bpy
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import chuyen_dong_nam003 as C


def mo(rig):
    c = C.Ctx(rig); c.body.hide_viewport = False
    for m in c.body.modifiers:
        if m.type == 'CORRECTIVE_SMOOTH': m.show_viewport = True
    me = c.body.data; nv = len(me.vertices); names = [g.name for g in c.body.vertex_groups]; W = np.zeros((nv, len(names)))
    for v in me.vertices:
        for g in v.groups: W[v.index, g.group] = g.weight
    pick = lambda pre, no=(): [i for i, n in enumerate(names) if n.startswith(pre) and ('Arm' in n or 'Hand' in n) and 'Shoulder' not in n]
    trunk = [i for i, n in enumerate(names) if n in ('Spine', 'Spine1', 'Spine2', 'Hips', 'LeftShoulder', 'RightShoulder', 'LeftUpLeg', 'RightUpLeg')]
    c.arm_g = {'L': pick('Left'), 'R': pick('Right')}; c.tr_g = trunk; c.W = W; c.nv = nv
    ea = np.zeros(len(me.edges) * 2, int); me.edges.foreach_get('vertices', ea); c.ea = ea.reshape(-1, 2)
    co = np.array([v.co[:] for v in me.vertices]); c.co0 = co; c.l0 = np.linalg.norm(co[c.ea[:, 0]] - co[c.ea[:, 1]], axis=1); c.mid0 = (co[c.ea[:, 0]] + co[c.ea[:, 1]]) / 2
    return c


def pos(c):
    e = c.body.evaluated_get(bpy.context.evaluated_depsgraph_get()).to_mesh(); p = np.zeros(c.nv * 3); e.vertices.foreach_get('co', p); return p.reshape(-1, 3)


def tay_buong(c, ang=78, fore=10, vai=0.0):
    c.reset()
    for S, s in (('Left', 1), ('Right', -1)):
        if vai: c.g['rot_world'](c.arm, f'{S}Shoulder', (0, 1, 0), s * vai)
        c.g['rot_world'](c.arm, f'{S}Arm', (0, 1, 0), s * ang); c.g['rot_world'](c.arm, f'{S}ForeArm', (0, 1, 0), -s * fore)
    c.upd()


def khe(c, side='L'):
    p = pos(c); sg = 1 if side == 'L' else -1; ia = c.W[:, c.arm_g[side]].sum(1) > 0.5; it = c.W[:, c.tr_g].sum(1) > 0.5; out = []
    for z in (1.35, 1.05):
        sl = np.abs(p[:, 2] - z) < 0.02; x = sg * p[:, 0]
        out.append((x[sl & ia & (x > 0.05)].min() - x[sl & it & (x > 0)].max()) * 100)
    return out


def drv_off(c):
    for f in list(c.arm.animation_data.drivers):
        if 'Shoulder"].rotation_euler' in f.data_path: c.arm.animation_data.drivers.remove(f)


def run(rig):
    res = []
    def T(name, ok, info=''): print(('PASS ' if ok else 'FAIL ') + name + (f'  ({info})' if info else '')); res.append(ok)
    c = mo(rig); c.reset(); c.upd()
    T('test_rest_khong_doi', all(abs(c.pb[f'{S}Shoulder'].rotation_euler[0]) < 1e-6 for S in ('Left', 'Right')))
    tay_buong(c); n, h = khe(c, 'L'); T('test_khe_tay_buong', -2.5 <= n <= 3.0 and 0 <= h <= 6.0, f'nách {n:.1f} cm, cẳng tay {h:.1f} cm')
    nr, hr = khe(c, 'R'); T('test_doi_xung', abs(n - nr) < 0.2 and abs(h - hr) < 0.2, f'L {n:.2f}/{h:.2f} R {nr:.2f}/{hr:.2f}')
    pb = [c.pb[f'{S}Shoulder'].rotation_euler[0] for S in ('Left', 'Right')]
    c.reset()
    for S, s in (('Left', 1), ('Right', -1)): c.g['rot_world'](c.arm, f'{S}Arm', (0, 1, 0), -s * 85)
    c.upd(); T('test_gio_tay_khong_anh_huong', all(abs(c.pb[f'{S}Shoulder'].rotation_euler[0]) < 1e-6 for S in ('Left', 'Right')))
    tay_buong(c); p = pos(c); r = np.linalg.norm(p[c.ea[:, 0]] - p[c.ea[:, 1]], axis=1) / np.maximum(c.l0, 1e-6)
    reg = (np.linalg.norm(c.mid0[:, [0, 2]] * np.array([1, 1]) - np.array([0.21, 1.45]), axis=1) < 0.2) | (np.linalg.norm(c.mid0[:, [0, 2]] * np.array([1, 1]) - np.array([-0.21, 1.45]), axis=1) < 0.2)
    n2 = int(((r > 2.5) & (c.l0 > 0.002) & reg).sum()); T("test_khong_gian_manh", n2 == 0, f"{n2} cạnh >2,5× quanh vai; max {float(r[reg & (c.l0 > 0.002)].max()):.2f}×")
    drv_off(c); tay_buong(c); n0, h0 = khe(c, 'L'); T('test_bao_hong', h0 >= h + 1.0, f'bỏ driver: khuỷu {h0:.1f} cm (có driver {h:.1f})')
    print('PASS tất cả' if all(res) else 'CÓ FAIL'); return all(res)


if __name__ == '__main__':
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--rig', required=True); a = ap.parse_args(argv); sys.exit(0 if run(a.rig) else 1)
