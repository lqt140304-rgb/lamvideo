# Danh sách shot camera — Hồ sơ 02 (phòng trọ + hành lang)

Nguồn nội dung: [DUNG-CANH.md](../../DUNG-CANH.md) (bảng MAY-A…H, MAY-P2, MAY-P3) + [QUY-CHUAN-3D.md](../../../../../docs/QUY-CHUAN-3D.md). File này **gắn từng shot vào một camera Blender có tên** trong `xay_phong_tro.py` (`CAMERAS`) để dựng/kiểm khung hình ngay khi chưa có nhân vật. Phạm vi theo quyết định 12/11: **phòng trọ 3 × 4 m + hành lang**; shot ở giảng đường/hành lang trường nằm ngoài phạm vi (mục 4).

Chạy 1 máy: `python xay_phong_tro.py --mode day|night --cam <TÊN> --out ảnh.png [--guong real|pov] [--proxy]`. Bảng khung hình: `chay_shot.sh` (→ `xem-thu/shot/`). Người đóng (1,60 m) chưa có nên khung chỉ để kiểm bố cục; mắt đứng 1,50 m, mắt ngồi 1,15 m.

## 1. Chuẩn máy chung
- Sensor 36 mm full-frame, khung **2.39:1** (1280 × 536 xem thử). Tiêu cự ghi trong bảng; chuyển động/handheld/DoF thêm ở bước hoạt cảnh.
- **3D-0 handheld:** Noise `0,2 Hz`, xoay `0,05°–0,15°`; xung va chạm tắt dần 0,2 s. **Dutch:** nghiêng 5°–15° bằng Roll của camera. **Rack focus:** keyframe `Focus Distance` theo toạ độ vật (chênh ≥ 0,5 m).
- Camera gương dùng `--guong real`; camera POV trong gương (`GUONG_POV`) dùng `--guong pov`.
- Ánh sáng: ngày = nắng cửa sổ + hắt; đêm = laptop xanh 6500 K là nguồn chính + tuýp hành lang ấm 4000 K (tuýp phòng tắt).

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

## 4. Hành lang (đã dựng, dài 36,6 m, lặp mô-đun)
| Mã shot | Ý đồ | Camera Blender | Tiêu cự | Ghi chú |
|---|---|---|---|---|
| Mở "Một tuần trước" | Hành lang ban ngày, Nam ôm gương vào phòng | `HALL_FACE` (day) | 22 | Tùng giữ cửa; kệ giày, đồ phơi |
| C01–C03 (ra ngoài) | Dẫn Người Kia ra hành lang, xoay 45° né tường | `HALL_FACE`, `HALL_END` | 22–28 | Đêm: ánh hắt dãy trọ đối diện |
| P2.01_05 | Xuyên khe thông gió cửa gỗ nhìn hành lang đêm | `P201VENT` (cửa đóng, `--door 0`) | 50 | Cần nan cửa (khe thông gió chưa dựng) |
| Chạy/đuổi dọc hành lang | Steadicam dài | `HALL_LONG` | 28 | 36,6 m đủ cho oner ~10 s ở bước đi thường |
| Cầu thang | Nhìn xuống bậc | `HALL_STAIR` | 24 | 14 bậc |
| Đêm cửa phòng | Cửa nhìn từ hành lang | `HALL_DOOR` (night) | 28 | Khoá, hộp điện, số phòng |

**Ngoài phạm vi hiện tại:** P3.01_01–03 (đại giảng đường, crane down), P3.02 (hành lang trường nắng gắt, chạy lùi theo Nam). Cần dựng phòng giảng đường + hành lang trường nếu đi tiếp.

## 4b. Kiểm khung hình lần đầu (`xem-thu/SHOT-BANG.jpg`, 16 máy, ngày, chưa nhân vật)
- **Đạt:** A01, A02, A02B, A03, A05, C05, C06, P203, ORBIT_A/B/C, GUONG_XIEN, GUONG_POV (đúng vật cần thấy, gương hiện đúng phòng).
- **Mới là phông nền:** A04 (kệ gia vị trên bồn rửa — Người Kia sẽ đứng trước), A04B (tường góc nệm — Nam ngồi mép nệm). Cần nhân vật để chốt lại cao độ/độ lệch.
- **Chưa dùng được:** `P201VENT` ra mảng tường phẳng vì chưa dựng khe thông gió cửa và cửa đang mở 10°; cần nan cửa + `--door 0`.
- C05 là cụm khoá hiện có (khối đơn giản); nếu giữ macro 85 mm cần tạo hình lại ổ then + vân kim loại.

## 5. Việc còn lại để khung hình thành shot quay được
1. Nhân vật Modular (Nam, Người Kia, Tùng) vào cảnh để chấm lại tỉ lệ khung (camera đặt theo mắt 1,50/1,15 m, chưa kiểm trên người thật).
2. Camera chuyển động: Empty + Follow Path/Track To cho Steadicam, Dolly Arc, Orbit, Vertigo, Top-down xoay; thêm Noise handheld.
3. DoF thật (`dof.use_dof`, `aperture_fstop`, `focus_object`) cho các shot f/1.4–2.0.
4. Gương: nốt ruồi, nứt, hóa nước (xem [KE-HOACH-CONG-GUONG.md](KE-HOACH-CONG-GUONG.md)).
5. Đạo cụ có điểm gắn tay: búa, thẻ, bát, đũa, điện thoại (Child-Of/bone constraint).
6. Cờ phụ: then sắt trượt, cửa/bản lề keyframe, quạt quay, rèm lay, khe thông gió cửa.
