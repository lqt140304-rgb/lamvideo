"""BỘ CHUYỂN ĐỘNG THỬ CHO NAM-003 (đi bộ, chạy, ngồi, nằm, lăn, bò, trườn) — Blender 5.2.x.

  <bpy-python> chuyen_dong_nam003.py --rig nam-003-rig.blend --dong di_bo [--anh dir] [--do] [--khung N]

Mỗi chuyển động là hàm (khung, tổng) → đặt tư thế bằng các điều khiển của rig (root, Hips, Spine, ik_foot.L/R, ik_hand.L/R, tay FK), rồi khóa keyframe.
Quy ước: mặt hướng −Y, trái nhân vật = +X, Z lên. Đo mỗi khung: gối lệch ngang so với đường hông–mắt cá (cm), gối gập ngược (hyperextension), điểm thấp nhất của lưới (xuyên sàn), cạnh giãn >2×.
"""
import sys, os, math, argparse, json
import numpy as np, bpy
from mathutils import Vector, Matrix, Euler

HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import rig_nam003 as R

FPS = 24
X, Y, Z = (1, 0, 0), (0, 1, 0), (0, 0, 1)


class Ctx:
    def __init__(self, rig_path):
        bpy.ops.wm.open_mainfile(filepath=os.path.abspath(rig_path)); self.sc = bpy.context.scene
        self.arm = bpy.data.objects['Nam_Rig']; self.body = bpy.data.objects['Nam_Body']; self.pb = self.arm.pose.bones
        self.g = R.patched_namespace()
        for m in self.body.modifiers:
            if m.type == 'CORRECTIVE_SMOOTH': m.show_viewport = False      # tính nhanh khi dựng; render vẫn bật (show_render)
        self.rest = {b.name: self.arm.matrix_world @ b.bone.matrix_local for b in self.pb}
        self.head = {n: m.translation.copy() for n, m in self.rest.items()}
        self.body.hide_viewport = True                                      # không tính lưới khi dựng tư thế (nhanh); bật lại khi cần đo
        bpy.context.view_layer.update()

    def reset(self):
        self.g['reset'](self.arm)
        for S in ('Left', 'Right'):
            h = self.pb[f'{S}Hand']
            for pr in ('nam', 'nam_tro', 'nam_giua', 'nam_ap', 'nam_cai'):
                if pr in h.keys(): h[pr] = 0.0
        for k in 'LR':
            if 'ik' in self.pb[f'ik_hand.{k}'].keys(): self.pb[f'ik_hand.{k}']['ik'] = 0.0
        self.arm.update_tag(); bpy.context.view_layer.update()

    def upd(self):
        self.arm.update_tag()      # đổi thuộc tính tuỳ biến bằng script không tự đánh dấu driver; thiếu dòng này ngón tay đứng yên
        bpy.context.view_layer.update()

    def place(self, bn, loc=None, euler_deg=(0, 0, 0), world_rot=None):
        """Đặt xương bn: đầu xương ở loc (thế giới), hướng = quay thế giới (euler độ hoặc ma trận 3x3) ∘ hướng nghỉ."""
        R3 = (Euler(tuple(math.radians(a) for a in euler_deg), 'XYZ').to_matrix() if world_rot is None else world_rot)
        loc = self.head[bn] if loc is None else Vector(loc)
        M = Matrix.Translation(loc) @ R3.to_4x4() @ self.rest[bn].to_3x3().to_4x4()
        self.pb[bn].matrix = self.arm.matrix_world.inverted() @ M; self.upd()

    def rot(self, bn, axis, deg): self.g['rot_world'](self.arm, bn, axis, deg)

    def world_head(self, bn): return self.arm.matrix_world @ self.pb[bn].head

    def keyframe(self, f):
        for b in self.pb:
            b.keyframe_insert('location', frame=f); b.keyframe_insert('rotation_euler', frame=f)
        for S in ('Left', 'Right'):
            for pr in ('nam_tro', 'nam_giua', 'nam_ap', 'nam_cai'):
                if pr in self.pb[f'{S}Hand'].keys(): self.pb[f'{S}Hand'].keyframe_insert(f'["{pr}"]', frame=f)
        for k in 'LR':
            if 'ik' in self.pb[f'ik_hand.{k}'].keys(): self.pb[f'ik_hand.{k}'].keyframe_insert('["ik"]', frame=f)

    def ground(self, root_loc, floor=0.0):
        """Hạ/nâng root để điểm thấp nhất của lưới (đã tính IK, không Corrective Smooth) chạm sàn."""
        self.body.hide_viewport = False; self.upd()
        e = self.body.evaluated_get(bpy.context.evaluated_depsgraph_get()); m = e.to_mesh(); a = np.zeros(len(m.vertices) * 3); m.vertices.foreach_get('co', a); e.to_mesh_clear()
        zmin = a.reshape(-1, 3)[:, 2].min(); self.body.hide_viewport = True; self.upd()
        return Vector((root_loc[0], root_loc[1], root_loc[2] + floor - zmin))


def ik_arm(c, k, target, pole=None):
    c.pb[f'ik_hand.{k}']['ik'] = 1.0
    c.place(f'ik_hand.{k}', target)
    if pole is not None: c.place(f'pole_elbow.{k}', pole)


def foot(c, k, ankle, pitch_deg=0.0, yaw_deg=0.0, roll_deg=0.0):
    """Đặt IK bàn chân: ankle thế giới; pitch quanh X (mũi lên +), yaw quanh Z (mũi quay), roll quanh Y (lật bàn chân: 180 = lòng bàn chân hướng lên, dùng khi bò/trườn)."""
    c.place(f'ik_foot.{k}', ankle, world_rot=(Euler((math.radians(pitch_deg), math.radians(roll_deg), math.radians(yaw_deg)), 'XYZ')).to_matrix())


def ss(t):
    t = min(1.0, max(0.0, t)); return t * t * (3 - 2 * t)


def lerp(a, b, t): return a + (b - a) * t


def lerp3(a, b, t): return tuple(lerp(x, y, t) for x, y in zip(a, b))


def move_bone(c, bn, pos):
    """Dời đầu xương bn tới vị trí thế giới pos, giữ nguyên hướng hiện tại."""
    M = c.arm.matrix_world @ c.pb[bn].matrix; rot3 = M.to_3x3().normalized()
    c.pb[bn].matrix = c.arm.matrix_world.inverted() @ (Matrix.Translation(Vector(pos)) @ rot3.to_4x4()); c.upd()


def ap_dung(c, P, floor=0.0):
    """P: {'fk': [(xương, trục, độ)...] (khung thân đứng, trước khi xoay root), 'root': (loc, euler°),
    'hips': vị trí thế giới của Hips (tuỳ chọn), 'ik_foot': {k: (x,y,z,pitch,yaw)}, 'ik_hand': {k: (x,y,z)}, 'poles': {tên: (x,y,z)}, 'ngon': {prop: giá trị}, 'ground': bool}"""
    def run(dz):
        c.reset()
        for bn, ax, deg in P.get('fk', []): c.rot(bn, ax, deg)
        for S in ('Left', 'Right'):
            for pr, v in P.get('ngon', {}).items(): c.pb[f'{S}Hand'][pr] = v
        loc, eul = P['root']; c.place('root', (loc[0], loc[1], loc[2] + dz), eul)
        if 'hips' in P: move_bone(c, 'Hips', (P['hips'][0], P['hips'][1], P['hips'][2] + dz))
        for k, v in P.get('ik_foot', {}).items(): foot(c, k, (v[0], v[1], v[2] + dz), v[3] if len(v) > 3 else 0.0, v[4] if len(v) > 4 else 0.0, v[5] if len(v) > 5 else 0.0)
        for k, v in P.get('ik_hand', {}).items(): ik_arm(c, k, (v[0], v[1], v[2] + dz))
        for n, v in P.get('poles', {}).items(): c.place(n, (v[0], v[1], v[2] + dz))
    run(0.0)
    if P.get('ground'):
        dz = c.ground((0, 0, 0))[2]                   # ground() trả root_loc.z + floor − zmin; root_loc.z = 0 nên đây là độ nâng cần thiết
        run(dz + floor)
    return P['root'][0]


# ---------------------------------------------------------------- ĐI BỘ / CHẠY BỘ
def phase_foot(phi, S, H, ground_frac=0.6, lift_pow=1.3):
    """(dy, dz, pitch°) cho một bàn chân; phi 0 = chạm gót trước; đứng (trượt sau) tới ground_frac rồi vung."""
    if phi < ground_frac:
        t = phi / ground_frac; dy = -S / 2 + S * t
        pitch = 12 * max(0, 1 - t / 0.12) if t < 0.12 else (-25 * ((t - 0.85) / 0.15) if t > 0.85 else 0)
        dz = 0.0 if t < 0.85 else 0.03 * ((t - 0.85) / 0.15)
        return dy, dz, pitch
    t = (phi - ground_frac) / (1 - ground_frac); e = 0.5 - 0.5 * math.cos(math.pi * t)
    dy = S / 2 - S * e; dz = 0.03 * (1 - t) + H * math.sin(math.pi * t) ** lift_pow
    return dy, dz, -25 * (1 - t) ** 2 + 12 * t ** 3


REACH = 0.97     # tầm với tối đa của chân khi đi/chạy (tỉ lệ chiều dài chân)


def dong_di(c, f, tong, chay=False):
    N = tong; phi0 = (f % N) / N
    S, H = (0.72, 0.24) if chay else (0.70, 0.09)   # chạy: bước ±0,36 m (cũ 0,95 → ±0,475 m là dạng chân bổ nhào, chân sau duỗi thẳng ngang)
    stance_x = 0.095 if not chay else 0.085            # bàn chân đặt gần trục giữa (mắt cá nghỉ ở x 0,148 là dạng chân quá rộng)
    gf = 0.38 if chay else 0.6
    c.reset()
    fwd = -(S * 2) * (f / N)
    ankle0 = {k: c.head[f'ik_foot.{k}'] for k in 'LR'}
    bob_amp = 0.045 if chay else 0.018
    bob = (-0.05 if chay else -0.025) - bob_amp * math.cos(4 * math.pi * phi0)
    sway = (0.012 if chay else 0.022) * math.sin(2 * math.pi * phi0)
    root_loc = Vector((0, fwd, 0)); c.place('root', root_loc)
    tg = {}
    for k, off, sx in (('L', 0.0, 1), ('R', 0.5, -1)):
        phi = (phi0 + off) % 1.0; dy, dz, pit = phase_foot(phi, S, H, gf)
        tg[k] = (Vector((sx * stance_x, ankle0[k].y + dy + fwd, ankle0[k].z + dz + 0.04)), pit)
    hp = c.head['Hips'] + Vector((sway, fwd, bob))
    # chân không được duỗi quá tầm: chân dài L, đích cổ chân cách hông ≤ REACH·L, nếu hơn thì hạ hông (đo 15/11: đi bộ tầm 1,045·L, chạy 1,08·L → gối khoá thẳng, IK kéo lệch đích 4–6 cm = chân méo)
    L_leg = (c.head['LeftLeg'] - c.head['LeftUpLeg']).length + (c.head['LeftFoot'] - c.head['LeftLeg']).length
    for k, sx in (('L', 1), ('R', -1)):
        hj = c.head[f'{"Left" if k == "L" else "Right"}UpLeg'] + (hp - c.head['Hips']); a, _ = tg[k]; r2 = (REACH * L_leg) ** 2 - (a.x - hj.x) ** 2 - (a.y - hj.y) ** 2
        if hj.z > a.z + math.sqrt(max(r2, 0.0)): hp.z -= hj.z - (a.z + math.sqrt(max(r2, 0.0)))
    for k in 'LR': foot(c, k, tg[k][0], tg[k][1])
    yaw = (9 if chay else 7) * math.cos(2 * math.pi * phi0)
    c.place('Hips', hp, euler_deg=(0, -3 * math.cos(2 * math.pi * phi0), yaw))
    lean = 14 if chay else 3
    c.rot('Spine', X, -lean * 0.4 if chay else 0); c.rot('Spine', Z, -yaw * 0.5); c.rot('Spine1', Z, -yaw * 0.4); c.rot('Spine2', Z, -yaw * 0.4)
    if chay:
        c.rot('Spine1', X, -lean * 0.3); c.rot('Spine2', X, -lean * 0.3)        # nghiêng người về trước
    c.rot('Neck', Z, yaw * 0.3); c.rot('Head', Z, yaw * 0.3); c.rot('Head', X, (lean * 0.9) if chay else -2)
    swing = (46 if chay else 24) * math.cos(2 * math.pi * phi0)
    for S_, s in (('Left', 1), ('Right', -1)):
        c.g['rot_world'](c.arm, f'{S_}Arm', (0, 1, 0), s * 80); c.g['rot_world'](c.arm, f'{S_}ForeArm', (0, 1, 0), -s * 12)
        c.g['rot_world'](c.arm, f'{S_}Arm', X, s * swing)
        elbow = (80 + 25 * max(0.0, -s * math.cos(2 * math.pi * phi0))) if chay else (18 + 12 * max(0.0, -s * math.cos(2 * math.pi * phi0)))
        c.g['rot_world'](c.arm, f'{S_}ForeArm', X, -elbow); c.g['rot_world'](c.arm, f'{S_}Hand', Z, -s * 8)
        hb = c.pb[f'{S_}Hand']; base = 0.55 if chay else 0.24
        for pr, b_ in (('nam_tro', .9), ('nam_giua', 1.0), ('nam_ap', 1.1), ('nam_cai', .6)): hb[pr] = min(1.0, base * b_)
    return root_loc


# Tay buông (chọn 15/11 bằng khe tay–thân đo theo độ cao, xem README): bắp tay 80° ép sát thân, cẳng tay chếch ra 12° (theo ảnh mẫu của chủ repo 16/11: nách khép, cẳng tay/bàn tay hơi mở; hất 20° trở lên nhìn gãy ở khuỷu), vai hạ 6° (driver); vai đã thu hẹp 4 cm mỗi bên trong lưới
# → khe ~2 cm ở nách, ~1 cm ở khuỷu, ~4 cm ở cổ tay (trước: 4 → 10 cm với 78°).
ARM_DOWN = [('LeftArm', Y, 80), ('RightArm', Y, -80), ('LeftForeArm', Y, -12), ('RightForeArm', Y, 12)]   # vai hạ do driver vai_nam003 lo


def dong_ngoi_ghe(c, f, N):
    """Đứng → ngồi xuống ghế (mặt ghế cao 0,47 m) → giữ → đứng dậy. Tay buông rồi đặt lên đùi."""
    a = ss((f - 12) / 32.0) - ss((f - 60) / 32.0); sit = max(0.0, min(1.0, a))
    hips0 = c.head['Hips']; hips1 = Vector((0, 0.09, 0.665))
    hp = lerp3(tuple(hips0), tuple(hips1), sit); lean = 24 * math.sin(math.pi * min(1.0, sit * 1.0)) ** 1.0
    ank_y = lerp(0.05, -0.30, sit)
    arm_fwd = 28 * sit; elbow = 55 * sit
    P = {'fk': [('Spine', X, lean * 0.4), ('Spine1', X, lean * 0.35), ('Spine2', X, lean * 0.25), ('Head', X, -lean * 0.5),
                *ARM_DOWN, ('LeftArm', X, arm_fwd), ('RightArm', X, arm_fwd), ('LeftForeArm', X, -elbow), ('RightForeArm', X, -elbow)],
         'root': ((0, 0, 0), (0, 0, 0)), 'hips': tuple(hp),
         'ik_foot': {'L': (0.11, ank_y, 0.08), 'R': (-0.11, ank_y, 0.08)}, 'ngon': {'nam_tro': 0.3, 'nam_giua': 0.35, 'nam_ap': 0.4, 'nam_cai': 0.2}}
    return ap_dung(c, P)


def dong_nam_lan(c, f, N):
    """Nằm ngửa → lăn 360° sang một bên (ngửa → nghiêng → sấp → nghiêng → ngửa) → nằm ngửa."""
    th = 360.0 * ss((f - 20) / 76.0) if f >= 20 else 0.0
    th = min(360.0, th)
    arms = list(ARM_DOWN)
    P = {'fk': arms, 'root': ((-math.radians(th) * 0.16, -0.95, 0.0), (-90, th, 0)), 'ground': True,
         'ngon': {'nam_tro': 0.2, 'nam_giua': 0.25, 'nam_ap': 0.3, 'nam_cai': 0.2}}
    return ap_dung(c, P)


def dong_bo(c, f, N):
    """Bò bằng bốn chi (tay–gối), chéo: tay trái cùng gối phải. Thân nằm ngang, bụng hướng xuống."""
    S = 0.26; H = 0.07; gf = 0.6; phi0 = (f % N) / N; adv = -S * 2 * (f / N)
    def lim(k, off):
        phi = (phi0 + off) % 1.0; dy, dz, _ = phase_foot(phi, S, H, gf); return dy + adv, dz
    hy = 0.0
    ty = {}
    P = {'fk': [('Neck', X, -32), ('Head', X, -42), ('Spine2', X, -8)], 'root': ((0, adv, 0), (90, 0, 0)), 'hips': (0, hy + adv, 0.50), 'ground': True,
         'ik_hand': {}, 'ik_foot': {}, 'ngon': {'nam_tro': 0.0, 'nam_giua': 0.0, 'nam_ap': 0.0, 'nam_cai': 0.0}, 'poles': {}}
    # tay: dưới vai (vai ở y ≈ hips − 0,52)
    for k, sx, off in (('L', 1, 0.0), ('R', -1, 0.5)):
        dy, dz = lim(k, off); P['ik_hand'][k] = (sx * 0.21, hy - 0.62 + dy, 0.06 + dz)
    # chân: gối chạm sàn dưới hông, cẳng chân nằm sau (mắt cá ở y = hông + 0,38, z 0,10)
    fp = json.loads(os.environ.get('BO_CHAN', '[120,0,0,0.18]'))          # [pitch, yaw, roll, z mắt cá]: bàn chân chúi xuống, mũi chân chạm sàn (thử: duỗi thẳng hàng cẳng chân cho 116 cạnh giãn >2×)
    for k, sx, off in (('L', 1, 0.5), ('R', -1, 0.0)):
        dy, dz = lim(k, off); P['ik_foot'][k] = (sx * 0.11, hy + 0.38 + dy * 0.35, fp[3] + dz * 0.6, fp[0], fp[1], fp[2])
    return ap_dung(c, P)


def dong_truot(c, f, N):
    """Trườn sấp (kiểu bò lê): nằm sấp, tay và chân đối nhau kéo thân tiến lên."""
    S = 0.22; phi0 = (f % N) / N; adv = -S * 2 * (f / N)
    def pha(off):
        phi = (phi0 + off) % 1.0; ext = 0.5 - 0.5 * math.cos(2 * math.pi * phi); return ext
    P = {'fk': [('Neck', X, -22), ('Head', X, -28)], 'root': ((0, adv + 0.0, 0), (90, 0, 0)), 'ground': True, 'hips': (0, adv, 0.16),
         'ik_hand': {}, 'ik_foot': {}, 'poles': {}, 'ngon': {'nam_tro': 0.3, 'nam_giua': 0.3, 'nam_ap': 0.35, 'nam_cai': 0.2}}
    for k, sx, off in (('L', 1, 0.0), ('R', -1, 0.5)):
        e = pha(off); P['ik_hand'][k] = (sx * (0.30 - 0.10 * e), adv - 0.55 - 0.40 * e, 0.07)
        P['poles'][f'pole_elbow.{k}'] = (sx * 0.55, adv - 0.45 - 0.2 * e, 0.12)
    tp = json.loads(os.environ.get('TR_PAR', '[0.05,0.30,110,0.14,0.20]'))      # [dạng chân, kéo gối, pitch bàn chân, z mắt cá, x cực gối]
    for k, sx, off in (('L', 1, 0.5), ('R', -1, 0.0)):
        e = pha(off); P['ik_foot'][k] = (sx * (0.12 + tp[0] * e), adv + 0.80 - tp[1] * e, tp[3], tp[2], 0.0, 0.0)
        P['poles'][f'pole_knee.{k}'] = (sx * tp[4], adv + 0.45, 0.15)
    return ap_dung(c, P)


# ---------------------------------------------------------------- KHỚP TỪNG BỘ PHẬN (video trình diễn biên độ người thật)
KHOP_L = 30    # khung mỗi động tác (1,25 s ở 24 fps)


def _khop_doan():
    """[(nhãn, hàm(P, e, v, t))]: e = chuông 0→1→0, v = sin 2πt (qua lại hai phía), t = 0..1. Biên độ trong giới hạn người thật."""
    def dau_z(P, e, v, t): P['fk'] += [('Neck', Z, 28 * v), ('Head', Z, 28 * v)]
    def dau_x(P, e, v, t): w = v if v > 0 else 0.7 * v; P['fk'] += [('Neck', X, 14 * w), ('Head', X, 18 * w)]
    def dau_y(P, e, v, t): P['fk'] += [('Neck', Y, 10 * v), ('Head', Y, 14 * v)]
    def vai_ben(P, e, v, t):   # giơ tay sang bên tới trên đầu
        P['fk'] = [(b, a, d) for b, a, d in P['fk'] if b not in ('LeftArm', 'RightArm', 'LeftForeArm', 'RightForeArm')]
        ang = 80 - 175 * e; P['fk'] += [('LeftArm', Y, ang), ('RightArm', Y, -ang), ('LeftShoulder', Y, -14 * e), ('RightShoulder', Y, 14 * e)]
    def vai_truoc(P, e, v, t):   # đưa tay ra trước tới ngang vai rồi hơn
        P['fk'] = [(b, a, d) for b, a, d in P['fk'] if b not in ('LeftForeArm', 'RightForeArm')]
        P['fk'] += [('LeftArm', X, -120 * e), ('RightArm', X, -120 * e)]
    def khuyu(P, e, v, t):   # gập khuỷu về trước
        P['fk'] = [(b, a, d) for b, a, d in P['fk'] if b not in ('LeftForeArm', 'RightForeArm')]
        P['fk'] += [('LeftArm', X, -30 * e), ('RightArm', X, -30 * e), ('LeftForeArm', X, -135 * e), ('RightForeArm', X, -135 * e)]
    def co_tay(P, e, v, t):   # tay gập khuỷu 90°, cổ tay gập–duỗi rồi nghiêng
        P['fk'] += [('LeftArm', X, -45), ('RightArm', X, -45), ('LeftForeArm', X, -90), ('RightForeArm', X, -90)]
        w = v if t < 0.5 else 0
        P['fk'] += [('LeftHand', X, 55 * math.sin(4 * math.pi * t) if t < 0.5 else 0), ('RightHand', X, 55 * math.sin(4 * math.pi * t) if t < 0.5 else 0),
                    ('LeftHand', Z, 0 if t < 0.5 else 25 * math.sin(4 * math.pi * (t - 0.5))), ('RightHand', Z, 0 if t < 0.5 else -25 * math.sin(4 * math.pi * (t - 0.5)))]
    def ngon(P, e, v, t):   # nắm tay rồi xòe
        P['fk'] += [('LeftArm', X, -35), ('RightArm', X, -35), ('LeftForeArm', X, -80), ('RightForeArm', X, -80)]
        P['ngon'] = {'nam': 0.0, 'nam_tro': 0.9 * e, 'nam_giua': 0.95 * e, 'nam_ap': 0.95 * e, 'nam_cai': 0.8 * e}
    def cot_x(P, e, v, t): w = v if v > 0 else 0.5 * v; P['fk'] += [('Spine', X, 14 * w), ('Spine1', X, 12 * w), ('Spine2', X, 10 * w)]
    def cot_z(P, e, v, t): P['fk'] += [('Spine', Z, 14 * v), ('Spine1', Z, 14 * v), ('Spine2', Z, 14 * v), ('Head', Z, -10 * v)]
    def cot_y(P, e, v, t): P['fk'] += [('Spine', Y, 8 * v), ('Spine1', Y, 8 * v), ('Spine2', Y, 6 * v)]
    def hang_nhac(P, e, v, t): P['ik_foot']['L'] = (0.11, 0.05 - 0.30 * e, 0.08 + 0.45 * e)
    def hang_dang(P, e, v, t): P['ik_foot']['L'] = (0.11 + 0.38 * e, 0.05, 0.08 + 0.14 * e); P['ik_foot']['R'] = (-0.11, 0.05, 0.08)
    def goi(P, e, v, t): P['ik_foot']['L'] = (0.11, 0.05 + 0.28 * e, 0.08 + 0.36 * e, -45 * e)
    def co_chan(P, e, v, t):
        w = v if v > 0 else 0.6 * v; z = 0.005 * w if w > 0 else -0.115 * w   # kiễng gót: mũi chạm sàn; gập mu: nâng cổ chân để gót không lún (đo bằng bisect)
        for k, sx in (('L', 1), ('R', -1)): P['ik_foot'][k] = (sx * 0.11, 0.05, 0.08 + z, -38 * w)
    def ngoi_xo(P, e, v, t):
        P['hips'] = (0, 0.02 + 0.10 * e, 0.96 - 0.38 * e); P['fk'] += [('Spine', X, 22 * e), ('Spine1', X, 8 * e)]
        P['ik_foot']['L'] = (0.14, 0.04 - 0.02 * e, 0.08); P['ik_foot']['R'] = (-0.14, 0.04 - 0.02 * e, 0.08)
    return [('Cổ: quay trái–phải', dau_z), ('Cổ: gật–ngửa', dau_x), ('Cổ: nghiêng đầu', dau_y), ('Vai: giơ tay sang bên', vai_ben), ('Vai: đưa tay ra trước', vai_truoc),
            ('Khuỷu: gập–duỗi', khuyu), ('Cổ tay: gập–duỗi, nghiêng', co_tay), ('Ngón tay: nắm–xòe', ngon), ('Cột sống: cúi–ngửa', cot_x), ('Cột sống: xoay thân', cot_z),
            ('Cột sống: nghiêng người', cot_y), ('Háng: nhấc đùi trước', hang_nhac), ('Háng: dạng chân', hang_dang), ('Gối: gập (gót về mông)', goi), ('Cổ chân: kiễng gót–gập mu', co_chan),
            ('Háng + gối + cổ chân: ngồi xổm', ngoi_xo)]


def dong_khop(c, f, n):
    seg = _khop_doan(); L = KHOP_L; k = min(f // L, len(seg) - 1); t = (f - k * L) / L; t = min(max(t, 0.0), 1.0)
    e = 0.5 - 0.5 * math.cos(2 * math.pi * t); v = math.sin(2 * math.pi * t)
    P = {'fk': list(ARM_DOWN) + [('LeftShoulder', Y, 0.0)], 'root': ((0, 0, 0), (0, 0, 0)), 'ik_foot': {'L': (0.11, 0.05, 0.08), 'R': (-0.11, 0.05, 0.08)},
         'ngon': {'nam_tro': 0.12, 'nam_giua': 0.15, 'nam_ap': 0.18, 'nam_cai': 0.1}}
    seg[k][1](P, e, v, t); return ap_dung(c, P)


KHOP_NHAN = lambda: [x[0] for x in _khop_doan()]


DONG = {'khop': (dong_khop, KHOP_L * 16), 'ngoi_ghe': (dong_ngoi_ghe, 96), 'nam_lan': (dong_nam_lan, 120), 'bo': (dong_bo, 32), 'truot': (dong_truot, 32),'di_bo': (lambda c, f, n: dong_di(c, f, n, False), 32), 'chay_bo': (lambda c, f, n: dong_di(c, f, n, True), 24)}


# ---------------------------------------------------------------- RENDER
def dung_canh(c, ghe=False):
    sc = c.sc; sc.render.engine = 'CYCLES'; sc.cycles.samples = 6; sc.cycles.use_denoising = False
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (.80, .82, .85, 1)
    for e, rot in ((3.2, (0.9, 0.2, 0.6)), (1.6, (1.2, -0.3, -0.9))):
        L = bpy.data.lights.new('s', 'SUN'); L.energy = e; lo = bpy.data.objects.new('s', L); lo.rotation_euler = rot; sc.collection.objects.link(lo)
    bpy.ops.mesh.primitive_cube_add(size=2, location=(0, -10, -0.05)); fl = bpy.context.object; fl.name = 'San'; fl.scale = (30, 30, 0.05)      # tấm sàn dày: thấy rõ mặt sàn ở góc nhìn ngang
    mt = bpy.data.materials.new('san'); mt.use_nodes = True; mt.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (.28, .31, .35, 1); fl.data.materials.append(mt)
    c.arm.hide_render = True; c.body.hide_viewport = False; c.body.hide_render = False
    mb = bpy.data.materials.new('da'); mb.use_nodes = True; mb.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (.78, .55, .42, 1); c.body.data.materials.clear(); c.body.data.materials.append(mb)


def dung_ghe(c):
    """Ghế đơn giản: mặt ghế cao 0,47 m (rộng 0,44, sâu 0,44, tâm y −0,10) và lưng ghế phía sau."""
    mt = bpy.data.materials.new('ghe'); mt.use_nodes = True; mt.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (.35, .22, .12, 1)
    for loc, sc_ in (((0, -0.10, 0.45), (0.22, 0.22, 0.02)), ((0, 0.14, 0.72), (0.22, 0.02, 0.27)), ((0.19, -0.27, 0.22), (0.02, 0.02, 0.22)), ((-0.19, -0.27, 0.22), (0.02, 0.02, 0.22)), ((0.19, 0.10, 0.22), (0.02, 0.02, 0.22)), ((-0.19, 0.10, 0.22), (0.02, 0.02, 0.22))):
        bpy.ops.mesh.primitive_cube_add(size=2, location=loc); o = bpy.context.object; o.scale = sc_; o.data.materials.append(mt); o.name = 'Ghe'


def do_luoi(c, n):
    """Mỗi khung: cạnh giãn >2×, cạnh co <0,4×, giãn max, điểm thấp nhất lưới (xuyên sàn nếu < −2 cm), gối lệch ngang/ra sau. Tính ĐỦ Corrective Smooth như lúc render."""
    c.body.hide_viewport = False
    for m_ in c.body.modifiers:
        if m_.type == 'CORRECTIVE_SMOOTH': m_.show_viewport = True       # đo ĐÚNG như lúc render: bật Corrective Smooth (vai/háng/cổ)
    c.sc.frame_set(1); c.upd(); me = c.body.data
    ea = np.zeros(len(me.edges) * 2, int); me.edges.foreach_get('vertices', ea); ea = ea.reshape(-1, 2)
    co = np.array([v.co[:] for v in me.vertices]); l0 = np.linalg.norm(co[ea[:, 0]] - co[ea[:, 1]], axis=1); ok = l0 > 0.003
    res = {'g2': 0, 'c04': 0, 'gmax': 0.0, 'zmin': 9.0, 'knee_ngang': 0.0, 'knee_sau': -9.0}
    for f in range(1, n + 1):
        c.sc.frame_set(f); c.upd()
        e = c.body.evaluated_get(bpy.context.evaluated_depsgraph_get()); m = e.to_mesh(); a = np.zeros(len(m.vertices) * 3); m.vertices.foreach_get('co', a); e.to_mesh_clear(); a = a.reshape(-1, 3)
        r = np.linalg.norm(a[ea[:, 0]] - a[ea[:, 1]], axis=1) / np.maximum(l0, 1e-6)
        res['g2'] = max(res['g2'], int(((r > 2) & ok).sum())); res['c04'] = max(res['c04'], int(((r < 0.4) & ok).sum())); res['gmax'] = max(res['gmax'], float(r[ok].max())); res['zmin'] = min(res['zmin'], float(a[:, 2].min()))
    c.body.hide_viewport = True; c.upd(); return res


def vi_tri_gian(c, n, nguong=2.0):
    """Khung có nhiều cạnh giãn >2× nhất; in các cạnh đó nằm ở đâu trên lưới nghỉ (z, |x|) để biết bộ phận nào."""
    c.body.hide_viewport = False
    for m_ in c.body.modifiers:
        if m_.type == 'CORRECTIVE_SMOOTH': m_.show_viewport = True
    c.sc.frame_set(1); c.upd(); me = c.body.data
    ea = np.zeros(len(me.edges) * 2, int); me.edges.foreach_get('vertices', ea); ea = ea.reshape(-1, 2)
    co = np.array([v.co[:] for v in me.vertices]); l0 = np.linalg.norm(co[ea[:, 0]] - co[ea[:, 1]], axis=1); ok = l0 > 0.003; best = (0, 1, None)
    for f in range(1, n + 1):
        c.sc.frame_set(f); c.upd(); e = c.body.evaluated_get(bpy.context.evaluated_depsgraph_get()); m = e.to_mesh(); a = np.zeros(len(m.vertices) * 3); m.vertices.foreach_get('co', a); e.to_mesh_clear(); a = a.reshape(-1, 3)
        r = np.linalg.norm(a[ea[:, 0]] - a[ea[:, 1]], axis=1) / np.maximum(l0, 1e-6); bad = (r > nguong) & ok
        if bad.sum() > best[0]: best = (int(bad.sum()), f, bad.copy())
    nb, f, bad = best; mid = (co[ea[bad][:, 0]] + co[ea[bad][:, 1]]) / 2 if nb else np.zeros((0, 3))
    vung = {'đầu/cổ (z>1,5, |x|<0,15)': ((mid[:, 2] > 1.5) & (np.abs(mid[:, 0]) < 0.15)), 'vai/nách (z 1,3–1,5, |x|>0,1)': ((mid[:, 2] > 1.3) & (mid[:, 2] <= 1.5) & (np.abs(mid[:, 0]) > 0.1)),
            'tay (|x|>0,35)': (np.abs(mid[:, 0]) > 0.35), 'thân ngực-bụng (z 1,0–1,3)': ((mid[:, 2] > 1.0) & (mid[:, 2] <= 1.3) & (np.abs(mid[:, 0]) <= 0.35)),
            'hông/bẹn/mông (z 0,75–1,0)': ((mid[:, 2] > 0.75) & (mid[:, 2] <= 1.0) & (np.abs(mid[:, 0]) <= 0.35)), 'đùi–gối (z 0,35–0,75)': ((mid[:, 2] > 0.35) & (mid[:, 2] <= 0.75) & (np.abs(mid[:, 0]) <= 0.35)),
            'cẳng–bàn chân (z<0,35)': ((mid[:, 2] <= 0.35) & (np.abs(mid[:, 0]) <= 0.35))}
    chua = np.ones(len(mid), bool)
    for v in vung.values(): chua &= ~v
    ex = ''
    if chua.any(): ex = f'; KHÁC (chưa phân loại): {int(chua.sum())} (z {mid[chua][:, 2].min():.2f}–{mid[chua][:, 2].max():.2f}, |x| {np.abs(mid[chua][:, 0]).min():.2f}–{np.abs(mid[chua][:, 0]).max():.2f})'
    print(f'  khung {f}: {nb} cạnh giãn >{nguong}× → ' + '; '.join(f'{k}: {int(v.sum())}' for k, v in vung.items() if v.sum()) + ex)
    c.body.hide_viewport = True; c.upd()


def render_dong(c, n, out, views=('truoc', 'ben'), res=(360, 480), ortho=2.4, cz=0.95, dong_tam=None, khung=None):
    dung_canh(c); sc = c.sc; sc.render.resolution_x, sc.render.resolution_y = res
    cd = bpy.data.cameras.new('c'); cd.type = 'ORTHO'; cd.ortho_scale = ortho; cam = bpy.data.objects.new('c', cd); sc.collection.objects.link(cam); sc.camera = cam
    os.makedirs(out, exist_ok=True); off = {'truoc': Vector((0, -6, 0)), 'ben': Vector((6, 0, 0)), '3_4': Vector((4.2, -4.2, 0)), 'tren': Vector((0, 0, 7))}
    for f in (khung or range(1, n + 1)):
        sc.frame_set(f); bpy.context.view_layer.update(); hp = c.world_head('Hips'); tgt = Vector((hp.x, hp.y, cz)) if dong_tam is None else Vector(dong_tam(hp))
        for v in views:
            cam.location = tgt + off[v]
            cam.rotation_euler = (tgt - cam.location).to_track_quat('-Z', 'Y' if v != 'tren' else 'Y').to_euler()
            sc.render.filepath = os.path.join(out, f'{v}_{f:03d}.png'); bpy.ops.render.render(write_still=True)


# ---------------------------------------------------------------- ĐO
def do_khung(c):
    """Gối lệch ngang (cm), gối gập ngược (cm: dương = gối nằm SAU đường hông–mắt cá khi chân duỗi), điểm thấp nhất lưới (m)."""
    out = {}
    for S in ('Left', 'Right'):
        h = c.world_head(f'{S}UpLeg'); k = c.world_head(f'{S}Leg'); a = c.world_head(f'{S}Foot'); t = (k.z - h.z) / (a.z - h.z) if abs(a.z - h.z) > 1e-3 else 0.5
        line = h + t * (a - h); out[S] = ((k.x - line.x) * 100 * (1 if S == 'Left' else -1), (k.y - line.y) * 100)
    return out


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--rig', required=True); ap.add_argument('--dong', required=True, choices=list(DONG)); ap.add_argument('--ra'); ap.add_argument('--do', action='store_true'); ap.add_argument('--chu-ky', type=int, default=1); ap.add_argument('--anh'); ap.add_argument('--goc', default='truoc,ben'); ap.add_argument('--khung', default=''); ap.add_argument('--luoi', action='store_true'); ap.add_argument('--vitri', action='store_true'); ap.add_argument('--ghe', action='store_true'); ap.add_argument('--res', default='360,480'); ap.add_argument('--co', type=float, default=2.4); ap.add_argument('--cz', type=float, default=0.95)
    a = ap.parse_args(argv); c = Ctx(a.rig); fn, n = DONG[a.dong]
    act = bpy.data.actions.new(a.dong); c.arm.animation_data_create(); c.arm.animation_data.action = act; c.sc.frame_start, c.sc.frame_end = 1, n * a.chu_ky; c.sc.render.fps = FPS
    for f in range(n * a.chu_ky + 1):
        fn(c, f, n); c.keyframe(f + 1)
    if a.do:
        print(f'{a.dong}: đo gối từng khung (cm; "lệch ngang" dương = ra ngoài; "lệch y" âm = gối ra TRƯỚC đường hông–mắt cá, dương = ra sau)')
        worst = [0.0, 0.0]
        for f in range(1, n + 1):
            c.sc.frame_set(f); c.upd(); d = do_khung(c)
            for S, (lx, ly) in d.items(): worst[0] = max(worst[0], abs(lx)); worst[1] = max(worst[1], ly)
        print(f'  gối lệch ngang tối đa {worst[0]:.1f} cm; gối ra SAU đường hông–mắt cá tối đa {worst[1]:.1f} cm')
    if a.luoi:
        r = do_luoi(c, n * a.chu_ky); print(f'{a.dong}: cạnh giãn >2× nhiều nhất mỗi khung {r["g2"]}; giãn max {r["gmax"]:.2f}×; cạnh co <0,4× nhiều nhất {r["c04"]}; điểm thấp nhất lưới {r["zmin"]*100:.1f} cm (sàn z=0)')
    if a.vitri: vi_tri_gian(c, n * a.chu_ky)
    if a.ghe: dung_ghe(c)
    if a.anh: render_dong(c, n * a.chu_ky, a.anh, views=tuple(a.goc.split(',')), ortho=a.co, cz=a.cz, res=tuple(int(x) for x in a.res.split(',')), khung=[int(x) for x in a.khung.split(',')] if a.khung else None)
    if a.ra: bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.ra), compress=True)


if __name__ == '__main__':
    main()
