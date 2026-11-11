# Hồ sơ 02 — Việc giao: làm nhân vật "sống động" (dành cho phiên Claude khác)

Ghi ngày 11/11/2026. Chủ repo muốn nhân vật bớt "hình tĩnh". Việc được **chia đôi**: phần bối cảnh do phiên dựng bối cảnh làm xong (mục A), phần nhân vật giao cho phiên này (mục B).

## A. Phần bối cảnh — đã làm, đừng sửa lại

Chỉ để biết cách nối với nhân vật. Không sửa các file bối cảnh (`assets/boi-canh/boi-canh.tsx`, `assets/bo-sung-15p/boi-canh.tsx`, `kit3d.tsx`).

- `RoomScene` nhận prop **`frame`** (số khung, 30 fps). Có giá trị thì phòng tự chuyển động: quạt quay và quay đầu, rèm lay, bụi trôi trong vệt nắng ban ngày, đèn bàn ban đêm nhấp nhẹ. Bỏ trống thì tĩnh như cũ.
- Cảnh quay muốn có chuyển động bối cảnh chỉ cần truyền `frame={useCurrentFrame()}`.
- Ánh sáng theo từng mặt và người đặt qua `actors` (phòng) hoặc `children` (bối cảnh 3D) đã được ám ấm/lạnh theo nguồn sáng.

## B. Phần nhân vật — việc giao

Mục tiêu: nhân vật không còn đứng im như hình dán; thêm chuyển động nhỏ lúc không làm gì, chuyển dáng có đà, và vật lý thứ cấp. **Không đổi tạo hình đã chốt** (không viền ngoài, tóc/màu/nốt ruồi giữ nguyên, rig `assets/nhan-vat.tsx` là rig chính).

### B1. Lớp "dáng sống" dùng chung (làm trước)
Một hàm/lớp bọc rig, nhận số khung và trả về tư thế đã cộng dao động, để mọi cảnh dùng chung thay vì viết từng chỗ:
- Thở: ngực/vai lên xuống, chu kỳ khoảng 3–4 s; biên độ nhỏ.
- Chớp mắt không đều (khoảng 2–6 s, thỉnh thoảng chớp đôi), thỉnh thoảng liếc sang chỗ khác rồi quay lại.
- Dịch trọng tâm khi đứng, đầu nghiêng vài độ, tay buông không tuyệt đối đứng yên.
- Tất định theo số khung (cùng khung ra cùng kết quả; Remotion render lại khung bất kỳ). Hạt giống theo nhân vật để hai người không thở cùng nhịp.
- Có công tắc tắt, và tương thích dáng đang có (`TWIN_POSES`, `EXTRA_POSES`, dáng nằm `lie`).

### B2. Chuyển dáng có đà
Hiện chủ yếu dùng `mixPose` trộn tuyến tính. Thêm hàm chuyển dáng có: chuẩn bị ngược chiều, chính, quá đà rồi về; và từng bộ phận trễ khác nhau (vai trước, tay sau, bàn tay sau cùng). Kiểm tra giữa hai dáng bất kỳ không làm khớp gãy ngược (đã có `LIMIT` trong rig).

### B3. Vật lý thứ cấp
Đã có thử nghiệm ở `assets/thiet-ke/thu-2-5d/vat-ly.tsx` (quán tính, tóc/vạt áo, nhún khi tiếp đất, giật mình). Đang gắn với bản Nam 2.5D. Việc: kiểm tra có dùng được cho rig Style B hiện hành không; nếu có thì gom vào B1 để nhân vật khác (Người Kia, Tùng) cũng dùng. Nếu bản 2.5D bị bỏ thì đừng phụ thuộc vào nó.

### B4. Gương mặt
- Chuyển nét mặt có thời gian (đã có `faceFrom`/`faceMix`), thêm: mắt nhìn theo vật hoặc người, mày nhướng trước miệng.
- Khẩu hình theo lời thoại **chỉ làm khi đã có giọng đọc**; hiện chưa có giọng nên giữ miệng luân phiên tạm. Không báo là đã khớp lời.

### B5. Nhân vật phụ
Sinh viên, giảng viên, gia đình đang đứng im. Thêm vòng lặp ngắn (khoảng 20 s) cho từng vai: gật đầu, nhìn quanh, gõ bàn, gắp thức ăn. Vai phụ chỉ có góc ba phần tư phía trước (`SupportingActor`); không xoay.

## Cách làm và nghiệm thu
- Làm trên một cảnh ngắn trước: Nam ngồi ở bàn học ban đêm (đã có dáng `type`/`sit`), so hai bản **có và không có** lớp sống động, rồi mới áp rộng.
- Xem bằng ảnh tĩnh nhiều khung và bảng ghép qua `what-if-studio/tools/soi/`; chỉ render video khi cần xem chuyển động. Gom góp ý thành một vòng.
- Chạy `npx tsc --noEmit` trong `what-if-studio/` và `node what-if-studio/tests/ho-so-02-rig.cjs`; thêm kiểm tra cho phần mới nếu có thể.
- Mã riêng của tập đặt trong `what-if-studio/src/episodes/ho-so-02-nguoi-lam-thay/` hoặc `assets/` của hồ sơ; không đưa video render vào repo.
- Nguyên tắc chung rút ra thì ghi vào `docs/KINH-NGHIEM.md`, còn tình trạng sửa ghi vào `LOI-TON-DONG.md` của hồ sơ.

## Giới hạn cần nói rõ khi báo cáo
Nhân vật vẫn là hình 2D ghép khớp. Cú xoay mạnh (quay hẳn người, ngã) không đẹp bằng 3D thật. Ảnh tĩnh không chứng minh chuyển động mượt; chỉ kết luận khi đã xem khung liên tiếp hoặc video ngắn.
