# Asset — Hồ sơ 2: Người làm thay

## Dàn nhân vật theo mẫu SVG mới (Style B) — 09/11/2026

Toàn bộ nhân vật xuất hiện trong kịch bản **Hồ sơ 2: Người làm thay** đã được thiết kế đồng bộ theo phong cách SVG hữu cơ mới (Style B: nét vẽ mềm, mảng tóc gọn, vai áo rủ tự nhiên, quần có khối, biểu cảm linh hoạt).

### Bảng nhân vật chính thức
- Mã nguồn React: [`assets/nhan-vat.tsx`](assets/nhan-vat.tsx) (chứa `Nam`, `NguoiKia`, `Tung`, các component đầu và biểu cảm tương ứng).
- File vector SVG độc lập: [`assets/nhan-vat.svg`](assets/nhan-vat.svg) (bảng 1920×1080 gồm dáng toàn thân và các cận cảnh biểu cảm).

| Nhân vật | Vai trò trong kịch bản | Đặc điểm nhận diện & Tạo hình | Trang phục & Đạo cụ |
|---|---|---|---|
| **1. Nam** | Sinh viên nhân vật chính, lười nhác, ngủ nướng, trễ deadline bài nhóm, sợ hãi khi gặp bản sao | **Nốt ruồi sát đuôi mày trái** (chi tiết then chốt từ kịch bản), tóc rối ngái ngủ, vai mềm buông lơi, lưng gù nhẹ lười biếng. | Áo thun ngủ xám nhạt (`#8e9694`), quần thun lửng ngủ (`#3e4347`), dép lê quai kẹp (`#425850`), cầm điện thoại kiểm tra tin nhắn/cuộc gọi. |
| **2. Người Kia (Bản sao)** | Sinh vật thay thế bí ẩn, xuất hiện ở bồn rửa chén, dần chiếm chỗ sinh hoạt | Khuôn mặt và **nốt ruồi đuôi mày trái giống hệt Nam**, nhưng **dáng đứng thẳng thớm, đĩnh đạc**, ánh mắt điềm tĩnh rợn người. | Mặc chiếc **áo thun xanh rêu (`#5c7a70`) của Nam** (chiếc áo Nam bỏ trên ghế tối qua), quần dài vải sẫm màu (`#515451`), hai bàn tay để trống lịch sự phía trước. |
| **3. Tùng** | Bạn cùng phòng chăm chỉ, dậy sớm đi học lúc 7h, nghe máy gạt đi vì tưởng Nam ngủ mơ | Sinh viên năng động, gương mặt sáng sủa, đeo kính cận gọng mảnh, tóc rẽ ngôi side-part gọn gàng. | Áo polo sinh viên xanh navy (`#2b3f54`), quần kaki be (`#8c8474`), giày sneaker trắng ngà, đeo quai balo, một tay ôm tài liệu học, một tay nghe điện thoại. |

---

## Các biểu cảm chi tiết (Moods)

1. **Nam:**
   - `sleepy`: Mí mắt sụp uể oải, miệng trễ hé mở ngái ngủ.
   - `shocked`: Mắt mở trừng to, con ngươi thu nhỏ, miệng há hốc thấy hàm răng trên, co rúm thủ thế.
   - `suspicious`: Mày nhíu bất đối xứng, mắt liếc ngang, môi bặm dò xét qua khe cửa.
   - `hesitant`: Đắn đo, tự đấu tranh tư tưởng khi nghe bản sao gợi ý làm bài hộ.

2. **Người Kia (Bản sao):**
   - `calm`: Mắt mở đều, ánh nhìn kiên định, thản nhiên lạ thường.
   - `neutral_smile`: Nụ cười nhẹ lịch sự, giảm cảm giác đe dọa.
   - `eerie_smirk`: Nụ cười nhếch nhẹ sắc lạnh, toan tính khi Nam bắt đầu cắn câu giao việc.

3. **Tùng:**
   - `annoyed`: Mày cau bực bội khi bị Nam gọi nhảm giữa giờ học giảng đường ("Mày xàm hả?").
   - `focused`: Nghiêm túc, tập trung vào bài giảng.
   - `normal`: Vẻ mặt sinh viên bình thường.

---

## File thiết kế tham chiếu ban đầu
- [`assets/thiet-ke/character-svg-v1.png`](assets/thiet-ke/character-svg-v1.png): Bảng đối chiếu ban đầu giữa Rig cũ và Mẫu thử B.
- [`assets/thiet-ke/character-svg-v1.tsx`](assets/thiet-ke/character-svg-v1.tsx): File thử nghiệm ban đầu của mẫu B.
