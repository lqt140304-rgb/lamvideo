# Hồ sơ 2 — Lỗi và việc còn tồn đọng

Cập nhật 10/11/2026, sau khi đối chiếu main `2a1cf22` và phần sửa truyện trong phiên tách. Làm xong mục nào thì xóa mục đó. Mục tiêu dựng hiện tại nằm ở [README](README.md), bản lời đủ ba phần dẫn từ [KICH-BAN.md](KICH-BAN.md).


## Bản nháp V1 — việc mới chưa dựng

- Rà/duyệt cơ chế gương và cách Nam giấu người kia với Tùng; hướng kết Nam bị nhốt trong thế giới gương, bị thay thế và để mở đã chốt, không hỏi lại hướng này.
- Kiểm mặt bằng có chỗ gương, hướng phản chiếu, khăn che và đường thoát; giữ một cửa chính.
- Thử đoạn giữ cửa/giằng tay/gương bằng animatic khi được giao, tránh che mất chân/điểm tiếp xúc; kiểm thời gian Tùng tới để không kéo dài tiếng kêu vô lý.
- Kiểm UI ghi/gửi/xóa clip và trạng thái khóa máy, phân biệt file local với file đã gửi; không khẳng định thao tác nếu chưa dựng được rõ.
- Đọc diễn từng phần để đo thời lượng thực; thẻ và mốc phút hiện chỉ là chỉ dẫn. Chưa tạo media hoặc chạy dựng trong lượt viết.


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
| Nhỏ | Dáng nằm | Chưa có dáng nằm toàn thân; đang dùng đầu đặt lên gối qua `sleeper` |
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

Chưa có storyboard, animatic, giọng hay timeline cho Hồ sơ 2. Đoạn comic thử và âm thanh (`comic.tsx`, `sound.cjs`, `what-if-studio/public/ho-so-02-nguoi-lam-thay/`) chỉ ở máy, không đưa lên repo.

`assets/rig/` là rig cũ, giữ để đối chiếu. Các bảng hình trong đó vẫn là tạo hình cũ.
