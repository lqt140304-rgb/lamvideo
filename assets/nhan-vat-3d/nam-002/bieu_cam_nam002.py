"""BIỂU CẢM mày + miệng cho NAM-002 (shape key + driver), gọi từ rig_nam002.py sau gan_mat().

Thuộc tính trên xương Head (0–1, kéo bằng tay hoặc keyframe):
  Lông mày (cả hai bên): may_nhuong (nhướn), may_ha (hạ), may_cau (cau: đầu trong hạ, đuôi nhướn nhẹ), may_buon (buồn: đầu trong nhướn, đuôi hạ)
                         may_trai_nhuong, may_phai_nhuong (nhướn riêng một bên)
  Miệng (hình chữ O vẽ dính lưới da nên biến dạng theo lưới): mieng_ha (há dọc), mieng_hep (chúm), mieng_rong (rộng ngang),
                         cuoi (khóe lên), meu (khóe xuống)
Shape key: LongMay.L/R (mày), Nam_Body (miệng: vùng bán kính 4,5 cm quanh tâm miệng, tắt dần ra ngoài).
Hàm dung_bieu_cam(arm, ten) đặt nhanh một biểu cảm có tên (xem BIEU_CAM).
"""
import math
import bpy
import numpy as np

MIENG_X, MIENG_Z = 0.0, 1.4295       # tâm miệng chữ O (thế giới, m)
MIENG_R = 0.050                      # bán kính vùng kéo
MAY_BIEN = 0.009                     # biên độ dịch mày (m)

BIEU_CAM = {
    'mac_dinh': {},
    'ngac_nhien': {'may_nhuong': 1.0, 'mieng_ha': 0.8},
    'tuc_gian': {'may_cau': 1.0, 'mieng_hep': 0.5},
    'buon': {'may_buon': 1.0, 'meu': 0.8},
    'vui': {'may_nhuong': 0.3, 'cuoi': 1.0, 'mieng_rong': 0.6},
    'nghi_ngo': {'may_trai_nhuong': 1.0, 'may_cau': 0.3, 'meu': 0.3},
    'so_hai': {'may_buon': 1.0, 'mieng_ha': 1.0, 'mieng_rong': 0.5},
    'mo_mang': {'may_ha': 0.5, 'meu': 0.2},
}
PROPS_MAY = ('may_nhuong', 'may_ha', 'may_cau', 'may_buon', 'may_trai_nhuong', 'may_phai_nhuong')
PROPS_MIENG = ('mieng_ha', 'mieng_hep', 'mieng_rong', 'cuoi', 'meu', 'mieng_khep')

# KHẨU HÌNH (viseme) cho lip-sync tiếng Việt: nguyên âm + nhóm phụ âm; đặt bằng dung_viseme(arm, 'a')
VISEME = {
    'nghi': {},
    'a': {'mieng_ha': 1.0, 'mieng_rong': 0.3},            # a, ă, â
    'e': {'mieng_ha': 0.45, 'mieng_rong': 0.7},           # e, ê
    'i': {'mieng_ha': 0.12, 'mieng_rong': 0.9},           # i, y
    'o': {'mieng_ha': 0.55, 'mieng_hep': 0.55},           # o, ô, ơ
    'u': {'mieng_ha': 0.1, 'mieng_hep': 0.9},             # u, ư
    'mbp': {'mieng_khep': 1.0, 'mieng_rong': 0.2},        # m, b, p: môi khép
    'khac': {'mieng_ha': 0.25, 'mieng_rong': 0.35},       # phụ âm còn lại: hé nhẹ
}


def _sm(e0, e1, t):
    u = np.clip((t - e0) / (e1 - e0), 0, 1); return u * u * (3 - 2 * u)


def _driver(key, arm, expr_vars, expr):
    d = key.driver_add('value').driver; d.type = 'SCRIPTED'
    for vn, pr in expr_vars:
        v = d.variables.new(); v.name = vn; v.type = 'SINGLE_PROP'; v.targets[0].id = arm; v.targets[0].data_path = f'pose.bones["Head"]["{pr}"]'
    d.expression = expr


def _props(arm):
    h = arm.pose.bones['Head']
    for pr in PROPS_MAY + PROPS_MIENG:
        h[pr] = 0.0; h.id_properties_ui(pr).update(min=0.0, max=1.0, description='Biểu cảm 0–1')


def _may(arm, ob, side):
    """Shape key cho một tấm lông mày; x trong của mày ≈ gần mặt phẳng giữa (|x| nhỏ)."""
    me = ob.data; co = np.array([v.co[:] for v in me.vertices]); ax = np.abs(co[:, 0])
    t = (ax - ax.min()) / max(ax.max() - ax.min(), 1e-6)          # 0 = đầu trong, 1 = đuôi
    if not me.shape_keys: ob.shape_key_add(name='Basis')
    kinds = {'nhuong': np.full(len(co), 1.0), 'ha': np.full(len(co), -0.6), 'cau': -1.0 + 1.6 * t, 'buon': 1.0 - 1.5 * t}
    for nm, dz in kinds.items():
        kb = ob.shape_key_add(name=f'may_{nm}', from_mix=False)
        for i, p in enumerate(co): kb.data[i].co = (p[0], p[1], p[2] + MAY_BIEN * dz[i])
        pr = f'may_{nm}'
        if nm == 'nhuong':
            own = 'may_trai_nhuong' if side == 'L' else 'may_phai_nhuong'
            _driver(kb, arm, [('a', pr), ('b', own)], 'min(1.0, a + b)')
        else:
            _driver(kb, arm, [('a', pr)], 'a')


def _mieng(arm, body):
    me = body.data; n = len(me.vertices); co = np.zeros(n * 3); me.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
    x, y, z = co[:, 0] - MIENG_X, co[:, 1], co[:, 2] - MIENG_Z
    r = np.hypot(x, z); w = (1 - _sm(0.018, MIENG_R, r)) * (y < -0.02)
    if not me.shape_keys: body.shape_key_add(name='Basis')
    ax = np.abs(x); side = np.sign(x)
    out = {
        'mieng_ha': (0.0 * x, np.where(z < 0, -0.0075, 0.0015) * w + z * 0.35 * w),                 # môi dưới xuống, hình O cao ra
        'mieng_hep': (-x * 0.38 * w, 0.0 * z),                                                         # chúm: thu ngang
        'mieng_rong': (x * 0.55 * w, 0.0 * z),
        'cuoi': (x * 0.18 * w, 0.011 * _sm(0.004, 0.024, ax) * w),                                   # khóe kéo lên và ra
        'meu': (-x * 0.08 * w, -0.010 * _sm(0.004, 0.024, ax) * w),
        'mieng_khep': (x * 0.22 * w, -z * 0.82 * w),                                                 # ép hình O thành đường mảnh (âm môi m, b, p)
    }
    for nm, (dx, dz) in out.items():
        kb = body.shape_key_add(name=nm, from_mix=False)
        newp = co.copy(); newp[:, 0] += dx; newp[:, 2] += dz
        kb.data.foreach_set('co', newp.ravel())
        _driver(kb, arm, [('a', nm)], 'a')
    print(f'  miệng: {int((w > 0).sum())} đỉnh chịu kéo, 6 shape key')


def tao_bieu_cam(arm, body, may):
    _props(arm)
    for side, ob in may.items(): _may(arm, ob, side)
    _mieng(arm, body)
    print('  biểu cảm: 4 shape key mày × 2 bên, 6 shape key miệng')


def dung_bieu_cam(arm, ten):
    h = arm.pose.bones['Head']
    for pr in PROPS_MAY + PROPS_MIENG: h[pr] = 0.0
    for pr, v in BIEU_CAM[ten].items(): h[pr] = v
    bpy.context.view_layer.update()


def dung_viseme(arm, ten):
    """Đặt khẩu hình: ten ∈ VISEME. Chỉ đổi các thuộc tính miệng, giữ nguyên lông mày."""
    h = arm.pose.bones['Head']
    for pr in PROPS_MIENG: h[pr] = 0.0
    for pr, v in VISEME[ten].items(): h[pr] = v
    bpy.context.view_layer.update()
