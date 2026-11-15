# Kế hoạch Triển khai Quần Áo 3D Dáng Rộng — `dung_quan_ao_nam.py`

Thiết kế gốc: [THIET-KE-QUAN-AO.md](THIET-KE-QUAN-AO.md) · Thân cơ sở: [dung_than_cage_nam.py](dung_than_cage_nam.py)

---

### Task 1: Vật liệu vải & Thông số 5 Bộ Trang Phục (`OUTFITS`)
- Định nghĩa bảng `OUTFITS` cho 5 bộ: `xanh`, `ngu`, `xam-tui`, `dong-phuc`, `the-thao` với mã màu chuẩn từ `nhan-vat.tsx`.
- Viết hàm `mat_cloth(name, hex_col, rough=0.84, sheen=0.35, bump=0.12)` tạo Principled BSDF kèm texture thớ vải cotton 2 tầng noise (Object coords) và `mat_sandal(...)` cho đế/quai dép.

### Task 2: Dựng Áo Dáng Rộng Boxy / Drop-Shoulder (`build_shirt`)
- Dùng Control Cage nửa thân (`Mirror` X + `Subsurf` levels 2 + `Solidify` thickness `0.003 m`, offset `1.0`), lấy mốc từ `dung_than_cage_nam.py` nhưng cộng biên độ rộng dáng oversized:
  - Vai rủ `+2.2 cm`, thân trên `+1.8 cm`, bụng/eo/gấu suông thẳng `+2.8..3.2 cm`, gấu áo dừng tại `z = 0.485 m`.
  - Lỗ nách rộng, ống tay áo lửng rộng (`rx, ry ≈ 0.080–0.085 m`) dài tới `z = 0.625 m`.
  - Cổ áo:
    - Tròn trễ (`Nam_CoAo`) cho áo phông (`xanh`, `ngu`, `xam-tui`).
    - Cổ tim viền trắng + bo tay trắng cho `the-thao`.
    - Cổ bẻ sơ mi + nẹp cúc 4 nút + túi ngực trái có phù hiệu cho `dong-phuc`.
    - Túi ngực may nổi bên trái cho `xam-tui`.

### Task 3: Dựng Quần Ống Suông Rộng (`build_pants`)
- Dùng Control Cage nửa thân (`Mirror` X + `Subsurf` levels 2 + `Solidify` thickness `0.0035 m`, offset `1.0`), cạp tại `z = 0.565 m`, đũng hạ thấp thoải mái (`z = 0.425 m`).
- Hai biến thể chiều dài:
  - Dài suông tới mắt cá (`z = 0.120 m`, ống rộng `rx, ry ≈ 0.095–0.105 m`) cho `xanh`, `xam-tui`, `dong-phuc`.
  - Quần đùi rộng ngang gối (`z = 0.285 m`) cho `ngu`, `the-thao` (thêm sọc trắng hai bên hông cho `the-thao`).

### Task 4: Dựng Dép Lê (`build_sandals`) & Cân Bằng Mặt Sàn
- Đế dép bo tròn mềm (`z = 0.000..0.015 m`) + quai chữ Y hoặc quai ngang dò mặt mu bàn chân `Nam_BanChan.L/.R` bằng `BVHTree.ray_cast` để không chìm vào ngón chân.
- Nâng toàn bộ cụm nhân vật + quần áo lên `+0.015 m` khi mang dép để mặt dưới đế dép chạm chuẩn sàn `Z = 0`.

### Task 5: Bộ Kiểm Tra Tự Động (`--check`), Render & Lưu `.blend`
- Kiểm tra `cloth_exists`, `cloth_manifold`, `cloth_no_clipping` (BVH kiểm 0 đỉnh mặt trong áo/quần xuyên vào `Nam_Dau_Than`), và `cloth_loose_fit` (đo khoảng hở tối thiểu/trung bình đảm bảo dáng rộng).
- Hỗ trợ CLI: `--outfit <tên|all>`, `--check`, `--render DIR`, `--blend FILE`, `--samples N`.
