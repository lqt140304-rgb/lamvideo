"""Shader kính hóa nước (Liquid Glass) cho mặt gương — P3.05.
Một vật liệu, ba núm điều khiển có keyframe:
  tran  0→1 : gương phản xạ → kính nước (glass IOR 1,33–1,5 + phản xạ nhẹ)
  bien  0→1 : biên độ gợn sóng (Bump từ Wave Texture dạng vòng đồng tâm, tắt dần theo khoảng cách từ tâm)
  pha        : pha sóng (cho vòng lan ra từ điểm chạm)
Sắc sai (Chromatic Aberration): cộng 3 Glass BSDF đỏ/lục/lam với IOR lệch nhau (1,31 / 1,33 / 1,36) nên viền ảnh qua kính tách màu xanh–đỏ.
"""
import bpy
from mathutils import Vector


def build_material(center_world, name='guong_nuoc', ior=(1.31, 1.33, 1.36), ring_scale=7.0, pov=False):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear(); N = nt.nodes; L = nt.links
    tc = N.new('ShaderNodeTexCoord')
    mp = N.new('ShaderNodeMapping'); mp.vector_type = 'POINT'; mp.inputs['Location'].default_value = (-center_world[0], -center_world[1], -center_world[2])
    L.new(tc.outputs['Object'], mp.inputs['Vector']) if False else L.new(tc.outputs['Generated'], mp.inputs['Vector'])
    # dùng toạ độ thế giới: Generated của tấm kính nhỏ không đủ → dùng Geometry.Position
    geo = N.new('ShaderNodeNewGeometry'); L.new(geo.outputs['Position'], mp.inputs['Vector'])
    wave = N.new('ShaderNodeTexWave'); wave.wave_type = 'RINGS'; wave.rings_direction = 'SPHERICAL'; wave.wave_profile = 'SIN'
    wave.inputs['Scale'].default_value = ring_scale; wave.inputs['Distortion'].default_value = 2.4; wave.inputs['Detail'].default_value = 1.5; wave.inputs['Phase Offset'].default_value = 0.0
    L.new(mp.outputs['Vector'], wave.inputs['Vector'])
    ln = N.new('ShaderNodeVectorMath'); ln.operation = 'LENGTH'; L.new(mp.outputs['Vector'], ln.inputs[0])
    dec = N.new('ShaderNodeMath'); dec.operation = 'DIVIDE'; dec.inputs[0].default_value = 1.0
    add1 = N.new('ShaderNodeMath'); add1.operation = 'ADD'; add1.inputs[1].default_value = 1.0
    mul = N.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'; mul.inputs[1].default_value = 2.2
    L.new(ln.outputs['Value'], mul.inputs[0]); L.new(mul.outputs[0], add1.inputs[0]); L.new(add1.outputs[0], dec.inputs[1])
    hgt = N.new('ShaderNodeMath'); hgt.operation = 'MULTIPLY'; L.new(wave.outputs['Fac'], hgt.inputs[0]); L.new(dec.outputs[0], hgt.inputs[1])
    bump = N.new('ShaderNodeBump'); bump.inputs['Distance'].default_value = 0.035; bump.inputs['Strength'].default_value = 0.0
    L.new(hgt.outputs[0], bump.inputs['Height'])
    mirror = N.new('ShaderNodeBsdfGlossy'); mirror.inputs['Roughness'].default_value = 0.02; mirror.inputs['Color'].default_value = (0.91, 0.93, 0.94, 1)
    L.new(bump.outputs['Normal'], mirror.inputs['Normal'])
    gl = []
    for col, i in (((1, 0, 0, 1), ior[0]), ((0, 1, 0, 1), ior[1]), ((0, 0, 1, 1), ior[2])):
        g = N.new('ShaderNodeBsdfGlass'); g.inputs['Color'].default_value = col; g.inputs['IOR'].default_value = i; g.inputs['Roughness'].default_value = 0.0
        L.new(bump.outputs['Normal'], g.inputs['Normal']); gl.append(g)
    a1 = N.new('ShaderNodeAddShader'); a2 = N.new('ShaderNodeAddShader')
    L.new(gl[0].outputs[0], a1.inputs[0]); L.new(gl[1].outputs[0], a1.inputs[1]); L.new(a1.outputs[0], a2.inputs[0]); L.new(gl[2].outputs[0], a2.inputs[1])
    mix = N.new('ShaderNodeMixShader'); mix.inputs[0].default_value = 0.0
    L.new(mirror.outputs[0], mix.inputs[1]); L.new(a2.outputs[0], mix.inputs[2])
    out = N.new('ShaderNodeOutputMaterial')
    if pov:
        # Nhìn từ phía sau kính (Submersion): khối kính mỏng gây phản xạ toàn phần ở mặt sau → đen. Thay bằng màng nước nửa trong:
        # trong suốt + phản xạ glossy theo sóng + một chút khối xanh lục lam. `Backfacing` chọn đúng mặt.
        geo2 = N.new('ShaderNodeNewGeometry')
        tr = N.new('ShaderNodeBsdfTransparent'); gl2 = N.new('ShaderNodeBsdfGlossy'); gl2.inputs['Roughness'].default_value = 0.03; gl2.inputs['Color'].default_value = (0.7, 0.9, 0.95, 1)
        L.new(bump.outputs['Normal'], gl2.inputs['Normal'])
        tint = N.new('ShaderNodeBsdfTranslucent'); tint.inputs['Color'].default_value = (0.05, 0.35, 0.45, 1); L.new(bump.outputs['Normal'], tint.inputs['Normal'])
        mb = N.new('ShaderNodeMixShader'); mb.inputs[0].default_value = 0.12; L.new(tr.outputs[0], mb.inputs[1]); L.new(gl2.outputs[0], mb.inputs[2])
        mt = N.new('ShaderNodeMixShader'); L.new(mb.outputs[0], mt.inputs[1]); L.new(tint.outputs[0], mt.inputs[2])
        mt.inputs[0].default_value = 0.0
        bf = N.new('ShaderNodeMixShader'); L.new(geo2.outputs['Backfacing'], bf.inputs[0]); L.new(mt.outputs[0], bf.inputs[1]); L.new(mix.outputs[0], bf.inputs[2])
        # độ trong theo `tran`: tran=0 → vẫn là gương; ở POV cho 'tran' điều khiển độ tint
        ctl_tint = mt.inputs[0]
        L.new(bf.outputs[0], out.inputs['Surface'])
        m['ctl'] = 1
        return m, dict(tran=mix.inputs[0], bien=bump.inputs['Strength'], pha=wave.inputs['Phase Offset'], tint=ctl_tint)
    L.new(mix.outputs[0], out.inputs['Surface'])
    m['ctl'] = 1
    return m, dict(tran=mix.inputs[0], bien=bump.inputs['Strength'], pha=wave.inputs['Phase Offset'])


def key(sock, frame_vals):
    for f, v in frame_vals:
        sock.default_value = v; sock.keyframe_insert('default_value', frame=f)


def animate(ctl, N=72, tran0=0.0):
    """Mặc định: gương thường → gợn sóng từ tâm → hóa nước hoàn toàn → mặt nước phẳng lặng đóng băng."""
    key(ctl['tran'], [(1, tran0), (22, tran0), (46, 1.0), (N, 1.0)])
    key(ctl['bien'], [(1, 0.0), (14, 0.15), (30, 0.7), (56, 0.25), (N, 0.0)])
    key(ctl['pha'], [(1, 0.0), (N, 22.0)])


def apply(glass_obj, center_world, N=72, pov=False, tran0=0.0):
    mat, ctl = build_material(center_world, pov=pov)
    glass_obj.data.materials.clear(); glass_obj.data.materials.append(mat)
    animate(ctl, N, tran0)
    if 'tint' in ctl: key(ctl['tint'], [(1, 0.0), (22, 0.0), (46, 0.55), (N, 0.55)])
    return mat, ctl


def plane_cut(mat, p0, n, keep_front=True):
    """Bản sao vật liệu: phần nằm sau mặt phẳng (p0, n; n hướng vào phòng) trong suốt — Nam 'chìm' qua kính (keep_front=True: thấy phần trước
    kính, ẩn phần đã qua); keep_front=False: ngược lại (camera trong gương thấy phần đã lọt qua)."""
    mc = mat.copy(); mc.name = mat.name + ('__cat_t' if keep_front else '__cat_s'); nt = mc.node_tree
    out = next(n_ for n_ in nt.nodes if n_.type == 'OUTPUT_MATERIAL')
    if not out.inputs['Surface'].links: return mc
    src = out.inputs['Surface'].links[0].from_socket
    geo = nt.nodes.new('ShaderNodeNewGeometry')
    sub = nt.nodes.new('ShaderNodeVectorMath'); sub.operation = 'SUBTRACT'; sub.inputs[1].default_value = tuple(p0)
    nt.links.new(geo.outputs['Position'], sub.inputs[0])
    dot = nt.nodes.new('ShaderNodeVectorMath'); dot.operation = 'DOT_PRODUCT'; dot.inputs[1].default_value = tuple(n)
    nt.links.new(sub.outputs[0], dot.inputs[0])
    cmp = nt.nodes.new('ShaderNodeMath'); cmp.operation = 'LESS_THAN' if keep_front else 'GREATER_THAN'; cmp.inputs[1].default_value = 0.0
    nt.links.new(dot.outputs['Value'], cmp.inputs[0])
    tr = nt.nodes.new('ShaderNodeBsdfTransparent'); mix = nt.nodes.new('ShaderNodeMixShader')
    nt.links.new(cmp.outputs[0], mix.inputs[0]); nt.links.new(src, mix.inputs[1]); nt.links.new(tr.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs['Surface'])
    return mc


def nen_nuoc_material():
    """Nền sau mặt kính hóa nước: xanh lục lam tối có chiều sâu thay cho gỗ khung."""
    m = bpy.data.materials.new('nen_nuoc'); m.use_nodes = True; nt = m.node_tree; N, L = nt.nodes, nt.links
    for n_ in list(N): N.remove(n_)
    tc = N.new('ShaderNodeTexCoord'); nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 3.0; nz.inputs['Detail'].default_value = 6.0
    L.new(tc.outputs['Object'], nz.inputs['Vector'])
    ramp = N.new('ShaderNodeValToRGB'); ramp.color_ramp.elements[0].color = (0.01, 0.07, 0.09, 1); ramp.color_ramp.elements[1].color = (0.06, 0.34, 0.40, 1)
    L.new(nz.outputs['Fac'], ramp.inputs['Fac'])
    e = N.new('ShaderNodeEmission'); e.inputs['Strength'].default_value = 0.6; L.new(ramp.outputs['Color'], e.inputs['Color'])
    out = N.new('ShaderNodeOutputMaterial'); L.new(e.outputs[0], out.inputs['Surface'])
    return m
