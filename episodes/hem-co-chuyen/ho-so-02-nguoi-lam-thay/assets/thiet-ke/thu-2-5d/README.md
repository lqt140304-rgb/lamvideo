# Thử chuyển Nam 2D → 2.5D (11/11/2026)

**Trạng thái: bản thử chờ chủ repo duyệt.** Chưa thay bộ Nam đã chốt. Chỉ duyệt bằng ảnh tĩnh; chưa xem chuyển động của vòng 2.

| Bảng | Nội dung |
|---|---|
| [anh-sang.png](anh-sang.png) | 6 kiểu sáng cảnh: ban ngày, trời âm u, đèn vàng, ánh màn hình, đêm xanh, ngược sáng |
| [cac-goc.png](cac-goc.png) | 2D đã chốt ↔ 2.5D ở chính diện, 3/4, nghiêng, 1/4 sau, sau lưng |
| [tu-the.png](tu-the.png) | Đi, ngồi ghế đẩu, cầm điện thoại, đứng trước gương (sau lưng) |
| [nam-2-5d.png](nam-2-5d.png) | So sánh 2D ↔ 2.5D toàn thân và ba nét mặt |
| [tham-khao/](tham-khao/) | Ảnh tham chiếu 2,5D chủ repo gửi (tư thế, tạo hình 3 góc, ánh sáng); chỉ học cách đánh sáng/khối, không chép tạo hình |

Nguồn: [`nam-2-5d.tsx`](nam-2-5d.tsx). Bảng xuất bằng `renderToStaticMarkup` + Chromium; không lưu SVG vì mỗi lớp cắt nhúng lại cả nhân vật (0,7–1,6 MB/bảng), dựng lại từ TSX khi cần.

## Giữ nguyên nhân vật

Nam gốc (`StudentTwinBody`/`StudentTwinHead` trong [`../../nhan-vat.tsx`](../../nhan-vat.tsx)) vẽ y nguyên: rig, tóc, nét mặt, màu, nốt ruồi. Lớp 2.5D chỉ phủ lên trên. `volume={false}` trả về đúng Nam 2D. Rig gốc chỉ thêm nhãn `data-part="head"` trên nhóm đầu; đã so bảng nhân vật trước/sau: trùng từng điểm ảnh.

## Cách làm (vòng 2, theo ảnh tham chiếu)

- **Tông cảnh:** multiply một màu lên cả hình bao (đêm xanh, đèn vàng…).
- **Mảng tối theo khối:** mỗi khối (da đầu, da tay/chân, tóc, áo, quần) lấy **phần đang lộ** — dựng lại nhân vật trong mask, khối đó trắng, mọi thứ vẽ sau nó đen — rồi trừ đi chính nó dịch về phía nguồn sáng. Còn lại một dải sắc cạnh bám đường bao ở phía tối. Vì theo đúng thứ tự vẽ của rig nên tay trước thân, chân ngồi, đồ cầm không bị mảng phía sau lem lên; áp được cho mọi góc/tư thế mà không cần vẽ mảng riêng.
- Da đầu chỉ lệch ngang để không có dải tối dưới cằm (giống râu).
- **Bóng đổ:** tóc lên trán, vạt áo lên quần.
- **Mảng sáng tóc, viền sáng, ánh hắt:** cùng cách cắt nhưng phía nguồn sáng; blend screen. Viền sáng ở đèn vàng, đêm xanh, ngược sáng; ánh hắt từ dưới ở ánh màn hình.
- Hướng, bề rộng, màu của từng kiểu sáng chọn tay trong `LIGHTS_25D`. Không filter, gradient, blur, AO; không phải chiếu sáng Lambert. Chủ repo đã cho phép viền sáng/ánh hắt sắc cạnh (ghi ở [quy chuẩn 4.0](../QUY-CHUAN-THIET-KE-SVG.md#40-bóng-vẽ-tay-không-viền-11112026)).

```tsx
import { Nam25D } from './thiet-ke/thu-2-5d/nam-2-5d';
<Nam25D lighting="dem-xanh" mood="sleepy" shirt={PALETTE.nam.sleepShirt} pose={{ ...STAND_POSE, view: 'three' }} />
```

## Giới hạn

- Mảng tối là dải bám đường bao: khối rất tròn (đầu, vai) đọc tốt; mặt phẳng lớn chỉ có một dải ở mép, ít "mặt khối" như tranh vẽ tay hoàn toàn.
- Khối nhận diện bằng màu tô: áo/quần lấy từ props, da `#dbad82`/`#bd8968`, tóc `#292a29` trong `data-part="head"`. Đổi màu da/tóc trong rig thì phải đổi theo. Chưa áp cho Người Kia (dùng chung rig, chạy được nhưng chưa duyệt) và Tùng (đầu riêng chưa có nhãn).
- Góc sau lưng: rig chỉ cho tay vung nhẹ nên chưa giơ tay chạm gương như ảnh tham chiếu.
- Mỗi lớp cắt dựng lại cả nhân vật (~20–25 bản trong mask) → render nặng hơn 2D. Chưa đo trên video.
- Opening mẫu (`HoSo02Opening25D`, bản sao `opening.tsx` trong studio) vẫn dùng `Nam25D` với mặc định ban ngày; chưa gán kiểu sáng theo từng shot và **chưa render lại video** sau vòng 2. Video vòng 1 (local, không commit): `what-if-studio/out/ho-so-02-nguoi-lam-thay/thu-2-5d/opening-nam-2-5d.mp4`. Render trong môi trường này cần `--browser-executable` trỏ Chromium có sẵn vì mạng chặn host tải Chrome của Remotion.
