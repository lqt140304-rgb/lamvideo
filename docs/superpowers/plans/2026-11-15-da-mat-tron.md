# Da mặt trơn một màu — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mặt nữ có da một màu trơn, má hồng mềm và chuyển màu dần sang texture ở cổ. Hết mảng gồ quanh hốc mắt và nét tối dưới mày.

**Architecture:** Hai thuộc tính đỉnh float trên `Nu_Than` (`mat_tron`, `ma_hong`) được đọc bằng node Attribute trong vật liệu da. Shader trộn texture gốc với màu da trơn, rồi trộn thêm má hồng. Mọi thứ dựng trong `mat_nu.py`, gọi từ `rig_nu.py`. Kiểm thêm trong `kiem_rig_nu.py`.

**Tech Stack:** Blender 5.2.3 bpy/bmesh/numpy, chạy nền.

**Spec:** `docs/superpowers/specs/2026-11-15-da-mat-tron-design.md`

## Global Constraints
- Không sửa texture gốc, không đổi UV thân, không đụng miệng/rig.
- `mat_tron` = 1 ở mặt và mặt sau đầu, chuyển về 0 trong khoảng z 1,60 → 1,30 m.
- Màu da trơn = trung vị màu texture ở vùng da trán.
- Mỗi lượt chạy đủ 39 kiểm cũ cộng kiểm mới, tất cả đều PASS.
- Lệnh (chạy trong `assets/nhan-vat-3d/nhan-vat-nu-rig/`): dựng bằng `D:/blender/blender.exe -b --factory-startup --python rig_nu.py`; kiểm bằng `D:/blender/blender.exe -b nhan-vat-nu-rig.blend --python kiem_rig_nu.py`.

## Review Focus
- Cổ, khi quay 3/4: chuyển màu không thành vệt. Duyệt bằng ảnh `f_tex34` và ảnh toàn thân.
- Chớp mắt và nhìn lên sau khi làm trơn hốc: mí không hở. Bài `kiem_chop*` có sẵn đã phủ.
- Mí và mày: cùng màu da trơn, không còn vân mi cũ. Duyệt bằng ảnh cận.
- Miệng há A và MBP: màu quanh khe không đổi. Duyệt bằng ảnh `c_A`.
- Mở lại file đã lưu: thuộc tính còn trên mesh (kiểm chạy trên file đã lưu).

---

### Task 1: Thuộc tính và vật liệu da trơn

**Files:**
- Modify: `assets/nhan-vat-3d/nhan-vat-nu-rig/mat_nu.py`: thêm `da_mat_tron(body)`; gỡ phần tô UV dải mắt–mày và UV mí trong `_to_da_manh_vun`, giữ tô mảnh mày trong `dung_may`.
- Modify: `assets/nhan-vat-3d/nhan-vat-nu-rig/rig_nu.py`: gọi `mat_nu.da_mat_tron(body)` sau `dung_shape_key_mieng`.
- Test: `assets/nhan-vat-3d/nhan-vat-nu-rig/kiem_rig_nu.py`: thêm `kiem_da_mat_tron`.

**Interfaces:** Produces `da_mat_tron(body) -> None`. Hàm tạo thuộc tính POINT FLOAT `mat_tron`, `ma_hong` và nối chúng vào vật liệu da của thân. Mí (`Nu_MiTren/Duoi.*`) dùng chung vật liệu này, gán `mat_tron` = 1.

- [ ] **Step 1: Viết kiểm (phải FAIL)**

```python
def kiem_da_mat_tron():
    a = BODY.data.attributes
    assert 'mat_tron' in a and 'ma_hong' in a, 'thiếu thuộc tính da trơn'
    w = np.array([d.value for d in a['mat_tron'].data]); z = np.array([v.co.z for v in BODY.data.vertices])
    assert w[z > 1.62].min() > 0.99 and w[z < 1.28].max() < 0.01, 'dải chuyển màu sai'
    nt = BODY.data.materials[0].node_tree
    assert any(n.type == 'ATTRIBUTE' and n.attribute_name == 'mat_tron' for n in nt.nodes), 'vật liệu chưa trộn mat_tron'
```

- [ ] **Step 2:** Dựng rồi chạy kiểm. Kỳ vọng: `FAIL kiem_da_mat_tron: thiếu thuộc tính da trơn`.
- [ ] **Step 3: Viết `da_mat_tron`.**
  - `mat_tron` = smoothstep(1.30, 1.60, z).
  - `ma_hong` = smoothstep theo khoảng cách tới hai điểm má (±0.075, −0.17, 1.40), bán kính 0.035 → 0.0.
  - Màu trơn lấy bằng `anh_diffuse` + `mau_mat_luoi` trên các mặt da trán.
  - Node: Attribute → Mix(texture, màu trơn) → Mix(…, màu hồng theo `ma_hong` × 0.35) → Base Color.
- [ ] **Step 4:** Dựng và chạy kiểm. Kỳ vọng: `KET QUA: 40/40 PASS`.
- [ ] **Step 5:** Chụp `mat2.py` và `can.py`, ghép bảng, xem vùng cổ và má.
- [ ] **Step 6:** Commit `mat_nu.py rig_nu.py kiem_rig_nu.py nhan-vat-nu-rig.blend`.

### Task 2: Hốc mắt trơn và nét dưới mày

**Files:**
- Modify: `assets/nhan-vat-3d/nhan-vat-nu-rig/mat_nu.py`, trong `la_phang_quanh_mat`: làm trơn mạnh các vòng 2–4 tính từ viền hốc; vòng 1 (viền) vẫn ghim.

**Interfaces:** Consumes Task 1 (ảnh duyệt dùng màu mới).

- [ ] **Step 1:** Trong `la_phang_quanh_mat`, tập đỉnh cách viền hốc 1–4 vòng chạy thêm 20 lượt Laplace λ=0.5, rồi mới tới bước gọt đỉnh hiện có.
- [ ] **Step 2:** Dựng và chạy kiểm. Kỳ vọng: 40/40 PASS, trong đó có `kiem_chop*` và `kiem_mat_doi_xung`.
- [ ] **Step 3:** Chụp ảnh đất sét 3/4, xem mảng gồ quanh hốc. Nếu vẫn thấy nét tối dưới đầu mày, gọt đỉnh trong hộp mày có độ lệch so với trung bình láng giềng > 1 mm.
- [ ] **Step 4:** Cập nhật README (bảng object và mục Giới hạn: da mặt, mắt). Commit và push nhánh.
