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
