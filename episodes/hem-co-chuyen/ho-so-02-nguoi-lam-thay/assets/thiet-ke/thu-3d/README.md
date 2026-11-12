# Nam 3D — bản thử (12/11/2026)

Thử đưa Nam (Hồ sơ 02) từ 2D/2.5D sang **3D thật** để so sánh hướng dựng. Đây là thử nghiệm, **chưa phải quyết định**: hướng đã chốt cho Hồ sơ 02 vẫn là 2.5D (`../thu-2-5d/`).

- `nam-3d.js` — mô hình dựng thủ tục bằng three.js (r170), đơn vị cm, cao 168 cm. Có khung xương (`hips, spine, chest, neck, head, shoulder/elbow/wrist, hip/knee/ankle` L/R) và `pose({...})` đặt góc khớp. Đầu phóng `HEAD_SCALE = 1.2` cho đúng tỉ lệ mẫu.
- `scene.html` — cảnh xem: nắng chính ấm, trời dịu, viền sáng sau lưng; bóng VSM mềm; bóng tiếp xúc dưới chân. `?groundShadow` bật bóng đổ dài trên sàn, `?nohair` ẩn tóc để soi mặt.
- `render.cjs` — render bằng Chromium có sẵn (WebGL qua SwiftShader), máy chủ tĩnh cục bộ:
  - `node render.cjs <out.png> '{"az":0.6,"dist":780,"ty":86}' 420 820` — một góc (`az` rad quanh người, `dist` cm, `ty` độ cao nhìn).
  - `node render.cjs --seq <thư mục> 180 720 960` — 180 khung xoay vòng + thở (~1 s/khung), ghép bằng `npx remotion ffmpeg` trong `what-if-studio`.
- `nam-3d-cac-goc.png` — bảng 5 góc: 2.5D đã chốt / 3D / cận đầu 3D.
- Cài: `npm install` trong thư mục này (chỉ `three`; không thêm vào studio chung).

## Cách dựng giữ đúng quy chuẩn
- Không viền ngoài; tách khối bằng sáng–tối: `MeshToonMaterial` với dải 4 bậc chuyển mềm (`toonRamp`).
- Nét mặt (mày, mí, gọng kính, nốt ruồi, miệng) là khối mảnh màu phẳng, không nhận sáng.
- Tóc là **một khối** biến dạng từ cầu (mép mái gần ngang trên mày, tóc mai ngắn chừa má, gáy phủ cong) + vài mũi nhọn ở viền và lọn xoắn đỉnh; không để lọn cắt ngang mặt. Mặt không nhận bóng đổ cứng từ tóc.

## Bài học khi dựng
- Ống thuôn tự sinh (`taperTube`) phải có pháp tuyến hướng ra ngoài; đảo chiều tam giác thì mặt ngoài bị loại khi vẽ, khối chỉ còn mép (mày thành nét mảnh, lọn tóc như lá cờ).
- So từng vòng bằng ảnh ghép cạnh bảng mẫu cùng góc: lỗi tỉ lệ (đầu nhỏ, tay mảnh, cổ dài) chỉ lộ khi đặt cạnh nhau.

## Còn thiếu / chưa đạt
- Mặt nghiêng chưa nhô như mẫu (mũi, miệng ít thấy); sau lưng tóc còn khối vuông; tay gồm hai khúc tách ở khuỷu; bàn tay là khối nắm đơn giản.
- Chưa có cảm xúc 3D (mặt tham số), chưa đặt vào phòng (phòng hiện là phép chiếu riêng trong SVG), chưa có vật lý.
- Không thuộc pipeline Remotion: muốn dùng trong video cần tích hợp (`@remotion/three` hoặc render khung rồi ghép) — là thay đổi engine, cần chủ repo quyết.
