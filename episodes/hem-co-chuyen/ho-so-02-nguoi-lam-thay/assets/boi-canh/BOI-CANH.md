# Bối cảnh — The Crack in Reality — Hồ sơ 02: Người trong gương (trước đây: Người làm thay)

**Bóng cập nhật 11/11/2026:** phòng vẫn dùng hình học/camera không gian; cách tô đã chuyển sang màu mặt chọn sẵn và bóng tiếp xúc tự vẽ. Bỏ bóng vật liệu sinh theo hướng đèn, gradient trụ, blur AO và lớp tối falloff. Ánh đèn/vệt nắng là lớp không khí riêng. Bảng tám góc phòng và kiểm tra tỉ lệ đã xuất lại; ảnh thử ánh sáng/video local cũ không phải chuẩn bóng mới. Đọc [quy chuẩn hiện hành](../thiet-ke/QUY-CHUAN-THIET-KE-SVG.md#40-bóng-vẽ-tay-không-viền-11112026).


**Đại tu 3D 10/11/2026, trên bản `a70ad45`. Bản hình để duyệt; chưa dựng chuyển động.** Áp dụng [Style B chung](../../../../../docs/PHONG-CACH-MY-THUAT.md). Căn phòng giờ là **một mô hình 3D tính bằng cm** trong [boi-canh.tsx](boi-canh.tsx). Mỗi góc máy là một camera thật, nên đồ đạc không lệch chỗ giữa các shot và vật gần che vật xa đúng theo khoảng cách.

![Bảng các góc máy](boi-canh.png)

> **Ánh sáng 11/11/2026 (chờ duyệt):** theo ảnh đề xuất của chủ repo, `RoomScene` có `grade` (mặc định bật). Ánh sáng làm theo **từng mặt vật thể**: mỗi mặt có ba mức vẽ sẵn (hướng nguồn sáng và ở gần thì ám ấm, quay lưng thì ám lạnh, còn lại giữ màu gốc), nguồn chính là cửa sổ (ngày), đèn bàn (đêm), đèn tuýp (hành lang); ban đêm cửa sổ chỉ hắt ánh trăng rất nhẹ. Thêm vài mảng nắng vàng trên sàn và bóng ngắn vẽ sẵn của nệm, tủ, bàn, bếp (ngày). Người đặt qua `actors` được ám ấm phía nguồn sáng và ám lạnh phía ngược lại, cắt đúng theo hình người (mask alpha); người truyền qua `children` thì không. Lớp phủ toàn ảnh chỉ còn là hòa màu nhẹ ở cuối. Truyền `grade={false}` để lấy lại bảng màu phẳng cũ. **Các bối cảnh 3D của bộ bổ sung** (`kit3d`) dùng cùng nguyên tắc: mỗi mặt chỉ có ba mức sáng vẽ sẵn (hướng nắng/đèn thì ám ấm, quay lưng ám lạnh, còn lại giữ nguyên; ánh đèn cũng chia bậc), và người truyền qua `children` được ám ấm/lạnh theo nguồn sáng gần nhất, cắt theo hình người (`S.litActors`). Tắt chia bậc bằng `band: false` trong `Light`. **Bối cảnh tự chuyển động (11/11/2026, chờ duyệt):** `RoomScene` nhận `frame` (số khung, 30 fps); có giá trị thì quạt quay và quay đầu, rèm lay, bụi trôi trong vệt nắng ban ngày, đèn bàn ban đêm nhấp nhẹ. Bỏ trống thì tĩnh. Các bối cảnh 3D (`kit3d`) cũng nhận `frame`: tán cây và bụi cây đung đưa (mọi cảnh có cây), sinh viên nền ở giảng đường thở và thỉnh thoảng gật, màn hình hạn nộp ở Lab 402 đếm ngược theo giây, hơi nóng bốc lên từ bát canh ở mâm cơm, giọt mưa rơi từ mái ở góc đồ cho tặng, đèn tuýp hành lang trọ tự chập chờn (hoặc truyền `flicker`), thế giới gương gợn sóng, khung gương dập dềnh và hạt sáng nhấp nháy. Bỏ trống `frame` thì tĩnh như cũ. **Tường, sàn, trần** của giảng đường, Lab, mâm cơm, tiệm cắt tóc được chia thành các dải/ô để mức sáng đổi theo từng dải (gần nguồn sáng ấm hơn, xa thì dịu) thay vì một màu phẳng. **Tách lớp:** truyền `layers` cho bối cảnh 3D thì đầu ra chia thành các nhóm `SKY`, `BACK` (vỏ phòng, bóng, quầng sáng, vật xa), `MID`, `FORE` (16% vật gần máy nhất) để ghép thị sai; hình giữ nguyên. **Khung 2.39:1:** truyền `scope` để phủ hai thanh đen (`Scope`, `SCOPE_BAR` trong `kit3d`), vùng thấy được cao 804 px. Người nền: áo sinh viên giảng đường đổi theo mức sáng tại chỗ ngồi, gia đình ở mâm cơm ám ấm/lạnh theo đèn.

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
| `bed` | `BedCorner` | A02, A03, A05, H01 | Thấy cả chỗ Nam, chỗ Tùng và ghế cạnh nệm |
| `hallway` | `HallwayDoor` | C01–C03, F02, F03 | Máy đặt ngoài lan can, bỏ lan can phía trước để không che người |
| `mirror` | `MirrorCorner` | Trailer S9; P2.07, P3 | Góc gương cạnh hông trái tủ. [Ngày](goc-guong.png), [đêm](goc-guong-dem.png). Mới 10/11/2026, chờ duyệt |
| `giveaway` | `GiveawayCorner` | Trailer I1; P3.07 | Góc đồ cho tặng cuối hành lang: kệ thấp, thùng, túi áo, đèn cũ, tờ giấy dán tường. [Xem](goc-do-cho-tang.png). Mới, chờ duyệt |
| `stairs` | `HallwayStairs` | Trailer S8; P3.04 | Hành lang nhìn vào hốc cầu thang; lòng hốc chỉ lộ qua ô mở. [Xem](hanh-lang-cau-thang.png). Mới, chờ duyệt |

## Trường học và sân thể thao — đề xuất 10/11/2026, chờ duyệt

Nguồn riêng [`truong-va-san.tsx`](truong-va-san.tsx), không thuộc mô hình phòng. Mỗi cảnh là một camera phối cảnh thật theo cm; `placeAt(cảnh, x, z)` đặt nhân vật chạm đất đúng tỉ lệ. Trường là trường chung chung, biển chỉ ghi "TRƯỜNG ĐẠI HỌC", không tên trường thật.

| Component | Cảnh | Ảnh |
|---|---|---|
| `SchoolYard`, `SchoolYardNight` | Sân trường, dãy nhà ba tầng có hành lang lan can, cột cờ, cây bàng, ghế đá | [ngày](san-truong.png), [đêm](san-truong-dem.png) |
| `SchoolCorridor` | Hành lang tầng hai: lan can nhìn ra sân, cửa lớp, cột đều nhịp | [xem](hanh-lang-truong.png) |
| `LectureRoom` | Giảng đường: bảng trắng, bàn dài nhiều dãy, cửa sổ có nắng, quạt trần | [xem](giang-duong.png) |
| `FootballPitch`, `PitchDusk`, `PitchNight` | Sân bóng mini cỏ nhân tạo, khung thành có lưới, rào lưới, cột đèn, ghế băng | [ngày](san-bong.png), [chiều](san-bong-chieu.png), [đêm](san-bong-dem.png) |

## Trạng thái theo kịch bản

Tất cả là prop của `RoomScene`, không vẽ cứng vào nền.

| Prop | Giá trị | Quy tắc |
|---|---|---|
| `door` | `ajar`, `open`, `closed`, `latched` | `ajar` là đầu sáng khép hờ. `closed` là khép nhưng chốt còn rút, đúng lúc Nam quên gài; `latched` lưỡi chốt vào ổ |
| `chair` | `bed`, `door`, `desk` | Cùng một ghế bốn chân. `bed`: để cạnh lối đi đầu sáng, chỗ Nam va đầu gối ở A05. `door`: đối diện cửa, ngoài vùng quét cánh cửa. `desk`: từ E02 trở đi |
| `phone` | `mat`, `desk`, `hidden` | Màn hình tắt mặc định; báo thức và tin nhắn là lớp riêng theo cue |
| `kitchen` | `messy`, `clean` | `messy`: chén chất trong bồn, vụn mì cạnh bếp. `clean`: chén úp trên giá, sàn sạch, từ nhịp E trở đi |
| `sun` | 0 đến 1 | Nắng rút dần về phía cửa sổ cho chuỗi E và G |
| `night` | true/false | Ánh sáng chỉ đến từ đèn bàn và laptop |
| `drawerOpen` | true/false | Ngăn giấy tờ kéo ra ở D02 |
| `move` | `{ truck, push }` theo cm | Dịch máy thật cho C02, E02, H09; vật gần trôi nhiều hơn vật xa. Truyền cùng giá trị cho `placeOn` nếu đặt người thủ công |
| `sleeper` | hàm vẽ | Vẽ đầu Nam trên gối, nằm dưới chăn, cho A01, G04, H01 |
| `wallet` | true/false | Ví trên bàn, dùng ở cảnh kiểm đồ |
| `mirror` | true/false | Gương đứng khung gỗ 50 × 120 cm, chèn một chân, cạnh hông trái tủ, xoay mặt vào phòng. **Mặc định tắt** để các bảng nền đã xuất không đổi; có bật mặc định cho mọi cảnh hay không chờ chủ repo duyệt vị trí. Kính chỉ phản chiếu ánh sáng chung, chưa có lớp phản chiếu nhân vật |
| `giveaway` | true/false | Hiện góc đồ cho tặng ở hành lang; luôn bật ở view `giveaway` |
| `clockMinutes` | số phút hoặc `null` | Mặc định không có đồng hồ; chỉ bật khi shot đã chốt giờ |

Căn cước không vẽ sẵn: nó nằm trong ngăn tới D02, dùng prop theo shot. Không có áo vắt trên ghế, vì áo đó đang ở trên người kia. Laptop là trang giấy trung tính, nội dung bài thay bằng lớp màn hình theo shot.

## Đưa nhân vật vào cảnh

```tsx
<RoomMorning actors={[{ at: [94, 92], render: (p) => <StudentTwinBody {...p} pose={...} /> }]} />
```

`at` là `[x, z]` trên sàn. `actors` tự tính vị trí, tỉ lệ theo khoảng cách và xếp lớp cùng đồ đạc, nên chân chạm đúng sàn và người đứng sau vật sẽ bị che. Lưng ghế là lớp riêng, che đúng người ngồi. Cần toạ độ riêng thì gọi `placeOn(view, [x, z])`.

Người ngồi ghế: `at` lấy từ `SEATS[chair]`. Bàn cao 65 cm, ghế 40 cm, mặt bếp 76 cm, thấp hơn đồ thật vì rig chân ngắn, để tay chạm được bàn và hông đúng mặt ghế.
---

## 4. Bài học kinh nghiệm & Tiêu chuẩn vàng thiết kế Bối cảnh (Đúc kết từ phiên bản chuẩn được duyệt)

1. **Khóa bản vẽ mặt bằng tác giả (`image.png`) làm nguồn chân lý duy nhất (Single Source of Truth):**
   - Mọi góc máy (Toàn cảnh 24mm, Cận cảnh bồn rửa 50mm, Trung cảnh bàn học 35mm, Cận cảnh bàn học đêm 50mm) đều là các camera chụp trong **CÙNG MỘT KHÔNG GIAN 3D DUY NHẤT**.
   - Căn phòng chỉ có duy nhất **1 cửa chính ở tường trái** mở ra hành lang; vật thể ở tường sau cạnh bàn học là **TỦ QUẦN ÁO ĐỨNG**, tuyệt đối không biến thành cửa phụ hay cửa sổ.

2. **Đồng bộ 100% Mô hình Kiến trúc & Đạo cụ cốt lõi (Canonical Asset Model):**
   - Chiếc bàn học của Nam là một "Canonical Model" thống nhất trên tất cả các shot:
     - Mặt bàn gỗ nâu mật ong (`#8a5833`), nẹp cạnh (`#54361e`), thùng bàn óc chó (`#3f2d21`), khoang để chân bên trái.
     - Giá sách mini 2 tầng góc trái: tầng trên có 3 cuốn giáo trình (*Triết học* đỏ, *Toán CC* xanh dương, *Kinh tế chính trị* xanh lá), tầng dưới có tập vở + note vàng `NỘP BÀI!`.
     - Khối 2 ngăn kéo bên phải có núm kéo tròn bằng đồng vàng (`#d4af37`), bố trí không bị nệm hay đồ vật tiền cảnh che khuất.
     - Đèn cổ ngỗng đỏ (`#dc2626` / `#b91c1c`) ở góc phải mặt bàn.
     - Laptop Google Docs mở chính diện có dây sạc cắm bên trái rủ xuống chân bàn.
     - Ống cắm bút xanh (`#0284c7`), ly sứ trắng uống nước, ví da và thẻ CCCD gắn chip.
     - Ghế ngồi to đầm chắc, chuẩn tỉ lệ cơ thể người, có áo thun vắt lưng ghế.

3. **Kể chuyện môi trường & Chi tiết sinh hoạt sinh viên chân thực (Environmental Storytelling):**
   - Không để phòng trọ thành showroom trống trơn; đưa vào các chi tiết đời sống có câu chuyện:
     - Bình nước khoáng 20L màu xanh dương có vòi rót đỏ trắng.
     - Thùng mì tôm Hảo Hảo chua cay đặt gầm quầy bếp.
     - Chai Sunlight vàng chanh + miếng mút xơ mướp, khăn lau bếp.
     - Thanh móc treo tường cạnh tủ có Mũ bảo hiểm xe máy nửa đầu và Balo sinh viên đi học.
     - Liên kết dây cắm điện thực tế: dây sạc laptop, dây sạc điện thoại trắng nối từ ổ cắm ngang sàn đến nệm, dây nguồn quạt cắm tường.
     - Dép lê sinh viên quay mũi ra ngoài, áo thun rơi trên sàn trước nệm, chai nước suối lăn lóc, vết nứt tường chân thực.

4. **VFX điện ảnh hữu cơ, tinh tế:**
   - Hạt bụi phòng trọ `VFX-DUST` lơ lửng trong luồng sáng sớm và nón ánh sáng đèn bàn.
   - Gợn sóng nước `VFX-RIPPLE` dưới vòi nước nhỏ giọt ở bồn rửa chén.
   - Hơi ấm bốc nhẹ `VFX-SMOKE` từ ly nước nóng ban đêm.
   - Nón ánh sáng đèn bàn dùng hình thang volumetric gradient mềm, tạo quầng rọi vàng ấm trên mặt gỗ thay vì hình tròn chói gắt.

5. **Quy trình lắp ráp tự động (Automated Assembly):**
   - Biên dịch tự động Master Board 4K (`boi-canh.svg`) trực tiếp từ 4 file SVG thành phần để đảm bảo 100% không bao giờ xảy ra lệch pha mã nguồn.


Điểm đứng gợi ý: bồn rửa `[94, 92]`, ngồi trên nệm `[300, 340]`, trước cửa `[60, 215]`. Hành lang dùng x khoảng −80 với z −60 (phía cầu thang), 215 (trước cửa), 400 (phía đối diện).

## Xuất lại và giới hạn

Chạy `node render-previews.cjs` trong thư mục này để xuất SVG, PNG và trang xem. Không sửa riêng ảnh. [kiem-tra-ti-le.png](kiem-tra-ti-le.png) đặt nhân vật thử vào nền, không phải vị trí đã duyệt.

Chưa có: tay che/lộ theo mặt bàn và mép bồn, người đi qua ngưỡng cửa, dáng nằm toàn thân. Các tương tác đó vẫn cần thử ở animatic. Bốn dáng `wary`, `phone`, `offer`, `type` mới soi ở góc 3/4. Khi đổi camera, kiểm tra lại vật ở sát máy.
