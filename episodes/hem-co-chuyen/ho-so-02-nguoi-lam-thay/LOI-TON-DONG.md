# Hồ sơ 2 — Lỗi và việc còn tồn đọng

Cập nhật 11/11/2026, trên commit `eec2a4f`. Làm xong mục nào thì xóa mục đó. Mục tiêu dựng hiện tại nằm ở [README](README.md), bản lời ở [THAO-LUAN-CANH.md](THAO-LUAN-CANH.md).

## Cần chủ repo quyết định

| Việc | Cần chốt |
|---|---|
| Nốt ruồi của Nam và Người Kia | Kịch bản ghi "đuôi mày trái". Hình hiện đặt bên trái màn hình khi quay 3/4 phải, tức mày phải theo giải phẫu. Chốt mày trái thật hay trái màn hình |
| Các sửa truyện ở phiên tách | Nằm chưa commit trong worktree `hungry-zhukovsky-ff0b82` (`THAO-LUAN-CANH.md`, `DUNG-CANH.md`, `ASSET.md`, `README.md`), chờ duyệt: ảnh gửi Tùng, "Còn đó không?", giờ tối, một chìa khóa. Tách từ `09e7616`, cần gộp với `main` hiện tại nếu duyệt |
| Áo Nam mặc mặc định | Rig mặc định áo xanh. Áo ngủ xám dùng `shirt={PALETTE.nam.sleepShirt}`; chốt có đổi mặc định không |

## Thiếu file

| Việc | Chi tiết |
|---|---|
| Ảnh mẫu các góc quay | Link `goc-quay-mau.png` trong [quy chuẩn thiết kế](assets/thiet-ke/QUY-CHUAN-THIET-KE-SVG.md) đang hỏng. Ảnh chỉ có trong chat; cần lưu vào `assets/thiet-ke/goc-quay-mau.png` |

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
| Nhỏ | Camera toàn phòng | Cao 152 cm để thấy mặt nệm, trong khi A01 của bảng máy ghi ngang tầm người ngồi. Chốt theo cái nào |
| Nhỏ | Hành lang | Được nới rộng hơn thực tế để đủ chỗ đứng; không có lan can ở tiền cảnh. Bản tối chưa có đèn hành lang riêng |
| Nhỏ | Ghế ở vị trí `bed` | Che một phần bình nước ở toàn phòng |

## Dựng phim

Chưa có storyboard, animatic, giọng hay timeline cho Hồ sơ 2. Đoạn comic thử và âm thanh (`comic.tsx`, `sound.cjs`, `what-if-studio/public/ho-so-02-nguoi-lam-thay/`) chỉ ở máy, không đưa lên repo.

`assets/rig/` là rig cũ, giữ để đối chiếu. Các bảng hình trong đó vẫn là tạo hình cũ.
