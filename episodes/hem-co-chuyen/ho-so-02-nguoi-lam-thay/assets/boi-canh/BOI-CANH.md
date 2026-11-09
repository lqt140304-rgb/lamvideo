# Bối cảnh Môi trường — Hồ sơ 02: Người làm thay

**Bổ sung mỹ thuật 10/11/2026:** tuân theo [quy chuẩn chung](../../../../../docs/PHONG-CACH-MY-THUAT.md). Cả căn phòng, bếp, hành lang, góc bàn học và cảnh thành phố cùng dùng nét mềm, cạnh bo vừa phải, vải/nệm có độ rủ và khối đầy. Giữ mặt bằng, bản lề/chốt, phối cảnh, lớp che và ánh sáng đã chốt. Các từ “3D” phía dưới chỉ cách gợi thể tích/phối cảnh cho tranh cartoon 2.5D, không phải yêu cầu dựng nền hộp cứng hoặc đổi sang ảnh thật. SVG/TSX/PNG hiện có chưa được vẽ lại ở lượt tài liệu này.

**Chuẩn hóa:** 09/11/2026 theo phong cách nghệ thuật hữu cơ mới (Style B).  
**Hình ảnh tổng quan:** ![Bảng bối cảnh môi trường 4 ô](boi-canh.png)

**Khi đưa nền vào cảnh:** bảng thiết kế thể hiện hình tĩnh; trạng thái cửa/chốt và vị trí hai ghế theo [bảng máy 10/11](../../DUNG-CANH.md). Có hình chốt gài hoặc ghế trước cửa không có nghĩa mọi thời điểm truyện đều khóa/chặn. Không tự đổi các SVG trong lượt thêm máy.

---

## 1. Hệ thống 4 Bối cảnh cốt lõi theo Kịch bản

Toàn bộ các phân cảnh trong kịch bản đã duyệt và đang phát triển của **Hồ sơ 2: Người làm thay** diễn ra xoay quanh 4 không gian trọng tâm sau:

| STT | Tên bối cảnh & File SVG | Tiêu cự máy quay | Thời điểm & Ánh sáng | Đạo cụ & Ý nghĩa diễn hoạt |
|---|---|---|---|---|
| **1** | **Phòng trọ sáng sớm**<br>[`phong-tro-sang-som.svg`](phong-tro-sang-som.svg) | **35mm** (Toàn cảnh) | **7:00 AM** — Nắng sớm xiên qua cửa sổ và khe cửa hé mở | **Thiết lập không gian tổng thể căn phòng:** Cửa sổ thành phố $\to$ Tủ Duy Tân $\to$ 2 nệm song song chuẩn phối cảnh (Tùng & Nam) $\to$ **Bàn học của Nam (có giá sách giáo trình, đèn đỏ)** $\to$ Cửa chính hé mở ra hành lang dài $\to$ Góc bồn rửa chén kê khít góc tường phải. |
| **2** | **Góc bếp & Bồn rửa chén**<br>[`goc-bep-bon-rua.svg`](goc-bep-bon-rua.svg) | **50mm** (Trung cận) | Ánh sáng trong phòng, phản quang gạch men ố vàng | **Bồn rửa chén kê khít góc tường**, gờ nẹp đá granit trám keo silicon sát gạch men ố vàng, vòi nước nhỏ giọt, khay úp chén sạch bóng sau khi Người Kia làm hộ, kệ gia vị, bình 20L, thùng mì Hảo Hảo gầm bếp, cây chổi rơm, mép trái thấy khuôn cửa phòng. |
| **3** | **Cửa phòng gài chốt & Hành lang**<br>[`hanh-lang-cua-phong.svg`](hanh-lang-cua-phong.svg) | **35mm** (Căng thẳng) | Ánh sáng giếng trời hành lang xuyên ô chớp | Cửa chính đóng kín, **then cài chốt kim loại cơ học gài cứng**, ghế gỗ chặn cửa; bên trái thấy mép nệm Nam & đồng hồ tường; bên phải là **chiếc bàn học của Nam (đồng bộ 100% với Bối cảnh 4)** có giá sách, giáo trình Triết học/Toán, đèn đỏ, ví da & thẻ căn cước công dân, ghế xoay công thái học. |
| **4** | **Bàn học ban đêm**<br>[`ban-hoc-laptop-dem.svg`](ban-hoc-laptop-dem.svg) | **50mm** (Tập trung) | **Buổi tối** — Quầng sáng vàng từ đèn bàn + màn hình laptop | Cận cảnh chiếc bàn học của Nam: đèn đỏ rọi sáng, laptop Google Docs mở bài làm hộ, điện thoại bật Không làm phiền, **ghế xoay học sinh công thái học lưới đen**; hậu cảnh bóng tối thấy rõ nệm Nam bên trái và cửa phòng gài chốt bên phải. |

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

## Cách quay các lớp — bổ sung 10/11/2026

Xem [quay layer theo từng nhóm máy](../../DUNG-CANH.md#quay-layer): không chỉ scale toàn nền; khi dịch ngang, lớp gần thay tương quan với lớp xa, còn chân người/ghế, bóng và vật đang cầm giữ tiếp xúc. Cửa sổ/hành lang có mask theo khung mở, bàn/bồn rửa có lớp trước–sau để tay và thân bị che đúng. Chữ trong điện thoại/laptop đi cùng mặt màn hình, khác với phụ đề ngoài truyện. Phần này ghi cách triển khai, không xác nhận bốn SVG hay component React đã được tách và chạy camera.
