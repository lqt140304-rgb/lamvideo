"""Lớp preset 3D hai mức (nhe/ro) cho 24 nhóm cảm xúc của repo, phối từ điều khiển cơ bản. Đọc preset.json.
  dat(r, 'vui', 'ro')            # đặt preset (các điều khiển khác về 0)
  tron(r, ('vui','nhe'), ('vui','ro'), 0.5)   # chuyển tiếp tuyến tính giữa hai preset"""
import json, os
from . import kiem

DUONG = os.path.join(os.path.dirname(__file__), 'preset.json')


def nap(duong=DUONG):
    with open(duong, encoding='utf-8') as f: return json.load(f)['nhom']


def gia_tri(nhom, muc, du_lieu=None):
    return dict((du_lieu or nap())[nhom][muc])


def tron_gia_tri(a, b, t):
    keys = set(a) | set(b); return {k: (1 - t) * a.get(k, 0.0) + t * b.get(k, 0.0) for k in keys}


def dat(r, nhom, muc, du_lieu=None):
    kiem.dat_lai(r); kiem.dat(r, **gia_tri(nhom, muc, du_lieu))


def tron(r, a, b, t, du_lieu=None):
    kiem.dat_lai(r); kiem.dat(r, **tron_gia_tri(gia_tri(*a, du_lieu), gia_tri(*b, du_lieu), t))
