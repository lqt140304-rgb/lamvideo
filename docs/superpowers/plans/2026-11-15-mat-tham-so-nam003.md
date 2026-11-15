# Mặt theo tham số cho NAM-003 (Tùng) — kế hoạch dựng

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Mục tiêu:** viết một script dùng chung, đọc `nam-003-rig.blend` và một bộ tham số nhân vật, rồi dựng mặt 3D đầy đủ: mắt, mày, miệng thật, biểu cảm và khẩu hình. Nhân vật đầu tiên là `tung`.

**Kiến trúc:** dữ liệu nhân vật nằm riêng một file (`nhan_vat_nam003.py`). Phần dựng chia làm ba module: mắt và mày, miệng, điều khiển (shape key, driver, biểu cảm). Script chính gọi lần lượt từng phần. Mọi kích thước là tỉ lệ so với các mốc mặt, đo tự động trên lưới sau khi bóp. Mỗi module có hàm tự kiểm bằng `assert`, chạy khi truyền `--kiem`.

**Công nghệ:** Blender 5.2.x (`bpy`, `bmesh`, `numpy`), chạy `-b --factory-startup`.

**Spec:** [docs/superpowers/specs/2026-11-15-mat-tham-so-nam003-design.md](../specs/2026-11-15-mat-tham-so-nam003-design.md). Đề bài gốc: [BAN-GIAO-MAT.md](../../../assets/nhan-vat-3d/nam-003/BAN-GIAO-MAT.md).

## Ràng buộc chung

- Các lệnh chạy trong thư mục `assets/nhan-vat-3d/nam-003/`. Blender ở `D:/blender/blender.exe`.
- Mọi bộ phận mặt có cha là `Nam_Rig`, trọng số 100 % `Head`, tối đa 4 xương trên mỗi đỉnh.
- Chỉ được khoét `Nam_Body` sau khi đã gán trọng số. File `nam-003-rig.blend` đã có trọng số sẵn, nên khoét ngay sau khi nạp là đúng thứ tự. Không thêm hoặc bớt đỉnh ở chỗ khác.
- Không bake scale. `Nam_Rig.scale = cao / 1.824`.
- Thuộc tính trên `Head` (giữ đúng tên): `may_nhuong, may_ha, may_cau, may_buon, may_trai_nhuong, may_phai_nhuong, mieng_ha, mieng_hep, mieng_rong, cuoi, meu, mieng_khep, chop_mat, chop_trai, chop_phai, mo_to`. Xương nhìn là `nhin`.
- Không dùng dịch vụ trả phí. Không commit `.blend` trên 50 MB hay ảnh render nặng. Ảnh xem trước dùng `.webp` nhỏ.
- Không đọc texture vì lưới không có texture. Mọi màu lấy từ tham số.

## Điểm cần soi khi review

1. **Bóp mặt làm lệch mốc:** đo mốc phải chạy *sau* bước bóp. Nếu đo trước, mắt sẽ trôi khỏi hốc.
2. **Mép khoét miệng và môi:** khi há `mieng_ha = 1` không được thấy khe hở ra ngoài đầu, cũng không thấy mặt sau lưới.
3. **Scale 1,60 và 1,70:** mắt, mày, miệng phải đi theo đầu, và xương `nhin` không bị lệch khi đổi scale.
4. **Nhân vật thiếu khóa:** bộ `nam` không ghi đủ mọi tham số. Khóa thiếu phải lấy giá trị từ `MAC_DINH`, không được báo lỗi.
5. **Chạy lại:** cùng một đầu vào thì số đỉnh và tên object phải giống hệt nhau, không sinh tên kiểu `.001`.

---

### Task 1: Bảng nhân vật, đo mốc mặt, bóp mặt

**Files:**
- Create: `assets/nhan-vat-3d/nam-003/nhan_vat_nam003.py`: `MAC_DINH: dict`, `NHAN_VAT: dict[str, dict]`, `lay(ten) -> dict` (gộp với `MAC_DINH`).
- Create: `assets/nhan-vat-3d/nam-003/rig_mat_nam003.py`: nhận `--in --nv --out [--anh] [--kiem]`, nạp file, gọi các bước. `do_moc(body) -> dict` và `bop(body, p)` cũng nằm ở đây.

**Interfaces:**
- Produces: `do_moc(body) -> {'mat': (x, y, z), 'r_hoc': float, 'mui': (0, y, z), 'mieng': (0, y, z), 'cam': (0, y, z), 'tai': (x, y, z)}`, với `mat` là bên +X. `p = lay(ten)` chứa các khóa `cao, da, mat_rong, mat_cao, mat_nghieng, mat_vien, mi_doi, mong_mau, may_day, may_dang, mieng_rong, mieng_cao, moi_mau, bop, ruoi`.
- Bộ `tung`: `cao 1.70`, `da (0.92, 0.74, 0.62)`, `may_day 1.3`, `mong_mau (0.03, 0.02, 0.015)`, `mi_doi True`, `mieng_rong 1.15`, `mieng_cao 0.85`, `moi_mau` hồng, `bop = {tai 0.8, ham +, cam +, mui thấp và thon, ma −}` (độ dịch tối đa ≈ 8 mm), `ruoi None`. Bộ `nam`: `cao 1.60`, `ruoi 'trai'`, còn lại để trống.

- [ ] **Step 1:** viết `kiem_moc(m)` với các assert sau:
  - `m['mat'][0] > 0.02`;
  - `m['mui'][1] < m['mat'][1]` (mũi nhô ra trước mắt, theo hướng −Y);
  - `m['cam'][2] < m['mieng'][2] < m['mui'][2] < m['mat'][2]`;
  - `0.01 < m['r_hoc'] < 0.05`.

  Thêm `kiem_lay()`: `lay('nam')['da'] == MAC_DINH['da']`.
- [ ] **Step 2:** chạy `blender -b --factory-startup --python rig_mat_nam003.py -- --in nam-003-rig.blend --nv tung --out _t.blend --kiem`. Kết quả mong đợi: lỗi vì `do_moc` chưa có.
- [ ] **Step 3:** cài đặt `do_moc`:
  - hốc mắt là cực tiểu cục bộ của độ nhô y (trừ −y) trong dải z từ 1,60 tới 1,72 tại |x| ≈ 0,03–0,06;
  - mũi là điểm trước nhất trên đường giữa;
  - miệng là rãnh lõm đầu tiên dưới mũi;
  - cằm là điểm trước nhất dưới miệng.

  Cài đặt `bop`: vùng lan mềm, đối xứng, theo các mốc đo trên lưới chưa bóp. Sau khi bóp, đo mốc lại.
- [ ] **Step 4:** chạy lại lệnh ở Step 2. Kết quả mong đợi: in các mốc và `PASS moc`. Xuất ảnh mặt chính diện và 3/4 trước/sau khi bóp vào `xem/bop.webp`, rồi duyệt bằng mắt.
- [ ] **Step 5:** commit `nhan_vat_nam003.py`, `rig_mat_nam003.py`, `xem/bop.webp`.

### Task 2: Mắt 3D (nhãn cầu, mống, đồng tử, mí trên và dưới, xương `nhin`)

**Files:** Create `assets/nhan-vat-3d/nam-003/mat3d_nam003.py`.

**Interfaces:**
- Consumes: `do_moc`, `p`.
- Produces: `tao_mat(sc, arm, body, moc, p) -> list[Object]`, gồm các object `NhanCau.L/R`, `MiTren.L/R`, `MiDuoi.L/R`, `VienMat.L/R`, `OngHoc.L/R`, và xương `nhin` trong bone collection `Mat`. Shape key mí nối với `chop_mat, chop_trai, chop_phai, mo_to`.

Cách làm lấy từ `nam-002/mat_nam002.py`: khoét elip, ống lót hốc, nhãn cầu bầu dục, con ngươi trượt theo `nhin`, mí là vỏ ôm sát có shape key. Những chỗ phải khác:
- hốc dựng từ `moc['mat']`, `r_hoc × mat_rong / mat_cao`, xoay theo `mat_nghieng`;
- thêm mí dưới;
- `mi_doi` thêm một ống nếp mí mảnh phía trên.

- [ ] **Step 1:** viết `kiem_mat(objs, arm, body)` với các assert sau:
  - mỗi object có `parent == arm`, chỉ một nhóm trọng số `Head`, trọng số 1,0;
  - khi `chop_mat = 1`, khoảng cách lớn nhất từ mép mí trên tới mép mí dưới nhỏ hơn 0,5 mm;
  - khi dời `nhin` 5 cm sang +X, tâm đồng tử đổi x lớn hơn 1 mm;
  - nhìn chính diện, không đỉnh mặt trước nhãn cầu nào nằm sau mép hốc quá 3 mm.
- [ ] **Step 2:** chạy lệnh có `--kiem`. Kết quả mong đợi: lỗi vì `tao_mat` chưa có.
- [ ] **Step 3:** cài đặt `tao_mat`.
- [ ] **Step 4:** chạy lại. Kết quả mong đợi: `PASS mat`. Xuất `xem/mat.webp` gồm các khung: mặc định, liếc trái/phải/lên/xuống, mở to, nhắm, nháy; góc chính diện và 3/4. **Dừng lại để chủ repo duyệt ảnh.**
- [ ] **Step 5:** commit.

### Task 3: Mày 3D

**Files:** Modify `mat3d_nam003.py`, thêm `tao_may(sc, arm, body, moc, p) -> list[Object]` tạo `LongMay.L/R`.

- Dáng mày là đường cong 5 điểm tham số `may_dang`, tương đối với `moc['mat']` và `r_hoc`. Độ dày nhân với `may_day`. Tấm cong bám da, phồng khoảng 1,6 mm, hai đầu bo tròn, như nam-002.

- [ ] **Step 1:** viết `kiem_may` với các assert sau:
  - cha và trọng số như mắt;
  - mép dưới mày cao hơn đỉnh hốc ít nhất `0.15 × r_hoc`;
  - không đỉnh nào nằm dưới da quá 0,3 mm (xét bằng tia theo trục −y).
- [ ] **Step 2–4:** chạy lệnh, cài đặt, chạy lại tới `PASS may`. Xuất `xem/may.webp`.
- [ ] **Step 5:** commit.

### Task 4: Miệng thật (khoét, môi, khoang, răng, lưỡi, `jaw`)

**Files:** Create `assets/nhan-vat-3d/nam-003/mieng_nam003.py`.

**Interfaces:** `tao_mieng(sc, arm, body, moc, p) -> list[Object]` tạo các object sau, cùng xương `jaw` (cha `Head`, gốc ở trước tai ngang `moc['tai']`):

| Object | Đi theo |
|---|---|
| `Moi` | lưới vòng quanh lỗ, nối mép khoét, có shape key |
| `KhoangMieng` | túi kín màu tối, cha `Head` |
| `RangTren` | `Head` |
| `RangDuoi` | `jaw` |
| `Luoi` | `jaw` |

Lỗ khoét là elip ở `moc['mieng']`, rộng `mieng_rong × 0.022` và cao `mieng_cao × 0.006` mỗi bên tâm. Hai hằng số này là gợi ý: hiệu chỉnh khi duyệt ảnh, rồi ghi số cuối vào README. Môi có 3 vòng lưới: mép trong, viền môi, chuyển sang da. Đỉnh của vòng ngoài dán đúng vào mép khoét để kín. Trọng số môi: nửa trên theo `Head`, nửa dưới pha `jaw`. Riêng `Moi` được 2 xương trên mỗi đỉnh.

- [ ] **Step 1:** viết `kiem_mieng` với các assert sau:
  - mép khoét của `Nam_Body` trùng vòng ngoài của `Moi`, sai số dưới 0,1 mm;
  - khi xương `jaw` xoay 18°, đếm tia bắn từ trước mặt qua lỗ miệng: không tia nào trúng mặt sau của `Nam_Body`, mọi tia đều trúng `KhoangMieng`, răng hoặc lưỡi;
  - khi `jaw` ở 0°, răng nằm khuất sau môi;
  - mỗi đỉnh có tối đa 4 xương.
- [ ] **Step 2–4:** chạy lệnh, cài đặt, chạy lại tới `PASS mieng`. Xuất `xem/mieng.webp` gồm: ngậm, há nửa, há to; góc chính diện và 3/4. **Dừng lại để chủ repo duyệt ảnh.**
- [ ] **Step 5:** commit.

### Task 5: Điều khiển, biểu cảm, khẩu hình, da, scale

**Files:** Create `assets/nhan-vat-3d/nam-003/bieu_cam_nam003.py`.

**Interfaces:**
- `tao_bieu_cam(arm, body, may, moi)` tạo shape key và driver cho mọi thuộc tính trên `Head`.
- `mieng_ha` lái thêm `jaw`.
- `dung_bieu_cam(arm, ten)` nhận các tên sau, giá trị lấy theo `nam-002/bieu_cam_nam002.py::BIEU_CAM`: `mac_dinh, ngac_nhien, tuc_gian, buon, vui, nghi_ngo, so_hai, mo_mang`.
- `dung_viseme(arm, ten)` nhận 11 tên `A, E, I, O, U, MBP, PHV, NT, CH, KG, nghi`, cùng 8 tên cũ của nam-002 làm bí danh (`a→A`, `mbp→MBP`, `khac→KG`…).
- Vật liệu da Soft PBR dùng màu `p['da']`. Nốt ruồi khi `p['ruoi']` có giá trị. `Nam_Rig.scale = p['cao'] / 1.824`.

- [ ] **Step 1:** viết `kiem_bieu_cam` với các assert sau:
  - mọi thuộc tính trong danh sách ràng buộc chung đều có trên `Head`;
  - với mỗi viseme, `dung_viseme` chạy không lỗi;
  - `mieng_ha` của `A` lớn hơn của `I`;
  - `MBP` có `mieng_khep = 1`;
  - chiều cao bounding box trong world bằng `p['cao']`, sai số ±5 mm;
  - mỗi đỉnh tối đa 4 xương.
- [ ] **Step 2–4:** chạy lệnh, cài đặt, chạy lại tới `PASS bieu_cam`. Xuất `xem/bieu-cam.webp` (8 biểu cảm) và `xem/khau-hinh.webp` (11 khẩu hình), góc chính diện và 3/4.
- [ ] **Step 5:** commit.

### Task 6: Kiểm tổng, chạy bộ `nam`, đoạn thử, README

**Files:**
- Create `assets/nhan-vat-3d/nam-003/clip_thu_nam003.py`, viết dựa trên `nam-002/clip_thu_nam002.py`. Bỏ phần đi bộ, nhân vật đứng yên. Gồm quay đầu ±35°, cúi, chớp, liếc, chuỗi khẩu hình. 96 khung, Cycles mẫu thấp.
- Modify `assets/nhan-vat-3d/nam-003/README.md`: thêm mục Mặt (lệnh chạy, bảng tham số, số đo, việc chưa làm).

- [ ] **Step 1:** đo quay đầu ±35° và cúi 25°. Với mỗi object mặt, khoảng xuyên vào da phải nhỏ hơn 0,5 mm, đo bằng khoảng cách có dấu tới `Nam_Body`. Ghi kết quả vào README.
- [ ] **Step 2:** chạy hai lần `--nv tung`. So số đỉnh và tên object: phải giống hệt nhau.
- [ ] **Step 3:** chạy `--nv nam --kiem` mà không sửa mã. Kết quả mong đợi: mọi PASS. Ảnh `xem/tung-nam.webp` đặt Tùng 1,70 m cạnh Nam 1,60 m.
- [ ] **Step 4:** chạy clip thử, xuất `xem/clip-thu.webp` (bảng 12 khung). Chỉ render mp4 khi chủ repo yêu cầu.
- [ ] **Step 5:** commit script, README và ảnh. Push nhánh làm việc, không push `main`.
