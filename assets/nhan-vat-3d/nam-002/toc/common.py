import bpy, numpy as np, math
from mathutils import Vector
R="../../"
def render(path, cam_loc, target, res=(700,700), ortho=None, objs_hide=()):
    sc=bpy.context.scene
    sc.render.engine='CYCLES'; sc.cycles.samples=24; sc.cycles.device='CPU'
    sc.render.resolution_x,sc.render.resolution_y=res
    sc.render.filepath=path
    w=bpy.data.worlds.new("w"); w.use_nodes=True
    w.node_tree.nodes["Background"].inputs[1].default_value=1.2
    w.node_tree.nodes["Background"].inputs[0].default_value=(0.8,0.85,0.9,1)
    sc.world=w
    cam=bpy.data.cameras.new("c"); co=bpy.data.objects.new("c",cam); sc.collection.objects.link(co)
    co.location=cam_loc
    d=Vector(target)-Vector(cam_loc); co.rotation_euler=d.to_track_quat('-Z','Y').to_euler()
    if ortho: cam.type='ORTHO'; cam.ortho_scale=ortho
    sc.camera=co
    bpy.ops.render.render(write_still=True)
