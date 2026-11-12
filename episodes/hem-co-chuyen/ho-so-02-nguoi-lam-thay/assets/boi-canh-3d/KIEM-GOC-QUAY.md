# Kiểm tra góc quay đã đủ rộng chưa (mô phỏng, `kiem_goc_quay.py`)

Khung 2.39:1, sensor 36×15.1 mm, người 1.6 m. Góc nhìn ngang/dọc: 14 mm = 104°/57°, 18 mm = 90°/45°, 22 mm = 79°/38°, 24 mm = 74°/35°, 28 mm = 65°/30°, 35 mm = 54°/24°, 50 mm = 40°/17°, 85 mm = 24°/10°

| Tiêu cự | Cách máy bao nhiêu m để thấy trọn người 1,60 m (lề 12%) |
|---|---|
| 14 mm | 1.67 m |
| 18 mm | 2.14 m |
| 22 mm | 2.62 m |
| 24 mm | 2.86 m |
| 28 mm | 3.33 m |
| 35 mm | 4.16 m |
| 50 mm | 5.95 m |
| 65 mm | 7.73 m |
| 85 mm | 10.11 m |
Phòng chỉ 3 × 4 m, đường chéo 5 m: trục dài nhất đặt máy sát tường vẫn chỉ ~3,6–4,5 m.

| Camera | Tiêu cự | Máy | Cách điểm nhìn (m) | Khung cao tại điểm nhìn (m) | Người 1,6 m lọt dọc | Cần ≥ (m) | Lùi thêm được (m) | Sàn thấy | Tường thấy | Nhận xét |
|---|---|---|---|---|---|---|---|---|---|---|
| WIDE | 22 | ngoài | 3.8 | 2.63 | 100% | 2.6 | 0.0 | 54% | 62% | đủ toàn thân; máy ngoài phòng (ẩn tường) |
| DESK | 32 | trong | 1.9 | 0.91 | 51% | 3.8 | 2.5 | 0% | 2% | cận/vật thể (không kiểm toàn thân) |
| BED | 24 | trong | 3.0 | 1.87 | 100% | 2.9 | 0.5 | 13% | 18% | đủ toàn thân |
| DOOR | 24 | trong | 2.3 | 1.45 | 81% | 2.9 | 0.8 | 0% | 11% | THIẾU rộng: người chỉ lọt 81%; lùi 0.6 m là đủ |
| KITCHEN | 28 | trong | 2.0 | 1.08 | 60% | 3.3 | 2.0 | 0% | 3% | THIẾU rộng: người chỉ lọt 60%; lùi 1.3 m là đủ |
| GUONG | 28 | trong | 1.7 | 0.94 | 52% | 3.3 | 1.2 | 0% | 3% | THIẾU rộng: người chỉ lọt 52%; trong phòng chỉ đủ ≤ 24 mm; hoặc ẩn tường/đổi cỡ cảnh |
| GUONG_XIEN | 30 | trong | 1.9 | 0.97 | 54% | 3.6 | 1.5 | 0% | 4% | THIẾU rộng: người chỉ lọt 54%; trong phòng chỉ đủ ≤ 29 mm; hoặc ẩn tường/đổi cỡ cảnh |
| GUONG_VAI | 40 | trong | 1.4 | 0.54 | 30% | 4.8 | 1.9 | 0% | 1% | cận/vật thể (không kiểm toàn thân) |
| GUONG_POV | 34 | trong | 2.1 | 0.92 | 51% | 4.0 | 0.1 | 0% | 0% | cận/vật thể (không kiểm toàn thân) |
| A01 | 35 | trong | 3.1 | 1.34 | 75% | 4.2 | 0.4 | 3% | 16% | THIẾU rộng: người chỉ lọt 75%; trong phòng chỉ đủ ≤ 29 mm; hoặc ẩn tường/đổi cỡ cảnh |
| A02 | 65 | trong | 0.8 | 0.18 | 10% | 7.7 | 3.1 | 0% | 1% | cận/vật thể (không kiểm toàn thân) |
| A02B | 40 | trong | 2.0 | 0.76 | 42% | 4.8 | 1.7 | 0% | 8% | THIẾU rộng: người chỉ lọt 42%; trong phòng chỉ đủ ≤ 31 mm; hoặc ẩn tường/đổi cỡ cảnh |
| A03 | 50 | trong | 3.7 | 1.13 | 63% | 5.9 | 0.3 | 0% | 7% | THIẾU rộng: người chỉ lọt 63%; trong phòng chỉ đủ ≤ 33 mm; hoặc ẩn tường/đổi cỡ cảnh |
| A04 | 65 | trong | 1.6 | 0.38 | 21% | 7.7 | 2.8 | 0% | 0% | cận/vật thể (không kiểm toàn thân) |
| A04B | 65 | trong | 1.1 | 0.25 | 14% | 7.7 | 1.5 | 0% | 3% | cận/vật thể (không kiểm toàn thân) |
| A05 | 35 | trong | 1.0 | 0.41 | 23% | 4.2 | 2.5 | 0% | 2% | cận/vật thể (không kiểm toàn thân) |
| C05 | 85 | trong | 0.6 | 0.10 | 6% | 10.1 | 2.6 | 0% | 0% | cận/vật thể (không kiểm toàn thân) |
| C06 | 35 | trong | 3.2 | 1.40 | 78% | 4.2 | 0.2 | 22% | 13% | THIẾU rộng: người chỉ lọt 78%; trong phòng chỉ đủ ≤ 28 mm; hoặc ẩn tường/đổi cỡ cảnh |
| P203 | 40 | trong | 1.1 | 0.43 | 24% | 4.8 | 2.4 | 0% | 1% | cận/vật thể (không kiểm toàn thân) |
| ORBIT_A | 35 | trong | 2.1 | 0.91 | 51% | 4.2 | 1.3 | 0% | 2% | THIẾU rộng: người chỉ lọt 51%; trong phòng chỉ đủ ≤ 28 mm; hoặc ẩn tường/đổi cỡ cảnh |
| ORBIT_B | 35 | trong | 1.5 | 0.67 | 37% | 4.2 | 1.4 | 0% | 1% | THIẾU rộng: người chỉ lọt 37%; trong phòng chỉ đủ ≤ 24 mm; hoặc ẩn tường/đổi cỡ cảnh |
| ORBIT_C | 35 | ngoài | 2.1 | 0.91 | 51% | 4.2 | 0.0 | 0% | 9% | THIẾU rộng: người chỉ lọt 51%; trong phòng chỉ đủ ≤ 17 mm; hoặc ẩn tường/đổi cỡ cảnh; máy ngoài phòng (ẩn tường) |
| LOW | 24 | trong | 3.4 | 2.13 | 100% | 2.9 | 0.3 | 5% | 22% | đủ toàn thân |

## Máy trong phòng cho khung rộng nhất (mắt 1,5 m, hướng về tâm phòng)
| Vị trí máy (x,y) | Tiêu cự | Sàn thấy | Tường thấy |
|---|---|---|---|
| (2.85, 3.85) | 14 mm | 48% | 31% |
| (2.85, 0.15) | 14 mm | 36% | 39% |
| (2.85, 3.85) | 16 mm | 46% | 24% |
| (1.5, 3.85) | 14 mm | 42% | 26% |
| (0.15, 3.85) | 14 mm | 37% | 31% |
| (1.5, 3.85) | 16 mm | 42% | 26% |
| (2.85, 0.15) | 16 mm | 33% | 33% |
| (2.85, 3.85) | 18 mm | 44% | 21% |

## Chạy máy dài (không gian cần)
- Vertigo 28→85 mm giữ cỡ chủ thể: máy lùi từ 1.1 m tới 3.3 m (+2.2 m). Từ gương (x≈0,14) máy tới x≈3.5 m > 3.0 m: ra ngoài tường cửa sổ (phải ẩn tường). Trong phòng chỉ lùi tối đa 2.8 m → vertigo gọn trong phòng chỉ đạt khoảng 24→74 mm.
- Orbit 180° bán kính 1,0 m quanh (1,2; 2,6): x từ 0,2 đến 2,2, y từ 1,6 đến 3,6 → nằm trọn trong phòng.


## Kết luận

**Chưa đủ rộng cho các cảnh toàn thân trong phòng 3 × 4 m ở các tiêu cự đang ghi trong DUNG-CANH.md.**

1. **Khung 2.39:1 trên sensor 36 mm ngang chỉ cao 15,1 mm**, nên góc nhìn dọc hẹp (35 mm ≈ 24°, 50 mm ≈ 17°). Để thấy trọn người 1,60 m phải đứng cách 4,2 m ở 35 mm, 2,9 m ở 24 mm, 2,1 m ở 18 mm. Phòng chỉ dài 4 m (chéo 5 m), nên máy 35 mm đặt sát tường vẫn chưa thấy đủ.
2. **Đang thiếu:** A01 (75% người lọt), A02B (42%), A03 (63%), C06 (78%), GUONG (52%), GUONG_XIEN (54%), ORBIT_A/B/C (37–51%), KITCHEN (60%), DOOR (81%). Các khung này thành "cỡ trung/cận" chứ không phải toàn thân.
3. **Đủ:** WIDE (22 mm, máy ngoài tường trước, ẩn tường), BED (24 mm), LOW (24 mm).
4. **Máy trong phòng cho khung rộng nhất:** góc phòng (2,85; 3,85) hoặc (2,85; 0,15) ở 14 mm — vẫn chỉ thấy khoảng 36–48% sàn và 31–39% tường vì nội thất che; không có vị trí nào thấy cả phòng.
5. **Vertigo 28→85 mm** cần lùi thêm 2,2 m (tổng 3,3 m từ gương), vượt tường cửa sổ; chỉ làm được khi ẩn tường cửa sổ khỏi camera (đã làm trong `VERTIGO_GUONG`) hoặc rút còn 24→~70 mm trong phòng.

### Đề xuất (cần chủ repo chọn)
- **A (khuyên dùng):** giữ 2.39:1 nhưng **đổi cỡ cảnh trong kịch bản**: toàn thân dùng ≤ 24 mm với tường ẩn (máy ngoài tường trước/tường cửa sổ); các shot 35–65 mm là trung cận (ngang ngực trở lên), ghi rõ trong bảng shot. Thêm camera **toàn thân** cho từng cảnh chính (BED/LOW/WIDE kiểu).
- **B:** nới phòng trong cảnh quay (tường ẩn/di chuyển) cho vài shot — đã có cơ chế `visible_camera = False` cho tường.
