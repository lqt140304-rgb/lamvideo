# The Crack in Reality — Hồ sơ 02: Người trong gương

**Pipeline hiện hành: nhân vật và môi trường Blender 3D.** Đọc [quy chuẩn 3D](../../../docs/QUY-CHUAN-3D.md) trước khi dựng. Hướng dẫn Markdown dành cho bản SVG/2,5D và bản nhân vật alpha ghép nền cũ đã được gỡ; hình/mã cũ chỉ còn là tư liệu thiết kế, không phải nguồn sản xuất.

## Văn bản câu chuyện

| File | Vai trò |
|---|---|
| [KICH-BAN.md](KICH-BAN.md) | Mục lục và quyết định câu chuyện |
| [Kịch bản master 15 phút](KICH-BAN-15P-HOAN-CHINH.md) | Nguồn master cho bản dựng 15 phút |
| [Phần 1](PHAN-01-NGUOI-TRONG-PHONG.md), [Phần 2](PHAN-02-QUEN-DUOC-LAM-THAY.md), [Phần 3](PHAN-03-NGUOI-BI-THAY-THE.md) | Chi tiết theo phần để đối chiếu; khi khác master, rà và chốt trước dựng, không tự trộn lời |
| [Luật truyện](LUAT-BAN-NHAP-V1.md), [thảo luận](THAO-LUAN-CANH.md) | Giới hạn bản sao/gương và các quyết định biên tập |
| [Opening & trailer](KICH-BAN-TRAILER-VA-OPENING.md) | Kịch bản riêng cho phần giới thiệu/quảng bá |
| [Cue giọng](VOICEOVER-CUE-SHEET.md), [SFX/VFX](SFX-VFX.md) | Phân vai ElevenLabs, âm thanh và điểm đồng bộ |

Mục tiêu khoảng 15 phút là kế hoạch biên tập, chưa phải thời lượng phim/audio đã đo. Giữ kết Nam bị nhốt trong gương, Người Kia thay thế; không đổi truyện trong lượt dọn tài liệu.

## Nguồn dựng 3D

| File | Vai trò |
|---|---|
| [ASSET.md](ASSET.md) | Nơi tìm nguồn nhân vật, bối cảnh, đồ dùng và trạng thái thực |
| [CHECKLIST-TIEN-KY-ASSET.md](CHECKLIST-TIEN-KY-ASSET.md) | Yêu cầu theo cảnh và các bước kiểm tiền kỳ 3D |
| [DUNG-CANH.md](DUNG-CANH.md) | Ý đồ bố cục, máy, nét, tiếp xúc, âm và nhịp |
| [SHOTLIST-VA-TIMELINE-15P.md](SHOTLIST-VA-TIMELINE-15P.md) | Bảng shot và mốc thời gian sản xuất |
| [THIET-KE-BIEU-CAM.md](THIET-KE-BIEU-CAM.md), [KE-HOACH-BIEU-CAM.md](KE-HOACH-BIEU-CAM.md), [bieu_cam_nam.py](assets/nhan-vat-3d/bieu_cam_nam.py) | Biểu cảm khuôn mặt: thiết kế đã duyệt, kế hoạch, lệnh kiểm/ảnh (`--kiem`, `--anh`), cách áp lên đầu khác ([ap_dung_bo.py](assets/nhan-vat-3d/bieu_cam/ap_dung_bo.py)) |
| [Bối cảnh Blender](assets/boi-canh-3d/README.md) | Phòng trọ, hành lang, nguồn sáng và cách xuất ảnh/video thử |
| [Đồ dùng tinh chỉnh](assets/boi-canh-3d/README-CHI-TIET.md) | Entry mới, điểm neo và giới hạn của bộ đồ dùng |
| [Đo góc máy](DO-LUONG-GOC-MAY-3D.md) | FOV, độ bao phủ và các góc cần kiểm khi ghép nhân vật |
| [Việc còn thiếu](assets/boi-canh-3d/BOI-CANH-CAN-CHUAN-BI.md), [lỗi còn tồn](LOI-TON-DONG.md) | Việc tiếp theo; không dùng bảng hoàn thành rig SVG cũ |

Đã có thử nghiệm hình/camera riêng, chưa xác nhận phim đủ nhân vật, diễn hoạt, khẩu hình và audio đã hoàn thiện. Duyệt storyboard rồi animatic trước render cuối; ảnh tĩnh không chứng minh chuyển động/tiếp xúc. Tư liệu series ở [VU-TRU.md](../VU-TRU.md), nhận diện ở [THIET-KE-NHAN-VAT.md](../THIET-KE-NHAN-VAT.md).
