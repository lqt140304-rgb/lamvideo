# Kế Hoạch Triển Khai: Nâng Cấp Dàn Nhân Vật Stickman 3D Stylized Nghệ Thuật

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hiện thực hóa nâng cấp dàn 5 nhân vật Stickman 3D theo phong cách 3D Stylized Nghệ Thuật (men sứ SSS, vải sợi Sheen, chi tiết cổ áo, sọc thể thao, nẹp cúc, bàn tay stylized, sàn studio và ánh sáng điện ảnh).

**Architecture:** Mở rộng module `dung_stickman_cast.py` với shader PBR nâng cao (SSS, Sheen, Transmission), tái cấu trúc hình học bàn tay có ngón cái, may đo chi tiết trang phục riêng biệt từng nhân vật và bổ sung sàn studio vô cực kèm chiếu sáng Chiaroscuro 3 điểm.

**Tech Stack:** Python 3.11, Blender 5.0.1 (`bpy`), Cycles Render Engine, Mathutils, Unittest.

**Spec:** `docs/superpowers/specs/2026-11-17-stickman-3d-stylized-art-design.md`

## Global Constraints
- Chiều cao chuẩn nhân vật: $1{,}60\text{ m}$ ($Z = 0$ đến $Z = 1{,}60\text{ m}$).
- 5 nhân vật chuẩn: `nam`, `nguoikia`, `tung`, `giangvien`, `truyvet`.
- Tính độc lập: File `dung_stickman_cast.py` chạy độc lập, tự chứa math fallback, không phụ thuộc module ngoài khi chạy trong Blender GUI.
- Không commit file nhị phân lớn (`.blend` và cache render) vào Git (tuân thủ `.gitignore`).

## Review Focus
- **Khử cảm giác nhựa:** Kiểm tra da đầu và tay có hiệu ứng tán xạ SSS ấm áp, không bị bóng loáng như nhựa đúc.
- **Độ nét chi tiết vải:** Vải quần áo có hiệu ứng nhung viền (`Sheen`) và độ nhám cao (`Roughness > 0.8`), không bẹp nát góc cạnh.
- **Bàn tay tự nhiên:** Ngón cái nghiêng đúng góc 35 độ hướng phía trước, tỉ lệ vừa vặn với cánh tay.
- **Tương thích Rigging:** Không làm hỏng khung xương Armature Rig và 16 bài kiểm tra unittest hiện hữu.
- **Tiếp xúc sàn thực tế:** Chân và giày tiếp xúc chính xác mặt sàn $Z = 0$, có bóng đổ mềm (contact shadow).

---

### Task 1: Nâng Cấp Hệ Thống Shader PBR Stylized Trong `dung_stickman_cast.py`

**Files:**
- Modify: `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/dung_stickman_cast.py:410-440`
- Test: `tests/test_stickman_cast_math.py`

**Interfaces:**
- Consumes: `hex_to_rgb(hex_str: str) -> tuple`
- Produces: `create_material(name: str, hex_color: str, roughness: float = 0.65, sss_weight: float = 0.0, sheen_weight: float = 0.0, transmission: float = 0.0, specular: float = 0.5) -> Any`

- [ ] **Step 1: Viết test kiểm tra các tham số vật liệu PBR mở rộng trong `tests/test_stickman_cast_math.py`**
```python
def test_pbr_material_parameters_signature(self):
    import dung_stickman_cast
    # Kiểm tra hàm create_material hỗ trợ đầy đủ các tham số sss, sheen, transmission
    import inspect
    sig = inspect.signature(dung_stickman_cast.create_material)
    for param in ["sss_weight", "sheen_weight", "transmission", "specular"]:
        self.assertIn(param, sig.parameters)
```

- [ ] **Step 2: Chạy test để xác nhận kiểm thử thất bại**
Run: `/home/antigravity/.venv/bin/python -m unittest tests/test_stickman_cast_math.py`
Expected: FAIL với AssertionError hoặc missing parameter.

- [ ] **Step 3: Cập nhật hàm `create_material` trong `dung_stickman_cast.py`**
Hỗ trợ gán các socket Principled BSDF:
- `Subsurface Weight` (hoặc `Subsurface` tùy phiên bản Blender)
- `Subsurface Radius` = (0.12, 0.06, 0.03) cho da men sứ ấm
- `Sheen Weight` (hoặc `Sheen`)
- `Transmission Weight` cho kính
- `Specular IOR Level` / `Roughness`

- [ ] **Step 4: Chạy lại test để xác nhận vượt qua**
Run: `/home/antigravity/.venv/bin/python -m unittest tests/test_stickman_cast_math.py`
Expected: PASS 100%.

- [ ] **Step 5: Commit thay đổi Task 1**
```bash
git add episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/dung_stickman_cast.py tests/test_stickman_cast_math.py
git commit -m "feat(shader): nang cap create_material ho tro SSS, Sheen va Transmission"
```

---

### Task 2: Dựng Bàn Tay Stylized (Stylized Mitten Hand với Ngón Cái Tự Nhiên)

**Files:**
- Modify: `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/dung_stickman_cast.py:495-530`
- Test: `tests/test_stickman_cast_math.py`

**Interfaces:**
- Consumes: `dims = get_base_dimensions()`, `smooth_object()`
- Produces: `Hand_Palm_L`, `Hand_Thumb_L`, `Hand_Palm_R`, `Hand_Thumb_R` trong cấu trúc cơ thể nhân vật.

- [ ] **Step 1: Viết test kiểm tra cấu trúc bàn tay stylized có ngón cái**
```python
def test_hand_geometry_naming(self):
    import dung_stickman_cast
    # Kiểm tra định nghĩa hàm dựng cơ thể có tạo khối lòng bàn tay và ngón cái
    import inspect
    src = inspect.getsource(dung_stickman_cast.create_stickman_body)
    self.assertIn("Thumb", src)
    self.assertIn("Palm", src)
```

- [ ] **Step 2: Chạy test xác nhận thất bại trước khi cài đặt**
Run: `/home/antigravity/.venv/bin/python -m unittest tests/test_stickman_cast_math.py`
Expected: FAIL.

- [ ] **Step 3: Nâng cấp tạo hình bàn tay trong `create_stickman_body`**
- Lòng bàn tay (`Hand_Palm`): Khối cầu UV Sphere thon dài (`scale = (0.025, 0.032, 0.045)`).
- Ngón cái (`Hand_Thumb`): Khối capsule/cylinder nhỏ (`radius = 0.010, depth = 0.025`), đặt lệch góc 35 độ hướng ra phía trước và hơi vào trong mu bàn tay.
- Bo viền làm mịn bằng `smooth_object(subsurf=1)`.

- [ ] **Step 4: Chạy test xác nhận vượt qua**
Run: `/home/antigravity/.venv/bin/python -m unittest tests/test_stickman_cast_math.py`
Expected: PASS.

- [ ] **Step 5: Commit thay đổi Task 2**
```bash
git add episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/dung_stickman_cast.py tests/test_stickman_cast_math.py
git commit -m "feat(body): nang cap ban tay stylized voi ngon cai tu nhien"
```

---

### Task 3: Chi Tiết Hóa Trang Phục May Đo Cho Toàn Bộ 5 Nhân Vật

**Files:**
- Modify: `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/dung_stickman_cast.py:650-820`
- Test: `tests/test_stickman_cast_math.py`

**Interfaces:**
- Consumes: `create_material()`, `smooth_object()`, `get_character_profiles()`
- Produces:
  - Nam & Người Kia: Bo cổ áo thun (`Crewneck`), nếp gấu áo, quai dép xỏ ngón.
  - Tùng: Bo cổ trắng, 2 sọc trắng bắp tay, 2 sọc trắng sườn quần, sneaker 2 màu.
  - Giảng viên: Cổ bẻ sơ mi (collar lapels), nẹp cúc áo 4 nút ngà, thắt lưng da mặt khóa kim loại, tròng kính trong suốt.
  - Người Truy Vết: Vành mũ hoodie phồng tự nhiên, 2 dây rút mũ, khóa kéo kim loại, túi hộp đùi có nắp vát.

- [ ] **Step 1: Viết test xác nhận các chi tiết trang phục đặc thù tồn tại trong script**
```python
def test_outfit_signature_details(self):
    import dung_stickman_cast
    import inspect
    src = inspect.getsource(dung_stickman_cast.create_outfit_module)
    self.assertIn("Collar", src)
    self.assertIn("Stripe", src)
    self.assertIn("Button", src)
    self.assertIn("Belt", src)
    self.assertIn("Zipper", src)
```

- [ ] **Step 2: Chạy test xác nhận thất bại trước khi cài đặt**
Run: `/home/antigravity/.venv/bin/python -m unittest tests/test_stickman_cast_math.py`
Expected: FAIL.

- [ ] **Step 3: Cài đặt chi tiết may đo trong `create_outfit_module` và `create_hair_module`**
- Bổ sung vật liệu riêng: `Mat_Accent_White` (sọc thể thao), `Mat_Gold_Buckle` (khóa thắt lưng), `Mat_Zipper` (khóa kéo), `Mat_Glass_Lens` (tròng kính).
- Dựng hình học chi tiết chính xác theo tọa độ kích thước nhân vật $1{,}60\text{ m}$.

- [ ] **Step 4: Chạy lại toàn bộ test suite**
Run: `/home/antigravity/.venv/bin/python -m unittest discover tests`
Expected: 100% PASS (tất cả 16+ test cases).

- [ ] **Step 5: Commit thay đổi Task 3**
```bash
git add episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/dung_stickman_cast.py tests/test_stickman_cast_math.py
git commit -m "feat(outfit): them chi tiet may do co ao, soc the thao, nep cuc, khoa keo va that lung"
```

---

### Task 4: Sân Khấu Studio Vô Cực (Cyclorama) & Chiếu Sáng Điện Ảnh 3 Điểm

**Files:**
- Modify: `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/dung_stickman_cast.py:850-930`
- Render: `/tmp/render-stickman/*.png`

**Interfaces:**
- Consumes: `render_views()`, `create_studio_lighting()`
- Produces: Mặt sàn studio cong vô cực `Backdrop_Cyclorama`, Key Light mềm bắt bóng tiếp xúc, 4 file ảnh render 1920x1080.

- [ ] **Step 1: Viết hàm tạo mặt sàn studio cong vô cực `create_studio_backdrop()`**
Mặt phẳng sàn tại $Z = 0$, nối cong mềm 90 độ lên cao $Z = 3.0\text{ m}$ phía sau nhân vật làm nền trung tính màu xám ấm than (`#232226`).

- [ ] **Step 2: Nâng cấp hệ thống ánh sáng 3 điểm Chiaroscuro**
- Key Light ấm (Energy 4.5, Size 0.35 cho bóng đổ mềm tự nhiên).
- Fill Light lạnh nhẹ (Energy 1.8).
- Rim Light hổ phách (Energy 3.8) chiếu từ sau lưng tách viền nhân vật khỏi phông nền.

- [ ] **Step 3: Chạy tiến trình render Cycles 4 góc nhìn (1920x1080)**
Run: `/home/antigravity/.venv/bin/python dung_stickman_cast.py --character all --save stickman_cast.blend --render /tmp/render-stickman --samples 16`
Expected: Xuất đủ 4 ảnh `truoc.png`, `goc34.png`, `sau.png`, `nghieng.png`.

- [ ] **Step 4: Commit thay đổi Task 4**
```bash
git add episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/dung_stickman_cast.py
git commit -m "feat(lighting): them san studio cyclorama va he thong chieu sang chiaroscuro 3 diem"
```

---

### Task 5: Cập Nhật Tài Liệu Showcase, Xác Minh Độc Lập & Đồng Bộ Git Main

**Files:**
- Modify: `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/BO-SUU-TAP-ANH-NHAN-VAT.md`
- Copy Artifacts: `/home/antigravity/.gemini/jetski/brain/v1/default/jetski_remote_agents_3p/632588fc-c9c3-43d5-91f0-e936233146ef/*.png`

- [ ] **Step 1: Copy ảnh render chất lượng mới vào thư mục Artifact**
Run: `cp /tmp/render-stickman/*.png /home/antigravity/.gemini/jetski/brain/v1/default/jetski_remote_agents_3p/632588fc-c9c3-43d5-91f0-e936233146ef/`

- [ ] **Step 2: Cập nhật nội dung mô tả chi tiết từng ảnh trong `BO-SUU-TAP-ANH-NHAN-VAT.md`**

- [ ] **Step 3: Chạy toàn bộ test suite để bảo đảm an toàn hệ thống**
Run: `/home/antigravity/.venv/bin/python -m unittest discover tests`
Expected: 100% OK.

- [ ] **Step 4: Push toàn bộ các commit lên nhánh `origin/main`**
Run: `git push origin main`
Expected: Remote branch `main` đồng bộ hoàn toàn.
