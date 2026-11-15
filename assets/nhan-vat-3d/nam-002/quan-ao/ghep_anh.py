"""Ghép ảnh của kiem_tra.py thành anh/<bộ>.webp (chạy bằng python thường có PIL): python3 ghep_anh.py xanh [ngu …]"""
import sys, os
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))
ROWS = [('tay_buong', 'truoc nghieng sau'), ('gio_tay_cao', 'truoc nghieng sau'), ('tay_truoc_80', 'truoc nghieng sau'),
        ('khuyu_gap', 'truoc nghieng sau'), ('ngoi_xom', 'truoc nghieng sau'), ('buoc_chan', 'truoc nghieng sau')]
for nm in sys.argv[1:]:
    d = os.path.join(HERE, 'out', nm); cell = (120, 184); cols = 3 * 2 + 0
    items = [(t, [os.path.join(d, f'{t}_{v}.png') for v in vs.split()]) for t, vs in ROWS] + [('di_bo 1/9/17/25', [os.path.join(d, f'khung_{k}.png') for k in (1, 9, 17, 25)])]
    # 2 dáng mỗi hàng
    W = Image.new('RGB', (cell[0] * 6, (cell[1] + 14) * 4), 'white'); dr = ImageDraw.Draw(W)
    for k, (t, ps) in enumerate(items):
        r, c = divmod(k, 2); dr.text((c * 3 * cell[0] + 3, r * (cell[1] + 14)), t, fill='black')
        for j, p in enumerate(ps): W.paste(Image.open(p).convert('RGB').resize(cell), ((c * 3 + j) * cell[0], r * (cell[1] + 14) + 14))
    os.makedirs(os.path.join(HERE, 'anh'), exist_ok=True); W.save(os.path.join(HERE, 'anh', f'{nm}.webp'), quality=80)
