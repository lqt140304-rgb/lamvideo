# NAM-002: nhân vật nam trưởng thành

Đây là mô hình chủ repo gửi ngày 14/11/2026. Chủ repo dựng nó trưởng thành hơn bản gốc 001 để gần với nguyên mẫu Nam trong kịch bản. Mô hình đứng chữ T, cao 1,70 m, đầu trọc, mặt hướng −Y, bên trái nhân vật là +X. Trợ lý đã sửa màu và gắn rig thử. Bản này **chưa nghiệm thu diễn hoạt**.

![Bảng dáng thử](bang-dang-thu.webp)

## Tệp

| Tệp | Nội dung |
|---|---|
| `nguon/base_basic_pbr.glb` | File gốc chủ repo gửi, giữ nguyên byte. SHA-256 `ae880aaf…28f1`. |
| `nam-002.glb` | Bản đã sửa. Thân tô theo màu da đầu, mắt sửa lại (viền đều, mí, lòng trắng), lông mày tô đều, hốc miệng được làm phẳng và vẽ miệng chữ O. Cao đúng 1,70 m, normal map giảm còn 0,35. |
| `rig_nam002.py` | Script rig. Đọc `nam-002.glb` và không sửa file này. |

Giấy phép của mô hình chưa xác minh.

## Tạo file rig

Chạy trong thư mục này, mất khoảng 2 phút:

```powershell
D:/blender/blender.exe -b --factory-startup --python rig_nam002.py -- --out nam-002-rig.blend --glb nam-002-rig.glb --anh xem-rig
```

File `.blend` và `.glb` đã rig nặng khoảng 26 MB nên không đưa lên Git.

## Rig gồm

- **Tên xương theo Mixamo:** `Hips`, `Spine`, `Spine1`, `Spine2`, `Neck`, `Head`, `LeftShoulder`, `LeftArm`, `LeftForeArm`, `LeftHand`, `LeftHand{Thumb,Index,Middle,Ring,Pinky}1–3`, `LeftUpLeg`, `LeftLeg`, `LeftFoot`, `LeftToeBase`, cùng các xương `Right…` tương ứng.
- **Xương phụ vai** `LeftArmBlend` / `RightArmBlend`: tự xoay theo 50% góc của bắp tay, giúp đỉnh vai không gập nếp khi hạ tay.
- **IK chân:** điều khiển bằng `ik_foot.L/R`, hướng gối bằng `pole_knee.L/R`.
- **IK/FK tay:** đặt thuộc tính `ik` trên `ik_hand.L/R` (0 là FK, 1 là IK), hướng khuỷu bằng `pole_elbow.L/R`.
- **Nắm tay:** trên `LeftHand` / `RightHand` có `nam` để nắm cả bàn tay, và `nam_tro`, `nam_giua`, `nam_ap`, `nam_ut`, `nam_cai` cho từng ngón. Giá trị từ 0 đến 1.
- **Bone collections:** `Than`, `Tay_FK`, `Tay_IK`, `Ngon`, `Chan_IK`, `Chan_deform`.

## Cách gán trọng số và các lỗi đã gặp

- **Đỉnh trùng ở đường nối UV:** khi nhập GLB, đỉnh ở đường nối UV bị nhân đôi (lưới thành 1.176 mảnh). Mỗi bản sao nhận trọng số hơi khác nên đường nối hở thành khe tối khi tạo dáng. Script hàn các đỉnh trùng trước khi rig: số đỉnh giảm từ 139.506 xuống 128.506, còn 38 cạnh hở.
- **Bone heat trên lưới gốc thất bại**, toàn bộ đỉnh không có trọng số. Script chạy bone heat trên một lưới voxel kín (4 mm, giản lược 30%) rồi chép trọng số sang lưới gốc.
- **Luật vùng:** trái chỉ theo xương trái, phải chỉ theo xương phải. Chuyển tiếp mềm từ thân sang tay ở |x| 0,17–0,26 và từ thân sang chân ở z 0,88–1,00. Đầu đi cứng theo `Head` từ z = 1,40, cổ pha dần từ `Spine2` qua `Neck` sang `Head`. Ngón tay có trọng số tính theo hình học. Sau cùng làm mượt vai và háng, rồi thêm Corrective Smooth (30 vòng) cho hai vùng này.
- **Mốc khớp:** gối được đặt nhô trước 1,7 cm và khuỷu lùi sau 1 cm so với đường thẳng nối hai khớp hai đầu, để IK gập đúng chiều. Trước khi sửa, gối bị gập vào trong.

## Kết quả đo

Bảng dưới đếm số cạnh lưới bị kéo dài hơn 2 lần so với dáng chữ T.

| Dáng | Cạnh giãn > 2× | Tối đa |
|---|---:|---:|
| tay buông (hạ 80°) | 0 | 1,87× |
| giơ tay cao | 0 | 1,57× |
| gập khuỷu | 1 | 2,14× |
| nắm tay | 0 | 1,87× |
| quay đầu | 4 | 2,25× |
| xoay thân | 0 | 1,80× |
| bước chân (IK) | 379 | 5,70× |
| ngồi xổm (IK) | 741 | 3,63× |

Dáng nghỉ lệch tối đa 0,02 mm so với lưới gốc. Ảnh kiểm tra: [vai khi hạ tay](vai-ha-tay.webp) và [bàn tay](ban-tay.webp), từ trái sang là xòe, nắm, nửa nắm, chỉ tay.

## Chưa làm

- Chưa có rig mặt, shape key hay viseme.
- Ngón cái chỉ khép nhẹ khi nắm.
- Háng và đùi còn giãn khi bước dài hoặc ngồi xổm.
- Mặt sau vai còn vài nếp nhỏ khi hạ tay.
- Chưa chạy `walk.py` hay `chep_dong.py` cho rig này: hai script đó viết cho `Goc_Rig` ở dáng chữ A.
