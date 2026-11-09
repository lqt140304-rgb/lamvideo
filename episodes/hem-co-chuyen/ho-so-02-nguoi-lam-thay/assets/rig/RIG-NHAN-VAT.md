# Tư thế và khớp — bộ nhân vật hiện có, Style B

**10/11/2026 — V3, sửa lộ lớp và dáng tay, chờ duyệt.** Dùng lại trực tiếp `StudentTwinHead`, `TungHead` và `PALETTE` từ [nhan-vat.tsx](../nhan-vat.tsx). Không thay dàn nhân vật, bảng thiết kế cũ hoặc kịch bản. Nam và Người Kia dùng chung cấu trúc/hình thể/trang phục; khác nhau qua biểu cảm và cách chọn tư thế. Tùng giữ tóc ngắn, áo bóng đá số 7, quần đùi, vớ và giày.

## Tạo hình hiện hành V3

Giữ đường cắt quần, độ rộng áo, nếp chính, dép và đồ bóng đá của mẫu gốc. Thân và hai tay áo dùng **một đường bao**, không chồng các mảnh áo có viền kín. Viền thân giảm còn 2.6 đơn vị; sọc/nếp quần được cắt trong biên quần. Phần da bắt đầu dưới cửa tay áo và dùng mặt nạ che gốc tay; tay gập vẫn chạy liền trước thân, không khôi phục các mảnh da rời trên áo.

Tư thế nghỉ: hai cổ tay gần đường dọc qua vai, khuỷu không banh ra; ngón thả lỏng khép nhẹ. Các bàn tay thông thường xoay theo trục cẳng tay; ngón cái phân đúng trái/phải theo từng mẫu bàn tay. Tư thế mở/đưa tay được chỉnh cả khuỷu lẫn cổ tay, không lật bàn tay độc lập để bù một tư thế sai. Điện thoại có riêng dáng ôm, điểm cổ tay ở đáy bàn tay và các ngón bám cạnh máy. Đầu và biểu cảm gốc không đổi.

[Xem đối chiếu mẫu gốc / V3](doi-chieu-mau-goc.png) và [soi chỗ nối, cổ tay, ngón tay](chi-tiet-khop.png). Đây là tài liệu kiểm tra tạo hình, chưa phải duyệt toàn bộ diễn hoạt trong phim.

![Bảng tư thế và khớp](tu-the-khop.png)

## Tệp và tác dụng

| Tệp | Tác dụng |
|---|---|
| [rig.tsx](rig.tsx) | `StudentRig`, 12 preset, bộ giải tay/chân hai đoạn, đường bao liền, tọa độ khớp và hàm lấy pha bước |
| [doi-chieu-mau-goc.svg](doi-chieu-mau-goc.svg) / [PNG](doi-chieu-mau-goc.png) | Nam và Tùng gốc đặt cạnh bản rig V3, kèm phóng to ba dáng tay để đối chiếu |
| [chi-tiet-khop.svg](chi-tiet-khop.svg) / [PNG](chi-tiet-khop.png) | 8 ô phóng lớn vai/tay áo, dáng nghỉ, tay mở, cầm điện thoại, giữ bát, tay gập và quần |
| [tu-the-khop.svg](tu-the-khop.svg) / [PNG](tu-the-khop.png) | Bảng tĩnh 12 tư thế để duyệt nét, dáng và trang phục; sinh từ cùng nguồn rig |
| [xem-tu-the.html](xem-tu-the.html) | Trình xem chạy độc lập, không cần CDN; chọn ba nhân vật, tư thế, bật khớp; kéo pha bước hoặc mức đứng → dè chừng. Tải về/mở local; GitHub không chạy HTML tương tác trong trang xem mã |
| [preview.tsx](preview.tsx) | Nguồn giao diện thử rig; không phải composition của phim |
| [build-preview.mjs](build-preview.mjs) | Tạo lại ba bảng SVG và HTML từ nguồn bằng các thư viện đã cài trong `what-if-studio/node_modules`; PNG cần chụp/xuất lại từ SVG |
| [verify-rig.mjs](verify-rig.mjs) | Kiểm tra chiều dài xương, dữ liệu hữu hạn, vòng bước và hướng đầu gối khi ngồi |

## Các tư thế có sẵn

`stand` đứng thả lỏng; `wary` dè chừng; `recoil` lùi hoảng sợ; `phone` nghe điện thoại; `offer` mời giúp; `reach` với tay; `sit` ngồi ghế; `type` ngồi làm bài; `bend` cúi nhặt; `wash` giữ bát; `stepLeft` và `stepRight` hai pha bước. Mỗi preset dùng được cho cả ba người. Các tên thao tác là tư thế chuẩn bị, không có nghĩa hành động đã được diễn đủ từ đầu đến cuối.

## Khớp và cách điều khiển

- Hệ tọa độ thiết kế cao khoảng 600 đơn vị. `x`, `y`, `scale` đặt cả rig vào cảnh; các đích bàn tay/bàn chân dùng tọa độ trong rig trước phép đặt này. `left`/`right` là trái/phải màn hình trong góc vẽ hiện có, tránh hiểu nhầm thành giải phẫu khi đổi hướng.
- `root` dịch hông/thân; `lean` nghiêng thân quanh hông; `head` nghiêng đầu quanh chân cổ. Vai theo thân, gốc đùi theo hông. Hệ đầu–cổ kế thừa nguyên mẫu đã có.
- `leftHand`, `rightHand`, `leftFoot`, `rightFoot` là đích cổ tay/cổ chân. Bộ giải tính khuỷu/gối với chiều dài xương cố định; điểm ngoài tầm bị giới hạn thay vì kéo dài chi. Dáng ngồi dùng chiều dài chiếu riêng để gợi đùi hướng ra trước trong tranh 2D.
- `leftBend`/`rightBend` chọn phía gập khuỷu; `leftKnee`/`rightKnee` chọn phía gập gối. Không đổi dấu đột ngột giữa cùng một động tác. `leftPalm`/`rightPalm` là góc gập bổ sung so với trục cẳng tay, không còn là góc cố định theo màn hình; `phone` dùng dáng cầm riêng giữ máy thẳng; `leftShape`/`rightShape` chọn thả, xòe hoặc nắm.
- Cánh tay có đường bao cong liên tục qua khớp; quần, đùi/vớ biến dạng từ đường vẽ gốc để giữ hình cắt và độ đầy. Vai nối vào áo, hông phủ gốc đùi; tay đang diễn ở lớp trước thân. Điện thoại và bát đi theo điểm tay, không đặt trôi độc lập trên màn hình. Đã bổ sung năm ngón và nếp tay, nhưng các ngón chưa có khớp điều khiển riêng; chưa có mọi góc cầm hoặc cận bàn tay.
- `debug` hiện 14 điểm neo và đường xương. `showSupport` hiện bóng sàn hoặc ghế thử; khi dùng ghế/bối cảnh thật, tắt hỗ trợ thử và căn lại điểm tựa/đích chân. Không đặt thêm ghế thử đè lên ghế của cảnh.

## Giao cho Claude khi dựng

Import `StudentRig`, `POSES`, `blendPose`, `sampleWalk` từ tệp rig này. Đặt rig trong SVG của cảnh; chọn `cast="nam"`, `cast="nguoi-kia"` hoặc `cast="tung"`. Khớp/tư thế là dữ liệu số nên có thể điều khiển theo frame của Remotion; trình xem HTML chỉ dùng để duyệt, không lấy đồng hồ của trình xem làm thời gian phim.

`blendPose(a,b,t)` nội suy vị trí và góc, **giữ trạng thái rời rạc của a** (đạo cụ, kiểu tay, phía gập, mặt đỡ). Dùng cho hai dáng cùng cấu trúc; không nội suy thẳng đứng → ngồi hoặc tay không → có điện thoại rồi mong có tiếp xúc đúng. Tách nhịp chuẩn bị → chạm → giữ → buông, đặt trạng thái ở mốc tương ứng; riêng thao tác kéo chốt/cầm bát/gõ phím phải căn vào tọa độ đạo cụ thật.

`sampleWalk(phase)` cung cấp vòng bước tại chỗ để soi chân/tay. Chưa có đường đi, khóa chân xuống mặt đất của cảnh, bước qua cửa hoặc tránh va chạm. Khi cho nhân vật đi qua phòng, phải phối hợp dịch gốc và chân trụ để tránh trượt; không gọi mẫu tại chỗ là chu kỳ đi hoàn thiện.

Chỉ hỗ trợ góc chính diện hơi ba phần tư như mẫu gốc. Chưa có turnaround nghiêng/lưng; không lật ngang cả người có số áo/chữ hay chi tiết nhận diện rồi xem là góc mới. Chưa gắn khẩu hình/giọng hoặc diễn hoạt kịch bản. Biểu cảm dùng đúng nhóm `NamMood` cho Nam/Người Kia và `TungMood` cho Tùng.

## Đã kiểm tra và phần còn duyệt

- Bộ giải qua 254 tư thế/pha thử: chiều dài xương ổn định, đường bao không NaN, vòng bước khép, gối ngồi không chéo tâm, xử lý đích trùng/ngoài tầm. V3 kiểm tra thêm khuỷu/cổ tay nghỉ gần trục vai và hướng bàn tay theo cẳng tay ở bốn hướng.
- Kiểm tra kiểu dữ liệu riêng nguồn rig; SVG/HTML được build thành công. Trình xem đã thử trong Chromium: đổi sang Tùng, chọn ngồi, bật đủ 14 điểm khớp, mở điều khiển pha bước. Bảng SVG và bảng đối chiếu gốc/V3 được xem trực tiếp để sửa dáng áo/quần, tỷ lệ tay, năm ngón, nối cổ tay và chi tiết giày/vớ; vẫn cần chủ repo duyệt mức bám mẫu.
- Chờ chủ repo duyệt tạo hình. Chưa xác nhận các động tác hoặc tương tác đã đạt trong phim; vẫn cần storyboard rồi animatic có bối cảnh/đạo cụ và nhịp thoại thực khi được giao dựng.

Tuân theo [quy chuẩn mỹ thuật chung](../../../../../docs/PHONG-CACH-MY-THUAT.md) và [kế hoạch quay layer](../../DUNG-CANH.md#quay-layer). Không đổi kịch bản hoặc tự bắt đầu dựng phim từ lần bổ sung asset này.
