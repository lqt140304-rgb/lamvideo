# Bối cảnh Môi trường — Hồ sơ 02: Người làm thay

**Chuẩn hóa:** 09/11/2026 theo phong cách nghệ thuật hữu cơ mới (Style B).  
**Hình ảnh tổng quan:** ![Bảng bối cảnh môi trường 4 ô](boi-canh.png)

---

## 1. Hệ thống 4 Bối cảnh cốt lõi theo Kịch bản

Toàn bộ các phân cảnh trong kịch bản đã duyệt và đang phát triển của **Hồ sơ 2: Người làm thay** diễn ra xoay quanh 4 không gian trọng tâm sau:

| STT | Tên bối cảnh & File SVG | Tiêu cự máy quay | Thời điểm & Ánh sáng | Đạo cụ & Ý nghĩa diễn hoạt |
|---|---|---|---|---|
| **1** | **Phòng trọ sáng sớm**<br>[`phong-tro-sang-som.svg`](phong-tro-sang-som.svg) | **35mm** (Toàn cảnh) | **7:00 AM** — Nắng sớm xiên qua cửa sổ và khe cửa hé mở | Nệm Nam xộc xệch ngái ngủ, điện thoại reo báo thức 07:00 "Đi học", nệm Tùng gấp gọn gàng, dép kẹp vứt lăn lóc, quạt máy, góc bồn rửa ở sâu. |
| **2** | **Góc bếp & Bồn rửa chén**<br>[`goc-bep-bon-rua.svg`](goc-bep-bon-rua.svg) | **50mm** (Trung cận) | Ánh sáng trong phòng, phản quang gạch men | Bồn rửa chén inox, vòi nước nhỏ giọt, khay úp chén sạch bóng sau khi Người Kia làm hộ, chai nước rửa chén Sunlight, cây chổi rơm dựng vách tường (chi tiết thoại quét nhà). |
| **3** | **Cửa phòng gài chốt & Hành lang**<br>[`hanh-lang-cua-phong.svg`](hanh-lang-cua-phong.svg) | **35mm** (Căng thẳng) | Ánh sáng giếng trời hành lang xuyên ô chớp | Cánh cửa gỗ dày đóng kín, **then cài chốt kim loại cơ học gài cứng**, lỗ mắt mèo, chiếc ghế tựa Nam kéo ra ngồi canh cửa, bàn nhỏ có ví da và thẻ căn cước công dân. |
| **4** | **Bàn học ban đêm**<br>[`ban-hoc-laptop-dem.svg`](ban-hoc-laptop-dem.svg) | **50mm** (Tập trung) | **Buổi tối** — Quầng sáng vàng từ đèn bàn + màn hình laptop | Laptop cũ cắm sạc đang mở Google Docs hoàn thiện bài tập nhóm, điện thoại hiện icon **Không làm phiền** + cuộc gọi nhỡ + tin nhắn Tùng đi đánh cầu, ghế tựa người kia ngồi gõ bài. |

---

## 2. Quy chuẩn thiết kế mỹ thuật (Style B Environment Specs)

1. **Đường nét & Bút pháp (Stroke & Outlines):**
   - Viền mực than ấm `#282b2b` với `stroke-width` từ `3.5px` đến `5px` cho viền đồ đạc chính, `2.5px` cho nẹp gạch và chi tiết phụ.
   - Nét bo tròn góc `round`, tránh các góc nhọn cơ học 3D giả lập máy móc.

2. **Hệ màu ánh sáng & Không gian (Lighting & Color Script):**
   - **Ban ngày (Cảnh 1 & 2):** Tường kem vàng nhạt `#ebe3d3`, sàn lát gạch xám be `#c8baa1`, vệt nắng sớm mềm mại `#fffde6` độ mờ nhẹ.
   - **Chốt cửa (Cảnh 3):** Không khí căng thẳng, màu cửa gỗ xanh rêu trầm `#54696e`, kim loại sáng `#e2e8f0` tạo điểm nhấn ở then cài.
   - **Ban đêm (Cảnh 4):** Môi trường đen tím trầm `#12161f`, tương phản cực mạnh với quầng sáng vàng ấm hình nón từ bóng đèn bàn `#fde047` và ánh sáng xanh phát quang từ màn hình laptop `#e0f2fe`.

3. **Cấu trúc phân lớp (Layering for Animation):**
   - `Layer 0: Background` — Tường nhà, sàn gạch, khung cửa sổ, giếng trời.
   - `Layer 1: Midground (Static Props)` — Tủ bếp, bàn học, khung cửa chính, nệm ngủ.
   - `Layer 2: Dynamic Props (Diễn hoạt)` — Cánh cửa mở/khép, then chốt trượt, vòi nước nhỏ giọt, quạt quay, laptop bật/tắt, điện thoại sáng màn hình.
   - `Layer 3: Lighting & Ambient Overlays` — Dải sáng xiên, quầng sáng đèn bàn, bóng đổ nhân vật.

---

## 3. Danh mục tài nguyên trong thư mục

- [`boi-canh.svg`](boi-canh.svg): Master Board 4 bối cảnh độ phân giải cao 3840×2160 (4K).
- [`boi-canh.png`](boi-canh.png): Bản render sắc nét 1920×1080 phục vụ xem nhanh.
- [`boi-canh.tsx`](boi-canh.tsx): Bộ component React cho timeline Remotion.
- [`xem-truc-tiep-boi-canh.html`](xem-truc-tiep-boi-canh.html): Trình xem tương tác độc lập (hỗ trợ chuyển tab từng cảnh, zoom in/out, pan chuột).
