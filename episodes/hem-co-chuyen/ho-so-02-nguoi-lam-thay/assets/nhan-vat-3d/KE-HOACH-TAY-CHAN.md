# Bàn tay & bàn chân riêng cho Nam — kế hoạch thực hiện

> **Cho agent thực hiện:** dùng superpowers:executing-plans (hoặc subagent-driven-development). Các bước dùng ô `- [ ]` để đánh dấu.

**Mục tiêu:** dựng một bàn tay và một bàn chân riêng, rig thử, kiểm nhiều góc và tư thế; sau đó gắn vào Nam theo cách B (vật riêng đi theo xương) và xử lý chỗ nối.

**Kiến trúc:** mỗi bộ phận là một script bpy độc lập, dựng lưới từ khối metaball/skin bo tròn → voxel remesh → rig thử riêng → render bảng kiểm. Bước gắn là script thứ ba: đọc `Nam_rig.blend`, cắt tay/chân cũ, đặt vật mới theo xương, chuyển trọng số và pháp tuyến ở chỗ nối.

**Công nghệ:** Blender bpy 5.x (venv `$S/bpyv`), numpy, Cycles CPU, PIL ghép bảng.

**Thiết kế:** [THIET-KE-TAY-CHAN.md](THIET-KE-TAY-CHAN.md)

## Ràng buộc chung
- Lật gương: dựng bên trái (+X), bản phải lật X; tên xương/vật hậu tố `.L`/`.R` như rig hiện có.
- Ngón tay 3 đốt; ngón cái 3 đốt (gốc + 2). Không móng, gân, nếp khớp.
- Đơn vị mét, cùng tỉ lệ Nam: cổ tay ≈ (±0.236, −0.008, 0.545), bàn tay hướng xuống tới ≈ z 0.44; mắt cá ≈ (±0.0925, 0.004, 0.118), đế chân z = 0. Kích thước chính xác đo từ `Nam_Dau_Than` lúc chạy, không chép tay.
- Vật liệu da dùng lại material `Da` của Nam (không tạo màu mới).
- Không commit `.blend`, ảnh render; ảnh ở `render-than/tay/`, `render-than/chan/`, `render-than/noi/`.
- Mỗi task dừng để chủ repo duyệt ảnh trước task sau.

## Điểm cần soi (chưa có kiểm tự động phủ hết)
1. Nắm tay: đầu ngón chạm lòng tay chứ không xuyên vào hoặc lơ lửng → đo khoảng cách đầu ngón tới mặt lòng tay ≤ 3 mm, không âm sâu quá 2 mm.
2. Ngón cái khi nắm nằm ngoài, đè lên đốt giữa ngón trỏ/giữa, không xuyên → kiểm khoảng cách ngón cái tới ngón trỏ ≥ 0.
3. Cầm cốc: các ngón ôm mặt cốc, không xuyên cốc → khoảng cách mặt trong ngón tới trục cốc ≥ bán kính cốc − 1 mm.
4. Nhấc gót: ngón chân vẫn tiếp sàn, gót rời sàn, không gãy gập ở khớp ngón → điểm thấp nhất vùng ngón z ≤ 2 mm.
5. Chỗ nối ở cổ tay/mắt cá khi gập cổ tay/bàn chân 45°: không hở khe, không thấy viền sáng tối → đo khe hở hình học = 0 (đoạn cổ luôn nằm trong ống tay/chân) và soi ảnh cận.

---

### Task 1: Bàn tay riêng + rig thử + bảng kiểm

**Tệp:** tạo `dung_tay_nam.py`.

**Giao diện:**
- Tạo ra: `build_hand(side='L') -> (mesh_obj, arm_obj)`; xương `hand`, `thumb1..3`, `index1..3`, `middle1..3`, `ring1..3`, `pinky1..3`; thuộc tính `fist`, `grip` (0–1) trên xương `hand` lái các đốt; `HAND_POSES = {'tha_long','nam_tay','cam_coc','xoe'}`; `check_hand(mesh, arm) -> dict` in PASS/FAIL.
- CLI: `--blend OUT.blend --render DIR --samples N --check`.

- [ ] **Bước 1:** viết `check_hand` trước với các kiểm: (a) cạnh giãn > 2× (bỏ cạnh < 1,5 mm) bằng 0 ở cả 4 tư thế; (b) điểm 1–3 của "Điểm cần soi"; (c) tay phải là gương tay trái (sai số đỉnh ≤ 0,1 mm). Chạy với lưới giả (khối hộp) → phải FAIL.
- [ ] **Bước 2:** dựng hình: lòng tay hộp bo tròn dẹt thu về cổ tay; khối bốn ngón chung rồi chia 4 ngón ngắn đầy đầu tròn (độ dài so với lòng tay theo phác thảo: ngón giữa ≈ 0,8 chiều dài lòng tay); ngón cái có khối gốc phồng nối mềm cạnh lòng tay, lệch ra trước mặt lòng tay ~30°; đoạn cổ tay hình trụ dài 3 cm để lồng vào cẳng tay; voxel remesh + smooth.
- [ ] **Bước 3:** rig thử, trọng số bone heat + làm mượt kẽ ngón như `rig_nam.py`; đo trục cuộn ngón bằng thực nghiệm (bài học: trục Z cục bộ, dấu theo bên).
- [ ] **Bước 4:** chạy `--check` → mọi mục PASS.
- [ ] **Bước 5:** render bảng: 4 tư thế × 4 góc (lòng tay, mu tay, nghiêng, chéo), có cốc thử; ghép `render-than/tay/bang.png`; tự soi rồi gửi chủ repo.
- [ ] **Bước 6:** commit `dung_tay_nam.py` lên nhánh làm việc; dừng chờ duyệt.

### Task 2: Bàn chân riêng + rig thử + bảng kiểm

**Tệp:** tạo `dung_chan_nam.py`.

**Giao diện:**
- Tạo ra: `build_foot(side='L') -> (mesh_obj, arm_obj)`; xương `foot`, `toe` (cả cụm ngón gập chung); `FOOT_POSES = {'dung','nhac_got'}`; `check_foot(mesh, arm) -> dict`.
- CLI giống Task 1.

- [ ] **Bước 1:** viết `check_foot`: (a) giãn cạnh như Task 1; (b) tư thế đứng: đế phẳng, ≥ 60% diện tích đế trong 2 mm trên sàn; (c) điểm 4 "Điểm cần soi"; (d) gương L/R. Chạy với lưới giả → FAIL.
- [ ] **Bước 2:** dựng khối nêm: gót nhỏ, mũi rộng, mu dốc lên cổ chân; ngón ngắn chia nông, ngón cái rõ phía trong; đoạn cổ chân trụ dài 3 cm để lồng vào cẳng chân.
- [ ] **Bước 3:** rig thử 2 xương, trọng số; chạy `--check` → PASS.
- [ ] **Bước 4:** render bảng: 2 tư thế × 3 góc (trên, bên, chéo) + nhìn dưới đế; ghép `render-than/chan/bang.png`; soi rồi gửi chủ repo.
- [ ] **Bước 5:** commit `dung_chan_nam.py`; dừng chờ duyệt.

### Task 3: Gắn vào Nam và sửa nếp nối

**Tệp:** tạo `gan_tay_chan_nam.py`; sửa `rig_nam.py` (thêm xương đốt 3 cho ngón, driver `fist`/`grip` khớp Task 1).

**Giao diện:**
- Dùng: `build_hand`, `build_foot`, tư thế và driver ở Task 1–2.
- Tạo ra: trong `Nam_rig.blend` có `Nam_Tay.L/R`, `Nam_Chan.L/R` có modifier Armature trỏ `Nam_Rig`; `check_seams(arm) -> dict`.

- [ ] **Bước 1:** viết `check_seams`: ở các tư thế `nghi`, `nam_tay_chat`, `khuyu_gap`, `buoc_chan`, `ngoi`, `gap_co_tay_45` (mới), `gap_ban_chan_45` (mới): khe hở = 0 (mọi đỉnh của vòng mép thân ở cổ tay/mắt cá nằm trong khối tay/chân hoặc ngược lại), giãn cạnh như trước. Chạy trên `Nam_rig.blend` hiện tại → các tư thế mới chưa có nên FAIL.
- [ ] **Bước 2:** cắt lưới thân phía ngoài cổ tay (dọc xương `hand`) và dưới mắt cá; đóng mép bằng nắp lõm vào trong.
- [ ] **Bước 3:** đặt tay/chân mới theo đầu xương `hand`/`foot`, co giãn cho bán kính đoạn cổ khớp bán kính ống thân tại chỗ cắt (đo lúc chạy); gán trọng số: phần lồng = trộn `forearm`/`hand` (hoặc `shin`/`foot`) như vùng cũ, phần ngoài từ rig thử.
- [ ] **Bước 4:** sửa nếp nối: material `Da` chung; modifier Data Transfer pháp tuyến từ thân sang vòng cổ tay/mắt cá (vùng 1,5 cm) để không thấy viền.
- [ ] **Bước 5:** chạy `check_seams` → PASS; chạy lại `stretch_report` cho toàn bộ tư thế, không tư thế nào tệ hơn lần trước.
- [ ] **Bước 6:** render cận chỗ nối (4 góc × các tư thế trên) và dựng lại `pose_test.png`; soi, gửi chủ repo.
- [ ] **Bước 7:** commit `gan_tay_chan_nam.py`, `rig_nam.py`; dừng chờ duyệt.

### Task 4: Dép (để sau, chưa làm trong vòng này)
Dép dựng bao theo chân Task 2 khi chủ repo yêu cầu.
