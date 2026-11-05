"""Step 2: the voice, with a FREE engine by default (no ElevenLabs key needed).

python <skill>/scripts/voice.py <slug> [--force]
Reads  src/episodes/<slug>/episode.json  (script, voice, gaps)
Writes public/<slug>/voice.wav (pauses tightened), src/episodes/<slug>/words.json (word timings, used by plan.py),
       out/<slug>/words_raw.json, and caches every sentence it synthesises in public/<slug>/takes/ (re-running to retune
       the gaps never re-synthesises).

episode.json "voice" (all optional):
  {"engine": "vieneu",            # vieneu (default, free, offline, Vietnamese) | edge (free, needs internet)
                                  # | file (your own recording) | elevenlabs (paid: runs voice_elevenlabs.py)
   "voice": "Hải Đăng",           # vieneu (default: Hải Đăng, the channel's voice): a preset name (list them: python voice.py --voices)
                                  # edge: e.g. "vi-VN-NamMinhNeural" or "vi-VN-HoaiMyNeural"
   "rate": "+10%",                # edge only: speaking rate
   "speed": 1.08,                 # any engine: speed the finished take up (ffmpeg atempo, pitch kept); 1 = off
   "align": "auto",               # auto (whisper if faster-whisper is installed, else syllables) | whisper | syllables
   "whisper_model": "small",      # faster-whisper model size for align
   "lang": "vi"}
  engine "file": put your own read of the whole script at public/<slug>/voice_in.wav (or .mp3); align is whisper.

How the timings work without ElevenLabs: each sentence is synthesised on its own and the takes are joined, so every
sentence's start and end are exact. Inside a sentence the words are placed by the pauses the engine left at its
commas and then spread by syllable (a Vietnamese word is one syllable, so this lands within a frame or two). When
faster-whisper is installed (pip install faster-whisper), it re-times every word from the audio itself.

episode.json "gaps" (seconds, all optional): {"word": 0.12, "comma": 0.2, "sentence": 0.3, "question": 0.45,
  "pairs": {"lại|Giờ": 0.6}}  -> every pause longer than its limit is cut to the limit, from its middle.
"""
import asyncio, difflib, hashlib, json, os, re, subprocess, sys

import numpy as np

from wi import SR, apply_pads, decode, ep_dir, load_episode, load_json, log_cost, norm, out_dir, pub_dir, save_json, write_wav

HERE = os.path.dirname(os.path.abspath(__file__))

_vn = None
V = {'engine': 'vieneu', 'voice': 'Hải Đăng', 'rate': '+0%', 'speed': 1.0, 'align': 'auto', 'whisper_model': 'small', 'lang': 'vi'}

def flatten_hf_downloads():
    """Windows: Hugging Face stores VieNeu's model through symlinks and ONNX Runtime refuses them ("External data
    path ... escapes"). Copy the files once to a plain folder (~/.cache/vieneu/flat, or VIENEU_FLAT_DIR) and use it.
    Same fix as lamvideo's tools/voice.py. VIENEU_FLATTEN=0 turns it off."""
    import shutil
    from pathlib import Path
    if os.environ.get('VIENEU_FLATTEN', '1') == '0':
        return
    try:
        from vieneu._v3_turbo_engine import onnx_runtime_lite as mod
    except Exception:
        return
    cls = mod.OnnxV3LiteEngine
    raw = cls.__dict__.get('_fetch')
    if raw is None:
        return
    is_static = isinstance(raw, staticmethod)
    orig = raw.__func__ if is_static else raw
    base = Path(os.environ.get('VIENEU_FLAT_DIR') or (Path.home() / '.cache' / 'vieneu' / 'flat'))

    def fetch(*args, **kwargs):
        src = Path(orig(*args, **kwargs))
        repo, _files, subfolder = args[-3:] if len(args) >= 3 else (None, None, None)
        dst = base / ((str(repo).replace('/', '--') if repo else src.parent.name) + '__' + str(subfolder or 'root'))
        dst.mkdir(parents=True, exist_ok=True)
        for f in src.iterdir():
            if f.is_file():
                t = dst / f.name
                if not t.exists() or t.stat().st_size != f.stat().st_size:
                    shutil.copy2(f, t)
        return dst

    cls._fetch = staticmethod(fetch) if is_static else fetch


def ensure_hf_cache():
    """Same as lamvideo's tools/voice.mjs: when the default Hugging Face cache (~/.cache/huggingface/hub) can't be
    created or written (broken folder, dead symlink, OneDrive...), keep the cache inside the repo (.cache/hf and
    .cache/vieneu-flat) - the folders `npm run voice` already uses, so nothing is downloaded twice."""
    from pathlib import Path
    hub = os.environ.get('HF_HUB_CACHE') or (os.path.join(os.environ['HF_HOME'], 'hub') if os.environ.get('HF_HOME')
                                              else str(Path.home() / '.cache' / 'huggingface' / 'hub'))
    try:
        os.makedirs(hub, exist_ok=True)
        t = os.path.join(hub, '.w%d' % os.getpid())
        open(t, 'w').write('x')
        os.remove(t)
        return
    except OSError:
        pass
    here = Path(__file__).resolve()
    root = next((d for d in here.parents if (d / 'tools' / 'voice.mjs').exists()), Path.cwd().parent)
    alt = root / '.cache' / 'hf'
    alt.mkdir(parents=True, exist_ok=True)
    os.environ['HF_HOME'] = str(alt)
    os.environ.pop('HF_HUB_CACHE', None)
    os.environ.setdefault('VIENEU_FLAT_DIR', str(root / '.cache' / 'vieneu-flat'))
    print(f'Thu muc cache mac dinh khong ghi duoc ({hub}); dung {alt}')


def load_vieneu():
    """One VieNeu instance, loaded the way lamvideo's tools/voice.py does (flattened model copies, optional ONNX dir)."""
    global _vn
    try:
        from vieneu import Vieneu
    except ImportError:
        raise SystemExit('Chua import duoc vieneu: chay bang Python da cai VieNeu-TTS (xem .vieneu-python), hoac dat '
                         'VIENEU_PYTHON, hoac dung tools/what-if.bat')
    if _vn is None:
        ensure_hf_cache()
        flatten_hf_downloads()
        kw = dict(V.get('init', {}))
        if os.environ.get('VIENEU_ONNX_DIR'):
            kw['onnx_dir'] = os.environ['VIENEU_ONNX_DIR']
        _vn = Vieneu(**kw)
    return _vn


if '--voices' in sys.argv:
    for item in load_vieneu().list_preset_voices():
        print('  ', *item if isinstance(item, (tuple, list)) else [item])
    sys.exit(0)

slug = sys.argv[1]
force = '--force' in sys.argv
ep = load_episode(slug)
V.update(ep.get('voice', {}))
if V['engine'] == 'elevenlabs':
    sys.exit(subprocess.call([sys.executable, os.path.join(HERE, 'voice_elevenlabs.py'), *sys.argv[1:]]))

WORD = re.compile(r"[\w'’]+")


def tokens(text):
    """Words with the punctuation that follows each one (it decides the pause after it)."""
    out = []
    for m in re.finditer(r"([\w'’]+)([^\w'’]*)", text):
        out.append({'w': m.group(1), 'p': m.group(2).strip()})
    return out


def sentences(text):
    return [s.strip() for s in re.findall(r'[^.!?…]+[.!?…]*[”’"\']*', text) if WORD.search(s)]


# ---------------------------------------------------------------- engines


def synth_vieneu(text, path):
    tts = load_vieneu()
    audio = tts.infer(text, voice=V['voice']) if V['voice'] else tts.infer(text)
    tts.save(audio, str(path))


def synth_edge(text, path):
    import edge_tts
    voice = V['voice'] or 'vi-VN-NamMinhNeural'
    asyncio.run(edge_tts.Communicate(text, voice, rate=V['rate']).save(str(path)))


ENGINES = {'vieneu': (synth_vieneu, 'wav'), 'edge': (synth_edge, 'mp3')}


def voiced(x, thr_db=-32):
    """The 10 ms frames that hold speech, as a boolean array, and the frame size."""
    hop = int(0.01 * SR)
    n = len(x) // hop
    rms = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    return rms > rms.max() * 10 ** (thr_db / 20), hop


def trim(x, pad=0.03):
    on, hop = voiced(x)
    idx = np.flatnonzero(on)
    if not len(idx):
        return x
    a = max(0, idx[0] * hop - int(pad * SR))
    b = min(len(x), (idx[-1] + 1) * hop + int(pad * SR))
    return x[a:b]


def gaps_inside(x, min_len=0.06):
    """Silent stretches inside a take: (start, end) seconds, longest first."""
    on, hop = voiced(x)
    out, start = [], None
    for i, v in enumerate(on):
        if not v and start is None:
            start = i
        if v and start is not None:
            if (i - start) * hop / SR >= min_len and start > 0:
                out.append((start * hop / SR, i * hop / SR))
            start = None
    return sorted(out, key=lambda g: g[0] - g[1])


def spread(toks, t0, t1):
    """Place words across [t0, t1] by syllable weight (every Vietnamese word is one syllable)."""
    w = np.array([len(t['w']) + 2.0 for t in toks])
    edges = t0 + (t1 - t0) * np.concatenate([[0], np.cumsum(w) / w.sum()])
    return [{'w': t['w'], 'p': t['p'], 's': float(edges[i]), 'e': float(edges[i + 1]) - 0.02} for i, t in enumerate(toks)]


def place(toks, x, t_off):
    """Word timings inside one take: split at the engine's own pauses for the commas, then by syllable."""
    dur = len(x) / SR
    on, hop = voiced(x)
    idx = np.flatnonzero(on)
    s0, s1 = (idx[0] * hop / SR, (idx[-1] + 1) * hop / SR) if len(idx) else (0, dur)
    breaks = [i for i, t in enumerate(toks[:-1]) if t['p']]  # a comma or dash inside the sentence
    gaps = sorted(gaps_inside(x)[: len(breaks)])
    if len(gaps) != len(breaks):
        return [dict(w, s=w['s'] + t_off, e=w['e'] + t_off) for w in spread(toks, s0, s1)]
    out, a, start = [], 0, s0
    for k, (g0, g1) in zip(breaks, gaps):
        out += spread(toks[a:k + 1], start, g0)
        a, start = k + 1, g1
    out += spread(toks[a:], start, s1)
    return [dict(w, s=w['s'] + t_off, e=w['e'] + t_off) for w in out]


def load_wav_16k(wav):
    # decode ourselves: faster-whisper's decoder (PyAV) breaks on some PyAV versions
    import wave
    import numpy as np
    with wave.open(str(wav)) as w:
        sr, ch, raw = w.getframerate(), w.getnchannels(), w.readframes(w.getnframes())
    x = np.frombuffer(raw, dtype='<i2').astype('float32') / 32768.0
    if ch > 1:
        x = x.reshape(-1, ch).mean(axis=1)
    n = int(len(x) * 16000 / sr)
    return np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype('float32')


def fix_order(words):
    """Whisper sometimes matches a word to the wrong place (a repeated syllable): its time jumps back before its
    neighbour's. Such words would cut the picture early, so re-place each one between the good words around it."""
    n = len(words)
    good = [True] * n
    for i in range(n):
        lo = words[i - 1]['s'] if i > 0 else -1e9
        hi = words[i + 1]['s'] if i + 1 < n else 1e9
        if not (lo <= words[i]['s'] <= hi) or words[i]['e'] < words[i]['s']:
            good[i] = False
    i, fixed = 0, 0
    while i < n:
        if good[i]:
            i += 1
            continue
        j = i
        while j < n and not good[j]:
            j += 1
        t0 = words[i - 1]['e'] if i > 0 else 0.0
        t1 = words[j]['s'] if j < n else t0 + 0.3 * (j - i)
        step = max(0.0, t1 - t0) / (j - i)
        for k in range(i, j):
            words[k]['s'] = round(t0 + step * (k - i), 3)
            words[k]['e'] = round(t0 + step * (k - i + 1), 3)
            fixed += 1
        i = j
    if fixed:
        print(f'fixed {fixed} out-of-order word times')
    return words


def whisper_align(wav, words):
    """Re-time words from the audio with faster-whisper; words it doesn't match keep their estimate."""
    from faster_whisper import WhisperModel
    ensure_hf_cache()  # when every take was cached, VieNeu never loaded, so the cache fallback hasn't run yet
    model =WhisperModel(V['whisper_model'], device='cpu', compute_type='int8')  # 'auto' picks CUDA, which fails when cublas is missing
    segs, _ = model.transcribe(load_wav_16k(wav), language=V['lang'], word_timestamps=True, vad_filter=False)
    hw = []
    for s in segs:
        for w in s.words:
            for piece in WORD.findall(w.word):  # whisper sometimes joins syllables: share its time between them
                hw.append({'w': piece, 's': w.start, 'e': w.end})
    a = [norm(w['w']) for w in words]
    b = [norm(w['w']) for w in hw]
    hit = 0
    for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            words[blk.a + k]['s'], words[blk.a + k]['e'] = hw[blk.b + k]['s'], hw[blk.b + k]['e']
            hit += 1
    print(f'whisper matched {hit} of {len(words)} words')
    return words


def have_whisper():
    try:
        import faster_whisper  # noqa: F401
        return True
    except ImportError:
        return False


# ---------------------------------------------------------------- build the raw take
text = ' '.join(b['text'].strip() for b in ep['script'])
pub, od = pub_dir(slug), out_dir(slug)
raw_wav = pub / 'voice_raw.wav'
raw_words = od / 'words_raw.json'
sig = hashlib.sha1(json.dumps([text, V], sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:12]
meta = load_json(od / 'voice_meta.json', {})

if force or meta.get('sig') != sig or not raw_wav.exists() or not raw_words.exists():
    words = []
    if V['engine'] == 'file':
        src = next((p for p in (pub / 'voice_in.wav', pub / 'voice_in.mp3') if p.exists()), None)
        if not src:
            raise SystemExit(f'engine "file": put your read of the script at {pub / "voice_in.wav"}')
        x = trim(decode(src))
        allt = tokens(text)
        words = spread(allt, 0.03, len(x) / SR - 0.03)
    else:
        if V['engine'] not in ENGINES:
            raise SystemExit(f'Unknown voice engine "{V["engine"]}": use vieneu, edge, file or elevenlabs')
        fn, ext = ENGINES[V['engine']]
        takes = pub / 'takes'
        takes.mkdir(exist_ok=True)
        parts, t = [], 0.0
        lead = np.zeros(int(0.05 * SR))
        parts.append(lead)
        t = len(lead) / SR
        for s in sentences(text):
            h = hashlib.sha1(json.dumps([s, V['engine'], V['voice'], V['rate'], V.get('init')], ensure_ascii=False).encode()).hexdigest()[:10]
            p = takes / f'{h}.{ext}'
            if not p.exists():
                print(f'  {V["engine"]}: {s}')
                fn(s, p)
            x = trim(decode(p))
            words += place(tokens(s), x, t)
            parts += [x, np.zeros(int(0.5 * SR))]  # a long pause between takes; tightening cuts it to the limit
            t += len(x) / SR + 0.5
        x = np.concatenate(parts)
    sp = float(V.get('speed') or 1.0)
    if abs(sp - 1) > 1e-3:
        write_wav(od / '_pre_speed.wav', x)
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(od / '_pre_speed.wav'), '-filter:a', f'atempo={sp}', str(od / '_sped.wav')], check=True)
        x = decode(od / '_sped.wav')
        words = [dict(w, s=w['s'] / sp, e=w['e'] / sp) for w in words]
    write_wav(raw_wav, x)
    use_whisper = V['align'] == 'whisper' or V['engine'] == 'file' or (V['align'] == 'auto' and have_whisper())
    if use_whisper:
        if not have_whisper():
            raise SystemExit('align "whisper" needs faster-whisper: pip install faster-whisper')
        words = fix_order(whisper_align(raw_wav, words))
    else:
        print('word timings from the takes and syllables (pip install faster-whisper for timings read from the audio)')
    for w in words:
        w['s'], w['e'] = round(w['s'], 3), round(max(w['e'], w['s'] + 0.04), 3)
    save_json(raw_words, words)
    save_json(od / 'voice_meta.json', {'sig': sig, 'chars': len(text), 'engine': V['engine']})
    log_cost(slug, 'voice', 0, f'{V["engine"]} (free), {len(text)} characters')
else:
    print('Voice unchanged since the last run: reusing it.')

# ---------------------------------------------------------------- tighten the pauses (same rules as the original)
words = load_json(raw_words)
G = {'word': 0.12, 'comma': 0.2, 'sentence': 0.3, 'question': 0.45, 'pairs': {}}
G.update(ep.get('gaps', {}))
x = decode(raw_wav)
cuts = []


def bare(w):
    return re.sub(r'[^\w]', '', w)


for a, b in zip(words, words[1:]):
    gap = b['s'] - a['e']
    key = bare(a['w']) + '|' + bare(b['w'])
    if key in G['pairs']:
        keep = G['pairs'][key]
    elif '?' in a['p'] or '!' in a['p']:
        keep = G['question']
    elif '.' in a['p'] or ':' in a['p'] or ';' in a['p'] or '…' in a['p']:
        keep = G['sentence']
    elif ',' in a['p'] or '—' in a['p'] or '-' in a['p']:
        keep = G['comma']
    else:
        keep = G['word']
    if gap > keep:
        mid = (a['e'] + b['s']) / 2
        rm = gap - keep
        cuts.append((mid - rm / 2, mid + rm / 2))
parts, last = [], 0.0
for s, e in cuts:
    parts.append(x[int(last * SR):int(s * SR)])
    last = e
parts.append(x[int(last * SR):])
fade = int(0.004 * SR)
for i, part in enumerate(parts):
    part = part.copy()
    if i > 0 and len(part) > fade:
        part[:fade] *= np.linspace(0, 1, fade)
    if i < len(parts) - 1 and len(part) > fade:
        part[-fade:] *= np.linspace(1, 0, fade)
    parts[i] = part
y = np.concatenate(parts)


def shift(t):
    return t - sum(min(e, t) - s for s, e in cuts if t > s)


out = [{'w': w['w'], 's': round(shift(w['s']), 3), 'e': round(shift(w['e']), 3), 'p': w.get('p', '')} for w in words]

# "pads": room for the picture to breathe (scene changes, a title card, an opening held on a sound)
y, padded = apply_pads(y, out, ep.get('pads'))
write_wav(pub / 'voice.wav', y)
save_json(ep_dir(slug) / 'words.json', out)
if padded:
    print(f'Padded pauses: +{padded:.2f} s')
print(f'Tightened {len(cuts)} pauses, removed {sum(e - s for s, e in cuts):.2f} s: {len(x) / SR:.2f} s -> {len(y) / SR:.2f} s')
print(' '.join(f"{w['w']}@{w['s']}" for w in out))
