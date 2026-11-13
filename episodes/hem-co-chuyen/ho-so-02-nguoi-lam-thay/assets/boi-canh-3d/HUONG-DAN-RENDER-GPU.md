# Render bằng GPU (RTX 3050 6 GB)

Môi trường làm việc của trợ lý (container) **không có GPU**, nên bản video hiện có render bằng CPU 4 lõi (≈ 7 s/khung). Máy của chủ repo có RTX 3050 6 GB render được bằng Cycles OptiX/CUDA. Mã đã hỗ trợ: đặt biến môi trường `BLENDER_DEVICE=GPU`, `xay_phong_tro._thiet_bi` thử OPTIX → CUDA → HIP → METAL → ONEAPI; không thấy GPU thì tự về CPU và in `[render] không thấy GPU, dùng CPU`.

## Cách 1 — dùng ứng dụng Blender (dễ nhất, Windows)
1. Cài Blender **5.0.x** từ blender.org (bản repo dựng bằng 5.0.1). Cài ffmpeg và thêm vào PATH.
2. `git pull` nhánh `claude/keen-darwin-txydqa`, mở PowerShell trong `episodes\hem-co-chuyen\ho-so-02-nguoi-lam-thay\assets\boi-canh-3d`.
3. Một shot: 
   `$env:BLENDER_DEVICE="GPU"; & "C:\Program Files\Blender Foundation\Blender 5.0\blender.exe" -b -P camera_dong.py -- --shot ORBIT_GUONG --all --step 1 --out D:\render\orbit --samples 32 --width 960`
4. Cả chuỗi 17 shot + ghép MP4: `.\render_chuoi_gpu.ps1 -Step 1 -Width 960 -Samples 32 -Out D:\render\chuoi` (24 fps nếu `-Step 1`).
5. Xem dòng `[render] dùng GPU OPTIX: NVIDIA GeForce RTX 3050` trong log từng shot (`<Out>\<shot>.log`). Nếu không thấy, vào Blender › Edit › Preferences › System › Cycles Render Devices, chọn OptiX và bật RTX 3050 rồi chạy lại.

## Cách 2 — module `bpy` (như trong container)
`pip install bpy==5.0.1`, đặt `BLENDER_DEVICE=GPU`, chạy `python camera_dong.py --shot ... --all --out ...` (cần driver NVIDIA mới).

## Kỳ vọng và rủi ro (chưa đo trên máy bạn)
- GPU thường nhanh hơn CPU 4 lõi vài lần đến hơn chục lần ở Cycles; **chưa đo thật**, nên chưa hứa số giờ. Thử một shot ngắn rồi nhân lên (1272 khung ở 24 fps).
- VRAM 6 GB: cảnh gần như không có ảnh texture (vật liệu thủ tục), khoảng 4.000 đối tượng; nhiều khả năng đủ. Nếu báo hết bộ nhớ: giảm `--width`, hoặc tắt nhà xa (`xa_chi_tiet`) / dây phơi nhỏ.
- Khi GPU xử lý mượt thì có thể nâng `--samples` 32–64 và `--width` 1280 để ảnh sạch, không cần kéo dài thời gian bằng nội suy khung.

## Tối ưu render đã đo (CPU 4 lõi, 640×268, 14 mẫu, cảnh hành lang/toàn cảnh)
| Thử nghiệm | Thời gian/khung | Kết luận |
|---|---|---|
| Cơ sở | 8,2–8,4 s | |
| Ẩn toàn bộ nhà xa (387 vật) | 8,2 → 6,7 s (toàn cảnh), 8,4 → 8,2 s (hành lang) | ít hiệu quả |
| Cắt bỏ mọi vật ngoài khung (≈ 1.000 vật) | 8,1 s (hành lang), 6,4 s (toàn cảnh) | **chỉ giảm ≤ ~20%, thường ~0–3%**: tốn thời gian là bắn tia theo điểm ảnh, không phải số vật |
| `use_persistent_data` (giữ BVH giữa các khung) | khung 2+ : 8,1 → 6,3 s | **−20%, đã bật trong `camera_dong.py`** |
| + tắt khử nhiễu | 5,9 s | nhỏ, không nên tắt |
| + giảm số lần nảy tia/trong suốt | 5,7–6,1 s | nhỏ |
| Thay mọi vật liệu bằng màu phẳng (giới hạn trên của việc bake texture thủ tục) | 5,0 s | thêm ~20% nếu bake |
| Giảm một nửa số mẫu (7) | 3,6 s | tỉ lệ thuận với số mẫu (≈ 0,35 s/mẫu + 1,3 s cố định) |
Vì vậy "chỉ render phần trong khung" và "đưa phần còn lại thành ảnh tĩnh" cho lợi ích nhỏ ở cảnh này; hiệu quả lớn đến từ **GPU**, **ít mẫu hơn + khử nhiễu**, **ít khung hơn** (nội suy) và **tái dùng nền cho shot camera đứng yên** (xem trao đổi).
