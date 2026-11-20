# Đầu trọc, ngón tay, vai — Kế hoạch dựng

> **Dành cho agent thực hiện:** dùng superpowers:executing-plans. Các bước có ô đánh dấu `- [ ]`.

**Mục tiêu:** tạo lưới nền đầu trọc từ NHAN-VAT-GOC-001, thêm xương ngón tay và giảm nếp ở vai cho rig thử.

**Cấu trúc:** `dau_troc.py` đọc file nguồn và khuôn FBX trọc, rồi ghi ra `nhan-vat-goc-troc.blend`. Sau đó `rig_goc.py --src nhan-vat-goc-troc.blend` dựng rig: phần thân như cũ, thêm ngón tay và xương phụ vai.

**Công cụ:** Blender 5.2.3 (`bpy`), numpy.

**Thiết kế:** [THIET-KE-DAU-TROC-NGON-VAI.md](THIET-KE-DAU-TROC-NGON-VAI.md)

## Ràng buộc chung

- Không sửa `../nhan-vat-goc.blend`. Không đưa file `.blend` tạo ra lên Git.
- Mặt giữ nguyên texture, không làm mất nốt ruồi. Đường nối giữa da đầu và trán hoặc gáy không được lộ.
- Dáng nghỉ lệch dưới 0,5 mm so với lưới nền trọc.
- Quy ước rig: mặt hướng −Y, bên trái nhân vật là +X và mang đuôi `.L`.

## Những điểm cần soi kỹ

1. **Phần trán dưới mái tóc chưa có da:** khi soi ảnh, trán phải kín và tròn.
2. **Mép tai dính tóc:** sau khi xóa tóc, tai không được thủng hay khuyết.
3. **Vùng tóc nhận sai:** lông mày và nốt ruồi cũng tối màu. Ngưỡng nhận tóc phải giới hạn theo độ cao z, và phải kiểm lại bằng ảnh mặt.
4. **Ngón chạm nhau:** khi xòe tay, da ngón này không được dính sang ngón bên cạnh.
5. **Thanh nắm tay:** khi `nam = 1`, ngón không được xuyên vào lòng bàn tay quá sâu.

---

### Việc 1: `dau_troc.py`, tạo lưới nền đầu trọc

**Tệp:** tạo mới `dau_troc.py` và `../nguon/dau-troc-tham-chieu.fbx`; sửa `../nguon.json`.

**Đầu ra:** `nhan-vat-goc-troc.blend`, chứa object `model_LOD0` và vật liệu da cho da đầu.

- [ ] Chép file FBX vào `nguon/`, ghi SHA-256 vào `nguon.json`.
- [ ] Viết script theo các bước của thiết kế: căn khuôn bằng ICP trên vùng mặt, tai và cổ → tìm vùng tóc theo màu và độ cao z → xóa → lấp lỗ → ép lưới theo khuôn → làm mượt dải nối → tô màu da.
- [ ] Kiểm tra: script in ra sai số ICP, số mặt bị xóa, và kết quả "lỗ kín" (không còn cạnh biên ở vùng đầu).
- [ ] Soi ảnh đầu từ trước, bên, sau, trên và chéo 3/4. Đạt khi không thấy tóc, trán kín và nốt ruồi còn.
- [ ] Commit.

### Việc 2: ngón tay trong `rig_goc.py`

- [ ] Đếm số ngón và đo đường giữa từng ngón trên lưới. Ghi các điểm vào bảng `FINGERS`.
- [ ] Mỗi ngón ba đốt; thêm thuộc tính `nam` trên `hand.L/R` để driver lái việc nắm tay; đặt các xương ngón vào bone collection `Ngon`.
- [ ] Gán trọng số ngón: mỗi ngón có vùng riêng.
- [ ] Thêm dáng `nam_tay`, `xoe_tay`, `chi_tay`. Kiểm số đo giãn cạnh và soi ảnh cận bàn tay.
- [ ] Commit.

### Việc 3: vai trong `rig_goc.py`

- [ ] Thêm xương `vai_phu.L/R` có biến dạng, Copy Rotation từ `upper_arm` với mức ảnh hưởng 0,5.
- [ ] Chia trọng số vùng khớp vai cho xương này; làm mượt rộng hơn ở dải nách và bả vai.
- [ ] Đạt khi dáng `gio_tay_cao` (150°) có độ giãn tối đa thấp hơn nhiều so với 8,3× và ảnh không còn nếp sâu.
- [ ] Cập nhật README và ảnh bảng dáng. Commit và push.
