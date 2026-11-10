# Bảng Kê Tổng Duyệt Asset Tiền Kỳ (Pre-Production Breakdown Sheet)
## The Crack in Reality — Hồ sơ 02: Người trong gương

> **Mục đích tài liệu:** Bảng kiểm tra toàn diện (Checklist) dành cho Đạo diễn, Họa sĩ vẽ Background, Rigging Artist và Animator trước khi tiến hành dựng cảnh (Staging) và Render phim hoạt hình điện ảnh 15 phút.
> **Quy chuẩn mỹ thuật:** Style B (Đường nét cong mềm, không viền ngoài, tách khối bằng mảng sáng–tối tự vẽ, ánh sáng Chiaroscuro David Fincher, tỉ lệ điện ảnh 2.39:1).

---

## 1. Danh mục Bối cảnh (Sets & Environments)

Tất cả bối cảnh được thiết kế ở định dạng **2.39:1 Anamorphic Canvas** (hoặc 16:9 với vùng an toàn cho letterbox), bóc tách thành các lớp độc lập để chạy Parallax và Camera Depth.

| STT | Tên bối cảnh & Mã cảnh | Trục nhìn / Góc máy chính | Trạng thái ánh sáng & Thời gian | Các lớp bóc tách bắt buộc (Layers) | Ghi chú mỹ thuật & Trọng tâm |
|:---:|---|---|---|---|---|
| **S01** | **Phòng trọ — Sáng sớm**<br>*(P1.01–P1.08, P2.03)* | `VIEW_WIDE_A`<br>Toàn phòng nhìn chéo từ nệm sang bếp & cửa chính. | **Sáng sớm (06:30 - 07:15)**<br>Ánh nắng xiên xanh lơ lạnh pha vàng nhạt hắt qua khe rèm cửa sổ. | • `FORE`: Mép nệm, góc dép lê.<br>• `MID`: Nệm ngủ, ghế 4 chân, bàn học, tủ quần áo, bồn rửa.<br>• `BACK`: Mảng tường rêu ẩm mốc, khung cửa ra vào, đồng hồ treo tường.<br>• `SKY`: Phố xá mờ ảo ngoài cửa sổ. | Sàn nhà sạch sẽ, chăn gối hơi xộc xệch. Nguồn sáng tự nhiên từ cửa sổ là chủ đạo. |
| **S02** | **Phòng trọ — Bàn học ngày**<br>*(P1.05, P2.04)* | `VIEW_DESK_DAY`<br>Cận vừa góc bàn học, tủ quần áo cạnh bàn. | **Ban ngày gắt (11:30 - 14:00)**<br>Vệt nắng hình chữ nhật chiếu thẳng vào mặt bàn và bàn phím. | • `FORE`: Cạnh trước mặt bàn gỗ ép.<br>• `MID`: Laptop Asus/Dell, đèn bàn tắt, cốc nước đá tan chảy mồ hôi, ghế ngồi.<br>• `BACK`: Khung tủ quần áo, tường loang lổ. | Thể hiện sự ngột ngạt, bí bách của Nam khi vật lộn với bài tập lớn. |
| **S03** | **Phòng trọ — Chiều tà**<br>*(P1.07)* | `VIEW_SUNSET`<br>Cùng góc toàn phòng A. | **Hoàng hôn (17:30 - 18:15)**<br>Nắng cam thẫm (Golden Hour) trườn từ mép bàn sang nệm rồi rút dần lên trần. | • `LIGHT_LAYER`: Vệt sáng cam tách rời để animate dịch chuyển độ dài và giảm opacity khi trời tối. | Đánh dấu sự chuyển dịch thời gian khi Nam cày game quên học. |
| **S04** | **Phòng trọ — Đêm Fincher**<br>*(P1.08, P2.01, P2.05, P3.03)* | `VIEW_DESK_NIGHT`<br>`VIEW_ROOM_NIGHT`<br>Góc bàn và toàn phòng đêm. | **Đêm Chiaroscuro (19:30 - 23:00)**<br>Phòng tối om; chỉ có 2 nguồn sáng thực (Motivated Light): Đèn bàn vàng ấm 3200K và Màn hình laptop xanh lạnh 6500K. | • `FORE`: Mép bàn hắt sáng, bóng lưng người ngồi.<br>• `MID`: Bàn phím sáng đèn LED, ghế xoay lùi.<br>• `BACK`: Vùng tối sâu (Crushed Blacks), bóng đổ sắc nét trên tường.<br>• `LIGHT`: Volumetric Cone của đèn bàn. | Phong cách điện ảnh David Fincher: Tương phản gắt gao giữa vùng sáng rọi và bóng tối bao trùm. |
| **S05** | **Góc cửa chính & Then sắt**<br>*(P1.03, P1.06, P2.01, P3.06)* | `VIEW_DOOR_LOCK`<br>Chính diện hoặc góc xiên $45^\circ$ vào ổ then cài cửa. | Ban ngày & Đêm đèn tuýp hành lang. | • `FORE`: Bàn tay thao tác.<br>• `MID`: Cánh cửa gỗ dán, then sắt trượt, tai khóa.<br>• `BACK`: Khe cửa hé lộ hành lang mờ ảo. | Then sắt phải có 2 trạng thái vật lý rõ rệt: Rút then (mở) và Gài chốt (khóa đanh). |
| **S06** | **Hành lang dãy trọ tầng 2**<br>*(P1.03, P1.06, P2.01)* | `VIEW_HALLWAY`<br>Nhìn dọc hành lang, lan can sắt bên phải, cửa các phòng bên trái. | **Đêm đèn tuýp (Night Fluorescent)**<br>Bóng đèn tuýp dài vàng vọt, ánh sáng lập lòe, sương ẩm đêm. | • `FORE`: Khung cửa phòng Nam.<br>• `MID`: Hành lang gạch men bạc màu, bậc cầu thang.<br>• `BACK`: Hút sâu hun hút vào bóng tối cuối dãy trọ. | Cảm giác rợn ngợp, cô lập. Khi Người Kia bước ra, hành lang phải trống rỗng đến kỳ dị. |
| **S07** | **Góc đồ cho tặng (Nơi chiếc gương)**<br>*(P1.00 - Hồi tưởng)* | `VIEW_DONATION_CORNER`<br>Góc chân cầu thang dãy trọ. | Chiều muộn ẩm ướt sau cơn mưa. | • `MID`: Đống đồ cũ (ghế gãy, chậu hoa vỡ, bạt nhựa), Chiếc gương gỗ cũ bám bụi tựa góc tường. | Nhãn dán bìa các-tông viết tay: *"Góc đồ cho tặng - Ai cần thì lấy"*. |
| **S08** | **Giảng đường đại học lớn**<br>*(P3.01)* | `VIEW_LECTURE_HALL`<br>Từ bục giảng nhìn lên các bậc thang sinh viên & Góc toàn ngang bục giảng. | **Sáng trắng công nghiệp (Cold Neon)**<br>Dàn đèn tuýp trắng chói chang, không có góc khuất nào để trốn. | • `FORE`: Mặt bàn giảng viên, micro cổ ngỗng.<br>• `MID`: Bục giảng gỗ, bảng trượt, bục đứng của Nam.<br>• `BACK`: Màn chiếu slide khổng lồ dày đặc công thức, hàng trăm sinh viên ngồi bậc thang. | Nhấn mạnh sự nhỏ bé, trơ trọi và bị phán xét của Nam trước đám đông. |
| **S09** | **Phòng máy tính Lab 402**<br>*(P2.04)* | `VIEW_LAB_402`<br>Góc chéo bàn máy tính. | Ban ngày ánh sáng văn phòng kết hợp màn hình LCD. | • `FORE`: Bàn phím, chuột máy tính.<br>• `MID`: Màn hình máy tính hiển thị hạn nộp bài tập lớn.<br>• `BACK`: Các dãy bàn sinh viên khác đang thảo luận sôi nổi. | Tạo áp lực thời gian dồn dập (Time pressure). |
| **S10** | **Hành lang trường đại học**<br>*(P3.02)* | `VIEW_CAMPUS_CORRIDOR`<br>Dọc hành lang bê tông nắng gắt. | Nắng trưa gay gắt, bóng đổ vuông vức dưới chân cột. | • `FORE`: Thân cột bê tông Nam nép mình.<br>• `MID`: Tùng và nhóm sinh viên đang bàn tán.<br>• `BACK`: Sân trường nhiều cây xanh. | Tương phản giữa vẻ ngoài rạng rỡ của bạn bè và nỗi nhục nhã của Nam. |
| **S11** | **Mâm cơm gia đình ở quê**<br>*(P2.06 - Clip Zalo)* | `VIEW_FAMILY_MEAL`<br>Góc nhìn qua camera điện thoại (dọc/ngang). | Ánh sáng vàng nắng ban ngày ấm cúng, hoài niệm. | • `FORE`: Chiếu hoa, mâm nhôm tròn sáng bóng.<br>• `MID`: Đĩa nem rán, bát canh cua, mẹ và bác Hai đang cười tươi gắp thức ăn.<br>• `BACK`: Tường nhà gạch vôi thân thương ở quê. | Sự ấm áp của gia đình vô tình cứa nhát dao chí mạng vào lương tri của Nam. |
| **S12** | **Thế giới bên trong gương (Mirror Realm)**<br>*(P3.05, Trailer)* | `VIEW_MIRROR_VOID`<br>Phòng trọ đảo ngược đối xứng hoàn toàn ($180^\circ$ Horizontal Flip). | **Deep Teal Abyss (Vực thẳm xanh thẫm)**<br>Không gian chìm trong bóng tối vô tận, mặt sàn hóa thành mặt nước phẳng lặng phát sáng lân tinh. | • `FORE`: Gợn sóng nước lăn tăn phản chiếu.<br>• `MID`: Khung chiếc gương lơ lửng, Nam đang chìm dần.<br>• `BACK`: Bóng tối thăm thẳm không lối thoát. | Cảm giác lạnh buốt, cô độc tuyệt đối và câm lặng (Zero Sound Void). |

---

## 2. Danh mục Đồ vật & Đạo cụ (Props Breakdown)

Từng đạo cụ phải có điểm neo khớp (`gripAt`), hướng cầm rõ ràng và trạng thái vật lý chân thực.

### A. Đạo cụ tương tác cốt truyện (Hero Interactive Props)

| STT | Tên đạo cụ | File Component / SVG | Điểm neo khớp & Hướng tay | Các trạng thái trực quan bắt buộc | Cảnh sử dụng |
|:---:|---|---|---|---|:---:|
| **P01** | **Chiếc gương soi toàn thân**<br>*(The Mirror)* | `guong-trang-thai-*.svg`<br>`MirrorPortal.tsx` | Đứng tựa tường góc phòng / Lơ lửng khi hóa dị | **4 trạng thái biến dị:**<br>1. *Khung gỗ cũ, kính sáng phẳng, vết nứt nhỏ góc phải*.<br>2. *Mặt kính mờ sương, bóng Người Kia không trùng động tác*.<br>3. *Mặt kính gợn sóng lỏng (Water surface ripple)*.<br>4. *Mặt kính hóa lỏng trong suốt nuốt chửng Nam*. | P1.00, P2.04, P2.06, P3.03, P3.04, P3.05 |
| **P02** | **Chiếc búa đinh cán gỗ** | `bua-dong-dinh.svg`<br>`Hammer.tsx` | Điểm neo chuôi cán `(0, 0)`.<br>Nam cầm 2 tay / Người Kia đỡ bằng tay trái. | • Cán gỗ sờn mòn vân tự nhiên, đầu búa sắt đúc xám chì có vết rỉ nâu.<br>• Trọng lượng cảm giác đầm nặng ($1.2\text{kg}$), rơi xuống sàn có tiếng cộp vang đanh. | P3.03, P3.04, P3.05 |
| **P03** | **Thẻ Căn cước công dân** | `the-doi-chieu.svg`<br>`CitizenCard.tsx` | Kẹp giữa ngón cái và ngón trỏ tay trái/phải. | • Thẻ nhựa chip điện tử hư cấu, có ảnh chân dung Nam với **nốt ruồi đuôi lông mày bên trái**.<br>• Chi tiết chữ sắc nét, không bị nhòe khi zoom cận cảnh. | P1.04, P3.03 |
| **P04** | **Thẻ sinh viên Đại học** | `the-sinh-vien.svg`<br>`StudentCard.tsx` | Nam đưa bằng tay phải, Người Kia nhận bằng **tay trái**. | • Thẻ đeo dây xanh navy, logo trường đại học, ảnh chụp nghiêm túc. | P2.04, P3.03 |
| **P05** | **Then sắt cài cửa** | `goc-cua-va-chot.svg`<br>`DoorLatch.tsx` | Bám trên khung cửa gỗ, ngón tay gạt chốt. | **2 trạng thái:**<br>1. *Chốt rút ngang (Mở hờ/Khép chưa khóa)*.<br>2. *Lưỡi chốt tra sâu vào lỗ đón then trên khung sắt (Khóa đanh)*. | P1.03, P1.06, P2.01, P3.06 |
| **P06** | **Phong bì tiền ăn 3 triệu** | `phong-bi-tien-an.svg` | Kẹp trên mặt bàn / Cầm mép phong bì. | • Phong bì giấy trắng nhăn mép, thò ra 6 tờ tiền polyme màu xanh 500.000đ. | P2.03 |
| **P07** | **Bát sứ & Đũa bồn rửa** | `goc-bep-bon-rua.svg` | Người Kia rửa bằng **tay trái**, úp lên giá bát. | • Bát sứ trắng viền hoa xanh cũ, bọt xà phòng bám viền, giọt nước rỏ tí tách. | P1.01, P1.02 |
| **P08** | **Hộp cơm sườn trứng ốp la** | `com-suon-trung.svg` | Tùng xách túi ni-lông đặt cộp xuống bàn. | • Hộp xốp/giấy trắng, miếng sườn nướng cháy cạnh, trứng ốp la lòng đào vàng ươm, mỡ hành xanh. | P2.02 |
| **P09** | **Bọc bún chả & Nem rán** | `bun-cha-nem.svg` | Tùng xách về ở cảnh kết, cầm hộp nước mắm. | • Túi bún tươi trắng, hộp thịt nướng than hoa sém cạnh, chả nem giòn rụm, bát nước mắm cà rốt ớt đỏ. | P3.06 |
| **P10** | **Gói xôi gấc lá chuối** | `xoi-gac.svg` | Người Kia xách về đặt trên bàn, Nam hất tung. | • Xôi đỏ thắm bọc trong tàu lá chuối hơ lửa, kèm miếng giò lụa thái vát. | P2.07 |
| **P11** | **Túi hoa quả biếu** | `tui-hoa-qua.svg` | Người Kia cầm xách bằng tay trái. | • Túi quà quả cam vàng, táo đỏ đóng gói cẩn thận. | P2.05 |
| **P12** | **Viên phấn giảng đường** | Props nhỏ | Nam cầm trên bục giảng, tay run bẻ gãy vụn. | • Viên phấn trắng gãy đôi, bột phấn rơi lả tả xuống sàn gỗ. | P3.01 |

### B. Đạo cụ công nghệ & Màn hình hiển thị (Tech & Screen UI)

Tất cả màn hình UI đều được thiết kế ở layer riêng biệt, sắc nét, có thể chèn hiệu ứng quét sọc CRT hoặc phản quang kính điện thoại.

| Mã UI | Tên giao diện | Kích thước chuẩn | Nội dung hiển thị bắt buộc | Cảnh sử dụng |
|:---:|---|---|---|:---:|
| **UI-01** | **Báo thức reo 06:30** | $312 \times 520\text{px}$ | Đồng hồ số to bản `06:30`, nút gạt "Dừng / Báo lại", thanh rung viền đỏ. | P1.01, P2.05 |
| **UI-02** | **Chế độ Không làm phiền** | $312 \times 520\text{px}$ | Icon vầng trăng khuyết tím rực rỡ, thanh gạt chuyển từ Xám sang Xanh/Tím. | P1.07, P1.08 |
| **UI-03** | **Nhóm Zalo: Deadline & Lời khen** | $312 \times 520\text{px}$ | Tin nhắn của Trưởng nhóm: *"U là trời! Đoạn mở đầu Nam viết đỉnh chóp thế! Ghép slide luôn đây..."*. | P2.01 |
| **UI-04** | **Bảng điểm 9.5 bùng nổ** | $312 \times 520\text{px}$ | Thông báo cổng đào tạo đại học: Môn *Kiến trúc máy tính & Thuật toán*, Cột điểm Thuyết trình: **9.5 (A+)**. | P2.05 |
| **UI-05** | **Cuộc gọi & Tin nhắn Mẹ** | $312 \times 520\text{px}$ | Tên người gọi: `Mẹ yêu`, avatar mẹ tươi cười. Tin nhắn ngân hàng: *"TK ... +3,000,000VND - Me chuyen tien an thang nay"*. | P2.05 |
| **UI-06** | **Video Clip Zalo gia đình** | $16:9\text{ crop}$ trong UI | Khung video clip quay bàn ăn quê: Người Kia ngồi gắp thức ăn cho mẹ bằng **tay trái**, nốt ruồi lộ rõ **bên phải**. | P2.06, P3.03 |
| **UI-07** | **Màn hình Laptop bài tập lớn** | $1920 \times 1080\text{px}$ | Giao diện Word: 10 trang slide học thuật, biểu đồ luồng phức tạp, font chữ format chuẩn mực. | P1.08, P2.01 |

---

## 3. Danh mục Dáng nhân vật & Tư thế Rig (Character Poses & Stances)

Dựa trên rig chuẩn của Style B (`nhan-vat.tsx`), kết hợp các điểm neo tiếp xúc vật lý (`support`, `gripAt`).

### A. Nhân vật Nam (Sinh viên — Sa sút & Bi kịch)

| Mã Pose | Tên tư thế | Điểm tì đỡ / Tiếp xúc | Khối cơ thể & Hướng nhìn | Diễn hoạt & Trạng thái cảm xúc |
|:---:|---|---|---|---|
| `NAM_P01` | **Nằm ngủ ngái ngủ** | Lưng & đầu trên nệm gối, chăn đắp ngang bụng. | Thân nghiêng nhẹ, mặt quay góc $3/4$, chân co chân duỗi. | Mí mắt nhắm nghiền, miệng hé ngáy nhẹ, một tay thò ra ngoài nệm. |
| `NAM_P02` | **Bật dậy co rúm** | Mông chạm mép nệm, hai bàn chân xỏ vội dép lê. | Lưng còng gập về trước, hai bàn tay nắm chặt mép chăn thủ thế. | Mắt mở trừng trừng, con ngươi co nhỏ kinh hãi khi thấy bản sao. |
| `NAM_P03` | **Lùi va ghế đứng dậy** | Chân trái trụ, đầu gối phải đập vào cạnh ghế gỗ. | Thân ngả ra sau mất thăng bằng, tay phải vơ lấy điện thoại. | Cú va vật lý dứt khoát, miệng há hốc không thốt nên lời. |
| `NAM_P04` | **Gài then sắt cửa** | Hai chân đứng vững trước ngưỡng cửa gỗ. | Tay trái ấn mạnh thanh trượt then sắt, tay phải ghì chặt điện thoại trước ngực. | Vai gồng căng, tai áp sát cánh cửa nghe ngóng ra hành lang. |
| `NAM_P05` | **Còng lưng cày game** | Ngồi bệt hoặc nằm nghiêng co chân trên nệm. | Hai tay giơ ngang mặt giữ điện thoại nằm ngang, ngón cái bấm lia lịa. | Mắt dán chặt màn hình, lưng gù xuống, lông mày nhíu chặt cay cú vì thua rank. |
| `NAM_P06` | **Thị uy làm ông chủ** | Đứng thẳng trước bàn học, chân đứng nghiêm. | Tay phải đập mạnh xuống mặt bàn / Chỉ tay thẳng vào mặt Người Kia. | Cố gồng nét mặt hung dữ để che đậy nỗi sợ và tự ti bên trong. |
| `NAM_P07` | **Tập nói trước gương** | Đứng đối diện chiếc gương gỗ cách 60cm. | Tay cầm cuốn sách mở toang, vai so lên rụt rè. | Miệng mấp máy lí nhí, ánh mắt đảo liên hồi, tự vỗ trán bế tắc. |
| `NAM_P08` | **Bục giảng hoảng loạn** | Đứng trên bục giảng gỗ, hai chân run lẩy bẩy. | Hai tay buông thõng run rẩy, một tay cầm mẩu phấn gãy đôi. | Mồ hôi vã như tắm chảy dài hai thái dương, mặt tái mét cúi gằm trước 100 sinh viên. |
| `NAM_P09` | **Vác búa đối chất** | Đứng thủ thế chân trước chân sau, gót chân ghì sàn. | Hai bàn tay nắm chặt chuôi búa đinh nâng ngang ngực, cơ bắp căng cứng. | Răng cắn chặt run rẩy, nước mắt ứa ra vì uất ức và hoảng loạn tột cùng. |
| `NAM_P10` | **Suy sụp buông xuôi** | Hai đầu gối khuỵu hẳn xuống sàn nhà lạnh lẽo. | Hai tay buông rơi búa đinh (búa rơi cách tay 20cm), hai bàn tay chống sàn rã rời. | Cổ gục xuống, mắt vô hồn nhìn vào hư không, ý chí chiến đấu bị bẻ gãy hoàn toàn. |
| `NAM_P11` | **Chạm tay hóa lỏng** | Thân người rướn về phía trước mặt kính gương. | Lòng bàn tay và các đầu ngón tay ấn vào mặt kính đang gợn sóng nước. | Cơ thể dần bị hút xuyên qua lớp màng nước phát quang xanh buốt. |

### B. Nhân vật Người Kia (Kẻ trong gương — Nghịch đảo & Lạnh lùng)

> **Nguyên tắc sinh học bắt buộc:** Tất cả hành động của Người Kia phải thể hiện tính **thuận tay trái** và **nốt ruồi đối xứng bên phải** đuôi mày.

| Mã Pose | Tên tư thế | Điểm tì đỡ / Tiếp xúc | Khối cơ thể & Hướng nhìn | Diễn hoạt & Trạng thái cảm xúc |
|:---:|---|---|---|---|
| `GUE_P01` | **Quay lưng rửa chén** | Đứng thẳng trước bồn rửa bát, hai chân cân bằng. | Thân trên hơi cúi, hai tay cọ rửa trong bồn (bàn tay trái cầm miếng rửa). | Động tác cơ học đều đặn, không phát ra tiếng động thừa thãi. |
| `GUE_P02` | **Ngoảnh đầu $90^\circ$** | Chân giữ nguyên vị trí trước bồn rửa. | Thân xoay nhẹ, đầu ngoảnh sang vai nhìn thẳng vào Nam. | Ánh mắt trong veo, không chớp, nụ cười nhẹ lịch sự không chút biểu cảm (`calm`). |
| `GUE_P03` | **Ngồi thẳng lưng gõ phím** | Ngồi ghế 4 chân, lưng thẳng góc $90^\circ$ với mặt ghế. | Hai bàn tay lướt như múa trên bàn phím laptop, cùi chỏ vuông vức. | Tốc độ gõ phím cực nhanh và chính xác, mắt quét màn hình liên tục. |
| `GUE_P04` | **Chờ đợi lịch thiệp** | Ghế lùi cách bàn 40cm, hai chân khép song song. | Hai bàn tay úp ngay ngắn trên hai đùi, đầu hơi cúi cung kính. | Tĩnh lặng tuyệt đối như một bức tượng, không cựa quậy hay rung chân. |
| `GUE_P05` | **Đỡ đầu búa đinh** | Đứng vững vàng, không hề lùi bước trước Nam. | Bàn tay trái giơ lên ngang ngực, 5 ngón tay đón lấy đầu búa sắt một cách nhẹ nhàng. | Nét mặt thấu suốt, ánh mắt thương hại nhìn Nam giãy giụa trong bất lực. |
| `GUE_P06` | **Gài then sắt kết phim** | Đứng bên trong phòng trọ nhìn ra khe cửa với Tùng. | Cánh tay trái vươn ra gài thanh then sắt kêu đanh gọn *"CẠCH"*. | Khóe môi khẽ nhếch một nụ cười bí hiểm, nửa mặt chìm trong bóng tối Chiaroscuro. |

### C. Nhân vật Tùng (Bạn cùng phòng — Năng động & Nghi hoặc)

| Mã Pose | Tên tư thế | Điểm tì đỡ / Tiếp xúc | Khối cơ thể & Hướng nhìn | Diễn hoạt & Trạng thái cảm xúc |
|:---:|---|---|---|---|
| `TUNG_P01` | **Xách cơm đá cửa** | Chân phải đá nhẹ mép cửa khép lại. | Tay xách túi hộp cơm sườn bốc khói, vai đeo balo thể thao số 7. | Vẻ mặt hồ hởi, cười tươi nói lớn trêu bạn. |
| `TUNG_P02` | **Thất vọng khoanh tay** | Đứng tựa lan can hành lang đại học. | Hai tay khoanh trước ngực, đầu lắc nhẹ sang bên. | Ánh mắt nhìn Nam tràn ngập sự khó hiểu và ngao ngán khi thấy bạn tụt dốc. |
| `TUNG_P03` | **Khựng lại hoài nghi** | Ngồi mép bàn/ghế, tay cầm đôi đũa chuẩn bị ăn bún chả. | Đôi đũa dừng lơ lửng giữa không trung, mắt nheo lại dán chặt vào mặt Người Kia. | Cơ mặt đanh lại, sự chột dạ dâng lên khi nhận ra dấu nốt ruồi bị đảo bên. |

### D. Các nhân vật phụ (Supporting Cast)

| Nhân vật | Mã Pose | Mô tả tạo hình & Tư thế | Đạo cụ đi kèm |
|---|---|---|---|
| **Giảng viên khó tính** | `GV_P01` | Nam trung niên, đeo kính gọng vuông, mặc sơ mi xám thắt cà vạt. Đứng gõ thước côm cốp xuống bàn, nhíu mày nghiêm khắc. | Cây thước gỗ chỉ bảng, giáo trình dày cộp. |
| **Mẹ của Nam (Video call)** | `ME_P01` | Người phụ nữ trung niên đôn hậu, tóc búi sau gáy, áo hoa giản dị. Nét mặt tươi cười rạng rỡ, ánh mắt yêu thương nhìn vào camera. | Đĩa xôi / Bát canh dọn cơm ở quê. |
| **Bác Hai** | `HAI_P01` | Người bác họ ở quê, áo sơ mi cộc tay, đang nâng chén nước trà khen ngợi Nam chững chạc. | Chén nước chè xanh. |
| **Sinh viên giảng đường** | `SV_P01` / `SV_P02` | Hai sinh viên nam/nữ ngồi hàng ghế dưới, nghiêng đầu thì thầm to nhỏ, cười khúc khích khi Nam đứng hình. | Vở ghi chép, bút bi. |

---

## 4. Bảng Ma Trận Biểu Cảm 3 Cấp Độ (3-Level Emotion Matrix)

Để đảm bảo diễn xuất nhân vật chân thực như phim người đóng, mọi cảm xúc không được vẽ cố định mà chuyển biến theo 3 cấp độ tinh tế:

| Nhóm cảm xúc | Cấp độ 1: Thoáng qua (Subtle) | Cấp độ 2: Rõ nét (Pronounced) | Cấp độ 3: Cực điểm (Extreme Peak) |
|---|---|---|---|
| **Ngái ngủ $\to$ Kiệt sức** | Mí mắt hơi sụp, ánh nhìn chậm chạp chớp mắt ngắt quãng. | Bọng mắt thâm quầng xám tím, khóe miệng trễ sâu, đầu gục xuống. | Mắt trũng sâu vô hồn, da mặt xám xịt tái nhợt, thở hắt ra từng hơi buông xuôi hoàn toàn. |
| **Tự ái $\to$ Thị uy** | Đầu lông mày hơi nhướn, môi bặm lại tỏ vẻ không phục. | Lông mày cau lại bất đối xứng, mắt nhìn xéo giận dữ, cằm hất lên. | Răng cắn chặt lộ ra, tĩnh mạch thái dương giật nhẹ, mặt đỏ bừng gào thét. |
| **Hoảng loạn $\to$ Kinh hoàng** | Đồng tử khẽ giật mở rộng, hơi thở khựng lại 1 nhịp. | Mắt mở trừng to, con ngươi co nhỏ lại giữa tròng trắng, miệng há hốc. | Cơ mặt co rúm méo mó, mồ hôi vã từng giọt dài, hai hàm răng va vào nhau lập cập. |
| **Người Kia: Điềm tĩnh $\to$ Săn mồi** | Ánh mắt thẳng thắn, không chớp, môi giữ đường ngang bình thản (`calm`). | Khóe môi khẽ nhếch lên $1\text{mm}$, ánh mắt thấu suốt tâm can (`neutral_smile`). | Nụ cười nhếch nửa miệng sắc lạnh như lưỡi dao cạo, ánh mắt sâu thẳm đen ngòm (`eerie_smirk`). |

---

## 5. Danh Sách Kiểm Tra Sẵn Sàng Tiền Kỳ (Pre-Flight Readiness Checklist)

Trước khi kích hoạt render bất kỳ shot nào, Animator cần tick đủ 6 tiêu chí kỹ thuật:

- [ ] **1. Đồng bộ Nốt Ruồi (Mole Continuity)**: Kiểm tra 100% khung hình có Nam (nốt ruồi luôn ở **bên trái** đuôi mày theo hướng nhìn máy quay) và Người Kia (luôn ở **bên phải**).
- [ ] **2. Đồng bộ Tay Thuận (Handedness Continuity)**: Người Kia rửa bát, nhận thẻ, nhấc búa, cài then **100% bằng tay trái**.
- [ ] **3. Trạng thái Then Cửa (Door Latch State)**: P1.03 gài chốt $\to$ P1.06 rút chốt $\to$ P1.06 về khép quên gài (chốt vẫn rút) $\to$ P2.01 gài chốt $\to$ P3.06 Người Kia gài chốt.
- [ ] **4. Điểm tì đỡ Vật lý (Support Grounds)**: Không có nhân vật trôi nổi trong không trung; bàn chân phải tiếp xúc mặt sàn (`floor`), mông tiếp xúc nệm (`bed`) hoặc ghế (`chair`).
- [ ] **5. Ánh sáng Motivated Lighting**: Vùng sáng rọi của đèn bàn và laptop phải đổ bóng đúng hướng đối diện trên tường và sàn nhà.
- [ ] **6. Âm thanh Nguồn (Motivated Sound)**: Mọi tiếng rơi (búa, đũa, then cài, bát sứ) phải khớp frame với điểm tiếp xúc vật lý trên hình ảnh.
- [ ] **7. Lớp phủ hòa sắc điện ảnh (Cinematic Grade Overlay)**: Áp dụng component `CinematicGradeOverlay` với `mix-blend-mode: soft-light`, opacity nhẹ $8\% - 14\%$ theo đúng mood của từng phân đoạn (`morning`, `fincher_night`, `mirror_realm`), bảo vệ 100% màu da nhân vật.

> Bảy tiêu chí trên được kiểm tra **cho từng shot khi dựng**, không phải asset. Chưa tick vì chưa có shot nào qua bước render.

---

## 6. Quy Chuẩn Lớp Phủ Hòa Sắc Điện Ảnh (Cinematic Color Grading)

Áp dụng component `CinematicGradeOverlay` (`what-if-studio/src/engine/CinematicGradeOverlay.tsx`) trên đỉnh khung hình:

| Phân đoạn & Cảnh | Mood Preset | Tone màu chủ đạo | Chế độ hòa trộn & Opacity | Hiệu quả thị giác |
|---|---|---|---|---|
| **Sáng sớm (P1.01–P1.04, P2.03)** | `morning` | `#1a2b3c` (Xanh lơ lạnh) | `soft-light`, $8\%$ | Tươi tắn nhưng lạnh, cảm giác ngái ngủ đầu ngày. |
| **Trưa gắt (P1.05, P2.04)** | `noon_harsh` | `#2e2518` (Vàng mù tạt) | `soft-light`, $9\%$ | Ngột ngạt, bí bách, áp lực deadline bài tập lớn. |
| **Chiều tà (P1.07)** | `sunset_golden` | `#3d200a` (Cam thẫm) | `soft-light`, $12\%$ | Golden hour buông thả, thời gian trôi nhanh khi cày game. |
| **Đêm phòng trọ (P1.08, P2.01, P2.05, P3.03)** | `fincher_night` | `#0d1f18` (Xanh rêu đen) | `soft-light`, $12\%$ | Đậm chất Chiaroscuro David Fincher, rùng rợn, bí ẩn. |
| **Đại giảng đường (P3.01)** | `lecture_cold` | `#16252b` (Trắng lạnh công nghiệp) | `soft-light`, $10\%$ | Lạnh lùng, trơ trọi, cô lập trước đám đông phán xét. |
| **Cõi hư vô gương (P3.05, Trailer)** | `mirror_realm` | `#051824` (Deep Teal Abyss) | `color`, $18\%$ | Vực thẳm không đáy, vô thực, câm lặng tuyệt đối. |

### Cách Dùng Nhanh Khi Dựng Video (Quick Integration Guide)

Trong bất kỳ Composition, Scene hoặc Shot nào của Remotion, Animator chỉ cần import từ engine và đặt component này ở lớp trên cùng của khung hình:

```tsx
import React from 'react';
import { CinematicGradeOverlay } from '../../../../what-if-studio/src/engine';
// hoặc nếu đang ở trong what-if-studio/src: import { CinematicGradeOverlay } from './engine';

export const SceneDemo: React.FC = () => {
  return (
    <div style={{ position: 'relative', width: 1920, height: 1080, overflow: 'hidden' }}>
      {/* 1. Các layer bối cảnh nền, nhân vật, animation, đạo cụ... */}
      <RoomBackground view="desk" />
      <NamCharacter pose="desk_slump" />

      {/* 2. Lớp phủ hòa sắc điện ảnh tự động (Tự có tone màu, hạt phim 35mm và vignette) */}
      <CinematicGradeOverlay mood="fincher_night" vignetteStrength={0.45} />
    </div>
  );
};
```

## 7. Tiến độ asset (rà ngày 11/11/2026)

Đánh dấu `[x]` khi đã có bản tĩnh dùng được trong repo. Dáng mới chỉ được duyệt bằng ảnh tĩnh, chưa kiểm chứng chuyển động. Đường dẫn tính từ `assets/`.

### Bối cảnh
Các bối cảnh `bo-sung-15p` dựng bằng mô hình 3D theo cm ([`kit3d.tsx`](assets/bo-sung-15p/kit3d.tsx)), mỗi cảnh có bốn góc `view` (`chinh · nguoc · cheo · cao`). Bản bổ sung 11/11/2026 còn chờ chủ repo duyệt. Chưa có: tách lớp FORE/MID/BACK để chạy parallax, khung 2.39:1; hiện tại mỗi cảnh xuất một khối chung 16:9, chuyển động máy làm bằng camera 3D.
- [x] S01 Phòng trọ sáng sớm: `boi-canh/boi-canh.tsx` `RoomMorning`
- [x] S02 Bàn học ngày: `StudyCornerMorning`
- [x] S03 Phòng trọ chiều tà *(mới, chờ duyệt)*: `bo-sung-15p` `RoomSunset t={0..1}`, lớp ánh sáng tách riêng `SunsetLight` (`data-layer="LIGHT_LAYER"`). Vệt nắng cam được tính bằng tia qua ô cửa sổ, rơi lên mép bàn, nệm, sàn rồi leo lên tường đối diện và tắt; phòng tối và xanh dần ([bảng](assets/bo-sung-15p/bang-nang-chieu-ta.png))
- [x] S04 Phòng trọ đêm: `RoomNight`, `StudyDeskNight`
- [x] S05 Góc cửa và then sắt: `DoorInside` (`door: 'ajar' | 'latched'`)
- [x] S06 Hành lang dãy trọ: ban ngày dùng `HallwayDoor`, view `corridor`. Bản đêm *(mới, chờ duyệt)*: `DormHallNight`, có cửa phòng 201–205, lan can tường lửng và song sắt, ba đèn tuýp vàng, một bóng chập chờn theo `flicker` 0–1. Có thêm sương ẩm và bậc cầu thang cuối dãy chìm vào bóng tối. Vị trí đứng: `dormSpot()`
- [x] S07 Góc đồ cho tặng *(dựng lại, chờ duyệt)*: `DonationCorner` (thay `GiftCorner`). Đặt ở chân cầu thang tầng trệt, chiều muộn sau mưa, có vũng nước và vệt ẩm. Đồ gồm ghế gãy chân, chậu hoa nứt, đống đồ phủ bạt xanh, gương gỗ bám bụi dựa tường và bìa các-tông viết tay "Góc đồ cho tặng – Ai cần thì lấy". Vị trí đứng: `donationSpot()`
- [x] S08 Giảng đường *(đã bổ sung, chờ duyệt)*: `LectureHall` có năm bậc (mỗi bậc 34 cm), đèn tuýp trắng lạnh phủ trần, bục đứng của Nam và bàn giảng viên đều có micro cổ ngỗng. Màn chiếu slide đầy công thức. `view="nguoc"` nhìn từ bục lên các bậc, sinh viên quay mặt về camera; `cheo` là góc ngang bục giảng
- [x] S09 Lab 402: `ComputerLab`. Màn hình xen kẽ hiện hạn nộp bài tập lớn (`23:59`, đếm ngược `02:14:08`)
- [x] S10 Hành lang đại học: `UniversityCorridor`
- [x] S11 Mâm cơm gia đình *(dựng lại, chờ duyệt)*: `FamilyGathering`. Chiếu hoa cói viền đỏ–xanh, mâm nhôm tròn có canh cua, nem rán, rau luộc, bát cơm, đũa và nồi cơm; cả nhà ngồi bệt. Tường quét vôi bong lộ gạch, có bàn thờ, cửa gỗ mở ra sân nắng. Góc chính đặt như điện thoại cầm tay chĩa xuống mâm
- [x] S12 Thế giới trong gương *(dựng lại, chờ duyệt)*: `MirrorRealm`. Phòng trọ lật ngang hoàn toàn, chìm trong vực xanh thẫm; sàn hóa mặt nước phát sáng lân tinh, phản chiếu mờ căn phòng lật. Có gợn sóng theo `ripple`/`at`, khung gương trôi lơ lửng; người chìm truyền qua `children`, giữa hai lớp nước

### Đạo cụ (`bo-sung-15p/dao-cu.tsx`, bảng `bang-dao-cu`)
- [x] P01 Gương, 4 trạng thái: `Mirror` (`guong-trang-thai-0..3`)
- [x] P02 Búa đinh: `Hammer`
- [x] P03 Thẻ căn cước (hư cấu): `IdentityCard student={false}`
- [x] P04 Thẻ sinh viên: `IdentityCard`
- [x] P05 Then sắt cửa: trong phòng gốc, trạng thái `ajar`/`latched`
- [x] P06 Phong bì tiền ăn: `MoneyEnvelope`
- [x] P07 Bát sứ và bồn rửa: góc bếp phòng gốc và đạo cụ `bowl` của rig
- [x] P08 Cơm sườn trứng: `RiceBox`
- [x] P09 Bún chả và nem: `BunCha`
- [x] P10 Xôi gấc: `XoiGac`
- [x] P11 Túi hoa quả: `FruitBag`
- [x] P12 Viên phấn (nguyên và gãy đôi): `Chalk` *(mới)*

### Màn hình UI (`bo-sung-15p/giao-dien.tsx`, bảng `bang-giao-dien`)
- [x] UI-01 Báo thức: `bao-thuc`
- [x] UI-02 Không làm phiền: `khong-lam-phien` *(mới)*
- [x] UI-03 Nhóm Zalo: `han-bai`. Nội dung đang là lịch họp Lab 402; nếu cần câu khen "đỉnh chóp" thì sửa chữ khi chốt thoại.
- [x] UI-04 Điểm 9.5: `diem-95`
- [x] UI-05 Mẹ gọi và tiền về: `me-goi`, `tien-ve`. Số tiền đã chốt 3.000.000 đ.
- [x] UI-06 Clip gia đình: `clip-gia-dinh`
- [x] UI-07 Laptop bài tập lớn: `LaptopScreen` 1920×1080 *(mới)*

### Dáng nhân vật (`bo-sung-15p/nhan-vat-va-tu-the.tsx` `EXTRA_POSES`, bảng `bang-dang-checklist`)
- [x] NAM_P01 Nằm ngủ: `TWIN_POSES.lie`
- [x] NAM_P02 Bật dậy co rúm: `bat-day` *(mới)*
- [x] NAM_P03 Lùi va ghế: `lui-va-ghe` *(mới)*
- [x] NAM_P04 Gài then: `gai-then` *(mới)*
- [x] NAM_P05 Cày game: `choi-game`, `nam-choi-game`
- [x] NAM_P06 Thị uy: `thi-uy`
- [x] NAM_P07 Tập nói trước gương: `tap-noi` *(mới)*
- [x] NAM_P08 Bục giảng hoảng loạn: `buc-giang` *(mới)*
- [x] NAM_P09 Vác búa: `giu-bua`
- [x] NAM_P10 Quỳ gục: `quy-guc` *(mới; bản ngồi ghế là `suy-sup`)*
- [x] NAM_P11 Chạm tay vào gương: `ap-kinh`
- [x] GUE_P01 Rửa chén: `TWIN_POSES.holdBowl`
- [ ] GUE_P02 Ngoảnh đầu 90°: rig chưa xoay riêng đầu so với thân; làm khi dựng shot P1.02
- [x] GUE_P03 Gõ phím: `TWIN_POSES.type`
- [x] GUE_P04 Chờ đợi: `nk-cho-doi` *(mới)*
- [x] GUE_P05 Đỡ đầu búa: `nk-do-bua` *(mới)*
- [x] GUE_P06 Gài then kết phim: `nk-gai-then` *(mới)*
- [x] TUNG_P01 Xách cơm, đá cửa: `tung-xach-com` *(mới)*
- [x] TUNG_P02 Khoanh tay: `tung-khoanh-tay` *(mới)*
- [x] TUNG_P03 Khựng đũa: `tung-cam-dua` *(mới)*

### Vai phụ (`SupportingActor`, bảng `bang-vai-phu-tu-the`)
- [x] Tạo hình Giảng viên, Mẹ, Bác Hai, Sinh viên nam và nữ (đã có thêm Bố)
- [ ] Dáng riêng GV_P01 (gõ thước), HAI_P01 (nâng chén), SV_P01/02 (thì thầm): hiện chỉ có dáng đứng; làm khi dựng shot

### Biểu cảm
- [x] Ma trận 3 cấp: 6 nhóm × 3 mức (`bang-cam-xuc-01`, `bang-cam-xuc-02`)
