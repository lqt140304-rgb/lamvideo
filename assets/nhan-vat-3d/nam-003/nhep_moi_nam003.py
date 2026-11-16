"""Nhép môi thử từ một file thoại (không cần mốc âm vị). Blender 5.2.x, cần ffmpeg trên PATH.

  blender -b --factory-startup --python nhep_moi_nam003.py -- --in nam.blend --audio C1.2_NAM_01.mp3 \
      --loi "Ủa Tùng? Nay đổi ca ..." --out nhep.blend [--mp4 nhep.mp4] [--cuoi 0.4]
Cách làm: biên độ (RMS mỗi khung 24 fps) → các đoạn có tiếng; âm tiết của lời chia đều theo độ dài đoạn;
mỗi âm tiết: âm đầu m/b/p → MBP, ph/v → PHV; nguyên âm chính → A/E/I/O/U nhân với biên độ; âm cuối m/p → khép.
shortcut: chia âm tiết đều theo thời gian, không căn âm vị thật; khi cần khớp sát hãy lấy mốc từ (forced alignment).
"""
import sys, os, math, argparse, subprocess, unicodedata, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np, bpy
from mathutils import Vector
import bieu_cam_nam003 as BC

FPS = 24
MIENG = ('mieng_ha', 'mieng_hep', 'mieng_rong', 'mieng_khep')


def bien_do(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', '24000', '-f', 's16le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.int16).astype(float) / 32768; n = 24000 // FPS
    r = np.sqrt([np.mean(x[i:i + n] ** 2) for i in range(0, len(x) - n + 1, n)])
    return r / (np.percentile(r, 95) + 1e-9)


def am_tiet(loi):
    """Mỗi âm tiết → (viseme âm đầu | None, viseme nguyên âm, khép cuối?)."""
    out = []
    for w in re.findall(r"\w+", loi.lower()):
        b = ''.join(c for c in unicodedata.normalize('NFD', w) if not unicodedata.combining(c)).replace('đ', 'd')
        dau = 'MBP' if b[0] in 'mbp' and not b.startswith('ph') else ('PHV' if b.startswith(('ph', 'v')) else None)
        nguyen = re.search(r'[aeiouy]+', b); g = nguyen.group() if nguyen else 'a'
        if g in ('ua', 'ia') and not b.startswith('qu'): g = g[0]   # ủa, mía, mưa: nguyên âm chính là âm đầu
        vs = next(v for k, v in (('a', 'A'), ('o', 'O'), ('e', 'E'), ('u', 'U'), ('i', 'I'), ('y', 'I')) if k in g)
        out.append((dau, vs, b.endswith(('m', 'p'))))
    return out


def lich(env, ats, nguong=0.12):
    """Mảng giá trị 4 thuộc tính miệng theo khung."""
    co = env > nguong
    doan = []; i = 0
    while i < len(co):
        if co[i]:
            j = i
            while j < len(co) and co[j]: j += 1
            if j - i >= 2: doan.append((i, j))
            i = j
        else: i += 1
    tong = sum(b - a for a, b in doan); kq = np.zeros((len(env), 4))
    k = 0; con = len(ats)
    for di, (a, b) in enumerate(doan):
        n = con if di == len(doan) - 1 else max(1, round(len(ats) * (b - a) / tong)); n = min(n, con); con -= n
        bien = np.linspace(a, b, n + 1)
        for s in range(n):
            dau, vs, khep = ats[k]; k += 1; f0, f1 = bien[s], bien[s + 1]
            for f in range(int(f0), int(math.ceil(f1))):
                ph = (f - f0) / max(f1 - f0, 1e-6)
                if dau and ph < 0.3: v = BC.VISEME[dau]; amp = 1.0
                elif khep and ph > 0.85: v = BC.VISEME['MBP']; amp = 1.0
                else: v = BC.VISEME[vs]; amp = min(1.0, 0.35 + env[f])
                kq[f] = [v.get(p, 0.0) * (amp if p != 'mieng_khep' else 1.0) for p in MIENG]
    kq = (np.r_[kq[:1], kq[:-1]] + 2 * kq + np.r_[kq[1:], kq[-1:]]) / 4      # làm mượt 1 khung
    return kq, len(doan)


def kiem():
    ats = am_tiet('Ủa Tùng? Mày phơi')
    assert [a[1] for a in ats] == ['U', 'U', 'A', 'O'] and ats[2][0] == 'MBP' and ats[3][0] == 'PHV', ats
    env = np.r_[np.zeros(5), np.ones(20), np.zeros(5)]; kq, nd = lich(env, ats)
    assert nd == 1 and kq[:4].max() == 0 and kq[8:22, 0].max() > 0.3


def main():
    argv = sys.argv[sys.argv.index('--') + 1:]
    ap = argparse.ArgumentParser(); ap.add_argument('--in', dest='inp', required=True); ap.add_argument('--audio', required=True)
    ap.add_argument('--loi', required=True); ap.add_argument('--out', required=True); ap.add_argument('--mp4'); ap.add_argument('--cuoi', type=float, default=0.0)
    a = ap.parse_args(argv)
    kiem()
    env = bien_do(a.audio); ats = am_tiet(a.loi); kq, nd = lich(env, ats)
    print(f'  {len(env)} khung, {nd} đoạn có tiếng, {len(ats)} âm tiết, há max {kq[:, 0].max():.2f}, khung há >0,3: {(kq[:, 0] > 0.3).sum()}')
    bpy.ops.wm.open_mainfile(filepath=os.path.abspath(a.inp)); sc = bpy.context.scene
    arm = bpy.data.objects['Nam_Rig']; pb = arm.pose.bones; h = pb['Head']
    n = len(env) + 12; sc.frame_start, sc.frame_end = 1, n; sc.render.fps = FPS
    for f in range(n):
        row = kq[f] if f < len(kq) else np.zeros(4)
        for p, v in zip(MIENG, row): h[p] = float(v); h.keyframe_insert(f'["{p}"]', frame=f + 1)
    # cơ mặt phụ theo nhấn giọng: mày nhướn khi to, mắt hơi híp, khóe miệng nhích theo câu
    cham = np.convolve(env, np.ones(9) / 9, 'same')
    for f in range(0, len(env), 2):
        nhan = float(np.clip((cham[f] - 0.35) / 0.5, 0, 1))
        for p, v in (('may_nhuong', 0.55 * nhan), ('chop_mat', 0.10 * nhan), ('cuoi', a.cuoi + 0.25 * nhan)):
            if p == 'chop_mat' and any(abs(f + 1 - f0) <= 4 for f0 in (30, 110)): continue   # nhường khung chớp mắt
            h[p] = v; h.keyframe_insert(f'["{p}"]', frame=f + 1)
    for f0 in (30, 110):                       # chớp mắt + đầu lắc nhẹ cho đỡ cứng
        if f0 + 4 < n:
            for f, v in ((f0 - 2, 0), (f0, 1), (f0 + 2, 1), (f0 + 4, 0)): h['chop_mat'] = v; h.keyframe_insert('["chop_mat"]', frame=f)
    h.rotation_mode = 'XYZ'
    for f in range(1, n + 1, 12):
        h.rotation_euler = (math.radians(2.5 * math.sin(f / 19)), math.radians(4 * math.sin(f / 31)), 0); h.keyframe_insert('rotation_euler', frame=f)
    sc.frame_set(1); hp = arm.matrix_world @ h.head
    cd = bpy.data.cameras.new('cam'); cd.lens = 85; cam = bpy.data.objects.new('cam', cd); sc.collection.objects.link(cam); sc.camera = cam
    cam.location = hp + Vector((0.10, -0.60, 0.09)); cam.rotation_euler = (math.radians(90), 0, math.radians(9.5))   # cận mặt: tâm khung ở mũi–miệng
    w = sc.world or bpy.data.worlds.new('w'); sc.world = w; w.color = (0.30, 0.31, 0.34)
    L = bpy.data.lights.new('k', 'SUN'); L.energy = 1.4; lo = bpy.data.objects.new('k', L); lo.rotation_euler = (0.9, 0.2, -0.6); sc.collection.objects.link(lo)
    sc.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
    sc.view_settings.view_transform = 'Standard'; sc.render.resolution_x = 480; sc.render.resolution_y = 480
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.out), compress=True)
    if a.mp4:
        cam_mp4 = os.path.abspath(a.mp4) + '.cam.mp4'
        sc.render.image_settings.media_type = 'VIDEO'; sc.render.ffmpeg.format = 'MPEG4'; sc.render.ffmpeg.codec = 'H264'
        sc.render.filepath = cam_mp4; bpy.ops.render.render(animation=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', cam_mp4, '-i', a.audio, '-c:v', 'copy', '-c:a', 'aac', '-shortest', os.path.abspath(a.mp4)], check=True)
        os.remove(cam_mp4)
    print('PASS: đã lưu', a.out)


main()
