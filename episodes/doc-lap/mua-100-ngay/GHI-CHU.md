# Ghi chú riêng — Mưa liên tục 100 ngày

## Trạng thái nhập

Kịch bản dùng bản v7 từ workspace sáng tác. Dữ liệu dựng lấy từ worktree `claude/lamvideo-repo-review-8a9959`; báo cáo lấy từ thư mục đầu ra local. Không thay lời, phối lại nhạc hoặc render lại chỉ để nhập repo.

Kiểm tra lúc nhập: SHA-256 của 244 file sao chép khớp nguồn; các liên kết tài liệu tồn tại; snapshot production vượt `tsc --noEmit` với đúng bộ phụ thuộc tương thích. Khoảng trắng/Markdown hard-break trong bản v7 và snapshot gốc được giữ nguyên để bảo toàn dữ liệu, không coi đó là thay đổi nội dung. Chưa kiểm tra chất lượng bằng xem/nghe lại media.

Mười file báo cáo ghi tổng cộng 15.060 credits theo cơ chế log cũ. Đây là phép cộng bản ghi lịch sử, chưa đối chiếu hóa đơn và có thể không bao gồm mọi lượt thử. Không dùng làm báo giá, hệ số ký tự hoặc chi phí mới. Cấu hình cũ ghi model `eleven_v4` và voice ID đã chọn; chỉ giữ để truy vết bản dựng, không xác nhận lại khả năng/giá/giới hạn API hiện tại.

## Điểm liên tục cần giữ

- Bối cảnh chính là thị trấn Bến Lau hư cấu, một lưu vực; không kể như dự báo mọi nơi trên thế giới cùng ngập.
- Ngày mưa trong truyện và độ sâu nước không tăng theo một phép cộng cố định. Các cao độ của nhà, hẻm, trường và nhà sinh hoạt phải đối chiếu bảng trong kịch bản.
- Nhân vật không biết trước tổng số ngày mưa. Con số ở tiêu đề dành cho khán giả. Tạnh mưa chưa đồng nghĩa nước đã rút hoặc có thể về nhà.
- Hạnh, Linh, hàng xóm và con chó phải có vị trí/hành động liên tục, không biến mất giữa sơ tán và nơi trú.
- Khung ảnh, hạt giống, chăn và các đồ được giữ cần đúng trạng thái/bảo quản. Kết thúc không làm căn nhà khô sạch hoặc phục hồi hệ sinh thái tức thì.
- Theo ghi chú dựng cũ, phần đầu cảnh 9 trong văn bản đã nằm ở cuối cảnh kỹ thuật 8; cảnh 9 kỹ thuật bắt đầu sau lời bộ đàm. Không chèn lặp lời hoặc cắt mất mạch nối khi ghép.

## Những gì chưa được kết luận lại

Bản v7 có nguồn và giới hạn nghiên cứu được ghi từ 05/11/2026; lượt nhập không thực hiện lại nghiên cứu hay xem video nguồn. Các báo cáo âm lượng, thời lượng và trạng thái sửa trong hồ sơ cũ không thay cho kiểm tra bản phim hiện có. Không ghi “đã sửa hết” như kết luận mới nếu chưa xem lại.

## Phản hồi sáng tác cần dùng khi sửa tập

Phản hồi trước đây khen tình cha con, nhân quả, đầu–đuôi và mạch truyện. Các điểm yếu được nêu là vai phụ chưa rõ, cốt truyện chưa đều, còn nặng giải thích khoa học, thiếu giật gân/drama và chất đời thường. Bản này được giữ làm hồ sơ; chưa tự thêm phản diện, meme hoặc đoạn thoại mới trong lần sắp xếp.

Nếu sau này sửa: đánh giá tác dụng của từng vai, tăng đối đầu có nguyên nhân và cái giá, làm phong phú cách ứng xử; không tạo người xấu hoàn toàn hoặc gắn quá khứ đau khổ để ép khán giả tha thứ. Mọi bổ sung phải xét lại thời lượng và chi phí thay cho chỉ nối dài.

## Sử dụng lại kỹ thuật

Snapshot giữ bộ engine, scripts và schema thực sự từng dùng, gồm `pads`, bộ tay và captions. Studio chung của repo có phiên bản khác; không chép vài file sang rồi mặc định tương thích. Đối chiếu API/phụ thuộc và kiểm tra trước nếu muốn chuyển một tiện ích lên thư viện chung.
