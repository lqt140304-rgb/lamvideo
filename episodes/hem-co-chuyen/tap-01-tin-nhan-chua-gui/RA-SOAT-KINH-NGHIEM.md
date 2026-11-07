# Rà soát kinh nghiệm Antigravity — đợt nâng cấp asset

Ngày: **07/11/2026**. Phạm vi: chọn lọc tài liệu do chủ repo gửi sau khi Antigravity cải tiến thư viện asset. Những cảnh của tập là nơi thử hình; đợt nâng cấp không được đánh giá như một lần dựng đủ phim. Bài học chung đã viết lại vào [docs/KINH-NGHIEM.md](../../../docs/KINH-NGHIEM.md); chi tiết lần thử được giữ trong hồ sơ tập.

## Nguồn và mức kiểm chứng

- Tác giả ghi chép: Antigravity; tên file nhận: `1-KINH_NGHIEM_THUC_CHIEN_WHAT_IF_STUDIO.md` (tiêu đề “KINH NGHIỆM THỰC CHIẾN SẢN XUẤT HOẠT HÌNH 2D / 2.5D VỚI REMOTION & SVG”). SHA-256 bản nhận: `7630e7cd47b7cdc816568a8622af08340da7650dcdc980d7019fe576e4d381f2`.
- Đã đọc toàn bộ ghi chép và file kinh nghiệm hiện hành; đối chiếu `camT` trong [anim.ts](../../../what-if-studio/src/engine/anim.ts), cách tải font trong [fonts.ts](../../../what-if-studio/src/engine/fonts.ts), cùng các ảnh/mã asset đã xem ở đợt rà trước.
- Ghi chép của Anti là nguồn báo cáo lần thử. Không có video/log đo đi kèm trong file này để xác nhận lại mọi sự cố, chi phí hoặc hiệu quả định lượng. Lượt rà hiện tại chỉ sửa tài liệu; không tạo audio/ảnh/video hoặc chạy render lại.
- Không chép nguyên bản vào kinh nghiệm chung. Bảng dưới lưu đường đi của từng mục để tránh nhập trùng hoặc vô tình dùng thông số một lần thử làm quy tắc.

## Đối chiếu từng mục

| Mục tài liệu Anti | Xử lý | Phần giữ / lý do |
|---|---|---|
| 1. Tổng quan hệ thống/pipeline | Đã có, không chép thêm | README, CLAUDE và WHAT-IF-QUY-TRINH đã nêu công cụ/quy trình. Không biến sơ đồ rút gọn thành pipeline tự động hoặc bỏ storyboard → animatic |
| 2.1. Bounds/viền cắt | Bổ sung nguyên tắc | Tính miền nhìn theo máy/zoom/lớp, kiểm tra cực hạn và chuyển động. Loại định mức ±300px/+400px; tọa độ bên dưới chỉ là ví dụ kỹ thuật |
| 2.2. Phụ kiện bám rig | Gộp vào bài học tiếp xúc đã có | Mở rộng từ vật cầm sang vật đeo, chọn điểm gắn và thừa hưởng transform; component rời vẫn hợp lệ nếu gắn đúng. Không giữ lệnh cấm component rời hoặc cam kết 100% |
| 2.3. Lỗi viền tóc | Bổ sung có điều kiện | Chẩn đoán lớp/stroke/filter/scale và thử mảng kín nếu hợp phong cách. Không bắt mọi tóc phải solid fill |
| 2.4. Tỷ lệ tay/pose ngồi | Bổ sung nguyên tắc | Duyệt tỷ lệ theo nhân vật/tuổi/góc nhìn và mặt đỡ. Không dùng 52/46 như chuẩn giải phẫu hoặc ép mọi tay ngồi lên đùi |
| 3.1. Phản chiếu mắt | Gộp ý mỹ thuật; loại kết luận chưa kiểm chứng | Giữ nguồn sáng/hướng nhìn và tính nhất quán phản chiếu. Chưa xác minh khẳng định sinh học cho mèo/cú từ tài liệu này; không nhập như dữ kiện. Loại số “tăng 200%”, quy tắc bắt buộc 4 lớp và công thức đồng tử cố định |
| 3.2. Vệt sáng/vũng sáng | Gộp vào chiều sâu/ánh sáng đã có | Giữ quan hệ nguồn → không khí → mặt sàn → vật bắt sáng. Tọa độ, màu và opacity riêng không vào bài học chung |
| 3.3. Tối dần góc khuất | Gộp cùng mục ánh sáng | Dẫn mắt bằng tương phản vẫn phải đọc được hành động; không bắt mọi cảnh có đúng 3 lớp mask hoặc đen ở cùng vị trí |
| 4.1. Chi tiết đời sống Việt Nam | Bổ sung nguyên tắc | Chọn dấu vết sinh hoạt hợp địa điểm và hoàn cảnh. Danh sách mảnh chai/cổng/rau/dây là tham khảo của bối cảnh này, không là danh sách bắt buộc cho mọi hẻm |
| 4.2. Nhân vật ngoài khung | Bổ sung nguyên tắc | Dùng bóng/âm/vật cản/phản ứng để giới hạn vai theo ý đồ. Không áp vị trí, mã màu hoặc kiểu hành động của người bố cho mọi nhân vật phụ |
| 4.3. Căn nhà ấm | Gộp ý ánh sáng theo tâm trạng | Chọn nguồn/màu theo cảnh; danh sách nội thất và vị trí đồ thuộc ASSET/DUNG-CANH của tập. Nhà có ánh ấm không tự mang nghĩa an toàn hoặc gia đình hạnh phúc |
| 5.1. Bỏ lỗi chứng chỉ | Không giữ như lệnh chuẩn; thay bằng xử lý nguyên nhân | Đọc lỗi, kiểm tra mạng/CA, cân nhắc font local hợp quyền dùng và chờ font. Không sao chép cờ bỏ xác minh chứng chỉ vào lệnh mặc định |
| 5.2. Ảnh base64 trong HTML | Bổ sung nguyên tắc | Ảnh tĩnh/thumbnail/liên kết hợp bối cảnh bàn giao; đo HTML và media riêng. Các số 35MB/15KB do Anti báo, chưa đo lại, không dùng làm cam kết hiệu suất |
| 5.3. Cấu trúc repo | Đã có, không chép thêm | Theo README/CLAUDE, ghi alias của tập. Chỉ thành phần dùng lại được mới thuộc engine chung; không bắt mọi set riêng vào engine hoặc mọi tập có đúng 10 still |
| 6. Checklist QA | Đã có phần lớn; gộp kiểm tra còn thiếu vào bài học tương ứng | Bounds được bổ sung; tiếp xúc/ánh sáng/diff đã có. Typecheck cần khi sửa mã, không thay xem/nghe; số lớp mắt là lựa chọn mỹ thuật, không là điều kiện đạt chung |

Kết quả ở file chung: **7 bài học mới** (bản sắc không gian, vai ngoài khung, bounds, lỗi viền/tóc, tỷ lệ/pose, font khi render, preview/media) và **2 mục được mở rộng** (ánh sáng/chiều sâu; vật cầm/phụ kiện bám điểm gắn). Các hàng khác trong bảng có thể góp vào cùng một mục; không đếm lại thành nhiều bài học.

## Ghi chú kỹ thuật giữ riêng

Với phép `camT(cx, cy, s)` hiện tại, không có quay và chưa tính transform cha khác, màn hình 1920×1080 nhìn thấy miền thế giới:

`x ∈ [cx − 960/s, cx + 960/s]`, `y ∈ [cy − 540/s, cy + 540/s]`, với `s > 0`.

Vì vậy, tâm y=740 chỉ cho đáy y=1280 khi zoom s=1. Nếu s=1,25, đáy là y=1172. Cần hợp các miền theo toàn đường máy và chuyển động tương đối từng lớp; độ đệm còn tùy bộ lọc, overshoot và vùng sẽ lộ. Mở sàn tới 1400 hay nền tới 2600×1700 là cách xử lý cụ thể Anti báo, không phải định mức cho mọi shot.

Các thông số tay 52/46, màu/opacity của đèn, vị trí đồ đạc, tên component và số ảnh thử có thể tra trong mã/ASSET. Chúng không được đưa vào file kinh nghiệm dùng chung như chuẩn bắt buộc. Không sửa code/asset của Anti trong lượt nhập bài học.

## Nguồn đối chiếu thêm

- [Remotion: dùng font, font local và chờ tải font](https://www.remotion.dev/docs/fonts), truy cập 07/11/2026: xác nhận có thể phục vụ font từ public và cần bảo đảm font sẵn sàng. Đây là giải pháp được khuyến nghị, chưa cài font local mới cho repo ở lượt này.
- [Remotion: renderStill](https://www.remotion.dev/docs/renderer/render-still), truy cập 07/11/2026: render một khung không chứng minh chất lượng chuyển động của cả cảnh. Quy trình xem animatic hiện hành vẫn được giữ.
