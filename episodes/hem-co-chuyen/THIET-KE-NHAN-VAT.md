# Hẻm Có Chuyện — hướng thiết kế nhân vật

**Mở rộng phạm vi 10/11/2026:** hướng Style B dưới đây áp dụng cùng [quy chuẩn mỹ thuật chung](../../docs/PHONG-CACH-MY-THUAT.md) cho **cả nhân vật, nội thất, đạo cụ, nhà cửa, đường phố và thiên nhiên**. Ưu tiên nét cong mềm và khối tròn đầy; tránh người mềm nhưng nền ghép hộp cứng. Tên file được giữ để bảo toàn liên kết; chi tiết nhân vật bên dưới vẫn là tham chiếu riêng của series.

**Đã chọn ngày 09/11/2026:** chủ repo thích cách vẽ thứ 2 trong [bảng SVG thử](ho-so-02-nguoi-lam-thay/assets/thiet-ke/character-svg-v1.png), phía phải, và yêu cầu cập nhật GitHub. Dùng đây làm hướng mỹ thuật cho thiết kế mới; lựa chọn này không đồng nghĩa toàn bộ dàn nhân vật đã được vẽ lại hoặc hoàn thiện rig.

**Bộ thiết kế mới đã có tệp:** [Nam, Người Kia và Tùng — bảng SVG](ho-so-02-nguoi-lam-thay/assets/nhan-vat.svg), [nguồn React/SVG](ho-so-02-nguoi-lam-thay/assets/nhan-vat.tsx), [bảng asset/biểu cảm](ho-so-02-nguoi-lam-thay/ASSET.md). Dùng các tệp này để phát triển Hồ sơ 2 theo Style B; bảng so sánh cũ vẫn là tham chiếu hướng đã chọn. Chưa xác nhận chuyển động, khẩu hình hoặc tương tác đạt chỉ từ việc có bảng thiết kế.

**Làm nhân vật mới:** theo [cách vẽ đã chốt ngày 10/11/2026](ho-so-02-nguoi-lam-thay/assets/thiet-ke/QUY-CHUAN-THIET-KE-SVG.md#4-cách-vẽ-đã-chốt-để-làm-tiếp): nét, tỉ lệ, khớp, cách ghép bằng rig và bước kiểm tra.

## Nét cần giữ

- Cartoon ít chi tiết, dễ nhận diện và dễ vẽ lại; viền rõ, mảng màu gọn, đường nét mềm.
- Vai nối thân tự nhiên; áo đi theo khối người, hông nối với đùi có bề dày; tránh thân hình hộp và chân như que.
- Tóc bằng vài mảng lớn. Mắt, mí, lông mày và miệng đảm nhiệm diễn xuất, thay vì thêm nhiều nếp mặt hoặc chi tiết trang trí.
- Màu da tự nhiên được cách điệu; mảng sáng/tối đơn giản. Giữ nền tảng để dùng với bối cảnh 2.5D của series.
- Mỗi người có dáng, mặt, tóc và tư thế riêng; cùng ngôn ngữ nét vẽ không có nghĩa dùng một khuôn mặt cho cả dàn.

The Simpsons chỉ là tham chiếu về sự đơn giản và khả năng nhận diện mà chủ repo nêu. Không lấy nguyên nhân vật hoặc áp diện mạo của bộ phim đó vào series.

## Phạm vi và cách áp dụng

Mẫu được chọn đang nằm trong [asset Hồ sơ 2](ho-so-02-nguoi-lam-thay/ASSET.md); nguồn React/SVG được giữ ở đó để sửa. Không sao chép mẫu riêng của tập vào nhiều thư mục rồi tạo các bản lệch nhau. Chỉ chuyển thành thư viện rig chung sau khi đã tách phần tái sử dụng và kiểm tra.

Đã kiểm tra ảnh tĩnh với ba biểu cảm. Chưa kiểm tra khẩu hình khi nói, chuyển góc, khớp, cầm nắm hoặc tương tác. Khi được giao sản xuất, kiểm tra storyboard rồi animatic theo quy trình repo; không xem ảnh đẹp là bằng chứng motion đã đạt. Các thiết kế và bản dựng Hồ sơ 1 giữ nguyên cho tới khi có yêu cầu thay đổi cụ thể.
