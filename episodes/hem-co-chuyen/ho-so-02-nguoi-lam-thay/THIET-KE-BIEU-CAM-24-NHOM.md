# Thiết kế công cụ biểu cảm mở rộng — hướng tới 24 nhóm × 2 mức

Trạng thái: **bản thiết kế chờ chủ repo duyệt. Chưa dựng gì.** Mục "Quyết định" là lời chủ repo; mục "Lựa chọn của trợ lý" là đề xuất chưa duyệt. Tiếp nối [THIET-KE-BIEU-CAM.md](THIET-KE-BIEU-CAM.md) (6 biểu cảm đầu Nam, đã làm).

## Ý đồ

Chủ repo làm 3 bảng phác thảo biểu cảm làm **chuẩn đích để hướng tới**: 24 nhóm cảm xúc × 2 mức (Nhẹ, Rõ), tức 48 trạng thái. **Tất cả đều cần cho phim.** Bộ biểu cảm 3D phải đạt đúng những gì 3 bảng này diễn đạt, để người xem nhận ra cảm xúc nhân vật khi nó đổi theo lời thoại.

Ba bảng (bản gốc chủ repo tạo, ảnh 1254×1254):

| Bảng | Nhóm | Nhóm biểu cảm (key theo bảng) |
|---|---|---|
| 1/3 Nhóm cơ bản | 8 | `binh-than`, `buon-ngu`, `vui`, `buon`, `tuc-gian`, `so-hai`, `bat-ngo`, `nghi-ngo` |
| 2/3 Nội tâm & trạng thái | 8 | `suy-luan`, `kim-nen`, `nhe-nhom`, `boi-roi`, `buong-xuoi`, `kiet-suc`, `lo-lang`, `toi-loi` |
| 3/3 Sắc thái đặc biệt (Nam / Người Kia) | 8 | `cuoi-che-giau` (Người Kia), `ghe-so`, `khinh-thuong`, `ngai-ngu` (ngại ngùng), `quyet-tam`, `tu-man`, `tui-than`, `ma-quai` (trừng cười, Người Kia) |

Các bảng là **ảnh phác 2D của một đầu có tóc, tỉ lệ khác** đầu 3D hiện tại. "Đạt" nghĩa là đọc ra đúng biểu cảm và nhóm cảm xúc, không phải trùng từng nét.

## Hiện trạng

Đầu Nam có 6 shape key 2 mức, chi tiết mặt gắn vào đầu, miệng há bằng dải da kéo giãn và mặt nạ tối, bộ kiểm tự động, tái sử dụng được trên đầu khác. Chi tiết ở [THIET-KE-BIEU-CAM.md](THIET-KE-BIEU-CAM.md#kết-quả-thực-hiện-và-chênh-lệch-so-với-thiết-kế) và `assets/nhan-vat-3d/bieu_cam/`.

Đối chiếu với 3 bảng, hệ hiện tại **còn thiếu** (kiểm trên ảnh mẫu):

| Thiếu | Ví dụ trong bảng |
|---|---|
| **Hướng nhìn** (con ngươi là vật cố định, chưa dời được) | `nghi-ngo`, `suy-luan` (nhìn lên), `lo-lang`, `ghe-so`, `ngai-ngu` (liếc, nhìn xuống) |
| **Nhắm mắt** (hẳn, và dạng vòng cung khi cười) | `vui` Rõ, `buon-ngu` Rõ, `kiet-suc` Rõ, `nhe-nhom` Rõ |
| **Răng, lưỡi, nhiều dạng miệng** (cười, mếu, "o", ngáp, nghiến, méo, nhếch) | `vui`, `tuc-gian` Rõ, `quyet-tam` Rõ, `ma-quai`, `buon-ngu` Rõ |
| **Hiệu ứng da** (nước mắt, giọt mồ hôi, má ửng) | `buon` Rõ, `tui-than`, `kim-nen`, `toi-loi`, `boi-roi`, `lo-lang`, `ngai-ngu` Rõ |
| **Nhăn mũi, đẩy má** | `ghe-so`, `khinh-thuong` |

## Mục tiêu

- Một **bộ công cụ** đủ để diễn đạt mọi biểu cảm trong 3 bảng: hướng nhìn, nhắm mắt, răng/lưỡi/các dạng miệng, nước mắt/mồ hôi/má ửng, nhăn mũi và đẩy má.
- Mọi công cụ **điều khiển được bằng giá trị 0–1 hoặc hai trục** và hòa trộn được giữa các biểu cảm theo thời gian.
- **Chứng minh từng công cụ** bằng ít nhất một biểu cảm mẫu lấy từ chính 3 bảng, kiểm tự động và so với ảnh mẫu.
- Mở rộng bộ kiểm tự động theo từng công cụ.
- Mỗi biểu cảm mẫu có **bảng so sánh** (ảnh mẫu bên trái, đầu 3D bên phải) để chủ repo duyệt.

## Không làm (lần này)

- Điền đủ 48 trạng thái. Đó là 3 dự án sau, mỗi bảng một thiết kế/kế hoạch riêng.
- Khẩu hình tiếng Việt (visemes), rig toàn thân, tóc, Tùng, Mẹ.
- Dò điểm mốc tự động trên ảnh mẫu rồi tính độ dời (đã cân nhắc, bỏ).

## Điều làm hỏng dù chạy được

- Biểu cảm đọc ra **sai nhóm cảm xúc** dù qua kiểm hình học (ví dụ `buon` và `so-hai` nhìn như nhau).
- Công cụ chỉ chạy ở góc chính diện: nước mắt, răng, con ngươi lòi hoặc lệch ở góc 3/4 và nghiêng.
- Con ngươi vẫn lộ trên mí khi mắt nhắm; răng hoặc lưỡi lòi ra ngoài môi; nước mắt rơi khỏi mặt.
- Nốt ruồi hoặc nhận diện của nhân vật đổi.
- Bộ công cụ dính riêng đầu Nam, không áp được lên đầu khác.
- Hiệu ứng (má ửng, nước mắt) nhìn như dán nhãn lên mặt thay vì thuộc về da.

## Ràng buộc

- Blender 5.0.x `bpy`; môi trường như đã dùng (`/tmp/bpyenv`, xem README tập). Không sửa `dung_dau_nam.py`.
- Mặt nghỉ (mọi giá trị = 0) trùng bản đã duyệt.
- Giữ kỹ thuật đã chạy tốt: shape key, gắn vật rời vào mặt, mặt nạ theo thuộc tính đỉnh. Hiệu ứng điều khiển bằng giá trị của shape key (ví dụ driver) để áp được cho đầu khác.
- Chỉ ảnh tĩnh nhỏ, không render video. Không commit `.blend`, ảnh nặng. Ảnh mẫu lưu dạng nén (WebP/JPEG), không phải PNG gốc 2,6 MB.
- Chia model theo CLAUDE.md: dựng lượt đầu Opus, sửa nhỏ Sonnet, tìm/kiểm/push Haiku.

## Các phương án đã cân nhắc

| | Cách | Kết luận |
|---|---|---|
| 1 | Theo từng bảng, thêm công cụ khi gặp | Không chọn |
| 2 | **Công cụ trước**, rồi điền 48 định nghĩa | **Chủ repo chọn** |
| 3 | Tự khớp từ ảnh mẫu (dò điểm mốc) | Bỏ: ảnh 2D của đầu khác, sai số lớn, không thay được mắt người duyệt |

## Quyết định (chủ repo)

1. Cả 24 nhóm × 2 mức đều cần cho phim; 3 bảng là đích.
2. Làm **công cụ trước** (cách 2).
3. Chủ repo tự tạo 3 bảng làm chuẩn tham khảo; giữ nguyên làm chuẩn.

## Lựa chọn của trợ lý (chưa duyệt)

1. **Tên key theo bảng** (`binh_than`, `buon_ngu`, ...). `ngai_ngu` cũ (ngái ngủ) đổi thành `buon_ngu`, nhường `ngai_ngu` cho "ngại ngùng".
2. **"Rõ = mức 3" trong chú thích bảng** hiểu là đích mạnh nhất; hệ thống gọi đó là **mức 2** (Nhẹ = mức 1, Rõ = mức 2).
3. **`tu_ai`, `thi_uy`** không có trong bảng; giữ nguyên, chủ repo quyết giữ hay bỏ khi làm các bảng.
4. **Công cụ chứng minh bằng 9 nhóm biểu cảm mẫu** lấy từ bảng (`nghi_ngo`, `suy_luan`, `buon_ngu`, `vui`, `tuc_gian`, `tui_than`, `lo_lang`, `ngai_ngu`, `ghe_so`), mỗi nhóm ở mức Rõ (mức Nhẹ làm kèm):

   | Công cụ | Biểu cảm mẫu (mức Rõ trừ khi ghi) |
   |---|---|
   | Hướng nhìn | `nghi_ngo`, `suy_luan` (nhìn lên) |
   | Nhắm mắt | `buon_ngu` (nhắm hẳn), `vui` (nhắm vòng cung) |
   | Răng, lưỡi, dạng miệng | `vui` (cười há, răng + lưỡi), `tuc_gian` (nghiến răng), `buon_ngu` (ngáp) |
   | Nước mắt | `tui_than` |
   | Mồ hôi | `lo_lang` |
   | Má ửng | `ngai_ngu` |
   | Nhăn mũi, đẩy má | `ghe_so` |

   `vui` và `buon_ngu` dùng cho hai công cụ mỗi nhóm. Người dựng chốt danh sách cuối nếu thấy cần thêm nhóm để chứng minh một công cụ.
5. **Hướng nhìn là điều khiển độc lập** (hai trục `nhin_x`, `nhin_y`), đồng thời mỗi biểu cảm có thể mang hướng nhìn mặc định; cả hai cộng lại và giới hạn trong khe mắt.
6. **Hiệu ứng (nước mắt, mồ hôi, má ửng, răng, lưỡi) điều khiển bằng giá trị shape key**, khai báo trong định nghĩa JSON (`hieu_ung`), không phải cờ bật tắt riêng.
7. **Ảnh mẫu lưu vào hồ sơ tập** dạng nén tại `assets/tham-chieu-bieu-cam/`; cắt từng ô bằng lưới đều. Bảng 1/3 = `cbea6ebe`, 2/3 = `6cdd3f4e`, 3/3 = `e0add81a` (tên tệp tải lên).
8. **Chia dự án:** (0) bản thiết kế này (công cụ + biểu cảm mẫu); (1) điền bảng 1; (2) điền bảng 2; (3) điền bảng 3 kèm Người Kia. Mỗi dự án có thiết kế và kế hoạch riêng, chạy tuần tự.

## Yêu cầu từng công cụ và nghiệm thu

Mọi công cụ qua kiểm ở 5 góc (chính diện, 3/4 trái, 3/4 phải, nghiêng trái, nghiêng phải), giá trị 1,0 và 0,5, và chạy được khi hai key bật cùng lúc.

| Công cụ | Yêu cầu | Kiểm tự động |
|---|---|---|
| **Hướng nhìn** | Con ngươi dời trong khe mắt theo `nhin_x`, `nhin_y` ∈ [−1, 1], vẫn nằm trên mặt và bám da | Con ngươi trong khe mắt ở mọi tổ hợp; bám da như lúc nghỉ; không đè viền mắt |
| **Nhắm mắt** | Nhắm một phần đến nhắm hẳn bằng một giá trị; nhắm hẳn không còn lộ tròng trắng hay con ngươi; có dạng vòng cung khi cười | Khi nhắm hẳn: con ngươi bị che, không còn tròng trắng nhìn thấy, viền mắt vẫn trong mặt |
| **Răng, lưỡi, dạng miệng** | Miệng cười, mếu, "o", ngáp, nghiến, méo, nhếch qua một hay nhiều key; răng và lưỡi chỉ nằm trong miệng | Răng/lưỡi nằm trong khoang tối; không lòi ra ngoài môi; môi không xuyên nhau |
| **Nước mắt** | Giọt và vệt nước chảy trên má, bám da; mức độ theo giá trị | Mọi điểm nước mắt trong sai số bám da; không rời mặt ở 5 góc |
| **Mồ hôi** | Giọt mồ hôi nằm trên thái dương hoặc trán | Như trên |
| **Má ửng** | Vùng má hồng mềm, thuộc về da, không có viền gắt | Chỉ trên vùng má; không lan sang mắt, mũi, miệng |
| **Nhăn mũi, đẩy má** | Nhăn sống mũi và đẩy má lên khi ghê sợ, khinh thường | Kiểm hình học chung vẫn qua |

Nghiệm thu chung:
- Bộ kiểm hiện có (bám, lòi viền, đè, nhận diện, mặt nghỉ trùng) chạy cho mọi key mới và hiệu ứng mới mà không nới ngưỡng.
- **Bảng so sánh** cho từng biểu cảm mẫu: ảnh mẫu bên trái, đầu 3D bên phải, hai mức, ba góc. Chủ repo duyệt bằng mắt; chưa duyệt thì chưa tính là đạt.
- Áp bộ công cụ lên **một đầu thứ hai** (đối xứng hoặc rộng hơn) và qua cùng các kiểm. Chưa qua thì chưa ghi "dùng lại được".

## Để người dựng quyết

- Cách làm từng công cụ (shader, shape key, vật phụ hay driver), miễn qua nghiệm thu.
- Cách che con ngươi và tròng trắng khi nhắm mắt.
- Cách dựng răng và lưỡi (mặt nạ trong khoang tối hay hình học nhỏ).
- Cách dựng nước mắt, mồ hôi (vật nhỏ gắn da hay mặt nạ trên da).
- Cắt ảnh mẫu theo lưới, tên tệp, độ nén.
- Thứ tự dựng các công cụ.

## Rà soát của người dựng (đã làm, tự rà)

- **Đã trả lời bằng bối cảnh:** tên tệp ảnh tải lên ↔ bảng 1/2/3; bố cục lưới 2 cột × 4 hàng, mỗi ô hai đầu (Nhẹ, Rõ).
- **Quyết nhỏ, ghi ở "Lựa chọn của trợ lý":** quy tắc đặt tên, mức 2 = Rõ, 9 nhóm biểu cảm mẫu, hướng nhìn là điều khiển độc lập.
- **Chỉ chủ repo trả lời được:** có lưu ảnh mẫu vào repo không (mỗi ảnh nén khoảng vài trăm KB); và `tu_ai`/`thi_uy` giữ hay bỏ (có thể hoãn đến lúc làm bảng).
