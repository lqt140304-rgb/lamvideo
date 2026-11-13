"""Gắn các vật rời của mặt vào đầu để chúng đi theo khi shape key biến dạng, và cho mặt nạ tròng trắng đi theo mặt."""
import bpy
from . import chung

TEN_MOD = 'Bam_mat'


def gan_chi_tiet(dau):
    """Surface Deform nhắm Head_Base cho mọi vật rời. Bind lúc mọi key = 0. Gọi lại không nhân đôi."""
    sk = dau.head.data.shape_keys
    if sk:
        for kb in sk.key_blocks:
            if kb != sk.reference_key: kb.value = 0.0
    bpy.context.view_layer.update()
    for ten, ob in dau.parts.items():
        m = ob.modifiers.get(TEN_MOD)
        if m is None:
            m = ob.modifiers.new(TEN_MOD, 'SURFACE_DEFORM'); m.target = dau.head
        if not m.is_bound:
            with bpy.context.temp_override(object=ob, active_object=ob, selected_objects=[ob]):
                bpy.ops.object.surfacedeform_bind(modifier=TEN_MOD)
        if not m.is_bound: raise RuntimeError(f'Surface Deform không bind được cho {ten}')


def tron_trang_theo_mat(dau):
    """Mặt nạ tròng trắng đọc TexCoord › Object nên đứng yên khi mặt biến dạng. Lưu toạ độ nghỉ vào thuộc tính đỉnh
    'toa_do_nghi' (đi theo đỉnh) và nối node Attribute thay cho TexCoord › Object trong vật liệu da."""
    me = dau.head.data
    at = me.attributes.get('toa_do_nghi') or me.attributes.new('toa_do_nghi', 'FLOAT_VECTOR', 'POINT')
    for v in me.vertices: at.data[v.index].vector = v.co          # đỉnh cơ sở = toạ độ nghỉ
    nt = me.materials[0].node_tree
    if any(n.bl_idname == 'ShaderNodeAttribute' and n.attribute_name == 'toa_do_nghi' for n in nt.nodes): return
    a = nt.nodes.new('ShaderNodeAttribute'); a.attribute_type = 'GEOMETRY'; a.attribute_name = 'toa_do_nghi'
    for l in [l for l in nt.links if l.from_node.bl_idname == 'ShaderNodeTexCoord' and l.from_socket.name == 'Object']:
        to = l.to_socket; nt.links.remove(l); nt.links.new(a.outputs['Vector'], to)
