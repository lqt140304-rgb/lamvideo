# lamvideo — video hoạt hình 9:16 phân tích, review đời sống

Mỗi video là một file kịch bản JSON. Chạy một lệnh, máy bạn đọc giọng bằng **VieNeu-TTS (giọng Hải Đăng)** rồi dựng thành MP4 1080×1920, 30 fps, dưới 90 giây, đăng thẳng lên TikTok, Facebook Reels và YouTube Shorts.

Phong cách: người que "Tèo" đội mũ bảo hiểm vàng dẫn chuyện, nét vẽ tay rung nhẹ, nền giấy, chữ đậm, phụ đề vàng chạy theo lời đọc, kết bằng "Tóm lại là…".

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
  components/          nhân vật Tèo, xe, bản đồ, phụ đề, nền giấy
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
