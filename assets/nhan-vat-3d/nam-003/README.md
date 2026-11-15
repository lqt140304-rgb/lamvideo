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
- **Cổ chân vẫn là ước lượng** (z ≈ 0,105). Khuỷu và gối đã chọn bằng thử nhiều vị trí rồi đo biến dạng (mục dưới).
- **Trọng số dùng ánh xạ tọa độ** về khung của `nam-002` (hàm `MAPCO`): mốc ngưỡng của `clean_weights` vẫn là của lưới kia. Đây là xấp xỉ.
- **Cổ:** quay đầu 35° tạo nếp gấp dưới hàm ở góc nghiêng; đo thử dài thêm khoảng 13 mm (so với ~5 mm của `nam-002`). Cần chỉnh trọng số cổ.
- Chưa có: mắt, mày, miệng, biểu cảm, khẩu hình; áo quần; chu kỳ đi bộ; nốt ruồi; chiều cao 1,60 m (Nam) và 1,70 m (Tùng); kiểm các tư thế đi, ngồi sâu.
- Chưa kiểm ngón tay khi nắm trên lưới 4 ngón bằng cận cảnh nhiều góc; chưa đặt góc cuộn riêng cho lưới này.
- [nam-003-rig.blend](nam-003-rig.blend) (4 MB, **v2**: khuỷu và gối đã chỉnh; chưa có mặt, cổ chân còn ước lượng) để bên làm mặt có file mở ngay; dựng lại bằng lệnh trên. Giao việc làm mặt: [BAN-GIAO-MAT.md](BAN-GIAO-MAT.md). Chưa đưa `.glb` đã rig lên repo.

## Chọn vị trí khớp bằng đo biến dạng (15/11/2026)
Tay chân duỗi thẳng nên không có điểm khớp rõ trên lưới. Đo hình học chỉ cho gợi ý (gối: chỗ rộng nhất z ≈ 0,46; chỗ hẹp nhất phía trên cổ chân z ≈ 0,17), và gợi ý về khuỷu (chỗ hẹp x ≈ 0,39–0,42) **sai** so với kết quả đo biến dạng. Vì vậy mình dựng rig với nhiều vị trí khớp rồi đo cạnh giãn và cạnh co trên các tư thế (`NAM003_J='{"elbow":[x,y,z]}' python rig_nam003.py ...`). Tiêu chí: số cạnh giãn >1,5× và co <0,6× (cạnh dài hơn 3 mm lúc nghỉ), giá trị lớn nhất.

| Thử | khuỷu gập: giãn >1,5× | ngồi xổm: co <0,6× | ngồi xổm: giãn max |
|---|---|---|---|
| Khuỷu x 0,41 / 0,44 / 0,47 / 0,50 / 0,53 / 0,56 | 163 / 54 / 34 / **20** / 12 / 10 | | |
| Gối y 0,02 (cũ) / 0,03 / 0,04 / 0,056 (kèm hông x 0,105) | | 1716 / 1391 / **915** / 1077 | 2,15 / 2,11 / **1,89** / 2,12 |
| Hông x 0,09 → 0,105 | | tệ hơn (1841) | |
| Gối z 0,46 → 0,50 | | 859 | 2,05 (tệ hơn) |

Chọn **khuỷu x = 0,50, gối y = 0,04 (z = 0,46), hông giữ x = 0,09**. Khuỷu tiếp tục tốt hơn một chút khi dời xa vai (0,53, 0,56) nhưng quá 0,50 không hợp giải phẫu (cẳng tay chỉ còn 16 cm so với cánh tay trên 29 cm), nên dừng ở 0,50. Kết quả bản chọn: ngồi xổm 0 cạnh giãn >2× (trước đó 4), giãn tối đa 1,89×; mọi tư thế khác 0 cạnh giãn >2×. Ảnh: [khop-thu.webp](khop-thu.webp).
**Hạn chế:** chỉ đo trên dáng của `rig_nam002.py` (11 tư thế); chưa thử áo quần; chưa đo cổ chân và cổ. Chọn vị trí khớp dựa trên số cạnh giãn/co, không phải đánh giá mắt nhìn đầy đủ.
