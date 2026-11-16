"""Cơ chuyển động (shape key sửa dáng do khớp điều khiển) cho nam-003 (17/11/2026).

  them_co(arm, body)   gọi sau bind. Mỗi cơ = 1 shape key mỗi bên, driver đọc góc khớp ĐÃ TÍNH (TRANSFORMS, swing–twist quanh trục xương,
  không gian cục bộ) nên chạy cả khi IK điều khiển, không bị lỗi Euler hai nghiệm.
  Cơ: bắp tay trước phồng khi gập khuỷu; cơ delta phồng khi giơ tay; cơ cẳng tay phồng khi nắm tay; bắp chân phồng khi gập gối;
      cơ đùi trước phồng khi duỗi gối từ tư thế gập (bỏ) — chỉ các cơ co rút rõ.
Biên độ (m) trong CO; 0 = tắt. Hình phồng: dịch theo pháp tuyến, cửa sổ mượt dọc xương × phía co cơ × trọng số xương.
"""
import math, bpy
import numpy as np

CO = dict(bap_tay=0.012, delta=0.008, cang_tay=0.005, bap_chan=0.010)


def _sm(t): t = np.clip(t, 0, 1); return t * t * (3 - 2 * t)


def _win(t, a, b, c, d): return _sm((t - a) / (b - a)) * (1 - _sm((t - c) / (d - c)))


def _seg(arm, bn):
    b = arm.data.bones[bn]; M = arm.matrix_world
    return np.array((M @ b.head_local)[:]), np.array((M @ b.tail_local)[:]), np.array((M.to_3x3() @ b.matrix_local.to_3x3().col[2])[:])


def _drv(key, arm, bone, expr, chans):
    fc = key.driver_add('value'); d = fc.driver; d.type = 'SCRIPTED'
    for nm, tt in chans:
        v = d.variables.new(); v.name = nm; v.type = 'TRANSFORMS'; t = v.targets[0]
        t.id = arm; t.bone_target = bone; t.transform_type = tt; t.rotation_mode = 'SWING_TWIST_Y'; t.transform_space = 'LOCAL_SPACE'
    d.expression = expr


def them_co(arm, body):
    me = body.data
    if not me.shape_keys: body.shape_key_add(name='Basis', from_mix=False)
    co = np.array([v.co[:] for v in me.vertices]); nrm = np.array([v.normal[:] for v in me.vertices])
    gi = {g.name: g.index for g in body.vertex_groups}; nv = len(co)
    def gw(names):
        w = np.zeros(nv)
        for v in me.vertices:
            for g in v.groups:
                if g.group in [gi[n] for n in names if n in gi]: w[v.index] += g.weight
        return np.clip(w, 0, 1)
    def key(name, disp):
        k = body.shape_key_add(name=name, from_mix=False); a = (co + disp).ravel(); k.data.foreach_set('co', a); k.slider_min, k.slider_max = 0.0, 1.0; return k
    out = []
    for S, sg in (('Left', 1), ('Right', -1)):
        # bắp tay trước: dọc bắp tay t 0,30–0,90, phía gập (hướng cẳng tay đi khi gập = trục Z cục bộ của cẳng tay ở dáng nghỉ)
        A, B, _ = _seg(arm, f'{S}Arm'); zf = _seg(arm, f'{S}ForeArm')[2]; t = ((co - A) @ (B - A)) / ((B - A) @ (B - A))
        w = _win(t, 0.30, 0.55, 0.75, 0.95) * np.clip(nrm @ zf, 0, 1) ** 1.5 * gw([f'{S}Arm', f'{S}ArmBlend'])
        out.append(key(f'co_bap_tay_{S[0]}', nrm * (CO['bap_tay'] * w)[:, None])); _drv(out[-1], arm, f'{S}ForeArm', 'min(1.0, sqrt(x*x + z*z) / 2.1)', [('x', 'ROT_X'), ('z', 'ROT_Z')])
        # delta: quanh khớp vai, phía trên–ngoài, phồng khi giơ tay (swing Z bắp tay, trái +)
        J = A; r = np.linalg.norm(co - J, axis=1); up = np.array([sg * 0.6, 0, 0.8])
        w = _sm((0.09 - r) / 0.05) * np.clip(nrm @ up, 0, 1) * gw([f'{S}Arm', f'{S}ArmBlend', f'{S}Shoulder'])
        out.append(key(f'co_delta_{S[0]}', nrm * (CO['delta'] * w)[:, None])); _drv(out[-1], arm, f'{S}Arm', f'min(1.0, max(0.0, {sg}*z) / 1.6)', [('z', 'ROT_Z')])
        # cẳng tay (cơ gấp ngón): nửa trên cẳng tay, phía lòng bàn tay (dáng nghỉ lòng bàn tay hướng −Y), phồng khi nắm
        A2, B2, _ = _seg(arm, f'{S}ForeArm'); t2 = ((co - A2) @ (B2 - A2)) / ((B2 - A2) @ (B2 - A2))
        w = _win(t2, 0.05, 0.25, 0.50, 0.75) * np.clip(-nrm[:, 1], 0, 1) * gw([f'{S}ForeArm', f'{S}ForeArmTwist'])
        k = key(f'co_cang_tay_{S[0]}', nrm * (CO['cang_tay'] * w)[:, None]); out.append(k)
        fc = k.driver_add('value'); d = fc.driver; d.type = 'SCRIPTED'
        for nm, pr in (('a', 'nam'), ('b', 'nam_giua')):
            v = d.variables.new(); v.name = nm; v.type = 'SINGLE_PROP'; v.targets[0].id = arm; v.targets[0].data_path = f'pose.bones["{S}Hand"]["{pr}"]'
        d.expression = 'min(1.0, max(a, b))'
        # bắp chân: cẳng chân t 0,10–0,55 từ gối, phía sau (hướng gót đi khi gập gối = −Z cục bộ cẳng chân), phồng khi gập gối
        A3, B3, zl = _seg(arm, f'{S}Leg'); t3 = ((co - A3) @ (B3 - A3)) / ((B3 - A3) @ (B3 - A3))
        w = _win(t3, 0.08, 0.22, 0.45, 0.65) * np.clip(nrm @ (-zl), 0, 1) ** 1.5 * gw([f'{S}Leg'])
        out.append(key(f'co_bap_chan_{S[0]}', nrm * (CO['bap_chan'] * w)[:, None])); _drv(out[-1], arm, f'{S}Leg', 'min(1.0, sqrt(x*x + z*z) / 2.0)', [('x', 'ROT_X'), ('z', 'ROT_Z')])
    return [k.name for k in out]
