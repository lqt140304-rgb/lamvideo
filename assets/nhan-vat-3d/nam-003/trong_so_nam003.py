"""Làm mượt trọng số theo vùng cho Nam_Body (nam-003), áp SAU khi dựng rig. Chỉ đụng nhóm xương biến dạng (bỏ nhóm cs_*).

  lam_muot(body, vung)  vung = [(tên, mặt nạ(co)->bool[], số lần lặp, hệ số)]
Toạ độ thực của nam-003 (Z lên, +X bên trái nhân vật, mặt −Y).
"""
import numpy as np, bpy

VUNG = {   # tên: (hàm mặt nạ theo toạ độ thực, lặp, hệ số) — chỉnh bằng kiem_rom_nam003.py
    'bang': (lambda x, y, z: (np.abs(x) < 0.22) & (z > 0.76) & (z < 1.04), 40, 0.5),
    'co_chan': (lambda x, y, z: (np.abs(x) < 0.25) & (z < 0.26), 40, 0.5),
    'goi': (lambda x, y, z: (np.abs(x) < 0.22) & (z > 0.34) & (z < 0.60), 10, 0.5),
    'ban_tay': (lambda x, y, z: (np.abs(x) > 0.62), 25, 0.5),
}


def lam_muot(body, vung=None, ghi_de=None):
    me = body.data; nv = len(me.vertices); names = [g.name for g in body.vertex_groups]
    dem = [i for i, n in enumerate(names) if not n.startswith('cs_')]; ng = len(dem)
    W = np.zeros((nv, ng), np.float32); col = {g: j for j, g in enumerate(dem)}
    for v in me.vertices:
        for g in v.groups:
            if g.group in col: W[v.index, col[g.group]] = g.weight
    ea = np.zeros(len(me.edges) * 2, int); me.edges.foreach_get('vertices', ea); ea = ea.reshape(-1, 2); a, b = ea[:, 0], ea[:, 1]
    deg = np.bincount(np.concatenate([a, b]), minlength=nv).astype(np.float32).clip(1)
    co = np.zeros(nv * 3); me.vertices.foreach_get('co', co); x, y, z = co.reshape(-1, 3).T
    for ten, (fn, it, al) in (ghi_de or VUNG).items():
        if vung is not None and ten not in vung: continue
        m = fn(x, y, z)
        for _ in range(it):
            acc = np.stack([np.bincount(a, W[b, j], nv) + np.bincount(b, W[a, j], nv) for j in range(ng)], 1)
            W[m] = (1 - al) * W[m] + al * acc[m] / deg[m, None]
    W[W < 0.01] = 0; k4 = np.argsort(-W, axis=1)[:, 4:]; np.put_along_axis(W, k4, 0.0, axis=1)
    s = W.sum(1, keepdims=True); W = W / np.maximum(s, 1e-9)
    for g in dem: body.vertex_groups[g].remove(list(range(nv)))
    nz = np.nonzero(W > 1e-4)
    for vi, j in zip(nz[0].tolist(), nz[1].tolist()): body.vertex_groups[dem[j]].add([vi], float(W[vi, j]), 'REPLACE')
