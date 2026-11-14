"""Kiểm thử toán học thuần Python (không cần Blender GUI) cho Quần Áo 3D Dáng Rộng.
Xác minh:
  1. Đủ 5 bộ trang phục chuẩn ('xanh', 'ngu', 'xam-tui', 'dong-phuc', 'the-thao') và mã màu hợp lệ.
  2. Mọi mức lát cắt Áo & Quần đều bọc ngoài Thân Cage (khoảng hở dương >= 10 mm).
  3. Áo dáng rộng (boxy / drop-shoulder) rộng hơn cạp quần tại cùng cao độ để gấu áo luôn trùm ngoài cạp quần.
  4. Ống tay áo & ống quần rộng hơn bắp tay & chân thật >= 20 mm (chuẩn oversized).
"""
import math
import re

# Thông số thân cage gốc từ dung_than_cage_nam.py
BODY_LEVELS = {
    'chan_co':   dict(z=0.880, w=0.174, f=0.095, b=0.100),
    'vai':       dict(z=0.835, w=0.201, f=0.123, b=0.100),
    'nguc':      dict(z=0.775, w=0.160, f=0.140, b=0.098),
    'duoi_nguc': dict(z=0.690, w=0.146, f=0.163, b=0.092),
    'bung':      dict(z=0.630, w=0.155, f=0.176, b=0.104),
    'eo':        dict(z=0.580, w=0.163, f=0.170, b=0.128),
    'chau':      dict(z=0.525, w=0.170, f=0.153, b=0.133),
    'day_chau':  dict(z=0.475, w=0.172, f=0.121, b=0.117),
}

BODY_ARM = [
    dict(ten='dau_bap_tay',  rx=0.056, ry=0.056),
    dict(ten='giua_bap_tay', rx=0.056, ry=0.054),
    dict(ten='khuyu',        rx=0.053, ry=0.051),
]

BODY_LEG = [
    dict(ten='dau_dui',  rx=0.072, ry=0.076),
    dict(ten='giua_dui', rx=0.070, ry=0.072),
    dict(ten='goi',      rx=0.066, ry=0.066),
    dict(ten='bap_chan', rx=0.065, ry=0.066),
]

# Thông số quần áo dáng rộng từ dung_quan_ao_nam.py
SHIRT_LEVELS = {
    'vai_ao':    dict(z=0.842, w=0.224, f=0.142, b=0.120),
    'nguc_ao':   dict(z=0.775, w=0.190, f=0.160, b=0.120),
    'duoi_nguc': dict(z=0.690, w=0.184, f=0.188, b=0.126),
    'bung_ao':   dict(z=0.630, w=0.192, f=0.204, b=0.136),
    'eo_ao':     dict(z=0.560, w=0.198, f=0.204, b=0.156),
    'gau_ao':    dict(z=0.485, w=0.204, f=0.196, b=0.162),
}

SLEEVE_RINGS = [
    dict(ten='tay_vai',  rx=0.080, ry=0.082),
    dict(ten='tay_giua', rx=0.082, ry=0.082),
    dict(ten='tay_gau',  rx=0.084, ry=0.084),
]

PANTS_LEVELS = {
    'cap_quan':  dict(z=0.565, w=0.184, f=0.184, b=0.144),
    'chau_quan': dict(z=0.520, w=0.194, f=0.178, b=0.154),
    'day_quan':  dict(z=0.460, w=0.196, f=0.152, b=0.146),
}

PANTS_LEG_LONG = [
    dict(ten='dui_tren', rx=0.105, ry=0.108),
    dict(ten='dui_giua', rx=0.102, ry=0.104),
    dict(ten='goi_quan', rx=0.098, ry=0.100),
    dict(ten='ong_duoi', rx=0.095, ry=0.098),
]


def test_shirt_clearance():
    pairs = [
        ('vai_ao', 'vai'),
        ('nguc_ao', 'nguc'),
        ('duoi_nguc', 'duoi_nguc'),
        ('bung_ao', 'bung'),
        ('eo_ao', 'eo'),
        ('gau_ao', 'day_chau'),
    ]
    for s_key, b_key in pairs:
        s, b = SHIRT_LEVELS[s_key], BODY_LEVELS[b_key]
        dw = (s['w'] - b['w']) * 1000
        df = (s['f'] - b['f']) * 1000
        db = (s['b'] - b['b']) * 1000
        assert dw >= 18.0, f'{s_key} dw={dw:.1f}mm < 18mm'
        assert df >= 18.0, f'{s_key} df={df:.1f}mm < 18mm'
        assert db >= 18.0, f'{s_key} db={db:.1f}mm < 18mm'
    print('[PASS] Shirt torso clearance >= 18 mm at all levels (oversized fit verified)')


def test_sleeve_and_leg_clearance():
    for sr, br in zip(SLEEVE_RINGS, BODY_ARM):
        drx = (sr['rx'] - br['rx']) * 1000
        dry = (sr['ry'] - br['ry']) * 1000
        assert drx >= 20.0 and dry >= 20.0, f'Sleeve {sr["ten"]} too tight: {drx:.1f}x{dry:.1f}mm'
    for pr, br in zip(PANTS_LEG_LONG, BODY_LEG):
        drx = (pr['rx'] - br['rx']) * 1000
        dry = (pr['ry'] - br['ry']) * 1000
        assert drx >= 25.0 and dry >= 25.0, f'Pants leg {pr["ten"]} too tight: {drx:.1f}x{dry:.1f}mm'
    print('[PASS] Sleeve clearance >= 20 mm and Wide-leg pants clearance >= 25 mm')


def test_shirt_over_pants_hem():
    s_eo, p_cap = SHIRT_LEVELS['eo_ao'], PANTS_LEVELS['cap_quan']
    assert SHIRT_LEVELS['gau_ao']['z'] < p_cap['z'], 'Shirt hem must drape below pants waistband'
    assert s_eo['w'] - p_cap['w'] >= 0.012, 'Shirt must be wider than pants waistband'
    assert s_eo['f'] - p_cap['f'] >= 0.012, 'Shirt front must clear pants waistband'
    assert s_eo['b'] - p_cap['b'] >= 0.012, 'Shirt back must clear pants waistband'
    print('[PASS] Shirt hem drapes cleanly outside pants waistband (+14 mm clearance, 80 mm overlap)')


def test_outfits_hex():
    with open('dung_quan_ao_nam.py', 'r', encoding='utf-8') as f:
        src = f.read()
    for name in ('xanh', 'ngu', 'xam-tui', 'dong-phuc', 'the-thao'):
        assert f"'{name}': dict(" in src, f'Missing outfit {name}'
    hexes = re.findall(r'#[0-9a-fA-F]{6}', src)
    assert len(hexes) >= 20, 'Expected full hex palette for 5 outfits'
    print(f'[PASS] All 5 outfits defined with {len(hexes)} valid hex colors')


if __name__ == '__main__':
    test_shirt_clearance()
    test_sleeve_and_leg_clearance()
    test_shirt_over_pants_hem()
    test_outfits_hex()
    print('\nALL MATH & OUTFIT CHECKS PASSED!')
