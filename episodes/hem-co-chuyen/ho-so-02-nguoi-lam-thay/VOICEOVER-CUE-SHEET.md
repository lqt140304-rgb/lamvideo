# The Crack in Reality — Hồ sơ 02: Người trong gương
## DANH SÁCH THOẠI & VOICEOVER CUE SHEET (ELEVENLABS / LỒNG TIẾNG)

Tài liệu này bóc tách **100% toàn bộ câu thoại, độc thoại nội tâm, lời dẫn chuyện và tiếng thì thầm** của dự án *The Crack in Reality: Người trong gương*, chuẩn hóa mã định danh file (Cue ID), thông số giọng đọc và thẻ cảm xúc phục vụ sản xuất audio trên **ElevenLabs** hoặc phòng thu lồng tiếng.

---

## 🎙️ BẢNG CẤU HÌNH GIỌNG ĐỌC (VOICE CAST & SETTINGS)

| Nhân vật | Voice ID Đề xuất / Model | Đặc tính giọng | Cài đặt ElevenLabs tham khảo | Ghi chú xử lý âm thanh (Post-FX) |
|---|---|---|---|---|
| **LỜI DẪN (Narrator)** | Giọng nam 28–35 tuổi, miền Bắc hoặc miền Nam trung tính | Trầm ấm, tự nhiên, gần gũi, hơi dí dỏm đời thường, không mang tính giật gân rẻ tiền. | *Stability: 0.65<br>Clarity: 0.85<br>Style: 0.15* | Thu âm chuẩn Dry studio, nén nhẹ comp, EQ ấm 150–250Hz. |
| **NAM (Nam thật)** | Giọng nam 20 tuổi, sinh viên năm 2 | Trẻ trung, hơi uể oải, lười nhác, ngái ngủ; khi hoảng loạn thì thở hụt hơi, run rẩy, gắt gỏng tự ái. | *Stability: 0.40<br>Clarity: 0.75<br>Style: 0.35* | Lời nói thường: Dry.<br>Độc thoại nội tâm: Reverb phòng nhỏ 15%, giảm treble.<br>Lúc hoảng: Thêm tiếng thở dốc. |
| **NGƯỜI TRONG GƯƠNG** | Cùng Voice ID với Nam nhưng tone giọng phẳng | Giống hệt âm sắc của Nam nhưng ngữ điệu điềm tĩnh, lạnh ngắt, phẳng lặng, không biến thiên cảm xúc. | *Stability: 0.85<br>Clarity: 0.90<br>Style: 0.00* | Lúc nói chuyện: Dry, đều đều.<br>Lúc thì thầm ma mị: **Binaural Stereo Panning** (chạy đảo 2 tai), thêm whisper layer + sub-bass 50Hz. |
| **TÙNG (Bạn cùng phòng)** | Giọng nam 20 tuổi | Năng động, to rõ, bộc trực, thẳng tính, hay càu nhàu trêu bạn nhưng rất chân thành. | *Stability: 0.55<br>Clarity: 0.80<br>Style: 0.25* | Lúc trong phòng: Dry tự nhiên.<br>Lúc gọi điện thoại (P1): **Bandpass filter 300Hz–3.4kHz** (giả lập loa điện thoại). |
| **GIẢNG VIÊN (Thầy giáo)** | Giọng nam 50–55 tuổi | Nghiêm nghị, đanh thép, học thuật, pha chút thất vọng và gắt gao. | *Stability: 0.75<br>Clarity: 0.85<br>Style: 0.20* | Không gian hội trường lớn (Large Hall Reverb 25%, delay 40ms). |
| **BÁC HAI (Họ hàng)** | Giọng nam 55–60 tuổi, miền Tây / Nam Bộ | Hào sảng, sang sảng, chất phác, vui vẻ giữa tiệc rượu gia đình. | *Stability: 0.60<br>Clarity: 0.80<br>Style: 0.30* | Âm thanh trích xuất từ video điện thoại (Phone mic EQ + tiếng ồn mâm cỗ nền). |
| **MẸ NAM** | Giọng nữ 48–52 tuổi, miền quê | Dịu dàng, xúc động, thương con, ấm áp. | *Stability: 0.70<br>Clarity: 0.80<br>Style: 0.20* | Qua loa thoại Zalo thoại (Loa ngoài điện thoại, hơi rè nhẹ). |
| **SINH VIÊN (Bạn bè)** | Nam/Nữ sinh viên 20 tuổi | Trêu chọc, xì xào, bàn tán. | *Stability: 0.50<br>Clarity: 0.75<br>Style: 0.30* | Xì xào không gian lớp học (Crowd murmur). |

---

## MỤC 0: OPENING & TRAILER CHÍNH THỨC

### 0.1. Opening Tập phim (48 giây)

| Cue ID | Nhân vật | Hướng dẫn diễn xuất / Emotion Tag | Lời thoại chi tiết (Exact Prompt Text) | Est. (s) | Post-FX Audio |
|---|---|---|---|:---:|---|
| `OP_NARR_01` | LỜI DẪN | [warm, casual, hơi cười trong giọng] | "Đây là Nam. Sinh viên năm hai, hiện đang tạm trú tại một phòng trọ nhỏ cùng Tùng... thằng bạn thân nghiêm túc đến phát mệt." | 5.5s | Dry studio, ấm |
| `OP_NARR_02` | LỜI DẪN | [chân thành, tự nhiên, giảm nét đùa] | "Nam không phải người xấu. Cậu chỉ mắc đúng một căn bệnh nan y của tuổi trẻ: Trì hoãn. Việc gì cũng có thể đợi đến... tí nữa. Nhưng kỳ lạ là, ở cùng một thằng lười như Nam... thi thoảng cũng thấy dễ chịu." | 7.5s | Dry studio |
| `OP_NAM_01` | NAM | [mệt mỏi, bất lực, thở dài ngao ngán] | "Làm người lớn mệt mỏi vãi chưởng... Deadline dí, học lại, áp lực gia đình... Ước gì có ai đó gánh hết phiền toái, sống hộ mình cái cuộc đời này thì sướng biết mấy..." | 7.0s | Độc thoại nội tâm, Reverb phòng nhỏ |
| `OP_GUE_01` | NGƯỜI TRONG GƯƠNG | [thì thầm ma mị, lạnh buốt rợn gáy] | "Mày thấy mệt mỏi rồi đúng không?... Cuộc đời ngoài kia... để tao sống thay cho." | 5.0s | Binaural pan, Whisper layer, Sub-bass 50Hz |

---

### 0.2. Trailer Chính Thức (60 giây)

| Cue ID | Nhân vật | Hướng dẫn diễn xuất / Emotion Tag | Lời thoại chi tiết (Exact Prompt Text) | Est. (s) | Post-FX Audio |
|---|---|---|---|:---:|---|
| `TR_NAM_01` | NAM | [uể oải, càu nhàu trong lúc bấm game] | "Nói thật... làm người lớn mệt mỏi vãi chưởng. Deadline dí, học lại, áp lực gia đình... Ước gì cứ nằm một chỗ chơi game ăn mì tôm cả đời!" | 4.0s | Lồng tiếng trailer |
| `TR_NAM_02` | NAM | [hoảng hốt, sợ hãi, hét lớn] | "Mày... mày là ai?!" | 1.0s | Khô, hoảng loạn |
| `TR_GUE_01` | NGƯỜI TRONG GƯƠNG | [điềm tĩnh, phẳng lặng] | "Tao tên Nam." | 1.0s | Lạnh lùng |
| `TR_NAM_03` | NAM | [hống hách, đập bàn thị uy] | "Mày biết điều đấy! Phòng này tao là nóc nhà! Tao bảo ngồi thì ngồi, cấm đụng vào đồ của tao!" | 3.0s | To tiếng |
| `TR_GUE_02` | NGƯỜI TRONG GƯƠNG | [bình thản, thực tế] | "Mày lên đó mà cà lăm là cả nhóm ăn con zero, đóng hai củ rưỡi học lại đấy." | 3.0s | Rõ ràng |
| `TR_NAM_04` | NAM | [vội vã, buông xuôi ỷ lại] | "Mày lên flex hộ tao lấy điểm A rồi lượn lẹ nhé!" | 2.5s | Hấp tấp |
| `TR_TUNG_01` | TÙNG | [hồ hởi, trêu chọc] | "Nay phòng sạch bong, bài nộp trước hạn, mai mặt trời mọc đằng tây à?" | 2.5s | Thoại phòng |
| `TR_BACHAI_01`| BÁC HAI | [hào sảng, cười rạng rỡ giữa tiệc cỗ] | "Cả họ xem thằng Nam nay chững chạc chưa này!" | 2.5s | Phone recording FX |
| `TR_NAM_05` | NAM | [nửa đùa nửa thật, vừa bấm game] | "Ê mày, rốt cuộc mày từ đâu chui ra đấy? Đừng bảo là clone nhân bản trốn trại nhé?" | 3.5s | Tự nhiên |
| `TR_GUE_03` | NGƯỜI TRONG GƯƠNG | [trầm ấm, ma mị, rót mật vào tai] | "Mày thấy mệt mỏi thì cứ nằm đây nghỉ đi... Cuộc đời ngoài kia... để tao sống thay cho." | 4.5s | Echo nhẹ rợn gáy |
| `TR_NAM_06` | NAM | [thì thầm run rẩy, kinh hoàng cực độ] | "Nếu nó làm mọi thứ tốt hơn mình... thì mình là cái thứ gì đang đứng ở đây?!" | 4.0s | Thở dốc, nghẹn ngào |
| `TR_GVIEN_01` | GIẢNG VIÊN | [nghiêm khắc, giận dữ đập bàn] | "Trừ hai điểm chuyên cần cả nhóm!" | 1.5s | Vang giảng đường |
| `TR_TUNG_02` | TÙNG | [bực bội, thất vọng] | "Đang phong độ tốt tự dưng thụt lùi làm cả nhóm bị trừ điểm oan là sao?!" | 3.0s | Gắt gỏng |
| `TR_NAM_07` | NAM | [gầm thét xé họng, tuyệt vọng] | "Nó là Người Trong Gương! Tao sẽ đập nát cái gương này!" | 3.0s | Hét gào đỉnh điểm |
| `TR_GUE_04` | NGƯỜI TRONG GƯƠNG | [điềm tĩnh bóc trần, nhát dao tâm lý] | "Chính mày đã tạo ra tao... Mày đập gương rồi mày định lấy cái thân xác ăn hại này ra làm khổ họ tiếp à?" | 4.5s | Lạnh ngắt, dứt khoát |
| `TR_NAM_08` | NAM | [tiếng gào nghẹn ứ dưới nước] | "Không... cứu...!" | 1.5s | Bóp nghẹt dưới nước |
| `TR_TUNG_03` | TÙNG | [chột dạ, giọng sững lại] | "Ủa Nam... nốt ruồi bên mắt mày... sao nay lại nằm bên phải?" | 3.0s | Hoang mang sững sờ |
| `TR_GUE_05` | NGƯỜI TRONG GƯƠNG | [chậm rãi, tà ác không cảm xúc] | "Mày nhìn nhầm rồi... Tao là Nam mà." | 3.0s | Rợn người |

---

## MỤC 1: PHẦN 1 — NGƯỜI TRONG PHÒNG (~4:50)

### 1.1. P1.00 — Hồi tưởng mở đầu

| Cue ID | Nhân vật | Hướng dẫn diễn xuất / Emotion Tag | Lời thoại chi tiết (Exact Prompt Text) | Est. (s) | Post-FX Audio |
|---|---|---|---|:---:|---|
| `P1_NARR_001` | LỜI DẪN | [storytelling, tự nhiên] | "Đây là Nam. Sinh viên năm hai, ở trọ cùng Tùng." | 3.0s | Dry studio |
| `P1_NARR_002` | LỜI DẪN | [hơi cười trong giọng, vui vẻ] | "Cậu có một câu cửa miệng: 'Tí nữa.' Bài nhóm, rửa chén, đi học... việc gì cũng có thể đợi." | 5.5s | Dry studio |
| `P1_NARR_003` | LỜI DẪN | [ấm áp, chân thành] | "Nhưng hôm nào Tùng có chuyện, Nam vẫn chịu bỏ dở ván game để ngồi nghe. Ở cùng cậu, có lúc cũng dễ chịu." | 6.0s | Dry studio |
| `P1_NAM_001` | NAM | [casual, nói thuận miệng khi chơi game] | "Tí tao rửa. Mày ngủ đi." | 2.0s | Phòng trọ đêm |
| `P1_NARR_004` | LỜI DẪN | [bình thản, thực tế] | "Còn đống chén tối đó, cậu vẫn để lại cho sáng mai." | 3.5s | Dry studio |

---

### 1.2. P1.01 — Tiếng rửa chén & Cú chạm mặt

| Cue ID | Nhân vật | Hướng dẫn diễn xuất / Emotion Tag | Lời thoại chi tiết (Exact Prompt Text) | Est. (s) | Post-FX Audio |
|---|---|---|---|:---:|---|
| `P1_NAM_002` | NAM | [ngái ngủ, càu nhàu trong chăn] | "Tùng, nhẹ tay chút coi. Tao đang ngủ." | 2.5s | Ngái ngủ, chăn mền |
| `P1_NAM_003` | NAM | [bực bội, chưa nhìn rõ mặt] | "Ê, áo đó của tao..." | 1.8s | Vừa ngồi dậy |
| `P1_NAM_004` | NAM | [dè dặt, cố tìm lời giải hợp lý] | "Tùng thuê mày hù tao hả?" | 2.0s | Lúng túng |
| `P1_GUE_001` | NGƯỜI TRONG GƯƠNG | [bình thản, giọng giống hệt Nam] | "Không. Tao thấy chén chưa rửa nên làm luôn." | 3.0s | Dry, đều đều |
| `P1_NAM_005` | NAM | [sợ hãi, hét lớn giật lùi] | "Đứng đó! Đừng tới gần tao!" | 2.0s | Hoảng loạn, thở dốc |
| `P1_NAM_006` | NAM | [cố giữ bình tĩnh, chắn sau cửa] | "Mày là ai?" | 1.2s | Run rẩy |
| `P1_GUE_002` | NGƯỜI TRONG GƯƠNG | [tự nhiên, không do dự] | "Tao tên Nam." | 1.2s | Tự nhiên |
| `P1_NAM_007` | NAM | [cáu gắt vì hoang mang] | "Đừng có giỡn. Sao mày vào đây?" | 2.0s | Gay gắt |
| `P1_GUE_003` | NGƯỜI TRONG GƯƠNG | [ngắn gọn] | "Cửa mở." | 1.0s | Ngắn gọn |
| `P1_NAM_008` | NAM | [nói hụt hơi vào điện thoại] | "Mày... mày đang trên trường thật hả?" | 2.2s | Nói gấp gáp |

---

### 1.3. P1.02 — Cuộc gọi với Tùng

| Cue ID | Nhân vật | Hướng dẫn diễn xuất / Emotion Tag | Lời thoại chi tiết (Exact Prompt Text) | Est. (s) | Post-FX Audio |
|---|---|---|---|:---:|---|
| `P1_TUNG_001` | TÙNG | [nói nhỏ vì đang trong lớp] | "Gì vậy? Tao đang học." | 1.5s | Phone EQ bandpass |
| `P1_TUNG_002` | TÙNG | [hơi bực mình] | "Ừ, tao đang trên trường. Có chuyện gì?" | 2.0s | Phone EQ bandpass |
| `P1_NAM_009` | NAM | [sợ hãi, nói thì thào nhưng gấp] | "Có một thằng... giống y tao. Nó đang trong phòng mình." | 3.5s | Thoại phòng trọ |
| `P1_TUNG_003` | TÙNG | [gạt phắt đi, nghĩ bạn nói nhảm] | "Mày xàm hả? Ngủ chưa tỉnh à? Thôi, tao đang học." | 3.0s | Phone EQ bandpass |
| `P1_NAM_010` | NAM | [vội vã níu kéo] | "Tao nói thật. Tùng, khoan..." | 1.8s | Cúp máy đột ngột |

---

### 1.4. P1.03 & P1.04 — Đẩy ra hành lang & Hỏi qua cửa

| Cue ID | Nhân vật | Hướng dẫn diễn xuất / Emotion Tag | Lời thoại chi tiết (Exact Prompt Text) | Est. (s) | Post-FX Audio |
|---|---|---|---|:---:|---|
| `P1_GUE_004` | NGƯỜI TRONG GƯƠNG | [nói nhẹ, hai tay buông thõng] | "Tao để chén xuống rồi. Mày muốn tao làm gì?" | 3.0s | Điềm đạm |
| `P1_NAM_011` | NAM | [cố giữ giọng cứng rắn] | "Ra khỏi phòng tao." | 1.5s | Căng thẳng |
| `P1_NAM_012` | NAM | [hốt hoảng né tránh] | "Từ từ! Đừng đi sát tao." | 1.8s | Hốt hoảng |
| `P1_NAM_013` | NAM | [chỉ tay ra hành lang] | "Ra rồi đứng bên đó." | 1.5s | Ra lệnh |
| `P1_GUE_005` | NGƯỜI TRONG GƯƠNG | [vọng từ ngoài cửa] | "Tao đứng đây rồi." | 1.5s | Vọng qua cửa gỗ |
| `P1_NAM_014` | NAM | [nhỏ giọng, căng thẳng run rẩy] | "Đừng nói nữa." | 1.5s | Khẽ, nghẹn giọng |
| `P1_NAM_015` | NAM | [ngập ngừng gọi qua cửa] | "Ê." | 0.8s | Vọng qua cửa |
| `P1_GUE_006` | NGƯỜI TRONG GƯƠNG | [đáp ngay] | "Ơi." | 0.8s | Vọng qua cửa |
| `P1_NAM_016` | NAM | [dò xét] | "Mày chưa đi hả?" | 1.2s | Vọng qua cửa |
| `P1_GUE_007` | NGƯỜI TRONG GƯƠNG | [thản nhiên] | "Mày bảo tao đứng đây mà." | 1.8s | Vọng qua cửa |
| `P1_NAM_017` | NAM | [ra lệnh giữ chân] | "Đợi thằng bạn tao về đã. Đừng đi đâu." | 2.5s | Vọng qua cửa |
| `P1_GUE_008` | NGƯỜI TRONG GƯƠNG | [hỏi lại nhẹ nhàng] | "Ừ. Bao giờ nó về?" | 1.5s | Vọng qua cửa |
| `P1_NAM_018` | NAM | [ngắn gọn] | "Tao nhắn rồi." | 1.0s | Vọng qua cửa |
| `P1_NAM_019` | NAM | [tò mò cật vấn] | "Mày vô đây rửa chén làm gì?" | 2.0s | Vọng qua cửa |
| `P1_GUE_009` | NGƯỜI TRONG GƯƠNG | [thật thà kỳ quặc] | "Thấy đầy bồn thì tao rửa thôi." | 2.0s | Vọng qua cửa |
| `P1_NAM_020` | NAM | [vặn lại] | "Ai nhờ?" | 1.0s | Vọng qua cửa |
| `P1_GUE_010` | NGƯỜI TRONG GƯƠNG | [phục tùng] | "Không ai. Mày không thích thì lần sau tao hỏi." | 2.8s | Vọng qua cửa |
| `P1_NAM_021` | NAM | [gắt lên] | "Không có lần sau gì hết." | 1.5s | Vọng qua cửa |
| `P1_GUE_011` | NGƯỜI TRONG GƯƠNG | [nhẹ nhàng] | "Ừ." | 0.8s | Vọng qua cửa |
| `P1_NAM_022` | NAM | [hỏi kiểm tra đồ đạc] | "Ngoài chén với cái áo, mày còn đụng vào cái gì?" | 3.0s | Vọng qua cửa |
| `P1_GUE_012` | NGƯỜI TRONG GƯƠNG | [đáp rành rọt] | "Cây chổi nữa. Tao quét cạnh bếp. Còn lại không đụng." | 3.0s | Vọng qua cửa |

---

### 1.5. P1.05 & P1.07 — Độc thoại bế tắc bài vở

| Cue ID | Nhân vật | Hướng dẫn diễn xuất / Emotion Tag | Lời thoại chi tiết (Exact Prompt Text) | Est. (s) | Post-FX Audio |
|---|---|---|---|:---:|---|
| `P1_NAM_023` | NAM | [độc thoại nội tâm, tự so sánh] | "Cũng giống mình mà sao nó chăm thế? Rửa bát, quét nhà... Có ai bắt đâu." | 4.0s | Độc thoại Reverb 15% |
| `P1_NAM_024` | NAM | [độc thoại nội tâm, tự ti chua chát] | "Mình thì năm hai rồi. Ngoài chơi game với ngủ ra, làm được cái gì cho ra hồn đâu." | 4.5s | Độc thoại Reverb 15% |
| `P1_NAM_025` | NAM | [độc thoại nội tâm, bị cám dỗ] | "Không biết nó có làm được cái bài này không nhỉ..." | 2.5s | Độc thoại Reverb 15% |
| `P1_NAM_026` | NAM | [độc thoại nội tâm, tự tát tỉnh mình] | "Điên à. Làm gì có chuyện một đứa giống hệt mình lại sẵn sàng giúp mình? Nhỡ nó làm gì thì sao?" | 5.0s | Độc thoại Reverb 15% |
| `P1_NAM_027` | NAM | [dè chừng dặn dò khi đi vệ sinh] | "Mày ra đứng kia. Tao đi vệ sinh. Đừng vào phòng." | 2.8s | Ngoài hành lang |
| `P1_GUE_013` | NGƯỜI TRONG GƯƠNG | [vâng lời] | "Ừ." | 0.8s | Hành lang |
| `P1_NAM_028` | NAM | [độc thoại tự bào chữa để cày game] | "Giải trí tí rồi làm. Càng ngồi càng bí." | 2.5s | Độc thoại phòng trọ |
| `P1_NAM_029` | NAM | [ngái ngủ gọi vọng ra cửa] | "Còn đó không?" | 1.2s | Mệt mỏi |

---

### 1.6. P1.08 — Thức giấc buổi tối & Bài tập được làm hộ

| Cue ID | Nhân vật | Hướng dẫn diễn xuất / Emotion Tag | Lời thoại chi tiết (Exact Prompt Text) | Est. (s) | Post-FX Audio |
|---|---|---|---|:---:|---|
| `P1_NAM_030` | NAM | [hoảng hốt bật dậy quát lớn] | "Ai cho mày vào?!" | 1.5s | Giật mình hoảng sợ |
| `P1_GUE_014` | NGƯỜI TRONG GƯƠNG | [giọng bình thản tại bàn học] | "Cửa không chốt. Tao kêu mày mấy lần, mày không dậy." | 3.0s | Tại bàn học |
| `P1_NAM_031` | NAM | [bực bội gắt gỏng] | "Tao bảo mày đứng ngoài!" | 1.5s | Cáu gắt |
| `P1_GUE_015` | NGƯỜI TRONG GƯƠNG | [thuyết phục bằng kết quả] | "Ừ. Tao thấy bài đang mở nên làm thử. Mày xem trước đi, chưa gửi cho ai đâu." | 4.5s | Ôn tồn |
| `P1_NAM_032` | NAM | [dè chừng xua đuổi] | "Bỏ tay khỏi bàn. Lùi ra." | 1.8s | Cảnh giác |
| `P1_GUE_016` | NGƯỜI TRONG GƯƠNG | [chỉ màn hình điện thoại] | "Mày để Không làm phiền à? Thảo nào điện thoại cứ im." | 3.0s | Tự nhiên |
| `P1_GUE_017` | NGƯỜI TRONG GƯƠNG | [gợi ý giúp đỡ tiếp] | "Chỗ nào chưa được, tao sửa tiếp cho. Mày khỏi ngồi tới khuya." | 3.5s | Đánh trúng tâm lý |
| `P1_NAM_033` | NAM | [độc thoại nội tâm, tự luyến tự mãn] | "Chẳng nhẽ vì mình là người tốt nên ông trời cho mình một bản sao để giúp mình sao?" | 4.5s | Độc thoại cười khẽ |
| `P1_NAM_034` | NAM | [giọng đã dịu, ra vẻ kẻ có quyền] | "Để tao đọc hết đã. Đừng bấm gửi." | 2.5s | Thư thả hơn |
| `P1_GUE_018` | NGƯỜI TRONG GƯƠNG | [ngoan ngoãn] | "Ừ. Mày xem đi." | 1.2s | Điềm tĩnh |

---

## MỤC 2: PHẦN 2 — QUEN ĐƯỢC LÀM THAY (~6:30)

### 2.1. P2.01 & P2.02 — Nộp bài & Giấu giếm với Tùng

| Cue ID | Nhân vật | Hướng dẫn diễn xuất / Emotion Tag | Lời thoại chi tiết (Exact Prompt Text) | Est. (s) | Post-FX Audio |
|---|---|---|---|:---:|---|
| `P2_NAM_001` | NAM | [dứt khoát, vẫn cảnh giác đuổi đi] | "Xong việc rồi. Giờ mày ra khỏi đây đi. Đừng có lởn vởn quanh phòng tao nữa." | 3.5s | Giọng đanh thép |
| `P2_GUE_001` | NGƯỜI TRONG GƯƠNG | [đều đều không giận] | "Ừ. Mày muốn tao đi thì tao đi." | 2.0s | Bước ra cửa |
| `P2_TUNG_001` | TÙNG | [hồ hởi, đặt đồ ăn xuống bàn] | "Cơm sườn trứng ốp la ba lăm cành nhiều cơm thêm của mày đây bạn ơi! Sáng nay gọi điện cho tao réo như cháy nhà, bảo có thằng song sinh chui vào phòng. Rồi nó đâu rồi? Bay màu rồi à?" | 6.5s | Tươi vui, tự nhiên |
| `P2_NAM_002` | NAM | [lúng túng bóc đũa lấp liếm] | "À... thôi bỏ đi. Sáng nay tao cày rank khuya quá, mắt kèm nhèm hoa mắt tí thôi, làm gì căng. Mà công nhận dĩa cơm nay thơm xỉu!" | 6.0s | Gượng gạo |
| `P2_TUNG_002` | TÙNG | [càu nhàu thân mật] | "Nhìn nhầm cái khỉ mốc! Tao đã bảo bớt thức thâu đêm leo rank đi, cày cho cố vào rồi thần hồn nát thần tính." | 4.5s | Cằn nhằn |
| `P2_TUNG_003` | TÙNG | [ngạc nhiên trêu chọc, vỗ vai bạn] | "Ủa alo? Nay bồn chén sạch bong kin kít, phòng trọ thơm tho, bài tập nộp trước deadline luôn? Quả này mai chắc mặt trời mọc đằng tây quá! Hay Nam nhà ta mới giác ngộ chân lý tu tâm dưỡng tính thế?" | 7.5s | Cười sảng khoái |
| `P2_NAM_003` | NAM | [cười trừ, lùa miếng cơm] | "Gì chứ người ta cũng phải trưởng thành chứ mày, chê hoài! Ăn đi kẻo nguội!" | 3.5s | Cười ngượng |

---

### 2.2. P2.03 — Sáng Ngày 2: Thử lòng & Nam thị uy "Ông chủ"

| Cue ID | Nhân vật | Hướng dẫn diễn xuất / Emotion Tag | Lời thoại chi tiết (Exact Prompt Text) | Est. (s) | Post-FX Audio |
|---|---|---|---|:---:|---|
| `P2_NAM_004` | NAM | [hét toáng lên, lưng đập mạnh vào cửa] | "Mày... mày vào đây bằng cách nào?! Tao chốt then sắt bên trong rồi cơ mà?!" | 4.0s | Hoảng loạn tột độ |
| `P2_GUE_002` | NGƯỜI TRONG GƯƠNG | [ngồi im trên ghế, giọng thản nhiên] | "Tao có đi đâu đâu. Tao vẫn ở đây mà." | 2.5s | Lạnh lùng |
| `P2_NAM_005` | NAM | [hống hách, đập bàn thị uy làm chủ] | "Mày biết điều đấy! Đụng vào ba củ này là tao cho mày cook ngay lập tức! Giờ nghe cho rõ đây: Phòng này tao là nóc nhà! Mày chỉ được ngồi yên ở cái ghế đẩu này làm chân bảo vệ, cấm bén mảng đụng vào máy tính, ví tiền hay quần áo của tao. Tao bảo ngồi thì ngồi, bảo đứng thì đứng. Tao mà thấy mất sợi lông chân nào là mày tới công chuyện với tao đấy!" | 12.0s | Giọng đe dọa, làm lớn |
| `P2_GUE_003` | NGƯỜI TRONG GƯƠNG | [gật đầu phục tùng] | "Ừ. Tao nhớ rồi." | 1.2s | Ngoan ngoãn |

---

### 2.3. P2.04 — Khủng hoảng Lab 402 & Lần nhờ vả đầu tiên

| Cue ID | Nhân vật | Hướng dẫn diễn xuất / Emotion Tag | Lời thoại chi tiết (Exact Prompt Text) | Est. (s) | Post-FX Audio |
|---|---|---|---|:---:|---|
| `P2_GUE_004` | NGƯỜI TRONG GƯƠNG | [gợi ý giải pháp đúng lúc] | "Bài hôm qua tao làm, tao nắm hết ý rồi. Mày ngại đứng trước lớp thì để tao lên nói cho." | 4.5s | Đĩnh đạc |
| `P2_NAM_006` | NAM | [tự ái giãy nảy, quát gạt đi] | "Mày tính dạy khôn ai đấy?! Thẻ sinh viên mang bản mặt tao, tao tự đi flex chứ mắc mớ gì nhờ mày! Mày định cướp spotlight của tao à?! Dẹp đi!" | 6.5s | Tự ái, gắt gỏng |
| `P2_NAM_007` | NAM | [lúng túng tập nói trước gương, vấp cà lăm] | "Kính thưa thầy... và các bạn sinh viên... à nhầm, các đồng chí... phần nghiên cứu của nhóm em gồm có... à... gồm có ba giai đoạn... là..." | 7.0s | Cà lăm, toát mồ hôi |
| `P2_GUE_005` | NGƯỜI TRONG GƯƠNG | [đánh trúng nỗi sợ tiền bạc] | "Mày lên đó mà cà lăm là cả nhóm ăn con zero tròn trĩnh, chuẩn bị đóng hai củ rưỡi một tín chỉ học lại đấy. Tùng đang đợi tin vui ở sân bóng kìa." | 6.5s | Điềm tĩnh, chí mạng |
| `P2_NAM_008` | NAM | [buông xuôi, cố ra lệnh để giữ thể diện] | "Mặc áo này vào, cầm thẻ sinh viên của tao đây. Lên phòng bốn không hai, nói đúng mấy câu vừa nãy rồi ký tên điểm danh xong thì về thẳng phòng. Cấm la cà nói chuyện với ai khác nghe chưa!" | 7.5s | Đầu hàng, thở dài |
| `P2_GUE_006` | NGƯỜI TRONG GƯƠNG | [nhận thẻ sinh viên, nhìn thẳng vào mắt] | "Ừ. Tao sẽ làm đúng như mày muốn." | 2.0s | Ánh mắt sâu hoắm |

---

### 2.4. P2.05 — Banter cày game & Các phản kháng nửa vời

| Cue ID | Nhân vật | Hướng dẫn diễn xuất / Emotion Tag | Lời thoại chi tiết (Exact Prompt Text) | Est. (s) | Post-FX Audio |
|---|---|---|---|:---:|---|
| `P2_NAM_009` | NAM | [bực tức quăng gối, chửi đổng thua rank] | "Má nó, team óc bò, gánh còng cả lưng mà vẫn thua tụt rank! Ê mày, nãy ngồi đó thấy pha solo kill của tao khét mù không? Quả đấy tao xử lý out trình vãi chưởng!" | 7.5s | Bực mình, hăng máu |
| `P2_GUE_007` | NGƯỜI TRONG GƯƠNG | [deadpan roast, thật thà chọc tức] | "Mày feed bảy mạng. Thua vì mày đi lẻ bị bắt chứ không phải do team." | 4.0s | Đều đều không cảm xúc |
| `P2_NAM_010` | NAM | [quạu quọ xua tay cãi cùn] | "Biết cái quái gì mà phán! Đấy là tao cố tình di chuyển tạo khoảng trống cho team ăn rồng, hiểu chưa? Đúng là thứ không biết chơi game, chả hiểu tí nghệ thuật chiến thuật nào!" | 7.5s | Cãi cố, xua tay |
| `P2_NAM_011` | NAM | [nửa đùa nửa thật, tò mò hỏi lai lịch] | "Mà ê... tao hỏi thật, rốt cuộc mày từ đâu chui ra đấy? Đừng bảo là clone nhân bản vô tính trong phòng thí nghiệm trốn ra đấy nhé? Hay người ngoài hành tinh nhập vào?" | 7.0s | Tò mò sinh viên |
| `P2_GUE_008` | NGƯỜI TRONG GƯƠNG | [nhìn lướt qua gương, giọng bí ẩn] | "Mày ở đâu thì tao ở đó. Mày muốn tao là ai thì tao là người đó." | 4.0s | Trầm, vọng nhẹ |
| `P2_NAM_012` | NAM | [cười sặc sụa, vỗ đùi bôm bốp] | "Lại văn vở triết lý TikTok rồi! Thôi kệ xác mày, quái vật hay người nhân bản cũng được, miễn là mai lên trường điểm danh với chép bài hộ tao là được. Có đệ tử như mày cũng hời phết!" | 8.0s | Cười khoái chí |
| `P2_NAM_013` | NAM | [thở dài sườn sượt, trút bầu tâm sự] | "Nói thật với mày, làm người lớn mệt mỏi vãi chưởng. Hồi bé cứ mong lớn lên, giờ lớn lên thấy cái gì cũng áp lực: deadline dí ngập đầu, tiền trọ tiền ăn, ra trường thì sợ thất nghiệp, về quê thì họ hàng săm soi so sánh... Ước gì cứ nằm một chỗ chơi game ăn mì tôm cả đời mà không ai làm phiền, không ai bắt phải cố gắng phấn đấu gì cả." | 14.0s | Thở dài não nề |
| `P2_GUE_009` | NGƯỜI TRONG GƯƠNG | [rót mật ma mị, gài bẫy tâm lý] | "Mày thấy mệt thì cứ nằm đây nghỉ ngơi đi. Cuộc đời ngoài kia... để tao sống thay cho." | 5.0s | Whisper binaural rợn người |
| `P2_NAM_014` | NAM | [tự mãn đắc ý] | "Mày biết điều đấy con zời! Được, thế mai đi đá bóng với thằng Tùng hộ tao luôn nhé! Nay tao phải cày nốt mùa rank này!" | 5.5s | Cười phớ lớ |
| `P2_NAM_015` | NAM | [gắt gỏng vụ bàn học bị dọn] | "Ai mượn mày dọn?! Bàn của tao là trường phái 'bừa bộn có kiểm soát', để thế tao mới có cảm hứng sáng tạo! Mày phận làm thuê thì biết điều tí coi, cấm tự tiện nghe chưa!" | 7.0s | Gắt gỏng, giật sổ |
| `P2_GUE_010` | NGƯỜI TRONG GƯƠNG | [cúi đầu nhận lỗi nhún nhường] | "Tao xin lỗi. Tao thấy bừa quá nên dọn hộ thôi." | 2.5s | Giọng hối lỗi giả tạo |
| `P2_NAM_016` | NAM | [tiện mồm sai vặt tiếp] | "Cơ mà tiện tay thì đem cái thau đồ bẩn ở góc nhà đi giặt hộ tao cái, ngâm ba ngày sắp mọc nấm rơm tới nơi rồi." | 5.0s | Lười nhác, nằm bấm game |
| `P2_NAM_017` | NAM | [ngái ngủ, tự dối lòng để ngủ nướng] | "Trời sinh ra chiếc nệm êm ái là để chữa lành tâm hồn, mưa rét thế này dậy đi học làm gì cho hao mòn tuổi xuân... Người tao nay hơi sốt ấm đầu rồi. Ê... mày cầm ô đi học hộ tao buổi nữa đi, coi như tích công đức!" | 9.0s | Ngái ngủ trong chăn |
| `P2_NAM_018` | NAM | [dúi máy hoảng hốt khi mẹ gọi video] | "Mày nghe máy đi! Bắn tiếng ngọt ngào vào bảo tao đang bận cày đề cương ôn thi để mẹ gửi viện trợ!" | 4.5s | Thì thầm hấp tấp |
| `P2_GUE_011` | NGƯỜI TRONG GƯƠNG | [ngọt ngào, hiếu thảo nói vào máy] | "Dạ con chào mẹ! Dạ con đang ôn đề cương thi giữa kỳ ạ, mẹ với bố ở quê có khỏe không mẹ?..." | 5.0s | Giọng con ngoan |
| `P2_ME_001` | MẸ NAM | [xúc động qua loa ngoài Zalo] | "Con trai ngoan quá, mẹ chuyển thêm tiền thưởng cho con bồi dưỡng nhé!" | 3.5s | Loa ngoài điện thoại |
| `P2_NAM_019` | NAM | [nhảy cẫng lên mừng rỡ] | "Đỉnh chóp! Tiền về ví rồi, tối nay làm bữa lẩu thôi!" | 2.5s | Hớn hở mừng tiền |

---

### 2.5. P2.06 & P2.07 — Clip Zalo họ hàng & Nam bùng nổ giận dữ

| Cue ID | Nhân vật | Hướng dẫn diễn xuất / Emotion Tag | Lời thoại chi tiết (Exact Prompt Text) | Est. (s) | Post-FX Audio |
|---|---|---|---|:---:|---|
| `P2_BACHAI_001`| BÁC HAI | [hào sảng, tự hào giữa tiệc rượu giỗ] | "Cả họ xem thằng Nam nhà chú Thành nay chững chạc chưa này! Biết sang sớm phụ dọn cỗ, ăn nói đâu ra đấy chứ không có cắm mặt vào điện thoại như trước nữa. Bố mẹ nó mát mặt thật đấy!" | 8.5s | Phone recording mic |
| `P2_NAM_020` | NAM | [độc thoại nội tâm, bàng hoàng khủng hoảng] | "Nó học giỏi hơn mình... bạn bè quý nó hơn mình... nó làm bố mẹ tự hào hơn mình... Thế thì mình là cái thứ gì đang đứng ở đây? Ai mới là Nam thật? Ai là người thừa?!" | 9.0s | Nghẹn ngào, hoảng loạn |
| `P2_GUE_012` | NGƯỜI TRONG GƯƠNG | [mỉm cười đặt hoa quả lên bàn] | "Bác Hai gửi hoa quả với xôi gấc cho mày này. Bác bảo mày dạo này gầy quá, nhớ ăn nhiều vào cho có da có thịt." | 5.5s | Ấm áp, tự tin |
| `P2_NAM_021` | NAM | [gầm thét căm hận, hất đổ túi đồ] | "Cút! Mày cút khỏi cuộc đời tao ngay! Tao không cần mày đi học thay, không cần mày đóng vai cháu ngoan trò giỏi hộ tao nữa! Mày là đồ quái thai cướp đoạt cuộc đời tao!" | 7.5s | Quát xé họng |
| `P2_GUE_013` | NGƯỜI TRONG GƯƠNG | [ánh mắt phẳng lặng, không biến sắc] | "Mày chắc không? Mày thực sự muốn tự sống cuộc đời của mày à?" | 3.5s | Lạnh ngắt như hồ nước |
| `P2_NAM_022` | NAM | [gào lên, đẩy Người Kia ra ngoài] | "Tao chắc chắn! Từ ngày mai tao sẽ tự đi học, tự gặp bạn bè, tự giành lại vị trí của tao! Cút ra ngoài!" | 6.0s | Đóng sầm cửa sắt |

---

## MỤC 3: PHẦN 3 — NGƯỜI BỊ THAY THẾ (~3:45)

### 3.1. P3.01 & P3.02 — Giảng đường đào thải & Tùng thất vọng

| Cue ID | Nhân vật | Hướng dẫn diễn xuất / Emotion Tag | Lời thoại chi tiết (Exact Prompt Text) | Est. (s) | Post-FX Audio |
|---|---|---|---|:---:|---|
| `P3_TUNG_001` | TÙNG | [vỗ vai cười tươi khích lệ] | "Ủa nay đi học sớm thế con zời, nay kiểm tra tiếp đấy nhé! Chiến thần hôm nay lên gáy tiếp cho thầy nể đi bạn!" | 5.0s | Giảng đường |
| `P3_GVIEN_001` | GIẢNG VIÊN | [nghiêm nghị, gõ thước lên bục] | "Hôm trước bạn Nam trả lời phần mở đầu rất xuất sắc, tư duy cực kỳ mạch lạc. Hôm nay mời bạn Nam lên bảng giải thích tiếp câu hỏi mở rộng về thuật toán tối ưu hóa của bài báo cáo này." | 9.0s | Vang giảng đường rộng |
| `P3_NAM_001` | NAM | [run lẩy bẩy, lắp bắp ú ớ trên bục giảng] | "Dạ... thưa thầy... chỗ này... em... thuật toán này là... nó... liên kết với cơ chế... à..." | 6.0s | Giọng lí nhí, run rẩy |
| `P3_SV_001` | BẠN HỌC 1 | [xì xào mỉa mai dưới lớp] | "Ủa, nay Nam bị lag mạng à?" | 1.8s | Xì xào đám đông |
| `P3_SV_002` | BẠN HỌC 2 | [cười cợt] | "Chắc hôm nọ hack não xài hết mana rồi!" | 2.0s | Xì xào đám đông |
| `P3_SV_003` | BẠN HỌC 3 | [chế giễu] | "Hôm trước thấy nói lưu loát lắm cơ mà, nay đứng lóng ngóng như gà mắc tóc thế kia?" | 3.5s | Xì xào đám đông |
| `P3_GVIEN_002` | GIẢNG VIÊN | [tức giận, gắt gỏng đập bàn] | "Hôm trước em trả lời lưu loát, mạch lạc, tự tin lắm cơ mà? Sao hôm nay đứng ngơ ngác như người mất hồn thế này?! Hay bài hôm trước là em nhờ ai làm hộ rồi lên đây học vẹt?! Về chỗ đi, trừ hai điểm chuyên cần cả nhóm!" | 11.0s | Quát lớn, vang vọng |
| `P3_TUNG_002` | TÙNG | [thất vọng tột cùng, bực bội gắt gỏng] | "Mày bị dính lời nguyền gì thế hả Nam? Mấy hôm trước đá bóng ghi bàn hăng hái, phát biểu đâu ra đấy như rồng như phượng, ai cũng nể. Tự nhiên hôm nay lại lười nhác, ú ớ ngơ ngơ như thằng nghiện game ngày trước vậy? Đang phong độ tốt mà tự dưng tụt dốc không phanh làm cả nhóm ăn trừ điểm oan uổng là sao?!" | 12.5s | Hành lang trường học |

---

### 3.2. P3.03 & P3.04 — Phát hiện nốt ruồi & Đối chất trước gương

| Cue ID | Nhân vật | Hướng dẫn diễn xuất / Emotion Tag | Lời thoại chi tiết (Exact Prompt Text) | Est. (s) | Post-FX Audio |
|---|---|---|---|:---:|---|
| `P3_NAM_002` | NAM | [gầm thét căm hận, giơ búa sắt] | "Chính là mày! Mày là thứ quỷ quái trong gương cướp cuộc đời tao! Tao sẽ đập nát cái gương này!" | 5.0s | Hét gào đỉnh điểm |
| `P3_GUE_001` | NGƯỜI TRONG GƯƠNG | [điềm tĩnh, giọng xé toạc tâm can] | "Mày đập gương làm gì? Mày nghĩ tao tự dưng chui ra ngoài này để cướp cuộc đời mày à? Chính mày đã tạo ra tao." | 6.5s | Điềm tĩnh rợn người |
| `P3_NAM_003` | NAM | [khựng lại, tay run rẩy giữ búa] | "Tao không tạo ra mày! Mày là đồ quỷ quái!" | 2.5s | Run rẩy phản kháng |
| `P3_GUE_002` | NGƯỜI TRONG GƯƠNG | [bóc trần tàn nhẫn từng nhát dao tâm lý] | "Mày tạo ra tao vì mày quá hèn nhát để sống cuộc đời này. Mày sợ bị thầy cô chê bai, mày ngại đứng trước đám đông, mày sợ áp lực gia đình. Mày lười biếng đến mức chỉ muốn trốn trong xó phòng cày game, luôn ước có một ai đó gánh hết mọi phiền toái, nhọc nhằn thay cho mày." | 13.5s | Rành rọt, lạnh buốt |
| `P3_GUE_003` | NGƯỜI TRONG GƯƠNG | [chí mạng kết liễu tự trọng] | "Tao đã làm một sinh viên chín phẩy năm điểm, một đứa cháu hiếu thảo khiến bố mẹ tự hào, một người bạn tốt biết lắng nghe. Mọi người ở thế giới ngoài kia đều đang hạnh phúc vì có tao. Giờ mày đập gương... rồi mày định vác cái thân xác lười nhác, vô tích sự, bốc mùi ẩm mốc này ra để làm khổ gia đình và bạn bè mày tiếp à?" | 14.5s | Nhấn từng chữ lạnh lùng |

---

### 3.3. P3.05 & P3.06 — Mặt kính hóa nước & Đoạn kết rợn ngáy với Tùng

| Cue ID | Nhân vật | Hướng dẫn diễn xuất / Emotion Tag | Lời thoại chi tiết (Exact Prompt Text) | Est. (s) | Post-FX Audio |
|---|---|---|---|:---:|---|
| `P3_GUE_004` | NGƯỜI TRONG GƯƠNG | [lời ru ma mị, áp tay lên mặt kính] | "Mày mệt mỏi lắm rồi đúng không? Vào trong đó đi. Trong đó sẽ không có bài tập lớn, không có thầy cô la mắng, không ai bắt mày phải cố gắng nữa." | 7.5s | Ru ngủ ma mị, Reverb |
| `P3_NAM_004` | NAM | [tiếng gào nghẹn ứ, nghẹt thở khi bị kéo chìm] | "Khoan... cứu... không...!" | 2.0s | Nước bóp nghẹt thanh quản |
| `P3_TUNG_003` | TÙNG | [hồ hởi đẩy cửa bước vào xách bún chả] | "Nam ơi! Tao mua bún chả full topping đây, có nem rán giòn rụm thơm lừng nhé! Ăn đi rồi tối tao kèm lại cho cái phần thuật toán hồi sáng, có gì đâu mà overthinking mày!" | 7.5s | Tươi vui, bước vào phòng |
| `P3_GUE_005` | NGƯỜI TRONG GƯƠNG | [mỉm cười tươi tắn, nhận bằng tay trái] | "Cảm ơn mày nha Tùng." | 1.8s | Tươi tỉnh giả tạo |
| `P3_TUNG_004` | TÙNG | [chột dạ, khựng lại, giọng sững sờ] | "Ủa Nam... nốt ruồi bên mắt mày... sao nay lại nằm bên phải?" | 3.5s | Bất an, nghi hoặc |
| `P3_GUE_006` | NGƯỜI TRONG GƯƠNG | [nụ cười vụt tắt, giọng lạnh ngắt rợn tóc gáy] | "Mày nhìn nhầm rồi... Tao là Nam mà." | 3.0s | Lạnh toát, rợn người |

---

## 📊 THỐNG KÊ TỔNG HỢP CUE SHEET

* **Tổng số câu thoại toàn bộ dự án:** **86 Cues**
  * Opening: **4 Cues**
  * Trailer: **18 Cues**
  * Phần 1: **34 Cues**
  * Phần 2: **22 Cues**
  * Phần 3: **8 Cues** (chưa kể đám đông)
* **Phân bổ theo nhân vật:**
  * **NAM:** 31 Cues (Nhân vật chính, nhiều biến thiên cảm xúc nhất)
  * **NGƯỜI TRONG GƯƠNG:** 24 Cues (Giọng phẳng, lạnh, thì thầm ma mị)
  * **TÙNG:** 11 Cues (Bạn thân bộc trực, phone call & cảnh kết)
  * **LỜI DẪN (NARRATOR):** 6 Cues (Hồi tưởng P1.00 & Opening)
  * **GIẢNG VIÊN:** 3 Cues
  * **BÁC HAI & MẸ NAM:** 4 Cues
  * **SINH VIÊN LỚP HỌC:** 3 Cues
