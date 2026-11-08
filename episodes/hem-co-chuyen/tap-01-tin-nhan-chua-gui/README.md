# Hẻm Có Chuyện — Tập 01: Tin nhắn chưa gửi

**Hiện hành: kịch bản bản 12, 08/11/2026.** Sau góp ý animatic, giữ người kể tiết chế, tắt hoàn toàn ở C6–C7. Ba giao kèo, tuổi 16/8, Lộc tao–mày, mẹ che con và kết tìm dì vẫn giữ. Duy là anh trai, Thảo là em gái.

Lời sạch bản 12: **1,089 đơn vị cách trắng**, **4,948 ký tự gồm LF**. Người dẫn: **1,059 → 317 đơn vị**, giảm **70,1%** so với manifest giọng bản 11; không tính chỉ dẫn diễn. Có **54 giây không lời có định lượng**, cộng **24 giây mở đầu**. Ước tính **7:14–8:27**, giả định 2,7–3,3 đơn vị/giây và 0,3 giây nối mỗi lượt lời; chưa đo giọng/animatic bản 12. Hình và âm chạy dưới lời không cộng thêm lần nữa.

Đã có animatic v2 **bản lời 11**, 11:48,416/854×480/30 fps. **Bản 12 chưa dựng lại hoặc tạo giọng mới**; timeline/manifest cũ đã đánh dấu nguồn để tránh ghép nhầm. Bộ demo asset 146 giây là lịch sử. Không coi ảnh tồn tại hay typecheck đạt là đã duyệt diễn xuất.

| File / mục | Tác dụng |
|---|---|
| [KICH-BAN.md](KICH-BAN.md) | Nguồn duy nhất: lời theo vai, thẻ gợi ý, chỉ dẫn không đọc, nhịp nghỉ, luật và 35 cue |
| [BIEN-TAP-V12.md](BIEN-TAP-V12.md) | Số liệu trước–sau, thay đổi theo cue, yêu cầu âm/giọng và trạng thái dữ liệu cũ |
| [DUNG-CANH.md](DUNG-CANH.md) | Sơ đồ bối cảnh, lens/focus/pose/tiếp xúc, màu/khung/rung/âm theo cue; phần bổ sung v12 ưu tiên |
| [LOI-DOC.md](LOI-DOC.md) | Toàn bộ chữ cần đọc, không nhãn vai/chỉ dẫn; không đưa cả bài vào một voice |
| [ELEVENLABS.md](ELEVENLABS.md) | Cùng lời sạch, thêm thẻ gợi ý; phân vai ở voices.json, nghe thử mới đánh giá được biểu cảm |
| [BAN-GIAO-CLAUDE.md](BAN-GIAO-CLAUDE.md) | Việc cần làm để chuyển văn bản 12 thành animatic mới, kiểm tra nguồn/timing và phần đã có |
| [KE-HOACH-SAN-XUAT.md](KE-HOACH-SAN-XUAT.md) | Thứ tự sản xuất, điều kiện duyệt, kiểm soát chi phí |
| [ASSET.md](ASSET.md), [assets/](assets/) | Danh mục, nguồn và quyền dùng hình/rig/đạo cụ; tránh tạo lại phần đã đạt |
| [NGUON-AM-THANH.md](NGUON-AM-THANH.md) | Nguồn nhạc không lời/FX miễn phí và điều kiện thương mại; chưa phải playlist đã nghe duyệt |
| [BO-CUC-CANH-DONG.md](BO-CUC-CANH-DONG.md), [VFX-ME-TAN.md](VFX-ME-TAN.md) | Kè đá/đồng vàng, tư thế ôm và tan/lau má–nắm tay; retime theo bản 12 |
| [CUE-SHOT.md](CUE-SHOT.md) | Bảng ánh xạ của animatic bản 11, chưa phải timing bản 12 |
| [RA-SOAT-KICH-BAN.md](RA-SOAT-KICH-BAN.md), [RA-SOAT-KINH-NGHIEM.md](RA-SOAT-KINH-NGHIEM.md) | Kết quả rà và đối chiếu tài liệu cũ, đọc cùng trạng thái phiên bản |
| [GHI-CHU.md](GHI-CHU.md) | Quyết định/tiến độ/lịch sử riêng tập; bài học dùng lại ở docs/KINH-NGHIEM.md |

Hồ sơ dùng slug `tap-01-tin-nhan-chua-gui`; mã/media dùng alias kỹ thuật `tin-nhan-chua-gui`: [mã tập](../../../what-if-studio/src/episodes/tin-nhan-chua-gui/), [media](../../../what-if-studio/public/tin-nhan-chua-gui/). Output local ở `what-if-studio/out/tin-nhan-chua-gui/`, không commit render nặng hoặc cache/khóa API. Storyboard → animatic vẫn là hai bước duyệt hình; không quay về làm lại toàn bộ asset.
