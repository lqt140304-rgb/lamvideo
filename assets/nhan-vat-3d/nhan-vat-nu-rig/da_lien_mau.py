"""Texture da liền màu cho base nữ: phủ màu da lên vùng bộ đồ xám, xóa nếp vải trong normal map.

py -I da_lien_mau.py   → ghi texture/texture_{diffuse,normal,roughness,metallic}_da.png cạnh script.
Texture gốc trong ../nhan-vat-nu-goc/nguon/ chỉ đọc.
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

TEN = ('diffuse', 'normal', 'roughness', 'metallic')


def _lum_sat(a):
    mx, mn = a.max(2), a.min(2)
    return a.mean(2), (mx - mn) / np.maximum(mx, 1e-6)


def _xam(a):
    lum, sat = _lum_sat(a)
    return (sat < 0.15) & (lum < 0.42), lum < 0.19


def vung_mat_giu(diffuse):
    """Mắt, mày, mi: các mảng xám/tối nhỏ có nhiều điểm rất tối, nằm rời khỏi mảng bộ đồ lớn."""
    xam, toi = _xam(diffuse)
    lab, n = ndimage.label(xam)
    size = np.bincount(lab.ravel(), minlength=n + 1)
    dark = np.bincount(lab.ravel(), weights=toi.ravel(), minlength=n + 1)
    giu = (dark / np.maximum(size, 1) >= 0.2) & (size < 60000)
    giu[0] = False
    # nới 3 px để giữ cả mép mống mắt/mi ngả màu (độ bão hòa > 0.15)
    return ndimage.binary_dilation(giu[lab], iterations=3) & (diffuse.mean(2) < 0.42)


def vung_bo_do(diffuse):
    return _xam(diffuse)[0] & ~vung_mat_giu(diffuse)


def _to_tu_da(img, skin, bd, dist_full=1.0):
    """Trung vị da (dist_full=1): hai đảo UV hai bên đường nối nhận cùng một màu, không lộ dải."""
    dist, (iy, ix) = ndimage.distance_transform_edt(~skin, return_indices=True)
    gan = img[iy, ix]
    med = np.median(img[skin], 0)
    t = np.clip(dist / dist_full, 0, 1)[..., None]
    return gan * (1 - t) + med * t, med


def diem_trong_doan(seg, N, lui_px=2):
    """5 điểm ảnh dọc đoạn UV a→b, lùi lui_px vào trong đảo (về phía đỉnh thứ ba c)."""
    a, b, c = (np.array([u * N, (1 - v) * N]) for u, v in seg)
    pts = []
    for t in (0.2, 0.35, 0.5, 0.65, 0.8):
        p = a + (b - a) * t
        d = c - p
        p = p + d / max(np.linalg.norm(d), 1e-6) * lui_px
        pts.append((int(min(N - 1, max(0, p[0]))), int(min(N - 1, max(0, p[1])))))
    return pts


def _dai_duong_noi(duong_noi, bd, vm, N, rong):
    """Trọng số 0–1 quanh các đường nối UV giáp bộ đồ cũ (cả hai phía), 1 sát đường nối."""
    import json
    from PIL import ImageDraw
    gan_bd = ndimage.binary_dilation(bd, iterations=8)
    im = Image.new('L', (N, N), 0)
    dr = ImageDraw.Draw(im)
    for a, b in json.loads(Path(duong_noi).read_text(encoding='utf-8')):
        pa, pb = diem_trong_doan(a, N), diem_trong_doan(b, N)
        if any(gan_bd[y, x] for x, y in pa + pb) and not any(vm[y, x] for x, y in pa + pb):
            for s in (a, b):
                dr.line([(s[0][0] * N, (1 - s[0][1]) * N), (s[1][0] * N, (1 - s[1][1]) * N)], fill=255, width=3)
    dist = ndimage.distance_transform_edt(np.asarray(im) == 0)
    t = np.clip(1 - (dist - 8) / rong, 0, 1)  # 8 px sát đường nối thay hẳn (đường may gốc lệch vài px)
    t[vm] = 0  # không lấn vào mắt/mày
    return (t * t * (3 - 2 * t))[..., None]


def lam_texture_da(src_dir, out_dir, vien_px=16, duong_noi=Path(__file__).resolve().parent / 'duong-noi-uv.json'):
    src_dir, out_dir = Path(src_dir), Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    img = {t: np.asarray(Image.open(src_dir / f'texture_{t}.png').convert('RGB'), dtype=np.float32) / 255 for t in TEN}
    d = img['diffuse']
    bd = vung_bo_do(d)
    lum, sat = _lum_sat(d)
    vm = vung_mat_giu(d)
    # đường may cổ/cổ tay/cổ chân nằm sát ngoài bộ đồ 1–6 px: thay luôn dải này
    thay = ndimage.binary_dilation(bd, iterations=6) & ~vm
    skin = (sat > 0.25) & (lum > 0.5) & ~thay
    # viền chuyển mềm: 1 trong vùng thay, giảm dần ra ngoài vien_px
    ms = np.maximum(ndimage.gaussian_filter(thay.astype(np.float32), vien_px / 2), thay)[..., None]
    quanh_mat = ndimage.binary_dilation(vm, iterations=4)  # vùng chuyển không lấn vào mép mắt/mày
    ms[quanh_mat] = thay[quanh_mat, None]
    out = {}
    for t in ('diffuse', 'roughness', 'metallic'):
        fill, med = _to_tu_da(img[t], skin, bd)
        out[t] = img[t] * (1 - ms) + fill * ms
        if t == 'diffuse':
            mau_da = tuple(float(v) for v in med)
    phang = np.array([128, 128, 255], np.float32) / 255
    # hai phía đường nối UV (cổ tay, cổ chân…) nằm ở hai đảo xa nhau trên ảnh: kéo cả hai về cùng màu da
    wn = _dai_duong_noi(duong_noi, bd, ndimage.binary_dilation(vm, iterations=4), d.shape[0], vien_px * 1.5)
    for t in ('diffuse', 'roughness', 'metallic'):
        med = np.median(img[t][skin], 0)
        out[t] = out[t] * (1 - wn) + med * wn
    tn = ndimage.binary_dilation(bd, iterations=8)
    mn = np.maximum(ndimage.gaussian_filter(tn.astype(np.float32), vien_px / 2), tn)[..., None]
    mn[quanh_mat] = tn[quanh_mat, None] & ~vm[quanh_mat, None]
    mn = np.maximum(mn, wn)
    out['normal'] = img['normal'] * (1 - mn) + phang * mn
    for t, a in out.items():
        Image.fromarray(np.clip(np.round(a * 255), 0, 255).astype(np.uint8)).save(out_dir / f'texture_{t}_da.png', optimize=True)
    moi = out['diffuse']
    l2, s2 = _lum_sat(moi)
    con = int(((l2 < 0.35) & (s2 < 0.12) & ~vung_mat_giu(d)).sum())
    return {'mau_da': mau_da, 'diem_xam_con_lai': con, 'so_px_bo_do': int(bd.sum())}


if __name__ == '__main__':
    here = Path(__file__).resolve().parent
    kq = lam_texture_da(here.parent / 'nhan-vat-nu-goc' / 'nguon', here / 'texture')
    print(kq)
    assert kq['diem_xam_con_lai'] == 0, kq
