# NAM-003 — khuôn mẫu sạch từ Hyper3D (rig thân, chưa có mặt)

Khuôn mẫu cho Nam, Người Kia, Tùng và nhân vật phụ (chủ repo chốt hướng này 15/11/2026, bỏ hướng modular). Nguồn: [nguon/base_2.glb](nguon/base_2.glb), do chủ repo cung cấp, mô hình sạch từ Hyper3D.

![10 tư thế thử](bang-dang-thu.webp)

## Mô hình gốc (đo ngày 15/11/2026)
| Mục | Giá trị |
|---|---|
| Kích thước | cao 1,824 m; sải tay 1,774 m; T-pose, tay chếch lên nhẹ |
| Lưới | tam giác; 47.736 đỉnh → **44.629** sau khi hàn đỉnh trùng ở đường nối UV; một khối kín, 0 cạnh hở, 0 cạnh >2 mặt, thể tích dương |
| Đối xứng | trái–phải lệch 0,0 mm |
| Vật liệu | một vật liệu xám, **không có texture ảnh** |
| Mặt | hốc mắt nông, sống mũi, tai nhỏ; **chưa có mắt, mày, môi/miệng**; đầu trọc |
| Bàn tay | **4 ngón (3 ngón dài + ngón cái)**, hai tay giống nhau. Chủ repo chấp nhận phong cách này |

## Rig
```
blender -b --factory-startup --python rig_nam003.py -- --out nam-003-rig.blend [--glb nam-003-rig.glb] [--anh dir]
```
Dựng trong khoảng 2 phút. Tên xương theo Mixamo; ngón dùng Index, Middle, Ring, Thumb (không có Pinky). Tối đa 4 xương/đỉnh. Script **tái dùng** thuật toán của [../nam-002/rig_nam002.py](../nam-002/rig_nam002.py) (đọc file đó, bỏ dòng gọi `main()`, vá hằng số), nên nếu sửa `rig_nam002.py` thì bản này cũng đổi theo.

**Số đo kéo giãn cạnh (cạnh giãn >2×; max)** trên 11 tư thế của `rig_nam002.py`: nghỉ, tay buông, tay xiên 45°, giơ tay cao, gập khuỷu, nắm tay, quay đầu, cúi đầu, xoay thân, bước chân đều **0 cạnh** (max 1,39–1,78×); ngồi xổm 4 cạnh (max 2,15×). Lưu ý: `nam-002` có rất nhiều cạnh ngắn dưới 3 mm nên con số của hai lưới không so trực tiếp được; theo độ dài thêm tuyệt đối thì hai lưới tương đương.

## Chưa chắc / chưa làm
- **Cổ chân** chọn bằng đo biến dạng (z 0,14, y 0,04; mục "Cổ và cổ chân"). Khuỷu và gối cũng chọn bằng thử nhiều vị trí rồi đo (mục dưới).
- **Trọng số dùng ánh xạ tọa độ** về khung của `nam-002` (hàm `MAPCO`): mốc ngưỡng của `clean_weights` vẫn là của lưới kia. Đây là xấp xỉ.
- **Cổ** đã làm lại (xương phụ `NeckBlend1/2` + Corrective Smooth riêng, mục "Cổ và cổ chân"); chưa có shape key sửa theo góc, và chỉ chạy trong Blender (GLB không mang ràng buộc).
- Chưa có: mắt, mày, miệng, biểu cảm, khẩu hình; áo quần; chu kỳ đi bộ; nốt ruồi; chiều cao 1,60 m (Nam) và 1,70 m (Tùng); kiểm các tư thế đi, ngồi sâu.
- Chưa kiểm ngón tay khi nắm trên lưới 4 ngón bằng cận cảnh nhiều góc; chưa đặt góc cuộn riêng cho lưới này.
- [nam-003-rig.blend](nam-003-rig.blend) (4 MB, **v3**: khuỷu, gối, cổ chân đã chọn bằng đo; cổ có xương phụ; chưa có mặt) để bên làm mặt có file mở ngay; dựng lại bằng lệnh trên. Giao việc làm mặt: [BAN-GIAO-MAT.md](BAN-GIAO-MAT.md). Chưa đưa `.glb` đã rig lên repo.

## Chọn vị trí khớp bằng đo biến dạng (15/11/2026)
Tay chân duỗi thẳng nên không có điểm khớp rõ trên lưới. Đo hình học chỉ cho gợi ý (gối: chỗ rộng nhất z ≈ 0,46; chỗ hẹp nhất phía trên cổ chân z ≈ 0,17), và gợi ý về khuỷu (chỗ hẹp x ≈ 0,39–0,42) **sai** so với kết quả đo biến dạng. Vì vậy mình dựng rig với nhiều vị trí khớp rồi đo cạnh giãn và cạnh co trên các tư thế (`NAM003_J='{"elbow":[x,y,z]}' python rig_nam003.py ...`). Tiêu chí: số cạnh giãn >1,5× và co <0,6× (cạnh dài hơn 3 mm lúc nghỉ), giá trị lớn nhất.

| Thử | khuỷu gập: giãn >1,5× | ngồi xổm: co <0,6× | ngồi xổm: giãn max |
|---|---|---|---|
| Khuỷu x 0,41 / 0,44 / 0,47 / 0,50 / 0,53 / 0,56 | 163 / 54 / 34 / **20** / 12 / 10 | | |
| Gối y 0,02 (cũ) / 0,03 / 0,04 / 0,056 (kèm hông x 0,105) | | 1716 / 1391 / **915** / 1077 | 2,15 / 2,11 / **1,89** / 2,12 |
| Hông x 0,09 → 0,105 | | tệ hơn (1841) | |
| Gối z 0,46 → 0,50 | | 859 | 2,05 (tệ hơn) |

Chọn **khuỷu x = 0,50, gối y = 0,04 (z = 0,46), hông giữ x = 0,09**. Khuỷu tiếp tục tốt hơn một chút khi dời xa vai (0,53, 0,56) nhưng quá 0,50 không hợp giải phẫu (cẳng tay chỉ còn 16 cm so với cánh tay trên 29 cm), nên dừng ở 0,50. Kết quả bản chọn: ngồi xổm 0 cạnh giãn >2× (trước đó 4), giãn tối đa 1,89×; mọi tư thế khác 0 cạnh giãn >2×. Ảnh: [khop-thu.webp](khop-thu.webp).
**Hạn chế:** chỉ đo trên dáng của `rig_nam002.py` (11 tư thế); chưa thử áo quần; cổ chân chỉ đo bằng cạnh giãn/co (xem mục Cổ và cổ chân). Chọn vị trí khớp dựa trên số cạnh giãn/co, không phải đánh giá mắt nhìn đầy đủ.

## Cổ và cổ chân (15/11/2026)
Thiết kế: [spec](../../docs/superpowers/specs/2026-11-15-nam003-co-va-co-chan-design.md); kế hoạch: [plan](../../docs/superpowers/plans/2026-11-15-nam003-co-va-co-chan.md). Chủ repo yêu cầu: cổ ổn định như người thật, quay cận mặt không tì vết, cảnh xa chỉ cần ổn.

**Cách làm (B + C):** hai xương phụ `NeckBlend1/2` (con của `Neck`, Copy Rotation LOCAL từ `Head`, ảnh hưởng 0,33 và 0,66) chia xoắn dọc cổ; trọng số `Spine2` → `Neck` → `NeckBlend1` → `NeckBlend2` → `Head` theo gradient z (1,46–1,60, làm mượt 10 vòng); Corrective Smooth thứ hai (`CorrectiveSmoothCo`, nhóm `cs_co`, 150 vòng, hệ số 1,0, tắt hẳn từ z 1,61 để không chạm vùng mặt). Xương `Head` và trọng số đầu (z ≥ 1,60) **không đổi**. Mã: `co_nam003.py`; đo: `kiem_co_nam003.py --rig nam-003-rig.blend [--scale S] [--anh dir]` (8 test).

**Số đo (cạnh dài thêm max, mm; vùng cổ z 1,40–1,66):**
| Tư thế | Trước | Sau B | Sau B+C |
|---|---|---|---|
| quay +35° | 12,90 | 5,64 | **2,76** |
| cúi +25° | 10,76 | 6,80 | **3,21** |
| quay 35° + cúi 15° | 14,07 | 6,95 | **3,93** |
Mọi tư thế sau B+C ≤ 3,93 mm (ngưỡng 6 mm; `nam-002` ~5,4 mm). Cạnh giãn >1,5× **và** dài thêm >3 mm: 0 ở mọi tư thế; tính cả cạnh ngắn dài thêm ≤ 3 mm, `kq1` còn 4 cạnh (hai bên cổ dưới tai). Đo giống nhau ở 1,0 / 0,877 (1,60 m) / 0,932 (1,70 m); dựng lại hai lần cho số đo giống hệt. Thử tham số (quay +35°): 80 vòng làm mượt trọng số 15,05 mm, 30 vòng 7,04, 10 vòng 5,64; Corrective Smooth 10/20/40/80/150 vòng: 5,29 / 4,75 / 4,49 / 3,95 / 3,67 (hệ số 1,0).

![Ảnh cận cổ/cằm: quay +35°, kq1, cúi +25°; 1,60 m rồi 1,70 m](co-thu.webp)

**Cổ chân:** 12 tổ hợp z 0,08–0,14 × y 0,04–0,06 qua buoc_chan, ngoi_xom, nhac_chan_IK, mui_chan (`chon_co_chan_nam003.py`): tổng cạnh giãn+co 1945–2563, y 0,04 luôn tốt nhất, z ít khác biệt (z 0,08: 1945; 0,10: 2006; 0,12: 2071; 0,14: 2182). Chọn **z 0,14, y 0,04** vì chỉ z 0,14 đưa ngồi xổm giãn tối đa về 1,85× (z 0,10 cho 1,93×, vượt ngưỡng 1,89× của thiết kế); chấp nhận tổng giãn+co hơn z 0,10 khoảng 9 %.
**Hồi quy 11 tư thế:** 0 cạnh giãn >2× ở mọi tư thế; ngồi xổm max 1,85×.

**Hạn chế:** ảnh cận cho thấy cổ liền mạch, nếp gáy nhẹ hơn rig cũ, không thấy rách/thắt; chưa khẳng định "không tì vết": chủ repo duyệt ảnh. Chỉ đo trên mô hình trơn; chưa thử áo quần cổ cao, tóc, mặt. Xương `NeckBlend` dùng ràng buộc nên **GLB xuất ra không mang xoắn cổ** (cần bake nếu dùng ngoài Blender). Chọn cổ chân dựa trên cạnh giãn/co, chưa xem kỹ bàn chân khi nhón gót bằng ảnh cận. Corrective Smooth 150 vòng nặng hơn khi tính biến dạng (chưa đo tốc độ).

## Mặc đồ (15/11/2026)
`mac_do_nam003.py` có `chuyen_trong_so(ob, body, arm, loai, che_do='tho')` và bài đo (`<bpy-python> mac_do_nam003.py --rig nam-003-rig.blend`). Đo trên áo phông và quần dài thử qua 8 tư thế: tổng đỉnh xuyên mới so với dáng nghỉ: Data Transfer thô 358, thêm làm mượt chọn lọc 365, cách 1B của phiên thử quần áo độc lập 369: **không cách nào hơn rõ rệt, nên dùng thô**. Còn xuyên: áo ở khuỷu gập (107 đỉnh, sâu 7,5 mm); quần khi nhấc chân (49) và ngồi xổm (193, sâu 7,8 mm). Cùng cách đo, `nam-002` cho quần nhấc chân 856 và ngồi xổm 1669, tức rig v3 của `nam-003` tốt hơn nhiều cho áo quần. Chưa thử áo quần thật; hướng dẫn chung ở [../nam-002/HUONG-DAN-MAC-DO.md](../nam-002/HUONG-DAN-MAC-DO.md) (tên xương và tư thế giống).
