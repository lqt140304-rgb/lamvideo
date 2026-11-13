# Ghi chú — Kế hoạch render và đăng theo 2 phần

Quyết định của chủ repo (13/11/2026). Chưa render gì; mọi con số thời gian là **ước lượng, chưa đo trên RTX 3050 6 GB**.

## Quyết định

- Đăng thành **2 phần**, chia theo **nhịp truyện**, không chia theo mốc thời gian cứng.
- Điểm cắt (Cách A): cuối Cảnh 2.2, khoảng 07:45. Hook của phần 1 là vết nứt rỉ nước dưới ánh trăng, chỉ máy quay thấy, Nam không thấy.
- Thời lượng từng cảnh **không cố định**. Cảnh cần khoảng lặng hoặc nhịp chờ để tạo chiều sâu thì được kéo dài; shotlist 15 phút là mốc tham chiếu, không phải giới hạn.
- Cách chốt điểm cắt cuối cùng và việc có đoạn dẫn "phần trước" ở đầu phần 2 hay không: chốt sau khi có animatic.

## Phân phần

| Phần | Cảnh | Mốc tham chiếu (shotlist) | Khung 24 fps (tham chiếu) |
|---|---|---|---|
| Phần 1 | Hồi 1 (1.1–1.4) + chuyển hồi + Cảnh 2.1 + chuyển + Cảnh 2.2 | 00:00–07:45 | khoảng 11.160 |
| Phần 2 | Chuyển 2.2→2.3 + Cảnh 2.3, 2.4 + chuyển hồi + Hồi 3 (3.1–3.5) | 07:45–15:00 | khoảng 10.440 |

Tổng tham chiếu 21.600 khung. Khi cảnh nào được kéo dài thì số khung tăng theo; ghi lại ở bảng đo bên dưới.

## Đơn vị render

- Đơn vị nhỏ nhất là **shot**; đơn vị duyệt là **cảnh**. Bước chuyển cảnh gộp với cảnh liền sau.
- Thư mục đầu ra: `what-if-studio/out/<slug-tap>/phan-01/<canh>/` và `phan-02/<canh>/`. Không commit khung hay video.
- Sửa cảnh nào thì chỉ render lại cảnh đó. Không gộp cả phần thành một job render.

## Cài đặt

| Mục đích | Cài đặt |
|---|---|
| Duyệt bố cục, nhịp | Ảnh tĩnh, hoặc `STEP=2`, 640 px, 14 mẫu |
| Bản cuối | `STEP=1`, 960 px, 32 mẫu, khử nhiễu, 24 fps; dùng chung một bộ cho mọi cảnh để màu không lệch |
| Cảnh camera đứng yên | Render nền một lần rồi tái dùng |
| Cảnh ít chuyển động | Có thể `STEP=2`; shot hành động và xoay camera dùng `STEP=1` |

Máy: RTX 3050 6 GB, chạy `BLENDER_DEVICE=GPU` (xem `assets/boi-canh-3d/HUONG-DAN-RENDER-GPU.md`). Kiểm log có dòng `[render] dùng GPU OPTIX`.

## Thứ tự làm

1. Đo thời gian mỗi khung trên một shot mẫu (ví dụ `ORBIT_GUONG`), điền vào bảng đo.
2. Animatic cho phần 1, chốt nhịp và độ dài từng cảnh, rồi mới render cuối.
3. Render cuối phần 1 theo từng cảnh, duyệt ảnh nhỏ, ghép Remotion, đăng.
4. Làm tương tự cho phần 2, có thể bắt đầu animatic trong lúc phần 1 đang render.

## Bảng đo thực tế (điền sau khi chạy)

| Cảnh | Số khung | Giây/khung | Tổng thời gian | Trạng thái |
|---|---|---|---|---|
| (chưa đo) | | | | |
