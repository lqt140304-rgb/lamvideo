# Tập `tua-lai-10-giay`: "Nếu ngày đó bạn không bỏ học?"

Đọc file này trước khi làm tiếp tập này (người hay Claude). Kinh nghiệm chung của mọi tập ở `docs/WHAT-IF-KINH-NGHIEM.md`.

## Trạng thái (cập nhật 05/11/2026)

| Mục | Tình trạng |
| --- | --- |
| Kịch bản | Của người dùng, 10 cảnh, truyện hư cấu, không có số liệu. Lời nằm trong `episode.json` → `script`, bản để dán vào web ở `public/tua-lai-10-giay/loi-doc.txt` |
| Giọng | **Viết Linh** (ElevenLabs, tạo trên web, file `public/tua-lai-10-giay/voice_in.mp3`, engine `file`). Bản giọng VieNeu Hải Đăng vẫn chạy được: đổi `voice` thành nội dung của `voice_vieneu` |
| Hình | 76 cảnh (S1–S77, đã bỏ S31), storyboard đã duyệt, đã rà bản phim và sửa 17 lỗi |
| Âm thanh | Tiếng động + nhạc lấy từ `library/sfx/` (miễn phí). Nhạc là bản vui nhộn duy nhất của thư viện, đã làm chậm/trầm (`rate`, `soft`, `dips`) |
| Bản phim | Đã master: 172,3 s, -14,3 LUFS, đỉnh -1,43 dBTP, 26,8 cắt/phút. File MP4 **không có trên GitHub** (quá 100 MB, `out/` bị ignore): dựng lại bằng `tools\what-if.bat master tua-lai-10-giay` (~21 phút) |

## Còn yếu / việc có thể làm tiếp
- Nhạc nền chưa hợp truyện buồn: thả nhạc CC0 vào `what-if-studio/library/sfx/music-local.mp3`, đổi clip `music` trong `episode.json` → `"lib:music-local"`, chạy `sfx` rồi `master`.
- S35, S36 (gọi điện): điện thoại áp tai còn là khối đen cạnh đầu, tay chưa rõ.
- Chưa có người nghe trọn bản giọng Viết Linh từ đầu đến cuối.
- Gói ElevenLabs Free: có thể không được dùng thương mại và phải ghi nguồn ElevenLabs. Kiểm tra trước khi bật kiếm tiền.

## Dựng lại từ đầu trên máy khác (Windows)
1. `git checkout claude/what-if-animation-khong-bo-hoc-eea5a3` (hoặc nhánh đã gộp), `cd what-if-studio`, `npm install`.
2. Python có VieNeu + faster-whisper: chạy `tools\what-if-setup.bat`, hoặc ghi đường dẫn python vào file `.vieneu-python` ở gốc repo (file này không lên git).
3. Từ gốc repo: `tools\what-if.bat voice tua-lai-10-giay` → `plan` → `sfx` → `master`. Thêm `--force` sau `voice` nếu muốn dò lại mốc chữ.
4. Kiểm tra: `tools\what-if.bat stills tua-lai-10-giay`, `sheets`, `review` (xem `docs/WHAT-IF-QUY-TRINH.md`).
5. Khóa ElevenLabs (chỉ cần khi gọi API, gói trả phí): file `D:\.env` có dòng `ELEVENLABS_API_KEY=...`, nằm ngoài repo. **Không bao giờ commit khóa.**

## Cấu trúc file của tập
| File | Nội dung |
| --- | --- |
| `episode.json` | lời, `gaps`/`pads` (nhịp), danh sách cảnh, `edit` (cắt theo chữ), `sound`, các cấu hình giọng |
| `words.json`, `timeline.json` | do `voice` và `plan` sinh ra; `sfx` ghi thêm mức âm lượng vào `timeline.json` |
| `common.tsx` | trợ giúp chung: dáng `P()`, `hipAt`, màu nhân vật, `HeldPhone`, `Cap`, `LedgerScreen` |
| `shots_a.tsx` … `shots_d.tsx` | cảnh 1–2, 3–4, 5–7, 8–10 (mỗi cảnh là hàm thuần của `t`) |
| `index.tsx` | đăng ký tập + hiệu ứng "TUA LẠI" |

Bộ cảnh và nhân vật mới của tập nằm trong engine (dùng lại được cho tập khác): `src/engine/sets/life.tsx` (công trường, nhà, sân trường, ngõ, xưởng điện, tòa nhà kính, xe buýt), `src/engine/props_life.tsx`, nhân vật `worker/workerHat/student/tech/chu/bac/moi` trong `src/engine/rig.tsx`, bảng mẫu nhân vật `src/ModelSheet.tsx`.
