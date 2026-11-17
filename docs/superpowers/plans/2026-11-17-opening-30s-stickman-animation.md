# Diễn Hoạt Nhân Vật Stickman & Dựng Video Mở Đầu 30s — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng diễn hoạt chuyển động cho nhân vật Stickman Kiểu B trong bối cảnh phòng trọ 3D, thực thi kỹ xảo độ trễ gương 5 frames, và render thành phẩm video mở đầu 30 giây kèm âm thanh hoàn chỉnh.

**Architecture:** Sử dụng Blender Python API (`bpy`) mở rộng từ `dung_stickman_cast.py` và `xay_phong_tro.py`: nâng cấp Rigging liên kết mesh liền khối + Arm IK, đặt Nam và bản sao gương Người Kia (`Ray Visibility`), diễn hoạt 720 frames @ 24fps qua 3 shots điện ảnh, render và mix âm thanh bằng `ffmpeg` xuất ra file `opening_30s_render.mp4`.

**Tech Stack:** Python 3.11, Blender bpy 5.0.1, Cycles / EEVEE Next, ffmpeg, KaTeX / Markdown.

**Spec:** `docs/superpowers/specs/2026-11-17-opening-30s-stickman-animation-design.md`

## Global Constraints
- Chiều cao chuẩn nhân vật: $1.60\text{ m}$.
- Tọa độ phòng trọ: Kế thừa thực tế từ `xay_phong_tro.py` (nệm $X \in [1.58, 2.98], Y \in [2.05, 3.95]$, gương $X = 0.16\text{ m}$, sàn $Z = 0.0\text{ m}$).
- Tỉ lệ khung hình: 2.39:1 Anamorphic Widescreen ($1920 \times 803$ hoặc $1920 \times 1080$ letterbox).
- Thời lượng video: Đúng 30 giây (720 frames @ 24fps).
- Không để xảy ra lỗi xuyên khối đệm/sàn, không để video câm (bắt buộc mux âm thanh/SFX).

## Review Focus
- **RF1 (Trễ nhịp gương):** Cánh tay Người Kia trong gương bắt đầu vươn ra tại Frame 165 (trễ đúng 5 frames so với Nam ở Frame 160) và dừng lơ lửng ở Frame 225-240.
- **RF2 (Ray Visibility):** Nam ngoài đời có `visible_glossy = False` trong đoạn trễ để mặt gương không phản chiếu Nam; Người Kia có `visible_camera = False, visible_glossy = True` để chỉ xuất hiện trong gương.
- **RF3 (Arm IK):** Hai cánh tay của Rig có IK constraint hoạt động chuẩn xác, bàn tay chạm đúng tọa độ điện thoại trên sàn ($X = 1.45, Y = 3.10, Z = 0.02$).
- **RF4 (Chăn nệm không xuyên khối):** Chăn nệm trượt hé ở Frame 160-220 và lật sang mép ở Frame 360-420, không xuyên qua đùi/chân Nam.
- **RF5 (Video đồng bộ âm thanh):** File video `opening_30s_render.mp4` có track âm thanh stereo độ dài $\approx 30.0\text{ s}$ gồm chuông báo thức reo ở Frame 140-210 và tắt đúng nhịp tay đập.

---

### Task 1: Nâng cấp Rigging (Mesh Binding & Arm IK) cho Stickman

**Files:**
- Modify: `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/dung_stickman_cast.py`
- Test: `tests/test_stickman_rig_animation.py`

**Interfaces:**
- Produces: `bind_stickman_to_armature(char_id: str, rig_obj: Any, body_parts: List[Any], outfit_parts: List[Any]) -> None`
- Produces: `add_arm_ik(rig_obj: Any) -> None`

- [ ] **Step 1: Viết test kiểm tra cấu trúc xương Arm IK và liên kết Armature Modifier**

```python
def test_armature_has_arm_ik_bones():
    # Kiểm tra rig có xương ik_hand.L và ik_hand.R
    rig = create_armature_rig("Rig_Test", handedness="right")
    bone_names = [b.name for b in rig.data.bones]
    assert "ik_hand.L" in bone_names
    assert "ik_hand.R" in bone_names
```

- [ ] **Step 2: Chạy test để xác nhận test ban đầu fail**

Run: `/home/antigravity/.venv/bin/python -m unittest tests/test_stickman_rig_animation.py`
Expected: FAIL with missing `ik_hand` or test module not found.

- [ ] **Step 3: Cập nhật `create_armature_rig` để bổ sung xương IK cánh tay và hàm gán Armature Modifier**

Trong `dung_stickman_cast.py`:
- Thêm `ik_hand.L`, `ik_hand.R` tại vị trí cổ tay.
- Gán ràng buộc IK Constraint vào xương `forearm.L` và `forearm.R` với target là armature và subtarget là `ik_hand.*`, chain_length = 2.
- Thêm hàm `bind_stickman_to_armature(...)` gán modifier Armature và tạo vertex groups cơ bản cho từng chi.

- [ ] **Step 4: Chạy lại test để xác nhận PASS**

Run: `/home/antigravity/.venv/bin/python -m unittest tests/test_stickman_rig_animation.py`
Expected: PASS

- [ ] **Step 5: Commit mã nguồn Task 1**

```bash
git add episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/dung_stickman_cast.py tests/test_stickman_rig_animation.py
git commit -m "feat(rig): bo sung Arm IK va armature binding cho stickman cast"
```

---

### Task 2: Dựng Module Bối Cảnh & Đạo Cụ Cho Cảnh Mở Đầu 30s

**Files:**
- Create: `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/dung_canh_opening_30s.py`
- Test: `tests/test_opening_scene_setup.py`

**Interfaces:**
- Consumes: `xay_phong_tro.py` (bed, mirror, wall, floor), `dung_stickman_cast.py` (build_character)
- Produces: `setup_opening_30s_scene() -> Dict[str, Any]` (chứa `nam`, `nguoikia`, `mirror`, `phone`, `bed`, `cameras`)

- [ ] **Step 1: Viết test kiểm tra thiết lập bối cảnh phòng trọ, gương và điện thoại**

```python
def test_opening_scene_objects_and_ray_visibility():
    scene_info = setup_opening_30s_scene(create_blender_scene=False)
    assert "nam" in scene_info
    assert "nguoikia" in scene_info
    assert "phone" in scene_info
    assert "mirror" in scene_info
    assert len(scene_info["cameras"]) == 3
```

- [ ] **Step 2: Chạy test để xác nhận test ban đầu fail**

Run: `/home/antigravity/.venv/bin/python -m unittest tests/test_opening_scene_setup.py`
Expected: FAIL (module chưa tồn tại).

- [ ] **Step 3: Cài đặt `dung_canh_opening_30s.py`**

- Dựng phòng trọ và nệm (`bed`), gương (`mirror`).
- Tạo điện thoại smartphone phát sáng đặt tại $X = 1.45, Y = 3.10, Z = 0.02$.
- Dựng chăn nệm stylized gắn xương điều khiển trượt.
- Khởi tạo Nam trên nệm ($X = 2.05, Y = 3.20, Z = 0.25$) và Người Kia đối xứng qua gương với các cờ `Ray Visibility`.
- Thiết lập 3 camera: `Cam_Shot0` (85mm), `Cam_Shot1` (28mm), `Cam_Shot2` (32mm).

- [ ] **Step 4: Chạy lại test để xác nhận PASS**

Run: `/home/antigravity/.venv/bin/python -m unittest tests/test_opening_scene_setup.py`
Expected: PASS

- [ ] **Step 5: Commit mã nguồn Task 2**

```bash
git add episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/dung_canh_opening_30s.py tests/test_opening_scene_setup.py
git commit -m "feat(scene): dung module boi canh phong tro va dao cu cho opening 30s"
```

---

### Task 3: Diễn Hoạt Keyframe 720 Frames (Animation Timeline & Độ Trễ Gương)

**Files:**
- Modify: `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/dung_canh_opening_30s.py`
- Test: `tests/test_opening_animation_timing.py`

**Interfaces:**
- Produces: `animate_opening_30s(scene_info: Dict[str, Any]) -> None`

- [ ] **Step 1: Viết test kiểm tra các mốc keyframe then chốt**

```python
def test_keyframe_timing_and_mirror_latency():
    # Kiểm tra timing keyframe vươn tay của Nam (f=160-210) và Người Kia (f=165-240)
    keyframes = get_animation_timing_manifest()
    assert keyframes["nam_reach_start"] == 160
    assert keyframes["nguoikia_reach_start"] == 165
    assert keyframes["nguoikia_reach_start"] - keyframes["nam_reach_start"] == 5
    assert keyframes["alarm_hit_frame"] == 210
    assert keyframes["shot2_situp_frame"] == 360
    assert keyframes["shot2_walk_frame"] == 560
```

- [ ] **Step 2: Chạy test để xác nhận test ban đầu fail**

Run: `/home/antigravity/.venv/bin/python -m unittest tests/test_opening_animation_timing.py`
Expected: FAIL

- [ ] **Step 3: Cài đặt diễn hoạt keyframe trong `dung_canh_opening_30s.py`**

- **Shot 0 (Frame 0 – 120):** Breathing animation cho Nam (spine nhấp nhô nhẹ chu kỳ 40f). Camera Shot 0 trượt dọc khung gương.
- **Shot 1 (Frame 120 – 360):**
  - F140: Điện thoại rung nảy.
  - F160 – F210: IK tay phải Nam vươn xuống chạm điện thoại tại F210.
  - F165 – F225: IK tay Người Kia trong gương vươn ra (trễ 5f), dừng lơ lửng đến F240 mới hạ xuống.
  - F250 – F360: Nam co tay về, thở dài.
- **Shot 2 (Frame 360 – 720):**
  - F360 – F460: Chăn gạt sang bên, Nam chống tay ngồi dậy mép nệm, chân hạ sàn.
  - F460 – F560: Nam đứng dậy, dáng hơi gù.
  - F560 – F720: Nam bước 3 bước sang bàn học; tại F640 bóng Người Kia dừng lại nhìn trộm.
- Đặt marker chuyển camera giữa `Cam_Shot0` (0), `Cam_Shot1` (120), `Cam_Shot2` (360).

- [ ] **Step 4: Chạy test kiểm tra timing để xác nhận PASS**

Run: `/home/antigravity/.venv/bin/python -m unittest tests/test_opening_animation_timing.py`
Expected: PASS

- [ ] **Step 5: Commit mã nguồn Task 3**

```bash
git add episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/dung_canh_opening_30s.py tests/test_opening_animation_timing.py
git commit -m "feat(animation): cai dat timeline keyframe 720 frames va do tre guong 5 frames"
```

---

### Task 4: Render Video, Hòa Âm SFX & Xuất File Thành Phẩm

**Files:**
- Modify: `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/dung_canh_opening_30s.py`
- Output: `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/opening_30s_animation.blend`
- Output: `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/opening_30s_render.mp4`

- [ ] **Step 1: Tạo script / lệnh render animation trong Blender**

Chạy script tạo file `.blend` và render chuỗi video hình ảnh 720 frames:
`/home/antigravity/.venv/bin/python episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/dung_canh_opening_30s.py --save episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/opening_30s_animation.blend --render /tmp/render-opening-30s`

- [ ] **Step 2: Dùng `ffmpeg` hòa âm các track âm thanh SFX và nhạc nền**

Mix `twoTone1.ogg` (chuông báo thức F140-210), `impactSoft_medium_000.ogg` (đập tay F210), `footstep_concrete_000.ogg` (bước chân F580-700), và `lightless-dawn-excerpt.mp3` (ambient nền) vào chuỗi video render.

- [ ] **Step 3: Kiểm tra định dạng video thành phẩm**

Chạy `ffprobe episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/opening_30s_render.mp4` để xác nhận:
- Độ dài $\approx 30.0\text{ s}$.
- Video codec H.264, Audio codec AAC stereo.
- Không lỗi frame hỏng.

- [ ] **Step 4: Sao chép video và ảnh keyframe vào thư mục Artifact**

Copy video thành phẩm và 3 ảnh đại diện (Shot 0, Shot 1, Shot 2) vào artifact directory để người dùng xem trực tiếp.

- [ ] **Step 5: Chạy toàn bộ test suite để xác nhận PASS**

Run: `/home/antigravity/.venv/bin/python -m unittest discover tests`
Expected: 26+ tests PASS.

- [ ] **Step 6: Commit và push mã nguồn lên Git**

```bash
git add episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/dung_canh_opening_30s.py tests/ docs/superpowers/plans/2026-11-17-opening-30s-stickman-animation.md
git commit -m "feat(video): hoan thanh dien hoat va xuat video opening 30s stickman"
git push origin main
```
