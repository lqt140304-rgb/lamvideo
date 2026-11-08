# Kế hoạch sản xuất — bản 12

08/11/2026. Đã biên tập sau animatic; xem [BIEN-TAP-V12](BIEN-TAP-V12.md) và [bàn giao Claude](BAN-GIAO-CLAUDE.md). Giữ người kể ở phần cần thiết, tắt toàn bộ C6–C7. Chưa tạo audio/render theo bản văn mới.

Lời sạch bản 12: **1,089 đơn vị cách trắng**, **4,948 ký tự gồm LF**. Người dẫn: **1,059 → 317 đơn vị**, giảm **70,1%** so với manifest giọng bản 11; không tính chỉ dẫn diễn. Có **54 giây không lời có định lượng**, cộng **24 giây mở đầu**. Ước tính **7:14–8:27**, giả định 2,7–3,3 đơn vị/giây và 0,3 giây nối mỗi lượt lời; chưa đo giọng/animatic bản 12. Hình và âm chạy dưới lời không cộng thêm lần nữa.

| Bước | Đầu ra / điều kiện chuyển | Giảm làm lại |
|---|---|---|
| 1. Nguồn lời | KICH-BAN, LOI-DOC, ELEVENLABS và phân vai khớp; rõ ba giá, tuổi/xưng hô | Đã có bản 12; không mở lại toàn bộ cốt truyện/thiết kế |
| 2. Storyboard cập nhật | Sửa đúng cue có động tác thay lời kể; thấy cầm tiền/ảnh, biểu cảm, mẹ tan và hướng về nhà dì | Tái dùng 35 cue, asset và góc cận đạt, không một ảnh mới mỗi câu |
| 3. Animatic sửa | Retime cue/staging theo lời mới và thời gian không lời; bed/FX chính có thật trong track nghe | Giọng tạm/clip cũ trùng phù hợp; không tạo trả phí cả bài để kiểm tra hình |
| 4. Giọng / diễn | Nghe thử mẫu đúng tuổi/vùng/cảm xúc, tạo lại phần cần khi công đoạn được giao | Giữ cast đã chọn, cache theo cấu hình + nội dung, không theo ID số thứ tự đơn thuần |
| 5. Mix và xuất | Nền hợp từng cảnh, nhạc không lời có quyền dùng, Foley đúng vật liệu/nguồn, thoại rõ | Kiểm tra loa điện thoại/tai nghe và khoảng gần im; không nâng mọi FX cùng mức |
| 6. Bàn giao | File nguồn khớp media, tên bản rõ, thời lượng đo và chi phí thực có log | Chỉ commit phần yêu cầu, giữ output/cache local theo slug |

**Đã có:** animatic v2 bản 11 đủ 35 cue/11:48,416 với giọng, bộ asset cartoon và preview, phần VFX tay/mẹ/đồng. **Chưa có:** animatic, giọng hoặc mix theo bản 12. Demo asset 146 giây không còn là mốc hiện trạng.

Không thay luật để rút ngắn: G1 ký/đọc/hỏi cuối trước sửa, Duy mất đúng buổi làm hòa; G2 một thoáng yên rồi Duy gánh thêm phần buồn của Thảo, hiệu lực lời nói được báo trước; G3 cả hai gặp mẹ một lần, Thảo mất mơ nhưng còn nhớ khi thức. Mẹ không hồi sinh, bố không được chữa, dì chỉ giúp một đêm. Ba tờ giấy là ba biên nhận.

Ưu tiên sửa trong animatic: trẻ không bật vào giữa cảnh hẻm; tiền/ảnh có thao tác cầm–nhả; C3/C5 đổi cỡ hình theo phản ứng thay giữ góc lâu; C6 chạy rồi nắm tay; C7 đủ cận để đọc lau má ở 480p; C8 phân biệt cửa tiệm/cửa nhà/hướng nhà dì. Giữ khung/máy bản 8, màu bản 10 và asset mới. Bed từ đầu, tiếng thở Duy chỉ khi gần cửa; C6–C7 không người dẫn. Không lời không bằng không âm.

Khi cập nhật, đối chiếu nguồn → dựng cảnh → lời sạch/thẻ → phân vai → cue/manifest/timeline/staging → mix/video. Hash phiên bản chỉ chống dùng nhầm, không thay kiểm tra ngữ nghĩa hoặc việc xem/nghe bản xuất. Tài liệu vừa sửa không tự khiến MP4 cũ thành bản mới.
