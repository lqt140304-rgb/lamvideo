"""S12 — Thế giới trong gương (Mirror Realm, P3.05/Trailer): Deep Teal Abyss #051824, vực thẳm câm lặng, mặt sàn là mặt nước phẳng phát sáng lân tinh,
khung gương gỗ lơ lửng, Nam chìm dần (hình nhân tạm), bóng phòng trọ đảo ngược 180° mờ xa trong sương. Zero Sound Void.
Tọa độ thế giới: mét, z lên, mặt nước z = 0, tâm gương ở gốc. Chạy: python the_gioi_guong.py --cam WIDE|FORE|MID|BACK|TOP --out ảnh.png [--frames 1,48,96]
Chuyển động bằng driver theo khung hình: gợn sóng lan, gương lơ lửng nhấp nhô, Nam chìm, bọt khí nổi, vòng sóng quanh Nam."""
import sys, os, math, random, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
from mathutils import Vector, Matrix
import xay_phong_tro as X
import vat_lieu as M

TEAL = (0.02, 0.094, 0.141)        # #051824
NAM = (1.25, 0.15)                 # vị trí Nam chìm (x, y)
KHOANG = 14.0                      # khoảng cách bóng phòng đảo ngược phía sau gương (+y)


def drv(ob, path, idx, expr):
    d = ob.driver_add(path, idx).driver if idx is not None else ob.driver_add(path).driver
    d.type = 'SCRIPTED'; d.expression = expr


def _wobj(coll, name, bm, loc, mat, smooth=True, rot=None, scale=None):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    if smooth:
        for p in me.polygons: p.use_smooth = True
    ob = bpy.data.objects.new(name, me); ob.location = loc; me.materials.append(mat)
    if rot is not None: ob.rotation_euler = rot
    if scale is not None: ob.scale = scale
    coll.objects.link(ob); return ob


def beam(coll, name, p0, p1, w, mat):
    """Thanh vuông nối hai điểm (cạnh của khung dây)."""
    a, b = Vector(p0), Vector(p1); d = b - a; L = d.length
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co = Vector((v.co.x * w, v.co.y * w, v.co.z * L))
    q = d.normalized().to_track_quat('Z', 'Y')
    ob = _wobj(coll, name, bm, (a + b) / 2, mat, False); ob.rotation_mode = 'QUATERNION'; ob.rotation_quaternion = q; return ob


def water_material(center):
    """Mặt nước đen xanh phản chiếu: Fresnel(Glossy rất bóng ↔ nền Deep Teal), gợn vòng lan từ `center` (Wave rings + phase driver), đốm lân tinh Voronoi."""
    m = bpy.data.materials.new('mat_nuoc_vuc'); m.use_nodes = True; nt = m.node_tree; N, L = nt.nodes, nt.links
    for n_ in list(N): N.remove(n_)
    tc = N.new('ShaderNodeTexCoord'); mp = N.new('ShaderNodeMapping'); L.new(tc.outputs['Object'], mp.inputs['Vector']); mp.inputs['Location'].default_value = (-center[0], -center[1], 0)
    wv = N.new('ShaderNodeTexWave'); wv.wave_type = 'RINGS'; wv.rings_direction = 'SPHERICAL'; wv.inputs['Scale'].default_value = 3.2; wv.inputs['Distortion'].default_value = 2.0; wv.inputs['Detail'].default_value = 2.0; wv.inputs['Detail Scale'].default_value = 2.5
    L.new(mp.outputs['Vector'], wv.inputs['Vector'])
    d_ = wv.inputs['Phase Offset'].driver_add('default_value').driver; d_.type = 'SCRIPTED'; d_.expression = 'frame*0.08'   # sóng lan ra liên tục
    nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 9.0; nz.inputs['Detail'].default_value = 4.0; L.new(tc.outputs['Object'], nz.inputs['Vector'])
    hgt = N.new('ShaderNodeMath'); hgt.operation = 'ADD'; L.new(wv.outputs['Fac'], hgt.inputs[0]); L.new(nz.outputs['Fac'], hgt.inputs[1])
    bp = N.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.12; bp.inputs['Distance'].default_value = 0.02; L.new(hgt.outputs[0], bp.inputs['Height'])
    gl = N.new('ShaderNodeBsdfGlossy'); gl.inputs['Roughness'].default_value = 0.02; gl.inputs['Color'].default_value = (0.55, 0.85, 0.9, 1); L.new(bp.outputs['Normal'], gl.inputs['Normal'])
    df = N.new('ShaderNodeBsdfDiffuse'); df.inputs['Color'].default_value = (0.004, 0.03, 0.045, 1); L.new(bp.outputs['Normal'], df.inputs['Normal'])
    fr = N.new('ShaderNodeFresnel'); fr.inputs['IOR'].default_value = 1.33; L.new(bp.outputs['Normal'], fr.inputs['Normal'])
    mx = N.new('ShaderNodeMixShader'); L.new(fr.outputs[0], mx.inputs['Fac']); L.new(df.outputs[0], mx.inputs[1]); L.new(gl.outputs[0], mx.inputs[2])
    # lân tinh: đốm nhỏ + mảng sáng lớn mờ
    vr = N.new('ShaderNodeTexVoronoi'); vr.inputs['Scale'].default_value = 55.0; L.new(tc.outputs['Object'], vr.inputs['Vector'])
    sp = N.new('ShaderNodeValToRGB'); sp.color_ramp.elements[0].position = 0.0; sp.color_ramp.elements[0].color = (1, 1, 1, 1); sp.color_ramp.elements[1].position = 0.045; sp.color_ramp.elements[1].color = (0, 0, 0, 1); L.new(vr.outputs['Distance'], sp.inputs['Fac'])
    n2 = N.new('ShaderNodeTexNoise'); n2.inputs['Scale'].default_value = 0.35; n2.inputs['Detail'].default_value = 3.0; L.new(tc.outputs['Object'], n2.inputs['Vector'])
    pr = N.new('ShaderNodeValToRGB'); pr.color_ramp.elements[0].position = 0.45; pr.color_ramp.elements[1].position = 0.65; L.new(n2.outputs['Fac'], pr.inputs['Fac'])
    mm = N.new('ShaderNodeMath'); mm.operation = 'MULTIPLY'; L.new(sp.outputs['Color'], mm.inputs[0]); L.new(pr.outputs['Color'], mm.inputs[1])
    em = N.new('ShaderNodeEmission'); em.inputs['Color'].default_value = (0.25, 0.95, 0.9, 1); L.new(mm.outputs[0], em.inputs['Strength'])
    em.inputs['Strength'].default_value = 0.0; L.new(mm.outputs[0], em.inputs['Strength'])
    mu = N.new('ShaderNodeMath'); mu.operation = 'MULTIPLY'; mu.inputs[1].default_value = 6.0; L.new(mm.outputs[0], mu.inputs[0]); L.new(mu.outputs[0], em.inputs['Strength'])
    ad = N.new('ShaderNodeAddShader'); L.new(mx.outputs[0], ad.inputs[0]); L.new(em.outputs[0], ad.inputs[1])
    ot = N.new('ShaderNodeOutputMaterial'); L.new(ad.outputs[0], ot.inputs['Surface'])
    return m


def build(cam='WIDE', res=(1280, 536), nam=True, phong=True):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene; coll = bpy.data.collections.new('The_gioi_guong'); sc.collection.children.link(coll)
    rnd = random.Random(12)
    # ---- trời/vực: màu nền Deep Teal + sương thể tích (Volume Scatter trong World)
    w = bpy.data.worlds.new('vuc'); sc.world = w; w.use_nodes = True; nt = w.node_tree
    bg = nt.nodes['Background']; bg.inputs['Color'].default_value = (*TEAL, 1); bg.inputs['Strength'].default_value = 0.35
    vs = nt.nodes.new('ShaderNodeVolumeScatter'); vs.inputs['Color'].default_value = (0.08, 0.45, 0.52, 1); vs.inputs['Density'].default_value = 0.035; vs.inputs['Anisotropy'].default_value = 0.45
    wo = nt.nodes['World Output']; nt.links.new(vs.outputs['Volume'], wo.inputs['Volume'])
    # ---- mặt nước vô tận
    bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=2, y_segments=2, size=600)
    water = _wobj(coll, 'nuoc_vuc', bm, (0, 0, 0), water_material((NAM[0], NAM[1])), False)
    # ---- khung gương gỗ lơ lửng (cao 1,22 × rộng 0,52 như S01 nhưng bay cách mặt nước 0,55 m, nghiêng nhẹ, nhấp nhô)
    wood = M.wood('gt_go', '#5a3e24', '#3a2616', rough=0.7)
    root = bpy.data.objects.new('guong_troi', None); coll.objects.link(root); root.location = (0, 0, 1.15); root.rotation_euler = (0, math.radians(-4), 0)
    def part(nm, x0, x1, y0, y1, z0, z1, mat):
        bmx = bmesh.new(); bmesh.ops.create_cube(bmx, size=1.0)
        for v in bmx.verts: v.co = Vector((x1 if v.co.x > 0 else x0, y1 if v.co.y > 0 else y0, z1 if v.co.z > 0 else z0))
        ob = _wobj(coll, nm, bmx, (0, 0, 0), mat, False); ob.parent = root; return ob
    W_, H_, T_ = 0.52, 1.22, 0.05
    part('gg_trai', -0.03, 0.0, -W_ / 2 - 0.03, W_ / 2 + 0.03, -H_ / 2 - 0.03, H_ / 2 + 0.03, wood)
    for nm, y0, y1 in (('gg_t', -W_ / 2 - 0.03, -W_ / 2), ('gg_p', W_ / 2, W_ / 2 + 0.03)): part(nm, -0.03, 0.02, y0, y1, -H_ / 2 - 0.03, H_ / 2 + 0.03, wood)
    for nm, z0, z1 in (('gg_d', -H_ / 2 - 0.03, -H_ / 2), ('gg_tr', H_ / 2, H_ / 2 + 0.03)): part(nm, -0.03, 0.02, -W_ / 2 - 0.03, W_ / 2 + 0.03, z0, z1, wood)
    # mặt kính: gương phản xạ lạnh + viền sáng lân tinh (mặt hướng +x nhìn về phía camera WIDE)
    gm = bpy.data.materials.new('gt_kinh'); gm.use_nodes = True; gnt = gm.node_tree
    for n_ in list(gnt.nodes): gnt.nodes.remove(n_)
    g1 = gnt.nodes.new('ShaderNodeBsdfGlossy'); g1.inputs['Roughness'].default_value = 0.03; g1.inputs['Color'].default_value = (0.16, 0.34, 0.38, 1)
    e1 = gnt.nodes.new('ShaderNodeEmission'); e1.inputs['Color'].default_value = (0.1, 0.55, 0.6, 1); e1.inputs['Strength'].default_value = 0.35
    ad = gnt.nodes.new('ShaderNodeAddShader'); gnt.links.new(g1.outputs[0], ad.inputs[0]); gnt.links.new(e1.outputs[0], ad.inputs[1])
    go = gnt.nodes.new('ShaderNodeOutputMaterial'); gnt.links.new(ad.outputs[0], go.inputs['Surface'])
    part('gg_kinh', -0.004, 0.0, -W_ / 2, W_ / 2, -H_ / 2, H_ / 2, gm)
    drv(root, 'location', 2, '1.15+0.035*sin(frame*0.09)'); drv(root, 'rotation_euler', 0, '0.025*sin(frame*0.06)')
    # ---- quầng sáng lạnh quanh gương
    def area(nm, loc, rot, size, e, col):
        ld = bpy.data.lights.new(nm, 'AREA'); ld.energy = e; ld.color = col; ld.shape = 'RECTANGLE'; ld.size = size[0]; ld.size_y = size[1]
        o = bpy.data.objects.new(nm, ld); o.location = loc; o.rotation_euler = rot; coll.objects.link(o); return o
    area('gt_glow_guong', (0.6, 0, 1.15), (0, math.radians(90), 0), (0.9, 1.5), 35, (0.35, 0.95, 0.95))      # ánh phát ra từ mặt gương về phía +x
    area('gt_ve_dinh', (0.0, 0.0, 6.0), (0, 0, 0), (4, 4), 220, (0.35, 0.8, 0.95))                          # ánh trời mờ từ trên cao
    # ---- Nam chìm dần: hình nhân tạm (thân + đầu + 2 tay giơ về phía gương) hạ thấp bằng driver, vòng sóng lan quanh người, bọt khí nổi
    if nam:
        sk = M.solid('gt_nam', '#4f7fb0', 0.6)
        nroot = bpy.data.objects.new('nam_chim', None); coll.objects.link(nroot); nroot.location = (NAM[0], NAM[1], -0.1)
        drv(nroot, 'location', 2, 'max(-0.62,0.0-0.0065*frame)-0.0')
        def np_(nm, ob): ob.parent = nroot; return ob
        bt = bmesh.new(); bmesh.ops.create_cone(bt, cap_ends=True, segments=24, radius1=0.17, radius2=0.17, depth=0.84); np_('than', _wobj(coll, 'nam_than', bt, (0, 0, 0.84 * 0.5 + 0.0), sk))
        bh = bmesh.new(); bmesh.ops.create_uvsphere(bh, u_segments=24, v_segments=12, radius=0.11); np_('dau', _wobj(coll, 'nam_dau', bh, (0, 0, 0.98), sk))
        for sg in (-1, 1):
            ba = bmesh.new(); bmesh.ops.create_cone(ba, cap_ends=True, segments=12, radius1=0.04, radius2=0.04, depth=0.62)
            ao = _wobj(coll, f'nam_tay{sg}', ba, (-0.12, sg * 0.2, 0.9), sk); ao.rotation_euler = (math.radians(sg * 8), math.radians(-35), 0); np_('tay', ao)
        ring = M.emission('gt_vong_song', '#7ae8e0', 1.2)
        for k in range(4):   # vòng sóng nở dần quanh Nam (torus dẹt, scale quay vòng)
            bm_ = bmesh.new(); verts = []
            for i in range(48):
                for j in range(6):
                    a_ = 2 * math.pi * i / 48; b_ = 2 * math.pi * j / 6; rr = 1.0 + 0.012 * math.cos(b_)
                    verts.append(bm_.verts.new((rr * math.cos(a_), rr * math.sin(a_), 0.012 * math.sin(b_))))
            for i in range(48):
                for j in range(6):
                    try: bm_.faces.new((verts[i * 6 + j], verts[((i + 1) % 48) * 6 + j], verts[((i + 1) % 48) * 6 + (j + 1) % 6], verts[i * 6 + (j + 1) % 6]))
                    except ValueError: pass
            ro = _wobj(coll, f'nam_song{k}', bm_, (NAM[0], NAM[1], 0.004), ring); ro.visible_shadow = False
            for ax in (0, 1): drv(ro, 'scale', ax, f'0.25+fmod(frame*0.012+{k * 0.25},1.0)*1.9')
        bub = M.emission('gt_bot', '#bff5f0', 3.0)
        for k in range(16):
            bb = bmesh.new(); bmesh.ops.create_uvsphere(bb, u_segments=10, v_segments=6, radius=rnd.uniform(0.012, 0.03))
            ob = _wobj(coll, f'bot{k}', bb, (NAM[0] + rnd.uniform(-0.3, 0.3), NAM[1] + rnd.uniform(-0.3, 0.3), 0.0), bub); ob.visible_shadow = False
            drv(ob, 'location', 2, f'-0.5+fmod(frame*{rnd.uniform(0.01, 0.025):.3f}+{rnd.uniform(0, 3):.2f},3.0)*0.6')
    # ---- bóng phòng trọ đảo ngược 180° (khung dây sáng mờ: phòng 3×4×2,8 m, giường, bàn học, cửa) ở xa trong sương
    if phong:
        wf = M.emission('gt_khung_phong', '#3fc7c2', 0.5)
        def box_edges(tag, x0, x1, y0, y1, z0, z1, ww=0.035):
            pts = [(x, y, z) for x in (x0, x1) for y in (y0, y1) for z in (z0, z1)]
            for i, a in enumerate(pts):
                for b in pts[i + 1:]:
                    if sum(1 for u, v in zip(a, b) if abs(u - v) > 1e-6) == 1: beam(coll, f'gt_ph_{tag}_{len([1 for o in coll.objects]) }', a, b, ww, wf).visible_shadow = False
        oy = KHOANG; ox = -1.5   # phòng đảo: trục x lật 180° so với phòng thật (cửa nằm bên phải thay vì bên trái)
        box_edges('phong', ox, ox + 3.0, oy, oy + 4.0, 0.0, 2.8)
        box_edges('giuong', ox + 0.1, ox + 1.5, oy + 2.0, oy + 3.9, 0.0, 0.24, 0.025)       # nệm đôi
        box_edges('ban', ox + 2.1, ox + 2.98, oy + 0.02, oy + 0.57, 0.0, 0.75, 0.025)        # bàn học (đảo bên)
        box_edges('cua', ox + 0.0, ox + 0.05, oy + 2.05, oy + 2.9, 0.0, 2.1, 0.03)
        box_edges('guong_dung', ox + 0.12, ox + 0.2, oy + 3.0, oy + 3.52, 0.0, 1.22, 0.025)
        # một chiếc gương nhỏ trong phòng đảo, sáng lạnh (đối xứng với gương ở đây)
        area('gt_phong_dao', (ox + 1.5, oy + 2.0, 1.4), (0, 0, 0), (2.5, 2.5), 60, (0.3, 0.9, 0.9))
    # ---- camera + render
    CAMS = {'WIDE': ((5.8, -5.2, 1.55), (0.3, 0.5, 1.05), 28, 6.0), 'FORE': ((3.6, -2.6, 0.2), (0.4, 0.3, 1.05), 32, 2.0), 'MID': ((3.2, -1.2, 1.3), (0.6, 0.05, 1.0), 45, 3.0),
            'BACK': ((-0.9, 0.0, 1.3), (-8.0, 7.0, 1.6), 24, 12.0), 'TOP': ((0.2, 0.1, 9.5), (0.2, 0.1, 0.0), 24, 9.0), 'CAN_GUONG': ((1.9, 0.9, 1.3), (0.0, 0.0, 1.15), 50, 1.8)}
    pos, tgt, mm, fd = CAMS[cam]
    cd = bpy.data.cameras.new('cam_' + cam); cd.lens = mm; cd.sensor_width = 36; cd.dof.use_dof = True; cd.dof.aperture_fstop = 2.8
    co = bpy.data.objects.new('cam_' + cam, cd); coll.objects.link(co); co.location = pos
    co.rotation_euler = (Vector(tgt) - Vector(pos)).to_track_quat('-Z', 'Y').to_euler(); cd.dof.focus_distance = (Vector(tgt) - Vector(pos)).length; sc.camera = co
    sc.render.engine = 'CYCLES'; X._thiet_bi(sc); sc.cycles.samples = 64; sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 8; sc.cycles.glossy_bounces = 6; sc.cycles.volume_bounces = 2; sc.cycles.volume_step_rate = 1.5; sc.cycles.volume_max_steps = 256
    sc.render.resolution_x, sc.render.resolution_y = res; sc.render.resolution_percentage = 100
    sc.view_settings.view_transform = 'AgX'; sc.view_settings.exposure = 0.6
    sc.render.image_settings.file_format = 'PNG'; sc.frame_start, sc.frame_end = 1, 96
    return sc


if __name__ == '__main__':
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--cam', default='WIDE'); ap.add_argument('--out', default='/tmp/the_gioi_guong.png'); ap.add_argument('--samples', type=int, default=64); ap.add_argument('--width', type=int, default=1280)
    ap.add_argument('--frames', default='1'); ap.add_argument('--blend', default=''); ap.add_argument('--no-nam', action='store_true'); ap.add_argument('--no-phong', action='store_true')
    a = ap.parse_args(argv)
    sc = build(a.cam, (a.width, round(a.width / 2.39)), nam=not a.no_nam, phong=not a.no_phong); sc.cycles.samples = a.samples
    if a.blend: bpy.ops.wm.save_as_mainfile(filepath=a.blend)
    for f in [int(v) for v in a.frames.split(',')]:
        sc.frame_set(f); sc.render.filepath = a.out if len(a.frames.split(',')) == 1 else a.out.replace('.png', f'_{f:03d}.png'); bpy.ops.render.render(write_still=True)
