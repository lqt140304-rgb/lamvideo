"""NAM-002 — mở rig (tự dựng nếu chưa có) và đo lát cắt thân/tay/chân ở dáng nghỉ chữ T, làm khuôn dựng quần áo.

Chạy: <bpy python> do_than.py   → in bảng tóm tắt, ghi out/so-do.json
"""
import sys, os, json, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); NAM = os.path.dirname(HERE)
sys.path.insert(0, NAM)
import bpy
import numpy as np
import types


def _nap(ten):
    """Nạp script NAM-002 (gọi main() ở cuối file, không có __name__ guard) mà không chạy main — không sửa file gốc."""
    src = open(os.path.join(NAM, ten + '.py'), encoding='utf-8').read().rstrip()
    if src.endswith('main()'): src = src[:-len('main()')]
    m = types.ModuleType(ten); m.__file__ = os.path.join(NAM, ten + '.py'); exec(compile(src, m.__file__, 'exec'), m.__dict__); sys.modules[ten] = m; return m


RG = _nap('rig_nam002')

J = RG.J
OUT = os.path.join(HERE, 'out'); RIG = os.path.join(OUT, 'nam-002-rig.blend')
BAND = 0.005          # nửa bề dày lát cắt (m)
X_CHAN_MAX = 0.19      # lát chân: bỏ bàn tay buông cạnh đùi (dáng dựng tay xiên)
STEP = 0.02           # khoảng cách lát


def load_rig(path=RIG):
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        subprocess.run([sys.executable, os.path.join(NAM, 'rig_nam002.py'), '--out', path], check=True, cwd=NAM)
    bpy.ops.wm.open_mainfile(filepath=path); sc = bpy.context.scene
    return sc, bpy.data.objects['Nam_Rig'], bpy.data.objects['Nam_Body']


def _co(body):
    a = np.zeros(len(body.data.vertices) * 3); body.data.vertices.foreach_get('co', a); return a.reshape(-1, 3)


def measure(body, save=True, P=None, joints=None):
    """Đo lát cắt. P/joints: toạ độ da và mốc khớp ở dáng dựng (mặc định: lưới nghỉ chữ T và rig_nam002.J)."""
    J = dict(RG.J, **(joints or {})); P = _co(body) if P is None else P
    sd = {'joints': {k: list(v) for k, v in J.items()}, 'torso': [], 'arm': [], 'leg': []}
    # thân: từ đáy háng tới vai, chỉ phần |x| < vai − 1 cm (không lấy tay ở dáng chữ T)
    z_day = J['hip'][2] - 0.04; xs = J['shoulder'][0] - 0.01
    for z in np.arange(z_day, J['neck'][2] + 1e-6, STEP):
        m = (np.abs(P[:, 2] - z) < BAND) & (np.abs(P[:, 0]) < xs)
        if m.sum() < 8: continue
        Q = P[m]; yc = (Q[:, 1].max() + Q[:, 1].min()) / 2
        sd['torso'].append(dict(z=round(float(z), 4), w=float(np.abs(Q[:, 0]).max()), f=float(yc - Q[:, 1].min()), b=float(Q[:, 1].max() - yc), yc=float(yc)))
    # cổ: lát z 1,35 (trên dốc vai, dưới hàm) — cỡ lỗ cổ áo
    m = (np.abs(P[:, 2] - 1.35) < BAND) & (np.abs(P[:, 0]) < 0.10); Q = P[m]; yc = (Q[:, 1].max() + Q[:, 1].min()) / 2
    sd['co'] = dict(z=1.35, w=float(np.abs(Q[:, 0]).max()), f=float(yc - Q[:, 1].min()), b=float(Q[:, 1].max() - yc), yc=float(yc), x=float((Q[:, 0].max() + Q[:, 0].min()) / 2))
    # tay trái: lát vuông góc trục vai → cổ tay
    a0 = np.array(J['shoulder']); a1 = np.array(J['wrist']); L = np.linalg.norm(a1 - a0); d = (a1 - a0) / L
    for u in np.arange(0.0, L + 1e-6, STEP):
        c0 = a0 + d * u; rel = P - c0; t = rel @ d; perp = rel - np.outer(t, d)
        m = (np.abs(t) < BAND) & (np.linalg.norm(perp, axis=1) < 0.10) & (P[:, 0] > xs)
        if m.sum() < 6: continue
        Q = P[m]; c = (Q.max(0) + Q.min(0)) / 2; c = c - d * ((c - c0) @ d)
        sd['arm'].append(dict(u=round(float(u), 4), c=[float(x) for x in c], r=float(np.linalg.norm(Q - c, axis=1).max())))
    # chân trái: lát ngang từ háng tới cổ chân
    for z in np.arange(J['hip'][2] - 0.02, J['ankle'][2] - 1e-6, -STEP):
        m = (np.abs(P[:, 2] - z) < BAND) & (P[:, 0] > 0.01) & (P[:, 0] < X_CHAN_MAX)
        if m.sum() < 6: continue
        Q = P[m]; c = (Q.max(0) + Q.min(0)) / 2
        sd['leg'].append(dict(z=round(float(z), 4), c=[float(x) for x in c], rx=float((Q[:, 0].max() - Q[:, 0].min()) / 2), ry=float((Q[:, 1].max() - Q[:, 1].min()) / 2)))
    if save:
        os.makedirs(OUT, exist_ok=True); json.dump(sd, open(os.path.join(OUT, 'so-do.json'), 'w'), indent=1)
    return sd


def tom_tat(sd):
    T = {round(L['z'], 2): L for L in sd['torso']}
    for nm, z in (('ngực', 1.20), ('eo', 1.02), ('hông', 0.92)):
        L = min(sd['torso'], key=lambda L: abs(L['z'] - z)); print(f'  {nm:5s} z {L["z"]:.2f}: rộng {2 * L["w"]:.3f} m, dày {L["f"] + L["b"]:.3f} m')
    print(f'  tay: {len(sd["arm"])} lát, r vai {sd["arm"][0]["r"]:.3f} → cổ tay {sd["arm"][-1]["r"]:.3f} m')
    G = sd['leg']; print(f'  chân: {len(G)} lát, đùi trên rx {G[0]["rx"]:.3f}, cổ chân rx {G[-1]["rx"]:.3f} m')


if __name__ == '__main__':
    sc, arm, body = load_rig(); tom_tat(measure(body))
