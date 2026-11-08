# Đồng vàng, kè mương và dáng ôm

Chốt hình theo phản hồi chủ repo ngày 08/11/2026. Giữ mặt, trang phục và tỉ lệ cartoon cũ. Đây là chỉ dẫn dựng hình, không đổi lời đọc hoặc luật G3.

## Không gian phải đọc được

Phía xa là làng và đồng chín vàng; lớp giữa có thân mảnh, bông hạt riêng, cao và dày theo ảnh tham khảo. Phía gần dùng bông lớn hơn, chừa trống giữa cho nhóm người. Không dùng bụi lá bản nhọn thay đồng hạt.

Ba mẹ con ngồi trên **mặt kè đá khô của mương tưới**. Mép kè nhìn rõ phía sau đùi, mạch đá ở vách trước chân. Dưới là nước xanh xám, có bóng tối sát chân kè, các nét phản chiếu hoàng hôn và gợn nằm ngang; bờ bên gần xuất hiện ở mép dưới. Không đặt bóng tiếp đất ngay dưới giày đang buông trên nước.

## Tư thế và lớp che khuất

- Mẹ giữa, Duy bên trái, Thảo bên phải theo nguồn dựng cảnh. Hai trẻ nghiêng vào hai vai mẹ; mẹ vòng tay sau lưng và đặt lòng bàn tay lên **đỉnh vai ngoài**, không để cổ tay ở đó còn bàn tay rơi xuống bắp tay.
- Mông có mặt đỡ; đùi đưa ra phía trước theo góc ba phần tư, thấy đoạn đùi và đầu gối gập; cẳng chân buông gần thẳng đứng, giày nằm trên mặt nước. Giữ khoảng cách giữa giày của từng người.
- Thân và cánh tay mẹ vẽ trước trẻ; bàn tay mẹ vẽ lại phía trước vai bằng cùng pose. Không thêm một cánh tay rời hoặc để bàn tay xuyên cổ/tóc. Khi mẹ tan, cả thân, áo, vòng tay, bàn tay và bóng ngồi giảm cùng một opacity; trẻ còn tựa trên kè.
- Chỉ dẫn hình này không thay chuyển động hạ người/ngồi và tương tác trong animatic toàn tập. C6 đi trên đường khô; C7 dùng góc nhìn mép mương.

## Mã và bản kiểm tra

[meadow_family.tsx](../../../what-if-studio/src/episodes/tin-nhan-chua-gui/meadow_family.tsx) giữ pose, điểm chạm và thứ tự lớp; [sunset_field.tsx](../../../what-if-studio/src/engine/sets/sunset_field.tsx) giữ kè/nước; [golden_grain.tsx](../../../what-if-studio/src/engine/sets/golden_grain.tsx) giữ đồng bông vàng. C7-A/B của mã thử và `MeadowMotionLab` dùng cùng nhóm người. `MeadowAndDealsSheet` là bảng asset, không phải shot phim.

[Ảnh mới](assets/boi-canh/preview_meadow_embrace.png) ở frame 93. Clip local `what-if-studio/out/tin-nhan-chua-gui/asset-preview/meadow-embrace.mp4` là preview 12 giây, không có giọng cuối. Chạy `node tests/meadow-poses.cjs` trong studio để kiểm tra tiếp xúc/cẳng chân/mực nước, cùng kiểm tra dùng chung.

[Ảnh gốc chủ repo gửi](assets/boi-canh/references/README.md) chỉ làm tư liệu bố cục/tư thế/hình hạt, chưa xác minh quyền tái sử dụng trong phim; không đưa ảnh tham khảo vào sản phẩm render.
