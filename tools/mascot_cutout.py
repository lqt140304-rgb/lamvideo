import sys, os, glob, json, numpy as np
from PIL import Image
from scipy import ndimage as ndi

NAMES = {
 "01_dung_tu_nhien":"stand","02_khoanh_tay":"arms","03_chong_hong":"hips","04_vay_tay":"wave","05_gio_tay_ok":"ok",
 "06_gio_ngon_cai":"thumbs","07_chi_tay":"point","08_gioi_thieu":"present",
 "01_binh_thuong":"neutral","02_cuoi_mat_hiep":"smile","03_cuoi_nham_mat":"happy","04_nhay_mat_thumbs_up":"wink",
 "05_vui_mung":"cheer","06_hao_hung":"excited","07_tu_tin":"confident","08_tao_tim":"heart",
 "01_suy_nghi":"think","02_boi_roi":"confused","03_ngac_nhien":"surprised","04_soc":"shocked","05_buon":"sad",
 "06_tuc_gian":"angry","07_met_moi":"tired","08_xau_ho":"shy","09_khoc":"cry",
 "01_di_bo":"walk","02_chay":"run","03_nhay":"jump","04_cui_chao":"bow","05_nhat_do":"lift","06_cam_bang_kep":"clipboard",
 "07_uong_nuoc":"drink","08_an":"eat","09_selfie":"selfie","10_deo_balo":"backpack",
}
src, out = sys.argv[1], sys.argv[2]
SCALE = 0.62
REF_FACE = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
os.makedirs(out, exist_ok=True)
meta = {}
skipped = {}
for f in sorted(glob.glob(src + "/*/*.png")):
    key = os.path.basename(f)[:-4]; name = NAMES[key]
    a = np.array(Image.open(f).convert("RGB")).astype(float)
    h, w, _ = a.shape
    border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    bgc = np.median(border[np.abs(border - [247, 246, 251]).max(1) < 12], 0)
    d = np.abs(a - bgc).max(2)
    core = d >= 45
    # bỏ mảnh hình bên cạnh dính vào mép ảnh
    lab, n = ndi.label(ndi.binary_dilation(core, iterations=3), structure=np.ones((3, 3)))
    sizes = ndi.sum(core, lab, range(1, n + 1))
    main = int(np.argmax(sizes)) + 1
    edge_ids = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0, main}
    junk = np.isin(lab, list(edge_ids))
    # những đốm rất nhỏ ở xa nhân vật
    for i in range(1, n + 1):
        if i != main and sizes[i - 1] < 60: junk |= lab == i
    core &= ~junk
    # nhân vật chạm mép ảnh: bao nhiêu điểm ảnh chạm mép mỗi cạnh
    ml, _ = ndi.label(core, structure=np.ones((3, 3)))
    msz = ndi.sum(core, ml, range(1, ml.max() + 1)); mm = ml == (np.argmax(msz) + 1)
    contact = {"left": int(mm[:, 0].sum()), "right": int(mm[:, -1].sum()), "top": int(mm[0].sum()), "bottom": int(mm[-1].sum())}
    clipped = {k: v for k, v in contact.items() if v > 50}
    if clipped:
        print(f"BỎ QUA {key} → {name}: bị cắt mép {clipped}")
        skipped[name] = {"src": os.path.relpath(f, src), "edges": clipped}
        continue
    # chạm mép rất ít (đầu nét tóc): khép viền theo mép ảnh để mặt không bị coi là nền
    closed = core.copy()
    for side, v in contact.items():
        if not v: continue
        if side == "left": rows = np.where(mm[:, 0])[0]; closed[rows.min():rows.max() + 1, 0] = True
        if side == "right": rows = np.where(mm[:, -1])[0]; closed[rows.min():rows.max() + 1, -1] = True
    sil = ndi.binary_fill_holes(ndi.binary_closing(closed, iterations=2))
    # lỗ nền kín (giữa tay và thân, giữa hai chân): màu nền ánh tím, rất đều
    low = (d < 14) & sil
    llab, ln = ndi.label(low)
    for i in range(1, ln + 1):
        m = llab == i; s = m.sum()
        if s < 250: continue
        c = a[m].mean(0); sd = a[m].std(0).mean()
        if c[2] - c[0] >= 1.5 and sd <= 4.5 and np.abs(c - bgc).max() < 5:
            sil &= ~ndi.binary_dilation(m, iterations=1)
    # cỡ mặt (vùng trắng ấm lớn nhất) để đưa mọi tư thế về cùng tỉ lệ
    flab, fn = ndi.label((d < 16) & sil)
    face = 0
    for i in range(1, fn + 1):
        m = flab == i; s = int(m.sum())
        if s > face and a[m][:, 0].mean() >= a[m][:, 2].mean(): face = s
    # ngoài khối nhân vật: chuyển màu nền thành trong suốt (giữ bóng đổ mềm, viền khử răng cưa)
    alpha = np.ones((h, w))
    out_rgb = a.copy()
    outside = ~sil
    with np.errstate(divide="ignore", invalid="ignore"):
        al = np.clip(((bgc - a) / np.maximum(bgc, 1)).max(2), 0, 1)
        al = np.where(al < 0.035, 0, al)
        col = (a - (1 - al)[..., None] * bgc) / np.maximum(al, 1e-3)[..., None]
    band = outside & ndi.binary_dilation(sil, iterations=3)
    alpha[outside] = 0
    alpha[band] = al[band]
    out_rgb[band] = np.clip(col[band], 0, 255)
    alpha[ndi.binary_dilation(junk, iterations=6) & outside] = 0
    rgba = np.dstack([out_rgb, alpha * 255]).round().clip(0, 255).astype(np.uint8)
    ys, xs = np.where(alpha > 0.03)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    # chân: đáy của khối đặc (không tính bóng đổ)
    sys_, sxs = np.where(sil)
    feet = int(sys_.max())
    shadow = (d >= 10) & ~ndi.binary_dilation(junk, iterations=8)
    cols = slice(max(0, sxs.min()), sxs.max() + 1)
    srows = np.where(shadow[:, cols].sum(1) > 25)[0]
    ground = int(srows.max()) if len(srows) else feet
    ground = max(feet, min(ground, feet + 160))
    pad = 6
    box = (max(0, x0 - pad), max(0, y0 - pad), min(w, x1 + pad + 1), min(h, y1 + pad + 1))
    im = Image.fromarray(rgba).crop(box)
    k = SCALE * (np.sqrt(REF_FACE / face) if "04_hanh_dong" in f and face else 1.0)
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    im.save(f"{out}/{name}.png", optimize=True)
    touches = sxs.min() <= 2 or sxs.max() >= w - 3 or sys_.min() <= 2
    # điểm neo: giữa hai chân theo chiều ngang = giữa khối đặc ở 8% dưới cùng
    bottom = sil[int(feet - 0.06 * (feet - sys_.min())):feet + 1]
    bx = np.where(bottom.any(0))[0]
    meta[name] = {
        "w": im.width, "h": im.height,
        "footX": round(((bx.min() + bx.max()) / 2 - box[0]) * k),
        "footY": round((ground - 8 - box[1]) * k),
        "src": key, "face": face, "k": round(k, 3),
    }
    print(f"{name:10s} {im.size} foot=({meta[name]['footX']},{meta[name]['footY']}) touchesEdge={touches} junkPx={int(junk.sum())}")
json.dump(meta, open(f"{out}/mascot.json", "w"), indent=1)
json.dump(skipped, open(f"{out}/../v3_skipped.json", "w"), indent=1, ensure_ascii=False)
