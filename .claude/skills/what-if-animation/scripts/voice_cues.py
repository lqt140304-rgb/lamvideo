"""Thoại nhiều vai: mỗi cue một file mp3, ElevenLabs eleven_v4, mỗi cue gọi API một lần (cache theo lời + giọng).

Chạy từ thư mục studio:
  py <skill>/scripts/voice_cues.py <slug> --thu    đọc bộ thử giọng   -> out/<slug>/thu-giong/<ten>/<cue>.mp3
  py <skill>/scripts/voice_cues.py <slug> --that   đọc toàn bộ        -> public/<slug>/thoai/<cue>.mp3
Hồ sơ tập (episodes/*/<slug>/) chứa: thoai-cue.json (từ trich_thoai.py), thu-giong.json, giong-chot.json.
Không cắt khoảng lặng: nhịp nghỉ dựng trên timeline. Chạy lại khi lời/giọng không đổi thì không tốn credit.
"""
import hashlib, json, pathlib, sys

MODEL = 'eleven_v4'


def sig(cue, g):
    return hashlib.sha1(json.dumps([cue['loi'], cue.get('cam_xuc', ''), g, MODEL], sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:12]


def van_ban(cue):
    return f"[{cue['cam_xuc']}] {cue['loi']}" if cue.get('cam_xuc') else cue['loi']


def doc(cues, giong, thu_muc, goi, do_dai):
    """Đọc từng cue chưa có hoặc đã đổi; ghi file rồi manifest ngay sau mỗi cue, để lỗi giữa chừng không mất phần đã đọc."""
    thu_muc.mkdir(parents=True, exist_ok=True)
    mp = thu_muc / 'manifest.json'
    m = json.loads(mp.read_text(encoding='utf-8')) if mp.exists() else {}
    for c in cues:
        g = giong[c['vai']]
        s, f = sig(c, g), thu_muc / f"{c['id']}.mp3"
        if m.get(c['id'], {}).get('sig') == s and f.exists():
            continue
        audio = goi(f"/v1/text-to-speech/{g['id']}?output_format=mp3_44100_128",
                    {'text': van_ban(c), 'model_id': MODEL, 'voice_settings': g.get('settings', {})})
        f.write_bytes(audio)
        m[c['id']] = {'file': f.name, 'sig': s, 'vai': c['vai'], 'giay': round(do_dai(f), 2)}
        mp.write_text(json.dumps(m, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    return m


if __name__ == '__main__':
    import time
    from wi import SR, STUDIO, api, decode, log_cost, out_dir, pub_dir, spent_since
    slug, mode = sys.argv[1], sys.argv[2]
    ho_so = next((STUDIO.parent / 'episodes').glob(f'*/{slug}'), None) or sys.exit(f'Không thấy episodes/*/{slug}')
    load = lambda n: json.loads((ho_so / n).read_text(encoding='utf-8'))
    cues = {c['id']: c for c in load('thoai-cue.json')}
    do_dai = lambda p: len(decode(p)) / SR
    if mode == '--thu':
        viec = []
        for b in load('thu-giong.json'):
            sub = [cues[i] for i in b['cue_ids']]
            viec.append((sub, {c['vai']: {'id': b['giong_id'], 'settings': b['settings']} for c in sub}, out_dir(slug) / 'thu-giong' / b['ten']))
    elif mode == '--that':
        viec = [(list(cues.values()), load('giong-chot.json'), pub_dir(slug) / 'thoai')]
    else:
        sys.exit('Cần --thu hoặc --that')
    t0, chars = time.time(), 0
    for sub, giong, d in viec:
        mp = d / 'manifest.json'
        cu = json.loads(mp.read_text(encoding='utf-8')) if mp.exists() else {}
        chars += sum(len(van_ban(c)) for c in sub if cu.get(c['id'], {}).get('sig') != sig(c, giong[c['vai']]) or not (d / f"{c['id']}.mp3").exists())
    print(f'{chars} ký tự cần gửi ElevenLabs ({MODEL})')
    for sub, giong, d in viec:
        m = doc(sub, giong, d, api, do_dai)
        print(d, len(m), 'file')
    if chars:
        used, n = spent_since(t0, expect=1)
        log_cost(slug, 'thoai' + mode, used, f'{chars} ký tự' + ('' if n else '; chưa có trong history, xem trang usage'))
