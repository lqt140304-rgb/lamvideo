"""Chuẩn bị asset cho "Giày mới. Vẫn là mình.": đổi giày trắng của sprite Tèo thành giày san hô-kem (khớp đôi giày mới),
làm thêm bản giày hơi bẩn, và cắt 8 đạo cụ từ Running_props.png.

    python tools/make_giay_moi.py     # đọc assets/giay-moi/, public/lon-roi-hen-du-hoi/cast/ → public/giay-moi-van-la-minh/cast/
"""
from __future__ import annotations
import json, shutil
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "giay-moi"
BASE = ROOT / "public" / "lon-roi-hen-du-hoi" / "cast"
OUT = ROOT / "public" / "giay-moi-van-la-minh" / "cast"
rng = np.random.default_rng(11)
CORAL = np.array([236, 132, 112], float)
CREAM = np.array([246, 232, 206], float)
DIRT = np.array([140, 108, 74], float)


def recolor(path: Path, dirty: bool) -> Image.Image:
    im = Image.open(path).convert("RGBA")
    a = np.array(im).astype(float)
    h, w = a.shape[:2]
    rgb, al = a[..., :3], a[..., 3]
    mx, mn = rgb.max(2), rgb.min(2)
    white = (mn > 190) & ((mx - mn) < 26) & (al > 200)
    white[: int(h * 0.5)] = False
    lab, k = ndimage.label(white)
    out = rgb.copy()
    for i in range(1, k + 1):
        ys, xs = np.where(lab == i)
        if len(ys) < 120:
            continue
        y0, y1 = ys.min(), ys.max()
        lum = rgb[ys, xs].mean(1) / 255.0
        sole = ys > y0 + 0.66 * (y1 - y0)
        base = np.where(sole[:, None], CREAM, CORAL)
        col = base * (0.55 + 0.45 * lum)[:, None]
        if dirty:
            low = ys > y0 + 0.52 * (y1 - y0)
            m = low & (rng.random(len(ys)) < np.where(sole, 0.5, 0.22))
            col[m] = DIRT * (0.8 + 0.3 * rng.random(m.sum()))[:, None]
        out[ys, xs] = col
    a[..., :3] = np.clip(out, 0, 255)
    return Image.fromarray(a.astype("uint8"))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for who in ("bom", "na"):
        shutil.copytree(BASE / who, OUT / who, dirs_exist_ok=True)
    for tag, dirty in (("teo", False), ("teo_dirty", True)):
        (OUT / tag).mkdir(exist_ok=True)
        for p in (BASE / "teo").glob("*.png"):
            recolor(p, dirty).save(OUT / tag / p.name)
    shutil.copytree(BASE / "props", OUT / "props", dirs_exist_ok=True)
    cast = json.loads((BASE / "cast.json").read_text())
    cast["chars"]["teo_dirty"] = cast["chars"]["teo"]
    # 8 đạo cụ
    sheet = Image.open(SRC / "Running_props.png").convert("RGBA")
    a = np.array(sheet)[..., 3] > 24
    lab, k = ndimage.label(ndimage.binary_dilation(a, iterations=8))
    sizes = ndimage.sum(a, lab, range(1, k + 1))
    big = [i + 1 for i, s in enumerate(sizes) if s > 6000]
    assert len(big) == 8, len(big)
    items = []
    for j in big:
        ys, xs = np.where((lab == j) & a)
        items.append((ys.min(), ys.max() + 1, xs.min(), xs.max() + 1))
    items.sort(key=lambda t: (int((t[0] + t[1]) / 2 / (sheet.height / 2)), (t[2] + t[3]) / 2))
    names = ["shoebox", "shoes", "watch", "bottle", "alarm", "shirt", "parcel", "shoes_dirty"]
    for (y0, y1, x0, x1), n in zip(items, names):
        c = sheet.crop((max(0, x0 - 4), max(0, y0 - 4), min(sheet.width, x1 + 4), min(sheet.height, y1 + 4)))
        c.save(OUT / "props" / f"{n}.png")
        cast["props"][n] = {"w": c.width, "h": c.height}
        print(n, c.size)
    (OUT / "cast.json").write_text(json.dumps(cast, indent=1))


main()
