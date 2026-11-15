# Thiết kế: mặt diễn xuất, IK tay, ngón tay và da liền màu cho base nữ

Ngày 14/11/2026. Nguồn: [base nữ 001](../../../assets/nhan-vat-3d/nhan-vat-nu-goc/README.md), [rig cơ bản](../../../assets/nhan-vat-3d/nhan-vat-nu-rig/README.md) (nhánh `claude/nhan-vat-nu-rig`).

## Mục đích

Nhân vật nữ sẽ có cảnh cận mặt và nói thoại, nên khẩu hình phải khớp lời. Mắt, con ngươi và lông mày phải cử động được để diễn nhiều biểu cảm. Thân phải liền một màu da, không còn vệt hay nếp ở chỗ bộ đồ cũ đổi màu, để làm nền mặc quần áo về sau. Tay cần IK và các ngón phải điều khiển được.

## Mục tiêu

1. **Mắt:** nhãn cầu thật có con ngươi, xoay được để nhìn quanh. Có mí trên và mí dưới để chớp, nheo, mở to.
2. **Lông mày:** tách thành mảnh riêng, mỗi bên nâng, hạ, nhíu, nghiêng được.
3. **Miệng nói thoại:** có xương hàm, khoang miệng, răng trên, răng dưới và lưỡi. Có bộ shape key khẩu hình theo âm tiếng Việt, cộng các shape key nền cho cười, mếu, chu, mím, kéo khóe.
4. **IK tay** có điều khiển hướng khuỷu. Tay và chân đều có công tắc chuyển IK/FK (theo [quy chuẩn 3D](../../QUY-CHUAN-3D.md)).
5. **Ngón tay:** mỗi ngón 3 đốt, ngón cái cũng 3 đốt. Mỗi ngón cong riêng; giữ thêm thanh `fist` để nắm cả bàn.
6. **Da liền màu:** làm bản texture mới. Phủ màu da lên vùng bộ đồ, xóa nếp vải trong normal map, chỉnh roughness cho đồng nhất. Cổ, cổ tay, cổ chân không còn vệt.

## Không làm lần này

- 18 shape key cảm xúc có tên trong quy chuẩn (`ngai_ngu`, `kiet_suc`…). Lần này chỉ dựng các điều khiển nền để ghép ra những biểu cảm đó. *(Hỏi chủ repo, xem cuối tài liệu.)*
- Tự động chuyển audio ElevenLabs thành khẩu hình. Lần này chỉ chuẩn bị sẵn bộ khẩu hình và bảng âm → khẩu hình để công cụ đó dùng về sau.
- Quần áo, tóc, điều khiển cơ mặt chi tiết kiểu má hay cánh mũi, và làm lại lưới toàn thân.

## Điều không được để xảy ra

- Khuôn mặt sau khi sửa không còn giống mẫu: mắt to, mũi nhỏ, nét cười hiền phải giữ.
- Vẽ lại mặt thành hình 2D dán lên đầu (cách B đã loại).
- Sửa đè lên texture hoặc file base gốc.
- Thân có vệt sáng tối hoặc đường may lộ ở cổ, cổ tay, cổ chân.

## Ràng buộc

- Chạy trên Blender 5.2.3, dựng lại bằng script (`-b --factory-startup`) giống `rig_nu.py`, kèm bộ tự kiểm.
- Nguồn hình khối lấy từ `nhan-vat-nu-goc.blend`. File base gốc chỉ đọc, không sửa.
- Tên xương, bone collection và chiều xoay theo `rig_nu.py` và `rig_nam.py`. Nhân vật nhìn về −Y; `.L` là bên trái nhân vật (+X).
- Texture mới đặt trong thư mục rig. Texture gốc trong `nhan-vat-nu-goc/nguon/` giữ nguyên.
- Phong cách Stylized 3D Soft PBR theo [mỹ thuật chung](../../PHONG-CACH-MY-THUAT.md).
- Chỉ duyệt bằng ảnh tĩnh; chỉ render video khi chủ repo yêu cầu.

## Các cách đã cân nhắc (phần mặt)

| Cách | Đánh đổi | Kết quả |
|---|---|---|
| A. Dựng lại toàn bộ mặt bằng hình khối 3D | Đẹp, linh hoạt nhất; tốn công nhất, dễ lệch khỏi mẫu | Loại |
| B. Mặt vẽ 2D dán lên đầu 3D | Rẻ, khớp khẩu hình dễ; phẳng khi cận mặt, trái quy chuẩn | Loại |
| **C. Lai: chỉ dựng lại phần cử động** | Giữ khuôn mặt mẫu; tập trung công vào mắt và miệng | **Chủ repo chọn** |

IK tay, ngón tay và da liền màu chỉ có một cách hợp lý nên không bày phương án.

## Cách làm đã chốt

### Mắt
- Khoét hốc mắt phẳng hiện có. Thay bằng nhãn cầu cầu tròn: tròng trắng, mống mắt và con ngươi lấy màu từ texture gốc. Vị trí và cỡ khớp đúng hốc mắt cũ, để nhìn thẳng thì giống mẫu.
- Xương `eye.L/R` xoay nhãn cầu. Điều khiển `look` đặt trước mặt; hai mắt nhìn theo nó (Damped Track) và vẫn chỉnh riêng từng mắt được.
- Mí trên và mí dưới là lớp lưới riêng ôm sát nhãn cầu, giữ viền mi đen và hàng mi của mẫu. Xương `lid_up.L/R` và `lid_lo.L/R` xoay quanh tâm nhãn cầu. Thêm thuộc tính `blink` (0–1) cho mỗi bên.

### Lông mày
- Tách vạt mày nổi hiện có thành object riêng; vá chỗ trán bị lộ khi tách cho liền da.
- Mỗi bên 3 xương (đầu, giữa, đuôi mày): nâng, hạ, nhíu vào, nghiêng.

### Miệng
- Làm lại lưới vùng quanh miệng (từ dưới mũi tới cằm, giữa hai má) cho dày, với các vòng lưới quanh môi. Viền vùng này phải nối liền với lưới mặt cũ.
- Thêm khoang miệng, răng trên, răng dưới, lưỡi. Xương `jaw` mở hàm; răng dưới và lưỡi đi theo hàm.
- Shape key nền: `cuoi`, `meu`, `chu_moi`, `mim_moi`, `keo_khoe.L/R`, `ha_khoe.L/R`, `nhech.L/R`.
- Shape key khẩu hình (viseme) tiếng Việt: `A` (a, ă, â), `E` (e, ê), `I` (i, y), `O` (o, ô, ơ), `U` (u, ư), `MBP` (m, b, p), `PHV` (ph, v), `NT` (n, t, đ, d, l), `CH` (ch, tr, s, x, gi), `KG` (c, k, g, ng, nh, kh), `nghi` (ngậm). Ghi bảng âm → khẩu hình vào README.
- Mỗi viseme đi kèm một độ mở hàm gợi ý; người làm diễn hoạt kết hợp shape key với xương `jaw`.

### IK tay, IK/FK
- `ik_hand.L/R` (điều khiển cổ tay) và `pole_elbow.L/R` (hướng khuỷu). Thuộc tính `ik_fk` (0 = FK, 1 = IK) cho mỗi tay và mỗi chân, lái độ ảnh hưởng của ràng buộc IK.
- Bàn tay khi bật IK xoay theo `ik_hand`.

### Ngón tay
- Bốn ngón, mỗi ngón 3 đốt: `index1-3`, `middle1-3`, `ring1-3`, `pinky1-3`; ngón cái `thumb1-3`.
- Trọng số từng ngón gán theo vùng lưới của ngón (rãnh giữa các ngón), mỗi đốt chuyển mềm theo khoảng cách dọc ngón.
- Thanh `fist` vẫn có, giờ lái cả 15 đốt.

### Da liền màu
- Tìm vùng bộ đồ trên texture diffuse theo màu (xám tối, độ bão hòa thấp). Tô màu da lấy mẫu từ cổ và tay, có viền chuyển mềm vài pixel để không lộ mép.
- Trong normal map, thay vùng bộ đồ bằng mặt phẳng trung tính, viền chuyển mềm, để xóa nếp vải và gờ cổ áo.
- Roughness và metallic vùng đó lấy giá trị của da.
- Nếu ở cổ, cổ tay hoặc cổ chân còn gờ hình khối thật, làm trơn cục bộ các đỉnh đó.

## Các quyết định do trợ lý tự chốt (chủ repo kiểm lại khi đọc)

- **Màu và nét vẽ của vùng miệng mới:** chuyển UV từ lưới cũ sang, nên nét cười vẽ sẵn vẫn còn khi ngậm miệng. Trong miệng tô hồng sẫm.
- **Răng và lưỡi:** khối mềm đơn giản theo phong cách hoạt hình, không có từng chiếc răng.
- **Cách chia script:** tách theo việc. `da_lien_mau.py` làm texture da, `mat_nu.py` làm mắt, mày, miệng. `rig_nu.py` mở rộng thêm IK tay, IK/FK và ngón, đồng thời gọi hai script kia để ra một file `.blend` duy nhất.
- **Viseme:** tạm dùng 11 nhóm âm như trên. Có thể gộp hoặc tách sau khi thử với audio thật.

## Phần để người dựng quyết

- Số đỉnh và kiểu lưới cụ thể của vùng miệng mới, miễn khớp viền và biến dạng mượt.
- Vị trí xương mặt và độ lớn của từng shape key, căn theo ảnh thử.
- Cách vá trán sau khi tách mày, miễn liền da và không lộ đường.
- Thuật toán tìm vùng bộ đồ và độ rộng viền chuyển màu.

## Kiểm tra trước khi giao

Script tự kiểm:
- Hai mắt nhìn theo `look`.
- `blink=1` thì mí trên chạm mí dưới, không thấy tròng trắng.
- Mở `jaw` thì răng dưới và lưỡi đi theo; khoang miệng không lộ ra ngoài má hay cằm.
- Mỗi ngón cong riêng được.
- Bật IK tay thì cổ tay bám theo `ik_hand`.
- Đo màu trên texture mới: vùng bộ đồ cũ không còn điểm xám tối.

Ảnh duyệt (một bảng):
- Cận mặt: nhìn thẳng (so với mẫu), liếc, chớp, ba khẩu hình (A, O, MBP), cười, buồn.
- Toàn thân: da liền màu, cận cổ và cổ tay.
- Bàn tay: chỉ tay, nắm tay.

## Câu hỏi còn mở cho chủ repo

- 18 shape key cảm xúc trong quy chuẩn: làm ngay lượt này, hay sau khi duyệt xong bộ điều khiển nền? Đề xuất: làm sau, vì repo chưa có thư viện mô tả từng cảm xúc.
