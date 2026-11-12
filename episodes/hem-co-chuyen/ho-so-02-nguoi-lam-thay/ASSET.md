# Asset — Hồ sơ 02: Người trong gương

## Chuyển hướng sản xuất sang Full 3D — cập nhật 12/11/2026

Theo quyết định mới của chủ repo, toàn bộ Hồ sơ 02 chuyển từ dựng hình 2D/SVG sang **Nhân vật 3D & Bối cảnh 3D (Stylized 3D Cinema)** theo [Quy chuẩn 3D](../../../docs/QUY-CHUAN-3D.md):
- **Tài sản 2D hiện có (`63 SVG rời`, `bo-sung-15p/`, `nhan-vat.tsx`):** Giữ nguyên toàn bộ làm **Concept Art, Model Sheet 2D, Bảng màu và Layout tham chiếu** để dựng mô hình 3D chuẩn tạo hình Style B (khối tròn mềm, nốt ruồi đúng bên, thuận tay trái).
- **Bối cảnh 3D (`kit3d.tsx` & 3D Sets mới):** Sáu bối cảnh bổ sung đã bước đầu được dựng hình học không gian 3D trong [`kit3d.tsx`](assets/bo-sung-15p/kit3d.tsx); bước tiếp theo là hoàn thiện **Full 3D Environments & 3D Characters** (Blender/Three.js) có vật liệu Stylized PBR/Toon, đèn Chiaroscuro vật lý, Blendshapes khuôn mặt 3D và Shader gương phản chiếu thực.
- **Theo dõi tiến độ dựng 3D:** Xem Mục 8 trong **[CHECKLIST-TIEN-KY-ASSET.md](CHECKLIST-TIEN-KY-ASSET.md#8-tiến-độ-chuyển-thể-lên-full-3d-cập-nhật-12112026)**.

## Nhu cầu theo kịch bản mới — đồng bộ 11/11/2026 (Bộ Concept 2D đã hoàn thành)

Nguồn: [KICH-BAN.md](KICH-BAN.md), mục tiêu khoảng 15 phút. Bảng kê tổng duyệt chi tiết trước khi dựng xem tại **[CHECKLIST-TIEN-KY-ASSET.md](CHECKLIST-TIEN-KY-ASSET.md)** (phân loại bối cảnh, đạo cụ hero props, dáng rig, ma trận biểu cảm 3 cấp độ). Đã tạo [bộ bổ sung](assets/bo-sung-15p/README.md): **63 SVG rời, 12 bảng duyệt, 22 PNG**, kèm nguồn TSX, manifest và [trình xem](assets/bo-sung-15p/xem-asset.html). Đây là hình tĩnh để duyệt, chưa xác nhận motion, khẩu hình, âm thanh hoặc timeline đã đủ.

| Nhóm bổ sung | Nội dung và bảng xem |
|---|---|
| 13 đạo cụ | Búa, phong bì, hai thẻ hư cấu, cơm sườn, bún chả/nem, xôi gấc, túi quả, PC, thau đồ, bóng, kéo, góc đồ cho/tặng — [bảng](assets/bo-sung-15p/bang-dao-cu.png) |
| 10 bối cảnh | Giảng đường, Lab 402, hành lang trường, mâm cơm gia đình, thế giới gương, sân bóng, góc cắt tóc, góc đồ cho tặng, hành lang trọ đêm, phòng trọ chiều tà ([bảng](assets/bo-sung-15p/bang-boi-canh.png)). **Bổ sung 11/11/2026, chờ duyệt:** dựng mới hoặc bổ sung các bối cảnh còn thiếu so với [checklist](CHECKLIST-TIEN-KY-ASSET.md#bối-cảnh): S03 `RoomSunset`/`SunsetLight` ([bảng chiều tà](assets/bo-sung-15p/bang-nang-chieu-ta.png)), S06 `DormHallNight`, S07 `DonationCorner`, S08 giảng đường bậc thang có micro, S09 màn hình hạn nộp, S11 chiếu hoa và mâm nhôm, S12 phòng lật ngang trên mặt nước. Chưa tách lớp FORE/MID/BACK hay khung 2.39:1. **Đại tu 11/11/2026, chủ repo đã duyệt bối cảnh nhiều góc:** sáu bối cảnh dựng lại bằng mô hình 3D theo cm ([`kit3d.tsx`](assets/bo-sung-15p/kit3d.tsx)): camera phối cảnh thật, mặt khối sáng–tối theo hướng nắng, bóng đổ và vệt nắng qua cửa sổ, đèn trần, mờ theo khoảng cách; kích thước đồ đạc theo đồ thật. Đạo cụ và vai phụ giữ nguyên, chỉ đặt lại theo phối cảnh (`lectureSpot`, `corridorSpot`…). Thế giới gương vẫn dùng phòng trọ gốc. Ghế cắt tóc xoay được: `<BarberCorner turn={độ} />` xoay đệm, lưng, tay vịn, gác chân quanh trụ (0 là khách nhìn vào gương). **Nhiều góc:** mỗi cảnh nhận `view` = `chinh` · `nguoc` · `cheo` · `cao` ([bảng](assets/bo-sung-15p/bang-boi-canh-nhieu-goc.png)); đã dựng thêm tường còn thiếu (cửa cuối lớp, tủ Lab, cửa cầu thang, cửa gỗ nhà, mặt tiền tiệm, nhà quanh sân bóng). Các hàm vị trí nhận cùng `view`. Người phẳng chỉ vẽ một mặt (lưng sinh viên, giảng viên, gia đình) tự ẩn ở góc nhìn thấy mặt sau của họ; muốn có họ ở góc đó phải vẽ thêm hướng nhìn. |
| 6 vai phụ, 10 dáng | Giảng viên, mẹ, ba, bác Hai, hai sinh viên; thị uy, thuyết trình, game, cầm túi, giữ búa, suy sụp, áp kính, nhận đồ tay trái — [bảng](assets/bo-sung-15p/bang-vai-phu-tu-the.png) |
| 6 UI, 1 đối chiếu | Hạn bài, điểm 9.5, mẹ gọi, clip gia đình, báo thức, tiền về; nốt ruồi — [bảng](assets/bo-sung-15p/bang-giao-dien.png) |
| 4 trạng thái gương | Khung cố định, phản chiếu riêng, kính gợn và lớp cảnh cuối — [bảng](assets/bo-sung-15p/bang-guong.png); [soi điểm cầm/chạm](assets/bo-sung-15p/bang-tiep-xuc.png) |

**Cảm xúc 2.5D dựng mới 11/11 (thay bộ dưới cho nhân vật 2.5D):** [mặt tham số](assets/cam-xuc-2-5d.tsx), 24 nhóm × 3 mức, chuyển cảm xúc theo bộ phận, chớp/liếc/run môi; bảng `assets/bo-sung-15p/bang-cam-xuc-01…04`. Kiểu cartoon gọn, mắt tròn, không mi.

**Cảm xúc ba mức 11/11:** *(bản cũ, chỉ còn cho rig 2D; các bảng cũ đã được thay)* bổ sung [18 nét tách lớp dùng chung](../../../what-if-studio/library/expressions/cartoon-soft/bo-sung-cot-truyen/README.md), ghép kiểm tra trên Nam/Người Kia ở [bảng 1](assets/bo-sung-15p/bang-cam-xuc-01.png) và [bảng 2](assets/bo-sung-15p/bang-cam-xuc-02.png). Không thêm tóc/sọ vào overlay. Xem [cách thiết kế, API và cách xuất lại](assets/bo-sung-15p/CACH-THIET-KE-VA-SU-DUNG.md). Hai bảng cảm xúc nằm trong chín bảng duyệt; 18 SVG nét mặt nằm ở thư viện chung, không tính lặp vào 47 SVG đặc thù hồ sơ.

**Bóng và nét 11/11:** rig/phòng chính đã chuyển sang mảng bóng tự vẽ tiết chế; bảng nhân vật và tám góc phòng đã xuất lại. Đọc [quy chuẩn](assets/thiet-ke/QUY-CHUAN-THIET-KE-SVG.md#40-bóng-vẽ-tay-không-viền-11112026). Không dùng ảnh thử bóng cũ làm chuẩn. Vai phụ hiện có góc ba phần tư phía trước; khi cần góc sau/nghiêng phải bổ sung. Bối cảnh mới là plate 2D tách nhóm, không tự biến thành camera 3D tùy ý. Giữ bí mật gương ở đầu truyện; không đảo chữ trên đồ thật hoặc dùng pose giằng co V1.

**Đại tu không gian 10/11/2026 — chờ duyệt:** [bảng nền mới](assets/boi-canh/boi-canh.png), [ghép Nam kiểm tra tỉ lệ](assets/boi-canh/kiem-tra-ti-le.png), [nguồn và hướng dẫn](assets/boi-canh/BOI-CANH.md). Nệm đôi tách bàn/ghế; không còn áo ghế, căn cước trên bàn, giờ đêm/tin cũ/tên tập gắn vào nền. Căn phòng là một mô hình 3D trong nguồn TSX, mỗi góc máy là một camera thật, có thêm góc cửa/chốt và hành lang; đã xuất SVG/PNG/HTML, chưa dựng phim.

**Sửa tạo hình rig V3 — 10/11/2026:** thân/tay áo hợp thành một viền, giảm nét chồng, tay nghỉ buông gần thẳng; hướng bàn tay bám cẳng tay, sửa bên ngón cái và dáng cầm điện thoại. Xem [soi chỗ nối/bàn tay](assets/rig/chi-tiet-khop.png), [đối chiếu mẫu](assets/rig/doi-chieu-mau-goc.png), [bảng 12 dáng](assets/rig/tu-the-khop.png). Đã cân thêm độ rộng hai chân: [xem bảng chân](assets/rig/can-doi-chan.png). Đã làm đầy cẳng tay/cổ tay và tách dáng ngón khi gõ/giữ bát: [soi bàn tay](assets/rig/ban-tay-ro-net.png). Nguồn/SVG/PNG/HTML đã cập nhật; chờ duyệt, chưa đưa vào phim.

**Rig cũ, chỉ để đối chiếu (rig chính nằm trong `assets/nhan-vat.tsx`) — 10/11/2026:** đã có [bảng 12 tư thế](assets/rig/tu-the-khop.png), [nguồn rig](assets/rig/rig.tsx) và [trình xem khớp](assets/rig/xem-tu-the.html) cho Nam, Người Kia, Tùng, dùng lại đầu/màu của bộ hiện có. Đọc [hướng dẫn và giới hạn](assets/rig/RIG-NHAN-VAT.md) trước khi dựng: bản để duyệt, chưa là chuyển động/tương tác đã duyệt trong phim.

**Quy chuẩn mỹ thuật 10/11/2026:** áp dụng [quy chuẩn chung](../../../docs/PHONG-CACH-MY-THUAT.md) cho nhân vật **và toàn bộ bối cảnh/đạo cụ**: nét cong mềm, khối tròn đầy, phối cảnh và điểm tiếp xúc rõ. Bộ phòng trọ đã có bản đại tu SVG/TSX/PNG theo thông báo đầu file; chờ duyệt mỹ thuật, chưa coi tương tác/chuyển động là hoàn thiện.

**Chốt gương 10/11/2026:** Nam giữ nốt ruồi bên trái theo mẫu; Người Kia bên phải ở cùng góc nhìn. Dùng `NguoiKia` hoặc `identity="nguoi-kia"`, không dùng đầu Nam mặc định cho bản sao. Kích thước nốt giữ nhỏ, không phóng to. Xem [bảng đối chiếu](assets/thiet-ke/doi-chieu-not-ruoi.png) và [quy chuẩn](assets/thiet-ke/QUY-CHUAN-THIET-KE-SVG.md).

## Dàn nhân vật theo mẫu SVG mới (Style B) — 09/11/2026

Ba nhân vật chính của **Hồ sơ 2: Người trong gương** đã được thiết kế đồng bộ theo phong cách SVG hữu cơ mới (Style B: nét vẽ mềm, mảng tóc gọn, vai áo rủ tự nhiên, quần có khối, biểu cảm linh hoạt).

**Trạng thái sử dụng:** bộ mới đã được cập nhật từ GitHub tại `593c626`; đây là nguồn thiết kế hiện hành để tham khảo. Style B được chọn từ mẫu thứ 2; chưa coi các pose/biểu cảm mới là đã được duyệt trong từng cảnh hoặc rig đã kiểm tra chuyển động. Nam là sinh viên năm hai theo kịch bản mới.

### Bảng nhân vật hiện có
- **Hình ảnh xem trước:** ![Dàn nhân vật chuẩn Style B](assets/nhan-vat.png)
- **Trình xem trực tiếp tương tác (Zoom/Pan):** [`assets/xem-truc-tiep.html`](assets/xem-truc-tiep.html)
- **Tài liệu quy chuẩn thiết kế SVG (Style B):** [`assets/thiet-ke/QUY-CHUAN-THIET-KE-SVG.md`](assets/thiet-ke/QUY-CHUAN-THIET-KE-SVG.md)
- **File vector SVG master:** [`assets/nhan-vat.svg`](assets/nhan-vat.svg) (bảng 1920×1080 gồm dáng toàn thân và các cận cảnh biểu cảm).
- **Mã nguồn React / Remotion:** [`assets/nhan-vat.tsx`](assets/nhan-vat.tsx) (chứa `Nam`, `NguoiKia`, `Tung`, các component đầu và biểu cảm tương ứng).

| Nhân vật | Vai trò trong kịch bản | Đặc điểm nhận diện & Tạo hình | Trang phục & Đạo cụ |
|---|---|---|---|
| **1. Nam** | Sinh viên nhân vật chính, lười nhác, ngủ nướng, trễ deadline bài nhóm, sợ hãi khi gặp bản sao | **Nốt ruồi sát đuôi mày trái theo mẫu nhìn từ máy** (chi tiết then chốt từ kịch bản), tóc mảng gọn có lọn xoăn trên đỉnh theo Mẫu B, vai mềm buông lơi, hai tay đầy đặn rõ ràng buông tự nhiên ngoài thân áo. | A–H: áo ngủ xám (`#8a8783`); áo thường xanh rêu (`#5c7a70`), quần dài xám có khối (`#515451`), dép lê quai ngang (`#425850`). |
| **2. Người Kia (Bản sao)** | Sinh vật từ gương, thay thế Nam; nguồn gốc chỉ lộ cuối truyện | Khuôn mặt, **nốt ruồi đuôi mày đối bên với Nam**, gương mặt/kiểu tóc/vóc dáng tương đồng, dáng tay đầy đặn rõ ràng như Nam, ánh mắt điềm tĩnh / bí hiểm. | Mặc chiếc **áo thun xanh rêu (`#5c7a70`) của Nam** (chiếc áo Nam bỏ trên ghế tối qua), quần dài xám (`#515451`), dép lê quai ngang (`#425850`). |
| **3. Tùng** | Bạn cùng phòng chăm chỉ, dậy sớm đi học lúc 7h, nghe máy gạt đi vì tưởng Nam ngủ mơ ("Mày xàm hả?") | Sinh viên năng động, gương mặt sáng sủa, cằm gọn, **tóc ngắn tỉa mảng khối layer sắc nét Style B**, không đeo kính, dáng đứng thể thao tự tin. | **Đồ thể thao đá bóng**: Áo jersey xanh navy số 7 (`#1d4e89`) cổ viền trắng, quần đùi thể thao sọc hông (`#142842`), vớ cao cổ sọc trắng, giày turf ôm chân. |

---

## Các biểu cảm chi tiết (Moods)

1. **Nam:**
   - `sleepy`: Mí mắt sụp uể oải, miệng trễ hé mở ngái ngủ.
   - `shocked`: Mắt mở trừng to, con ngươi thu nhỏ, miệng há hốc thấy hàm răng trên, co rúm thủ thế.
   - `suspicious`: Mày nhíu bất đối xứng, mắt liếc ngang, môi bặm dò xét qua khe cửa.
   - `hesitant`: Đắn đo, tự đấu tranh tư tưởng khi nghe bản sao gợi ý làm bài hộ.
   - `annoyed`: Mày hạ ở đầu trong, mí sụp nhẹ, miệng trễ xuống khi bực.
   - `scared`: Mắt mở to, đầu trong lông mày nhướn, miệng mím hé răng.
   - `agitated`: Mày dựng, miệng mở lớn khi gắt.

2. **Người Kia (Bản sao):**
   - `calm`: Mắt mở đều, ánh nhìn kiên định, thản nhiên lạ thường.
   - `neutral_smile`: Nụ cười nhẹ lịch sự, giảm cảm giác đe dọa.
   - `eerie_smirk`: Nụ cười nhếch nhẹ sắc lạnh, toan tính khi Nam bắt đầu cắn câu giao việc.

3. **Tùng:**
   - `annoyed`: Mày cau bực bội khi bị Nam gọi nhảm giữa giờ học giảng đường ("Mày xàm hả?").
   - `focused`: Nghiêm túc, tập trung vào bài giảng.
   - `normal`: Vẻ mặt sinh viên bình thường.

---

**Khi đưa vào đoạn đầu:** Người Kia ưu tiên `calm`/`neutral_smile` theo hướng thân thiện, chủ động mời giúp; `eerie_smirk` là mẫu biểu cảm có sẵn, không tự áp để tiết lộ bản chất săn mồi sớm. Tùng hiện chưa chứng kiến hai người giống hệt nhau. Nam có thêm nhịp bí bài, mải game, ngủ quên và tự mãn ở bản thảo mới; các dáng tĩnh bổ sung có trong bộ 11/11; chuyển tư thế và diễn xuất vẫn cần kiểm tra khi dựng.

## File thiết kế tham chiếu ban đầu
- [`assets/thiet-ke/character-svg-v1.png`](assets/thiet-ke/character-svg-v1.png): Bảng đối chiếu ban đầu giữa Rig cũ và Mẫu thử B.
- [`assets/thiet-ke/character-svg-v1.tsx`](assets/thiet-ke/character-svg-v1.tsx): File thử nghiệm ban đầu của mẫu B.
- [`assets/thiet-ke/thu-2-5d/`](assets/thiet-ke/thu-2-5d/README.md): **Đã chọn 11/11: dùng 2.5D cho Nam.** `Nam25D` (6 kiểu sáng theo cảnh, tách lớp, dáng theo ảnh tham chiếu, bóng mềm), `NamVatLy` (quán tính, nhún, tóc, vạt áo). Mặc định `dang="moi"`; `dang="chot"`/`volume={false}` trở về bản đã chốt. Đã áp cho Người Kia (`NguoiKia25D`) và Tùng (`Tung25D`) trong [`nhan-vat-khac-2-5d.tsx`](assets/thiet-ke/thu-2-5d/nhan-vat-khac-2-5d.tsx); bảng: [dàn nhân vật](assets/thiet-ke/thu-2-5d/dan-nhan-vat.png), [ba người trong phòng](assets/thiet-ke/thu-2-5d/dan-nhan-vat-trong-phong.png). Ánh sáng đêm của phòng là laptop **xanh** (`LAPTOP_LIGHT`). Chưa render lại opening, vai phụ chưa áp.
- [`assets/tuong-tac.tsx`](assets/tuong-tac.tsx): **Tương tác nhân vật – bối cảnh (11/11, thử):** đồ vật bị xô trượt–xoay rồi dừng do ma sát (`pushedObject` → `RoomScene chairPush`), bụi ở bước chân và chân ghế cào sàn (`Dust`), gió quạt thổi tóc/vạt áo theo đúng hướng quạt trong phòng (`fanWind`, `windSway`), rung máy khi va (`cameraShake` → `RoomScene move`). Tất định theo số khung. Cảnh thử: composition `HoSo02TuongTac` (`what-if-studio/src/episodes/ho-so-02-nguoi-lam-thay/tuong-tac-thu.tsx`, 8 s, Nam đi trước quạt rồi vấp ghế). Test: `what-if-studio/tests/ho-so-02-tuong-tac.cjs`. Phòng chỉ thêm prop `chairPush` (mặc định bỏ trống) và tách `fanYaw`/`FAN_HEAD` dùng chung; ảnh phòng trùng từng điểm ảnh. Mới có ghế là đồ vật xô được.

---

## Hệ thống bối cảnh môi trường theo kịch bản (Style B) — 09/11/2026

Bản nền ngày–tối dùng chung mặt bằng; giờ và nội dung màn hình là trạng thái theo shot, không phải thông tin đóng cứng vào ảnh:

- **Hình ảnh tổng quan:** ![Bảng các góc máy phòng trọ](assets/boi-canh/boi-canh.png)
- **Tài liệu chi tiết bối cảnh:** [`assets/boi-canh/BOI-CANH.md`](assets/boi-canh/BOI-CANH.md)
- **Trình xem tương tác độc lập (Zoom/Pan):** [`assets/boi-canh/xem-truc-tiep-boi-canh.html`](assets/boi-canh/xem-truc-tiep-boi-canh.html)
- **Master Board SVG 4K:** [`assets/boi-canh/boi-canh.svg`](assets/boi-canh/boi-canh.svg)
- **Mã nguồn React / Remotion:** [`assets/boi-canh/boi-canh.tsx`](assets/boi-canh/boi-canh.tsx)

| STT | Bối cảnh | File SVG | Phạm vi và trạng thái |
|---|---|---|---|
| 1 | Phòng trọ sáng sớm | [Toàn phòng](assets/boi-canh/phong-tro-sang-som.svg) | Cửa trái, bếp sau–trái, tủ giữa, bàn sau–phải; nệm đôi tiền cảnh phải có khoảng sàn tách bàn/ghế. Điện thoại trên nệm tắt màn hình; báo thức là lớp theo shot |
| 2 | Bếp và bồn rửa | [Góc bếp](assets/boi-canh/goc-bep-bon-rua.svg) | Cùng bếp hai ngăn, vòi không chảy cố định; camera riêng trên cùng mô hình; `kitchen` chuyển messy/clean theo nhịp |
| 3 | Bàn học ngày | [Góc bàn sáng](assets/boi-canh/goc-ban-hoc-sang.svg) | Tủ cạnh bàn, ghế bốn chân không áo; căn cước còn trong ngăn tủ trước D02. Không gắn giờ hoặc tin nhắn cố định |
| 4 | Bàn học tối | [Góc bàn đêm](assets/boi-canh/ban-hoc-laptop-dem.svg) | Cùng mẫu bàn/ghế và cùng khung ngày; đèn ấm/laptop sáng, điện thoại tắt. Nội dung bài, tin và mốc giờ phải theo cue |
| 5 | Toàn phòng tối | [Toàn phòng tối](assets/boi-canh/phong-tro-toi.svg) | Cùng camera với toàn phòng sáng; đèn bàn và laptop là nguồn sáng |
| 6 | Cửa và chốt | [Góc cửa](assets/boi-canh/goc-cua-va-chot.svg) | Bốn trạng thái cửa: khép hờ, mở, khép chưa gài, gài chốt |
| 7 | Hành lang | [Hành lang](assets/boi-canh/hanh-lang-cua-phong.svg) | Góc B: cầu thang bên trái, cửa giữa, phía đối diện bên phải |
| 8 | Góc nệm | [Góc nệm](assets/boi-canh/goc-nem.svg) | Chỗ Nam, chỗ Tùng và ghế cạnh nệm cho cú va A05 |




**Khi đưa nền vào cảnh:** bảng thiết kế thể hiện hình tĩnh; trạng thái cửa/chốt và vị trí chiếc ghế làm việc theo [bảng máy 10/11](DUNG-CANH.md). Có hình chốt gài hoặc ghế trước cửa không có nghĩa mọi thời điểm truyện đều khóa/chặn. Khi sửa nền, sửa nguồn TSX rồi xuất lại bộ ảnh.

## Nhu cầu theo góc máy — 10/11/2026

Đã đối chiếu bảng các góc máy; dùng [DUNG-CANH.md](DUNG-CANH.md) để chọn cỡ/góc theo diễn biến. Giữ hai chỗ ngủ trên cùng nệm đôi, bồn rửa sát góc, bàn Nam/đèn đỏ đồng bộ ban ngày–đêm. Chuẩn bị bổ sung pose/cận còn thiếu khi được giao dựng; việc có nền tĩnh chưa chứng minh chuyển động hoặc mọi hướng nhìn đã có.

**Trạng thái dùng trong phim:** một mẫu ghế bốn chân theo chuỗi cạnh nệm → đối diện cửa → bàn; không đổi thành ghế xoay hoặc tự thêm ghế chắn cửa. Cần thấy chốt gài khi Nam khóa và chốt rút sau lúc quên gài khi về; nền tối không được giữ trạng thái khóa như một quy luật bất biến. Đối chiếu các trạng thái của nguồn bối cảnh; đường di chuyển và cú va A05 vẫn cần kiểm tra animatic.

Kiểm tra pose ngủ/bật dậy, nhìn ba phần tư, cầm điện thoại/căn cước, gõ bài/game, tay chạm chốt, đặt chén và người kia ngồi bàn. Những pose/góc chưa có mới là yêu cầu bổ sung, chưa tạo hay chạy thử. Giữ nội tâm là suy nghĩ của Nam; Người Kia không đọc được suy nghĩ hoặc màn hình từ ngoài cửa.

## Tách lớp để quay — 10/11/2026

Đối chiếu [quay layer](DUNG-CANH.md#quay-layer) trước khi dựng: nhóm nền xa qua cửa sổ/hành lang, khối phòng, đồ cố định, người/vật, lớp che gần, ánh sáng và chữ bám mặt thiết bị. SVG hiện có nhóm/clip hữu ích nhưng chưa đồng nghĩa đã có mask người đi qua, tay giữ đồ hoặc camera parallax. Ưu tiên tách phần bồn che thân/tay cầm bát, cửa/bản lề/chốt, bàn/thân ngồi/tay/phím/điện thoại; giữ mẫu Style B và bố cục đang dùng. Các việc tách và kiểm tra chuyển động còn chờ bước dựng, chưa thực hiện ở lượt tài liệu này.

## Rig khớp — 10/11/2026

`assets/nhan-vat.tsx` đã chuyển thân Nam, Người Kia và Tùng sang khung xương có khớp vai–khuỷu–cổ tay, hông–gối–cổ chân, cổ và từng đốt ngón. Góc bị chặn theo `LIMIT` (khuỷu/gối không gập ngược); bàn chân tự chạm sàn khi `planted`. Tay/chân đặt tên theo giải phẫu: R ở phía trái màn hình, L ở phía phải.

Dùng `pose` trên `StudentTwinBody`/`TungSoccer`, trộn từ `STAND_POSE` hoặc `TWIN_POSES`. Xem trong studio bằng composition `HoSo02RigSheet` (đứng ↔ 7 tư thế), `HoSo02CastBoard` (bảng dàn nhân vật); kiểm tra hình học: `node tests/ho-so-02-rig.cjs` trong `what-if-studio/`.

Cả ba nhân vật có đủ chính diện, 3/4, nghiêng, 1/4 (chéo từ sau), sau lưng và quay trái qua `view`/`facing` trong `pose` (xem composition `HoSo02Turnaround`, `HoSo02Spin`). Có `talk` cho khẩu hình, `blink` cho chớp mắt, `turnAt` để xoay dần, 11 dáng trong `TWIN_POSES`, `sampleWalk` cho vòng bước và `prop` cho điện thoại, bát đi theo bàn tay. Nam mặc áo ngủ xám bằng `shirt={PALETTE.nam.sleepShirt}` khi Người Kia đang mặc áo xanh.

**Cập nhật hành động và hiệu ứng 10/11/2026:** đã rà phần A–H trong THAO-LUAN-CANH và bổ sung bảng chuyển động ở [DUNG-CANH.md](DUNG-CANH.md); xem [SFX-VFX.md](SFX-VFX.md) để chọn âm/hình có sẵn và nguồn CC0 ứng viên. Ghi chú này lưu trạng thái 10/11. Hiện đã có kịch bản đủ ba phần và bộ asset 11/11 ở đầu file; chưa xác nhận audio hoặc timeline toàn phim.

## Asset dựng sẵn từ kế hoạch trailer cũ — 10/11/2026, có thể tái dùng

Kế hoạch trailer/opening cũ đã hủy theo yêu cầu chủ repo. Opening và trailer mới dựng theo đúng [bảng phân cảnh](KICH-BAN-TRAILER-VA-OPENING.md) (cảnh 1 demo chỉ là bản thử), và **chỉ bắt đầu khi chủ repo cho phép**. Các asset dưới đây vẫn còn trong repo, dùng lại được nếu hợp.

| Asset | Nguồn | Ghi chú |
|---|---|---|
| Ba nền phòng/hành lang thêm | [BOI-CANH.md](assets/boi-canh/BOI-CANH.md#góc-máy): view `mirror` (gương cạnh tủ, prop `mirror`), `giveaway` (góc đồ cho tặng), `stairs`, `pov` (mắt Nam trên gối) | Gương mặc định tắt để các nền cũ không đổi |
| Trường học và sân thể thao | [`truong-va-san.tsx`](assets/boi-canh/truong-va-san.tsx): sân trường ngày/đêm, hành lang lớp, giảng đường, sân bóng ngày/chiều/đêm | Chờ duyệt |
| Trang phục Nam | `NAM_OUTFITS` trong [rig](assets/nhan-vat.tsx): `xanh`, `ngu`, `xam-tui`, `dong-phuc`, `the-thao`; [bảng xem](assets/trailer/trang-phuc-nam.png) | Đồ thể thao chưa có giày riêng |
| Biểu cảm `stare_grin` | Rig, cho bản sao lúc hù | |
| Clip Nam giữa khung | [TRAILER-NAM-GIUA-KHUNG.md](TRAILER-NAM-GIUA-KHUNG.md), composition `HoSo02NamGiuaKhung` | Chủ repo đã duyệt bản đứng yên, lười biếng, 0,3 giây mỗi nền |
