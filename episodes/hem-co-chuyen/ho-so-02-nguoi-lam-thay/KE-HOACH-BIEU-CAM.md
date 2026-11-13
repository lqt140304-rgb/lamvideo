# Biểu cảm khuôn mặt 3D — Kế hoạch thực hiện

> **Cho người thực hiện:** làm lần lượt từng Task, tick `- [ ]` khi xong. Theo CLAUDE.md: phiên chính (Opus) dựng lượt đầu; Sonnet sửa lỗi đã rõ nguyên nhân; Haiku tìm/kiểm/push; kết quả agent chỉ là báo cáo, phiên chính chạy lại lệnh kiểm trước khi nói "xong".

**Mục tiêu:** bộ shape key biểu cảm 2 mức cho đầu Nam, mọi chi tiết mặt bám mặt ở mọi biểu cảm và góc nhìn, áp lại được lên đầu khác.

**Kiến trúc:** định nghĩa biểu cảm là dữ liệu JSON theo điểm neo mặt (tỉ lệ khuôn mặt), tách khỏi lưới Nam. Một hàm áp dụng tạo shape key, gắn các vật rời vào đầu, sửa mặt nạ tròng trắng cho đi theo mặt. Một bộ kiểm tự động chạy cho mọi đầu.

**Công nghệ:** Blender 5.0.x `bpy` (repo dựng bằng 5.0.1), Python, Pillow cho bảng ảnh (chạy ngoài Blender).

**Thiết kế:** [THIET-KE-BIEU-CAM.md](THIET-KE-BIEU-CAM.md) (đã duyệt). Đọc cùng với [dung_dau_nam.py](assets/nhan-vat-3d/dung_dau_nam.py).

## Ràng buộc chung

- Đơn vị mét. Nhân vật quay mặt −Y, bên trái nhân vật là +X (`.L`). Tâm đầu `C = (0, 0, 1.25)`.
- Tên vật có sẵn: `Head_Base`, `Pupil.L/R`, `Eyeline.L/R`, `Eyebrow.L/R`, `Mole`, `Mouth_line`.
- **Không sửa `dung_dau_nam.py`** (bản đã duyệt); mọi thứ mới nằm ở `assets/nhan-vat-3d/bieu_cam/` và `bieu_cam_nam.py`.
- Mặt nghỉ (mọi shape key = 0) phải trùng bản đã duyệt.
- Tối thiểu 2 mức mỗi nhóm; không làm cấp 3, không làm khẩu hình.
- Tên shape key (6 của Nam): `ngai_ngu`, `kiet_suc`, `tu_ai`, `thi_uy`, `hoang_mang`, `kinh_hoang`.
- Ngưỡng đề xuất: bám ≤ 1 mm; nốt ruồi trôi ≤ 3 mm; góc kiểm `chinh_dien 0°`, `3q_trai 45°`, `3q_phai −45°`, `nghieng_trai 90°`, `nghieng_phai −90°`; giá trị kiểm 1,0 và 0,5.
- Chỉ ảnh tĩnh nhỏ (≤ 360 px, ít mẫu). Không render video. Không commit `.blend`, ảnh nặng, cache.
- Môi trường: `bpy` 5.0.1 cài được vào môi trường Python 3.11 riêng (`uv venv --python 3.11 /tmp/bpyenv`; ghi chú ban đầu "container không có bpy" là sai, đã sửa 13/11). Trên máy có Blender dùng `blender -b -P <file> -- <đối số>`. Mốc kiểm "xong" chỉ tính khi lệnh chạy thật và in `PASS`.

## Cần soi kỹ (ngoài các test của từng Task)

1. Hai shape key bật cùng lúc (ví dụ `kiet_suc` 0,6 + `thi_uy` 0,4 khi chuyển cảnh): chi tiết mặt vẫn bám. → Task 4.
2. Góc nghiêng 90° chỉ thấy một mắt: kiểm không báo sai cho mắt bị che. → Task 2.
3. Mọi key = 0: lưới nghỉ trùng bản đã duyệt từng đỉnh. → Task 3.
4. Chạy `ap_dung` hai lần: không nhân đôi key hay modifier. → Task 3.
5. Đầu khác (nốt ruồi đổi bên, đầu rộng hơn 8%): bộ kiểm vẫn qua mà không sửa mã. → Task 8.

---

## Task 1: Khung chạy test và điểm neo mặt

**Files:**
- Create: `assets/nhan-vat-3d/bieu_cam/chung.py`
- Create: `assets/nhan-vat-3d/bieu_cam/kiem_thu/chay.py`, `kiem_thu/test_neo.py`

**Interfaces:**
- Produces: `chung.Dau` (dataclass: `head: Object`, `parts: dict[str, Object]`, `surf: Surf`, `neo: dict[str, Vector]`, `ten: str`); `chung.dung_nam(mole_side: int | None = None, x_scale: float = 1.0) -> Dau`; `chung.lay_neo(head, parts, surf) -> dict[str, Vector]` (toạ độ thế giới); `chung.ty_le_mat(neo) -> float` (khoảng cách hai tâm mắt, thước đo mọi độ dời). Tên neo: `eye_c.L/R`, `lid_up.L/R`, `lid_low.L/R`, `brow_in.L/R`, `brow_mid.L/R`, `brow_out.L/R`, `mouth_c`, `mouth_corner.L/R`, `chin`.
- `chay.py`: chạy mọi hàm `test_*` trong `kiem_thu/test_*.py`, in `PASS <tên>` hoặc `FAIL <tên>: <lý do>`, thoát khác 0 nếu có FAIL.

- [ ] **Step 1: Viết test hỏng** `test_neo_du_va_doi_xung()`: dựng bằng `dung_nam()`; assert đủ mọi tên neo; assert `abs(neo['eye_c.L'].x + neo['eye_c.R'].x) < 1e-3`; assert `neo['brow_mid.L'].z > neo['lid_up.L'].z > neo['eye_c.L'].z > neo['mouth_c'].z > neo['chin'].z`.
- [ ] **Step 2: Chạy:** `blender -b -P assets/nhan-vat-3d/bieu_cam/kiem_thu/chay.py -- test_neo`. Mong đợi: FAIL (chưa có `chung`).
- [ ] **Step 3: Cài `dung_nam`**: nhập `dung_dau_nam`, gọi `build()` rồi lấy vật theo tên (đọc `build()` trước để biết nó có trả về đầu hay không; nếu không, tra theo tên trong `bpy.data.objects`). `mole_side` gán `dung_dau_nam.MOLE_SIDE` trước khi dựng; `x_scale` nhân X cho `Head_Base` và mọi vật mặt trước khi lấy neo. Cài `lay_neo` dùng `Surf` và khung `EYE_FRAMES`/`MOUTH_FRAME`/`FACE` có sẵn của `dung_dau_nam`.
- [ ] **Step 4: Chạy lại.** Mong đợi: `PASS test_neo_du_va_doi_xung`.
- [ ] **Step 5: Commit:** `git add assets/nhan-vat-3d/bieu_cam/` (đường dẫn đầy đủ trong thư mục tập) rồi commit "Khung test và điểm neo mặt cho biểu cảm".

## Task 2: Bộ kiểm tự động

**Files:**
- Create: `assets/nhan-vat-3d/bieu_cam/kiem.py`, `kiem_thu/test_kiem.py`

**Interfaces:**
- Consumes: `chung.Dau`.
- Produces: `kiem.Loi` (dataclass: `key`, `gia_tri`, `goc`, `kieu`, `vat`, `do: float`); `kiem.GOCS: dict[str, float]` (độ phương vị); `kiem.chup_nghi(dau) -> dict` (băm đỉnh nghỉ của `Head_Base` + vị trí `Mole`); `kiem.kiem_bam(dau) -> list[Loi]`, `kiem_trong_vien(dau, goc) -> list[Loi]`, `kiem_de(dau) -> list[Loi]`, `kiem_nhan_dien(dau, nghi) -> list[Loi]`; `kiem.chay_kiem(dau, ten_keys: list[str], gia_tris=(1.0, 0.5), gocs=GOCS) -> list[Loi]` (đặt từng key, chạy 4 kiểm ở mọi góc, trả danh sách lỗi; rỗng nghĩa là đạt).

- [ ] **Step 1: Viết test hỏng** (kiểm bộ kiểm): `test_phat_hien_mat_bam()` dựng Nam, dời `Eyebrow.L` ra 5 mm theo pháp tuyến, assert `kiem_bam` trả ≥ 1 `Loi` kiểu `bam` với `do > 0.004`; `test_phat_hien_lo_vien()` dời `Eyeline.L` 5 cm ra ngoài đầu, assert `kiem_trong_vien(dau, 0)` báo lỗi; `test_phat_hien_de()` kéo `Pupil.L` lên trên `lid_up.L`, assert `kiem_de` báo lỗi; `test_nhan_dien()` dời `Mole` 5 mm, assert `kiem_nhan_dien` báo lỗi; `test_mat_nghi_sach()` assert cả 4 kiểm trả rỗng cho Nam chưa chỉnh.
- [ ] **Step 2: Chạy.** Mong đợi: FAIL.
- [ ] **Step 3: Cài `kiem.py`.** `kiem_bam`: tia từ mỗi đỉnh của vật rời vào `Head_Base` (BVH của đầu đã đánh giá), khoảng cách tới mặt ≤ `NGUONG_BAM = 0.001`. `kiem_trong_vien`: nhìn trực giao theo góc, mỗi đỉnh vật rời bắn tia song song; trượt `Head_Base` nghĩa là ngoài viền. `kiem_de`: lông mày không cắt viền mắt cùng bên; tâm con ngươi nằm dưới `lid_up` và trên `lid_low` trong khung mắt. `kiem_nhan_dien`: băm đỉnh nghỉ khớp `nghi` khi mọi key bằng 0; `Mole` lệch ≤ `NGUONG_RUOI = 0.003` và cùng bên với `MOLE_SIDE`. Vật bị che ở góc nghiêng (mắt xa camera) bỏ qua kiểm viền, vẫn kiểm bám.
- [ ] **Step 4: Chạy lại.** Mong đợi: 5 `PASS`.
- [ ] **Step 5: Commit** các file của task này.

## Task 3: Định dạng định nghĩa và bộ tạo shape key

**Files:**
- Create: `assets/nhan-vat-3d/bieu_cam/dinh_nghia.json` (bắt đầu với `ngai_ngu`, `kiet_suc`), `bieu_cam/tao_key.py`, `kiem_thu/test_tao_key.py`

**Interfaces:**
- Consumes: `chung.Dau`, `chung.ty_le_mat`.
- Produces: `tao_key.nap_dinh_nghia(duong_dan: str) -> list[dict]`; `tao_key.ap_dung(dau, dinh_nghia: list[dict]) -> list[str]` (trả tên các key; **không nhân đôi** khi gọi lại). Mỗi định nghĩa: `{"ten": str, "nhom": str, "muc": 1|2, "ban_kinh": float, "dich": {ten_neo: [dx, dy, dz]}}`, độ dời tính theo `ty_le_mat` trong hệ mặt (x phải, y ra trước, z lên).

- [ ] **Step 1: Viết test hỏng:** `test_mat_nghi_khong_doi()` áp dụng rồi assert mọi key = 0 thì băm đỉnh nghỉ khớp `chup_nghi`; `test_key_dich_dung_neo()` đặt `kiet_suc = 1.0`, assert điểm gần `lid_up.L` nhất của `Head_Base` đã hạ theo định nghĩa, sai số ≤ 0,5 mm; `test_ap_hai_lan()` gọi `ap_dung` hai lần, assert số shape key bằng số định nghĩa.
- [ ] **Step 2: Chạy.** Mong đợi: FAIL.
- [ ] **Step 3: Cài.** Mỗi đỉnh vùng mặt nhận độ dời là tổng các độ dời neo nhân trọng số giảm mượt theo khoảng cách (hàm nền tròn, bán kính `ban_kinh` × `ty_le_mat`); đỉnh ngoài vùng mặt không dời. Điền `ngai_ngu` (mí trên hạ nhẹ, khóe miệng trễ) và `kiet_suc` (mí hạ nhiều, mày trong nâng, khóe miệng trễ sâu, cằm hạ) theo bảng ở [CHECKLIST mục 4](CHECKLIST-TIEN-KY-ASSET.md).
- [ ] **Step 4: Chạy lại.** Mong đợi: 3 `PASS`.
- [ ] **Step 5: Commit.**

## Task 4: Gắn chi tiết mặt và sửa tròng trắng

**Files:**
- Create: `assets/nhan-vat-3d/bieu_cam/gan.py`, `kiem_thu/test_gan.py`

**Interfaces:**
- Consumes: `tao_key.ap_dung`, `kiem.chay_kiem`.
- Produces: `gan.gan_chi_tiet(dau) -> None` (thêm `SURFACE_DEFORM` cho `Eyebrow.*`, `Pupil.*`, `Eyeline.*`, `Mouth_line`, `Mole`, đặt khi mọi key = 0, không nhân đôi modifier); `gan.tron_trang_theo_mat(dau) -> None`.

- [ ] **Step 1: Viết test hỏng:** `test_ngai_ngu_kiet_suc_sach()` gọi `ap_dung`, `gan_chi_tiet`, rồi assert `chay_kiem(dau, ['ngai_ngu', 'kiet_suc']) == []`; `test_hai_key_cung_luc()` đặt `kiet_suc` 0,6 và `ngai_ngu` 0,4 cùng lúc, assert `kiem_bam` và `kiem_de` rỗng; `test_tron_trang_di_theo_mi()` đặt `kiet_suc = 1`, assert toạ độ nghỉ lưu ở thuộc tính đỉnh khớp toạ độ thế giới của đỉnh sau biến dạng trừ độ dời key.
- [ ] **Step 2: Chạy.** Mong đợi: FAIL (con ngươi, mày lệch).
- [ ] **Step 3: Cài `gan_chi_tiet`** bằng Surface Deform nhắm `Head_Base`; nếu bind báo lỗi thì nâng lỗi rõ ràng, không bỏ qua.
- [ ] **Step 4: Cài `tron_trang_theo_mat`.** Mặt nạ tròng trắng trong vật liệu da đọc `TexCoord › Object`, nên đứng yên khi mặt biến dạng. Lưu toạ độ nghỉ của từng đỉnh vào thuộc tính `toa_do_nghi` trên `Head_Base`, rồi nối node `Attribute` (tên đó) thay cho đầu ra `Object` của `TexCoord` trong vật liệu da. Không sửa `dung_dau_nam.py`.
- [ ] **Step 5: Chạy lại.** Mong đợi: 3 `PASS`. Nếu `Surface Deform` làm méo con ngươi, thử `Shrinkwrap` hoặc gắn đỉnh; giữ nguyên các test.
- [ ] **Step 6: Commit.**

## Task 5: Bốn biểu cảm còn lại của Nam

**Files:**
- Modify: `assets/nhan-vat-3d/bieu_cam/dinh_nghia.json` (thêm `tu_ai`, `thi_uy`, `hoang_mang`, `kinh_hoang`)
- Test: `kiem_thu/test_day_du.py`

**Interfaces:** Consumes: `tao_key.ap_dung`, `gan.gan_chi_tiet`, `kiem.chay_kiem`.

- [ ] **Step 1: Viết test hỏng** `test_sau_key_sach()`: assert `chay_kiem(dau, ['ngai_ngu','kiet_suc','tu_ai','thi_uy','hoang_mang','kinh_hoang']) == []` và assert số key đúng 6.
- [ ] **Step 2: Chạy.** Mong đợi: FAIL (thiếu key).
- [ ] **Step 3: Điền định nghĩa** theo CHECKLIST mục 4: `tu_ai` (đầu mày nhướn, môi bặm), `thi_uy` (mày cau bất đối xứng, cằm hất), `hoang_mang` (đồng tử khẽ giật, mắt mở), `kinh_hoang` (mắt mở trừng, mày nâng, miệng há). `hoang_mang`/`kinh_hoang`/`thi_uy` chỉ mới khai độ dời cho miệng; cái miệng há thật nằm ở Task 6.
- [ ] **Step 4: Chạy lại.** Mong đợi: `PASS`. Lỗi còn lại sửa ở định nghĩa, không nới ngưỡng.
- [ ] **Step 5: Commit.**

## Task 6: Khoang miệng cho miệng há

**Files:**
- Create: `assets/nhan-vat-3d/bieu_cam/khoang_mieng.py`, `kiem_thu/test_khoang_mieng.py`

**Interfaces:**
- Consumes: `chung.Dau`.
- Produces: `khoang_mieng.them_khoang(dau) -> None` (tạo `Mouth_Cavity` gồm khoang tối, răng, lưỡi tối giản, gắn vào đầu; chỉ lộ khi key miệng há bật; không đổi lưới nghỉ).

- [ ] **Step 1: Viết test hỏng:** `test_khoang_trong_dau()` assert mọi đỉnh `Mouth_Cavity` nằm trong `Head_Base` hoặc bị da che khi key = 0 (kiểm bằng tia từ camera chính diện); `test_khoang_lo_khi_ha()` đặt `kinh_hoang = 1`, assert một tia từ camera chính diện xuyên qua miệng chạm khoang trước khi chạm da trong; `test_khoang_khong_lo_ra_ngoai()` `chay_kiem` cho ba key miệng há vẫn rỗng, tính cả `Mouth_Cavity`.
- [ ] **Step 2: Chạy.** Mong đợi: FAIL.
- [ ] **Step 3: Cài `them_khoang`.** Cách làm mở khoang (khoét lỗ bằng shape key, mặt nạ da, hay lật hiển thị) để người dựng chọn; điều kiện là lưới nghỉ không đổi và `Mouth_Cavity` được kiểm như các vật rời khác.
- [ ] **Step 4: Chạy lại.** Mong đợi: 3 `PASS`.
- [ ] **Step 5: Commit.**

## Task 7: Lệnh duyệt và bảng ảnh

**Files:**
- Create: `assets/nhan-vat-3d/bieu_cam_nam.py`, `assets/nhan-vat-3d/bieu_cam/bang_anh.py`

**Interfaces:**
- Consumes: mọi module trên.
- Produces: `bieu_cam_nam.py --kiem` (dựng Nam, áp dụng, kiểm, in báo cáo, thoát khác 0 nếu có lỗi); `--anh <thư_mục>` (xuất PNG ≤ 360 px mỗi key × 5 góc × giá trị 1,0); `--blend <file>`. `bang_anh.ghep(thu_muc: str, ra: str) -> None` (Pillow, chạy ngoài Blender, ghép bảng có tiêu đề).

- [ ] **Step 1: Viết test hỏng** `test_lenh_kiem_thoat_0()`: chạy `bieu_cam_nam.py --kiem` bằng `subprocess` trong Blender và assert mã thoát 0 và có dòng `PASS`.
- [ ] **Step 2: Chạy.** Mong đợi: FAIL.
- [ ] **Step 3: Cài.** Ghép các bước: `dung_nam` → `ap_dung` → `them_khoang` → `gan_chi_tiet` → `tron_trang_theo_mat` → `chay_kiem`. Ảnh dùng ánh sáng studio sẵn có của `dung_dau_nam`, ít mẫu.
- [ ] **Step 4: Chạy:** `blender -b -P assets/nhan-vat-3d/bieu_cam_nam.py -- --anh <thư_mục_tạm>` rồi `python assets/nhan-vat-3d/bieu_cam/bang_anh.py <thư_mục_tạm> <bảng>.png`. Đưa bảng cho chủ repo duyệt bằng mắt. Mong đợi: bảng đọc được ở cỡ điện thoại; chưa duyệt thì chưa sang Task 8.
- [ ] **Step 5: Commit** (không commit ảnh trừ bảng đã chốt).

## Task 8: Thử tái sử dụng trên đầu thứ hai

**Files:**
- Create: `kiem_thu/test_tai_su_dung.py`

**Interfaces:** Consumes: `chung.dung_nam(mole_side, x_scale)`, mọi module trên. Produces: không (chỉ kiểm).

- [ ] **Step 1: Viết test hỏng** `test_dau_doi_xung()`: `dung_nam(mole_side=+1)`, áp dụng cả 6 key bằng đúng lệnh ở Task 7 (không sửa mã), assert `chay_kiem` rỗng và `Mole` ở bên đối diện Nam; `test_dau_rong_hon()`: `dung_nam(x_scale=1.08)`, assert `chay_kiem` rỗng.
- [ ] **Step 2: Chạy.** Mong đợi: nếu FAIL, lỗi nằm ở chỗ định nghĩa còn dính lưới Nam.
- [ ] **Step 3: Sửa chỗ dính** trong `tao_key.py`/`gan.py` (không nới ngưỡng, không thêm nhánh riêng cho từng đầu).
- [ ] **Step 4: Chạy lại.** Mong đợi: 2 `PASS`. Chỉ khi cả hai qua mới ghi "tái sử dụng được" vào hồ sơ.
- [ ] **Step 5: Commit.**

## Task 9: Ghi hồ sơ

**Files:**
- Modify: `README.md` (liên kết tới thiết kế, kế hoạch, cách áp biểu cảm lên đầu mới), `ASSET.md` (dòng "Biểu cảm, khẩu hình và tương tác"), `LOI-TON-DONG.md`, `CHECKLIST-TIEN-KY-ASSET.md` (mục `3D_FACIAL_SHAPES`)
- Modify (chỉ khi Task 8 đã `PASS`): `docs/KINH-NGHIEM.md` (nguyên tắc chung, không tên nhân vật hay số liệu tập)

- [ ] **Step 1:** Ghi trạng thái thật: key nào qua kiểm, góc nào, ảnh duyệt nào; khẩu hình, Người Kia, Tùng, Mẹ ghi "chưa làm". Không tick `[x]` cho `3D_FACIAL_SHAPES` trọn bộ vì mới có đầu Nam hai mức.
- [ ] **Step 2:** Ghi chênh lệch với quy chuẩn 3D (18 key 3 mức → 6 key 2 mức cho Nam) để chủ repo quyết có sửa quy chuẩn hay không.
- [ ] **Step 3:** Chạy `git diff` xem từng đường dẫn, rồi commit và push nhánh làm việc (Haiku theo CLAUDE.md, kèm dòng `Co-Authored-By`/`Claude-Session`).

---

## Rà soát

- **Phủ thiết kế:** cách A, 2 mức, anti-goals (lưới nghỉ, nốt ruồi) → Task 2–4; 6 key → Task 3, 5; khoang miệng → Task 6; kiểm tự động và bảng ảnh → Task 2, 7; tái sử dụng + thử đầu thứ hai → Task 3, 8; hồ sơ và KINH-NGHIEM → Task 9. Người Kia (`neutral_smile`/`eerie_smirk`), khẩu hình ngoài phạm vi, đúng như thiết kế.
- **Nhất quán tên:** `Dau`, `dung_nam`, `ap_dung`, `gan_chi_tiet`, `chay_kiem`, `GOCS` dùng như nhau ở các Task.
- **Rủi ro chưa kiểm:** chưa ai chạy `bpy` trong phiên này nên cách gắn Surface Deform và mặt nạ `Attribute` là đề xuất; Task 4 và 6 có thể phải đổi cách làm, các test giữ nguyên.

## Ghi chú thực hiện (13/11/2026)

Task 1–8 đã chạy, 25 test qua. Chênh lệch so với kế hoạch (chi tiết ở [THIET-KE-BIEU-CAM.md](THIET-KE-BIEU-CAM.md#kết-quả-thực-hiện-và-chênh-lệch-so-với-thiết-kế)): khoang miệng bằng mặt nạ thay cho vật `Mouth_Cavity`; chưa răng/lưỡi; kiểm đo so với trạng thái nghỉ; nốt ruồi đo theo da; thêm `ap_dung_bo.py`; ảnh 3 góc. Lệnh chạy dùng module `bpy` (`python <file>`) thay cho `blender -b -P`.

