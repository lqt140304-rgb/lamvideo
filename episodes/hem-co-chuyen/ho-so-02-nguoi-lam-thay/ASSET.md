# Asset 3D — Hồ sơ 02: Người trong gương

> **Chuyển đổi quy chuẩn 17/11/2026:** Toàn bộ nhân vật chuyển sang **Stickman 3D tối giản (Kiểu B)**: chuẩn 1,60 m, đầu tròn trơn, thân viên nang, tay chân ống mảnh. Nguồn sinh nhân vật hiện hành là `dung_stickman_cast.py` và thư viện [stickman-base-v1](../../../../what-if-studio/library/characters/stickman-base-v1/README.md). Các mô hình chi tiết cũ (`dung_than_cage_nam.py`, `dung_dau_nam.py`, `dung_quan_ao_nam.py`, `dung_tay_nam.py`, `rig_nam.py`, `human-male-base-v1.glb`) được lưu trữ làm tư liệu tham khảo lịch sử.

Đầu vào sản xuất là Blender. Bảng này thay danh mục rig/layer SVG trước đây. Chi tiết toàn diện về thông số kỹ thuật và quy chuẩn nhân vật xem tại: 📄 **[assets/nhan-vat-3d/README.md](assets/nhan-vat-3d/README.md)** và 📄 **[QUY-CHUAN-STICKMAN.md](../../../docs/QUY-CHUAN-STICKMAN.md)**.

| Nhóm | Nguồn hiện hành | Trạng thái / giới hạn |
|---|---|---|
| **Dàn nhân vật Stickman 3D (Kiểu B)** | [dung_stickman_cast.py](assets/nhan-vat-3d/dung_stickman_cast.py), [stickman_math.py](assets/nhan-vat-3d/stickman_math.py) | **Nguồn hiện hành**: Chuẩn 1,60 m. Sinh phôi Stickman Base, module tóc và trang phục cho 5 nhân vật (Nam, Người Kia, Tùng, Giảng viên, Người Truy Vết) kèm Armature Rig |
| Thư viện nhân vật chung | [stickman-base-v1](../../../../what-if-studio/library/characters/stickman-base-v1/manifest.json) | Phôi chuẩn dùng chung toàn series, quản lý manifest và phiên bản |
| Đầu và tóc Nam modular (Cũ) | [dung_dau_nam.py](assets/nhan-vat-3d/dung_dau_nam.py) | *Lưu trữ tham khảo lịch sử*; dùng để đối chiếu thẩm mỹ silhouette tóc khối |
| Thân Nam control cage (Cũ) | [dung_than_cage_nam.py](assets/nhan-vat-3d/dung_than_cage_nam.py), [kết quả](assets/nhan-vat-3d/KET-QUA-THAN-CAGE.md) | *Lưu trữ tham khảo lịch sử*; bảo toàn số đo chuẩn 1,60 m |
| Bàn tay và bàn chân riêng (Cũ) | [dung_tay_nam.py](assets/nhan-vat-3d/dung_tay_nam.py) | *Lưu trữ tham khảo lịch sử*; tham khảo thuật toán chống va chạm ngón |
| Quần áo 3D chi tiết (Cũ) | [dung_quan_ao_nam.py](assets/nhan-vat-3d/dung_quan_ao_nam.py) | *Lưu trữ tham khảo lịch sử*; tham chiếu 5 bộ màu trang phục chuẩn |
| Phòng trọ, hành lang, ngoại cảnh | [hướng dẫn bối cảnh](assets/boi-canh-3d/README.md), [xay_phong_tro.py](assets/boi-canh-3d/xay_phong_tro.py) | Nguồn cảnh Blender, đơn vị mét; giữ nguyên tương thích 100% với Stickman 1,60 m |
| Đồ dùng tinh chỉnh | [entry tinh chỉnh](assets/boi-canh-3d/xay_do_dung_chi_tiet.py), [cách dùng](assets/boi-canh-3d/README-CHI-TIET.md), [ảnh kiểm tra](assets/boi-canh-3d/sua-tiep-xuc/DA-SUA.png) | Có nguồn và ảnh; tương thích mốc người 1,60 m |
| Đạo cụ cốt truyện | [dao_cu_3d.py](assets/boi-canh-3d/dao_cu_3d.py), [nhu cầu còn lại](assets/boi-canh-3d/BOI-CANH-CAN-CHUAN-BI.md) | Đối chiếu từng món với shot; hỗ trợ bàn tay cầm nắm của Stickman |
| Gương và mặt kính hóa nước | [kế hoạch gương](assets/boi-canh-3d/KE-HOACH-CONG-GUONG.md), [cong_guong.py](assets/boi-canh-3d/cong_guong.py), [kinh_nuoc.py](assets/boi-canh-3d/kinh_nuoc.py) | Kiểm với tương tác Người Kia (thuận tay trái, gáy rỉ nước) |
| Camera, khoảng nhìn | [danh sách máy](assets/boi-canh-3d/DANH-SACH-SHOT.md), [đo góc máy](DO-LUONG-GOC-MAY-3D.md) | Đã đồng bộ 103 shot với bộ hiệu ứng quang học tâm lý (Fisheye, Snorricam, Split-Diopter) |
| Âm thanh & Thoại | [SFX-VFX.md](SFX-VFX.md), [VOICEOVER-CUE-SHEET.md](VOICEOVER-CUE-SHEET.md), [thoai-cue.json](thoai-cue.json) | 51 cue ElevenLabs đã chốt khớp 100% Master Script |

## Cách dùng

- Bắt đầu từ [README hồ sơ](README.md), [README 3D nhân vật](assets/nhan-vat-3d/README.md), [quy chuẩn 3D](../../../docs/QUY-CHUAN-3D.md) và kịch bản master.
- Nhân vật mới tạo từ `dung_stickman_cast.py`; không sửa GLB cũ hay file phôi cũ rồi gắn mác stickman.
- File `.blend`/video nặng giữ local theo hồ sơ; chỉ push phần được duyệt.

## Thoại ElevenLabs (15/11/2026)

- Nguồn lời: [thoai-cue.json](thoai-cue.json), 51 cue trích từ `KICH-BAN-15P-HOAN-CHINH.md`.
- Giọng đã chốt: [giong-chot.json](giong-chot.json), model `eleven_v3_conversational`.
