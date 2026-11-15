# Giọng nhân vật Hồ sơ 02 — Kế hoạch thực hiện

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mỗi câu thoại trong bản chính của Hồ sơ 02 có một file mp3 riêng theo mã cue, đọc bằng giọng ElevenLabs đã chốt cho từng vai.

**Architecture:** Một script trích lời từ kịch bản chính ra JSON (rà tay sau khi trích). Một script TTS đọc từng cue, mỗi cue gọi API một lần, có cache theo hash nên chạy lại không tốn credit. Có hai chế độ: chạy bộ thử giọng và chạy toàn bộ.

**Tech Stack:** Python 3 (`py`), stdlib + numpy, helper `wi.py` có sẵn (key, `api`, `spent_since`, `log_cost`), ElevenLabs `eleven_v4`.

**Spec:** `docs/superpowers/specs/2026-11-15-giong-nhan-vat-ho-so-02-design.md`

## Global Constraints

- Nguồn lời duy nhất: `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/KICH-BAN-15P-HOAN-CHINH.md`. Không dùng lời trong `VOICEOVER-CUE-SHEET.md` cũ.
- Model `eleven_v4`, `output_format=mp3_44100_128`. Không cắt khoảng lặng, không hậu kỳ.
- Slug `ho-so-02-nguoi-lam-thay`. Bản đọc thật ghi vào `what-if-studio/public/ho-so-02-nguoi-lam-thay/thoai/`, bản thử giọng ghi vào `what-if-studio/out/ho-so-02-nguoi-lam-thay/thu-giong/`. Không commit audio.
- Không dùng giọng nhân bản `HXqqNj3PDxRdHVH1pXog` nếu chủ repo không bảo.
- Nếu API từ chối giọng hoặc model, dừng lại và báo. Không tự đổi model.
- Chỉ gọi API trả phí ở Task 3 (thử giọng, khoảng 3.600 credit) và Task 4 (toàn bộ, sau khi chủ repo chốt giọng).
- Script chạy từ thư mục `what-if-studio/` (đây là yêu cầu của `wi.py`).

## Review Focus

- Câu thoại không ghi nhãn vai (vd. "Nam nhăn mặt bực bội:" rồi đến `> Lại rung…`) phải được gán đúng vai, không được rơi mất. Test: `test_trich_dong_khong_nhan`.
- Dòng `>` là chỉ dẫn hoặc ghi chú (bắt đầu bằng `> *` hoặc `> **`) không được tính là thoại. Test: `test_bo_qua_ghi_chu`.
- Chạy lại khi lời không đổi thì không gọi API. Test: `test_cache_khong_goi_lai`.
- Sửa lời một cue thì chỉ cue đó được tạo lại. Test: `test_doi_loi_chi_tao_lai_cue_do`.
- Lỗi API giữa chừng không được xoá file của các cue đã đọc xong. Mỗi cue ghi file ngay khi đọc xong, cache ghi sau file. Test: `test_loi_giua_chung_giu_file_cu`.

---

### Task 1: Trích cue từ kịch bản chính

**Files:**
- Create: `.claude/skills/what-if-animation/scripts/trich_thoai.py`
- Create: `.claude/skills/what-if-animation/scripts/test_thoai.py`
- Create: `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/thoai-cue.json`

**Interfaces:**
- Produces: `trich(md: str) -> list[dict]`, mỗi phần tử có dạng `{"id": "C1.1_NAM_01", "vai": "NAM", "cam_xuc": "ngái ngủ, giọng cáu bẳn", "loi": "...", "canh": "1.1"}`.
- Quy tắc đặt id: `C<số cảnh>_<VAI_KHÔNG_DẤU>_<stt 2 chữ số trong cảnh>`. Vai không dấu: `NAM`, `NGUOI_KIA`, `TUNG`, `GIANG_VIEN`, `ME`…
- CLI: `py ../.claude/skills/what-if-animation/scripts/trich_thoai.py` ghi `thoai-cue.json` (UTF-8, `ensure_ascii=False`).

- [ ] **Step 1: Viết test** trong `test_thoai.py` (chạy được bằng `py -m pytest` hoặc `py test_thoai.py` có assert):
  - `test_trich_co_nhan`: input `### CẢNH 1.1: X\n**NAM [ngái ngủ]:**\n> Câu một.\n> Câu hai.` cho ra 1 cue, `vai=="NAM"`, `cam_xuc=="ngái ngủ"`, `loi=="Câu một. Câu hai."`, `id=="C1.1_NAM_01"`.
  - `test_trich_dong_khong_nhan`: `Nam nhăn mặt bực bội:\n> Lại rung, điếc cả tai!` (đang ở cảnh 1.1) cho ra một cue `vai=="NAM"`, `cam_xuc=="bực bội"`.
  - `test_bo_qua_ghi_chu`: các dòng `> **Vũ trụ:** …` và `> * **Sound Bridge** …` cho ra 0 cue.
- [ ] **Step 2: Chạy test**, phải FAIL.
- [ ] **Step 3: Viết `trich`.** Quét từng dòng. Lưu `canh` từ `### CẢNH n.m`. Vai và cảm xúc lấy từ `**VAI [tag]:**`, hoặc từ dòng văn kết thúc bằng `:` mà mở đầu bằng tên vai đã biết (Nam, Người Kia, Tùng, Giảng viên, Mẹ). Các dòng `> ` liên tiếp gộp thành một cue. Các khối `**[CÚ SHOT…]**` và tiêu đề in hoa không phải tên vai thì đặt lại vai về None. Dòng `>` lúc vai là None thì bỏ qua và in cảnh báo kèm số dòng.
- [ ] **Step 4: Chạy test**, phải PASS.
- [ ] **Step 5: Chạy CLI và rà tay.** In tổng số cue và số ký tự theo vai. Mở từng cảnh báo "bỏ qua" và từng cue, đối chiếu với kịch bản. Sửa tay trong JSON những cue gán sai vai, gồm cả lời của Mẹ và Bác Hai nằm trong đoạn văn, nếu có. Kết quả: mọi câu có ngoặc thoại trong kịch bản đều có cue.
- [ ] **Step 6: Commit** gồm `trich_thoai.py`, `test_thoai.py`, `thoai-cue.json`.

### Task 2: Script TTS theo cue có cache

**Files:**
- Create: `.claude/skills/what-if-animation/scripts/voice_cues.py`
- Modify: `.claude/skills/what-if-animation/scripts/test_thoai.py`

**Interfaces:**
- Consumes: `wi.api`, `wi.spent_since`, `wi.log_cost`, `wi.load_json`, `wi.save_json`.
- Produces:
  - `doc(cues: list[dict], giong: dict[str, dict], thu_muc: Path, goi=wi.api) -> dict`. `giong[vai] = {"id": str, "settings": dict}`. Hàm trả về manifest `{cue_id: {"file": str, "sig": str, "giay": float}}`.
  - `sig(cue, g) = sha1(json [loi, cam_xuc, g, "eleven_v4"])[:12]`.
  - Thư mục có `manifest.json`. Cue nào có `sig` trùng và file còn trên đĩa thì bỏ qua.
  - Văn bản gửi lên API: `"[<cam_xuc>] <loi>"` nếu có cảm xúc, còn không thì chỉ `loi`.
- CLI:
  - `py ../.claude/skills/what-if-animation/scripts/voice_cues.py ho-so-02-nguoi-lam-thay --thu`: đọc `thu-giong.json` (danh sách `{vai_thu, giong_id, ten, cue_ids, settings}`), ghi vào `out/<slug>/thu-giong/<ten>/<cue>.mp3`.
  - `... --that`: đọc `giong-chot.json` (`{vai: {id, settings}}`) cùng `thoai-cue.json`, ghi vào `public/<slug>/thoai/`.
  - Cả hai chế độ in số ký tự trước khi gọi API, và gọi `log_cost` sau khi chạy.

- [ ] **Step 1: Viết test** với `goi` giả (đếm số lần gọi, trả về JSON có `audio_base64`):
  - `test_cache_khong_goi_lai`: gọi `doc` 2 lần cùng input thì `goi` chỉ chạy `len(cues)` lần.
  - `test_doi_loi_chi_tao_lai_cue_do`: sửa `loi` của 1 cue trong 3 cue rồi chạy lại, `goi` chạy thêm đúng 1 lần.
  - `test_loi_giua_chung_giu_file_cu`: `goi` báo lỗi ở cue thứ 2 thì file cue 1 vẫn còn, và manifest có cue 1.
- [ ] **Step 2: Chạy test**, phải FAIL.
- [ ] **Step 3: Viết `voice_cues.py`.** Gọi `/v1/text-to-speech/{id}?output_format=mp3_44100_128` với body `{text, model_id: "eleven_v4", voice_settings}`. Endpoint này trả mp3 thô. Lưu ý: `wi.api` trả bytes, nên ghi thẳng ra file. Đọc xong cue nào thì ghi manifest ngay sau cue đó. Đo độ dài bằng `wi.decode`.
- [ ] **Step 4: Chạy test**, phải PASS.
- [ ] **Step 5: Commit** gồm `voice_cues.py` và `test_thoai.py`.

### Task 3: Thử giọng (trả phí, khoảng 3.600 credit)

**Files:**
- Create: `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/thu-giong.json`

- [ ] **Step 1: Chọn 3 cue cho mỗi vai** từ `thoai-cue.json`: một câu bình thường, một câu cảm xúc mạnh, một câu thì thầm hoặc hét. Tổng ký tự mỗi bộ không quá khoảng 300.
- [ ] **Step 2: Viết `thu-giong.json`** với 12 bộ:
  - Nam: `6adFm46eyy74snVn6YrT` (Nhật Phong), `RxhjHDfpO54FYotYtKpw` (Phong), `njal9ZYZB2BSvEp2g2Fe` (Cuong Nguyen), settings `{stability 0.4, similarity_boost 0.75}`.
  - Người Kia: cùng 3 giọng của Nam, `{stability 0.85, similarity_boost 0.9}`.
  - Tùng: cùng 3 giọng đó, `{stability 0.55, similarity_boost 0.8}`.
  - Giảng viên: `BUPPIXeDaJWBz696iXRS` (Viet Dung), `DTLhW2kDOWq9IAPipCcu` (ONG THAY HUNG), `ZsjEJaLQy3sgvwxicmDx` (Quang Toan), `{stability 0.75, similarity_boost 0.85}`.
- [ ] **Step 3: Gọi thử 1 cue** với giọng đầu tiên để kiểm tra v4 có nhận giọng professional không. Nếu bị từ chối thì dừng và báo chủ repo.
- [ ] **Step 4: Chạy `--thu`.** Gửi chủ repo danh sách file theo vai và giọng, kèm credit thực tế đã dùng. Hỏi chủ repo nghe câu có thẻ cảm xúc xem v4 đọc thẻ thành chữ hay hiểu đúng.
- [ ] **Step 5: Chủ repo chốt giọng.** Ghi `giong-chot.json`. Ghi chi phí vào `GHI-CHU.md` hoặc `ASSET.md` của tập. Commit 2 file JSON cùng ghi chú.

### Task 4: Đọc 1 lượt toàn bộ (trả phí, chỉ chạy sau khi chủ repo chốt)

**Files:**
- Modify: `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/VOICEOVER-CUE-SHEET.md` (thay bằng bảng sinh từ `thoai-cue.json` kèm voice đã chốt)
- Modify: `episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/ASSET.md` (đường dẫn `public/ho-so-02-nguoi-lam-thay/thoai/`, chi phí)

- [ ] **Step 1: In tổng ký tự** của toàn bộ cue và đối chiếu với số credit còn lại. Nếu tổng vượt 20.000 thì báo chủ repo trước khi chạy.
- [ ] **Step 2: Chạy `--that`.** Kiểm tra: số file mp3 bằng số cue, không có file nào 0 byte, `manifest.json` đủ id.
- [ ] **Step 3: Chạy lại `--that`.** Kết quả mong đợi là 0 lần gọi API và không tốn credit.
- [ ] **Step 4: Cập nhật cue sheet và ASSET,** ghi credit thực tế. Commit các file md và json (không commit mp3). Push nhánh.
