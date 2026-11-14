"""RIG THỬ cho NHAN-VAT-GOC-001 (Blender 5.2.x, bpy).

Chạy (trong thư mục này):
  blender -b --factory-startup --python rig_goc.py -- --out nhan-vat-goc-rig-thu.blend [--anh xem-thu]
  hoặc: python rig_goc.py --out ... (khi cài gói bpy)

Không sửa file nguồn `../nhan-vat-goc.blend`; mở nó, chỉ giữ LOD0, thêm armature rồi lưu ra file khác.
Armature `Goc_Rig` (m, mặt −Y, trái nhân vật = +X ⇒ đuôi .L), tên xương theo rig_nam.py của Hồ sơ 02:
  root → pelvis → spine1 → spine2 → chest → neck → head
  chest → clavicle → upper_arm → forearm → hand;  pelvis → thigh → shin → foot → toe
  Điều khiển: ik_foot/pole_knee (IK chân), ik_hand/pole_elbow (IK tay, thuộc tính `ik` 0=FK…1=IK trên ik_hand).
Trọng số: bone heat trên LOD3 (cùng hình khối, 27k đỉnh) → Data Transfer sang LOD0 → luật vùng
  (bên trái/phải, tay không kéo đùi, đầu+tóc cứng theo head) → làm mượt Laplace.
Chưa có: xương ngón, hàm/mắt/mí, shape key; tóc liền đầu nên đi cứng theo đầu.
"""
import sys, os, math, argparse, time
import bpy
import numpy as np
from mathutils import Vector, Matrix
from mathutils.kdtree import KDTree

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'nhan-vat-goc.blend')

# ---- mốc khớp, đo trên lưới LOD0 (lát cắt theo z, xem README) — bên trái nhân vật (+X) ----
J = dict(
    pelvis=(0, -0.010, 0.50), spine1=(0, -0.005, 0.60), spine2=(0, 0.000, 0.70), chest=(0, 0.005, 0.80),
    neck=(0, 0.010, 0.93), head=(0, 0.005, 1.015), head_top=(0, 0.005, 1.45),
    clav=(0.025, 0.010, 0.905), shoulder=(0.172, 0.018, 0.875), elbow=(0.250, 0.024, 0.705),
    wrist=(0.279, -0.025, 0.525), hand_end=(0.284, -0.045, 0.462),
    hip=(0.100, -0.015, 0.530), knee=(0.124, -0.030, 0.285), ankle=(0.130, -0.005, 0.100),
    ball=(0.135, -0.150, 0.030), toe=(0.135, -0.250, 0.030),
)
VAI_PHU = 0.5           # tỉ lệ góc bắp tay truyền cho xương phụ vai
HEAD_Z = 1.035          # trên mức này (và cằm) = 100% xương head
ARM_CUT = (0.17, 0.86)  # loang từ đầu ngón tay, không qua |x|<0,17 hay z>0,86 ⇒ vùng tay (tay chỉ dính thân từ nách z≈0,70 trở lên)


# ---- ngón tay: tâm từng ngón theo trục y (đo bằng lát cắt bàn tay; ngón cái đứng riêng ở mặt trong, phía trước) ----
FINGER_Y = {'index': -0.113, 'middle': -0.061, 'ring': -0.022, 'pinky': 0.019}
FINGER_SPLIT = (0.42, 0.32, 0.26)      # tỉ lệ chiều dài 3 đốt (gốc → đầu ngón)
FINGER_CURL = {'index': (50, 70, 45), 'middle': (50, 70, 45), 'ring': (50, 70, 45), 'pinky': (50, 70, 45), 'thumb': (12, 30, 40)}   # độ gập khi nam = 1
A_DEG = 0.0
CONTACT_D = 0.03       # đỉnh tay/thân cách phía bên kia dưới mức này = vùng tiếp xúc nách
CONTACT_IT = 150
CUT_D = 0.012          # bỏ hẳn dải dính tay–thân (cách phía bên kia < 12 mm, z 0,62–0,90) rồi vá màng da mới
AP = np.eye(4)                          # khung dáng chữ A → khung tay buông (bên L); đơn vị nếu không chuyển dáng
CH = {}                                 # tên ngón → 4 điểm (bên L): gốc, khớp 1, khớp 2, đầu ngón


def split_poly(P, fr):
    P = np.asarray(P, float); L = np.r_[0, np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=1))]
    out = []
    for f in np.r_[0, np.cumsum(fr)]:
        t = min(f, 1.0) * L[-1]; j = min(np.searchsorted(L, t, side='right') - 1, len(P) - 2)
        u = (t - L[j]) / max(L[j + 1] - L[j], 1e-9); out.append(P[j] + u * (P[j + 1] - P[j]))
    return [Vector(p) for p in out]


def measure_fingers(co, arm_reg):
    """Đường tâm 4 ngón và ngón cái bên trái (+X) từ lưới: tâm lát cắt theo z, thêm đầu ngón = đỉnh thấp nhất."""
    x, y, z = co.T
    for nm, yc in FINGER_Y.items():
        band = arm_reg & (x > 0.228) & (np.abs(y - yc) < 0.016) & (z < 0.47) & (z > 0.30)
        pts = []
        for zz in np.arange(0.466, 0.380, -0.004):
            m = band & (np.abs(z - zz) < 0.0018)
            if m.sum() >= 6: pts.append((x[m].mean(), y[m].mean(), zz))
        tip = co[band & (np.abs(y - yc) < 0.012)][np.argmin(z[band & (np.abs(y - yc) < 0.012)])]
        CH[nm] = split_poly(pts + [tuple(tip)], FINGER_SPLIT)
    band = arm_reg & (x > 0.17) & (x < 0.228) & (y < -0.10) & (z > 0.405) & (z < 0.50)
    pts = [(0.252, -0.078, 0.505)]
    for zz in np.arange(0.482, 0.416, -0.004):
        m = band & (np.abs(z - zz) < 0.0018)
        if m.sum() >= 6: pts.append((x[m].mean(), y[m].mean(), zz))
    tip = co[band][np.argmin(z[band])]
    CH['thumb'] = split_poly(pts + [tuple(tip)], (0.40, 0.32, 0.28))
    for nm, P in CH.items():
        print(f'  ngón {nm:6s}: gốc ({P[0].x:.3f},{P[0].y:.3f},{P[0].z:.3f}) → đầu ({P[3].x:.3f},{P[3].y:.3f},{P[3].z:.3f}), dài {sum((P[i + 1] - P[i]).length for i in range(3)) * 1000:.0f} mm')


def V(name, s=1):
    x, y, z = J[name]; return Vector((s * x, y, z))


def bone_table():
    B = []
    A = lambda n, par, h, t, d=True: B.append((n, par, Vector(h), Vector(t), d))
    A('root', None, (0, 0, 0), (0, 0, 0.12), False)
    A('pelvis', 'root', V('pelvis'), V('spine1'))
    A('spine1', 'pelvis', V('spine1'), V('spine2'))
    A('spine2', 'spine1', V('spine2'), V('chest'))
    A('chest', 'spine2', V('chest'), V('neck'))
    A('neck', 'chest', V('neck'), V('head'))
    A('head', 'neck', V('head'), V('head_top'))
    for s, k in ((1, 'L'), (-1, 'R')):
        A(f'clavicle.{k}', 'chest', V('clav', s), V('shoulder', s))
        A(f'upper_arm.{k}', f'clavicle.{k}', V('shoulder', s), V('elbow', s))
        A(f'vai_phu.{k}', f'clavicle.{k}', V('shoulder', s), V('shoulder', s).lerp(V('elbow', s), 0.35))
        A(f'forearm.{k}', f'upper_arm.{k}', V('elbow', s), V('wrist', s))
        A(f'hand.{k}', f'forearm.{k}', V('wrist', s), V('hand_end', s))
        for nm, P in CH.items():
            M = lambda v: Vector((s * v.x, v.y, v.z))
            for i in range(3):
                A(f'{nm}{i + 1}.{k}', f'hand.{k}' if i == 0 else f'{nm}{i}.{k}', M(P[i]), M(P[i + 1]))
        A(f'thigh.{k}', 'pelvis', V('hip', s), V('knee', s))
        A(f'shin.{k}', f'thigh.{k}', V('knee', s), V('ankle', s))
        A(f'foot.{k}', f'shin.{k}', V('ankle', s), V('ball', s))
        A(f'toe.{k}', f'foot.{k}', V('ball', s), V('toe', s))
        A(f'ik_foot.{k}', 'root', V('ankle', s), V('ball', s), False)
        A(f'pole_knee.{k}', 'root', V('knee', s) + Vector((0, -0.45, 0)), V('knee', s) + Vector((0, -0.50, 0)), False)
        A(f'ik_hand.{k}', 'root', V('wrist', s), V('hand_end', s), False)
        A(f'pole_elbow.{k}', 'root', V('elbow', s) + Vector((0, 0.40, 0)), V('elbow', s) + Vector((0, 0.45, 0)), False)
    return B


def build_armature(sc):
    ad = bpy.data.armatures.new('Goc_Rig'); ob = bpy.data.objects.new('Goc_Rig', ad); sc.collection.objects.link(ob)
    ad.display_type = 'STICK'; ob.show_in_front = True
    bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.object.mode_set(mode='EDIT')
    eb = ad.edit_bones; T = bone_table()
    for n, par, h, t, d in T:
        b = eb.new(n); b.head = h; b.tail = t; b.use_deform = d
    for n, par, h, t, d in T:
        if par:
            eb[n].parent = eb[par]
            eb[n].use_connect = (not n.startswith(('thigh', 'clavicle', 'ik_', 'pole_'))) and (eb[n].head - eb[par].tail).length < 1e-5
    # roll: gập khuỷu/gối quanh trục X cục bộ ⇒ đặt trục Z cục bộ của xương tay/chân về −Y (phía trước)
    for k in 'LR':
        for n in (f'upper_arm.{k}', f'vai_phu.{k}', f'forearm.{k}', f'hand.{k}', f'ik_hand.{k}', f'thigh.{k}', f'shin.{k}'):
            eb[n].align_roll(Vector((0, -1, 0)))
        sx = 1 if k == 'L' else -1
        for nm in CH:
            for i in (1, 2, 3):        # trục Z cục bộ hướng vào lòng bàn tay (ngón cái: hướng về các ngón)
                eb[f'{nm}{i}.{k}'].align_roll(Vector((sx, 0.7, 0)) if nm == 'thumb' else Vector((-sx, 0, 0)))
    bpy.ops.object.mode_set(mode='POSE'); pb = ob.pose.bones
    for b in pb: b.rotation_mode = 'XYZ'
    for k in 'LR':
        c = pb[f'shin.{k}'].constraints.new('IK'); c.target = ob; c.subtarget = f'ik_foot.{k}'; c.chain_count = 2
        c.pole_target = ob; c.pole_subtarget = f'pole_knee.{k}'; c.pole_angle = math.radians(-90)
        cf = pb[f'foot.{k}'].constraints.new('COPY_ROTATION'); cf.target = ob; cf.subtarget = f'ik_foot.{k}'
        for n in (f'thigh.{k}', f'shin.{k}'): pb[n].lock_ik_y = True
        h = pb[f'ik_hand.{k}']; h['ik'] = 0.0
        h.id_properties_ui('ik').update(min=0.0, max=1.0, description='0 = FK (xoay tay), 1 = IK (kéo ik_hand)')
        c = pb[f'forearm.{k}'].constraints.new('IK'); c.target = ob; c.subtarget = f'ik_hand.{k}'; c.chain_count = 2
        c.pole_target = ob; c.pole_subtarget = f'pole_elbow.{k}'; c.pole_angle = math.radians(-90)
        ch = pb[f'hand.{k}'].constraints.new('COPY_ROTATION'); ch.target = ob; ch.subtarget = f'ik_hand.{k}'
        for con in (c, ch):
            d = con.driver_add('influence').driver; d.type = 'AVERAGE'
            v = d.variables.new(); v.type = 'SINGLE_PROP'; v.targets[0].id = ob; v.targets[0].data_path = f'pose.bones["ik_hand.{k}"]["ik"]'
    bpy.ops.object.mode_set(mode='OBJECT')
    calibrate_poles(ob)
    finger_drivers(ob)
    for k in 'LR':      # xương phụ vai: theo một nửa góc xoay của bắp tay ⇒ khớp vai gập trên dải rộng hơn
        c = ob.pose.bones[f'vai_phu.{k}'].constraints.new('COPY_ROTATION'); c.target = ob; c.subtarget = f'upper_arm.{k}'
        c.owner_space = c.target_space = 'LOCAL'; c.influence = VAI_PHU
    groups = {'Than': ('root', 'pelvis', 'spine1', 'spine2', 'chest', 'neck', 'head'),
              'Tay_FK': tuple(f'{n}.{k}' for k in 'LR' for n in ('clavicle', 'upper_arm', 'forearm', 'hand', 'vai_phu')),
              'Tay_IK': tuple(f'{n}.{k}' for k in 'LR' for n in ('ik_hand', 'pole_elbow')),
              'Chan_IK': tuple(f'{n}.{k}' for k in 'LR' for n in ('ik_foot', 'pole_knee')),
              'Chan_deform': tuple(f'{n}.{k}' for k in 'LR' for n in ('thigh', 'shin', 'foot', 'toe')),
              'Ngon': tuple(f'{n}{i}.{k}' for k in 'LR' for n in CH for i in (1, 2, 3))}
    for nm, bones in groups.items():
        c = ad.collections.new(nm)
        for b in bones: c.assign(ad.bones[b])
    return ob


FINGER_PROPS = {'index': 'nam_tro', 'middle': 'nam_giua', 'ring': 'nam_ap', 'pinky': 'nam_ut', 'thumb': 'nam_cai'}


def finger_drivers(ob):
    """Thuộc tính trên hand.L/R: `nam` (cả bàn tay) và nam_tro/giua/ap/ut/cai (từng ngón), 0–1; độ gập = min(1, nam + nam_<ngón>).
    Chiều quay dò bằng thử: xoay +X phải đưa đầu xương về phía lòng bàn tay (ngón cái: về phía các ngón)."""
    pb = ob.pose.bones
    for k, sx in (('L', 1), ('R', -1)):
        hb = pb[f'hand.{k}']
        for pr in ('nam',) + tuple(FINGER_PROPS.values()):
            hb[pr] = 0.0; hb.id_properties_ui(pr).update(min=0.0, max=1.0, description='Nắm 0–1')
        for nm, angs in FINGER_CURL.items():
            want = Vector((sx, 0.7, 0)).normalized() if nm == 'thumb' else Vector((-sx, 0, 0))
            for i, deg in enumerate(angs, 1):
                b = pb[f'{nm}{i}.{k}']; b.rotation_euler = (0, 0, 0); bpy.context.view_layer.update(); t0 = b.tail.copy()
                b.rotation_euler = (0.3, 0, 0); bpy.context.view_layer.update(); sg = 1 if (b.tail - t0).dot(want) > 0 else -1
                b.rotation_euler = (0, 0, 0)
                d = b.driver_add('rotation_euler', 0).driver; d.type = 'SCRIPTED'
                for vn, pr in (('n', 'nam'), ('m', FINGER_PROPS[nm])):
                    v = d.variables.new(); v.name = vn; v.type = 'SINGLE_PROP'; v.targets[0].id = ob; v.targets[0].data_path = f'pose.bones["hand.{k}"]["{pr}"]'
                d.expression = f'{sg * math.radians(deg):.4f}*min(1.0, n + m)'
    bpy.context.view_layer.update()


def calibrate_poles(ob):
    """Chọn pole_angle để IK không xoắn tay/chân ở dáng nghỉ (sai lệch ma trận xương so với rest nhỏ nhất)."""
    pb = ob.pose.bones
    for k in 'LR':
        for chain, ctl in (((f'thigh.{k}', f'shin.{k}'), None), ((f'upper_arm.{k}', f'forearm.{k}'), f'ik_hand.{k}')):
            con = pb[chain[1]].constraints['IK']
            if ctl: pb[ctl]['ik'] = 1.0
            def err():
                bpy.context.view_layer.update()
                return sum((pb[n].matrix - pb[n].bone.matrix_local).to_3x3().to_scale().length + sum(abs(a - b) for ra, rb in zip(pb[n].matrix, pb[n].bone.matrix_local) for a, b in zip(ra, rb)) for n in chain)
            best = min(range(-180, 180, 2), key=lambda d: (setattr(con, 'pole_angle', math.radians(d)), err())[1])
            fine = min((best + t * 0.25 for t in range(-8, 9)), key=lambda d: (setattr(con, 'pole_angle', math.radians(d)), err())[1])
            con.pole_angle = math.radians(fine); e = err()
            if ctl: pb[ctl]['ik'] = 0.0
            print(f'  pole {chain[1]}: {fine:.2f}°, sai lệch {e:.5f}')
    bpy.context.view_layer.update()


def edges_np(me):
    ed = np.zeros(len(me.edges) * 2, np.int64); me.edges.foreach_get('vertices', ed); return ed[0::2], ed[1::2]


def mesh_co(ob):
    a = np.zeros(len(ob.data.vertices) * 3); ob.data.vertices.foreach_get('co', a); return a.reshape(-1, 3)


def bind(sc, arm, body, proxy):
    t0 = time.time()
    bpy.ops.object.select_all(action='DESELECT'); proxy.select_set(True); arm.select_set(True); bpy.context.view_layer.objects.active = arm
    bpy.ops.object.parent_set(type='ARMATURE_AUTO')
    print(f'  bone heat trên proxy {len(proxy.data.vertices)} đỉnh: {time.time() - t0:.1f}s, {len(proxy.vertex_groups)} nhóm')
    for vg in proxy.vertex_groups:
        if vg.name not in body.vertex_groups: body.vertex_groups.new(name=vg.name)
    dt = body.modifiers.new('DT', 'DATA_TRANSFER'); dt.object = proxy; dt.use_vert_data = True; dt.data_types_verts = {'VGROUP_WEIGHTS'}
    dt.vert_mapping = 'POLYINTERP_NEAREST'; dt.layers_vgroup_select_src = 'ALL'; dt.layers_vgroup_select_dst = 'NAME'
    bpy.ops.object.select_all(action='DESELECT'); body.select_set(True); bpy.context.view_layer.objects.active = body
    bpy.ops.object.modifier_apply(modifier=dt.name)
    print(f'  chuyển trọng số sang LOD0: {time.time() - t0:.1f}s')
    clean_weights(body)
    m = body.modifiers.new('Armature', 'ARMATURE'); m.object = arm
    body.parent = arm
    vg = body.vertex_groups.new(name='cs_vung'); zz = mesh_co(body)[:, 2]
    vg.add(np.nonzero(zz < 1.0)[0].tolist(), 1.0, 'REPLACE')      # đầu đi cứng: không làm mượt (lưới vá da đầu có mặt méo làm CS lệch)
    cs = body.modifiers.new('CorrectiveSmooth', 'CORRECTIVE_SMOOTH'); cs.iterations = 8; cs.smooth_type = 'LENGTH_WEIGHTED'; cs.rest_source = 'ORCO'; cs.vertex_group = 'cs_vung'


def shoulder_split(W, co, I):
    """Chuyển một phần trọng số upper_arm gần khớp vai sang vai_phu (nhiều nhất 70 % ngay khớp, về 0 ở 40 % chiều dài bắp tay)."""
    sm = lambda e0, e1, t: (lambda u: u * u * (3 - 2 * u))(np.clip((t - e0) / (e1 - e0), 0, 1))
    for k, sx in (('L', 1), ('R', -1)):
        a = np.array(V('shoulder', sx)); b = np.array(V('elbow', sx)); ab = b - a
        t = ((co - a) @ ab) / (ab @ ab); f = 0.7 * sm(0.40, 0.0, t) * (sx * co[:, 0] > 0)
        u, v = I[f'upper_arm.{k}'], I[f'vai_phu.{k}']; mv = W[:, u] * f; W[:, u] -= mv; W[:, v] += mv
    return W


def finger_weights(W, co, I, arm_reg, sigma=0.004, blend=0.007):
    """Bàn tay dưới z = 0,50: trọng số hình học. Mỗi đỉnh chia mềm cho các ngón theo khoảng cách tới đường tâm
    (exp(-(d/sigma)^2)); trong một ngón chia cho 3 đốt theo vị trí dọc ngón (pha ±blend ở khớp); phía trên gốc ngón thuộc hand."""
    sm = lambda e0, e1, t: (lambda u: u * u * (3 - 2 * u))(np.clip((t - e0) / (e1 - e0), 0, 1))
    for k, sx in (('L', 1), ('R', -1)):
        Uc = (co * np.array([sx, 1, 1])) @ AP[:3, :3].T + AP[:3, 3]      # về khung tay buông (đo ngón) nếu đã chuyển dáng chữ A
        H = arm_reg & (sx * co[:, 0] > 0.0) & (Uc[:, 0] > 0.17) & (Uc[:, 2] < 0.50)
        P = Uc[H]; n = len(P); Wn = np.zeros((n, W.shape[1]), np.float32)
        D = []; S0 = []; U = []
        for nm, pts in (CH0 or CH).items():
            Q = np.array([p[:] for p in pts]); seg = np.diff(Q, axis=0); ln = np.linalg.norm(seg, axis=1); cum = np.r_[0, np.cumsum(ln)]
            dmin = np.full(n, 9.0); u = np.zeros(n)
            for j in range(3):
                t = np.clip(((P - Q[j]) @ seg[j]) / ln[j] ** 2, 0, 1); d = np.linalg.norm(P - (Q[j] + t[:, None] * seg[j]), axis=1)
                better = d < dmin; dmin[better] = d[better]; u[better] = cum[j] + t[better] * ln[j]
            D.append(dmin); U.append((u, cum)); S0.append(((P - Q[0]) @ seg[0]) / ln[0])
        D = np.array(D); A = np.exp(-(D / sigma) ** 2) + 1e-12; A /= A.sum(0)
        for c, nm in enumerate(CH):
            u, cum = U[c]
            inside = sm(-0.022 if nm != 'thumb' else -0.006, 0.006, S0[c]) * (D[c] < 0.03)
            wb = [sm(cum[1] + blend, cum[1] - blend, u), None, sm(cum[2] - blend, cum[2] + blend, u)]
            wb[1] = 1 - wb[0] - wb[2]
            for i in range(3):
                Wn[:, I[f'{nm}{i + 1}.{k}']] += A[c] * inside * wb[i]
        Wn[:, I[f'hand.{k}']] += 1 - Wn.sum(1)
        al = sm(0.50, 0.475, P[:, 2])[:, None]
        W[H] = (1 - al) * W[H] + al * Wn
    return W


CH0 = {}              # đường tâm ngón ở khung tay buông (dùng cho trọng số ngón sau khi đổi dáng chữ A)
ARM_FIXED = None      # vùng tay tính trên lưới tay buông, dùng lại sau khi đổi dáng chữ A (chỉ số đỉnh giữ nguyên)


def arm_region(co, ea, eb):
    if ARM_FIXED is not None: return ARM_FIXED.copy()
    x, z = co[:, 0], co[:, 2]; keep = ~((np.abs(x) < ARM_CUT[0]) | (z > ARM_CUT[1])); A = np.zeros(len(co), bool)
    for s in (1, -1):
        A[np.argmin(np.where((s * x > 0.2) & (z > 0.3), z, 9))] = True
    while True:
        n = A.sum(); A[eb[A[ea] & keep[eb]]] = True; A[ea[A[eb] & keep[ea]]] = True
        if A.sum() == n: return A


def clean_weights(body):
    me = body.data; nv = len(me.vertices); names = [g.name for g in body.vertex_groups]; ng = len(names)
    W = np.zeros((nv, ng), dtype=np.float32)
    for v in me.vertices:
        for g in v.groups: W[v.index, g.group] = g.weight
    co = mesh_co(body); x, y, z = co[:, 0], co[:, 1], co[:, 2]; ax = np.abs(x)
    ed = np.zeros(len(me.edges) * 2, dtype=np.int32); me.edges.foreach_get('vertices', ed); ea, eb = ed[0::2], ed[1::2]
    deg = np.bincount(np.concatenate([ea, eb]), minlength=nv).astype(np.float32).clip(min=1)
    I = {n: i for i, n in enumerate(names)}
    sm = lambda e0, e1, t: (lambda u: u * u * (3 - 2 * u))(np.clip((t - e0) / (e1 - e0), 0, 1))
    head = (z > HEAD_Z) | ((z > 0.985) & (y < -0.10))
    arm_i = [i for n, i in I.items() if n.startswith(('clavicle', 'upper_arm', 'vai_phu', 'forearm', 'hand', 'index', 'middle', 'ring', 'pinky', 'thumb'))]
    leg_i = [i for n, i in I.items() if n.startswith(('thigh', 'shin', 'foot', 'toe'))]
    trunk_i = [I[n] for n in ('pelvis', 'spine1', 'spine2', 'chest') if n in I]
    arm_reg = arm_region(co, ea, eb)
    shoulder = (z > 0.62) & (ax > 0.09)                 # vùng pha vai–ngực–nách
    print(f'  vùng tay (loang): {int(arm_reg.sum())} đỉnh')

    def rules(W):
        fL = sm(-0.01, 0.01, x)
        for n, i in I.items():
            if n.endswith('.L'): W[:, i] *= fL
            elif n.endswith('.R'): W[:, i] *= 1 - fL
        W[np.ix_(arm_reg, leg_i)] = 0                        # bàn tay buông cạnh đùi: không theo chân
        W[np.ix_(arm_reg & (z < 0.68), trunk_i)] = 0          # tay dưới nách: không theo thân
        W[np.ix_(~arm_reg & ~shoulder, arm_i)] = 0            # thân/đùi: không theo tay (trừ vùng vai)
        W[np.ix_(~arm_reg, [I[n] for n in names if n.startswith(('forearm', 'hand', 'index', 'middle', 'ring', 'pinky', 'thumb'))])] = 0
        W[np.ix_(z < 0.40, trunk_i)] *= 0                   # dưới đùi giữa không theo thân
        W[np.ix_(z > 0.70, leg_i)] = 0
        W[head] = 0; W[head, I['head']] = 1
        s = W.sum(1); W[s < 1e-6, I['spine2']] = 1
        return W / W.sum(1, keepdims=True)

    def lap(W, mask, it, a):
        for _ in range(it):
            acc = np.stack([np.bincount(ea, W[eb, j], nv) + np.bincount(eb, W[ea, j], nv) for j in range(ng)], 1)
            W[mask] = (1 - a) * W[mask] + a * acc[mask] / deg[mask, None]
        return W
    W = rules(W)
    W = lap(W, ~head, 25, 0.5); W = rules(W)
    # cổ: pha chest → neck → head theo z, rồi làm mượt
    band = (~head) & (z > 0.90) & (ax < 0.11)
    t = np.clip((z[band] - 0.90) / (HEAD_Z - 0.90), 0, 1)
    Wn = np.zeros((band.sum(), ng), np.float32)
    Wn[:, I['chest']] = np.clip(1 - 2 * t, 0, 1); Wn[:, I['head']] = np.clip(2 * t - 1, 0, 1); Wn[:, I['neck']] = 1 - Wn[:, I['chest']] - Wn[:, I['head']]
    f = (1 - sm(0.07, 0.11, ax[band]))[:, None]; W[band] = (1 - f) * W[band] + f * Wn
    W = lap(W, ~head, 20, 0.5)
    W = lap(W, (~head) & (z > 0.40) & (z < 0.62) & (ax < 0.20), 60, 0.6)     # háng
    W = shoulder_split(W, co, I)
    W = lap(W, (~head) & (z > 0.64) & (z < 0.98) & (ax > 0.05) & (ax < 0.26), 120, 0.6)   # nách–vai, dải rộng
    W = rules(W)
    W = finger_weights(W, co, I, arm_reg)
    W[W < 0.01] = 0; W /= W.sum(1, keepdims=True)
    for g in body.vertex_groups: g.remove(list(range(nv)))
    nz = np.nonzero(W > 1e-4)
    for vi, gj in zip(nz[0].tolist(), nz[1].tolist()): body.vertex_groups[gj].add([vi], float(W[vi, gj]), 'REPLACE')
    print(f'  trọng số sạch: {len(nz[0]) / nv:.2f} xương/đỉnh; đầu cứng {int(head.sum())} đỉnh')


# ---- dáng thử ----
POSES = {
    'nghi': {},
    'tay_buong': 'down',
    'tay_dang_60': 'abd60',
    'gio_tay_cao': 'abd140',
    'khuyu_gap': {'upper_arm.L': ('X', 30), 'forearm.L': ('X', 100), 'upper_arm.R': ('X', 30), 'forearm.R': ('X', 100)},
    'quay_dau': {'head': ('Y', 35), 'neck': ('Y', 10)},
    'cui_dau': {'head': ('X', 20), 'neck': ('X', 10), 'spine2': ('X', 10)},
    'xoay_than': {'spine1': ('Y', 15), 'spine2': ('Y', 15), 'chest': ('Y', 10)},
    'buoc_chan': 'step',
    'ngoi_xom': 'squat',
    'nam_tay': 'fist',
    'chi_tay': 'point',
    'xoe_tay': {'index1.L': ('Z', -14), 'middle1.L': ('Z', -4), 'ring1.L': ('Z', 6), 'pinky1.L': ('Z', 16), 'thumb1.L': ('Z', -25)},
}


def set_rot(pb, bn, spec):
    e = list(pb[bn].rotation_euler)
    for ax, deg in zip(spec[0::2], spec[1::2]): e['XYZ'.index(ax)] = math.radians(deg)
    pb[bn].rotation_euler = e


def move_world(p, d):
    """Dời xương theo vectơ thế giới (armature không xoay/scale)."""
    p.location = p.bone.matrix_local.to_3x3().inverted() @ Vector(d)


def apply_pose(arm, name):
    pb = arm.pose.bones
    for b in pb:
        b.location = (0, 0, 0)
        b.rotation_euler = (0, 0, 0)
    for k in 'LR':
        for pr in ('nam',) + tuple(FINGER_PROPS.values()): pb[f'hand.{k}'][pr] = 0.0
    spec = POSES[name]
    if spec in ('down', 'abd60', 'abd140'):       # góc so với tay buông thẳng (trừ góc dáng nghỉ chữ A)
        g = {'down': 0, 'abd60': 60, 'abd140': 140}[spec] - A_DEG
        set_rot(pb, 'upper_arm.L', ('Z', g)); set_rot(pb, 'upper_arm.R', ('Z', -g))
    elif spec == 'fist':
        for k in 'LR': pb[f'hand.{k}']['nam'] = 1.0
    elif spec == 'point':
        for k in 'LR':
            for pr in ('nam_giua', 'nam_ap', 'nam_ut', 'nam_cai'): pb[f'hand.{k}'][pr] = 1.0
        set_rot(pb, 'forearm.L', ('X', 70)); set_rot(pb, 'forearm.R', ('X', 70))
    elif spec == 'step':
        move_world(pb['ik_foot.L'], (0, -0.13, 0.05)); move_world(pb['ik_foot.R'], (0, 0.07, 0.0))
        move_world(pb['pelvis'], (0, -0.03, -0.025))
        set_rot(pb, 'upper_arm.L', ('X', -20)); set_rot(pb, 'upper_arm.R', ('X', 20))
    elif spec == 'squat':
        move_world(pb['pelvis'], (0, 0.08, -0.17))
        set_rot(pb, 'spine1', ('X', 20)); set_rot(pb, 'spine2', ('X', 10))
        for k in 'LR': set_rot(pb, f'upper_arm.{k}', ('X', 50))
    else:
        for bn, sp in spec.items():
            set_rot(pb, bn, sp)
            if bn.endswith('.L') and bn.replace('.L', '.R') not in spec:
                sp2 = list(sp)
                for i in range(1, len(sp2), 2):
                    if sp2[i - 1] in 'YZ': sp2[i] = -sp2[i]
                set_rot(pb, bn.replace('.L', '.R'), tuple(sp2))
    bpy.context.view_layer.update()


def stretch(arm, body):
    def pos():
        dg = bpy.context.evaluated_depsgraph_get(); ev = body.evaluated_get(dg); me = ev.to_mesh()
        a = np.zeros(len(me.vertices) * 3, np.float32); me.vertices.foreach_get('co', a); ev.to_mesh_clear(); return a.reshape(-1, 3)
    apply_pose(arm, 'nghi'); p0 = pos()
    r0 = mesh_co(body); dv = np.linalg.norm(p0 - r0, axis=1); print(f'  dáng nghỉ lệch so với lưới gốc: tối đa {dv.max() * 1000:.2f} mm tại {np.round(r0[dv.argmax()], 3)}')
    ed = np.zeros(len(body.data.edges) * 2, np.int32); body.data.edges.foreach_get('vertices', ed); ea, eb = ed[0::2], ed[1::2]
    l0 = np.linalg.norm(p0[ea] - p0[eb], axis=1); ok = l0 > 1e-3
    for nm in POSES:
        apply_pose(arm, nm); p = pos(); st = np.where(ok, np.linalg.norm(p[ea] - p[eb], axis=1) / l0.clip(1e-6), 1)
        bad = st > 2.0
        print(f'  {nm:12s} cạnh giãn >2×: {int(bad.sum()):5d}  max {st.max():.2f}×')
    apply_pose(arm, 'nghi')


def render_sheet(sc, arm, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 12; sc.cycles.device = 'CPU'; sc.cycles.use_denoising = False
    sc.render.resolution_x = 320; sc.render.resolution_y = 400
    w = bpy.data.worlds.new('xem_thu'); sc.world = w; w.use_nodes = True
    bg = w.node_tree.nodes['Background']; bg.inputs[0].default_value = (.8, .8, .8, 1); bg.inputs[1].default_value = 1.0
    cd = bpy.data.cameras.new('cam_xem'); cd.type = 'ORTHO'; cd.ortho_scale = 2.0
    cam = bpy.data.objects.new('cam_xem', cd); sc.collection.objects.link(cam); sc.camera = cam
    files = []
    for nm in POSES:
        apply_pose(arm, nm)
        for view, ang in (('truoc', -90), ('cheo', -40)):
            a = math.radians(ang); cam.location = (3 * math.cos(a), 3 * math.sin(a), 0.85)
            cam.rotation_euler = (Vector((0, 0, 0.85)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
            sc.render.filepath = os.path.join(out_dir, f'{nm}_{view}.png'); bpy.ops.render.render(write_still=True); files.append(sc.render.filepath)
    apply_pose(arm, 'nghi'); bpy.data.objects.remove(cam)
    return files


def rebuild_armpit(body, cut):
    """Cắt dải lưới dính tay–thân ở nách, lấp bằng màng da mới (chia mịn + thư giãn Laplace, mép cố định), UV/màu da như da đầu.
    Vùng tay (ARM_FIXED) được mang theo bằng thuộc tính; đỉnh mới thuộc thân."""
    global ARM_FIXED
    import bmesh
    me = body.data
    a = me.attributes.new('vung_tay', 'INT', 'POINT'); a.data.foreach_set('value', ARM_FIXED.astype(np.int32))
    if 'pha_da' not in me.attributes: me.attributes.new('pha_da', 'FLOAT', 'POINT')
    bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table()
    bmesh.ops.delete(bm, geom=[bm.verts[i] for i in np.nonzero(cut)[0]], context='VERTS')
    for _ in range(10):
        bad = [v for v in bm.verts if sum(e.is_boundary for e in v.link_edges) > 2 or (v.is_boundary and len(v.link_faces) < 2) or not v.link_faces]
        if not bad: break
        bmesh.ops.delete(bm, geom=bad, context='VERTS')
    gl = bm.verts.layers.int.new('dinh_goc')
    for v in bm.verts: v[gl] = 1
    bnd = [e for e in bm.edges if e.is_boundary]
    # chỉ các lỗ ở vùng nách (không đụng lỗ khác nếu có)
    loops = []; seen = set(); adj = {}
    for e in bnd:
        for v in e.verts: adj.setdefault(v, []).append(e)
    for e in bnd:
        if e in seen: continue
        st = [e]; comp = []
        while st:
            x_ = st.pop()
            if x_ in seen: continue
            seen.add(x_); comp.append(x_); [st.append(y) for v in x_.verts for y in adj[v] if y not in seen]
        loops.append(comp)
    loops = [L for L in loops if 0.5 < np.mean([v.co.z for e in L for v in e.verts]) < 1.0 and abs(np.mean([v.co.x for e in L for v in e.verts])) > 0.1]
    print(f'  nách: cắt {int(cut.sum())} đỉnh; lỗ vá {[len(L) for L in loops]}; phía tay: {[int(np.mean([v[bm.verts.layers.int.get("vung_tay")] for e in L for v in e.verts]) > 0.5) for L in loops]}')
    fl = bm.faces.layers.int.new('va_nach'); vt = bm.verts.layers.int.get('vung_tay')
    for L in loops:
        is_arm = np.mean([v[vt] for e in L for v in e.verts]) > 0.5      # lỗ phía tay hay phía thân
        f = bmesh.ops.holes_fill(bm, edges=L, sides=0)['faces']
        f = bmesh.ops.triangulate(bm, faces=f)['faces']
        for x_ in f: x_[fl] = 2 if is_arm else 1
    pf = lambda: [f for f in bm.faces if f[fl]]
    edge_len = 0.004
    for rnd in range(6):
        long_e = list({e for f in pf() for e in f.edges if e.calc_length() > edge_len * 1.4})
        if long_e:
            r_ = bmesh.ops.subdivide_edges(bm, edges=long_e, cuts=1, use_grid_fill=False)
            for g in r_['geom_inner'] + r_['geom_split']:
                if isinstance(g, bmesh.types.BMVert): g[gl] = 0
        tri = [f for f in bm.faces if len(f.verts) > 3 and f[fl]]
        if tri: bmesh.ops.triangulate(bm, faces=tri)
        P_ = pf()
        bmesh.ops.beautify_fill(bm, faces=P_, edges=list({e for f in P_ for e in f.edges if all(not v[gl] for v in e.verts)}))
        newv = [v for v in bm.verts if not v[gl]]
        for it in range(40):
            np_ = {v: sum((e.other_vert(v).co for e in v.link_edges), Vector()) / len(v.link_edges) for v in newv if v.link_edges}
            for v, p_ in np_.items(): v.co = v.co.lerp(p_, 0.7)
    newv = [v for v in bm.verts if not v[gl]]
    for it in range(200):
        np_ = {v: sum((e.other_vert(v).co for e in v.link_edges), Vector()) / len(v.link_edges) for v in newv if v.link_edges}
        for v, p_ in np_.items(): v.co = v.co.lerp(p_, 0.7)
    patch = pf()
    # UV & màu da
    mat = me.materials[0]; cxyz = next((n for n in mat.node_tree.nodes if n.type == 'COMBXYZ'), None)
    suv = Vector((cxyz.inputs[0].default_value, cxyz.inputs[1].default_value)) if cxyz else None
    uvl = bm.loops.layers.uv.active; pl = bm.verts.layers.float.get('pha_da')
    for f in patch:
        if suv is not None:
            for l in f.loops: l[uvl].uv = suv
        f.smooth = True
    for v in newv:
        v[pl] = 1.0; v[vt] = int(any(f[fl] == 2 for f in v.link_faces))
    ring = {u for L in loops for e in L for u in e.verts if u.is_valid}
    for r in range(8):
        for v in ring: v[pl] = max(v[pl], 1 - r / 8)
        ring = {e.other_vert(v) for v in ring for e in v.link_edges if e.other_vert(v)[gl]}
    bm.normal_update(); bm.to_mesh(me); me.update(); bm.free()
    v = np.zeros(len(me.vertices), np.int32); me.attributes['vung_tay'].data.foreach_get('value', v); ARM_FIXED = v.astype(bool)
    print(f'  nách: vá {len(newv)} đỉnh mới; lưới còn {len(me.vertices)} đỉnh')


def mixamo_map():
    """tên trong script → tên Mixamo (chỉ xương biến dạng; root, vai_phu, ik_*, pole_* giữ tên)."""
    m = {'pelvis': 'Hips', 'spine1': 'Spine', 'spine2': 'Spine1', 'chest': 'Spine2', 'neck': 'Neck', 'head': 'Head'}
    fn = {'thumb': 'Thumb', 'index': 'Index', 'middle': 'Middle', 'ring': 'Ring', 'pinky': 'Pinky'}
    for k, S in (('L', 'Left'), ('R', 'Right')):
        m.update({f'clavicle.{k}': f'{S}Shoulder', f'upper_arm.{k}': f'{S}Arm', f'forearm.{k}': f'{S}ForeArm', f'hand.{k}': f'{S}Hand',
                  f'thigh.{k}': f'{S}UpLeg', f'shin.{k}': f'{S}Leg', f'foot.{k}': f'{S}Foot', f'toe.{k}': f'{S}ToeBase'})
        for a_, b_ in fn.items():
            for i in (1, 2, 3): m[f'{a_}{i}.{k}'] = f'{S}Hand{b_}{i}'
    return m


def rename_mixamo(arm):
    """Đổi tên qua RNA: Blender tự sửa nhóm đỉnh, ràng buộc và đường dẫn driver theo tên mới."""
    mp = mixamo_map()
    for old, new in mp.items():
        if old in arm.data.bones: arm.data.bones[old].name = new
    ad = arm.animation_data      # đường dẫn driver là chuỗi: sửa tay các tên xương cũ (và các thuộc tính của hand.L/R)
    for d in (ad.drivers if ad else []):
        for v in d.driver.variables:
            for t in v.targets:
                for old, new in sorted(mp.items(), key=lambda kv: -len(kv[0])):
                    t.data_path = t.data_path.replace(f'pose.bones["{old}"]', f'pose.bones["{new}"]')
        d.data_path = d.data_path.replace('pose.bones["', 'pose.bones["')
        for old, new in sorted(mp.items(), key=lambda kv: -len(kv[0])):
            d.data_path = d.data_path.replace(f'pose.bones["{old}"]', f'pose.bones["{new}"]')
    arm['ten_xuong'] = 'Mixamo'
    print('  đã đổi tên xương sang chuẩn Mixamo')


def rig_once(sc, body):
    proxy = bpy.data.objects.new('proxy_w', body.data.copy()); sc.collection.objects.link(proxy)   # bản thưa cho bone heat
    dm = proxy.modifiers.new('Dec', 'DECIMATE'); dm.ratio = 0.125
    bpy.context.view_layer.objects.active = proxy; bpy.ops.object.select_all(action='DESELECT'); proxy.select_set(True)
    bpy.ops.object.modifier_apply(modifier=dm.name)
    arm = build_armature(sc)
    bind(sc, arm, body, proxy)
    bpy.data.objects.remove(proxy, do_unlink=True)
    return arm


def to_a_pose(sc, body, arm, deg):
    """Đổi dáng nghỉ: dang hai tay `deg`°, nướng vào lưới, làm mượt Taubin vùng nách–vai, rồi dựng lại rig từ dáng mới.
    Mốc khớp tay (J) và đường tâm ngón (CH) được xoay theo; AP giữ phép ngược để đo bàn tay trong khung cũ."""
    global AP
    pb = arm.pose.bones
    for k, sx in (('L', 1), ('R', -1)): pb[f'upper_arm.{k}'].rotation_euler = (0, 0, math.radians(sx * deg))
    body.modifiers['CorrectiveSmooth'].show_viewport = False; bpy.context.view_layer.update()
    T = np.array(arm.matrix_world @ pb['upper_arm.L'].matrix @ pb['upper_arm.L'].bone.matrix_local.inverted())
    dg = bpy.context.evaluated_depsgraph_get(); ev = body.evaluated_get(dg); m2 = ev.to_mesh()
    P = np.zeros(len(m2.vertices) * 3); m2.vertices.foreach_get('co', P); ev.to_mesh_clear(); P = P.reshape(-1, 3)
    co0 = mesh_co(body)
    global ARM_FIXED; e0, e1 = edges_np(body.data); ARM_FIXED = arm_region(co0, e0, e1)
    # gỡ rig cũ
    body.parent = None
    for m in list(body.modifiers): body.modifiers.remove(m)
    body.vertex_groups.clear()
    bpy.data.objects.remove(arm, do_unlink=True)
    # vùng tiếp xúc tay–thân (lưới gốc: tay ép vào sườn, có gờ hình khối và vệt tối vẽ sẵn trên texture):
    # đỉnh cách "phía bên kia" < CONTACT_D ⇒ làm mượt Taubin mạnh trên lưới đã dang tay + phủ màu da (pha_da)
    me = body.data; nv = len(me.vertices); ea, eb = edges_np(me); dn = np.bincount(np.concatenate([ea, eb]), minlength=nv).clip(1)[:, None]
    ar = ARM_FIXED; x, z = np.abs(co0[:, 0]), co0[:, 2]
    nrm = np.zeros(nv * 3); me.vertices.foreach_get('normal', nrm); nrm = nrm.reshape(-1, 3)
    dist = np.full(nv, 9.0)
    for src, dst in ((ar, ~ar), (~ar, ar)):      # chỉ tính bề mặt "đối diện": gần nhau VÀ pháp tuyến ngược chiều (bỏ qua ranh giới liền kề)
        kd = KDTree(int(dst.sum())); di = np.nonzero(dst)[0]
        for j, i in enumerate(di): kd.insert(co0[i], j)
        kd.balance()
        for i in np.nonzero(src & (z > 0.50) & (z < 0.95) & (x > 0.08))[0]:
            for p_, j, d in kd.find_n(co0[i], 8):
                if nrm[i] @ nrm[di[j]] < -0.3: dist[i] = min(dist[i], d)
    f = np.clip((CONTACT_D - dist) / 0.015, 0, 1)
    f = np.maximum(f, 0.35 * np.clip(np.minimum.reduce([(x - 0.07) / 0.04, (0.30 - x) / 0.04, (z - 0.60) / 0.06, (0.97 - z) / 0.04]), 0, 1))
    R = f > 0
    for it in range(CONTACT_IT):
        for lam in (0.5, -0.53):
            acc = np.stack([np.bincount(ea, P[eb, j], nv) + np.bincount(eb, P[ea, j], nv) for j in range(3)], 1) / dn
            P[R] += (lam * f[R])[:, None] * (acc[R] - P[R])
    me.vertices.foreach_set('co', P.ravel()); me.update()
    at = me.attributes.get('pha_da')
    if at:
        v = np.zeros(nv, np.float32); at.data.foreach_get('value', v)
        c = np.clip((CONTACT_D + 0.005 - dist) / 0.02, 0, 1).astype(np.float32)
        for _ in range(4):
            acc = (np.bincount(ea, c[eb], nv) + np.bincount(eb, c[ea], nv)) / dn[:, 0]; c = np.maximum(c, 0.8 * acc).astype(np.float32)
        at.data.foreach_set('value', np.maximum(v, c))
    print(f'  vùng tiếp xúc nách: {int((dist < CONTACT_D).sum())} đỉnh; vùng làm mượt {int(R.sum())} đỉnh')
    rebuild_armpit(body, (dist < CUT_D) & (z > 0.62) & (z < 0.90))
    print(f'  dáng chữ A {deg:.0f}°: nướng lưới, làm mượt {int(R.sum())} đỉnh nách–vai')
    # xoay mốc tay và ngón theo
    Tm = Matrix([list(r) for r in T])
    for n in ('elbow', 'wrist', 'hand_end'): J[n] = tuple(Tm @ Vector(J[n]))
    CH0.update({nm: list(P) for nm, P in CH.items()})
    for nm in CH: CH[nm] = [Tm @ p for p in CH[nm]]
    AP = np.linalg.inv(T)
    return rig_once(sc, body)


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--out', required=True); ap.add_argument('--anh'); ap.add_argument('--src', default=SRC)
    ap.add_argument('--ten-mixamo', action='store_true', help='đổi tên xương biến dạng sang chuẩn Mixamo (Hips, LeftArm, …) để dùng animation Mixamo')
    ap.add_argument('--chu-a', type=float, default=0.0, help='dang tay (độ) để làm dáng nghỉ mới trước khi rig; 0 = giữ tay buông')
    a = ap.parse_args(argv)
    bpy.ops.wm.open_mainfile(filepath=os.path.abspath(a.src)); sc = bpy.context.scene
    if bpy.context.object and bpy.context.object.mode != 'OBJECT': bpy.ops.object.mode_set(mode='OBJECT')
    body = bpy.data.objects['model_LOD0']
    for o in list(sc.objects):
        if o.type == 'MESH' and o is not body: bpy.data.objects.remove(o, do_unlink=True)
    bco = mesh_co(body); bea, beb = edges_np(body.data); measure_fingers(bco, arm_region(bco, bea, beb))
    body.hide_set(False); body.hide_render = False
    arm = rig_once(sc, body)
    if a.chu_a:
        arm = to_a_pose(sc, body, arm, a.chu_a)
        sc['dang_nghi'] = f'chữ A, tay dang {a.chu_a:.0f}°'
        global A_DEG; A_DEG = a.chu_a
    for c in list(bpy.data.collections):
        if c.name.startswith('LOD') and not c.objects: bpy.data.collections.remove(c)
    arm.users_collection[0].objects.unlink(arm); body.users_collection[0].objects.link(arm)
    stretch(arm, body)
    if a.anh: render_sheet(sc, arm, os.path.abspath(a.anh))
    if a.ten_mixamo: rename_mixamo(arm)
    sc['ma_asset'] = 'NHAN-VAT-GOC-001 / RIG-THU'
    sc['trang_thai'] = 'Rig thử: thân/tay/chân/ngón, IK chân, IK/FK tay; chưa mặt, shape key; chưa nghiệm thu'
    bpy.ops.object.select_all(action='DESELECT'); arm.select_set(True); bpy.context.view_layer.objects.active = arm
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.out), compress=True)
    print('PASS: đã lưu', a.out)


main()
