"""Driver 'vai hạ theo tay' cho nam-003: khi tay buông (bắp tay khép về thân) xương đòn LeftShoulder/RightShoulder tự hạ tối đa HA độ
(nhịp vai–cánh tay như người thật), nên vai không còn cao nhô ở tư thế buông. Cùng với tay buông 86° (không phải 78°) khe tay–thân còn ~2 cm ở nách.
(Đo 15/11: góc 78° cũ cho khe 4 cm ở nách → 10 cm ở cổ tay; dịch LeftArm bằng location KHÔNG có tác dụng vì LeftArm nối liền xương đòn.)

  them_driver_vai(arm)   gọi một lần sau khi dựng rig.
Xoay Z cục bộ của LeftArm = −góc khép (Right: +) khi quay quanh trục Y thế giới; xoay X cục bộ của LeftShoulder = −góc hạ (Right: +... đo bằng test).
Driver không đi theo GLB (như driver ngón tay): ở engine khác phải bake.
"""
import math, bpy

HA = 6.0             # độ, hạ vai tối đa
KHEP_MAX = 86.0      # độ khép ứng với hạ tối đa


def them_driver_vai(arm):
    ds = arm.animation_data.drivers if arm.animation_data else []
    for S, sg in (('Left', -1), ('Right', 1)):
        path = f'pose.bones["{S}Shoulder"].rotation_euler'
        for f in [f for f in ds if f.data_path == path and f.array_index == 0]: arm.animation_data.drivers.remove(f)
        fc = arm.pose.bones[f'{S}Shoulder'].driver_add('rotation_euler', 0); d = fc.driver; d.type = 'SCRIPTED'
        v = d.variables.new(); v.name = 'z'; v.type = 'SINGLE_PROP'; v.targets[0].id = arm; v.targets[0].data_path = f'pose.bones["{S}Arm"].rotation_euler[2]'
        d.expression = f'{-math.radians(HA):.6f}*max(0.0, min(1.0, {sg}*z/{math.radians(KHEP_MAX):.6f}))'
