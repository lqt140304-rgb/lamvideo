# Bối cảnh 3D (Blender) — phòng trọ + hành lang, Hồ sơ 02 (12/11/2026)

Theo [QUY-CHUAN-3D.md](../../../../../docs/QUY-CHUAN-3D.md) và các quyết định của chủ repo 12/11: dùng **Blender**, **co phòng về đúng quy chuẩn 3 × 4 m**, lượt đầu **chỉ phòng trọ và hành lang**.
Bản 2D/2.5D (`../boi-canh/`) giữ nguyên làm Concept Art và bảng màu (Color Script).

| File | Việc |
|---|---|
| [`xay_phong_tro.py`](xay_phong_tro.py) | Dựng toàn bộ cảnh bằng `bpy`: vỏ phòng, cửa, cửa sổ, đồ đạc, hành lang, cầu thang, ngoại cảnh, ánh sáng ngày/đêm, 9 camera. Chạy được không cần mở Blender. |
| [`vat_lieu.py`](vat_lieu.py) | Vật liệu thủ tục (không dùng ảnh texture ngoài): tường vôi loang ẩm, gạch men lệch tông, gỗ vân, vải, kim loại gỉ, kính trong suốt với tia bóng. |
| [`chay_xem_thu.sh`](chay_xem_thu.sh) | Xuất bộ ảnh xem thử vào [`xem-thu/`](xem-thu/). |

## Chạy
```
python3.11 -m venv v && v/bin/pip install bpy          # Blender dạng module Python (5.x)
v/bin/python xay_phong_tro.py --mode night --cam DESK --out desk_night.png
v/bin/python xay_phong_tro.py --mode day --cam WIDE --blend phong.blend --no-render   # lưu .blend để mở trong Blender
```
Tham số: `--mode day|night`, `--cam WIDE|DESK|BED|DOOR|KITCHEN|HALL|HALL_DOOR|TOP|LOW`, `--door <độ mở cửa>`, `--chair-rot <rad>`, `--dep-san` (bật đôi dép trên sàn, chỉ dùng cho cảnh không có người), `--samples`, `--width`.
Trên Linux không màn hình cần `libegl1`. Render Cycles CPU, khoảng 1–2 phút/ảnh 1280 px ở 64 mẫu (4 lõi).

## Quy ước
- **1 Blender Unit = 1 m.** Phòng 3,0 × 4,0 m (12 m²), trần 2,8 m; cửa chính 0,85 × 2,10 m. Chiều cao đồ là **kích thước thật**: mặt bàn 0,75, mặt ghế 0,46, mặt nệm 0,24, mặt bếp 0,84 (bản 2D phải hạ đồ cho vừa chân ngắn của rig, bản 3D không còn thế).
- **Chiều trái–phải giữ như bản duyệt:** camera đứng phía trước nhìn vào thấy cửa chính bên trái, cửa sổ bên phải. Blender là hệ thuận tay phải nên mọi toạ độ thiết kế trong script được phản chiếu qua `x = W/2` (`mx()`); viết toạ độ mới theo "bản thiết kế" (x từ tường cửa sang tường cửa sổ), script tự phản chiếu.
- **Tường trước và trần** ẩn với camera khi cần (`visible_camera = False`) nhưng vẫn che sáng và đổ bóng, nên camera đứng ngoài hay nhìn từ trên xuống vẫn thấy cả phòng.
- Bố trí giữ tương quan đã duyệt ở DUNG-CANH.md: bếp sau–trái, tủ quần áo sau–giữa, bàn Nam sau–phải cạnh cửa sổ, nệm đôi trước–phải, quạt đứng trước–trái, gương đứng dựa tường cửa. **Kích thước từng món đã co theo phòng 3 × 4 m** (bếp 1,03 m thay 1,64 m; nệm 1,4 × 1,9 m), nên mặt bằng khác bản 2D; không dùng toạ độ cm cũ.
- Hành lang chạy dọc ngoài tường cửa (rộng 1,3 m, lan can song sắt, mái hiên, đèn tuýp), cầu thang 14 bậc xuống sân ở đầu sau, hai cửa phòng bên cạnh, dãy trọ đối diện 3 tầng, toà nhà xa. Đóng kín 360° cho camera tự do (phòng có đủ 4 tường, trần, ngoại cảnh ngoài cửa sổ và hành lang).
- **Ánh sáng:** ngày = mặt trời qua cửa sổ + trời; đêm = **laptop xanh 6500K** (`LAPTOP_LIGHT`, nguồn chính) + đèn tuýp hành lang ấm. Đèn tuýp phòng tắt ban đêm. Không còn mảng sáng/bóng vẽ tay.
- Điểm neo thật cho nhân vật 3D: `ANCHORS` trong script; ghế làm việc ở `SEAT`.

## Đã sửa (lượt 12/11 chiều)
- **Vệt đen trên trần/tường (TOP, HALL_DOOR_night):** thanh đèn tuýp trần được tô màu đen khi tắt (vật liệu phát sáng có cường độ 0); nay là sứ mờ. Nắp đèn trùng mặt đáy trần đã bỏ, đèn lùi xuống 5 cm dưới trần. Tường hành lang từ góc trước trùng mặt với tường góc gây z-fighting; nay tường bắt đầu sau góc.
- **Vệt đen ngang tường bếp:** thanh viền 1,1 m trùng mặt với các viên gạch ốp; gạch nay đứng trước viền, nền gạch lùi sau.
- **Khoảng trống ngoài phòng (BED):** tường trước chỉ ẩn khi camera ở phía ngoài phòng (y > 4 m). Camera trong phòng thấy đủ bốn tường.
- **Lan can hành lang:** trụ dừng dưới mặt tay vịn, song sắt không xuyên qua tay vịn (hết ô vuông đen).
- **Nệm:** đầu giường (gối) chuyển về phía trong phòng, không còn ngay lối cửa; chăn trải không che gối.
- **Trời đêm:** nền trời xanh đêm nhẹ thay vì đen đặc.
- **Cây trong chậu hành lang:** chậu thon có mép, đất, và các lá là khối cầu dẹt.
- **Dép:** mặc định không đặt trên sàn; Nam sẽ mang dép trên chân.

## Đã có / chưa có
- Có: vỏ phòng, cửa (mở được, then sắt gỉ, tay nắm), cửa sổ (kính, song sắt, rèm nếp), bếp (chậu, vòi, giá đĩa, kệ cốc), tủ quần áo mở, bàn học (hộc kéo, giá sách, laptop, đèn bàn), ghế (xoay được `--chair-rot`), nệm đôi (gối, chăn), quạt đứng, gương đứng, bình nước, carton, chổi, thùng, dép, bát; hành lang đầy đủ; ngày và đêm.
- **Chưa có (lượt sau):** gương phản chiếu có điều khiển riêng Người Kia (hiện chỉ vật liệu gương phẳng của Cycles); chuyển động quạt/rèm/ghế (script chỉ nhận góc tĩnh `fan_angle`, `chair_rot`, `door_open`); đạo cụ cầm nắm (điện thoại, căn cước, búa, bát, đũa) kèm điểm bám tay; nhân vật 3D (chưa nhận định dạng); camera điện ảnh 2.39:1 có DoF, dolly zoom, rung tay; phòng của Tùng, giảng đường và các bối cảnh phần 2–3; texture nâng cao (ảnh vân tường thật), dao động vi mô của vật liệu.
- Ảnh xem thử là bản render nháp 64 mẫu để duyệt bố cục, ánh sáng, vật liệu; chưa phải chất lượng cuối.

## Hành lang (lượt 12/11 tối)
- Thêm `hallway_details`: dây điện có kẹp, dầm mái, đèn cửa, kệ giày + dép, dây phơi có cột và móc, bình chữa cháy + bảng, bảng thông báo, xô/chậu/chổi, vệt ố chân tường, rãnh nước.
- Camera mới: `HALL_FACE` (nhìn về cửa phòng Nam), `HALL_END`, `HALL_STAIR`. Ảnh trong `xem-thu/`.
- Ban đêm: dãy trọ đối diện có cửa sổ sáng/tắt xen kẽ, rèm, vài bóng người, ánh hắt vào hành lang; chao đèn tuýp hành lang; trời có chuyển sắc.
- Chưa làm: chuyển động (đồ phơi lay, người đi lại), âm thanh.
- (Đã thay thế 12/11 tối bằng `moi_truong.py`, xem mục cuối.) Camera `HALL_LONG` nhìn dọc hành lang; độ dài `HL_Y1` = 24 m.

## Cổng gương và danh sách shot (12/11, sau chốt nhân vật Blender Modular 1,60 m)
- Gương sửa lại (cũ nghiêng ngược, nửa trên xuyên tường): chân cách tường 16 cm, đỉnh tựa tường. Gương thật Cycles + cờ Ray Visibility cho Người Kia/Nam; `--guong real|pov`, `--proxy` (hình nhân tạm). Xem [KE-HOACH-CONG-GUONG.md](KE-HOACH-CONG-GUONG.md).
- 14 camera theo shot (A01…C06, P203, ORBIT_A/B/C, GUONG, GUONG_XIEN, GUONG_VAI, GUONG_POV…) và bảng gán shot → camera tại [DANH-SACH-SHOT.md](DANH-SACH-SHOT.md); `chay_shot.sh` xuất bảng khung (`xem-thu/SHOT-BANG.jpg`).

## Hoạt cảnh camera, kính hóa nước, kiểm tra góc quay (12/11)
- `camera_dong.py`: Follow Path, Orbit, Vertigo, Rack Focus, Handheld + xung va chạm; ảnh khung trong `xem-thu/chuyen-dong/`.
- `kinh_nuoc.py`: shader kính hóa nước (gợn sóng, sắc sai, keyframe).
- `kiem_goc_quay.py` → [KIEM-GOC-QUAY.md](KIEM-GOC-QUAY.md): **khung 2.39:1 trên sensor 36 mm chưa đủ rộng cho toàn thân 1,6 m trong phòng 3×4 m ở lens ≥ 28 mm.**

## Không gian xung quanh dựng mới (12/11 tối, `moi_truong.py`) — thay bản lặp mô-đun
Vì góc quay giờ rộng hơn nên mọi hướng đều phải có cảnh đẹp, không lặp:
- **Nhà trọ 4 tầng quanh sân:** tầng trệt (cột, 4 cửa cuốn + bảng hiệu tạp hóa/cà phê/giặt ủi/sửa xe, ghế nhựa), tầng 2 (phòng Nam), tầng 3 (cửa, lan can, dây phơi), mái (bể nước, ăng-ten, mái tôn).
- **Hành lang phòng Nam:** 8 cửa, mỗi cửa một cảnh riêng (giày dép + thảm, máy giặt + xô, xe đạp + bình gas, ghế nhựa + bàn nhỏ + chậu hoa, bàn thờ treo tường đèn đỏ, thùng carton + khóa, giàn phơi + quạt, chậu cây + khóa). Đèn cửa mỗi phòng.
- **Dãy trọ đối diện 4 tầng:** mỗi phòng sinh bằng hạt giống riêng (màu cửa, cửa mở/đóng, cửa sổ lồng sắt, rèm, đồ trước cửa khác nhau: xe đạp, cây, quần áo, máy giặt, giày, ghế, quạt, bình, thùng), bể nước trên mái.
- **Sân:** gạch lát, bồn cây, 3 cây lớn + cau, 20 xe máy đủ màu, thùng rác, 4 cột điện + dây (chính và rẽ), đèn lồng đỏ + cờ tam giác giăng ngang sân, cổng sắt.
- **Hẻm bên cửa sổ phòng Nam:** nhà hàng xóm cách 2,2 m, 4 tầng cửa sổ lồng sắt, máy lạnh, quần áo, ống nước, dây điện, xe máy.
- **Chân trời:** 3 lớp nhà cao tầng xa mờ sương; bầu trời gradient + mây (ngày) / sao (đêm); ban đêm cửa sổ sáng, đèn sân, đèn lồng.
- Camera mới: `TOAN_CANH` (từ đầu sân nhìn dọc nhà), `SAN_THUONG` (từ hành lang tầng 2 nhìn dãy đối diện), `CUA_SO` (ra hẻm qua cửa sổ). Ảnh: `xem-thu/moi-truong/`. Mọi đối tượng bắt đầu `env_` để camera ngoài phòng không ẩn chúng.
- Chưa làm: cây cao hơn có cành chi tiết, xe cộ trên đường ngoài, người/vật chuyển động, bầu trời có mặt trời/mặt trăng thấy được, mặt đường và nhà phía sau hẻm.

## 13/11 sáng: tăng tốc dựng cảnh, rà soát camera, hoàn thiện kính nước
- **Dựng cảnh nhanh gấp ~40 lần** (182 s → 4,8 s): `cyl/sphere/torus/wire` đổi từ `bpy.ops` (mỗi lệnh cập nhật depsgraph toàn cảnh, 65 ms × hàng nghìn vật) sang bmesh trực tiếp (`_mesh_obj`). Nhờ đó rà soát 39 camera chạy được: `chay_ra_soat.sh` → ảnh nhỏ `/tmp/ra-soat`.
- Khe thông gió cửa phòng Nam (P201VENT). Sàn hẻm tối hơn (hết cháy sáng). `moi_truong.build` xoá cache vật liệu mỗi lần dựng lại.
- Kính hóa nước hoàn chỉnh (`KINH_NUOC`, `KINH_NUOC_POV`) — xem KE-HOACH-CONG-GUONG.md.

## 13/11 05:30: danh sách shot cuối và chuyển động camera
- `camera_dong.py`: thêm 10 shot khai báo (`GEN`): ESTABLISH_SAN, TOAN_CANH_DEM, HL_DOLLY, A03_ARC, PAN_BEP_CUA, TOP_XOAY, SAN_VAP, TT_*_PUSH; `SEQUENCE` (17 shot, 1272 khung). Bảng ở DANH-SACH-SHOT.md mục 6. `render_chuoi.sh` render chuỗi thành MP4 (chưa chạy).
- Cutaway (TOP) ẩn trần khỏi mọi loại tia để mép tường không đen; tường hẻm tối hơn.

## 13/11 08:00: rà soát lỗi
Xem [RA-SOAT-13-11.md](RA-SOAT-13-11.md): 14 lỗi đã biết → 6 sửa hẳn, 4 sửa một phần, 4 còn. Sửa thêm: chấm đen kệ/tủ, cây có cành, trăng đêm, `kiem_goc_quay.py` tách cỡ toàn thân/trung.
