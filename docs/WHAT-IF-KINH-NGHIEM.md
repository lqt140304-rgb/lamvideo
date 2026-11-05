# Kinh nghiệm dựng tập What If (ghi sau mỗi lần làm)

Quy tắc: **mỗi lần dựng hoặc sửa một tập, ghi thêm vào đây những gì đã rút ra** (lỗi gặp, cách sửa, mẹo tiết kiệm công).
Claude đọc file này trước khi bắt đầu tập mới. Ghi ngắn, có ngày, có tên tập (slug), phần mới nhất để lên đầu mỗi mục.

## Cách ghi
- Một dòng mỗi bài học: *việc gì → hậu quả → cách làm đúng*.
- Việc đã sửa trong mã thì ghi tên file; việc chỉ là mẹo thì ghi thẳng.
- Không ghi thứ đã có sẵn trong `SKILL.md` hoặc `references/`; nếu bài học đủ chung thì chuyển sang đó.

---

## 2026-11-05 · `mua-100-c01` (phim "Mưa liên tục 100 ngày", cảnh 1, 168 s, 37 shot)

### Giọng
- Tài khoản: ElevenLabs Creator, giọng Trung Lê Quốc (`HXqqNj3PDxRdHVH1pXog`), model **Eleven v4** (chủ kênh chọn sau khi nghe thử v3 và v4).
- `eleven_multilingual_v2` (mặc định cũ của skill) không ghi tiếng Việt trong danh sách model. Đừng dùng lại.
- v4 tính khoảng 0,44 credit/ký tự: cảnh 1 có 2.687 ký tự tốn 1.182 credits. Cả phim (khoảng 24.000 ký tự) ước khoảng 10.700 credits.
- Giới hạn mỗi lần gọi: v4 10.000 ký tự, v3 5.000 ký tự. Phim dài phải tách theo cảnh, mỗi cảnh một episode.
- Thẻ cảm xúc như `[warmly]` phải bị loại khỏi danh sách chữ (đã làm trong `voice_elevenlabs.py`), không thì mốc cắt cảnh lệch.
- Kể chuyện dùng `gaps` thoáng hơn What If 15 giây: word 0,2, comma 0,35, sentence 0,6, question 0,7. Nhịp `[NGHỈ x giây]` ghi bằng `pads`.
- Khóa API: chuỗi bắt đầu bằng `sk_`. Chuỗi 64 ký tự trong trang quản lý là key ID, API báo `api_key_id_used_as_api_key`.

### Hình (lỗi của lần soi đầu)
- `rimR`/`rimL` có quầng cam to, làm nhân vật giống sticker trong cảnh mưa. Phim dùng `filmR`/`filmL` (viền mảnh một bên, không quầng).
- Với tay về một phía: tay trái cần `a` âm (`armL: { a: -70 }`). Để cả hai `a` dương thì nhân vật dang hai tay như chữ thập.
- Rig không có góc sau lưng: dùng `Back` (đắp tóc lên mặt) cho shot từ phía sau, đừng để mặt quay ra trong shot "sau lưng".
- Vật to trong `Foreground` đặt ngoài nhóm camera, không thì zoom phóng cả nó lên.
- Vòng sáng đèn dùng `Glow`, đừng dùng `circle` có `opacity` (ra đĩa phẳng).
- Mái tôn nhìn từ trên cao màu xanh đậm có sọc giống pin mặt trời: dùng màu nâu rỉ, sọc nhạt.
- Đổi hướng máy thì phải vẽ đúng phía đó của phòng (`LivingFront` trong `mua-100-c01/shots.tsx`), không dán cửa lên phòng cũ.
- Python: dùng `D:\VieNeu-TTS\.venv\Scripts\python.exe`. Lệnh `python` trên máy này là lối tắt Microsoft Store.

- Người ở tiền cảnh (qua vai) vẽ bằng khối đen thì đọc thành "cục đen" → dùng `Back` với đúng nhân vật, giữ màu áo và kiểu tóc (S26, S29).
- Tay chèn vào cảnh cận cần khuỷu: `HandTop` vẽ cổ tay áo rồi gập ở khuỷu, giữ bàn tay có ngón (`ArmIn` của tập trước là tay mitten).
- Mái hiên của ngôi nhà đầu hẻm kéo ra ngoài khung thành dải chéo → mái và cửa bắt đầu từ `dA` trong khung, không từ đầu tường (`Alley`).

### Chuyển động (lưới `motiongrid` bắt được, ảnh tĩnh không thấy)
- Nhân vật đứng im dưới lời dài → thêm động tác kế tiếp (S27 đặt chậu xong đứng thẳng nhìn mưa). Đứng dậy thì máy phải nâng theo, không đầu ra khỏi khung.
- Vật trong tay phải đi cùng tay (chậu của S27, bút của S35 dùng `toWorld(pose, joints(pose).armR.end)`), đừng để vật nằm sẵn chỗ đích.
- Lời có nhiều lần ("thêm một giọt, một giọt nữa") thì hình cũng nhiều lần: S12 có 5 giọt, đừng giữ một vết 4 giây.
- Tay chèn xong việc phải rời khung (S11, S36), không đứng giữa cảnh.
- Thoại: `talk` trong `Pose` + `talkAt(t, a, b)` chỉ mở miệng trong khoảng lời của nhân vật đó; lấy a, b từ `words.json` và `timeline.json`.
- Tóc `bunches` cũ: vòm mỏng và hai búi đè lên đầu → lộ da, nhìn như tai chuột. Tóc phải là cung tròn đúng trên sọ, búi vẽ TRƯỚC đầu (nằm sau) và trượt về gáy khi nghiêng (`bunchAt`). Đừng `translate` cả mũ tóc theo `yaw`: hở vệt da trên đỉnh.

- Cue chữ khớp lần xuất hiện ĐẦU TIÊN sau mốc trước, kể cả giữa câu: "Nhà" dính "hai dãy nhà" làm S18 còn 0,6 s, "Con" dính "nhắc con đừng" → dùng `Nhà#2`, `Con#2`. Sau `plan`, in từng đoạn kèm `line` để xem câu có mở đúng chữ không (ảnh tĩnh không bắt được lỗi này).
- Soi đủ mọi shot: mỗi shot 3 khung (đầu, giữa, cuối). Lần đầu chỉ soi shot có hành động nên bỏ sót lỗi trên.

- Chủ kênh gửi ảnh mẫu chữ: chỉ lấy FONT, không lấy nền đen của ảnh. Hỏi rõ phần nào của mẫu trước khi đổi cả cảnh.

### Âm thanh và lớp hình (S24, cả cảnh)
- Người thao tác với vật to: vẽ thân TRƯỚC, rồi bàn và vật che thân, rồi vẽ lại riêng cẳng tay đè lên vật (`joints` + `toWorld`). Vẽ thân đè lên vành chậu thì nhìn như đứng trong chậu.
- Hành động khó đọc ở góc lạ (từ trong chậu nhìn lên): đổi sang trung cảnh + cận từ trên xuống. Góc lạ chỉ dùng khi một giây là hiểu.
- Nền âm theo nơi đang đứng, không một tiếng mưa cho cả cảnh: mái tôn, ngoài sân, trong nhà. `["S13", "rain_tin", 0.8, "onset", "S14"]`, clip ngắn tự lặp.
- Tiếng nền chạy liên tục nên stem dày: `sfx_lu` -9 cho 44 chỗ gần lời ở -11, chỉ 9 chỗ ở -13. Bắt đầu từ -13, nhạc -15.
- Nhạc tạo bằng `/v1/music` (model `music_v2_5`, `force_instrumental`) thành một bản liền theo độ dài cảnh, lưu `library/sfx/<tên>-local.mp3`, gọi bằng `lib:<tên>`. Bản này không lặp như clip 30 s của `sound-generation`.
- Tắt nhạc ngay câu cuối (`until: "S37"`) để chỉ còn tiếng mưa.

### Nguồn âm thanh
- Chủ kênh muốn tiếng động và nhạc lấy từ nguồn miễn phí, áp dụng TỪ CẢNH 2. Cảnh 1 (`mua-100-c01`) đã duyệt, giữ âm thanh ElevenLabs (khoảng 3.500 credits).
- Freesound cần đăng nhập mới tải được; CC0 dùng tự do nhưng không được nhận là tác giả; bản thô có thể bị YouTube Content ID nhận nhầm, khi đó dùng ngày đăng trên Freesound để khiếu nại.
- Pixabay không bắt ghi nguồn, cấm phân phối lại file nguyên trạng. Bản tóm tắt không có hiệu lực pháp lý, bản đầy đủ mới có.

### Lỗi storyboard cảnh 2 (`mua-100-c02`)
- Người ngồi phải có ghế thấy được (`Seat`): tư thế `sit` chỉ gập chân, không tự có ghế. Tay đặt lên gối: tay gần `{a:14,b:32}`, tay xa `{a:-4,b:-30}`.
- Vải lau vẽ bằng elip thì giống cái đĩa: dùng hình méo có nếp gấp.
- Giọt nước hay vật nhỏ không rơi trước thân áo: đặt lệch khỏi người để đọc rõ.

### Lỗi storyboard cảnh 3 (`mua-100-c03`)
- Chồng đồ vẽ bằng `Box` phải chạm sàn (`v` kết thúc ở 1), không thì lơ lửng. Người ngồi cần ghế (`ChairFor`): ghế tựa cho người lớn, ghế đẩu cho trẻ.
- Bàn tay nắm áo: vẽ tay thật (lòng bàn tay, bốn ngón vòng qua vải, ngón cái phía sau) thay vì `HandTop` dán lên.
- Nhân vật đứng trên hiên: dùng `YARD.floorHip(scale)`, đừng tự đoán `y`.

### Ổ đĩa
- Ổ C gần đầy. Remotion ghi bundle (khoảng 120 MB mỗi lần) và file tạm vào %TEMP%, không tự dọn. `wi.py` và `stills.mjs` đã chuyển sang `D:\lamvideo-cache\tmp`. Khi gọi `npx remotion` trực tiếp, đặt `TEMP` và `TMP` trỏ về đó trước. Thư mục này xóa được khi không có render nào chạy.

### Việc làm trước khi bắt đầu
- Tìm file kinh nghiệm ở MỌI nhánh (`git for-each-ref`), không chỉ nhánh đang đứng. Lần này tôi tưởng chưa có nên viết lại `pause`, dựng tay, tờ soi riêng, trong khi nhánh `tua-lai-10-giay` đã có `pads`, `sheets.py`, `ModelSheet`.

---

## 2026-11-05 · `tua-lai-10-giay` ("Nếu ngày đó bạn không bỏ học?", ~3 phút, 77 cảnh)

### Môi trường (worktree mới)
- Worktree mới **không có** `node_modules` và `.vieneu-python` → chạy `npm install` trong `what-if-studio/` và chép `.vieneu-python` từ thư mục chính (`D:\lamvideo\.vieneu-python`). File này nằm trong `.gitignore`.
- `tools\what-if.bat stills <slug>` chỉ nhận tối đa **7 mã cảnh** một lần (giới hạn %2..%9). Muốn render lại nhiều cảnh thì gọi nhiều lần, hoặc bỏ mã cảnh để render hết.
- PowerShell: `cd` trong một lệnh **đổi thư mục làm việc** của lệnh sau; dùng đường dẫn tuyệt đối hoặc `Set-Location` đầu mỗi lệnh. Đừng đặt hàm tên `R` (là bí danh của `Invoke-History`). Sửa mã dùng công cụ Edit, đừng nối chuỗi nhiều dòng bằng `.Replace`.

### Giọng đọc (`scripts/voice.py`)
- faster-whisper báo `open() got an unexpected keyword argument 'metadata_errors'` khi bản `av` lệch → đã sửa: tự giải mã WAV ra mảng 16 kHz (`load_wav_16k`), không để whisper tự giải mã.
- Whisper chọn GPU rồi lỗi `cublas64_12.dll` → ép `device='cpu'`.
- Khi mọi câu đã có trong bộ nhớ đệm, VieNeu không được nạp nên thư mục cache Hugging Face không được chuyển → gọi `ensure_hf_cache()` trước khi tải whisper.
- Câu có ngoặc kép “…” bị cắt sai (dấu ” rơi sang câu sau, đọc thành tiếng lạ) → bộ tách câu giữ dấu đóng ngoặc cùng câu trước.
- `gaps` chỉ **cắt** khoảng lặng, không kéo dài. Phim chậm, nhiều hình hơn lời → dùng `"pads": {"từ_cuối|từ_đầu": giây}` trong `episode.json` (mới thêm), `"^|từ"` là khoảng lặng đầu phim.
- Lời kịch bản ~3 phút (1858 ký tự) đọc ra chỉ ~105 s sau khi cắt lặng; thêm ~50 s `pads` mới lên 2:52. Tính trước: thời lượng ≈ số chữ / 4 giây + pads.

### Danh sách cảnh (`edit`, `plan.py`)
- Mỗi cảnh cần ít nhất ~0,7 s; hai mốc cắt cách nhau 1–2 từ sẽ cho cảnh dưới 0,4 s → dời mốc sang từ khác.
- Từ lặp lại: `chữ#2` là lần thứ 2 **sau mốc trước**; muốn cắt lệch khỏi từ thì `chữ+10` (khung hình). Chữ hoa/thường không phân biệt.
- Mốc phải **đi theo thứ tự câu**. Một cảnh dùng lại được nhiều lần với `"from"` khác (ví dụ bóng đèn không sáng rồi sáng): viết một cảnh duy nhất, phụ thuộc `t`.
- Cảnh giữ trên 4 s cần có chuyển động bên trong hoặc tách thêm một cảnh ngắn chen vào (cận mặt, cận vật). Cảnh kết có chữ: đặt `key` ở khung đã hiện chữ.

### Hình (engine)
- Nhân vật mới trong `rig.tsx`: một khuôn mặt, nhiều trang phục (`worker`, `workerHat`, `student`, `tech`, `chu`, `bac`, `moi`). Tóc ngắn là `extra: 'crop'`; mũ bảo hộ là `extra: 'hardhat'` + `hat`.
- Góc nghiêng: tóc phải **ôm hình đầu**. `SideHair` vẽ tóc phủ phía sau đầu theo `|yaw|`, viền là cung tròn của đầu (không vẽ tóc "bay" ngoài đầu). Tai nghe đeo cổ phải co theo `turnWidth(yaw)` như thân.
- Cánh tay thò vào khung (`ArmIn`) phải có **khuỷu** (bend) và cổ tay áo, đừng dùng thanh thẳng. Tay phải đặt đúng vào vật (đo kỹ bằng ảnh phóng to).
- Màn hình điện thoại cận cảnh: zoom ≥1,2 vào phần có chữ; chữ đang gõ cắt `slice(-21)` để khỏi tràn ô.
- Cặp/túi đeo lên người: đáy cặp ở mức hông (`pose.y + ~6`), không phải mặt đất.
- "Phòng trọ" không dùng lại phòng ngủ teen nguyên bản: thêm `rented` (bỏ đèn dây, áp phích, ghế lười, cúp; thêm áo treo, phiếu lương, thùng giấy).
- Cảnh cần nhấn một chỗ (ghế cạnh cửa sổ): tối cả cảnh bằng `LightVeil` rồi chiếu một vệt nắng + `Glow` lên đúng chỗ.
- Kiểm tra bằng ảnh **phóng to** (`remotion still --scale=2` rồi cắt bằng ffmpeg) mới thấy tóc lệch, tay lệch; ảnh thu nhỏ không đủ.

### Âm thanh (`scripts/sfx.py`, chế độ miễn phí, 41 tiếng có sẵn)
- Tiếng nền trong thư viện ngắn (3 đến 12 s), nhạc nền chỉ 17 s: `sfx.py` trước đây chỉ phát một lần rồi hết → đã thêm **lặp có nối mờ** (`loop_fill`) cho mọi tiếng có `until`, và cho nhạc.
- Nhạc duy nhất trong thư viện là bản "cartoon vui nhộn", không hợp truyện buồn → thêm `rate` (chậm và trầm hơn, 0,8), `soft` (làm mềm treble) và `dips` (nhạc tắt ở câu quan trọng, ví dụ câu mẹ hỏi) trong `"music"`. Muốn nhạc thật hợp thì thả nhạc CC0 vào `library/sfx/music-local.mp3`.
- Cue cho cảnh dùng lại nhiều lần: `S33#2+20` (lần xuất hiện thứ 2 của S33, sau 20 khung). Cảnh dùng lại hai lần thì tiếng cũng phải đặt theo từng lần.
- Mức: thanh tiếng động thưa nên `sfx_lu` -3 làm gần 100 chỗ tiếng áp lên lời; xuống -13 còn 14 chỗ (mốc để so: tập copy-paste ra 14). Với truyện nhiều lời, chọn `sfx_lu` quanh -12 đến -13, nhạc -14.
- Tiếng `ding` lặp 6 lần cách 4 khung, đổi cao độ nhẹ = tiếng chuông trường; `copy_click` lặp = tiếng gõ phím; `select_draw` = bút, kéo khóa; `power_down` = "mọi thứ dừng" khi hình đứng lại.

### Đổi sang giọng ElevenLabs
- `voice_elevenlabs.py` trước đây không biết `pads`: đổi engine thì phim co lại ~50 s và lệch cảnh. Đã chuyển `pads` thành hàm chung `apply_pads()` trong `wi.py`, cả hai engine dùng.
- Tìm mã giọng theo tên: `python voice_elevenlabs.py --find "Viết Linh"` (giọng của bạn và thư viện chia sẻ). Ghi mã vào `"voice": {"engine": "elevenlabs", "id": "...", "model": "eleven_multilingual_v2"}`.
- Khóa API đặt ở `D:\.env` (dòng `ELEVENLABS_API_KEY=...`): `wi.py` tìm `.env` ở mọi thư mục cha của studio, nên mọi worktree đều đọc được, và file nằm NGOÀI repo `D:\lamvideo` (repo này không có `.env` trong `.gitignore`, để trong đó dễ lỡ commit khóa). Không dán khóa vào chat.
- **Gói Free không dùng được giọng thư viện qua API** (lỗi 402 `paid_plan_required`), kể cả khi giọng đã thêm vào "giọng của bạn". Kiểm tra trước bằng một câu ngắn ("Xin chào.") để khỏi tưởng là lỗi khóa. Cách miễn phí: tạo giọng trên web ElevenLabs với lời trong `public/<slug>/loi-doc.txt`, tải mp3 về `public/<slug>/voice_in.mp3`, dùng engine `file` (whisper tự canh mốc chữ, `gaps` và `pads` vẫn áp dụng).
- `eleven_multilingual_v2` (mặc định của skill) không có tiếng Việt; giọng Việt dùng `eleven_turbo_v2_5`/`eleven_flash_v2_5` kèm `"language": "vi"`.
- Giọng đọc cả bài một lần (engine `file`, ElevenLabs web): whisper khớp 402/417 chữ nhưng ~16 chữ bị đặt LÙI giờ (chữ lặp như "hai", "tháng", "rụt") → cắt cảnh sớm cả giây. Đã thêm `fix_order()` trong `voice.py` đặt lại các chữ đó giữa hai chữ đúng. Sau khi đổi mã căn chỉnh phải chạy `voice --force` (bản cũ được lưu đệm theo nội dung + cấu hình).
- Bản phim > 30 MB không gửi được ra điện thoại/web: làm thêm bản xem thử 720p ~1 Mbps (`ffmpeg -vf scale=1280:720 -b:v 1000k`), ~23 MB cho 172 s.
- Rà đồng bộ lời–hình nhanh mà không cần xem ảnh: in từng đoạn của `timeline.json` kèm `line` (chữ được đọc trong đoạn) và đọc xem chữ có khớp nội dung cảnh không.
- Kiểm tra nhanh mốc chữ: in vài chữ dùng làm cue (`rụt@`, `tháng@`, `hai@`) và xem chúng có tăng dần không.
- Đổi giọng thì mốc từng chữ đổi: phải chạy lại `voice` → `plan` → `sfx` → `master`, rồi rà lại các cảnh cắt theo chữ.

### Cảnh dùng lại với `from` (bài học từ bóng đèn S34)
- Một cảnh dùng hai lần (lần 1 "không sáng", lần 2 "sáng") thì mốc **thay đổi** phải nằm ngoài khoảng `t` của lần 1. Lần đầu nó nằm trong khoảng 0–58 nên bóng sáng sai chỗ; đổi `from` lần 2 lên 70 và đẩy mốc bật sang t = 80–84.
- Chỉ phát hiện nhờ `motiongrid` trên bản nháp nửa kích thước: ảnh tĩnh ở `key` không bắt được. Cảnh nào dùng lại nhiều lần, hoặc đổi trạng thái theo `t`, phải xem lưới chuyển động trước khi render đầy đủ.
- Sửa mốc thì chạy lại `plan` rồi `sfx` (plan ghi đè `timeline.json`, mất mức âm lượng).

### Lưu file
- Làm trong worktree thì `what-if-studio/out/` nằm TRONG worktree: dọn worktree là mất video. `master` giờ tự chép thành phẩm sang `D:\lamvideo-xuat\what-if\<slug>\` (ngoài repo, mỗi tập một thư mục).
- Đừng để file của tập ở thẳng `out/` (lần đầu `out/models`, `out/cast.png`, `out/chk` nằm lẫn ở gốc): luôn `out/<slug>/...`.
- `.gitignore` gốc chặn `*.mp4`, `*.mov`, `*.mkv`, `.env`.

### Render
- Một khung 1920×1080 của tập này ~0,5 s (nhiều bộ lọc làm mờ); tập 172 s (5176 khung) mất 1234 s (~21 phút) trên máy 12 luồng; bản master ra 127 MB, -14,3 LUFS, đỉnh -1,44 dBTP. Bản nháp xem chuyển động: `remotion render ... --scale=0.5` ra thẳng `out/<slug>/<slug>-raw.mp4` rồi chạy `motiongrid` (nó đọc đúng file `-raw.mp4`), rồi mới render đầy đủ bằng `master`.
- Chạy render dài bằng chế độ nền, đừng chặn phiên làm việc.

### Rà soát bản phim — ĐÃ SỬA HẾT danh sách dưới (bản master thứ 2)
Bài học rút ra từ các lỗi:
- `faceAt()` trả về cả `blink: 0`, trải nó SAU pose sẽ mở mắt nhân vật đang ngủ: cảnh nhắm mắt dùng `{...pose, expr, blink: pose.blink}`.
- Tay đưa vật lên tai/ngực: tính hình học bằng tay gần (`yaw >= 0` là `armR`), rồi đặt vật vào `handOf(pose)`; đừng đặt vật ở tọa độ cố định cạnh đầu. Tai phải: `armR {a:120, b:105}`; tai trái (mẹ, yaw âm): `armL {a:-120, b:-105}`.
- Nội suy góc tay từ 14 lên 150 sẽ quét ngang qua 90 (tay chỉ ra ngang): muốn động tác nhỏ thì đừng đổi góc lớn.
- Bút/que xoay bằng `rotate(+28)` mới nghiêng lên phải về phía tay đưa từ góc phải; `rotate(-28)` nghiêng ngược, tay và bút rời nhau.
- Tin nhắn dài phải xuống dòng (`ChatScreen` đã tự ngắt ở khoảng trắng gần giữa khi > 22 ký tự).
- Vật giấu sau lưng: vẽ TRƯỚC nhân vật. Vật cho vào cặp: vẽ trước cặp và trượt xuống sau miệng cặp, không làm mờ dần.
- Cảnh cận vật thay cho cận người khi khó đọc (túi áo khổng lồ, dây cặp chéo khung): đổi sang cảnh trung/cận có người cầm vật, người xem hiểu ngay.
- Đoạn < 0,7 s (S31 "Vừa học,") thì bỏ hẳn, đừng cố giữ; nhớ bỏ cả tiếng gắn với cảnh đó.

Danh sách lỗi gốc (để đối chiếu):
Cách rà: trích 3 khung mỗi đoạn (đầu, giữa, cuối) từ `-final.mp4` (ffmpeg dump toàn bộ khung 480×270 rồi ghép trang;
`select=eq(n,..)+...` quá dài thì ffmpeg báo lỗi; ffmpeg 9 bỏ `-vsync`, dùng `-fps_mode`). Ảnh tĩnh ở `key` không đủ.
Đã sửa trong mã (chưa render lại): S3 (cầm điện thoại lên ngực, lau bụi thay cho tư thế chống hông mặt nhăn), S66
(máy quay dừng ở ảnh đại diện + cả tin nhắn, không cắt chữ), cặp dưới gầm giường (nằm ngang, gọn dưới thanh giường).
Còn phải sửa:
- S13: bỏ khối `Foreground` đen ở góc dưới trái.
- S17: mặt "oops" (><) sai cảm xúc → `worried`; tờ thông báo phải vẽ TRƯỚC nhân vật (giấu sau lưng).
- S22: dây cặp chéo khung khó hiểu → thay bằng cảnh trung: anh đeo cặp lên vai ở nhà buổi sáng.
- S26: ngủ gục mà mắt mở vì `faceAt` ghi đè `blink` → `{...pose, expr:'tired', blink: pose.blink}`; tay đặt lên bàn, đầu gục xuống tay. Kiểm tra S38 cùng lỗi.
- S28: không thấy ghế được kéo (ghế nằm sau bàn) → đặt ghế phía trước, bên phải bàn.
- S31: chỉ 0,4 s → bỏ khỏi `edit` (và bỏ tiếng `S31+8`, `S31+22`).
- S35/S36: điện thoại lơ lửng cạnh đầu, tay không cầm → yaw ~0,15, tay xa `{a:-120,b:-107}` (mẹ đối xứng), đặt điện thoại vào đầu bàn tay.
- S41: tay vung ngang khi "thở dài" (nội suy 14→150 đi qua 90) → không nhấc tay, chỉ cúi đầu, chùng vai.
- S47: hai tay không chạm rõ, không thấy vết trầy → zoom ~1,7 vào chỗ chạm, vẽ vết trầy + băng dán SAU cùng.
- S58: bong bóng tin nhắn dài tràn khỏi điện thoại → `ChatScreen` phải xuống dòng khi > ~22 ký tự.
- S61/S77: S61 chỉ 0,8 s → S77 cue `lại+45`, chữ số viết xong trong ~40 khung.
- S71: túi áo vẽ thành khối cam to, không đọc được → cận người ngồi trên xe, tay vỗ túi có phong bì.
- S76: bút lơ lửng ở dòng tiêu đề → đưa đầu bút về dòng "SĐT:".
- S63: mũ và vở mờ dần → bỏ mờ, cho trượt vào sau miệng cặp.
Sau khi sửa: `tsc`, render ảnh/lưới cho các cảnh trên, `plan` → `sfx` → `master`, rà lại bằng trang 3 khung/đoạn.

### Vòng sửa sau khi người xem duyệt "Sửa cảnh" (không nêu cảnh cụ thể)
- Người xem bấm "Sửa cảnh" mà không nói cảnh nào → sửa trước các điểm yếu mình đã tự liệt kê khi gửi bản (tay cứng, phòng trọ giống phòng teen, ghế cửa sổ chưa nổi), render lại **tất cả** cảnh (vì dùng chung `ArmIn`), gửi lại trang ghép, rồi hỏi họ muốn sửa gì thêm.
- Khi đổi một thành phần dùng chung (`ArmIn`, `Home`, `Bedroom`), render lại toàn bộ cảnh rồi mới ghép trang; nếu chỉ render vài cảnh thì các cảnh khác còn kiểu cũ.

### Quy trình soi storyboard
- `storyboard.jpg` do `board.py` dài ~19000 px, khó xem. Dùng `scripts/sheets.py <slug>`: ghép trang 3×3 (9 cảnh/trang, 1920×1080) vào `out/<slug>/sheets/`, gửi các trang này.
- Vòng sửa nhanh: sửa mã → `tsc --noEmit` → render lại vài cảnh → ghép một trang kiểm tra → mới render hết.
- Có mẫu model (bảng biểu cảm + bảng từng nhân vật: bảng màu, 5 góc, 9 biểu cảm) trước khi dựng cảnh: `npx remotion still src/index.ts Model-<id> out/models/<id>.png` và `Expressions`. Người xem duyệt nhân vật xong mới dựng storyboard, đỡ sửa lại.

## Bàn tay cận cảnh (cảnh 3, S16 và S25)

- Vẽ cận tay không ghép từ hình tròn và nét rời: rất dễ thành "tay gãy". Dùng một khối mu bàn tay liền cổ tay, các ngón nằm sát nhau, nét viền vẽ trước, màu da vẽ sau, nên chỉ còn đường mảnh giữa các ngón.
- Nắm tay áo: bốn ngón đè lên vải, ngón cái khuất sau vải (vẽ trước tay áo), thêm vài nếp vải căng về phía ngón.
- Tay đứng cạnh nhau phải đúng tỉ lệ: tay trẻ nhỏ hơn tay người lớn. Cổ tay phải chui vào trong cổ áo, không để hở khe.
- Soi cả khung đầu và khung cuối của shot, không chỉ ảnh storyboard: tay còn phải đúng khi chưa nắm hoặc đã buông.
