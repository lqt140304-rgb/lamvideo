# Hẻm Có Chuyện — Hồ sơ 2: Người làm thay

**Chốt hướng kết mới nhất của chủ repo:** Nam bị nhốt trong thế giới gương; Người Kia thay thế Nam ngoài đời. Giữ kết mở về khả năng thoát và việc người quen có nhận ra hay không. Chỉ hướng kết này đã chốt; cơ chế bắt, lời và dàn cảnh cụ thể vẫn là đề xuất V1.

**Demo Cảnh 1 và rig — 10/11/2026:** animatic câm A01–A05 (`HoSo02Canh01Demo`) gồm thức dậy A02B (hất chăn, ngáp, lết ra mép nệm), máy dolly, góc qua vai, khung phim 2:1. Nhân vật **không viền ngoài**, bóng mềm hẹp, chỉ có khối sáng–tối khi đứng trong nắng cửa sổ (xem [quy chuẩn mục 4.0](assets/thiet-ke/QUY-CHUAN-THIET-KE-SVG.md)). Rig có thêm dáng `lie`, `sitLow`, nét mặt phân mức (`face`). Bối cảnh: phố và dãy trọ bên ngoài, góc `corridor`. Việc còn lại ở [LOI-TON-DONG](LOI-TON-DONG.md). Video render chỉ để local (`what-if-studio/out/ho-so-02-nguoi-lam-thay/`).



**Đã có bản nháp kịch bản chi tiết đủ ba phần V1, cập nhật 10/11/2026.** Mở [KICH-BAN.md](KICH-BAN.md) để đọc theo thứ tự. Nội dung gồm bối cảnh, hành động, thoại/thẻ cảm xúc, khoảng nghỉ và hướng máy/âm. Hồi tưởng giới thiệu Nam khoảng 40 giây đã có trước cảnh thức dậy. Bản nháp mới chưa duyệt toàn bộ, chưa giao Claude dựng và chưa tạo media.

## Thời lượng từng phần — cập nhật theo lời đính chính 10/11/2026

**Mỗi phần có thể tới 10 phút**, không phải cả hồ sơ. Nhịp thử 9:40 / 9:00 / 9:00, tổng **27:40**, trần 30:00. Chưa đo bằng đọc diễn hoặc audio; không kéo cảnh cho đủ phút. Cách phát hành chung hay riêng chưa chốt.

## Làm chi tiết theo 3 phần

| Nguồn lời | Nội dung / tình trạng |
|---|---|
| [Phần 1 — Người trong phòng](PHAN-01-NGUOI-TRONG-PHONG.md) | P1.00 hồi tưởng mới; P1.01–08 giữ lời A–H và mức duyệt cũ, tới Nam đọc bài và dặn đừng gửi |
| [Phần 2 — Quen được làm thay](PHAN-02-QUEN-DUOC-LAM-THAY.md) | P2.01–07 đã viết cảnh/thoại: tự nhận giúp, cho thay mặt, lệ thuộc, mất tự tin và bắt đầu tự làm; toàn bộ mới đề xuất |
| [Phần 3 — Người bị thay thế](PHAN-03-NGUOI-BI-THAY-THE.md) | P3.01–07 đã viết cảnh/thoại: nỗ lực, đối đầu, bị giam trong gương và sự chiếm chỗ; toàn bộ mới đề xuất |

Ba file PHAN là nguồn lời duy nhất theo phần. KICH-BAN là mục lục bản đầy đủ; THAO-LUAN giữ quyết định và liên kết cũ, không chép lại thoại. Việc viết đầy đủ được chủ repo yêu cầu; các lựa chọn mới về luật/kết chưa tự được duyệt.

## Các file và tác dụng

| File | Dùng để làm gì |
|---|---|
| [KICH-BAN.md](KICH-BAN.md) | Điểm bắt đầu đọc, thứ tự ba phần, nhịp thử và mức duyệt |
| [THAO-LUAN-CANH.md](THAO-LUAN-CANH.md) | Yêu cầu đã chốt, phương án mới cần đọc/sửa và đường dẫn tới các đoạn đã chuyển |
| [LUAT-BAN-NHAP-V1.md](LUAT-BAN-NHAP-V1.md) | Giới hạn gương/bản sao, kiến thức từng người, dòng thời gian, gieo–trả; tài liệu có spoil cho người viết/dựng |
| [DUNG-CANH.md](DUNG-CANH.md) | Máy A–H phần 1, bố cục/lens/rung/focus, layer/parallax/che khuất và nguyên tắc dựng; hướng cảnh mới nằm ngay trong các file PHAN |
| [ASSET.md](ASSET.md) | Hình/rig có sẵn, đúng nguồn cần dùng, đạo cụ và pose V1 còn phải chuẩn bị |
| [RA-SOAT-SUA-TRUYEN.md](RA-SOAT-SUA-TRUYEN.md) | Lịch sử sửa liên tục A–H và rà logic văn bản V1; không phải chứng nhận hình/âm |
| [LOI-TON-DONG.md](LOI-TON-DONG.md) | Việc còn phải kiểm/sửa khi dựng, gồm điểm tiếp xúc và mặt bằng đoạn kết |

## Nguồn hình và môi trường

- **Rig chính:** `Rigged`, `TWIN_POSES`, `solveRig` trong [assets/nhan-vat.tsx](assets/nhan-vat.tsx), dùng Nam/Người Kia/Tùng. 8 hướng, 11 dáng, `sampleWalk`, `talk`, `blink`, đạo cụ theo bàn tay. Đọc [quy chuẩn thiết kế](assets/thiet-ke/QUY-CHUAN-THIET-KE-SVG.md) trước khi sửa. `assets/rig/` là bản cũ để đối chiếu.
- **Phòng hiện hành:** [nguồn và hướng dẫn](assets/boi-canh/BOI-CANH.md), [bảng nền](assets/boi-canh/boi-canh.png). Giữ nệm đôi, một cửa chính, bếp, tủ, bàn/ghế và ánh sáng đã cập nhật. Gương V1 là đạo cụ cần bổ sung theo mặt bằng, chưa có xác nhận tương tác.
- **Mỹ thuật:** [phong cách chung](../../../docs/PHONG-CACH-MY-THUAT.md), nét mềm/khối tròn cho cả người và môi trường. Nam áo ngủ xám, Người Kia áo xanh ở A–H; nốt ruồi Người Kia đối bên theo hình thể. Không đảo chữ trên đồ thật.
- Studio trong `what-if-studio/`; các composition kiểm rig gồm `HoSo02Turnaround`, `HoSo02Spin`, `HoSo02RigSheet`. Không phải timeline hoàn chỉnh của bản V1.

Claude dựng khi người dùng giao. Chưa có lời sạch phân vai, take ElevenLabs, storyboard cảnh, animatic hoặc video cho bản ba phần. Giữ ranh giới tài liệu viết với sản phẩm đã nghe/xem. Xem [quy ước series](../README.md), [vũ trụ](../VU-TRU.md); chưa đưa luật đề xuất V1 thành lore chính thức.

**Cập nhật hành động và hiệu ứng 10/11/2026:** đã rà phần A–H trong THAO-LUAN-CANH và bổ sung bảng chuyển động ở [DUNG-CANH.md](DUNG-CANH.md); xem [SFX-VFX.md](SFX-VFX.md) để chọn âm/hình có sẵn và nguồn CC0 ứng viên. Chưa nghe/tải duyệt các nguồn mới, chưa sửa rig hoặc dựng lại demo. Phần 2–3 vẫn đề cương.
