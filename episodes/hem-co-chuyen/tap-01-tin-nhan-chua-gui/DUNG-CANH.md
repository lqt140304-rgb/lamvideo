# Tin nhắn chưa gửi — bố trí cảnh và chỉ dẫn quay, bản 2

Ngày sửa: 07/11/2026. Tài liệu triển khai hình/âm cho [kịch bản nguồn](KICH-BAN.md). Đây là thiết kế để làm storyboard và animatic, chưa có hình, audio hoặc video đã duyệt. Các kích thước, vị trí máy và nhịp chuyển nét bên dưới là thông số khởi điểm mỹ thuật, cần chỉnh khi xem bản dựng.

## 1. Ngôn ngữ hình ảnh của tập

- Giữ hai bối cảnh, ba người hiện hình và giọng mẹ trong máy. Không thêm hồi tưởng thành bối cảnh thứ ba. Ký ức được kể qua mặt và cử chỉ của người đang nhớ.
- 2.5D với tiền cảnh, lớp diễn xuất và hậu cảnh. Các vật nằm cùng mặt đỡ chuyển động theo cùng không gian; không chia lớp theo màu hoặc từng đạo cụ tùy tiện.
- Chủ yếu máy tĩnh; hai chuyển động trượt ngắn ở C1-C và C4-B. Chuyển nét có lý do ở C4-A. Không dùng quay vòng, rung cầm tay, dolly zoom hoặc bóng ma để báo trước twist.
- Có 22 mục thiết lập/cue dưới đây; một góc có thể xuất hiện lại trong đối thoại. Đây không phải cam kết 22 ảnh hoặc 22 lần cắt. Lập timeline theo lời thực; không kéo một still suốt cả đoạn dài chỉ vì đã có tên shot.
- Mọi lens tính tương đương full-frame. Chiều cao máy đo từ sàn; khoảng cách đo gần đúng tới chủ thể nét chính. Góc cúi là từ đường nhìn ngang xuống; độ roll/nghiêng đường chân trời luôn 0°. **Rung tất cả shot: 0 px dịch, 0° xoay.** Không ghi khẩu độ vật lý cho SVG; thay bằng vùng cần rõ/mềm. Camera và blur hiện chỉ là ý đồ cần triển khai, chưa phải tính năng tự động.
- Với trượt ngang: bắt đầu thử 8–12 cm trong không gian quy ước, xem lại mức parallax thực tế. Khóa điểm tì của tay, bóng và đạo cụ trước khi chỉnh chuyển động máy. Thời gian 1–2 giây chuyển nét hoặc 5–7 giây trượt chỉ là đoạn chuyển động trong shot, không phải tổng thời lượng cả lời.

## 2. Sơ đồ không gian cố định

### Tiệm ông Lộc — SET-TIEM

Phòng hư cấu khoảng 4,2 × 6 m. Nhìn từ khu khách vào bàn sửa: trái là kệ tây, phải là cửa đông ra hẻm. Trục y hướng sâu vào phòng, x sang phải. Sơ đồ theo mét chỉ dùng để thống nhất vị trí; cần quy đổi sang tọa độ engine khi dựng.

```text
                    TƯỜNG SAU, y=6
       kệ đồng hồ       bàn sửa + đèn vàng (y≈5,3)
       đã ngừng         ghế thợ
                        Lộc (2,1; 4,1)
       [khay đồ]  ===== QUẦY y≈3,3 =====
                   Duy            Thảo
                (1,4; 2,6)     (2,6; 2,6)
                                         CỬA RA HẺM
       kệ gỗ tiền cảnh                     x=4,2; y≈1,4
              VÙNG MÁY CHÍNH y≈0,3–1,5
                    PHÍA KHÁCH, y=0
```

Quầy cao khoảng 0,78 m, sâu 0,6 m; ghế cao khoảng 0,43 m để hai chân chạm sàn. Mặt quầy không cao tới ngực người ngồi. Ghế Thảo gần cửa hơn. Khoảng trống sau ghế đủ đứng dậy, lùi nửa bước và ngồi lại mà không xuyên tường/kệ.

Điện thoại trên khăn ở giữa quầy, lệch phía Duy; ảnh ở trái điện thoại theo góc nhìn của khách; biên nhận ở phải, trước mặt Duy khi ông Lộc đẩy ra. Cây bút nằm trên giấy, không sinh ra trong tay. Kệ phía trái có radio, hộp vít và đồng hồ sửa dở; lối đi phía phải để trống. Không cần vẽ thêm người ngoài hẻm: dùng nguồn âm ngoài khung.

Đèn bàn bên sau-trái ông Lộc rọi xuống vùng sửa; một bóng trần dịu đủ đọc mặt hai khách. Ánh trắng lạnh từ cửa bên phải. Đồng hồ trên kệ đứng kim, **không lót tiếng tích tắc cho chúng**. Quạt gắn tường phía trái chạy nhẹ; xe đi ngoài cửa nghe gần hơn tiếng xe ở đầu hẻm. Ánh sáng và tiếng quạt giữ liên tục C1–C6, trừ chuyển thời gian sửa có chỉ dẫn.

Camera chính luôn ở phía khách, cùng phía nam trục nối hai chị em. Duy ở trái, Thảo ở phải trong khung chung; cận một người giữ ánh mắt về đúng phía của người kia. Insert trên mặt bàn có thể cao hơn nhưng không dùng để tự ý đảo vị trí hai người ở shot sau.

### Nhà của mẹ và Thảo — SET-NHA

Duy về ở tạm trong lần này; không ngụ ý hai chị em vốn cùng sống thường xuyên. Phòng trước khoảng 3,8 × 5 m; nhìn từ cửa vào: bàn may bên trái, bàn ăn giữa hơi lệch phải, bếp phía sau, bàn thờ trên tường phải.

```text
                       BẾP, y≈4–5
         công tắc     tủ bát + mặt bếp
         ở mép trái   lối vào đủ cho Duy đứng
       bàn may          bàn ăn       bàn thờ, tường phải
       vải gấp       ghế Duy/Thảo    đèn riêng luôn sáng
       móc túi/khóa
                       CỬA NHÀ, y=0
```

Bàn may có mảnh vải đang ghim, thước dây và đèn đã tắt, không tự chạy. Không bày kéo ở nơi diễn viên đặt tay. Trên bàn ăn chỉ có khay nhỏ và khoảng trống để điện thoại; hai bát ở tủ bếp, chưa nằm sẵn trên bàn. Điện thoại được đặt trên bàn ăn, màn hình hướng lên; không đổi sang bàn may hoặc tự úp mặt ở insert.

Thảo treo túi và chìa khóa ở móc cạnh cửa rồi đi về bếp. Duy đặt máy, ngồi phía trái bàn; Thảo quay lại và ngồi phía phải sau câu xin lỗi. Duy đứng lấy bát, cất lại, về ngồi rồi mới hỏi ký ức. Khi ra ngoài, Thảo lấy khóa đi trước; Duy cất giấy, lấy điện thoại, tắt đèn bếp rồi theo sau. Đèn bàn thờ dùng mạch riêng vẫn sáng, không nhấp nháy.

## 3. Tư thế, trang phục và đường đi đạo cụ

| Người | Dáng/trang phục giữ xuyên tập | Diễn biến cơ thể |
|---|---|---|
| Duy | Áo thun xanh xám, quần tối, đồng hồ tay trái; điện thoại mẹ cầm tay phải, ví túi quần trái | Ban đầu thân chúi về máy, đầu gối hướng quầy, ít nhìn chị. C3 cằm nâng và miệng đáp nhanh rồi khựng. C4 môi hé nhưng không phản bác. C5 quay thân về chị, vai thả dần. C7 ngồi nghe hết câu, không cúi nhìn điện thoại |
| Thảo | Áo sơ mi màu đất nhạt, tay xắn bằng nhau, quần đen, tóc buộc thấp, túi vải | C1 tay trái giữ quai túi, tay phải đẩy ghế đứng. C2 ngồi nửa trước ghế, đầu gối hơi hướng cửa. C4 thân vẫn hướng quầy nhưng mắt quay sang em, không diễn khóc ngay. C5 tay trái thôi siết quai. C6 siết mép ghế. C7 ngồi tựa được vào lưng ghế khi nói không muốn nấu |
| Ông Lộc | Sơ mi xám, kính, dáng hơi khom khi sửa nhưng đứng thẳng khi xác nhận | Tay làm việc chậm, nhìn người nói, không cười bí hiểm. C3 lấy lại giấy chỉ sau khi bút Duy đã rời giấy. C5 chờ câu trả lời; C6 đứng sau quầy, không biến mất khỏi tiệm khi hai chị em nói |

Không mặc định tay gần máy luôn là tay phải: đổi góc thì đổi thứ tự vẽ phần gần/xa, giữ nguyên tay đang cầm vật.

| Đạo cụ | Chuỗi trạng thái phải giữ | Mốc cần kiểm tra trong animatic |
|---|---|---|
| Máy mẹ | Vỡ, màn hình tắt trên khăn → Duy giữ cạnh → Thảo xoay khi Duy rút tay → Lộc nhấc sang bàn sửa → máy nguyên màn, sáng trở lại trên khăn → Duy mang về → bàn ăn → túi Duy khi ra ngoài | Ngón cái ngoài mép và ngón đỡ dưới vỏ; không luồn qua màn hình. Chạm mặt đỡ rồi mới rời tay; lúc nhấc bóng và lớp che đổi theo |
| Ảnh | Ví Duy → góc trái khăn → Thảo đẩy trên mặt quầy về phía Duy → Duy cất ví trước ký | Ảnh luôn là giấy, không có mặt sau tự biến hình. Không dùng lại ảnh trên bàn sau khi đã cất |
| Biên nhận | Lộc đẩy tờ trống và bút → Duy đặt bút xuống → Lộc kéo giấy về → đưa lại khi chọn chuyện mới → ghi sự kiện, đọc xác nhận, ký → quầy trước Duy → gấp trong ví → Duy mở ở nhà → cất lại | Không rách/xé biên nhận; ghi chữ ở lớp đồ họa riêng. Giữ nội dung sự kiện đã trả, không ghi tên ký ức đầu bị bỏ |
| Bát | Hai bát úp ở tủ → Duy lấy từng bát đặt lên mặt bếp → chưa mang ra bàn → cất lại khi chị muốn ăn ngoài | Có cổ tay/cẳng tay, đỡ đáy; chỉ đổi lớp trước/sau tay tại chỗ nắm hợp lý. Tiếng sứ nhẹ, không tiếng vỡ |

## 4. Chỉ dẫn theo cảnh và cue lời

Các cue dùng nguyên câu trong KICH-BAN. Không ấn định timecode trước khi có audio. Chia cảnh thành các đoạn hình theo cue; nếu lời dài hơn một nhịp giữ, quay lại góc đã có hoặc diễn tiếp, không thêm asset chỉ để tăng số lần cắt.

### Cảnh 1 — Giá sửa

**C1-A · vào câu “Sửa bao nhiêu tiền hả chú?”**
- Máy ở giữa phía khách, cách Duy khoảng 2,3 m, cao 1,25 m; toàn vừa ba người, 35 mm, nhìn ngang. Máy khóa; cả ba đọc được, nền dịu nhưng không xóa đồ đạc.
- Duy trái, Thảo phải, Lộc giữa sâu hơn. Mép kệ trái là tiền cảnh, ba người/quầy là lớp hành động, bàn sửa là hậu cảnh. Duy nhìn Lộc, ngón tay phải tì cạnh máy; Thảo nhìn lối ra, không nhìn thẳng ống kính.
- Tiếng quạt và xe xa đủ định vị. Chưa nhạc. Mở thẳng bằng câu hỏi; chèn định vị tiệm qua lời kể và hình.

**C1-B · “Ông Lộc xoay chiếc điện thoại…”**
- Insert 85 mm, máy phía khách cao 1,25 m, cách điện thoại khoảng 0,8 m, cúi khoảng 35°. Khóa máy, nét vết nứt và ngón tay; mép khăn rõ.
- Lộc dùng hai ngón xoay máy nằm trên khăn, không nhấc. Tay Duy rút đủ khoảng trống. Sau xoay, đầu máy hướng về hai khách. Không lộ ảnh/biên nhận vì chưa lấy ra.
- Giữ tiếng vỏ sượt khăn nhỏ nhưng rõ. Cắt về C1-A cho giá giao kèo, nhìn được miệng Lộc và phản ứng khách.

**C1-C · “Duy nhìn chị. Thảo đã đứng dậy.”**
- Trung Thảo và Duy ở rìa trái, 50 mm; máy phía khách hơi lệch trái, cách Thảo khoảng 2,2 m, cao 1,45 m. Thảo đứng có đủ headroom ngay từ khung đầu. Trượt sang phải khoảng 8 cm trong 5 giây rồi dừng; không pan giật theo đầu.
- Vai Duy tiền cảnh mềm, Thảo giữa, khung cửa xa. Tay phải chị tì ghế rồi rời; chân chịu lực trước khi hông đứng lên. Duy giữ cạnh máy trên khăn, không giằng trong không khí. Thảo dừng trước khi ra cửa.
- Ghế cọ nền có sức nặng, xe ngoài hẻm vẫn xa. Sau đoạn kể về mẹ, giữ đúng 2 giây nghỉ của kịch bản; tay Duy còn trên máy.

### Cảnh 2 — Chuyện không tính bằng tiền

**C2-A · đầu cảnh tới lời nói máy bị rơi**
- Dùng lại vùng C1-A, 35 mm, cao 1,25 m. Thảo kéo ghế về chỗ cũ rồi ngồi; thấy chân ghế chạm sàn. Không đổi ghế sang bên kia quầy.
- Chị giữ túi trên đùi, mắt rời vết nứt trước chữ “Ừ”. Duy nghiêng đầu hỏi, chưa kết tội. Cơ thể Thảo gợi khó nói nhưng không diễn như bị bắt quả tang.
- Quạt liên tục; tiếng vải túi và chân ghế ngắn, không chèn nhạc báo nói dối.

**C2-B · “Ông Lộc đẩy ra một tờ giấy” / lấy ảnh từ ví**
- Insert mặt quầy, 65 mm, cao 1,4 m, cách cụm đạo cụ khoảng 1 m, cúi 40°. Khóa, cả ảnh–máy–giấy đủ nét. Bút nằm trên giấy khi Lộc đẩy; Duy dùng tay trái lấy ví, phải lấy ảnh.
- Ảnh hạ tới quầy rồi ngón tay mới rời; ví đóng và trở lại túi trái. Giấy ở vùng riêng không chồng lên máy. Mặt ảnh nhìn về Duy, bố cục đủ nhận ra ba mẹ con, không cần đọc chữ.
- Tiếng giấy/da ví có chất liệu. Trở C2-A cho luật và câu trả góp; giữ 1 giây vẻ cười tắt dần, không thêm tiếng cười ngoài cảnh.

### Cảnh 3 — Một ký ức dễ bỏ

**C3-A · “Cháu chọn cuộc gọi hồi tháng tám…”**
- Cận vừa Duy, 70 mm; máy phía khách hơi lệch phải, cao 1,2 m, cách khoảng 2 m. Vai Thảo mềm ở phải tiền cảnh; Duy nét, Lộc ngoài khung nhưng vẫn ở vị trí đã biết.
- Duy cầm bút tay phải, xoay nhẹ giữa ngón; thân còn hướng về quầy. Đến “Em đã xin lỗi rồi”, mắt quay nhanh sang chị, giọng phòng thủ. Không rung máy để thay diễn xuất.
- Nhạc căng nhẹ M1 có thể vào dưới cuộc cãi; giảm nếu che phụ âm. Không dùng tiếng tim đập.

**C3-B · “Hôm em hỏi chị có lấy tiền mẹ không?”**
- Cận vừa Thảo, 70 mm; máy phía khách hơi lệch trái, cao 1,2 m, cách khoảng 2 m. Vai Duy ở trái; cùng phía trục như C3-A. Khóa máy, mắt Thảo rõ, bàn tay siết quai vẫn nhìn được.
- Chị trả lời chậm hơn em, nhìn thẳng ở “Còn chị vẫn nhớ”. Không khóc thành tiếng; hàm căng rồi thở ra. Có thể cắt qua lại A/B theo thay đổi ý, không cắt bắt buộc mỗi câu.
- M1 rút trước câu “Còn chị vẫn nhớ”; tiếng quạt còn. Câu nói không bị hit nhạc đánh dấu.

**C3-C · “Duy đặt bút xuống” và ông Lộc lấy lại giấy**
- Dùng góc mặt quầy C2-B, 65 mm. Duy đặt bút lên quầy bên trái giấy, thả tay; sau đó Lộc mới kéo giấy bằng tay phải. Không để bút bám giấy đang trượt.
- Tiếng bút chạm gỗ, rồi tiếng giấy kéo là hai việc riêng, không dùng tiếng xé. Quay lại C3-A cho 2 giây nghỉ: mắt Duy nhìn khoảng giấy vừa trống, tay đứng yên.

### Cảnh 4 — Vết nứt

**C4-A · “Thảo xoay chiếc máy…” / “Chị không làm rơi.”**
- Cận chéo mặt quầy 65 mm, cao 1,05 m, cách tay khoảng 1 m. Máy nhìn từ phía khách, tay Thảo gần và mặt Duy xa cùng khung. Chuẩn bị hình góc này, không kéo biến dạng góc trên xuống.
- Thảo xoay bằng hai ngón khi Duy đã nhả cạnh máy; thiết bị nằm trên khăn. Nét tay/vết nứt đầu shot, chuyển sang mắt Duy trong khoảng 1,2 giây sau lời thú nhận. Không coi đây là hai mặt phẳng thật trong engine trước khi dựng.
- Xe đi ngang ngoài cửa thoáng rõ rồi xa dần, kết thúc trước câu thú nhận; không làm mất chữ. Móng chạm vỏ máy nhẹ; không có tiếng đập hồi tưởng.

**C4-B · phần đối đáp về mẹ đến hết cảnh**
- Trung đôi, 50 mm, máy phía khách cao 1,2 m, cách hai người khoảng 2,3 m. Cả hai cùng vùng nét, Lộc ở ngoài khung. Trượt ngang phải khoảng 10 cm trong 7 giây đầu rồi khóa; không zoom toàn ảnh thay parallax.
- Mép kệ trái tiền cảnh lùi khỏi khuôn mặt Duy. Thảo rút tay về túi, vai không đổ gục. Duy hơi mở miệng ở câu về mẹ nhưng ngậm lại; sau đó nhìn chị, không nhìn xuống máy nữa.
- Giữ lời và quạt, không nhạc khóc. 4 giây nghỉ có nhịp thở và ánh mắt, không cắt né phản ứng.

### Cảnh 5 — Điều đáng giữ

**C5-A · Duy đổi lựa chọn và kể cuộc gọi vui**
- Trung đôi từ C4-B, 50 mm, khóa máy. Duy nhấc nhẹ ghế rồi dịch về phía chị khoảng 10 cm khi chị còn ngồi; giữ chân và ghế không trượt xuyên nhau. Chưa chạm người chị.
- Duy cười thật một nhịp khi kể camera; Thảo nhìn em rồi cười rất nhỏ trước khi nghiêm lại. Chị mở bàn tay đang siết quai; không lập tức hòa giải.
- Quạt, tiếng ghế ngắn. Không dựng hình cuộc gọi quá khứ. Có thể dùng cận C3-A/B để đọc phản ứng mà không tạo set mới.

**C5-B · câu hỏi về cái giá / nghỉ 3 giây / đưa ảnh lại**
- Insert 65 mm theo C2-B: ảnh, tay Duy và khoảng quầy trước mặt cậu đang thiếu tờ giấy. Biên nhận vẫn ở phía Lộc, chỉ được đưa lại ở C5-C. Trở C5-A khi Duy đáp; không giữ mỗi ảnh suốt đoạn thoại.
- Trong nghỉ, tay Duy dừng cạnh ảnh, chưa cầm bút. Thảo đẩy ảnh bằng đầu ngón trên mặt quầy; Duy đón và cất vào ví. Điện thoại còn trên khăn, không bị tay quét qua.
- Tiếng giấy trượt khác tiếng vải túi. M1 đã tắt; lựa chọn không được nâng bằng một cú dâng nhạc.

**C5-C · xác nhận sự kiện và ký**
- Cận mặt quầy 85 mm, cao 1,35 m, cách giấy khoảng 0,9 m, cúi 40°. Chữ dựng riêng: “Lần đầu mẹ gọi video bằng chiếc máy này, tối Duy khoe phòng trọ riêng.” Không thêm mốc ngày chưa xác lập.
- Duy ghi sự kiện, Lộc đọc lại; Duy nhìn chị rồi gật. Tay trái giữ mép giấy, tay phải ký; sau ký đặt bút xuống. Trở khung chung cho câu hỏi xác nhận cuối, rồi mới chuyển sang bàn sửa.
- Giấy, nét bút rõ vừa đủ. Không ký vào tờ giấy trắng hoặc viết sự kiện cũ bị bỏ. Không dùng tiếng xé để nhấn giao kèo.

### Cảnh 6 — Máy sáng

**C6-A · chuyển thời gian sửa và máy trở lại quầy**
- Trung/cận bàn sửa từ lối bên phải quầy, 50 mm, máy cao 1,4 m, cách Lộc khoảng 1,8 m. Đây là góc mới được xác lập bằng động tác ông quay về bàn, không làm hai khách đổi chỗ.
- Lộc cầm máy bằng hai tay, đỡ đáy; match cut cùng vị trí tay/khăn trước và sau khoảng sửa. Không trình bày thao tác sửa điện tử làm hướng dẫn thật. Sau đó thấy ông mang máy lại quầy, hạ lên khăn rồi thả.
- Foley nhựa/dụng cụ nhỏ, quạt làm cầu nối thời gian; không tiếng phép thuật. Màn hình chỉ sáng sau sửa, vết nứt đã hết; giữ cùng màu vỏ và hình dáng.

**C6-B · Thảo hỏi camera, Duy không nhớ sự kiện**
- Trung đôi 50 mm, cao 1,2 m, vị trí C4-B đã khóa. Nét cả hai. Duy nhìn chị, chớp mắt, chờ tìm lại điều vừa kể; không diễn như quên chị hoặc mọi cuộc gọi với mẹ.
- Thảo siết mép ghế bằng tay trái. Lộc xoay biên nhận cho Duy; cắt insert C5-C nếu cần đọc chữ rồi trở lại mặt Duy.
- Không nhạc, nghe một nhịp hít vào. Sự mất mát nằm trong phản ứng, không dùng màn hình nhiễu làm bằng chứng duy nhất.

**C6-C · “Duy bấm nghe.”**
- Insert 85 mm, cao 1,2 m, cách máy khoảng 0,8 m, cúi 35°. Máy nằm trên khăn, tay trái Duy giữ mép vỏ, ngón trỏ phải bấm nút phát rồi nhấc ra. Giao diện ghi âm tối giản, không thêm lời nhắn mới.
- Nét màn hình và ngón tay. Dùng hình đồ họa riêng cho giao diện; âm mẹ xuất phát từ máy trên quầy, hẹp vừa phải nhưng lời đủ rõ. Không phát đồng thời bản giọng mẹ thứ hai từ narrator.

**C6-D · từ “mẹ bảo chị nấu…” tới hết cảnh**
- Trở C6-B, 50 mm, không đổi trục. Ban đầu Duy nhìn máy; đến câu mẹ nhắc chị nấu, mắt cậu chuyển sang Thảo. Chị không nhìn lại ngay. Không cắt ở mỗi từ của lời mẹ.
- Sau “Hết”, giữ 4 giây nghỉ. Sau lời “Mẹ lại bảo chị nấu” và “Ừ”, giữ 4 giây thứ hai với hành động khác: Duy rút ngón tay khỏi nút phát lại, quay thân về chị. Màn hình có thể vẫn sáng; không tự phát lại.
- Quạt giữ liên tục. M2 chưa vào dưới hai khoảng nghỉ này. Sau cảnh, Duy gấp biên nhận vào ví và mang máy về; chuyển địa điểm bằng cut, không cần dựng cảnh đi đường.

### Cảnh 7 — Người còn ở đây

**C7-A · vào nhà và câu giữ máy chung**
- Toàn nhỏ 28 mm từ cửa nhìn vào, cao 1,45 m, máy tĩnh; nét đủ bàn may trái, bàn ăn giữa và cửa bếp sâu. Tiền cảnh mép cửa; diễn xuất giữa; bếp/bàn thờ xa.
- Thảo treo túi/khóa rồi đi bếp. Duy đặt điện thoại màn hình lên trên bàn ăn, ngồi ghế trái và lấy biên nhận từ ví ra. Giữ ánh mắt Thảo thấy chiếc máy khi quay lại.
- Tiếng hẻm ngoài cửa nhỏ hơn ở tiệm, tủ bếp mở nghe gần. Không tiếng máy may vì máy đang tắt. Cắt ambience theo địa điểm bằng nối mềm, không mang quạt tiệm sang nhà.

**C7-B · lời nhận lỗi của hai người**
- Trung đôi 50 mm từ phía cửa, cao 1,2 m, cách bàn khoảng 2,4 m; Duy trái, Thảo phải. Ban đầu Thảo ở ngưỡng bếp, sau đó bước tới ghế phải và ngồi trong cùng hướng không gian.
- Duy để hai tay mở trên bàn, không nắm tay chị thay lời xin lỗi. Thảo giữ lưng thẳng lúc nói “Vì có sao thật”, rồi mới tựa nhẹ; Duy nhận câu đó mà không phản bác.
- Nét đủ hai người, điện thoại ở thấp mép khung. Chưa nhạc. Cho tiếng ghế và hơi thở hiện ra trong các khoảng câu.

**C7-C · lấy bát rồi hỏi chị muốn ăn gì**
- Cận vừa ngang mặt bếp 50 mm, máy ở lối vào bếp cao 1,25 m, cách Duy khoảng 1,6 m, hướng 3/4 để thấy mặt và hai tay. Đây là hình góc mới của bếp, không kéo crop toàn cảnh thành mặt bên.
- Duy đứng dậy từ bàn, đến tủ; lấy từng bát úp đặt lên mặt bếp, chưa mang đi. Đầu cậu quay về chị khi hỏi; tay dừng thật. Cắt C7-B để thấy chị bỏ câu trả lời theo thói quen, rồi về C7-C khi Duy cất lại hai bát.
- Tiếng sứ đặt chạm mặt bếp nghe rõ nhưng nhỏ, không tiếng vỡ. Khóa âm chạm theo từng bát. Không cần thêm tiếng xé/rách vào tập khi không có hành động ấy.

**C7-D · Duy trở lại ghế, hỏi chuyện camera**
- Dùng C7-B, 50 mm, cao 1,2 m. Duy đã cất bát, bước về và ngồi rồi mới nhìn biên nhận. Tránh lỗi đang đứng trước tủ mà lời kể lại nói “trước khi đứng lên”.
- Thảo kể chuyện, Duy cười nhẹ nhưng mắt vẫn có khoảng trống. Tờ giấy không sáng, không hiện hình quá khứ. Cậu biết câu chuyện qua lời chị, không phục hồi ký ức.
- M2 có thể vào rất nhẹ sau khi chị chủ động chọn ăn ngoài, nghe được nhưng không báo “đã chữa lành”. Không dùng nhạc chiến thắng.

**C7-E · cất đồ và ra cửa**
- Trở toàn C7-A rồi cắt khung bếp tĩnh 35 mm từ phòng trước, cao 1,35 m. Hai vị trí được chuẩn bị từ cùng set, không di chuyển máy xuyên tường.
- Thảo đứng lấy khóa, đi trước. Duy gấp giấy cất cạnh ảnh trong ví, bỏ máy vào túi phải, đến công tắc tắt đèn bếp rồi theo chị. Tay chạm công tắc trước khi đèn tắt; đèn bàn thờ riêng còn sáng. Chân ra khỏi khung, không biến mất bằng dissolve.
- Chìa khóa, công tắc, bước chân rồi âm hẻm ở cửa. M2 rút dần; giữ 4 giây cuối bằng căn bếp tối và tiếng bước xa. Không tiếng gọi của mẹ, không đèn nhấp nháy.

## 5. Nhạc và cue âm cần chọn

| Mã | Chức năng / đoạn dùng | Yêu cầu chọn và phối |
|---|---|---|
| AM-TIEM | C1–C6, quạt cũ + hẻm xa | Loop không nghe điểm nối; đồng hồ chết không kêu. Xe đi ngang C4 rõ hơn xe xa, không đè câu thú nhận |
| FX-GHE | Đứng, ngồi, dịch ghế | Phù hợp chân ghế/nền gạch; âm chỉ khi chân thực sự cọ, không lúc nhân vật đứng im |
| FX-GIAY | Ảnh, biên nhận, ví | Phân biệt giấy trượt, giấy gấp và ví; không dùng tiếng giấy rách |
| FX-MAY | Máy trượt khăn, đặt quầy, chạm nút | Nhựa/vải/mặt gỗ rõ vừa phải; không click lớn cho màn hình cảm ứng |
| VO-ME | C6, ghi âm cũ | Giọng bình thường; xử lý chất loa điện thoại vẫn hiểu lời. Chưa chọn voice/model hoặc tạo audio |
| AM-NHA | C7, phòng nhỏ + hẻm ngoài cửa | Yên hơn tiệm, thay đổi khi cửa mở; không tạo tiếng máy may tự chạy |
| FX-BAT-KHOA | C7, bát, khóa, công tắc | Bát nhẹ có hai lần đặt/cất theo hình; công tắc đơn, không hiệu ứng điện ma quái |
| M1 | C3, sức ép tăng | Nhạc không lời thưa, không sting cho mỗi câu; rút trước câu cuối của Thảo. Có thể bỏ nếu quạt và thoại đã đủ |
| M2 | Cuối C7, một bước gần nhau | Nhạc không lời ấm nhưng chưa giải tỏa hoàn toàn; không phủ lời mẹ ở C6 hoặc kéo mất khoảng lặng cuối |

Ưu tiên thư viện có sẵn/nguồn miễn phí phù hợp; chưa chọn file hay xác minh giấy phép cho các cue trên. Ghi nguồn, quyền dùng và mức nghe đã duyệt vào ASSET khi thực hiện. Không áp gain cố định; nghe bản mix xuất ở mức nghe ổn định trên tai nghe và loa thông thường.

## 6. Duyệt storyboard rồi animatic

Storyboard: kiểm tra sơ đồ hai phòng, ánh mắt đúng trục, các điểm đứng/ngồi, tay gần/xa, vị trí máy và vùng nền sẽ lộ. Đặc biệt C1-C phải đủ khung cho Thảo đứng; C4-A có tay và mặt ở hai lớp; C7-C phải có góc bếp phù hợp.

Animatic: cho chạy thật động tác xoay máy, kéo giấy sau khi đặt bút, chuyển ảnh vào ví, ký, mang máy từ bàn sửa, lấy/cất bát và tắt đèn. Kiểm tra tiếp xúc, che khuất, thứ tự tay–vật và nhịp nghỉ; không chỉ pan/zoom tranh tĩnh. Ráp cả mạch với giọng/âm tạm để nghe được hai khoảng yên khác nhau ở C6. Chưa cần gọi dịch vụ trả phí chỉ để duyệt.

Nếu shot dài hơn nhịp diễn hợp lý, dùng lại cận/phản ứng cùng trục hoặc rút lời lặp trước khi thêm bối cảnh. Ghi frame/timecode lỗi trong GHI-CHU khi có bản thật. Không ghi đã duyệt từ văn bản này.
