# Kinh nghiệm dùng chung

File này chỉ lưu nguyên tắc có thể dùng lại để nâng chất lượng và tiết kiệm thời gian, chi phí. Nội dung riêng của một tập thuộc `episodes/<series>/<slug-tap>/GHI-CHU.md`. Không ghi cốt truyện, nhân vật, tiến độ hay hóa đơn riêng ở đây.

## Câu chuyện và nhân quả

- Mỗi biến cố cần nguyên nhân, mỗi quyết định cần hệ quả. Nhân vật biết đến đâu thì hành động đến đó; không biết trước thời lượng tai họa hoặc bí mật chưa được tiết lộ.
- Mỗi nhân vật cần một mong muốn, điều sợ mất, vai trò và hành động tác động đến kết quả. Nếu bỏ họ mà truyện không đổi, hãy gộp vai hoặc cho họ nhiệm vụ thật.
- Trở ngại phải khiến nhân vật lựa chọn, trả giá hoặc đổi cách nhìn. Các nỗi khổ giải thích hành vi gây hại, không xóa trách nhiệm và không buộc người bị hại tha thứ.
- Twist có dấu hiệu từ trước, làm thay đổi cách hiểu và kéo theo hành động. Không cứu truyện bằng luật mới ở cuối, trùng hợp quá tiện hoặc kết thúc “hóa ra là mơ”.
- Vấn đề chính cần được xử lý trong phạm vi tập. Kết mở có thể giữ câu hỏi lớn, nhưng phải cho thấy lựa chọn và hệ quả đã xảy ra. Không cố chia tập chỉ để giữ lời giải làm mồi.
- Nhịp có lên có xuống. Tăng sức ép qua mất mát, thông tin và thời hạn có cơ sở; dành khoảng yên cho phản ứng. Không dùng số lần cắt/phút làm luật cho mọi cảnh.

## Cảm xúc và thoại

- Đặt cảm xúc trong hành động, khoảng cách, vật dụng và cách đối đáp. Lời thoại phải đủ ý để hiểu ai đang cần điều gì; không thay cuộc nói chuyện bằng khẩu hiệu.
- Dùng “vì”, “nếu”, “nhưng”, “nên” khi chúng làm rõ suy nghĩ. Khẩu ngữ và tiếng địa phương dùng vừa phải, thống nhất với nhân vật, không nhại giọng.
- Hài phát sinh từ tính cách hoặc tình huống; không chèn đùa làm mất trọng lượng của tổn thương. Niềm tin và sinh hoạt tinh thần cần đúng bối cảnh.
- Kết bằng một hành động cho thấy thay đổi thường hiệu quả hơn đọc một đoạn đạo lý. Hy vọng không xóa sạch thiệt hại hoặc khiến mọi người lập tức hòa thuận.
- Khoảng nghỉ phải có mục đích và điều để nhìn/nghe. Ghi số giây ở bản dựng; không để TTS đọc chỉ dẫn. Thẻ cảm xúc chỉ là gợi ý cần nghe thử trên model phù hợp.

## Tính hợp lý và hình ảnh

- Mở cảnh phải xác định thời gian, địa điểm, người có mặt, vị trí tương đối, nội thất và tình trạng nơi ở. Khi trạng thái thay đổi, cập nhật mốc có thể nhìn thấy như nước cao tới bậc nào, đồ vật còn hay mất.
- Với thiên tai hay biến cố lớn, xét cả môi trường, động vật, thực vật và hạ tầng nếu chúng làm đổi câu chuyện; không biến lời kể thành danh mục kiến thức.
- Giải thích ngắn nguyên nhân chính. Giữ phần kiểm chứng, giả định và giới hạn trong hồ sơ nghiên cứu. Không đưa toàn bộ nghiên cứu vào thoại.
- Ghi góc/cỡ cảnh, lens tương đương, chuyển động, độ rung, focus và âm thanh để dựng được. Với hoạt hình, thông số máy quay là ý đồ hình ảnh, không phải thiết bị đã quay thật.
- Kiểm tra trục nhìn, hướng cửa, tay cầm đồ, vị trí nhân vật và nguồn sáng giữa các shot. Chữ quan trọng làm lớp đồ họa riêng, tránh phụ thuộc chữ sinh trong ảnh.

## Tiết kiệm chi phí và lượt sửa

- Khóa thời lượng, số vai, số bối cảnh và mức chuyển động trước khi làm asset. Khi thêm chi tiết, ưu tiên thay hoặc gộp đoạn cũ; không chỉ nối dài.
- Làm bản văn và đọc thử nhịp trước. Tạo một mẫu giọng ngắn đủ đại diện nếu cần chọn voice; chốt rồi mới tạo cả bài. Chỉ làm media khi nhiệm vụ đã bao gồm bước đó.
- Tách lời theo cảnh/vai với mã ổn định khi quy trình hỗ trợ, lưu cấu hình và dấu phiên bản. Tái tạo đúng đoạn đổi; không giả định backend cũ có cache từng đoạn nếu nó thực tế tổng hợp cả bài.
- Tái sử dụng bối cảnh, pose, âm nền và đạo cụ đã hợp cảnh. Tài nguyên dùng chung cần mã, nguồn, quyền sử dụng; bản thay đổi riêng không ghi đè tài nguyên chung.
- Tính thời lượng từ audio thực và khoảng không lời trên timeline. Tránh cộng hai lần hình/nhạc chạy đồng thời với lời. Chưa có audio thì ghi rõ là ước tính cùng giả định tốc độ.
- Tách token của trợ lý, ký tự lời đọc, credits dịch vụ và thời gian render. Không suy ra chi phí từ một hệ số cũ; ghi model, độ dài và số dùng thực của từng lần tạo trong hồ sơ tập.
- Đọc đúng file cần sửa, giữ bản nguồn duy nhất và ghi thay đổi ngắn. Kiểm tra phần bị ảnh hưởng trước; không render lại toàn bộ hoặc nghiên cứu lại từ đầu khi không có lý do.

## Cách bổ sung bài học

Viết theo mẫu: **vấn đề lặp lại → nguyên nhân → nguyên tắc xử lý → cách biết đã đạt**. Bài học phải dùng được cho một tập khác mà không cần biết cốt truyện gốc. Nếu chỉ là sửa một câu, một nhân vật hoặc một asset cụ thể, lưu vào ghi chú riêng của tập.
