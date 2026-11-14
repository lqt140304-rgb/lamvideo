"""Bảng ảnh chồng ảnh mẫu cho cổng 1 (vùng mặt đầu Nam theo mẫu) — xem THIET-KE-DAU-THEO-MAU.md.

Dựng cage đầu (dung_dau_cage_nam), đặt camera trực giao khớp đúng tỉ lệ và vị trí của ảnh mẫu theo phép khớp của do_mau_nam (cùng góc quay YAW),
chụp ba góc, rồi ghép: [mẫu | cage | chồng 50%] và bảng cận (mắt, mũi–miệng) kèm bảng sai lệch.
Chạy trong thư mục nhan-vat-3d:
    python bang_cong1_nam.py <thư_mục_ra_TUYỆT_ĐỐI> [samples=16]
(Windows: D:/blender/blender.exe -b --factory-startup --python bang_cong1_nam.py -- <ra> 16; Pillow cần có trong Python của Blender,
nếu thiếu thì chạy bước ghép riêng bằng py -3.14 với các ảnh gốc đã lưu trong <ra>.)
Ra: <ra>/anh_goc_<góc>.png (cage), <ra>/bang_cong1_hinh_khoi.png, <ra>/bang_cong1_can.png, <ra>/bang_cong1_sai_lech.txt."""
import sys, os, math, argparse
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
RA = os.path.abspath(argv[0]); SAMPLES = int(argv[1]) if len(argv) > 1 else 16
sys.argv = ['x']
import bpy
from mathutils import Vector
import dung_dau_cage_nam as M
import do_mau_nam as DM

MAU = os.path.join(HERE, '..', 'thiet-ke', 'thu-3d', 'mau-3d-dau.webp')
CROP = {'truoc': (40, 290, 560, 720), 'goc34': (600, 290, 1100, 720), 'nghieng': (1140, 290, 1672, 720)}      # x0, y0, x1, y1 trong ảnh mẫu
NHAN = {'truoc': 'trước (≈12°)', 'goc34': '3/4 (≈44°)', 'nghieng': 'nghiêng (90°)'}


def khop_goc(moc, g):
    """(s, tx, ty): px = s·u + tx, py = s·v + ty, cùng phép khớp với do_mau_nam.sai_lech."""
    anh, dst = DM._anh_dst(moc, DM.MOC_MAU[g], DM.YAW[g]); kh = [k for k in anh if k.split('.')[0] not in DM.CHAN_DOAN]
    return DM._khop([anh[k] for k in kh], [dst[k] for k in kh])


def chup(sc, moc, g, scale_px=1.0):
    s, tx, ty = khop_goc(moc, g); x0, y0, x1, y1 = CROP[g]; W, H = int((x1 - x0) * scale_px), int((y1 - y0) * scale_px)
    th = math.radians(DM.YAW[g]); fwd = Vector((math.sin(th), math.cos(th), 0.0)); right = Vector((math.cos(th), -math.sin(th), 0.0))
    uc = ((x0 + x1) / 2 - tx) / s; vc = ((y0 + y1) / 2 - ty) / s; C = right * uc + Vector((0, 0, -vc)) + fwd * (-0.15)
    sc.render.resolution_x, sc.render.resolution_y = W, H; sc.render.film_transparent = True
    sc.camera = M.T.cam(sc, 'cam_c1_' + g, C - fwd * 6.0, C, (x1 - x0) / s)
    f = os.path.join(RA, f'anh_goc_{g}.png'); sc.render.filepath = f; bpy.ops.render.render(write_still=True); return f, (s, tx, ty)


def main():
    os.makedirs(RA, exist_ok=True)
    sc, head, asm, amap, eyes = M.build(argparse.Namespace(check=False, render='', clip='', blend='', samples=SAMPLES, mau=''))
    M.T.lights(sc); sc.cycles.samples = SAMPLES; M.set_version('moi', True); bpy.data.objects['San'].hide_render = True
    vs, ps, mi = M.ev_mesh(asm); moc = DM.lay_moc_cage(head, vs, ps, M.to_world, M.HEAD_IDX); kq = DM.sai_lech(moc)
    open(os.path.join(RA, 'bang_cong1_sai_lech.txt'), 'w', encoding='utf8').write(DM.bang(kq) + '\n\nvượt ngưỡng: ' + str(DM.vuot_nguong(kq)) + '\n')
    out = {g: chup(sc, moc, g, 2.0) for g in CROP}
    print('đã chụp', {g: v[0] for g, v in out.items()}); sys.stdout.flush()
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        print('thiếu Pillow: chỉ lưu ảnh gốc; ghép riêng'); sys.stdout.flush(); os._exit(0)
    ref = Image.open(MAU).convert('RGB'); H1 = 430 * 2
    rows = []
    for g in ('truoc', 'goc34', 'nghieng'):
        x0, y0, x1, y1 = CROP[g]; m = ref.crop((x0, y0, x1, y1)).resize(((x1 - x0) * 2, H1), Image.LANCZOS)
        c = Image.open(out[g][0]).convert('RGBA'); bg = Image.new('RGBA', c.size, (236, 236, 236, 255)); cb = Image.alpha_composite(bg, c).convert('RGB')
        ov = Image.blend(m, cb, 0.5)
        row = Image.new('RGB', (m.width * 3 + 20, H1), 'white'); row.paste(m, (0, 0)); row.paste(cb, (m.width + 10, 0)); row.paste(ov, (2 * m.width + 20, 0))
        ImageDraw.Draw(row).text((8, 8), f'{NHAN[g]}   mẫu | cage | chồng 50%', fill=(0, 0, 0)); rows.append(row)
    W = max(r.width for r in rows); board = Image.new('RGB', (W, sum(r.height for r in rows) + 20), 'white'); y = 0
    for r in rows: board.paste(r, (0, y)); y += r.height + 10
    board.thumbnail((1800, 1800)); board.save(os.path.join(RA, 'bang_cong1_hinh_khoi.png'))
    # bảng cận: mắt và mũi–miệng ở mặt trước và 3/4 (cắt từ ảnh gốc 2×, cùng vùng với mẫu)
    cells = []
    for g, (a, b, c_, d) in (('truoc', (150, 380, 520, 560)), ('truoc', (230, 500, 450, 700)), ('goc34', (800, 380, 1090, 560)), ('goc34', (880, 500, 1090, 700))):
        x0, y0, x1, y1 = CROP[g]; box = tuple(int(v) for v in ((a - x0) * 2, (b - y0) * 2, (c_ - x0) * 2, (d - y0) * 2))
        m = ref.crop((x0, y0, x1, y1)).resize(((x1 - x0) * 2, H1), Image.LANCZOS).crop(box)
        c = Image.open(out[g][0]).convert('RGBA'); cb = Image.alpha_composite(Image.new('RGBA', c.size, (236, 236, 236, 255)), c).convert('RGB').crop(box)
        pair = Image.new('RGB', (m.width * 2 + 10, m.height), 'white'); pair.paste(m, (0, 0)); pair.paste(cb, (m.width + 10, 0)); cells.append(pair)
    Wc = max(p.width for p in cells); can = Image.new('RGB', (Wc, sum(p.height for p in cells) + 30), 'white'); y = 0
    for p in cells: can.paste(p, (0, y)); y += p.height + 10
    can.thumbnail((1500, 2200)); can.save(os.path.join(RA, 'bang_cong1_can.png'))
    print('bảng:', os.path.join(RA, 'bang_cong1_hinh_khoi.png'), os.path.join(RA, 'bang_cong1_can.png')); sys.stdout.flush(); os._exit(0)


main()
