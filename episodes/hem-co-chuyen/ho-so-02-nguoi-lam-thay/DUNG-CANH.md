# Hồ sơ 2 — Dựng cảnh và góc máy (Hỗ trợ Full 3D Camera)

**CHUYỂN HƯỚNG FULL 3D — 12/11/2026:** Toàn bộ quy trình sản xuất chuyển sang **Nhân vật 3D & Bối cảnh 3D (Stylized 3D Cinema)** theo [Quy chuẩn 3D](../../../docs/QUY-CHUAN-3D.md). Các bảng góc máy bên dưới được mở khóa toàn phần trong không gian 3D 360°:
- **Camera 3D vật lý thực:** Cảm biến 36mm Full-Frame, thay đổi tiêu cự (24mm/35mm/50mm/85mm), Depth of Field Bokeh vật lý, góc trần vuông góc $90^\circ$ (Top-down), góc thấp (Low-Angle) và cú **Hitchcock Vertigo Dolly Zoom** thực thụ (đổi tiêu cự đồng thời đổi khoảng cách dọc hướng nhìn của máy) mà không còn bị giới hạn bởi góc vẽ phẳng 2D hay hở nền khi dịch máy.
- **Ánh sáng & Phản chiếu thực:** Đèn bàn 3200K, ánh nắng cửa sổ, Screen Glow từ laptop và mặt gương phản chiếu sai lệch dùng đèn/shader 3D vật lý thật.

**Đồng bộ 13/11/2026:** Kịch bản chính thức khóa bản dựng tại [KICH-BAN-15P-HOAN-CHINH.md](KICH-BAN-15P-HOAN-CHINH.md).  
> 📋 **BẢNG SHOT LIST & TIMELINE THỰC THI 15 PHÚT (KHÓA DỰNG TOÀN TẬP):**  
> Toàn bộ 96 shot máy 3D chi tiết từng giây (00:00 – 15:00), tiêu cự lens, thời lượng, chuyển cảnh điện ảnh và camera mode đã được hoàn thiện tại **[SHOTLIST-VA-TIMELINE-15P.md](SHOTLIST-VA-TIMELINE-15P.md)**. Bảng này là tài liệu thực thi cho toàn bộ 3 Hồi.

**Phạm vi bảng máy dưới đây:** A–H và các phần tham khảo kỹ thuật, thông số lens, visual direction và phân lớp máy 3D.

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

Đã đối chiếu [bảng PNG hiện có](assets/boi-canh/boi-canh.png) và [hướng dẫn 3D hiện hành](assets/boi-canh-3d/README.md) ngày 10/11/2026 tới `09e7616`; bản đại tu ngày 10/11 sau đó nằm trong hồ sơ bối cảnh. Mặt bằng mới thay mô tả trái/phải từ nền cũ: chỉ một cửa chính ở tường trái; khối cạnh bàn là tủ quần áo, không phải cửa thứ hai. Không đổi vị trí đồ để rút đường đi cho vừa số giây.

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

## Hệ Thống Dựng Cảnh & Góc Quay 3D (Full 3D Cinematography & Virtual Camera)

**Cập nhật nâng cấp 12/11/2026 (Full 3D Pipeline):** Khi chuyển sang **Nhân vật 3D & Bối cảnh 3D** ([QUY-CHUAN-3D.md](../../../docs/QUY-CHUAN-3D.md)), toàn bộ các giới hạn của việc tách layer 2D (`XA/PHÒNG/CHE-GẦN`), kéo dịch pixel giả lập (`-30px/-18px`), hay cấm xoay góc sau/góc trần **đã được gỡ bỏ hoàn toàn**.

### Ưu thế không gian 3D & Nguyên tắc dàn cảnh

| Yếu tố kỹ thuật | Cách xử lý trong không gian 3D | Điểm kiểm tra thực tế |
|---|---|---|
| **Che khuất & Chiều sâu (Z-Buffer)** | Tự nhiên tuyệt đối qua mô hình 3D thực (`1 unit = 1m`). Vai tiền cảnh, mép bàn, bồn rửa và cánh cửa tự động che đúng phần cơ thể phía sau khi camera dịch chuyển 360°. | Không có lỗi xuyên lưới (Mesh Clipping) giữa tay–bàn, chân–ghế, chân–sàn. |
| **Ánh sáng & Bóng đổ vật lý** | Dùng nguồn đèn 3D thật: Area Light cửa sổ, Spot Light đèn bàn `3200K`, Screen Light `6500K` từ laptop/điện thoại (đặc biệt ban đêm lấy ánh sáng xanh laptop làm nguồn chính `LAPTOP_LIGHT`). | Bóng đổ mềm (Soft Shadow) và Contact Shadow bám sát chân ghế, chân giường, đáy bát sứ. |
| **Chiếc gương & Phản chiếu** | Dùng **Planar Reflection / Dual Render Camera** mặt kính gương: phản chiếu căn phòng thật theo đúng góc camera 3D, nhưng kiểm soát riêng pose/nốt ruồi/độ trễ của Người Kia bên trong kính. | Không dùng thủ thuật lật ngược toàn khung hình làm đảo chữ trên thẻ/đồng hồ. |
| **Độ sâu trường ảnh (Physical DoF)** | Mô phỏng thấu kính 36mm Full-Frame (`f/1.4 – f/2.8`) bằng Focus Distance thực theo tọa độ vật thể (mm/m), tạo Bokeh elip tự nhiên cho đèn và khe cửa. | Rack Focus Pull chuyển nét giữa 2 mặt phẳng cách nhau $\ge 0.5\text{m}$ mượt mà, đọc rõ chữ UI/thẻ. |

### Bảy chế độ máy quay điện ảnh 3D (3D Cine Camera Modes)

| Mã | Tên chế độ máy 3D | Ứng dụng & Ý đồ tâm lý | Thông số & Kỹ thuật thực thi |
|---|---|---|---|
| **3D-0** | **Handheld Shoulder Rig**<br>(Vác vai rung thở hữu cơ) | Mặc định cho đối thoại, căng thẳng đời thực thay cho tripod chết cứng. | Gắn Noise Modifier (`0.2Hz`, biên độ xoay $0.05^\circ - 0.15^\circ$) lên trục Camera 3D. Khi có cú va chạm/giật mình (va ghế, hất xôi, rơi búa), kích xung động tắt dần trong $0.2\text{s}$. |
| **3D-1** | **Steadicam Follow & Leading**<br>(Bám đuôi / Dẫn hướng mượt) | Theo chân nhân vật xuyên phòng trọ $\to$ hành lang $\to$ giảng đường (Oner / Long take). | Camera 3D trượt theo spline gắn damping mượt mà (cùng hoặc ngược hướng đi), giữ không gian 360° liên tục mà không gãy trục quay. |
| **3D-2** | **3D Dolly Arc / Orbit**<br>(Trượt vòng cung quanh chủ thể) | Bộc lộ thế đối đầu tâm lý, khoảng cách quyền lực giữa Nam và Người Kia. | Camera di chuyển vòng cung $30^\circ - 180^\circ$ quanh bàn học hoặc mặt gương (Look-at Constraint khóa vào mắt nhân vật), phô diễn ánh sáng Chiaroscuro quét qua khuôn mặt. |
| **3D-3** | **Extreme Verticality**<br>(Góc sàn thấp & Góc trần $90^\circ$) | Góc sàn ($10-15\text{cm}$) tạo áp lực vật lý; Top-Down $90^\circ$ dìm Nam vào chiếc hộp cô lập. | Tận dụng phòng trọ có đủ 4 tường và trần tháo rời (Backface Culling trần) để đặt camera sát sàn nhà hoặc vuông góc trên trần nhìn xuống nệm. |
| **3D-4** | **Inside-Mirror Reverse POV**<br>(Góc quay TỪ BÊN TRONG mặt gương) | Đặt khán giả vào vị trí "bên kia thế giới" đang quan sát Nam. | Đặt Virtual Camera ngay phía sau lớp kính bán mạ của chiếc gương nhìn ngược ra phòng, thấy hơi sương/vết nứt ở tiền cảnh và toàn bộ cử chỉ lúng túng của Nam. |
| **3D-5** | **Macro Insert & True Rack Focus**<br>(Đặc tả vật thể & Chuyển nét Z-Depth) | Then sắt, giọt nước, nốt ruồi trên CCCD, màn hình UI `LAPTOP_LIGHT`. | Ống kính 85mm Macro `f/1.4`, rút ngắn khoảng lấy nét từ $0.2\text{m}$ (tiền cảnh) kéo ra $1.8\text{m}$ (mắt nhân vật). Mọi màn hình là Texture phát sáng (Emission Shader) gắn chặt trên mặt kính thiết bị 3D. |
| **3D-6** | **True Vertigo Zoom & Liquid Glass**<br>(Dolly Zoom vật lý & Khúc xạ nước) | Cao trào bóc trần bí mật gương & cảnh nuốt chửng Nam. | • **Vertigo Dolly Zoom:** Keyframe đồng thời Camera lùi dọc trục Z và Focal Length tăng từ `35mm` lên `85mm`.<br>• **Liquid Glass Shader:** Displacement Wave + Refraction IOR `1.33` trên bề mặt kính 3D. |

### Ba tương tác vật lý 3D cần khóa chặt

- **Bồn rửa & Bát sứ:** Tủ bếp 3D và bồn inox giữ nguyên vị trí không gian; tay trái Người Kia gắn Bone Constraint nâng/úp bát sứ lên giá inox; nước chảy dùng Particle / Fluid Mesh nhẹ kèm giọt tiếp xúc.
- **Cửa chính & Then sắt:** Cánh cửa xoay quanh trục bản lề Z thật; thanh then sắt có Animation trượt ngang chính xác vào tai khóa; camera có thể soi sát từ cả mặt trong lẫn góc nhìn xuyên khe thông gió ra hành lang 3D đêm.
- **Bàn học, Ghế 4 chân, Laptop & Điện thoại:** Ghế 4 chân đặt chuẩn mặt sàn (`z = 0`), diễn kéo/lùi có ma sát thật. Điện thoại/CCCD chuyển tiếp mượt từ `Parent: Desk` sang `Parent: Hand_R/Hand_L` tại đúng frame ngón tay khép vào cạnh vật.

## Bảng góc máy 3D chi tiết theo từng phân cảnh

Toàn bộ các nhóm shot dưới đây được thiết kế để khai thác tối đa **Camera 3D không gian $360^\circ$**, ánh sáng Chiaroscuro thực và biểu cảm Facial Blendshapes.

### MAY-A — Nhận mặt & Cú sốc trùng giọng (Góc 3D đa chiều)

**Đạo diễn 3D:** Thay vì giữ một góc toàn phẳng lặp lại, tận dụng không gian 3D để đi từ **cận vật thể bồn rửa $\to$ Rack Focus sang nệm $\to$ Dolly Arc sau vai $\to$ Góc sàn $15\text{cm}$ va ghế**.

| Mã | Cỡ / Góc dựng 3D / Lens | Chế độ máy 3D, Rung & Focus | Diễn xuất, Bố cục 3D & Âm thanh |
|---|---|---|---|
| A01 | **Góc qua vai từ bồn rửa** (35mm Anamorphic 2.39:1, máy đặt cạnh giá bát hướng chéo sang nệm) | **3D-0** Handheld + **3D-5** Rack Focus f/1.8 | Tiền cảnh mờ là bờ vai & bọt xà phòng bồn rửa của Người Kia (quay lưng); hậu cảnh nét là Nam đang ngủ say trên nệm bên phải. Tiếng báo thức reo, tiếng nước và tiếng bát sứ có vị trí âm 3D rõ rệt. |
| A02 | **Low-Angle sát mặt gối nệm** (65mm Macro f/2.0) | **3D-5** Macro Insert; focus trượt từ màn hình báo thức sát ống kính $\to$ mí mắt Nam | Nam thò tay ấn tắt báo thức rồi kéo chăn trùm lên vai. Bóng đổ mềm từ ánh sáng khe cửa sổ vắt ngang mặt gối 3D. |
| A02B | **Trung rộng góc chéo $45^\circ$ từ chân giường** (40mm Cine Prime) | **3D-0** Handheld + dịch nhẹ qua phải theo trọng lượng Nam | Nam càu nhàu, lật chăn, chống tay ngồi dậy, xoay hông đặt chân xuống dép lê. Độ lún nhẹ của nệm và bóng tiếp đất chân dép hiện rõ trên sàn 3D. |
| A03 | **OTS Dolly Arc (Trượt vòng cung sau vai Nam)** (50mm f/1.4) | **3D-2** Dolly Arc trườn vòng $30^\circ$ sang phải khi Nam ngẩng nhìn về bếp | Nam tưởng Tùng: *"Ê, áo đó..."*. Camera trượt nhẹ sang bên bộc lộ đồng thời nét mặt ngái ngủ chuyển sang ngỡ ngàng của Nam và dáng Người Kia bắt đầu xoay cổ. |
| A04 | **Reverse Close-up ngang tầm mắt Người Kia** (65mm f/1.8 + Dutch $5^\circ$) | **3D-0** Handheld + **Chế độ nghiêng $5^\circ$**; đèn cửa sổ tạo Rim Light viền tóc 3D thật | Cú cắt ngược trục $180^\circ$ hoàn hảo (chỉ 3D mới quay mượt từ phía Nam sang góc bếp ngược lại): Người Kia quay hẳn mặt, nốt ruồi bên phải, nụ cười nhẹ điềm tĩnh, ánh sáng rim cắt viền má. |
| A04B | **Tight Close-Up Nam** (65mm f/1.4) | **3D-0** Handheld; hậu cảnh căn phòng xóa mờ thành Bokeh | Nam dụi mắt, nhìn trân trân. Nhịp lặng 2s chỉ còn tiếng quạt trần xoay bóng nhẹ trên tường. |
| A05 | **Floor-Level Low Angle (Sát mặt sàn $15\text{cm}$ cạnh chân ghế gỗ)** (35mm Anamorphic) | **3D-3** Góc sàn thấp + xung va chạm `0.15s` khi đầu gối va ghế | Nghe giọng trùng khớp 100%, Nam giật lùi khỏi nệm; máy quay đặt sát sàn bắt trọn đôi chân loạng choạng đập mạnh vào chân ghế gỗ 4 chân kêu *"CỘP"*, ghế trượt xê dịch thật trên sàn, Nam vơ điện thoại lùi về cửa. |

### MAY-B — Cố thủ ngưỡng cửa & Cuộc gọi cho Tùng

**Đạo diễn 3D:** Camera 3D giữ chiều sâu hành lang–ngưỡng cửa–bếp trong cùng một trục đường chéo dài nhất của căn phòng.

| Mã | Cỡ / Góc dựng 3D / Lens | Chế độ máy 3D, Rung & Focus | Diễn xuất, Bố cục 3D & Âm thanh |
|---|---|---|---|
| B01 | **Deep Focus chéo từ khe cửa mở** (35mm Cine Prime, f/4.0) | **3D-0** Handheld + cánh cửa mở làm tiền cảnh nén chặt không gian | Nam ép lưng sát mép cửa quát lớn; tận sâu bên bếp, Người Kia dừng tay úp bát sứ lên giá *"LÁCH CÁCH"* rồi giơ hai tay trống ngang bụng, ánh sáng cửa sổ đổ bóng dài nối 2 người. |
| B02 | **Cận OTS từ góc trên vai phải Nam** (50mm f/1.4) | **3D-0** Handheld hơi gấp; Focus ở mặt Nam & màn hình điện thoại | Nam ghì điện thoại gọi Tùng, mắt cảnh giác liếc chéo sâu vào phòng. Âm thoại Tùng lọc Telephone EQ. |
| B03 | **Slow Push-In mặt Nam trong bóng tối khung cửa** (65mm Prime) | **3D-2** Dolly tiến chậm $15\text{cm}$ vào ánh mắt tuyệt vọng | Tùng cúp máy *"TÚT TÚT"*. Nam hạ điện thoại, bóng khung cửa đổ dọc cắt nửa khuôn mặt Nam. |

### MAY-C — Đổi chỗ hành lang & Gài chốt then sắt

**Đạo diễn 3D:** Tận dụng **Steadicam 3D Leading Shot** nối liền phòng trọ ra hành lang dài tầng 2 mà không bị đứt gãy không gian.

| Mã | Cỡ / Góc dựng 3D / Lens | Chế độ máy 3D, Rung & Focus | Diễn xuất, Bố cục 3D & Âm thanh |
|---|---|---|---|
| C01–C03 | **Steadicam 3D Leading & Orbit dọc hành lang** (28mm Anamorphic) | **3D-1** Camera 3D đi giật lùi dẫn đường qua ngưỡng cửa ra hành lang, xoay $45^\circ$ theo Nam né vào tường | Chuỗi chuyển động 3D liên tục: Người Kia bước ra cửa dưới ánh đèn tuýp hành lang $\to$ Nam nép lưng vào lan can chỉ Người Kia lùi ra đầu dãy $\to$ Nam lách nhanh qua ngưỡng cửa vào lại phòng. |
| C04 | **Reverse POV từ bên trong phòng nhìn cửa dập vào ống kính** (50mm Prime) | **3D-0** Handheld + cửa đóng tạo xung tối sầm khung hình | Cánh cửa gỗ xoay trục bản lề 3D đóng sầm lại trước ống kính, cắt phăng nguồn sáng và tiếng ồn hành lang. |
| C05 | **Extreme Macro 3D sát ổ then sắt ($10\text{cm}$)** (85mm Macro f/2.0) | **3D-5** Macro Insert; ánh sáng hắt từ khe cửa lộ rõ vân kim loại | Bàn tay trái Nam đẩy thanh then sắt trượt sâu vào ổ khóa thép *"CẠCH"*. Cú cận vật lý siêu thực khẳng định cửa đã khóa chặt. |
| C06 | **High-Angle $30^\circ$ từ góc trần bàn học nhìn xuống Nam & Cửa** (35mm Prime) | **3D-0** Handheld; Nam ngồi lọt thỏm trên ghế đối diện cánh cửa đóng kín | Nam kéo ghế gỗ 4 chân ngồi canh cửa, nhỏ bé giữa căn phòng kín. Tiếng Người Kia vọng vào qua khe thông gió. |

### MAY-D — Đối chiếu căn cước & Tra khảo qua cửa

**Đạo diễn 3D:** Dùng góc nhìn POV từ trong ngăn kéo bàn và Rack Focus 3D qua mặt thẻ CCCD.

| Mã | Cỡ / Góc dựng 3D / Lens | Chế độ máy 3D, Rung & Focus | Diễn xuất, Bố cục 3D & Âm thanh |
|---|---|---|---|
| D01 | **OTS góc cao qua vai Nam xuống màn hình điện thoại** (65mm Prime) | **3D-5** Macro; màn hình phát sáng phản chiếu nhẹ lên đầu ngón tay | Nam nhắn tin giục Tùng, chờ đợi trong im lặng. |
| D02 | **Inside-Drawer POV (Góc máy từ bên trong ngăn kéo bàn nhìn hếch lên)** (28mm Wide) | **3D-3** Góc máy thấp trong hộc tủ khi Nam kéo mở ngăn kéo | Ngăn kéo trượt mở ra sát mặt ống kính, ánh sáng phòng ùa vào, bàn tay trái Nam thò xuống nhặt ví & rút thẻ CCCD, lộ rõ vẻ mặt căng thẳng ở phía trên. |
| D03 | **Split-Distance Rack Focus CCCD $\to$ Mắt Nam** (85mm f/1.4) | **3D-5** Rack Focus Pull từ $0.25\text{m}$ (ảnh thẻ CCCD) sang $0.9\text{m}$ (mắt Nam) | Nam giơ thẻ sát cằm đối chiếu; tiêu điểm trượt mượt từ nốt ruồi bên trái trên thẻ ra ánh mắt kinh ngạc của Nam. |
| D04–D05 | **Cross-Cut qua hai mặt cánh cửa 3D** (50mm Prime đối xứng trục) | **3D-0** Handheld | Cắt qua lại giữa Nam ngồi ghế trong nhà (ánh sáng xiên cửa sổ) và Người Kia đứng tựa lan can hành lang (ngược sáng đèn tuýp ấm/lạnh), tạo đối lập rạch ròi giữa 2 thế giới bị ngăn bởi cánh cửa. |

### MAY-E — Bí bài tập lớn & Toan tính vụ lợi

**Đạo diễn 3D:** Dùng **Dolly Arc vòng quanh bàn học** kết hợp tua sáng vệt nắng 3D di chuyển vật lý trên mặt bàn và tường.

| Mã | Cỡ / Góc dựng 3D / Lens | Chế độ máy 3D, Rung & Focus | Diễn xuất, Bố cục 3D & Âm thanh |
|---|---|---|---|
| E01–E01B | **Steadicam Follow theo chiếc ghế** (35mm Anamorphic) | **3D-1** Bám theo Nam đứng dậy kéo chiếc ghế 4 chân băng qua phòng về bàn | Cảm nhận trọng lượng ma sát ghế gỗ trên sàn gạch 3D; nối mượt sang bàn học mở laptop cắm sạc. |
| E02–E03 | **Side-Profile OTS qua mép màn hình Laptop** (65mm f/1.8) | **3D-2** Dolly trượt ngang thật chậm từ trái sang phải ngang bàn học | Vừa thấy màn hình Word trắng trơn ở rìa phải, vừa thấy Nam vò đầu cắn móng tay; vệt nắng Area Light 3D dịch chuyển vật lý qua tường báo hiệu hàng giờ trôi qua. |
| E04 | **Tight 3/4 Push-In & Gaze Line tới cánh cửa** (65mm f/1.4) | **3D-2** Dolly Push-In chậm vào đồng tử Nam; hậu cảnh là cánh cửa đóng mờ Bokeh | Nam liếc nhìn về phía cửa khi ý nghĩ nhờ vả lóe lên, rồi lắc đầu tự bác bỏ. |

### MAY-F — Rút then đi vệ sinh & Sai lầm chí mạng

**Đạo diễn 3D:** Khóa chặt bằng chứng then sắt chưa gài bằng góc **Tight Split-Plane (Tiền cảnh then sắt – Hậu cảnh Nam)**.

| Mã | Cỡ / Góc dựng 3D / Lens | Chế độ máy 3D, Rung & Focus | Diễn xuất, Bố cục 3D & Âm thanh |
|---|---|---|---|
| F01–F03 | **Leading Steadicam ra hành lang** (28mm–50mm Cine) | **3D-1** Theo Nam mở cửa, chụp ảnh qua khe cửa, chỉ Người Kia ra xa rồi rảo bước cuối hành lang và quay về | Tận dụng không gian hành lang 3D đầy đủ góc khuất: thấy rõ Người Kia vẫn đứng bất động dưới bóng đèn vàng tận cuối dãy khi Nam quay vào phòng. |
| F04 | **Tight Foreground-Background Frame tại chốt cửa** (50mm f/2.8, góc nghiêng dọc theo cánh cửa) | **3D-5** Tiền cảnh nét cực gần là thanh then sắt; trung cảnh là Nam quay lưng bấm máy | **Góc máy đắt giá của 3D:** Camera gắn sát cạnh khung cửa chỉ cách chốt $20\text{cm}$. Bàn tay Nam đặt lên then chuẩn bị gài $\to$ điện thoại rung tin nhắn $\to$ Nam buông tay đi thẳng vào phòng. **Thanh then sắt lộ rõ ở tiền cảnh vẫn thụt vào trong, chưa hề gài vào tai khóa!** |

### MAY-G — Cày game buông thả & Chiều tà buông xuống

**Đạo diễn 3D:** Khai thác góc **True Top-Down $90^\circ$ (trần phòng tháo trần)** và chuyển động vệt nắng hoàng hôn 3D.

| Mã | Cỡ / Góc dựng 3D / Lens | Chế độ máy 3D, Rung & Focus | Diễn xuất, Bố cục 3D & Âm thanh |
|---|---|---|---|
| G01–G02 | **Screen-Reflection Close-Up** (85mm Macro) | **3D-5** Đặt máy sát bên hông mặt kính điện thoại | Thấy rõ ánh sáng icon *Không làm phiền (DND)* hắt sắc tím lên ngón tay cái và tròng mắt Nam khi cậu gạt bật. |
| G03 | **3D Dolly Timelapse quanh bàn học** (35mm Anamorphic) | **3D-2** Máy xoay vòng nhẹ $25^\circ$ qua 3 cú cắt chuyển thời gian | Nắng chiều 3D vàng cam rút nhanh khỏi bàn học qua bức tường rồi tắt lịm; tư thế Nam càng lúc càng còng xuống, tách biệt dần với laptop bài tập. |
| G04 | **True Top-Down $90^\circ$ Bird's Eye trên giường** (24mm Wide) | **3D-3** Góc trần nhìn thẳng vuông góc xuống toàn bộ phòng đang tối sầm | Nam quẳng máy sang bên cạnh laptop, hỏi vọng ra cửa rồi thả mình nằm co quắp trên nệm trong căn phòng tối dần như một cái lồng kín. |

### MAY-H — Tỉnh giấc ban đêm & Bản hợp đồng ma quỷ

**Đạo diễn 3D:** Thực thi tuyệt đối phong cách **Ánh sáng Chiaroscuro David Fincher 3D**: Nguồn sáng chính là ánh xanh lạnh laptop (`LAPTOP_LIGHT`) kết hợp đèn bàn `3200K`.

| Mã | Cỡ / Góc dựng 3D / Lens | Chế độ máy 3D, Rung & Focus | Diễn xuất, Bố cục 3D & Âm thanh |
|---|---|---|---|
| H01–H02 | **Pillow-Level Low Angle (Sát mặt gối nệm của Nam)** (35mm Anamorphic) | **3D-3** Máy đặt sát mặt nệm của Nam nhìn xuyên qua bóng tối về phía bàn học phát sáng | Nam hé mắt tỉnh dậy: nửa gối của Tùng sát ống kính trống không; sâu trong hậu cảnh phòng tối om, **chiếc laptop phát luồng sáng xanh hắt lên bóng lưng Người Kia đang ngồi thẳng tắp gõ phím** trên ghế của Nam! |
| H03 | **3D Dolly Orbit $90^\circ$ vòng qua bàn học** (40mm Cine Prime + Dutch $7^\circ$) | **3D-2** Camera trượt vòng cung nối từ mép nệm sang cạnh bàn khi Nam quát & Người Kia lùi ghế | Xác lập cực rõ khoảng cách 3D trên sàn: Người Kia đứng lên kéo ghế lùi $40\text{cm}$, ngồi ngay ngắn, hai bàn tay úp lên đùi dưới ánh sáng xanh rọi từ laptop. |
| H04–H07 | **OTS qua vai Người Kia hướng vào Nam & Màn hình** (65mm f/1.8) | **3D-5** Rack Focus giữa biểu cảm Nam, điện thoại nhiều cuộc gọi nhỡ và 10 trang Word hoàn chỉnh | Người Kia ở tiền cảnh ngoài nét tĩnh lặng như tượng; Nam tự nhặt máy đọc tin Tùng rồi kéo trackpad soi bài làm hoàn hảo. Ánh xanh laptop chiếu rọi vẻ thèm thuồng dần hiện lên mặt Nam. |
| H08–H10 | **Chiaroscuro Two-Shot đối xứng chiều sâu** (50mm Prime) | **3D-2** Push-in nhẹ vào mắt Nam ở H09 $\to$ giữ tĩnh hai shot đối xứng ở H10 | Nam đứng phía ngoài vùng tối (có Rim Light xanh cắt viền vai) tự mãn mỉm cười trước lời đề nghị; Người Kia ngồi gọn trong quầng sáng đèn bàn, hai tay thu khỏi phím. |

---

### MAY-P2 — Bảng máy điện ảnh 3D Phần 2: Quen được làm thay (~6:25)

**Đạo diễn 3D:** Nâng tầm với **3D Camera Inside-Mirror (Từ trong mặt kính nhìn ra)**, **Reveal Pan $120^\circ$ không cắt**, và **Top-Down Rotating Orbit** lúc cày game.

| Mã cảnh & Shot | Cỡ / Góc dựng 3D / Lens | Chế độ máy 3D & Hiệu ứng | Diễn xuất, Bố cục 3D & Âm thanh |
|---|---|---|---|
| **P2.01_01–04** | **OTS bàn phím $\to$ Macro then sắt** (50mm/85mm) | **3D-5** + **3D-0** Handheld | Cú bấm gửi file, thông báo Zalo nhảy sáng mặt Nam, OTS đuổi Người Kia ra hành lang và Macro quay sát then sắt gài đanh *"CẠCH"*. |
| **P2.01_05**<br>Hành lang bốc hơi | **Through-Door-Vent Camera (Camera xuyên khe thông gió cửa gỗ)**, 50mm | **3D-2** Push-in sát qua nan khe thông gió nhìn dọc hành lang đêm 3D | Khung hình bị kẹp bởi hai nan gỗ cửa tiền cảnh, mắt người xem xuyên thẳng dọc hành lang dài vàng vọt đèn tuýp: **Hoàn toàn trống rỗng, không tiếng bước chân.** |
| **P2.02_01–02** | **Dynamic Door Reveal & OTS ăn cơm** (35mm/50mm) | **3D-1** Theo Tùng đá cửa vào đặt 2 hộp cơm sườn xuống bàn | Không gian phòng trọ sạch bóng bất thường; Nam cúi mặt bóc đũa né ánh mắt Tùng. |
| **P2.03_01**<br>Sáng Ngày 2 | **120° Uncut Reveal Pan (Lia không cắt từ Then Cửa $\to$ Bếp)**, 35mm + Dutch $8^\circ$ | **3D-2** Khởi đầu ở cận then sắt đang GÀI CHẶT $\to$ Pan lia mượt $120^\circ$ xuyên qua phòng tới bếp | Một cú lia 3D liền mạch khẳng định sự phi lý kinh hoàng: **Then cửa bên trong vẫn đang khóa chặt, nhưng Người Kia đã đứng rửa bát trong bếp bằng tay trái!** |
| **P2.03_02–03** | **Low-Angle Power Shot từ mặt bàn học** (40mm Cine) | **3D-3** Máy đặt sát mặt bàn ngay cạnh phong bì 3 triệu nhìn hếch lên | Nam đập tay xuống bàn sát ống kính thị uy làm "ông chủ", Người Kia đứng thẳng điềm tĩnh đối diện, không thèm liếc phong bì tiền. |
| **P2.04_01–02**<br>Tập nói trước gương | **Inside-Mirror Two-Way POV (Từ BÊN TRONG mặt gương nhìn ra)**, 50mm f/1.4 | **3D-4** Camera đặt sau mặt kính hơi mờ sương góc phòng nhìn thẳng vào Nam | Thấy trọn vẹn bộ dạng lúng túng, vò đầu "lag não" của Nam trong ánh sáng phòng trọ qua lớp kính có vết nứt góc phải (dấu hiệu thị giác âm thầm của thế giới gương). |
| **P2.04_03**<br>Trao thẻ sinh viên | **Top-Angle Close-Up hai bàn tay trên bàn/ngưỡng**, 65mm Macro | **3D-5** Focus dồn vào bàn tay Người Kia nhận thẻ bằng **TAY TRÁI** | Nhấn mạnh bằng chứng nghịch đảo tay thuận rõ nét 100%. |
| **P2.05_01–03**<br>Cày game & Comic | **Top-Down $90^\circ$ Rotating Orbit** trên trần (24mm) + **Split-Screen 3D** | **3D-3** Camera trên trần xoay vòng thật chậm ngược chiều kim đồng hồ quanh nệm ngủ | Nam nằm co quắp giữa đống vỏ hộp cơm, ánh sáng xanh tím điện thoại nhấp nháy trên mặt trong khi xung quanh dường như quay cuồng; xen kẽ nhanh nhịp nhảy điểm **9.5**. |
| **P2.06_01–03**<br>Clip Zalo & Soi gương | **Rack Focus từ màn hình điện thoại $\to$ Gương soi tàn tạ**, 50mm f/1.4 | **3D-5** + **3D-4** Dolly Push-in sát mặt gương | Clip Zalo lộ rõ Người Kia gắp đồ cho mẹ bằng tay trái & nốt ruồi bên phải $\to$ Nam bước tới đối diện gương: Góc máy đi từ sau gáy Nam tiến sát vào mặt kính, thấy hình ảnh Nam phờ phạc thảm hại. |
| **P2.07_01–02** | **Floor-Level Impact Shot** lúc hất gói xôi gấc (35mm) | **3D-3** Máy thấp sát sàn bắt trọn gói xôi văng thẳng về phía ống kính + rung $3.5\text{px}$ | Xôi đỏ lá chuối tung tóe trên gạch men; góc thấp tôn Nam gào thét dữ dội quyết tâm tự đi học. |

---

### MAY-P3 — Bảng máy điện ảnh 3D Phần 3: Người bị thay thế (~3:45)

**Đạo diễn 3D:** Đỉnh cao ngôn ngữ điện ảnh 3D — **3D Crane Down giảng đường**, **True Hitchcock Vertigo Dolly Zoom**, **$180^\circ$ Combat Orbit trước gương**, và **Inside-Mirror Water Submersion**.

| Mã cảnh & Shot | Cỡ / Góc dựng 3D / Lens | Chế độ máy 3D & Hiệu ứng | Diễn xuất, Bố cục 3D & Âm thanh |
|---|---|---|---|
| **P3.01_01**<br>Đại giảng đường | **3D Crane Down (Hạ cần cẩu từ trần bậc thang $\to$ Bục giảng)**, 24mm Anamorphic | **3D-1** Bắt đầu ở góc High-Angle cực cao sau lưng hàng trăm sinh viên $\to$ hạ sà xuống sát bục giảng | Ánh sáng Cold Neon trắng bệch soi rọi sự nhỏ bé, trơ trọi của Nam trước 100 ánh mắt phán xét và màn chiếu khổng lồ sau lưng. |
| **P3.01_02–03**<br>Gãy phấn & Trừ điểm | **Slow Push-In** 85mm + **Low-Angle bên dưới bục gỗ** | **3D-2** + **3D-0** Handheld | Giọt mồ hôi 3D lăn từ thái dương Nam; cận tay run rẩy bẻ gãy viên phấn rơi vụn xuống sàn; OTS qua vai Tùng nhìn Nam đầy thất vọng. |
| **P3.02_01–02** | **Steadicam Follow hành lang nắng gắt**, 35mm | **3D-1** Chạy lùi theo Nam cúi gằm mặt chạy khỏi Tùng | Bóng cột bê tông hành lang cắt đôi người Nam khi cậu nép vào góc tối nhìn bạn bè quay lưng. |
| **P3.03_01–02**<br>Soi nốt ruồi | **Macro Split-Comparison** trên mặt bàn tối, 85mm Macro | **3D-5** Đèn bàn `3200K` rọi thẳng xuống thẻ CCCD và màn hình clip Zalo đặt cạnh nhau | Zoom giật từ nốt ruồi **BÊN TRÁI** trên thẻ CCCD $\to$ nốt ruồi **BÊN PHẢI** trên clip Zalo; ánh mắt Nam mở trừng khi ghép xong mảnh ghép sự thật. |
| **P3.03_03**<br>Vertigo Chiếc Gương | **True 3D Vertigo Dolly Zoom**, $35\text{mm} \to 85\text{mm}$ | **3D-6** Camera lùi vật lý dọc trục Z đồng thời phóng đại tiêu cự hướng về chiếc gương | Bốn bức tường phòng trọ 3D biến dạng hút dài vào sâu trong bóng tối, biến khung gương gỗ cũ kỹ thành cánh cổng không đáy. |
| **P3.04_01–04**<br>Đối chất vác búa | **180° Dolly Orbit quanh trục gương & Floor Impact**, 35mm/50mm + Dutch $12^\circ$ | **3D-2** + **3D-3** Trượt vòng cung ngang mép kính gương lúc Người Kia giơ tay trái đỡ đầu búa | Góc máy vượt qua đường biên giữa phòng thật và hình phản chiếu: Thấy rõ đầu búa nặng dừng khựng trong lòng **TAY TRÁI** Người Kia; khi Người Kia bóc trần bản chất, Nam buông búa $\to$ Floor-Level bắt trọn chiếc búa rơi cộp sát ống kính. |
| **P3.05_01–03**<br>Mặt kính hóa nước | **Submersion 3D Shot (Từ BÊN TRONG mặt kính hóa nước nhìn ra)**, 35mm/65mm | **3D-6** Liquid Glass Displacement Shader + Chromatic Aberration xanh buốt | **Cú máy đắt nhất phim:** Camera 3D đặt lùi bên trong Thế giới Gương nhìn xuyên qua mặt nước kính đang gợn sóng lăn tăn: thấy bàn tay và thân thể Nam chìm dần xuyên qua làn nước lạnh buốt trôi vào vực thẳm câm lặng rồi mặt nước phẳng lặng đóng băng lại. |
| **P3.06_01–04**<br>Kết phim Quiet Horror | **Rack Focus OTS & Closing Latch Darkening Shot**, 35mm $\to$ 85mm | **3D-5** + Chiaroscuro Lighting cắt nửa khuôn mặt | Tùng xách bún chả vào $\to$ Rack Focus từ nét mặt Tùng khựng lại sang **tay trái Người Kia cầm đũa & nốt ruồi bên phải** $\to$ Camera lùi ra ngoài khe cửa khi tay trái Người Kia đẩy then sắt *"CẠCH"* khép khe sáng cuối cùng che khuất 50% khuôn mặt trong bóng tối, thì thầm: *"Mày nhìn nhầm rồi... Tao là Nam mà"*. Cut to Black. |

## Ánh sáng, âm và nhịp nối

- **Sáng:** Area Light cửa sổ là nguồn chính, phòng đủ sáng tự nhiên để đọc mặt và đường thoát.
- **Làm bài → game:** di chuyển góc chiếu mặt trời (Sun Angle) qua cửa sổ 3D và chuyển nhiệt độ màu từ trắng trưa sang vàng cam chiều tà.
- **Tối:** khoảng 19h30; nguồn sáng chính ban đêm gồm ánh sáng xanh lạnh màn hình laptop (`LAPTOP_LIGHT`) kết hợp đèn bàn `3200K`; giữ sắc da sống của Nam để tương phản với làn da lạnh của Người Kia.
- **Cắt:** ưu tiên cắt theo ánh mắt (Eyeline Match), chuyển động vật lý (Action Match) hoặc giữ nhịp dài Steadicam/Arc 3D để tăng áp lực tâm lý thật.
- **Chữ UI:** giữ lớp màn hình điện thoại/laptop dưới dạng Texture phát sáng rõ nét trong không gian 3D, đồng bộ qua bước compositing cuối trong Remotion cùng `CinematicGradeOverlay`.

## Chuẩn bị asset và kiểm tra trước khi dựng dài

Đọc bảng kê tổng duyệt tiền kỳ chi tiết tại **[CHECKLIST-TIEN-KY-ASSET.md](CHECKLIST-TIEN-KY-ASSET.md)** (phần nghiệm thu theo dõi **Full 3D Assets**: Nhân vật 3D, Rig IK/FK, Blendshapes 3 cấp, 6 Bối cảnh 3D 360°, Planar Reflection Mirror Shader và Đạo cụ 3D).

1. **Dựng đủ không gian 360°:** Phòng trọ 3D, Hành lang tầng 2, Giảng đường và Thế giới Gương phải dựng kín 4 tường + trần (cho phép tháo trần khi quay Top-Down $90^\circ$) và hành lang kéo dài để Steadicam chạy mượt không bị hở mép.
2. **Khóa tiếp xúc vật lý (Zero Clipping):** Kiểm tra kỹ Bone Constraints khi cầm búa đinh, cầm điện thoại, kéo ghế 4 chân trên sàn và đẩy then sắt cửa 3D.
3. **Kiểm tra Shader chiếc gương:** Thử nghiệm trước Planar Reflection tách biệt pose giữa Nam và Người Kia, cùng chuyển tiếp Liquid Glass Shader ở P3.05 để đảm bảo không lỗi phản chiếu chữ/nốt ruồi.
4. **Quy trình hai bước:** render storyboard và animatic/playblast từ nguồn Blender hiện hành, duyệt nhịp/tiếp xúc rồi mới render cuối; không dùng demo SVG cũ làm bản production.

Nguồn nguyên tắc nội bộ: [Quy chuẩn sản xuất 3D](../../../docs/QUY-CHUAN-3D.md), [hướng dẫn 3D hiện hành](../../../docs/NGON-NGU-DIEN-ANH-3D.md), [quy trình duyệt hình](../../../docs/WHAT-IF-QUY-TRINH.md).

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
