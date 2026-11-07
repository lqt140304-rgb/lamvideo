# Asset — Tin nhắn chưa gửi, bản 4

07/11/2026. Đã có concept nhân vật hiện hành v4 (v2 giữ để đối chiếu mặt Lộc), mặt Lộc đã được chủ repo chốt, hai trẻ vừa sửa còn chờ duyệt. Chưa có hình hẻm/nội thất, asset tách lớp, rig, audio, storyboard, animatic hoặc video. Nguồn lời [KICH-BAN.md](KICH-BAN.md); sơ đồ và cue [DUNG-CANH.md](DUNG-CANH.md).

## File đã có

| File | Nguồn / phiên bản / mục đích | Duyệt / quyền dùng / chi phí |
|---|---|---|
| [duy-thao-loc-concept-v4.png](assets/nhan-vat/duy-thao-loc-concept-v4.png) | Công cụ imagegen tích hợp, 07/11/2026; từ concept tự tạo: sửa Lộc, rồi giữ Lộc/sửa hai trẻ thành dáng che chở và thêm đồ cũ có vá nhẹ. Preview nhân vật cho tập, ảnh phẳng nguyên bảng | Lộc đã chốt, hai trẻ chờ duyệt; ảnh AI, không dùng ảnh người thật hoặc nguồn Gemini làm input. Chưa rà điều khoản khai thác thương mại riêng, không gắn giấy phép mã repo cho ảnh. Không có số credits/chi phí nhà cung cấp trả về, chưa quy đổi |

Prompt tạo đầu: bảng toàn thân ba nhân vật Việt, 2D điện ảnh vẽ tay có khối, nền kem; Duy anh trai 16 áo thun xanh xám/quần xanh than/giày vải; Thảo em gái 8 áo vàng/quần lửng xanh/dép quai/tóc buộc nửa đầu; Lộc thợ sửa 60 sơ mi xám/quần nâu/kính cũ. Prompt sửa: chỉ đổi Lộc, mặt góc cạnh không cười, mắt lạnh dưới chân mày thấp, đầu hơi cúi, dáng cứng lặng, tay gân, ánh hổ phách hẹp và nửa mặt trong bóng; giữ nguyên trẻ/bố cục/phong cách, không thêm vũ khí hay hiệu ứng phép. Dùng built-in, không CLI/API và không dùng Gemini.

Ảnh đầu hiền hơn là bản thử bị thay, không phải tạo hình đã duyệt. Không cần lưu mọi bản bỏ vào repo. Mặt Lộc từ v2 đã được chủ repo xác nhận ổn. V4 cập nhật riêng hai trẻ; chưa duyệt, không chứng minh đã tách lớp hoặc chuyển động được. Bản v2 trong cùng thư mục chỉ để đối chiếu mẫu mặt Lộc, không là mẫu trẻ hiện hành.

## Cần chuẩn bị theo bản 4

| ID | Tài nguyên / ràng buộc | Trạng thái |
|---|---|---|
| CHAR-DUY / CHAR-THAO | Giữ tuổi 16/8, đồ cũ, dáng che chở; thêm kiệt sức G2 và nét trẻ ở đồng. Không lấy mặt Lộc làm mẫu tuổi cho trẻ | Có concept v4 hai trẻ chờ duyệt; chưa rig/pose |
| CHAR-LOC | Giữ mặt đã chốt, thêm nét cười lạnh nhẹ khi Thảo hỏi sau G1 | Mặt đã chốt, chưa rig/pose |
| CHAR-ME | Khoảng 38–42, áo vải đất sáng/quần tối/tóc buộc thấp; gọi, đi nắm tay, ngồi/ôm/tan; không hào quang | Chưa tạo/duyệt |
| SET-TIEM | Quầy/kệ trái/cửa phải mở/bàn sửa sau, ghế em có bậc; G2 chỉ đổi ánh chủ quan | Chưa tạo |
| SET-CANHDONG | Bờ đất bằng/lúa/thảm cỏ ngồi, nắng chiều; cỏ gần/nhóm giữa/ruộng trời xa; không nhà mới hoặc người qua đường | Chưa tạo/duyệt |
| SET-NHA | Ngưỡng nhà, bàn may trái/bàn thờ phải, bố sau vách, đường về phía nhà dì | Chưa tạo |
| PROP-MAY | Giữ vỏ trước/sau sửa C4, ghi âm rồi dừng qua G2/G3; gọi dì ở cuối | Chưa tạo |
| PROP-TIEN / TUI / VI / ANH | 186.000+20.000 vẫn thiếu 800.000; trả/gom tiền, cất túi; ảnh cất trước ký G1 | Chưa tạo |
| PROP-G1-G2-G3 | Ba phiếu hai liên, khách/tiệm mỗi bên một bộ. G1 Duy ký trước sửa; G2 Duy nhận bằng lời; G3 Thảo nhận bằng lời trước anh ngăn. Chữ lớp riêng | Chưa tạo |
| VO-ME-REC / VO-ME-FIELD | Bản cũ từ máy và mẹ nói trong miền cảm giác, cùng vai/giọng có xử lý nguồn khác nhau | Chưa chọn/tạo |
| AUDIO-TIEM / FX-GIAO-KEO | Quạt/hẻm, dụng cụ/tiền/vải/ghế/giấy/máy; trắng-ù chỉ G3 | Chưa chọn/tạo |
| AUDIO-DONG / NHAC | Gió lúa/chân đất/vải, nhạc ấm thưa nghe rõ chuyện đời thường, giảm trước tan | Chưa chọn/tạo |
| AUDIO-BO-DI | Bố chai lăn/càm ràm không rõ chữ sau vách; dì qua lời người kể, không mặt/voice riêng | Chưa chọn/tạo |

Phạm vi tăng thành ba không gian và mẹ hiện hình; không tạo thêm hình/audio ở lượt viết này. Ảnh concept cũ không bao gồm mẹ/ruộng/pose đi-ngồi-ôm. Asset riêng vẫn trong hồ sơ tập; media vận hành studio dùng cùng slug khi được sản xuất. Chưa chọn nguồn âm hoặc xác minh giấy phép cụ thể, chưa đo chi phí. Không suy từ số cue thành số lượt gọi ảnh.

## Prompt sửa gần nhất và trạng thái

Dùng built-in imagegen, không CLI/API/Gemini. Pass sửa trẻ: giữ nguyên Lộc đã chốt; Duy 16 mặt trẻ, giấu buồn/căng vai, đứng chắn trước Thảo 8, em nép sau níu gấu áo; giữ nét 2D có khối và nền giấy. Pass nét khó khăn: chỉ bạc màu vải, cổ/gấu áo mòn, mũi khâu gọn ở áo và quần, vá nhỏ cùng tông quần em, giày/dép cũ vẫn dùng được; giữ mặt/tuổi/tư thế, không thêm bầm tím/dơ mặt/người gầy già hoặc sửa Lộc.

Hai lượt chỉnh trẻ sau mẫu Lộc, không có số credits/tiền trong kết quả công cụ. Không suy ra giá từ lượt gọi/token; chưa tạo asset bố, bối cảnh, rig hay audio. V4 là đề xuất gần nhất, không gọi cả bảng đã duyệt.
