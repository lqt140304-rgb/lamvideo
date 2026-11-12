# Danh sách shot camera — Hồ sơ 02 (phòng trọ + hành lang)

Nguồn nội dung: [DUNG-CANH.md](../../DUNG-CANH.md) (bảng MAY-A…H, MAY-P2, MAY-P3) + [QUY-CHUAN-3D.md](../../../../../docs/QUY-CHUAN-3D.md). File này **gắn từng shot vào một camera Blender có tên** trong `xay_phong_tro.py` (`CAMERAS`) để dựng/kiểm khung hình ngay khi chưa có nhân vật. Phạm vi theo quyết định 12/11: **phòng trọ 3 × 4 m + hành lang**; shot ở giảng đường/hành lang trường nằm ngoài phạm vi (mục 4).

Chạy 1 máy (thêm `--figure x,y[,cao]` để đặt người chuẩn 1,60 m kiểm khung): `python xay_phong_tro.py --mode day|night --cam <TÊN> --out ảnh.png [--guong real|pov] [--proxy]`. Bảng khung hình: `chay_shot.sh` (→ `xem-thu/shot/`). Người đóng (1,60 m) chưa có nên khung chỉ để kiểm bố cục; mắt đứng 1,50 m, mắt ngồi 1,15 m.

## 1. Chuẩn máy chung
- Sensor 36 mm full-frame, khung **2.39:1** (1280 × 536 xem thử). Tiêu cự ghi trong bảng; chuyển động/handheld/DoF thêm ở bước hoạt cảnh.
- **3D-0 handheld:** Noise `0,2 Hz`, xoay `0,05°–0,15°`; xung va chạm tắt dần 0,2 s. **Dutch:** nghiêng 5°–15° bằng Roll của camera. **Rack focus:** keyframe `Focus Distance` theo toạ độ vật (chênh ≥ 0,5 m).
- Camera gương dùng `--guong real`; camera POV trong gương (`GUONG_POV`) dùng `--guong pov`.
- Ánh sáng: ngày = nắng cửa sổ + hắt; đêm = laptop xanh 6500 K là nguồn chính + tuýp hành lang ấm 4000 K (tuýp phòng tắt).

## 1b. Quy ước cỡ cảnh (hướng A, chốt 12/11)
| Cỡ cảnh | Tiêu cự | Ghi chú |
|---|---|---|
| **Toàn thân** | ≤ 22–24 mm, máy cách ≥ 2,6–2,9 m | Máy thường ngoài tường (tường chắn ẩn khỏi camera). Camera: `TT_GIUONG`, `TT_BEP`, `TT_GUONG`, `TT_CUA`, `TT_BAN`, `WIDE`, `BED`, `LOW`. |
| **Trung** (đầu gối/hông trở lên) | 28–40 mm | A01, A02B, A03, C06, GUONG, KITCHEN, DOOR, ORBIT_*: giữ lens cũ nhưng không đòi trọn người. |
| **Cận/vật thể** | ≥ 50 mm | A02, A04, A04B, C05, P203, GUONG_VAI. |
Bảng dưới ghi "Camera Blender" theo lens gốc; muốn toàn thân của cùng cảnh thì thêm camera `TT_*` tương ứng.

## 2. Shot trong phòng trọ
| Mã shot | Cảnh / ý đồ | Camera Blender | Tiêu cự | Chế độ máy | Cần gì thêm |
|---|---|---|---|---|---|
| A01 | OTS từ bồn rửa sang nệm; Người Kia quay lưng tiền cảnh mờ | `A01` | 35 | 3D-0 + 3D-5 rack focus f/1.8 | Nam ngủ trên nệm, bọt xà phòng/bát |
| A02 | Sát gối: màn hình báo thức → mí mắt Nam | `A02` | 65 Macro | 3D-5 | Điện thoại báo thức, ánh khe cửa sổ |
| A02B | Chéo 45° từ chân giường, Nam ngồi dậy xỏ dép | `A02B` | 40 | 3D-0 + dịch phải | Độ lún nệm, dép, bóng tiếp đất |
| A03 | OTS sau vai Nam, Dolly Arc 30° sang phải | `A03` | 50 | 3D-2 | Đường arc (Empty xoay hoặc Follow Path) |
| A04 | Reverse cận Người Kia, Dutch 5° | `A04` | 65 | 3D-0 + Dutch | Rim light cửa sổ; **nốt ruồi phải** đúng kích thước |
| A04B | Tight CU Nam, bokeh hậu cảnh | `A04B` | 65 | 3D-0 | Nam ngồi mép nệm, quạt trần (chưa có animation quạt) |
| A05 | Sàn 15 cm: chân va ghế "CỘP" | `A05` | 35 | 3D-3 + xung 0,15 s | Ghế trượt thật (có `chair_rot`, chưa có va chạm) |
| B01–B03 (ngưỡng cửa, gọi Tùng) | Ngang tầm mắt ngồi/đứng sát cửa | `DOOR` (có sẵn) | 24 | 3D-0 | Điện thoại + UI màn hình |
| C01–C03 | Steadicam dẫn đường qua ngưỡng cửa ra hành lang | `DOOR` → `HALL_FACE` (Follow Path) | 28 | 3D-1 | Đường dẫn spline xuyên cửa (cửa phải mở) |
| C04 | Reverse từ trong phòng: cửa dập vào ống kính | `DOOR` | 50 | 3D-0 + xung | Cửa xoay hết bản lề (`door_open` keyframe) |
| C05 | Macro then sắt 10 cm | `C05` | 85 Macro | 3D-5 | Then sắt trượt (cụm khoá hiện có chỉ tĩnh), ánh khe cửa |
| C06 | Cao 30° từ góc bàn xuống Nam + cửa | `C06` | 35 | 3D-0 | Nam ngồi ghế đối diện cửa |
| D01–D04 (CCCD, tra khảo qua cửa) | Macro mặt bàn + nốt ruồi trái/phải | `DESK` (có sẵn) + `P203` | 85 / 40 | 3D-5 | Thẻ CCCD có chữ + nốt ruồi (texture) |
| E, G (bí bài, cày game) | Bàn học + laptop; góc trần quanh nệm | `DESK`, `TOP` | 32 / 24 | 3D-0, 3D-3 | Màn hình UI, tô mì |
| H (tỉnh giấc đêm, hợp đồng) | Ánh laptop xanh lên mặt Người Kia | `DESK` (night) | 32 | 3D-0 | Người Kia ngồi bàn, `LAPTOP_LIGHT` |
| P2.03_01 | Pan 120° không cắt: then cửa → bếp | `C05` → `A01` (Empty xoay) | 35 | 3D-2 + Dutch 8° | Chuyển động pan qua toàn phòng |
| P2.03_02–03 | Low-angle sát mặt bàn, phong bì 3 triệu | `P203` | 40 | 3D-3 | Phong bì, tay đập bàn |
| P2.05_01–03 | Top-down 90°, xoay quanh nệm | `TOP` (xoay Empty) | 24 | 3D-3 | Trần ẩn (đã có `cutaway`) |
| P2.07_01–02 | Sàn: gói xôi văng vào ống kính | `LOW` (có sẵn) | 35 | 3D-3 + rung | Xôi, lá chuối (Particle/Rigid Body) |

## 3. Shot có chiếc gương
| Mã shot | Ý đồ | Camera Blender | Tiêu cự | Chế độ | Ghi chú gương |
|---|---|---|---|---|---|
| P2.04_01–02 | Tập nói trước gương, **POV từ trong kính** nhìn ra | `GUONG_POV` | 50 (34 trong thử) | 3D-4 | `--guong pov`; gương hơi mờ sương, nứt góc phải (chưa làm) |
| P2.06_01–03 | Rack focus điện thoại → gương soi tàn tạ; dolly sát mặt gương | `GUONG` → `GUONG_VAI` | 50 | 3D-5 + 3D-4 | Gương real; Nam phản chiếu bình thường |
| P3.03_03 | Vertigo Dolly Zoom 35→85 mm vào gương | `GUONG` (lùi theo Z) | 35 → 85 | 3D-6 | Keyframe vị trí + `lens` đồng thời |
| P3.04_01–04 | Orbit 180° quanh trục gương, Người Kia đỡ búa tay trái | `ORBIT_A → ORBIT_B → ORBIT_C` | 35/50 + Dutch 12° | 3D-2 + 3D-3 | **Nam `glossy=ẩn`, Người Kia `only_in_mirror`**; búa gắn tay |
| P3.05_01–03 | Mặt kính hóa nước, camera **từ trong thế giới gương** | `GUONG_POV` (lùi sâu) | 35/65 | 3D-6 | Liquid Glass shader (chưa làm); Nam chìm vào kính |
| P3.06 | Kết: Rack focus qua tay trái Người Kia, then sắt đóng | `A04`/`C05` | 35 → 85 | 3D-5 | Tùng + bún chả (nhân vật) |

## 4. Hành lang và không gian xung quanh (dựng mới 12/11 tối: hành lang 24,6 m, mỗi cửa một cảnh; sân, nhà đối diện 4 tầng, hẻm, chân trời — xem README)
| Mã shot | Ý đồ | Camera Blender | Tiêu cự | Ghi chú |
|---|---|---|---|---|
| Mở "Một tuần trước" | Hành lang ban ngày, Nam ôm gương vào phòng | `HALL_FACE` (day) | 22 | Tùng giữ cửa; kệ giày, đồ phơi |
| C01–C03 (ra ngoài) | Dẫn Người Kia ra hành lang, xoay 45° né tường | `HALL_FACE`, `HALL_END` | 22–28 | Đêm: ánh hắt dãy trọ đối diện |
| P2.01_05 | Xuyên khe thông gió cửa gỗ nhìn hành lang đêm | `P201VENT` (cửa đóng, `--door 0`) | 50 | Cần nan cửa (khe thông gió chưa dựng) |
| Chạy/đuổi dọc hành lang | Steadicam dài | `HALL_LONG` | 28 | 24,6 m đủ oner ~8 s ở bước đi thường |
| Toàn cảnh nhà trọ | Từ đầu sân nhìn dọc nhà, dây điện, đèn lồng | `TOAN_CANH` | 20 | Ngày/đêm |
| Nhìn sang dãy đối diện | Từ lan can tầng 2 | `SAN_THUONG` | 20 | 4 tầng mỗi phòng khác nhau |
| Nhìn ra hẻm | Qua cửa sổ phòng Nam | `CUA_SO` | 24 | Nhà hàng xóm 2,2 m |
| Cầu thang | Nhìn xuống bậc | `HALL_STAIR` | 24 | 14 bậc |
| Đêm cửa phòng | Cửa nhìn từ hành lang | `HALL_DOOR` (night) | 28 | Khoá, hộp điện, số phòng |

**Ngoài phạm vi hiện tại:** P3.01_01–03 (đại giảng đường, crane down), P3.02 (hành lang trường nắng gắt, chạy lùi theo Nam). Cần dựng phòng giảng đường + hành lang trường nếu đi tiếp.

## 4b. Kiểm khung hình lần đầu (`xem-thu/SHOT-BANG.jpg`, 16 máy, ngày, chưa nhân vật)
- **Đạt:** A01, A02, A02B, A03, A05, C05, C06, P203, ORBIT_A/B/C, GUONG_XIEN, GUONG_POV (đúng vật cần thấy, gương hiện đúng phòng).
- **Mới là phông nền:** A04 (kệ gia vị trên bồn rửa — Người Kia sẽ đứng trước), A04B (tường góc nệm — Nam ngồi mép nệm). Cần nhân vật để chốt lại cao độ/độ lệch.
- **Chưa dùng được:** `P201VENT` ra mảng tường phẳng vì chưa dựng khe thông gió cửa và cửa đang mở 10°; cần nan cửa + `--door 0`.
- C05 là cụm khoá hiện có (khối đơn giản); nếu giữ macro 85 mm cần tạo hình lại ổ then + vân kim loại.

## 4c. Camera chuyển động đã dựng (`camera_dong.py`, ảnh: `xem-thu/chuyen-dong/*.jpg`)
Mỗi camera = Empty `rig` (chuyển động chính) + camera con (Noise handheld, xung va chạm, DoF). Chạy: `python camera_dong.py --shot <TÊN> --frames 1,24,48 --out thư_mục`.
| Shot | Mã gốc | Kỹ thuật | Trạng thái |
|---|---|---|---|
| `STEADI_RA_HL` | C01–C03 | **Follow Path** (Bézier) xuyên cửa ra hành lang + Track To theo mục tiêu đi trước, 28 mm f/2.8, handheld nhẹ | Chạy; đường đã tránh cánh cửa mở 85° |
| `ORBIT_GUONG` | P3.04 | **Orbit 180°** bán kính 1,0 m quanh người trước gương (nằm trọn trong phòng), Dutch tối đa 12°, 35 mm f/2.0, DoF bám tâm | Chạy; xuất hiện Người Kia chỉ trong gương |
| `VERTIGO_GUONG` | P3.03_03 | **Dolly Zoom** 28→85 mm, lùi 1,1→3,3 m giữ cỡ gương; tường cửa sổ ẩn khỏi camera | Chạy; xem KIEM-GOC-QUAY.md (vượt 3 m phòng) |
| `RACK_FOCUS_BAN` | rack 3D-5 | **Rack focus** 65 mm f/1.4 từ lưng ghế → màn hình laptop (focus object keyframe) | Chạy; khung đầu chưa thấy lưng ghế (lệch khung, cần chỉnh khi có nhân vật) |
| `HANDHELD_A04` | 3D-0 | **Noise handheld** 0,12° + **xung va chạm** ở khung 24 (tắt dần 0,2 s) | Chạy |
| `KINH_NUOC` | P3.05 | **Liquid Glass** (`kinh_nuoc.py`): gương → gợn sóng vòng đồng tâm → kính nước (Glass 3 kênh IOR 1,31/1,33/1,36 → sắc sai) | Chạy phía phòng; **bản camera trong gương (Submersion) chưa chạy**: lưng kính còn đen |

## 5. Việc còn lại để khung hình thành shot quay được
1. Nhân vật Modular (Nam, Người Kia, Tùng) vào cảnh để chấm lại tỉ lệ khung (camera đặt theo mắt 1,50/1,15 m, chưa kiểm trên người thật).
2. Camera chuyển động còn lại: Dolly Arc A03, Pan 120° P2.03_01, Top-down xoay P2.05, Crane Down (giảng đường — ngoài phạm vi). Đã có: Steadicam, Orbit, Vertigo, Rack focus, Handheld (mục 4c).
3. **Khung toàn thân chưa đủ rộng ở nhiều shot** — xem [KIEM-GOC-QUAY.md](KIEM-GOC-QUAY.md); cần chủ repo chọn hướng A/B.
4. Gương: nốt ruồi, nứt, hóa nước (xem [KE-HOACH-CONG-GUONG.md](KE-HOACH-CONG-GUONG.md)).
5. Đạo cụ có điểm gắn tay: búa, thẻ, bát, đũa, điện thoại (Child-Of/bone constraint).
6. Cờ phụ: then sắt trượt, cửa/bản lề keyframe, quạt quay, rèm lay, khe thông gió cửa.
