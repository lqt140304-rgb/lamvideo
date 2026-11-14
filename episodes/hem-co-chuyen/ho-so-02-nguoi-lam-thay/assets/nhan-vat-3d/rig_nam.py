"""NAM — RIG cơ bản (Blender bpy 5.x) cho thân nhẵn v2.x của `dung_than_nam.py` + đầu/tóc của `dung_dau_nam.py`.

Chạy:  python rig_nam.py --blend Nam_rig.blend [--test <thư mục ảnh>] [--proxy 0.2]
Armature `Nam_Rig` (đơn vị m, mặt −Y, trái nhân vật = +X ⇒ đuôi .L):
  root → pelvis → spine1 → spine2 → chest → neck → head
  chest → clavicle.L/R → upper_arm → forearm → hand → ngón (index/middle/ring/pinky 2 đốt, thumb 2 đốt)
  pelvis → thigh.L/R → shin.L/R → foot.L/R → toe.L/R
  Điều khiển (không biến dạng): ik_foot.L/R (IK chân: bàn chân + gót), pole_knee.L/R (hướng gối), root.
Trọng số: tự động (bone heat) trên bản decimate của mesh rồi chuyển sang mesh gốc (Data Transfer); vùng từ vòng cổ trở lên ép 100% xương head.
Điều khiển cho animator: thuộc tính `fist` (0–1) trên xương hand.L/R = nắm tay (driver lái 4 ngón + ngón cái); xương brow.L/R (nâng/hạ mày) và eye.L/R (liếc: dời con ngươi) trong nhóm xương `Mat`;
  xương đòn tự nâng theo độ dạng cánh tay (driver); bone collections: Than, Tay, Ngon, Chan_IK, Chan_deform, Mat. Chưa có chớp mắt/mở miệng (chưa có mí/miệng mở trong mesh).
Cụm đầu (Cum_Dau: Head_Base ẩn, mắt, mày, tai, tóc…) làm con của xương head.
Chưa quần áo. Chuyển động chỉ kiểm bằng các dáng thử (--test): xem ảnh để đánh giá, không phải bằng chứng cho mọi chuyển động.
"""
import sys, os, math, argparse, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
from mathutils import Vector, Matrix, Euler
import dung_dau_nam as D
import dung_than_nam as T

KZ = T.KZ


def P(x, y, z): return Vector((x, y, z * KZ))      # toạ độ thân gốc (z trước nén) → thế giới


def bone_table():
    """(tên, cha, đầu, đuôi, deform) — toạ độ lấy từ các bảng ARM/LEG/FINGERS của dung_than_nam.py."""
    B = []
    A = lambda n, par, h, t, d=True: B.append((n, par, h, t, d))
    A('root', None, Vector((0, 0.0, 0.0)), Vector((0, 0.0, 0.10)), False)
    A('pelvis', 'root', P(0, 0.0, 0.50), P(0, 0.0, 0.62))
    A('spine1', 'pelvis', P(0, 0.0, 0.62), P(0, 0.0, 0.74))
    A('spine2', 'spine1', P(0, 0.0, 0.74), P(0, 0.0, 0.86))
    A('chest', 'spine2', P(0, 0.0, 0.86), P(0, -0.004, 0.94))
    n0 = P(0, -0.004, 0.94); n1 = Vector((0, -0.008, T.RING_Z + 0.004)); nm = (n0 + n1) / 2
    A('neck', 'chest', n0, nm)
    A('neck2', 'neck', nm, n1)
    A('head', 'neck2', n1, Vector((0, -0.008, 1.6003)))
    hz0 = T.RING_Z + 0.004
    for s, k in ((1, 'L'), (-1, 'R')):
        hw = lambda x, y, z: Vector((x * T.HEAD_K, y * T.HEAD_K, T.hz(z)))      # toạ độ đầu gốc → thế giới (đầu đã phóng)
        A(f'brow.{k}', 'head', hw(s * 0.082, -0.208, 1.300), hw(s * 0.082, -0.208, 1.335), False)
        A(f'eye.{k}', 'head', hw(s * 0.075, -0.212, 1.227), hw(s * 0.075, -0.212, 1.245), False)
    for s, k in ((1, 'L'), (-1, 'R')):
        X = lambda x: s * x
        A(f'clavicle.{k}', 'chest', P(X(0.020), -0.004, 0.935), P(X(0.140), 0.0, 0.905))
        A(f'upper_arm.{k}', f'clavicle.{k}', P(X(0.150), 0.001, 0.895), P(X(0.203), 0.002, 0.680))
        A(f'forearm.{k}', f'upper_arm.{k}', P(X(0.203), 0.002, 0.680), P(X(0.236), -0.008, 0.545))
        A(f'hand.{k}', f'forearm.{k}', P(X(0.236), -0.008, 0.545), P(X(0.250), -0.013, 0.462))
        x0, y0, z0 = 0.256, -0.013, 0.460
        for nm, (dy, L, r) in zip(('index', 'middle', 'ring', 'pinky'), T.FINGERS):
            p0 = P(X(x0), y0 + dy, z0); p1 = P(X(x0 - 0.0075), y0 + dy - 0.003, z0 - 0.5 * L); p2 = P(X(x0 - 0.022), y0 + dy - 0.008, z0 - L)
            A(f'{nm}1.{k}', f'hand.{k}', p0, p1); A(f'{nm}2.{k}', f'{nm}1.{k}', p1, p2)
        th = T.THUMB
        A(f'thumb1.{k}', f'hand.{k}', P(X(th[0][0]), th[0][1], th[0][2]), P(X(th[1][0]), th[1][1], th[1][2]))
        A(f'thumb2.{k}', f'thumb1.{k}', P(X(th[1][0]), th[1][1], th[1][2]), P(X(th[3][0]), th[3][1], th[3][2]))
        # chân
        A(f'thigh.{k}', 'pelvis', P(X(0.0925), 0.0, 0.600), P(X(0.0925), -0.002, 0.310))
        A(f'shin.{k}', f'thigh.{k}', P(X(0.0925), -0.002, 0.310), P(X(0.0925), 0.004, 0.118))
        A(f'foot.{k}', f'shin.{k}', P(X(0.0925), 0.004, 0.118), P(X(0.1060), -0.100, 0.035))
        A(f'toe.{k}', f'foot.{k}', P(X(0.1060), -0.100, 0.035), P(X(0.1060), -0.190, 0.032))
        # điều khiển
        A(f'ik_foot.{k}', 'root', P(X(0.0925), 0.004, 0.118), P(X(0.1060), -0.100, 0.035), False)   # cùng hướng/độ dài xương foot ⇒ Copy Rotation = đồng nhất ở dáng nghỉ
        A(f'pole_knee.{k}', 'root', Vector((s * 0.0925, -0.45, 0.31 * KZ)), Vector((s * 0.0925, -0.50, 0.31 * KZ)), False)
    return B


def build_armature(sc):
    ad = bpy.data.armatures.new('Nam_Rig'); ob = bpy.data.objects.new('Nam_Rig', ad); sc.collection.objects.link(ob)
    bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.object.mode_set(mode='EDIT')
    eb = ad.edit_bones
    for n, par, h, t, d in bone_table():
        b = eb.new(n); b.head = h; b.tail = t; b.use_deform = d
        if (t - h).length < 1e-4: b.tail = h + Vector((0, 0, 0.01))
    for n, par, h, t, d in bone_table():
        if par:
            eb[n].parent = eb[par]
            if n not in ('pelvis',) and not n.startswith(('ik_', 'pole_', 'thigh')): eb[n].use_connect = (eb[n].head - eb[par].tail).length < 1e-4
    # roll: cạnh hông/cánh tay quay quanh trục dọc — mặc định 0 là đủ cho mô hình tay thả; trục gập khuỷu/gối chọn lúc tạo dáng
    bpy.ops.object.mode_set(mode='OBJECT')
    # ràng buộc IK chân
    bpy.ops.object.mode_set(mode='POSE'); pb = ob.pose.bones
    for k in ('L', 'R'):
        c = pb[f'shin.{k}'].constraints.new('IK'); c.target = ob; c.subtarget = f'ik_foot.{k}'; c.chain_count = 2
        c.pole_target = ob; c.pole_subtarget = f'pole_knee.{k}'; c.pole_angle = math.radians(-90)
        cf = pb[f'foot.{k}'].constraints.new('COPY_ROTATION'); cf.target = ob; cf.subtarget = f'ik_foot.{k}'
        for pn in (f'thigh.{k}', f'shin.{k}'): pb[pn].lock_ik_y = True
    bpy.ops.object.mode_set(mode='OBJECT')
    add_drivers_and_controls(ob)
    return ob


def _world_head(ob, name):
    bpy.context.view_layer.update(); return (ob.matrix_world @ ob.pose.bones[name].matrix).translation.copy()


def add_drivers_and_controls(ob):
    """(1) Vai: xương đòn tự nâng theo độ dạng cánh tay (driver đọc rotation_euler của bắp tay, không tạo vòng phụ thuộc) → nách bớt giãn khi giơ cao.
    (2) Điều khiển nắm tay: thuộc tính `fist` (0–1) trên xương hand.L/R lái các đốt ngón. (3) Nhóm xương (bone collections) cho animator."""
    pb = ob.pose.bones
    for k, sx in (('L', 1.0), ('R', -1.0)):
        # chiều nâng của xương đòn (quanh trục nào, dấu nào) — đo thực nghiệm trên rig
        zs = {}
        for ax in 'XYZ':
            pbc = pb[f'clavicle.{k}']; pbc.rotation_euler = (0, 0, 0); b0 = _world_head(ob, f'upper_arm.{k}').z; e = [0, 0, 0]; e['XYZ'.index(ax)] = 0.2; pbc.rotation_euler = e
            zs[ax] = _world_head(ob, f'upper_arm.{k}').z - b0; pbc.rotation_euler = (0, 0, 0)
        ax_c = max(zs, key=lambda a_: abs(zs[a_])); lc = 1.0 if zs[ax_c] > 0 else -1.0
        # chiều dạng cánh tay: xoay Z dương làm khuỷu đi ra ngoài (|x| tăng) hay vào trong
        pbu = pb[f'upper_arm.{k}']; pbu.rotation_euler = (0, 0, 0); x0 = abs(_world_head(ob, f'forearm.{k}').x); pbu.rotation_euler = (0, 0, 0.3); x1 = abs(_world_head(ob, f'forearm.{k}').x); pbu.rotation_euler = (0, 0, 0)
        up_s = 1.0 if x1 > x0 else -1.0
        d = pb[f'clavicle.{k}'].driver_add('rotation_euler', 'XYZ'.index(ax_c)).driver; d.type = 'SCRIPTED'
        v = d.variables.new(); v.name = 'v'; v.type = 'SINGLE_PROP'; v.targets[0].id = ob; v.targets[0].data_path = f'pose.bones["upper_arm.{k}"].rotation_euler[2]'
        d.expression = f'{lc * 0.15:.3f}*min(2.0, max(0, {up_s:.0f}*v))'      # vai nâng 15% độ dạng của tay, tối đa ~17° (chỉ khi dạng lên, không khi hạ)
        print(f'    vai {k}: xương đòn quay {ax_c} dấu {lc:+.0f}, tay dạng theo Z dấu {up_s:+.0f}')
        # nắm tay
        hb = pb[f'hand.{k}']; hb['fist'] = 0.0; hb['fist_min'] = 0.0
        try:
            hb.id_properties_ui('fist').update(min=0.0, max=1.0, soft_min=0.0, soft_max=1.0, description='Nắm tay 0–1')
        except Exception: pass
        sgn = 1.0 if k == 'L' else -1.0       # đo trên rig: quay quanh Z cục bộ (+ cho tay trái, − cho tay phải) mới gập ngón VÀO lòng bàn tay; quanh X là bẻ ngón ra sau
        for nm in ('index', 'middle', 'ring', 'pinky'):
            for i, deg in ((1, 70), (2, 85)):
                d = pb[f'{nm}{i}.{k}'].driver_add('rotation_euler', 2).driver; d.type = 'SCRIPTED'
                v = d.variables.new(); v.name = 'f'; v.type = 'SINGLE_PROP'; v.targets[0].id = ob; v.targets[0].data_path = f'pose.bones["hand.{k}"]["fist"]'
                d.expression = f'f*{sgn * math.radians(deg):.4f}'
        for i, deg in ((1, 25), (2, 35)):
            d = pb[f'thumb{i}.{k}'].driver_add('rotation_euler', 2).driver; d.type = 'SCRIPTED'
            v = d.variables.new(); v.name = 'f'; v.type = 'SINGLE_PROP'; v.targets[0].id = ob; v.targets[0].data_path = f'pose.bones["hand.{k}"]["fist"]'
            d.expression = f'f*{sgn * math.radians(deg):.4f}'
    # nhóm xương
    ad = ob.data; groups = {'Than': ('pelvis', 'spine1', 'spine2', 'chest', 'neck', 'neck2', 'head'), 'Tay': tuple(f'{n}.{k}' for k in 'LR' for n in ('clavicle', 'upper_arm', 'forearm', 'hand')),
                            'Ngon': tuple(f'{n}{i}.{k}' for k in 'LR' for n in ('index', 'middle', 'ring', 'pinky', 'thumb') for i in (1, 2)), 'Chan_IK': tuple(f'{n}.{k}' for k in 'LR' for n in ('ik_foot', 'pole_knee')) + ('root',),
                            'Chan_deform': tuple(f'{n}.{k}' for k in 'LR' for n in ('thigh', 'shin', 'foot', 'toe')), 'Mat': tuple(f'{n}.{k}' for k in 'LR' for n in ('brow', 'eye'))}
    try:
        for nm, bones in groups.items():
            c = ad.collections.new(nm)
            for b in bones: c.assign(ad.bones[b])
    except Exception as e:
        print('    (không tạo được bone collections:', e, ')')
    for b in ad.bones:
        if b.name.startswith(('pole_',)): b.hide = False


def bind_weights(sc, arm, asm, proxy_ratio):
    """Bone heat trên bản decimate rồi chuyển sang mesh gốc."""
    t0 = time.time()
    me = asm.data.copy(); px = bpy.data.objects.new('proxy_w', me); sc.collection.objects.link(px)
    d = px.modifiers.new('Dec', 'DECIMATE'); d.ratio = proxy_ratio
    bpy.context.view_layer.objects.active = px
    bpy.ops.object.select_all(action='DESELECT'); px.select_set(True); bpy.ops.object.modifier_apply(modifier=d.name)
    print(f'    proxy: {len(px.data.vertices)} đỉnh')
    bpy.ops.object.select_all(action='DESELECT'); px.select_set(True); arm.select_set(True); bpy.context.view_layer.objects.active = arm
    bpy.ops.object.parent_set(type='ARMATURE_AUTO')
    print(f'    bone heat xong sau {time.time() - t0:.1f}s; nhóm đỉnh proxy: {len(px.vertex_groups)}')
    # chuyển trọng số sang mesh gốc
    for vg in px.vertex_groups:
        if vg.name not in asm.vertex_groups: asm.vertex_groups.new(name=vg.name)
    dt = asm.modifiers.new('DT', 'DATA_TRANSFER'); dt.object = px; dt.use_vert_data = True; dt.data_types_verts = {'VGROUP_WEIGHTS'}
    dt.vert_mapping = 'POLYINTERP_NEAREST'; dt.layers_vgroup_select_src = 'ALL'; dt.layers_vgroup_select_dst = 'NAME'
    bpy.context.view_layer.objects.active = asm; bpy.ops.object.select_all(action='DESELECT'); asm.select_set(True)
    bpy.ops.object.modifier_apply(modifier=dt.name)
    bpy.data.objects.remove(px, do_unlink=True)
    print(f'    chuyển trọng số sang mesh gốc xong sau {time.time() - t0:.1f}s')
    # đầu = 100% xương head; làm sạch
    gh = asm.vertex_groups.get('head'); ztop = T.RING_Z + 0.012
    others = [g for g in asm.vertex_groups if g.name != 'head']
    for v in asm.data.vertices:
        if v.co.z > ztop:
            for g in others:
                try: g.remove([v.index])
                except RuntimeError: pass
            gh.add([v.index], 1.0, 'REPLACE')
    bpy.ops.object.mode_set(mode='OBJECT')
    smooth_weights(asm, iters=40, alpha=0.5, head_z=ztop)
    m = asm.modifiers.new('Armature', 'ARMATURE'); m.object = arm; asm.parent = arm
    add_corrective_smooth(asm)
    for g in list(asm.vertex_groups):
        if g.name not in arm.data.bones: asm.vertex_groups.remove(g)


def add_corrective_smooth(asm):
    """Corrective Smooth sau Armature (tham chiếu ORCO): làm mượt phần da bị kéo giãn do biến dạng ở nách–vai, háng–đùi (250 vòng) và kẽ ngón/bàn tay (60 vòng, nhẹ để không làm mất hình ngón)."""
    import numpy as np
    me = asm.data; n = len(me.vertices); co = np.zeros(n * 3, dtype=np.float32); me.vertices.foreach_get('co', co); xs = np.abs(co[0::3]); zs = co[2::3]
    body = ((zs > 0.64) & (zs < 0.92) & (xs > 0.05) & (xs < 0.22)) | ((zs > 0.26) & (zs < 0.58) & (xs < 0.16)); hand = (zs > 0.30) & (zs < 0.58) & (xs > 0.19)
    for nm, reg, it in (('corr_body', body, 250), ('corr_hand', hand, 60)):
        vg = asm.vertex_groups.new(name=nm)
        for i in np.nonzero(reg)[0].tolist(): vg.add([i], 1.0, 'REPLACE')
        m = asm.modifiers.new('CS_' + nm, 'CORRECTIVE_SMOOTH'); m.factor = 1.0; m.iterations = it; m.smooth_type = 'LENGTH_WEIGHTED'; m.rest_source = 'ORCO'; m.vertex_group = nm


def smooth_weights(asm, iters, alpha, head_z):
    """Làm mượt trọng số theo kề đỉnh bằng numpy (khuếch tán Laplace), giữ nguyên vùng đầu = 1,0 xương head; chuẩn hoá lại (không giới hạn số xương)."""
    import numpy as np
    me = asm.data; nv = len(me.vertices); names = [g.name for g in asm.vertex_groups]; ng = len(names); gi = {g.index: i for i, g in enumerate(asm.vertex_groups)}
    W = np.zeros((nv, ng), dtype=np.float32)
    for v in me.vertices:
        for g in v.groups: W[v.index, gi[g.group]] = g.weight
    ed = np.zeros(len(me.edges) * 2, dtype=np.int32); me.edges.foreach_get('vertices', ed); ea, eb = ed[0::2], ed[1::2]
    deg = np.bincount(np.concatenate([ea, eb]), minlength=nv).astype(np.float32).clip(min=1)
    co = np.zeros(nv * 3, dtype=np.float32); me.vertices.foreach_get('co', co); zs = co[2::3]
    free = zs <= head_z; hi = names.index('head')
    xs = np.abs(co[0::3]); ys = co[1::3]
    arm_names = ('clavicle', 'upper_arm', 'forearm', 'hand', 'index', 'middle', 'ring', 'pinky', 'thumb'); leg_names = ('thigh', 'shin', 'foot', 'toe')
    arm_i = [i for i, n in enumerate(names) if n.startswith(arm_names)]; leg_i = [i for i, n in enumerate(names) if n.startswith(leg_names)]; clav_i = [i for i, n in enumerate(names) if n.startswith('clavicle')]
    sp2 = names.index('spine2'); pel = names.index('pelvis')

    sm = lambda e0, e1, x: np.clip((x - e0) / (e1 - e0), 0.0, 1.0) ** 2 * (3 - 2 * np.clip((x - e0) / (e1 - e0), 0.0, 1.0))
    # mặt nạ mềm theo giải phẫu (nhân, không cắt cứng): chân không với lên thân trên hông; tay không với vào giữa thân (trừ xương đòn gần vai)
    f_leg = sm(0.68, 0.58, zs).astype(np.float32)                                    # =1 dưới 0,58; =0 trên 0,68
    f_arm_core = (1 - (sm(0.085, 0.125, xs) * 0 + 1 - sm(0.085, 0.125, xs)) * (1 - sm(0.84, 0.76, zs) * 0)).astype(np.float32)   # =sm(x): 0 ở giữa thân, 1 khi |x| ≥ 0,125
    f_arm_core = np.maximum(sm(0.125, 0.15, xs), sm(0.80, 0.86, zs) * sm(0.085, 0.125, xs)).astype(np.float32); f_clav = np.maximum(f_arm_core, sm(0.78, 0.86, zs)).astype(np.float32)

    xr = co[0::3]; fL = sm(-0.012, 0.012, xr).astype(np.float32); fLc = sm(-0.06, 0.06, xr).astype(np.float32)   # =1 bên trái nhân vật (+X)
    side_i = {i: ('L' if n.endswith('.L') else 'R') for i, n in enumerate(names) if n.endswith(('.L', '.R'))}
    fing = {i: T.FINGERS['index middle ring pinky'.split().index(n[:-3] if n[:-3] in ('index', 'middle', 'ring', 'pinky') else n[:-4])][0] for i, n in enumerate(names) if n.startswith(('index', 'middle', 'ring', 'pinky'))}
    palm_z = 0.462 * KZ

    def rules():
        for i, sd in side_i.items():
            f = (fLc if names[i].startswith('clavicle') else fL); W[:, i] *= (f if sd == 'L' else 1 - f)       # bên nào xương bên đó: chân/tay trái không kéo da bên phải
        for i, dy in fing.items():
            yc = -0.013 + dy; fy = sm(0.032, 0.019, np.abs(ys - yc)); fz = np.where(zs < palm_z + 0.004, fy, 1.0); W[:, i] *= fz.astype(np.float32)   # mỗi ngón chỉ kéo da quanh ngón đó
        W[:, leg_i] *= f_leg[:, None]
        for i in arm_i: W[:, i] *= (f_clav if i in clav_i else f_arm_core)
        z0 = W.sum(axis=1) < 1e-6; W[z0, sp2] = 1.0

    for it in range(iters):
        acc = np.zeros_like(W)
        for j in range(ng):
            acc[:, j] = np.bincount(ea, weights=W[eb, j], minlength=nv) + np.bincount(eb, weights=W[ea, j], minlength=nv)
        W[free] = (1 - alpha) * W[free] + alpha * (acc[free] / deg[free, None])
    W[W < 0.04] = 0.0; W[free & (W.sum(axis=1) < 1e-6), sp2] = 1.0
    for it in range(14):   # làm mượt lại sau khi cắt trọng số nhỏ để không để lại bước nhảy
        acc = np.zeros_like(W)
        for j in range(ng):
            acc[:, j] = np.bincount(ea, weights=W[eb, j], minlength=nv) + np.bincount(eb, weights=W[ea, j], minlength=nv)
        W[free] = 0.5 * W[free] + 0.5 * (acc[free] / deg[free, None])
    reg = free & (zs > 0.52) & (xs < 0.15)          # cả thân trên (hông→cổ): làm mượt thêm để xoá nếp chéo trên ngực khi tạo dáng
    for it in range(160):
        acc = np.zeros_like(W)
        for j in range(ng):
            acc[:, j] = np.bincount(ea, weights=W[eb, j], minlength=nv) + np.bincount(eb, weights=W[ea, j], minlength=nv)
        W[reg] = 0.4 * W[reg] + 0.6 * (acc[reg] / deg[reg, None])
    # bàn tay: làm mượt dọc từng ngón (có áp lại luật tách ngón) để khi nắm không giãn ở kẽ/đầu ngón
    hand = free & (zs < 0.56 * KZ + 0.05) & (xs > 0.19)
    for it in range(120):
        acc = np.zeros_like(W)
        for j in range(ng):
            acc[:, j] = np.bincount(ea, weights=W[eb, j], minlength=nv) + np.bincount(eb, weights=W[ea, j], minlength=nv)
        W[hand] = 0.5 * W[hand] + 0.5 * (acc[hand] / deg[hand, None])
        for i, dy in fing.items():                  # idempotent: xoá trọng số ngón nào lan sang ngón khác (không nhân cộng dồn)
            yc = -0.013 + dy; far = (np.abs(ys - yc) > 0.030) & (zs < palm_z + 0.004) & hand; W[far, i] = 0.0
        sh = W[hand].sum(axis=1, keepdims=True); W[hand] = np.where(sh > 1e-6, W[hand] / np.maximum(sh, 1e-6), W[hand])
    # ngón cái ↔ ngón trỏ: đỉnh gần đường ngón cái hơn thì bỏ trọng số các ngón dài (và ngược lại) → khi nắm tay ngón cái không bị ngón trỏ kéo thành móc
    def seg_dist(P, pts):
        d = np.full(len(P), 9.0)
        for a_, b_ in zip(pts, pts[1:]):
            a_ = np.array(a_); b_ = np.array(b_); ab = b_ - a_; t_ = np.clip(((P - a_) @ ab) / max(ab @ ab, 1e-12), 0, 1); d = np.minimum(d, np.linalg.norm(P - (a_ + t_[:, None] * ab), axis=1))
        return d
    Ph = np.stack([xs, ys, zs], axis=1)[hand]
    th_pts = [(t[0], t[1], t[2] * KZ) for t in T.THUMB]
    dy_i = T.FINGERS[0][0]; L_i = T.FINGERS[0][1]; ix_pts = [(0.256, -0.013 + dy_i, 0.460 * KZ), (0.256 - 0.0075, -0.013 + dy_i - 0.003, (0.460 - 0.5 * L_i) * KZ), (0.256 - 0.022, -0.013 + dy_i - 0.008, (0.460 - L_i) * KZ)]
    d_th = seg_dist(Ph, th_pts); d_ix = seg_dist(Ph, ix_pts)
    th_i = [i for i, n in enumerate(names) if n.startswith('thumb')]; fl_i = [i for i, n in enumerate(names) if n.startswith(('index', 'middle', 'ring', 'pinky'))]
    Wh = W[hand]; near_th = (d_th < d_ix - 0.004) & (d_th < 0.035); near_ix = (d_ix < d_th - 0.004) & (zs[hand] < 0.47 * KZ)
    Wh[np.ix_(near_th, fl_i)] = 0.0; Wh[np.ix_(near_ix, th_i)] = 0.0
    sh = Wh.sum(axis=1, keepdims=True); Wh = np.where(sh > 1e-6, Wh / np.maximum(sh, 1e-6), Wh); W[hand] = Wh
    print(f'    ngón cái: {int(near_th.sum())} đỉnh chỉ theo ngón cái/bàn tay, {int(near_ix.sum())} đỉnh ngón trỏ bỏ trọng số ngón cái')
    # cổ: đầu chuyển dần từ chân cổ lên (thay vì nhảy trong vài mm) → cúi/ngửa/quay đầu không giãn ở chân cổ
    ch_i, n1_i, n2_i = names.index('chest'), names.index('neck'), names.index('neck2'); z0, z1 = T.RING_Z - 0.052, head_z
    band = free & (zs > z0 - 0.02) & (xs < 0.12)
    t = np.clip((zs[band] - z0) / (z1 - z0), 0.0, 1.0); hat = lambda a_, b_, c_: np.clip(np.minimum((t - a_) / (b_ - a_), (c_ - t) / (c_ - b_)), 0.0, 1.0)
    Wexp = np.zeros((len(t), ng), dtype=np.float32); sm_t = lambda x: x * x * (3 - 2 * x)
    Wexp[:, ch_i] = np.where(t < 1 / 3, sm_t(np.clip(1 - 3 * t, 0, 1)), 0.0); Wexp[:, n1_i] = np.where(t < 1 / 3, sm_t(np.clip(3 * t, 0, 1)), sm_t(np.clip(2 - 3 * t, 0, 1)))
    Wexp[:, n2_i] = np.where(t < 2 / 3, sm_t(np.clip(3 * t - 1, 0, 1)), sm_t(np.clip(3 - 3 * t, 0, 1))) * (t > 1 / 3); Wexp[:, hi] = np.where(t > 2 / 3, sm_t(np.clip(3 * t - 2, 0, 1)), 0.0)
    Wexp /= Wexp.sum(axis=1, keepdims=True).clip(min=1e-6)
    fx = ((1 - sm(0.070, 0.105, xs[band])) * np.clip((zs[band] - (z0 - 0.02)) / 0.02, 0, 1)).astype(np.float32)[:, None]     # chỉ vùng cổ; tắt dần về phía vai
    W[band] = (1 - fx) * W[band] + fx * Wexp
    for it in range(30):     # làm mượt lại chỗ vừa pha trộn
        acc = np.zeros_like(W)
        for j in range(ng):
            acc[:, j] = np.bincount(ea, weights=W[eb, j], minlength=nv) + np.bincount(eb, weights=W[ea, j], minlength=nv)
        W[band] = 0.5 * W[band] + 0.5 * (acc[band] / deg[band, None])
    armpit = free & (xs > 0.09) & (xs < 0.19) & (zs > 0.66) & (zs < 0.88)
    for it in range(120):
        acc = np.zeros_like(W)
        for j in range(ng):
            acc[:, j] = np.bincount(ea, weights=W[eb, j], minlength=nv) + np.bincount(eb, weights=W[ea, j], minlength=nv)
        W[armpit] = 0.4 * W[armpit] + 0.6 * (acc[armpit] / deg[armpit, None])
    crotch = free & (zs > 0.28) & (zs < 0.56) & (xs < 0.14)      # háng–đùi trên: làm mượt thêm để ngồi/gập hông không kéo giãn
    for it in range(120):
        acc = np.zeros_like(W)
        for j in range(ng):
            acc[:, j] = np.bincount(ea, weights=W[eb, j], minlength=nv) + np.bincount(eb, weights=W[ea, j], minlength=nv)
        W[crotch] = 0.4 * W[crotch] + 0.6 * (acc[crotch] / deg[crotch, None])
    # da ngực sát nách (|x| 0,05–0,12, z 0,62–0,84) còn dính ~70% xương bắp tay nên bị kéo vút lên thành nếp bóp chữ V khi giơ tay cao → trả 85% phần đó về xương ngực rồi khuếch tán nhẹ cho dàn đều
    ch_i = names.index('chest')
    m_ch = (sm(0.03, 0.05, xs) * sm(0.14, 0.12, xs) * sm(0.59, 0.62, zs) * sm(0.87, 0.84, zs)).astype(np.float32)
    for k_, sg in (('L', 1.0), ('R', -1.0)):
        ua = names.index(f'upper_arm.{k_}'); mv = W[:, ua] * m_ch * (xr * sg > 0) * 0.85; W[:, ua] -= mv; W[:, ch_i] += mv
    mz = (sm(0.00, 0.03, xs) * sm(0.17, 0.14, xs) * sm(0.56, 0.59, zs) * sm(0.90, 0.87, zs)).astype(np.float32)[:, None] * 0.6
    for it in range(80):
        acc = np.zeros_like(W)
        for j in range(ng):
            acc[:, j] = np.bincount(ea, weights=W[eb, j], minlength=nv) + np.bincount(eb, weights=W[ea, j], minlength=nv)
        W = (1 - mz) * W + mz * (acc / deg[:, None])
    W[~free] = 0; W[~free, hi] = 1.0
    # tối đa 4 xương, chuẩn hoá
    W[W < 0.002] = 0.0; W /= W.sum(axis=1, keepdims=True).clip(min=1e-9)   # KHÔNG ép tối đa 4 xương: cắt top-4 trên trường trơn tạo bước nhảy → nứt khi tạo dáng
    for g in asm.vertex_groups: g.remove(list(range(nv)))
    nz = np.nonzero(W > 1e-4)
    for vi, gj in zip(nz[0].tolist(), nz[1].tolist()): asm.vertex_groups[gj].add([vi], float(W[vi, gj]), 'REPLACE')
    print(f'    làm mượt trọng số: {iters} vòng, {len(nz[0]) / nv:.2f} xương/đỉnh')


def attach_face_controls(arm):
    """Mày và con ngươi bám vào xương brow/eye (cứng, giữ nguyên toạ độ thế giới ở dáng nghỉ): nâng/hạ mày, liếc mắt bằng cách dời xương."""
    for obj_name, bone in (('Eyebrow.L', 'brow.L'), ('Eyebrow.R', 'brow.R'), ('Pupil.L', 'eye.L'), ('Pupil.R', 'eye.R')):
        o = bpy.data.objects.get(obj_name)
        if not o: print('    (không thấy đối tượng', obj_name, ')'); continue
        bpy.context.view_layer.update(); w = o.matrix_world.copy(); b = arm.data.bones[bone]
        o.parent = arm; o.parent_type = 'BONE'; o.parent_bone = bone; o.matrix_parent_inverse = (arm.matrix_world @ b.matrix_local @ Matrix.Translation((0, b.length, 0))).inverted(); o.matrix_basis = w


def attach_head(arm, sc):
    """Cụm đầu làm con của xương head (giữ nguyên toạ độ thế giới ở dáng nghỉ)."""
    em = bpy.data.objects['Cum_Dau']; b = arm.data.bones['head']
    em.parent = arm; em.parent_type = 'BONE'; em.parent_bone = 'head'
    pm = arm.matrix_world @ b.matrix_local @ Matrix.Translation((0, b.length, 0)); em.matrix_parent_inverse = pm.inverted()


# Quy ước trục cục bộ của xương thân/cổ/đầu (xương hướng lên): X = gập trước/sau, Y = XOAY quanh trục dọc (quay người/quay đầu), Z = nghiêng sang bên.
# Xương tay: Z = dạng ra/khép vào, X = đưa trước/sau, Y = xoay dọc cánh tay.
POSES = {
    'nghi': {},
    'tay_nang_45': {'upper_arm.L': ('Z', -45), 'upper_arm.R': ('Z', 45)},
    'tay_truoc': {'upper_arm.L': ('X', -80), 'upper_arm.R': ('X', -80), 'forearm.L': ('X', -20), 'forearm.R': ('X', -20)},
    'khuyu_gap': {'upper_arm.L': ('X', -30), 'forearm.L': ('X', -90), 'upper_arm.R': ('X', -30), 'forearm.R': ('X', -90)},
    'cui_dau': {'neck': ('X', 10), 'neck2': ('X', 10), 'head': ('X', 15), 'spine1': ('X', 18), 'spine2': ('X', 12)},
    'buoc_chan': 'step',
    'xoay_thun': {'spine1': ('Y', 18), 'spine2': ('Y', 18), 'chest': ('Y', 14)},
    'nghieng_than': {'spine1': ('Z', 12), 'spine2': ('Z', 12), 'chest': ('Z', 8), 'neck': ('Z', 6)},
    'gap_hong': {'pelvis': ('X', 40), 'spine1': ('X', -12)},
    'quay_vai': {'upper_arm.L': ('Y', 70), 'upper_arm.R': ('Y', -70)},
    'nam_tay': {**{f'{n}{i}.{k}': ('Z', (1 if k == 'L' else -1) * (45 if i == 1 else 55)) for n in ('index', 'middle', 'ring', 'pinky') for i in (1, 2) for k in ('L', 'R')}},   # nắm hờ (đặt tay trực tiếp, không qua driver)
    'quay_dau': {'head': ('Y', 30), 'neck2': ('Y', 10), 'neck': ('Y', 10)},
    'nghieng_dau': {'head': ('Z', 20), 'neck2': ('Z', 8), 'neck': ('Z', 6)},
    'ngua_dau': {'head': ('X', -25), 'neck2': ('X', -5), 'neck': ('X', -5)},
    'ngoi': 'sit',
    'gap_hong_sau': {'pelvis': ('X', 75), 'spine1': ('X', 12)},
    'xoay_thun_manh': {'spine1': ('Y', 30), 'spine2': ('Y', 30), 'chest': ('Y', 20), 'neck': ('Y', 10)},
    'nam_tay_chat': 'fist',
    'gio_tay_cao': {'upper_arm.L': ('Z', -150), 'upper_arm.R': ('Z', 150)},
}


def apply_pose(arm, name):
    pb = arm.pose.bones
    for b in pb:
        b.rotation_mode = 'XYZ'; b.location = (0, 0, 0)
        if not (b.name.startswith('clavicle') or b.name.startswith(('index', 'middle', 'ring', 'pinky', 'thumb'))): b.rotation_euler = (0, 0, 0)    # xương đòn/ngón do driver lái
        if 'fist' in b.keys(): b['fist'] = 0.0
    spec = POSES[name]
    if spec == 'fist':
        for k in 'LR': pb[f'hand.{k}']['fist'] = 1.0
        bpy.context.view_layer.update(); return
    if spec == 'sit':
        pb['pelvis'].matrix = Matrix.Translation((0, 0.22, -0.255)) @ pb['pelvis'].bone.matrix_local; bpy.context.view_layer.update()   # hông lùi ra sau + hạ ngang mặt ghế (~0,31 m), đùi ngang, cẳng chân thẳng đứng
        for k in 'LR':
            pb[f'ik_foot.{k}'].location = (0, 0, 0)
            pb[f'upper_arm.{k}'].rotation_euler = (math.radians(-28), 0, 0); pb[f'forearm.{k}'].rotation_euler = (math.radians(-62), 0, 0)   # bàn tay đặt lên đùi
        bpy.context.view_layer.update(); return
    if spec == 'step':
        pb['ik_foot.L'].location = (0, -0.10, 0.06)        # chân trái bước ra trước + nhấc
        pb['ik_foot.R'].location = (0, 0.04, 0.0)           # chân phải lùi sau
        pb['pelvis'].location = (0, -0.03, -0.012); pb['pelvis'].rotation_euler = (0, 0, math.radians(5))
        pb['spine2'].rotation_euler = (0, 0, math.radians(-6))
        pb['upper_arm.L'].rotation_euler = (math.radians(25), 0, 0); pb['upper_arm.R'].rotation_euler = (math.radians(-25), 0, 0)
    else:
        for bn, (ax, deg) in spec.items():
            bn = bn.strip()
            e = list(pb[bn].rotation_euler); e['XYZ'.index(ax)] = math.radians(deg); pb[bn].rotation_euler = e
    bpy.context.view_layer.update()


def stretch_report(arm, asm, names=None, thr=2.0):
    """Đo độ kéo giãn cạnh (dài sau / dài nghỉ) ở mỗi dáng: số cạnh > thr, max, vùng; không thay cho việc nhìn ảnh."""
    import numpy as np
    def pos():
        dg = bpy.context.evaluated_depsgraph_get(); ev = asm.evaluated_get(dg); me = ev.to_mesh(); a = np.zeros(len(me.vertices) * 3, dtype=np.float32); me.vertices.foreach_get('co', a); ev.to_mesh_clear(); return a.reshape(-1, 3)
    apply_pose(arm, 'nghi'); p0 = pos(); ed = np.zeros(len(asm.data.edges) * 2, dtype=np.int32); asm.data.edges.foreach_get('vertices', ed); ea, eb = ed[0::2], ed[1::2]
    l0 = np.linalg.norm(p0[ea] - p0[eb], axis=1).clip(min=1e-6); ok = l0 > 0.0015; res = {}   # bỏ cạnh <1,5 mm (đỉnh gần trùng): tỉ lệ của chúng bị thổi phồng, không nhìn thấy được
    for nm in (names or POSES):
        apply_pose(arm, nm); p = pos(); st = np.where(ok, np.linalg.norm(p[ea] - p[eb], axis=1) / l0, 0.0); bad = np.where(st > thr)[0]
        reg = '-' if not len(bad) else f'z {p0[ea[bad], 2].min():.2f}-{p0[ea[bad], 2].max():.2f}, |x| {np.abs(p0[ea[bad], 0]).min():.2f}-{np.abs(p0[ea[bad], 0]).max():.2f}'
        res[nm] = (len(bad), float(st.max()), reg); print(f'    {nm:14s} cạnh giãn > {thr}×: {len(bad):5d}  max {st.max():.2f}×  vùng {reg}')
    apply_pose(arm, 'nghi'); return res


SHEET = ('nghi', 'tay_nang_45', 'gio_tay_cao', 'nam_tay_chat', 'cui_dau', 'quay_dau', 'xoay_thun', 'ngoi', 'gap_hong_sau', 'buoc_chan')


def render_poses(sc, arm, out):
    os.makedirs(out, exist_ok=True); sc.render.resolution_x, sc.render.resolution_y = 520, 900
    for name in SHEET:
        apply_pose(arm, name); ghe = None
        if name == 'ngoi':
            import numpy as np
            dg = bpy.context.evaluated_depsgraph_get(); ev = asm.evaluated_get(dg); me = ev.to_mesh(); a = np.zeros(len(me.vertices) * 3, dtype=np.float32); me.vertices.foreach_get('co', a); ev.to_mesh_clear(); a = a.reshape(-1, 3)
            r = np.zeros(len(asm.data.vertices) * 3, dtype=np.float32); asm.data.vertices.foreach_get('co', r); r = r.reshape(-1, 3)
            sel = (np.abs(r[:, 0]) < 0.17) & (r[:, 2] > 0.33) & (r[:, 2] < 0.60) & (r[:, 1] > -0.02)     # mông + mặt sau đùi ở dáng nghỉ
            q = a[sel]; zmin = float(q[:, 2].min()); y0, y1 = float(q[:, 1].min()), float(q[:, 1].max()); xw = float(np.abs(q[:, 0]).max())
            yb, yf = y1 + 0.03, max(y0 + 0.06, -0.02)                                                     # mép sau ghế sau mông 3 cm; mép trước lùi sau khoeo
            bm = bmesh.new()
            def box(x0_, x1_, y0_, y1_, z0_, z1_):
                v = [bm.verts.new((x, y, z)) for x in (x0_, x1_) for y in (y0_, y1_) for z in (z0_, z1_)]
                for f in ((0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)): bm.faces.new([v[i] for i in f])
            sw = xw + 0.05; box(-sw, sw, yf, yb, zmin - 0.04, zmin)                                       # mặt ghế dày 4 cm, rộng hơn hông 5 cm mỗi bên
            for lx in (-sw + 0.02, sw - 0.04):
                for ly in (yf + 0.01, yb - 0.03): box(lx, lx + 0.02, ly, ly + 0.02, 0.0, zmin - 0.04)
            bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
            m2 = bpy.data.meshes.new('ghe'); bm.to_mesh(m2); ghe = bpy.data.objects.new('Ghe', m2); sc.collection.objects.link(ghe); ghe.data.materials.append(D.mat('ghe', '#7a8c70', 0.8))
            over = int(((a[sel][:, 2] < zmin - 0.002)).sum()); print(f'    ghế: mặt ghế z = {zmin:.3f} m, sâu {yf:.2f}→{yb:.2f}, rộng ±{sw:.2f}; đỉnh mông/đùi lún dưới mặt ghế: {over}')
        for view, loc in (('truoc', (0, -6, 0.8)), ('nghieng', (6, 0, 0.8))):
            sc.camera = T.cam(sc, f'c_{name}_{view}', loc, (0, 0, 0.8), 1.75); sc.render.filepath = os.path.join(out, f'{name}_{view}.png'); bpy.ops.render.render(write_still=True)
        if ghe is not None: bpy.data.objects.remove(ghe, do_unlink=True)
    apply_pose(arm, 'nghi')


if __name__ == '__main__':
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--blend', default=''); ap.add_argument('--test', default=''); ap.add_argument('--proxy', type=float, default=0.5); ap.add_argument('--samples', type=int, default=16)
    a = ap.parse_args(argv)
    sc = T.build_scene(a.voxel if hasattr(a, 'voxel') else 0.0025)
    for c in list(sc.objects):
        if c.type in ('LIGHT', 'CAMERA'): bpy.data.objects.remove(c, do_unlink=True)
    T.lights(sc); sc.cycles.samples = a.samples
    asm = bpy.data.objects['Nam_Dau_Than']
    arm = build_armature(sc); bind_weights(sc, arm, asm, a.proxy); attach_head(arm, sc); attach_face_controls(arm)
    # chất vấn trọng số: số đỉnh không có trọng số
    bad = sum(1 for v in asm.data.vertices if sum(g.weight for g in v.groups) < 0.99); print(f'    đỉnh thiếu trọng số: {bad}/{len(asm.data.vertices)}')
    if a.blend: bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))
    stretch_report(arm, asm)
    if a.test: render_poses(sc, arm, a.test)
