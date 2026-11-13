# Ngôn ngữ điện ảnh 3D

Áp dụng cho nhân vật và bối cảnh Blender theo [quy chuẩn 3D](QUY-CHUAN-3D.md). Tài liệu này tập hợp nguyên tắc dựng hiện hành; không phải nghiên cứu mới hoặc chứng nhận mọi tính năng đã được triển khai.

## Bố cục và chiều sâu

- Đặt tiền cảnh, nhân vật và hậu cảnh trong cùng không gian, đúng kích thước. Parallax và che khuất sinh từ vị trí thật khi máy di chuyển; không kéo từng lớp ảnh để giả camera.
- Cỡ cảnh phụ thuộc cả khoảng cách máy lẫn tiêu cự. Muốn nhân vật nổi hơn ở cận cảnh, chọn vị trí và hậu cảnh phù hợp; không thu nhỏ đồ đạc riêng cho mỗi shot.
- Giữ trục nhìn, hướng đi, vị trí cửa và trạng thái đạo cụ qua điểm cắt. Góc qua vai cần chủ thể tiền cảnh có lý do hiện diện, không che mắt hoặc tay quan trọng.
- Chọn khung nền 2.39:1 theo hồ sơ. Đổi tỉ lệ chỉ khi có mục đích kể chuyện và được chốt; letterbox không tự mở rộng góc nhìn.

## Lens, chuyển động và focus

- Ghi vị trí máy, điểm nhìn, tiêu cự, vùng nét và nhịp giữ. Máy rộng cho quan hệ không gian; cận cho phản ứng hoặc manh mối. Không dùng một tiêu cự như công thức cho mọi cảnh.
- Dolly/arc là thay đổi vị trí camera thật. Dolly zoom cần đồng thời đổi khoảng cách và tiêu cự; xác nhận bằng khung đầu–giữa–cuối và đoạn chuyển động.
- Chuyển nét theo thông tin cần xem. Khẩu độ/DoF không được làm mất bàn tay, mặt chữ hoặc dấu nhận diện thiết yếu.
- Rung có nguồn tác động, biên độ, thời gian vào/ra; không rung để che lỗi khớp. Đường máy nối đoạn phải giữ vận tốc và hướng hợp lý.

## Ánh sáng và tiếp xúc

- Đèn có nguồn trong cảnh: cửa sổ, màn hình, đèn bàn, hành lang. Màu và bóng theo nguồn đó; dùng vật liệu mờ và ánh hắt đủ đọc hình.
- Vật đặt phải có mặt đỡ. Tính cả bevel, độ dày vải, modifier và pose sau biến dạng; kiểm tra ở góc thấp và phía đối diện.
- Gương phản chiếu và Người Kia có điều khiển riêng: đọc kế hoạch gương trong hồ sơ, không lật toàn khung làm đảo cả chữ và vật thật.

## Mẫu ghi shot

`Mã shot · thời gian · nơi chốn · hành động/thông tin cần đọc · vị trí máy/đích nhìn · lens · focus đầu/cuối · đường máy/rung · nguồn sáng · điểm tiếp xúc · cue âm · thời lượng tạm/đã đo`.

## Kiểm tra

Storyboard bằng ảnh render Blender → animatic/playblast có chuyển động và âm tạm → render cuối sau duyệt. Ảnh tĩnh không xác nhận chuyển động mượt, tay bám vật hoặc chân không trượt. Xem [quy trình](WHAT-IF-QUY-TRINH.md) và bảng shot/camera của tập; không mặc định nhãn lens hay chỉ dẫn đã có là tính năng đã chạy.
