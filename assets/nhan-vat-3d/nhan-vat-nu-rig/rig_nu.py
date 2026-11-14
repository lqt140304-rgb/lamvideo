"""Rig cơ bản cho base nữ NHAN-VAT-NU-GOC-001 (LOD0), không sửa file base.

D:/blender/blender.exe -b --factory-startup --python rig_nu.py
Tùy chọn: SOI_DIR=<thư mục> để chụp các dáng thử thay vì lưu file.

Armature `Nu_Rig` (mét, nhân vật nhìn −Y, trái nhân vật = +X ⇒ đuôi .L), cùng tên xương với rig_nam.py:
  root → pelvis → spine1 → spine2 → chest → neck → head
  chest → clavicle.L/R → upper_arm → forearm → hand → {thumb,index,middle,ring,pinky}1→2→3 (dò từ lưới)
  pelvis → thigh.L/R → shin.L/R → foot.L/R → toe.L/R
  Điều khiển (không biến dạng): ik_hand/pole_elbow (IK tay), ik_foot/pole_knee (IK chân).
  Thuộc tính `ik_fk` (0 = FK, 1 = IK) trên hand.L/R (mặc định 0) và foot.L/R (mặc định 1).
  Thuộc tính `fist` (0–1) trên hand.L/R: nắm tay (driver cho 15 đốt). Ngón: X+ gập vào lòng bàn tay.
Trọng số: bone heat, rồi tách vùng tay/thân dưới nách (tay buông sát hông), đầu 100% xương head.
Lưới thưa (2.043 đỉnh): ngón có 3 đốt nhưng ít vòng lưới, khi gập còn góc cạnh.
"""
import math
import os
import sys
from pathlib import Path
import bpy
import numpy as np
from mathutils import Vector

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import mat_nu  # noqa: E402  (module bpy cạnh script)
SRC = HERE.parent / 'nhan-vat-nu-goc' / 'nhan-vat-nu-goc.blend'
OUT = HERE / 'nhan-vat-nu-rig.blend'

bpy.ops.wm.open_mainfile(filepath=str(SRC))
sc = bpy.context.scene
body = bpy.data.objects['Base_Nu_LOD0']
body.name = 'Nu_Than'
coll = body.users_collection[0]
coll.name = 'NU_RIG'

# texture da liền màu (tạo bằng `py -I da_lien_mau.py`), thay cho texture bộ đồ của base
for im in bpy.data.images:
    stem = Path(im.name).stem  # texture_diffuse …
    p = HERE / 'texture' / f'{stem}_da.png'
    assert p.is_file(), f'Thiếu {p.name}: chạy `py -I da_lien_mau.py` trước'
    if im.packed_file:
        im.unpack(method='REMOVE')
    im.filepath = str(p)
    im.reload()
    assert im.size[0] == 2048, im.name

# --- dò ngón tay trên lưới: hạ mặt cắt tới khi phần dưới bàn tay tách thành ≥5 mảng rời ---
NGON = ('thumb', 'index', 'middle', 'ring', 'pinky')
co0 = np.array([v.co for v in body.data.vertices])
E0 = np.array([e.vertices[:] for e in body.data.edges])


def manh(mask):
    """Các mảng liền cạnh trong tập đỉnh mask (≥6 đỉnh), xếp theo y tăng (trước → sau)."""
    adj = {i: [] for i in np.where(mask)[0]}
    for a, b in E0:
        if mask[a] and mask[b]:
            adj[a].append(b)
            adj[b].append(a)
    seen, out = set(), []
    for s0 in adj:
        if s0 in seen:
            continue
        st, c = [s0], []
        seen.add(s0)
        while st:
            x = st.pop()
            c.append(x)
            for w in adj[x]:
                if w not in seen:
                    seen.add(w)
                    st.append(w)
        if len(c) >= 6:
            out.append(np.array(c))
    return sorted(out, key=lambda c: co0[c][:, 1].mean())


def lat_cat(P, z, h):
    m = np.abs(P[:, 2] - z) <= h
    return P[m].mean(0) if m.any() else P[np.argmin(np.abs(P[:, 2] - z))]


def chuoi_ngon(s):
    """{ngón: (4 điểm khớp, chỉ số đỉnh của ngón)} cho tay dấu s (+1 trái, −1 phải)."""
    tay = (s * co0[:, 0] > 0.19) & (co0[:, 2] < 0.66) & (co0[:, 2] > 0.45)
    thumb = manh(tay & (co0[:, 2] < 0.60))[0]  # ngón cái tách sớm, nằm trước nhất
    for cut in np.arange(0.60, 0.52, -0.005):
        cs = [c for c in manh(tay & (co0[:, 2] < cut)) if not set(c) <= set(thumb)]
        if len(cs) >= 4:
            break
    assert len(cs) >= 4, f'Không tách được 4 ngón (tay {s:+d})'
    out = {}
    for n, c in zip(NGON[1:], cs[:4]):
        P = co0[c]
        top, bot = P[:, 2].max(), P[:, 2].min()
        L = top - bot
        h0 = lat_cat(P, top, 0.004) + np.array([0, 0, 0.008])
        out[n] = ([h0, lat_cat(P, top - L / 3, L / 8), lat_cat(P, top - 2 * L / 3, L / 8), P[np.argmin(P[:, 2])]], c)
    P = co0[thumb]
    goc = np.array([s * 0.248, -0.03, 0.625])
    xa = P[np.argmax(np.linalg.norm(P - goc, axis=1))]
    top = P[:, 2].max()
    out['thumb'] = ([goc, lat_cat(P, top, 0.006), (lat_cat(P, top, 0.006) + xa) / 2, xa], thumb)
    return out


NGON_LR = {'L': chuoi_ngon(1), 'R': chuoi_ngon(-1)}

# --- bảng xương (tên, cha, đầu, đuôi, deform), đo bằng tia cắt ngang lưới ---
B = []


def A(n, par, h, t, d=True):
    B.append((n, par, Vector(h), Vector(t), d))


A('root', None, (0, 0, 0), (0, 0.12, 0), False)
A('pelvis', 'root', (0, -0.005, 0.58), (0, -0.005, 0.70))
A('spine1', 'pelvis', (0, -0.005, 0.70), (0, -0.008, 0.82))
A('spine2', 'spine1', (0, -0.008, 0.82), (0, -0.008, 0.94))
A('chest', 'spine2', (0, -0.008, 0.94), (0, -0.005, 1.10))
A('neck', 'chest', (0, -0.005, 1.10), (0, -0.008, 1.215))
A('head', 'neck', (0, -0.008, 1.215), (0, -0.008, 1.72))
for s, k in ((1, 'L'), (-1, 'R')):
    X = lambda x: s * x
    A(f'clavicle.{k}', 'chest', (X(0.02), -0.005, 1.09), (X(0.15), 0.015, 1.045))
    A(f'upper_arm.{k}', f'clavicle.{k}', (X(0.165), 0.02, 1.03), (X(0.222), 0.025, 0.80))
    A(f'forearm.{k}', f'upper_arm.{k}', (X(0.222), 0.025, 0.80), (X(0.255), 0.005, 0.645))
    A(f'hand.{k}', f'forearm.{k}', (X(0.255), 0.005, 0.645), (X(0.265), -0.005, 0.575))
    A(f'MCH_fist.{k}', f'hand.{k}', (X(0.255), 0.005, 0.645), (X(0.255), 0.005, 0.625), False)  # xương phụ cho fist
    for n, (pts, _) in NGON_LR[k].items():
        for j in range(3):
            A(f'{n}{j + 1}.{k}', f'hand.{k}' if j == 0 else f'{n}{j}.{k}', pts[j], pts[j + 1])
    A(f'thigh.{k}', 'pelvis', (X(0.09), -0.01, 0.58), (X(0.10), -0.018, 0.33))
    A(f'shin.{k}', f'thigh.{k}', (X(0.10), -0.018, 0.33), (X(0.108), 0.0, 0.09))
    A(f'foot.{k}', f'shin.{k}', (X(0.108), 0.0, 0.09), (X(0.115), -0.12, 0.03))
    A(f'toe.{k}', f'foot.{k}', (X(0.115), -0.12, 0.03), (X(0.12), -0.19, 0.02))
    A(f'ik_hand.{k}', 'root', (X(0.255), 0.005, 0.645), (X(0.265), -0.005, 0.575), False)
    A(f'pole_elbow.{k}', 'root', (X(0.222), 0.45, 0.80), (X(0.222), 0.50, 0.80), False)
    A(f'ik_foot.{k}', 'root', (X(0.108), 0.0, 0.09), (X(0.115), -0.12, 0.03), False)
    A(f'pole_knee.{k}', 'root', (X(0.10), -0.45, 0.33), (X(0.10), -0.50, 0.33), False)

arm_d = bpy.data.armatures.new('Nu_Rig')
arm_d.display_type = 'STICK'
rig = bpy.data.objects.new('Nu_Rig', arm_d)
coll.objects.link(rig)
rig.show_in_front = True
bpy.context.view_layer.objects.active = rig
bpy.ops.object.mode_set(mode='EDIT')
for n, par, h, t, d in B:
    e = arm_d.edit_bones.new(n)
    e.head, e.tail, e.use_deform = h, t, d
    if par:
        e.parent = arm_d.edit_bones[par]
        e.use_connect = (e.head - arm_d.edit_bones[par].tail).length < 1e-4
    # trục Z của xương hướng ra trước (−Y): gập khớp quanh trục X cục bộ
    goc_ten = n.split('.')[0].rstrip('123')
    sg = 1 if n.endswith('.L') else -1
    if goc_ten in ('foot', 'toe', 'ik_foot', 'root', 'pole_knee'):
        e.align_roll(Vector((0, 0, 1)))
    elif goc_ten in NGON:  # X+ gập ngón vào lòng bàn tay
        e.align_roll(Vector((-sg, 0.8, 0)) if goc_ten == 'thumb' else Vector((-sg, 0, 0)))
    else:
        e.align_roll(Vector((0, -1, 0)))
bpy.ops.object.mode_set(mode='OBJECT')

# bone collections
groups = {'Than': ['root', 'pelvis', 'spine1', 'spine2', 'chest', 'neck', 'head'],
          'Tay': ['clavicle', 'upper_arm', 'forearm', 'hand'], 'Ngon': [f'{n}{j}' for n in NGON for j in (1, 2, 3)],
          'Tay_IK': ['ik_hand', 'pole_elbow'], 'Chan_IK': ['ik_foot', 'pole_knee'], 'Chan_deform': ['thigh', 'shin', 'foot', 'toe'], 'MCH': ['MCH_fist']}
for g, names in groups.items():
    bc = arm_d.collections.new(g)
    for b in arm_d.bones:
        if b.name.split('.')[0] in names:
            bc.assign(b)
arm_d.collections['Chan_deform'].is_visible = False
arm_d.collections['MCH'].is_visible = False

# --- IK tay/chân với công tắc ik_fk (0 = FK, 1 = IK), nắm tay ---
pb = rig.pose.bones


def them_ik(chi, dau, ik, pole, mac_dinh):
    """IK 2 đoạn cho `chi` (forearm/shin) + bàn xoay theo `ik`; ik_fk trên xương `dau` lái độ ảnh hưởng."""
    c = pb[chi].constraints.new('IK')
    c.target, c.subtarget = rig, ik
    c.pole_target, c.pole_subtarget = rig, pole
    c.chain_count = 2
    cr = pb[dau].constraints.new('COPY_ROTATION')
    cr.target, cr.subtarget = rig, ik
    pb[dau]['ik_fk'] = mac_dinh
    pb[dau].id_properties_ui('ik_fk').update(min=0.0, max=1.0, soft_min=0.0, soft_max=1.0)
    for con in (c, cr):
        fc = con.driver_add('influence')
        v = fc.driver.variables.new()
        v.name = 'k'
        v.targets[0].id = rig
        v.targets[0].data_path = f'pose.bones["{dau}"]["ik_fk"]'
        fc.driver.expression = 'k'
    return c


for k in 'LR':
    them_ik(f'shin.{k}', f'foot.{k}', f'ik_foot.{k}', f'pole_knee.{k}', 1.0)
    them_ik(f'forearm.{k}', f'hand.{k}', f'ik_hand.{k}', f'pole_elbow.{k}', 0.0)
    pb[f'shin.{k}'].ik_min_x, pb[f'shin.{k}'].use_ik_limit_x = 0, True  # gối chỉ gập ra sau
    h = pb[f'hand.{k}']
    h['fist'] = 0.0
    h.id_properties_ui('fist').update(min=0.0, max=1.0, soft_min=0.0, soft_max=1.0)
    # fist → xương phụ MCH_fist (driver vị trí Y) → ràng buộc Transformation CỘNG độ gập vào từng đốt.
    # Không đặt driver thẳng lên kênh xoay của ngón, để người diễn hoạt vẫn xoay từng ngón được.
    fc = pb[f'MCH_fist.{k}'].driver_add('location', 1)
    v = fc.driver.variables.new()
    v.name = 'f'
    v.targets[0].id = rig
    v.targets[0].data_path = f'pose.bones["hand.{k}"]["fist"]'
    fc.driver.expression = 'f'
    for bn, amt in [(f'{n}{j}.{k}', a) for n in NGON for j, a in zip((1, 2, 3), (0.5, 0.6, 0.5) if n == 'thumb' else (1.0, 1.2, 0.9))]:
        p = pb[bn]
        p.rotation_mode = 'XYZ'
        c = p.constraints.new('TRANSFORM')
        c.name = 'NAM_TAY'
        c.target, c.subtarget = rig, f'MCH_fist.{k}'
        c.target_space = c.owner_space = 'LOCAL'
        c.map_from, c.map_to = 'LOCATION', 'ROTATION'
        c.from_min_y, c.from_max_y = 0.0, 1.0
        c.map_to_x_from = 'Y'
        c.to_min_x_rot, c.to_max_x_rot = 0.0, amt
        c.mix_mode_rot = 'ADD'

# chọn pole_angle để dáng nghỉ giữ nguyên khi bật IK (thử 4 góc, lấy sai lệch nhỏ nhất)
def chon_pole_angle(chi, dau):
    pb[dau]['ik_fk'] = 1.0
    rig.update_tag()
    bpy.context.view_layer.update()
    rest = rig.data.bones[chi].matrix_local.copy()
    best = None
    for ang in (-90, 0, 90, 180):
        pb[chi].constraints['IK'].pole_angle = math.radians(ang)
        rig.update_tag()
        bpy.context.view_layer.update()
        err = sum(abs(a - b) for ra, rb in zip(pb[chi].matrix, rest) for a, b in zip(ra, rb))
        if best is None or err < best[0]:
            best = (err, ang)
    pb[chi].constraints['IK'].pole_angle = math.radians(best[1])
    assert best[0] < 0.02, f'IK {chi} làm lệch dáng nghỉ: {best}'
    return best[1]


for k in 'LR':
    chon_pole_angle(f'shin.{k}', f'foot.{k}')
    chon_pole_angle(f'forearm.{k}', f'hand.{k}')
    pb[f'hand.{k}']['ik_fk'] = 0.0
rig.update_tag()
bpy.context.view_layer.update()

# --- gắn lưới + trọng số ---
for o in sc.objects:
    o.select_set(False)
body.select_set(True)
rig.select_set(True)
bpy.context.view_layer.objects.active = rig
bpy.ops.object.parent_set(type='ARMATURE_AUTO')
me = body.data
co = np.array([v.co for v in me.vertices])
deform = [b.name for b in arm_d.bones if b.use_deform]
gi = {vg.name: vg.index for vg in body.vertex_groups}
seg = {n: (np.array(arm_d.bones[n].head_local), np.array(arm_d.bones[n].tail_local)) for n in deform}


def dist(n):
    a, b = seg[n]
    t = np.clip(((co - a) @ (b - a)) / ((b - a) @ (b - a)), 0, 1)
    return np.linalg.norm(co - (a + t[:, None] * (b - a)), axis=1)


D = np.stack([dist(n) for n in deform], 1)
near = np.array(deform)[D.argmin(1)]
ARM = ('upper_arm', 'forearm', 'hand') + tuple(f'{n}{j}' for n in NGON for j in (1, 2, 3))
is_arm_bone = lambda n: n.split('.')[0] in ARM
W = np.zeros((len(co), len(deform)))
for j, n in enumerate(deform):
    if n in gi:
        g = gi[n]
        for v in me.vertices:
            for x in v.groups:
                if x.group == g:
                    W[v.index, j] = x.weight
arm_cols = np.array([is_arm_bone(n) for n in deform])
side = np.array([n.split('.')[-1] if '.' in n else '' for n in deform])
# dưới nách tay và thân là hai mảng lưới rời: loang theo cạnh từ đầu ngón tay để biết đỉnh nào thuộc tay
below = co[:, 2] < 0.95
adj = [[] for _ in co]
for e in me.edges:
    a, b = e.vertices
    if below[a] and below[b]:
        adj[a].append(b)
        adj[b].append(a)
arm_v = {}
for k, sg in (('L', 1), ('R', -1)):
    tip = int(np.argmax(np.where(below, sg * co[:, 0], -9)))
    seen = {tip}
    st = [tip]
    while st:
        for w in adj[st.pop()]:
            if w not in seen:
                seen.add(w)
                st.append(w)
    m = np.zeros(len(co), bool)
    m[list(seen)] = True
    assert 30 < m.sum() < len(co) * 0.2, f'Vùng tay {k} bất thường: {m.sum()} đỉnh'
    arm_v[k] = m
    W[np.ix_(m, ~(arm_cols & (side == k)))] = 0  # đỉnh tay chỉ theo xương tay cùng bên
# ngón: mỗi mảng ngón dò ở trên chỉ theo 3 đốt của nó, chuyển mềm quanh khớp (bone heat lẫn ngón)
def sstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


for k in 'LR':
    for n, (pts, idx) in NGON_LR[k].items():
        P = co[idx]
        best = np.full(len(P), np.inf)
        arc = np.zeros(len(P))
        acc = 0.0
        J = []
        for j in range(3):
            a, b = pts[j], pts[j + 1]
            L = np.linalg.norm(b - a)
            t = np.clip(((P - a) @ (b - a)) / max(L * L, 1e-9), 0, 1)
            dd = np.linalg.norm(P - (a + t[:, None] * (b - a)), axis=1)
            m = dd < best
            best[m], arc[m] = dd[m], acc + t[m] * L
            acc += L
            J.append(acc)
        e = 0.004
        w1 = 1 - sstep(J[0] - e, J[0] + e, arc)
        w3 = sstep(J[1] - e, J[1] + e, arc)
        W[idx] = 0
        for j, w in enumerate((w1, 1 - w1 - w3, w3)):
            W[idx, deform.index(f'{n}{j + 1}.{k}')] = w
not_arm = below & ~arm_v['L'] & ~arm_v['R']
W[np.ix_(not_arm, arm_cols)] = 0  # hông/đùi không theo tay
head_j = deform.index('head')
W[co[:, 2] > 1.215] = 0
W[co[:, 2] > 1.215, head_j] = 1
zero = W.sum(1) < 1e-6
W[zero, D[zero].argmin(1)] = 1
W /= W.sum(1, keepdims=True)
for vg in list(body.vertex_groups):
    body.vertex_groups.remove(vg)
for j, n in enumerate(deform):
    vg = body.vertex_groups.new(name=n)
    for i in np.where(W[:, j] > 1e-3)[0]:
        vg.add([int(i)], float(W[i, j]), 'REPLACE')
assert all(len(v.groups) > 0 for v in me.vertices), 'Còn đỉnh không có trọng số'

# --- kiểm nhanh: tay không kéo hông, IK nhấc chân được ---
dg = bpy.context.evaluated_depsgraph_get


def eval_co():
    bpy.context.view_layer.update()
    return np.array([v.co for v in body.evaluated_get(dg()).to_mesh().vertices])


base = eval_co()
pb['upper_arm.L'].rotation_mode = 'XYZ'
pb['upper_arm.L'].rotation_euler.x = math.radians(70)
moved = np.linalg.norm(eval_co() - base, axis=1)
hip = (co[:, 0] > 0.05) & (co[:, 0] < 0.17) & (co[:, 2] < 0.8)
bad = np.where(hip & (moved > 0.005))[0]
for i in bad[:12]:
    print('BAD', co[i].round(3), near[i], {deform[j]: round(W[i, j], 2) for j in np.where(W[i] > 0.01)[0]}, round(moved[i], 3))
assert moved[hip].max() < 0.005, f'Nâng tay trái làm hông xê dịch {moved[hip].max():.3f} m'
pb['upper_arm.L'].rotation_euler.x = 0
pb['ik_foot.L'].location.z = 0.15  # trục Y cục bộ của ik_foot ~ hướng lên
moved = eval_co() - base
pb['ik_foot.L'].location.z = 0
foot = (co[:, 0] > 0.05) & (co[:, 2] < 0.08)
print(f'IK: bàn chân trái đi {np.linalg.norm(moved[foot], axis=1).mean():.3f} m')
assert np.linalg.norm(moved[foot], axis=1).mean() > 0.05, 'IK chân không kéo bàn chân'

# --- mặt: mắt (sau các kiểm thân vì khoét hốc làm đổi chỉ số đỉnh) ---
mat_nu.dung_mat(body, rig, coll)
rig.update_tag()
bpy.context.view_layer.update()

# --- ảnh dáng thử (tùy chọn) ---
soi = os.environ.get('SOI_DIR')
if soi:
    sc.render.engine = 'BLENDER_EEVEE'
    sc.render.resolution_x, sc.render.resolution_y = 384, 512
    for n, rot in (('k1', (0.9, 0, 0.5)), ('k2', (1.1, 0, 3.6))):
        L = bpy.data.lights.new(n, 'SUN')
        L.energy = 3
        o = bpy.data.objects.new(n, L)
        sc.collection.objects.link(o)
        o.rotation_euler = rot
    sc.world = sc.world or bpy.data.worlds.new('w')
    sc.world.use_nodes = True
    sc.world.node_tree.nodes['Background'].inputs[1].default_value = 0.5
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
    sc.collection.objects.link(cam)
    sc.camera = cam
    cam.data.lens = 50

    def shot(name, loc=(1.6, -3.4, 1.0), aim=(0, 0, 0.85)):
        cam.location = loc
        cam.rotation_euler = (Vector(aim) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = f'{soi}/{name}.png'
        bpy.ops.render.render(write_still=True)

    def reset():
        for p in pb:
            p.location = (0, 0, 0)
            p.rotation_mode = 'XYZ'
            p.rotation_euler = (0, 0, 0)
            if 'fist' in p:
                p['fist'] = 0.0

    shot('0_nghi')
    for k, s in (('L', 1), ('R', -1)):
        pb[f'upper_arm.{k}'].rotation_euler = (0, 0, 0)
    pb['upper_arm.L'].rotation_euler.x = math.radians(80)   # X+ : đưa tay ra trước
    pb['forearm.L'].rotation_euler.x = math.radians(70)   # X+ : gập khuỷu
    pb['hand.L']['fist'] = 1.0
    pb['upper_arm.R'].rotation_euler.z = math.radians(-75)   # tay phải dang bằng Z−, tay trái Z+
    pb['forearm.R'].rotation_euler.x = math.radians(30)
    pb['head'].rotation_euler.z = math.radians(25)
    pb['spine2'].rotation_euler.x = math.radians(10)
    shot('1_tay')
    shot('1b_tay_can', loc=(1.4, -1.6, 1.2), aim=(0.05, 0, 0.95))
    shot('1c_nam_tay', loc=(0.9, -0.9, 1.05), aim=(0.18, -0.25, 0.95))
    reset()
    pb['ik_foot.L'].location.z = 0.18
    pb['ik_foot.L'].location.y = -0.05
    pb['pelvis'].location.y = -0.05
    pb['upper_arm.L'].rotation_euler.x = math.radians(30)
    pb['upper_arm.R'].rotation_euler.x = math.radians(-30)
    shot('2_buoc', loc=(3.2, -1.6, 0.9))
    reset()
    pb['upper_arm.L'].rotation_euler.z = math.radians(80)
    pb['upper_arm.R'].rotation_euler.z = math.radians(-80)
    shot('3_dang', loc=(0, -3.6, 1.0))
    raise SystemExit(0)

# --- lưu: texture trỏ sang texture/ của thư mục rig, không đóng gói ---
for o in sc.objects:
    o.select_set(False)
rig.select_set(True)
bpy.context.view_layer.objects.active = rig
sc['ma_asset'] = 'NHAN-VAT-NU-RIG-001'
sc['nguon'] = 'nhan-vat-nu-goc.blend (NHAN-VAT-NU-GOC-001)'
sc['trang_thai'] = 'Rig cơ bản: thân/tay FK, chân IK, nắm tay; chưa mặt, chưa nghiệm thu chuyển động'
for t in list(bpy.data.texts):
    bpy.data.texts.remove(t)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT), compress=True)
bpy.ops.file.make_paths_relative()  # texture/… tương đối với file rig
bpy.ops.wm.save_mainfile(compress=True)
print('PASS: đã lưu', OUT.name)
