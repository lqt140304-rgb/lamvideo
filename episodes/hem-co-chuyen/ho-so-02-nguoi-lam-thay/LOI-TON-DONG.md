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
| Nhỏ | Dáng nằm `lie`, ngồi thấp `sitLow` | `lie` là rig đứng xoay phẳng quanh đỉnh đầu, đã nhận ánh sáng cửa sổ (hướng xoay theo thân). Tay/chân giơ ra đều nhấc khỏi mặt nệm, nên tay với điện thoại là nét vẽ riêng từ khớp vai. Mới đặt cho góc wide (A01–A02); góc khác cần chỉnh lại góc xoay và điểm neo. `sitLow` mới soi ở 3/4 trái |
| Nhỏ | Nét mặt phân mức (`face`) | Đã phóng to từng mắt quanh tâm (giữ khoảng cách hai mắt) và chuyển dần 4 frame khi đổi nét (`faceFrom`/`faceMix`, giữa chừng thấy hai lớp mờ chồng). Góc nghiêng, 1/4, sau lưng vẫn dùng `mood`. Lớp tím dưới mắt khi sợ chờ chủ repo duyệt mức đậm |
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
| Nhỏ | Demo Cảnh 1 (`canh-01-demo.tsx`) | Đã có: nằm toàn thân có ánh sáng, một tấm chăn có bề dày rủ xuống nệm, cáp sạc nối tới ổ cắm, điện thoại nằm trên mặt nệm; ngồi thấp; nét mặt chuyển dần; đứng dậy sát ghế. Còn: giường trống ở A03–A05 dùng chăn cuộn của phòng (đọc như chăn bị hất ra, chưa khớp hình dạng tấm chăn lúc nằm); ghế chưa xê dịch khi va; sau khi trùm chăn chỉ có nhịp thở |
| Nhỏ | Ánh sáng | Mảng tối dùng vật che phía sau cho tay trước thân; chân trước chân và tay sau thân chưa soi riêng ở góc nghiêng/sau lưng |

Chưa có storyboard, giọng hay timeline chính thức cho Hồ sơ 2. Đoạn comic thử và âm thanh (`comic.tsx`, `sound.cjs`, `what-if-studio/public/ho-so-02-nguoi-lam-thay/`) chỉ ở máy, không đưa lên repo.

`assets/rig/` là rig cũ, giữ để đối chiếu. Các bảng hình trong đó vẫn là tạo hình cũ.
