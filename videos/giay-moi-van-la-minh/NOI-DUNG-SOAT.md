# Giày mới. Vẫn là mình. — bản xem thử 2 (độc thoại)

Nguồn: `CLAUDE_Giay_moi_van_la_minh_v1.md` (ChatGPT, 05/11/2026). Tuyến độc lập, không thay kế hoạch series tuổi thơ.

**Thay đổi so với bản 1 (theo yêu cầu 'độc thoại, một người kể, nhân vật diễn theo'):** chỉ một giọng kể là Tèo (`NARR`, giọng Minh Đức). Minh, Bờm, Na không có tiếng; họ chỉ diễn (ngồi, đi, nghe điện thoại). Mọi câu thoại gốc được đưa vào lời kể ngôi thứ nhất ('tao'), giữ nguyên chữ của đoạn trích dẫn; **các cụm nối như 'Nó trêu:', 'Minh hỏi:' là do Claude thêm** để người nghe biết ai nói — ChatGPT cần duyệt lại. Cột `Nguồn` ghi mã lượt gốc.

Tổng 642 từ lời kể (ước tính thời lượng thực ~3–4 phút, **dài hơn một short thường**; chưa có giọng thật để đo).

## Pose mới (từ 2 sheet vừa gửi)
- Tèo: `sleep`, `box`, `hold`, `tie`, `bow` (cúi buồn), `look` (cúi nhìn giày bẩn, cười). Chưa dùng `hold`/`look` ở mọi cảnh; `tie` ở S07B vẫn là giày sạch (sheet không có bản bẩn).
- Minh (bộ mới, thay bộ mascot trong video này): `sit`, `sitTalk`, `sitLook`, `stand` (đút túi), `walk`, `phone`.
- Tách nền tự động (`tools/cut_giay_poses.py`); quần đen đã kéo lại về đen, có thể còn viền sáng mảnh.

## Lời kể

| Cảnh | Mã | Lời | Nguồn lượt gốc |
|---|---|---|---|
| S01A | S01A_NARR_01 | Tao cứ tưởng mua đôi giày này… | S01_TEO_01 |
| S01A | S01A_NARR_02 | …sáng hôm sau tao sẽ thành một đứa khác. | S01_TEO_01 |
| S01C | S01C_NARR_01 | Bảy ngày sau, Minh ghé chơi. Nó nhìn đôi giày, rồi hỏi: Giày mới à? Tao cười chữa ngượng: Ừ. Mới được một tuần rồi. | S01_MINH_01, S01_TEO_02 |
| S02 | S02_NARR_01 | Một tuần trước, Na gọi hỏi tao: Mày đặt gì mà ba gói thế? | S02_NA_01 |
| S02 | S02_NARR_02 | Tao khoe liền: Giày. Bình nước. Cái đồng hồ nữa. Lần này tao tập nghiêm túc. | S02_TEO_01 |
| S02 | S02_NARR_03 | Nó trêu: Đặt lịch chạy chưa? Tao khựng một chút, rồi nói tiếp: Mai. Đồ đến là bắt đầu. | S02_NA_02, S02_TEO_02 |
| S02 | S02_NARR_04 | Hộp mở ra, tao ngồi bệt xuống sàn. | Claude thêm |
| S02 | S02_NARR_05 | Tao buộc thử dây giày, đeo thử đồng hồ. Ngắm mình qua điện thoại, tự nhiên thấy tự tin hơn một chút. | Claude thêm |
| S02 | S02_NARR_06 | Tao nói với Na, chậm lại: Tao thích cái cảm giác sáng dậy đã làm được gì đấy… chứ không phải mở mắt ra đã thấy muộn. | S02_TEO_03 |
| S02 | S02_NARR_07 | Na bớt đùa. Nó bảo: Ừ. Hôm nào đi rồi kể tao nghe. | S02_NA_03 |
| S03A | S03A_NARR_01 | Sáng đầu tiên, báo thức kêu. Tao ngái ngủ: Năm phút nữa… | S03_TEO_01 |
| S03B | S03B_NARR_01 | Sáng thứ hai, tao vừa làm xong việc muộn hôm trước, nhìn giờ rồi đổi báo thức: Mai ngủ đủ rồi đi. | S03_TEO_02 |
| S03C | S03C_NARR_01 | Sáng thứ ba, tao dậy rồi. Nhưng lướt thấy ảnh chạy của người khác, tao nhìn mình trong gương, nghĩ rất nhỏ: Ra đấy chạy được một tí rồi đứng thở… Bờm nhắn: Chiều cà phê không? Tao gõ lại: Để xem đã. | S03_TEO_03 |
| S04 | S04_NARR_01 | Hôm Minh ghé, nó hỏi bình thường thôi: Tuần này bận à? Tao né trước: Cũng không đến mức đấy. | S04_MINH_01, S04_TEO_01 |
| S04 | S04_NARR_02 | Rồi tao nói thật, mắt nhìn xuống: Có hôm tao dậy rồi. Mặc áo rồi… cuối cùng vẫn ngồi lại. | S04_TEO_02 |
| S04 | S04_NARR_03 | Nó hỏi: Vì sao? Tao lúng túng: Tao cũng không biết. Cứ nghĩ ra đấy ai cũng chạy ngon lành. Còn tao mới tí đã mệt. | S04_MINH_02, S04_TEO_03 |
| S04 | S04_NARR_04 | Minh trêu rất nhẹ: Mày mới mua giày. Có đăng ký thi với ai đâu. Tao cười thoáng, rồi im. | S04_MINH_03 |
| S04 | S04_NARR_05 | Tao thành thật: Lúc bấm mua, tao tưởng tượng được hết. Sáng dậy sớm này, chạy xong về này… thấy mình khác hẳn. | S04_TEO_04 |
| S04 | S04_NARR_06 | Xong đồ về rồi… tao vẫn là tao. | S04_TEO_05 |
| S04 | S04_NARR_07 | Minh không nói ngay. Một lúc sau, nó hỏi: Tối nay mày có việc gì không? Tao ngẩng lên: Không. Sao? Nó thản nhiên: Đi cùng tao một đoạn. Xuống dưới rồi tính. | S04_MINH_04, S04_TEO_06, S04_MINH_05 |
| S05A | S05A_NARR_01 | Ra công viên, tao đi sau, nói nhỏ: Tao đi chậm đấy. Minh bảo: Ừ. Tao có hẹn ai đuổi đâu. | S05_TEO_01, S05_MINH_01 |
| S05B | S05B_NARR_01 | Tụi tao thử chạy rất ngắn. Rồi tao chậm lại, thở nhẹ giữa câu: Đi bộ một tí nhé. Minh chỉ đáp: Ừ. | S05_TEO_02, S05_MINH_02 |
| S05C | S05C_NARR_01 | Điện thoại rung. Bờm gọi nhóm, Na cũng ở trong cuộc gọi. Bờm hỏi: Hai đứa đi đâu thế? Tao ngại cười: Ra công viên. Mà đi bộ là chính. | S05_BOM_01, S05_TEO_03 |
| S05C | S05C_NARR_02 | Bờm tỉnh bơ: Thế có ghế không? Lần sau tao ra ngồi đợi. Na trêu lại: Mày vừa đến đã đòi ngồi. Bờm thật thà: Thì đợi chúng nó đi xong rồi đi cùng. | S05_BOM_02, S05_NA_01, S05_BOM_03 |
| S05C | S05C_NARR_03 | Tao cười tự nhiên. Na hỏi tao, giọng ấm: Ngoài đấy mát không? Tao nhìn lên cây, lần đầu thấy thư giãn: Ừ. Mát. | S05_NA_02, S05_TEO_04 |
| S06 | S06_NARR_01 | Hai đứa dừng cạnh bồn cây. Tao cúi nhìn đế giày dính đất, hơi tiếc: Bẩn rồi. Minh cười nhẹ: Ừ. Hôm nay dùng rồi mà. | S06_TEO_01, S06_MINH_01 |
| S06 | S06_NARR_02 | Tao nhẹ nhõm: Tao cứ sợ mua xong lại bỏ đấy. Nó bảo: Thì hôm nay mày đã mang nó ra đây rồi. | S06_TEO_02, S06_MINH_02 |
| S07A | S07A_NARR_01 | Sáng hôm sau, báo thức lại vang. Vẫn khó dậy như cũ. Tin Minh hiện lên: Tao xuống rồi. Mày dậy chưa? Tao nói nhỏ, còn ngái ngủ: Đợi tao hai phút. | S07_TEO_01 |
| S07B | S07B_NARR_01 | Tao buộc dây đôi giày đã có vết đất. Bờm nhắn: Có ai đợi tao không? Na thả biểu tượng vẫy tay. | S07_MINH_01, S07_TEO_02 |
| S07B | S07B_NARR_02 | Tao mở cửa. Minh đứng đó hỏi: Hôm nay chạy không? Tao cười, vẫn còn ngái ngủ: Cứ đi đã. | S07_MINH_01, S07_TEO_02 |

## Việc còn mở
- Giọng Minh Đức chưa nghe (chạy `npm run voice -- giay-moi-van-la-minh --audition`).
- Độ dài thật chưa biết; cần quyết định cắt bớt.
- Chưa chạy typecheck; chưa render có tiếng.
- Ảnh nền: ảnh thật, quyền chưa kiểm — chỉ dùng nội bộ.
