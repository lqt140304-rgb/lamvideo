"""Làm thon đầu gối nam-003 (áp lúc dựng, trước bind; nguồn GLB giữ nguyên). Chủ repo 16/11: "đầu gối dày".
Đo: bề ngang chân (m) cẳng chân z0,30 = 0,087; gối z0,44–0,46 = 0,133 (phình); đùi z0,58 = 0,112.
Co ngang quanh tâm chân (x_c, y_c) với hệ số 1−K·bump(z): bump 0 ở z≤0,33 và ≥0,60, đỉnh 0,43–0,50.
"""
import os, math

GOI_K = float(os.environ.get('NAM003_GOI_K', '0.15'))      # co ngang tối đa (tỉ lệ); 0 = tắt
GOI_KY = float(os.environ.get('NAM003_GOI_KY', '0.07'))    # co trước–sau tối đa
XC, YC = 0.134, 0.064                                      # tâm mặt cắt gối (đo trên lưới)


def _sm(t):
    t = min(1.0, max(0.0, t)); return t * t * (3 - 2 * t)


def bump(z): return _sm((z - 0.33) / 0.10) * (1 - _sm((z - 0.50) / 0.10))


def thu_goi(x, y, z):
    b = bump(z)
    if b <= 0 or abs(x) < 0.03 or abs(x) > 0.24: return x, y, z
    sx = math.copysign(1.0, x); u = abs(x)
    w = _sm((u - 0.03) / 0.05) * (1 - _sm((u - 0.20) / 0.04))     # chỉ chân (loại thân/chân bên kia)
    k = GOI_K * b * w; ky = GOI_KY * b * w
    return sx * (XC + (u - XC) * (1 - k)), YC + (y - YC) * (1 - ky), z
