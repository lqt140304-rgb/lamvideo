# Kế hoạch cổng gương (Mirror Portal) — Blender

Chốt 12/11/2026: nhân vật dựng 100% trong Blender (Modular: `dung_dau_nam.py` + thân/quần áo/xương IK), chiều cao chuẩn **1,60 m**; cửa, bàn, ghế, giường lấy theo mốc này. Tài liệu này là kế hoạch + trạng thái thực tế của chiếc gương trong cảnh phòng trọ. Mã: `cong_guong.py`, `xay_phong_tro.py` (`mirror()`, tham số `--guong`, `--proxy`).

## 1. Cách làm đã chọn: gương thật + cờ hiển thị theo loại tia

| Phương án | Kết quả thử | Quyết định |
|---|---|---|
| **A. Gương thật Cycles (glossy) + Ray Visibility theo vật** | Chạy tốt: phản chiếu phòng đúng quang học từ mọi góc máy (parallax, DoF, chữ đảo đúng kiểu gương), không render hai lượt. | **Dùng.** |
| B. Bản sao phản xạ của cả phòng đặt sau kính, ẩn/hiện bằng Light Path › Transparent Depth + Light Linking | Đã thử thật: vật liệu bọc, bản sao đèn, nâng transparent bounce 96/2000 vẫn ra đen sau kính (nghi do hàng trăm bề mặt trong suốt chồng nhau + ánh sáng); tốn kém, khó đoán. | Bỏ. Nếu sau này cần "đi xuyên gương" thật thì quay lại với dự án con riêng. |
| C. Camera phản xạ + render hai lượt ghép bằng mặt nạ | Chưa thử. Cần camera lệch tâm (off-axis) cho từng khung kính. | Để dành cho cảnh cần Người Kia diễn trong một "phòng khác" hoàn toàn khác phòng thật. |

### Điều khiển Người Kia độc lập với Nam (đã chạy)
- **Người Kia:** `Camera = ẩn`, `Glossy = hiện`, `Shadow/Diffuse/Transmission = ẩn` → chỉ thấy trong gương, không đổ bóng ra phòng thật. Hàm `cong_guong.only_in_mirror(objs)`.
- **Vị trí:** đặt ở điểm **đối xứng qua mặt gương** của chỗ muốn thấy trong kính (`reflect_point`). Anh ta là vật thật trong phòng nhưng vô hình với camera.
- **Nam:** `Glossy = ẩn` khi gương không được phản chiếu Nam (Người Kia chiếm kính). Hàm `hide_from_mirror(objs)`. Cờ này keyframe được (đổi từ phản chiếu thường sang diễn riêng).
- **Nốt ruồi / tay thuận:** phản xạ tự đảo trái–phải nên nốt ruồi trái của Nam hiện bên phải trong kính, khớp luật truyện. Người Kia dùng mesh riêng (nốt ruồi phải sẵn) thì khi đứng trong kính cần mesh đảo trục (scale −1 quanh trục gương) để trong ảnh nốt ruồi nằm bên phải đúng.
- **Chữ và đồng hồ:** không lật cả khung hình; chữ trong gương tự đảo vì là phản xạ thật.

Bằng chứng: `xem-thu/GUONG_XIEN_day.png` — gương dựng lại phòng (quạt, nệm), có Người Kia (hình nhân đỏ) chỉ hiện trong kính, còn Nam (hình nhân xanh) không hiện trong kính.

## 2. Thông số chiếc gương
- Cao ~1,22 × rộng 0,52 m (khung gỗ tối), đứng dựa tường cửa, **chân cách tường 16 cm, đỉnh tựa tường** (nghiêng 6°). Vị trí x ≈ 0,12 m trên tường cửa, y 3,0–3,52, cạnh cửa chính (y 2,05–2,90), không chặn tủ/lối giường. Cao vừa người 1,60 m (kính phủ từ hông tới đỉnh đầu khi đứng sát).
- Lỗi đã sửa: bản cũ nghiêng ngược nên nửa trên **xuyên vào tường** và chỉ thấy phần chân gương.
- Mặt kính `mat_guong`: kim loại phản xạ trắng xám (`vat_lieu.mirror_mat`). Cảnh cần gương mờ sương/nứt (P2.04): thêm bump/mask nứt góc phải + phủ roughness.

## 3. Các chế độ dùng
| Chế độ (`--guong`) | Dùng cho | Ghi chú |
|---|---|---|
| `real` | Mọi cảnh gương bình thường, Người Kia diễn riêng | Mặc định. Người Kia/Nam dùng cờ ray visibility. |
| `pov` | **Inside-Mirror POV** (camera sau kính nhìn ra: P2.04, P3.05) | `pov_trong_guong` ẩn khỏi camera mọi vật nằm hoàn toàn sau mặt gương (tường cửa, hành lang); sàn, trần, tường đối diện giữ nguyên nên vẫn thấy cả phòng thật. Ảnh: `GUONG_POV_day.png`. |

## 4. Việc còn lại cho gương
1. **Liquid Glass (P3.05):** shader mặt kính hóa nước: Displacement gợn sóng đồng tâm (Noise/Wave texture theo `Object` + keyframe), refraction IOR 1,33→1,5, Chromatic Aberration xanh buốt (tách kênh RGB trong compositor hoặc 3 lần IOR). Cần hoàn thành sau khi có Nam 3D để chắc cảnh "chìm".
2. **Gương nứt/mờ sương (P2.04):** texture mask nứt góc phải + roughness cục bộ.
3. **Vertigo (P3.03_03):** camera lùi trục Z đồng thời tăng tiêu cự 35→85 mm hướng vào gương; kiểm tra phản xạ ổn định không nhấp nháy ở 85 mm.
4. **Thay hình nhân bằng nhân vật Modular:** Nam (ẩn trong glossy khi cần) và Người Kia (chỉ glossy). Chốt vị trí đặt `Armature` và quy ước đặt tên để keyframe cờ hiển thị.
5. **Đo thời gian render** cảnh có gương + DoF (chưa đo; ảnh thử 1000 px, 48 mẫu mỗi ảnh khoảng nửa phút trên CPU).
6. **Trục máy:** `ORBIT_A/B/C` (vòng cung 180° qua mép kính cho P3.04) cần camera thật có path (Follow Path) hoặc Empty xoay; hiện chỉ có 3 khung cố định.

## 5. Tỷ lệ chuẩn 1,60 m
| Vật | Số hiện tại (m) | Ghi chú |
|---|---|---|
| Cửa chính | 0,85 × 2,10 | Không đổi (chuẩn thực tế); đỉnh đầu 1,60 m cách khung 50 cm. |
| Mặt bàn | 0,75 | Phù hợp ngồi ghế 0,45 (khuỷu ~0,70 với 1,60 m). |
| Ghế ngồi | ~0,45 | Có thể giữ. Chân chạm sàn ở 1,60 m (đùi khoảng 0,42–0,45). |
| Giường/nệm | 0,25 mặt nệm | Nệm sàn thấp; ngồi mép cho chân chạm sàn. |
| Gương | 1,22 cao | Phủ từ hông tới đỉnh đầu 1,60 m khi đứng sát. |
| Mắt đứng / ngồi | ~1,50 / ~1,15 | Dùng cho camera ngang tầm mắt. |
Cần kiểm lại khi có mesh Nam thật: thử chân–ghế–bàn, tay–tay nắm cửa (cao 1,0–1,03 m), tay–then cửa (1,12–1,27 m).
