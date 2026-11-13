"""Một lệnh áp dụng cả bộ biểu cảm lên một đầu: shape key + khoang miệng + gắn chi tiết mặt + tròng trắng đi theo mặt."""
from . import chung, kiem, tao_key, gan, khoang_mieng, kenh, nhin


def ap_dung_bo(dau, dinh_nghia=None):
    """Áp bộ biểu cảm lên `dau` (chụp trạng thái nghỉ trước khi đổi gì). Trả danh sách tên key."""
    if dau.nghi is None: kiem.chup_nghi(dau)
    ten = tao_key.ap_dung(dau, dinh_nghia); khoang_mieng.them_khoang(dau); gan.gan_chi_tiet(dau); gan.tron_trang_theo_mat(dau)
    kenh.tao_kenh(dau, dinh_nghia); nhin.gan_nhin(dau)
    kiem.chup_nghi(dau)       # trạng thái nghỉ của vật phụ chỉ ổn định sau khi mọi công cụ đã gắn (Shrinkwrap dán con ngươi lại lên da)
    return ten


def dung_va_ap_dung(mole_side=None, x_scale=1.0, dinh_nghia=None):
    d = chung.dung_nam(mole_side, x_scale); kiem.chup_nghi(d); ap_dung_bo(d, dinh_nghia); return d
