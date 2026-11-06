# lamvideo — What If giữa đời thường

Những chuyện giả định đặt người bình thường vào một lựa chọn khó, để người xem tự hỏi: **nếu là mình thì sao?** Ưu tiên đời sống Việt Nam, mâu thuẫn có chiều sâu, kết thúc có hệ quả và cách sản xuất vừa sức.

## Bắt đầu ở đây

| File | Dùng để làm gì |
|---|---|
| [Mục tiêu](docs/MUC-TIEU.md) | Hướng nội dung, phạm vi thử và tiêu chí đánh giá |
| [Kinh nghiệm](docs/KINH-NGHIEM.md) | Nguyên tắc dùng chung về chất lượng và tiết kiệm chi phí |
| [Asset](docs/ASSET.md) | Thư viện dùng chung và đường dẫn tài nguyên từng tập |
| [Kịch bản](docs/KICH-BAN.md) | Mục lục các tập, bản nào là nguồn chính |
| [Quy trình](docs/WHAT-IF-QUY-TRINH.md) | Nghiên cứu → viết → dựng → kiểm tra |
| [CLAUDE.md](CLAUDE.md) | Quy tắc làm việc và sắp xếp file cho Claude |

## Cấu trúc

```text
docs/                         mục tiêu, kinh nghiệm, mục lục dùng chung
episodes/<series>/<slug-tap>/  hồ sơ riêng của từng tập
  README.md                   trạng thái, phạm vi, các bản nguồn
  KICH-BAN.md                 bản dựng có cảnh, thoại, camera, khoảng nghỉ
  LOI-DOC.md                  lời đọc sạch
  ELEVENLABS.md               lời đọc có hướng diễn xuất để thử
  ASSET.md                    asset của riêng tập và trạng thái
  GHI-CHU.md                  các quyết định, lỗi, phản hồi riêng của tập
.claude/skills/what-if-animation/  skill và công cụ kỹ thuật
what-if-studio/               studio Remotion, engine, thư viện và tập mẫu
```

Nghiên cứu hoặc tài nguyên mới cũng đặt trong thư mục tập tương ứng khi phát sinh. Không tạo hàng loạt file rỗng. Kinh nghiệm chung không chứa cốt truyện riêng của tập.

Hồ sơ đã sắp xếp: [Tin nhắn chưa gửi](episodes/hem-co-chuyen/tap-01-tin-nhan-chua-gui/README.md) và [Mưa liên tục 100 ngày](episodes/doc-lap/mua-100-ngay/README.md). Tập mưa giữ bản dựng cũ trong `production/` của chính tập để bảo toàn engine và dữ liệu từng cảnh; không tự nhập các thay đổi cũ đó vào engine chung.

## Dùng studio

```powershell
cd what-if-studio
npm ci
npm run studio
# Kiểm tra khi sửa mã:
npm run typecheck
```

Hai ví dụ `rewind` và `copy-paste` được giữ để tham khảo kỹ thuật. Studio hiện có bố cục ngang 1920×1080; không tự biến kịch bản Markdown thành video hoàn chỉnh. Làm nội dung mới đọc [quy trình](docs/WHAT-IF-QUY-TRINH.md) trước, đặc biệt giới hạn của backend giọng và cách giữ khoảng nghỉ. Ưu tiên ElevenLabs; chưa cần gọi dịch vụ khi chỉ sửa tài liệu.

## Phạm vi repo

Repo tập trung vào What If. Các công cụ của luồng tin tức/review và video tuổi thơ cũ đã được gỡ khỏi nhánh chính; lịch sử Git vẫn giữ các bản trước. Không xóa kho Git gốc của một worktree để dọn dung lượng.

Engine và skill kỹ thuật kế thừa [what-if-animation của Baptiste Kelano](https://github.com/kelano86/what-if-animation); giữ [LICENSE](.claude/skills/what-if-animation/LICENSE). Giấy phép mã không mặc nhiên áp dụng cho mọi âm thanh hoặc tài nguyên bên thứ ba: ghi nguồn theo [quy tắc asset](docs/ASSET.md).
