# Thiết Kế Chi Tiết: Nâng Cấp Dàn Nhân Vật Stickman 3D Stylized Nghệ Thuật

- **Dự án:** Stickman 3D Animation Series (`episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay`)
- **Tác giả:** Antigravity & User Pair-Programming
- **Ngày:** 17/11/2026
- **Trạng thái:** Chờ duyệt (Awaiting Approval)

---

## 1. Bối Cảnh & Mục Tiêu (Intent & Why)

Sau bước dựng phôi sơ bộ, dàn nhân vật Stickman 3D trong file `stickman_cast.blend` còn mang cảm giác hình khối nguyên thủy (primitives), vật liệu bóng như nhựa tổng hợp thô và thiếu chi tiết thực tế của trang phục.

Mục tiêu của đợt nâng cấp này là đưa chất lượng hình học và vật liệu lên chuẩn **3D Stylized Nghệ Thuật (Stylized Cinematic Art)** tương đương concept art gốc (*The Crack in Reality*):
- Khử sạch cảm giác "nhựa", biến mô hình thành tác phẩm gốm sứ / đất sét nghệ thuật kết hợp chất liệu sợi vải chân thực.
- Thêm các chi tiết nhận diện trang phục may đo sắc sảo cho từng nhân vật.
- Dựng bàn tay có ngón cái cách điệu, sàn studio vô cực (cyclorama) và ánh sáng điện ảnh bắt bóng đổ tiếp sàn.

---

## 2. Các Hướng Tiếp Cận Đã Cân Nhắc (Approaches)

1. **Phương án A: Chỉ thay đổi màu sắc và vân bề mặt (Texture mapping cơ bản):**
   - *Ưu điểm:* Nhanh, nhẹ.
   - *Nhược điểm:* Hình khối vẫn là các ống trụ thẳng đơ, không có cổ áo, túi hộp hay nẹp cúc thực tế; không giải quyết được tính "nhựa". *(Loại bỏ)*
2. **Phương án B: Sculpting điêu khắc 3D tả thực người thật (Realistic Anatomy):**
   - *Ưu điểm:* Cực kỳ chi tiết.
   - *Nhược điểm:* Phá vỡ bản sắc tối giản của Stickman Kiểu B; khối lượng render quá nặng cho animation series. *(Loại bỏ)*
3. **Phương án C: 3D Stylized Nghệ Thuật (Stylized Collectible Clay/Porcelain & Tailored Cloth) — *ĐƯỢC CHỌN*:**
   - Giữ phom dáng chuẩn 1,60 m của Stickman Kiểu B.
   - Ứng dụng Subsurface Scattering (SSS) cho phần đầu và da men sứ.
   - Bổ sung hiệu ứng viền vải `Sheen` cho trang phục.
   - Dựng chi tiết hình học: Bo viền cổ, sọc thể thao trắng, nẹp cúc sơ mi, khóa kéo hoodie, túi hộp, bàn tay cách điệu có ngón cái, và sàn studio vô cực.

---

## 3. Quy Chuẩn Kỹ Thuật Chi Tiết

### 3.1. Nâng Cấp Shader & Vật Liệu (Khử Hiệu Ứng Nhựa)

| Vật liệu | Shader Type | Thuộc tính chính | Hiệu ứng hình ảnh |
| :--- | :--- | :--- | :--- |
| **Da / Men sứ (`Mat_Skin`)** | Principled BSDF | Base Color `#f2ede4`, Subsurface Weight `0.08`, Subsurface Radius `(0.12, 0.06, 0.03)`, Roughness `0.45` | Tán xạ ánh sáng ấm dưới bề mặt men gốm/đất sét nghệ thuật mềm mịn. |
| **Vải Cotton / Nỉ (`Mat_Shirt`, `Mat_Pants`)** | Principled BSDF | Sheen Weight `0.55`, Sheen Roughness `0.5`, Roughness `0.80 - 0.88` | Bắt sáng nhung ở viền cạnh silhouette, bề mặt lì hoàn toàn như vải thật. |
| **Sọc thể thao / Viền áo (`Mat_Accent_White`)** | Principled BSDF | Base Color `#ffffff`, Roughness `0.75`, Sheen `0.4` | Sọc trắng thể thao nổi bật của Tùng. |
| **Da giày tây (`Mat_Leather_Shoe`)** | Principled BSDF | Base Color `#1f1e24`, Roughness `0.35`, Specular IOR Level `0.6` | Da giày bóng nhẹ lịch lãm của Giảng viên. |
| **Đế cao su / Giày thể thao (`Mat_Sneaker_Sole`)** | Principled BSDF | Base Color `#e8e6e1`, Roughness `0.60` | Đế cao su đúc dày dặn. |
| **Mắt kính (`Mat_Glass_Lens`)** | Principled BSDF | Transmission `0.90`, Roughness `0.08`, IOR `1.45` | Tròng kính trong suốt có phản xạ nhẹ. |

---

### 3.2. Nâng Cấp Hình Học Từng Nhân Vật (Geometry Details)

1. **Bàn tay cách điệu (Stylized Hands cho toàn bộ 5 nhân vật):**
   - Gồm lòng bàn tay bầu dục bo mịn + ngón cái nghiêng 35 độ hướng về phía trước, tạo tư thế buông thõng tự nhiên thay vì quả cầu bi tròn trơn.

2. **Nam (Bản thể thật):**
   - **Cổ áo:** Bo viền cổ tròn (Crewneck collar ring) màu xanh rêu sẫm ở chân cổ.
   - **Gấu áo & Ống tay:** Gấu áo oversize buông nhẹ phủ ngoài cạp quần, viền gấp ống tay áo.
   - **Dép:** Dép quai ngang ôm mu bàn chân với đế dép tách biệt.
   - **Tóc:** 8 lọn tóc xếp lớp mềm mại buông lòa xòa trước trán và 2 bên thái dương.

3. **Người Kia (Bản sao gương):**
   - Kế thừa toàn bộ cấu trúc hình học của Nam.
   - Lật đối xứng toàn bộ lọn tóc qua trục X (ngôi tóc lệch ngược hướng).
   - Giữ thuộc tính tay trái chủ đạo.

4. **Tùng (Vận động viên):**
   - **Cổ áo:** Bo cổ tròn thể thao viền sọc trắng tương phản (`#ffffff`).
   - **Áo thun cam:** 2 dải sọc trắng thể thao chạy viền quanh bắp tay.
   - **Quần đùi đen:** 2 dải sọc trắng thể thao chạy dọc bên sườn đùi ngoài.
   - **Giày:** Giày sneaker chạy bộ với đế cao su trắng dày và thân giày đỏ cam (`#b84028`).
   - **Tóc:** Tóc vuốt nhọn thể thao 3 tầng dựng đứng hướng ngược ra sau.

5. **Giảng viên (Lab 402):**
   - **Cổ áo sơ mi:** 2 vạt cổ bẻ sơ mi (Collar flaps) gập chéo quanh chân cổ.
   - **Nẹp cúc áo:** Nẹp vải chạy dọc ngực áo với 4 nút cúc áo nhỏ màu ngà.
   - **Thắt lưng:** Dải thắt lưng da đen viền quanh cạp quần kèm mặt khóa kim loại chữ nhật.
   - **Mắt kính:** Gọng kính đen mảnh bo góc tròn nhẹ, có cầu nối mũi, càng kính và tròng kính trong suốt.
   - **Quần & Giày:** Quần âu dài xếp ly thẳng thớm, giày tây đế có gót.

6. **Người Truy Vết (Series Investigator):**
   - **Mũ trùm đầu (Hoodie):** Mũ trùm phồng tự nhiên bao trọn gáy, vành mũ mở mặt hình ô-van, 2 dây rút mũ kim loại/vải rủ xuống ngực áo.
   - **Khóa kéo:** Đường viền răng khóa kéo kim loại chạy dọc chính giữa áo hoodie.
   - **Túi hộp:** 2 túi hộp vuông kèm nắp gập vát góc ở hai bên đùi quần cargo.
   - **Giày bốt:** Bốt dã chiến cổ cao đế dày.

---

### 3.3. Sàn Studio Vô Cực & Ánh Sáng Điện Ảnh

- **Sàn vô cực (Cyclorama):** Mặt sàn studio phẳng tiếp chân nhân vật tại $Z = 0$, uốn cong 90 độ mượt mà phía sau lưng làm phông nền màu xám ấm trung tính (`#252427`).
- **Hệ thống ánh sáng 3 điểm Chiaroscuro:**
  - *Key Light:* Đèn chiếu chính góc nghiêng 45 độ, ánh sáng ấm dịu (energy 4.5, radius 0.4 tạo bóng đổ tiếp đất siêu mềm).
  - *Fill Light:* Đèn bù sáng góc đối diện, sắc xanh dịu nhẹ (energy 1.8).
  - *Rim Light (Kicker):* Đèn chiếu ngược từ phía sau lưng, sắc vàng hổ phách (energy 3.8) tạo viền sáng tách bạch từng sợi tóc và bờ vai nhân vật khỏi phông nền.

---

## 4. Kế Hoạch Triển Khai & Kiểm Thử

1. **Cập nhật script dựng:** Sửa đổi `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/dung_stickman_cast.py` để đưa toàn bộ shader và hình học nâng cấp vào.
2. **Kiểm thử tự động:** Chạy `python -m unittest discover tests` bảo đảm toàn bộ 16 bài test toán học và logic phân cấp xương/thuộc tính nhân vật vẫn xanh 100%.
3. **Render kiểm chứng:** Chạy render Cycles xuất file ảnh độ phân giải cao 1920x1080 cho 4 góc nhìn (`truoc.png`, `goc34.png`, `sau.png`, `nghieng.png`).
4. **Cập nhật tài liệu & commit:** Cập nhật bộ sưu tập ảnh và đẩy lên nhánh `main`.
