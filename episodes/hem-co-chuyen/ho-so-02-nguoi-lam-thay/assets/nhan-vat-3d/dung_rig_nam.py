"""Dựng và kiểm đầu diễn hoạt của Nam (rig mặt 3D). Media nặng (ảnh, clip, .blend) ghi ra thư mục chỉ định — không commit.
  python dung_rig_nam.py --kiem                          # bộ kiểm biến dạng: tổ hợp mục 8 + bốn nhóm preset đã làm
  python dung_rig_nam.py --blend <file.blend>            # lưu file có đầu gốc (Nam_Dau, ẩn render) và đầu diễn hoạt (Nam_DienHoat)
  python dung_rig_nam.py --anh <thư_mục>                 # ảnh trung tính trước/sau, bảng biểu cảm, cận mắt–miệng, bảng tổ hợp
  python dung_rig_nam.py --clip <thư_mục>                # GIF kiểm chớp mắt, hướng nhìn, mở hàm, chuyển cảm xúc
  python dung_rig_nam.py --blend f.blend --phong <thư_mục>   # đặt đầu vào phòng trọ có sẵn (ngày/đêm), kiểm độ đọc
Trong Blender: blender -b -P dung_rig_nam.py -- <đối số>. Cần bpy 5.0.x."""
import os, sys, argparse, math, subprocess
import bpy
AQ = os.path.dirname(os.path.abspath(__file__))
if AQ not in sys.path: sys.path.insert(0, AQ)
from mathutils import Vector

NHOM_DA_KIEM = ['binh-than', 'vui', 'buon', 'so-hai']


def _chieu(sc, cam, p):
    from bpy_extras.object_utils import world_to_camera_view
    v = world_to_camera_view(sc, cam, p); w, h = sc.render.resolution_x, sc.render.resolution_y
    return int(v.x * w), int((1 - v.y) * h)


def _cat(f, tam, nua_w, nua_h, ra_w):
    from PIL import Image
    im = Image.open(f).convert('RGB'); x, y = tam
    c = im.crop((x - nua_w, y - nua_h, x + nua_w, y + nua_h)); return c.resize((ra_w, int(ra_w * nua_h / nua_w)), Image.LANCZOS)


def anh_kiem(r, ra):
    from PIL import Image, ImageDraw
    from rig_mat_nam import anh, kiem, preset, so_sanh
    os.makedirs(ra, exist_ok=True); sc, cams = anh.chuan_bi(co=480, mau=20)
    # 1. trung tính trước/sau chỉnh topology
    out = []
    for goc in (True, False):
        anh.hien(goc); kiem.dat_lai(r)
        for g, c in anh.GOC.items(): out.append(anh.chup(sc, cams, c, f'{ra}/_tt_{"goc" if goc else "rig"}_{g}.png'))
    anh.hien(False)
    anh.bang(out, f'{ra}/1_trung_tinh_truoc_sau.png', 3, [('GỐC ' if i < 3 else 'DIỄN HOẠT ') + g for i, g in enumerate(list(anh.GOC) * 2)])
    # 2. bảng biểu cảm: ảnh mẫu + ba góc, bốn nhóm × hai mức
    d = preset.nap(); W = 240; b = Image.new('RGB', (W * 4, (W + 18) * 8), 'white'); dr = ImageDraw.Draw(b); i = 0
    for n in NHOM_DA_KIEM:
        for m in ('nhe', 'ro'):
            preset.dat(r, n, m); y = i * (W + 18); dr.text((4, y + 2), f'{n} · {"NHẸ" if m == "nhe" else "RÕ"} · lỗi: {kiem.loi_bien_dang(r) or "không"}', fill=(160, 0, 0))
            b.paste(so_sanh.cat_o(d[n]['bang'], *d[n]['o'], m).resize((W, W)), (0, y + 18))
            for j, (g, c) in enumerate(anh.GOC.items()):
                f = anh.chup(sc, cams, c, f'{ra}/_bc_{n}_{m}_{g}.png'); b.paste(Image.open(f).convert('RGB').crop((80, 110, 400, 430)).resize((W, W)), (W * (j + 1), y + 18))
            i += 1
    b.save(f'{ra}/2_bang_bieu_cam.png')
    # 3. cận mắt – miệng ở các tổ hợp kiểm (trước + 3/4), vùng cắt chiếu từ điểm 3D
    sc.render.resolution_x = sc.render.resolution_y = 900
    pL = r.info['L']['p0']; pR = r.info['R']['p0']; pm = r.info['mieng']['p']; giua = (pL + pR) / 2
    hang = []
    for tt in kiem.TRANG_THAI_KIEM:
        kiem.dat_lai(r); kiem.dat(r, **tt['dk']); o = []
        for c in ('Cam_Front', 'Cam_34'):
            f = anh.chup(sc, cams, c, f'{ra}/_can_{len(hang)}_{c}.png')
            o.append(_cat(f, _chieu(sc, cams[c], giua), 170, 60, 340)); o.append(_cat(f, _chieu(sc, cams[c], pm), 90, 60, 180))
        hang.append((tt['ten'], o))
    b = Image.new('RGB', (340 + 180 + 340 + 180, (113 + 120 + 14) * len(hang)), 'white'); dr = ImageDraw.Draw(b)
    for k, (ten, o) in enumerate(hang):
        y = k * 247; dr.text((4, y), ten, fill=(160, 0, 0)); x = 0
        for im in o: b.paste(im, (x, y + 14)); x += im.size[0]
    b.save(f'{ra}/3_can_mat_mieng.png')
    print('ảnh ->', ra)


def clip(r, ra):
    from PIL import Image
    from rig_mat_nam import anh, kiem, preset
    os.makedirs(ra, exist_ok=True); sc, cams = anh.chuan_bi(co=300, mau=8); anh.hien(False); sc.camera = cams['Cam_Front']
    def seq(a, b, n): return [{k: a.get(k, 0) + (b.get(k, 0) - a.get(k, 0)) * t / (n - 1) for k in set(a) | set(b)} for t in range(n)]
    P = lambda n, m: preset.gia_tri(n, m)
    khung = (seq({}, {'blink_L': 1, 'blink_R': 1}, 5) + seq({'blink_L': 1, 'blink_R': 1}, {}, 5) +
             seq({}, {'look_x': -1}, 5) + seq({'look_x': -1}, {'look_x': 1}, 8) + seq({'look_x': 1, 'look_y': 0}, {'look_y': 1, 'look_x': 0}, 5) +
             seq({'look_y': 1}, {'look_y': -1, 'blink_L': 0.5, 'blink_R': 0.5}, 6) + seq({'look_y': -1, 'blink_L': 0.5, 'blink_R': 0.5}, {}, 4) +
             seq({}, {'jaw_open': 1}, 8) + seq({'jaw_open': 1}, {}, 6) +
             seq(P('binh-than', 'nhe'), P('vui', 'ro'), 8) + seq(P('vui', 'ro'), P('buon', 'ro'), 8) + seq(P('buon', 'ro'), P('so-hai', 'ro'), 8) + seq(P('so-hai', 'ro'), P('binh-than', 'nhe'), 8))
    ims = []
    for i, dk in enumerate(khung):
        kiem.dat_lai(r); kiem.dat(r, **dk); f = anh.chup(sc, cams, 'Cam_Front', f'{ra}/_k_{i:03d}.png'); ims.append(Image.open(f).convert('RGB').crop((40, 70, 260, 290)))
    ims[0].save(f'{ra}/kiem_chuyen_dong.gif', save_all=True, append_images=ims[1:], duration=90, loop=0)
    print('clip ->', ra, len(ims), 'khung')


def phong(blend, ra):
    """Chạy trong tiến trình riêng: dựng phòng trọ có sẵn (xay_phong_tro.build xoá cảnh), nạp đầu diễn hoạt từ .blend."""
    sys.path.insert(0, os.path.abspath(os.path.join(AQ, '..', 'boi-canh-3d')))
    import xay_phong_tro as R
    from PIL import Image, ImageDraw
    os.makedirs(ra, exist_ok=True); o = []
    for mode in ('day', 'night'):
        sc = R.build(mode, 10.0, 0.0, 0.0, 'WIDE', (420, 420))
        with bpy.data.libraries.load(os.path.abspath(blend), link=False) as (src, dst): dst.collections = ['Nam_DienHoat']
        col = dst.collections[0]; sc.collection.children.link(col)
        goc = bpy.data.objects.new('Nam_Goc', None); sc.collection.objects.link(goc)
        for ob in col.all_objects:
            if ob.parent is None: ob.parent = goc
        goc.location = (R.mx(1.35), 1.7, 0.0); goc.rotation_euler = (0, 0, math.radians(180))
        for ob in col.all_objects:
            if ob.name.startswith('Va_Cham'): ob.hide_render = True
        cam = bpy.data.objects.new('Cam_Can', bpy.data.cameras.new('Cam_Can')); sc.collection.objects.link(cam); cam.data.lens = 70
        mat = goc.matrix_world @ Vector((0, 0, 1.24)); cam.location = goc.matrix_world @ Vector((0.25, -1.25, 1.30))
        cam.rotation_euler = (mat - cam.location).to_track_quat('-Z', 'Y').to_euler(); sc.camera = cam; sc.cycles.samples = 24
        head = bpy.data.objects['Head_Rig']; arm = bpy.data.objects['Nam_Rig']
        import json
        P = json.load(open(os.path.join(AQ, 'rig_mat_nam', 'preset.json'), encoding='utf-8'))['nhom']
        for n, m in (('binh-than', 'nhe'), ('vui', 'ro'), ('buon', 'ro'), ('so-hai', 'ro')):
            for kb in head.data.shape_keys.key_blocks:
                if kb.name not in ('Basis',) and not kb.name.endswith('_sua'): kb.value = 0.0
            for p in ('jaw_open', 'look_x', 'look_y'): arm[p] = 0.0
            for k, v in P[n][m].items():
                if k in ('jaw_open', 'look_x', 'look_y'): arm[k] = v
                else: head.data.shape_keys.key_blocks[k].value = v
            head.update_tag(); arm.update_tag(); bpy.context.view_layer.update()
            f = f'{ra}/_phong_{mode}_{n}_{m}.png'; sc.render.filepath = f; bpy.ops.render.render(write_still=True); o.append((f'{mode} · {n} {m}', f))
    b = Image.new('RGB', (420 * 4, 440 * 2), 'white'); dr = ImageDraw.Draw(b)
    for i, (t, f) in enumerate(o): b.paste(Image.open(f).convert('RGB'), ((i % 4) * 420, (i // 4) * 440 + 20)); dr.text(((i % 4) * 420 + 4, (i // 4) * 440 + 4), t, fill=(160, 0, 0))
    b.save(f'{ra}/4_trong_phong_tro.png'); print('phòng ->', ra)


def main(argv):
    ap = argparse.ArgumentParser(); ap.add_argument('--kiem', action='store_true'); ap.add_argument('--blend', default=''); ap.add_argument('--anh', default='')
    ap.add_argument('--clip', default=''); ap.add_argument('--phong', default=''); ap.add_argument('--phong-chay', nargs=2, default=None)
    a = ap.parse_args(argv)
    if a.phong_chay: phong(*a.phong_chay); return 0
    from rig_mat_nam import dung, kiem, preset
    r = dung.dung_rig(); ma = 0
    if a.kiem:
        tong = 0
        for tt in kiem.TRANG_THAI_KIEM:
            kiem.dat_lai(r); kiem.dat(r, **tt['dk']); l = kiem.loi_bien_dang(r, tt.get('mieng_dong', False)); tong += len(l); print('KIỂM', tt['ten'], l or 'đạt')
        for n in NHOM_DA_KIEM:
            for m in ('nhe', 'ro'):
                preset.dat(r, n, m); l = kiem.loi_bien_dang(r); tong += len(l); print('PRESET', n, m, l or 'đạt')
        print(('PASS' if not tong else 'FAIL'), f'{tong} lỗi'); ma = 1 if tong else 0
    if a.anh: anh_kiem(r, a.anh)
    if a.clip: clip(r, a.clip)
    if a.blend:
        from rig_mat_nam import kiem as K
        K.dat_lai(r); bpy.data.collections['Nam_Dau'].hide_render = True
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend)); print('blend ->', a.blend)
    if a.phong:
        if not a.blend: raise SystemExit('--phong cần --blend (đầu diễn hoạt được nạp từ file đó)')
        subprocess.run([sys.executable, os.path.abspath(__file__), '--phong-chay', os.path.abspath(a.blend), os.path.abspath(a.phong)], check=True)
    return ma


if __name__ == '__main__':
    sys.exit(main(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]))
