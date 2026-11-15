# Khuôn mẫu nhân vật nam 18–20 tuổi

Chủ repo chọn bản này (15/11/2026) làm **khuôn mẫu gốc cho các nhân vật nam 18–20 tuổi**, chẳng hạn Nam. Đây là bản **trước khi chỉnh mắt, lông mày, miệng**: dùng để tạo nhân vật mới, không phải bản diễn hoạt cuối của một nhân vật cụ thể.

## Có gì
- `nam-002.glb`: mô hình đầu trọc, dáng chữ T, cao đúng 1,70 m, mặt hướng −Y. Màu da, mắt, lông mày, miệng chữ O vẽ trên texture; thân đã tô theo màu da đầu.
- `nguon/base_basic_pbr.glb`: file gốc từ Hyper3D (Rodin) chủ repo gửi, giữ nguyên byte. Giấy phép chưa xác minh.
- `rig_nam002.py`: script rig, tên xương Mixamo, IK chân, IK/FK tay, ngón 3 đốt và nút nắm tay.
- `di_bo_nam002.py`: chu kỳ đi bộ 32 khung.
- Ảnh kiểm tra: `bang-dang-thu.webp`, `ban-tay.webp`, `vai-ha-tay.webp`, `di-bo.webp`.

## Tạo file rig
Chạy trong thư mục này (cần Blender 5.2 hoặc gói `bpy`):

```powershell
D:/blender/blender.exe -b --factory-startup --python rig_nam002.py -- --out nam-rig.blend --glb nam-rig.glb --anh xem-rig
D:/blender/blender.exe -b --factory-startup --python di_bo_nam002.py -- --rig nam-rig.blend --out nam-di-bo.blend
```

## Chưa có
Mắt 3D, lông mày 3D, biểu cảm và khẩu hình. Phần đó được làm riêng trên nhánh phát triển và chưa lên `main`. Chưa nghiệm thu diễn hoạt. Mô hình nhân vật này không thay asset của tập nào.
