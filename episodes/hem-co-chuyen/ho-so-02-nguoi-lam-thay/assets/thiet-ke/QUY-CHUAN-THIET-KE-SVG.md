# Quy chuẩn thiết kế nhân vật SVG (Style B)
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
| **Nam/Bản sao Shoes** | `#425850` | Quai xanh rêu đậm | Dép lê quai kẹp, đế `#393e3c` |
| **Tùng Jersey** | `#1d4e89` | Xanh navy thể thao | Áo bóng đá số 7, viền cổ trắng |
| **Tùng Shorts** | `#142842` | Xanh than sẫm | Quần đùi đá bóng sọc trắng |
| **Tùng Shoes** | `#ffffff` / `#1d4e89` | Giày turf thể thao | Giày đế đinh dăm đá banh |

---

## 3. Quy tắc giải phẫu và cấu trúc đường vẽ (Geometry Rules)

### 3.1. Đỉnh đầu & Hộp sọ (Cranium & Hair Top)
- **Quy tắc:** Vòm tóc uốn theo hộp sọ, có một lọn xoăn nhỏ trên đỉnh như Mẫu thử B (chủ repo xác nhận lại ngày 10/11/2026).
- **Nghiêm cấm:** Không thêm mấu nhọn, sừng hay dị vật khác ngoài lọn xoăn đó.

### 3.2. Nốt ruồi đuôi mày trái (Crucial Story Identification)
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
  - Thể chất và trang phục trùng khớp 100% với Nam: cùng khung đầu, cùng kiểu tóc, cùng nốt ruồi đuôi mày, cùng áo thun rêu `#5c7a70`, quần xám `#515451` và dép kẹp.
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
| Độ dài xương | bắp tay 80, cẳng tay 68, đùi 105, ống chân 105 |
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
- Xem composition `HoSo02RigSheet` khi đang chuyển động, không chỉ ảnh đứng yên: không đường cắt ở khớp, mông không lòi khỏi áo, tay không bé đi khi duỗi.
- Chạy `node tests/ho-so-02-rig.cjs` trong `what-if-studio/`.

**Chưa có:** quay lưng, nhìn nghiêng, quay trái, khẩu hình. Không lật gương đầu vì nốt ruồi đổi bên.

---

## 5. Công cụ & File tài nguyên trong Repo

1. **Vector Master Board:** [`../nhan-vat.svg`](../nhan-vat.svg) — Bản vẽ vector độ phân giải cao 1920×1080.
2. **Hình ảnh xuất bản (PNG):** [`../nhan-vat.png`](../nhan-vat.png) — File preview sắc nét nhúng tài liệu.
3. **Trình xem trực tiếp tương tác:** [`../xem-truc-tiep.html`](../xem-truc-tiep.html) — Hỗ trợ zoom pan, soi chi tiết từng nhân vật và đối chiếu clone.
4. **Mã nguồn React / Remotion Rig:** [`../nhan-vat.tsx`](../nhan-vat.tsx) — Component hóa để lắp ráp vào timeline diễn hoạt video.
