"""BIẾN THỂ từ khuôn mẫu NAM-002 (Blender 5.2.x): chiều cao, màu da, dáng người, tóc.

  blender -b --factory-startup --python bien_the_nam002.py -- --in nam-002-rig.blend --out bien-the-A.blend \
      --cao 1.62 --da 0.62,0.42,0.30 --vai 0.0 --day 0.0 --toc ngan --mau-toc 0.03,0.02,0.02 [--anh dir]

--cao   chiều cao mới (m): scale cả Nam_Rig và mọi object con đều theo tỉ lệ (không áp scale, giữ rig/IK/driver)
--da    màu nhân lên texture da (r,g,b 0–1; 1,1,1 = giữ nguyên). Môi/má vẫn theo texture nên chỉ đổi tông, không đổi chi tiết
--vai   mở rộng vai (m mỗi bên; 0,02 = +4 cm tổng). Xương vai–tay dịch theo để rig không lệch
--day   phồng thân/bụng theo pháp tuyến (m; 0,012 ≈ người đầy hơn)
--toc   ngan | dai | xu | khong ; --mau-toc r,g,b
--may-day nhân độ dày lông mày (1,3 = dày hơn)   --mat-mau r,g,b màu mống mắt (tuyến tính)
--bop   tên bộ nắn mặt (BOP['tung']: tai nhỏ, hàm vuông, cằm dài, mũi thấp–thon, má hóp)   --bop-he-so cường độ (1 = chuẩn)
--ruoi  trai (Nam, +X) | phai (Người Kia, −X) | khong: nốt ruồi dưới đuôi mắt, vẽ bằng shader theo tọa độ rest
Dáng người được NƯỚNG vào lưới gốc và mọi shape key (miệng) — file biến thể là bản riêng, không phải thanh trượt.
Tóc: lớp vỏ copy từ da đầu, trọng số 100 % xương Head (modifier Armature, như áo quần).
"""
import sys, os, math, argparse
import bpy, bmesh
import numpy as np
from mathutils import Vector


def sm(e0, e1, t):
    u = np.clip((t - e0) / (e1 - e0), 0, 1); return u * u * (3 - 2 * u)


def bake_delta(body, delta):
    """Cộng delta (n×3, tọa độ cục bộ) vào lưới gốc và mọi shape key (theo cùng đỉnh)."""
    me = body.data; n = len(me.vertices)
    if me.shape_keys:
        for kb in me.shape_keys.key_blocks:
            a = np.zeros(n * 3); kb.data.foreach_get('co', a); kb.data.foreach_set('co', (a.reshape(-1, 3) + delta).ravel())
    a = np.zeros(n * 3); me.vertices.foreach_get('co', a); me.vertices.foreach_set('co', (a.reshape(-1, 3) + delta).ravel()); me.update()


# Mốc mặt (m, đo trên nam-002): đỉnh mũi (0,-0.139,1.483); cằm (0,-0.070,1.369); tai ngoài cùng x ±0.184 ở z 1.514; mặt rộng ±0.108 ở z 1.44.
BOP = {
    # c = tâm (x,y,z; x>0 là bên trái nhân vật, áp đối xứng nếu 'g'=1), r = bán kính lan mềm (m)
    # keo: dịch theo v=(dx,dy,dz) (dx tự đảo dấu ở bên phải) | phinh: đẩy theo pháp tuyến 'a' (+ phồng, − xẹp) | co: nhân tỉ lệ 'f' quanh tâm
    'tung': [
        {'t': 'co', 'c': (0.105, 0.04, 1.51), 'r': 0.10, 'f': (0.80, 0.80, 0.80), 'g': 1, 'chi_ngoai': 0.11},   # tai nhỏ hơn
        {'t': 'keo', 'c': (0.07, -0.02, 1.40), 'r': 0.05, 'v': (0.008, 0, 0.002), 'g': 1},                        # hàm bạnh ra: mặt vuông hơn
        {'t': 'keo', 'c': (0.0, -0.06, 1.385), 'r': 0.085, 'v': (0, -0.002, -0.008), 'g': 0},                     # cằm dài hơn (lan rộng để không nhọn)
        {'t': 'phinh', 'c': (0.0, -0.13, 1.48), 'r': 0.045, 'a': -0.006, 'g': 0},                                 # mũi thấp hơn
        {'t': 'co', 'c': (0.0, -0.13, 1.47), 'r': 0.045, 'f': (0.82, 1.0, 1.0), 'g': 0},                          # mũi thon hơn
        {'t': 'phinh', 'c': (0.08, -0.09, 1.44), 'r': 0.05, 'a': -0.006, 'g': 1},                                 # má hóp nhẹ
    ],
}


def bop(body, ops, he_so=1.0):
    """Nắn khuôn mặt kiểu 'bóp' (như proportional edit): mỗi thao tác lan mềm theo bán kính, đối xứng nếu g=1,
    bị giảm gần mắt (hốc mắt) và miệng để rig mặt không lệch. Kết quả nướng vào lưới gốc và mọi shape key."""
    me = body.data; n = len(me.vertices); co = np.zeros(n * 3); me.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
    nrm = np.zeros(n * 3, np.float32); me.vertices.foreach_get('normal', nrm); nrm = nrm.reshape(-1, 3)
    x, y, z = co.T; delta = np.zeros_like(co)
    head = (z > 1.30)
    d_eye = np.minimum(np.hypot(x - 0.052, z - 1.5268), np.hypot(x + 0.052, z - 1.5268))
    d_mouth = np.hypot(x, z - 1.4295)
    prot = sm(0.045, 0.080, d_eye) * sm(0.018, 0.040, d_mouth)
    for op in ops:
        for sd in ((1, -1) if op.get('g') else (1,)):
            c = np.array([op['c'][0] * sd, op['c'][1], op['c'][2]]); d = np.linalg.norm(co - c, axis=1)
            w = (1.0 - sm(0.0, op['r'], d)) * head
            if op['t'] != 'keo' or True: w = w * prot
            if op.get('chi_ngoai'): w = w * sm(op['chi_ngoai'] - 0.012, op['chi_ngoai'] + 0.012, np.abs(x))
            if op['t'] == 'keo': v = np.array([op['v'][0] * sd, op['v'][1], op['v'][2]]); delta += w[:, None] * v[None, :] * he_so
            elif op['t'] == 'phinh': delta += (w * op['a'] * he_so)[:, None] * nrm
            elif op['t'] == 'co': f = np.array(op['f']); delta += w[:, None] * ((co - c) * (f - 1.0)[None, :]) * he_so
    bake_delta(body, delta)
    print(f'  bóp: {len(ops)} thao tác, đỉnh dịch tối đa {np.linalg.norm(delta, axis=1).max() * 1000:.1f} mm')


def dang_nguoi(arm, body, vai, day):
    me = body.data; n = len(me.vertices); co = np.zeros(n * 3); me.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
    x, y, z = co.T; ax = np.abs(x); delta = np.zeros_like(co)
    if abs(vai) > 1e-6:
        # đỉnh vai trở ra ngoài dịch hết dx; thân gần giữa dịch dần; chỉ vùng ngực–vai (z) rồi tắt dần xuống thân dưới
        f = sm(0.04, 0.18, ax) * sm(1.05, 1.22, z) * sm(1.45, 1.36, z)
        delta[:, 0] += np.sign(x) * vai * f
        # xương vai/tay dịch cùng
        bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode='EDIT'); eb = arm.data.edit_bones
        for S, s in (('Left', 1), ('Right', -1)):
            sh = eb[f'{S}Shoulder']; sh.tail.x += s * vai
            for b in eb:
                if b.name.startswith(S) and any(k in b.name for k in ('Arm', 'Hand')) and 'Shoulder' not in b.name:
                    b.head.x += s * vai; b.tail.x += s * vai
        bpy.ops.object.mode_set(mode='OBJECT')
    if abs(day) > 1e-6:
        nrm = np.zeros((n, 3), np.float32); me.vertices.foreach_get('normal', nrm.ravel())
        f = sm(0.72, 0.95, z) * sm(1.32, 1.12, z) * sm(0.30, 0.16, ax) * (np.where(y < 0.0, 1.0, 0.6))
        delta += nrm * (day * f)[:, None]
    bake_delta(body, delta)
    print(f'  dáng người: vai {vai:+.3f} m/bên, đầy {day:+.3f} m; đỉnh dịch tối đa {np.linalg.norm(delta, axis=1).max() * 1000:.1f} mm')


def mau_da(rgb):
    mt = bpy.data.materials['model']; nt = mt.node_tree
    tex = nt.nodes['Image Texture']; bsdf = nt.nodes['Principled BSDF']
    mx = nt.nodes.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MULTIPLY'; mx.inputs[0].default_value = 1.0
    mx.inputs[7].default_value = (*rgb, 1.0)
    nt.links.new(tex.outputs['Color'], mx.inputs[6]); nt.links.new(mx.outputs[2], bsdf.inputs['Base Color'])
    mx.label = 'MAU_DA'


def nut_ruoi(ben):
    """Nốt ruồi dưới đuôi mắt: 'trai' (+X, Nam) hoặc 'phai' (−X, Người Kia). Vẽ bằng shader theo tọa độ rest của lưới
    (Texture Coordinate 'Object'), nên dính mặt khi cử động/scale; không sửa texture. Bán kính ≈ 2 mm."""
    mt = bpy.data.materials['model']; nt = mt.node_tree; N = nt.nodes
    cx = 0.082 if ben == 'trai' else -0.082; cz = 1.478
    tc = N.new('ShaderNodeTexCoord'); sp = N.new('ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sp.inputs[0])
    dx = N.new('ShaderNodeMath'); dx.operation = 'SUBTRACT'; nt.links.new(sp.outputs['X'], dx.inputs[0]); dx.inputs[1].default_value = cx
    dz = N.new('ShaderNodeMath'); dz.operation = 'SUBTRACT'; nt.links.new(sp.outputs['Z'], dz.inputs[0]); dz.inputs[1].default_value = cz
    ax = N.new('ShaderNodeMath'); ax.operation = 'POWER'; nt.links.new(dx.outputs[0], ax.inputs[0]); ax.inputs[1].default_value = 2.0
    az = N.new('ShaderNodeMath'); az.operation = 'POWER'; nt.links.new(dz.outputs[0], az.inputs[0]); az.inputs[1].default_value = 2.0
    sm_ = N.new('ShaderNodeMath'); sm_.operation = 'ADD'; nt.links.new(ax.outputs[0], sm_.inputs[0]); nt.links.new(az.outputs[0], sm_.inputs[1])
    rt = N.new('ShaderNodeMath'); rt.operation = 'SQRT'; nt.links.new(sm_.outputs[0], rt.inputs[0])
    ramp = N.new('ShaderNodeMapRange'); nt.links.new(rt.outputs[0], ramp.inputs[0])
    ramp.inputs[1].default_value = 0.0016; ramp.inputs[2].default_value = 0.0026; ramp.inputs[3].default_value = 1.0; ramp.inputs[4].default_value = 0.0; ramp.clamp = True
    fy = N.new('ShaderNodeMapRange'); nt.links.new(sp.outputs['Y'], fy.inputs[0])
    fy.inputs[1].default_value = 0.0; fy.inputs[2].default_value = -0.02; fy.inputs[3].default_value = 0.0; fy.inputs[4].default_value = 1.0; fy.clamp = True   # chỉ mặt trước (y < 0)
    mk = N.new('ShaderNodeMath'); mk.operation = 'MULTIPLY'; nt.links.new(ramp.outputs[0], mk.inputs[0]); nt.links.new(fy.outputs[0], mk.inputs[1])
    mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MIX'; mx.label = 'NOT_RUOI'
    nt.links.new(mk.outputs[0], mx.inputs[0]); mx.inputs[7].default_value = (0.10, 0.045, 0.03, 1.0)
    bsdf = N['Principled BSDF']; src = bsdf.inputs['Base Color'].links[0].from_socket
    nt.links.new(src, mx.inputs[6]); nt.links.new(mx.outputs[2], bsdf.inputs['Base Color'])


def mat_may(may_day, mat_rgb):
    """may_day: nhân độ dày lông mày (1 = giữ). mat_rgb: màu mống mắt (r,g,b tuyến tính) hoặc None."""
    if abs(may_day - 1.0) > 1e-6:
        for nm in ('LongMay.L', 'LongMay.R'):
            o = bpy.data.objects[nm]; o.scale[1] *= may_day
    if mat_rgb:
        for nm in ('nhan_cau.L', 'nhan_cau.R'):
            r = bpy.data.materials[nm].node_tree.nodes['Color Ramp'].color_ramp
            for i in (1, 2): r.elements[i].color = (*mat_rgb, 1.0)


def toc(arm, body, kieu, rgb, sc):
    if kieu == 'khong': return None
    me = bpy.data.meshes.new('Toc'); bm = bmesh.new(); bm.from_mesh(body.data)
    bm.faces.ensure_lookup_table()

    def giu(f):
        c = f.calc_center_median()
        if kieu == 'xu': return (c.z > 1.60 and c.y < 0.0 and abs(c.x) < 0.095) or (c.z > 1.55 and c.y >= 0.0 and abs(c.x) < 0.09) or (c.z > 1.62 and abs(c.x) < 0.10)
        if kieu == 'ngan': return (c.z > 1.585 and c.y < -0.00) or (c.z > 1.545 and c.y >= 0.0 and abs(c.x) < 0.085) or (c.z > 1.60 and abs(c.x) < 0.10)
        return (c.z > 1.58 and c.y < 0.0) or (c.z > 1.42 and c.y >= -0.005 and abs(c.x) < 0.10) or (c.z > 1.52 and abs(c.x) < 0.10 and c.y > -0.03)
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if not giu(f)], context='FACES')
    bm.verts.ensure_lookup_table(); bm.normal_update()
    off = 0.007 if kieu == 'ngan' else (0.004 if kieu == 'xu' else 0.020)
    for v in bm.verts:
        w = 1.0
        if kieu == 'xu':   # hai bên cắt sát, đỉnh đầu và phía trước dựng lên thành chỏm
            top = float(sm(1.63, 1.70, np.array([v.co.z]))[0]); front = float(sm(-0.02, -0.075, np.array([v.co.y]))[0])
            w = 1.0 + 5.0 * top * (0.5 + 0.5 * front) + 2.5 * front * top
            v.co.y -= 0.012 * top * front
        if kieu == 'dai' and v.co.y > 0 and v.co.z < 1.52: w = 1.0 + (1.52 - v.co.z) * 3.0     # tóc đuôi dày dần ra sau gáy
        v.co += v.normal * off * w
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new('Toc', me); sc.collection.objects.link(ob)
    for p in me.polygons: p.use_smooth = True
    mt = bpy.data.materials.new('toc'); mt.use_nodes = True; bs = mt.node_tree.nodes['Principled BSDF']; bs.inputs['Base Color'].default_value = (*rgb, 1); bs.inputs['Roughness'].default_value = 0.55
    me.materials.append(mt)
    so = ob.modifiers.new('day', 'SOLIDIFY'); so.thickness = 0.004; so.offset = 1.0
    ob.parent = arm; vg = ob.vertex_groups.new(name='Head'); vg.add(list(range(len(me.vertices))), 1.0, 'REPLACE')
    am = ob.modifiers.new('arm', 'ARMATURE'); am.object = arm
    print(f'  tóc {kieu}: {len(me.vertices)} đỉnh')
    return ob


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--in', dest='inp', required=True); ap.add_argument('--out', required=True)
    ap.add_argument('--cao', type=float, default=1.70); ap.add_argument('--da', default='1,1,1'); ap.add_argument('--vai', type=float, default=0.0); ap.add_argument('--day', type=float, default=0.0)
    ap.add_argument('--bop', default='khong', help='tên bộ bóp mặt trong BOP (vd tung) hoặc khong'); ap.add_argument('--bop-he-so', type=float, default=1.0); ap.add_argument('--may-day', type=float, default=1.0); ap.add_argument('--mat-mau', default=''); ap.add_argument('--ruoi', default='khong', help='trai (Nam) | phai (Người Kia) | khong'); ap.add_argument('--toc', default='khong'); ap.add_argument('--mau-toc', default='0.03,0.02,0.02'); ap.add_argument('--anh')
    a = ap.parse_args(argv)
    bpy.ops.wm.open_mainfile(filepath=os.path.abspath(a.inp)); sc = bpy.context.scene
    arm = bpy.data.objects['Nam_Rig']; body = bpy.data.objects['Nam_Body']
    for b in arm.pose.bones: b.location = (0, 0, 0); b.rotation_mode = 'QUATERNION'; b.rotation_quaternion = (1, 0, 0, 0)
    bpy.context.view_layer.update()
    dang_nguoi(arm, body, a.vai, a.day)
    if a.bop != 'khong': bop(body, BOP[a.bop], a.bop_he_so)
    mau_da(tuple(float(v) for v in a.da.split(',')))
    if a.ruoi != 'khong': nut_ruoi(a.ruoi)
    mat_may(a.may_day, tuple(float(v) for v in a.mat_mau.split(',')) if a.mat_mau else None)
    ob = toc(arm, body, a.toc, tuple(float(v) for v in a.mau_toc.split(',')), sc)
    k = a.cao / 1.70; arm.scale = (k, k, k)
    sc['bien_the'] = f'cao {a.cao} m, da {a.da}, vai {a.vai}, day {a.day}, toc {a.toc}'
    bpy.context.view_layer.update()
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.out), compress=True)
    print('PASS: đã lưu', a.out)


main()
