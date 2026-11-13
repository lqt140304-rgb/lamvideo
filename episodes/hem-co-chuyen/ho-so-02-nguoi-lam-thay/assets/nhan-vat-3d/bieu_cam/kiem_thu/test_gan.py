import bpy
from bieu_cam import chung, kiem, tao_key, gan


def _dau(gan_vao=True):
    d = chung.dung_nam(); kiem.chup_nghi(d); tao_key.ap_dung(d)
    if gan_vao: gan.gan_chi_tiet(d); gan.tron_trang_theo_mat(d)
    return d


def test_ngai_ngu_kiet_suc_sach():
    d = _dau(); loi = kiem.chay_kiem(d, ['ngai_ngu', 'kiet_suc'])
    assert loi == [], [(l.key, l.gia_tri, l.goc, l.kieu, l.vat, round(l.do, 4)) for l in loi][:6]


def test_khong_gan_thi_hong():
    """Đối chứng: chưa gắn thì bộ kiểm phải bắt được (để chắc test trên không rỗng vì lý do sai)."""
    d = _dau(False); assert kiem.chay_kiem(d, ['kiet_suc'], gia_tris=(1.0,), gocs={'chinh_dien': 0.0}) != []


def test_hai_key_cung_luc():
    d = _dau(); kb = d.head.data.shape_keys.key_blocks
    kb['kiet_suc'].value = 0.6; kb['ngai_ngu'].value = 0.4
    assert kiem.kiem_bam(d) == [] and kiem.kiem_de(d) == [] and kiem.kiem_nhan_dien(d) == []


def test_gan_hai_lan_khong_nhan_doi():
    d = _dau(); gan.gan_chi_tiet(d); gan.tron_trang_theo_mat(d)
    for ob in d.parts.values(): assert len([m for m in ob.modifiers if m.type == 'SURFACE_DEFORM']) == 1, ob.name
    da = d.head.data.materials[0].node_tree
    assert len([n for n in da.nodes if n.bl_idname == 'ShaderNodeAttribute' and n.attribute_name == 'toa_do_nghi']) == 1


def test_tron_trang_doc_toa_do_nghi():
    d = _dau(); at = d.head.data.attributes.get('toa_do_nghi')
    assert at is not None and at.domain == 'POINT' and at.data_type == 'FLOAT_VECTOR'
    i = 1234; assert (at.data[i].vector - d.head.data.vertices[i].co).length < 1e-6
    nt = d.head.data.materials[0].node_tree
    assert not [l for l in nt.links if l.from_node.bl_idname == 'ShaderNodeTexCoord' and l.from_socket.name == 'Object']
