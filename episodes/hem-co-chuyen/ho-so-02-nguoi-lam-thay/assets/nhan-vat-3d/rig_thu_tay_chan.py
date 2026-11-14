"""Rig thử CỤC BỘ cho chỗ nối tay/chân liền da (THIET-KE-NOI-TAY-CHAN.md mục 5) — không phải rig toàn thân.

Mở .blend của dung_cage_tay_chan.py (lưới liền da `Nam_Dau_Than`), tạo bản sao `Nam_RigThu` + armature `Rig_Thu` (bên trái):
  khoa (khoá phần thân còn lại) · cang_tay → ban_tay → ngón 3 đốt + ngón cái · cang_chan → ban_chan → ngon_chan
Pivot: cổ tay = tâm vòng cổ tay cage; mắt cá = tâm ống chân tại z ANKLE_Z; gốc ngón chân = đường gập ngón.
Weights: theo vị trí dọc chi, chuyển mềm qua mỗi khớp; ngón theo nhãn từng ngón (cùng quy tắc ép hình).
Đo mỗi tư thế: giãn/co cạnh, diện tích tiết diện tại khớp, góc nhị diện lớn nhất, mặt tự giao. Ảnh cận clay+wireframe, bản đồ giãn, clip.

Chạy:  bpyv/bin/python rig_thu_tay_chan.py --blend IN.blend --out DIR [--luu OUT.blend] [--clip] [--samples 16] [--tu-the a,b]
"""
import sys, os, math, argparse, subprocess, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
import numpy as np
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree
import dung_cage_tay_chan as N
import dung_than_cage_nam as C
import dung_tay_nam as HT
import dung_chan_nam as FT
import dung_than_nam as T

ss = N.ss
ANKLE_Z = 0.085            # tâm khớp mắt cá (trong khối, trên đế 8,5 cm; lượt 1 đặt 9,5 cm → nếp gót 91° khi gập xuống)
WRIST_W = 0.024            # nửa bề rộng dải chuyển weight cổ tay (m) (lượt 1: 0,012 → co < 0,5; cổ tay thon 7% cần 0,024)
ANKLE_W = (0.040, 0.050)   # dải chuyển weight mắt cá: dưới / trên ANKLE_Z
MOUND_R, MOUND_R0, MOUND_W = 0.032, 0.012, 0.8   # gò ngón cái: bán kính ảnh hưởng của thumb1 lên lòng tay, vùng đầy, mức
STRETCH_PEN = 0.0005       # phạt mỗi cạnh giãn > 2× khi dò ngón cái lúc nắm (m tương đương); phạt mạnh hơn → chọn tư thế làm gò ngón cái tự gập
STRETCH_PEN_GRIP = 0.003   # cầm cốc: phạt mạnh (0,0005 → tư thế kéo kẽ ngón cái 3,75×)
CS_ITER, CS_T2, CS_PALM = 80, 0.6, 0.7   # Corrective Smooth vùng gò ngón cái (thumb1 ×3, thumb2 ×0,6) + đáy lòng tay: nếp gò tự gập & đáy lòng nắm co mạnh mà weights không gỡ được
TOE_W = 0.020              # nửa dải chuyển weight gốc ngón chân (lượt 1–2: 0,012 → nhấc gót tự giao ở nếp gốc ngón)


# ================================================================== khung chi
def frames():
    c_w, d, c_e = N.arm_frame(); X = N.hand_xf(); R = HT._D.normalized().rotation_difference(d).to_matrix()
    f = dict(c_w=c_w, d=d, c_e=c_e, de=(c_w - c_e).normalized(), X=X, N=(R @ HT._N).normalized(), S=(R @ HT._S).normalized(),
             K=X(HT.L(HT.KNUCKLE_U, 0, 0)))
    f['fing'] = {fn: [X(p) for p in HT.finger_pts(fn)[0]] for fn in HT.FINGERS}
    tp = [Vector(HT.L(*t)) for t in HT.THUMB_PTS]; tip = tp[3] + (tp[3] - tp[2]).normalized() * 0.016; f['thumb'] = [X(p) for p in tp + [tip]]
    goi = next(r for r in C.LEG_RINGS if r['ten'] == 'goi'); mc = next(r for r in C.LEG_RINGS if r['ten'] == 'mat_ca')
    f['knee'] = Vector(goi['c']); f['ankle'] = Vector((mc['c'][0], mc['c'][1], ANKLE_Z)); f['ball'] = Vector((FT.X0, FT.BALL_Y, 0.030)); f['toe'] = Vector((FT.X0, -0.165, 0.025))
    return f


# ================================================================== xương
def build_rig(F):
    ad = bpy.data.armatures.new('Rig_Thu'); arm = bpy.data.objects.new('Rig_Thu', ad); bpy.context.scene.collection.objects.link(arm)
    bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode='EDIT'); eb = ad.edit_bones
    def B(n, par, h, t, roll_to=None):
        b = eb.new(n); b.head, b.tail = Vector(h), Vector(t)
        if roll_to is not None: b.align_roll(roll_to)
        if par: b.parent = eb[par]
        return b
    B('khoa', None, (0, 0, 0.60), (0, 0, 0.80))
    B('cang_tay', 'khoa', F['c_e'], F['c_w'], F['N']); B('ban_tay', 'cang_tay', F['c_w'], F['K'], F['N'])
    for fn, pts in F['fing'].items():
        B(f'{fn}1', 'ban_tay', pts[0], pts[1], F['N']); B(f'{fn}2', f'{fn}1', pts[1], pts[2], F['N']); B(f'{fn}3', f'{fn}2', pts[2], pts[3], F['N'])
    tp = F['thumb']; B('thumb1', 'ban_tay', tp[0], tp[1], F['N']); B('thumb2', 'thumb1', tp[1], tp[2], F['N']); B('thumb3', 'thumb2', tp[2], tp[4], F['N'])
    B('cang_chan', 'khoa', F['knee'], F['ankle'], Vector((1, 0, 0))); B('ban_chan', 'cang_chan', F['ankle'], F['ball'], Vector((0, 0, 1))); B('ngon_chan', 'ban_chan', F['ball'], F['toe'], Vector((0, 0, 1)))
    bpy.ops.object.mode_set(mode='OBJECT')
    for pb in arm.pose.bones: pb.rotation_mode = 'XYZ'
    return arm


# ================================================================== weights
def _arc(P, pts):
    """Tham số độ dài cung của điểm chiếu gần nhất lên đường gấp khúc (âm trước điểm đầu)."""
    best_d = np.full(len(P), np.inf); best_s = np.zeros(len(P)); acc = 0.0; pts = [np.array(tuple(p)) for p in pts]
    for k in range(len(pts) - 1):
        a, b = pts[k], pts[k + 1]; ab = b - a; ln = np.linalg.norm(ab); t = ((P - a) @ ab) / (ln * ln)
        tc = np.clip(t, -np.inf if k == 0 else 0, np.inf if k == len(pts) - 2 else 1)
        dd = np.linalg.norm(P - (a + tc[:, None] * ab), axis=1); m = dd < best_d; best_d[m] = dd[m]; best_s[m] = acc + tc[m] * ln; acc += ln
    return best_s, best_d


def _chain_w(s, joints, half):
    """Trọng số của n đốt theo tham số cung s với các khớp tại `joints` (đầu tiên = gốc). Trả list n mảng; phần trước gốc thuộc cha."""
    a = [ss(j - h, j + h, s) for j, h in zip(joints, half)]
    out = []
    for i in range(len(a)):
        nxt = a[i + 1] if i + 1 < len(a) else 0.0
        out.append(a[i] - nxt if i + 1 < len(a) else a[i])
    return [np.clip(o, 0, 1) for o in out]


def skin(ob, arm, F):
    """Weights theo vị trí dọc chi; thân còn lại (và cả bên phải) khoá vào 'khoa'."""
    me = ob.data; P = N._world(ob); n = len(P); names = [b.name for b in arm.data.bones]; W = {k: np.zeros(n) for k in names}
    tay = np.zeros(n); me.attributes['tay'].data.foreach_get('value', tay); chan = np.zeros(n); me.attributes['chan'].data.foreach_get('value', chan)
    L = P[:, 0] > 0
    # --- tay: thân trên khuỷu → khoa; cẳng tay; cổ tay (±WRIST_W quanh tâm vòng cổ tay); bàn tay → ngón theo nhãn
    arm_m = L & (tay > 0.5); ue = (P - np.array(F['c_e'])) @ np.array(F['de']); fore = ss(-0.02, 0.02, ue) * arm_m
    u = (P - np.array(F['c_w'])) @ np.array(F['d']); hand = ss(-WRIST_W, WRIST_W, u) * fore
    W['cang_tay'] = fore - hand
    lab = N.label_hand(P); Wh = np.zeros(n) + hand
    for fn in HT.FINGERS:
        pts = F['fing'][fn]; s, _ = _arc(P, pts); seg = [np.linalg.norm(np.array(tuple(pts[i + 1] - pts[i]))) for i in range(3)]
        joints = [0.0, seg[0], seg[0] + seg[1]]; ws = _chain_w(s, joints, [0.009, 0.008, 0.007]); m = hand * (lab == fn)   # lượt 1: ±4 mm ở khớp ngón → mặt trong khớp tự giao khi nắm
        for i in range(3): W[f'{fn}{i + 1}'] += ws[i] * m
        Wh -= (ws[0] + ws[1] + ws[2]) * m
    tp = F['thumb']; s, dist = _arc(P, tp[:4] + [tp[4]]); seg = [(tp[i + 1] - tp[i]).length for i in range(3)]
    ws = _chain_w(s, [0.0, seg[0] + 0.006, seg[0] + seg[1]], [0.012, 0.009, 0.006])          # lượt 1: thumb1 gần như không có dải → lòng tay–thumb2 giãn 7×
    near = hand * ((lab == 'thumb') | ((lab == 'palm') & (dist < MOUND_R)))       # gò ngón cái theo thumb1 một phần
    mound = np.where(lab == 'thumb', 1.0, MOUND_W * ss(MOUND_R, MOUND_R0, dist))
    for i in range(3): W[f'thumb{i + 1}'] += ws[i] * near * mound
    Wh -= (ws[0] + ws[1] + ws[2]) * near * mound
    W['ban_tay'] = np.clip(Wh, 0, 1)
    # --- chân: trên gối → khoa; cẳng chân; mắt cá theo z; ngón theo y
    leg_m = L & (chan > 0.5); knee = ss(0.02, -0.02, P[:, 2] - F['knee'].z) * leg_m
    foot = (1 - ss(ANKLE_Z - ANKLE_W[0], ANKLE_Z + ANKLE_W[1], P[:, 2])) * knee
    toe = ss(FT.BALL_Y + TOE_W, FT.BALL_Y - TOE_W, P[:, 1]) * foot
    W['cang_chan'] = knee - foot; W['ban_chan'] = foot - toe; W['ngon_chan'] = toe
    # --- khoa: phần còn lại
    tot = sum(W[k] for k in names if k != 'khoa'); W['khoa'] = np.clip(1 - tot, 0, 1)
    # làm mượt weights theo kề đỉnh (chỉ vùng chi trái), chuẩn hoá
    ed = np.array([e.vertices[:] for e in me.edges]); deg = np.bincount(ed.ravel(), minlength=n).clip(1); limb = (arm_m | leg_m).astype(float)
    M = np.stack([W[k] for k in names], 1)
    for _ in range(4):
        acc = np.zeros_like(M)
        for j in range(M.shape[1]): acc[:, j] = np.bincount(ed[:, 0], weights=M[ed[:, 1], j], minlength=n) + np.bincount(ed[:, 1], weights=M[ed[:, 0], j], minlength=n)
        M = M * (1 - 0.5 * limb[:, None]) + 0.5 * limb[:, None] * acc / deg[:, None]
    M /= M.sum(1, keepdims=True).clip(1e-9)
    ob.vertex_groups.clear()
    for j, k in enumerate(names):
        g = ob.vertex_groups.new(name=k); nz = np.nonzero(M[:, j] > 0.001)[0]
        for vi in nz.tolist(): g.add([vi], float(M[vi, j]), 'REPLACE')
    md = ob.modifiers.new('Armature', 'ARMATURE'); md.object = arm
    # Corrective Smooth CỤC BỘ (sau Armature, tham chiếu ORCO): chỉ gò ngón cái + đáy lòng tay; không đổi hình lúc nghỉ, không phải shape key.
    col = {k: M[:, j] for j, k in enumerate(names)}; dm = np.array(names)[np.argmax(M, 1)]; u_ = (P - np.array(F['c_w'])) @ np.array(F['d'])
    wcs = np.maximum(np.clip(col['thumb1'] * 3 + col['thumb2'] * CS_T2, 0, 1), ((dm == 'ban_tay') & (u_ > 0.03)).astype(float) * CS_PALM)
    g = ob.vertex_groups.new(name='cs_tay')
    for vi in np.nonzero(wcs > 0.01)[0].tolist(): g.add([vi], float(wcs[vi]), 'REPLACE')
    cs = ob.modifiers.new('CS_tay', 'CORRECTIVE_SMOOTH'); cs.vertex_group = 'cs_tay'; cs.iterations = CS_ITER; cs.factor = 0.0;   # bật theo mức nắm tay; cs.rest_source = 'ORCO'; cs.smooth_type = 'LENGTH_WEIGHTED'
    return M, names


# ================================================================== điều khiển khớp
def _tail(arm, b):
    bpy.context.view_layer.update(); return arm.matrix_world @ arm.pose.bones[b].tail


def local_axis(arm, bone, dir_world):
    """Trục cục bộ (0/1/2) + dấu để quay dương đưa đuôi xương theo `dir_world` (đo thực nghiệm)."""
    pb = arm.pose.bones[bone]; t0 = _tail(arm, bone); best = None
    for ax in range(3):
        e = [0, 0, 0]; e[ax] = 0.2; pb.rotation_euler = e; dd = (_tail(arm, bone) - t0).dot(dir_world); pb.rotation_euler = (0, 0, 0)
        if best is None or abs(dd) > abs(best[1]): best = (ax, dd)
    return best[0], (1.0 if best[1] > 0 else -1.0)


def reset(arm):
    for pb in arm.pose.bones: pb.rotation_euler = (0, 0, 0); pb.location = (0, 0, 0)
    bpy.context.view_layer.update()


def rot(arm, bone, axsg, deg):
    ax, sg = axsg; e = list(arm.pose.bones[bone].rotation_euler); e[ax] += sg * math.radians(deg); arm.pose.bones[bone].rotation_euler = e


def axes(arm, F):
    A = {}
    A['gap_truoc'] = local_axis(arm, 'ban_tay', F['N'])                 # gập cổ tay về phía lòng tay
    A['nghieng_ut'] = local_axis(arm, 'ban_tay', F['S'])                # nghiêng về phía ngón út
    A['gap_len'] = local_axis(arm, 'ban_chan', Vector((0, 0, 1)))       # gập bàn chân lên (mu chân về phía cẳng chân)
    A['shin_truoc'] = local_axis(arm, 'cang_chan', Vector((0, -1, 0)))  # cẳng chân ngả về trước
    A['ngon_len'] = local_axis(arm, 'ngon_chan', Vector((0, 0, 1)))
    for fn in HT.FINGERS:
        for i in (1, 2, 3): A[f'{fn}{i}'] = local_axis(arm, f'{fn}{i}', F['N'])
    for i in (1, 2, 3): A[f'thumb{i}'] = local_axis(arm, f'thumb{i}', F['N'])
    return A


def nhac_got(arm, A, F, deg=25.0):
    """Nhấc gót, tựa mũi bàn chân: bàn chân gập xuống `deg` so với cẳng chân, cẳng chân ngả trước quanh gối sao cho đường gốc ngón ở nguyên
    độ cao cũ; ngón chân quay ngược để vẫn phẳng sàn. (Thân bị khoá nên gối gập ra trước thay vì người nhấc lên.)"""
    pbs = arm.pose.bones; ball0 = (arm.matrix_world @ pbs['ngon_chan'].head).z; tip0 = _tail(arm, 'ngon_chan').z
    def set_(a):
        reset(arm); rot(arm, 'cang_chan', A['shin_truoc'], a); rot(arm, 'ban_chan', A['gap_len'], -deg); bpy.context.view_layer.update()
        return (arm.matrix_world @ pbs['ngon_chan'].head).z - ball0
    lo, hi = 0.0, 40.0
    for _ in range(30):
        m = (lo + hi) / 2
        if set_(m) > 0: lo = m
        else: hi = m
    a = (lo + hi) / 2; set_(a)
    lo, hi = -60.0, 60.0
    for _ in range(30):
        m = (lo + hi) / 2; pbs['ngon_chan'].rotation_euler = (0, 0, 0); rot(arm, 'ngon_chan', A['ngon_len'], m)
        if _tail(arm, 'ngon_chan').z - tip0 > 0: hi = m
        else: lo = m
    return a


POSES = {   # tên: (nhóm, danh sách (xương/trục, độ)); 'kiem_gioi_han' = chỉ báo số
    'gap_co_tay_truoc_30': ('co_tay', [('ban_tay', 'gap_truoc', 30)]),
    'gap_co_tay_sau_30': ('co_tay', [('ban_tay', 'gap_truoc', -30)]),
    'gap_co_tay_truoc_45': ('co_tay', [('ban_tay', 'gap_truoc', 45)]),
    'gap_co_tay_sau_45': ('co_tay', [('ban_tay', 'gap_truoc', -45)]),
    'nghieng_co_tay_ut_18': ('co_tay', [('ban_tay', 'nghieng_ut', 18)]),
    'nghieng_co_tay_cai_18': ('co_tay', [('ban_tay', 'nghieng_ut', -18)]),
    'gap_ban_chan_len_20': ('mat_ca', [('ban_chan', 'gap_len', 20)]),
    'gap_ban_chan_xuong_30': ('mat_ca', [('ban_chan', 'gap_len', -30)]),
    'nhac_got': ('mat_ca', 'nhac_got'),
}
LIMIT_POSES = {'gap_co_tay_truoc_45', 'gap_co_tay_sau_45'}


def apply_pose(arm, A, F, name, t=1.0):
    reset(arm); grp, spec = POSES[name]
    if spec == 'nhac_got':
        if t >= 1.0: nhac_got(arm, A, F)
        else:
            a = nhac_got(arm, A, F); e = {b.name: tuple(b.rotation_euler) for b in arm.pose.bones}; reset(arm)
            for k, v in e.items(): arm.pose.bones[k].rotation_euler = tuple(x * t for x in v)
    else:
        for b, ax, deg in spec: rot(arm, b, A[ax], deg * t)
    bpy.context.view_layer.update()


# ================================================================== bàn tay: nắm, cầm cốc (hiệu chỉnh trên lưới liền da)
CURL = {'fist': (72, 62, 52), 'grip': (40, 50, 35)}     # nắm: dồn góc sang khớp gốc ngón (lượt trước 62/72/54 → nếp khớp giữa ngón trỏ tự giao)


def make_cup(F):
    """Cốc thử (bán kính 38 mm × KZ) áp lòng tay như dung_tay_nam.make_cup, đặt theo khung cổ tay cage."""
    X = F['X']; r = 0.038 * N.KZ * N.HAND_K; c = X(HT.L(0.066, 0.010, HT.PALM_HT + 0.038 + 0.010)); ax = (X(HT.L(0.066, 1.0, 0)) - X(HT.L(0.066, 0.0, 0))).normalized()
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=r, depth=0.100 * N.KZ * N.HAND_K, location=c); cup = bpy.context.object; cup.name = 'Coc_thu'
    cup.rotation_euler = ax.to_track_quat('Z', 'Y').to_euler(); bpy.context.view_layer.update(); bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    cup.data.materials.append(N._mat('coc', (0.85, 0.85, 0.88))); return cup


class HandFit:
    """Vùng đỉnh theo weight (đốt cuối mỗi ngón, lòng tay, ngón cái) và phép đo tiếp xúc/xuyên trên lưới đã biến dạng."""
    def __init__(self, Ms, M, names):
        self.Ms = Ms; col = {k: M[:, j] for j, k in enumerate(names)}
        self.tip = {f: np.nonzero(col[f'{f}3'] > 0.5)[0] for f in HT.FINGERS}; self.mid = {f: np.nonzero(col[f'{f}2'] > 0.5)[0] for f in HT.FINGERS}
        dmn = np.array(names)[np.argmax(M, 1)]; self.hand_mask = np.isin(dmn, [n for n in names if n.startswith(('ban_tay', 'thumb')) or n[:-1] in HT.FINGERS]); self.base = {f: np.nonzero((dmn == f'{f}1') | (dmn == f'{f}2'))[0] for f in HT.FINGERS}   # theo xương chi phối (ngưỡng > 0,5 bỏ sót đỉnh nếp chia 3 xương)
        dom = np.array(names)[np.argmax(M, 1)]; self.palm = np.nonzero(dom == 'ban_tay')[0];   # lòng tay = mọi đỉnh do ban_tay chi phối (gồm gò ngón cái; lượt trước > 0,9 bỏ sót → ngón trỏ chọc gò)
        self.th = np.nonzero((col['thumb2'] + col['thumb3']) > 0.5)[0]; self.th3 = np.nonzero(col['thumb3'] > 0.5)[0]
        self.fing = np.nonzero(sum(col[f'{f}{i}'] for f in HT.FINGERS for i in (1, 2, 3)) > 0.5)[0]
        self.notthumb = np.nonzero((col['thumb1'] + col['thumb2'] + col['thumb3'] < 0.05) & (sum(col[k] for k in col if k not in ('khoa', 'cang_tay', 'cang_chan', 'ban_chan', 'ngon_chan')) > 0.5))[0]
        tz = (col['thumb1'] + col['thumb2'] + col['ban_tay'] * (col['thumb1'] > 0.05)) > 0.3; self.th_e = np.nonzero(tz[Ms.ed[:, 0]] & tz[Ms.ed[:, 1]])[0]

    def bvh(self, P, idx):
        m = np.zeros(len(P), bool); m[idx] = True; fs = [f for f in self.Ms.polys if all(m[i] for i in f)]
        return BVHTree.FromPolygons(P.tolist(), fs, all_triangles=False) if fs else None

    def contact(self, P, f, other_bvh):
        bt = self.bvh(P, self.tip[f]); d = min(other_bvh.find_nearest(Vector(P[i]))[3] for i in self.tip[f]); return d, (len(bt.overlap(other_bvh)) if bt else 0)   # mọi đỉnh đốt cuối (lấy mẫu 1/3 đỉnh từng báo khe ngón trỏ 5,5 mm khi thật ra 1,4 mm)


def calibrate_hand(arm, A, F, Ms, HF, cup):
    """Dò hệ số cuộn từng ngón (nắm: chạm lòng tay; cầm cốc: chạm cốc) không xuyên; ngón cái quét 3 trục: không xuyên ngón/cốc, sát nhất."""
    res = {'fist': {}, 'grip': {}}; P0 = Ms.coords()
    cs = HF.Ms.ob.modifiers.get('CS_tay')
    def set_curl(kind, ks, thumb=None):
        reset(arm)
        for o_ in bpy.data.objects:                                # Corrective Smooth theo mức nắm tay (rig thật: driver từ thuộc tính nắm); cả bản sao wireframe
            if o_.type == 'MESH' and 'CS_tay' in o_.modifiers: o_.modifiers['CS_tay'].factor = 1.0 if kind == 'fist' else 0.0
        for f, k in ks.items():
            for i in (1, 2, 3): rot(arm, f'{f}{i}', A[f'{f}{i}'], CURL[kind][i - 1] * k)
        if thumb:
            arm.pose.bones['thumb1'].rotation_euler = thumb[0]
            for i in (2, 3): rot(arm, f'thumb{i}', A[f'thumb{i}'], thumb[1][i - 2])
        bpy.context.view_layer.update()
    bc = BVHTree.FromPolygons([tuple(cup.matrix_world @ v.co) for v in cup.data.vertices], [list(p.vertices) for p in cup.data.polygons], all_triangles=False)
    def fit_fingers(kind, ks, thumb=None, k0=0.3, only=HT.FINGERS):
        for f in only:
            k = k0 if thumb is None else max(0.3, ks[f] - 0.04); last = k
            while k <= 2.2:
                ks[f] = k; set_curl(kind, ks, thumb); P = Ms.coords(); other = HF.bvh(P, HF.palm) if kind == 'fist' else bc
                d, pen = HF.contact(P, f, other)
                if thumb is not None: pen += len(HF.bvh(P, HF.tip[f]).overlap(HF.bvh(P, HF.th))) + HF.Ms.self_hits(P, HF.hand_mask)   # lượt 2: không xuyên ngón cái, không tự giao ở đâu trên bàn tay (nếp lòng tay dưới gốc ngón)
                if pen: break
                last = k
                if d <= 0.0015: break
                k += 0.02
            ks[f] = last
        return ks
    for kind in ('fist', 'grip'):
        ks = fit_fingers(kind, {f: 0.0 for f in HT.FINGERS})
        set_curl(kind, ks); P = Ms.coords(); best = None
        targ = HF.bvh(P, np.concatenate([HF.mid['index'], HF.mid['middle']])) if kind == 'fist' else bc
        obst = HF.bvh(P, HF.notthumb)
        for a_ in (-60, -40, -20, 0, 20, 40):
            for b_ in (-40, -20, 0, 20, 40):
                for c_ in (-40, -20, 0, 20, 40):
                    th = ((math.radians(a_), math.radians(b_), math.radians(c_)), (30, 35) if kind == 'fist' else (15, 15))
                    set_curl(kind, ks, th); P = Ms.coords(); bt = HF.bvh(P, HF.th)
                    obst = HF.bvh(P, HF.notthumb)
                    if kind == 'fist': targ = HF.bvh(P, np.concatenate([HF.mid['index'], HF.mid['middle']]))
                    pen = len(bt.overlap(obst)) + (len(bt.overlap(bc)) if kind == 'grip' else 0)   # không xuyên phần nào của bàn tay (trừ chính ngón cái) / cốc
                    if pen: continue
                    d = min(targ.find_nearest(Vector(P[i]))[3] for i in HF.th3[::3]); st = np.linalg.norm(P[Ms.ed[:, 0]] - P[Ms.ed[:, 1]], axis=1) / Ms.l0.clip(1e-9)
                    sc_ = d + (STRETCH_PEN if kind == 'fist' else STRETCH_PEN_GRIP) * int((st[HF.th_e] > 2.0).sum())   # sát đích, ít kéo da gò ngón cái
                    if best is None or sc_ < best[2]: best = (d, th, sc_)
        if kind == 'fist' and best: ks = fit_fingers(kind, ks, best[1], only=('index', 'middle'))   # lượt 2 (chỉ ngón trỏ): ngón cái vắt ngang kéo gò đi → ngón trỏ cuộn lại tới khi chạm lòng tay/ngón cái (cả 4 ngón → nếp lòng tay gập vào gốc ngón giữa/áp út)
        res[kind] = dict(ks=ks, thumb=best[1] if best else None, khe_ngon_cai=best[0] if best else None)
        print(f'    hiệu chỉnh {kind}: ' + ', '.join(f'{f} {k:.2f}' for f, k in ks.items()) + (f'; ngón cái {[round(math.degrees(x)) for x in best[1][0]]}° khe {best[0] * 1000:.1f} mm' if best else '; ngón cái: không tìm được tư thế không xuyên'))
    reset(arm); return res, set_curl


# ================================================================== đo
class Meas:
    """Dữ liệu tĩnh của lưới (cạnh, cặp mặt kề cạnh) để đo nhanh từng tư thế bằng numpy."""
    def __init__(self, ob):
        self.ob = ob; me = ob.data; bm = bmesh.new(); bm.from_mesh(me); bm.edges.ensure_lookup_table()
        self.ed = np.array([[e.verts[0].index, e.verts[1].index] for e in bm.edges])
        two = [e for e in bm.edges if len(e.link_faces) == 2]
        self.ef = np.array([[e.link_faces[0].index, e.link_faces[1].index] for e in two]); self.ev2 = np.array([[e.verts[0].index, e.verts[1].index] for e in two]); bm.free()
        self.polys = [list(p.vertices) for p in me.polygons]; self.quad = np.array([p if len(p) == 4 else p + [p[-1]] for p in self.polys])
        self.P0 = self.coords(); self.l0 = np.linalg.norm(self.P0[self.ed[:, 0]] - self.P0[self.ed[:, 1]], axis=1); self.ang0 = self.angles(self.P0)

    def coords(self):
        dg = bpy.context.evaluated_depsgraph_get(); ev = self.ob.evaluated_get(dg); me = ev.to_mesh()
        a = np.zeros(len(me.vertices) * 3); me.vertices.foreach_get('co', a); ev.to_mesh_clear(); return a.reshape(-1, 3)

    def angles(self, P):
        q = self.quad; nr = np.cross(P[q[:, 2]] - P[q[:, 0]], P[q[:, 3]] - P[q[:, 1]]); nr /= np.linalg.norm(nr, axis=1, keepdims=True).clip(1e-12)
        return np.degrees(np.arccos(np.clip((nr[self.ef[:, 0]] * nr[self.ef[:, 1]]).sum(1), -1, 1)))

    def measure(self, zone):
        P = self.coords(); r = np.linalg.norm(P[self.ed[:, 0]] - P[self.ed[:, 1]], axis=1) / self.l0.clip(1e-9)
        ez = zone[self.ed[:, 0]] & zone[self.ed[:, 1]]; ang = self.angles(P); dz = zone[self.ev2[:, 0]] & zone[self.ev2[:, 1]]
        return dict(P=P, r=r, ang=ang, gian_max=float(r[ez].max()), co_min=float(r[ez].min()), n_gian=int((r[ez] > 2.0).sum()), n_co=int((r[ez] < 0.5).sum()),
                    nhi_dien_max=float(ang[dz].max()), nhi_dien_nghi=float(self.ang0[dz].max()))

    def self_hits(self, P, vmask):
        fs = [i for i, f in enumerate(self.polys) if all(vmask[j] for j in f)]
        if not fs: return 0
        bv = BVHTree.FromPolygons(P.tolist(), [self.polys[i] for i in fs], all_triangles=False); fv = [set(self.polys[i]) for i in fs]
        hits = [(a_, b_) for a_, b_ in bv.overlap(bv) if a_ < b_ and not (fv[a_] & fv[b_])]
        self.hit_pts = [tuple(np.round(P[self.polys[fs[a_]]].mean(0), 3)) for a_, _ in hits]; self.hit_v = [(self.polys[fs[a_]][0], self.polys[fs[b_]][0]) for a_, b_ in hits]; return len(hits)

    def section_area(self, P, mask, c, n, rmax=0.09):
        """Diện tích tiết diện (m²) tại mặt phẳng (c, n): giao các cạnh trong `mask` cắt mặt phẳng (gần c), xếp theo góc, shoelace."""
        c = np.array(tuple(c)); n = np.array(tuple(n)); n = n / np.linalg.norm(n); dd = (P - c) @ n
        e = self.ed[mask[self.ed[:, 0]] & mask[self.ed[:, 1]]]; a, b = dd[e[:, 0]], dd[e[:, 1]]; cut = (a * b) < 0; e, a, b = e[cut], a[cut], b[cut]
        X = P[e[:, 0]] + (a / (a - b))[:, None] * (P[e[:, 1]] - P[e[:, 0]]); X = X[np.linalg.norm(X - c, axis=1) < rmax]
        if len(X) < 6: return 0.0
        e1 = np.cross(n, [0, 0, 1.0] if abs(n[2]) < 0.9 else [1.0, 0, 0]); e1 /= np.linalg.norm(e1); e2 = np.cross(n, e1)
        q = np.c_[(X - c) @ e1, (X - c) @ e2]; q = q[np.argsort(np.arctan2(q[:, 1] - q[:, 1].mean(), q[:, 0] - q[:, 0].mean()))]
        return float(0.5 * abs(np.dot(q[:, 0], np.roll(q[:, 1], -1)) - np.dot(q[:, 1], np.roll(q[:, 0], -1))))


def section_plane(arm, F, grp):
    """Mặt phẳng đo tiết diện tại khớp (tư thế hiện tại): cổ tay = phân giác trục cẳng tay & bàn tay; mắt cá = vuông góc trục cẳng chân."""
    pb = arm.pose.bones; mw = arm.matrix_world
    if grp == 'co_tay':
        a = (mw @ pb['cang_tay'].tail - mw @ pb['cang_tay'].head).normalized(); b = (mw @ pb['ban_tay'].tail - mw @ pb['ban_tay'].head).normalized()
        return mw @ pb['ban_tay'].head, (a + b).normalized()
    a = (mw @ pb['cang_chan'].tail - mw @ pb['cang_chan'].head).normalized(); return mw @ pb['cang_chan'].tail + a * (-0.015), a


def criteria(name, m, area_ratio, hits):
    """Ngưỡng: tư thế thường — không cạnh giãn > 2 / co < 0,5 ở vùng khớp, tiết diện ≥ 75%, nhị diện ≤ 60°, 0 tự giao. Tư thế 45°: chỉ báo số."""
    if name in LIMIT_POSES: return None
    return m['n_gian'] == 0 and m['n_co'] == 0 and area_ratio >= 0.75 and m['nhi_dien_max'] <= 60 and hits == 0


# ================================================================== ảnh
def cam_for(grp, F, view):
    if grp == 'ban_tay':
        c = F['K'] + F['d'] * 0.01
        return c, {'long': c + (F['N'] * 0.5 + Vector((0, -1.0, 0)) - F['d'] * 0.3).normalized() * 2.0, 'ut': c + F['S'] * 2.0, 'cheo': c + (F['N'] + F['S'] * 0.7 - F['d'] * 0.4).normalized() * 2.0, 'ben': c - F['S'] * 2.0}[view], 0.20
    if grp == 'co_tay':
        c = F['c_w'] + F['d'] * 0.03
        return c, {'ben': c + F['S'] * 2.0, 'truoc': c - F['N'] * 0.4 + Vector((0, -2.0, 0)), 'cheo': c + (F['S'] - F['N']).normalized() * 2.0 + Vector((0, 0, 0.5))}[view], 0.22
    c = Vector((0.10, -0.01, 0.07))
    return c, {'ben': c + Vector((2.0, -0.7, 0.05)), 'truoc': c + Vector((0.3, -2.0, 0.2)), 'cheo': c + Vector((1.4, -1.4, 0.7))}[view], 0.32


def _strain_colors(ob, M, m):
    """Màu theo đỉnh: xanh = co (≤0,5), trắng = giữ, đỏ = giãn (≥2) — lấy cạnh lệch nhiều nhất quanh đỉnh."""
    n = len(ob.data.vertices); lg = np.log2(m['r'].clip(1e-6)); v = np.zeros(n)
    np.maximum.at(v, M.ed[:, 0], np.abs(lg)); np.maximum.at(v, M.ed[:, 1], np.abs(lg)); sg = np.zeros(n); np.add.at(sg, M.ed[:, 0], lg); np.add.at(sg, M.ed[:, 1], lg)
    t = np.clip(v, 0, 1); col = np.ones((n, 4)); red = sg > 0
    col[red, 1] = 1 - t[red]; col[red, 2] = 1 - t[red]; col[~red, 0] = 1 - t[~red]; col[~red, 1] = 1 - 0.5 * t[~red]
    a = ob.data.color_attributes.get('gian') or ob.data.color_attributes.new('gian', 'FLOAT_COLOR', 'POINT'); a.data.foreach_set('color', col.astype(np.float32).ravel())


def materials():
    clay = N._mat('clay', (0.62, 0.60, 0.58)); day = N._mat('day', (0.05, 0.05, 0.08), 0.9)
    g = bpy.data.materials.get('ban_do_gian') or bpy.data.materials.new('ban_do_gian'); g.use_nodes = True; nt = g.node_tree
    if not any(nd.type == 'ATTRIBUTE' for nd in nt.nodes):
        at = nt.nodes.new('ShaderNodeAttribute'); at.attribute_name = 'gian'; bs = nt.nodes.get('Principled BSDF'); nt.links.new(at.outputs['Color'], bs.inputs['Base Color']); bs.inputs['Roughness'].default_value = 0.8
    return clay, day, g


def render_pose(sc, ob, wire_ob, out, tag, grp, F, views=('ben', 'cheo'), res=520):
    os.makedirs(out, exist_ok=True); sc.render.resolution_x = sc.render.resolution_y = res; files = []
    for v in views:
        tg, loc, scl = cam_for(grp, F, v); sc.camera = T.cam(sc, f'{tag}_{v}', loc, tg, scl); sc.render.filepath = os.path.join(out, f'{tag}_{v}.png')
        bpy.ops.render.render(write_still=True); files.append(sc.render.filepath)
    return files


# ================================================================== chạy
def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--blend', required=True); ap.add_argument('--out', required=True); ap.add_argument('--luu', default='')
    ap.add_argument('--clip', action='store_true'); ap.add_argument('--samples', type=int, default=16); ap.add_argument('--tu-the', default='')
    a = ap.parse_args(argv); out = os.path.abspath(a.out)
    bpy.ops.wm.open_mainfile(filepath=os.path.abspath(a.blend)); sc = bpy.context.scene; sc.cycles.samples = a.samples
    src = bpy.data.objects['Nam_Dau_Than']; ob = src.copy(); ob.data = src.data.copy(); ob.name = 'Nam_RigThu'; sc.collection.objects.link(ob)
    for o in sc.objects:
        if o.type == 'MESH' and o is not ob: o.hide_render = True
    F = frames(); arm = build_rig(F); M_w, names = skin(ob, arm, F); A = axes(arm, F); reset(arm)
    clay, day, gmat = materials(); ob.data.materials.clear(); ob.data.materials.append(clay); ob.data.materials.append(day)
    wire = ob.copy(); wire.name = 'Nam_RigThu_wire'; sc.collection.objects.link(wire); wm = wire.modifiers.new('wf', 'WIREFRAME'); wm.thickness = 0.0005; wm.use_replace = True; wm.material_offset = 1
    T.lights(sc); ld = bpy.data.lights.new('xien', 'SUN'); ld.energy = 4.0; lo = bpy.data.objects.new('xien', ld); sc.collection.objects.link(lo); lo.rotation_euler = (math.radians(78), 0, math.radians(60))
    Ms = Meas(ob); zones = N._zones(Ms.P0); zone = {'co_tay': zones['co_tay_+1'], 'mat_ca': zones['mat_ca_+1']}
    limb = (Ms.P0[:, 0] > 0) & ((np.array([0]) == 0)[0]); tay = np.zeros(len(Ms.P0)); ob.data.attributes['tay'].data.foreach_get('value', tay); chan = np.zeros(len(Ms.P0)); ob.data.attributes['chan'].data.foreach_get('value', chan)
    limb = (Ms.P0[:, 0] > 0) & ((tay > 0.5) | (chan > 0.5))
    near = {'co_tay': np.linalg.norm(Ms.P0 - np.array(F['c_w']), axis=1) < 0.12, 'mat_ca': np.linalg.norm(Ms.P0 - np.array(F['ankle']), axis=1) < 0.15}
    base_area = {}
    for g_ in ('co_tay', 'mat_ca'):
        c, n = section_plane(arm, F, g_); base_area[g_] = Ms.section_area(Ms.P0, limb, c, n)
    print(f'    trục: {A["gap_truoc"]} gập cổ tay, {A["gap_len"]} gập bàn chân; tiết diện nghỉ cổ tay {base_area["co_tay"] * 1e4:.1f} cm², mắt cá {base_area["mat_ca"] * 1e4:.1f} cm²')
    render_pose(sc, ob, wire, os.path.join(out, 'anh'), 'nghi_co_tay', 'co_tay', F); render_pose(sc, ob, wire, os.path.join(out, 'anh'), 'nghi_mat_ca', 'mat_ca', F)
    names_ = [p for p in POSES if not a.tu_the or p in a.tu_the.split(',')]; res = {}
    for nm in names_:
        grp = POSES[nm][0]; apply_pose(arm, A, F, nm); m = Ms.measure(zone[grp] & near[grp]); c, n = section_plane(arm, F, grp)
        ar = Ms.section_area(m['P'], limb & near[grp], c, n) / max(base_area[grp], 1e-9); hits = Ms.self_hits(m['P'], limb & near[grp])
        ok = criteria(nm, m, ar, hits); res[nm] = dict(nhom=grp, dat=ok, gian_max=round(m['gian_max'], 2), co_min=round(m['co_min'], 2), n_gian=m['n_gian'], n_co=m['n_co'],
                                                      nhi_dien_max=round(m['nhi_dien_max'], 1), nhi_dien_nghi=round(m['nhi_dien_nghi'], 1), tiet_dien=round(ar, 3), tu_giao=hits)
        print(f'    {"PASS" if ok else ("SỐ  " if ok is None else "FAIL")}  {nm}: giãn max {m["gian_max"]:.2f}× co min {m["co_min"]:.2f}× (>2: {m["n_gian"]}, <0,5: {m["n_co"]}), '
              f'nhị diện max {m["nhi_dien_max"]:.0f}° (nghỉ {m["nhi_dien_nghi"]:.0f}°), tiết diện {ar * 100:.0f}%, tự giao {hits}' + (f' tại {Ms.hit_pts[:3]}' if hits else ''))
        render_pose(sc, ob, wire, os.path.join(out, 'anh'), nm, grp, F)
        _strain_colors(ob, Ms, m); ob.data.materials[0] = gmat; wire.hide_render = True
        render_pose(sc, ob, wire, os.path.join(out, 'gian'), nm, grp, F, views=('ben',)); ob.data.materials[0] = clay; wire.hide_render = False
    reset(arm)
    if not a.tu_the or 'ban_tay' in a.tu_the:
        HF = HandFit(Ms, M_w, names); cup = make_cup(F); cup.hide_render = True; cal, set_curl = calibrate_hand(arm, A, F, Ms, HF, cup)
        hz = (Ms.P0[:, 0] > 0) & (tay > 0.5) & ((Ms.P0 - np.array(F['c_w'])) @ np.array(F['d']) > 0.0)
        for kind, nm in (('fist', 'nam_tay'), ('grip', 'cam_coc')):
            set_curl(kind, cal[kind]['ks'], cal[kind]['thumb']); m = Ms.measure(hz); P = m['P']; hits = Ms.self_hits(P, hz)   # set_curl đặt hệ số Corrective Smooth theo nắm
            pen_cup = len(HF.bvh(P, np.nonzero(hz)[0]).overlap(BVHTree.FromPolygons([tuple(cup.matrix_world @ v.co) for v in cup.data.vertices], [list(p.vertices) for p in cup.data.polygons], all_triangles=False))) if kind == 'grip' else 0
            other = HF.bvh(P, HF.palm) if kind == 'fist' else BVHTree.FromPolygons([tuple(cup.matrix_world @ v.co) for v in cup.data.vertices], [list(p.vertices) for p in cup.data.polygons], all_triangles=False)
            ct = {f: round(HF.contact(P, f, other)[0] * 1000, 1) for f in HT.FINGERS}
            if kind == 'fist':                                                # chạm = sát lòng tay HOẶC tì vào ngón cái đang vắt ngang (nắm thật: đầu ngón trỏ nằm dưới ngón cái)
                bth = HF.bvh(P, HF.th); ct = {f: round(min(v / 1000, min(bth.find_nearest(Vector(P[i]))[3] for i in HF.tip[f])) * 1000, 1) for f, v in ct.items()}
            ez = hz[Ms.ed[:, 0]] & hz[Ms.ed[:, 1]]; big = np.nonzero(ez & (m['r'] > 2.0))[0]
            dom = lambda vi: names[int(np.argmax(M_w[vi]))]
            from collections import Counter
            where = dict(Counter(dom(Ms.ed[i, 0]) for i in big).most_common(6))
            print(f'       tự giao theo cặp xương: {dict(Counter(tuple(sorted((dom(a_), dom(b_)))) for a_, b_ in Ms.hit_v).most_common(6)) if hits else {}}')
            res[nm] = dict(nhom='ban_tay', gian_max=round(m['gian_max'], 2), n_gian=m['n_gian'], co_min=round(m['co_min'], 2), tu_giao=hits, xuyen_coc=pen_cup, khe_mm=ct,
                           vung_gian_2x=where, hieu_chinh={k: round(v, 2) for k, v in cal[kind]['ks'].items()}, dat=(hits == 0 and pen_cup == 0 and max(ct.values()) <= 3.0))
            print(f'    {"PASS" if res[nm]["dat"] else "FAIL"}  {nm}: khe đốt cuối→{"lòng tay" if kind == "fist" else "cốc"} (mm) {ct}; tự giao {hits}; xuyên cốc {pen_cup}; '
                  f'giãn max {m["gian_max"]:.2f}× ({m["n_gian"]} cạnh > 2× ở {where}), co min {m["co_min"]:.2f}×')
            cup.hide_render = (kind != 'grip')
            render_pose(sc, ob, wire, os.path.join(out, 'anh'), nm, 'ban_tay', F, views=('long', 'ut', 'cheo', 'ben'))
            _strain_colors(ob, Ms, m); ob.data.materials[0] = gmat; wire.hide_render = True
            render_pose(sc, ob, wire, os.path.join(out, 'gian'), nm, 'ban_tay', F, views=('long', 'ut')); ob.data.materials[0] = clay; wire.hide_render = False
        cup.hide_render = True; reset(arm)
        for o_ in (ob, wire): o_.modifiers['CS_tay'].factor = 0.0
    with open(os.path.join(out, 'ket_qua.json'), 'w') as fh: json.dump(res, fh, ensure_ascii=False, indent=1)
    if a.clip:
        sc.render.resolution_x = sc.render.resolution_y = 360; sc.cycles.samples = max(8, a.samples // 2)
        for grp in ('co_tay', 'mat_ca'):
            d_ = os.path.join(out, 'clip', grp); os.makedirs(d_, exist_ok=True); k = 0
            tg, loc, scl = cam_for(grp, F, 'cheo'); sc.camera = T.cam(sc, f'clip_{grp}', loc, tg, scl)
            for nm in [p for p in names_ if POSES[p][0] == grp]:
                for t in list(np.linspace(0, 1, 10)) + list(np.linspace(1, 0, 6))[1:]:
                    apply_pose(arm, A, F, nm, float(t)); sc.render.filepath = os.path.join(d_, f'{k:04d}.png'); bpy.ops.render.render(write_still=True); k += 1
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '12', '-i', os.path.join(d_, '%04d.png'), '-pix_fmt', 'yuv420p', os.path.join(out, 'clip', f'{grp}.mp4')], check=False)
        reset(arm)
    if a.luu: bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.luu))
    bad = [k for k, v in res.items() if v['dat'] is False]; print('KẾT QUẢ:', 'PASS' if not bad else 'FAIL ' + ', '.join(bad))


if __name__ == '__main__':
    main()
