# Báo Cáo Đo Lường Quang Học & Kiểm Định Góc Máy 3D Trong Môi Trường Phòng Trọ
> **Vũ trụ:** *The Crack in Reality (Hẻm Có Chuyện)* — Hồ sơ 02: Người Trong Gương  
> **Mục tiêu:** Đo lường chính xác hình học, trường nhìn (Field of View - FOV), khoảng cách đặt máy (Camera Distance), độ che phủ khung hình (Framing Coverage) và tỷ lệ nhân vật trong không gian phòng trọ $15\text{m}^2$.

---

## 1. THÔNG SỐ HÌNH HỌC KHÔNG GIAN & NHÂN VẬT THỰC TẾ

| Đối tượng | Kích thước thực tế (3D Mesh) | Tọa độ không gian (cm) | Ghi chú kỹ thuật |
|---|---|---|---|
| **Căn phòng trọ** | Rộng $W = 460\text{cm}$ ($4.6\text{m}$)<br>Sâu $D = 380\text{cm}$ ($3.8\text{m}$)<br>Cao $H = 265\text{cm}$ ($2.65\text{m}$) | $x: [0, 460]$<br>$z: [0, 380]$<br>$y: [0, 265]$ | Tường trái $x=0$ (cửa chính $z: 170-260$); Tường phải $x=460$ (cửa sổ $z: 90-220$); Tường sau $z=0$. |
| **Nhân vật Nam / Người Kia** | Cao $H_{char} = 165\text{cm}$ ($1.65\text{m}$)<br>Rộng vai $W_{shoulder} = 51\text{cm}$ | Đứng: cao $165\text{cm}$<br>Ngồi ghế: cao $125\text{cm}$<br>Ngồi nệm: cao $95\text{cm}$ | Tỉ lệ cơ thể theo chuẩn Style B Chibi/Stylized ($1/3$ đầu, chân $63\text{cm}$). |
| **Nhân vật Tùng** | Cao $168\text{cm}$, vai $49\text{cm}$ | Đứng: $168\text{cm}$, ngồi bệt: $90\text{cm}$ | Dáng người lao động săn chắc hơn. |
| **Nệm ngủ đôi** | Rộng $200\text{cm} \times$ Dài $160\text{cm}$ | $x: [252, 452]$, $z: [215, 375]$ | Cao $20\text{cm}$ so với sàn gạch. |
| **Bàn học & Ghế** | Bàn: $114\text{cm} \times 70\text{cm} \times$ cao $65\text{cm}$<br>Ghế: $45\text{cm} \times 45\text{cm} \times$ cao $40\text{cm}$ | $x: [338, 452]$, $z: [0, 70]$ | Đặt sát góc tường sau–phải. |
| **Bồn rửa bát & Kệ bếp** | Bồn: $164\text{cm} \times 60\text{cm} \times$ cao $76\text{cm}$ | $x: [12, 176]$, $z: [0, 90]$ | Đặt sát góc tường sau–trái. |
| **Chiếc gương đứng** | Rộng $50\text{cm} \times$ Cao $150\text{cm}$ | $x: [180, 230]$, $z: [30, 40]$ | Đặt cạnh hông trái tủ quần áo. |

---

## 2. CÔNG THỨC QUANG HỌC VIRTUAL CAMERA 3D (CẢM BIẾN 36mm FULL-FRAME 2.39:1)

Khung hình chuẩn **2.39:1 Anamorphic Cinemascope** trên cảm biến $36\text{mm} \times 15.06\text{mm}$:
* **Góc nhìn ngang (Horizontal FOV):**
  $$HFOV = 2 \times \arctan\left(\frac{36}{2f}\right)$$
* **Góc nhìn dọc (Vertical FOV):**
  $$VFOV = 2 \times \arctan\left(\frac{15.06}{2f}\right)$$
* **Độ phủ khung hình ở khoảng cách $D_{cam}$ (m):**
  $$W_{frame} = D_{cam} \times \frac{36}{f}$$
  $$H_{frame} = D_{cam} \times \frac{15.06}{f}$$

### Bảng tra cứu thông số quang học theo các tiêu cự sử dụng trong phim:

| Tiêu cự Lens ($f$) | HFOV (Ngang) | VFOV (Dọc) | Kích thước khung hình ở $D = 1.0\text{m}$ | Kích thước khung hình ở $D = 2.5\text{m}$ | Kích thước khung hình ở $D = 3.5\text{m}$ |
|:---:|:---:|:---:|:---:|:---:|:---:|
| **24mm** (Ultra-Wide) | $73.74^\circ$ | $34.82^\circ$ | Rộng $1.50\text{m} \times$ Cao $0.63\text{m}$ | Rộng $3.75\text{m} \times$ Cao $1.57\text{m}$ | Rộng $5.25\text{m} \times$ Cao $2.20\text{m}$ |
| **28mm** (Wide Cine) | $65.47^\circ$ | $30.10^\circ$ | Rộng $1.29\text{m} \times$ Cao $0.54\text{m}$ | Rộng $3.21\text{m} \times$ Cao $1.34\text{m}$ | Rộng $4.50\text{m} \times$ Cao $1.88\text{m}$ |
| **35mm** (Story Prime) | $54.43^\circ$ | $24.27^\circ$ | Rộng $1.03\text{m} \times$ Cao $0.43\text{m}$ | Rộng $2.57\text{m} \times$ Cao $1.08\text{m}$ | Rộng $3.60\text{m} \times$ Cao $1.51\text{m}$ |
| **40mm** (Medium Wide) | $48.45^\circ$ | $21.30^\circ$ | Rộng $0.90\text{m} \times$ Cao $0.38\text{m}$ | Rộng $2.25\text{m} \times$ Cao $0.94\text{m}$ | Rộng $3.15\text{m} \times$ Cao $1.32\text{m}$ |
| **50mm** (Standard Prime) | $39.60^\circ$ | $17.10^\circ$ | Rộng $0.72\text{m} \times$ Cao $0.30\text{m}$ | Rộng $1.80\text{m} \times$ Cao $0.75\text{m}$ | Rộng $2.52\text{m} \times$ Cao $1.05\text{m}$ |
| **65mm** (Portrait Tele) | $30.90^\circ$ | $13.20^\circ$ | Rộng $0.55\text{m} \times$ Cao $0.23\text{m}$ | Rộng $1.38\text{m} \times$ Cao $0.58\text{m}$ | Rộng $1.94\text{m} \times$ Cao $0.81\text{m}$ |
| **85mm** (Macro Tele) | $23.80^\circ$ | $10.10^\circ$ | Rộng $0.42\text{m} \times$ Cao $0.18\text{m}$ | Rộng $1.06\text{m} \times$ Cao $0.44\text{m}$ | Rộng $1.48\text{m} \times$ Cao $0.62\text{m}$ |

---

## 3. ĐO LƯỜNG ĐỘ ĐẦY ĐỦ & ĐỘ RỘNG THEO TỪNG CỤM SHOT MÁY TRỌNG YẾU

### 3.1. Cụm Toàn Cảnh Phòng Trọ (Wide Room Shots: S01_03, S05_09, S11_12)
* **Yêu cầu dàn cảnh:** Bao quát được chiếc nệm, bàn học, tủ quần áo, bồn rửa bát và cánh cửa.
* **Vị trí đặt Camera 3D:** Đặt tại góc chéo chân nệm ($x \approx 420\text{cm}, z \approx 360\text{cm}, y = 140\text{cm}$), hướng chéo về phía bếp và cửa ($x \approx 50\text{cm}, z \approx 80\text{cm}$).
* **Khoảng cách trục ngắm ($D_{cam}$):**
  $$D_{cam} = \sqrt{(420 - 50)^2 + (360 - 80)^2} = \sqrt{370^2 + 280^2} = \sqrt{136900 + 78400} = \sqrt{215300} \approx 464\text{cm} = 4.64\text{m}$$
* **Đo lường với Lens 24mm & 35mm:**
  * Với **Lens 24mm** ở $D = 4.64\text{m}$:
    $$W_{frame} = 4.64 \times \frac{36}{24} = 6.96\text{m}$$
    $$H_{frame} = 4.64 \times \frac{15.06}{24} = 2.91\text{m}$$
    $\to$ Độ rộng khung hình $6.96\text{m} > 4.6\text{m}$ (chiều rộng phòng). Khung hình bao quát trọn vẹn 100% căn phòng mà **hoàn toàn không bị hụt mép**.
  * Với **Lens 35mm** ở $D = 4.64\text{m}$:
    $$W_{frame} = 4.64 \times \frac{36}{35} = 4.77\text{m}$$
    $$H_{frame} = 4.64 \times \frac{15.06}{35} = 2.00\text{m}$$
    $\to$ Độ rộng $4.77\text{m}$ ôm khít chiều rộng phòng $4.6\text{m}$, chiều cao $2.0\text{m}$ lấy trọn từ sàn đến mép quạt trần, loại bỏ khoảng trống thừa trên trần nhà, tạo cảm giác ngột ngạt chuẩn điện ảnh!
* **Kết luận:** **ĐỦ ĐỘ RỘNG TUYỆT ĐỐI.**

---

### 3.2. Cụm Góc Sàn Thấp Đóng Chân Gương & Búa Rơi (Floor-Level: S01_06, S10_04, S11_05)
* **Yêu cầu dàn cảnh:** Thấy chân gương gỗ cập kênh, tay Nam cầm búa sắt gõ cộc cộc, và khoảnh khắc búa sắt rơi đánh KENG cạnh vũng nước.
* **Vị trí đặt Camera 3D:** Đặt sát mặt sàn ($y = 12\text{cm} - 15\text{cm}$), cách chân gương / vị trí búa rơi $D = 1.2\text{m} - 1.5\text{m}$.
* **Đo lường với Lens 28mm & 35mm:**
  * Ở $D = 1.3\text{m}$ với **Lens 28mm**:
    $$W_{frame} = 1.3 \times \frac{36}{28} = 1.67\text{m}$$
    $$H_{frame} = 1.3 \times \frac{15.06}{28} = 0.70\text{m} = 70\text{cm}$$
  * Chiều cao Nam khi quỳ gối gõ búa: $H_{kneel} \approx 65\text{cm}$.
  * Chiều rộng vùng thao tác (chân gương $50\text{cm}$ + búa $30\text{cm}$ + tay Nam $40\text{cm}$): $120\text{cm} < 167\text{cm}$.
* **Kết luận:** Khung hình $167\text{cm} \times 70\text{cm}$ bao trọn từ đầu gối, cánh tay vung búa đến chân gương chạm sàn, bóng tiếp xúc (Contact Shadow) bám cực chắc vào gạch men. **KHÔNG BỊ CẮT CỤT ĐẦU HAY BÚA.**

---

### 3.3. Cụm Bồn Rửa Bát & Quay Mặt 180° Đối Diện Bản Sao (S02_01, S02_02, S02_05)
* **Yêu cầu dàn cảnh:** Bắt trọn bờ vai áo thun xanh của Người Kia đang rửa bát, quay đầu $180^\circ$ để lộ nốt ruồi bên phải và gương mặt giống hệt Nam.
* **Vị trí đặt Camera 3D:** Đặt tại lối đi cách bồn rửa $D = 2.2\text{m}$, chiều cao ngang vai $y = 135\text{cm}$.
* **Đo lường với Lens 35mm & 50mm:**
  * Ở $D = 2.2\text{m}$ với **Lens 35mm** (S02_01 - OTS qua vai Nam):
    $$W_{frame} = 2.2 \times \frac{36}{35} = 2.26\text{m}$$
    $$H_{frame} = 2.2 \times \frac{15.06}{35} = 0.95\text{m} = 95\text{cm}$$
    $\to$ Lấy trọn Nam từ thắt lưng lên đỉnh đầu ở tiền cảnh và toàn bộ bồn rửa bát dài $1.64\text{m}$ ở hậu cảnh.
  * Ở $D = 1.8\text{m}$ với **Lens 50mm** (S02_02 - Reverse Orbit quay mặt):
    $$W_{frame} = 1.8 \times \frac{36}{50} = 1.30\text{m}$$
    $$H_{frame} = 1.8 \times \frac{15.06}{50} = 0.54\text{m} = 54\text{cm}$$
    $\to$ Chiều rộng vai Người Kia $51\text{cm}$ chiếm đúng $40\%$ chiều ngang khung hình (tỉ lệ vàng đối thoại điện ảnh). Phần còn lại là giá bát và ánh sáng cửa sổ.
* **Kết luận:** **TỈ LỆ NHÂN VẬT HOÀN HẢO, KHÔNG BỊ TRÀN VIỀN.**

---

### 3.4. Cụm Góc Trần Vuông Góc 90° Top-Down (Bird's Eye: S05_10)
* **Yêu cầu dàn cảnh:** Camera trên trần nhìn vuông góc xuống chiếc nệm đôi ($2.0\text{m} \times 1.6\text{m}$) thấy Nam nằm co quắp cày game, vỏ mì, chai nước tăng dần theo thời gian.
* **Khoảng cách độ cao ($D_{cam}$):**
  * Trần nhà cao $H = 265\text{cm}$. Mặt nệm cao $20\text{cm}$.
  * Nếu camera đặt sát trần trong nhà: $D_{cam} = 265 - 20 = 245\text{cm} = 2.45\text{m}$.
* **Đo lường với Lens 24mm:**
  $$W_{frame} = 2.45 \times \frac{36}{24} = 3.675\text{m}$$
  $$H_{frame} = 2.45 \times \frac{15.06}{24} = 1.537\text{m}$$
* **Phân tích rủi ro & Giải pháp:**
  * Chiếc nệm rộng $1.6\text{m}$ theo trục dọc, trong khi $H_{frame} = 1.54\text{m}$ $\to$ Nếu đặt camera trong trần kín, mép trên gối hoặc mép dưới chân nệm có thể bị liếm sát viền (chênh lệch $6\text{cm}$).
  * **Giải pháp 3D tối ưu:** Kích hoạt tính năng **Tháo trần nhà (Ceiling Backface Culling)**, nâng Virtual Camera 3D lên độ cao $y = 310\text{cm}$ ($D_{cam} = 2.9\text{m}$):
    $$W_{frame} = 2.9 \times \frac{36}{24} = 4.35\text{m}$$
    $$H_{frame} = 2.9 \times \frac{15.06}{24} = 1.82\text{m}$$
    $\to$ Chiều cao $1.82\text{m} > 1.6\text{m}$ (chiều dài nệm) dư $22\text{cm}$ viền sàn gạch xung quanh! Thấy trọn vẹn Nam nằm dài, đôi dép tổ ong dưới chân và đống rác sinh hoạt.
* **Kết luận:** **CẦN KÍCH HOẠT THÁO TRẦN CHO SHOT TOP-DOWN ĐỂ KHUNG HÌNH THOÁNG ĐẸP NHẤT.**

---

### 3.5. Cụm Macro Hero Props & Soi Căn Cước (S01_01, S01_07, S10_02)
* **Yêu cầu dàn cảnh:** Đọc rõ chữ trên màn hình điện thoại, đọc được note thuốc khớp của mẹ, và thấy rõ 2 nốt ruồi đối xứng trên thẻ CCCD vs clip Zalo.
* **Khoảng cách lấy nét vật lý:** $D_{cam} = 0.5\text{m} - 0.7\text{m}$.
* **Đo lường với Lens 85mm Macro ($f/1.4$):**
  * Ở $D = 0.6\text{m}$:
    $$W_{frame} = 0.6 \times \frac{36}{85} = 0.254\text{m} = 25.4\text{cm}$$
    $$H_{frame} = 0.6 \times \frac{15.06}{85} = 0.106\text{m} = 10.6\text{cm}$$
  * Chiếc thẻ CCCD chuẩn ISO ($8.56\text{cm} \times 5.398\text{cm}$) đặt cạnh màn hình điện thoại ($7\text{cm} \times 14\text{cm}$):
    * Tổng bề ngang 2 vật thể: $8.56 + 1.5\text{cm (khoảng cách)} + 7 = 17.06\text{cm} < 25.4\text{cm}$.
    * Chiều cao $10.6\text{cm}$ vừa vặn bao trọn khuôn mặt trên thẻ và khuôn mặt trong clip.
* **Kết luận:** Hai bức ảnh thẻ và clip nằm trọn vẹn cạnh nhau trong khung hình 2.39:1, khán giả nhìn thấy rõ mồn một **nốt ruồi mắt trái trên thẻ thật và nốt ruồi mắt phải trong clip** mà không cần lia máy!

---

### 3.6. Cụm Đối Chất Sinh Tử & Khế Ước Mặt Kính Hóa Nước (S11_01, S11_07, S11_09, S11_11)
* **Yêu cầu dàn cảnh:**
  1. Thấy Người Kia đứng trước gương với vết nứt rỉ nước lạnh đầm đìa.
  2. Bắt cận bàn tay Nam áp vào tay Người Kia trên mặt kính hóa lỏng.
  3. Góc nhìn từ bên trong gương nhìn ngược ra (Submersion POV).
* **Vị trí chiếc gương:** Chiếc gương cao $1.5\text{m}$, rộng $0.5\text{m}$. Khoảng trống từ gương đến mép bàn học là $1.4\text{m}$, đến cửa là $2.0\text{m}$.
* **Đo lường góc máy:**
  * **Shot S11_01 (Lens 50mm, $D = 2.4\text{m}$):**
    $$W_{frame} = 2.4 \times \frac{36}{50} = 1.72\text{m}$$
    $$H_{frame} = 2.4 \times \frac{15.06}{50} = 0.72\text{m}$$
    $\to$ Khung hình lấy từ thắt lưng lên đỉnh đầu Người Kia ($H \approx 70\text{cm}$), bao trọn ngực, cổ, má nứt nẻ và ánh hoàng hôn đỏ rực chiếu xiên.
  * **Shot S11_09 (Lens 85mm Macro, $D = 0.5\text{m}$):**
    $$W_{frame} = 0.5 \times \frac{36}{85} = 21.1\text{cm}$$
    $$H_{frame} = 0.5 \times \frac{15.06}{85} = 8.8\text{cm}$$
    $\to$ Bắt trọn 2 bàn tay úp vào nhau qua mặt kính, hiệu ứng đổi màu thân nhiệt và dòng xoáy thủy ngân lỏng cuốn chặt cổ tay.
  * **Shot S11_11 (Lens 35mm Cine, Camera đặt bên trong thế giới gương $z = -0.8\text{m}$ nhìn ra $z = 0$):**
    $$W_{frame} = 1.5 \times \frac{36}{35} = 1.54\text{m}$$
    $\to$ Bao trọn toàn bộ khung gương $50\text{cm}$, thấy rõ thân xác Nam chìm xuyên qua làn nước gương lạnh buốt.
* **Kết luận:** **HOÀN TOÀN TƯƠNG THÍCH KHÔNG GIAN VẬT LÝ.**

---

## 4. TỔNG KẾT VÀ 3 NGUYÊN TẮC KHÓA BẢN DỰNG CHO ANIMATOR

1. **Không có shot nào bị lỗi lùi camera xuyên tường (No Wall Clipping):**  
   Mọi cú máy toàn cảnh đều sử dụng lens $24\text{mm} - 35\text{mm}$ với cự ly tối đa $D_{max} = 4.6\text{m}$ (trục đường chéo phòng $4.64\text{m}$), camera luôn nằm gọn bên trong ranh giới 4 bức tường.
2. **Kích hoạt tính năng Tháo trần (Ceiling Culling) cho 2 shot Top-down:**  
   Các shot S05_10 và G04 đặt camera ở độ cao $y = 3.1\text{m}$ (vượt trần $45\text{cm}$) để nệm ngủ và rác sinh viên có lề thở $20\text{cm}$ hai bên, không bị gò bó.
3. **Tuân thủ quy tắc 1/3 (Rule of Thirds) cho khung hình 2.39:1 Cinemascope:**  
   Tỉ lệ 2.39:1 có bề ngang rất rộng; khi đối thoại đơn (Single OTS), luôn đặt nhân vật ở trục 1/3 bên trái hoặc bên phải, để 2/3 không gian còn lại phô diễn chiều sâu căn phòng trọ và sự ngột ngạt của bối cảnh.
