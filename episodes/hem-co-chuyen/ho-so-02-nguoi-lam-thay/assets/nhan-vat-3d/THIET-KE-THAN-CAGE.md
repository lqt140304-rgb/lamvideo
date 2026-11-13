# Thân Nam dựng lại bằng control cage — thiết kế (chờ duyệt, 14/11/2026)

## Vì sao
Thân v2.11 (`dung_than_nam.py`) là các vòng elip + ống, voxel remesh chung với tay/chân/bàn tay/bàn chân rồi smooth từng vùng. Kết quả còn dạng trụ/hộp, tay mảnh, cổ có gợn nối, bụng dưới có mép ngang như gấu áo; mỗi lần sửa phải chỉnh bán kính vòng rồi chờ voxel, khó biết đỉnh nào quyết định khối nào. Chủ repo muốn đổi sang cách dễ kiểm soát: một cage ít đỉnh, đối xứng, chốt silhouette trước rồi mới làm mịn.

Tham chiếu: ảnh mẫu "NAM — 3D TURNAROUND" (ưu tiên cao nhất) và hai ảnh phác thảo "NAM — DỰNG THÂN TRÒN MỀM, DỄ KIỂM SOÁT" (chỉ minh hoạ cách dựng; khác ảnh mẫu thì theo ảnh mẫu).

## Mục tiêu
- Thân mềm, đầy vừa, hơi chibi theo ảnh mẫu: cổ ngắn mở mềm xuống vai; vai dốc nhẹ, liền bắp tay; ngực–lưng gọn có bề dày, lưng cong nhẹ; bụng tròn mềm hơi nhô ở góc nghiêng; eo chỉ thu nhẹ; hông gọn, mông đầy vừa, liền vào đùi; bụng dưới–háng chuyển cong mềm, hai đùi tách bằng đường cong.
- Một lưới liền từ chân cổ tới cổ tay và mắt cá, dòng lưới liên tục sang bắp tay và đùi; nách, háng còn khe rõ.
- Nguồn dựng lại được bằng một lệnh; sửa dáng = sửa vài con số trong bảng cage.

## Không làm (lượt này)
Quần áo, rig/trọng số, dáng đi/ngồi, mặt, tóc, tai, bàn tay, bàn chân mới (theo [THIET-KE-TAY-CHAN.md](THIET-KE-TAY-CHAN.md), làm sau).

## Coi là thất bại dù chạy được
- Thân thành các khối cầu/ống rời ghép lại, hoặc mọi tiết diện tròn như nhau.
- "Tròn" có được bằng cách phình đều toàn thân hoặc scale cả nhân vật.
- Cổ hai lớp lồng nhau, gờ vòng cổ, hoặc che nếp bằng cách cho hai mặt giao nhau 1–2 mm.
- Chỉ đẹp ở góc 3/4 mà lệch mẫu ở trước/nghiêng/sau.
- Báo đã kiểm biến dạng khi chưa có rig.

## Ràng buộc
- Giữ nguyên `dung_dau_nam.py` và hình dáng đầu hiện tại (cụm đầu phóng đều `HEAD_K = 1,13` như v2.11). Nối cổ chỉ làm trên bản sao `Nam_Dau_Than`; không remesh mặt.
- Chiều cao tổng khoảng 1,6004 m gồm lọn tóc; sai dưới 1 mm không cần ép. Không scale toàn nhân vật.
- Đơn vị m, sàn Z = 0, mặt nhìn −Y, trái nhân vật = +X, hậu tố `.L/.R`.
- Không commit `.blend`, ảnh render; ảnh ở `render-than/cage/`. Thư mục này chưa có luật bỏ qua, nên thêm `.gitignore` cạnh script với `render-than/` và `*.blend`.
- Đặt vào phòng bằng `dat_nam_vao_phong.py` (đọc collection `Nam_Dau` và `02_Body_Base`); giữ nguyên scale phòng.

## Các cách đã cân nhắc
- **A. Cage sinh từ script Python — chủ repo chọn.** Bảng điểm điều khiển nửa thân, topology đặt tay (lỗ nách/háng có sẵn, tay chân đùn ra), Mirror + Subdivision. Dựng lại được từ mã, mỗi đỉnh có vai trò rõ; đổi lại phải đặt topology nách/háng bằng tay.
- B. Skin modifier trên khung đỉnh rồi chỉnh: ra lưới nhanh nhưng Skin tự quyết topology chỗ rẽ nhánh, khó chỉnh riêng nhô trước/sau.
- C. Giữ vòng elip, thưa bớt: không phải cage, chỗ nối vẫn voxel → lặp lại lỗi cũ.
- Nặn tay trong giao diện: loại, vì làm qua script và `.blend` không commit.

Phạm vi cage (chủ repo chọn): phủ thân và tay/chân **tới cổ tay, mắt cá**. Bàn tay/bàn chân tạm lấy hình cũ thành vật riêng (đúng hướng cách B của kế hoạch tay/chân).

## Nhánh và nguồn
- Làm trên `claude/nam-body-mesh-rebuild-dda859`, trước hết gộp `origin/claude/elegant-knuth-w1im6b` (bản Nam mới nhất: mặt nạ tròng trắng trên đỉnh, chỉnh bàn chân, rig, kế hoạch tay/chân). Không đẩy `main`.
- Script mới `dung_than_cage_nam.py` cạnh `dung_than_nam.py`, `import dung_than_nam as T` để dùng lại: `cut_open_head_copy`, `scale_head_cluster`, `bake_eye_mask`, `mesh_checks`, `measure`, `lights`, `cam`, `render_silhouettes`. `dung_than_nam.py` giữ làm nguồn bản cũ v2.11, không sửa ngoài việc tách hàm nếu cần gọi lại.

## Cấu trúc trong file Blender
- `00_Than_Cu_v211` (ẩn render): `Nam_Dau_Than_v211` dựng bằng `dung_than_nam.py` để đối chiếu. Không nằm trong collection mà `dat_nam_vao_phong.py` nạp.
- `02_Body_Base`:
  - `Nam_Than_Cage`: **nửa** cage (x ≥ 0), Mirror theo X (clip + merge đường giữa), Subdivision mức 1 khi xem; luôn sửa được.
  - `Nam_Dau_Than`: bản lắp ráp = bản sao đầu (cắt ở vòng cổ như v2.11) + cage đã áp Mirror và Subdivision 2 + nối cổ. Tên giữ như cũ để công cụ sau (đặt phòng, rig) tìm được.
  - `Nam_BanTay.L/.R`, `Nam_BanChan.L/.R`: cắt từ thân cũ tại cổ tay/mắt cá, mỗi vật kèm đoạn cổ ngắn ~2 cm lồng vào trong đầu ống cage.
- `--blend` xuất như cũ; ảnh cage chụp từ `Nam_Than_Cage` ở chế độ dây.

## Cage
**Vùng điều khiển theo chiều cao** (mỗi mức một vòng cạnh, số mức không cố định — thêm/bớt khi cần): chân cổ, vai, ngực, dưới ngực, bụng, eo, chậu, đầu đùi/đáy chậu.

**Tham số mỗi mức** (chỉnh độc lập): `z`, bề ngang nửa thân `w`, nhô trước `f`, nhô sau `b`, và độ vuông/tròn tiết diện (cùng ý `n` của v2.11 nhưng một mức một giá trị, không dùng bán kính chung). Từ các số này sinh vị trí các đỉnh của vòng nửa thân: giữa trước (x = 0), trước, trước-bên, bên, sau-bên, sau, giữa sau (x = 0). Cho phép ghi đè riêng từng đỉnh (ví dụ nhô bụng chỉ ở đỉnh giữa trước của mức bụng) để không phải đổi cả vòng.

**Nách và tay:** ở mức vai–ngực–dưới ngực, phía bên có một lỗ 4 mặt (vòng 8 cạnh). Tay đùn từ lỗ đó: vai/đầu bắp tay, giữa bắp tay, khuỷu, giữa cẳng tay, cổ tay — mỗi vòng 8 đỉnh, có tâm, bề ngang, bề sâu riêng. Đỉnh vai nằm trên dòng lưới liền từ chân cổ, không có khối cầu vai riêng. Tay thả xuôi hơi toè như mẫu; khe nách giữ rõ.

**Háng và chân:** đáy cage có đường giữa trước–đáy chậu–giữa sau; vòng chân 8 đỉnh tạo bởi các mặt đáy, chia hai đùi bằng đường cong (không mép ngang ở bụng dưới, không để chân mọc từ đáy hộp). Chân: đầu đùi, giữa đùi, gối, bắp chân, mắt cá.

**Cổ:** vòng chân cổ của cage có số đỉnh sao cho sau Mirror + Subdivision 2 bằng đúng số đỉnh vòng cắt cổ của bản sao đầu (đo lúc chạy; vòng cage cả hai nửa có k cạnh thì sau Subdivision 2 còn 4k). Nếu điều đó buộc vòng cổ cage dày hơn các vòng khác, giảm dần mật độ ở mức vai bằng vòng cạnh chuyển tiếp thay vì làm dày cả thân. Không khớp được thì làm một dải chuyển tiếp cục bộ có mật độ tăng dần; không bridge hai vòng khác số đỉnh rồi để mặt kéo méo.

**Số đo khởi điểm:** lấy từ bảng `TORSO/ARM/LEG` của v2.11 (đo từ ảnh mẫu, đã nén `KZ`), sau đó sửa theo đối chiếu ảnh mẫu, không giữ cứng số hông cũ.

## Làm mịn và nối
1. Chốt silhouette trên cage + Subdivision 1.
2. Bản lắp ráp: áp Mirror, Subdivision 2 (Catmull-Clark). Không voxel remesh, không smooth toàn thân. Nếu cần chỉnh chuyển mặt, sculpt/smooth nhẹ có vùng giới hạn, ghi lại trong mã.
3. Nối cổ: xoá mặt nắp trong, nối từng cặp đỉnh vòng biên thân với vòng biên đầu, chỉ làm mượt dải ≤ 1 cm quanh mối nối, kiểm pháp tuyến và độ liên tục đường bao ở ảnh cận trước/nghiêng/sau.
4. Bàn tay/chân cũ: cắt tại mặt phẳng cổ tay/mắt cá từ thân v2.11, giữ nguyên hình và vị trí; vòng cổ tay/mắt cá của cage đặt đúng tâm và trục mặt cắt đó (đo lúc chạy, không chép tay); đầu ống cage đóng tròn và bọc ngoài đoạn cổ của vật tay/chân. Đây là chỗ nối **tạm** (hai mặt giao nhau) cho tới khi có bàn tay/chân mới; ghi trong "còn chưa đạt".

## Kiểm tra (in số trong log, tự sửa trước khi giao)
- Chiều cao tổng (bbox thế giới có modifier).
- Lưới lắp ráp: cạnh hở 0 (trừ biên cổ tay/mắt cá nếu để hở có chủ đích), cạnh >2 mặt 0, thể tích dương (pháp tuyến ra ngoài), cặp mặt tự giao ≈ 0.
- Cổ: số đỉnh hai vòng bằng nhau; không có đỉnh thân nằm trong khối đầu.
- Khe nách và khe giữa hai đùi: khoảng cách nhỏ nhất giữa mặt trong bắp tay và mặt bên thân, giữa hai đùi dưới đáy chậu, đều > 0 với ngưỡng in ra để chủ repo xem.
- Bảng số đo: bề ngang trước ở chân cổ, vai, ngực, bụng, eo, hông; nhô trước/sau ở ngực, bụng, mông; chiều dài thân so với chiều cao đầu.
- Mesh tay/chân cũ: đoạn cổ nằm trọn trong ống cage (không hở khe).

## Đối chiếu với mẫu
Silhouette trước/nghiêng/sau bằng camera trực giao cùng tỉ lệ, cùng mốc sàn (dùng lại `render_silhouettes`). Căn ảnh mẫu theo chiều cao và đường giữa, không kéo giãn; chồng lên nhau để so riêng: cổ và độ dốc vai, chiều dài thân so với đầu, bề ngang ngực–bụng–hông, đường bụng–lưng ở góc nghiêng, mông và chỗ nối đùi, khoảng tách tay–thân. Chỉnh cage theo kết quả rồi chạy lại. Render dùng đất sét trung tính, đèn trung tính; không dùng vật liệu/bóng tối che gợn.

**Cần ảnh mẫu turnaround** (không có trong repo). Thiếu ảnh thì chỉ đối chiếu với số đo cũ và báo bước này chưa đạt.

## Bàn giao
Ảnh trong `render-than/cage/`, ghép bằng `what-if-studio/tools/soi/` khi cần:
- Trước, nghiêng, sau, 3/4.
- Bảng bản cũ / bản mới cùng tỉ lệ.
- Ảnh chồng với mẫu Nam.
- Cận cổ–vai, nách, bụng dưới–hông.
- Nam đứng trong phòng trọ (`dat_nam_vao_phong.py`).
- Cage dây trước Subdivision và kết quả làm mịn.

Nguồn commit: `dung_than_cage_nam.py`, file này, `KET-QUA-THAN-CAGE.md` (lệnh chạy, số đo thực, điểm còn chưa đạt), cập nhật dòng nguồn Nam trong `ASSET.md`. Chỉ báo "đạt hình khối tĩnh"; rig cũ (`rig_nam.py`) sẽ không còn khớp lưới mới, cần làm lại trọng số ở lượt sau.

## Để người dựng tự quyết (ghi lại lựa chọn)
- Số mức cage và số đỉnh mỗi vòng (miễn mỗi đỉnh chỉnh được một vùng rõ và vòng cổ khớp đầu).
- Giá trị số đo cụ thể sau đối chiếu.
- Có cần sculpt/smooth cục bộ ở nách/háng sau Subdivision hay không.
- Ngưỡng in ra cho khe nách/háng.

## Lựa chọn tôi tự quyết (chủ repo xem lại)
- Gộp nhánh `elegant-knuth` trước khi làm.
- Bản cũ dựng lại trong collection `00_Than_Cu_v211` từ chính `dung_than_nam.py`, không lưu `.blend` cũ.
- Bàn tay/chân cũ thành vật riêng nối tạm bằng đoạn lồng (theo hướng cách B), thay vì hàn vào cage.
- Bản lắp ráp giữ tên `Nam_Dau_Than` và collection `02_Body_Base` để công cụ sau dùng được.
- Script mới tách khỏi `dung_than_nam.py` để bản cũ còn chạy được.
- Thêm `.gitignore` (`render-than/`, `*.blend`) trong thư mục nhân vật 3D.
