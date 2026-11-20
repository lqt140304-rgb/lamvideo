# Model Nhân Vật 3D — Hồ sơ 02: Người Trong Gương

> **Quyết định chuyển đổi hiện hành — 17/11/2026:** Dự án đã chuyển đổi toàn bộ dàn nhân vật sang **Stickman 3D tối giản (Kiểu B: Đầu tròn + Thân viên nang + Tay chân ống)** theo [QUY-CHUAN-STICKMAN.md](../../../docs/QUY-CHUAN-STICKMAN.md) và [Design Spec](../../../docs/superpowers/specs/2026-11-17-thiet-ke-nhan-vat-stickman-design.md).
> Nguồn sinh 3D hiện hành: `dung_stickman_cast.py` và `stickman_math.py`.
> Toàn bộ phần tài liệu và mã nguồn bên dưới (`dung_than_cage_nam.py`, `dung_dau_nam.py`, `dung_tay_nam.py`, `dung_quan_ao_nam.py`) được **bảo toàn làm tư liệu tham khảo lịch sử** cho thông số chiều cao 1,60 m và màu sắc trang phục.

> **Quy chuẩn mỹ thuật:** Stylized 3D Cinema (Style B mềm mại, PBR Toon), kế thừa nhận diện nhân vật đã chốt từ bản mẫu 2D/2.5D nhưng dựng hoàn toàn trong Blender 3D (đơn vị mét, hệ toạ độ chuẩn Blender Z-up, nhân vật nhìn về $-Y$).


---

## 1. Tổng quan Kiến trúc Model 3D (Modular Pipeline)

Nhân vật Nam và Người Kia (Bản sao) được thiết kế theo cấu trúc **Mô-đun hóa (Modular)** độc lập để dễ dàng bảo trì, kiểm thử và thay thế:

```
[ Cum_Dau ] (dung_dau_nam.py)
    ├── Head_Base (Mesh nửa mặt + Mirror + Subsurf)
    ├── Mắt / Mí / Hốc mắt / Con ngươi (Mặt nạ mesh-deform)
    ├── Lông mày / Mũi / Miệng / Tai
    └── Tóc (Mũ tóc nền + 3 dải tóc mái bản to + chỏm Bézier xoăn đỉnh)
            │
            ▼ (Dải nối cổ: 48 đỉnh thân ── Quạt tam giác 192 mặt ── 144 đỉnh đầu)
[ Nam_Dau_Than ] (dung_than_cage_nam.py)
    ├── Thân Control Cage (9 mức lát cắt: co, chan_co, vai, nguc, duoi_nguc, bung, eo, chau, day_chau)
    ├── Lỗ nách 8 cạnh (nghiêng 45° chống xoắn gập khi hạ tay)
    ├── Bàn tay 5 ngón riêng (dung_tay_nam.py - tự hiệu chỉnh nắm fist và cầm nắm)
    └── Bàn chân riêng (khối nêm bo tròn 5 ngón, đế phẳng, lồng ống chân)
            │
            ▼ (Ráp xương & Điều khiển)
[ Armature / Rig ] (rig_nam.py)
    ├── Khung xương biến dạng: Spine, Chest, Neck, Neck2, Head, Shoulders, Arms, Legs
    ├── Điều khiển IK: Chan_IK (chân + gót), Pole_knee (hướng gối), Root
    ├── Điều khiển bàn tay: Fist (0..1) cuộn theo trục Z lái 5 ngón
    ├── Điều khiển mặt: Brow.L/R, Eye.L/R (hướng nhìn liếc), Shape keys mí/mày/miệng/má
    └── Trọng số tự động (Bone Heat) + NumPy Smoothing + Corrective Smooth
```

---

## 2. Thông số Kỹ thuật Chuẩn của Model

| Thông số | Giá trị chuẩn | Ghi chú kỹ thuật |
|---|---|---|
| **Chiều cao tổng thể** | **1,60 m** (1.6009 m) | Đáy sàn: $-0.0007\text{ m}$, Đỉnh chỏm tóc: $+1.6003\text{ m}$. Cửa phòng, bàn, ghế đều chuẩn hóa theo mốc 1,60 m |
| **Độ khớp silhouette mẫu** | **$\le \pm 5\text{ mm}$** | Mặt trước lệch $\pm 2$ đến $5\text{ mm}$, mặt nghiêng lệch $\le \pm 3\text{ mm}$ so với Model Sheet gốc |
| **Cấu trúc Cage thân** | 9 mức (nửa vòng 7 đỉnh) | `co` (0.916m), `chan_co` (0.880m), `vai` (0.835m), `nguc` (0.690m), `duoi_nguc`, `bung` (0.630m), `eo` (0.580m), `chau` (0.525m), `day_chau` (0.475m) |
| **Khớp nối Cổ** | 48 đỉnh thân $\to$ 144 đỉnh đầu | Sau Subdivision 2, thân có 48 đỉnh, vòng cắt đầu có 144 đỉnh ($r=3$). Nối bằng quạt tam giác 192 mặt: $0$ cạnh hở, $0$ tự giao, thể tích dương |
| **Khe nách & Khe háng** | Nách: $6.7\text{ mm}$, Háng: $44.5\text{ mm}$ | Đảm bảo nách và háng không dính lưới khi hạ tay hoặc đứng thẳng |
| **Bàn tay** | 5 ngón tách rời | Chiều dài ~175 mm, ngón cái vắt ngang tự nhiên, ngón thon tròn dạng chibi-soft |
| **Bàn chân** | 5 ngón rõ nét | Chiều dài 266 mm, đế phẳng tiếp xúc sàn $Z=0$, gót và mu bàn chân bo tròn |
| **Lỗi tự giao lưới** | **$0$ cặp mặt tự giao** | Đạt chuẩn `self_hits == 0` qua kiểm tra BVH |

---

## 3. Quy tắc Sinh học & Nhận diện Bắt buộc (Invariants)

Cả hai nhân vật dùng chung 100% hình khối thân và đầu, nhưng phân định tuyệt đối qua 2 đặc điểm sinh học:

| Đặc điểm | Nam (Bản thể thật) | Người Kia (Bản sao trong gương) |
|---|---|---|
| **Vị trí nốt ruồi** | **Dưới đuôi mắt TRÁI** | **Dưới đuôi mắt PHẢI** (phản chiếu gương) |
| **Thuận tay** | **Thuận tay PHẢI** | **100% Thuận tay TRÁI** (cầm búa, rửa bát, xách đồ, ký tên, gài then) |
| **Đặc điểm cơ thể** | Thân nhiệt $37^\circ\text{C}$, da ấm bình thường | Tay lạnh buốt, gáy và bả vai có vết nứt rỉ nước lạnh dưới trăng |
| **Biểu cảm chủ đạo** | Ngái ngủ, mệt mỏi, hoảng loạn, suy sụp | Điềm tĩnh cơ học (`calm`), ánh nhìn bất động, nụ cười bí hiểm |

---

## 4. Danh mục File Nguồn & Công dụng

| Tệp nguồn | Vai trò chính | Trạng thái hiện hành |
|---|---|---|
| [dung_than_cage_nam.py](dung_than_cage_nam.py) | Dựng thân bằng Control Cage 9 mức, ráp với bản sao đầu, xuất `Nam_Dau_Than` | **Hoàn thành (Đạt hình khối tĩnh)**, vượt qua toàn bộ test `check_all` |
| [dung_quan_ao_nam.py](dung_quan_ao_nam.py) | Dựng 5 bộ quần áo 3D dáng rộng (`xanh`, `ngu`, `xam-tui`, `dong-phuc`, `the-thao`) + dép lê bọc ngoài thân cage | **Mới hoàn thành**, kiểm tra tự động chống xuyên thân bằng BVH (`--check`) |
| [dung_dau_nam.py](dung_dau_nam.py) | Dựng đầu, tóc lọn, mắt, mí, mày, miệng theo hướng modular | **Đã duyệt**, tròng mắt dùng mặt nạ mesh-deform chống tràn |
| [dung_tay_nam.py](dung_tay_nam.py) | Dựng bàn tay riêng 5 ngón, kiểm tra va chạm ngón khi nắm | **Hoàn thành**, hỗ trợ tư thế mở tay và nắm đấm (`fist`) |
| [rig_nam.py](rig_nam.py) | Tạo Armature toàn thân, IK chân, Corrective Smooth, test 6 tư thế | **Đang hoàn thiện**, đã sửa nách chữ V và khớp xoay cổ |
| [dat_nam_vao_phong.py](dat_nam_vao_phong.py) | Nạp nhân vật vào bối cảnh phòng trọ 3D để kiểm tra tỷ lệ và bóng đổ | **Hoạt động tốt**, render kiểm tra tương tác phòng |
| [KET-QUA-THAN-CAGE.md](KET-QUA-THAN-CAGE.md) | Báo cáo đo lường quang học, bảng số đo thực và độ lệch silhouette | **Tài liệu bàn giao chính thức** của thân cage |
| [dung_nam.py](dung_nam.py) | Bản dựng Metaball cũ kèm trang phục áo/quần/dép | Giữ làm tư liệu tham chiếu trang phục và lịch sử |

---

## 5. Hiện trạng & Lộ trình Quần Áo (Outfits)

### A. Hiện trạng
* Mesh mới nhất (`Nam_Dau_Than`) hiện đang ở dạng **thân trần / đất sét (Clay Base)** để tập trung tối ưu hóa hình khối giải phẫu và độ biến dạng của khớp xương (nách, cổ, đùi, cổ tay).
* Phần quần áo 3D trước đây mới chỉ có ở bản metaball cũ (`dung_nam.py`: `Nam_Ao`, `Nam_CoAo`, `Nam_Quan`, `Nam_Dep`).

### B. 5 Bộ Trang Phục Chuẩn (sẽ dựng thành mesh bọc ngoài thân cage)
Theo thiết kế chuẩn đã khóa trong kịch bản và bản 2.5D ([nhan-vat.tsx](../nhan-vat.tsx)):

1. **`xanh` (Thường nhật):** Áo phông cộc tay xanh rêu (`#5c7a70`), quần dài/lửng xám (`#515451`), dép lê xanh sẫm (`#425850`).
2. **`ngu` (Ở phòng):** Áo ngủ xám nhạt (`#8a8783`), quần cộc mềm.
3. **`xam-tui` (Đi học / Ra ngoài ngày 2):** Áo phông xám có túi ngực may nổi bên trái (`#a7a8a0`) để giữ điện thoại.
4. **`dong-phuc` (Giảng đường):** Áo sơ mi trắng cộc tay có cổ (`#f3f0e6`), nẹp cúc trước ngực, túi ngực có phù hiệu xanh (`#3f6aa1`), quần âu xanh than (`#2f3b53`).
5. **`the-thao` (Đá bóng / Tùng & Nam):** Áo thun thể thao màu cam cổ tim viền trắng (`#d4673f`), quần đùi sọc trắng (`#2c3138`), tất lửng trắng.

---

## 6. Lệnh Chạy Kiểm Thử (CLI)

Chạy trong môi trường đã cài Blender (Blender 4.x khuyến nghị):

```bash
# 1. Kiểm tra toàn bộ ràng buộc kỹ thuật của thân cage:
blender -b --factory-startup --python dung_than_cage_nam.py -- --check

# 2. Xuất bộ ảnh bàn giao đối chiếu silhouette (cần ảnh mẫu):
blender -b --factory-startup --python dung_than_cage_nam.py -- \
  --check \
  --render render-than/cage/giao \
  --blend render-than/cage/Nam_than_dau.blend \
  --mau <duong_dan_anh_mau> \
  --samples 32

# 3. Đặt nhân vật vào bối cảnh phòng trọ 3D:
blender -b --factory-startup --python dat_nam_vao_phong.py -- \
  --phong-dir ../boi-canh-3d \
  --nam-blend render-than/cage/Nam_than_dau.blend \
  --out render-than/trong_phong.png \
  --samples 48

# 4. Kiểm tra hệ thống Rigging và các dáng thử:
blender -b --factory-startup --python rig_nam.py -- --test
```

## Kiểm khớp stickman và cảnh mở đầu trên bối cảnh thật (20/11/2026)

- **Khớp stickman trước khi sửa:** mỗi mesh gắn 100% vào MỘT xương: ống tay (`Body_*_Arm_*`) chỉ vào `upper_arm`, ống chân (`Body_*_Leg_*`) chỉ vào `thigh` → khuỷu và gối không gập (cẳng tay/cẳng chân đi như một ống thẳng cùng cánh tay trên/đùi); ống quần gắn `pelvis` nên không theo chân; và **chân phải bị gắn vào đùi trái** vì điều kiện `"_l" in name` cũng khớp `_leg`. Sửa trong `bind_stickman_to_armature`: nhận bên trái/phải theo token cuối của tên; tay/chân/tay áo/ống quần có trọng số theo độ cao dọc chi, pha mượt ±4,5 cm quanh khuỷu/gối/cổ tay/cổ chân. Đo FK sau sửa: gập khuỷu 100°, gối 100° kéo cẳng đi 49–59 cm, 0 cạnh giãn >2× (max 1,13×); chân phải theo đùi phải. Cổ/đầu vẫn một khối cứng theo xương (đầu tròn, chấp nhận).
- **Nam nằm lệch khỏi giường:** `dung_canh_opening_30s.py` dùng **sàn phẳng + giường tự tạo** (bối cảnh giả) với toạ độ thiết kế như toạ độ thế giới, trong khi phòng thật phản chiếu trục x (`x_tg = 3 − x_tk`): nệm thật ở x 0,02–1,42 còn Nam đặt ở x 2,05. Cảnh mới `dung_canh_that_opening.py` dùng `xay_phong_tro.build()` (phòng thật, đêm, laptop xanh) và đặt Nam nằm ngửa trên nệm thật, đầu trên gối (chăn thật ẩn); render thử camera `BED` (chưa dựng lại cả 720 khung, chưa có Người Kia/gương thật, chưa chuyển động).
- Bỏ ngón: bài kiểm `test_hand_geometry_naming` đổi theo (không còn `Thumb`).
