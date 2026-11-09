# Danh mục asset dùng chung

**Bộ tư thế/khớp Hồ sơ 2:** rig chính ở [nhan-vat.tsx](../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat.tsx), đủ 8 góc quay cho Nam–Người Kia–Tùng; [cách dùng](../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/thiet-ke/QUY-CHUAN-THIET-KE-SVG.md). [Rig cũ](../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/rig/RIG-NHAN-VAT.md) chỉ để đối chiếu. Lưu trong hồ sơ; chưa chuyển thành rig chung hoặc coi là motion toàn phim đã duyệt.

**Mỹ thuật khi tạo/sửa asset:** đọc [quy chuẩn chung](PHONG-CACH-MY-THUAT.md). Cả nhân vật lẫn nền và đạo cụ dùng nét cong mềm, khối tròn đầy; kiểm tra cùng khung, không mặc định asset cũ đã đạt chỉ vì được ghi trong danh mục.

Chỉ lưu tài nguyên dùng lại được và đường dẫn tới từng tập. Nhân vật, đạo cụ hoặc hình thử dành riêng một tập phải được ghi trong `ASSET.md` của tập đó.

| Nhóm | Vị trí | Trạng thái / lưu ý |
|---|---|---|
| Engine, rig, props, UI | [engine](../what-if-studio/src/engine/) | Đã nhận nâng cấp cd7243c: thêm biểu cảm/tay/phụ kiện, hands, props_life, vehicles và set thử; có mã/preview, cần kiểm tra trong cảnh mới |
| VFX, khẩu hình, rig mềm | [ASSET-VFX.md](ASSET-VFX.md) | Wind/cloud/dust/smoke/rain/ripple/impact, blink/mouth và khớp–vải–hông; có code, still/clip thử; giữ tỉ lệ cartoon, chưa duyệt toàn tập |
| Tư liệu hình thể | [hinh-the-nguoi](tham-khao/hinh-the-nguoi/README.md) | 3 ảnh chủ repo gửi, nguyên nguồn; chỉ tham khảo tư thế, không là asset sản xuất đã cấp quyền |
| Bối cảnh mẫu | [sets](../what-if-studio/src/engine/sets/) | bedroom, classroom, kitchen, rooftop, schematic, stairwell, study; không mặc nhiên là đúng nhà/tiệm của tập mới |
| Cây đa / bông vàng | [banyan_tree.tsx](../what-if-studio/src/engine/sets/banyan_tree.tsx), [golden_grain.tsx](../what-if-studio/src/engine/sets/golden_grain.tsx) | `SET-BANYAN` v1: `BanyanTree({t,x,y,s})`, gốc cố định, tán/rễ phụ lay nhẹ; bông vàng v2: hạt/vỏ/gân, chi tiết theo khoảng cách. SVG viết trong repo 08/11/2026, không lấy stock; giữ giấy phép engine. Dùng trong set hoàng hôn, có still/clip thử, chờ duyệt trong cảnh cuối |
| Thư viện âm thanh | [library/sfx](../what-if-studio/library/sfx/) | 40 file MP3 tại thời điểm rà 07/11/2026; gồm SFX, ambience và nhạc mẫu; chưa nghe kiểm kê lại từng file |
| Gói SFX KORBANN dùng chung | [Danh mục pack](../what-if-studio/library/sfx-packs/korbann/README.md) | 101 tệp local, chia 4 nhóm; manifest/CSV/trang nghe thử có trong Git. Chưa nghe duyệt, chưa xác minh quyền; raw media không lên GitHub, không tự chọn vào phim |
| Media hai tập mẫu | [rewind](../what-if-studio/public/rewind/), [copy-paste](../what-if-studio/public/copy-paste/) | Giữ để vận hành ví dụ; không coi giọng mẫu là giọng đã chọn cho nội dung mới |
| Font/cấu hình | [fonts.ts](../what-if-studio/src/engine/fonts.ts), [studio.config.ts](../what-if-studio/src/studio.config.ts) | Có cấu hình tiếng Việt; font có thể cần mạng khi render |
| Tài liệu kỹ thuật gốc | [skill](../.claude/skills/what-if-animation/README.md), [bảng tham khảo](tham-khao/Kelano-What-If-Prompts-Skills.xlsx) | Tham khảo kỹ thuật, không thay thế mục tiêu nội dung mới |

## Asset từng tập

| Hồ sơ | Danh mục |
|---|---|
| Hẻm Có Chuyện — Hồ sơ 2 | [ASSET.md](../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/ASSET.md): bộ mới **Nam, Người Kia, Tùng**, [bảng SVG](../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat.svg) và nguồn React/SVG; giữ bảng mẫu thứ 2 làm tham chiếu, chưa xác nhận rig/timeline hoàn thiện |
| Hẻm Có Chuyện — Hồ sơ 1 | [ASSET.md của tập](../episodes/hem-co-chuyen/tap-01-tin-nhan-chua-gui/ASSET.md); [kế hoạch dùng lại/chuẩn bị](../episodes/hem-co-chuyen/tap-01-tin-nhan-chua-gui/KE-HOACH-SAN-XUAT.md) |
| Tập độc lập — Mưa liên tục 100 ngày | [ASSET.md của tập](../episodes/doc-lap/mua-100-ngay/ASSET.md); mã dựng cũ và media local nằm cùng hồ sơ tập |

## Khi thêm hoặc dùng lại tài nguyên

Ghi **mã asset, loại, đường dẫn, nguồn/tác giả, quyền sử dụng hoặc tình trạng chưa kiểm tra, phiên bản, nơi dùng và trạng thái**. Phân biệt “đã có file”, “đã kiểm tra” và “chưa tạo”. Không ghi asset dự kiến như thể đã sản xuất.

Tài nguyên do repo kỹ thuật gốc cung cấp chưa được tái xác minh toàn bộ quyền sử dụng media trong lần cập nhật này. Giữ giấy phép/attribution gốc và kiểm tra từng tài nguyên trước khi phát hành; không áp giấy phép MIT của code cho mọi media. Không thêm API key hoặc thông tin tài khoản vào bảng asset.

Với **nhạc, Foley/tiếng vật thể và ambience**, ưu tiên thư viện có sẵn hoặc nguồn miễn phí phù hợp trước khi tạo trả phí. Ghi thêm URL trang gốc, tác giả, tên/phiên bản giấy phép hoặc bằng chứng quyền dùng, ngày kiểm tra, yêu cầu ghi công và hạn chế sử dụng nếu có. “Tải miễn phí” không tự chứng minh được quyền dùng trong video kiếm tiền; chưa rõ quyền thì đánh dấu chưa duyệt phát hành.

Trong `ASSET.md` hoặc bảng cue của tập, ghi tính chất âm thanh và nơi dùng: nhạc theo nhịp cảm xúc; Foley theo vật liệu/hành động/lực; ambience theo địa điểm/khoảng cách/vật cản. Mỗi cue quan trọng có mốc bắt đầu–kết thúc hoặc điểm đồng bộ, vai trò nổi/nền và diễn biến âm lượng dự kiến. Đây là thông tin riêng của tập, không ghi từng clip/cue vào kinh nghiệm chung.

Asset riêng nằm dưới `episodes/<series>/<slug-tap>/assets/` khi phát sinh. Bản media để Remotion đọc nằm ở `what-if-studio/public/<slug-tap>/` và được liên kết từ hồ sơ tập. Output nặng giữ local hoặc kho lưu trữ được chọn; không đẩy tự động vào Git.

## Cập nhật phạm vi series

[Vũ trụ Hẻm Có Chuyện](../episodes/hem-co-chuyen/VU-TRU.md) ghi năng lực và dấu nhận diện các thực thể. Nguyên hình đồng hồ ba mắt/kho lọ đang là **asset dự kiến riêng tập 01**, danh mục ở ASSET của tập; chưa có file để đưa vào thư viện dùng chung.
