# Cách thiết kế và dùng lại bộ asset

Hồ sơ 02 — Người trong gương, cập nhật 11/11/2026. Đây là hướng dẫn nguồn hiện có, không phải xác nhận đã hoàn thiện phim.

## Nguyên tắc tạo hình đã chốt

- Cartoon mềm, đường cong liền và mảng màu rõ khi thu nhỏ; không viền ngoài nhân vật. Giữ nét mắt/mày/miệng, nốt ruồi và nếp chính. Không tăng chi tiết bằng cách thêm nét ở mọi khớp.
- Đầu, cổ, tay và chân dùng cùng màu da nền. Tách lớp bằng hình/che khuất trước; không làm tối cả cánh tay khiến đầu và thân như hai người khác nhau. Bỏ dải bóng cằm/má giống râu.
- Bóng là vài mảng tự vẽ, cắt trong đúng vật; cổ, vạt áo và dấu tiếp xúc nhỏ khi cần. Bỏ bóng vật liệu sinh theo đèn, blur AO, rim và gradient bóng nhựa. Hình học/camera 3D vẫn giữ để bố trí không gian; kính gợn/đèn/bụi là VFX riêng.
- Tóc nhân vật mới phải phủ kín phần da đầu cần che, bám đường sọ và không hở nền dưới mái. **Tóc Nam/Người Kia giữ nguyên mẫu cũ theo lựa chọn của chủ repo**; không đồng loạt đổi tóc dàn cũ khi sửa vai mới.

## Chọn đúng nguồn

| Nhu cầu | Nguồn |
|---|---|
| Nam/Người Kia/Tùng, khớp và da/đầu/tóc gốc | [../nhan-vat.tsx](../nhan-vat.tsx); `assets/rig/` là bản tham khảo cũ |
| Vai phụ, áo sơ mi, tư thế bổ sung | [nhan-vat-va-tu-the.tsx](nhan-vat-va-tu-the.tsx) |
| Đạo cụ và gương | [dao-cu.tsx](dao-cu.tsx) |
| Nền bổ sung | [boi-canh.tsx](boi-canh.tsx); phòng gốc ở [nguồn phòng](../boi-canh/boi-canh.tsx) |
| UI và đối chiếu | [giao-dien.tsx](giao-dien.tsx) |
| Nét mặt dùng chung, ba mức | [bộ gốc](../../../../../what-if-studio/library/expressions/cartoon-soft/README.md) và [18 nét bổ sung](../../../../../what-if-studio/library/expressions/cartoon-soft/bo-sung-cot-truyen/README.md) |
| Danh mục/cảnh/kích thước | [MANIFEST.json](MANIFEST.json) và [catalog.tsx](catalog.tsx) |

Thêm asset đặc thù vào thư mục hồ sơ; nét mặt dùng lại nhiều nhân vật để ở thư viện chung, hồ sơ chỉ trỏ tới và giữ bảng ghép kiểm tra. Không chép thêm bộ tóc/đầu vào các SVG nét mặt.

## Dáng người, bàn tay và vật cầm

1. Bắt đầu từ `STAND_POSE`/`TWIN_POSES`; dùng `solveRig` tính vai–khuỷu–cổ tay, hông–gối–cổ chân. R/L theo giải phẫu, không phải trái/phải màn hình; quay người phải giữ đúng bên ngón cái.
2. Bàn tay dùng một đường bao Bézier liên tục cho từng dáng: thả, mở, nắm, giữ, gõ, cầm máy. Không ghép các capsule ngắn cho từng đốt vì dễ thành cục/gai. Đầu đường tay ăn vào cẳng tay; phần da đi ra đúng cửa tay áo, không nổi trên quần sai lớp.
3. Chọn tư thế có mục đích: thuyết trình mở một tay sang bên, thị uy một nắm tay; tay còn lại thả. Tránh gập cả hai tay qua ngực nếu không có hành động cụ thể.
4. Đồ cầm theo tọa độ giải khớp. `gripAt` tính điểm cổ tay sau nghiêng thân; búa/túi có gốc cầm `(0,0)`. Tay che đúng cán/quai, không đặt vật theo mắt trong từng frame. Máy ngang `prop: 'phoneLandscape'` đặt giữa hai cổ tay, dưới lớp ngón tay.
5. `PoseActor` minh họa ghế hoặc nệm/gối trong nhóm `data-layer="support"`. Khi dựng trong phòng, thay nhóm minh họa bằng mặt đỡ thật; không chồng hai nệm/ghế. Hai dáng `nam-choi-game`, `nam-nhin-tran` dành cho góc trần nhìn xuống; `support: 'bed'` bỏ bóng đứng, dùng chân trần. Không xoay ngang rig đứng để giả làm dáng nằm.
6. Bảng preview phải chứa đủ ngón, chân và đồ vật; khung cắt mất bàn tay dễ bị hiểu nhầm là lỗi rig. Soi cả asset rời lẫn ghép người–vật–nền. Sau đó mới kiểm tra animatic cầm/đặt/thả và chuyển trọng lượng.

## Diễn xuất theo cốt truyện

```tsx
<StudentTwinBody identity="nam" face="toi-loi-02" pose={EXTRA_POSES['suy-sup']} />
<PoseActor name="nam-choi-game" x={240} y={50} />
```

`PoseActor` tự chọn nét cho bảng mẫu; khi dựng shot cần chọn lại theo nhịp truyện. Mức 1 thoáng, mức 2 rõ, mức 3 chỉ cho cao trào; không áp mức 3 suốt cảnh. Buông xuôi tăng mức bằng giảm phản ứng, không bằng mở miệng lớn hơn. Người Kia đầu truyện vẫn dễ gần; cười lạnh chỉ xuất hiện sau khi bí mật được hé.

Lớp màu cảm xúc nhỏ và tiết chế; không phủ tím/đỏ toàn mặt hoặc dùng nó thay cho ánh nhìn, hơi thở, động tác. `talk`/`blink` giữ lớp nói/chớp riêng. Nét mặt mới chỉ kiểm tra chính diện/ba phần tư; đổi góc sâu phải có bản vẽ tương ứng.

## Không gian, layer và trạng thái

Nền mới là plate 2D chia xa–giữa–người–lớp che gần; chưa thể đổi camera 3D tùy ý. Phòng gốc có mô hình không gian, giữ đúng vị trí đồ khi chuyển camera. Chữ/UI nằm trong màn hình riêng; không đảo cả SVG. Phản chiếu truyền thành lớp riêng trong gương, khung không biến dạng; kính hóa nước nhận progress/phase từ frame, không dùng animation CSS ngẫu nhiên.

## Kiểm tra trước khi nhân rộng

```powershell
node episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/bo-sung-15p/verify.cjs
node episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/bo-sung-15p/render-previews.cjs
# Trong what-if-studio:
node tests/ho-so-02-rig.cjs
```

Exporter kiểm tra ID/clip, số hữu hạn, neo búa và hai đầu máy ngang; kiểm tra rig giữ độ dài xương/giới hạn và ID khi dùng cùng nét mặt nhiều lần. Xuất lại SVG/PNG/HTML/manifest từ nguồn. Khi đổi kiểu tóc/da/khớp, xuất thêm bảng nhân vật và phòng phụ thuộc.

Các kiểm tra kỹ thuật và bảng tĩnh không chứng minh diễn hoạt, khẩu hình, tương tác hay thời lượng đã đạt. Chưa dựng video/giọng trong lượt tạo asset này. Vai phụ hiện chỉ có góc ba phần tư phía trước; tư thế nằm mới chỉ có góc từ trần. Claude cần storyboard/animatic để kiểm tra phần chuyển động theo yêu cầu sản xuất của chủ repo.
