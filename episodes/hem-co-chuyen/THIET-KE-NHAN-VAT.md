# The Crack in Reality — Nhận diện Nhân vật 3D

**Quyết định hiện hành — 17/11/2026:** Toàn bộ nhân vật chuyển sang **Stickman 3D tối giản (Kiểu B: Đầu tròn + Thân viên nang + Tay chân ống mảnh)**; dùng chung dáng và khuôn mặt, chỉ phân biệt tạo hình bằng **tóc và quần áo**. Chi tiết xem tại [Quy chuẩn Stickman](../../docs/QUY-CHUAN-STICKMAN.md) và [Design Spec](../../docs/superpowers/specs/2026-11-17-thiet-ke-nhan-vat-stickman-design.md).

Dùng cùng [quy chuẩn 3D](../../docs/QUY-CHUAN-3D.md) và [mỹ thuật chung](../../docs/PHONG-CACH-MY-THUAT.md). Chiều cao chuẩn hóa **1,60 m** khớp hoàn toàn không gian phòng trọ 3D.

---

## 1. Dàn nhân vật Hồ sơ 02 & Toàn series

### A. Nam (Bản thể thật)
- **Tạo hình:** Đầu tròn trơn nhẵn, tóc mảng khối anime-block đen rối bù phủ trán và gáy.
- **Trang phục:** Áo phông cộc tay xanh rêu oversized (`#5c7a70`), quần lửng xám nhạt (`#707370`), dép lê xanh sẫm (`#425850`).
- **Ngôn ngữ cơ thể:** Dáng đứng hơi gù, vai co rút, biểu hiện mệt mỏi, bất an, hoảng loạn.
- **Quy tắc bất di bất dịch:** **100% thuận tay phải** trong mọi thao tác (cầm bút, bấm điện thoại, vung búa).

### B. Người Kia (Bản sao trong gương)
- **Tạo hình:** Giống hệt Nam 100% về kích thước, khối đầu, tóc rối và trang phục thường nhật.
- **Ngôn ngữ cơ thể:** Đứng thẳng tắp, tuyệt đối tĩnh lặng, điềm tĩnh cơ học (`calm`), ánh nhìn bất động, nụ cười bí hiểm.
- **Quy tắc bất di bất dịch:** **100% thuận tay trái** (phản chiếu gương: bưng nước ấm, rửa bát, đỡ búa, gài then sắt). Thân nhiệt lạnh ngắt, gáy và vai có vết nứt rỉ nước lạnh dưới trăng.

### C. Tùng (Bạn cùng phòng)
- **Tạo hình:** Tóc ngắn vuốt dựng nhọn (spiky) thể thao, khỏe khoắn.
- **Trang phục:** Áo thun thể thao màu cam cổ tim viền trắng (`#d4673f`), quần đùi đen sọc trắng (`#2c3138`), giày chạy bộ thể thao.
- **Tính cách & Dáng điệu:** Tháo vát, tốt bụng, bước đi dứt khoát nhanh nhẹn.

### D. Giảng viên (Phòng Lab 402)
- **Tạo hình:** Tóc rẽ ngôi 7/3 gọn gàng, gọng kính cận đen tối giản.
- **Trang phục:** Áo sơ mi kem sáng có cổ (`#f3f0e6`) sơ vin, quần âu xanh than (`#2f3b53`), giày tây.
- **Phong thái:** Nghiêm nghị, đĩnh đạc, đứng lớp chuyên nghiệp.

### E. Người Truy Vết (Nhân vật xuyên series)
- **Tạo hình:** Nam khoảng 20 tuổi, tóc hơi dài lòa xòa hoặc trùm mũ hoodie bí hiểm.
- **Trang phục:** Áo khoác/hoodie ngoài màu xám than (`#2b2b2e`) viền đỏ trầm (`#801818`), quần túi hộp cargo rêu/xám bụi bặm, thắt lưng ôm có túi dụng cụ.
- **Phong thái:** Quan sát, suy luận, thu thập manh mối thực thể vết nứt.

---

## 2. Dàn nhân vật quần chúng (Background Crowd Cast)

Nhân vật nền phục vụ các phân cảnh giảng đường Lab 402, hành lang, khu trọ và hẻm phố:

### F. Sinh viên Nam (Quần chúng) — `qc_sinhvien_nam`
- **Tạo hình:** Tóc ngắn gọn gàng (`#1e1e22`), da sáng tự nhiên (`#f0cbb2`), biểu cảm thư thái tự nhiên (`neutral_calm`).
- **Trang phục:** Áo thun xanh biển (`#5a7896`), quần jeans sẫm (`#3b4656`), giày thể thao năng động.

### G. Sinh viên Nữ (Quần chúng) — `qc_sinhvien_nu`
- **Tạo hình:** Tóc bob nâu ôm cằm thanh lịch (`#261e1c`), da sáng hồng (`#f4d5c0`), biểu cảm tươi tắn tự tin (`confident`).
- **Trang phục:** Áo dài tay hồng pastel (`#c98a82`), quần âu tối màu (`#333842`), giày đế trắng.

### H. Chú Bảo vệ (Quần chúng) — `qc_baove`
- **Tạo hình:** Mũ bảo vệ xanh navy có vành lưỡi trai (`#223042`), da ngăm khỏe khoắn (`#d9a484`), biểu cảm nghiêm nghị chuyên nghiệp (`serious`).
- **Trang phục:** Áo sơ mi đồng phục có cúc ngực (`#3d5a73`), quần âu bảo vệ sẫm màu (`#232830`), giày da đen.

### I. Hàng xóm (Quần chúng) — `qc_hangxom`
- **Tạo hình:** Tóc búi cao tròn sau gáy (`#222024`), da trung tính ấm (`#e5bca2`), nét mặt đôn hậu (`neutral_calm`).
- **Trang phục:** Áo cardigan nâu be (`#7c6a58`), quần dài xám (`#56595e`), dép lê sinh hoạt.

---

## 3. Dàn nhân vật phụ đặc trưng Việt Nam (Vietnamese Street & Neighborhood Cast)

Dàn nhân vật đời sống đậm chất đường phố hẻm nhỏ và khu trọ bình dân Việt Nam, giúp bối cảnh không bị trùng lặp và tăng tính chân thực:

### J. Tài xế Xe ôm Công nghệ — `vn_xeom_congnghe`
- **Tạo hình:** Mũ bảo hiểm nửa đầu màu xanh lá (`#1e6b37`) viền cao su đen chống va đập, quai cài cằm đen chữ Y ôm cằm; da ngăm khỏe khoắn (`#d8a280`), vẻ mặt năng động (`confident`).
- **Trang phục:** Áo khoác dù chống nắng màu xanh lá đặc trưng công nghệ (`#1b7a3e`), khóa kéo kim loại ngực, dải phản quang bạc xám chạy ngang ngực; quần jeans dài đen sẫm (`#22252a`), giày thể thao vải tiện di chuyển.

### K. Cô Bán quán / Gánh hàng Vỉa hè — `vn_banhang_viahe`
- **Tạo hình:** Nón lá chóp nón truyền thống bằng lá rơm vàng ngà (`#d4b270`) chao nghiêng nhẹ, quai nón vải lụa mềm vắt cằm; tóc búi cuộn gọn bên trong nón; da bánh mật rám nắng ấm áp (`#c8926e`), nụ cười đôn hậu xởi lởi (`friendly_smile`).
- **Trang phục:** Áo bà ba truyền thống màu vàng nâu đất (`#966838`) dáng cộc tay mát mẻ, tạp dề vải thô màu be tro (`#a89f91`) buộc ngang thắt lưng có túi trước; quần đen lụa ống rộng (`#1e1f22`), dép tổ ong trắng ngà (`#e8e4dc`).

### L. Cô Chủ Nhà Trọ — `vn_chutro`
- **Tạo hình:** Tóc búi bới cao kẹp càng cua nhựa hổ phách bóng (`#964818`); da trắng hồng trung niên (`#eec2a8`), nét mặt sắc sảo tinh tường nhưng chu đáo (`calm`).
- **Trang phục:** Áo kiểu hoa cà trung niên màu tím hồng mận nhạt (`#7a405a`) cộc tay; quần âu thun ống suông màu xám tro (`#3c3e44`); túi bao tử da đen (`#1a191b`) đeo chéo hông đựng tiền kèm chùm chìa khóa phòng trọ kim loại vàng lủng lẳng (`#d4af37`), dép lê quai ngang êm chân.

### M. Bác Xe ôm Mũ cối / Cựu binh — `vn_bac_mucoi`
- **Tạo hình:** Mũ cối quân đội vành tròn màu xanh lá rêu lính (`#35482e`) kèm núm thông gió đỉnh mũ; da ngăm sương gió (`#bd8662`), vẻ mặt thâm trầm từng trải (`serious`).
- **Trang phục:** Áo sơ mi kaki lính màu xanh rêu bạc (`#4d5843`) có 2 nắp túi áo có cúc ngực; quần kaki lính ống đứng (`#384232`); dép cao su quai chéo kiểu Bác Hồ (`#1b1c1e`).

---

## 4. Nguồn Asset 3D hiện hành

- Nguồn sinh nhân vật chuẩn là `dung_stickman_cast.py` (hỗ trợ cờ `--character all`, `--character crowd`, và `--character vn_crowd`).
- File Blender đã xuất:
  - `stickman_cast.blend`: Dàn 5 nhân vật chính (Nam, Người Kia, Tùng, Giảng viên, Người Truy Vết).
  - `stickman_crowd.blend`: Dàn 4 nhân vật quần chúng sinh viên, bảo vệ, hàng xóm.
  - `stickman_vn_crowd.blend`: Dàn 4 nhân vật phụ đường phố & khu trọ Việt Nam (Tài xế công nghệ, Cô bán hàng vỉa hè, Cô chủ trọ, Bác mũ cối).
- Các file mesh cũ (`nam-002`, `nam-003`, `dung_than_cage_nam.py`, `human-male-base-v1.glb`) được bảo toàn làm tư liệu lịch sử, không dùng làm phôi sản xuất mới.

