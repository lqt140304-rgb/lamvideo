# Diễn thử NAM-003 trong phòng trọ (Hồ sơ 02) — 17/11/2026

Thử đặt nhân vật nam NAM-003 (rig `assets/nhan-vat-3d/nam-003/nam-003-rig.blend`) vào bối cảnh Blender phòng trọ (`../boi-canh-3d/xay_phong_tro.py`, chế độ **đêm**, laptop xanh là nguồn sáng chính) và diễn một đoạn ngắn tự dựng: **Nam từ hành lang bước vào, đi tới bàn, quay mặt vào bàn, kéo ghế ngồi xuống, hai tay đặt lên bàn** (7,9 s ở 24 fps; ý các cảnh G/H và shot C06/DESK trong `../boi-canh-3d/DANH-SACH-SHOT.md`, chưa phải một cảnh đã duyệt trong kịch bản).

| File | Việc |
|---|---|
| `dien_thu_nam003.py` | Dựng phòng, append Nam_Body + Nam_Rig, dựng chuyển động, render. `--khung 0,4,8…` `--mau` `--rong` `--cam NAM_THU` `--che-do night` `--blend` `--chi-tu-the` |
| `dien_thu.mp4` | Video xem thử (560 px, 8 mẫu, 48 khung — mỗi bốn khung lấy một — phát 12 fps nên giật và nhiễu hạt) |

## Cách ghép
- Phòng: `build()` của `xay_phong_tro.py`, ghế kéo ra (tâm thiết kế x 2,32, y 1,36), thêm camera `NAM_THU` (đứng góc trước-trái nhìn về bàn).
- Nhân vật: tư thế dựng bằng `chuyen_dong_nam003` (đi bộ `dong_di`, tư thế đứng, ngồi) với **armature đứng yên ở gốc**; vị trí/hướng trong phòng bằng chuyển động của OBJECT armature từng khung (đường đi cửa → góc → bàn, làm trơn góc; vị trí hông bám đường đi). Ghế và nhân vật cùng dịch 0,40 m về phía bàn ở đoạn kéo ghế.
- **Lỗi đã gặp:** tư thế phải tính khi object armature ở gốc; nếu để lại phép dịch của khung trước thì `Ctx.place` bù ngược và nhân vật hiện sai chỗ (ở tường sau bàn).

## Giới hạn (nói thẳng)
- Nhân vật là thân trần xám, chưa có quần áo, tóc, mặt (mắt/mày/miệng đang làm ở bên khác).
- Đi bộ là chuyển động viết bằng công thức (không phải mocap Mixamo); đoạn quay người đứng tại chỗ làm bàn chân trượt; ngồi dùng IK chân, tay IK tới mép bàn nhưng tay trái còn chưa chạm bàn.
- Chưa có tiếng, chưa dựng cửa mở (cửa phòng cố định 10°), chưa có chuyển động ghế bánh xe thật (ghế dịch thẳng), không có bóng đổ kiểm riêng.
- Render nháp Cycles 8 mẫu; 2–3 phút/khung ở 640 px nên chỉ dựng bản thưa.
