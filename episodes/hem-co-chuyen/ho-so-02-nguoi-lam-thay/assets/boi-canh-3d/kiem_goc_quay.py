"""Mô phỏng kiểm tra góc quay đủ rộng chưa (không render): chạy `python kiem_goc_quay.py > bang.md`.
Với khung 2.39:1 trên sensor 36 mm ngang → sensor cao 15,06 mm, nên GÓC NHÌN DỌC hẹp (35 mm = 24°, 24 mm = 34°).
Kiểm từng camera trong CAMERAS: (1) người 1,60 m đứng ở điểm nhìn có lọt cả người không; (2) tỉ lệ sàn/tường nhìn thấy và không bị che;
(3) camera lùi tối đa bao nhiêu trong phòng; và tìm vị trí trong phòng cho khung rộng nhất."""
import bpy, math, sys, os
from mathutils import Vector
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import xay_phong_tro as X
from bpy_extras.object_utils import world_to_camera_view

W, D, H = X.W, X.D, X.H
ASPECT = 2.39; SENS_W = 36.0; SENS_H = SENS_W / ASPECT
BODY = 1.60


def fovs(mm):
    return math.degrees(2 * math.atan(SENS_W / 2 / mm)), math.degrees(2 * math.atan(SENS_H / 2 / mm))


def lens_full_body(dist, margin=0.12):
    """Tiêu cự tối đa để người cao 1,6 m lọt hết khung dọc (có lề `margin`) khi đứng cách máy `dist`."""
    half = BODY * (1 + margin) / 2
    return SENS_H / 2 * dist / half


def dist_full_body(mm, margin=0.12):
    return BODY * (1 + margin) / 2 / (SENS_H / 2 / mm)


def point_visible(sc, cam, p, ignore=()):
    dg = bpy.context.evaluated_depsgraph_get()
    cp = cam.matrix_world.translation; d = (p - cp); L = d.length
    ok, loc, n, idx, ob, mat = sc.ray_cast(dg, cp, d.normalized(), distance=L - 0.03)
    if ok and not any(ob.name.startswith(i) for i in ignore): return False
    return True


def coverage(sc, cam, outside_ignore=False):
    ig = ('tuong_truoc', 'op_truoc', 'phao_truoc') if outside_ignore else ()
    pts_floor = [Vector((X.mx(x), y, 0.03)) for x in [0.15 + i * 0.3 for i in range(10)] for y in [0.15 + j * 0.3 for j in range(13)]]
    walls = []
    for z in (0.4, 1.0, 1.6, 2.3):
        for t in [0.2 + 0.2 * i for i in range(14)]:
            walls += [Vector((X.mx(0.01), 0.1 + t * 3.8 / 2.8 * 0.0 + (0.2 + t * 0.0) + (t * 3.6 / 2.8), z)) if False else Vector((X.mx(0.02), 0.1 + (t / 3) * 3.8, z)),
                      Vector((X.mx(W - 0.02), 0.1 + (t / 3) * 3.8, z)),
                      Vector((X.mx(0.1 + (t / 3) * 2.8), 0.02, z)),
                      Vector((X.mx(0.1 + (t / 3) * 2.8), D - 0.02, z))]
    def frac(pts):
        n = 0
        for p in pts:
            v = world_to_camera_view(sc, cam, p)
            if 0 <= v.x <= 1 and 0 <= v.y <= 1 and v.z > 0 and point_visible(sc, cam, p, ig): n += 1
        return n / len(pts)
    return frac(pts_floor), frac(walls)


def max_back(pos, tgt):
    """Camera lùi thêm được bao nhiêu (theo hướng ngược nhìn, mặt phẳng ngang) trước khi ra khỏi phòng 0..W × 0..D."""
    d = Vector((pos[0] - tgt[0], pos[1] - tgt[1], 0))
    if d.length < 1e-6: return 0.0
    d.normalize(); best = 99
    for axis, lo, hi in ((0, 0.0, W), (1, 0.0, D)):
        if abs(d[axis]) < 1e-6: continue
        t = ((hi if d[axis] > 0 else lo) - pos[axis]) / d[axis]
        best = min(best, t)
    return max(0.0, best)


def main():
    sc = X.build('day', cam='WIDE', res=(1280, 536), hide_front=False)
    print('# Kiểm tra góc quay (mô phỏng)\n')
    print(f'Khung {ASPECT}:1, sensor {SENS_W:.0f}×{SENS_H:.1f} mm, người {BODY} m. Góc nhìn ngang/dọc: ' + ', '.join(f'{m} mm = {fovs(m)[0]:.0f}°/{fovs(m)[1]:.0f}°' for m in (14, 18, 22, 24, 28, 35, 50, 85)) + '\n')
    print('| Tiêu cự | Cách máy bao nhiêu m để thấy trọn người 1,60 m (lề 12%) |\n|---|---|')
    for m in (14, 18, 22, 24, 28, 35, 50, 65, 85):
        print(f'| {m} mm | {dist_full_body(m):.2f} m |')
    print('\nPhòng chỉ 3 × 4 m, đường chéo 5 m: trục dài nhất đặt máy sát tường vẫn chỉ ~3,6–4,5 m.\n')
    TOAN_THAN = {'WIDE', 'BED', 'DOOR', 'KITCHEN', 'GUONG', 'GUONG_XIEN', 'ORBIT_A', 'ORBIT_B', 'ORBIT_C', 'A01', 'A02B', 'A03', 'C06', 'LOW'}
    print('| Camera | Tiêu cự | Máy | Cách điểm nhìn (m) | Khung cao tại điểm nhìn (m) | Người 1,6 m lọt dọc | Cần ≥ (m) | Lùi thêm được (m) | Sàn thấy | Tường thấy | Nhận xét |\n|---|---|---|---|---|---|---|---|---|---|---|')
    names = [n for n in X.CAMERAS if n not in ('TOP', 'HALL', 'HALL_DOOR', 'HALL_FACE', 'HALL_STAIR', 'HALL_END', 'HALL_LONG', 'P201VENT')]
    for n in names:
        pos, tgt, f = X.CAMERAS[n]
        for o in [o for o in bpy.data.objects if o.type == 'CAMERA']: bpy.data.objects.remove(o)
        cam = X.add_camera(n); bpy.context.view_layer.update()
        inside = 0 <= pos[0] <= W and 0 <= pos[1] <= D
        dist = math.dist(pos, tgt); need = dist_full_body(f)
        vh = 2 * dist * math.tan(math.radians(fovs(f)[1] / 2)); pct = min(1.0, vh / (BODY * 1.12))
        fl, wl = coverage(sc, cam, outside_ignore=not inside)
        back = max_back(pos, tgt) if inside else 0
        note = []
        if n in TOAN_THAN:
            if need > dist + 0.05:
                note.append('THIẾU rộng: người chỉ lọt %d%%' % round(pct * 100))
                if back + dist >= need: note.append('lùi %.1f m là đủ' % (need - dist))
                else: note.append('trong phòng chỉ đủ ≤ %d mm; hoặc ẩn tường/đổi cỡ cảnh' % math.floor(lens_full_body(dist + back)))
            else: note.append('đủ toàn thân')
        else:
            note.append('cận/vật thể (không kiểm toàn thân)')
        if not inside: note.append('máy ngoài phòng (ẩn tường)')
        print(f'| {n} | {f} | {"trong" if inside else "ngoài"} | {dist:.1f} | {vh:.2f} | {pct*100:.0f}% | {need:.1f} | {back:.1f} | {fl*100:.0f}% | {wl*100:.0f}% | {"; ".join(note)} |')
    # tìm vị trí trong phòng cho khung rộng nhất
    print('\n## Máy trong phòng cho khung rộng nhất (mắt 1,5 m, hướng về tâm phòng)\n')
    print('| Vị trí máy (x,y) | Tiêu cự | Sàn thấy | Tường thấy |\n|---|---|---|---|')
    best = []
    for (x, y) in [(0.15, 0.15), (2.85, 0.15), (0.15, 3.85), (2.85, 3.85), (1.5, 0.15), (1.5, 3.85)]:
        for f in (14, 16, 18, 24):
            for o in [o for o in bpy.data.objects if o.type == 'CAMERA']: bpy.data.objects.remove(o)
            X.CAMERAS['_t'] = ((x, y, 1.5), (1.5, 2.0, 0.9), f)
            cam = X.add_camera('_t'); bpy.context.view_layer.update()
            fl, wl = coverage(sc, cam); best.append((fl * 0.5 + wl * 0.5, x, y, f, fl, wl))
    best.sort(reverse=True)
    for _, x, y, f, fl, wl in best[:8]:
        print(f'| ({x}, {y}) | {f} mm | {fl*100:.0f}% | {wl*100:.0f}% |')
    print('\n## Chạy máy dài (không gian cần)\n')
    d0, f0, f1 = 1.1, 28.0, 85.0
    print(f'- Vertigo 28→85 mm giữ cỡ chủ thể: máy lùi từ {d0} m tới {d0*f1/f0:.1f} m (+{d0*f1/f0-d0:.1f} m). Từ gương (x≈0,14) máy tới x≈{0.14+d0*f1/f0:.1f} m > {W} m: ra ngoài tường cửa sổ (phải ẩn tường). Trong phòng chỉ lùi tối đa {W-0.14-0.1:.1f} m → vertigo gọn trong phòng chỉ đạt khoảng 24→{24*(W-0.24)/0.9:.0f} mm.')
    print(f'- Orbit 180° bán kính 1,0 m quanh (1,2; 2,6): x từ 0,2 đến 2,2, y từ 1,6 đến 3,6 → nằm trọn trong phòng.')


main()
