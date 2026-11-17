# HUMAN-MALE-BASE-01 — phôi gốc nam con người, V1

**Đã ngừng vai trò phôi gốc — 17/11/2026:** chủ repo chuyển sang [nhân vật stickman đơn giản](../../../../../docs/QUY-CHUAN-STICKMAN.md). File GLB này được bảo toàn làm tư liệu lịch sử, không còn là nguồn bắt buộc cho nhân vật mới. Phần quyết định ngày 16/11 bên dưới là lịch sử, không còn áp dụng như quy chuẩn hiện hành.

**Chủ repo chọn ngày 16/11/2026.** [human-male-base-v1.glb](human-male-base-v1.glb), nhập nguyên trạng từ `D:/New folder/base (2).glb`, là nguồn gốc hiện hành để tạo các nhân vật **nam là con người** cho video về sau. Không chỉ dành cho Nam hoặc Hồ sơ 2; không mặc định áp cho nhân vật nữ, sinh vật hoặc mọi độ tuổi mà không điều chỉnh phù hợp.

## Cách dùng bắt buộc

1. Giữ nguyên file gốc này. Import vào Blender hoặc sao chép sang thư mục asset của đúng nhân vật/tập trước khi sửa. Bản `.blend`, tóc, khuôn mặt, nốt ruồi, trang phục và rig của từng vai thuộc hồ sơ vai/tập, không ghi đè phôi chung.
2. Tạo nhân vật mới từ mesh này; giữ ghi chú `base_id: HUMAN-MALE-BASE-01` và phiên bản trong bảng asset. Không lấy lại ảnh AI, mesh thử cũ, `Base_Character_Nam.blend`, rig SVG/TSX hoặc mã dựng thân/tay/chân cũ làm phôi nguồn thay thế.
3. Những bản cũ được bảo toàn để đối chiếu và tham khảo cách rig/vật liệu; **không còn vai trò phôi gốc**. Chỉ chuyển module cũ sang bản mới sau khi kiểm tra khớp hình, không tự ghép các mảnh thân cũ thay vào nguồn mới.
4. Phôi chung giữ đối xứng; dấu riêng như nốt ruồi, sẹo, tính thuận tay hoặc đối xứng gương chỉ tạo trên biến thể nhân vật. Không ghi đặc điểm truyện của một vai vào nguồn chung.
5. Nếu cần nâng cấp bản gốc, tạo V2 riêng và ghi quyết định chọn phiên bản. Giữ V1 để truy nguồn các nhân vật đã phát triển, không âm thầm thay cùng tên tệp.

## Đã kiểm tra ở cấp tệp

GLB 2.0; độ dài khai báo khớp file 2.064.288 byte; sao chép khớp SHA-256, xem [manifest.json](manifest.json). Có một node/mesh/material, POSITION accessor có 47.736 phần tử. Không có skin/xương, animation, morph target hoặc ảnh texture trong cấu trúc GLB. Không dùng số phần tử POSITION như số đỉnh độc nhất đã weld.

Vật liệu nguồn màu nền xám `[0.5, 0.5, 0.5, 1]`, metallic khoảng 0.05 và roughness khoảng 0.4; đây là thông số đang có, không phải kết luận lookdev đã đạt. Không có ảnh texture không chứng minh không có mọi dạng bóng baked; màu đỉnh và hình thể vẫn cần xem trong Blender.

Mesh có miền tọa độ cục bộ Y từ 0 tới khoảng 1.82424. Không tự kết luận đã cao 1,58 m, hướng mặt −Y hay chân ở Z=0 trong Blender. Chưa chuẩn hóa, remesh, đổi tỷ lệ hoặc sửa bất kỳ byte mô hình nào trong lượt nhập này.

## Trước khi rig nhân vật

- Kiểm tra khi import: đơn vị, chiều cao mong muốn, mặt hướng −Y và đế chân tại Z=0; điều chỉnh trên bản làm việc, lưu transform rõ ràng.
- Đo đối xứng trái/phải, kiểm T-pose tay ngang, khoảng hở nách, ngón tay và tiếp xúc bàn chân. Chưa coi ảnh nhìn đối xứng là kiểm tra lưới đối xứng.
- Soi topology/normals, ngón dính, mặt xuyên và biến dạng vai–hông–gối. Chỉ retopology trên bản sao khi có nhu cầu; không tự nhận đây đã là mesh quad sạch hoặc sẵn rig.
- Sau gắn xương, thử các dáng gập và cầm đồ trước khi tái sử dụng animation cũ. Chưa có rig/shape key chỉ vì file đã được chọn làm gốc.

Nguồn file do chủ repo cung cấp; tác giả bên ngoài và giấy phép chưa được xác minh độc lập. Không tự áp giấy phép của engine lên mô hình nhập. Lựa chọn làm phôi gốc là quyết định thiết kế của chủ repo, không phải chứng nhận quyền từ bên thứ ba.