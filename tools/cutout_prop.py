"""Tách nền trắng của ảnh vật thể (xe, trụ sạc…) thành PNG trong suốt, cắt sát và ghi kích thước vào src/props.ts.

    python tools/cutout_prop.py <ảnh gốc> <tên>      # tên: xe-xang | xe-dien
    ví dụ: python tools/cutout_prop.py ~/Downloads/xe-xang.png xe-xang

Ảnh gốc nên là nền trắng trơn, rộng từ 1200px trở lên. Kết quả: public/props/<tên>.png
"""
from __future__ import annotations
import json, re, sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent.parent

def main(src: str, name: str) -> None:
    im = Image.open(src).convert("RGB")
    if im.width > 1800:
        im = im.resize((1800, round(im.height * 1800 / im.width)), Image.LANCZOS)
    a = np.asarray(im).astype(np.int16)
    # nền = vùng gần trắng nối với mép ảnh
    near_white = (a.min(axis=2) >= 232) & ((a.max(axis=2) - a.min(axis=2)) <= 14)
    lab, _ = ndi.label(near_white)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge))
    fg = ~bg
    fg = ndi.binary_opening(fg, iterations=1)
    lab2, n = ndi.label(fg)
    if n:
        sizes = ndi.sum(fg, lab2, range(1, n + 1))
        keep = 1 + int(np.argmax(sizes))
        fg = ndi.binary_dilation(lab2 == keep, iterations=2)  # bỏ mảnh vụn, giữ thân xe
        fg = ndi.binary_fill_holes(fg) | fg
    # cạnh mềm
    alpha = ndi.gaussian_filter(fg.astype(np.float32), 0.8)
    alpha = np.clip((alpha - 0.15) / 0.7, 0, 1)
    out = np.dstack([np.asarray(im), (alpha * 255).astype(np.uint8)])
    img = Image.fromarray(out, "RGBA")
    box = img.getbbox()
    img = img.crop((max(0, box[0] - 4), max(0, box[1] - 4), min(img.width, box[2] + 4), min(img.height, box[3] + 4)))
    dest = ROOT / "public" / "props" / f"{name}.png"
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, optimize=True)
    key = {"xe-xang": "xeXang", "xe-dien": "xeDien"}.get(name, re.sub(r"-(\w)", lambda m: m.group(1).upper(), name))
    pj = ROOT / "src" / "props.json"
    data = json.loads(pj.read_text()) if pj.exists() else {}
    data[key] = {"file": f"props/{name}.png", "w": img.width, "h": img.height}
    pj.write_text(json.dumps(data, indent=2) + "\n")
    print(f"{dest.relative_to(ROOT)}  {img.width}x{img.height}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
