"""NHÂN VẬT MẪU NAM 3D — dựng bằng Blender (bpy 5.x), Hồ sơ 02 (12/11/2026).

Thay hướng three.js ghép khối thủ tục (`../thiet-ke/thu-3d/`). Đồng bộ với bộ phòng Blender `../boi-canh-3d/` (1 BU = 1 m, Z lên).

Chạy:
  python dung_nam.py --blend Base_Character_Nam.blend               # dựng + lưu file mẫu
  python dung_nam.py --turnaround <thư mục>  [--samples 48]          # 6 góc: truoc, 34_phai, nghieng_phai, sau, nghieng_trai, 34_trai
  python dung_nam.py --kiem-tra <thư mục>                            # ảnh kiểm tra rig: IK chân, chớp mắt, há/mím miệng, liếc, nhíu mày
Trong Blender: blender -b -P dung_nam.py -- --blend ...

Kiến trúc mẫu (để nhân bản Minh, Mẹ, Bạn...): collection `Nam` gồm
  01_Rig       Nam_Rig: xương thân–đầu–tay–chân, IK chân (foot_ik.L/R + knee_pole.L/R), xương root
  02_Body_Base Nam_Than: MỘT lưới liền khối đầu–cổ–thân–tay–bàn tay–chân–bàn chân (metaball → mesh, không cầu/trụ rời)
  03_Face      Nam_Mat: mắt, mí, con ngươi, mày, nốt ruồi, miệng (răng trên + lưỡi). Shape keys: chop_mat, liec_trai, liec_phai, ha_mieng, mim_mieng, nhiu_may
  04_Hair      Nam_Toc: tóc đất sét (cụm lọn metaball liền khối, chỏm xoắn)
  05_Outfit    Nam_Ao, Nam_CoAo, Nam_Quan, Nam_Dep
  06_Props     (trống — đạo cụ cầm nắm sau)
Nhân vật mới: giữ 01–03, đổi `SPEC` (màu, tỉ lệ), dựng lại 04–05.

Nhân vật quay mặt về −Y; bên TRÁI của nhân vật là +X (đuôi .L). Đơn vị mét, cao 1,65 m tính cả chỏm tóc.
"""
import sys, os, math, argparse
import bpy, bmesh
import numpy as np
from mathutils import Vector, Matrix, Quaternion
from mathutils.bvhtree import BVHTree

SPEC = {
    'mau': {  # màu
        'da': '#df9668', 'da_sau': '#b97a55', 'toc': '#2a2928', 'ao': '#63605e', 'co_ao': '#595654', 'quan': '#3d3c3b',
        'dep': '#2d4a3b', 'de_dep': '#22302a', 'muc': '#1c1a19', 'long_trang': '#f3efe7', 'trong_mieng': '#5e2724', 'luoi': '#c2675f', 'rang': '#f4efe6',
    },
    'vat_lieu': {'da_rough': 0.88, 'da_sss': 0.08, 'toc_rough': 0.92, 'vai_rough': 0.92, 'vai_sheen': 0.40},
    'luoi': {'than': 0.0065, 'ao': 0.009, 'toc': 0.008},   # độ phân giải metaball (m)
}

# Tỉ lệ chibi (áp SAU khi dựng khối gốc, bằng biến đổi theo trọng số xương để lưới vẫn liền mạch)
ANKLE_Z, HIP_Z = 0.088, 0.585
LEG_K, ARM_K = 0.85, 0.85            # chân (đùi+cẳng) và cẳng tay ngắn lại 15%
HEAD_K, HAND_K, FOOT_K = 1.35, 1.25, 1.25   # đầu–tóc–mặt 1,35×; bàn tay và bàn chân 1,25×
DROP = (HIP_Z - ANKLE_Z) * (1 - LEG_K)
HEIGHT = 1.65                          # chiều cao cuối (m), tính cả chỏm tóc: rig được co đều về số này

R_MB = lambda s, t=0.6: math.sqrt(1.0 - (t / s) ** (1.0 / 3.0))   # bán kính mặt / bán kính phần tử metaball (đo được: s=2 → 0,575)


def hexc(h, a=1.0):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4) for x in c) + (a,)


# ------------------------------------------------------------------ collection
def coll(name, parent):
    c = bpy.data.collections.new(name); parent.children.link(c); return c


def link(ob, c):
    for u in list(ob.users_collection): u.objects.unlink(ob)
    c.objects.link(ob)


# ------------------------------------------------------------------ metaball
class MB:
    """Một họ metaball (tên không có dấu chấm để không hoà với họ khác)."""
    def __init__(self, name, res, c):
        self.d = bpy.data.metaballs.new(name); self.d.resolution = res; self.d.render_resolution = res; self.d.threshold = 0.6
        self.ob = bpy.data.objects.new(name, self.d); c.objects.link(self.ob)

    def ball(self, p, r, s=2.0, neg=False):
        e = self.d.elements.new(type='BALL'); e.co = p; e.radius = r / R_MB(s); e.stiffness = s; e.use_negative = neg; return e

    def ell(self, p, ax, s=2.0, rot=(0, 0, 0), neg=False):
        e = self.d.elements.new(type='ELLIPSOID'); e.co = p; e.radius = 1.0 / R_MB(s); e.stiffness = s; e.use_negative = neg
        e.size_x, e.size_y, e.size_z = ax; e.rotation = Matrix.Rotation(rot[2], 3, 'Z').to_quaternion() @ Matrix.Rotation(rot[1], 3, 'Y').to_quaternion() @ Matrix.Rotation(rot[0], 3, 'X').to_quaternion(); return e

    def basis(self, p, ax, x, y, z, s=2.0, neg=False):
        """Ellipsoid theo hệ trục (x, y, z) tuỳ ý: ax = nửa kích thước theo từng trục (mảng dẹt: z là bề dày)."""
        e = self.d.elements.new(type='ELLIPSOID'); e.co = p; e.radius = 1.0 / R_MB(s); e.stiffness = s; e.use_negative = neg
        e.size_x, e.size_y, e.size_z = ax; e.rotation = Matrix((x, y, z)).transposed().to_quaternion(); return e

    def cap(self, p0, p1, r, s=2.0, neg=False):
        p0, p1 = Vector(p0), Vector(p1); d = p1 - p0
        e = self.d.elements.new(type='CAPSULE'); e.co = (p0 + p1) / 2; e.radius = r / R_MB(s); e.stiffness = s; e.use_negative = neg
        e.size_x = d.length / 2; e.rotation = Vector((1, 0, 0)).rotation_difference(d.normalized()); return e

    def chain(self, pts, rs, s=2.0):
        for a, b, ra, rb in zip(pts, pts[1:], rs, rs[1:]):
            n = max(2, int((Vector(b) - Vector(a)).length / (min(ra, rb) * 0.45)))
            for i in range(n):
                t = i / n; self.ball(Vector(a).lerp(Vector(b), t), ra + (rb - ra) * t, s)
        self.ball(pts[-1], rs[-1], s)

    def to_mesh(self, name, c, mat=None):
        dg = bpy.context.evaluated_depsgraph_get()
        me = bpy.data.meshes.new_from_object(self.ob.evaluated_get(dg)); me.name = name
        bpy.data.objects.remove(self.ob); bpy.data.metaballs.remove(self.d)
        ob = bpy.data.objects.new(name, me); c.objects.link(ob)
        me.shade_smooth()
        if mat: me.materials.append(mat)
        return ob


def subsurf(ob, v=1, r=2):
    m = ob.modifiers.new('Subdivision', 'SUBSURF'); m.levels = v; m.render_levels = r; return m


# ------------------------------------------------------------------ vật liệu (Principled BSDF mờ lì)
def mat_basic(name, col, rough, sss=0.0, sheen=0.0, bump=0.0, emit=0.0, sss_col=None):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = hexc(col); b.inputs['Roughness'].default_value = rough
    b.inputs['Specular IOR Level'].default_value = 0.35
    if sss:
        b.inputs['Subsurface Weight'].default_value = sss; b.inputs['Subsurface Radius'].default_value = (0.9, 0.35, 0.2); b.inputs['Subsurface Scale'].default_value = 0.01
    if sheen:
        b.inputs['Sheen Weight'].default_value = sheen; b.inputs['Sheen Roughness'].default_value = 0.6
    if bump:  # thớ vải cotton: noise mịn → bump nhẹ
        tc = nt.nodes.new('ShaderNodeTexCoord'); n = nt.nodes.new('ShaderNodeTexNoise'); n.inputs['Scale'].default_value = 900.0; n.inputs['Detail'].default_value = 4.0
        n2 = nt.nodes.new('ShaderNodeTexNoise'); n2.inputs['Scale'].default_value = 140.0; n2.inputs['Detail'].default_value = 2.0
        mix = nt.nodes.new('ShaderNodeMath'); mix.operation = 'ADD'
        bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = bump; bp.inputs['Distance'].default_value = 0.0006
        nt.links.new(tc.outputs['Object'], n.inputs['Vector']); nt.links.new(tc.outputs['Object'], n2.inputs['Vector'])
        nt.links.new(n.outputs['Fac'], mix.inputs[0]); nt.links.new(n2.outputs['Fac'], mix.inputs[1])
        nt.links.new(mix.outputs[0], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    if emit:
        b.inputs['Emission Color'].default_value = hexc(col); b.inputs['Emission Strength'].default_value = emit
    return m


def make_mats():
    c, v = SPEC['mau'], SPEC['vat_lieu']
    return {
        'da': mat_basic('Nam_Da', c['da'], v['da_rough'], sss=v['da_sss']),
        'da_sau': mat_basic('Nam_DaSau', c['da_sau'], 0.9),
        'toc': mat_basic('Nam_Toc', c['toc'], v['toc_rough']),
        'ao': mat_basic('Nam_Ao', c['ao'], v['vai_rough'], sheen=v['vai_sheen'], bump=0.12),
        'co_ao': mat_basic('Nam_CoAo', c['co_ao'], v['vai_rough'], sheen=v['vai_sheen'], bump=0.12),
        'quan': mat_basic('Nam_Quan', c['quan'], v['vai_rough'], sheen=v['vai_sheen'], bump=0.12),
        'dep': mat_basic('Nam_Dep', c['dep'], 0.8), 'de_dep': mat_basic('Nam_DeDep', c['de_dep'], 0.85),
        'muc': mat_basic('Nam_Muc', c['muc'], 0.6), 'trang': mat_basic('Nam_LongTrang', c['long_trang'], 0.35),
        'mieng': mat_basic('Nam_TrongMieng', c['trong_mieng'], 0.7), 'luoi': mat_basic('Nam_Luoi', c['luoi'], 0.55), 'rang': mat_basic('Nam_Rang', c['rang'], 0.3),
        'sang': mat_basic('Nam_ChamSang', '#ffffff', 0.2, emit=0.6),
    }


# ------------------------------------------------------------------ khung xương (01_Rig)
BONES = {  # tên: (đầu, đuôi, cha, deform)
    'root': ((0, 0, 0), (0, 0.25, 0), None, False),
    'hips': ((0, 0, 0.60), (0, 0, 0.70), 'root', True),
    'spine': ((0, 0, 0.70), (0, 0, 0.86), 'hips', True),
    'chest': ((0, 0, 0.86), (0, 0.005, 1.00), 'spine', True),
    'neck': ((0, 0.005, 1.00), (0, -0.012, 1.085), 'chest', True),
    'head': ((0, -0.012, 1.085), (0, -0.012, 1.50), 'neck', True),
}
for s, k in ((1, 'L'), (-1, 'R')):
    BONES.update({
        f'shoulder.{k}': ((s * 0.035, 0, 0.985), (s * 0.165, 0.004, 0.975), 'chest', True),
        f'upper_arm.{k}': ((s * 0.175, 0.004, 0.965), (s * 0.212, 0.012, 0.79), f'shoulder.{k}', True),
        f'forearm.{k}': ((s * 0.212, 0.012, 0.79), (s * 0.222, -0.004, 0.635), f'upper_arm.{k}', True),
        f'hand.{k}': ((s * 0.222, -0.004, 0.635), (s * 0.226, -0.012, 0.548), f'forearm.{k}', True),
        f'thigh.{k}': ((s * 0.088, 0, 0.585), (s * 0.088, -0.012, 0.335), 'hips', True),
        f'shin.{k}': ((s * 0.088, -0.012, 0.335), (s * 0.088, 0.008, 0.088), f'thigh.{k}', True),
        f'foot.{k}': ((s * 0.088, 0.008, 0.088), (s * 0.092, -0.105, 0.032), f'shin.{k}', True),
        f'toe.{k}': ((s * 0.092, -0.105, 0.032), (s * 0.094, -0.16, 0.030), f'foot.{k}', True),
        f'foot_ik.{k}': ((s * 0.088, 0.008, 0.088), (s * 0.092, -0.105, 0.032), 'root', False),
        f'knee_pole.{k}': ((s * 0.088, -0.45, 0.335), (s * 0.088, -0.50, 0.335), 'root', False),
    })


def fz_arr(z):
    z = np.asarray(z, float)
    return np.where(z <= ANKLE_Z, z, np.where(z <= HIP_Z, ANKLE_Z + (z - ANKLE_Z) * LEG_K, z - DROP))


def fz(z): return float(fz_arr(z))


def bones_a():
    return {n: ((h[0], h[1], fz(h[2])), (t[0], t[1], fz(t[2])), p, d) for n, (h, t, p, d) in BONES.items()}


def head_pivot(): return np.array([0.0, -0.012, fz(1.085)])


def make_xforms(BA):
    """Biến đổi theo xương trên toạ độ đã co chân: cẳng tay ngắn 15% (neo ở khuỷu), bàn tay 1,25× (neo ở cổ tay),
    đầu 1,35× (neo ở cằm/cổ), bàn chân 1,25× theo x–y (neo ở cổ chân để không đổi chiều cao)."""
    X = {}; P = head_pivot()
    for k, sg in (('L', 1), ('R', -1)):
        e = np.array(BA[f'forearm.{k}'][0]); w = np.array(BA[f'hand.{k}'][0]); wn = e + (w - e) * np.array([1, 1, ARM_K])
        X[f'forearm.{k}'] = lambda p, e=e: e + (np.asarray(p) - e) * np.array([1, 1, ARM_K])
        X[f'hand.{k}'] = lambda p, w=w, wn=wn: wn + (np.asarray(p) - w) * HAND_K
        c = np.array([sg * ANKLE_X, 0.008, 0.0])
        f = lambda p, c=c: c + (np.asarray(p) - c) * np.array([FOOT_K, FOOT_K, 1.0])
        X[f'foot.{k}'] = X[f'toe.{k}'] = X[f'foot_ik.{k}'] = f
    X['head'] = lambda p: P + (np.asarray(p) - P) * HEAD_K
    return X


ANKLE_X = 0.088


def bones_final(BA, X):
    out = {}
    for n, (h, t, p, d) in BA.items():
        if n in X: h = tuple(float(v) for v in X[n](np.array(h))); t = tuple(float(v) for v in X[n](np.array(t)))
        out[n] = (h, t, p, d)
    return out


def build_rig(c, bones=None):
    bones = bones or BONES
    arm = bpy.data.armatures.new('Nam_Rig'); ob = bpy.data.objects.new('Nam_Rig', arm); c.objects.link(ob)
    arm.display_type = 'STICK'; ob.show_in_front = True
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.mode_set(mode='EDIT')
    for n, (h, t, p, d) in bones.items():
        b = arm.edit_bones.new(n); b.head = h; b.tail = t; b.use_deform = d
    for n, (h, t, p, d) in bones.items():
        if p:
            b = arm.edit_bones[n]; b.parent = arm.edit_bones[p]
            b.use_connect = (Vector(arm.edit_bones[p].tail) - Vector(h)).length < 1e-6 and n.split('.')[0] in ('forearm', 'hand', 'shin', 'foot', 'toe', 'spine', 'chest', 'neck', 'head')
    bpy.ops.object.mode_set(mode='OBJECT')
    for k in ('L', 'R'):  # IK chân: đùi + cẳng chân theo foot_ik, gối hướng về knee_pole; bàn chân xoay theo foot_ik
        ik = ob.pose.bones[f'shin.{k}'].constraints.new('IK'); ik.target = ob; ik.subtarget = f'foot_ik.{k}'
        ik.pole_target = ob; ik.pole_subtarget = f'knee_pole.{k}'; ik.pole_angle = math.radians(-90); ik.chain_count = 2
        cr = ob.pose.bones[f'foot.{k}'].constraints.new('COPY_ROTATION'); cr.target = ob; cr.subtarget = f'foot_ik.{k}'
    return ob


def compute_weights(ob, BA, extra=None, exclude=()):
    """Trọng số theo khoảng cách tới đoạn xương (3 xương gần nhất, luỹ thừa 4), tính trên toạ độ đã co chân.
    `exclude`: tên xương bị loại hẳn (trọng số 0), ví dụ áo không theo đùi."""
    me = ob.data; co = np.empty(len(me.vertices) * 3); me.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
    mw = np.array(ob.matrix_world); co = co @ mw[:3, :3].T + mw[:3, 3]; co[:, 2] = fz_arr(co[:, 2])
    names = [n for n, b in BA.items() if b[3]]
    D = np.zeros((len(co), len(names)))
    for j, n in enumerate(names):
        h, t = np.array(BA[n][0]), np.array(BA[n][1]); d = t - h; L2 = (d @ d)
        u = np.clip(((co - h) @ d) / L2, 0, 1); D[:, j] = np.linalg.norm(co - (h + u[:, None] * d), axis=1)
    for n in exclude: D[:, names.index(n)] = 9.0
    if extra: extra(co, D, names)
    W = 1.0 / np.maximum(D, 0.004) ** 4
    keep = np.argsort(D, axis=1)[:, :3]; M3 = np.zeros_like(W); np.put_along_axis(M3, keep, 1, axis=1); W *= M3
    W /= W.sum(axis=1, keepdims=True)
    return co, W, names


def reshape_by_weights(ob, co, W, names, X):
    new = np.zeros_like(co)
    for j, n in enumerate(names): new += W[:, [j]] * (X[n](co) if n in X else co)
    ob.data.vertices.foreach_set('co', new.ravel()); ob.data.update()


def skin_groups(ob, rig, W, names):
    for j, n in enumerate(names):
        idx = np.nonzero(W[:, j] > 0.01)[0]
        if len(idx) == 0: continue
        g = ob.vertex_groups.new(name=n)
        for i in idx: g.add([int(i)], float(W[i, j]), 'REPLACE')
    m = ob.modifiers.new('Armature', 'ARMATURE'); m.object = rig
    ob.modifiers.move(len(ob.modifiers) - 1, 0)


def head_only(co, D, names):
    """Đầu (trên cằm) chỉ theo xương đầu; tay không ăn vào thân và ngược lại."""
    hj = names.index('head'); above = co[:, 2] > fz(1.075)
    D[above, :] = 9; D[above, hj] = 0.001


def reshape_sandal(ob, k, X):
    me = ob.data; co = np.empty(len(me.vertices) * 3); me.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
    mw = np.array(ob.matrix_world); co = co @ mw[:3, :3].T + mw[:3, 3]; co[:, 2] = fz_arr(co[:, 2]); co = X[f'foot.{k}'](co)
    me.vertices.foreach_set('co', co.ravel()); me.update(); ob.location = (0, 0, 0); ob.rotation_euler = (0, 0, 0); ob.scale = (1, 1, 1)


def parent_bone(ob, rig, bone):
    mw = ob.matrix_world.copy(); ob.parent = rig; ob.parent_type = 'BONE'; ob.parent_bone = bone
    bpy.context.view_layer.update(); ob.matrix_world = mw


# ------------------------------------------------------------------ thân (02_Body_Base): MỘT lưới liền khối
def build_body(c, mats):
    mb = MB('NamThan', SPEC['luoi']['than'], c)
    # đầu: sọ bầu + má–hàm đầy + cằm vồng ra trước + mũi cục tròn + tai gọn ôm sát
    mb.ell((0, 0.008, 1.312), (0.196, 0.188, 0.205))
    mb.ell((0, -0.022, 1.205), (0.188, 0.152, 0.118))
    mb.ell((0, -0.112, 1.138), (0.088, 0.062, 0.056))                 # cụm môi–cằm vồng tròn ra trước
    mb.ball((0, -0.212, 1.232), 0.029, s=4.0)                          # mũi
    for s in (1, -1):
        mb.ell((s * 0.216, 0.016, 1.236), (0.038, 0.048, 0.068), s=3.4, rot=(0, 0, s * 0.35))   # tai dày tròn kiểu chibi, nhô vừa khỏi sọ
        mb.ell((s * 0.236, -0.004, 1.236), (0.014, 0.020, 0.030), s=3.4, rot=(0, 0, s * 0.35), neg=True)   # hốc tai ở mặt trước
    # cổ hơi nghiêng cong về trước
    mb.cap((0, 0.006, 0.97), (0, -0.012, 1.105), 0.056)
    # thân (bên trong áo): gọn
    mb.ell((0, 0.004, 0.88), (0.150, 0.098, 0.13)); mb.ell((0, 0.0, 0.70), (0.128, 0.085, 0.12))
    for s in (1, -1):
        sh, el, wr = (s * 0.175, 0.004, 0.965), (s * 0.212, 0.012, 0.79), (s * 0.222, -0.004, 0.635)
        mb.cap((s * 0.05, 0.004, 0.975), sh, 0.06)                     # vai
        mb.cap(sh, el, 0.047); mb.cap(el, wr, 0.043); mb.ball(el, 0.046)  # tay liền một mạch, không ngấn khuỷu
        # bàn tay liền cổ tay: lòng bàn tay dẹt, 4 ngón khép tự nhiên co nhẹ vào thân, ngón cái chúc xuống ôm theo ngón trỏ
        hx, hy = s * 0.225, -0.006
        mb.cap((hx, hy, 0.632), (hx, hy - 0.004, 0.60), 0.034)
        mb.ell((hx, hy - 0.004, 0.592), (0.019, 0.040, 0.040), s=2.5)
        for f in range(4):
            fy = hy - 0.024 + f * 0.016; L = (0.052, 0.060, 0.056, 0.047)[f]
            mb.cap((hx - s * 0.002, fy, 0.566), (hx - s * 0.010, fy, 0.566 - L * 0.62), 0.0105, s=3.2)
        mb.cap((hx - s * 0.012, hy - 0.036, 0.598), (hx - s * 0.018, hy - 0.044, 0.567), 0.012, s=3.0)  # ngón cái
        # chân: đùi – gối – cẳng – cổ chân liền mạch, bàn chân có gót, ngón cái vừa phải
        hp, kn, an = (s * 0.088, 0, 0.585), (s * 0.088, -0.012, 0.335), (s * 0.088, 0.008, 0.088)
        mb.cap(hp, kn, 0.062); mb.cap(kn, an, 0.046); mb.ball(an, 0.043)
        mb.ell((s * 0.088, 0.018, 0.054), (0.044, 0.048, 0.038))       # gót
        mb.ell((s * 0.090, -0.060, 0.047), (0.052, 0.104, 0.033), rot=(math.radians(-6), 0, 0))  # mu bàn chân thuôn thấp về mũi
        for t in range(5):
            r = (0.0165, 0.0132, 0.0124, 0.0115, 0.0105)[t]
            mb.ball((s * (0.066 + t * 0.0135), -0.150 + abs(t - 0.4) * 0.0065, 0.036 - 0.0006 * t), r, s=3.2)
    mb.ell((0, 0, 0.60), (0.12, 0.075, 0.06))                            # chậu (trong quần)
    ob = mb.to_mesh('Nam_Than', c, mats['da']); subsurf(ob)
    return ob


# ------------------------------------------------------------------ áo, cổ áo, quần, dép (05_Outfit)
def build_shirt(c, mats):
    mb = MB('NamAo', SPEC['luoi']['ao'], c)
    mb.ell((0, 0.006, 0.905), (0.178, 0.118, 0.12))                  # ngực gọn
    mb.ell((0, -0.004, 0.72), (0.192, 0.128, 0.165))                 # bụng–gấu rộng hơn: vải rủ xuôi
    mb.ell((0, 0.004, 0.965), (0.12, 0.10, 0.06))                    # vai trên, xuôi về hai bên
    for s in (1, -1):
        sh = Vector((s * 0.175, 0.004, 0.965)); el = Vector((s * 0.212, 0.012, 0.79)); d = (el - sh).normalized()
        mb.cap((s * 0.06, 0.004, 0.962), sh, 0.068)                   # vai xuôi liền tay áo (không cầu vai rời)
        end = sh + d * 0.095; mb.cap(sh, end, 0.064)                  # tay áo
        q = Vector((0, 0, 1)).rotation_difference(d); e = q.to_euler()
        mb.ell(tuple(end + d * 0.05), (0.09, 0.09, 0.05), s=3.0, rot=(e.x, e.y, e.z), neg=True)   # cắt miệng tay áo
    mb.ell((0, -0.005, 1.035), (0.068, 0.072, 0.06), s=3.0, neg=True)   # khoét cổ áo tròn trễ
    mb.ell((0, 0, 0.505), (0.30, 0.25, 0.06), s=3.0, neg=True)          # cắt gấu áo thẳng (gấu ~0,57, trùm cạp quần)
    ob = mb.to_mesh('Nam_Ao', c, mats['ao']); subsurf(ob)
    # cổ áo: vành bo ôm vai
    bm = bmesh.new(); R, r, n, m = 0.067, 0.0085, 64, 12
    for i in range(n):
        a = 2 * math.pi * i / n
        for j in range(m):
            b = 2 * math.pi * j / m
            x = (R + r * math.cos(b)) * math.cos(a); y = (R * 1.02 + r * math.cos(b)) * math.sin(a)
            z = r * math.sin(b) - 0.018 * (1 + math.sin(a)) * 0.5 + 0.0 * math.cos(a)  # trễ xuống phía trước (y âm)
            bm.verts.new((x, y - 0.006, 1.006 + z - 0.006 * (-math.sin(a))))
    bm.verts.ensure_lookup_table()
    for i in range(n):
        for j in range(m):
            a, b = i * m + j, i * m + (j + 1) % m; c2, d2 = ((i + 1) % n) * m + (j + 1) % m, ((i + 1) % n) * m + j
            bm.faces.new((bm.verts[a], bm.verts[d2], bm.verts[c2], bm.verts[b]))
    me = bpy.data.meshes.new('Nam_CoAo'); bm.to_mesh(me); bm.free(); me.shade_smooth(); me.materials.append(mats['co_ao'])
    co = bpy.data.objects.new('Nam_CoAo', me); c.objects.link(co)
    return ob, co


def build_pants(c, mats):
    mb = MB('NamQuan', SPEC['luoi']['ao'], c)
    mb.ell((0, 0.004, 0.615), (0.172, 0.095, 0.11))                   # hông–mông dẹt gọn, bằng độ dày hai ống; đũng kín xuống ~0,50
    for s in (1, -1):
        mb.cap((s * 0.092, 0.002, 0.58), (s * 0.094, -0.008, 0.34), 0.08)
        mb.cap((s * 0.094, -0.006, 0.34), (s * 0.095, 0.006, 0.17), 0.076)   # ống suông, hai ống tách rõ
        mb.ell((s * 0.088, 0.006, 0.105), (0.12, 0.12, 0.06), s=3.0, neg=True)  # cắt gấu quần trên mắt cá
    ob = mb.to_mesh('Nam_Quan', c, mats['quan']); subsurf(ob)
    return ob


def slab(name, w, d, h, r, mat, c):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co = Vector((v.co.x * w, v.co.y * d, v.co.z * h))
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat)
    ob = bpy.data.objects.new(name, me); c.objects.link(ob)
    bv = ob.modifiers.new('Bevel', 'BEVEL'); bv.width = r; bv.segments = 6; bv.limit_method = 'NONE'
    me.shade_smooth(); return ob


def tube_mesh(name, pts, r, mat, c, n=10):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = r; cu.bevel_resolution = 4; cu.use_fill_caps = True
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(len(pts) - 1)
    for bp, p in zip(sp.bezier_points, pts): bp.co = p; bp.handle_left_type = bp.handle_right_type = 'AUTO'
    tmp = bpy.data.objects.new(name + '_c', cu); c.objects.link(tmp)
    dg = bpy.context.evaluated_depsgraph_get(); me = bpy.data.meshes.new_from_object(tmp.evaluated_get(dg)); me.name = name
    bpy.data.objects.remove(tmp); bpy.data.curves.remove(cu)
    me.shade_smooth(); me.materials.append(mat); ob = bpy.data.objects.new(name, me); c.objects.link(ob); return ob


def build_sandals(c, mats, body):
    """Dép xỏ ngón: đế bo + quai chữ Y nổi trên mu bàn chân (dò mặt mu bằng tia để quai không chìm vào chân)."""
    dg = bpy.context.evaluated_depsgraph_get(); bvh = BVHTree.FromObject(body, dg)
    def top(x, y, lift):
        hit = bvh.ray_cast(Vector((x, y, 0.115)), Vector((0, 0, -1)))   # bắt đầu dưới ống chân để chỉ trúng mu bàn chân
        return Vector((x, y, (hit[0].z if hit[0] else 0.03) + lift))
    out = []
    for s, k in ((1, 'L'), (-1, 'R')):
        sole = slab(f'Nam_DeDep.{k}', 0.118, 0.272, 0.016, 0.006, mats['de_dep'], c); sole.location = (s * 0.090, -0.040, 0.008)
        upper = slab(f'Nam_MatDep.{k}', 0.114, 0.268, 0.005, 0.002, mats['dep'], c); upper.location = (s * 0.090, -0.040, 0.0185)
        bx = s * 0.0745                                                # kẽ ngón cái – ngón trỏ
        post = Vector((bx, -0.132, 0.02)); apex = top(bx + s * 0.004, -0.100, 0.009)
        a1 = top(s * 0.050, -0.062, 0.008); a2 = top(s * 0.132, -0.062, 0.008)
        s1 = tube_mesh(f'Nam_Quai_a.{k}', [post, apex, a1, Vector((s * 0.040, -0.040, 0.02))], 0.0068, mats['dep'], c)
        s2 = tube_mesh(f'Nam_Quai_b.{k}', [post, apex, a2, Vector((s * 0.140, -0.040, 0.02))], 0.0068, mats['dep'], c)
        out.append((k, [sole, upper, s1, s2]))
    return out


# ------------------------------------------------------------------ tóc (04_Hair): đất sét, cụm lọn dày tròn
def build_hair(c, mats):
    """Khối tóc chính phồng ôm sọ tròn mềm + các MẢNG DẸT bo tròn đầu (dày/rộng ≈ 0,5) cho mái, cánh thái dương, múi sau và chỏm xoắn.
    Không dùng chuỗi cầu nối khúc. Chân tóc sau gáy phủ thấp sát cổ."""
    bm = bmesh.new(); HC = Vector((0, 0.032, 1.40))
    def blob(cen, ax, xv=(1, 0, 0), yv=(0, 1, 0), zv=(0, 0, 1)):
        """Cầu dẹt bo tròn riêng từng mảng (không hoà vào nhau như metaball): giao nhau thành nếp lõm, giữ ranh giới từng múi."""
        Rm = Matrix((xv, yv, zv)).transposed().to_4x4(); Sm = Matrix.Diagonal((ax[0], ax[1], ax[2], 1.0))
        bmesh.ops.create_uvsphere(bm, u_segments=40, v_segments=26, radius=1.0, matrix=Matrix.Translation(cen) @ Rm @ Sm)
    blob((0, 0.032, 1.40), (0.200, 0.200, 0.150))                       # khối chính phồng ôm sọ
    blob((0, 0.095, 1.275), (0.160, 0.125, 0.125))                      # sau gáy phủ thấp, tròn
    def plate(p0, p1, W, normal=None, k_len=1.15, ratio=0.5):
        p0, p1 = Vector(p0), Vector(p1); d = p1 - p0; dv = d.normalized(); cen = (p0 + p1) / 2
        n = Vector(normal) if normal is not None else (cen - HC)
        n = (n - dv * n.dot(dv)).normalized(); wv = n.cross(dv).normalized()
        blob(cen, (d.length / 2 * k_len, W, W * ratio), dv, wv, n)   # mảng dẹt: dày/rộng = ratio
    # mái: ba dải bản rộng hất chéo sang phải màn hình, đầu bo tròn dừng trên mày; chừa trán phải nhân vật lộ nốt ruồi
    plate((-0.10, -0.12, 1.53), (0.02, -0.188, 1.425), 0.074)
    plate((-0.02, -0.13, 1.54), (0.095, -0.180, 1.418), 0.072)
    plate((0.05, -0.12, 1.53), (0.155, -0.150, 1.408), 0.066)
    plate((-0.16, -0.08, 1.50), (-0.15, -0.155, 1.445), 0.056)
    for s_ in (1, -1):   # cánh tóc thái dương: gốc cắm vào khối chính, chĩa nhẹ ra ngoài, dừng trên tai
        plate((s_ * 0.15, -0.07, 1.47), (s_ * 0.214, -0.10, 1.385), 0.066)
    crown = Vector((0, 0.03, 1.50))
    for az_deg, zend, wd, reach in ((55, 1.325, 0.074, 0.212), (80, 1.33, 0.076, 0.214), (105, 1.33, 0.078, 0.212), (130, 1.28, 0.080, 0.205),
                                    (155, 1.17, 0.082, 0.190), (180, 1.145, 0.084, 0.180), (205, 1.17, 0.082, 0.190), (230, 1.28, 0.080, 0.205),
                                    (255, 1.33, 0.078, 0.212), (280, 1.33, 0.076, 0.214), (305, 1.325, 0.074, 0.212)):   # múi quanh đầu từ đỉnh xuống
        a = math.radians(az_deg); d = Vector((math.sin(a), -math.cos(a), 0))
        plate(crown + d * 0.05, Vector((0, 0.03, zend)) + d * (reach * 0.93), wd, k_len=1.0)
    # chỏm xoắn to cong về trước: ba mảng dẹt (mỏng theo trục X), đầu bo tròn
    tuft = [Vector(v) for v in ((0.0, 0.02, 1.54), (0.002, 0.016, 1.60), (0.014, 0.0, 1.645), (0.036, -0.024, 1.66), (0.058, -0.044, 1.645), (0.066, -0.052, 1.615))]
    for (i0, i1), wd in (((0, 2), 0.056), ((1, 3), 0.052), ((2, 4), 0.046), ((3, 5), 0.038)):   # chồng lên nhau để chỏm liền một mạch
        plate(tuft[i0], tuft[i1], wd, normal=(1, 0, 0), k_len=1.5, ratio=0.5)
    me = bpy.data.meshes.new('Nam_Toc'); bm.to_mesh(me); bm.free(); me.shade_smooth(); me.materials.append(mats['toc'])
    ob = bpy.data.objects.new('Nam_Toc', me); c.objects.link(ob)
    return ob


# ------------------------------------------------------------------ mặt (03_Face) + shape keys
class FaceBuilder:
    def __init__(self, body):
        dg = bpy.context.evaluated_depsgraph_get(); self.bvh = BVHTree.FromObject(body, dg)
        self.V, self.F, self.Fm = [], [], []   # đỉnh, mặt, chỉ số vật liệu
        self.keys = {}                          # tên key → dict(idx → vị trí)
        self.mats = []

    def mat(self, m):
        if m not in self.mats: self.mats.append(m)
        return self.mats.index(m)

    def surf(self, x, z):
        h = self.bvh.ray_cast(Vector((x, -0.6, z)), Vector((0, 1, 0)))
        return h[0], h[1].normalized()

    def frame(self, x, z, sink=0.0):
        p, n = self.surf(x, z); up = (Vector((0, 0, 1)) - n * n.z).normalized(); r = up.cross(n)
        return p - n * sink, r, up, n

    def ellipsoid(self, o, r, u, n, ax, m, nu=28, nv=18, theta_max=math.pi, theta_min=0.0):
        """Mặt elip trong khung (r,u,n); theta tính từ trục u (đỉnh trên). Trả về chỉ số đỉnh và (theta, phi)."""
        base = len(self.V); par = []
        for j in range(nv + 1):
            th = theta_min + (theta_max - theta_min) * j / nv
            for i in range(nu):
                ph = 2 * math.pi * i / nu
                lx, ly, lz = math.sin(th) * math.sin(ph) * ax[0], math.cos(th) * ax[1], math.sin(th) * math.cos(ph) * ax[2]
                self.V.append(o + r * lx + u * ly + n * lz); par.append((th, ph))
        mi = self.mat(m)
        for j in range(nv):
            for i in range(nu):
                a = base + j * nu + i; b = base + j * nu + (i + 1) % nu
                self.F.append((a, b, b + nu, a + nu)); self.Fm.append(mi)
        return list(range(base, len(self.V))), par

    def tube(self, pts, rad, m, nseg=24, nring=10, flat=1.0, n_dir=None):
        from mathutils import geometry
        base = len(self.V); P = [Vector(p) for p in pts]
        curve = []
        for k in range(nseg + 1):  # Catmull-Rom qua các điểm
            t = k / nseg * (len(P) - 1); i = min(int(t), len(P) - 2); f = t - i
            p0, p1, p2, p3 = P[max(i - 1, 0)], P[i], P[i + 1], P[min(i + 2, len(P) - 1)]
            curve.append(0.5 * ((2 * p1) + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (-p0 + 3 * p1 - 3 * p2 + p3) * f ** 3))
        for k, c in enumerate(curve):
            T = (curve[min(k + 1, nseg)] - curve[max(k - 1, 0)]).normalized(); N = (n_dir or Vector((0, -1, 0))); B = T.cross(N).normalized(); N = B.cross(T).normalized()
            rr = rad(k / nseg)
            for j in range(nring):
                a = 2 * math.pi * j / nring; self.V.append(c + (N * math.cos(a) * flat + B * math.sin(a)) * rr)
        mi = self.mat(m)
        for k in range(nseg):
            for j in range(nring):
                a = base + k * nring + j; b = base + k * nring + (j + 1) % nring
                self.F.append((a, b, b + nring, a + nring)); self.Fm.append(mi)
        # nắp hai đầu
        for k, flip in ((0, True), (nseg, False)):
            ci = len(self.V); self.V.append(curve[k])
            for j in range(nring):
                a = base + k * nring + j; b = base + k * nring + (j + 1) % nring
                self.F.append((ci, b, a) if flip else (ci, a, b)); self.Fm.append(mi)
        return list(range(base, len(self.V)))

    def key(self, name, idx, fn):
        d = self.keys.setdefault(name, {})
        for i in idx: d[i] = fn(i, self.V[i])

    def to_object(self, name, c):
        me = bpy.data.meshes.new(name); me.from_pydata([tuple(v) for v in self.V], [], self.F)
        for m in self.mats: me.materials.append(m)
        for p, mi in zip(me.polygons, self.Fm): p.material_index = mi
        me.shade_smooth(); ob = bpy.data.objects.new(name, me); c.objects.link(ob)
        ob.shape_key_add(name='Basis', from_mix=False)
        for k, d in self.keys.items():
            sk = ob.shape_key_add(name=k, from_mix=False)
            for i, p in d.items(): sk.data[i].co = p
            sk.value = 0.0   # Blender 5: key mới tạo có value = 1 → phải đặt về 0, không thì mọi biểu cảm bật cùng lúc
        return ob


def build_face(c, mats, body):
    fb = FaceBuilder(body); TH = math.radians(78.5)         # mí trên sụp phủ ~40% chiều cao tròng trắng: (1 − cos 78,5°)/2 = 0,40
    for s in (1, -1):
        p, r, u, n = fb.frame(s * 0.086, 1.262, sink=0.001)
        rr = r if s > 0 else -r                                   # trục ngang hướng ra ngoài mặt (để đối xứng)
        W, Hh, Dp = 0.050, 0.045, 0.011
        fb.ellipsoid(p, r, u, n, (W, Hh, Dp), mats['trang'])                                           # lòng trắng
        lid, par = fb.ellipsoid(p, r, u, n, (W * 1.05, Hh * 1.05, Dp * 1.10), mats['da'], theta_max=TH)  # mí trên
        line, lpar = fb.ellipsoid(p, r, u, n, (W * 1.07, Hh * 1.07, Dp * 1.18), mats['muc'], nv=3, theta_min=TH - math.radians(9), theta_max=TH)  # mép mí đậm (dải hẹp)
        lidset = set(lid)
        def blink(i, v, idx_par=dict(zip(lid + line, par + lpar)), o=p):
            th, ph = idx_par[i]; th2 = th * (math.radians(172) / TH); sc = (W * 1.05, Hh * 1.05, Dp * 1.10) if i in lidset else (W * 1.07, Hh * 1.07, Dp * 1.18)
            return o + r * (math.sin(th2) * math.sin(ph) * sc[0]) + u * (math.cos(th2) * sc[1]) + n * (math.sin(th2) * math.cos(ph) * sc[2])
        fb.key('chop_mat', lid + line, blink)
        # con ngươi đen nhỏ sát mép mí + chấm sáng
        thp = TH + math.radians(13); php = -s * math.radians(4)
        pc = p + r * (math.sin(thp) * math.sin(php) * W) + u * (math.cos(thp) * Hh) + n * (math.sin(thp) * math.cos(php) * Dp)
        pup, _ = fb.ellipsoid(pc, r, u, n, (0.0095, 0.0105, 0.0035), mats['muc'], nu=16, nv=10)
        hl, _ = fb.ellipsoid(pc + u * 0.004 + r * 0.003 + n * 0.0031, r, u, n, (0.0024, 0.0024, 0.001), mats['sang'], nu=10, nv=6)
        fb.key('chop_mat', pup + hl, lambda i, v, pc=pc: pc.copy())    # chớp: con ngươi thu về 0 (không lòi qua mí)
        for k, dx in (('liec_trai', 0.016), ('liec_phai', -0.016)):
            fb.key(k, pup + hl, lambda i, v, dx=dx: v + r * dx)
        # mày dày bo tròn
        pts = []
        for x, z in ((0.030, 1.343), (0.084, 1.354), (0.136, 1.342)):
            q, nq = fb.surf(s * x, z); pts.append(q + nq * 0.004)
        brow = fb.tube(pts, lambda t: 0.0150 * math.sqrt(max(0.05, math.sin(math.pi * (0.06 + 0.88 * t)))), mats['toc'], nseg=24, nring=12, flat=0.62)
        inner = pts[0]
        def frown(i, v, inner=inner, s=s):
            w = max(0.0, 1.0 - abs(v.x - inner.x) / 0.09)
            return v + Vector((-s * 0.006 * w, 0, -0.009 * w))
        fb.key('nhiu_may', brow, frown)
    # nốt ruồi: trên đuôi mày phải nhân vật (−X), không bị mái che
    q, nq = fb.surf(-0.124, 1.371); fb.ellipsoid(q + nq * 0.0015, (Vector((0, 0, 1)).cross(nq)).normalized(), Vector((0, 0, 1)), nq, (0.0075, 0.0075, 0.003), mats['muc'], nu=14, nv=8)
    # miệng chữ o nhỏ: lòng miệng tối, răng trên, lưỡi (không vành môi)
    p, r, u, n = fb.frame(0.0, 1.168, sink=0.003)
    mo, _ = fb.ellipsoid(p, r, u, n, (0.016, 0.015, 0.007), mats['mieng'], nu=24, nv=12)
    te, _ = fb.ellipsoid(p + u * 0.0085 + n * 0.0035, r, u, n, (0.011, 0.0035, 0.003), mats['rang'], nu=16, nv=8)
    tg, _ = fb.ellipsoid(p - u * 0.007 + n * 0.0032, r, u, n, (0.010, 0.0048, 0.0035), mats['luoi'], nu=16, nv=8)
    def scale_about(sx, sy, dy=0.0):
        return lambda i, v: p + r * ((v - p).dot(r) * sx) + u * ((v - p).dot(u) * sy + dy) + n * (v - p).dot(n)
    fb.key('ha_mieng', mo + tg, scale_about(1.15, 1.9)); fb.key('ha_mieng', te, scale_about(1.1, 1.0, 0.012))
    fb.key('mim_mieng', mo + te + tg, scale_about(0.75, 0.22))
    return fb.to_object('Nam_Mat', c)


# ------------------------------------------------------------------ lắp ráp
def build_nam(root_coll=None, location=(0, 0, 0), rot_z=0.0):
    sc = bpy.context.scene; root_coll = root_coll or sc.collection
    top = coll('Nam', root_coll)
    C = {k: coll(k, top) for k in ('01_Rig', '02_Body_Base', '03_Face', '04_Hair', '05_Outfit', '06_Props')}
    mats = make_mats()
    # 1) dựng khối gốc (tỉ lệ nguyên bản, chưa có rig)
    body = build_body(C['02_Body_Base'], mats)
    face = build_face(C['03_Face'], mats, body)
    hair = build_hair(C['04_Hair'], mats)
    shirt, collar = build_shirt(C['05_Outfit'], mats); pants = build_pants(C['05_Outfit'], mats)
    sand = build_sandals(C['05_Outfit'], mats, body)
    # 2) tỉ lệ chibi: co chân, cẳng tay ngắn, đầu 1,35×, tay–chân 1,25×
    BA = bones_a(); X = make_xforms(BA); BF = bones_final(BA, X)
    skinned = []
    for ob, extra, excl in ((body, head_only, ()), (shirt, None, ('thigh.L', 'thigh.R')), (pants, None, ()), (collar, None, ())):
        co, W, names = compute_weights(ob, BA, extra, excl); reshape_by_weights(ob, co, W, names, X); skinned.append((ob, W, names))
    P = Vector(head_pivot()); Mh = Matrix.Translation(P) @ Matrix.Scale(HEAD_K, 4) @ Matrix.Translation(-P) @ Matrix.Translation((0, 0, -DROP))
    for ob in (face, hair): ob.data.transform(Mh, shape_keys=True); ob.data.update()
    for k, obs in sand:
        for ob in obs: reshape_sandal(ob, k, X)
    # 3) khung xương theo vị trí cuối + trọng số
    rig = build_rig(C['01_Rig'], BF)
    for ob, W, names in skinned: skin_groups(ob, rig, W, names)
    for ob in (face, hair): parent_bone(ob, rig, 'head')
    for k, obs in sand:
        for ob in obs: parent_bone(ob, rig, f'foot.{k}')
    for ob in (body, shirt, pants, collar):
        ob.parent = rig
    top_z = max(v.co.z for v in hair.data.vertices) + 0.004
    kk = HEIGHT / top_z; rig.scale = (kk, kk, kk)
    rig.location = location; rig.rotation_euler = (0, 0, rot_z)
    bpy.context.view_layer.update()
    print(f'cao {top_z:.3f} m → co đều ×{kk:.3f} = {HEIGHT} m; đầu {(top_z - fz(1.085)) / top_z:.0%} chiều cao (cằm→đỉnh tóc, gồm chỏm)')
    return rig, dict(body=body, face=face, hair=hair, shirt=shirt, collar=collar, pants=pants)


def setup_render(sc, samples=48, gpu=True):
    sc.render.engine = 'CYCLES'; sc.cycles.samples = samples; sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
    sc.view_settings.view_transform = 'AgX'
    sc.view_settings.exposure = -1.0   # đèn Key/Fill mạnh để sáng–tối nổi khối; hạ phơi sáng để AgX không phai màu (bản bpy không có look Punchy)
    if gpu:  # RTX 3050 6GB: OptiX; máy không có GPU thì tự lùi về CPU
        try:
            pr = bpy.context.preferences.addons['cycles'].preferences; pr.compute_device_type = 'OPTIX'; pr.refresh_devices()
            dv = [d for d in pr.devices if d.type == 'OPTIX']
            for d in pr.devices: d.use = d.type == 'OPTIX'
            sc.cycles.device = 'GPU' if dv else 'CPU'
        except Exception:
            sc.cycles.device = 'CPU'
    print('Cycles device:', sc.cycles.device)


def studio(sc):
    w = bpy.data.worlds.new('studio'); sc.world = w; w.use_nodes = True
    bg = w.node_tree.nodes['Background']; bg.inputs['Color'].default_value = hexc('#f4ece6'); bg.inputs['Strength'].default_value = 0.35
    def area(name, loc, tgt, size, energy, col):
        d = bpy.data.lights.new(name, 'AREA'); d.size = size; d.energy = energy; d.color = hexc(col)[:3]
        o = bpy.data.objects.new(name, d); sc.collection.objects.link(o); o.location = loc
        o.rotation_euler = (Vector(tgt) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler(); return o
    area('key', (-1.4, -2.2, 3.0), (0, 0, 0.9), 2.0, 380, '#fff3e4')
    area('fill', (2.2, -1.8, 1.4), (0, 0, 1.0), 2.4, 120, '#eef2ff')
    area('rim', (0.6, 2.6, 2.4), (0, 0, 1.2), 1.2, 110, '#ffffff')
    me = bpy.data.meshes.new('san'); bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=4); bm.to_mesh(me); bm.free()
    fl = bpy.data.objects.new('san', me); sc.collection.objects.link(fl); fl.is_shadow_catcher = True
    sc.render.film_transparent = True


TURN = [('truoc', 0), ('34_phai', 35), ('nghieng_phai', 90), ('sau', 180), ('nghieng_trai', 270), ('34_trai', 325)]


def turnaround(out, samples, w=720, h=1000):
    sc = bpy.context.scene; studio(sc); setup_render(sc, samples)
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); cam.data.lens = 85; sc.camera = cam
    sc.render.resolution_x, sc.render.resolution_y = w, h
    os.makedirs(out, exist_ok=True)
    for name, deg in TURN:   # góc nhìn từ phía camera: 0 = chính diện; xoay camera quanh nhân vật theo chiều kim đồng hồ nhìn từ trên
        a = math.radians(deg); dist = 6.2
        cam.location = (math.sin(a) * dist, -math.cos(a) * dist, 0.86)
        cam.rotation_euler = (Vector((0, 0, 0.83)) - Vector(cam.location)).to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = os.path.join(out, f'{name}.png'); bpy.ops.render.render(write_still=True)


def kiem_tra(out, rig, parts, samples):
    """Ảnh kiểm tra rig: nghỉ / bước chân bằng IK / chớp + há miệng / liếc + nhíu mày."""
    sc = bpy.context.scene; studio(sc); setup_render(sc, samples)
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); cam.data.lens = 70; sc.camera = cam
    sc.render.resolution_x, sc.render.resolution_y = 720, 1000; os.makedirs(out, exist_ok=True)
    face = parts['face']; kb = face.data.shape_keys.key_blocks
    def shot(name, a_deg=25, z=0.86, dist=5.6, look=0.83):
        a = math.radians(a_deg); cam.location = (math.sin(a) * dist, -math.cos(a) * dist, z)
        cam.rotation_euler = (Vector((0, 0, look)) - Vector(cam.location)).to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = os.path.join(out, f'{name}.png'); bpy.ops.render.render(write_still=True)
    shot('nghi')
    pb = rig.pose.bones; pb['foot_ik.L'].location = (0, -0.05, -0.16); pb['foot_ik.L'].rotation_quaternion = Quaternion((1, 0, 0), math.radians(25))  # nâng chân trái bước tới
    pb['upper_arm.R'].rotation_quaternion = Quaternion((1, 0, 0), math.radians(-25)); pb['upper_arm.L'].rotation_quaternion = Quaternion((1, 0, 0), math.radians(20))
    bpy.context.view_layer.update(); shot('ik_buoc', a_deg=70)
    for b in pb: b.location = (0, 0, 0); b.rotation_quaternion = (1, 0, 0, 0)
    kb['chop_mat'].value = 1.0; kb['ha_mieng'].value = 1.0; shot('chop_ha', a_deg=15, z=1.28, dist=1.6, look=1.28)
    kb['chop_mat'].value = 0; kb['ha_mieng'].value = 0; kb['liec_trai'].value = 1; kb['nhiu_may'].value = 1; kb['mim_mieng'].value = 1
    shot('liec_nhiu_mim', a_deg=15, z=1.28, dist=1.6, look=1.28)


if __name__ == '__main__':
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--blend', default=''); ap.add_argument('--turnaround', default=''); ap.add_argument('--kiem-tra', default='')
    ap.add_argument('--samples', type=int, default=48)
    a = ap.parse_args(argv)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.scene.unit_settings.system = 'METRIC'; bpy.context.scene.unit_settings.scale_length = 1.0
    rig, parts = build_nam()
    for k, ob in parts.items():
        print(f'{k:6s} đỉnh={len(ob.data.vertices):6d}  cao {min(v.co.z for v in ob.data.vertices):.3f}–{max(v.co.z for v in ob.data.vertices):.3f}  ngang ±{max(abs(v.co.x) for v in ob.data.vertices):.3f}')
    if a.blend:
        setup_render(bpy.context.scene, a.samples); bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))
    if a.turnaround: turnaround(a.turnaround, a.samples)
    if a.kiem_tra: kiem_tra(a.kiem_tra, rig, parts, a.samples)
