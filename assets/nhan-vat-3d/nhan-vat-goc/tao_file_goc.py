"""Tạo file nhân vật nguồn, giữ nguyên hình khối và các LOD từ FBX.

blender -b --factory-startup --python tao_file_goc.py
Chỉ tạo nhan-vat-goc.blend bên cạnh script; chưa bỏ tóc hoặc làm rig.
"""
from pathlib import Path
import bpy

HERE = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(HERE / 'nguon/lod_basic_pbr.fbx'))
sc = bpy.context.scene
sc.unit_settings.system = 'METRIC'
sc.unit_settings.scale_length = 1.0
root = bpy.data.collections.new('NHAN_VAT_GOC__NGUON_CHUA_RIG')
sc.collection.children.link(root)
meshes = sorted((o for o in sc.objects if o.type == 'MESH'), key=lambda o: o.name)
assert len(meshes) == 5, 'Nguồn phải có năm LOD'
for i, ob in enumerate(meshes):
    coll = bpy.data.collections.new(f'LOD{i}' + ('__MAC_DINH' if i == 0 else '__AN'))
    root.children.link(coll)
    for old in list(ob.users_collection):
        old.objects.unlink(ob)
    coll.objects.link(ob)
    ob.hide_render = i != 0
    ob.hide_set(i != 0)
    ob['vai_tro'] = 'Mức chi tiết thay thế; chỉ bật một LOD tại một thời điểm'
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
assert len(meshes[0].data.vertices) == 220517
assert not bpy.data.actions and not any(o.type == 'ARMATURE' for o in sc.objects)
for ob in sc.objects:
    ob.select_set(False)
meshes[0].select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
sc['ma_asset'] = 'NHAN-VAT-GOC-001'
sc['trang_thai'] = 'Nguồn tĩnh có tóc; chưa retopology, chưa rig, chưa shape key; chưa nghiệm thu chuyển động'
sc['nguon'] = 'ZIP 10349138-1e95-4c55-b7d6-0080f58fc6f9.zip do chủ repo cung cấp 14/11/2026'
sc['buoc_tiep'] = 'Nhân bản file trước khi cắt tóc và dựng lại da đầu; giữ nguồn này làm mốc'
text = bpy.data.texts.new('DOC_TRUOC')
text.write((HERE / 'README.md').read_text(encoding='utf-8'))
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type == 'VIEW_3D':
            area.spaces.active.region_3d.view_location = (0, 0, .9)
            area.spaces.active.region_3d.view_distance = 3.0
            area.spaces.active.shading.type = 'MATERIAL'
bpy.ops.wm.save_as_mainfile(filepath=str(HERE / 'nhan-vat-goc.blend'), compress=True)
print('PASS: 5 LOD; chỉ LOD0 hiển thị; 4 texture packed; nguồn chưa rig/shape key')
