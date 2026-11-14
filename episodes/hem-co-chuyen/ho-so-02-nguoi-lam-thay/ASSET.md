# Asset 3D — Hồ sơ 02: Người trong gương

Đầu vào sản xuất là Blender. Bảng này thay danh mục rig/layer SVG trước đây. “Có nguồn” và “đã có ảnh” không có nghĩa đã nghiệm thu diễn hoạt cả phim.

| Nhóm | Nguồn hiện hành | Trạng thái / giới hạn |
|---|---|---|
| Đầu và tóc Nam modular | [dung_dau_nam.py](assets/nhan-vat-3d/dung_dau_nam.py) | Nguồn Blender đầu/tóc; giữ bản nhận diện đã duyệt. Chưa suy ra rig toàn thân đã hoàn thiện |
| Thân Nam (control cage) | [dung_than_cage_nam.py](assets/nhan-vat-3d/dung_than_cage_nam.py), [kết quả](assets/nhan-vat-3d/KET-QUA-THAN-CAGE.md), [sửa nách](assets/nhan-vat-3d/SUA-NACH-CAGE.md) | Vòng 2 nâng đầu khe nách chiếu trước 55 mm so với vòng 1, lõm mạnh phía trên và chuyển mềm xuống tay; vòng cổ tay và bàn tay/chân mới giữ nguyên. Kiểm geometry và 9 kiểm nối đạt. Chưa rig, chưa kiểm khi nâng tay. Kết quả khớp mẫu ±5 mm là vòng trước, chưa đo overlay lại. `dung_than_nam.py` v2.11 giữ làm đối chiếu |
| Bàn tay và bàn chân riêng của Nam | [dung_tay_nam.py](assets/nhan-vat-3d/dung_tay_nam.py), [dung_chan_nam.py](assets/nhan-vat-3d/dung_chan_nam.py), [gan_tay_chan_nam.py](assets/nhan-vat-3d/gan_tay_chan_nam.py), [kết quả](assets/nhan-vat-3d/KET-QUA-TAY-CHAN.md) | Đạt hình khối tĩnh, gắn lên thân cage; kiểm nối đạt. Chưa kiểm nếp nối khi gập vì thân cage chưa rig; chưa có dép |
| Nhân vật mẫu Nam | [dung_nam.py](assets/nhan-vat-3d/dung_nam.py) | Mẫu metaball/rig trước hướng đầu modular; dùng có chủ đích, không trộn hai bộ đầu thành một nhân vật |
| Phòng trọ, hành lang, ngoại cảnh | [hướng dẫn bối cảnh](assets/boi-canh-3d/README.md), [xay_phong_tro.py](assets/boi-canh-3d/xay_phong_tro.py) | Nguồn cảnh Blender, đơn vị mét; xem báo cáo rà của bối cảnh |
| Đồ dùng tinh chỉnh | [entry tinh chỉnh](assets/boi-canh-3d/xay_do_dung_chi_tiet.py), [cách dùng](assets/boi-canh-3d/README-CHI-TIET.md), [ảnh kiểm tra](assets/boi-canh-3d/sua-tiep-xuc/DA-SUA.png) | Có nguồn và ảnh; đã kiểm chăn–nệm/ga/viền, chiều tựa ghế, chân cao su laptop. Chưa kiểm va chạm mọi cặp hoặc chuyển động |
| Đạo cụ cốt truyện | [dao_cu_3d.py](assets/boi-canh-3d/dao_cu_3d.py), [nhu cầu còn lại](assets/boi-canh-3d/BOI-CANH-CAN-CHUAN-BI.md) | Đối chiếu từng món với shot; có mesh không đồng nghĩa đã có constraint bàn tay |
| Gương và mặt kính hóa nước | [kế hoạch gương](assets/boi-canh-3d/KE-HOACH-CONG-GUONG.md), [cong_guong.py](assets/boi-canh-3d/cong_guong.py), [kinh_nuoc.py](assets/boi-canh-3d/kinh_nuoc.py) | Có nguồn/thử nghiệm riêng; cần kiểm với nhân vật, tay trái, nốt ruồi và shot cuối |
| Camera, khoảng nhìn | [danh sách máy](assets/boi-canh-3d/DANH-SACH-SHOT.md), [đo góc máy](DO-LUONG-GOC-MAY-3D.md) | Xác nhận lại khi ghép người thật thay proxy và khi sửa đồ lớn |
| Biểu cảm, khẩu hình và tương tác | [checklist 3D](CHECKLIST-TIEN-KY-ASSET.md) | Chưa xác nhận toàn bộ nhân vật/shape keys/IK đã nghiệm thu |
| Âm thanh | [SFX-VFX.md](SFX-VFX.md), [VOICEOVER-CUE-SHEET.md](VOICEOVER-CUE-SHEET.md) | Cue và nguồn ứng viên; kiểm tra take, giấy phép và timing trước dùng |

## Cách dùng

- Bắt đầu từ [README hồ sơ](README.md), [quy chuẩn 3D](../../../docs/QUY-CHUAN-3D.md) và kịch bản master. Không lấy các tên pose SVG làm API cho Blender.
- Entry gốc dựng bối cảnh gốc; entry tinh chỉnh gọi `build()` rồi `refine()`. Root `PROP3D_*` chỉ gom phần chi tiết mới, chưa phải rig di chuyển toàn món. Các `ANCHOR_*` là điểm tham chiếu, chưa phải IK đã khóa.
- Ảnh, SVG, TSX và manifest cũ còn trên đĩa để bảo toàn thiết kế. Chúng không chứng minh asset 3D hoàn thành và không phải nguồn production hiện hành. Các Markdown hướng dẫn 2D/2,5D đã được xóa; Git giữ lịch sử nếu cần tra lại.
- File `.blend`/video nặng giữ local theo hồ sơ; chỉ push phần được duyệt. Ghi bản nguồn và loại kiểm tra cùng trạng thái từng món, không tự ghi `[x]` chỉ vì có tệp.
