# Snapshot dựng cũ của tập mưa

Thư mục này giữ mã/engine/dữ liệu từng dùng cho 10 cảnh mưa. Nó nằm riêng trong hồ sơ tập để không đổi engine chung của repo. Không phải template mặc định cho các tập mới.

`src/episodes/index.ts` chỉ đăng ký `mua-100-c01` đến `mua-100-c10`. Các composition là `Mua100C01` … `Mua100C10`, có bản Board tương ứng. Engine và các bảng mẫu được giữ cùng phiên bản để các import của mã cũ còn đủ phụ thuộc.

## Dữ liệu và media

- Mã, JSON/captions/words/timeline, cấu hình package và scripts cũ được theo dõi bằng Git.
- `public/` có 39 file audio cũ; `library/sfx/` có 69 file âm khớp các clip cấu hình. Hai thư mục này chỉ ở local, nằm trong `.gitignore`.
- Nguồn và SHA-256 được ghi trong [asset-manifest.json](../asset-manifest.json). Báo cáo gốc ở [bao-cao-cu](../bao-cao-cu/README.md).

Máy clone mới phải khôi phục media local trước khi render. Máy hiện tại có thể dùng bộ node_modules tương thích của studio chung bằng liên kết local; liên kết đó không được đưa lên Git. Khi thiết lập máy khác, cài theo package-lock trong thư mục này, không chạy npm ở gốc repo.

## Dùng khi cần sửa bản cũ

Chạy `npm run typecheck` hoặc `npm run studio` từ chính thư mục `production/`. Những lệnh này không tự sinh giọng. Scripts trong `tools/` là snapshot lịch sử: có đường dẫn cache/output riêng của máy, xử lý pads và lựa chọn dịch vụ cũ. Đọc cấu hình và phạm vi cần làm trước khi chạy; không chạy voice/sfx/master chỉ để kiểm tra việc sao chép.

Giữ kịch bản v7 ở thư mục cha làm nguồn biên tập. Trước một thay đổi thực tế, xác định cảnh liên quan và đồng bộ lại lời, mốc, âm thanh, hình phụ thuộc. Chưa nghe/xem lại bản phim hoặc render lại trong lượt di chuyển dữ liệu này.

Mã kế thừa what-if-animation được giữ [LICENSE](LICENSE). Media có nguồn và điều kiện riêng theo [ASSET.md](../ASSET.md).
