# Ngôn ngữ điện ảnh cho What If 2D có chiều sâu

Ngày nghiên cứu: 07/11/2026. Đây là nghiên cứu và đề xuất mỹ thuật, chưa phải chức năng đã triển khai trong studio hoặc kết quả thử với khán giả. Không tạo audio/video trả phí trong bước này.

## Hướng phù hợp với dự án

Giữ nhân vật và chất liệu vẽ 2D; tạo cảm giác không gian bằng bố cục gần–xa, che khuất, phối cảnh, ánh sáng tạo khối và chuyển động giữa các lớp. Dùng ngôn ngữ quay phim để dẫn mắt, giấu/lộ thông tin và thể hiện khoảng cách giữa người với người.

Chọn 2.5D nhiều lớp làm nền tảng trước. Dành hình vẽ góc riêng hoặc bối cảnh 3D đơn giản cho những shot thật sự cần đổi hướng nhìn. Đây là đề xuất dựa trên mục tiêu tiết kiệm quota và tận dụng bộ dựng hiện có; chưa có phép đo để hứa tiết kiệm một tỷ lệ cụ thể.

## Những cơ sở đã kiểm tra

- **Multiplane:** các mặt phẳng hình 2D có thể đặt ở những độ sâu khác nhau. Khi máy di chuyển ngang qua chúng, sự dịch chuyển tương đối tạo parallax. Nguồn chính thức: [Toon Boom — What is a multiplane?](https://helpcentre.toonboom.com/hc/en-ca/articles/51906223976339-What-is-a-multiplane), cập nhật 21/07/2026, đã đọc nội dung.
- **Tiền lệ hoạt hình:** bài của [Walt Disney Family Museum về Pinocchio](https://www.waltdisney.org/blog/machine-imagination-walt-disneys-pinocchio-and-multiplane-camera), 18/09/2016, mô tả việc tách tranh thành nhiều tầng để tạo chiều sâu. Đây là nguyên lý lâu đời; không cần gắn nhãn “trend mới”. Đã đọc bài, chưa xem các phân cảnh phim được bài nhắc đến.
- **Phối cảnh:** thay đổi vị trí máy so với chủ thể làm đổi tương quan gần–xa. Tại cùng một vị trí máy, đổi tiêu cự rồi crop cho cùng khung không tạo ra một phối cảnh mới. Nguồn: [ASC — Understanding Lens Distortion](https://theasc.com/article/understanding-lens-distortion/), Jay Holben, 20/09/2024, đã đọc nội dung.
- **Hai vùng nét:** split-field diopter trong quay thật cho hai khoảng cách nét riêng ở các phần khác nhau của ảnh; không đồng nghĩa toàn bộ chiều sâu đều nét. Nguồn: [ASC — Deep Focus: Diopters](https://theasc.com/post/shot-craft/deep-focus-diopters/), đã đọc nội dung. Với hoạt hình ta có thể thiết kế hai vùng rõ bằng lớp/mask mà không cần mô phỏng thấu kính thật.
- **Dolly zoom:** phối hợp dịch máy với thay đổi góc nhìn theo chiều bù để giữ kích thước chủ thể trong khi hậu cảnh đổi tương quan. Nguồn: [Adobe — Dolly zoom](https://www.adobe.com/creativecloud/video/production/cinematography/camera-shots-and-angles/dolly-zoom-shot.html), đã đọc nội dung; không xác định ngày cập nhật của bài. Trong 2D, scale các lớp là cách mô phỏng hiệu ứng, không phải tự động có phối cảnh vật lý đúng.

Các ứng dụng cảm xúc, thông số thử và cách chọn shot bên dưới là đề xuất cho dự án. Không phải công thức tâm lý phổ quát được các nguồn xác nhận.

## Sáu thứ cần phối hợp để 2D trông có khối

1. **Không gian rõ:** xác định sàn, tường, chân trời, điểm tụ và tỉ lệ người–đồ. Vẽ chiều sâu ngay từ layout, trước hiệu ứng.
2. **Các lớp có chức năng:** bắt đầu với tiền cảnh, lớp hành động và hậu cảnh. Chỉ tăng lớp khi máy cần đi qua nhiều khoảng cách. Nhân vật, tay và vật đang cầm phải cùng hệ tọa độ thích hợp.
3. **Che khuất đúng:** người đi sau bàn phải mất phần chân đúng lúc; vật được nhấc phải rời mặt bàn và bóng của nó phải đổi. Sai tiếp xúc phá ảo giác khối rất nhanh.
4. **Parallax có giới hạn:** khi dịch máy ngang, vật gần thường dịch nhiều hơn vật xa. Không áp quy tắc này máy móc cho mọi chuyển động quay đầu/pan. Những phần nền bị lộ sau vật tiền cảnh phải được vẽ đủ.
5. **Ánh sáng có hướng:** chia mặt sáng, mặt khuất và bóng tiếp xúc. Có thể thêm ánh phản xạ và viền khi nguồn sáng phù hợp; không viền vàng mọi nhân vật. Hướng sáng phải liên tục giữa các shot.
6. **Nét và độ tương phản có chủ ý:** dùng nét chọn lọc để dẫn mắt, hoặc giữ nhiều lớp rõ để khán giả tự phát hiện chuyện phía sau. Hậu cảnh mờ toàn bộ không tự tạo một cảnh có chiều sâu. Sương và tương phản giảm theo xa chỉ dùng khi hợp môi trường.

Chuyển động cơ thể cũng phải có thể tích: đầu quay cần thay hình mặt, phần gần/phần xa, tai và đường viền; chỉ trượt mắt trên một khuôn mặt nguyên trạng sẽ nhanh lộ độ phẳng ở góc mạnh. Góc 3/4 không thay được bộ hình cho mọi góc nhìn.

## Chọn lens cùng vị trí máy

Các số dưới đây là **tiêu cự tương đương full-frame để truyền đạt ý đồ**, không phải thông số thấu kính đã được engine mô phỏng. Khi chuyển sang camera 3D, phải thống nhất kích thước cảm biến/filmback và cách đo trường nhìn.

| Dải gợi ý | Vị trí/bố cục đi cùng | Ứng dụng đề xuất | Cần tránh |
|---|---|---|---|
| 18–24 mm | Máy gần vật tiền cảnh, thấy sâu vào phòng | Bàn tay do dự trước vật quan trọng; hành lang bất an | Đặt mặt sát rìa và làm méo ngoài ý muốn |
| 28–35 mm | Máy ở khoảng trò chuyện, còn thấy bối cảnh | Đời thường, hai người cùng khung, đi qua hẻm | Chỉ đổi con số lens nhưng giữ nguyên hình/layout |
| 50 mm | Cỡ vừa/cận, khoảng cách đủ tự nhiên | Lắng nghe, một hành động nhỏ hoặc lời khó nói | Mặc định đây là tiêu cự đúng cho mọi khuôn mặt |
| 75–100 mm | Lùi máy để giữ cùng cỡ chủ thể | Quan sát từ xa, cô lập, giữ các lớp cửa/vai ở trước | Quy hiệu ứng nén không gian cho lens đơn độc |
| Cận chi tiết/macro | Thiết kế riêng bề mặt và điểm chạm | Ngón tay, vết nứt, nước trên mép cốc | Phóng to asset toàn cảnh thiếu chi tiết |

Góc thấp không mặc định là “quyền lực”; cùng góc ấy từ tầm mắt một đứa trẻ có thể là tò mò hoặc sợ. Góc cao không luôn là “yếu đuối”. Ý nghĩa phụ thuộc điểm nhìn, ánh mắt, khoảng cách và tình huống.

## Bộ góc quay có thể dùng để kể chuyện

| Cách quay | Điều nó giúp kể | Thực hiện với 2D/2.5D | Công sức tương đối |
|---|---|---|---|
| Khung trong khung qua cửa/rèm | Nhân vật bị tách khỏi gia đình hoặc đang nhìn trộm | Tách khung cửa tiền cảnh; để khoảng trống có nghĩa | Thấp nếu có lớp |
| Over-the-shoulder có vật cản | Quan hệ gần–xa, ai chiếm khung, ai bị né tránh | Vai gần, người giữa, nền xa; giữ trục nhìn | Thấp–vừa |
| Wide gần tiền cảnh, hành động sâu trong khung | Một vật nhỏ trở nên đáng ngại; người xa vẫn có phản ứng | Bố cục riêng, phối cảnh thống nhất | Vừa |
| Di chuyển ngang để lộ thông tin | Khán giả phát hiện điều vốn bị cột/tủ che | Parallax và mask; phần bị che có hình đầy đủ | Vừa |
| Chuyển nét từ vật sang người | Một chi tiết đổi nghĩa vì phản ứng ở phía sau | Animate blur theo từng lớp; giữ mặt và silhouette sạch | Vừa |
| Hai vùng rõ theo tinh thần split diopter | Thấy đồng thời người nói và người nghe lén | Hai vùng nét có bố cục rõ, không blur đường viền tùy tiện | Vừa |
| Góc sát sàn hoặc ngang mặt bàn | Trải nghiệm không gian ở tầm trẻ nhỏ/vật bị rơi | Cần hình bối cảnh góc thấp, thấy mặt dưới thích hợp | Vừa–cao |
| Top-down | Các khoảng cách, chỗ ngồi trống hoặc lựa chọn hiện rõ | Asset nhìn từ trên và bàn tay đúng hướng | Vừa–cao |
| Qua phản chiếu kính/gương/nước | Cho thấy điều nhân vật không trực tiếp đối diện | Dựng lớp phản chiếu đúng vị trí, hình và vật che | Vừa–cao |
| Máy đứng yên, người rời khỏi khung | Sự vắng mặt, lưỡng lự hoặc khoảng cách không được hàn gắn | Giữ âm phòng và hành động nhỏ cần thiết | Thấp, cần diễn xuất tốt |
| Dolly zoom mô phỏng | Thế giới quen thuộc bỗng không còn đáng tin | Giữ chủ thể, biến đổi các lớp và phối cảnh có kiểm soát | Cao hơn push-in |
| Nghiêng khung nhẹ có diễn biến | Thể hiện điểm nhìn mất cân bằng sau biến cố | Có điểm bắt đầu, mức nghiêng và lý do trở lại ngang | Thấp về hiệu ứng; dễ lạm dụng |
| Máy bám cơ thể kiểu Snorricam | Cảm giác chủ quan bị cuốn vào hoảng loạn | Giữ thân trong khung, môi trường biến động; cần hoạt hình phù hợp | Cao |
| Cú quay vòng/orbit đổi hướng nhìn | Khám phá không gian hoặc quan hệ quanh chủ thể | Nhiều hình góc nhìn hoặc môi trường 3D; tranh phẳng dễ lộ cạnh | Cao |

Mức công sức chỉ để sắp thứ tự lựa chọn, phụ thuộc asset có sẵn; không phải số đo thời gian hoặc hóa đơn.

Chọn góc phá cách tại điểm có chuyển biến: phát hiện, đảo thế, lựa chọn hoặc mất mát. Một cảnh cảm xúc có thể mạnh hơn khi máy dừng. Không áp chỉ tiêu số góc lạ cho mọi tập.

## Máy chuyển động, độ rung và focus

- **Dịch máy/push-in:** ghi máy bắt đầu/kết thúc ở đâu, tiến tới ai/vật nào, thông tin nào được lộ. Với 2.5D ghi rõ lớp nào đổi tương quan; scale cả frame chỉ là phóng ảnh.
- **Máy tĩnh:** ghi rung bằng 0 khi cần người xem đọc một cử chỉ. Không tự thêm chuyển động để lấp mọi khoảng nghỉ.
- **Handheld:** chuyển động có trọng lượng, hướng và nhịp; không random độc lập từng frame. Hoạt hình phải xác định được từ thời gian để dựng lại cùng kết quả.
- **Cú va:** tách rung của máy khỏi chuyển động đồ vật; mô tả hướng tác động, lúc bắt đầu và độ tắt dần. Khi kiểm tra dùng đơn vị rõ: pixel ở độ phân giải đầu ra và độ xoay, không chỉ “rung 20%”.
- **Focus:** ghi đối tượng nét đầu → đối tượng nét cuối, lúc chuyển và khoảng chuyển. Trong bộ SVG đây là blur/mask mỹ thuật, chưa phải khoảng lấy nét vật lý hoặc khẩu độ thật.
- **Trục 180° và hướng chuyển động:** giữ người xem biết ai nhìn ai và cửa thoát ở đâu. Nếu đổi trục, cho thấy máy/nhân vật đi qua hoặc tái xác lập không gian. Phá quy tắc phải có hiệu quả cụ thể.
- **Motion blur:** dùng nếu chuyển động cần, kiểm tra độ rõ biểu cảm và nét vẽ. Không mặc định làm nhòe mọi chuyển động là điện ảnh.

## Mẫu một shot đủ rõ để dựng

```text
Mã shot / nhịp truyện:
Điều người xem phải hiểu hoặc cảm thấy:
Bối cảnh / thời gian / ai có mặt / vị trí tương đối:
Cỡ cảnh / độ cao máy / hướng nhìn / độ nghiêng:
Lens tương đương / khoảng cách máy / phối cảnh mong muốn:
Chuyển động: điểm đầu → cuối, lý do và thời lượng:
Rung: không; hoặc biên độ, đơn vị, nhịp, lúc tắt:
Focus: đối tượng đầu → cuối / thời điểm / vùng giữ rõ:
Các lớp gần–xa / phần bị che / phần sẽ lộ:
Nguồn sáng / hướng bóng / mặt sáng và mặt khuất:
Hành động / ánh mắt / nhịp giữ / âm thanh:
Asset có sẵn / hình góc mới phải làm:
Giới hạn máy được phép đi / kiểm tra continuity:
```

## Ví dụ minh họa độc lập, không phải sửa kịch bản một tập

Một người chị đang dọn bàn. Người em ngồi ở cửa. Trên bàn là một chiếc bát chưa có người dùng. Tình huống chỉ để thử kể bằng hình, không cần thêm lore hay giọng tổng hợp.

1. **Toàn vừa 35 mm, máy tĩnh ngang tầm người ngồi:** cột cửa ở gần, chị ở giữa, em ở xa. Khung có ba lớp và một khoảng trống giữa hai người. Cho khán giả hiểu căn phòng trước khi cắt.
2. **Cận tay, góc chéo mặt bàn:** chị đặt thêm chiếc bát rồi dừng. Bóng ngón tay chạm mép bát. Không cần thoại giải thích “chị nhớ một người”.
3. **Giữ khung, chuyển nét sang cửa:** bàn tay thành tiền cảnh mềm, em ở xa nhìn thấy cử chỉ. Đây là thay đổi điểm chú ý, không thêm biến cố.
4. **Trung cảnh qua vai:** em đứng lên và đi vào vùng sáng cạnh bàn. Cột cửa dịch khỏi khoảng giữa khi máy trượt nhẹ. Sự ngăn cách giảm bằng hành động và bố cục.
5. **Máy đứng lại:** chị chưa buông chiếc bát ngay. Giữ khoảng lặng để người xem nhận ra khó khăn của cử chỉ. Kết thúc shot theo diễn xuất, không theo một con số cắt/phút.

## Đối chiếu bộ dựng hiện tại

Đã đọc `what-if-studio/src/engine/anim.ts` và reference `look.md` trong repo ở lần nghiên cứu ngày 07/11/2026.

- `camT(cx, cy, s)` thực hiện translate/scale SVG: hữu ích cho bố cục và zoom, nhưng bản thân hàm không có tiêu cự, trục Z, phép chiếu phối cảnh hoặc hệ thống lấy nét vật lý.
- `kf` và các helper thời gian là nền để điều khiển chuyển động có thể tái lập. Không nên gọi cùng một scale trên mọi lớp rồi ghi là đã có camera 3D.
- Reference hiện có đã mô tả lớp tiền cảnh, blur, nguồn sáng và bóng. Đó là hướng mỹ thuật; không phải bằng chứng tất cả shot hiện tại đã đạt chất lượng ấy.
- Một số quy tắc cũ như luôn có viền sáng, rất nhiều đồ trang trí, luôn có thứ chuyển động chỉ hợp một số mẫu. Đề xuất hiện tại cho phép bố cục thoáng, sáng ban ngày và máy tĩnh khi kể tốt hơn.
- Chưa kiểm toán toàn bộ engine, chưa sửa code, chưa render mẫu trong studio. Không kết luận thiếu một chức năng trên mọi nhánh chỉ từ một helper.

**Phương án đã chốt với chủ repo:** ưu tiên ba lớp gần–giữa–xa, chuyển động máy nhỏ và bối cảnh tái sử dụng. Duyệt theo hai bước **storyboard tĩnh → animatic** theo [quy trình sản xuất](WHAT-IF-QUY-TRINH.md). Storyboard duyệt hình/bố cục; animatic cho chạy đường đi máy, tương tác tay–đồ và che khuất để duyệt chuyển động, nhịp và khoảng nghỉ. Bảng ảnh đầu–giữa–cuối chỉ hỗ trợ kiểm tra, không thay animatic.

Animatic tận dụng asset đã duyệt và chất lượng preview vừa đủ; có thể dùng lời/âm thanh tạm khi chưa có bản chính thức. Không cần gọi dịch vụ tạo giọng/hình/video trả phí chỉ để duyệt bước này. Sau thay giọng chính thức phải cập nhật timeline phụ thuộc. Đây là quyết định về cách làm; chưa triển khai hoặc đo chi phí trên một tập mới nên không coi là bằng chứng tiết kiệm một tỷ lệ quota cụ thể.

Nếu cần orbit lớn hoặc đi xuyên phòng, cân nhắc mô hình khối đơn giản với vật liệu giữ chất 2D và nhân vật nhiều góc nhìn. Việc đổi công cụ cần thử pipeline riêng; chưa đủ cơ sở khuyên chuyển cả dự án sang phần mềm khác.

## Bài học dùng lại

- Hình trông phẳng → các lớp có cùng chuyển động hoặc sai tiếp xúc → thiết kế độ sâu, che khuất và bóng trước hiệu ứng → kiểm tra ở đầu/giữa/cuối cú máy.
- Shot có nhiều thông số nhưng không đổi cảm xúc → chọn camera theo hình thức → viết trước một câu về điều khán giả cần nhận ra → bỏ hiệu ứng mà nội dung vẫn y nguyên thì cân nhắc bỏ.
- Góc mới làm tốn nhiều asset → đổi hướng nhìn vượt bộ hình đang có → chốt đường đi máy trước khi vẽ → không phát hiện mặt sau thiếu hình ở bước render cuối.
- Lời “lens 35 mm” không biến một tranh thành phối cảnh 35 mm → engine và ý đồ khác nhau → ghi tiêu cự tương đương cùng vị trí máy và phương án dựng → người dựng hiểu rõ phần nào được mô phỏng.
- Kết quả nghiên cứu chưa qua dựng thử → dễ biến đề xuất thành kinh nghiệm đã chứng minh → đánh dấu “nguyên lý có nguồn”, “đề xuất” và “đã kiểm tra thực tế” riêng.

## Video và giới hạn của lượt nghiên cứu

| Tư liệu | Tác giả / ngày đăng | Mức tiếp cận | Sử dụng trong nghiên cứu |
|---|---|---|---|
| [3D Assets and the Multiplane Camera in Harmony](https://www.youtube.com/watch?v=QCYEg4xyxBs) | Toon Boom Animation; 03/08/2021 theo metadata tìm kiếm | Chỉ metadata/description; mở trực tiếp thất bại; chưa xem/nghe hoặc đọc transcript | Đầu mối xem tiếp, không dùng để khẳng định đã quan sát kỹ thuật trong video |
| [Walt Disney’s MultiPlane Camera](https://www.youtube.com/watch?v=YdHTlUGN1zw) | fireurgunz; tải lại 12/08/2008; tiêu đề ghi tư liệu 13/02/1957 | Chỉ metadata; bản đăng lại, không phải kênh Disney đã xác minh | Đầu mối lịch sử; nguyên lý trong báo cáo dựa vào bài bảo tàng và Toon Boom |
| TikTok: tìm “cinematography parallax camera 2.5d”, “2.5d animation camera”, “multiplane animation” | Chưa xác minh được video gốc phù hợp | Không có nội dung trực tiếp đủ kiểm chứng | Không rút ra nhận định trend, lượt xem hay kỹ thuật từ kết quả gián tiếp |

Không gán timestamp vì chưa kiểm tra media. Một số trang Blender và tài liệu Harmony cũ không mở được qua công cụ; không dùng chúng làm bằng chứng về tính năng/phiên bản hiện hành. Phạm vi là nguyên lý điện ảnh và khả năng áp dụng vào dự án, không phải khảo sát mọi trường phái hoặc xu hướng khán giả mới nhất.
