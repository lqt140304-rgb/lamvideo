# Tài nguyên cất sẵn, CHƯA dùng trong video nào

Bạn gửi ngày 05/11/2026, dặn "lưu vào, chưa triển khai cho tới khi có lệnh". Các file này nằm ngoài `public/` nên không vào video và không ảnh hưởng gì khi render.

| File | Nội dung | Ghi chú |
|---|---|---|
| `do-vat-noi-that-may-moc.png` | 12 món: bàn, ghế nhựa, sofa, TV, tủ lạnh, máy tính CRT, máy tính để bàn, laptop, bàn làm việc, giường, quạt, ghế đẩu | Nền trong suốt (sheet, chưa cắt riêng từng món) |
| `do-vat-doi-thuong.png` | 12 món: điện thoại, cốc, nồi cơm, ấm đun, tô mì, đĩa muỗng nĩa, ba lô, xe đạp, ô, tai nghe, vợt + cầu lông, đồng hồ | Nền trong suốt (sheet) |
| `ban-nam-ao-cam.png` | Nhân vật nam, áo cam có tia sét, 12 tư thế (đứng, vẫy, chỉ, nghĩ, ngạc nhiên, cười, buồn, khoanh tay, đi, chạy, ngồi, cầm điện thoại) | **Có nền tối + quầng sáng, chưa tách nền**; cần cắt nền trước khi dùng |
| `ban-be-kinh-ao-xanh-la.png` | Bạn nam đeo kính, áo polo xanh lá, cùng 12 tư thế | Nền trong suốt (sheet) |
| `ban-nu-ao-tim.png` | Bạn nữ tóc ngắn kẹp tím, áo tím, váy kem, cùng 12 tư thế | Nền trong suốt (sheet) |

Trước khi dùng cần làm: cắt từng món/tư thế ra file riêng (có `tools/mascot_cutout.py` làm việc tương tự cho mascot), tách nền ảnh áo cam, và thống nhất với mascot hoodie hiện tại (tránh hai phong cách vẽ lẫn nhau trong một video).
