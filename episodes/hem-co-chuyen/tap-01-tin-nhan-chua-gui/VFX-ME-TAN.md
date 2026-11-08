# Mẹ tan trong nắng và hai bàn tay — bản thử VFX/tương tác

Theo yêu cầu chủ repo ngày 08/11/2026. Giữ luật G3, lời thoại/thẻ và thời lượng nguồn; đây là nâng cấp hình ảnh, chưa phải bản phim hoàn thiện.

## Hình và nhịp

- Đầu nhịp giữ mặt và vòng tay rõ; đường cong tan có đầu/cuối phẳng, không tụt độ hiện rõ đột ngột. Viền tóc và gấu áo bắt nắng rất nhẹ rồi tách thành hạt nhỏ; không lóe toàn thân hoặc rã thành mảnh người.
- Hạt sinh từ một số điểm ở đỉnh tóc và gấu áo, không rải trong khung chữ nhật hoặc trên mắt/miệng. Hạt thưa, hơi nhấc lên và trôi sang phải, độ sáng lên/xuống mềm, vài hạt có vệt rất ngắn.
- Một hệ số chung điều khiển thân, da, áo, chân, hai lượt bàn tay và bóng ngồi. Chỉ làm mềm viền tối đa 0,85 px ở cuối khi mẹ đã gần tan; không làm mờ mặt ngay lúc còn nói. Hai trẻ tự rời điểm tựa từ từ, không trượt mông/chân trên kè.
- Hạt/viền nằm sau lớp hai trẻ nên không phủ mặt hoặc bàn tay trẻ. Mẹ không để lại vệt người phát sáng; bụi nắng có sẵn là lớp môi trường riêng.

Trong shot thử 12 giây, lần tan chạy từ frame 6 tới 120 ở 30 fps (**3,8 giây**); từ frame 120 trở đi không còn mẹ, bóng mẹ, hạt hay viền do mẹ phát ra. Tiếp theo là 8 giây không lời: Duy dịch sang chỗ trống bên em, nhẹ tay lau má rồi hạ tay nắm tay Thảo; máy tiến vào đôi tay và mờ tối dịu để mở sang tiệm. Không lóe trắng thêm ở lần trở về. Khi ráp nguồn 35 cue phải căn mốc sau lời mẹ cuối; không coi mốc frame của mã thử là thời điểm giọng cuối đã duyệt.

| Mốc thử ở 30 fps | Hành động |
|---|---|
| 6–120 | Mẹ tan mềm một lần 3,8 giây, hạt tắt hết |
| 126–164 | Duy nhích trên mặt kè tới gần Thảo, không lơ lửng |
| 164–233 | Đưa tay phải tới má, lau nhẹ rồi hạ xuống; Thảo bớt khóc |
| 233–262 | Thảo đưa tay trái, hai bàn tay nắm lại |
| 270–330 | Máy tiến từ trung cảnh vào đôi tay; giữ điểm nắm ở trung tâm |
| 330–338, 338–360 | Giữ cận một nhịp rồi mờ tối dịu; cảnh tiệm mở sáng trong 14 frame đầu |

Tay trong của hai trẻ ôm mẹ ở lớp trước áo mẹ; tay ngoài nghỉ trước áo/đùi. Bản cận dùng hai cổ tay thật của rig nối vào một hình nắm gồm hai bàn tay, không vẽ dư bàn tay; `handKind: none` chỉ ẩn lòng bàn tay thông thường tại chỗ có hình nắm chung. Chưa có giọng hoặc nhạc cuối.


## Mã và kiểm tra

- [mother_dissolve.tsx](../../../what-if-studio/src/episodes/tin-nhan-chua-gui/mother_dissolve.tsx): trạng thái tan, điểm sinh hạt và lớp viền/hạt, xác định theo frame/seed.
- [meadow_family.tsx](../../../what-if-studio/src/episodes/tin-nhan-chua-gui/meadow_family.tsx): `dissolveT` là đồng hồ cục bộ của lần tan; giữ thứ tự thân/tay sau → hạt → trẻ → bàn tay mẹ trước. Không truyền `dissolveT` thì giữ nhóm ôm bình thường; `motherOpacity` cũ vẫn dùng được.
- `ShC7_B`, composition **MotherFarewellLab** và mẫu bên phải **MeadowAndDealsSheet** dùng cùng hiệu ứng. Shot C7-C trong nguồn 35 cue tương ứng chức năng với ShC7_B của mã thử, không ghép chỉ theo tên.
- Chạy `npm run typecheck` và `node tests/mother-farewell.cjs` trong studio: kiểm tra hình học cũ, độ hiện giảm một chiều, nguồn/hướng hạt, tính xác định và không có hạt/viền sau lần tan, điểm lau má và điểm nắm tay.

[Khung giữa lần tan](assets/boi-canh/preview_mother_farewell.png) · [Chuỗi khung trích từ MP4](assets/boi-canh/preview_mother_farewell_sequence.png) · [Cận hai bàn tay](assets/boi-canh/preview_siblings_clasp.png).

Clip local: `what-if-studio/out/tin-nhan-chua-gui/asset-preview/mother-farewell.mp4`, H.264 960×540, 30 fps, 13 giây (12 giây ở đồng và 1 giây mở sang tiệm). Đã xuất và soi các khung trích; chờ chủ repo duyệt chuyển động. Không có giọng/nhạc cuối, đã có động tác lau nước mắt/nắm tay ở mã thử nhưng chưa thay duyệt diễn xuất và dựng toàn bộ 35 cue. Không dùng dịch vụ sinh media/TTS trả phí cho hiệu ứng này.
