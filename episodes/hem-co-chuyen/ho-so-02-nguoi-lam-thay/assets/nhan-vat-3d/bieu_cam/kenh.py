"""Kênh hiệu ứng: thuộc tính tuỳ chỉnh trên Head_Base do driver tính từ giá trị các shape key.
  k_<kênh> = m_<kênh> (điều khiển tay, hoạt hoạ được) + Σ trọng_số × giá_trị_key  ("hieu_ung" trong định nghĩa).
Shader, vật phụ và con ngươi đọc k_<kênh>; tests đọc bằng kenh.doc."""
import bpy
from . import tao_key

KENH = ['nham', 'nhin_x', 'nhin_y', 'rang', 'luoi', 'nuoc_mat', 'mo_hoi', 'ma']


def _bo_driver(head, duong):
    ad = head.animation_data
    if ad:
        for fc in [f for f in ad.drivers if f.data_path == duong]: ad.drivers.remove(fc)


def tao_kenh(dau, dinh_nghia=None):
    """Tạo m_/k_<kênh> và driver. Gọi lại không nhân đôi driver. Cần shape key đã tạo (tao_key.ap_dung)."""
    dn = dinh_nghia if dinh_nghia is not None else tao_key.nap_dinh_nghia()
    head = dau.head; sk = head.data.shape_keys
    for k in KENH:
        if f'm_{k}' not in head: head[f'm_{k}'] = 0.0
        head[f'k_{k}'] = 0.0
        duong = f'["k_{k}"]'; _bo_driver(head, duong)
        fc = head.driver_add(duong); drv = fc.driver; drv.type = 'SCRIPTED'
        v = drv.variables.new(); v.name = 'm'; v.type = 'SINGLE_PROP'
        v.targets[0].id_type = 'OBJECT'; v.targets[0].id = head; v.targets[0].data_path = f'["m_{k}"]'
        bieu_thuc = 'm'
        for i, d in enumerate(x for x in dn if x.get('hieu_ung', {}).get(k)):
            vi = drv.variables.new(); vi.name = f'v{i}'; vi.type = 'SINGLE_PROP'
            vi.targets[0].id_type = 'KEY'; vi.targets[0].id = sk; vi.targets[0].data_path = f'key_blocks["{d["ten"]}"].value'
            bieu_thuc += f' + {d["hieu_ung"][k]}*v{i}'
        drv.expression = bieu_thuc
    bpy.context.view_layer.update()


def doc(dau, ten):
    """Giá trị kênh sau khi đánh giá (đã tính driver). Gắn thẻ cập nhật vì đặt thuộc tính bằng Python không tự báo depsgraph."""
    dau.head.update_tag(); bpy.context.view_layer.update()
    ev = dau.head.evaluated_get(bpy.context.evaluated_depsgraph_get())
    return float(ev[f'k_{ten}'])
