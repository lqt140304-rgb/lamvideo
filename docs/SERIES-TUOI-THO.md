# Series hoạt hình tuổi thơ: "Bốn đứa đầu ngõ" (tên tạm)

Quyết định của chủ kênh, 05/11/2026: làm thêm một series hoạt hình về tuổi thơ, **chạy song song** với TÓM GỌN. Mỗi tập **60–90 giây**. ChatGPT viết kịch bản (Prompt S), Claude chỉ dựng.

## 1. Cảm xúc và nguyên tắc
- Mỗi tập một ký ức nhỏ, một cảm xúc (vui, tiếc, ấm). Không bi kịch, không người chết, không trách ai.
- Kể bằng đối thoại và hành động, không người dẫn. Không triết lý dài.
- Có nhịp đùa duyên, câu lặp, chi tiết cụ thể. Mỗi tập có một "móc nối" cho tập sau.
- Không dùng cân nặng, ngoại hình làm trò đùa. Không địa danh/thương hiệu/số liệu chưa kiểm chứng trong lời kể.

## 2. Bốn nhân vật cố định
| ID | Hình | Tính cách | Giọng VieNeu (tạm, chưa nghe) |
|---|---|---|---|
| MINH | Mascot hoodie xanh | Hay rủ cả nhóm, ngập ngừng trước điều quan trọng, quan tâm qua việc làm | Hải Đăng |
| BOM | Kính tròn, tóc úp nấm, polo xanh mint | Thật thà, hiểu chậm nửa nhịp, nói thẳng, đùa duyên | Thanh Bình |
| NA | Tóc bob kẹp lệch, áo tím, váy kem | Nhớ chi tiết của nhóm, trêu nhẹ, chắc chắn | Trúc Ly |
| TEO | Áo thể thao cam, tóc nâu vuốt | Nhanh nhẹn, kéo mọi người đi chơi, "chưa tính!" | Minh Đức |

Giữ nguyên mặt, tóc, áo xuyên suốt series. Thời nhỏ/lớn phân biệt bằng đạo cụ (cặp, điện thoại), chữ chú thích và ánh sáng. Giọng giữ cố định, không đổi pitch.

## 3. Dựng (đã có trong repo, nhánh `lon-roi-hen-du-hoi`)
- Cảnh `dialog`: nền ảnh thật + mascot ghép, ô gọi nhóm cho người ở xa, phụ đề theo từng lượt, ảnh tư liệu chèn.
- `tools/voice.py`: `voices` theo nhân vật, `--audition` để nghe thử, từng lượt lưu `voice/lines/<mã>.wav`.
- Sprite: `public/<tập>/cast/` (4 nhân vật × 12 tư thế, 25 đạo cụ), cắt bằng `tools/cut_sheets.py`.
- Nên chuyển `cast/` thành thư mục dùng chung `public/series/` khi tập 2 bắt đầu.

## 4. Mẫu một tập (60–90 giây)
1. Mở (5–8 giây): một hành động hoặc câu gọi ("Minh ơi! Ra chưa?").
2. Thân (40–60 giây): 2–3 cảnh, 12–20 lượt thoại ngắn, một nhịp đùa, một chi tiết nhắc lại.
3. Kết (8–12 giây): một hình ảnh hoặc câu ngắn; có thể một câu hỏi cho người xem (chữ, không đọc).

## 5. Ký ức đề xuất (để ChatGPT chọn, mỗi tập một)
Ô ăn quan và viên sỏi; mất một chiếc dép; trốn ngủ trưa đi bắt ve; mưa ngập đầu ngõ; mượn truyện tranh; đổi bi/ảnh; xem chung một cái TV; ăn kem que dưới nắng; tiếng loa phường buổi sáng; cắm trại sân trường; viết lưu bút; đạp xe chở nhau; "chừa tao một máy" ở quán net.
Tập đã làm (bản dài 4–6 phút): "Lớn rồi, sao hẹn đủ hội khó thế?" — có thể cắt thành 3 tập ngắn theo ba hồi (S01–S04, S05–S07, S08–S11).

## 6. Quyền và nguồn
Ảnh nền thật hiện chỉ để dựng nội bộ, chưa xác minh quyền. Trước khi đăng series công khai cần nguồn ảnh có giấy phép (ảnh tự chụp, ảnh có giấy phép tái sử dụng, hoặc tự vẽ nền). Nhạc tự tạo bằng code.

## 7. Việc còn mở
- Chốt tên series, tên kênh (TÓM GỌN hay kênh riêng).
- Nghe và chốt 4 giọng; nghe thử nhạc nền.
- Quyết định nền: ảnh thật có quyền hay nền vẽ.
- Dựng thử một tập 60–90 giây để chốt nhịp.
