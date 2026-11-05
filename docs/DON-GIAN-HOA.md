# Định dạng "Đơn giản hóa" (ngang 16:9, nền trắng, nhân vật vẽ tay)

Trạng thái: **khung dựng đã chạy được, chưa có nhân vật thật, chưa có kịch bản thật, chưa nghe giọng.** Không dùng skill `edit-vui-ve` (giấy phép KHÔNG thương mại của Thanh Hải Learn AI, và tốn credit Higgsfield); định dạng này do Claude tự dựng trong repo, chỉ dựa trên mô tả trong prompt biên kịch của anh.

## Đã có
- `format: "explain"` trong `script.json` → khung 1920×1080, nền trắng (`src/ExplainShort.tsx`).
- Cảnh `explain`: `title`, `text[]` (chữ khóa hiện lần lượt), `expr` (biểu cảm), `tag` (dinh-nghia / vi-du / dua / chot / doi-thuong / ket), `pos` ("right" | "center" cho cảnh gag), `image`, `voice`, `sub`.
- Phụ đề chia cụm 6 chữ chạy theo độ dài lời đọc. Giọng đọc dùng lại `npm run voice` (mỗi cảnh một file).
- `videos/don-gian-hoa-demo/`: bản thử 25 giây, nhân vật SVG tạm (`placeholderChar: true`). Nội dung chỉ để thử bố cục, không phải kịch bản kênh.

## Còn thiếu (cần anh/ChatGPT)
1. **Nhân vật thật**: sheet biểu cảm theo MASTER PROMPT, cắt thành `public/<slug>/nhan-vat/<ten-bieu-cam>.png` (nền trong suốt; tên đúng danh sách trong prompt biên kịch: vui-nhe, suy-nghi, soc…). Biểu cảm nào chưa có file thì cảnh sẽ thiếu hình; em sẽ báo.
2. **Kịch bản thật** dạng Bản A (hình/chữ/biểu cảm/nhãn) + Bản B (lời đọc). Em chuyển Bản A sang `script.json`: `[CHỮ]`→`text`, `[RỒNG]`→`expr`, `[NHÃN]`→`tag`, `[HÌNH]`→`image` (hình tự vẽ), `[SFX]` chưa hỗ trợ.
3. **Giọng đọc**: chọn giọng VieNeu, nghe thử trước khi render.

## Chưa làm / chưa kiểm tra
- Chưa chạy typecheck (container không tải được thư viện); chưa render bằng Remotion thật, chỉ xem ảnh chụp bằng bộ xem thử.
- Video 8–12 phút: chưa thử độ dài, chưa có chương/mốc, chưa có SFX, nhạc nền, meme.
- Chuyển cảnh hiện là cắt cứng; chưa có zoom/gag chuyển động.
