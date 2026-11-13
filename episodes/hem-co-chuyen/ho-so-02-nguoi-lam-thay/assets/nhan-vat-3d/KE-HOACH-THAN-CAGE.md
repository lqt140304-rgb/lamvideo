# Thân Nam bằng control cage — kế hoạch thực hiện

> **Cho agent thực hiện:** dùng superpowers:subagent-driven-development (khuyên dùng) hoặc superpowers:executing-plans, làm từng task. Các bước dùng ô `- [ ]` để đánh dấu.

**Mục tiêu:** thay thân voxel v2.11 bằng một cage nửa thân thưa (Mirror + Subdivision) phủ cổ → cổ tay/mắt cá, nối đúng vòng cổ bản sao đầu, chốt silhouette theo ảnh mẫu.

**Kiến trúc:** script mới `dung_than_cage_nam.py` dựng lại cảnh v2.11 bằng `dung_than_nam.py` (giữ làm bản cũ, đổi tên vào collection riêng), rồi sinh cage từ bảng số, cắt bàn tay/chân cũ thành vật riêng, lắp cage đã làm mịn với bản sao đầu. Mọi kiểm tra nằm trong `check_all` và in PASS/FAIL; ảnh render là bằng chứng thứ hai.

**Công nghệ:** Blender 5.2.3 (`D:/blender/blender.exe -b --factory-startup --python <script> -- <tham số>`), bmesh, mathutils BVHTree, Cycles CPU; ghép ảnh bằng `what-if-studio/tools/soi/bang.cjs`.

**Thiết kế:** [THIET-KE-THAN-CAGE.md](THIET-KE-THAN-CAGE.md)

## Ràng buộc chung
- Không sửa `dung_dau_nam.py`; đầu phóng đều `HEAD_K = 1,13` như v2.11; không remesh mặt; không scale toàn nhân vật.
- Chiều cao tổng 1,6004 m gồm lọn tóc, sai số cho phép ±1 mm.
- Đơn vị m, sàn Z = 0, mặt −Y, trái nhân vật = +X, hậu tố `.L/.R`.
- Bản lắp ráp tên `Nam_Dau_Than`, collection `02_Body_Base`; bản cũ ở `00_Than_Cu_v211` (ẩn render).
- Không voxel remesh, không smooth toàn thân trên bản mới; smooth chỉ trong vùng có giới hạn ghi trong mã.
- Không cho hai mặt giao nhau để che nếp ở cổ.
- Không commit `.blend`, ảnh; ảnh ra `render-than/cage/`.
- Commit lên `claude/nam-body-mesh-rebuild-dda859`; không đẩy `main`. Đuôi commit: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Trọng tâm khi duyệt
1. Vòng cổ đầu không chia hết cho vòng cổ cage sau làm mịn → phải dừng với thông báo rõ, không bridge lệch số (test ở Task 3).
2. Tay thả xuôi sát thân → khe nách bị Subdivision dính kín; khoảng cách mặt trong bắp tay–mặt bên thân phải > 0 ở mọi z trong vùng nách (test ở Task 1/4).
3. Đỉnh trên đường giữa trôi khỏi x = 0 khi chỉnh bảng → khe/gờ dọc thân sau Mirror; kiểm `|x| < 1e-6` cho mọi đỉnh đường giữa (test ở Task 2).
4. Chỉnh bảng cage làm đổi chiều cao hoặc vị trí cổ tay/mắt cá → bàn tay/chân cũ lơ lửng hoặc hở; kiểm đoạn cổ tay/chân nằm trong ống (test ở Task 3).
5. Chạy lại script nhiều lần trong cùng phiên Blender hoặc với `--headk` khác → tên vật bị thêm `.001`; `check_all` tìm vật theo tên chính xác và FAIL nếu thiếu (test ở Task 1).

---

### Task 1: Nền — gộp nhánh, bản cũ, bộ kiểm

**Tệp:**
- Gộp: `origin/claude/elegant-knuth-w1im6b` vào nhánh làm việc.
- Tạo: `.gitignore` (thư mục này): `render-than/`, `*.blend`, `*.blend1`.
- Sửa: `dung_than_nam.py` — thêm tham số `setup_shader: bool = True` cho `bake_eye_mask(asm, setup_shader=True)`; khi `False` chỉ ghi thuộc tính `eye_mask`, không thêm node (shader đã đọc thuộc tính theo tên).
- Tạo: `dung_than_cage_nam.py`.

**Giao diện:**
- Tạo ra:
  - `build_old() -> bpy.types.Scene`: gọi `T.build_scene(voxel=0.0025)`; đổi tên collection `02_Body_Base` → `00_Than_Cu_v211` (`hide_render = True`), `Nam_Dau_Than` → `Nam_Dau_Than_v211`; giữ `Nam_Than_goc` (thân voxel cũ đã nén KZ, dùng ở Task 3); tạo collection rỗng mới `02_Body_Base`.
  - `check_all(sc) -> dict[str, tuple[bool, str]]`, các khoá: `chieu_cao`, `cage_co`, `cage_duong_giua`, `cage_bien`, `asm_co`, `asm_kin`, `asm_phap_tuyen`, `asm_tu_giao`, `co_khop_vong`, `khe_nach`, `khe_hang`, `tay_chan_trong_ong`. Thiếu vật → `(False, 'thiếu <tên>')`.
  - `report(res) -> bool`: in từng dòng `PASS|FAIL khoá — chi tiết`, trả `True` nếu tất cả PASS.
  - `widths_table(ob) -> dict[str, tuple]`: bề ngang và nhô trước/sau của thân (bỏ tay) ở z chân cổ, vai, ngực, bụng, eo, hông, mông; in cùng log.
  - CLI: `--check`, `--render DIR`, `--blend FILE`, `--samples N` (mặc định 24), `--mau ẢNH` (ảnh mẫu, Task 4), `--phong-dir DIR` (Task 5). `--check` thoát mã 1 nếu có FAIL.
- Ngưỡng cố định: chiều cao 1,6004 ± 0,001 m; tự giao (BVH, bỏ mặt chung đỉnh) = 0; `khe_nach`: khoảng cách nhỏ nhất từ đỉnh mặt trong bắp tay (z 0,70–0,84 sau nén) tới mặt thân ≥ 4 mm; `khe_hang`: khoảng cách nhỏ nhất giữa hai đùi ở z thấp hơn đáy chậu 3 cm ≥ 4 mm.

- [ ] **Bước 1:** `git merge origin/claude/elegant-knuth-w1im6b`; xử lý xung đột nếu có (giữ bản phía nhánh có rig cho các tệp trong `nhan-vat-3d/`, giữ bản `main` cho `boi-canh-3d/`). Kiểm: `git log --oneline -3` có commit gộp.
- [ ] **Bước 2:** tạo `.gitignore`, sửa `bake_eye_mask`, viết `build_old`, `check_all`, `report`, `widths_table`, CLI.
- [ ] **Bước 3:** chạy `D:/blender/blender.exe -b --factory-startup --python dung_than_cage_nam.py -- --check`. Mong đợi: bản cũ dựng xong không lỗi, log in `widths_table` của `Nam_Dau_Than_v211`; `chieu_cao` (tính trên cụm đầu + `02_Body_Base`) và mọi khoá còn lại FAIL `thiếu ...` vì `02_Body_Base` rỗng; thoát mã 1.
- [ ] **Bước 4:** commit `.gitignore`, `dung_than_nam.py`, `dung_than_cage_nam.py`.

### Task 2: Cage nửa thân + tay + chân

**Tệp:** sửa `dung_than_cage_nam.py`.

**Giao diện:**
- Dùng: `build_old`, `check_all` (Task 1).
- Tạo ra:
  - `CAGE_LEVELS: list[dict]`, mỗi mức `{'ten', 'z', 'w', 'f', 'b', 'n'}` (z thế giới sau nén; w nửa ngang; f nhô trước tính từ trục; b nhô sau; n độ vuông tiết diện). Thứ tự từ trên xuống: `chan_co`, `vai`, `nguc`, `duoi_nguc`, `bung`, `eo`, `chau`, `day_chau`. Giá trị khởi điểm: hàng `T.TORSO` gần nhất (z 0,95 / 0,90 / 0,85 / 0,79 / 0,70 / 0,63 / 0,565 / 0,47), z × `T.KZ`, `w=a`, `f=bf`, `b=bb`.
  - `CAGE_OVERRIDE: dict[tuple[str, int], tuple[float, float, float]]`: (tên mức, chỉ số đỉnh 0..6) → dời (dx, dy, dz), để chỉnh riêng một đỉnh.
  - `ARM_RINGS`, `LEG_RINGS: list[dict]` `{'ten', 'c': (x, y, z), 'rx', 'ry'}`; tay: `dau_bap_tay`, `giua_bap_tay`, `khuyu`, `giua_cang_tay`, `co_tay`; chân: `dau_dui`, `giua_dui`, `goi`, `bap_chan`, `mat_ca`. Khởi điểm lấy từ `T.ARM`/`T.LEG` (z × KZ). Tâm `co_tay` và `mat_ca` đo từ mặt cắt ở Task 3 — ở Task 2 dùng `T.ARM[-1]`, `T.LEG[-1]`.
  - `build_cage(coll) -> bpy.types.Object` tên `Nam_Than_Cage`: nửa mesh x ≥ 0; modifier `Mirror` (trục X, `use_clip`, `use_mirror_merge`, ngưỡng 1e-4) và `Subsurf` (`levels=1`, `render_levels=1`).
- Topology (bắt buộc, để mỗi đỉnh có vai trò rõ):
  - Mỗi mức thân là nửa vòng 7 đỉnh, chỉ số 0 giữa trước (x = 0), 1 trước, 2 trước-bên, 3 bên, 4 sau-bên, 5 sau, 6 giữa sau (x = 0). Vị trí theo siêu elip như `T.ring` với nửa trước dùng `f`, nửa sau dùng `b`.
  - Lỗ nách: xoá 4 mặt giữa cột 2–4 và hàng `vai`→`duoi_nguc` (bỏ đỉnh 3 của mức `nguc`), biên 8 cạnh; vòng tay 8 đỉnh đầu tiên chính là biên này; các vòng `ARM_RINGS` 8 đỉnh nối quad tuần tự, cùng thứ tự quay.
  - Đáy: vòng chân 8 đỉnh = 7 đỉnh mức `day_chau` + 1 đỉnh `hang` trên đường giữa (x = 0) thấp hơn `day_chau` theo `z_hang` (khởi điểm 0,025 m); các vòng `LEG_RINGS` nối quad tuần tự.
  - Biên hở được phép: vòng `chan_co` (trên), vòng `co_tay`, vòng `mat_ca`.

- [ ] **Bước 1:** viết test trong `check_all`: `cage_co` = vật `Nam_Than_Cage` có `Mirror` và `Subsurf` level 1; `cage_duong_giua` = mọi đỉnh chỉ số 0/6 và đỉnh `hang` có `|x| < 1e-6`, không đỉnh nào x < −1e-6; `cage_bien` = trên mesh đã đánh giá Mirror (không Subsurf) đúng 3 loại vòng biên hở (cổ 1, cổ tay 2, mắt cá 2), không cạnh > 2 mặt. Chạy `--check` → ba khoá FAIL.
- [ ] **Bước 2:** viết `CAGE_LEVELS`, `CAGE_OVERRIDE` (rỗng), `ARM_RINGS`, `LEG_RINGS`, `build_cage`; gọi trong luồng chính sau `build_old`.
- [ ] **Bước 3:** chạy `--check` → `cage_co`, `cage_duong_giua`, `cage_bien` PASS.
- [ ] **Bước 4:** thêm `render_cage(sc, out)`: ảnh trực giao trước/nghiêng/sau của cage dây (overlay wireframe bằng modifier Wireframe tạm trên bản sao, hoặc vật liệu dây) cạnh bản Subsurf 1 đất sét; chạy `--render render-than/cage/t2`. Tự xem: không khối cầu rời, tiết diện ngực/bụng/hông khác nhau, có khe nách và háng.
- [ ] **Bước 5:** commit `dung_than_cage_nam.py`.

### Task 3: Lắp ráp — cổ, bàn tay/chân, làm mịn

**Tệp:** sửa `dung_than_cage_nam.py`.

**Giao diện:**
- Dùng: `build_cage`, `build_old`, `T.cut_open_head_copy`, `T.bake_eye_mask(asm, setup_shader=False)`.
- Tạo ra:
  - `split_hands_feet(old_body, coll) -> dict[str, bpy.types.Object]`: từ bản sao của `Nam_Than_goc`, cắt bằng mặt phẳng vuông góc trục cẳng tay tại cổ tay (trục lấy từ hai nút cuối `T.ARM`, z × KZ) và mặt phẳng ngang tại mắt cá (`T.LEG[-1]`); giữ phần bàn tay/chân cộng đoạn cổ 2 cm phía thân; đặt tên `Nam_BanTay.L/.R`, `Nam_BanChan.L/.R`; trả thêm `'mat_cat'`: tâm và pháp tuyến 4 mặt cắt. `ARM_RINGS['co_tay']`, `LEG_RINGS['mat_ca']` đặt lại theo tâm/pháp tuyến này trước khi dựng cage.
  - `neck_strip(bm, body_loop, head_loop) -> list[BMFace]`: nối vòng cổ thân (n đỉnh) với vòng cổ đầu (m đỉnh). `m == n`: một hàng quad nối từng cặp, bắt đầu từ đỉnh giữa trước của mỗi vòng. `m == r·n` (r = 2 hoặc 3): mỗi ô (cạnh thân a–b, đỉnh đầu h0..hr, căn theo giữa trước) phủ bằng quạt tam giác, không đỉnh mới: a nối h0..hk, b nối hk..hr với k = r // 2, thêm tam giác (a, hk, b) → r + 1 mặt mỗi ô. Khác: `raise ValueError(f'vòng cổ đầu {m} không chia hết cho vòng thân {n}')`.
  - `assemble_cage(head, cage, skin) -> bpy.types.Object` tên `Nam_Dau_Than`: bản sao cage áp `Mirror` rồi `Subsurf` levels 2; bản sao đầu từ `T.cut_open_head_copy(head)`; đóng nắp tròn lõm vào trong ở vòng cổ tay/mắt cá; `neck_strip`; smooth chỉ các đỉnh trong 10 mm quanh dải nối (không đụng đỉnh đầu phía trên vòng cắt quá 10 mm); `recalc_face_normals`; vật liệu như `T.assemble`; gọi `T.bake_eye_mask(asm, setup_shader=False)`.
- Nửa vòng 7 đỉnh → vòng cổ đầy đủ 12 cạnh → sau Subdivision 2 còn n = 48. Vòng đầu m = 96 hoặc 144 (đo lúc chạy) cho r = 2 hoặc 3. `assemble_cage` ghi thuộc tính tuỳ biến `asm['co_m']`, `asm['co_n']` và in m, n, r.

- [ ] **Bước 1:** viết test: `asm_co` = có `Nam_Dau_Than` trong `02_Body_Base`; `asm_kin` = cạnh hở 0 và cạnh > 2 mặt 0; `asm_phap_tuyen` = thể tích có dấu > 0; `asm_tu_giao` = 0; `co_khop_vong` = `co_m` chia hết cho `co_n` với thương ∈ {1, 2, 3} và không đỉnh nào của thân (index ≥ số đỉnh đầu) nằm trong khối đầu phía trên vòng cắt (ray parity với BVH bản sao đầu); `tay_chan_trong_ong` = mọi đỉnh của vòng mặt cắt mỗi vật tay/chân nằm trong khối `Nam_Dau_Than` hoặc trên mặt (khoảng cách tới mặt ≤ 0,5 mm). Thêm test đơn vị cho `neck_strip` chạy trên hai vòng tròn tổng hợp: (48, 48) → 48 quad; (48, 144) → mỗi đỉnh vòng 144 thuộc ≥ 1 mặt, số mặt = 48 × 4, không cạnh nào thuộc > 2 mặt; (48, 100) → `ValueError`. Chạy `--check` → các khoá trên FAIL, test `neck_strip` FAIL.
- [ ] **Bước 2:** viết `split_hands_feet`, `neck_strip`, `assemble_cage`; luồng chính: `build_old` → `split_hands_feet` → đặt lại `co_tay`/`mat_ca` → `build_cage` → `assemble_cage`; ẩn render `Nam_Than_Cage` (giữ hiện viewport).
- [ ] **Bước 3:** chạy `--check`. Mong đợi: mọi khoá Task 1–3 PASS trừ `khe_nach`/`khe_hang` có thể FAIL (xử lý ở Task 4); `chieu_cao` lúc này tính trên bản mới.
- [ ] **Bước 4:** render nhanh (`--samples 8`) cận cổ–vai trước/nghiêng/sau; tự xem không gờ, không hai lớp cổ, không viền sáng tối ở dải nối.
- [ ] **Bước 5:** commit.

### Task 4: Đối chiếu ảnh mẫu và chỉnh cage

**Tệp:** sửa `dung_than_cage_nam.py` (chỉ bảng số `CAGE_LEVELS`, `CAGE_OVERRIDE`, `ARM_RINGS`, `LEG_RINGS`, `z_hang`, và hàm chồng ảnh).

**Giao diện:**
- Dùng: `T.render_silhouettes`, `widths_table`.
- Tạo ra: `overlay_ref(sil_dir, mau_path, out) -> None`: chồng silhouette trước/nghiêng/sau lên ảnh mẫu (căn đỉnh tóc và đường sàn theo chiều cao, căn đường giữa theo trục, không kéo giãn khác tỉ lệ), tô bản mới viền đỏ, mẫu mờ 50%; ghi `so_mau_truoc.png`, `so_mau_nghieng.png`, `so_mau_sau.png`. Không có `--mau` → in `CHƯA ĐỐI CHIẾU MẪU: thiếu ảnh` và bỏ qua.

- [ ] **Bước 1:** chạy `--render render-than/cage/t4 --mau <ảnh mẫu>`; xem ba ảnh chồng và bảng `widths_table`.
- [ ] **Bước 2:** ghi bảng sai lệch theo 6 mục của thiết kế (cổ–dốc vai; dài thân/đầu; ngang ngực–bụng–hông; bụng–lưng nghiêng; mông–nối đùi; khe tay–thân) vào log của task, mỗi mục: lệch bao nhiêu mm, sửa số nào.
- [ ] **Bước 3:** sửa bảng số; không phình đều mọi mức; eo chỉ thu nhẹ so với ngực và hông; mông đầy vừa không thành kệ. Chạy lại Bước 1. Lặp tới khi mỗi mục lệch ≤ 5 mm hoặc ghi rõ lý do giữ lệch.
- [ ] **Bước 4:** `--check` → mọi khoá PASS kể cả `khe_nach`, `khe_hang`.
- [ ] **Bước 5:** commit.

### Task 5: Bàn giao

**Tệp:**
- Sửa: `dung_than_cage_nam.py` (hàm `render_deliverables`, gọi `dat_nam_vao_phong.py`).
- Tạo: `KET-QUA-THAN-CAGE.md`.
- Sửa: `../../ASSET.md` (dòng nguồn Nam: thêm `dung_than_cage_nam.py`, trạng thái "đạt hình khối tĩnh, chưa rig").

**Giao diện:**
- Tạo ra: `render_deliverables(sc, out) -> list[str]` đường dẫn ảnh: `truoc`, `nghieng`, `sau`, `goc34`; `cu_moi_truoc`, `cu_moi_nghieng` (bản cũ và mới cạnh nhau cùng tỉ lệ, cùng sàn); `can_co_vai`, `can_nach`, `can_bung_duoi_hong` (mỗi cái trước + nghiêng); `cage_day` + `cage_min` (cùng góc). Đất sét xám trung tính, đèn `T.lights`.

- [ ] **Bước 1:** chạy `--render render-than/cage/giao --blend render-than/cage/Nam_than_dau.blend --mau <ảnh mẫu> --samples 48`.
- [ ] **Bước 2:** đặt vào phòng: lấy `boi-canh-3d` bằng `git archive` từ nhánh có `xay_phong_tro.py` (xem docstring `dat_nam_vao_phong.py`) vào scratchpad; chạy `dat_nam_vao_phong.py --phong-dir <dir> --nam-blend render-than/cage/Nam_than_dau.blend --out render-than/cage/giao/trong_phong.png`. Kiểm: chỉ nạp `Nam_Dau` và `02_Body_Base` (bản cũ không hiện).
- [ ] **Bước 3:** ghép bảng bằng `node what-if-studio/tools/soi/bang.cjs` (chạy trong `what-if-studio/`) thành `bang_giao.png`; tự soi toàn bộ, sửa lỗi thấy được (quay lại Task 4 nếu là tỉ lệ).
- [ ] **Bước 4:** viết `KET-QUA-THAN-CAGE.md`: lệnh chạy, log `check_all`, bảng số đo thực (`widths_table` cũ và mới), bảng sai lệch với mẫu, điểm còn chưa đạt (ít nhất: nối tạm bàn tay/chân giao mặt; rig cũ không khớp; chưa kiểm biến dạng; đối chiếu mẫu nếu thiếu ảnh). Sửa dòng `ASSET.md`.
- [ ] **Bước 5:** `--check` lần cuối → mọi khoá PASS. Commit `dung_than_cage_nam.py`, `KET-QUA-THAN-CAGE.md`, `ASSET.md`; push nhánh `claude/nam-body-mesh-rebuild-dda859` (không push `main`).
