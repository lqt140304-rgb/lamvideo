"""Âm thanh tự tổng hợp cho "Giày mới. Vẫn là mình.": báo thức khô, giấy sột soạt, bước chân, cửa, tiếng phòng, công viên (lá, chim).
    python tools/make_sfx_giay.py   # ghi public/audio/sfx/{alarm,paper,step,door,amb-room,amb-park}.wav"""
from pathlib import Path
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "public" / "audio" / "sfx"
rng = np.random.default_rng(5)


def lp(x, fc, o=2): return signal.lfilter(*signal.butter(o, fc / (SR / 2)), x)
def bp(x, lo, hi, o=2): return signal.lfilter(*signal.butter(o, [lo / (SR / 2), hi / (SR / 2)], btype="band"), x)
def save(name, x, peak=0.8):
    x = x / (np.abs(x).max() + 1e-9) * peak
    wavfile.write(OUT / name, SR, (x * 32767).astype(np.int16))


# báo thức: ba tiếng bíp khô lặp
def beep(f=1760, d=0.11):
    t = np.arange(int(d * SR)) / SR
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)) * np.minimum(1, np.minimum(t / 0.005, (d - t) / 0.01))
alarm = np.zeros(int(3.0 * SR))
for rep in range(5):
    for k in range(3):
        b = beep()
        i = int((rep * 0.6 + k * 0.15) * SR)
        alarm[i:i + len(b)] += b
save("alarm.wav", alarm, 0.7)
# giấy sột soạt
n = int(1.8 * SR)
env = np.zeros(n)
for _ in range(14):
    c = int(rng.uniform(0.05, 1.6) * SR); w = int(rng.uniform(0.03, 0.12) * SR)
    env[c:c + w] += np.hanning(min(w, n - c)) * rng.uniform(0.3, 1)
save("paper.wav", bp(rng.standard_normal(n), 2500, 9000) * env, 0.55)
# bước chân trên lối đi
m = int(0.2 * SR)
st = (lp(rng.standard_normal(m), 1500) * np.exp(-np.arange(m) / (0.02 * SR)) + 0.6 * lp(rng.standard_normal(m), 280) * np.exp(-np.arange(m) / (0.035 * SR)))
save("step.wav", st, 0.6)
# cửa khép
m = int(0.6 * SR)
door = lp(rng.standard_normal(m), 600) * np.exp(-np.arange(m) / (0.07 * SR)) + 0.5 * np.sin(2 * np.pi * 90 * np.arange(m) / SR) * np.exp(-np.arange(m) / (0.1 * SR))
click = np.zeros(m); click[int(0.28 * SR):int(0.28 * SR) + 400] = bp(rng.standard_normal(400), 1500, 6000) * np.hanning(400)
save("door.wav", door * 0.8 + click * 0.5, 0.6)
# tiếng phòng (quạt, ồn nhẹ) 20 giây lặp
N = 20 * SR
t = np.arange(N) / SR
room = lp(rng.standard_normal(N), 380) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.37 * t)) + 0.25 * bp(rng.standard_normal(N), 90, 140) * 3
save("amb-room.wav", room, 0.4)
# công viên: lá xào xạc + chim xa
park = bp(rng.standard_normal(N), 800, 3500) * (0.4 + 0.6 * np.sin(2 * np.pi * 0.09 * t + 1) ** 2) * 0.5 + lp(rng.standard_normal(N), 250) * 0.5
def chirp(f0, d):
    n_ = int(d * SR); tt = np.arange(n_) / SR
    return np.sin(2 * np.pi * np.cumsum(f0 + 700 * np.sin(2 * np.pi * 14 * tt)) / SR) * np.sin(np.pi * np.arange(n_) / n_) ** 2
for c0 in rng.uniform(0.5, 18.5, 22):
    i = int(c0 * SR)
    for k in range(rng.integers(2, 5)):
        ch = chirp(rng.uniform(3000, 4300), rng.uniform(0.07, 0.14)) * 0.22
        j = i + int(k * 0.17 * SR)
        park[j:j + len(ch)] += ch[: N - j]
save("amb-park.wav", park, 0.4)
print("ok")
