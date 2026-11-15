# Bối cảnh Hồi 3 + tối ưu quay — thiết kế ngắn (15/11/2026)

Hồ sơ 02 · thư mục `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh-3d/`

## Mục đích
Dựng nốt các bối cảnh chưa có theo thứ tự xuất hiện trong `KICH-BAN-15P-HOAN-CHINH.md`. Hồi 1–2 đã đủ, Lab 402 chỉ được nhắc tới, còn mâm cơm quê không có trong bản chính. Đồng thời phải quay được nhanh mà không mất toàn cảnh. Theo yêu cầu của chủ repo, vật ở càng xa thì càng giảm chi tiết.

## Phạm vi (chủ repo duyệt 15/11)
1. `giang_duong.py`: cảnh 3.1. Giảng đường bậc thang khoảng 190 chỗ, gồm bục gỗ, bảng phấn, màn chiếu hiện code, máy chiếu, đèn tuýp 6500K, quạt thông gió và cửa sổ nắng 8h sáng.
2. `san_truong.py`: Nam chạy trốn khỏi giảng đường. Hành lang cột bê tông có bóng vuông, sân trường nắng trưa gắt và đường cho máy Steadicam chạy lùi.
3. `bo_ke.py`: bờ kè **sông Hồng** (chủ repo chọn). Có bậc đá kè, nước phù sa, bãi bồi, cầu xa, phố xa. Trời đổi màu xám → cam → đỏ trong cú máy giữ 15–20 s.
4. `toi_uu.py` (dùng chung):
   - **LOD theo khoảng cách** (LOD: giảm chi tiết theo mức). Vật được chia vào 4 vòng (gần, trung, xa, chân trời) tính từ đường đi của camera. Mỗi vòng xa hơn thì giảm lưới (Decimate), giảm bevel và subdiv, tắt đổ bóng, tắt hiện trong phản chiếu.
   - **Instancing**: ghế và người lặp lại dùng chung một lưới.
   - **Camera culling**: không tính vật nằm ngoài khung hình hoặc quá xa.
   - Cấu hình render theo mức `nhap` / `duyet` / `cuoi`: adaptive sampling (tự giảm mẫu chỗ đã sạch), light tree, persistent data (giữ cảnh giữa các khung khi render chuỗi), giới hạn số lần nảy tia, denoise, Simplify. Thêm chế độ xem nhanh EEVEE.

## Không làm
Không dựng Lab 402 và mâm cơm quê. Không ghép nhân vật thật, chỉ dùng hình nhân tạm. Không render video cuối.

## Cách dựng
Theo đúng mẫu `xay_phong_tro.py`: bpy thủ tục, 1 BU = 1 m, vật liệu từ `vat_lieu.py`, lệnh `--cam/--mode/--muc/--out`. Mỗi bối cảnh chạy được độc lập và xuất ảnh nháp để duyệt. Cách khác là thư viện asset .blend có sẵn, nhưng repo đang dùng mã thủ tục nên giữ cách này cho đồng nhất.

## Để người dựng tự quyết
Số ghế và số vật cụ thể, góc camera chi tiết, ngưỡng mét của từng vòng LOD.
