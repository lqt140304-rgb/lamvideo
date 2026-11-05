# Mảng 3: hoạt hình "What If" (bản miễn phí, tiếng Việt)

Nguồn: video của Baptiste Kelano "Claude Motion: What-If Animation" và bảng tóm tắt
`docs/tham-khao/Kelano-What-If-Prompts-Skills.xlsx` (4 prompt, 3 kho skill, quy trình 8 bước, transcript EN/VI).
Skill gốc: https://github.com/kelano86/what-if-animation (code tự do dùng/sửa). Bản trong repo này đã sửa để
**không mất phí**: không cần ElevenLabs.

| Phần | Bản gốc | Bản trong repo |
| --- | --- | --- |
| Giọng đọc | ElevenLabs (trả phí) | **Từ 05/11/2026: ElevenLabs gói Creator** (khóa trong `.env`). Chế độ miễn phí cũ vẫn có: `"voice": {"engine": "vieneu"}` (hoặc `edge`, `file`) |
| Mốc thời gian từng chữ | ElevenLabs trả về | mỗi câu đọc riêng rồi nối lại + **faster-whisper** đọc lại audio (không có Whisper thì chia theo âm tiết) |
| Tiếng động, nhạc nền | ElevenLabs tạo mới | 41 tiếng có sẵn trong `what-if-studio/library/sfx/` (thêm tiếng CC0 từ freesound/pixabay nếu muốn) |
| Chữ trên hình | font không có dấu tiếng Việt | Bricolage Grotesque (có dấu), JetBrains Mono, Patrick Hand (`lang: 'vi'`) |
| Hình, chuyển động, master | Remotion + SVG | giữ nguyên (vẫn $0) |

Vị trí: skill ở `.claude/skills/what-if-animation/` (Claude Code tự nhận khi mở repo), studio Remotion ở
`what-if-studio/` (dự án npm riêng, mỗi tập nằm ở `what-if-studio/src/episodes/<slug>/`).

> **Khung hình:** studio dựng **1920×1080 (ngang, kiểu YouTube)** như kênh gốc. Các phòng, góc máy được vẽ cho khung
> ngang. Muốn đăng Shorts/TikTok 9:16 cần làm thêm (đặt khung dọc rồi chỉnh lại bố cục từng cảnh), chưa làm ở bản này.

## Cài đặt (một lần, Windows)

1. Cần Node.js 18+ và **Python thật** (lệnh `python` mặc định của Windows có thể chỉ là lối tắt mở Microsoft Store).
   Nếu VieNeu-TTS đang chạy bằng `uv` thì đặt biến trước:
   `set VIENEU_PYTHON=C:\duong-dan\VieNeu-TTS\.venv\Scripts\python.exe`
2. `git pull`, rồi bấm đúp `tools\what-if-setup.bat`. Nó cài thư viện studio, numpy, Pillow, faster-whisper, edge-tts
   (và vieneu nếu chưa có), in danh sách giọng, render thử 1 khung hình tập mẫu Rewind.
3. Thấy `[OK] Studio chay duoc` là xong.

## Phân công cho mỗi tập (giữ đúng cách làm của kênh)

1. **Bạn** chọn ý "Nếu bạn có thể…?", dán **Prompt W** (dưới đây) cho ChatGPT (bật tìm kiếm web).
2. **ChatGPT** trả về kịch bản 7 nhịp + phần khoa học có nguồn.
3. **Bạn** dán cho Claude Code (mở trong repo): "dựng tập What If từ kịch bản này, slug: <ten-tap>".
4. **Claude** chạy 8 bước của skill: `episode.json` → giọng → danh sách cảnh → storyboard ảnh tĩnh → tự soi 11 điểm
   → **gửi bạn xem storyboard** → làm chuyển động → tiếng động → master −14 LUFS.
5. Bạn xem `what-if-studio/out/<slug>/<slug>-final.mp4`, gửi góp ý; kiểm tra lại nguồn số liệu trước khi đăng.

Chạy tay từng bước (trong repo): `tools\what-if.bat voice <slug>`, `plan`, `stills`, `board`, `sfx`, `mixcheck`,
`motiongrid`, `master`.

## Quy trình 8 bước và thông số đo được (từ skill)

| Bước | Việc | Thông số |
| --- | --- | --- |
| 1. Kịch bản | Công thức 7 nhịp | 15–25 giây; tiếng Việt ~65–100 chữ (~4–4,5 chữ/giây). Mỗi câu là một hình nhìn thấy được |
| 2. Giọng | VieNeu + Whisper, cắt khoảng lặng | lặng tối đa: 0,12 s giữa chữ, 0,2 s dấu phẩy, 0,3 s hết câu, 0,45 s câu hỏi |
| 3. Danh sách cảnh | 9–14 cảnh, cắt trước từ khóa 2 khung | ≥27 cắt/phút ở đoạn mở (có thể 40–70), không cảnh tĩnh nào >3 s, hai cảnh liền nhau không cùng cỡ/góc |
| 4. Storyboard | Mỗi cảnh 1 ảnh tĩnh | mọi ánh sáng phát ra từ vật nhìn thấy (đèn, cửa sổ, cửa) |
| 5. Tự soi 11 điểm | Xem từng ảnh như người xem | hiểu trong 1 giây · đổi cỡ cảnh · sáng có nguồn · nhân vật nổi nhất · có tiền cảnh · phòng ≥20 đồ vật có bóng · đúng phối cảnh · biểu cảm khớp lời · liền mạch · ít chữ · nhân vật độc bản |
| 6. Chuyển động | lấy đà, giữ nhịp, quán tính | không dùng ngẫu nhiên: mọi thứ là hàm của thời gian để tua ngược được |
| 7. Âm thanh | 1 tiếng cho mỗi hành động thấy được | lời luôn to hơn tiếng động/nhạc ≥3 dB; tiếng minh họa đặt ngay **sau** chữ, không đè lên |
| 8. Master | Xuất MP4 | −14 LUFS, đỉnh < −1 dBTP |

Hai prompt đáng giữ từ video (dùng với Claude cho bất kỳ phong cách nào):
- **Đo lường:** "Here's a video. Don't copy it, measure it: how often it cuts, where the light comes from, how much the characters move. Write every rule down."
- **Tự soi lỗi:** "Render every shot as an image. Look at each one like a viewer would. List what looks wrong, and fix it before you animate anything."

## Prompt W: nhờ ChatGPT viết một tập What If

```
Viết KỊCH BẢN một tập hoạt hình "Nếu bạn có thể…?", tiếng Việt, 15–25 giây (65–100 chữ lời đọc), một người đọc
duy nhất, ngôi "bạn", thì hiện tại, câu ngắn 3–8 chữ. Ý tưởng: [NẾU BẠN CÓ THỂ ...?]
Trước khi viết: tìm trên YouTube xem đã có kênh What If nào làm đúng ý này chưa; nếu có, đổi năng lực hoặc luật.

CÔNG THỨC 7 NHỊP
1. Mở lạnh (0–11 s): 3 tình huống ngắn tăng dần (ích kỷ → hữu ích → kỳ quặc), mỗi tình huống kết bằng đúng TỪ KHÓA
   năng lực (1–2 chữ, ví dụ "Tua lại.").
2. Tiền đề: câu hỏi "Nếu bạn có thể … thì sao?" + thẻ tiêu đề 2 dòng: "NẾU BẠN CÓ THỂ" / năng lực trong 2–4 chữ.
3. Vui: 1 câu đẩy cảm xúc ("Nghe tuyệt nhỉ.").
4–7. Cú ngoặt (2–6 s cuối): cái giá phải trả dựa trên MỘT sự thật khoa học có con số, câu "Đó là sự thật.", rồi một
   câu bỏ lửng (cliffhanger).

QUY TẮC
- Mỗi câu phải vẽ được thành một cảnh, hiểu được khi tắt tiếng. Số trong lời đọc viết bằng chữ.
- Nhân vật hư cấu, không giống nhân vật nổi tiếng hay nhân vật của kênh khác. Không nói các kênh kia làm bằng công cụ gì.
- Sự thật khoa học phải có: nhận định, cách tính, nguồn (link).

MẪU TRẢ VỀ
- Tiêu đề 2 dòng
- Bảng nhịp: nhịp | lời đọc | hình nhìn thấy (1 dòng) | bối cảnh (phòng làm việc / cầu thang / lớp học / sân thượng / bếp / sơ đồ; cảnh khác sẽ phải dựng thêm)
- Khoa học: nhận định | cách tính | nguồn
- Tổng số chữ, điều chưa chắc chắn
```

## Lệnh chi tiết (Windows)

Mọi lệnh gõ trong **Command Prompt (cmd)**. Dùng PowerShell thì thêm `.\` trước file .bat (`.\tools\what-if.bat ...`)
và đặt biến bằng `$env:TEN="..."` thay cho `set TEN=...`. Thay `C:\duong-dan\lamvideo` bằng thư mục repo trên máy bạn,
`<slug>` bằng tên tập (chữ thường, gạch nối, ví dụ `tua-lai-10-giay`).

### A. Cài đặt (một lần)

```bat
:: 1. Lấy bản mới nhất của repo
cd /d C:\duong-dan\lamvideo
git pull

:: 2. Kiểm tra Python thật (một trong hai lệnh phải in ra "Python 3.x")
py -3 --version
python --version

:: 2b. Nếu VieNeu-TTS cài bằng uv (thư mục VieNeu-TTS có .venv), trỏ tới Python của nó.
::     setx lưu vĩnh viễn; đóng cửa sổ cmd và mở lại sau khi chạy.
setx VIENEU_PYTHON "C:\duong-dan\VieNeu-TTS\.venv\Scripts\python.exe"

:: 3. Cài tất cả (thư viện studio, numpy, Pillow, faster-whisper, edge-tts, vieneu) và render thử
tools\what-if-setup.bat
```

Cài tay, nếu file .bat lỗi:

```bat
cd /d C:\duong-dan\lamvideo\what-if-studio
npm install
py -3 -m pip install numpy Pillow faster-whisper edge-tts vieneu
py -3 ..\.claude\skills\what-if-animation\scripts\voice.py --voices
npx remotion still src/index.ts Rewind out/rewind-test.png --frame=60
```

Xem hai tập mẫu (Rewind, CopyPaste) trong trình duyệt: `cd what-if-studio` rồi `npm run studio`, mở http://localhost:3430.

### B. Làm một tập

Cách nhanh: mở Claude Code trong thư mục repo (`cd /d C:\duong-dan\lamvideo` rồi `claude`), dán kịch bản ChatGPT viết
theo Prompt W và gõ: `dựng tập What If từ kịch bản này, slug: <slug>`. Claude tự chạy các lệnh dưới đây.

Chạy tay từng bước (đứng ở thư mục repo, `tools\what-if.bat` tự chuyển vào `what-if-studio`):

| Bước | Lệnh | Kết quả |
| --- | --- | --- |
| 1. Kịch bản | Tạo `what-if-studio\src\episodes\<slug>\episode.json` (Claude viết từ kịch bản) | |
| 2. Giọng | `tools\what-if.bat voice <slug>` | `public\<slug>\voice.wav`, `words.json`; in mốc từng chữ |
| | `tools\what-if.bat voice <slug> --force` | đọc lại tất cả câu |
| 3. Danh sách cảnh | `tools\what-if.bat plan <slug>` | `out\<slug>\shotlist.md`, in số cắt/phút |
| 4. Storyboard | `cd what-if-studio` → `npx tsc --noEmit` → `cd ..` | kiểm tra lỗi code |
| | `tools\what-if.bat stills <slug>` | `out\<slug>\board\S1.png ...` |
| | `tools\what-if.bat board <slug>` | `out\<slug>\storyboard.jpg` (gửi bạn duyệt) |
| 5. Sửa vài cảnh | `tools\what-if.bat stills <slug> S3 S7` rồi `tools\what-if.bat board <slug>` | chỉ render lại cảnh đã sửa |
| 6. Bản nháp chuyển động | `tools\what-if.bat master <slug>` | MP4 nháp |
| | `tools\what-if.bat motiongrid <slug> S2 S5` | lưới khung hình để soi chuyển động |
| | `tools\what-if.bat stills <slug> --frames 120 240` | ảnh của khung 120, 240 |
| 7. Âm thanh | `tools\what-if.bat sfx <slug> --dry` | xem sẽ dùng tiếng nào trong thư viện |
| | `tools\what-if.bat sfx <slug>` | `public\<slug>\sfx.wav`, `music.wav`, đặt mức âm lượng |
| | `tools\what-if.bat mixcheck <slug>` | chỗ tiếng động đè lên lời (cần < 3 dB) |
| 8. Master | `tools\what-if.bat master <slug>` | `out\<slug>\<slug>-final.mp4`, `report.json` |

Đẩy tập lên GitHub (file trong `out\` không lên repo, chỉ mã nguồn tập):

```bat
git add what-if-studio\src\episodes\<slug> what-if-studio\public\<slug>
git commit -m "What If: <slug>"
git push
```

### C. Tùy chọn giọng trong `episode.json`

```json
"voice": { "engine": "vieneu", "voice": "Hải Đăng", "speed": 1.1 }
"voice": { "engine": "edge", "voice": "vi-VN-HoaiMyNeural", "rate": "+10%" }
"voice": { "engine": "file" }
"voice": { "engine": "elevenlabs" }
```

- `vieneu`: miễn phí, offline. Xem tên giọng: `cd what-if-studio` rồi `py -3 ..\.claude\skills\what-if-animation\scripts\voice.py --voices`.
- `edge`: miễn phí, cần mạng; giọng `vi-VN-NamMinhNeural` (nam) hoặc `vi-VN-HoaiMyNeural` (nữ).
- `file`: tự thu cả bài, lưu ở `what-if-studio\public\<slug>\voice_in.wav` (cần faster-whisper).
- `elevenlabs`: bản gốc trả phí; cần file `.env` ở thư mục repo với dòng `ELEVENLABS_API_KEY=...`.
- `speed`: tăng tốc cả bài, giữ cao độ (1.1 = nhanh hơn 10%). `"gaps": {"sentence": 0.25}` cắt khoảng nghỉ cuối câu ngắn hơn.

### D. Gặp lỗi

| Thông báo | Cách sửa |
| --- | --- |
| `Python was not found` / `Python tìm th...` | Các file .bat tự dùng Python ghi trong `.vieneu-python` (do `npm run voice` lưu). Chưa có file đó thì chạy `npm run voice -- xe-dien-ha-noi` một lần, hoặc: Lệnh `python` chỉ là lối tắt mở Store. Cài Python từ python.org (tick "Add python.exe to PATH") hoặc đặt `VIENEU_PYTHON` như bước A.2b |
| `Chua import duoc vieneu` | `py -3 -m pip install vieneu`, hoặc đặt `VIENEU_PYTHON` tới Python đã cài VieNeu |
| `External data path ... escapes` | Script đã tự copy model ra `%USERPROFILE%\.cache\vieneu\flat`. Nếu vẫn lỗi: `set VIENEU_ONNX_DIR=<thư mục onnx đã copy>` |
| `Run this from the studio folder` | Chạy qua `tools\what-if.bat`, hoặc `cd what-if-studio` trước |
| `npm warn install-scripts ... esbuild` | Bỏ qua được. Nếu render báo lỗi esbuild: `cd what-if-studio` rồi `npm rebuild esbuild` |
| `Cue word "..." not found` | Chữ dùng làm mốc cắt không có trong lời đọc. Chữ lặp lại thì ghi `chữ#2` |
| Chữ đặt lệch mốc | Cài faster-whisper: `py -3 -m pip install faster-whisper`, rồi `tools\what-if.bat voice <slug> --force` |
