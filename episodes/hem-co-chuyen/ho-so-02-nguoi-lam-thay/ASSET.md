# Asset — Hồ sơ 2: Người làm thay

**Sửa tạo hình rig V2 — 10/11/2026:** quần áo và tay chân đã được vẽ kỹ hơn theo bộ gốc; giữ nguyên đầu. Xem [đối chiếu mẫu gốc / bản sửa](assets/rig/doi-chieu-mau-goc.png) và [bảng tư thế mới](assets/rig/tu-the-khop.png). Trình xem/SVG/PNG đã cập nhật cùng nguồn; chờ duyệt tạo hình, chưa đưa vào phim.

**Bổ sung tư thế/khớp — 10/11/2026:** đã có [bảng 12 tư thế](assets/rig/tu-the-khop.png), [nguồn rig](assets/rig/rig.tsx) và [trình xem khớp](assets/rig/xem-tu-the.html) cho Nam, Người Kia, Tùng, dùng lại đầu/màu của bộ hiện có. Đọc [hướng dẫn và giới hạn](assets/rig/RIG-NHAN-VAT.md) trước khi dựng: bản để duyệt, chưa là chuyển động/tương tác đã duyệt trong phim.

**Thông báo mỹ thuật 10/11/2026:** áp dụng [quy chuẩn chung](../../../docs/PHONG-CACH-MY-THUAT.md) cho nhân vật **và toàn bộ bối cảnh/đạo cụ**: nét cong mềm, khối tròn đầy, phối cảnh và điểm tiếp xúc rõ. Những nền hiện có cần được đối chiếu khi chỉnh hình; chưa ghi nhận vẽ lại SVG/TSX/PNG trong lượt cập nhật tài liệu này.

## Dàn nhân vật theo mẫu SVG mới (Style B) — 09/11/2026

Toàn bộ nhân vật xuất hiện trong kịch bản **Hồ sơ 2: Người làm thay** đã được thiết kế đồng bộ theo phong cách SVG hữu cơ mới (Style B: nét vẽ mềm, mảng tóc gọn, vai áo rủ tự nhiên, quần có khối, biểu cảm linh hoạt).

**Trạng thái sử dụng:** bộ mới đã được cập nhật từ GitHub tại `593c626`; đây là nguồn thiết kế hiện hành để tham khảo. Style B được chọn từ mẫu thứ 2; chưa coi các pose/biểu cảm mới là đã được duyệt trong từng cảnh hoặc rig đã kiểm tra chuyển động. Nam là sinh viên năm hai theo kịch bản mới.

### Bảng nhân vật hiện có
- **Hình ảnh xem trước:** ![Dàn nhân vật chuẩn Style B](assets/nhan-vat.png)
- **Trình xem trực tiếp tương tác (Zoom/Pan):** [`assets/xem-truc-tiep.html`](assets/xem-truc-tiep.html)
- **Tài liệu quy chuẩn thiết kế SVG (Style B):** [`assets/thiet-ke/QUY-CHUAN-THIET-KE-SVG.md`](assets/thiet-ke/QUY-CHUAN-THIET-KE-SVG.md)
- **File vector SVG master:** [`assets/nhan-vat.svg`](assets/nhan-vat.svg) (bảng 1920×1080 gồm dáng toàn thân và các cận cảnh biểu cảm).
- **Mã nguồn React / Remotion:** [`assets/nhan-vat.tsx`](assets/nhan-vat.tsx) (chứa `Nam`, `NguoiKia`, `Tung`, các component đầu và biểu cảm tương ứng).

| Nhân vật | Vai trò trong kịch bản | Đặc điểm nhận diện & Tạo hình | Trang phục & Đạo cụ |
|---|---|---|---|
| **1. Nam** | Sinh viên nhân vật chính, lười nhác, ngủ nướng, trễ deadline bài nhóm, sợ hãi khi gặp bản sao | **Nốt ruồi sát đuôi mày trái** (chi tiết then chốt từ kịch bản), tóc bo tròn tự nhiên không nét thừa trên đỉnh, vai mềm buông lơi, hai tay đầy đặn rõ ràng buông tự nhiên ngoài thân áo. | Áo thun xanh rêu (`#5c7a70`), quần dài xám có khối (`#515451`), dép lê quai kẹp (`#425850`). |
| **2. Người Kia (Bản sao)** | Sinh vật thay thế bí ẩn, 100% bản sao hoàn hảo của Nam | Khuôn mặt, **nốt ruồi đuôi mày trái, kiểu tóc và vóc dáng giống hệt Nam 100%**, dáng tay đầy đặn rõ ràng như Nam, ánh mắt điềm tĩnh / bí hiểm. | Mặc chiếc **áo thun xanh rêu (`#5c7a70`) của Nam** (chiếc áo Nam bỏ trên ghế tối qua), quần dài xám (`#515451`), dép lê (`#425850`). |
| **3. Tùng** | Bạn cùng phòng chăm chỉ, dậy sớm đi học lúc 7h, nghe máy gạt đi vì tưởng Nam ngủ mơ ("Mày xàm hả?") | Sinh viên năng động, gương mặt sáng sủa, cằm gọn, **tóc ngắn tỉa mảng khối layer sắc nét Style B**, không đeo kính, dáng đứng thể thao tự tin. | **Đồ thể thao đá bóng**: Áo jersey xanh navy số 7 (`#1d4e89`) cổ viền trắng, quần đùi thể thao sọc hông (`#142842`), vớ cao cổ sọc trắng, giày turf ôm chân. |

---

## Các biểu cảm chi tiết (Moods)

1. **Nam:**
   - `sleepy`: Mí mắt sụp uể oải, miệng trễ hé mở ngái ngủ.
   - `shocked`: Mắt mở trừng to, con ngươi thu nhỏ, miệng há hốc thấy hàm răng trên, co rúm thủ thế.
   - `suspicious`: Mày nhíu bất đối xứng, mắt liếc ngang, môi bặm dò xét qua khe cửa.
   - `hesitant`: Đắn đo, tự đấu tranh tư tưởng khi nghe bản sao gợi ý làm bài hộ.

2. **Người Kia (Bản sao):**
   - `calm`: Mắt mở đều, ánh nhìn kiên định, thản nhiên lạ thường.
   - `neutral_smile`: Nụ cười nhẹ lịch sự, giảm cảm giác đe dọa.
   - `eerie_smirk`: Nụ cười nhếch nhẹ sắc lạnh, toan tính khi Nam bắt đầu cắn câu giao việc.

3. **Tùng:**
   - `annoyed`: Mày cau bực bội khi bị Nam gọi nhảm giữa giờ học giảng đường ("Mày xàm hả?").
   - `focused`: Nghiêm túc, tập trung vào bài giảng.
   - `normal`: Vẻ mặt sinh viên bình thường.

---

**Khi đưa vào đoạn đầu:** Người Kia ưu tiên `calm`/`neutral_smile` theo hướng thân thiện, chủ động mời giúp; `eerie_smirk` là mẫu biểu cảm có sẵn, không tự áp để tiết lộ bản chất săn mồi sớm. Tùng hiện chưa chứng kiến hai người giống hệt nhau. Nam có thêm nhịp bí bài, mải game, ngủ quên và tự mãn ở bản thảo mới; các pose đó mới là nhu cầu diễn xuất, chưa được coi là asset đã hoàn thiện.

## File thiết kế tham chiếu ban đầu
- [`assets/thiet-ke/character-svg-v1.png`](assets/thiet-ke/character-svg-v1.png): Bảng đối chiếu ban đầu giữa Rig cũ và Mẫu thử B.
- [`assets/thiet-ke/character-svg-v1.tsx`](assets/thiet-ke/character-svg-v1.tsx): File thử nghiệm ban đầu của mẫu B.

---

## Hệ thống bối cảnh môi trường theo kịch bản (Style B) — 09/11/2026

Bám sát 100% dòng thời gian và các mốc diễn biến từ 7:00 AM tới đêm muộn trong kịch bản:

- **Hình ảnh tổng quan:** ![Bảng bối cảnh môi trường 4 ô](assets/boi-canh/boi-canh.png)
- **Tài liệu chi tiết bối cảnh:** [`assets/boi-canh/BOI-CANH.md`](assets/boi-canh/BOI-CANH.md)
- **Trình xem tương tác độc lập (Zoom/Pan):** [`assets/boi-canh/xem-truc-tiep-boi-canh.html`](assets/boi-canh/xem-truc-tiep-boi-canh.html)
- **Master Board SVG 4K:** [`assets/boi-canh/boi-canh.svg`](assets/boi-canh/boi-canh.svg)
- **Mã nguồn React / Remotion:** [`assets/boi-canh/boi-canh.tsx`](assets/boi-canh/boi-canh.tsx)

| STT | Bối cảnh | File SVG | Tiêu cự | Ánh sáng & Đạo cụ chính |
|---|---|---|---|---|
| **1** | **Phòng trọ sáng sớm** | [`phong-tro-sang-som.svg`](assets/boi-canh/phong-tro-sang-som.svg) | 35mm | 7:00 AM; thiết lập chuẩn 100% theo bản vẽ tác giả (`image.png`): Cửa chính tường trái mở ra hành lang dài $\to$ Bếp & bồn rửa inox góc trái $\to$ Tủ quần áo đứng giữa phòng $\to$ **Bàn học của Nam & Chiếc ghế to đầm chắc có áo thun vắt lưng ghế** $\to$ Cửa sổ tường phải đón nắng sớm $\to$ Nệm Nam góc phải với chăn rêu xộc xệch, điện thoại 7h, dép lê. |
| **2** | **Góc bếp & Bồn rửa chén** | [`goc-bep-bon-rua.svg`](assets/boi-canh/goc-bep-bon-rua.svg) | 50mm | Cận cảnh bếp góc trái: Tủ bếp dưới màu xanh xám nhạt (`#9cae9b`), bồn rửa inox 2 ngăn, vòi nước nhỏ giọt, khay chén đĩa sạch bóng, bát đũa gác chéo, kệ gia vị, quạt đứng sinh viên, cây chổi rơm, thấy mép cánh cửa mở ra hành lang dài. |
| **3** | **Cửa gài chốt & Hành lang** | [`hanh-lang-cua-phong.svg`](assets/boi-canh/hanh-lang-cua-phong.svg) | 35mm | Cửa chính xanh xám (`#769384`) đóng kín, **then cài chốt trượt kim loại**, ghế gỗ chặn cửa; bên phải là **chiếc bàn học của Nam** có sách giáo trình, đèn đỏ, thẻ CCCD và **chiếc ghế xoay to đầm chắc, vững chãi**. |
| **4** | **Bàn học ban đêm** | [`ban-hoc-laptop-dem.svg`](assets/boi-canh/ban-hoc-laptop-dem.svg) | 50mm | 23:45 Đêm muộn; quầng sáng đèn bàn vàng rực, laptop Google Docs mở bài làm hộ, điện thoại tin nhắn gấp, **chiếc ghế xoay học sinh công thái học to đầm, cân đối hoàn hảo thẳng hàng laptop**; hậu cảnh đêm thấy tủ quần áo bên trái, đồng hồ 23:45 và cửa sổ đêm bên phải. |



**Khi đưa nền vào cảnh:** bảng thiết kế thể hiện hình tĩnh; trạng thái cửa/chốt và vị trí hai ghế theo [bảng máy 10/11](DUNG-CANH.md). Có hình chốt gài hoặc ghế trước cửa không có nghĩa mọi thời điểm truyện đều khóa/chặn. Không tự đổi các SVG trong lượt thêm máy.

## Nhu cầu theo góc máy — 10/11/2026

Đã đối chiếu bảng PNG bốn nền mới; dùng [DUNG-CANH.md](DUNG-CANH.md) để chọn cỡ/góc theo diễn biến. Giữ hai chỗ ngủ song song, bồn rửa sát góc, bàn Nam/đèn đỏ đồng bộ ban ngày–đêm. Chuẩn bị bổ sung góc toàn **ngoài** hành lang và pose/cận còn thiếu khi được giao dựng; việc có nền tĩnh chưa chứng minh chuyển động hoặc mọi hướng nhìn đã có.

**Trạng thái dùng trong phim:** ghế gỗ là đồ cạnh nệm/ngoài lối, không tự biến thành vật chắn; ghế xoay theo Nam từ bàn ra cửa rồi trở lại bàn. Cần thấy chốt gài khi Nam khóa và chốt rút sau lúc quên gài khi về; nền tối không được giữ trạng thái khóa như một quy luật bất biến. Đây là yêu cầu continuity cho timeline, không thay hoặc vẽ lại các SVG trong lượt thêm góc máy.

Kiểm tra pose ngủ/bật dậy, nhìn ba phần tư, cầm điện thoại/căn cước, gõ bài/game, tay chạm chốt, đặt chén và người kia ngồi bàn. Những pose/góc chưa có mới là yêu cầu bổ sung, chưa tạo hay chạy thử. Giữ nội tâm là suy nghĩ của Nam; Người Kia không đọc được suy nghĩ hoặc màn hình từ ngoài cửa.

## Tách lớp để quay — 10/11/2026

Đối chiếu [quay layer](DUNG-CANH.md#quay-layer) trước khi dựng: nhóm nền xa qua cửa sổ/hành lang, khối phòng, đồ cố định, người/vật, lớp che gần, ánh sáng và chữ bám mặt thiết bị. SVG hiện có nhóm/clip hữu ích nhưng chưa đồng nghĩa đã có mask người đi qua, tay giữ đồ hoặc camera parallax. Ưu tiên tách phần bồn che thân/tay cầm bát, cửa/bản lề/chốt, bàn/thân ngồi/tay/phím/điện thoại; giữ mẫu Style B và bố cục đang dùng. Các việc tách và kiểm tra chuyển động còn chờ bước dựng, chưa thực hiện ở lượt tài liệu này.
