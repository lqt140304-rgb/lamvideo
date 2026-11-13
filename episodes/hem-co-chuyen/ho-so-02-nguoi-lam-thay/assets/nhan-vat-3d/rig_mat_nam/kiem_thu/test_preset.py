"""Lớp preset 3D hai mức: đủ 24 nhóm đúng tên repo, phối riêng từng mức, Người Kia ghi rõ; bốn nhóm làm trước sạch biến dạng
ở cả hai mức và khi chuyển tiếp."""
import os, re
from rig_mat_nam import preset, kiem, dung, shape_key

KEY_REPO = ['binh-than', 'buon-ngu', 'vui', 'buon', 'tuc-gian', 'so-hai', 'bat-ngo', 'nghi-ngo', 'suy-luan', 'kim-nen', 'nhe-nhom',
            'boi-roi', 'buong-xuoi', 'cuoi-che-giau', 'ghe-so', 'khinh-thuong', 'kiet-suc', 'lo-lang', 'ngai-ngu', 'quyet-tam',
            'toi-loi', 'tu-man', 'tui-than', 'ma-quai']
DA_KIEM = ['binh-than', 'vui', 'buon', 'so-hai']
_C = {}


def _r():
    if 'r' not in _C: _C['r'] = dung.dung_rig()
    return _C['r']


def test_du_24_nhom_khop_nguon_repo():
    d = preset.nap(); assert sorted(d) == sorted(KEY_REPO)
    readme = open(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'tham-chieu-bieu-cam', 'README.md'), encoding='utf-8').read()
    assert sorted(set(re.findall(r'`([a-z]+(?:-[a-z]+)+|vui|buon)`', readme)) & set(KEY_REPO)) == sorted(KEY_REPO)


def test_dieu_khien_hop_le_va_trong_khoang():
    hop_le = set(shape_key.KEYS) | {'jaw_open', 'look_x', 'look_y'}
    for n, x in preset.nap().items():
        for m in ('nhe', 'ro'):
            for k, v in x[m].items():
                assert k in hop_le, (n, m, k)
                assert (-1.0 <= v <= 1.0) if k.startswith('look') else (0.0 <= v <= 1.0), (n, m, k, v)


def test_hai_muc_phoi_rieng_khong_nhan_dong_loat():
    for n, x in preset.nap().items():
        a, b = x['nhe'], x['ro']; chung = [k for k in a if k in b and a[k] != 0]
        ti_so = {round(b[k] / a[k], 3) for k in chung}
        assert set(a) != set(b) or len(ti_so) > 1, (n, 'RÕ chỉ là NHẸ nhân một hệ số')


def test_nguoi_kia_ghi_ro():
    d = preset.nap()
    for n in ('cuoi-che-giau', 'ma-quai'): assert d[n]['nhan_vat'] == 'Người Kia' and 'không dùng làm nét trung tính của Nam' in d[n]['dien_bien']
    assert sorted(n for n, x in d.items() if x['da_kiem']) == sorted(DA_KIEM)


def test_bon_nhom_sach_bien_dang_hai_muc_va_chuyen_tiep():
    r = _r(); loi = []
    for n in DA_KIEM:
        for m in ('nhe', 'ro'):
            preset.dat(r, n, m); loi += [(n, m, l) for l in kiem.loi_bien_dang(r)]
        for t in (0.25, 0.5, 0.75):
            preset.tron(r, (n, 'nhe'), (n, 'ro'), t); loi += [(n, f'nhe→ro {t}', l) for l in kiem.loi_bien_dang(r)]
            if n != 'binh-than':
                preset.tron(r, ('binh-than', 'nhe'), (n, 'ro'), t); loi += [(n, f'binh-than→ro {t}', l) for l in kiem.loi_bien_dang(r)]
    assert loi == [], loi[:6]
