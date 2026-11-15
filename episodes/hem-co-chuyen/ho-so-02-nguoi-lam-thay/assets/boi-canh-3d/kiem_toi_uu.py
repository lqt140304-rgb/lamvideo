"""Kiểm toi_uu.py: chạy `/tmp/bpyenv/bin/python kiem_toi_uu.py` → in OK hoặc dừng ở assert sai."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
import toi_uu


def cau(name, loc, me=None):
    if me is None:
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=24, radius=1.0)
        me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); ob.location = loc; bpy.context.scene.collection.objects.link(ob)
    return ob


def chay():
    bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
    gan = cau('gan', (5, 0, 0)); xa = cau('xa', (200, 0, 0))
    chung_gan = cau('chung_gan', (4, 3, 0)); chung_xa = cau('chung_xa', (300, 3, 0), me=chung_gan.data)
    nho = bpy.data.objects.new('nho', bpy.data.meshes.new('nho')); sc.collection.objects.link(nho); nho.location = (500, 0, 0)
    tk = toi_uu.apply(sc, [(0, 0, 0)], muc='nhap')
    assert toi_uu.vong_lod(10) == 0 and toi_uu.vong_lod(20) == 1 and toi_uu.vong_lod(80) == 2 and toi_uu.vong_lod(500) == 3
    assert gan['vong_lod'] == 0 and not gan.modifiers and len(gan.data.polygons) > 1000
    assert xa['vong_lod'] == 3 and len(xa.data.polygons) < 300 and xa.visible_shadow is False
    assert chung_gan.data.name == 'chung_gan' and chung_xa.data.name != 'chung_gan'      # bản gần giữ lưới gốc, bản xa đổi sang lưới đã giảm
    assert not chung_xa.modifiers                                                        # không modifier → vẫn instance được
    assert sc.cycles.samples == 16 and sc.render.use_persistent_data and sc.cycles.use_adaptive_sampling
    assert tk['mat_sau'] < tk['mat_truoc']
    # chạy lần hai không lỗi
    toi_uu.apply(sc, [(0, 0, 0)], muc='duyet')
    print('OK', tk)


chay()
