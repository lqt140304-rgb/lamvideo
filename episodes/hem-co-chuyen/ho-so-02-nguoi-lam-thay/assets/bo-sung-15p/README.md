# Asset bổ sung — Hồ sơ 02: Người trong gương

Bộ hình theo kịch bản mục tiêu khoảng 15 phút, cập nhật 11/11/2026. **47 SVG rời, chín bảng duyệt và 16 PNG**; nguồn TSX chỉnh được. Tái sử dụng rig/phòng hiện có; không dùng ảnh sinh trả phí. Hình tĩnh mới để duyệt, chưa phải video hoặc chuyển động đã duyệt.

Mỹ thuật: silhouette mềm, không viền ngoài, nét trong chọn lọc, màu gọn và ít mảng bóng tự vẽ. Đọc [quy chuẩn chung](../../../../../docs/PHONG-CACH-MY-THUAT.md) và [quy chuẩn rig](../thiet-ke/QUY-CHUAN-THIET-KE-SVG.md#40-bóng-vẽ-tay-không-viền-11112026). Không bật lại shading vật liệu tự động khi đưa vào phim.

## Xem trước

Mở [xem-asset.html](xem-asset.html) ở máy sau khi tải repo, hoặc xem PNG trực tiếp trên GitHub:

| Bảng | Nội dung |
|---|---|
| [Cảm xúc 1](bang-cam-xuc-01.png) / [Cảm xúc 2](bang-cam-xuc-02.png) | 18 nét mới ghép lên Nam/Người Kia, mỗi nhóm ba mức; SVG nét mặt dùng chung nằm ở thư viện |
| [Dáng nghỉ của Nam](bang-dang-nghi.png) | Ngồi chơi game, nằm chơi game, suy sụp và nằm ngửa nhìn trần; có mặt đỡ |
| [Đạo cụ](bang-dao-cu.png) | 13 đạo cụ: búa, tiền ăn, hai thẻ hư cấu, ba món ăn, túi quả, PC, thau đồ, bóng, kéo, góc đồ cho/tặng |
| [Bối cảnh](bang-boi-canh.png) | Giảng đường, Lab 402, hành lang trường, cơm gia đình, sân bóng, góc cắt tóc |
| [Vai phụ và tư thế](bang-vai-phu-tu-the.png) | Sáu vai phụ, mười dáng diễn; dùng khớp rig gốc |
| [Giao diện](bang-giao-dien.png) | Sáu UI hư cấu và bảng so nốt ruồi |
| [Gương](bang-guong.png) | Bốn trạng thái tĩnh để chốt cách chuyển mặt kính |
| [Tiếp xúc](bang-tiep-xuc.png) | Tay giữ búa, cầm túi, áp kính |

[Thế giới gương](svg/the-gioi-guong.png) là nền thứ bảy, dùng lại phòng gốc. Toàn bộ 47 SVG rời nằm trong [svg/](svg/); [MANIFEST.json](MANIFEST.json) ghi tên, kích thước, cảnh liên quan và giới hạn. Bảng duyệt có nhãn/tiêu đề để kiểm tra, **không ghép nguyên bảng vào phim**.

## Nguồn và cách lắp

| File | Dùng để làm gì |
|---|---|
| [common.tsx](common.tsx) | Màu, nhãn, nền bảng, mảng tiếp xúc và texture nhẹ |
| [dao-cu.tsx](dao-cu.tsx) | Đồ vật độc lập; component nhận kích thước/children theo định nghĩa của từng món |
| [nhan-vat-va-tu-the.tsx](nhan-vat-va-tu-the.tsx) | Sáu vai phụ, áo sơ mi, tám key pose; `gripAt` dùng chính lời giải khớp của rig gốc |
| [boi-canh.tsx](boi-canh.tsx) | Plate bối cảnh, nhóm xa/giữa/người/lớp che gần |
| [giao-dien.tsx](giao-dien.tsx) | Nội dung màn hình và đối chiếu nhận diện; chữ tách khỏi phản chiếu |
| [catalog.tsx](catalog.tsx) | Danh mục xuất file và chín bảng ghép để duyệt |
| [render-previews.cjs](render-previews.cjs) | Xuất SVG/PNG/HTML/manifest, kiểm tra ID/clip và điểm nắm búa; chỉ xuất ảnh tĩnh |
| [verify.cjs](verify.cjs) | Kiểm tra kiểu của cả studio và các file TSX bổ sung |

Import component vào SVG của shot, giữ hệ tọa độ nguồn. Nền dùng `viewBox="0 0 1920 1080"`. Các plate mới là bố cục 2D tách nhóm, **không tự đổi sang mọi camera 3D**; quay lệch nhiều phải bố trí/vẽ lại. Riêng `MirrorRealm` dùng nguồn `RoomScene` có hình học không gian của phòng gốc.

Đạo cụ cầm tay: `Hammer` và `FruitBag` đặt điểm cầm tại `(0,0)` trong tọa độ riêng; neo vào bàn tay bằng `gripAt`, rồi mới xoay/scale cùng actor. Chỉnh thứ tự vật–bàn tay để ngón phủ cán/quai. Không lấy tâm của SVG preview làm điểm nắm. Dáng `giu-bua` đã kiểm tra tĩnh hai cổ tay gần cán; chuyển cầm–thả vẫn cần animatic.

Nội dung `ScreenContent` được vẽ trong vùng 312×520; `PhonePanel` là khung minh họa, không bắt buộc thay mẫu điện thoại sẵn có. Đưa UI vào mặt thiết bị và clip đúng màn hình. `Computer` có lớp nội dung riêng. Thẻ/số liệu/tên ứng dụng đều hư cấu để phục vụ truyện.

Gương: truyền cảnh phản chiếu riêng qua `children`; điều khiển trạng thái và phase bằng giá trị tính từ frame. Biến dạng chỉ clip trong mặt kính; khung giữ nguyên. Không lật toàn bộ SVG làm chữ/đồ thật bị đảo. Nam/Người Kia phải chọn đúng identity/nốt ruồi. Hiệu ứng gợn kính là VFX, không phải bóng vật liệu; bốn ảnh trạng thái chưa chứng minh quá trình tan/chuyển mượt. Không dùng lớp gương kỳ dị ở đầu truyện để lộ sinh vật sớm.

## Tái sử dụng và giới hạn

- Nam, Người Kia, Tùng và các khớp: [nhan-vat.tsx](../nhan-vat.tsx). Phòng, bếp, cửa/chốt, hành lang trọ: [boi-canh.tsx](../boi-canh/boi-canh.tsx).
- Balo, sổ, mũ bảo hiểm, điện thoại và đạo cụ phổ thông: kiểm tra thư viện studio trước khi tạo lại. Hộp cơm mới là hộp giấy cơm sườn theo cảnh, không thay mọi hộp ăn trong thư viện.
- Vai phụ hiện có góc ba phần tư phía trước, đầu/trang phục riêng trên rig gốc. Chưa có bộ quay đủ hướng hoặc khẩu hình riêng đã kiểm tra. Trang phục sơ mi chỉ hoàn chỉnh cho góc phía trước/ba phần tư.
- Các dáng bổ sung là key pose; không dùng nội suy tùy ý rồi coi là chuyển động đạt. Clip gia đình trong UI là hình dựng minh họa, chưa phải đoạn video gia đình hoàn thiện.
- Chưa tạo giọng, âm thanh, animatic hoặc timeline phim mới. Không thay bộ asset Hồ sơ 1. Duyệt hình rồi kiểm tra chuyển động khi người dùng giao Claude dựng.

## Kiểm tra/xuất lại

Chạy từ gốc repo với dependencies đã cài trong `what-if-studio`:

```powershell
node episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/bo-sung-15p/verify.cjs
node episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/bo-sung-15p/render-previews.cjs
```

Exporter kiểm tra ID không trùng, clip/filter có đích, số tọa độ hữu hạn và sai số điểm nắm búa dưới bốn đơn vị nguồn. Các kiểm tra kỹ thuật này không thay cho duyệt hình và xem animatic tương tác.


### Dáng chơi game/nghỉ — cập nhật theo phản hồi

`choi-game` và `suy-sup` đã sửa điểm vai–khuỷu/cổ tay và thêm ghế đỡ trong bảng duyệt. `nam-choi-game` và `nam-nhin-tran` là góc **từ trần nhìn xuống**: đầu trên gối, lưng trên nệm, chân không mang dép và không có bóng đứng dưới chân. Không dùng chúng như góc ngang giường; cần vẽ góc nằm khác khi shot yêu cầu. Tóc Nam/Người Kia giữ mẫu cũ.

`phoneLandscape` vẽ một máy ngang giữa hai cổ tay, phía dưới lớp ngón tay; cả hai tay phải theo máy. `support: 'bed'` bỏ bóng đứng. Nhóm `data-layer="support"` là nệm/gối/ghế minh họa, khi ghép bối cảnh cần dùng đúng mặt đỡ trong phòng thay vì chồng thêm ghế/nệm thứ hai. Các key pose chưa được nối thành diễn hoạt.


Nét mặt mới dùng từ [thư viện bổ sung cốt truyện](../../../../../what-if-studio/library/expressions/cartoon-soft/bo-sung-cot-truyen/README.md); không nhân bản 18 SVG vào hồ sơ tập. Xem [cách thiết kế và tái sử dụng](CACH-THIET-KE-VA-SU-DUNG.md).
