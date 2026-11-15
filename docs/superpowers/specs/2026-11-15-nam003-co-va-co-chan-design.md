# NAM-003: cổ và cổ chân — thiết kế ngắn (15/11/2026)

## Ý định và lý do
Rig thân `assets/nhan-vat-3d/nam-003` đã chạy, nhưng cổ chưa đạt: quay đầu 35° tạo nếp gấp dưới hàm (cạnh dài thêm tới 12,9 mm, cúi đầu 11,3 mm; `nam-002` khoảng 5 mm). Chủ repo yêu cầu: **cổ ổn định như người thật; khi quay cận mặt phải không tì vết; cảnh xa chỉ cần ổn.** Cổ chân đang ước lượng (z ≈ 0,105) và cần chọn bằng đo như đã làm với khuỷu, gối.

## Hiện trạng (đã đo trên `nam-003-rig.blend` v2)
- Cổ ngắn, dày: bán kính ≈ 7 cm, thân cổ z 1,46–1,60; xương `Neck` dài 8 cm (z 1,50–1,58).
- Trọng số `Neck` → `Head` chuyển trong z 1,52–1,58 (6 cm). Biến dạng tập trung quanh z ≈ 1,55 dưới hàm.
- Thân đã có Corrective Smooth cho vai/háng (nhóm `cs_vai_hang`).

## Mục tiêu
1. Quay ±35°, cúi/ngửa ±25°, nghiêng ±20° và vài tư thế kết hợp: cạnh dài thêm tối đa ≤ 6 mm (nam-002: 5,4 mm), không cạnh nào giãn >1,5× quanh cổ.
2. Ảnh cận cổ và cằm từ chính diện, 3/4, bên, dưới cằm, ở cả 1,60 m và 1,70 m: không nếp gấp, thắt, xuyên da. Chủ repo duyệt ảnh trước khi coi là xong.
3. Cổ chân chọn bằng thử nhiều vị trí và đo biến dạng, cùng tiêu chí với khuỷu/gối.
4. Các tư thế khác của `rig_nam002.py` không xấu đi (vẫn 0 cạnh giãn >2×, ngồi xổm ≤ 1,89×); tối đa 4 xương/đỉnh; script dựng lại được từ đầu.

## Không làm (non-goals)
Mặt (do bên khác); áo quần; mô hình Hyper3D mới; chỉnh lại khuỷu/gối; shape key sửa riêng theo góc (chỉ làm nếu cách chọn chưa đạt, và là bước sau, hỏi lại chủ repo).

## Điều phải tránh (anti-goals)
- Đổi xương `Head`, trọng số đầu hay vị trí đầu: bên làm mặt phụ thuộc vào đó.
- Báo "đạt" chỉ vì số đo đẹp trong khi ảnh cận vẫn còn nếp.
- Phá giới hạn 4 xương/đỉnh hoặc làm rig không xuất được sang engine khác.

## Ràng buộc
Blender 5.2.x; mọi thay đổi nằm trong `rig_nam003.py` (script là nguồn chính); xương theo tên Mixamo, xương phụ đặt tên riêng (như `LeftArmBlend`); không dùng dịch vụ trả phí; không commit `.blend` nặng ngoài `nam-003-rig.blend` hiện có.

## Các cách đã cân nhắc
| | Cách | Đánh đổi |
|---|---|---|
| A | Chỉ làm mượt trọng số, nới vùng chuyển | Rẻ, nhưng skinning không chia xoắn đều dọc cổ nên khó đạt mức cận mặt |
| **B** | **Thêm xương phụ chia xoắn dọc cổ** | Cổ vặn dần như thật; thêm vài xương và việc gán trọng số; không đụng `Head` |
| **C** | **Corrective Smooth riêng cho cổ** | Rất rẻ; chỉ xử lý phần dư |
| D | Shape key sửa theo góc | Đẹp nhất nhưng tốn công; để bước sau nếu cần |

**Chủ repo chọn B + C.** Lý do: B sửa cách cổ chuyển động, C dọn phần còn lại; cả hai nằm trong phạm vi rig thân.

## Thiết kế
- **B:** hai xương phụ trên đoạn cổ (đề xuất `NeckBlend1`, `NeckBlend2`), cha là `Neck`/`Spine2`, ràng buộc Copy Rotation từ `Head` với ảnh hưởng khoảng 33 % và 66 % (như `LeftArmBlend`), trọng số theo gradient z; vùng chuyển `Neck` → `Head` mở rộng và làm mượt trong khoảng z 1,46–1,60. Xương `Head` và trọng số đầu (z ≥ 1,60) giữ nguyên.
- **C:** nhóm đỉnh `cs_co` (cổ + dưới hàm) và một Corrective Smooth thêm trên `Nam_Body` (hoặc gộp nhóm), tham số chọn bằng thử.
- **Cổ chân:** thử z 0,08–0,14 (và y lệch nhỏ) qua `NAM003_J`, đo như khuỷu/gối, chọn theo số cạnh giãn/co khi bước, ngồi xổm, nhấc chân, kèm ảnh.

## Việc để người dựng quyết
Số xương phụ (2 hay 3), tỉ lệ Copy Rotation, trục xoay (xoắn hay toàn bộ), tham số Corrective Smooth, vị trí cổ chân; thứ tự thử; tiêu chí đo phụ.

## Kiểm tra
Bảng đo số cho các góc ở mục tiêu 1; ảnh cận cổ/cằm (nhiều góc, có bóng đổ); bảng 11 tư thế cũ; kiểm chạy lại script từ đầu; báo rõ cái gì chưa kiểm (áo quần, mặt).
