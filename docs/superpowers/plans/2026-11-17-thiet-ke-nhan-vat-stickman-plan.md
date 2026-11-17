# Thiết Kế Dàn Nhân Vật Stickman 3D Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuẩn hóa toàn bộ tài liệu đặc tả, thư viện asset và bộ script sinh hình học/rig Blender 3D cho dàn nhân vật Stickman Kiểu B (1,60 m) theo quyết định của chủ repo.

**Architecture:** Sử dụng kiến trúc mô-đun hóa: Một phôi Stickman Base V1 hình học tham số (đầu tròn trơn, thân capsule, chi con nhộng) làm gốc chuẩn $1.60\text{ m}$. Các nhân vật (Nam, Người Kia, Tùng, Giảng viên, Người Truy Vết) được tùy biến độc quyền qua module tóc và module trang phục/phụ kiện. Toàn bộ hình học được kiểm chứng toán học bằng Python độc lập trước khi chạy trên Blender CLI.

**Tech Stack:** Python 3.11, `numpy`, `unittest`, Blender Python API (`bpy`, `mathutils`), JSON Schema, Markdown.

**Spec:** `docs/superpowers/specs/2026-11-17-thiet-ke-nhan-vat-stickman-design.md`

## Global Constraints

- Chiều cao tổng thể của phôi Stickman Base V1 phải đúng $1.60\text{ m}$ (đáy chân tại $Z = 0.0\text{ m}$, đỉnh đầu tại $Z = 1.60\text{ m}$) để khớp $100\%$ bối cảnh 3D hiện có.
- Dùng chung duy nhất một phôi thân và khuôn mặt cho tất cả nhân vật; không tạo đặc điểm nhận diện bằng nốt ruồi hay cơ bắp.
- Hồ sơ 02: Nam và Người Kia giống hệt nhau $100\%$ về tóc và trang phục; phân biệt bằng tay thuận (Nam phải, Người Kia trái) và diễn xuất.
- Không xóa các mesh cũ (`nam-002`, `nam-003`, `human-male-base-v1.glb`); chuyển trạng thái sang lưu trữ tham khảo lịch sử.
- Toàn bộ script Blender phải chạy được cả ở chế độ headless CLI (`blender --background --python`) lẫn chế độ kiểm thử toán học thuần Python (không cần `bpy`).

## Review Focus

1. **Chiều cao tổng thể lệch khỏi 1,60 m:** Đỉnh đầu phải đạt chính xác $Z = 1.60\text{ m}$ với dung sai $\le \pm 0.005\text{ m}$ khi đứng thẳng.
2. **Tiếp xúc sàn Z=0:** Mặt đáy bàn chân phải phẳng và nằm chính xác tại $Z = 0.0\text{ m}$, không chìm dưới sàn hay lơ lửng.
3. **Va chạm trang phục với thân (Cloth Penetration):** Bán kính áo và quần tại mọi lát cắt phải lớn hơn bán kính thân capsule tối thiểu $10\text{ mm}$ ($0.01\text{ m}$).
4. **Đối xứng và hoán đổi tay thuận:** Module rig/animation phải hỗ trợ lật đối xứng và đổi tay cầm đạo cụ từ phải sang trái cho Người Kia.
5. **Khả năng import độc lập:** File `dung_stickman_cast.py` và `stickman_math.py` phải import được độc lập mà không bị lỗi thiếu thư viện `bpy` khi chạy test trên môi trường Linux VM.

---

### Task 1: Cập Nhật Quy Chuẩn & Nhận Diện Nhân Vật Stickman Kiểu B

**Files:**
- Modify: `docs/QUY-CHUAN-STICKMAN.md:1-28`
- Modify: `episodes/hem-co-chuyen/THIET-KE-NHAN-VAT.md:1-23`

**Interfaces:**
- Consumes: Quyết định thiết kế từ `docs/superpowers/specs/2026-11-17-thiet-ke-nhan-vat-stickman-design.md`
- Produces: Quy chuẩn hình học Kiểu B chuẩn hóa và bảng thông số tạo hình 5 nhân vật (Nam, Người Kia, Tùng, Giảng viên, Người Truy Vết).

- [ ] **Step 1: Viết test kiểm tra tính nhất quán tài liệu quy chuẩn**

Tạo test `tests/test_stickman_docs.py` kiểm tra file `docs/QUY-CHUAN-STICKMAN.md` và `episodes/hem-co-chuyen/THIET-KE-NHAN-VAT.md` chứa đầy đủ từ khóa: `Kiểu B`, `1,60 m`, `viên nang`, `Nam`, `Người Kia`, `Tùng`, `Giảng viên`, `Người Truy Vết`.

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run: `python3 -m unittest tests/test_stickman_docs.py`
Expected: FAIL vì các file hiện tại chưa có đặc tả Kiểu B và dàn nhân vật chi tiết.

- [ ] **Step 3: Cập nhật `docs/QUY-CHUAN-STICKMAN.md`**

Bổ sung chi tiết:
- Dạng hình học Kiểu B: Đầu tròn ($R=0.14\text{ m}$), thân viên nang ($H=0.50\text{ m}$), tay chân hình ống mảnh.
- Chiều cao chuẩn 1,60 m.
- Bảng phân loại 5 nhân vật và quy chuẩn nhận diện bằng tóc/áo.

- [ ] **Step 4: Cập nhật `episodes/hem-co-chuyen/THIET-KE-NHAN-VAT.md`**

Cập nhật mục nhận diện nhân vật 3D:
- Khóa quy chuẩn Stickman Kiểu B cho Hồ sơ 02.
- Ghi nhận Nam và Người Kia giống nhau $100\%$ về tóc rối và áo phông xanh rêu, phân biệt bằng tay thuận và vết nứt rỉ nước lạnh.
- Mô tả tạo hình Tùng, Giảng viên và Người Truy Vết.

- [ ] **Step 5: Chạy test để xác nhận PASS**

Run: `python3 -m unittest tests/test_stickman_docs.py`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add tests/test_stickman_docs.py docs/QUY-CHUAN-STICKMAN.md episodes/hem-co-chuyen/THIET-KE-NHAN-VAT.md
git commit -m "docs: standardize stickman type B character guidelines"
```

---

### Task 2: Cập Nhật Tài Liệu Asset Hồ Sơ 02 & Chuyển Phôi Cũ Sang Lưu Trữ

**Files:**
- Modify: `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/ASSET.md:1-35`
- Modify: `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/README.md:1-50`
- Modify: `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/LOI-TON-DONG.md:1-48`

**Interfaces:**
- Consumes: Trạng thái quy chuẩn Stickman Kiểu B
- Produces: Danh mục asset cập nhật, chỉ rõ `Stickman Base V1` là nguồn nhân vật chính, `nam-002`/`nam-003`/`human-male-base-v1.glb` là tư liệu lưu trữ.

- [ ] **Step 1: Viết test kiểm tra trạng thái asset trong ASSET.md**

Mở rộng `tests/test_stickman_docs.py` thêm test case `test_asset_status_superseded()` kiểm tra `ASSET.md` có ghi rõ nguồn hiện hành là Stickman Base V1 và lưu ý các mesh cũ là tư liệu lịch sử.

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run: `python3 -m unittest tests/test_stickman_docs.py`
Expected: FAIL

- [ ] **Step 3: Cập nhật `ASSET.md`**

Đổi nhóm "Đầu và tóc Nam", "Thân Nam control cage", "Quần áo nhân vật 3D" sang mục tiêu mới: `dung_stickman_cast.py` và `what-if-studio/library/characters/stickman-base-v1/`. Đưa các file `dung_than_cage_nam.py`, `dung_dau_nam.py` thành tham chiếu lịch sử.

- [ ] **Step 4: Cập nhật `assets/nhan-vat-3d/README.md` & `LOI-TON-DONG.md`**

Thêm banner thông báo chuyển đổi sang Stickman Kiểu B vào đầu `assets/nhan-vat-3d/README.md`. Ghi nhận việc khóa thiết kế Stickman vào mục 12 và cập nhật bảng tiến độ trong `LOI-TON-DONG.md`.

- [ ] **Step 5: Chạy test để xác nhận PASS**

Run: `python3 -m unittest tests/test_stickman_docs.py`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/ASSET.md episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/README.md episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/LOI-TON-DONG.md tests/test_stickman_docs.py
git commit -m "docs: archive legacy human mesh and set stickman base as active in asset tables"
```

---

### Task 3: Thiết Lập Thư Viện Stickman Base V1 Trong what-if-studio

**Files:**
- Create: `what-if-studio/library/characters/stickman-base-v1/manifest.json`
- Create: `what-if-studio/library/characters/stickman-base-v1/README.md`

**Interfaces:**
- Consumes: Bảng thông số hình học Kiểu B
- Produces: Manifest và hướng dẫn thư viện chuẩn cho hệ thống Remotion / Blender asset pipeline.

- [ ] **Step 1: Viết test kiểm tra manifest.json**

Tạo test `tests/test_stickman_manifest.py` kiểm tra `manifest.json` hợp lệ, chứa các trường: `id: STICKMAN-BASE-V1`, `version: 1`, `height: 1.60`, `type: B`, `modules: ["hair", "outfits", "rig"]`.

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run: `python3 -m unittest tests/test_stickman_manifest.py`
Expected: FAIL vì thư mục và file chưa tồn tại.

- [ ] **Step 3: Tạo `manifest.json` và `README.md` trong `what-if-studio/library/characters/stickman-base-v1/`**

Khai báo đầy đủ siêu dữ liệu kỹ thuật, phạm vi áp dụng cho toàn series và hướng dẫn modular hair/outfits.

- [ ] **Step 4: Chạy test để xác nhận PASS**

Run: `python3 -m unittest tests/test_stickman_manifest.py`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add what-if-studio/library/characters/stickman-base-v1/ tests/test_stickman_manifest.py
git commit -m "feat(library): add stickman-base-v1 character specification and manifest"
```

---

### Task 4: Xây Dựng Module Toán Học / Hình Học Stickman Base Kiểu B

**Files:**
- Create: `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/stickman_math.py`
- Test: `tests/test_stickman_math.py`

**Interfaces:**
- Consumes: None (thuần Python math/numpy)
- Produces:
  - `get_base_dimensions() -> dict`: trả về kích thước đầu, cổ, thân capsule, tay, chân, tổng chiều cao $1.60\text{ m}$.
  - `generate_capsule_levels(num_rings: int) -> list[dict]`: tính tọa độ $Z$ và bán kính $R$ cho thân capsule.
  - `verify_mesh_constraints() -> dict`: kiểm tra chiều cao đỉnh đầu, đáy sàn $Z=0$, và không bị âm thể tích.

- [ ] **Step 1: Viết test toán học cho Stickman Base V1**

Tạo `tests/test_stickman_math.py` với các bài test:
- `test_total_height_exact_160()`: Kiểm tra `base_dim['total_height'] == 1.60`.
- `test_floor_contact_z_zero()`: Kiểm tra `base_dim['floor_z'] == 0.0`.
- `test_head_radius_and_center()`: Kiểm tra bán kính đầu $0.14\text{ m}$, tâm $Z = 1.46\text{ m}$.
- `test_torso_capsule_bounds()`: Kiểm tra thân capsule nằm trong khoảng $Z \in [0.75, 1.28]$.

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run: `python3 -m unittest tests/test_stickman_math.py`
Expected: FAIL với "ModuleNotFoundError: No module named 'stickman_math'"

- [ ] **Step 3: Cài đặt `stickman_math.py`**

Viết `stickman_math.py` với các hàm tính toán hình học giải tích và tham số chính xác cho Stickman Kiểu B.

- [ ] **Step 4: Chạy test để xác nhận PASS**

Run: `python3 -m unittest tests/test_stickman_math.py`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/stickman_math.py tests/test_stickman_math.py
git commit -m "feat(3d): implement parametric stickman type B geometry calculations"
```

---

### Task 5: Xây Dựng Script Blender Dựng Dàn Nhân Vật & Rig Chuẩn

**Files:**
- Create: `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/dung_stickman_cast.py`
- Test: `tests/test_stickman_cast_math.py`

**Interfaces:**
- Consumes: `stickman_math.py`
- Produces:
  - Cấu trúc module tóc cho 5 nhân vật (`Hair_Nam_NguoiKia`, `Hair_Tung`, `Hair_GiangVien`, `Hair_TruyVet`).
  - Cấu trúc trang phục bọc ngoài capsule chống xuyên lưới (`gap >= 0.010m`).
  - Cấu trúc xương Armature (Root, Spine, Chest, Neck, Head, Shoulder.L/R, Arm.L/R, Hand.L/R, Leg.L/R, Foot.L/R).
  - Hàm `build_cast_in_blender(characters: list[str])` chạy trong Blender headless CLI.

- [ ] **Step 1: Viết test kiểm tra thông số module tóc & trang phục**

Tạo `tests/test_stickman_cast_math.py` kiểm tra:
- Có đủ 5 profile nhân vật: `nam`, `nguoikia`, `tung`, `giangvien`, `truyvet`.
- Quần áo ở mọi lát cắt đều có bán kính $R_{\text{cloth}} \ge R_{\text{torso}} + 0.010\text{ m}$.
- Nam và Người Kia dùng chung $100\%$ tham số tóc và trang phục, chỉ khác thuộc tính `handedness: 'right'` vs `'left'`.
- Mã màu hex chuẩn và RGBA hợp lệ.

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run: `python3 -m unittest tests/test_stickman_cast_math.py`
Expected: FAIL

- [ ] **Step 3: Cài đặt `dung_stickman_cast.py`**

Viết script:
- Chứa toàn bộ hằng số màu sắc và profile cho 5 nhân vật.
- Module tạo mesh trong Blender (`create_stickman_body()`, `create_hair()`, `create_clothing()`, `create_armature()`).
- Bọc an toàn khối `try ... except ImportError: bpy = None` để file có thể import và test logic độc lập trên môi trường không có Blender.

- [ ] **Step 4: Chạy test để xác nhận PASS**

Run: `python3 -m unittest tests/test_stickman_cast_math.py`
Expected: PASS

- [ ] **Step 5: Chạy toàn bộ test suite để xác minh toàn diện**

Run: `python3 -m unittest discover tests/ -v`
Expected: Tất cả các test đều PASS.

- [ ] **Step 6: Commit & Push lên remote**

```bash
git add episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/dung_stickman_cast.py tests/test_stickman_cast_math.py
git commit -m "feat(3d): add complete Blender generator script for stickman cast and outfits"
git push origin main
```
