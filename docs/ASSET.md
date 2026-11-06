# Danh mục asset dùng chung

Chỉ lưu tài nguyên dùng lại được và đường dẫn tới từng tập. Nhân vật, đạo cụ hoặc hình thử dành riêng một tập phải được ghi trong `ASSET.md` của tập đó.

| Nhóm | Vị trí | Trạng thái / lưu ý |
|---|---|---|
| Engine, rig, props, UI | [engine](../what-if-studio/src/engine/) | Có mã nguồn; cần kiểm tra hình khi dùng trong cảnh mới |
| Bối cảnh mẫu | [sets](../what-if-studio/src/engine/sets/) | bedroom, classroom, kitchen, rooftop, schematic, stairwell, study; không mặc nhiên là đúng nhà/tiệm của tập mới |
| Thư viện âm thanh | [library/sfx](../what-if-studio/library/sfx/) | 40 file MP3 tại thời điểm rà 07/11/2026; gồm SFX, ambience và nhạc mẫu; chưa nghe kiểm kê lại từng file |
| Media hai tập mẫu | [rewind](../what-if-studio/public/rewind/), [copy-paste](../what-if-studio/public/copy-paste/) | Giữ để vận hành ví dụ; không coi giọng mẫu là giọng đã chọn cho nội dung mới |
| Font/cấu hình | [fonts.ts](../what-if-studio/src/engine/fonts.ts), [studio.config.ts](../what-if-studio/src/studio.config.ts) | Có cấu hình tiếng Việt; font có thể cần mạng khi render |
| Tài liệu kỹ thuật gốc | [skill](../.claude/skills/what-if-animation/README.md), [bảng tham khảo](tham-khao/Kelano-What-If-Prompts-Skills.xlsx) | Tham khảo kỹ thuật, không thay thế mục tiêu nội dung mới |

## Asset từng tập

| Hồ sơ | Danh mục |
|---|---|
| Hẻm Có Chuyện — tập 01 | [ASSET.md của tập](../episodes/hem-co-chuyen/tap-01-tin-nhan-chua-gui/ASSET.md) |
| Tập độc lập — Mưa liên tục 100 ngày | [ASSET.md của tập](../episodes/doc-lap/mua-100-ngay/ASSET.md); mã dựng cũ và media local nằm cùng hồ sơ tập |

## Khi thêm hoặc dùng lại tài nguyên

Ghi **mã asset, loại, đường dẫn, nguồn/tác giả, quyền sử dụng hoặc tình trạng chưa kiểm tra, phiên bản, nơi dùng và trạng thái**. Phân biệt “đã có file”, “đã kiểm tra” và “chưa tạo”. Không ghi asset dự kiến như thể đã sản xuất.

Tài nguyên do repo kỹ thuật gốc cung cấp chưa được tái xác minh toàn bộ quyền sử dụng media trong lần cập nhật này. Giữ giấy phép/attribution gốc và kiểm tra từng tài nguyên trước khi phát hành; không áp giấy phép MIT của code cho mọi media. Không thêm API key hoặc thông tin tài khoản vào bảng asset.

Asset riêng nằm dưới `episodes/<series>/<slug-tap>/assets/` khi phát sinh. Bản media để Remotion đọc nằm ở `what-if-studio/public/<slug-tap>/` và được liên kết từ hồ sơ tập. Output nặng giữ local hoặc kho lưu trữ được chọn; không đẩy tự động vào Git.
