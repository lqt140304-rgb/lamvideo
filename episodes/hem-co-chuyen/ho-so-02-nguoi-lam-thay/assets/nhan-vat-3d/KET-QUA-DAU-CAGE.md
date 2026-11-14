# Đầu Nam dựng bằng control cage — kết quả (14/11/2026)

Nguồn: [dung_dau_cage_nam.py](dung_dau_cage_nam.py) (dùng lại `dung_dau_nam.py`, `dung_than_nam.py`, `dung_than_cage_nam.py`, không sửa ba file đó).

**Trạng thái:**
- **Hình khối:** đạt ở mức hình khối tĩnh và topology.
- **Biến dạng:** mới **thử** bằng 4 shape key, chưa phải rig mặt.
- **Tóc:** giữ nguyên tóc v4.
- **Chưa làm:** 24 nhóm cảm xúc, răng.

## Lệnh chạy
```
D:/blender/blender.exe -b --factory-startup --python dung_dau_cage_nam.py -- --check --render <DIR tuyệt đối> --clip <DIR>/clip --mau ../thiet-ke/thu-3d/mau-3d-xoay.webp --blend <DIR>/Nam_dau_cage.blend --samples 24
D:/blender/blender.exe -b --factory-startup --python dat_nam_vao_phong.py -- --phong-dir ../boi-canh-3d --nam-blend <DIR>/Nam_dau_cage.blend --out <DIR>/trong_phong.png --samples 48 --width 1400
```
- Dựng xong cả đầu và thân mất khoảng 30 giây.
- `--check` in PASS/FAIL từng mục và thoát mã 1 nếu còn FAIL.
- Ảnh và `.blend` để ở `render-dau/`, không commit.

## Trong file Blender
- **`00_Dau_Cu`** (ẩn render, không nạp vào phòng): đầu cũ giữ để đối chiếu.
  - `03_Head_And_Face`: các bộ phận cũ mang hậu tố `_cu`, gồm Head_Base, Pupil, Eyeline, Eyebrow, Mole, Mouth_line, Ear.
  - `Nam_Dau_Than_cu`: bản lắp ráp đã duyệt ở 8a9d771.
- **`Nam_Dau/03_Dau_Cage`:**
  - `Nam_Dau_Cage`: nửa cage, Mirror + Subdivision (xem mức 1, render mức 2), có shape key.
  - `Mat_Goc.L/R`: empty mang tỉ lệ nhãn cầu.
  - `Nhan_Cau.L/R`: nhãn cầu riêng, con ngươi là chỏm trên cầu. Xoay object này để đổi hướng nhìn.
  - `Eyebrow.L/R` và `Mole`: dựng lại trên mặt mới, mày được đẩy ra để bám da.
  - `Ear.L/R`: bản sao tai cũ, Shrinkwrap dán vào đầu mới.
- **`Nam_Dau/04_Hair`:** tóc v4 giữ nguyên.
- **`02_Body_Base`:**
  - `Nam_Dau_Than`: một lưới chung gồm cage đầu (đổi sang toạ độ thế giới) và cage thân đã duyệt, Mirror + Subdivision 2, mang cùng 4 shape key. Vertex group `Ham` chứa trọng số hàm, để dành cho rig sau.

## Cage và topology
- **Nửa cage:** 242 đỉnh, 216 quad, 1 tam giác. Tam giác nằm ở đáy túi miệng, khuất trong đầu. Đường giữa có 44 đỉnh, x = 0 tuyệt đối.
- **Bảng vòng `RINGS`:** 13 vòng × 9 cột, cộng nắp đỉnh 2×4.
  - Vòng không ghi số riêng lấy đúng tiết diện đầu cũ, cộng gò gốc tai cũ, để tóc vẫn ôm sọ.
  - Vòng má, miệng, cằm rộng thêm bằng `sx`/`sf`. Hai vòng dưới hàm là superellipse tự do.
  - Chỉnh rộng ở `sx`, chỉnh sâu ở `sf`/`sb`, sửa riêng từng đỉnh ở `OVERRIDE`.
- **Mắt:**
  - Ô 3×3 bỏ tâm, cho vòng biên 8 đỉnh bán kính 5,2 cm, đúng cột lưới.
  - Bên trong có 8 vòng: vành mí → vòm mí → mép trên nét mí → khe mắt → mặt trong mí → mặt trong mí sát cầu → hốc ôm xích đạo cầu → đáy hốc, đóng kín bằng 3 quad.
  - Nét mực (viền dưới tròng trắng, nét mí trên) là vật liệu gán theo dải mặt của lưới, nên đi theo khi chớp mắt. Không còn dùng ống Eyeline rời hay mặt nạ tô trên da.
- **Mũi:** là chỗ nhô của chính lưới mặt (`NOSE_DISP`, đỉnh mũi ở hàng 5), không gắn quả cầu, không có vòng riêng.
- **Miệng:**
  - Ô 2×2 qua đường giữa, nửa vòng 7 đỉnh.
  - Bên trong: vòng môi ngoài → mép môi → khe môi thật (hở 1,2 mm khi trung tính) → mặt trong môi → túi miệng → đáy túi kín.
  - Đáy túi tô màu lưỡi. Chưa có răng.
- **Cổ:**
  - Vòng dưới cùng của đầu chính là vòng `co` (7 đỉnh nửa) của cage thân, nên đầu và thân là một lưới liền: không bridge, không có hai ống cổ chồng nhau.
  - Từ 9 cột của đầu xuống 7 cột của cổ, giảm bằng một mẫu quad 3→1 ở hông cổ.
- **Bù co Subdivision (`fit_cage`):** chỉ áp cho đỉnh lưới thường và nắp; sai lệch còn 1,3 mm. Vòng biên mắt, miệng và các vòng mí, môi để đúng vị trí thiết kế; bù co ở đó làm gấp nếp.

## Mốc đầu cũ (hệ đầu gốc → thế giới, m) — giữ nguyên
| Mốc | Đầu gốc | Thế giới |
|---|---|---|
| Đỉnh sọ | z 1,465 | 1,447 |
| Tâm mắt trái | (0,0746; −0,171; 1,227) | (0,084; −0,193; 1,179) |
| Chân mày giữa | z 1,301 | 1,262 |
| Đỉnh mũi | (0; −0,239; 1,175) | (0; −0,270; 1,120) |
| Miệng | (0; −0,215; 1,099) | (0; −0,243; 1,034) |
| Cằm (thấp nhất giữa trước) | (0; −0,104; 1,029) | z 0,955 |
| Tâm tai trái | (0,194; 0,016; 1,199) | (0,219; 0,018; 1,147) |
| Vòng nối cổ | z 1,000 | 0,922 |

- So với ảnh mẫu theo tỉ lệ trên mặt (mắt → cằm), các mốc mắt, mày, mũi, miệng khớp tỉ lệ nên tôi giữ nguyên.
- Tai mẫu thấp hơn khoảng 1 cm và lùi sau hơn. Tôi giữ vị trí tai cũ vì tóc v4 dựng quanh tai; điểm này cần chủ repo xem.
- Không đổi tỉ lệ đầu–thân, `HEAD_K` vẫn 1,13. Chiều cao 1,6009 m như bản thân cage.

## Kiểm tra (`--check`, lần chạy cuối: TẤT CẢ PASS)
- **Lưới lắp ráp sau Subdivision 2** (11 802 đỉnh): 0 cạnh hở, 0 cạnh có hơn 2 mặt, thể tích dương, 0 cặp mặt tự giao.
- **Tự giao vùng đầu–cổ:** 0 ở cả 5 tư thế (trung tính, nhắm, mở to, mở hàm, cười).
- **Sọ mới so với sọ cũ ở vùng có tóc:** lệch −3,0 … +0,9 mm, trung bình −0,9 mm.
- **Mắt:**
  - Không đỉnh da nào lọt vào nhãn cầu ở cả 3 tư thế mắt.
  - Nhắm mắt: 0/49 tia còn thấy nhãn cầu.
  - Mở to và trung tính: 0 tia lọt vào hốc hay vào trong đầu (bắn từ 4 hướng).
  - Hướng nhìn ±18° ngang, −10° xuống: con ngươi vẫn nằm trên cầu và vẫn nhìn thấy.
- **Miệng:** khe trung tính thấy khoang. Khi mở hàm, 128/182 tia thấy khoang, 0 tia xuyên ra sau đầu.
- **Hàm:** mở 10°, cằm hạ 14 mm, bề ngang hàm giữ nguyên, má lùi 2 mm, cạnh ở khoé giãn tối đa 3,1×.
- **Phụ kiện:**
  - Mày chạm da (lún 0,0 mm, cách da 0,3 mm).
  - Gốc tai cách da 2,15 mm (Shrinkwrap offset 2 mm, tai cũ 2,3 mm).
  - Nốt ruồi ở bên phải nhân vật (−X).
- **Shape key:** cage đầu 242 đỉnh, bản lắp ráp 396 đỉnh, số đỉnh không đổi.

## Ảnh bàn giao (`render-dau/giao/`)
- `cu_*` và `moi_*`: cùng camera, cùng tỉ lệ; đầu trần (`tran`) và có tóc (`toc`); trước, nghiêng, sau, 3/4. `moi_datset_*` là bản đất sét.
- `cage_day_*` (cage dây) và `cage_min_*` (Subdivision).
- Cận cảnh:
  - `can_mat_*`, `can_mieng_*`, `can_co_*`.
  - `cu_can_*` / `moi_can_*`: cũ và mới cùng góc.
- Shape key, góc trước và nghiêng:
  - `key_<tên>_*`.
  - `nhin_*`: hướng nhìn.
- `so_mau_truoc` / `so_mau_nghieng`: chồng viền lên ảnh mẫu (xanh là cũ, đỏ là mới; tỉ lệ theo chiều cao toàn thân, không kéo giãn).
- `clip/thu_bieu_cam.mp4`: nhắm mắt, mở hàm, cười nhẹ, liếc trái phải. Ghép góc trước với góc 3/4.
- `trong_phong.png`: Nam trong phòng trọ có sẵn.

## Đạt hình khối (đã kiểm)
- Sọ giữ sát sọ cũ nên tóc vẫn ôm.
- Má và hàm đầy hơn, phần dưới mặt bo vuông hơn bản cũ (mặt trước rộng thêm 6–19 mm ở z 0,97–1,07).
- Cằm tù, cổ ngắn liền thân.
- Mũi nhỏ liền mặt.
- Mắt tròn có vòm mí da và nét mí đậm.
- Miệng khép là khe thật.

## Đã thử biến dạng (chỉ shape key, chưa rig)
- `Nham_Mat` và `Mo_Mat`: mí trên xoay quanh trục ngang của nhãn cầu (trong không gian elip chuẩn hoá), kín và không xuyên cầu.
- `Mo_Ham`: xoay 10° quanh trục khớp hàm, theo vertex group `Ham`.
- `Cuoi_Nhe`: khoé miệng lên, ra, lùi sau; má đầy nhẹ.
- Hướng nhìn: xoay `Nhan_Cau.L/R`.

## Còn chưa đạt / cần chủ repo xem
1. **Nhãn cầu thu đều ×0,824** để vừa dưới mí sau Subdivision. Bán kính ngang còn 49,4 mm, vẫn lớn hơn khe mắt 48,7 mm. Viền dưới tròng trắng có cạnh hơi gãy, do vòng mắt chỉ có 8 đỉnh; muốn tròn hơn thì tăng lên 12 đỉnh, việc này cần đổi lưới quanh mắt.
2. **Vùng quanh mắt đã làm phẳng** (`EYE_FLAT = 1`). Mặt đầu cũ quanh mắt là yên ngựa: má và trán cao hơn 7 mm, thái dương thấp hơn 8 mm trong bán kính 5 cm, nên cầu mắt lồi không thể ôm. Vòng biên mắt giờ nằm trên mặt phẳng khớp nhất, khác đầu cũ tới ±8 mm ở mép mắt.
3. **Mắt trông to và rõ hơn đầu cũ:** vòm mí là khối thật, không còn là mặt nạ tô.
4. **Tai mẫu thấp hơn khoảng 1 cm:** chưa dời, xem phần mốc.
5. **Chưa có răng.** Kiểm "răng không xuyên môi" chưa áp dụng.
6. **Chưa rig mặt;** `rig_nam.py` cũ không khớp lưới mới. Shape key chỉ là phép thử.
