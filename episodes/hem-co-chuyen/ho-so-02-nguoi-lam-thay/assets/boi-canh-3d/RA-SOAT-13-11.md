# Rà soát lỗi 13/11 08:00 (39 camera tĩnh + shot chuyển động)

Cách rà: `chay_ra_soat.sh` render 39 camera ở 480 px/12 mẫu (≈4 phút nhờ dựng cảnh nhanh), ghép bảng `xem-thu/RA-SOAT-1..3.jpg`, xem từng ảnh; shot chuyển động xem khung rời. `kiem_goc_quay.py` chạy lại trên môi trường mới (30 giây).

## Trước: 14 lỗi đã biết/phát hiện
| # | Lỗi | Trạng thái |
|---|---|---|
| 1 | Ô đen nhỏ ở góc kệ sách bàn học + tủ (mặt trùng nhau) | **Sửa** (lệch mặt kệ khỏi trụ; hết chấm đen ở DESK/A05/P203) |
| 2 | Mảng trắng cháy sáng ở hẻm (TT_GIUONG) | **Sửa một phần** (sàn + tường hẻm tối hơn); vẫn còn mảng sáng nhẹ ở góc trái |
| 3 | P201VENT chưa có khe thông gió | **Sửa** (8 nan ngang trên cánh cửa; xem xuyên khe được) |
| 4 | Dải đen mép tường ở TOP (cutaway) | **Sửa** (trần ẩn khỏi mọi loại tia) |
| 5 | Camera A03 nhìn nhầm hướng | **Sửa** (arc sau vai Nam nhìn về bếp) |
| 6 | Submersion (camera trong gương) còn đen | **Sửa** (màng nước trong suốt + sóng + sắc sai; Nam lọt qua) |
| 7 | Nền sau kính nước gỗ nâu | **Sửa** (xanh lục lam có chiều sâu) |
| 8 | Cây khối tròn | **Sửa một phần** (thêm 4 cành chính + 14 cụm lá nhỏ nhiều tông) |
| 9 | Trời trắng phẳng, chưa có trăng | **Sửa một phần** (đã có trăng đêm ở chân trời; chưa thấy trong khung nào) |
| 10 | RACK_FOCUS_BAN lệch khung: khung đầu chưa thấy lưng ghế | **Còn**: lưng ghế chỉ là mảng xanh mờ ở góc dưới phải; cần nhân vật/khung lại |
| 11 | A04/A04B chỉ phông nền | **Còn** (chờ nhân vật) |
| 12 | `kiem_goc_quay.py` chưa chạy lại | **Xong**; đã tách cỡ toàn thân (WIDE, BED, LOW, TT_*) khỏi cỡ trung (DOOR, KITCHEN, GUONG*, A01, A02B, A03, C06, ORBIT_*) nên không còn cảnh báo sai |
| 13 | CUA_SO: cột đen dày giữa khung | **Còn** (cột cửa sổ + rèm sát máy; cần dời máy khi dựng shot thật) |
| 14 | HALL_DOOR: vùng trời trắng phẳng bên trái | **Còn** (cần mây/độ chuyển sắc rõ hơn khi nhìn ngang) |

**Kết quả: 14 lỗi → 6 sửa hẳn, 4 sửa một phần, 4 còn** (khung rack, phông A04/A04B chờ nhân vật, cột cửa sổ CUA_SO, trời trắng HALL_DOOR). Trong đó "sửa một phần" = đã cải thiện nhưng chưa xem là hoàn thiện.

## Không phát hiện
- Thiếu tường/hở nền/xuyên tường: duyệt 39 ảnh và kiểm bằng code (đồ phòng nằm ngoài [0,W]×[0,D] hay z<0) không thấy chỗ nào. Nếu chủ repo thấy một chỗ cụ thể nào, cần tên camera/khung để xử lý.

## Ghi chú kỹ thuật
- Dựng cảnh 182 s → ~6 s (bỏ `bpy.ops`); cache vật liệu `moi_truong` xoá mỗi lần dựng.
