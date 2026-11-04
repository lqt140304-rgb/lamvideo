# Kinh nghiệm đúc kết (đọc trước khi làm video mới)

Cập nhật sau mỗi lượt làm. Chạy `npm run lint` trước khi `npm run make` để bắt các lỗi bên dưới.

## Kịch bản
- **Không dùng khuôn câu cố định** ở mọi video. Cấm: "Khoan đã! Tóm lại là thế này." ở hook; "Vậy ai…?" mở cảnh kết luận; "Còn những việc không nên làm"; "Những chỗ dễ nhầm"; "Bình luận cho mình biết nhé" ở cuối. `npm run lint` báo khi cụm 4 từ lặp ở 3 video trở lên hoặc câu mở trùng nhau.
- Duy nhất được lặp: thương hiệu "Tóm lại là" ở cảnh kết.
- **Hook** (≤ 40 từ, ≤ ~9 giây): câu 1 là tình huống hoặc con số, câu 2 là một thông tin gây tò mò (không phải lời dẫn kiểu "để mình nói rõ"). Mỗi video chọn một kiểu: tình huống → hỏi, con số gây sốc, "ai cũng bảo… nhưng…", hỏi thẳng người xem, tin nóng.
- Đặt `cue` trong cảnh hook là cụm từ chốt ý (chép đúng lời đọc): dấu đóng và giật zoom xảy ra đúng lúc đó.
- **Câu mở cảnh** của list/verdict viết theo nội dung cảnh, không theo khuôn ("Không có khu sạc thì còn ba đường", "Gộp lại thì đây là tin tốt hay tin xấu?").
- **Lời kêu gọi cuối** đổi qua các video: hỏi trải nghiệm, nhờ lưu lại, nhờ gửi cho người thân, mời chọn một bên.
- `voice` viết số bằng chữ, `sub` viết bằng số; cụm trong `broll.say` và `cue` phải chép đúng từ `voice`.
- Số liệu, ngày tháng, lãi suất, giá: tra nguồn chính thức, ghi vào `sources.md`, chỗ chưa chắc ghi rõ. Giá vàng/lãi suất phải làm mới đúng ngày đăng.

## Hình và hiệu ứng
- **Không dùng hào quang / tia nắng quanh nhân vật.** Nhấn mạnh bằng zoom (máy quay), không bằng ánh sáng.
- Máy quay (`cam`): hook = giật zoom lúc chốt ý; các cảnh giữa xen kẽ vào / ra / trôi; cảnh kết zoom ra. Có thể ghi đè bằng `cam` trong từng cảnh.
- Chuyển cảnh xen kẽ 4 kiểu (quét vàng, mống mắt, thanh mực, lóe sáng); ghi đè bằng `transition` ở cảnh đích.
- Bố cục: mỗi video một chuỗi cảnh khác nhau; không để hai cảnh liền nhau cùng kiểu; không trùng tiêu đề trong một video.
- Ảnh vẽ (SVG) cho từng video làm mới; chỉ dùng lại khi thật sự hợp.
- Chữ trong khung: tiêu đề ≤ ~20 ký tự mỗi dòng ở cỡ 72–90; kiểm tra bằng ảnh chụp trước khi báo xong.

## Ảnh thật
- Chỉ 2–3 cảnh có ảnh mỗi video (tối đa 1 ảnh/cảnh), kiểu `card`, hiện đúng lúc đọc tới `say`.
- Ảnh chụp từ 2023 trở lên, giấy phép CC0/PD/CC BY/CC BY-SA, giữ dòng ghi nguồn trên màn hình. Không dùng ảnh người nổi tiếng.
- Công cụ tự tìm ảnh (Openverse/Commons) hay hụt với ảnh đời thường Việt Nam từ 2023 trở lên: Commons có rất ít, Openverse không cho biết ngày chụp. Cách chắc nhất: tìm ảnh trước (bằng trình duyệt hoặc nhờ ChatGPT), kiểm tra giấy phép và ngày chụp, rồi dán `url` + `credit` thẳng vào script (đúng dạng `https://commons.wikimedia.org/wiki/Special:FilePath/<tên file>?width=1600`). Cảnh nào chưa có ảnh đạt thì bỏ ảnh, không để công cụ đoán bừa.
- Khai báo `query` (tiếng Anh) và `must` (từ bắt buộc) rồi chạy `npm run make`; xem trang `public/<slug>/img/chon-anh.html` nếu muốn đổi ảnh.

## Quy trình
- Tra nguồn → `script.json` + `sources.md` → `npm run lint` → xem ảnh chụp từng cảnh → `npm run make -- <slug>` → nghe lại cách đọc (VNeID, SJC, tên riêng, số).
- Cảnh nào đổi lời đọc thì `make` đọc lại giọng; bản render cũ không có thay đổi mới, nhớ `git pull` rồi render lại.
- Đăng: ghi nhãn nội dung có AI hỗ trợ, hiện nguồn ảnh, làm mới số liệu theo ngày.

## Tìm ảnh bằng trình duyệt (đã chạy ổn)
- Wikimedia Commons: vào commons.wikimedia.org rồi gọi API bằng `fetch` trong trang, lọc giấy phép (CC0/PD/CC BY/CC BY-SA) và ngày chụp ≥ 2023. Link dùng: `https://commons.wikimedia.org/wiki/Special:FilePath/<tên file>?width=1600`.
- Pexels: tìm bằng `/search/<từ khóa>/?order_by=latest`, ID ảnh ≥ ~14.000.000 là ảnh tải lên từ 2023; đọc JSON-LD trang ảnh để lấy tác giả và ngày. Link dùng: `https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?auto=compress&cs=tinysrgb&w=1600`. Caption không nêu địa danh nếu ảnh không phải chụp ở Việt Nam.
- Cảnh nào không có ảnh đạt thì bỏ ảnh (ví dụ thẻ căn cước Việt Nam, thuế TNCN): không dùng ảnh nước khác gây hiểu nhầm.

## Quy tắc chọn ảnh: đúng mô tả hoặc không thêm
- Ảnh phải khớp đúng điều lời đọc đang nói (đồ vật, địa điểm, bối cảnh). Không khớp thì bỏ ảnh, đừng lấy "gần giống".
- Đã thử Unsplash (tìm "vietnam bank/gold/id card/hospital/garment…"): hầu hết ra cờ, đường phố, xe máy đậu ven đường, không khớp chủ đề tài chính/giấy tờ/bệnh viện; kết quả "Getty Images" trên Unsplash là Unsplash+ (trả phí), không dùng. Ảnh xe máy đậu ngoài đường không đúng với "hầm xe" nên đã bỏ.
- Cách chắc nhất cho giấy tờ, ứng dụng, biên lai: ảnh tự chụp hoặc chụp màn hình (che thông tin cá nhân), đặt vào `public/<slug>/img/` và ghi `credit`.

## Kiểm chứng số liệu (bài học 5/11/2026)
- Số liệu pháp lý đổi nhanh (ngưỡng thuế cho thuê nhà từ 500 triệu lên 1 tỷ; giấy xác nhận cư trú từ 30 ngày/6 tháng lên 1 năm; giảm trừ TNCN hiệu lực 1/1/2026 chứ không phải 1/7). Luôn mở văn bản/bài của cơ quan nhà nước mới nhất, không lấy từ bài báo cũ hoặc trí nhớ.
- Tìm nguồn trong 30 ngày gần đây cho mọi con số trước khi viết; ghi link và ngày đọc vào `sources.md`.
- Phân biệt: mức hưởng vs hóa đơn, thuế bổ sung vs tổng thuế, thu nhập chịu thuế vs lương, tính từ mốc nào (30 ngày tính từ lúc khóa chiều đi, không phải từ lúc đổi máy), "không phải nộp thuế" vs "không có thủ tục khai".
- Mốc tương lai dùng "sẽ có hiệu lực". Giá, lãi suất, giá vàng luôn ghi ngày lấy số liệu trên hình.
- Hai con số trên bảng và phụ đề phải khớp nhau (đặt `amount` bằng đúng số làm tròn trong `amountText`).
- Trước khi giao: nhờ một bên khác (người hoặc công cụ) soát lại nội dung từng video như file góp ý ngày 5/11.

## Rà soát lần 2 (5/11/2026)
- Phân biệt **ngày luật có hiệu lực** và **ngày một phần được áp dụng**: Luật Thuế TNCN 109/2025 hiệu lực 1/7/2026 nhưng phần tiền lương áp dụng từ kỳ tính thuế 2026; Thông tư 08/2026/TT-BKHCN hiệu lực 15/4/2026, còn quy định đổi thiết bị từ 15/6/2026. Ghi đúng cả hai, đừng gộp thành một ngày.
- Mốc thời gian phải ghi **tính từ sự kiện nào** ("kể từ khi nhà mạng phát hiện", không phải "2 giờ sau").
- Chữ trên hình ở cảnh kết và ô lưu ý không được rộng hơn lời đọc: "50% mức hưởng, tùy nơi", không viết "trả một nửa". Có ngoại lệ (bệnh vẫn 100%) thì nêu ra.
- Điểm cộng không được hứa quá: xe điện vẫn bị cấm giờ ở khu lõi. Phép tính ví dụ chỉ kết luận trong phạm vi ví dụ ("trong ví dụ này…"), không suy ra tổng chi phí sở hữu.
- "Dưới ngưỡng không nộp thuế" ≠ "không có thủ tục": nêu luôn nghĩa vụ thông báo. Câu "không bị phạt" chỉ dùng kèm đúng trường hợp chuyển tiếp.
- Giá/phí của sản phẩm: nêu đủ các khoản đi kèm (thuê pin, ưu đãi, hạn ưu đãi) hoặc không nêu.
- Số liệu chưa làm mới thì đưa ngày lên tiêu đề cảnh, ngay khi số xuất hiện lần đầu.
- Khẳng định cần nguồn thứ hai (thời hạn thuế, ngành bị ảnh hưởng): ghi rõ ai nói ("theo Hải quan Mỹ", "theo Trung tâm WTO"), tìm văn bản luật gốc khi có thể.
- Góp ý của bên soát cũng có thể sai: mở lại chính nguồn được dẫn trước khi sửa (vùng phát thải thấp: nguồn ghi hạn chế mức 3 từ 2027, giữ nguyên và ghi lý do vào `sources.md`).
