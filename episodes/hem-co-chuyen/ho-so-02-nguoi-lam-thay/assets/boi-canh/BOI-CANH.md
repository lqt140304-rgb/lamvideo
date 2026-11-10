# Bối cảnh — Hồ sơ 2: Người làm thay

**Đại tu 3D 10/11/2026, trên bản `a70ad45`. Bản hình để duyệt; chưa dựng chuyển động.** Áp dụng [Style B chung](../../../../../docs/PHONG-CACH-MY-THUAT.md). Căn phòng giờ là **một mô hình 3D tính bằng cm** trong [boi-canh.tsx](boi-canh.tsx). Mỗi góc máy là một camera thật, nên đồ đạc không lệch chỗ giữa các shot và vật gần che vật xa đúng theo khoảng cách.

![Bảng các góc máy](boi-canh.png)

## Mặt bằng

Phòng rộng 460 cm, cao 265 cm. Trục x từ tường cửa sang tường cửa sổ, z từ tường sau ra phía máy.

| Khu | Vị trí (cm) | Vai trò trong truyện |
|---|---|---|
| Cửa chính, tường trái | z 170–260, bản lề phía bếp, mở vào phòng | Khe sáng đầu cảnh, Nam giữ cửa, gài và quên gài chốt |
| Bếp, sau–trái | x 12–176 | Người kia đứng quay lưng ở bồn rửa |
| Tủ quần áo, sau–giữa | x 225–315 | Mốc cạnh bàn; mũ và balo treo bên cạnh |
| Bàn học, sau–phải | x 338–452 | Laptop cắm sạc, đèn, ví; ngăn dưới đựng giấy tờ |
| Cửa sổ, tường phải | z 90–220 | Nguồn nắng; có song sắt và phố nhìn ra |
| Nệm đôi, tiền cảnh phải | x 252–452, z 215–375 | Đầu nệm sát tường phải. Nam nằm phía máy, chỗ Tùng phía sau có chăn gấp |
| Lối đi | x 0–250 | Đường Nam từ nệm ra cửa, không đi qua người ở bếp |
| Hành lang | ngoài tường trái | Cầu thang bên trái cửa, phòng kế bên phải |

Ngồi dậy trên nệm, Nam quay về phía bếp và cửa, nên hướng nhìn ở A03 đọc được ngay.

## Góc máy

| `view` | Component | Nhóm máy | Ghi chú |
|---|---|---|---|
| `wide` | `RoomMorning`, `RoomNight` | A01, G04, H02, E01B | Thấy cửa, bếp, tủ, bàn, nệm trong một khung |
| `kitchen` | `KitchenSink` | A04, cận người kia ở bồn | |
| `desk` | `StudyCornerMorning`, `StudyDeskNight` | E02, G01, H03–H10 | Ngày và đêm cùng một camera |
| `door` | `DoorInside` | C04–C06, D04, F01, F04 | Thấy rõ lưỡi chốt và ổ chốt |
| `hallway` | `HallwayDoor` | C01–C03, F02, F03 | Máy đặt ngoài lan can, bỏ lan can phía trước để không che người |

## Trạng thái theo kịch bản

Tất cả là prop của `RoomScene`, không vẽ cứng vào nền.

| Prop | Giá trị | Quy tắc |
|---|---|---|
| `door` | `ajar`, `open`, `closed`, `latched` | `ajar` là đầu sáng khép hờ. `closed` là khép nhưng chốt còn rút, đúng lúc Nam quên gài; `latched` lưỡi chốt vào ổ |
| `chair` | `desk`, `door` | Cùng một ghế bốn chân. `door`: đối diện cửa, ngoài vùng quét cánh cửa |
| `phone` | `mat`, `desk`, `hidden` | Màn hình tắt mặc định; báo thức và tin nhắn là lớp riêng theo cue |
| `kitchen` | `messy`, `clean` | `messy`: chén chất trong bồn, vụn mì cạnh bếp. `clean`: chén úp trên giá, sàn sạch, từ nhịp E trở đi |
| `sun` | 0 đến 1 | Nắng rút dần về phía cửa sổ cho chuỗi E và G |
| `night` | true/false | Ánh sáng chỉ đến từ đèn bàn và laptop |
| `drawerOpen` | true/false | Ngăn giấy tờ kéo ra ở D02 |
| `wallet` | true/false | Ví trên bàn, dùng ở cảnh kiểm đồ |
| `clockMinutes` | số phút hoặc `null` | Mặc định không có đồng hồ; chỉ bật khi shot đã chốt giờ |

Căn cước không vẽ sẵn: nó nằm trong ngăn tới D02, dùng prop theo shot. Không có áo vắt trên ghế, vì áo đó đang ở trên người kia. Laptop là trang giấy trung tính, nội dung bài thay bằng lớp màn hình theo shot.

## Đưa nhân vật vào cảnh

```tsx
<RoomMorning actors={[{ at: [94, 92], render: (p) => <StudentTwinBody {...p} pose={...} /> }]} />
```

`at` là `[x, z]` trên sàn. `actors` tự tính vị trí, tỉ lệ theo khoảng cách và xếp lớp cùng đồ đạc, nên chân chạm đúng sàn và người đứng sau vật sẽ bị che. Cần toạ độ riêng thì gọi `placeOn(view, [x, z])`.

Điểm đứng gợi ý: bồn rửa `[94, 92]`, ngồi trên nệm `[300, 340]`, trước cửa `[60, 215]`, ngoài hành lang dùng z −60 (phía cầu thang), 215 (trước cửa), 400 (phía đối diện) với x khoảng −80.

## Xuất lại và giới hạn

Chạy `node render-previews.cjs` trong thư mục này để xuất SVG, PNG và trang xem. Không sửa riêng ảnh. [kiem-tra-ti-le.png](kiem-tra-ti-le.png) đặt nhân vật thử vào nền, không phải vị trí đã duyệt.

Chưa có: máy chuyển động thật, tay che/lộ theo mặt bàn và mép bồn, người đi qua ngưỡng cửa. Các tương tác đó vẫn cần thử ở animatic. Khi hạ tiêu cự hoặc đổi camera, kiểm tra lại vật ở sát máy.
