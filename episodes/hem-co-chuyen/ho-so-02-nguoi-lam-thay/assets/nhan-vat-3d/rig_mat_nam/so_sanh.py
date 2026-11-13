"""Cắt ô ảnh mẫu (3 bảng tham chiếu) theo lưới 2 cột × 4 hàng, mỗi ô hai đầu (trái Nhẹ, phải Rõ). Pillow, chạy ngoài Blender được."""
import os
from PIL import Image

THU_MUC = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'tham-chieu-bieu-cam'))
BANG = {1: 'bang-1-nhom-co-ban.webp', 2: 'bang-2-noi-tam-trang-thai.webp', 3: 'bang-3-sac-thai-dac-biet.webp'}
COT_X, HANG_Y, O_W, O_H = (16, 635), (124, 411, 693, 972), 605, 270


def cat_o(bang, hang, cot, muc):
    im = Image.open(os.path.join(THU_MUC, BANG[bang])).convert('RGB'); x0, y0 = COT_X[cot], HANG_Y[hang]
    x = x0 + (180 if muc == 'nhe' else 390)
    return im.crop((x, y0 + 4, x + 215, y0 + 244))
