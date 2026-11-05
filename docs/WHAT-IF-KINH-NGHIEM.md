# Kinh nghiệm What If (đọc trước khi dựng hoặc sửa tập)

Cập nhật sau mỗi lần dựng/sửa. Bắt đầu từ phim "Mưa liên tục 100 ngày" (05/11/2026).

## Giọng
- Tài khoản: ElevenLabs Creator, giọng Trung Lê Quốc (`HXqqNj3PDxRdHVH1pXog`), model **Eleven v4** (chủ kênh chọn sau khi nghe thử v3 và v4).
- `eleven_multilingual_v2` (mặc định cũ của skill) không ghi tiếng Việt trong danh sách model. Đừng dùng lại.
- v4 tính khoảng 0,44 credit/ký tự: cảnh 1 có 2.687 ký tự tốn 1.182 credits. Cả phim (khoảng 24.000 ký tự) ước khoảng 10.700 credits.
- Giới hạn mỗi lần gọi: v4 10.000 ký tự, v3 5.000 ký tự. Phim dài phải tách theo cảnh, mỗi cảnh một episode.
- Thẻ cảm xúc như `[warmly]` phải bị loại khỏi danh sách chữ (đã làm trong `voice_elevenlabs.py`), không thì mốc cắt cảnh lệch.
- Kể chuyện dùng `gaps` thoáng hơn What If 15 giây: word 0,2, comma 0,35, sentence 0,6, question 0,7. Nhịp `[NGHỈ x giây]` ghi ở `"pause"` của từng beat.
- Khóa API: chuỗi bắt đầu bằng `sk_`. Chuỗi 64 ký tự trong trang quản lý là key ID, API báo `api_key_id_used_as_api_key`.

## Hình (lỗi đã gặp ở lần soi đầu cảnh 1)
- `rimR`/`rimL` có quầng cam to, làm nhân vật giống sticker trong cảnh mưa. Phim dùng `filmR`/`filmL` (viền mảnh một bên, không quầng).
- Với tay về một phía: tay trái cần `a` âm (`armL: { a: -70 }`). Để cả hai `a` dương thì nhân vật dang hai tay như chữ thập.
- Rig không có góc sau lưng: dùng `Back` (đắp tóc lên mặt) cho shot từ phía sau, đừng để mặt quay ra trong shot "sau lưng".
- Vật to trong `Foreground` đặt ngoài nhóm camera, không thì zoom phóng cả nó lên.
- Vòng sáng đèn dùng `Glow`, đừng dùng `circle` có `opacity` (ra đĩa phẳng).
- Mái tôn nhìn từ trên cao màu xanh đậm có sọc giống pin mặt trời: dùng màu nâu rỉ, sọc nhạt.
- Đổi hướng máy thì phải vẽ đúng phía đó của phòng (`LivingFront` trong `mua-100-c01/shots.tsx`), không dán cửa lên phòng cũ.
- Python: dùng `D:\VieNeu-TTS\.venv\Scripts\python.exe`. Lệnh `python` trên máy này là lối tắt Microsoft Store.
