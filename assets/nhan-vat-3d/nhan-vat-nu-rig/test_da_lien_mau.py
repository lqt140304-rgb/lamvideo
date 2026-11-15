"""Kiểm texture da liền màu. Chạy: py -I test_da_lien_mau.py (trong thư mục rig)."""
import hashlib
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
SRC = HERE.parent / 'nhan-vat-nu-goc' / 'nguon'
TEN = ('diffuse', 'normal', 'roughness', 'metallic')


def doc(p):
    return np.asarray(Image.open(p).convert('RGB'), dtype=np.float32) / 255


def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()


def test_vung_bo_do_bat_dung():
    import da_lien_mau as D
    a = np.zeros((4, 4, 3), np.float32)
    a[:] = (0.93, 0.72, 0.60)
    a[0, 0] = a[0, 1] = (0.25, 0.25, 0.26)
    m = D.vung_bo_do(a)
    assert m.sum() == 2 and m[0, 0] and m[0, 1], m


def test_chay_that():
    import da_lien_mau as D
    truoc = {t: sha(SRC / f'texture_{t}.png') for t in TEN}
    out = Path(tempfile.mkdtemp())
    kq = D.lam_texture_da(SRC, out)
    assert kq['so_px_bo_do'] > 0.15 * 2048 * 2048, kq
    assert kq['diem_xam_con_lai'] == 0, kq
    # test_goc_khong_doi
    assert all(sha(SRC / f'texture_{t}.png') == truoc[t] for t in TEN), 'Texture gốc bị sửa'
    goc = doc(SRC / 'texture_diffuse.png')
    moi = doc(out / 'texture_diffuse_da.png')
    # test_khong_con_xam_ca_padding: không còn điểm xám tối ngoài vùng mặt giữ lại
    mx, mn = moi.max(2), moi.min(2)
    sat = (mx - mn) / np.maximum(mx, 1e-6)
    xam = (moi.mean(2) < 0.35) & (sat < 0.12) & ~D.vung_mat_giu(goc)
    assert xam.sum() == 0, f'Còn {xam.sum()} điểm xám'
    # test_normal_phang_vung_bo_do
    n = doc(out / 'texture_normal_da.png')
    bd = D.vung_bo_do(goc)
    lech = np.abs(n[bd] - np.array([0.5, 0.5, 1.0])).max()
    assert lech <= 0.02 + 1 / 255, f'Normal vùng bộ đồ lệch {lech:.3f}'
    # test_khong_vien_may: dải 1–6 px quanh bộ đồ cũ (đường may cổ, cổ tay, cổ chân) không sẫm hơn,
    # không gồ hơn da xa hơn (10–14 px)
    from scipy import ndimage
    dist = ndimage.distance_transform_edt(~bd)
    gan, xa = (dist > 0) & (dist <= 6), (dist > 10) & (dist <= 14)
    dl = moi[xa].mean() - moi[gan].mean()
    assert dl < 0.01, f'Viền bộ đồ sẫm hơn da {dl:.3f}'
    lech = lambda m: np.abs(n[m] - np.array([0.5, 0.5, 1.0])).max(1).mean()
    assert lech(gan) <= lech(xa) + 0.005, f'Normal viền gồ {lech(gan):.3f} > {lech(xa):.3f}'
    # test_duong_noi_khop: hai phía mỗi đường nối UV giáp bộ đồ cũ (cổ tay, cổ chân) cùng màu
    import json
    vm = D.vung_mat_giu(goc)
    N = moi.shape[0]
    gan_bd = ndimage.binary_dilation(bd, iterations=8)

    def mau_doan(seg):
        import da_lien_mau as D2
        return D2.diem_trong_doan(seg, N, lui_px=2)

    lech_max, so = 0, 0
    for a, b in json.loads((HERE / 'duong-noi-uv.json').read_text(encoding='utf-8')):
        pa, pb = mau_doan(a), mau_doan(b)
        if not any(gan_bd[y, x] for x, y in pa + pb) or any(vm[y, x] for x, y in pa + pb):
            continue
        ca = np.mean([moi[y, x] for x, y in pa], 0)
        cb = np.mean([moi[y, x] for x, y in pb], 0)
        lech_max = max(lech_max, np.abs(ca - cb).max())
        so += 1
    assert so > 10, f'Chỉ thấy {so} đường nối giáp bộ đồ'
    assert lech_max < 0.03, f'Hai phía đường nối lệch màu {lech_max:.3f} ({so} đường)'
    # vùng mặt giữ nguyên: mắt/mày không bị tô da
    vm = D.vung_mat_giu(goc)
    assert vm.sum() > 2000 and np.abs(moi[vm] - goc[vm]).max() < 1e-6, 'Mắt/mày bị đổi màu'


if __name__ == '__main__':
    for f in (test_vung_bo_do_bat_dung, test_chay_that):
        f()
        print('PASS', f.__name__)
