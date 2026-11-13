import bpy
from bieu_cam import chung, kiem, tao_key


def _dau():
    d = chung.dung_nam(); kiem.chup_nghi(d); return d


def test_mat_nghi_khong_doi():
    d = _dau(); tao_key.ap_dung(d)
    sk = d.head.data.shape_keys
    assert all(kb.value == 0 for kb in sk.key_blocks if kb != sk.reference_key)
    assert kiem.kiem_nhan_dien(d) == []          # băm đỉnh nghỉ khớp bản đã chụp


def test_key_dich_dung_neo():
    d = _dau(); dn = {x['ten']: x for x in tao_key.nap_dinh_nghia()}['kiet_suc']; tao_key.ap_dung(d, [dn])
    ty = chung.ty_le_mat(d.neo); rest = kiem.neo_hien_tai(d)
    d.head.data.shape_keys.key_blocks['kiet_suc'].value = 1.0
    now = kiem.neo_hien_tai(d)
    for k in 'LR':
        dz = dn['dich']['lid_up.*'][2] * ty
        got = now[f'lid_up.{k}'].z - rest[f'lid_up.{k}'].z
        assert abs(got - dz) <= 0.0005, (k, got, dz)
        dx = dn['dich']['mouth_corner.*'][0] * ty * (1 if k == 'L' else -1)
        assert abs((now[f'mouth_corner.{k}'].x - rest[f'mouth_corner.{k}'].x) - dx) <= 0.0005


def test_ap_hai_lan():
    d = _dau(); ds = tao_key.nap_dinh_nghia()
    tao_key.ap_dung(d, ds); tao_key.ap_dung(d, ds)
    assert len(d.head.data.shape_keys.key_blocks) == 1 + len(ds)


def test_hash_nghi_bat_loi_khi_co_key():
    """Có shape key rồi mà lưới nghỉ bị đổi thì kiểm nhận diện vẫn phải báo (Basis không được tính là key đang bật)."""
    d = _dau(); tao_key.ap_dung(d)
    d.head.data.vertices[100].co.z += 0.001; d.head.data.shape_keys.key_blocks['Basis'].data[100].co.z += 0.001
    assert any(l.chi_tiet.startswith('mặt nghỉ') for l in kiem.kiem_nhan_dien(d))
