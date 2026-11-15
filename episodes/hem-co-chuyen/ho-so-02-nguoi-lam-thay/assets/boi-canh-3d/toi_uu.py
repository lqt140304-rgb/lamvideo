"""Tối ưu quay cho bối cảnh 3D (15/11/2026): vật càng xa camera càng ít chi tiết; cấu hình render theo mức nhap / duyet / cuoi.

Cách dùng (cuối hàm build của mỗi bối cảnh):
    import toi_uu; toi_uu.apply(sc, [vị trí các camera / điểm trên đường máy], muc='duyet')

Nguyên tắc
- Vòng LOD (Level of Detail, mức chi tiết) tính từ camera GẦN NHẤT tới mặt hộp bao của vật, không phải tâm vật
  (tường dài 30 m có tâm xa nhưng mép sát máy thì vẫn là vật gần).
  0 gần (< 15 m): giữ nguyên · 1 trung (< 40 m): lưới còn 50 % · 2 xa (< 120 m): 20 %, bỏ bevel, không đổ bóng
  · 3 chân trời: 8 %, không đổ bóng, không hiện trong phản chiếu (tuỳ cảnh).
- Lưới dùng chung (instancing: nhiều ghế/người cùng một lưới, Cycles chỉ lưu một bản) KHÔNG gắn modifier, vì modifier
  làm mất instancing. Thay vào đó mỗi vòng có một bản lưới đã giảm sẵn, dùng chung cho mọi vật cùng vòng → vẫn là instance.
- Lưới nhỏ (< 300 mặt) không giảm: giảm không lợi gì mà dễ vỡ hình.
- Camera culling (bỏ vật ngoài khung hình) chỉ bật cho vòng ≥ 1, để vật gần ngoài khung vẫn đổ bóng/phản chiếu vào cảnh.
"""
import bpy
from mathutils import Vector

NGUONG = (15.0, 40.0, 120.0)
TI_LE = {1: 0.5, 2: 0.2, 3: 0.08}
MAU = {'nhap': 16, 'duyet': 64, 'cuoi': 256}
NAY = {'nhap': (3, 2, 1, 2), 'duyet': (6, 4, 3, 4), 'cuoi': (8, 5, 4, 6)}  # tổng, khuếch tán, bóng loáng, xuyên thấu


def vong_lod(dist):
    for i, n in enumerate(NGUONG):
        if dist < n: return i
    return 3


def _kc_hop_bao(ob, p):
    """Khoảng cách từ điểm p tới hộp bao (theo trục thế giới) của vật."""
    pts = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
    lo = Vector((min(v.x for v in pts), min(v.y for v in pts), min(v.z for v in pts)))
    hi = Vector((max(v.x for v in pts), max(v.y for v in pts), max(v.z for v in pts)))
    q = Vector((min(max(p.x, lo.x), hi.x), min(max(p.y, lo.y), hi.y), min(max(p.z, lo.z), hi.z)))
    return (q - p).length


def _luoi_giam(me, ratio, cache):
    """Bản lưới đã giảm (Decimate Collapse) của `me`, dùng chung theo (lưới, tỉ lệ)."""
    k = (me.name, ratio)
    if k in cache: return cache[k]
    tmp = bpy.data.objects.new('_lod_tmp', me); bpy.context.scene.collection.objects.link(tmp)
    md = tmp.modifiers.new('giam', 'DECIMATE'); md.ratio = ratio; md.use_collapse_triangulate = False
    dg = bpy.context.evaluated_depsgraph_get()
    new = bpy.data.meshes.new_from_object(tmp.evaluated_get(dg)); new.name = f'{me.name}_lod{int(ratio * 100)}'
    for i, m in enumerate(me.materials):
        if i < len(new.materials): new.materials[i] = m
    bpy.data.objects.remove(tmp)
    cache[k] = new
    return new


def apply(sc, cams, muc='duyet', tat_phan_chieu=True, giam_luoi=True):
    """Gán vòng LOD cho mọi lưới theo các vị trí camera `cams` (list Vector; với máy chạy, đưa vài điểm dọc đường đi).
    Trả về thống kê {'vong': [số vật vòng 0..3], 'mat_truoc', 'mat_sau'}."""
    import os
    if os.environ.get('TOI_UU_TAT'):   # so sánh: tắt hết tối ưu (giữ nguyên lưới, mẫu cố định, không adaptive/cull)
        c = sc.cycles; sc.render.engine = 'CYCLES'; c.samples = MAU[muc]; c.use_adaptive_sampling = False; c.use_denoising = True
        print('[toi_uu] TẮT'); return {'vong': None}
    cams = [Vector(c) for c in cams]
    bpy.context.view_layer.update()  # cập nhật matrix_world sau khi đặt location
    cache, dem = {}, [0, 0, 0, 0]
    mat_truoc = mat_sau = 0
    for ob in list(sc.objects):
        if ob.type != 'MESH' or ob.name.startswith('_lod'): continue
        if ob.get('giu_chi_tiet'): v = 0
        else: v = vong_lod(min(_kc_hop_bao(ob, c) for c in cams))
        ob['vong_lod'] = v; dem[v] += 1
        n = len(ob.data.polygons); mat_truoc += n
        if v >= 1 and giam_luoi and n >= 300:
            if ob.data.users > 1 or not ob.modifiers:   # lưới dùng chung hoặc vật không modifier: đổi sang bản lưới đã giảm
                ob.data = _luoi_giam(ob.data, TI_LE[v], cache)
            else:                                        # vật riêng có modifier (bevel…): thêm Decimate ở cuối
                md = ob.modifiers.new('lod', 'DECIMATE'); md.ratio = TI_LE[v]
        if v >= 2:
            for md in list(ob.modifiers):
                if md.type in ('BEVEL', 'SUBSURF'): ob.modifiers.remove(md)
            ob.visible_shadow = False
            if v == 3 and tat_phan_chieu: ob.visible_glossy = False
        if v >= 1:
            try: ob.cycles.use_camera_cull = True; ob.cycles.use_distance_cull = (v == 3)
            except AttributeError: pass
        mat_sau += len(ob.data.polygons)
    cau_hinh(sc, muc)
    tk = {'vong': dem, 'mat_truoc': mat_truoc, 'mat_sau': mat_sau}
    print(f'[toi_uu] vòng LOD {dem}  mặt lưới {mat_truoc} → {mat_sau}')
    return tk


def cau_hinh(sc, muc='duyet'):
    """Cycles: adaptive sampling (tự dừng ở vùng đã sạch), light tree (chọn đèn thông minh khi có nhiều đèn), persistent data
    (render chuỗi khung không dựng lại cảnh mỗi khung), camera/distance cull, giới hạn số lần nảy tia, khử nhiễu, Simplify."""
    c = sc.cycles
    sc.render.engine = 'CYCLES'
    c.samples = MAU[muc]; c.use_adaptive_sampling = True; c.adaptive_threshold = 0.05 if muc == 'nhap' else 0.02 if muc == 'duyet' else 0.01
    c.use_denoising = True
    try: c.denoiser = 'OPENIMAGEDENOISE'
    except Exception: pass
    for k in ('use_light_tree',):
        if hasattr(c, k): setattr(c, k, True)
    c.max_bounces, c.diffuse_bounces, c.glossy_bounces, c.transmission_bounces = NAY[muc]
    c.transparent_max_bounces = 8; c.caustics_reflective = False; c.caustics_refractive = False
    c.blur_glossy = 1.0  # làm mềm bóng loáng gián tiếp → ít nhiễu đốm
    c.use_camera_cull = True; c.camera_cull_margin = 0.15
    c.use_distance_cull = True; c.distance_cull_margin = 150.0
    sc.render.use_persistent_data = True
    sc.render.use_simplify = True; sc.render.simplify_subdivision_render = 1 if muc == 'nhap' else 2
    if muc == 'nhap': sc.render.resolution_percentage = 50


def eevee(sc):
    """Xem nhanh bằng EEVEE (vài giây/khung) để duyệt bố cục, đường máy; không thay bản Cycles cuối."""
    for e in ('BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE'):
        try: sc.render.engine = e; break
        except TypeError: continue
    try: sc.eevee.taa_render_samples = 32
    except AttributeError: pass
