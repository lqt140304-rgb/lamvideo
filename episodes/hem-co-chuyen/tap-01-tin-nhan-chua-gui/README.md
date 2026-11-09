# Hẻm Có Chuyện — Hồ sơ 1: Tin nhắn chưa gửi

**Hiện hành bản 14 — 09/11/2026:** rút đường mở thành phố–cú–cửa tiệm còn 14 giây; diễn đủ Thảo nghịch đồng hồ → bị quát → Duy che em/xin lỗi/hỏi sửa → Lộc xem máy rồi báo giá. Rút gia cảnh đầu thành một đoạn ngắn, đưa thông tin dì Hạnh vào đúng chỗ ở C2. Chi tiết diễn/FX và nghiệm thu ở [BIEN-TAP-V14.md](BIEN-TAP-V14.md). Giữ ba giao kèo và phần kết bản 13.

Bản 14: **1,092 đơn vị cách trắng, 4,976 ký tự gồm LF, 89 lượt lời**; người dẫn **264 đơn vị**. Giữ **40 cue/C0–C9**; C0 **14 giây**, các khoảng nghỉ được ghi trong nguồn cộng **99.2 giây** (không cộng lặp các khoảng đó khi lập timeline). Chưa đo thời lượng giọng hoặc phim bản 14; các đoạn dừng riêng trong cue plan cũ phải được đối chiếu trước khi cộng.

**Trạng thái media bản 14:** đã có animatic v3 bản 13 (8:45,3 theo hồ sơ tập), chưa duyệt; không phải phim khớp lời mới. Lượt sửa này chỉ cập nhật văn bản và phân vai. Không tạo giọng, mix, staging, timeline hoặc MP4 mới. `cues.json`/voice-manifest/timeline giữ nguồn cũ để chặn dựng nhầm; Claude cần ánh xạ lại C0–C2 và retime diễn trước khi dựng.

**Lịch sử bản 13, 08/11/2026.** Thêm cảnh mở vũ trụ theo HE-LO-QUAI-VAT; giữ phần biên tập sau animatic, giữ người kể tiết chế, tắt hoàn toàn ở C6–C7. Ba giao kèo, tuổi 16/8, Lộc tao–mày, mẹ che con và kết tìm dì vẫn giữ. Duy là anh trai, Thảo là em gái.


Lịch sử: animatic v2 là bản lời 11, 11:48,416; bản v3 đã dựng bản 13 theo mục dưới. Bộ demo asset 146 giây cũng là lịch sử. Không coi ảnh tồn tại hay typecheck đạt là đã duyệt diễn xuất hoặc phim bản 14.

**Dựng bản 13 (09/11/2026):** timeline/cue đã ánh xạ lại đủ 40 cue, có 5 shot mới C8-E và C9-A…D, cameo chân dung/lọ và [storyboard](assets/storyboard/storyboard-v13-1.jpg) ([trang 2](assets/storyboard/storyboard-v13-2.jpg));  Đã có animatic v3 có giọng đủ 85 lượt, 8:45,3, chưa duyệt. **Chưa có** âm nền, nhạc hoặc mix bản 13.

| File / mục | Tác dụng |
|---|---|
| [KICH-BAN.md](KICH-BAN.md) | Nguồn duy nhất: lời theo vai, thẻ gợi ý, chỉ dẫn không đọc, nhịp nghỉ, luật và 40 cue |
| [HE-LO-QUAI-VAT.md](HE-LO-QUAI-VAT.md) | Cameo, cảnh tiệm biến mất, nguyên hình/kho/ba lọ, camera/âm và asset mới cần tạo |
| [VU-TRU series](../VU-TRU.md) | Nền thế giới, giới hạn và hồ sơ quái vật dùng chung giữa các tập |
| [BIEN-TAP-V12.md](BIEN-TAP-V12.md) | Số liệu trước–sau, thay đổi theo cue, yêu cầu âm/giọng và trạng thái dữ liệu cũ |
| [DUNG-CANH.md](DUNG-CANH.md) | Sơ đồ bối cảnh, lens/focus/pose/tiếp xúc, màu/khung/rung/âm theo cue; phần bổ sung v12 ưu tiên |
| [LOI-DOC.md](LOI-DOC.md) | Toàn bộ chữ cần đọc, không nhãn vai/chỉ dẫn; không đưa cả bài vào một voice |
| [ELEVENLABS.md](ELEVENLABS.md) | Cùng lời sạch, thêm thẻ gợi ý; phân vai ở voices.json, nghe thử mới đánh giá được biểu cảm |
| [BIEN-TAP-V14.md](BIEN-TAP-V14.md) | Mạch mở mới, bảng beat diễn, camera/focus/ánh sáng/Foley, ánh xạ item đề xuất và tiêu chí duyệt animatic |
| [BAN-GIAO-CLAUDE.md](BAN-GIAO-CLAUDE.md) | Việc cần làm để chuyển văn bản 13 thành animatic mới, kiểm tra nguồn/timing và phần đã có |
| [KE-HOACH-SAN-XUAT.md](KE-HOACH-SAN-XUAT.md) | Thứ tự sản xuất, điều kiện duyệt, kiểm soát chi phí |
| [ASSET.md](ASSET.md), [assets/](assets/) | Danh mục, nguồn và quyền dùng hình/rig/đạo cụ; tránh tạo lại phần đã đạt |
| [NGUON-AM-THANH.md](NGUON-AM-THANH.md) | Nguồn nhạc không lời/FX miễn phí và điều kiện thương mại; chưa phải playlist đã nghe duyệt |
| [BO-CUC-CANH-DONG.md](BO-CUC-CANH-DONG.md), [VFX-ME-TAN.md](VFX-ME-TAN.md) | Kè đá/đồng vàng, tư thế ôm và tan/lau má–nắm tay; retime theo bản 13 |
| [CUE-SHOT.md](CUE-SHOT.md) | Bảng ánh xạ của animatic bản 11, chưa phải timing bản 13 |
| [RA-SOAT-KICH-BAN.md](RA-SOAT-KICH-BAN.md), [RA-SOAT-KINH-NGHIEM.md](RA-SOAT-KINH-NGHIEM.md) | Kết quả rà và đối chiếu tài liệu cũ, đọc cùng trạng thái phiên bản |
| [GHI-CHU.md](GHI-CHU.md) | Quyết định/tiến độ/lịch sử riêng tập; bài học dùng lại ở docs/KINH-NGHIEM.md |

Hồ sơ dùng slug `tap-01-tin-nhan-chua-gui`; mã/media dùng alias kỹ thuật `tin-nhan-chua-gui`: [mã tập](../../../what-if-studio/src/episodes/tin-nhan-chua-gui/), [media](../../../what-if-studio/public/tin-nhan-chua-gui/). Output local ở `what-if-studio/out/tin-nhan-chua-gui/`, không commit render nặng hoặc cache/khóa API. Storyboard → animatic vẫn là hai bước duyệt hình; không quay về làm lại toàn bộ asset.
