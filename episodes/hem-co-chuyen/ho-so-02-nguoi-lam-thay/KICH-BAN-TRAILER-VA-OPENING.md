# The Crack in Reality — Hồ sơ 02: Người trong gương
## BẢNG PHÂN CẢNH KỸ THUẬT ĐIỆN ẢNH: OPENING & TRAILER
*(Cinematic Storyboard, Psychological Curiosity Hooks, VFX & SFX Production Bible)*

Tài liệu này quy chuẩn toàn bộ thông số kỹ thuật điện ảnh (Góc máy, Tiêu cự, Chuyển động Camera, Ánh sáng, VFX Shaders, Thiết kế âm thanh SFX đa tầng, Subliminal Flash-frames và các Manh mối kích thích tò mò tột đỉnh) cho **Opening (48 giây)** và **Trailer chính thức (60 giây)** của dự án **"Người trong gương"** thuộc vũ trụ **The Crack in Reality**.

---

# PHẦN 1: BẢNG PHÂN CẢNH KỸ THUẬT OPENING (48 GIÂY)
* **Thời lượng:** 48 giây (1152 frames @ 24fps)
* **Tỉ lệ khung hình:** 2.39:1 (Anamorphic Widescreen Cinematic) hoặc 16:9
* **Chủ đề trung tâm:** *"Sự phản chiếu dị thường & Lời cảnh báo bị phớt lờ"*
* **Mục tiêu cảm xúc:** Khởi đầu bằng sự hài hước, thân thuộc đời thường của sinh viên Gen Z, nhưng ngấm ngầm cài cắm chi tiết rùng rợn (Uncanny Valley) khiến người xem phải thốt lên *"Khoan, có gì đó sai sai!"* ngay từ những giây đầu.

```
TIMECODE RULER (OPENING 48s @ 24fps):
00:00        00:05                 00:15                 00:26                 00:38        00:48
[ SHOT 0: VẢI ] [   SHOT 1: ĐỘ TRỄ   ] [  SHOT 2: MONTAGE   ] [  SHOT 3: BẤT AN     ] [ SHOT 4: BẺ LÁI ] [ TITLE DROP ]
(0 - 120f)      (120 - 360f)          (360 - 624f)          (624 - 912f)          (912 - 1056f)     (1056 - 1152f)
```

---

### SHOT 0: COLD OPEN — TẤM VẢI PHỦ GƯƠNG & GIỌT NƯỚC NGHỊCH ĐẢO (00:00 – 00:05 | Frame 0 – 120)
*Mục đích: Gieo ngay một hạt mầm tò mò bí hiểm trước khi nhạc nền bắt đầu.*

* **Góc máy & Cử động:**
  * **Khung hình:** Extreme Macro Close-Up (Cực cận 100mm f/2.8) vào mép chiếc gương đứng khung gỗ cũ kỹ.
  * **Góc quay:** Dutch angle 5° nghiêng nhẹ. Camera lướt chậm dọc theo mép gương từ trên xuống.
* **Bố cục & Chi tiết bí ẩn (Curiosity Hook #1):**
  * Chiếc gương bị trùm một nửa bằng một tấm vải hoa bạc màu cũ rích. Trên góc gỗ có vết khắc nguệch ngoạc đã ố vàng: *"Đừng mở vải sau 0h"*.
  * Một giọt sương mai đọng trên mặt kính lạnh. Khi camera lia tới, **giọt nước bỗng lăn NGƯỢC TỪ DƯỚI LÊN TRÊN một đoạn ngắn 1cm** rồi mới chảy xuôi xuống!
* **Ánh sáng:**
  * Ánh sáng xanh chạng vạng 5h30 sáng le lói qua khe cửa sổ hắt lên mặt kính mờ hơi ẩm.
* **SFX & Sound Design:**
  * *SFX 1:* Tiếng hơi thở lạnh phả ra từ phía sau mặt kính: *hùuuu...* (rất khẽ, mang tính vô thức).
  * *SFX 2:* Tiếng giọt nước chảy ngược: *tóc...* (âm thanh giọt nước phát ngược - Reverse water drop).
  * *SFX 3:* Tiếng vải trượt nhẹ trên gỗ: *sột soạt...*

---

### SHOT 1: CHÂN DUNG NAM & CÚ GLITCH ĐỘ TRỄ 5 FRAMES (00:05 – 00:15 | Frame 120 – 360)

* **Góc máy & Cử động:**
  * **Khung hình:** Macro Close-Up $\to$ Slow Dolly-Out (Lùi dần máy) thành Medium Shot bao quát góc nệm và chiếc gương.
  * **Tiêu cự:** 85mm f/1.8 (xóa phông mờ mịt ở đầu) $\to$ chuyển nét Rack Focus về 35mm f/2.8.
* **Bố cục & Ánh sáng:**
  * *Tiền cảnh:* Chiếc điện thoại vỡ góc màn hình đang nhấp nháy sáng chói: `07:00 — BÁO THỨC: ĐI HỌC (LẦN 5)`.
  * *Trung cảnh:* Nam trùm chăn kín mít, thò cánh tay gầy gò ra đập tắt chuông rồi co rụt vào ngủ tiếp.
  * *Hậu cảnh / Góc phản chiếu (CURIOSITY HOOK #2 — ĐỘ TRỄ GƯƠNG):* 
    * Trong chiếc gương ở góc phòng, **cánh tay phản chiếu của Nam vươn ra TRỄ HƠN NAM THẬT 5 FRAMES (khoảng 0.2 giây)!** 
    * Khi Nam thật đã rút tay vào chăn, cánh tay trong gương vẫn dừng lại trên không trung thêm 1 khoảnh khắc ngắn ngủi rồi mới từ từ hạ xuống.
  * *Ánh sáng:* Ánh nắng mai vàng nhạt xuyên qua khe rèm rách, bụi lơ lửng trong không khí (Dust Motes).
* **VFX & Shaders (Remotion):**
  * `MicroLatencyDelay`: Layer phản chiếu trong gương render với delay `frame - 5`.
  * `FilmGrain`: Hạt phim 35mm cường độ 15% tạo cảm giác điện ảnh analog.
  * `Vignette`: Bo tối 4 góc 20% hướng ánh nhìn vào màn hình điện thoại.
* **SFX Multi-layer Sound Design:**
  * *Layer 1 (Foley):* Tiếng chuông báo thức iPhone chói tai (*Radar Ringtone*), tiếng tay đập cộp vào màn hình, tiếng chăn sột soạt.
  * *Layer 2 (Music):* Nhạc nền lo-fi acoustic guitar mộc mạc, nhịp điệu lười biếng 75 BPM bắt đầu vang lên.
* **Voice-over (Lời dẫn):**
  * **LỜI DẪN [Giọng nam trầm ấm, hóm hỉnh đời thường]:**  
    > *"Đây là Nam. Sinh viên năm hai, hiện đang 'tạm trú' tại một phòng trọ nhỏ cùng Tùng — thằng bạn thân nghiêm túc đến phát mệt."*

---

### SHOT 2: BA LÁT CẮT BỆNH TRÌ HOÃN & CHI TIẾT TÌNH BẠN (00:15 – 00:26 | Frame 360 – 624)

* **Góc máy & Cử động (Montage 3 nhịp nhanh):**
  * *Lát 2A (00:15 – 00:18):* Over-The-Shoulder qua vai Tùng. Tùng chỉ tay vào laptop hiển thị slide môn học. Nam dán mắt vào điện thoại leo rank, giơ ngón trỏ: *"Chờ nốt combat này!"*.
  * *Lát 2B (00:18 – 00:22):* Dutch Angle 10°. Cận cảnh bồn rửa bát ngập ngụa xoong nồi. Nam đi ngang xua tay: *"Tí nữa tao rửa!"*. Cú Whip Pan nhanh theo bước chân Nam.
  * *Lát 2C (00:22 – 00:26):* Medium Two-Shot. Tối muộn. Tùng đi làm thêm về kiệt sức ngồi mép nệm xoa bóp bắp chân. Nam nhìn bạn, chủ động gập màn hình thoát game, với tay lấy cốc nước mát đẩy sang cho Tùng: *"Uống đi cho đỡ mệt"*.
* **Bố cục & Ánh sáng:**
  * Lát 2A & 2B: Nắng ban ngày chói chang, phòng bừa bộn đồ đạc.
  * Lát 2C: Ánh đèn tuýp vàng ấm cúng, thể hiện nét tốt bụng, đáng yêu của Nam dù rất lười.
* **SFX & Music:**
  * Tiếng bấm màn hình game liên hồi: *tách-tách-tách*, tiếng kim loại va chạm ở bồn bát.
  * Nhạc lo-fi chuyển sang nốt ấm áp, dịu dàng ở Lát 2C.
* **Voice-over (Lời dẫn):**
  * **LỜI DẪN [Giọng chân thành, giảm nét đùa]:**  
    > *"Nam không phải người xấu. Cậu chỉ mắc đúng một căn bệnh nan y của tuổi trẻ: Trì hoãn. Việc gì cũng có thể đợi đến... tí nữa. Nhưng kỳ lạ là, ở cùng một thằng lười như Nam... thi thoảng cũng thấy dễ chịu."*

---

### SHOT 3: ĐỘC THOẠI BẾ TẮC & SỰ PHẢN CHIẾU ĐẢO BÊN (00:26 – 00:38 | Frame 624 – 912)

* **Góc máy & Cử động:**
  * **Khung hình:** Medium Close-Up $\to$ Slow Push-In (Đẩy máy từ từ vào nửa gương mặt Nam đối diện chiếc gương).
  * **Tiêu cự:** 50mm f/2.0 với DOF cực nông, làm mờ hậu cảnh.
* **Bố cục & Chi tiết kỳ lạ (Curiosity Hook #3):**
  * Nam đứng trước gương, ánh sáng xanh buốt từ màn hình laptop (`Hạn nộp: 23:59 — THIẾU BÀI TẬP`) hắt lên mặt.
  * Nam mệt mỏi đưa **tay phải** lên gãi đuôi mắt trái (nơi có nốt ruồi thật).
  * **TRONG GƯƠNG:** Hình ảnh phản chiếu lại đưa **tay trái** lên gãi đuôi mắt... **nhưng nốt ruồi trong gương lại nằm ở đuôi mắt PHẢI!** Ánh mắt của cái bóng không nhìn vào mắt Nam, mà nhìn thẳng ra phía ngoài khán giả (Breaking 4th wall)!
* **VFX & Shaders:**
  * `Desaturate`: Màu phòng chìm dần về tông xám xịt lạnh lẽo (Teal & Shadow Cyan).
  * `HeatDistortion`: Không khí giữa Nam và mặt gương gợn sóng mờ ảo như có luồng nhiệt vô hình.
* **SFX & Music:**
  * Giai điệu lo-fi ngưng bặt đột ngột (Tape Stop effect: *ẹt...*).
  * Tiếng quạt trần quay lẹt kẹt: *kẽo kẹt... kẽo kẹt...*
  * Tiếng nốt Cello trầm đục (Low Cello Drone 50Hz) trườn vào, kéo dài u uất rợn gai ốc.
* **Voice / Độc thoại:**
  * **NAM [Độc thoại nội tâm, giọng mệt mỏi, bất lực]:**  
    > *"Làm người lớn mệt mỏi vãi chưởng... Deadline dí, học lại, áp lực gia đình... Ước gì có ai đó gánh hết phiền toái, sống hộ mình cái cuộc đời này thì sướng biết mấy..."*

---

### SHOT 4: CÚ BẺ LÁI MA MỊ — BÀN TAY XUYÊN KÍNH (00:38 – 00:44 | Frame 912 – 1056)

* **Góc máy & Cử động:**
  * **Khung hình:** Over-The-Shoulder từ sau lưng Nam $\to$ **Crash Zoom cực mạnh** vào nụ cười của cái bóng trong gương!
  * **Góc quay:** Dutch Angle nghiêng 15° tạo cảm giác trọng lực bị bẻ cong.
* **Hành động & Diễn xuất:**
  * Nam thật thở dài, xoay người bước quay lưng đi...
  * **NHƯNG HÌNH ẢNH TRONG GƯƠNG KHÔNG QUAY LƯNG ĐI!**
  * Cái bóng vẫn đứng nguyên tại chỗ, từ từ ngẩng đầu lên, nhếch mép cười lạnh ngắt.
  * Mặt kính gương gợn sóng như mặt hồ nước đêm. **Bàn tay Người Trong Gương thò hẳn ra ngoài không khí**, những ngón tay chạm nhẹ vào gáy của Nam nhưng Nam không hề hay biết!
* **VFX & Shaders:**
  * `Fluid Displacement Map`: Mặt kính biến dạng sóng nước vòng tròn tại điểm bàn tay xuyên qua.
  * `Eerie Greenish Cyan Glow`: Mặt gương phát ra ánh lân tinh xanh lục ma quái.
* **SFX & Voice:**
  * *SFX Sub-drop 40Hz:* Cú đập bass sâu rung chuyển lồng ngực.
  * *SFX Fluid:* Tiếng kính hóa lỏng gợn sóng: *ù... ùng... ục...*
  * *Voice Binaural:* Giọng thì thầm đảo 2 tai sắc lẹm:
    > **NGƯỜI TRONG GƯƠNG [Thì thầm ma mị, vang vọng]:**  
    > *"Mày thấy mệt mỏi rồi đúng không?... Cuộc đời ngoài kia... để tao sống thay cho."*

---

### SHOT 5: MẶT KÍNH ĐÔNG CỨNG & TITLE DROP (00:44 – 00:48 | Frame 1056 – 1152)

* **Góc máy:** Cực cận mặt gương $\to$ Chớp đen (Cut to Black).
* **Bố cục & Action:**
  * Bàn tay rụt vào, mặt kính đông cứng phẳng lặng. Trong gương, cái bóng đã ngồi ngay ngắn ở bàn học của Nam.
  * Vết nứt sắc lẻm xé đôi màn hình đen, ánh sáng xanh bùng nổ hiện Logo chính thức:
    ```
    T H E   C R A C K   I N   R E A L I T Y
            HỒ SƠ 02: NGƯỜI TRONG GƯƠNG
    ```
  * Tagline bạc lấp lánh bên dưới: *"Có những chiếc bóng... không bao giờ nên để bước ra ngoài."*
* **SFX:**
  * Tiếng then sắt cửa phòng cài chốt cực mạnh: **"CẠCH!"** (Dry, loud, không reverb).
  * Tiếng kính nứt rạn: *Rắccc...* rồi tắt lịm trong 1 giây tĩnh lặng tuyệt đối.

---

# PHẦN 2: BẢNG PHÂN CẢNH KỸ THUẬT TRAILER (60 GIÂY)
* **Thời lượng:** 60 giây (1440 frames @ 24fps)
* **Phong cách:** Hollywood Psychological Thriller Teaser (Nhịp điệu dồn dập, gieo rắc sự tò mò, cắt cảnh gián đoạn, Subliminal Flash-frames).
* **Chiến lược khơi gợi người xem:**
  1. **The Unspoken Bargain (Giao kèo ngầm):** Người xem thấy ban đầu Nam rất sướng vì có người gánh hộ mọi gánh nặng.
  2. **The Creepy Clues (Manh mối rùng rợn):** Đôi mắt không chớp, bàn tay nghịch đảo, nốt ruồi đảo bên, nụ cười vô hồn.
  3. **The Unsettling Truth (Sự thật nghiệt ngã):** Càng nhường quyền sống, Nam thật càng bị biến mất và bị chính xã hội đào thải.
  4. **The Ultimate Cliffhanger:** Cảnh kết gây sốc khiến khán giả phải lập tức tìm tập phim xem ngay.

```
TIMECODE RULER (TRAILER 60s @ 24fps):
00:00                 00:15                 00:32                               00:50        00:60
[ HỒI 1: CÁM DỖ NGỌT ] [ HỒI 2: KẺ THẾ THÂN ] [ HỒI 3: ĐÀO THẢI & NỖI SỢ ]       [ HỒI 4: BẪY SẬP & TWIST ]
(0 - 360f)            (360 - 768f)          (768 - 1200f)                       (1200 - 1440f)
```

---

### HỒI 1: CÁM DỖ CỦA SỰ TIỆN LỢI & CÚ CHẠM MẶT ĐẦU TIÊN (00:00 – 00:15 | Frame 0 – 360)

* **Cảnh T01 (00:00 – 00:04 | Cực cận con ngươi & Sự kiệt quệ):**
  * *Camera:* Extreme Close-up mắt Nam đỏ ngầu, tơ máu chằng chịt, phản chiếu ánh sáng nhấp nháy từ màn hình game và đống slide bài tập.
  * *SFX:* Tiếng game: *Defeat!*, tiếng chuông Zalo réo giục nộp tiền trọ dồn dập.
  * *Voice Nam:* *"Làm người lớn mệt mỏi vãi chưởng... Deadline dí, học lại, gia đình soi mói... Ước gì cứ nằm một chỗ chơi game ăn mì tôm cả đời!"*
* **Cảnh T02 (00:04 – 00:09 | Cú chạm mặt ở bồn rửa & Micro-glitch):**
  * *Visual:* Sáng hôm sau. Nam ngái ngủ bước ra bồn rửa chén. Một người mặc áo xanh của Nam đang cặm cụi rửa sạch bóng đống bát đĩa.
  * *Action:* Người đó quay mặt lại... **GƯƠNG MẶT GIỐNG HỆT NAM 100%!**
  * *Camera:* Whip Zoom cực nhanh vào mặt Nam thật đang há hốc mồm kinh hoàng.
  * *Thoại:* 
    * Nam: *"Mày... mày là ai?!"*
    * Người Kia (giọng phẳng lặng, mắt không chớp): *"Tao tên Nam."*
  * *SFX:* Tiếng violin rít chói gắt (*Violin Screech*), tiếng nước chảy ngắt cụt.
* **Cảnh T03 (00:09 – 00:15 | Bản hợp đồng ngầm & Sự thỏa mãn):**
  * *Camera:* Low angle Nam đập phong bì tiền 3 triệu xuống bàn thị uy: *"Phòng này tao là nóc nhà! Mày làm thuê thì biết điều, cấm đụng vào đồ tao!"*
  * *Action:* Người Kia gật đầu ngoan ngoãn. 
  * *Chuyển cảnh nhanh:* Nam nằm vắt chân chữ ngũ trên nệm húp mì tôm cười đắc chí: *"Có thằng hầu hạ nhàn vãi chưởng!"*
  * *Voice Người Kia (thì thầm):* *"Mày ngại thuyết trình Lab 402 đúng không? Để tao lên nói cho."*
  * *Nam vội dúi thẻ sinh viên:* *"Lên flex hộ tao lấy điểm A rồi lượn lẹ nhé!"*

---

### HỒI 2: KẺ THẾ THÂN HOÀN HẢO & MANH MỐI BẤT THƯỜNG (00:15 – 00:32 | Frame 360 – 768)
*Nhịp điệu dồn dập với Trailer Braam (Trống dồn kết hợp âm Synthwave nặng trịch)*

* **Cảnh T04 (00:15 – 00:22 | Montage vinh quang của Kẻ Thế Thân — 1s/shot):**
  * *Shot 1:* Người Kia đứng trên bục Lab 402 đĩnh đạc, slide hiện số **9.5** to đùng, giảng viên và bạn học vỗ tay rào rào.
  * *Shot 2:* Sân bóng đá mini, Người Kia sút tung lưới ghi bàn quyết định, đồng đội ôm chúc mừng reo hò.
  * *Shot 3:* Tùng xách cơm về vỗ vai: *"Nay phòng sạch bong, bài nộp trước hạn, mai mặt trời mọc đằng tây à?"*
  * *Shot 4:* Điện thoại reo, Bác Hai cười rạng rỡ giữa tiệc họ: *"Cả họ xem thằng Nam nay chững chạc chưa này!"*
* **Cảnh T05 (00:22 – 00:27 | SỰ ĐỐI LẬP KINH HOÀNG — The Rotting Original):**
  * *Camera:* Cắt song song (Cross-cutting) giữa hai thực thể:
    * Người Kia: Quần áo là phẳng phiu, da dẻ hồng hào, nụ cười sáng lạn giữa đám đông bạn bè.
    * Nam thật: Nằm co quắp trong góc phòng tối ẩm mốc, da dẻ tái mét, mắt trũng sâu, râu ria lởm chởm, móng tay thâm đen như một kẻ ốm liệt giường.
  * *Curiosity Hook:* Mỗi khi Người Kia nhận được lời khen, Nam thật lại ôm ngực thở dốc hụt hơi, như sinh lực đang bị hút cạn dần!
* **Cảnh T06 (00:27 – 00:32 | Cuộc trò chuyện lúc nửa đêm & Lời gài bẫy):**
  * *Visual:* Phòng trọ tối đen chỉ có ánh sáng xanh từ màn hình máy tính. Người Kia ngồi bất động trên ghế đẩu, hai mắt mở trừng trừng trong đêm.
  * *Thoại Nam (nửa đùa nửa run):* *"Ê mày, rốt cuộc mày từ đâu chui ra đấy? Đừng bảo là clone nhân bản trốn trại nhé?"*
  * *Camera:* Dolly từ từ vào nụ cười không có độ ấm của Người Kia:
  * *Thoại Người Kia:* *"Mày thấy mệt mỏi thì cứ nằm đây nghỉ đi... Cuộc đời ngoài kia, để tao sống thay cho."*

---

### HỒI 3: BỊ ĐÀO THẢI, MANH MỐI NỐT RUỒI & NỖI SỢ BIẾN MẤT (00:32 – 00:48 | Frame 768 – 1152)

* **Cảnh T07 (00:32 – 00:38 | Bị đào thải khỏi thế giới thật):**
  * *SFX:* **NHẠC TẮT PHỤT.** Chỉ còn tiếng nhịp tim đập dồn dập: *THUMP... THUMP...*
  * *Visual:* Nam thật quyết định bước ra giảng đường để đòi lại vị trí. Nhưng đứng trên bục giảng, Nam run lẩy bẩy, lắp bắp không hiểu gì về bài giảng.
  * *Sinh viên dưới lớp cười mỉa:* *"Ủa, nay Nam bị lag mạng à?", "Hôm trước hack não hết mana rồi à?"*
  * *Giảng viên đập bàn quát:* *"Trừ 2 điểm chuyên cần cả nhóm!"*
  * *Tùng thất vọng tột cùng đẩy vai Nam:* *"Đang phong độ tốt tự dưng thụt lùi làm cả nhóm bị trừ điểm oan là sao?!"*
* **Cảnh T08 (00:38 – 00:43 | MANH MỐI NỐT RUỒI & SỰ THẬT KINH HOÀNG):**
  * *Camera:* Macro cận cảnh màn hình điện thoại phóng to clip Zalo đối chiếu thẻ Căn cước công dân:
    * **Căn cước công dân: Nốt ruồi ở đuôi mắt TRÁI.**
    * **Clip Zalo Người Kia: Nốt ruồi ở đuôi mắt PHẢI!**
  * *Nam thật nhìn vào gương (giọng nghẹn ngào kinh hoàng):*
    > *"Nếu nó làm mọi thứ tốt hơn mình... bạn bè quý nó hơn mình... thì mình là cái thứ gì đang đứng ở đây?!"*
* **Cảnh T09 (00:43 – 00:48 | Cơn thịnh nộ & Chiếc búa sắt):**
  * *Action:* Nam vớ lấy chiếc búa sắt dưới gầm giường, mắt đỏ ngầu gầm lên xé họng:
    > *"Nó là Người Trong Gương! Tao sẽ đập nát cái gương này!"*
  * *Người Kia đứng cạnh gương, lạnh lùng đáp trả:*
    > *"Mày đập gương rồi mày định lấy cái thân xác ăn hại này ra làm khổ họ tiếp à?"*

---

### HỒI 4: BẪY SẬP, SUBLIMINAL FLASHES & CLIFFHANGER TỐI THƯỢNG (00:48 – 01:00 | Frame 1152 – 1440)

* **Cảnh T10 (00:48 – 00:52 | Mặt kính hóa nước & Cú nuốt chửng):**
  * *Camera:* Slow motion 60fps. Búa sắt tuột tay rơi xuống sàn: **"KENG!"**.
  * *Action:* Nam ngã nhào chạm tay vào gương. Mặt kính gợn sóng biến thành hồ nước đen tuyền buốt giá!
  * *VFX:* Hàng chục cánh tay nhợt nhạt từ đáy nước trong gương vươn lên tóm lấy cổ tay, lôi tuột toàn bộ thân thể Nam chìm sâu vào mặt kính!
  * *Thoại Nam gào nghẹn dưới nước:* *"Không... cứu...!"* $\to$ Bong bóng khí vỡ tan, mặt kính phẳng lại như cũ.
* **Cảnh T11 (00:52 – 00:54 | SUBLIMINAL FLASH-FRAMES — 3 FRAME ÁM ẢNH (1/24s mỗi frame)):**
  * *Flash 1 (Frame 1248):* Gương mặt Nam thật đang áp sát mặt kính từ bên trong, miệng há hốc kêu gào không ra tiếng.
  * *Flash 2 (Frame 1256):* Bức ảnh chụp nhóm trên bàn học: Khuôn mặt Nam thật trong ảnh từ từ biến mất, chỉ còn lại khoảng trống nham nhở.
  * *Flash 3 (Frame 1264):* Đôi mắt Người Kia trợn tròn nhìn thẳng vào camera với nụ cười rộng đến mang tai.
* **Cảnh T12 (00:54 – 00:58 | CLIFFHANGER TỘT ĐỈNH VỚI TÙNG):**
  * *Bối cảnh:* Phòng trọ đêm khuya tinh tươm sạch sẽ. Tùng xách túi bún chả bước vào: *"Nam ơi, ăn bún chả đi rồi tối tao kèm lại bài cho!"*
  * *Action:* Người Kia mỉm cười tươi tắn, vươn **TAY TRÁI** đón lấy túi đồ ăn.
  * *Camera:* Cắt cận cảnh Tùng sững sờ, mắt mở to chột dạ:
    > **TÙNG [giọng run run]:** *"Ủa Nam... nốt ruồi bên mắt mày... sao nay lại nằm bên phải?"*
  * *Camera:* Cực cận khuôn mặt "Nam" — nụ cười vụt tắt trong tích tắc, chỉ còn lại đôi mắt đen sâu thẳm không đáy:
    > **NGƯỜI TRONG GƯƠNG [giọng lạnh ngắt]:** *"Mày nhìn nhầm rồi... Tao mới là Nam thật."*
  * *Action:* Bàn tay Người Kia thò ra sau lưng đẩy cửa phòng trọ khép sập lại: **"RẦM!"**
* **Cảnh T13 (00:58 – 01:00 | TITLE CARD BÙNG NỔ & CÂU HỎI THIÊU ĐỐT TRÍ TÒ MÒ):**
  * *Màn hình đen hoàn toàn.* Âm thanh Sub-drop chấn động cùng Logo kim loại nứt vỡ:
    ```
    T H E   C R A C K   I N   R E A L I T Y
            HỒ SƠ 02: NGƯỜI TRONG GƯƠNG
    ```
  * Dòng chữ đỏ rực hiện lên giáng thẳng vào tâm lý người xem:
    ```
    NẾU CÓ MỘT BẢN SAO HOÀN HẢO HƠN CỦA BẠN XUẤT HIỆN...
    LIỆU BẠN CÓ CÒN ĐỦ TƯ CÁCH ĐỂ TỒN TẠI?
    ```
  * *Âm thanh dư âm:* Tiếng hai bàn tay đập dồn dập vào mặt kính từ bên trong thế giới gương: *thình... thình... thình...* trong bóng tối.

---

### BẢNG TỔNG HỢP MANH MỐI BÍ ẨN (EASTER EGGS FOR AUDIENCE DISCUSSION)
*(Các chi tiết cài cắm để khán giả soi, làm video phân tích lý thuyết, đẩy tương tác mạng xã hội)*

| STT | Chi tiết cài cắm (Easter Egg) | Vị trí xuất hiện | Ý nghĩa bí ẩn / Lời giải thích |
|:---:|---|---|---|
| 1 | **Độ trễ gương 5 frames** | Shot 1 Opening (00:07) | Cái bóng cử động trễ hơn Nam 0.2s, chứng minh nó không phải phản chiếu quang học mà là một thực thể độc lập đang bắt chước. |
| 2 | **Nốt ruồi đảo nghịch (Mirror Inversion)** | Khắp Opening & Trailer | Nam thật: Nốt ruồi ở đuôi mắt **TRÁI**.<br>Người Trong Gương: Nốt ruồi ở đuôi mắt **PHẢI** (Quy luật đối xứng gương). |
| 3 | **Thuận tay trái (Left-handed)** | Cảnh T04 & T12 Trailer | Nam thật thuận tay phải. Bản sao luôn cầm bút, sút bóng, nhận đồ bằng **tay trái**. |
| 4 | **Dòng chữ trên khung gỗ** | Shot 0 Opening (00:02) | *"Đừng mở vải sau 0h"* — Manh mối cho thấy đã từng có người thuê trọ trước đây chịu chung số phận bị thay thế. |
| 5 | **Bóng không đầu / Mất bóng** | Cảnh T06 Trailer (00:30) | Dưới ánh đèn tuýp, bóng đổ trên tường của Người Kia không có cử động thở phập phồng của lồng ngực. |
| 6 | **Âm thanh Shepard Tone** | Nhạc nền Hồi 3 Trailer | Dải tần số âm thanh tăng tiến vô tận tạo ảo giác bất an và dồn dập không lối thoát. |

---

### CHEAT SHEET THỰC THI REMOTION (DÀNH CHO DEV / ANIMATOR)

```tsx
// 1. Hook Micro-latency phản chiếu gương
const MirrorReflection: React.FC<{ frame: number; children: React.ReactNode }> = ({ frame, children }) => {
  // Render chậm hơn 5 frames để tạo uncanny valley
  const delayedFrame = Math.max(0, frame - 5);
  return (
    <div style={{ transform: "scaleX(-1)", filter: "brightness(0.9) contrast(1.1)" }}>
      {/* Render component với delayedFrame */}
    </div>
  );
};

// 2. SVG Fluid Distortion Filter cho mặt kính hóa nước
export const FluidMirrorFilter = () => (
  <svg style={{ position: "absolute", width: 0, height: 0 }}>
    <defs>
      <filter id="waterRipple">
        <feTurbulence type="fractalNoise" baseFrequency="0.04 0.08" numOctaves="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="25" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  </svg>
);

// 3. Audio Stems Mapping
// Track 1: Ambience (amb_room_night.wav, -16dB)
// Track 2: Foley (foley_mirror_water.wav, -6dB)
// Track 3: Score (trailer_braam_shepard.wav, -4dB)
// Track 4: Voiceover (dry_voice_with_sidechain.wav, 0dB)
```
