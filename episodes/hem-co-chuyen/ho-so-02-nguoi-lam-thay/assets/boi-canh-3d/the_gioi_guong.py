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
NAM = (-1.9, 3.26)                 # Nam chìm trước chiếc gương đứng (phòng đảo: gương ở x ≈ −2,8, y 3,0–3,5)
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
    bg = nt.nodes['Background']; bg.inputs['Color'].default_value = (*TEAL, 1); bg.inputs['Strength'].default_value = 0.12
    vs = nt.nodes.new('ShaderNodeVolumeScatter'); vs.inputs['Color'].default_value = (0.08, 0.45, 0.52, 1); vs.inputs['Density'].default_value = 0.035; vs.inputs['Anisotropy'].default_value = 0.45
    wo = nt.nodes['World Output']; nt.links.new(vs.outputs['Volume'], wo.inputs['Volume'])
    # ---- mặt nước vô tận
    bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=2, y_segments=2, size=600)
    water = _wobj(coll, 'nuoc_vuc', bm, (0, 0, 0), water_material((NAM[0], NAM[1])), False)
    # ---- PHÒNG TRỌ ĐẢO NGƯỢC HOÀN CHỈNH: dựng đúng phòng thật (vỏ, cửa, cửa sổ, bếp, tủ, bàn học, ghế, nệm, quạt, gương, đồ lặt vặt) rồi lật gương qua mặt phẳng x = 0
    #     (parent scale x = −1): đồ vật đảo trái–phải 100%, chữ trên đồ vật cũng đảo; sàn gạch bỏ, thay bằng mặt nước vô tận; mọi đèn của phòng thật bị gỡ, chỉ còn ánh Deep Teal.
    X.MODE_HIEN_TAI = 'night'; X.DEN_BAN_ON = False
    m = X.make_materials()
    m['man_hinh'] = M.emission('man_hinh', '#2a6a70', 1.2); m['den_tuyp'] = M.solid('den_tuyp_tat', '#9ab8b8', 0.35)
    m['den_tuyp_hl'] = M.emission('den_tuyp_hl', '#7fe0d8', 1.0); m['dd_cua_so'] = M.solid('dd_cua_so_gt', '#051824', 0.2)
    croom = bpy.data.collections.new('Phong_dao'); sc.collection.children.link(croom)
    X.shell(m, croom, 10.0, cutaway=False, hide_front=False); X.kitchen(m, croom); X.wardrobe(m, croom); X.desk_and_chair(m, croom, chair_rot=0.0); X.bed(m, croom); X.fan(m, croom, blade=0.0)
    X.mirror(m, croom); X.clutter(m, croom, dep_san=False); X.wall_details(m, croom); X.lights_fixture(m, croom)
    for o in list(croom.objects):
        if o.type == 'LIGHT': bpy.data.objects.remove(o, do_unlink=True)
    sp_ = bpy.data.objects.get('san_phong')
    if sp_: sp_.hide_render = True; sp_.hide_viewport = True   # sàn gạch → mặt nước
    flip = bpy.data.objects.new('phong_dao', None); croom.objects.link(flip); flip.scale = (-1, 1, 1)
    for o in croom.objects:
        if o is not flip and o.parent is None: o.parent = flip
    ceil_ = bpy.data.objects.get('tran_phong'); front_ = bpy.data.objects.get('tuong_truoc')
    # ánh sáng Deep Teal thay đèn phòng: trần mờ lạnh + quầng sáng quanh gương
    def area(nm, loc, rot, size, e, col):
        ld = bpy.data.lights.new(nm, 'AREA'); ld.energy = e; ld.color = col; ld.shape = 'RECTANGLE'; ld.size = size[0]; ld.size_y = size[1]
        o = bpy.data.objects.new(nm, ld); o.location = loc; o.rotation_euler = rot; coll.objects.link(o); return o
    area('gt_tran', (-1.5, 2.0, 2.6), (0, 0, 0), (2.2, 3.2), 4.5, (0.3, 0.8, 0.9))
    area('gt_glow_guong', (-2.3, 3.26, 1.0), (0, math.radians(-90), 0), (0.9, 1.4), 4, (0.35, 0.95, 0.95))
    area('gt_nuoc_phat', (-1.5, 2.0, 0.15), (math.radians(180), 0, 0), (2.5, 3.5), 3, (0.2, 0.9, 0.85))   # lân tinh hắt ngược lên từ mặt nước
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
            ao = _wobj(coll, f'nam_tay{sg}', ba, (-0.12, sg * 0.2, 0.9), sk); ao.rotation_euler = (math.radians(sg * 8), math.radians(35), 0); np_('tay', ao)
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
    # ---- NGƯỜI KIA (không đưa vào shot XUYEN: tay che khung máy): đứng yên trên mặt nước (hình nhân tạm, cao 1,6 m), nốt ruồi bên PHẢI sẽ gắn khi có nhân vật modular; tay TRÁI đưa về phía Nam (đúng luật thuận tay trái)
    XC = cam in ('XUYEN', 'XUYEN_CHAM')
    if False and nam and cam == 'XUYEN_CHAM':   # (tắt: bóng đen che gương; sự rùng rợn đến từ nhịp chậm, đèn chập chờn, chuyển màu)
        # NGƯỜI KIA: bóng sẫm đứng im ở rìa trái khung hình, nhoè (f/2 lấy nét vào gương), hiện dần từ 55% shot — chỉ là mảng tối đứng nhìn Nam chìm
        kk = M.solid('gt_kia', '#1c1214', 0.5); kroot = bpy.data.objects.new('kia_root', None); coll.objects.link(kroot); kroot.location = (-2.3, 2.55, 0.0)
        drv(kroot, 'scale', 0, 'min(1,max(0.001,(frame-105)/30))'); drv(kroot, 'scale', 1, 'min(1,max(0.001,(frame-105)/30))'); drv(kroot, 'scale', 2, 'min(1,max(0.001,(frame-105)/30))')
        parts = []
        kb = bmesh.new(); bmesh.ops.create_cone(kb, cap_ends=True, segments=24, radius1=0.17, radius2=0.17, depth=1.35); parts.append(_wobj(coll, 'kia_than', kb, (0, 0, 0.675), kk))
        kd = bmesh.new(); bmesh.ops.create_uvsphere(kd, u_segments=24, v_segments=12, radius=0.11); parts.append(_wobj(coll, 'kia_dau', kd, (0, 0, 1.5), kk))
        for sg in (-1, 1):
            ta = bmesh.new(); bmesh.ops.create_cone(ta, cap_ends=True, segments=12, radius1=0.04, radius2=0.04, depth=0.7); parts.append(_wobj(coll, f'kia_tay{sg}', ta, (0, sg * 0.21, 0.9), kk))
        for o_ in parts:
            o_.parent = kroot; o_.visible_shadow = False
    if nam and cam != 'XUYEN' and cam != 'XUYEN_CHAM':
        kk = M.solid('gt_kia', '#b0504f', 0.6)
        kx, ky = NAM[0], NAM[1] - 1.25
        kb = bmesh.new(); bmesh.ops.create_cone(kb, cap_ends=True, segments=24, radius1=0.17, radius2=0.17, depth=1.35); _wobj(coll, 'kia_than', kb, (kx, ky, 0.675 + 0.0), kk)
        kd = bmesh.new(); bmesh.ops.create_uvsphere(kd, u_segments=24, v_segments=12, radius=0.11); _wobj(coll, 'kia_dau', kd, (kx, ky, 1.5), kk)
        # tay trái (nhìn từ Nam: bên −y) đưa ngang về phía −x chỗ Nam; tay phải buông thõng
        ta = bmesh.new(); bmesh.ops.create_cone(ta, cap_ends=True, segments=12, radius1=0.04, radius2=0.04, depth=0.75); o_ = _wobj(coll, 'kia_tay_trai', ta, (kx + 0.0, ky + 0.38, 1.05), kk); o_.rotation_euler = (math.radians(-90 + 12), 0, 0)
        tb = bmesh.new(); bmesh.ops.create_cone(tb, cap_ends=True, segments=12, radius1=0.04, radius2=0.04, depth=0.7); _wobj(coll, 'kia_tay_phai', tb, (kx, ky - 0.21, 0.9), kk)
        chan_ = bmesh.new(); bmesh.ops.create_cone(chan_, cap_ends=True, segments=12, radius1=0.05, radius2=0.05, depth=0.05)
        rk = M.emission('gt_kia_vong', '#7ae8e0', 0.9)   # một vòng sóng đứng yên quanh chân (Người Kia không làm mặt nước gợn như Nam)
    # ---- camera + render
    CAMS = {k: ((v[0][0] - X.W, v[0][1], v[0][2]), (v[1][0] - X.W, v[1][1], v[1][2]), v[2], 3.0) for k, v in X.CAMERAS.items()}   # toạ độ thiết kế − W = toạ độ thế giới sau khi lật gương
    CAMS['XUYEN_CHAM'] = ((2.5 - X.W, 2.1, 1.3), (0.14 - X.W, 3.3, 0.9), 50, 2.0)   # cùng máy với KINH_NUOC_CHAM (192 khung)
    CAMS['XUYEN'] = ((2.2 - X.W, 2.0, 1.25), (0.14 - X.W, 3.3, 0.9), 50, 2.0)   # cùng máy với KINH_NUOC trong phòng thật (toạ độ thiết kế − W): cắt nối khớp khung hình
    CAMS['NAM_CHIM'] = ((-0.7, 2.3, 1.45), (-2.2, 3.26, 0.9), 32, 2.0); CAMS['TOP'] = ((-1.5, 2.0, 9.0), (-1.5, 2.0, 0.0), 24, 9.0); CAMS['GUONG_CAN'] = ((-1.2, 3.0, 1.25), (-2.8, 3.26, 0.9), 40, 1.6)
    pos, tgt, mm, fd = CAMS[cam]
    if cam in ('WIDE',) or pos[1] > X.D:   # đứng ngoài tường trước → ẩn tường trước với camera (như phòng thật)
        for ob_ in list(croom.objects):
            if ob_.name.startswith(('tuong_truoc', 'op_truoc', 'phao_truoc', 'lich_')): ob_.visible_camera = False   # tường trước + ốp + lịch treo ở mặt ngoài
    if cam == 'TOP' and ceil_:
        for fl in ('visible_camera', 'visible_shadow', 'visible_diffuse', 'visible_glossy', 'visible_transmission'): setattr(ceil_, fl, False)
    cd = bpy.data.cameras.new('cam_' + cam); cd.lens = mm; cd.sensor_width = 36; cd.dof.use_dof = True; cd.dof.aperture_fstop = 2.8
    co = bpy.data.objects.new('cam_' + cam, cd); coll.objects.link(co); co.location = pos
    co.rotation_euler = (Vector(tgt) - Vector(pos)).to_track_quat('-Z', 'Y').to_euler(); cd.dof.focus_distance = (Vector(tgt) - Vector(pos)).length; sc.camera = co
    if XC:
        # NỐI với shot KINH_NUOC / KINH_NUOC_CHAM (camera_dong.py): máy đi cùng đường, nhìn mặt gương. Phòng thật: Nam bước vào kính. Ở đây Nam trồi ra ngay mặt gương rồi bị hút chìm xuống mặt nước.
        slow = cam == 'XUYEN_CHAM'; NN = 192 if slow else 72
        tg = bpy.data.objects.new('xuyen_tg', None); coll.objects.link(tg); tg.location = tgt
        tc_ = co.constraints.new('TRACK_TO'); tc_.target = tg; tc_.track_axis = 'TRACK_NEGATIVE_Z'; tc_.up_axis = 'UP_Y'; co.rotation_euler = (0, 0, 0)
        nr = bpy.data.objects.get('nam_chim')
        if nr and nr.animation_data: nr.animation_data_clear()
        for f in range(1, NN + 1):
            t = (f - 1) / (NN - 1.0); t = t * t * (3 - 2 * t)
            co.location = ((2.5 - 0.95 * t - X.W, 2.1 - 0.2 * t, 1.3 - 0.06 * t) if slow else (2.2 - 0.4 * t - X.W, 2.0 - 0.1 * t, 1.25)); co.keyframe_insert('location', frame=f)
        if nr:
            if slow:   # trồi ra chậm, khựng, rồi chìm dần (z) — ngược nhịp bước của phòng thật
                for fr, xx, zz in ((1, -2.78, 0.3), (50, -2.7, 0.22), (80, -2.55, 0.1), (110, -2.45, 0.0), (150, -2.3, -0.3), (192, -2.1, -0.62)):
                    nr.location = (xx, NAM[1], zz); nr.keyframe_insert('location', frame=fr)
            else:
                for f in range(1, 73):
                    t = (f - 1) / 71.0; t = t * t * (3 - 2 * t); nr.location = (-2.78 + 0.7 * t, NAM[1], 0.28 - 0.9 * t); nr.keyframe_insert('location', frame=f)
        if co.animation_data and co.animation_data.action:
            ac_ = co.animation_data.action; fcs = []
            try: fcs = list(ac_.fcurves)
            except Exception:
                for ly in ac_.layers:
                    for st in ly.strips:
                        for cb in st.channelbags: fcs += list(cb.fcurves)
            for fc in fcs:
                md = fc.modifiers.new('NOISE'); md.scale = 25.0; md.strength = 0.003 if slow else 0.004; md.phase = fc.array_index * 7.0   # rung tay nhẹ
        # CHUYỂN MÀU MƯỢT: đầu shot cùng độ sáng/nhiệt màu với phòng thật → cuối shot Deep Teal vực thẳm
        lt_ = {n_: bpy.data.objects[n_].data for n_ in ('gt_tran', 'gt_glow_guong', 'gt_nuoc_phat')}
        if slow:   # đầu shot: bóng đêm ánh laptop xanh như cuối KINH_NUOC_CHAM (tối, lạnh) rồi vực thẳm
            K = {1: dict(tran=(10, (0.55, 0.9, 0.9)), glow=(10, (0.4, 0.95, 0.95)), nuoc=(5, (0.3, 0.9, 0.9)), bg=0.3, exp=1.0, den=0.012),
                 int(0.4 * NN): dict(tran=(6, (0.35, 0.85, 0.9)), glow=(6, (0.35, 0.95, 0.95)), nuoc=(3.5, (0.2, 0.9, 0.85)), bg=0.18, exp=0.85, den=0.025),
                 NN: dict(tran=(2.5, (0.25, 0.75, 0.9)), glow=(3, (0.35, 0.95, 0.95)), nuoc=(2, (0.2, 0.9, 0.85)), bg=0.08, exp=0.6, den=0.045)}
        else:
            K = {1: dict(tran=(40, (1.0, 0.95, 0.86)), glow=(14, (1.0, 0.9, 0.72)), nuoc=(8, (0.8, 0.95, 0.9)), bg=0.5, exp=1.15, den=0.006),
                 30: dict(tran=(14, (0.65, 0.92, 0.9)), glow=(8, (0.5, 0.95, 0.9)), nuoc=(5, (0.35, 0.92, 0.88)), bg=0.25, exp=0.95, den=0.02),
                 72: dict(tran=(4.5, (0.3, 0.8, 0.9)), glow=(4, (0.35, 0.95, 0.95)), nuoc=(3, (0.2, 0.9, 0.85)), bg=0.12, exp=0.7, den=0.035)}
        for fr_, kv in K.items():
            for nm_, key_ in (('gt_tran', 'tran'), ('gt_glow_guong', 'glow'), ('gt_nuoc_phat', 'nuoc')):
                d_ = lt_[nm_]; d_.energy = kv[key_][0]; d_.color = kv[key_][1]; d_.keyframe_insert('energy', frame=fr_); d_.keyframe_insert('color', frame=fr_)
            bg.inputs['Strength'].default_value = kv['bg']; bg.inputs['Strength'].keyframe_insert('default_value', frame=fr_)
            vs.inputs['Density'].default_value = kv['den']; vs.inputs['Density'].keyframe_insert('default_value', frame=fr_)
            sc.view_settings.exposure = kv['exp']; sc.view_settings.keyframe_insert('exposure', frame=fr_)
        if slow:   # đèn quầng chập chờn nhẹ như tim đập
            for nm_ in ('gt_tran', 'gt_glow_guong'):
                dd = lt_[nm_].driver_add('energy').driver if False else None
        sc.frame_start, sc.frame_end = 1, NN
    sc.render.engine = 'CYCLES'; X._thiet_bi(sc); sc.cycles.samples = 64; sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 8; sc.cycles.glossy_bounces = 6; sc.cycles.volume_bounces = 2; sc.cycles.volume_step_rate = 1.5; sc.cycles.volume_max_steps = 256
    sc.render.resolution_x, sc.render.resolution_y = res; sc.render.resolution_percentage = 100
    sc.view_settings.view_transform = 'AgX'; sc.view_settings.exposure = 0.7
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
