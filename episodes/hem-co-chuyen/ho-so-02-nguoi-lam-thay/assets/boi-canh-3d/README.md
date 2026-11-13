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

## 13/11 10:30: video từ các góc quay
- `xem-thu/video/chuoi-shot.mp4`: 17 shot (SEQUENCE), 640×268, **12 fps** (render mỗi 2 khung, `STEP=2`), 636 khung = 53 giây, Cycles CPU 14 mẫu/khung, 2.39:1, hình nhân tạm, không tiếng. Thumbnail: `xem-thu/video/chuoi-shot-thumb.jpg`; thời gian: `xem-thu/video/thoi-gian.log`.
- Thời gian thật: tổng ≈ 80 phút trên 4 lõi CPU (≈ 7 s/khung gồm dựng cảnh ≈ 10 s/shot); không shot nào lỗi. Muốn bản 24 fps/độ phân giải cao hơn: `STEP=1 WIDTH=960 SAMPLES=24 ./render_chuoi.sh` (ước tính vài giờ).
- Lệnh: `PY=/tmp/bpyenv/bin/python STEP=2 WIDTH=640 SAMPLES=14 OUT=/tmp/chuoi ./render_chuoi.sh`.

## 13/11 chiều: render lại video với các sửa mới
- `xem-thu/video/chuoi-shot.mp4`: bản mới (12 fps, 640×268, 53 s, 14 mẫu); `chuoi-shot-24fps.mp4`: cùng video nội suy lên 24 fps bằng `minterpolate` (không render thêm). Thời gian render thật: 83,6 phút (5.014 s) trên 4 lõi CPU, bật persistent data; không shot nào lỗi. Log: `xem-thu/video/thoi-gian.log`.

## 13/11 chiều: ánh sáng theo giờ + đèn bàn thật + góc đồ cho tặng (S07)
Chế độ `--mode dawn|noon|sunset|rain|night|day`, `--den-ban on|off`, `--goc-do`; xem BOI-CANH-CAN-CHUAN-BI.md mục 6. Ảnh: `xem-thu/ANH-SANG-BANG.jpg`, `xem-thu/anh-sang/`, `xem-thu/goc-do/`.

## Đồ dùng tinh chỉnh — cập nhật 13/11

Dùng [xay_do_dung_chi_tiet.py](xay_do_dung_chi_tiet.py) để dựng bản đồ dùng mới trên bối cảnh hiện tại: tựa ghế đúng chiều, chăn ôm ngoài mép nệm và chân cao su laptop đặt trên mặt bàn. Xem [hướng dẫn tích hợp và giới hạn](README-CHI-TIET.md), [ảnh sửa tiếp xúc](sua-tiep-xuc/DA-SUA.png). Entry gốc vẫn giữ nguyên; cần gọi entry tinh chỉnh hoặc gọi `refine()` sau `build()` để nhận đồ dùng mới.

## 13/11 chiều muộn: nắng trưa chữ nhật, quầy nhận đồ S07 chi tiết, chuyển giờ, mưa chuyển động
- **Nắng trưa** (`--mode noon`): `khung_nang_ban` (xay_phong_tro.py) là khung chắn sáng vô hình với camera, đặt sau cửa sổ vuông góc tia nắng, ô 0,46 × 0,30 m → nắng in thành mảng sáng có rìa rõ lên mặt bàn (tâm 0,55; 0,36), vạch chéo của song cửa sổ chạy qua. Nắng trưa 14, ánh hắt cửa sổ 32, độ nhoè mặt trời 0,5°. Ảnh: `xem-thu/anh-sang/trua-mat-ban-chu-nhat.png`.
- **Chuyển giờ mượt** (`chuyen_gio.py`, shot `DOI_GIO`, 96 khung): keyframe nắng (hướng, màu, độ mạnh), gradient bầu trời, ánh hắt cửa sổ, đèn bàn + bóng, màn hình laptop, phơi sáng; rèm khe chỉ có lúc sáng sớm.
- **Mưa chuyển động** (`goc_cho_tang.py`, shot `MUA_GOC_DO`): hạt mưa rơi bằng driver theo khung hình, 9 sợi nước nhỏ giọt từ mép sàn tầng 3, vòng gợn trên vũng nước.
- **Quầy nhận đồ S07** (camera `GOC_DO`, `GOC_DO_QUAY` cận bàn; ảnh `xem-thu/goc-do/quay-nhan-do-*.png`):
  - Mái bạt đỏ trắng, 2 cột, dây 9 đèn lồng, đèn điểm ấm hắt xuống bàn; biển gỗ "ĐỒ CHO TẶNG".
  - Bàn gỗ khăn trải thả mép: chồng 4 áo gấp (sọc, nếp gấp), chồng 5 sách (gáy vàng, mép giấy, nhãn, dây đánh dấu), ấm kim loại (vòi, quai, nút), lọ thủy tinh (nắp, nhãn, kẹo), đôi dép (đế, quai chéo), gấu bông cũ, đồng hồ báo thức, thẻ "Lấy tùy tâm", hộp ủng hộ đỏ (khe, băng keo, chữ "ỦNG HỘ").
  - Dưới bàn: rổ mây đựng 3 quả bóng, đôi giày cũ.
  - Giá treo áo 7 áo (tay áo, móc, thẻ giá buộc dây).
  - Góc đồ cũ: quạt (vành lồng, 3 cánh, nan, trục), ghế gãy thêm đệm đỏ, thùng carton băng keo + chữ "SÁCH CŨ", gương bám bụi có vết ngón tay.
- Mọi đối tượng bắt đầu `env_gct_`. Chưa render lại `chuoi-shot.mp4`.

## 13/11 tối: trời, xe cộ, người, chim chuyển động (`canh_dong.py`)
- Gọi từ `hallway()` sau `moi_truong.build`; mọi chuyển động bằng **driver theo khung hình** (lặp vòng, không keyframe), đối tượng `env_cd_*`.
- **Mặt trời** (ngày/sáng sớm/chiều tà, theo `dirw` của chế độ) và **mặt trăng** (đêm): đĩa phát sáng ở xa chỉ camera thấy, có quầng mềm; **mây** là cụm cầu dẹt trôi theo +x (16 cụm, 26 khi mưa; màu đổi theo giờ, rìa mờ bằng Layer Weight).
- **Xe máy** có người lái (mũ bảo hiểm, đèn trước/sau sáng ban đêm): 5 chiếc chạy 2 chiều giữa sân, 3 chiếc trong hẻm cạnh cửa sổ phòng Nam. **Người đi bộ** (thân, đầu, tay chân đung đưa theo khung): 5 người ở sân (có 1 trẻ em), 2 người ở hẻm. **7 con chim** bay ngang trời, cánh vỗ.
- Camera kiểm tra: `TROI_NANG`, `TROI_TRANG` (từ mái nhìn lên). Ảnh: `xem-thu/troi/`.
- Hạn chế: người/xe là hình khối đơn giản (chưa phải nhân vật modular); xe vòng lặp có thể "nhảy" ở hai đầu sân ngoài khung hình; chưa có ô tô; chưa render lại `chuoi-shot.mp4`.

### Sửa cơ bản canh_dong (13/11 tối)
- **Hết "nhảy" ở hai đầu vòng:** mọi xe/người/ô tô/chim/mây thu nhỏ dần về 0 ở đầu và cuối vòng lặp (`_fade`, driver scale), nên mọc/biến mất êm.
- **Ô tô:** 2 chiếc nhỏ (thân, cabin kính, cột, 4 bánh, đèn trước/sau, cản) chạy chậm hai chiều giữa sân, làn x = −4,2.
- **Người/xe thêm chi tiết:** người có cổ, vai, hông, bàn tay, giày, tóc nhiều màu; xe máy có yên, chắn bùn, chóa đèn, gương chiếu hậu, ống pô. Làn đường tách nhau (xe máy −6,4/−6,0; người −5,5…−5,2; ô tô −4,2). Camera kiểm tra `SAN_XE`.
- Người/xe vẫn là khối đơn giản, chưa dùng bộ nhân vật modular của nhân vật chính (chủ ý: chỉ là người đi đường nền).

## 13/11 tối: khu tập thể Hà Nội, phân làn, người bán ngồi ven đường (`ktt_ha_noi.py`)
- **Tường nhà:** vết ố nước mưa chảy dọc (mờ dần, mép loang bằng noise), rêu sát chân tường, mảng tường gạch lộ do bong vữa (vật liệu Brick theo mét) trên tường nhà trọ (tầng trệt + tầng 3), nhà đối diện và nhà cuối sân.
- **Chi tiết KTT:** chuồng cọp bọc lưới sắt + mái tôn dốc ở nhà cuối sân, sào phơi đồ thò ra cửa sổ, điều hoà cục nóng, hộp công tơ điện, ống nước PVC, biển số nhà (A5, P.12), loa phường, hoa giấy trong chậu trên lan can, cờ đỏ sao vàng, quán trà đá (bàn thấp, ghế nhựa, ô dù, bình thuỷ), xe đẩy bánh mì.
- **Phân làn (sân dài 68 m):** vỉa hè nâng 8 cm ở phía tây cho người đi bộ (x −7,55…−6,5); lòng đường nhựa x −6,5…−3,4, vạch biên liền, vạch đứt phân làn, vạch đi bộ qua đường; làn tây −6,3 đi −y (xe máy, xe cộ chậm), làn giữa −5,1 ô tô đi +y, làn đông −3,9 xe máy đi +y; xe đỗ và bồn cây dồn về hè đông (x > −3,2), cột điện chuyển sát hè đông (x = −1,75) nên ô tô không còn đâm vào cột và cây.
- **Người bán hàng rong ngồi ven đường (3 người, đứng yên, mỗi người một kiểu):** bà bán rau (nón lá, rổ rau, ô che nắng, chiếu), cô bán trái cây (khăn trùm đầu, ghế nhựa, đôi thúng + quang gánh đặt xuống), chú bán bánh mì (mũ lưỡi trai, ngồi sau xe đẩy). Bỏ gánh/xe đạp hoa đi bộ.
- Camera kiểm tra: `VIA_HE`, `VIA_HE_2`; ảnh `xem-thu/ktt/`.

### Sửa xuyên vật thể / quầy rong chìa ra đường (13/11 tối)
- Mặt cắt sân (x thiết kế, đơn vị m): vỉa hè −7,55…−6,05 (người bán ngồi và đồ nằm trọn trong −7,5…−6,7; lối đi bộ −6,5/−6,25); đường nhựa −6,05…−3,1 gồm xe máy làn tây −5,55, ô tô −4,55 (rộng 1,5 m), xe máy làn đông −3,45; hè đông (xe đỗ, bồn cây, quán trà, xe bánh mì) từ −3,0 trở vào.
- Bỏ xe đỗ trên vỉa hè phía tây; bồn cây thu hẹp (−3,0…−2,1); vạch đứt −5,3 và −3,75, vạch đi bộ −5,85…−3,25.

### Mở rộng đường cho ô tô (13/11 tối)
- Mặt cắt mới (x thiết kế): vỉa hè −7,55…−6,25; **đường nhựa −6,25…−2,8 (rộng 3,45 m, 2 làn, vạch tim đứt −4,5)**; hè đông (bồn cây −2,8…−2,1, xe đỗ, quán, xe bánh mì) từ −2,8 trở vào. Làn đông x = −3,65 đi +y, làn tây x = −5,35 đi −y; ô tô (rộng 1,5 m) và xe máy dùng chung làn, cùng tốc độ trong mỗi làn, cách nhau ≥ 9 m nên không chồng nhau. Người đi bộ cùng một chiều trên lối −6,5.

## 13/11 đêm: chi tiết Hà Nội theo bảng ưu tiên
- **Ưu tiên 1:** chuồng cọp sắt đua ra 30 cm ngoài ban công nhà hàng xóm trong hẻm + téc inox nằm trên mái chuồng (`moi_truong.hem_chi_tiet`; nhìn từ `CUA_SO`); 7 chuồng cọp đua ra 65 cm ở nhà đối diện, một nửa có téc inox (`ktt_ha_noi.py`); cột điện "tổ chim": 3 cuộn cáp quấn cột, hộp cáp, mớ dây rối quanh xà, tổ chim, biến áp ở cột y = 8.
- **Ưu tiên 2:** công tơ điện cơ **đĩa xoay** (kính, đĩa nhôm quay bằng driver) + cầu dao cạnh cửa phòng Nam (`hallway_details`), dép tổ ong (xanh rêu/nâu/be) ở kệ giày; chữ stencil "KHOAN CẮT BÊ TÔNG 0912 345 678" ở tường hành lang và tường tầng trệt; shader `vat_lieu.phong_tran` (nền vôi loang + mảng vàng ố + rêu theo cao độ) áp cho mọi tường môi trường (`moi_truong.plaster`).
- **Ưu tiên 3:** quán nước chè chén tầng 1 (khay chén, ấm, bếp than, ghế nhựa), 4 thùng xốp trồng rau chân nhà trọ.
- Ảnh: `xem-thu/ktt/toan-canh-chuong-cop-cot-dien.png`, `hanh-lang-cong-to.png`. Chữ stencil và chữ biển chưa kiểm tận mắt ở độ phân giải cao.

### Giảm lặp (cùng đợt)
- Tầng 3 nhà trọ: cửa không đều (rộng 0,8–0,95, cách nhau 0,9–2,4 m), màu không trùng liên tiếp, 30% cửa lưới sắt / 20% rèm ô thoáng, cửa sổ nhỏ có song, giày dép, chậu cây, ghế, biển số ngẫu nhiên; sào phơi/điều hoà đặt ở khe giữa các cửa, bỏ trống nhiều chỗ; chậu lan can 4 loại (hoa giấy, lá, sen đá, thùng xốp rau) cách nhau ngẫu nhiên.
- Đường phố: xe máy mỗi xe một kiểu (thùng giao hàng, chở thêm người, giỏ trước, kích cỡ), người đi bộ khác chiều cao + túi/mũ, ô tô 1 sedan + 1 van có giá nóc, 3 kiểu cây (tròn, phượng tán dẹt có hoa, cau mảnh).

### Kiểm lại chữ / cửa sổ / rêu (13/11 đêm)
- Chữ đọc được ở cận cảnh: "BÁNH MÌ", "A5", "P.12", "KHOAN CẮT BÊ TÔNG 0912 345 678". Đã dời biển số/stencil khỏi cửa cuốn, công tơ và cột (cột X0 che khi nhìn thẳng); stencil nằm trước mảng gạch lộ (EX−0,02). Camera kiểm: `BIEN_SO_NHA`, `STENCIL_T1`, `BIEN_BANH_MI`, `STENCIL_HL`.
- Cảnh qua cửa sổ phòng Nam (`CUA_SO`): chuồng cọp nhà hàng xóm đua ra 14 cm (trước 30 cm), song cách 22 cm → thoáng hơn, thấy rõ quần áo phơi phía sau.
- Rêu trên tường: giảm cường độ (`phong_tran(reu=0.5, z_reu=-2.0)`), chỉ còn viền xanh nhạt sát chân tường.

### Kiểm tra xuyên/che lấp (13/11 đêm) — `kiem_xuyen.py`
- Công cụ quét AABB (lấy mẫu 58 khung trong 700 khung): xe/người chuyển động vs đồ tĩnh, xe vs xe, đồ tĩnh vs đồ tĩnh, đồ gắn tường nhúng sâu vào khối nhà. Chạy: `/tmp/bpyenv/bin/python kiem_xuyen.py`.
- Đã sửa: 2 cây cau cũ đứng giữa vỉa hè (người đi bộ xuyên, lá chạm nóc xe van) → xoá; rễ cây chìa ra làn xe → dời cây vào giữa bồn; xe đỗ chồng lên bồn cây, thùng rác chồng lên bồn → dời; cột ô quán trà xuyên qua bàn, cột ô bà bán rau xuyên qua nón → dời sang bên; ghế quán chạm chân bàn; chú bánh mì ngồi cắm chân vào xe đẩy, bánh xe đẩy nằm lọt trong thân xe → dời; xe máy trong hẻm đuổi kịp nhau → cùng tốc độ; người đi bộ chạm rổ người bán → lối đi dời −6,43; 3 chuồng cọp nhà cuối sân cắm vào khối nhà đối diện → dời vào đúng mặt tiền.
- Kết quả sau sửa: 0 va chạm xe/người với đồ tĩnh, 0 xe-xe; còn lại chỉ là các bộ phận của cùng một nhân vật/xe (đùi–hông, bánh mì trong tủ kính, cây trong bồn).

## 13/11 đêm: S12 Thế giới trong gương (`the_gioi_guong.py`)
- Bản dựng riêng (không dùng phòng trọ): **Deep Teal Abyss #051824** + sương thể tích (Volume Scatter trong World); **mặt nước vô tận** phản chiếu (Fresnel Glossy ↔ Diffuse tối, Wave rings + noise làm gợn, phase chạy theo khung → sóng lan; đốm lân tinh Voronoi); **khung gương gỗ lơ lửng** cách mặt nước ~0,6 m, nhấp nhô; **Nam chìm dần** (hình nhân tạm, hạ theo khung 1→96, 2 tay giơ về gương), 4 vòng sóng nở quanh Nam, 16 bọt khí nổi; **bóng phòng trọ đảo ngược 180°** (khung dây sáng mờ: phòng 3×4×2,8 m, nệm, bàn học đảo bên, cửa, gương) ở xa 14 m phía sau.
- Camera: `WIDE` (FORE gợn sóng – MID gương + Nam – BACK bóng tối), `FORE` (thấp sát mặt nước), `MID`, `BACK` (nhìn vào bóng tối, không lối thoát), `CAN_GUONG`, `TOP`. Chạy: `/tmp/bpyenv/bin/python the_gioi_guong.py --cam WIDE --frames 1,48,96 --out ảnh.png`. Ảnh: `xem-thu/the-gioi-guong/`.
- Chưa làm: Nam là hình nhân tạm (chưa nhân vật modular, chưa có chìm theo mặt phẳng cắt như `kinh_nuoc.py`); mặt gương còn nhạt/trắng do phản xạ sương; chưa nối với shot `KINH_NUOC` trong phòng thật; chưa có Người Kia trong thế giới gương; chưa render video; Cycles thể tích hơi chậm (xem thời gian ở dưới nếu đo).

### S12 bản hoàn chỉnh: phòng trọ đảo ngược 100% (13/11 đêm)
- `the_gioi_guong.py` giờ **dựng đúng phòng thật** (cùng hàm `shell/kitchen/wardrobe/desk_and_chair/bed/fan/mirror/clutter/wall_details`) rồi **lật gương qua mặt phẳng x = 0** (parent scale x = −1): bàn học chuyển sang bên đối diện, cửa và cửa sổ đổi tường, bếp/tủ/nệm/quạt/gương đảo trái–phải, chữ trên đồ vật cũng đảo như phản chiếu thật. Không còn khung dây.
- Sàn gạch bỏ, thay bằng **mặt nước vô tận** (sóng lan, lân tinh); đèn phòng thật gỡ hết, chỉ còn ánh Deep Teal (trần mờ, quầng quanh gương, lân tinh hắt lên); cửa sổ và cửa mở ra vực tối; sương thể tích mỏng. Nam (hình nhân tạm) chìm dần trước chiếc gương đứng (đã đảo sang tường kia), có vòng sóng + bọt khí.
- Camera: mọi camera phòng thật (`WIDE`, `DESK`, `BED`, `DOOR`, `KITCHEN`, …) dùng lại với toạ độ thiết kế − W nên cùng bố cục với phòng thật (dễ dựng cắt ghép trước/sau gương) + `NAM_CHIM`, `GUONG_CAN`, `TOP`. Ảnh: `xem-thu/the-gioi-guong/phong-dao-*.png`.
- Hạn chế: Nam hình nhân tạm; chưa có Người Kia; vài đồ ngoài phòng (bóng đen phía dưới ở `WIDE` là mặt nước tối ngoài tường trước); chưa render video.
