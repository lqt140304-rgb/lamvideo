# Rà soát kinh nghiệm cũ trước khi nhập

Đã đọc `docs/WHAT-IF-KINH-NGHIEM.md` (269 dòng) và `docs/KINH-NGHIEM.md` trong worktree cũ, đối chiếu cấu hình/báo cáo/nguồn âm thanh của các cảnh. Hai file cũ trộn nhiều dự án; không sao chép nguyên file lên tài liệu chung của repo.

| Nội dung cũ | Cách xử lý |
|---|---|
| Tên tập, số shot, lỗi từng shot, tọa độ đồ và bảng nước | Giữ dữ liệu trong mã/kịch bản/ghi chú tập; bỏ khỏi kinh nghiệm chung |
| Gói tài khoản, voice ID, model, mức credits/ký tự và giới hạn ký tự mỗi lần gọi | Giữ cấu hình/báo cáo làm lịch sử; không coi là giá hoặc giới hạn hiện tại |
| Kết luận tuyệt đối về model hỗ trợ tiếng Việt, giọng thư viện và gói Free | Không nhập thành quy tắc dùng chung khi chưa kiểm tra tài liệu/tài khoản hiện tại |
| Quy ước dấu góc tay có các mô tả khác nhau giữa cảnh/hướng mặt | Không rút thành công thức góc cố định; dùng nguyên tắc thử pose theo rig, hướng mặt và khớp tay |
| Vật rời tay, chân không chạm sàn, tư thế ngồi không có ghế, sai lớp che | Rút thành bài học chung về tọa độ, tiếp xúc và thứ tự lớp; thông số cụ thể nằm trong snapshot |
| Chỉ soi ảnh khóa khiến bỏ sót chuyển động hoặc cảnh dùng lại | Bổ sung nguyên tắc xem đầu–giữa–cuối và các mốc đổi trạng thái |
| Cần render hết sau mọi lần sửa một component chung | Sửa thành xác định phạm vi ảnh hưởng; render lại các phần phụ thuộc, chỉ làm toàn bộ khi cần |
| `gaps`, `pads`, audio tags và mốc chữ | Rút nguyên tắc phân biệt cắt/thêm khoảng lặng, kiểm tra timestamp và chạy lại các bước phụ thuộc; không nói studio chung đã có tính năng chỉ snapshot cũ mới có |
| Âm lượng chỉ phụ thuộc gain, hệ số va đập 1,2–1,9, mức stem cố định | Không nhập nguyên xi; thay bằng nghe bản trộn, xét chuẩn hóa stem, che lời và peak. Thông số gốc vẫn nằm trong JSON để truy vết |
| Nhạc vui dùng cho truyện buồn, ambience ngắn bị hết giữa cảnh | Giữ bài học chọn nhạc theo cảnh, lặp/nối hợp lý và nghe lại đủ đoạn |
| Phụ đề chủ đề bắt buộc có một số dòng cố định | Giữ như lựa chọn biên tập; bỏ định mức áp cho mọi tập, yêu cầu căn cứ và không che chi tiết |
| “Đã sửa hết”, thời gian render, cấu hình máy, đường dẫn TEMP | Lịch sử riêng của lần dựng; không biến thành kết quả hoặc cam kết cho môi trường mới |
| Tìm kinh nghiệm ở mọi nhánh cho mọi nhiệm vụ | Thu gọn thành kiểm tra nguồn/nhánh liên quan trước khi làm lại; mở rộng tìm kiếm khi cần |
| Quy tắc cũ của Tóm Gọn, CTA cố định, luật thuế, chọn ảnh theo năm/ID | Không nhập vào hướng What If mới. Nguyên tắc nguồn phải đúng, không suy diễn và hình khớp nội dung đã có trong tài liệu chung |
| Nhận định về giấy phép/Content ID của cả một nguồn media | Không áp hàng loạt. Giữ nguồn từng file và phần chưa rõ trong ASSET của tập; chưa xác minh lại quyền sử dụng |

Phần chuyển sang [kinh nghiệm chung](../../../docs/KINH-NGHIEM.md) chỉ còn các nguyên tắc về tính liên tục, căn mốc, kiểm tra chuyển động, phạm vi sửa và tiết kiệm lượt tạo/render. Không chuyển cốt truyện, tên nhân vật hay chi phí riêng sang file chung.
