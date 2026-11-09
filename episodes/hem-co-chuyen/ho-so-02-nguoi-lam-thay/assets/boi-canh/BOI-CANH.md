# Bối cảnh Môi trường — Hồ sơ 02: Người làm thay

**Bổ sung mỹ thuật 10/11/2026:** tuân theo [quy chuẩn chung](../../../../../docs/PHONG-CACH-MY-THUAT.md). Cả căn phòng, bếp, hành lang, góc bàn học và cảnh thành phố cùng dùng nét mềm, cạnh bo vừa phải, vải/nệm có độ rủ và khối đầy. Giữ mặt bằng, bản lề/chốt, phối cảnh, lớp che và ánh sáng đã chốt. Các từ “3D” phía dưới chỉ cách gợi thể tích/phối cảnh cho tranh cartoon 2.5D, không phải yêu cầu dựng nền hộp cứng hoặc đổi sang ảnh thật.

**Chuẩn hóa:** 09/11/2026 theo bản vẽ thiết kế mặt bằng phòng trọ chuẩn hóa của tác giả (`image.png`) — Phong cách Style B.  
**Hình ảnh tổng quan:** ![Bảng bối cảnh môi trường 4 ô](boi-canh.png)

**Khi đưa nền vào cảnh:** bảng thiết kế thể hiện hình tĩnh; trạng thái cửa/chốt và vị trí hai ghế theo [bảng máy 10/11](../../DUNG-CANH.md). Có hình chốt gài hoặc ghế trước cửa không có nghĩa mọi thời điểm truyện đều khóa/chặn.

---

## 1. Hệ thống 4 Bối cảnh cốt lõi theo Mặt bằng Phòng trọ của tác giả

Toàn bộ các phân cảnh trong **Hồ sơ 2: Người làm thay** được phát triển thống nhất 100% từ bản vẽ mặt bằng phòng trọ chuẩn do tác giả cung cấp (`image.png`):

| STT | Tên bối cảnh & File SVG | Tiêu cự máy quay | Thời điểm & Ánh sáng | Đạo cụ & Ý nghĩa diễn hoạt |
|---|---|---|---|---|
| **1** | **Phòng trọ sáng sớm**<br>[`phong-tro-sang-som.svg`](phong-tro-sang-som.svg) | **35mm** (Toàn cảnh 1-point) | **7:00 AM** — Nắng sớm xiên qua cửa sổ tường phải | **Thiết lập mặt bằng chuẩn 100% theo bản vẽ tác giả:** Tường trái có cửa chính mở ra hành lang dài $\to$ Bếp & bồn rửa inox góc trái, kệ gia vị, chổi rơm, quạt đứng $\to$ Giữa tường sau có tủ quần áo gỗ đứng 3 tầng $\to$ Bên phải tường sau có **Bàn học sinh viên (laptop mở sáng, đèn bàn) & Chiếc ghế to đầm chắc có áo thun vắt lưng ghế** $\to$ Tường phải có cửa sổ phố xá với vệt nắng chiếu xiên $\to$ Tiền cảnh góc phải có nệm Nam với chăn rêu xộc xệch, điện thoại báo thức 7h, dép lê & áo rơi trên sàn. |
| **2** | **Góc bếp & Bồn rửa chén**<br>[`goc-bep-bon-rua.svg`](goc-bep-bon-rua.svg) | **50mm** (Trung cận) | Ánh sáng trong phòng, phản quang gạch men ố vàng | **Cận cảnh góc bếp bên trái theo mặt bằng tác giả:** Tủ bếp dưới màu xanh xám nhạt (`#9cae9b`), bồn rửa inox 2 ngăn, vòi nước nhỏ giọt, khay úp chén đĩa, bát to kèm đũa gác chéo, kệ gia vị gỗ treo tường, bình nước 20L, thùng mì Hảo Hảo gầm bếp, cây chổi rơm, quạt đứng sinh viên ở tiền cảnh, mép trái thấy cánh cửa mở ra hành lang dài bên ngoài. |
| **3** | **Cửa phòng gài chốt & Hành lang**<br>[`hanh-lang-cua-phong.svg`](hanh-lang-cua-phong.svg) | **35mm** (Căng thẳng) | Ánh sáng giếng trời hành lang xuyên ô chớp | Cửa chính phòng trọ với **then cài chốt kim loại cơ học gài cứng**, màu cửa xanh xám (`#769384`), ghế gỗ chặn cửa canh chốt; bên phải là chiếc bàn học sinh viên của Nam với laptop, giáo trình Triết học/Toán, đèn đỏ, thẻ CCCD và **chiếc ghế xoay học sinh công thái học to rộng, vững chãi**. |
| **4** | **Bàn học ban đêm**<br>[`ban-hoc-laptop-dem.svg`](ban-hoc-laptop-dem.svg) | **50mm** (Tập trung) | **23:45 Đêm muộn** — Quầng sáng vàng từ đèn bàn + màn hình laptop | Cận cảnh chiếc bàn học sinh viên ở góc phải: đèn đỏ rọi sáng ấm, laptop Google Docs mở bài tập nhóm làm hộ, điện thoại báo tin nhắn/cuộc gọi nhỡ khẩn cấp, **chiếc ghế xoay học sinh công thái học to đầm, cân đối hoàn hảo thẳng hàng laptop**; hậu cảnh đêm thấy bóng dáng tủ quần áo bên trái, đồng hồ 23:45 ở trên và cửa sổ đêm bên phải. |

---

## 2. Quy chuẩn thiết kế mỹ thuật & Chiều sâu 3D (Style B Specs)

1. **Chiều sâu không gian 1-Point Perspective chuẩn xác:**
   - Dựng trực tiếp từ mặt bằng phòng trọ tác giả: Điểm tụ trung tâm kéo dài từ cửa chính (tường trái), góc bếp và tủ quần áo (tường sau), bàn học và cửa sổ (tường phải).
   - Lưới gạch sàn nhà chạy tụ tự nhiên, tạo chiều sâu 3D không gian phòng trọ sinh viên thực thụ.
   - **Vật thể tiếp đất (Grounded Objects):** Chân ghế to bản, chân bàn học, tủ bếp, chân quạt đứng, nệm nằm đều có bóng tiếp xúc Ambient Occlusion (AO).

2. **Tỉ lệ Ghế bàn học to đầm chắc (Human-scale Ergonomic Chair):**
   - Đã nâng cấp toàn diện kích thước chiếc ghế ở bàn học theo yêu cầu tác giả: Tựa lưng cao ngang mặt bàn, đệm ngồi rộng rãi, khung chân vững chãi, tỷ lệ cân xứng tuyệt đối với cơ thể người và kích thước bàn học, loại bỏ hoàn toàn cảm giác ghế bị nhỏ lọt thỏm.
   - Chiếc áo thun vắt hờ trên lưng ghế ở Bối cảnh 1 là chi tiết đạo cụ đắt giá liên kết chặt chẽ với kịch bản (chiếc áo bản sao mặc khi xuất hiện).

3. **Lưu trữ phiên bản cũ (Archive):**
   - Các file thiết kế cũ được lưu trữ an toàn trong thư mục `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh/archive-old-layout/`.

---

## 3. Danh mục tài nguyên trong thư mục

- [`boi-canh.svg`](boi-canh.svg): Master Board 4 bối cảnh độ phân giải cao 3840×2160 (4K).
- [`boi-canh.png`](boi-canh.png): Bản render sắc nét 1920×1080 phục vụ xem nhanh.
- [`phong-tro-sang-som.svg`](phong-tro-sang-som.svg): Bối cảnh 1 (Toàn cảnh theo bản vẽ tác giả).
- [`goc-bep-bon-rua.svg`](goc-bep-bon-rua.svg): Bối cảnh 2 (Cận cảnh góc bếp bên trái).
- [`hanh-lang-cua-phong.svg`](hanh-lang-cua-phong.svg): Bối cảnh 3 (Cửa phòng & hành lang dài).
- [`ban-hoc-laptop-dem.svg`](ban-hoc-laptop-dem.svg): Bối cảnh 4 (Bàn học ban đêm & ghế to đầm chắc).
- [`boi-canh.tsx`](boi-canh.tsx): Bộ component React cho timeline Remotion.
- [`xem-truc-tiep-boi-canh.html`](xem-truc-tiep-boi-canh.html): Trình xem tương tác độc lập (chuyển tab từng cảnh, zoom +/−, pan chuột).

## Cách quay các lớp — bổ sung 10/11/2026

Xem [quay layer theo từng nhóm máy](../../DUNG-CANH.md#quay-layer): không chỉ scale toàn nền; khi dịch ngang, lớp gần thay tương quan với lớp xa, còn chân người/ghế, bóng và vật đang cầm giữ tiếp xúc. Cửa sổ/hành lang có mask theo khung mở, bàn/bồn rửa có lớp trước–sau để tay và thân bị che đúng. Chữ trong điện thoại/laptop đi cùng mặt màn hình, khác với phụ đề ngoài truyện.
