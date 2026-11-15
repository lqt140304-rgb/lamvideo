# Thiết kế: mặt theo tham số trên khuôn NAM-003, nhân vật thử đầu tiên là Tùng

Ngày 15/11/2026. Đề bài gốc: [BAN-GIAO-MAT.md](../../../assets/nhan-vat-3d/nam-003/BAN-GIAO-MAT.md).

## Mục đích

NAM-003 là khuôn mẫu chung để dựng Nam, Người Kia, Tùng và các nhân vật phụ. Chủ repo muốn thử xem từ khuôn này có ra được nhiều nhân vật hay không. Tùng là nhân vật đầu tiên. Cái cần chứng minh là đổi một bộ tham số thì ra một khuôn mặt khác mà không phải làm lại rig.

## Mục tiêu

1. Một script dùng chung `assets/nhan-vat-3d/nam-003/rig_mat_nam003.py --in nam-003-rig.blend --nv tung --out tung.blend [--anh dir]`.
2. Bảng `NHAN_VAT` trong script, mỗi nhân vật một khóa. Đợt này có `tung`, kèm `nam` ở mức tối thiểu để kiểm rằng khuôn đổi được nhân vật.
3. Mặt Tùng gồm:
   - mắt 3D: nhãn cầu, mống mắt, đồng tử, mí trên và mí dưới;
   - mày 3D;
   - miệng thật: môi, khoang miệng, răng, lưỡi, xương `jaw`;
   - biểu cảm và khẩu hình;
   - da, bóp mặt, cao 1,70 m.
4. Giao diện điều khiển và các tên giữ đúng như đề bài: các thuộc tính trên `Head`, xương `nhin`, `dung_bieu_cam`, `dung_viseme`.

## Không làm đợt này

- Tóc, quần áo, Người Kia đầy đủ.
- Tự đồng bộ khẩu hình với audio.
- Chỉnh rig thân, cổ, khuỷu, gối.
- 18 biểu cảm có tên trong quy chuẩn.

## Điều không được để xảy ra

- Mặt dán hình 2D, hoặc miệng vẽ bị kéo giãn khi há.
- Tham số viết cứng cho riêng Tùng, khiến nhân vật thứ hai phải sửa mã thay vì chỉ thêm dữ liệu.
- Sửa tay trong file `.blend` rồi coi là xong.
- Làm hỏng trọng số thân.

## Ràng buộc

Lấy từ đề bài:
- Blender 5.2.x, chạy `-b --factory-startup`.
- Mọi bộ phận mặt là con của `Nam_Rig`, trọng số 100 % `Head`, tối đa 4 xương trên mỗi đỉnh.
- Nếu khoét `Nam_Body` thì khoét sau bước gán trọng số. Không thêm hoặc bớt đỉnh ở chỗ khác.
- Không bake scale. Chiều cao đặt bằng scale của object.
- Không dùng dịch vụ trả phí. Không commit file `.blend` trên 50 MB.

## Các cách đã cân nhắc

| Cách | Đánh đổi | Kết quả |
|---|---|---|
| **A. Một script, mỗi nhân vật là một bộ tham số** | Lần đầu tốn công hơn. Thêm nhân vật chỉ cần thêm một dòng. | **Chủ repo chọn** |
| B. Làm Tùng riêng, tách tham số sau | Ra Tùng nhanh hơn, nhưng gần như chắc chắn phải viết lại | Loại |
| C. Chép `mat_nam002.py` và `bien_the_nam002.py` | Không dùng được: hai script dựa vào texture có nét vẽ, mà nam-003 không có texture | Loại |

## Cách làm đã chốt

- **Đo mặt tự động** từ lưới: tâm hốc mắt, đỉnh mũi, rãnh miệng, cằm. Mọi kích thước trong bảng tham số đều tương đối với các mốc này, nên dùng được cho cả lưới sau khi bóp.
- **Thứ tự dựng:** bóp mặt → đo → mắt → mày → miệng (khoét, môi, khoang, răng, lưỡi, `jaw`) → shape key và driver → da → scale.
- **Khẩu hình:** dùng bộ 11 khẩu hình của spec mặt nữ (A, E, I, O, U, MBP, PHV, NT, CH, KG, nghi), để nam và nữ đồng bộ. `dung_viseme` vẫn nhận cả 8 tên của nam-002.
- **Bộ tham số của Tùng** lấy từ những gì đã chốt ở nam-002:
  - da `0.92,0.74,0.62`;
  - mày dày ×1,3;
  - mống mắt `0.03,0.02,0.015`;
  - mí đôi, mí trên đậm;
  - miệng bầu dục rộng và thấp, môi hồng;
  - bóp mặt: tai 80 %, hàm bạnh, cằm dài, mũi thấp và thon, má hóp nhẹ;
  - cao 1,70 m.
- **Duyệt từng bước bằng ảnh tĩnh nhỏ:** mắt trước, rồi mày, rồi miệng.

## Kiểm tra

Theo danh sách trong đề bài:
- cận mặt biểu cảm và khẩu hình, chính diện và 3/4;
- quay đầu ±35° và cúi đầu;
- chớp mắt, liếc, há to;
- đoạn thử 96 khung, mẫu thấp;
- tối đa 4 xương trên mỗi đỉnh;
- chạy lại script ra cùng kết quả;
- bộ `nam` chạy cùng script, không phải sửa mã.

## Phần để người dựng tự quyết

Cỡ lưới của môi, răng và lưỡi, số vòng lưới, chi tiết vật liệu Soft PBR, và cách khớp mặt phẳng hốc mắt. Ghi các lựa chọn này trong README.
