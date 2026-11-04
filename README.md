# lamvideo — video hoạt hình 9:16 phân tích, review đời sống

Mỗi video là một file kịch bản JSON. Chạy một lệnh, máy bạn đọc giọng bằng **VieNeu-TTS (giọng Hải Đăng)** rồi dựng thành MP4 1080×1920, 30 fps, dưới 90 giây, đăng thẳng lên TikTok, Facebook Reels và YouTube Shorts.

Phong cách: mascot của kênh (cậu bé tóc đen, áo hoodie xám, chân que) dẫn chuyện, nét vẽ tay rung nhẹ, nền giấy, chữ đậm, phụ đề vàng chạy theo lời đọc, kết bằng "Tóm lại là…".

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

Muốn Claude viết kịch bản: gửi chủ đề, Claude trả về `script.json` theo đúng mẫu trên.

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

Thêm trường `broll` vào cảnh trong `script.json` (một ảnh hoặc mảng nhiều ảnh):

```json
"broll": { "file": "giao-thong-ha-noi.jpg", "query": "Hanoi motorbike traffic",
           "caption": "Hà Nội sắp cấm xe máy xăng?", "from": 0, "to": 0.36 }
```

| Trường | Ý nghĩa |
|---|---|
| `file` | tên file trong `public/<slug>/img/` |
| `query` | từ khóa tìm ảnh (tiếng Anh cho kết quả tốt hơn) |
| `pick` | chọn ảnh thứ mấy trong kết quả (0 = đầu tiên) |
| `caption` | nhãn vàng trên ảnh |
| `from`, `to` | hiện từ … đến … (phần của cảnh, 0..1) |
| `style` | `"full"` tràn màn hình (mặc định) hoặc `"card"` khung polaroid |
| `focus` | điểm giữ khi cắt ảnh, ví dụ `"30% 50%"` |
| `credit` | ghi nguồn tự viết (khi tự đặt ảnh) |

Tải ảnh:

```powershell
npm run images -- xe-dien-ha-noi
```

Công cụ tìm trên [Openverse](https://openverse.org) (Wikimedia Commons, Flickr…), chỉ lấy ảnh CC0, Public Domain, CC BY, CC BY-SA, lưu vào `public/<slug>/img/` và ghi nguồn vào `credits.json`. Video tự hiện dòng ghi nguồn trên ảnh; dòng ghi nguồn đầy đủ được in ra để dán vào mô tả video (giấy phép CC BY và CC BY-SA yêu cầu ghi nguồn).

- Không ưng ảnh: xem danh sách `public/<slug>/img/<file>.candidates.txt`, xóa file ảnh, đặt `"pick": 2` (số thứ tự trong danh sách) rồi chạy lại.
- Tự có ảnh (tự chụp, Pexels, Unsplash…): đặt vào `public/<slug>/img/<file>`, ghi `"credit": "Ảnh: Tên tác giả / Pexels"`, rồi chạy `npm run images` để đăng ký.
- Chưa tải ảnh thì video vẫn render, chỉ bỏ qua phần ảnh. `npm run make` tự chạy bước này.

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
