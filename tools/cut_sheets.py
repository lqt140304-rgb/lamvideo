"""Cắt các bảng sprite (lưới 4x3, nền trong suốt) thành từng PNG riêng.

    python tools/cut_sheets.py            # đọc assets/chua-dung/*.png, ghi public/lon-roi-hen-du-hoi/cast/

Mỗi nhân vật: 12 tư thế theo thứ tự cố định (POSES). Ghi kèm cast.json: kích thước và điểm đặt chân
(footX, footY) của từng tư thế, và chiều cao tư thế đứng (ref) để chia tỉ lệ đồng nhất giữa các tư thế.
"""
from __future__ import annotations
import json
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "chua-dung"
OUT = ROOT / "public" / "lon-roi-hen-du-hoi" / "cast"

POSES = ["stand", "wave", "point", "think", "surprised", "cheer", "sad", "angry", "walk", "run", "sit", "phone"]
CHARS = {"bom": "ban-be-kinh-ao-xanh-la.png", "na": "ban-nu-ao-tim.png", "teo": "ban-nam-ao-cam.png"}
PROPS = {
    "do-vat-noi-that-may-moc.png": ["table", "chair", "sofa", "tv", "fridge", "crt", "pc", "laptop", "desk", "bed", "fan", "stool"],
    "do-vat-doi-thuong.png": ["phone", "mug", "ricecooker", "kettle", "noodles", "plate", "backpack", "bike", "umbrella", "headset", "racket", "shuttle", "clock"],
}

def blobs(im: Image.Image, n: int = 12, it: int = 6):
    """Trả về n (bbox, mask) theo thứ tự hàng trước cột sau. Mảnh nhỏ (vạch tốc độ, dấu !) gộp vào hình gần nhất."""
    a = np.array(im.convert("RGBA"))[..., 3] > 24
    lab, k = ndimage.label(ndimage.binary_dilation(a, iterations=it))
    sizes = ndimage.sum(a, lab, range(1, k + 1))
    cents = ndimage.center_of_mass(a, lab, range(1, k + 1))
    big = [i + 1 for i, sz in enumerate(sizes) if sz > 3000]
    assert len(big) == n, f"tìm thấy {len(big)} hình, cần {n}"
    owner = {i: i for i in big}
    for i in range(1, k + 1):
        if i in owner:
            continue
        d = [(np.hypot(cents[i - 1][0] - cents[j - 1][0], cents[i - 1][1] - cents[j - 1][1]), j) for j in big]
        dist, j = min(d)
        if dist < 260:
            owner[i] = j
    items = []
    for j in big:
        m = np.isin(lab, [i for i, o in owner.items() if o == j]) & a
        ys, xs = np.where(m)
        items.append(((ys.min(), ys.max() + 1, xs.min(), xs.max() + 1), m))
    items.sort(key=lambda t: (min(2, int((t[0][0] + t[0][1]) / 2 / (im.height / 3))), (t[0][2] + t[0][3]) / 2))
    return items


def crop(im, item, pad=6):
    (y0, y1, x0, x1), m = item
    arr = np.array(im.convert("RGBA"))
    arr[..., 3] = np.where(ndimage.binary_dilation(m, iterations=3), arr[..., 3], 0)
    c = Image.fromarray(arr)
    return c.crop((max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad)))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = {"chars": {}, "props": {}}
    for cid, fn in CHARS.items():
        im = Image.open(SRC / fn).convert("RGBA")
        d = OUT / cid; d.mkdir(exist_ok=True)
        info = {}
        for pose, b in zip(POSES, blobs(im)):
            c = crop(im, b)
            a = np.array(c)[..., 3] > 24
            ys, xs = np.where(a)
            low = ys > ys.max() - max(8, int(0.12 * (ys.max() - ys.min())))
            footX = int(xs[low].mean()); footY = int(ys.max())
            c.save(d / f"{pose}.png")
            info[pose] = {"w": c.width, "h": c.height, "footX": footX, "footY": footY, "bodyH": int(ys.max() - ys.min())}
        info["_ref"] = info["stand"]["bodyH"]
        manifest["chars"][cid] = info
    for fn, names in PROPS.items():
        im = Image.open(SRC / fn).convert("RGBA")
        d = OUT / "props"; d.mkdir(exist_ok=True)
        for name, b in zip(names, blobs(im, len(names), 2 if "doi-thuong" in fn else 6)):
            c = crop(im, b)
            c.save(d / f"{name}.png")
            manifest["props"][name] = {"w": c.width, "h": c.height}
    (OUT / "cast.json").write_text(json.dumps(manifest, indent=1), encoding="utf8")
    print("ghi", OUT, {k: len(v) for k, v in manifest.items()})

if __name__ == "__main__":
    main()
