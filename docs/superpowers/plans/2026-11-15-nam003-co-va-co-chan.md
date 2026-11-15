# NAM-003 cổ và cổ chân — Kế hoạch thực hiện

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cổ của rig `nam-003` quay/cúi/nghiêng như người thật (cận mặt không nếp) và cổ chân được chọn bằng đo biến dạng.

**Architecture:** Hai xương phụ `NeckBlend1/2` xoay theo `Head` (Copy Rotation, như `LeftArmBlend` trong `rig_nam002.py`) chia xoắn dọc cổ, trọng số theo gradient z; một Corrective Smooth thứ hai riêng vùng cổ; cổ chân chọn bằng lưới thử `NAM003_J` + đo cạnh giãn/co. Mọi thứ do `rig_nam003.py` dựng; kiểm bằng script đo (đóng vai trò test) chạy trong Blender.

**Tech Stack:** Blender 5.2.x (`bpy`, Python 3), numpy; xem lệnh chạy ở từng bước (`<bpy-python>` = Python có module `bpy` 5.2, hoặc `blender -b --factory-startup --python <file> -- <đối số>`).

**Spec:** `docs/superpowers/specs/2026-11-15-nam003-co-va-co-chan-design.md`

## Global Constraints
- Blender 5.2.x; mọi thay đổi rig nằm trong `assets/nhan-vat-3d/nam-003/` và được dựng lại từ `rig_nam003.py` (script là nguồn chính).
- Cổ: quay ±35°, cúi/ngửa ±25°, nghiêng ±20° + 3 tư thế kết hợp → cạnh dài thêm tối đa **≤ 6 mm**, **0** cạnh giãn >1,5× trong vùng cổ (z 1,40–1,66; cạnh dài >3 mm lúc nghỉ).
- Xương `Head`, trọng số đầu (z ≥ 1,60) và vị trí xương `Head` **không đổi**.
- Tối đa **4** xương/đỉnh, tổng trọng số 1; tên Mixamo, xương phụ tên `NeckBlend1`, `NeckBlend2`.
- 11 tư thế của `rig_nam002.py` không xấu đi: 0 cạnh giãn >2×; ngồi xổm giãn tối đa ≤ **1,89×**.
- Ảnh cận cổ/cằm ở cả **1,60 m** và **1,70 m**; chủ repo duyệt ảnh trước khi coi là xong.
- Không dùng dịch vụ trả phí; không commit `.blend` nào ngoài `nam-003-rig.blend`; không đổi lưới `Nam_Body`.

## Review Focus
1. Xoay đầu khi thân đang xoắn (`Spine` +30°): cổ không méo thêm — Task 2 có tư thế kết hợp "quay 25° + xoắn thân 30°".
2. Đối xứng: quay +35° và −35° cho số đo giống nhau (sai khác ≤ 1 mm) — Task 2 test `test_symmetry`.
3. Bên làm mặt gắn 100 % `Head`: trọng số đầu và vị trí `Head` không đổi — Task 2 test `test_head_unchanged`.
4. Scale 1,60/1,70 m không phá cổ — Task 1 chạy đo ở `scale=0.877` (1,60/1,824) và `0.932` (1,70/1,824).
5. GLB không mang ràng buộc: `NeckBlend` chỉ hoạt động trong Blender — Task 5 ghi rõ trong README; không đưa `.glb` đã rig lên repo.

---

### Task 1: Script đo cổ (test viết trước) và kết quả nền

**Files:**
- Create: `assets/nhan-vat-3d/nam-003/kiem_co_nam003.py`
- Modify: `assets/nhan-vat-3d/nam-003/rig_nam003.py` (dòng cuối: chỉ gọi `main()` khi có `--out` trong `sys.argv`, để `import rig_nam003` không chạy dựng rig)

**Interfaces:**
- Produces: `NECK_POSES: dict[str, list[tuple[str, tuple[float,float,float], float]]]` (tên → danh sách (xương, trục thế giới, độ)); `measure_neck(rig_path: str, scale: float = 1.0) -> dict[str, dict[str, float]]` trả `{pose: {'max_mm': float, 'n_over_1_5': int}}`; dòng lệnh `<bpy-python> kiem_co_nam003.py --rig nam-003-rig.blend [--scale S] [--anh dir]` in bảng và thoát mã 1 nếu có tư thế vượt ngưỡng.

- [ ] **Step 1: Viết `kiem_co_nam003.py`.** `NECK_POSES` gồm đúng: `quay+35`, `quay-35` (Head quanh Z), `cui+25`, `ngua-25` (Head quanh X, +X là cúi), `nghieng+20`, `nghieng-20` (Head quanh Y), `kq1` quay 35 + cúi 15, `kq2` quay −35 + ngửa 15, `kq3` nghiêng 20 + quay 25, `kq4` quay 25 + `Spine` xoắn 30° quanh Z. Xoay quanh đầu xương bằng cùng cách `rot_world` của `rig_nam002.py` (lấy từ `rig_nam003.patched_namespace()`). `measure_neck` đo cạnh có chiều dài nghỉ >3 mm và z cạnh trong 1,40–1,66 (nhân `scale`); `max_mm` = max(độ dài mới − độ dài nghỉ)×1000 / scale... (đo theo mm thật của nhân vật đã scale). Hằng `NGUONG_MM = 6.0`, `NGUONG_GIAN = 1.5`.
- [ ] **Step 2: Test của script.** Thêm hàm `test_symmetry(res)` (|max_mm(quay+35) − max_mm(quay−35)| ≤ 1.0) và `test_thresholds(res)` (mọi pose `max_mm ≤ 6.0` và `n_over_1_5 == 0`); `main` gọi cả hai, in PASS/FAIL từng dòng.
- [ ] **Step 3: Chạy trên rig hiện tại để thấy FAIL.** Run: `<bpy-python> kiem_co_nam003.py --rig nam-003-rig.blend` → Expected: `quay+35` `max_mm` ≈ 12–13 và FAIL; ghi bảng nền vào commit message. Chạy thêm `--scale 0.877` và `--scale 0.932`.
- [ ] **Step 4: Commit** — `git add assets/nhan-vat-3d/nam-003/kiem_co_nam003.py assets/nhan-vat-3d/nam-003/rig_nam003.py && git commit -m "test(nam-003): script đo cổ và kết quả nền"`.

### Task 2: Xương phụ cổ (B)

**Files:**
- Create: `assets/nhan-vat-3d/nam-003/co_nam003.py`
- Modify: `assets/nhan-vat-3d/nam-003/rig_nam003.py` (gọi hai hàm dưới sau `bind`, trước `limit_total`)
- Modify: `assets/nhan-vat-3d/nam-003/kiem_co_nam003.py`

**Interfaces:**
- Consumes: `measure_neck`, `NECK_POSES`, ngưỡng từ Task 1.
- Produces: `add_neck_bones(arm: bpy.types.Object) -> None` (tạo `NeckBlend1`, `NeckBlend2` giữa `Neck` và `Head`, deform, Copy Rotation từ `Head`, ảnh hưởng `NECK_INFLUENCE = (0.33, 0.66)`); `set_neck_weights(body: bpy.types.Object, z_lo: float = 1.46, z_hi: float = 1.60) -> None` (gradient `Spine2`→`NeckBlend1`→`NeckBlend2`→`Head` theo z, mượt, đỉnh z ≥ `z_hi` giữ nguyên trọng số `Head` = 1).

- [ ] **Step 1: Viết test trước** trong `kiem_co_nam003.py`: `test_helper_bones(arm)` (có `NeckBlend1`, `NeckBlend2`, `use_deform`), `test_head_unchanged(arm, body)` (xương `Head` đầu (0,0.04,1.58) đuôi (0,0.02,1.824) sai ≤ 1e-4; mọi đỉnh z ≥ 1,60 có `Head` ≥ 0,999), `test_four_influence(body)` (mỗi đỉnh ≤ 4 nhóm xương, tổng 1 ± 0,02).
- [ ] **Step 2: Chạy để thấy FAIL.** Run: `<bpy-python> kiem_co_nam003.py --rig nam-003-rig.blend` → Expected: `test_helper_bones` FAIL.
- [ ] **Step 3: Cài `add_neck_bones`** theo cách `LeftArmBlend` được tạo trong `build_armature` của `rig_nam002.py` (cha, vị trí, ràng buộc Copy Rotation từ xương con); đặt hai xương đều giữa z 1,50–1,58 trong chuỗi cổ.
- [ ] **Step 4: Cài `set_neck_weights`** và gọi cả hai trong `rig_nam003.main()` sau `bind`; làm mượt Laplace vài chục vòng chỉ trên đỉnh z 1,46–1,60.
- [ ] **Step 5: Dựng lại và chạy đo.** Run: `<bpy-python> rig_nam003.py --out /tmp/n3c.blend` rồi `<bpy-python> kiem_co_nam003.py --rig /tmp/n3c.blend` → Expected: `test_head_unchanged`, `test_four_influence`, `test_symmetry` PASS; ghi `max_mm` từng tư thế. Nếu chưa ≤ 6 mm, chỉnh `NECK_INFLUENCE` hoặc số vòng làm mượt (thử vài giá trị, giữ bảng thử trong README) trước khi sang Task 3.
- [ ] **Step 6: Commit** — `git add assets/nhan-vat-3d/nam-003/co_nam003.py assets/nhan-vat-3d/nam-003/rig_nam003.py assets/nhan-vat-3d/nam-003/kiem_co_nam003.py && git commit -m "feat(nam-003): xương phụ cổ NeckBlend1/2 và trọng số gradient"`.

### Task 3: Corrective Smooth cho cổ (C) và ảnh cận

**Files:**
- Modify: `assets/nhan-vat-3d/nam-003/co_nam003.py`, `assets/nhan-vat-3d/nam-003/rig_nam003.py`, `assets/nhan-vat-3d/nam-003/kiem_co_nam003.py`

**Interfaces:**
- Consumes: kết quả Task 2.
- Produces: `add_neck_cs(body: bpy.types.Object, iterations: int = 20, factor: float = 0.5) -> None` (nhóm đỉnh `cs_co` trọng số mềm cho đỉnh z 1,48–1,62, |x| < 0,09; thêm modifier `CorrectiveSmoothCo` sau `CorrectiveSmooth` hiện có, `rest_source='ORCO'`, `smooth_type='LENGTH_WEIGHTED'`); tham số `--anh dir` của `kiem_co_nam003.py` xuất ảnh cận cổ (chính diện, 3/4, bên, dưới cằm) cho `quay+35`, `kq1`, `cui+25`, ở `--scale` cho trước.

- [ ] **Step 1: Test.** Thêm `test_cs_modifier(body)` (có nhóm `cs_co` và modifier `CorrectiveSmoothCo`, nhóm `cs_vai_hang` và modifier cũ còn nguyên) và thêm vào `test_thresholds` một dòng báo cáo `max_mm` sau C so với sau B.
- [ ] **Step 2: Chạy để thấy FAIL** (`test_cs_modifier`).
- [ ] **Step 3: Cài `add_neck_cs`**, gọi trong `main()` sau `set_neck_weights`; thử `iterations` 10/20/40 và `factor` 0,3/0,5/0,8, giữ bảng thử; chọn bộ cho `max_mm` thấp nhất mà ảnh cận không bị bẹp thể tích.
- [ ] **Step 4: Chạy đầy đủ.** Run: `<bpy-python> kiem_co_nam003.py --rig /tmp/n3d.blend --anh /tmp/co1` và với `--scale 0.877`, `--scale 0.932` → Expected: mọi tư thế `max_mm ≤ 6.0`, `n_over_1_5 == 0`, PASS toàn bộ; xem ảnh cận bằng mắt, ghi chỗ còn nếp.
- [ ] **Step 5: Commit** — `git add ... && git commit -m "feat(nam-003): Corrective Smooth cho cổ và ảnh cận"`.

### Task 4: Chọn vị trí cổ chân

**Files:**
- Create: `assets/nhan-vat-3d/nam-003/chon_co_chan_nam003.py`
- Modify: `assets/nhan-vat-3d/nam-003/rig_nam003.py` (giá trị `ankle` trong `J`)

**Interfaces:**
- Consumes: biến môi trường `NAM003_J` của `rig_nam003.py`.
- Produces: `chon_co_chan_nam003.py` dựng rig cho `z ∈ {0.08, 0.10, 0.12, 0.14}` × `y ∈ {0.04, 0.05, 0.06}`, đo qua các tư thế `buoc_chan`, `ngoi_xom`, `nhac_chan_IK` (như `do_khop.py`: cạnh giãn >1,5×, co <0,6×, max) và thêm tư thế `mui_chan` (`ik_foot.L` quay ±20° quanh X); in bảng và vị trí được chọn (tổng cạnh giãn + co nhỏ nhất, hòa thì max giãn nhỏ hơn).

- [ ] **Step 1: Viết `chon_co_chan_nam003.py`** theo `do_khop.py` đã dùng cho khuỷu/gối (4 tiến trình song song, mỗi rig ~2 phút).
- [ ] **Step 2: Chạy** `<bpy-python> chon_co_chan_nam003.py` → Expected: in bảng 12 dòng và dòng `CHON: ankle=(x, y, z)`.
- [ ] **Step 3: Đặt giá trị chọn vào `J` của `rig_nam003.py`**, dựng lại, xem ảnh bàn chân khi bước và nhón gót; ghi bảng vào README.
- [ ] **Step 4: Commit** — `git commit -m "feat(nam-003): chọn vị trí cổ chân bằng đo biến dạng"`.

### Task 5: Hồi quy, dựng bản chính thức, tài liệu

**Files:**
- Modify: `assets/nhan-vat-3d/nam-003/nam-003-rig.blend`, `assets/nhan-vat-3d/nam-003/README.md`, `assets/nhan-vat-3d/nam-003/BAN-GIAO-MAT.md`
- Create: `assets/nhan-vat-3d/nam-003/co-thu.webp`

**Interfaces:**
- Consumes: Task 1–4.
- Produces: `nam-003-rig.blend` v3 trên nhánh làm việc; ảnh `co-thu.webp` để chủ repo duyệt.

- [ ] **Step 1: Hồi quy 11 tư thế.** Run: `<bpy-python> rig_nam003.py --out nam-003-rig.blend --anh /tmp/hq` → Expected: bảng `stretch` có 0 cạnh >2× ở mọi tư thế, `ngoi_xom` max ≤ 1,89×; ngược lại quay lại sửa Task 2–4.
- [ ] **Step 2: Chạy lại `kiem_co_nam003.py` trên bản chính thức**, ở scale 1,0 / 0,877 / 0,932 → Expected: PASS toàn bộ; chạy `rig_nam003.py` lần hai và so số đo: giống nhau.
- [ ] **Step 3: Tài liệu.** README mục "Cổ và cổ chân": bảng nền → sau B → sau C, bảng chọn cổ chân, ảnh `co-thu.webp` (cận cổ/cằm nhiều góc, 1,60 m và 1,70 m), ghi `NeckBlend` chỉ chạy trong Blender (GLB không mang ràng buộc), danh sách chưa kiểm (áo quần, mặt, đi bộ). Cập nhật `BAN-GIAO-MAT.md`: rig v3, `Head` không đổi, chạy lại script mặt trên bản mới.
- [ ] **Step 4: Commit và push nhánh làm việc.** `git push origin claude/brave-cray-lbf9gu`. **Chưa push `main`**: gửi `co-thu.webp` cho chủ repo duyệt; chỉ đẩy `main` (thư mục `nam-003`) khi chủ repo đồng ý.
