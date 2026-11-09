# Quy chuẩn thiết kế nhân vật SVG (Style B)
**Áp dụng:** Hồ sơ 02: Người làm thay (và các tập tiếp theo theo phong cách mới)  
**Ngày chuẩn hóa:** 09/11/2026  
**Tham chiếu gốc:** [`character-svg-v1.png`](character-svg-v1.png), [`assets/nhan-vat.svg`](../nhan-vat.svg)

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
- **Quy tắc:** Vòm tóc trên đỉnh đầu phải uốn cong mượt mà theo hình dáng hộp sọ elip (`Q -20 18 -6 14 Q 12 12 28 16 Q 40 22 51 37`).
- **Nghiêm cấm:** Không để lại các mấu nhọn, móc ngược (`Q -10 -5 15 -5 ...`) tạo thành sừng hay dị vật nhô lên trên đỉnh đầu.

### 3.2. Nốt ruồi đuôi mày trái (Crucial Story Identification)
- **Quy tắc:** Chi tiết then chốt phục vụ diễn biến kịch bản:
  ```xml
  <circle cx="-32" cy="82" r="2.2" fill="#282b2b" stroke="none"/>
  ```
- Nằm sát góc ngoài đuôi lông mày trái của cả **Nam** và **Người Kia**.

### 3.3. Cánh tay & Bàn tay hoạt hình (Arms & Finger Loops)
- **Cấu trúc cánh tay:** Phải có độ nở của bắp tay và cẳng tay, buông dọc theo đường cong thân áo.
- **Bàn tay hoạt hình chuẩn Mẫu B:**
  - Không vẽ ngón que thẳng đuỗn.
  - Mỗi ngón tay là một cung bezier cong tròn mềm mại (`finger loop`), nối tiếp nhau tự nhiên (ngón trỏ, ngón giữa, ngón áp út, ngón út hơi thu gọn).
  - Ngón cái gập nhẹ ôm theo lòng bàn tay.
- **Thứ tự lớp vẽ (Z-Index):**
  - Cánh tay buông ngoài thân áo phải có đường viền bo cửa ống tay (`sleeve cuff`) rõ ràng.
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

## 4. Công cụ & File tài nguyên trong Repo

1. **Vector Master Board:** [`../nhan-vat.svg`](../nhan-vat.svg) — Bản vẽ vector độ phân giải cao 1920×1080.
2. **Hình ảnh xuất bản (PNG):** [`../nhan-vat.png`](../nhan-vat.png) — File preview sắc nét nhúng tài liệu.
3. **Trình xem trực tiếp tương tác:** [`../xem-truc-tiep.html`](../xem-truc-tiep.html) — Hỗ trợ zoom pan, soi chi tiết từng nhân vật và đối chiếu clone.
4. **Mã nguồn React / Remotion Rig:** [`../nhan-vat.tsx`](../nhan-vat.tsx) — Component hóa để lắp ráp vào timeline diễn hoạt video.
