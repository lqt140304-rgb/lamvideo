# Ngày xưa, mai nào cũng gặp — bản xem thử 1 (độc thoại)

Nguồn: `Kich_ban_Hoi_ban_theo_tai_lieu_v3.md` (ChatGPT, 05/11/2026). Lời đọc = Bản B, khớp từng chữ (đã so tự động: 2306/2306 ký tự). Một giọng kể (`NARR`), nhân vật chỉ diễn. Chưa đăng, chưa merge main.

## Trạng thái kiểm tra
| Mục | Trạng thái |
|---|---|
| Lời đọc khớp Bản B | ĐÃ KIỂM TRA (so tự động) |
| Giọng đọc (voice ID) | CHƯA KIỂM TRA: chưa đối chiếu danh sách giọng của VieNeu trên máy anh; 'Hải Đăng' chỉ là tên tạm |
| Audio thật | CHƯA CÓ: container không có VieNeu |
| Hình khớp audio | CHƯA: đang theo thời lượng ước tính (~194 giây) |
| SRT | ƯỚC LƯỢNG, chưa đo theo audio thật |
| Typecheck | CHƯA CHẠY: container không tải được thư viện npm |
| Nghe nhạc/SFX | CHƯA NGHE (SFX và nhạc tự tạo/có sẵn) |
| Ảnh nền | Ảnh thật chưa xác minh quyền (xem `credits.json`): CHỈ BẢN NỘI BỘ; bản phát hành phải thay bằng minh họa tự tạo hoặc ảnh có quyền |

## Cảnh dựng theo Bản A
| Cảnh dựng | Bản A | Chữ trong hình | Nhân vật |
|---|---|---|---|
| S01A–S01C | Cảnh 1 Một tiếng nữa | THÊM MỘT TIẾNG → HẸN MỘT BUỔI | Minh (người kể, mascot hoodie xanh), Tèo, Bờm, Na |
| S02A–S02C | Cảnh 2 Mai lại ra nhé | VÁN CUỐI | như trên; xe đạp, cặp, CRT |
| S03A–S03C | Cảnh 3 Những cuộc hẹn để sau | ĐỂ HÔM KHÁC | ô nhỏ từng người, tin nhóm |
| S04A–S04C | Cảnh 4 Vẫn là chúng nó | VẪN LÀ CHÚNG NÓ | ảnh nhóm, ghế trống |
| S05A–S05B | Cảnh 5 Lần gặp bình thường ấy | HÔM NÀO GẶP TIẾP | giữ ảnh/cận xe, cặp 3 giây |
| S06A–S06C | Cảnh 6 Gặp được, cứ gặp đã | LÂU RỒI… BẠN ĐÃ GỌI CHÚNG NÓ CHƯA? (không đọc) | bàn nhỏ, chụp ảnh |

## Điểm lệch / lưu ý so với Bản A
- Người kể 'mình' do em chọn là nhân vật Minh (mascot hoodie xanh); Bản A không chỉ định. Anh/ChatGPT xác nhận.
- Bản A đề nghị biểu cảm van-phong, met, buon-nhe: bộ sprite hiện chỉ có 12 pose (stand, wave, think, sad, phone…); đã dùng pose gần nhất. Không tạo bộ biểu cảm mới.
- 'Tiền lẻ', 'ô lịch', 'tin nhắn giờ gửi cách nhau', 'đồng hồ tiến thêm' chưa có asset riêng: dùng chữ/chip và đồng hồ có sẵn.
- Ảnh nhóm (anh-bon-nguoi, anh-ba-nguoi) là ảnh ghép mascot lên nền ảnh thật; cùng điều kiện quyền như nền.
- Nhạc nền `ky-niem.mp3` (có sẵn trong repo, chưa nghe) để rất nhỏ.

## Việc cần làm trên máy anh
```
cd D:\lamvideo
git fetch
git checkout ngay-xua-mai-nao-cung-gap
git pull
npm run voice -- ngay-xua-mai-nao-cung-gap --audition
```
Lệnh trên in danh sách giọng thật và đọc thử hook + cảnh 5 vào `public/ngay-xua-mai-nao-cung-gap/voice/audition/`. So nhiều giọng: thêm `--try "Hải Đăng,Minh Đức"`. Chọn xong, sửa `voices` và `voice.speaker` trong script.json, rồi:
```
npm run voice -- ngay-xua-mai-nao-cung-gap
python tools/preview_audio_srt.py ngay-xua-mai-nao-cung-gap
npm run make -- ngay-xua-mai-nao-cung-gap
```
Sau khi có voice.json, hình và phụ đề tự căn theo độ dài audio thật; SRT cần xem lại các chỗ chuyển cảnh và khoảng lặng.
