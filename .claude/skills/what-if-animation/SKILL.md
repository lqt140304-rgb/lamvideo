---
name: what-if-animation
description: Nghiên cứu, viết và dựng nội dung What If cho lamvideo, ưu tiên truyện giả định đời thường Việt Nam với lựa chọn, hệ quả và cảm xúc; dùng khi phát triển hoặc sửa một tập What If, từ hồ sơ kịch bản tới storyboard và Remotion trong phạm vi được yêu cầu.
---

# What If cho lamvideo

Đọc [CLAUDE.md](../../../CLAUDE.md), [mục tiêu](../../../docs/MUC-TIEU.md) và [kinh nghiệm chung](../../../docs/KINH-NGHIEM.md). Định hướng mới ưu tiên câu chuyện có thể xem riêng, luật nhất quán và một lựa chọn khiến khán giả nghĩ về mình. Không mặc định đề tài tận thế, số liệu khoa học, video 15–25 giây hay cliffhanger.

## Phạm vi và lưu trữ

Xác định việc đang được yêu cầu: nghiên cứu, viết, sửa, dựng hay xuất video. Chỉ làm media khi phạm vi đã bao gồm bước đó. Dùng `episodes/<series>/<slug-tap>/` cho mọi hồ sơ riêng của tập; mã và media của studio dùng cùng slug tại các đường dẫn kỹ thuật quy định trong CLAUDE.md. File kinh nghiệm chỉ chứa nguyên tắc dùng lại được, không ghi nội dung hoặc tình trạng một tập vào đó.

## Chọn tài liệu cần đọc

| Công việc | Tài liệu |
|---|---|
| Nghiên cứu nguyên nhân, hệ quả, sự kiện/video liên quan | [research.md](references/research.md) |
| Đề tài, nhân vật, xung đột, twist, kết thúc | [formula.md](references/formula.md) |
| Các bước và giới hạn công cụ thực tế | [quy trình](../../../docs/WHAT-IF-QUY-TRINH.md) |
| Engine, rig, set, ánh sáng, API dựng | [kit.md](references/kit.md) |
| Bố cục, kiểm tra still/motion | [look.md](references/look.md) |
| Âm thanh, giọng, chi phí | [sound.md](references/sound.md) |
| Lỗi kỹ thuật từng gặp trong bộ mẫu | [traps.md](references/traps.md) |

## Các quyết định cần giữ

- Lập luật thế giới nhỏ đủ kể tập này; phân biệt sự thật, suy luận và sáng tác. Khoa học chỉ vào lời kể khi cần hiểu nguyên nhân/hậu quả.
- Nhân vật có vai trò, mong muốn và lỗi; người đối đầu có động cơ nhưng vẫn chịu hậu quả. Twist có chuẩn bị và thay đổi lựa chọn, không chỉ gây sốc.
- Bối cảnh cụ thể, lời đối đáp đủ ý, sắc thái Việt tự nhiên. Nhịp lên xuống và khoảng nghỉ phục vụ cảm xúc; không áp một định mức cắt/phút lên mọi cảnh.
- Bản dựng ghi bối cảnh, cỡ/góc, lens, chuyển động/rung, focus, âm thanh và khoảng nghỉ. Lời đọc sạch không có chỉ dẫn kỹ thuật; bản ElevenLabs có thẻ diễn xuất nếu model đã chọn hỗ trợ.
- Ưu tiên ElevenLabs cho nội dung mới, nhưng backend còn mặc định VieNeu: cấu hình engine rõ ràng. Backend ElevenLabs cũ một giọng/toàn bài và tự siết khoảng lặng; không coi nó là công cụ nhiều vai đã sẵn sàng hoặc có cache từng câu.
- Chốt văn bản trước media, tái dùng phần đã đạt, kiểm tra đúng phần thay đổi. Khi tạo giọng, ghi model/voice/độ dài/chi phí thực trong tập. Không dùng chi phí lịch sử làm báo giá hiện tại.
- Chỉ báo đã xem, nghe, test hay render khi đã thực hiện. Kiểm tra storyboard thật trước chuyển động; kiểm tra tiếng Việt và audio thật trước giao video.

## Hạ tầng được giữ lại

Studio là `what-if-studio/` tại gốc repo, không phải `studio/` trong skill. `rewind` và `copy-paste` là ví dụ kỹ thuật cũ. Scripts `voice`, `plan`, `stills`, `board`, `sfx`, `mixcheck`, `motiongrid`, `master` chạy từ studio và cần episode đã được dựng theo schema.

Các hướng dẫn nhịp siêu ngắn trong tài liệu kỹ thuật chỉ áp dụng khi làm đúng kiểu clip đó. Ghi chú gốc về lượt xem, chi phí hay các lần chạy không phải kết quả mới của repo này. Giữ nhân vật/câu chuyện nguyên bản và attribution của mã kế thừa; khóa dịch vụ chỉ ở môi trường local.
