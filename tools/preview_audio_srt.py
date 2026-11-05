"""Bản xem thử khi CHƯA có giọng: dựng mốc thời gian (ước lượng, hoặc theo voice.json nếu đã có), xuất SRT và
một file âm thanh gồm tiếng nền + hiệu ứng + nhạc (không có giọng) để ghép vào MP4 xem thử.

    python tools/preview_audio_srt.py giay-moi-van-la-minh   # → out/<slug>/xem-thu.srt, xem-thu-am.wav, timings.json
Khi đã chạy `npm run voice`, SRT dùng mốc thật từ public/<slug>/voice/voice.json.
"""
import json, re, sys, math
from pathlib import Path
import numpy as np
from scipy.io import wavfile
from scipy import signal

ROOT = Path(__file__).resolve().parent.parent
slug = sys.argv[1]
script = json.loads((ROOT / "videos" / slug / "script.json").read_text(encoding="utf8"))
FPS, SR = 30, 44100
man = None
mp = ROOT / "public" / slug / "voice" / "voice.json"
if mp.exists():
    m = json.loads(mp.read_text(encoding="utf8"))
    if len(m["scenes"]) == len(script["scenes"]):
        man = m
est = lambda text: len(text.split()) / 4.3 + 0.4

timings, t0 = [], 0
for i, sc in enumerate(script["scenes"]):
    lines = sc.get("lines", [])
    real = man["scenes"][i].get("lines") if man else None
    if real is not None and len(real) == len(lines):
        L = [(l["start"], l["seconds"]) for l in real]
        speech = man["scenes"][i]["seconds"]
    else:
        t, L = 0.1, []
        for k, ln in enumerate(lines):
            t = max(t, ln["at"]) if "at" in ln else t + (0 if k == 0 else ln.get("gap", 0.3))
            s = est(ln["text"]); L.append((t, s)); t += s
        speech = t if lines else 0.1
    frames = max(round((speech + sc.get("pad", 0.35)) * FPS), FPS)
    timings.append({"from": t0, "frames": frames, "lines": [(round(a * FPS), round(b * FPS)) for a, b in L]})
    t0 += frames
total = t0 / FPS
out = ROOT / "out" / slug
out.mkdir(parents=True, exist_ok=True)
(out / "timings.json").write_text(json.dumps(timings))

def ts(sec):
    ms = int(round(sec * 1000)); h, ms = divmod(ms, 3600000); mi, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{mi:02d}:{s:02d},{ms:03d}"
srt, n = [], 1
for sc, tm in zip(script["scenes"], timings):
    for ln, (a, d) in zip(sc.get("lines", []), tm["lines"]):
        st = (tm["from"] + a) / FPS
        name = {"MINH": "Minh", "BOM": "Bờm", "NA": "Na", "TEO": "Tèo"}.get(ln["who"], ln["who"])
        srt.append(f"{n}\n{ts(st)} --> {ts(st + d / FPS)}\n{name}: {ln.get('sub', ln['text'])}\n")
        n += 1
(out / "xem-thu.srt").write_text("\n".join(srt), encoding="utf8")

# âm thanh
N = int(total * SR)
mix = np.zeros(N)
def load(f):
    sr, d = wavfile.read(ROOT / "public" / f)
    d = d.astype("float32") / (32768.0 if d.dtype == np.int16 else 1)
    if d.ndim > 1: d = d.mean(1)
    if sr != SR: d = signal.resample_poly(d, SR, sr)
    return d
cache = {}
def get(f):
    if f not in cache: cache[f] = load(f)
    return cache[f]
for sc, tm in zip(script["scenes"], timings):
    a0 = int(tm["from"] / FPS * SR); a1 = min(N, a0 + int(tm["frames"] / FPS * SR))
    if sc.get("amb"):
        d = get(f"audio/sfx/amb-{sc['amb']}.wav"); r = np.resize(d, a1 - a0)
        fade = np.minimum(1, np.minimum(np.arange(a1 - a0) / (0.3 * SR), (a1 - a0 - np.arange(a1 - a0)) / (0.3 * SR)))
        mix[a0:a1] += r * 0.35 * fade
    for x in sc.get("sfx", []):
        d = get(f"audio/sfx/{x['file']}") * x.get("volume", 0.5)
        d = d[: int(x.get("len", 2) * SR)]
        i = a0 + int(x["at"] * SR); j = min(N, i + len(d))
        if i < N: mix[i:j] += d[: j - i]
if script.get("music"):
    d = get(script["music"]); r = np.resize(d, N) * script.get("musicVolume", 0.2)
    fade = np.minimum(1, np.minimum(np.arange(N) / (1.0 * SR), (N - np.arange(N)) / (2.0 * SR)))
    mix += r * fade
mix = mix / max(1e-6, np.abs(mix).max()) * 0.8
wavfile.write(out / "xem-thu-am.wav", SR, (mix * 32767).astype(np.int16))
print(f"{slug}: {total:.1f} s (ước lượng), {n-1} lượt, SRT + âm thanh → {out}")
