# NAM-003 — khuôn mẫu sạch từ Hyper3D (rig thân + mặt theo tham số)

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

**Số đo kéo giãn cạnh (cạnh giãn >2×; max)** trên 11 tư thế của `rig_nam002.py` (bản rig v3, 15/11/2026): **0 cạnh giãn >2× ở mọi tư thế**; giãn tối đa 1,35–1,59× ở các tư thế trên người và tay, ngồi xổm 1,80×. Lưu ý: `nam-002` có rất nhiều cạnh ngắn dưới 3 mm nên con số của hai lưới không so trực tiếp được.

## Chưa chắc / chưa làm
- **Cổ chân** chọn bằng đo biến dạng (z 0,14, y 0,04; mục "Cổ và cổ chân"). Khuỷu và gối cũng chọn bằng thử nhiều vị trí rồi đo (mục dưới).
- **Trọng số dùng ánh xạ tọa độ** về khung của `nam-002` (hàm `MAPCO`): mốc ngưỡng của `clean_weights` vẫn là của lưới kia. Đây là xấp xỉ.
- **Cổ** đã làm lại (xương phụ `NeckBlend1/2` + Corrective Smooth riêng, mục "Cổ và cổ chân"); chưa có shape key sửa theo góc, và chỉ chạy trong Blender (GLB không mang ràng buộc).
- Chưa có: áo quần; chu kỳ đi bộ; kiểm các tư thế đi, ngồi sâu. (Mặt, biểu cảm, khẩu hình, nốt ruồi, chiều cao: xem mục Mặt.)
- Chưa kiểm ngón tay khi nắm trên lưới 4 ngón bằng cận cảnh nhiều góc; chưa đặt góc cuộn riêng cho lưới này.
- [nam-003-rig.blend](nam-003-rig.blend) (4 MB, **v3**: khuỷu, gối, cổ chân đã chọn bằng đo; cổ có xương phụ + Corrective Smooth; chưa có mặt) để bên làm mặt có file mở ngay; dựng lại bằng lệnh trên. Giao việc làm mặt: [BAN-GIAO-MAT.md](BAN-GIAO-MAT.md). Chưa đưa `.glb` đã rig lên repo.

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
Thiết kế: [spec](../../../docs/superpowers/specs/2026-11-15-nam003-co-va-co-chan-design.md); kế hoạch: [plan](../../../docs/superpowers/plans/2026-11-15-nam003-co-va-co-chan.md). Yêu cầu của chủ repo: cổ ổn định như người thật, quay cận mặt không tì vết, cảnh xa chỉ cần ổn.

**Cách làm (B + C):**
- Hai xương phụ `NeckBlend1/2` (con của `Neck`, Copy Rotation LOCAL từ `Head`, ảnh hưởng 0,33 và 0,66) chia xoắn dọc cổ. Trọng số `Spine2` → `Neck` → `NeckBlend1` → `NeckBlend2` → `Head` theo gradient z (1,46–1,60, làm mượt 10 vòng), chỉ động tới các nhóm xương (nhóm phụ `cs_*` giữ nguyên). Vùng hàm/cằm (y < −0,05, z ≥ 1,55) cho `Head` đạt 1 sớm hơn 3 cm để cằm gắn chặt vào đầu (từ z 1,565 `Head` ≥ 0,75).
- Corrective Smooth thứ hai `CorrectiveSmoothCo` (nhóm `cs_co`, 150 vòng, hệ số 1,0), tắt hẳn từ z 1,61 và không phủ vùng hàm/cằm, để không làm mềm shape key miệng/cằm của bên làm mặt.
- Xương `Head`, trọng số đầu (z ≥ 1,60) và vị trí `Head` không đổi (đã kiểm: 0/4026 đỉnh z ≥ 1,60 đổi trọng số so với v2). Mã: `co_nam003.py`; đo: `kiem_co_nam003.py --rig nam-003-rig.blend [--scale S] [--anh dir]` (11 test).

**Số đo (cạnh dài thêm max, mm; vùng cổ z 1,40–1,66):**
| Tư thế | Trước (v2) | Rig v3 |
|---|---|---|
| quay +35° | 12,90 | **2,66** |
| quay −35° | 11,29 | 2,95 |
| cúi +25° | 10,76 | 3,04 |
| quay 35° + cúi 15° | 14,07 | 3,75 |
Mọi tư thế ≤ 3,75 mm (ngưỡng 6 mm; `nam-002` ~5,4 mm) và **0 cạnh giãn >1,5×** (mọi cạnh, đúng chữ thiết kế). Dựng lại hai lần cho số đo giống hệt. Lưu ý: đo ở scale 0,877 và 0,932 luôn ra cùng số vì đo trong toạ độ cục bộ của lưới; chúng chỉ chứng minh scale không phá rig, không phải bằng chứng độc lập.

**Khi tắt Corrective Smooth (ví dụ khi xuất sang engine không có nó):** quay +35° còn 8,97 mm, tối đa 10,12 mm (tắt mọi Corrective Smooth, giữ ràng buộc `NeckBlend`), tốt hơn nền 12,90 mm khoảng 30 %. Đây là kết quả của gradient trọng số; phần còn lại đến từ Corrective Smooth. Reviewer độc lập từng đo bản đầu (gradient cũ) cho 20,8 mm khi tắt mọi Corrective Smooth, tệ hơn v2; vì vậy trọng số đã được sửa (nhóm phụ không bị chuẩn hóa, vùng hàm xử lý bằng dịch z, không loại khỏi gradient). **GLB xuất ra không mang ràng buộc `NeckBlend` nên xoắn cổ phải bake animation**; tương thích engine khác chưa kiểm.

![Ảnh cận cổ/cằm: quay +35°, quay 35° + cúi 15°, cúi +25°; 1,60 m rồi 1,70 m (tay hạ, đèn phụ)](co-thu.webp)

**Ảnh cận:** cổ liền mạch ở cả 1,60 m và 1,70 m, không thấy rách hay thắt; mặt dưới cằm khi cúi mịn hơn v2. Dải sáng ở đường nối cổ-vai (ảnh bên) có ở cả v2, không do rig mới. Hai chiều cao là cùng một lưới scale đều nên không phải hai bằng chứng độc lập. Chưa khẳng định "không tì vết": chủ repo duyệt ảnh.

**Cổ chân:** 12 tổ hợp z 0,08–0,14 × y 0,04–0,06 qua buoc_chan, ngoi_xom, nhac_chan_IK, mui_chan (`chon_co_chan_nam003.py`): tổng cạnh giãn+co 1945–2563, y 0,04 luôn tốt nhất, z ít khác biệt (z 0,08: 1945; 0,10: 2006; 0,12: 2071; 0,14: 2182; chênh nhỏ so với nhiễu). Chọn **z 0,14, y 0,04** vì ngưỡng ngồi xổm ≤ 1,89× của thiết kế (z 0,10 cho 1,93×); script tự chọn thuần theo tổng giãn+co sẽ in z 0,08, khác giá trị đang dùng. Biên lưới thử là z 0,14 (z 0,16 chưa thử).
**Hồi quy 11 tư thế:** 0 cạnh giãn >2× ở mọi tư thế; ngồi xổm max 1,80×.

**Hạn chế còn lại:** chỉ đo trên mô hình trơn; chưa thử áo quần cổ cao, tóc, mặt (shape key mặt thật dưới `CorrectiveSmoothCo` chưa kiểm); chưa xuất GLB thật; Corrective Smooth 150 vòng nặng hơn khi tính biến dạng (chưa đo tốc độ); chọn cổ chân dựa trên số cạnh giãn/co, chưa xem ảnh cận bàn chân.

## Mặc đồ (15/11/2026)
`mac_do_nam003.py` có `chuyen_trong_so(ob, body, arm, loai, che_do='tho')` và bài đo (`<bpy-python> mac_do_nam003.py --rig nam-003-rig.blend`). Đo trên áo phông và quần dài thử qua 8 tư thế: tổng đỉnh xuyên mới so với dáng nghỉ: Data Transfer thô 358, thêm làm mượt chọn lọc 365, cách 1B của phiên thử quần áo độc lập 369: **không cách nào hơn rõ rệt, nên dùng thô**. Còn xuyên: áo ở khuỷu gập (107 đỉnh, sâu 7,5 mm); quần khi nhấc chân (49) và ngồi xổm (193, sâu 7,8 mm). Cùng cách đo, `nam-002` cho quần nhấc chân 856 và ngồi xổm 1669, tức rig v3 của `nam-003` tốt hơn nhiều cho áo quần. Chưa thử áo quần thật; hướng dẫn chung ở [../nam-002/HUONG-DAN-MAC-DO.md](../nam-002/HUONG-DAN-MAC-DO.md) (tên xương và tư thế giống).

## Mặt theo tham số (16/11/2026)
Một bộ script, mỗi nhân vật là một khóa trong [nhan_vat_nam003.py](nhan_vat_nam003.py) (khóa thiếu lấy `MAC_DINH`). Hiện có `tung` (1,70 m) và `nam` (1,60 m, nốt ruồi trái).
```
blender -b --factory-startup --python rig_mat_nam003.py -- --in nam-003-rig.blend --nv tung --out tung.blend [--kiem] [--anh dir]
blender -b --factory-startup --python clip_thu_nam003.py -- --in tung.blend --out clip.blend [--kiem] [--anh dir --thu-nho 8] [--mp4 clip.mp4]
```
Khoảng 1–2 phút không ảnh, ~10 phút kèm `--anh`. Thứ tự: bóp mặt → đo mốc → mắt ([mat3d](mat3d_nam003.py)) → mày ([may3d](may3d_nam003.py)) → miệng ([mieng](mieng_nam003.py)) → nốt ruồi, chiều cao ([bieu_cam](bieu_cam_nam003.py)).

| Phần | Cách dựng | Điều khiển (thuộc tính trên xương `Head`) |
|---|---|---|
| Mắt | nhãn cầu bám xương `nhin`; mí khoét lỗ + may liền vào da, subsurf `Muot` | `chop_mat`, `chop_trai`, `chop_phai`, `mo_to`; xương `nhin` để liếc |
| Mày | dải lưới chiếu lên da, con của `Head` | `may_nhuong`, `may_ha`, `may_cau`, `may_buon`, `may_trai_nhuong`, `may_phai_nhuong` |
| Miệng | khe trên da (không môi, `moi=False`), khoang, răng, lưỡi; xương `jaw` theo `mieng_ha` (13°) | `mieng_ha`, `mieng_rong`, `mieng_hep`, `cuoi`, `meu`, `mieng_khep` |

`bieu_cam_nam003.dung_bieu_cam(arm, ten)`: mac_dinh, ngac_nhien, tuc_gian, buon, vui, nghi_ngo, so_hai, mo_mang. `dung_viseme(arm, ten)`: nghi, A, E, I, O, U, MBP, PHV, NT, CH, KG (tên nam-002 `a`, `mbp`, `khac`… là bí danh).

**Kiểm (`--kiem`, 16/11/2026):** mốc, mắt (khe khi nhắm < 1 mm), mày, miệng (tia qua khe há trúng khoang), biểu cảm (đủ thuộc tính, cao đúng ±5 mm, ≤ 4 xương/đỉnh) đều PASS cho `tung` và `nam` không sửa mã. Dựng `tung` hai lần: số đỉnh mọi object giống hệt (Nam_Body 50.924). Xuyên da của mày/nốt ruồi khi quay đầu ±35°, cúi 25°: Tùng 0,30 mm, Nam 0,26 mm (< 0,5 mm).

Ảnh: [mắt](xem/mat.webp), [mày](xem/may.webp), [miệng](xem/mieng.webp), [biểu cảm](xem/bieu-cam.webp), [khẩu hình](xem/khau-hinh.webp), [Tùng–Nam](xem/tung-nam.webp), [clip thử 12 khung](xem/clip-thu.webp).

**Còn lại:** chấm nhỏ trên/dưới mí khi nhắm (chỉ thấy cận cảnh); vệt nối mờ quanh mắt; răng dưới, lưỡi ít lộ; không môi nên PHV ≈ MBP, NT ≈ CH; quay đầu trong clip xoay theo trục local của `Head`, chưa chia cho `Neck`; chưa xem video chuyển động (chỉ bảng khung); file `.blend` nhân vật không đưa lên repo, dựng lại bằng lệnh trên.

