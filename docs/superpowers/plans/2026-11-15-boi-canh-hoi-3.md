# Bối cảnh Hồi 3 + tối ưu quay: kế hoạch thực hiện

> **Cho agent thực hiện:** dùng superpowers:executing-plans (Native). Các bước đánh dấu `- [ ]`.

**Mục tiêu:** dựng giảng đường, sân trường và bờ kè sông Hồng bằng bpy; có module LOD/tối ưu dùng chung.
**Kiến trúc:** mỗi bối cảnh là một file độc lập, có hàm `build(mode, cam, muc) -> scene`. Mọi file gọi `toi_uu.apply(scene, cam_positions, muc)` ở cuối.
**Công nghệ:** Blender 5.x dạng module `bpy` (Python 3.11), Cycles/EEVEE.
**Thiết kế:** `docs/superpowers/specs/2026-11-15-boi-canh-hoi-3-design.md`
**Thư mục:** `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh-3d/` (gọi tắt `D/`)

## Ràng buộc chung
- 1 BU = 1 m. Vật liệu lấy từ `vat_lieu.py`. Tạo lưới bằng bmesh, không dùng `bpy.ops` theo vòng lặp.
- Khung 2.39:1. Tên đối tượng có tiền tố theo cảnh: `gd_`, `st_`, `bk_`.
- Mức render: `nhap` (xem nhanh), `duyet`, `cuoi`.

## Trọng tâm rà soát
- Camera đặt sát một vật xa (vòng LOD tính theo camera): vật đó phải giữ đủ chi tiết, không bị vỡ hình.
- Lưới dùng chung (instance) chỉ được giảm một lần, không giảm chồng lên nhau.
- Cảnh build hai lần liên tiếp vẫn chạy, không lỗi vật liệu trùng tên.
- Giảm chi tiết không được làm mất bóng của vật gần.

### Task 1: `D/toi_uu.py`
- Sản phẩm:
  - `vong_lod(dist: float) -> int`: trả 0/1/2/3 theo ngưỡng 15/40/120 m.
  - `apply(sc, cams: list[Vector], muc: str = 'duyet') -> dict` (thống kê). Khoảng cách tính từ camera **gần nhất** tới mặt hộp bao của vật. Vòng 1 thì Decimate 0,5, vòng 2 thì 0,2, vòng 3 thì 0,08. Từ vòng 2 tắt đổ bóng và tắt hiện trong phản chiếu, bỏ modifier bevel. Mỗi lưới dùng chung chỉ xử lý một lần, theo lần dùng gần nhất. Cycles: adaptive sampling, light tree, persistent data, camera cull và distance cull, mẫu nhap/duyet/cuoi = 16/64/256.
  - `eevee(sc)`: chế độ xem nhanh.
- Kiểm: chạy `D/kiem_toi_uu.py` (bằng `/tmp/bpyenv/bin/python`). Cảnh thử có hộp ở 5 m và 200 m, cùng 2 vật dùng chung một lưới, một ở 5 m và một ở 200 m. Kết quả phải là: hộp gần không có Decimate; hộp xa có Decimate và `visible_shadow == False`; lưới dùng chung không bị giảm vì có một lần dùng ở gần.

### Task 2: `D/giang_duong.py`
- Camera: `GD_TOAN` (từ cuối phòng), `GD_BUC` (tĩnh lên bục), `GD_CRANE` (từ trần), `GD_SV` (vai sinh viên), `GD_PHAN` (cận tay cầm phấn).
- Có hình nhân sinh viên dùng chung lưới (`--sv`).
- Kiểm: build không lỗi; số ghế ≥ 180; ảnh `xem-thu/hoi-3/giang-duong-*.png`.

### Task 3: `D/san_truong.py`
- Camera: `ST_HANH_LANG`, `ST_TOAN`, `ST_STEADICAM` (đường đi có keyframe, máy chạy lùi). Ánh sáng nắng trưa.
- Kiểm: như Task 2.

### Task 4: `D/bo_ke.py`
- Camera: `BK_EWS` (toàn cảnh cực rộng tĩnh), `BK_TRUNG`, `BK_SAU_LUNG`.
- Mode: `chieu` / `hoang_hon` / `do`. Có tham số `--chuyen` để keyframe màu trời liên tục trong 480 khung (20 s).
- Kiểm: như Task 2.

### Task 5: Tài liệu và push
Cập nhật `README.md` và `BOI-CANH-CAN-CHUAN-BI.md` trong `D/`, ghi số thời gian render đo được. Commit lên nhánh `claude/boi-canh-hoi-3` rồi push.
