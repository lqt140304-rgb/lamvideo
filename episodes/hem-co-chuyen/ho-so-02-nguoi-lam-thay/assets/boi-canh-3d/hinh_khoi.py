"""Hình khối dùng chung cho bối cảnh Hồi 3 (giảng đường, sân trường, bờ kè). Toạ độ thế giới thẳng (KHÔNG phản chiếu `mx` như phòng trọ).
Tạo lưới bằng bmesh (không bpy.ops) cho nhanh; `inst()` tạo bản sao dùng chung lưới (instance) để Cycles chỉ lưu một bản."""
import math, sys, argparse
import bpy, bmesh
from mathutils import Vector, Euler


def coll(name):
    c = bpy.data.collections.new(name); bpy.context.scene.collection.children.link(c); return c


def _obj(name, me, mat, c, loc=(0, 0, 0), rot=None, smooth=False):
    if smooth:
        for p in me.polygons: p.use_smooth = True
    if mat is not None and not me.materials: me.materials.append(mat)
    ob = bpy.data.objects.new(name, me); ob.location = loc
    if rot: ob.rotation_euler = rot
    (c or bpy.context.scene.collection).objects.link(ob); return ob


def luoi_hop(name, x0, x1, y0, y1, z0, z1):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co = Vector((x1 if v.co.x > 0 else x0, y1 if v.co.y > 0 else y0, z1 if v.co.z > 0 else z0))
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); return me


def box(name, x0, x1, y0, y1, z0, z1, mat, c=None, bevel=0.0, rot=None):
    ob = _obj(name, luoi_hop(name, x0, x1, y0, y1, z0, z1), mat, c)
    if rot:  # quay quanh tâm hộp
        ctr = Vector(((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2))
        for v in ob.data.vertices: v.co -= ctr
        ob.location = ctr; ob.rotation_euler = rot
    if bevel > 0:
        md = ob.modifiers.new('bevel', 'BEVEL'); md.width = bevel; md.segments = 2; md.limit_method = 'ANGLE'
    return ob


def cyl(name, x, y, z, r, h, mat, c=None, seg=24, rot=None, r2=None):
    """Trụ đứng: đáy tại z, cao h (r2: bán kính đỉnh, để làm nón cụt)."""
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=h)
    for v in bm.verts: v.co.z += h / 2
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    return _obj(name, me, mat, c, (x, y, z), rot, smooth=True)


def sphere(name, x, y, z, r, mat, c=None, scale=(1, 1, 1), seg=20):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=max(8, seg // 2), radius=r)
    for v in bm.verts: v.co = Vector((v.co.x * scale[0], v.co.y * scale[1], v.co.z * scale[2]))
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    return _obj(name, me, mat, c, (x, y, z), smooth=True)


def gop(name, parts, c=None):
    """Gộp nhiều vật (đã tạo) thành một lưới có nhiều vật liệu, dùng làm mẫu instance. Vật nguồn bị xoá."""
    bm = bmesh.new(); mats = []
    for ob in parts:
        me = ob.data.copy(); me.transform(ob.matrix_basis)
        for md in ob.modifiers:  # áp bevel thủ công: bỏ qua, mẫu instance giữ đơn giản
            pass
        off = len(mats)
        for m in me.materials:
            if m not in mats: mats.append(m)
        idx = {i: mats.index(m) for i, m in enumerate(me.materials)}
        tmp = bmesh.new(); tmp.from_mesh(me)
        for f in tmp.faces: f.material_index = idx.get(f.material_index, 0)
        m2 = bpy.data.meshes.new('_t'); tmp.to_mesh(m2); tmp.free(); bm.from_mesh(m2); bpy.data.meshes.remove(m2); bpy.data.meshes.remove(me)
        bpy.data.objects.remove(ob)
    out = bpy.data.meshes.new(name); bm.to_mesh(out); bm.free()
    for m in mats: out.materials.append(m)
    return out


def inst(name, me, loc, c=None, rot=(0, 0, 0), scale=(1, 1, 1)):
    ob = bpy.data.objects.new(name, me); ob.location = loc; ob.rotation_euler = rot; ob.scale = scale
    (c or bpy.context.scene.collection).objects.link(ob); return ob


def camera(name, pos, tgt, mm, w=1280, sc=None):
    cam = bpy.data.cameras.new(name); cam.lens = mm; cam.sensor_width = 36.0; cam.sensor_fit = 'HORIZONTAL'
    cam.clip_start = 0.05; cam.clip_end = 3000
    ob = bpy.data.objects.new(name, cam); bpy.context.scene.collection.objects.link(ob); ob.location = pos
    ob.rotation_euler = (Vector(tgt) - Vector(pos)).to_track_quat('-Z', 'Y').to_euler()
    return ob


def area(name, loc, size, energy, color, rot=(0, 0, 0), size_y=None, c=None):
    import vat_lieu as M
    d = bpy.data.lights.new(name, 'AREA'); d.shape = 'RECTANGLE'; d.size = size; d.size_y = size_y or size
    d.energy = energy; d.color = M._hex(color)[:3]
    ob = bpy.data.objects.new(name, d); ob.location = loc; ob.rotation_euler = rot
    (c or bpy.context.scene.collection).objects.link(ob); return ob


def sun(name, direction, energy, color, angle_deg=1.0, c=None):
    import vat_lieu as M
    d = bpy.data.lights.new(name, 'SUN'); d.energy = energy; d.color = M._hex(color)[:3]; d.angle = math.radians(angle_deg)
    ob = bpy.data.objects.new(name, d); ob.rotation_euler = Vector(direction).normalized().to_track_quat('-Z', 'Y').to_euler()
    (c or bpy.context.scene.collection).objects.link(ob); return ob


def troi(mau_duoi, mau_tren, strength=1.0):
    """Nền trời gradient theo hướng nhìn (dưới → trên)."""
    import vat_lieu as M
    w = bpy.data.worlds.new('troi'); bpy.context.scene.world = w; w.use_nodes = True
    nt = w.node_tree; bg = nt.nodes['Background']; bg.inputs['Strength'].default_value = strength
    tc = nt.nodes.new('ShaderNodeTexCoord'); sp = nt.nodes.new('ShaderNodeSeparateXYZ'); cr = nt.nodes.new('ShaderNodeValToRGB')
    nt.links.new(tc.outputs['Generated'], sp.inputs['Vector']); nt.links.new(sp.outputs['Z'], cr.inputs['Fac'])
    cr.color_ramp.elements[0].position = 0.5; cr.color_ramp.elements[0].color = M._hex(mau_duoi)
    cr.color_ramp.elements[1].position = 0.75; cr.color_ramp.elements[1].color = M._hex(mau_tren)
    nt.links.new(cr.outputs['Color'], bg.inputs['Color'])
    return w, cr, bg


def tham_so(cams_default, modes):
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser()
    ap.add_argument('--cam', default=cams_default); ap.add_argument('--mode', default=modes[0], choices=modes)
    ap.add_argument('--muc', default='duyet', choices=['nhap', 'duyet', 'cuoi']); ap.add_argument('--eevee', action='store_true')
    ap.add_argument('--out', default=''); ap.add_argument('--blend', default=''); ap.add_argument('--width', type=int, default=1280)
    ap.add_argument('--samples', type=int, default=0); ap.add_argument('--no-render', action='store_true'); ap.add_argument('--khong-nguoi', action='store_true')
    ap.add_argument('--frame', type=int, default=1)
    ap.add_argument('--anim', default='', help='"đầu,cuối,bước": render chuỗi khung TRONG MỘT tiến trình (persistent data giữ cảnh giữa các khung)')
    return ap.parse_args(argv)


def ket_thuc(sc, a, out_default):
    """Chung cho mọi entry: độ phân giải 2.39:1, EEVEE tuỳ chọn, lưu .blend, render ảnh."""
    import toi_uu
    sc.render.resolution_x = a.width; sc.render.resolution_y = round(a.width / 2.39)
    if a.muc != 'nhap': sc.render.resolution_percentage = 100
    if a.samples: sc.cycles.samples = a.samples
    if a.eevee: toi_uu.eevee(sc)
    sc.view_settings.view_transform = 'AgX'
    sc.frame_set(a.frame)
    if a.blend: bpy.ops.wm.save_as_mainfile(filepath=a.blend)
    if a.no_render: return
    if a.anim:
        f0, f1, st = (int(v) for v in a.anim.split(','))
        sc.frame_start, sc.frame_end, sc.frame_step = f0, f1, st
        sc.render.filepath = (a.out or out_default.rsplit('.', 1)[0]) + '_'   # ảnh <out>_0001.png …
        bpy.ops.render.render(animation=True)
    else:
        sc.render.filepath = a.out or out_default; bpy.ops.render.render(write_still=True)
