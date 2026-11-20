# Thiết Kế Dàn Nhân Vật Stickman 3D & Chuẩn Hóa Repo — Hồ Sơ 02 & Toàn Series

- **Ngày lập:** 17/11/2026
- **Trạng thái:** Chờ phê duyệt (Pending Review)
- **Quyết định chủ đạo:** Chuyển đổi toàn bộ nhân vật sang **Stickman 3D tối giản (Kiểu B: Đầu tròn + thân viên nang + tay chân ống mảnh)**; dùng chung 1 phôi thân/mặt, phân biệt bằng **tóc và quần áo**.

---

## 1. What — Phạm vi & Mục tiêu (Scope & Goals)

### Mục tiêu chính
1. **Thiết kế form chuẩn Stickman Base V1 (Kiểu B):**
   - Đầu tròn trơn nhẵn ($r = 0.14\text{ m}$), thân viên nang (capsule) thon gọn ($H = 0.50\text{ m}$), tay chân dạng ống trụ/con nhộng mảnh nhưng có thể tích và khớp cử động vững chắc.
   - Tổng chiều cao chuẩn: **$1.60\text{ m}$** (tương thích tuyệt đối với toàn bộ bối cảnh phòng trọ, cửa sổ, trần nhà, bàn ghế đã dựng).
2. **Thiết kế 5 nhân vật cụ thể cho Hồ sơ 02 & Series:**
   - **Nam (Bản thể thật):** Tóc đen rối bung anime-block; Áo phông cộc tay xanh rêu oversized (`#5c7a70`), quần lửng xám nhạt (`#707370`), dép lê xanh (`#425850`). Ngôn ngữ cơ thể: gù lưng, run rẩy, bất an, mệt mỏi, thuận tay phải.
   - **Người Kia (Bản sao):** Giống hệt 100% Nam về phôi, tóc và trang phục; phân định bằng dáng đứng thẳng tắp, tĩnh lặng cơ học (`calm`), 100% thuận tay trái, gáy rỉ nước lạnh dưới trăng/hoàng hôn.
   - **Tùng (Bạn cùng phòng):** Tóc vuốt nhọn năng động thể thao; Áo thun cam cổ tim viền trắng (`#d4673f`), quần đùi đen sọc trắng (`#2c3138`), giày thể thao năng động.
   - **Giảng viên (Phòng Lab 402):** Tóc rẽ ngôi chỉn chu, gọng kính đen tối giản; Áo sơ mi kem sáng (`#f3f0e6`) sơ vin, quần âu xanh than (`#2f3b53`), giày tây tối màu.
   - **Người Truy Vết (Xuyên series):** Áo hoodie/khoác ngoài màu than (`#2b2b2e`) viền đỏ trầm (`#801818`), quần túi hộp cargo rêu/xám, phong thái bí hiểm.
3. **Cập nhật hệ thống tài liệu trong Repo:**
   - `docs/QUY-CHUAN-STICKMAN.md`: Bổ sung thông số hình học Kiểu B, quy chuẩn rig và danh mục trang phục.
   - `episodes/hem-co-chuyen/THIET-KE-NHAN-VAT.md`: Cập nhật bảng nhận diện 5 nhân vật mới.
   - `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/ASSET.md`: Chuyển phôi mesh cũ (`dung_than_cage_nam.py`, `human-male-base-v1.glb`) sang mục tư liệu lịch sử; đưa Stickman Base làm nguồn hiện hành.
   - `what-if-studio/library/characters/stickman-base-v1/`: Tạo thư viện manifest và hướng dẫn modular.
4. **Viết script Blender Python tự động (`dung_stickman_cast.py`):**
   - Sinh phôi Stickman Base, module tóc cho từng nhân vật, trang phục capsule/bọc ngoài và gắn Armature Rig (IK tay chân, xương cột sống, xương đầu) sẵn sàng diễn hoạt.

### Non-Goals (Những việc không làm trong lượt này)
- Không chỉnh sửa kịch bản 103 shot hay thay đổi nội dung 51 câu thoại ElevenLabs đã duyệt.
- Chưa render trực tiếp animation hay video hoàn chỉnh (Blender chạy trên máy local của user).
- Không xóa bỏ các file mesh cũ (`.py`, `.glb`) nhằm bảo toàn lịch sử phát triển của repo.

---

## 2. Why — Bối cảnh & Lý do (Context & Rationale)

1. **Tối ưu hóa sản xuất (Production Efficiency):**
   - Việc dựng các mesh người/chibi giải phẫu chi tiết với 18 shape keys và hàng chục visemes quá tốn kém thời gian, dễ gây lỗi xuyên vải và biến dạng khớp (nách, háng, cổ).
   - Phong cách Stickman 3D tối giản (Kiểu B) vừa mang tính biểu tượng cao (iconic, dễ viral trên TikTok/YouTube), vừa giúp tập trung vào ánh sáng Chiaroscuro điện ảnh, góc máy thấu kính tâm lý (Fisheye, Snorricam, Split-Diopter) và diễn xuất hình thể.
2. **Tuân thủ chỉ đạo của Chủ repo ngày 17/11/2026 (`a83fb08`):**
   - Nhân vật stickman đơn giản, dùng chung dáng và mặt, chỉ phân biệt bằng tóc và trang phục.
   - Hồ sơ 02 xử lý hai nhân vật giống hệt nhau về bề ngoài, tạo cảm giác rợn ngợp (doppelgänger horror) sâu sắc hơn nhiều so với việc khác biệt màu da hay khuôn mặt.

---

## 3. How — Giải pháp Kiến trúc & Kỹ thuật (Architecture & Specs)

### 3.1. Hình học Stickman Base V1 (Kiểu B)
- **Đầu (Head):** UV Sphere trơn nhẵn (32 segments, 16 rings), bán kính $R = 0.14\text{ m}$. Tâm đầu tại $Z = 1.46\text{ m}$.
- **Cổ (Neck):** Trụ Cylinder ($R = 0.04\text{ m}$, $H = 0.08\text{ m}$), nối từ $Z = 1.28\text{ m}$ lên $1.36\text{ m}$.
- **Thân (Torso Capsule):** Khối viên nang bo tròn hai đầu:
  - Ngực/vai tại $Z = 1.25\text{ m}$ (rộng bán kính $0.12\text{ m}$).
  - Đáy chậu tại $Z = 0.78\text{ m}$ (rộng bán kính $0.10\text{ m}$).
- **Cánh tay & Cẳng tay (Arms):** Dạng ống cylinder bo góc bán kính $R = 0.035\text{ m}$, dài $0.55\text{ m}$. Bàn tay dạng khối bầu tròn tối giản kèm ngón cái tách biệt để cầm nắm đạo cụ.
- **Chân & Bàn chân (Legs & Feet):** Dạng ống cylinder bán kính $R = 0.045\text{ m}$, từ đùi ($Z = 0.75\text{ m}$) xuống mắt cá ($Z = 0.08\text{ m}$). Bàn chân nêm dẹt bo tròn dài $0.22\text{ m}$, đế phẳng tiếp xúc sàn $Z = 0$.

### 3.2. Cấu trúc Mô-đun (Modular Components)
```
[ Stickman_Base_V1 ] (Phôi chung: Đầu + Cổ + Thân + Tay + Chân + Rig)
        │
        ├── [ Module Tóc (Hair) ] (Gắn vào Head_Bone)
        │       ├── Hair_Nam_NguoiKia (Lọn khối anime-block rối)
        │       ├── Hair_Tung (Lọn nhọn thể thao vuốt dựng)
        │       ├── Hair_GiangVien (Rẽ ngôi 7/3 lịch sự + Gọng kính)
        │       └── Hair_TruyVet (Mũ trùm hoodie trùm đầu)
        │
        └── [ Module Trang Phục (Outfits) ] (Skinning theo Armature)
                ├── Outfit_Nam_Home (Áo phông xanh rêu oversized + Quần lửng xám + Dép)
                ├── Outfit_Tung_Sport (Áo thun cam viền trắng + Quần đùi đen + Giày)
                ├── Outfit_Lecturer (Áo sơ mi kem + Quần âu xanh than + Giày tây)
                └── Outfit_Tracker (Áo khoác than viền đỏ + Quần túi hộp)
```

### 3.3. Shader & Lookdev
- Sử dụng **Stylized Matte Clay / Cel-Shaded PBR** trong Blender:
  - Base Body: Màu trắng kem ngà (`#EAE6DF`), Roughness 0.65, SSS nhẹ 0.02.
  - Tóc: Đen tuyền nhám (`#1A1A1E`), Roughness 0.70.
  - Vải vóc: Bề mặt lì tự nhiên, không hoa văn rườm rà.

---

## 4. Alternatives Considered — Các Phương Án Đã Cân Nhắc

| Phương án | Ưu điểm | Nhược điểm | Kết luận |
|---|---|---|---|
| **Kiểu A: Stickman que mảnh hoàn toàn (Alan Becker 3D)** | Cực kỳ nhẹ, dễ animate | Rất khó mặc áo phông rộng/quần âu sinh động; khó gắn dép lê và thiếu chất điện ảnh Chiaroscuro | **Loại** |
| **Kiểu B: Đầu tròn + Thân viên nang + Tay chân ống (Được chọn)** | Dễ mặc đồ rời, tỷ lệ cơ thể đẹp, tương thích 100% bối cảnh $1.60\text{ m}$ hiện có | Cần tính toán độ ôm của áo/quần để không xuyên thân | **Chọn** (Đã được user phê duyệt) |
| **Giữ nguyên Phôi Chibi Chi Tiết 1,60m (`nam-003`)** | Đã có sẵn rig ngón tay và shape keys | Quá phức tạp, trái với quyết định stickman ngày 17/11 của chủ repo | **Lưu trữ làm tư liệu tham khảo** |

---

## 5. Success Criteria — Tiêu Chí Đánh Giá Hoàn Thành

1. [x] Đã khảo sát và làm rõ các lựa chọn với người dùng.
2. [x] Đã tạo Concept Sheet ảnh trực quan minh họa dàn nhân vật và tương phản Nam vs Người Kia.
3. [ ] Cập nhật đồng bộ các tài liệu trong repo: `QUY-CHUAN-STICKMAN.md`, `THIET-KE-NHAN-VAT.md`, `ASSET.md`, `README.md`.
4. [ ] Khởi tạo thư viện `what-if-studio/library/characters/stickman-base-v1/` kèm `manifest.json`.
5. [ ] Viết script Blender Python hoàn chỉnh (`dung_stickman_cast.py`) có thể chạy `blender --background --python` để tự động sinh toàn bộ dàn nhân vật Stickman Kiểu B kèm rig chuẩn.
