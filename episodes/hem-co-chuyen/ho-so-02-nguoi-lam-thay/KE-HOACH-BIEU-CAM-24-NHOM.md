# Công cụ biểu cảm mở rộng (hướng tới 24 nhóm × 2 mức) — Kế hoạch thực hiện

> **Cho người thực hiện:** làm lần lượt từng Task, tick `- [ ]` khi xong. Theo CLAUDE.md: phiên chính dựng lượt đầu; Sonnet sửa lỗi đã rõ nguyên nhân; Haiku tìm/kiểm/push. Kết quả agent chỉ là báo cáo; phiên chính chạy lại lệnh kiểm trước khi nói "xong".

**Mục tiêu:** bộ công cụ cho đầu Nam diễn đạt được mọi biểu cảm trong 3 bảng chuẩn đích: hướng nhìn, nhắm mắt, các dạng miệng có răng và lưỡi, nước mắt, mồ hôi, má ửng, nhăn mũi, tổ hợp biểu cảm; chứng minh bằng 9 nhóm mẫu và bảng so sánh với ảnh mẫu.

**Kiến trúc:** giữ kỹ thuật đã chạy: shape key từ điểm neo (`dinh_nghia.json`), vật rời gắn vào mặt, mặt nạ theo thuộc tính đỉnh. Thêm **kênh hiệu ứng** (thuộc tính tuỳ chỉnh trên `Head_Base`, do driver tính từ giá trị các key) để shader và vật phụ đọc; mỗi định nghĩa khai báo trọng số kênh trong `hieu_ung`. Tổ hợp biểu cảm là hàm đặt giá trị nhiều key nguồn, không dùng driver lên giá trị key.

**Công nghệ:** Blender 5.0.1 `bpy` (Python 3.11, `/tmp/bpyenv`), NumPy, Pillow.

**Thiết kế:** [THIET-KE-BIEU-CAM-24-NHOM.md](THIET-KE-BIEU-CAM-24-NHOM.md). Tiếp nối [KE-HOACH-BIEU-CAM.md](KE-HOACH-BIEU-CAM.md) (đã làm; 26 test hiện có phải luôn xanh).

## Ràng buộc chung

- Mã trong `assets/nhan-vat-3d/bieu_cam/`; không sửa `dung_dau_nam.py`. Đơn vị mét; nhân vật quay mặt −Y, bên trái nhân vật là +X (`.L`).
- Chạy test: `/tmp/bpyenv/bin/python assets/nhan-vat-3d/bieu_cam/kiem_thu/chay.py [lọc]` (đường dẫn từ thư mục tập). Mốc "xong" chỉ tính khi lệnh chạy thật và in `N/N PASS`.
- Mặt nghỉ (mọi key và kênh = 0) trùng bản đã duyệt: kiểm băm đỉnh, nốt ruồi, và hiệu ứng ẩn hẳn.
- Mọi công cụ qua kiểm ở 5 góc (`kiem.GOCS`), giá trị 1,0 và 0,5, và khi hai key bật cùng lúc. Không nới ngưỡng `NGUONG_BAM = 0.001`, `NGUONG_RUOI = 0.003`, `NGUONG_HO = 0.001`.
- Tên key mới theo bảng, hai mức: `<nhom>_nhe`, `<nhom>_ro`. Hướng nhìn là điều khiển độc lập `m_nhin_x`, `m_nhin_y` ∈ [−1, 1].
- Chỉ ảnh tĩnh nhỏ. Không render video. Không commit `.blend`, ảnh nặng.
- Tối thiểu 2 mức mỗi nhóm; "Rõ" trong bảng = mức 2 của hệ thống.

## Cần soi kỹ (ngoài các test từng Task)

1. Nhắm mắt + nước mắt + hướng nhìn bật cùng lúc: con ngươi vẫn chìm dưới da khi nhắm dù có lệch hướng nhìn. → Task 3.
2. Hướng nhìn ở cực trị khi mí đang sụp một phần: con ngươi không đè lên mí. → Task 2.
3. Hiệu ứng ở giá trị 0 phải vô hình ở cả 5 góc (nước mắt, mồ hôi, má ửng, răng, lưỡi). → Task 5, 6.
4. Áp bộ công cụ hai lần: không nhân đôi driver, modifier, thuộc tính. → Task 1, 2.
5. Driver tính đúng sau khi đặt giá trị key trong chế độ không giao diện và khi đổi khung hình. → Task 1.

---

## Task 1: Kênh hiệu ứng và điểm neo mới

**Files:**
- Create: `bieu_cam/kenh.py`, `bieu_cam/kiem_thu/test_kenh.py`
- Modify: `bieu_cam/chung.py` (`lay_neo`), `bieu_cam/tao_key.py` (`ap_dung` nhận `hieu_ung` và `gom`)

**Interfaces:**
- Produces: `kenh.KENH: list[str]` = `['nham','nhin_x','nhin_y','rang','luoi','nuoc_mat','mo_hoi','ma']`; `kenh.tao_kenh(dau, dinh_nghia: list[dict] | None = None) -> None` (tạo thuộc tính `head['k_<kenh>']` do driver = `head['m_<kenh>']` + Σ trọng số × giá trị key; đồng thời tạo `head['m_<kenh>']` = 0 nếu chưa có; gọi lại không nhân đôi driver); `kenh.doc(dau, ten: str) -> float` (đọc `k_<ten>` sau cập nhật). Định nghĩa JSON thêm trường tuỳ chọn `"hieu_ung": {kenh: trọng_số}` và `"gom": {key_khác: hệ_số}` (cộng độ dời neo của key khác lúc tạo key, tĩnh, không driver).
- Neo mới trong `chung.lay_neo`: `eye_in.L/R`, `eye_out.L/R` (khoé trong/ngoài mắt, cùng độ cao `eye_c`), `cheek.L/R`, `nose_bridge`, `nose_wing.L/R`, `temple.L/R`.

- [ ] **Step 1: Viết test hỏng** `test_kenh_tinh_tu_key()`: định nghĩa tạm `{"ten":"t","hieu_ung":{"rang":0.5,"ma":1.0},...}`; đặt `key t = 0.6`; assert `kenh.doc(d,'rang') == 0.3 ± 1e-4`, `doc(d,'ma') == 0.6`; đặt `head['m_rang'] = 0.2` → `0.5`. `test_neo_moi_doi_xung()`: đủ tên neo mới; `eye_in.L.x < eye_out.L.x`, `cheek.L.z < eye_c.L.z`, `nose_bridge.z > nose_wing.L.z`, `temple.L.z > eye_c.L.z`. `test_gom_cong_do_doi()`: key A gom key B hệ số 1 → độ dời neo của A tại neo của B bằng của B ± 0,5 mm. `test_tao_kenh_hai_lan()`: gọi hai lần, số driver trên `head` không đổi. `test_kenh_theo_khung_hinh()`: keyframe key ở khung 1 = 0, khung 10 = 1, đặt `frame_set(5)`, kênh ≈ 0,5 ± 0,1.
- [ ] **Step 2: Chạy** `... chay.py test_kenh` → FAIL (chưa có `kenh`).
- [ ] **Step 3: Cài.** Driver kiểu `SCRIPTED` dùng biểu thức đơn giản (cộng và nhân biến) để chạy không cần bật script; biến `SINGLE_PROP` tới `head.data.shape_keys` (đường dẫn `key_blocks["<ten>"].value`) và tới `head` (`["m_<kenh>"]`). Neo mới suy từ `EYE_FRAMES`, `FACE`, `S.front`.
- [ ] **Step 4: Chạy lại** (cả bộ: `chay.py`) → mọi test PASS (26 cũ + mới).
- [ ] **Step 5: Commit** `bieu_cam/` theo đường dẫn đầy đủ.

## Task 2: Hướng nhìn

**Files:**
- Create: `bieu_cam/nhin.py`, `bieu_cam/kiem_thu/test_nhin.py`
- Modify: `bieu_cam/kiem.py` (thêm `kiem_nhin`), `bieu_cam/ap_dung_bo.py`

**Interfaces:**
- Consumes: `kenh.tao_kenh`, `gan.gan_chi_tiet`.
- Produces: `nhin.gan_nhin(dau) -> None`: trên `Pupil.L/R` đặt chuỗi modifier sau `Bam_mat`: `Displace` (trục X, không gian toàn cục) và `Displace` (trục Z) có `strength` do driver = `k_nhin_x × NHIN_X`, `k_nhin_y × NHIN_Z`, rồi `Shrinkwrap` dán con ngươi lại lên da (`offset` mặc định 0,0003; Task 3 sẽ điều khiển). Hằng số `NHIN_X = 0.020`, `NHIN_Z_LEN = 0.010`, `NHIN_Z_XUONG = 0.018` (m). `kiem.kiem_nhin(dau) -> list[Loi]`: con ngươi nằm trong khe mắt (dưới `lid_up`, trên `lid_low`) và trong elip tròng trắng; không đè viền mắt; bám da như lúc nghỉ.

- [ ] **Step 1: Viết test hỏng.** `test_nhin_di_chuyen()`: `m_nhin_x = 1` → tâm `Pupil.L` dời +0,020 ± 0,0005 theo X, `Pupil.R` cùng chiều. `test_nhin_trong_khe_mat()`: lưới `(x, y) ∈ {-1,0,1}²` (y > 0 chỉ khi key `hoang_mang` = 1 để mở mí): `kiem.kiem_nhin == []` và `kiem_bam == []`. `test_nhin_cuc_tri_mi_sup()`: `kiet_suc` = 1 với `m_nhin_x = ±1`, `m_nhin_y = −1`: `kiem_de` và `kiem_nhin` rỗng. `test_nhin_hai_lan()`: `gan_nhin` hai lần không nhân đôi modifier. `test_nhin_dau_doi_xung()`: cùng lệnh trên `dung_nam(mole_side=+1)`.
- [ ] **Step 2: Chạy** `chay.py test_nhin` → FAIL.
- [ ] **Step 3: Cài `gan_nhin` và `kiem_nhin`.** Nếu `Shrinkwrap` làm con ngươi lệch ở góc nghiêng, đổi phương thức (PROJECT theo Y hoặc NEAREST_SURFACEPOINT) nhưng giữ test. Nếu bind Surface Deform bỏ qua dịch chuyển trước đó thì dùng thứ tự đã ghi ở trên.
- [ ] **Step 4: Chạy cả bộ** → PASS.
- [ ] **Step 5: Commit.**

## Task 3: Nhắm mắt

**Files:**
- Modify: `bieu_cam/dinh_nghia.json` (thêm `nham`, `nham_cung`), `bieu_cam/nhin.py`, `bieu_cam/gan.py`
- Test: `bieu_cam/kiem_thu/test_nham.py`

**Interfaces:**
- Produces: hai key `nham` (mí trên và mí dưới gặp nhau; `hieu_ung: {"nham": 1}`) và `nham_cung` (nhắm kèm cong vòng cung lên khi cười, khoé mắt hạ, giữa nâng; `hieu_ung: {"nham": 1}`). `nhin.gan_nhin` cập nhật: `offset` của `Shrinkwrap` con ngươi = `0.0003 − 0.004 × k_nham` (chìm dưới da khi nhắm). `gan.tron_trang_theo_mat` cập nhật: mặt nạ tròng trắng nhân thêm `(1 − k_nham)` (node Attribute loại `OBJECT`, tên `k_nham`).

- [ ] **Step 1: Viết test hỏng.** `test_nham_hang_mi_gap_nhau()`: `nham = 1` → `lid_up.z − lid_low.z ≤ 0.003` cả hai mắt, và `nham = 0` thì khoảng đó lớn hơn 0,030. `test_nham_an_con_nguoi()`: `nham = 1` → mọi đỉnh `Pupil.*` có khoảng cách có dấu tới da < 0, kể cả khi `m_nhin_x = 1`. `test_nham_an_tron_trang()`: `nham = 1` → giá trị mặt nạ tròng trắng sau nhân bằng 0 (đọc `k_nham`, 1 − 1 = 0). `test_nham_cung_cong()`: `nham_cung = 1` → neo `eye_c` cao hơn trung bình `eye_in`/`eye_out` ≥ 2 mm. `test_nham_sach_5_goc()`: `kiem.chay_kiem(d, ['nham','nham_cung']) == []` (gồm lòi viền, đè, nhận diện).
- [ ] **Step 2: Chạy** `chay.py test_nham` → FAIL.
- [ ] **Step 3: Điền định nghĩa** `nham` và `nham_cung` bằng neo `lid_up`, `lid_low`, `eye_in`, `eye_out` (nhân kéo elip `[rx, ry, rz]` rộng theo mắt); cập nhật `nhin.py` và `gan.py` theo mô tả. Xem ảnh nhỏ (chính diện, 3/4) bằng `bieu_cam_nam.py --anh` để chắc không còn sợi tròng trắng.
- [ ] **Step 4: Chạy cả bộ** → PASS; xem ảnh.
- [ ] **Step 5: Commit.**

## Task 4: Dạng miệng, răng và lưỡi

**Files:**
- Modify: `bieu_cam/khoang_mieng.py`, `bieu_cam/dinh_nghia.json` (thêm `cuoi`, `mieu`, `mom_o`, `ha_rong`, `nghien`, `mieng_meo`, `nhech`), `bieu_cam/chung.py` (neo môi dưới/trên bổ sung nếu cần)
- Test: `bieu_cam/kiem_thu/test_mieng.py`

**Interfaces:**
- Produces: thuộc tính đỉnh `rang` và `luoi` trên `Head_Base` (chia dải khoang tối theo vị trí dọc lúc nghỉ: phần trên là răng, phần dưới là lưỡi); shader trộn trắng răng theo `k_rang` và hồng lưỡi theo `k_luoi`, chỉ trong dải `khoang`. Key mới (mức dùng cho mẫu): `cuoi` (khoé miệng lên), `mieu` (xệ xuống), `mom_o` (miệng "o" nhỏ), `ha_rong` (há rộng, `hieu_ung: {"rang":1,"luoi":0.6}`), `nghien` (nghiến răng: môi hé, `hieu_ung: {"rang":1}`), `mieng_meo` (một bên lên/xuống), `nhech` (một bên nhếch).

- [ ] **Step 1: Viết test hỏng.** `test_rang_luoi_trong_khoang()`: mọi đỉnh có `rang > 0` hoặc `luoi > 0` có `khoang >= 0.5`; `rang` chỉ ở nửa trên, `luoi` chỉ ở nửa dưới của dải. `test_rang_luoi_an_khi_khep()`: kênh `rang = luoi = 0` → hệ số trộn shader bằng 0 (đọc `k_rang`, `k_luoi`). `test_cuoi_mieu_doi_chieu()`: `cuoi = 1` → `mouth_corner.*` cao hơn lúc nghỉ ≥ 4 mm; `mieu = 1` → thấp hơn ≥ 4 mm. `test_ha_rong_cao()`: chiều cao dải khoang (cột giữa) tăng ≥ 15 mm so với nghỉ. `test_mieng_meo_bat_doi_xung()`: `mieng_meo = 1` → độ dời hai khoé khác nhau ≥ 3 mm. `test_mieng_sach_5_goc()`: `chay_kiem` cho 7 key mới rỗng, kể cả cặp với `kinh_hoang`.
- [ ] **Step 2: Chạy** `chay.py test_mieng` → FAIL.
- [ ] **Step 3: Cài.** Thuộc tính `rang`/`luoi` tính một lần từ lưới nghỉ; shader dùng Mix thêm sau Mix khoang hiện có (không đổi thứ tự đã có). `ha_rong` dùng nhân elip như `kinh_hoang`.
- [ ] **Step 4: Chạy cả bộ** → PASS; xem ảnh `ha_rong`, `nghien`.
- [ ] **Step 5: Commit.**

## Task 5: Nước mắt và mồ hôi

**Files:**
- Create: `bieu_cam/da.py`, `bieu_cam/kiem_thu/test_nuoc.py`
- Modify: `bieu_cam/chung.py` (`TEN_VAT`), `bieu_cam/ap_dung_bo.py`, `bieu_cam/kiem.py`

**Interfaces:**
- Produces: `da.them_nuoc(dau) -> None` tạo `Nuoc_mat.L/R` (vệt và giọt chảy từ khoé mắt xuống má, màu trong mờ) và `Mo_hoi.L` (giọt ở thái dương), gắn bằng `Bam_mat` rồi `Shrinkwrap` có `offset = −0.006 + 0.0070 × k_<kênh>` (chìm dưới da khi kênh = 0, nổi khi = 1); thêm vào `dau.parts` để mọi kiểm hiện có áp dụng. Kênh dùng: `nuoc_mat`, `mo_hoi`.

- [ ] **Step 1: Viết test hỏng.** `test_nuoc_an_khi_0()`: kênh 0 → mọi đỉnh `Nuoc_mat.*`, `Mo_hoi.L` có khoảng cách có dấu < 0 (dưới da); ở cả 5 góc không có đỉnh lọt ra ngoài bóng đầu. `test_nuoc_bam_khi_1()`: kênh 1 → `kiem_bam` rỗng cho ba vật và khoảng cách có dấu ≥ 0; điểm đầu vệt cách `eye_c` dưới 25 mm. `test_nuoc_theo_key()`: key `buon_ro` (mẫu, Task 8) đặt 1 → `k_nuoc_mat == 1`; chỗ này chỉ kiểm cấu trúc khi chưa có key mẫu (dùng định nghĩa tạm có `hieu_ung`). `test_mat_nghi_khong_doi_voi_nuoc()`: `kiem_nhan_dien` rỗng và băm đỉnh nghỉ của `Head_Base` giữ nguyên sau `them_nuoc`.
- [ ] **Step 2: Chạy** `chay.py test_nuoc` → FAIL.
- [ ] **Step 3: Cài `them_nuoc`.** Vật dựng bằng lưới nhỏ (giọt nước = cầu dẹt + đuôi), vật liệu trong mờ có độ bóng; gọi lại không nhân đôi.
- [ ] **Step 4: Chạy cả bộ** → PASS; xem ảnh với kênh 0 và 1.
- [ ] **Step 5: Commit.**

## Task 6: Má ửng, nhăn mũi và đẩy má

**Files:**
- Modify: `bieu_cam/da.py` (`them_ma`), `bieu_cam/dinh_nghia.json` (thêm `nhan_mui`, `day_ma`)
- Test: `bieu_cam/kiem_thu/test_ma.py`

**Interfaces:**
- Produces: `da.them_ma(dau) -> None`: thuộc tính đỉnh `ma` (vùng má mềm quanh `cheek.L/R`, tắt dần) và Mix màu hồng trong vật liệu da theo `k_ma`. Key `nhan_mui` (sống mũi và cánh mũi nhăn lên, `nose_bridge`/`nose_wing`), `day_ma` (má đẩy lên, `cheek`).

- [ ] **Step 1: Viết test hỏng.** `test_ma_chi_tren_ma()`: mọi đỉnh `ma > 0.05` nằm cách `cheek.L/R` dưới 45 mm và không có đỉnh nào trong 12 mm quanh `eye_c`, `mouth_c`. `test_ma_an_khi_0()`: `k_ma = 0` → hệ số trộn 0. `test_ma_mem()`: không có cặp đỉnh kề nhau chênh `ma` > 0,35 (không viền gắt). `test_nhan_mui_day_ma_sach()`: `chay_kiem(['nhan_mui','day_ma']) == []`; `day_ma = 1` → `cheek` cao hơn nghỉ ≥ 3 mm.
- [ ] **Step 2: Chạy** `chay.py test_ma` → FAIL.
- [ ] **Step 3: Cài.** Cùng kỹ thuật thuộc tính đỉnh + Mix như `khoang`.
- [ ] **Step 4: Chạy cả bộ** → PASS; xem ảnh.
- [ ] **Step 5: Commit.**

## Task 7: Tổ hợp biểu cảm

**Files:**
- Create: `bieu_cam/to_hop.py`, `bieu_cam/to_hop.json`, `bieu_cam/kiem_thu/test_to_hop.py`
- Modify: `bieu_cam/dinh_nghia.json` (bỏ key riêng `tu_ai`, `thi_uy` theo quyết định chủ repo), `bieu_cam/kiem_thu/test_day_du.py`

**Interfaces:**
- Produces: `to_hop.nap(duong_dan=None) -> dict[str, dict[str, float]]` (tên tổ hợp → {key nguồn: trọng số}); `to_hop.dat(dau, ten: str, gia_tri: float) -> None` (đặt mỗi key nguồn = `trọng_số × gia_tri`, cắt vào [0, 1]; không động tới key không thuộc tổ hợp); `to_hop.json` ban đầu: `tu_ai` = `{"khinh_thuong_ro": 0.6, "kim_nen_ro": 0.4}`, `thi_uy` = `{"quyet_tam_ro": 0.7, "khinh_thuong_ro": 0.5}` (công thức xuất phát, điền khi Task 8 và các bảng sau có key nguồn; trước đó dùng `hoang_mang` và `kiet_suc` làm chỗ giữ để test chạy).

- [ ] **Step 1: Viết test hỏng.** `test_dat_to_hop_dat_nhieu_key()`; `test_to_hop_cat_0_1()` (giá trị 1,5 → nguồn không vượt 1); `test_to_hop_sach_5_goc()`: với mỗi tổ hợp ở giá trị 1,0 và 0,5, bộ kiểm hình học rỗng; `test_to_hop_khong_dong_key_khac()`; cập nhật `test_day_du` còn 4 key riêng (`ngai_ngu`, `kiet_suc`, `hoang_mang`, `kinh_hoang`), nhóm `tu_ai_thi_uy` bỏ khỏi `test_moi_nhom_du_hai_muc`.
- [ ] **Step 2: Chạy** `chay.py test_to_hop test_day_du` → FAIL.
- [ ] **Step 3: Cài** `nap`/`dat`; xoá hai key `tu_ai`, `thi_uy` khỏi JSON và khỏi các danh sách trong test.
- [ ] **Step 4: Chạy cả bộ** → PASS.
- [ ] **Step 5: Commit.**

## Task 8: Chín nhóm mẫu (mức Nhẹ và Rõ)

**Files:**
- Modify: `bieu_cam/dinh_nghia.json` (18 key `<nhom>_nhe`, `<nhom>_ro` cho `nghi_ngo`, `suy_luan`, `buon_ngu`, `vui`, `tuc_gian`, `tui_than`, `lo_lang`, `ngai_ngu`, `ghe_so`; đổi `ngai_ngu` cũ thành `buon_ngu` nếu cần tránh trùng), `bieu_cam/to_hop.json`
- Test: `bieu_cam/kiem_thu/test_mau.py`

**Interfaces:**
- Consumes: mọi công cụ Task 1–7. Mỗi key mẫu dùng `gom` và `hieu_ung` để kéo công cụ tương ứng (ví dụ `vui_ro` gom `nham_cung` và `ha_rong`, `hieu_ung: {"nham":1,"rang":1,"luoi":0.6}`; `tui_than_ro` có `nuoc_mat: 1`; `lo_lang_ro` có `mo_hoi: 1`, `nhin_x`; `ngai_ngu_ro` có `ma: 1`, `nhin_y` xuống; `ghe_so_ro` gom `nhan_mui`, `day_ma`; `suy_luan_*` có `nhin_y` lên kèm mí mở; `nghi_ngo_*` có `nhin_x`).

- [ ] **Step 1: Viết test hỏng.** `test_chin_nhom_du_hai_muc()`: đủ 18 key theo tên. `test_cong_cu_duoc_dung()`: mỗi công cụ (hướng nhìn, nhắm mắt, răng, lưỡi, nước mắt, mồ hôi, má ửng, nhăn mũi) có ít nhất một key mẫu dùng nó (xét `hieu_ung`/`gom`). `test_mau_sach_5_goc()`: `chay_kiem` cho 18 key rỗng. `test_hai_muc_khac_nhau()`: với mỗi nhóm, tổng độ dời neo mức Rõ lớn hơn mức Nhẹ ≥ 20%.
- [ ] **Step 2: Chạy** `chay.py test_mau` → FAIL.
- [ ] **Step 3: Điền 18 định nghĩa** bám ảnh mẫu (`assets/tham-chieu-bieu-cam/`), chỉnh bằng bảng ảnh nhỏ, tối đa hai vòng.
- [ ] **Step 4: Chạy cả bộ** → PASS.
- [ ] **Step 5: Commit.**

## Task 9: Bảng so sánh với ảnh mẫu

**Files:**
- Create: `bieu_cam/so_sanh.py`, `bieu_cam/kiem_thu/test_so_sanh.py`
- Modify: `bieu_cam_nam.py` (thêm `--so-sanh <thư_mục>`)

**Interfaces:**
- Produces: `so_sanh.cat_o(bang: int, nhom: str, muc: str) -> PIL.Image` (cắt ô `Nhẹ`/`Rõ` của nhóm từ `bang-<n>-*.webp`, theo lưới trong README ảnh mẫu); `so_sanh.TOA_DO: dict[str, tuple[int, int, str]]` (nhóm → bảng, vị trí ô); `so_sanh.ghep(ma_dir: str, anh_3d_dir: str, ra: str) -> None` (mẫu bên trái, 3D bên phải, hai mức × ba góc).

- [ ] **Step 1: Viết test hỏng.** `test_24_nhom_co_toa_do()`: đủ 24 nhóm; `test_cat_o_kich_thuoc()`: mỗi ô cắt rộng 180–260 px và cao 200–290 px, hai mức của một nhóm cùng kích thước; `test_ghep_ra_bang()`: bảng cho `vui` có cả hai mức và rộng ≥ 3 × 200 px.
- [ ] **Step 2: Chạy** `chay.py test_so_sanh` → FAIL.
- [ ] **Step 3: Cài** theo lưới trong README ảnh mẫu (số liệu ước lượng; xem từng ô cắt bằng mắt một lần và chỉnh).
- [ ] **Step 4: Chạy cả bộ** → PASS; xuất bảng thật cho 9 nhóm mẫu.
- [ ] **Step 5: Commit.**

## Task 10: Kiểm chung, áp lên đầu khác, hồ sơ

**Files:**
- Modify: `bieu_cam/kiem_thu/test_tai_su_dung.py`, `bieu_cam/ap_dung_bo.py`, `bieu_cam_nam.py`, `README.md`, `ASSET.md`, `LOI-TON-DONG.md`, `CHECKLIST-TIEN-KY-ASSET.md`, `THIET-KE-BIEU-CAM-24-NHOM.md`, `docs/KINH-NGHIEM.md`

**Interfaces:** `ap_dung_bo.ap_dung_bo(dau, dinh_nghia=None) -> list[str]` giờ gọi thêm `kenh.tao_kenh`, `nhin.gan_nhin`, `da.them_nuoc`, `da.them_ma`, `to_hop` nạp; trả danh sách mọi key.

- [ ] **Step 1: Viết test hỏng.** `test_bo_cong_cu_tren_dau_doi_xung()` và `test_bo_cong_cu_tren_dau_rong()`: toàn bộ key mới ở 1,0 và 0,5 qua `chay_kiem`; kênh dời đúng theo `ty_le_mat` mới. `test_mat_nghi_trung_ban_duyet()`: sau áp dụng bộ, mọi key và kênh = 0 → `kiem_nhan_dien` rỗng, hiệu ứng vô hình ở 5 góc. `test_ap_dung_bo_hai_lan()`: số driver, modifier, thuộc tính, vật phụ không đổi.
- [ ] **Step 2: Chạy** `chay.py test_tai_su_dung` → FAIL tới khi `ap_dung_bo` gọi hết công cụ.
- [ ] **Step 3: Cài** và chạy `bieu_cam_nam.py --kiem` (báo 0 lỗi cho toàn bộ key).
- [ ] **Step 4: Ghi hồ sơ** theo trạng thái thật: công cụ nào qua kiểm, nhóm nào xong, nhóm nào còn; không tick `3D_FACIAL_SHAPES`. Bài học dùng chung vào `docs/KINH-NGHIEM.md` chỉ khi đã chạy trên hai đầu.
- [ ] **Step 5: Chạy cả bộ, commit và push nhánh làm việc** (Haiku theo CLAUDE.md, kèm `Co-Authored-By`/`Claude-Session`).

---

## Rà soát

- **Phủ thiết kế:** hướng nhìn → Task 2; nhắm mắt → 3; răng/lưỡi/dạng miệng → 4; nước mắt, mồ hôi → 5; má ửng, nhăn mũi, đẩy má → 6; tổ hợp → 7; 9 nhóm mẫu → 8; bảng so sánh → 9; kiểm 5 góc, đầu thứ hai, hồ sơ → 10; kênh hiệu ứng và neo → 1.
- **Nhất quán tên:** `k_<kênh>`, `m_<kênh>`, `nham`, `nham_cung`, `ha_rong`, `<nhom>_nhe/_ro`, `to_hop.dat`, `ap_dung_bo` dùng như nhau giữa các Task.
- **Rủi ro chưa kiểm:** (1) driver kiểu biểu thức đơn giản chưa thử trong `bpy` không giao diện; (2) `Shrinkwrap` sau `Surface Deform` có thể làm con ngươi/vật nhỏ lệch ở góc nghiêng; (3) nhắm mắt bằng kéo hai mí cần nhân elip lớn, có thể gây gấp nếp; (4) nước mắt dạng lưới nhỏ chìm dưới da có thể lộ qua tán xạ dưới da (SSS). Các Task đã có test bắt từng điểm.
