# Quy chuẩn thiết kế nhân vật SVG (Style B)

**Phạm vi mở rộng 10/11/2026:** phần chi tiết dưới đây là quy chuẩn nhân vật Hồ sơ 2; dùng cùng [quy chuẩn mỹ thuật chung](../../../../../docs/PHONG-CACH-MY-THUAT.md) cho bối cảnh, nội thất, đường phố, thiên nhiên và đạo cụ. Các mã màu trang phục/nốt ruồi là dữ liệu riêng của hồ sơ, không áp cho mọi tài nguyên. Độ dày nét tính theo cỡ thiết kế, cần hiệu chỉnh khi xuất và theo gần–xa; không ép mọi đường nền thành đường cong hoặc mọi vật thành mảng khép kín.
**Áp dụng:** Hồ sơ 02: Người làm thay (và các tập tiếp theo theo phong cách mới)  
**Ngày chuẩn hóa:** 09/11/2026, cập nhật cách vẽ và rig khớp 10/11/2026  
**Tham chiếu gốc:** hình bên phải trong [`character-svg-v1.png`](character-svg-v1.png) là mẫu đích; [`nhan-vat.png`](../nhan-vat.png) là bản đang dùng. Làm nhân vật mới: đọc thẳng [mục 4](#4-cách-vẽ-đã-chốt-để-làm-tiếp).

---

## 1. Triết lý thiết kế (Core Design Principles)

Phong cách SVG mới (Style B) thay thế hoàn toàn cho lối vẽ hình học ghép khối cứng nhắc của phiên bản cũ. Các nguyên tắc cốt lõi:

1. **Đường nét hữu cơ (Organic Bezier Curves):**
   - Mọi bộ phận cơ thể, nếp áo, lọn tóc đều sử dụng các đường cong bezier (`Q` hoặc `C`) khép kín (`Z`).
   - Viền nét (ink stroke) liền mạch, dùng `stroke-linecap="round"` và `stroke-linejoin="round"`.
   - Tuyệt đối không để nét thừa, nét hở viền (leak borders), hoặc các đường thẳng cụt lơ lửng.

2. **Độ rủ tự nhiên & Trọng lực (Gravity & Weight):**
   - Vai áo rủ tự nhiên theo bờ vai thả lỏng, không vuông vức như mắc áo.
   - Ống quần có độ phồng và nếp gấp nhăn ở gối và cổ chân, thể hiện chất liệu vải mềm.

3. **Bảng màu đồng bộ (Unified Palette):**
   - Mọi nét viền dùng chung một màu mực than ấm: `#282b2b` (độ dày chuẩn: `3.5px` cho chi tiết mặt, `4.0px` cho khung thân, `2.5px` cho nếp nhăn phụ).

---

## 2. Bảng mã màu tiêu chuẩn (Color Palette)

| Bộ phận | Mã màu Hex | Tên mô tả | Ứng dụng |
|---|---|---|---|
| **Ink Stroke** | `#282b2b` | Mực than ấm | Toàn bộ đường viền ngoài và nét vẽ |
| **Skin Base** | `#dbad82` | Da người ấm | Da mặt, cổ, cánh tay, mu bàn chân |
| **Skin Shade** | `#bd8968` | Bóng đổ da | Bóng cổ dưới cằm, hốc tai |
| **Hair Tone** | `#292a29` | Tóc đen than | Khối tóc Nam, Người Kia, Tùng |
| **Sclera** | `#f8f3e7` | Lòng trắng kem | Tròng mắt (tránh dùng `#ffffff` tinh khiết gây chói) |
| **Mouth Deep** | `#513331` | Lòng miệng trầm | Khoang miệng khi mở |
| **Nam/Bản sao Shirt** | `#5c7a70` | Xanh rêu sinh viên | Chiếc áo thun rêu đặc trưng của Nam |
| **Nam/Bản sao Pants** | `#515451` | Xám vải mềm | Quần dài có nếp gấp |
| **Nam/Bản sao Shoes** | `#425850` | Quai xanh rêu đậm | Dép lê quai ngang, đế `#393e3c` |
| **Tùng Jersey** | `#1d4e89` | Xanh navy thể thao | Áo bóng đá số 7, viền cổ trắng |
| **Tùng Shorts** | `#142842` | Xanh than sẫm | Quần đùi đá bóng sọc trắng |
| **Tùng Shoes** | `#ffffff` / `#1d4e89` | Giày turf thể thao | Giày đế đinh dăm đá banh |

---

## 3. Quy tắc giải phẫu và cấu trúc đường vẽ (Geometry Rules)

### 3.1. Đỉnh đầu & Hộp sọ (Cranium & Hair Top)
- **Quy tắc:** Vòm tóc uốn theo hộp sọ, có một lọn xoăn nhỏ trên đỉnh như Mẫu thử B (chủ repo xác nhận lại ngày 10/11/2026).
- **Nghiêm cấm:** Không thêm mấu nhọn, sừng hay dị vật khác ngoài lọn xoăn đó.

### 3.2. Nốt ruồi đuôi mày trái (Crucial Story Identification)

**Đã chốt 10/11/2026:** nốt ruồi nằm **bên trái màn hình khi nhân vật nhìn về phía máy**. "Mày trái" trong kịch bản tính theo người xem. Rig đã vẽ theo quy tắc này ở mọi góc; khi quay sang trái hẳn hoặc quay lưng thì không thấy.
- **Quy tắc:** Chi tiết then chốt phục vụ diễn biến kịch bản:
  ```xml
  <circle cx="-32" cy="82" r="2.2" fill="#282b2b" stroke="none"/>
  ```
- Nằm sát góc ngoài đuôi lông mày trái của cả **Nam** và **Người Kia**.

### 3.3. Cánh tay & Bàn tay hoạt hình (Arms & Finger Loops)
- **Cấu trúc cánh tay:** Phải có độ nở của bắp tay và cẳng tay, buông dọc theo đường cong thân áo.
- **Bàn tay hoạt hình chuẩn Mẫu B:**
  - Không vẽ ngón que thẳng đuỗn, không vẽ vạch chia từng ngón.
  - Cẳng tay và bàn tay là một khối liền, không có đường cắt ở cổ tay. Tay thả lỏng chỉ lộ 3 gợn đầu ngón và một gợn ngón cái; chỉ tay xoè mới tách 4 ngón.
- **Thứ tự lớp vẽ (Z-Index):**
  - Tay buông nằm dưới áo; tay áo liền một khối với thân áo.
  - Tránh tuyệt đối việc để vạt áo thân trước đè cụt cánh tay hoặc bàn tay bị chìm khuất sau lưng áo.

### 3.4. Bản sao (Người Kia — Doppelgänger)
- **Quy tắc 100% giống hệt:** 
  - Thể chất và trang phục trùng khớp 100% với Nam: cùng khung đầu, cùng kiểu tóc, cùng nốt ruồi đuôi mày, cùng áo thun rêu `#5c7a70`, quần xám `#515451` và dép quai ngang.
  - Khác biệt duy nhất là **thần thái & biểu cảm**: ánh mắt kiên định, nụ cười điềm tĩnh hoặc nụ cười nhếch mép toan tính (`eerie_smirk`), tư thế đứng đĩnh đạc hơn.

### 3.5. Tùng (Bạn cùng phòng thể thao)
- Tóc ngắn tỉa mảng khối layer hữu cơ sắc nét, cằm gọn góc cạnh hơn, không đeo kính.
- Dáng đứng thể thao năng động: một tay buông thoải mái, một tay đút túi quần đùi.
- Trang phục bóng đá số 7 năng động, vớ cao cổ sọc ngang, giày turf ôm chân.

---

## 4. Cách vẽ đã chốt để làm tiếp

Chủ repo đã duyệt hướng này qua các vòng sửa ngày 10/11/2026: **cartoon mềm, ít nét, liền mạch, không cứng**. Khớp phải đúng logic nhưng không được đánh đổi vẻ mềm của mẫu.

### 4.1. Nét và khối

| Làm | Không làm |
|---|---|
| Mỗi vùng cùng màu là **một khối liền**: tô nền mực rồi tô màu đè lên (`Blob`), nên không có đường trong | Vẽ viền từng bộ phận rồi xếp chồng, để lộ đường cắt ở vai, khuỷu, cổ tay, gối |
| Viền ngoài 4, nét mặt 3.5, nếp vải 2.5, đầu nét và góc nối đều tròn | Nét đều tăm tắp như hình học, góc nhọn |
| Nếp vải chỉ đặt đúng chỗ của mẫu: cổ áo, hai đường nách, hai nếp vạt áo, một nếp gối, một nếp ống chân | Thêm nếp để trông "chi tiết"; vạch khuỷu; đường chia giữa hai ống quần |
| Gấu quần, tay áo hơi cong; ống quần phồng đùi, thu ở gối, loe nhẹ ở gấu; hai ống có khe chữ V ở đáy quần | Ống thẳng như ống nước, gấu cắt thẳng |
| Dáng thả lỏng: vai rủ, tay hơi rời thân và hơi cong, hai chân hơi mở | Đứng nghiêm đối xứng, vai vuông như mắc áo |

### 4.2. Tỉ lệ và khớp

Toạ độ nhân vật: tâm ngang x = 0, đỉnh đầu quanh y = 0, sàn y = 589. Số đang dùng nằm trong `nhan-vat.tsx`, bảng dưới chỉ để đối chiếu.

| Phần | Giá trị |
|---|---|
| Vai / hông | vai y 232, x −68 và 62; hông y 345, x −29 và 31 |
| Độ dài xương | bắp tay 80, cẳng tay 74, đùi 105, ống chân 105 |
| Nửa bề rộng tay | vai 19, khuỷu 16, cổ tay 13.5; bàn tay to 1.12 lần mẫu gốc |
| Nửa bề rộng ống quần | hông 31, gối 26, gấu 28 |
| Tay áo | gốc 25, loe 27, dài bằng nửa bắp tay |
| Giới hạn | khuỷu và gối 0–150° (không gập ngược), cổ tay ±70°, cổ chân ±35°, hông −35 đến 125°, nghiêng thân −30 đến 40°, cổ ±35° |

- **Hông luôn hẹp hơn áo:** quần không được lòi ra ngoài bề ngang áo. Vạt áo giữ phương thẳng đứng khi thân nghiêng (`hemDrape`), nên cúi người không làm lộ mông.
- **Tay cân với thân cả khi duỗi:** không làm tay nhỏ đi để giống dáng đứng; khi duỗi thẳng vẫn phải đủ to so với đùi và áo.
- **Chân chạm sàn:** để `planted: true`, hông tự hạ khi gập gối. Không chỉnh tay toạ độ để giấu chân lơ lửng.
- **Tên tay/chân theo giải phẫu:** R ở phía trái màn hình, L ở phía phải màn hình.

### 4.3. Thêm nhân vật mới

Dùng lại `Rigged` trong [`../nhan-vat.tsx`](../nhan-vat.tsx), không sao chép thành bản riêng:

1. Vẽ đầu riêng theo gốc toạ độ như `StudentTwinHead`; mỗi người có tóc, mặt, dáng riêng.
2. Tạo `Outfit` (màu áo, `torso`, `hem`, quần dài/ngắn, giày, chi tiết áo); thân khác thì sửa `torso` và `hem` cùng lúc.
3. Ghép bằng `<Rigged pose={STAND_POSE} outfit={...} head={...} x y scale />`, tư thế trộn từ `STAND_POSE` hoặc `TWIN_POSES`.

### 4.4. Kiểm tra trước khi coi là đạt

- Đặt cạnh hình bên phải của `character-svg-v1.png`: cùng độ mềm, cùng mật độ nét.
- Xem composition `HoSo02RigSheet` và `HoSo02Spin` khi đang chuyển động, không chỉ ảnh đứng yên: không đường cắt ở khớp, mông không lòi khỏi áo, tay không bé đi khi duỗi.
- Chạy `node tests/ho-so-02-rig.cjs` trong `what-if-studio/`.
- Soi cận cảnh `HoSo02Turnaround` ở cả dáng đứng (frame 0) và dáng bước (frame 60), đủ 8 cột. Ảnh thu nhỏ không lộ các lỗi dưới đây.

**Lỗi đã gặp, nhân vật mới phải tránh:**

| Chỗ | Quy tắc | Lỗi nếu làm sai |
|---|---|---|
| Đầu nét hở (tai, cổ) | Đầu nét nằm đúng trên viền khối nó nối vào, hoặc bị tóc che | Vệt đen nhỏ thò vào mặt; đuôi nét lạc trên má |
| Khối cắt bằng lệnh đóng `Z` | Đoạn đóng phải là đường cong theo hình, nhất là khi nằm cạnh tóc | Tai bị cắt thành đường thẳng đứng |
| Nét đặt sát mép mặt | Điểm cuối cách viền ít nhất nửa bề dày nét của cả hai nét | Lông mày thò ra ngoài viền mặt |
| Tóc che kín sọ (sau lưng) | Biên tóc đi ngoài biên sọ ở mọi đoạn; đo lại khi đổi `HairKit` | Viền da mỏng lộ quanh tóc |
| Mũi, nốt ruồi | Tách hẳn khỏi vòng mắt và lông mày ở mọi góc, với mắt mở bình thường | Mũi đè vòng mắt; nốt ruồi dính lông mày |
| Tất và giày | Thứ tự: da → tất → giày → quần | Đầu tất tròn đè lên giày |
| Chi tiết của tay xa | Tay nằm sau thân thì viền tay áo, sọc cũng phải nằm sau hoặc bỏ | Vạch lạc giữa ngực ở góc nghiêng |
| Đáy quần khi bước | Mảng đáy quần kéo lên theo độ mở của đùi | Mẩu quần lòi xuống giữa hai chân |
| Tay khi bước, 3/4 và 1/4 | Pha hai tay vung vào giữa người: không vung vào, hơi mở ra ngoài để bàn tay nằm ngoài đùi. Không đẩy tay ra sau chân | Hai bàn tay chập nhau, nằm ngay đũng quần, hoặc bị quần che mất |
| Tay xa ở góc nghiêng 90° | Thứ tự: tay xa → hai chân → áo → tay gần | Bàn tay xa nằm đè lên quần |
| Tay gập nhiều | Khối tay đầy dần theo độ gập; đưa tay lên đầu thì khuỷu ngang vai, cẳng tay chéo lên | Tay gầy và ngắn đi, trông dị dạng |
| Dáng ngồi | Chân gần thu về sau, chân xa đưa tới trước, hai bàn chân tách nhau và mũi chân cùng hướng đùi. Cẳng tay không nằm dọc theo đùi | Đùi bị tay che nên chân trông cụt; dép chồng lộn xộn |
| Vai và biên áo | Vai đặt sát biên áo và tay buông chếch ra ngoài, để cánh tay nằm ngoài biên vạt áo ở mọi góc | Áo đè mất cánh tay, nhất là góc 1/4 |
| Nếp áo | Nếp không chạy qua vị trí cánh tay; bị tay cắt thì chỉ giữ phần còn dài | Mẩu nếp ngắn sau tay |
| Chi tiết thân theo góc | Vạch dọc ngực chỉ dùng cho chính diện và 3/4; sau lưng và 1/4 chỉ giữ một nếp vạt áo. Không thêm ngấn gáy | Lưng áo nhiều nét thừa |
| Chi tiết nhỏ trên áo | Dưới khoảng 10px ở khổ 1080p thì phóng to hoặc bỏ | Logo trông như dấu phẩy |

### 4.5. Bốn góc quay (ảnh mẫu cho mọi nhân vật)

Ảnh mẫu do chủ repo đưa ngày 10/11/2026: [`goc-quay-mau.png`](goc-quay-mau.png), gồm **chính diện, 3/4, nghiêng 90°, sau lưng** trên nền kem. Nhân vật mới làm đủ bốn góc theo đúng thứ tự này.

Bốn góc phải thẳng hàng trên cùng các mốc ngang, tính từ đỉnh tóc xuống sàn: vai khoảng 36% chiều cao, vạt áo khoảng 60%, chân chung một đường sàn. Giữa các góc không đổi màu, tỉ lệ, kiểu tóc, chiều cao.

| Góc | Cách vẽ |
|---|---|
| Chính diện | Mặt đối xứng, thấy cả hai tai; hai tay buông hai bên; cổ áo tròn; thân chỉ giữ nếp vạt áo |
| 3/4 | Mặt lệch về hướng nhìn, mắt xa hẹp hơn, tai xa khuất; vai và chân xa thu lại, chân xa hơi lùi |
| Nghiêng 90° | Một mắt; trán, mũi, môi tạo đường viền; tai giữa đầu, tóc phủ gáy; thấy một tay; hai ống quần gần như một khối; lưng hơi cong |
| Sau lưng | Tóc là một mảng đen liền, không có mặt; lộ hai tai và gáy, không vẽ ngấn gáy; áo không có cổ trước, một nếp cong ở vạt |

Chi tiết nhận dạng của từng nhân vật vẫn giữ dù ảnh mẫu không có, như nốt ruồi của Nam và Người Kia. Dép theo ảnh mẫu: quai ngang.

**Cách dùng trong rig:** đặt `view` (`front`, `three`, `side`, `quarter`, `back`) và `facing: -1` để quay trái trong `pose`, xem composition `HoSo02Turnaround`. `quarter` là góc 1/4: nhìn chéo từ phía sau, chỉ còn gáy, tai gần và một dải má. Nam, Người Kia và Tùng đã đủ các góc; nhân vật mới khai báo `views` trong `Outfit` và một `HairKit` cho đầu. Nhìn từ trước/sau, bước chân tự rút ngắn thay vì xoè ngang.

Xoay người: dùng `turnAt(từ, đến, t)`, mỗi góc giữ khoảng 4 frame rồi nhảy sang góc kế bên (composition `HoSo02Spin`). Khẩu hình: truyền `talk={{ shape, open }}` theo `mouthCueAt` của engine; chớp mắt: `blink`. Góc nghiêng cắt miệng theo đường mặt nên miệng luôn khớp với môi.

Quay trái dùng lại hình rồi lật, riêng nốt ruồi vẽ lại đúng bên: 3/4 trái nằm ở đuôi mày bên xa, nghiêng trái và 1/4 trái không thấy. `armR`/`legR` luôn là tay/chân phải theo giải phẫu ở mọi góc, kể cả khi quay trái và sau lưng; đồ cầm ở tay phải không nhảy tay khi đổi góc.

Màu áo theo cảnh: `shirt={PALETTE.nam.sleepShirt}` là áo ngủ xám của Nam ở các cảnh Người Kia đang mặc áo xanh.

**Dáng có sẵn** trong `TWIN_POSES`: `stand`, `sit`, `stride`, `crouch`, `reach`, `holdBowl`, `stop`, `wary`, `phone`, `offer`, `type`. Bốn dáng cuối dựng cho góc 3/4; dùng ở góc khác phải soi lại. Trộn hai dáng bằng `mixPose(a, b, t)`, kiểu tay và đạo cụ lấy theo dáng đích nên đổi chúng ở mốc riêng. `sampleWalk(phase)` là vòng bước tại chỗ, đi qua phòng phải tự dịch `x` theo chân trụ để khỏi trượt.

Kiểu tay: `rest`, `open`, `fist`, `hold`, `type`, `phone`, `none`. `palmUp: 'L'` lật ngửa bàn tay đó. Đạo cụ: `prop: 'phone'` đi theo tay phải, `prop: 'bowl'` nằm giữa hai tay; cả hai vẽ dưới ngón tay nên không cần đặt toạ độ riêng.

---

## 5. Công cụ & File tài nguyên trong Repo

1. **Vector Master Board:** [`../nhan-vat.svg`](../nhan-vat.svg) — Bản vẽ vector độ phân giải cao 1920×1080.
2. **Hình ảnh xuất bản (PNG):** [`../nhan-vat.png`](../nhan-vat.png) — File preview sắc nét nhúng tài liệu.
3. **Trình xem trực tiếp tương tác:** [`../xem-truc-tiep.html`](../xem-truc-tiep.html) — Hỗ trợ zoom pan, soi chi tiết từng nhân vật và đối chiếu clone.
4. **Mã nguồn React / Remotion Rig:** [`../nhan-vat.tsx`](../nhan-vat.tsx) — Component hóa để lắp ráp vào timeline diễn hoạt video.
