# Bản giao việc: làm MẶT cho NAM-003

Dán nguyên mục "Prompt" cho phiên/bên làm mặt. Bản rig thân (`nam-003-rig.blend`) là **v3** (15/11/2026): khuỷu, gối, cổ chân đã chọn bằng đo; cổ có xương phụ `NeckBlend1/2` và Corrective Smooth `CorrectiveSmoothCo` (nhóm `cs_co`, tắt từ z 1,61). **Xương `Head` và trọng số đầu (z ≥ 1,60) không đổi** so với v1 nên script làm mặt chạy lại được trên v3; nên chạy lại script mặt trên file mới và kiểm shape key miệng/cằm không bị `CorrectiveSmoothCo` làm mềm.

## Prompt

```
Việc: làm mắt, lông mày, miệng, biểu cảm và khẩu hình cho nhân vật NAM-003, trong Blender 5.2.x, dưới dạng SCRIPT chạy lại được trên file rig.

Đọc trước (repo lamvideo, thư mục assets/nhan-vat-3d/):
- nam-003/README.md và nam-003/nam-003-rig.blend (đầu vào: lưới Nam_Body 44.629 đỉnh, armature Nam_Rig 57 xương tên Mixamo, bàn tay 4 ngón).
- nam-002/ (hệ mặt đã làm xong cho một nhân vật khác, dùng làm MẪU CÁCH LÀM, không copy mù quáng): mat_nam002.py (mắt 3D, hốc, mí, viền, mày), bieu_cam_nam002.py (shape key, driver, biểu cảm, khẩu hình), clip_thu_nam002.py (đoạn thử 4 giây), bien_the_nam002.py (biến thể: mày, mống mắt, nốt ruồi, viền mắt/miệng).

Nhân vật: người lớn 18–20 tuổi, đầu trọc, mặt hiện chỉ có hốc mắt nông, sống mũi, tai; KHÔNG có mắt, mày, môi, miệng. Hệ toạ độ mét, Z lên, mặt hướng −Y, trái nhân vật là +X. Mô hình gốc cao 1,824 m; sau này scale object Nam_Rig về 1,60 m (Nam, Người Kia) hoặc 1,70 m (Tùng), nên mọi thứ phải con của Nam_Rig và không bake scale.

Phải có:
1. Mắt 3D (nhãn cầu, mống mắt, đồng tử, mí trên/dưới), chớp mắt, liếc theo xương `nhin`, nhắm/mở to. Kiểu mắt phải là THAM SỐ (rộng, cao, nghiêng, độ dày viền) để Nam, Người Kia và Tùng khác nhau.
2. Lông mày 3D (độ dày, hình dạng là tham số) với shape key nhướn, hạ, cau, buồn, nhướn riêng từng bên.
3. MIỆNG THẬT: môi, khoang miệng, răng và lưỡi (đủ để nhìn thấy khi há), không chỉ hình vẽ lên da. Khẩu hình tiếng Việt: a, e, i, o, u, m/b/p, và các phụ âm còn lại; cười, méo, mím.
4. Tên thuộc tính trên xương `Head` GIỮ ĐÚNG như nam-002 để dùng lại clip_thu và bien_the: may_nhuong, may_ha, may_cau, may_buon, may_trai_nhuong, may_phai_nhuong, mieng_ha, mieng_hep, mieng_rong, cuoi, meu, mieng_khep, chop_mat, chop_trai, chop_phai, mo_to. Xương `nhin` điều khiển hướng nhìn.
5. Hàm dung_bieu_cam(arm, ten) và dung_viseme(arm, ten) như nam-002 (mac_dinh, ngac_nhien, tuc_gian, buon, vui, nghi_ngo, so_hai, mo_mang).

Ràng buộc (quan trọng):
- KHÔNG thêm/xoá/sắp xếp lại đỉnh của Nam_Body ngoài việc khoét hốc/miệng; nếu cần khoét, làm SAU bước gán trọng số (bài học ở nam-002: khoét trước làm bone heat cho trọng số chân sai).
- Mọi bộ phận mặt gắn vào xương Head (cha là Nam_Rig, trọng số 100% Head), tối đa 4 xương trên mỗi đỉnh. Không đụng tới trọng số thân, cổ, vai, háng.
- Chạy được lại trên bản rig sẽ cập nhật: toàn bộ việc làm mặt nằm trong script (vd rig_mat_nam003.py), nhận --in nam-003-rig.blend --out ...; không sửa tay trong file .blend rồi coi là xong.
- Không dùng dịch vụ trả phí (Hyper3D, ElevenLabs…) khi chưa hỏi chủ repo.
- Không commit .blend nặng (>50 MB), ảnh render nặng, hay cache.

Kiểm tra bắt buộc, báo bằng số và ảnh, nêu rõ cái gì chưa kiểm:
- Cận mặt các biểu cảm và khẩu hình, từ chính diện và 3/4, ở cả hai chiều cao 1,60 m và 1,70 m.
- Quay đầu ±35° và cúi đầu: mắt, mày, miệng đi theo đầu, không lòi lưới, không xuyên da.
- Chớp mắt, liếc, há miệng to: không lộ khe, không xuyên mí/môi.
- Đoạn thử ngắn như clip_thu_nam002.py (khoảng 96 khung, ảnh thấp mẫu là đủ).
- Số xương tối đa 4/đỉnh; chạy lại script từ đầu ra cùng kết quả.

Kết quả bàn giao: script + README ngắn trong assets/nhan-vat-3d/nam-003/, ảnh xem trước nhỏ (webp), danh sách việc chưa làm và lỗi còn. Chỉ push nhánh làm việc của phiên, không push main trừ khi chủ repo bảo.
```
