# The Crack in Reality — Hồ sơ 02: Người trong gương
> **Bản thực thi opening cập nhật 11/11:** xem [OPENING-AM-THANH.md](OPENING-AM-THANH.md). Runtime giữ 48 giây ở 30fps, lời đã rút để đọc kịp, dấu tay đỏ máu; có nhạc/SFX nhưng chưa có giọng. Các tham số 24fps, chớp/flare và câu dài dưới đây là bản ý tưởng trước chỉnh, không ghi đè bản runtime mới. Trailer 60 giây chưa thực hiện.

## BẢNG PHÂN CẢNH KỸ THUẬT ĐIỆN ẢNH: OPENING & TRAILER
*(Cinematic Storyboard, Live-Action Film Aesthetics, Psychological Suspense, VFX & SFX Production Bible)*

Tài liệu này quy chuẩn toàn bộ thông số kỹ thuật điện ảnh cấp cao (Góc máy, Tiêu cự ống kính Anamorphic, Chuyển động Camera người đóng, Ánh sáng Chiaroscuro, Mô phỏng chất phim nhựa 35mm, VFX Shaders, Thiết kế âm thanh SFX đa tầng, Subliminal Flash-frames và các Manh mối kích thích tò mò tột đỉnh) cho **Opening (48 giây)** và **Trailer chính thức (60 giây)** của dự án **"Người trong gương"** thuộc vũ trụ **The Crack in Reality**.

> **Cập nhật Pipeline 3D (12/11/2026):** Toàn bộ các cú máy Anamorphic, Dolly Zoom, Mirror Reflection trễ nhịp và ánh sáng Chiaroscuro dưới đây được dựng trực tiếp bằng **Nhân vật 3D, Bối cảnh 3D 360° & Camera 3D vật lý** theo [QUY-CHUAN-3D.md](../../../docs/QUY-CHUAN-3D.md) (bản `opening.tsx` 2D hiện có đóng vai trò bản dựng thử animatic chốt nhịp).

---

# MỤC 0: BỘ QUY CHUẨN HIỆU ỨNG ĐIỆN ẢNH NGƯỜI ĐÓNG (LIVE-ACTION CINEMATIC SUITE)
*Bộ thông số và kỹ thuật biến chuyển hình ảnh đồ họa thành một tác phẩm điện ảnh sống động, chân thực, có khối và có linh hồn như phim người đóng (Live-Action Cinema).*

### 1. Quang học & Vật lý thấu kính (Anamorphic Optics & Lens Physics):
* **Tỉ lệ khung hình Anamorphic 2.39:1 (Cinemascope):** Hai thanh viền đen điện ảnh (Cinematic Letterbox Bars) trên và dưới, mở rộng trường thị giác theo chiều ngang, tạo cảm giác phim chiếu rạp cao cấp.
* **Anamorphic Blue / Cyan Streak Flare:** Khi nguồn sáng gắt (đèn màn hình laptop, đèn pin điện thoại, đèn xe máy ngoài hẻm) chiếu vào ống kính, tạo vệt lóa sáng xanh sapphire nằm ngang kéo dài sang hai bên mép khung hình (đặc trưng ống kính Panavision / Cooke Anamorphic).
* **Bokeh Elip (Oval Bokeh):** Các đốm sáng mờ nhòe ở tiền cảnh và hậu cảnh có hình elip bầu dục dọc thay vì hình tròn thông thường của máy kỹ thuật số.
* **Độ sâu trường ảnh nông (Shallow Depth of Field — f/1.4 đến f/2.0):** Xóa phông mượt mà, tách biệt nhân vật với hậu cảnh; sử dụng kỹ thuật **Rack Focus** chuyển điểm nét từ màn hình điện thoại sang khuôn mặt mệt mỏi của Nam.
* **Quang sai sắc thấu kính (Lens Chromatic Aberration — 1.5px đến 2.5px):** Hiện tượng tán sắc đỏ - lam (RGB Edge Fringing) ở mép ngoài cùng của khung hình và quanh các vật thể tương phản cao, xóa tan cảm giác sắc cạnh giả tạo của vector đồ họa.
* **Độ cong thấu kính (Optical Barrel Distortion):** Độ cong méo nhẹ 2% ở các góc khung hình khi dùng tiêu cự góc rộng 24mm, mô phỏng thấu kính máy quay điện ảnh thực tế.
* **Motion Blur cửa trập 180° (Shutter Angle 180°):** Độ mờ chuyển động tự nhiên với tốc độ màn trập 1/48s tại 24fps. Khi hành động giật gắt (vung búa, giật lùi), chuyển sang **Shutter Angle 90° (1/96s)** để hình ảnh sắc lẹm, giật cục gay cấn như phim hành động Hollywood.

### 2. Mô phỏng chất liệu phim nhựa 35mm (Analog Film Emulation):
* **Hạt phim hữu cơ 35mm (Kodak Vision3 500T 5219 Grain):** Lớp hạt nhiễu analog sống động, phân bổ tự nhiên tập trung nhiều ở vùng tối (Shadows) và trung tính (Midtones), tuyệt đối không phải nhiễu kỹ thuật số (Digital noise).
* **Quầng sáng đỏ viền phim (Film Halation):** Hiện tượng ánh sáng đỏ ấm rực (Red Glow) lan tỏa mềm mại quanh các nguồn sáng chói (viền màn hình máy tính, bóng đèn trần, viền cửa sổ sáng ngược) do ánh sáng phản xạ từ lớp đế phim nhựa.
* **Màng khuếch tán ánh sáng mềm (Black Pro-Mist 1/4 Filter):** Giảm bớt độ tương phản gay gắt kỹ thuật số, làm dịu các mảng sáng, tạo quầng sương mờ (Bloom) huyền ảo quanh tóc và gương mặt nhân vật.
* **Rung lắc cổng phim (Film Gate Weave):** Khung hình có độ trôi rung vi mô ngẫu nhiên 0.3px theo trục X-Y, tái hiện cảm giác cuộn phim nhựa đang chạy qua máy chiếu cơ khí.

### 3. Ánh sáng kịch tính & Chiều sâu không gian (Chiaroscuro & Motivated Lighting):
* **Ánh sáng có nguồn gốc thực tế (Motivated Practical Light):** Không dùng ánh sáng phẳng đều. Mọi luồng sáng đều bắt nguồn từ nguồn thật: ánh nắng sớm xuyên qua nan rèm rách, ánh sáng trắng xanh lạnh từ laptop, ánh đèn đường vàng hắt qua khe cửa sổ, ánh lân tinh xanh lục ma mị từ mặt kính gương.
* **Độ tương phản cao Chiaroscuro (Phong cách David Fincher):** Tương phản sâu giữa mảng sáng rực và mảng tối thẳm (Crushed blacks), vùng bóng đổ không bị đen tuyền tuyệt đối mà có sắc xanh rêu đậm hoặc xám than.
* **Ánh sáng thể tích & Khói bụi lơ lửng (Atmospheric Dust & God Rays):** Những hạt bụi li ti lơ lửng chuyển động chậm trong luồng ánh sáng mặt trời chiếu chéo qua phòng trọ (Tyndall Effect).
* **Đường viền sáng tách khối (Rim / Kicker Light 1.5px):** Một vệt sáng mỏng sắc nét bao quanh bờ vai, sống mũi và viền tóc nhân vật, tách biệt cơ thể khỏi phông nền tối đen, tạo cảm giác nhân vật có khối 3D lập thể như người thật.
* **Độ chuyển bóng tự nhiên (Contact Shadow & Penumbra):** Bóng tiếp xúc (Contact shadow) đen đậm sát chân bàn, chân nệm, lan tỏa dần thành vùng bóng nửa tối (Penumbra) mềm mại, triệt tiêu hoàn toàn bóng giả nhựa phẳng lì.

### 4. Ngôn ngữ chuyển động máy quay người đóng (Live-Action Camera Grammar):
* **Độ rung thở tự nhiên (Handheld Camera Breathing):** Giả lập chuyển động của máy quay vác vai (Shoulder Rig) do quay phim thật cầm, có độ rung rinh nhẹ trôi dạt ngẫu nhiên theo nhịp thở con người, khiến cảnh quay không bao giờ "chết cứng".
* **Cú máy Vertigo / Hitchcock Dolly Zoom:** Camera Dolly tiến tới trong khi thu hẹp tiêu cự (hoặc ngược lại) ở cảnh Nam phát hiện nốt ruồi đảo nghịch, làm méo mó không gian, khiến các bức tường và chiếc gương dường như giãn dài ra vô tận.
* **Chuyển cảnh lia máy nhanh (Whip Pan):** Lia máy tốc độ cao với Motion Blur quét ngang mịt mù để chuyển giao giữa các lát cắt thời gian.

### 5. Bảng màu điện ảnh ngột ngạt (Dark Moody Palette & Split Toning):
* **Tone màu Fincher & A24:** Vàng mù tạt bẩn (Drab Tungsten Greenish-Yellow) kết hợp với Xanh Cyan lạnh và Xanh rêu ẩm mốc.
* **Bảo toàn màu da người (Skin Tone Protection):** Dù phông nền có kéo lạnh hay bẩn, vùng da mặt nhân vật vẫn giữ được sắc hồng cam ấm áp của tế bào sống, tương phản sâu sắc với làn da tái mét lạnh ngắt của Người Trong Gương.

---

# PHẦN 1: BẢNG PHÂN CẢNH KỸ THUẬT OPENING (48 GIÂY)
* **Thời lượng:** 48 giây (1152 frames @ 24fps)
* **Tỉ lệ khung hình:** 2.39:1 Anamorphic Widescreen (Letterbox đen trên/dưới)
* **Chủ đề trung tâm:** *"Sự phản chiếu dị thường & Lời cảnh báo bị phớt lờ"*
* **Phong cách:** Điện ảnh tâm lý giật gân (Psychological Thriller Cinema)

```
TIMECODE RULER (OPENING 48s @ 24fps):
00:00        00:05                 00:15                 00:26                 00:38        00:48
[ SHOT 0: VẢI ] [   SHOT 1: ĐỘ TRỄ   ] [  SHOT 2: MONTAGE   ] [  SHOT 3: BẤT AN     ] [ SHOT 4: BẺ LÁI ] [ TITLE DROP ]
(0 - 120f)      (120 - 360f)          (360 - 624f)          (624 - 912f)          (912 - 1056f)     (1056 - 1152f)
```

---

### SHOT 0: COLD OPEN — TẤM VẢI PHỦ GƯƠNG & GIỌT NƯỚC NGHỊCH ĐẢO (00:00 – 00:05 | Frame 0 – 120)
*Mục đích: Thiết lập không khí phim người đóng u uất, tĩnh lặng và bí ẩn ngay từ giây đầu tiên.*

* **Góc máy & Cử động:**
  * **Khung hình:** Extreme Macro Close-Up (Cực cận 100mm f/2.8 Anamorphic).
  * **Góc quay:** Dutch Angle 5° nghiêng nhẹ. Camera trượt chậm từ từ dọc theo khung gỗ chiếc gương đứng cũ kỹ.
* **Ánh sáng & Hiệu ứng người đóng (Live-Action Suite):**
  * *Ánh sáng Chiaroscuro:* Ánh sáng xanh chạng vạng 5h30 sáng yếu ớt từ khe cửa sổ hắt lên mặt kính mờ hơi ẩm. Toàn bộ góc phòng còn lại chìm trong bóng tối xám than (Deep Charcoal Shadow).
  * *Optical Flare:* Một tia sáng Anamorphic Cyan lướt qua thấu kính khi camera di chuyển qua gờ gương.
  * *Film Halation & Grain:* Quầng đỏ ấm (Red Halation) lan nhẹ quanh vệt phản quang trên mặt kính. Hạt phim 35mm mịn phủ khắp khung hình.
* **Hành động & Chi tiết bí ẩn (Curiosity Hook #1):**
  * Tấm vải hoa cũ kỹ bạc màu phủ kín nửa trên của gương. Trên viền gỗ mục có dòng chữ khắc tay mờ ố: *"Đừng mở vải sau 0h"*.
  * Một giọt sương mai đọng trên mặt kính lạnh. Khi camera tiến lại gần, **giọt nước bỗng dừng lại 1 nhịp rồi LĂN NGƯỢC TỪ DƯỚI LÊN TRÊN một đoạn 1.5cm** rồi mới rẽ nhánh chảy xuôi xuống!
* **SFX Multi-layer Sound Design:**
  * *Layer 1 (Sub-bass):* Tiếng ù rền tần số thấp 30Hz rung chuyển ngực (*Sub-rumble*).
  * *Layer 2 (Foley):* Tiếng thở lạnh hắt ra từ bên trong mặt kính: *hùuuu...*, tiếng giọt nước chảy ngược: *tóc...* (Reverse Water Drop Foley).
  * *Layer 3 (Ambience):* Tiếng ve sầu sớm xa xăm ngoài ngõ hẻm vọng lại như ảo giác.

---

### SHOT 1: CHÂN DUNG NAM & CÚ GLITCH ĐỘ TRỄ 5 FRAMES (00:05 – 00:15 | Frame 120 – 360)

* **Góc máy & Cử động:**
  * **Khung hình:** Macro Close-Up $\to$ Slow Dolly-Out mượt mà kết hợp **Handheld Camera Breathing (độ thở vác vai ngẫu nhiên 0.4px)** thành Medium Shot bao quát góc nệm và chiếc gương.
  * **Tiêu cự:** 85mm f/1.8 Anamorphic $\to$ **Rack Focus** chuyển điểm nét từ màn hình điện thoại sang căn phòng.
* **Ánh sáng & Hiệu ứng người đóng:**
  * *Ánh sáng thể tích (God Rays):* Một luồng nắng ban mai vàng nhạt chiếu chéo qua khe rèm nan rách, làm lộ rõ hàng nghìn hạt bụi li ti lơ lửng trong không khí (Dust Particles Tyndall Effect).
  * *Anamorphic Streak Flare:* Màn hình điện thoại vỡ góc nhấp nháy tạo một vệt lóa sáng xanh lam nằm ngang (Horizontal Blue Flare) quét ngang mặt Nam.
  * *Rim Light:* Vệt sáng vàng mỏng 1.5px viền quanh chăn và sống mũi Nam, tách cơ thể khỏi nền tối.
* **Hành động & Chi tiết bí ẩn (Curiosity Hook #2 — Độ trễ gương):**
  * Màn hình điện thoại hiện dòng chữ sáng rực: `07:00 — BÁO THỨC: ĐI HỌC (LẦN 5)`.
  * Cánh tay gầy gò của Nam thò ra khỏi chăn, quờ quạng đập mạnh tắt chuông rồi co rụt vào chăn ngủ tiếp.
  * **CHI TIẾT GLITCH THẦN KINH:** Trong chiếc gương ở góc hậu cảnh, **cánh tay phản chiếu vươn ra TRỄ HƠN NAM THẬT 5 FRAMES (0.2s)!** Khi Nam thật đã rút tay về chăn, cánh tay trong gương vẫn lơ lửng giữa không trung thêm một tích tắc rồi mới hạ xuống một cách gượng gạo.
* **SFX & Music:**
  * Tiếng chuông báo thức iPhone default chói gắt (*Radar Ringtone*) kèm méo tiếng nhẹ (Tape Flutter).
  * Tiếng tay đập cộp vào màn hình điện thoại, tiếng chăn bông sột soạt.
  * Nhạc nền Lo-fi Acoustic Guitar mộc mạc vang lên với tiếng gảy dây đàn chân thực (75 BPM), mang đến cảm giác đời thường thư thái đánh lừa khán giả.
* **Voice-over:**
  * **LỜI DẪN [Giọng nam miền Nam/Bắc trầm ấm, hóm hỉnh đời thường]:**  
    > *"Đây là Nam. Sinh viên năm hai, hiện đang 'tạm trú' tại một phòng trọ nhỏ cùng Tùng — thằng bạn thân nghiêm túc đến phát mệt."*

---

### SHOT 2: BA LÁT CẮT BỆNH TRÌ HOÃN & CHI TIẾT TÌNH BẠN (00:15 – 00:26 | Frame 360 – 624)

* **Góc máy & Cử động (Montage 3 nhịp nhanh với Whip Pan Transition):**
  * *Lát 2A (00:15 – 00:18):* Over-The-Shoulder qua vai Tùng. Tùng chỉ ngón tay vào màn hình laptop đang mở slide môn học. Nam dán mắt vào điện thoại leo rank, giơ ngón trỏ: *"Chờ nốt combat này!"*.
  * *Lát 2B (00:18 – 00:22):* Dutch Angle 10°. Cận cảnh bồn rửa bát ngập ngụa xoong nồi cáu mỡ. Nam đi ngang xua tay: *"Tí nữa tao rửa!"*. Cú Whip Pan nhanh với Motion Blur 180° quét ngang theo bước chân Nam.
  * *Lát 2C (00:22 – 00:26):* Medium Two-Shot 35mm. Đêm muộn. Tùng đi làm thêm về kiệt sức ngồi xoa bóp bắp chân ở mép nệm. Nam nhìn bạn, chủ động gập điện thoại thoát game, với tay lấy cốc nước mát đẩy sang cho Tùng: *"Uống đi cho đỡ mệt"*.
* **Ánh sáng & Hiệu ứng người đóng:**
  * Lát 2A & 2B: Ánh sáng ban ngày chói gắt, bóng đổ sắc nét (Hard Sun Shadow), khói thuốc mờ ảo.
  * Lát 2C: Chuyển sang ánh đèn tuýp vàng ấm cúng (Tungsten 3200K), ánh sáng mềm mại dịu dàng làm nổi bật tình bạn gắn bó chân thành.
* **Voice-over:**
  * **LỜI DẪN [Giọng thân mật, giảm nét đùa, chân thành]:**  
    > *"Nam không phải người xấu. Cậu chỉ mắc đúng một căn bệnh nan y của tuổi trẻ: Trì hoãn. Việc gì cũng có thể đợi đến... tí nữa. Nhưng kỳ lạ là, ở cùng một thằng lười như Nam... thi thoảng cũng thấy dễ chịu."*

---

### SHOT 3: ĐỘC THOẠI BẾ TẮC & SỰ PHẢN CHIẾU ĐẢO BÊN (00:26 – 00:38 | Frame 624 – 912)

* **Góc máy & Cử động:**
  * **Khung hình:** Medium Close-Up $\to$ Slow Push-In (Đẩy máy từ từ vào gương mặt Nam đối diện chiếc gương).
  * **Tiêu cự:** 50mm f/1.4 Anamorphic với DOF cực nông, làm nhòe toàn bộ phòng trọ phía sau thành những đốm Bokeh elip lung linh.
* **Ánh sáng & Phối màu Chiaroscuro kiểu David Fincher:**
  * Màn hình laptop hiển thị đồng hồ đếm ngược đỏ rực: `Hạn chót: 23:59 — THIẾU BÀI TẬP`.
  * Luồng sáng trắng xanh lạnh (Cold Cyan Light) từ laptop hắt ngược lên nửa khuôn mặt Nam, nửa mặt còn lại chìm hoàn toàn vào bóng tối đen thẳm.
  * *Halation:* Quầng đỏ ấm rực bao quanh các con số điện tử của đồng hồ đếm ngược.
* **Hành động & Chi tiết bất thường (Curiosity Hook #3):**
  * Nam mệt mỏi đưa **tay phải** lên gãi đuôi mắt trái (vị trí có nốt ruồi thật).
  * **TRONG GƯƠNG:** Hình ảnh phản chiếu đưa **tay trái** lên... **nhưng nốt ruồi trong gương lại nằm ở đuôi mắt PHẢI!**
  * Đôi mắt của cái bóng trong gương không nhìn vào mắt Nam thật mà đang **nhìn thẳng trừng trừng ra phía khán giả màn ảnh** (Phá vỡ bức tường thứ 4 — Fourth Wall Break)!
* **SFX & Music Transition:**
  * Nhạc Lo-fi ngưng bặt đột ngột bằng hiệu ứng đĩa than bị hãm phanh (*Vinyl Brake Stop*).
  * Tiếng quạt trần quay lạch cạch đơn điệu: *kẽo kẹt... kẽo kẹt...*
  * Một nốt Cello trầm đục (Low Cello Drone 45Hz) bắt đầu trườn vào, kéo dài u uất rợn gai ốc.
* **Voice / Độc thoại:**
  * **NAM [Độc thoại nội tâm, giọng mệt mỏi, bất lực]:**  
    > *"Làm người lớn mệt mỏi vãi chưởng... Deadline dí, học lại, áp lực gia đình... Ước gì có ai đó gánh hết phiền toái, sống hộ mình cái cuộc đời này thì sướng biết mấy..."*

---

### SHOT 4: CÚ BẺ LÁI MA MỊ — BÀN TAY XUYÊN KÍNH & HITCHCOCK DOLLY ZOOM (00:38 – 00:44 | Frame 912 – 1056)

* **Góc máy & Kỹ thuật máy quay:**
  * **Cú máy Hitchcock Vertigo Effect (Dolly-In kết hợp Zoom-Out):** Camera tiến sát vào lưng Nam trong khi trường nhìn (FOV) giãn rộng ra, khiến không gian căn phòng trọ và chiếc gương dường như bị kéo giãn méo mó vô tận!
  * **Góc quay:** Dutch Angle 15° nghiêng lệch tạo cảm giác mất trọng lực thực tại.
* **Hành động & Diễn xuất:**
  * Nam thật thở dài, xoay người bước quay lưng đi...
  * **NHƯNG HÌNH ẢNH TRONG GƯƠNG KHÔNG QUAY LƯNG ĐI!**
  * Cái bóng vẫn đứng nguyên tại chỗ, từ từ ngẩng đầu lên, nhếch mép cười sắc lạnh.
  * Mặt kính gương gợn sóng biến dạng như một hồ nước đêm. **Bàn tay Người Trong Gương mặc áo sơ mi xanh thò hẳn ra ngoài không gian thực**, những ngón tay chạm nhẹ vào gáy của Nam nhưng Nam không hề hay biết!
* **VFX Shaders Điện ảnh (Remotion):**
  * `FluidDisplacement`: Mặt kính biến dạng gợn sóng hình tròn (Water Ripple Shader) tại điểm bàn tay xuyên qua.
  * `EerieCyanGlow`: Mặt gương bùng phát luồng ánh sáng lân tinh xanh lục ma quái kèm theo vệt Anamorphic Streak xanh quét ngang toàn bộ khung hình.
* **SFX Multi-layer Sound Design:**
  * *SFX Sub-drop 40Hz:* Cú dập bass siêu trầm làm rung chuyển toàn bộ không gian phòng chiếu.
  * *SFX Fluid:* Tiếng kính hóa lỏng gợn sóng: *ù... ùng... ục...*, tiếng hơi lạnh buốt giá xì ra.
  * *Voice Binaural:* Giọng thì thầm đảo 2 tai sắc lẹm, ma mị:
    > **NGƯỜI TRONG GƯƠNG [Thì thầm ma mị, vang vọng đa chiều]:**  
    > *"Mày thấy mệt mỏi rồi đúng không?... Cuộc đời ngoài kia... để tao sống thay cho."*

---

### SHOT 5: MẶT KÍNH ĐÔNG CỨNG & TITLE DROP (00:44 – 00:48 | Frame 1056 – 1152)

* **Góc máy:** Cực cận mặt gương $\to$ Chớp đen đột ngột (Hard Cut to Black).
* **Hành động:**
  * Bàn tay rụt vào, mặt kính đông cứng phẳng lặng như gương soi bình thường. Trong gương, cái bóng đã ngồi ngay ngắn ở bàn học của Nam.
  * Một vết nứt sắc lẹm rạch đôi màn hình đen, ánh sáng xanh bùng nổ hiện Logo chính thức:
    ```
    T H E   C R A C K   I N   R E A L I T Y
            HỒ SƠ 02: NGƯỜI TRONG GƯƠNG
    ```
  * Dòng Tagline màu bạc hiện mờ bên dưới: *"Có những chiếc bóng... không bao giờ nên để bước ra ngoài."*
* **SFX:**
  * Tiếng then sắt cửa phòng trọ cài chốt cực mạnh: **"CẠCH!"** (Dry, in-your-face, không reverb).
  * Tiếng kính nứt rạn: *Rắccc...* rồi tắt lịm, chừa lại 1 giây tĩnh lặng tuyệt đối trước khi vào tập phim.

---

# PHẦN 2: BẢNG PHÂN CẢNH KỸ THUẬT TRAILER (60 GIÂY)
* **Thời lượng:** 60 giây (1440 frames @ 24fps)
* **Cấu trúc:** Hollywood Psychological Thriller Teaser (4 Hồi nghẹt thở)
* **Mục tiêu:** Kích thích sự tò mò, tạo cảm giác phim người đóng ly kỳ, giật gân, đưa người xem vào mê cung tâm lý của việc bị đánh cắp danh tính.

```
TIMECODE RULER (TRAILER 60s @ 24fps):
00:00                 00:15                 00:32                               00:50        00:60
[ HỒI 1: CÁM DỖ NGỌT ] [ HỒI 2: KẺ THẾ THÂN ] [ HỒI 3: ĐÀO THẢI & NỖI SỢ ]       [ HỒI 4: BẪY SẬP & TWIST ]
(0 - 360f)            (360 - 768f)          (768 - 1200f)                       (1200 - 1440f)
```

---

### HỒI 1: CÁM DỖ CỦA SỰ TIỆN LỢI & CÚ CHẠM MẶT ĐẦU TIÊN (00:00 – 00:15 | Frame 0 – 360)

* **Cảnh T01 (00:00 – 00:04 | Cực cận con ngươi & Sự kiệt quệ):**
  * *Camera:* Extreme Macro Close-up vào mắt Nam đỏ ngầu, tơ máu chằng chịt.
  * *VFX Người đóng:* Màn hình điện thoại phản chiếu trong con ngươi có hiện tượng quang sai thấu kính (Chromatic Aberration 2px). Hạt phim 35mm nặng hạt (Heavy Grain). Làn khói thuốc lá mờ ảo trôi ngang ống kính.
  * *Voice Nam:* *"Làm người lớn mệt mỏi vãi chưởng... Deadline dí, học lại, gia đình soi mói... Ước gì cứ nằm một chỗ chơi game ăn mì tôm cả đời!"*
  * *SFX:* Tiếng game: *Defeat!*, tiếng chuông điện thoại giục tiền trọ dồn dập.
* **Cảnh T02 (00:04 – 00:09 | Cú chạm mặt ở bồn rửa & Whip Zoom):**
  * *Visual:* Sáng hôm sau. Nam ngái ngủ lảo đảo bước ra bồn rửa. Một bóng người mặc áo xanh của Nam đang cặm cụi rửa sạch bóng đống bát đĩa.
  * *Action:* Người đó quay đầu lại... **GƯƠNG MẶT GIỐNG HỆT NAM 100%!**
  * *Camera:* **Whip Zoom cực nhanh (Crash Zoom 24mm $\to$ 85mm)** vào khuôn mặt Nam thật đang há hốc mồm kinh hoàng.
  * *Thoại:* 
    * Nam: *"Mày... mày là ai?!"*
    * Người Kia (giọng phẳng lặng, mắt không hề chớp): *"Tao tên Nam."*
  * *SFX:* Tiếng quất dây violin rít chói gắt (*Violin Screech*), tiếng nước chảy ào ào bị ngắt cụt.
* **Cảnh T03 (00:09 – 00:15 | Bản hợp đồng ngầm & Sự thỏa mãn):**
  * *Camera:* Low Angle từ dưới mặt bàn nhìn lên Nam đập phong bì tiền 3 triệu xuống bàn thị uy: *"Phòng này tao là nóc nhà! Mày làm thuê thì biết điều, cấm đụng vào đồ tao!"*.
  * *Action:* Người Kia gật đầu ngoan ngoãn.
  * *Cắt cảnh nhanh:* Nam nằm vắt chân chữ ngũ trên nệm húp mì tôm cười đắc chí: *"Có thằng hầu hạ nhàn vãi chưởng!"*
  * *Voice Người Kia (thì thầm):* *"Mày ngại thuyết trình Lab 402 đúng không? Để tao lên nói cho."*
  * *Nam vội dúi thẻ sinh viên:* *"Lên flex hộ tao lấy điểm A rồi lượn lẹ nhé!"*

---

### HỒI 2: KẺ THẾ THÂN HOÀN HẢO & MANH MỐI BẤT THƯỜNG (00:15 – 00:32 | Frame 360 – 768)
*Nhạc nền: Trailer Braam dồn dập (Trống Taiko phối hợp âm Synthwave nặng trịch, dải Shepard Tone tăng tiến)*

* **Cảnh T04 (00:15 – 00:22 | Montage vinh quang của Kẻ Thế Thân — 1s/shot):**
  * *Shot 1:* Người Kia đứng trên bục Lab 402 đĩnh đạc, slide hiện số **9.5** to đùng, giảng viên và bạn học vỗ tay rào rào.
  * *Shot 2:* Sân bóng đá mini, Người Kia vung chân trái sút tung nóc lưới ghi bàn quyết định, đồng đội ôm chúc mừng reo hò.
  * *Shot 3:* Tùng xách cơm sườn về vỗ vai: *"Nay phòng sạch bong, bài nộp trước hạn, mai mặt trời mọc đằng tây à?"*
  * *Shot 4:* Điện thoại reo, Bác Hai cười rạng rỡ giữa tiệc cỗ họ: *"Cả họ xem thằng Nam nay chững chạc chưa này!"*
* **Cảnh T05 (00:22 – 00:27 | SỰ ĐỐI LẬP KINH HOÀNG — The Rotting Original):**
  * *Camera:* Cắt song song tương phản (Cross-cutting) giữa hai thực thể:
    * Người Kia: Quần áo phẳng phiu, da dẻ hồng hào, nụ cười sáng rực giữa đám đông (Tông màu ấm áp Golden Hour).
    * Nam thật: Nằm co quắp trong góc phòng tối ẩm mốc, da dẻ tái mét, mắt trũng sâu, móng tay thâm đen như một kẻ ốm liệt giường (Tông màu xanh rêu lạnh Desaturated).
  * *Curiosity Hook:* Mỗi khi Người Kia nhận được một lời khen, Nam thật lại ôm ngực thở dốc hụt hơi, như sinh lực sống đang bị rút cạn dần qua không khí!
* **Cảnh T06 (00:27 – 00:32 | Cuộc trò chuyện lúc nửa đêm & Lời gài bẫy):**
  * *Visual:* Phòng trọ tối đen chỉ có ánh sáng xanh từ màn hình máy tính. Người Kia ngồi bất động như một bức tượng trên ghế đẩu giữa phòng, hai mắt mở trừng trừng trong đêm. Dưới ánh đèn tuýp, **bóng đổ trên tường của Người Kia không hề có nhịp phập phồng lồng ngực**!
  * *Thoại Nam (nửa đùa nửa run):* *"Ê mày, rốt cuộc mày từ đâu chui ra đấy? Đừng bảo là clone nhân bản trốn trại nhé?"*
  * *Camera:* Slow Dolly-In vào nụ cười không có độ ấm của Người Kia:
  * *Thoại Người Kia:* *"Mày thấy mệt mỏi thì cứ nằm đây nghỉ đi... Cuộc đời ngoài kia, để tao sống thay cho."*

---

### HỒI 3: BỊ ĐÀO THẢI, MANH MỐI NỐT RUỒI & NỖI SỢ BIẾN MẤT (00:32 – 00:48 | Frame 768 – 1152)

* **Cảnh T07 (00:32 – 00:38 | Bị đào thải khỏi thế giới thật):**
  * *SFX:* **TOÀN BỘ NHẠC TẮT PHỤT.** Chỉ còn tiếng nhịp tim đập nặng nề: *THUMP... THUMP...*
  * *Visual:* Nam thật quyết định bước ra giảng đường để đòi lại vị trí. Nhưng đứng trên bục giảng, Nam run lẩy bẩy làm rơi viên phấn, lắp bắp không hiểu gì về bài giảng.
  * *Sinh viên dưới lớp cười mỉa:* *"Ủa, nay Nam bị lag mạng à?", "Hôm trước hack não xài hết mana rồi à?"*
  * *Giảng viên đập bàn quát lớn:* *"Trừ 2 điểm chuyên cần cả nhóm!"*
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
  * *Kỹ thuật máy quay:* Chuyển sang **Shutter Angle 90°** khiến từng cử động vung búa giật cục, sắc bén nghẹt thở.
  * *Người Kia đứng cạnh gương, lạnh lùng đáp trả:*
    > *"Mày đập gương rồi mày định lấy cái thân xác ăn hại này ra làm khổ họ tiếp à?"*

---

### HỒI 4: BẪY SẬP, SUBLIMINAL FLASHES & CLIFFHANGER TỐI THƯỢNG (00:48 – 01:00 | Frame 1152 – 1440)

* **Cảnh T10 (00:48 – 00:52 | Mặt kính hóa nước & Cú nuốt chửng):**
  * *Camera:* Slow motion 60fps. Búa sắt tuột tay rơi xuống sàn: **"KENG!"** (Echo vang vọng).
  * *Action:* Nam ngã nhào chạm tay vào gương. Mặt kính gợn sóng biến thành hồ nước đen tuyền buốt giá!
  * *VFX:* Hàng chục cánh tay nhợt nhạt từ đáy nước trong gương vươn lên tóm chặt cổ tay, lôi tuột toàn bộ thân thể Nam chìm sâu vào mặt kính!
  * *Thoại Nam gào nghẹn dưới nước:* *"Không... cứu...!"* $\to$ Bong bóng khí vỡ tan, mặt kính phẳng lại như cũ.
* **Cảnh T11 (00:52 – 00:54 | SUBLIMINAL FLASH-FRAMES — 3 FRAME ÁM ẢNH (1/24s mỗi frame)):**
  * *Flash 1 (Frame 1248):* Gương mặt Nam thật đang áp sát mặt kính từ bên trong, miệng há hốc kêu gào trong tuyệt vọng không ra tiếng.
  * *Flash 2 (Frame 1256):* Bức ảnh chụp chung của cả phòng trọ trên bàn: Khuôn mặt Nam thật trong ảnh từ từ biến mất, chỉ còn lại khoảng trống nham nhở.
  * *Flash 3 (Frame 1264):* Đôi mắt Người Kia trợn tròn nhìn thẳng vào ống kính máy quay với nụ cười rộng đến mang tai.
* **Cảnh T12 (00:54 – 00:58 | CLIFFHANGER TỘT ĐỈNH VỚI TÙNG):**
  * *Bối cảnh:* Phòng trọ đêm khuya tinh tươm sạch sẽ. Tùng xách túi bún chả bước vào: *"Nam ơi, ăn bún chả đi rồi tối tao kèm lại bài cho!"*
  * *Action:* Người Kia mỉm cười tươi tắn, vươn **TAY TRÁI** đón lấy túi đồ ăn (Nam thật thuận tay phải).
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

| STT | Chi tiết cài cắm (Easter Egg) | Vị trí xuất hiện | Ý nghĩa bí ẩn / Lời giải thích |
|:---:|---|---|---|
| 1 | **Độ trễ gương 5 frames** | Shot 1 Opening (00:07) | Cái bóng cử động trễ hơn Nam 0.2s, chứng minh nó không phải phản chiếu quang học mà là một thực thể độc lập đang bắt chước. |
| 2 | **Nốt ruồi đảo nghịch (Mirror Inversion)** | Khắp Opening & Trailer | Nam thật: Nốt ruồi ở đuôi mắt **TRÁI**.<br>Người Trong Gương: Nốt ruồi ở đuôi mắt **PHẢI** (Quy luật đối xứng gương). |
| 3 | **Thuận tay trái (Left-handed)** | Cảnh T04 & T12 Trailer | Nam thật thuận tay phải. Bản sao luôn cầm bút, sút bóng, nhận đồ bằng **tay trái**. |
| 4 | **Dòng chữ trên khung gỗ** | Shot 0 Opening (00:02) | *"Đừng mở vải sau 0h"* — Manh mối cho thấy đã từng có người thuê trọ trước đây chịu chung số phận bị thay thế. |
| 5 | **Bóng không đầu / Mất bóng** | Cảnh T06 Trailer (00:30) | Dưới ánh đèn tuýp, bóng đổ trên tường của Người Kia không có cử động thở phập phồng của lồng ngực. |
| 6 | **Âm thanh Shepard Tone** | Nhạc nền Hồi 3 Trailer | Dải tần số âm thanh tăng tiến vô tận tạo ảo giác bất an và dồn dập không lối thoát. |

---

# PHẦN 3: CHEAT SHEET CODE SHADER & COMPONENT REMOTION (LIVE-ACTION SUITE)
*(Dành cho đội ngũ lập trình Remotion để tạo chất phim người đóng 1:1 trong mã nguồn)*

```tsx
import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

// 1. Tỉ lệ khung hình Anamorphic 2.39:1 (Cinemascope Letterbox)
export const CinematicLetterbox: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#000' }}>
      {children}
      {/* Thanh đen trên và dưới chuẩn Anamorphic 2.39:1 trên khung 16:9 */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '12.5%', backgroundColor: '#050505', zIndex: 100 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '12.5%', backgroundColor: '#050505', zIndex: 100 }} />
    </div>
  );
};

// 2. Mô phỏng chuyển động thở máy quay cầm tay vác vai (Handheld Camera Breathing)
export const HandheldCamera: React.FC<{ frame: number; children: React.ReactNode }> = ({ frame, children }) => {
  // Chuyển động sin phức hợp mô phỏng nhịp thở của cameraman
  const x = Math.sin(frame * 0.04) * 1.2 + Math.cos(frame * 0.09) * 0.6;
  const y = Math.cos(frame * 0.05) * 1.5 + Math.sin(frame * 0.08) * 0.8;
  const rotation = Math.sin(frame * 0.03) * 0.15;

  return (
    <div style={{ transform: `translate3d(${x}px, ${y}px, 0px) rotate(${rotation}deg)`, width: '100%', height: '100%' }}>
      {children}
    </div>
  );
};

// 3. Bộ lọc mô phỏng chất phim nhựa 35mm (Grain, Halation & Black Pro-Mist)
export const Film35mmPostProcess: React.FC = () => {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        {/* Hạt phim 35mm hữu cơ Kodak Vision3 */}
        <filter id="filmGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.15 0" in="noise" result="coloredNoise" />
          <feBlend mode="overlay" in="SourceGraphic" in2="coloredNoise" />
        </filter>

        {/* Quầng sáng đỏ viền phim (Red Halation quanh vùng sáng) */}
        <filter id="redHalation">
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="redPass" />
          <feGaussianBlur in="redPass" stdDeviation="6" result="blurredRed" />
          <feBlend mode="screen" in="SourceGraphic" in2="blurredRed" />
        </filter>

        {/* Mặt kính gợn sóng hóa lỏng (Fluid Water Ripple) */}
        <filter id="fluidMirrorRipple">
          <feTurbulence type="fractalNoise" baseFrequency="0.04 0.08" numOctaves="3" result="rippleNoise" />
          <feDisplacementMap in="SourceGraphic" in2="rippleNoise" scale="30" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
};

// 4. Vệt lóa sáng ngang Anamorphic Blue Streak Flare
export const AnamorphicStreakFlare: React.FC<{ intensity: number; x: number; y: number }> = ({ intensity, x, y }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: `${y}%`,
        width: '100%',
        height: '2px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(0, 180, 255, 0.8) 50%, transparent 100%)',
        opacity: intensity,
        filter: 'blur(1px) drop-shadow(0 0 8px rgba(0, 210, 255, 0.9))',
        transform: 'scaleY(2.5)',
        pointerEvents: 'none',
        zIndex: 90,
      }}
    />
  );
};

// 5. Cú máy Hitchcock Dolly Zoom (Vertigo Effect)
export const HitchcockDollyZoom: React.FC<{ frame: number; startFrame: number; duration: number; children: React.ReactNode }> = ({
  frame,
  startFrame,
  duration,
  children,
}) => {
  // Scale chủ thể tiến tới trong khi hậu cảnh giãn nở
  const progress = interpolate(frame, [startFrame, startFrame + duration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const scale = 1 + progress * 0.45;
  const perspective = 1000 - progress * 400; // Tiêu cự co giãn tạo cảm giác méo không gian

  return (
    <div style={{ perspective: `${perspective}px`, width: '100%', height: '100%' }}>
      <div style={{ transform: `scale(${scale})`, width: '100%', height: '100%', transformOrigin: 'center center' }}>
        {children}
      </div>
    </div>
  );
};
```
