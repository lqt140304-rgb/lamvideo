"""Dựng trọn đầu diễn hoạt của Nam: topology (luoi) → shape key → gắn bộ phận, va chạm mí, bone hàm, điều khiển."""
from . import luoi, shape_key, dieu_khien


def dung_rig(mole_side=None):
    r = luoi.dung(mole_side)
    shape_key.tao_key(r)
    dieu_khien.gan_bo_phan(r)          # bind ở tư thế nghỉ (mọi key = 0)
    dieu_khien.va_cham(r)
    dieu_khien.xuong_ham(r)
    dieu_khien.dieu_khien(r)
    return r
