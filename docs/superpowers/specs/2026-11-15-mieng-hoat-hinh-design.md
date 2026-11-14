# Thiết kế: miệng kiểu phim hoạt hình 3D cho base nữ

Ngày 15/11/2026. Tiếp nối [thiết kế mặt diễn xuất](2026-11-14-rig-mat-nu-design.md). Áp dụng cho **base nữ bản mới** mà chủ repo sắp gửi; nếu bản mới chậm, áp dụng lên base hiện tại (`nhan-vat-nu-goc`).

## Mục đích

Chủ repo thấy miệng hiện tại giả nhất ở hai chỗ:
- **Khi mở miệng có nếp gấp:** má, cằm và khóe không giãn theo.
- **Khi nói chưa mềm mại.**

Mục tiêu là miệng giống nhân vật phim hoạt hình 3D: môi có độ dày tròn, khóe mềm, khi há thì cả vùng quanh miệng (má, cằm, rãnh mũi–má) đi theo một cách liền mạch. Miệng phục vụ cảnh cận mặt và nói thoại.

## Mục tiêu

1. **Lưới vùng miệng sạch, kiểu hoạt hình 3D.** Lưới quad đều, gồm các vòng lưới:
   - thành trong môi;
   - mép môi, ở ranh môi hồng;
   - hai vòng trên mặt môi, tạo độ dày tròn;
   - 4–5 vòng da quanh miệng, lan tới rãnh mũi–má, dưới mũi và cằm.

   Khóe miệng dày lưới hơn. Môi nhô 1,5–2,5 mm so với da. Môi trên có cung nhẹ kiểu hoạt hình, không chi tiết như người thật.
2. **Mở hàm không gấp.** Trọng số hàm tỏa mềm sang má và cằm, được làm trơn trên lưới. Thêm modifier Corrective Smooth (sau Armature, trước Subdivision), chỉ tác động trong vùng mặt quanh miệng.
3. **Khẩu hình và biểu cảm mềm.**
   - Dựng lại 10 shape key nền và 11 khẩu hình, giữ nguyên tên để `khau-hinh.json` vẫn dùng được.
   - Độ dời giảm dần mềm từ môi ra ngoài, không có chỗ gãy.
   - Môi giữ thể tích khi chu, mím, cười.
   - Giữ `mo_ham_khoe` (tự bật theo hàm) và chỉnh lại cho lưới mới.
4. **Bên trong miệng kiểu hoạt hình.**
   - Răng trên và răng dưới là hai dải cong hình chữ U theo cung hàm, bo tròn, không chia từng chiếc.
   - Có lợi màu hồng.
   - Lưỡi tròn, có đầu lưỡi.
   - Khoang miệng ôm theo môi, màu tối ấm.
5. **Kiểm tự động mới.**
   - Không gấp khi mở hàm.
   - Khẩu hình mượt.
   - Môi có độ dày.
   - Các kiểm miệng cũ vẫn phải đạt.

## Không làm lần này

- Công cụ tự chuyển audio ElevenLabs thành khẩu hình, và độ mượt khi chuyển giữa các khẩu hình trên timeline. Hai việc này làm cùng công cụ khớp khẩu hình.
- Mắt, mày, 18 cảm xúc. Ngoại lệ: nếu bản base mới làm khác vùng mắt, sẽ đánh giá riêng.
- Quần áo, tóc.

## Điều không được để xảy ra

- Miệng thành kiểu người thật, ví dụ có nếp môi chi tiết hay răng từng chiếc.
- Mất nét cười dịu của mẫu khi ngậm miệng.
- Lộ răng, lưỡi hay khoang miệng xuyên ra má hoặc cằm.
- Vùng miệng mới lệch màu hoặc lộ đường ranh với da quanh.

## Ràng buộc

- Blender 5.2.3. Dựng lại bằng script trong `rig_nu.py`/`mat_nu.py`, chạy được bằng `-b --factory-startup`, kèm kiểm trong `kiem_rig_nu.py`.
- Giữ nguyên tên xương (`jaw`), tên shape key và `khau-hinh.json`.
- Base gốc chỉ đọc. Texture da liền màu dùng lại `da_lien_mau.py`.
- Duyệt bằng ảnh tĩnh; chỉ render video khi chủ repo yêu cầu.

## Các cách đã cân nhắc

| Cách | Đánh đổi | Kết quả |
|---|---|---|
| **A. Dựng lại vùng miệng kiểu hoạt hình 3D**: lưới vòng môi có độ dày, trọng số tỏa mềm, Corrective Smooth, khẩu hình làm lại | Vừa công sức; xử lý đúng chỗ giả nhất | **Chủ repo chọn** |
| B. Giữ lưới hiện tại, chỉ làm mượt | Nhanh; nhưng không có môi, chưa ra chất hoạt hình | Loại |
| C. Dựng lại lưới toàn bộ mặt | Sửa cả ngũ quan; tốn nhất, dễ lệch khỏi mẫu | Để sau; nếu base mới có lưới mặt sạch thì A gần thành C |

## Cách làm đã chốt

- **Dựng lưới môi theo tham số:** dò tâm miệng, bề ngang và pháp tuyến mặt trên base; sinh lưới các vòng theo tiết diện môi (thành trong → mép môi → mặt môi → da). Chiếu vòng da ra ngoài lên bề mặt base; giữ vòng môi nhô theo tiết diện. Nối vòng ngoài cùng vào lưới mặt base.
- **UV:** vòng da lấy UV theo da quanh miệng (không có đường nối UV chạy qua vùng mới). Mặt môi dùng vật liệu môi riêng: hồng nhạt, gần màu da.
- **Trọng số hàm:** môi dưới và cằm 1, rồi giảm mềm qua má tới gần rãnh mũi–má; làm trơn 10–20 lượt trên lưới; môi trên và vùng dưới mũi 0.
- **Corrective Smooth:** chỉ trên nhóm đỉnh vùng miệng; rest source = tọa độ gốc.
- **Khẩu hình:** độ dời là trường mềm theo khoảng cách tới khe môi, áp lên các vòng môi và da; khi môi co hoặc giãn thì giữ độ dày môi.

## Các quyết định do trợ lý tự chốt (chủ repo kiểm lại khi đọc)

- **Màu môi:** hồng nhạt, gần da, không tô đỏ.
- **Môi trên:** có cung nhẹ, môi dưới đầy hơn một chút, đúng kiểu hoạt hình dịu.
- **Bên trong miệng:** răng và lưỡi đơn giản hóa, không chia từng chiếc răng; có lợi hồng.
- **Corrective Smooth:** chỉ dùng cho vùng miệng, không áp lên toàn thân, để khỏi làm mềm khớp tay chân ngoài ý muốn.

## Phần để người dựng quyết

- Số vòng và số đoạn cụ thể, miễn kiểm mượt đạt và Subdivision không gãy.
- Biên độ từng khẩu hình, căn theo ảnh duyệt.
- Thuật toán làm trơn trọng số.

## Kiểm tra trước khi giao

Kiểm tự động mới:
- **Không gấp:** khi mở hàm 20° (Subdivision bật), góc giữa pháp tuyến hai mặt kề nhau trong vùng miệng không vượt quá góc lúc nghỉ quá 25°.
- **Khẩu hình mượt:** với mỗi shape key, độ chênh độ dời giữa hai đỉnh kề nhau ≤ 40% độ dời lớn nhất của key đó.
- **Môi có độ dày:** giữa môi trên và môi dưới, vòng mép môi nhô trước vòng da ngoài môi ≥ 1,5 mm.
- Toàn bộ kiểm hiện có vẫn đạt; riêng các kiểm miệng cũ được cập nhật theo lưới mới.

Ảnh duyệt (một bảng):
- Cận miệng: ngậm, hé, há 18°, cười, mếu, chu, các khẩu hình A, O, U, MBP, E.
- Chụp thẳng và chụp 3/4.
