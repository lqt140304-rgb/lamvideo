"""Bảng tham số nhân vật dựng từ khuôn NAM-003. Thêm nhân vật = thêm một khóa vào NHAN_VAT; khóa thiếu lấy từ MAC_DINH.

Đơn vị: hệ số tương đối (1 = cỡ chuẩn đo trên khuôn), màu RGB tuyến tính 0–1, chiều cao mét.
"""

MAC_DINH = dict(
    cao=1.70,
    da=(0.86, 0.64, 0.50),
    # mắt: rộng/cao nhân với bán kính hốc đo được; nghiêng (độ, đuôi mắt lên +); viền (m) = độ dày nét mí trên
    mat_rong=1.0, mat_cao=0.80, mat_nghieng=4.0, mat_vien=0.0016, mi_doi=False,
    mong_mau=(0.10, 0.06, 0.035), mong_to=0.42,
    # mày: dày nhân hệ số; dáng = độ cao 5 điểm (đầu trong → đuôi), tính theo bán kính hốc trên đỉnh hốc
    may_day=1.0, may_dang=(0.35, 0.50, 0.58, 0.52, 0.38), may_mau=(0.03, 0.022, 0.018),
    # miệng: rộng/cao nhân với cỡ chuẩn; màu môi
    mieng_rong=1.0, mieng_cao=1.0, moi_mau=(0.72, 0.40, 0.36),
    # bóp mặt: hệ số dịch (1 = mức chuẩn ~ vài mm, xem BOP_CHUAN trong rig_mat_nam003.py)
    bop=dict(),
    ruoi=None,   # None | 'trai' (+X) | 'phai' (−X)
)

NHAN_VAT = dict(
    tung=dict(
        cao=1.70, da=(0.92, 0.74, 0.62),
        mat_rong=1.10, mat_cao=0.82, mi_doi=True, mat_vien=0.0026, mong_mau=(0.10, 0.055, 0.03),
        may_day=1.3,
        mieng_rong=1.15, mieng_cao=0.85, moi_mau=(0.80, 0.42, 0.40),
        bop=dict(tai=0.8, ham=1.0, cam=1.0, mui_thap=1.0, mui_thon=1.0, ma_hop=1.0),
    ),
    nam=dict(cao=1.60, ruoi='trai'),
)


def lay(ten):
    if ten not in NHAN_VAT:
        raise SystemExit(f'không có nhân vật "{ten}"; có: {", ".join(NHAN_VAT)}')
    p = dict(MAC_DINH); p.update(NHAN_VAT[ten]); p['ten'] = ten
    return p


def kiem_lay():
    assert lay('nam')['da'] == MAC_DINH['da'], 'khóa thiếu phải lấy MAC_DINH'
    assert lay('tung')['may_day'] == 1.3
    assert set(lay('nam')) == set(lay('tung')), 'mọi nhân vật cùng bộ khóa'
