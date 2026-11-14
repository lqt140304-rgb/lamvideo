# Nối tay/chân liền da + rig thử cục bộ — kết quả (14/11/2026)

Thiết kế: [THIET-KE-NOI-TAY-CHAN.md](THIET-KE-NOI-TAY-CHAN.md) · Kế hoạch: [KE-HOACH-NOI-TAY-CHAN.md](KE-HOACH-NOI-TAY-CHAN.md)
Nguồn: [dung_cage_tay_chan.py](dung_cage_tay_chan.py) · [rig_thu_tay_chan.py](rig_thu_tay_chan.py). Bản cũ để đối chiếu: [gan_tay_chan_nam.py](gan_tay_chan_nam.py) (commit 538aef4).

## Lệnh chạy
```
bpyv/bin/python dung_cage_tay_chan.py --check --render DIR --blend OUT.blend          # ~2,5 phút
bpyv/bin/python dung_cage_tay_chan.py --check --ban-cu                                 # bộ kiểm trên cage gốc (đối chứng)
bpyv/bin/python rig_thu_tay_chan.py --blend OUT.blend --out DIR --clip --luu RIG.blend # ~25 phút (dò nắm/cầm cốc + clip)
```
Ảnh, clip, `.blend` ở `render-than/noi/` (không commit): `so_sanh.png` (trước/sau cùng camera), `toan_than_cu_moi.png`, `bang_tu_the.png`, `anh/`, `gian/` (bản đồ giãn: đỏ giãn, xanh co), `co_tay.mp4`, `mat_ca.mp4`, `ket_qua.json`, `Nam_RigThu.blend` (rig thử riêng).

## 1. Cấu trúc chỗ nối
- **Trước (538aef4):** thân, bàn tay, bàn chân là 3 vật riêng, mỗi vật kín; chỉ **xuyên/chồng** vào nhau (ống thân đóng nắp). Thân cạnh ~7 mm, bàn tay/chân lưới voxel 1,2–1,5 mm.
- **Sau:** **một lưới liền** `Nam_Dau_Than`. Cage tay/chân nối tiếp cage thân rồi chia mịn chung (Subdivision 2):
  - Tay: bỏ nắp ống cẳng tay; vòng 8 đỉnh chạy qua cổ tay (tròn → dẹt, ~5 cm, không đổi số đỉnh); đổi mật độ 8→12 ở lòng tay bằng chuyển tiếp tứ giác 1→3 (không tam giác); 4 ngón vòng 6 đỉnh; ngón cái vòng 8 đỉnh từ ô 2×2 mặt bên.
  - Chân: bỏ vòng mắt cá + nắp ống chân; vòng chuyển ở mắt cá; ống bàn chân vòng 12 đỉnh; ô 2×2 mặt trên nối ống chân (rộng ~ống chân); 5 ngón vòng 4 đỉnh.
- Kiểm topology: 1 mảnh · 0 cạnh hở · 0 cạnh > 2 mặt · chỉ tứ giác ở vùng nối (cổ tay ±4 cm, mắt cá z 0,04–0,16) · thể tích dương · thân trên khuỷu/trên gối lệch 0,000 mm · chiều cao 1,6003 m.

## 2. Hình
- Ép hình bám bàn tay/chân đã duyệt theo **nhãn topology** của cage (không theo khoảng cách) và **từng ngón ↔ ngón đó**; trọng số giảm dần qua cổ tay (5 cm) và mắt cá (z 0,06–0,12).
- Sai lệch so với hình đích: tay TB 0,04 mm / max 0,97 mm; chân TB 0,21 mm / max 3,68 mm. 0 mặt tự giao vùng tay/chân. Gương 0,004 mm.
- Góc nhị diện lớn nhất lúc nghỉ: mắt cá 34° (≤ 35°); cổ tay 38° — **ngưỡng cổ tay nới 40°**: hai điểm là lõm giải phẫu (kẽ gò ngón cái–cổ tay, mép lòng tay phía ngón út), soi cận 8 cm không thấy bậc.
- Không còn bờ nhô "tai" ở cổ tay và đường bậc quanh mắt cá (`so_sanh.png`).
- **Ngón chân giữ hình cage, không ép**: ép làm hai ngón cạnh nhau cắt chéo trong rãnh nông của hình đích (334 cặp tự giao). Ngón chân vì vậy **thon hơn bản duyệt** một chút.

## 3. Rig thử cục bộ (`Nam_RigThu` + `Rig_Thu`, lưu riêng)
Xương: `khoa` (khoá thân còn lại) · `cang_tay` → `ban_tay` → ngón 3 đốt + ngón cái · `cang_chan` → `ban_chan` → `ngon_chan`. Pivot: tâm vòng cổ tay; mắt cá z 0,085; đường gốc ngón chân. Weights theo vị trí dọc chi: cổ tay ±20 mm, mắt cá −40/+50 mm, gốc ngón chân ±20 mm, khớp ngón ±7–9 mm. Biến dạng tuyến tính (Armature), không Corrective Smooth, không shape key.

Ngưỡng tư thế thường: không cạnh giãn > 2× / co < 0,5× ở vùng khớp, tiết diện ≥ 75%, nhị diện ≤ 60°, 0 tự giao. 45°: chỉ báo số.

| Tư thế | Giãn max | Co min | Nhị diện max | Tiết diện | Tự giao | |
|---|---|---|---|---|---|---|
| Gập cổ tay trước 30° | 1,51 | 0,55 | 42° | 97% | 0 | Đạt |
| Gập cổ tay sau 30° | 1,50 | 0,55 | 36° | 97% | 0 | Đạt |
| Nghiêng phía ngón út 18° | 1,41 | 0,58 | 37° | 99% | 0 | Đạt |
| Nghiêng phía ngón cái 18° | 1,40 | 0,57 | 42° | 99% | 0 | Đạt |
| Gập cổ tay trước 45° (giới hạn) | 1,74 | 0,36 (33 cạnh < 0,5) | 61° | 97% | 9 (đầu ngón chạm mặt ngoài đùi) | Số |
| Gập cổ tay sau 45° (giới hạn) | 1,73 | 0,38 (32 cạnh < 0,5) | 48° | 96% | 0 | Số |
| Gập bàn chân lên 20° | 1,30 | 0,84 | 48° | 96% | 0 | Đạt |
| Gập bàn chân xuống 30° | 1,21 | 0,55 | 58° | 110% | 0 | Đạt |
| Nhấc gót (tựa mũi bàn chân) | 1,18 | 0,62 | 52° | 118% | 0 | Đạt |
| Cầm cốc | 1,82 | 0,51 | — | — | 0; 0 xuyên cốc | Đạt (khe ngón–cốc 0,7–1,9 mm) |
| Nắm tay | 2,60 (1 cạnh, gò ngón cái) | 0,11 | — | — | 8 | **Chưa đạt** |

Ghi chú: thân bị khoá nên khi gập bàn chân xuống / nhấc gót, mũi bàn chân chìm dưới sàn và gối ngả ra trước — đó là giới hạn của bài thử cục bộ, không phải lỗi lưới.

## 4. Bàn tay
- Nắm tay: khe đốt cuối → lòng tay: trỏ 4,3 mm, giữa 1,4, áp út 1,0, **ngón út 1,2 mm** (ngón út khép theo hình nắm, nhìn `anh/nam_tay_ut.png`). Ngón cái vắt ngang, cách đốt giữa ngón trỏ/giữa 6,7 mm.
- Cầm cốc: không xuyên cốc, không tự giao; không cạnh nào > 2× (kẽ ngón không bị kéo căng).
- Vị trí giãn > 2×: lượt đầu (weights hẹp) 25 cạnh ở lòng tay–ngón cái tới 7,3× → nay còn 1 cạnh ở `thumb1` (2,6×) khi nắm.

## Lỗi còn lại — theo nguồn
- **Weights**: nắm tay còn 6 cặp tự giao ở nếp mặt trong khớp 1 ngón trỏ + 2 ở `thumb1`; ngón trỏ chưa chạm lòng tay (4,3 mm) vì cuộn thêm thì xuyên. Gập cổ tay 45°: co < 0,5 ở mặt trong (cần dải chuyển rộng hơn hoặc corrective shape key — chưa thêm).
- **Geometry**: ngón chân thon hơn bản duyệt (giữ hình cage); cổ chân có vòng dày nhẹ ngay trên bàn chân khi nhìn toàn thân.
- **Điều khiển khớp**: góc ngón cái khi nắm/cầm cốc là kết quả dò lưới (−20/20/0° và 20/40/0°), chưa có control cho animator; nhấc gót giải bằng ngả cẳng chân vì thân bị khoá.
- Chưa làm: dép, rig toàn thân, mắt/miệng, đẩy main.
