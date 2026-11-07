# Tin nhắn chưa gửi — dựng cảnh bản 6

**Định dạng đã chốt, 07/11/2026: giữ người dẫn chuyện kết hợp thoại nhân vật.** Lời dẫn giúp làm rõ thông tin, cảm giác khó quan sát và hệ quả cần hiểu; hình/âm đảm nhiệm hành động và diễn xuất. Cân đối để tránh kể lặp điều hình đã cho thấy. Chưa chuyển sang phim chỉ có thoại nhân vật; giữ lời dẫn theo bản nguồn hiện hành và đồng bộ LOI-DOC/ELEVENLABS sau biên tập.

**Asset đã cập nhật:** đã nhận bộ nâng cấp SVG của Antigravity tại commit `cd7243c`: rig, biểu cảm/tay, bối cảnh, đạo cụ, ảnh preview và 10 still. Mục tiêu của đợt này là cải tiến thư viện asset; mã/timeline tập được dùng thử hình. Timeline thử có 24 đoạn, 4.260 frame ở 30 fps = 142 giây; không phải bản dựng đủ kịch bản 35 cue hoặc thời lượng phim cuối. Chưa duyệt storyboard/animatic toàn tập hoặc tạo giọng/mix cuối.


Lộ trình và trạng thái: [kế hoạch sản xuất tối ưu](KE-HOACH-SAN-XUAT.md).

07/11/2026. Thêm C0 theo hai phác thảo chủ repo: thành phố/trời sao/tiêu đề → mắt cú → hẻm/tiệm/người dạng bóng → hai trẻ trước cửa. Theo [KICH-BAN.md](KICH-BAN.md): ba giao kèo, hai lần Duy trả, lần cuối Thảo trả; mẹ có hình/thoại trong miền cảm giác cuối. Chỉ dẫn là mục tiêu dựng của bản nguồn; đã có mã thử và still SVG, chưa duyệt chuyển động toàn tập hoặc giọng/mix. Mặt Lộc concept đã chốt; tạo hình SVG mới, mẹ/cánh đồng và tương tác cần đối chiếu với các cue dưới đây.

**Tuổi và xưng hô đã chốt:** Duy là **anh trai, 16 tuổi**; Thảo là **em gái, 8 tuổi**. Cả hai gọi ông Lộc là **“ông”**, xưng **“cháu”**. Ông Lộc tự xưng **“tao”**. Hai trẻ vẫn gọi **“ông”**, xưng **“cháu”**; không tự đổi lời của hai trẻ sang mày–tao.

## 1. Không gian và ánh sáng cố định

**SET-CITY-HEM / ngoại mở đầu:** một thành phố miền Nam hư cấu ban đêm. Tấm toàn: trời sao chiếm khoảng nửa trên, skyline thấp hơn, vài mái gần dẫn xuống hẻm. “TIN NHẮN CHƯA GỬI” ở vùng trời, căn giữa theo khoảng trống, chừa khoảng an toàn quanh chữ; dùng lớp chữ riêng, không để AI vẽ chữ lên nền hoặc sao sáng chạy qua nét chữ. Chữ hiện/giữ trong C0-A, rút dần ở C0-B; không còn trên mắt cú/nhân vật.

Sơ đồ góc ngoài hẻm: nhà hai bên đường, cú trên thanh đỡ mái hiên căn nhà gần bên trái, tiệm Lộc ở phải-xa, hai trẻ đứng trước cửa tiệm. Cú và thanh đỡ cùng nhóm không gian, móng bám thanh/bóng tiếp xúc; lùi máy không làm cú trôi khỏi mái. Ánh đèn hẻm/mái hắt vào mắt cú, phản chiếu bình thường; không xác lập cú là vật nuôi, linh hồn hoặc tai mắt phép thuật của Lộc khi truyện chưa nói.

Người qua đường chỉ 2–3 mẫu bóng xám/tối ít chi tiết, dáng đi và chân có mặt đất, có thể dùng lại khác thời điểm/tỷ lệ theo độ sâu. Giữ họ đủ phân biệt với bóng đổ, không thành người ma. Tuyến đi ở lớp đường, tránh mép cửa và mặt hai trẻ. Duy/Thảo có màu áo đã chốt, nét mặt và đường viền sáng dịu do cửa tiệm; người nền giảm tương phản/chi tiết. Không gắn hào quang hoặc tăng sáng toàn thân trẻ độc lập nguồn sáng. Chỉ lúc máy về gần cửa mới cần đọc rõ mặt trẻ, không ép thấy mặt ở toàn thành phố.

**Nối cửa ngoài–trong:** cửa ngoại cảnh là cửa bên đông (x=4,2; y≈1,4) của SET-TIEM. C0-F nhìn từ hẻm vào cửa đó, hai trẻ bước vào vùng khách, sau đó cắt theo bước/khung cửa sang C1-A nhìn từ phía nam của quầy. Đây là thay vị trí máy đã có điểm nối, không xuyên tường hoặc xoay 90° bằng crop một ảnh. Ở C1, Duy trái/Thảo phải theo góc đã chốt; mặt kệ thấp có một đồng hồ nhỏ ở gần cửa, đủ tầm em nhấc/đặt; không cho em với qua quầy. Giữ kệ lớn bên trái của tiệm.

**SET-TIEM:** phòng quy ước 4,2×6 m, khách ở phía nam y=0; quầy y≈3,3, cao 0,78 m, sâu 0,6 m, chừa lối phải. Duy trái x≈1,4, Thảo phải x≈2,6, cùng phía khách y≈2,6. Lộc sau giữa x≈2,1/y≈4,1, bàn sửa/đèn vàng y≈5,3. Kệ trái, cửa phải ra hẻm x=4,2/y≈1,4 luôn mở. C1 đứng, C2 mới ngồi; ghế Thảo có bậc chân, điều chỉnh mặt ngồi vừa quầy, không dùng rig người lớn thu nhỏ. Máy ở khăn giữa; ảnh trái, giấy phải. Kệ gần/người-quầy giữa/bàn sửa-tường xa. Đèn bàn cho Lộc nửa mặt sâu bóng nhưng còn đọc được mắt; hắt trần đủ đọc trẻ, cửa lạnh bên phải. Không đèn kính phát sáng.

Trong lúc Lộc báo giá G3, phải còn thấy Duy cố nhấc tay/mở miệng nhưng chậm và khó tập trung; không cắt anh khỏi cảnh rồi cho xuất hiện muộn chỉ để hợp twist.

Tới G2, chỉ ánh sáng/âm chủ quan ấm lên thoáng qua trong cùng khung; chưa hiện mẹ hoặc chuyển nhà. Sau đó Duy tái/mồ hôi/vai sụp/tay bấu, nhìn khó tập trung; phải thấy tình trạng này trước câu nhận G3 của Thảo. Trắng/ù thuộc G3, không đặt nhầm vào G1 hoặc G2. Thân hai trẻ vẫn ngồi đúng ghế, tay vẫn cùng vị trí khi trở về C8.

**SET-CANHDONG / miền cảm giác G3:** ruộng lúa hư cấu miền Nam, bờ đất bằng và thảm cỏ khô đủ ba người ngồi, nắng cuối chiều từ trái khung, cây xa/đường chân trời thấp. Cỏ gần, nhóm giữa, ruộng-trời xa; không sương/hào quang để giấu tiếp xúc. Mẹ giữa, Duy trái, Thảo phải; nắm tay theo vị trí giải phẫu. Duy khoảng 1,65 m, mẹ khoảng 1,58 m, Thảo khoảng 1,25 m chỉ là tỷ lệ khởi điểm. Có thể anh cao hơn mẹ mà vẫn còn nét thiếu niên. Cùng trục khi đi/ngồi; chuyển tư thế có chân/điểm tì, không dissolve để bỏ qua ngồi xuống.

Đây không phải bản dựng nguyên hồi ức đã quay: là cảnh chủ quan của giao kèo, có lời mẹ đối thoại và gửi gắm như chủ repo yêu cầu. Không dùng làm dữ liệu mẹ thật biết tương lai hoặc đã để trong máy. Không quay xác nhận thân thể ba mẹ con ở cánh đồng thật. Mẹ tan: cả da/áo/bóng cùng giảm một lần, tay trẻ níu khoảng trống có dụng ý; không nhầm với lỗi tay/vật bay, không để nửa đầu còn mà thân đã biến mất tùy tiện.

**SET-NHA / ngưỡng:** phòng trước quy ước 3,8×5 m, bàn may cũ mẹ trái/tắt, bàn ăn giữa lệch phải, bàn thờ phải, phòng sau khuất vách/lối ngoặt. Bố ở phòng sau chỉ âm, nếu dùng bóng mờ thì đúng hướng đèn/vách, không cận mặt hoặc thêm tuyến. Trẻ dừng ngoài ngưỡng, gọi dì đầu hẻm rồi đi ra; không bếp/bát hoặc dì đang ở trong nhà. Đèn bàn thờ riêng ổn định, không ám chỉ mẹ từ đó hiện ra. Không vẽ nhà dì.

Camera tiệm ở phía khách/nam trục hai trẻ. Giữ Duy trái/Thảo phải trong khung chính; concept xếp em trái/anh phải không ép đảo trục phim. Khi đổi sang cánh đồng vẫn xác lập vị trí trước cắt cận. Trở tiệm phải match ghế/tay, không bê bố cục đồng vào quầy.

## 2. Nhân vật và diễn

| Người | Tạo hình / diễn |
|---|---|
| Duy — anh trai, 16 tuổi | Áo thun xanh xám bạc, đường khâu nhỏ, quần xanh than/giày vải mòn; mặt vẫn trẻ. Đầu gồng, che em, giấu nhớ; G1 chọn và mất một kỷ niệm; G2 chủ động nhận gánh rồi kiệt; G3 phản ứng chậm có nguyên nhân, không ngu đi tùy cảnh. Ở đồng có thể cười/khóc thật nhưng mệt vẫn còn khi về |
| Thảo — em gái, 8 tuổi | Áo vàng kem cũ hơi rộng, khâu gấu gọn, quần lửng xanh vá nhỏ, dép mòn, tóc nửa đầu. Nói/tò mò đúng tuổi; nài vì nhớ mẹ, nhận G3 vì thấy anh không chịu nổi, không bị quy thành ích kỷ. Câu nhận nhanh phải sau giá và trước lời ngăn |
| Lộc khoảng 60 | Giữ thiết kế đã chốt. Lạnh/quyền chủ động; nụ cười nhỏ bắt đầu câu hỏi sau G1. Không mừng chiến thắng lớn, không hóa người hiền dạy bài học; nói rõ hiệu lực lời nhận ở G2 trước G3 |
| Mẹ khoảng 38–42 | Áo vải màu đất sáng, quần tối, tóc buộc thấp; phụ nữ lao động bình thường, mặt ấm có nét mệt nhẹ, không già như bà, không thiên thần. Đã có mẫu SVG và khung thử; các pose gọi/nắm tay/đi/ngồi/ôm/tan cần duyệt theo cảnh. Từ đùa chuyện nhỏ tới lời gửi gắm, không đọc diễn văn |

## 3. Chuỗi đạo cụ / giao kèo

| Vật hoặc mốc | Trước → sau / điểm cần soi |
|---|---|
| Máy | Túi vải → khăn vỡ/tắt → bàn sửa C4 → khăn sáng → ghi âm → nằm yên qua G2/G3 → Duy mang → gọi dì → túi phải. Không phát giọng mẹ đồng thời khi mẹ ở đồng nói |
| Tiền/túi/ví/ảnh | Tiền Duy trái quầy, tiền Thảo góp riêng rồi trả; phong bì+túi vải gấp cất túi trái C2. Ví túi sau; ảnh ra C2, cất trước ký G1 C3, giữ tới cuối. Không tạo lại trên quầy G2 |
| G1 | Hai liên giấy tự in cùng sự kiện, bìa kê; Duy ghi/đọc lại/ký trước sửa; tách C4, khách một/tiệm một. Bút đặt xuống trước kéo giấy. Không ghi sự kiện la em chưa chấp nhận |
| G2 | Lộc báo giá và hiệu lực lời đồng ý, Duy nhận bằng lời C5; ghi phiếu sau, ghi người trả Duy/gánh thêm trống vắng của Thảo. Không biến phiếu thành bằng chứng anh ký trước lời giá |
| G3 | Lộc nêu một lần gặp đổi không còn mơ thấy mẹ; Thảo đáp trọn trước Duy ngăn. Phiếu ghi người trả Thảo. Không cần Duy ký/cho phép và không lấy thêm từ Duy |
| Phiếu khi về | G1 ở ví từ C4, được Duy lấy ra cạnh hai liên mới nhận rồi cất đủ ba; ba liên tương ứng Lộc giữ. Không chứng minh giấy là vật nhốt linh hồn. Mỗi phiếu có chữ lớp đồ họa riêng |
| Tay khi đi đồng/ngồi | Mẹ giữa, Duy trái, Thảo phải; xác định từng bàn tay trước rig, đổi hình gần/xa theo máy. Khi ngồi, nắm được nhả/chuyển sang vai ở nhịp rõ, không tay thừa hoặc khóa khớp ngang cổ |

Không có bút/giấy vật lý trong cánh đồng. Chữ giao kèo không lơ lửng bên mẹ. Mẹ không để lại kỷ vật vật lý mới trong tiệm sau tan. Cái giá G1/G2/G3 vẫn hiệu lực, câu từ biệt không trả lại chúng.

## 4. Thiết lập theo cue

Lens tương đương full-frame, cao máy/khoảng cách quy ước là điểm bắt đầu mỹ thuật; chưa có quang học/3D thật. Tất cả roll 0°, rung 0 px / 0°. Khóa máy phần lớn; trượt nhỏ chỉ khi animatic xác nhận lớp/điểm tì. Cảnh dài dùng lại cận/phản ứng cùng trục, không cần thêm một ảnh cho mỗi câu.

### Cảnh 0 — Thành phố, mắt cú và hai trẻ (24 giây)

Theo thứ tự hai phác thảo gửi trong chat ngày 07/11/2026. Đây là thiết kế dựng bằng văn bản, không phải storyboard ảnh/animatic đã tạo. Các mốc dưới là thời lượng dự kiến; giữ tổng 24 giây để tránh cộng chồng tiêu đề/diễn xuất.

**C0-A · Toàn thành phố, trời sao và tiêu đề**
- 00:00–00:04 · 4 giây. 24 mm; nhìn từ cao hơn mái nhà; đường chân trời ở nửa dưới.
- Máy gần tĩnh rồi bắt đầu nghiêng xuống; trời nét đủ đọc sao, thành phố có lớp gần–xa; tiêu đề “TIN NHẮN CHƯA GỬI” nằm trong khoảng trời.
- Trời xa giữ ổn định tương đối, skyline giữa dịch ít, mái gần dịch nhiều hơn; không cho sao trôi cùng tốc độ tiền cảnh. Máy roll 0°, rung 0 px/0°. Tiêu đề đọc được trong khoảng trời, không che nhà quan trọng.

**C0-B · Hạ qua mái nhà tới cú**
- 00:04–00:08 · 4 giây. 35–50 mm cho bố cục trung mái hiên; điểm nhìn hạ về thanh đỡ.
- Tilt/hạ chậm theo đường cong, kết ở đầu cú; mái nhà lướt tiền cảnh có thể che điểm ghép; tiêu đề mờ hết trước cận mắt.
- Dùng mái/lằn tối hiên lướt qua để nối tấm toàn với tấm gần; giữ hướng chuyển xuống và nhịp không giật. Không yêu cầu mô phỏng bay hàng chục mét bằng một tranh hoặc đổi tiêu cự thật trong engine.

**C0-C · Cận mắt cú**
- 00:08–00:10 · 2 giây. 85 mm tương đương cận/macro; ngang tầm mắt cú; vùng nét mắt.
- Chuyển nét vào đồng tử và viền lông trong khoảng 0,6 giây rồi giữ; cú chớp một lần, phản chiếu ánh đèn bình thường, không mắt phát sáng.
- Cần hình cận đầu/mắt riêng đủ độ phân giải và khớp mảng lông của hình trung; không phóng mắt từ ảnh toàn hẻm. Cú đứng yên, chớp/ngoảnh rất nhẹ, móng không rời thanh. Lấy nét có điểm đầu–cuối, không blur cả khung.

**C0-D · Lùi ra từ cú, mở con hẻm**
- 00:10–00:16 · 6 giây. Từ bố cục cận sang rộng 35 mm tương đương; giữ cùng bên nhìn.
- Dolly-out giả lập nhiều lớp: lộ đầu/thân cú, thanh đỡ, đường, nhà hai bên và tiệm Lộc; cú/mái ở gần trái, tiệm ở giữa-xa phải; không chỉ scale một tranh.
- Chuẩn bị cận đầu → trung toàn cú/thanh → lớp hẻm rộng có vùng mái/đường sẽ lộ. Ghép kín tại nhịp chớp hoặc mảng tối nếu cần; dùng chung mốc mắt và thanh để không nhảy tỷ lệ. Người/nhà giữ mặt sàn và điểm tụ, không kéo méo phối cảnh khi mở rộng.

**C0-E · Chuyển từ cú sang hai anh em trước cửa**
- 00:16–00:21 · 5 giây. 35–50 mm bố cục trung rộng; máy hạ về cao 1,2 m ở cuối.
- Trượt chéo nhẹ sang phải, chuyển nét khỏi cú sang Duy/Thảo, dừng ở cửa; bóng người đi lớp giữa, không che mặt trẻ; Duy đứng gần cửa hơn, em nép sau anh.
- Cú ở mép trái mềm dần, trẻ và cửa rõ dần. Bóng người băng qua vùng đường không che mất nhịp Thảo níu áo/Duy che em; đường đi không xuyên hai trẻ. Máy giảm tốc tới điểm dừng, không đảo phía trục hoặc kéo mặt trẻ theo pan.

**C0-F · Giữ cửa rồi hai trẻ bước vào**
- 00:21–00:24 · 3 giây. 50 mm ngoại cửa, nối góc 35 mm nội C1-A theo bước.
- Giữ một nhịp nhìn nhau; Duy dẫn em qua ngưỡng, cắt kín qua khung cửa; vào vùng khách mới để Thảo tò mò đưa tay tới đồng hồ, sang C1 mới nhấc đồng hồ nhỏ rồi nghe “Để xuống”.
- Duy giữ túi máy trong một tay, tay còn lại gần em; em níu áo/nhìn vào trong. Duy dẫn, Thảo theo, cả hai có bước qua ngưỡng rõ. Sau nối C1, Thảo nhấc đồng hồ nhỏ khỏi mặt kệ thấp gần cửa; lời đầu nói trong tiệm. Em đặt lại đúng kệ rồi rút tay, không thả rơi hoặc tự đổi vị trí đồ.

**Nguyên tắc phối cảnh/tiết kiệm:** các lens trên là mục tiêu bố cục khác nhau. Muốn giống đường máy mềm qua cỡ cực rộng–cận–rộng cần nhiều tấm hình khớp và điểm ghép, chưa phải khả năng một camera 3D đã có. Duyệt skyline, mắt cú và khung cuối trước khi hoàn thiện lớp bị che; hạn chế số bóng người, dùng lại mặt ngoài tiệm cho C8 nếu góc phù hợp. Không hứa tiết kiệm quota theo phần trăm khi chưa render thử.

### Cảnh 1 — Thiếu tiền

19 giờ, tiệm cuối hẻm cách nhà ba căn. Duy 16 đứng trái, Thảo 8 phải gần cửa, nép sau anh; Lộc đầu tiên ở bàn sửa sau rồi bước tới quầy. Cửa mở, kệ trái, bàn sửa/đèn vàng sau, ánh hàng tạp hóa lạnh từ phải.

**C1-A · Toàn vừa qua lớp kệ gần**
- 35 mm; cao 1,15 m; cách quầy 2,7 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Khóa; Duy kéo em sau vai, tay phải bảo vệ bên em gần; Lộc nhìn lên trước khi bước tới.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

**C1-B · Cận Lộc qua kính**
- 70 mm; cao 1,2 m; hướng lên 7°; cách 3,2 m ở bàn sau. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Mắt lạnh, không cười; mặt giữ thiết kế đã chốt.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

**C1-C · Insert máy và tiền**
- 65 mm; cao 1,35 m; cúi 40°; cách 0,9 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Máy trên khăn giữa, tiền bên trái; tay hạ rồi thả; không xu nếu hình chỉ tiền giấy.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

**C1-D · Trung anh em, cửa bên phải**
- 50 mm; cao 1,2 m; cách 2,1 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Em níu áo, anh căng vai; chưa có nhạc an ủi.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

### Cảnh 2 — Chuyện anh muốn quên

Liên tục, Duy gom/cất phong bì và túi vải, trả đúng tiền em, kéo ghế có bậc chân cho Thảo. Hai trẻ ngồi cùng phía khách, Duy trái, Thảo phải. Máy giữa khăn, ảnh giấy trái, giấy G1 tự in hai liên phải và bút trên giấy.

**C2-A · Khung chung ba người**
- 35 mm; cao 1,15 m; cách quầy 2,7 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Thấy ghế/tiền cất thật; cửa vẫn mở, Lộc sau quầy.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

**C2-B · Cận vừa Duy rồi cận em cùng trục**
- 70 mm; cao 1,2 m với anh/1,05 m với em; cách 1,9 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Anh siết bút, em nói nỗi sợ cụ thể; không diễn trẻ như người lớn.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

**C2-C · Insert giấy còn trắng, ảnh và bút**
- 65 mm; cao 1,35 m; cúi 40°; cách 0,95 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Ảnh từ ví ra; bút đặt xuống trước Lộc giữ mép giấy, chưa ký.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

### Cảnh 3 — Lần thứ nhất — một tối được mẹ ôm

Vẫn quầy. Máy còn vỡ trên khăn; Thảo xoay cạnh vỏ sau khi anh nhả tay. Duy dịch ghế về em 10 cm. Sau thú nhận, em níu tay áo phải anh bằng tay trái, anh chạm vai trái em bằng tay phải. Cất ảnh trước ký G1; em buông tay trước anh lấy bút.

**C3-A · Tay em gần, mặt anh xa**
- 65 mm; cao 1 m; cách tay 0,9 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Chuyển nét 1,2 giây từ vết nứt sang Duy sau thú nhận, không nhấc máy khỏi khăn.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

**C3-B · Trung đôi cùng vùng nét**
- 50 mm; cao 1,15 m; cách 2,1 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Dịch ghế rồi chạm vai; có thể trượt ngang 8 cm/6 giây sau kiểm tra lớp.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

**C3-C · Insert ghi G1 và ký**
- 85 mm; cao 1,3 m; cúi 40°; cách 0,9 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Chữ G1: tối sinh nhật 16, mẹ ôm Duy rồi chụp ba người bằng máy này; đọc trước ký.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

### Cảnh 4 — Máy sáng, câu hỏi khác

Lộc sửa ở bàn sau trong tầm nhìn, cut thời gian, trả máy đã sáng lên khăn. Tách G1, một liên mỗi bên; Duy đọc/gấp liên mình vào ví. Duy nhập mật mã và phát ghi âm trên quầy. Sau phát máy không tự chạy lại.

**C4-A · Trung bàn sửa và máy trả quầy**
- 50 mm; cao 1,35 m; cách Lộc 1,8 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Hạ máy rồi thả, giữ màu vỏ; không hướng dẫn sửa kỹ thuật thật.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

**C4-B · Trung đôi kiểm tra trí nhớ**
- 50 mm; cao 1,15 m; cách 2,1 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Em hỏi vòng tay mẹ; Duy nhắm mắt tìm lại rồi lắc đầu; insert G1 dùng lại.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

**C4-C · Insert bấm phát rồi về mặt hai trẻ**
- 85 mm; cao 1,2 m; cúi 35°; cách máy 0,85 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Máy trên khăn, trỏ phải bấm rồi nhấc; lời mẹ có nguồn từ loa máy.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

**C4-D · Cận Lộc ở câu hỏi tò mò**
- 70 mm; cao 1,2 m; cách 2 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Chỉ lúc này cười lạnh rất nhẹ, không đổi thiết kế mặt đã chốt.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

### Cảnh 5 — Lần thứ hai — người anh nhận phần nặng

Thảo vẫn ngồi phải, Duy trái. Điện thoại ngừng phát trên khăn. G2 chưa có trước câu hỏi; Lộc rút phiếu sau khi nói giá. Với giao kèo cảm giác, ông nói rõ câu đồng ý là lúc có hiệu lực, giấy ông ghi sau để lưu; khác quy trình sửa máy và phải được báo trước. Duy không ký một điều kiện chưa nghe.

**C5-A · Trung ba người, Lộc giữa sâu**
- 50 mm; cao 1,2 m; cách quầy 2,3 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Lộc báo giá/hiệu lực bằng lời, hai trẻ nghe; không che câu đồng ý bằng nhạc.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

**C5-B · Trung đôi trong ánh phòng ấm lên**
- 50 mm; cao 1,15 m; cách 2,1 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Chỉ đổi lớp ánh sáng/âm chủ quan; thân vẫn trên ghế, chưa hiện mẹ hoặc thêm nhà.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

**C5-C · Cận Duy kiệt sức, tay em níu**
- 70 mm; cao 1,1 m; cách 1,8 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Vai sụp, mồ hôi thái dương, mắt khó bắt nét; tay em giữ đúng vải, không rung toàn khung.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

**C5-D · Cận em đáp rồi trắng chuyển cảnh**
- 65 mm; cao 1,05 m; cách 1,7 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- G3 được báo trước; tiếng Duy ngăn đến sau lời nhận; trắng lên một lần, ù vào đúng giao kèo.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

### Cảnh 6 — Lần thứ ba — cánh đồng có mẹ

Miền cảm giác của G3, không phải hai trẻ đã đi thật ra đồng hoặc mẹ hồi sinh. Tiệm/body vẫn ở thực tại; chỉ điểm nhìn chủ quan chuyển. Ruộng lúa hư cấu ven làng, lối đất bằng sát bờ, nắng cuối chiều; mẹ đứng giữa trước hai trẻ, gọi rồi nắm tay đi một đoạn ngắn. Mẹ khoảng 38–42, áo vải màu đất sáng, quần tối, tóc buộc thấp; đã có mẫu SVG/khung thử, chờ duyệt theo cảnh.

**C6-A · Toàn con đường ven ruộng, mẹ gọi hai trẻ**
- 35 mm; cao 1,2 m; cách nhóm 4 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Trắng dịu đi, ù tắt dần trước tiếng mẹ; cỏ gần/nhóm giữa/ruộng trời xa.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

**C6-B · Trung đi cùng mẹ từ phía trước**
- 50 mm; cao 1,25 m; cách 2,5 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Trượt lùi ngắn nếu đủ lớp; mẹ giữa, Duy trái, Thảo phải; tay nắm đúng bên, bước tiếp xúc đất.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

**C6-C · Trung ba mẹ con ngồi bên bờ**
- 50 mm; cao 0,85 m; cách 2,4 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Ngồi thật xuống thảm cỏ thấp khô; mẹ giữa, trẻ hai bên, không đổi trục.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

**C6-D · Cận phản ứng hai trẻ, mẹ rìa khung**
- 70 mm; cao 0,85 m; cách 1,8 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Cười nhỏ theo chuyện đời thường; chưa nhạc dâng bi kịch.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

### Cảnh 7 — Những lời để lại

Vẫn bờ ruộng và trục đã xác lập. Ánh cuối chiều ấm, không biến cảnh thành thiên đường có hào quang. Mẹ có cảm xúc bình thường, lời gửi gắm là trải nghiệm chủ quan G3, không chép vào dữ liệu chiếc máy hoặc coi là sự kiện lịch sử kiểm chứng. Sau lời cuối, mẹ/áo/bóng cùng tan, hai trẻ vẫn có điểm tựa đất.

**C7-A · Trung ba người, tay mẹ trên vai hai con**
- 50 mm; cao 0,85 m; cách 2,4 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Lời giản dị, có nhịp nghe; mẹ chạm từng bên đúng pose đã có.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

**C7-B · Cận vừa mẹ và Duy**
- 70 mm; cao 0,9 m; cách 1,9 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Giữ mắt cậu, không quay để giấu khóc; tay mẹ không xuyên cổ.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

**C7-C · Trung em ôm rồi mẹ tan**
- 50 mm; cao 0,85 m; cách 2,4 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Mẹ mờ dần một lần 3–4 giây; bóng/áo cùng giảm; tay trẻ ngừng ở chỗ không còn mẹ có chủ ý.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

### Cảnh 8 — Trở về cùng nhau

Cắt về đúng ghế ở tiệm, không dịch chuyển cơ thể thật ra đồng. Lộc viết/tách G2 và G3 sau các câu đồng ý đã được báo có hiệu lực bằng lời; đủ ba liên khách, ba liên tiệm. G1 đang ở ví; Duy lấy ra đặt cạnh G2/G3 mới nhận để đối chiếu rồi cất đủ ba. Ảnh đã cất từ C3, không xuất hiện lại trên quầy. Duy lấy máy; rời tiệm. Sau cut tới ngưỡng nhà: bố sau vách qua âm, trẻ không vào; gọi dì bằng máy đã sửa, rồi đi về hướng đèn nhà dì, không dựng nội thất thứ tư.

**C8-A · Trung đôi trở lại tiệm, mắt mở**
- 50 mm; cao 1,15 m; cách 2,1 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Match pose ngồi, còn bàn tay em trong tay anh; Duy mệt còn đó, G2 không được xóa.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

**C8-B · Insert ba phiếu rồi cất**
- 65 mm; cao 1,35 m; cúi 40°; cách 0,95 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Duy lấy G1 từ ví đặt cạnh G2/G3 rồi cất đủ ba; G3 ghi Thảo; mỗi bên một bộ copy.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

**C8-C · Toàn cửa nhà rồi trung cuộc gọi**
- 28 mm cao 1,2 m cách 2,5 m → 50 mm cao 1,15 m cách 2 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Bố ngoài khung, chai lăn/giọng không rõ chữ; Duy chắn em và xin dì giúp.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

**C8-D · Toàn ngưỡng cửa, hai trẻ rời khung**
- 35 mm; cao 1,15 m; cách 2,5 m. Nét chính ở mặt/tay đang truyền thông tin; nền dịu có mức, không che điểm nắm.
- Cất máy/giấy trước nắm tay đi; giữ đèn đầu hẻm, âm bố xa dần.
- Trở góc chung/cận cùng trục theo lời; cue không phải timecode cố định trước khi có audio.

## 5. Trắng/ù và âm thanh

- C0: âm thành phố rộng/xa ở trên cao chuyển dần về hẻm; xe và người xa có vị trí, bước người đi gần chỉ rõ lúc vào lớp tương ứng. Có thể một tiếng cú ngắn khi thấy rõ cú, không lặp liên tục hoặc đẩy thành âm hù. Nhạc mở thưa, tò mò, rút trước “Để xuống”; tiếng hẻm làm cầu vào tiếng quạt tiệm. Đây là 24 giây không lời đã tính riêng, âm/tiêu đề chạy dưới hình không cộng thêm thời lượng. Không lấy tiếng ù/trắng của G3 làm hiệu ứng mở.

- G3 sau trọn “Cháu đồng ý!”: trắng lên liên tục khoảng 0,6 giây, giữ ngắn rồi giảm để lộ đồng trong tổng nghỉ 2 giây; tiếng ù hẹp vào cùng nhịp, rút trước mẹ gọi để không che chữ. Một lần chuyển, không chớp lặp hoặc kéo ù suốt trường đoạn ấm.
- AM-TIEM giữ quạt/hẻm, không tích tắc cho đồng hồ chết. Dụng cụ, tiền/phong bì/vải, ghế/giấy/bút và máy rõ chất liệu và tiếp xúc; tách phiếu có âm giấy ngắn, không tiếng xé trong thao tác kéo giấy.
- G2 âm hẻm lùi trong thoáng chủ quan rồi trở; không dùng ù/trắng vốn dành G3. Sau ấm là hơi thở/cơ thể Duy và quạt, không tiếng bệnh tim hoặc khẳng định chẩn đoán thật.
- AM-DONG: gió lúa, chân đất, vải áo; nhạc không lời ấm thưa, nghe được nhưng nhường chuyện đùa/giọng mẹ. Trước tan giảm mật độ, không sting cho mỗi giọt nước mắt. Không khí thật có sức sống, không choir mặc định thiên đường.
- VO-ME-REC ở máy là bản cũ; VO-ME-FIELD là cùng nhân vật/giọng trong trải nghiệm, nguồn từ mẹ trong hình, không lọc điện thoại. Hai nguồn không chồng cùng câu. Chưa chọn voice/model, chưa tạo hoặc nghe audio.
- AM-NHA/FX-BO: chai lăn và càm ràm không rõ chữ phía sau vách; đủ sức khiến trẻ dừng. Không chai vỡ nếu chỉ lăn, không cận thoại/bạo lực bố. Dì chỉ được người kể thuật lời nhận, không voice mới.
- Kết rút âm bố theo khoảng cách/vách khi trẻ đi; nhạc không xóa mệt/mất mát. Ưu tiên file miễn phí/đã có với quyền rõ; chưa chọn nguồn, chưa nghe mix, không áp gain chung.

## 6. Hai bước duyệt và phạm vi mới

Storyboard: ngoài ba giao kèo/đúng người trả, kiểm tra C0 trời/chữ đúng khoảng trống, cùng một cú ở cận/trung/toàn, mái-thanh không nhảy, người nền dạng bóng và trẻ đúng màu, khung cuối trước cửa nối được C1; khung Thảo đáp không bị cắt mất đầu/cuối, Duy chậm có lý do. Xác lập tiệm–miền cảm giác–trở tiệm–ngưỡng nhà rõ, mẹ không hiện như người còn sống trong hiện tại. Đã có mã/preview ruộng và mẹ; cần duyệt tạo hình và mức phù hợp với cảnh, không coi file tồn tại là đã duyệt.

Animatic: chạy trọn C0 hạ máy/chuyển nét/lùi/trượt, các mốc ghép đầu–giữa–cuối, bóng người không che trẻ và bước vào cửa, rồi tay/tiền/ảnh/phiếu/máy, G2 cơ thể sụp, em nhận lời/anh ngăn chậm, chuyển trắng-ù, nắm tay đi/ngồi/ôm, mẹ tan cùng bóng và tay trẻ ở khoảng trống, trở đúng ghế/cất đồ/gọi dì. Dùng âm/giọng tạm, không tự gọi dịch vụ trả phí. Chỉ pan tranh không kiểm tra được các tiếp xúc. Sau voice thật cập nhật timeline; không dùng timing bản 3 hoặc giữ định mức 22 cue cũ.
