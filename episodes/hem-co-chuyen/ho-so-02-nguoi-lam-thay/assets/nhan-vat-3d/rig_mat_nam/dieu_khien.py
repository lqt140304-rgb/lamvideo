"""Gắn bộ phận, chống xuyên nhãn cầu, bone hàm và các điều khiển hướng nhìn / mở hàm.

Phân công cơ chế (mỗi chuyển động MỘT cơ chế):
  • Mở hàm: bone `jaw` (pivot ở khớp hàm) + vertex group `jaw` chuyển mềm; KHÔNG có shape key mở hàm.
  • Hướng nhìn: xoay nhãn cầu quanh tâm cầu (driver từ look_x/look_y); con ngươi là vật liệu trên nhãn cầu, không dịch riêng.
  • Mí, mày, môi, má: shape key (shape_key.py). Mí còn có modifier Shrinkwrap "ở ngoài" một mặt cầu va chạm (bán kính
    nhãn cầu + KHE_VA_CHAM) để khi phối nhiều key, đỉnh mí không bao giờ lọt vào nhãn cầu.
  • Lông mày, nốt ruồi, ống viền mắt: vật riêng gắn vào da bằng Surface Deform (đi theo shape key, va chạm, hàm).
Điều khiển nằm trên object armature `Nam_Rig`: jaw_open [0, 1], look_x [−1, 1] (+ = sang trái nhân vật), look_y [−1, 1] (+ = lên)."""
import math
import bpy, bmesh
from mathutils import Vector, Matrix
import dung_dau_nam as D
from . import luoi

KHE_VA_CHAM = 0.0010           # m: mặt cầu va chạm = nhãn cầu + 1 mm (tay áo mí 1,3 mm, mép mí 2,5 mm: lúc nghỉ không bị đẩy)
JAW_PIVOT = Vector((0.0, 0.0, 1.170))
JAW_MAX = 0.16                 # rad ở jaw_open = 1 (môi dưới hạ ≈ 3,5 cm, miệng há như mẫu RÕ)
LIEC_NGANG_MM, LIEC_LEN_MM, LIEC_XUONG_MM = 0.020, 0.010, 0.016   # m: quãng con ngươi đi ở |look| = 1
GAN = ['Eyebrow_Rig.L', 'Eyebrow_Rig.R', 'Mole_Rig', 'Vien_Mat.L', 'Vien_Mat.R']


def _ss(a, b, x):
    t = max(0.0, min(1.0, (x - a) / (b - a))); return t * t * (3 - 2 * t)


def gan_bo_phan(r):
    """Surface Deform cho mày, nốt ruồi, ống viền mắt. Bind ở tư thế nghỉ."""
    bpy.context.view_layer.update()
    for ten in GAN:
        ob = bpy.data.objects[ten]
        m = ob.modifiers.get('Bam_da') or ob.modifiers.new('Bam_da', 'SURFACE_DEFORM'); m.target = r.head
        if not m.is_bound:
            with bpy.context.temp_override(object=ob, active_object=ob, selected_objects=[ob]):
                bpy.ops.object.surfacedeform_bind(modifier='Bam_da')
        if not m.is_bound: raise RuntimeError(f'Surface Deform không bind được: {ten}')


def va_cham(r):
    """Mặt cầu va chạm (ẩn) cho từng mắt + Shrinkwrap 'OUTSIDE' trên vùng mí của Head_Rig."""
    me = r.head.data; vung = [x.value for x in me.attributes['vung'].data]   # chép ra: tạo vertex group làm tham chiếu thuộc tính cũ đi
    for k, vz in (('L', (11, 12)), ('R', (21, 22))):
        C, R = r.info[k]['C'], r.info[k]['R']
        ten = f'Va_Cham_Mat.{k}'; ob = bpy.data.objects.get(ten)
        if ob is None:
            bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=96, v_segments=64, radius=R + KHE_VA_CHAM)
            mm = bpy.data.meshes.new(ten); bm.to_mesh(mm); bm.free(); ob = bpy.data.objects.new(ten, mm); r.coll.objects.link(ob)
            ob.location = C; ob.hide_render = True; ob.display_type = 'WIRE'   # KHÔNG hide_set: vật ẩn khỏi view layer không được đánh giá → Shrinkwrap mất tác dụng
        vg = r.head.vertex_groups.get(f'mi_{k}') or r.head.vertex_groups.new(name=f'mi_{k}')
        vg.add([i for i, z in enumerate(vung) if z in vz], 1.0, 'REPLACE')
        m = r.head.modifiers.get(f'Mi_ngoai_cau.{k}') or r.head.modifiers.new(f'Mi_ngoai_cau.{k}', 'SHRINKWRAP')
        m.target = ob; m.wrap_method = 'NEAREST_SURFACEPOINT'; m.wrap_mode = 'OUTSIDE'; m.vertex_group = vg.name; m.offset = 0.0
        ong = bpy.data.objects[f'Vien_Mat.{k}']                        # ống viền mắt (Surface Deform không cứng khi mí đóng)
        mo = ong.modifiers.get('Ngoai_cau') or ong.modifiers.new('Ngoai_cau', 'SHRINKWRAP')
        mo.target = ob; mo.wrap_method = 'NEAREST_SURFACEPOINT'; mo.wrap_mode = 'OUTSIDE'; mo.offset = 0.0


def _trong_so_ham(r):
    """Trọng số hàm cho mọi đỉnh Head_Rig: hàm dưới, cằm, môi dưới = 1, chuyển mềm lên má/khoé, về 0 ở tai và cổ."""
    me = r.head.data; A = {n: [x.value for x in me.attributes[n].data] for n in ('vung', 'vong', 'phia', 't')}
    zm = D.FACE['mouth_z']; out = []
    def chung(co):
        x, y, z = co
        zr = z - (zm - 0.003 * (min(abs(x), 0.03) / 0.030) ** 2)
        s_z = 1.0 - _ss(-0.016, 0.003, zr)
        s_x = 1.0 - _ss(0.075, 0.150, abs(x)); s_y = 1.0 - _ss(-0.030, 0.040, y); s_c = _ss(0.988, 1.040, z)
        return s_z * s_x * s_y * s_c
    def ben(i):
        ph = A['phia'][i]; s = abs(math.sin(A['t'][i])); g = _ss(0.0, 0.35, s)
        return 0.5 + 0.5 * g if ph < 0 else (0.5 - 0.5 * g if ph > 0 else 0.5)
    for v in me.vertices:
        i = v.index; vz = A['vung'][i]; k = A['vong'][i]
        if vz == 31:
            b = (k / luoi.K_MIENG) ** 2; w = (1 - b) * ben(i) + b * chung(v.co)
        elif vz in (32, 33):
            w = ben(i) if A['vong'][i] != -20 else 0.5
        elif vz in (11, 12, 21, 22): w = 0.0
        else: w = chung(v.co)
        out.append(w)
    return out


def xuong_ham(r):
    """Armature `Nam_Rig` với bone `jaw` (dựng đứng tại khớp hàm, roll 0 → trục X cục bộ = X thế giới; xoay + quanh X = mở hàm)."""
    arm = bpy.data.objects.get('Nam_Rig')
    if arm is None:
        ad = bpy.data.armatures.new('Nam_Rig'); arm = bpy.data.objects.new('Nam_Rig', ad); r.coll.objects.link(arm)
        bpy.context.view_layer.objects.active = arm
        with bpy.context.temp_override(active_object=arm, object=arm, selected_objects=[arm]):
            bpy.ops.object.mode_set(mode='EDIT')
            g = ad.edit_bones.new('goc'); g.head = D.C; g.tail = D.C + Vector((0, 0, 0.08)); g.roll = 0.0   # bone gốc đứng yên
            b = ad.edit_bones.new('jaw'); b.head = JAW_PIVOT; b.tail = JAW_PIVOT + Vector((0, 0, 0.05)); b.roll = 0.0; b.parent = g
            bpy.ops.object.mode_set(mode='OBJECT')
        arm.pose.bones['jaw'].rotation_mode = 'XYZ'; arm.show_in_front = True
    r.arm = arm
    # Armature CHUẨN HOÁ trọng số theo tổng các bone: đỉnh chỉ có trọng số hàm nhỏ sẽ bị xoay TRỌN theo hàm.
    # Vì vậy phần bù (1 − w) gán cho bone gốc đứng yên để tổng luôn bằng 1.
    vg = r.head.vertex_groups.get('jaw') or r.head.vertex_groups.new(name='jaw')
    vgg = r.head.vertex_groups.get('goc') or r.head.vertex_groups.new(name='goc')
    for i, w in enumerate(_trong_so_ham(r)):
        if w > 1e-4: vg.add([i], w, 'REPLACE'); vgg.add([i], 1.0 - w, 'REPLACE')
        else:
            vg.remove([i])
            try: vgg.remove([i])
            except RuntimeError: pass
    m = r.head.modifiers.get('Ham') or r.head.modifiers.new('Ham', 'ARMATURE'); m.object = arm; m.use_vertex_groups = True; m.use_bone_envelopes = False
    for ten in ('Rang_Duoi', 'Luoi'):
        ob = bpy.data.objects[ten]; g = ob.vertex_groups.get('jaw') or ob.vertex_groups.new(name='jaw'); g.add([v.index for v in ob.data.vertices], 1.0, 'REPLACE')
        mm = ob.modifiers.get('Ham') or ob.modifiers.new('Ham', 'ARMATURE'); mm.object = arm
    return arm


def _driver(id_, duong, chi_so, bt, bien):
    if id_.animation_data:
        for fc in [f for f in id_.animation_data.drivers if f.data_path == duong and f.array_index == chi_so]: id_.animation_data.drivers.remove(fc)
    drv = id_.driver_add(duong, chi_so).driver; drv.type = 'SCRIPTED'
    for ten, (doi, dp) in bien.items():
        v = drv.variables.new(); v.name = ten; v.type = 'SINGLE_PROP'; v.targets[0].id_type = 'OBJECT'; v.targets[0].id = doi; v.targets[0].data_path = dp
    drv.expression = bt


def dieu_khien(r):
    arm = r.arm
    for p, lo, hi in (('jaw_open', 0.0, 1.0), ('look_x', -1.0, 1.0), ('look_y', -1.0, 1.0)):
        if p not in arm: arm[p] = 0.0
        ui = arm.id_properties_ui(p); ui.update(min=lo, max=hi, soft_min=lo, soft_max=hi, description={'jaw_open': 'Mở hàm 0–1', 'look_x': 'Liếc: + sang trái nhân vật', 'look_y': 'Liếc: + lên'}[p])
    _driver(arm, 'pose.bones["jaw"].rotation_euler', 0, f'j*{JAW_MAX}', {'j': (arm, '["jaw_open"]')})
    for k in 'LR':
        ob = r.mat[k]; R = r.info[k]['R']; ob.rotation_mode = 'XYZ'
        ax = math.asin(LIEC_NGANG_MM / R); up = math.asin(LIEC_LEN_MM / R); dn = math.asin(LIEC_XUONG_MM / R)
        _driver(ob, 'rotation_euler', 2, f'x*{ax:.6f}', {'x': (arm, '["look_x"]')})
        _driver(ob, 'rotation_euler', 0, f'-({up:.6f}*max(y,0)+{dn:.6f}*min(y,0))', {'y': (arm, '["look_y"]')})
    bpy.context.view_layer.update()
