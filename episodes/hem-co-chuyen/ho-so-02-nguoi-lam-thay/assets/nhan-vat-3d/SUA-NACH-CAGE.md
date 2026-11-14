# Sửa rãnh nách trên thân cage mới — 14/11/2026

Thực hiện trên nhánh `fix/nam-cage-armpit`, từ `860807d` của `claude/elegant-knuth-w1im6b` (đã có bản gắn tay/chân `538aef4`). Không sửa thân voxel v2.11, không thay bàn tay/bàn chân mới hoặc nguồn đầu.

## Vòng 2 — nâng hõm, sâu phía trên và chuyển mềm xuống tay

Theo góp ý nách còn thấp, làm vai/tay có cảm giác như tay áo: nâng vùng `duoi_nguc` tại nách lên 46–65 mm trên cage, thu vào trong và đưa vòng gốc bắp tay từ z 0,718 lên 0,770 m. Điều chỉnh trục vòng gốc và vị trí vòng giữa bắp tay để chuyển tiếp xuống dưới; giữ nguyên vị trí khuỷu và vòng cổ tay. Cố định trục nghỉ cũ của vòng khuỷu để thay đổi bắp tay không truyền tới chỗ gắn bàn tay qua Subdivision.

Giảm `AXILLA_CREASE` từ 0,28 xuống 0,18: phần lõm tạo bằng hình khối thay vì tăng cạnh sắc. Cập nhật `z_nach` theo đáy cage đã nâng, nên dải đo khe hiện là z 0,635–0,735 m, không dùng lại dải thấp của vòng 1.

Đối chiếu với file vòng 1 `Nam_Cage_Nach.blend`:

- Đo bằng tia trên geometry: đầu khe chiếu trước rộng ít nhất 2 mm tăng từ z 0,689 lên 0,744 m, tức **55 mm** (lấy mẫu z 1 mm, x 0,5 mm). Đây là cao độ khe chiếu, không phải độ sâu da hay tâm khớp.
- 1.732/48.522 đỉnh thay đổi, độ dịch lớn nhất khoảng 61,76 mm. Phạm vi gồm nách, mặt ngực kề bên và vùng chuyển tiếp bắp tay xuống dưới; không scale toàn thân.
- Vòng cổ tay trên thân giữ nguyên trong dung sai 0,0001 mm; `Head_Base`, bốn object tay/chân mới giữ nguyên toàn bộ dữ liệu vertex. Thân đối xứng.
- 12 kiểm cage/assembly và 9 kiểm nối đạt; không tự giao, không hở lưới, đế vẫn tại sàn, cao khoảng 1,6003 m. Khe đo dưới nách nhỏ nhất khoảng 11,7 mm.
- Vẫn chỉ kiểm hình tĩnh; chưa rig, chưa kiểm khi nâng tay.

Đầu ra local: `what-if-studio/out/ho-so-02-nguoi-lam-thay/armpit-v2/Nam_Cage_Nach_Cao.blend` và thư mục `doi-chieu/` (ảnh cận, toàn thân và JSON). File vòng 1 được giữ riêng.

Dựng lại từ đầu bằng nguồn hiện tại:

```bash
blender -b -t 4 --python-exit-code 1 --python episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/gan_tay_chan_nam.py -- --check --blend what-if-studio/out/ho-so-02-nguoi-lam-thay/armpit-v2/Nam_Cage_Nach_Cao.blend
```

Lệnh soi vòng 2:

```bash
blender -b -t 4 --python-exit-code 1 --python episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/soi_nach_nam.py -- --before what-if-studio/out/ho-so-02-nguoi-lam-thay/armpit/Nam_Cage_Nach.blend --after what-if-studio/out/ho-so-02-nguoi-lam-thay/armpit-v2/Nam_Cage_Nach_Cao.blend --arm-falloff-z .50 --min-gap-rise .03 --out what-if-studio/out/ho-so-02-nguoi-lam-thay/armpit-v2/doi-chieu --render --samples 24
```

`--arm-falloff-z .50` cho phép đoạn tay chuyển tiếp phía dưới khuỷu, nhưng vẫn kiểm riêng vòng cổ tay phải giữ nguyên và bảo vệ bụng dưới/chân. `--min-gap-rise .03` đòi đầu khe cao lên ít nhất 30 mm. Khi render, công cụ dựng cùng bộ đèn studio cho hai snapshot và dùng Cycles CPU; không lưu đè file đầu vào.

## Vòng 1 — bản `a345181`

Ảnh cận bản đầu có khe tay–thân nhưng phần đầu khe tròn và nếp lõm phía trong còn yếu. Sửa năm điểm cage thuộc mức `nguc` và `duoi_nguc`: thu nhẹ phía trước/sau, nâng và thu đáy nách vào trong. Thêm `crease_edge = 0.28` cho hai cạnh ở đáy vòng nách, giữ nếp nhẹ sau Subdivision thay vì tạo lỗ hoặc cạnh cứng. Mirror áp dụng hai bên.

Nguồn: [dung_than_cage_nam.py](dung_than_cage_nam.py), các tham số `CAGE_OVERRIDE` và `AXILLA_CREASE`. Không đổi số lượng đỉnh hoặc topology của cage. Subdivision truyền ảnh hưởng sang mặt ngực kề nách, nên không tuyên bố chỉ một điểm rãnh thay đổi. Không thêm texture hoặc bóng giả để vẽ nếp lên da.

## Kiểm tra

- Bản lắp ráp giữ 48.522 đỉnh; 1.190 đỉnh thay đổi trên vùng nách/ngực kề bên, dịch chuyển lớn nhất khoảng 10,30 mm. Đầu/cổ, phần dưới thân và đoạn tay xa không đổi ngoài dung sai so sánh 0,0001 mm.
- Dữ liệu vertex của `Head_Base` và bốn object bàn tay/bàn chân mới giữ nguyên hoàn toàn.
- Thân đối xứng, sai số đối xứng gần nhất khoảng 0,000123 mm.
- 12 kiểm tra cage/assembly đạt: biên cage đúng, assembly kín, pháp tuyến ra ngoài, không tự giao, cổ khớp, khe nách/háng đạt. Khe tay–thân đo trong dải kiểm là khoảng 7,7 mm; đây không phải phép đo độ sâu rãnh.
- 9 kiểm tra `check_seams` của entry gắn tay/chân đạt; chiều cao vẫn khoảng 1,6003 m, đế chạm sàn.
- Kiểm cũ `tay_chan_trong_ong` đòi vòng cắt hở của bàn chân cũ; không áp dụng cho bàn chân mới kín. Công cụ ghi rõ việc thay kiểm này bằng 9 kiểm tra của `gan_tay_chan_nam.py`, không bỏ qua âm thầm.

Đây là sửa hình tĩnh. Chưa rig thân cage, chưa kiểm rãnh nách khi nâng tay và chưa đo lại overlay với ảnh mẫu gốc. Các kết quả so mẫu ±5 mm trong báo cáo T4/T5 là của vòng trước.

## Lệnh lịch sử vòng 1 (nguồn tại `a345181`)

Các lệnh dưới chỉ dành cho nguồn vòng 1 tại `a345181`. Với nguồn hiện tại dùng lệnh vòng 2 phía trên để không ghi đè snapshot vòng 1. Từ gốc repo:

```bash
blender -b -t 4 --python-exit-code 1 --python episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/gan_tay_chan_nam.py -- --check --blend what-if-studio/out/ho-so-02-nguoi-lam-thay/armpit/Nam_Cage_Nach.blend
```

Giữ file trước sửa và dùng công cụ [soi_nach_nam.py](soi_nach_nam.py) để kiểm, xuất ảnh cùng máy/ánh sáng:

```bash
blender -b -t 4 --python-exit-code 1 --python episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/soi_nach_nam.py -- --before what-if-studio/out/ho-so-02-nguoi-lam-thay/armpit/before.blend --after what-if-studio/out/ho-so-02-nguoi-lam-thay/armpit/Nam_Cage_Nach.blend --out what-if-studio/out/ho-so-02-nguoi-lam-thay/armpit/doi-chieu --render --samples 48
```

Đầu ra local vòng 1 trong `what-if-studio/out/ho-so-02-nguoi-lam-thay/armpit/`: file trước/sau, ảnh chính diện/góc chéo và toàn thân; `doi-chieu/kiem-tra-nach.json` là báo cáo. Số liệu vòng 1 giữ làm lịch sử. Cycles CPU, Blender 4.3.2; denoise chỉ bật nếu bản Blender hỗ trợ. Không commit file Blender hoặc ảnh render nặng.
