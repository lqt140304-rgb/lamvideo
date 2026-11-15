# Hướng dẫn thử mặc quần áo, tóc, phụ kiện cho NAM-002

Dành cho người test không tham gia dựng rig. Mục tiêu: biết áo quần/tóc có ổn khi nhân vật cử động không, và báo lỗi đủ để sửa đúng chỗ.

## 1. File dùng

| File | Dùng làm gì |
|---|---|
| `nam-002-rig.blend` | **Bản làm việc.** Mở file này, mặc đồ lên đây. Đã có rig, IK, ngón tay, mắt, mày, biểu cảm, khẩu hình; tối đa 4 xương/đỉnh; texture nhúng sẵn. |
| `nam-002-rig.glb` | Bản xuất để dùng ở nơi khác. **Không có driver** nên biểu cảm không chạy bằng thuộc tính xương `Head`; chỉ để xem/xuất, đừng làm việc trên file này. |
| `di_bo_nam002.py` | Chu kỳ đi bộ để test chuyển động: `blender -b --factory-startup --python di_bo_nam002.py -- --rig nam-002-rig.blend --out di-bo.blend --tien --chu-ky 3` |
| `bien_the_nam002.py` | Dựng biến thể (chiều cao, màu da, dáng người, tóc). Chỉ cần khi test trên nhân vật khác chiều cao/dáng. |
| `rig_nam002.py` | Dựng lại rig từ `nam-002.glb` (mất khoảng 6 phút). Không cần nếu đã có `nam-002-rig.blend`. |

Blender 5.2.x. Đơn vị mét. Nhân vật cao 1,70 m, đứng thẳng, **mặt hướng −Y**, bên trái nhân vật là **+X**, dáng nghỉ là chữ T.

## 2. Quy tắc quan trọng (đừng phá)

1. **Không sửa lưới `Nam_Body`** (không thêm/xóa/sắp xếp lại đỉnh, không remesh, không xóa mảnh vụn). Trọng số, shape key miệng và hốc mắt gắn theo chỉ số đỉnh; sửa lưới là mất.
2. **Không đổi tên xương** (tên theo Mixamo: `Hips`, `Spine`…, `LeftArm`, `LeftHandIndex1`…). Không xóa xương `pole_*`, `ik_foot.*`, `nhin`.
3. Quần áo là **object riêng**, parent vào `Nam_Rig`, có modifier **Armature** trỏ vào `Nam_Rig`.
4. Mỗi đỉnh áo quần có **tối đa 4 xương**, trọng số tổng bằng 1.
5. Làm việc trên bản sao `.blend`; đừng lưu đè `nam-002-rig.blend` trên repo khi chưa báo.

## 3. Cách mặc đồ (đã chạy thử với áo phông)

1. Dựng áo/quần là mesh riêng, **phồng hơn thân khoảng 1 cm** (áo phông 12 mm là ổn; đồ ôm sát thì ≥ 5 mm). Tránh để mặt áo nằm đúng trên mặt da.
2. Tạo sẵn trên áo các nhóm đỉnh **trùng tên** với nhóm của `Nam_Body`, rồi chuyển trọng số từ thân sang áo:

```python
import bpy
body = bpy.data.objects['Nam_Body']; ao = bpy.data.objects['Ao']; arm = bpy.data.objects['Nam_Rig']
for g in body.vertex_groups: ao.vertex_groups.new(name=g.name)
dt = ao.modifiers.new('dt', 'DATA_TRANSFER'); dt.object = body; dt.use_vert_data = True
dt.data_types_verts = {'VGROUP_WEIGHTS'}; dt.vert_mapping = 'POLYINTERP_NEAREST'
dt.layers_vgroup_select_src = 'ALL'; dt.layers_vgroup_select_dst = 'NAME'
bpy.context.view_layer.objects.active = ao; bpy.ops.object.modifier_apply(modifier='dt')
bpy.ops.object.vertex_group_limit_total(group_select_mode='ALL', limit=4)
bpy.ops.object.vertex_group_normalize_all(group_select_mode='ALL', lock_active=False)
m = ao.modifiers.new('arm', 'ARMATURE'); m.object = arm; ao.parent = arm
```

3. Nhóm `cs_vai_hang` chỉ là nhóm phụ của Corrective Smooth trên thân; xóa nó khỏi áo nếu thấy bị chuyển sang.
4. Sau khi chuyển, **tô lại trọng số bằng tay** ở những chỗ lỗi (xem mục 5); không nên coi Data Transfer là xong.
5. Che thân bên dưới nếu cần: modifier Mask hoặc ẩn render phần da được áo phủ (vẫn giữ trong file).

**Tóc, mũ, kính:** gán 100 % vào xương `Head` (nhóm `Head` = 1, modifier Armature). **Đồng hồ, găng, vòng tay:** gán 100 % vào xương tương ứng (`LeftHand`, `LeftForeArm`…). Không cần Data Transfer.

## 4. Các tư thế phải thử

Đặt bằng Pose Mode hoặc script; quay quanh đầu xương, góc so với dáng chữ T:

| Tư thế | Cách đặt |
|---|---|
| Tay buông | `LeftArm` quay +78° và `RightArm` −78° quanh trục Y |
| Giơ tay cao | `LeftArm` −85°, `RightArm` +85° quanh Y |
| Tay ra trước | như tay buông, rồi cả hai tay quay −85° quanh X |
| Gập khuỷu | như tay ra trước, `ForeArm` gập ~110° |
| Cúi về trước | `Spine` **+30°**, `Spine1` **+25°** quanh X (mặt hướng −Y nên quay +X là cúi; −X là ngửa) |
| Ngửa ra sau | `Spine` −15°, `Spine1` −15° quanh X |
| Xoay thân | `Spine` +30°, `Spine1` +25° quanh Z |
| Nghiêng người | `Spine` −20°, `Spine1` −15° quanh Y |
| Nhấc chân | **IK đang bật nên quay `UpLeg` không làm chân dịch (đã đo: mắt cá dịch 0 m).** Dùng một trong hai: (a) dịch `ik_foot.L` theo trục thế giới (0, −0,30, +0,35) m; (b) đặt influence = 0 cho IK trên `LeftLeg`/`RightLeg` rồi quay `LeftUpLeg` −70° (khi đó mắt cá dịch ~0,88 m) |
| Đi bộ | chạy `di_bo_nam002.py` (có ảnh 8 khung bên và trước) |
| Ngồi xổm | `Hips` hạ 0,35 m và dịch +0,10 m về sau, `Spine` quay 20° — xem mục 5 |

Với quần: tập trung nhấc chân, đi bộ, ngồi xổm. Với áo: giơ tay cao, gập khuỷu, cúi người, xoay thân.

## 5. Chỗ đã biết là yếu — nhìn kỹ ở đây

- **Ngồi xổm, đáy háng, khoeo chân:** lưới thân giãn mạnh nhất ở đây (đã đo 675 cạnh giãn quá 2× khi ngồi xổm, phần lớn là cạnh rất ngắn ở đáy háng nên chưa chắc thấy bằng mắt). Quần ôm sát dễ nhăn hoặc xuyên da.
- **Vai và nách:** thân có Corrective Smooth ở vai và hàng (nhóm `cs_vai_hang`); áo không có nên có thể nếp xấu khi giơ tay cao.
- **Cổ áo:** đừng để trọng số xương `Head` lan xuống cổ áo, nếu không cổ áo bị kéo theo khi quay đầu hoặc cúi.
- **Miệng chưa có răng/lưỡi**, nên đừng cho khẩu trang/khăn áp sát miệng khi test há miệng to.
- Các tư thế trong mục 4 chưa có số liệu đo cho quần, chỉ áo phông thử cho kết quả nhìn ổn (xem `thu-ao-phong.webp`).

## 6. Tiêu chí đạt

- Không thấy da lòi ra ngoài áo/quần ở các tư thế mục 4 (nhìn từ trước, sau, hai bên).
- Áo quần không xuyên vào thân, không xé hay kéo dài thành gai.
- Khi đi bộ, mép áo/ống quần không nhảy giật giữa các khung.
- Vẫn bật được biểu cảm (`Head` thuộc tính `cuoi`, `mieng_ha`…) mà áo cổ cao không bị ảnh hưởng.

## 7. Báo lại những gì

Gửi lại để sửa đúng chỗ, không đoán:
1. Tên file áo/quần, kích thước phồng, đã chỉnh trọng số bằng tay chỗ nào.
2. **Ảnh các tư thế bị lỗi** (kèm tên tư thế và hướng nhìn).
3. Chỗ nào xuyên/giãn/nhăn, và có chỉnh được bằng trọng số không hay phải sửa thân.
4. Nếu phải sửa thân: nêu chính xác vùng nào cần đổi để Opus/Sonnet sửa trong `rig_nam002.py` (không tự sửa lưới).

Lưu kết quả trong thư mục riêng của tập hoặc của nhân vật mặc đồ, không để lẫn vào `nam-002`.

## 8. Đính chính và số đo tham chiếu (15/11/2026)

- Bản đầu của hướng dẫn này ghi ngược chiều cúi/ngửa và dùng `UpLeg` khi IK bật cho tư thế nhấc chân; đã sửa ở mục 4. Phiên thử quần áo độc lập phát hiện cả hai; mình đã kiểm lại bằng Blender (Head dịch −Y khi Spine quay +X 30°; mắt cá không dịch khi quay `UpLeg` với IK bật).
- Khi đo "xuyên da", trừ nền dáng nghỉ cho từng đỉnh: ở các chỗ lõm (nách, khe đùi) khoảng cách có dấu đã âm sẵn khi chưa cử động (áo ~460, quần ~700 đỉnh).
- Số đo trên `nam-002-rig.blend` hiện có (áo phồng 12 mm, quần 10 mm, Data Transfer + giới hạn 4 xương, không sửa tay; đỉnh áo quần nằm trong thân so với dáng nghỉ): tay buông 2–3 đỉnh; giơ tay cao 91 (áo); gập khuỷu ~560 (áo); xoay thân 5; cúi và ngửa 0; nhấc chân qua IK áo ~280–350, quần ~856; ngồi xổm áo ~460, quần ~1670; quay đầu 0. Đa số lỗi nằm ở đáy háng (z ≈ 0,77) và đùi/gối (z ≈ 0,52), là lỗi lấy trọng số cục bộ chứ không phải thân tự chạm; Corrective Smooth trên áo quần gần như không đổi gì. Sửa trọng số áo quần (tách trái/phải, làm mượt háng và nách) là hướng nên làm.
- `rig_nam002.py` đã thêm làm mượt trọng số ở nếp bẹn trước và gối/khoeo (ngồi xổm: áo 458→152, quần 1669→1371 đỉnh; nhấc chân không cải thiện). File `nam-002-rig.blend` trong repo vẫn là bản trọng số cũ; chưa thay bằng bản dựng lại.
