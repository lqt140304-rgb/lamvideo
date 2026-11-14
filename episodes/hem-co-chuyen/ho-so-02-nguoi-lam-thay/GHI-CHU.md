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

## Dựng lại vùng mặt đầu Nam theo ảnh mẫu — đường cơ sở (2026-11-14)

Thiết kế: [THIET-KE-DAU-THEO-MAU.md](THIET-KE-DAU-THEO-MAU.md); kế hoạch: [KE-HOACH-DAU-THEO-MAU.md](KE-HOACH-DAU-THEO-MAU.md).

- Nguồn mẫu có mặt: chỉ `assets/thiet-ke/thu-3d/mau-3d-dau.webp` (ba góc quay liên tiếp). `mau-dau-tran-*` và `mau-dau-luoi-*` là sọ trọc: dùng so sọ, không có mốc mắt/mũi/miệng. Bảng mốc: `assets/nhan-vat-3d/do_mau_nam.py` (`MOC_MAU`).
- Cách đo: chiếu trực giao mốc cage ở góc quay ƯỚC LƯỢNG (15°, 40°, 90° — chưa đo, cổng 1 kiểm bằng ảnh chồng), khớp tỉ lệ + tịnh tiến với mốc mẫu, sai lệch tính theo % chiều cao mặt (cằm → mí trên, ≈ 236 px). Ngưỡng 3% (trước, nghiêng) / 4% (3/4).
- Tai là mốc chẩn đoán (không tính vào khớp và ngưỡng, vì tai giữ nguyên theo thiết kế).
- Mốc cằm là điểm thấp nhất trong 10 cm sau mặt miệng: nhạy với độ phẳng đáy hàm (đường cơ sở 4,8–14,4% tuỳ góc), đọc kèm ảnh chứ không chỉ theo số.

Đường cơ sở của cage đầu `da0da83` (% sai lệch; `!` = vượt ngưỡng):

| mốc | trước | 3/4 | nghiêng |
|---|---|---|---|
| mắt R: trái / phải / trên / dưới | 6,5! / 2,8 / 10,6! / 7,1! | 4,5! / 2,5 / 10,1! / 6,2! | 3,6! / 1,1 / 9,8! / 7,6! |
| mắt L: trái / phải / trên / dưới | 7,6! / 9,3! / 9,1! / 9,0! | 5,7! / 12,0! / 9,3! / 12,0! | — |
| mũi | 9,4! | 7,0! | 5,9! |
| miệng | 0,5 | 6,1! | 4,9! |
| cằm | 7,6! | 14,4! | 4,8! |
| nốt ruồi | 4,6! | 5,1! | 2,4 |

Kết luận: mắt (mọi góc) và mũi lệch rõ nhất, miệng gần đúng ở mặt trước — khớp với nhận xét của chủ repo (mặt biến dạng chủ yếu ở mắt/mũi).
