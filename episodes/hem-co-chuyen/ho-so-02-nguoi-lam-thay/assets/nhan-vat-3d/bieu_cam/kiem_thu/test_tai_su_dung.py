import bpy
from bieu_cam import chung, kiem, tao_key, ap_dung_bo

SAU = [x['ten'] for x in tao_key.nap_dinh_nghia()]


def _mole_x(d): return kiem._cen(kiem._verts(d.parts['Mole'])).x


def test_dau_doi_xung_khong_sua_ma():
    """Đầu thứ hai: nốt ruồi sang bên đối diện. Cùng lệnh áp dụng, cùng bộ kiểm, không nhánh riêng."""
    nam = chung.dung_nam(); x_nam = _mole_x(nam)
    d = ap_dung_bo.dung_va_ap_dung(mole_side=+1)
    assert _mole_x(d) * x_nam < 0, (x_nam, _mole_x(d))
    assert sorted(d.head.data.shape_keys.key_blocks.keys()) == sorted(['Basis'] + SAU)
    loi = kiem.chay_kiem(d, SAU)
    assert loi == [], [(l.key, l.gia_tri, l.goc, l.kieu, l.vat, round(l.do, 4)) for l in loi][:8]


def test_dau_rong_hon_khong_sua_ma():
    d = ap_dung_bo.dung_va_ap_dung(x_scale=1.08)
    w = max(v.co.x for v in d.head.data.vertices) - min(v.co.x for v in d.head.data.vertices)
    base = ap_dung_bo.dung_va_ap_dung(); w0 = max(v.co.x for v in base.head.data.vertices) - min(v.co.x for v in base.head.data.vertices)
    assert w > w0 * 1.03, (w, w0)                    # đầu thật sự rộng hơn
    assert chung.ty_le_mat(d.neo) > chung.ty_le_mat(base.neo) * 1.05     # khoảng cách hai mắt cũng rộng ra
    d = ap_dung_bo.dung_va_ap_dung(x_scale=1.08)
    loi = kiem.chay_kiem(d, SAU)
    assert loi == [], [(l.key, l.gia_tri, l.goc, l.kieu, l.vat, round(l.do, 4)) for l in loi][:8]


def test_bieu_cam_thuc_su_chay_tren_dau_rong():
    """Chống test rỗng: trên đầu rộng hơn, kiet_suc vẫn hạ mí đúng độ dời theo tỉ lệ khuôn mặt MỚI (không dính số của Nam)."""
    d = ap_dung_bo.dung_va_ap_dung(x_scale=1.08)
    dn = {x['ten']: x for x in tao_key.nap_dinh_nghia()}['kiet_suc']; ty = chung.ty_le_mat(d.neo)
    rest = kiem.neo_hien_tai(d); d.head.data.shape_keys.key_blocks['kiet_suc'].value = 1.0; now = kiem.neo_hien_tai(d)
    for k in 'LR':
        got = now[f'lid_up.{k}'].z - rest[f'lid_up.{k}'].z
        assert abs(got - dn['dich']['lid_up.*'][2] * ty) <= 0.0005, (k, got)
