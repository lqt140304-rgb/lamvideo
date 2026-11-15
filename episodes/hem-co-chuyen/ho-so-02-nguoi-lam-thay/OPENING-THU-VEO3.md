# Opening — chia đoạn thử Veo 3

Trạng thái: bản chia đoạn để thử, chưa tạo video. Nguồn: [opening riêng](KICH-BAN-TRAILER-VA-OPENING.md), phần 1; không lấy lời từ cue sheet cũ hoặc thay kịch bản master của tập.

Opening nguồn 48 giây; bản thử này giãn thành khoảng 60 giây để giữ lời dẫn và khoảng phản ứng. Mốc dưới đây là nhịp dựng dự kiến, chưa đo theo audio. Mỗi đoạn khoảng 10 giây, riêng độc thoại dự kiến 12 giây. Đây không phải thông số thời lượng mà mọi giao diện Veo đều nhận: nếu nơi tạo không cho chọn đúng độ dài, chia tiếp ở điểm ngắt hành động; không tăng tốc giọng để ép vừa clip.

## Cách dùng

- Tạo hình/chuyển động bằng prompt từng đoạn bên dưới; ghép giọng ElevenLabs và chữ trong hậu kỳ. Lời dưới mỗi đoạn là lời ghép sau, không dán vào prompt hình.
- Dùng cùng ảnh tham chiếu nhân vật và phòng trọ cho mọi đoạn. Ảnh lấy từ asset đã được chủ repo chọn; không dùng tên Nam/Tùng đơn thuần để kỳ vọng model tự giữ khuôn mặt. Chưa có ảnh thì tạo một bộ hình tham chiếu và chốt trước khi làm các clip.
- Dán khối chung trước prompt riêng. Khi giao diện hỗ trợ ảnh đầu/cuối, dùng frame phù hợp của clip trước cho đoạn tiếp cùng cảnh; montage đổi thời gian dùng lại ảnh bối cảnh/nhân vật. Đây là hướng thử, chưa xác nhận tính liên tục bằng video thực.
- Giữ hình chính trong vùng an toàn để hậu kỳ crop 2.39:1. Không yêu cầu model vẽ viền đen, phụ đề, logo hay chữ trên điện thoại. Chữ cảnh báo, màn hình và title thêm sau.
- Tiếng động ghi dưới đây là ý đồ hậu kỳ; nghe kiểm tra mọi tiếng Veo sinh ra trước khi giữ lại. Không cần tạo lời thoại bằng Veo cho lượt thử hình này.

## Khối chung — dán trước mỗi prompt

```text
Stylized 3D animated psychological suspense film set in a modest Vietnamese student rental room. Soft rounded forms, soft PBR materials, expressive restrained acting, believable physical lighting and contact shadows. Preserve the exact faces, hairstyles, outfits, body proportions, room layout and props shown in the supplied reference images. Nam is a Vietnamese male university student, around 20; his identifying mole is beside his anatomical LEFT eye. His supernatural double has the same face with the mole beside his anatomical RIGHT eye and acts with his LEFT hand. These are anatomical sides, not screen sides. Tung is a different person and must match his own reference. Old wooden standing mirror, faded floral cloth, thin floor mattress, worn study desk, blue laptop, small sink. Natural Vietnamese domestic atmosphere. Keep faces and important actions inside a central widescreen safe area. No generated text, subtitles, logos, music or spoken dialogue. Avoid live-action humans, exaggerated horror makeup, gore, extra fingers, duplicate people outside the intended mirror double, changing outfits, drifting furniture or unmotivated camera shake.
```

## 01 — Gương và báo thức | 00:00–00:10, khoảng 10 giây

**Nhịp hình:** 0–4s cận gương phủ vải, giọt nước bò ngược; 4–10s cắt sang Nam nằm trên nệm, tắt báo thức. Giữ góc thấy cả tay thật và tay trong gương để đọc được độ trễ.

```text
Two clearly separated shots. First, a slow macro slide along the damp wooden edge of the standing mirror, its upper half covered by faded floral fabric. Weak predawn window light. A single small water droplet pauses, moves slightly upward, then falls naturally. Cut to the same room in early morning: Nam lies under a blanket on the floor mattress, a phone beside him. He reaches out once, taps the phone and pulls his hand back under the blanket, annoyed and sleepy. In the mirror in the background, his reflected arm completes the same action just after his real arm has stopped. Keep the physical room stable and the reflection inside the mirror. End on the quiet mattress and mirror. Small movements, no dramatic jump scare.
```

**Lời dẫn ghép sau — ấm, hơi hóm hỉnh:** “Đây là Nam. Sinh viên năm hai, hiện đang 'tạm trú' tại một phòng trọ nhỏ cùng Tùng — thằng bạn thân nghiêm túc đến phát mệt.”

**Ngắt/nghỉ:** ngắt nhẹ sau “Nam”, đổi ý sau “năm hai”; không đọc một hơi. Lời có thể bắt đầu khi máy còn ở gương, rồi dẫn sang Nam. Không cần đọc trùng mọi động tác.

**Âm:** quạt lạch cạch, báo thức, tiếng chăn. Chữ cảnh báo và màn hình báo thức thêm sau. Độ trễ phản chiếu chính xác 5 frame của bản nguồn chỉ xác nhận được khi kiểm video hoặc làm hậu kỳ.

## 02 — Việc gì cũng để sau | 00:10–00:20, khoảng 10 giây

**Nhịp hình:** 0–5s Tùng chỉ bài trên laptop, Nam mải chơi điện thoại; 5–10s Nam đi qua bồn bát bẩn, xua tay rồi bỏ đi. Hai hành động đọc rõ, không thêm chuyển động phức tạp.

```text
Two everyday daytime shots in the same reference room. In the first, Tung sits beside the blue laptop and points at the screen, waiting for Nam to pay attention. Nam stays absorbed in a game on his phone and raises one index finger to ask for more time without looking up. Hold Tung's mildly frustrated reaction. Cut to a close view of greasy dishes piled in the small sink. Nam passes through the frame, glances at them, gives a casual dismissive hand gesture and walks away. Warm daylight, believable lived-in details, gentle observational humor. Keep the same character designs and room geography.
```

**Lời dẫn ghép sau — thân mật:** “Nam không phải người xấu. Cậu chỉ mắc đúng một căn bệnh nan y của tuổi trẻ: Trì hoãn. Việc gì cũng có thể đợi đến... tí nữa.”

**Ngắt/nghỉ:** chốt nhẹ “người xấu”; nhấn “Trì hoãn”; một nhịp ngập ngừng có chủ ý trước “tí nữa”, không kéo lê toàn câu.

**Âm:** chạm điện thoại, tiếng bát. Nguồn còn có hai câu Nam “Chờ nốt combat này!”, “Tí nữa tao rửa!”: giữ thành cue riêng nếu dùng; xếp vào chỗ lời dẫn nghỉ hoặc nới clip, không chồng hai giọng chỉ để vừa 10s.

## 03 — Nam vẫn biết thương bạn | 00:20–00:30, khoảng 10 giây

**Nhịp hình:** 0–3s Tùng mệt mỏi ngồi xuống; 3–7s Nam ngừng chơi, đưa cốc nước; 7–10s giữ phản ứng nhẹ của hai người.

```text
One restrained medium two-shot at night in the same rental room. Tung returns from work exhausted and sits on the edge of the floor mattress, rubbing his sore calf. Nam notices, pauses his phone game, puts the phone down and slides a glass of water toward Tung. Tung looks up in surprise, accepts the glass and gives a small grateful smile. Nam answers with a modest half-smile, not a broad comic grin. Hold their shared quiet moment. Soft warm practical room light with a faint blue contribution from the laptop. Slow subtle camera push, clear hand-to-glass contact, no spills, no extra gestures.
```

**Lời dẫn nối đoạn 02 — giảm nét đùa:** “Nhưng kỳ lạ là, ở cùng một thằng lười như Nam... thi thoảng cũng thấy dễ chịu.”

**Thoại Nam riêng, sau lời dẫn nếu đủ chỗ:** “Uống đi cho đỡ mệt”.

**Ngắt/nghỉ:** để động tác đặt điện thoại có chỗ diễn; nghỉ sau “Nam” vừa đủ chuyển từ trêu sang trìu mến. Cuối đoạn dành một nhịp cho Tùng nhìn bạn, không nối dồn ngay sang kinh dị.

## 04 — Ước có người sống hộ | 00:30–00:42, khoảng 12 giây

**Nhịp hình:** 0–3s Nam nhìn laptop rồi nhìn gương; 3–9s máy tiến chậm, Nam chạm cạnh mắt trái bằng tay phải; 9–12s giữ ánh mắt bản sao nhìn ra camera.

```text
One continuous slow push toward Nam seated facing the old standing mirror late at night. The blue laptop is the motivated cold light source, illuminating one side of his tired face; keep natural skin color. Nam exhales, his shoulders sink, and he rubs near the mole beside his anatomical left eye with his right hand. His double remains confined to the mirror, with the identifying mole beside its anatomical right eye. The double's expression slowly stops matching Nam: its eyes turn toward the camera while Nam is still looking down. Let the unease develop through stillness, not flashes or a monster transformation. End with both Nam and the mirror face readable.
```

**Nam — độc thoại nội tâm, mệt rồi buông xuôi:** “Làm người lớn mệt mỏi vãi chưởng... Deadline dí, học lại, áp lực gia đình... Ước gì có ai đó gánh hết phiền toái, sống hộ mình cái cuộc đời này thì sướng biết mấy...”

**Ngắt/nghỉ:** lấy hơi sau câu than đầu; cụm “Deadline dí, học lại, áp lực gia đình” tăng sức nặng nhưng không ngắt vụn từng từ; nghỉ trước “Ước gì”. Đo audio thật: nếu quá 12s, nới hình/giữ frame hoặc chia clip ở chỗ đổi ý; không ép nói nhanh.

**Âm:** nhạc đời thường tắt, quạt tiếp tục, âm trầm vào nhẹ. Màn hình deadline thêm sau. Cảnh có hai khuôn mặt và dấu nhận dạng nên cần kiểm riêng lỗi mirror/mole.

## 05 — Cái bóng không quay đi | 00:42–00:52, khoảng 10 giây

**Nhịp hình:** 0–3s Nam quay lưng, bản sao đứng yên; 3–7s tay trái bản sao xuyên mặt gương; 7–10s tay chạm gáy, Nam chưa nhận ra.

```text
Continue the same mirror composition, room layout, outfits and blue laptop lighting as the previous shot. Nam exhales and turns away from the mirror. His double does not turn: it remains facing forward inside the glass, lifting its chin with a very small cold smile. Hold this mismatch so it is clearly visible. The glass then ripples only around the double's LEFT hand as it slowly crosses the mirror boundary and lightly touches the back of Nam's neck. Nam has not noticed yet. One subtle backward camera move to keep the hand, neck and mirror visible. Keep the hand attached to the double's arm; one hand only, anatomically believable fingers. No glowing portal, flying shards, violent attack or excessive camera effects.
```

**Người trong gương — thì thầm, bình tĩnh:** “Mày thấy mệt mỏi rồi đúng không?... Cuộc đời ngoài kia... để tao sống thay cho.”

**Ngắt/nghỉ:** chờ một nhịp sau câu hỏi như đang nghe câu trả lời; nghỉ nhẹ sau “ngoài kia”; hạ giọng ở “để tao sống thay cho”. Không cần mọi từ đều kéo dài.

**Âm:** gợn nước rất nhỏ, hơi lạnh, âm trầm vừa đủ. Nếu xuyên gương lỗi, thử riêng cảnh đứng yên lệch phản chiếu trước; phần xuyên gương để một clip tiếp, không coi bản lỗi là đã đạt.

## 06 — Gương khép lại, hiện tên phim | 00:52–01:00, khoảng 8 giây

**Nhịp dựng:** 0–4s tay rút vào, mặt gương phẳng trở lại; 4–8s cắt đen và title hậu kỳ. Không yêu cầu Veo tự đổi tư thế bản sao từ đứng sang ngồi trong một frame.

```text
Close shot of the same mirror surface, matching the previous scene. The double's left hand withdraws slowly back through the glass. Small concentric ripples fade until the mirror is completely still. Keep the wooden frame, cloth position, reflected outfit and lighting consistent. Finish with a brief motionless hold on the cold dark glass. No generated lettering, logos, cracks across the camera lens or new characters. This is the quiet end of the shot, not another jump scare.
```

**Dựng sau:** cắt đen; thêm vết nứt đồ họa và tên “THE CRACK IN REALITY — HỒ SƠ 02: NGƯỜI TRONG GƯƠNG”. Tagline nguồn: “Có những chiếc bóng... không bao giờ nên để bước ra ngoài.” Tiếng then cửa “CẠCH!”, kính rạn rồi chừa khoảng một giây yên cuối. Nếu tên/tagline đọc không kịp, nới title thay vì làm chữ chạy nhanh.

## Đoạn nên thử trước

Thử **03** để kiểm nhân vật, bàn tay và diễn xuất đời thường. Sau đó thử **05** để kiểm mức khó của gương. Chỉ tiếp tục các đoạn khác khi ảnh tham chiếu và kết quả đã giữ đúng nhận dạng. Chưa có video hoặc chi phí thực để kết luận Veo đạt yêu cầu.
