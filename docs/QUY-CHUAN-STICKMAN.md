# Quy chuẩn nhân vật stickman — hướng hiện hành

**Chủ repo chốt ngày 17/11/2026:** nhân vật dạng stickman đơn giản, chuẩn hóa theo **Kiểu B (Đầu tròn + Thân viên nang + Tay chân ống mảnh)**; dùng chung 1 phôi cơ thể và khuôn mặt, chỉ phân biệt tạo hình bằng **tóc và quần áo**. Quyết định này thay yêu cầu dùng phôi người/chibi chi tiết trước đây.

## 1. Thông số hình học chuẩn Stickman Kiểu B

- **Chiều cao tổng thể:** Chuẩn hóa đúng **1,60 m** (đáy chân tại $Z = 0.0\text{ m}$, đỉnh đầu tại $Z = 1.60\text{ m}$), khớp tuyệt đối với toàn bộ bối cảnh phòng trọ, cửa sổ, trần nhà và bàn ghế 3D đã dựng.
- **Đầu (Head):** Khối tròn trơn nhẵn (UV Sphere, bán kính $R = 0.14\text{ m}$), tâm đầu tại $Z = 1.46\text{ m}$.
- **Cổ (Neck):** Trụ Cylinder ($R = 0.04\text{ m}$, $H = 0.08\text{ m}$), nối từ $Z = 1.28\text{ m}$ lên $1.36\text{ m}$.
- **Thân (Torso Capsule):** Khối **viên nang** bo tròn hai đầu (vai ngực $Z = 1.25\text{ m}$ bán kính $0.12\text{ m}$, eo chậu $Z = 0.78\text{ m}$ bán kính $0.10\text{ m}$). Dáng thân viên nang gọn gàng giúp dễ dàng mặc quần áo rời (áo phông, sơ mi, quần dài, quần đùi) bọc ngoài mà không bị xuyên lưới (gap $\ge 10\text{ mm}$).
- **Tay & Bàn tay (Arms & Hands):** Dạng ống cylinder mảnh ($R = 0.035\text{ m}$, dài $0.55\text{ m}$). Bàn tay tối giản có thể tích bầu dục kèm ngón cái tách biệt để cầm nắm đạo cụ (búa, điện thoại, thẻ bài, chén bát) có điểm tựa vững vàng.
- **Chân & Bàn chân (Legs & Feet):** Dạng ống cylinder ($R = 0.045\text{ m}$), bàn chân khối nêm bo tròn đế phẳng tiếp sàn chính xác tại $Z = 0.0\text{ m}$.
- **Mặt:** Dùng chung phôi trơn hoặc biểu cảm nét tối giản. Cảm xúc thể hiện chính qua hướng nghiêng đầu, tư thế vai và nhịp thở chuyển động cơ thể.

## 2. Bảng phân vai và nhận diện tạo hình (Dàn nhân vật)

Dùng chung $100\%$ phôi Stickman Base V1, phân biệt bằng tóc và trang phục:

| Nhân vật | Tóc & Phụ kiện đầu | Trang phục đặc trưng | Ngôn ngữ hình thể & Nhận diện |
|---|---|---|---|
| **Nam (Bản thể thật)** | Mảng khối anime-block đen rối bù, phủ trán và gáy | Áo phông cộc tay xanh rêu oversized (`#5c7a70`), quần lửng xám (`#707370`), dép lê xanh | Dáng đi hơi gù, vai so, run rẩy bấn loạn; 100% thuận tay phải |
| **Người Kia (Bản sao)** | Giống hệt 100% tóc Nam | Giống hệt 100% đồ Nam | Đứng thẳng tắp, điềm tĩnh cơ học (`calm`), 100% thuận tay trái; gáy rỉ nước lạnh dưới trăng |
| **Tùng (Bạn phòng trọ)** | Tóc ngắn vuốt dựng nhọn (spiky) thể thao | Áo thun cam cổ tim viền trắng (`#d4673f`), quần đùi thể thao đen sọc trắng (`#2c3138`), giày chạy | Dáng đứng khỏe khoắn, năng động, bước đi dứt khoát |
| **Giảng viên (Lab 402)** | Tóc rẽ ngôi 7/3 chỉn chu, gọng kính đen tối giản | Áo sơ mi kem sáng (`#f3f0e6`) sơ vin, quần âu xanh than (`#2f3b53`), giày tây | Đứng đắn, nghiêm nghị, cầm giáo trình hoặc phấn |
| **Người Truy Vết (Series)**| Tóc che trán bí hiểm / Mũ trùm | Áo hoodie/khoác ngoài màu than (`#2b2b2e`) viền đỏ trầm (`#801818`), quần túi hộp rêu xám | Phong thái quan sát, suy luận, bước chân nhẹ nhàng |

## 3. Tái sử dụng và phôi cũ

- Phôi [HUMAN-MALE-BASE-01](../what-if-studio/library/characters/human-male/base-v1/README.md), các bản chibi (`nam-002`, `nam-003`) và mẫu người chi tiết được bảo toàn nguyên trạng làm tư liệu lịch sử. Chúng **không còn là phôi bắt buộc hoặc chuẩn tỷ lệ** cho nhân vật mới.
- Nguồn nhân vật hiện hành là script sinh Stickman Base Kiểu B (`dung_stickman_cast.py`) và thư viện [stickman-base-v1](../what-if-studio/library/characters/stickman-base-v1/README.md).

## 4. Đồng bộ câu chuyện (Hồ sơ 02)

- Nam và Người Kia dùng cùng tóc và trang phục theo đúng tình tiết truyện (nhân bản hoán đổi).
- Manh mối nốt ruồi đối bên trong bản cũ xung đột với quy tắc nhận diện không nốt ruồi của Stickman. Manh mối nhận diện rùng rợn được chuyển giao hoàn toàn sang:
  1. **Tính thuận tay trái đối xứng gương:** Nam thuận tay phải $\leftrightarrow$ Người Kia 100% thuận tay trái (cầm búa, rửa chén, gài then sắt, lướt điện thoại).
  2. **Thân nhiệt & Vết nứt rỉ nước lạnh:** Tay Người Kia lạnh ngắt; gáy và bả vai có vết nứt rỉ nước lạnh dưới trăng/hoàng hôn.