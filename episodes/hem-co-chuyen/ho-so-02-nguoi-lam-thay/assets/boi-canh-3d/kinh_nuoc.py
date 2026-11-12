"""Shader kính hóa nước (Liquid Glass) cho mặt gương — P3.05.
Một vật liệu, ba núm điều khiển có keyframe:
  tran  0→1 : gương phản xạ → kính nước (glass IOR 1,33–1,5 + phản xạ nhẹ)
  bien  0→1 : biên độ gợn sóng (Bump từ Wave Texture dạng vòng đồng tâm, tắt dần theo khoảng cách từ tâm)
  pha        : pha sóng (cho vòng lan ra từ điểm chạm)
Sắc sai (Chromatic Aberration): cộng 3 Glass BSDF đỏ/lục/lam với IOR lệch nhau (1,31 / 1,33 / 1,36) nên viền ảnh qua kính tách màu xanh–đỏ.
"""
import bpy
from mathutils import Vector


def build_material(center_world, name='guong_nuoc', ior=(1.31, 1.33, 1.36), ring_scale=7.0):
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
    out = N.new('ShaderNodeOutputMaterial'); L.new(mix.outputs[0], out.inputs['Surface'])
    m['ctl'] = 1
    return m, dict(tran=mix.inputs[0], bien=bump.inputs['Strength'], pha=wave.inputs['Phase Offset'])


def key(sock, frame_vals):
    for f, v in frame_vals:
        sock.default_value = v; sock.keyframe_insert('default_value', frame=f)


def animate(ctl, N=72):
    """Mặc định: gương thường → gợn sóng từ tâm → hóa nước hoàn toàn → mặt nước phẳng lặng đóng băng."""
    key(ctl['tran'], [(1, 0.0), (22, 0.0), (46, 1.0), (N, 1.0)])
    key(ctl['bien'], [(1, 0.0), (14, 0.15), (30, 0.7), (56, 0.25), (N, 0.0)])
    key(ctl['pha'], [(1, 0.0), (N, 22.0)])


def apply(glass_obj, center_world, N=72):
    mat, ctl = build_material(center_world)
    glass_obj.data.materials.clear(); glass_obj.data.materials.append(mat)
    animate(ctl, N)
    return mat, ctl
