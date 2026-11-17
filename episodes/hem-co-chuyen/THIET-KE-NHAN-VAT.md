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

## 2. Nguồn Asset 3D hiện hành

- Nguồn sinh nhân vật chuẩn là `dung_stickman_cast.py` và thư viện `what-if-studio/library/characters/stickman-base-v1/`.
- Các file mesh cũ (`nam-002`, `nam-003`, `dung_than_cage_nam.py`, `human-male-base-v1.glb`) được bảo toàn làm tư liệu lịch sử, không dùng làm phôi sản xuất mới.
