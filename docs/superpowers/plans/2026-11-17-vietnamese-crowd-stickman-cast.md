# Dàn Nhân Vật Phụ Phong Cách Việt Nam — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng thêm 4 nhân vật phụ đậm chất đời sống đường phố/khu trọ Việt Nam (`vn_xeom_congnghe`, `vn_banhang_viahe`, `vn_chutro`, `vn_bac_mucoi`) vào bộ công cụ Blender 3D Stickman Cast, lưu file `stickman_vn_crowd.blend` và render 4 góc nhìn chuẩn studio.

**Architecture:** Mở rộng từ `dung_stickman_cast.py`, bổ sung hàm `get_vietnamese_crowd_profiles()`, các preset trang phục may đo đặc thù (mũ bảo hiểm + áo phản quang, nón lá + tạp dề, kẹp càng cua + túi bao tử, mũ cối lính), gán vào quy trình sinh mesh liền khối tự động.

**Tech Stack:** Python 3, Blender bpy 5.0.1, Cycles Render Engine, KaTeX / Markdown.

## Global Constraints
- Chuẩn chiều cao: $1.60\text{ m}$ (khớp toàn bộ không gian phòng trọ và hẻm phố 3D).
- Mesh liền khối (`create_loft_mesh` và `create_curved_tube_mesh`), không cắt khúc khớp búp bê.
- Vật liệu PBR nghệ thuật: Clay men sứ có Subsurface Scattering (`sss_weight=0.12`), vải có Sheen (`sheen_weight=0.55`).
- Unit tests tự động kiểm tra tính hợp lệ toán học của toàn bộ profiles mới.

---

### Task 1: Định nghĩa cấu hình & Preset cho 4 nhân vật Việt Nam

**Files:**
- Modify: `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/dung_stickman_cast.py`
- Modify: `tests/test_stickman_cast_math.py`

**Interfaces:**
- Produces: `get_vietnamese_crowd_profiles() -> Dict[str, Dict[str, Any]]`
- Updates: `get_all_character_profiles()` chứa thêm 4 nhân vật mới:
  1. `vn_xeom_congnghe` (Tài xế công nghệ): Áo khoác xanh lá dải xám, mũ bảo hiểm nửa đầu.
  2. `vn_banhang_viahe` (Cô bán quán vỉa hè): Nón lá vàng rơm, áo vàng nâu, tạp dề buộc eo.
  3. `vn_chutro` (Cô chủ trọ): Tóc kẹp càng cua, áo hoa cà trung niên, túi bao tử chìa khóa.
  4. `vn_bac_mucoi` (Bác xe ôm mũ cối): Mũ cối xanh lính, áo kaki bạc màu, dép cao su.

- [x] **Step 1: Viết test kiểm tra tính hợp lệ của `get_vietnamese_crowd_profiles`**
- [x] **Step 2: Chạy test để xác nhận test ban đầu fail**
- [x] **Step 3: Cập nhật hàm `get_vietnamese_crowd_profiles()` và các preset tóc/trang phục**
- [x] **Step 4: Chạy lại test để xác nhận PASS**
- [x] **Step 5: Commit mã nguồn**

---

### Task 2: Dựng module hình học chi tiết cho từng nhân vật phụ Việt Nam

**Files:**
- Modify: `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/dung_stickman_cast.py`

- [x] **Step 1: Dựng Mũ bảo hiểm nửa đầu (`Hair_Helmet_Moto`) và dải phản quang áo cho `vn_xeom_congnghe`**
- [x] **Step 2: Dựng Nón lá cách điệu (`Hair_Non_La`) và tạp dề ngang eo cho `vn_banhang_viahe`**
- [x] **Step 3: Dựng Tóc kẹp càng cua (`Hair_Claw_Clip`) và túi bao tử bên hông cho `vn_chutro`**
- [x] **Step 4: Dựng Mũ cối quân đội (`Hair_Pith_Helmet`) cho `vn_bac_mucoi`**
- [x] **Step 5: Cập nhật CLI hỗ trợ `--character vn_crowd` và tọa độ dàn hàng `CHAR_LINEUP_OFFSETS`**

---

### Task 3: Render Cycles 4 góc nhìn & Xuất file Blender 3D

**Files:**
- Modify: `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/dung_stickman_cast.py`
- Create: `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/stickman_vn_crowd.blend`
- Create: `/tmp/render-vn-crowd/*.png`

- [x] **Step 1: Chạy render 4 góc nhìn (`truoc`, `goc34`, `nghieng`, `sau`) với Cycles**
- [x] **Step 2: Kiểm tra trực quan bằng `view_file` để đảm bảo độ mịn và không lỗi xuyên khối**
- [x] **Step 3: Sao chép ảnh vào thư mục artifact (`vn_crowd_truoc.png`, `vn_crowd_goc34.png`, ...)**

---

### Task 4: Cập nhật tài liệu nhận diện & Đồng bộ Git

**Files:**
- Modify: `episodes/hem-co-chuyen/THIET-KE-NHAN-VAT.md`
- Modify: `BO-SUU-TAP-ANH-NHAN-VAT.md` (artifact)

- [x] **Step 1: Bổ sung 4 nhân vật phụ Việt Nam vào `THIET-KE-NHAN-VAT.md`**
- [x] **Step 2: Cập nhật carousel ảnh vào `BO-SUU-TAP-ANH-NHAN-VAT.md`**
- [x] **Step 3: Chạy toàn bộ 23 unit test**
- [x] **Step 4: Commit và push lên `origin/main`**
