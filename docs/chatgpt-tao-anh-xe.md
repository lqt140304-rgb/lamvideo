# Nhờ ChatGPT tạo ảnh xe

Làm lần lượt trong CÙNG MỘT cuộc trò chuyện để hai xe cùng phong cách.

## Lời nhắc 1: xe xăng

```
Vẽ một chiếc xe máy tay ga chạy xăng kiểu Việt Nam (dáng như Honda Vision), nhìn thẳng từ bên hông phải sang, toàn thân xe nằm trọn trong khung.
Phong cách: minh họa vector phẳng hoạt hình, nét viền đen dày đều, tô màu phẳng có thêm mảng sáng và tối đơn giản, giống hình minh họa trong video giải thích.
Màu thân xe đỏ. Phải thấy rõ: ống xả bạc ở phía sau, đèn pha, gương chiếu hậu, yên đen, biển số trắng, hai bánh xe có nan và phuộc.
Nền trắng trơn tuyệt đối (hoặc nền trong suốt nếu làm được), không có người, không chữ, không logo hãng, không bóng đổ trên nền, không mặt đường.
Ảnh ngang, độ phân giải cao.
```

## Lời nhắc 2: xe điện (gửi ngay sau khi có xe xăng)

```
Giờ vẽ chiếc xe máy điện tay ga cùng phong cách, cùng góc nhìn, cùng kích thước và cùng dáng tổng thể với xe vừa rồi (dáng như VinFast Evo).
Khác biệt phải thấy ngay: thân xe màu xanh lá kết hợp trắng; KHÔNG có ống xả; có vỏ bình pin ở giữa thân xe với biểu tượng tia sét vàng; có cổng sạc nhỏ; đèn LED.
Nền trắng trơn tuyệt đối (hoặc trong suốt), không có người, không chữ, không logo, không bóng đổ trên nền.
```

## Sau khi có ảnh

1. Tải 2 ảnh về, đặt tên `xe-xang.png` và `xe-dien.png`.
2. Tách nền và đưa vào dự án:
   ```powershell
   cd D:\lamvideo
   git pull
   python tools/cutout_prop.py "$env:USERPROFILE\Downloads\xe-xang.png" xe-xang
   python tools/cutout_prop.py "$env:USERPROFILE\Downloads\xe-dien.png" xe-dien
   npm run render -- xe-dien-ha-noi
   ```

## Mẹo

- Nếu xe bị cắt mất bánh hoặc đèn, nhắn thêm: "Xe bị cắt, vẽ lại thu nhỏ để còn chừa lề trắng xung quanh".
- Nếu nền không trắng thuần (có bóng, có sàn), nhắn: "Bỏ bóng và mặt sàn, nền trắng #FFFFFF phẳng".
- Hai xe cần cùng hướng (đầu xe quay sang phải) vì video đang vẽ xe chạy sang phải.
