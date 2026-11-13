"""Khoang miệng tối giản cho miệng há. Đầu là một mặt kín và miệng chỉ là rãnh lõm, nên không thêm vật khoang riêng:
shape key kéo hai mép rãnh ra xa nhau, còn dải da giữa hai mép (bị kéo giãn) được tô màu khoang miệng bằng mặt nạ
theo thuộc tính đỉnh 'khoang' (đi theo đỉnh như 'toa_do_nghi'). Lưới nghỉ không đổi."""
import math
import bpy
from . import chung
import dung_dau_nam as D

BAN_RONG_Z = (0.004, 0.006)      # |z − rãnh| < 4 mm → 1; về 0 ở 6 mm
FADE_X = (0.022, 0.032)          # hai đầu rãnh tắt dần như độ sâu rãnh trong shape_face


def _s(a, b, x):
    t = max(0.0, min(1.0, (x - a) / (b - a))); return t * t * (3 - 2 * t)


def them_khoang(dau):
    """Tạo thuộc tính 'khoang' và nối vào vật liệu da một Mix tô màu khoang miệng. Gọi lại không nhân đôi."""
    me = dau.head.data
    at = me.attributes.get('khoang') or me.attributes.new('khoang', 'FLOAT', 'POINT')
    for v in me.vertices:
        w = 0.0
        if v.co.y < -0.05:
            zl = D.FACE['mouth_z'] - 0.003 * (v.co.x / 0.030) ** 2
            w = (1.0 - _s(BAN_RONG_Z[0], BAN_RONG_Z[1], abs(v.co.z - zl))) * (1.0 - _s(FADE_X[0], FADE_X[1], abs(v.co.x)))
        at.data[v.index].value = w
    nt = me.materials[0].node_tree
    if any(n.bl_idname == 'ShaderNodeAttribute' and n.attribute_name == 'khoang' for n in nt.nodes): return
    bsdf = nt.nodes['Principled BSDF']; inp = bsdf.inputs['Base Color']
    a = nt.nodes.new('ShaderNodeAttribute'); a.attribute_type = 'GEOMETRY'; a.attribute_name = 'khoang'
    mr = nt.nodes.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = 0.35; mr.inputs['From Max'].default_value = 0.75   # làm gắt mép khoang
    nt.links.new(a.outputs['Fac'], mr.inputs['Value'])
    mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'
    mix.inputs[7].default_value = (*_hex(chung.D.COL['khoang_mieng']), 1.0)
    src = inp.links[0].from_socket if inp.links else None
    if src is not None: nt.links.new(src, mix.inputs[6])
    else: mix.inputs[6].default_value = inp.default_value
    nt.links.new(mr.outputs['Result'], mix.inputs[0]); nt.links.new(mix.outputs[2], inp)
    sss = bsdf.inputs.get('Subsurface Weight')      # khoang tối không được sáng lên vì tán xạ dưới da
    if sss is not None:
        inv = nt.nodes.new('ShaderNodeMath'); inv.operation = 'MULTIPLY_ADD'; inv.inputs[1].default_value = -sss.default_value; inv.inputs[2].default_value = sss.default_value
        nt.links.new(mr.outputs['Result'], inv.inputs[0]); nt.links.new(inv.outputs[0], sss)


def _hex(h):
    c = D.hexc(h); return tuple(c[:3])
