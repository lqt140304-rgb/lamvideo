# Yêu cầu dựng tập What If (Claude Code đọc file này rồi làm)

Sửa hai mục dưới bằng Notepad (lưu dạng UTF-8) trước khi nhờ Claude Code làm tập mới.

## SLUG (tên tập, chữ thường không dấu, nối bằng gạch ngang)
tua-lai-10-giay

## CHỦ ĐỀ hoặc KỊCH BẢN
Nếu bạn có thể tua lại 10 giây thì sao?

(Nếu đã có kịch bản ChatGPT viết theo Prompt W trong docs/WHAT-IF-QUY-TRINH.md thì dán nguyên kịch bản vào đây,
thay cho dòng chủ đề. Chỉ có một dòng chủ đề thì Claude tự viết kịch bản theo công thức 7 nhịp.)

## YÊU CẦU CHO CLAUDE
1. Đọc docs/WHAT-IF-QUY-TRINH.md và .claude/skills/what-if-animation/SKILL.md, rồi làm đúng 8 bước của skill.
2. Việc làm trong thư mục what-if-studio. Chạy các bước qua tools\what-if.bat (voice, plan, stills, board, sfx,
   mixcheck, motiongrid, master). Bước 3 và 4 (renderer, tsc) chạy trong what-if-studio bằng npx.
3. Giọng đọc: VieNeu, giọng "Hải Đăng" (engine vieneu). Không dùng ElevenLabs, không cần khóa API.
4. Tiếng động: lấy từ library/sfx, ghi `lib:<tên>` trong episode.json. Không tạo tiếng mới.
5. Chữ trên hình bằng tiếng Việt có dấu (studio.config.ts đã đặt lang: 'vi').
6. Nhân vật và câu chuyện phải gốc: không dùng nhân vật của kênh khác. Mọi con số khoa học phải có nguồn trong
   trường science của episode.json.
7. Trước khi làm chuyển động: render storyboard (out/<slug>/storyboard.jpg), tự soi 11 điểm trong
   references/look.md, sửa lỗi, rồi DỪNG và cho tôi xem. Chờ tôi duyệt mới làm tiếp.
8. Xong thì báo: độ dài, số cắt cảnh/phút, mức âm lượng (LUFS), đường dẫn file *-final.mp4, và những chỗ còn yếu.
9. Chỉ commit mã nguồn tập (what-if-studio/src/episodes/<slug>, what-if-studio/public/<slug>) lên nhánh hiện tại
   khi tôi bảo.
10. Đọc docs/WHAT-IF-KINH-NGHIEM.md trước khi làm. **Mỗi lần dựng hoặc sửa, ghi thêm kinh nghiệm rút ra vào file đó**
    (lỗi gặp, cách sửa, mẹo) trước khi báo xong.
