"""BỜ KÈ SÔNG HỒNG LÚC CHIỀU TÀ — chuyển cảnh 3.1 → 3.2, Shot 2 "khoảng lặng mênh mông" (15/11/2026).

Chạy:  /tmp/bpyenv/bin/python bo_ke.py --cam BK_EWS --mode hoang_hon --muc nhap --out /tmp/bk.png
       /tmp/bpyenv/bin/python bo_ke.py --cam BK_EWS --chuyen --frame 240 ...   (trời chuyển màu liên tục khung 1–480 = 20 s)
Camera: BK_EWS (Extreme Wide Shot tĩnh: Nam bé xíu trên bậc kè, sông và cầu xa) · BK_TRUNG (ngang người, bó gối)
        · BK_SAU_LUNG (sau lưng Nam nhìn ra sông, cầu sắt bên phải) · BK_DE (từ mặt đê nhìn xuống kè).
Mode: chieu (xám nhạt ~15h) · hoang_hon (vàng cam ~17h) · do (đỏ quạch cuối ngày ~17h30). --chuyen: keyframe chieu → hoang_hon → do.

Toạ độ: bờ chạy dọc trục X; đê (mặt đường) ở y 0…10, z 4,5; mái kè 12 bậc đá từ y 0 xuống y −4,8, mặt nước z 0,2;
sông rộng ~650 m tới bãi bồi bờ bên kia; phố xa y −900…−1500. Cầu sắt kiểu giàn (gợi Long Biên, không sao chép) ở x ≈ 190.
Nhiều vật rất xa → toi_uu giảm chi tiết mạnh; nhưng mặt nước cần thấy phản chiếu trời/cầu nên giữ hiện trong phản chiếu (tat_phan_chieu=False).
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from mathutils import Vector
import vat_lieu as M, hinh_khoi as K, toi_uu

DE_Z = 4.5; SO_BAC = 12; NUOC_Z = 0.2; BAC_SAU = 0.55; BO_XA = -650.0; CAU_X = 190.0
NAM = (0.0, -2.0)    # chỗ Nam ngồi (x, y) trên bậc thứ 5
CAMS = {
    'BK_EWS':      ((-70.0, -10.0, 5.0), (0.0, -3.0, 2.0), 35),
    'BK_TRUNG':    ((3.2, -4.6, 2.2), (0.0, -3.0, 2.6), 35),
    'BK_SAU_LUNG': ((-0.8, 1.2, 5.4), (40.0, -200.0, 0.0), 28),
    'BK_DE':       ((-9.0, 1.0, 6.4), (0.0, -3.2, 1.9), 32),
}
TROI = {  # (chân trời, đỉnh, màu nắng, độ mạnh nắng, hướng nắng, mặt trời cao (độ), phơi sáng)
    'chieu':     ('#c9c7c0', '#8f9aa6', '#f3ead8', 2.0, -12, 14, 0.2),
    'hoang_hon': ('#f2a65a', '#6d7fa3', '#ff9a48', 3.5, -8, 5, 0.0),
    'do':        ('#b8321f', '#3a2b44', '#ff5a2a', 2.2, -6, 1.5, 0.15),
}


def vat_lieu():
    m = {}
    m['da'] = M.mottled('bk_da_ke', '#8d8a82', rough=0.9, vary=0.18, bump=0.35, bump_scale=18)
    m['mui_bac'] = M.mottled('bk_mui_bac', '#c9c3b4', rough=0.85, vary=0.12)
    m['da_moc'] = M.mottled('bk_da_moc', '#6d7462', rough=0.95, vary=0.2)
    m['duong'] = M.mottled('bk_duong', '#5a5a58', rough=0.85, vary=0.1)
    m['co'] = M.mottled('bk_co', '#6f8a45', rough=0.95, vary=0.25)
    m['cat'] = M.mottled('bk_bai_boi', '#b49a6e', rough=0.95, vary=0.15)
    m['ngo'] = M.mottled('bk_ruong_ngo', '#7d8a46', rough=0.95, vary=0.3)
    m['sat_cau'] = M.solid('bk_sat_cau', '#3d3a36', 0.6, 0.6)
    m['tru_cau'] = M.mottled('bk_tru_cau', '#7a7368', rough=0.9)
    m['nuoc'] = nuoc()
    m['than_cay'] = M.solid('bk_than_cay', '#4a3c30', 0.9)
    m['la'] = M.mottled('bk_la', '#4b6a36', rough=0.9, vary=0.2)
    m['nha'] = [M.mottled(f'bk_nha_{i}', c, rough=0.9) for i, c in enumerate(('#b9b3a8', '#a7a39b', '#c8bfae', '#8f8c86'))]
    m['den'] = M.solid('bk_cot_den', '#2f3330', 0.5, 0.6)
    m['ao'] = M.solid('bk_ao_nam', '#e9e6dc', 0.8); m['quan'] = M.solid('bk_quan', '#252a35', 0.8); m['da_nguoi'] = M.solid('bk_da_nguoi', '#d6a57e', 0.6)
    m['balo'] = M.solid('bk_balo', '#2d3a2a', 0.8); m['toc'] = M.solid('bk_toc', '#1b1712', 0.7)
    return m


def nuoc():
    """Nước phù sa sông Hồng: nâu đỏ đục (không trong), bóng vừa để bắt ánh hoàng hôn; gợn sóng Wave + Noise trôi theo khung (driver #frame)."""
    mt = bpy.data.materials.new('bk_nuoc'); mt.use_nodes = True; nt = mt.node_tree; N, L = nt.nodes, nt.links
    b = next(n for n in N if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = M._hex('#7a5a3e'); b.inputs['Roughness'].default_value = 0.12
    if 'Specular IOR Level' in b.inputs: b.inputs['Specular IOR Level'].default_value = 0.6
    tc = N.new('ShaderNodeTexCoord'); mp = N.new('ShaderNodeMapping'); L.new(tc.outputs['Object'], mp.inputs['Vector'])
    drv = mp.inputs['Location'].driver_add('default_value', 0).driver; drv.expression = 'frame * 0.02'   # dòng chảy trôi theo X
    wv = N.new('ShaderNodeTexWave'); wv.inputs['Scale'].default_value = 0.35; wv.inputs['Distortion'].default_value = 6; wv.inputs['Detail'].default_value = 4
    wv.bands_direction = 'Y'
    nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 1.6
    L.new(mp.outputs['Vector'], wv.inputs['Vector']); L.new(mp.outputs['Vector'], nz.inputs['Vector'])
    ad = N.new('ShaderNodeMath'); ad.operation = 'ADD'; L.new(wv.outputs['Fac'], ad.inputs[0]); L.new(nz.outputs['Fac'], ad.inputs[1])
    bp = N.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.18; bp.inputs['Distance'].default_value = 0.05
    L.new(ad.outputs[0], bp.inputs['Height']); L.new(bp.outputs['Normal'], b.inputs['Normal'])
    return mt


def de_va_ke(m, c, rnd):
    B = K.box
    X0, X1 = -400, 400
    B('bk_mat_de', X0, X1, 0, 10, DE_Z - 0.3, DE_Z, m['duong'], c)
    B('bk_le_co_de', X0, X1, 10, 40, DE_Z - 0.4, DE_Z - 0.05, m['co'], c)
    B('bk_bo_via', X0, X1, -0.15, 0.25, DE_Z, DE_Z + 0.45, m['da'], c)
    for i in range(SO_BAC):   # bậc đá: gần (|x| < 30) tách từng đoạn có lệch nhẹ cho thật; xa là một dải liền
        z1 = DE_Z - (i + 1) * (DE_Z - NUOC_Z + 0.4) / SO_BAC + 0.0; y0 = -(i + 1) * BAC_SAU; y1 = -i * BAC_SAU
        for k, (a, b) in enumerate([(X0, -30)] + [(-30 + 3 * j, -27 + 3 * j) for j in range(20)] + [(30, X1)]):
            d = rnd.uniform(-0.02, 0.02) if b - a < 10 else 0.0
            B(f'bk_bac_{i}_{k}', a + 0.01, b - 0.01, y0, y1 + 0.02, -0.5, z1 + d, m['da'] if rnd.random() > 0.15 or b - a > 10 else m['da_moc'], c)
        B(f'bk_mui_bac_{i}', X0, X1, y0 - 0.02, y0 + 0.07, z1 - 0.06, z1 + 0.025, m['mui_bac'], c)   # mũi bậc sáng màu: đọc rõ từng bậc dù ngược sáng
    B('bk_chan_ke', X0, X1, -SO_BAC * BAC_SAU - 3.0, -SO_BAC * BAC_SAU, -1.0, NUOC_Z - 0.1, m['da_moc'], c)
    # cỏ dại mọc khe bậc gần chỗ Nam
    for k in range(40):
        x = rnd.uniform(-12, 12); i = rnd.randrange(SO_BAC)
        z = DE_Z - (i + 1) * (DE_Z - NUOC_Z + 0.4) / SO_BAC
        K.cyl(f'bk_co_dai_{k}', x, -(i + 1) * BAC_SAU + 0.05, z, 0.05, rnd.uniform(0.08, 0.25), m['co'], c, seg=5, r2=0.0)
    # hàng cây + cột đèn trên đê (instance)
    tmp = K.coll('_mau')
    me_cay = K.gop('bk_mau_cay', [K.cyl('t', 0, 0, 0, 0.16, 3.4, m['than_cay'], tmp, seg=8, r2=0.1)] +
                   [K.sphere(f'l{i}', 1.0 * math.cos(i * 1.3) * (i > 0), 1.0 * math.sin(i * 1.3) * (i > 0), 3.6 + 0.3 * (i % 2), 1.4, m['la'], tmp, scale=(1, 1, 0.7), seg=12) for i in range(5)])
    me_den = K.gop('bk_mau_den', [K.cyl('c', 0, 0, 0, 0.06, 6.0, m['den'], tmp, seg=8), K.box('can', -0.05, 0.05, -0.9, 0.0, 5.9, 5.98, m['den'], tmp),
                                  K.box('choa', -0.12, 0.12, -1.1, -0.75, 5.82, 5.9, m['den'], tmp)])
    bpy.data.collections.remove(tmp)
    for k in range(-40, 41):
        K.inst(f'bk_cay_de_{k}', me_cay, (k * 9.0 + rnd.uniform(-1, 1), 16.0, DE_Z - 0.1), c, rot=(0, 0, rnd.uniform(0, 6.3)), scale=(1, 1, rnd.uniform(0.85, 1.2)))
        if k % 3 == 0: K.inst(f'bk_den_{k}', me_den, (k * 9.0 + 4.5, 0.6, DE_Z), c)


def song_va_bo_ben_kia(m, c, rnd):
    B = K.box
    nuoc = B('bk_mat_nuoc', -3000, 3000, BO_XA, -SO_BAC * BAC_SAU - 0.5, NUOC_Z - 0.05, NUOC_Z, m['nuoc'], c); nuoc['giu_chi_tiet'] = True
    B('bk_bai_boi', -3000, 3000, BO_XA - 220, BO_XA, -0.5, 0.9, m['cat'], c)
    B('bk_ruong_ngo', -3000, 3000, BO_XA - 520, BO_XA - 220, -0.5, 1.2, m['ngo'], c)
    tmp = K.coll('_mau'); me_cay = K.gop('bk_mau_cay_xa', [K.cyl('t', 0, 0, 0, 1.2, 8.0, m['la'], tmp, seg=6, r2=0.2)]); bpy.data.collections.remove(tmp)
    for k in range(160):
        K.inst(f'bk_cay_xa_{k}', me_cay, (rnd.uniform(-1500, 1500), BO_XA - rnd.uniform(160, 300), 0.9), c, scale=(1, 1, rnd.uniform(0.7, 1.4)))
    # phố bên kia sông: dải nhà thấp + vài toà cao, tất cả vòng chân trời (giảm chi tiết, không đổ bóng)
    for k in range(140):
        x = rnd.uniform(-1800, 1800); y = rnd.uniform(-1500, -900); w = rnd.uniform(15, 50); h = rnd.uniform(8, 35) if rnd.random() > 0.12 else rnd.uniform(50, 110)
        B(f'bk_pho_{k}', x - w / 2, x + w / 2, y - w / 2, y + w / 2, 0, h, m['nha'][k % 4], c)


def cau_sat(m, c):
    """Cầu giàn thép nhiều nhịp (gợi cầu sắt cổ trên sông Hồng; dáng chung, không sao chép chi tiết). Một nhịp = một lưới instance."""
    tmp = K.coll('_mau_cau'); B = K.box; L = 60.0; Wd = 6.0; p = []
    for s in (-Wd / 2, Wd / 2):
        p.append(B(f'duoi{s}', s - 0.25, s + 0.25, 0, L, 0, 0.6, m['sat_cau'], tmp))
        n = 12
        for i in range(n):  # thanh biên trên cong (cao 4 m ở đầu, 10 m giữa nhịp) + thanh đứng + thanh chéo
            t0, t1 = i / n, (i + 1) / n
            z0 = 4 + 6 * math.sin(math.pi * t0); z1 = 4 + 6 * math.sin(math.pi * t1)
            ya, yb = t0 * L, t1 * L
            ln = math.hypot(yb - ya, z1 - z0); ang = math.atan2(z1 - z0, yb - ya)
            p.append(B(f'tren{s}{i}', s - 0.2, s + 0.2, (ya + yb) / 2 - ln / 2, (ya + yb) / 2 + ln / 2, (z0 + z1) / 2 - 0.2, (z0 + z1) / 2 + 0.2, m['sat_cau'], tmp, rot=(ang, 0, 0)))
            p.append(B(f'dung{s}{i}', s - 0.12, s + 0.12, ya - 0.12, ya + 0.12, 0.6, z0, m['sat_cau'], tmp))
            zc = (z0 + z1) / 2; ld = math.hypot(yb - ya, zc - 0.6); ad = math.atan2(zc - 0.6, yb - ya) * (1 if i % 2 else -1)
            p.append(B(f'cheo{s}{i}', s - 0.08, s + 0.08, (ya + yb) / 2 - ld / 2, (ya + yb) / 2 + ld / 2, (zc + 0.6) / 2 - 0.08, (zc + 0.6) / 2 + 0.08, m['sat_cau'], tmp, rot=(ad, 0, 0)))
    for i in range(7): p.append(B(f'ngang{i}', -Wd / 2, Wd / 2, i * L / 6 - 0.1, i * L / 6 + 0.1, 8.0 + 2 * math.sin(math.pi * i / 6) - 0.1, 8.0 + 2 * math.sin(math.pi * i / 6) + 0.1, m['sat_cau'], tmp))
    p.append(B('mat_cau', -Wd / 2, Wd / 2, 0, L, 0.0, 0.3, m['tru_cau'], tmp))
    me = K.gop('bk_mau_nhip_cau', p); bpy.data.collections.remove(tmp)
    me_tru = K.luoi_hop('bk_mau_tru_cau', -3.5, 3.5, -2.0, 2.0, -2.0, 14.0); me_tru.materials.append(m['tru_cau'])
    y = 30.0; k = 0
    while y > BO_XA - 20:
        K.inst(f'bk_nhip_{k}', me, (CAU_X, y - L, 14.0), c); K.inst(f'bk_tru_{k}', me_tru, (CAU_X, y - L, 0.0), c)
        y -= L; k += 1
    return k


def nam_ngoi(m, c):
    """Hình nhân Nam ngồi bó gối trên bậc (chỉ để canh khung; nhân vật thật thay sau)."""
    i = 5; z = DE_Z - (i + 1) * (DE_Z - NUOC_Z + 0.4) / SO_BAC; y = -(i + 1) * BAC_SAU + 0.22
    x = NAM[0]; tmp = K.coll('_nam')
    me = K.gop('bk_nam_proxy', [K.box('hong', -0.18, 0.18, -0.15, 0.2, 0.0, 0.18, m['quan'], tmp),
                               K.box('dui', -0.17, 0.17, -0.55, -0.1, 0.18, 0.48, m['quan'], tmp, rot=(math.radians(-35), 0, 0)),
                               K.cyl('than', 0, 0.05, 0.12, 0.17, 0.55, m['ao'], tmp, seg=12, r2=0.14, rot=(math.radians(18), 0, 0)),
                               K.sphere('dau', 0, -0.12, 0.78, 0.115, m['da_nguoi'], tmp, seg=14),
                               K.sphere('toc', 0, -0.1, 0.82, 0.12, m['toc'], tmp, scale=(1, 1, 0.8), seg=14),
                               K.box('balo', -0.16, 0.16, 0.18, 0.4, 0.1, 0.55, m['balo'], tmp)])
    bpy.data.collections.remove(tmp)
    ob = K.inst('bk_nam', me, (x, y, z), c); ob['giu_chi_tiet'] = True
    return ob


def troi_va_nang(mode, c, chuyen=False):
    w, cr, bg = K.troi(TROI[mode][0], TROI[mode][1], 1.0)
    sun = K.sun('bk_nang', (0, 1, -0.1), TROI[mode][3], TROI[mode][2], 0.6, c)
    dia = K.sphere('bk_mat_troi', 0, 0, 0, 22.0, M.emission('bk_dia_mat_troi', '#ffd9a0', 30.0), c, seg=24); dia.visible_shadow = False
    dia['giu_chi_tiet'] = True

    def dat(md, f=None):
        bot, top, col, en, az, el, ex = TROI[md]
        d = Vector((math.sin(math.radians(az)) * math.cos(math.radians(el)), -math.cos(math.radians(az)) * math.cos(math.radians(el)), math.sin(math.radians(el))))
        sun.rotation_euler = (-d).to_track_quat('-Z', 'Y').to_euler(); sun.data.energy = en; sun.data.color = M._hex(col)[:3]
        dia.location = d * 1800 + Vector((0, 0, 0)); dia.data.materials[0].node_tree.nodes['Emission'].inputs['Color'].default_value = M._hex(col)
        cr.color_ramp.elements[0].color = M._hex(bot); cr.color_ramp.elements[1].color = M._hex(top)
        bpy.context.scene.view_settings.exposure = ex
        if f is not None:
            for ob_, prop in ((sun, 'rotation_euler'), (dia, 'location')): ob_.keyframe_insert(prop, frame=f)
            sun.data.keyframe_insert('energy', frame=f); sun.data.keyframe_insert('color', frame=f)
            for e in cr.color_ramp.elements: e.keyframe_insert('color', frame=f)
            dia.data.materials[0].node_tree.nodes['Emission'].inputs['Color'].keyframe_insert('default_value', frame=f)
            bpy.context.scene.view_settings.keyframe_insert('exposure', frame=f)
    if chuyen:
        for md, f in (('chieu', 1), ('hoang_hon', 260), ('do', 480)): dat(md, f)
        bpy.context.scene.frame_start, bpy.context.scene.frame_end = 1, 480
    else:
        dat(mode)


def build(mode='hoang_hon', cam='BK_EWS', muc='duyet', nguoi=True, chuyen=False):
    bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
    c = K.coll('Bo_ke'); m = vat_lieu(); rnd = random.Random(11)
    de_va_ke(m, c, rnd); song_va_bo_ben_kia(m, c, rnd); n = cau_sat(m, c)
    if nguoi: nam_ngoi(m, c)
    for k, (p, t, f) in CAMS.items(): K.camera(k, p, t, f)
    sc.camera = bpy.data.objects[cam]
    troi_va_nang(mode, c, chuyen)
    st = toi_uu.apply(sc, [Vector(CAMS[cam][0])], muc, tat_phan_chieu=False)
    print(f'[bo_ke] {n} nhịp cầu, camera {cam}')
    return sc


if __name__ == '__main__':
    argv = sys.argv
    chuyen = '--chuyen' in argv
    if chuyen: argv.remove('--chuyen')
    a = K.tham_so('BK_EWS', ['hoang_hon', 'chieu', 'do'])
    sc = build(a.mode, a.cam, a.muc, not a.khong_nguoi, chuyen)
    K.ket_thuc(sc, a, f'/tmp/bk_{a.cam}.png')
