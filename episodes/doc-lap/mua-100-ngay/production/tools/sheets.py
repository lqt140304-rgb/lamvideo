"""Contact sheets for the self-check and for showing the storyboard: 3x3 pages of the board stills, in the order the
shots first appear, each page 1920x1080 (board.py's single storyboard.jpg is far too tall to read).

python <skill>/scripts/sheets.py <slug>
Reads  out/<slug>/board/<shot>.png (from stills.mjs) and src/episodes/<slug>/timeline.json
Writes out/<slug>/sheets/sheet01.jpg ...
"""
import sys

from PIL import Image, ImageDraw

from wi import ep_dir, load_json, out_dir

slug = sys.argv[1]
board = out_dir(slug) / 'board'
dest = out_dir(slug) / 'sheets'
dest.mkdir(parents=True, exist_ok=True)
order = [s['id'] for s in load_json(ep_dir(slug) / 'timeline.json', {}).get('shots', [])]
cols, rows, W, H = 3, 3, 640, 360
per = cols * rows
for n in range(0, len(order), per):
    sheet = Image.new('RGB', (cols * W, rows * H), (12, 10, 20))
    for i, sid in enumerate(order[n:n + per]):
        p = board / f'{sid}.png'
        if not p.exists():
            continue
        im = Image.open(p).convert('RGB').resize((W - 6, H - 6))
        d = ImageDraw.Draw(im)
        d.rectangle([0, 0, 70, 26], fill=(0, 0, 0))
        d.text((6, 6), sid, fill=(255, 255, 255))
        sheet.paste(im, ((i % cols) * W + 3, (i // cols) * H + 3))
    sheet.save(dest / f'sheet{n // per + 1:02d}.jpg', quality=88)
print(f'{len(order)} shots -> {dest}')
