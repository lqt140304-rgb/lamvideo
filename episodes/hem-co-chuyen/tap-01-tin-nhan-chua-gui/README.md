# Hẻm Có Chuyện — tập 01: Tin nhắn chưa gửi

**Dựng do Claude thực hiện:** bắt đầu từ [hồ sơ bàn giao](BAN-GIAO-CLAUDE.md). Hai sửa mã G1/chuồn chuồn đã chuẩn bị; ảnh preview cần Claude xuất lại.


**Định dạng đã chốt, 07/11/2026: giữ người dẫn chuyện kết hợp thoại nhân vật.** Lời dẫn giúp làm rõ thông tin, cảm giác khó quan sát và hệ quả cần hiểu; hình/âm đảm nhiệm hành động và diễn xuất. Cân đối để tránh kể lặp điều hình đã cho thấy. Chưa chuyển sang phim chỉ có thoại nhân vật; giữ lời dẫn theo bản nguồn hiện hành và đồng bộ LOI-DOC/ELEVENLABS sau biên tập.

**Asset đã cập nhật:** đã nhận bộ nâng cấp SVG của Antigravity tại commit `cd7243c`: rig, biểu cảm/tay, bối cảnh, đạo cụ, ảnh preview và 10 still. Mục tiêu của đợt này là cải tiến thư viện asset; mã/timeline tập được dùng thử hình. Timeline thử có 24 đoạn, 4.380 frame ở 30 fps = 146 giây; không phải bản dựng đủ kịch bản 35 cue hoặc thời lượng phim cuối. Chưa duyệt storyboard/animatic toàn tập hoặc tạo giọng/mix cuối.


**Bản hiện hành: 11, 08/11/2026.** Thêm kết không lời: Duy lau nước mắt cho Thảo, nắm tay, máy cận rồi mờ sang tiệm; hai tay ôm mẹ rõ ở lớp trước. [Bản thử VFX và tương tác](VFX-ME-TAN.md) có clip local 13 giây (12 giây kết đồng + 1 giây mở sang tiệm), chưa có giọng cuối. Thêm diễn biến màu/nguồn sáng theo cảnh, chuyển màu và khung, bụi vàng thưa khi mẹ tan; đã có bản thử riêng, chưa duyệt hiệu quả toàn tập. Giữ nền/nhạc không lời và âm chi tiết bản 9; đã rà quyền dùng 5 bài miễn phí, chưa nghe/tải/mix. Giữ chỉ dẫn máy bản 8: 16:9 ở thực tại, 2:1 suốt cánh đồng, rung/nghiêng ngắn chỉ tại C5-C; lời giữ bản 7. Mở đầu 24 giây không lời theo phác thảo: thành phố/trời sao và tiêu đề → hạ tới mắt cú → lùi lộ hẻm/tiệm → chuyển sang hai trẻ trước cửa và bước vào. Đúng 3 giao kèo: G1 Duy đổi ký ức tranh đồ chơi rồi được mẹ dỗ làm hòa để sửa máy; G2 Duy gánh thêm phần trống vắng của em để cả hai có thoáng ấm như mẹ còn; G3 Thảo nhanh miệng đổi những giấc mơ về mẹ lấy cuộc gặp/lời từ biệt ở cánh đồng. Duy mệt sau G2, ngăn không kịp G3. Mẹ tan, các giá không được trả lại. Bố/dì vẫn qua âm/tường thuật.

**Tuổi và xưng hô đã chốt:** Duy là **anh trai, 16 tuổi**; Thảo là **em gái, 8 tuổi**. Cả hai gọi ông Lộc là **“ông”**, xưng **“cháu”**. Ông Lộc tự xưng **“tao”**, gọi từng trẻ là **“mày”**, gọi cả hai là **“chúng mày/hai đứa mày”**. Hai trẻ vẫn gọi **“ông”**, xưng **“cháu”**; không tự đổi lời của hai trẻ sang mày–tao.

| File | Tác dụng |
|---|---|
| [BAN-GIAO-CLAUDE.md](BAN-GIAO-CLAUDE.md) | Điểm bắt đầu cho Claude: phạm vi, nguồn, hai sửa mới, đầu ra và kiểm tra trước dựng cuối |
| [KE-HOACH-SAN-XUAT.md](KE-HOACH-SAN-XUAT.md) | Kế hoạch tối ưu, bước duyệt, nhóm asset dùng lại, đoạn cần thử và bảng đồng bộ |
| [KICH-BAN.md](KICH-BAN.md) | Nguồn lời, luật/giá/hiệu lực ba giao kèo, C0 + 8 cảnh chính, nhịp nghỉ, hình và thoại |
| [DUNG-CANH.md](DUNG-CANH.md) | Bốn nhóm không gian, cú/ngõ mới và mẹ hiện hình, 35 cue, khung/nghiêng/rung, lens/focus/pose/tiếp xúc, màu/nguồn sáng/chuyển khung, bụi vàng lúc tan, nền/nhạc theo cảnh và Foley/hơi thở/môi |
| [NGUON-AM-THANH.md](NGUON-AM-THANH.md) | Nhạc/tiếng nền miễn phí, kết quả rà quyền thương mại 5 bài, trang gốc/giấy phép, cảnh đề nghị và trạng thái chưa nghe/tải; không chứa file âm rời |
| [LOI-DOC.md](LOI-DOC.md) | Lời đọc sạch từ nguồn |
| [ELEVENLABS.md](ELEVENLABS.md) | Cùng lời với thẻ gợi ý, không tự phân vai hoặc bảo đảm thời gian nghỉ |
| [VFX-ME-TAN.md](VFX-ME-TAN.md) | Mẹ tan mềm, tay ôm và nhịp lau nước mắt–nắm tay–cận–chuyển cảnh, mã/preview/kiểm tra |
| [ASSET.md](ASSET.md) | Concept có thật và phần mới thành phố/hẻm/cú/chữ, mẹ/ruộng/pose/giọng/phiếu cần tạo |
| [RA-SOAT-KINH-NGHIEM.md](RA-SOAT-KINH-NGHIEM.md) | Đối chiếu tài liệu Anti: phần mới, phần trùng, phần sửa/loại và mức kiểm chứng |
| [RA-SOAT-KICH-BAN.md](RA-SOAT-KICH-BAN.md) | Đánh giá mạch truyện, lỗi đã sửa và điểm cần thử ở storyboard/animatic |
| [GHI-CHU.md](GHI-CHU.md) | Quyết định, phản hồi, giới hạn và kiểm tra riêng |
| [Concept nhân vật v4](assets/nhan-vat/duy-thao-loc-concept-v4.png) | Lộc đã chốt mặt, hai trẻ đồ cũ/dáng che chở chờ duyệt; chưa bao gồm mẹ |

Lời sạch 1,916 đơn vị tách khoảng trắng, 8,602 ký tự gồm xuống dòng; 33 giây nghỉ riêng đã gồm trắng-ù/đi dạo, cộng 24 giây mở đầu không lời. Ước tính 10:46–12:59 phút với giả định trong nguồn, chưa đo audio/credits. Không giữ ước tính ngắn của bản 3 khi đã thêm hai giao kèo.

Bốn vai có hình chi tiết, thêm cú, ngõ mới không có bóng người qua đường; bốn nhóm không gian: thành phố-hẻm/nội tiệm/miền cánh đồng/ngưỡng nhà. Đã có mã SVG/rig, các ảnh preview và 10 still ở commit cd7243c; xem ASSET để đối chiếu nội dung. Chưa có giọng, storyboard/animatic đủ bản nguồn hoặc phim hoàn chỉnh đã duyệt. Duyệt văn/concept → storyboard → animatic có tương tác và âm tạm → hoàn thiện; không bỏ animatic hoặc tự tạo giọng trả phí để duyệt hình.

Slug hồ sơ giữ `tap-01-tin-nhan-chua-gui`. Bộ thử của Antigravity dùng alias kỹ thuật **`tin-nhan-chua-gui`**: [mã tập](../../../what-if-studio/src/episodes/tin-nhan-chua-gui/), [media](../../../what-if-studio/public/tin-nhan-chua-gui/); output local khi phát sinh ở `what-if-studio/out/tin-nhan-chua-gui/`. Tiếp tục dùng alias này và ghi ánh xạ, tránh tạo tập trùng chỉ vì khác tiền tố. Không tự chia cắt lời mẹ thành tập sau để đủ thời lượng.
