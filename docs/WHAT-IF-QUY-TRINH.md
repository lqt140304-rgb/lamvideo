# Quy trình What If

Đọc [CLAUDE.md](../CLAUDE.md) và [kinh nghiệm chung](KINH-NGHIEM.md). Mỗi lần chỉ thực hiện phạm vi người dùng yêu cầu; viết kịch bản hoặc cập nhật repo không tự bao gồm tạo giọng, ảnh, video hay đăng bài.

## 1. Chọn đề tài và lập hồ sơ tập

Đánh giá đề tài theo [mục tiêu](MUC-TIEU.md), đặt series/slug tập và lưu tại `episodes/<series>/<slug-tap>/`. README của tập ghi trạng thái, độ dài dự kiến, số vai/bối cảnh và file nguồn. Xây luật vừa đủ cho câu chuyện trước khi mở rộng thế giới.

## 2. Nghiên cứu đúng phần cần biết

Đọc [hướng dẫn nghiên cứu](../.claude/skills/what-if-animation/references/research.md). Tách dữ kiện kiểm chứng, suy luận và luật hư cấu. Khi được yêu cầu nghiên cứu sâu, tìm cả web, YouTube, TikTok và sự kiện liên quan; trung thực về phần nào thực sự xem/nghe hoặc chỉ đọc transcript. Nguồn và ghi chú thuộc `NGHIEN-CUU.md` của tập, không đưa vào kinh nghiệm chung.

## 3. Viết và kiểm tra lời

Tạo bản dựng có bối cảnh, hành động, thoại, khoảng nghỉ, camera/lens/rung/focus; bản lời sạch; bản hướng diễn xuất nếu dùng ElevenLabs. Soát luật thế giới, người biết thông tin nào, chuỗi nhân quả, mục đích từng vai, dấu hiệu chuẩn bị twist, hậu quả và kết thúc. Đọc thành tiếng để sửa câu lủng củng. Không ép câu ngắn tới mức thiếu ý hoặc chèn kiến thức vượt nhu cầu cảnh.

Ghi thời lượng ước tính cùng giả định tốc độ; sau này thay bằng audio đo thực. Bổ sung tình tiết bằng cách thay/gộp trước khi nối dài. Bài học riêng lưu vào `GHI-CHU.md` của tập.

## 4. Chuẩn bị asset và giọng

Lập `ASSET.md` trong hồ sơ tập, phân biệt có sẵn/chưa tạo/cần sửa. Chọn style và những hình chính có thể tái dùng. Giữ vùng chữ riêng khi tạo hình; chốt góc cảnh đủ dùng trước khi làm chuyển động.

**ElevenLabs là lựa chọn ưu tiên cho nội dung mới.** Chọn voice và model theo giọng nghe thực, ghi trong hồ sơ tập. `[thoughtful]` hoặc các thẻ khác là gợi ý cho model hỗ trợ, không bảo đảm được đọc đúng và không tự đổi giọng người nói. Không dán tên vai, ghi chú camera hoặc `[NGHỈ ...]` vào ô TTS. Khoảng lặng chính xác đặt khi dựng.

Backend hiện có có những giới hạn đã đọc từ mã:

- `voice.py` vẫn mặc định VieNeu để giữ tương thích ví dụ cũ. Muốn gọi ElevenLabs phải đặt `voice.engine` là `elevenlabs` trong `episode.json`.
- `voice_elevenlabs.py` ghép toàn bộ `script[].text` thành một lượt, một voice; cache toàn bài. Đổi một câu có thể tạo lại cả lượt, không có cache nhiều vai/từng đoạn cho engine này.
- Backend đặt sẵn một voice ID và model cũ: phải chọn cấu hình chủ động, không xem đó là lựa chọn giọng Việt đã được duyệt.
- Pipeline xử lý `gaps` cắt các khoảng lặng vượt ngưỡng, kể cả âm thanh nhập qua `engine: file` ở backend chung. Không dùng mặc định cho cảnh cần lắng đọng. Giữ audio gốc, ráp từng cảnh/vai và khoảng nghỉ ở timeline; chỉ đưa bản đã nghe kiểm tra vào render.
- Chưa có chức năng chuyển tự động hồ sơ Markdown nhiều vai thành tập hoàn chỉnh. Cần dựng cấu trúc episode tương ứng khi bước sản xuất được yêu cầu.

Kiểm tra quota/model và chi phí thực trên tài khoản khi thực sự tạo; không dùng hệ số giá cũ. Không ghi khóa vào repo hoặc log. Đặt `ELEVENLABS_API_KEY` trong môi trường hay `.env` local được bỏ qua bởi Git.

## 5. Dựng bằng studio khi cần

Từ gốc repo:

```powershell
cd what-if-studio
npm ci
npm run studio
```

Các công cụ Python cần môi trường có `numpy`, `Pillow`, cùng `ffmpeg`/`ffprobe` trên PATH; những engine khác có phụ thuộc riêng. `tools/what-if-setup.bat` là tiện ích cũ có cài VieNeu/Edge, không phải bước bắt buộc cho quy trình ElevenLabs.

Giữ nguyên engine chung; mã tập ở `src/episodes/<slug-tap>/`, media ở `public/<slug-tap>/`, output ở `out/<slug-tap>/` tính từ studio. Đọc [kit](../.claude/skills/what-if-animation/references/kit.md) trước khi thêm bối cảnh/nhân vật. Xem hai tập mẫu để hiểu schema, nhưng không sao chép số cảnh, nhịp cắt hoặc cliffhanger thành luật cho truyện mới.

Khi đã có episode JSON, mã shot và audio được kiểm tra, công cụ kỹ thuật hỗ trợ:

```powershell
python ../.claude/skills/what-if-animation/scripts/plan.py <slug-tap>
npm run typecheck
node ../.claude/skills/what-if-animation/scripts/stills.mjs <slug-tap>
python ../.claude/skills/what-if-animation/scripts/board.py <slug-tap>
```

Xem các still thật, sửa bố cục và tính liên tục trước khi render. Chỉ tạo sound mới khi cần; ưu tiên thư viện đã kiểm tra. Lệnh `sfx.py` không kèm `--free` có thể gọi dịch vụ khi có key, vì vậy xem `--dry` và chọn chế độ rõ ràng. Đọc [sound](../.claude/skills/what-if-animation/references/sound.md). `master.py` render theo episode đã dựng; `mixcheck.py` và `motiongrid.py` hỗ trợ kiểm tra âm thanh/chuyển động, không thay việc xem và nghe.

## 6. Giao và cập nhật repo

Giao đúng bản đã kiểm tra, nêu thời lượng đo được hay ước tính, phạm vi hoàn thành và chi phí thực nếu có. Cập nhật trạng thái ở hồ sơ tập. Chỉ đẩy file đã được yêu cầu/ủy quyền, kiểm tra diff, giới hạn đường dẫn theo tập và các mục lục liên quan. Giữ kinh nghiệm chung ở mức nguyên tắc; giữ lịch sử sửa, chi phí và phản hồi cụ thể bên trong tập.
