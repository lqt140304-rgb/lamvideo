from bieu_cam import chung

TEN_NEO = ['eye_c.L', 'eye_c.R', 'lid_up.L', 'lid_up.R', 'lid_low.L', 'lid_low.R', 'brow_in.L', 'brow_in.R',
           'brow_mid.L', 'brow_mid.R', 'brow_out.L', 'brow_out.R', 'mouth_c', 'mouth_corner.L', 'mouth_corner.R', 'chin']

def test_neo_du_va_doi_xung():
    d = chung.dung_nam(); n = d.neo
    assert set(TEN_NEO) <= set(n), set(TEN_NEO) - set(n)
    assert abs(n['eye_c.L'].x + n['eye_c.R'].x) < 1e-3, (n['eye_c.L'], n['eye_c.R'])
    assert n['brow_mid.L'].z > n['lid_up.L'].z > n['eye_c.L'].z > n['lid_low.L'].z > n['mouth_c'].z > n['chin'].z
    assert chung.ty_le_mat(n) > 0.05
