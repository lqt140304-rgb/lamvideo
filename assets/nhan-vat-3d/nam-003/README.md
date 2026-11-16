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

**Số đo kéo giãn cạnh (cạnh giãn >2×; max)** trên 11 tư thế của `rig_nam002.py`: nghỉ, tay buông, tay xiên 45°, giơ tay cao, gập khuỷu, nắm tay, quay đầu, cúi đầu, xoay thân, bước chân đều **0 cạnh** (max 1,39–1,78×); ngồi xổm 4 cạnh (max 2,15×). Lưu ý: `nam-002` có rất nhiều cạnh ngắn dưới 3 mm nên con số của hai lưới không so trực tiếp được; theo độ dài thêm tuyệt đối thì hai lưới tương đương.

## Chưa chắc / chưa làm
- **Khuỷu, gối, cổ chân là ước lượng** (tay chân duỗi thẳng nên không có điểm nổi bật); y đặt lệch 1–2 cm để IK gập đúng chiều.
- **Trọng số dùng ánh xạ tọa độ** về khung của `nam-002` (hàm `MAPCO`): mốc ngưỡng của `clean_weights` vẫn là của lưới kia. Đây là xấp xỉ.
- **Cổ:** quay đầu 35° tạo nếp gấp dưới hàm ở góc nghiêng; đo thử dài thêm khoảng 13 mm (so với ~5 mm của `nam-002`). Cần chỉnh trọng số cổ.
- Chưa có: áo quần; chu kỳ đi bộ; kiểm các tư thế đi, ngồi sâu. (Mặt, biểu cảm, khẩu hình, nốt ruồi, chiều cao: xem mục Mặt.)
- Chưa kiểm ngón tay khi nắm trên lưới 4 ngón bằng cận cảnh nhiều góc; chưa đặt góc cuộn riêng cho lưới này.
- [nam-003-rig.blend](nam-003-rig.blend) (4 MB, **v1**, chưa có mặt, vị trí khuỷu/gối/cổ chân còn ước lượng) để bên làm mặt có file mở ngay; dựng lại bằng lệnh trên. Giao việc làm mặt: [BAN-GIAO-MAT.md](BAN-GIAO-MAT.md). Chưa đưa `.glb` đã rig lên repo.

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
