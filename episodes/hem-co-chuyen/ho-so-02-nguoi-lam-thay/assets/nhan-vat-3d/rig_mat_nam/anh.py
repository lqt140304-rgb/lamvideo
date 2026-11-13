"""Ảnh kiểm cho đầu diễn hoạt: cùng studio/ánh sáng trung tính của dung_dau_nam, ảnh nhỏ, ghép bảng bằng Pillow (chạy ngoài Blender được)."""
import os
import bpy
import dung_dau_nam as D

GOC = {'truoc': 'Cam_Front', 'nghieng': 'Cam_Right', '3q': 'Cam_34'}


def chuan_bi(co=420, mau=16):
    sc = bpy.context.scene; cams = D.studio(sc)
    sc.render.resolution_x = sc.render.resolution_y = co
    if sc.render.engine == 'CYCLES': sc.cycles.samples = mau
    return sc, cams


def hien(goc=False):
    """goc=True: chỉ hiện đầu gốc (Nam_Dau); False: chỉ hiện đầu diễn hoạt (Nam_DienHoat)."""
    bpy.data.collections['Nam_Dau'].hide_render = not goc
    bpy.data.collections['Nam_DienHoat'].hide_render = goc
    for c in ('04_Hair_cu', '04_Hair_v2', '04_Hair_v3'): bpy.data.collections[c].hide_render = True


def chup(sc, cams, ten_cam, duong):
    sc.camera = cams[ten_cam]; sc.render.filepath = duong; bpy.ops.render.render(write_still=True); return duong


def bang(anh, ra, cot, nhan=None, cat=None, o=None):
    """Ghép danh sách ảnh thành bảng `cot` cột; `cat` = (x0, y0, x1, y1) cắt từng ảnh; `o` = cỡ ô vuông."""
    from PIL import Image, ImageDraw
    ims = []
    for f in anh:
        im = Image.open(f).convert('RGB')
        if cat: im = im.crop(cat)
        if o: im = im.resize((o, int(o * im.size[1] / im.size[0])), Image.LANCZOS)
        ims.append(im)
    w, h = ims[0].size; hang = (len(ims) + cot - 1) // cot; b = Image.new('RGB', (w * cot, h * hang), 'white'); dr = ImageDraw.Draw(b)
    for i, im in enumerate(ims):
        b.paste(im, ((i % cot) * w, (i // cot) * h))
        if nhan: dr.text(((i % cot) * w + 5, (i // cot) * h + 4), nhan[i], fill=(200, 0, 0))
    b.save(ra); return ra
