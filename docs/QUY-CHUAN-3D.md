# Quy Chuẩn Sản Xuất Phim Hoạt Hình 3D (Full 3D Pipeline)

**Cập nhật định hướng ngày 12/11/2026:** Chủ repo chính thức quyết định chuyển đổi phương thức sản xuất từ **2D/2.5D SVG** sang **Nhân vật 3D & Bối cảnh 3D (Full 3D Characters & 3D Environments)** cho series *The Crack in Reality* (bắt đầu triển khai chuẩn hóa từ Hồ sơ 02: *Người trong gương*).

> **Vai trò của bộ Asset 2D hiện có:** Toàn bộ hình ảnh, rig SVG/TSX theo phong cách Style B (`nhan-vat.svg`, `boi-canh.png`, `bo-sung-15p/`, `opening.tsx`) **được giữ nguyên làm bản Concept Art, Turnaround Model Sheet, Color Script và Animatic tham chiếu** để đội ngũ dựng 3D bám sát tạo hình, tỷ lệ và ý đồ đạo diễn.

---

## 1. Phong cách Mỹ thuật 3D (Stylized 3D Lookdev & Shading)

Không đi theo hướng tả thực cực đoan (Hyper-realistic) dễ gây hiệu ứng "thung lũng kỳ quặc" (Uncanny Valley) hoặc nặng chi phí render. Phong cách 3D của dự án tuân thủ triết lý **Stylized 3D Cinema**:

1. **Giữ trọn tinh thần tạo hình Style B:**
   - Hình khối nhân vật tròn đầy, đường cong mềm mại, vai–hông–đùi liền mạch.
   - Gương mặt tối giản, biểu cảm rõ nét qua mắt, mí, lông mày và miệng — ưu tiên khả năng đọc tâm lý rõ ràng ngay cả trên màn hình điện thoại.
   - Thiết kế tay chân tối giản: Lòng bàn tay đầy đặn, ngón cái tách rõ để cầm nắm đạo cụ, chân có khối gót–mu–mũi vững chãi bám sàn.
2. **Shader & Vật liệu (Materials & Textures):**
   - Áp dụng **Soft Stylized PBR** (hoặc **Painted/Toon Cel-Shaded 3D** có Smooth Normal) với Roughness cao (bề mặt lì mịn, ít phản xạ nhựa bóng loáng), thêm Subtle Subsurface Scattering (SSS) nhẹ cho vùng da và tai để có độ sống của tế bào thực.
   - Bối cảnh sử dụng vật liệu có chất cảm đời sống Việt Nam (tường vôi ẩm loang lổ nhẹ, gỗ ép bàn học hơi sờn, vải nệm cotton, kim loại rỉ nhẹ ở then cửa).
3. **Ánh sáng Vật lý Chiaroscuro (Real 3D Motivated Lighting):**
   - Thay thế hoàn toàn bóng đổ vẽ tay 2D bằng **nguồn sáng 3D vật lý thực tế** (Area Light từ khe cửa sổ, Spot Light từ đèn bàn học 3200K, Screen Light Emission xanh lạnh 6500K từ màn hình laptop/điện thoại).
   - Bóng đổ mềm (Soft Area Shadows) và ánh sáng hắt (Global Illumination / Indirect Bounce Light) phản ánh trung thực không khí ngột ngạt kiểu David Fincher & A24.

---

## 2. Quy chuẩn Nhân vật 3D (3D Characters & Rigging)

### A. Dựng hình (Modeling & Topology)
- **Tỷ lệ chuẩn (Proportions):** Bám sát tỷ lệ nhân vật đã chốt trong [nhan-vat.svg](../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/assets/nhan-vat.svg) và [THIET-KE-NHAN-VAT.md](../episodes/hem-co-chuyen/THIET-KE-NHAN-VAT.md).
- **Topology sạch cho Animation:** Lưới quad phân bố đều ở các khớp (vai, khuỷu, cổ tay, hông, đầu gối) và vòng lưới mặt (Facial Edge Loops) quanh mắt và miệng để biến dạng mượt khi diễn xuất.
- **Đặc điểm nhận diện sinh học bất di bất dịch (Continuity):**
  - **Nam:** Nốt ruồi sát đuôi lông mày **bên trái** (theo góc nhìn trực diện).
  - **Người Kia (Bản sao):** Cấu trúc lưới giống hệt Nam nhưng nốt ruồi đặt đối xứng sang **bên phải** và mọi thao tác diễn hoạt phải thực hiện **thuận tay trái** (rửa bát, nhận thẻ, đỡ búa, gài then sắt).

### B. Rigging & Animation 3D
- **Khung xương (Armature Rig):** Hỗ trợ chuyển đổi mượt mà **IK/FK** (Inverse Kinematics / Forward Kinematics) cho tay và chân.
- **Ràng buộc tiếp xúc vật lý (Contact Constraints & Collision):**
  - Chân nhân vật có khóa mặt sàn (Floor Contact), không trượt băng khi bước đi.
  - Tay cầm nắm đạo cụ (búa đinh, điện thoại, thẻ căn cước, bát sứ, đũa) dùng hệ **Child-Of / Bone Constraint** để gắn chặt vào lòng bàn tay, có trọng lượng rõ ràng khi nhấc lên hoặc buông rơi.
- **Bộ biểu cảm khuôn mặt (Facial Rig & Blendshapes / Shape Keys):**
  - Dựng sẵn tối thiểu **18 Shape Keys cảm xúc 3 cấp độ** theo thư viện đã duyệt (`ngai_ngu`, `kiet_suc`, `tu_ai`, `toi_loi`, `buong_xuoi`, `cuoi_che_giau`, `calm`, `eerie_smirk`...).
  - Hệ thống **Visemes (Lip-sync)** khớp âm vị tiếng Việt tự động hoặc bán tự động đồng bộ 100% với bản audio ElevenLabs.

---

## 3. Quy chuẩn Bối cảnh 3D & Chiếc Gương (3D Sets & Mirror Portal)

- **Kích thước thực tế (Real-world Scale):** 1 Blender Unit = 1 Mét ($1\text{m}$). Phòng trọ $12\text{m}^2$ ($3\text{m} \times 4\text{m}$, trần cao $2.8\text{m}$), cửa chính tiêu chuẩn $0.85\text{m} \times 2.1\text{m}$.
- **Không gian khép kín đa góc (360° Environments):** Dựng đầy đủ cả 4 bức tường, trần nhà và ngoại cảnh lân cận ngoài cửa sổ/hành lang để camera 3D tự do xoay chuyển, góc trần nhìn xuống (Top-down $90^\circ$) hoặc góc thấp (Low-angle) mà không bao giờ bị hở nền.
- **Kỹ xảo Chiếc gương 3D (The Mirror Portal):**
  - Sử dụng **Planar Reflection Shader / Dual-Scene Render Target** trong không gian 3D: Cho phép mặt gương phản chiếu chính xác căn phòng theo quy luật quang học, nhưng có thể **tách rời kiểm soát hành động của bóng phản chiếu (Người Kia)** độc lập với Nam.
  - **Hiệu ứng mặt kính hóa nước (Liquid Glass Transition):** Sử dụng Displacement Map gợn sóng đồng tâm + Shader khúc xạ (IOR 1.33 - 1.50) kết hợp Chromatic Aberration nhẹ ở Phần 3.

---

## 4. Camera Điện Ảnh 3D & Hậu Kỳ (True 3D Camera & Post-Processing)

Khi chuyển sang 3D, toàn bộ hệ thống máy quay mô tả trong [DUNG-CANH.md](../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/DUNG-CANH.md) được thực thi bằng **Camera 3D vật lý thật**:

- **Thông số cảm biến & Ống kính:** Virtual Sensor Size `36mm Full-Frame`, tỷ lệ khung hình **2.39:1 Anamorphic**. Hỗ trợ đầy đủ dải ống kính Cine Primes (24mm, 35mm, 50mm f/1.4, 85mm f/1.2) với **Depth of Field (Bokeh vật lý)** và Rack Focus động theo khoảng cách vật thể.
- **Hitchcock Vertigo Dolly Zoom thật:** Keyframe đồng thời Camera Position lùi dọc hướng nhìn của máy và Camera Focal Length phóng từ `35mm` lên `85mm` (biến dạng phối cảnh 3D thật sự).
- **Handheld Breathing Camera:** Gắn Noise Modifier (`0.2Hz` tần số, biên độ góc quay vi mô `0.05° - 0.15°`) vào Rig Camera để tạo cảm giác người quay phim cầm tay chân thực.
- **Lớp phủ hòa sắc điện ảnh (Compositing):** Render qua Blender Compositor hoặc chèn qua `CinematicGradeOverlay` trong Remotion để giữ tone màu nhất quán (`fincher_night`, `morning`, `mirror_realm`), hạt phim 35mm và Anamorphic Vignette.

---

## 5. Lộ Trình Tích Hợp Kỹ Thuật (Production Pipeline Options)

Quá trình dựng 3D có thể triển khai theo hai luồng kỹ thuật song song hoặc kết hợp với **Remotion Studio** hiện tại:

1. **Luồng Blender Master Render $\to$ Remotion Compositor (Khuyên dùng cho phim điện ảnh 15 phút):**
   - Dựng mô hình, rig nhân vật, setup ánh sáng Chiaroscuro, animate nhân vật và camera 3D hoàn chỉnh trong **Blender (Eevee Next / Cycles)**.
   - Xuất Render Pass (PNG Sequence / OpenEXR 16-bit hoặc ProRes).
   - Đưa vào **Remotion (`what-if-studio`)** để dựng timeline cuối cùng: Ghép audio lồng tiếng ElevenLabs chuẩn nhịp, trộn SFX/nhạc nền, chèn đồ họa UI màn hình điện thoại sắc nét và lớp `CinematicGradeOverlay`.
2. **Luồng Real-time WebGL trong Remotion (`@react-three/fiber` / `@remotion/three`):**
   - Export các mô hình 3D tối ưu dưới định dạng `.glb` / `.gltf` kèm Skeletal Animation & Blendshapes.
   - Load trực tiếp vào Remotion để điều khiển thông số camera, ánh sáng và đồng bộ chính xác từng frame bằng React code.

---

## 6. Nguồn hiện hành và tư liệu cũ

- Ảnh và mã asset cũ còn giữ để bảo toàn tạo hình; các Markdown hướng dẫn 2D/2,5D đã xóa theo yêu cầu chủ repo. Không dùng các file cũ làm API/pipeline sản xuất. Lịch sử đầy đủ vẫn tra được bằng Git.
- Khi một mô hình 3D, bối cảnh 3D hoặc cảnh quay 3D hoàn thành, tiến hành **đánh dấu tích `[x]` hoàn thành** vào bảng kiểm tra [CHECKLIST-TIEN-KY-ASSET.md](../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/CHECKLIST-TIEN-KY-ASSET.md).
