# Biên tập bản 14 — vào tiệm, bị quát, hỏi sửa máy

09/11/2026. Chủ repo yêu cầu đầu cảnh có đầu–đuôi, lời dẫn ngắn hơn và chỉ dẫn effect chuyên sâu. Đây là **bản chỉ đạo dựng**, chưa phải hiệu ứng đã render hoặc duyệt. Nguồn lời duy nhất: [KICH-BAN](KICH-BAN.md); các thông số dưới là điểm thử ở 1920×1080/30 fps.

## Mạch kể và phần rút

Giữ tuyến trời sao → cú → hẻm → hai anh em theo phác thảo, rút C0 từ 24 còn **14 giây**. Gia cảnh đầu từ **81 còn 28 đơn vị cách trắng**: mẹ mất, mẹ từng che con khỏi bố say đánh, Duy không dám để em một mình. Dì Hạnh/chỗ làm của Duy giới thiệu trong câu dẫn C2 có liên quan trực tiếp đến đoạn ghi âm. Không đưa cả tiểu sử vào giữa câu xin sửa và câu trả lời.

Trong tiệm: nhìn đồ lạ → Thảo nhấc đồng hồ đứng kim/xoay chìa → Lộc quát → em đặt lại → anh che em, xin lỗi rồi hỏi sửa → lấy máy ra → ông hỏi tình trạng → Duy nói điều cần cứu → ông xem máy → báo giá. Nhờ vậy giá 800.000đ có đối tượng và nguyên nhân rõ. Điện thoại còn trong túi cho tới lúc Duy hỏi, không xuất hiện sẵn trên quầy.

Nhịp đầu Thảo tò mò, chỉ giật mình sau tiếng quát; tới lời mỉa mai tiền mới rơm rớm rõ. Duy đang lo nhưng vẫn lễ phép, sau đó mới chuyển sang năn nỉ khi biết thiếu tiền. Không thêm tai nạn đổ/vỡ hoặc một món nợ vì nghịch đồng hồ.

## C0 — 14 giây, giữ chuyển động có đà

| Cue / thời gian | Hình, camera và focus | Nối và âm |
|---|---|---|
| A / 0–3 s | Toàn 24 mm tương đương; trời và tiêu đề trên skyline, đủ độ tương phản để đọc trên điện thoại. Máy bắt đầu hạ nhẹ ở cuối, không giữ một poster bất động cả đoạn. | Bed đêm có từ frame đầu, âm phố rất xa; nhạc không lời thưa nếu có bản được phép dùng. Tiêu đề là lớp chữ riêng, không TTS. |
| B / 3–5 s | Hạ qua mái hiên 35–50 mm; đồng tốc với cuối A, tiêu đề mờ hết trước mắt cú. Mái gần đi nhanh hơn nhà xa; không kéo cả bức tranh cùng một tốc độ. | Mái hiên che điểm đổi tấm khi cần; nền phố giữ liên tục, không whoosh. |
| C / 5–6 s | Cận mắt 85 mm; đã gần nét từ B, chỉ tinh nét khoảng 0,2 s. Giữ đồng tử/phản chiếu đèn ổn định. | Chớp mắt chỉ khi đủ nhịp; không bắt buộc chớp để lấp đủ động tác. Không âm chớp mắt hoặc ánh mắt phát sáng. |
| D / 6–9 s | Mở ra góc 35 mm thấy cú–mái gần trái, tiệm phải-xa. Dùng điểm ghép kín nếu chưa có hình nối macro–toàn; sau ghép chỉ dolly-out vừa phải, không tăng tốc zoom xuyên tranh. | Giữ hướng màn hình và vị trí mốc cú; hẻm hiện dần qua âm phố lùi xa. |
| E / 9–12 s | Trượt chéo về hai trẻ, cao kết khoảng 1,2 m, chuyển chú ý từ cú sang cửa. Giảm tốc trước điểm dừng, để Duy áo xanh xám/Thảo áo vàng đọc rõ. | Quạt từ cửa tăng theo khoảng cách; thở Duy chỉ ở cự ly gần. Không thêm người nền trái asset ngõ đã chốt. |
| F / 12–14 s | 50 mm ngoài cửa → cắt theo bước sang 35 mm trong tiệm. Chân qua ngưỡng thật, không trượt hai sprite. | Bước giày/dép đúng tiếp xúc; quạt làm cầu âm. Không thêm tiếng mở cửa vì cửa đang mở; nhạc rút trước câu quát. |

Nếu thử chuyển động thấy quá nhanh, gộp B/C bằng điểm ghép kín thay vì ép máy lao nhanh hơn để giữ mọi động tác. Duyệt đường nhìn liền mạch; 14 giây là mục tiêu biên tập ban đầu, không kéo nhanh cả phim để đạt số này.

## C1 — diễn trước, máy và FX theo sau

Tất cả C1 **16:9, roll 0°, rung 0 px**. Lens là mục tiêu bố cục, không tự biến rig 2D thành máy quay 3D. Không xuyên/vòng qua mặt phẳng nhân vật nếu thiếu góc vẽ. Các nhịp dưới bám lời/hành động; chỉ hai khoảng 1,2 và 2 giây đã ghi trong nguồn được cộng riêng.

| Beat / cue dùng lại | Diễn xuất và vật thể | Camera, focus, ánh sáng | Âm / nhịp dựng |
|---|---|---|---|
| Vào tiệm, câu kể 28 đơn vị / C1-A | Duy tiến tới vùng khách rồi nhìn về bàn sau; Thảo dừng ở kệ thấp gần cửa. Cậu giữ túi máy, em nhìn đồng hồ trước khi đưa tay. Có đổi trọng tâm, mắt dẫn đầu trước thân. | Master 35 mm, cao 1,15 m, cách quầy khoảng 2,7 m; dolly-in tối đa 1–2% khung trong cả nhịp rồi hãm. Vùng tay em/kệ vẫn đọc được, không xóa phông cực mạnh. | Chân dừng, quai túi/vải rất nhẹ, quạt nền. Lời kể kết trước câu Thảo; không đọc lại động tác đã thấy. |
| Thảo nghịch / C1-D dùng góc 50 mm | Nhìn đồng hồ → đỡ đế bằng một tay, tay kia giữ thân → nhấc vừa khỏi kệ → ngón xoay chìa phía sau một nấc. Không để chìa tự xoay. Em hỏi anh, không nói với Lộc. | Cắt theo hướng nhìn; trung hai trẻ phải đủ thấy đồng hồ và mặt kệ. Chuyển nét từ mặt em xuống đồng hồ khoảng 0,4–0,6 s nếu vẫn đọc được mắt; dùng lại cùng góc thay vì tạo cận mới không có asset. | Một tiếng cóc kim loại nhỏ đúng lúc chìa qua nấc; **không tích tắc**, chuông hoặc âm ma. Không nhạc dễ thương làm mất không khí lạ. |
| Tiếng quát / C1-B ở bàn sau | Tua vít dừng trước lời; mắt Lộc chuyển sang tay em, cằm nâng rất ít, miệng mở đúng âm. Không cười ở nhịp này. | Cắt dứt sang cận 70 mm, hướng lên khoảng 7°, một nửa mặt trong sáng đèn bàn. Cắt trước phụ âm đầu 1–2 frame hoặc đúng lúc ông ngẩng; không giật zoom/rung để thay uy lực. | Giọng quát ngắn, có âm phòng ở khoảng cách bàn sau; hạ nhạc 4–6 dB trong khoảng 80–120 ms nếu nhạc còn có. Quạt/hẻm vẫn tồn tại, không im kỹ thuật số. Không boom/sub-hit. |
| Phản ứng / C1-D → C1-A, **1,2 s** | Em co vai, mắt khựng; tay vẫn giữ chắc đồng hồ. Hạ đế tới kệ rồi ngón mới nhả. Duy bước chếch nửa bước chắn em, không chộp giật tay đang cầm vật. | Cắt sang người nghe khi nửa sau câu quát còn vang là một L-cut; giữ cùng trục, Duy trái/Thảo phải. Máy đứng để nhìn rõ động tác. | Vải sột, em hít khựng một lần; tiếng đế chạm gỗ đúng frame. Không lạm dụng tiếng nhép môi. Gói gọn cả đặt–nhả–che em trong khoảng đã ghi, không cộng thêm ba khoảng nghỉ khác. |
| Xin lỗi và hỏi sửa / C1-A → C1-C | Duy nhìn Lộc để nói, sau khi em đã buông đồng hồ mới rút máy bằng tay thật. Hạ máy lên khăn, đợi chạm rồi nhả. Em nép sau, tránh nhìn máy vì còn giấu lỗi. | Master tái định vị hai trẻ và quầy; cắt theo tay rút máy sang insert 65 mm/cúi 40°. Khăn là vị trí có sẵn, không tự bay tới đỡ máy. | Vải túi → nhựa máy chạm khăn mềm; không tiếng kính nứt mới. Giọng Duy ngại nhưng nói hết ý, chưa khóc hay xin đổi ký ức. |
| Hỏi tình trạng / C1-A và C1-D | Lộc đặt dụng cụ ở bàn sau, bước tới quầy sau câu xin sửa. Duy nói đoạn ghi âm, hơi chậm ở chữ “mẹ”; Thảo nhìn xuống máy. | Dùng góc chung để thấy ông đi thật; không dùng crop C1-B ở bàn sau cho ông đứng trước quầy. Có thể giữ câu Lộc dưới mặt Duy để thấy cậu tìm lời. | Bước/dụng cụ nhỏ đúng vị trí; quạt không đổi âm lượng đột ngột theo cut. Không nhạc buồn dâng lớn ngay khi nhắc “mẹ”. |
| Xem máy / C1-C, **2 s** | Tay Lộc nắm cạnh máy → nhấc → nghiêng xem nứt → bấm nguồn → đặt lại cùng khăn. Màn hình vẫn đen. Không tháo máy hoặc làm sáng trước giao kèo. | Insert 65 mm; vùng nét bao trùm nút/tay/vết nứt. Ánh phản chiếu chạy nhẹ do máy nghiêng, không vẽ màn hình tự phát sáng. | Nút bấm khô rất nhỏ, không beep khởi động; nhựa chạm khăn. Động tác cần thật sự có trong animatic, không thay bằng giữ ảnh máy hai giây. |
| Báo giá → thiếu tiền / C1-A/D/C | Lộc đặt máy rồi báo giá; Duy khựng trước khi lấy tiền. Tiền chỉ xuất hiện khi rút ra. Thảo chỉ chìa 20.000đ ở lượt xin giúp sau đó. | Câu “Tám trăm ngàn” từ góc chung nơi Lộc đang ở quầy; cận phản ứng em/anh, rồi insert tiền. Không nhảy Lộc về bàn sau cho đủ góc cận. | Để giá rơi vào nền quạt, không sting kiểu game show. Tiếp diễn theo lời hiện có; phản ứng mắt/thở sống trong câu và khoảng nối, không mặc định thêm 2–3 giây mỗi cut. |

## Hiệu ứng chiều sâu, màu và liên tục

- **Lớp cảnh:** kệ sát máy → hai trẻ/vật cầm → mép quầy → Lộc/bàn sau → tường/cameo. Chỉ tách thêm lớp nếu chuyển máy thực sự cần. Parallax từ cùng trạng thái camera; đồ gắn tường không trôi độc lập, bóng tiếp xúc bám đúng mặt đỡ.
- **DOF giả lập:** ưu tiên tương phản/nét ở mắt và tay. Ở bản thử 1080p, bắt đầu blur nền 1–3 px, tiền cảnh 3–6 px, lớp diễn 0 px; đây là mức thử, không áp vào toàn cảnh hoặc làm nhòe chữ/tiền. Chuyển nét nội suy cùng chiều, không bật/tắt blur sau một frame; kiểm tra sau hạ xuống 480p.
- **Ánh sáng:** hổ phách đèn bàn sau và chàm từ cửa như bản đã chốt; thêm ánh hắt đủ đọc mắt trẻ, bóng tay lên vật/quầy và cạnh áo theo nguồn thật. Khi em xoay máy/đồng hồ, phản xạ thay đổi cùng mặt vật. Không nháy đèn, đổi màu cả phòng, tối sầm hoặc cho mắt Lộc phát sáng ở tiếng quát; các hiệu ứng ấy làm lộ năng lực quá sớm.
- **Chuyển động nhỏ:** bàn tay có trễ khớp, vai đi theo thân, tóc/vạt áo dừng sau thân vài frame khi cần; không cho mọi bộ phận dao động cùng sine. Pose nghe khác pose nói, mắt tìm người rồi đầu mới theo. Không chớp mắt lặp đều hoặc lip-sync người đang im.
- **Tiếp xúc:** khi đang cầm, vật gắn đúng bàn tay/cặp tay; tại frame đế chạm kệ/khăn chuyển parent mà giữ nguyên vị trí/rotation thế giới. Sau nhả, vật đứng yên theo mặt đỡ. Kiểm tra trước/sau mốc chạm từng frame, không chỉ xem hình đầu/cuối.
- **Ghép góc:** dựng cùng trục cửa–quầy; nối mắt, tay và hướng thân. Cắt đúng động tác để chuyển góc có lý do, không dissolve chồng hai khuôn mặt/tay hoặc whip-pan mọi câu. Motion blur chỉ rất nhẹ cho vật đang di chuyển nếu cần; mặt/chữ và thời điểm chạm phải rõ.
- **Âm có chiều sâu:** nghe quạt/hẻm xuyên các cut; độ gần của bước, giọng Lộc và tiếng dụng cụ phải theo khoảng cách thực của vị trí máy/người. Không có tích tắc trong tiệm đồng hồ dừng. Mở rộng hiệu ứng không có nghĩa chọn đại âm pack KORBANN chưa nghe duyệt/chưa xác minh quyền.

## Bảng item nguồn để Claude ánh xạ lại

Đây là **đề xuất ánh xạ bản 14**, không phải `cues.json` đã dựng lại. C1 có 20 item; item bao gồm cả lời và khoảng nghỉ nên không đồng nghĩa 20 lượt nói. C2 giữ chỉ số cũ, item 3 đổi nội dung dẫn về dì Hạnh.

| Cảnh / item (0-based) | Cue dự kiến | Nội dung |
|---|---|---|
| C1 / 0 | C1-A | Một đoạn gia cảnh ngắn, hai trẻ nhìn không gian và tiến tới kệ/quầy |
| C1 / 1 | C1-D | Thảo hỏi về đồng hồ đang cầm |
| C1 / 2 | C1-B | Lộc quát từ bàn sau |
| C1 / 3 | C1-D → C1-A | 1,2 s đặt–nhả–che em; có thể chia hình trong cùng item, không đếm lặp thời gian |
| C1 / 4 | C1-A → C1-C | Duy xin lỗi, hỏi sửa, rút/đặt máy |
| C1 / 5–6 | C1-A → C1-D | Lộc hỏi tình trạng, Duy nói nhu cầu; ông ở quầy |
| C1 / 7 | C1-C | 2 s xem máy và đặt lại |
| C1 / 8–13 | C1-A/C/D theo động tác | Báo giá, tiền thiếu, hỏi trả dần, xin cứu đoạn ghi âm |
| C1 / 14–18 | C1-D/A | Thảo muốn về, góp tiền, 1 s nghỉ, Lộc gắt/mỉa mai; ở quầy |
| C1 / 19 | C1-A → C1-B | Ông về bàn sau rồi gợi cách khác, nhếch miệng; không dịch crop qua không gian |
| C2 / 0–9 | Giữ ý đồ cue C2, retime theo lời mới | Giá ký ức, từ chối, dì Hạnh/ghi âm, hai trẻ nói chuyện; kiểm tra thực tế trước đổi hash |

`voices.json` đã ánh xạ vai và hash nguồn 14 để liệt kê lời an toàn. `cues.json`, voice-manifest, timeline và staging hiện còn dấu bản 13. **Không thay hash chúng để vượt guard** khi chưa sửa item, mốc diễn và audio tương ứng. ID take có thể dịch; tái dùng theo vai + nội dung + model + settings + tag, không theo số ID cũ. Không gọi dịch vụ trả phí trong lượt biên tập này.

## Nghiệm thu bản nháp

1. Xem từ C0-F tới báo giá khi máy khóa trước: người xem thấy ai nghịch gì, vì sao bị quát và hai trẻ đến nhờ gì. Không cần narrator đọc hộ bất kỳ động tác nào.
2. Xem lại với camera/focus/âm tạm: đồ không trượt/bay/xuyên tay; ông đi từ bàn sau tới quầy thật, còn màn hình đen; hai lần quát và mỉa mai không diễn Thảo cùng một mức sợ từ đầu.
3. So sánh trước/sau ở cỡ điện thoại: đọc rõ tiêu đề, mắt, bàn tay và điểm tiếp xúc; nếu blur, parallax hoặc cut làm khó hiểu thì giảm hiệu ứng đó trước.
4. Nghe liền mạch: có môi trường từ đầu, nền không tắt theo cut, quát nghe tự nhiên không clipping; tiếng vải/tiếp xúc đủ rõ theo cự ly, không phóng đại mọi nhép môi/hơi thở.
5. Sau khi chốt timing mới hoàn thiện ánh sáng/DOF/Foley; xuất bản nháp v14 và ghi rõ chi phí/thời lượng đo thật. Lượt này chưa thực hiện các bước xem/nghe/render đó.
