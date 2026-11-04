# Nhờ ChatGPT tìm ảnh cho video

Làm theo 3 bước. Mỗi video chỉ cần 2–4 ảnh tổng quan, mỗi cảnh tối đa 1 ảnh.

## 1. Gửi cho ChatGPT (bật tính năng tìm kiếm web)

Thay phần trong [ ] bằng nội dung của bạn:

```
Mình làm video tin tức ngắn dọc 9:16 về: [chủ đề, ví dụ: Hà Nội cấm xe máy xăng, chuyển sang xe điện].
Hãy tìm ảnh minh họa TỔNG QUAN cho các cảnh sau (mỗi cảnh 3 ảnh để mình chọn):
1. [Cảnh 1: đường phố Hà Nội đông xe máy]
2. [Cảnh 2: cây xăng ở Việt Nam]
3. [Cảnh 3: xe máy điện ở Việt Nam, ví dụ VinFast]

Yêu cầu BẮT BUỘC:
- Chụp ở Việt Nam, từ năm [2023] trở lên, ảnh dọc hoặc ngang đều được, rõ nét (từ 1200px).
- Chỉ lấy ảnh dùng được cho video thương mại: CC0, Public Domain, CC BY hoặc CC BY-SA
  (nguồn nên dùng: Wikimedia Commons, Unsplash, Pexels, Pixabay). KHÔNG lấy ảnh báo chí hoặc ảnh Google không rõ giấy phép.
- Không có chữ/logo/watermark lớn, không có mặt người nổi bật.
- Mỗi ảnh trả về đủ 5 thông tin: (a) link TRỰC TIẾP tới file ảnh (đuôi .jpg/.jpeg/.png, mở ra chỉ thấy ảnh),
  (b) link trang gốc, (c) tên tác giả, (d) giấy phép, (e) năm chụp.
- Nếu không chắc giấy phép hoặc năm chụp thì nói rõ, đừng đoán.
```

## 2. Chọn ảnh và điền vào `videos/<tên-video>/script.json`

Trong mục `broll` của cảnh, thêm hai dòng:

```json
"url": "https://upload.wikimedia.org/.../anh.jpg",
"credit": "Ảnh: Tên tác giả · CC BY 4.0 / Wikimedia Commons"
```

Muốn dùng ảnh của chính bạn (tự chụp, hoặc đã mua): chép file vào `public/<tên-video>/img/` đúng tên trong `"file"`, rồi ghi `"credit": "Ảnh: Tên bạn"`.

## 3. Tải và render

```powershell
cd D:\lamvideo
npm run images -- xe-dien-ha-noi
npm run render -- xe-dien-ha-noi
```

Lệnh `images` tải ảnh từ link, rồi in dòng ghi nguồn để dán vào mô tả video.

## Lưu ý

- ChatGPT đôi khi đưa link sai hoặc đoán giấy phép. Hãy mở link xem ảnh có đúng không, và mở trang gốc xem giấy phép.
- Link ảnh phải trỏ thẳng tới file ảnh. Nếu lệnh báo "không tải được", hãy mở ảnh trên trình duyệt, bấm chuột phải, chọn "Sao chép địa chỉ hình ảnh" rồi dán lại.
- Ảnh không rõ giấy phép thì đừng dùng, vì video đăng lên mạng xã hội có thể bị khiếu nại bản quyền.
