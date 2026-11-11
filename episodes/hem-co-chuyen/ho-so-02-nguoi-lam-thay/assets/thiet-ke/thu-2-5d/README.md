# Thử chuyển Nam 2D → 2.5D (11/11/2026)

**Trạng thái: chủ repo đã chọn dùng 2.5D (11/11/2026).** Dùng `Nam25D`/`NamVatLy` cho shot Nam dựng mới; bộ Nam đã chốt trong `nhan-vat.tsx` giữ nguyên (không đổi hình mặc định). Mới duyệt bằng ảnh tĩnh và dải khung; chưa xem chuyển động liền, chưa render lại opening, chưa áp cho Người Kia và Tùng.

| Bảng | Nội dung |
|---|---|
| [anh-sang.png](anh-sang.png) | 6 kiểu sáng cảnh: ban ngày, trời âm u, đèn vàng, ánh màn hình, đêm xanh, ngược sáng |
| [cac-goc.png](cac-goc.png) | 2D đã chốt ↔ 2.5D ở chính diện, 3/4, nghiêng, 1/4 sau, sau lưng |
| [tu-the.png](tu-the.png) | Đi, ngồi ghế đẩu, cầm điện thoại, đứng trước gương (sau lưng) |
| [nam-2-5d.png](nam-2-5d.png) | So sánh 2D ↔ 2.5D toàn thân và ba nét mặt |
| [trong-phong.png](trong-phong.png) | Nam trong phòng 3D đang dùng, 2D ↔ 2.5D: ban ngày (cửa sổ), đêm (đèn bàn), đêm (laptop) |
| [dan-nhan-vat.png](dan-nhan-vat.png) · [dan-nhan-vat-trong-phong.png](dan-nhan-vat-trong-phong.png) | **Cả ba nhân vật chính** (Nam, Người Kia, Tùng): 3 góc 2D ↔ 2.5D; và ba người đứng trong phòng 3D ban ngày + đêm (ánh laptop xanh) |
| [vat-ly-va.png](vat-ly-va.png) · [vat-ly-dat.png](vat-ly-dat.png) · [vat-ly-dung.png](vat-ly-dung.png) · [vat-ly-giat.png](vat-ly-giat.png) · [vat-ly-tung-dung.png](vat-ly-tung-dung.png) · [vat-ly-kia-giat.png](vat-ly-kia-giat.png) | Vật lý thứ cấp: bị va vào vai, nhảy xuống tiếp đất, đang đi dừng khựng, giật mình — hàng trên tư thế gốc, hàng dưới có vật lý |
| [tham-khao/](tham-khao/) | Ảnh tham chiếu 2,5D chủ repo gửi (tư thế, tạo hình 3 góc, ánh sáng); chỉ học cách đánh sáng/khối, không chép tạo hình |

Nguồn: [`nam-2-5d.tsx`](nam-2-5d.tsx). Bảng xuất bằng `renderToStaticMarkup` + Chromium; không lưu SVG vì mỗi lớp cắt nhúng lại cả nhân vật (0,7–1,6 MB/bảng), dựng lại từ TSX khi cần.

## Dáng người (vòng 3–5, theo ảnh tham chiếu)

Chủ repo yêu cầu vẽ lại dáng cho giống ảnh. Vòng 3 tôi đo ảnh bằng mắt và đo sai. Vòng 4 ghép ảnh mẫu cạnh Nam ở cùng chiều cao, ba góc. Vòng 5 thu gọn vì bản vòng 4 trông "đô" (vai, tay, bàn tay quá to):

| | Ảnh tham chiếu | Đã chốt | Dáng mới (`DANG_THAM_CHIEU`) |
|---|---|---|---|
| Đầu | thon: ngang ≈ 0,9 bản chốt, cằm sát vai | tròn, có cổ | ngang ×0,9, hạ 8 đơn vị |
| Vai | rộng vừa, thân đầy | | điểm vai ×0,9, áo ×0,94 |
| Tay | dài hơn một chút, nắm tay rơi dưới vạt áo | | 78/72 (đã chốt 80/74), dày 17,5/15,5/13,5 (đã chốt 19/16/13,5), bàn tay 1,18 (đã chốt 1,12) |
| Quần, chân | ống thẳng rộng đều, lửng; chân ngắn hơn ~6% | thu gối, loe gấu | 28/26/26, gấu 0,84, đùi/ống chân 99 |

**Giữ nguyên:** mặt, nét mặt, tóc, màu, nốt ruồi, khớp/giới hạn rig. `Nam25D` mặc định `dang="moi"`; `dang="chot"` về dáng đã chốt. Bộ đồ `outfit` khác áo thun chưa có dáng mới.

**Sửa trong rig gốc ([`../../nhan-vat.tsx`](../../nhan-vat.tsx)):** thêm `Build`/`DEFAULT_BUILD` (độ dài xương, vai, độ dày tay, bàn tay, tay áo, ống quần, dép) truyền qua `Outfit.build`, và nhãn `data-part="head"`. Mặc định = số đã chốt; bảng nhân vật trước/sau trùng từng điểm ảnh; `npm run typecheck`, `tests/ho-so-02-rig.cjs`, `bo-sung-15p/verify.cjs` đều qua. Bộ Nam đã chốt **chưa** đổi sang dáng mới.

## Cách làm (vòng 2, theo ảnh tham chiếu)

- **Tông cảnh:** multiply một màu lên cả hình bao (đêm xanh, đèn vàng…).
- **Mảng tối theo khối:** mỗi khối (da đầu, da tay/chân, tóc, áo, quần) lấy **phần đang lộ** — dựng lại nhân vật trong mask, khối đó trắng, mọi thứ vẽ sau nó đen — rồi trừ đi chính nó dịch về phía nguồn sáng. Còn lại một dải sắc cạnh bám đường bao ở phía tối. Vì theo đúng thứ tự vẽ của rig nên tay trước thân, chân ngồi, đồ cầm không bị mảng phía sau lem lên; áp được cho mọi góc/tư thế mà không cần vẽ mảng riêng.
- Da đầu chỉ lệch ngang để không có dải tối dưới cằm (giống râu).
- **Tách lớp (bóng đổ giữa lớp):** lớp trước đổ bóng lên lớp sau: tóc → trán, đầu/cằm → cổ áo, vạt áo → quần, tay → quần, áo → tay (tay đưa ra trước thân thì ngược lại: tay → áo). Khối che lấy phần **đang lộ**, dịch ra xa nguồn sáng và xuống. Kiểu sáng không có bóng đổ theo hướng (ngược sáng, màn hình) vẫn giữ một bóng tiếp xúc ngắn thẳng xuống để các lớp không dính nhau. Tóc có thêm mảng tối riêng ngoài mảng sáng.
- **Xa–gần:** tay/chân vế L (phía xa máy ở 3/4, nghiêng, 1/4) phủ một lớp tối‑lạnh nhẹ, lùi ra sau thân. Rig gắn nhãn `data-limb="L"` để nhận ra (chỉ là thuộc tính, hình không đổi).
- **Khớp bối cảnh 3D:** `Nam25D lightDir={[x, y]}` nhận hướng sáng trên màn hình; trong phòng lấy từ `lightFor(view, at, nguồn)` của [`boi-canh.tsx`](../../boi-canh/boi-canh.tsx) nên mảng tối/viền sáng cùng phía cửa sổ, đèn bàn hay laptop của nền. Xem [trong-phong.png](trong-phong.png).
- **Ánh màn hình:** chủ repo chọn bản hắt mạnh (dải sáng rộng trên mặt, áo, tay phía màn hình). Cường độ theo độ tối phòng: `opacity × (0,5 + 1 − độ sáng tông cảnh)` — phòng càng tối, hắt càng mạnh.
- **Mảng sáng tóc, viền sáng:** cùng cách cắt nhưng phía nguồn sáng; blend screen. Viền sáng mỏng ở đèn vàng, đêm xanh, ngược sáng, ánh màn hình. Viền chỉ chạy ở thân trên (đầu, vai, tay), dừng ở hông: ở chân nó chui vào khe giữa hai ống và quanh dép, rối hình.
- **Mềm, chuyển dần (chủ repo chọn sau vòng 6):** bản dịch trong mask được làm mờ (`feGaussianBlur`, độ lệch = `SOFT` × bề rộng mảng; viền sáng 0,3) nên mép trong của mảng tối, bóng đổ, ánh hắt chuyển dần sang vùng sáng; mép ngoài vẫn cắt theo hình bao. Hệ quả: quanh đường bao có một dải tối rất nhẹ, giúp khối tròn hơn. `SOFT = 0` trở về sắc cạnh.
- Hướng, bề rộng, màu của từng kiểu sáng chọn tay trong `LIGHTS_25D`. Không chiếu sáng Lambert, không rim tự sinh bằng filter. Chủ repo đã cho phép viền sáng/ánh hắt sắc cạnh (ghi ở [quy chuẩn 4.0](../QUY-CHUAN-THIET-KE-SVG.md#40-bóng-vẽ-tay-không-viền-11112026)).

```tsx
import { Nam25D } from './thiet-ke/thu-2-5d/nam-2-5d';
<Nam25D lighting="dem-xanh" mood="sleepy" shirt={PALETTE.nam.sleepShirt} pose={{ ...STAND_POSE, view: 'three' }} />
```

## Người Kia và Tùng (vòng 8)

Áp cùng lớp 2.5D, tách lớp, bóng mềm và vật lý cho hai nhân vật chính còn lại; mã: [`nhan-vat-khac-2-5d.tsx`](nhan-vat-khac-2-5d.tsx), bảng: [dan-nhan-vat.png](dan-nhan-vat.png), [dan-nhan-vat-trong-phong.png](dan-nhan-vat-trong-phong.png).

- **Người Kia** (`NguoiKia25D`): dùng chung rig, đầu, bảng màu và dáng mới với Nam (khác nốt ruồi bên phải, nét mặt mặc định điềm tĩnh, áo rêu) — chỉ đổi danh tính nên không có đường đi riêng nào cần kiểm thêm.
- **Tùng** (`Tung25D`): đầu và đồ riêng nên khai bảng màu nhận diện khối riêng (`Pal25`: áo + tất cùng navy, viền cổ/số 7/sọc/giày cùng màu kem, quần đùi, tóc). Dáng theo ảnh tham chiếu, đo bằng cách ghép cùng chiều cao như Nam: chân ngắn ~6%, bàn tay 1,22, vai ×0,96, tay dày hơn chút (`TUNG_DANG`). Rig gốc chỉ thêm tham số `hair` cho `TungHead`/`TungSoccer`, xuất `TUNG_OUTFIT`; bảng nhân vật (có Tùng) trước/sau trùng từng điểm ảnh.
- **Đầu nghiêng của Tùng dựng lại theo ảnh mẫu** ([so sánh](tung-nghieng-so-sanh.png): trái ảnh mẫu, phải bản dựng). Bản đầu tiên dùng chung khuôn đầu nghiêng với Nam nên tròn, hàm phình, tóc là một mảng vòm rời ở trên, gáy hở da. Đã đo điểm mốc trên ảnh mẫu (đường tóc, mũi tóc trán, chân tóc nhọn sau tai, tai, mắt, mũi–môi–cằm, cổ), quy ra đơn vị đầu, và dựng `TungProfileHead` trong `nhan-vat.tsx`: sọ thon, hơi cúi (cằm lùi so với trán), hàm nhỏ cằm tròn, cổ nhỏ, **tóc ôm sát sọ xuống tận gáy** với lọn nhọn ở đỉnh và mũi tóc trên trán, tai chữ C ở mép tóc; đầu to hơn ~10% và nghiêng ~5°, cổ ngắn và **chếch ra trước** (nghiêng ~10° quanh chân cổ, đầu đưa theo). Chỉ Tùng đổi, góc nghiêng; đầu Nam/Người Kia và các góc khác của Tùng giữ nguyên (bảng nhân vật gốc trùng từng điểm ảnh). Miệng mở khi nói và tóc đung đưa vật lý vẫn hoạt động ở góc này. **Áo Tùng góc nghiêng cũng dựng lại:** bản cũ dùng chung khuôn thân áo của Nam nên ngược so với mẫu (vạt loe ra phía lưng, gấu dốc xuống phía trước, cổ áo chữ V phía trước). Nay lưng gần thẳng từ gáy xuống, ngực dốc chéo ra trước từ cổ áo rồi mới phình tròn, gấu ngang (`TUNG_VIEWS.side`). Vòng đầu tôi dựng vai áo thành mái vòm đối xứng nên ngực vẫn trông như lưng; trong mẫu chỉ ngực dốc còn lưng thẳng. **Cổ:** dày, loe ở gốc (sau gáy thoải xuống vai, trước dốc ra cổ áo thấp hơn) để da vai–ngực đỡ chân cổ thay vì một cột cắm rời; cổ áo trắng vẽ đè lên chân cổ. **Bóng nhẹ ở viền** (vẽ tay, trong `TungProfileHead`): hàm đổ bóng xuống cổ, dải tối mép trước cổ, quầng dưới hàm/má để tách mặt khỏi cổ, tóc đổ bóng lên trán–thái dương. Quần đùi nghiêng của Tùng còn hẹp hơn mẫu (chưa chỉnh). **Chưa làm:** đầu nghiêng của Nam và Người Kia vẫn tròn như cũ; góc 1/4 và sau lưng của Tùng chưa so với ảnh mẫu.
- **Lớp ánh sáng đã khái quát hoá:** `Volume25` nhận bảng màu `Pal25` (danh sách màu áo, quần, tóc) thay vì cứng theo Nam; đầu/mắt luôn bị loại khỏi khối áo/quần (mắt Tùng cùng màu kem với viền áo nên trước đó sẽ bị bóng áo phủ lên). Nam không đổi một điểm ảnh (so bảng `nam-2-5d.png`, `anh-sang.png`).
- **Vật lý:** `NamVatLy` nhận `Body` (mặc định `Nam25D`, hoặc `NguoiKia25D`/`Tung25D`); `VatLyBoard` có tham số `who`. Mẫu: [vat-ly-tung-dung.png](vat-ly-tung-dung.png), [vat-ly-kia-giat.png](vat-ly-kia-giat.png).
- **Kiểm tra:** [`kiem-tra-2-5d.cjs`](kiem-tra-2-5d.cjs) — 610 kiểm tra: 3 nhân vật × 5 góc × 6 kiểu sáng × tư thế (đứng, ngồi, cầm điện thoại, đi) dựng được, không NaN/undefined, đủ lớp và mask, `volume={false}` là 2D, Tùng chọn khối đúng màu.
- Opening mẫu `HoSo02Opening25D` giờ dùng 2.5D cho cả ba nhân vật (Người Kia, Tùng thay qua alias import; `opening.tsx` gốc không đổi).
- **Chưa làm:** vai phụ (giảng viên, mẹ, ba, bác hai, sinh viên); Tùng chưa kiểm ở tư thế bỏ tay vào túi (dùng `TUNG_POSE` gốc); chưa xem chuyển động liền.

## Ánh laptop màu xanh (vòng 8)

Nguồn sáng chính ban đêm của phòng đặt sát bàn laptop nhưng trước đây tô vàng ấm. Đã đổi sang xanh lạnh (`LAPTOP_LIGHT` trong [`boi-canh.tsx`](../../boi-canh/boi-canh.tsx)): quầng quanh bàn, ánh lên mặt/áo người đứng gần (lớp ánh sáng theo mặt của phòng), mảng sáng trên các mặt đồ. Đèn bàn vẫn là vật cạnh laptop (không còn quầng vàng). Đã xuất lại `phong-tro-toi.png`, `ban-hoc-laptop-dem.png`, `boi-canh.png` và các SVG phụ thuộc; `render-previews.cjs` nhận `CHROME_PATH` để chạy khi mạng chặn tải Chrome của Remotion. Trailer 3D/freestyle của nhánh khác còn dùng tint vàng `#ffc878` riêng, chưa đổi.

## Vật lý thứ cấp (vòng 7)

Chủ repo yêu cầu thêm chi tiết vật lý để nhân vật phản ứng chân thật khi có tác động. Mã: [`vat-ly.tsx`](vat-ly.tsx); kiểm tra: [`kiem-tra-vat-ly.cjs`](kiem-tra-vat-ly.cjs).

- **Mô hình:** tư thế gốc (`base(f)`) là diễn xuất đã dựng; lớp này cộng độ lệch từ các lò xo–giảm chấn gắn vào khớp rig: thân (ngả ngược gia tốc), đầu (trễ rồi vượt), bắp tay và cẳng tay (cẳng tay trễ hơn), nhún (dẹt–vươn giữ thể tích + gập gối khi nén), tóc (xoay, dịch ngang, nảy), vạt áo (lệch ngang/dọc). Gia tốc thân lấy từ chính chuyển động của `base` (`pose.x`, `pose.y`, `tilt`), nên đi–dừng, nhảy–đáp tự sinh phản ứng; các cú va dùng `Impact` (`va`, `tiep-dat`, `giat-minh`, `khung`) cộng thẳng vào vận tốc lò xo.
- **Tất định theo số khung:** mô phỏng từ khung 0 bằng bước cố định, nên Remotion render lại khung bất kỳ cũng ra đúng kết quả. Rẻ (vài nghìn phép tính) nên hook `usePhysics` tính lại mỗi lần render cũng được.
- **Hệ số:** `DEFAULT_PHYS`. Giảm chấn ζ = c/(2√k) trong [0,25; 1): tóc/vạt áo ≈ 0,35 (vượt 1–2 nhịp rồi lặng nhanh). Vòng đầu tôi để tóc ζ ≈ 0,15 và nó lắc hơn 30 khung — bài kiểm tra bắt được, đã chỉnh. Vòng đầu cũng để thân ngả 14° khi dừng gấp (quá tay), đã giảm hệ số.
- **Rig gốc chỉ thêm `hair?: HairSway`** (xoay/dịch nhóm tóc quanh da đầu) cho `StudentTwinHead`/`StudentTwinBody`; bỏ trống thì tóc đứng yên, bảng nhân vật trước/sau trùng từng điểm ảnh. Vạt áo lệch qua `Outfit.hem` ở `NamDangMoi` (`hemSway`).
- **Dùng:** `NamVatLy` (`track`, `frame`, `base`, `physics`); `physics={false}` hiện đúng tư thế gốc để so.
- `kiem-tra-vat-ly.cjs` (6505 kiểm tra / 4 cảnh): tất định, mọi số hữu hạn, dẹt–vươn giữ thể tích (sx·sy = 1) và trong ±10%, khuỷu/gối không gập ngược, giải khớp hữu hạn, có phản ứng nhìn thấy được, dao động và tóc tắt dần ở cuối, đứng yên không tác động thì chỉ thở.

## Giới hạn

- Mảng tối là dải bám đường bao: khối rất tròn (đầu, vai) đọc tốt; mặt phẳng lớn chỉ có một dải ở mép, ít "mặt khối" như tranh vẽ tay hoàn toàn.
- Khối nhận diện bằng màu tô: áo/quần lấy từ props, da `#dbad82`/`#bd8968`, tóc `#292a29` trong `data-part="head"`. Đổi màu da/tóc trong rig thì phải đổi theo. Chưa áp cho Người Kia (dùng chung rig, chạy được nhưng chưa duyệt) và Tùng (đầu riêng chưa có nhãn).
- Dáng mới mới thử ở tư thế đứng/đi/ngồi/cầm máy; chưa rà các tư thế bổ sung (`EXTRA_POSES`, `gripAt` vẫn tính theo xương đã chốt nên đồ cầm sẽ lệch nếu dùng với dáng mới).
- Góc sau lưng: rig chỉ cho tay vung nhẹ nên chưa giơ tay chạm gương như ảnh tham chiếu.
- Mỗi lớp cắt dựng lại cả nhân vật (~30–35 bản trong mask), thêm bộ lọc làm mềm → render nặng hơn 2D rõ rệt. Chưa đo trên video.
- Vật lý chưa gắn với va chạm thật của bối cảnh (chạm bàn, đồ vật): `Impact` do người dựng đặt tay; chưa có chân bước đỡ khi bị đẩy mạnh; tóc chỉ xoay cả khối, chưa từng lọn riêng; vạt áo/tay áo chưa tách chuyển động riêng khỏi thân; mới kiểm tra ở góc 3/4, quay phải. Mới xem bằng dải khung tĩnh, chưa xem video chạy liền.
- Bảng `trong-phong.png` dựng lại sau khi hợp nhất ánh sáng theo mặt của phòng (nhánh khác); lớp 2.5D vẫn lấy hướng sáng từ `lightFor`, chưa đọc mức tối/sáng theo vùng của phòng mới nên cường độ hai bên chỉ khớp bằng mắt.
- Phòng 3D chưa có nguồn sáng laptop riêng: ở cảnh đêm laptop, đèn bàn ấm vẫn bật trong nền trong khi Nam nhận ánh xanh từ màn hình.
- Opening mẫu (`HoSo02Opening25D`, bản sao `opening.tsx` trong studio) vẫn dùng `Nam25D` với mặc định ban ngày; chưa gán kiểu sáng theo từng shot và **chưa render lại video** sau vòng 2. Video vòng 1 (local, không commit): `what-if-studio/out/ho-so-02-nguoi-lam-thay/thu-2-5d/opening-nam-2-5d.mp4`. Render trong môi trường này cần `--browser-executable` trỏ Chromium có sẵn vì mạng chặn host tải Chrome của Remotion.
