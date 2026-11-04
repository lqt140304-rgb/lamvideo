# Kinh nghiệm đúc kết (đọc trước khi làm video mới)

Cập nhật sau mỗi lượt làm. Chạy `npm run lint` trước khi `npm run make` để bắt các lỗi bên dưới.

## Kịch bản
- **Không dùng khuôn câu cố định** ở mọi video. Cấm: "Khoan đã! Tóm lại là thế này." ở hook; "Vậy ai…?" mở cảnh kết luận; "Còn những việc không nên làm"; "Những chỗ dễ nhầm"; "Bình luận cho mình biết nhé" ở cuối. `npm run lint` báo khi cụm 4 từ lặp ở 3 video trở lên hoặc câu mở trùng nhau.
- Duy nhất được lặp: thương hiệu "Tóm lại là" ở cảnh kết.
- **Hook** (≤ 40 từ, ≤ ~9 giây): câu 1 là tình huống hoặc con số, câu 2 là một thông tin gây tò mò (không phải lời dẫn kiểu "để mình nói rõ"). Mỗi video chọn một kiểu: tình huống → hỏi, con số gây sốc, "ai cũng bảo… nhưng…", hỏi thẳng người xem, tin nóng.
- Đặt `cue` trong cảnh hook là cụm từ chốt ý (chép đúng lời đọc): dấu đóng và giật zoom xảy ra đúng lúc đó.
- **Câu mở cảnh** của list/verdict viết theo nội dung cảnh, không theo khuôn ("Không có khu sạc thì còn ba đường", "Gộp lại thì đây là tin tốt hay tin xấu?").
- **Lời kêu gọi cuối** đổi qua các video: hỏi trải nghiệm, nhờ lưu lại, nhờ gửi cho người thân, mời chọn một bên.
- `voice` viết số bằng chữ, `sub` viết bằng số; cụm trong `broll.say` và `cue` phải chép đúng từ `voice`.
- Số liệu, ngày tháng, lãi suất, giá: tra nguồn chính thức, ghi vào `sources.md`, chỗ chưa chắc ghi rõ. Giá vàng/lãi suất phải làm mới đúng ngày đăng.

## Hình và hiệu ứng
- **Không dùng hào quang / tia nắng quanh nhân vật.** Nhấn mạnh bằng zoom (máy quay), không bằng ánh sáng.
- Máy quay (`cam`): hook = giật zoom lúc chốt ý; các cảnh giữa xen kẽ vào / ra / trôi; cảnh kết zoom ra. Có thể ghi đè bằng `cam` trong từng cảnh.
- Chuyển cảnh xen kẽ 4 kiểu (quét vàng, mống mắt, thanh mực, lóe sáng); ghi đè bằng `transition` ở cảnh đích.
- Bố cục: mỗi video một chuỗi cảnh khác nhau; không để hai cảnh liền nhau cùng kiểu; không trùng tiêu đề trong một video.
- Ảnh vẽ (SVG) cho từng video làm mới; chỉ dùng lại khi thật sự hợp.
- Chữ trong khung: tiêu đề ≤ ~20 ký tự mỗi dòng ở cỡ 72–90; kiểm tra bằng ảnh chụp trước khi báo xong.

## Ảnh thật
- Chỉ 2–3 cảnh có ảnh mỗi video (tối đa 1 ảnh/cảnh), kiểu `card`, hiện đúng lúc đọc tới `say`.
- Ảnh chụp từ 2023 trở lên, giấy phép CC0/PD/CC BY/CC BY-SA, giữ dòng ghi nguồn trên màn hình. Không dùng ảnh người nổi tiếng.
- Khai báo `query` (tiếng Anh) và `must` (từ bắt buộc) rồi chạy `npm run make`; xem trang `public/<slug>/img/chon-anh.html` nếu muốn đổi ảnh.

## Quy trình
- Tra nguồn → `script.json` + `sources.md` → `npm run lint` → xem ảnh chụp từng cảnh → `npm run make -- <slug>` → nghe lại cách đọc (VNeID, SJC, tên riêng, số).
- Cảnh nào đổi lời đọc thì `make` đọc lại giọng; bản render cũ không có thay đổi mới, nhớ `git pull` rồi render lại.
- Đăng: ghi nhãn nội dung có AI hỗ trợ, hiện nguồn ảnh, làm mới số liệu theo ngày.
