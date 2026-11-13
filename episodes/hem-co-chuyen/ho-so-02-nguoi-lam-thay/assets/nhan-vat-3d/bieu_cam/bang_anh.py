"""Ghép ảnh duyệt biểu cảm thành một bảng (Pillow, chạy được ngoài Blender): hàng = biểu cảm, cột = góc nhìn.
Tên ảnh: <key>__<goc>.png. Dùng: python bang_anh.py <thư_mục_ảnh> <bang.png>"""
import os, sys
from PIL import Image, ImageDraw

THU_TU = ['nghi', 'ngai_ngu', 'kiet_suc', 'tu_ai', 'thi_uy', 'hoang_mang', 'kinh_hoang']
GOCS = ['chinh_dien', '3q', 'nghieng']


def ghep(thu_muc, ra, o=240):
    """Mỗi ô o×o px (cắt sát đầu). Trả đường dẫn bảng."""
    keys = [k for k in THU_TU if any(os.path.exists(os.path.join(thu_muc, f'{k}__{g}.png')) for g in GOCS)]
    hdr = 22; bang = Image.new('RGB', (len(GOCS) * o + 90, len(keys) * o + hdr), 'white'); dr = ImageDraw.Draw(bang)
    for j, g in enumerate(GOCS): dr.text((90 + j * o + 6, 4), g, fill='black')
    for i, k in enumerate(keys):
        dr.text((6, hdr + i * o + o // 2), k, fill='black')
        for j, g in enumerate(GOCS):
            f = os.path.join(thu_muc, f'{k}__{g}.png')
            if os.path.exists(f):
                im = Image.open(f).convert('RGB'); w, h = im.size; s = int(min(w, h) * 0.62)        # đầu chiếm ~60% khung nên cắt sát
                cx, cy = w // 2, int(h * 0.5)
                bang.paste(im.crop((cx - s // 2, cy - s // 2, cx + s // 2, cy + s // 2)).resize((o, o)), (90 + j * o, hdr + i * o))
    bang.save(ra); return ra


if __name__ == '__main__': ghep(sys.argv[1], sys.argv[2])
