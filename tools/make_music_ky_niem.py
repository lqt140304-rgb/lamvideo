"""Nhạc nền cảm xúc "Ký ức" (piano chậm + nền dây mềm + chuông hộp nhạc), tạo hoàn toàn bằng code.
Không dùng mẫu âm thanh của ai, nên không lo bản quyền / Content ID.

    python tools/make_music_ky_niem.py     # ghi public/audio/music/ky-niem.mp3 (khoảng 170 giây, cần ffmpeg để nén)
"""
from __future__ import annotations
import wave
from pathlib import Path
import numpy as np
from scipy import signal

SR = 44100
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "audio" / "music" / "ky-niem.wav"
rng = np.random.default_rng(11)
BPM = 66
BEAT = 60 / BPM
BAR = 4 * BEAT
DUR = 172.0
N = int(DUR * SR)
L = np.zeros(N); R = np.zeros(N)

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)

def add(buf_l, buf_r, t0, sig, pan=0.0):
    i = max(0, int(t0 * SR))
    if i >= N: return
    j = min(N, i + len(sig))
    s = sig[: j - i]
    buf_l[i:j] += s * (1 - pan) * 0.5 * 2 ** 0.5 / 1.0 * 0.7
    buf_r[i:j] += s * (1 + pan) * 0.5 * 2 ** 0.5 / 1.0 * 0.7

def piano(m, dur, vel=0.5):
    n = int((dur + 1.2) * SR); t = np.arange(n) / SR
    f = hz(m); s = np.zeros(n)
    for k, a in enumerate([1, 0.55, 0.3, 0.16, 0.09, 0.05], 1):
        inh = f * k * (1 + 0.0004 * k * k)
        s += a * np.sin(2 * np.pi * inh * t) * np.exp(-t * (1.2 + 0.9 * k) / (1 + (m - 40) / 40))
    click = rng.standard_normal(n) * np.exp(-t * 90) * 0.04
    s = (s + click) * vel
    att = np.minimum(1, t / 0.004)
    rel = np.minimum(1, np.maximum(0, (dur + 1.2 - t)) / 0.6)
    return s * att * rel

def bell(m, vel=0.3):
    n = int(3.2 * SR); t = np.arange(n) / SR; f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 3) + 0.25 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 6)
    return s * np.exp(-t * 1.5) * vel * np.minimum(1, t / 0.003)

def pad(ms, dur, vel=0.12):
    n = int((dur + 2.0) * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for m in ms:
        for d in (-0.07, 0.0, 0.07):
            f = hz(m) * 2 ** (d / 12)
            s += signal.sawtooth(2 * np.pi * f * t) / 3
    sos = signal.butter(2, 900, "low", fs=SR, output="sos")
    s = signal.sosfilt(sos, s)
    env = np.minimum(1, t / 1.6) * np.minimum(1, np.maximum(0, (dur + 2.0 - t)) / 1.8)
    return s * env * vel

# (bass, [arpeggio notes], pad chord) — Am, F, C, G ... rồi kết bằng F, G, C sáng lên
A = (45, [57, 60, 64, 69], [57, 60, 64])
F = (41, [53, 57, 60, 65], [53, 57, 60])
C = (48, [55, 60, 64, 67], [55, 60, 64])
G = (43, [55, 59, 62, 67], [55, 59, 62])
Fm7 = (41, [57, 60, 64, 65], [57, 60, 64])
sections = [(A, F, C, G)] * 5 + [(F, C, G, A)] * 2 + [(F, G, C, C)]
bars = [c for sec in sections for c in sec]
t = 0.0
for bi, (bass, arp, pd) in enumerate(bars):
    t0 = bi * BAR
    if t0 >= DUR: break
    intensity = min(1.0, 0.35 + bi / 30)
    if bi > 24: intensity = max(0.55, intensity - 0.15)
    add(L, R, t0, piano(bass, BAR * 1.6, 0.42 * intensity), -0.15)
    add(L, R, t0, pad(pd, BAR, 0.10 + 0.05 * intensity), 0.0)
    # arpeggio móc đơn, nhấn nhẹ, hơi lệch giờ cho tự nhiên
    pattern = [0, 1, 2, 3, 2, 1, 2, 3] if bi % 2 == 0 else [0, 1, 2, 3, 3, 2, 1, 2]
    for k, idx in enumerate(pattern):
        jitter = rng.normal(0, 0.006)
        v = (0.34 if k % 4 else 0.42) * intensity * (0.9 + 0.2 * rng.random())
        add(L, R, t0 + k * BEAT / 2 + jitter, piano(arp[idx] + (12 if bi > 8 and k == 7 else 0), BEAT * 1.2, v), 0.1)
    # giai điệu chuông hộp nhạc xuất hiện từ ô nhịp thứ 12
    if bi >= 12 and bi % 2 == 0:
        notes = {A[0]: [76, 72, 69], F[0]: [77, 72, 69], C[0]: [79, 76, 72], G[0]: [74, 71, 67]}[bass]
        for q, nn in enumerate(notes):
            add(L, R, t0 + (q * 1.5 + 0.5) * BEAT, bell(nn, 0.22 * intensity), 0.3 if q % 2 else -0.3)
# nốt kết dài, sáng
for nn in (48, 60, 64, 67, 72):
    add(L, R, 40 * 0 + (len(bars) - 1) * BAR + 0.05, piano(nn, 9.0, 0.36), 0.0)

# vang (reverb) bằng đáp ứng xung nhiễu tắt dần
ir_n = int(2.8 * SR)
ir = rng.standard_normal((2, ir_n)) * np.exp(-np.arange(ir_n) / SR * 2.1)
ir[:, : int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))
wetL = signal.fftconvolve(L, ir[0])[:N]; wetR = signal.fftconvolve(R, ir[1])[:N]
wetL /= np.max(np.abs(wetL)) + 1e-9; wetR /= np.max(np.abs(wetR)) + 1e-9
outL = L / (np.max(np.abs(L)) + 1e-9) * 0.75 + wetL * 0.35
outR = R / (np.max(np.abs(R)) + 1e-9) * 0.75 + wetR * 0.35
peak = max(np.max(np.abs(outL)), np.max(np.abs(outR)))
outL, outR = outL / peak * 0.85, outR / peak * 0.85
fade = np.minimum(1, np.minimum(np.arange(N) / (1.5 * SR), (N - np.arange(N)) / (4 * SR)))
outL *= fade; outR *= fade
data = (np.stack([outL, outR], 1) * 32767).astype("<i2")
OUT.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(OUT), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())
print("ghi", OUT, f"{DUR:.0f}s")
import shutil, subprocess
if shutil.which("ffmpeg"):  # nén mp3 cho nhẹ (30MB -> 3MB)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(OUT), "-b:a", "160k", str(OUT.with_suffix(".mp3"))], check=True)
    OUT.unlink()
    print("nén thành", OUT.with_suffix(".mp3"))
