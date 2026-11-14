"""Bản thử tách bộ phận từ NHAN-VAT-GOC-001 (chỉ LOD0), không sửa file gốc.

D:/blender/blender.exe -b --factory-startup --python tao_ban_tach.py
Tùy chọn: đặt biến môi trường SOI_DIR=<thư mục> để chụp ảnh kiểm tra vào đó.

Kết quả nam-tach-bo-phan.blend:
- NAM_TOC tách khỏi đầu (loang từ đỉnh đầu qua mặt lưới màu tóc); NAM_DA_DAU_TAM là da đầu tạm hình elip.
- Hốc mắt khoét theo vùng lòng trắng/con ngươi vẽ trên texture; thay bằng NAM_LONG_TRANG.L/R và NAM_CON_NGUOI.L/R.
  Di chuyển empty DK_NHIN để hai con ngươi nhìn theo.
- DK_MUI, DK_MIENG: empty điều khiển hook mũi/miệng (di chuyển, xoay, co giãn).
- NAM_NOT_RUOI: object riêng sát đuôi mày bên trái ảnh chính diện (-X), theo QUY-CHUAN-3D.
Quy ước: .L = bên trái nhân vật = +X; nhân vật nhìn về -Y.
"""
import os
from pathlib import Path
import bpy
import bmesh
import numpy as np
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree

HERE = Path(__file__).resolve().parent
SRC = HERE.parent / 'nhan-vat-goc' / 'nhan-vat-goc.blend'
OUT = HERE / 'nam-tach-bo-phan.blend'

bpy.ops.wm.open_mainfile(filepath=str(SRC))
sc = bpy.context.scene

# --- chỉ giữ LOD0, đưa transform vào lưới ---
ob = bpy.data.objects['model_LOD0']
for o in [o for o in bpy.data.objects if o is not ob]:
    bpy.data.objects.remove(o)
for c in list(bpy.data.collections):
    bpy.data.collections.remove(c)
for m in [m for m in bpy.data.meshes if m.users == 0]:
    bpy.data.meshes.remove(m)
sc.collection.objects.link(ob) if ob.name not in sc.collection.objects else None
root = bpy.data.collections.new('NAM_TACH_BO_PHAN__BAN_THU')
sc.collection.children.link(root)
sc.collection.objects.unlink(ob)
root.objects.link(ob)
ob.data.transform(ob.matrix_world)
ob.matrix_world = Matrix.Identity(4)
ob.name = ob.data.name = 'NAM_DAU_THAN'
ob.hide_set(False)
ob.hide_render = False
me = ob.data

# --- màu texture theo đỉnh ---
img = next(i for i in bpy.data.images if 'diffuse' in i.name.lower())
W, H = img.size
px = np.empty(W * H * 4, np.float32)
img.pixels.foreach_get(px)
px = px.reshape(H, W, 4)
nl = len(me.loops)
uv = np.empty(nl * 2, np.float32)
me.uv_layers[0].data.foreach_get('uv', uv)
uv = uv.reshape(-1, 2)
lv = np.empty(nl, np.int32)
me.loops.foreach_get('vertex_index', lv)
lc = px[np.clip((uv[:, 1] * H).astype(int), 0, H - 1), np.clip((uv[:, 0] * W).astype(int), 0, W - 1), :3]
nv = len(me.vertices)
col = np.zeros((nv, 3))
cnt = np.zeros(nv)
np.add.at(col, lv, lc)
np.add.at(cnt, lv, 1)
col /= np.maximum(cnt, 1)[:, None]
co = np.empty(nv * 3, np.float32)
me.vertices.foreach_get('co', co)
co = co.reshape(-1, 3)
lum = col.mean(1)
is_skin = (col[:, 0] > 0.5) & (col[:, 2] < col[:, 0] * 0.62)
is_dark = lum < 0.25
is_white = (lum > 0.45) & (col.std(1) < 0.07)
front = co[:, 1] < -0.15


def mean_col(mask):
    return tuple(col[mask].mean(0)) + (1.0,)


def mat(name, rgba, rough=0.55):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = rgba
    b.inputs['Roughness'].default_value = rough
    return m


def new_obj(name, data, parent=None):
    o = bpy.data.objects.new(name, data)
    root.objects.link(o)
    if parent:
        o.parent = parent
    return o


def empty(name, loc, size=0.03, shape='SPHERE', parent=None):
    e = new_obj(name, None, parent)
    e.empty_display_type = shape
    e.empty_display_size = size
    e.location = loc
    return e


# --- vị trí mắt từ lòng trắng vẽ trên texture ---
eyes = {}
for side, sgn in (('L', 1), ('R', -1)):
    m = front & is_white & (co[:, 2] > 1.18) & (co[:, 2] < 1.30) & (sgn * co[:, 0] > 0.02) & (sgn * co[:, 0] < 0.17)
    assert m.sum() > 200, f'Không thấy lòng trắng mắt {side}'
    p = co[m]
    eyes[side] = dict(lo=p.min(0), hi=p.max(0), c=p.mean(0), tip=p[:, 1].min())
sclera_rgba = mean_col(front & is_white & (co[:, 2] > 1.18) & (co[:, 2] < 1.30))

# màu con ngươi: điểm tối trong khung mắt
pm = np.zeros(nv, bool)
for e in eyes.values():
    pm |= front & (co[:, 0] > e['lo'][0]) & (co[:, 0] < e['hi'][0]) & (co[:, 2] > e['lo'][2]) & (co[:, 2] < e['hi'][2] - 0.012) & (lum < 0.3)
pupil_rgba = mean_col(pm) if pm.sum() > 20 else (0.12, 0.11, 0.1, 1)

# --- mũi, miệng ---
nm = front & (np.abs(co[:, 0]) < 0.03) & (co[:, 2] > 1.12) & (co[:, 2] < 1.21)
nose = co[np.where(nm)[0][np.argmin(co[nm, 1])]]
mm = front & (np.abs(co[:, 0]) < 0.06) & (co[:, 2] > 1.03) & (co[:, 2] < nose[2] - 0.015) & (lum < 0.42)
assert mm.sum() > 30, 'Không thấy miệng'
mouth = co[mm].mean(0)
mouth[1] = co[mm][:, 1].min()
skin_rgba = mean_col(front & is_skin & (co[:, 2] > 1.1) & (co[:, 2] < 1.3))

# --- phân mặt lưới: tóc (loang từ đỉnh qua mặt lưới tối) và hốc mắt ---
bm = bmesh.new()
bm.from_mesh(me)
bm.faces.ensure_lookup_table()
bm.verts.ensure_lookup_table()
fv = [[v.index for v in f.verts] for f in bm.faces]
dark_f = np.array([is_dark[i].all() for i in fv])
top = int(np.argmax(co[:, 2]))
seed = next(f.index for f in bm.verts[top].link_faces if dark_f[f.index])
hair = np.zeros(len(bm.faces), bool)
hair[seed] = True
stack = [seed]
while stack:
    f = bm.faces[stack.pop()]
    for e in f.edges:
        for g in e.link_faces:
            if not hair[g.index] and dark_f[g.index]:
                hair[g.index] = True
                stack.append(g.index)
assert 0.05 < hair.mean() < 0.6, f'Tỷ lệ mặt tóc bất thường: {hair.mean():.2f}'

eye_hole = np.zeros(len(bm.faces), bool)
for e in eyes.values():
    lo, hi = e['lo'] - 0.002, e['hi'] + 0.002
    for f in bm.faces:
        idx = fv[f.index]
        p = co[idx].mean(0)
        if lo[0] < p[0] < hi[0] and lo[2] < p[2] < hi[2] and p[1] < -0.15 and not is_skin[idx].any():
            eye_hole[f.index] = True
eye_hole &= ~hair

# tách tóc sang mesh riêng, khoét mắt
hair_bm = bm.copy()
bmesh.ops.delete(hair_bm, geom=[f for f in hair_bm.faces if not hair[f.index]], context='FACES')
hair_me = bpy.data.meshes.new('NAM_TOC')
hair_bm.to_mesh(hair_me)
hair_bm.free()
hair_me.materials.append(me.materials[0])
bmesh.ops.delete(bm, geom=[f for f in bm.faces if hair[f.index] or eye_hole[f.index]], context='FACES')


def in_eye(p):
    return any(e['lo'][0] - 0.01 < p[0] < e['hi'][0] + 0.01 and e['lo'][2] - 0.01 < p[2] < e['hi'][2] + 0.01 for e in eyes.values())


# chân tóc = viền hở còn lại trên đầu (trừ hốc mắt)
rim = np.array([tuple(v.co) for v in bm.verts if v.is_boundary and v.co.z > 1.15 and not in_eye(v.co)])
bm.to_mesh(me)
bm.free()
co = np.empty(len(me.vertices) * 3, np.float32)  # chỉ số đỉnh đã đổi sau khi xóa mặt
me.vertices.foreach_get('co', co)
co = co.reshape(-1, 3)
hair_ob = new_obj('NAM_TOC', hair_me, ob)

# --- da đầu tạm: elip (tâm x=0) khớp chân tóc, đỉnh thấp hơn vòm tóc ~5 cm ---
assert len(rim) > 50, 'Không thấy chân tóc'
hp = np.array([tuple(v.co) for v in hair_me.vertices])
fh = co[(np.abs(co[:, 0]) < 0.02) & (co[:, 2] > 1.30) & (co[:, 2] < 1.36) & (co[:, 1] < 0)]
y_front = fh[:, 1].min() + 0.015  # mặt trán, lùi vào 1,5 cm
y_back = hp[:, 1].max() - 0.05  # bỏ độ dày tóc sau gáy
cz = float(np.median(rim[:, 2]))
c0 = np.array([0.0, (y_front + y_back) / 2, cz])
r0 = np.array([np.abs(rim[:, 0]).max() * 0.88, (y_back - y_front) / 2, np.percentile(hp[:, 2], 95) - 0.05 - cz])  # bỏ lọn xoăn đỉnh
scalp_me = bpy.data.meshes.new('NAM_DA_DAU_TAM')
sb = bmesh.new()
bmesh.ops.create_uvsphere(sb, u_segments=48, v_segments=32, radius=1.0)
bmesh.ops.delete(sb, geom=[v for v in sb.verts if v.co.z < -0.7], context='VERTS')
for v in sb.verts:
    v.co = Vector(c0 + r0 * np.array(v.co))
sb.to_mesh(scalp_me)
sb.free()
scalp_me.materials.append(mat('NAM_DA_DAU_TAM', tuple(v * 0.8 for v in skin_rgba[:3]) + (1,)))
for p in scalp_me.polygons:
    p.use_smooth = True
new_obj('NAM_DA_DAU_TAM', scalp_me, ob)

# --- nhãn cầu (lòng trắng cố định) + con ngươi trượt trên bề mặt ---
m_sclera = mat('NAM_LONG_TRANG', sclera_rgba, 0.35)
m_pupil = mat('NAM_CON_NGUOI', pupil_rgba, 0.25)
eye_y = []
for side, e in eyes.items():
    rx = (e['hi'][0] - e['lo'][0]) / 2 + 0.004
    rz = rx * 0.78
    ry = (e['hi'][1] - e['tip']) * 0.95
    cen = Vector(((e['hi'][0] + e['lo'][0]) / 2, e['tip'] + ry + 0.0025, (e['hi'][2] + e['lo'][2]) / 2))
    sm = bpy.data.meshes.new(f'NAM_LONG_TRANG.{side}')
    b = bmesh.new()
    bmesh.ops.create_uvsphere(b, u_segments=40, v_segments=24, radius=1.0)
    bmesh.ops.scale(b, vec=(rx, ry, rz), verts=b.verts)
    b.to_mesh(sm)
    b.free()
    sm.materials.append(m_sclera)
    for p in sm.polygons:
        p.use_smooth = True
    scl = new_obj(f'NAM_LONG_TRANG.{side}', sm, ob)
    scl.location = cen
    pivot = empty(f'NAM_TRUC_MAT.{side}', cen, 0.01, 'ARROWS', ob)
    pr = (e['hi'][0] - e['lo'][0]) * 0.17
    pmesh = bpy.data.meshes.new(f'NAM_CON_NGUOI.{side}')
    b = bmesh.new()
    bmesh.ops.create_circle(b, cap_ends=True, cap_tris=True, segments=32, radius=pr)
    bmesh.ops.rotate(b, cent=(0, 0, 0), matrix=Matrix.Rotation(np.pi / 2, 3, 'X'), verts=b.verts)
    bmesh.ops.subdivide_edges(b, edges=b.edges[:], cuts=2, use_grid_fill=True)
    b.to_mesh(pmesh)
    b.free()
    pmesh.materials.append(m_pupil)
    pup = new_obj(f'NAM_CON_NGUOI.{side}', pmesh, pivot)
    pup.location = (0, -ry, 0)
    sw = pup.modifiers.new('BAM_LONG_TRANG', 'SHRINKWRAP')
    sw.target = scl
    sw.wrap_method = 'NEAREST_SURFACEPOINT'
    sw.wrap_mode = 'OUTSIDE_SURFACE'
    sw.offset = 0.0006
    eyes[side]['pivot'] = pivot
    eye_y.append(cen)
look_at = Vector(((eye_y[0].x + eye_y[1].x) / 2, -0.9, (eye_y[0].z + eye_y[1].z) / 2))
dk_nhin = empty('DK_NHIN', look_at, 0.03, 'CIRCLE', ob)
dk_nhin.rotation_euler = (np.pi / 2, 0, 0)
for e in eyes.values():
    t = e['pivot'].constraints.new('DAMPED_TRACK')
    t.target = dk_nhin
    t.track_axis = 'TRACK_NEGATIVE_Y'

# --- hook mũi, miệng: trọng số mềm theo khoảng cách ---
def hook(name, center, radius, size):
    w = np.clip(1 - np.linalg.norm(co - center, axis=1) / radius, 0, 1)
    w = w * w * (3 - 2 * w)
    w[co[:, 1] > center[1] + radius] = 0
    vg = ob.vertex_groups.new(name=name)
    for i in np.where(w > 0.001)[0]:
        vg.add([int(i)], float(w[i]), 'REPLACE')
    e = empty(f'DK_{name}', Vector(center), size, 'SPHERE', ob)
    mod = ob.modifiers.new(f'HOOK_{name}', 'HOOK')
    mod.object = e
    mod.vertex_group = name
    mod.center = Vector(center)
    mod.matrix_inverse = e.matrix_world.inverted()
    mod.falloff_type = 'NONE'
    return e


hook('MUI', nose, 0.05, 0.012)
hook('MIENG', mouth, 0.055, 0.015)
bpy.context.view_layer.update()
for m in ob.modifiers:
    m.matrix_inverse = m.object.matrix_world.inverted()

# --- nốt ruồi: trên đuôi mày phải nhân vật (-X), bám bề mặt ---
bvh = BVHTree.FromObject(ob, bpy.context.evaluated_depsgraph_get())
mx, mz = eyes['R']['lo'][0] - 0.028, eyes['R']['hi'][2] + 0.07  # ngoài đuôi mày, không đè lên mày tối màu
hit, nrm, _, _ = bvh.ray_cast(Vector((mx, -1.0, mz)), Vector((0, 1, 0)))
assert hit is not None, 'Không chạm mặt khi đặt nốt ruồi'
mole_me = bpy.data.meshes.new('NAM_NOT_RUOI')
b = bmesh.new()
bmesh.ops.create_uvsphere(b, u_segments=16, v_segments=10, radius=1.0)
bmesh.ops.scale(b, vec=(0.0065, 0.0065, 0.0025), verts=b.verts)
b.to_mesh(mole_me)
b.free()
mole_me.materials.append(mat('NAM_NOT_RUOI', (0.08, 0.05, 0.04, 1), 0.45))
for p in mole_me.polygons:
    p.use_smooth = True
mole = new_obj('NAM_NOT_RUOI', mole_me, ob)
mole.location = hit + nrm * 0.0008
mole.rotation_euler = nrm.to_track_quat('Z', 'Y').to_euler()

# --- kiểm tra ---
names = {o.name for o in root.objects}
need = {'NAM_DAU_THAN', 'NAM_TOC', 'NAM_DA_DAU_TAM', 'NAM_NOT_RUOI', 'DK_NHIN', 'DK_MUI', 'DK_MIENG'}
need |= {f'{k}.{s}' for k in ('NAM_LONG_TRANG', 'NAM_CON_NGUOI', 'NAM_TRUC_MAT') for s in 'LR'}
assert need <= names, need - names
assert eyes['L']['c'][0] > 0 > eyes['R']['c'][0] and hit.x < 0
dg = bpy.context.evaluated_depsgraph_get()
pl = bpy.data.objects['NAM_CON_NGUOI.L']
before = pl.evaluated_get(dg).matrix_world.translation.copy()
dk_nhin.location.x += 0.3
bpy.context.view_layer.update()
after = bpy.data.objects['NAM_CON_NGUOI.L'].evaluated_get(bpy.context.evaluated_depsgraph_get()).matrix_world.translation
assert after.x - before.x > 0.005, 'Con ngươi không đi theo DK_NHIN'
dk_nhin.location.x -= 0.3
print(f'elip {c0.round(3)} {r0.round(3)}; tóc {int(hair.sum())} mặt, hốc mắt {int(eye_hole.sum())} mặt, mũi {nose.round(3)}, miệng {mouth.round(3)}, nốt ruồi {tuple(round(v, 3) for v in hit)}')

# --- ảnh kiểm tra (tùy chọn) ---
soi = os.environ.get('SOI_DIR')
if soi:
    L = bpy.data.lights.new('sun', 'SUN')
    L.energy = 4
    lo = bpy.data.objects.new('soi_sun', L)
    sc.collection.objects.link(lo)
    lo.rotation_euler = (1.2, 0, 0.3)
    cam = bpy.data.cameras.new('soi_cam')
    cam.lens = 85
    co_ = bpy.data.objects.new('soi_cam', cam)
    sc.collection.objects.link(co_)
    sc.camera = co_
    sc.render.resolution_x = sc.render.resolution_y = 512

    def shot(name, loc, aim):
        co_.location = loc
        co_.rotation_euler = (Vector(aim) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = f'{soi}/{name}.png'
        bpy.ops.render.render(write_still=True)

    shot('1_goc', (0, -1.6, 1.30), (0, 0, 1.30))
    dk_nhin.location.x += 0.35
    dk_nhin.location.z += 0.12
    m_ = bpy.data.objects['DK_MUI']
    m_.location.x += 0.015
    m_.scale = (1.3, 1.3, 1.3)
    k_ = bpy.data.objects['DK_MIENG']
    k_.location.z -= 0.008
    k_.scale = (1.4, 1, 1.5)
    shot('2_dieu_khien', (0, -1.6, 1.30), (0, 0, 1.30))
    shot('4_sau_tren', (-0.8, 1.2, 2.3), (0, 0, 1.45))
    hair_ob.hide_render = True
    shot('3_bo_toc', (0.9, -1.3, 1.45), (0, 0, 1.40))
    raise SystemExit(0)  # chế độ soi không lưu file

for o in sc.objects:
    o.select_set(False)
ob.select_set(True)
bpy.context.view_layer.objects.active = ob
sc['ma_asset'] = 'NAM-TACH-BO-PHAN-THU-001'
sc['nguon'] = 'nhan-vat-goc.blend (NHAN-VAT-GOC-001), chỉ LOD0'
sc['trang_thai'] = 'Bản thử: tóc/mắt/con ngươi/nốt ruồi tách object; mũi, miệng dùng hook. Chưa retopology, chưa rig thân.'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT), compress=True)
# trỏ texture về nguon/ của file gốc thay vì đóng gói lại, tránh nhân đôi dung lượng
for im in bpy.data.images:
    if im.packed_file:
        name = Path(im.filepath.replace('\\', '/')).name
        assert (SRC.parent / 'nguon' / name).is_file(), name
        im.unpack(method='REMOVE')
        im.filepath = '//../nhan-vat-goc/nguon/' + name
        im.reload()
        assert im.size[0] == 2048, name  # đọc size buộc nạp ảnh từ đĩa
bpy.ops.wm.save_as_mainfile(filepath=str(OUT), compress=True)
print('PASS: đã lưu', OUT.name)
