import os, subprocess, sys, tempfile
AQ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
LENH = os.path.join(AQ, 'bieu_cam_nam.py')


def test_lenh_kiem_thoat_0():
    r = subprocess.run([sys.executable, LENH, '--kiem'], capture_output=True, text=True, timeout=600)
    assert r.returncode == 0, r.stdout[-800:] + r.stderr[-800:]
    assert 'PASS' in r.stdout and '0 lỗi' in r.stdout, r.stdout[-400:]


def test_lenh_anh_va_bang():
    from PIL import Image
    with tempfile.TemporaryDirectory() as t:
        r = subprocess.run([sys.executable, LENH, '--anh', t], capture_output=True, text=True, timeout=900)
        assert r.returncode == 0, r.stdout[-600:] + r.stderr[-600:]
        pngs = sorted(f for f in os.listdir(t) if f.endswith('.png')); from bieu_cam import tao_key
        assert len(pngs) == (len(tao_key.nap_dinh_nghia()) + 1) * 3, pngs
        assert 'nghi__chinh_dien.png' in pngs and 'kinh_hoang__nghieng.png' in pngs
        from bieu_cam import bang_anh
        ra = os.path.join(t, 'bang.png'); bang_anh.ghep(t, ra)
        w, h = Image.open(ra).size; assert w >= 3 * 200 and h >= 7 * 200, (w, h)
