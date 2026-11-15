"""Kiểm base nữ đã lưu: Blender -b nhan-vat-nu-goc.blend --python kiem_tra_base_nu.py.
Chỉ xác nhận cấu trúc/UV/texture/tư thế tĩnh; không kiểm diễn hoạt hay UV chồng đảo.
"""
import json
import bpy
import bmesh
from mathutils.bvhtree import BVHTree

sc = bpy.context.scene
meshes = [o for o in sc.objects if o.type == 'MESH']
checks = {'one_mesh': len(meshes) == 1}
assert checks['one_mesh'], 'Base nữ chỉ được có LOD0'
ob = meshes[0]
me = ob.data
bm = bmesh.new()
bm.from_mesh(me)
checks.update(
    lod0_counts=len(me.vertices) == 2043 and len(me.polygons) == 2170,
    visible=not ob.hide_render and not ob.hide_get(),
    closed_manifold=all(e.is_manifold for e in bm.edges),
    consistent_winding=all(e.is_contiguous for e in bm.edges),
    nonzero_faces=all(f.calc_area() >= 1e-12 for f in bm.faces),
    no_short_edges=all(e.calc_length() >= 1e-7 for e in bm.edges),
    positive_signed_volume=bm.calc_volume(signed=True) > 0,
    uv_map=len(me.uv_layers) == 1,
    no_rig=not any(o.type == 'ARMATURE' for o in sc.objects) and not ob.vertex_groups,
    no_animation_or_shapes=not bpy.data.actions and not me.shape_keys,
    no_unvalidated_modifiers=not ob.modifiers,
)
bm.free()
me.calc_loop_triangles()
tri = [tuple(t.vertices) for t in me.loop_triangles]
checks['triangles'] = len(tri) == 4082
coords = [v.co.copy() for v in me.vertices]
tree = BVHTree.FromPolygons(coords, tri, all_triangles=True, epsilon=0)
hits = [(a, b) for a, b in tree.overlap(tree) if a < b and not set(tri[a]) & set(tri[b])]
checks['no_nonadjacent_triangle_overlap'] = not hits
uv = me.uv_layers.active
if uv:
    checks['uv_inside_0_1'] = all(-1e-5 <= x <= 1.00001 for v in uv.data for x in v.uv)
    areas = []
    for t in me.loop_triangles:
        a, b, c = [uv.data[i].uv for i in t.loops]
        areas.append(abs((b.x-a.x)*(c.y-a.y) - (b.y-a.y)*(c.x-a.x)))
    checks['uv_nondegenerate'] = all(a >= 1e-12 for a in areas)
expected = {'texture_diffuse.png': 'sRGB', 'texture_metallic.png': 'Non-Color',
            'texture_normal.png': 'Non-Color', 'texture_roughness.png': 'Non-Color'}
checks['four_packed_2k_textures'] = len(bpy.data.images) == 4 and all(
    im.packed_file and list(im.size) == [2048, 2048] for im in bpy.data.images)
checks['texture_color_spaces'] = all(
    name in bpy.data.images and bpy.data.images[name].colorspace_settings.name == space
    for name, space in expected.items())
checks['female_source_identity'] = sc.get('ma_asset') == 'NHAN-VAT-NU-GOC-001'
print(json.dumps({'scope': 'STATIC BASE ONLY; animation and overlapping UV islands not tested',
                  'checks': checks, 'overlap_candidates': len(hits)}, sort_keys=True), flush=True)
assert all(checks.values()), 'FAIL: ' + ', '.join(k for k, v in checks.items() if not v)
print('PASS: ALL FEMALE STATIC BASE CHECKS', flush=True)
