# Asset — Tin nhắn chưa gửi, bản 3

07/11/2026. Đã có concept nhân vật hiện hành v4 (v2 giữ để đối chiếu mặt Lộc), mặt Lộc đã được chủ repo chốt, hai trẻ vừa sửa còn chờ duyệt. Chưa có hình hẻm/nội thất, asset tách lớp, rig, audio, storyboard, animatic hoặc video. Nguồn lời [KICH-BAN.md](KICH-BAN.md); sơ đồ và cue [DUNG-CANH.md](DUNG-CANH.md).

## File đã có

| File | Nguồn / phiên bản / mục đích | Duyệt / quyền dùng / chi phí |
|---|---|---|
| [duy-thao-loc-concept-v4.png](assets/nhan-vat/duy-thao-loc-concept-v4.png) | Công cụ imagegen tích hợp, 07/11/2026; từ concept tự tạo: sửa Lộc, rồi giữ Lộc/sửa hai trẻ thành dáng che chở và thêm đồ cũ có vá nhẹ. Preview nhân vật cho tập, ảnh phẳng nguyên bảng | Lộc đã chốt, hai trẻ chờ duyệt; ảnh AI, không dùng ảnh người thật hoặc nguồn Gemini làm input. Chưa rà điều khoản khai thác thương mại riêng, không gắn giấy phép mã repo cho ảnh. Không có số credits/chi phí nhà cung cấp trả về, chưa quy đổi |

Prompt tạo đầu: bảng toàn thân ba nhân vật Việt, 2D điện ảnh vẽ tay có khối, nền kem; Duy anh trai 16 áo thun xanh xám/quần xanh than/giày vải; Thảo em gái 8 áo vàng/quần lửng xanh/dép quai/tóc buộc nửa đầu; Lộc thợ sửa 60 sơ mi xám/quần nâu/kính cũ. Prompt sửa: chỉ đổi Lộc, mặt góc cạnh không cười, mắt lạnh dưới chân mày thấp, đầu hơi cúi, dáng cứng lặng, tay gân, ánh hổ phách hẹp và nửa mặt trong bóng; giữ nguyên trẻ/bố cục/phong cách, không thêm vũ khí hay hiệu ứng phép. Dùng built-in, không CLI/API và không dùng Gemini.

Ảnh đầu hiền hơn là bản thử bị thay, không phải tạo hình đã duyệt. Không cần lưu mọi bản bỏ vào repo. Mặt Lộc từ v2 đã được chủ repo xác nhận ổn. V4 cập nhật riêng hai trẻ; chưa duyệt, không chứng minh đã tách lớp hoặc chuyển động được. Bản v2 trong cùng thư mục chỉ để đối chiếu mẫu mặt Lộc, không là mẫu trẻ hiện hành.

## Cần chuẩn bị

| ID | Tài nguyên | Ràng buộc | Trạng thái |
|---|---|---|---|
| CHAR-DUY | Anh trai 16 | Mặt/pose thiếu niên; không vai người đàn ông 26 tuổi; tay đủ để đặt tiền/cầm máy/chạm vai em | Có concept v4 đồ cũ/che chở, hai trẻ chờ duyệt; chưa rig/pose |
| CHAR-THAO | Em gái 8 | Tỷ lệ trẻ; không trang phục/túi hoặc nghề người chị 32 tuổi; ghế có điểm đỡ chân | Có concept v4 đồ cũ/che chở, hai trẻ chờ duyệt; chưa rig/pose |
| CHAR-LOC | Thợ sửa khoảng 60 | Kỳ lạ, lạnh, có phần nguy hiểm; vẫn người đời thường; bóng mặt theo nguồn sáng | Mặt Lộc đã chốt, chưa rig/pose |
| SET-TIEM | Tiệm / cửa ra hẻm / ghế trẻ | Quầy ngang, kệ trái, cửa phải mở, bàn sửa sau, đèn vàng bán sáng; đồng hồ đứng kim | Chưa tạo |
| SET-NHA | Cửa nhà gia đình / phòng bố phía sau | Bàn may mẹ trái/tắt, bàn ăn giữa, bàn thờ phải; bố sau vách, trẻ không vào; hướng nhà dì ở đầu hẻm | Chưa tạo |
| PROP-MAY | Máy trước/sau sửa, túi vải | Giữ mẫu/vỏ, tắt và vỡ trước C6; mật mã rồi ghi âm, không tự phát | Chưa tạo |
| PROP-TIEN | Phong bì, tiền Duy, hai tờ Thảo | 186.000 + 20.000 vẫn thiếu giá 800.000; Lộc không giữ tiền | Chưa tạo |
| PROP-ANH-VI | Ảnh giấy và ví | Ảnh ra C2, cất trước ký C5; ví chứa liên giấy Duy | Chưa tạo |
| PROP-GIAY-BUT | Hai liên có đường tách, bìa kê, bút | Ghi cùng sự kiện ở hai liên, chưa ký C3; tách C6, một liên mỗi bên; chữ lớp riêng | Chưa tạo |
| AUDIO-BO-DI | Bố sau vách, cuộc gọi dì | Chai lăn và càm ràm không rõ chữ, không cần tạo mặt/thoại bố; dì qua lời người kể, không voice riêng | Chưa chọn/tạo |
| AUDIO | AM-TIEM, FX-DUNGCU/TIEN/GHE-AO/GIAY/MAY, VO-ME, AM-NHA/FX-BO/FX-GOI-DI, M1/M2 | Nguồn miễn phí/đã có có quyền dùng, rõ chất liệu/vị trí; tách giấy chỉ C6, không âm ma ở nhà | Chưa chọn/tạo |

Chưa cần tạo mặt/voice riêng của bố hoặc dì: bố ở phòng sau, dì đầu hẻm, xác định qua âm/tường thuật. Không biến họ thành vai hiện hình nếu chưa mở phạm vi. Concept nguyên bảng không thay cho các góc/pose/ảnh nền cần dùng trong DUNG-CANH. Lưu quyền dùng, đường dẫn, file và số dùng thật khi có; không đổi số lượt tạo thành credits.

## Prompt sửa gần nhất và trạng thái

Dùng built-in imagegen, không CLI/API/Gemini. Pass sửa trẻ: giữ nguyên Lộc đã chốt; Duy 16 mặt trẻ, giấu buồn/căng vai, đứng chắn trước Thảo 8, em nép sau níu gấu áo; giữ nét 2D có khối và nền giấy. Pass nét khó khăn: chỉ bạc màu vải, cổ/gấu áo mòn, mũi khâu gọn ở áo và quần, vá nhỏ cùng tông quần em, giày/dép cũ vẫn dùng được; giữ mặt/tuổi/tư thế, không thêm bầm tím/dơ mặt/người gầy già hoặc sửa Lộc.

Hai lượt chỉnh trẻ sau mẫu Lộc, không có số credits/tiền trong kết quả công cụ. Không suy ra giá từ lượt gọi/token; chưa tạo asset bố, bối cảnh, rig hay audio. V4 là đề xuất gần nhất, không gọi cả bảng đã duyệt.
