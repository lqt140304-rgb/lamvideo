# KORBANN — gói âm thanh dùng chung

Nhập local ngày 09/11/2026 theo yêu cầu chủ repo. **101 tệp nguyên gốc**, chưa chuyển mã hoặc nghe duyệt. Tên pack lấy từ ZIP được cung cấp, chưa xác minh người sáng tạo gốc.

| Nhóm / thư mục local | Số tệp |
|---|---:|
| `media/mechanical/` — máy móc | 21 |
| `media/transitions/` — whoosh, riser, hit | 19 |
| `media/memes/` — meme | 39 |
| `media/games/` — game | 22 |

85 MP3, 9 WAV, 7 MP4. Bảy MP4 chỉ có luồng âm thanh AAC, không có hình; giữ nguyên container và chất lượng. 2 tệp có ảnh bìa nhúng, được giữ nguyên và ghi riêng trong manifest; không có luồng video chuyển động. Có 101 nội dung SHA-256 khác nhau; các tệp trùng được giữ đúng gói và đánh dấu `duplicate_of`, chưa xóa.

## Cách tra và nghe thử

- Mở [index.html](index.html) ở trình duyệt trên máy đã nhập để nghe từng tệp; Ctrl+F tìm theo tên. Trang dùng media local, không có CDN hoặc yêu cầu mạng.
- [catalog.csv](catalog.csv) dùng để lọc trong Excel; [manifest.json](manifest.json) có ID, đường dẫn, tên trong ZIP, hash, thời lượng, codec và trạng thái quyền/nghe duyệt.
- Dùng ID như `korbann-mechanical-clock-ticking` để ghi lựa chọn trong ASSET/cue của tập. Đường dẫn trong manifest tính từ thư mục pack này.
- Gói nằm ở `library/sfx-packs/korbann/`, tách khỏi `library/sfx/` mà bộ chọn âm cũ đang quét tự động. Nhập thư viện không có nghĩa là tự gán âm vào phim. Nghe đúng âm và kiểm tra nguồn/quyền trước khi đưa vào bản phát hành.

## Nguồn và quyền sử dụng

- ZIP chủ repo cung cấp: `KORBANN SFX PACK 100+ Sounds-20261108T172359Z-1-001.zip`.
- SHA-256 ZIP: `ede17977468da3e09fd7dc36211221b050b8637ce626b63ac9b945db6ecee771`.
- Không có giấy phép/README trong 101 tệp ZIP. URL nguồn, tác giả và điều kiện thương mại/tái phân phối chưa được xác minh; `rights_status=unverified`, `approved_for_release=false`.
- Tên gắn game, chương trình hoặc meme chỉ là tên tệp, không chứng minh nguồn hoặc quyền. Danh mục chưa chọn chúng cho bản phát hành.
- Khi có bằng chứng quyền: ghi URL gốc, tác giả, tên/phiên bản giấy phép, ngày kiểm tra, yêu cầu ghi công và hạn chế trong metadata. Quyền có thể khác nhau giữa các tệp.

## Lưu trữ và khôi phục

Git chỉ lưu README, trang nghe thử, manifest và CSV. Toàn bộ `media/` giữ local và đã được gitignore; không đăng raw SFX lên GitHub. Máy clone repo chỉ có danh mục, không tự có âm thanh.

Để khôi phục local từ đúng ZIP: xác nhận hash ZIP bên trên; với mỗi `items[]`, sao chép `original_zip_entry` tới `path` tương ứng trong thư mục pack, kiểm tra SHA-256 từng tệp. Không ghi đè tệp khác hash. Bản ZIP người dùng đưa giữ nguyên ở nơi ban đầu.

Khi cần dựng, chọn tệp có nguồn/quyền phù hợp, ghi ID và xử lý trong hồ sơ tập; chỉ copy phần cần vào media runtime của tập. Không thay âm các tập hiện có trong lượt nhập này.
