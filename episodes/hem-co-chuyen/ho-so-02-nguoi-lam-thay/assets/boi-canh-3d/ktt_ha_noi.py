"""Chi tiết khu tập thể Hà Nội + hàng rong: vết ố nước mưa / rêu / mảng tường gạch lộ vì bong vữa, chuồng cọp, sào phơi đồ, hộp công tơ, ống nước,
điều hoà cục nóng, hoa giấy trên lan can, cờ đỏ sao vàng, biển số nhà, loa phường, quán trà đá, xe bánh mì, gánh hàng rong và xe đạp chở hoa (chạy).
Gọi sau canh_dong.build: ktt_ha_noi.build(X, coll, night, mode). Đối tượng bắt đầu `env_ktt_`."""
import bpy, bmesh, math, random, os
from mathutils import Vector, Matrix
from canh_dong import _drv, _fade


def build(X, coll, night, mode):
    M = X.M; box, cyl, sphere, torus = X.box, X.cyl, X.sphere, X.torus
    W, T, H = X.W, X.T, X.H; GZ = -2.92; FL = 2.92; EX = -T; X0 = -1.45; Y0 = -0.6; Y1 = X.HL_Y1; BACK = -9.2; BX = -7.6; YR = -13.1; z3 = H + 0.12
    rnd = random.Random(1010); cache = {}
    def B(n, *a, **kw): return box('env_ktt_' + n, *a, **kw)
    def mat(c, r=0.7, mt=0.0):
        k = (c, r, mt)
        if k not in cache: cache[k] = M.solid('ktt_' + c.strip('#') + f'_{int(r*10)}_{int(mt*10)}', c, r, mt)
        return cache[k]

    # ------------------------------------------------------------ vật liệu: vết ố (mờ dần, mép loang bằng noise), mảng gạch lộ
    def stain_mat(color, alpha, bottom=False):
        k = ('st', color, alpha, bottom)
        if k in cache: return cache[k]
        mt = bpy.data.materials.new('ktt_vet_o'); mt.use_nodes = True; nt = mt.node_tree; N, L = nt.nodes, nt.links
        for n_ in list(N): N.remove(n_)
        df = N.new('ShaderNodeBsdfDiffuse'); df.inputs['Color'].default_value = M._hex(color); df.inputs['Roughness'].default_value = 0.95
        tr = N.new('ShaderNodeBsdfTransparent')
        tc = N.new('ShaderNodeTexCoord'); sp = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Generated'], sp.inputs['Vector'])
        gz = N.new('ShaderNodeMath'); gz.operation = 'SUBTRACT' if bottom else 'ADD'
        if bottom: gz.inputs[0].default_value = 1.0; L.new(sp.outputs['Z'], gz.inputs[1])
        else: L.new(sp.outputs['Z'], gz.inputs[0]); gz.inputs[1].default_value = 0.0
        nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 9.0; nz.inputs['Detail'].default_value = 5.0; L.new(tc.outputs['Object'], nz.inputs['Vector'])
        rp = N.new('ShaderNodeValToRGB'); rp.color_ramp.elements[0].position = 0.38; rp.color_ramp.elements[1].position = 0.62; L.new(nz.outputs['Fac'], rp.inputs['Fac'])
        m1 = N.new('ShaderNodeMath'); m1.operation = 'MULTIPLY'; L.new(gz.outputs[0], m1.inputs[0]); L.new(rp.outputs['Color'], m1.inputs[1])
        m2 = N.new('ShaderNodeMath'); m2.operation = 'MULTIPLY'; m2.inputs[1].default_value = alpha; L.new(m1.outputs[0], m2.inputs[0])
        mx = N.new('ShaderNodeMixShader'); L.new(m2.outputs[0], mx.inputs['Fac']); L.new(tr.outputs[0], mx.inputs[1]); L.new(df.outputs[0], mx.inputs[2])
        ot = N.new('ShaderNodeOutputMaterial'); L.new(mx.outputs[0], ot.inputs['Surface']); cache[k] = mt; return mt
    def brick_mat(plane):
        k = ('br', plane)
        if k in cache: return cache[k]
        mt = bpy.data.materials.new('ktt_gach_lo'); mt.use_nodes = True; nt = mt.node_tree; N, L = nt.nodes, nt.links
        for n_ in list(N): N.remove(n_)
        tc = N.new('ShaderNodeTexCoord'); sp = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Object'], sp.inputs['Vector'])
        cb = N.new('ShaderNodeCombineXYZ'); a, b = ('Y', 'Z') if plane == 'yz' else ('X', 'Z')
        L.new(sp.outputs[a], cb.inputs['X']); L.new(sp.outputs[b], cb.inputs['Y'])
        br = N.new('ShaderNodeTexBrick'); br.inputs['Scale'].default_value = 2.3; br.inputs['Mortar Size'].default_value = 0.025; br.inputs['Brick Width'].default_value = 0.5; br.inputs['Row Height'].default_value = 0.3
        br.inputs['Color1'].default_value = M._hex('#8e4a36'); br.inputs['Color2'].default_value = M._hex('#a85f45'); br.inputs['Mortar'].default_value = M._hex('#bdb5a4')
        L.new(cb.outputs[0], br.inputs['Vector'])
        df = N.new('ShaderNodeBsdfDiffuse'); df.inputs['Roughness'].default_value = 0.95; L.new(br.outputs['Color'], df.inputs['Color'])
        ot = N.new('ShaderNodeOutputMaterial'); L.new(df.outputs[0], ot.inputs['Surface']); cache[k] = mt; return mt

    # mặt tường: 'x-' (hướng −x thiết kế), 'x+', 'y+' ; pos = toạ độ mặt tường; u0 dọc theo trục còn lại; ztop/zbot theo z
    def lop(name, face, pos, u0, u1, zb, zt, material, t=0.004):
        if face == 'x-': return B(name, pos - t, pos, u0, u1, zb, zt, material, coll=coll)
        if face == 'x+': return B(name, pos, pos + t, u0, u1, zb, zt, material, coll=coll)
        return B(name, u0, u1, pos, pos + t, zb, zt, material, coll=coll)
    def vet(face, pos, ulo, uhi, zlo, zhi, n, seed):
        r = random.Random(seed)
        for i in range(n):
            u = r.uniform(ulo, uhi); w = r.uniform(0.12, 0.5); h = r.uniform(0.6, min(1.9, zhi - zlo)); zt = r.uniform(zlo + h, zhi)
            col, al, bot = r.choice([('#4a4034', 0.6, False), ('#5a4c38', 0.5, False), ('#b59a5c', 0.45, False), ('#3c3a30', 0.55, False)]) + (False,) if False else (None, None, None)
            c_, a_ = r.choice([('#4a4034', 0.6), ('#5a4c38', 0.5), ('#b59a5c', 0.45), ('#3c3a30', 0.55)])
            lop(f'o{seed}_{i}', face, pos, u, u + w, zt - h, zt, stain_mat(c_, a_))
        for i in range(max(2, n // 4)):   # rêu xanh sát chân tường
            u = r.uniform(ulo, uhi); w = r.uniform(0.3, 0.9)
            lop(f'reu{seed}_{i}', face, pos, u, u + w, zlo, zlo + r.uniform(0.35, 0.8), stain_mat('#58703a', 0.7, True), t=0.005)
    def gach(face, pos, ulo, uhi, zlo, zhi, n, seed):
        r = random.Random(seed); plane = 'yz' if face.startswith('x') else 'xz'
        for i in range(n):
            u = r.uniform(ulo, uhi); w = r.uniform(0.45, 1.3); h = r.uniform(0.35, 0.95); z0 = r.uniform(zlo, zhi - h)
            for j in range(3):   # mảng bong vữa hình không đều: 3 hình chữ nhật chồng lệch
                du, dz = r.uniform(-0.12, 0.12), r.uniform(-0.1, 0.1); ww, hh = w * r.uniform(0.55, 1.0), h * r.uniform(0.55, 1.0)
                lop(f'gach{seed}_{i}_{j}', face, pos, u + du, u + du + ww, z0 + dz, z0 + dz + hh, brick_mat(plane), t=0.006 + 0.001 * j)
            lop(f'gach_o{seed}_{i}', face, pos, u - 0.2, u + w + 0.2, z0 + h * 0.6, z0 + h + 0.45, stain_mat('#5a4c38', 0.5), t=0.003)   # vết ố trên chỗ bong

    # tường nhà trọ phía sân (tầng trệt + tầng 3), nhà đối diện, nhà cuối sân
    vet('x-', EX, Y0, Y1 - 0.5, GZ, -0.1, 26, 1); gach('x-', EX, Y0 + 0.5, Y1 - 1, GZ + 0.2, -0.5, 6, 2)
    vet('x-', EX, Y0, Y1 - 0.5, z3, z3 + 2.8, 18, 3); gach('x-', EX, Y0 + 0.5, Y1 - 1, z3 + 0.3, z3 + 2.4, 3, 4)
    for fl in range(4):
        zb = GZ + fl * FL; vet('x+', BACK, Y0 - 11, Y1 + 11, zb + 0.2, zb + FL - 0.2, 12, 10 + fl); gach('x+', BACK, Y0 - 10, Y1 + 10, zb + 0.3, zb + 2.3, 2, 20 + fl)
    vet('y+', YR, -15, 1.5, GZ, GZ + FL * 4, 28, 30); gach('y+', YR, -15, 1.0, GZ + 0.3, GZ + FL * 3, 7, 31)

    # ------------------------------------------------------------ chuồng cọp ở nhà cuối sân (ban công bọc lưới sắt, mái tôn dốc)
    steel = mat('#2e3234', 0.5, 0.7); ton = mat('#8c8f86', 0.55, 0.6); rust = mat('#7a4a30', 0.8, 0.4)
    for k, (xc, fl) in enumerate([(-7.0, 1), (-4.5, 2), (-2.0, 3), (-6.0, 3), (-3.3, 1), (-1.2, 2)]):
        zb = GZ + fl * FL; wd = rnd.choice([1.6, 2.0, 2.4]); x0 = xc - wd / 2; yf = YR + 0.95
        B(f'cg_trai{k}', x0, x0 + 0.03, YR, yf, zb, zb + 1.9, steel, coll=coll); B(f'cg_phai{k}', x0 + wd - 0.03, x0 + wd, YR, yf, zb, zb + 1.9, steel, coll=coll)
        for i in range(int(wd / 0.13) + 1): B(f'cg_song{k}_{i}', x0 + i * 0.13, x0 + i * 0.13 + 0.02, yf, yf + 0.02, zb, zb + 1.85, steel, coll=coll)
        for z in (zb + 0.6, zb + 1.25, zb + 1.85): B(f'cg_ngang{k}_{z:.1f}', x0, x0 + wd, yf, yf + 0.025, z, z + 0.025, steel, coll=coll)
        B(f'cg_mai{k}', x0 - 0.1, x0 + wd + 0.1, YR, yf + 0.2, zb + 1.88, zb + 1.91, ton, coll=coll, rot=(math.radians(-8), 0, 0), pivot=(xc, YR, zb + 1.9))
        for i in range(3): B(f'cg_dohu{k}_{i}', x0 + 0.2 + i * (wd / 3), x0 + 0.5 + i * (wd / 3), yf - 0.4, yf - 0.1, zb + 0.0, zb + 0.35, mat(rnd.choice(['#b3452f', '#3b6ea5', '#d8d0b0']), 0.6), bevel=0.02, coll=coll)   # đồ đạc chất trong lồng
        if rnd.random() < 0.7:  # chậu cây cảnh treo
            sphere(f'env_ktt_cg_cay{k}', x0 + wd * 0.5, yf - 0.15, zb + 1.5, 0.17, mat('#4f7a3a', 0.9), scale=(1, 1, 0.8), coll=coll)
    # khe giữa các cửa tầng 3 (cửa không đều nhau) → đặt sào phơi / điều hoà ở khe đủ rộng, mỗi chỗ một kiểu, bỏ trống nhiều chỗ
    doors = getattr(X, 'DOORS3', []) or [(1.0 + i * 2.55, 1.9 + i * 2.55) for i in range(9)]
    gaps = [(doors[i][1], doors[i + 1][0]) for i in range(len(doors) - 1) if doors[i + 1][0] - doors[i][1] > 0.95]
    rnd.shuffle(gaps)
    sao_n = ac_n = 0
    for g0, g1 in gaps:
        gw = g1 - g0; r_ = rnd.random()
        if r_ < 0.3 and sao_n < 4:   # sào phơi + đồ phơi (khác nhau mỗi chỗ)
            sao_n += 1; a = g0 + gw * rnd.uniform(0.3, 0.7); zz = z3 + rnd.choice([2.3, 2.4]); ln = rnd.uniform(0.9, 1.5)
            cyl(f'env_ktt_sao{sao_n}', EX - ln / 2 - 0.05, a, zz, 0.014, ln, mat('#a8905a', 0.7), axis='X', coll=coll)
            kind = rnd.choice(['ao', 'ga', 'quan', 'khan'])
            if kind == 'ga': B(f'ga_phoi{sao_n}', EX - ln - 0.05, EX - 0.1, a - 0.01, a + 0.01, zz - 0.95, zz, mat(rnd.choice(['#a8c4d8', '#e0b8c0', '#d8d8b8']), 0.95), coll=coll)
            else:
                for j in range(rnd.randint(2, 5)):
                    c_ = rnd.choice(['#4a78a8', '#c4503a', '#d8d0b0', '#6a9a5a', '#e0c050', '#7a5a8a']) if kind != 'quan' else rnd.choice(['#3a5a8a', '#2a3a5a', '#5a7aa8'])
                    hh = {'ao': 0.62, 'quan': 0.85, 'khan': 0.4}[kind]; ww = {'ao': 0.28, 'quan': 0.18, 'khan': 0.3}[kind]
                    xx = EX - 0.2 - j * (ln / max(rnd.randint(2, 5), 2)); B(f'phoi{sao_n}_{j}', xx - ww, xx, a - 0.01, a + 0.01, zz - hh, zz, mat(c_, 0.95), coll=coll)
        elif r_ < 0.55 and ac_n < 3 and gw > 1.1:   # điều hoà cục nóng (kích thước/màu khác nhau)
            ac_n += 1; aw = rnd.uniform(0.6, 0.85); a = g0 + (gw - aw) * rnd.uniform(0.2, 0.8); zz = z3 + rnd.choice([1.7, 1.9, 2.1])
            B(f'dh{ac_n}', EX - rnd.uniform(0.28, 0.4), EX, a, a + aw, zz, zz + rnd.uniform(0.45, 0.6), mat(rnd.choice(['#d8d6cc', '#c8c8c0', '#e8e4d8']), 0.5), bevel=0.02, coll=coll)
            cyl(f'env_ktt_dh_quat{ac_n}', EX - 0.345, a + aw * 0.45, zz + 0.25, 0.17, 0.01, mat('#2a2a2a', 0.5), axis='X', coll=coll)
    for k in range(6):
        B(f'cong_to{k}', EX - 0.1, EX, 7.0 + 0.22 * k, 7.0 + 0.22 * k + 0.17, GZ + 1.9, GZ + 2.2, mat('#9aa0a0', 0.5, 0.2), bevel=0.01, coll=coll)
        B(f'cong_to_kinh{k}', EX - 0.105, EX - 0.1, 7.02 + 0.22 * k, 7.0 + 0.22 * k + 0.15, GZ + 2.0, GZ + 2.12, mat('#2a3a3a', 0.1), coll=coll)
    for yy in (6.7, 13.0, 3.55): cyl(f'env_ktt_ong_nuoc{yy}', EX - 0.05, yy, (GZ + z3 + 2.0) / 2, 0.04, z3 + 2.0 - GZ, mat('#d8d4c8', 0.5), coll=coll)
    try:
        font = None
        for fp in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 'C:/Windows/Fonts/arialbd.ttf'):
            if os.path.exists(fp): font = bpy.data.fonts.load(fp); break
    except Exception: font = None
    def chu(name, txt, size, x, y, z, col):
        try:
            cu = bpy.data.curves.new('env_ktt_' + name, 'FONT'); cu.body = txt; cu.size = size; cu.extrude = 0.0005; cu.align_x = 'CENTER'
            if font: cu.font = font
            ob = bpy.data.objects.new('env_ktt_' + name, cu); ob.data.materials.append(mat(col, 0.6))
            ob.rotation_euler = Matrix(((0, 0, 1), (1, 0, 0), (0, 1, 0))).to_euler(); ob.location = (X.mx(x), y, z); coll.objects.link(ob)
        except Exception as e: print('chữ lỗi', name, e)
    for k, (yy, tx) in enumerate([(7.65, 'A5'), (12.2, 'P.12')]):   # biển số nhà xanh viền trắng
        B(f'bien_so{k}', EX - 0.03, EX, yy - 0.2, yy + 0.2, GZ + 1.4, GZ + 1.7, mat('#2f5f9a', 0.5), bevel=0.01, coll=coll)
        chu(f'bien_so_chu{k}', tx, 0.12, EX - 0.035, yy, GZ + 1.48, '#f4f4ea')
    for yy in (5.0, 17.0): # loa phường
        cyl(f'env_ktt_loa{yy}', EX - 0.15, yy, z3 + 2.5, 0.12, 0.3, mat('#8a8e8a', 0.4, 0.6), axis='X', coll=coll); B(f'loa_gia{yy}', EX - 0.04, EX, yy - 0.04, yy + 0.04, z3 + 2.4, z3 + 2.6, steel, coll=coll)
    # hoa giấy + chậu trên lan can tầng 3, cờ đỏ sao vàng
    yy = rnd.uniform(1.0, 2.0)
    while yy < Y1 - 1.5:   # chậu cây trên lan can: khoảng cách và loại cây ngẫu nhiên, có chỗ để trống
        yy += rnd.uniform(1.4, 4.5)
        if rnd.random() < 0.35: continue
        zt = z3 + 1.04; kind = rnd.choice(['hoa_giay', 'la', 'sen_da', 'thung_rau']); xp = X0 + rnd.uniform(0.05, 0.1)
        if kind == 'thung_rau':   # thùng xốp trồng rau
            B(f'thung_xop{yy:.1f}', xp - 0.2, xp + 0.2, yy - 0.15, yy + 0.15, zt, zt + 0.2, mat('#e8e4d8', 0.7), coll=coll)
            for j in range(6): sphere(f'env_ktt_rau_lan{yy:.1f}_{j}', xp + rnd.uniform(-0.15, 0.15), yy + rnd.uniform(-0.1, 0.1), zt + 0.24, 0.07, mat('#5a9a3a', 0.8), coll=coll)
            continue
        cyl(f'env_ktt_chau{yy:.1f}', xp, yy, zt + 0.12, 0.13 if kind != 'sen_da' else 0.09, 0.24 if kind != 'sen_da' else 0.16, mat(rnd.choice(['#b0623a', '#8a8a82', '#3a6a8a']), 0.85), coll=coll)
        cols_ = {'hoa_giay': ['#d8387a', '#e0508a', '#4f7a3a'], 'la': ['#4f7a3a', '#6aa04a', '#3a6a3a'], 'sen_da': ['#8aa86a', '#a8c08a']}[kind]
        for j in range(8 if kind == 'hoa_giay' else 5): sphere(f'env_ktt_cay{yy:.1f}_{j}', xp + rnd.uniform(-0.15, 0.2), yy + rnd.uniform(-0.25, 0.25), zt + 0.3 + rnd.uniform(-0.12, 0.3 if kind != 'sen_da' else 0.0), rnd.uniform(0.06, 0.1 if kind != 'la' else 0.14), mat(rnd.choice(cols_), 0.8), coll=coll)
    for k, yy in enumerate((4.2, 15.5)):
        cyl(f'env_ktt_co_cot{k}', X0 - 0.25, yy + 0.5, z3 + 1.4, 0.015, 1.0, mat('#6a6a64', 0.5, 0.6), axis='Y', coll=coll)
        B(f'co{k}', X0 - 0.27, X0 - 0.265, yy, yy + 0.95, z3 + 0.75, z3 + 1.38, mat('#c8281e', 0.7), coll=coll)
        bm = bmesh.new(); pts = [(0.19 * math.sin(2 * math.pi * i / 10) * (1 if i % 2 == 0 else 0.42), 0.19 * math.cos(2 * math.pi * i / 10) * (1 if i % 2 == 0 else 0.42)) for i in range(10)]
        vs = [bm.verts.new((0, px, pz)) for px, pz in pts]; bm.faces.new(vs)
        X._mesh_obj(f'env_ktt_sao_vang{k}', bm, (X.mx(X0 - 0.277), yy + 0.475, z3 + 1.065), mat('#f2d020', 0.6), False, coll)

    # ------------------------------------------------------------ PHÂN LÀN: vỉa hè phía tây cho người đi bộ, lòng đường nhựa có vạch kẻ, vạch qua đường
    YA, YB = -12.6, 56.0
    B('via_he', -7.55, -6.25, YA, YB, GZ, GZ + 0.08, mat('#c9b88a', 0.85), coll=coll)                                  # vỉa hè nâng 8 cm, rộng 1,3 m
    B('via_he_bo', -6.28, -6.25, YA, YB, GZ, GZ + 0.085, mat('#a8a496', 0.8), coll=coll)                               # bó vỉa
    B('long_duong', -6.25, -2.8, YA, YB, GZ, GZ + 0.006, mat('#4a4a4c', 0.9), coll=coll)                                # mặt đường nhựa rộng 3,45 m (2 làn)
    wl = mat('#f0eee4', 0.7)
    for xl in (-6.2, -2.85): B(f'vach_bien{xl}', xl - 0.03, xl + 0.03, YA, YB, GZ + 0.006, GZ + 0.0085, wl, coll=coll)   # vạch biên liền
    for k in range(int((YB - YA) / 2.0)): B(f'vach_phan_lan_{k}', -4.53, -4.47, YA + 0.2 + k * 2.0, YA + 1.2 + k * 2.0, GZ + 0.006, GZ + 0.0085, wl, coll=coll)   # vạch đứt tim đường
    for k in range(5): B(f'vach_qua_duong{k}', -6.1 + k * 0.66, -5.75 + k * 0.66, -6.4, -4.0, GZ + 0.006, GZ + 0.0085, wl, coll=coll)   # vạch đi bộ qua đường
    # ------------------------------------------------------------ quán trà đá vỉa hè: bàn thấp, ghế nhựa, ô dù, ấm, bình thuỷ, cốc
    qx, qy = -2.1, -8.0
    B('quan_ban', qx - 0.3, qx + 0.3, qy - 0.4, qy + 0.4, GZ + 0.5, GZ + 0.54, mat('#6a4a30', 0.8), bevel=0.01, coll=coll)
    for sx in (-0.26, 0.26):
        for sy in (-0.36, 0.36): B(f'quan_chan{sx}{sy}', qx + sx - 0.02, qx + sx + 0.02, qy + sy - 0.02, qy + sy + 0.02, GZ, GZ + 0.5, mat('#4a3320', 0.8), coll=coll)
    for k, (dx, dy) in enumerate([(-0.5, -0.1), (-0.5, 0.3), (0.5, -0.1), (0.5, 0.3)]):
        cyl(f'env_ktt_ghe_thap{k}', qx + dx, qy + dy, GZ + 0.15, 0.17, 0.3, mat(rnd.choice(['#c24a3a', '#3b6ea5', '#e3b84a']), 0.55), coll=coll, bevel=0.02)
    cyl('env_ktt_binh_thuy', qx - 0.1, qy - 0.1, GZ + 0.54 + 0.17, 0.08, 0.34, mat('#c8402e', 0.4), coll=coll); sphere('env_ktt_am_tra', qx + 0.12, qy + 0.1, GZ + 0.54 + 0.09, 0.07, mat('#ddd8c8', 0.4), coll=coll)
    for k in range(4): cyl(f'env_ktt_coc{k}', qx - 0.15 + k * 0.1, qy + 0.25, GZ + 0.54 + 0.04, 0.025, 0.08, mat('#a8c4c0', 0.1), coll=coll)
    cyl('env_ktt_du_cot', qx, qy - 0.75, GZ + 1.1, 0.02, 2.2, mat('#6a6a64', 0.5, 0.6), coll=coll)
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=1.1, radius2=0.03, depth=0.4); X._mesh_obj('env_ktt_du', bm, (X.mx(qx), qy - 0.75, GZ + 2.35), mat('#2f9a6a', 0.7), True, coll)

    # ------------------------------------------------------------ xe đẩy bánh mì (tủ kính, mái, biển)
    cx, cy = -2.35, -5.2
    B('xe_banh_mi_than', cx - 0.4, cx + 0.4, cy - 0.7, cy + 0.7, GZ + 0.45, GZ + 0.95, mat('#d8d0b8', 0.6), bevel=0.02, coll=coll)
    B('xe_banh_mi_kinh', cx - 0.38, cx + 0.38, cy - 0.65, cy + 0.65, GZ + 0.95, GZ + 1.4, M.glass() if hasattr(M, 'glass') else mat('#a8c4c0', 0.05), coll=coll)
    for xx, yy in ((cx - 0.38, cy - 0.65), (cx + 0.36, cy - 0.65), (cx - 0.38, cy + 0.63), (cx + 0.36, cy + 0.63)): B(f'xe_bm_khung{xx}{yy}', xx, xx + 0.02, yy, yy + 0.02, GZ + 0.95, GZ + 1.4, steel, coll=coll)
    for k in range(6): cyl(f'env_ktt_banh_mi{k}', cx, cy - 0.5 + 0.2 * k, GZ + 1.07, 0.06, 0.28, mat('#c8903a', 0.7), axis='Y' if False else 'X', coll=coll, bevel=0.01)
    B('xe_bm_mai', cx - 0.5, cx + 0.5, cy - 0.8, cy + 0.8, GZ + 1.88, GZ + 1.92, mat('#b3452f', 0.6), coll=coll); B('xe_bm_bien', cx - 0.52, cx - 0.48, cy - 0.7, cy + 0.7, GZ + 1.5, GZ + 1.85, mat('#f0c030', 0.5), coll=coll)
    for xx, yy in ((cx - 0.45, cy - 0.78), (cx + 0.45, cy - 0.78), (cx - 0.45, cy + 0.78), (cx + 0.45, cy + 0.78)): cyl(f'env_ktt_xe_bm_cot{xx}{yy}', xx, yy, GZ + 1.4, 0.012, 0.9, steel, coll=coll)
    for xx in (cx - 0.47, cx + 0.47): torus(f'env_ktt_xe_bm_banh{xx}', xx, cy, GZ + 0.25, 0.25, 0.03, mat('#1a1a1a', 0.8), rot=(0, math.pi / 2, 0), coll=coll)
    chu('xe_bm_chu', 'BÁNH MÌ', 0.14, cx - 0.53, cy, GZ + 1.6, '#b32a20')

    # ------------------------------------------------------------ hàng rong chuyển động: gánh hoa quả + xe đạp chở hoa
    def hat_non(root, name, z):
        bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=18, radius1=0.24, radius2=0.01, depth=0.14)
        ob = X._mesh_obj(name, bm, (0, 0, z), mat('#e8dcb0', 0.8), True, coll); ob.parent = root; ob.visible_shadow = False
    sk = mat('#d9a67c', 0.7)
    def chan(root, name, speed, y0, trouser, sc=1.0):
        for side, ph in ((-1, 0.0), (1, math.pi)):
            piv = bpy.data.objects.new(f'{name}_cp{side}', None); coll.objects.link(piv); piv.parent = root; piv.location = (side * 0.1 * sc, 0, 0.72 * sc)
            ob = cyl(f'env_ktt_{name}_chan{side}', 0, 0, 0, 0.07 * sc, 0.7 * sc, mat(trouser, 0.8), coll=coll); ob.parent = piv; ob.location = (0, 0, -0.35 * sc); ob.visible_shadow = False
            ft = box(f'env_ktt_{name}_giay{side}', W - 0.045, W + 0.045, -0.05, 0.14, -0.71 * sc, -0.64 * sc, mat('#2a2a2a', 0.8), coll=coll); ft.parent = piv; ft.visible_shadow = False
            _drv(piv, 'rotation_euler', 0, f'0.45*sin(frame*{0.36 * speed / 0.058:.3f}+{ph:.2f}+{y0:.1f})')
    def ganh(name, lane_x, y0, speed, span, direction=1):
        root = bpy.data.objects.new(name, None); coll.objects.link(root); root.location = (X.mx(lane_x), y0, GZ + (0.08 if lane_x < -6.5 else 0.0))
        def P(ob): ob.parent = root; ob.visible_shadow = False; return ob
        P(cyl(f'env_ktt_{name}_than', W, 0, 0.95, 0.15, 0.55, mat('#6a4a38', 0.9), coll=coll)); P(sphere(f'env_ktt_{name}_dau', W, 0, 1.4, 0.11, sk, coll=coll)); hat_non(root, f'env_ktt_{name}_non', 1.5)
        chan(root, name, speed, y0, '#2a2a2a')
        P(cyl(f'env_ktt_{name}_don', W, 0, 1.3, 0.015, 1.9, mat('#a8905a', 0.7), axis='Y', coll=coll))   # đòn gánh dọc hướng đi
        for dy in (-0.85, 0.85):
            P(cyl(f'env_ktt_{name}_ro{dy}', W, dy, 0.82, 0.27, 0.16, mat('#b08a4a', 0.9), coll=coll))
            for j in range(7): P(sphere(f'env_ktt_{name}_qua{dy}_{j}', W + rnd.uniform(-0.16, 0.16), dy + rnd.uniform(-0.16, 0.16), 0.94 + rnd.uniform(0, 0.06), 0.065, mat(rnd.choice(['#e8a020', '#c83a2a', '#6a9a3a', '#e0c030']), 0.5), coll=coll))
            for sx in (-0.2, 0.2): P(cyl(f'env_ktt_{name}_day{dy}{sx}', W + sx * 0.5, dy, 1.06, 0.004, 0.46, mat('#8a7a5a', 0.8), coll=coll))
        if direction < 0: root.rotation_euler = (0, 0, math.pi)
        _drv(root, 'location', 1, f'{-11 if direction > 0 else 30}+{direction}*fmod({y0:.1f}+frame*{speed:.4f},{span:.1f})'); _fade(root, f'fmod({y0:.1f}+frame*{speed:.4f},{span:.1f})', span, 2.0); root.location[1] = y0

    def xe_dap_hoa(name, lane_x, y0, speed, span, direction=1):
        root = bpy.data.objects.new(name, None); coll.objects.link(root); root.location = (X.mx(lane_x), y0, GZ)
        def P(ob): ob.parent = root; ob.visible_shadow = False; return ob
        for dy in (-0.55, 0.55):
            hub = bpy.data.objects.new(f'{name}_hub{dy}', None); coll.objects.link(hub); hub.parent = root; hub.location = (0, dy, 0.33)
            t_ = torus(f'env_ktt_{name}_banh{dy}', W, 0, 0, 0.33, 0.018, mat('#1a1a1a', 0.8), rot=(0, math.pi / 2, 0), coll=coll); t_.parent = hub; t_.location = (0, 0, 0); t_.visible_shadow = False
            _drv(hub, 'rotation_euler', 0, f'frame*{speed / 0.33:.3f}*{direction}')
            for a_ in range(4): P(box(f'env_ktt_{name}_nan{dy}{a_}', W - 0.004, W + 0.004, dy - 0.32, dy + 0.32, 0.33 - 0.004, 0.33 + 0.004, mat('#9a9a96', 0.4, 0.8), coll=coll, rot=(a_ * math.pi / 4, 0, 0), pivot=(W, dy, 0.33))) if False else None
        fr = mat('#2a6a8a', 0.4, 0.4)
        P(box(f'env_ktt_{name}_kh1', W - 0.015, W + 0.015, -0.55, 0.0, 0.33, 0.36, fr, coll=coll)); P(box(f'env_ktt_{name}_kh2', W - 0.015, W + 0.015, 0.0, 0.5, 0.33, 0.78, fr, coll=coll, rot=(math.radians(25), 0, 0), pivot=(W, 0.0, 0.33)))
        P(box(f'env_ktt_{name}_ghi', W - 0.25, W + 0.25, 0.5, 0.54, 1.0, 1.03, steel, coll=coll)); P(box(f'env_ktt_{name}_yen', W - 0.07, W + 0.07, -0.15, 0.1, 0.9, 0.94, mat('#1a1a1a', 0.7), coll=coll))
        P(box(f'env_ktt_{name}_gia', W - 0.25, W + 0.25, -0.95, -0.55, 0.62, 0.64, steel, coll=coll))
        for sx in (-0.26, 0.26):   # hai giỏ hoa to hai bên baga
            P(box(f'env_ktt_{name}_gio{sx}', W + sx - 0.1, W + sx + 0.1, -0.95, -0.55, 0.64, 0.95, mat('#8a6a3a', 0.9), coll=coll))
            for j in range(9): P(sphere(f'env_ktt_{name}_hoa{sx}_{j}', W + sx + rnd.uniform(-0.1, 0.1), -0.75 + rnd.uniform(-0.2, 0.2), 1.0 + rnd.uniform(0, 0.2), rnd.uniform(0.06, 0.1), mat(rnd.choice(['#e0407a', '#f0c030', '#f4f0e0', '#e86a2a', '#7a4a9a']), 0.6), coll=coll))
        P(cyl(f'env_ktt_{name}_than', W, -0.02, 1.2, 0.13, 0.5, mat('#3a6a5a', 0.9), coll=coll, rot=(math.radians(10), 0, 0))); P(sphere(f'env_ktt_{name}_dau', W, 0.06, 1.55, 0.1, sk, coll=coll)); hat_non(root, f'env_ktt_{name}_non', 1.64)
        for sx in (-0.14, 0.14): P(cyl(f'env_ktt_{name}_dui{sx}', W + sx, 0.12, 0.84, 0.06, 0.5, mat('#2a2a3a', 0.9), coll=coll, rot=(math.radians(-70), 0, 0)))
        if direction < 0: root.rotation_euler = (0, 0, math.pi)
        _drv(root, 'location', 1, f'{-11 if direction > 0 else 30}+{direction}*fmod({y0:.1f}+frame*{speed:.4f},{span:.1f})'); _fade(root, f'fmod({y0:.1f}+frame*{speed:.4f},{span:.1f})', span, 2.5); root.location[1] = y0

    # ------------------------------------------------------------ 3 người bán hàng ngồi ven đường (đứng yên, mỗi người một kiểu)
    def nguoi_ngoi(name, x, y, z0, quay, ao, quan, non, da='#d9a67c', toc='#2a2018', ghe='#3b6ea5'):
        root = bpy.data.objects.new(name, None); coll.objects.link(root); root.location = (X.mx(x), y, z0)
        if quay: root.rotation_euler = (0, 0, math.pi)   # mặc định nhìn về +x thiết kế (phía lòng đường); quay=True nhìn về −x
        sk_ = mat(da, 0.7)
        def P(ob): ob.parent = root; ob.visible_shadow = False; return ob
        P(cyl(f'env_ktt_{name}_ghe', W, 0, 0.14, 0.17, 0.28, mat(ghe, 0.55), coll=coll, bevel=0.02))
        P(box(f'env_ktt_{name}_hong', W - 0.14, W + 0.12, -0.15, 0.15, 0.28, 0.4, mat(quan, 0.85), bevel=0.02, coll=coll))
        P(cyl(f'env_ktt_{name}_than', W - 0.02, 0, 0.66, 0.15, 0.5, mat(ao, 0.9), coll=coll, rot=(0, math.radians(-6), 0)))
        P(sphere(f'env_ktt_{name}_dau', W - 0.03, 0, 1.03, 0.11, sk_, coll=coll))
        for sd in (-1, 1):
            P(cyl(f'env_ktt_{name}_dui{sd}', W + 0.22, sd * 0.1, 0.42, 0.07, 0.42, mat(quan, 0.85), axis='X', coll=coll))      # đùi nằm ngang
            P(cyl(f'env_ktt_{name}_ong{sd}', W + 0.42, sd * 0.1, 0.2, 0.06, 0.4, mat(quan, 0.85), coll=coll))                   # cẳng chân
            P(box(f'env_ktt_{name}_dep{sd}', W + 0.38, W + 0.56, sd * 0.1 - 0.05, sd * 0.1 + 0.05, 0.0, 0.04, mat('#333333', 0.8), coll=coll))
            P(cyl(f'env_ktt_{name}_tay{sd}', W + 0.14, sd * 0.2, 0.7, 0.04, 0.4, mat(ao, 0.9), axis='X', coll=coll, rot=(0, math.radians(70), 0)))   # tay đặt lên đùi
        if non == 'non': 
            bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=18, radius1=0.26, radius2=0.01, depth=0.15); P(X._mesh_obj(f'env_ktt_{name}_non', bm, (0, 0, 1.2), mat('#e8dcb0', 0.8), True, coll))
        elif non == 'khan':
            P(sphere(f'env_ktt_{name}_khan', W - 0.03, 0, 1.08, 0.12, mat('#8a3a4a', 0.9), scale=(1, 1, 0.8), coll=coll))
        else:
            P(sphere(f'env_ktt_{name}_mu', W - 0.03, 0, 1.1, 0.12, mat('#2a3a5a', 0.7), scale=(1, 1, 0.55), coll=coll)); P(box(f'env_ktt_{name}_lan', W + 0.06, W + 0.2, -0.1, 0.1, 1.08, 1.1, mat('#2a3a5a', 0.7), coll=coll))
        if non != 'khan' and non != 'non': pass
        else: P(sphere(f'env_ktt_{name}_toc', W - 0.05, 0, 1.06, 0.11, mat(toc, 0.9), scale=(1, 1, 0.8), coll=coll)) if non == 'khan' else None
        return root
    zv = GZ + 0.08
    # 1) bà bán rau: ngồi sát tường, nón lá, rổ rau + ô che nắng, tất cả trong x −7,5…−6,7
    nguoi_ngoi('ban_rau', -7.3, -1.5, zv, False, '#7a5a8a', '#2a2a2a', 'non')
    B('rau_chieu', -7.5, -6.72, -2.2, -0.8, zv, zv + 0.012, mat('#a8905a', 0.9), coll=coll)
    for k in range(2):
        cy_ = -1.5 - 0.4 + 0.8 * k
        cyl(f'env_ktt_ro_rau{k}', -6.95, cy_, zv + 0.09, 0.24, 0.16, mat('#b08a4a', 0.9), coll=coll)
        for j in range(9): sphere(f'env_ktt_rau{k}_{j}', -6.95 + rnd.uniform(-0.17, 0.17), cy_ + rnd.uniform(-0.17, 0.17), zv + 0.2 + rnd.uniform(0, 0.08), rnd.uniform(0.06, 0.1), mat(rnd.choice(['#4f8a3a', '#6aa04a', '#3a7a3a', '#8ab04a']), 0.8), scale=(1, 1, 0.6), coll=coll)
    cyl('env_ktt_du_rau_cot', -7.5, -2.05, zv + 1.15, 0.02, 2.3, mat('#6a6a64', 0.5, 0.6), coll=coll)
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=1.0, radius2=0.03, depth=0.35); X._mesh_obj('env_ktt_du_rau', bm, (X.mx(-7.5), -2.05, zv + 2.3), mat('#d8a02a', 0.7), True, coll)
    # 2) cô bán trái cây: khăn trùm đầu, ghế nhựa thấp, đôi thúng + quang gánh đặt xuống đất
    nguoi_ngoi('ban_trai_cay', -7.3, 14.0, zv, False, '#c4503a', '#3a4a6a', 'khan', ghe='#c24a3a')
    cyl('env_ktt_quang_ganh', -6.95, 14.0, zv + 0.2, 0.014, 1.7, mat('#a8905a', 0.7), axis='Y', coll=coll)
    for k, dy in enumerate((-0.75, 0.75)):
        cyl(f'env_ktt_thung_qua{k}', -6.95, 14.0 + dy, zv + 0.1, 0.26, 0.2, mat('#8a6a3a', 0.9), coll=coll)
        for j in range(10): sphere(f'env_ktt_trai{k}_{j}', -6.95 + rnd.uniform(-0.17, 0.17), 14.0 + dy + rnd.uniform(-0.17, 0.17), zv + 0.24 + rnd.uniform(0, 0.08), 0.07, mat(rnd.choice(['#e8a020', '#c83a2a', '#6a9a3a', '#e0c030', '#d85a8a']), 0.5), coll=coll)
    B('trai_chieu', -7.5, -6.72, 12.9, 15.1, zv, zv + 0.01, mat('#2f66a8', 0.5), coll=coll)
    # 3) chú bán bánh mì: mũ lưỡi trai, ngồi sau xe đẩy
    nguoi_ngoi('ban_banh_mi', -1.4, -5.2, GZ, True, '#e8e4d8', '#2a2a2a', 'mu', ghe='#e3b84a')

    # ================================================================ ƯU TIÊN: chuồng cọp nhà đối diện + téc inox, búi dây/cột điện tổ chim, quán chè chén, thùng xốp rau, stencil
    inox = mat('#c8cbca', 0.2, 0.9)
    r2 = random.Random(77)
    # chuồng cọp sắt đua ra ngoài ở nhà đối diện (tầng 2–4), một số có téc inox trên mái chuồng
    for k, (fl, yc) in enumerate([(1, 3.0), (2, 8.5), (3, 13.5), (1, 19.0), (2, 22.5), (3, 28.0), (1, -4.0)]):
        zb = GZ + fl * FL; wd = r2.choice([1.6, 2.0, 2.4]); y0_ = yc - wd / 2; y1_ = yc + wd / 2; xo = BX + 0.65   # đua ra 65 cm khỏi lan can
        B(f'dd_cg_san{k}', BX, xo, y0_, y1_, zb - 0.08, zb, mat('#9a948a', 0.9), coll=coll)
        for i in range(int(wd / 0.11) + 1): B(f'dd_cg_song{k}_{i}', xo - 0.02, xo, y0_ + i * 0.11, y0_ + i * 0.11 + 0.02, zb, zb + 1.95, steel, coll=coll)
        for z in (zb + 0.6, zb + 1.2, zb + 1.95): B(f'dd_cg_ngang{k}_{z:.1f}', xo - 0.025, xo, y0_, y1_, z, z + 0.025, steel, coll=coll)
        for yy in (y0_, y1_ - 0.02):
            B(f'dd_cg_hong{k}_{yy:.1f}', BX, xo, yy, yy + 0.02, zb + 1.0, zb + 1.025, steel, coll=coll); B(f'dd_cg_cot{k}_{yy:.1f}', xo - 0.03, xo, yy, yy + 0.03, zb, zb + 2.0, steel, coll=coll)
        B(f'dd_cg_mai{k}', BX - 0.1, xo + 0.1, y0_ - 0.1, y1_ + 0.1, zb + 1.97, zb + 2.0, mat('#8c8f86', 0.55, 0.6), coll=coll)
        for j in range(r2.randint(1, 3)): B(f'dd_cg_do{k}_{j}', BX + 0.1 + j * 0.15, BX + 0.35 + j * 0.15, y0_ + 0.2 + j * 0.5, y0_ + 0.55 + j * 0.5, zb, zb + r2.uniform(0.3, 0.6), mat(r2.choice(['#b3452f', '#3b6ea5', '#d8d0b0', '#6a9a5a']), 0.7), bevel=0.02, coll=coll)
        if k % 2 == 0:   # téc nước inox nằm ngang trên mái chuồng
            cyl(f'env_ktt_dd_tec{k}', BX + 0.3, yc, zb + 2.0 + 0.36, 0.36, 1.1, inox, axis='Y', coll=coll)
            for sg in (-1, 1): sphere(f'env_ktt_dd_tec_nap{k}{sg}', BX + 0.3, yc + sg * 0.55, zb + 2.36, 0.36, inox, scale=(1, 0.18, 1), coll=coll)
            for sg in (-0.35, 0.35): B(f'dd_tec_chan{k}_{sg}', BX + 0.15, BX + 0.45, yc + sg, yc + sg + 0.04, zb + 2.0, zb + 2.1, steel, coll=coll)
    # cột điện tổ chim: búi dây cuộn tròn, hộp cáp, biến áp, mớ dây rối quanh xà
    dk = mat('#1a1a1a', 0.55)
    for pi, py in enumerate((-3.0, 8.0, 19.0, 30.0)):
        px = -1.75
        for j in range(3):   # cuộn cáp dự phòng quấn quanh cột
            torus(f'env_ktt_cuon{pi}_{j}', px, py, GZ + 5.4 + 0.22 * j, 0.24 - 0.02 * j, 0.025, dk, rot=(r2.uniform(-0.2, 0.2), r2.uniform(-0.2, 0.2), 0), coll=coll)
        B(f'hop_cap{pi}', px - 0.17, px + 0.17, py - 0.1, py + 0.1, GZ + 4.2, GZ + 4.75, mat('#5a5e5a', 0.5, 0.4), coll=coll)
        for j in range(26):   # mớ dây rối ('tổ chim') quanh xà ngang
            a_ = r2.uniform(0, math.pi * 2); zc = GZ + r2.uniform(8.3, 9.3)
            cyl(f'env_ktt_roi{pi}_{j}', px + r2.uniform(-0.9, 0.9), py + r2.uniform(-0.25, 0.25), zc, 0.008, r2.uniform(0.7, 1.7), dk, coll=coll, rot=(r2.uniform(0, 3.14), r2.uniform(0, 3.14), a_))
        sphere(f'env_ktt_to_chim{pi}', px + 0.5, py, GZ + 9.2, 0.14, mat('#6a5030', 0.95), scale=(1, 1, 0.55), coll=coll)
        if pi == 1:   # biến áp treo trên cột
            cyl('env_ktt_bien_ap', px, py + 0.28, GZ + 7.6, 0.24, 0.65, mat('#7a7e7a', 0.45, 0.5), coll=coll); B('bien_ap_nap', px - 0.26, px + 0.26, py + 0.04, py + 0.52, GZ + 7.9, GZ + 7.95, steel, coll=coll)
    # quán nước chè chén ở tầng 1: khay chén, ấm đun, ghế nhựa thấp, bếp than
    gx, gy = -2.1, -11.2
    B('che_ban', gx - 0.3, gx + 0.3, gy - 0.45, gy + 0.45, GZ + 0.55, GZ + 0.58, mat('#7a5a3a', 0.8), coll=coll)
    for sx in (-0.25, 0.25):
        for sy in (-0.4, 0.4): B(f'che_chan{sx}{sy}', gx + sx - 0.02, gx + sx + 0.02, gy + sy - 0.02, gy + sy + 0.02, GZ, GZ + 0.55, mat('#4a3320', 0.8), coll=coll)
    for k in range(10): cyl(f'env_ktt_che_chen{k}', gx - 0.15 + 0.1 * (k % 4), gy - 0.3 + 0.1 * (k // 4) * 2 + 0.08 * (k % 2), GZ + 0.58 + 0.03, 0.04, 0.06, mat(rnd.choice(['#d8e0e0', '#c8a860', '#b8d0b8']), 0.3), coll=coll)
    cyl('env_ktt_che_am', gx + 0.1, gy + 0.3, GZ + 0.58 + 0.15, 0.13, 0.3, mat('#2a2a2a', 0.4, 0.7), coll=coll); cyl('env_ktt_che_bep', gx + 0.55, gy + 0.3, GZ + 0.18, 0.18, 0.36, mat('#5a3a2a', 0.8), coll=coll)
    for k, (dx, dy) in enumerate([(-0.45, -0.3), (-0.45, 0.35), (0.0, -0.75)]): cyl(f'env_ktt_che_ghe{k}', gx + dx, gy + dy, GZ + 0.15, 0.17, 0.3, mat(rnd.choice(['#c24a3a', '#3b6ea5', '#2f9a6a']), 0.55), coll=coll, bevel=0.02)
    # thùng xốp trồng rau dọc chân nhà trọ (tầng 1)
    for k, yy in enumerate((5.6, 12.4, 15.2, 20.6)):
        B(f'thung_xop_t1_{k}', -1.95, -1.55, yy, yy + 0.55, GZ, GZ + 0.22, mat('#e8e4d8', 0.7), coll=coll)
        B(f'dat_xop_t1_{k}', -1.93, -1.57, yy + 0.02, yy + 0.53, GZ + 0.2, GZ + 0.225, mat('#3a2a1a', 0.95), coll=coll)
        for j in range(8): sphere(f'env_ktt_rau_t1_{k}_{j}', -1.9 + rnd.uniform(-0.0, 0.3), yy + 0.05 + rnd.uniform(0, 0.45), GZ + 0.27 + rnd.uniform(0, 0.08), rnd.uniform(0.06, 0.1), mat(rnd.choice(['#4f8a3a', '#6aa04a', '#8ab04a']), 0.8), scale=(1, 1, 0.7), coll=coll)
    # stencil khoan cắt bê tông trên tường tầng trệt phía sân
    chu('stencil_khoan', 'KHOAN CẮT BÊ TÔNG', 0.125, EX - 0.02, 12.0, GZ + 1.25, '#d8281a'); chu('stencil_sdt', '0912 345 678', 0.1, EX - 0.02, 12.0, GZ + 1.05, '#1a1a1a')
