# Design Document: Diễn Hoạt Nhân Vật Stickman & Dựng Video Mở Đầu 30s (Opening Full 3D)

> **File:** `docs/superpowers/specs/2026-11-17-opening-30s-stickman-animation-design.md`  
> **Date:** 2026-11-17  
> **Status:** Draft (Awaiting Builder Check & Approval)  
> **Series:** The Crack in Reality — Hồ sơ 02: Người trong gương  
> **Pipeline:** Blender 3D (Cycles / EEVEE Next) + Full 3D Stickman Cast + Motivated Lighting + Audio / SFX Master

---

## 1. Intent & The Why

### Bối cảnh & Mục đích
Sau khi chuẩn hóa dàn nhân vật Stickman 3D Kiểu B (chiều cao chuẩn $1.60\text{ m}$, đầu men sứ PBR có SSS, trang phục sợi vải Sheen, Armature Rig IK đầy đủ) và bổ sung dàn nhân vật phụ Việt Nam, bước tiếp theo mang tính quyết định là: **Thổi hồn chuyển động sống động vào nhân vật và chứng minh tính khả thi của toàn bộ pipeline qua một đoạn phim mở đầu 30 giây hoàn chỉnh**.

Đoạn 30 giây này đóng vai trò:
1. **Pilot Proof-of-Concept (PoC):** Xác thực chuyển động của Armature Rig trên phôi Stickman trong không gian 3D thực tế (nằm trên nệm, vươn tay tắt báo thức, ngồi dậy, xoay người, bước chân tiếp sàn).
2. **Kỹ xảo cốt lõi (Core Suspense Hook):** Thể hiện thành công chi tiết kinh dị tâm lý then chốt của Hồ sơ 02: **Cú trễ 5 frames (0.2s) của cánh tay Người Kia trong gương** so với Nam thật.
3. **Thước phim thành phẩm hoàn chỉnh:** Tích hợp đầy đủ hình ảnh, ánh sáng Chiaroscuro ban mai 5h30, camera điện ảnh Anamorphic 2.39:1 có độ thở vác vai, cùng thiết kế âm thanh đa tầng (tiếng chuông báo thức iPhone rè méo, tiếng thở lạnh sau gương, tiếng bước chân và nhạc nền acoustic ma mị).

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
- **G1: Diễn hoạt chuyển động mượt mà cho Nam:** Nam nằm trên nệm, cựa mình ngái ngủ, vươn tay phải đập tắt báo thức điện thoại trên sàn, sau đó chống tay ngồi dậy, buông chân xuống sàn.
- **G2: Kỹ xảo độ trễ gương (The 5-frame Latency Glitch):** Trong gương soi dựa tường (`khung_guong`), hình ảnh phản chiếu của Người Kia vươn tay ra chậm hơn Nam đúng 5 frames, lơ lửng một tích tắc rồi mới hạ xuống gượng gạo.
- **G3: Chuỗi 3 Shots điện ảnh chuẩn 30 giây (720 frames @ 24fps hoặc 900 frames @ 30fps):**
  - **Shot 0 (00:00 - 00:05):** Cold Open — Cận cảnh tấm vải hoa cũ phủ nửa gương, giọt nước ngược và tiếng thở lạnh.
  - **Shot 1 (00:05 - 00:15):** Nam tỉnh dậy quờ tay đập chuông báo thức + cú trễ gương rùng rợn.
  - **Shot 2 (00:15 - 00:30):** Nam ngồi dậy uể oải, bước chân xuống sàn đi ngang qua gương, bóng trong gương dừng lại nhìn trộm 1 nhịp.
- **G4: Bối cảnh & Ánh sáng 3D thực tế:** Tận dụng phòng trọ 3D (`xay_phong_tro.py`) với ánh sáng bình minh xuyên qua nan rèm rách, vệt sáng xanh từ điện thoại, bóng đổ mềm.
- **G5: Xuất video MP4 hoàn chỉnh có âm thanh:** Render video chất lượng cao kèm hòa âm SFX chuông báo thức, foley chăn nệm, bước chân và nhạc nền rùng rợn.

### Non-Goals
- Không render toàn bộ 15 phút tập phim (đây là bản dựng thử 30 giây mở đầu).
- Không yêu cầu lip-sync thoại hoàn chỉnh vì đoạn 30s đầu Nam chủ yếu thở dài, ngái ngủ và độc thoại nội tâm (chưa có tương tác đối thoại trực tiếp).
- Không dùng phôi người chi tiết cũ hay mesh GLB cũ; tuyệt đối tuân thủ Stickman Kiểu B.

### Anti-Goals
- **Tránh chuyển động robot thô cứng:** Khử hiện tượng tay chân vung giật không tự nhiên bằng cách áp dụng đường cong nội suy Bezier mượt mà, chuyển động kéo theo (follow-through) ở đầu và vai.
- **Tránh xuyên khối (clipping):** Tay chân không được đâm xuyên qua nệm hoặc mặt sàn ($Z = 0$).
- **Tránh video câm:** Video không được xuất ra dưới dạng silent video mà bắt buộc phải có âm thanh/SFX đồng bộ nhịp hình.

---

## 3. Constraints

- **Tỷ lệ nhân vật:** Stickman Kiểu B chuẩn $1.60\text{ m}$.
- **Tọa độ bối cảnh:** Bám sát tọa độ thực của `xay_phong_tro.py`:
  - Nệm: $X \in [1.58, 2.98]$, $Y \in [2.05, 3.95]$, mặt nệm $Z = 0.24\text{ m}$.
  - Gương đứng: Tường trái, chân tại $X = 0.16\text{ m}, Y = 3.26\text{ m}$, nghiêng $6^\circ$.
  - Sàn nhà: $Z = 0.0\text{ m}$.
- **Tỷ lệ khung hình:** 2.39:1 Anamorphic Widescreen (1920 × 803 hoặc 1920 × 1080 có letterbox bar 138px).
- **Thời lượng:** 30 giây (720 frames @ 24fps).
- **Hệ điều hành / Môi trường:** Linux Debian 12, Python 3.11, Blender 5.0.1 (module `bpy`), ffmpeg để ghép audio/video.

---

## 4. Approaches & Evaluation

### Phương án xem xét:
1. **Phương án 1 (Phân kỳ 2 bước — Test cử động riêng trước $\to$ Dựng cảnh sau):**
   - *Ưu điểm:* Người dùng được duyệt chuyển động thô trước khi render bối cảnh nặng.
   - *Nhược điểm:* Mất thêm một chu kỳ trao đổi trung gian, kéo dài thời gian hoàn thành video 30s.
2. **Phương án 2 (Dựng thẳng toàn bộ 30s Full 3D — ĐÃ ĐƯỢC NGƯỜI DÙNG CHỌN):**
   - *Mô tả:* Tích hợp trực tiếp diễn hoạt rig cho Nam và Người Kia vào bối cảnh phòng trọ 3D, thiết lập chuyển động camera 3 shots theo đúng kịch bản phân cảnh 00:00 - 00:30, render video và mix âm thanh thành file MP4 hoàn chỉnh.
   - *Lý do chọn:* Người dùng đã chọn dứt khoát "2" để nhanh chóng có ngay sản phẩm trực quan xem được từ đầu đến cuối.

---

## 5. Architectural & Technical Design

### 5.1. Kỹ Thuật Gương & Diễn Hoạt Người Kia (Ray Visibility Architecture)
Kế thừa giải pháp đã hoàn thiện trong [cong_guong.py](file:///home/antigravity/lqt140304-rgb/lamvideo/episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/boi-canh-3d/cong_guong.py):
- **Cơ chế phản xạ quang học thực:** Mặt gương `mat_guong` là vật liệu gương Cycles thật (`Roughness = 0.02, Metallic = 1.0`).
- **Tách biệt hành động giữa Nam và Người Kia qua Ray Visibility:**
  - **Nam (Ngoài đời):** Trong đoạn trễ gương (Frame 160 – 260), đặt cờ `visible_glossy = False` trên toàn bộ mesh của Nam để mặt gương không phản chiếu Nam thật.
  - **Người Kia (Bản sao trong gương):** Đặt cờ `visible_camera = False, visible_shadow = False, visible_diffuse = False, visible_glossy = True`. Người Kia được đặt tại vị trí đối xứng qua mặt phẳng gương và diễn hoạt cánh tay vươn ra trễ hơn Nam đúng 5 frames. Nhờ đó, máy quay nhìn trực tiếp chỉ thấy Nam trên nệm, còn trong gương chỉ thấy Người Kia phản chiếu!
- **Động cơ Render:** Cycles (16 samples + OpenImageDenoise) đảm bảo tính chuẩn xác quang học của gương phản chiếu và ánh sáng Chiaroscuro.

### 5.2. Cấu Trúc Rigging & Biến Dạng Lưới (Stickman Armature Binding)
- **Ràng buộc xương (Armature Binding):**
  - Gán `Armature Modifier` cho toàn bộ các phần thân, tay, chân, đầu của Stickman vào `Rig_nam`.
  - Thiết lập nhóm đỉnh (Vertex Groups) tương ứng với từng xương (`root`, `spine`, `neck`, `head`, `arm.L`, `forearm.L`, `hand.L`, `arm.R`, `forearm.R`, `hand.R`, `thigh.L`, `shin.L`, `foot.L`, `thigh.R`, `shin.R`, `foot.R`).
  - Sử dụng Weight Gradient mượt mà tại các khớp vai áo (`ShoulderCap`) và gối/khuỷu tay để khi gập cong không bị đứt khúc hay xuyên khối.
- **Bổ sung IK cho cánh tay (Arm IK Constraints):**
  - Bổ sung 2 xương mục tiêu IK (`ik_hand.L`, `ik_hand.R`) và gán ràng buộc `IK Constraint` cho `forearm` (chain length = 2).
  - Giúp việc điều khiển bàn tay vươn ra đập chuông báo thức và chống tay xuống nệm diễn ra cực kỳ chính xác theo tọa độ không gian.

### 5.3. Diễn Hoạt Tương Tác Chăn Nệm (Rigged Stylized Blanket)
- Thay vì dùng Cloth Simulation dễ gây lỗi xuyên khối hoặc nổ lưới, chăn nệm được tạo hình stylized phù hợp phong cách Stickman:
  - Khối chăn nệm đắp ngang ngực (`chan_nem`) được gắn 2 xương điều khiển lật/trượt (`bone_blanket_fold`, `bone_blanket_pull`).
  - Tại Frame 160 – 220: Xương chăn khẽ trượt hé để lộ cánh tay phải của Nam vươn ra.
  - Tại Frame 360 – 420: Chăn trượt hẳn sang mép nệm khi Nam chống tay ngồi dậy, đảm bảo 100% không xuyên qua chân/đùi Nam.

### 5.4. Thiết Lập Ống Kính & Camera Không Gian Hẹp
- **Shot 0 (Macro Cận Cảnh Gương 00:00 - 00:05):** Tiêu cự 85mm f/2.0, góc nghiêng Dutch Angle $5^\circ$, camera trượt chậm dọc theo viền khung gỗ mục của chiếc gương. Mặt kính lạnh có vết hơi ẩm ngưng tụ.
- **Shot 1 (Góc Rộng Nệm & Gương 00:05 - 00:15):** Trong không gian phòng $3\text{m} \times 4\text{m}$, sử dụng **tiêu cự 28mm Anamorphic** (thay vì 50mm) đặt tại góc phòng phía trước ($Y \approx 1.2\text{m}, Z \approx 0.8\text{m}$), bao quát trọn vẹn cả nệm Nam nằm và mặt gương soi ở góc trái mà không cần cắt thủng tường. Camera có độ thở nhẹ (Handheld breathing biên độ $0.05^\circ$).
- **Shot 2 (Tracking Theo Dõi Bước Chân 00:15 - 00:30):** Tiêu cự 32mm, camera lia theo bước chân của Nam từ nệm sang bàn học, bắt trọn khoảnh khắc cái bóng Người Kia trong gương dừng lại nhìn trộm một nhịp.

### 5.5. Timeline Diễn Hoạt Chi Tiết (720 frames @ 24fps)
- **Frames 0 – 120 (Shot 0):** Cận cảnh gương. Nam ngủ nhịp nhàng (ngực phập phồng chu kỳ 40 frames).
- **Frames 120 – 360 (Shot 1):**
  - Frame 140: Chuông điện thoại rung và phát sáng trên sàn ($X = 1.45, Y = 3.10$).
  - Frame 160: Nam bắt đầu cựa mình, tay phải vươn ra.
  - **Frame 165:** Người Kia trong gương bắt đầu vươn tay (trễ đúng 5 frames).
  - Frame 210: Tay Nam đập mạnh vào màn hình điện thoại tắt chuông.
  - Frame 215 – 240: Tay Nam rút về nệm, trong khi tay Người Kia trong gương dừng lơ lửng tại cao độ $Z = 0.15\text{m}$ đến Frame 240 mới hạ xuống cứng đơ.
  - Frame 250 – 360: Nam kéo nhẹ chăn, thở hắt mệt mỏi.
- **Frames 360 – 720 (Shot 2):**
  - Frame 360 – 460: Nam gạt chăn, chống tay phải xuống nệm, nâng người ngồi dậy ở mép nệm, hai chân buông thõng chạm sàn tại $Z = 0$.
  - Frame 460 – 560: Nam đứng thẳng dậy, lưng hơi so, hai vai buông chùng.
  - Frame 560 – 720: Nam bước 3 bước chậm rãi về phía bàn học. Khi đi qua vị trí gương (Frame 620 – 680), bóng Người Kia trong gương bỗng dừng chân lại, đầu khẽ nghiêng nhìn chằm chằm theo bóng lưng của Nam.

### 5.6. Âm Thanh & Hậu Kỳ (Audio Mixing)
- Sử dụng các file âm thanh có sẵn trong `what-if-studio/public/ho-so-02-nguoi-lam-thay/opening-audio/`:
  - `twoTone1.ogg` / `tone1.ogg`: Âm thanh chuông báo thức nhịp điệu dồn dập.
  - `lightless-dawn-excerpt.mp3`: Nhạc nền ambient u tối rùng rợn.
  - `impactSoft_medium_000.ogg`: Tiếng đập tay tắt điện thoại và sột soạt chăn nệm.
  - `footstep_concrete_000.ogg`, `001.ogg`: Tiếng bước chân trần tiếp xúc sàn gạch lạnh.
- Xuất video qua Blender render sequence và dùng `ffmpeg` mux âm thanh stereo đồng bộ 100%.

---

## 6. What's Left to the Builder

- Tinh chỉnh đường cong nội suy F-Curve cho các keyframe bàn tay và bước chân để đạt độ tự nhiên cao nhất.
- Tự động gộp 3 shots thành chuỗi render liền mạch hoặc render 3 phân đoạn rồi ghép bằng ffmpeg.
- Đường dẫn file xuất:
  - Blend file: `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/opening_30s_animation.blend`
  - Video thành phẩm: `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat-3d/opening_30s_render.mp4`
  - Copy vào thư mục artifact để người dùng xem và phát trực tiếp.
