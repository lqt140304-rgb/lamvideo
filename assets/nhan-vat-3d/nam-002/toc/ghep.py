import sys; sys.path.insert(0,"/home/claude/work")
from common import *
import bmesh
SX,SY,SZ=[float(x) for x in sys.argv[1:4]]; DY=float(sys.argv[4]); ZE=float(sys.argv[5]); tag=sys.argv[6]
d=np.load("goc.npz"); hairmask=d["luma"]<0.2
# keep only the big component 0 (drop eyebrows etc): recompute
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components
v0=d["v"]; tri=d["lv"].reshape(-1,3)
hv=np.unique(tri[hairmask]); idx=-np.ones(len(v0),int); idx[hv]=np.arange(len(hv))
t=tri[hairmask]; a=idx[t[:,0]]
g=coo_matrix((np.ones(len(t)),(a,idx[t[:,1]])),shape=(len(hv),len(hv)))+coo_matrix((np.ones(len(t)),(a,idx[t[:,2]])),shape=(len(hv),len(hv)))
n,lab=connected_components(g,directed=False); big=np.bincount(lab).argmax()
keepv=hv[lab==big]; vm=np.zeros(len(v0),bool); vm[keepv]=True
keep=(hairmask & vm[tri[:,0]]) | ((~hairmask)&(d['fz']>1.5))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.wm.open_mainfile(filepath=R+"nhan-vat-goc/nhan-vat-goc.blend")
for ob in list(bpy.data.objects):
    if ob.name!="model_LOD0": bpy.data.objects.remove(ob)
o=bpy.data.objects["model_LOD0"]; o.name="toc_nam"
bm=bmesh.new(); bm.from_mesh(o.data); bm.faces.ensure_lookup_table()
bmesh.ops.delete(bm,geom=[f for f in bm.faces if not keep[f.index]],context='FACES')
bm.to_mesh(o.data); bm.free()
me=o.data
nv=len(me.vertices); p=np.empty(nv*3); me.vertices.foreach_get("co",p); p=p.reshape(-1,3)
y0=p[:,1].copy(); z0=p[:,2].copy(); p[:,0]*=SX; p[:,1]=p[:,1]*SY+DY; z=p[:,2]; p[:,2]=np.where(z<=1.40, ZE+(z-1.22)*SZ, ZE+0.18*SZ+(z-1.40)*0.50)
p[:,2]+=0.05*np.clip(y0/0.28,0,1)*np.clip((z-1.35)/0.1,0,1)-0.05*np.clip(y0/0.2,0,1)*np.clip((1.30-z0)/0.2,0,1)
p[:,1]+=0.02*np.clip(y0/0.2,0,1)*np.clip((1.30-z0)/0.2,0,1)
p[:,2]+=0.05*np.clip((z0-1.48)/0.1,0,1)
me.vertices.foreach_set("co",p.ravel()); me.update()
bh=bmesh.new(); bh.from_mesh(me); bh.faces.ensure_lookup_table()
zz=np.empty(len(me.vertices)*3); me.vertices.foreach_get("co",zz); zz=zz.reshape(-1,3)
tt=np.clip((1.56-zz[:,2])/0.13,0,1)*np.clip(y0/0.1,0,1); fct=1-0.25*tt
zz[:,0]*=fct; zz[:,1]=0.016+(zz[:,1]-0.016)*fct
me.vertices.foreach_set("co",zz.ravel()); me.update()
bh.free(); bh=bmesh.new(); bh.from_mesh(me); bh.faces.ensure_lookup_table()
CUT=1.43
bmesh.ops.bisect_plane(bh,geom=bh.verts[:]+bh.edges[:]+bh.faces[:],plane_co=(0,0,CUT),plane_no=(0,0,1))
bh.faces.ensure_lookup_table()
dl=[f for f in bh.faces if f.calc_center_median().z<CUT and f.calc_center_median().y>0.0]
bmesh.ops.delete(bh,geom=dl,context='FACES'); bh.to_mesh(me); bh.free(); me.update()
print("hair verts",nv,"faces",len(me.polygons))
bpy.ops.import_scene.gltf(filepath=R+"nam-002/nam-002.glb")
import bmesh as bm_
nam=bpy.data.objects["model"]
ob2=nam.copy(); ob2.data=nam.data.copy(); ob2.name="da_dau_toc"; bpy.context.scene.collection.objects.link(ob2)
b=bm_.new(); b.from_mesh(ob2.data); b.verts.ensure_lookup_table(); b.normal_update()
def ok(vt):
    x,y,z=vt.co
    zl=np.interp(y,[-0.12,-0.05,0.03,0.05,0.14],[1.66,1.64,1.60,1.43,1.40])
    return z>=zl and z<1.80 and not (abs(x)>0.15 and z<1.62) and not (abs(x)>0.12 and z<1.5) and abs(x)<0.19
b.faces.ensure_lookup_table()
bm_.ops.delete(b,geom=[f for f in b.faces if not all(ok(v) for v in f.verts)],context='FACES')
bm_.ops.bisect_plane(b,geom=b.verts[:]+b.edges[:]+b.faces[:],plane_co=(0,0,1.43),plane_no=(0,0,1))
b.faces.ensure_lookup_table()
bm_.ops.delete(b,geom=[f for f in b.faces if f.calc_center_median().z<1.43],context='FACES')
b.verts.ensure_lookup_table()
b.normal_update()
for vt in b.verts: vt.co+=vt.normal*0.004
b.to_mesh(ob2.data); b.free()
m=bpy.data.materials.new("da_dau_den"); m.use_nodes=True
bs=m.node_tree.nodes["Principled BSDF"]; bs.inputs["Base Color"].default_value=(0.04,0.04,0.042,1); bs.inputs["Roughness"].default_value=1.0
ob2.data.materials.clear(); ob2.data.materials.append(m)
print("scalp faces",len(ob2.data.polygons))
sc=bpy.context.scene
import os
os.makedirs("out",exist_ok=True)
for name,cam,tgt,ort in [("truoc",(0,-2.2,1.55),(0,0,1.55),0.7),("ben",(2.2,0,1.55),(0,0,1.55),0.7),("xien",(1.3,-1.8,1.7),(0,0,1.55),0.7),("sau",(0,2.2,1.55),(0,0,1.55),0.7)]:
    for c in [x for x in bpy.data.objects if x.type=='CAMERA']: bpy.data.objects.remove(c)
    render(f"./out/{tag}_{name}.png",cam,tgt,res=(560,560),ortho=ort)
if len(sys.argv)>7:
    bpy.ops.export_scene.gltf(filepath="./out/nam-002-co-toc-thu.glb",export_format='GLB')
