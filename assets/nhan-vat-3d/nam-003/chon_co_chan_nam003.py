"""CHỌN VỊ TRÍ CỔ CHÂN NAM-003 bằng đo biến dạng — Blender 5.2.x.

  <bpy-python> chon_co_chan_nam003.py [--song-song 4] [--ra thư-mục]

Dựng rig với ankle ∈ z {0.08,0.10,0.12,0.14} × y {0.04,0.05,0.06} (qua NAM003_J), đo cạnh giãn >1,5× và co <0,6× (cạnh dài >3 mm lúc nghỉ) ở các tư thế
buoc_chan, ngoi_xom, nhac_chan_IK (ik_foot.L dịch (0,−0,30,+0,35) và Hips −0,02) và mui_chan (ik_foot.L quay ±20° quanh X). Chọn tổ hợp có tổng giãn+co nhỏ nhất, hòa thì giãn lớn nhất nhỏ hơn.
"""
import sys, os, json, argparse, subprocess, itertools
import numpy as np, bpy

HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import rig_nam003 as R

ZS = (0.08, 0.10, 0.12, 0.14); YS = (0.04, 0.05, 0.06); X_ANKLE = 0.148


def build(tag, ankle, out_dir):
    env = dict(os.environ, NAM003_J=json.dumps({'ankle': list(ankle)}))
    f = os.path.join(out_dir, f'{tag}.blend')
    return subprocess.Popen([sys.executable, os.path.join(HERE, 'rig_nam003.py'), '--out', f], env=env, stdout=open(f + '.log', 'w'), stderr=subprocess.STDOUT), f


def measure(blend, g):
    bpy.ops.wm.open_mainfile(filepath=blend); arm = bpy.data.objects['Nam_Rig']; body = bpy.data.objects['Nam_Body']; me = body.data
    ea, eb = g['edges_np'](me)

    def pos():
        e = body.evaluated_get(bpy.context.evaluated_depsgraph_get()); m = e.to_mesh(); a = np.zeros(len(m.vertices) * 3); m.vertices.foreach_get('co', a); e.to_mesh_clear(); return a.reshape(-1, 3)
    g['reset'](arm); p0 = pos(); l0 = np.linalg.norm(p0[ea] - p0[eb], axis=1); ok = l0 > 0.003
    poses = {
        'buoc_chan': lambda: g['POSES']['buoc_chan'](arm),
        'ngoi_xom': lambda: g['POSES']['ngoi_xom'](arm),
        'nhac_chan_IK': lambda: (g['move_world'](arm, 'ik_foot.L', (0, -0.30, 0.35)), g['move_world'](arm, 'Hips', (0, 0, -0.02))),
        'mui_chan+20': lambda: g['rot_world'](arm, 'ik_foot.L', (1, 0, 0), 20),
        'mui_chan-20': lambda: g['rot_world'](arm, 'ik_foot.L', (1, 0, 0), -20),
    }
    out = {}
    for nm, f in poses.items():
        g['reset'](arm); f(); bpy.context.view_layer.update(); p = pos(); r = np.linalg.norm(p[ea] - p[eb], axis=1) / np.maximum(l0, 1e-6)
        out[nm] = (int(((r > 1.5) & ok).sum()), int(((r < 0.6) & ok).sum()), float(r[ok].max()))
    return out


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--song-song', type=int, default=4); ap.add_argument('--ra', default=os.path.join(HERE, '_thu_co_chan'))
    a = ap.parse_args(argv); os.makedirs(a.ra, exist_ok=True)
    combos = [(z, y) for z in ZS for y in YS]; done = {}
    for i in range(0, len(combos), a.song_song):
        batch = [(zy, *build(f'a_{zy[0]:.2f}_{zy[1]:.2f}', (X_ANKLE, zy[1], zy[0]), a.ra)) for zy in combos[i:i + a.song_song]]
        for zy, pr, f in batch:
            pr.wait(); assert os.path.exists(f), 'dựng rig lỗi: ' + f + '.log'; done[zy] = f
    g = R.patched_namespace(); rows = []
    for zy, f in done.items():
        m = measure(f, g); s = sum(v[0] + v[1] for v in m.values()); mx = max(v[2] for v in m.values())
        rows.append((s, mx, zy, m)); print(f'ankle z={zy[0]:.2f} y={zy[1]:.2f}: tổng giãn+co {s:5d}, giãn max {mx:.2f}× | ' + ' '.join(f'{k}:{v[0]}/{v[1]}' for k, v in m.items()), flush=True)
    rows.sort(key=lambda r: (r[0], r[1])); z, y = rows[0][2]
    print(f'CHON: ankle=({X_ANKLE}, {y}, {z})')


if __name__ == '__main__':
    main()
