"""Cổng gương (Mirror Portal) trong Blender — bản dùng được.

Mặt gương là gương thật của Cycles (phản xạ glossy), nên phản chiếu căn phòng đúng quang học từ MỌI góc camera
(parallax, DoF, chữ đảo đúng như gương) mà không cần render hai lượt hay lật cả khung hình.

Muốn Người Kia diễn riêng, độc lập với Nam, dùng cờ hiển thị theo loại tia (Object › Visibility › Ray Visibility):
  - NGƯỜI KIA: camera=ẨN, glossy=HIỆN, shadow/diffuse=ẨN → chỉ xuất hiện trong gương, không đổ bóng ra phòng thật.
    Đặt anh ta ở điểm đối xứng (qua mặt gương) của chỗ muốn hiện trong kính: `reflect_point`.
  - NAM: glossy=ẨN khi cần gương KHÔNG phản chiếu Nam (Người Kia chiếm kính); glossy=HIỆN ở các cảnh gương bình thường.
    Có thể keyframe cờ này (ví dụ lúc đổi từ phản chiếu thường sang diễn riêng).
  - Cùng một mesh Nam/Người Kia: phản xạ tự đảo trái–phải nên nốt ruồi trái của Nam hiện bên phải trong gương (đúng luật truyện);
    nếu Người Kia là mesh riêng (nốt ruồi phải sẵn) thì khi đứng trong gương cần mesh đảo (scale −1 quanh trục gương) để thấy đúng bên.
POV TRONG GƯƠNG (camera sau kính nhìn ra): ẩn khỏi camera các vật che sau gương (tường cửa + hành lang) bằng `pov_trong_guong`.
"""
import bpy
from mathutils import Vector

MIRROR_X_DESIGN = 0.12  # mặt kính trung bình (toạ độ thiết kế; gương nghiêng 6°, chân x≈0,19 → đỉnh x≈0,07)


def only_in_mirror(objs):
    """Hiện trong gương, ẩn khỏi camera/bóng/ánh sáng gián tiếp."""
    for o in objs:
        o.visible_camera = False; o.visible_shadow = False; o.visible_diffuse = False; o.visible_transmission = False
        o.visible_glossy = True


def hide_from_mirror(objs, hidden=True):
    """Ẩn khỏi tia phản xạ gương (vật vẫn thấy bình thường bằng camera)."""
    for o in objs:
        o.visible_glossy = not hidden


def reflect_point(x, y, z, plane_x=MIRROR_X_DESIGN):
    """Điểm đối xứng qua mặt gương (gương coi như thẳng đứng, bỏ độ nghiêng 6°; đủ cho đặt vị trí thô)."""
    return (2 * plane_x - x, y, z)


def pov_trong_guong(coll, world_x_min=2.7):
    """Camera sau kính: ẩn khỏi camera mọi vật nằm hoàn toàn phía sau mặt gương (tường cửa, hành lang, ngoại cảnh phía đó);
    giữ nguyên sàn, trần, tường đối diện để vẫn thấy cả phòng thật. world_x_min: x thế giới của mép sau gương (W − 0,3)."""
    n = 0
    for o in coll.objects:
        if o.type != 'MESH' or o.name in ('mat_guong', 'khung_guong') or not o.data.vertices:
            continue
        if min((o.matrix_world @ v.co).x for v in o.data.vertices) > world_x_min:
            o.visible_camera = False; n += 1
    return n
