# Dựng lại vùng mặt đầu Nam theo ảnh mẫu — Kế hoạch dựng

> **Dành cho người thực thi:** dùng superpowers:subagent-driven-development (khuyến nghị) hoặc superpowers:executing-plans, làm từng task. Bước dùng ô `- [ ]`.

**Mục tiêu:** vùng mặt đầu Nam (mắt, mí, mũi, má, miệng, cằm) khớp ảnh mẫu ở mặt trước, mặt nghiêng, 3/4, đo được; giữ sọ, tai, cổ, tóc v4.

**Kiến trúc:** giữ `dung_dau_cage_nam.py` làm nền (cage nửa + Subdivision, nhãn cầu riêng, mí/hốc, khoang miệng). Thêm module đo (`do_mau_nam.py`) để biến "bám sát mẫu" thành số, rồi chỉnh vùng mặt trong module riêng (`mat_theo_mau_nam.py`) gọi từ entry cũ; sửa tối thiểu trong `dung_dau_cage_nam.py`. Cổng 1: bảng ảnh chồng mẫu cho chủ repo duyệt trước khi đụng rig.

**Công nghệ:** Blender 5.0.1 qua `bpy` (container `/tmp/bpyenv`, Python 3.11; người dùng `D:/blender/blender.exe -b --factory-startup --python ... --`), Pillow cho ảnh chồng. "Test" của repo này là hàm kiểm trong script, chạy bằng `--check` và báo PASS/FAIL, cộng thêm `python -m pytest` cho phần thuần Python (đổi toạ độ ảnh, bảng mốc) không cần `bpy`.

**Thiết kế:** `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/THIET-KE-DAU-THEO-MAU.md` (đã duyệt).

## Ràng buộc chung

- Mọi file của tập ở `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/`; mã Blender ở `assets/nhan-vat-3d/`. Không `git add .`; add từng đường dẫn, kèm dòng đuôi `Co-Authored-By` và `Claude-Session`.
- Không đẩy `main` khi chủ repo chưa nói "duyệt". Không tạo media tốn phí; render chỉ ảnh tĩnh nhỏ (≤ 640 px, `--samples` ≤ 24), không video trước cổng 1.
- Không đổi: tóc v4, tỉ lệ đầu–thân, tai, cổ. Không rig mặt, không 24 nhóm biểu cảm, không ghép tay.
- Không bù co Subdivision (`fit_cage`) cho vòng mí, môi, biên mắt/miệng. Shape key mí xoay cả hốc cùng mí. Displace/Shrinkwrap tính ở toạ độ cục bộ: bake transform trước. Armature chuẩn hoá trọng số.
- Đường dẫn tuyệt đối cho `--render` và `--blend` khi chạy bằng Blender của người dùng.
- Ngưỡng sai số (lựa chọn của người dựng, ghi lại ở Task 2): mốc ở mặt trước và nghiêng lệch ≤ 3% chiều cao đầu trong ảnh; mốc 3/4 ≤ 4%.

## Trọng tâm rà soát (chưa được task nào đo trực tiếp)

1. Mí nhắm hết cỡ xuyên nhãn cầu mới (cầu to hơn cũ) → Task 4 có test xuyên cầu khi nhắm.
2. Mép khâu mặt/sọ lộ hoặc nứt khi hàm mở 10° (shape key `Mo_Ham`) → Task 6.
3. Tóc v4 xuyên da hoặc hở ở trán/thái dương khi sọ vùng trán đổi → Task 6.
4. Cage nửa phản chiếu: đỉnh x=0 bị kéo lệch làm đường giữa mặt gãy hoặc hở → Task 5.
5. Nốt ruồi trái mờ hoặc nằm ngoài mặt sau khi trán đổi → Task 5.

## Cấu trúc file

| File | Việc |
|---|---|
| `assets/nhan-vat-3d/do_mau_nam.py` (mới) | bảng mốc mẫu, đổi ảnh↔mét, `sai_lech(asm) → dict`, ảnh chồng |
| `assets/nhan-vat-3d/mat_theo_mau_nam.py` (mới) | định vùng mặt/đường khâu, dựng lại mắt, mí, mũi, má, miệng, cằm |
| `assets/nhan-vat-3d/dung_dau_cage_nam.py` (sửa ít) | gọi module mới, thêm vào `check_all` và `--mau` |
| `assets/nhan-vat-3d/kiem_thu_mat/test_do_mau.py` (mới) | pytest phần thuần Python |
| `ASSET.md`, `GHI-CHU.md`, `assets/nhan-vat-3d/KET-QUA-DAU-CAGE.md` | kết quả, số đo, điểm còn mở |

---

### Task 1: Đưa nguồn cage về nhánh làm việc và đo đường cơ sở

**Files:**
- Modify (đưa từ nhánh `claude/dreamy-wu-7079a5`, commit `da0da83`): `assets/nhan-vat-3d/dung_dau_cage_nam.py`, `dung_than_cage_nam.py`, `KET-QUA-DAU-CAGE.md` và các file chúng import
- Create: `assets/nhan-vat-3d/kiem_thu_mat/` (rỗng, thêm `__init__.py`)

**Interfaces:**
- Produces: `dung_dau_cage_nam.build(args) → (sc, head, asm, ASM_MAP, eyes)` chạy được trên nhánh làm việc; `--check` PASS làm mốc so sánh.

- [ ] **Step 1:** `git merge --no-ff origin/claude/dreamy-wu-7079a5` vào nhánh làm việc; nếu xung đột, giữ phía nhánh cage cho file `dung_*cage*` và phía nhánh làm việc cho `rig_mat_nam/`, `bieu_cam/`, tài liệu thiết kế.
- [ ] **Step 2:** Chạy `python dung_dau_cage_nam.py -- --check --samples 8` (trong `/tmp/bpyenv`, thư mục `nhan-vat-3d`). Mong đợi: `check_all` PASS như nhánh gốc.
- [ ] **Step 3:** Chụp 3 ảnh cơ sở (`truoc`, `nghieng`, `goc34`) bằng `--render <tuyệt đối>/scratch/co-so --samples 8` và ghi lại, chưa đo.
- [ ] **Step 4:** Commit merge (chỉ các đường dẫn mới đến) rồi push nhánh làm việc.

---

### Task 2: Bảng mốc mẫu và hàm đo sai lệch

**Files:**
- Create: `assets/nhan-vat-3d/do_mau_nam.py`, `assets/nhan-vat-3d/kiem_thu_mat/test_do_mau.py`

**Interfaces:**
- Produces: `MOC_MAU: dict[str, dict[str, tuple[float, float]]]` (khoá ngoài là góc `'truoc' | 'nghieng' | 'goc34'`, khoá trong là tên mốc: `mat_L_ngoai, mat_L_trong, mi_tren_L, mi_duoi_L, mat_R_*, dinh_mui, can_mui, mieng_L, mieng_R, mieng_giua_tren, mieng_giua_duoi, cam, ria_ma_L, ria_ma_R, tai_tren, tai_duoi, not_ruoi`; giá trị là toạ độ ảnh đã chuẩn hoá theo chiều cao đầu, (0,0) = tâm khung);
  `anh_sang_met(p: tuple[float, float], goc: str) -> tuple[float, float, float]`;
  `sai_lech(asm) -> dict[str, float]` (mỗi mốc → sai lệch tính theo % chiều cao đầu trong ảnh), `NGUONG = {'truoc': 3.0, 'nghieng': 3.0, 'goc34': 4.0}`.

- [ ] **Step 1: Viết test (pytest, thuần Python):**
  `test_anh_sang_met_roundtrip`: đổi một mốc sang mét rồi chiếu lại đúng về điểm ban đầu (sai số < 1e-6).
  `test_moc_day_du`: mọi góc có đủ tên mốc nêu trên; `not_ruoi` nằm bên trái ảnh mặt trước của nhân vật (đúng Nam: nốt ruồi trái).
  `test_nguong_co_mat`: `NGUONG` có đúng 3 khoá.
- [ ] **Step 2:** Chạy `pytest assets/nhan-vat-3d/kiem_thu_mat -q`. Mong đợi: FAIL (module chưa có).
- [ ] **Step 3:** Đọc ảnh mẫu `../thiet-ke/thu-3d/mau-3d-dau.webp`, `mau-3d-xoay.webp`, `mau-dau-tran-front.png`, `mau-dau-tran-profile.webp`; đánh dấu các mốc trên ảnh, ghi toạ độ pixel và đổi sang toạ độ chuẩn hoá. Ghi từng mốc và nguồn ảnh vào `MOC_MAU` (toạ độ nằm trong mã, không đọc ảnh lúc chạy).
- [ ] **Step 4:** Cài `anh_sang_met` và `sai_lech`: chiếu các đỉnh chuẩn của cage (mép mắt, đỉnh mí, đỉnh mũi, khoé miệng, cằm, rìa má, tai, nốt ruồi) bằng camera chính giao của `HVIEWS`, so với `MOC_MAU`.
- [ ] **Step 5:** Chạy lại pytest. Mong đợi: PASS. Chạy `sai_lech` trên đầu cage hiện tại và lưu bảng vào `GHI-CHU.md` (đường cơ sở). Mong đợi: ít nhất mắt và mũi vượt `NGUONG`, nếu không thì hàm đo chưa phát hiện được chỗ lệch mà chủ repo thấy, quay lại Step 3.
- [ ] **Step 6:** Commit.

---

### Task 3: Định vùng mặt và đường khâu

**Files:**
- Create: `assets/nhan-vat-3d/mat_theo_mau_nam.py`
- Modify: `assets/nhan-vat-3d/dung_dau_cage_nam.py` (chỉ chỗ gọi), `kiem_thu_mat/test_do_mau.py`

**Interfaces:**
- Consumes: `RINGS`, `EYE_MAP`, `MOUTH_MAP`, `HEAD_IDX` của `dung_dau_cage_nam`.
- Produces: `vung_mat(idx) → set[int]` (chỉ số đỉnh cage thuộc vùng mặt), `duong_khau(idx) → list[int]` (vòng đỉnh biên giữa mặt và sọ, có thứ tự), `build_mat_theo_mau(head, S, idx)` (chưa làm gì ở task này).

- [ ] **Step 1: Test:** `test_vung_mat_khong_chua_tai_co_toc`: vùng mặt không giao với đỉnh tai, cổ, hoặc dải chân tóc; `test_duong_khau_kin`: đường khâu là vòng kín, mọi đỉnh nằm trong vùng sọ ∩ vùng mặt, ≥ 24 đỉnh; `test_duong_khau_ngoai_cu_dong`: không đỉnh nào có trọng số `Ham` > 0.05.
- [ ] **Step 2:** Chạy, mong đợi FAIL.
- [ ] **Step 3:** Cài hàm theo `RINGS`/`HEAD_IDX`: đường khâu đặt dọc chân tóc phía trên, sau tai theo thái dương và quanh dưới hàm, là nơi tóc che được và ít chuyển động.
- [ ] **Step 4:** Chạy test, mong đợi PASS. Commit.

---

### Task 4: Mắt theo mẫu (nhãn cầu thật, mí dày, viền đen dày)

**Files:**
- Modify: `assets/nhan-vat-3d/mat_theo_mau_nam.py`, `dung_dau_cage_nam.py` (bỏ co ×0,824 và làm phẳng vùng mắt, đặt `EYE_FLAT = 0.0` có điều kiện theo cờ mới)

**Interfaces:**
- Produces: `dung_mat(head, S, idx, ef) → dict` gồm `{'nhan_cau': (L, R), 'mi_tren': ..., 'mi_duoi': ..., 'hoc': ...}`; vòng mắt ≥ 12 đỉnh mỗi bên (thay 8 đỉnh hiện tại); bán kính nhãn cầu theo mốc `mat_*` của `MOC_MAU` (không co); `T_LID` theo mẫu.

- [ ] **Step 1: Test (trong `check_all`, gọi các hàm sẵn `eye_rays`, `inside_eyeball`, `self_hits_ev`):**
  `check_mat_khong_xuyen_cau`: ở mở hết, nhắm nửa, nhắm hết (`set_keys(Nham_Mat=...)`) không đỉnh mí nào nằm trong nhãn cầu (margin 0,999), `self_hits_ev == 0`.
  `check_mat_dung_mau`: `sai_lech` của `mat_*`, `mi_*` dưới `NGUONG`.
  `check_mat_vong_du_dinh`: mỗi vòng mắt ≥ 12 đỉnh, không cạnh biên nào mở (`open_edges == 0`).
  Mong đợi lúc đầu FAIL ở `check_mat_dung_mau`.
- [ ] **Step 2:** Cài lại vùng mắt: bỏ làm phẳng, đặt nhãn cầu bán kính đủ, đặt mí dày trùm nửa trên; viền đen dày theo mẫu (ống viền là vật riêng gắn da, vẫn theo quy ước `Vien_Mat.*`).
- [ ] **Step 3:** Chạy `--check`. Mong đợi: ba hàm trên PASS, các check cũ vẫn PASS. Nếu mí gấp nếp khi nhắm thì sửa vị trí khoé mắt/xoay theo u, không bù co Subdivision.
- [ ] **Step 4:** Chụp `truoc` và `goc34` cận mắt (ảnh nhỏ) và xem bằng mắt. Commit.

---

### Task 5: Mũi, má, miệng, cằm, nốt ruồi theo mẫu

**Files:**
- Modify: `assets/nhan-vat-3d/mat_theo_mau_nam.py`, `dung_dau_cage_nam.py`

**Interfaces:**
- Produces: `chinh_mui_ma_mieng_cam(head, S, idx)` thay `NOSE_DISP` và bảng `RINGS` vùng mặt; nốt ruồi trái đặt theo `not_ruoi`.

- [ ] **Step 1: Test (trong `check_all`):**
  `check_khung_dung_mau`: `sai_lech` của `dinh_mui, can_mui, mieng_*, cam, ria_ma_*, not_ruoi` dưới `NGUONG` ở cả 3 góc.
  `check_dung_giua`: mọi đỉnh x=0 có |x| < 1e-6 và pháp tuyến mặt giữa không đảo (không khe hở khi phản chiếu).
  `check_not_ruoi`: nốt ruồi nằm trên da (khoảng cách tới bề mặt < 1 mm, ngoài mặt) và ở bên trái nhân vật.
  `check_mieng_khep_kin`: `open_edges` của khoang miệng = 0, `MOUTH_GAP` còn khe.
- [ ] **Step 2:** Chạy, mong đợi FAIL ở `check_khung_dung_mau`.
- [ ] **Step 3:** Điều chỉnh bảng vòng và đỉnh vùng mặt theo `sai_lech` (đỉnh nào lệch nhất chỉnh trước), mũi thành cục tròn, má bầu về quai hàm, miệng và cằm theo mẫu. Lặp đo → chỉnh tới khi PASS.
- [ ] **Step 4:** Chạy `--check`. Mong đợi toàn bộ PASS. Commit.

---

### Task 6: Khâu mép, tóc, hàm

**Files:**
- Modify: `assets/nhan-vat-3d/mat_theo_mau_nam.py`, `dung_dau_cage_nam.py`

**Interfaces:**
- Produces: `lam_muot_duong_khau(head, idx, bán_kính)`; không đổi chữ ký ngoài.

- [ ] **Step 1: Test (trong `check_all`):**
  `check_khau_lien`: không cạnh biên mở, không góc nhị diện gấp > 60° dọc `duong_khau`, độ lệch pháp tuyến hai bên đường khâu ≤ 25°.
  `check_khau_khi_mo_ham`: bật `Mo_Ham` = 1: đường khâu không nứt (độ giãn cạnh ≤ 15% so với nghỉ), không tự giao.
  `check_toc_khong_xuyen`: mọi đỉnh tóc v4 ở ngoài da ≥ 0 mm, khe hở tới da ≤ 6 mm ở trán và thái dương.
  Mong đợi lúc đầu có thể FAIL: xem là việc cần làm.
- [ ] **Step 2:** Làm mượt vùng khâu (trọng số giảm dần dọc `duong_khau`, không dịch vòng mí/môi), bật `Mo_Ham` kiểm lại.
- [ ] **Step 3:** Chạy `--check`. Mong đợi PASS toàn bộ, kể cả `check_all` cũ (gaze, mouth_open, jaw_shape, brow, ear).
- [ ] **Step 4:** Nếu `check_khau_lien` không đạt trong ba vòng chỉnh, **dừng và báo chủ repo** rằng sọ cũ lệch mẫu quá nên cần hướng A cho phần sọ. Không vá chồng vá. Commit.

---

### Task 7: Bảng ảnh chồng mẫu cho cổng 1

**Files:**
- Modify: `assets/nhan-vat-3d/dung_dau_cage_nam.py` (`overlay_mau`, `render_all`), `assets/nhan-vat-3d/do_mau_nam.py`

**Interfaces:**
- Produces: `bang_cong1(out) → path` ghép: chồng mẫu mặt trước, nghiêng, 3/4 + cận mắt + cận mũi/miệng + bảng `sai_lech` (đạt/vượt) trong một ảnh ≤ 1600 px chiều rộng.

- [ ] **Step 1:** Chạy `--render <tuyệt đối>/render-dau/giao --mau ../thiet-ke/thu-3d/mau-3d-xoay.webp --samples 24`.
- [ ] **Step 2:** Dựng hai bảng ghép (hình khối chồng mẫu; cận mắt/mũi/miệng) bằng PIL, xem lại từng ảnh trước khi gửi.
- [ ] **Step 3:** Đối chiếu bảng `sai_lech` với ảnh: mốc nào "đạt" mà mắt thấy lệch thì sửa mốc chuẩn (Task 2) và chạy lại, không tự khen.
- [ ] **Step 4:** Cập nhật `KET-QUA-DAU-CAGE.md`, `ASSET.md`, `GHI-CHU.md` (số đo, ngưỡng, điểm còn mở, đường dẫn ảnh; không ghi cốt truyện vào `docs/KINH-NGHIEM.md`). Chỉ thêm vào `KINH-NGHIEM.md` nguyên tắc dùng lại được nếu có (ví dụ: đo sai lệch theo mốc chồng ảnh trước khi duyệt mắt).
- [ ] **Step 5:** Commit, add đúng các đường dẫn đã sửa, push nhánh làm việc. Gửi chủ repo 2 bảng ảnh và danh sách điểm còn mở. **Dừng ở cổng 1.** Không merge `main`, không làm rig trước khi chủ repo nói "duyệt".

---

## Tự rà soát

- **Bao phủ thiết kế:** mục tiêu 1 (khớp mẫu) → Task 2, 4, 5; mục tiêu 2 (mắt thật, mí dày) → Task 4; mục tiêu 3 (nốt ruồi) → Task 5; mục tiêu 4 (tóc, tai, cổ giữ nguyên) → Task 3, 6; mục tiêu 5 (rig sau cổng) → ngoài kế hoạch này theo thiết kế (có thiết kế và kế hoạch riêng sau cổng 1). Cổng 1 và điều kiện chuyển sang hướng A → Task 6 Step 4, Task 7.
- **Việc để người dựng quyết** (thiết kế mục 8): bảng mốc, ngưỡng, đường khâu, số đỉnh vòng và cách gộp nhánh đã có chỗ ở Task 1, 2, 3, 4. Ngưỡng 3–4% là lựa chọn của kế hoạch, ghi lại ở Task 2.
- **Nhất quán tên:** `MOC_MAU`, `sai_lech`, `NGUONG`, `vung_mat`, `duong_khau`, `build_mat_theo_mau`, `dung_mat`, `bang_cong1` dùng đúng một tên ở mọi task.
- **Cỡ kế hoạch:** 7 task cho một giai đoạn; test cơ học nằm trong `check_all` để dùng lại cho giai đoạn rig.
- **Chưa biết trước:** số lần lặp đo → chỉnh ở Task 5 và 6 phụ thuộc kết quả đo thực, nên không ước chi phí chính xác; mỗi vòng chỉ là ảnh tĩnh nhỏ, không tốn phí dịch vụ.
