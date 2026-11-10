# Hồ sơ 2 — Lỗi và việc còn tồn đọng

Cập nhật 10/11/2026, sau khi đối chiếu main `2a1cf22` và phần sửa truyện trong phiên tách. Làm xong mục nào thì xóa mục đó. Mục tiêu dựng hiện tại nằm ở [README](README.md), bản lời ở [THAO-LUAN-CANH.md](THAO-LUAN-CANH.md).

## Trạng thái bản nguồn

Đã tích hợp phần Claude sửa trong phiên tách, sửa chuỗi ghế và làm rõ bản nháp riêng. Nốt ruồi Người Kia đổi bên theo chốt gương mới; A–H dùng áo ngủ xám cho Nam, áo xanh cho Người Kia. Xem [căn cứ và kết quả rà](RA-SOAT-SUA-TRUYEN.md). Bản làm dở ở worktree gốc được giữ nguyên; không gộp đè lại toàn bộ bốn file cũ lên main.

Danh sách dưới là công việc còn làm hoặc còn phải kiểm chứng khi dựng. Nhãn mức chỉ mức ưu tiên; mục “chưa soi/chưa xem” không phải lỗi đã được chứng minh. Không cần hỏi lại việc đổi màu mặc định thư viện: dùng biến thể áo theo cảnh.

## Nhân vật

| Mức | Việc | Chi tiết |
|---|---|---|
| Vừa | Dáng `crouch` | Chưa làm lại, phần chân còn rối |
| Vừa | Bốn dáng `wary`, `phone`, `offer`, `type` | Mới dựng và soi ở góc 3/4; góc khác chưa kiểm tra |
| Vừa | Tay khi bước ở 3/4 trái và 1/4 | Ở pha hai tay vung vào giữa, tay chỉ hơi mở ra nên trông cứng hơn 3/4 phải |
| Nhỏ | Mũi 3/4 khi mắt mở to | Dáng sốc, sợ thì vòng mắt có thể chạm mũi |
| Nhỏ | Dáng nằm `lie`, ngồi thấp `sitLow` | Đã có (10/11). `lie` là rig đứng xoay phẳng 87° quanh đỉnh đầu ở góc wide: tay/chân giơ ra đều nhấc khỏi mặt nệm, nên tay với điện thoại ở A02 là nét vẽ riêng từ khớp vai; chưa có bản nằm cho góc máy khác, chưa nhận ánh sáng. `sitLow` mới soi ở 3/4 trái |
| Vừa | Nét mặt phân mức (`face`) | Ghép bộ cartoon-soft cho đầu chính diện/3/4; góc nghiêng, 1/4, sau lưng vẫn dùng `mood`. Mắt thư viện nhỏ hơn mắt gốc của Nam; lớp màu sợ hãi (tím dưới mắt) dễ đọc thành vết bầm dưới ánh sáng ấm — cần chủ repo duyệt mức đậm. Đổi nét đang cắt cứng, chưa nội suy |
| Nhỏ | Miệng góc nghiêng | Đã làm lại (10/11): hàm hạ mở khe giữa hai môi, lòng miệng nằm sau da; nét khép nằm trong má. Xem [bảng](assets/thiet-ke/mieng-nghieng.png). Khe còn nhỏ ở mức hé, chưa có lưỡi |
| Chưa soi | Khung miệng lúc nói, Người Kia | Chưa kiểm tra riêng ở cận cảnh |

## Bối cảnh

| Mức | Việc | Chi tiết |
|---|---|---|
| Lớn | Tay che/lộ theo mặt bàn và mép bồn | Thân người được xếp lớp, nhưng tay trước mép bàn và thân sau mép bàn cần chia lớp theo shot |
| Lớn | Người đi qua ngưỡng cửa | Thứ tự che đổi theo đường đi, chưa làm |
| Vừa | Dịch máy `move` | Đã test số, chưa xem hình khi máy chạy thật ở C02, E02, H09 |
| Vừa | Cận đạo cụ | Chốt (C05), căn cước (D03), màn hình điện thoại và laptop (D01, E03, G02, H05, H07) cần lớp vẽ riêng; nền chỉ có trang giấy trung tính |
| Vừa | Đạo cụ theo shot | Căn cước, nội dung bài, tin nhắn, báo thức chưa có; ví có sẵn trên bàn |
| Nhỏ | Hành lang | Được nới rộng hơn thực tế để đủ chỗ đứng; không có lan can ở tiền cảnh. Bản tối chưa có đèn hành lang riêng |
| Nhỏ | Ghế ở vị trí `bed` | Che một phần bình nước ở toàn phòng |

## Dựng phim

| Mức | Việc | Chi tiết |
|---|---|---|
| Vừa | Demo Cảnh 1 (`canh-01-demo.tsx`) | Đã sửa 10/11: Nam nằm toàn thân bằng rig, một tấm chăn đi cùng người (đắp ngang ngực, kéo trùm đầu), tay với tắt chuông rồi kéo điện thoại vào chăn; ngồi thấp đúng chiều cao nệm; nét mặt phân mức theo nhịp; tay dụi mắt A04B; đứng cầm máy ngang ngực. Còn: chăn là mảng phẳng, không có nếp rủ qua mép nệm; giường trống ở A03–A05 dùng chăn cuộn cũ của phòng; cáp sạc mất ở A01–A02; sau khi trùm chăn chỉ có nhịp thở; đầu gối chưa chạm ghế thật |
| Nhỏ | Ánh sáng | Mảng tối dùng vật che phía sau cho tay trước thân; chân trước chân và tay sau thân chưa soi riêng ở góc nghiêng/sau lưng |

Chưa có storyboard, giọng hay timeline chính thức cho Hồ sơ 2. Đoạn comic thử và âm thanh (`comic.tsx`, `sound.cjs`, `what-if-studio/public/ho-so-02-nguoi-lam-thay/`) chỉ ở máy, không đưa lên repo.

`assets/rig/` là rig cũ, giữ để đối chiếu. Các bảng hình trong đó vẫn là tạo hình cũ.
