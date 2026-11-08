# Cue → shot → timeline — Tin nhắn chưa gửi

Lập ngày 08/11/2026 khi Claude bắt đầu dựng theo [bàn giao](BAN-GIAO-CLAUDE.md). Thay timeline thử 24 đoạn/146 giây bằng **35 cue nguồn** của [DUNG-CANH.md](DUNG-CANH.md). Mỗi cue có đúng một shot cùng mã, ví dụ C7-C ↔ `ShC7_C`. Mã thử cũ đặt tên lệch (mẹ tan là `ShC7_B`, ngưỡng nhà là `ShC8_B`); các tên đó không còn dùng.

## Cách timeline được tạo

- Lời và các khoảng `[NGHỈ]`/`[KHÔNG LỜI]` được đọc trực tiếp từ [KICH-BAN.md](KICH-BAN.md). [cues.json](../../../what-if-studio/src/episodes/tin-nhan-chua-gui/cues.json) chỉ ghi số thứ tự câu nào chạy trên cue nào, kể cả khi quay lại một cue (C1-A ↔ C1-B ↔ C1-D…). Không có bản lời thứ hai.
- Chạy `node src/episodes/tin-nhan-chua-gui/build-timeline.cjs` trong `what-if-studio/` để sinh `timeline.json`. Script báo lỗi nếu có câu bị bỏ, đặt sai thứ tự, hoặc cue chưa có đoạn nào.
- `timeline.json` ghi mốc của từng câu/khoảng nghỉ trên đồng hồ riêng của shot (`marks`). Động tác bám theo lời qua các mốc này, không gõ số giây cố định: nghiêng C5-C nằm trong 1,6 giây đầu khoảng nghỉ 2 giây; lớp trắng G3 sau trọn "Cháu đồng ý!"; khoảng 8 giây không lời ở C7-C bắt đầu đúng lúc mẹ tan hết (đồng hồ shot giây 4).
- **Cập nhật cùng ngày:** đã có giọng ElevenLabs, nên timeline lấy thời lượng đo thật: **11:48**. Cột thời gian trong bảng dưới vẫn là số của bản ước tính; chạy lại script để xem số mới. Chi tiết giọng ở [GHI-CHU](GHI-CHU.md).
- **Ước tính ban đầu (trước khi có giọng):** 3,0 từ/giây + 0,35 giây giữa câu + nghỉ theo nguồn → **12:21** (22.238 frame ở 30 fps), nằm trong khoảng 10:46–12:59 của kế hoạch. Mở đầu 24 giây, tổng nghỉ 33 giây. Khi có giọng thật, thay bằng mốc audio rồi chạy lại script; mọi động tác theo `marks` tự dời theo.

## Bảng cue

| Cue | Shot | Cỡ / lens ý đồ | Vào lần đầu | Tổng thời lượng | Trạng thái tay/đồ chính |
|---|---|---|---|---|---|
| C0-A | `ShC0_A` | toàn 24mm | 0:00 | 4.0 s · 1 lần | Thành phố, trời sao, tiêu đề lớp riêng |
| C0-B | `ShC0_B` | tilt xuống 35–50mm | 0:04 | 4.0 s · 1 lần | Hạ qua mái tới cú; tiêu đề mờ hết |
| C0-C | `ShC0_C` | cận macro 85mm | 0:08 | 2.0 s · 1 lần | Mắt cú, chớp một lần, không phát sáng |
| C0-D | `ShC0_D` | lùi ra 35mm | 0:10 | 6.0 s · 1 lần | Mở hẻm trống, cú gần trái, tiệm phải-xa |
| C0-E | `ShC0_E` | trung rộng 35–50mm | 0:16 | 5.0 s · 1 lần | Chuyển nét sang Duy/Thảo trước cửa |
| C0-F | `ShC0_F` | trung 50mm | 0:21 | 3.0 s · 1 lần | Duy dẫn em qua ngưỡng |
| C1-A | `ShC1_A` | toàn 35mm | 0:24 | 71.2 s · 5 lần | Thảo đặt đồng hồ lại kệ thấp; Duy che em; Duy trái, Thảo phải gần cửa |
| C1-B | `ShC1_B` | cận 70mm | 0:31 | 16.4 s · 2 lần | Lộc ở bàn sau, nửa mặt sáng; cuối cue nhếch miệng |
| C1-C | `ShC1_C` | insert 65mm cúi 40° | 1:08 | 12.1 s · 1 lần | Máy vỡ trên khăn giữa, tiền trái |
| C1-D | `ShC1_D` | trung 50mm | 1:36 | 21.7 s · 2 lần | Thảo níu áo, chìa hai tờ; sau mỉa mai rơm rớm, Duy cầm giúp tiền |
| C2-A | `ShC2_A` | toàn 35mm | 2:25 | 33.8 s · 1 lần | Lộc về quầy; Duy trả tiền em, cất tiền, kéo ghế; ngồi Duy trái/Thảo phải |
| C2-B | `ShC2_B` | cận vừa 70mm | 2:59 | 35.8 s · 2 lần | Duy siết bút, Thảo nói nỗi sợ cụ thể |
| C2-C | `ShC2_C` | insert 65mm | 3:11 | 7.7 s · 1 lần | Ảnh ra từ ví, giấy G1 còn trắng, bút đặt xuống |
| C3-A | `ShC3_A` | cận tay 65mm | 3:43 | 23.8 s · 1 lần | Tay em xoay vết nứt; nét chuyển sang Duy |
| C3-B | `ShC3_B` | trung đôi 50mm | 4:06 | 63.2 s · 1 lần | Duy dịch ghế 10cm, chạm vai em; nhịp quyết định 3 giây |
| C3-C | `ShC3_C` | insert 85mm | 5:10 | 17.7 s · 1 lần | Ảnh đã cất; ghi G1 tranh xe đồ chơi–mẹ dỗ–làm hòa, ký |
| C4-A | `ShC4_A` | trung 50mm | 5:27 | 9.4 s · 1 lần | Lộc sửa ở bàn sau, cắt thời gian, trả máy sáng lên khăn |
| C4-B | `ShC4_B` | trung đôi 50mm | 5:37 | 40.1 s · 3 lần | Thảo hỏi buổi làm hòa; Duy nhắm mắt rồi lắc đầu |
| C4-C | `ShC4_C` | insert 85mm | 5:57 | 24.0 s · 1 lần | Tách liên G1, Duy cất ví, bấm phát; giọng mẹ từ loa máy |
| C4-D | `ShC4_D` | cận 70mm | 6:33 | 6.7 s · 1 lần | Lộc nhếch miệng lần hai, mắt không dịu |
| C5-A | `ShC5_A` | trung ba người 50mm | 6:48 | 58.2 s · 2 lần | Lộc báo giá G2 và hiệu lực lời; Duy giữ tay em |
| C5-B | `ShC5_B` | trung đôi 50mm | 7:29 | 13.0 s · 1 lần | G2: ánh ấm thoáng, vẫn ngồi trong tiệm |
| C5-C | `ShC5_C` | cận 70mm | 7:42 | 28.4 s · 1 lần | Duy kiệt, bấu ghế; roll ≤2° trong 1,6 giây đầu khoảng nghỉ |
| C5-D | `ShC5_D` | cận 65mm | 8:27 | 5.4 s · 1 lần | Thảo nhận trọn G3, Duy ngăn muộn; trắng một lần |
| C6-A | `ShC6_A` | toàn 35mm · 2:1 | 8:33 | 13.1 s · 1 lần | Trắng rút, ruộng vàng, mẹ gọi |
| C6-B | `ShC6_B` | trung 50mm · 2:1 | 8:46 | 15.7 s · 1 lần | Mẹ giữa nắm tay Duy trái, Thảo phải, bước có đất |
| C6-C | `ShC6_C` | trung 50mm · 2:1 | 9:01 | 20.4 s · 1 lần | Ngồi mép kè, gối gập, chân buông trên nước |
| C6-D | `ShC6_D` | cận 70mm · 2:1 | 9:22 | 16.4 s · 1 lần | Hai trẻ cười nhỏ, mẹ rìa khung |
| C7-A | `ShC7_A` | trung 50mm · 2:1 | 9:38 | 13.8 s · 2 lần | Tay mẹ ôm vai ngoài hai con |
| C7-B | `ShC7_B` | cận vừa 70mm · 2:1 | 9:41 | 22.7 s · 1 lần | Mẹ và Duy; giữ mắt cậu |
| C7-C | `ShC7_C` | trung→cận tay · 2:1 | 10:15 | 37.1 s · 1 lần | Mẹ tan 3–4 giây, lau má, nắm tay, máy vào đôi tay, mờ tối |
| C8-A | `ShC8_A` | trung đôi 50mm | 10:52 | 24.5 s · 2 lần | Mở về tiệm, match ghế/tay; Duy tái mệt |
| C8-B | `ShC8_B` | insert 65mm | 10:60 | 23.4 s · 2 lần | Ba phiếu G1 (từ ví)/G2/G3 rồi cất đủ ba |
| C8-C | `ShC8_C` | toàn 28mm → trung 50mm | 11:40 | 21.1 s · 1 lần | Ngưỡng nhà, bố chỉ âm/bóng sau vách; gọi dì |
| C8-D | `ShC8_D` | toàn 35mm | 12:01 | 20.7 s · 1 lần | Hai trẻ nắm tay đi về đèn đầu hẻm |

## Quy tắc dàn dựng đã đưa vào mã

Phần chung nằm trong [staging.tsx](../../../what-if-studio/src/episodes/tin-nhan-chua-gui/staging.tsx), được kiểm tra bằng `node tests/episode-staging.cjs`.

- **Ông Lộc ở quầy:** hông ngay trên mặt quầy, chân đứng trên sàn sau quầy và được thân quầy che. Bản thử cũ đặt sàn ở y=680 nên mặt quầy chỉ tới giữa đùi, nhìn như đứng quá cao.
- **Ông Lộc ở bàn sửa:** ngồi ghế thợ phía sau bàn, quay mặt về máy, cúi vào chiếc đồng hồ dở. Mặt bàn che thân dưới. Đồng hồ trên kệ đứng kim, không có tiếng tích tắc.
- **Ghế ngồi:** ghế khách được tính từ chiều dài chân người ngồi: hông đặt trên mặt ghế, đế giày Duy chạm sàn. Ghế của Thảo cao bằng ghế Duy, có thanh gác chân đúng tại đế giày em. Không còn cảnh ngồi mà không có ghế hoặc chân lơ lửng.
- **Vị trí:** Duy trái, Thảo phải gần cửa, đúng trục nguồn (bản thử đặt ngược). Lúc đứng ở C1, Thảo nửa bước sau vai anh, tay níu áo.
- **Tay:** chạm vai, níu tay áo, nắm tay và đưa tiền dùng IK lòng bàn tay của rig cánh đồng (`reachPalm`). Insert dùng `ArmHand` có cẳng tay và tay áo đi vào từ mép khung, không còn tay hoặc vật trôi riêng.
- **Đầu–cổ:** đã sửa lỗi đầu Duy lệch khỏi thân. Nguyên nhân là truyền `headTilt: undefined`, khiến SVG xuất `rotate(undefined)` và bỏ cả phép xoay theo thân. Bài kiểm tra quét mọi đoạn ở đầu, giữa và cuối, báo lỗi nếu gặp `NaN`, `Infinity` hoặc `undefined`.
- **Khung:** từ C6-A tới hết C7-C có dải đen 60 px trên và dưới (vùng hình 2:1). C8-A mở thẳng 16:9 từ tối. C5-B dùng look `g2Warm`: ấm thoáng trong cùng phòng, không lóe.
- **Tiêu đề C0-A:** "TIN NHẮN CHƯA GỬI" từng hiện dấu sắc rời khỏi chữ Ă. Nguyên nhân là font Noto Serif khai báo nhưng chưa được nạp, nên máy rơi về Georgia. Đã nạp Noto Serif (tiếng Việt) trong `engine/fonts.ts`.

## Còn mở — cần xem animatic hoặc chủ repo quyết

- **Chưa có animatic hoàn chỉnh:** mới có storyboard tĩnh 35 cue ([bảng 1](assets/storyboard/storyboard-v1-1.jpg), [bảng 2](assets/storyboard/storyboard-v1-2.jpg)). Đi bộ (Lộc qua lại quầy, C0-F, C6-B, C8-D) dùng `walkPose` cơ bản; Thảo từ kệ về sau vai anh mới là trượt vị trí. Cần render bản nháp chuyển động và xem.
- **Góc ngồi ở quầy:** hai trẻ ngồi quay 3/4 về phía máy, quầy ở sau lưng; mọi thao tác tay–giấy–máy diễn trong các cue insert như thiết kế nguồn. Nếu muốn thấy trẻ chạm quầy trong khung rộng, cần thêm góc ngang hoặc bộ rig quay lưng: phát sinh asset.
- **C8-C ngưỡng nhà:** ghép tạm từ nội thất `MotherThaoHouse` nhìn qua khung cửa, hai trẻ đứng ngoài bậc cửa, bố chỉ là bóng mờ. Chưa có asset mặt ngoài nhà riêng.
- **C1-A:** thêm kệ thấp có đồng hồ nhỏ cạnh cửa, vì set tiệm chưa có chỗ cho Thảo nhấc rồi đặt lại đồng hồ.
- Câu "bàn tay đã nhạt trong nắng" (C7-C) chưa có hiệu ứng nhạt trước lần tan chính; giữ một lần tan 3–4 giây như bản VFX đã chốt.
- Bảng màu `ColorScriptSheet` vẫn có chữ tràn cột ở hàng tâm trạng và ý nghĩa (lỗi có sẵn), và hồi III còn mô tả look "tension" lạnh, khác nguồn bản 10 (C4–C5 trở về màu tiệm). Mã dựng đã dùng `shopMystery` cho C4–C5.
