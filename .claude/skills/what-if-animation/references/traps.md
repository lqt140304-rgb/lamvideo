# Lỗi cần tránh khi dựng 3D

## Hình và chuyển động

- Dùng nhầm nguồn: đọc ASSET và entry Blender của tập; không gọi rig SVG hoặc áp quy tắc bóng vẽ tay cho scene 3D.
- Vật xuyên mặt đỡ: tính cả bevel, modifier và độ dày vải; soi góc thấp/phía đối diện. Tựa ghế phải lõm về người ngồi, thanh đỡ ở sau.
- Tay/đạo cụ nhảy lúc đổi người cầm: giữ tọa độ thế giới khi đổi parent/constraint, kiểm frame trước–đúng–sau và đặt âm tại tiếp xúc thật.
- Chân trượt hoặc hông xuyên ghế: khóa chân trụ và điểm ngồi theo mặt đỡ; kiểm cả đoạn đứng–bước–rẽ–dừng, không chỉ pose cuối.
- Camera xuyên tường/hở nền: kiểm đường máy cực hạn, đủ scene ngoài cửa sổ/hành lang, giữ che sáng khi cutaway có chủ ý.
- Màu da/tóc sai: kiểm vật liệu nền và nhận diện từ nhiều góc; không dùng tăng bóng/viền để chữa hình học.
- Báo motion đạt từ ảnh: still chỉ xác nhận khung đã xem; animatic cần chạy và xem thật.

## Âm thanh và xuất bản

- Nhạc/SFX che lời hoặc đuôi âm sang câu sau: nghe bản mix cuối, giữ đối lập âm lượng theo hành động; không dùng một gain cố định cho mọi cảnh.
- Render báo xong nhưng thiếu file: kiểm đầu ra, metadata, thời lượng và decode; typecheck không thay xác nhận video.
- Dùng chi phí/thời gian cũ làm lời hứa: ghi cấu hình, thiết bị, số frame và số đo thực; phân biệt render local với quota/API.
- Commit lẫn file người khác: xem diff từng đường dẫn, dùng main mới nhất, không force-push hoặc đẩy cache/key/render nặng ngoài phạm vi.
