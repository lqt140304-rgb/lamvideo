# Thiết kế: dựng lại vùng mặt đầu Nam theo ảnh mẫu (Hồ sơ 02)

Trạng thái: **bản nháp chờ chủ repo duyệt**. Chưa dựng gì. Ngày 2026-11-14.

## 1. Ý định và lý do

Đầu cage hiện tại (`assets/nhan-vat-3d/dung_dau_cage_nam.py`, nhánh `claude/dreamy-wu-7079a5`) không bám sát ảnh mẫu nên khuôn mặt biến dạng nhiều và biểu cảm cứng. Chủ repo chọn: **ảnh mẫu là chuẩn của đầu Nam**; đầu đã duyệt trước đây chỉ còn là tham khảo.

Nguyên nhân gốc đã soi được:
- Bảng vòng `RINGS` của cage lấy tiết diện từ đầu loft cũ rồi nới má và cằm, chưa từng dựng theo mẫu nên thừa hưởng mọi chỗ đầu cũ khác mẫu.
- Mẫu có nhãn cầu tròn lồi, viền đen dày và mí da dày trùm nửa trên (ánh nhìn lờ đờ), mũi là cục tròn, mặt bầu kiểu quả lê. Cage làm mắt dẹt dán lên mặt (vùng mắt bị làm phẳng ±8 mm, nhãn cầu co ×0,824), mắt 8 đỉnh nên mép dưới thành đa giác.
- Mắt dẹt phải ép theo da, cộng với việc mới có 4 shape key thử, là nguồn chính của sự cứng.

## 2. Mục tiêu

1. Vùng mặt (mắt, mí, mũi, má, miệng, cằm) khớp ảnh mẫu ở mặt trước, mặt nghiêng, 3/4, đo được bằng ảnh chồng lên mẫu.
2. Mắt là nhãn cầu thật có mí dày riêng, viền đen dày như mẫu, đủ cấu trúc để chớp, nheo, trợn, liếc.
3. Giữ nhận dạng sinh học: nốt ruồi trái (Nam), thuận tay trái ở nhân vật kia không liên quan đầu này; nốt ruồi trán thấy rõ ở mặt trước.
4. Tóc v4, tai, cổ và tỉ lệ đầu–thân giữ nguyên, trừ chỗ mép khâu bắt buộc chỉnh.
5. Sau khi hình tĩnh được duyệt, đưa bộ rig mắt/hàm/mí sang nền mới để biểu cảm mềm (việc rig là giai đoạn sau, có cổng duyệt riêng).

## 3. Không làm (non-goals)

- Không đổi tóc, tỉ lệ đầu–thân, tai, cổ (trừ khâu mép).
- Không rig mặt, không bộ 24 nhóm biểu cảm, không ghép tay trong giai đoạn dựng hình.
- Không sculpt tay, không phụ thuộc Blender có giao diện hay Blender MCP.
- Không tạo media tốn phí; không đẩy `main` khi chủ repo chưa nói "duyệt".

## 4. Điều khiến việc này coi như thất bại (anti-goals)

- Đầu "đẹp" nhưng khi chồng lên mẫu vẫn lệch rõ ở mắt/mũi/hàm.
- Mép khâu giữa mặt mới và sọ cũ lộ ra khi xoay camera hoặc khi hàm/mí chuyển động.
- Mắt đúng hình tĩnh nhưng mí không xoay quanh nhãn cầu được (xuyên cầu, gấp nếp) khi nhắm.
- Tóc v4 hở hoặc xuyên da vì sọ đổi.

## 5. Ràng buộc

- Blender 5.0.1 qua `bpy` (container, CPU), người dùng chạy được bằng `D:/blender/blender.exe -b --factory-startup --python ... --`. Mọi thứ là script chạy lại được, có `--check`.
- Cycles cho render cuối; soi duyệt bằng ảnh tĩnh nhỏ và bảng ghép (`what-if-studio/tools/soi/`), không render video khi chưa cần.
- Quy tắc repo: file tập chỉ trong `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/`; commit từng đường dẫn; model chia việc Opus/Sonnet/Haiku theo CLAUDE.md.
- Bài học đã có, không lặp lại: không bù co Subdivision cho vòng mí/môi/biên mắt-miệng; shape key mí phải xoay cả hốc cùng mí; Displace và Shrinkwrap làm việc ở toạ độ cục bộ (bake transform trước); Armature chuẩn hoá trọng số.
- Nguồn cage nằm trên nhánh `claude/dreamy-wu-7079a5` (commit `da0da83`), chưa gộp `main`. Nhánh làm việc của phiên này là `claude/funny-meitner-yz1whr`.

## 6. Các hướng đã cân nhắc

| Hướng | Nội dung | Được / mất |
|---|---|---|
| A | Dựng lại cả đầu bằng cage mới theo mẫu | Khớp mẫu nhất, nền sạch cho rig; nhưng phải khớp lại tóc, tai, cổ |
| **B (chủ repo chọn)** | Giữ sọ, tai, cổ, tóc; dựng lại vùng mặt theo mẫu | Ít làm lại, tóc gần như giữ nguyên; rủi ro là mép khâu và sọ lệch mẫu |
| C | Kéo đỉnh cage cũ về phía mẫu | Rẻ nhất nhưng mắt vẫn dẹt nên vẫn cứng; loại |

## 7. Thiết kế đã chốt (hướng B)

**Phạm vi dựng lại:** vùng mặt gồm trán dưới–mắt–mũi–má–miệng–cằm. Sọ, tai, cổ, tóc giữ nguyên cage hiện có.

**Trình tự và cổng:**
1. **Đo chuẩn.** Lấy toạ độ mốc từ các ảnh mẫu (`thiet-ke/thu-3d/`: `mau-3d-dau`, `mau-3d-xoay`, `mau-dau-tran-front/back/profile`, `mau-dau-luoi-4goc/profile`). Lập bảng mốc (khoé mắt, đỉnh mí, đỉnh mũi, khoé miệng, cằm, rìa má, vị trí tai, nốt ruồi) trong mặt phẳng ảnh, đổi sang mét theo chiều cao đầu chuẩn. Ghi sai số cho phép.
2. **Dựng hình tĩnh vùng mặt mới**, không biểu cảm: mắt là nhãn cầu tròn đủ bán kính (không co ×0,824, không làm phẳng vùng mắt), mí dày là phần riêng có độ dày thật, viền đen dày; mũi cục tròn; má bầu; vòng đỉnh quanh mắt và miệng bố trí đủ để biến dạng (không dùng 8 đỉnh cho mắt).
3. **Khâu mép** mặt mới với sọ cũ, rồi đo chồng ảnh lên mẫu ở 3 góc.
4. **Cổng 1 (bắt buộc, chủ repo duyệt):** bảng ảnh chồng mẫu + xoay 3/4 + nghiêng. Nếu mép khâu lộ hoặc sọ lệch mẫu quá ngưỡng thì **chuyển sang hướng A** cho phần sọ trước khi làm tiếp, không vá chồng vá.
5. **Kiểm tóc** v4 ôm sọ không hở/xuyên.
6. **Cổng 2 (sau khi hình duyệt):** mới đưa rig mắt/hàm/mí sang (logic của `rig_mat_nam` xoay mí quanh tâm nhãn cầu, jaw bone + trọng số bù, driver liếc, dùng lại được; chỉ phải ánh xạ lại đỉnh sang topology mới). Có thiết kế và kế hoạch riêng cho phần này.

**Đầu ra mong đợi của giai đoạn dựng hình:** script (một entry có `--check`, `--render`, `--blend`, `--mau`), ảnh chồng mẫu, bảng mốc và sai số, ghi chú trong `GHI-CHU.md` và `ASSET.md` của tập; `docs/KINH-NGHIEM.md` chỉ thêm nguyên tắc tái dùng được.

## 8. Việc để người dựng quyết

- Bảng mốc cụ thể và ngưỡng sai số, miễn ghi lại.
- Đường cắt ranh giới mặt/sọ, miễn đặt ở nơi ít chuyển động và tóc che được.
- Số đỉnh vòng mắt và miệng (tối thiểu đủ tròn, đủ cho mí xoay).
- Gộp nhánh `claude/dreamy-wu-7079a5` vào nhánh làm việc bằng cách nào, theo quy tắc repo (không push `main` khi chưa "duyệt").

## 9. Những điểm tôi tự quyết (chủ repo xem lại)

1. Cổng 1 là điểm dừng bắt buộc và đồng thời là điểm quyết định chuyển sang A nếu sọ cũ không dùng được.
2. Rig và biểu cảm tách thành giai đoạn sau, có thiết kế riêng, không làm cùng lúc với dựng hình.
3. Không dùng hướng sculpt tay hay Blender MCP.
4. Nguồn cage lấy từ nhánh `claude/dreamy-wu-7079a5`, không viết lại từ trống.
