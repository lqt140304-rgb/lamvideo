"""DỰNG CẢNH VÀ DIỄN HOẠT OPENING 30S (THE CRACK IN REALITY - HỒ SƠ 02).

Quy chuẩn:
- Stickman Kiểu B chuẩn 1,60 m (Nam ngoài đời và Người Kia trong gương).
- Không gian phòng trọ 3D 12m2 (xay_phong_tro.py) với ánh sáng Chiaroscuro 5h30 sáng.
- Kỹ xảo độ trễ gương 5 frames (cong_guong.py) sử dụng cờ Ray Visibility.
- Timeline: 720 frames @ 24fps (30 giây) qua 3 góc máy điện ảnh Anamorphic 2.39:1.
"""

import os
import sys
import math
from typing import Dict, Any, List, Tuple, Optional

# Kiểm tra môi trường bpy (Blender Python API)
try:
    import bpy
    import bmesh
    from mathutils import Vector, Euler
    HAS_BLENDER = True
except ImportError:
    HAS_BLENDER = False

# Thêm đường dẫn tới các module liên quan
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BOI_CANH_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "..", "boi-canh-3d"))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)
if BOI_CANH_DIR not in sys.path:
    sys.path.insert(0, BOI_CANH_DIR)

import dung_stickman_cast as dsc

# Manifest thông số kỹ thuật toàn cảnh
def get_scene_manifest() -> Dict[str, Any]:
    """Trả về từ điển định nghĩa toàn bộ tọa độ và tham số camera của cảnh 30s."""
    return {
        "duration_sec": 30.0,
        "fps": 24,
        "total_frames": 720,
        "resolution": (1920, 803), # 2.39:1 Cinemascope
        "nam_pos": (2.05, 3.20, 0.25),
        "nguoikia_pos": (0.08, 3.20, 0.25), # Đối xứng qua mặt phẳng gương x ≈ 0.16
        "phone_pos": (1.45, 3.10, 0.02),
        "mirror_pos": (0.16, 3.26, 0.0),
        "bed_bounds": {"x_min": 1.58, "x_max": 2.98, "y_min": 2.05, "y_max": 3.95, "z_surface": 0.24},
        "cameras": [
            {
                "id": "Cam_Shot0",
                "name": "Cận cảnh khung gương",
                "focal_length": 85.0,
                "frame_start": 0,
                "frame_end": 120,
                "loc_start": (0.85, 2.70, 0.70),
                "loc_end": (0.80, 2.85, 0.72),
                "rot": (math.radians(83.5), 0.0, math.radians(50.1))
            },
            {
                "id": "Cam_Shot1",
                "name": "Bao quát nệm và gương soi",
                "focal_length": 28.0,
                "frame_start": 120,
                "frame_end": 360,
                "loc_start": (1.10, 1.60, 1.05),
                "loc_end": (1.12, 1.65, 1.05),
                "rot": (math.radians(65.0), 0.0, math.radians(-3.8))
            },
            {
                "id": "Cam_Shot2",
                "name": "Theo dõi Nam ngồi dậy và bước đi",
                "focal_length": 32.0,
                "frame_start": 360,
                "frame_end": 720,
                "loc_start": (1.10, 0.40, 1.25),
                "loc_end": (1.15, 0.60, 1.28),
                "rot": (math.radians(92.0), 0.0, math.radians(-19.8))
            }
        ]
    }

def get_animation_timing_manifest() -> Dict[str, int]:
    """Trả về các mốc keyframe then chốt của diễn hoạt."""
    return {
        "shot0_start": 0,
        "shot0_end": 120,
        "shot1_start": 120,
        "alarm_ring_frame": 140,
        "nam_reach_start": 160,
        "nguoikia_reach_start": 165, # Trễ 5 frames chuẩn kịch bản
        "alarm_hit_frame": 210,
        "nam_reach_return": 225,
        "nguoikia_hover_end": 240,
        "shot1_end": 360,
        "shot2_start": 360,
        "shot2_situp_frame": 360,
        "shot2_stand_frame": 460,
        "shot2_walk_frame": 560,
        "mirror_pause_look_frame": 640,
        "shot2_end": 720
    }

def create_smartphone_prop(location: Tuple[float, float, float] = (1.45, 3.10, 0.015), screen_glow: bool = True, coll: Any = None) -> Any:
    """Tạo smartphone 3D trên sàn với màn hình báo thức phát sáng."""
    if not HAS_BLENDER:
        return None

    # Thân điện thoại
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
    phone = bpy.context.active_object
    phone.name = "Prop_Phone"
    phone.scale = (0.075, 0.150, 0.008)
    bpy.ops.object.transform_apply(scale=True)
    mat_body = dsc.create_material("Mat_Phone_Body", "#181a1d", roughness=0.2, metallic=0.8)
    phone.data.materials.append(mat_body)
    dsc.smooth_object(phone, bevel_width=0.003)

    # Màn hình phát sáng 07:00 Báo Thức
    bpy.ops.mesh.primitive_plane_add(size=1.0, location=(location[0], location[1], location[2] + 0.005))
    screen = bpy.context.active_object
    screen.name = "Prop_Phone_Screen"
    screen.scale = (0.068, 0.140, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    mat_screen = bpy.data.materials.new("Mat_Phone_Screen_Glow")
    mat_screen.use_nodes = True
    bsdf = mat_screen.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.2, 0.6, 1.0, 1.0) # Sáng xanh màn hình
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = (0.3, 0.7, 1.0, 1.0)
            bsdf.inputs["Emission Strength"].default_value = 8.0 if screen_glow else 0.5
    screen.data.materials.append(mat_screen)

    # Liên kết cha con
    screen.parent = phone

    if coll:
        if phone.name not in coll.objects:
            coll.objects.link(phone)
        if screen.name not in coll.objects:
            coll.objects.link(screen)

    return phone

def create_stylized_bed_and_blanket(coll: Any = None) -> Dict[str, Any]:
    """Dựng nệm và khối chăn stylized kèm xương điều khiển."""
    if not HAS_BLENDER:
        return {}

    manifest = get_scene_manifest()
    bb = manifest["bed_bounds"]
    bx = (bb["x_min"] + bb["x_max"]) / 2.0
    by = (bb["y_min"] + bb["y_max"]) / 2.0
    bw = bb["x_max"] - bb["x_min"]
    bl = bb["y_max"] - bb["y_min"]

    # Nệm
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(bx, by, bb["z_surface"] / 2.0))
    nem = bpy.context.active_object
    nem.name = "Scene_Bed_Nem"
    nem.scale = (bw, bl, bb["z_surface"])
    bpy.ops.object.transform_apply(scale=True)
    mat_nem = dsc.create_material("Mat_Bed_Nem", "#d2cdc2", roughness=0.9, sheen_weight=0.3)
    nem.data.materials.append(mat_nem)
    dsc.smooth_object(nem, bevel_width=0.03)

    # Gối
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(bx, bb["y_max"] - 0.25, bb["z_surface"] + 0.05))
    goi = bpy.context.active_object
    goi.name = "Scene_Bed_Goi"
    goi.scale = (0.50, 0.35, 0.10)
    bpy.ops.object.transform_apply(scale=True)
    mat_goi = dsc.create_material("Mat_Bed_Goi", "#4a6875", roughness=0.8, sheen_weight=0.4)
    goi.data.materials.append(mat_goi)
    dsc.smooth_object(goi, bevel_width=0.04)

    # Chăn đắp ngang ngực
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(bx, by - 0.15, bb["z_surface"] + 0.12))
    chan = bpy.context.active_object
    chan.name = "Scene_Bed_Chan"
    chan.scale = (bw * 0.96, bl * 0.65, 0.08)
    bpy.ops.object.transform_apply(scale=True)
    mat_chan = dsc.create_material("Mat_Bed_Chan", "#334540", roughness=0.85, sheen_weight=0.55)
    chan.data.materials.append(mat_chan)
    dsc.smooth_object(chan, bevel_width=0.04)

    if coll:
        for ob in [nem, goi, chan]:
            if ob.name not in coll.objects:
                coll.objects.link(ob)

    return {"nem": nem, "goi": goi, "chan": chan}

def create_studio_mirror(coll: Any = None) -> Dict[str, Any]:
    """Tạo gương soi dựa tường khung gỗ và mặt gương phản chiếu thật."""
    if not HAS_BLENDER:
        return {}

    # Khung gương đứng x ≈ 0.16m, nghiêng 6 độ
    loc_frame = (0.16, 3.26, 0.60)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc_frame)
    khung = bpy.context.active_object
    khung.name = "Scene_Khung_Guong"
    khung.scale = (0.04, 0.52, 1.22)
    khung.rotation_euler = (0, math.radians(-6), 0)
    bpy.ops.object.transform_apply(scale=True, rotation=False)
    mat_khung = dsc.create_material("Mat_Khung_Guong", "#2b201a", roughness=0.7)
    khung.data.materials.append(mat_khung)
    dsc.smooth_object(khung, bevel_width=0.008)

    # Mặt gương Cycles phản chiếu hoàn hảo (Roughness=0.01, Metallic=1.0)
    loc_mirror = (0.185, 3.26, 0.60)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc_mirror)
    mat_guong = bpy.context.active_object
    mat_guong.name = "Scene_Mat_Guong"
    mat_guong.scale = (0.01, 0.48, 1.18)
    mat_guong.rotation_euler = (0, math.radians(-6), 0)
    bpy.ops.object.transform_apply(scale=True, rotation=False)
    
    mat_mirror_pbr = bpy.data.materials.new("Mat_Mirror_Glass")
    mat_mirror_pbr.use_nodes = True
    bsdf = mat_mirror_pbr.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.95, 0.98, 1.0, 1.0)
        bsdf.inputs["Metallic"].default_value = 1.0
        bsdf.inputs["Roughness"].default_value = 0.01
    mat_guong.data.materials.append(mat_mirror_pbr)

    if coll:
        for ob in [khung, mat_guong]:
            if ob.name not in coll.objects:
                coll.objects.link(ob)

    return {"khung": khung, "mat_guong": mat_guong}

def setup_cameras_and_markers(scene: Any) -> List[Any]:
    """Thiết lập 3 camera tương ứng 3 shots và gán Markers chuyển góc nhìn tự động."""
    if not HAS_BLENDER or scene is None:
        return []

    manifest = get_scene_manifest()
    cams = []

    for c_info in manifest["cameras"]:
        cid = c_info["id"]
        cd = bpy.data.cameras.new(f"Data_{cid}")
        cd.lens = c_info["focal_length"]
        co = bpy.data.objects.new(cid, cd)
        co.location = c_info["loc_start"]
        co.rotation_euler = c_info["rot"]
        scene.collection.objects.link(co)
        cams.append(co)

        # Tạo timeline marker để tự động chuyển camera chính
        m_frame = c_info["frame_start"]
        marker = scene.timeline_markers.new(f"Marker_{cid}", frame=m_frame)
        marker.camera = co

    # Đặt camera mặc định ban đầu là Shot 0
    if cams:
        scene.camera = cams[0]

    return cams

def setup_chiaroscuro_lighting(scene: Any):
    """Thiết lập ánh sáng Chiaroscuro 5h30 sáng cho căn phòng."""
    if not HAS_BLENDER or scene is None:
        return

    # Ánh sáng môi trường âm u buổi sớm (World Dawn)
    if not scene.world:
        scene.world = bpy.data.worlds.new("World_Dawn")
    scene.world.use_nodes = True
    if scene.world.node_tree:
        bg = scene.world.node_tree.nodes.get("Background")
        if bg:
            bg.inputs["Color"].default_value = (0.15, 0.18, 0.25, 1.0)
            bg.inputs["Strength"].default_value = 0.85

    # 1. Ánh sáng bình minh hắt qua cửa sổ (Window Dawn Light)
    ld = bpy.data.lights.new('Light_Dawn_Window', 'AREA')
    ld.energy = 180.0
    ld.size = 1.5
    ld.color = (0.85, 0.90, 1.0) # Sắc lam lạnh sáng sớm
    lo = bpy.data.objects.new('Light_Dawn_Window', ld)
    lo.location = (2.95, 1.40, 1.60)
    lo.rotation_euler = (math.radians(35), math.radians(-15), math.radians(-85))
    scene.collection.objects.link(lo)

    # 2. Ánh sáng nhẹ chiếu phòng và gương (Room Fill)
    lf = bpy.data.lights.new('Light_Room_Fill', 'POINT')
    lf.energy = 60.0
    lf.color = (0.90, 0.95, 1.0)
    lof = bpy.data.objects.new('Light_Room_Fill', lf)
    lof.location = (1.50, 2.50, 2.00)
    scene.collection.objects.link(lof)

def setup_opening_30s_scene(create_blender_scene: bool = True) -> Dict[str, Any]:
    """Dựng hoàn chỉnh scene 30s mở đầu gồm phòng trọ, gương, nệm, Nam và Người Kia."""
    manifest = get_scene_manifest()

    if not HAS_BLENDER or not create_blender_scene:
        return {
            "manifest": manifest,
            "nam": {"id": "nam", "pos": manifest["nam_pos"]},
            "nguoikia": {"id": "nguoikia", "pos": manifest["nguoikia_pos"]},
            "phone": {"pos": manifest["phone_pos"]},
            "mirror": {"pos": manifest["mirror_pos"]},
            "bed": {"pos": (2.28, 3.0, 0.24)},
            "cameras": manifest["cameras"]
        }

    # Xóa cảnh cũ
    if "Cube" in bpy.data.objects:
        bpy.data.objects.remove(bpy.data.objects["Cube"], do_unlink=True)

    sc = bpy.context.scene
    sc.render.resolution_x, sc.render.resolution_y = manifest["resolution"]
    sc.render.fps = manifest["fps"]
    sc.frame_start = 0
    sc.frame_end = manifest["total_frames"]

    col_scene = bpy.data.collections.get("Scene_Opening_30s")
    if not col_scene:
        col_scene = bpy.data.collections.new("Scene_Opening_30s")
        sc.collection.children.link(col_scene)

    # 1. Sàn phòng và tường cơ bản
    bpy.ops.mesh.primitive_plane_add(size=12.0, location=(1.5, 2.0, 0.0))
    floor = bpy.context.active_object
    floor.name = "Scene_Floor"
    mat_floor = dsc.create_material("Mat_Scene_Floor", "#3a3836", roughness=0.88)
    floor.data.materials.append(mat_floor)
    col_scene.objects.link(floor)

    # 2. Giường nệm & Chăn
    bed_dict = create_stylized_bed_and_blanket(coll=col_scene)

    # 3. Gương soi
    mirror_dict = create_studio_mirror(coll=col_scene)

    # 4. Smartphone
    phone_obj = create_smartphone_prop(location=manifest["phone_pos"], coll=col_scene)

    # 5. Dựng nhân vật Nam
    res_nam = dsc.build_character("nam", collection_name="Char_Nam", offset_x=0.0)
    rig_nam = bpy.data.objects.get("Rig_nam")
    if rig_nam:
        rig_nam.location = manifest["nam_pos"]
        # Đặt tư thế Nam nằm nghiêng trên nệm lúc đầu
        rig_nam.rotation_euler = (math.radians(-90), 0, math.radians(90))

    # 6. Dựng Người Kia (bản sao trong gương) với cờ Ray Visibility
    res_nguoikia = dsc.build_character("nguoikia", collection_name="Char_NguoiKia", offset_x=0.0)
    rig_nguoikia = bpy.data.objects.get("Rig_nguoikia")
    if rig_nguoikia:
        rig_nguoikia.location = manifest["nguoikia_pos"]
        rig_nguoikia.rotation_euler = (math.radians(-90), 0, math.radians(-90)) # Nằm đối xứng qua gương

    # Cài đặt Ray Visibility:
    # Người Kia: chỉ hiện trong tia phản xạ gương (Glossy)
    col_nk = bpy.data.collections.get("Char_NguoiKia")
    if col_nk:
        for ob in col_nk.objects:
            ob.visible_camera = False
            ob.visible_shadow = False
            ob.visible_diffuse = False
            ob.visible_glossy = True

    # Nam thật: ẩn khỏi phản xạ gương (Glossy=False) để Người Kia hoàn toàn chiếm hình ảnh trong kính
    col_nam = bpy.data.collections.get("Char_Nam")
    if col_nam:
        for ob in col_nam.objects:
            ob.visible_glossy = False

    # 7. Camera và Markers
    cams = setup_cameras_and_markers(sc)

    # 8. Ánh sáng
    setup_chiaroscuro_lighting(sc)

    return {
        "manifest": manifest,
        "nam": {"id": "nam", "rig": rig_nam, "result": res_nam},
        "nguoikia": {"id": "nguoikia", "rig": rig_nguoikia, "root": rig_nguoikia, "result": res_nguoikia},
        "phone": phone_obj,
        "mirror": mirror_dict,
        "bed": bed_dict,
        "cameras": cams
    }

def animate_opening_30s(scene_info: Dict[str, Any]) -> None:
    """Cài đặt toàn bộ timeline diễn hoạt 720 frames cho 3 shots, Nam, Người Kia và Cameras."""
    if not HAS_BLENDER or not scene_info:
        return

    timing = get_animation_timing_manifest()
    nam_rig = scene_info.get("nam", {}).get("rig")
    nk_rig = scene_info.get("nguoikia", {}).get("rig")
    cams = scene_info.get("cameras", [])
    phone = scene_info.get("phone")
    bed = scene_info.get("bed", {})
    chan = bed.get("chan")

    # 1. DIỄN HOẠT CAMERA
    # Camera Shot 0: Trượt nhẹ cận cảnh khung gương
    cam0 = next((c for c in cams if c.name == "Cam_Shot0"), None)
    if cam0:
        cam0.location = (0.85, 2.70, 0.70)
        cam0.keyframe_insert(data_path="location", frame=0)
        cam0.location = (0.80, 2.85, 0.72)
        cam0.keyframe_insert(data_path="location", frame=120)

    # Camera Shot 1: Bao quát nệm & gương (handheld drift nhẹ)
    cam1 = next((c for c in cams if c.name == "Cam_Shot1"), None)
    if cam1:
        cam1.location = (1.10, 1.60, 1.05)
        cam1.keyframe_insert(data_path="location", frame=120)
        cam1.location = (1.12, 1.65, 1.05)
        cam1.keyframe_insert(data_path="location", frame=360)

    # Camera Shot 2: Tracking lia theo Nam ngồi dậy và bước đi
    cam2 = next((c for c in cams if c.name == "Cam_Shot2"), None)
    if cam2:
        cam2.location = (1.10, 0.40, 1.25)
        cam2.keyframe_insert(data_path="location", frame=360)
        cam2.location = (1.15, 0.60, 1.28)
        cam2.keyframe_insert(data_path="location", frame=720)

    # 2. DIỄN HOẠT ĐIỆN THOẠI RUNG BÁO THỨC
    if phone:
        p_loc = phone.location
        phone.keyframe_insert(data_path="location", frame=0)
        phone.keyframe_insert(data_path="location", frame=140)
        for f in range(140, 210, 4):
            dx = 0.003 * ((f % 8) - 4) / 4.0
            dy = 0.003 * (((f + 2) % 8) - 4) / 4.0
            phone.location = (p_loc[0] + dx, p_loc[1] + dy, p_loc[2])
            phone.keyframe_insert(data_path="location", frame=f)
        phone.location = p_loc
        phone.keyframe_insert(data_path="location", frame=210)

    # 3. DIỄN HOẠT CHĂN NỆM
    if chan:
        c_loc = chan.location
        chan.keyframe_insert(data_path="location", frame=0)
        chan.keyframe_insert(data_path="location", frame=160)
        chan.location = (c_loc[0] + 0.06, c_loc[1], c_loc[2])
        chan.keyframe_insert(data_path="location", frame=210)
        chan.keyframe_insert(data_path="location", frame=360)
        chan.location = (c_loc[0] + 0.35, c_loc[1] + 0.15, c_loc[2] - 0.04)
        chan.keyframe_insert(data_path="location", frame=420)
        chan.keyframe_insert(data_path="location", frame=720)

    # 4. DIỄN HOẠT NAM (BẢN THỂ THẬT)
    if nam_rig:
        pb_nam = nam_rig.pose.bones
        for pb in pb_nam:
            pb.rotation_mode = "XYZ"
        if not nam_rig.animation_data:
            nam_rig.animation_data_create()
        
        # Diễn hoạt thở Shot 0 (F0 - F120)
        spine_nam = pb_nam.get("spine")
        if spine_nam:
            for f in range(0, 121, 20):
                angle = math.radians(1.5) if (f // 20) % 2 == 1 else 0.0
                spine_nam.rotation_euler = (angle, 0.0, 0.0)
                spine_nam.keyframe_insert(data_path="rotation_euler", frame=f)

        # Diễn hoạt vươn tay tắt báo thức Shot 1 (F160 - F260)
        ik_hand_r = pb_nam.get("ik_hand.R")
        if ik_hand_r:
            rest_hand = (0.0, 0.0, 0.0)
            ik_hand_r.location = rest_hand
            ik_hand_r.keyframe_insert(data_path="location", frame=0)
            ik_hand_r.keyframe_insert(data_path="location", frame=timing["nam_reach_start"]) # F160
            
            reach_pos = (-0.55, 0.10, -0.22)
            ik_hand_r.location = reach_pos
            ik_hand_r.keyframe_insert(data_path="location", frame=190)

            slam_pos = (-0.60, 0.10, -0.25)
            ik_hand_r.location = slam_pos
            ik_hand_r.keyframe_insert(data_path="location", frame=timing["alarm_hit_frame"]) # F210

            ik_hand_r.location = (-0.35, 0.05, -0.10)
            ik_hand_r.keyframe_insert(data_path="location", frame=timing["nam_reach_return"]) # F225
            ik_hand_r.location = rest_hand
            ik_hand_r.keyframe_insert(data_path="location", frame=260)
            ik_hand_r.keyframe_insert(data_path="location", frame=360)

        # Diễn hoạt ngồi dậy và bước đi Shot 2 (F360 - F720)
        root_nam = pb_nam.get("root")
        if root_nam:
            root_nam.location = (0.0, 0.0, 0.0)
            root_nam.rotation_euler = (0.0, 0.0, 0.0)
            root_nam.keyframe_insert(data_path="location", frame=360)
            root_nam.keyframe_insert(data_path="rotation_euler", frame=360)

            root_nam.location = (0.0, 0.0, 0.20)
            root_nam.rotation_euler = (math.radians(45), 0.0, 0.0)
            root_nam.keyframe_insert(data_path="location", frame=420)
            root_nam.keyframe_insert(data_path="rotation_euler", frame=420)

            root_nam.location = (-0.15, -0.10, 0.35)
            root_nam.rotation_euler = (math.radians(90), 0.0, 0.0)
            root_nam.keyframe_insert(data_path="location", frame=460)
            root_nam.keyframe_insert(data_path="rotation_euler", frame=460)

            root_nam.location = (-0.30, -0.20, 0.65)
            root_nam.rotation_euler = (math.radians(90), 0.0, 0.0)
            root_nam.keyframe_insert(data_path="location", frame=540)
            root_nam.keyframe_insert(data_path="rotation_euler", frame=540)

            root_nam.location = (-0.30, -0.45, 0.65)
            root_nam.keyframe_insert(data_path="location", frame=620)
            root_nam.location = (-0.30, -0.75, 0.65)
            root_nam.keyframe_insert(data_path="location", frame=670)
            root_nam.location = (-0.30, -1.05, 0.65)
            root_nam.keyframe_insert(data_path="location", frame=720)

        # Chân bước đi
        ik_foot_r = pb_nam.get("ik_foot.R")
        ik_foot_l = pb_nam.get("ik_foot.L")
        if ik_foot_r and ik_foot_l:
            ik_foot_r.keyframe_insert(data_path="location", frame=540)
            ik_foot_l.keyframe_insert(data_path="location", frame=540)

            ik_foot_r.location = (0.0, -0.25, 0.08)
            ik_foot_r.keyframe_insert(data_path="location", frame=590)
            ik_foot_r.location = (0.0, -0.35, 0.0)
            ik_foot_r.keyframe_insert(data_path="location", frame=620)

            ik_foot_l.location = (0.0, -0.30, 0.08)
            ik_foot_l.keyframe_insert(data_path="location", frame=645)
            ik_foot_l.location = (0.0, -0.65, 0.0)
            ik_foot_l.keyframe_insert(data_path="location", frame=670)

            ik_foot_r.location = (0.0, -0.65, 0.08)
            ik_foot_r.keyframe_insert(data_path="location", frame=695)
            ik_foot_r.location = (0.0, -0.95, 0.0)
            ik_foot_r.keyframe_insert(data_path="location", frame=720)

    # 5. DIỄN HOẠT NGƯỜI KIA (CÚ TRỄ GƯƠNG 5 FRAMES & KHỰNG LẠI NHÌN TRỘM)
    if nk_rig:
        pb_nk = nk_rig.pose.bones
        for pb in pb_nk:
            pb.rotation_mode = "XYZ"
        if not nk_rig.animation_data:
            nk_rig.animation_data_create()

        # Vươn tay trong gương: TRỄ ĐÚNG 5 FRAMES (F165 thay vì F160!)
        ik_hand_nk = pb_nk.get("ik_hand.R")
        if ik_hand_nk:
            rest_hand = (0.0, 0.0, 0.0)
            ik_hand_nk.location = rest_hand
            ik_hand_nk.keyframe_insert(data_path="location", frame=0)
            ik_hand_nk.keyframe_insert(data_path="location", frame=timing["nguoikia_reach_start"]) # F165 (trễ 5f)

            reach_pos = (0.55, 0.10, -0.22)
            ik_hand_nk.location = reach_pos
            ik_hand_nk.keyframe_insert(data_path="location", frame=195)

            slam_pos = (0.60, 0.10, -0.25)
            ik_hand_nk.location = slam_pos
            ik_hand_nk.keyframe_insert(data_path="location", frame=215)

            # CÚ GLITCH: Lơ lửng giữa không trung đến F240
            hover_pos = (0.45, 0.08, -0.12)
            ik_hand_nk.location = hover_pos
            ik_hand_nk.keyframe_insert(data_path="location", frame=225)
            ik_hand_nk.location = hover_pos
            ik_hand_nk.keyframe_insert(data_path="location", frame=timing["nguoikia_hover_end"]) # F240

            ik_hand_nk.location = rest_hand
            ik_hand_nk.keyframe_insert(data_path="location", frame=280)
            ik_hand_nk.keyframe_insert(data_path="location", frame=360)

        # Diễn hoạt ngồi dậy trong gương
        root_nk = pb_nk.get("root")
        if root_nk:
            root_nk.location = (0.0, 0.0, 0.0)
            root_nk.rotation_euler = (0.0, 0.0, 0.0)
            root_nk.keyframe_insert(data_path="location", frame=360)
            root_nk.keyframe_insert(data_path="rotation_euler", frame=360)

            root_nk.location = (0.0, 0.0, 0.20)
            root_nk.rotation_euler = (math.radians(45), 0.0, 0.0)
            root_nk.keyframe_insert(data_path="location", frame=420)
            root_nk.keyframe_insert(data_path="rotation_euler", frame=420)

            root_nk.location = (0.15, -0.10, 0.35)
            root_nk.rotation_euler = (math.radians(90), 0.0, 0.0)
            root_nk.keyframe_insert(data_path="location", frame=460)
            root_nk.keyframe_insert(data_path="rotation_euler", frame=460)

            root_nk.location = (0.30, -0.20, 0.65)
            root_nk.rotation_euler = (math.radians(90), 0.0, 0.0)
            root_nk.keyframe_insert(data_path="location", frame=540)
            root_nk.keyframe_insert(data_path="rotation_euler", frame=540)

            root_nk.location = (0.30, -0.45, 0.65)
            root_nk.keyframe_insert(data_path="location", frame=620)
            # Khựng lại ở vị trí F640, không đi tiếp đến F720
            root_nk.location = (0.30, -0.55, 0.65)
            root_nk.keyframe_insert(data_path="location", frame=timing["mirror_pause_look_frame"]) # F640
            root_nk.location = (0.30, -0.55, 0.65)
            root_nk.keyframe_insert(data_path="location", frame=720)

        # Đầu Người Kia ngoảnh lại nhìn trộm bóng lưng Nam tại F640 - F720
        head_nk = pb_nk.get("head")
        if head_nk:
            head_nk.rotation_euler = (0.0, 0.0, 0.0)
            head_nk.keyframe_insert(data_path="rotation_euler", frame=0)
            head_nk.keyframe_insert(data_path="rotation_euler", frame=620)
            head_nk.rotation_euler = (math.radians(-10), math.radians(15), math.radians(35))
            head_nk.keyframe_insert(data_path="rotation_euler", frame=timing["mirror_pause_look_frame"]) # F640
            head_nk.keyframe_insert(data_path="rotation_euler", frame=720)

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Dựng cảnh và diễn hoạt 30s mở đầu")
    parser.add_argument("--save", type=str, default="", help="Đường dẫn lưu file .blend")
    parser.add_argument("--render", type=str, default="", help="Thư mục render ảnh frames")
    parser.add_argument("--samples", type=int, default=16, help="Số samples render")

    if '--' in sys.argv:
        argv = sys.argv[sys.argv.index('--') + 1:]
    elif "blender" in os.path.basename(sys.executable).lower():
        argv = []
    else:
        argv = sys.argv[1:]

    args = parser.parse_args(argv)

    print("=== DỰNG BỐI CẢNH VÀ DIỄN HOẠT OPENING 30S ===")
    scene_info = setup_opening_30s_scene()
    animate_opening_30s(scene_info)
    print("Diễn hoạt 720 frames đã được thiết lập thành công!")

    if HAS_BLENDER and args.save:
        out_dir = os.path.dirname(os.path.abspath(args.save))
        os.makedirs(out_dir, exist_ok=True)
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(args.save))
        print(f"[BLENDER] Đã lưu file blend tại: {args.save}")

    if HAS_BLENDER and args.render:
        out_render = os.path.abspath(args.render)
        os.makedirs(out_render, exist_ok=True)
        sc = bpy.context.scene
        sc.render.engine = 'CYCLES'
        if hasattr(sc, 'cycles'):
            sc.cycles.samples = args.samples
        sc.render.filepath = os.path.join(out_render, "frame_")
        print(f"Đang render chuỗi 720 frames vào {out_render} ...")
        bpy.ops.render.render(animation=True)
        print("Render animation hoàn tất!")

if __name__ == "__main__":
    main()
