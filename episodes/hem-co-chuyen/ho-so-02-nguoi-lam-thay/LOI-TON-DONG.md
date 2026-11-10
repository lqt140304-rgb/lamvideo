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
| Nhỏ | Dáng nằm `lie`, ngồi thấp `sitLow` | `lie` là rig đứng xoay phẳng quanh đỉnh đầu, đã nhận ánh sáng cửa sổ (hướng xoay theo thân). Tay/chân giơ ra đều nhấc khỏi mặt nệm, nên tay với điện thoại là nét vẽ riêng từ khớp vai. Mới đặt cho góc wide (A01–A02); góc khác cần chỉnh lại góc xoay và điểm neo. `sitLow` làm lại riêng (đùi dốc nhẹ, bàn chân ra trước, tay gác gối), xem [bảng](assets/thiet-ke/dang-ngoi-thap.png); chính diện chưa gập được chân về phía máy. Tay: gần máy đặt dọc đùi, xa buông bên hông. Đã dựng lại demo với dáng mới |
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
| Nhỏ | Hành lang và ngoài trời | Đã dựng (10/11): ngoài cửa sổ là dãy nhà ống phố Việt (ban công, máy lạnh, bồn inox, dây điện, toà cao tầng xa); ngoài cửa ra vào là sân và dãy trọ hai tầng đối diện (cửa sắt, song cửa sổ, số phòng, lan can, đồ phơi, mái tôn). Thêm góc `corridor` nhìn xiên dọc hành lang có lan can ([xem](assets/boi-canh/ngoai-troi-pho-day-tro.png)). Góc `hallway` cũ giữ khung theo DUNG-CANH nên vẫn không thấy phía ngoài lan can; bản tối chưa có đèn hành lang riêng |
| Nhỏ | Ghế ở vị trí `bed` | Che một phần bình nước ở toàn phòng |

## Dựng phim

| Mức | Việc | Chi tiết |
|---|---|---|
| Nhỏ | Demo Cảnh 1 (`canh-01-demo.tsx`) | Đã có: nằm toàn thân có ánh sáng, một tấm chăn có bề dày rủ xuống nệm, cáp sạc nối tới ổ cắm, điện thoại nằm trên mặt nệm; ngồi thấp; nét mặt chuyển dần; đứng dậy sát ghế. Còn: giường trống ở A03–A05 dùng chăn cuộn của phòng (đọc như chăn bị hất ra, chưa khớp hình dạng tấm chăn lúc nằm); ghế chưa xê dịch khi va; sau khi trùm chăn chỉ có nhịp thở Máy và dựng (10/11): A01 dolly thật nối liền A02 đẩy vào cận; A02→A03 tối qua đen; A03 giật zoom lúc nhận mặt; A04 và A05R (người kia đáp) là góc qua vai Nam từ máy bếp lùi ra; cầm tay rung nhẹ; khung 2:1, tối góc, hạt phim. Chưa có âm thanh để đặt điểm cắt theo nhịp thoại; góc qua vai mới dùng một vị trí máy Thêm A02B (66 frame) thức dậy: hất chăn, ngồi dậy xoay quanh hông, lết ra mép nệm, nối cắt vào A03; mấy frame đầu chân còn thò khỏi mép nệm khi chưa kịp co A02B kéo dài 5 giây: hất chăn, ngồi dậy lờ đờ, vươn một tay + ngáp (máy cận mặt), dụi mắt, cau mặt lết ra mép nệm. Tay xa của rig không giơ cao hơn ngang vai nên vươn vai chỉ một tay |
| Nhỏ | Không viền (chốt 10/11) | Mặc định rig là `outline: none` (cả bảng mẫu và phim); `ink`/`tint` vẫn chọn được. Tách lớp bằng màu tô sẵn: tay xa, chân sau tối 20%, cẳng tay đè trước sáng 7% (không dùng CSS filter vì làm render chậm). Đế dép/giày và đạo cụ cầm tay vẫn giữ nét của chúng |
| Nhỏ | Ánh sáng | Viền sáng đã co vào trong đường bao, không còn làm nhòa/đứt nét mực (10/11). Nét vẽ bên trong (viền tay áo) sát mép vẫn có thể bị sáng phủ nhẹ; chân trước chân và tay sau thân chưa soi riêng ở góc nghiêng/sau lưng |

Chưa có storyboard, giọng hay timeline chính thức cho Hồ sơ 2. Đoạn comic thử và âm thanh (`comic.tsx`, `sound.cjs`, `what-if-studio/public/ho-so-02-nguoi-lam-thay/`) chỉ ở máy, không đưa lên repo.

`assets/rig/` là rig cũ, giữ để đối chiếu. Các bảng hình trong đó vẫn là tạo hình cũ.
