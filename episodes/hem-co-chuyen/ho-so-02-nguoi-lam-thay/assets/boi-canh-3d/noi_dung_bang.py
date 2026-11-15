"""Nội dung BẢNG PHẤN và MÀN CHIẾU giảng đường (15/11/2026): chữ thật, bố cục theo cột, không đè nhau.

Bảng (x −6,5…−0,7; z 1,25…2,75; mặt bảng y = −0,92), chia 3 vùng cách nhau ≥ 0,15 m:
  [A] x −6,35…−3,55  tiêu đề + 4 gạch đầu dòng bài giảng
  [B] x −3,35…−2,05  sơ đồ 2 luồng tranh 1 tài nguyên (khung + mũi tên)
  [C] x −1,90…−0,80  góc vẽ bậy kiểu meme của sinh viên (hình que đổ mồ hôi + mèo), nét do lớp tự vẽ, không lấy ảnh meme có sẵn
Màn chiếu (x 0,8…6,4; z 1,4…4,4): thanh tiêu đề tệp, cột số dòng, code C++ tô màu theo cú pháp, thụt lề đúng.
Chữ là đối tượng FONT của Blender (không phải ảnh): rõ nét ở mọi khoảng cách, ít mặt. Phông trong ./font (giấy phép mở).
"""
import os, re, math
import bpy
from mathutils import Vector
import vat_lieu as M

FONT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'font')
Y_BANG = -0.9185; Y_MAN = -0.8485
# Bảng/màn nhìn từ phía +y (khán phòng) về −y, nên bên TRÁI người xem là +x. Bố cục viết theo "x người xem" (trái → phải tăng dần)
# rồi đổi sang toạ độ thế giới bằng _MX (đối xứng qua tâm bảng/màn); chữ quay 180° quanh Z để đọc xuôi.
_MX = [lambda x: x]


def _font(ten):
    return bpy.data.fonts.load(os.path.join(FONT_DIR, ten), check_existing=True)


def chu(name, body, x, y, z, size, mat, c, font, align='LEFT'):
    cu = bpy.data.curves.new(name, 'FONT'); cu.body = body; cu.font = font; cu.size = size; cu.align_x = align; cu.space_line = 1.15
    ob = bpy.data.objects.new(name, cu); ob.location = (_MX[0](x), y, z); ob.rotation_euler = (math.radians(90), 0, math.pi)
    cu.materials.append(mat); c.objects.link(ob); return ob


def net(name, pts, mat, c, y, day=0.0045, kin=False):
    """Nét phấn: đường cong qua các điểm (x, z) trên mặt bảng, có độ dày (bevel)."""
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = day; cu.bevel_resolution = 1
    sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
    for p, (x, z) in zip(sp.points, pts): p.co = (_MX[0](x), y, z, 1)
    sp.use_cyclic_u = kin
    cu.materials.append(mat); ob = bpy.data.objects.new(name, cu); c.objects.link(ob); return ob


def vong(name, cx, cz, r, mat, c, y, n=20, rz=None, cung=(0, 360)):
    a0, a1 = cung
    pts = [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)), cz + (rz or r) * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]
    return net(name, pts, mat, c, y)


def bang(c):
    tay = _font('PatrickHand-Regular.ttf')
    phan = M.solid('nd_phan', '#dfe6da', 1.0); phan_vang = M.solid('nd_phan_vang', '#f0e08a', 1.0); phan_hong = M.solid('nd_phan_hong', '#f2b8b8', 1.0)
    y = Y_BANG; _MX[0] = lambda x: -7.2 - x
    # [A] bài giảng
    chu('nd_tieu_de', 'Bài 7: LẬP TRÌNH ĐA LUỒNG', -6.35, y, 2.52, 0.15, phan_vang, c, tay)
    net('nd_gach_tieu_de', [(-6.35, 2.49), (-4.2, 2.485)], phan_vang, c, y)
    dong = ['• Thread ≠ Process (chung bộ nhớ)', '• mutex.lock() -> vùng găng -> unlock()', '• Deadlock: A chờ B, B chờ A', '• Race condition: 2 luồng cùng ghi 1 biến']
    for i, s in enumerate(dong): chu(f'nd_dong_{i}', s, -6.3, y, 2.2 - 0.22 * i, 0.125, phan, c, tay)
    chu('nd_ngay', 'Thứ 5 - 13/11', -1.3, y, 2.6, 0.075, phan, c, tay)
    # [B] sơ đồ: 2 khung luồng → 1 tài nguyên, có ổ khoá
    def khung(n, x0, z0, x1, z1, mat=phan): net(n, [(x0, z0), (x1, z0), (x1, z1), (x0, z1)], mat, c, y, kin=True)
    khung('nd_k_l1', -3.35, 2.15, -2.85, 2.38); chu('nd_t_l1', 'Luồng 1', -3.1, y, 2.22, 0.075, phan, c, tay, 'CENTER')
    khung('nd_k_l2', -3.35, 1.62, -2.85, 1.85); chu('nd_t_l2', 'Luồng 2', -3.1, y, 1.69, 0.075, phan, c, tay, 'CENTER')
    vong('nd_tai_nguyen', -2.32, 2.0, 0.24, phan_vang, c, y, rz=0.16); chu('nd_t_tn', 'biến dùng chung', -2.32, y, 1.97, 0.055, phan_vang, c, tay, 'CENTER')
    for i, (za, zb) in enumerate(((2.26, 2.08), (1.74, 1.92))):
        net(f'nd_mt_{i}', [(-2.83, za), (-2.57, zb)], phan, c, y); net(f'nd_mt_dau_{i}', [(-2.64, zb + (0.03 if i == 0 else -0.03)), (-2.57, zb), (-2.62, zb + (-0.05 if i == 0 else 0.05))], phan, c, y)
    vong('nd_khoa_quai', -2.32, 2.23, 0.035, phan_hong, c, y, n=10, cung=(0, 180)); khung('nd_khoa', -2.37, 2.17, -2.27, 2.23, phan_hong)
    chu('nd_hoi', 'ai giữ khoá?', -2.7, y, 1.42, 0.07, phan_hong, c, tay, 'CENTER')
    # đường chia vùng mờ (giáo viên kẻ)
    net('nd_chia_1', [(-3.47, 2.65), (-3.46, 1.35)], phan, c, y, day=0.002)
    # [C] góc meme sinh viên vẽ: hình que đổ mồ hôi + chú thích; mèo nằm + "deadline"
    # đồ thị meme: "động lực" đi xuống, "deadline" lao lên (nét tự vẽ của lớp)
    gx, gz = -2.0, 2.3
    net('nd_g_truc', [(gx, gz + 0.32), (gx, gz), (gx + 0.5, gz)], phan, c, y, day=0.003)
    net('nd_g_dong_luc', [(gx + 0.02, gz + 0.28), (gx + 0.15, gz + 0.22), (gx + 0.3, gz + 0.1), (gx + 0.48, gz + 0.03)], phan, c, y)
    net('nd_g_deadline', [(gx + 0.02, gz + 0.03), (gx + 0.3, gz + 0.06), (gx + 0.42, gz + 0.15), (gx + 0.48, gz + 0.3)], phan_hong, c, y)
    chu('nd_g_t1', 'động lực', gx + 0.52, y, gz + 0.0, 0.05, phan, c, tay)
    chu('nd_g_t2', 'deadline', gx + 0.5, y, gz + 0.3, 0.05, phan_hong, c, tay)
    chu('nd_g_t3', 'tuần 1 -> tuần 15', gx + 0.02, y, gz - 0.07, 0.04, phan, c, tay)
    x, z = -1.1, 1.85
    vong('nd_m_dau', x, z + 0.25, 0.07, phan, c, y)
    net('nd_m_than', [(x, z + 0.18), (x, z - 0.02)], phan, c, y)
    net('nd_m_tay', [(x - 0.12, z + 0.16), (x, z + 0.12), (x + 0.12, z + 0.2)], phan, c, y)
    net('nd_m_chan', [(x - 0.08, z - 0.15), (x, z - 0.02), (x + 0.08, z - 0.15)], phan, c, y)
    for i, (dx, dz) in enumerate(((0.1, 0.3), (0.12, 0.25), (-0.1, 0.31))):  # giọt mồ hôi
        vong(f'nd_m_mh_{i}', x + dx, z + dz, 0.012, phan, c, y, n=8, rz=0.018)
    net('nd_m_mieng', [(x - 0.03, z + 0.22), (x, z + 0.235), (x + 0.03, z + 0.22)], phan, c, y, day=0.003)
    chu('nd_m_chu', 'code chạy rồi\nĐỪNG AI SỬA!!', x + 0.02, y, z - 0.33, 0.085, phan, c, tay, 'CENTER')
    xm, zm = -1.85, 1.45   # mèo nằm cuộn tròn
    vong('nd_meo_than', xm, zm, 0.12, phan_vang, c, y, rz=0.06)
    vong('nd_meo_dau', xm + 0.14, zm + 0.04, 0.05, phan_vang, c, y)
    net('nd_meo_tai', [(xm + 0.1, zm + 0.08), (xm + 0.11, zm + 0.12), (xm + 0.14, zm + 0.09), (xm + 0.17, zm + 0.12), (xm + 0.18, zm + 0.08)], phan_vang, c, y)
    net('nd_meo_duoi', [(xm - 0.12, zm), (xm - 0.18, zm + 0.04), (xm - 0.16, zm + 0.09)], phan_vang, c, y)
    chu('nd_meo_chu', 'nộp bài: hôm qua', xm + 0.22, y, zm - 0.03, 0.07, phan_vang, c, tay)
    chu('nd_ky_ten', '- lớp K66 :)', -1.3, y, 1.3, 0.05, phan, c, tay)


# ----------------------------------------------------------------------------------------- MÀN CHIẾU
CODE = [
    '#include <thread>', '#include <mutex>', '#include <queue>', '',
    'class ThreadPool {', 'public:',
    '    explicit ThreadPool(size_t n) : stop(false) {',
    '        for (size_t i = 0; i < n; ++i)',
    '            workers.emplace_back([this] { loop(); });',
    '    }',
    '    template<class F> void submit(F&& f) {',
    '        { std::unique_lock<std::mutex> lk(mtx);',
    '          tasks.emplace(std::forward<F>(f)); }',
    '        cv.notify_one();   // wake one worker',
    '    }', 'private:',
    '    void loop() {',
    '        while (true) {',
    '            std::unique_lock<std::mutex> lk(mtx);',
    '            cv.wait(lk, [this]{ return stop || !tasks.empty(); });',
    '            if (stop && tasks.empty()) return;',
]
MAU_CU_PHAP = {'kw': '#569cd6', 'type': '#4ec9b0', 'str': '#ce9178', 'cmt': '#6a9955', 'num': '#b5cea8', 'pre': '#c586c0', 'fn': '#dcdcaa', 'txt': '#d4d4d4'}
KW = {'class', 'public', 'private', 'explicit', 'for', 'while', 'if', 'return', 'true', 'false', 'template', 'void', 'this', 'size_t'}
TYPES = {'ThreadPool', 'F', 'std', 'unique_lock', 'mutex'}


def _token(line):
    out = []
    if line.lstrip().startswith('#include'):
        i = line.index('<'); return [('#include ', 'pre'), (line[i:], 'str')]
    if '//' in line:
        i = line.index('//'); return _token(line[:i]) + [(line[i:], 'cmt')]
    for t in re.findall(r'\s+|[A-Za-z_]\w*|\d+|.', line):
        if t in KW: k = 'kw'
        elif t in TYPES: k = 'type'
        elif t.isdigit(): k = 'num'
        elif re.match(r'[A-Za-z_]\w*$', t) and t in ('emplace_back', 'loop', 'submit', 'emplace', 'forward', 'notify_one', 'wait', 'empty'): k = 'fn'
        else: k = 'txt'
        if out and out[-1][1] == k: out[-1] = (out[-1][0] + t, k)
        else: out.append((t, k))
    return out


def man_chieu(c, x0=0.8, x1=6.4, z0=1.4, z1=4.4):
    mono = _font('DejaVuSansMono.ttf'); y = Y_MAN; _MX[0] = lambda x: x0 + x1 - x
    def box(n, a, b, *r): return _box(n, min(_MX[0](a), _MX[0](b)), max(_MX[0](a), _MX[0](b)), *r)
    mats = {}
    def em(k, h, s=2.6):
        if k not in mats:
            mats[k] = M.emission(f'nd_man_{k}', h, s); mats[k].cycles.emission_sampling = 'NONE'
        return mats[k]
    # thanh tiêu đề tệp (khối phát sáng mỏng ngay trước màn) + tab
    from hinh_khoi import box as _box
    box('nd_thanh_tieu_de', x0, x1, y + 0.0004, y + 0.0006, z1 - 0.2, z1, em('bar', '#2d2d30', 2.2), c)
    box('nd_tab', x0 + 0.05, x0 + 2.25, y + 0.0007, y + 0.0009, z1 - 0.2, z1 - 0.02, em('tab', '#1e1e1e', 2.2), c)
    chu('nd_ten_tep', 'thread_pool.cpp  -  nhom3/do-an', x0 + 0.12, y + 0.002, z1 - 0.15, 0.085, em('ten', '#ffffff', 2.4), c, mono)
    box('nd_cot_so', x0, x0 + 0.42, y + 0.0004, y + 0.0006, z0, z1 - 0.2, em('gut', '#252526', 2.2), c)
    S = 0.1; adv = 0.6021 * S; lh = 0.124; zt = z1 - 0.34
    for i, line in enumerate(CODE):
        z = zt - i * lh
        chu(f'nd_so_{i}', str(i + 1), x0 + 0.34, y + 0.002, z, S, em('so', '#858585'), c, mono, 'RIGHT')
        lop = {}
        col = 0
        for t, k in _token(line):
            lop.setdefault(k, [' '] * len(line))
            for j, ch in enumerate(t): lop[k][col + j] = ch
            col += len(t)
        for k, chars in lop.items():   # một chữ / màu / dòng; ký tự màu khác thay bằng dấu cách → thẳng cột tuyệt đối
            txt = ''.join(chars).rstrip()
            if txt.strip(): chu(f'nd_code_{i}_{k}', txt, x0 + 0.55, y + 0.002, z, S, em(k, MAU_CU_PHAP[k]), c, mono)
    # con trỏ nháy + thanh cuộn
    box('nd_con_tro', x0 + 0.55, x0 + 0.565, y + 0.0015, y + 0.0017, zt - len(CODE) * lh - 0.02, zt - len(CODE) * lh + 0.09, em('ct', '#aeafad'), c)
    box('nd_cuon', x1 - 0.08, x1 - 0.03, y + 0.0008, y + 0.001, z1 - 1.3, z1 - 0.3, em('cuon', '#4f4f4f', 2.2), c)
