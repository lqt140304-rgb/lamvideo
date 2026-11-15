# Thử 10 bộ quần áo trên mẫu nam 18–20 (`nam-002`) khi chuyển động — thiết kế

## Mục đích
Chủ repo chọn `assets/nhan-vat-3d/nam-002/` (bản rig đầy đủ chủ repo đẩy main `d8a3502`: 1,70 m, dáng chữ T, xương Mixamo, IK chân/tay, xương phụ vai, nắm tay, mắt 3D/biểu cảm, đi bộ 32 khung) làm khuôn nhân vật nam. Cần biết các bộ quần áo đã có trong repo mặc lên mẫu này có **hoạt động tốt** không. Định nghĩa của chủ repo: nhân vật mặc vào, đi lại và vận động mà **không lỗi, không rách, không vướng vào tay chân, không lộ da**.

## Mục tiêu / không làm / thất bại
- Mục tiêu: 10 bộ trong `QA.OUTFITS` (`xanh`, `ngu`, `xam-tui`, `dong-phuc`, `the-thao`, `hoodie`, `khoac-gio`, `so-mi-khoac`, `sweatshirt`, `tung-bong-da`) mặc lên `nam-002`, gắn rig, chạy vòng đi bộ và bộ tư thế thử, có số đo và ảnh từng bộ; sửa tới khi đạt hoặc ghi rõ lỗi còn lại theo vị trí.
- Không làm: thiết kế bộ đồ mới, đổi màu/dáng đã có, mô phỏng vải, mắt/mày/miệng, đưa vào tập nào.
- Thất bại dù chạy được: quần áo bó sát mất dáng rộng; che lỗi bằng cách phóng to cả bộ đồ; báo đạt khi chỉ kiểm tư thế đứng.

## Ràng buộc
- Không sửa `dung_quan_ao_nam.py`, `thu_quan_ao_goc.py`, các script và `nam-002.glb` trong `assets/nhan-vat-3d/nam-002/` (dùng lại hàm/cấu hình qua import).
- File mới trong `assets/nhan-vat-3d/nam-002/quan-ao/`; `.blend`/ảnh/video nặng không commit (ảnh duyệt nhỏ `.webp` được commit). Nhánh làm việc, không đẩy main.
- Blender bpy 5.x headless; duyệt bằng ảnh tĩnh và bảng ghép; video chỉ khi chủ repo cần.
- Giấy phép nguồn `nam-002` chưa xác minh (README) — ghi trong báo cáo, không ảnh hưởng việc thử.

## Các cách đã cân nhắc
| Cách | Được | Mất |
|---|---|---|
| **A. Dựng lại theo mốc khớp `nam-002` + quần áo theo xương (đã chọn)** | Giữ dáng rộng đã thiết kế; kiểm được trên chính rig/đi bộ của mẫu | Phải sửa cục bộ nách/háng/gấu |
| B. Quần áo đẩy phồng từ da | Hầu như không xuyên | Mất dáng rộng, áo bó như đồ lặn |
| C. Mô phỏng vải | Vải tự nhiên | Chậm, không ổn định, khó kiểm hàng loạt |

Chủ repo chọn A (15/11/2026) và chỉ định làm trên bản `nam-002` rig đầy đủ.

## Cách làm (A)
1. **Rig mẫu:** chạy `nam-002/rig_nam002.py` → `nam-002-rig.blend`, `di_bo_nam002.py` → vòng đi bộ; lưới nghỉ là dáng chữ T nên quần áo dựng theo dáng chữ T và tư thế thử gồm cả "tay buông" (hạ 80°) (dùng nguyên, không sửa).
2. **Đo mốc khớp `nam-002`** từ vị trí xương rig (vai, khuỷu, cổ tay, hông, gối, cổ chân, cổ, ngực, eo) và tiết diện thân ở các mức z → bảng `J_NAM002` + kích thước vòng thân/chi.
3. **Dựng quần áo:** dùng lại các hàm dựng của `thu_quan_ao_goc.py`/`dung_quan_ao_nam.py`, thay mốc khớp/tiết diện bằng số đo `nam-002` (co giãn theo tỉ lệ chiều cao và độ rộng đo được, giữ khoảng dư dáng rộng của từng bộ). Đẩy ra ngoài da tối thiểu (khoảng cách an toàn, như `_push_outside_bvh`). Dép kê chân như bản gốc nếu bộ có dép.
4. **Gắn rig:** mỗi mảnh quần áo nhận Armature của mẫu; weights chép từ đỉnh da gần nhất (Data Transfer, bề mặt gần nhất nội suy) rồi làm mượt theo cạnh vải; phần rộng xa da (gấu ống, vạt áo) lấy weights của vùng da tương ứng theo trục chi/thân, không lấy xương bên kia.
5. **Tư thế thử:** vòng đi bộ 32 khung (mọi khung) + tĩnh: tay buông, giơ tay 90°/150°, đưa tay trước 80°, gập khuỷu 120°, bước dài, ngồi (đùi ngang), cúi 30°, vặn thân 30°, nắm tay.
6. **Đo ở mỗi khung/tư thế** (cho từng bộ):
   - *Da xuyên vải*: số đỉnh da nằm ngoài lớp vải ở vùng vải che (khoảng cách có dấu tới mặt vải < 0), độ sâu lớn nhất.
   - *Vướng tay chân*: mặt vải của thân giao với mặt vải/da của tay hoặc chân phía khác (BVH, trừ mặt chung đỉnh); vải tự cắt.
   - *Rách*: cạnh vải giãn > 1,6× hoặc co < 0,5× so với lúc nghỉ; mặt vải lật.
   - *Lộ da*: ở mép cổ áo, nách, eo (gấu áo–cạp quần), gấu tay, gấu quần: khoảng hở thấy da giữa hai lớp ở chỗ đáng lẽ kín (ví dụ eo khi giơ tay) — đo bằng tia từ camera trước/sau/nghiêng + kiểm phủ vùng da cần che.
   Ngưỡng đạt: 0 da xuyên sâu > 1 mm, 0 vướng, 0 rách, 0 lộ da ngoài chỗ thiết kế để hở; ghi số và vị trí khi không đạt.
7. **Sửa:** theo thứ tự weights → khoảng dư/hình vải cục bộ → shape key sửa lái theo góc xương (như sửa nếp nách rig cũ). Không phóng to cả bộ.
8. **Bàn giao:** `KET-QUA-QUAN-AO.md` trong thư mục mẫu (bảng 10 bộ × tư thế: đạt/lỗi, vị trí, nguyên nhân geometry/weights/điều khiển), bảng ảnh nhỏ mỗi bộ (đứng, đi bộ 4 khung, tư thế khó), cập nhật README mẫu + `docs/ASSET.md` nếu cần; commit nhánh làm việc.

## Để người làm quyết
Thứ tự thử bộ (đề xuất: `xanh` trước làm chuẩn rồi nhân rộng), độ phân giải ảnh, số vòng làm mượt weights, giá trị khoảng cách an toàn cụ thể từng bộ.
