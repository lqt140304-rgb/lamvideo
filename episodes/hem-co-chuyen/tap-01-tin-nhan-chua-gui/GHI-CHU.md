# Ghi chú riêng — tập 01

## Giọng ElevenLabs và animatic có giọng — 08/11/2026

**Model:** `eleven_v4`. Chủ repo chọn model này trên giao diện; mẫu thử đầu tiên dùng v3 và đã bỏ.

**Vai do chủ repo chọn:**

| Vai | Giọng | Voice ID |
|---|---|---|
| Người dẫn | giọng clone của chủ repo, Trung Lê Quốc | `HXqqNj3PDxRdHVH1pXog` |
| Duy | Nhật Phong | `6adFm46eyy74snVn6YrT` |
| Thảo | Yuna | `aHC3XZOMg3HZuXVYK6hy` |
| Mẹ | Chi | `5yEPTrA0uAhZsBEhHjfi` |
| Ông Lộc | Dũng | `BUPPIXeDaJWBz696iXRS` |

Cả năm giọng đều là giọng Bắc, trong khi lời có vài khẩu ngữ Nam ("bữa đó", "giùm"); cần nghe xem có lệch không. Cấu hình nằm ở [voices.json](../../../what-if-studio/src/episodes/tin-nhan-chua-gui/voices.json).

**Cách tạo:**

- Mỗi mảnh lời một request. Phần kể chuyện dùng giọng người dẫn; mỗi câu trong ngoặc kép dùng giọng nhân vật theo bảng `speakers` (70 câu, mã cảnh.câu.mảnh).
- Thẻ cảm xúc lấy từ ELEVENLABS.md, chỉ gắn vào câu thoại đứng ngay sau thẻ.
- Tổng cộng 143 mảnh, 8.451 ký tự, 608,8 giây lời.
- Bản ghi âm của mẹ (4.6.0) được lọc dải 320–3.400 Hz cho giống tiếng loa điện thoại.

**Công cụ** (trong `what-if-studio/`):

1. `voice.cjs lines` tạo các mảnh còn thiếu, đặt tên theo hash nội dung nên không tạo lại mảnh đã có.
2. `build-timeline.cjs` lấy thời lượng thật của từng mảnh, cách nhau 0,15 giây trong cùng câu và 0,3 giây giữa các câu.
3. `voice-track.cjs` ghép thành `public/tin-nhan-chua-gui/voice/voice-track.mp3`.

Thư mục giọng (21 MB) giữ local, đã đưa vào `.gitignore`.

**Thời lượng đo được:** **11:48** (21.251 frame), gồm lời thật + 33 giây nghỉ + 24 giây mở đầu. Ước tính trước đó là 12:21.

**Chi phí thực:** bộ đếm tài khoản tăng từ 17.731 lên 22.168, tức **4.437 credit** cho cả mẫu thử lẫn toàn bài. Lịch sử tạo ghi 165 lượt, cộng 4.437 ký tự. `costs.json` ghi theo từng lần chạy thấp hơn con số này vì bộ đếm cập nhật chậm; lấy 4.437 làm số chuẩn.

**Chưa nghe kiểm tra:** chất giọng, thẻ cảm xúc có bị đọc thành chữ không, độ to giữa các giọng. Chưa có nhạc, Foley hay âm nền.

**Đầu ra:** animatic v1 (câm, có phụ đề) ở `D:\lamvideo-xuat\what-if\tin-nhan-chua-gui\`; animatic v2 có giọng render vào cùng thư mục.

## Claude bắt đầu dựng — storyboard 35 cue v1 — 08/11/2026

Dựng bằng Opus 5.5 theo yêu cầu chủ repo.

- Thay timeline thử 24 đoạn bằng 35 cue. Timeline sinh từ lời nguồn, ước tính 12:21 (xem [CUE-SHOT.md](CUE-SHOT.md)).
- Đổi tên shot trùng mã cue và viết thêm 11 shot còn thiếu.
- Xuất lại `preview_color_script.png` và `preview_meadow_g3.png` sau hai sửa của Codex.

Chủ repo phản hồi trong lúc dựng và đã sửa:

- **Chân không chạm đất, ngồi không có ghế, tư thế sai:** ghế khách tính từ chân người ngồi, Thảo có thanh gác chân. Bản thử C5 ngồi mà không có ghế.
- **Ông Lộc đứng cao so với quầy và sàn:** hạ sàn sau quầy, mặt quầy ngang thắt lưng. Ở bàn sửa, ông ngồi sau bàn.
- **Đầu Duy lúc lệch, rời khỏi thân:** do `headTilt: undefined`, khiến SVG bỏ phép xoay của cả cụm đầu.

Mình phát hiện và sửa thêm:

- Hai trẻ bị đặt ngược bên (Thảo trái).
- Ngõ còn người qua đường.
- Text cũ "tối sinh nhật 16" cho G1.
- Kính ông Lộc thành kính đen.
- Dấu sắc của "NHẮN" rời khỏi chữ trên tiêu đề.

Kiểm tra đã chạy: `npm run typecheck`, `node tests/mother-farewell.cjs` (đã cập nhật theo ShC7_C), `node tests/episode-staging.cjs` (mới).

Mới xem bảng still đầu–giữa, **chưa render hoặc xem animatic chuyển động**, chưa có giọng/âm. Không gọi dịch vụ trả phí; chi phí media bằng 0.

## Bản 11 — mẹ tan, lau nước mắt và hai bàn tay

Chủ repo yêu cầu tan mềm nghệ thuật hơn, Duy lau nước mắt cho Thảo, nắm tay, máy cận và mờ sang tiệm; đồng thời sửa tay hai trẻ ôm mẹ khỏi bị khuất. Đã triển khai riêng trong mã thử và [hồ sơ VFX](VFX-ME-TAN.md). Lời sạch/bản ElevenLabs giữ nguyên; đoạn cuối không lời tăng 4 → 8 giây, tổng nghỉ 33 giây, 35 cue. Mã thử tăng ShC7_B thêm 120 frame, tổng 146 giây; bỏ lóe trắng lúc về tiệm, giữ điểm nắm qua chuyển cảnh. Không có audio/mix cuối hoặc dựng toàn bộ nguồn; các số liệu/giới hạn trong mục cũ phía dưới là lịch sử.


## Bản 10 — ngôn ngữ màu và chuyển giao khung hình — 08/11/2026

Chủ repo đồng ý bổ sung phần màu/chuyển khung trong góp ý Anti. Đã ghi bảng màu và nguồn sáng theo cue trong nguồn/dựng cảnh: đêm chàm → tiệm hổ phách kín → G2 ấm thoáng rồi trở lại → ruộng vàng ấm → thực tại → vệt ấm hướng về dì. Giữ sắc da/màu áo, hướng nguồn đèn và điểm tì; các hex chỉ là mẫu tham chiếu.

Chuyển 2:1 sau lớp trắng G3, giữ toàn ruộng và cắt về 16:9 ở C8-A như bản 8. Mẹ tan thêm hạt vàng rất thưa ở viền áo/tóc, cùng da/áo/bóng tắt hết trong 3–4 giây đã có, trước nghỉ 4 giây; đây là hình thức thị giác chủ quan, không xác nhận hồn về hoặc tạo vật mang về tiệm. Không đổi lời, thẻ, âm bản 9, 35 cue hoặc thời lượng. Đồng bộ tài liệu, chưa sửa engine/asset, tạo media, render hoặc khởi chạy Claude; hiệu quả cần storyboard → animatic. Trong lúc đồng bộ đã nhận nâng cấp rig/VFX/cánh đồng và asset tới `b776a32`; ghép cả ghi chú upstream, giữ dải trời tím hồng–cam mới. Dust nền đã có tách khỏi hạt tan từ viền mẹ còn cần dựng thử. Các mục dưới giữ lịch sử.

## Bản 9 — nền đúng cảnh và âm chi tiết — 08/11/2026

Theo yêu cầu chủ repo: nền âm cần hợp cảnh, ưu tiên nhạc không lời; thêm hơi thở/môi/ghế/dụng cụ/giấy nhưng có chọn lọc. Mỗi 35 cue nguồn có âm chính và DUNG-CANH có diễn giải vào/dừng; bảng nền phân biệt thành phố, phòng kín, thoáng G2, ruộng và ngưỡng nhà. Đồng hồ kệ ngừng chạy không ticking; quầy không bị kéo; tiếng môi không gắn mỗi nhịp rig nhép miệng. Bản ghi dừng phải chỉ còn quạt, mẹ tan để gió ở lại; nhạc kết chỉ sau nhịp Duy thở ra. Giữ toàn bộ lời/thẻ/29 giây nghỉ/24 giây mở/35 cue và khung/máy bản 8.

Đã đọc trang/giấy phép các nguồn miễn phí và lập NGUON-AM-THANH: ưu tiên Audio Library cho YouTube; ứng viên Mixkit có tên/tác giả để nghe theo cảnh, không hứa tuyệt đối không claim nhầm. Chưa nghe thử, tải, thu hoặc tạo audio, chưa mix/render hay khởi chạy Claude. Thư viện sfx cũ có các file đặt tên chung nhưng chưa đủ thông tin nguồn/phù hợp để chốt cho tập. Không tải/đẩy các file âm rời có giới hạn tái phân phối vào Git. Các phần lịch sử dưới giữ nguyên.

## Bản 8 — khung hình, rung và nghiêng có chọn lọc — 08/11/2026

Chủ repo yêu cầu thêm đúng chỗ, tránh làm hỏng cảnh. Quyết định biên tập: thực tại 16:9; toàn miền cánh đồng C6–C7 2:1 để giữ đủ mặt/tay ba người; đổi sau lớp trắng và cắt về 16:9 ở C8-A. Chỉ C5-C có roll tối đa +2°, rung x≤2/y≤1 px trong 1,6 giây thuộc khoảng nghỉ 2 giây sẵn có, về 0 trước C5-D. Máy ở cảnh Lộc gắt, ký giấy, nhận giá và mẹ tan vẫn ổn định; có thể bỏ hiệu ứng nếu animatic không chứng minh giá trị.

Đã bổ sung vào từng cue nguồn và DUNG-CANH, thay quy ước cũ “tất cả roll/rung 0”; đồng bộ kế hoạch, asset, README/mục lục và bài học dùng chung. Lời đọc/ELEVENLABS giữ nguyên byte; 1.916 đơn vị, 8.602 ký tự, 29 giây nghỉ, mở đầu 24 giây và ước tính 10:42–12:55 không đổi. Không sửa mã dựng, không gọi media hoặc khởi chạy Claude.

Nhận tiếp asset ngõ `85c11af` và `279dae2` trên các bản `0624c64`/`301c816`; giữ mã/ảnh mới, bỏ chỉ dẫn phục hồi người qua đường/đèn đường phía trên. Preview trong assets/stills là bản mở đầu mới; preview cùng tên trong assets/boi-canh là bản cũ. Chưa xem/nghe hoặc duyệt animatic toàn tập hay hiệu ứng bản 8. Các mục dưới là lịch sử.

## Bản 7 — thoại, gia đình và ba lần đổi — 07/11/2026

Theo chuỗi phản hồi mới: Lộc gắt/mỉa mai, gọi mày/chúng mày và tự xưng tao; quay về làm tiếp đồng hồ trước khi gợi giá khác/cười nham hiểm. Duy cầm giúp hai tờ rồi đưa lại cho em, không thanh toán. Bố say/chửi/từng đánh hai con; mẹ luôn che con dù bị quát, bố vẫn khuất hình. Không chốt mới nguyên nhân mẹ mất.

G1 chỉ còn ký ức buổi tranh xe đồ chơi, em ngã, mẹ dỗ cả hai, Duy xin lỗi/đỡ em rồi cùng chơi; ký ức cho thấy lúc cậu hiểu trách nhiệm người anh. Bỏ lựa chọn thử tối la em và ký ức sinh nhật. G1 mở bản ghi mẹ; khoảng hụt hẫng sau tiếng mẹ dẫn đến mong được che chở ở G2. G2 chỉ cho thoáng bình yên, sau đó Duy chịu thêm nỗi buồn của Thảo; Thảo thấy anh kiệt nên tự trả G3 để cả hai gặp/nói chuyện với mẹ. Giá G3 vẫn mất những giấc mơ có mẹ, trí nhớ lúc thức còn. Ba biên nhận lưu đúng ba lần đổi, không phát sinh giá mới.

Đồng bộ nguồn/lời sạch/bản thẻ, chỉ dẫn dựng, asset, kế hoạch và các điểm đọc hiện hành. Bổ sung nguyên tắc chung về chuỗi mong muốn–kết quả–cái giá và rà thoại vào docs/KINH-NGHIEM; không đưa nội dung tập lên file dùng chung. Lời 1,916 đơn vị/8,602 ký tự, 29 giây nghỉ riêng, mở đầu 24 giây; ước tính 10:42–12:55, chưa đo audio. Chưa cập nhật/render mã thử hoặc tạo media. Trong lúc đồng bộ, nhận tiếp commit ánh sáng/preview `8b95931` của Anti bằng fast-forward, giữ nguyên phần mã/ảnh của bản đó; không tự coi mã thử đã dựng lời bản 7. Các mục phía dưới là lịch sử; luật xưng hô, ký ức và số liệu cũ không áp cho bản 7.

## Cập nhật xưng hô ông Lộc — 07/11/2026

Theo yêu cầu mới, Lộc tự xưng **“tao”**, thay quy ước “ta” trước đó. Đã thể hiện trong lời ra giá G1 (“Tao lấy một ký ức…”) và câu hỏi sau sửa máy (“Thế muốn tao sửa gì nữa?”), đồng bộ nguồn/lời sạch/ElevenLabs cùng chỉ dẫn và kế hoạch. Hai trẻ vẫn gọi ông, xưng cháu; không đổi người nói khác hoặc tự thêm cách gọi mày. Lời hiện hành 1,470 đơn vị/6,705 ký tự, ước tính 8:27–10:10, chưa đo audio. Các mục cũ phía dưới ghi quy ước theo thời điểm lịch sử.

## Rà logic kịch bản bản 6 — 07/11/2026

Sửa năm điểm: nhấc/đặt đồng hồ, ảnh hẹn giờ, mất trải nghiệm G1 không quên lời vừa nói, giới hạn lời hứa gặp mẹ G3, lấy G1 khỏi ví trước đối chiếu C8. Cắt hai câu kể lặp ở đồng/cuối. Giữ ba giá, vai/tuổi/xưng hô, giọng dẫn, mở đầu 24 giây và 35 cue. Xem [bản rà soát](RA-SOAT-KICH-BAN.md) để biết phần đã sửa và phần chỉ đề xuất. Lời mới 1,467 đơn vị/6,693 ký tự, ước tính 8:26–10:09, chưa đo audio. Không sửa mã/asset hoặc render demo cũ trong lượt rà văn bản.

## Chọn lọc kinh nghiệm Anti — 07/11/2026

Đã rà toàn bộ 15 mục của file đúc kết do chủ repo gửi. Thêm 7 bài học dùng lại được và mở rộng 2 mục đã có trong docs/KINH-NGHIEM; giữ số đo/chi tiết riêng, nguồn và lý do không nhập trong [RA-SOAT-KINH-NGHIEM.md](RA-SOAT-KINH-NGHIEM.md). Không đẩy nguyên bản chưa lọc lên file chung; không sửa lời, mã hoặc media. Những kết quả Anti báo chưa được render/đo lại được ghi rõ là báo cáo nguồn, không nhận là kiểm chứng mới.

## Giữ lời dẫn và nhận bộ asset nâng cấp — 07/11/2026

- Chủ repo chưa muốn chuyển sang chỉ thoại vì cần truyền đạt đủ ý nghĩa. Giữ người dẫn chuyện kết hợp thoại; lời sạch và bản ElevenLabs không bị xóa các đoạn kể. Hình/âm làm rõ hành động, phản ứng, không thay lời bằng giải thích dồn vào miệng nhân vật.
- Nhận commit cd7243c của Antigravity. Phạm vi Anti là nâng cấp asset có sẵn; cảnh/timeline 142 giây là bộ thử, không phải nhiệm vụ dựng đủ tập 1. Ghi nhận lại phạm vi để không dùng thời lượng thử làm bằng chứng thiếu nội dung.
- Đồng bộ trạng thái các tài liệu từng ghi chưa có rig/mẹ/bối cảnh; ghi ánh xạ slug hồ sơ với alias kỹ thuật, phân biệt 35 cue nguồn với 24 đoạn thử. Không sửa mã dựng hoặc tạo thêm hình/audio/video ở lượt này.
- Các mục bên dưới là lịch sử theo thời điểm, có thể ghi chưa tạo tài nguyên nay đã có. Trạng thái hiện hành xem ASSET/README/kế hoạch.


## Rà đồng bộ và kế hoạch tối ưu — 07/11/2026

- Thêm [KE-HOACH-SAN-XUAT.md](KE-HOACH-SAN-XUAT.md): giữ bản 5 và 35 cue; nhóm asset dùng lại, storyboard → animatic thật với âm tạm → hoàn thiện/ElevenLabs → mix/xuất. Thử đoạn rủi ro trước, chưa tạo media hoặc gọi dịch vụ trả phí.
- Phát hiện câu hỏi cuối Thảo còn xưng “con” với Lộc; sửa thành “cháu” trong nguồn và cả hai bản lời. Sửa câu kể “Không trả giá nào” thành “Không cái giá nào”. Lời vẫn 1,470 đơn vị, ký tự tăng từ 6,711 lên 6,713; ước tính thời lượng không đổi.
- Rà tuổi/vai/xưng hô, ba giá và người trả, mẹ/cánh đồng, bố/dì, đoạn mở 24 giây, cue, lời đọc, đường dẫn và trạng thái asset; liên kết kế hoạch từ các điểm bắt đầu. Nhắc storyboard → animatic và đối chiếu đầu ra trong skill; bổ sung ở look rằng motion grid không thay xem chuyển động. Phân biệt hướng dẫn hiện hành với ghi chú lịch sử và snapshot mưa.
- Không coi việc đồng bộ tài liệu là hoàn thành sản xuất. Mẹ/bối cảnh/cú/rig/giọng/storyboard/animatic/video vẫn chưa tạo; trẻ concept v4 chưa được chủ repo chốt.

## Bản 5 — mở đầu theo phác thảo, 07/11/2026

- Thêm C0 24 giây không lời: toàn thành phố/trời sao đặt tiêu đề, hạ tới cú/nét mắt, lùi lộ hẻm-nhà-tiệm và bóng người, chuyển sang hai trẻ trước cửa, nối bước vào tiệm trước câu “Để xuống”.
- Duy/Thảo giữ tuổi/trang phục/nét trẻ chốt; người nền chỉ bóng ít chi tiết, trẻ nổi nhờ màu/ánh sáng có nguồn. Cú là động vật dẫn ánh nhìn, chưa xác nhận thuộc về hoặc bị Lộc điều khiển.
- Ngoại cảnh phải khớp cửa bên đông của sơ đồ nội tiệm; có điểm cắt theo bước/khung cửa để đổi sang máy phía khách, không bay xuyên tường. Cận mắt cú cần hình riêng khớp với trung/toàn, không crop skyline đến vỡ hình.
- Hai hình phác thảo là ảnh chủ repo gửi trong chat, chưa có file gốc trong repo. Lượt này chỉ thêm chỉ dẫn/asset cần có, không tạo ảnh/giọng/video. 24 giây mở được tính riêng, giữ nguyên lời và ba giao kèo.

## Bản 4 — 07/11/2026

- Tuổi/quan hệ hiện hành: Duy anh trai 16 tuổi, Thảo em gái 8 tuổi. Hai trẻ gọi Lộc là “ông”, xưng “cháu”; Lộc xưng “ta”. Ghi rõ ở đầu KICH-BAN, DUNG-CANH và README để khi mở file không nhầm với hồ sơ người trưởng thành trong lịch sử.

- Chủ repo yêu cầu từ một lên ba lần đổi; sau sửa máy, Thảo tò mò hỏi có sửa thứ khác không. Lộc mới cười lạnh “Thế muốn sửa gì nữa?”, em xin cảm giác như ngày mẹ còn.
- Hướng cũ mẹ chỉ qua giọng/không hồi ức được thay bằng mẹ hiện hình trong cuộc gặp G3. Không áp đề xuất trước đó là Duy trả cả ba hoặc bị mắc kẹt trong cảnh ký ức; đây không phải ý chốt của chủ repo.
- G1 Duy trả một tối sinh nhật được mẹ ôm. G2 do Duy trả bằng nhận thêm phần trống vắng của Thảo, sau thoáng ấm cậu mệt/rối. G3 do Thảo trả, không còn mơ thấy mẹ, để hai anh em được gặp/nói lời còn thiếu. Giá 2/3 là lựa chọn biên tập cụ thể hóa “cảm giác”, cần phản hồi chủ repo nếu muốn thay, không phải chi tiết được người dùng viết nguyên văn.
- Thảo nhận G3 vì thấy anh không chịu nổi, muốn ông lấy của mình thay vì anh. Lộc nói đủ giá trước lời em. Hiệu lực lời nhận đã được báo ở G2, không vướng quy trình G1 cần ký rồi hỏi cuối. Duy ngăn muộn có nền mệt sau G2, không câm hoặc bỏ mặc vô cớ.
- Chuyển G3 theo yêu cầu: trắng + ù → đồng chiều ấm → mẹ gọi/đi dạo/nắm tay → ngồi kể chuyện nhỏ, đùa gắp hành/đường khâu → mẹ gửi gắm → tan. Nhạc/ánh sáng không đổi mất mát thành kết chữa lành mọi thứ.
- Miền cảm giác hư cấu không xác nhận mẹ hồi sinh/vong về; dữ liệu ghi âm cũ không chứa lời mới. Mẹ đối thoại trong trải nghiệm, không bị buộc lặp máy móc theo đề xuất nháp chưa chốt trước đó.
- Cả ba giá còn hiệu lực lúc về. G1 không được trả bằng hình mẹ; G2 không hết sau lời an ủi; G3 mất giấc mơ, còn nhớ mẹ khi thức và còn có người anh. Bố vẫn say ngoài khung, dì đầu hẻm cho trẻ chỗ ngủ đêm đó; không giải bệnh/bỏ bê bằng một giấc gặp mẹ.

## Hình, trạng thái và chi phí

Lộc có mẫu mặt đã chốt; trẻ concept v4 đồ cũ/che chở chờ duyệt. Các ảnh có thật ở `assets/nhan-vat/`, nguồn/công cụ trong ASSET; không lấy ảnh Gemini qua cách khác sau quyền tải bị từ chối. Bản 4 chỉ sửa văn, không gọi thêm công cụ ảnh/voice/video. Mẹ, cánh đồng, pose đi/ngồi/ôm/tan và âm thanh chưa tạo. Không có số credits/tiền nhà cung cấp trả về cho các concept cũ, không ghi chi phí bằng 0 hoặc suy đoán theo token.

## Kiểm tra / tiếp theo

Đếm lại ba giao kèo/đúng người trả và lúc có hiệu lực; đồng bộ source–clean–bản thẻ, cue KICH-BAN/DUNG-CANH (hiện 35), link và số lời/nghỉ; 24 giây mở không lời không nhập TTS. Storyboard kiểm tra nguồn âm/miền cảm giác; animatic phải chạy nhận lời-ngăn muộn, nắm tay đi/ngồi/ôm/tan/trở ghế và cất giấy, không chỉ pan tranh. Chưa có phim để nghe/xem hoặc đo thời lượng thật.

Lịch sử Git bản 3 là một giao kèo, mẹ chỉ giọng; bản 2 là hai người trưởng thành và tiền viện. Không dùng luật/pose/ước tính đó cho bản 5 hiện hành.
