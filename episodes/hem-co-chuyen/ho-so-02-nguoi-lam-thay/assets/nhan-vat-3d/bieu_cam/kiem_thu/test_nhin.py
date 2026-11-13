import itertools
import bpy
from bieu_cam import chung, kiem, ap_dung_bo, kenh, nhin


def _dau(**kw): return ap_dung_bo.dung_va_ap_dung(**kw)


def _tam(d, ten): return kiem._cen(kiem._verts(d.parts[ten]))


def _dat(d, **m):
    for k, v in m.items(): d.head[f'm_{k}'] = v
    d.head.update_tag()


def _kb(d, ten): return d.head.data.shape_keys.key_blocks[ten]


def test_nhin_di_chuyen():
    d = _dau(); r = {k: _tam(d, f'Pupil.{k}') for k in 'LR'}
    _dat(d, nhin_x=1.0)
    for k in 'LR':
        dx = _tam(d, f'Pupil.{k}').x - r[k].x
        assert abs(dx - nhin.NHIN_X) <= 0.0005, (k, dx)
    _dat(d, nhin_x=0.0, nhin_y=-1.0)
    assert abs((_tam(d, 'Pupil.L').z - r['L'].z) + nhin.NHIN_Z_XUONG) <= 0.0005


def test_nhin_trong_khe_mat():
    d = _dau(); loi = []
    for x, y in itertools.product((-1, 0, 1), (-1, 0, 1)):
        _kb(d, 'mo_mat').value = 1.0 if y > 0 else 0.0               # nhìn lên cần mí mở rộng
        _dat(d, nhin_x=x, nhin_y=y)
        loi += [(x, y, l.kieu, l.vat, round(l.do, 4)) for l in kiem.kiem_nhin(d) + kiem.kiem_bam(d) + kiem.kiem_de(d)]
    assert loi == [], loi[:6]


def test_nhin_cuc_tri_mi_sup():
    d = _dau(); _kb(d, 'kiet_suc').value = 1.0; loi = []
    for x in (-1, 1):
        _dat(d, nhin_x=x, nhin_y=-1.0); loi += kiem.kiem_de(d) + kiem.kiem_nhin(d) + kiem.kiem_bam(d)
    assert loi == [], [(l.kieu, l.vat, round(l.do, 4)) for l in loi]


def test_nhin_hai_lan():
    d = _dau(); nhin.gan_nhin(d)
    for k in 'LR':
        ob = d.parts[f'Pupil.{k}']; ten = [m.name for m in ob.modifiers]
        assert ten == ['Dan_mat', 'Noi_mat'], ten            # không Surface Deform, không Displace
        assert len([f for f in ob.animation_data.drivers if f.data_path == 'location']) == 3
    assert kiem.kiem_nhin(d) == []


def test_con_nguoi_khong_bi_keo_dai():
    """Mí nâng/hạ không được kéo giãn con ngươi: chiều cao con ngươi giữ nguyên ở mọi key."""
    d = _dau(); cao0 = {k: max(v.z for v in kiem._verts(d.parts[f'Pupil.{k}'])) - min(v.z for v in kiem._verts(d.parts[f'Pupil.{k}'])) for k in 'LR'}
    for ten in ('mo_mat', 'kinh_hoang', 'kiet_suc', 'hoang_mang'):
        _kb(d, ten).value = 1.0
        for k in 'LR':
            vs = kiem._verts(d.parts[f'Pupil.{k}']); cao = max(v.z for v in vs) - min(v.z for v in vs)
            assert abs(cao - cao0[k]) <= 0.0005, (ten, k, cao, cao0[k])
        _kb(d, ten).value = 0.0


def test_nhin_dau_doi_xung():
    d = _dau(mole_side=+1); _dat(d, nhin_x=1.0, nhin_y=-1.0)
    assert kiem.kiem_nhin(d) == [] and kiem.kiem_bam(d) == []


def test_con_nguoi_noi_tren_da_moi_huong():
    """Nhìn về phía mũi (da nghiêng) con ngươi vẫn nổi trên da: khoảng cách có dấu ≥ 0, không chìm."""
    d = _dau(); bvh = kiem._bvh(d)
    for x, y in itertools.product((-1, 0, 1), (-1, 0)):
        _dat(d, nhin_x=x, nhin_y=y)
        for k in 'LR':
            sd = [kiem._sd(bvh, v) for v in kiem._verts(d.parts[f'Pupil.{k}'])]
            assert min(sd) >= 0.0001, (x, y, k, min(sd))
