# Thiết kế biểu cảm khuôn mặt 3D — Hồ sơ 02

Trạng thái: **bản thiết kế chờ chủ repo duyệt. Chưa dựng gì.** Mục "Quyết định" là lời chủ repo; mục "Lựa chọn của trợ lý" là đề xuất, chưa ai duyệt.

## Ý đồ

Biểu cảm dùng ở **khoảnh khắc nhân vật đổi cảm xúc theo lời thoại**. Người xem phải nhận ra biểu cảm chính của nhân vật, kể cả trên màn hình điện thoại ([QUY-CHUAN-3D](../../../docs/QUY-CHUAN-3D.md): mắt, mí, lông mày, miệng).

## Hiện trạng (đã đọc trong mã)

Nguồn: [dung_dau_nam.py](assets/nhan-vat-3d/dung_dau_nam.py).

- Chỉ có **đầu Nam**. Chưa có Người Kia, Tùng, Mẹ. Chưa có shape key hay rig mặt nào.
- Mắt, miệng, tai nằm trong lưới `Head_Base`. Lông mày, con ngươi, viền mắt, nét miệng, nốt ruồi là **các vật rời**, đặt lên mặt một lần bằng tia dò, không gắn vào đầu.
- Tròng trắng là mặt nạ thủ tục trong vật liệu da, chưa chắc đi theo mí khi mặt biến dạng.
- Miệng chỉ là rãnh lõm. Chưa có khoang miệng, răng, lưỡi trong lưới.

Hệ quả: nếu biến dạng mặt mà không gắn các vật rời, chúng sẽ lòi ra viền, đè nhau hoặc lệch. Đây là lỗi chủ repo muốn tránh.

## Quyết định (chủ repo)

1. Làm theo **cách A**: shape key trên `Head_Base`, gắn các chi tiết mặt vào đầu, có script kiểm tự động.
2. **Chỉ 2 mức độ** mỗi nhóm cảm xúc (thay vì 3 mức trong checklist).
3. Tiêu chí đạt: người xem nhận ra biểu cảm chính; không chi tiết nào lòi ra ngoài viền hay đè lên; chi tiết bám sát khuôn mặt, không lệch.

## Mục tiêu

- Bộ shape key biểu cảm cho đầu Nam, điều khiển được bằng thanh trượt 0–1 và chuyển mượt giữa các trạng thái theo lời thoại.
- Mọi chi tiết mặt đi theo mặt ở mọi biểu cảm và góc nhìn.
- Có bước kiểm tự động và bảng ảnh nhỏ để duyệt, để không phải render video.

## Không làm (lần này)

- Khẩu hình tiếng Việt (visemes) khớp ElevenLabs. Thiết kế không được chặn việc thêm sau.
- Mức cực điểm (cấp 3) trong checklist: mồ hôi, tĩnh mạch, đổi màu da. Đây là hiệu ứng shader, làm riêng nếu cần.
- Rig toàn thân, IK/FK, tay cầm đạo cụ.
- Người Kia, Tùng, Mẹ. Làm sau khi Nam đạt, tái dùng cách làm.
- Sửa nhận diện đã duyệt của Nam.

## Điều làm hỏng dù chạy được (anti-goals)

- Mặt ở trạng thái nghỉ khác bản đầu Nam đã duyệt.
- Nốt ruồi trái của Nam đổi bên hoặc trôi quá xa vị trí.
- Các biểu cảm trông là cùng một mặt chỉ đổi chút xíu, khó phân biệt ở cỡ ảnh nhỏ.
- Qua được kiểm tự động nhưng nhìn bằng mắt thấy méo hoặc lệch.

## Ràng buộc

- Blender 5.0.1, chạy bằng `bpy`. Duyệt bằng ảnh tĩnh nhỏ, ít mẫu; không render video (xem [KINH-NGHIEM](../../../docs/KINH-NGHIEM.md)).
- Không đổi lưới nghỉ của `Head_Base` ngoài phần cần cho khoang miệng; mọi thay đổi nằm trong shape key hoặc phần thêm.
- Máy dựng: RTX 3050 6 GB. Ảnh duyệt nhỏ nên không phụ thuộc GPU.
- Không đưa `.blend` hay ảnh nặng lên repo.

## Các phương án đã cân nhắc

| | Cách | Kết luận |
|---|---|---|
| A | Shape key + gắn vật rời vào mặt + kiểm tự động | **Chọn.** Đúng quy chuẩn 3D và checklist, dễ tái dùng cho nhân vật khác |
| B | Xương mặt điều khiển vật rời, da không biến dạng | Bỏ: rủi ro lòi/đè cao nhất |
| C | Vẽ mắt, mày, miệng bằng shader trên da | Bỏ: khác hướng quy chuẩn, khó làm miệng há có răng và mặt nghiêng |

## Lựa chọn của trợ lý (chưa duyệt)

1. **Hai mức = Cấp 1 (thoáng qua) + Cấp 2 (rõ nét)** trong ma trận của [checklist](CHECKLIST-TIEN-KY-ASSET.md#4-bảng-ma-trận-biểu-cảm-3-cấp-độ-3-level-emotion-matrix). Bỏ Cấp 3 vì đó là hiệu ứng shader.
2. **Danh sách shape key cho Nam (6):** `ngai_ngu` / `kiet_suc`, `tu_ai` / `thi_uy`, `hoang_mang` / `kinh_hoang`. Trạng thái nghỉ là `neutral` (không shape key).
3. **Danh sách cho Người Kia (2, làm sau):** `neutral_smile` / `eerie_smirk`. `calm` là tư thế nghỉ, không cần shape key riêng.
4. **Khoang miệng tối giản** (khoang tối, răng, lưỡi) để `hoang_mang`, `kinh_hoang`, `thi_uy` có miệng há. Thêm như phần phụ, không đổi lưới nghỉ.
5. **Tên mã và vị trí file:** mã mới `assets/nhan-vat-3d/bieu_cam_nam.py` gọi dựng đầu từ `dung_dau_nam.py`, không sửa file đã duyệt.
6. **Chuyển giữa hai mức của một nhóm:** hai shape key riêng, pha trộn bằng thanh trượt; chuyển giữa hai nhóm khác nhau bằng keyframe trên timeline.
7. Số liệu ngưỡng ở mục Nghiệm thu là **đề xuất**, người dựng có thể chỉnh nếu đo thấy không hợp lý.
8. Quy chuẩn 3D ghi "tối thiểu 18 shape key 3 cấp". Thiết kế này giảm theo lời chủ repo; **chưa sửa** quy chuẩn hay checklist chung, cần cập nhật khi nghiệm thu.

## Nghiệm thu

Chạy cho **từng shape key ở giá trị 1,0 và 0,5**, ở 5 góc: chính diện, 3/4 trái, 3/4 phải, nghiêng trái, nghiêng phải.

| Kiểm | Đề xuất ngưỡng |
|---|---|
| Lông mày, con ngươi, viền mắt, nét miệng, nốt ruồi bám mặt | Khoảng cách tới mặt da ≤ 1 mm, đo bằng tia dò |
| Không lòi ra ngoài viền | Hình chiếu của mọi chi tiết nằm trong bóng đầu ở góc chính diện và nghiêng |
| Không đè nhau | Lông mày không cắt viền mắt; con ngươi nằm trong tròng trắng |
| Nhận diện | Nốt ruồi vẫn bên trái, lệch vị trí nghỉ không quá vài mm; mặt nghỉ trùng bản đã duyệt |
| Đọc được | Bảng ảnh nhỏ (kích thước điện thoại) cho cả bộ để chủ repo duyệt bằng mắt |

Kết quả ghi vào `LOI-TON-DONG.md` và [CHECKLIST](CHECKLIST-TIEN-KY-ASSET.md) theo đúng trạng thái đo được. Không ghi `[x]` khi chưa chạy.

## Để người dựng quyết

- Cách gắn từng vật rời (Surface Deform, Shrinkwrap hay gắn đỉnh), miễn qua được mục Nghiệm thu.
- Cách để tròng trắng đi theo mí (mặt nạ theo thuộc tính đỉnh hoặc chuyển thành hình học).
- Cách dựng khoang miệng, miễn không đổi lưới nghỉ.
- Thứ tự dựng từng nhóm cảm xúc.
- Khung ảnh duyệt, miễn nhỏ và đủ 5 góc.

## Cách chia việc theo model (theo CLAUDE.md)

Phiên chính dựng lượt đầu. Sửa lỗi đã rõ nguyên nhân giao cho Sonnet. Tìm, kiểm, push giao cho Haiku. Kết quả agent chỉ là báo cáo; phiên chính kiểm lại bằng lệnh và ảnh.
