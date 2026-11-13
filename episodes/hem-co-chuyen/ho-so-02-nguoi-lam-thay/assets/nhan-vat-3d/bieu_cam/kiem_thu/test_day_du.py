from bieu_cam import chung, kiem, tao_key, gan

SAU = ['ngai_ngu', 'kiet_suc', 'tu_ai', 'thi_uy', 'hoang_mang', 'kinh_hoang']


def test_sau_key_sach():
    d = chung.dung_nam(); kiem.chup_nghi(d)
    ten = tao_key.ap_dung(d); gan.gan_chi_tiet(d); gan.tron_trang_theo_mat(d)
    assert sorted(ten) == sorted(SAU), ten
    loi = kiem.chay_kiem(d, SAU)
    assert loi == [], [(l.key, l.gia_tri, l.goc, l.kieu, l.vat, round(l.do, 4)) for l in loi][:8]


def test_moi_nhom_du_hai_muc():
    nhom = {}
    for x in tao_key.nap_dinh_nghia(): nhom.setdefault(x['nhom'], set()).add(x['muc'])
    assert len(nhom) == 3 and all(m == {1, 2} for m in nhom.values()), nhom
