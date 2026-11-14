# Sửa rãnh nách trên thân cage mới — 14/11/2026

Thực hiện trên nhánh `fix/nam-cage-armpit`, từ `860807d` của `claude/elegant-knuth-w1im6b` (đã có bản gắn tay/chân `538aef4`). Không sửa thân voxel v2.11, không thay bàn tay/bàn chân mới hoặc nguồn đầu.

## Thay đổi

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

## Dựng và soi

Từ gốc repo, dựng file đã sửa bằng entry đang gắn tay/chân mới:

```bash
blender -b -t 4 --python-exit-code 1 --python episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/gan_tay_chan_nam.py -- --check --blend what-if-studio/out/ho-so-02-nguoi-lam-thay/armpit/Nam_Cage_Nach.blend
```

Giữ file trước sửa và dùng công cụ [soi_nach_nam.py](soi_nach_nam.py) để kiểm, xuất ảnh cùng máy/ánh sáng:

```bash
blender -b -t 4 --python-exit-code 1 --python episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/soi_nach_nam.py -- --before what-if-studio/out/ho-so-02-nguoi-lam-thay/armpit/before.blend --after what-if-studio/out/ho-so-02-nguoi-lam-thay/armpit/Nam_Cage_Nach.blend --out what-if-studio/out/ho-so-02-nguoi-lam-thay/armpit/doi-chieu --render --samples 48
```

Đầu ra local trong `what-if-studio/out/ho-so-02-nguoi-lam-thay/armpit/`: file trước/sau, ảnh chính diện/góc chéo và toàn thân; `doi-chieu/kiem-tra-nach.json` là báo cáo. Cycles CPU, Blender 4.3.2; denoise chỉ bật nếu bản Blender hỗ trợ. Không commit file Blender hoặc ảnh render nặng.
