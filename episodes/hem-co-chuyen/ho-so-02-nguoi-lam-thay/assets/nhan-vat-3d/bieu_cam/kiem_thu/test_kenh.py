import bpy
from bieu_cam import chung, kiem, tao_key, kenh

DN = [{"ten": "t", "nhom": "x", "muc": 1, "ban_kinh": 0.3, "dich": {"lid_up.*": [0, 0, -0.05]}, "hieu_ung": {"rang": 0.5, "ma": 1.0}}]


def _dau(dn=DN):
    d = chung.dung_nam(); kiem.chup_nghi(d); tao_key.ap_dung(d, dn); kenh.tao_kenh(d, dn); return d


def _kb(d, ten): return d.head.data.shape_keys.key_blocks[ten]


def test_kenh_tinh_tu_key():
    d = _dau(); _kb(d, 't').value = 0.6
    assert abs(kenh.doc(d, 'rang') - 0.3) < 1e-4 and abs(kenh.doc(d, 'ma') - 0.6) < 1e-4
    d.head['m_rang'] = 0.2
    assert abs(kenh.doc(d, 'rang') - 0.5) < 1e-4


def test_neo_moi_doi_xung():
    n = chung.dung_nam().neo
    for k in ('eye_in', 'eye_out', 'cheek', 'nose_wing', 'temple'):
        assert f'{k}.L' in n and f'{k}.R' in n, k
    assert 'nose_bridge' in n
    assert n['eye_in.L'].x < n['eye_out.L'].x and n['eye_in.R'].x > n['eye_out.R'].x
    assert n['cheek.L'].z < n['eye_c.L'].z and n['nose_bridge'].z > n['nose_wing.L'].z and n['temple.L'].z > n['eye_c.L'].z
    assert abs(n['cheek.L'].x + n['cheek.R'].x) < 1e-3


def test_gom_cong_do_doi():
    B = {"ten": "B", "nhom": "x", "muc": 1, "ban_kinh": 0.3, "dich": {"lid_up.*": [0, 0, -0.05]}}
    A = {"ten": "A", "nhom": "x", "muc": 1, "ban_kinh": 0.3, "dich": {}, "gom": {"B": 1.0}}
    d = chung.dung_nam(); kiem.chup_nghi(d); tao_key.ap_dung(d, [B, A])
    rest = kiem.neo_hien_tai(d)['lid_up.L'].z
    _kb(d, 'A').value = 1.0; za = kiem.neo_hien_tai(d)['lid_up.L'].z - rest
    _kb(d, 'A').value = 0.0; _kb(d, 'B').value = 1.0; zb = kiem.neo_hien_tai(d)['lid_up.L'].z - rest
    assert abs(za) > 0.003 and abs(za - zb) <= 0.0005, (za, zb)


def test_tao_kenh_hai_lan():
    d = _dau(); n0 = len(d.head.animation_data.drivers); kenh.tao_kenh(d, DN)
    assert len(d.head.animation_data.drivers) == n0 == len(kenh.KENH)


def test_kenh_theo_khung_hinh():
    d = _dau(); kb = _kb(d, 't'); sc = bpy.context.scene
    kb.value = 0.0; kb.keyframe_insert('value', frame=1); kb.value = 1.0; kb.keyframe_insert('value', frame=10)
    sc.frame_set(5)
    v = kenh.doc(d, 'ma'); assert 0.35 < v < 0.65, v
