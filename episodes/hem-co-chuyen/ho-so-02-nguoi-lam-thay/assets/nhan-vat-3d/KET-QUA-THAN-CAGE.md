# Thân Nam dựng bằng control cage — kết quả (14/11/2026)

**Vòng sửa nách mới:** [thay đổi và kiểm tra](SUA-NACH-CAGE.md) trên bản đã gắn tay/chân `538aef4`; vòng 2 nâng đầu khe chiếu trước 55 mm so với vòng 1 và chuyển mềm xuống bắp tay, giữ hình học tay/chân mới. Các bảng đo mẫu bên dưới giữ làm kết quả lịch sử trước vòng sửa nách, chưa đo overlay lại.

Thiết kế: [THIET-KE-THAN-CAGE.md](THIET-KE-THAN-CAGE.md) · Kế hoạch: [KE-HOACH-THAN-CAGE.md](KE-HOACH-THAN-CAGE.md) · Nguồn: [dung_than_cage_nam.py](dung_than_cage_nam.py)

**Trạng thái: đạt hình khối tĩnh.** Chưa rig, chưa kiểm biến dạng. Chưa ghép bàn tay: chủ repo đang dựng tay mới.

## Lệnh chạy
```
D:/blender/blender.exe -b --factory-startup --python dung_than_cage_nam.py -- --check --render render-than/cage/giao --blend render-than/cage/Nam_than_dau.blend --mau <ảnh NAM — 3D TURNAROUND> --samples 32
D:/blender/blender.exe -b --factory-startup --python dat_nam_vao_phong.py -- --phong-dir ../boi-canh-3d --nam-blend render-than/cage/Nam_than_dau.blend --out <đường dẫn tuyệt đối>/trong_phong.png --samples 48 --width 1400
```
- Dựng xong khoảng 25 giây, cả bộ ảnh khoảng 2,5 phút trên CPU.
- `--check` in PASS/FAIL từng mục và thoát mã 1 nếu còn FAIL.
- Ảnh và `.blend` nằm ở `render-than/` (không commit). Ảnh mẫu không lưu trong repo; thiếu `--mau` thì bước đối chiếu in "CHƯA ĐỐI CHIẾU MẪU".

## Trong file Blender
- `00_Than_Cu_v211` (ẩn render): bản cũ `Nam_Dau_Than_v211` và `Nam_Than_goc`, dựng lại từ `dung_than_nam.py`.
- `02_Body_Base`:
  - `Nam_Than_Cage`: nửa cage, Mirror + Subdivision 1, sửa được, ẩn render.
  - `Nam_Dau_Than`: bản lắp ráp, gồm bản sao đầu, cage đã áp Subdivision 2 và dải nối cổ.
  - `Nam_BanChan.L/.R`: bàn chân cũ, nối tạm.
- Cách sửa dáng: đổi số trong `CAGE_LEVELS` (z, w nửa ngang, f nhô trước, b nhô sau, n độ vuông), `ARM_RINGS`, `LEG_RINGS`, `CAGE_OVERRIDE` rồi chạy lại.

## Cage
- Thân có 9 mức: `co` (chính vòng cổ của đầu × 1,08), `chan_co`, `vai`, `nguc`, `duoi_nguc`, `bung`, `eo`, `chau`, `day_chau`. Mỗi mức là nửa vòng 7 đỉnh.
- Nách là lỗ 4 mặt (8 cạnh), nằm giữa `vai` và `duoi_nguc`. Vòng tay đầu tiên nghiêng 45° để mặt trong nách không gập.
- Tay có 5 vòng 8 đỉnh tới cổ tay. Chân có 5 vòng 8 đỉnh tới mắt cá. Đáy chậu có thêm 1 đỉnh háng trên đường giữa.
- Tay và chân đóng nắp ở cuối ống; cage chỉ có 1 biên hở là vòng cổ 12 cạnh.
- Nối cổ: sau Subdivision 2, vòng cổ thân có 48 đỉnh, vòng cắt của đầu có 144 đỉnh (r = 3). Hai vòng nối bằng quạt tam giác, không thêm đỉnh và không có hai mặt giao nhau.

## Kiểm tra (`--check`, lần chạy cuối)
| Mục | Kết quả |
|---|---|
| Chiều cao | đáy −0,0007, đỉnh 1,6003 → 1,6009 m |
| Lưới lắp ráp | 0 cạnh hở, 0 cạnh > 2 mặt, thể tích dương (pháp tuyến ra ngoài), 0 cặp mặt tự giao |
| Cổ | vòng đầu 144 / vòng thân 48; không đỉnh thân nào cao hơn vòng cắt |
| Khe nách | 6,7 mm (z 0,57–0,67) |
| Khe háng | 44,5 mm (z 0,35–0,42) |
| Bàn chân cũ | 508 đỉnh mép cắt đều nằm trong ống chân |
| Test dải nối cổ | 48/48 quad; 48/144 phủ đủ, 192 mặt; 48/100 báo lỗi |

## Số đo thực (m; bề ngang toàn phần không tính tay; nhô trước, nhô sau)
| Mức | z | Cũ v2.11 | Mới |
|---|---|---|---|
| co | 0,916 | 0,178 / 0,083 / 0,067 | 0,162 / 0,080 / 0,064 |
| chan_co | 0,880 | 0,358 / 0,116 / 0,091 | 0,314 / 0,094 / 0,091 |
| vai | 0,835 | 0,409 / 0,127 / 0,101 | 0,265 / 0,116 / 0,096 |
| duoi_nguc | 0,690 | 0,242 / 0,142 / 0,105 | 0,282 / 0,112 / 0,066 |
| bung | 0,630 | 0,273 / 0,150 / 0,107 | 0,297 / 0,166 / 0,102 |
| eo | 0,580 | 0,310 / 0,158 / 0,119 | 0,312 / 0,161 / 0,120 |
| chau | 0,525 | 0,331 / 0,149 / 0,131 | 0,325 / 0,145 / 0,124 |
| day_chau | 0,475 | 0,341 / 0,120 / 0,124 | 0,329 / 0,106 / 0,101 |

Ở các mức vai–ngực, bản cũ có tay dính vào thân tới z khoảng 0,73, nên con số bề ngang của bản cũ đã gồm cả tay. Ở mức nguc và duoi_nguc của bản mới, cột nhô trước/sau chỉ đo phần đỉnh thân quanh lỗ nách. Muốn so silhouette thì dùng bảng dưới.

## Lệch so với ảnh mẫu (mm, khoảng cách từ trục: mẫu/mới)
Cách căn: chiều cao bằng nhau (đỉnh tóc hàng 42, sàn hàng 730, 1 px = 2,326 mm), trục ở giữa, không kéo giãn.
- **Trước:**
  - Chân cổ 156/158 (+2), vai 193/191 (−2), ngực 214/216 (+2), dưới ngực 242/240 (−2), bụng 149/149, eo 156/156, hông 163/163, đáy chậu 167/165.
  - Tay z 0,65: mép ngoài 256/251 (−5), mép trong 154/154. Tay z 0,60: mép ngoài 268/263 (−5), mép trong 167/167.
- **Nghiêng (trước/sau):** mọi mức từ chân cổ tới đáy chậu lệch trong ±3 mm.
- **Sau:** vai và chân cổ hẹp hơn mẫu 9–16 mm. Ảnh mẫu vẽ vai mặt sau rộng hơn mặt trước, nên tôi theo mặt trước.
- **Đối chiếu riêng:**
  - Cổ và độ dốc vai: khớp mặt trước, dốc mềm, không vuông.
  - Thân dài so với đầu: đúng mốc cằm 0,947 và háng 0,45.
  - Ngực–bụng–hông: khớp, eo chỉ thu nhẹ đúng như mẫu (mẫu gần như không thắt eo).
  - Đường bụng–lưng nhìn nghiêng: ±3 mm.
  - Mông và chỗ nối đùi: ±3 mm, nối liền.
  - Khe tay–thân: có khe như mẫu ở z 0,55–0,65.

## Còn chưa đạt
1. **Chưa có bàn tay.** Cẳng tay dừng ở cổ cũ (0,236; −0,008; 0,492), r ≈ 4,5 cm, đóng nắp tròn, chờ bàn tay mới. Nhìn từ trước, ở z 0,50 bóng mới hẹp hơn mẫu 8–15 mm vì mẫu đã bắt đầu lòng bàn tay.
2. **Bàn chân là bản cũ, nối tạm:** ống chân bọc đoạn cổ chân cũ (cắt ở z 0,10), nên còn một nếp giao mảnh ở mắt cá. Sẽ thay theo kế hoạch tay/chân riêng.
3. **Gáy:** nhìn nghiêng mỏng hơn mẫu 14 mm. Có một dải nhạt ngang ở z khoảng 0,955, do phần thu cổ (`NECK_SCALE`) của bản sao đầu; bản cũ cũng có, cùng mức độ. Đã thử làm mượt vùng cổ đầu rộng như v2.11: dải mờ đi nhưng cổ phình ra 10–14 mm so với mẫu, nên tôi bỏ cách đó. Nằm ngoài phạm vi, vì không sửa đầu.
4. **Rig cũ (`rig_nam.py`)** không còn khớp lưới mới, phải làm lại trọng số. Chưa thử biến dạng nào.
5. Cột nhô trước/sau trong `widths_table` ở hai mức nách là số đo phần đỉnh quanh lỗ nách, không phải silhouette.
