# Hồ sơ 2 — Dựng cảnh và góc máy

**Ngày 10/11/2026 — đề xuất để thiết kế/storyboard, chưa render.** Phạm vi chỉ gồm phần truyện đã viết, từ Nam thức dậy tới lúc đọc bài người kia làm hộ vào buổi tối. Nguồn lời và trạng thái duyệt nằm ở [THAO-LUAN-CANH.md](THAO-LUAN-CANH.md). Tài liệu này chỉ bổ sung cách quay, không tạo bản thoại thứ hai hoặc chốt thay các tình tiết còn chờ duyệt.

## Cách dùng

- Đi theo hành động/thoại ở bản nguồn; mã máy dùng để tìm bố cục, không phải một câu thoại tương ứng một cú cắt. Một shot có thể giữ qua nhiều lượt đối đáp.
- Khung nền **16:9**; bố cục theo chiều sâu, giữ mắt và tay quan trọng trong khung. Chưa cần thay tỉ lệ giữa các shot để có chất phim.
- Các tiêu cự là **tương đương full-frame để mô tả ý đồ bố cục**. Dựng SVG phải chuẩn bị phối cảnh và góc hình thích hợp; nhãn 35/50/85 mm hoặc scale một tranh không tự tạo lens hay camera 3D.
- Mặc định **máy tĩnh, rung 0**. Các dịch máy nhỏ ghi trong từng shot; mức dịch theo khung chỉ là điểm thử cho storyboard, chưa phải kết quả chạy. Nếu cú va cần rung, ghi biên độ ở đầu ra 1920×1080 và cho tắt nhanh, rồi kiểm tra hình thật.
- Focus mặc định giữ rõ mặt/tay đang có tác dụng. Chuyển nét trong SVG là điều khiển lớp/blur có chọn lọc; chữ điện thoại và tài liệu cần đọc luôn rõ. Không làm mờ người nghe đúng lúc họ phản ứng.
- Khoảng giữ cho cú sốc, cuộc gọi ngắt và do dự **nằm trong thời lượng hành động/thoại đã có**. Khoảng nghỉ 2 giây ở bản nguồn chỉ được tính một lần. Chưa đo tổng thời lượng bằng diễn/giọng, không cộng riêng mọi nhịp giữ như một cảnh mới.

## Mặt bằng và trục nhìn theo bộ bối cảnh mới

Đã đối chiếu [bảng PNG hiện có](assets/boi-canh/boi-canh.png) và [hồ sơ bối cảnh](assets/boi-canh/BOI-CANH.md) ngày 10/11/2026, sau khi nhập các cập nhật tới `5673bea`. Lấy bốn nền đã có làm mốc mỹ thuật và đồ đạc, không xây lại một căn phòng khác theo mỗi góc máy.

```text
NHÌN THEO NỀN PHÒNG TRỌ SÁNG HIỆN CÓ
trái: cửa sổ / tủ Duy Tân / hai chỗ ngủ song song
giữa–sau: bàn Nam + giá sách + đèn đỏ, cạnh cửa chính
phải: cửa ra hành lang và bồn rửa sát góc tường
tiền cảnh: đầu/chân nệm, quạt, vùng sàn nối các mốc trên
```

- **Góc toàn A:** dùng phối cảnh của nền sáng 35 mm: Nam/chỗ ngủ bên trái, bàn ở giữa–sau cạnh cửa, bồn rửa phía phải. Bếp không bị đẩy sang một phòng khác hoặc tự nằm sau lưng bàn để hợp một cú cắt. Giữ đường Nam men từ nệm tới cửa đọc được và không buộc cậu đi xuyên qua người kia.
- **Bàn ban ngày/ban đêm:** là cùng bàn, giá sách và đèn đỏ của Nam. Lấy cùng mốc vị trí để thay người ngồi; khung phòng tổng và cận bàn có thể khác cỡ cảnh, không đổi đồ sang bức tường khác. Hai nệm song song giữ tiếp đất và hướng phối cảnh như mẫu mới.
- **Góc toàn B ngoài hành lang:** cần chuẩn bị bổ sung khi dựng; nền `hanh-lang-cua-phong.svg` hiện là góc từ trong phòng nhìn cửa, chưa thay được mọi góc ngoài hành lang. Khi lập B, Nam né về phía cầu thang/lối đi, người kia về đầu dãy đối diện. Tái lập bằng toàn cảnh trước khi cắt cận; không áp trái/phải của góc trong phòng lên góc đảo ra ngoài mà thiếu mốc.
- **Hai loại ghế theo asset mới:** ghế gỗ cạnh nệm là đồ có thể va khi Nam bật dậy; ghế xoay học sinh là ghế ngồi của Nam, có thể lăn từ bàn ra vị trí đối diện cửa rồi kéo về bàn khi làm bài. Không nhân đôi ghế xoay hoặc biến một chiếc thành chiếc khác. Mẫu nền có ghế gỗ trước cửa không tự xác lập hành động chặn cửa: khi đưa vào timeline, đặt nó ngoài vùng quét cửa và lối đi; nguồn chỉ ghi Nam ngồi nhìn cửa, chưa ghi dựng vật chắn.
- **Chốt và cửa:** có lớp trạng thái riêng: đầu sáng hé/mở; Nam vào khóa thì chốt gài; đi vệ sinh thì Nam rút chốt; về khép cửa nhưng quên gài nên chốt còn rút. Nền tối hiện có chữ/miêu tả cửa gài không được dùng nguyên trạng để phủ nhận cách người kia vào. Giữ hướng bản lề của thiết kế, kiểm tra vùng quét cánh cửa với bàn/ghế.
- **Điện thoại/căn cước:** lúc đối đáp Nam giữ điện thoại tay phải, tay trái kiểm giấy trên mặt bàn. Khi bắt đầu làm laptop, đặt điện thoại trong tầm với trước khi dùng hai tay; sau game mới đặt nó cạnh laptop rồi sang giường. Buổi tối Nam tự nhặt và mở tin; người kia không cầm hộ.
- Áo người kia đang mặc không trở lại trên ghế hoặc giường. Nam và người kia nay có tạo hình/trang phục gần như giống hệt trong bộ SVG mới; phân biệt bằng vị trí và diễn xuất, không trông chờ màu áo khác nhau để khán giả nhận diện.
- Lối đi vệ sinh ở ngoài khung phía Nam rời đi, người kia đứng phía đối diện. Không cần nền WC hoặc lớp học/sân thể thao của Tùng; Tùng ở phần này chỉ có giọng gọi và tin nhắn theo nguồn.

## Đường cảm xúc của máy

Đầu cảnh giữ nhịp sinh hoạt, thông tin ở sâu trong hình; cú nhận mặt chuyển sang phản ứng Nam rồi mới nhìn kỹ người kia. Ra cửa, khoảng cách và vật cản chiếm bố cục. Khi Nam làm bài, giữ khung để thấy sự trì hoãn; montage nắng/tư thế chỉ rút gọn thời gian. Buổi tối dùng lại các mốc căn phòng và vị trí bàn để người xem nhận ra người kia đã chiếm chỗ Nam. Cuối đoạn máy mới tiến gần hơn khi Nam tự thấy có lợi.

Hai điểm nhấn: **cận phản ứng trước cú lộ mặt**, và **khung bàn làm việc ban ngày được nhắc lại khi người kia ngồi vào buổi tối**. Giữ máy yên ở các đoạn giữa để diễn xuất có trọng lượng. Chưa dùng góc quái vật, mắt đỏ hoặc ánh sáng xác nhận nguồn gốc người kia.

## Bảng góc máy theo đoạn

Các nhóm A–H là nhóm máy của phần hiện có, không phải viết thêm Cảnh 3–8 trong khung truyện tương lai. Chi tiết bên dưới được biên tập cùng GPT-6.1 Sol.

### MAY-A

**Cảnh 1 — Tiếng rửa chén, nhận mặt.** Chốt cảm giác quen trước khi thấy điều không thể giải thích. Người kia chưa được quay như một quái vật.

| Mã | Cỡ/góc/lens tương đương | Máy, rung, focus | Diễn xuất, điểm cắt và âm |
|---|---|---|---|
| A01 | Toàn phòng theo nền sáng hiện có, ngang tầm người ngồi, 35 mm; góc A | Tĩnh, rung 0; hai nệm trái, bàn cạnh cửa giữa–sau, bồn rửa phải đều đọc được | Nam ngủ, người ở bếp quay lưng. Báo thức và tiếng chén có vị trí; lập cả lối ra. Khung khoảng 5–8 giây nếu vừa nhịp hành động, không thêm lời dẫn mới. |
| A02 | Cận tay tắt báo thức và một phần mặt Nam, 65 mm, chéo nhẹ xuống nệm | Tĩnh; nét ngón tay → mắt Nam đang nhắm; điện thoại ở cạnh nệm | Cậu tắt rồi kéo chăn, chưa biết có người giống mình. Giữ tiếng chén sang cú cắt để dẫn sự chú ý. Điện thoại chưa được nhấc lên mang đi. |
| A03 | Trung cận Nam ba phần tư, 50 mm; bếp ở ngoài phần chính của khung | Máy giữ yên; nét mắt Nam. Không rack focus lộ mặt người kia sớm | Chạy lời tưởng đó là Tùng, rồi “Ê, áo đó…”; hướng mắt về phải/sâu. Khi người kia quay, giữ máy trên Nam: cậu ngừng giữa câu, nhìn ra cửa. Khoảng giữ 2 giây của nguồn nằm tại đây, không cộng lần nữa. |
| A04 | Cận mặt người kia, 65 mm, ngang mắt; lấy đủ phần mày trái | Tĩnh; rõ mặt và nốt ruồi, nền bếp mềm vừa đủ | Cắt theo ánh mắt Nam để khán giả xác nhận gương mặt giống hệt. Giữ ánh sáng ban ngày; không chớp đèn, đổi mắt hoặc thêm tiếng gầm. Sau đó mới nghe câu hỏi và câu đáp theo đúng thứ tự nguồn. |
| A05 | Trung rộng Nam tại nệm và ghế cạnh đó, 35 mm | Tĩnh để thấy chuỗi động tác; rung mặc định 0. Nếu thử cú va: một xung tối đa 3 px ở 1080p, tắt trong 0,15 giây, không xoay khung | Nam dụi mắt, sờ mặt, hỏi có phải trò đùa; nghe đúng giọng mình thì mới quơ điện thoại, đứng dậy va ghế. Không cắt mất đầu gối/điểm va. Tiếng ghế ngắn, có trọng lượng; tránh chồng thêm âm hù. |

### MAY-B

**Phần nối cuộc gọi — Nam tìm một người quen xác nhận.** Tùng hiện chỉ là giọng qua điện thoại, chưa cần bối cảnh lớp học mới.

| Mã | Cỡ/góc/lens tương đương | Máy, rung, focus | Diễn xuất, điểm cắt và âm |
|---|---|---|---|
| B01 | Trung rộng nhìn chéo qua cửa, 35 mm; Nam phía nệm/cửa, người kia phía bếp phải | Máy tĩnh, giữ cả hai vùng hành động rõ; khung cửa làm lớp gần | Nam lùi, quát đừng tới gần; người kia dừng và đặt chén xuống, hai tay trống. Thấy hành động tuân thủ trong cùng khung, không dùng lời kể thay. Bàn tay Nam phải nhấc được điện thoại từ A05 trước khi gọi. |
| B02 | Trung cận Nam ở ngưỡng cửa, 50 mm; cửa và lối ra còn đọc được | Máy cùng phía trục vừa lập; nét mắt/tay Nam. Tay phải cầm điện thoại, tay trái giữ cửa | Giữ các câu hỏi tên, đường vào và cuộc gọi. Không cần cắt theo mỗi câu. Giọng Tùng có màu âm điện thoại; không cắt sang cảnh Tùng thấy bản sao. |
| B03 | Cận Nam, 65 mm, ngang mắt | Tĩnh; nền phòng ở sau vẫn có thể nhận diện, không blur đến mất vị trí người kia | Tùng bác bỏ rồi ngắt. Nam giữ máy bên tai thêm một nhịp, hạ xuống, siết máy, nhìn lại vào phòng. Tiếng ngắt ngắn; âm quạt/hành lang tiếp tục. Không thêm một khoảng 2 giây mới nếu nhịp này đã nằm trong diễn. |

### MAY-C

**Nam lấy lại căn phòng — đổi vị trí rồi gài chốt.** Đoạn này cần toàn cảnh chứng minh đường đi hơn một chuỗi cận hấp dẫn nhưng khó hiểu.

| Mã | Cỡ/góc/lens tương đương | Máy, rung, focus | Diễn xuất, điểm cắt và âm |
|---|---|---|---|
| C01 | Toàn hành lang, 28 mm; góc B đối diện cửa | Tĩnh; Nam phía cầu thang/trái, cửa giữa, chỗ chờ bên phải | Tái xác lập không gian trước khi đổi trục. Người kia đáp “Mày muốn tao làm gì?”, Nam yêu cầu ra ngoài. Thấy vị trí hai người trước khi họ di chuyển. |
| C02 | Trung rộng cùng phía trục hành lang, 40 mm | Dịch ngang ngắn theo Nam né trái; tối đa khoảng 2% bề ngang khung làm điểm thử, rung 0; cạnh cửa lướt ở lớp gần | Nam lùi khi người kia tiến, nhắc giữ khoảng cách; người kia dừng. Tránh silhouette chồng kín nhau. Có thể giữ nguyên toàn C01 nếu bố cục đã đọc được, không bắt buộc thêm cú máy. |
| C03 | Toàn như C01, 28 mm | Tĩnh, giữ hai người rõ | Người kia đi về chỗ được chỉ, Nam chờ rồi mới lách vào phòng. Giữ đến lúc Nam qua ngưỡng; không cho người kia biến vị trí giữa hai cú cắt. |
| C04 | Trung Nam phía trong nhìn về cửa, 50 mm | Tĩnh, tay khép cửa còn trong hình | Nối đúng hướng chuyển động C03. Nam đóng cửa; điện thoại vẫn trong tay phải, tay trái rảnh để gài chốt. Tiếng hành lang bớt trực tiếp khi cửa khép. |
| C05 | Đặc tả chốt và tay trái, góc xiên nhẹ, 85 mm | Tĩnh; rõ lưỡi chốt đi vào ổ, không rung/nhòe | Bằng chứng cửa thực sự khóa ở thời điểm này. Tiếng kim loại nhỏ, rõ. Cắt sau khi tay ngừng, không chỉ cho thấy một cánh cửa đã đóng. |
| C06 | Trung Nam ngồi đối diện cửa, 50 mm, ngang tầm ngồi | Tĩnh; cửa đóng chiếm một phần khung, mặt Nam đọc được | Lời người kia “Tao đứng đây rồi” ở ngoài, Nam đáp “Đừng nói nữa”; sau đó im thật. Cho thấy Nam lăn ghế xoay từ bàn ra ngồi đối diện cửa; ghế gỗ ở ngoài lối đi. Điện thoại trong tay, chưa trượt sang bàn. |

### MAY-D

**Nam chủ động hỏi lại — đồ đạc và danh tính.** Cánh cửa vẫn ngăn hai người; chỉ cắt tới bên ngoài ở lời nói người kia có thể nghe.

| Mã | Cỡ/góc/lens tương đương | Máy, rung, focus | Diễn xuất, điểm cắt và âm |
|---|---|---|---|
| D01 | Cận điện thoại, 85 mm, mặt máy gần vuông góc hướng nhìn | Tĩnh, chữ rõ, không rung hay bloom | Nam nhắn Tùng về phòng; chưa có trả lời. Giữ đủ đọc đúng câu, không cần chèn thêm tin mới hoặc dữ liệu riêng. |
| D02 | Cận vừa bàn, tay và ví/ngăn giấy, 65 mm, chéo xuống nhẹ | Tĩnh; điện thoại tay phải, tay trái mở/lật đồ đặt trên mặt bàn rồi lấy căn cước | Thấy cậu tự kiểm tra ví/giấy tờ; không dựng đồ bay vào tay. Có thể đặt ví nằm mở để tay trái thao tác được. Giữ tiếng ngăn kéo và giấy nhỏ, có nguồn. |
| D03 | Cận mặt Nam với căn cước ở dưới cằm/mép dưới khung, 65 mm | Nét từ ảnh khuôn mặt trên thẻ → mắt Nam trong khoảng 0,5–0,8 giây để thử; không làm mất cả hai trong blur | Đối chiếu hình mình với điều vừa gặp. Không zoom dữ liệu cá nhân trên thẻ. Nam đặt thẻ xuống bằng tay trái; điện thoại vẫn tay phải theo nguồn. |
| D04 | Trung Nam nhìn cửa, 50 mm | Máy tĩnh; chốt đóng và Nam cùng đọc được khi bố cục cho phép | Giữ đối đáp, cả “Không có lần sau”. Cửa không hé dần trong lúc nói. Nội dung câu hỏi đã đủ căng, không cần máy trôi liên tục. |
| D05 | Trung người kia ở hành lang, 50 mm, ngang mắt | Tĩnh, khuôn mặt điềm tĩnh, cửa Nam nằm đúng phía trục | Chỉ xen khi người kia trả lời về chén, áo, chổi; trở lại D04 khi Nam có phản ứng. Không cắt tới người kia mỉm cười sau suy nghĩ thầm của Nam để tạo cảm giác nó nghe được nội tâm. |

### MAY-E

**Ban ngày — bí bài và suy nghĩ lợi–hại.** Máy giữ lâu hơn để thấy Nam làm không được, tránh dựng thành một lần xóa chữ rồi lập tức bỏ cuộc.

| Mã | Cỡ/góc/lens tương đương | Máy, rung, focus | Diễn xuất, điểm cắt và âm |
|---|---|---|---|
| E01 | Cận điện thoại, 85 mm | Tĩnh, rõ tin giục và lời Nam hứa hôm qua | Một nhịp rung mở đoạn; giữ đủ đọc. Không thêm giọng trưởng nhóm đọc thay tin nhắn, không có tiếng rung liên tục phủ các suy nghĩ sau đó. |
| E02 | Trung rộng bàn Nam cạnh cửa, 35 mm | Dịch ngang nhẹ theo Nam kéo ghế xoay từ cửa về bàn rồi đứng lại; cạnh bàn lớp gần và tường lớp xa dịch khác nhau | Nam đặt điện thoại trong tầm với, mở laptop đã cắm sạc. Xác lập vị trí đồ trước phần tối. Không đổi cửa/nệm sang bên khác để lấy một góc đẹp riêng. |
| E03 | Cận tài liệu trên laptop, 65 mm; góc gần chính diện | Tĩnh; chữ là lớp riêng rõ, tay/phím có vùng chạm hợp lý | Tên Nam, tiêu đề còn trống so với phần các bạn. Gõ–dừng–xóa nhiều lần; có thể cắt thời gian cùng bố cục bằng thay vệt nắng và trạng thái bài. Âm phím thưa, không phát thành nhịp gõ giỏi liên tục. |
| E04 | Trung cận Nam ba phần tư, 65 mm; một phần bàn và góc bếp giữ trong bố cục | Tĩnh qua các suy nghĩ; nét mắt, cửa ở mép hướng nhìn | Nội tâm so sự chăm chỉ với mình, thoáng muốn nhờ rồi lắc đầu tự bác. Giữ miệng không nói, chỉ mắt/tay/tư thế thay đổi. Có thể trở lại E03 lúc Nam tiếp tục thử viết; không thêm góc cho mỗi câu nội tâm. |

### MAY-F

**Mở chốt, đi vệ sinh và quên gài lại.** Đây là chuỗi hình giải thích việc người kia vào được phòng sau đó, không phải tiết lộ một năng lực.

| Mã | Cỡ/góc/lens tương đương | Máy, rung, focus | Diễn xuất, điểm cắt và âm |
|---|---|---|---|
| F01 | Trung cận cửa/chốt, 65 mm, đủ thấy mặt Nam nhìn ra | Tĩnh; điện thoại tay phải, tay trái mở chốt, nét chốt → mắt Nam | Cho thấy chốt được rút bởi Nam. Cậu hé kiểm tra trước khi bước; không cắt thẳng từ ghế sang ngoài hành lang. |
| F02 | Toàn hành lang lặp C01, 28 mm | Tĩnh, giữ chiều trái/phải cũ | Nam chỉ người kia đứng xa; nó đi tới đúng điểm thì cậu mới rời phòng theo lối đối diện. Không quay nội thất nhà vệ sinh; cắt thời gian sau khi đường đi đã rõ. |
| F03 | Cùng góc F02, 28 mm | Tĩnh, màu sáng cùng đoạn ban ngày | Nam trở về, người kia vẫn ở chỗ được chỉ. Nam vào, khép cửa. Giữ ngưỡng đủ lâu để thấy người kia chưa lẻn theo ngay lúc này. |
| F04 | Cận vừa mép cửa, tay trái và chốt, điện thoại tay phải, 65 mm | Tĩnh; cả chốt rút lẫn máy rung/sáng đều rõ, không rack focus làm mờ mất bằng chứng | Tay Nam định gài, tin nhắn giục làm cậu chuyển sang trả lời rồi bỏ đi. Giữ 1–2 giây trong nhịp hành động để đọc được lưỡi chốt vẫn rút; không có tiếng khóa. Cửa đóng không đồng nghĩa cửa đã chốt. |

### MAY-G

**Chơi game và ngủ quên.** Cùng một góc lặp lại với sự thay đổi nhỏ kể thời gian hiệu quả hơn một montage nhiều góc không cần thiết.

| Mã | Cỡ/góc/lens tương đương | Máy, rung, focus | Diễn xuất, điểm cắt và âm |
|---|---|---|---|
| G01 | Trung Nam ở bàn, 50 mm; cùng phía với E02 | Tĩnh; tài liệu trên laptop và điện thoại trong tay cùng có chỗ trong hình | Nam tự cho mình nghỉ, chuyển sang game. Tiếng game có nguồn từ điện thoại, thấp hơn nội tâm, không biến thành nhạc nền thay tâm trạng. |
| G02 | Cận màn hình điện thoại, 85 mm | Tĩnh, rõ tay bật Không làm phiền và biểu tượng sau khi bật | Phải thấy thao tác do Nam làm. Chưa dùng dấu báo đỏ/âm hù báo trước hậu quả. Hiện chữ đủ đọc, không phóng cả UI nhiều lần. |
| G03 | Lặp trung G01, 50 mm | Tĩnh; 2–3 lát cắt cùng góc với tư thế/vệt nắng đổi | Hết trận này tới trận khác, ánh nắng thấp dần. Giữ vị trí bàn/đồ ổn định; không để chiếc ghế hoặc điện thoại nhân đôi qua montage. |
| G04 | Toàn phòng góc A như A01, 35 mm | Tĩnh, rõ đường từ bàn tới nệm | Nam đặt điện thoại cạnh laptop rồi sang nệm nằm ngủ; laptop còn bài mở, ghế ở bàn. Giảm ánh sáng qua chuyển thời gian; không quay cảnh người kia lẻn vào hoặc giải thích động cơ của nó. Tiếng game đã dừng khi cậu đặt máy. |

### MAY-H

**Tỉnh buổi tối — người kia đã ngồi vào chỗ Nam.** Giữ lại địa lý cũ; sự thay vị trí tạo bất an, không cần đổi cả phong cách sang phim quái vật.

| Mã | Cỡ/góc/lens tương đương | Máy, rung, focus | Diễn xuất, điểm cắt và âm |
|---|---|---|---|
| H01 | Trung cận Nam trên nệm, 50 mm, hướng nhìn về phải như buổi sáng | Tĩnh, nét mắt Nam; ánh bàn rọi từ phía phải | Tiếng phím đánh thức, lấy phản ứng trước. Nam nhìn chỗ Tùng trống trong hướng cắt kế tiếp hoặc trong mép khung. Không cần hiện bảng chữ “Tối” thay mọi dấu ánh sáng. |
| H02 | Toàn phòng góc A lặp A01/G04, 35 mm | Tĩnh, rõ Nam ở chỗ ngủ trái và người kia tại bàn giữa–sau cạnh cửa | Khán giả đọc ngay thay đổi: cùng căn phòng, người kia ngồi ở ghế Nam đã dùng. Đèn bàn và laptop là nguồn sáng; bếp phía phải vẫn nhận diện được. Không đổi nệm/cửa hoặc quay đảo toàn cảnh. |
| H03 | Trung đôi chéo, ngang mắt, 40 mm | Tĩnh, nét cả hai vùng diễn; không mặc định handheld | Nam bật dậy quát; người kia dừng gõ và đáp. Giữ khoảng cách/đường Nam đi tới bàn rõ, người kia không chắn lối. Lời về cửa không chốt gợi lại F04 bằng trí nhớ khán giả, không bắt buộc phát lại insert. |
| H04 | Cận vừa mặt bàn và tay Nam, 65 mm | Tĩnh; thấy điện thoại ở đúng vị trí G04 rồi Nam lấy bằng tay phải | Không cắt ngay sang điện thoại đã nằm trong tay. Người kia không đưa/giữ điện thoại hộ; tay nó rời phím sau khi bị quát. |
| H05 | Cận điện thoại từ phía Nam, 85 mm, màn hình gần chính diện | Tĩnh, rõ biểu tượng Không làm phiền rồi thao tác mở tin Tùng/danh sách nhỡ | Người kia chỉ nhận ra biểu tượng khi có đường nhìn tới màn hình Nam cầm sáng. Nam tự mở và đọc, không có montage người kia biết thông tin từ trước. Chừa thời gian đọc từng lớp, không hiện mọi chữ trong một khung bé. |
| H06 | Cận Nam bên bàn, 65 mm | Máy tĩnh; ánh đèn bàn giữ rõ mắt và tay còn siết điện thoại | Giận chuyển sang xem xét; còn đề phòng. Cắt theo ánh mắt từ điện thoại sang laptop, chưa cho cười hoặc thả lỏng toàn thân ngay. Không dùng nhạc ấm xác nhận người kia đáng tin. |
| H07 | Cận laptop, 65 mm, góc đọc tài liệu gần E03 | Tĩnh; nét chữ/phần hướng dẫn, tay trái Nam ở trackpad hoặc vùng cuộn | Nam tự đối chiếu, đọc và cuộn; khác biệt trang trống ban ngày với bài thành hình là bằng chứng lợi ích. Giữ cả chỗ còn cần sửa, không biến thành bài hoàn hảo. Không bấm gửi. |
| H08 | Trung người kia ngồi, ngang tầm mắt ngồi, 50 mm | Tĩnh; Nam vẫn có vị trí ngoài khung đúng trục; rõ hai tay không gõ tiếp | Lời mời sửa giúp khỏi thức khuya diễn nhẹ, thân thiện. Không góc thấp tôn quyền lực, không `eerie_smirk` phô lộ săn mồi. Cắt về Nam khi lời đề nghị tác động. |
| H09 | Cận Nam, 65 mm, ngang mắt | Có thể tiến nhẹ 2–3% khung nếu nền/pose đủ; mặc định giữ tĩnh cũng được. Nét mắt rồi khóe miệng | Nội tâm tự luyến, ngẫm rồi cười nhẹ. Điện thoại vẫn trong tay. Không thêm tia sáng từ trời, nhân vật thần linh hoặc hình minh họa xác nhận suy nghĩ của cậu. |
| H10 | Trung đôi ổn định, 40 mm, bàn ở lớp gần | Tĩnh, đọc được khoảng cách Nam đứng/người kia ngồi và bàn phím | Nam giữ quyền đọc hết/chưa cho gửi; người kia đồng ý, tay chờ khỏi phím. Kết ở âm phòng, ánh bàn và hành động đọc tiếp, không nối sang Tùng về hoặc bước thay thế chưa viết. |

## Ánh sáng, âm và nhịp nối

- **Sáng:** cửa sổ là nguồn chính, phòng đủ sáng để nhận mặt và đường thoát. Không phủ vàng viền mọi người hoặc thêm sương chỉ để có vẻ điện ảnh.
- **Làm bài → game:** cùng cửa sổ, vệt sáng dịch trên bàn/tường và tư thế thay đổi. Đèn/laptop chưa tự đổi thành nguồn chính giữa một cảnh ban ngày.
- **Tối:** đèn bàn và laptop; giữ sắc da, màu áo, vị trí cửa và vùng tối có thể đọc. Đèn bàn bật là trạng thái đã có khi Nam tỉnh; không cần thêm một cảnh ai bật đèn để giải thích mọi thao tác nhỏ.
- **Cắt:** dùng ánh mắt, tay chạm đồ, người ngừng nói hoặc người đổi hướng. Giữ âm phòng nối qua các góc cùng thời điểm; tiếng nước ngừng đúng lúc nguồn ghi. Cửa đóng làm âm người kia ở ngoài bớt trực tiếp, không biến thành giọng nội tâm.
- **Chuyển thời gian:** cắt cùng bố cục với nắng/tư thế/trạng thái bài đổi; sang tối có thể dùng dissolve ngắn trên phòng/nệm. Không hòa hai khuôn mặt lên nhau khi đối thoại hoặc dùng một giọng nói mơ hồ để báo thời gian trôi.
- **Chữ:** thông báo, tin hứa hôm qua, Không làm phiền, tin Tùng và cuộc gọi nhỡ là các lớp đọc riêng. Cận đủ lớn ở cỡ điện thoại; tăng thời gian giữ trước khi tăng số hiệu ứng. Chữ và viền khung không rung theo camera.
- **Nội tâm:** Nam không mấp máy miệng để nói thành tiếng; người kia không cắt phản ứng đúng nhịp những suy nghĩ thầm. Phần lời dẫn/nội tâm vẫn theo nguồn, không thêm giọng diễn giải kỹ thuật.

## Chuẩn bị asset và kiểm tra trước khi dựng dài

Tham chiếu bộ nhân vật ở [ASSET.md](ASSET.md), theo [hướng Style B](../THIET-KE-NHAN-VAT.md). Bảng SVG có biểu cảm/pose chưa chứng minh mọi góc và động tác trong bảng máy đã sẵn sàng.

1. Dùng nền sáng/bếp/bàn tối mới làm mốc, chuẩn bị góc toàn ngoài hành lang B và các lớp trạng thái cửa/ghế còn thiếu. Có lớp nền được vẽ đủ cho các dịch máy nhỏ; không cần orbit hoặc góc trần mới.
2. Kiểm tra/tạo bổ sung khi được giao: Nam ngủ/bật dậy, gõ–xóa, cầm điện thoại/căn cước, chơi game, mở/gài chốt; người kia quay mặt từ bồn rửa, đặt chén, đi rồi ngồi gõ. Chỉ bổ sung pose/góc thực sự được dùng, không tự nhận có sẵn cả rig ngồi/gõ từ một bảng tĩnh.
3. Mặt ba phần tư, bàn tay/điểm cầm, cận nốt ruồi, chốt và màn hình phải đủ chi tiết cho cỡ gần. Không phóng SVG toàn cảnh để thay mọi cận. Bát được đặt xuống trước khi nhân vật để hai tay trống.
4. Duyệt storyboard theo thứ tự câu chuyện, đặc biệt A03–A05, C01–C05, F03–F04 và G04–H04. Đối chiếu trạng thái chốt/điện thoại/ghế, hướng mắt, tay đang giữ và nguồn sáng.
5. Khi chủ repo giao bước dựng, thử animatic với âm tạm cho một tương tác và đoạn sáng–tối trước khi mở rộng. Kiểm tra chuyển động thật, cỡ xem điện thoại và các điểm nối; bảng góc này chưa phải bằng chứng đã diễn/render đạt. Claude phụ trách dựng khi được giao.

Nguồn nguyên tắc nội bộ: [Ngôn ngữ điện ảnh 2.5D](../../../docs/NGON-NGU-DIEN-ANH-2-5D.md), [quy trình duyệt hình](../../../docs/WHAT-IF-QUY-TRINH.md), [hướng diễn xuất và continuity](../../../.claude/skills/what-if-animation/references/look.md). Đây là quyết định sáng tạo cho Hồ sơ 2, không phải nghiên cứu mới hoặc kết quả thử nghiệm chi phí.
