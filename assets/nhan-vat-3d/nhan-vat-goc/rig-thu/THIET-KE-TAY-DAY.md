# Thiết kế ngắn: đắp lại tay, tay mập vừa, vá nách mịn — NHAN-VAT-GOC-001

Trạng thái: **chờ chủ repo duyệt** (14/11/2026). Bổ sung cho [THIET-KE-DAU-TROC-NGON-VAI.md](THIET-KE-DAU-TROC-NGON-VAI.md); tiếp theo phần cắt nách đã làm trong `rig_goc.py`.

## Mục đích

Sau khi cắt dính nách, vai và bắp tay mỏng hơn bản gốc, vùng vá còn gồ ghề. Chủ repo muốn cả cánh tay từ vai tới cổ tay đầy đặn, **mập hơn bản gốc ở mức vừa**, và các chỗ đã cắt phải mịn.

**Không làm trong lượt này:** đổi hình dáng bàn tay và ngón, đổi tỉ lệ chiều dài tay, rig lại bản vai khác.

**Coi là hỏng nếu:** tay trông phình như bơm, cổ tay và bàn tay không khớp cẳng tay, hoặc vẫn thấy gờ ở chỗ vá nách; số cạnh giãn khi giơ tay tăng so với bản hiện tại.

## Cách làm (chủ repo chọn cách 3)

Các cách đã cân nhắc: (1) chỉ đắp lại đúng bản gốc ở vai và bắp tay; (2) chỉ phình cả cánh tay vài phần trăm; (3) cả hai. Chọn cách 3 vì (1) trả lại độ dày bị mất, còn (2) một mình sẽ để bắp tay mỏng hơn tỉ lệ.

Mọi bước nằm trong `rig_goc.py`, chạy ngay sau khi vá nách và trước khi dựng rig; file nguồn không bị sửa.

1. **Đắp lại vai và bắp tay.** Với mỗi đỉnh của vùng tay (`vung_tay`) trong 40% đầu từ vai, tìm độ dày gốc: khoảng cách từ trục tay tới đỉnh gốc gần nhất cùng hướng, đo ở lưới tay buông trước khi dang 80°, rồi dời đỉnh ra theo pháp tuyến cho bằng độ dày gốc. Phần mới vá dùng đường nội suy từ đỉnh gốc xung quanh.
2. **Phình cả cánh tay** theo bán kính quanh trục vai–khuỷu–cổ tay: hệ số **+5%** ở giữa, giảm mượt về 0 ở 8% chiều dài gần vai và gần cổ tay để không lệch ở khớp. Gợi ý của trợ lý: "vừa" = khoảng 5%, chủ repo chưa nêu số, sẽ chỉnh theo ảnh.
3. **Mịn chỗ cắt.** Chia mịn lớp vá hơn (cạnh ≤ 3 mm thay vì 4 mm) và chỉ làm mượt đúng dải nối (khoảng 8 vòng đỉnh quanh mép), không làm mượt cả vùng vai như hiện tại. Cắt thêm rãnh còn lại ở trước nách bằng cùng cách, nới vùng tìm chỗ dính ở mặt trước.

## Kiểm tra

- Số đo độ dày theo 10 đoạn tay: vai–bắp tay ≥ bản gốc, cả tay lớn hơn gốc khoảng 5% ± 2%, cổ tay không nhảy bậc.
- Ảnh: tay dang 80°, tay buông, giơ 105° và 140°, nhìn từ trước, bên, trên.
- Số cạnh giãn quá 2 lần ở các dáng thử không tăng so với hiện tại (giơ 140° hiện là 16 cạnh).
- Dáng nghỉ lệch dưới 0,5 mm; ngón và nắm tay vẫn chạy.

## Để người dựng tự quyết

Hệ số giảm ở hai đầu, số vòng làm mượt, ngưỡng hướng khi tìm độ dày gốc.
