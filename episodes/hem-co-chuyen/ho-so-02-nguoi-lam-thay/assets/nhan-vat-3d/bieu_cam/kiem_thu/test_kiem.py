from mathutils import Vector
from bieu_cam import chung, kiem


def _dau():
    d = chung.dung_nam(); kiem.chup_nghi(d); return d


def test_mat_nghi_sach():
    d = _dau()
    assert kiem.kiem_bam(d) == []
    assert kiem.kiem_de(d) == []
    assert kiem.kiem_nhan_dien(d) == []
    for g in kiem.GOCS: assert kiem.kiem_trong_vien(d, g) == [], g


def test_phat_hien_mat_bam():
    d = _dau(); d.parts['Eyebrow.L'].location += Vector((0, -0.005, 0))
    import bpy; bpy.context.view_layer.update()
    loi = kiem.kiem_bam(d)
    assert any(l.kieu == 'bam' and l.vat == 'Eyebrow.L' and l.do > 0.004 for l in loi), loi


def test_phat_hien_lo_vien():
    d = _dau(); d.parts['Eyeline.L'].location += Vector((0.25, 0, 0))
    import bpy; bpy.context.view_layer.update()
    loi = kiem.kiem_trong_vien(d, 'chinh_dien')
    assert any(l.kieu == 'lo_vien' and l.vat == 'Eyeline.L' for l in loi), loi


def test_phat_hien_de():
    d = _dau(); d.parts['Pupil.L'].location += Vector((0, 0, 0.03))
    import bpy; bpy.context.view_layer.update()
    loi = kiem.kiem_de(d)
    assert any(l.kieu == 'de' and l.vat == 'Pupil.L' for l in loi), loi


def test_phat_hien_nhan_dien():
    d = _dau(); d.parts['Mole'].location += Vector((0.005, 0, 0))
    import bpy; bpy.context.view_layer.update()
    loi = kiem.kiem_nhan_dien(d)
    assert any(l.kieu == 'nhan_dien' for l in loi), loi
