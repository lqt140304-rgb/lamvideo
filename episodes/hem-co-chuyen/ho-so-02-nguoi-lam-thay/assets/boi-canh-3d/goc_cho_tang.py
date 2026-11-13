"""S07 — Góc đồ cho tặng (chân cầu thang dãy trọ), chiều muộn sau mưa: nơi Nam nhặt chiếc gương.
Gồm: gương gỗ cũ bám bụi dựa tường, ghế gãy, chậu hoa nứt + cây héo, bạt nhựa xanh nhàu, thùng carton, xô, quạt cũ, giá gỗ, tờ giấy dán "Ai cần cứ lấy",
sàn ướt (vệt nước tối + vũng phản chiếu), mưa thưa. Toạ độ thiết kế: tường đầu nhà ở x = 0 (hướng −x), sân trệt z = −2,92.
`build(X, coll, mua=True)`; chạy riêng: camera `GOC_DO` trong xay_phong_tro (`--mode rain --goc-do`)."""
import bpy, bmesh, math, random, os
from mathutils import Vector, Matrix

GZ = -2.92


def build(X, coll, mua=True, seed=7):
    box, cyl, sphere, M = X.box, X.cyl, X.sphere, X.M
    rnd = random.Random(seed)
    cache = {}
    def mat(c, r=0.7, mt=0.0):
        k = (c, r, mt)
        if k not in cache: cache[k] = M.solid('gct_' + c.strip('#') + f'_{int(r*10)}', c, r, mt)
        return cache[k]
    def B(n, *a, **kw): return box('env_gct_' + n, *a, **kw)
    X0, Y0 = -0.19, -7.0          # gương dựa tường: chân gương cách tường 19 cm
    # ---------------------------------------------------------------- gương gỗ cũ bám bụi
    wood = M.wood('gct_go_guong', '#6a4a2c', '#4a321c', rough=0.75)
    pv = (X0, Y0, GZ)
    B('khung_guong', X0, X0 + 0.035, Y0 - 0.27, Y0 + 0.27, GZ, GZ + 1.25, wood, bevel=0.008, coll=coll, rot=(0, math.radians(6), 0), pivot=pv)
    B('khung_vien_trong', X0 - 0.004, X0, Y0 - 0.235, Y0 + 0.235, GZ + 0.04, GZ + 1.21, mat('#8a6a42', 0.7), coll=coll, rot=(0, math.radians(6), 0), pivot=pv)  # nẹp trong sờn sơn
    # mặt kính bám bụi: gương + lớp bụi/vết nước đục
    gm = bpy.data.materials.new('gct_guong_bui'); gm.use_nodes = True; nt = gm.node_tree; N, L = nt.nodes, nt.links
    for n_ in list(N): N.remove(n_)
    gl = N.new('ShaderNodeBsdfGlossy'); gl.inputs['Roughness'].default_value = 0.06; gl.inputs['Color'].default_value = (0.82, 0.86, 0.85, 1)
    ds = N.new('ShaderNodeBsdfDiffuse'); ds.inputs['Color'].default_value = (0.36, 0.34, 0.31, 1)
    tc = N.new('ShaderNodeTexCoord'); nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 7.0; nz.inputs['Detail'].default_value = 6.0; L.new(tc.outputs['Object'], nz.inputs['Vector'])
    gr = N.new('ShaderNodeGradientTexture') if False else None
    ramp = N.new('ShaderNodeValToRGB'); ramp.color_ramp.elements[0].position = 0.42; ramp.color_ramp.elements[0].color = (0.18, 0.18, 0.18, 1); ramp.color_ramp.elements[1].position = 0.7; ramp.color_ramp.elements[1].color = (0.85, 0.85, 0.85, 1)
    L.new(nz.outputs['Fac'], ramp.inputs['Fac'])
    mx = N.new('ShaderNodeMixShader'); L.new(ramp.outputs['Color'], mx.inputs['Fac']); L.new(gl.outputs[0], mx.inputs[1]); L.new(ds.outputs[0], mx.inputs[2])
    ot = N.new('ShaderNodeOutputMaterial'); L.new(mx.outputs[0], ot.inputs['Surface'])
    B('mat_guong', X0 - 0.008, X0 - 0.004, Y0 - 0.235, Y0 + 0.235, GZ + 0.05, GZ + 1.2, gm, coll=coll, rot=(0, math.radians(6), 0), pivot=pv)
    # vết nứt nhỏ góc phải (kính)
    for k in range(4): B(f'nut{k}', X0 - 0.0085, X0 - 0.0082, Y0 - 0.2 + 0.01 * k, Y0 - 0.2 + 0.01 * k + 0.002, GZ + 0.95 + 0.04 * k, GZ + 1.1 + 0.02 * k, mat('#1a1a1a', 0.5), coll=coll, rot=(0, math.radians(6), math.radians(8 * k)), pivot=pv)
    # ---------------------------------------------------------------- tờ giấy "Ai cần cứ lấy" dán tường
    B('to_giay', -0.012, -0.004, Y0 + 0.4, Y0 + 0.82, GZ + 1.4, GZ + 1.7, mat('#f2efe2', 0.85), coll=coll, rot=(math.radians(3), 0, 0), pivot=(0, Y0 + 0.6, GZ + 1.55))
    B('bang_keo1', -0.014, -0.0035, Y0 + 0.4, Y0 + 0.5, GZ + 1.66, GZ + 1.7, mat('#d8c890', 0.5), coll=coll); B('bang_keo2', -0.014, -0.0035, Y0 + 0.72, Y0 + 0.82, GZ + 1.66, GZ + 1.7, mat('#d8c890', 0.5), coll=coll)
    try:
        font = None
        for fp in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 'C:/Windows/Fonts/arialbd.ttf', 'C:/Windows/Fonts/arial.ttf'):
            if os.path.exists(fp): font = bpy.data.fonts.load(fp); break
        for li, (txt, size, dz) in enumerate([('Ai cần', 0.062, 1.62), ('cứ lấy', 0.062, 1.5)]):
            cu = bpy.data.curves.new(f'env_gct_chu{li}', 'FONT'); cu.body = txt; cu.size = size; cu.extrude = 0.0006; cu.align_x = 'CENTER'
            if font: cu.font = font
            ob = bpy.data.objects.new(f'env_gct_chu{li}', cu); ob.data.materials.append(mat('#2a2a2a', 0.6))
            # chữ nằm trong mặt phẳng yz, pháp tuyến hướng người đứng ở phía −x thiết kế (= +x thế giới), đọc theo +y thế giới
            R = Matrix(((0, 0, 1), (1, 0, 0), (0, 1, 0)))  # cột 0 = X cục bộ → +y; cột 1 = Y → +z; cột 2 = Z → +x
            ob.rotation_euler = R.to_euler(); ob.location = (X.mx(-0.016), Y0 + 0.61, GZ + dz)
            coll.objects.link(ob)
    except Exception as e:
        print('chữ tờ giấy lỗi:', e)
    # ---------------------------------------------------------------- ghế gãy
    cw = mat('#8a5a30', 0.8); cx, cy = -0.7, Y0 - 0.55
    B('ghe_mat', cx - 0.21, cx + 0.21, cy - 0.21, cy + 0.21, GZ + 0.41, GZ + 0.45, cw, bevel=0.005, coll=coll, rot=(math.radians(9), 0, math.radians(14)), pivot=(cx, cy, GZ + 0.43))
    for k, (dx, dy) in enumerate([(-0.18, -0.18), (0.18, -0.18), (-0.18, 0.18)]):  # ghế mất một chân
        B(f'ghe_chan{k}', cx + dx - 0.02, cx + dx + 0.02, cy + dy - 0.02, cy + dy + 0.02, GZ, GZ + 0.41, cw, coll=coll, rot=(math.radians(9), 0, math.radians(14)), pivot=(cx, cy, GZ + 0.43))
    B('ghe_chan_gay', cx + 0.3, cx + 0.34, cy - 0.5, cy - 0.05, GZ, GZ + 0.04, mat('#9a6a3a', 0.8), coll=coll, rot=(0, 0, math.radians(32)), pivot=(cx + 0.3, cy - 0.3, GZ))   # chân gãy nằm dưới đất
    B('ghe_lung', cx - 0.2, cx + 0.2, cy + 0.17, cy + 0.2, GZ + 0.45, GZ + 0.9, cw, bevel=0.005, coll=coll, rot=(math.radians(9), 0, math.radians(14)), pivot=(cx, cy, GZ + 0.43))
    # ---------------------------------------------------------------- chậu hoa vỡ + đất + cây héo
    px, py = -1.05, Y0 + 0.15
    X._mesh_obj  # (đảm bảo hàm có)
    def lathe(name, pts, x, y, z, mt, seg=24):
        bm = bmesh.new(); rings = [[bm.verts.new((r * math.cos(2 * math.pi * i / seg), r * math.sin(2 * math.pi * i / seg), h)) for i in range(seg)] for (r, h) in pts]
        for a in range(len(rings) - 1):
            for i in range(seg):
                try: bm.faces.new((rings[a][i], rings[a][(i + 1) % seg], rings[a + 1][(i + 1) % seg], rings[a + 1][i]))
                except ValueError: pass
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        return X._mesh_obj('env_gct_' + name, bm, (X.mx(x), y, z), mt, True, coll)
    lathe('chau', [(0.0, 0.0), (0.09, 0.0), (0.12, 0.05), (0.17, 0.22), (0.19, 0.25), (0.165, 0.25), (0.11, 0.05), (0.0, 0.03)], px, py, GZ, mat('#b0623a', 0.85))
    B('chau_manh1', px + 0.1, px + 0.22, py - 0.05, py + 0.06, GZ, GZ + 0.12, mat('#b0623a', 0.85), coll=coll, rot=(0, math.radians(12), math.radians(20)), pivot=(px + 0.16, py, GZ))  # mảnh vỡ
    B('chau_manh2', px + 0.18, px + 0.24, py + 0.1, py + 0.16, GZ, GZ + 0.07, mat('#b0623a', 0.85), coll=coll, rot=(0, 0, math.radians(40)), pivot=(px + 0.2, py + 0.13, GZ))
    sphere('env_gct_dat', X.mx(px) if False else px, py, GZ + 0.2, 0.15, mat('#3a2a1a', 0.95), scale=(1, 1, 0.45), coll=coll)
    for k in range(7):
        a = k * 0.9; B(f'cay_kho{k}', px - 0.01 + 0.04 * math.cos(a), px + 0.01 + 0.04 * math.cos(a), py - 0.01 + 0.04 * math.sin(a), py + 0.01 + 0.04 * math.sin(a), GZ + 0.22, GZ + 0.5 + 0.04 * (k % 3), mat('#6a5a3a', 0.9), coll=coll, rot=(math.radians(18 * math.sin(a)), math.radians(18 * math.cos(a)), 0), pivot=(px, py, GZ + 0.22))
    for k in range(9): sphere(f'env_gct_la_kho{k}', px + 0.18 * math.cos(k * 0.7), py + 0.18 * math.sin(k * 0.7), GZ + 0.012, 0.03, mat(['#7a6a2a', '#8a7a3a', '#5a4a1a'][k % 3], 0.9), scale=(1, 1, 0.1), coll=coll)  # lá rụng ướt
    # ---------------------------------------------------------------- bạt nhựa xanh nhàu + dây
    tarp = mat('#2f66a8', 0.4)
    for k in range(4):
        B(f'bat{k}', -1.2 + 0.12 * k, -0.45 + 0.1 * k, Y0 - 1.15 + 0.05 * k, Y0 - 0.45 + 0.06 * k, GZ + 0.002 + 0.02 * k, GZ + 0.012 + 0.03 * k, tarp, bevel=0.004, coll=coll, rot=(math.radians(4 * k), math.radians(-5 * k), math.radians(10 * k - 8)), pivot=(-0.8, Y0 - 0.8, GZ))
    B('bat_gap', -1.0, -0.5, Y0 - 1.0, Y0 - 0.7, GZ + 0.07, GZ + 0.16, mat('#27589a', 0.45), bevel=0.02, coll=coll, rot=(0, 0, math.radians(20)), pivot=(-0.75, Y0 - 0.85, GZ))
    # ---------------------------------------------------------------- thùng carton chồng + quần áo cũ
    ca = mat('#b8905a', 0.9)
    B('thung1', -0.55, -0.12, Y0 + 0.55, Y0 + 1.0, GZ, GZ + 0.38, ca, bevel=0.008, coll=coll, rot=(0, 0, math.radians(-6)), pivot=(-0.33, Y0 + 0.78, GZ))
    B('thung2', -0.5, -0.15, Y0 + 0.6, Y0 + 0.95, GZ + 0.38, GZ + 0.7, mat('#c4a066', 0.9), bevel=0.008, coll=coll, rot=(0, 0, math.radians(10)), pivot=(-0.33, Y0 + 0.78, GZ + 0.38))
    B('thung3', -0.9, -0.55, Y0 + 0.5, Y0 + 0.85, GZ, GZ + 0.3, mat('#a98250', 0.9), bevel=0.008, coll=coll)
    for k in range(3): B(f'ao_cu{k}', -0.88 + 0.07 * k, -0.7 + 0.07 * k, Y0 + 0.55 + 0.05 * k, Y0 + 0.8, GZ + 0.3, GZ + 0.34 + 0.02 * k, mat(rnd.choice(['#8a6a9a', '#5a8a6a', '#aa5a4a']), 0.95), bevel=0.02, coll=coll)   # quần áo thò ra
    # ---------------------------------------------------------------- xô nhựa, quạt cũ, giá gỗ, bó tre
    cyl('env_gct_xo', -1.25, Y0 - 1.3, GZ + 0.14, 0.13, 0.28, mat('#d86a3a', 0.5), coll=coll, bevel=0.01)
    cyl('env_gct_xo_nuoc', -1.25, Y0 - 1.3, GZ + 0.25, 0.115, 0.01, mat('#4a6a78', 0.05), coll=coll)       # nước mưa đọng trong xô
    cyl('env_gct_quat_cot', -0.3, Y0 - 1.3, GZ + 0.45, 0.012, 0.9, mat('#6a6a64', 0.7, 0.4), coll=coll); cyl('env_gct_quat_de', -0.3, Y0 - 1.3, GZ + 0.015, 0.14, 0.03, mat('#4a4a46', 0.7), coll=coll)
    cyl('env_gct_quat_long', -0.3, Y0 - 1.3, GZ + 0.95, 0.19, 0.04, mat('#8a8a84', 0.5, 0.5), axis='X', coll=coll)
    for k in range(4):
        B(f'gia_go{k}', -1.35, -1.05, Y0 + 0.9 + 0.55 * k * 0.0, Y0 + 1.25, GZ + 0.05 + 0.3 * k, GZ + 0.07 + 0.3 * k, mat('#7a5a38', 0.85), coll=coll) if k < 3 else None
    for k in range(4): B(f'gia_chan{k}', -1.35 + 0.28 * (k % 2), -1.32 + 0.28 * (k % 2), Y0 + 0.9 + 0.33 * (k // 2), Y0 + 0.93 + 0.33 * (k // 2), GZ, GZ + 0.65, mat('#7a5a38', 0.85), coll=coll)
    for k in range(6): cyl(f'env_gct_tre{k}', -1.32 + 0.03 * k, Y0 + 2.4 + 0.02 * (k % 2), GZ + 0.8, 0.014, 1.6, mat('#a8a050', 0.7), coll=coll, rot=(math.radians(8), math.radians(-6), 0))
    # ---------------------------------------------------------------- QUẦY NHẬN ĐỒ: mái bạt + bàn trải khăn + giá treo áo + hộp ủng hộ + biển gỗ
    ys = Y0 - 3.4                    # tâm quầy (dọc tường, về phía cuối sân)
    wd = mat('#8a6a42', 0.8); wd2 = mat('#5a3e22', 0.85); cloth = mat('#e8dcc0', 0.95)
    # mái bạt dốc ra ngoài, hai cột trước, vài sợi dây đèn lồng nhỏ
    awn_r, awn_b = mat('#b3453a', 0.7), mat('#e9e2d0', 0.7)
    for k in range(7):
        y0_ = ys - 1.4 + 0.4 * k
        B(f'mai_bat{k}', -1.45, 0.0, y0_, y0_ + 0.4, GZ + 2.08, GZ + 2.1, awn_r if k % 2 == 0 else awn_b, coll=coll, rot=(0, math.radians(-7), 0), pivot=(0.0, y0_ + 0.2, GZ + 2.2))
    B('mai_diem', -1.5, -1.42, ys - 1.4, ys + 1.4, GZ + 1.88, GZ + 2.0, mat('#b3453a', 0.7), coll=coll)
    for yy in (ys - 1.35, ys + 1.35):
        cyl(f'env_gct_cot_mai{yy:.1f}', -1.42, yy, GZ + 0.98, 0.025, 1.96, wd2, coll=coll)
    lan = X.M.emission('gct_den_long', '#ffcf80', 5.0)
    for k in range(9):
        sphere(f'env_gct_den_long{k}', -1.42, ys - 1.3 + 0.325 * k, GZ + 1.8 - 0.02 * abs(k - 4) + 0.0, 0.035, lan, coll=coll).visible_shadow = False
    ld = bpy.data.lights.new('env_gct_den_quay', 'POINT'); ld.energy = 30; ld.color = (1.0, 0.8, 0.5); ld.shadow_soft_size = 0.25
    lo = bpy.data.objects.new('env_gct_den_quay', ld); lo.location = (X.mx(-0.85), ys, GZ + 1.75); coll.objects.link(lo)   # ánh đèn lồng hắt xuống bàn
    # bàn trải khăn
    tx0, tx1, ty0, ty1, th = -0.85, -0.2, ys - 0.8, ys + 0.8, 0.76
    B('ban_mat', tx0, tx1, ty0, ty1, GZ + th - 0.04, GZ + th, wd, bevel=0.006, coll=coll)
    for i, (xx, yy) in enumerate([(tx0 + 0.03, ty0 + 0.03), (tx1 - 0.06, ty0 + 0.03), (tx0 + 0.03, ty1 - 0.06), (tx1 - 0.06, ty1 - 0.06)]):
        B(f'ban_chan{i}', xx, xx + 0.04, yy, yy + 0.04, GZ, GZ + th - 0.04, wd2, coll=coll)
    B('khan_ban', tx0 - 0.02, tx1 + 0.01, ty0 + 0.15, ty1 - 0.15, GZ + th - 0.001, GZ + th + 0.004, cloth, coll=coll)
    B('khan_rua1', tx0 - 0.02, tx0 - 0.005, ty0 + 0.15, ty1 - 0.15, GZ + th - 0.28, GZ + th + 0.004, cloth, coll=coll)
    # hàng hoá trên bàn: chồng áo gấp, chồng sách, ấm, lọ, đôi dép
    for k in range(4): B(f'ao_gap{k}', tx0 + 0.08, tx0 + 0.3, ty0 + 0.08, ty0 + 0.36, GZ + th + 0.004 + 0.03 * k, GZ + th + 0.03 * (k + 1), mat(['#4f7ea8', '#e0c070', '#a05a64', '#6aa07a'][k], 0.95), bevel=0.006, coll=coll)
    for k in range(5): B(f'sach_ban{k}', tx0 + 0.08, tx0 + 0.28, ty0 + 0.5, ty0 + 0.76, GZ + th + 0.004 + 0.035 * k, GZ + th + 0.035 * (k + 1), mat(['#c46a3a', '#3a5a8a', '#d0b060', '#5a8a5a', '#8a4a6a'][k], 0.8), bevel=0.003, coll=coll, rot=(0, 0, math.radians(3 * k)), pivot=(tx0 + 0.18, ty0 + 0.63, GZ + th))
    X.cyl('env_gct_am', tx0 + 0.32, ty0 + 1.18, GZ + th + 0.09, 0.075, 0.16, mat('#9aa6a8', 0.35, 0.6), coll=coll); X.sphere('env_gct_am_nap', tx0 + 0.32, ty0 + 1.18, GZ + th + 0.18, 0.03, mat('#6a7678', 0.4, 0.6), coll=coll)
    X.cyl('env_gct_lo_thuy_tinh', tx0 + 0.15, ty0 + 1.35, GZ + th + 0.08, 0.05, 0.16, mat('#a8c4c0', 0.1), coll=coll)
    for k, dy_ in enumerate((0, 0.1)): B(f'dep{k}', tx0 + 0.4, tx0 + 0.55, ty0 + 0.12 + dy_ * 1.2, ty0 + 0.2 + dy_ * 1.2 + 0.03, GZ + th + 0.004, GZ + th + 0.03, mat('#2f6a8a', 0.7), bevel=0.01, coll=coll)
    # hộp ủng hộ có khe bỏ vào
    B('hop_ung_ho', tx1 - 0.3, tx1 - 0.06, ty1 - 0.55, ty1 - 0.28, GZ + th + 0.004, GZ + th + 0.3, mat('#c6472f', 0.6), bevel=0.01, coll=coll)
    B('hop_khe', tx1 - 0.3 + 0.07, tx1 - 0.3 + 0.17, ty1 - 0.5, ty1 - 0.33, GZ + th + 0.296, GZ + th + 0.302, mat('#1a1a1a', 0.5), coll=coll)
    # giá treo áo + áo treo
    rk = ys - 2.2; ra = mat('#6a6a66', 0.5, 0.6)
    for yy in (rk - 0.7, rk + 0.7): cyl(f'env_gct_rk_cot{yy:.1f}', -0.35, yy, GZ + 0.8, 0.018, 1.6, ra, coll=coll); B(f'rk_chan{yy:.1f}', -0.5, -0.2, yy - 0.025, yy + 0.025, GZ, GZ + 0.03, ra, coll=coll)
    cyl('env_gct_rk_thanh', -0.35, rk, GZ + 1.58, 0.014, 1.5, ra, axis='Y', coll=coll)
    for k in range(7):
        yy = rk - 0.55 + 0.18 * k; hh = rnd.uniform(0.55, 0.85); wdt = rnd.uniform(0.11, 0.15)
        B(f'rk_ao{k}', -0.35 - wdt / 2, -0.35 + wdt / 2, yy - 0.025, yy + 0.025, GZ + 1.56 - hh, GZ + 1.52, mat(rnd.choice(['#5a7aa8', '#c47a50', '#7a9a6a', '#a85a6a', '#d0c080', '#4a4a5a']), 0.95), bevel=0.01, coll=coll, rot=(0, rnd.uniform(-0.1, 0.1), 0), pivot=(-0.35, yy, GZ + 1.52))
        B(f'rk_moc{k}', -0.352, -0.348, yy - 0.05, yy + 0.05, GZ + 1.52, GZ + 1.58, mat('#888888', 0.4, 0.8), coll=coll)
    # biển gỗ treo trên tường + chữ
    B('bien_go', -0.03, -0.012, ys - 0.62, ys + 0.62, GZ + 1.52, GZ + 1.86, wd2, bevel=0.008, coll=coll)
    B('bien_vien', -0.031, -0.013, ys - 0.58, ys + 0.58, GZ + 1.56, GZ + 1.82, mat('#e2d2a8', 0.8), coll=coll)
    try:
        for li, (txt, size, dz) in enumerate([('ĐỒ CHO TẶNG', 0.12, 1.66)]):
            cu = bpy.data.curves.new(f'env_gct_bien_chu{li}', 'FONT'); cu.body = txt; cu.size = size; cu.extrude = 0.0008; cu.align_x = 'CENTER'
            if font: cu.font = font
            ob = bpy.data.objects.new(f'env_gct_bien_chu{li}', cu); ob.data.materials.append(mat('#3a2410', 0.6))
            R = Matrix(((0, 0, 1), (1, 0, 0), (0, 1, 0))); ob.rotation_euler = R.to_euler(); ob.location = (X.mx(-0.036), ys, GZ + dz - 0.05)
            coll.objects.link(ob)
    except Exception as e:
        print('chữ biển lỗi:', e)
    # ---------------------------------------------------------------- CHI TIẾT BỔ SUNG cho các món đồ ở quầy và góc đồ cũ
    def chu(name, txt, size, x, y, z, col='#2a2a2a'):
        try:
            cu = bpy.data.curves.new('env_gct_' + name, 'FONT'); cu.body = txt; cu.size = size; cu.extrude = 0.0006; cu.align_x = 'CENTER'
            if font: cu.font = font
            ob = bpy.data.objects.new('env_gct_' + name, cu); ob.data.materials.append(mat(col, 0.6))
            ob.rotation_euler = Matrix(((0, 0, 1), (1, 0, 0), (0, 1, 0))).to_euler(); ob.location = (X.mx(x), y, z); coll.objects.link(ob)
        except Exception as e:
            print('chữ lỗi:', name, e)
    # sách: gáy vàng, nhãn tên, dây đánh dấu trang
    for k in range(5):
        z0_ = GZ + th + 0.004 + 0.035 * k
        B(f'sach_gay{k}', tx0 + 0.075, tx0 + 0.285, ty0 + 0.5, ty0 + 0.512, z0_ + 0.004, z0_ + 0.031, mat('#d9b85a', 0.5, 0.4), coll=coll)
        B(f'sach_trang{k}', tx0 + 0.09, tx0 + 0.27, ty0 + 0.512, ty0 + 0.745, z0_ + 0.006, z0_ + 0.029, mat('#efe6cf', 0.95), coll=coll)   # mép giấy
    B('sach_nhan', tx0 + 0.12, tx0 + 0.24, ty0 + 0.56, ty0 + 0.7, GZ + th + 0.18, GZ + th + 0.1855, mat('#f1ead0', 0.8), coll=coll)
    B('sach_day', tx0 + 0.15, tx0 + 0.155, ty0 + 0.68, ty0 + 0.83, GZ + th + 0.08, GZ + th + 0.085, mat('#a8322a', 0.6), coll=coll)
    # áo gấp: sọc và nhãn giặt
    for k in range(4):
        z0_ = GZ + th + 0.004 + 0.03 * k
        B(f'ao_soc{k}', tx0 + 0.08, tx0 + 0.3, ty0 + 0.08 + 0.05 * k, ty0 + 0.1 + 0.05 * k, z0_ + 0.0285, z0_ + 0.0305, mat('#f2f2ea', 0.9), coll=coll)
        B(f'ao_mep{k}', tx0 + 0.09, tx0 + 0.29, ty0 + 0.355, ty0 + 0.362, z0_ + 0.004, z0_ + 0.026, mat('#00000010'[:7] if False else '#303030', 0.9), coll=coll)
    # ấm: vòi, quai, nút nắp, nước sôi cũ
    kx, ky, kz = tx0 + 0.32, ty0 + 1.18, GZ + th
    X.cyl('env_gct_am_voi', kx, ky + 0.115, kz + 0.1, 0.012, 0.13, mat('#9aa6a8', 0.35, 0.6), coll=coll, rot=(math.radians(-55), 0, 0))
    X.torus('env_gct_am_quai', kx, ky - 0.085, kz + 0.1, 0.05, 0.008, mat('#4a3a2a', 0.7), rot=(0, math.pi / 2, 0), coll=coll)
    X.sphere('env_gct_am_nut', kx, ky, kz + 0.2, 0.014, mat('#4a3a2a', 0.7), coll=coll)
    # lọ: nắp kim loại, nhãn, kẹo bên trong
    jx, jy = tx0 + 0.15, ty0 + 1.35
    X.cyl('env_gct_lo_nap', jx, jy, kz + 0.17, 0.052, 0.02, mat('#c0a050', 0.4, 0.8), coll=coll)
    X.cyl('env_gct_lo_ruot', jx, jy, kz + 0.07, 0.043, 0.12, mat('#d9a04a', 0.6), coll=coll)
    X.cyl('env_gct_lo_nhan', jx, jy, kz + 0.085, 0.0515, 0.05, mat('#f1e6c8', 0.8), coll=coll)
    # dép: đế, quai chéo
    for k, dy_ in enumerate((0, 0.12)):
        yb = ty0 + 0.12 + dy_
        B(f'dep_quai{k}', tx0 + 0.43, tx0 + 0.52, yb + 0.002, yb + 0.012, GZ + th + 0.03, GZ + th + 0.04, mat('#e8c458', 0.6), coll=coll, rot=(0, math.radians(18), 0), pivot=(tx0 + 0.475, yb + 0.007, GZ + th + 0.03))
        B(f'dep_de{k}', tx0 + 0.385, tx0 + 0.555, yb - 0.01, yb + 0.07, GZ + th + 0.0, GZ + th + 0.01, mat('#1f4a63', 0.8), bevel=0.003, coll=coll)
    # hộp ủng hộ: chữ + dải băng keo
    chu('chu_ung_ho', 'ỦNG HỘ', 0.045, tx1 - 0.302, ty1 - 0.415, GZ + th + 0.13, '#f4ecd8')
    B('hop_bang_keo', tx1 - 0.3, tx1 - 0.06, ty1 - 0.425, ty1 - 0.405, GZ + th + 0.296, GZ + th + 0.306, mat('#d8c890', 0.5), coll=coll)
    # gấu bông cũ + đồng hồ báo thức + thẻ "lấy tùy tâm"
    bx, by = tx0 + 0.47, ty0 + 0.72; bz = GZ + th; bt = mat('#c9965a', 0.95)
    X.sphere('env_gct_gau_than', bx, by, bz + 0.07, 0.055, bt, scale=(1, 1, 1.15), coll=coll); X.sphere('env_gct_gau_dau', bx, by, bz + 0.165, 0.042, bt, coll=coll)
    for sgn in (-1, 1):
        X.sphere(f'env_gct_gau_tai{sgn}', bx, by + sgn * 0.034, bz + 0.2, 0.014, bt, coll=coll); X.sphere(f'env_gct_gau_tay{sgn}', bx, by + sgn * 0.065, bz + 0.09, 0.02, bt, coll=coll)
        X.sphere(f'env_gct_gau_mat{sgn}', bx - 0.036, by + sgn * 0.016, bz + 0.175, 0.006, mat('#1a1a1a', 0.4), coll=coll)
    X.sphere('env_gct_gau_mui', bx - 0.04, by, bz + 0.162, 0.01, mat('#3a2616', 0.5), coll=coll)
    X.cyl('env_gct_dong_ho', tx0 + 0.52, ty0 + 0.98, bz + 0.05, 0.045, 0.03, mat('#b84a3a', 0.4, 0.3), axis='X', coll=coll)
    X.cyl('env_gct_dong_ho_mat', tx0 + 0.505, ty0 + 0.98, bz + 0.05, 0.036, 0.004, mat('#f4f0e0', 0.5), axis='X', coll=coll)
    B('the_lay', tx0 + 0.58, tx0 + 0.585, ty0 + 0.25, ty0 + 0.5, bz + 0.0, bz + 0.12, mat('#f2e8c4', 0.85), coll=coll, rot=(0, math.radians(-8), 0), pivot=(tx0 + 0.58, ty0 + 0.37, bz))
    chu('chu_the_lay', 'Lấy tùy tâm', 0.022, tx0 + 0.574, ty0 + 0.375, bz + 0.055, '#5a2a18')
    # rổ mây dưới bàn đựng đồ chơi
    wk = mat('#b08a4a', 0.9)
    X.cyl('env_gct_ro', -0.55, ys - 0.15, GZ + 0.13, 0.17, 0.26, wk, coll=coll); X.torus('env_gct_ro_vanh', -0.55, ys - 0.15, GZ + 0.26, 0.17, 0.012, mat('#8a6a34', 0.9), coll=coll)
    for k, c_ in enumerate(['#d84a4a', '#4a8ad8', '#e8c030']): X.sphere(f'env_gct_ro_bong{k}', -0.55 + 0.07 * math.cos(k * 2.1), ys - 0.15 + 0.07 * math.sin(k * 2.1), GZ + 0.28, 0.06, mat(c_, 0.5), coll=coll)
    # đôi giày cũ dưới bàn
    for k, dy_ in enumerate((0, 0.14)):
        B(f'giay_cu{k}', -0.42, -0.2, ys + 0.3 + dy_, ys + 0.38 + dy_, GZ, GZ + 0.05, mat('#4a4036', 0.85), bevel=0.012, coll=coll)
        B(f'giay_mu{k}', -0.42, -0.31, ys + 0.3 + dy_, ys + 0.38 + dy_, GZ + 0.05, GZ + 0.085, mat('#5a4e42', 0.85), bevel=0.012, coll=coll)
    # giá treo áo: tay áo + thẻ giá
    for k in range(7):
        yy = rk - 0.55 + 0.18 * k
        for sg in (-1, 1): B(f'rk_tay{k}_{sg}', -0.35 + sg * 0.085, -0.35 + sg * 0.125, yy - 0.02, yy + 0.02, GZ + 1.26, GZ + 1.5, mat(['#5a7aa8', '#c47a50', '#7a9a6a', '#a85a6a', '#d0c080', '#4a4a5a', '#5a7aa8'][k], 0.95), coll=coll, rot=(0, sg * math.radians(14), 0), pivot=(-0.35 + sg * 0.1, yy, GZ + 1.5))
        if k % 2 == 0:
            B(f'rk_the{k}', -0.47, -0.465, yy - 0.015, yy + 0.015, GZ + 1.28, GZ + 1.33, mat('#f0e8c8', 0.8), coll=coll); B(f'rk_day{k}', -0.4745, -0.4725, yy - 0.001, yy + 0.001, GZ + 1.33, GZ + 1.51, mat('#8a2a20', 0.6), coll=coll)
    # quạt: lồng, cánh, nút chỉnh
    fx, fy, fz = -0.3, Y0 - 1.3, GZ + 0.95
    X.torus('env_gct_quat_long_vanh', fx, fy, fz, 0.19, 0.006, mat('#9a9a94', 0.4, 0.7), rot=(0, math.pi / 2, 0), coll=coll)
    for k in range(3): B(f'quat_canh{k}', fx - 0.012, fx - 0.004, fy - 0.025, fy + 0.025, fz + 0.01, fz + 0.16, mat('#b8c4cc', 0.3), coll=coll, rot=(k * 2 * math.pi / 3, 0, 0), pivot=(fx - 0.008, fy, fz))
    X.sphere('env_gct_quat_truc', fx - 0.01, fy, fz, 0.03, mat('#555550', 0.5, 0.5), coll=coll)
    for k in range(6): B(f'quat_song{k}', fx - 0.018, fx - 0.016, fy - 0.19, fy + 0.19, fz - 0.005, fz + 0.005, mat('#9a9a94', 0.4, 0.7), coll=coll, rot=(k * math.pi / 6, 0, 0), pivot=(fx - 0.017, fy, fz))
    # ghế gãy: đệm đỏ cũ + dây buộc tạm chân gãy
    B('ghe_dem', cx - 0.19, cx + 0.19, cy - 0.19, cy + 0.19, GZ + 0.45, GZ + 0.49, mat('#9a3a30', 0.95), bevel=0.012, coll=coll, rot=(math.radians(9), 0, math.radians(14)), pivot=(cx, cy, GZ + 0.43))
    # thùng carton: băng keo + chữ viết tay
    B('thung_keo1', -0.5, -0.15, Y0 + 0.76, Y0 + 0.8, GZ + 0.701, GZ + 0.706, mat('#c8a060', 0.4), coll=coll, rot=(0, 0, math.radians(10)), pivot=(-0.33, Y0 + 0.78, GZ + 0.7))
    chu('chu_thung', 'SÁCH CŨ', 0.07, -0.556, Y0 + 0.78, GZ + 0.19, '#2a2018')
    # gương: dấu bàn tay trên lớp bụi
    for k in range(5): B(f'guong_ngon{k}', X0 - 0.0092, X0 - 0.0088, Y0 - 0.09 + 0.04 * k, Y0 - 0.07 + 0.04 * k, GZ + 0.62 + 0.03 * (k % 2) + 0.05 * (k == 0) * -1, GZ + 0.8 + 0.03 * (k % 2) + (0.0 if k else -0.1), mat('#6a6a64', 0.3), coll=coll, rot=(0, math.radians(6), 0), pivot=pv)
    # ---------------------------------------------------------------- sàn ướt: vệt nước + vũng phản chiếu
    if mua:
        wet = mat('#3e4540', 0.12)
        for k in range(9):
            r = rnd.uniform(0.25, 0.7)
            sphere(f'env_gct_vet_uot{k}', rnd.uniform(-1.4, -0.2), rnd.uniform(Y0 - 1.6, Y0 + 2.3), GZ + 0.0015, r, wet, scale=(1, 1, 0.0025), coll=coll)
        pud = mat('#27323a', 0.02, 0.0)
        for k, (px_, py_, r) in enumerate([(-0.9, Y0 - 0.3, 0.45), (-0.45, Y0 + 1.5, 0.35), (-1.2, Y0 + 1.4, 0.3), (-0.6, Y0 - 1.5, 0.4)]):
            sphere(f'env_gct_vung{k}', px_, py_, GZ + 0.003, r, pud, scale=(1.2, 1, 0.003), coll=coll)
        # mưa thưa: vệt dài mảnh nghiêng, RƠI THEO KHUNG HÌNH bằng driver (frame × tốc độ, quay vòng) — không tốn khung khoá
        rain = X.M.emission('gct_mua', '#dde8f0', 0.55)
        def fall(ob, spd, off, H):
            d = ob.driver_add('location', 2).driver; d.type = 'SCRIPTED'; d.expression = f'-fmod(frame*{spd:.4f}+{off:.4f},{H:.3f})'
        for k in range(170):
            x_ = rnd.uniform(-4.5, 0.0); y_ = rnd.uniform(Y0 - 3.0, Y0 + 3.5); z_ = GZ + rnd.uniform(0.3, 6.0)
            ob = B(f'hat_mua{k}', x_, x_ + 0.0016, y_, y_ + 0.0016, z_, z_ + rnd.uniform(0.35, 0.7), rain, coll=coll, rot=(math.radians(7), 0, 0), pivot=(x_, y_, z_))
            ob.visible_shadow = False; fall(ob, rnd.uniform(0.27, 0.33), rnd.uniform(0, 6.5), 6.5)
        # nước chảy thành sợi từ mép sàn tầng 3 / mái hiên trên cầu thang xuống sân (chuỗi giọt rơi nhanh hơn mưa)
        wt = X.M.emission('gct_nuoc_chay', '#cfe4f2', 0.9)
        for k in range(9):
            yy = -1.9 + 0.16 * k + rnd.uniform(-0.02, 0.02); xx = -1.62
            for j in range(10):
                ob = sphere(f'env_gct_giot{k}_{j}', xx, yy, GZ + 5.7, 0.012, wt, scale=(1, 1, 3.5), coll=coll); ob.visible_shadow = False
                d = ob.driver_add('location', 2).driver; d.type = 'SCRIPTED'
                d.expression = f'-fmod(frame*0.36+{j * 0.58 + k * 0.21:.3f},5.800)'
        # vòng gợn lan trên vũng nước (torus dẹt nở dần rồi biến mất)
        for k, (px_, py_) in enumerate([(-0.9, Y0 - 0.3), (-0.45, Y0 + 1.5), (-1.2, Y0 + 1.4), (-0.6, Y0 - 1.5), (-0.8, Y0 - 0.1)]):
            X.torus(f'env_gct_gon{k}', px_, py_, GZ + 0.004, 0.18, 0.004, mat('#9fb4c0', 0.1), coll=coll)
            ob = bpy.data.objects[f'env_gct_gon{k}']; ob.visible_shadow = False
            for ax in (0, 1):
                dr = ob.driver_add('scale', ax).driver; dr.type = 'SCRIPTED'; dr.expression = f'0.15+fmod(frame*0.045+{k * 0.37:.2f},1.0)*1.3'
