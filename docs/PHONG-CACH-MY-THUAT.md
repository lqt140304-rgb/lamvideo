# Phong cách mỹ thuật — Stylized 3D mềm mại

Chuẩn hiện hành: nhân vật, đồ dùng và môi trường dựng cùng không gian Blender; đọc [QUY-CHUAN-3D.md](QUY-CHUAN-3D.md). Các ảnh/SVG còn trong kho là tư liệu tạo hình, không phải hướng dẫn sản xuất hoặc rig hiện hành.

## Hình khối và nhận diện

- Khối tròn đầy, đường cong mềm, mức chi tiết vừa đủ đọc ở cỡ điện thoại. Vai nối thân, hông nối đùi; quần áo có khối người bên trong, không thành hộp rỗng hoặc giấu tay sai cửa áo.
- Tay có lòng bàn tay, ngón cái đúng bên; nhóm ngón gọn nhưng đủ cầm nắm. Chân rõ gót–mu–mũi, giữ khối ở cả dáng đứng và ngồi.
- Tóc phủ kín phần sọ cần che; không sửa nhận diện/tóc đã duyệt khi chỉ sửa khớp. Đầu, cổ và tay dùng cùng màu da nền, phản ứng sáng theo cùng vật liệu.
- Mắt, mí, mày, miệng phối hợp với đầu, vai, trọng tâm và nhịp thở. Cảm xúc có ba mức tiết chế; màu ửng hoặc quầng mắt chỉ hỗ trợ, không thay diễn xuất. Dựng shape keys phù hợp từng vai, không coi overlay cũ là rig mặt 3D.

## Vật liệu, ánh sáng và màu

- Soft Stylized PBR hoặc toon 3D, bề mặt mờ; tách gỗ, kim loại, kính và vải bằng hình cùng chất cảm có chọn lọc. Không thêm vân nhỏ tới mức hình rối hoặc da bóng nhựa.
- Ánh sáng vật lý có nguồn rõ; bóng mềm và ánh hắt cùng không gian. Quy tắc bóng vẽ tay của bản cũ đã ngừng áp dụng.
- Không thêm bóng cằm thành râu ngoài thiết kế. Màu da và trang phục cần được kiểm tra cả ngày/đêm trước khi tăng tương phản hoặc grade.
- Hòa sắc qua Blender Compositor hoặc bước hậu kỳ đã chọn; bảo toàn vùng da và chữ UI, không chồng nhiều lớp grade thiếu kiểm tra.

## Người, đồ và môi trường đồng nhất

| Nhóm | Yêu cầu |
|---|---|
| Nhân vật | Tỷ lệ cartoon đã duyệt, khớp có thể tích, quần áo chuyển theo pose, bàn tay đúng hướng |
| Nội thất/đạo cụ | Bo cạnh vừa phải, công năng rõ, lòng chậu/cốc có thành và đáy, có điểm cầm và mặt đỡ |
| Kiến trúc | Một mặt bằng thống nhất, cửa có độ dày/bản lề, đủ phần camera sẽ nhìn thấy |
| Thiên nhiên/vải | Nhịp lớn–vừa–nhỏ, gốc treo/cắm cố định, chuyển động theo lực và môi trường |

Mềm không có nghĩa bo mọi vật thành viên nang. Giữ đường thẳng cần cho mặt bàn, cửa, màn hình và kết cấu chịu lực.

## Kiểm tra trước khi nhân rộng

1. Ghép nhân vật–đạo cụ–nền trong cùng shot, đúng camera và kích thước thực.
2. So ảnh chính diện, nghiêng, ba phần tư và phía sau; soi cổ tay, vai, hông, bàn chân, lớp áo và mép tóc.
3. Kiểm tra chăn sau modifier nằm ngoài nệm/viền, đáy vật trên mặt đỡ, tựa ghế hướng về người ngồi. Mesh kín không tự chứng minh không xuyên nhau.
4. Xem animatic cầm–thả, đi–dừng, ngồi–đứng và thay che khuất. Chỉ báo phần đã kiểm chứng; giữ ảnh preview đúng phiên bản nguồn.

Nhận diện riêng xem [hướng nhân vật series](../episodes/hem-co-chuyen/THIET-KE-NHAN-VAT.md); nguồn từng món ở ASSET của tập. Không tự thay thiết kế các hồ sơ trước.
