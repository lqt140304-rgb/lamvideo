# Hẻm Có Chuyện — Hồ sơ 2: Người làm thay

**Ánh sáng nhân vật và demo Cảnh 1 — 10/11/2026:** rig nhận `light` (mảng tối từng phần, viền sáng, bóng tiếp đất, hệ số nét `line`); hướng tính bằng `lightFor(view, at)` từ cửa sổ/đèn bàn của [bối cảnh](assets/boi-canh/boi-canh.tsx). Không truyền `light` thì vẫn vẽ phẳng như bảng mẫu. Đã sửa mẩu vai lòi khỏi viền và bo tròn đáy quần (lưu vào thiết kế, bảng mẫu đã xuất lại). Xem [bảng so trước/sau](assets/thiet-ke/thu-anh-sang.png); Studio: `HoSo02AnhSangThu`. Đã có bản nháp animatic câm A01–A05 (`HoSo02Canh01Demo`, phụ đề tạm, chưa giọng/âm) — tạm dừng để chốt ánh sáng nhân vật trước, chưa áp `light` vào demo, chưa render video.

**Rà và tích hợp 10/11/2026:** đã đưa các sửa truyện từ phiên tách vào [bản cảnh](THAO-LUAN-CANH.md), đồng bộ [bảng máy](DUNG-CANH.md) với phòng/rig hiện hành. Đã khớp chuỗi ghế, bản nháp riêng, áo theo cảnh và dấu nốt ruồi đối bên theo chốt Người Kia sinh ra từ gương. Xem [căn cứ, hướng sửa và phần còn cần thử](RA-SOAT-SUA-TRUYEN.md). Chưa viết phần kết hoặc nâng các cảnh còn “chờ duyệt” thành đã duyệt phim.

**Nhịp kịch bản — 10/11/2026:** đã thêm cue không đọc vào [bản cảnh hiện hành](THAO-LUAN-CANH.md) và [đường nhịp A–H](DUNG-CANH.md#nhịp-kể-hiện-hành): phản ứng khi nhận mặt, đối đáp, thử làm bài, chốt cửa, chuyển sáng–tối và tự kiểm chứng trước khi dịu. Giữ thoại và mức duyệt; chưa có giọng/animatic để khóa tổng phút.

**Sửa tạo hình rig V3 (bản cũ) — 10/11/2026:** thân/tay áo hợp thành một viền, giảm nét chồng, tay nghỉ buông gần thẳng; hướng bàn tay bám cẳng tay, sửa bên ngón cái và dáng cầm điện thoại. Xem [soi chỗ nối/bàn tay](assets/rig/chi-tiet-khop.png), [đối chiếu mẫu](assets/rig/doi-chieu-mau-goc.png), [bảng 12 dáng](assets/rig/tu-the-khop.png). Đã cân thêm độ rộng hai chân: [xem bảng chân](assets/rig/can-doi-chan.png). Đã làm đầy cẳng tay/cổ tay và tách dáng ngón khi gõ/giữ bát: [soi bàn tay](assets/rig/ban-tay-ro-net.png). Nguồn/SVG/PNG/HTML đã cập nhật; chờ duyệt, chưa đưa vào phim.

**Rig chính:** `Rigged`, `TWIN_POSES`, `solveRig` trong [assets/nhan-vat.tsx](assets/nhan-vat.tsx), dùng cho Nam, Người Kia và Tùng:

- 8 góc quay: chính diện, 3/4, nghiêng, 1/4, sau lưng và ba góc quay trái; `turnAt` để xoay dần.
- 11 dáng: `stand`, `sit`, `stride`, `crouch`, `reach`, `holdBowl`, `stop`, `wary`, `phone`, `offer`, `type`. Bốn dáng cuối mới dựng và soi ở góc 3/4.
- `sampleWalk` cho vòng bước tại chỗ, `talk` cho khẩu hình, `blink` cho chớp mắt, `prop` cho điện thoại và bát đi theo bàn tay.

Xem trong Studio (`npm run studio` tại `what-if-studio/`): `HoSo02Turnaround`, `HoSo02Spin`, `HoSo02RigSheet`. Cách dùng và bảng lỗi cần tránh ở [quy chuẩn thiết kế](assets/thiet-ke/QUY-CHUAN-THIET-KE-SVG.md). Kiểm tra bằng `node tests/ho-so-02-rig.cjs` trong `what-if-studio/`. Chưa thay timeline hoặc khởi động dựng phim.

**Lỗi và việc còn tồn đọng:** [LOI-TON-DONG.md](LOI-TON-DONG.md).

**Rig cũ (chỉ để đối chiếu):** [bảng tư thế](assets/rig/tu-the-khop.png) và [hướng dẫn](assets/rig/RIG-NHAN-VAT.md); các mục "rig V3" trong file này nói về bản cũ.

**Thông báo mỹ thuật 10/11/2026:** áp dụng [quy chuẩn chung](../../../docs/PHONG-CACH-MY-THUAT.md) cho nhân vật **và toàn bộ bối cảnh/đạo cụ**: nét cong mềm, khối tròn đầy, phối cảnh và điểm tiếp xúc rõ. Đã có mô hình phòng và các góc xem trong hồ sơ bối cảnh; còn phải kiểm tra tương tác/chuyển động theo shot.

**Trạng thái ngày 09/11/2026:** đang cùng chủ repo phát triển từng cảnh. “Người làm thay” là tên làm việc. Các đoạn đầu do GPT-6 Astra đề xuất; từ yêu cầu tiếp theo ngày 09/11/2026 chuyển sang **GPT-6.1 Sol để tiết kiệm**. Người dùng chốt nội dung lần lượt. Chưa có kịch bản hoàn chỉnh được duyệt.

**Thông báo thiết kế nhân vật:** đã có bộ mới **Nam, Người Kia và Tùng** theo Style B. Xem [bảng SVG](assets/nhan-vat.svg), [nguồn React/SVG](assets/nhan-vat.tsx) và [ASSET.md](ASSET.md). Bộ này phát triển từ mẫu thứ 2 đã chọn trong [hướng tạo hình](../THIET-KE-NHAN-VAT.md); có tệp thiết kế chưa đồng nghĩa đã kiểm tra chuyển động trong cảnh. Không tự thay tạo hình Hồ sơ 1.

| File | Tác dụng |
|---|---|
| [ASSET.md](ASSET.md) | Bộ SVG Nam–Người Kia–Tùng mới, mã nguồn, bảng biểu cảm và mẫu tham chiếu ban đầu |
| [DUNG-CANH.md](DUNG-CANH.md) | Nhịp kể/khoảng đọc và giữ; góc máy/lens/chuyển động/rung/focus; cách tách lớp, parallax, che khuất, chữ bám màn hình; mặt bằng/ánh sáng/điểm cắt theo từng đoạn, chưa render |
| [THAO-LUAN-CANH.md](THAO-LUAN-CANH.md) | Các yêu cầu đã chốt, khung cảnh còn đề xuất và bản cảnh hiện đang thảo luận |

Tiền đề đã chọn: một nam sinh viên lười nhác thức dậy thấy người giống hệt mình làm những việc thường ngày. Sự giúp đỡ ban đầu dần trở thành chiếm chỗ, tới khi cậu bị thay thế hoàn toàn. Chỉ đoạn cuối mới xác nhận đó là sinh vật đã chủ động nhắm tới cậu từ trước.

**Cảnh 1 đã được đồng ý về cách xuất hiện bí ẩn và nhịp cảm xúc.** Đã duyệt cuộc gọi Tùng không tin rồi cúp máy và đoạn Nam yêu cầu người kia ra ngoài, vào phòng gài chốt. Đã duyệt phần Nam nhắn Tùng quay về, kiểm tra đồ và chủ động hỏi lại qua cửa. Phần mới theo khung chủ repo — bí bài, tự cân nhắc, chơi game/ngủ quên và tỉnh tối thấy bài làm hộ — còn chờ duyệt lời/cách nối. Nam và Tùng là tên dùng trong đoạn đã duyệt. Nam đã được xác định là sinh viên năm hai; tuổi cụ thể, vai trò tiếp theo của Tùng, cơ chế thay thế và lời các đoạn khác còn đang thảo luận. Hướng nữ thợ sửa quần áo trước đây đã bỏ, không phải bản nguồn của hồ sơ này.

Đọc [quy ước series](../README.md) và [vũ trụ](../VU-TRU.md). Giữ lời dẫn vừa phải theo hướng hiện tại. Đã có bộ SVG/React mới cho ba nhân vật theo mẫu thứ 2 đã chọn; xem [ASSET.md](ASSET.md). Kịch bản vẫn đang chốt từng cảnh. Claude phụ trách dựng khi được giao; chưa tạo giọng, storyboard cảnh, animatic hoặc video cho Hồ sơ 2.

Skill hỗ trợ: [cùng viết từng cảnh](../../../.claude/skills/co-write-scenes/SKILL.md), [cảm xúc và lời thoại](../../../.claude/skills/emotional-dialogue/SKILL.md), [rà logic truyện](../../../.claude/skills/story-logic-review/SKILL.md).

**Cách cùng duyệt:** xem trực tiếp [file thảo luận](THAO-LUAN-CANH.md), phần mới ở cuối file và ghi rõ chưa duyệt. Trong chat chỉ báo ngắn phần đã cập nhật và gửi đường dẫn; không chép lại nội dung kịch bản. Tiếp tục chốt lần lượt từng phần.

## Mốc xem bản thảo hiện tại

Các đoạn trước đã duyệt như nhãn trong file. [Phần mới theo khung chủ repo](THAO-LUAN-CANH.md#nam-tự-thuyết-phục-mình--phát-triển-theo-khung-mới-chờ-duyệt) còn chờ duyệt: Nam bí bài, tự cân nhắc lợi–hại, chơi game/ngủ quên tới tối, rồi thấy người kia làm hộ bài. Dừng ở Nam tự kiểm tra bài, bắt đầu dịu và tự tâng bốc mình; chưa viết bước thay thế tiếp theo. Chủ repo xem trực tiếp file để thử thiết kế đoạn hiện có; chưa tạo giọng hoặc dựng video.

**Bổ sung ngày 10/11/2026:** đã có [góc máy chi tiết theo từng đoạn](DUNG-CANH.md), nhóm MAY-A đến MAY-H. Lời và mức duyệt truyện giữ nguyên. Phần máy ưu tiên phản ứng, khoảng cách qua cửa và bố cục lặp sáng–tối; chưa tạo hình, giọng hoặc chạy dựng trong lượt này.

**Quay layer 10/11/2026:** [phần hướng dẫn trong DUNG-CANH](DUNG-CANH.md#quay-layer) có thứ tự gần–xa, bốn cách quay P0–P3, ví dụ dịch lớp và áp dụng A–H. Đây là hướng dẫn triển khai; chưa tách SVG hoặc tạo chuyển động trong lượt này.
