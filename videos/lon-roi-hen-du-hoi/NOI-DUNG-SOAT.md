# Lớn rồi, sao hẹn đủ hội khó thế? — Bản 2 (4 nhân vật)

Nguồn kịch bản: `Claude_Kich_ban_Hoi_ban_4_giong_v2.md` (ChatGPT, 05/11/2026). Lời thoại giữ nguyên chữ của kịch bản.

## Giọng (chọn từ danh sách VieNeu; CHƯA nghe thử)

| Nhân vật | Giọng | Ghi chú |
|---|---|---|
| MINH | Hải Đăng | nam trẻ trung trầm, ấm |
| BOM | Thanh Bình | nam trung cao, tròn, thong thả |
| TEO | Minh Đức | nam sáng, nhanh, rõ phụ âm |
| NA | Trúc Ly | nữ trung, sáng, bình tĩnh |

Nghe thử: `npm run voice -- lon-roi-hen-du-hoi --audition` (in danh sách giọng có thật; tên nào không có sẽ báo `!`). Muốn đổi thì sửa `voices` trong `script.json`.

## Danh sách lượt thoại

| Cảnh | Mã lượt | Người nói | Giọng | Lời |
|---|---|---|---|---|
| S01 | S01_MINH_01 | MINH | Hải Đăng | Cuối tuần này về được không chúng mày? Lâu rồi chưa ngồi đủ bốn đứa. |
| S01 | S01_TEO_01 | TEO | Minh Đức | Tao xem lịch ca đã. Tối thứ Bảy có khi phải làm. |
| S01 | S01_BOM_01 | BOM | Thanh Bình | Đợi tao chút… đang ru con ngủ. |
| S01 | S01_NA_01 | NA | Trúc Ly | Tuần này tao chưa về được. Thứ Hai phải có mặt sớm. |
| S02 | S02_TEO_01 | TEO | Minh Đức | Minh ơi! Ra chưa? Nắng tắt bây giờ! |
| S02 | S02_MINH_01 | MINH | Hải Đăng | Đây đây! Tao tìm cái dép. |
| S02 | S02_BOM_01 | BOM | Thanh Bình | Dép mày đi hai chiếc khác nhau kìa. |
| S02 | S02_MINH_02 | MINH | Hải Đăng | Đi được là được. Chơi gì? |
| S02 | S02_NA_01 | NA | Trúc Ly | Ô ăn quan. Tao nhặt đủ sỏi rồi. |
| S02 | S02_TEO_02 | TEO | Minh Đức | Bờm đếm nhé. Lần này đừng tính cả viên tao đang cầm. |
| S02 | S02_BOM_02 | BOM | Thanh Bình | Tại mày cứ giấu trong tay chứ! |
| S03 | S03_TEO_01 | TEO | Minh Đức | Còn sớm. Qua net làm vài ván không? |
| S03 | S03_NA_01 | NA | Trúc Ly | Một tiếng thôi nhé. Tao còn về phụ mẹ. |
| S03 | S03_MINH_01 | MINH | Hải Đăng | Ừ. Ai bảo ván cuối thì đứng dậy trước. |
| S03 | S03_BOM_01 | BOM | Thanh Bình | Tao còn có ít tiền… |
| S03 | S03_TEO_02 | TEO | Minh Đức | Cứ đi. Thiếu tao bù. |
| S03 | S03_TEO_03 | TEO | Minh Đức | Đột Kích nhé? Minh, vào cùng đội! |
| S03 | S03_MINH_02 | MINH | Hải Đăng | Ừ. Chừa tao một máy! |
| S03 | S03_BOM_02 | BOM | Thanh Bình | Khoan, tao chưa vào phòng! |
| S03 | S03_NA_02 | NA | Trúc Ly | Tao chơi Audition. Lát đừng đứng sau chê tao trượt nhịp đấy. |
| S03 | S03_TEO_04 | TEO | Minh Đức | Không chê. Bọn tao chỉ nhắc hơi to thôi. |
| S04A | S04_MINH_01 | MINH | Hải Đăng | Tèo, mày bảo ván cuối hai lần rồi đấy. |
| S04A | S04_TEO_01 | TEO | Minh Đức | Thì ván vừa rồi chưa tính. Bờm còn chưa kịp chơi. |
| S04A | S04_BOM_01 | BOM | Thanh Bình | Tao chơi rồi. Tao thua thôi. |
| S04B | S04_NA_01 | NA | Trúc Ly | Thôi về. Mai ra tiếp. Mẹ tao gọi rồi. |
| S04B | S04_TEO_02 | TEO | Minh Đức | Mai chỗ cũ nhé? |
| S04B | S04_NA_02 | NA | Trúc Ly | Ừ. |
| S04B | S04_BOM_02 | BOM | Thanh Bình | Minh nhớ đổi lại dép. |
| S04B | S04_MINH_02 | MINH | Hải Đăng | Biết rồi! |
| S05 | S05_MINH_01 | MINH | Hải Đăng | Thế Chủ nhật? Sáng hay chiều đều được. |
| S05 | S05_BOM_01 | BOM | Thanh Bình | Sáng tao đưa con đi khám định kỳ. Chiều chắc rảnh, để tao hỏi lại. |
| S05 | S05_TEO_01 | TEO | Minh Đức | Chiều Chủ nhật tao đổi ca không được. Nếu thứ Bảy thì sau tám giờ. |
| S05 | S05_NA_01 | NA | Trúc Ly | Tám giờ thì tao phải ra xe rồi. Chuyến cuối về lại thành phố đấy. |
| S05 | S05_MINH_02 | MINH | Hải Đăng | Ừ… vậy để dịp khác. |
| S06 | S06_MINH_01 | MINH | Hải Đăng | Tèo, tối nay làm một ván không? Bờm vừa online. |
| S06 | S06_TEO_01 | TEO | Minh Đức | Tao chưa tan. Chúng mày chơi đi. |
| S06 | S06_BOM_01 | BOM | Thanh Bình | Tao có nửa tiếng. Chờ tao cắm tai nghe. |
| S06 | S06_NA_01 | NA | Trúc Ly | Ngày xưa tao bảo về là có đứa giấu cặp tao. Giờ hẹn nửa tiếng cũng phải tranh thủ. |
| S06 | S06_MINH_02 | MINH | Hải Đăng | Thủ phạm đang làm ca, chưa vào được. |
| S06 | S06_BOM_02 | BOM | Thanh Bình | Ê… chắc tao phải out. Con tao dậy rồi. |
| S06 | S06_MINH_03 | MINH | Hải Đăng | Ừ, lo cho cháu đi. Hôm khác chơi. |
| S06 | S06_BOM_03 | BOM | Thanh Bình | Tao vừa mới vào… |
| S06 | S06_NA_02 | NA | Trúc Ly | Có nghe được giọng rồi. Đi đi. |
| S07 | S07_NA_01 | NA | Trúc Ly | Ê, tao tìm thấy cái này trong máy cũ. |
| S07 | S07_TEO_01 | TEO | Minh Đức | Trời ơi. Tóc tao hồi đấy như cái chổi! |
| S07 | S07_BOM_01 | BOM | Thanh Bình | Ủa, sao ảnh có mỗi ba đứa? Minh đâu? |
| S07 | S07_MINH_01 | MINH | Hải Đăng | Tao đứng chụp. Chụp xong chúng mày kéo đi luôn. |
| S07 | S07_NA_02 | NA | Trúc Ly | Ờ đúng rồi. Hôm đấy còn bảo lần sau nhờ người chụp đủ bốn. |
| S07 | S07_MINH_02 | MINH | Hải Đăng | Mà… lần gần nhất đủ cả bốn đứa là hôm nào nhỉ? |
| S07 | S07_TEO_02 | TEO | Minh Đức | Hôm chia tay Na đi làm xa? |
| S07 | S07_BOM_02 | BOM | Thanh Bình | Hôm đấy tao về sớm… |
| S07 | S07_NA_03 | NA | Trúc Ly | Để tao tìm. |
| S07 | S07_NA_04 | NA | Trúc Ly | Hồi ấy cứ tưởng mai lại gặp… chụp lệch cũng chẳng chụp lại. |
| S07 | S07_MINH_03 | MINH | Hải Đăng | Ừ. |
| S08 | S08_TEO_01 | TEO | Minh Đức | Thứ Bảy này tao đổi ca được rồi. Bảy giờ tối, sân cầu gần trường cũ. Tao đặt nhé? |
| S08 | S08_MINH_01 | MINH | Hải Đăng | Tao đi. |
| S08 | S08_BOM_01 | BOM | Thanh Bình | Tao lâu không cầm vợt. Đánh hụt đừng cười. |
| S08 | S08_TEO_02 | TEO | Minh Đức | Cười thì vẫn cười. Nhưng cứ đến. |
| S08 | S08_NA_01 | NA | Trúc Ly | Chúng mày đi trước nhé. Tao chưa dám hứa. Có gì tao nhắn. |
| S08 | S08_MINH_02 | MINH | Hải Đăng | Ừ. Về được thì gọi. Đừng chạy vội. |
| S09 | S09_BOM_01 | BOM | Thanh Bình | Ê! Chừa tao một chỗ! |
| S09 | S09_TEO_01 | TEO | Minh Đức | Có chỗ rồi. Mày cứ vào. |
| S09 | S09_MINH_01 | MINH | Hải Đăng | Hôm nay đi đúng hai chiếc dép rồi đấy. |
| S09 | S09_BOM_02 | BOM | Thanh Bình | Giày nhé. Tao chuẩn bị hẳn hoi. |
| S09 | S09_BOM_03 | BOM | Thanh Bình | Tao đã dặn là đừng cười! |
| S09 | S09_TEO_02 | TEO | Minh Đức | Thêm quả nữa. Quả vừa rồi chưa tính. |
| S10 | S10_NA_01 | NA | Trúc Ly | Bọn mày đánh sân nào? Tao đến cửa rồi. |
| S10 | S10_TEO_01 | TEO | Minh Đức | Na! Bên này! |
| S10 | S10_BOM_01 | BOM | Thanh Bình | Mày bảo chưa về được mà? |
| S10 | S10_NA_02 | NA | Trúc Ly | Xong việc sớm. Tao đi chuyến chiều. Điện thoại gần hết pin nên chưa nhắn. |
| S10 | S10_MINH_01 | MINH | Hải Đăng | Thế đủ rồi. Hai đôi nhé. |
| S10 | S10_NA_03 | NA | Trúc Ly | Đợi tao thay giày đã. Vừa gặp đã bắt chạy. |
| S11 | S11_MINH_01 | MINH | Hải Đăng | Nào, sát vào. Lần này tao cũng ở trong ảnh. |
| S11 | S11_BOM_01 | BOM | Thanh Bình | Thấy hết chưa? |
| S11 | S11_NA_01 | NA | Trúc Ly | Thấy rồi. Đủ bốn. |
| S11 | S11_TEO_01 | TEO | Minh Đức | Buổi sau chỗ cũ nhé? |
| S11 | S11_BOM_02 | BOM | Thanh Bình | Ừ. Để tao xem lịch… nhưng tao muốn đi. |
| S11 | S11_NA_02 | NA | Trúc Ly | Biết trước thì nhắn tao sớm. |
| S11 | S11_MINH_02 | MINH | Hải Đăng | Ừ. Tao nhắn. |

File giọng từng lượt: `public/lon-roi-hen-du-hoi/voice/lines/<mã lượt>.wav` (sinh khi chạy voice). SRT/VTT chỉ tạo được sau khi có thời lượng thật từ voice.

## Cảnh → nền/asset → quyền ảnh

| Cảnh | Nền | Chèn thêm | Tình trạng |
|---|---|---|---|
| S01 | BG05_phong_tro.jpg | — | ảnh báo chí: CHƯA xác minh quyền, chỉ dựng nội bộ |
| S02 | BG03_san_nha.jpg | PLAY02_o_an_quan.jpg, PLAY01_nhay_day.jpg | ảnh báo chí: CHƯA xác minh quyền, chỉ dựng nội bộ |
| S03 | BG02_san_truong.jpg | NET01_tiem_net.jpg, AU01_audition.jpg | ảnh báo chí: CHƯA xác minh quyền, chỉ dựng nội bộ |
| S04A | NET01_tiem_net.jpg | — | ảnh báo chí: CHƯA xác minh quyền, chỉ dựng nội bộ |
| S04B | BG03_san_nha.jpg | — | ảnh báo chí: CHƯA xác minh quyền, chỉ dựng nội bộ |
| S05 | BG05_phong_tro.jpg | — | ảnh báo chí: CHƯA xác minh quyền, chỉ dựng nội bộ |
| S06 | BG05_phong_tro.jpg | — | ảnh báo chí: CHƯA xác minh quyền, chỉ dựng nội bộ |
| S07 | BG05_phong_tro.jpg | anh-ba-nguoi.jpg, anh-ba-nguoi.jpg | ảnh báo chí: CHƯA xác minh quyền, chỉ dựng nội bộ |
| S08 | BG05_phong_tro.jpg | — | ảnh báo chí: CHƯA xác minh quyền, chỉ dựng nội bộ |
| S09 | BG04_san_cau.jpg | — | ảnh báo chí: CHƯA xác minh quyền, chỉ dựng nội bộ |
| S10 | BG04_san_cau.jpg | — | ảnh báo chí: CHƯA xác minh quyền, chỉ dựng nội bộ |
| S11 | BG04_san_cau.jpg | anh-bon-nguoi.jpg | ảnh báo chí: CHƯA xác minh quyền, chỉ dựng nội bộ |

Anh `anh-ba-nguoi.jpg`, `anh-bon-nguoi.jpg` là ảnh hư cấu ghép từ BG02 + mascot (`tools/make_photos.py`). Chi tiết nguồn: `public/lon-roi-hen-du-hoi/img/credits.json`. Không đăng công khai khi chưa có quyền.

## Chi tiết phải nối đúng (đã dựng)
- Dép lệch S02 → S04 nhắc dép → S09 đi giày.
- "Chừa tao một máy" S03 → "Chừa tao một chỗ" S09.
- "Chưa tính" của Tèo S04 → S09.
- Ảnh ba người (Minh đứng chụp) S07 → ảnh đủ bốn S11.
- Na không hứa ở S08 → đến ở S10 (chỉ xuất hiện sau lượt S10_NA_01 qua điện thoại).

## Chưa kiểm chứng
- Giọng, nhạc chưa nghe; thời lượng thật chưa đo (ước lượng khoảng 4 phút, kịch bản dự kiến 5–6 phút).
- Chưa có MP4 có tiếng; chưa chạy typecheck (container không có npm).
- Nền S04A dùng ảnh quán net phóng to, mờ; mascot không đứng đè người thật nhưng nền vẫn có người.
- Hồi 1: S01–S04, hồi 2: S05–S07, hồi 3: S08–S11.
