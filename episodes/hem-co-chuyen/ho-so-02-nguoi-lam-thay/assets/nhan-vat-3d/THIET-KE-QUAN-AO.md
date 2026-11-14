# Thiết kế Quần Áo 3D cho Nam — Dáng Rộng (Oversized / Relaxed Fit)

**Mục tiêu:** Dựng hệ thống trang phục 3D cho model thân Control Cage (`Nam_Dau_Than`), giữ đúng tinh thần **Stylized 3D mềm mại** và **dáng rộng thoải mái (oversized / relaxed streetwear)** của sinh viên Việt Nam, tuyệt đối không bó sát cơ thể.

---

## 1. Phong cách Thời trang & Tỉ lệ Dáng Rộng (Silhouette)

### A. Áo (`Nam_Ao`) — Dáng Boxy / Drop-Shoulder
- **Vai rủ (Drop-shoulder):** Phần vai áo mở rộng ra ngoài khớp vai thật (`+2.2 cm` mỗi bên), tạo đường vai hơi xuôi và độ rủ tự nhiên.
- **Thân áo suông rộng:** Không bóp eo. Độ rộng tăng dần nhẹ từ ngực xuống gấu áo (`+1.8 cm` ở ngực $\to$ `+2.8 cm` ở bụng/eo $\to$ `+3.2 cm` ở gấu áo tại `z = 0.485 m`), trùm kín cạp quần và tạo khe hở không khí rõ rệt quanh thân.
- **Tay áo lửng rộng (Wide Half-Sleeve):** Ống tay áo rộng thoáng (`rx, ry ≈ 0.080–0.085 m`, khe hở quanh bắp tay `~2.5–3.0 cm`), kéo dài tới gần khuỷu tay (`z = 0.625 m`).
- **Cổ áo (`Nam_CoAo`):**
  - Áo phông (`xanh`, `ngu`, `xam-tui`): Vành bo cổ tròn dày dặn (`r = 0.008 m`), trễ nhẹ phía trước (`-Y`).
  - Áo đồng phục (`dong-phuc`): Cổ bẻ sơ mi (`Nam_CoSoMi`), nẹp cúc trước ngực với 4 cúc nổi, túi ngực trái có phù hiệu xanh (`#3f6aa1`).
  - Áo thể thao (`the-thao`): Cổ tim viền trắng kem (`#f6efe0`), viền bo ở gấu tay áo.
- **Độ dày vải:** Dùng modifier `Solidify` (`thickness = 0.003 m`, `offset = 1.0` hướng ra ngoài) + `Subdivision Surface` (level 2) để mép gấu áo, gấu tay áo có độ dày mềm mại, không mỏng như tờ giấy.

### B. Quần (`Nam_Quan`) — Dáng Ống Suông Rộng (Wide-Leg / Relaxed Straight)
- **Cạp & Hông:** Cạp quần nằm tại `z = 0.565 m` (được áo trùm lên), phần hông và đũng quần hạ thấp nhẹ (`z_hang_quan = 0.425 m`, thấp hơn háng thật `2.5 cm`) để tạo dáng quần rộng thoải mái, không hằn nếp bó.
- **Ống quần rộng:**
  - **Quần dài suông (`xanh`, `xam-tui`, `dong-phuc`):** Đùi và ống chân rộng đều (`rx, ry ≈ 0.095–0.105 m`, rộng hơn chân thật `~3.0–3.8 cm`), rủ thẳng tự nhiên từ đùi xuống mắt cá (`z = 0.120 m`).
  - **Quần đùi rộng (`ngu`, `the-thao`):** Ống rộng thoáng ngang trên gối (`z = 0.285 m`); riêng `the-thao` có dải sọc trắng chạy dọc hai bên hông.

### C. Dép (`Nam_Dep.L/.R`) — Dép Lê / Xỏ Ngón Đế Dày
- Đế dép bo tròn mềm (`z = 0.000..0.015 m`), quai chữ Y hoặc quai ngang ôm mu bàn chân bằng raycast BVH lên `Nam_BanChan` để không bao giờ chìm vào ngón chân.
- Khi mang dép, toàn bộ nhân vật (`Nam_Dau_Than`, `Nam_BanChan`, `Nam_Ao`, `Nam_Quan`) được nâng theo trục `+Z` đúng bằng chiều cao mặt đế (`0.015 m`) để giữ nguyên mặt sàn chuẩn `Z = 0`.

---

## 2. Danh mục 5 Bộ Trang Phục (`--outfit`)

| Mã `--outfit` | Tên bộ đồ | Màu Áo | Màu Quần | Chi tiết đặc trưng |
|---|---|---|---|---|
| `xanh` | **Thường nhật (Chính)** | Xanh rêu `#5c7a70` | Xám `#515451` | Cổ tròn bo `#4f6960`, quần dài ống suông rộng, dép lê `#425850` |
| `ngu` | **Đồ ngủ ở phòng** | Xám nhạt `#8a8783` | Xám đậm `#454746` | Cổ tròn rộng thoải mái, quần đùi rộng ngang gối |
| `xam-tui` | **Áo xám có túi** | Xám be `#a7a8a0` | Xám `#515451` | Túi ngực may nổi bên trái (`+X`), quần dài ống suông rộng |
| `dong-phuc` | **Đồng phục giảng đường** | Trắng kem `#f3f0e6` | Xanh than `#2f3b53` | Cổ bẻ sơ mi, nẹp cúc 4 nút, túi ngực trái + phù hiệu `#3f6aa1`, quần âu suông |
| `the-thao` | **Đồ thể thao** | Cam đất `#d4673f` | Than đen `#2c3138` | Viền cổ & viền tay trắng `#f6efe0`, quần đùi rộng sọc trắng hai bên |

---

## 3. Tiêu chuẩn Kiểm tra Tự động (`--check`)

Mỗi bộ trang phục khi dựng xong phải vượt qua các bài kiểm tra sau:
1. `cloth_exists`: Có đủ `Nam_Ao`, `Nam_Quan`, `Nam_Dep.L`, `Nam_Dep.R` trong collection `03_Clothes`.
2. `cloth_manifold`: Không có cạnh non-manifold (> 2 mặt), pháp tuyến hướng ra ngoài.
3. `cloth_no_clipping`: Dùng `BVHTree` kiểm tra **0 đỉnh nào của mặt trong áo/quần xuyên vào bên trong lưới `Nam_Dau_Than`**.
4. `cloth_loose_fit`: Khoảng hở trung bình từ bề mặt áo/quần tới thân nhân vật đạt chuẩn dáng rộng (`≥ 10 mm` ở thân, `≥ 15 mm` ở tay áo/ống quần).
