# Asset — tập 01: Tin nhắn chưa gửi

**Chưa tạo media riêng cho tập.** Bảng dưới là kế hoạch bản 2, không phải danh sách file có sẵn. Nguồn lời là [KICH-BAN.md](KICH-BAN.md); sơ đồ, góc nhìn, pose và cue âm ở [DUNG-CANH.md](DUNG-CANH.md). Đã chọn hướng 2.5D ba lớp, chuyển động nhỏ; tạo hình cụ thể và media chưa được sản xuất/duyệt, quyền dùng nguồn tham khảo chưa được xác minh.

| ID | Asset cần có | Yêu cầu giữ nhất quán | Trạng thái |
|---|---|---|---|
| CHAR-DUY | Duy, 26 tuổi | Trang phục, dáng ngồi, vẻ lảng tránh rồi chịu trách nhiệm; không đổi diện mạo giữa cảnh | Chưa tạo |
| CHAR-THAO | Thảo, 32 tuổi | Người chị làm may/chăm mẹ; biểu cảm có sức nặng, không tạo hình thành phản diện một chiều | Chưa tạo |
| CHAR-LOC | Ông Lộc, khoảng 60 tuổi | Chủ tiệm, điềm tĩnh, không dùng vẻ sát nhân để gợi sai câu chuyện | Chưa tạo |
| VO-ME | Giọng mẹ trong ghi âm | Lời mời ăn cơm bình thường, không thêm lời trăn trối; chọn giọng riêng nếu phân vai | Chưa thu/tạo |
| SET-TIEM | Tiệm sửa đồ cuối hẻm | Quầy gỗ, bàn sửa phía sau, kệ bên trái, cửa bên phải; đồng hồ ngừng chạy, đèn bàn vàng | Chưa tạo |
| SET-NHA | Nhà hai chị em | Bàn ăn phía trước, máy may bên trái, bếp phía sau, bàn thờ bên phải | Chưa tạo |
| PROP-DIENTHOAI | Điện thoại trước/sau sửa | Cùng mẫu máy/vết nứt trước sửa; trạng thái đổi đúng cảnh, không thêm thông điệp bí mật | Chưa tạo |
| PROP-ANH | Ảnh giấy ba mẹ con | Lấy từ ví, không từ máy hỏng; không cần dựng hồi tưởng riêng | Chưa tạo |
| PROP-BIENNHAN | Biên nhận giao kèo | Chữ dựng riêng, đúng sự kiện được chọn, còn ở đoạn kết | Chưa tạo |
| AUDIO-TIEM | Quạt, xe máy xa, ghế và thao tác đồ vật | Chất đời thường; nghe thử thư viện trước khi tìm/tạo mới | Chưa chọn file |
| AUDIO-NHA | Âm nền nhà và tủ bếp | Không gợi mẹ hiện về; giữ khoảng yên ở kết | Chưa chọn file |
| VO-CHINH | Giọng kể và lời các vai | Chốt một người đọc hay phân vai; ghi voice/model/take, kiểm tra phát âm và nhịp | Chưa chọn giọng |
| PROP-BUT-VI | Bút và ví Duy | Bút trên giấy khi đưa ra, rời giấy trước khi giấy bị kéo; ví túi trái, chứa ảnh và biên nhận | Chưa tạo |
| PROP-BAT | Hai bát sạch + tủ/mặt bếp | Lấy từng bát, đặt mặt bếp rồi cất lại; đủ hình ngón nắm/đỡ, không chuyển bát ra bàn ăn | Chưa tạo |
| PROP-TUI-KHOA | Túi vải Thảo và chìa khóa | Túi trên đùi tại tiệm; về nhà treo cạnh cửa, lấy khóa trước khi đi ăn | Chưa tạo |
| PROP-CONGTAC | Công tắc đèn bếp | Có vị trí cạnh lối bếp; ngón tay chạm trước tắt đèn; đèn bàn thờ riêng không tắt | Chưa tạo |

## Các lớp và góc cần chuẩn bị

- **Tiệm:** lớp kệ/mép cửa tiền cảnh; quầy và người ở giữa; bàn sửa/đồng hồ/tường xa. Chuẩn bị góc chung phía khách, cận hai người cùng trục, insert mặt quầy và góc bàn sửa. Góc C4-A cần tay gần và mặt Duy xa; không chỉ crop một ảnh toàn cảnh để giả mọi phối cảnh.
- **Nhà:** mép cửa gần; bàn ăn/người giữa; bếp và bàn thờ xa, bàn may bên trái. Có góc toàn từ cửa, trung đôi và góc 3/4 tủ bát C7-C. Đèn bếp và bàn thờ tách trạng thái; chỉ vẽ đủ phần nền sẽ lộ khi người/máy di chuyển.
- **Pose:** Duy ngồi hướng quầy/quay về chị/đứng lấy bát; Thảo đứng–ngồi/siết quai/đẩy ảnh; Lộc kéo giấy/đỡ máy/đặt máy. Tay và đạo cụ có điểm nắm, trạng thái mặt đỡ và thứ tự che khuất theo DUNG-CANH. Chưa có rig/asset riêng thực thi các pose này.
- **Âm thanh:** mã AM-TIEM, FX-GHE, FX-GIAY, FX-MAY, VO-ME, AM-NHA, FX-BAT-KHOA, M1, M2 là danh sách cần chọn, không phải clip đã có. Không tạo tiếng xé/rách hoặc máy may chạy khi hình không có hành động ấy. Ưu tiên file có sẵn/nguồn miễn phí có quyền dùng rõ.

## Ghi khi đã có file

Thêm đường dẫn thật, phiên bản, nguồn/tác giả/công cụ, quyền sử dụng, cảnh dùng, tình trạng duyệt và chi phí phát sinh. Asset riêng lưu dưới `assets/` trong thư mục tập khi cần; media vận hành studio dùng cùng slug theo README của tập. Những bản thử không được chọn ghi rõ hoặc dọn theo phạm vi được giao; không đưa lên thư viện chung chỉ vì đã tạo xong.

Giữ khoảng nghỉ tại timeline theo bản dựng. Nhạc và hình có thể tiếp tục trong khoảng nghỉ, nhưng không cộng thời lượng của chúng thêm lần nữa nếu chạy đồng thời.
