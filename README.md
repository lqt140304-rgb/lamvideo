# lamvideo — video hoạt hình 9:16 phân tích, review đời sống

Mỗi video là một file kịch bản JSON. Chạy một lệnh, máy bạn đọc giọng bằng **VieNeu-TTS (giọng Hải Đăng)** rồi dựng thành MP4 1080×1920, 30 fps, dưới 90 giây, đăng thẳng lên TikTok, Facebook Reels và YouTube Shorts.

Phong cách: mascot của kênh (cậu bé tóc đen, áo hoodie xám, chân que) dẫn chuyện, nét vẽ tay rung nhẹ, nền giấy, chữ đậm, phụ đề vàng chạy theo lời đọc, kết bằng "Tóm lại là…".

> **Hai mảng nội dung chạy song song** (cập nhật 05/11/2026)
> 1. **TÓM GỌN**: giải thích tin, chính sách, tiền bạc, kể qua tình huống đời thường (mascot hoodie).
> 2. **Series hoạt hình tuổi thơ** (tên tạm "Bốn đứa đầu ngõ"): mỗi tập 60–90 giây, một ký ức, bốn nhân vật cố định, mỗi người một giọng. Xem `docs/SERIES-TUOI-THO.md`.
> 3. **Hoạt hình "What If"** (thêm 05/11/2026): tập 15–25 giây "Nếu bạn có thể…?", dựng theo skill của Baptiste Kelano, giọng đọc **ElevenLabs gói Creator** (từ 05/11/2026; chế độ VieNeu miễn phí vẫn còn), khung ngang 16:9, tập có thể dài hơn 25 giây. Skill ở `.claude/skills/what-if-animation/`, studio ở `what-if-studio/`, quy trình + Prompt W ở `docs/WHAT-IF-QUY-TRINH.md`. Cài: `tools\what-if-setup.bat`.

## Cài đặt (một lần)

1. Cài [Node.js 20+](https://nodejs.org).
2. Trong thư mục repo:
   ```bash
   npm install
   ```
3. VieNeu-TTS bạn đã cài sẵn. Chỉ cần biết lệnh Python nào import được `vieneu`:
   - Cài bằng `pip install vieneu` → dùng luôn `python`.
   - Chạy trong thư mục `VieNeu-TTS` bằng `uv` → đặt biến môi trường trỏ tới Python của môi trường đó, ví dụ trên Windows:
     ```powershell
     $env:VIENEU_PYTHON = "C:\duong-dan\VieNeu-TTS\.venv\Scripts\python.exe"
     ```

## Làm một video

```bash
npm run make -- xe-dien-ha-noi     # đọc giọng + render → out/xe-dien-ha-noi.mp4
```

Hoặc từng bước:

```bash
npm run voice -- xe-dien-ha-noi    # đọc giọng → public/xe-dien-ha-noi/voice/*.wav
npm run dev                        # xem trước, chỉnh trong Remotion Studio
npm run render -- xe-dien-ha-noi   # xuất MP4
```

Câu nào không sửa chữ thì giữ file giọng cũ, chỉ đọc lại câu đã đổi. Thêm `--force` để đọc lại tất cả, `--speaker "Ngọc Huyền"` để đổi giọng.

## Viết video mới

1. Copy `videos/xe-dien-ha-noi/` thành `videos/<ten-moi>/`, sửa `id` trong `script.json` cho trùng tên thư mục.
2. Thêm một dòng import trong `src/videos.ts`.
3. Mỗi cảnh có:
   - `voice`: câu cho máy đọc. **Viết số bằng chữ** ("hai không hai bảy") để giọng đọc đúng.
   - `sub` (không bắt buộc): phụ đề hiện trên màn hình, viết số bằng số ("2027"). Bỏ trống thì dùng `voice`.
   - `type` và các trường riêng:

| type | Dùng cho | Trường chính |
| --- | --- | --- |
| `hook` | 3 giây đầu giữ chân người xem | `headline` (2–3 dòng), `stamp` |
| `zones` | Bản đồ vùng Vành đai 1 | `headline`, `level` 1–3 |
| `timeline` | Lộ trình, mốc thời gian | `steps[]`: `when`, `what`, `at`, `level` |
| `compare` | So sánh A và B bằng số | `cards[2]`: `label`, `kind`, `amount`/`amountText`, `unit`, `at` |
| `list` | Điểm cộng / điểm trừ | `tone` good/bad, `items[]`, `at[]` |
| `verdict` | Ai nên / ai chưa nên | `left`, `right`, `rightAt` |
| `outro` | Tóm lại là… + kêu gọi bình luận | `kicker`, `message[]`, `cta` |

`at` là lúc một phần tử hiện ra, tính theo phần của cảnh (0 = đầu cảnh, 0.5 = giữa cảnh), để khớp với lúc giọng đọc nhắc tới nó.

4. Ghi nguồn số liệu vào `videos/<ten-moi>/sources.md` và kiểm tra lại trước khi đăng.

Kịch bản (lời đọc, chữ trên hình) do ChatGPT viết theo Prompt K trong `docs/CHATGPT-GOI-NGHIEN-CUU.md`; bạn gửi kịch bản đó, Claude chuyển thành `script.json` theo mẫu trên và dựng video.

## Đổi tên kênh, màu sắc

Sửa `src/brand.ts`. Tên kênh "TÓM GỌN" hiện là tên tạm.

## Cấu trúc

```
src/
  Short.tsx            ghép các cảnh, phụ đề, giọng, nhạc nền
  scenes/              7 loại cảnh
  components/          mascot, xe, bản đồ, phụ đề, nền giấy
  brand.ts             tên kênh, màu, font
  timing.ts            độ dài cảnh theo file giọng (hoặc ước tính nếu chưa đọc)
videos/<slug>/         kịch bản + nguồn
public/fonts/          Inter (SIL OFL 1.1)
public/<slug>/voice/   giọng đọc sinh ra trên máy bạn (không đưa lên git)
tools/                 voice.py (VieNeu), render, make
```

## Giấy phép công cụ

- **Remotion**: miễn phí cho cá nhân và công ty tối đa 3 nhân viên; lớn hơn cần Company License ([remotion.dev/license](https://www.remotion.dev/docs/license)).
- **VieNeu-TTS**: repo ghi Apache-2.0 cho bản v3 Turbo; bản 0.3B cũ là CC BY-NC (không dùng thương mại). Nếu kênh bật kiếm tiền, kiểm tra giấy phép trên trang model đang dùng.
- **Font Inter**: SIL Open Font License 1.1.

## Ảnh thật, nhạc nền, hiệu ứng

Tất cả đều miễn phí và dùng thương mại được.

### Ảnh thật (B-roll)

Ảnh thật chỉ để mở bối cảnh chung (nơi chốn, sự vật chính), không minh họa từng câu: nên **tối đa 1 ảnh mỗi cảnh (code chỉ dùng ảnh đầu tiên), 3–5 ảnh mỗi video**. Phần giải thích để hoạt hình lo. Các ảnh trong cùng cảnh tự xếp để không chồng lên nhau (ảnh sau chờ ảnh trước tắt hẳn rồi nghỉ ~0,8 giây; ảnh còn quá ngắn thì bỏ).

Mỗi ảnh gắn với một cụm từ trong lời đọc và hiện đúng lúc giọng đọc tới cụm đó:

```json
"broll": [
  { "file": "cay-xang-bom.jpg", "say": "Giá xăng hiện hơn hai mươi ba nghìn một lít", "hold": 2.2,
    "query": "Petrolimex gas station Vietnam", "must": ["petrol", "fuel", "gas station"],
    "caption": "Xăng ~23.000đ/lít" }
]
```

| Trường | Ý nghĩa |
|---|---|
| `file` | tên file trong `public/<slug>/img/` |
| `say` | cụm từ chép nguyên văn từ `voice`; ảnh hiện đúng lúc đọc tới |
| `hold` | giữ ảnh bao nhiêu giây (mặc định 2.2) |
| `query` | từ khóa tìm ảnh (tiếng Anh cho kết quả tốt hơn) |
| `must` | ảnh phải có ít nhất một từ này trong tên/mô tả mới được ưu tiên |
| `commons` | lấy đích danh một file Wikimedia Commons, ví dụ `"File:Hoan Kiem Lake.jpg"` |
| `pick` | số thứ tự ảnh đã chọn trong trang chọn ảnh |
| `caption` | nhãn vàng trên ảnh |
| `style` | `"full"` tràn màn hình (mặc định) hoặc `"card"` khung polaroid |
| `from`, `to` | (thay cho `say`) hiện từ … đến … theo phần của cảnh, 0..1 |
| `focus` | điểm giữ khi cắt ảnh, ví dụ `"30% 50%"` |
| `credit` | ghi nguồn tự viết (khi tự đặt ảnh) |

Tải ảnh và chọn ảnh:

```powershell
npm run images -- xe-dien-ha-noi            # tải ảnh còn thiếu, tạo trang chọn ảnh
start public\xe-dien-ha-noi\img\chon-anh.html   # mở trang: mỗi câu thoại kèm ~16 ảnh gợi ý
npm run images -- xe-dien-ha-noi --pick cay-xang-bom.jpg=3   # lệnh này hiện sẵn khi bấm vào ảnh
npm run images -- xe-dien-ha-noi --review   # tìm lại gợi ý cho mọi ảnh
```

**Video tin tức: ưu tiên ảnh mới.** Thêm vào `script.json` (cấp video):

```json
"images": { "since": "2023-01-01", "prefer": "newest" }
```

`since` bỏ ảnh chụp trước ngày đó, `prefer: "newest"` xếp ảnh mới lên trước (ảnh trong 6 năm gần đây được cộng điểm, càng mới càng cao). Ảnh không cần mới (phong cảnh, công trình như hồ Gươm) thì ghi đè riêng: `"since": null, "prefer": "relevant"`. Ngày lấy từ EXIF ngày chụp trên Wikimedia Commons, không có thì lấy ngày tải lên; Openverse không có ngày nên ảnh từ đó xếp sau. Trang chọn ảnh hiện ngày của từng ảnh (📅), ảnh cũ ghi "CŨ".

Nguồn: Openverse và Wikimedia Commons, chỉ ảnh CC0, Public Domain, CC BY, CC BY-SA. Video tự hiện dòng ghi nguồn trên ảnh; lệnh in sẵn dòng ghi nguồn đầy đủ để dán vào mô tả video. Tự có ảnh (tự chụp, Pexels, Unsplash…): đặt vào `public/<slug>/img/<file>` và ghi `"credit"`. Chưa có ảnh thì video vẫn render, chỉ bỏ qua ảnh đó.

### Nhạc nền

Mặc định dùng `public/audio/music/giay-nhap.wav`: nhạc tự tạo bằng code (`tools/make_audio.py`), không dùng mẫu của ai nên không lo bản quyền hay Content ID. Nhạc tự nhỏ lại khi có giọng đọc, to lên ở khoảng nghỉ, mở và kết mượt.

Đổi nhạc: đặt file vào `public/audio/music/` rồi sửa `"music"` và `"musicVolume"` (mặc định 0.22) trong `script.json`. Nguồn nhạc miễn phí dùng thương mại: YouTube Audio Library, Pixabay Music. Đặt `"music": null` nếu muốn chọn nhạc trong app TikTok/Facebook.

### Hiệu ứng (VFX + SFX)

Vẽ và tạo âm thanh bằng code, không cần tải gì:

- Chuyển cảnh: dải vàng quét chéo + tiếng vút.
- Mở đầu: tia sốc sau mascot, tia bung và tiếng đóng dấu ở chữ "CẤM?".
- Danh sách: tiếng "pop" và tia bung ở mỗi ý. Lộ trình: tiếng "tick". So sánh: "pop" + "ding".
- Ảnh thật: lóe sáng + tiếng màn trập. Cảnh kết: pháo giấy + "ding".

Âm thanh nằm ở `public/audio/sfx/` (`whoosh`, `swoosh`, `pop`, `ding`, `stamp`, `tick`, `shutter`). Dùng trong cảnh: `<Sfx name="pop" at={khung hình} volume={0.5} />`. Chỉnh âm sắc rồi tạo lại: `npm run audio`.

## Mascot

Cậu bé tóc nâu đen, hoodie xanh, giày thể thao. Ảnh PNG nền trong suốt ở `public/mascot/`, mọi tư thế cùng tỉ lệ và cùng đường mặt đất (số đo trong `src/mascot.ts`).

Tư thế có sẵn:

- Đứng: `stand`, `arms` (khoanh tay), `ok`, `thumbs`, `neutral`
- Vui: `smile`, `happy`, `excited`
- Cảm xúc: `think`, `confused`, `surprised`, `shocked`, `sad`, `angry`, `tired`, `shy`, `cry`
- Hành động: `walk`, `run`, `jump`, `bow`, `lift`, `clipboard`

Trong `script.json`, cảnh `zones` và `list` có thể đặt `"pose": "<tên>"` để đổi tư thế.

Thêm hoặc thay tư thế: đặt ảnh gốc theo cấu trúc thư mục của bộ mascot rồi chạy
`python tools/mascot_cutout.py <thư mục ảnh gốc> public/mascot 65800` (cần numpy, scipy, pillow), sau đó cập nhật `src/mascot.ts` từ `public/mascot/mascot.json`.
Ảnh nào bị cắt sát mép (mất tóc, mặt, tay) sẽ bị bỏ qua và được báo tên. Hiện còn thiếu vì lý do này:
chống hông, vẫy tay, chỉ tay, giới thiệu, nháy mắt, vui mừng, tự tin, tạo tim, uống nước, ăn, selfie, đeo balo.

> **Ảnh phải mới:** khi script có `images.since`, chỉ nhận ảnh có ngày chụp (EXIF) từ mốc đó. Ảnh Openverse không có ngày nên bị loại; ảnh đã tải từ trước mà cũ/không rõ ngày sẽ tự được tìm lại khi chạy `npm run images`.

> **Nhờ ChatGPT tìm ảnh:** xem `docs/chatgpt-tim-anh.md`. Trong `broll` dùng `url` (link trực tiếp tới ảnh) và `credit`; có `url` thì công cụ không tự tìm nữa.

## Ảnh xe tạo bằng AI (xe xăng, xe điện)

Xe vẽ SVG là phương án dự phòng. Có ảnh xe chi tiết thì code tự dùng ảnh thay hình vẽ:

1. Tạo ảnh xe nhìn nghiêng, nền trắng trơn, rộng từ 1200px (Canva, ChatGPT…): một ảnh xe xăng (đỏ, có ống xả), một ảnh xe điện (xanh, có tia sét).
2. Tách nền và chép vào dự án:
   ```
   python tools/cutout_prop.py <ảnh xe xăng> xe-xang
   python tools/cutout_prop.py <ảnh xe điện> xe-dien
   ```
   Lệnh tạo `public/props/xe-xang.png`, `xe-dien.png` và ghi kích thước vào `src/props.json`.
3. Render lại. Chưa có ảnh thì video vẫn dùng hình vẽ.

Ảnh do AI tạo: nên bật mục "nội dung do AI tạo" của nền tảng khi đăng.

## Hình vẽ minh họa (`art`)

Các cảnh `hook`, `timeline` và thẻ `compare` (kind `generic`) nhận trường `art`, tên hình trong `src/components/Art.tsx` (`BigArt`):

| Tên | Hình | Gợi ý dùng cho |
|---|---|---|
| `phone` | điện thoại, SIM, quét mặt | viễn thông |
| `lockphone` | điện thoại bị khóa | khóa SIM, mất dịch vụ |
| `idcard` | thẻ căn cước gắn chip, QR | giấy tờ, cư trú |
| `doc` | văn bản có dấu duyệt | luật, thông tư |
| `house` | ngôi nhà, chìa khóa | nhà ở |
| `rentsign` | dãy trọ, biển CHO THUÊ | thuê nhà |
| `money` | xấp tiền, xu | chi phí |
| `piggy` | heo đất, xu rơi | tiết kiệm |
| `bank` | ngân hàng | lãi suất |
| `chart` | biểu đồ cột, mũi tên tăng | số liệu |
| `gold` | thỏi vàng | vàng miếng |
| `ring` | nhẫn vàng 9999 | vàng nhẫn |
| `taxform` | tờ khai thuế, máy tính | thuế |
| `ship` | tàu container, nhãn THUẾ | xuất nhập khẩu |
| `shield` | khiên | bảo vệ, bảo hiểm tiền gửi |
| `medcard` | thẻ bảo hiểm, chữ thập, nhịp tim | y tế |

Mỗi video mới nên vẽ thêm ít nhất một hình riêng cho chủ đề, tránh lặp lại hình của video khác.

Thẻ `compare` loại `generic` còn có `tint` (`red|green|blue|yellow`); cảnh `compare` có `bars: false` để tắt biểu đồ, `badge` để tự đặt nhãn.

Cảnh nào lời đọc có số viết bằng chữ thì thêm `sub` (phụ đề viết bằng số, cùng nội dung).

## Bố cục cảnh (đa dạng giữa các video)

Mỗi video nên dùng bộ bố cục khác nhau. Có hai cách:

**1. Đổi `layout` của cảnh có sẵn**

| Cảnh | `layout` |
|---|---|
| `hook` | `poster` (mặc định), `number` (con số khổng lồ từ `stamp`), `news` (khung TIN NÓNG), `question` (dấu hỏi lớn) |
| `list` | `rows` (mặc định), `tiles` (ô vuông), `notes` (giấy nhớ), `clipboard` (bảng kẹp giấy) |
| `compare` | `cards` (mặc định), `slider` (một khung chia đôi), `duel` (hai thanh ngang xếp chồng) |
| `verdict` | `columns` (mặc định), `scale` (cái cân; `heavier`: `left`/`right`/`even`) |

**2. Dùng loại cảnh mới**

| `type` | Dùng khi | Trường chính |
|---|---|---|
| `stat` | một con số quan trọng | `value`, `unit`, `ring`, `chips[{text,at}]` |
| `steps` | các bước/mốc xếp so le | `steps[{title,detail,at}]` |
| `myth` | hiểu lầm → sự thật | `pairs[{myth,fact,at}]` |
| `chat` | hỏi đáp | `title`, `messages[{from:"user"|"bot",text,at}]` |
| `receipt` | phép tính từng dòng | `rows[{label,value,at}]`, `total{label,value,at}` |
| `ladder` | các bậc tăng dần | `rungs[{label,value,at}]` |

Đổi cảnh nào mà lời đọc (`voice`) đổi thì cần đọc lại giọng (`npm run make` tự làm).

## Kinh nghiệm và kiểm tra kịch bản

- `npm run lint` — bắt câu lặp giữa các video, `say`/`cue` sai, hook quá dài, quá nhiều ảnh thật.
- Đọc [docs/KINH-NGHIEM.md](docs/KINH-NGHIEM.md) trước khi làm video mới.
- Trường mới trong cảnh: `cue` (cụm từ chốt ý của hook), `cam` (in/out/drift/punch/none), `transition` (wipe/iris/bar/flash/none).
- Cách phối hợp ChatGPT (nghiên cứu, tìm ảnh, viết kịch bản, soát nội dung) và Claude (chỉ dựng video): [docs/CHATGPT-GOI-NGHIEN-CUU.md](docs/CHATGPT-GOI-NGHIEN-CUU.md).
