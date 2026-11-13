# Quy trình Sản xuất Nhân vật 3D — Phương Án 2: Blender Pre-render + Alpha Overlay
*(Dự án: The Crack in Reality — Hồ sơ 02: Người trong gương)*

> **Quyết định kỹ thuật (12/11/2026):** Áp dụng **Phương Án 2 (PA 2)**. Nhân vật được mô hình hóa, gắn xương (rigging) và diễn hoạt (animating) chất lượng cao trong **Blender**, sau đó xuất ra video có kênh trong suốt (**Alpha Channel**) để lồng ghép trực tiếp vào bối cảnh phòng trọ 2.5D trong Remotion.

---

## 1. Tại sao Phương Án 2 là giải pháp tối ưu nhất?

1. **Chất lượng thẩm mỹ điện ảnh vượt trội:**
   * Tận dụng tối đa công cụ đổ bóng cao cấp của Blender (EEVEE Next / Cycles): Ánh sáng nảy mềm mại (Indirect Lighting), Ambient Occlusion, nếp nhăn vải vóc tự nhiên và tán xạ dưới bề mặt da (**Subsurface Scattering — SSS**) giúp da mặt Nam có độ hồng hào, ấm áp của người sống, tương phản sâu sắc với làn da tái mét lạnh ngắt của Cái Bóng.
2. **Remotion chạy siêu nhẹ & Render cực nhanh:**
   * Remotion không phải tính toán ma trận WebGL 3D nặng nề trên trình duyệt. Tốc độ xuất video cuối đạt **60 – 120 FPS**.
3. **An toàn 100% cho mã nguồn:**
   * Không làm phình to `node_modules`, không gặp rủi ro xung đột thư viện giữa Three.js và React 19.

---

## 2. Quy chuẩn Kỹ thuật Xuất file từ Blender (Blender Render Specs)

Khi làm việc trong Blender, 3D Artist cần tuân thủ các thiết lập sau:

| Thông số | Giá trị chuẩn | Ghi chú |
|---|---|---|
| **Frame Rate** | **30 FPS** | Đồng bộ chính xác 1:1 với timeline của Remotion Studio |
| **Độ phân giải** | **1920 × 1080** | Hoặc 2K/4K cho các shot cực cận (Extreme Close-up) |
| **Render Engine** | **EEVEE** hoặc **Cycles** | EEVEE tối ưu tốc độ nhanh; Cycles tối ưu chiều sâu ánh sáng |
| **Transparent Film** | **BẮT BUỘC BẬT** | `Render Properties` $\to$ `Film` $\to$ tích chọn **`Transparent`** |
| **Color Management** | AgX hoặc Filmic | Đảm bảo dải màu tương phản mềm mại, không bị cháy sáng |
| **Shadow Catcher** | Tùy chọn (Bật mặt phẳng sàn) | `Object Properties` $\to$ `Visibility` $\to$ tích **`Shadow Catcher`** để bắt bóng đổ sàn |

---

## 3. Định dạng File bàn giao vào Thư mục Remotion

Toàn bộ file video nhân vật 3D sau khi render sẽ được lưu tại thư mục:  
`what-if-studio/public/ho-so-02-nguoi-lam-thay/characters-3d-alpha/`

### Định dạng tối ưu nhất: **WebM với VP9 Alpha**
* **Đuôi file:** `.webm`
* **Ưu điểm:** Dung lượng siêu nhỏ (chỉ **2 – 6 MB** cho mỗi shot), hỗ trợ phát mượt mà trên Chrome/Chromium headless của Remotion.
* **Lệnh FFmpeg chuyển từ chuỗi ảnh PNG của Blender sang WebM Alpha:**
```bash
ffmpeg -framerate 30 -i render_%04d.png -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 2.5M -auto-alt-ref 0 output_alpha.webm
```

*(Ghi chú: Nếu cần chất lượng lossless tuyệt đối cho bản chiếu rạp, có thể dùng định dạng **Apple ProRes 4444 with Alpha (.mov)**).*

---

## 4. Danh sách các Shot Nhân vật 3D cần sản xuất cho Opening 48s

| Tên file bàn giao | Cảnh & Thời lượng | Nhân vật & Hành động cần diễn xuất | Tọa độ đặt trong Remotion `[x, y]` |
|---|---|---|---|
| `nam_shot1_reach_alarm.webm` | **Shot 1** (Frame 150 – 260 \| 3.6s) | Cánh tay gầy gò của Nam thò ra khỏi chăn, quờ quạng đập tắt màn hình điện thoại rồi rụt về. | `[424, 332]` (Góc nệm) |
| `nguoikia_shot1_lag_arm.webm` | **Shot 1** (Frame 260 – 320 \| 2.0s) | Cánh tay Cái Bóng trong gương vươn ra trễ hơn ngoài đời 5 frames, khựng lại lơ lửng rồi mới rút. | `[960, 540]` (Trong gương) |
| `nam_shot2a_game.webm` | **Shot 2A** (Frame 450 – 550 \| 3.3s) | Nam ngồi xoay ghế ở bàn học, hai tay cầm ngang điện thoại leo rank, mặt cau có tức tối. | `[396, 112]` (Bàn học) |
| `nam_shot2b_walk_wave.webm` | **Shot 2B** (Frame 550 – 660 \| 3.6s) | Nam ngái ngủ đi ngang qua bồn rửa bát ngập ngụa xoong nồi, tay xua xua từ chối rửa. | Bước đi từ `[175, 66]` sang `[55, 66]` |
| `nam_tung_shot2c_cup.webm` | **Shot 2C** (Frame 660 – 780 \| 4.0s) | Đêm muộn giữa phòng: Tùng xoa gáy mệt mỏi; Nam chìa cốc nước sang, Tùng đưa tay đón lấy. | Nam: `[160, 222]`, Tùng: `[268, 232]` |
| `nam_shot3_slump.webm` | **Shot 3** (Frame 780 – 1140 \| 12s) | Nam mệt mỏi đối diện gương, gãi mắt trái, thở dài gục đầu bất lực trước laptop. | `[760, 150]` (Trước gương) |
| `nguoikia_shot3_grin.webm` | **Shot 3** (Frame 942 – 1140 \| 6.6s) | Cái bóng Người Kia không cúi đầu mà từ từ ngẩng lên, nụ cười nham hiểm nhìn trừng trừng ra máy quay. | `[1390, 800]` (Trong gương) |
| `nam_walk_shot4.webm` | **Shot 4** (Frame 1140 – 1320 \| 6s) | Nam quay lưng bước đi về phía ống kính dọc theo đường sàn phòng trọ. | Đi từ `[1060, 792]` tới `[560, 1040]` |
| `nguoikia_reach_shot4.webm` | **Shot 4** (Frame 1140 – 1320 \| 6s) | Cái bóng từ trong gương vươn cánh tay xuyên qua mặt kính, bàn tay úp chặt lên vai Nam. | `[1270, 760]` (Chân gương) |

---

## 5. Hướng dẫn Lồng ghép vào Code Remotion

Khi đã có file `.webm`, chỉ cần import component [`Character3DOverlay`](../../../../what-if-studio/src/episodes/ho-so-02-nguoi-lam-thay/Character3DOverlay.tsx) vào bất kỳ shot nào:

```tsx
import { Character3DOverlay } from './Character3DOverlay';

// Ví dụ lồng ghép nhân vật Nam bước đi ở Shot 4:
<Character3DOverlay
  src="ho-so-02-nguoi-lam-thay/characters-3d-alpha/nam_walk_shot4.webm"
  x={feet.x}
  y={feet.y}
  scale={ns}
  shadow={{ rx: 90, ry: 25, blur: 12, opacity: 0.7 }}
  fallback={<StudentTwinBody {...LOOK} ... />} // Tự động hiển thị nếu chưa có video 3D!
/>
```

### Ưu điểm của cơ chế Fallback:
Toàn bộ mã nguồn video của bạn **không bao giờ bị gãy hay màn hình đen**. Khi chưa có file 3D, hệ thống tự động render nhân vật 2.5D SVG hiện tại. Khi bạn copy file `.webm` vào thư mục, Remotion sẽ tự động chuyển sang phát clip 3D chất lượng cao ngay lập tức!
