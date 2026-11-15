"""Trích lời thoại từ kịch bản Markdown ra danh sách cue (mỗi câu một cue, có mã, vai, cảm xúc).

py trich_thoai.py <kich-ban.md> <thoai-cue.json>
Nhận hai dạng: khối `**VAI [cảm xúc]:**` hoặc `Tên vai ... :` theo sau bởi các dòng `> lời`,
và lời trong đoạn văn `Tên vai ...: *"lời"*` (đánh dấu ra_soat=True vì vai đoán theo tên đầu câu).
Kết quả luôn cần người rà tay: chỗ không đoán được vai sẽ in cảnh báo kèm số dòng.
"""
import io, json, re, sys, unicodedata

VAI = {'nam': 'NAM', 'người kia': 'NGƯỜI KIA', 'tùng': 'TÙNG', 'giảng viên': 'GIẢNG VIÊN', 'mẹ': 'MẸ', 'bác hai': 'BÁC HAI'}


def khong_dau(s):
    s = unicodedata.normalize('NFD', s.replace('Đ', 'D').replace('đ', 'd'))
    return re.sub(r'[^A-Z0-9]+', '_', ''.join(c for c in s if not unicodedata.combining(c)).upper()).strip('_')


def doan_vai(prefix):
    """Vai ở đầu câu văn ('Nam nhăn mặt bực bội' -> NAM, 'bực bội'); None nếu câu không mở đầu bằng tên vai."""
    p = re.sub(r'^[\s*>-]+', '', prefix).strip()
    for k in sorted(VAI, key=len, reverse=True):
        if p.lower().startswith(k + ' ') or p.lower() == k:
            rest = p[len(k):].strip()
            m = re.search(r'(bực bội|cáu|lẩm bẩm|thì thào|thì thầm|gắt|cười|run|hét|gào)[^,.:]*', rest)
            return VAI[k], (m.group(0).strip() if m else '')
    return None, ''


def trich(md, canh_bao=None):
    cues, canh, vai, cx, buf, ra_soat, dem = [], '0', None, '', [], False, {}

    def xong():
        nonlocal buf
        if buf and vai:
            add(vai, cx, ' '.join(buf), ra_soat)
        buf = []

    def add(v, c, loi, rs, line=None):
        dem[(canh, v)] = dem.get((canh, v), 0) + 1
        cues.append({'id': f'C{canh}_{khong_dau(v)}_{dem[(canh, v)]:02d}', 'vai': v, 'cam_xuc': c, 'loi': loi.strip(), 'canh': canh, 'ra_soat': rs})

    for i, l in enumerate(md.splitlines(), 1):
        s = l.strip()
        m = re.match(r'^### CẢNH (\d+\.\d+)', s)
        if m:
            xong(); canh, vai = m.group(1), None
            continue
        if s.startswith('> ') or s == '>':
            body = s[1:].strip()
            if body.startswith(('*', '🎬')) and not body.startswith('*"'):
                continue  # ghi chú, chỉ dẫn hoặc tiêu đề chuyển cảnh
            q = re.match(r'^\*"(.+?)"\*', body)
            if q:
                body = q.group(1)
            if vai:
                buf.append(body)
            elif canh_bao is not None and body and canh != '0':
                canh_bao.append(f'dòng {i}: không rõ vai: {body[:60]}')
            continue
        xong()
        m = re.match(r'^\*\*([^*\[]+?)\s*(?:\[([^\]]*)\])?\s*:\*\*\s*$', s)
        if m and m.group(1).strip().lower() in VAI:
            vai, cx, ra_soat = VAI[m.group(1).strip().lower()], (m.group(2) or '').strip(), False
            continue
        if s.endswith(':'):
            v, c = doan_vai(s[:-1])
            vai, cx, ra_soat = (v, c, False) if v else (None, '', False)
            continue
        # lời trong đoạn văn: '... Tên vai ...: *"lời"*'
        for pre, loi in re.findall(r'([^*"]*?):\s*\*"(.+?)"\*', s):
            v, c = doan_vai(pre)
            if v:
                add(v, c, loi, True)
            elif canh_bao is not None and canh != '0':
                canh_bao.append(f'dòng {i}: lời trong đoạn văn, không rõ vai: {loi[:60]}')
        vai = None
    xong()
    return cues


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    src, dst = sys.argv[1], sys.argv[2]
    warn = []
    cues = trich(io.open(src, encoding='utf-8').read(), warn)
    io.open(dst, 'w', encoding='utf-8').write(json.dumps(cues, ensure_ascii=False, indent=1) + '\n')
    tong = {}
    for c in cues:
        tong[c['vai']] = tong.get(c['vai'], 0) + len(c['loi'])
    print(len(cues), 'cue;', tong, 'tổng', sum(tong.values()), 'ký tự')
    for w in warn:
        print('CẢNH BÁO', w)
