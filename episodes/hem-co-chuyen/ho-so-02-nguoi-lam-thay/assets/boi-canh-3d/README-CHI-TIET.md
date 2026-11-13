# Đồ dùng 3D tinh chỉnh — Hồ sơ 02

Bản local ngày 13/11/2026. Dựng bổ sung trên `xay_phong_tro.py` và `vat_lieu.py`, không thay mặt bằng 3 × 4 m, nhân vật hoặc nguồn bối cảnh gốc. Dùng hình khối cartoon mềm, màu trầm, vật liệu mờ; chi tiết lớn phải đọc rõ trước khi thêm vân nhỏ.

## File và công dụng

| File / thư mục | Công dụng |
|---|---|
| `chi_tiet_do_dung.py` | Thay các khối đồ dùng đơn giản bằng mesh/curve chi tiết; gọi `refine()` sau `xay_phong_tro.build()`. |
| `xay_do_dung_chi_tiet.py` | Điểm chạy mới: dựng phòng, áp tinh chỉnh, lưu `.blend`, render một ảnh và xuất JSON thông số. |
| `xem-thu-chi-tiet/` | Ảnh toàn cảnh và cận cảnh; dùng để duyệt hình khối, vật liệu, công năng. |

## Đã cải thiện

- Laptop: bàn phím nổi, phím cách, touchpad, bản lề, webcam, chân cao su; giữ nguồn sáng đêm gốc.
- Sách: tách bìa, gáy, ruột và gờ; gỗ giảm vân sọc gắt.
- Đèn bàn: đế, công tắc, cổ cong, chụp rỗng.
- Bếp: mặt bàn chừa lỗ thật, chậu có thành và đáy, lưới thoát, vòi cong và tay gạt; giá đĩa bằng thanh, đĩa lõm, cốc có lòng và quai, chai nước rửa chén, miếng rửa.
- Ghế: tựa cong nhẹ, bo cạnh, chân có đệm và giằng; giữ cao độ mặt ghế 0,46 m.
- Quần áo: áo có cổ, tay, gấu, móc và nếp; đồ gấp có mép vải.
- Chăn gối: bề mặt phồng, đường may, chăn rủ và mép nệm.
- Quạt: hai nửa lồng, nan, vòng và kẹp, cánh cong, nắp và nút. Chỉ tư thế tĩnh.
- Sinh hoạt: bát rỗng, đũa, bình nước có gân/nắp, xô rỗng có quai, lọ gia vị và băng keo carton.

## Chạy trên Windows

Đặt hai script mới cạnh `xay_phong_tro.py` và `vat_lieu.py` rồi chạy từ thư mục đó:

```powershell
& 'D:/blender/blender.exe' --background --factory-startup --python './xay_do_dung_chi_tiet.py' -- --cam WIDE --mode day --width 1280 --samples 32 --out './xem-thu-chi-tiet/WIDE_day.png' --blend './phong-tro-chi-tiet.blend'
```

Đổi đường dẫn Blender nếu máy khác. Dùng `--no-render` để chỉ lưu scene; `--device cpu` nếu không có GPU OptiX. Camera cũ vẫn dùng được; thêm `PROP_FAN`, `PROP_WARDROBE`, `PROP_CHAIR`, `PROP_SINK` để soi chi tiết. Không cần API tạo ảnh hoặc texture trả phí.

## Claude sử dụng khi dựng

- Chạy entry mới để nhận bản tinh chỉnh. Entry `xay_phong_tro.py` nguyên bản vẫn dựng bản cũ.
- Tọa độ viết theo bản thiết kế; helper `mx()` phản chiếu X. Không phản chiếu lần hai. 1 unit = 1 mét.
- Các collection `PROP_*` và empty `PROP3D_*` phân nhóm **phần chi tiết mới**; không phải rig hoàn chỉnh để kéo cả món đồ. Những phần giữ lại từ scene gốc vẫn ở collection gốc. Nếu cần chuyển vị trí toàn bộ quạt/tủ/bếp, phải gom đủ phần cũ trước.
- Empty `ANCHOR_*` chỉ vị trí tham chiếu: mặt phím/màn hình, ghế, miệng vòi, đĩa, gối, trục quạt, bát và quai xô. Không phải nghiệm IK hay ràng buộc tay đã hoàn tất. Chọn và kiểm tra điểm tiếp xúc theo shot.
- Áo/chăn là mesh tĩnh; không bật mô phỏng vải khi chưa cần. Quạt chưa rig rotor độc lập; `fan_angle` của scene gốc chưa điều khiển cánh mới.
- `.blend` là đầu ra sinh lại được, giữ local; bộ nguồn Python mới là phần cần quản lý phiên bản.

## Kiểm tra và giới hạn

Đã chạy Blender 5.2.3/Cycles OptiX, xuất các góc ngày/đêm và cận đồ dùng. Script kiểm tra ma trận hữu hạn, mesh không rỗng, parenting của anchor và manifold của 10 mesh chính (chậu, cốc, bát, xô, gối, tựa ghế). Các ảnh nháp 24–32 samples có denoise; chưa phải chất lượng phim cuối.

Chưa xác nhận chuyển động, va chạm toàn cảnh, IK cầm nắm, mô phỏng vải, phản chiếu Người Kia hoặc hiệu ứng cổng gương. Ảnh tĩnh không thay thế kiểm tra animatic.


## Sửa tiếp xúc và chiều tựa ghế — 13/11

- Ghế hướng về bàn ở -Y; mặt tựa lõm về phía người ngồi, giữa tựa lùi về +Y. Hai thanh đỡ nằm sau mặt tựa. Không đổi bên tựa khi phản chiếu X.
- Chăn dùng tiết diện ôm cạnh nệm, có đoạn trên mặt ga, cung bo cạnh và vạt ngoài. Tính cả độ dày vải; không hạ Z tuyến tính xuyên vào nệm. Đường viền nệm nằm dưới chăn ở đoạn được che phủ.
- Chân cao su laptop đặt đúng mặt bàn 0,75 m; thân máy nằm cao hơn chân, không để đệm cao su chìm vào mặt bàn.
- Kiểm tra giao cắt trên mesh đã áp modifier giữa chăn với nệm, ga và viền nệm; thêm kiểm tra chiều cong tựa ghế và cao độ hai chân cao su. Đây là kiểm tra các cặp được sửa, chưa phải kiểm tra va chạm toàn bộ scene.
- Camera soi lỗi: `PROP_CHAIR_FRONT`, `PROP_CHAIR`, `PROP_BED_EDGE`, `BED`; ảnh cập nhật ở `sua-tiep-xuc/`. Ảnh trong `xem-thu-chi-tiet/` thuộc lượt trước và chỉ dùng so sánh.
