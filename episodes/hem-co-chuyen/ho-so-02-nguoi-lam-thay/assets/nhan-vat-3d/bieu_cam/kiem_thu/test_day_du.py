from bieu_cam import chung, kiem, tao_key, gan

CONG_CU = {x['ten'] for x in tao_key.nap_dinh_nghia() if x['nhom'] == 'cong_cu'}
SAU = ['ngai_ngu', 'kiet_suc', 'tu_ai', 'thi_uy', 'hoang_mang', 'kinh_hoang']      # sáu biểu cảm gốc; còn key công cụ (nhóm cong_cu) kiểm riêng


def test_sau_key_sach():
    d = chung.dung_nam(); kiem.chup_nghi(d)
    ten = tao_key.ap_dung(d); gan.gan_chi_tiet(d); gan.tron_trang_theo_mat(d)
    assert sorted(k for k in ten if k not in CONG_CU) == sorted(SAU), ten
    loi = kiem.chay_kiem(d, SAU)
    assert loi == [], [(l.key, l.gia_tri, l.goc, l.kieu, l.vat, round(l.do, 4)) for l in loi][:8]


def test_moi_nhom_du_hai_muc():
    nhom = {}
    for x in tao_key.nap_dinh_nghia():
        if x['nhom'] != 'cong_cu': nhom.setdefault(x['nhom'], set()).add(x['muc'])
    assert len(nhom) == 3 and all(m == {1, 2} for m in nhom.values()), nhom


def test_moi_cap_key_cung_luc():
    """Chuyển cảm xúc theo thoại = hai key bật cùng lúc. Mọi cặp ở 0,5/0,5 và 1,0/0,5 phải giữ chi tiết bám mặt, không đè, không lòi viền."""
    import itertools
    d = chung.dung_nam(); kiem.chup_nghi(d); tao_key.ap_dung(d); gan.gan_chi_tiet(d); gan.tron_trang_theo_mat(d)
    from bieu_cam import khoang_mieng; khoang_mieng.them_khoang(d)
    kb = d.head.data.shape_keys.key_blocks; xau = []
    for a, b in itertools.combinations(SAU, 2):
        for va, vb in ((0.5, 0.5), (1.0, 0.5)):
            kb[a].value, kb[b].value = va, vb
            ds = kiem.kiem_bam(d) + kiem.kiem_de(d) + kiem.kiem_nhan_dien(d) + kiem.kiem_trong_vien(d, 'chinh_dien') + kiem.kiem_trong_vien(d, 'nghieng_phai')
            xau += [(a, va, b, vb, l.kieu, l.vat, round(l.do, 4)) for l in ds]
        kb[a].value = kb[b].value = 0.0
    assert xau == [], xau[:8]
