# Đắp lại tay, tay mập vừa, vá nách mịn — Kế hoạch

> **Dành cho agent thực hiện:** dùng superpowers:executing-plans. Các bước có ô `- [ ]`.

**Mục tiêu:** vai, bắp tay và cả cánh tay đầy đặn hơn bản gốc khoảng 5%, vùng vá nách mịn, rãnh trước nách được cắt.

**Cấu trúc:** thêm `thicken_arm()` và chỉnh `to_a_pose()` / `rebuild_armpit()` trong `rig_goc.py`. Độ dày gốc lấy từ chỉ số đỉnh trùng nhau giữa lưới tay buông và lưới đã dang 80° (trước khi cắt).

**Công cụ:** Blender 5.2.3 (`bpy`), numpy.

**Thiết kế:** [THIET-KE-TAY-DAY.md](THIET-KE-TAY-DAY.md)

## Ràng buộc chung

- Không sửa file nguồn. Dáng nghỉ lệch dưới 0,5 mm so với lưới nền. Ngón và nắm tay vẫn chạy.
- Số cạnh giãn quá 2 lần ở giơ 140° không vượt bản hiện tại (16).

## Điểm cần soi kỹ

1. Đỉnh tay sát thân bị đẩy xuyên thân khi phình. Soi ảnh nách ở 80° và 140°.
2. Cổ tay nhảy bậc khi phình dừng đột ngột. Soi tay từ trước và trên.
3. Bàn tay phình theo. Chỉ áp dụng trước cổ tay.
4. Vai bên phải lệch với bên trái. So hai bên.
5. Lớp vá thủng sau khi cắt rộng hơn ở mặt trước.

### Việc 1: `thicken_arm()` và gọi trong `to_a_pose()`

**Tệp:** sửa `rig_goc.py`.

**Giao diện:** `thicken_arm(P, co0, arm_mask, poly0, poly1, he_so=0.05) -> np.ndarray` trả tọa độ mới, hai bên phải dùng gương x. In ra tỉ lệ bán kính trung bình theo 10 đoạn.

- [ ] Đắp lại: mỗi đỉnh vùng tay giữ hướng từ trục, bán kính bằng bán kính gốc (đo ở lưới tay buông, cùng chỉ số).
- [ ] Phình `he_so` = 0,05, giảm mượt về 0 ở 8% chiều dài gần vai và gần cổ tay; không áp dụng sau cổ tay.
- [ ] Gọi trước khi gán tọa độ vào lưới và trước vá nách.
- [ ] Chạy, đọc tỉ lệ: vai–bắp tay ≥ 1,0; giữa tay ≈ 1,05.

### Việc 2: vá mịn và cắt rãnh trước nách

- [ ] `edge_len` 0,004 → 0,003; giảm làm mượt cả vùng vai 0,35 → 0,15, giữ làm mượt theo vùng tiếp xúc.
- [ ] Nới vùng cắt ở mặt trước nách (y < 0): `CUT_D` + 8 mm, z đến 0,95.
- [ ] Chạy, xem ảnh nách ở 80°, 105° và 140°.

### Việc 3: kiểm tra, ghi tài liệu, đẩy

- [ ] Đo độ dày theo 10 đoạn so với bản gốc. Chạy 12 dáng thử, so với bản hiện tại.
- [ ] Cập nhật README, ảnh vai và bảng dáng. Commit và push.
