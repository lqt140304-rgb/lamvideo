# Opening v4 — hình và âm thanh, chưa có giọng

Cập nhật 11/11/2026. Phạm vi: `HoSo02Opening`, 48 giây, 1440 frame ở 30 fps. Chưa triển khai trailer hoặc phim 15 phút. Giữ Nam, Người Kia, Tùng và nguồn bối cảnh hiện có.

## Thay đổi

- Dấu bàn tay đỏ máu từ phía trong gương, thu nhỏ 21% và bỏ cổ tay theo góp ý cuối: bốn đầu ngón tiếp xúc lệch nhịp, ngón cái và lòng bàn tay ép xuống sau, nếp gấp và vệt máu chảy bám tọa độ mặt kính. Giữ hình đủ lâu; bỏ vệt flare quét che bàn tay.
- Giảm rung toàn khung khi báo thức nhưng giữ điện thoại rung và khung đỏ người dùng đã chọn. Chuyển cảnh tối một nhịp thay chớp trắng/đen dồn dập; giảm góc nghiêng và blur cảnh bếp.
- Cốc chuyển từ tọa độ bàn tay Nam sang bàn tay Tùng đúng frame trao. Giải theo hướng quay trái của rig; sau khi nhận, cốc đi theo tay Tùng đưa về người.
- Phụ đề tăng từ 36 lên 43 px ở khung gốc 1920; rút câu dài theo thời gian thực trên màn hình. Không thay lời trong ba phần kịch bản chính.
- 35 điểm tiếng động, nhạc không lời và room tone. Chưa có giọng theo yêu cầu; không gọi ElevenLabs và không đổi giọng đã chọn.

## Lời tạm cho opening (thay cho bản chữ dài trong bảng ý tưởng)

| Giây | Vai | Phụ đề |
|---|---|---|
| 10.87–15.00 | Dẫn | Nam, sinh viên năm hai. Ở trọ cùng thằng bạn thân tên Tùng. |
| 15.00–16.33 | Dẫn | Nam có một tật: hay để mai. |
| 16.33–18.20 | Nam | Chờ nốt combat này! |
| 19.27–21.53 | Nam | Tí nữa tao rửa! |
| 21.67–23.60 | Dẫn | Được cái, vẫn biết lo cho bạn. |
| 23.73–25.87 | Nam | Uống đi cho đỡ mệt. |
| 27.33–32.67 | Nam, độc thoại | Bài chưa xong… mai còn thi lại. Mệt thật. |
| 32.67–37.67 | Nam, độc thoại | Giá mà có ai sống thay mình một bữa… |
| 40.33–43.93 | Người Kia | Mệt rồi hả?… Để tao sống thay cho. |

## Âm thanh và nguồn

| Thành phần | Nguồn / quyền | Xử lý |
|---|---|---|
| Nhạc không lời Lightless Dawn — Kevin MacLeod | https://incompetech.com/music/royalty-free/index.html?Search=Search&isrc=USUAN1100655 ; CC BY 4.0 | Đoạn 00:35–01:23, fade và thay mức theo cảnh. Nhạc hạ ở sinh hoạt, tăng khi gương lệch. |
| Foley, chân, chạm mềm, kính | https://kenney.nl/assets/impact-sounds ; CC0 | Chọn 7 tệp; EQ, thay tốc độ/đảo chiều ở hiệu ứng gương; không giả tiếng vỡ khi vật chưa vỡ. |
| Báo thức và âm game | https://kenney.nl/assets/digital-audio ; CC0 | tone1, twoTone1, laser1; âm game lọc và hạ như phát từ điện thoại. |
| Không khí phòng | Nhiễu nâu tổng hợp tại máy, seed 42 | Lọc 65–1100 Hz, mức nhỏ; đây là room tone tổng hợp, không phải bản thu hiện trường. |

Kiểm tra nguồn chính thức ngày 11/11/2026. Kenney có `License.txt` kèm tệp, cho phép dự án thương mại. Incompetech công bố toàn bộ catalog theo CC BY 4.0 tại https://incompetech.com/agent-section/ . Không cam kết nền tảng sẽ không phát sinh Content ID; giữ credit và chứng cứ nguồn.

Credit phải đi cùng video khi đăng:

> “Lightless Dawn” — Kevin MacLeod (incompetech.com), licensed under CC BY 4.0: https://creativecommons.org/licenses/by/4.0/ . Excerpted and mixed for this opening. Sound effects: Kenney (kenney.nl), CC0.

## Bản dựng và tái tạo

- Media được chọn và manifest: `what-if-studio/public/ho-so-02-nguoi-lam-thay/opening-audio/`.
- `sources.json`: nguồn, SHA-256 từng tệp, thời điểm/gain/filter của 35 cue; không dựa vào tên tệp để suy ra giấy phép.
- Từ studio chạy `python tools/opening-audio.py`, sau đó render composition `HoSo02Opening`. Script không dùng API, kiểm tra hash trước khi mix; FFmpeg cần có trên PATH.
- `mix.wav` là đầu ra tái tạo, bỏ qua Git; các nguồn chọn nhỏ cùng giấy phép/manifest được giữ để máy khác dựng lại. Không commit video render.
- Video local: `what-if-studio/out/ho-so-02-nguoi-lam-thay/opening-v4-final-720p.mp4`.

## Kiểm tra và giới hạn

- TypeScript đã qua. Đã xem ảnh bàn tay ép kính và cốc ở tay người nhận; kiểm tra chuỗi khung hình quanh điểm trao/điểm ép kính trước bàn giao.
- Không có giọng; phụ đề vẫn là phần thay thoại. Chưa coi là bản lồng tiếng hoàn chỉnh hoặc bản được người dùng duyệt.
- Số đo âm và giải mã video ghi trong báo cáo local, không thay việc nghe duyệt bằng tai. Không tuyên bố đã nghe giọng/nhạc nếu chỉ phân tích tệp.
- Tay Người Kia vượt mặt kính ở Shot 4 vẫn là kỹ thuật ghép lớp rig, không phải mô phỏng tay 3D. Cần người dùng xem chuyển động cuối ở cỡ điện thoại.


## Vòng góp ý Shot 1–5 — v4, 11/11/2026

- Shot 1/2 dùng cùng `RoomScene`. Đối chiếu code cho thấy bếp đã nằm sát tường sau: mặt bếp z=2–70 cm, gạch ốp z=0.6 cm; không di chuyển bếp theo góc máy. Bàn đã có kệ hai tầng, hai ngăn kéo và đèn, nhưng màu/nhãn chưa khớp tài liệu: cập nhật ba gáy TRIẾT/TOÁN/KTCT ở tầng trên, tập vở và note NỘP BÀI! tầng dưới, núm đồng vàng, đèn đỏ. Không đổi mặt bằng hay camera nền.
- Thêm trạng thái `studyWork` cho màn hình laptop dùng đúng mặt phẳng màn hình hiện có, chỉ bật ở góc báo thức và game. Nam cúi thân/cổ thêm; giữ hai tay và điện thoại cùng rig để không phá điểm cầm.
- Shot 3: hậu cảnh gương #0a1816 có các mặt lùi, lớp tối 15% trong kính và giảm lớp cyan. Giữ nguyên chớp hai frame và thời điểm cái bóng thôi bắt chước.
- Sound vacuum: toàn bộ mix sau mastering tắt đúng 35.000–35.500 s, sau đó fade lên trong 0.7 s. Đã kiểm tra 24,000 mẫu stereo đều bằng 0 trong WAV, không chỉ hạ nhạc. AAC trong video có thể có đuôi mã hóa rất ngắn ở biên, không dùng đó để hứa im lặng toán học sau encode.
- Shot 4: thêm nhịp vai/thân tối đa 3.5 px theo pha bước, giữ chân đế tính theo đường đi. Thay phần tay ghép không chạm bằng cẳng tay liên tục từ mép kính đến vai, bàn tay bám tọa độ vai khi Nam di chuyển; mảng bóng tiếp xúc vẽ tay chỉ tăng khi ngón đã chạm. Không áp `drop-shadow` tự động lên rig vì chuẩn mỹ thuật dùng mảng bóng tự vẽ.
- Shot 5: giữ lớp kính cũ nhưng bổ sung `impactGlass_heavy_002.ogg` lọc lấy cạnh sắc ở 45.00 s và `impactMetal_light_002.ogg` cắt gọn ở 45.13 s. Nguồn cùng gói Impact Sounds — Kenney CC0 đã lưu giấy phép; đây là xử lý thiết kế, không khẳng định là bản thu chốt cửa thật.
- Trạng thái: kiểm tra kiểu dữ liệu và ảnh mẫu đã qua; đã kiểm chuỗi khung hình chạm vai trong video v4, cảm nhận âm thanh vẫn cần nghe duyệt. Chưa tạo giọng.
