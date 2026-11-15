"""NAM-002 — gắn quần áo vào rig: weights chép từ da gần nhất (nội suy trên mặt da), giới hạn theo vùng, làm mượt theo cạnh vải.

Luật vùng (spec + kế hoạch Task 3):
- trái/phải tách theo dấu x: đỉnh x > +2 cm không nhận xương `Right*`, x < −2 cm không nhận `Left*`; dải giữa giữ nguyên;
- áo/mũ/chi tiết áo không nhận xương chân; quần/tất/dép/quai không nhận xương tay;
- mũ, vạt áo xa da (> 3 cm) chỉ nhận xương thân (`Hips`, `Spine*`, `Neck`, `Head`) — riêng tay áo (ngoài vai) giữ xương tay cùng bên.
"""
import numpy as np
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree
import do_than as DT

SMOOTH_IT = 10
FAR = 0.03
LEG = ('UpLeg', 'Leg', 'Foot', 'ToeBase')
TRUNK = ('Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head')


def reset_pose(arm):
    DT.RG.reset(arm)


def _is_leg(n): return any(n.endswith(s) for s in LEG) and n.startswith(('Left', 'Right'))
def _is_arm(n): return n.startswith(('Left', 'Right')) and not _is_leg(n)


def _body_weights(body, names):
    n = len(body.data.vertices); W = np.zeros((n, len(names))); col = {g.index: names.index(g.name) for g in body.vertex_groups if g.name in names}
    for v in body.data.vertices:
        for g in v.groups:
            if g.group in col: W[v.index, col[g.group]] = g.weight
    return W


def bind(arm, body, clothes):
    reset_pose(arm)
    names = [b.name for b in arm.data.bones if b.use_deform and b.name in body.vertex_groups]
    W = _body_weights(body, names); me = body.data
    tris = [(p.vertices[0], p.vertices[i], p.vertices[i + 1]) for p in me.polygons for i in range(1, len(p.vertices) - 1)]
    Pb = np.array([v.co[:] for v in me.vertices]); bvh = BVHTree.FromPolygons([tuple(p) for p in Pb], tris)
    side = np.array([1 if n.startswith('Left') else -1 if n.startswith('Right') else 0 for n in names])
    leg = np.array([_is_leg(n) for n in names]); armb = np.array([_is_arm(n) for n in names]); trunk = np.array([n in TRUNK for n in names])
    sh_x = DT.J['shoulder'][0]
    for ob in clothes:
        P = np.array([v.co[:] for v in ob.data.vertices]); n = len(P); C = np.zeros((n, len(names))); far = np.zeros(n, bool)
        for i, p in enumerate(P):
            loc, nor, fi, d = bvh.find_nearest(Vector(p))
            a, b, c = (Pb[k] for k in tris[fi]); t = tris[fi]
            v0, v1, v2 = b - a, c - a, np.array(loc) - a; d00, d01, d11 = v0 @ v0, v0 @ v1, v1 @ v1; d20, d21 = v2 @ v0, v2 @ v1
            den = d00 * d11 - d01 * d01 or 1e-12; wb = (d11 * d20 - d01 * d21) / den; wc = (d00 * d21 - d01 * d20) / den; wa = 1 - wb - wc
            C[i] = wa * W[t[0]] + wb * W[t[1]] + wc * W[t[2]]; far[i] = d > FAR
        top = ob.name.startswith(('Ao', 'Mu', 'Tui', 'Phu_Hieu', 'Nep', 'Vien_Tay', 'Co_Ao'))
        low = ob.name.startswith(('Quan', 'Tat', 'Dep', 'Quai', 'Bo_Ong', 'Soc'))
        if top: C[:, leg] = 0
        if low: C[:, armb] = 0
        if ob.name.startswith('Mu'): C[:, ~trunk] = 0
        sleeve = np.abs(P[:, 0]) > sh_x - 0.01
        C[far & ~sleeve & top] *= trunk                                             # vạt/mũ xa da: chỉ xương thân
        C[np.ix_(P[:, 0] > 0.02, side < 0)] = 0; C[np.ix_(P[:, 0] < -0.02, side > 0)] = 0
        ed = np.array([e.vertices[:] for e in ob.data.edges]); deg = np.bincount(ed.ravel(), minlength=n).clip(1)[:, None]
        for _ in range(SMOOTH_IT):
            acc = np.zeros_like(C)
            for j in range(C.shape[1]): acc[:, j] = np.bincount(ed[:, 0], weights=C[ed[:, 1], j], minlength=n) + np.bincount(ed[:, 1], weights=C[ed[:, 0], j], minlength=n)
            C = 0.5 * C + 0.5 * acc / deg
            C[np.ix_(P[:, 0] > 0.02, side < 0)] = 0; C[np.ix_(P[:, 0] < -0.02, side > 0)] = 0
        s = C.sum(1, keepdims=True); empty = s[:, 0] < 1e-6
        C[empty, names.index('Hips') if 'Hips' in names else 0] = 1; C /= C.sum(1, keepdims=True)
        ob.vertex_groups.clear()
        for j, nm in enumerate(names):
            idx = np.nonzero(C[:, j] > 1e-4)[0]
            if not len(idx): continue
            g = ob.vertex_groups.new(name=nm)
            for i in idx.tolist(): g.add([i], float(C[i, j]), 'REPLACE')
        for m in list(ob.modifiers):
            if m.type == 'ARMATURE': ob.modifiers.remove(m)
        m = ob.modifiers.new('Armature', 'ARMATURE'); m.object = arm
        _move_first(ob, 'Armature')


def _move_first(ob, name):
    ob.modifiers.move(ob.modifiers.find(name), 0)
