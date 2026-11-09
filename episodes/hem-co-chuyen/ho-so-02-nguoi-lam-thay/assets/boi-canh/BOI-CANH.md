# Bối cảnh Môi trường — Hồ sơ 02: Người làm thay

**Chuẩn hóa:** 09/11/2026 theo phong cách nghệ thuật hữu cơ mới (Style B).  
**Hình ảnh tổng quan:** ![Bảng bối cảnh môi trường 4 ô](boi-canh.png)

---

## 1. Hệ thống 4 Bối cảnh cốt lõi theo Kịch bản

Toàn bộ các phân cảnh trong kịch bản đã duyệt và đang phát triển của **Hồ sơ 2: Người làm thay** diễn ra xoay quanh 4 không gian trọng tâm sau:

| STT | Tên bối cảnh & File SVG | Tiêu cự máy quay | Thời điểm & Ánh sáng | Đạo cụ & Ý nghĩa diễn hoạt |
|---|---|---|---|---|
| **1** | **Phòng trọ sáng sớm**<br>[`phong-tro-sang-som.svg`](phong-tro-sang-som.svg) | **35mm** (Toàn cảnh) | **7:00 AM** — Nắng sớm xiên qua cửa sổ và khe cửa hé mở | **2 nệm nằm song song chuẩn lưới phối cảnh** (nệm Tùng gấp gọn gàng sát tường, nệm Nam xộc xệch phía trước có báo thức 07:00 và đôi dép lê), bồn rửa chén kê sát góc tường phải, gạch ốp tường hơi ố vàng nhẹ đồng bộ 100% với Bối cảnh 2. |
| **2** | **Góc bếp & Bồn rửa chén**<br>[`goc-bep-bon-rua.svg`](goc-bep-bon-rua.svg) | **50mm** (Trung cận) | Ánh sáng trong phòng, phản quang gạch men ố vàng | Bồn rửa chén inox, vòi nước nhỏ giọt, khay úp chén sạch bóng sau khi Người Kia làm hộ, chai nước rửa chén Sunlight, thùng mì Hảo Hảo, cây chổi rơm dựng vách tường. |
| **3** | **Cửa phòng gài chốt & Hành lang**<br>[`hanh-lang-cua-phong.svg`](hanh-lang-cua-phong.svg) | **35mm** (Căng thẳng) | Ánh sáng giếng trời hành lang xuyên ô chớp | Cánh cửa gỗ dày đóng kín, **then cài chốt kim loại cơ học gài cứng**, lỗ mắt mèo, chiếc ghế tựa gỗ Nam kéo ra ngồi chặn cửa, bàn nhỏ có ví da và thẻ căn cước công dân. |
| **4** | **Bàn học ban đêm**<br>[`ban-hoc-laptop-dem.svg`](ban-hoc-laptop-dem.svg) | **50mm** (Tập trung) | **Buổi tối** — Quầng sáng vàng từ đèn bàn + màn hình laptop | Laptop cũ cắm sạc đang mở Google Docs hoàn thiện bài tập nhóm, điện thoại hiện icon **Không làm phiền** + cuộc gọi nhỡ + tin nhắn Tùng đi đánh cầu, **ghế xoay học sinh công thái học lưới đen (ergonomic mesh swivel chair) chân sao 5 bánh xe** quay về phía bàn học. |

---

## 2. Quy chuẩn thiết kế mỹ thuật & Chiều sâu 3D (Style B 3D Specs)

1. **Chiều sâu không gian 3D & Phối cảnh (3D Perspective):**
   - Loại bỏ hoàn toàn cảm giác dán phẳng 2D vào tường: các vật thể được dựng theo phối cảnh 3 mặt rõ ràng (mặt trên, mặt trước, mặt hông) với các đường tụ chính xác.
   - **Góc phòng 3D:** Giao điểm giữa tường trái và tường sau tạo khối hộp không gian chân thực.
   - **Vật thể tiếp đất (Grounded Objects):** Chân ghế, chân bàn, tủ bếp, chân quạt và nệm nằm đều có bóng đổ tiếp xúc (Ambient Occlusion & Cast Shadows) xuống mặt sàn.

2. **Không gian ngoại cảnh thành phố (City Skyline View qua Cửa Sổ):**
   - Bên ngoài cửa sổ phòng trọ là khung cảnh đô thị Việt Nam chân thực: dãy nhà phố mái ngói đỏ, nhà ống vàng, ban công phơi đồ, bồn nước Inox Tân Á trên sân thượng, các tòa chung cư cao tầng mờ ảo trong sương sớm, và hệ thống cột điện dây điện chằng chịt.
   - Khung cửa sổ có chiều sâu bệ tường bê tông dày (window sill) và rèm cuốn 3D.

3. **Hành lang dài sâu hun hút (Deep Long Corridor):**
   - Nhìn qua cánh cửa chính mở hé là hành lang nhà trọ sâu hun hút với điểm tụ (vanishing point) rõ rệt, dãy lan can sắt dài, bóng đèn tuýp trần, các cửa phòng trọ 101, 102, 103 và chiếu nghỉ cầu thang bê tông.
   - Cánh cửa có độ dày cạnh 3D (door edge thickness) hé mở tạo chiều sâu không gian vượt bậc.

4. **Cấu trúc phân lớp tách biệt (Layer Hierarchy for 2.5D/3D Animation):**
   - `Layer 1: Exterior / Far Background` — Bầu trời thành phố, dãy nhà cao tầng, hành lang dài bên ngoài.
   - `Layer 2: Architectural Shell` — Khung tường 3D, sàn gạch phối cảnh, bệ cửa sổ bê tông, khuôn bao cửa gỗ.
   - `Layer 3: Ambient Shadows & Floor Grid` — Bóng đổ tiếp đất của toàn bộ đồ đạc.
   - `Layer 4: 3D Heavy Furniture` — Khối nệm 3D, tủ bồn rửa chén 3D có mặt đá & chậu chìm, bàn học gỗ có ngăn kéo, cánh cửa gỗ 3D.
   - `Layer 5: Story Props & Dynamic Devices` — Then cài chốt trượt kim loại, laptop phát sáng Google Docs, điện thoại báo thức / Không làm phiền, chén đĩa khay úp, chổi rơm quét nhà.
   - `Layer 6: Volumetric Lighting & Atmospheric Effects` — Vệt nắng ban mai xiên qua cửa sổ, quầng sáng vàng ấm hình nón từ đèn bàn, ánh sáng xanh màn hình laptop.

---

## 3. Danh mục tài nguyên trong thư mục

- [`boi-canh.svg`](boi-canh.svg): Master Board 4 bối cảnh độ phân giải cao 3840×2160 (4K).
- [`boi-canh.png`](boi-canh.png): Bản render sắc nét 1920×1080 phục vụ xem nhanh.
- [`boi-canh.tsx`](boi-canh.tsx): Bộ component React cho timeline Remotion.
- [`xem-truc-tiep-boi-canh.html`](xem-truc-tiep-boi-canh.html): Trình xem tương tác độc lập (hỗ trợ chuyển tab từng cảnh, zoom in/out, pan chuột).
