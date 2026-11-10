# Hồ sơ 2 — Dựng cảnh và góc máy

**Đồng bộ 11/11/2026:** dùng bản kịch bản mới trong KICH-BAN.md và ba file PHAN, mục tiêu khoảng 15 phút. Bản 27:40 và cảnh giằng co cưỡng ép vào gương đã được thay thế. Cơ chế hiện hành là đối chất tâm lý, Nam buông xuôi và mặt kính hóa nước; kết mở với Nam trong thế giới gương, Tùng bắt đầu nhận ra dấu khác biệt và Người Kia cài then cửa. Thời lượng là mục tiêu biên tập, chưa đo audio/animatic.

**Phạm vi bảng máy dưới đây:** A–H dành cho P1.01–P1.08, giữ bố cục/rig/phòng đã cập nhật. Hồi tưởng O01–O05 có hướng máy/âm trong [P1.00](PHAN-01-NGUOI-TRONG-PHONG.md#p1-00). Phần 2 và 3 đã có bối cảnh, cỡ cảnh, điểm nhìn, hành động/âm ngay dưới từng cảnh trong [phần 2](PHAN-02-QUEN-DUOC-LAM-THAY.md) và [phần 3](PHAN-03-NGUOI-BI-THAY-THE.md); chưa tách thành shot list/timeline thực thi toàn tập. Không coi A–H đủ để dựng cả ba phần.

Nguồn lời phần 1 chuyển từ THAO-LUAN sang PHAN-01, các đoạn đã duyệt bảo toàn câu chữ. Gương và các pose/đạo cụ mới xem [ASSET.md](ASSET.md); cơ chế mới là đề xuất trong [LUAT-BAN-NHAP-V1.md](LUAT-BAN-NHAP-V1.md). Chưa render hay tạo âm thanh.

## Cách dùng & Bộ quy chuẩn máy quay điện ảnh người đóng (Live-Action Cine Suite)

- Đi theo hành động/thoại ở bản nguồn; mã máy dùng để tìm bố cục và ý đồ tâm lý, không phải một câu thoại tương ứng một cú cắt.
- Khung hình chuẩn **2.39:1 Anamorphic Cinema** (hoặc 16:9 với letterbox điện ảnh); bố cục theo chiều sâu trục Z, phân lớp ánh sáng Chiaroscuro (Fincher) và trường sâu ảnh nông (Shallow DoF f/1.4 - f/2.0).
- Tiêu cự ống kính tương đương **Full-Frame Cine Primes**:
  * **24mm Cine Anamorphic**: Góc rộng méo viền (Barrel Distortion), tạo cảm giác chật chội, tù túng và ngột ngạt của căn phòng trọ 12m2.
  * **35mm Cine**: Tiêu cự kể chuyện toàn cảnh tự nhiên, tái hiện không gian và tương quan khoảng cách giữa hai nhân vật.
  * **50mm f/1.4 Prime**: Tiêu cự đối thoại chân dung, xóa mờ hậu cảnh nhẹ, tách chủ thể sắc nét.
  * **85mm f/1.2 Telephoto**: Cận cảnh nén không gian (Spatial Compression), dồn toàn bộ sự chú ý vào đôi mắt, nốt ruồi và biểu cảm vi mô.
- **Chuyển động máy quay sống động (Organic Camera Movements)**:
  * **Handheld Breathing Jitter (Rung thở hữu cơ)**: Máy quay không đứng im chết cứng như 2D tĩnh, mà có dao động thở cầm tay vác vai của DOP (tần số $0.2\text{Hz}$, biên độ vi mô $0.3 - 0.8\text{px}$). Khi có cú sốc/va chạm, rung giật dứt khoát $2.0 - 3.5\text{px}$ rồi hồi phục.
  * **Slow Push-In (Creeping In)**: Máy quay trườn từ từ vào gương mặt ($1 - 2\text{px/s}$) tạo áp lực tâm lý nghẹt thở khi Nam bế tắc hoặc toan tính vụ lợi.
  * **Dutch Angle (Góc nghiêng tâm lý $5^\circ - 15^\circ$)**: Khung hình nghiêng trục chân trời khi thực tại bị bẻ cong (trùng giọng nói, phát hiện căn phòng bị chiếm, đối diện mặt gương).
  * **Rack Focus / Focus Pull**: Chuyển nét mượt mà giữa tiền cảnh và hậu cảnh qua vai (Over-The-Shoulder).
  * **Hitchcock Vertigo Dolly Zoom**: Phối hợp Zoom In + Dolly Out làm biến dạng phối cảnh hậu cảnh khi bí mật chiếc gương bị bóc trần.
- **Hòa sắc & Lớp phủ điện ảnh (Cinematic Grade Overlay)**: Dùng component `CinematicGradeOverlay` phủ trên đỉnh khung hình với `mix-blend-mode: soft-light` ($8\% - 14\%$) theo từng mood phân cảnh (`fincher_night`, `morning`, `mirror_realm`), tích hợp sẵn hạt phim 35mm và vignette:
  ```tsx
  import { CinematicGradeOverlay } from '../../../../what-if-studio/src/engine';
  // Đặt ở lớp trên cùng trong Composition:
  <CinematicGradeOverlay mood="fincher_night" vignetteStrength={0.45} />
  ```
- Danh mục bối cảnh, đạo cụ, tư thế nhân vật chi tiết xem tại [CHECKLIST-TIEN-KY-ASSET.md](CHECKLIST-TIEN-KY-ASSET.md).
- Xem [nhịp kể A–H](#nhịp-kể-hiện-hành) cùng các cue NHỊP trong bản nguồn trước khi thử diễn; đây là bổ sung nhịp 10/11/2026, chưa phải giọng hoặc timeline đã đo.
- Khoảng giữ cho cú sốc, cuộc gọi ngắt và do dự **nằm trong thời lượng hành động/thoại đã có**. Khoảng nghỉ 2 giây ở bản nguồn chỉ được tính một lần. Chưa đo tổng thời lượng bằng diễn/giọng, không cộng riêng mọi nhịp giữ như một cảnh mới.

## Nhịp kể hiện hành

**Bổ sung 10/11/2026 theo yêu cầu cập nhật nhịp.** Áp dụng cho phần đã viết A–H, từ buổi sáng đến lúc Nam đọc bài người kia làm hộ. Chỉ dẫn nhịp là bản biên tập để thử; giữ nguyên thoại, tình tiết và nhãn đã duyệt/chờ duyệt. Bảng A–H không bao gồm quá trình thay thế; nhịp phần 2–3 đọc trong đúng file PHAN.

### Cách tính nhịp

- Lời và hành động dẫn thời lượng. Các số giây dưới đây là khoảng thử cho diễn xuất/đọc hình; không phải thời lượng đã đo bằng giọng hoặc animatic. Chưa khóa tổng phút của phần này hoặc cả hồ sơ.
- Một khoảng giữ đã nằm trong hành động thì tính **một lần**. Hai nhịp giữ khoảng 2 giây trong bản nguồn vẫn là hai nhịp đó; không cộng thêm vì đổi góc. Chỉ dẫn NHỊP không đọc thành lời và không đưa vào bản lời sạch/ElevenLabs.
- Phản ứng phải có thông tin mới: nghe → hiểu → làm hoặc kìm lại. Không dừng 1–2 giây sau mọi câu, kéo dài một pose đứng im hoặc cho người kia chờ máy móc trước mọi câu đáp.
- Khi rút ngắn, cắt sự lặp ở gõ–xóa/chơi game/chờ phản hồi trước. Giữ các mắt xích nhận mặt → trùng giọng, đường đổi chỗ, quên chốt, tự kiểm tra tin và tự đọc bài. Không bù thời lượng bằng đọc nhanh hơn hoặc xóa phản ứng quyết định.

### Đường nhịp A–H

| Nhóm | Nhịp và chuyển cảm xúc | Điểm giữ/đọc hình | Điểm chuyển tiếp |
|---|---|---|---|
| A — Nhận mặt | Bình thường hơi ì → câu nói bị cắt → nhận ra → giật mình vì trùng cả giọng → phản xạ thoát ra | Mở đủ 5–8 giây gắn với báo thức/ngủ/người quay lưng; giữ nhịp 2 giây đã có khi Nam nhìn cửa. Sau giọng trùng, hụt hơi 0.7–1 giây rồi tìm máy/bật dậy | Từ lúc đứng dậy đến câu “Đứng đó”, động tác nối gấp hơn; người kia dừng thật. Nam còn sợ khi gọi Tùng |
| B — Gọi Tùng | Nam cần xác nhận, nói gấp; Tùng trả lời đời thường, không chia sẻ nhịp hoảng của Nam | Sau cúp máy, 1–1.5 giây nằm trong động tác giữ rồi hạ máy, mắt tìm lại người kia | Không phát lại cúp máy ở C. Cuộc gọi thất bại buộc Nam tự giành khoảng cách, không khiến cậu tin bản sao |
| C — Giành lại phòng | Câu ra lệnh ngắn; bước chậm vì phải kiểm soát khoảng cách; khép cửa/gài chốt nhanh hơn khi đường vào đã an toàn | Chờ khoảng 0.5–1 giây sau khi người kia đứng đúng chỗ rồi Nam mới vào. Giữ 2 giây đã có ở chốt, nghe có ai tiến lại không | Hạ âm sau chốt nhưng không hạ hết căng thẳng. Kéo ghế ngồi nhìn cửa kết thúc bằng một việc cụ thể |
| D — Kiểm tra và hỏi qua cửa | Bận tay kiểm đồ → đối đáp ngắn → lúng túng vì người kia làm đúng lời mình → khó chịu vì bị xâm phạm | Căn cước 2–3 giây gắn với nhìn ảnh/chạm giữ; tin chưa trả lời 1–2 giây trong lúc Nam chờ rồi tự hỏi tiếp | Trừ phản ứng khựng trước giọng và chờ tin, trả lời tự nhiên, không chèn lặng giữa mọi câu. Câu hỏi đụng đồ nối thẳng sang lời đáp về cây chổi ở E |
| E — Bí bài, tự cân nhắc | Bắt tay làm → bí dần → thoáng xấu hổ vì lời hứa hôm qua → bị lợi ích hấp dẫn → tự bác vì sợ | Tin nhóm và lời hứa cũ đọc lần lượt, khoảng 2.5–4 giây tổng khi chữ đủ lớn. Gõ–xóa/đổi tư thế/nắng dịch rút thành 8–12 giây. Sau ý nghĩ nhờ giúp, 1–1.5 giây nhìn cửa rồi tự lắc đầu | Độc thoại bám bếp, trang bài và cửa; không đọc liền như bài tự kiểm điểm. Kết ở Nam thử làm tiếp, chưa quyết định nhờ |
| F — Rút chốt rồi quên | Còn đề phòng khi ra/về; một việc nhỏ làm đứt mạch chú ý | Chốt được rút cần đọc rõ khoảng 0.8–1.2 giây trong thao tác. Chụp ảnh qua khe rồi gửi Tùng; không khóa thời lượng toàn thao tác. Khoảng đọc ảnh 1–1.5 giây chỉ là mức thử trong hành động. Lúc trở về, tay sắp gài → máy rung → tay rời chốt: một chuỗi liền; thấy chốt còn rút khoảng 1 giây trong cùng khung | Không dừng/phóng thêm để báo “đây là lỗi”. Người kia vẫn ở xa khi Nam vào; sự quên do phân tâm đã có trên hình |
| G — Game, ngủ | Tự thưởng “một tí” → lặp thêm trận → buông việc → chuyển thời gian | Không làm phiền 1–1.5 giây đủ nhận ra thao tác; 2–3 lát chơi game gộp khoảng 6–9 giây, không quay cả trận. Đặt máy, hỏi vọng ra cửa, chờ 1.5–2 giây rồi sang nệm, giữ liền để thấy vị trí đồ | Tiếng game dừng theo nguồn. Ánh sáng/tư thế cho thấy thời gian trôi; chuyển sang tối ngắn, không giữ màn đen để giả một khoảng lặng cảm xúc |
| H — Phát hiện, giận, cân nhắc lợi ích | Tỉnh chưa hiểu → nhận ra người ở bàn → quát → tự kiểm tra → giảm giận nhưng còn đề phòng → tự tâng bốc | Nhận chỗ Tùng trống/người ở bàn trong nhịp nhìn khoảng 1–2 giây rồi phản ứng. DND 1–1.5 giây, tin Tùng 3–4 giây, cuộc gọi nhỡ 1.5–2 giây; bài làm 5–7 giây để cuộn/đối chiếu. Sau lời mời giúp, 1–1.5 giây cho Nam nhìn bài rồi nhìn người | Các khoảng đọc H05/H07 thay cho thời gian hành động đọc đã có, không cộng thêm. Chỉ cười thoáng sau quá trình tự kiểm tra; kết giữ khoảng 2 giây Nam đọc tiếp, người kia chờ, tay khỏi phím |

### Nhịp thoại, khoảng lặng và âm

- **Nam buổi sáng:** nói khi còn ngái ngủ, câu bị ngắt khi thấy mặt; sau khi trùng giọng mới cuống. Khi yêu cầu khoảng cách, câu ngắn và dứt; không hét mọi câu suốt đoạn.
- **Người kia:** phản hồi khi Nam hỏi xong, giọng bình thường; dừng/đặt bát theo yêu cầu ngay. Sự bình thản khác nhịp của Nam tạo bất an. Không làm mọi câu chậm, kéo âm hoặc chèn nụ cười ma quái để sớm xác nhận phản diện.
- **Tùng:** nhịp vội của một người đang học. Cắt cuộc gọi ngay sau nỗ lực “khoan” của Nam; không để Tùng chờ vài giây như đã biết chuyện rồi chủ động bỏ mặc.
- **Nội tâm E/H:** người kia không nghe; Nam không mấp máy miệng theo suy nghĩ. Đổi hình theo tác nhân của suy nghĩ, không cắt cho từng mệnh đề. Chừa chỗ tự bào chữa hơi buồn cười ở H nhưng không thêm hiệu ứng hài xóa bất an.
- **Âm:** quạt/âm phòng giữ qua các nhịp lặng. Nước dừng đúng nguồn, tiếng bát có điểm đặt; không tắt sạch mọi âm để ép rùng rợn. Buổi tối tiếng gõ dừng khi Nam quát và chưa trở lại khi Nam bảo đừng gửi. Cuộc gọi nhỡ được đọc bằng hình, không phát tiếng chuông quá khứ.
- **Các mốc chốt hình:** A03–A04 dành chỗ cho nhận ra; C02–C05 dành chỗ cho đường đi/khóa; E03–E04 dành chỗ cho thử thật và cân nhắc; F03–F04 dành chỗ cho xao nhãng; H05–H10 dành chỗ cho bằng chứng rồi lựa chọn. Mọi cỡ cảnh, lens và chuyển động vẫn theo bảng máy bên dưới.

### Khi Claude thử animatic

Lấy các cue NHỊP ở bản nguồn và bảng này làm một bộ chỉ dẫn; không chạy hai lớp nghỉ. Dùng âm tạm/đọc thử khi được giao dựng, đánh dấu câu bị chồng hoặc màn hình chưa đọc kịp rồi chỉnh đúng đoạn. Đo riêng lời, hành động và khoảng đọc đang chồng nhau trước khi báo tổng phút. Không thêm động tác trang trí, cắt máy hoặc media trả phí chỉ để lấp một số giây dự kiến. Bản cập nhật này chưa tạo giọng, animatic hay video.

## Mặt bằng và trục nhìn theo bộ bối cảnh mới

Đã đối chiếu [bảng PNG hiện có](assets/boi-canh/boi-canh.png) và [hồ sơ bối cảnh](assets/boi-canh/BOI-CANH.md) ngày 10/11/2026 tới `09e7616`; bản đại tu ngày 10/11 sau đó nằm trong hồ sơ bối cảnh. Mặt bằng mới thay mô tả trái/phải từ nền cũ: chỉ một cửa chính ở tường trái; khối cạnh bàn là tủ quần áo, không phải cửa thứ hai. Không đổi vị trí đồ để rút đường đi cho vừa số giây.

```text
NHÌN THEO NỀN PHÒNG TRỌ HIỆN HÀNH
trái: cửa chính ra hành lang; bếp/bồn rửa sau–trái
sau–giữa: tủ quần áo đứng
sau–phải: bàn Nam, laptop/đèn và ghế làm việc
phải: cửa sổ; tiền cảnh phải là chỗ ngủ Nam
```

- **Góc toàn A:** Nam/chỗ ngủ tiền cảnh phải, bàn sau–phải, bếp sau–trái và cửa chính tường trái. Lập rõ đường Nam men từ nệm ra ngưỡng mà không đi xuyên qua người ở bếp hoặc tự sinh thêm cửa cạnh bàn.
- **Bàn ngày/đêm:** cùng một vị trí với tủ quần áo bên cạnh và cửa sổ phía phải; ánh sáng đổi nhưng đồ không đổi tường. Nệm đôi tiền cảnh phải có hai gối: Nam phía gối kem gần lối đi, Tùng phía gối xanh gần tường. Nệm đã tách khỏi bàn/ghế bằng khoảng sàn; H01 nhìn vào nửa trống của Tùng, không nhân đôi nệm tùy góc.
- **Góc toàn B ngoài hành lang:** đã có ở `hanh-lang-cua-phong.svg` (`view="hallway"`), cầu thang bên trái, cửa giữa. Lập B với Nam về phía cầu thang/lối đi, người kia ở đầu dãy đối diện; toàn cảnh xác lập lại trục trước cận. Trái/phải ngoài hành lang do góc B xác định.
- **Ghế và đường đi:** giữ một chiếc ghế làm việc theo chuỗi cạnh nệm (`bed`) → đối diện cửa (`door`) → bàn (`desk`). Không tự thêm ghế chắn cửa. Bản đại tu dùng chung một mẫu ghế bốn chân, không bánh ở cả ngày/đêm; diễn kéo, không diễn lăn. Sau dời nệm cần kiểm tra lại ghế tại cú va A05, giữ chân ghế ngoài nệm và đường ra cửa thông thoáng. Cú va cạnh nệm cần đặt ghế trong đường đi đã lập. Kết thúc nhịp khi người/ghế đã tới vị trí, không cắt mất đường đi để ép thời gian.
- **Chốt và cửa:** có lớp trạng thái riêng: đầu sáng hé/mở; Nam vào khóa thì chốt gài; đi vệ sinh thì Nam rút chốt; về khép cửa nhưng quên gài nên chốt còn rút. Nền tối hiện có chữ/miêu tả cửa gài không được dùng nguyên trạng để phủ nhận cách người kia vào. Giữ hướng bản lề của thiết kế, kiểm tra vùng quét cánh cửa với bàn/ghế.
- **Điện thoại/căn cước:** lúc đối đáp Nam giữ điện thoại tay phải, tay trái kiểm giấy trên mặt bàn. Khi bắt đầu làm laptop, đặt điện thoại trong tầm với trước khi dùng hai tay; sau game mới đặt nó cạnh laptop rồi sang giường. Buổi tối Nam tự nhặt và mở tin; người kia không cầm hộ.
- Áo người kia đang mặc không trở lại trên ghế hoặc giường. Mặt, tóc, dáng của Nam và người kia giống hệt. Suốt phần A–H, Nam mặc áo ngủ xám, người kia mặc áo xanh rêu của Nam, để câu “áo đó của tao” có nghĩa; vẫn dựa thêm vào vị trí và diễn xuất.
- Lối đi vệ sinh ở ngoài khung phía Nam rời đi, người kia đứng phía đối diện. Không cần nền WC hoặc lớp học/sân thể thao của Tùng; Tùng ở phần này chỉ có giọng gọi và tin nhắn theo nguồn.

## Đường cảm xúc của máy

Đầu cảnh giữ nhịp sinh hoạt, thông tin ở sâu trong hình; cú nhận mặt chuyển sang phản ứng Nam rồi mới nhìn kỹ người kia. Ra cửa, khoảng cách và vật cản chiếm bố cục. Khi Nam làm bài, giữ khung để thấy sự trì hoãn; montage nắng/tư thế chỉ rút gọn thời gian. Buổi tối dùng lại các mốc căn phòng và vị trí bàn để người xem nhận ra người kia đã chiếm chỗ Nam. Cuối đoạn máy mới tiến gần hơn khi Nam tự thấy có lợi.

Hai điểm nhấn: **cận phản ứng trước cú lộ mặt**, và **khung bàn làm việc ban ngày được nhắc lại khi người kia ngồi vào buổi tối**. Giữ máy yên ở các đoạn giữa để diễn xuất có trọng lượng. Chưa dùng góc quái vật, mắt đỏ hoặc ánh sáng xác nhận nguồn gốc người kia.

## Quay layer

**Bổ sung ngày 10/11/2026:** dùng nhiều lớp để thấy thay đổi gần–xa và che/lộ khi máy đi, không chỉ phóng cả một bức tranh. Phần này là chỉ đạo tách và quay lớp cho bảng máy A–H, **chưa phải các SVG đã được tách xong hoặc chuyển động đã chạy thử**.

### Những lớp cần chuẩn bị

| Nhóm | Nội dung của Hồ sơ 2 | Đi theo gì / che gì |
|---|---|---|
| XA | Phố ngoài cửa sổ, phần cuối hành lang | Nằm sau cửa sổ/ô cửa và bị cắt đúng khẩu độ cửa; mask bám khung cửa, không bám lớp phố đang dịch. Không đặt phố phủ lên khung cửa hoặc người trong phòng. |
| PHÒNG | Khối tường, sàn, trần và vùng sáng nền | Giữ phối cảnh, đường chân tường và điểm tiếp đất liên tục. Không cho sàn chạy một nhịp còn chân bàn/chân người chạy một nhịp khác. |
| ĐỒ-CỐ-ĐỊNH | Chỗ ngủ đã lập, bếp, bàn, tủ quần áo, khung cửa | Có thể tách nhóm theo độ sâu và mặt trước/sau; những phần cùng một khối giữ liên kết. Đèn và laptop đặt trên bàn đi cùng hệ bàn, không tự lướt trên mặt bàn khi máy dịch. |
| NGƯỜI/VẬT | Nam, Người Kia, ghế di chuyển, bát, điện thoại, căn cước | Mỗi người/vật có độ sâu riêng theo vị trí, không gom cả hai người vào một mặt phẳng bắt buộc. Vật đang cầm bám tay; bóng tiếp xúc/điểm tì theo người hoặc vật có quan hệ tương ứng. |
| CHE-GẦN | Mép nệm, mép bàn, mặt trước bồn rửa, khung/cánh cửa, vai người gần | Tạo che khuất có lý do. Vật dùng làm tiền cảnh phải thật sự nằm gần máy của shot ấy; không kéo một mép bàn ở xa lên trước mặt Nam chỉ để có parallax. |
| SÁNG/FX | Vệt nắng, vùng sáng đèn bàn, ánh laptop; bụi nếu dùng | Ánh trên mặt người bám người, vệt trên sàn bám sàn, vùng phát sáng bám nguồn. Không trượt mọi ánh sáng cùng một tốc độ tùy ý hoặc dùng hạt chuyển động thay diễn xuất. |
| CHỮ | Tin nhắn, tài liệu, biểu tượng Không làm phiền; phụ đề nếu có | Chữ trong truyện bám mặt màn hình/thẻ và clip theo vật. Phụ đề ngoài truyện là lớp xuất riêng. Hai loại này không dùng chung cách giữ cố định theo khung hình. |

Đây là **vai trò lớp**, không phải bảy tấm luôn xếp cố định cho mọi góc. Ví dụ thân người sau bàn thuộc NGƯỜI nhưng mặt bàn CHE-GẦN che chân; tay đặt lên bàn cần hiện trước mặt bàn. Sắp thứ tự hoặc mask theo vị trí thực và động tác, không sửa bằng cách cho toàn bộ người nổi lên trước mọi đồ.

### Sáu chế độ máy quay điện ảnh (Cine Camera Modes)

| Mã | Tên chế độ | Ứng dụng & Ý đồ điện ảnh | Kỹ thuật chuyển động & Thông số kiểm tra |
|---|---|---|---|
| **P0** | **Handheld Organic Breathing**<br>(Rung thở cầm tay) | Mặc định cho mọi cảnh hội thoại và diễn xuất thay cho máy tĩnh chết. | Máy quay vác vai mô phỏng DOP cầm máy thật: Dao động hữu cơ tần số $0.2\text{Hz}$, biên độ vi mô $0.3 - 0.8\text{px}$. Giữ nhân vật sống động mà không gây chóng mặt. Khi có va chạm hoặc hoảng loạn, biên độ giật tăng lên $2.0 - 3.5\text{px}$ rồi tắt nhanh trong $0.2\text{s}$. |
| **P1** | **Parallax Lateral Track**<br>(Dịch ngang tách lớp) | C02, E02, P2.01, P3.02; lia máy theo chuyển động nhân vật. | Máy dịch ngang với độ trễ (damping) hữu cơ: Lớp tiền cảnh (mép cửa, vai) dịch nhanh ($-30\text{px}$), lớp nhân vật dịch vừa ($-18\text{px}$), hậu cảnh dịch chậm ($-6\text{px}$). Tạo chiều sâu không gian quang học chân thực. |
| **P2** | **Slow Creeping Push-In**<br>(Dolly tiến chậm) | H09, P2.03, P2.06, P3.01, P3.04; thắt chặt không gian tâm lý. | Máy quay trườn từ từ vào gương mặt nhân vật với vận tốc $1.0 - 1.5\text{px/s}$. Tiêu cự giữ nguyên hoặc khẽ siết DoF. Bắt buộc lớp gần nở tương quan với lớp xa, tạo cảm giác nghẹt thở khi Nam đối mặt với sự thật hoặc lòng tham trỗi dậy. |
| **P3** | **Macro Insert & UI Tracking**<br>(Cận màn hình / Thẻ) | D01, D03, E01, E03, G02, H05, H07, P2.06, P3.03. | Ống kính Macro 85mm f/1.4: Chữ, vết nứt, nốt ruồi và UI hiển thị sắc nét. Chữ gắn chặt vào bề mặt thiết bị (planar tracking), nghiêng theo góc xoay của tay cầm. Hiệu ứng quét sáng màn hình điện thoại (Screen Glow) phản chiếu lên mắt nhân vật. |
| **P4** | **Dutch Angle & Power Tilt**<br>(Góc nghiêng tâm lý & Góc thấp/cao) | A04, H03, P2.03, P3.01, P3.04; bẻ cong thực tại & quyền lực. | Trục chân trời nghiêng lệch $5^\circ - 15^\circ$ biểu thị sự bất an hoặc tâm lý đảo điên. Kết hợp **Low-Angle** (hếch từ dưới lên Người Kia để tôn vị thế áp đảo) và **High-Angle / Top-Down** (nhìn từ trên trần xuống dìm Nam vào cảm giác bị giam cầm như côn trùng mắc kẹt). |
| **P5** | **Vertigo Dolly Zoom & Water Ripple**<br>(Quang học dị thường & Kính hóa nước) | P3.03, P3.04, P3.05, Trailer. | • **Hitchcock Vertigo Zoom:** Zoom in tiêu cự từ 35mm lên 85mm đồng thời Dolly lùi máy quay, giữ nguyên kích thước Nam nhưng hút sâu hậu cảnh phòng trọ.<br>• **Water Refraction Shader:** Khi mặt gương hóa nước, shader khúc xạ ánh sáng (Chromatic Aberration xanh/đỏ) và gợn sóng lỏng nuốt trọn nhân vật. |

### Áp vào từng nhóm góc máy

| Nhóm/mã | Tiền cảnh → hành động → hậu cảnh | Cách chạy và điều phải đọc được |
|---|---|---|
| A01–A05 — Phòng sáng | Mép nệm/đồ gần nếu đúng góc → Nam và người ở bếp → tường, bàn, cửa sổ và phố | P0. Quay mặt bằng pose/góc vẽ thích hợp, không xoay một tấm người như cánh cửa. A03 giữ phản ứng Nam trước A04 lộ mặt; không kéo lớp che tự chạy để tiết lộ sớm. Ở bếp, thân dưới có thể bị mặt trước bồn che; tay cầm bát hiện trước mép bồn khi hành động cần. |
| B01–B03 — Cuộc gọi | Khung cửa/vai Nam → Nam và điện thoại → phòng/người kia | P0; cửa tạo ranh giới thật, không đè lên tay đang giữ cánh cửa sai phía. Điện thoại bám tay phải. Tùng chỉ là giọng qua máy, không phát sinh một lớp nhân vật đứng trong phòng hoặc cảnh lớp học mới. |
| C01–C06 — Đổi chỗ | Khuôn/cánh cửa → hai người và đường đi → hành lang, cầu thang | C02 mới dùng P1; các shot còn lại P0. Người chỉ bị mép cửa che khi đã đi đúng phía sau mép đó. Bản lề là điểm quay của cánh cửa, không phải mép khung hình. C05 tách rõ ổ, lưỡi chốt và bàn tay để thấy gài thật. |
| D01–D05 — Kiểm tra đồ | Mép ngăn kéo/bàn → tay, ví, căn cước, điện thoại → Nam/cửa | P0, các cận đọc theo P3. Đồ trong ngăn bị mặt ngăn che tới khi kéo ra; căn cước đã vào tay thì theo tay, không còn một bản thứ hai trong ngăn hoặc dính trên bàn. D03 chuyển điểm nét trên cùng bố cục, không đẩy hai lớp ảnh thẻ/mặt chạy thành hai hướng. |
| E01–E04 — Bí bài | Cạnh bàn → Nam, ghế làm việc, laptop → cửa/tường và các mốc phòng | E02 dùng P1 theo ghế, còn lại P0/P3 cho chữ. Bánh/chân ghế bám sàn khi di chuyển có chủ ý; máy dịch không khiến chân ghế trượt riêng. Cạnh bàn có thể che đùi Nam, nhưng tay gõ nằm đúng phía trước mặt phím. Không dùng lớp che để xóa hành động kéo ghế từ cửa về bàn. |
| F01–F04 — Quên chốt | Mép cửa → tay trái/chốt, tay phải/điện thoại → khe cửa/hành lang | P0. F04 phải giữ được cả tín hiệu điện thoại và lưỡi chốt còn rút; không cho blur/ánh sáng che mất bằng chứng. Phần hành lang lộ qua cửa dùng mask theo độ mở thật; không trượt cảnh ngoài xuyên qua cánh cửa đã đóng. |
| G01–G04 — Game, ngủ | Bàn/đồ gần → Nam và điện thoại, laptop → nệm/tường, vệt nắng | P0, G02 dùng P3. Điện thoại theo tay lúc chơi; sau đặt xuống, đổi sang hệ bàn đúng thời điểm nhả. Nam rời bàn không kéo điện thoại theo. Ánh nắng đổi theo thời gian trên cùng mặt sàn/tường, không tạo một camera trôi chỉ để giả thời gian. |
| H01–H10 — Buổi tối | Cạnh bàn/màn hình gần → Nam đứng, người kia ngồi, tay gõ/lấy điện thoại → phòng tối, nệm/cửa | P0; H09 tùy chọn P2, H05/H07 dùng P3. Mặt trước bàn che thân dưới người ngồi; tay gõ ở trên phím. Ghế có phần trước/sau phù hợp cơ thể, không phủ cả lưng ghế lên ngực. H04 phải thấy tay chạm rồi nhấc điện thoại; H10 bàn phím và tay chờ vẫn rõ. |

### Ba tương tác phải tách đúng

**Bồn rửa:** tường/bếp sau → phần thân người ở sau bồn → mặt trước tủ/bồn che thân dưới → tay/bát và mép bồn theo vị trí tiếp xúc. Tay vẫn thuộc rig người, có thể chia pass/mask để đi trước–sau vật; không thành hai cánh tay độc lập chạy parallax khác thân. Khi đặt bát: bát theo tay tới khi chạm giá/mặt đỡ, rồi mới chuyển sang hệ bếp; tránh một bát trong tay và một bát đã nằm dưới cùng lúc.

**Cửa và chốt:** hành lang sau → người ở đúng phía → khuôn/cánh cửa gần; tay giữ mép cửa nằm theo phía tay tiếp xúc. Lớp cánh cửa có góc mở và điểm bản lề riêng, lớp chốt có trạng thái gài/rút, người qua ngưỡng có thứ tự che đổi theo đường đi. Chỉ di chuyển camera không được đổi trạng thái khóa. Khi cần góc ngược từ ngoài hành lang, chuẩn bị góc hình tương ứng; tách layer không tự sinh mặt sau của đồ.

**Bàn/laptop/điện thoại:** nền phòng → lưng ghế/phần thân phía sau bàn → mặt trước bàn che phần dưới → phần tay, bàn phím và đồ trên mặt theo điểm chạm. Laptop có thân, màn và lớp chữ cùng một hệ mặt bàn; biểu tượng/tin nhắn đi cùng màn. Điện thoại đổi từ mặt bàn sang tay Nam **sau khi** tay chạm/nhấc; bóng đặt bàn giảm hoặc rời theo khoảng nâng. Giữ gốc người, bàn và ghế nhất quán, không chạy tốc độ lớp chỉ theo tên “người”/“đồ”.

### Mức sẵn sàng và kiểm tra

- Nền hiện là một mô hình 3D trong `boi-canh.tsx`: đồ đạc xếp lớp theo khoảng cách tới máy, nên không cần tách tay từng lớp cho các cú dịch máy nhỏ.
- `RoomScene` có `view`, `move` (dịch máy cho C02, E02, H09), `actors` và các trạng thái cửa, chốt, ghế, bếp, nắng; xem [BOI-CANH.md](assets/boi-canh/BOI-CANH.md). Tay che/lộ theo mặt bàn, mép bồn và người qua ngưỡng cửa vẫn cần chia lớp theo shot.
- Chỉ tách lớp và vẽ bù vùng bị khuất cho các shot cần P1/P2 hoặc tương tác che/lộ. Phần nền mới lộ phải có hình đủ tới vị trí máy cực hạn cộng vùng blur; kiểm tra đầu–giữa–cuối để không hở nền. Nếu chưa đủ, dùng phương án P0 của shot trước khi mở rộng chuyển động.
- Kiểm tra ở tốc độ thường: chân/bánh ghế có điểm tì, bóng không trôi, tay và vật cùng đi, cửa che đúng người, chữ bám mặt thiết bị. Mặt và tay quan trọng phải đọc được ở cỡ điện thoại. Chưa xem animatic nên chưa kết luận chuyển động đã đạt hoặc hứa một mức tiết kiệm quota.

## Bảng góc máy theo đoạn

Các nhóm A–H là nhóm máy của phần hiện có, không phải viết thêm Cảnh 3–8 trong khung truyện tương lai. Chi tiết bên dưới được biên tập cùng GPT-6.1 Sol.

### MAY-A — Nhận mặt & Cú sốc trùng giọng

**Quay lớp & Hiệu ứng:** P0 Handheld Breathing ($0.4\text{px}$ nhịp thở hữu cơ), P4 Dutch Angle nhẹ khi nhận ra giọng; tách thân/tay và mặt trước bồn. Xem [CHECKLIST-TIEN-KY-ASSET.md](CHECKLIST-TIEN-KY-ASSET.md).

| Mã | Cỡ / Góc / Lens điện ảnh | Máy, Rung, Focus & Hiệu ứng | Diễn xuất, Điểm cắt và Âm thanh điện ảnh |
|---|---|---|---|
| A01 | Toàn phòng góc A (`VIEWS.wide`), 35mm Cine Anamorphic 2.39:1 | P0 Handheld Breathing nhẹ ($0.4\text{px}$, nhịp $0.2\text{Hz}$); DoF sâu toàn cảnh | Nam ngủ trên nệm phải, bóng Người Kia quay lưng ở bồn rửa sau–trái. Tiếng báo thức reo chói tai, tiếng nước chảy và tiếng bát sứ cọ rửa vang vọng trong không gian tĩnh mịch. Khung 5–8s. |
| A02 | Cận bàn tay tắt báo thức & nửa mặt Nam, 65mm Cine Macro, DoF mỏng f/2.0 | P3 Macro Insert; nét trượt từ ngón tay ấn tắt màn hình $\to$ mí mắt Nam đang nhắm nghiền | Nam thò tay tắt báo thức rồi kéo chăn trùm đầu ngái ngủ. Tiếng cọ bát sứ vẫn tiếp diễn đều đặn dẫn dắt sự chú ý. |
| A02B | Trung rộng nệm ngủ & lối đi, 40mm Cine Prime | P0 Handheld Breathing; nét giữ trên Nam, hậu cảnh bếp mờ nhẹ | Nam càu nhàu, lật chăn, chống tay ngồi dậy, dịch hông xoay ra mép nệm xỏ dép lê. Âm vải xột xoạt bám trọng lượng cơ thể. |
| A03 | Trung cận Nam ba phần tư, 50mm f/1.4 Cine Prime | P2 Slow Push-in nhẹ ($1.0\text{px/s}$) vào mắt Nam khi câu nói bị nghẹn ứ | Nam tưởng là Tùng càu nhàu: *"Ê, áo đó..."*. Khi Người Kia bắt đầu quay đầu lại, máy đẩy chậm vào đồng tử Nam giãn to kinh ngạc. |
| A04 | Cận mặt Người Kia ngoảnh lại, 65mm Cine Prime, ngang tầm mắt | P4 Dutch Angle lệch nhẹ $5^\circ$ sang phải (thực tại rạn nứt); DoF f/1.8 xóa mờ bếp | Khán giả và Nam cùng đối diện gương mặt giống hệt Nam nhưng nốt ruồi nằm ở đuôi mày BÊN PHẢI. Ánh mắt Người Kia trong veo, không chớp, nụ cười nhẹ lịch thiệp. |
| A04B | Lặp bố cục A03 trên Nam, 50mm Prime | P0 Handheld; nét mắt Nam | Nam dụi mắt, nhìn trân trân không tin vào mắt mình. Khoảng lặng 2s nghẹt thở không tiếng động, chỉ có tiếng quạt trần quay chậm rì rì. |
| A05 | Trung rộng Nam tại nệm & ghế cạnh đó, 35mm Anamorphic | P4 Low-Angle hếch nhẹ kết hợp P0 Handheld; khi đầu gối va ghế va chạm rung giật $3.2\text{px}$ tắt nhanh trong $0.15\text{s}$ | Nam lắp bắp sờ mặt, nghe Người Kia cất tiếng trùng khớp 100% tần số giọng mình thì hoảng loạn giật lùi, gối đập mạnh vào cạnh ghế gỗ kêu *"CỘP"*, vơ vội điện thoại tháo chạy ra cửa. |

### MAY-B — Cố thủ ngưỡng cửa & Cuộc gọi cho Tùng

**Quay lớp & Hiệu ứng:** P0 Handheld, OTS (Over-The-Shoulder qua khung cửa), âm thanh điện thoại lọc tần số hẹp (Telephone EQ Filter).

| Mã | Cỡ / Góc / Lens điện ảnh | Máy, Rung, Focus & Hiệu ứng | Diễn xuất, Điểm cắt và Âm thanh điện ảnh |
|---|---|---|---|
| B01 | Trung rộng nhìn chéo qua cửa, 35mm Cine Prime | P0 Handheld; khung cửa làm tiền cảnh che nhẹ mép trái | Nam lùi sát mép cửa quát: *"Mày là ai?! Đứng yên đó!"*. Người Kia dừng tay, đặt bát sứ chạm đáy giá bồn rửa kêu *"LÁCH CÁCH"* rồi giơ hai bàn tay trống ngang bụng tuân thủ. |
| B02 | Trung cận Nam ở ngưỡng cửa, 50mm f/1.4 Prime | P0 Handheld nhịp thở gấp gáp; nét dán chặt vào mắt và tay cầm máy run rẩy | Nam bấm gọi Tùng, mắt không rời Người Kia. Giọng Tùng càu nhàu qua loa thoại: *"Gì đấy con zời? Đang trên giảng đường..."*. |
| B03 | Cận mặt Nam, 65mm Cine Prime | P2 Creeping Push-in nhẹ; hậu cảnh phòng tối sâu Chiaroscuro | Tùng gạt phắt: *"Mày ngủ mơ à? Thằng song sinh cái đầu mày!"* rồi cúp máy *"TÚT TÚT"*. Nam hạ điện thoại, siết chặt nắm tay, đồng tử co giật vì tuyệt vọng. |

### MAY-C — Đổi chỗ hành lang & Gài chốt then sắt

**Quay lớp & Hiệu ứng:** C02 dùng P1 Parallax Lateral Track, C05 Macro P3 đặc tả then cài; âm thanh kim loại đanh chắc.

| Mã | Cỡ / Góc / Lens điện ảnh | Máy, Rung, Focus & Hiệu ứng | Diễn xuất, Điểm cắt và Âm thanh điện ảnh |
|---|---|---|---|
| C01 | Toàn hành lang dãy trọ tầng 2, 28mm Anamorphic | P0 Handheld vác vai; ánh đèn tuýp vàng vọt nhấp nháy mờ ảo | Tái lập không gian: Cửa phòng Nam ở giữa, lan can sắt rỉ bên phải, cầu thang bên trái. Người Kia từ trong phòng bước ra ngoài hành lang. |
| C02 | Trung rộng ngang tầm ngực dọc hành lang, 40mm Cine | P1 Parallax Lateral Track (tiền cảnh mép cửa trượt $-30\text{px}$, Nam $-18\text{px}$, tường $-6\text{px}$) | Nam né người dán lưng vào tường hoa tiêu, quát Người Kia đứng lùi xa ra đầu dãy trọ. Người Kia ngoan ngoãn đi đến điểm chỉ định rồi đứng im. |
| C03 | Toàn hành lang như C01, 28mm | P0 Handheld; giữ rõ cả hai nhân vật ở hai đầu khung hình | Nam nhanh như cắt lách người qua ngưỡng cửa thụt vào trong phòng. |
| C04 | Trung Nam phía trong nhìn về cửa, 50mm Prime | P0 Handheld; cánh cửa dập sầm lại che kín khung hình | Nam giật mạnh cánh cửa gỗ khép sầm. Tiếng gió hành lang bị ngắt hoàn toàn, âm thanh phòng kín nghẹt thở. |
| C05 | Đặc tả then sắt cài cửa, 85mm Macro Lens | P3 Macro Insert; lưỡi then sắt trượt sâu vào ổ đón | Bàn tay Nam gạt thanh then sắt, tiếng kim loại kêu lên một tiếng đanh gọn: *"CẠCH"*. Bằng chứng xác nhận cửa ĐÃ KHÓA CHẶT BÊN TRONG. |
| C06 | Trung Nam ngồi ghế đối diện cửa, 50mm Prime | P0 Handheld nhịp thở chậm dần; cửa đóng chiếm $1/3$ khung hình | Nam kéo chiếc ghế gỗ 4 chân ra ngồi đối diện cánh cửa canh chừng. Tiếng Người Kia từ ngoài vọng vào qua khe thông gió: *"Tao đứng đây rồi"*. Nam quát: *"Câm mồm!"*. |

### MAY-D — Đối chiếu căn cước & Tra khảo qua cửa

**Quay lớp & Hiệu ứng:** P3 Macro Insert tài liệu & màn hình; Rack Focus chuyển nét.

| Mã | Cỡ / Góc / Lens điện ảnh | Máy, Rung, Focus & Hiệu ứng | Diễn xuất, Điểm cắt và Âm thanh điện ảnh |
|---|---|---|---|
| D01 | Cận màn hình điện thoại, 85mm Macro | P3 Macro; chữ tin nhắn gửi Tùng rõ nét | Nam nhắn tin giục Tùng về phòng gấp. Màn hình báo "Đã nhận", chưa có phản hồi. |
| D02 | Cận vừa mặt bàn & ngăn kéo tủ, 65mm Prime | P0 Handheld; góc chéo nhìn xuống bàn | Nam kéo ngăn kéo bàn học, lôi ví tiền và rút tấm thẻ Căn cước công dân ra soi. Tiếng gỗ ngăn kéo kẽo kẹt. |
| D03 | Cận mặt Nam & Thẻ căn cước ngang cằm, 65mm f/1.4 | Rack Focus Pull mượt mà: Nét từ ảnh thẻ CCCD (nốt ruồi bên trái) $\to$ Đôi mắt Nam đang nhìn trân trân | Nam đối chiếu khuôn mặt mình trên thẻ với bóng hình Người Kia vừa gặp. Cậu rùng mình nhận ra sự trùng khớp kỳ dị. |
| D04 | Trung Nam ngồi ghế đối diện cửa, 50mm Prime | P0 Handheld; ánh sáng cửa sổ rọi xiên | Nam gặng hỏi qua cửa: *"Sao mày có chìa khóa? Sao mặc áo của tao?"*. Cửa vẫn đóng im lìm. |
| D05 | Trung Người Kia ngoài hành lang, 50mm Prime | P0 Handheld; Người Kia đứng tựa lan can ngược sáng điềm tĩnh | Người Kia trả lời mạch lạc về việc áo vắt trên ghế, chổi dựng góc cửa. Sự bình thản của nó khiến Nam càng thêm hoang mang. |

### MAY-E — Bí bài tập lớn & Toan tính vụ lợi

**Quay lớp & Hiệu ứng:** P1 dịch chuyển ngang theo ghế, P2 Slow Push-in vào mắt Nam; ánh nắng dịch chuyển theo thời gian.

| Mã | Cỡ / Góc / Lens điện ảnh | Máy, Rung, Focus & Hiệu ứng | Diễn xuất, Điểm cắt và Âm thanh điện ảnh |
|---|---|---|---|
| E01 | Cận điện thoại rung bần bật trên bàn, 85mm Macro | P3 Macro; tin nhắn nhóm Zalo đòi bài tập lớn | Chuông Zalo réo giục hạn nộp bài 17h chiều nay. Nam vò đầu bứt tai. |
| E01B | Toàn phòng góc A, 35mm Cine Anamorphic | P0 Handheld; góc máy rộng bao quát căn phòng | Nam đứng dậy kéo ghế từ cửa về bàn học. Tiếng chân ghế bốn chân miết trên sàn gạch men *"két"*. |
| E02 | Trung rộng bàn học cạnh tủ quần áo, 35mm Cine | P1 Parallax Track theo Nam ngồi xuống mở laptop Asus/Dell cắm sạc | Nam ngồi vào bàn, cắm sạc laptop. Xác lập vị trí các đồ vật: Cốc nước đá tan chảy, chồng sách vở lộn xộn. |
| E03 | Cận màn hình Word bài tập lớn, 65mm Cine Prime | P3 Macro; con trỏ chuột nhấp nháy trên trang giấy trắng trơn | Nam gõ vài chữ $\to$ khựng lại $\to$ nhấn Backspace xóa sạch. Áp lực bài vở đè nặng, thời gian trôi qua vệt nắng dịch dần từ bàn sang sàn. |
| E04 | Trung cận Nam ba phần tư, 65mm f/1.4 Cine Prime | P2 Slow Push-in ($1.2\text{px/s}$) vào khóe mắt Nam đang liếc nhìn về phía cánh cửa | Nội tâm Nam trỗi dậy: *"Nếu nó thông minh giống mình... hay là nhờ nó làm hộ?"*. Nhưng rồi cậu lập tức lắc đầu tự bác bỏ vì xấu hổ và sợ hãi. |

### MAY-F — Rút then đi vệ sinh & Sai lầm chí mạng

**Quay lớp & Hiệu ứng:** P0 Handheld; F04 giữ nét đồng thời then cửa rút và điện thoại rung; âm thanh then cài không phát ra.

| Mã | Cỡ / Góc / Lens điện ảnh | Máy, Rung, Focus & Hiệu ứng | Diễn xuất, Điểm cắt và Âm thanh điện ảnh |
|---|---|---|---|
| F01 | Trung cận cửa phòng & bàn tay Nam, 65mm Prime | P0 Handheld; tay trái rút then sắt kêu *"CẠCH"* | Nam mở chốt, hé mắt nhìn qua khe cửa: Người Kia vẫn đứng yên ở đầu dãy trọ. Nam giơ điện thoại chụp một tấm ảnh mờ ngược sáng gửi Tùng làm bằng chứng. |
| F02 | Toàn hành lang dãy trọ, 28mm Anamorphic | P0 Handheld bao quát hành lang | Nam chỉ tay ra lệnh Người Kia đứng yên, rồi cậu rảo bước đi vệ sinh ở cuối hành lang đối diện. |
| F03 | Toàn hành lang khi Nam trở về, 28mm | P0 Handheld; ánh nắng chiều đã ngả vàng cam | Nam quay về phòng, Người Kia vẫn đứng nguyên chỗ cũ. Nam bước vào trong phòng khép cửa lại. |
| F04 | Cận mép cửa, tay trái Nam trên then sắt & tay phải cầm máy, 65mm | P0 Handheld; Giữ nét đồng thời lưỡi then sắt và màn hình điện thoại rung bần bật | **Sai lầm cốt lõi:** Tay Nam vừa chạm vào then định gài thì điện thoại rung chuông tin nhắn mới. Nam phân tâm chuyển sang bấm điện thoại, buông tay khỏi then sắt. **LƯỠI THEN SẮT VẪN RÚT HOÀN TOÀN TRÊN KHUNG CỬA.** Cửa khép hờ nhưng KHÔNG HỀ ĐƯỢC KHÓA. |

### MAY-G — Cày game buông thả & Chiều tà buông xuống

**Quay lớp & Hiệu ứng:** P4 Top-Down Claustrophobic View, P3 Macro bật DND; vệt nắng Golden Hour rút dần sang tối.

| Mã | Cỡ / Góc / Lens điện ảnh | Máy, Rung, Focus & Hiệu ứng | Diễn xuất, Điểm cắt và Âm thanh điện ảnh |
|---|---|---|---|
| G01 | Trung Nam ngồi ở bàn học, 50mm Cine Prime | P0 Handheld; tài liệu Word dang dở trên màn hình laptop | Nam tự nhủ *"nghỉ tí cày một trận game đã"*. Cậu ngả lưng cầm điện thoại xoay ngang. Tiếng game chiến thuật nổ giòn giã. |
| G02 | Cận màn hình điện thoại, 85mm Macro | P3 Macro Insert; ngón tay Nam gạt bật icon vầng trăng khuyết tím | Nam bật chế độ **Không làm phiền (Do Not Disturb)** để chặn mọi tin nhắn giục bài của nhóm. |
| G03 | Lặp trung G01 qua 3 lát cắt thời gian (Jump Cuts) | P0 Handheld ổn định; vệt nắng cam dịch chuyển từ mặt bàn xuống sàn rồi tắt hẳn | Nam miệt mài chơi hết trận này sang trận khác. Ánh hoàng hôn tắt dần, căn phòng chìm vào bóng tối nhờ nhợ. |
| G04 | Toàn phòng góc A, 35mm Cine Anamorphic | P0 Handheld bao quát căn phòng lúc chập tối | Nam ném điện thoại cạnh laptop, nhìn ra cửa hỏi vọng: *"Còn đó không?"*. Không có tiếng đáp. Nam ngáp dài sang nệm nằm ngủ thiếp đi. |

### MAY-H — Tỉnh giấc ban đêm & Bản hợp đồng ma quỷ

**Quay lớp & Hiệu ứng:** Ánh sáng Chiaroscuro David Fincher (Đèn bàn vàng ấm 3200K + Màn hình laptop xanh lạnh 6500K); P2 Slow Push-in; DoF nông f/1.4.

| Mã | Cỡ / Góc / Lens điện ảnh | Máy, Rung, Focus & Hiệu ứng | Diễn xuất, Điểm cắt và Âm thanh điện ảnh |
|---|---|---|---|
| H01 | Trung cận Nam trên nệm ngủ, 50mm f/1.4 Prime | P0 Handheld; ánh đèn bàn rọi xiên cắt nửa khuôn mặt Nam | Tiếng gõ bàn phím lách cách ròn rã đánh thức Nam dậy. Cậu mở mắt nhìn sang nửa nệm của Tùng vẫn trống không. Đồng hồ góc phòng chỉ 19h30. |
| H02 | Toàn phòng góc A đêm tối, 35mm Anamorphic | P0 Handheld; Nguồn sáng duy nhất từ bàn học rọi bóng đen dài lên tường | **Cú sốc thị giác:** Căn phòng tối om, Người Kia đang ngồi ngay ngắn trên chiếc ghế của Nam, hai tay gõ phím thoăn thoắt trước laptop. |
| H03 | Trung đôi chéo góc $45^\circ$, 40mm Cine Prime | P4 Dutch Angle nhẹ $7^\circ$ biểu thị sự hoảng hốt | Nam bật dậy quát: *"Mày vào đây bằng cách nào?!"*. Người Kia dừng gõ, điềm tĩnh đáp: *"Cửa mày không chốt"*. Người Kia lùi ghế lại 40cm, đặt hai bàn tay úp ngay ngắn lên đùi. |
| H04 | Cận mặt bàn học & tay Nam với lấy máy, 65mm Prime | P0 Handheld; DoF mỏng f/1.8 | Nam tiến lại gần bàn, với lấy điện thoại kiểm tra trong sự đề phòng cao độ. |
| H05 | Cận màn hình điện thoại, 85mm Macro | P3 Macro; mở danh sách cuộc gọi nhỡ và tin nhắn Tùng | Hàng loạt cuộc gọi nhỡ của Tùng và nhóm lớp hiện lên. Tin nhắn Tùng: *"Thằng trong ảnh mờ quá, tao nhìn không rõ..."*. |
| H06 | Cận mặt Nam bên bàn học, 65mm f/1.4 Prime | P2 Slow Push-in chậm rãi ($1.0\text{px/s}$) | Ánh mắt Nam chuyển từ tức giận sang hoang mang rồi tò mò liếc nhìn sang màn hình laptop. |
| H07 | Cận màn hình laptop bài tập lớn, 65mm Cine Macro | P3 Macro; tay trái Nam cuộn trackpad xem văn bản | **Bằng chứng năng lực:** File Word đã được viết trọn vẹn 10 trang, lập luận sắc bén, biểu đồ hoàn hảo vượt xa khả năng của Nam. |
| H08 | Trung Người Kia ngồi ghế lùi lại, 50mm Prime | P0 Handheld; ánh đèn bàn vàng ấm bao phủ khuôn mặt điềm đạm | Người Kia cất giọng trầm ấm, mời mọc: *"Mày mệt rồi. Cứ để tao làm hộ cho, mày không phải thức khuya nữa"*. |
| H09 | Cận mặt Nam, 65mm f/1.4 Cine Prime | P2 Slow Push-in sát khóe mắt $\to$ Nụ cười nhếch mép tự luyến | Cảm xúc Nam chuyển biến: Tự ái bị thói lười biếng đánh bại. Cậu tự tâng bốc: *"Thằng này giống mình nên mới giỏi thế..."*. Nam khẽ cười thỏa mãn. |
| H10 | Trung đôi bàn học đêm, 40mm Cine Anamorphic | P0 Handheld; bố cục chiều sâu chia đôi hai nhân vật | Nam nói: *"Để tao đọc lại đã, cấm mày bấm gửi"*. Người Kia khẽ gật đầu, tay giữ ngoài bàn phím. Âm quạt trần và ánh đèn bàn vàng ấm khép lại Phần 1. |

---

### MAY-P2 — Bảng máy điện ảnh Phần 2: Quen được làm thay (~6:25)

**Chủ đề hình ảnh:** Từ hài hước sinh viên, lười biếng buông thả $\to$ Xâm lấn hiện sinh ngột ngạt. Bổ sung các góc máy độc đáo: Top-Down Claustrophobic, Mirror OTS, Rack Focus kép.

| Mã cảnh & Shot | Cỡ / Góc / Lens điện ảnh | Chế độ máy & Hiệu ứng điện ảnh | Diễn xuất, Chi tiết bối cảnh & Âm thanh |
|---|---|---|---|
| **P2.01_01**<br>Nộp bài | Cận mặt bàn laptop & ngón tay Nam, 65mm Macro | P3 Macro Insert; DoF f/1.4; ánh xanh màn hình rọi mắt Nam | Nam bấm nút "Gửi file" vào nhóm chat lớp. Tiếng click chuột đanh gọn. Cậu ngả lưng thở phào khoan khoái. |
| **P2.01_02**<br>Mưa lời khen | Cận màn hình điện thoại reo dồn dập, 85mm Macro | P3 Macro; thanh thông báo Zalo nhảy liên hồi | Trưởng nhóm nhắn: *"U là trời! Đoạn mở đầu Nam viết đỉnh chóp thế! Quả này nhóm mình out trình chắc!"*. Nam đắc chí cười tươi. |
| **P2.01_03**<br>Đuổi Người Kia | Trung đôi qua vai (OTS Nam $\to$ Người Kia), 50mm Prime | P0 Handheld; Chiaroscuro tương phản gắt | Nụ cười Nam tắt ngấm khi chạm ánh mắt Người Kia. Nam chỉ tay ra cửa: *"Xong việc rồi. Ra khỏi phòng tao"*. Người Kia lẳng lặng đứng dậy bước ra. |
| **P2.01_04**<br>Gài then cửa | Cận then cài cửa sắt, 85mm Macro | P3 Macro; âm thanh then cài đanh gọn | Nam sập cửa gài then sắt đánh *"CẠCH"*. Tiếng kim loại khóa chặt căn phòng. |
| **P2.01_05**<br>Hành lang bốc hơi | Nhìn qua khe thông gió cửa chính, 50mm Anamorphic | P2 Creeping Push-In chậm rãi vào bóng đêm hành lang | **Chi tiết kỳ dị:** Nam áp mắt nhìn ra khe cửa: Hành lang tầng 2 hoàn toàn trống không, im phăng phắc dưới ánh đèn tuýp vàng vọt. Không tiếng dép lê, Người Kia như bốc hơi vào không khí. |
| **P2.02_01**<br>Tùng xách cơm | Trung rộng cửa chính mở toang, 35mm Cine Anamorphic | P0 Handheld; ánh đèn ấm phòng trọ | Tùng xách 2 hộp cơm sườn bốc khói đá cửa bước vào, cười lớn: *"Cơm sườn 35 cành đây bạn ơi! Sáng réo có thằng song sinh chui vào phòng, rồi nó đâu rồi? Bay màu rồi à?"*. |
| **P2.02_02**<br>Bóc đũa lấp liếm | Trung cận Nam ngồi mép nệm, 50mm Prime | P0 Handheld; DoF mỏng | Nam bóc đôi đũa tre lấp liếm: *"À... tao ngủ mơ sảng tí thôi..."*. Cậu cắm cúi ăn để né tránh ánh mắt dò xét của bạn thân. |
| **P2.03_01**<br>Sáng Ngày 2 | Toàn phòng góc A, 35mm Cine Anamorphic | P4 Dutch Angle lệch $8^\circ$ (Cú sốc phi lý) | Sáng hôm sau, Nam tỉnh dậy nhìn thấy: **Then cửa sắt bên trong vẫn đang cài chặt**, nhưng **Người Kia đã đứng rửa bát trong bếp từ bao giờ!** |
| **P2.03_02**<br>Thử lòng 3 củ | Cận mặt bàn học & phong bì tiền, 65mm Macro | P3 Macro; phong bì 3 triệu thò ra tiền polyme 500k | Nam đặt phong bì 3 triệu tiền ăn lên bàn thử lòng. Người Kia lau khô tay, không màng liếc nhìn cọc tiền một giây nào. |
| **P2.03_03**<br>Thị uy ông chủ | Góc thấp (Low-Angle) hếch lên Nam, 40mm Cine Prime | P4 Power Tilt; Nam đứng thẳng vỗ ngực thị uy | **Phản kháng 1:** Nam đập bàn ra oai: *"Ở đây tao là chủ phòng! Cấm mày đụng vào PC hay đồ đạc của tao nghe chưa?!"*. Người Kia khẽ cúi đầu: *"Ừ, tao biết rồi"*. |
| **P2.04_01**<br>Lab 402 réo | Cận màn hình Lab 402 & Zalo, 85mm Macro | P3 Macro; chuông reo dồn dập | Tùng nhắn: *"Chiến thần gánh team đâu rồi? Lên thuyết trình Lab 402 mau không mất 2 củ rưỡi học lại cả lũ!"*. Nam toát mồ hôi hột. |
| **P2.04_02**<br>Tập nói trước gương | Góc máy nhìn qua mặt chiếc gương soi (`VIEW_MIRROR`), 50mm f/1.4 | Mirror OTS: DoF nông rọi vào Nam trong gương cầm sách lúng búng | **Phản kháng 2:** Nam mở giáo trình đứng trước gương tập thuyết trình nhưng não bị "lag", đọc ngắc ngứ lí nhí, vò đầu bất lực. |
| **P2.04_03**<br>Trao thẻ sinh viên | Cận hai bàn tay trao đổi thẻ sinh viên, 65mm Cine | P3 Macro Insert; nhấn mạnh tay thuận | Nam tặc lưỡi đưa thẻ sinh viên bằng tay phải. **Người Kia đón lấy thẻ bằng TAY TRÁI.** Ánh mắt Người Kia thoáng vẻ đắc thắng lạnh lùng. |
| **P2.05_01**<br>Top-Down Cày Game | **Góc máy trần vuông góc $90^\circ$ (Top-Down Claustrophobic)**, 24mm | Góc nhìn từ trên cao đè nén xuống nệm ngủ | Nam nằm co quắp cày rank thâu đêm, ánh sáng xanh tím của điện thoại chớp giật trên gương mặt hốc hác, xung quanh là vỏ hộp cơm và chai nước rỗng. |
| **P2.05_02**<br>Banter cày game | Trung cận Người Kia ngồi học ở bàn, 50mm Prime | P0 Handheld; ánh đèn bàn Chiaroscuro | Người Kia cất giọng rót mật: *"Mày thấy mệt mỏi với cuộc sống người lớn thì cứ nằm chơi game đi... Để tao sống thay cho"*. Nam cười hờ hững: *"Ừ, mày gánh được thì cứ gánh"*. |
| **P2.05_03**<br>Comic Panels leo thang | 3 lát cắt khung hình dạng Comic Split-Screen | Jump Cuts dồn dập với âm thanh pop-up | • **Phản kháng 3:** Nam cáu vụ dọn bàn rồi lại sai đi mua đồ.<br>• **Phản kháng 4:** Đặt báo thức 6h tự đi học nhưng rồi tắt máy ngủ nướng.<br>• **Bảng điểm 9.5:** Snap Zoom vào con số 9.5 đỏ rực rỡ cổng đào tạo. |
| **P2.06_01**<br>Clip Zalo gia đình | Cận màn hình điện thoại xem clip Zalo, 85mm Macro | P3 Macro; video clip phát hình ảnh mâm cơm quê | Mẹ và bác Hai khen ngợi Nam hết cắm mặt vào game. Clip quay rõ Người Kia ngồi gắp thức ăn cho mẹ bằng **TAY TRÁI**, nốt ruồi lộ rõ **BÊN PHẢI**. |
| **P2.06_02**<br>Rack Focus bàng hoàng | Trung cận Nam trong phòng tối, 50mm f/1.4 Prime | **Rack Focus Pull:** Nét từ màn hình điện thoại $\to$ Đôi mắt Nam đang trừng trừng run rẩy | Nam lạnh toát sống lưng nhận ra: Người thân của mình đang yêu quý bản sao hơn chính bản thân mình. |
| **P2.06_03**<br>Soi gương tàn tạ | Cận mặt Nam trước chiếc gương soi toàn thân, 50mm Prime | P2 Slow Push-in chậm rãi ($1.2\text{px/s}$) vào tấm gương | Nam nhìn vào gương: Một kẻ mắt trũng sâu thâm quầng, tóc tai bù xù, người ngợm hôi hám rách rưới. Một cảm giác khủng hoảng hiện sinh rợn tóc gáy. |
| **P2.07_01**<br>Gói xôi gấc | Trung Người Kia mở cửa xách gói xôi gấc về đặt lên bàn, 35mm | P0 Handheld; Người Kia mặc áo sơ mi trắng bảnh bao | Người Kia mỉm cười: *"Mẹ gửi xôi gấc lên cho mày này, ăn đi cho nóng"*. |
| **P2.07_02**<br>Hất tung gói xôi | Cận bàn tay Nam hất văng gói xôi gấc, 65mm Cine | **Crash Zoom & Rung giật $3.5\text{px}$** | Gói xôi gấc văng tung tóe xuống nền gạch men. Nam gào thét: *"Cút đi! Tao không cần mày sống thay! Ngày mai tao sẽ tự đi học, tự giành lại mọi thứ!"*. Khép lại Phần 2. |

---

### MAY-P3 — Bảng máy điện ảnh Phần 3: Người bị thay thế (~3:45)

**Chủ đề hình ảnh:** Cao trào bi kịch, đối chất tâm lý bóc trần bản chất $\to$ Kỹ xảo quang học Vertigo Dolly Zoom & Mặt kính hóa nước $\to$ Đoạn kết rợn ngáy Quiet Horror.

| Mã cảnh & Shot | Cỡ / Góc / Lens điện ảnh | Chế độ máy & Hiệu ứng điện ảnh | Diễn xuất, Chi tiết bối cảnh & Âm thanh |
|---|---|---|---|
| **P3.01_01**<br>Đại giảng đường | **Extreme Wide High-Angle (Góc toàn trên cao nhìn xuống bục giảng)**, 24mm Anamorphic | Ánh sáng Cold Neon trắng bệch công nghiệp; P0 Handheld nhẹ | Nam mặc áo quần chỉnh tề đứng đơn độc trên bục giảng gỗ rộng thênh thang. Phía sau là màn chiếu khổng lồ dày đặc công thức, phía trước là 100 sinh viên đang đổ dồn ánh mắt phán xét. |
| **P3.01_02**<br>Não trắng xóa | Cận mặt Nam toát mồ hôi hột, 85mm Cine Prime | P2 Slow Push-in ($1.5\text{px/s}$) vào đôi mắt đờ đẫn | Não Nam trắng xóa, không một chữ kiến thức. Giọt mồ hôi chảy ròng ròng từ thái dương xuống cằm. Bàn tay cậu run bần bật bẻ gãy đôi viên phấn, bột phấn rơi lả tả xuống sàn gỗ. |
| **P3.01_03**<br>Trừ điểm nhục nhã | Trung giảng viên & OTS qua vai Tùng, 50mm Prime | P0 Handheld; tiếng gõ thước côm cốp xuống bàn | Giảng viên nhíu mày quát: *"Hôm trước trả lời lưu loát lắm cơ mà? Sao hôm nay đứng như người mất hồn thế này?! Trừ 2 điểm chuyên cần!"*. Cả lớp xì xào mỉa mai. Nam nhìn Tùng: Ánh mắt Tùng nhìn cậu lạnh ngắt, đầy sự thất vọng. |
| **P3.02_01**<br>Hành lang nắng gắt | Toàn cảnh hành lang đại học, 35mm Cine Anamorphic | P1 Parallax Lateral Track theo bước chân Nam | Nam cúi gằm mặt tháo chạy dọc hành lang nắng gắt chói chang. Tùng đi ngang qua, buông tiếng thở dài ngao ngán: *"Mày tụt dốc quá rồi..."*. |
| **P3.02_02**<br>Kẻ thừa thãi | Trung Nam nép mình sau cột bê tông, 50mm f/1.4 Prime | DoF nông xóa mờ đám đông sinh viên cười đùa phía sau | Nam nhận ra sự thật cay đắng: Bạn bè, thầy cô, gia đình... tất cả đều chuộng bản sao hoàn hảo kia hơn là một kẻ lười biếng, ăn hại như cậu. Cậu là kẻ thừa thãi. |
| **P3.03_01**<br>Soi nốt ruồi | Cận mặt bàn học tối om & hai tấm thẻ / màn hình, 85mm Macro | P3 Macro Insert; đèn bàn rọi luồng sáng hẹp | Nam vội vã lôi thẻ CCCD và clip Zalo gia đình ra đối chiếu. Cậu run rẩy dí sát hai hình ảnh vào nhau. |
| **P3.03_02**<br>Khám phá bí mật | Cận cực đại (ECU) nốt ruồi trên thẻ & trên clip Zalo | **Snap Zoom kép dứt khoát** | • Zoom giật vào nốt ruồi **BÊN TRÁI** trên ảnh thẻ chính chủ.<br>• Zoom giật vào nốt ruồi **BÊN PHẢI** trên clip Zalo.<br>Nam trợn trừng mắt: Kẻ kia không phải người song sinh, nó là hình ảnh phản chiếu bước ra từ chiếc gương! |
| **P3.03_03**<br>Vertigo Chiếc Gương | Toàn phòng hướng về chiếc gương soi góc phòng, 35mm $\to$ 85mm | **P5 Hitchcock Vertigo Dolly Zoom** (Zoom In kết hợp Dolly Out lùi máy) | Không gian căn phòng trọ bị bẻ cong, kéo dài hút sâu hun hút vào bóng tối kỳ dị. Chiếc gương soi góc phòng sừng sững lơ lửng như một cánh cổng tử thần. |
| **P3.04_01**<br>Vác búa đối chất | Trung Nam vác chiếc búa đinh cán gỗ, 35mm Cine Prime | **P4 Extreme Dutch Angle $12^\circ$** nghiêng lệch trục chân trời | Nam gào thét nước mắt giàn giụa, giơ cao chiếc búa đinh định đập nát tấm gương: *"Mày chui từ gương ra đúng không?! Tao sẽ đập nát mày!"*. |
| **P3.04_02**<br>Người Kia chặn búa | Cận mặt gương & Bàn tay trái Người Kia, 50mm f/1.4 | OTS qua vai Nam; ánh sáng Chiaroscuro sắc lạnh | Người Kia xuất hiện trong gương, giơ bàn **TAY TRÁI** nhẹ nhàng đón lấy đầu búa sắt mà không hề biến sắc. Ánh mắt nó nhìn Nam đầy vẻ thương hại. |
| **P3.04_03**<br>Đòn tâm lý tàn nhẫn | Cận mặt Người Kia trong gương, 65mm Cine Prime | P2 Slow Push-in chậm rãi vào con ngươi đen thẳm | Người Kia cất giọng lạnh lùng bóc trần: *"Mày đập gương làm gì? Tao chính là những gì mày từng muốn trở thành: Chăm chỉ, giỏi giang, được mọi người yêu quý. Mày đã nhường cuộc sống này cho tao từ lúc mày nằm cày game rồi..."*. |
| **P3.04_04**<br>Buông rơi chiếc búa | Cận bàn tay Nam & Chiếc búa rơi xuống sàn, 65mm Prime | P0 Handheld; cú va đập rung giật $3.0\text{px}$ | Từng câu chữ của Người Kia đánh gục ý chí Nam. Bàn tay Nam run rẩy buông lỏng. Chiếc búa đinh rơi cộp xuống sàn gạch men lạnh ngắt. |
| **P3.05_01**<br>Khuỵu gối buông xuôi | Toàn cảnh góc cao (High-Angle) nhìn xuống Nam, 35mm | P0 Handheld tĩnh lặng | Nam khuỵu hai đầu gối xuống sàn nhà, cúi gằm đầu buông xuôi hoàn toàn. Ý chí phản kháng tan thành mây khói. |
| **P3.05_02**<br>Bàn tay chạm kính | Cận bàn tay Nam áp vào mặt gương, 65mm Cine Macro | Slow Motion $60\text{fps}$; DoF siêu mỏng f/1.2 | Các đầu ngón tay Nam chạm vào mặt kính. Không có tiếng chạm kính cứng. Mặt kính khẽ gợn sóng lỏng lăn tăn như mặt hồ đêm. |
| **P3.05_03**<br>Mặt kính hóa nước | Toàn phòng góc chiếc gương phát quang xanh thẫm, 35mm | **P5 Liquid Water Distortion Shader & Chromatic Aberration** | Mặt kính gương hóa lỏng thành dòng nước xanh buốt nuốt chửng toàn bộ cơ thể Nam vào bên trong cõi hư vô câm lặng. Mặt gương phẳng lặng trở lại như chưa từng có chuyện gì xảy ra. |
| **P3.06_01**<br>Tùng mua bún chả | Trung rộng cửa chính mở ra, 35mm Cine Anamorphic | P0 Handheld; ánh đèn đêm ấm áp | Tối hôm đó, Tùng xách bọc bún chả nem thơm phức mở cửa vào: *"Nam ơi! Nay tao mua bún chả nem nướng tạ lỗi vụ ban sáng nhé!"*. |
| **P3.06_02**<br>Dấu hiệu nghịch đảo | Cận Tùng khựng người & Người Kia ngồi ở bàn, 50mm f/1.4 | **Rack Focus Pull:** Nét chuyển từ nụ cười của Tùng sang Người Kia | Người Kia quay đầu lại mỉm cười nhẹ. Tùng khựng người, đôi mắt nheo lại hoài nghi dán chặt vào: Người Kia đang cầm đôi đũa bằng **TAY TRÁI** và nốt ruồi lộ rõ ở đuôi mày **BÊN PHẢI**. |
| **P3.06_03**<br>Cài then sắt kết phim | Đặc tả bàn tay trái Người Kia gài then sắt cửa, 85mm Macro | P3 Macro Insert; âm thanh then cài đanh thép | Người Kia bước ra cửa, dùng bàn tay trái đẩy thanh then sắt cài chốt đánh *"CẠCH"*. Tiếng kim loại khóa chặt số phận của Nam bên trong chiếc gương. |
| **P3.06_04**<br>Ending Shot | Cận mặt Người Kia, 65mm Cine Prime | Ánh sáng Chiaroscuro David Fincher cắt nửa mặt Người Kia trong bóng tối | Người Kia nhìn thẳng vào mắt Tùng, khóe môi khẽ nhếch một nụ cười bí hiểm: *"Mày nhìn nhầm rồi... Tao là Nam mà."* Màn hình sập đen hoàn toàn (Cut to Black). Hết phim. |

## Ánh sáng, âm và nhịp nối

- **Sáng:** cửa sổ là nguồn chính, phòng đủ sáng để nhận mặt và đường thoát. Không phủ vàng viền mọi người hoặc thêm sương chỉ để có vẻ điện ảnh.
- **Làm bài → game:** cùng cửa sổ, vệt sáng dịch trên bàn/tường và tư thế thay đổi. Đèn/laptop chưa tự đổi thành nguồn chính giữa một cảnh ban ngày.
- **Tối:** khoảng 19h30, đồng hồ theo mốc này; đèn bàn và laptop; giữ sắc da, màu áo, vị trí cửa và vùng tối có thể đọc. Đèn bàn bật là trạng thái đã có khi Nam tỉnh; không cần thêm một cảnh ai bật đèn để giải thích mọi thao tác nhỏ.
- **Cắt:** dùng ánh mắt, tay chạm đồ, người ngừng nói hoặc người đổi hướng. Giữ âm phòng nối qua các góc cùng thời điểm; tiếng nước ngừng đúng lúc nguồn ghi. Cửa đóng làm âm người kia ở ngoài bớt trực tiếp, không biến thành giọng nội tâm.
- **Chuyển thời gian:** cắt cùng bố cục với nắng/tư thế/trạng thái bài đổi; sang tối có thể dùng dissolve ngắn trên phòng/nệm. Không hòa hai khuôn mặt lên nhau khi đối thoại hoặc dùng một giọng nói mơ hồ để báo thời gian trôi.
- **Chữ:** thông báo, tin hứa hôm qua, Không làm phiền, tin Tùng và cuộc gọi nhỡ là các lớp đọc riêng. Cận đủ lớn ở cỡ điện thoại; tăng thời gian giữ trước khi tăng số hiệu ứng. Chữ và viền khung không rung theo camera.
- **Nội tâm:** Nam không mấp máy miệng để nói thành tiếng; người kia không cắt phản ứng đúng nhịp những suy nghĩ thầm. Phần lời dẫn/nội tâm vẫn theo nguồn, không thêm giọng diễn giải kỹ thuật.

## Chuẩn bị asset và kiểm tra trước khi dựng dài

Đọc bảng kê tổng duyệt tiền kỳ chi tiết tại **[CHECKLIST-TIEN-KY-ASSET.md](CHECKLIST-TIEN-KY-ASSET.md)** (bao gồm đầy đủ 12 Bối cảnh bóc tách layer, 12 Đạo cụ tương tác Hero Props & 7 UI màn hình, 24 Dáng rig tư thế nhân vật, cùng ma trận biểu cảm 3 cấp độ). Tham chiếu bộ nhân vật ở [ASSET.md](ASSET.md), theo [hướng Style B](../THIET-KE-NHAN-VAT.md). Bảng SVG có biểu cảm/pose chưa chứng minh mọi góc và động tác trong bảng máy đã sẵn sàng.

1. Dùng mặt bằng mới một cửa trái, bếp trái, bàn phải làm mốc; dùng nền hành lang B và trạng thái cửa/ghế đã có; kiểm tra đường qua ngưỡng và che/lộ khi dựng. Có lớp nền được vẽ đủ cho các dịch máy nhỏ; không cần orbit hoặc góc trần mới.
2. Kiểm tra/tạo bổ sung khi được giao: Nam ngủ/bật dậy, gõ–xóa, cầm điện thoại/căn cước, chơi game, mở/gài chốt; người kia quay mặt từ bồn rửa, đặt chén, đi rồi ngồi gõ. Chỉ bổ sung pose/góc thực sự được dùng, không tự nhận có sẵn cả rig ngồi/gõ từ một bảng tĩnh.
3. Mặt ba phần tư, bàn tay/điểm cầm, cận nốt ruồi, chốt và màn hình phải đủ chi tiết cho cỡ gần. Không phóng SVG toàn cảnh để thay mọi cận. Bát được đặt xuống trước khi nhân vật để hai tay trống.
4. Duyệt storyboard theo thứ tự câu chuyện, đặc biệt A03–A05, C01–C05, F03–F04 và G04–H04. Đối chiếu trạng thái chốt/điện thoại/ghế, hướng mắt, tay đang giữ và nguồn sáng.
5. Khi chủ repo giao bước dựng, thử animatic với âm tạm cho một tương tác và đoạn sáng–tối trước khi mở rộng. Kiểm tra chuyển động thật, cỡ xem điện thoại và các điểm nối; bảng góc này chưa phải bằng chứng đã diễn/render đạt. Claude phụ trách dựng khi được giao.

Nguồn nguyên tắc nội bộ: [Ngôn ngữ điện ảnh 2.5D](../../../docs/NGON-NGU-DIEN-ANH-2-5D.md), [quy trình duyệt hình](../../../docs/WHAT-IF-QUY-TRINH.md), [hướng diễn xuất và continuity](../../../.claude/skills/what-if-animation/references/look.md). Đây là quyết định sáng tạo cho Hồ sơ 2, không phải nghiên cứu mới hoặc kết quả thử nghiệm chi phí.

## Rà chuyển động liên tục A–H — 10/11/2026

Bổ sung theo yêu cầu chủ repo, không thay nguồn thoại. Đây là các mắt xích dựng đã làm rõ trong THAO-LUAN-CANH; chưa chứng nhận clip hiện có đã cập nhật. Chi tiết diễn nhỏ có thể cắt lược sau khi trạng thái và đường đi đã đọc được; không cần đặc tả từng động tác.

| Chuỗi | Các mốc phải nối được | Tiếp xúc, âm và điểm cần kiểm tra |
|---|---|---|
| A02–A03 | Lật chăn ra khỏi chân → tay chống → hông tới cuối giường → xoay/buông chân → xỏ dép; vẫn ngồi khi nhận mặt | Chăn nằm trên nệm, không biến mất; hông không trượt xuyên vải. Máy điện thoại giữ trên nệm trong tầm quơ A05, không tự đi theo người |
| A05–B01 | Ngồi → quơ/chụp máy → dồn chân đứng → gối va ghế → ổn định chân → men ra cửa | Không bay từ ngồi sang đứng; giữ cú va một lần, mắt vẫn canh người kia; điện thoại tay phải, tay trái giữ cửa |
| B01 | Người kia dừng → đáy bát chạm mặt đỡ cạnh bồn → nhả ngón → bàn tay trống | Chén không rơi, không tự biến mất; tiếng chạm đúng điểm đỡ, nước đã tắt |
| C03–C06 | Đổi chỗ qua ngưỡng → cửa sát khuôn → trượt chốt → tới ghế → kéo/nhấc → đặt bốn chân → hạ hông ngồi | Giữ điện thoại tay phải, thao tác tay trái. Chốt gài sau đóng; âm ghế không phải bánh lăn. Không tự thêm ghế |
| D02–D04 | Rời ghế → tới bàn/ngăn → lật ví → mở ngăn/lấy thẻ → đặt thẻ/đóng ngăn → về ghế/ngồi | Thẻ trong ngăn trước lấy, trên bàn sau đặt; điện thoại tay phải. Không thêm một bản thẻ hoặc cho ví nằm trong tay trái đồng thời kéo ngăn |
| E01–E03 | Đứng → chuyển ghế tới bàn → đặt điện thoại → chỉnh ghế/ngồi → giữ đế/mở laptop → gõ | Ghế cũ, có mặt sàn; máy đặt bàn rồi hai tay mới cùng rảnh. Âm gõ theo đợt có dừng, không lặp khi tay đã nghỉ |
| F01–F04 | Nhấc máy khỏi bàn → rời ghế → tới cửa → rút chốt/hé → chụp/gửi → ra/về → khép → tay sắp chốt bị ngắt bởi tin | Cần thấy chốt rút thật và vẫn rút lúc rời cửa; không phát tiếng khóa khi chưa gài. Ghế ở bàn suốt đoạn này |
| G01–G04 | Về bàn/ngồi → chơi → tắt game/đặt máy → hỏi/chờ → đứng → tới nệm → ngồi/cởi dép → hạ thân/đưa chân lên | Không ngả thẳng từ ghế bàn sang giường. Điện thoại cạnh laptop, dép dưới nệm, laptop còn nháp; rút thời gian sau khi tư thế nằm đã lập |
| H01–H04 | Nghe phím/tỉnh → chống thân/xoay ra mép → quát khi ngồi → đối phương bỏ phím/đứng/lùi ghế/ngồi → Nam xỏ dép/đứng/tới bàn/lấy máy | Tách tỉnh-ngồi khỏi đứng-đi; người kia không kéo ghế khi đang ngồi như ghế bánh. Nam tới bàn sau khi đường đi đã rảnh |
| H05–H10 | Nam cầm máy tay phải → tay trái trackpad/cuộn/đối chiếu → đọc tiếp đứng cạnh bàn | Chỉ một ghế vẫn có Người Kia; Nam không bỗng ngồi. Hướng dẫn là cửa sổ trên laptop; Người Kia tay trên đùi, không gõ tiếp |

**Hướng diễn:** lúc ngái ngủ chuyển trọng lượng chậm; khi nhận giọng, hành động gấp và có một nhịp hụt; khi giành lại phòng kiểm tra rồi mới tiến; tối tới bàn chậm hơn cơn quát. Không dùng chung một tốc độ cho mọi bước. Cắt theo điểm chạm/ánh mắt, giữ hướng đi qua cắt; không nối vị trí đầu/cuối bằng dissolve để che bước thiếu. Các khoảng nghỉ cũ đã nằm trong hành động, không cộng lại theo từng ô.

**Cần đồng bộ khi dựng:** PHAN-02/03 đã có kịch bản chi tiết mới. Bảng A–H chỉ bao phủ phần 1; chưa phải shot list đủ bản 15 phút. Đọc cơ chế mới trong LUAT-BAN-NHAP-V1, bỏ hướng giằng co/cưỡng ép cũ. Demo A02B và ánh sáng/rig đã có cập nhật riêng; đối chiếu trước khi dùng.