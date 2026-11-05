"""Tách nền 2 sheet pose mới của "Giày mới. Vẫn là mình." (Tèo ×6, Minh ×6) thành sprite PNG trong suốt
và ghi vào public/giay-moi-van-la-minh/cast/{teo,teo_dirty,minh}/ + cast.json.

    python tools/cut_giay_poses.py
Nền sheet là gradient tối có quầng sáng; viền nhân vật đen đặc (<32) nên: đóng viền → flood từ mép → phần còn lại là nhân vật.
"""
from __future__ import annotations
import json
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "giay-moi" / "poses"
OUT = ROOT / "public" / "giay-moi-van-la-minh" / "cast"
NAMES = {"teo": ["sleep", "box", "hold", "tie", "bow", "look"], "minh": ["sit", "sitTalk", "sitLook", "stand", "walk", "phone"]}
THR = {"teo": 32, "minh": 12}


def mask_of(a: np.ndarray, thr: int) -> np.ndarray:
    lum = a.max(2)
    D = 3
    out = ndimage.binary_dilation(lum < thr, iterations=D)
    lab, _ = ndimage.label(~out)
    border = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])) - {0}
    char = ndimage.binary_fill_holes(~np.isin(lab, list(border)))
    char = ndimage.binary_erosion(char, iterations=D)
    lab, k = ndimage.label(char)
    keep = np.zeros_like(char)
    H, W = char.shape
    for i in range(1, k + 1):
        m = lab == i
        if m.sum() < 8000:
            continue
        ys, xs = np.where(m)
        if ys.min() == 0 or xs.min() == 0 or ys.max() == H - 1 or xs.max() == W - 1:
            continue
        if (lum[m] > 110).mean() < 0.12:
            continue
        keep |= m
    return keep


def main():
    cast = json.loads((OUT / "cast.json").read_text())
    for who in ("teo", "minh"):
        im = Image.open(SRC / f"{who}_sheet.png").convert("RGB")
        a = np.array(im).astype(float)
        keep = mask_of(a, THR[who])
        lab, k = ndimage.label(keep)
        objs = ndimage.find_objects(lab)
        items = []
        for i, sl in enumerate(objs):
            cy = (sl[0].start + sl[0].stop) / 2
            cx = (sl[1].start + sl[1].stop) / 2
            items.append((int(cy > a.shape[0] / 2), cx, i + 1, sl))
        items.sort(key=lambda t: (t[0], t[1]))
        assert len(items) == 6, (who, len(items))
        info = {}
        for (row, cx, lid, sl), name in zip(items, NAMES[who]):
            m = (lab[sl] == lid)
            rgb = a[sl].copy()
            h, w = m.shape
            # quần/chân đen bị quầng sáng ám nâu → kéo về đen (chỉ phần thấp, ít bão hòa, tối)
            sat = rgb.max(2) - rgb.min(2)
            lum = rgb.mean(2)
            low = np.zeros_like(m)
            low[int(h * 0.5):] = True
            leg = m & low & (sat < 48) & (lum < 150)
            rgb[leg] *= 0.14
            al = ndimage.gaussian_filter(m.astype(float), 0.8)
            al = np.clip((al - 0.3) / 0.5, 0, 1)
            rgba = np.dstack([np.clip(rgb, 0, 255), al * 255]).astype("uint8")
            ys, xs = np.where(m)
            footY = int(ys.max())
            foot_cols = xs[ys > ys.max() - 6]
            footX = int(foot_cols.mean())
            info[name] = {"w": w, "h": h, "footX": footX, "footY": footY, "bodyH": h}
            dirs = ["teo", "teo_dirty"] if who == "teo" else ["minh"]
            for d in dirs:
                (OUT / d).mkdir(parents=True, exist_ok=True)
                Image.fromarray(rgba).save(OUT / d / f"{name}.png")
        ref = info["hold"]["h"] if who == "teo" else info["stand"]["h"]
        for d in (["teo", "teo_dirty"] if who == "teo" else ["minh"]):
            base = cast["chars"].get(d, {})
            for name, v in info.items():
                base[name] = {**v, "ref": ref}
            cast["chars"][d] = base
    (OUT / "cast.json").write_text(json.dumps(cast, ensure_ascii=False))
    print("ok")


if __name__ == "__main__":
    main()
