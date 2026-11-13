"""Điều khiển cơ bản: hàm (bone), hướng nhìn (xoay nhãn cầu), mí (shape key + mặt cầu va chạm), mày/miệng/má (shape key).
Mỗi test kiểm cả tác dụng đúng hướng và không gây lỗi biến dạng (xuyên nhãn cầu, khe sáng, môi hở, răng xuyên)."""
import bpy
from rig_mat_nam import dung, kiem

_C = {}


def _r():
    if 'r' not in _C: _C['r'] = dung.dung_rig()
    kiem.dat_lai(_C['r']); return _C['r']


def _tam(ob): return kiem.tam(ob)


def test_du_dieu_khien():
    r = _r(); ten = set(r.head.data.shape_keys.key_blocks.keys())
    for k in ('blink_L', 'blink_R', 'eye_wide_L', 'eye_wide_R', 'squint_L', 'squint_R', 'brow_inner_up_L', 'brow_inner_up_R',
              'brow_outer_up_L', 'brow_outer_up_R', 'brow_down_L', 'brow_down_R', 'brow_knit', 'smile_L', 'smile_R', 'frown_L',
              'frown_R', 'lip_press', 'mouth_pucker', 'mouth_wide', 'upper_lip_raise_L', 'upper_lip_raise_R', 'cheek_raise_L', 'cheek_raise_R'):
        assert k in ten, k
    for p in ('jaw_open', 'look_x', 'look_y'): assert p in r.arm, p


def test_ham_mo():
    r = _r(); m0 = kiem.moi(r); rd0 = _tam(bpy.data.objects['Rang_Duoi']); rt0 = _tam(bpy.data.objects['Rang_Tren'])
    kiem.dat(r, jaw_open=1.0); m1 = kiem.moi(r)
    assert m0['duoi_giua'].z - m1['duoi_giua'].z >= 0.015, m0['duoi_giua'].z - m1['duoi_giua'].z
    assert abs(m1['tren_giua'].z - m0['tren_giua'].z) <= 0.0015
    assert rd0.z - _tam(bpy.data.objects['Rang_Duoi']).z >= 0.010 and (rt0 - _tam(bpy.data.objects['Rang_Tren'])).length < 1e-6


def test_huong_nhin_xoay_nhan_cau():
    r = _r(); c0 = {k: kiem.dong_tu(r, k) for k in 'LR'}
    kiem.dat(r, look_x=1.0)
    for k in 'LR': assert kiem.dong_tu(r, k).x - c0[k].x >= 0.015, k
    kiem.dat(r, look_x=0.0, look_y=-1.0)
    for k in 'LR': assert c0[k].z - kiem.dong_tu(r, k).z >= 0.010, k


def test_chop_mat_kin_va_rieng_tung_mat():
    r = _r()
    kiem.dat(r, blink_L=1.0)
    assert kiem.khe_sang(r, 'L') == 0, 'mắt trái nhắm còn khe sáng'
    assert kiem.khe_sang(r, 'R') > 20, 'mắt phải phải vẫn mở'
    kiem.dat(r, blink_L=0.0, blink_R=1.0)
    assert kiem.khe_sang(r, 'R') == 0 and kiem.khe_sang(r, 'L') > 20


def test_may_bam_tran():
    r = _r(); y0 = _tam(bpy.data.objects['Eyebrow_Rig.L']).z
    kiem.dat(r, brow_inner_up_L=1.0, brow_outer_up_L=1.0); assert _tam(bpy.data.objects['Eyebrow_Rig.L']).z - y0 >= 0.004
    assert kiem.loi_bien_dang(r) == []


def test_cuoi_nang_khoe():
    r = _r(); m0 = kiem.moi(r); kiem.dat(r, smile_L=1.0, smile_R=1.0); m1 = kiem.moi(r)
    assert m1['khoe_L'].z - m0['khoe_L'].z >= 0.004 and m1['khoe_R'].z - m0['khoe_R'].z >= 0.004


def test_trang_thai_kiem_bien_dang():
    """Các tổ hợp trong yêu cầu: không xuyên nhãn cầu, không khe sáng ngoài ý muốn, môi không hở khi đóng, răng không xuyên,
    không nhìn xuyên đầu qua miệng, không lật mặt."""
    r = _r(); loi = []
    for tt in kiem.TRANG_THAI_KIEM:
        kiem.dat_lai(r); kiem.dat(r, **tt['dk'])
        for l in kiem.loi_bien_dang(r, tt.get('mieng_dong', False)): loi.append((tt['ten'], l))
    assert loi == [], loi[:8]
