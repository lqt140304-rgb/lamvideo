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
    for ten, (dx, dy, dz) in dich.items():
        if ten.endswith('.*'):
            b = ten[:-2]; out[b + '.L'] = (dx, dy, dz); out[b + '.R'] = (-dx, dy, dz)
        else: out[ten] = (dx, dy, dz)
    return out


def _w(t): return np.where(t < 1.0, (1.0 - t * t) ** 2, 0.0)   # nhân nền mượt, tắt hẳn ở bán kính


def ap_dung(dau, dinh_nghia=None):
    """Tạo (hoặc ghi đè) shape key cho mỗi định nghĩa. Gọi lại không nhân đôi. Trả danh sách tên."""
    dn = dinh_nghia if dinh_nghia is not None else nap_dinh_nghia()
    head = dau.head
    if head.data.shape_keys is None: head.shape_key_add(name='Basis', from_mix=False)
    co = np.empty(len(head.data.vertices) * 3); head.data.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
    ty = chung.ty_le_mat(dau.neo); ten = []
    for d in dn:
        disp = np.zeros_like(co); R = d['ban_kinh'] * ty
        for neo, v in _mo_rong(d['dich']).items():
            p = np.array(dau.neo[neo]); w = _w(np.linalg.norm(co - p, axis=1) / R)
            disp += w[:, None] * (np.array(v) * ty)
        kb = head.data.shape_keys.key_blocks.get(d['ten']) or head.shape_key_add(name=d['ten'], from_mix=False)
        kb.data.foreach_set('co', (co + disp).ravel()); kb.value = 0.0; ten.append(d['ten'])
    return ten
