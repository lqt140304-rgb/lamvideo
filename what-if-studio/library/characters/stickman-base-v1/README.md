# Stickman Base V1 — Phôi Chuẩn Nhân Vật Series

> **Quy chuẩn sản xuất hiện hành — 17/11/2026:** Áp dụng phôi **Stickman Base V1 (Kiểu B: Đầu tròn + Thân viên nang + Tay chân ống)** cho toàn bộ nhân vật người trong series *The Crack in Reality*.
> Quyết định này thay thế phôi người chi tiết cũ ([HUMAN-MALE-BASE-01](../human-male/base-v1/README.md)) và các bản mesh chibi cũ.

## 1. Thông số kỹ thuật

- **Mã định danh:** `STICKMAN-BASE-V1` (Version 1).
- **Chiều cao chuẩn:** **1,60 m** ($Z \in [0.0, 1.60]$). Đảm bảo nhân vật đứng vững trên mặt sàn $Z = 0.0\text{ m}$.
- **Cấu trúc Modular:**
  1. `Stickman_Body`: Khối đầu tròn trơn ($R = 0.14\text{ m}$), thân capsule bo tròn hai đầu, chi con nhộng mảnh.
  2. `Module_Hair`: Gắn theo xương `Head`, sinh khối tóc đặc trưng từng vai (rối, vuốt dựng, rẽ ngôi, mũ trùm).
  3. `Module_Outfits`: Dựng bọc ngoài thân viên nang (khoảng hở $\ge 10\text{ mm}$ chống va chạm), skinning mềm theo Armature.
  4. `Module_Rig`: Khung xương Armature IK/FK (Spine, Chest, Neck, Head, Limbs, Hands, Feet).

## 2. Dàn nhân vật hỗ trợ

| Mã nhân vật | Tên vai | Module Tóc | Module Trang phục |
|---|---|---|---|
| `nam` | Nam (Bản thể thật) | `Hair_Messy_Anime` (Đen) | `Outfit_Oversized_Green` (Áo rêu, quần xám, dép) |
| `nguoikia` | Người Kia (Bản sao) | `Hair_Messy_Anime` (Đen) | `Outfit_Oversized_Green` (Giống Nam, thuận tay trái) |
| `tung` | Tùng | `Hair_Spiky_Sport` (Đen) | `Outfit_Sport_Orange` (Áo cam viền trắng, quần đùi) |
| `giangvien` | Giảng viên Lab 402 | `Hair_Parted_Neat` (Đen + Kính) | `Outfit_Formal_Cream` (Sơ mi kem, quần âu xanh than) |
| `truyvet` | Người Truy Vết | `Hair_Hoodie_Dark` (Mũ trùm) | `Outfit_Tracker_Charcoal` (Áo than viền đỏ, quần túi hộp) |

## 3. Cách sinh và sử dụng

Chạy script tạo mô hình Blender:
```bash
blender --background --python episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/dung_stickman_cast.py
```
Hoặc import module toán học để lấy thông số bounding boxes:
```python
from assets.nhan_vat_3d.stickman_math import get_base_dimensions
```
