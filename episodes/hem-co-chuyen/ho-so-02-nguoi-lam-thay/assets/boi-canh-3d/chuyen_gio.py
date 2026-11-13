"""Chuyển giờ mượt trong ngày (keyframe ánh sáng): sáng sớm → trưa → chiều tà → tối (đèn bàn lên, laptop sáng).
Dựng cảnh ở chế độ `dawn` với `den_ban=True`, rồi `ap_dung(X, sc, N)` đặt keyframe cho: nắng (hướng, màu, độ mạnh), nền trời (gradient + độ mạnh),
ánh hắt cửa sổ, đèn bàn (Spot + bóng), màn hình laptop, phơi sáng; rèm khe sáng sớm ẩn đi từ trưa."""
import bpy, math
from mathutils import Vector

KEYS = {   # tên: nắng(dir, màu, năng lượng), bg(màu, độ mạnh), ramp(đáy, đỉnh), hắt(năng lượng, màu), đèn bàn, laptop(màu, độ mạnh), phơi sáng
    'dawn':   dict(d=(0.55, 0.80, -0.22), c=(0.85, 0.89, 1.0), e=4.5, bg=(0.66, 0.75, 0.88), bgs=0.5, r0=(0.98, 0.86, 0.78), r1=(0.45, 0.58, 0.82), h=22, hc=(0.87, 0.91, 1.0), lamp=0.0, bulb=0.0, lap=(0.49, 0.55, 0.60), laps=0.9, exp=0.35),
    'noon':   dict(d=(0.30, -0.80, -0.56), c=(1.0, 0.98, 0.94), e=8.0, bg=(0.84, 0.91, 0.96), bgs=1.25, r0=(0.88, 0.93, 0.96), r1=(0.30, 0.54, 0.86), h=70, hc=(1.0, 0.95, 0.86), lamp=0.0, bulb=0.0, lap=(0.49, 0.55, 0.60), laps=0.9, exp=-0.15),
    'sunset': dict(d=(0.62, -0.74, -0.25), c=(1.0, 0.60, 0.28), e=6.0, bg=(0.94, 0.71, 0.52), bgs=0.45, r0=(1.0, 0.62, 0.36), r1=(0.42, 0.38, 0.58), h=38, hc=(1.0, 0.90, 0.78), lamp=15.0, bulb=8.0, lap=(0.49, 0.55, 0.60), laps=1.5, exp=0.2),
    'toi':    dict(d=(0.62, -0.74, -0.12), c=(0.42, 0.52, 0.85), e=0.35, bg=(0.14, 0.20, 0.34), bgs=0.45, r0=(0.30, 0.34, 0.52), r1=(0.04, 0.07, 0.16), h=6, hc=(0.50, 0.60, 1.0), lamp=40.0, bulb=25.0, lap=(0.66, 0.86, 1.0), laps=6.0, exp=0.4),
}


def _q(d):
    return Vector(d).normalized().to_track_quat('-Z', 'Y')


def ap_dung(X, sc, N=96, seq=(('dawn', 1), ('noon', 30), ('sunset', 62), ('toi', 96))):
    sun = bpy.data.objects['nang_cua_so']; sun.rotation_mode = 'QUATERNION'
    w = sc.world; nt = w.node_tree; bg = nt.nodes['Background']
    ramp = next((n for n in nt.nodes if n.type == 'VALTORGB' and n.label == 'sky_ramp'), None)
    hat = bpy.data.objects.get('hat_cua_so'); spot = bpy.data.objects.get('den_ban_spot')
    bulb = bpy.data.materials.get('den_bong'); lap = bpy.data.materials.get('man_hinh')
    def emis(mt):
        return next((n for n in mt.node_tree.nodes if n.type == 'EMISSION'), None) if mt else None
    eb, el = emis(bulb), emis(lap)
    rem = [o for o in bpy.data.objects if o.name.startswith('rem_khe')]
    for name, f in seq:
        K = KEYS[name]
        sun.rotation_quaternion = _q(K['d']); sun.keyframe_insert('rotation_quaternion', frame=f)
        sun.data.color = K['c']; sun.data.keyframe_insert('color', frame=f); sun.data.energy = K['e']; sun.data.keyframe_insert('energy', frame=f)
        bg.inputs['Strength'].default_value = K['bgs']; bg.inputs['Strength'].keyframe_insert('default_value', frame=f)
        if ramp:
            ramp.color_ramp.elements[0].color = (*K['r0'], 1); ramp.color_ramp.elements[1].color = (*K['r1'], 1)
            for i in (0, 1): nt.keyframe_insert(f'nodes["{ramp.name}"].color_ramp.elements[{i}].color', frame=f)
        if hat: hat.data.energy = K['h']; hat.data.color = K['hc']; hat.data.keyframe_insert('energy', frame=f); hat.data.keyframe_insert('color', frame=f)
        if spot: spot.data.energy = K['lamp']; spot.data.keyframe_insert('energy', frame=f)
        if eb: eb.inputs['Strength'].default_value = max(K['bulb'], 0.02); eb.inputs['Strength'].keyframe_insert('default_value', frame=f)
        if el:
            el.inputs['Color'].default_value = (*K['lap'], 1); el.inputs['Strength'].default_value = K['laps']
            el.inputs['Color'].keyframe_insert('default_value', frame=f); el.inputs['Strength'].keyframe_insert('default_value', frame=f)
        sc.view_settings.exposure = K['exp']; sc.view_settings.keyframe_insert('exposure', frame=f)
        for o in rem:
            o.hide_render = (name != 'dawn'); o.keyframe_insert('hide_render', frame=f)
    sc.frame_start, sc.frame_end = 1, N
