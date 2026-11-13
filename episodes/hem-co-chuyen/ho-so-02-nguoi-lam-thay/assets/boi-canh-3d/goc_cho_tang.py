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
