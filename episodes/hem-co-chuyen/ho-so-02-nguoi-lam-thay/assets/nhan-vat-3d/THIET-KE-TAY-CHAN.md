# Thiết kế bàn tay & bàn chân riêng cho Nam (đã duyệt 13/11/2026)

## Vì sao
Tay/chân đang liền trong lưới `Nam_Dau_Than`; mỗi lần sửa phải dựng lại cả rig (~15 phút) và lỗi ngón khó cô lập. Làm riêng một bàn tay và một bàn chân phóng lớn, kiểm nhiều góc và tư thế trước khi ghép, để sửa nhanh và chính xác. Tham chiếu: phác thảo "NAM — Phác thảo bàn tay & bàn chân 3D" của chủ repo.

## Cách làm đã chọn
- **Đã cân nhắc:** (A) hàn liền vào lưới thân rồi tính lại trọng số: liền mạch nhưng mỗi lần sửa phải dựng lại rig; (B) vật riêng gắn vào xương: sửa riêng nhanh, có chỗ nối cần xử lý.
- **Chủ repo chọn B:** làm bản đẹp rồi sửa nếp nối.

## Bàn tay (dựng tay trái, lật gương ra tay phải)
- Lòng tay hộp bo tròn, hơi dẹt, thu về cổ tay.
- Bốn ngón ngắn, đầy, đầu tròn, mỗi ngón 3 đốt. Dựng thành khối chung trước, chia ngón sau.
- Ngón cái có khối gốc nối mềm vào cạnh lòng tay, lệch ra trước mặt lòng tay, không cắm ngang như que.
- Không móng, gân, nếp khớp. Ưu tiên silhouette.
- Rig thử riêng, 4 tư thế: thả lỏng, nắm tay, cầm cốc (có cốc thử), xòe.

## Bàn chân
- Khối nêm bo tròn: gót nhỏ, mũi rộng, mu chân dốc lên cổ chân, đế phẳng tiếp sàn.
- Ngón ngắn, chia nông; ngón cái rõ ở phía trong.
- Thử tư thế đứng và nhấc gót. Dép làm sau, bao theo chân (không ép chân vừa dép dựng sẵn).

## Gắn vào Nam (B)
- Cắt bàn tay/bàn chân cũ khỏi lưới thân tại cổ tay/mắt cá.
- Vật mới có đoạn cổ ngắn lồng vào trong đầu cẳng tay/cẳng chân; biến dạng theo `hand`/`foot` và xương ngón bằng trọng số riêng.
- Sửa nếp nối: khớp bán kính chỗ giao, chung vật liệu da, chuyển pháp tuyến từ thân sang để không thấy viền.

## Thứ tự, mỗi bước dừng để chủ repo duyệt
1. Bàn tay + bảng ảnh nhiều góc/tư thế.
2. Bàn chân + bảng ảnh.
3. Gắn vào Nam, soi cận chỗ nối ở nhiều tư thế.
4. Dép (sau).

## Ngoài phạm vi
Mắt/miệng (chủ repo chỉnh riêng), quần áo khác ngoài dép, móng/gân/nếp khớp.

## Tệp
`dung_tay_nam.py`, `dung_chan_nam.py` trong thư mục này; ảnh kiểm trong `render-than/` (không commit).

## Để người dựng tự quyết
Kích thước tuyệt đối khớp với cổ tay/mắt cá hiện tại của Nam; mật độ lưới; số và hướng xương ngón trong rig thử.
