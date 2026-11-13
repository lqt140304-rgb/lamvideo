"""Vật liệu thủ tục (procedural) cho phòng trọ 3D — Soft Stylized PBR: roughness cao, không cần ảnh texture ngoài.

Màu gốc lấy từ bảng màu 2D đã duyệt (assets/boi-canh/boi-canh.tsx, bảng `C`): xem như Color Script. Mỗi vật liệu có chút biến thiên màu theo
nhiễu (tường loang, gỗ vân, gạch lệch tông) để bề mặt có đời sống nhưng vẫn lì mịn, không phản chiếu nhựa.
"""
import bpy


def _hex(h, a=1.0):
    h = h.lstrip('#')
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    f = lambda c: ((c + 0.055) / 1.055) ** 2.4 if c > 0.04045 else c / 12.92  # sRGB -> tuyến tính
    return (f(r), f(g), f(b), a)


def _new(name):
    m = bpy.data.materials.get(name)
    if m: return m
    m = bpy.data.materials.new(name); m.use_nodes = True
    return m


def _bsdf(m):
    nt = m.node_tree
    for n in list(nt.nodes):
        if n.type not in ('OUTPUT_MATERIAL',): nt.nodes.remove(n)
    out = next(n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL')
    b = nt.nodes.new('ShaderNodeBsdfPrincipled'); nt.links.new(b.outputs[0], out.inputs[0])
    return nt, b


def _set(b, **kw):
    for k, v in kw.items():
        key = {'sss': 'Subsurface Weight', 'spec': 'Specular IOR Level', 'coat': 'Coat Weight', 'emit': 'Emission Strength'}.get(k, k.replace('_', ' ').title())
        if key in b.inputs: b.inputs[key].default_value = v


def solid(name, color, rough=0.7, metal=0.0, **kw):
    m = _new(name); nt, b = _bsdf(m)
    b.inputs['Base Color'].default_value = _hex(color); _set(b, roughness=rough, metallic=metal, **kw)
    return m


def mottled(name, color, rough=0.85, scale=3.0, vary=0.08, bump=0.15, bump_scale=60.0, **kw):
    """Màu có loang nhẹ theo nhiễu + bump hạt mịn (tường vôi, vải, sơn cũ)."""
    m = _new(name); nt, b = _bsdf(m)
    tc = nt.nodes.new('ShaderNodeTexCoord'); n1 = nt.nodes.new('ShaderNodeTexNoise'); n1.inputs['Scale'].default_value = scale; n1.inputs['Detail'].default_value = 6
    nt.links.new(tc.outputs['Object'], n1.inputs['Vector'])
    mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.inputs['Factor'].default_value = vary * 4
    base = _hex(color); dark = tuple(c * 0.78 for c in base[:3]) + (1,)
    mix.inputs['A'].default_value = base; mix.inputs['B'].default_value = dark
    nt.links.new(n1.outputs['Fac'], mix.inputs['Factor']); mix.inputs['Factor'].default_value = 0
    nt.links.new(mix.outputs['Result'], b.inputs['Base Color'])
    n2 = nt.nodes.new('ShaderNodeTexNoise'); n2.inputs['Scale'].default_value = bump_scale; n2.inputs['Detail'].default_value = 8
    nt.links.new(tc.outputs['Object'], n2.inputs['Vector'])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = bump; bp.inputs['Distance'].default_value = 0.01
    nt.links.new(n2.outputs['Fac'], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    # biến thiên tông: dùng ColorRamp từ nhiễu thay cho mix hệ số cố định
    ramp = nt.nodes.new('ShaderNodeValToRGB'); ramp.color_ramp.elements[0].color = base; ramp.color_ramp.elements[1].color = tuple(min(1, c * (1 - vary)) for c in base[:3]) + (1,)
    nt.links.new(n1.outputs['Fac'], ramp.inputs['Fac']); nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    _set(b, roughness=rough, **kw)
    return m


def wall_plaster(name='tuong_voi', color='#ece1cb'):
    """Tường vôi: loang ẩm nhẹ gần trần/chân tường, hạt mịn."""
    m = mottled(name, color, rough=0.92, scale=1.6, vary=0.14, bump=0.24, bump_scale=90)
    nt = m.node_tree; b = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    # vệt ẩm: nhiễu lớn làm tối màu theo độ cao (đậm hơn gần sàn)
    tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
    n = nt.nodes.new('ShaderNodeTexNoise'); n.inputs['Scale'].default_value = 0.9; n.inputs['Detail'].default_value = 3; nt.links.new(tc.outputs['Object'], n.inputs['Vector'])
    ramp = nt.nodes.new('ShaderNodeValToRGB'); ramp.color_ramp.elements[0].position = 0.55; ramp.color_ramp.elements[0].color = (0.82, 0.78, 0.68, 1); ramp.color_ramp.elements[1].position = 0.75; ramp.color_ramp.elements[1].color = (1, 1, 1, 1)
    nt.links.new(n.outputs['Fac'], ramp.inputs['Fac'])
    mul = nt.nodes.new('ShaderNodeMix'); mul.data_type = 'RGBA'; mul.blend_type = 'MULTIPLY'; mul.inputs['Factor'].default_value = 0.6
    src = next(l.from_socket for l in nt.links if l.to_socket == b.inputs['Base Color'])
    nt.links.new(src, mul.inputs['A']); nt.links.new(ramp.outputs['Color'], mul.inputs['B']); nt.links.new(mul.outputs['Result'], b.inputs['Base Color'])
    return m


def phong_tran(name, color, rough=0.95, scale=0.8, vary=0.1, bump=0.12, vang=0.6, reu=0.5, z_reu=-2.0):
    """Tường phong trần kiểu khu tập thể: nền vôi loang + mảng vàng ố lớn (nhiễu tần số thấp) + rêu xanh sát chân tường (theo cao độ Object-Z) + hạt mịn."""
    m = mottled(name, color, rough=rough, scale=scale, vary=vary, bump=bump)
    nt = m.node_tree; b = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'); N, L = nt.nodes, nt.links
    src = next(l.from_socket for l in nt.links if l.to_socket == b.inputs['Base Color'])
    tc = N.new('ShaderNodeTexCoord'); sep = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Object'], sep.inputs['Vector'])
    n = N.new('ShaderNodeTexNoise'); n.inputs['Scale'].default_value = 0.55; n.inputs['Detail'].default_value = 4; L.new(tc.outputs['Object'], n.inputs['Vector'])
    rp = N.new('ShaderNodeValToRGB'); rp.color_ramp.elements[0].position = 0.42; rp.color_ramp.elements[0].color = (1, 1, 1, 1); rp.color_ramp.elements[1].position = 0.68
    rp.color_ramp.elements[1].color = (1 - 0.14 * vang * 1.4, 1 - 0.26 * vang * 1.4, 1 - 0.5 * vang * 1.4, 1); L.new(n.outputs['Fac'], rp.inputs['Fac'])
    m1 = N.new('ShaderNodeMix'); m1.data_type = 'RGBA'; m1.blend_type = 'MULTIPLY'; m1.inputs['Factor'].default_value = 1.0
    L.new(src, m1.inputs['A']); L.new(rp.outputs['Color'], m1.inputs['B'])
    n2 = N.new('ShaderNodeTexNoise'); n2.inputs['Scale'].default_value = 4.0; n2.inputs['Detail'].default_value = 6; L.new(tc.outputs['Object'], n2.inputs['Vector'])
    zr = N.new('ShaderNodeMapRange'); zr.inputs['From Min'].default_value = z_reu + 0.9; zr.inputs['From Max'].default_value = z_reu - 0.3; zr.inputs['To Min'].default_value = 0.0; zr.inputs['To Max'].default_value = 1.0; zr.clamp = True; L.new(sep.outputs['Z'], zr.inputs['Value'])
    mm = N.new('ShaderNodeMath'); mm.operation = 'MULTIPLY'; L.new(zr.outputs['Result'], mm.inputs[0]); L.new(n2.outputs['Fac'], mm.inputs[1])
    cr = N.new('ShaderNodeMath'); cr.operation = 'MULTIPLY'; cr.inputs[1].default_value = 1.8 * reu; L.new(mm.outputs[0], cr.inputs[0])
    m2 = N.new('ShaderNodeMix'); m2.data_type = 'RGBA'; m2.inputs['B'].default_value = (0.26, 0.36, 0.17, 1); L.new(cr.outputs[0], m2.inputs['Factor']); L.new(m1.outputs['Result'], m2.inputs['A'])
    L.new(m2.outputs['Result'], b.inputs['Base Color'])
    return m


def wood(name, color, dark=None, rough=0.6, scale=14.0):
    """Gỗ ép/gỗ tự nhiên: vân sóng + nhiễu, hơi sờn."""
    m = _new(name); nt, b = _bsdf(m)
    tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1, 1, 0.08)
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    w = nt.nodes.new('ShaderNodeTexWave'); w.inputs['Scale'].default_value = scale; w.inputs['Distortion'].default_value = 6; w.inputs['Detail'].default_value = 3
    nt.links.new(mp.outputs['Vector'], w.inputs['Vector'])
    ramp = nt.nodes.new('ShaderNodeValToRGB'); c0 = _hex(color); c1 = _hex(dark) if dark else tuple(c * 0.72 for c in c0[:3]) + (1,)
    ramp.color_ramp.elements[0].color = c0; ramp.color_ramp.elements[1].color = c1
    nt.links.new(w.outputs['Fac'], ramp.inputs['Fac']); nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.08; nt.links.new(w.outputs['Fac'], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    _set(b, roughness=rough)
    return m


def tiles(name, color='#d6ccb6', grout='#bdb39c', size=0.4, wall=False):
    """Sàn gạch men: lưới 40×40 cm, mạch vữa, mỗi viên lệch tông một chút."""
    m = _new(name); nt, b = _bsdf(m)
    tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping'); nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    if wall: mp.inputs['Rotation'].default_value = (1.5708, 0, 0)  # tường nằm trong mặt phẳng XZ: xoay để lưới gạch chạy theo x và z
    br = nt.nodes.new('ShaderNodeTexBrick'); br.offset = 0.0; br.inputs['Scale'].default_value = 1 / size; br.inputs['Mortar Size'].default_value = 0.012
    br.inputs['Brick Width'].default_value = 1.0; br.inputs['Row Height'].default_value = 1.0
    br.inputs['Color1'].default_value = _hex(color); br.inputs['Color2'].default_value = tuple(c * 0.94 for c in _hex(color)[:3]) + (1,); br.inputs['Mortar'].default_value = _hex(grout)
    nt.links.new(mp.outputs['Vector'], br.inputs['Vector']); nt.links.new(br.outputs['Color'], b.inputs['Base Color'])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.4; bp.inputs['Distance'].default_value = 0.004
    nt.links.new(br.outputs['Fac'], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    _set(b, roughness=0.38, spec=0.5)
    return m


def wall_tiles(name='gach_op_bep', color='#f1ede0', grout='#c9c3b2', size=0.2):
    m = tiles(name, color, grout, size, wall=True); b = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'); _set(b, roughness=0.3); return m


def glass(name='kinh'):
    """Kính cửa sổ: trong suốt với tia bóng (nắng lọt vào phòng), phản xạ nhẹ với tia nhìn."""
    m = _new(name); nt = m.node_tree
    for n in list(nt.nodes):
        if n.type != 'OUTPUT_MATERIAL': nt.nodes.remove(n)
    out = next(n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL')
    g = nt.nodes.new('ShaderNodeBsdfGlass'); g.inputs['Color'].default_value = (0.85, 0.95, 0.97, 1); g.inputs['Roughness'].default_value = 0.03; g.inputs['IOR'].default_value = 1.45
    t = nt.nodes.new('ShaderNodeBsdfTransparent'); lp = nt.nodes.new('ShaderNodeLightPath')
    mix = nt.nodes.new('ShaderNodeMixShader')
    mx_ = nt.nodes.new('ShaderNodeMath'); mx_.operation = 'MAXIMUM'; mx_.inputs[1].default_value = 0.93  # kính trong ~93% với mọi tia (nhìn ra ngoài rõ), chỉ còn chút phản xạ
    nt.links.new(lp.outputs['Is Shadow Ray'], mx_.inputs[0]); nt.links.new(mx_.outputs[0], mix.inputs['Fac']); nt.links.new(g.outputs[0], mix.inputs[1]); nt.links.new(t.outputs[0], mix.inputs[2]); nt.links.new(mix.outputs[0], out.inputs[0])
    return m


def emission(name, color, strength):
    m = _new(name); nt = m.node_tree
    for n in list(nt.nodes):
        if n.type != 'OUTPUT_MATERIAL': nt.nodes.remove(n)
    out = next(n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL')
    e = nt.nodes.new('ShaderNodeEmission'); e.inputs['Color'].default_value = _hex(color); e.inputs['Strength'].default_value = strength
    nt.links.new(e.outputs[0], out.inputs[0])
    return m


def mirror_mat(name='guong'):
    return solid(name, '#e8eef0', rough=0.02, metal=1.0)
