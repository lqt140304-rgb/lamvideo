# lamvideo — What If giữa đời thường

Những chuyện giả định đặt người bình thường vào một lựa chọn khó, để người xem tự hỏi: **nếu là mình thì sao?** Ưu tiên đời sống Việt Nam, mâu thuẫn có chiều sâu, kết thúc có hệ quả và cách sản xuất vừa sức.

**Thông báo mỹ thuật — 10/11/2026:** phong cách cartoon Style B dùng đường cong mềm, hình khối tròn đầy và nét liền mạch cho **cả nhân vật, nội thất, đạo cụ, kiến trúc, đường phố và môi trường**. Đọc [quy chuẩn mỹ thuật chung](docs/PHONG-CACH-MY-THUAT.md) trước khi thiết kế. [Bộ nhân vật hiện có](episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat.svg) là tham chiếu Style B; quy chuẩn mới không đồng nghĩa toàn bộ nền/asset cũ đã được vẽ lại hoặc rig/timeline đã hoàn thiện.

**Quyết định tạo hình mới — 10/11/2026:** nhân vật không viền ngoài, tay–chân giản lược bằng khối mềm; xem [quy chuẩn và ảnh so sánh](docs/PHONG-CACH-MY-THUAT.md). Rig Hồ sơ 2 (`nhan-vat.tsx`) đã bỏ viền ngoài ngày 10/11/2026 và xuất lại bảng dàn nhân vật; tay vẫn cần một lượt giản lược ngón theo ảnh so sánh. Asset của hồ sơ khác chưa cập nhật.

## Bắt đầu ở đây

**Thư viện biểu cảm dùng chung:** [bộ nét mặt tách lớp](what-if-studio/library/expressions/cartoon-soft/README.md) có 27 mức biểu cảm + trung tính, không tóc/khung đầu, để căn vào nhân vật mới; xem giới hạn góc nhìn và cách ghép trong hướng dẫn.

**Asset xuyên series mới — 10/11/2026:** [Nhân vật truy vết](episodes/hem-co-chuyen/assets/nguoi-truy-vet/README.md) có mẫu toàn thân hiện hành và 27 biểu cảm theo 3 mức + trung tính đã duyệt. Lưu riêng ở asset chung của Hẻm Có Chuyện; chưa rig hoặc ghép vào tập.

| File | Tác dụng và nội dung cần có | Khi đọc hoặc cập nhật |
|---|---|---|
| [MUC-TIEU.md](docs/MUC-TIEU.md) | Hướng nội dung, khán giả, phạm vi thử và tiêu chí chọn đề tài; dùng để quyết định một ý tưởng có phù hợp kênh hay không | Đọc trước khi chọn đề tài; sửa khi chủ repo thay đổi định hướng |
| [KINH-NGHIEM.md](docs/KINH-NGHIEM.md) | Những nguyên tắc dùng lại được để nâng chất lượng và tiết kiệm thời gian/chi phí; không chứa cốt truyện hoặc nhật ký riêng của tập | Đọc trước khi làm; bổ sung bài học mới sau công việc theo quy tắc bên dưới |
| [NGON-NGU-DIEN-ANH-2-5D.md](docs/NGON-NGU-DIEN-ANH-2-5D.md) | Nghiên cứu góc máy, lens, lấy nét, chuyển động và cách tạo chiều sâu cho hình 2D; có mẫu shot, nguồn và giới hạn kỹ thuật | Đọc khi lập storyboard hoặc chọn phong cách; các đề xuất cần dựng thử trước khi coi là khả năng đã có của studio |
| [PHONG-CACH-MY-THUAT.md](docs/PHONG-CACH-MY-THUAT.md) | Quy chuẩn nét cong, khối mềm và sự đồng nhất người–đạo cụ–bối cảnh | Đọc trước thiết kế hoặc sửa hình; kiểm tra trong một khung ghép |
| [ASSET.md](docs/ASSET.md) | Danh mục tài nguyên dùng chung và liên kết tới bảng asset từng tập; giúp tìm thứ đã có trước khi tạo mới | Đọc khi lập kế hoạch hình/âm; cập nhật khi có tài nguyên dùng chung hoặc hồ sơ tập mới |
| [KICH-BAN.md](docs/KICH-BAN.md) | Mục lục tập, trạng thái và đường dẫn bản nguồn; không chứa toàn bộ lời của các tập | Đọc để tìm đúng hồ sơ; cập nhật khi thêm tập hoặc đổi trạng thái |
| [WHAT-IF-QUY-TRINH.md](docs/WHAT-IF-QUY-TRINH.md) | Cách đi từ nghiên cứu tới viết, giọng, storyboard, dựng và bàn giao; nêu cả giới hạn công cụ | Đọc khi bắt đầu một công đoạn; sửa khi cách làm chung thay đổi |
| [what-if-yeu-cau.md](docs/what-if-yeu-cau.md) | Mẫu đầu vào: việc cần làm, chủ đề, phạm vi, nguồn, ngân sách và đầu ra | Dùng để lập yêu cầu; thông tin đã điền cho một tập phải lưu trong hồ sơ tập |
| [Skill viết từng cảnh](.claude/skills/co-write-scenes/SKILL.md), [cảm xúc–thoại](.claude/skills/emotional-dialogue/SKILL.md), [logic truyện](.claude/skills/story-logic-review/SKILL.md) | Ba công cụ biên tập bổ sung: cùng chốt từng cảnh, diễn xuất đúng tình huống và rà nguyên nhân–hệ quả | Đọc đúng skill theo việc đang làm; không tự tạo media |
| [CLAUDE.md](CLAUDE.md) | Quy tắc làm việc, phân chia file, phạm vi nhiệm vụ và cách cập nhật repo cho Claude | Đọc trước khi thao tác repo; sửa khi có quy ước dùng chung mới |

`README.md` này là bản đồ của repo: giúp người và agent biết đọc gì, sửa ở đâu. Chi tiết từng tập nằm trong `episodes/`, tài liệu chuyên sâu nằm trong `docs/` và skill.

## Nhắc các agent sau khi hoàn thành công việc

Sau mỗi công việc, hãy rà lại xem có rút ra kinh nghiệm giúp nâng chất lượng, tránh lỗi, tiết kiệm thời gian hoặc chi phí hay không. **Nếu có, cập nhật [file kinh nghiệm dùng chung](docs/KINH-NGHIEM.md) trước khi bàn giao kết quả.**

- Đọc phần đã có để bổ sung hoặc sửa đúng mục, tránh ghi trùng.
- Viết ngắn: **vấn đề → nguyên nhân → cách làm tốt hơn → cách kiểm tra**. Phân biệt điều đã kiểm chứng với giả thuyết cần thử.
- Chỉ đưa nguyên tắc áp dụng lại được vào file chung. Tên nhân vật, cốt truyện, số shot, thông số và chi phí riêng của một tập phải nằm trong `GHI-CHU.md` hoặc `ASSET.md` của tập đó.
- Không chép nguyên nhật ký thao tác, áp thông số của một lần thử cho mọi dự án, hoặc tạo bài học chỉ để có mục mới. Nếu không có kinh nghiệm mới thì không cần thêm.

## Cấu trúc

```text
docs/                         mục tiêu, kinh nghiệm, mục lục dùng chung
episodes/<series>/<slug-tap>/  hồ sơ riêng của từng tập
  README.md                   trạng thái, phạm vi, các bản nguồn
  KE-HOACH-SAN-XUAT.md        bước làm, điểm duyệt, tái sử dụng và kiểm tra đồng bộ
  KICH-BAN.md                 bản dựng có cảnh, thoại, camera, khoảng nghỉ
  LOI-DOC.md                  lời đọc sạch
  ELEVENLABS.md               lời đọc có hướng diễn xuất để thử
  ASSET.md                    asset của riêng tập và trạng thái
  GHI-CHU.md                  các quyết định, lỗi, phản hồi riêng của tập
.claude/skills/what-if-animation/  skill và công cụ kỹ thuật
what-if-studio/               studio Remotion, engine, thư viện và tập mẫu
```

Nghiên cứu hoặc tài nguyên mới cũng đặt trong thư mục tập tương ứng khi phát sinh. Không tạo hàng loạt file rỗng. Kinh nghiệm chung không chứa cốt truyện riêng của tập.

**Đang làm:** Hẻm Có Chuyện mở thành [vũ trụ quái vật có khả năng riêng](episodes/hem-co-chuyen/VU-TRU.md). [Tin nhắn chưa gửi](episodes/hem-co-chuyen/tap-01-tin-nhan-chua-gui/README.md) bản 13 giữ lời gọn bản 12 và thêm cameo/tiệm biến mất/nguyên hình Lộc/kho lọ: 40 cue, ước tính 7:45–8:58. Chưa dựng hoặc tạo asset phần mới; animatic hiện có vẫn bản lời 11. Đọc bàn giao Claude trong hồ sơ tập trước khi dựng.

**Đang phát triển văn bản:** [Hồ sơ 2 — Người làm thay](episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/README.md) đã có [bản nháp chi tiết đủ ba phần V1](episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/KICH-BAN.md) (10/11/2026), mỗi phần có thể tới 10 phút, nhịp thử 9:40 / 9:00 / 9:00. Đã chốt hướng kết: Nam bị nhốt trong thế giới gương, Người Kia thay thế ngoài đời, kết mở. Giữ mức duyệt cũ của phần 1; phần 2–3, luật và cơ chế mới là đề xuất chờ duyệt. Chưa có lời sạch phân vai, giọng, storyboard hay video. Bộ nhân vật Nam, Người Kia, Tùng đã có rig khớp với 8 góc quay và 11 dáng; xem README của hồ sơ. [Quy ước Hồ sơ 1, Hồ sơ 2](episodes/hem-co-chuyen/README.md#cách-gọi-các-truyện) giữ các slug kỹ thuật cũ.

Hồ sơ đã sắp xếp: [Hồ sơ 1 — Tin nhắn chưa gửi](episodes/hem-co-chuyen/tap-01-tin-nhan-chua-gui/README.md) và [Mưa liên tục 100 ngày](episodes/doc-lap/mua-100-ngay/README.md). Tập mưa giữ bản dựng cũ trong `production/` của chính tập để bảo toàn engine và dữ liệu từng cảnh; không tự nhập các thay đổi cũ đó vào engine chung.

## Tác dụng các thư mục

| Thư mục | Chứa gì / dùng để làm gì |
|---|---|
| `docs/` | Tài liệu chung của kênh và mục lục. Không rải nghiên cứu, cốt truyện hoặc asset riêng của một tập vào đây |
| `docs/tham-khao/` | Tư liệu tham khảo kỹ thuật gốc; file `Kelano-What-If-Prompts-Skills.xlsx` giữ bảng prompt/skill để đối chiếu, không thay thế quy trình hiện tại |
| `episodes/<series>/<slug-tap>/` | Hồ sơ của đúng một tập. `<series>` là nhóm nội dung; `<slug-tap>` là tên thư mục ổn định dùng để nhận diện tập |
| `episodes/hem-co-chuyen/` | Series có README/VU-TRU dùng chung; mỗi tập con có hồ sơ riêng. Lore series không đặt vào kinh nghiệm chung |
| `episodes/doc-lap/` | Những tập What If độc lập, không mặc định thuộc thế giới của Hẻm Có Chuyện |
| `.claude/skills/what-if-animation/` | Hướng dẫn chuyên môn và công cụ hỗ trợ What If; đọc theo công việc cần làm |
| `tools/` ở gốc repo | Tiện ích Windows để cài/chạy công cụ What If; khác với scripts bên trong skill |
| `what-if-studio/` | Dự án Remotion dùng chung: mã dựng, engine, ví dụ và thư viện. Chạy lệnh npm tại đây |
| `production/` trong hồ sơ tập cũ | Snapshot giữ engine, mã và dữ liệu đúng phiên bản của tập đã dựng. Chỉ dùng để xem/sửa bản cũ khi cần, không tự đồng bộ lên studio chung |

## Tác dụng từng file trong hồ sơ tập

Các tên dưới đây tính từ `episodes/<series>/<slug-tap>/`. Chỉ tạo file khi có nội dung thực sự cần lưu.

| File / thư mục | Tác dụng | Nội dung thuộc riêng tập |
|---|---|---|
| `README.md` | Điểm bắt đầu của tập: tình trạng hiện tại, phạm vi, bản nguồn và bước còn thiếu | Tập nào, bao nhiêu vai/bối cảnh, đã có văn bản hay media, bản nào đang dùng |
| `KE-HOACH-SAN-XUAT.md` khi cần | Kế hoạch thực hiện và kiểm soát lượt sửa | Bản nguồn đang áp dụng, thứ tự làm/duyệt, nhóm asset dùng lại, cảnh rủi ro, kiểm tra đồng bộ và phần chưa sản xuất |
| `KICH-BAN.md` | Nguồn biên tập của câu chuyện và bản dựng | Luật thế giới, vai trò nhân vật, cảnh, hành động, thoại, camera/lens/rung/focus, âm thanh và khoảng nghỉ |
| `DUNG-CANH.md` khi cần | Triển khai hình/âm chi tiết theo cue của kịch bản nguồn | Sơ đồ phòng, vị trí máy/lens, tư thế, đường đi đạo cụ, lớp gần–xa, âm thanh và điểm cần duyệt ở storyboard/animatic; không tạo bản thoại độc lập |
| `NGUON-AM-THANH.md` khi cần | Nguồn nhạc/âm môi trường của tập | Tên bản/tác giả, URL, giấy phép/ngày kiểm tra, cảnh đề nghị, trạng thái nghe/tải/dùng; không mặc định file được phép phân phối lại |
| `LOI-DOC.md` | Lời sạch dùng để đọc thử hoặc chuẩn bị TTS | Chỉ phần được đọc; không có tên shot, chỉ dẫn quay hoặc `[NGHỈ ...]` |
| `ELEVENLABS.md` | Bản lời có hướng diễn xuất cho giọng/model phù hợp | Thẻ cảm xúc đặt đúng đoạn; phải khớp bản lời nguồn, không coi thẻ là lệnh tự phân vai |
| `ASSET.md` | Bảng kiểm tài nguyên của tập | Mã asset, nhân vật/bối cảnh/đạo cụ/âm thanh, đường dẫn, nguồn/quyền dùng, phiên bản và trạng thái đã có/chưa tạo |
| `GHI-CHU.md` | Nhật ký quyết định và theo dõi sửa tập | Phản hồi, lỗi riêng, chi phí/lượt thử, chỗ cần kiểm tra và lý do chọn/bỏ một cách xử lý |
| `NGHIEN-CUU.md` khi cần | Hồ sơ kiểm chứng trước khi viết hoặc sửa | Nguồn, ngày truy cập, video thực sự xem hay chỉ đọc transcript, nguyên nhân/hệ quả, giả định và điều chưa biết |
| `assets/` khi cần | File tài nguyên riêng chưa được đưa lên thư viện chung | Hình, thiết kế hoặc tài liệu liên quan tập; media để studio chạy có thể ở thư mục kỹ thuật và được liên kết từ ASSET |
| `asset-manifest.json` khi nhập dữ liệu | Kiểm kê và đối chiếu file | Nguồn, đường dẫn, kích thước, SHA-256, lưu Git hay chỉ local; không thay cho duyệt chất lượng/quyền sử dụng |
| `RA-SOAT-KINH-NGHIEM.md` khi nhập dự án cũ | Giải thích cách chọn/lọc bài học cũ | Điều được giữ riêng, điều bỏ vì lỗi thời, điều đã viết lại thành nguyên tắc chung |
| `production/README.md` nếu có snapshot | Hướng dẫn dùng bản dựng cũ và các giới hạn | Phiên bản dữ liệu, media phải khôi phục, phụ thuộc và công cụ chưa được kiểm tra lại |
| `production/LICENSE` | Giữ giấy phép của mã nguồn kế thừa trong snapshot | Không áp giấy phép mã cho mọi audio/hình |
| `bao-cao-cu/README.md` nếu có | Giải thích phạm vi báo cáo lịch sử | Dữ liệu từ lần dựng nào, điều chưa xác minh lại, không gọi đó là kết quả mới |
| `bao-cao-cu/<canh>/report.json` | Giữ số đo/log của lần dựng trước | Thời lượng, loudness/peak và credits được log; chi phí có thể chưa gồm mọi lượt thử |
| `bao-cao-cu/<canh>/shotlist.md` | Giữ danh sách đoạn/cảnh theo timeline cũ | Mốc cắt và lời tương ứng để đối chiếu, không tự cập nhật khi kịch bản đổi |

**Phân biệt các file dễ nhầm:** `docs/KICH-BAN.md` là mục lục, còn `KICH-BAN.md` trong tập chứa câu chuyện. `docs/ASSET.md` là danh mục chung, còn `ASSET.md` trong tập ghi tài nguyên riêng. `docs/KINH-NGHIEM.md` lưu bài học dùng lại được, còn `GHI-CHU.md` lưu diễn biến công việc của tập.

## Tác dụng từng file trong skill

Các đường dẫn dưới đây tính từ `.claude/skills/what-if-animation/`.

| File | Tác dụng / khi dùng |
|---|---|
| [SKILL.md](.claude/skills/what-if-animation/SKILL.md) | Hướng dẫn chính: xác định công việc và chọn tài liệu chuyên sâu cần đọc |
| [README.md](.claude/skills/what-if-animation/README.md) | Giới thiệu skill, nguồn kế thừa và những điều đã điều chỉnh cho repo |
| [references/formula.md](.claude/skills/what-if-animation/references/formula.md) | Phát triển tiền đề, nhu cầu nhân vật, xung đột, lựa chọn, twist và kết thúc |
| [references/research.md](.claude/skills/what-if-animation/references/research.md) | Cách tìm/đối chiếu web–YouTube–TikTok, phân tích nguyên nhân/hệ quả và tách sự thật khỏi sáng tác |
| [references/kit.md](.claude/skills/what-if-animation/references/kit.md) | Tra API và cấu trúc bộ dựng: rig, pose, camera, set, tọa độ phòng, đạo cụ, ánh sáng và UI |
| [references/look.md](.claude/skills/what-if-animation/references/look.md) | Tham khảo ngôn ngữ hình ảnh, cỡ cảnh, ánh sáng và kiểm tra storyboard/chuyển động; các định mức clip ngắn cũ không áp bắt buộc cho truyện dài |
| [references/sound.md](.claude/skills/what-if-animation/references/sound.md) | Giọng, khoảng nghỉ, chọn thư viện, cue tiếng động, trộn âm và ghi chi phí |
| [references/traps.md](.claude/skills/what-if-animation/references/traps.md) | Tra lỗi kỹ thuật từng gặp khi vẽ/dựng/mix; kiểm tra phiên bản trước khi áp thông số mẫu |
| `opencode/commands/what-if.md` | Điểm gọi skill trong môi trường hỗ trợ lệnh OpenCode; không chứa kịch bản tập |
| `LICENSE` | Giấy phép mã skill kế thừa; giữ khi phân phối hoặc chỉnh sửa mã |

### Các script hỗ trợ

Chạy scripts từ đúng thư mục studio theo quy trình; chúng cần dữ liệu episode hợp lệ. Có script tạo media hoặc gọi dịch vụ nên không chạy toàn bộ chỉ để đọc/kiểm tra tài liệu.

| File trong `scripts/` | Đọc gì / tạo gì |
|---|---|
| `wi.py` | Hàm dùng chung: đường dẫn, đọc cấu hình, cue, audio, khóa qua môi trường và log chi phí; không phải bước sản xuất riêng |
| `voice.py` | Chọn backend giọng, xử lý audio và xuất `voice.wav`/`words.json`; bản chung còn mặc định VieNeu, cần cấu hình ElevenLabs rõ ràng |
| `voice_elevenlabs.py` | Backend gọi ElevenLabs, lưu audio gốc, mốc chữ và cache lượt tạo; bản chung là một voice cho toàn bài |
| `plan.py` | Ghép cue trong `episode.json` với `words.json` để tạo `timeline.json` và `shotlist.md` |
| `stills.mjs` | Render khung hình khóa hoặc khung được chỉ định để soi từng shot |
| `board.py` | Ghép các ảnh shot thành storyboard để nhìn mạch bố cục |
| `motiongrid.py` | Trích lưới khung từ video nháp để xem chuyển động, đầu–giữa–cuối và lỗi đổi trạng thái |
| `sfx.py` | Chọn/tạo clip, đặt event và xuất stem SFX/nhạc; `--dry` xem kế hoạch, `--free` dùng thư viện thay vì tạo clip trả phí |
| `mixcheck.py` | Đánh dấu những chỗ nhạc/hiệu ứng có thể che lời để nghe kiểm tra; không tự chứng minh mix đã tốt |
| `master.py` | Render/mix, chuẩn hóa âm lượng và ghi video cùng `report.json`; cần kiểm tra file kết quả thực tế |

Snapshot `production/tools/` của tập mưa giữ phiên bản cũ riêng của các công cụ trên. Nó còn có `sheets.py` để chia storyboard thành trang và `review.py` để ghép ảnh kiểm tra từ video; đó không phải các file đã có trong skill chung.

## Tác dụng từng phần trong studio

Các đường dẫn sau tính từ `what-if-studio/`; snapshot `production/` có cách tổ chức tương tự nhưng dùng phiên bản riêng.

| File / thư mục | Tác dụng |
|---|---|
| `package.json` | Khai báo thư viện và lệnh npm (`studio`, `typecheck`) |
| `package-lock.json` | Khóa cây phiên bản thư viện để cài lại nhất quán bằng `npm ci` |
| `tsconfig.json` | Cấu hình kiểm tra/biên dịch TypeScript; không chứa nội dung câu chuyện |
| `remotion.config.ts` | Cấu hình Remotion như entry point và cách xuất hình |
| `.gitignore` | Quy tắc bỏ qua file local/phát sinh trong phạm vi studio |
| `src/index.ts` | Entry point đăng ký Root với Remotion |
| `src/Root.tsx` | Đăng ký các composition phim, board và bảng mẫu để Studio/CLI nhận diện |
| `src/studio.config.ts` | Kích thước khung, fps, ngôn ngữ và font; thay có thể ảnh hưởng nhiều tập |
| `src/CastSheet.tsx` | Bảng nhìn tổng các mẫu nhân vật để kiểm tra tạo hình |
| `src/episodes/index.ts` | Danh sách tập được đăng ký trong studio; thêm hồ sơ Markdown chưa tự thêm được composition |
| `src/episodes/<slug-tap>/` | Mã và dữ liệu dựng riêng của tập; tên file được giải thích ở bảng tiếp theo |
| `src/engine/` | Các thành phần dựng dùng chung; sửa cần kiểm tra các tập phụ thuộc |
| `public/<slug-tap>/` | Media để Remotion đọc cho tập tương ứng; file sinh ra có thể chỉ giữ local |
| `library/sfx/` | Clip âm thanh nguồn để dùng lại khi phối; cần kiểm tra nguồn và mức phù hợp |
| `library/sfx-packs/` | Các pack âm dùng chung có danh mục riêng; [KORBANN](what-if-studio/library/sfx-packs/korbann/README.md) đã nhập local. Media giữ ngoài Git; kiểm tra quyền và nghe chọn trước khi dùng |
| `out/<slug-tap>/` | Ảnh kiểm tra, storyboard, shotlist, video, báo cáo và log sinh ra; không phải nguồn kịch bản |
| `node_modules/` | Thư viện đã cài trên máy; được bỏ qua bởi Git, có thể cài lại |

### Mã và dữ liệu một tập trong studio

| File | Tác dụng / cách cập nhật |
|---|---|
| `episode.json` | Cấu hình lời, voice, shot, cue, hiệu ứng và âm thanh cho engine; phải đồng bộ từ kịch bản nguồn khi sửa |
| `index.tsx` | Nối timeline, các shot và hiệu ứng riêng thành episode/composition |
| `shots.tsx` | Vẽ nhân vật, bối cảnh, đạo cụ, camera và chuyển động theo thời gian của từng shot |
| `words.json` | Mốc bắt đầu/kết thúc từng đơn vị lời từ bước xử lý giọng; thay giọng có thể làm mốc đổi |
| `timeline.json` | Timeline dựng đã giải cue; được công cụ tạo lại, không giữ sửa tay thiếu ghi nhận |
| `captions.json` nếu engine hỗ trợ | Các dòng chữ bổ sung, cue và thời lượng; snapshot mưa có hỗ trợ này, không mặc định engine chung đã có |
| `nguon-am-thanh.md` khi có | Nguồn, tác giả/giấy phép và phần âm thanh dùng lại hoặc chưa rõ của cảnh/tập |

### Các file engine

| File trong `src/engine/` | Tác dụng |
|---|---|
| `index.ts` | Điểm xuất các thành phần để shot import từ một nơi |
| `episode.tsx` | Ghép shot/timeline/media thành phim và board |
| `anim.ts` | Hàm nội suy, easing, thời gian và chuyển động dùng chung |
| `rig.tsx` | Bộ xương/tạo hình nhân vật, trang phục, pose, biểu cảm và vị trí khớp |
| `room.tsx` | Phối cảnh phòng, đổi tọa độ không gian và vị trí đứng |
| `furnish.tsx` | Nội thất, bề mặt, cửa/đèn và các thành phần trang trí phòng |
| `props.tsx` | Đạo cụ vẽ sẵn để shot tái sử dụng |
| `kit.tsx` | Thành phần SVG, lớp hoàn thiện và các tiện ích hình ảnh cơ bản |
| `light.tsx` | Ánh sáng, lớp tối, glow, khí quyển và hiệu ứng không gian |
| `ui.tsx` | Tiêu đề, nhãn, đồng hồ, gauge và ký hiệu trên hình |
| `fonts.ts` | Nạp và cấu hình font mà các thành phần hình sử dụng |
| `sets/study.tsx` | Phòng làm việc/học mẫu |
| `sets/stairwell.tsx` | Cầu thang mẫu và mốc đứng/di chuyển trên bậc |
| `sets/classroom.tsx` | Lớp học mẫu |
| `sets/rooftop.tsx` | Sân thượng, thành phố và các trạng thái đèn/trời |
| `sets/kitchen.tsx` | Bếp mẫu và vị trí đảo bếp/đạo cụ |
| `sets/bedroom.tsx` | Phòng ngủ mẫu, giường và trạng thái đèn/lịch |
| `sets/schematic.tsx` | Nền sơ đồ, ký hiệu và hình giải thích khi câu chuyện cần |

Snapshot mưa giữ các phiên bản riêng của `src/ModelSheet.tsx`, tay cận, đạo cụ đời sống và các set mở rộng. Studio chung nay cũng có `engine/hands.tsx`, `props_life.tsx`, `vehicles.tsx` và `sets/tin_nhan_chua_gui.tsx` từ đợt nâng cấp asset. Đọc đúng phiên bản/API trong studio trước khi tái dùng; các set life/benlau/school của snapshot không tự được nhập lên engine chung.

## Cấu hình local và tiện ích Windows

| File | Tác dụng / phạm vi |
|---|---|
| `.gitignore` ở gốc | Loại khóa dịch vụ, cấu hình riêng, cache, thư viện cài đặt và media phát sinh khỏi commit |
| `CLAUDE.local.md` nếu có | Đường dẫn, worktree, môi trường và lưu ý riêng của máy; không đưa lên Git |
| `.env` / `.env.*` nếu có | Biến môi trường, gồm khóa dịch vụ khi cần; chỉ local, không in nội dung hoặc commit |
| `.vieneu-python` nếu còn dùng | Đường dẫn Python của backend cũ để tiện ích Windows dò môi trường; chỉ local |
| `tools/what-if.bat` | Lối gọi một công cụ What If trên Windows; không tự tạo cả tập |
| `tools/what-if-setup.bat` | Tiện ích thiết lập cũ có cài VieNeu/Edge và thử khung mẫu; không bắt buộc cho quy trình ElevenLabs |

## Dùng studio

```powershell
cd what-if-studio
npm ci
npm run studio
# Kiểm tra khi sửa mã:
npm run typecheck
```

Hai ví dụ `rewind` và `copy-paste` được giữ để tham khảo kỹ thuật. Studio hiện có bố cục ngang 1920×1080; không tự biến kịch bản Markdown thành video hoàn chỉnh. Làm nội dung mới đọc [quy trình](docs/WHAT-IF-QUY-TRINH.md) trước, đặc biệt giới hạn của backend giọng và cách giữ khoảng nghỉ. Ưu tiên ElevenLabs; chưa cần gọi dịch vụ khi chỉ sửa tài liệu.

## Phạm vi repo

Repo tập trung vào What If. Các công cụ của luồng tin tức/review và video tuổi thơ cũ đã được gỡ khỏi nhánh chính; lịch sử Git vẫn giữ các bản trước. Không xóa kho Git gốc của một worktree để dọn dung lượng.

Engine và skill kỹ thuật kế thừa [what-if-animation của Baptiste Kelano](https://github.com/kelano86/what-if-animation); giữ [LICENSE](.claude/skills/what-if-animation/LICENSE). Giấy phép mã không mặc nhiên áp dụng cho mọi âm thanh hoặc tài nguyên bên thứ ba: ghi nguồn theo [quy tắc asset](docs/ASSET.md).
