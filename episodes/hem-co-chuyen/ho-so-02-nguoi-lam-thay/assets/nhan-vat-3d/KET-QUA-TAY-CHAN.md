# Bàn tay và bàn chân riêng gắn vào Nam — kết quả (14/11/2026)

Thiết kế: [THIET-KE-TAY-CHAN.md](THIET-KE-TAY-CHAN.md) · Kế hoạch: [KE-HOACH-TAY-CHAN.md](KE-HOACH-TAY-CHAN.md)
Nguồn: [dung_tay_nam.py](dung_tay_nam.py) · [dung_chan_nam.py](dung_chan_nam.py) · [gan_tay_chan_nam.py](gan_tay_chan_nam.py)

**Trạng thái: đạt hình khối tĩnh, gắn lên thân cage.** Chưa rig thân cage, nên chưa kiểm nếp nối khi gập cổ tay/bàn chân.

## Lệnh chạy
```
bpyv/bin/python dung_tay_nam.py  --check --render DIR --blend OUT.blend     # bàn tay riêng + rig thử, 4 tư thế, ~3 phút
bpyv/bin/python dung_chan_nam.py --check --render DIR --blend OUT.blend     # bàn chân riêng + rig thử, đứng / nhấc gót
bpyv/bin/python gan_tay_chan_nam.py --check --render DIR --blend OUT.blend  # dựng thân cage, gắn tay/chân, kiểm nối, ảnh cận + toàn thân, ~3,5 phút
```
`--check` in PASS/FAIL từng mục. Ảnh và `.blend` nằm ở `render-than/` (không commit).

## Bàn tay (`Nam_BanTay.L/.R`)
- Lòng tay hộp bo tròn thu về cổ tay, bốn ngón ngắn mập 3 đốt, ngón cái lệch ra trước lòng tay; không móng/gân/nếp khớp. Tay phải = lật gương đúng từng đỉnh.
- Rig thử trên xương `hand`; thuộc tính `fist`, `grip`, `relax`, `spread` lái các đốt. Hệ số cuộn từng ngón do `calibrate()` dò để đầu ngón chạm lòng tay/cốc, không xuyên.
- Nắm tay: ngón cái vắt ngang qua đốt giữa ngón trỏ/giữa (quét 3 trục xoay gốc ngón cái; cần xoắn ~30–40° quanh trục dọc). Ngón út còn cách lòng tay ~6 mm.
- Còn lỏng: cầm cốc 7 cạnh giãn nhẹ (tối đa 2,15×).

## Bàn chân (`Nam_BanChan.L/.R`)
- Dựng bằng các elip nhỏ quét dọc chân theo đường cong kích thước mượt + làm mượt Taubin (cách mặt cắt siêu elip cho mép vuông, đã bỏ). Gót tròn, mu thoai thoải, năm ngón mập chia bằng rãnh nông, đế phẳng. Dài 284 mm, rộng 146 mm.
- Rig thử: `shin` / `foot` / `toe`; nhấc gót 60 mm với ngón phẳng sàn (cạnh giãn tối đa 1,73×).
- Còn lỏng: phóng rất lớn, rãnh giữa các ngón còn vài gợn ở đầu ngón.

## Gắn vào thân cage (cách B: vật riêng)
- Bàn tay co theo KZ (0,922) rồi dời/xoay theo vòng cổ tay đo thực (cẳng tay r = 35,7 mm). Đoạn cổ tay nở/co về r = 92% bán kính ống để nằm trọn trong ống; gốc lòng tay thu hẹp dần từ bán kính ống ra bề ngang đầy đủ ở khớp ngón; vùng chuyển làm mượt Taubin.
- Bàn chân đặt theo tâm ống chân đo thực (r = 55,5 mm, lệch < 1 mm); mu chân sát ống được nâng dần (tối đa 12 mm, vùng 20 mm) để dâng lên gặp ống chân, không còn gờ cứng.
- Kiểm nối (`check_seams`): đoạn cổ tay 512/512 đỉnh trong ống; bán kính tay tại chỗ ra khỏi ống lệch 0,7 mm; đoạn cổ chân 2430/2430 đỉnh trong ống chân; đế chạm sàn z = 0; chiều cao 1,6003 m.

## Chưa làm / còn lỏng
- **Chưa kiểm nếp nối khi gập cổ tay, gập bàn chân, giơ tay, ngồi**: thân cage chưa rig. Phải rig thân cage rồi mới có hai tư thế `gap_co_tay_45`, `gap_ban_chan_45` của kế hoạch.
- Cổ tay còn hai bờ nhô rất nhỏ như "tai" ở mép ống (thử thu 6% thì hiện chấm lõm nên giữ bản này).
- `rig_nam.py` chưa đổi: rig hiện có là của thân v2.11 cũ (ngón 2 đốt); thêm đốt 3 và driver `grip` chỉ có nghĩa khi rig thân cage.
- Chưa có dép; chưa có mắt/miệng (chủ repo chỉnh riêng).
