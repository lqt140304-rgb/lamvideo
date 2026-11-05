"""Cắt gói asset tuổi thơ (Be_va_ong_ba.png, Do_vat_lang_que.png) thành từng PNG, giữ nguyên nét vẽ gốc.

    python tools/cut_tuoi_tho.py   # đọc assets/tuoi-tho/, ghi public/tuoi-tho-dong-co/cast/ và cast.json
Bé tách riêng thân và hai chân (để chân đung đưa khi đi); ông bà giữ nguyên tư thế ngồi.
"""
from __future__ import annotations
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

sys.path.insert(0, str(Path(__file__).resolve().parent))
ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "tuoi-tho"
OUT = ROOT / "public" / "tuoi-tho-dong-co" / "cast"


def components(im, it=8, min_size=2500):
    a = np.array(im.convert("RGBA"))[..., 3] > 24
    lab, k = ndimage.label(ndimage.binary_dilation(a, iterations=it))
    sizes = ndimage.sum(a, lab, range(1, k + 1))
    cents = ndimage.center_of_mass(a, lab, range(1, k + 1))
    big = [i + 1 for i, s in enumerate(sizes) if s > min_size]
    owner = {i: i for i in big}
    for i in range(1, k + 1):
        if i in owner:
            continue
        dist, j = min((np.hypot(cents[i - 1][0] - cents[j - 1][0], cents[i - 1][1] - cents[j - 1][1]), j) for j in big)
        if dist < 220:
            owner[i] = j
    items = []
    for j in big:
        m = np.isin(lab, [i for i, o in owner.items() if o == j]) & a
        ys, xs = np.where(m)
        items.append(((ys.min(), ys.max() + 1, xs.min(), xs.max() + 1), m))
    return items


def cut(im, item, pad=4):
    (y0, y1, x0, x1), m = item
    arr = np.array(im.convert("RGBA"))
    arr[..., 3] = np.where(ndimage.binary_dilation(m, iterations=3), arr[..., 3], 0)
    return Image.fromarray(arr).crop((max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad))), (max(0, x0 - pad), max(0, y0 - pad))


def order(items, rows, cols, W, H):
    def key(t):
        (y0, y1, x0, x1), _ = t
        return (min(rows - 1, int(((y0 + y1) / 2) / (H / rows))), (x0 + x1) / 2)
    return sorted(items, key=key)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    meta = {"chars": {}, "props": {}}
    sheet = Image.open(SRC / "Be_va_ong_ba.png").convert("RGBA")
    items = order(components(sheet, 10, 8000), 2, 3, *sheet.size)
    assert len(items) == 6, len(items)
    names = [("be", "up"), ("ba", "fan"), ("ong", "sit"), ("be", "cheer"), ("ba", "greet"), ("ong", "smile")]
    for item, (who, pose) in zip(items, names):
        (OUT / who).mkdir(exist_ok=True)
        im, _ = cut(sheet, item)
        # chân đặt ở đáy ảnh; điểm giữa hai bàn chân
        a = np.array(im)[..., 3] > 24
        ys, xs = np.where(a)
        foot_y = int(ys.max())
        low = a[max(0, foot_y - 25): foot_y + 1]
        fx = int(np.where(low.any(axis=0))[0].mean())
        im.save(OUT / who / f"{pose}.png")
        meta["chars"].setdefault(who, {})[pose] = {"w": im.width, "h": im.height, "footX": fx, "footY": foot_y}
        print(who, pose, im.size, fx, foot_y)

    objs = Image.open(SRC / "Do_vat_lang_que.png").convert("RGBA")
    items = order(components(objs, 6, 3000), 3, 4, *objs.size)
    assert len(items) == 12, len(items)
    pn = ["bike", "moto", "kite", "spool", "grass", "flowers", "sparrow", "sparrow_fly", "tree", "house", "fan", "jar"]
    (OUT / "props").mkdir(exist_ok=True)
    for item, n in zip(items, pn):
        im, _ = cut(objs, item)
        im.save(OUT / "props" / f"{n}.png")
        meta["props"][n] = {"w": im.width, "h": im.height}
        print(n, im.size)
    (OUT / "cast.json").write_text(json.dumps(meta, indent=1))


main()
