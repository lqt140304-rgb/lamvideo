# Bàn giao dựng cho Claude — Tin nhắn chưa gửi, bản 11

Ngày 08/11/2026. **Chủ repo giao Claude dựng. Codex chỉ sửa hai chi tiết và chuẩn bị hồ sơ; không khởi chạy render, TTS hoặc một phiên dựng thay Claude trong lượt này.**

## Môi trường và nguồn

- Mở Claude tại `D:\lamvideo-whatif`; studio là `what-if-studio/`. Giữ kho gốc `D:\lamvideo\.git` vì worktree còn phụ thuộc. Đọc `CLAUDE.md`, skill What If và kinh nghiệm chung; xem `CLAUDE.local.md` tại máy, không commit file local.
- Nội dung: [KICH-BAN.md](KICH-BAN.md) bản 11; hình/âm: [DUNG-CANH.md](DUNG-CANH.md); [kế hoạch](KE-HOACH-SAN-XUAT.md), [asset](ASSET.md), [VFX và tương tác cuối](VFX-ME-TAN.md). Lời sạch/bản thẻ không thay trong lượt chuẩn bị này.
- Mã tập hiện có: `what-if-studio/src/episodes/tin-nhan-chua-gui/`. Đây là **mã thử 24 đoạn, 4.380 frame/146 giây**, chưa dựng đủ nguồn 35 cue; không xuất lại rồi báo là phim toàn tập. Thời lượng nguồn ước tính 10:46–12:59, chưa đo giọng; không ép về 7 phút theo bảng màu cũ.

## Hai chi tiết đã sửa trong mã

1. `ColorScriptSheet.tsx`: G1 là **toàn bộ ký ức buổi hai trẻ tranh xe đồ chơi, em ngã, mẹ dỗ và hai trẻ làm hòa**. Không phải đổi ký ức tuổi 16/18 hay sinh nhật. Bỏ timecode 7 phút cũ ở các hồi có lời; giữ mở đầu 24 giây đã chốt.
2. `sunset_field.tsx`: giữ nguyên asset chuồn chuồn chi tiết của Anti và mẫu macro; cụm trong ruộng dùng scale **0,38**, opacity **0,68** để nhường trọng tâm cho ba mẹ con. Không làm mặt hoặc tay mờ đi để cạnh tranh với chuồn chuồn.

**Ảnh `preview_color_script.png`, `preview_meadow_g3.png`, các still/clip ruộng hiện có chưa được xuất lại sau hai sửa này.** Claude xuất lại đúng phần ảnh hưởng, đồng bộ bản public và hồ sơ tập; không dùng ảnh cũ làm bằng chứng đã duyệt sửa mới.

## Thứ tự bắt đầu dựng

1. Đối chiếu đủ 35 cue nguồn; lập timeline thật theo lời/nhịp thay cho mẫu 24 đoạn. Giữ thiết kế/tỷ lệ cartoon và palette mới của Anti. Ghi cue → shot → trạng thái tay/đồ để không lẫn mã C7-C nguồn với ShC7_B mã thử.
2. Xuất storyboard đủ cue, kiểm tra trục cửa, kệ/khăn/quầy, tuổi/xưng hô và ba giá; rồi ráp **animatic có chuyển động và âm tạm**. Tái dùng phần đạt, không gọi TTS trả phí hàng loạt chỉ để duyệt hình.
3. Thử kỹ tiền Duy đưa lại em, máy trên khăn, cất ảnh trước G1, ký/tách đủ ba phiếu, G2 ấm thoáng rồi Duy kiệt, Thảo nhận G3 trọn lời trước câu ngăn. Không tích tắc cho kệ đồng hồ đứng kim.
4. C6–C7 khung 2:1 theo nguồn, thực tại 16:9; bố chỉ bóng/âm, dì qua lời kể. Cây đa giữ scale 1,12, gốc bám đất; đồng có bông/hạt, kè và mương đọc rõ.
5. Giữ kết mới: tay trong của cả hai trẻ ôm mẹ trước áo, tay ngoài nghỉ rõ; mẹ tan mềm 3–4 giây và hạt tắt hết; Duy dịch gần lau má Thảo → nắm tay → máy tiến vào đôi tay → mờ tối dịu, mở về tiệm vẫn nắm tay. Đoạn sau mẹ tan không lời khoảng 8 giây; không lóe trắng lần nữa. Mã thử có preview 13 giây gồm 1 giây mở sang tiệm, chưa căn giọng cuối.
6. Xem/nghe animatic và sửa tiếp xúc/nhịp trước khi hoàn thiện giọng ElevenLabs, khẩu hình, Foley, nhạc và render cuối. Bản giọng/mix chưa có. Ghi chi phí thực và nguồn/quyền media; không commit `.env`, audio thử/cache hoặc MP4 nặng.

## Kiểm tra và lưu

Trong studio: `npm run typecheck`, `node tests/mother-farewell.cjs`. Các kiểm tra hình học không thay việc xem/nghe animatic. Ảnh/media theo cùng slug, hồ sơ ở thư mục tập; bài học dùng lại được mới vào `docs/KINH-NGHIEM.md`. Xem diff từng đường dẫn trước commit/push, giữ thay đổi của Anti/agent khác.
