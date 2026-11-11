# Thử chuyển Nam 2D → 2.5D (11/11/2026)

![Bảng so sánh 2D ↔ 2.5D](nam-2-5d.png)

**Trạng thái: bản thử để chủ repo duyệt hướng.** Chưa thay bộ Nam đã chốt, chưa áp vào shot/timeline, chưa xem chuyển động.

## Cách làm — giữ nguyên nhân vật

- Không vẽ lại Nam. `Nam25D` render y nguyên `StudentTwinBody`/`StudentTwinHead` từ [`../../nhan-vat.tsx`](../../nhan-vat.tsx) (cùng rig, tóc, nét mặt, màu, nốt ruồi), rồi phủ một lớp mảng sáng–tối **tự vẽ** lên trên.
- Mảng được cắt bằng mask silhouette của chính nhân vật và theo đúng khối: tóc, da mặt (trừ tóc), thân áo, tay áo, da tay, ống quần (trừ áo). Không tràn ra nền hay sang khối khác.
- Mảng tối dùng `mix-blend-mode: multiply` (phép hoà màu, không phải filter) để nét mắt/mày/nếp áo phía dưới vẫn giữ mực, và một mảng dùng được cho mọi màu áo. Màu da tối chọn để ra đúng `PALETTE.skinShadow`.
- Hướng sáng thiết kế cố định trái–trên, cùng phía mảng `drawn-side` có sẵn. Không tính theo đèn, không gradient, blur, rim hay AO — đúng [mục 4.0](../QUY-CHUAN-THIET-KE-SVG.md#40-bóng-vẽ-tay-không-viền-11112026).

## Cái tạo ra cảm giác 2.5D

1. **Mặt sáng/mặt tối trên từng khối tròn:** thân áo tối phía xa, vành sáng theo vai gần; tay và ống quần có dải tối cong qua ba khớp (hẹp ở chi gần, rộng ở chi xa) → đọc thành khối trụ.
2. **Bóng đổ giữa các lớp:** tóc đổ xuống trán (chính mảng tóc lệch theo hướng sáng), vạt áo đổ xuống quần → đọc được lớp nào nằm trên.
3. **Mảng sáng tóc** theo vòm sọ, mặt thái dương phía xa, bóng dưới mũi, hốc tai. Mảng mặt dừng trên gò má, không chạy quanh cằm để khỏi giống râu.

## Sửa sau tự đánh giá (11/11)

- Mảng tối thân áo, tay, ống quần bo thành **vành cong** theo khối thay vì nửa phẳng; dải tay/chân hẹp lại, không còn tô nửa cánh tay.
- Mảng thái dương ngắn lại, dừng trên gò má; bỏ bóng dưới mũi và mảng sáng tóc thừa (chỉ còn một vệt nhỏ trên đỉnh); bóng vạt áo mỏng và nhạt.
- `Nam25D` nhận đúng props của `StudentTwinBody` và đi theo rig (dịch hông, nghiêng thân, xoay cổ). Tay gập đưa lên thân thì bỏ dải tối tay/tay áo, loại vùng tay khỏi mảng tối thân áo; chân gập (ngồi) thì bỏ mảng chân — vì các mảng cắt theo cả hình bao nên nếu giữ sẽ lem lên tay và đồ cầm.
- Góc chưa vẽ mảng (nghiêng, 1/4, quay lưng, quay trái, nằm) tự rơi về Nam 2D (`supports25D`), nên không shot nào bị hỏng.

## Mẫu opening

`HoSo02Opening25D` (`what-if-studio/src/episodes/ho-so-02-nguoi-lam-thay/opening-2-5d.tsx`) là **bản sao** của `opening.tsx` chỉ đổi Nam sang `Nam25D`; `opening.tsx` gốc không đổi. Bản câm, phụ đề tạm, 48 s @30 fps, 1920×1080.

- 2.5D hiện ở các cảnh Nam quay phải ở 3/4: Nam ngồi chơi game (2A), cận độc thoại trước gương (shot 3). Nam quay trái (cảnh bồn rửa 2B), quay lưng/đi về phía máy (shot 4) và bóng trong gương vẫn là 2D. Nam nằm giường (shot 0–1, `Sleeper` trong `canh-01-demo.tsx`) chưa đổi.
- Đầu ra local (không commit): `what-if-studio/out/ho-so-02-nguoi-lam-thay/thu-2-5d/opening-nam-2-5d.mp4`.
- Render cần `--browser-executable` trỏ Chromium có sẵn vì mạng của môi trường này chặn host tải Chrome của Remotion.

## Giới hạn

- Mảng thân/đầu là hình cố định (chỉ xoay theo nghiêng thân/cổ); pose gập mạnh, nghiêng, 1/4, quay lưng cần vẽ thêm mảng riêng.
- Dáng ngồi đã bớt mảng để khỏi lem nên **ít khối hơn dáng đứng**.
- Hình học đầu/tóc/thân được chép trong file chỉ để làm vùng cắt; nếu sửa đầu/tóc/thân trong `nhan-vat.tsx` thì phải sửa theo.
- Mask render lại nhân vật một lần nữa cho mỗi lớp cắt → tốn thời gian render hơn bản 2D. Chưa so thời gian render cả video giữa bản 2D và 2.5D; mới render lẻ khung (~7 s/khung cho cả hai, đã gồm thời gian khởi động).
- Bảng tĩnh không chứng minh chuyển động. Muốn dùng trong phim cần xem animatic quay đầu/đi/cầm đồ.

## Dùng và xuất lại

```tsx
import { Nam25D, Nam25DHead } from './thiet-ke/thu-2-5d/nam-2-5d';
<Nam25D mood="sleepy" shirt={PALETTE.nam.sleepShirt} pose={{ ...STAND_POSE, view: 'three' }} />
<Nam25D {...props} volume={false} />   // tắt lớp thể tích = Nam 2D gốc
```

Bảng `nam-2-5d.svg/png` xuất từ `Nam25DBoard` (1920×1080). Chưa tạo audio/video.
