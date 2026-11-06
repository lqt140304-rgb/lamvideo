"""Review the finished film (after master.py): 3 frames per segment (start, middle, end), one row per segment, labelled
with the shot, its time and the words spoken over it. The board stills only show each shot's key frame; this shows
what the viewer actually sees, so wrong poses, early cuts and things that pop are caught before handing over.

python <skill>/scripts/review.py <slug> [video]
Reads  out/<slug>/<slug>-final.mp4 (or the video given) and src/episodes/<slug>/timeline.json
Writes out/<slug>/review/review01.jpg ... (6 segments a page) and prints each segment's words, to check lip-to-picture
       sync by reading: does the line spoken over a segment match what the segment shows?
"""
import subprocess, sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from wi import ep_dir, load_json, out_dir

slug = sys.argv[1]
video = Path(sys.argv[2]) if len(sys.argv) > 2 else out_dir(slug) / f'{slug}-final.mp4'
tl = load_json(ep_dir(slug) / 'timeline.json')
segs = tl['segments']
dest = out_dir(slug) / 'review'
raw = dest / 'raw'
raw.mkdir(parents=True, exist_ok=True)
for old in raw.glob('f*.jpg'):  # a fresh dump for this video (frame numbers change when the film is re-cut)
    old.unlink()
# one pass over the film is far faster than seeking per frame (and a select=eq(n,..)+... list this long breaks ffmpeg)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(video), '-vf', 'scale=480:270', '-q:v', '4', str(raw / 'f%05d.jpg')], check=True)
pick = lambda a, b: [min(b - 1, a + 3), (a + b) // 2, max(a, b - 4)]
try:
    font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 16)
except Exception:
    font = ImageFont.load_default()
W, H, LAB, PER = 480, 270, 34, 6
for p in range(0, len(segs), PER):
    page = Image.new('RGB', (3 * W + 8, PER * (H + LAB)), (16, 14, 24))
    d = ImageDraw.Draw(page)
    for r, s in enumerate(segs[p:p + PER]):
        y = r * (H + LAB)
        a, b = s['a'], s['b']
        d.text((6, y + 8), f"#{p + r + 1} {s['shot']}  {a / 30:.1f}-{b / 30:.1f}s  t{s['t0']}->{s['t1']}  {s.get('line', '')}", fill=(255, 230, 160), font=font)
        for c, f in enumerate(pick(a, b)):
            fp = raw / f'f{f + 1:05d}.jpg'
            if fp.exists():
                page.paste(Image.open(fp).convert('RGB'), (c * (W + 4), y + LAB))
    page.save(dest / f'review{p // PER + 1:02d}.jpg', quality=85)
for i, s in enumerate(segs):
    print(f"{i + 1:3d} {s['shot']:4s} {s['a'] / 30:6.1f}s {(s['b'] - s['a']) / 30:4.1f}s  {s.get('line', '')}")
print(f'{len(segs)} segments -> {dest}')
