# Kế hoạch sản xuất tối ưu — Tin nhắn chưa gửi

**Định dạng đã chốt, 07/11/2026: giữ người dẫn chuyện kết hợp thoại nhân vật.** Lời dẫn giúp làm rõ thông tin, cảm giác khó quan sát và hệ quả cần hiểu; hình/âm đảm nhiệm hành động và diễn xuất. Cân đối để tránh kể lặp điều hình đã cho thấy. Chưa chuyển sang phim chỉ có thoại nhân vật; giữ lời dẫn theo bản nguồn hiện hành và đồng bộ LOI-DOC/ELEVENLABS sau biên tập.

**Asset đã cập nhật:** đã nhận bộ nâng cấp SVG của Antigravity tại commit `cd7243c`: rig, biểu cảm/tay, bối cảnh, đạo cụ, ảnh preview và 10 still. Mục tiêu của đợt này là cải tiến thư viện asset; mã/timeline tập được dùng thử hình. Timeline thử có 24 đoạn, 4.260 frame ở 30 fps = 142 giây; không phải bản dựng đủ kịch bản 35 cue hoặc thời lượng phim cuối. Chưa duyệt storyboard/animatic toàn tập hoặc tạo giọng/mix cuối.


Ngày rà soát: **08/11/2026**, sau nhận cập nhật ngõ. Áp dụng **kịch bản bản 8**, đã biên tập lời dẫn/thoại, giữ ba giao kèo và định dạng có người kể. Lượt đồng bộ tài liệu này không tạo thêm media. Nguồn nội dung là [KICH-BAN.md](KICH-BAN.md); chỉ dẫn hình/âm là [DUNG-CANH.md](DUNG-CANH.md); tài nguyên theo [ASSET.md](ASSET.md).

## Phạm vi và điều đã chốt

- Một tập kể trọn ba giao kèo và lời từ biệt. **Ước tính 10:42–12:55**, chưa có audio để đo. Mục tiêu 6–8 phút của kênh là mặc định thử nghiệm; tập này dài hơn do mở rộng đã yêu cầu. Không đọc nhanh hoặc tự chia cảnh mẹ sang tập sau chỉ để khớp định mức.
- **Duy anh trai 16, Thảo em gái 8**; cả hai gọi Lộc là **ông**, xưng **cháu**; Lộc tự xưng **tao**, gọi trẻ **mày/chúng mày**. Anh che chở nhưng cũng nhớ mẹ; em có hành động và lựa chọn riêng. Lộc lạnh, nguy hiểm, không đổi sang ông hiền.
- G1 Duy mất ký ức buổi tranh đồ chơi, mẹ dỗ rồi hai anh em làm hòa để sửa máy; G2 Duy nhận thêm phần trống vắng của em; G3 Thảo mất những giấc mơ về mẹ để cả hai có một cuộc gặp. Giá được báo trước, không hoàn sau cuộc gặp. Duy chậm vì đã kiệt sức khi em nhận G3.
- Mở đầu **24 giây không lời**: thành phố/trời sao/chữ → hạ tới cú → nét mắt → lùi lộ hẻm/nhà/tiệm → chuyển sang hai trẻ trước cửa → bước vào. Chữ là lớp riêng; cú không tự có vai phép thuật.
- Bốn nhóm không gian: thành phố–hẻm ngoài tiệm, nội tiệm, cánh đồng chủ quan, ngưỡng nhà. Mẹ hiện hình trong G3; bố qua bóng/âm khuất, dì qua lời kể. Chưa cần dựng nội nhà dì hoặc hồi tưởng riêng của bố.
- **9 phần cảnh, 35 cue thiết lập**; cue không bằng số ảnh mới, lượt gọi dịch vụ hoặc số lần cắt. Giữ lens/focus/pose theo DUNG-CANH; mặc định 16:9, roll 0°, rung 0 px; C5-C có rung/nghiêng ngắn và C6–C7 dùng 2:1 như nguồn bản 8. Thông số lens là ý đồ bố cục, chưa phải camera quang học đã triển khai.

## Thứ tự thực hiện và điều kiện chuyển bước

| Bước | Làm gì / đầu ra để xem | Khi nào chuyển bước | Cách giảm lượt làm lại |
|---|---|---|---|
| 1. Khóa bản văn và thiết kế | Đối chiếu nguồn–lời sạch–bản ElevenLabs; duyệt mẫu hai trẻ/mẹ và bố cục bối cảnh từ bộ asset mới, bổ sung đúng phần còn thiếu | Tuổi, luật, lời và diện mạo rõ; phản hồi được ghi vào GHI-CHU | Giữ mặt Lộc đã chốt; sửa đúng nhân vật/phần bị ảnh hưởng, không tạo lại cả bảng |
| 2. Storyboard tĩnh | Bảng ảnh thật theo 35 cue; ghi cue nào dùng chung nền/góc, có khung cho trạng thái thay đổi | Nhìn rõ thành phố–cú–cửa, không gian tiệm, tay/đồ, mẹ và cánh đồng; đủ mạch trước–sau | Dùng hình thô đủ đọc, dùng lại góc phản ứng; chưa hoàn thiện mọi biểu cảm hoặc lớp bị che |
| 3. Animatic | Ráp toàn tập bằng lời/âm tạm; chạy camera và tương tác dự kiến. Sửa trước các đoạn rủi ro trong bảng dưới | Xem bản chạy và bản ráp: nhịp, khoảng nghỉ, tiếp xúc, che khuất, chuyển cảnh đạt | Preview đủ soi mặt/tay; sửa clip lỗi rồi xem lại phần nối. Không dùng paid TTS chỉ để duyệt hình |
| 4. Hoàn thiện hình và giọng | Hoàn thiện asset/rig đã duyệt; chọn voice/model ElevenLabs bằng mẫu ngắn trước, rồi tạo lời chính thức | Nghe giọng đúng cảm xúc, đủ vai; audio thực có mốc để cập nhật timing | Giữ các đoạn đã đạt. Muốn nhiều giọng/tái tạo từng đoạn phải có quy trình ráp riêng; backend cũ chỉ một voice/cache cả bài |
| 5. Phối âm và xuất kiểm tra | Thêm nhạc theo cảm xúc, Foley đúng chất liệu/tiếp xúc, môi trường đúng gần–xa; cập nhật hình theo audio thật | Xem/nghe bản xuất: không vật bay/xuyên/trượt, lời rõ, nhạc đủ nghe, âm quan trọng có sức nặng, khoảng nghỉ đủ | Tìm nguồn miễn phí hoặc thư viện đã có, ghi quyền dùng; hoàn thiện và render lại phần phụ thuộc thay đổi |
| 6. Bàn giao | Phim cuối, đường dẫn đầu ra, nguồn media, thời lượng đo, log lượt tạo/credits thực và trạng thái repo | Sản phẩm đã xem/nghe và file nguồn khớp; không báo hoàn tất bằng log render đơn thuần | Giữ mã/asset dùng lại, ghi bài học chung; media nặng lưu đúng chỗ theo slug thay vì đẩy tự động lên Git |

**Hai bước duyệt hình vẫn là storyboard → animatic.** Bước chuẩn bị thiết kế không thay storyboard; ảnh đầu–giữa–cuối chỉ hỗ trợ soi, không thay xem animatic. Dựng animatic cần mã shot/rig/timeline của tập; studio hiện chưa tự chuyển Markdown thành phim.

## Nhóm asset dùng lại và thứ tự ưu tiên

| Nhóm | Chuẩn bị vừa đủ | Cách dùng lại / giới hạn |
|---|---|---|
| Nhân vật | Đã có concept và mẫu SVG Duy/Thảo/Lộc/mẹ; đối chiếu thiết kế đã chốt, duyệt pose theo hành động thay vì một ảnh mỗi câu | Giữ trang phục/tỷ lệ giữa các góc. Không cần mặt bố, dì hoặc người nền chi tiết |
| Thành phố–hẻm–cú | Toàn trời/skyline; lớp hẻm/cửa/mái-thanh; cú trung/toàn và cận đầu/mắt khớp; ngõ mới không có bóng người qua đường; chữ riêng | C0 cần nhiều cỡ hình khớp, không phóng một ảnh toàn thành cận mắt. Dùng mái che điểm ghép; chỉ vẽ vùng máy sẽ lộ |
| Tiệm | Một sơ đồ cố định, góc chung/cận dùng lại, insert máy/tiền/ảnh/giấy theo trạng thái | Phần lớn C1–C5 và C8 dùng cùng set. Chỉ đổi pose, ánh G2 và trạng thái đạo cụ; giữ cửa đông khớp ngoại cảnh |
| Cánh đồng | Bờ đất/cỏ gần, nhóm người giữa, ruộng/trời xa; góc đi và ngồi đủ dùng | C6–C7 chung set/trục; chuyển động cần thiết là đi/nắm tay/ngồi/ôm/tan, không thêm quay vòng phức tạp |
| Ngưỡng nhà | Một khu vực cửa đủ thấy dấu vết đời sống và nghe bố sau vách | Không dựng toàn căn nhà hoặc nhà dì; tái dùng lớp hẻm nếu góc thực sự khớp |
| Âm thanh | Giọng người kể + Duy/Thảo/Lộc/mẹ; mẹ ghi âm và ở đồng cùng giọng, xử lý nguồn khác. Nhạc/ambience/Foley theo cue | Bố không thoại rõ; dì không voice riêng. Chọn lại trong thư viện trước, không tạo trả phí hàng loạt |

Nền có lớp gần–giữa–xa, điểm tụ và bóng tiếp xúc thống nhất. Đối thoại ưu tiên máy tĩnh/diễn xuất nhỏ; chuyển động mạnh nhất phục vụ dẫn mắt ở mở đầu và hành động cảm xúc. Chưa có dữ liệu để chốt số lượt tạo hoặc phần trăm tiết kiệm quota.

## Những đoạn phải thử trong animatic trước khi hoàn thiện

| Phần | Điều cần nhìn thấy khi chạy |
|---|---|
| C0 → C1 | Đường máy đủ 24 giây, điểm ghép mái/mắt không nhảy; cú bám thanh, giữ ngõ trống đúng asset mới, bước qua cửa nối đúng trục rồi mới với đồng hồ |
| C1–C4 / G1 | Lộc gắt/mỉa mai, Thảo ứa nước mắt; Lộc về bàn sau làm tiếp đồng hồ rồi trở lại quầy; Duy đưa lại tiền em; đặt–thả máy, cất tiền, lấy/cất ảnh, cầm/đặt bút, ký/tách giấy; vỏ máy trước/sau sửa khớp; ký ức mất không phải quên thân phận |
| C5 / G2 → G3 | Rung/nghiêng C5-C nằm trong nghỉ sẵn có và về 0 trước C5-D; Duy nhận sau lời báo giá; hơi ấm qua rồi kiệt rõ; còn thấy anh cố phản ứng trong lúc Lộc báo G3; em nhận trọn trước câu ngăn; trắng/ù đúng một lần |
| C6–C7 | Giữ 2:1, roll/rung 0; mặt/tay/điểm tì đủ trong vùng hình; nắm tay đúng bên, bước có mặt đất, nhả/chuyển tay khi ngồi và ôm; mẹ/áo/bóng cùng tan; khoảng trống còn lại là dụng ý, không lỗi pose |
| C8 | Về 16:9 ngay cú cắt, đúng ghế/tay ở tiệm, đủ ba liên khách, đồ được cất thật; bố khuất, cuộc gọi dì và đi khỏi cửa; các giá còn hiệu lực |

## Quản lý chi phí và thay đổi

- Làm theo thứ tự ở trên; chỉ tạo media khi nhiệm vụ tiếp theo bao gồm bước đó. Lập kế hoạch và rà repo không tự chạy các dịch vụ ảnh/giọng/video.
- Sau khi duyệt một bước, ghi phiên bản và phản hồi cụ thể. Nếu đổi lời thì đồng bộ bản lời, sau đó cập nhật timing/cue/audio/hình thực sự phụ thuộc; không dùng lại mốc cũ một cách máy móc.
- Khi có audio thật, thay ước tính bằng số đo. Hiện lời sạch **1,916 đơn vị tách khoảng trắng, 8,602 ký tự** gồm xuống dòng; **29 giây nghỉ riêng**, **24 giây mở đầu**, thêm **8–12 giây chuyển khác**. Không cộng thêm các đoạn hình/nhạc đang chạy dưới lời.
- Ghi riêng lượt ảnh, ký tự TTS, credits theo model, quota trợ lý nếu biết và thời gian render. Không đổi token thành credits hoặc hứa số video từ gói chưa đo. Chưa có chi phí media thực cho lượt tối ưu này.

## Phạm vi đồng bộ đã rà trong repo

| Nội dung | File hiện hành cần khớp | Kết quả rà văn bản 07/11/2026 |
|---|---|---|
| Tuổi, vai và xưng hô | KICH-BAN, DUNG-CANH, README tập; lời trong LOI-DOC/ELEVENLABS | Duy anh 16, Thảo em 8; trẻ xưng cháu/gọi ông, Lộc xưng tao/gọi mày; đúng người nói |
| Ba giá, người trả, mẹ, bố/dì | KICH-BAN, DUNG-CANH, ASSET, README và GHI-CHU | G1/G2 Duy, G3 Thảo; mẹ từng che con khỏi bố bạo hành, hiện hình ở G3; bố/dì không thành tuyến dựng riêng; ba biên nhận rõ vai trò |
| Đoạn mở, cue và thời lượng | KICH-BAN, DUNG-CANH, ASSET, README, mục lục docs/KICH-BAN | C0-A…F 24 giây; C0 + C1–C8, 35 cue; giữ ước tính mới |
| Lời đọc | KICH-BAN → LOI-DOC và ELEVENLABS | Đối chiếu toàn bộ đoạn được đọc; loại thẻ để so nội dung; C0/chỉ dẫn không vào TTS |
| Nơi tìm kế hoạch và quy tắc cập nhật | README gốc/tập, CLAUDE, skill/SKILL và look, docs/WHAT-IF-QUY-TRINH, docs/KICH-BAN, docs/ASSET | Liên kết về kế hoạch tập; hướng dẫn rà file phụ thuộc sau mỗi đổi |
| Media đã có / phần cần làm | ASSET, README, kế hoạch này | Có concept, mã SVG/rig/sets và ảnh preview/10 still; mẫu mới chờ duyệt theo cảnh; chưa có giọng, storyboard/animatic toàn tập hoặc phim cuối đã duyệt |

Phạm vi rà là tài liệu đang hướng dẫn sản xuất và hồ sơ tập hiện hành. GHI-CHU ghi bản cũ để đối chiếu; tập mưa/snapshot và ví dụ kỹ thuật giữ trạng thái lịch sử, không đổi chúng thành cốt truyện hiện tại. VieNeu trong mô tả backend cũ là thông tin tương thích, không phải lựa chọn giọng mới.

**Bước kế tiếp:** chọn và duyệt asset từ bộ đã nâng cấp, ráp storyboard theo bản nguồn có người dẫn chuyện, rồi animatic có âm tạm. Có thể tận dụng mã thử sau khi đối chiếu cue; giữ 35 cue nguồn cho đến khi có chỉnh sửa biên tập rõ. Timeline thử 142 giây không được dùng để kết luận thiếu nội dung hoặc thay ước tính thời lượng toàn tập. Chưa có storyboard/animatic toàn tập hoặc phim cuối đã xem/nghe để xác nhận chất lượng chuyển động/âm thanh.
