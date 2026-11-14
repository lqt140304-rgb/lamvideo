# Miệng kiểu phim hoạt hình 3D — Kế hoạch thực hiện

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng lại vùng miệng của rig nữ thành miệng kiểu phim hoạt hình 3D: môi có độ dày, mở hàm không gấp, khẩu hình mượt, bên trong miệng tròn trịa.

**Architecture:** Thay phần thân hàm `dung_mieng` và `dung_shape_key_mieng` trong `mat_nu.py`, giữ nguyên interface. `rig_nu.py` thêm modifier Corrective Smooth vào giữa Armature và Subdivision. Kiểm mới thêm vào `kiem_rig_nu.py`; các kiểm miệng cũ giữ nguyên tên và chỉ cập nhật ngưỡng nếu thật cần.

**Tech Stack:** Blender 5.2.3 (`D:/blender/blender.exe`), bpy, bmesh, numpy; `what-if-studio/tools/soi/bang.cjs` để ghép ảnh.

**Spec:** [docs/superpowers/specs/2026-11-15-mieng-hoat-hinh-design.md](../specs/2026-11-15-mieng-hoat-hinh-design.md)

## Global Constraints

- **Base dùng để dựng:**
  - Nếu chủ repo đã gửi base nữ bản mới trước khi bắt đầu, đặt `SRC` trong `rig_nu.py` trỏ tới bản đó (đường dẫn chủ repo đưa) và ghi một dòng `Ruling:`.
  - Nếu chưa có, làm trên `nhan-vat-nu-goc.blend`.
- **Giữ nguyên tên:** xương `jaw`; nhóm đỉnh `MIENG_VUNG`, `MIENG_LO`, `MIENG_MOI_TREN`, `MIENG_MOI_DUOI`, `MIENG_TREN`, `MIENG_DUOI`; 10 shape key nền, 11 `vs_*`, `mo_ham_khoe`; file `khau-hinh.json`.
- **Môi:** nhô 1,5–2,5 mm so với da. Màu hồng nhạt gần da, không tô đỏ. Răng không chia từng chiếc; có lợi hồng.
- **Corrective Smooth:** chỉ tác động lên nhóm đỉnh `MIENG_MUOT`. Thứ tự modifier: Armature → CorrectiveSmooth → Subdivision.
- **Bộ kiểm:** `D:/blender/blender.exe -b nhan-vat-nu-rig.blend --python kiem_rig_nu.py` phải thoát mã 0, chạy trong `assets/nhan-vat-3d/nhan-vat-nu-rig/`.
- **Git:** commit trên nhánh `claude/nhan-vat-nu-rig`, liệt kê đúng đường dẫn, cuối message có `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Ngậm miệng ở dáng nghỉ phải khép kín**, giữ nét cười của mẫu, không lộ khe tối. → Task 1 thêm `kiem_ngam_kin`: ở dáng nghỉ, mép môi trên và mép môi dưới cách nhau < 0,5 mm dọc khe.
2. **Khẩu hình cộng với hàm mở** (ví dụ `vs_O` + 14°) cũng không được gấp. → Task 3: `kiem_khong_gap` chạy thêm với từng `vs_*` ở độ mở hàm gợi ý trong `khau-hinh.json`.
3. **Corrective Smooth không được làm méo chỗ khác** (khớp tay, chân, mắt). → Task 2 thêm `kiem_cs_chi_mieng`: bật hoặc tắt modifier thì đỉnh ngoài `MIENG_MUOT` lệch < 0,1 mm, ở dáng tay giơ và đầu gối gập.
4. **Ranh giới màu giữa môi và da** không thành đường cứng. → Task 5: ảnh duyệt chụp cận 3/4; ghi vào README nếu còn thấy.
5. **Base mới có lưới khác** làm các bước dò sai mà không báo. → Mọi bước dò (tâm miệng, bề ngang) đều có `assert` kèm thông điệp. Task 1 thêm `kiem_mieng_can_giua`: tâm miệng lệch trục giữa mặt < 2 mm.

---

### Task 1: Lưới môi có độ dày, kiểu hoạt hình

**Files:**
- Modify: `assets/nhan-vat-3d/nhan-vat-nu-rig/mat_nu.py` (`dung_mieng`)
- Modify: `assets/nhan-vat-3d/nhan-vat-nu-rig/kiem_rig_nu.py`

**Interfaces:**
- Produces: `dung_mieng(body, rig, coll) -> {'tam_mieng': Vector, 'vung_dinh': list[int]}`, giống cũ.
- Nhóm đỉnh: các nhóm cũ, thêm `MIENG_MOI_BE` (đỉnh mặt môi, dùng khi tô vật liệu môi) và `MIENG_MUOT` (vùng Corrective Smooth: các vòng môi và da cộng 2 vòng mặt lưới quanh vùng lấp).
- Vật liệu mới `Nu_Moi` (hồng nhạt) gán cho các mặt mặt môi.

- [ ] **Step 1: Viết kiểm** trong `kiem_rig_nu.py`:
  - `kiem_moi_day`: ở x = 0, đỉnh trước nhất của `MIENG_MOI_BE` nằm trước đỉnh `MIENG_VUNG` trên cùng tia ngang ở vòng da ngoài môi ≥ 1,5 mm và ≤ 2,5 mm, đo cho cả môi trên và môi dưới.
  - `kiem_ngam_kin`: ở dáng nghỉ, mỗi đỉnh `MIENG_MOI_TREN` cách đỉnh `MIENG_MOI_DUOI` gần nhất < 0,0005 m.
  - `kiem_mieng_can_giua`: `abs(tam_mieng.x) < 0.002`.
- [ ] **Step 2: Chạy kiểm**, thấy FAIL: thiếu nhóm `MIENG_MOI_BE`, môi chưa có độ dày.
- [ ] **Step 3: Viết lại thân `dung_mieng`.**
  - Các vòng sinh theo **tiết diện môi** quanh khe. Thứ tự từ trong ra:
    - `trong` — thành trong, lùi 4 mm;
    - vòng 0 — khe;
    - vòng 1, 2 — mặt môi: nhô ra trước +1,0 và +2,0 mm, dời ra 1 và 3 mm;
    - vòng 3 — mép môi: nhô +1,0 mm, dời ra 5 mm;
    - vòng 4–8 — da: chiếu lên bề mặt base, nở dần tới A = a + 0,03, B_up = 0,028, B_dn = 0,036.
  - N = 40 đoạn mỗi vòng. Dồn thêm đoạn về hai khóe: tham số góc t' = t + 0,25·sin 2t.
  - Môi trên có cung nhẹ: vòng 3 cộng 0,0012·cos²(3t) ở nửa trên, gần giữa.
  - Nối vòng 8 vào viền lỗ bằng `triangle_fill` (cách đã dùng). Crease khe môi 0,7.
  - **UV:** vòng da dùng `uv_da_quanh`; vòng môi dùng UV da trán cộng vật liệu `Nu_Moi` có màu = trung vị da × (1,0; 0,82; 0,82).
- [ ] **Step 4: Dựng lại và chạy kiểm.** `kiem_moi_day`, `kiem_ngam_kin`, `kiem_mieng_can_giua` qua. Các kiểm cũ `kiem_vung_mieng_day`, `kiem_vien_lien`, `kiem_ham_mo`, `kiem_mieng_khong_xuyen` vẫn qua.
- [ ] **Step 5: Commit** `mat_nu.py kiem_rig_nu.py rig_nu.py nhan-vat-nu-rig.blend` — `feat(nu-rig): lưới môi có độ dày kiểu hoạt hình`.

### Task 2: Mở hàm không gấp — trọng số tỏa mềm, Corrective Smooth

**Files:**
- Modify: `mat_nu.py` (đoạn trọng số trong `dung_mieng`)
- Modify: `rig_nu.py` (modifier)
- Modify: `kiem_rig_nu.py`

**Interfaces:**
- Consumes: nhóm `MIENG_MUOT` từ Task 1.
- Produces: modifier `CorrectiveSmooth` trên `Nu_Than` (`vertex_group='MIENG_MUOT'`, `rest_source='ORCO'`, `smooth_type='LENGTH_WEIGHTED'`, `iterations=10`).

- [ ] **Step 1: Viết kiểm:**
  - `kiem_khong_gap`: bật Subdivision, mở hàm 20°. Với mọi cặp mặt kề nhau trong `MIENG_VUNG`, góc giữa hai pháp tuyến vượt góc lúc nghỉ ≤ 25°.
  - `kiem_cs_chi_mieng`:
    - Đặt dáng: `upper_arm.L` X +80°, `forearm.L` X +60°, `ik_foot.L` nhấc 0,15 m.
    - So tọa độ khi bật và khi tắt CorrectiveSmooth. Đỉnh ngoài `MIENG_MUOT` lệch < 0,0001 m.
  - `kiem_muot` (đã có): thêm điều kiện thứ tự modifier Armature → CorrectiveSmooth → Subdivision.
- [ ] **Step 2: Chạy kiểm**, thấy FAIL (chưa có modifier; lưới hiện gấp ở khóe).
- [ ] **Step 3: Trọng số hàm.**
  - Giá trị ban đầu: môi dưới, cằm 1; môi trên, dưới mũi 0; má theo `_ss` của khoảng cách tới khóe.
  - Làm trơn Laplacian 15 lượt trên đồ thị cạnh, chỉ trong `MIENG_MUOT`. Giữ cố định giá trị ở các đỉnh khe môi (`MIENG_MOI_TREN` = 0, `MIENG_MOI_DUOI` = 1) và ở viền ngoài của `MIENG_MUOT`.
  - Thêm modifier theo Interfaces trong `rig_nu.py`.
- [ ] **Step 4: Dựng lại, chạy kiểm.** `kiem_khong_gap`, `kiem_cs_chi_mieng`, `kiem_muot` qua, cùng toàn bộ kiểm cũ.
- [ ] **Step 5: Commit** — `feat(nu-rig): mở hàm không gấp (trọng số mềm, Corrective Smooth)`.

### Task 3: Shape key mượt, giữ thể tích môi

**Files:**
- Modify: `mat_nu.py` (`dung_shape_key_mieng`)
- Modify: `kiem_rig_nu.py`

**Interfaces:**
- Consumes: nhóm đỉnh của Task 1.
- Produces: đủ tên shape key như cũ, cộng `mo_ham_khoe` có driver theo `jaw`. `khau-hinh.json` ghi lại; nhóm âm không đổi, độ `jaw_do` được chỉnh theo ảnh.

- [ ] **Step 1: Viết kiểm:**
  - `kiem_khau_hinh_muot`: với mỗi shape key, độ chênh độ dời giữa hai đỉnh kề nhau ≤ 40% độ dời lớn nhất của key đó.
  - Mở rộng `kiem_khong_gap` (Review Focus 2): chạy thêm với từng `vs_*` = 1 kèm độ mở hàm trong `khau-hinh.json`.
  - Giữ các kiểm shape key cũ: đủ tên, chỉ ở miệng, khác nhau, đối xứng, bảng khẩu hình.
- [ ] **Step 2: Chạy kiểm**, thấy FAIL.
- [ ] **Step 3: Dựng lại shape key.**
  - Mỗi key là trường dời theo tọa độ cục bộ quanh khe, có trọng số giảm mềm theo khoảng cách tới khe (`_ss` từ vòng 3 tới vòng 8).
  - Môi giữ thể tích: các vòng 0–3 dời cùng nhau theo một khung cục bộ, không ép dẹt.
  - Các key `chu_moi`, `vs_O`, `vs_U` đẩy môi ra trước kiểu hoạt hình, 4–7 mm.
  - Căn biên độ theo ảnh Task 5.
- [ ] **Step 4: Chạy kiểm**, thấy PASS.
- [ ] **Step 5: Commit** `mat_nu.py kiem_rig_nu.py khau-hinh.json nhan-vat-nu-rig.blend` — `feat(nu-rig): khẩu hình mượt giữ thể tích môi`.

### Task 4: Bên trong miệng kiểu hoạt hình

**Files:**
- Modify: `mat_nu.py` (thay các khối răng, lưỡi, khoang trong `dung_mieng`)
- Modify: `kiem_rig_nu.py`

**Interfaces:**
- Produces: object `Nu_RangTren` (cha `head`); `Nu_RangDuoi`, `Nu_Luoi` (cha `jaw`); `Nu_KhoangMieng` (cha `head`); object mới `Nu_LoiTren`, `Nu_LoiDuoi` (lợi hồng, cha theo răng). Tên cũ giữ nguyên, nên `kiem_ham_mo` và `kiem_mieng_khong_xuyen` dùng được tiếp.

- [ ] **Step 1: Viết kiểm** `kiem_rang_cong`: với răng trên và răng dưới, trên dải cong của răng, chênh y giữa đỉnh ở giữa và đỉnh ở hai đầu ≥ 0,006 m (dải uốn hình chữ U theo cung hàm).
- [ ] **Step 2: Chạy kiểm**, thấy FAIL (răng hiện là elip, độ cong không đủ).
- [ ] **Step 3: Dựng các bộ phận trong miệng.**
  - Răng là dải quét theo cung parabol y = y0 + k·x² (k cho hai đầu lùi 8 mm), tiết diện chữ nhật bo góc, cao 3,5 mm, dày 2,5 mm, rộng bằng 0,8 lần bề ngang khe.
  - Lợi là dải tương tự, cao hơn răng 1,5 mm, màu hồng.
  - Lưỡi là elip dẹt, nửa trước thuôn thành đầu lưỡi.
  - Khoang miệng ôm theo các vòng `trong`.
- [ ] **Step 4: Chạy kiểm**, thấy PASS (cả `kiem_mieng_khong_xuyen` và `kiem_ham_mo`).
- [ ] **Step 5: Commit** — `feat(nu-rig): răng, lợi, lưỡi kiểu hoạt hình`.

### Task 5: Ảnh duyệt, README

**Files:**
- Modify: `chup_duyet.py`, `README.md`, `xem-truoc.webp`

- [ ] **Step 1: Thêm chế độ chụp miệng vào `chup_duyet.py`.** Dùng tham số `--mieng`; chụp cận cả thẳng và 3/4 các dáng: ngậm, hé (hàm 6°), há 18°, cười, mếu, chu, A, O, U, MBP, E.
- [ ] **Step 2: Chụp, ghép bảng** bằng `bang.cjs`, rồi soi. Chỉnh biên độ ở Task 3 nếu khẩu hình khó đọc; chạy lại toàn bộ kiểm.
- [ ] **Step 3: README.** Mô tả miệng mới, kiểm mới, giới hạn còn lại (ranh màu môi nếu còn thấy, theo Review Focus 4).
- [ ] **Step 4: Commit và push nhánh** — `docs(nu-rig): ảnh duyệt và README miệng hoạt hình`.
