"""Bộ kiểm tự động cho biểu cảm: chi tiết mặt phải bám mặt, không lòi viền, không đè nhau, nhận diện không đổi.
Mọi kiểm đo SO VỚI TRẠNG THÁI NGHỈ (chup_nghi) vì các vật rời có độ dày (lông mày ~8 mm) nên khoảng cách tuyệt đối tới da không phải 0."""
import hashlib, math
from dataclasses import dataclass
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from mathutils.kdtree import KDTree

NGUONG_BAM = 0.001      # m: độ lệch cho phép so với lúc nghỉ
NGUONG_RUOI = 0.003     # m: nốt ruồi được trôi tối đa
NGUONG_HO = 0.001       # m: khe tối thiểu giữa chân mày và viền mắt
GOCS = {'chinh_dien': 0.0, '3q_trai': 45.0, '3q_phai': -45.0, 'nghieng_trai': 90.0, 'nghieng_phai': -90.0}   # độ phương vị, 0 = nhìn thẳng mặt (−Y), như Surf.at


@dataclass
class Loi:
    kieu: str
    vat: str = ''
    do: float = 0.0
    key: str = ''
    gia_tri: float = 0.0
    goc: str = ''
    chi_tiet: str = ''


def _dg():
    bpy.context.view_layer.update(); return bpy.context.evaluated_depsgraph_get()


def _verts(ob):
    ev = ob.evaluated_get(_dg()); me = ev.to_mesh(); mw = ev.matrix_world.copy()
    vs = [mw @ v.co for v in me.vertices]; ev.to_mesh_clear(); return vs


def _bvh(dau):
    assert dau.head.matrix_world == dau.head.matrix_world.Identity(4), 'Head_Base phải ở gốc, không xoay/scale'
    return BVHTree.FromObject(dau.head, _dg())


def _sd(bvh, p):
    """Khoảng cách có dấu tới da (dương = bên ngoài)."""
    loc, n, _, d = bvh.find_nearest(p)
    return d if (p - loc).dot(n) >= 0 else -d


def _cen(vs): return sum(vs, Vector()) / len(vs)


def _neo_idx(dau):
    if 'neo_idx' not in dau.nghi:
        co = dau.head.data.vertices; kd = KDTree(len(co))
        for i, v in enumerate(co): kd.insert(v.co, i)
        kd.balance(); dau.nghi['neo_idx'] = {k: kd.find(p)[1] for k, p in dau.neo.items()}
    return dau.nghi['neo_idx']


def neo_hien_tai(dau):
    """Điểm neo sau biến dạng: lấy đỉnh gần nhất lúc nghỉ rồi đọc vị trí đã đánh giá của nó."""
    vs = _verts(dau.head); return {k: vs[i] for k, i in _neo_idx(dau).items()}


def _hash(vs): return hashlib.sha1(','.join(f'{round(c, 6)}' for v in vs for c in v).encode()).hexdigest()


def chup_nghi(dau):
    """Chụp trạng thái nghỉ (mọi shape key = 0). Gọi một lần ngay sau khi dựng; lưu vào dau.nghi."""
    sk = dau.head.data.shape_keys
    if sk:
        for kb in sk.key_blocks: kb.value = 0.0
    bvh = _bvh(dau); bam = {}; vs_all = {}
    for ten, ob in dau.parts.items():
        vs = _verts(ob); sd = sorted(_sd(bvh, v) for v in vs); vs_all[ten] = vs
        bam[ten] = (sd[0], sd[len(sd) // 2], sd[-1])
    dau.nghi = {'hash': _hash(_verts(dau.head)), 'mole': _cen(vs_all['Mole']), 'bam': bam}
    n = neo_hien_tai(dau); dau.nghi['pupil_top'] = {}
    for k in 'LR':
        dau.nghi['pupil_top'][k] = max(v.z for v in vs_all[f'Pupil.{k}']) - n[f'lid_up.{k}'].z
    return dau.nghi


def kiem_bam(dau):
    """Mỗi vật rời giữ khoảng cách (nhỏ nhất, giữa, lớn nhất) tới da như lúc nghỉ, sai lệch ≤ NGUONG_BAM."""
    bvh = _bvh(dau); loi = []
    for ten, ob in dau.parts.items():
        sd = sorted(_sd(bvh, v) for v in _verts(ob)); now = (sd[0], sd[len(sd) // 2], sd[-1])
        do = max(abs(a - b) for a, b in zip(now, dau.nghi['bam'][ten]))
        if do > NGUONG_BAM: loi.append(Loi('bam', ten, do))
    return loi


def kiem_trong_vien(dau, goc):
    """Nhìn trực giao theo góc: đỉnh nằm ngoài bóng đầu mà xa da hơn lúc nghỉ → lòi viền."""
    a = math.radians(GOCS[goc]); d = Vector((math.sin(a), -math.cos(a), 0.0)); bvh = _bvh(dau); loi = []
    for ten, ob in dau.parts.items():
        worst = 0.0
        for v in _verts(ob):
            if bvh.ray_cast(v + d * 2.0, -d)[0] is not None: continue
            dist = abs(_sd(bvh, v))
            if dist > dau.nghi['bam'][ten][2] + NGUONG_BAM: worst = max(worst, dist)
        if worst: loi.append(Loi('lo_vien', ten, worst, goc=goc))
    return loi


def kiem_de(dau):
    """Chân mày không chạm viền mắt cùng bên; con ngươi nằm trong khe mắt (dưới mí trên, trên mí dưới) và không vượt mí hơn lúc nghỉ."""
    loi = []; n = neo_hien_tai(dau)
    for k in 'LR':
        brow = _verts(dau.parts[f'Eyebrow.{k}']); ring = _verts(dau.parts[f'Eyeline.{k}']); pu = _verts(dau.parts[f'Pupil.{k}'])
        gap = min(v.z for v in brow) - max(v.z for v in ring)
        if gap < NGUONG_HO: loi.append(Loi('de', f'Eyebrow.{k}', NGUONG_HO - gap, chi_tiet='mày chạm viền mắt'))
        top = max(v.z for v in pu) - n[f'lid_up.{k}'].z; cz = _cen(pu).z
        if top > dau.nghi['pupil_top'][k] + NGUONG_BAM or cz < n[f'lid_low.{k}'].z:
            loi.append(Loi('de', f'Pupil.{k}', max(top - dau.nghi['pupil_top'][k], n[f'lid_low.{k}'].z - cz), chi_tiet='con ngươi ngoài khe mắt'))
    return loi


def kiem_nhan_dien(dau):
    """Nốt ruồi không trôi và không đổi bên; khi mọi key = 0 thì lưới đầu trùng bản nghỉ từng đỉnh."""
    loi = []; m = _cen(_verts(dau.parts['Mole'])); r = dau.nghi['mole']
    if (m - r).length > NGUONG_RUOI: loi.append(Loi('nhan_dien', 'Mole', (m - r).length, chi_tiet='nốt ruồi trôi'))
    if m.x * r.x < 0: loi.append(Loi('nhan_dien', 'Mole', abs(m.x - r.x), chi_tiet='nốt ruồi đổi bên'))
    sk = dau.head.data.shape_keys
    if not sk or all(kb.value == 0 for kb in sk.key_blocks):
        if _hash(_verts(dau.head)) != dau.nghi['hash']: loi.append(Loi('nhan_dien', 'Head_Base', 1.0, chi_tiet='mặt nghỉ khác bản đã chụp'))
    return loi


def chay_kiem(dau, ten_keys, gia_tris=(1.0, 0.5), gocs=GOCS):
    """Đặt từng key ở từng giá trị, chạy mọi kiểm ở mọi góc. Trả danh sách Loi; rỗng = đạt."""
    if dau.nghi is None: chup_nghi(dau)
    kb = dau.head.data.shape_keys.key_blocks if dau.head.data.shape_keys else {}; tat = []
    for k in list(kb): k.value = 0.0
    for ten in ten_keys:
        for gt in gia_tris:
            kb[ten].value = gt; ds = kiem_bam(dau) + kiem_de(dau) + kiem_nhan_dien(dau)
            for g in gocs: ds += kiem_trong_vien(dau, g)
            for l in ds: l.key, l.gia_tri = ten, gt
            tat += ds
        kb[ten].value = 0.0
    return tat
