# Thiết kế: nối bàn tay/bàn chân liền da vào thân cage + rig thử cục bộ (14/11/2026)

Tiếp từ commit 538aef4 (`gan_tay_chan_nam.py`: tay/chân là vật riêng xuyên vào ống thân). Chủ repo yêu cầu ưu tiên một bề mặt da liên tục ở cổ tay/mắt cá, kiểm biến dạng cục bộ; chưa làm dép, chưa rig toàn thân, chưa đẩy main.

## Hiện trạng (đã kiểm)
- Thân `Nam_Dau_Than`, `Nam_BanTay.L`, `Nam_BanChan.L` là **3 vật riêng**, mỗi vật kín (0 cạnh hở, 1 mảnh); chỉ **xuyên/chồng** nhau, không có topology nối. Ống cẳng tay/ống chân đóng nắp.
- Thân: lưới cage tứ giác, vòng cổ tay 32 đỉnh (cage 8 đỉnh × Subdivision 2), cạnh ~7 mm. Bàn tay/chân: lưới voxel 1,2–1,5 mm (71k/86k đỉnh), dày hơn ~6 lần, không có vòng cạnh.

## Cách làm
- A — **chủ repo chọn**: dựng bàn tay/bàn chân thành **cage tứ giác nối tiếp cage thân** (ống tay/chân 8 đỉnh chạy tiếp vào lòng tay/mu chân, ngón đùn ra), một lần Subdivision chung, rồi ép hình bám theo bàn tay/chân đã duyệt.
- B (không chọn): giữ lưới voxel, thêm ống chuyển tiếp tăng mật độ 32→64→128 rồi nối mép cắt — còn tam giác ở chỗ đổi mật độ, bàn tay/chân vẫn là voxel khó rig.
- C (loại): voxel remesh cả người — phá topology cage của thân.

## Thiết kế
1. **Cage tay** (nửa trái, Mirror sinh nửa phải như thân): bỏ mặt nắp cuối ống cẳng tay; nối tiếp các vòng 8 đỉnh qua cổ tay (đoạn chuyển tiết diện tròn → dẹt dài ~3–4 cm, không đổi số đỉnh trong vùng gập). **Đổi mật độ chỉ ở lòng tay** (quá vùng gập cổ tay) bằng chuyển tiếp tứ giác chuẩn (1 mặt → 2), để mặt đầu lòng tay có lưới đủ cho 4 gốc ngón (mỗi ngón một ô 2×2 → vòng 8 đỉnh) và gốc ngón cái ở cạnh lòng tay phía trước. Mỗi ngón 4 vòng (gốc + 3 khớp) + nắp đầu ngón; ngón cái tương tự.
2. **Cage chân**: bỏ nắp đáy ống chân; vòng 8 đỉnh qua mắt cá rồi bẻ hướng ra trước thành thân bàn chân (gót, mu, mũi); đổi mật độ ở mũi bàn chân (quá vùng gập mắt cá) để mặt trước có 5 gốc ngón; ngón chân ngắn 2 vòng + nắp.
3. **Chia mịn chung** (Subdivision 2 như thân) → một lưới liền. **Ép hình**: vùng tay/chân bám bề mặt bàn tay/chân đã duyệt (gần nhất trên bề mặt), trọng số ép giảm dần về 0 qua vùng cổ tay/mắt cá để hình thân giữ nguyên; rồi làm mượt nhẹ cục bộ. Không làm mượt toàn bộ, không tăng chồng lấn.
4. **Kiểm topology/hình**: 1 mảnh, 0 cạnh hở, 0 cạnh >2 mặt, chỉ tứ giác trong vùng cổ tay/mắt cá (±4 cm), sai lệch hình so với bàn tay/chân đã duyệt (khoảng cách bề mặt, ngưỡng ~1,5 mm trung bình), tỷ lệ cơ thể không đổi (chiều cao, số đo cage). Ảnh: clay, wireframe, ánh sáng xiên; trước/sau cùng camera.
5. **Rig thử cục bộ** (bản sao riêng, không phải rig toàn thân): xương cẳng tay → bàn tay (+ ngón cho nắm/cầm cốc); cẳng chân → bàn chân → ngón chân; phần thân còn lại khoá vào một xương đứng yên. Pivot đặt đúng tâm khớp; weights chuyển tiếp qua chỗ nối theo vị trí dọc chi (không cắt cứng).
   Tư thế: cổ tay gập trước/sau 30°, 45° (kiểm giới hạn); nghiêng hai bên 15–20°; bàn chân gập lên/xuống trong phạm vi hợp lý (~20°/30°); nhấc gót tựa mũi bàn chân; nắm tay, cầm cốc.
   Đo: cạnh giãn/co (vẽ vị trí trên ảnh, không chỉ tỷ số), diện tích tiết diện tại khớp (xẹp thể tích), góc nhị diện lớn nhất (nếp sắc), mặt tự giao. Sửa topology rồi weights trước; corrective shape key chỉ khi còn cần.
6. **Bàn tay**: ngón út khi nắm đánh giá bằng hình dáng nắm (ảnh + khoảng cách); cầm cốc không xuyên, không kéo căng kẽ ngón; vị trí các cạnh giãn ~2,15× được đánh dấu trên ảnh và xem biến dạng thật.
7. **Bàn giao**: cận cổ tay/mắt cá trước & sau (cùng camera), wireframe chỗ nối, clip trung tính → từng tư thế, ảnh toàn thân. Giữ bản cũ (`gan_tay_chan_nam.py`) để đối chiếu; rig thử lưu riêng. Báo lỗi theo nguồn: geometry / weights / điều khiển khớp. Commit nhánh làm việc.

## Tệp
- `dung_cage_tay_chan.py` (mới): nối cage tay/chân vào cage thân (gọi các hàm của `dung_than_cage_nam.py`, không sửa file đó), ép hình, kiểm, ảnh.
- `rig_thu_tay_chan.py` (mới): rig thử cục bộ, tư thế, đo biến dạng, clip.
- `dung_tay_nam.py`, `dung_chan_nam.py`: giữ làm hình đích để ép; chỉ sửa nếu cần xuất thêm dữ liệu.

## Ngoài phạm vi
Dép, rig toàn thân, mắt/miệng, đẩy main.

## Để người dựng tự quyết
Số vòng cụ thể mỗi đoạn, vị trí chính xác ô đổi mật độ, độ rộng vùng giảm dần của lực ép, số khung mỗi clip.
