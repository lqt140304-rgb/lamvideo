# Làm việc với lamvideo

Repo này dành cho nội dung What If. Đọc [mục tiêu](docs/MUC-TIEU.md), [kinh nghiệm dùng chung](docs/KINH-NGHIEM.md) và [quy trình](docs/WHAT-IF-QUY-TRINH.md) trước khi làm nội dung mới. Hướng hiện tại là chuyện giả định giữa đời sống Việt Nam, để người xem tự hỏi mình sẽ lựa chọn thế nào.

## Quy tắc lưu và đẩy file

- Xác định tên tập và một slug riêng trước khi tạo file. Hồ sơ tập nằm trong `episodes/<series>/<slug-tap>/`; kịch bản, lời đọc, nghiên cứu, asset riêng và ghi chú sửa tập đều ở đây. Không rải file tập ở gốc repo hoặc trong `docs/`.
- `docs/KINH-NGHIEM.md` chỉ chứa nguyên tắc có thể áp dụng lại để nâng chất lượng, giảm lỗi, giảm thời gian và chi phí. Không ghi cốt truyện, tên nhân vật, tình trạng sửa hay số tiền của một tập vào file này. Những nội dung đó thuộc `GHI-CHU.md` hoặc `ASSET.md` trong thư mục tập.
- `docs/ASSET.md` là danh mục tài nguyên dùng chung và đường dẫn tới asset từng tập. `docs/KICH-BAN.md` là mục lục. Chỉ đưa asset lên thư viện chung khi thực sự dùng lại được, có nguồn và quyền sử dụng rõ.
- Nếu dựng bằng studio hiện có: mã riêng ở `what-if-studio/src/episodes/<slug-tap>/`, media chạy ở `what-if-studio/public/<slug-tap>/`, đầu ra ở `what-if-studio/out/<slug-tap>/`. Dùng cùng slug với hồ sơ tập; ghi liên kết trong README của tập. Đây là các đường dẫn kỹ thuật cần cho engine, không phải nơi tạo thêm bản kịch bản độc lập.
- Khi nhập lại dự án cũ có engine/schema khác, có thể giữ snapshot `production/` trong chính thư mục tập để bảo toàn dữ liệu. Ghi rõ đó là bản dựng cũ; không tự trộn engine cũ lên studio chung hoặc dùng snapshot làm template cho tập mới.
- Thêm tập chỉ sửa thư mục của tập và mục lục cần thiết. Thay đổi engine, skill hoặc kinh nghiệm chung phải có lý do áp dụng cho nhiều tập. Không dùng `git add .` thiếu kiểm tra; xem từng đường dẫn trong diff trước khi commit/push.
- Không commit `.env`, API key, cache, `node_modules`, audio thử hay bản render nặng. Khi cần giữ đầu ra local, vẫn chia thư mục theo slug tập và ghi đường dẫn trong hồ sơ tập.

## Cách làm

- Không tự mặc định zombie, tận thế hay giải thích khoa học. Đánh giá đề tài theo đồng cảm, lựa chọn khó, tính mới, khả năng kể trọn và chi phí dựng.
- Mỗi tập có lựa chọn và hệ quả đủ khép lại. Nhân vật có mục đích, vai trò, giới hạn và mâu thuẫn; twist phải được chuẩn bị. Khoa học chỉ giải thích nguyên nhân thiết yếu, các luật siêu nhiên được ghi là hư cấu và giữ nhất quán.
- Khi chủ repo muốn chốt từng cảnh, dùng [co-write-scenes](.claude/skills/co-write-scenes/SKILL.md): ghi rõ phần đã chọn/phần đề xuất, chỉ viết chi tiết cảnh đang bàn. Dùng [emotional-dialogue](.claude/skills/emotional-dialogue/SKILL.md) khi sửa diễn xuất/thoại và [story-logic-review](.claude/skills/story-logic-review/SKILL.md) khi rà nhân quả/luật truyện. Không tự chuyển đề xuất thành bản giao dựng.
- Chốt phạm vi và bản lời trước khi tạo giọng/hình. Chỉ chạy phần được yêu cầu; yêu cầu viết hoặc cập nhật repo không tự bao gồm tạo media tốn phí.
- Ưu tiên ElevenLabs cho nội dung mới theo lựa chọn của chủ repo. Chọn voice/model rõ ràng; backend cũ không tự đổi mặc định. Thẻ cảm xúc không thay được diễn xuất và không tự phân vai. Khoảng nghỉ chính xác được dựng trên timeline.
- Công cụ giọng cũ có cắt ngắn khoảng lặng, ElevenLabs backend cũ tổng hợp cả bài bằng một giọng. Không đưa thẳng kịch bản nhiều vai vào đó rồi báo đã giữ cảm xúc/phân vai.
- Tái sử dụng phần đã đạt, sửa đúng đoạn bị ảnh hưởng; ghi chi phí thực tế theo từng tập. Không gọi token, ký tự và credits là cùng một đơn vị; không hứa số video từ quota chưa đo.
- Khi nghiên cứu, đọc quy trình nguồn trong skill What If. Không nhận đã xem video nếu chỉ có transcript hoặc tiêu đề. Phân biệt dữ kiện, suy luận và sáng tác.
- Trước khi bàn giao, rà chuỗi bản nguồn → dựng cảnh → lời sạch/bản ElevenLabs → asset/README/kế hoạch → mục lục liên quan theo [quy trình đồng bộ](docs/WHAT-IF-QUY-TRINH.md#kiểm-tra-đồng-bộ-trước-khi-giao). Nếu có mã/audio/timeline, kiểm tra thêm đầu ra phụ thuộc; ghi rõ chưa tạo thay vì báo đã đồng bộ media.

## Môi trường

Studio nằm tại `what-if-studio/`. Chạy `npm run studio` hoặc `npm run typecheck` trong thư mục đó. Không chạy các lệnh sản xuất ở gốc theo README cũ. Bản hướng dẫn kỹ thuật: [skill What If](.claude/skills/what-if-animation/SKILL.md).

Ghi chú riêng của máy nằm trong `CLAUDE.local.md`, không đưa lên repo. Nếu đây là Git worktree, kiểm tra kho Git gốc trước khi dọn hoặc di chuyển thư mục; worktree còn phụ thuộc vào metadata của kho gốc.
