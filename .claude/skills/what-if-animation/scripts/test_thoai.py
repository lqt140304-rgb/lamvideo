"""Tests for trich_thoai.py and voice_cues.py. Run: py .claude/skills/what-if-animation/scripts/test_thoai.py"""
import base64, json, pathlib, sys, tempfile

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from trich_thoai import trich


def test_trich_co_nhan():
    c = trich('### CẢNH 1.1: X\n**NAM [ngái ngủ]:**\n> Câu một.\n> Câu hai.\n')
    assert len(c) == 1, c
    assert c[0]['vai'] == 'NAM' and c[0]['cam_xuc'] == 'ngái ngủ'
    assert c[0]['loi'] == 'Câu một. Câu hai.' and c[0]['id'] == 'C1.1_NAM_01'


def test_trich_dong_khong_nhan():
    c = trich('### CẢNH 1.1: X\nNam nhăn mặt bực bội:\n> Lại rung, điếc cả tai!\n')
    assert len(c) == 1, c
    assert c[0]['vai'] == 'NAM' and c[0]['cam_xuc'] == 'bực bội'


def test_bo_qua_ghi_chu():
    c = trich('> **Vũ trụ:** abc\n### CẢNH 1.1: X\n> 🎬 **BƯỚC CHUYỂN** x\n> * **Sound Bridge** x\n')
    assert c == [], c


def test_trich_trong_doan_van():
    c = trich('### CẢNH 2.2: X\n  * Tùng ngồi bệt xuống sàn: *"Ê Nam, gãy cả lưng."*  \n')
    assert len(c) == 1 and c[0]['vai'] == 'TÙNG' and c[0]['loi'] == 'Ê Nam, gãy cả lưng.', c
    assert c[0]['ra_soat'] is True


CUES = [{'id': f'C1.1_NAM_0{i}', 'vai': 'NAM', 'cam_xuc': 'buồn' if i == 1 else '', 'loi': f'Câu {i}.'} for i in (1, 2, 3)]
GIONG = {'NAM': {'id': 'v1', 'settings': {'stability': 0.4}}}


class Goi:
    def __init__(self, hong_o=None):
        self.n, self.hong_o, self.texts = 0, hong_o, []

    def __call__(self, path, body):
        self.n += 1
        if self.hong_o == self.n:
            raise RuntimeError('API lỗi')
        self.texts.append(body['text'])
        assert body['model_id'] == 'eleven_v3_conversational'
        return b'ID3fake-mp3'


def test_cache_khong_goi_lai():
    from voice_cues import doc
    with tempfile.TemporaryDirectory() as d:
        g = Goi()
        doc(CUES, GIONG, pathlib.Path(d), g, do_dai=lambda p: 1.0)
        doc(CUES, GIONG, pathlib.Path(d), g, do_dai=lambda p: 1.0)
        assert g.n == 3, g.n
        assert g.texts[0] == '[buồn] Câu 1.' and g.texts[1] == 'Câu 2.'


def test_doi_loi_chi_tao_lai_cue_do():
    from voice_cues import doc
    with tempfile.TemporaryDirectory() as d:
        g = Goi()
        doc(CUES, GIONG, pathlib.Path(d), g, do_dai=lambda p: 1.0)
        moi = [dict(c) for c in CUES]
        moi[1]['loi'] = 'Câu hai đã sửa.'
        m = doc(moi, GIONG, pathlib.Path(d), g, do_dai=lambda p: 1.0)
        assert g.n == 4, g.n
        assert set(m) == {c['id'] for c in CUES}


def test_loi_giua_chung_giu_file_cu():
    from voice_cues import doc
    with tempfile.TemporaryDirectory() as d:
        d = pathlib.Path(d)
        try:
            doc(CUES, GIONG, d, Goi(hong_o=2), do_dai=lambda p: 1.0)
        except RuntimeError:
            pass
        assert (d / 'C1.1_NAM_01.mp3').exists()
        m = json.loads((d / 'manifest.json').read_text(encoding='utf-8'))
        assert list(m) == ['C1.1_NAM_01'], m


if __name__ == '__main__':
    fails = 0
    for k, f in list(globals().items()):
        if k.startswith('test_') and callable(f):
            try:
                f()
                print('PASS', k)
            except Exception as e:
                fails += 1
                print('FAIL', k, repr(e))
    sys.exit(1 if fails else 0)
