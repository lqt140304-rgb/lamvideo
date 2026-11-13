"""Bầu trời có mặt trời / mặt trăng / mây trôi, xe máy chạy trong sân và hẻm, người đi bộ, chim bay — mọi chuyển động bằng driver theo khung hình
(không tốn keyframe, lặp vòng). Gọi từ moi_truong.build: canh_dong.build(X, coll, night, mode). Đối tượng bắt đầu `env_` để camera ngoài phòng không ẩn."""
import bpy, bmesh, math, random
from mathutils import Vector


def _drv(ob, path, idx, expr):
    d = ob.driver_add(path, idx).driver; d.type = 'SCRIPTED'; d.expression = expr


def _vis(ob, shadow=False, diffuse=False, glossy=False):
    ob.visible_shadow = shadow; ob.visible_diffuse = diffuse; ob.visible_glossy = glossy; ob.visible_transmission = False


def _fade(root, u, span, edge=3.0):
    """Thu nhỏ dần về 0 ở hai đầu vòng lặp để xe/người không 'nhảy' (mọc/biến mất êm thay vì teleport)."""
    for ax in range(3): _drv(root, 'scale', ax, f'max(0.001,min(1,{u}/{edge},({span:.1f}-{u})/{edge}))')


def build(X, coll, night, mode):
    M = X.M; W, T = X.W, X.T; GZ = -2.92
    rnd = random.Random(2026)
    cache = {}
    def mat(c, r=0.7, mt=0.0):
        k = (c, r, mt)
        if k not in cache: cache[k] = M.solid('cd_' + c.strip('#') + f'_{int(r*10)}_{int(mt*10)}', c, r, mt)
        return cache[k]
    def link(ob): coll.objects.link(ob); return ob
    def wsphere(name, loc, r, material, scale=(1, 1, 1)):
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=12, radius=r)
        return _wobj(name, bm, loc, material, scale)
    def _wobj(name, bm, loc, material, scale=(1, 1, 1), parent=None):
        me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
        for p in me.polygons: p.use_smooth = True
        ob = bpy.data.objects.new(name, me); ob.location = loc; ob.scale = scale; ob.data.materials.append(material)
        coll.objects.link(ob)
        if parent is not None: ob.parent = parent
        return ob

    def may_mat(color, st):
        mt = bpy.data.materials.new('cd_may_mem'); mt.use_nodes = True; nt = mt.node_tree; N, L = nt.nodes, nt.links
        for n_ in list(N): N.remove(n_)
        em = N.new('ShaderNodeEmission'); em.inputs['Color'].default_value = M._hex(color); em.inputs['Strength'].default_value = st
        tr = N.new('ShaderNodeBsdfTransparent'); lw = N.new('ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = 0.5
        rp = N.new('ShaderNodeValToRGB'); rp.color_ramp.elements[0].position = 0.08; rp.color_ramp.elements[1].position = 0.85   # rìa mờ dần
        L.new(lw.outputs['Facing'], rp.inputs['Fac'])
        mx = N.new('ShaderNodeMixShader'); L.new(rp.outputs['Color'], mx.inputs['Fac']); L.new(em.outputs[0], mx.inputs[1]); L.new(tr.outputs[0], mx.inputs[2])
        ot = N.new('ShaderNodeOutputMaterial'); L.new(mx.outputs[0], ot.inputs['Surface']); return mt
    # ------------------------------------------------------------ mặt trời / mặt trăng nhìn thấy được (đĩa phát sáng ở xa, chỉ camera thấy)
    TM = X.TIME_MODES.get(mode, {}) if not night else {}
    if night:
        d = Vector((0.30, -0.45, 0.84)).normalized() * 220
        for nm, rr, col, st, k_ in (('trang', 8.0, '#fbf8ea', 45.0, 1.0), ('trang_quang', 20.0, '#8fa2d8', 0.5, 1.06)):
            ob = wsphere('env_cd_' + nm, (d.x * k_, d.y * k_, d.z * k_), rr, M.emission('cd_' + nm, col, st) if nm == 'trang' else may_mat(col, st)); _vis(ob)
            ob.visible_camera = True
    elif mode != 'rain':
        dirw = Vector(TM.get('dirw', (0.35, -0.6, -0.7))).normalized()
        pos = -dirw * 220
        col = {'dawn': '#fff1d0', 'sunset': '#ffb060'}.get(mode, '#fffbe8')
        for nm, rr, c2, st, k_ in (('mat_troi', 5.5, col, 400.0, 1.0), ('mat_troi_quang', 22.0, col, 3.0, 1.06)):
            ob = wsphere('env_cd_' + nm, (pos.x * k_, pos.y * k_, pos.z * k_), rr, M.emission('cd_' + nm, c2, st) if nm == 'mat_troi' else may_mat(c2, st)); _vis(ob)

    # ------------------------------------------------------------ mây trôi (cụm cầu dẹt, driver trượt theo x thế giới, lặp vòng)
    tint = {'dawn': '#f6dcc8', 'sunset': '#f3b890', 'rain': '#8d949c'}.get(mode, '#f4f6f8')
    if night: tint = '#7a86aa'
    cl = may_mat(tint, 0.25 if night else (0.5 if mode == 'rain' else 1.0))
    n_cloud = 16 if mode != 'rain' else 26
    for k in range(n_cloud):
        z = rnd.uniform(70, 110) if mode != 'rain' else rnd.uniform(45, 70)
        y = rnd.uniform(-260, 120); x0 = rnd.uniform(-300, 300); sz = rnd.uniform(14, 30)
        root = bpy.data.objects.new(f'env_cd_may{k}', None); root.location = (x0, y, z); coll.objects.link(root)
        for j in range(rnd.randint(7, 11)):
            ob = wsphere(f'env_cd_may{k}_{j}', (rnd.uniform(-1.4, 1.4) * sz, rnd.uniform(-0.5, 0.5) * sz, rnd.uniform(-0.1, 0.25) * sz), sz * rnd.uniform(0.3, 0.6), cl, (1.0, 0.7, 0.22)); _vis(ob); ob.parent = root
        _drv(root, 'location', 0, f'-300+fmod({x0 + 300:.1f}+frame*0.22,600)'); _fade(root, f'fmod({x0 + 300:.1f}+frame*0.22,600)', 600.0, 40.0)

    # ------------------------------------------------------------ xe máy chạy (thân + bánh + người lái), chạy dọc +y rồi lặp
    def bike(name, lane_x, y_start, speed, span, color, helmet, direction=1):
        root = bpy.data.objects.new(name, None); coll.objects.link(root); root.location = (X.mx(lane_x), y_start, GZ)
        for dy in (-0.55, 0.55):
            X.torus(f'{name}_banh{dy}', W, dy, 0.28, 0.27, 0.07, mat('#202020', 0.8), rot=(0, math.pi / 2, 0), coll=coll).parent = root
        for dy, z0, z1, wd, cc in [(0.0, 0.35, 0.62, 0.34, color), (-0.1, 0.62, 0.72, 0.3, '#222222'), (0.5, 0.5, 1.0, 0.18, color)]:
            X.cyl(f'{name}_b{dy}', W, dy, (z0 + z1) / 2, 0.16 if wd > 0.3 else 0.07, z1 - z0, mat(cc, 0.45), coll=coll, bevel=0.02).parent = root
        X.box(f'{name}_ghi', W - 0.25, W + 0.25, 0.5, 0.55, 1.0, 1.03, mat('#555555', 0.4, 0.8), coll=coll).parent = root   # ghi đông
        dk = mat('#1c1c1c', 0.6); met = mat('#8a8a86', 0.35, 0.8)
        X.box(f'{name}_yen', W - 0.12, W + 0.12, -0.5, 0.05, 0.68, 0.76, dk, bevel=0.02, coll=coll).parent = root                  # yên
        X.box(f'{name}_ch_bun_t', W - 0.07, W + 0.07, 0.45, 0.85, 0.5, 0.53, mat(color, 0.45), bevel=0.01, coll=coll).parent = root     # chắn bùn trước
        X.box(f'{name}_ch_bun_s', W - 0.1, W + 0.1, -0.85, -0.3, 0.55, 0.58, mat(color, 0.45), bevel=0.01, coll=coll).parent = root     # chắn bùn sau
        X.sphere(f'{name}_choa', W, 0.6, 0.86, 0.08, mat(color, 0.4), scale=(1, 0.8, 0.9), coll=coll).parent = root                    # chóa đèn
        for sx in (-0.24, 0.24): X.box(f'{name}_guong{sx}', W + sx - 0.03, W + sx + 0.03, 0.5, 0.52, 1.03, 1.2, met, coll=coll).parent = root   # gương chiếu hậu
        X.cyl(f'{name}_po', W + 0.17, -0.5, 0.34, 0.035, 0.7, met, coll=coll, rot=(math.radians(90), 0, 0)).parent = root              # ống pô
        rd = mat('#c03020', 0.4)
        X.sphere(f'{name}_den_sau', W, -0.62, 0.62, 0.03, M.emission('cd_den_sau', '#ff3020', 3.0 if night else 0.6), coll=coll).parent = root
        X.sphere(f'{name}_den_truoc', W, 0.66, 0.78, 0.045, M.emission('cd_den_truoc', '#fff0c0', 25.0 if night else 1.0), coll=coll).parent = root
        # người lái: thân, đầu + mũ bảo hiểm, tay, đùi
        sk = mat('#d9a67c', 0.7); sh = mat(helmet, 0.35)
        X.cyl(f'{name}_than', W, -0.05, 1.05, 0.14, 0.5, mat(rnd.choice(['#375a8a', '#8a3a30', '#3a6a4a', '#d0b050', '#444444']), 0.9), coll=coll, rot=(math.radians(12), 0, 0)).parent = root
        X.sphere(f'{name}_dau', W, 0.05, 1.42, 0.1, sk, coll=coll).parent = root
        X.sphere(f'{name}_non', W, 0.05, 1.46, 0.115, sh, scale=(1, 1, 0.85), coll=coll).parent = root
        for sx in (-0.17, 0.17): X.cyl(f'{name}_tay{sx}', W + sx, 0.25, 1.1, 0.04, 0.5, sk, coll=coll, rot=(math.radians(-60), 0, 0)).parent = root
        for sx in (-0.12, 0.12): X.cyl(f'{name}_dui{sx}', W + sx, 0.12, 0.78, 0.06, 0.45, mat('#2a3a5a', 0.9), coll=coll, rot=(math.radians(-70), 0, 0)).parent = root
        v = rnd.random()
        if v < 0.28:   # thùng giao hàng sau yên
            X.box(f'{name}_thung', W - 0.22, W + 0.22, -0.95, -0.45, 0.78, 1.2, mat(rnd.choice(['#d84a30', '#2f8a4a', '#e0a020']), 0.5), bevel=0.02, coll=coll).parent = root
        elif v < 0.5:   # chở thêm một người phía sau
            X.cyl(f'{name}_than2', W, -0.45, 1.05, 0.13, 0.5, mat(rnd.choice(['#a85a6a', '#5a7aa8', '#d8d0b0']), 0.9), coll=coll, rot=(math.radians(8), 0, 0)).parent = root
            X.sphere(f'{name}_dau2', W, -0.42, 1.4, 0.1, sk, coll=coll).parent = root; X.sphere(f'{name}_toc2', W, -0.44, 1.43, 0.105, mat('#1a1410', 0.9), scale=(1, 1, 0.8), coll=coll).parent = root
        elif v < 0.65:   # giỏ trước + áo mưa
            X.box(f'{name}_gio', W - 0.16, W + 0.16, 0.42, 0.62, 0.78, 0.95, mat('#8a6a3a', 0.9), coll=coll).parent = root
        if rnd.random() < 0.3: root.scale = (1.0, rnd.uniform(0.95, 1.08), rnd.uniform(0.95, 1.1))
        if direction < 0: root.rotation_euler = (0, 0, math.pi)
        for ob in root.children: ob.visible_shadow = False
        _drv(root, 'location', 1, f'{-12 if direction > 0 else 55}+{direction}*fmod({y_start:.1f}+frame*{speed:.3f},{span:.1f})')
        _fade(root, f'fmod({y_start:.1f}+frame*{speed:.3f},{span:.1f})', span)
        root.location[1] = y_start
        return root
    cols = ['#b3362c', '#1f3a5f', '#d8d2c2', '#2f2f2f', '#e0a030', '#3d6e5a']
    hel = ['#e8e8e0', '#d83a30', '#2a4a8a', '#f0c030', '#1a1a1a']
    # sân: đường 2 làn rộng 3,45 m — làn đông (x=−3,65) đi +y, làn tây (x=−5,35) đi −y; mỗi làn chạy cùng tốc độ, cách nhau ≥ 9 m nên không chồng lên nhau
    for k, yy in enumerate((16.0, 26.0, 36.0, 46.0)): bike(f'env_cd_xm_san{k}', -3.65, yy, 0.2, 62.0, cols[k % 6], hel[k % 5], 1)
    for k, yy in enumerate((40.0, 58.0)): bike(f'env_cd_xm_san_nam{k}', -5.35, yy, 0.16, 62.0, cols[(k + 2) % 6], hel[(k + 3) % 5], -1)
    for k in range(3):   # hẻm bên cửa sổ phòng Nam
        bike(f'env_cd_xm_hem{k}', W + T + 1.85, k * 17.0, 0.2 + 0.04 * k, 56.0, cols[(k + 2) % 6], hel[(k + 1) % 5], 1)

    # ------------------------------------------------------------ ô tô nhỏ chạy chậm giữa sân (thân, cabin kính, 4 bánh, đèn, cản)
    def oto(name, lane_x, y_start, speed, span, color, direction=1, van=False):
        root = bpy.data.objects.new(name, None); coll.objects.link(root); root.location = (X.mx(lane_x), y_start, GZ)
        body, glass, blk = mat(color, 0.3, 0.3), mat('#1c2630', 0.05), mat('#1a1a1a', 0.7)
        def P(nm, ob): ob.parent = root; ob.visible_shadow = True; return ob
        P('than', X.box(f'{name}_than', W - 0.75, W + 0.75, -2.0, 2.0, 0.3, 0.95, body, bevel=0.06, coll=coll))
        P('cabin', X.box(f'{name}_cabin', W - 0.7, W + 0.7, -1.95 if van else -1.1, 0.95, 0.95, 1.85 if van else 1.5, body, bevel=0.08, coll=coll))
        P('kinh', X.box(f'{name}_kinh', W - 0.72, W + 0.72, -1.0 if not van else -0.2, 0.85, 1.02, 1.42 if not van else 1.5, glass, bevel=0.03, coll=coll))
        if van: P('ke_hang', X.box(f'{name}_ke', W - 0.6, W + 0.6, -1.9, -0.3, 1.86, 1.92, mat('#555555', 0.5, 0.6), coll=coll))
        P('cot', X.box(f'{name}_cot', W - 0.73, W + 0.73, -0.12, 0.0, 1.0, 1.44, body, coll=coll))
        P('can_t', X.box(f'{name}_can_t', W - 0.78, W + 0.78, 1.9, 2.08, 0.34, 0.5, blk, bevel=0.03, coll=coll)); P('can_s', X.box(f'{name}_can_s', W - 0.78, W + 0.78, -2.08, -1.9, 0.34, 0.5, blk, bevel=0.03, coll=coll))
        for sx in (-0.7, 0.7):
            for dy in (-1.2, 1.25):
                P('banh', X.cyl(f'{name}_banh{sx}{dy}', W + sx, dy, 0.32, 0.32, 0.22, blk, axis='X', coll=coll))
            P('den_t', X.sphere(f'{name}_den_t{sx}', W + sx * 0.7, 2.0, 0.7, 0.09, M.emission('cd_den_truoc', '#fff0c0', 40.0 if night else 1.2), coll=coll, scale=(1, 0.5, 0.7)))
            P('den_s', X.sphere(f'{name}_den_s{sx}', W + sx * 0.7, -2.0, 0.7, 0.08, M.emission('cd_den_sau', '#ff3020', 5.0 if night else 0.7), coll=coll, scale=(1, 0.5, 0.7)))
        if direction < 0: root.rotation_euler = (0, 0, math.pi)
        _drv(root, 'location', 1, f'{-12 if direction > 0 else 55}+{direction}*fmod({y_start:.1f}+frame*{speed:.3f},{span:.1f})')
        _fade(root, f'fmod({y_start:.1f}+frame*{speed:.3f},{span:.1f})', span, 4.0)
        root.location[1] = y_start
    oto('env_cd_oto0', -3.65, 4.0, 0.2, 62.0, '#c9c9c4', 1)
    oto('env_cd_oto1', -5.35, 12.0, 0.16, 62.0, '#3a5a7a', -1, van=True)

    # ------------------------------------------------------------ người đi bộ: thân, đầu, 2 chân + 2 tay đung đưa (driver sin theo khung hình)
    def nguoi(name, lane_x, y0, speed, span, shirt, trouser, direction=1, kid=False):
        sc = (0.72 if kid else rnd.uniform(0.93, 1.07))
        root = bpy.data.objects.new(name, None); coll.objects.link(root); root.location = (X.mx(lane_x), y0, GZ + (0.08 if lane_x < -6 else 0.0))
        sk = mat('#d9a67c', 0.7)
        def part(nm, fn, *a, **kw): ob = fn(f'{name}_{nm}', *a, **kw); ob.parent = root; ob.visible_shadow = False; return ob
        part('than', X.cyl, W, 0, (0.95) * sc, 0.15 * sc, 0.55 * sc, mat(shirt, 0.9), coll=coll)
        part('dau', X.sphere, W, 0, 1.4 * sc, 0.11 * sc, sk, coll=coll)
        part('toc', X.sphere, W, -0.01, 1.43 * sc, 0.115 * sc, mat(rnd.choice(['#1a1410', '#3a2a1a', '#5a4a3a', '#8a8a8a']), 0.9), scale=(1, 1, 0.8), coll=coll)
        r_ = rnd.random()
        if r_ < 0.35: part('tui', X.box, W + 0.13 * sc, W + 0.2 * sc, -0.1, 0.12, 0.7 * sc, 1.05 * sc, mat(rnd.choice(['#8a3a2a', '#2a4a6a', '#d8c070']), 0.7), coll=coll)   # túi đeo
        elif r_ < 0.55: part('non_luoi_trai', X.sphere, W, 0, 1.47 * sc, 0.12 * sc, mat(rnd.choice(['#d83a30', '#2a3a5a', '#e8e0c0']), 0.8), scale=(1, 1, 0.5), coll=coll)   # mũ lưỡi trai
        part('co', X.cyl, W, 0, 1.26 * sc, 0.045 * sc, 0.09 * sc, sk, coll=coll)
        part('hong', X.box, W - 0.15 * sc, W + 0.15 * sc, -0.08 * sc, 0.08 * sc, 0.64 * sc, 0.76 * sc, mat(trouser, 0.85), bevel=0.01, coll=coll)
        for sd in (-1, 1): part(f'vai{sd}', X.sphere, W + sd * 0.17 * sc, 0, 1.17 * sc, 0.06 * sc, mat(shirt, 0.9), coll=coll)
        for side, ph in ((-1, 0.0), (1, math.pi)):
            for nm, w, zc, ln, cc in (('chan', 0.07, 0.35, 0.7, trouser), ('tay', 0.045, 1.0, 0.55, shirt)):
                hip_z = (0.72 if nm == 'chan' else 1.18) * sc
                piv = bpy.data.objects.new(f'{name}_{nm}{side}_piv', None); coll.objects.link(piv); piv.parent = root; piv.location = (side * 0.1 * sc * (1 if nm == 'chan' else 1.8), 0, hip_z)
                ob = X.cyl(f'{name}_{nm}{side}', 0, 0, 0, w * sc, ln * sc, (mat(cc, 0.8) if nm == 'chan' else sk), coll=coll); ob.parent = piv
                ob.location = (0.0, 0.0, -ln * sc / 2); ob.visible_shadow = False
                if nm == 'chan':
                    ft = X.box(f'{name}_chan{side}_giay', W - 0.045 * sc, W + 0.045 * sc, -0.05 * sc, 0.14 * sc, -ln * sc - 0.01, -ln * sc + 0.06, mat('#222222', 0.8), bevel=0.01, coll=coll); ft.parent = piv; ft.visible_shadow = False
                else:
                    hd = X.sphere(f'{name}_tay{side}_ban', W, 0, -ln * sc, 0.04 * sc, sk, coll=coll); hd.parent = piv; hd.visible_shadow = False
                piv.rotation_mode = 'XYZ'; _drv(piv, 'rotation_euler', 0, f'{0.5 if nm == "chan" else 0.35}*sin(frame*{0.36 * speed / 0.058:.3f}+{ph:.2f}+{y0:.1f})')
        if direction < 0: root.rotation_euler = (0, 0, math.pi)
        _drv(root, 'location', 1, f'{-11 if direction > 0 else 30}+{direction}*fmod({y0:.1f}+frame*{speed:.4f},{span:.1f})')
        _fade(root, f'fmod({y0:.1f}+frame*{speed:.4f},{span:.1f})', span, 2.0)
        root.location[1] = y0
    shirts = ['#4a78a8', '#c4503a', '#6a9a5a', '#e0c050', '#7a5a8a', '#eeeeee']; tr = ['#2a2a3a', '#4a4a50', '#3a4a6a']
    for k in range(5): nguoi(f'env_cd_nguoi{k}', -6.5, k * 8.0, 0.05, 41.0, shirts[k % 6], tr[k % 3], 1, kid=(k == 3))
    for k in range(2): nguoi(f'env_cd_nguoi_hem{k}', W + T + 1.3, 10 + k * 14, 0.05, 36.0, shirts[(k + 3) % 6], tr[k], 1)

    # ------------------------------------------------------------ chim bay ngang bầu trời (thân + 2 cánh vỗ)
    bm_mat = mat('#2a2a30', 0.8)
    for k in range(7):
        root = bpy.data.objects.new(f'env_cd_chim{k}', None); coll.objects.link(root)
        z = rnd.uniform(14, 34); y0 = rnd.uniform(-30, 40); x0 = rnd.uniform(-60, 20)
        root.location = (x0, y0, z)
        body = bmesh.new(); bmesh.ops.create_uvsphere(body, u_segments=10, v_segments=6, radius=0.18); b = _wobj(f'env_cd_chim{k}_than', body, (0, 0, 0), bm_mat, (1, 2.2, 0.8), root)
        for side in (-1, 1):
            wb = bmesh.new(); bmesh.ops.create_cube(wb, size=1.0)
            for v in wb.verts: v.co = Vector((v.co.x * 0.6 + side * 0.3, v.co.y * 0.25, v.co.z * 0.02))
            piv = bpy.data.objects.new(f'env_cd_chim{k}_piv{side}', None); coll.objects.link(piv); piv.parent = root
            w = _wobj(f'env_cd_chim{k}_canh{side}', wb, (0, 0, 0), bm_mat, (1, 1, 1), piv); piv.rotation_mode = 'XYZ'
            _drv(piv, 'rotation_euler', 1, f'{side}*0.7*sin(frame*0.55+{k})')
        for o in [b] + list(root.children): _vis(o)
        _drv(root, 'location', 0, f'-70+fmod({x0 + 70:.1f}+frame*{0.18 + 0.02 * k:.3f},140)'); _fade(root, f'fmod({x0 + 70:.1f}+frame*{0.18 + 0.02 * k:.3f},140)', 140.0, 10.0)
