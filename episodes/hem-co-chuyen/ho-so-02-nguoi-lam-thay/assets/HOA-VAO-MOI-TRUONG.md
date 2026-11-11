# Nhân vật hoà vào môi trường — đi, tiếp xúc, che khuất, bóng (11/11/2026)

Mục tiêu: nhân vật là một phần của phòng, không phải hình dán trượt trên nền. Bốn việc, đều tính từ **toạ độ sàn / điểm 3D của cảnh**, máy quay của shot mới đổi sang toạ độ ảnh.

| Việc | Mã | Làm gì |
|---|---|---|
| 1. Đường đi trên sàn | [`di-chuyen.tsx`](di-chuyen.tsx) | `WalkPlan` (điểm đầu, điểm rẽ, đích, tốc độ cm/s) → vị trí, hướng, quãng đường theo khung. `walker(view, plan, frame)` trả `{at, pose}` dùng thẳng trong `actors` của `RoomScene`. Góc nhân vật (chính diện/3/4/nghiêng/1/4/sau lưng) lấy theo hướng đi **nhìn từ máy** (`walkFacing`); rẽ gắt thì xoay tại chỗ qua các góc trung gian. |
| 1b. Chân không trượt | `gaitPose`, `gaitOffset` | Chu kỳ bước riêng (biên độ lớn hơn `sampleWalk`). Bảng độ dịch thân đo từ chính chu kỳ bằng `solveRig` giữ chân trụ đứng yên trên sàn; pha bước theo quãng đi nhìn từ máy (`× |sin φ|`). Nhìn thẳng/sau lưng không thấy chân vung nên thêm nghiêng vai và nhấc gối lệch nhịp. |
| 2. Che khuất theo tia nhìn | `OCCLUDERS` + thứ tự vẽ trong [`boi-canh.tsx`](boi-canh/boi-canh.tsx) | Nệm, bàn, tủ, bếp có khối che (x, z, cao). Tia từ máy tới đầu/chân/hai bên người chui qua khối thì đồ che người; người nằm hẳn trước khối (theo độ sâu của máy) thì vẽ sau. Trước đây chỉ so khoảng cách tới tâm đồ nên đi sau nệm bị sai lớp. |
| 2b. Bóng theo vị trí | `lightActor` | Mỗi người đặt qua `actors` có vết tối sát chân + bóng đổ lệch theo `lightFor`, đậm theo mức sáng nơi đứng (ngày: nắng cửa sổ tới chỗ đó; đêm: gần laptop; hành lang: gần đèn tuýp). Vệt bóng cố định `drawn-contact` trong rig bị ẩn trong cảnh. |
| 2c. Ngả theo mặt sàn | `RoomScene floorTilt` (0 tắt, 1 đề xuất), `tiltCos` | Ống kính dịch giữ tường và người thẳng đứng nên sàn trông dốc về phía khán giả, còn người là tấm phẳng song song màn hình. Mỗi người được xoay quanh bàn chân như đứng vuông góc mặt sàn: co chiều cao theo cos θ, θ = 1,6 × góc nhìn xuống sàn tại chỗ đứng (tối đa 30°); người gần máy ngả nhiều hơn người xa. Truyền cùng `floorTilt` cho `seatedAt`/`reachWorld` để điểm tiếp xúc vẫn khớp. Mặc định tắt để không đổi cảnh đã dựng. |
| 3. Điểm tiếp xúc | [`diem-tiep-xuc.tsx`](diem-tiep-xuc.tsx), [`tay-ik.tsx`](tay-ik.tsx) | `screenOf` đổi điểm 3D → ảnh; `reachWorld` đưa cổ tay chạm điểm 3D (`armHint`: khuỷu theo hướng gợi ý, không IK tổng quát); `sitLegs` giải hai chân theo chiều cao mặt ghế; `seatedAt` = ngồi đúng ghế + hai tay trên mặt bàn. Chiều cao tính theo hình ĐÃ VẼ (ghế 40, bàn 65 cm), đế dép thấp hơn cổ chân 34 đơn vị rig. |
| 4. Video thử | `HoSo02DiChuyenThu` ([`di-chuyen-thu.tsx`](../../../../what-if-studio/src/episodes/ho-so-02-nguoi-lam-thay/di-chuyen-thu.tsx)) | Nam đi từ cửa tới bàn, rẽ, ngồi, gõ phím, cầm điện thoại; lớp chú thích (`guide`) vẽ đường đi và các điểm khoá. Video local `what-if-studio/out/ho-so-02-nguoi-lam-thay/di-chuyen-thu.mp4`, không commit. |

Kiểm tra: `node what-if-studio/tests/ho-so-02-di-chuyen.cjs` (đường đi tất định và không nhanh hơn tốc độ khai báo; góc theo hướng; chân trụ trượt < 20% tốc độ thân; thứ tự che khuất; bóng theo vị trí; tay chạm mặt bàn < 8 px, hông đúng mặt ghế, chân chạm sàn).

## Ví dụ ngắn gom tất cả
`HoSo02VdHoaMoiTruong` ([`vd-hoa-moi-truong.tsx`](../../../../what-if-studio/src/episodes/ho-so-02-nguoi-lam-thay/vd-hoa-moi-truong.tsx), ~13,5 s, ban ngày, một cú máy toàn phòng): Nam đi từ cửa tới bàn, ngồi, gõ phím; Tùng bước vào, đi chéo về phía máy (che khuất sau nệm, bóng, ngả theo sàn), dừng lại vẫy tay; Nam quay ghế lại (góc 1/4 → nghiêng → 3/4) và đổi nét mặt bình thản → suy luận → bất ngờ → vui. Dùng mặt 2.5D tham số, dáng sống, môi trường chuyển động. Video local `what-if-studio/out/ho-so-02-nguoi-lam-thay/vd-hoa-moi-truong.mp4`, không commit.

## Giới hạn (nói rõ khi báo cáo)
- Rig 2D không biểu diễn tay đưa tới trước theo chiều sâu khi nhìn thẳng hoặc sau lưng: ngồi quay lưng về máy thì kiểm tra hông/chân, không kiểm tra tay.
- Khối che chỉ có 4 món lớn (nệm, bàn, tủ, bếp); đồ nhỏ và đồ mới thêm vào cần khai báo thêm trong `OCCLUDERS`.
- `floorTilt` chỉ co chiều cao (không có méo hình thang ở đỉnh đầu) vì SVG chỉ có biến đổi affine.
- Chưa có kéo ghế: ghế đứng yên, người ngồi vào theo `SEATS`. Đứng→ngồi dùng `easePose` giữa dáng đứng và dáng ngồi đã giải, chưa có cú xoay người quanh ghế.
- Bước chân đi chéo (3/4, 1/4) chỉ xấp xỉ: chân vung trong mặt phẳng ảnh nên pha bước theo thành phần ngang của quãng đi. Ảnh tĩnh không chứng minh được độ mượt; xem video.
