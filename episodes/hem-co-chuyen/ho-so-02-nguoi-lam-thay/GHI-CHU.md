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

Đường cơ sở của cage đầu `da0da83` (% chiều cao mặt; sau khi tách `mat_*` = cả vòng mắt và `khe_*` = khe hở; góc quay ước lượng 12°/44°/90°):

| mốc | trước | 3/4 | nghiêng |
|---|---|---|---|
| mắt gần (R) — vòng mắt trái/phải/trên/dưới | 3,1 / 3,6 / 0,3 / 1,5 | 2,1 / 0,8 / 2,7 / 1,3 | 2,8 / 1,8 / 1,1 / 3,4 |
| mắt gần (R) — khe trái/phải/trên/dưới | 4,8 / 5,8 / 2,5 / 0,7 | 4,4 / 2,9 / 3,0 / 0,8 | 3,8 / 2,2 / 1,2 / 2,3 |
| mắt xa (L) — vòng mắt trái/phải/trên/dưới | 8,5 / 5,8 / 2,0 / 3,8 | 8,5 / 12,4 / 2,5 / 6,8 | — |
| mắt xa (L) — khe trái/phải/trên/dưới | 9,8 / 6,3 / 2,1 / 3,1 | 8,2 / 11,5 / 2,3 / 5,7 | — |
| mũi | 4,7 | 8,7 | 3,0 |
| miệng | 3,8 | 4,2 | 4,2 |
| cằm | 8,0 | 12,9 | 5,3 |
| nốt ruồi | 8,8 | 12,8 | 6,6 |

Kết luận: mắt xa (L) và mũi, cằm, nốt ruồi lệch rõ nhất; mắt gần gần đúng. Nguyên nhân mắt xa: khung mắt của cage xoay 31° quanh trục dọc (mắt bọc quanh mặt hơn mẫu), nên mắt xa hẹp hơn mẫu ở mặt trước và 3/4. (Bảng đầu tiên trong ngày này đo lẫn khe và vòng mắt nên không dùng.)

### Task 4 — mắt (EYE_TUNE)

- Đòn bẩy trong `dung_dau_cage_nam.py`: `EYE_TUNE = dict(es=1.11, du=0.0065, dw=0.015, yaw=9.0)` = tỉ lệ cụm mắt, dịch ngang/dọc (m), xoay khung mắt quanh trục dọc (độ). Tìm bằng cách mô phỏng phép biến đổi lên đỉnh viền mắt và cực tiểu hoá hàm đo; xoay 13° tốt nhất cho mặt trước/3-4 nhưng làm xấu mặt nghiêng, chọn 9° để cân. Lưới lân cận kéo theo bằng nội suy Shepard (`mat_theo_mau_nam.shepard`), đường khâu và vòng miệng ghim.
- Đã thử tăng độ lồi nhãn cầu (APEX/DD ×1,7 và ×2,4): số đo mắt không đổi, kiểm tự giao và lọt hốc FAIL → hoàn lại. Vòng 8 đỉnh giữ nguyên (topology lưới cố định); độ tròn kiểm bằng mắt ở cổng 1.
- Số đo sau chỉnh (trung vị / lớn nhất của nhóm mắt): trước 3,1 / 7,0; 3/4 4,1 / 8,8; nghiêng 3,3 / 5,4 (ngưỡng 3 / 4 / 3 cộng sai số đọc ảnh 1,3).
