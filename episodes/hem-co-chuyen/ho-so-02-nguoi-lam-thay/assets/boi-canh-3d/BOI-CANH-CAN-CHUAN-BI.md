# Bối cảnh và đạo cụ còn cần chuẩn bị (rà kịch bản 13/11/2026)

Nguồn đối chiếu: [KICH-BAN.md](../../KICH-BAN.md), [PHAN-01](../../PHAN-01-NGUOI-TRONG-PHONG.md), [PHAN-02](../../PHAN-02-QUEN-DUOC-LAM-THAY.md), [PHAN-03](../../PHAN-03-NGUOI-BI-THAY-THE.md), [CHECKLIST-TIEN-KY-ASSET.md](../../CHECKLIST-TIEN-KY-ASSET.md) (12 bối cảnh S01–S12, 12 đạo cụ P01–P12, 7 màn hình UI), [DUNG-CANH.md](../../DUNG-CANH.md). So với những gì đã có trong Blender (`assets/boi-canh-3d/`).

## 1. Bối cảnh (S01–S12)
| Mã | Cảnh trong kịch bản | Trạng thái Blender | Còn cần |
|---|---|---|---|
| S01–S04 | Phòng trọ: sáng sớm / trưa gắt / chiều tà / đêm Fincher | **Đã có hình học đủ 4 tường + trần**, 2 chế độ sáng (ngày, đêm laptop xanh) | **2 trạng thái ánh sáng còn thiếu:** sáng sớm (nắng xiên xanh lạnh qua khe rèm) và chiều tà Golden Hour (vệt cam trườn từ bàn sang nệm). Trưa gắt: vệt nắng hình chữ nhật lên mặt bàn/phím (cần kiểm hướng sun). Đèn bàn 3200K (đã có thân đèn, chưa có nguồn sáng thật). Chuyển cảnh giữa các giờ (keyframe màu/hướng sun, `visible` của đèn) |
| S05 | Góc cửa + **then sắt** | Cửa, khoá + tay nắm thật; then sắt chỉ có chốt nhỏ cũ | **Then sắt trượt 2 trạng thái** (rút / tra sâu vào tai khóa): đã dựng mô hình ở `dao_cu_3d.then_sat`, cần gắn lên cánh cửa thật và keyframe trượt + âm. Mắt thần/khe thông gió: khe đã có |
| S06 | Hành lang trọ tầng 2, đêm tuýp vàng lập lòe | **Đã có** (24,6 m + 66 m giảm chi tiết, 8 cửa riêng, cầu thang, lan can, sân, dãy đối diện, hẻm, chân trời, ngày/đêm) | Đèn tuýp **lập lòe** (keyframe cường độ), sương ẩm đêm (volume nhẹ), âm vang hành lang |
| S07 | **Góc đồ cho tặng** (chân cầu thang, chiều muộn sau mưa) — nơi Nam nhặt chiếc gương | **Chưa dựng** | Đống đồ cũ (ghế gãy, chậu vỡ, bạt nhựa) + tờ "Ai cần cứ lấy" + gương cũ bụi dựa tường; sàn ướt (vũng nước, bóng loáng), mưa thưa, trời xám. Dựng ở chân cầu thang có sẵn (y ≈ −5, x ≈ −1,5…0) |
| S08 | **Giảng đường bậc thang** (đèn tuýp trắng lạnh), bục giảng, bảng phấn, màn chiếu | **Chưa dựng** (ngoài phạm vi 12/11: chỉ phòng + hành lang) | Bậc ghế sinh viên, bục gỗ, bảng, máy chiếu; đèn tuýp trắng 6500K; camera crane từ trần (P3.01); viên phấn gãy (có sẵn) |
| S09 | **Lab 402** (máy tính, màn LCD) | **Chưa dựng** | Dãy bàn + màn hình có UI "hạn nộp"; ánh sáng văn phòng |
| S10 | **Hành lang trường** nắng gắt, cột bê tông | **Chưa dựng** | Cột bê tông + bóng vuông, sân trường; camera Steadicam chạy lùi (P3.02) |
| S11 | **Mâm cơm quê** (clip Zalo trong điện thoại) | **Chưa dựng** | Chiếu hoa, mâm nhôm, nem, canh cua; ghi qua camera điện thoại (texture video trên màn hình điện thoại) |
| S12 | **Thế giới trong gương** (Deep Teal Abyss, sàn nước) | **Cơ chế đã có**: gương thật + cờ tia, kính hóa nước, camera Submersion; **chưa có "phòng gương"** riêng | Sương Deep Teal (volume), sàn nước phản chiếu (Glossy + Wave bump), bản phòng đối xứng cho Người Kia đứng; cân nhắc dùng chính phòng trọ đảo gương |
| (khác) | Sân bóng, góc cắt tóc (chuỗi Comic P2.05) | **Chưa dựng** | Nếu giữ trong cut 15 phút: 2 cảnh đơn giản, có thể là panel 2D |

Thứ tự khuyên dựng tiếp (đúng độ ưu tiên kịch bản): **S01–S04 ánh sáng (4 trạng thái)** → **S07 góc đồ cho tặng** (mở truyện, gieo chiếc gương) → **S12 thế giới gương** (P3.05) → **S08 giảng đường** (P3.01) → S10 → S09 → S11.

## 2. Đạo cụ (P01–P12) và màn hình (UI-01…07)
Bảng trưng bày: `xem-thu/DAO-CU-3D.png` (script `dao_cu_3d.py`; mỗi vật có điểm neo `grip_*`).
| Mã | Đạo cụ | Trạng thái |
|---|---|---|
| P01 | Chiếc gương (4 trạng thái) | Gương + khung + cổng gương + kính nước **có**; còn mờ sương/nứt góc phải (trạng thái 2), lớp cảnh cuối |
| P02 | Búa đinh cán gỗ | **Mới dựng** (cán gỗ, đầu búa, móng nhổ đinh, gỉ) |
| P03, P04 | Thẻ CCCD, thẻ sinh viên | **Mới dựng** (khung thẻ, chip, ảnh, nốt ruồi trái/phải, dây đeo) — còn chữ thật + ảnh chân dung (texture) |
| P05 | Then sắt | **Mới dựng**, 2 trạng thái |
| P06 | Phong bì 3 triệu | **Mới dựng** (phong bì + 6 tờ xanh) |
| P07 | Bát sứ + đũa bồn rửa | **Mới dựng** (bát viền xanh, họa tiết hoa, bọt xà phòng, đũa); bồn rửa/giá bát đã có; còn nước chảy, giọt rỏ |
| P08 | Hộp cơm sườn trứng ốp la | **Mới dựng** |
| P09 | Bún chả + nem + nước mắm | **Mới dựng** |
| P10 | Gói xôi gấc lá chuối + giò | **Mới dựng** |
| P11 | Túi hoa quả | **Mới dựng** |
| P12 | Viên phấn gãy | **Mới dựng** (+ bột phấn) |
| (13 đạo cụ khác) | PC, thau đồ, bóng, kéo, góc đồ cho/tặng | Chưa dựng |
| UI-01…07 | Màn hình điện thoại/laptop | Điện thoại + màn hình **có** (khung + phát sáng); **chưa gắn ảnh UI** — dùng PNG sẵn có trong `assets/bo-sung-15p/` làm texture phát sáng; Laptop đã có màn hình |
Chưa làm cho đạo cụ: vật liệu chi tiết (chữ trên thẻ, tem, logo), điểm neo `Child-Of` vào xương tay (cần nhân vật Modular), trọng lượng/vật lý rơi (búa rơi, xôi hất, phấn gãy).

## 3. Hoạt cảnh và kỹ xảo bối cảnh cần chuẩn bị
- Cửa: mở/đóng theo `door_open` keyframe (đã có tham số), then sắt trượt, va đập cửa.
- Ghế 4 chân kéo/lùi có va chạm (đã có `chair_rot`, chưa có va chạm thật); quạt quay (`fan_angle` có, chưa keyframe); rèm lay.
- Ánh sáng theo giờ (S01–S04), đèn bàn bật/tắt, đèn tuýp hành lang lập lòe, màn hình laptop đổi nội dung.
- Nước: bồn rửa chảy, mưa ở S07; sàn nước ở S12.
- Giá trị camera đã chuẩn bị: 17 shot + camera tĩnh; còn shot cho S07–S12 khi các bối cảnh có.

## 4. Việc phụ thuộc nhân vật 3D
Nam / Người Kia / Tùng (Modular) chưa vào cảnh nên chưa kiểm được: chiều cao 1,60 m so với cửa/ghế, điểm neo đạo cụ, va chạm tay–đồ vật, khung hình có người thật.

## 5. Chi tiết đạo cụ đã thêm (13/11 chiều) — `dao_cu_3d.py`
- **Chữ/UI thật:** chữ số 7 đoạn (`digit`, `text_line`) cho "2007" trên thẻ, "500" trên tờ tiền, màn hình điện thoại **06:30** (nút Báo lại/Dừng, viền rung đỏ), **Zalo** (tiêu đề xanh, 5 bong bóng chat, ô nhập), **điểm 9.5**.
- **Thẻ CCCD/SV:** quốc huy hoặc logo trường, dải tiêu đề, chip + vân chip, ảnh chân dung (vai, đầu, tóc), nốt ruồi trái/phải đúng kích thước, QR/vạch, dải ánh kim; thẻ SV có dây đeo + kẹp.
- **Búa:** vân gỗ + chỗ cầm mòn bóng, đuôi cán, nêm chốt đầu, mặt đập sáng, khe móng, gỉ lốm đốm.
- **Phong bì:** tiền polyme có cửa sổ trong suốt + dải đỏ + mệnh giá, mép nhăn, dải keo, dòng chữ viết tay.
- **Điện thoại:** viền kim loại, đảo camera, cụm 4 ống kính, nút nguồn/âm lượng.
- **Bát sứ:** chân đế, 10 bông hoa xanh (5 cánh + nhụy), mẻ miệng, 12 bọt xà phòng, giọt nước chảy.
- **Hộp cơm:** nắp mở, ngăn, hạt cơm, sườn có vết cháy + đầu xương, trứng có rìa vàng giòn + bóng sáng, dưa chuột/chua, mỡ hành.
- **Bún chả:** sợi bún, rau thơm, chả cháy, cà rốt/su hào ngâm, tỏi ớt, nem cắt đôi thấy nhân.
- **Xôi gấc:** gân lá chuối, mép hơ lửa xém, ~40 hạt xôi, hạt gấc, dây lạt buộc, giò lụa có lớp lá bọc.
- **Túi quả:** nhãn, nếp gấp giấy, miệng vênh, quả có cuống + lá + điểm sáng.
- **Phấn:** mảnh vụn nhọn, bột, giẻ lau bảng. **Then sắt:** đinh vít + rãnh, lỗ xỏ thanh, vệt mòn sáng, gỉ, lỗ tai khóa.
- **Lưu ý toạ độ:** vì thế giới là phản chiếu của toạ độ thiết kế (x đảo) và camera phòng nhìn về −y, chữ/giao diện phải lật y (`lat_y`) thì mới đọc xuôi khi nhìn từ ghế ngồi; đã áp dụng cho thẻ, phong bì, điện thoại trong bảng trưng bày. Khi đặt vào cảnh, bọc bằng `lat_y` như `bang_dao_cu`.
