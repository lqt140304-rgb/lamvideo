"""Ghép hai "tấm ảnh" hư cấu cho truyện: ảnh ba người (Minh đứng chụp) và ảnh bốn người.
Nền là ảnh sân trường BG02, nhân vật là sprite đã cắt. Chạy: python tools/make_photos.py"""
import json
from pathlib import Path
from PIL import Image, ImageEnhance

R = Path(__file__).resolve().parent.parent / "public" / "lon-roi-hen-du-hoi"
cast = json.loads((R / "cast" / "cast.json").read_text())["chars"]
bg = Image.open(R / "img" / "BG02_san_truong.jpg").convert("RGB")
W, H = 760, 560
# cắt khung 4:3 phần sân phía trước, làm ấm nhẹ như ảnh cũ
bw, bh = bg.size
crop = bg.crop((int(bw * 0.12), int(bh * 0.18), int(bw * 0.12) + int(bh * 0.82 * W / H), int(bh * 0.18) + int(bh * 0.82))).resize((W, H))
crop = ImageEnhance.Color(crop).enhance(0.9)
warm = Image.new("RGB", (W, H), (255, 200, 130))
crop = Image.blend(crop, warm, 0.16)


def put(img, who, x, ground, body=330, pose="stand"):
    info = cast[who][pose]
    f = body / cast[who]["stand"]["bodyH"]
    sp = Image.open(R / "cast" / who / f"{pose}.png").convert("RGBA")
    sp = sp.resize((int(info["w"] * f), int(info["h"] * f)), Image.LANCZOS)
    img.paste(sp, (int(x - info["footX"] * f), int(ground - info["footY"] * f)), sp)


def minh(img, x, ground, body=330):
    sp = Image.open(Path(__file__).resolve().parent.parent / "public" / "mascot" / "smile.png").convert("RGBA")
    f = body / sp.height
    sp = sp.resize((int(sp.width * f), int(sp.height * f)), Image.LANCZOS)
    img.paste(sp, (int(x - sp.width / 2), int(ground - sp.height)), sp)


a = crop.copy()
for who, x in (("teo", 190), ("bom", 380), ("na", 570)):
    put(a, who, x, 520)
a.save(R / "img" / "anh-ba-nguoi.jpg", quality=92)
b = crop.copy()
put(b, "teo", 110, 520)
minh(b, 270, 520)
put(b, "bom", 470, 520)
put(b, "na", 640, 520)
b.save(R / "img" / "anh-bon-nguoi.jpg", quality=92)
print("ok")
