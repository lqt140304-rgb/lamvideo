# Yêu cầu dựng tập What If (Claude Code đọc file này rồi làm)

Sửa hai mục dưới bằng Notepad (lưu dạng UTF-8) trước khi nhờ Claude Code làm tập mới.

## SLUG (tên tập, chữ thường không dấu, nối bằng gạch ngang)
(điền tên tập)

## CHỦ ĐỀ hoặc KỊCH BẢN
(điền ý tưởng)

(Nếu đã có kịch bản ChatGPT viết theo Prompt W trong docs/WHAT-IF-QUY-TRINH.md thì dán nguyên kịch bản vào đây,
thay cho dòng chủ đề. Chỉ có một dòng chủ đề thì Claude tự viết kịch bản theo công thức 7 nhịp.)

## YÊU CẦU CHO CLAUDE
1. Đọc docs/WHAT-IF-QUY-TRINH.md và .claude/skills/what-if-animation/SKILL.md, rồi làm đúng 8 bước của skill.
2. Việc làm trong thư mục what-if-studio. Chạy các bước qua tools\what-if.bat (voice, plan, stills, board, sfx,
   mixcheck, motiongrid, master). Bước 3 và 4 (renderer, tsc) chạy trong what-if-studio bằng npx.
3. Giọng đọc: ElevenLabs gói Creator (engine mặc định). Khóa `ELEVENLABS_API_KEY` nằm trong `.env` ở gốc repo; không in,
   không dán khóa vào chat. giọng dùng là giọng tự tạo trên ElevenLabs tên **"trung lê quốc"** (tra voice_id qua API theo tên, ghi vào `voice.id`); báo số credits dùng sau mỗi lần gọi.
4. Tiếng động: ưu tiên clip có sẵn trong library/sfx (`lib:<tên>`), thiếu thì tạo mới bằng ElevenLabs và lưu vào thư viện.
   Tập dài hơn 25 giây: nới độ dài theo kịch bản, vẫn giữ nhịp cắt cảnh của skill.
5. Chữ trên hình bằng tiếng Việt có dấu (studio.config.ts đã đặt lang: 'vi').
6. Nhân vật và câu chuyện phải gốc: không dùng nhân vật của kênh khác. Mọi con số khoa học phải có nguồn trong
   trường science của episode.json.
7. Trước khi làm chuyển động: render storyboard (out/<slug>/storyboard.jpg), tự soi 11 điểm trong
   references/look.md, sửa lỗi, rồi DỪNG và cho tôi xem. Chờ tôi duyệt mới làm tiếp.
8. Xong thì báo: độ dài, số cắt cảnh/phút, mức âm lượng (LUFS), đường dẫn file *-final.mp4, và những chỗ còn yếu.
9. Chỉ commit mã nguồn tập (what-if-studio/src/episodes/<slug>, what-if-studio/public/<slug>) lên nhánh hiện tại
   khi tôi bảo.

## YÊU CẦU VỀ HÌNH (chủ kênh chốt 05/11/2026, áp dụng cho mọi tập)
- **Làm ảnh tĩnh trước** (storyboard từng cảnh), tự soi và sửa lỗi, được duyệt rồi mới làm chuyển động.
- **Chiều sâu và ánh sáng làm riêng cho từng cảnh**, mỗi cảnh một cách khác nhau: bóng đổ sâu hơn; đèn thật sự phát sáng
  (có quầng, hắt sáng lên đồ vật và nhân vật); tay có ngón (không phải que); có đúng một cảnh cận cực đại.
- **Góc máy đa dạng, không để hai cảnh liền nhau cùng góc/cỡ**: toàn cảnh, trung cảnh, cận; nhìn từ trên xuống; quay trái sang phải
  (pan/trượt máy); nhìn từ vật thể về phía nhân vật; qua vai; **FOV của nhân vật (góc nhìn thứ nhất)**; tập trung vào nhân vật.
- **Hiệu ứng giác quan** ở khâu chuyển động: dịch chiều sâu (parallax), lấy nét, quầng sáng đèn nhấp nháy, hạt bụi, rung máy khi nhấn mạnh.
- **Nhân vật có chớp mắt** (chớp ngẫu nhiên theo hàm thời gian, không dùng Math.random).
- Câu lệnh tự soi của kênh: "Render every shot as an image. Look at each one like a viewer would. List what looks wrong, and fix it before you animate anything."
