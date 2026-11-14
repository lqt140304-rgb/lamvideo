"""Kiểm phần thuần Python của do_mau_nam (không cần bpy). Chạy: python -m pytest kiem_thu_mat -q  (trong nhan-vat-3d)."""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import do_mau_nam as DM

GOC = ('truoc', 'goc34', 'nghieng')
TEN_MOC = {'mat_R', 'khe_R', 'mui', 'mieng', 'not_ruoi'}


def test_moc_day_du():
    assert set(DM.MOC_MAU) == set(GOC)
    for g in GOC:
        assert TEN_MOC <= set(DM.MOC_MAU[g]), (g, set(DM.MOC_MAU[g]))
    for g in ('truoc', 'goc34'): assert 'mat_L' in DM.MOC_MAU[g] and 'khe_L' in DM.MOC_MAU[g]


def test_cam_chi_o_mat_truoc_va_nghieng():
    """Ở 3/4 cằm là điểm thấp nhất của ĐƯỜNG VIỀN (đổi vị trí trên mặt theo góc nhìn), không so được giữa cage và ảnh: chỉ đo ở mặt trước và nghiêng."""
    assert 'cam' in DM.MOC_MAU['truoc'] and 'cam' in DM.MOC_MAU['nghieng'] and 'cam' not in DM.MOC_MAU['goc34']


def test_khe_nam_trong_vong_mat():
    """Khe mắt hở (đường mí → viền dưới) nằm trong vòng mắt đầy đủ và dưới đường mí: cùng cạnh dưới, cạnh trên thấp hơn."""
    for g, tab in DM.MOC_MAU.items():
        for s in 'RL':
            if f'mat_{s}' not in tab: continue
            m, k = tab[f'mat_{s}'], tab[f'khe_{s}']
            assert m[0] <= k[0] + 1 and k[2] <= m[2] + 1 and m[1] < k[1] and abs(m[3] - k[3]) <= 3, (g, s, m, k)


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


def test_goi_y_dich_phuc_hoi():
    """Điểm 3D giả đặt lệch 6 mm về +X và 4 mm xuống (−Z) so với nơi mẫu cần: gợi ý phải bảo dịch ngược lại. Phép khớp tịnh tiến hấp thụ 1/N độ lệch của điểm ngoại lai (N = 6) nên giá trị là (−6, +4) mm × 5/6 = (−5,0; +3,33)."""
    pts = {'a': (0.03, -0.1, 1.2), 'b': (-0.04, -0.12, 1.15), 'c': (0.0, -0.2, 1.1), 'd': (0.05, -0.15, 1.0), 'e': (-0.02, -0.05, 1.25), 'f': (0.01, -0.18, 1.12)}
    s, tx, ty = 2500.0, 700.0, 300.0
    dst = {k: (s * DM.chieu(p, 0.0)[0] + tx, s * DM.chieu(p, 0.0)[1] + ty) for k, p in pts.items()}
    lech = dict(pts); lech['f'] = (0.01 + 0.006, -0.18, 1.12 - 0.004)
    gy = DM.goi_y_dich({'f': lech['f'], **{k: pts[k] for k in pts if k != 'f'}}, dst, 0.0)
    dx, dz = gy['f']; assert abs(dx + 5.0) < 0.15 and abs(dz - 4.0 * 5 / 6) < 0.15, gy['f']      # dung sai: tỉ lệ cũng được khớp lại


def test_be_rong_theo_do_cao():
    """Bề ngang chiếu của các đỉnh trong lớp z ± dz: hai điểm x = ±0,1 ở z = 1,0 và một điểm lạc ở z = 1,2 → rộng 0,2."""
    vs = [(0.1, -0.1, 1.0), (-0.1, -0.1, 1.0), (0.0, -0.1, 1.2)]
    assert abs(DM.be_rong(vs, 1.0, 0.0) - 0.2) < 1e-9
    assert DM.be_rong(vs, 0.5, 0.0) is None


def test_ham_mau_giam_dan_xuong_cam():
    w = [DM.HAM_MAU[r] for r in sorted(DM.HAM_MAU)]
    assert all(a > b for a, b in zip(w, w[1:]))       # hàm thon dần xuống cằm
