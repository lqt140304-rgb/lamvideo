# Thiết kế: đầu trọc, xương ngón tay, sửa vai — NHAN-VAT-GOC-001

Trạng thái: **bản đề xuất, chờ chủ repo duyệt** (14/11/2026).

## Mục đích

- Đầu trọc làm mô hình nền: tóc sẽ làm riêng cho từng nhân vật. Rig phải chạy được trên phần đầu này.
- Thêm xương ngón tay để nhân vật cầm nắm và làm điệu bộ được.
- Bỏ nếp gấp lớn ở vai và nách khi giơ tay cao.

**Không làm trong lượt này:** tóc mới, rig mặt hoặc shape key, retopology toàn thân.

**Coi là hỏng dù chạy được nếu:**
- mặt mất texture hoặc đổi nét;
- mất nốt ruồi;
- thấy rõ đường nối giữa da đầu mới và trán hoặc gáy;
- file nguồn `nhan-vat-goc.blend` bị sửa.

## Đầu trọc (cách 1, chủ repo đã chọn)

Các cách đã cân nhắc:

1. **Giữ bản gốc, dựng da đầu theo khuôn sọ của file trọc.** Đây là cách được chọn.
2. Ghép nguyên đầu trọc lên thân gốc. Bỏ vì mặt sẽ mất texture và đổi nét.
3. Chuyển hẳn sang bản trọc. Bỏ vì bản này chỉ có 2.102 đỉnh, không có texture, và chủ repo xác nhận không có bản tốt hơn.

Lý do chọn cách 1: giữ được mặt, texture, thân và rig hiện có.

Cách làm, đều nằm trong script `dau_troc.py` và không sửa file nguồn:

1. Lưu file FBX trọc chủ repo gửi vào `../nguon/` làm khuôn tham chiếu. Ghi SHA-256 vào `nguon.json`. Giấy phép chưa rõ, giống bản gốc.
2. Căn khuôn trọc vào bản gốc bằng ICP: dời, xoay và co giãn đều. Chỉ căn theo vùng không có tóc, gồm mặt, tai và cổ.
3. Tìm vùng tóc trên bản gốc theo màu texture (đọc màu diffuse qua UV), cộng thêm một dải lề. Sau đó xóa các mặt thuộc vùng tóc.
4. Lấp lỗ bằng mảng lưới mới, ép mảng lưới bám theo mặt sọ đã căn, rồi làm mượt dải nối với trán và gáy.
5. Tô màu cho da đầu mới. Vật liệu da lấy mẫu màu từ trán, và màu được pha dần ở dải nối.
6. Lưu ra `nhan-vat-goc-troc.blend`. Rig tiếp tục chạy trên file này bằng lệnh `rig_goc.py --src`.

**Rủi ro cần soi bằng ảnh:**
- Phần trán nằm dưới mái tóc có thể không có da sẵn. Khi đó trán phải dựng theo khuôn sọ.
- Tai có thể dính với tóc ở mép.

Ảnh kiểm tra: đầu chụp từ trước, bên, sau, trên và chéo 3/4, kèm cận cảnh đường nối.

## Xương ngón tay

Đề xuất của trợ lý (chủ repo chưa nêu động tác cụ thể): mục tiêu là cầm được các đạo cụ trong quy chuẩn 3D, gồm điện thoại, búa, bát, đũa và thẻ.

- **Xương:** mỗi ngón ba đốt, ngón cái ba đốt. Số ngón đếm lại trên lưới trước khi dựng, vì ảnh hiện tại cho thấy ngón cái cộng bốn ngón. Các đốt đặt theo đường giữa của từng ngón, đo trên lưới ở tư thế ngón hơi co hiện có.
- **Điều khiển:** thuộc tính `nam` (0 đến 1) trên xương `hand` để nắm cả bàn tay. Từng đốt vẫn xoay tay được. Đặt các xương ngón vào bone collection `Ngon`.
- **Trọng số:** mỗi ngón có vùng riêng, xác định bằng khoảng cách tới đường xương cộng loang theo lưới, để ngón này không kéo da ngón bên cạnh. Lòng bàn tay và mu bàn tay theo xương `hand`.
- **Dáng thử:** nắm chặt, cầm hờ, chỉ tay, xòe tay.

## Vai và nách

Lần trước đã thử cho xương đòn tự nâng theo góc dạng tay (driver), nhưng da bị giãn tăng lên nên đã bỏ.

Đề xuất mới:

- **Thêm xương phụ vai** (`vai_phu.L/R`, có biến dạng). Xương này nhận khoảng 50% góc xoay của bắp tay qua Copy Rotation. Phần da quanh khớp vai được chia trọng số giữa xương này và bắp tay, nên khớp không còn gập ở một chỗ.
- **Làm mượt thêm trọng số** ở dải nách và bả vai. Dải này rộng hơn bản hiện tại.
- **Shape key sửa dáng** (tự bật theo góc giơ tay) chỉ làm nếu hai bước trên chưa đủ.

Đạt khi:
- dáng giơ tay 150° không còn nếp sâu khi nhìn ảnh trước, sau và chéo;
- số đo giãn cạnh tối đa thấp hơn nhiều so với 8,3× hiện tại.

## Kiểm tra chung

- Dáng nghỉ lệch dưới 0,5 mm so với lưới nền trọc.
- Bảng dáng có thêm các dáng tay.
- File `.blend` vẫn không đưa lên Git. Ảnh bảng và README được cập nhật.

## Để người dựng tự quyết

Người dựng tự chọn: số vòng làm mượt, độ rộng dải nối, ngưỡng màu nhận tóc, góc gập ngón cụ thể, và tên các xương phụ không ghi ở trên.
