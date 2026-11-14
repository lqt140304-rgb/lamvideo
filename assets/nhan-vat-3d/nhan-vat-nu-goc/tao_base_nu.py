"""Tạo base nữ từ LOD0, giữ nguyên hình khối/UV/vật liệu nguồn.

blender -b --factory-startup --python tao_base_nu.py
Chỉ tạo nhan-vat-nu-goc.blend bên cạnh script; nguồn đã đầu trọc, chưa làm rig.
"""
from pathlib import Path
import bpy

HERE = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(HERE / 'nguon/lod_basic_pbr.fbx'))
sc = bpy.context.scene
sc.unit_settings.system = 'METRIC'
sc.unit_settings.scale_length = 1.0
root = bpy.data.collections.new('BASE_NU__LOD0__CHUA_RIG')
sc.collection.children.link(root)
meshes = sorted((o for o in sc.objects if o.type == 'MESH'), key=lambda o: o.name)
assert len(meshes) == 5, 'Nguồn phải có năm LOD'
ob = next(o for o in meshes if o.name == 'model_LOD0')
assert len(ob.data.vertices) == 2043 and len(ob.data.polygons) == 2170
for other in meshes:
    if other != ob:
        data = other.data
        bpy.data.objects.remove(other, do_unlink=True)
        bpy.data.meshes.remove(data)
for old in list(ob.users_collection):
    old.objects.unlink(ob)
root.objects.link(ob)
ob.name = 'Base_Nu_LOD0'
ob.hide_render = False
ob.hide_set(False)
ob['vai_tro'] = 'Base nữ đầu trọc, nguyên hình khối LOD0; chưa rig'
assert ob.data.uv_layers and not ob.data.shape_keys
assert not ob.vertex_groups and not ob.modifiers
for im in bpy.data.images:
    path = HERE / 'nguon' / Path(im.filepath.replace('\\', '/')).name
    assert path.is_file(), f'Thiếu texture: {path}'
    im.filepath = str(path)
    im.reload()
    im.pack()
    im.filepath = '//nguon/' + path.name
assert len(bpy.data.images) == 4
assert len(ob.data.vertices) == 2043
assert not bpy.data.actions and not any(o.type == 'ARMATURE' for o in sc.objects)
for item in sc.objects:
    item.select_set(False)
ob.select_set(True)
bpy.context.view_layer.objects.active = ob
sc['ma_asset'] = 'NHAN-VAT-NU-GOC-001'
sc['trang_thai'] = 'Base nữ đầu trọc LOD0; chưa rig, chưa shape key; chưa nghiệm thu chuyển động'
sc['nguon'] = 'ZIP 67b8ee32-d50e-4aca-b0f0-05a6b5664af6.zip do chủ repo cung cấp 14/11/2026'
sc['buoc_tiep'] = 'Nhân bản trước khi phát triển nhân vật; tách mắt/miệng, chuẩn hóa vùng khớp, làm rig và thử biến dạng'
text = bpy.data.texts.new('DOC_TRUOC')
text.write((HERE / 'README.md').read_text(encoding='utf-8'))
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type == 'VIEW_3D':
            area.spaces.active.region_3d.view_location = (0, 0, .9)
            area.spaces.active.region_3d.view_distance = 3.0
            area.spaces.active.shading.type = 'MATERIAL'
bpy.ops.wm.save_as_mainfile(filepath=str(HERE / 'nhan-vat-nu-goc.blend'), compress=True)
print('PASS: female base uses LOD0 only; 4 packed textures; no rig/shape keys')
