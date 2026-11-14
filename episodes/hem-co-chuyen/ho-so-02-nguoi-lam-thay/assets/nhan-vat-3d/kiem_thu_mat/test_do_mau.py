"""Kiểm phần thuần Python của do_mau_nam (không cần bpy). Chạy: python -m pytest kiem_thu_mat -q  (trong nhan-vat-3d)."""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import do_mau_nam as DM

GOC = ('truoc', 'goc34', 'nghieng')
TEN_MOC = {'mat_R', 'mui', 'mieng', 'cam', 'not_ruoi'}


def test_moc_day_du():
    assert set(DM.MOC_MAU) == set(GOC)
    for g in GOC:
        assert TEN_MOC <= set(DM.MOC_MAU[g]), (g, set(DM.MOC_MAU[g]))
    for g in ('truoc', 'goc34'): assert 'mat_L' in DM.MOC_MAU[g]


def test_not_ruoi_ben_trai_anh():
    """Mẫu: nốt ruồi ở bên TRÁI ảnh mặt trước, tức bên phải nhân vật (−X trong cage), và nằm cao hơn mắt."""
    nr, mat = DM.MOC_MAU['truoc']['not_ruoi'], DM.MOC_MAU['truoc']['mat_R']
    assert nr[0] < (mat[0] + mat[2]) / 2 and nr[1] < mat[1]


def test_nguong_co_mat():
    assert set(DM.NGUONG) == set(GOC) and DM.NGUONG['truoc'] == 3.0 and DM.NGUONG['goc34'] == 4.0


def test_chieu_goc_nhin():
    """θ=0: nhìn thẳng (X sang phải ảnh); θ=90: camera ở −X, mặt quay sang phải ảnh (−Y sang phải ảnh)."""
    u, v = DM.chieu((0.1, 0.0, 0.0), 0.0); assert abs(u - 0.1) < 1e-9 and abs(v) < 1e-9
    u, v = DM.chieu((0.0, -0.1, 0.0), 90.0); assert abs(u - 0.1) < 1e-9
    u, v = DM.chieu((0.0, 0.0, 0.1), 40.0); assert abs(v + 0.1) < 1e-9      # lên = v giảm (ảnh)


def test_khop_phuc_hoi_va_do_lech():
    """Điểm 3D giả → chiếu → biến đổi tương đồng bất kỳ → khớp phải ra sai lệch 0; xê dịch một mốc 10% HF thì mốc đó lệch ≈ 10%."""
    pts = {'a': (0.03, -0.1, 1.2), 'b': (-0.04, -0.12, 1.15), 'c': (0.0, -0.2, 1.1), 'd': (0.05, -0.15, 1.0), 'e': (-0.02, -0.05, 1.25)}
    s, tx, ty = 2500.0, 700.0, 300.0
    dst = {k: (s * DM.chieu(p, 40.0)[0] + tx, s * DM.chieu(p, 40.0)[1] + ty) for k, p in pts.items()}
    err = DM.sai_lech_diem(pts, dst, 40.0, hf_px=236.0)
    assert max(err.values()) < 1e-6
    dst['c'] = (dst['c'][0] + 0.10 * 236.0, dst['c'][1])
    err = DM.sai_lech_diem(pts, dst, 40.0, hf_px=236.0)
    assert 7.0 < err['c'] < 11.0, err
