"""QUÉT BIÊN ĐỘ KHỚP NAM-003 (cổ tay, ngón tay, cổ chân, hông, gối, khuỷu) — Blender 5.2.x.

  <bpy-python> kiem_rom_nam003.py --rig nam-003-rig.blend [--khop wrist,finger,ankle,hip,knee,elbow] [--anh dir]

Mỗi khớp quay qua dải góc (tới giới hạn giải phẫu người), đo trên lưới ĐÃ bật Corrective Smooth, chỉ ở vùng quanh khớp (bán kính R):
  số cạnh giãn >2×, giãn max, số cạnh co <0,35×, độ thu hẹp mặt cắt ("bóp kẹo": bán kính mặt cắt nhỏ nhất / nghỉ, đo trên trục xương cha).
Chân dùng FK (tắt IK/Copy Rotation) để thử riêng từng khớp.
"""
import sys, os, math, argparse
import numpy as np, bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import chuyen_dong_nam003 as C

X, Y, Z = C.X, C.Y, C.Z
# (nhãn, xương, trục thế giới, dải góc, xương tâm vùng đo, bán kính R, xương trục mặt cắt)
TESTS = {
 'wrist': [('gập–duỗi cổ tay (Z)', 'LeftHand', Z, [-80, -60, -40, -20, 0, 20, 40, 60, 70], 'LeftHand', 0.10, 'LeftForeArm'),
           ('nghiêng quay–trụ (Y)', 'LeftHand', Y, [-30, -20, -10, 0, 10, 20, 30], 'LeftHand', 0.10, 'LeftForeArm'),
           ('xoay sấp–ngửa cẳng tay (X)', 'LeftForeArm', X, [-90, -60, -30, 0, 30, 60, 90], 'LeftHand', 0.14, 'LeftForeArm')],
 'ankle': [('gập mu–gập gan bàn chân (X)', 'LeftFoot', X, [-30, -20, -10, 0, 15, 30, 45, 55], 'LeftFoot', 0.12, 'LeftLeg'),
           ('nghiêng trong–ngoài (Y)', 'LeftFoot', Y, [-35, -20, 0, 15, 25], 'LeftFoot', 0.12, 'LeftLeg')],
 'hip': [('gập–duỗi hông (X)', 'LeftUpLeg', X, [-130, -110, -90, -60, -30, 0, 15, 25], 'LeftUpLeg', 0.22, 'LeftUpLeg'),
         ('dạng–khép hông (Y)', 'LeftUpLeg', Y, [-50, -40, -30, -15, 0, 15, 25], 'LeftUpLeg', 0.22, 'LeftUpLeg'),
         ('xoay trong–ngoài hông (Z)', 'LeftUpLeg', Z, [-45, -30, -15, 0, 15, 30, 45], 'LeftUpLeg', 0.22, 'LeftUpLeg')],
 'knee': [('gập gối (X)', 'LeftLeg', X, [0, 30, 60, 90, 120, 135, 145], 'LeftLeg', 0.15, 'LeftUpLeg')],
 'elbow': [('gập khuỷu (Z)', 'LeftForeArm', Z, [0, -30, -60, -90, -120, -140, -150], 'LeftForeArm', 0.15, 'LeftArm')],
}
FINGERS = ['Index', 'Middle', 'Ring', 'Thumb']
PROP = {'Index': 'nam_tro', 'Middle': 'nam_giua', 'Ring': 'nam_ap', 'Thumb': 'nam_cai'}


def pos(c):
    e = c.body.evaluated_get(bpy.context.evaluated_depsgraph_get()); m = e.to_mesh(); a = np.zeros(len(m.vertices) * 3); m.vertices.foreach_get('co', a); e.to_mesh_clear(); return a.reshape(-1, 3)


def tat_ik(c):
    for b in c.pb:
        for k in b.constraints:
            if k.type in ('IK',) or (k.type == 'COPY_ROTATION' and k.subtarget.startswith('ik_')): k.influence = 0.0
    for kk in 'LR': c.pb[f'ik_hand.{kk}']['ik'] = 0.0


def setup(rig):
    c = C.Ctx(rig); c.body.hide_viewport = False
    for m in c.body.modifiers:
        if m.type == 'CORRECTIVE_SMOOTH': m.show_viewport = True
    tat_ik(c); c.reset(); c.upd(); me = c.body.data
    ea = np.zeros(len(me.edges) * 2, int); me.edges.foreach_get('vertices', ea); c.ea = ea.reshape(-1, 2)
    c.co0 = np.array([v.co[:] for v in me.vertices]); c.l0 = np.linalg.norm(c.co0[c.ea[:, 0]] - c.co0[c.ea[:, 1]], axis=1); c.mid0 = (c.co0[c.ea[:, 0]] + c.co0[c.ea[:, 1]]) / 2
    return c


def do(c, centre, R, axis_bone):
    """(cạnh >2×, giãn max, cạnh <0,35×, mặt cắt min/nghỉ) trong vùng cầu bán kính R quanh đầu xương centre (toạ độ nghỉ)."""
    cen = c.head[centre]; reg = np.linalg.norm(c.mid0 - np.array(cen[:]), axis=1) < R; ok = (c.l0 > 0.002) & reg
    a = pos(c); r = np.linalg.norm(a[c.ea[:, 0]] - a[c.ea[:, 1]], axis=1) / np.maximum(c.l0, 1e-6)
    return int(((r > 2) & ok).sum()), float(r[ok].max()) if ok.any() else 0.0, int(((r < 0.35) & ok).sum())


def mat_cat(c, joint, axis_bone, R, rest_cache={}):
    """Bán kính mặt cắt (tâm là đầu xương khớp) vuông góc trục xương axis_bone, đỉnh trong ±1,5 cm: so với nghỉ."""
    h = c.world_head(joint); b = c.pb[axis_bone]; ax = (b.tail - b.head).normalized(); ax = (c.arm.matrix_world.to_3x3() @ ax).normalized()
    a = pos(c); d = a - np.array(h[:]); t = d @ np.array(ax[:]); m = np.abs(t) < 0.015; m &= (np.linalg.norm(d, axis=1) < R)
    rad = np.linalg.norm(d[m] - np.outer(t[m], np.array(ax[:])), axis=1); return float(np.mean(rad)) if m.any() else 0.0


def chay(rig, khops, anh=None):
    c = setup(rig); out = []
    for khop in khops:
        if khop == 'finger':
            print('== NGÓN TAY (cuộn 0 → 1; 1 = nắm hết cỡ; vùng R = 4 cm quanh khớp gốc ngón)')
            for fn in FINGERS:
                row = []
                for v in (0.0, 0.25, 0.5, 0.75, 1.0):
                    c.reset(); c.pb['LeftHand'][PROP[fn]] = v; c.upd(); n2, mx, n3 = do(c, f'LeftHand{fn}1', 0.05, 'LeftHand'); row.append(f'{v:.2f}: {n2}/{mx:.2f}×/{n3}')
                print(f'  {fn:7s} ' + ' | '.join(row))
            for v in (0.0, 1.0):
                c.reset(); c.pb['LeftHand']['nam'] = v; c.upd(); n2, mx, n3 = do(c, 'LeftHand', 0.16, 'LeftHand'); print(f'  nắm cả bàn tay (nam={v}): cạnh>2× {n2}, giãn max {mx:.2f}×, co<0,35× {n3}')
            continue
        for (nhan, bone, axis, angles, cen, R, axb) in TESTS[khop]:
            print(f'== {nhan} — {bone}; vùng R = {R*100:.0f} cm  (góc: cạnh>2× / giãn max / co<0,35× / mặt cắt so với nghỉ)')
            base = None; row = []
            for ang in angles:
                c.reset(); c.rot(bone, axis, ang); c.upd(); n2, mx, n3 = do(c, cen, R, axb); mc = mat_cat(c, cen, axb, R)
                if ang == 0 or base is None and ang == angles[0]: pass
                row.append((ang, n2, mx, n3, mc))
            r0 = [x for x in row if x[0] == 0]; m0 = r0[0][4] if r0 else row[0][4]
            for ang, n2, mx, n3, mc in row: print(f'  {ang:+5d}°: {n2:4d} / {mx:5.2f}× / {n3:4d} / mặt cắt {mc / m0 * 100 if m0 else 0:5.0f}%')
            out.append((nhan, row))
            if anh:
                os.makedirs(anh, exist_ok=True); ve_anh(c, bone, axis, angles, cen, R, os.path.join(anh, f'{khop}_{len(out)}_{nhan.split()[0]}'))
    return out


def ve_anh(c, bone, axis, angles, cen, R, prefix):
    """Ảnh cận ở góc cực: dải ảnh (từ góc đầu tới góc cuối) nhìn từ 3/4 trước."""
    C.dung_canh(c); sc = c.sc; sc.render.resolution_x = sc.render.resolution_y = 300
    cd = bpy.data.cameras.new('c'); cd.type = 'ORTHO'; cd.ortho_scale = max(0.3, R * 3.2); cam = bpy.data.objects.new('c', cd); sc.collection.objects.link(cam); sc.camera = cam
    sel = [angles[0], angles[len(angles) // 2], angles[-1]] if len(angles) > 3 else angles
    for i, ang in enumerate(sel):
        c.reset(); c.rot(bone, axis, ang); c.upd(); tgt = Vector(c.world_head(cen)); cam.location = tgt + Vector((2.2, -3.0, 0.6)); cam.rotation_euler = (tgt - cam.location).to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = f'{prefix}_{i}_{ang:+d}.png'; bpy.ops.render.render(write_still=True)
    c.body.hide_viewport = False


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--rig', required=True); ap.add_argument('--khop', default='wrist,finger,ankle,hip,knee,elbow'); ap.add_argument('--anh')
    a = ap.parse_args(argv); chay(a.rig, a.khop.split(','), a.anh)


if __name__ == '__main__':
    main()
