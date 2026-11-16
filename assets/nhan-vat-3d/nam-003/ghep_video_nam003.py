"""Ghép ảnh render của chuyen_dong_nam003.py thành video (ffmpeg): cạnh nhau các góc nhìn, kèm tiêu đề.
  python ghep_video_nam003.py --thu-muc dir --goc ben,3_4 --khung 64 --ten "Đi bộ" --ra out.mp4 [--fps 24]
"""
import sys, os, argparse, subprocess, tempfile
from PIL import Image, ImageDraw

ap = argparse.ArgumentParser(); ap.add_argument('--thu-muc', required=True); ap.add_argument('--goc', default='ben,3_4'); ap.add_argument('--khung', type=int, required=True)
ap.add_argument('--ten', default=''); ap.add_argument('--ra', required=True); ap.add_argument('--fps', type=int, default=24); ap.add_argument('--nhan', help='JSON danh sách nhãn theo khung (ghi đè --ten)')
a = ap.parse_args(); gs = a.goc.split(',')
import json; nhan = json.load(open(a.nhan, encoding='utf-8')) if a.nhan else None
tmp = tempfile.mkdtemp()
for f in range(1, a.khung + 1):
    ims = [Image.open(os.path.join(a.thu_muc, f'{g}_{f:03d}.png')).convert('RGB') for g in gs]
    w, h = ims[0].size; W = Image.new('RGB', (w * len(ims), h + 28), (255, 255, 255)); d = ImageDraw.Draw(W)
    d.text((8, 8), (f'{nhan[f - 1]}   khung {f}/{a.khung}' if nhan else f'{a.ten}   khung {f}/{a.khung}'), fill=(0, 0, 0))
    for i, im in enumerate(ims): W.paste(im, (w * i, 28))
    W.save(os.path.join(tmp, f'f{f:04d}.png'))
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(a.fps), '-i', os.path.join(tmp, 'f%04d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '22', a.ra], check=True)
print('đã ghi', a.ra, os.path.getsize(a.ra) // 1024, 'KB')
