"""Tạo shape key biểu cảm từ định nghĩa JSON theo điểm neo mặt. Định nghĩa không dính lưới Nam: độ dời tính theo ty_le_mat."""
import os, json
import numpy as np
from . import chung

MAC_DINH = os.path.join(os.path.dirname(__file__), 'dinh_nghia.json')


def nap_dinh_nghia(duong_dan=None):
    with open(duong_dan or MAC_DINH, encoding='utf-8') as f: return json.load(f)


def _mo_rong(dich):
    """'ten.*' → hai neo .L/.R; bên .R lật dấu x."""
    out = {}
    for ten, v in dich.items():
        v, r = (v['d'], v.get('r')) if isinstance(v, dict) else (v, None)      # v = [dx,dy,dz] hoặc {"d": [...], "r": hệ số bán kính riêng}
        dx, dy, dz = v
        if ten.endswith('.*'):
            b = ten[:-2]; out[b + '.L'] = ((dx, dy, dz), r); out[b + '.R'] = ((-dx, dy, dz), r)
        else: out[ten] = ((dx, dy, dz), r)
    return out


def _w(t): return np.where(t < 1.0, (1.0 - t * t) ** 2, 0.0)   # nhân nền mượt, tắt hẳn ở bán kính


def _disp(d, co, neo, ty, tra, truoc=()):
    """Độ dời đỉnh của một định nghĩa: tổng nhân nền theo điểm neo, cộng thêm các key trong "gom" (cộng tĩnh lúc tạo, không driver)."""
    disp = np.zeros_like(co); R = d['ban_kinh'] * ty
    for n, (v, r) in _mo_rong(d['dich']).items():
        rad = np.full(3, R) if r is None else np.array(r if isinstance(r, list) else [r] * 3, dtype=float) * ty   # bán kính: số hoặc [rx, ry, rz] (nhân elip)
        p = np.array(neo[n]); w = _w(np.linalg.norm((co - p) / rad, axis=1))
        disp += w[:, None] * (np.array(v) * ty)
    for ten, he_so in d.get('gom', {}).items():
        if ten in truoc: raise ValueError(f'gom vòng quanh: {ten}')
        disp += he_so * _disp(tra[ten], co, neo, ty, tra, truoc + (d['ten'],))
    return disp


def ap_dung(dau, dinh_nghia=None):
    """Tạo (hoặc ghi đè) shape key cho mỗi định nghĩa. Gọi lại không nhân đôi. Trả danh sách tên.
    Định nghĩa có thể có "gom": {key_khác: hệ_số} (tìm trong dinh_nghia.json và danh sách truyền vào) và "hieu_ung" (cho kenh.py)."""
    dn = dinh_nghia if dinh_nghia is not None else nap_dinh_nghia()
    tra = {x['ten']: x for x in nap_dinh_nghia()}; tra.update({x['ten']: x for x in dn})
    head = dau.head
    if head.data.shape_keys is None: head.shape_key_add(name='Basis', from_mix=False)
    co = np.empty(len(head.data.vertices) * 3); head.data.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
    ty = chung.ty_le_mat(dau.neo); ten = []
    for d in dn:
        disp = _disp(d, co, dau.neo, ty, tra)
        kb = head.data.shape_keys.key_blocks.get(d['ten']) or head.shape_key_add(name=d['ten'], from_mix=False)
        kb.data.foreach_set('co', (co + disp).ravel()); kb.value = 0.0; ten.append(d['ten'])
    return ten
