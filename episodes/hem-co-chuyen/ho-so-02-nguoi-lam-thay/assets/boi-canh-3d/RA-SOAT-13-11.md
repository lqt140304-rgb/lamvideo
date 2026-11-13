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

## Vòng rà thứ hai (chủ repo xem video 13/11 ~12:17) — 4 lỗi
| # | Lỗi (thời điểm video) | Nguyên nhân | Sửa |
|---|---|---|---|
| 1 | 0:11 `STEADI_RA_HL`: có khung nâu + giấy trắng "dính" lơ lửng ngay chỗ cánh cửa mở | Tờ lịch treo tường (`lich_khung`) đặt ở y 2,55–2,85 trên tường cửa, **lọt đúng khung cửa** (y 2,05–2,90) | Dời lên tường trước đầu giường; ẩn cùng tường trước khi máy ngoài phòng (hết hộp đen khi nhìn từ ngoài, ví dụ `WIDE`) |
| 2 | 0:35 `TT_GIUONG_PUSH`: nhìn xuyên tường thấy khoảng trống cạnh phòng | Hai bên phòng (y < 0 và y > 4) **không có nhà**, chỉ có tường hành lang | Dựng khối nhà đặc `env_khoi_sau/truoc` có mặt tiền hướng hẻm (cửa sổ, lồng sắt, máy lạnh); khối nào chứa camera thì ẩn khỏi tia camera (`an_khoi`); thêm ánh hắt xuống hẻm |
| 3 | 0:10 `HL_DOLLY`: hành lang ngắn, cuối bị cắt | Hành lang dừng ở y = 24, ngoài đó trống | Kéo dài tới y = 66 **giảm dần chi tiết** (`mo_rong`): ≤ 24 m đủ chi tiết; 24–40 m cửa + khuôn + tay nắm + song lan can + đèn; 40–66 m cửa/đèn đơn giản, lan can đặc; dãy đối diện tới y = 76 (cửa + cửa sổ phẳng); cột điện xa; tường cuối hành lang có cửa sổ lớn phát sáng + biển thoát hiểm; tường rào cuối sân dời tới y = 78; nhà cao tầng xa phía cuối sân |
| 4 | Toàn cảnh: hành lang tầng 3/mái "lơ lửng trong tường nhà", tường thiếu một mảng | Cùng gốc với #2: thân nhà bên cạnh phòng Nam không tồn tại, thấy xuyên sang nhà hẻm | Khối nhà đặc ở #2 lấp phần thiếu; tầng 1 và 3 phía hành lang kéo dài theo |

Còn lại (chưa xử lý): mép trắng cháy sáng nhẹ ở mặt tiền hẻm khi nhìn sát (TT_GIUONG_PUSH); video `xem-thu/video/chuoi-shot.mp4` **chưa render lại** sau các sửa này.

## Vòng rà thứ ba (chủ repo, ảnh chụp video ~12:17)
| # | Góp ý | Xử lý |
|---|---|---|
| 1 | Khối đen (mũi tên đỏ) ở tường phải khung rộng | Là mặt sau tờ lịch gắn tường trước (tường trước ẩn khi máy ngoài phòng): ẩn lịch cùng tường. Đã xử lý ở vòng 2; **video chưa render lại** nên vẫn còn trong bản cũ |
| 2 | Cầu thang/lan can chỉ là một đường thẳng, thiếu phần lan can "nổ" từ tường ra | Cầu thang làm lại: 17 bậc chạm sân (z −2,92), thành thấp bậc thang hai bên, thành sát tường, tay vịn **dốc** theo bậc + trụ + con tiện, trụ đầu/cuối thang (camera `DAU_NHA`) |
| 3 | Tay nắm cửa hơi cao, làm giống tay nắm hơn | Tay gạt cao 0,98 m (cũ 1,2 m): hoa bo tròn + cổ + cần gạt hai mặt cánh; ổ khóa phụ cao 1,12 m với tay vặn bên trong và ổ chìa bên ngoài; chốt hạ theo. Cửa các phòng hành lang cũng thành hoa + cần gạt. Camera `TAY_NAM`, `TAY_NAM_NGOAI`, `C05` |
| 4 | Ngoài cửa sổ cũng thế, làm chi tiết hơn | Dựng ban công nhà hàng xóm **đối diện cùng độ cao** (lan can có con tiện, chậu cây + hoa, dây phơi + quần áo 5 màu, ghế nhựa, lồng chim, mèo, cửa kính trượt có rèm), mái hiên tôn, biển "cho thuê phòng", chảo ăng-ten, bể nước, máy lạnh, dây điện và dây đèn chằng ngang hẻm, xe máy/thùng rác/chậu cây/vũng nước dưới hẻm. Kính cửa sổ trong hơn (93%) để nhìn ra thấy rõ. Camera `CUA_SO` |
Chưa xác định được chỗ "vạch trắng thẳng" ở ảnh thu nhỏ thứ hai (một dải đứng có vạch trắng giữa) — cần tên camera/giây trong video.

## Vòng rà thứ tư
- **Cầu thang tầng 1:** chủ repo xác nhận tốt, giữ nguyên.
- **Tầng 2/3, phần hở đầu nhà:** thêm lan can che — mép sàn tầng 3 nhô ra trên cầu thang (thành thấp + tay vịn + con tiện, 3 mặt), chiếu nghỉ tầng 2 (trụ hai bên + dầm cổng). Camera `DAU_NHA`.
- **Tường ngoài trống:** thêm 5 kiểu tranh đường phố (`tranh_tuong` trong `moi_truong.py`): làng quê (mặt trời, đồi, sông, thuyền, diều), hoa sen, phố xe máy, graffiti trừu tượng, mặt cười. Đặt ở tường đầu nhà hướng sân (4 tranh), tường rào đầu sân (2) và tường nhà hàng xóm bên hẻm (3). Mỗi tranh là các hình phẳng xếp lớp (chưa phải ảnh thật; muốn tranh thật thì cần cung cấp ảnh/texture có quyền sử dụng).
