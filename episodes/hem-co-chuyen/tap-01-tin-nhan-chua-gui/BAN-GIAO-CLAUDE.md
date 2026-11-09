# Bàn giao dựng cho Claude — bản 14

**Hiện hành bản 14 — 09/11/2026:** rút đường mở thành phố–cú–cửa tiệm còn 14 giây; diễn đủ Thảo nghịch đồng hồ → bị quát → Duy che em/xin lỗi/hỏi sửa → Lộc xem máy rồi báo giá. Rút gia cảnh đầu thành một đoạn ngắn, đưa thông tin dì Hạnh vào đúng chỗ ở C2. Chi tiết diễn/FX và nghiệm thu ở [BIEN-TAP-V14.md](BIEN-TAP-V14.md). Giữ ba giao kèo và phần kết bản 13.

Bản 14: **1,092 đơn vị cách trắng, 4,976 ký tự gồm LF, 89 lượt lời**; người dẫn **264 đơn vị**. Giữ **40 cue/C0–C9**; C0 **14 giây**, các khoảng nghỉ được ghi trong nguồn cộng **99.2 giây** (không cộng lặp các khoảng đó khi lập timeline). Chưa đo thời lượng giọng hoặc phim bản 14; các đoạn dừng riêng trong cue plan cũ phải được đối chiếu trước khi cộng.

**Trạng thái media bản 14:** đã có animatic v3 bản 13 (8:45,3 theo hồ sơ tập), chưa duyệt; không phải phim khớp lời mới. Lượt sửa này chỉ cập nhật văn bản và phân vai. Không tạo giọng, mix, staging, timeline hoặc MP4 mới. `cues.json`/voice-manifest/timeline giữ nguồn cũ để chặn dựng nhầm; Claude cần ánh xạ lại C0–C2 và retime diễn trước khi dựng.



## Dựng bản 14 trước

Đọc BIEN-TAP-V14 cùng KICH-BAN và DUNG-CANH. Giữ cast/asset và các take cũ khớp nội dung–vai–model–settings–tag. `voices.json` đã kiểm tra phân vai với nguồn 14, bản lời sạch/thẻ xuất lại từ cùng nguồn. **Không sửa hash cue/manifest cho khớp nếu chưa ánh xạ lại nội dung và staging.**

1. Theo bảng item C1/C2 trong BIEN-TAP-V14, cập nhật cue plan; C0 đổi 3/2/1/3/3/2 giây. Staging C1 cũ không còn đúng mốc lấy máy/quát/đặt đồ; đừng chỉ đổi audio.
2. Dựng thử liên tục từ vào cửa tới báo giá bằng asset cũ, giọng tạm/take phù hợp. Kiểm tra diễn với máy khóa trước; sau đó mới bật camera/focus/light/sound theo bảng FX. Không tự tạo TTS trả phí từ lượt sửa văn này.
3. Retime theo audio đã kiểm tra, giữ môi trường liên tục, xuất bản nháp mới mang nhãn v14. Không nhận bản v3/v13 là kết quả sửa này. C6–C9 vẫn giữ luật và diễn bản 13.

## Hướng dẫn nền bản 12–13 — lịch sử, áp dụng khi không bị bản 14 thay thế

08/11/2026. Chủ repo giao Claude dựng; lượt Codex này biên tập văn và chuẩn bị dữ liệu, không khởi chạy TTS hoặc render phim thay Claude.

1. Mở worktree `D:\lamvideo-whatif`, studio `what-if-studio/`; giữ kho Git gốc. Đọc CLAUDE.md và [BIEN-TAP-V12](BIEN-TAP-V12.md), rồi nguồn KICH-BAN. Bản cũ đã có giọng/animatic đủ 35 cue, 11:48,416; các ghi chú “chỉ demo 146 giây/chưa có giọng” là lịch sử.
2. Dùng lại rig/asset và 35 cue cũ đạt; thêm 5 cue theo bản 13, nhưng lời đã cắt nên item/timing cũ **không dùng nguyên**. `voices.json` là bản 13, `voice-manifest/cues/timeline` còn dấu nguồn bản 11. `voice.cjs lines --dry` và `build-timeline.cjs --items` dùng để liệt kê không tốn dịch vụ. Build/mix sẽ dừng khi nguồn chưa khớp; không sửa hash để lách mà chưa đối chiếu nội dung.
3. Ánh xạ item mới sang cue, retime mốc staging theo ý nghĩa lời và chỉ dẫn Không đọc; sửa lấy/nhả tiền/ảnh, trẻ đã ở cửa, phản ứng thay giữ trung đôi dài, thứ tự chạy–nắm–đi. Mỗi đoạn không lời phải có hành động được nhìn thấy. Giữ 85 giây nhịp định lượng +24 giây mở, không cộng chúng lần nữa. Ước tính mới trong nguồn, chưa phải thời lượng audio.
4. Bed môi trường từ đầu phim/chậm nhất 0:01: gió đêm qua dây điện, còi xe máy rất xa ngoài đường, thở Duy khi đã tới cửa. Nền đổi từ hẻm/quạt sang ruộng; tiếng cỏ cũ lúc ngồi đổi thành vải chạm kè đá. Nhạc ưu tiên không lời, nguồn/quyền theo NGUON-AM-THANH. Không giữ các khoảng digital silence chỉ vì không có narrator.
5. C6–C7 **không narrator**, kể cả mẹ tan; mã cue kết C7-C, không có C7-D. Giữ khung 2:1, mẹ/áo/bóng/hạt tan 3–4 giây rồi 8 giây lau má–nắm tay. Camera vào cận vừa từ đầu nhịp, tiến/giảm tốc tự nhiên. C8 trở 16:9 đúng ghế/tay, đủ ba phiếu, định vị ngưỡng nhà trước gọi dì rồi rời đi.
6. Giữ cast do chủ repo chọn cho tới khi nghe thử. Mẫu cần nghe: Lộc gắt/mỉa mai, Duy hụt hơi/nghẹn, Thảo trẻ 8 tuổi nhớ mẹ; khẩu ngữ miền Nam nhẹ, tránh giọng đọc diễn văn. Thẻ chỉ là gợi ý. Reuse clip trùng vai/text/model/settings/tag khi còn đạt; không tự tạo lại toàn bộ vì ID dịch. Các câu đổi hoặc diễn chưa đạt mới cần tạo lại khi bước giọng được giao. Kiểm tra chi phí thực, không quy token thành credits.
7. Khi đã có manifest đúng lời, cập nhật cue/mốc thật và dấu nguồn rồi build timeline, mix voice-track và bed/FX/nhạc; kiểm tra không chỉ riêng MP3 giọng. Export storyboard/animatic mới, ghi tên bản lời trên overlay. Phim cũ replay vẫn là bản 11, không giao như bản 12.

Trong studio chạy typecheck; kiểm tra hình ở độ phân giải điện thoại, nghe bằng loa và tai nghe. Một lượt typecheck không thay xem/nghe bản xuất. Kiểm tra không narrator C6–C7, rõ giá trước lời đồng ý, lời Duy ngăn đến sau Thảo nhận, không âm ù G2, không tích tắc kệ đồng hồ dừng. Các kiểm tra rig/VFX đang có vẫn cần nếu sửa chuyển động liên quan.

Hồ sơ/asset riêng giữ đúng thư mục tập. Giữ các thay đổi của agent khác; không git add toàn repo, không push raw stock audio, cache, .env hoặc MP4 nặng. Sau công đoạn, chỉ bài học có thể dùng lại mới vào docs/KINH-NGHIEM.md, không ghi cốt truyện tập vào đó.

## Bổ sung sau phản hồi: phim còn giống tranh tĩnh

**Mục tiêu hình: hoạt hình 2D giản lược có diễn xuất, giữ chiều sâu 2.5D.** Không coi lia/zoom/parallax, bụi, tóc lay và chớp mắt là đã đủ chuyển động nhân vật. Cắt lời dẫn bản 12 chỉ chữa phần kể; các hành động chuyển sang Không đọc phải thật sự diễn ra trong bản dựng.

**Làm thử trước:** một đoạn khoảng 12–20 giây từ khi Lộc gắt/mỉa mai tới phản ứng hai trẻ; dùng lại rig/set và tiếng tạm hoặc đoạn audio cũ phù hợp, chưa tạo trả phí hàng loạt. Không bắt ép đúng 20 giây nếu lời và hành động cần nhịp khác. Kiểm tra chuyển động trực tiếp với camera đứng yên trước, rồi mới dùng đường máy và âm đầy đủ. Không tự ghi đoạn thử là đã duyệt.

| Nhóm cần diễn | Hành động và phản ứng nhìn thấy |
|---|---|
| Lộc nói / Thảo nghe | Lộc dừng tay trước câu gắt, đưa mắt tới tiền, nhấc cằm và mỉa mai; miệng chỉ hoạt động trong câu mình nói. Thảo khựng, tay cầm tiền rút sát người, vai co, ngước tìm Duy; không chỉ đổi nhãn khuôn mặt từ bình thường sang buồn. Duy nhìn em rồi chuyển thân che em, tay đỡ tiền đúng điểm chạm. |
| C3 thú nhận / xin lỗi | Thảo tránh mắt rồi cố nhìn anh khi nhận lỗi. Duy định đáp, dừng, thở ra, đặt bút, dịch ghế và hạ người về phía em; em từ co người sang tựa gần sau lời xin lỗi. Không giữ một pose trong suốt đoạn thoại. |
| C5 trả giá | Hơi ấm làm tay/vai thả khác rõ với trước đó. Khi giá đến, Duy mất sức ở thân rồi tay bấu ghế giữ lại, đầu theo sau; Thảo quay sang chạm anh, nhìn sang Lộc và nhận giá. Rung/nghiêng chỉ bổ trợ, không thay chuyển động cơ thể. |
| C6–C7 gặp mẹ | Thảo chạy tới, thân chậm lại khi chạm mẹ, tay mới ôm; Duy tới sau. Ngồi xuống có chuyển trọng tâm/điểm tì. Khi khóc có mắt, môi, vai và nhịp thở theo câu, không rung cả hình đều đặn. Sau mẹ tan, tay mất điểm tựa, rút về rồi chuyển sang lau má/nắm tay; không trượt hai hình người tới gần nhau. |

**Khẩu hình:** rig có `talk`/`mouthShape`, nhưng các shot thoại được rà ở bản hiện có chưa điều khiển chúng theo lượt nói. Claude cần nối đúng speaker và khoảng nói thực; dùng ít dáng miệng rõ, chuyển theo cụm âm/nhịp câu, khép ở nghỉ. Không cần gán một dáng riêng cho từng chữ, không để người nghe mấp máy cùng. Diễn xuất mắt, đầu và thân vẫn cần sau khi đã có miệng.

**Điều kiện xem lại:** biết ai đang nói dù tắt tiếng; người nghe có phản ứng gắn với điều vừa nghe; đầu–thân–tay có nhịp chuẩn bị và dừng, chân/ghế/vật cầm không trượt. Cảnh lắng được giữ yên khi có chủ ý, không chèn động tác cho đủ số lượng. Chọn đoạn thử đạt rồi mở rộng đúng các cảnh trọng yếu, giữ bộ asset đã có. Lượt bổ sung này chỉ sửa yêu cầu dựng, chưa thay chuyển động hoặc xuất clip.

## Chuyển góc mượt theo phản hồi chủ repo

Áp dụng phần **Máy quay và chuyển góc — bổ sung bản 12** trong [DUNG-CANH](DUNG-CANH.md). Giữ 35 cue cũ, thêm 5 cue bản 13/đường mở 24 giây, bảng màu, khung 16:9/2:1 và giới hạn rung cũ. Mượt là có hướng/đà, điểm cắt theo ánh mắt–động tác–phản ứng và nền âm liền; các nhịp gắt hoặc hoảng vẫn được cắt dứt khoát. Không tăng số cảnh hoặc thời lượng chỉ để thêm chuyển cảnh.

Đoạn thử Lộc–hai trẻ: sau lượt máy tĩnh duyệt diễn, dựng góc chung → cận Lộc gắt → cận Thảo nghe câu mỉa mai → theo mắt em tới Duy che em → Lộc quay về bàn sau. Giữ tay/tiền đúng trạng thái qua cắt; không quét máy theo từng câu hoặc hòa hai hình người lên nhau. Khi nối cùng đường máy phải giữ vị trí, hướng và tốc độ đầu–cuối, tránh reset từng đoạn rồi khựng. Đoạn mẹ tan vẫn cận vừa từ đầu nhịp lau má 8 giây, tiến dịu vào tay và dừng trước mờ về tiệm.

Xem chuyển động cả đoạn với âm, kiểm tra điểm nối và bản điện thoại; chưa thể duyệt từ storyboard. Lượt bổ sung này chỉ sửa tài liệu, chưa thay camera/timeline hoặc xuất clip mới.

## Phần mới cần dựng theo bản 13

Đọc HE-LO-QUAI-VAT và VU-TRU series. Bản thử diễn xuất Lộc–hai trẻ vẫn làm trước như đã giao; không mở phiên khác hoặc tự chạy media trả phí chỉ vì thêm lore. Sau đó tích hợp cameo vào góc hiện có; storyboard/animatic phần tiệm biến mất C8-E và cảnh đuôi C9 28 giây. C8-E nằm giữa B và C, không đưa theo thứ tự chữ cái ở cuối C8. Kết người tìm dì vẫn trọn trước C9.

Mẫu quái vật/kho/lọ mới chưa có asset; giữ style và tạo vừa vùng nhìn. Ba mắt, bay có chủ ý, vùng lực nhấc/đặt lọ rõ; kho sáng huyền ảo, cát/kim đảo cục bộ, không nhốt mẹ hoặc lấy mất nỗi buồn Duy đang chịu. Lọ G2 chỉ ghi dấu chuyển, không hoàn giá. Lọ G3 niêm phong quyền mơ thấy mẹ, không chứa giấc mơ tương lai đã xảy ra. Không thêm thoại/voice/nạn nhân/giao kèo thứ tư.

Nguồn sang bản 13 và speakers đã ánh xạ lại; lời sạch/thẻ không đổi. Cue/manifest/timeline vẫn bản 11 để đối chiếu, chưa dựng lại. Cần dựng/retime 40 cue và mốc staging theo bản mới trước cập nhật dấu nguồn; không đổi hash để bỏ qua cảnh báo. Nếu đã bắt đầu bản 12, áp phần thay đổi này lên phần đang làm, không dựng lại toàn bộ asset.
