"""Chạy từ studio: python ../episodes/hem-co-chuyen/ho-so-02-nguoi-lam-thay/tao_audio_fx.py [--tao-sfx]

Xuất FX giọng cục bộ; --tao-sfx gọi ElevenLabs một lượt mỗi âm chưa có cache.
Không tạo timeline giả khi chưa có bản dựng. Không thay file thoại khô.
"""
import hashlib
import html
import json
import pathlib
import subprocess
import sys
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / '.claude/skills/what-if-animation/scripts'))
from wi import api_key

SLUG = 'ho-so-02-nguoi-lam-thay'
PUBLIC = ROOT / 'what-if-studio/public' / SLUG
OUT = ROOT / 'what-if-studio/out' / SLUG
MODEL = 'eleven_text_to_sound_v3'
SFX_DIR = PUBLIC / 'sfx-v2'

# id, seconds, loop, scenes, prompt. Một take mỗi âm, tái dùng theo vật liệu/hành động.
SOUNDS = [
    ('nen-phong-quat', 24, True, '1.1–3.5', 'Natural stereo location recording inside a furnished 15 square metre Hanoi rental room. A worn ceiling fan rotates overhead: audible airy blade pulses, slightly uneven motor buzz and intermittent loose bearing clicks. Close room reflections, very distant alley traffic behind a partly closed window. The fan has organic mechanical variation, not white noise. Ordinary full recording level, detailed midrange texture, no score, no speech.'),
    ('hem-ban-ngay', 24, False, '1.1, 2.1, 3.2', 'Stereo field recording of a narrow Hanoi residential alley from an open first floor window. Small motorbikes approach, pass left to right and fade around a corner, one distant short scooter horn, light neighbourhood activity deeper in the alley. Airy outdoor depth against masonry reflections, changing near and far layers, natural gaps. Authentic small scooters, not highway cars. Clearly audible location sound, no dialogue or music.'),
    ('dem-phong-tro', 24, False, '1.4, 2.2–2.4', 'Natural stereo late night recording from inside a small Hanoi rental room with an open window. Nearby fan blades softly swish with an occasional mechanical tick. A single distant motorbike approaches outside, passes behind the wall and recedes, followed later by a far away long train horn. Isolated tiny room creaks between events. Audible lived-in depth and air, not a constant synthesizer drone. No music, no intelligible speech.'),
    ('bao-thuc', 4, True, '1.1', 'Close microphone recording of a real small smartphone speaker playing an original insistent electronic alarm. Short grouped digital beeps repeat with clear pauses, slight tinny speaker resonance and gentle desk coupling. Strong recognizable wake-up alarm, no synth bass, no melody from an existing product, no voice or background music.'),
    ('rung-dien-thoai', 4, False, '1.1, 1.2, 2.3', 'Close-up practical Foley: a real smartphone lies flat on a thin wooden desk and vibrates in two separated bursts. Fast dry vibrating motor buzz couples to the desktop, audible little hard plastic rattles and uneven contact chatter, then comes completely to rest. Real everyday scale and full natural recording level, not an electric drill. No speech or music.'),
    ('go-khung-guong', 5, False, '1.1', 'Close practical Foley inside a small tiled room. A steel hammer with rubber handle strikes the wooden support at the bottom of a freestanding mirror three firm times, separate irregularly spaced TOK TOK TOK impacts. Woody body with sharp steel-on-wood attack; the slightly loose glass briefly chatters after each hit and settles after the final blow. Full-bodied everyday impact, not light finger taps, no glass breaking, no voices or music.'),
    ('chan-vai', 5, False, '1.1, 1.3, 2.2', 'Close practical Foley of a thin worn cotton blanket being quickly pulled up over a person lying on a foam floor mattress. Broad cloth scrape and flutter, a soft body-weight compression of the mattress, then two tiny settling fabric movements. Audible woven cotton texture and natural variation, not paper or plastic. Full natural recording level, no speech or music.'),
    ('dep-san-gach', 6, False, '1.1–3.5', 'Natural close Foley of one adult walking six steps in loose rubber slippers across ceramic floor tiles in a small furnished room. Alternating left and right footfalls, each with rubber sole slap, light heel contact and occasional short toe scuff, human uneven timing and weight, natural small-room reflection. Not shoes, high heels, running or marching. Clearly audible real-scale footsteps, no speech or music.'),
    ('voi-rua-bat', 10, False, '1.2', 'Real close stereo Foley of washing one ceramic rice bowl under a kitchen tap in a small metal sink. Faucet handle clicks open, a continuous irregular water stream splashes and changes pitch as the bowl rotates, fingers rub wet ceramic, one small bowl contact against the sink, faucet closes and residual water drips and drains. Lively liquid texture, clear contact details, ordinary domestic recording level. No music or speech.'),
    ('dat-bat', 3, False, '1.2', 'One white ceramic rice bowl placed by hand onto a worn laminate kitchen counter. One definite ceramic contact TUK with a short bright rim ring, a tiny settling scrape, then stillness. Dry close microphone, believable small object weight and room reflection. Not a bell, dropped dish or breaking glass. Clear natural Foley level, no voice or music.'),
    ('cua-go', 6, False, '1.3, 2.1, 3.5', 'Practical Foley of a thin old wooden rental room door opening inward, hinge briefly squeaks and wood rubs the frame, a pause, then it closes firmly with a hollow wooden THUNK and small frame rattle. Small tiled room reflections, clear changing movement and solid closure, not a cinematic explosion. The bolt is not operated. No voices or music.'),
    ('then-sat', 3, False, '1.3, 3.5', 'Very close real Foley of a worn steel sliding door bolt. Hand lifts the loose handle slightly, pushes it across with a gritty metal-on-metal scrape, then the bolt hits its bracket with one sharp CLACK and a short loose ring. Strong dry precise transient, real light steel hardware, not a key turning or a gun. No voices or music.'),
    ('ban-phim', 7, False, '1.4, 2.1, 2.4', 'Close Foley of two hands typing naturally on a cheap laptop chiclet keyboard sitting on a wooden desk. Uneven short bursts of plastic key taps with tiny pauses, an occasional deeper spacebar tap and one enter key, subtle hollow laptop chassis resonance. Everyday normal level with crisp details, not a mechanical gaming keyboard or typewriter. No voices or music.'),
    ('the-sinh-vien', 4, False, '2.1', 'Close real Foley of a rigid thin plastic student ID card put down on a bare wooden desk, slid a short distance to another person, then picked up by its corner. Small crisp plastic tick, broad dry surface scrape, light fingertip contact. Audible ordinary object detail, not paper crumpling or a coin. No voices or music.'),
    ('chau-nuoc', 7, False, '2.1, 2.2', 'Natural close stereo Foley of warm water pouring from a small household kettle into a round plastic washbasin standing on ceramic tiles. Pour starts gently, becomes fuller with clear hollow plastic basin resonance and irregular splashes, slows and stops, then water sloshes once and settles. Rich physical water detail at normal recording level, not a waterfall or boiling kettle. No voices or music.'),
    ('thong-bao', 3, False, '1.4, 2.3, 2.4', 'A real small smartphone loudspeaker gives one original short two-note notification, crisp high notes with light cheap-speaker coloration and a tiny room reflection. Brief, clearly audible and ordinary, not a magical sparkle or musical sting, no familiar branded tune, no speech or background music.'),
    ('xoi-roi', 4, False, '2.4', 'Detailed practical Foley: a small portion of moist sticky rice is thrown from a thin takeaway box onto hard ceramic floor tiles. Short plastic box rustle, several soft irregular damp little thuds as clumps land, a few loose grains patter and stop. Close microphone makes the tiny material details audible at real scale. Not gravel, glass, dry beans or a loud crash. No voices or music.'),
    ('lat-sach', 5, False, '2.4', 'Close Foley of a student turning three thin textbook pages one at a time. Fingertip slides on paper, each page flexes with a clear papery flutter and lands lightly against the book; irregular pauses and a final light palm settling on the page. Warm dry paper texture and natural full recording level, not plastic crinkle. No voices or music.'),
    ('khuay-ca-phe', 5, False, '2.4', 'Close real Foley of a metal teaspoon stirring thick coffee in a small ceramic mug on a desk. Spoon circles at a natural uneven pace, making several distinct small bright ceramic clinks with liquid swirls, slows down, then lightly taps the rim once and stops. Clear physical detail and short room reflections, not bells or repetitive music. No speech.'),
    ('lop-hoc', 24, False, '3.1', 'Natural stereo documentary room recording in a Vietnamese university lecture hall before the teacher speaks. Broad room air, low indistinct student conversation in scattered small groups at different distances, a few soft paper movements, one wooden chair scraping briefly far to the right, then the murmur eases. Spacious but realistic wall reflections, organic movement and breathing room, no clear words, no music, no cheering.'),
    ('phan-gay', 3, False, '3.1', 'Very close practical Foley: a brittle white classroom chalk stick snaps once sharply between fingers with a small dry tik, then two tiny chalk fragments tick against ceramic floor tiles and stop. Fine powdery texture and brief room reflection, clearly recorded small event, not breaking a wooden branch, glass or a gunshot. No voices or music.'),
    ('bo-ke-song', 24, False, '3.2', 'Natural stereo field recording on a Hanoi river embankment at late afternoon. Small irregular freshwater ripples lap against concrete steps in the foreground, soft gusts move nearby leaves, distant city traffic and one faint scooter pass far behind. Open air and changing depth, intermittent stronger lap then space, not ocean surf or a storm. Clear location recording, no score or intelligible speech.'),
    ('tim-dap', 8, True, '3.2, 3.4', 'Realistic close body-conducted human heartbeat, distinct soft low thump followed by a smaller second beat, around 90 beats per minute, tiny natural timing variation. Rounded low mid body, present and audible but not an electronic kick drum, no horror braam, no breathing, no musical rhythm or score.'),
    ('bua-roi', 5, False, '3.3–3.4', 'One real steel claw hammer with a rubber handle drops from knee height onto hard ceramic floor tiles. Heavy initial metallic KENG impact, one smaller irregular bounce and a brief ringing decay, rubber handle makes a dull final contact and it comes to rest. Clear sharp attack and believable object weight, close room recording, no repeated hammer strikes, no voices or music.'),
    ('guong-nut-ri-nuoc', 7, False, '2.3, 3.3', 'Tactile supernatural Foley made from realistic materials: several fine brittle glazed-ceramic crackles slowly spread, followed by separated cold water drops landing on tile. Each drop has a small sharp attack and a tiny wet tail, with close granular surface detail between drops. Foreground audible natural-size sound, not distant silence, no big glass shatter, monster, bass drone, music or voices.'),
    ('guong-hoa-long', 10, False, '3.4', 'Close tactile liquid Foley for a hand slowly entering a vertical water membrane. Clear initial wet contact and round water ripple, thick water stretches and draws inward with soft suction and small bubbles, several fingers slide through, then the membrane seals with a final small wet pop and drips. Rich audible organic liquid movement at normal Foley level. Not a sci-fi laser, explosive portal, monster growl or music. No voices.'),
    ('ghe-keo', 5, False, '3.1, 3.5', 'Practical close Foley of a light four-legged wooden chair pulled backwards half a metre over ceramic floor tiles. Uneven gritty wooden foot scraping, one leg briefly squeaks, weight shifts with a small knock, then all four legs settle. Clear small-room reflections and realistic friction, no wheels, no huge industrial screech, no voices or music.'),
    ('tui-do-an', 4, False, '3.5', 'Close real Foley of a thin plastic takeaway food bag containing a small food container. It swings slightly in a hand with irregular plasticky crinkles, then is set on a wooden desk with a light container thump and the bag handles collapse with a final rustle. Clear ordinary full-level recording, no foil, paper bag, speech or music.'),
]


def save(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')


def probe(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', str(path)], capture_output=True, check=True)
    return float(json.loads(r.stdout)['format']['duration'])


def voice_fx():
    d = PUBLIC / 'thoai-fx'
    d.mkdir(parents=True, exist_ok=True)
    phone = ['C1.2_TUNG_01', 'C1.2_TUNG_02']
    hall = [f'C3.1_GIANG_VIEN_{i:02d}' for i in range(1, 4)]
    whispers = ['C3.4_NGUOI_KIA_01', 'C3.4_NGUOI_KIA_02', 'C3.4_NGUOI_KIA_03']
    crowd = ['C3.1_SINH_VIEN_01', 'C3.1_SINH_VIEN_02']
    m = json.loads((d/'manifest.json').read_text(encoding='utf-8')) if (d/'manifest.json').exists() else {}
    for cid in phone + hall + whispers + crowd:
        src = PUBLIC / 'thoai' / (cid + '.mp3')
        if cid in phone:
            kind, filt = 'phone', 'highpass=f=450,lowpass=f=2600,acompressor=threshold=0.1:ratio=4:attack=5:release=80,asoftclip=type=tanh:threshold=0.35:output=0.9'
        elif cid in hall:
            kind, filt = 'classroom', 'highpass=f=100,aecho=0.85:0.9:47|89|151|223:0.30|0.24|0.16|0.10'
        elif cid in crowd:
            kind, filt = 'distant-classroom', 'highpass=f=220,lowpass=f=3800,aecho=0.85:0.9:53|113|191:0.28|0.18|0.10'
        else:
            # Giữ diễn xuất nguồn; vang nghe được cả khi gộp mono, stereo chỉ bổ sung không gian.
            kind, filt = 'mirror-stereo', 'highpass=f=100,lowpass=f=6500,aecho=0.85:0.9:83|167|283:0.38|0.25|0.14,apulsator=hz=0.25:amount=0.65'
        filt += ',loudnorm=I=-16:TP=-1.5:LRA=9'
        sig = hashlib.sha256(src.read_bytes() + filt.encode()).hexdigest()
        dest = d / (cid + '.wav')
        if m.get(cid, {}).get('sig') != sig or not dest.exists():
            tmp = d / (cid + '.pending.wav')
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(src), '-ac', '2', '-ar', '48000', '-af', filt, '-c:a', 'pcm_s16le', str(tmp)], check=True)
            probe(tmp)
            tmp.replace(dest)
            m[cid] = {'file': dest.name, 'kind': kind, 'sig': sig, 'filter': filt, 'seconds': probe(dest), 'status': 'generated-not-listened'}
            save(d/'manifest.json', m)
    print('VOICE_FX', len(m), flush=True)


def sfx():
    for name, seconds, loop, scenes, prompt in SOUNDS:
        if len(prompt) > 450 or not 0.5 <= seconds <= 30:
            raise ValueError(f'{name}: prompt vượt 450 ký tự hoặc độ dài ngoài 0,5–30 giây')
    d = SFX_DIR
    d.mkdir(parents=True, exist_ok=True)
    mp = d / 'manifest.json'
    m = json.loads(mp.read_text(encoding='utf-8')) if mp.exists() else {}
    for name, seconds, loop, scenes, prompt in SOUNDS:
        body = {'text': prompt, 'duration_seconds': seconds, 'loop': loop, 'model_id': MODEL, 'prompt_influence': 0.5}
        sig = hashlib.sha256(json.dumps(body, sort_keys=True).encode()).hexdigest()
        dest = d / (name + '.mp3')
        if m.get(name, {}).get('sig') == sig and dest.exists():
            continue
        if m.get(name, {}).get('sig') == sig and (d / m[name]['file']).exists():
            raise RuntimeError(f'{name}: đã tải bản pending; kiểm file trước, không gọi API lại')
        req = urllib.request.Request('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128', data=json.dumps(body).encode(), headers={'xi-api-key': api_key(), 'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=180) as response:
            audio = response.read()
            billed = response.headers.get('character-cost')
            request_id = response.headers.get('request-id')
        # Lưu ngay phản hồi + thông tin phí trước khi kiểm file, tránh gọi lại nếu kiểm âm lỗi.
        pending = d / (name + '.pending.mp3')
        pending.write_bytes(audio)
        m[name] = {'file': pending.name, 'sig': sig, 'request': body, 'scenes': scenes, 'billing_character_cost': billed, 'request_id': request_id, 'status': 'downloaded-unverified'}
        save(mp, m)
        actual = probe(pending)
        pending.replace(dest)
        m[name].update(file=dest.name, seconds=actual, status='generated-not-listened')
        save(mp, m)
        print('SFX', name, actual, 'billing_character_cost', billed, flush=True)


def preview():
    """Bản nghe đủ lớn, A/B giọng cùng mức mục tiêu; không đổi SFX nguồn hoặc mức mix phim."""
    d = OUT / 'fx-preview'
    d.mkdir(parents=True, exist_ok=True)
    mp = d / 'manifest.json'
    m = json.loads(mp.read_text(encoding='utf-8')) if mp.exists() else {}
    def normalized(src, key, target):
        filt = f'loudnorm=I={target}:TP=-1.5:LRA=9'
        if target == -18:
            # Chừa headroom cả khi loa gộp hai kênh stereo về mono.
            filt = 'loudnorm=I=-18:TP=-4.5:LRA=9,alimiter=limit=0.595:level=false'
        sig = hashlib.sha256(src.read_bytes() + filt.encode()).hexdigest()
        dst = d / (key + '.wav')
        if m.get(key, {}).get('sig') != sig or not dst.exists():
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(src), '-ac', '2', '-ar', '48000', '-af', filt, '-c:a', 'pcm_s16le', str(dst)], check=True)
            m[key] = {'sig': sig, 'source': str(src.relative_to(ROOT)), 'filter': filt, 'seconds': probe(dst)}
            save(mp, m)
        return dst
    def player(path):
        import os
        url = pathlib.Path(os.path.relpath(path, OUT)).as_posix()
        return '<audio controls preload="none" src="' + html.escape(url, quote=True) + '?fx=2"></audio>'
    parts = ['<!doctype html><meta charset="utf-8"><title>Âm nền và tiếng động — V2</title><style>body{font:16px system-ui;background:#14181e;color:#eee;max-width:1000px;margin:32px auto;padding:0 16px}article{padding:18px 0;border-bottom:1px solid #48515e}audio{width:100%;margin:8px 0}p{color:#c4cfdb}</style><h1>Âm nền và tiếng động — V2</h1><p>28 âm tạo lại: nền có chuyển động gần–xa, tiếng động bám vật liệu và lực. Nghe A/B từng âm ở cùng mức mục tiêu −18 LUFS; đây là bản nghe riêng, chưa phải mức trộn dưới thoại. Giọng khô / FX giọng giữ bên dưới.</p>']
    vm = json.loads((PUBLIC/'thoai-fx/manifest.json').read_text(encoding='utf-8'))
    labels = {'phone': 'Loa điện thoại: hẹp, nén rõ', 'classroom': 'Giảng đường: đuôi vang rõ', 'distant-classroom': 'Xa trong lớp: lọc dải và vang', 'mirror-stereo': 'Trong gương: vang nhiều nhịp, chuyển trái/phải'}
    parts.append('<h2>Hai câu rút gọn — giữ giọng khô</h2>')
    for cid in ['C2.1_NGUOI_KIA_01', 'C3.3_NGUOI_KIA_02']:
        parts.append('<article><b>'+cid+'</b>'+player(PUBLIC/'thoai'/(cid+'.mp3'))+'</article>')
    parts.append('<h2>So sánh giọng khô / có FX</h2>')
    for cid, x in vm.items():
        dry = normalized(PUBLIC/'thoai'/(cid+'.mp3'), cid+'-dry', -16)
        parts.append('<article><b>'+cid+'</b><p>'+labels[x['kind']]+'</p><div>A — giọng khô</div>'+player(dry)+'<div>B — có FX</div>'+player(PUBLIC/'thoai-fx'/x['file'])+'</article>')
    sm = json.loads((SFX_DIR/'manifest.json').read_text(encoding='utf-8'))
    sfx_index = len(parts)
    parts.append('<h2>Nghe không gian phối lớp — 24 giây/bản</h2><p>Minh họa nền và Foley, không phải timeline cảnh đã khóa. Không có nhạc hoặc thoại.</p>')
    demos = [
        ('phong-ban-ngay', 'Phòng ban ngày: quạt gần, hẻm xa, bước dép rồi rửa bát', [('nen-phong-quat', 0.45, 0), ('hem-ban-ngay', 0.35, 0), ('dep-san-gach', 0.65, 3000), ('voi-rua-bat', 0.65, 10000), ('dat-bat', 0.5, 21000)]),
        ('goc-hoc-dem', 'Góc học đêm: nền đêm, gõ phím, khuấy cà phê và lật sách', [('dem-phong-tro', 0.6, 0), ('ban-phim', 0.65, 2000), ('khuay-ca-phe', 0.55, 11000), ('lat-sach', 0.6, 18000)]),
    ]
    for name, label, layers in demos:
        sources = [normalized(SFX_DIR / sm[n]['file'], 'sfx-v2-'+n, -18) for n, gain, delay in layers]
        chain = ';'.join(f'[{i}:a]volume={gain},adelay={delay}:all=1[a{i}]' for i, (n, gain, delay) in enumerate(layers))
        chain += ';' + ''.join(f'[a{i}]' for i in range(len(layers))) + f'amix=inputs={len(layers)}:normalize=0:duration=longest,atrim=duration=24,afade=t=in:d=0.15,afade=t=out:st=23.5:d=0.5,loudnorm=I=-18:TP=-4.5:LRA=9,alimiter=limit=0.595:level=false[out]'
        sig = hashlib.sha256(chain.encode() + b''.join(src.read_bytes() for src in sources)).hexdigest()
        key = 'mix-v2-'+name
        dst = d / (key+'.wav')
        if m.get(key, {}).get('sig') != sig or not dst.exists():
            cmd = ['ffmpeg', '-v', 'error', '-y']
            for src in sources:
                cmd += ['-i', str(src)]
            subprocess.run(cmd + ['-filter_complex', chain, '-map', '[out]', '-ar', '48000', '-c:a', 'pcm_s16le', str(dst)], check=True)
            m[key] = {'sig': sig, 'layers': layers, 'filter': chain, 'seconds': probe(dst), 'status': 'illustrative-mix-not-scene-timeline'}
            save(mp, m)
        parts.append('<article><b>'+label+'</b>'+player(dst)+'</article>')
    approved = all(x.get('status') == 'user-approved' for x in sm.values()) and all(m.get('mix-v2-'+name, {}).get('status') == 'user-approved' for name, label, layers in demos)
    review = 'Chủ repo đã duyệt bộ V2 và hai bản phối ngày 16/11/2026; chưa ghép timeline phim.' if approved else 'Chất lượng vẫn cần nghe duyệt.'
    parts.append('<h2>28 tiếng động / nền V2 — tạo lại theo chất liệu và không gian</h2><p>A: bộ cũ đã cân mức. B: bộ mới, cùng mức mục tiêu. '+review+' Audio AI sinh, không phải bản thu hiện trường thật.</p>')
    for name, x in sm.items():
        old = normalized(PUBLIC/'sfx'/x['file'], 'sfx-cu-'+name, -18)
        dest = normalized(SFX_DIR/x['file'], 'sfx-v2-'+name, -18)
        parts.append('<article><b>'+html.escape(name)+'</b><p>Cảnh '+html.escape(x['scenes'])+'</p><div>A — bộ cũ</div>'+player(old)+'<div>B — bộ mới V2</div>'+player(dest)+'</article>')
    parts = parts[:1] + parts[sfx_index:] + parts[1:sfx_index]
    (OUT/'nghe-audio-moi.html').write_text('\n'.join(parts), encoding='utf-8')
    print('PREVIEW', len(m), flush=True)


if __name__ == '__main__':
    voice_fx()
    if '--tao-sfx' in sys.argv:
        sfx()
    if '--preview' in sys.argv:
        preview()
