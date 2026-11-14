# Nối tay/chân liền da bằng cage + rig thử cục bộ — kế hoạch thực hiện

> **Cho agent thực hiện:** dùng superpowers:executing-plans. Các bước dùng ô `- [ ]`.

**Mục tiêu:** bàn tay/bàn chân thành phần của cage thân (một lưới liền, tứ giác ở vùng nối), hình bám bản đã duyệt; rig thử cục bộ kiểm biến dạng cổ tay/mắt cá/bàn tay.

**Kiến trúc:** `dung_cage_tay_chan.py` dựng cage thân bằng các hàm của `dung_than_cage_nam.py` (không sửa file đó), bỏ nắp cuối ống tay/chân, nối cage tay/chân vào vòng 8 đỉnh, lắp ráp (Subdivision 2 như thân), rồi ép hình bám bàn tay/chân đích (`gan_tay_chan_nam.place_hand/place_foot`). `rig_thu_tay_chan.py` mở kết quả, dựng xương cục bộ, tư thế, đo, ảnh, clip.

**Công nghệ:** Blender bpy 5.x (`$S/bpyv`), numpy, ffmpeg (clip), PIL.

**Thiết kế:** [THIET-KE-NOI-TAY-CHAN.md](THIET-KE-NOI-TAY-CHAN.md)

## Ràng buộc chung
- Không sửa `dung_than_cage_nam.py`; không làm dép, rig toàn thân; không đẩy main.
- Vùng nối (cổ tay ±4 cm dọc trục cẳng tay, mắt cá z 0,04–0,16): chỉ tứ giác. Lưới lắp ráp: 1 mảnh, 0 cạnh hở, 0 cạnh > 2 mặt.
- Thân ngoài vùng tay/chân (trên khuỷu, trên gối) không đổi vị trí đỉnh so với bản cage gốc (≤ 0,1 mm); chiều cao 1,6004 ± 0,001 m.
- Không đổi số đỉnh vòng trong vùng gập cổ tay/mắt cá; đổi mật độ chỉ ở lòng tay (u ≥ 0,055) và mũi bàn chân.
- Không làm mượt toàn bộ, không tăng chồng lấn để che bậc; không đổi shading để che lỗi.
- Ảnh/clip/.blend ở `render-than/noi/` (không commit). Bản cũ `gan_tay_chan_nam.py` giữ nguyên để đối chiếu.

## Điểm cần soi
1. Ép hình kéo đỉnh vùng kẽ ngón về nhầm ngón bên cạnh → kiểm mỗi đỉnh vùng ngón cách bề mặt đích ≤ 3 mm và không có mặt tự giao trong vùng tay/chân.
2. Bậc mới sinh ra ở biên vùng ép (nơi trọng số ép về 0) → đo góc nhị diện lớn nhất vùng cổ tay/mắt cá ở tư thế nghỉ ≤ 35°.
3. Mặt pháp tuyến lật sau khi nối vòng → thể tích có hướng dương, 0 mặt quay ngược so với láng giềng.
4. Gập cổ tay 45° làm xẹp tiết diện → diện tích tiết diện tại khớp ≥ 75% lúc nghỉ.
5. Nửa phải (Mirror) lệch so với nửa trái → so gương đỉnh vùng tay/chân ≤ 0,1 mm.

---

### Task 1: Cage tay/chân nối vào cage thân + kiểm topology

**Tệp:** tạo `dung_cage_tay_chan.py`.

**Giao diện:** tạo ra `build_cage_full(coll) -> Object` (nửa cage có tay/chân, Mirror + Subsurf như `C.build_cage`), `assemble(sc) -> (asm, info)` (lắp ráp đầu+thân, chưa ép hình), `check_topology(asm, base_asm) -> dict`.

- [ ] Viết `check_topology` (1 mảnh, 0 cạnh hở, 0 cạnh > 2 mặt, chỉ tứ giác vùng nối, thân ngoài chi không đổi, chiều cao, thể tích dương). Thêm mục "lưới có bàn tay/bàn chân" (đếm đỉnh vùng ngón tay/ngón chân > 0). Chạy trên bản lắp ráp cũ (`C.assemble_cage`: thân có nắp, tay/chân là vật riêng) → FAIL mục này.
- [ ] Cage tay: bỏ nắp ống cẳng tay; vòng 8 đỉnh tiếp qua cổ tay (tròn → dẹt) tới u 0,055; chuyển 1→3 ở một cạnh mu và một cạnh lòng → vòng 12; mặt đầu lòng tay lưới 4×2 → 4 ngón vòng 6 đỉnh (gốc + 3 khớp + nắp 1×2); ngón cái từ ô 2×2 mặt bên phía trước giữa các vòng u 0,01–0,05 → vòng 8 (3 vòng khớp + nắp 2×2). Vị trí theo khung bàn tay của `dung_tay_nam` (biến đổi như `gan_tay_chan_nam.place_hand`).
- [ ] Cage chân: bỏ nắp ống chân; thân bàn chân là ống dọc y, vòng 12 đỉnh (mặt trên 5 cạnh, đáy 5, hai bên 1); nắp gót 5×1; ô 2×2 mặt trên dưới mắt cá nối vòng 8 của ống chân; nắp trước 5×1 → 5 ngón vòng 4 (gốc, giữa, đầu + nắp). Vị trí theo `dung_chan_nam` (PROFILE, TOES).
- [ ] Chạy `--check` → mọi mục topology PASS; ảnh wireframe cage + lưới chia mịn.
- [ ] Commit.

### Task 2: Ép hình bám bàn tay/chân đã duyệt + ảnh trước/sau

**Giao diện:** `fit_shape(asm, info) -> dict` (sai lệch); `check_shape(asm, info) -> dict`.

- [ ] Viết `check_shape`: khoảng cách đỉnh vùng tay/chân tới bề mặt đích trung bình ≤ 1,5 mm, max ≤ 4 mm; góc nhị diện lớn nhất vùng nối ≤ 35°; 0 mặt tự giao vùng tay/chân; gương ≤ 0,1 mm; chiều cao. Chạy trước khi ép → FAIL (sai lệch lớn).
- [ ] Ép: trọng số theo u (tay: 0 tại u ≤ 0, 1 tại u ≥ 0,03) và z (chân: 1 dưới z 0,075, 0 trên z 0,105); 3 vòng (gần nhất trên bề mặt → Taubin nhẹ chỉ vùng ép).
- [ ] `--check` PASS; ảnh clay/wireframe/ánh sáng xiên cận cổ tay, mắt cá + toàn thân, cùng camera với bản cũ (538aef4) để so trước/sau.
- [ ] Commit.

### Task 3: Rig thử cục bộ + tư thế + đo + clip

**Tệp:** tạo `rig_thu_tay_chan.py`.

**Giao diện:** `build_test_rig(asm) -> arm`; `POSES` (tên → góc); `measure(asm, arm, pose) -> dict` (giãn/co, diện tích tiết diện khớp, góc nhị diện max, tự giao).

- [ ] Viết `measure` + ngưỡng: giãn ≤ 2× và co ≥ 0,5× ở vùng khớp, tiết diện ≥ 75%, nhị diện ≤ 60° (nếp mềm) ở tư thế 30°/15–20°/gập bàn chân; 45° báo số, không bắt đạt.
- [ ] Xương: `khoa` (thân), `cang_tay` (khuỷu→cổ tay), `ban_tay`, ngón 3 đốt, `cang_chan` (gối→mắt cá), `ban_chan` (mắt cá→gốc ngón), `ngon_chan`. Pivot: cổ tay = tâm vòng cổ tay; mắt cá = tâm ống chân tại z ≈ 0,10; gốc ngón chân = đường gập. Weights: bone heat trên chi, thân trên khuỷu/gối khoá 100% `khoa`.
- [ ] Tư thế: cổ tay gập trước/sau 30°, 45°; nghiêng ±18°; bàn chân gập lên 20°, xuống 30°; nhấc gót (tựa mũi bàn chân); nắm tay; cầm cốc.
- [ ] Ảnh mỗi tư thế (clay + wireframe cận), bản đồ màu giãn/co trên lưới; clip trung tính → từng tư thế (ffmpeg mp4).
- [ ] Sửa topology/weights theo kết quả; corrective shape key chỉ khi còn cần.
- [ ] Commit.

### Task 4: Bàn tay — nắm (ngón út), cầm cốc, vị trí giãn

- [ ] Nắm: ảnh cận ngón út + khoảng cách; chỉnh để ngón út khép theo hình nắm thật, không xuyên.
- [ ] Cầm cốc: 0 xuyên, các ngón chạm; ảnh đánh dấu vị trí cạnh giãn > 2× và cận kẽ ngón.
- [ ] Commit.

### Task 5: Bàn giao

- [ ] `KET-QUA-NOI-TAY-CHAN.md`: cấu trúc chỗ nối trước/sau, số đo, ảnh/clip, lỗi phân theo geometry / weights / điều khiển khớp; cập nhật `ASSET.md`.
- [ ] Commit nhánh làm việc (không đẩy main).
