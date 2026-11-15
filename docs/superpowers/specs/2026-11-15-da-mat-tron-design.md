# Da mặt trơn một màu (base nữ rig) — thiết kế ngắn

**Ý định:** khi quay cận mặt và nói thoại, mặt không còn lộ mảng lệch màu, mép tô màu, mảng gồ quanh hốc mắt hay nét tối dưới mày. Theo quy chuẩn Stylized/Toon, chủ repo chọn để cả mặt một màu da trơn.

**Mục tiêu**
- Mặt một màu da trơn, có má hồng và bóng mũi mềm. Màu da chuyển dần sang texture gốc dưới cằm và ở cổ, không có mép cứng.
- Hết mảng gồ quanh hốc mắt.
- Hết nét tối dưới đầu mày.

**Không làm:** không sửa texture gốc, không đổi UV thân, không đụng tới miệng hay rig.
**Phản mục tiêu:** chỗ cổ chuyển màu lộ thành vệt; mí hở khỏi hốc khi chớp hoặc nhìn; 39 kiểm hiện có báo lỗi.

## Các cách đã cân nhắc
- **A. Đổi UV** cả đầu về một điểm da trơn. Cách này đơn giản, nhưng tạo một đường cắt ngang cổ và mất má hồng.
- **B. Trộn trong vật liệu** — chủ repo chọn. Dùng thuộc tính đỉnh `mat_tron` (1 ở mặt, giảm dần về 0 ở cằm/cổ) để trộn màu da trơn với texture. Má hồng làm bằng thuộc tính `ma_hong`. Không có mép cứng, UV giữ nguyên.

## Cách làm (B)
- Thêm hai thuộc tính đỉnh float trên `Nu_Than`:
  - `mat_tron`: smoothstep theo cao độ và độ xa tâm mặt, chạy từ ~1,60 m xuống ~1,30 m. Mặt sau đầu cũng bằng 1.
  - `ma_hong`: giảm dần theo khoảng cách tới hai điểm má.
- Màu da trơn là trung vị màu texture da trán. Má hồng là màu đó pha thêm đỏ.
- Gỡ phần tô UV dải mắt–mày và UV mí, vì vật liệu mới đã thay việc này. Mí dùng chung màu da trơn.
- **Hốc mắt:** ghim viền hốc, làm trơn mạnh 2–4 vòng đỉnh ngoài viền.
- **Nét dưới mày:** chụp lại sau khi làm B. Nếu vẫn thấy, gọt thêm đỉnh ở chỗ đó.
- **Kiểm:** thêm kiểm vật liệu da có trộn `mat_tron`. Chạy lại 39 kiểm cũ, rồi chụp ảnh thẳng, 3/4, toàn mặt và miệng há để duyệt.

**Để người dựng tự quyết:** trị số chính xác của các dải chuyển màu và màu má hồng (duyệt bằng ảnh).
