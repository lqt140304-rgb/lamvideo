"""Chụp ảnh nhỏ để duyệt (Cycles CPU, ortho) và ghép bảng (PIL nếu có, không thì bỏ qua ghép)."""
import os, math
import bpy
from mathutils import Vector

VIEWS = {'truoc': (0, -1), 'nghieng': (1, 0), 'sau': (0, 1)}


def setup(sc, res=(300, 460), samples=12):
    sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = samples; sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.film_transparent = False
    w = sc.world or bpy.data.worlds.new('W'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[1].default_value = 0.6
    w.node_tree.nodes['Background'].inputs[0].default_value = (0.42, 0.42, 0.42, 1)
    if not bpy.data.objects.get('chup_sun'):
        L = bpy.data.lights.new('chup_sun', 'SUN'); L.energy = 3.0; o = bpy.data.objects.new('chup_sun', L); sc.collection.objects.link(o); o.rotation_euler = (math.radians(50), 0, math.radians(30))
    for o in sc.objects:
        if o.type == 'ARMATURE': o.hide_render = True


def cam(sc, view, target=(0, 0, 0.88), scale=1.9, dist=5.0):
    dx, dy = VIEWS[view] if isinstance(view, str) else view
    cd = bpy.data.cameras.get('chup_cam') or bpy.data.cameras.new('chup_cam'); cd.type = 'ORTHO'; cd.ortho_scale = scale
    o = bpy.data.objects.get('chup_cam') or bpy.data.objects.new('chup_cam', cd)
    if o.name not in sc.collection.objects: sc.collection.objects.link(o)
    t = Vector(target); o.location = t + Vector((dx * dist, dy * dist, 0.25)); o.rotation_euler = (t - o.location).to_track_quat('-Z', 'Y').to_euler(); sc.camera = o


def shot(sc, path, view='truoc', **kw):
    cam(sc, view, **kw); sc.render.filepath = path; bpy.ops.render.render(write_still=True); return path


def ghep(rows, out, cell=(150, 230)):
    """rows: list[(nhãn, [đường dẫn ảnh])] → một ảnh bảng (webp)."""
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        return None
    nc = max(len(r[1]) for r in rows); W = Image.new('RGB', (cell[0] * nc, (cell[1] + 14) * len(rows)), 'white'); d = ImageDraw.Draw(W)
    for i, (lab, ps) in enumerate(rows):
        d.text((3, i * (cell[1] + 14)), lab, fill='black')
        for j, p in enumerate(ps): W.paste(Image.open(p).convert('RGB').resize(cell), (j * cell[0], i * (cell[1] + 14) + 14))
    W.save(out, quality=80); return out
