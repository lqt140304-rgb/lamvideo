"""Topology đầu diễn hoạt: đầu gốc nguyên vẹn, bản sao có lỗ mắt/miệng thật, silhouette giữ, nhãn cầu không xuyên da."""
import math
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from rig_mat_nam import luoi

_CACHE = {}


def _rig():
    if 'r' not in _CACHE: _CACHE['r'] = luoi.dung()
    return _CACHE['r']


def _bvh(ob):
    """BVH theo toạ độ THẾ GIỚI (FromObject dùng toạ độ cục bộ, sai với vật có cha/xoay như nhãn cầu)."""
    dg = bpy.context.evaluated_depsgraph_get(); ev = ob.evaluated_get(dg); me = ev.to_mesh(); M = ev.matrix_world
    bvh = BVHTree.FromPolygons([M @ v.co for v in me.vertices], [tuple(p.vertices) for p in me.polygons]); ev.to_mesh_clear(); return bvh


def _bvh_goc():
    """Đầu gốc: cùng cách tam giác hoá như lúc dựng (FromObject; đầu gốc ở gốc toạ độ, ma trận đơn vị)."""
    g = bpy.data.objects['Head_Base']; assert g.matrix_world == g.matrix_world.Identity(4)
    return BVHTree.FromObject(g, bpy.context.evaluated_depsgraph_get())


def test_dau_goc_khong_doi():
    r = _rig(); g = bpy.data.objects['Head_Base']
    assert len(g.data.vertices) == 47378 and len(g.data.polygons) == 47520
    assert g.users_collection[0].name == '03_Head_And_Face'          # đầu gốc vẫn ở chỗ cũ
    assert r.head.name == 'Head_Rig' and r.head.data != g.data


def test_bien_chi_o_tay_ao_mi():
    """Không cạnh hở nào ngoài vòng cuối tay áo mí (nằm khuất sau nhãn cầu); lưới không có cạnh nhiều hơn 2 mặt."""
    r = _rig(); import bmesh
    bm = bmesh.new(); bm.from_mesh(r.head.data); vung = bm.verts.layers.int['vung']; vong = bm.verts.layers.int['vong']
    for e in bm.edges:
        assert len(e.link_faces) <= 2, 'cạnh có hơn 2 mặt'
        if e.is_boundary:
            for v in e.verts: assert v[vung] in (12, 22) and v[vong] == -luoi.J_MI, (v[vung], v[vong])
    assert sum(1 for e in bm.edges if e.is_boundary) == 2 * r.n_mat


def test_silhouette_giu_nguyen():
    """Da ngoài mảng quanh mắt/miệng (và vòng ngoài cùng của mảng) nằm trên bề mặt đầu gốc, sai ≤ 0,3 mm.
    Trong mảng mắt, da được kéo theo chiều sâu để ôm nhãn cầu (xem test_hinh_lo_mat_chinh_dien_giu)."""
    r = _rig(); bvh = _bvh_goc(); me = r.head.data
    vung = me.attributes['vung'].data; vong = me.attributes['vong'].data; xau = 0
    for v in me.vertices:
        z, k = vung[v.index].value, vong[v.index].value
        if (z == 0 and k == 99) or (z in (11, 21) and k == luoi.K_MAT) or (z == 31 and k >= 1):
            if bvh.find_nearest(v.co)[3] > 0.0003: xau += 1
    assert xau == 0, xau


def test_hinh_lo_mat_chinh_dien_giu():
    """Nhìn chính diện (chiếu theo trục mắt), mép lỗ mắt trùng đường mép gốc (mí trên + cung tròng trắng) sai ≤ 0,5 mm;
    độ lún theo chiều sâu ≤ 8 mm."""
    r = _rig(); me = r.head.data; vung = me.attributes['vung'].data; vong = me.attributes['vong'].data; ng = me.attributes['nguon'].data
    import dung_dau_nam as D
    for s, k, vz in ((1, 'L', 11), (-1, 'R', 21)):
        p0, f, X, Z = D.EYE_FRAMES[s]; vien = r.info[k]['vien']; bvh = _bvh_goc()
        for v in me.vertices:
            if vung[v.index].value == vz and vong[v.index].value == 0:
                u0, w0 = vien[ng[v.index].value]; q = v.co - p0; C = r.info[k]['C']
                # chiếu ngược theo tia từ tâm cầu về mặt gốc rồi so (u, w)
                d = (v.co - C).normalized(); hit = bvh.ray_cast(C + d * 0.3, -d)
                assert hit[0] is not None
                qh = hit[0] - p0
                assert math.hypot(qh.dot(X) - u0, qh.dot(Z) - w0) <= 0.0005, (k, u0, w0)
                assert (hit[0] - v.co).length <= 0.008, (k, (hit[0] - v.co).length)


def test_nhan_cau_khong_xuyen_da():
    r = _rig(); h = _bvh(r.head)
    for k in 'LR':
        e = _bvh(r.mat[k]); assert h.overlap(e) == [], k
        assert _bvh(bpy.data.objects[f'Vien_Mat.{k}']).overlap(e) == [], ('viền mắt chạm nhãn cầu', k)


def test_nhin_qua_lo_mat_chi_thay_nhan_cau():
    """Tia từ phía trước qua vùng lỗ mắt chạm nhãn cầu trước, không bao giờ chạm mặt trong của đầu (nhìn xuyên)."""
    r = _rig(); h = _bvh(r.head); import dung_dau_nam as D
    for s, k in ((1, 'L'), (-1, 'R')):
        p0, f, X, Z = D.EYE_FRAMES[s]; e = _bvh(r.mat[k])
        for u in [i * 0.008 for i in range(-5, 6)]:
            for w in [j * 0.008 for j in range(-6, 3)]:
                o = p0 + X * u + Z * w + f * 0.3; d = -f
                he, hh = e.ray_cast(o, d), h.ray_cast(o, d)
                if hh[0] is not None and (he[0] is None or (hh[0] - o).length < (he[0] - o).length):
                    assert hh[1].dot(d) < 0, (k, u, w, 'chạm mặt trong của đầu')


def test_phap_tuyen_da_cung_chieu_dau_goc():
    """Mặt da của đầu diễn hoạt cùng chiều pháp tuyến với bề mặt đầu gốc tại cùng chỗ (không lật mặt, không gấp tam giác)."""
    r = _rig(); me = r.head.data; vung = me.attributes['vung'].data; bvh = _bvh_goc()
    da = [p for p in me.polygons if all(vung[i].value in (0, 11, 21, 31) for i in p.vertices)]
    nguoc = [p.index for p in da if p.normal.dot(bvh.find_nearest(p.center)[1]) < 0]
    assert not nguoc, (len(nguoc), len(da))


def test_mieng_khep_kin():
    """Lúc nghỉ: mép môi trên và môi dưới trùng nhau (khép), mỗi bên đủ số đỉnh."""
    r = _rig(); me = r.head.data; vung = me.attributes['vung'].data; vong = me.attributes['vong'].data; phia = me.attributes['phia'].data; ng = me.attributes['nguon'].data
    tren = {ng[v.index].value: v.co for v in me.vertices if vung[v.index].value == 31 and vong[v.index].value == 0 and phia[v.index].value == 1}
    duoi = {ng[v.index].value: v.co for v in me.vertices if vung[v.index].value == 31 and vong[v.index].value == 0 and phia[v.index].value == -1}
    assert len(tren) == len(duoi) >= 10
    for i in tren: assert (tren[i] - duoi[i]).length < 1e-6


def test_rang_luoi_khong_cham_moi():
    r = _rig(); h = _bvh(r.head)
    for ten in ('Rang_Tren', 'Rang_Duoi', 'Luoi'):
        assert h.overlap(_bvh(bpy.data.objects[ten])) == [], ten


def test_giu_bo_phan_khong_lien_quan():
    r = _rig()
    for ten in ('Ear_Rig.L', 'Ear_Rig.R', 'Eyebrow_Rig.L', 'Eyebrow_Rig.R', 'Mole_Rig'): assert ten in bpy.data.objects, ten
    assert not any(o.name.startswith(('Pupil_Rig', 'Eyeline_Rig', 'Mouth_line_Rig')) for o in bpy.data.objects)
    assert len([o for o in r.coll.all_objects if o.name.startswith('Hair')]) >= 1
