# Kế hoạch sản xuất — bản 13

**Hiện hành bản 14 — 09/11/2026:** rút đường mở thành phố–cú–cửa tiệm còn 14 giây; diễn đủ Thảo nghịch đồng hồ → bị quát → Duy che em/xin lỗi/hỏi sửa → Lộc xem máy rồi báo giá. Rút gia cảnh đầu thành một đoạn ngắn, đưa thông tin dì Hạnh vào đúng chỗ ở C2. Chi tiết diễn/FX và nghiệm thu ở [BIEN-TAP-V14.md](BIEN-TAP-V14.md). Giữ ba giao kèo và phần kết bản 13.

Bản 14: **1,092 đơn vị cách trắng, 4,976 ký tự gồm LF, 89 lượt lời**; người dẫn **264 đơn vị**. Giữ **40 cue/C0–C9**; C0 **14 giây**, các khoảng nghỉ được ghi trong nguồn cộng **99.2 giây** (không cộng lặp các khoảng đó khi lập timeline). Chưa đo thời lượng giọng hoặc phim bản 14; các đoạn dừng riêng trong cue plan cũ phải được đối chiếu trước khi cộng.

**Trạng thái media bản 14:** đã có animatic v3 bản 13 (8:45,3 theo hồ sơ tập), chưa duyệt; không phải phim khớp lời mới. Lượt sửa này chỉ cập nhật văn bản và phân vai. Không tạo giọng, mix, staging, timeline hoặc MP4 mới. `cues.json`/voice-manifest/timeline giữ nguồn cũ để chặn dựng nhầm; Claude cần ánh xạ lại C0–C2 và retime diễn trước khi dựng.



08/11/2026. Đã biên tập sau animatic; xem [BIEN-TAP-V12](BIEN-TAP-V12.md) và [bàn giao Claude](BAN-GIAO-CLAUDE.md). Giữ người kể ở phần cần thiết, tắt toàn bộ C6–C7 và C9. Chưa tạo audio/render theo bản văn mới.


| Bước | Đầu ra / điều kiện chuyển | Giảm làm lại |
|---|---|---|
| 1. Nguồn lời | KICH-BAN, LOI-DOC, ELEVENLABS và phân vai khớp; rõ ba giá, tuổi/xưng hô | Đã có nguồn bản 13; giữ cốt truyện con người, tạo đúng phần quái vật/cameo còn thiếu |
| 2. Storyboard cập nhật | Sửa đúng cue có động tác thay lời kể; thấy cầm tiền/ảnh, biểu cảm, mẹ tan và hướng về nhà dì | Tái dùng 35 cue cũ, thêm 5 cue không lời và cameo theo HE-LO-QUAI-VAT, không một ảnh mới mỗi câu |
| 3. Animatic sửa | Retime cue/staging theo lời mới và thời gian không lời; bed/FX chính có thật trong track nghe | Giọng tạm/clip cũ trùng phù hợp; không tạo trả phí cả bài để kiểm tra hình |
| 4. Giọng / diễn | Nghe thử mẫu đúng tuổi/vùng/cảm xúc, tạo lại phần cần khi công đoạn được giao | Giữ cast đã chọn, cache theo cấu hình + nội dung, không theo ID số thứ tự đơn thuần |
| 5. Mix và xuất | Nền hợp từng cảnh, nhạc không lời có quyền dùng, Foley đúng vật liệu/nguồn, thoại rõ | Kiểm tra loa điện thoại/tai nghe và khoảng gần im; không nâng mọi FX cùng mức |
| 6. Bàn giao | File nguồn khớp media, tên bản rõ, thời lượng đo và chi phí thực có log | Chỉ commit phần yêu cầu, giữ output/cache local theo slug |

**Đã có:** animatic v2 bản 11 đủ 35 cue/11:48,416 với giọng, bộ asset cartoon và preview, phần VFX tay/mẹ/đồng. **Chưa có:** animatic/mix theo bản 13; nguyên hình/kho/cameo chưa có media. Demo asset 146 giây không còn là mốc hiện trạng.

Không thay luật để rút ngắn: G1 ký/đọc/hỏi cuối trước sửa, Duy mất đúng buổi làm hòa; G2 một thoáng yên rồi Duy gánh thêm phần buồn của Thảo, hiệu lực lời nói được báo trước; G3 cả hai gặp mẹ một lần, Thảo mất mơ nhưng còn nhớ khi thức. Mẹ không hồi sinh, bố không được chữa, dì chỉ giúp một đêm. Ba tờ giấy là ba biên nhận.

Ưu tiên sửa trong animatic: trẻ không bật vào giữa cảnh hẻm; tiền/ảnh có thao tác cầm–nhả; C3/C5 đổi cỡ hình theo phản ứng thay giữ góc lâu; C6 chạy rồi nắm tay; C7 đủ cận để đọc lau má ở 480p; C8 phân biệt cửa tiệm/cửa nhà/hướng nhà dì. Giữ khung/máy bản 8, màu bản 10 và asset mới. Bed từ đầu, tiếng thở Duy chỉ khi gần cửa; C6–C7 không người dẫn. Không lời không bằng không âm.

Khi cập nhật, đối chiếu nguồn → dựng cảnh → lời sạch/thẻ → phân vai → cue/manifest/timeline/staging → mix/video. Hash phiên bản chỉ chống dùng nhầm, không thay kiểm tra ngữ nghĩa hoặc việc xem/nghe bản xuất. Tài liệu vừa sửa không tự khiến MP4 cũ thành bản mới.
