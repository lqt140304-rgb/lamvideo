# Rig thử — NHAN-VAT-GOC-001

Đây là **bản thử rig thân và ngón tay trên lưới nền đầu trọc** cho [nhân vật gốc 001](../README.md), dựng ngày 14/11/2026. Mục đích là kiểm xem mô hình mới có biến dạng được hay không. Bản này **chưa nghiệm thu diễn hoạt** và không thay rig đã duyệt của tập nào.

![Bảng dáng thử](bang-dang-thu.webp)

Hàng trên chụp chính diện, hàng dưới chụp chéo. Thứ tự: nghỉ · dạng tay 60° · giơ tay cao · gập khuỷu · quay đầu · cúi đầu · xoay thân · bước chân (IK) · ngồi xổm (IK chân). Ảnh render bằng Cycles 12 mẫu, không khử nhiễu, chỉ dùng để soi.

## Tạo file

Chạy trong thư mục này, mỗi lệnh khoảng 1–2 phút. File `.blend` tạo ra không đưa lên Git.

```powershell
D:/blender/blender.exe -b --factory-startup --python dau_troc.py -- --out nhan-vat-goc-troc.blend
D:/blender/blender.exe -b --factory-startup --python rig_goc.py -- --src nhan-vat-goc-troc.blend --out nhan-vat-goc-rig-thu.blend --anh xem-thu
```

`dau_troc.py` tạo lưới nền đầu trọc ([ảnh](dau-troc.webp)). Script bỏ tóc theo màu texture, rồi ghép hộp sọ theo khuôn `../nguon/dau-troc-tham-chieu.fbx`, căn bằng ICP lệch trung vị 5,5 mm. Đường nối được làm mượt và có dải pha màu da (thuộc tính đỉnh `pha_da`). Nốt ruồi vẫn giữ. Trên lông mày trái còn một gờ rất nhỏ. Thiếu `--src` thì `rig_goc.py` rig bản gốc còn tóc.

## Có gì

- Armature `Goc_Rig`: mặt hướng −Y, bên trái nhân vật là +X và mang đuôi `.L`. Xương thân, tay, chân như bản trước. IK chân dùng `ik_foot`/`pole_knee`. Tay chạy FK, muốn IK thì đặt `ik` = 1 trên `ik_hand`.
- **Ngón tay** (bone collection `Ngon`): `index/middle/ring/pinky/thumb` 1–3, mỗi ngón ba đốt. Đường tâm từng ngón được đo tự động trên lưới. Trên `hand.L/R` có thuộc tính `nam` (nắm cả bàn tay) và `nam_tro`, `nam_giua`, `nam_ap`, `nam_ut`, `nam_cai` (nắm từng ngón), mỗi thuộc tính từ 0 đến 1. Ví dụ chỉ tay: đặt bốn ngón kia = 1. [Ảnh bàn tay](ban-tay.webp), từ trái sang: nghỉ, nắm, nửa nắm, chỉ, xòe.
- **Vai**: xương phụ `vai_phu.L/R` theo 50% góc xoay của bắp tay, cộng thêm làm mượt rộng ở nách và vai. [Ảnh giơ tay 90° và 140°](vai-gio-tay.webp).
- Dáng nghỉ lệch tối đa 0,13 mm so với lưới nền.

## Cách gán trọng số

1. Chạy bone heat trên `model_LOD3`. Lưới này có cùng hình khối, khoảng 27 nghìn đỉnh, rồi dùng Data Transfer chuyển trọng số sang LOD0 (220 nghìn đỉnh).
2. Xác định vùng tay bằng cách **loang theo cạnh lưới** từ đầu ngón tay. Vùng loang không đi qua `|x| < 0,17` hoặc `z > 0,86`. Tay dưới nách tách khỏi thân nên bàn tay buông cạnh đùi không kéo theo đùi, và đùi hay thân cũng không kéo theo tay.
3. Mọi đỉnh trên `z = 1,035` và phần cằm đi cứng 100% theo `head`. Cổ được pha dần `chest → neck → head`.
4. Làm mượt Laplace, làm mượt thêm ở háng và nách–vai, rồi thêm Corrective Smooth nhẹ (8 vòng).

Mốc khớp được đo bằng lát cắt lưới LOD0 và ghi trong bảng `J` ở đầu script.

## Kết quả đo (bản đầu trọc)

Bảng dưới đếm số cạnh lưới bị kéo dài hơn 2 lần so với dáng nghỉ. Số này dùng để so các lần chạy, không thay cho việc xem ảnh.

| Dáng | Cạnh giãn > 2× | Tối đa | Bản trước |
|---|---:|---:|---|
| dạng tay 60° | 190 | 4,08× | 801 / 4,81× |
| giơ tay cao 140° | 2.326 | 7,06× | 3.421 / 8,33× |
| gập khuỷu | 15 | 2,33× | 36 / 2,71× |
| quay đầu | 55 | 5,11× | 119 / 2,98× |
| ngồi xổm | 1.235 | 6,12× | 1.794 / 7,75× |
| nắm tay | 4.336 | 12,07× | — |
| xòe tay | 375 | 3,81× | — |

- **Vai:** giơ tay 90° đã gọn. Giơ tay 140° vẫn còn nếp ở hõm nách, và trên sườn thân lộ ra một đường kẻ dọc ở vùng nằm khuất dưới cánh tay khi đứng nghỉ. Trong lưới gốc, cánh tay dính vào thân từ z ≈ 0,70 trở lên, đây là giới hạn của lưới chứ không riêng của rig. Đã thử thêm shape key sửa dáng tự tính (làm mượt Taubin rồi quy về dáng nghỉ): độ dời tới 30 mm nhưng ảnh chỉ đỡ chút ít, nên đã bỏ. Xương đòn tự nâng cũng đã thử và bỏ.
- **Nắm tay:** độ giãn cao nằm ở kẽ ngón, vì các ngón trong lưới gốc dính liền nhau. Nhìn ảnh thì nắm tay gọn. Mu bàn tay còn một vệt ngang mờ ở dải pha giữa vùng cổ tay và vùng ngón.
- **Quay đầu:** giá trị tối đa tăng ở vài cạnh vá gần gáy. Số cạnh vượt ngưỡng vẫn giảm.

## Chưa làm

- Chưa có xương hàm, mắt, mí hay shape key biểu cảm và viseme. Mắt, miệng và lông mày đang liền với lưới đầu.
- Chưa có tóc. Lưới nền đã trọc, tóc sẽ làm riêng cho từng nhân vật.
- Lưới nguồn chưa retopology. Vòng lưới ở vai, háng và mặt chưa được chuẩn hóa cho diễn hoạt, nên nếp gấp còn lại chủ yếu đến từ đây.
- Tay IK ở dáng nghỉ còn lệch nhẹ khi bật `ik = 1`. Sai lệch ma trận là 0,013 vì cánh tay gần như thẳng; hãy kiểm khi dùng.
