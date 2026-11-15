"""Màn hình UI điện thoại / laptop cho Hồ sơ 02, đúng câu chữ KICH-BAN-15P-HOAN-CHINH.md (15/11/2026).

Chạy:  /tmp/bpyenv/bin/python ui_man_hinh.py   (cần Pillow)  → ảnh PNG trong ./ui/ + bảng ghép ui/BANG-UI.png
Dùng cho: texture phát sáng màn hình điện thoại/laptop trong Blender (dao_cu_ban_moi.dien_thoai / laptop) và lớp phủ 2D trên Remotion.
Giao diện nhắn tin / portal / game là kiểu chung tự thiết kế, KHÔNG dùng logo hay nhận diện của ứng dụng thật.
Điện thoại 624×1040 (gấp đôi khung 312×520 của checklist), laptop 1920×1080.
"""
import os, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

DIR = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(DIR, 'ui'); FD = os.path.join(DIR, 'font')
W, H = 624, 1040


def F(size, bold=False, mono=False, tay=False):
    ten = 'PatrickHand-Regular.ttf' if tay else 'DejaVuSansMono.ttf' if mono else 'DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf'
    return ImageFont.truetype(os.path.join(FD, ten), size)


def wrap(d, text, font, w):
    out = []
    for para in text.split('\n'):
        line = ''
        for word in para.split(' '):
            t = (line + ' ' + word).strip()
            if d.textlength(t, font=font) <= w: line = t
            else: out.append(line); line = word
        out.append(line)
    return out


def khung(bg='#f2f3f5', gio='06:30', toi=False):
    im = Image.new('RGB', (W, H), bg); d = ImageDraw.Draw(im)
    mau = '#ffffff' if toi else '#1c1c1e'
    d.text((34, 18), gio, font=F(24, True), fill=mau)
    for i in range(4): d.rectangle((W - 150 + i * 9, 36 - i * 5, W - 144 + i * 9, 40), fill=mau)          # vạch sóng
    d.rounded_rectangle((W - 92, 22, W - 44, 42), 5, outline=mau, width=2); d.rectangle((W - 89, 25, W - 62, 39), fill=mau)  # pin 60 %
    d.ellipse((W / 2 - 9, 18, W / 2 + 9, 36), fill='#000000')                                             # camera trước
    return im, d


def avatar(d, x, y, r, mau, chu='', da='#e0b089'):
    d.ellipse((x - r, y - r, x + r, y + r), fill=mau)
    if chu: d.text((x, y), chu, font=F(int(r * 0.9), True), fill='#ffffff', anchor='mm')
    else:  # mặt cười tự vẽ (không ảnh người thật)
        d.ellipse((x - r * 0.55, y - r * 0.6, x + r * 0.55, y + r * 0.45), fill=da)
        d.ellipse((x - r * 0.6, y - r * 0.75, x + r * 0.6, y - r * 0.2), fill='#2b2420')
        d.ellipse((x - r * 0.25, y - r * 0.1, x - r * 0.12, y + r * 0.03), fill='#2b2420'); d.ellipse((x + r * 0.12, y - r * 0.1, x + r * 0.25, y + r * 0.03), fill='#2b2420')
        d.arc((x - r * 0.22, y, x + r * 0.22, y + r * 0.28), 20, 160, fill='#a0463c', width=max(2, int(r * 0.06)))
        d.pieslice((x - r * 0.9, y + r * 0.4, x + r * 0.9, y + r * 1.6), 180, 360, fill='#c9584a')


def bong_bong(d, x, y, text, ben='trai', ten=None, mau='#ffffff', mau_chu='#1c1c1e', w=430):
    f = F(25); lines = wrap(d, text, f, w - 40); h = 22 + 34 * len(lines) + (30 if ten else 0)
    x0 = x if ben == 'trai' else W - 24 - w
    d.rounded_rectangle((x0, y, x0 + w, y + h), 22, fill=mau)
    yy = y + 14
    if ten: d.text((x0 + 20, yy), ten, font=F(21, True), fill='#2f6fd6'); yy += 30
    for ln in lines: d.text((x0 + 20, yy), ln, font=f, fill=mau_chu); yy += 34
    return y + h + 18


# -------------------------------------------------------------------------------------------------- ĐIỆN THOẠI
def ui01_bao_thuc():
    """Cảnh 1.1: báo thức 06:30 reo + thông báo đỏ hạn nộp tiểu luận."""
    im, d = khung('#14161c', '06:30', toi=True)
    for i in range(H):  # nền chuyển sắc đêm → bình minh
        t = i / H; d.line((0, i, W, i), fill=(int(20 + 40 * t), int(22 + 25 * t), int(36 + 30 * t)))
    khung_d = ImageDraw.Draw(im); d = khung_d
    d.text((34, 18), '06:30', font=F(24, True), fill='#ffffff')
    d.text((W / 2, 200), 'Báo thức', font=F(30), fill='#c9cfe0', anchor='mm')
    d.text((W / 2, 320), '06:30', font=F(150, True), fill='#ffffff', anchor='mm')
    d.text((W / 2, 430), 'Thứ Năm, 13 tháng 11', font=F(28), fill='#c9cfe0', anchor='mm')
    # thông báo đỏ (master: "Hạn chót: 23:59 hôm nay — NỘP TIỂU LUẬN KINH TẾ CHÍNH TRỊ (CHƯA NỘP)")
    d.rounded_rectangle((24, 500, W - 24, 680), 26, fill='#c62828')
    d.text((50, 522), '⚠  Portal môn học · bây giờ', font=F(21, True), fill='#ffd7d7')
    yy = 560
    for ln in wrap(d, 'Hạn chót: 23:59 hôm nay — NỘP TIỂU LUẬN KINH TẾ CHÍNH TRỊ (CHƯA NỘP)', F(27, True), W - 100): d.text((50, yy), ln, font=F(27, True), fill='#ffffff'); yy += 36
    d.rounded_rectangle((60, 800, 290, 900), 50, fill='#3a3f4f'); d.text((175, 850), 'Báo lại', font=F(32, True), fill='#ffffff', anchor='mm')
    d.rounded_rectangle((334, 800, 564, 900), 50, fill='#ff9f0a'); d.text((449, 850), 'Dừng', font=F(32, True), fill='#1c1c1e', anchor='mm')
    for k in range(3): d.rounded_rectangle((6 + 4 * k, 6 + 4 * k, W - 6 - 4 * k, H - 6 - 4 * k), 40, outline=(255, 60 - 20 * k, 60 - 20 * k), width=3)  # viền rung đỏ
    return im


def _chat(tieu_de, phu, mau_dau='#2f6fd6', gio='19:42'):
    im, d = khung('#e6ecf3', gio)
    d.rectangle((0, 56, W, 150), fill=mau_dau)
    d.text((70, 76), '‹', font=F(48, True), fill='#ffffff'); d.text((110, 78), tieu_de, font=F(30, True), fill='#ffffff'); d.text((110, 116), phu, font=F(20), fill='#d8e6ff')
    d.rectangle((0, H - 96, W, H), fill='#ffffff'); d.rounded_rectangle((24, H - 78, W - 110, H - 22), 28, fill='#eef1f5')
    d.text((50, H - 50), 'Nhập tin nhắn…', font=F(23), fill='#9aa3ad', anchor='lm'); d.ellipse((W - 90, H - 80, W - 30, H - 20), fill=mau_dau); d.text((W - 60, H - 50), '➤', font=F(28, True), fill='#ffffff', anchor='mm')
    return im, d


def ui03_nhom_lop():
    """Cảnh 1.4: tin nhắn nhóm lớp khen bài tiểu luận (Người Kia viết)."""
    im, d = _chat('Nhóm KTCT · K66', '32 thành viên')
    y = 190
    d.text((W / 2, y), 'Hôm nay 19:30', font=F(19), fill='#7b8794', anchor='mm'); y += 34
    avatar(d, 54, y + 30, 26, '#8e5572', 'L'); y = bong_bong(d, 92, y, 'Mọi người nhớ nộp tiểu luận trước 23:59 nha', ten='Lan')
    avatar(d, 54, y + 30, 26, '#f6ae2d', 'T'); y = bong_bong(d, 92, y, 'U là trời Nam ơi! Đoạn phân tích thể chế kinh tế của ông đỉnh chóp luôn á, ông thầy duyệt qua khen nức nở trước lớp kìa!', ten='Trưởng nhóm')
    avatar(d, 54, y + 30, 26, '#44bba4', 'H'); y = bong_bong(d, 92, y, 'Ghê thật, Nam nay khác hẳn luôn', ten='Hùng')
    d.text((92, y - 6), '♥ 12   ★ 5', font=F(20), fill='#7b8794')
    return im


def ui08_trac_nghiem():
    """Cảnh 2.1: portal mở bài trắc nghiệm online 10 câu Kỹ năng Giao tiếp, hạn 12h trưa."""
    im, d = khung('#f4f6fa', '08:47')
    d.rectangle((0, 56, W, 160), fill='#1d3f74'); d.text((34, 76), 'PORTAL SINH VIÊN', font=F(26, True), fill='#ffffff'); d.text((34, 116), 'Bài kiểm tra trực tuyến', font=F(21), fill='#c8d7f0')
    d.rounded_rectangle((24, 186, W - 24, 330), 20, fill='#ffffff', outline='#d8dee8')
    d.text((48, 206), 'Kỹ năng Giao tiếp', font=F(30, True), fill='#1c1c1e'); d.text((48, 250), '10 câu · 15 phút', font=F(22), fill='#5a6472')
    d.text((48, 284), 'Hạn chót: 12:00 hôm nay', font=F(22, True), fill='#c62828')
    d.text((40, 360), 'Câu 1/10', font=F(22, True), fill='#2f6fd6')
    yy = 396
    for ln in wrap(d, 'Khi người khác đang trình bày ý kiến trái với mình, hành vi lắng nghe tích cực là:', F(26), W - 90): d.text((40, yy), ln, font=F(26), fill='#1c1c1e'); yy += 36
    yy += 16
    for k, s in enumerate(('A. Ngắt lời để phản bác ngay', 'B. Gật đầu, đặt câu hỏi làm rõ', 'C. Xem điện thoại cho đỡ chán', 'D. Im lặng rồi bỏ đi')):
        d.rounded_rectangle((32, yy, W - 32, yy + 76), 16, fill='#ffffff', outline='#d8dee8', width=2); d.ellipse((54, yy + 24, 82, yy + 52), outline='#9aa3ad', width=3)
        d.text((100, yy + 38), s, font=F(24), fill='#1c1c1e', anchor='lm'); yy += 92
    d.rounded_rectangle((32, H - 120, W - 32, H - 40), 20, fill='#2f6fd6'); d.text((W / 2, H - 80), 'Câu tiếp theo  →', font=F(28, True), fill='#ffffff', anchor='mm')
    return im


def ui09_game_thua():
    """Cảnh 2.1: Nam thua liền 3 ván game (game hư cấu, không nhận diện game thật)."""
    im = Image.new('RGB', (W, H), '#0e0a14'); d = ImageDraw.Draw(im)
    for r in range(420, 0, -6): d.ellipse((W / 2 - r, 330 - r, W / 2 + r, 330 + r), fill=(int(60 * (1 - r / 420)) + 14, 8, int(20 * (1 - r / 420)) + 14))
    d.text((W / 2, 300), 'THẤT BẠI', font=F(96, True), fill='#e63946', anchor='mm', stroke_width=4, stroke_fill='#3a0a0f')
    d.text((W / 2, 390), 'Thua 3 trận liên tiếp', font=F(30), fill='#e9c6c9', anchor='mm')
    d.rounded_rectangle((60, 470, W - 60, 700), 20, fill='#1c1526', outline='#3a2e4a', width=2)
    for k, (a, b) in enumerate((('Hạ gục', '2'), ('Bị hạ', '11'), ('Hỗ trợ', '4'), ('Hạng', '↓ Vàng IV'))):
        d.text((100, 500 + 48 * k), a, font=F(26), fill='#a99bbd'); d.text((W - 100, 500 + 48 * k), b, font=F(26, True), fill='#ffffff', anchor='ra')
    d.rounded_rectangle((60, 760, 290, 850), 16, fill='#2a2236'); d.text((175, 805), 'Thoát', font=F(28, True), fill='#cfc4dd', anchor='mm')
    d.rounded_rectangle((334, 760, 564, 850), 16, fill='#e63946'); d.text((449, 805), 'Chơi lại', font=F(28, True), fill='#ffffff', anchor='mm')
    d.text((34, 18), '09:12', font=F(24, True), fill='#ffffff')
    return im


def ui04_diem_lab402():
    """Cảnh 2.1 (cuối): tin nhắn portal 'Điểm thực hành Lab 402: 9.5' trên màn hình khoá lúc 19:45."""
    im, d = khung('#1b2230', '19:45', toi=True)
    d.text((W / 2, 230), '19:45', font=F(130, True), fill='#ffffff', anchor='mm'); d.text((W / 2, 330), 'Thứ Năm, 13 tháng 11', font=F(26), fill='#c9cfe0', anchor='mm')
    d.rounded_rectangle((24, 420, W - 24, 640), 26, fill='#f2f4f8')
    d.rounded_rectangle((48, 444, 92, 488), 10, fill='#1d3f74'); d.text((70, 466), 'P', font=F(26, True), fill='#ffffff', anchor='mm')
    d.text((108, 452), 'PORTAL SINH VIÊN · vừa xong', font=F(20, True), fill='#5a6472')
    d.text((48, 510), 'Điểm thực hành Lab 402: 9.5', font=F(32, True), fill='#1c1c1e')
    d.text((48, 560), 'Kỹ thuật Lập trình · Điểm cao nhất khoa', font=F(23), fill='#3a4452')
    d.text((48, 596), 'Chạm để xem chi tiết', font=F(20), fill='#7b8794')
    return im


def ui05_me_goi_video():
    """Cảnh 2.3: 'Mẹ yêu đang gọi video...'."""
    im = Image.new('RGB', (W, H)); d = ImageDraw.Draw(im)
    for i in range(H): t = i / H; d.line((0, i, W, i), fill=(int(40 + 30 * t), int(70 + 40 * t), int(120 + 30 * t)))
    d.text((34, 18), '22:16', font=F(24, True), fill='#ffffff')
    avatar(d, W / 2, 330, 120, '#f3d7c4', '', da='#e8b48e')
    d.text((W / 2, 510), 'Mẹ yêu', font=F(52, True), fill='#ffffff', anchor='mm')
    d.text((W / 2, 570), 'đang gọi video...', font=F(30), fill='#dce6f5', anchor='mm')
    for cx, mau, ky, nhan in ((170, '#e53935', '✕', 'Từ chối'), (454, '#43a047', '✆', 'Nghe máy')):
        d.ellipse((cx - 62, 820 - 62, cx + 62, 820 + 62), fill=mau); d.text((cx, 820), ky, font=F(56, True), fill='#ffffff', anchor='mm')
        d.text((cx, 920), nhan, font=F(24), fill='#ffffff', anchor='mm')
    return im


def ui06_ho_nguyen():
    """Chuyển cảnh 2.3→2.4: 08:30, nhóm họ hàng 'Bác Hai gửi 1 video vào nhóm Họ Nguyễn'. Ô video là khung tạm
    (ảnh tĩnh mâm cỗ giỗ vẽ đơn giản); clip thật dựng sau khi có nhân vật (Người Kia gắp TAY TRÁI, nốt ruồi PHẢI)."""
    im, d = _chat('Họ Nguyễn', '47 thành viên', '#2e7d5b', gio='08:30')
    y = 180; d.text((W / 2, y), 'Hôm nay 08:12', font=F(19), fill='#7b8794', anchor='mm'); y += 30
    avatar(d, 54, y + 30, 26, '#6d4c41', 'H'); d.text((92, y), 'Bác Hai', font=F(21, True), fill='#2e7d5b'); y += 32
    vx0, vy0, vx1, vy1 = 92, y, W - 30, y + 300
    d.rounded_rectangle((vx0, vy0, vx1, vy1), 18, fill='#5b3a2a')
    d.ellipse((vx0 + 40, vy0 + 120, vx1 - 40, vy1 + 60), fill='#b9b4ad'); d.ellipse((vx0 + 70, vy0 + 150, vx1 - 70, vy1 + 30), fill='#d9d4cc')  # mâm
    for k, (dx, dy, c) in enumerate(((-90, 190, '#f2f2ee'), (0, 175, '#e2a43b'), (90, 195, '#7c9a4e'), (-40, 230, '#c94f3a'), (60, 235, '#f0d27a'))):
        cx = (vx0 + vx1) / 2 + dx; d.ellipse((cx - 38, vy0 + dy - 22, cx + 38, vy0 + dy + 22), fill=c)
    d.ellipse(((vx0 + vx1) / 2 - 44, vy0 + 86, (vx0 + vx1) / 2 + 44, vy0 + 174), fill=(0, 0, 0)); d.polygon([((vx0 + vx1) / 2 - 14, vy0 + 106), ((vx0 + vx1) / 2 - 14, vy0 + 154), ((vx0 + vx1) / 2 + 26, vy0 + 130)], fill='#ffffff')
    d.text((vx1 - 16, vy1 - 16), '01:24', font=F(20, True), fill='#ffffff', anchor='rd')
    y = vy1 + 10; d.text((92, y), 'Giỗ ông nội, thằng Nam về phụ cả buổi', font=F(23), fill='#1c1c1e'); y += 50
    avatar(d, 54, y + 30, 26, '#c06c84', 'C'); y = bong_bong(d, 92, y, 'Cháu Nam ngoan quá, lễ phép chào cả họ', ten='Cô Út', w=440)
    avatar(d, 54, y + 30, 26, '#355c7d', 'B'); y = bong_bong(d, 92, y, 'Sinh viên gương mẫu nhà mình đây!', ten='Bác Ba', w=440)
    return im


# -------------------------------------------------------------------------------------------------- LAPTOP
def _cua_so(tieu_de, nen='#ffffff'):
    im = Image.new('RGB', (1920, 1080), '#2b5797'); d = ImageDraw.Draw(im)
    d.rectangle((0, 1040, 1920, 1080), fill='#1f2430')
    for k in range(6): d.rounded_rectangle((760 + 70 * k, 1046, 806 + 70 * k, 1074), 6, fill='#3a4152')
    d.text((1880, 1060), '19:30', font=F(18), fill='#ffffff', anchor='rm')
    d.rectangle((40, 30, 1880, 1020), fill=nen); d.rectangle((40, 30, 1880, 70), fill='#e9ecf1'); d.text((60, 50), tieu_de, font=F(18), fill='#333', anchor='lm')
    for k, c in enumerate(('#ff5f57', '#febc2e', '#28c840')): d.ellipse((1800 + 24 * k, 42, 1816 + 24 * k, 58), fill=c)
    return im, d


def ui07_word_tieu_luan():
    """Cảnh 1.4: tiểu luận Kinh tế Chính trị (15 trang) + thông báo 'Đã nộp bài lên portal môn học lúc 19:30'."""
    im, d = _cua_so('Tieu_luan_KTCT_Nguyen_Van_Nam.docx — Trình soạn thảo văn bản', '#e3e6ea')
    d.rectangle((40, 70, 1880, 160), fill='#f6f7f9')
    for k, s in enumerate(('Tệp', 'Trang chủ', 'Chèn', 'Bố cục', 'Tham chiếu', 'Xem lại')): d.text((70 + 130 * k, 92), s, font=F(18), fill='#333')
    for k in range(18): d.rounded_rectangle((70 + 52 * k, 124, 104 + 52 * k, 150), 4, fill='#dfe3e8')
    d.rectangle((560, 190, 1360, 1010), fill='#ffffff', outline='#c9ced6')
    d.text((960, 250), 'TIỂU LUẬN', font=F(30, True), fill='#111', anchor='mm')
    d.text((960, 296), 'MÔN KINH TẾ CHÍNH TRỊ MÁC – LÊNIN', font=F(24, True), fill='#111', anchor='mm')
    d.text((960, 338), 'Đề tài: Thể chế kinh tế thị trường định hướng xã hội chủ nghĩa ở Việt Nam', font=F(18), fill='#222', anchor='mm')
    d.text((620, 390), '1. Khái niệm và đặc trưng của thể chế kinh tế', font=F(20, True), fill='#111')
    para = ('Thể chế kinh tế là hệ thống các quy tắc, luật lệ và cơ chế vận hành điều chỉnh hành vi của các chủ thể kinh tế. '
            'Trong nền kinh tế thị trường định hướng xã hội chủ nghĩa, thể chế vừa bảo đảm các quy luật thị trường vận hành đầy đủ, '
            'vừa giữ vai trò định hướng của Nhà nước nhằm mục tiêu dân giàu, nước mạnh, dân chủ, công bằng, văn minh. '
            'Hoàn thiện thể chế vì vậy là khâu đột phá chiến lược, tháo gỡ điểm nghẽn cho tăng trưởng.')
    yy = 430
    for ln in wrap(d, para, F(18), 680): d.text((620, yy), ln, font=F(18), fill='#222'); yy += 30
    d.text((620, yy + 12), '2. Thực trạng hoàn thiện thể chế ở Việt Nam hiện nay', font=F(20, True), fill='#111'); yy += 52
    for k in range(9): d.rectangle((620, yy + 30 * k + 8, 620 + (680 if k % 4 else 520), yy + 30 * k + 18), fill='#c9ccd2')
    d.rectangle((40, 990, 1880, 1020), fill='#2b5797'); d.text((60, 1005), 'Trang 15/15   ·   4.218 từ   ·   Tiếng Việt', font=F(16), fill='#ffffff', anchor='lm')
    d.rounded_rectangle((1440, 820, 1860, 970), 14, fill='#1e7d4f')
    d.text((1466, 842), '✓  Portal môn học', font=F(20, True), fill='#d6f5e3')
    for k, ln in enumerate(wrap(d, 'Đã nộp bài lên portal môn học lúc 19:30. Điểm chuyên cần an toàn.', F(21), 370)): d.text((1466, 880 + 30 * k), ln, font=F(21), fill='#ffffff')
    return im


def ui10_code_cpp():
    """Cảnh 2.1: tài liệu code C++ Nam mở đọc không nổi (IDE tối, cùng mã với màn chiếu giảng đường)."""
    import noi_dung_bang as ND
    im, d = _cua_so('thread_pool.cpp — nhom3/do-an', '#1e1e1e')
    d.rectangle((40, 70, 340, 1020), fill='#252526')
    for k, s in enumerate(('▾ do-an', '   thread_pool.cpp', '   thread_pool.h', '   main.cpp', '   BaoCao_DoAn.docx', '   Makefile')): d.text((60, 90 + 34 * k), s, font=F(18), fill='#cccccc' if k != 1 else '#ffffff')
    f = F(24, mono=True); lh = 38
    for i, line in enumerate(ND.CODE):
        y = 100 + i * lh; d.text((420, y), f'{i + 1:>3}', font=f, fill='#858585')
        x = 500
        for t, k in ND._token(line): d.text((x, y), t, font=f, fill=ND.MAU_CU_PHAP[k]); x += d.textlength(t, font=f)
    return im


MAN = [('UI-01_bao-thuc-0630', ui01_bao_thuc), ('UI-03_nhom-lop-khen', ui03_nhom_lop), ('UI-08_trac-nghiem-10-cau', ui08_trac_nghiem),
       ('UI-09_game-thua', ui09_game_thua), ('UI-04_diem-lab402', ui04_diem_lab402), ('UI-05_me-goi-video', ui05_me_goi_video),
       ('UI-06_nhom-ho-nguyen', ui06_ho_nguyen), ('UI-07_laptop-tieu-luan', ui07_word_tieu_luan), ('UI-10_laptop-code-cpp', ui10_code_cpp)]


def main():
    import sys; sys.path.insert(0, DIR)
    os.makedirs(OUT, exist_ok=True); anh = []
    for ten, fn in MAN:
        im = fn(); p = os.path.join(OUT, ten + '.png'); im.save(p, optimize=True); anh.append((ten, im)); print('UI', p, im.size)
    # bảng ghép: 7 điện thoại một hàng + 2 laptop
    dt = [im.resize((312, 520)) for t, im in anh if im.size == (W, H)]; lp = [im.resize((960, 540)) for t, im in anh if im.size != (W, H)]
    bang = Image.new('RGB', (max(len(dt) * 322, 1940) + 10, 520 + 540 + 30), '#30343c')
    for i, im in enumerate(dt): bang.paste(im, (10 + i * 322, 10))
    for i, im in enumerate(lp): bang.paste(im, (10 + i * 970, 540))
    bang.save(os.path.join(OUT, 'BANG-UI.png'), optimize=True)


if __name__ == '__main__':
    main()
