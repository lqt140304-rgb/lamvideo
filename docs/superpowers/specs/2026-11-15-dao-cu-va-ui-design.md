# Đạo cụ và màn hình UI theo kịch bản chính, thiết kế ngắn (15/11/2026)

**Mục đích:** đạo cụ và màn hình phải khớp `KICH-BAN-15P-HOAN-CHINH.md` (master duy nhất). Chủ repo đã duyệt danh sách và thứ tự làm ngày 15/11.

**Cách làm:**
- **UI:** dùng Pillow vẽ ra ảnh PNG, script `ui_man_hinh.py`, kết quả lưu ở `ui/`. Lý do chọn ảnh: cùng một tấm dùng được cho texture màn hình trong Blender và cho lớp phủ 2D trên Remotion. Kích thước điện thoại 624×1040 (gấp đôi 312×520 để nét hơn), laptop 1920×1080.
- **Đạo cụ:** dùng bpy, script `dao_cu_ban_moi.py`, toạ độ thế giới. Mỗi vật có điểm neo tay `grip_*` (Empty). Có lệnh `--bang` để render bàn trưng bày.

**Phạm vi:**
- Sửa đồ lệch kịch bản: búa (cán bọc cao su đen) và hộp xôi trắng hành phi (2 trạng thái: nguyên và đổ văng).
- Đạo cụ mới:
  - hộp thuốc bổ khớp kèm note vàng của mẹ, note Lab 402;
  - hoá đơn điện nước, dép tổ ong, nồi cơm điện, thùng mì gói (nhãn tự chế);
  - chậu quần áo ngâm, dao gọt cán vàng;
  - tuýp dầu, chìa khoá, ba lô, giáo trình cùng 3 trang ghi chép.
- UI:
  - điện thoại: báo thức 06:30 kèm thông báo hạn nộp, tin nhắn nhóm lớp, bài trắc nghiệm 10 câu, game thua, điểm Lab 402 9.5, "Mẹ yêu đang gọi video", nhóm họ hàng "Bác Hai gửi 1 video";
  - laptop: Word tiểu luận kèm thông báo đã nộp lúc 19:30, IDE C++.

**Không làm:**
- Không dùng logo hoặc nhận diện của ứng dụng thật (Zalo, game, portal): giao diện là kiểu nhắn tin chung tự thiết kế.
- Video clip ăn giỗ để sau, vì cần nhân vật. Hiện chỉ làm khung có ảnh đại diện tạm.
- Chưa gắn điểm neo vào xương tay (chưa có rig).

**Kiểm tra:** script chạy không lỗi; xem ảnh bàn trưng bày và bảng ghép UI; đối chiếu từng câu chữ với master.
