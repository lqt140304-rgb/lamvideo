# Asset 3D — Hồ sơ 02: Người trong gương

Đầu vào sản xuất là Blender. Bảng này thay danh mục rig/layer SVG trước đây. “Có nguồn” và “đã có ảnh” không có nghĩa đã nghiệm thu diễn hoạt cả phim.

| Nhóm | Nguồn hiện hành | Trạng thái / giới hạn |
|---|---|---|
| Đầu và tóc Nam modular | [dung_dau_nam.py](assets/nhan-vat-3d/dung_dau_nam.py) | Nguồn Blender đầu/tóc; giữ bản nhận diện đã duyệt. Chưa suy ra rig toàn thân đã hoàn thiện |
| Đầu Nam (control cage) | [dung_dau_cage_nam.py](assets/nhan-vat-3d/dung_dau_cage_nam.py), [kết quả](assets/nhan-vat-3d/KET-QUA-DAU-CAGE.md) | Cage nửa 242 đỉnh, chung một lưới với thân; nhãn cầu riêng, mí và khoang miệng kín; 4 shape key **thử** (nhắm/mở mắt, mở hàm, cười nhẹ), chưa phải rig mặt. Đầu cũ giữ ở collection `00_Dau_Cu` |
| Thân Nam (control cage) | [dung_than_cage_nam.py](assets/nhan-vat-3d/dung_than_cage_nam.py), [kết quả](assets/nhan-vat-3d/KET-QUA-THAN-CAGE.md) | Đạt hình khối tĩnh, khớp ảnh mẫu ±5 mm (trước/nghiêng). Chưa ghép bàn tay (chờ tay mới), bàn chân cũ nối tạm, chưa rig; `dung_than_nam.py` v2.11 giữ làm bản đối chiếu |
| Nhân vật mẫu Nam | [dung_nam.py](assets/nhan-vat-3d/dung_nam.py) | Mẫu metaball/rig trước hướng đầu modular; dùng có chủ đích, không trộn hai bộ đầu thành một nhân vật |
| Phòng trọ, hành lang, ngoại cảnh | [hướng dẫn bối cảnh](assets/boi-canh-3d/README.md), [xay_phong_tro.py](assets/boi-canh-3d/xay_phong_tro.py) | Nguồn cảnh Blender, đơn vị mét; xem báo cáo rà của bối cảnh |
| Đồ dùng tinh chỉnh | [entry tinh chỉnh](assets/boi-canh-3d/xay_do_dung_chi_tiet.py), [cách dùng](assets/boi-canh-3d/README-CHI-TIET.md), [ảnh kiểm tra](assets/boi-canh-3d/sua-tiep-xuc/DA-SUA.png) | Có nguồn và ảnh; đã kiểm chăn–nệm/ga/viền, chiều tựa ghế, chân cao su laptop. Chưa kiểm va chạm mọi cặp hoặc chuyển động |
| Đạo cụ cốt truyện | [dao_cu_3d.py](assets/boi-canh-3d/dao_cu_3d.py), [nhu cầu còn lại](assets/boi-canh-3d/BOI-CANH-CAN-CHUAN-BI.md) | Đối chiếu từng món với shot; có mesh không đồng nghĩa đã có constraint bàn tay |
| Gương và mặt kính hóa nước | [kế hoạch gương](assets/boi-canh-3d/KE-HOACH-CONG-GUONG.md), [cong_guong.py](assets/boi-canh-3d/cong_guong.py), [kinh_nuoc.py](assets/boi-canh-3d/kinh_nuoc.py) | Có nguồn/thử nghiệm riêng; cần kiểm với nhân vật, tay trái, nốt ruồi và shot cuối |
| Camera, khoảng nhìn | [danh sách máy](assets/boi-canh-3d/DANH-SACH-SHOT.md), [đo góc máy](DO-LUONG-GOC-MAY-3D.md) | Xác nhận lại khi ghép người thật thay proxy và khi sửa đồ lớn |
| Biểu cảm khuôn mặt (đầu Nam) | [bieu_cam_nam.py](assets/nhan-vat-3d/bieu_cam_nam.py), [bieu_cam/](assets/nhan-vat-3d/bieu_cam/), [thiết kế](THIET-KE-BIEU-CAM.md), [kế hoạch](KE-HOACH-BIEU-CAM.md) | Đầu Nam có 6 shape key 2 mức, miệng há, chi tiết mặt gắn vào đầu; qua kiểm tự động ở 5 góc và đã thử trên 2 đầu khác. **Chưa**: khẩu hình, Người Kia/Tùng/Mẹ, ghép rig toàn thân, răng/lưỡi; miệng há còn nhỏ, chờ chủ repo duyệt bảng ảnh |
| Ảnh tham chiếu biểu cảm (24 nhóm × 2 mức) | [assets/tham-chieu-bieu-cam/](assets/tham-chieu-bieu-cam/README.md), [thiết kế công cụ](THIET-KE-BIEU-CAM-24-NHOM.md) | 3 bảng phác 2D của chủ repo làm chuẩn đích, WebP nén. Là tham chiếu, không phải nguồn dựng; chưa có biểu cảm 3D nào được duyệt theo bảng này |
| Khẩu hình và tương tác (tay–vật, chân–sàn) | [checklist 3D](CHECKLIST-TIEN-KY-ASSET.md) | Chưa xác nhận |
| Âm thanh | [SFX-VFX.md](SFX-VFX.md), [VOICEOVER-CUE-SHEET.md](VOICEOVER-CUE-SHEET.md) | Cue và nguồn ứng viên; kiểm tra take, giấy phép và timing trước dùng |

## Cách dùng

- Bắt đầu từ [README hồ sơ](README.md), [quy chuẩn 3D](../../../docs/QUY-CHUAN-3D.md) và kịch bản master. Không lấy các tên pose SVG làm API cho Blender.
- Entry gốc dựng bối cảnh gốc; entry tinh chỉnh gọi `build()` rồi `refine()`. Root `PROP3D_*` chỉ gom phần chi tiết mới, chưa phải rig di chuyển toàn món. Các `ANCHOR_*` là điểm tham chiếu, chưa phải IK đã khóa.
- Ảnh, SVG, TSX và manifest cũ còn trên đĩa để bảo toàn thiết kế. Chúng không chứng minh asset 3D hoàn thành và không phải nguồn production hiện hành. Các Markdown hướng dẫn 2D/2,5D đã được xóa; Git giữ lịch sử nếu cần tra lại.
- File `.blend`/video nặng giữ local theo hồ sơ; chỉ push phần được duyệt. Ghi bản nguồn và loại kiểm tra cùng trạng thái từng món, không tự ghi `[x]` chỉ vì có tệp.
