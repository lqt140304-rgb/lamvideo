import bpy
from bieu_cam import chung, kiem, tao_key, gan, khoang_mieng
import dung_dau_nam as D


def _dau():
    d = chung.dung_nam(); kiem.chup_nghi(d); tao_key.ap_dung(d); gan.gan_chi_tiet(d); gan.tron_trang_theo_mat(d)
    khoang_mieng.them_khoang(d); return d


def _z0(x): return D.FACE['mouth_z'] - 0.003 * (x / 0.030) ** 2


def test_thuoc_tinh_khoang_va_idempotent():
    d = _dau(); khoang_mieng.them_khoang(d)
    at = d.head.data.attributes.get('khoang'); assert at is not None and at.domain == 'POINT' and at.data_type == 'FLOAT'
    vs = d.head.data.vertices
    gan_ranh = [i for i, v in enumerate(vs) if v.co.y < -0.05 and abs(v.co.x) < 0.005 and abs(v.co.z - _z0(0)) < 0.002]
    xa = [i for i, v in enumerate(vs) if v.co.z > 1.35]
    assert gan_ranh and min(at.data[i].value for i in gan_ranh) > 0.9
    assert max(at.data[i].value for i in xa) == 0.0
    nt = d.head.data.materials[0].node_tree
    assert len([n for n in nt.nodes if n.bl_idname == 'ShaderNodeAttribute' and n.attribute_name == 'khoang']) == 1


def test_ha_mieng_keo_gian_dai_khoang():
    """Miệng há = dải da của mặt nạ 'khoang' bị kéo giãn: chiều cao dải (cột giữa) phải tăng ≥ 8 mm so với lúc nghỉ."""
    d = _dau(); at = d.head.data.attributes['khoang']; vs = d.head.data.vertices
    cot = [i for i, v in enumerate(vs) if at.data[i].value >= 0.5 and abs(v.co.x) < 0.007]
    def cao():
        ev = kiem._verts(d.head); zs = [ev[i].z for i in cot]; return max(zs) - min(zs)
    nghi = cao(); assert nghi < 0.012, nghi
    d.head.data.shape_keys.key_blocks['kinh_hoang'].value = 1.0
    assert cao() >= nghi + 0.008, (nghi, cao())


def test_kinh_hoang_sach_voi_khoang():
    d = _dau(); loi = kiem.chay_kiem(d, ['kinh_hoang'])
    assert loi == [], [(l.gia_tri, l.goc, l.kieu, l.vat, round(l.do, 4)) for l in loi][:6]
