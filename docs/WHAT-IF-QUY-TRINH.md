# Quy trình What If

Đọc [CLAUDE.md](../CLAUDE.md) và [kinh nghiệm chung](KINH-NGHIEM.md). Mỗi lần chỉ thực hiện phạm vi người dùng yêu cầu; viết kịch bản hoặc cập nhật repo không tự bao gồm tạo giọng, ảnh, video hay đăng bài.

## 1. Chọn đề tài và lập hồ sơ tập

Đánh giá đề tài theo [mục tiêu](MUC-TIEU.md), đặt series/slug tập và lưu tại `episodes/<series>/<slug-tap>/`. README của tập ghi trạng thái, độ dài dự kiến, số vai/bối cảnh và file nguồn. Xây luật vừa đủ cho câu chuyện trước khi mở rộng thế giới.

## 2. Nghiên cứu đúng phần cần biết

Đọc [hướng dẫn nghiên cứu](../.claude/skills/what-if-animation/references/research.md). Tách dữ kiện kiểm chứng, suy luận và luật hư cấu. Khi được yêu cầu nghiên cứu sâu, tìm cả web, YouTube, TikTok và sự kiện liên quan; trung thực về phần nào thực sự xem/nghe hoặc chỉ đọc transcript. Nguồn và ghi chú thuộc `NGHIEN-CUU.md` của tập, không đưa vào kinh nghiệm chung.

## 3. Viết và kiểm tra lời

Tạo bản dựng có bối cảnh, hành động, thoại, khoảng nghỉ, camera/lens/rung/focus; bản lời sạch; bản hướng diễn xuất nếu dùng ElevenLabs. Soát luật thế giới, người biết thông tin nào, chuỗi nhân quả, mục đích từng vai, dấu hiệu chuẩn bị twist, hậu quả và kết thúc. Đọc thành tiếng để sửa câu lủng củng. Không ép câu ngắn tới mức thiếu ý hoặc chèn kiến thức vượt nhu cầu cảnh.

Ghi thời lượng ước tính cùng giả định tốc độ; sau này thay bằng audio đo thực. Bổ sung tình tiết bằng cách thay/gộp trước khi nối dài. Bài học riêng lưu vào `GHI-CHU.md` của tập.

## 4. Chuẩn bị asset và giọng

Lập `ASSET.md` trong hồ sơ tập, phân biệt có sẵn/chưa tạo/cần sửa. Chọn style và những hình chính có thể tái dùng. Giữ vùng chữ riêng khi tạo hình; chốt góc cảnh đủ dùng trước khi làm chuyển động.

**ElevenLabs là lựa chọn ưu tiên cho nội dung mới.** Chọn voice và model theo giọng nghe thực, ghi trong hồ sơ tập. `[thoughtful]` hoặc các thẻ khác là gợi ý cho model hỗ trợ, không bảo đảm được đọc đúng và không tự đổi giọng người nói. Không dán tên vai, ghi chú camera hoặc `[NGHỈ ...]` vào ô TTS. Khoảng lặng chính xác đặt khi dựng.

Backend hiện có có những giới hạn đã đọc từ mã:

- `voice.py` vẫn mặc định VieNeu để giữ tương thích ví dụ cũ. Muốn gọi ElevenLabs phải đặt `voice.engine` là `elevenlabs` trong `episode.json`.
- `voice_elevenlabs.py` ghép toàn bộ `script[].text` thành một lượt, một voice; cache toàn bài. Đổi một câu có thể tạo lại cả lượt, không có cache nhiều vai/từng đoạn cho engine này.
- Backend đặt sẵn một voice ID và model cũ: phải chọn cấu hình chủ động, không xem đó là lựa chọn giọng Việt đã được duyệt.
- Pipeline xử lý `gaps` cắt các khoảng lặng vượt ngưỡng, kể cả âm thanh nhập qua `engine: file` ở backend chung. Không dùng mặc định cho cảnh cần lắng đọng. Giữ audio gốc, ráp từng cảnh/vai và khoảng nghỉ ở timeline; chỉ đưa bản đã nghe kiểm tra vào render.
- Chưa có chức năng chuyển tự động hồ sơ Markdown nhiều vai thành tập hoàn chỉnh. Cần dựng cấu trúc episode tương ứng khi bước sản xuất được yêu cầu.

Kiểm tra quota/model và chi phí thực trên tài khoản khi thực sự tạo; không dùng hệ số giá cũ. Không ghi khóa vào repo hoặc log. Đặt `ELEVENLABS_API_KEY` trong môi trường hay `.env` local được bỏ qua bởi Git.

## 5. Dựng trong Blender, hậu kỳ khi cần

Đọc [quy chuẩn 3D](QUY-CHUAN-3D.md), [mỹ thuật](PHONG-CACH-MY-THUAT.md), [camera](NGON-NGU-DIEN-ANH-3D.md) và ASSET của tập. Nhân vật, đồ dùng và bối cảnh cùng không gian Blender; dùng entry/đơn vị của nguồn hiện hành. Không dựng mới theo rig/layer SVG hoặc ghép nhân vật lên nền 2,5D cũ.

Xuất ảnh preview từ Blender để duyệt bố cục, chất liệu và tiếp xúc; sau đó animatic/playblast có máy và diễn hoạt. Remotion có thể dùng để ráp render, giọng, SFX, UI và hậu kỳ. Scripts schema cũ chỉ dùng khi dữ liệu đầu vào tương thích; không coi Markdown là timeline chạy được.

### Duyệt hình qua hai bước: storyboard → animatic

Đây là quy trình đã chốt với chủ repo. Không thay bước animatic bằng việc chỉ xem ảnh storyboard hoặc bảng ảnh đầu–giữa–cuối.

1. **Storyboard tĩnh:** xem các still thật của mọi shot để duyệt bố cục, góc máy/lens tương đương, lớp gần–giữa–xa, ánh sáng, vị trí ban đầu và tính liên tục. Sửa hình trước khi dựng bản chuyển động.
2. **Animatic:** ráp các shot thành bản nháp chuyển động nhẹ để duyệt nhịp, khoảng nghỉ, chuyển cảnh và đường đi máy. Những hành động cầm/nhấc/đặt đồ, tiếp xúc sàn/ghế và thay đổi che khuất phải chạy bằng chuyển động dự kiến; chỉ pan/zoom storyboard tĩnh không đủ để kiểm chứng chúng. Có thể dùng clip ngắn để sửa từng shot, nhưng cần xem lại bản ráp để duyệt mạch kể.

Animatic dùng lại asset đã duyệt, độ phân giải và chất lượng preview vừa đủ đọc mắt, bàn tay và điểm tiếp xúc; có thể dùng lời đọc tạm/âm thanh tạm hoặc mốc lời ước tính. Chưa cần giọng ElevenLabs, nhạc/SFX mới trả phí hay hiệu ứng hoàn thiện chỉ để duyệt hình. Nếu đã có audio được kiểm tra thì dùng lại; không tạo lại. Sau khi có giọng chính thức, cập nhật timing và kiểm tra những phần phụ thuộc, không coi thời lượng tạm là số đo cuối.

Nhân vật và bối cảnh ở cùng scene 3D. Đồ cầm bám tay qua constraint; kiểm mặt đỡ, xuyên lưới, trượt chân và che khuất sau modifier trước render cuối. Previs ưu tiên Blender viewport/preview cùng nguồn với bản hoàn thiện.

Chỉ chuyển sang hoàn thiện và render chất lượng cuối khi hai bước trên đạt. Đây là lựa chọn quy trình nhằm giảm sửa muộn, chưa có số đo để cam kết giảm bao nhiêu quota. Trích hình và chạy preview local không cần tạo lại mỗi frame bằng dịch vụ AI; vẫn có thời gian render, tài nguyên máy và quota trợ lý nếu cần viết/sửa mã.

Chỉ tạo sound mới khi cần; ưu tiên thư viện đã kiểm tra. Lệnh `sfx.py` không kèm `--free` có thể gọi dịch vụ khi có key, vì vậy xem `--dry` và chọn chế độ rõ ràng. Đọc [sound](../.claude/skills/what-if-animation/references/sound.md). `master.py` render theo episode đã dựng; `mixcheck.py` và `motiongrid.py` hỗ trợ kiểm tra âm thanh/chuyển động, không thay việc xem và nghe. Các công cụ hiện có không tự bảo đảm tạo được animatic hoàn chỉnh từ Markdown; cần mã shot và timeline phù hợp.

Trước khi hoàn thiện âm thanh, lập bảng cue trong hồ sơ tập: nhạc theo diễn biến cảm xúc; Foley theo vật liệu, lực và tiếp xúc; môi trường theo không gian và vai trò. Animatic dùng âm tạm cho các nhịp quan trọng; sau khi chốt timing mới hoàn thiện chi tiết. Ưu tiên nguồn miễn phí đã kiểm tra giấy phép theo [quy tắc asset](ASSET.md). Không coi tiếng sấm, va đập lớn hoặc môi trường sát nguồn luôn là nền phải nhỏ: dành chỗ cho chúng khi câu chuyện cần và phối lại lời/nhạc xung quanh. Nghe bản mix xuất cuối để duyệt mức nhạc, độ rõ tiếng xé/rách/va chạm, không gian, đồng bộ và tương phản âm lượng; không chỉ nhìn gain hay báo cáo đo. Xem [hướng dẫn âm thanh](../.claude/skills/what-if-animation/references/sound.md).

## 6. Giao và cập nhật repo

Giao đúng bản đã kiểm tra, nêu thời lượng đo được hay ước tính, phạm vi hoàn thành và chi phí thực nếu có. Cập nhật trạng thái ở hồ sơ tập. Chỉ đẩy file đã được yêu cầu/ủy quyền, kiểm tra diff, giới hạn đường dẫn theo tập và các mục lục liên quan. Giữ kinh nghiệm chung ở mức nguyên tắc; giữ lịch sử sửa, chi phí và phản hồi cụ thể bên trong tập.

### Kiểm tra đồng bộ trước khi giao

Khi tập có nhiều đầu ra, lưu `KE-HOACH-SAN-XUAT.md` trong hồ sơ tập: bản nguồn, bước thực hiện/điểm duyệt, asset dùng lại, đoạn rủi ro và trạng thái thực. Kế hoạch không tự cho phép gọi dịch vụ hoặc tạo media ngoài nhiệm vụ.

Sau thay đổi, rà chuỗi **KICH-BAN → DUNG-CANH → LOI-DOC/ELEVENLABS → ASSET/README/kế hoạch → mục lục liên quan**. Đối chiếu toàn bộ lời được đọc sau bỏ thẻ diễn xuất; kiểm tra tuổi/vai/xưng hô trong thoại, luật, cue, đường dẫn và số liệu thời lượng. Nếu có mã/audio/timeline thì kiểm tra thêm các đầu ra phụ thuộc; file chưa tồn tại ghi rõ chưa tạo. Đánh dấu bản cũ là lịch sử, không sửa snapshot để giả đồng bộ. Chỉ ghi đã cập nhật GitHub sau khi push và kiểm tra nhánh từ xa khớp commit local.
