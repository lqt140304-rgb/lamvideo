# Quy chuẩn nhân vật stickman — hướng hiện hành

**Chủ repo chốt ngày 17/11/2026:** nhân vật dạng stickman đơn giản, chỉ phân biệt tạo hình bằng **tóc và quần áo**. Quyết định này thay yêu cầu dùng phôi người/chibi chi tiết trước đây. Chốt ở mức thiết kế; chưa tạo mesh stickman, rig hoặc thay nhân vật trong cảnh.

## Tạo hình

- Dùng chung cấu trúc đầu, khuôn mặt và cơ thể. Không tạo nhận diện riêng bằng nốt ruồi, sẹo, giải phẫu mặt, cơ bắp, màu da hoặc phụ kiện độc lập.
- Đầu là khối tròn đơn giản; thân gọn, tay/chân là nét hoặc khối mảnh liền mạch. Tránh dựng giải phẫu, đốt ngón hay cơ thể người thu nhỏ. Cách triển khai mặc định theo pipeline 3D hiện có: khối đơn giản, không tự chuyển toàn bộ video sang 2D.
- Mặt dùng chung bộ nét tối giản để diễn cảm xúc; mắt/miệng nếu dùng không trở thành dấu nhận dạng khác nhau giữa các vai. Cảm xúc còn thể hiện bằng hướng đầu, tư thế và nhịp hành động.
- Tóc bằng vài mảng lớn có silhouette rõ, ít lọn. Quần áo bằng hình và màu gọn: áo, quần hoặc bộ trang phục; không thêm nếp vải, đường may hoặc hoa văn nhỏ khi không cần.
- Bàn tay/bàn chân giản lược theo hành động, không bắt buộc vẽ từng ngón. Dáng cầm vẫn cần điểm nắm, đồ không bay; chân phải có điểm đỡ. Stickman đơn giản không đồng nghĩa cho phép xuyên đồ hay đứt khớp.
- Không ép một số đo đầu/thân mới chưa được duyệt. Duyệt một mẫu stickman trước khi nhân thành cả dàn; khi các vai dùng cùng dáng, tóc và trang phục phải đủ dễ đọc ở cỡ xem cuối.

## Tái sử dụng và nguồn cũ

Phôi [HUMAN-MALE-BASE-01](../what-if-studio/library/characters/human-male/base-v1/README.md), các bản chibi và mẫu người chi tiết giữ nguyên để tham khảo lịch sử. Chúng **không còn là phôi bắt buộc hoặc chuẩn tỷ lệ** cho nhân vật mới. Không sửa/đổi tên GLB cũ rồi báo đó là stickman đã hoàn thành.

Chưa có file mesh stickman chuẩn mới. Khi được giao tạo, làm một mẫu chung rồi thay tóc/trang phục theo từng vai, lưu phiên bản và nguồn trong ASSET; không tự render phim hoặc thay toàn bộ cảnh cũ chỉ từ quyết định thiết kế này.

## Đồng bộ câu chuyện

Tóc và trang phục là kênh nhận diện hình ảnh; tính cách vẫn khác qua lời nói và diễn xuất. Truyện cố ý có người giống nhau có thể dùng cùng tóc/trang phục theo tình tiết, không tự biến hai người thành khác biệt để khán giả dễ phân biệt.

**Hồ sơ 2:** manh mối nốt ruồi đối bên trong bản cũ xung đột với quy tắc nhận diện mới. Cần biên tập riêng chuỗi gieo dấu → kiểm chứng → hé lộ trước khi giao dựng. Không tự thay bằng tóc/quần áo phản chiếu hoặc xóa mắt xích truyện khi chưa bàn; tài liệu này chưa sửa lời nguồn. Các quy tắc cốt truyện khác không tự mất hiệu lực vì đổi tạo hình.

## Kiểm tra

Đặt các vai cạnh nhau ở cùng dáng: đọc được khác biệt chỉ nhờ tóc và quần áo. Thử đầu nhỏ/xa và nền sáng–tối; tránh hai kiểu tóc chỉ khác vài nét bé. Khi được giao rig, kiểm tra đi/ngồi/cầm vật, giữ tóc/áo bám thân và dáng chung thống nhất. Chưa kiểm chứng hiệu quả, chi phí hoặc mức tiết kiệm bằng một bản dựng thật.