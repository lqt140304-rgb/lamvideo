# Chuyện gì xảy ra nếu mưa liên tục 100 ngày?

**Loại:** tập What If độc lập, được nhập lại từ dự án trước. Không thuộc thế giới The Crack in Reality (Hẻm Có Chuyện). Nhập ngày 07/11/2026, không sáng tác lại hoặc tạo media mới trong lượt này.

## File để dùng

| File / thư mục | Vai trò |
|---|---|
| [KICH-BAN.md](KICH-BAN.md) | Bản dựng v7: bối cảnh, nhân vật, mực nước, camera, thoại, khoảng nghỉ và căn cứ nghiên cứu |
| [LOI-DOC.md](LOI-DOC.md) | Lời đọc sạch v7, bản nguồn khi biên tập lời |
| [ELEVENLABS.md](ELEVENLABS.md) | Lời đọc v7 có thẻ diễn xuất |
| [ASSET.md](ASSET.md) | Asset đã có, nguồn, nơi lưu và phần chưa xác minh lại |
| [GHI-CHU.md](GHI-CHU.md) | Trạng thái, điểm liên tục và lưu ý riêng của tập |
| [RA-SOAT-KINH-NGHIEM.md](RA-SOAT-KINH-NGHIEM.md) | Cách lọc kinh nghiệm cũ trước khi đưa vào tài liệu chung |
| [asset-manifest.json](asset-manifest.json) | Nguồn tương đối, kích thước, SHA-256 và nơi lưu Git/local của từng file nhập |
| [production](production/README.md) | Snapshot mã và dữ liệu dựng đủ 10 cảnh, dùng engine cũ riêng của tập |
| [bao-cao-cu](bao-cao-cu/README.md) | Báo cáo và shotlist từ lần dựng trước; không phải kết quả kiểm tra mới |

## Những gì đã kiểm tra khi nhập

Ba bản văn v7 được sao chép nguyên byte. Lời trong `episode.json` của 10 cảnh và lời đọc sạch có cùng 5.369 đơn vị từ vựng sau khi bỏ thẻ và chuẩn hóa chữ; phép so sánh này không kiểm tra diễn xuất hay âm thanh thực tế. Những file sao chép được đối chiếu SHA-256 với nguồn.

Có 244 file gốc được ghi nhận: 136 file văn bản/mã/báo cáo và 108 file âm thanh local, khoảng 441,8 MiB. Registry của snapshot chỉ đăng ký 10 cảnh mưa. Không đưa các tập khác, package của luồng tin tức hay cache cũ vào hồ sơ này.

## Bản đã dựng và bản biên tập

Kịch bản v7 là nguồn biên tập. JSON, timeline, captions và báo cáo trong `production/`/`bao-cao-cu/` là trạng thái của lần dựng cũ, để đối chiếu và tiếp tục khi cần. Cảnh kỹ thuật `mua-100-c01` đến `mua-100-c10` đều thuộc **một tập**, không phải 10 tập nội dung mới. Phần đầu cảnh 9 của kịch bản đã được dựng ở cuối cảnh 8; xem ghi chú trước khi sửa đường nối.

Các báo cáo cũ cộng lại 1.565,2 giây của từng cảnh; không dùng phép cộng này làm thời lượng chính xác của bản ghép có chuyển cảnh. Có video cũ trên máy nhưng chưa xem/nghe lại trong lần nhập; không đánh dấu tập đã qua kiểm duyệt mới.

Media nặng chỉ có local và được `.gitignore` loại khỏi commit. Máy khác clone repo sẽ cần khôi phục các file local theo manifest. Mở [production/README.md](production/README.md) để biết giới hạn, không chạy script tạo giọng/âm thanh chỉ vì có sẵn file.
