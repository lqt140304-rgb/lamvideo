# Nam 3D — bản thử (12/11/2026)

Thử đưa Nam (Hồ sơ 02) sang **3D thật**. Đây là thử nghiệm, **chưa phải quyết định**: hướng đã chốt cho Hồ sơ 02 vẫn là 2.5D (`../thu-2-5d/`).

**Ảnh mẫu 3D do chủ repo đưa (12/11):** `mau-3d-xoay.webp` (6 góc), `mau-3d-dau.webp` (cận đầu). Mô hình hiện tại `nam-3d.js` dựng theo mẫu này: không kính; mắt to tròng trắng viền đậm, mí trên sụp, con ngươi nhỏ sát mí; mày dày bo tròn; mũi cục tròn; miệng hé thấy răng, lưỡi; tai to; nốt ruồi trên đuôi mày phải; tóc khối đầy mềm, mái rủ chéo có mũi nhọn dừng trên mày, tóc mai hẹp, lọn xoắn to cong về trước; tỉ lệ chibi (cao 165 cm, đầu ~1/3); vật liệu mờ kiểu đất sét, tone mapping ACES, sáng studio dịu.
Bản toon đầu tiên (có kính, theo 2.5D) giữ ở `nam-3d-toon.js` (`scene.html?model=toon`).

- **Khung mẫu có tham số (`createBaseCharacter(THREE, spec)`):** mọi số chỉnh được gom trong `NAM_SPEC` (màu `colors`, sọ `head`, mắt `eye` kèm góc phủ mí, miệng `mouth`, bán kính tay `arm` + tay áo `sleeve`, tóc `hair` gồm `HS`, độ phồng nền, gáy). Nhân vật mới ghi đè nhóm cần đổi (`createBaseCharacter(THREE, { colors: {...}, hair: {...} })`; hợp nhất theo từng nhóm). Tên khớp xương cố định: `hips, spine, chest, neck, head, shoulderL/R, elbowL/R, wristL/R, hipL/R, kneeL/R, ankleL/R` nên chạy thẳng với `dong-tac.js`. `buildNam` giữ để tương thích. *Chưa có* bộ camera nhiều góc dạng Blender — hiện chỉ có `render.cjs` (góc `az`, `dist`, `ty`).
- `nam-3d.js` — mô hình thủ tục three.js (r170), đơn vị cm. Khung xương `hips, spine, chest, neck, head, shoulder/elbow/wrist, hip/knee/ankle` L/R, `pose({...})`; `LEG` (độ dài đùi/cẳng) cho động tác. Chi tiết mặt đặt bằng **bắn tia lên mặt sọ** (`surf`/`onFace`) nên bám đúng mặt cong. Tóc: vỏ trơn có đường chân tóc theo phương vị (`hairline`: mũi mái lệch, tóc mai, cắt gọn trên tai, gáy), đỉnh mép được dồn về đúng đường chân tóc để mép trơn; rãnh lọn khắc nông (`GROOVES`).
- `scene.html` — cảnh xem trên nền trơn; `?model=toon` mở bản cũ; `?nohair` ẩn tóc.
- `render.cjs` — `node render.cjs <out.png> '{"az":0.6,"dist":720,"ty":84}' 420 560` (một góc) hoặc `--seq <thư mục> <số khung> w h` (xoay vòng).
- `nam-3d-cac-goc.png` — bảng của bản toon đầu (so với 2.5D).
- Cài: `npm install` trong thư mục này (chỉ `three`; không thêm vào studio chung).

## Đặt vào phòng + động tác cơ bản (12/11/2026)
- `phong.html` — Nam 3D trong phòng Hồ sơ 02, **nền trong suốt**. Camera dựng lại đúng phép chiếu của `boi-canh.tsx` (máy nhìn ngang, `lookAt` theo `pos`/`target`, tiêu cự `F = mm/36·1920` px, tâm ảnh dịch xuống `horizon` bằng ma trận chiếu lệch tâm) nên đặt nhân vật bằng toạ độ cm của phòng là khớp phối cảnh. Nắng ban ngày lấy từ cửa sổ tường phải; bóng VSM đổ lên mặt sàn trong suốt + bóng tiếp xúc (thu nhỏ khi nhảy).
- `dong-tac.js` — động tác tất định theo giây: nhìn quanh (đầu xoay nhiều, cổ ít), quay người, đi (chu kỳ 2 bước ~72 cm, tăng/giảm tốc, nhún hông, vung tay ngược chân), dừng quay về máy, vẫy tay, vươn vai, ngồi xổm (hạ hông đúng độ dài đùi + cẳng để bàn chân bám sàn), nhảy nhẹ (lấy đà – bật – tiếp đất nhún). Kịch bản 14 s, đi dọc sàn trống bên trái giường (x 55→200, z 300).
- **Camera từ file JSON:** `phong.html?cam=<file.json>` dựng `PerspectiveCamera` từ `{ pos, target | euler (độ), lens_mm, sensor_width, width, height, horizon_px (tuỳ chọn) }`. `camera-mau-wide.json` tái hiện đúng camera `wide` của `boi-canh.tsx`; render cùng khung bằng camera mặc định và bằng file này cho ảnh trùng từng điểm ảnh. Khi bên Blender chốt 10 góc chỉ cần xuất JSON này (dùng `Q="?cam=file.json" node render-phong.cjs …`).
- `render-phong.cjs <thư mục> <từ> <đến>` — xuất PNG trong suốt từng khung (~1,5 s/khung trên SwiftShader).
- Nền phòng: composition `HoSo02Thu3DNen` (`what-if-studio/src/episodes/ho-so-02-nguoi-lam-thay/thu-3d-nen.tsx`, toàn phòng ban ngày, không người). Ghép: ffmpeg của Remotion **không có bộ lọc `overlay`** — tách nền ra PNG (`npx remotion ffmpeg -i nen.mp4 n%04d.png`), ghép từng khung bằng PIL (`Image.alpha_composite`), rồi mã hoá lại; ~3 phút cho 420 khung 1080p.
- Giới hạn khi ghép đè: lớp 3D luôn nằm trên mọi đồ trong phòng (không có che khuất), nên đường đi phải chọn chỗ không có đồ phía trước. Muốn che khuất thật cần dựng phòng 3D hoặc tách lớp tiền cảnh.

## Cách dựng giữ đúng quy chuẩn
- Không viền ngoài; tách khối bằng sáng–tối: `MeshToonMaterial` với dải 4 bậc chuyển mềm (`toonRamp`).
- Nét mặt (mày, mí, gọng kính, nốt ruồi, miệng) là khối mảnh màu phẳng, không nhận sáng.
- Tóc là **một khối** biến dạng từ cầu (mép mái gần ngang trên mày, tóc mai ngắn chừa má, gáy phủ cong) + vài mũi nhọn ở viền và lọn xoắn đỉnh; không để lọn cắt ngang mặt. Mặt không nhận bóng đổ cứng từ tóc.

## Bài học khi dựng
- **Tóc đất sét bị "răng cưa" da dọc chân tóc →** ép mọi đỉnh dưới chân tóc về một vòng sinh các tam giác dài mảnh; thay bằng cho đỉnh dưới chân tóc co dần vào trong sọ (`k = 1.02·max(0.78, 1 − 4·d)`), mép dày bo tròn.
- **Ống tạo bằng `LatheGeometry` bị lộn mặt (chỉ thấy mặt trong) →** điểm profile phải đi từ dưới lên trên thì pháp tuyến mới hướng ra ngoài.
- **Cầu cổ tay phình hơn cẳng tay →** cầu nằm trong nhóm bị phóng 1.25 nên bán kính thật nhân lên; chia lại cho hệ số phóng.
- Ống thuôn tự sinh (`taperTube`) phải có pháp tuyến hướng ra ngoài; đảo chiều tam giác thì mặt ngoài bị loại khi vẽ, khối chỉ còn mép (mày thành nét mảnh, lọn tóc như lá cờ).
- So từng vòng bằng ảnh ghép cạnh bảng mẫu cùng góc: lỗi tỉ lệ (đầu nhỏ, tay mảnh, cổ dài) chỉ lộ khi đặt cạnh nhau.

## Còn thiếu / chưa đạt
- Mặt nghiêng chưa nhô như mẫu (mũi, miệng ít thấy); sau lưng tóc còn khối vuông; tay gồm hai khúc tách ở khuỷu; bàn tay là khối nắm đơn giản.
- Chưa có cảm xúc 3D (mặt tham số), chưa có vật lý; bàn tay là khối nắm nên vẫy tay trông như giơ nắm tay (cần bàn tay xòe).
- Không thuộc pipeline Remotion: muốn dùng trong video cần tích hợp (`@remotion/three` hoặc render khung rồi ghép) — là thay đổi engine, cần chủ repo quyết.
