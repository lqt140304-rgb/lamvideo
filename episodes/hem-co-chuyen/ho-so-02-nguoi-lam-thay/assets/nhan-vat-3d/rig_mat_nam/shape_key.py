"""Shape key điều khiển cơ bản trên Head_Rig (mở hàm KHÔNG ở đây: bone `jaw` trong dieu_khien.py).

Quy ước bên: hậu tố _L = bên TRÁI nhân vật = +X (bên phải ảnh nhìn chính diện); _R = −X.
Mí (blink, eye_wide, squint): XOAY các đỉnh mảng mí quanh trục ngang (trục X của khung mắt) đi qua TÂM NHÃN CẦU, nên đỉnh
giữ khoảng cách tới tâm (mép mí và tay áo trượt trên mặt cầu, không cắt vào nhãn cầu). Khi nhắm, mép trên và mép dưới cùng tới
một đường nhắm cong theo mắt (30 % chiều cao tính từ mép dưới), mỗi bên vượt 0,6° để hai mí chồng lên nhau (không khe sáng).
Góc xoay nhân trọng số theo vòng (vòng 0 và tay áo = 1, vòng ngoài cùng = 0) để da quanh mắt đi theo mềm.
Mày, môi, má: nhân kéo elip quanh điểm neo; nhân mày/má nhân thêm (1 − trọng số mí) để không kéo mép mí.
Mặt trong môi và khoang miệng đi theo đỉnh mép miệng cùng nguồn (độ sâu càng vào trong càng ít)."""
import math
import numpy as np
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree
import dung_dau_nam as D
from . import luoi

DONG = 0.30                 # đường nhắm: tỉ lệ chiều cao tính từ mép dưới
VUOT = math.radians(0.6)    # mỗi mí vượt đường nhắm để hai mí chồng nhau
WIDE_TREN, WIDE_DUOI = math.radians(10.0), math.radians(3.5)
SQ_TREN, SQ_DUOI = math.radians(3.5), math.radians(13.0)

KEYS = ['blink_L', 'blink_R', 'eye_wide_L', 'eye_wide_R', 'squint_L', 'squint_R',
        'brow_inner_up_L', 'brow_inner_up_R', 'brow_outer_up_L', 'brow_outer_up_R', 'brow_down_L', 'brow_down_R', 'brow_knit',
        'smile_L', 'smile_R', 'frown_L', 'frown_R', 'lip_press', 'mouth_pucker', 'mouth_wide',
        'upper_lip_raise_L', 'upper_lip_raise_R', 'cheek_raise_L', 'cheek_raise_R']


def _np(me, ten, kieu=float):
    a = np.empty(len(me.vertices), dtype=kieu); me.attributes[ten].data.foreach_get('value', a); return a


def _v(x): return np.array(tuple(x), dtype=float)


class _Mat:
    """Hình học mí một bên: góc mép trên/dưới theo u, trọng số đỉnh."""
    def __init__(self, co, A, info, vz_da, vz_ao):
        self.C, self.X, self.f, self.Z = _v(info['C']), _v(info['X']), _v(info['f']), _v(info['Z'])
        self.sel = (A['vung'] == vz_da) | (A['vung'] == vz_ao)
        d = co - self.C; self.x = d @ self.X; a = d @ self.f; b = d @ self.Z; self.r = np.hypot(a, b); self.phi = np.arctan2(b, a)
        k = A['vong']   # vòng 0 (mép) và vòng 1 (mép ngoài dải viền) đi cứng theo mép; giảm dần từ vòng 2 tới vòng cuối
        w = np.where(A['vung'] == vz_ao, 1.0, np.cos(0.5 * math.pi * np.clip(k, 0, luoi.K_MAT) / luoi.K_MAT) ** 2)
        self.w = np.where(self.sel, w, 0.0); self.ng = A['nguon']
        r0 = (A['vung'] == vz_da) & (k == 0); n = info['n']; ph = A['phia']
        self.phia_v = np.where(self.sel, ph, 0)     # phía của từng đỉnh (theo cột mép nó dựng từ)
        self.cung = self.sel.copy()                                             # mọi đỉnh mảng mí xoay theo cột mép của nó
        self.phia0 = np.zeros(n, int); self.u0 = np.zeros(n); self.phi0 = np.zeros(n)
        for i in np.nonzero(r0)[0]:
            j = self.ng[i]; self.phia0[j] = ph[i]; self.u0[j] = self.x[i]; self.phi0[j] = self.phi[i]
        def duong(ph_):
            m = (self.phia0 == ph_) | (self.phia0 == 0); o = np.argsort(self.u0[m]); return self.u0[m][o], self.phi0[m][o]
        self.tren, self.duoi = duong(1), duong(-1)
        self.prof = np.zeros(n)
        for ph_ in (1, -1):
            m = self.phia0 == ph_; u = self.u0[m]; s = (u - u.min()) / (u.max() - u.min() + 1e-12); self.prof[m] = np.sin(math.pi * np.clip(s, 0, 1))
        # vòng da (k ≥ 1) giảm dần về phía khoé (lỗ mắt gần tròn nên sát khoé độ cao lỗ đổi rất dốc giữa các cột liền nhau)
        self.w = np.where(self.sel & (A['vung'] == vz_da) & (k >= 1), self.w * np.clip(self.prof[np.clip(self.ng, 0, n - 1)] / 0.45, 0.0, 1.0), self.w)


    def goc_nham(self):
        pu = np.interp(self.u0, *self.tren); pl = np.interp(self.u0, *self.duoi); c = pl + DONG * (pu - pl)
        vuot = VUOT * np.clip((pu - pl) / math.radians(6.0), 0.0, 1.0)      # vượt tỉ lệ độ cao lỗ: sát khoé (cao ≈ 0) không vượt
        return np.where(self.phia0 == 1, c - self.phi0 - vuot, np.where(self.phia0 == -1, c - self.phi0 + vuot, 0.0))

    def xoay(self, delta):
        """Độ dời khi xoay mảng mí quanh trục X qua C. Mép và tay áo xoay cứng theo cột. Các vòng da: góc lấy theo chính u của đỉnh, nội suy từ góc
        của các đỉnh mép cùng phía (trên/dưới) và bằng 0 ở hai khoé và ngoài khoé — da ngoài khoé đứng yên, không bị kéo gập.
        delta: góc theo chỉ số đỉnh mép (nguon). Nhân thêm trọng số vòng."""
        g = np.zeros(len(self.x))
        for ph_ in (1, -1):
            m = (self.phia0 == ph_) | (self.phia0 == 0); o = np.argsort(self.u0[m]); uu = self.u0[m][o]; dd = np.where(self.phia0[m] == 0, 0.0, delta[m])[o]
            ben = self.sel & (self.phia_v == ph_)
            # làm mượt theo u (Gauss 5 mm) và giảm êm về 0 trong 10 mm cuối trước khoé: tránh các cột liền nhau xoay quá chênh
            a_ = max(abs(uu[0]), abs(uu[-1])); lu = np.arange(-a_ - 0.03, a_ + 0.03, 0.0005); fu = np.interp(lu, uu, dd, left=0.0, right=0.0)
            ker = np.exp(-0.5 * (np.arange(-0.015, 0.0155, 0.0005) / 0.005) ** 2); fu = np.convolve(fu, ker / ker.sum(), mode='same')
            x_ = np.clip((a_ - np.abs(lu)) / 0.010, 0, 1); fu = fu * x_ * x_ * (3 - 2 * x_)
            g = np.where(ben, np.interp(self.x, lu, fu), g)
        cot = delta[np.clip(self.ng, 0, len(delta) - 1)]                # mép (vòng 0) và tay áo: xoay cứng theo cột (giữ độ dày mí ôm cầu)
        g = np.where(self.cung, cot, g) * self.w; p2 = self.phi + g
        moi = self.C + np.outer(self.x, self.X) + np.outer(self.r * np.cos(p2), self.f) + np.outer(self.r * np.sin(p2), self.Z)
        co = self.C + np.outer(self.x, self.X) + np.outer(self.r * np.cos(self.phi), self.f) + np.outer(self.r * np.sin(self.phi), self.Z)
        return np.where(self.sel[:, None], moi - co, 0.0)


def _nhan(co, a, rad, vec):
    d = (co - a) / np.array(rad); t2 = (d * d).sum(1); w = np.where(t2 < 1.0, (1.0 - t2) ** 2, 0.0); return w[:, None] * np.array(vec)


def _dai_may(co, s, kieu, cao):
    """Trọng số dọc lông mày bên s (+1 = L): 'trong' = 1 ở đầu mày trong giảm tuyến tính về 0 ở đuôi, 'ngoai' ngược lại, 'deu' = 1.
    Tắt dần theo chiều dọc quanh đường mày (bán kính 22 mm), ra hai đầu mày và về phía sau đầu."""
    x0, x1 = D.FACE['brow_x'][0], D.FACE['brow_x'][2]; sx = s * co[:, 0]
    t = np.clip((sx - x0) / (x1 - x0), 0, 1)
    doc = np.clip(1 - ((co[:, 2] - (D.FACE['brow_z'] - 0.002)) / 0.022) ** 2, 0, 1) ** 2
    dau = np.clip(1 - np.maximum(x0 - 0.012 - sx, sx - x1 - 0.020).clip(0) / 0.020, 0, 1)
    truoc = np.clip((-co[:, 1] - 0.08) / 0.05, 0, 1)
    w = {'trong': (1 - t) ** 1.6, 'ngoai': t ** 1.3, 'deu': np.ones_like(t)}[kieu] * doc * dau * truoc * (sx > 0)   # đầu mày trong nâng dốc (mày buồn xếch)
    return w[:, None] * np.array(cao)


def _neo(bvh, x, z):
    h = bvh.ray_cast(Vector((x, -1.5, z)), Vector((0, 1, 0))); return _v(h[0])


def tao_key(r):
    """Tạo/ghi đè mọi shape key điều khiển cơ bản. Trả danh sách tên."""
    head = r.head; me = head.data
    if me.shape_keys is None: head.shape_key_add(name='Basis', from_mix=False)
    co = np.empty(len(me.vertices) * 3); me.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
    A = {n: _np(me, n, int) for n in ('vung', 'vong', 'nguon', 'phia')}; A['t'] = _np(me, 't')
    mat = {'L': _Mat(co, A, r.info['L'], 11, 12), 'R': _Mat(co, A, r.info['R'], 21, 22)}
    w_mi = mat['L'].w + mat['R'].w; ngoai_mi = (1.0 - np.clip(w_mi, 0, 1))[:, None]
    bvh = BVHTree.FromObject(bpy.data.objects['Head_Base'], bpy.context.evaluated_depsgraph_get())
    neo = {}
    for s, k in ((1, 'L'), (-1, 'R')):
        for nm, x, dz in zip(('in', 'mid', 'out'), D.FACE['brow_x'], (-0.004, 0.005, -0.006)): neo[f'brow_{nm}.{k}'] = _neo(bvh, s * x, D.FACE['brow_z'] + dz)
        neo[f'cheek.{k}'] = _neo(bvh, s * 0.085, 1.150)
    # miệng: khoé, môi trên, tâm
    mi = (A['vung'] == 31) & (A['vong'] == 0)
    khoe = [i for i in np.nonzero(mi & (A['phia'] == 0))[0]]
    neo['khoe.L'] = co[max(khoe, key=lambda i: co[i, 0])]; neo['khoe.R'] = co[min(khoe, key=lambda i: co[i, 0])]
    tren0 = np.nonzero(mi & (A['phia'] == 1))[0]
    for s, k in ((1, 'L'), (-1, 'R')): neo[f'moi_tren.{k}'] = co[min(tren0, key=lambda i: abs(co[i, 0] - s * 0.012))]
    neo['mieng'] = _v(r.info['mieng']['p'])
    # phía (trên +1 / dưới −1) cho mọi đỉnh quanh miệng
    zr = co[:, 2] - (D.FACE['mouth_z'] - 0.003 * (np.minimum(np.abs(co[:, 0]), 0.03) / 0.030) ** 2)
    phia = np.where(np.isin(A['vung'], (31, 32, 33)), A['phia'], np.sign(zr))   # trong mảng miệng: phía theo cột (vòng sát khoé nằm gần đường rãnh)
    # đỉnh mép miệng theo (nguồn, phía) để mặt trong môi / khoang đi theo
    nguon_mep = {}
    for i in np.nonzero(mi)[0]: nguon_mep[(A['nguon'][i], A['phia'][i])] = i
    trong = np.nonzero(np.isin(A['vung'], (32, 33)))[0]
    he_trong = {-1: 1.0, -2: 1.0, -3: 0.8, -11: 0.3, -12: 0.15, -13: 0.05, -14: 0.0, -20: 0.0}   # khoang gần như đứng yên (răng trên cố định)

    def theo_mep(disp):
        for i in trong:
            j = nguon_mep.get((A['nguon'][i], A['phia'][i]))
            disp[i] = disp[j] * he_trong.get(A['vong'][i], 0.0) if j is not None else 0.0
        return disp

    dz_mieng_ngoai = np.where(np.isin(A['vung'], (32, 33)), 0.0, 1.0)[:, None]
    D_ = {}
    for s, k in ((1, 'L'), (-1, 'R')):
        M = mat[k]; n = len(M.phia0)
        D_[f'blink_{k}'] = M.xoay(M.goc_nham())
        D_[f'eye_wide_{k}'] = M.xoay(np.where(M.phia0 == 1, WIDE_TREN, -WIDE_DUOI) * M.prof)
        D_[f'squint_{k}'] = M.xoay(np.where(M.phia0 == 1, -SQ_TREN, SQ_DUOI) * M.prof)
        D_[f'brow_inner_up_{k}'] = _dai_may(co, s, 'trong', (0, 0, 0.016)) * ngoai_mi
        D_[f'brow_outer_up_{k}'] = _dai_may(co, s, 'ngoai', (0, 0, 0.012)) * ngoai_mi
        D_[f'brow_down_{k}'] = _dai_may(co, s, 'deu', (0, 0, -0.009)) * ngoai_mi
        D_[f'smile_{k}'] = theo_mep(_nhan(co, neo[f'khoe.{k}'], (0.034, 0.04, 0.030), (s * 0.004, 0.002, 0.010)) * dz_mieng_ngoai)
        D_[f'frown_{k}'] = theo_mep(_nhan(co, neo[f'khoe.{k}'], (0.034, 0.04, 0.030), (s * 0.001, 0.0, -0.009)) * dz_mieng_ngoai)
        ben_tren = np.where(phia > 0, 1.0, np.where(phia == 0, 0.3, 0.0))[:, None]
        D_[f'upper_lip_raise_{k}'] = theo_mep(_nhan(co, neo[f'moi_tren.{k}'], (0.018, 0.04, 0.020), (0, 0, 0.0050)) * ben_tren * dz_mieng_ngoai)
        sq_duoi = M.xoay(np.where(M.phia0 == -1, SQ_DUOI, 0.0) * M.prof)
        D_[f'cheek_raise_{k}'] = _nhan(co, neo[f'cheek.{k}'], (0.032, 0.04, 0.028), (0, -0.003, 0.008)) * ngoai_mi + 0.35 * sq_duoi
    D_['brow_knit'] = (_nhan(co, neo['brow_in.L'], (0.024, 0.04, 0.018), (-0.007, 0, -0.003)) + _nhan(co, neo['brow_in.R'], (0.024, 0.04, 0.018), (0.007, 0, -0.003))) * ngoai_mi
    hai_khoe = lambda vec_fn, rad: sum(_nhan(co, neo[f'khoe.{k}'], rad, vec_fn(s)) for s, k in ((1, 'L'), (-1, 'R')))
    D_['mouth_wide'] = theo_mep(hai_khoe(lambda s: (s * 0.009, 0.001, 0.0), (0.028, 0.04, 0.024)) * dz_mieng_ngoai)
    D_['mouth_pucker'] = theo_mep((hai_khoe(lambda s: (-s * 0.010, -0.002, 0.0), (0.028, 0.04, 0.024)) + _nhan(co, neo['mieng'], (0.030, 0.03, 0.022), (0, -0.005, 0))) * dz_mieng_ngoai)
    vong_mieng = np.where(A['vung'] == 31, A['vong'], np.where(np.isin(A['vung'], (32, 33)), 0, 99))
    nen = np.where((vong_mieng >= 1), 1.0, 0.0)[:, None]                      # mép (vòng 0) và mặt trong không bị ép dọc → khe vẫn khép
    D_['lip_press'] = theo_mep(_nhan(co, neo['mieng'], (0.034, 0.03, 0.014), (0, 0.002, 0)) * dz_mieng_ngoai) + \
        _nhan(co, neo['mieng'], (0.034, 0.03, 0.016), (0, 0, 1.0)) * (-0.0015 * phia * np.clip(np.abs(zr) / 0.006, 0, 1))[:, None] * nen * np.array([0, 0, 1.0])
    ten = []
    for nm in KEYS:
        kb = me.shape_keys.key_blocks.get(nm) or head.shape_key_add(name=nm, from_mix=False)
        kb.data.foreach_set('co', (co + D_[nm]).ravel()); kb.value = 0.0; kb.slider_min = 0.0; kb.slider_max = 1.0; ten.append(nm)
    # KEY HIỆU CHỈNH chớp nửa chừng: shape key nội suy thẳng nên ở blink = 0,5 đỉnh mí đi theo dây cung (lún vào trong, gấp ở khoé).
    # blink_X_sua = (xoay nửa góc) − 0,5 × (xoay đủ góc), driver = 4·b·(1 − b) → đúng cung tròn ở giữa, bằng 0 ở hai đầu.
    sk = me.shape_keys
    for k in 'LR':
        M = mat[k]; sua = M.xoay(M.goc_nham() * 0.5) - 0.5 * D_[f'blink_{k}']; nm = f'blink_{k}_sua'
        kb = sk.key_blocks.get(nm) or head.shape_key_add(name=nm, from_mix=False); kb.data.foreach_set('co', (co + sua).ravel())
        duong = f'key_blocks["{nm}"].value'
        if sk.animation_data:
            for fc in [f for f in sk.animation_data.drivers if f.data_path == duong]: sk.animation_data.drivers.remove(fc)
        drv = sk.driver_add(duong).driver; drv.type = 'SCRIPTED'
        v = drv.variables.new(); v.name = 'b'; v.type = 'SINGLE_PROP'; v.targets[0].id_type = 'KEY'; v.targets[0].id = sk; v.targets[0].data_path = f'key_blocks["blink_{k}"].value'
        drv.expression = '4*b*(1-b)'; ten.append(nm)
    me.update(); return ten
