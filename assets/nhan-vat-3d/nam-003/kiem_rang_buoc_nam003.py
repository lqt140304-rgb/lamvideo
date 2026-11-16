"""KIỂM RÀNG BUỘC GIẢI PHẪU nam-003 (rang_buoc_nam003.py). <bpy-python> kiem_rang_buoc_nam003.py --rig nam-003-rig.blend
Mỗi test: dáng nghỉ không đổi, đi đúng chiều, đúng độ lớn, không giật khi quét liên tục."""
import sys, os, math, argparse
import numpy as np, bpy
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import chuyen_dong_nam003 as C
X, Y, Z = C.X, C.Y, C.Z


def run(rig):
    c = C.Ctx(rig); W = c.arm.matrix_world; pb = c.pb; res = []
    for b in pb:
        for k in b.constraints:
            if k.type == 'IK': k.influence = 0.0
    def T(nm, ok, info=''): print(('PASS ' if ok else 'FAIL ') + nm + (f'  ({info})' if info else '')); res.append(ok)
    hd = lambda n: (W @ pb[n].head).copy()
    q = lambda n: (W @ pb[n].matrix).to_quaternion()
    c.reset(); c.upd()
    T('test_co_xuong_phu', all(n in pb for n in ('drv_LeftShoulder', 'drv_RightShoulder', 'drv_Hips', 'LeftForeArmTwist', 'RightForeArmTwist')))
    dev = max((pb[n].matrix.to_translation() - pb[n].bone.matrix_local.to_translation()).length + sum(abs(a - b) for ra, rb in zip(pb[n].matrix.to_3x3(), pb[n].bone.matrix_local.to_3x3()) for a, b in zip(ra, rb)) for n in ('LeftShoulder', 'RightShoulder', 'Hips', 'Spine1', 'Spine2', 'LeftForeArmTwist', 'LeftHandRing1'))
    T('test_nghi_khong_doi', dev < 1e-4, f'sai lệch {dev:.2e}')
    a0 = hd('LeftArm'); c.rot('LeftArm', Y, -90); c.upd(); d = (hd('LeftArm') - a0) * 100
    T('test_vai_nang_khi_gio_tay', d.z > 1.0, f'đầu bắp tay nâng {d.z:.1f} cm khi giơ tay 90°')
    c.reset(); c.rot('LeftArm', Y, 80); c.upd(); d = (hd('LeftArm') - a0) * 100
    T('test_vai_ha_khi_buong', d.z < -0.3, f'{d.z:.1f} cm')
    c.reset(); c.rot('LeftArm', Y, 80); c.rot('LeftArm', X, -60); c.upd(); d1 = hd('LeftArm')
    c.reset(); c.rot('LeftArm', Y, 80); c.upd(); d0 = hd('LeftArm')
    T('test_vai_nho_khi_vung_truoc', (d1.y - d0.y) * 100 < -0.5, f'đầu bắp tay ra trước {(d0.y - d1.y) * 100:.1f} cm khi vung 60°')
    c.reset(); qa = q('LeftForeArmTwist'); c.rot('LeftHand', X, 80); c.upd(); ang = math.degrees(qa.rotation_difference(q('LeftForeArmTwist')).angle)
    T('test_xoan_cang_tay', 30 < ang < 50, f'xương xoắn quay {ang:.0f}° khi bàn tay xoay 80°')
    c.reset(); qr = q('LeftHandRing1'); qi = q('LeftHandIndex1'); pb['LeftHand']['nam_giua'] = 0.8; c.upd()   # ngón giữa gập qua driver nắm (đặt thẳng góc sẽ bị driver ghi đè)
    am = math.degrees(pb['LeftHandMiddle1'].rotation_euler[0])
    ar = math.degrees(qr.rotation_difference(q('LeftHandRing1')).angle); ai = math.degrees(qi.rotation_difference(q('LeftHandIndex1')).angle)
    T('test_ngon_theo_nhau', abs(ar - 0.3 * am) < 3 and abs(ai - 0.15 * am) < 3 and ar > 5, f'áp út {ar:.0f}°, trỏ {ai:.0f}° khi ngón giữa gập {am:.0f}°')
    c.reset(); qs = q('Spine2'); c.rot('Spine', X, 20); c.upd(); asp = math.degrees(qs.rotation_difference(q('Spine2')).angle)
    T('test_cot_song_chia_goc', 30 < asp < 40, f'Spine2 quay {asp:.0f}° khi Spine cúi 20°')
    c.reset(); s0 = hd('Spine'); c.rot('LeftUpLeg', X, -100); c.upd(); ds = (hd('Spine') - s0) * 100
    c.reset(); c.rot('LeftUpLeg', X, -30); c.upd(); ds30 = (hd('Spine') - s0) * 100
    T('test_chau_nga_khi_gap_dui', ds.y > 0.5 and abs(ds30.y) < 0.05, f'gập đùi 100°: Spine lùi {ds.y:.1f} cm; 30°: {ds30.y:.2f} cm')
    prev = None; jump = 0.0
    for ang in range(-170, 171, 5):
        c.reset(); c.rot('LeftArm', Y, ang); c.upd(); v = q('LeftShoulder')
        if prev is not None: jump = max(jump, math.degrees(prev.rotation_difference(v).angle))
        prev = v
    T('test_vai_khong_giat_khi_quet', jump < 3.0, f'bước nhảy lớn nhất của xương đòn {jump:.2f}° / 5°')
    c.reset(); print('PASS tất cả' if all(res) else 'CÓ FAIL'); return all(res)


if __name__ == '__main__':
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--rig', required=True); a = ap.parse_args(argv); sys.exit(0 if run(a.rig) else 1)
