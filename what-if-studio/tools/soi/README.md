# Bộ soi hình nhanh

Ba script nhỏ để kiểm tra hình bằng ảnh tĩnh trước khi render video. Mục đích là tiết kiệm thời gian và hạn mức: xem ảnh nhỏ, ghép nhiều frame vào một bảng, chỉ cắt cận chỗ cần soi. Quy tắc dùng nằm ở [KINH-NGHIEM](../../../docs/KINH-NGHIEM.md#hạn-mức-của-trợ-lý-token).

Chạy trong `what-if-studio/`. Ảnh ra để ở thư mục tạm (scratchpad), không lưu vào repo trừ bảng đã chốt cho hồ sơ tập.

| Script | Việc | Ví dụ |
|---|---|---|
| `khung.cjs` | Chụp các frame của một composition, mặc định 1/2 cỡ (`SCALE=1` khi cần cận nét) | `node tools/soi/khung.cjs "$PWD" <thư-mục-ra> 100,450,900 HoSo02Canh01Demo a` |
| `bang.cjs` | Ghép ảnh thành một bảng có tiêu đề để xem một lần | `node tools/soi/bang.cjs "$PWD" <ra>.png 2 "A03 sửa tay" a100.png a450.png` |
| `cat.cjs` | Cắt và phóng một vùng | `node tools/soi/cat.cjs "$PWD" a450.png zoom.png 560 420 340 520 1` |

Lưu ý:
- `khung.cjs` dựng lại bundle mỗi lần chạy (khoảng 20–40 giây). Hãy gom mọi frame cần soi vào một lần chạy.
- `cat.cjs`: rộng × hệ số và cao × hệ số phải ra số nguyên, nếu không Chrome báo lỗi kích thước.
- Hai script ghép và cắt có ghi một file `.html` tạm cạnh ảnh ra. Đừng commit file này, vì nó chứa đường dẫn trên máy.
