# Giọng nhân vật Hồ sơ 02 bằng ElevenLabs — thiết kế ngắn

## Mục đích
Làm sẵn toàn bộ thoại của Hồ sơ 02 (Người trong gương), mỗi câu một file theo mã cue. Dựng hình xong chỉ cần thả vào timeline; khẩu hình và độ dài shot 3D có thể căn theo audio thật.

## Mục tiêu / không làm
- Có: thoại đúng bản chính `KICH-BAN-15P-HOAN-CHINH.md` (chủ repo đã chốt lời 15/11/2026), mỗi vai một giọng, mỗi cue một file.
- Không: không dùng `VOICEOVER-CUE-SHEET.md` cũ làm nguồn lời (lệch bản chính); không trộn SFX/nhạc; không hậu kỳ (EQ điện thoại, reverb…) ở bước này.
- Thất bại nếu: lời trong file khác bản chính, hoặc tốn credit cho bản đọc nhiều lượt.

## Cách làm (đã chọn)
Các hướng đã cân nhắc:
1. Máy đọc từng câu, 2 bản/câu để chọn: ~30k credit.
2. **Thử giọng ít, chốt rồi đọc 1 lượt: ~15–20k credit — chủ repo chọn.**
3. Chủ repo tự đọc rồi đổi giọng (speech-to-speech): diễn tốt nhất nhưng phải thu 15–20 phút.

### Bước 1 — Trích cue từ bản chính
Lập `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/thoai-cue.json`: mã cue, vai, thẻ cảm xúc, lời đúng nguyên văn. Cập nhật cue sheet theo danh sách này. Rà tay các câu không có nhãn vai (vd. "Nam nhăn mặt bực bội:" rồi đến thoại).

### Bước 2 — Thử giọng (mỗi ứng viên 3 câu: thường, cảm xúc mạnh, thì thầm/hét)
| Vai | Ứng viên | Ghi chú |
|---|---|---|
| Nam | Nhật Phong, Phong, Cuong Nguyen (nam trẻ miền Bắc) | |
| Người Kia | cùng 3 giọng trên, stability cao, style 0 | phải chung giọng với Nam |
| Tùng | cùng 3 giọng trên | sẽ chọn giọng khác Nam |
| Giảng viên | Viet Dung, ONG THAY HUNG, Quang Toan | |

Ước tính ~12 bộ × ~300 ký tự ≈ 3.600 credit. File thử nằm ở `what-if-studio/out/ho-so-02-nguoi-lam-thay/thu-giong/` (không commit).

### Bước 3 — Đọc 1 lượt
Sau khi chủ repo chốt giọng từng vai: mỗi cue gọi API một lần → `what-if-studio/public/ho-so-02-nguoi-lam-thay/thoai/<CUE>.mp3` cùng `thoai-manifest.json` (độ dài từng file). Có cache theo lời và cài đặt: chạy lại không tốn credit trừ cue nào đã đổi. Ghi chi phí thật vào hồ sơ tập.

## Quyết định của trợ lý (sửa được)
- Model **`eleven_v4`** (chủ repo chọn 15/11/2026). Model này có tiếng Việt, mỗi ký tự tính 1 credit, mỗi lần gọi tối đa 10.000 ký tự. `multilingual_v2` không có tiếng Việt.
- Rủi ro: API báo v4 và v3 đều có `serves_pro_voices: false`, trong khi các giọng tiếng Việt ứng viên đều thuộc loại "professional". Khi thử giọng, nếu API từ chối hoặc giọng bị đổi sang giọng khác, dừng lại báo chủ repo, không tự đổi model. Cũng chưa rõ v4 có hiểu thẻ cảm xúc dạng `[whispers]` hay không: bộ thử có một câu mang thẻ để kiểm tra.
- Không dùng giọng nhân bản của tài khoản nếu chủ repo không bảo.
- Không cắt khoảng lặng; nhịp nghỉ dựng trên timeline.
- Tạo script mới đọc theo từng cue, để ở `.claude/skills/what-if-animation/scripts/`, dùng chung `wi.py`. Script cũ `voice_elevenlabs.py` không đổi.
- Vai phụ (mẹ, họ hàng, sinh viên xì xào) chỉ làm nếu bước 1 tìm ra lời thoại cụ thể.

## Để cho người dựng
Định dạng chi tiết của JSON, cách đặt tên cue, cách in bảng so sánh cho từng bản thử.
