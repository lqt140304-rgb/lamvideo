# Bộ dựng hiện hành — Blender 3D

Đọc [quy chuẩn 3D](../../../../docs/QUY-CHUAN-3D.md), [quy trình](../../../../docs/WHAT-IF-QUY-TRINH.md) và ASSET của tập. Hướng dẫn API rig SVG/layer cũ đã gỡ; không lấy các ví dụ Remotion cũ làm nguồn sản xuất nhân vật hoặc bối cảnh mới.

## Hồ sơ 02

Nguồn ở `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/`:

- `nhan-vat-3d/dung_dau_nam.py`: đầu/tóc modular; `dung_nam.py`: mẫu nhân vật trước đó. Đọc docstring và nhận diện trước khi chọn; không trộn hai bộ đầu.
- `boi-canh-3d/xay_phong_tro.py`: scene chuẩn, đơn vị mét, camera và ngày/đêm. Đọc [README bối cảnh](../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh-3d/README.md).
- `xay_do_dung_chi_tiet.py`: entry `build()` rồi `refine()`, cho bản đồ dùng mới. [Hướng dẫn](../../../../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh-3d/README-CHI-TIET.md) nói rõ root/anchor chưa phải rig toàn món.
- `camera_dong.py`, `cong_guong.py`, `kinh_nuoc.py`, `dao_cu_3d.py`, `moi_truong.py`: nguồn chuyên biệt; đọc API thực tế trước gọi, không giả định đã tích hợp vào mọi entry.

## Tọa độ và tiếp xúc

1 BU = 1 m, Z lên. Helper phòng phản chiếu X qua `mx()`; không phản chiếu lần hai. Camera, nhân vật và đồ dùng phải cùng hệ tọa độ/kích thước. Không hạ nội thất để chữa rig sai tỷ lệ.

Kiểm tra modifier, độ dày vải, ngón cái, tay–vật, hông–ghế và chân–sàn ở cả chuyển động. Mesh kín không tự chứng minh không xuyên nhau. Parent/constraint phải giữ tọa độ thế giới tại frame chuyển chủ sở hữu.

## Đầu ra

Storyboard bằng render tĩnh → animatic/playblast → render cuối sau duyệt. Remotion phục vụ timeline, giọng, SFX, UI và hậu kỳ khi cần; đọc schema thực tế trước dùng scripts kế thừa. Không chạy `master.py` chỉ từ file Markdown hoặc coi `npm run typecheck` là kiểm chứng Blender.
