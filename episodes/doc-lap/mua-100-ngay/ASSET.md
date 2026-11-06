# Asset — Mưa liên tục 100 ngày

Danh mục này dành riêng tập mưa. Không đưa các thiết kế hoặc thông số của tập thành tiêu chuẩn cho mọi nội dung mới. Kiểm kê ngày 07/11/2026; chưa nghe/xem lại tất cả asset.

## Hình và mã dựng đã có

| Nhóm | Vị trí trong hồ sơ tập | Trạng thái |
|---|---|---|
| An, Hạnh, Linh, bà Sáu, Nam và vai hỗ trợ | [rig.tsx](production/src/engine/rig.tsx), [ModelSheet.tsx](production/src/ModelSheet.tsx) | Mã gốc được giữ; gồm một số look thư viện là phụ thuộc kỹ thuật, không phải tuyến truyện mới |
| Nhà, hẻm, vườn, gác của Bến Lau | [benlau.tsx](production/src/engine/sets/benlau.tsx), các `shots.tsx` theo cảnh | Mã gốc được giữ; trạng thái nước/đồ phải theo kịch bản |
| Trường, nơi trú, hành lang | [school.tsx](production/src/engine/sets/school.tsx) và cảnh 5–9 | Có set cũ, chưa đánh giá lại toàn bộ hình |
| Nhà sinh hoạt, đường cao, hậu quả sau lũ | [cảnh 10](production/src/episodes/mua-100-c10/shots.tsx) | Có mã gốc; giữ riêng trong tập |
| Bàn tay, vật dụng đời sống | [hands.tsx](production/src/engine/hands.tsx), [props_life.tsx](production/src/engine/props_life.tsx) | Có mã dùng trong snapshot; chưa đưa lên thư viện chung |
| Cảnh, captions, words, timeline | `production/src/episodes/mua-100-c01/` … `mua-100-c10/` | Đủ dữ liệu của 10 cảnh; [manifest](asset-manifest.json) ghi nguồn và hash |

## Âm thanh đang có trên máy

`production/public/mua-100-c01/` … `mua-100-c10/` chứa 39 file voice/mix/stem đã sao chép từ lần dựng trước. Cảnh 9 không có music.wav trong bộ nguồn. `production/library/sfx/` chứa 69 file khớp tên clip được các cấu hình sử dụng; tất cả tiền tố clip đều tìm được file. Các thư mục media này chỉ giữ local, không nằm trong Git.

Nguồn từng cảnh được giữ nguyên tại các file `nguon-am-thanh.md` trong [production/src/episodes](production/src/episodes/). Có ghi chú nguồn cho cảnh 2–8 và 10. Cảnh 1 dùng âm thanh tạo trước đó; cảnh 9 dùng lại tài nguyên. Ghi chú cũ là hồ sơ lịch sử, chưa phải xác minh mới về quyền sử dụng.

Các điểm cần xử lý trước khi phát hành lại:

- Nguồn của một số file ở cảnh 8 và 10 được ghi rõ là chưa kiểm tra lại giấy phép. Không chuyển toàn bộ thư viện sang nhãn “CC0”. File gió có nguồn gốc chưa ghi đầy đủ.
- Những file từng được xác định chưa rõ nguồn hoặc chưa dùng không được tự đưa vào bản phim mới chỉ vì còn trong cache cũ.
- Giữ credit/điều kiện nguồn nếu cần. Giấy phép MIT của mã trong [production/LICENSE](production/LICENSE) không mặc nhiên cấp quyền cho media.
- Bản voice/mix đã có không chứng minh đã nghe duyệt mọi câu. Nghe đúng đoạn sửa trước khi quyết định cần tạo lại.

## Video cũ và cấu hình máy

Thành phẩm cũ vẫn ở `D:\lamvideo-xuat\what-if\mua-100-c01\` … `mua-100-c10\`; bản ghép ở `D:\lamvideo-xuat\what-if\full\`. Không sao chép lại các MP4 lớn hoặc đưa chúng vào Git trong lượt này. Báo cáo/shotlist nhẹ đã nhập vào [bao-cao-cu](bao-cao-cu/README.md).

Từng file nhập có SHA-256 trong `asset-manifest.json`. Manifest chỉ ghi “đã sao chép đúng”, không chứng minh chất lượng nghe/nhìn, đầy đủ quyền sử dụng hay chi phí hóa đơn. Khi thay asset, lưu phiên bản và cảnh ảnh hưởng trong ghi chú của tập; chỉ đưa tài nguyên lên danh mục chung sau khi đã đánh giá khả năng dùng lại.
