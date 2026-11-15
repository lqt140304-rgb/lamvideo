import sys; sys.path.insert(0,"/home/claude/work")
from common import *
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.wm.open_mainfile(filepath=R+"nhan-vat-goc/nhan-vat-goc.blend")
o=bpy.data.objects["model_LOD0"]; me=o.data
nv=len(me.vertices); nl=len(me.loops); npoly=len(me.polygons)
v=np.empty(nv*3); me.vertices.foreach_get("co",v); v=v.reshape(-1,3)
lv=np.empty(nl,dtype=np.int32); me.loops.foreach_get("vertex_index",lv)
uv=np.empty(nl*2); me.uv_layers[0].data.foreach_get("uv",uv); uv=uv.reshape(-1,2)
ls=np.empty(npoly,dtype=np.int32); me.polygons.foreach_get("loop_start",ls)
lt=np.empty(npoly,dtype=np.int32); me.polygons.foreach_get("loop_total",lt)
print("loop_total uniq",np.unique(lt))
tex=[n.image for n in me.materials[0].node_tree.nodes if n.type=='TEX_IMAGE' and n.image.name=='texture_diffuse.png'][0]
px=np.array(tex.pixels[:],dtype=np.float32).reshape(2048,2048,4)
ix=np.clip((uv[:,0]*2047).round().astype(int),0,2047); iy=np.clip((uv[:,1]*2047).round().astype(int),0,2047)
lc=px[iy,ix,:3]
# face color = mean of loops (triangles)
fi=np.repeat(np.arange(npoly),lt)
fc=np.zeros((npoly,3)); np.add.at(fc,fi,lc); fc/=lt[:,None]
luma=fc@np.array([.2126,.7152,.0722])
fz=np.zeros(npoly); np.add.at(fz,fi,v[lv,2]); fz/=lt
print(np.percentile(luma[fz>1.5],[5,25,50,75,95]))
dark=luma<0.04
print("dark faces",dark.sum(), "dark z>1.3", (dark&(fz>1.3)).sum())
np.savez("./goc.npz",v=v,lv=lv,ls=ls,lt=lt,luma=luma,fz=fz,uv=uv)
