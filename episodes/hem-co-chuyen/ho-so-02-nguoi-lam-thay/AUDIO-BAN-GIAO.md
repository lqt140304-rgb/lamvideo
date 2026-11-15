# Audio — cập nhật 16/11/2026

Đã `git pull origin main` đến `e9da342` trước khi tạo giọng. **Chủ repo duyệt bộ 28 SFX V2 và hai bản phối minh họa ngày 16/11/2026.** Dữ liệu audio nằm local trong worktree đang làm; chưa đồng bộ với một bản dựng toàn phim. Lượt duyệt này không tự nghiệm thu FX giọng, khẩu hình hoặc bản mix phim.

## SFX V2 — tạo lại sau góp ý về độ sống động/chân thật

Đã tạo lại đủ 28 âm, **mỗi âm một take mới**, vào `what-if-studio/public/ho-so-02-nguoi-lam-thay/sfx-v2/`. Bộ `sfx/` cũ, thoại khô và FX giọng được kiểm hash: 92 tệp kể cả manifest giữ nguyên. Không ghi đè bộ cũ.

- Nền phòng/quạt, hẻm ngày, đêm và giảng đường/bờ kè dài 24 giây: mô tả lớp gần–xa, chuyển động đến–đi và khoảng trống thay vì một dải tiếng đều. Chỉ nền quạt yêu cầu loop; các nền có sự kiện được giữ thành đoạn tự nhiên, chưa khẳng định nối vòng đã mượt.
- Foley mô tả lực và chất liệu: ba nhát búa đóng chân gương rõ thân gỗ, dép cao su có chạm–quệt–nhấc, then sắt có ma sát rồi chốt, bát có chạm/rung ngắn, búa rơi có nảy rồi tắt. Thao tác nước, vải, bàn phím, giấy và túi có nhịp người thực hiện.
- Hai âm gương vẫn là thiết kế giả tưởng bằng chất liệu nước/men rạn; không phải âm sự kiện thực đã thu được. Mọi file V2 là **audio AI sinh**, không phải bản thu hiện trường thật dù prompt mô tả chất âm kiểu thu hiện trường.
- Lưu 243 giây audio nguồn mới; tổng header `character-cost` **2673 đơn vị tính phí API**, ghi `out/<slug>/sfx-v2-costs.json`; chưa đối soát riêng credits tài khoản. Một prompt đầu tiên vượt giới hạn API 450 ký tự đã bị từ chối; sửa gọn và dùng lại file đã tạo qua cache, không tạo lại âm quạt. Script hiện kiểm toàn bộ độ dài prompt trước khi gọi API.

Trang `nghe-audio-moi.html` đã đưa phần SFX V2 lên đầu, so **A: bộ cũ / B: bộ mới** cùng mức nghe mục tiêu. Hai bản minh họa phối lớp, mỗi bản 24 giây, nằm tại:

- `out/<slug>/fx-preview/mix-v2-phong-ban-ngay.wav`: quạt + hẻm xa + bước dép + rửa/đặt bát.
- `out/<slug>/fx-preview/mix-v2-goc-hoc-dem.wav`: nền đêm + gõ phím + khuấy cà phê + lật sách.

Đây là bản thử không gian, **không phải timeline cảnh đã khóa**, không thay đổi kịch bản hoặc thời điểm hành động của phim. Chúng không chứa nhạc hay thoại.

Kiểm kỹ thuật: đủ 28 file nguồn đúng thời lượng yêu cầu; 28 bản nghe giải mã được, không gần-im theo ngưỡng kiểm; kiểm gộp stereo về mono không quá đỉnh. Phát hiện một nền stereo gộp mono có thể vượt 0 dB khi chỉ chuẩn hóa thông thường; bản nghe và hai bản phối hiện chừa headroom −4,5 dB và có limiter không tự bù gain. Trang nghe có 80 player, mọi đường dẫn tồn tại. Số đo lưu `out/<slug>/sfx-v2-checks.json`. Trạng thái sau phản hồi người dùng: **V2 và hai bản phối minh họa đã được chủ repo duyệt; chưa mix phim**. Việc nghe duyệt là xác nhận của chủ repo, không phải suy ra từ số đo hay tuyên bố trợ lý đã nghe.

Lệnh `--tao-sfx` hiện nhắm bộ V2; cache bỏ qua những âm đã có đúng prompt/model/cấu hình. `--preview` chỉ cân mức, phối ví dụ và xuất trang nghe cục bộ, không gọi API. Các mục bên dưới ghi lại lượt V1 và giọng để truy vết.

## Thoại rút gọn

Giữ cấu hình `giong-chot.json` và model hiện hành trong script: `eleven_v3_conversational`. Đối chiếu signature cho thấy chỉ hai cue đổi; 49 file còn lại được kiểm hash và giữ nguyên.

| Cue | Cũ | Mới | Thay đổi khi dựng |
|---|---:|---:|---|
| C2.1_NGUOI_KIA_01 | 17,52s | 8,88s | Ngắn hơn 8,64s; căn lại đoạn đáp và thao tác trao tiền/thẻ theo hình |
| C3.3_NGUOI_KIA_02 | 24,88s | 15,04s | Ngắn hơn 9,84s; căn lại phản ứng, búa và bước chuyển sang khế ước |

File mới: `what-if-studio/public/ho-so-02-nguoi-lam-thay/thoai/<cue>.mp3`. File cũ và manifest được giữ ở `what-if-studio/out/ho-so-02-nguoi-lam-thay/truoc-rut-gon-20261116-014526/`.

Phí hai cue: **97 credits**, đối chiếu hai bản ghi history `5jknDxCacxvnvcF9F9Kw` (38) và `NaA62yQFcrw30BtUOrFm` (59), bộ đếm 34048 → 34145. Số 59 lấy ngay sau generation chỉ bao gồm một bản ghi, đã sửa trong `out/<slug>/costs.json`.

## Hiệu ứng giọng

10 bản WAV stereo 48 kHz ở `what-if-studio/public/ho-so-02-nguoi-lam-thay/thoai-fx/`; `manifest.json` ghi filter, hash nguồn, thời lượng và trạng thái. Thoại khô vẫn giữ riêng.

- `C1.2_TUNG_01`, `C1.2_TUNG_02`: lọc dải điện thoại 300–3400 Hz, nén nhẹ.
- Ba cue giảng viên cảnh 3.1: phản xạ phòng ngắn; chưa thay thế impulse response của giảng đường được duyệt.
- Hai cue sinh viên cảnh 3.1: giảm độ trực tiếp và phản xạ nhẹ, mức cuối cần chỉnh theo khoảng cách camera.
- Ba cue Người Kia cảnh 3.4: phản xạ stereo và chuyển vị trí nhẹ. Dùng diễn xuất thì thầm của take nguồn, không coi bộ lọc là đã tạo được diễn xuất mới.
- Người Kia nói ngay trong phòng khi gọi video cho mẹ vẫn dùng giọng khô tại chỗ; không lọc thành tiếng phát qua điện thoại chỉ vì cảnh có cuộc gọi.

Xuất bằng FFmpeg cục bộ, không dùng credit generation. Không áp thêm hiệu ứng lên hai câu rút gọn vì chúng không phải tiếng từ điện thoại hay lời trong gương tại cảnh đó.

## Tiếng động / nền toàn tập

28 file MP3 riêng ở `what-if-studio/public/ho-so-02-nguoi-lam-thay/sfx/`. Tạo một lượt mỗi âm bằng `eleven_text_to_sound_v3`; manifest lưu prompt, cảnh dự kiến, loop, thời lượng, ID phản hồi nếu có và header tính phí. Nguồn tạo: ElevenLabs API, không tái gán quyền CC0 của các ứng viên stock trong tài liệu cũ.

Nhóm đã tạo: nền phòng/quạt, hẻm ngày, đêm, báo thức, rung điện thoại, gõ khung gương, chăn vải, dép, vòi rửa bát, đặt bát, cửa, then sắt, bàn phím, thẻ, chậu nước, thông báo, xôi rơi, lật sách, khuấy cà phê, lớp học, phấn gãy, bờ kè, tim đập, búa rơi, gương nứt rỉ nước, gương hóa lỏng, ghế kéo và túi đồ ăn.

Tổng header `character-cost` của 28 phản hồi: **1716 đơn vị tính phí API**; lưu `out/<slug>/sfx-costs.json`. Không gọi số này là số ký tự prompt hoặc số giây audio; chưa đối soát riêng chênh lệch credits tài khoản cho lượt SFX.

Thời lượng từ 2–15 giây/file; nền/tim có yêu cầu loop trong API nhưng điểm nối vẫn cần nghe. Âm sinh có thể khác vật liệu/nhịp yêu cầu, chưa xác nhận chất lượng chỉ vì ffprobe đọc được. Không tạo nhạc hoặc stock hơi thở chồng lên take diễn.

## Nghe và ghép

### Vòng chỉnh độ rõ sau góp ý

Người dùng nghe bản đầu và báo FX quá mờ. Đo mẫu: giọng gương cũ trung bình −21,4 dB so với thoại khô −14,6 dB; SFX gương hóa lỏng trung bình −51,9 dB, đỉnh −25,9 dB. Việc file giải mã được chưa đủ để bàn giao một bộ nghe thuận tiện.

Đã tăng độ rõ bộ lọc điện thoại, mức/đuôi vang giảng đường và gương; chuẩn hóa bản FX giọng về mục tiêu −16 LUFS, giới hạn true peak −1,5 dBTP. Trang nghe bổ sung bản khô cùng mức mục tiêu để so A/B. Stereo chỉ bổ sung, vang vẫn tồn tại khi gộp mono. Đây là cài đặt cần nghe duyệt, không phải xác nhận diễn xuất/âm học đã đạt.

28 SFX nguồn giữ nguyên; bản nghe nâng mức riêng ở `out/<slug>/fx-preview/sfx-*.wav`, mục tiêu −18 LUFS. Mẫu gương hóa lỏng sau xử lý trung bình −26,0 dB, đỉnh −1,5 dB, tăng khoảng 26 dB trung bình so với nguồn. LUFS mục tiêu và mức trung bình dB không phải cùng phép đo; không dùng mức nghe riêng này làm mức mix dưới thoại.

Các bản FX nhẹ được dựng lại từ thoại khô bằng đúng chuỗi filter cũ tại `out/<slug>/fx-ban-nhe-doi-chieu/`, không phải bản sao byte nguyên gốc. Vòng chỉnh này xử lý FFmpeg cục bộ, không gọi ElevenLabs, không phát sinh credit.

Tạo lại trang nghe và bản nghe cục bộ: chạy script với `--preview`. Không cần `--tao-sfx`.

Trang nghe local: `what-if-studio/out/ho-so-02-nguoi-lam-thay/nghe-audio-moi.html`, gồm hai câu mới, 10 FX giọng và 28 tiếng động.

Chạy lại script từ thư mục studio:

```powershell
python ../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/tao_audio_fx.py
# Chỉ khi cần tạo các SFX chưa có/đổi prompt; có thể tốn phí:
python ../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/tao_audio_fx.py --tao-sfx
```

Kiểm kỹ thuật: 38 file FX giải mã được; thử lại với network bị chặn giữ nguyên 38 file và không gọi API. Bộ thoại được kiểm signature sau cập nhật. **Chưa kiểm bằng tai, chưa cân mix, chưa căn frame/Foley/khẩu hình hoặc xuất phim.** Chỉ ghép sau khi nghe chọn take; đặt âm va chạm theo hình, không tự dời mọi âm theo số giây thoại bị cắt. Khoảng im và âm nền phải tiếp tục theo ý đồ cảnh.

Thông số API tham chiếu: https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert
