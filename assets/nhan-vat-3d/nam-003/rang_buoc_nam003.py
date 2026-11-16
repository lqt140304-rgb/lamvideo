"""Ràng buộc giải phẫu cho rig nam-003 (17/11/2026): xương này cử động thì xương kia đi theo một phần.

  them_rang_buoc(arm, body)   gọi sau khi bind + driver vai (thay driver vai cũ).
Các ràng buộc (hệ số trong HS, đặt 0 để tắt):
  1. Xương đòn theo bắp tay: nâng khi giơ tay (0,10× góc giơ: 0,25 làm giơ cao giãn 48 cạnh, 0,15 → 19, 0,10 → 10), hạ 6° khi khép tay (như driver vai cũ),
     nhô/lùi theo vung trước–sau (0,25×, ±12°). Qua xương phụ drv_<S>Shoulder (driver) + Copy Rotation CỘNG vào xương đòn
     → hoạt ảnh/thao tác trên xương đòn vẫn giữ nguyên.
  2. Xương xoắn cẳng tay <S>ForeArmTwist (biến dạng, nửa dưới cẳng tay): chép 50% xoay quanh trục của bàn tay → cổ tay không vặn.
  3. Ngón: áp út gập theo ngón giữa 30%, trỏ 15% (Copy Rotation trục gập, cộng).
  4. Cột sống: Spine1 cộng 50% xoay của Spine, Spine2 cộng 30%.
  5. Khung chậu: gập đùi quá 45° thì khung chậu ngả sau 0,2× phần vượt (mỗi chân), qua xương phụ drv_Hips. Chỉ có tác dụng khi đùi xoay FK.
Trục (đo 17/11): LeftArm euler X + = vung trước, Z + = giơ lên (Right: Z ngược); xương đòn X + = nâng, Z + trái = lùi (phải = nhô);
UpLeg X + = gập đùi; Hips X − = ngả sau. Driver đọc Euler: tránh để bắp tay xoắn quá ±90° quanh trục của nó.
"""
import math, bpy
import numpy as np

import os
HS = dict(vai_nang=float(os.environ.get('NAM003_VAI_NANG', '0.10')), vai_nang_max=30.0, vai_ha=6.0, vai_kham=86.0, vai_nho=0.25, vai_nho_max=12.0,
          xoan=0.5, ngon_ap=0.3, ngon_tro=0.15, cot1=0.5, cot2=0.3, chau=0.2, chau_nguong=45.0, co_chan=15.0, co_chan_cao=0.05)
R = math.radians


def _helper(arm, name, like, parent):
    eb = arm.data.edit_bones; src = eb[like]; h = eb.new(name); h.head, h.tail, h.roll = src.head.copy(), src.tail.copy(), src.roll
    h.parent = eb[parent] if parent else None; h.use_deform = False; return h


def _drv(arm, bone, idx, expr, vars_):
    pb = arm.pose.bones[bone]
    try: pb.driver_remove('rotation_euler', idx)
    except Exception: pass
    d = pb.driver_add('rotation_euler', idx).driver; d.type = 'SCRIPTED'
    for nm, path in vars_:
        v = d.variables.new(); v.name = nm; v.type = 'SINGLE_PROP'; v.targets[0].id = arm; v.targets[0].data_path = path
    d.expression = expr


def _cong(arm, bone, target, inf, axes=(True, True, True), name='GP'):
    c = arm.pose.bones[bone].constraints.new('COPY_ROTATION'); c.name = name; c.target = arm; c.subtarget = target
    c.mix_mode = 'ADD'; c.target_space = c.owner_space = 'LOCAL'; c.influence = inf
    c.use_x, c.use_y, c.use_z = axes; return c


def them_rang_buoc(arm, body):
    bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode='EDIT'); eb = arm.data.edit_bones
    for S in ('Left', 'Right'):
        _helper(arm, f'drv_{S}Shoulder', f'{S}Shoulder', 'Spine2')
        fa = eb[f'{S}ForeArm']; t = eb.new(f'{S}ForeArmTwist'); mid = fa.head.lerp(fa.tail, 0.5)
        t.head, t.tail, t.roll = mid, fa.tail.copy(), fa.roll; t.parent = fa; t.use_deform = True
    for S in ('Left', 'Right'): _helper(arm, f'drv_{S}Foot', f'{S}Foot', f'{S}Leg')
    _helper(arm, 'drv_Hips', 'Hips', 'root' if 'root' in eb else None)
    bpy.ops.object.mode_set(mode='POSE')
    for n in ('drv_LeftShoulder', 'drv_RightShoulder', 'drv_Hips', 'drv_LeftFoot', 'drv_RightFoot', 'LeftForeArmTwist', 'RightForeArmTwist'): arm.pose.bones[n].rotation_mode = 'XYZ'   # bone mới mặc định quaternion → driver Euler không có tác dụng
    # bỏ driver vai cũ trên xương đòn (vai_nam003) — thay bằng xương phụ
    if arm.animation_data:
        for fc in list(arm.animation_data.drivers):
            if fc.data_path.endswith('Shoulder"].rotation_euler') and 'drv_' not in fc.data_path: arm.animation_data.drivers.remove(fc)
    h = HS
    for S, sz, sp in (('Left', 1, -1), ('Right', -1, 1)):
        a = f'pose.bones["{S}Arm"].rotation_euler'
        # X: nâng khi giơ (raise = sz*z > 0), hạ khi khép (khep = -sz*z > 0)
        _drv(arm, f'drv_{S}Shoulder', 0,
             f'{h["vai_nang"]}*min({R(h["vai_nang_max"]) / h["vai_nang"]:.5f}, max(0.0, {sz}*z)) - {R(h["vai_ha"]):.5f}*min(1.0, max(0.0, {-sz}*z/{R(h["vai_kham"]):.5f}))',
             [('z', a + '[2]')])
        _drv(arm, f'drv_{S}Shoulder', 2, f'{sp}*max(-{R(h["vai_nho_max"]):.5f}, min({R(h["vai_nho_max"]):.5f}, {h["vai_nho"]}*x))', [('x', a + '[0]')])
        _cong(arm, f'{S}Shoulder', f'drv_{S}Shoulder', 1.0)
        c = arm.pose.bones[f'{S}ForeArmTwist'].constraints.new('COPY_ROTATION'); c.name = 'GP_xoan'; c.target = arm; c.subtarget = f'{S}Hand'
        c.use_x = c.use_z = False; c.use_y = True; c.mix_mode = 'REPLACE'; c.target_space = c.owner_space = 'LOCAL'; c.influence = h['xoan']
        for i in (1, 2, 3):
            if f'{S}HandRing{i}' in arm.pose.bones: _cong(arm, f'{S}HandRing{i}', f'{S}HandMiddle{i}', h['ngon_ap'], (True, False, False))
            if f'{S}HandIndex{i}' in arm.pose.bones: _cong(arm, f'{S}HandIndex{i}', f'{S}HandMiddle{i}', h['ngon_tro'], (True, False, False))
    _cong(arm, 'Spine1', 'Spine', h['cot1']); _cong(arm, 'Spine2', 'Spine', h['cot2'])
    ng = R(h['chau_nguong'])
    _drv(arm, 'drv_Hips', 0, f'-{h["chau"]}*(max(0.0, l - {ng:.5f}) + max(0.0, r - {ng:.5f}))',
         [('l', 'pose.bones["LeftUpLeg"].rotation_euler[0]'), ('r', 'pose.bones["RightUpLeg"].rotation_euler[0]')])
    _cong(arm, 'Hips', 'drv_Hips', 1.0)
    # 6. cổ chân thả lỏng: chân rời đất → mũi chân chúc xuống co_chan độ so với cẳng chân. IK: theo độ cao ik_foot so với nghỉ;
    #    FK (IK tắt): theo độ gập gối. Chân chạm đất (IK, ik_foot ở sàn) → không đổi.
    for S, k in (('Left', 'L'), ('Right', 'R')):
        z0 = (arm.matrix_world @ arm.data.bones[f'ik_foot.{k}'].head_local).z
        fc = arm.pose.bones[f'drv_{S}Foot'].driver_add('rotation_euler', 0); d = fc.driver; d.type = 'SCRIPTED'
        v = d.variables.new(); v.name = 'h'; v.type = 'TRANSFORMS'; t = v.targets[0]; t.id = arm; t.bone_target = f'ik_foot.{k}'; t.transform_type = 'LOC_Z'; t.transform_space = 'WORLD_SPACE'
        v = d.variables.new(); v.name = 'g'; v.type = 'TRANSFORMS'; t = v.targets[0]; t.id = arm; t.bone_target = f'{S}Leg'; t.transform_type = 'ROT_X'; t.rotation_mode = 'SWING_TWIST_Y'; t.transform_space = 'LOCAL_SPACE'
        v = d.variables.new(); v.name = 'ik'; v.type = 'SINGLE_PROP'; v.targets[0].id = arm; v.targets[0].data_path = f'pose.bones["{S}Leg"].constraints["IK"].influence'
        d.expression = f'{R(h["co_chan"]):.5f}*(ik*min(1.0, max(0.0, (h - {z0:.4f}) / {h["co_chan_cao"]})) + (1 - ik)*min(1.0, max(0.0, -g / 1.0)))'
        _cong(arm, f'{S}Foot', f'drv_{S}Foot', 1.0, (True, False, False))
    # trọng số: chuyển dần ForeArm → ForeArmTwist dọc nửa dưới cẳng tay
    co = np.array([v.co[:] for v in body.data.vertices]); nv = len(co)
    for S in ('Left', 'Right'):
        g0 = body.vertex_groups[f'{S}ForeArm']; g1 = body.vertex_groups.get(f'{S}ForeArmTwist') or body.vertex_groups.new(name=f'{S}ForeArmTwist')
        b = arm.data.bones[f'{S}ForeArm']; A = np.array((arm.matrix_world @ b.head_local)[:]); B = np.array((arm.matrix_world @ b.tail_local)[:])
        t = np.clip(((co - A) @ (B - A)) / ((B - A) @ (B - A)), 0, 1); f = np.clip((t - 0.25) / 0.65, 0, 1); f = f * f * (3 - 2 * f) * 0.85
        for v in body.data.vertices:
            for g in v.groups:
                if g.group == g0.index and g.weight > 0 and f[v.index] > 0:
                    w = g.weight; g0.add([v.index], w * (1 - f[v.index]), 'REPLACE'); g1.add([v.index], w * f[v.index], 'REPLACE'); break
    bpy.ops.object.mode_set(mode='OBJECT'); bpy.context.view_layer.update()
