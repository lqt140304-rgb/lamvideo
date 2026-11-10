# Hồ sơ 2 — Clip riêng: Nam giữa khung

**Đề xuất, 10/11/2026.** Chủ repo yêu cầu làm riêng đoạn này, tách khỏi [trailer P1.00](PHAN-01-NGUOI-TRONG-PHONG.md#p1-00). Nam đứng yên giữa khung, trung cảnh từ thắt lưng. Phía sau, bối cảnh đổi liên tục theo dòng thời gian truyện; nét mặt, cử chỉ và trang phục của Nam đổi theo.

Đoạn này **hé cả truyện, dừng trước kết**:
- bản sao không xuất hiện;
- không có thế giới gương hay cách Nam bị thay;
- gương chỉ là đồ vật bình thường.

## Đã chọn và còn đề xuất

- **Đã chọn:**
  - Nam giữa khung, nền đổi theo thời gian, cảm xúc đổi theo;
  - hé cả truyện;
  - **tốc độ tăng một chút** (khoảng 0,93 giây mỗi nhịp, trước là 1,2 giây);
  - **nhiều bộ trang phục, có đồng phục và đồ thể thao**;
  - làm thành clip riêng.
- **Còn đề xuất:**
  - thứ tự 13 nhịp, biểu cảm và trang phục từng nhịp;
  - màu đồng phục và đồ thể thao;
  - có lời dẫn hay chỉ nhạc.

## Nhịp

Khoảng **12,7 giây** ở 30 fps: 13 nhịp × 28 frame, cộng 18 frame giữ ở nhịp cuối. Nền hòa sang nền trong 6 frame. Nam chớp mắt đúng lúc đổi nét mặt và đổi đồ, dáng tay nối mượt.

| Nhịp | Thời gian truyện | Nền | Nam | Trang phục |
|---|---|---|---|---|
| I1 | Một tuần trước | Góc đồ cho tặng | Hớn hở, tay đưa ra như vừa nhặt được gương | Đồng phục |
| I2 | Ngày thường | Góc nệm, ngày | Mắt díp, cầm máy: “Tí nữa” khi Tùng rủ đá bóng | Đồ thể thao |
| I3 | Ngày thường | Góc nệm, đêm | Cúi vào máy | Áo xanh rêu |
| I4 | Ngày thường | Góc nệm, sáng, cửa mở | Ngập ngừng | Áo ngủ xám |
| S1 | Ngày 1 · 7:00 | Góc bếp, bồn đã sạch | Sững sờ | Áo ngủ xám |
| S2 | Ngày 1 | Cửa gài chốt | Nghi ngờ, khoanh tay | Áo ngủ xám |
| S3 | Ngày 1 · chiều | Bàn học, nắng rút | Bực bội | Áo ngủ xám |
| S4 | Ngày 1 · tối | Bàn học đêm | Nhẹ nhõm | Áo ngủ xám |
| S5 | Ngày 2 | Toàn phòng | Đắc ý, như trao máy | Áo xám có túi |
| S6 | Ngày 2 · tối | Bàn học đêm | Ngập ngừng | Áo xám có túi |
| S7 | Ngày 2 · khuya | Góc nệm, cửa gài | Bình tĩnh, quyết tâm | Áo xám có túi |
| S8 | Ngày 3 | Hành lang, cầu thang | Sợ, định bước đi | Đồng phục |
| S9 | Ngày 3 | Góc gương, đêm | Sững sờ, đề phòng | Đồng phục |

Ngày 1 giữ áo ngủ xám vì chiếc áo xanh rêu đang ở trên người bản sao (P1.01). Trang phục ở các nhịp khác là lựa chọn mới cho clip này, chưa đổi trang phục trong kịch bản các phần.

**Âm/lời đề xuất:** chỉ nhạc thư viện dồn theo phách, nhạc cắt cụt sau S9. Nếu cần lời dẫn, chọn một trong hai câu sau, đặt ở S1 và S8:
> Rồi một sáng, có người làm thay cậu mọi thứ.
> Nhưng làm thay tới đâu… thì vừa?

## Nguồn và cách xem

- **Bảng phân cảnh:** [nam-giua-khung-bang.png](assets/trailer/nam-giua-khung-bang.png).
- **Trang phục:** [trang-phuc-nam.png](assets/trailer/trang-phuc-nam.png). Có 5 bộ trong `NAM_OUTFITS` của [rig](assets/nhan-vat.tsx): `xanh`, `ngu`, `xam-tui`, `dong-phuc`, `the-thao`. Đồ thể thao chưa có giày riêng, tạm dùng dép.
- **Mã:** [`trailer-nam-giua-khung.tsx`](../../../what-if-studio/src/episodes/ho-so-02-nguoi-lam-thay/trailer-nam-giua-khung.tsx). Trong studio có composition `HoSo02NamGiuaKhung` (clip) và `HoSo02NamGiuaKhungBoard` (bảng).
- **Nền:** các góc máy của [mô hình phòng](assets/boi-canh/BOI-CANH.md#góc-máy), gồm ba nền mới: gương, góc đồ cho tặng, cầu thang.

Chưa có giọng, nhạc hay âm; chưa render bản cuối. Bản xem thử nửa độ phân giải chỉ để duyệt nhịp, không đưa lên repo.
