"""CỔ NAM-003: xương phụ chia xoắn dọc cổ + trọng số gradient (+ Corrective Smooth ở add_neck_cs, Task 3). Blender 5.2.x.

Hai xương phụ NeckBlend1/2 là con của Neck, đặt dọc xương Neck, Copy Rotation (LOCAL) từ Head với ảnh hưởng NECK_INFLUENCE,
như LeftArmBlend ở rig_nam002.py. Trọng số đỉnh vùng cổ theo hàm mũ (piecewise tuyến tính, tổng 1) giữa Spine2 → Neck → NeckBlend1 → NeckBlend2 → Head.
Xương Head và đỉnh z >= z_hi (trọng số Head = 1) KHÔNG đổi: bên làm mặt gắn 100 % Head.
"""
import os, json
import numpy as np
import bpy

_P = json.loads(os.environ.get('NAM003_NECK', '{}'))   # chỉ để thử tham số: NAM003_NECK='{"inf":[0.4,0.75],"zlo":1.40,"iter":80}'
NECK_INFLUENCE = tuple(_P.get('inf', (0.33, 0.66)))
NODE_T = tuple(_P.get('t', (0.0, 0.2, 0.45, 0.7, 0.95)))                         # vị trí các nút trọng số trong [z_lo, z_hi]
JAW_SHIFT = _P.get('jaw_shift', 0.03)
CS_FADE = tuple(_P.get('cs_fade', (1.58, 1.61)))               # CS cổ giảm dần về 0 trong khoảng này (kết thúc <= 1,61)
NODE_BONES = ('Spine2', 'Neck', 'NeckBlend1', 'NeckBlend2', 'Head')


def add_neck_bones(arm) -> None:
    bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode='EDIT'); eb = arm.data.edit_bones
    nk = eb['Neck']; h = nk.head.copy(); t = nk.tail.copy(); roll = nk.roll
    for nm, a, b in (('NeckBlend1', 0.0, 0.5), ('NeckBlend2', 0.5, 1.0)):
        e = eb.new(nm); e.head = h.lerp(t, a); e.tail = h.lerp(t, b); e.roll = roll; e.parent = nk; e.use_connect = False; e.use_deform = True
    bpy.ops.object.mode_set(mode='POSE')
    for nm, inf in zip(('NeckBlend1', 'NeckBlend2'), NECK_INFLUENCE):
        pb = arm.pose.bones[nm]; pb.rotation_mode = 'XYZ'
        c = pb.constraints.new('COPY_ROTATION'); c.target = arm; c.subtarget = 'Head'; c.owner_space = c.target_space = 'LOCAL'; c.influence = inf
    bpy.ops.object.mode_set(mode='OBJECT')
    col = arm.data.collections.get('Than')
    if col:
        for nm in ('NeckBlend1', 'NeckBlend2'): col.assign(arm.data.bones[nm])


def _sm(a, b, t):
    u = np.clip((t - a) / (b - a), 0, 1); return u * u * (3 - 2 * u)


def set_neck_weights(body, z_lo: float = _P.get('zlo', 1.46), z_hi: float = 1.60, smooth_iter: int = _P.get('iter', 10)) -> None:
    """Gán lại trọng số xương vùng cổ (gradient). Chỉ động tới các nhóm là XƯƠNG (nhóm phụ cs_* giữ nguyên); vùng hàm/cằm cho Head đạt 1 sớm hơn JAW_SHIFT (3 cm)."""
    me = body.data; n = len(me.vertices)
    for nm in ('NeckBlend1', 'NeckBlend2'):
        if nm not in body.vertex_groups: body.vertex_groups.new(name=nm)
    names = [g.name for g in body.vertex_groups]; I = {x: i for i, x in enumerate(names)}; ng = len(names)
    bones = set(body.parent.data.bones.keys()) if body.parent is not None else {nm for nm in names if not nm.startswith('cs_')}
    cols = np.array([i for i, nm in enumerate(names) if nm in bones])
    W = np.zeros((n, ng), np.float32)
    for v in me.vertices:
        for g in v.groups: W[v.index, g.group] = g.weight
    co = np.zeros(n * 3); me.vertices.foreach_get('co', co); co = co.reshape(-1, 3); x, y, z = co[:, 0], co[:, 1], co[:, 2]
    nodes = [z_lo + t * (z_hi - z_lo) for t in NODE_T]
    z_eff = z + JAW_SHIFT * _jaw(y, z)                                        # vùng hàm/cằm: Head đạt 1 sớm hơn 3 cm (cằm gắn chặt vào đầu), không tạo mép cứng
    Wn = np.zeros((n, ng), np.float32)
    for k, bn in enumerate(NODE_BONES):
        onehot = [1.0 if j == k else 0.0 for j in range(len(NODE_BONES))]
        Wn[:, I[bn]] = np.interp(z_eff, nodes, onehot)
    a = (_sm(z_lo - 0.03, z_lo + 0.01, z) * (1 - _sm(0.07, 0.10, np.abs(x))))[:, None].astype(np.float32)   # trộn dần với trọng số cũ ở mép dưới và mép ngoài (|x|; thử khoảng cách tới trục cổ: B tự nó xấu hơn 11,8 so với 9,0 mm)
    Wb = W[:, cols]; Wnb = Wn[:, cols]
    Wb = (1 - a) * Wb + a * Wnb
    ea = np.zeros(len(me.edges) * 2, int); me.edges.foreach_get('vertices', ea); ea = ea.reshape(-1, 2); i0, i1 = ea[:, 0], ea[:, 1]
    deg = np.bincount(ea.ravel(), minlength=n).astype(np.float32).clip(1)
    mask = (a[:, 0] > 0) & (z < z_hi - 0.005)                                 # không đụng đỉnh z >= z_hi (Head = 1)
    for _ in range(smooth_iter):
        acc = np.stack([np.bincount(i0, Wb[i1, j], n) + np.bincount(i1, Wb[i0, j], n) for j in range(Wb.shape[1])], 1)
        Wb[mask] = 0.5 * Wb[mask] + 0.5 * acc[mask] / deg[mask, None]
    ch = a[:, 0] > 0
    Wb[ch] = Wb[ch] / Wb[ch].sum(1, keepdims=True); Wb[Wb < 1e-4] = 0
    chi = np.nonzero(ch)[0].tolist()
    for c in cols: body.vertex_groups[int(c)].remove(chi)                      # chỉ xoá nhóm xương trên đỉnh đã đổi
    nz = np.nonzero((Wb > 0) & ch[:, None])
    for vi, gj in zip(nz[0].tolist(), nz[1].tolist()): body.vertex_groups[int(cols[gj])].add([vi], float(Wb[vi, gj]), 'REPLACE')
    print(f'  cổ: {int(ch.sum())} đỉnh gán lại trọng số xương (nhóm phụ cs_* giữ nguyên), nút z = {[round(v, 3) for v in nodes]}')


def cs_weight(z, ax, y):
    """Trọng số nhóm cs_co theo toạ độ: z 1,46–1,61, |x| < 0,09–0,13, và LOẠI vùng hàm/cằm (y < −0,05, z > 1,55) để shape key miệng/cằm không bị làm mượt."""
    return _sm(1.46, 1.50, z) * (1 - _sm(CS_FADE[0], CS_FADE[1], z)) * (1 - _sm(0.09, 0.13, ax)) * (1 - _jaw(y, z))


def _jaw(y, z):
    """1 ở vùng hàm/cằm (y < −0,05 và z > 1,55), mềm dần ra ngoài."""
    return (1 - _sm(-0.05, -0.03, y)) * _sm(1.53, 1.55, z)


def add_neck_cs(body, iterations: int = _P.get('cs_iter', 150), factor: float = _P.get('cs_factor', 1.0)) -> None:
    """Corrective Smooth thứ hai riêng vùng cổ (nhóm cs_co, z 1,46–1,61, tắt hẳn từ z 1,61 để không chạm mặt), đặt SAU Armature và CorrectiveSmooth của vai/háng."""
    me = body.data; n = len(me.vertices)
    co = np.zeros(n * 3); me.vertices.foreach_get('co', co); co = co.reshape(-1, 3); ax = np.abs(co[:, 0]); z = co[:, 2]
    y = co[:, 1]; w = cs_weight(z, ax, y)
    vg = body.vertex_groups.get('cs_co') or body.vertex_groups.new(name='cs_co')
    vg.remove(list(range(n)))
    for i in np.nonzero(w > 1e-3)[0].tolist(): vg.add([i], float(w[i]), 'REPLACE')
    m = body.modifiers.get('CorrectiveSmoothCo') or body.modifiers.new('CorrectiveSmoothCo', 'CORRECTIVE_SMOOTH')
    m.factor = factor; m.iterations = iterations; m.scale = 1.0; m.smooth_type = 'LENGTH_WEIGHTED'; m.rest_source = 'ORCO'; m.vertex_group = 'cs_co'
    print(f'  cổ: Corrective Smooth riêng (iterations {iterations}, factor {factor}), nhóm cs_co {int((w > 1e-3).sum())} đỉnh')
