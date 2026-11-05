# Phân công: ChatGPT nghiên cứu và viết kịch bản, Claude chỉ dựng video

Bạn là người chuyển thông tin qua lại giữa hai bên.

- **ChatGPT:** nghiên cứu, tìm ảnh, **viết kịch bản** (lời đọc, chữ trên hình, gợi ý cảnh), soát nội dung.
- **Claude:** dựng video từ kịch bản đã có (`script.json`, hoạt hình, thời gian, lint, xem thử), sửa lỗi dựng. Claude không tự nghiên cứu, không tự viết lại nội dung. Chỉ sửa chữ khi lỗi hiển thị, lỗi phát âm hoặc theo góp ý bạn chuyển sang.

## Vòng làm việc (7 bước)
1. Bạn chọn chủ đề, dán **Prompt A** cho ChatGPT (bật tìm kiếm web / Deep research).
2. ChatGPT trả về **Gói nghiên cứu** đúng mẫu bên dưới.
3. Bạn dán gói đó vào **Prompt K** để ChatGPT viết **Kịch bản** theo đúng mẫu.
4. Bạn dán Kịch bản cho Claude kèm một dòng: "dựng video từ kịch bản này, slug: <tên-video>".
5. Claude chuyển thành `script.json` + `sources.md`, chạy `npm run lint`, xem ảnh chụp từng cảnh, đẩy lên GitHub. Bạn `git pull` và `npm run make -- <slug>`.
6. Bạn gửi lại **nội dung chữ của video** cho ChatGPT cùng **Prompt B** để soát lần cuối.
7. Bạn dán góp ý cho Claude để sửa, rồi render lại.

Claude chỉ dùng những gì có trong gói và kịch bản (đã có link và giấy phép). Thiếu gì Claude sẽ nói rõ và hỏi lại ChatGPT qua bạn.

## Hướng nội dung: trẻ trung, gần đời sống
Quan sát của chủ kênh: nội dung trẻ trung, năng động thu hút người xem hơn tin tức thuần. Vì vậy ưu tiên chủ đề người trẻ đang chơi hoặc đang gặp (thể thao, thuê trọ, tiền tiêu vặt, công nghệ, xu hướng). Chủ đề luật hay thuế vẫn làm, nhưng kể qua tình huống đời thường. Giữ nguyên: nguồn chính thống, số liệu đúng, kết bằng "Tóm lại là…".

## Prompt K: nhờ ChatGPT viết kịch bản (dán kèm Gói nghiên cứu)
```
Dựa CHỈ vào Gói nghiên cứu dưới đây, hãy viết KỊCH BẢN video dọc 9:16, tiếng Việt, 60–100 giây (khoảng 160–280 từ lời đọc nếu ngắn, tối đa khoảng 520 từ nếu làm bản dài), giọng trẻ trung, nhanh, gần gũi, có câu hỏi hoặc câu đùa nhẹ, không giảng bài. Không thêm số liệu ngoài gói. Số liệu chưa xác minh thì bỏ.

QUY TẮC
- Lời đọc (voice): viết số bằng chữ như người đọc (ví dụ "hai trăm nghìn đồng"), ngày tháng đọc rõ. Phụ đề (sub): cùng nội dung nhưng viết số bằng chữ số.
- Câu đầu là tình huống hoặc con số gây tò mò. Không dùng "Khoan đã", "thế này", không lặp câu mẫu của video khác.
- Câu cuối bắt đầu bằng "Tóm lại là…".
- Mỗi cảnh 1 ý. Chữ trên hình ngắn (tối đa khoảng 8 từ mỗi dòng).
- Mốc tương lai ghi "sẽ", giá/lãi suất ghi ngày lấy số liệu.

MẪU TRẢ VỀ: một bảng, mỗi dòng là một cảnh
số | loại cảnh (hook / stat / steps / timeline / chat / list / compare / verdict / myth / receipt / ladder / outro) | lời đọc (voice) | phụ đề (sub) | chữ trên hình (tiêu đề, nhãn, số) | gợi ý hình hoạt hình (1 dòng) | nguồn trong gói (mục/dòng)
Cuối: tổng số từ lời đọc, danh sách điều chưa chắc chắn.
```

## Prompt A: nhờ ChatGPT nghiên cứu (dán, thay phần trong [ ])

```
Hôm nay là [ngày]. Mình làm video ngắn dọc 9:16, dưới 75 giây, tiếng Việt, về chủ đề: [chủ đề].
Hãy nghiên cứu và trả về GÓI NGHIÊN CỨU theo đúng mẫu bên dưới. Bật tìm kiếm web.

QUY TẮC BẮT BUỘC
- Chỉ dùng nguồn chính thức mới nhất: văn bản pháp luật, bộ/ngành, cổng thông tin chính phủ, cơ quan phát hành số liệu. Báo chí chỉ để tìm văn bản gốc. Ưu tiên nguồn đăng trong 30 ngày gần đây. Văn bản bị sửa đổi thì phải dùng bản sửa đổi.
- MỖI con số/ngày/mốc phải có: link, ngày đăng nguồn, trích nguyên văn ngắn (dưới 20 từ), điều kiện áp dụng.
- Không chắc thì ghi "CHƯA XÁC MINH", không đoán, không lấp chỗ trống.
- Phân biệt rõ: mức hưởng vs hóa đơn; thuế bổ sung vs tổng thuế; thu nhập chịu thuế vs lương; mốc tính từ lúc nào; "không phải nộp" vs "không có thủ tục".
- Mốc ở tương lai ghi "sẽ có hiệu lực", mốc đã qua ghi đã hiệu lực. Giá, lãi suất, tỷ giá ghi ngày lấy số liệu.

MẪU TRẢ VỀ
1. Chủ đề một dòng và góc nhìn người xem quan tâm nhất.
2. 3 phương án câu mở đầu (hook), mỗi cái 2 câu: câu 1 là tình huống hoặc con số, câu 2 là thông tin gây tò mò. Không dùng "Khoan đã", "thế này".
3. Bảng SỰ THẬT CỐT LÕI (6–8 dòng, theo thứ tự nên kể): ý | số liệu/mốc | điều kiện | trích nguyên văn | link | ngày đăng nguồn.
4. 1 VÍ DỤ TÍNH bằng số cụ thể, nêu công thức và giả định (độc thân, chưa trừ bảo hiểm, ...).
5. 3 ĐIỀU DỄ NHẦM: hiểu sai là gì | thực tế | nguồn.
6. Ai nên làm gì / ai chưa cần (2–3 ý mỗi bên).
7. CHƯA XÁC MINH / MÂU THUẪN GIỮA CÁC NGUỒN: liệt kê hết.
8. ẢNH THẬT (0–3 ảnh; không có ảnh đúng thì ghi "KHÔNG CÓ ẢNH ĐÚNG", đừng lấy ảnh gần giống): với mỗi ảnh: câu/ý trong video mà ảnh minh họa | mô tả ảnh | link TRỰC TIẾP tới file (.jpg/.png) | link trang gốc | tác giả | giấy phép (CC0, Public Domain, CC BY, CC BY-SA, Pexels/Unsplash/Pixabay License) | năm chụp (từ 2023 trở lên) | độ phân giải. Ảnh phải ĐÚNG với nội dung nó minh họa (đúng đồ vật, đúng loại địa điểm). Không ảnh báo chí có bản quyền, không ảnh người nổi tiếng, không logo/watermark lớn.
9. Danh sách NGUỒN đầy đủ (tên, link, ngày đăng).
```

## Prompt B: nhờ ChatGPT soát video đã dựng

```
Hôm nay là [ngày]. Dưới đây là nội dung chữ (lời đọc và chữ trên hình) của các video mình sắp đăng. Hãy kiểm chứng TỪNG con số, ngày, mốc, điều kiện với nguồn chính thức mới nhất (bật tìm kiếm web). Với mỗi video trả về bảng: Video | Câu trong video | Vấn đề (sai, thiếu điều kiện, dễ hiểu nhầm, lỗi thời, hai con số không khớp) | Cách sửa đề xuất | Link nguồn + ngày. Chỉ báo điều thật sự cần sửa; điều chưa chắc ghi "CHƯA XÁC MINH".

[dán nội dung chữ]
```

Mẹo: để Claude lấy nội dung chữ nhanh, chạy `npm run lint` rồi mở `videos\<slug>\script.json`, hoặc nhờ Claude "xuất nội dung chữ của <slug> để gửi ChatGPT soát".

## Claude cần gì trong gói để dựng nhanh
- Mỗi con số có điều kiện và nguồn (Claude không tự tra lại).
- Ví dụ tính có công thức, để Claude dựng cảnh biên lai hoặc so sánh.
- Ảnh có link trực tiếp + giấy phép + năm chụp. Claude điền thẳng `url` và `credit` vào script, không còn tìm ảnh.
- Danh sách "CHƯA XÁC MINH" để Claude không đưa vào lời đọc, hoặc ghi rõ "theo nguồn X".
