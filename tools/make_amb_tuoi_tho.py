"""Âm thanh môi trường cho bản xem thử "Mùi cỏ ngoài đồng": gió, chim sẻ, ve, bước chân trên đất,
xe đạp (nan hoa lách cách + chuông), quạt nan. Tự tổng hợp bằng numpy, không dùng mẫu âm có bản quyền.
    python tools/make_amb_tuoi_tho.py out.wav
Mốc thời gian khớp script.json (ước lượng khi chưa có giọng); sửa SCENE_START nếu độ dài cảnh thay đổi."""
import sys
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 44100
FPS = 30
TOTAL = 74.0
SCENE_START = [0, 450, 810, 1140, 1800]  # khung hình bắt đầu từng cảnh
rng = np.random.default_rng(7)
N = int(TOTAL * SR)
L = np.zeros(N)
R = np.zeros(N)


def add(sig, t0, pan=0.0, gain=1.0):
    i = int(t0 * SR)
    if i >= N or i + len(sig) <= 0:
        return
    a = max(0, -i)
    sig = sig[a:]
    i = max(0, i)
    j = min(N, i + len(sig))
    sig = sig[: j - i] * gain
    l = np.cos((pan + 1) * np.pi / 4)
    r = np.sin((pan + 1) * np.pi / 4)
    L[i:j] += sig * l
    R[i:j] += sig * r


def lowpass(x, fc, order=2):
    return signal.lfilter(*signal.butter(order, fc / (SR / 2)), x)


def bandpass(x, lo, hi, order=2):
    return signal.lfilter(*signal.butter(order, [lo / (SR / 2), hi / (SR / 2)], btype="band"), x)


# gió: ồn lọc thấp, biên độ trôi chậm
t = np.arange(N) / SR
w = lowpass(rng.standard_normal(N), 700) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.11 * t + 1) * np.sin(2 * np.pi * 0.047 * t + 2))
w2 = bandpass(rng.standard_normal(N), 900, 2400) * 0.12 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.19 * t))
L += (w * 0.05 + w2 * 0.05)
R += (w * 0.05 + w2 * 0.05)[::-1] * 0 + (np.roll(w, 4000) * 0.05 + w2 * 0.05)


def chirp(f0, f1, dur, vib=0.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = f0 + (f1 - f0) * (tt / dur) + vib * np.sin(2 * np.pi * 40 * tt)
    ph = 2 * np.pi * np.cumsum(f) / SR
    env = np.sin(np.pi * np.arange(n) / n) ** 1.5
    return np.sin(ph) * env * 0.5 + 0.18 * np.sin(2 * ph) * env


def sparrow(t0, pan, gain=0.5):
    k = rng.integers(3, 7)
    t_ = t0
    for _ in range(k):
        f0 = rng.uniform(3000, 4300)
        add(chirp(f0, f0 + rng.uniform(-600, 700), rng.uniform(0.05, 0.1), 80), t_, pan, gain)
        t_ += rng.uniform(0.11, 0.2)


# chim rải suốt video (nhiều ở cảnh 1, 3, 5)
for tt0 in [2.4, 5.1, 9.6, 12.3, 14.0, 24.5, 28.0, 31.5, 35.0, 42.0, 47.0, 52.5, 58.0, 63.0, 67.5, 70.5]:
    sparrow(tt0 + rng.uniform(-0.3, 0.3), rng.uniform(-0.8, 0.8), rng.uniform(0.25, 0.5))
# chim sẻ bay đi: cánh đập (cảnh 1 khung 190, cảnh 3 khung 40, cảnh 5 khung 420)
for f in (SCENE_START[0] + 190, SCENE_START[2] + 40, SCENE_START[4] + 420):
    t0 = f / FPS
    sparrow(t0 - 0.2, 0.2, 0.55)
    for k in range(10):
        add(bandpass(rng.standard_normal(int(0.05 * SR)), 500, 3000) * np.hanning(int(0.05 * SR)), t0 + k * 0.06, 0.2, 0.35)

# ve sầu (sân nhà, cảnh 4 và 5)
a0, a1 = SCENE_START[3] / FPS, TOTAL
n = int((a1 - a0) * SR)
tt = np.arange(n) / SR
cic = bandpass(rng.standard_normal(n), 3800, 5200) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 36 * tt)) * 0.7) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.23 * tt))
add(cic * 0.05, a0, -0.3)
add(np.roll(cic, 900) * 0.04, a0, 0.4)


def step(t0, pan, gain=0.5, dirt=True):
    n_ = int(0.09 * SR)
    x = lowpass(rng.standard_normal(n_), 1100 if dirt else 2500) * np.exp(-np.arange(n_) / (0.018 * SR))
    x += 0.35 * lowpass(rng.standard_normal(n_), 300) * np.exp(-np.arange(n_) / (0.03 * SR))
    add(x, t0, pan, gain)


# cảnh 2: bé đi vào (khung 0–60), bước mỗi 0.25s
for k in range(7):
    t0 = (SCENE_START[1] + k * 7.5 + 2) / FPS
    step(t0, -0.5 + k * 0.12, 0.55)
# xe đạp: bx = -340 + (f-95)*12, bắt đầu khung 95; qua màn hình khi bx>1400
f_start = SCENE_START[1] + 95
f_end = f_start + int((1400 + 340) / 12)
dur = (f_end - f_start) / FPS
nb = int(dur * SR)
tb = np.arange(nb) / SR
# nan hoa/bánh đà lách cách: tiếng tick tốc độ đều
tick_t = np.arange(0, dur, 1 / 26)
pan_path = lambda x: float(np.clip((x - 540) / 540, -1, 1))
for x_t in tick_t:
    bx = -340 + x_t * FPS * 12
    pos = pan_path(bx)
    g = 0.5 * (1 - abs(pos) * 0.45)
    n_ = int(0.006 * SR)
    add(bandpass(rng.standard_normal(n_), 2000, 5000) * np.hanning(n_), f_start / FPS + x_t, pos, g)
# xích/bánh xe: ồn nhẹ trôi theo xe
rattle = bandpass(rng.standard_normal(nb), 400, 1500) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * tb)) * np.hanning(nb) ** 0.6
add(rattle * 0.16, f_start / FPS, 0.0, 1.0)
# chuông "kring" khi xe tới gần bé (bx≈300)
tbell = (f_start + int((300 + 340) / 12)) / FPS
for rep, dt in enumerate((0.0, 0.16)):
    for fr, amp in ((2750, 1.0), (3480, 0.6), (5200, 0.25)):
        n_ = int(0.7 * SR)
        x = np.sin(2 * np.pi * fr * np.arange(n_) / SR) * np.exp(-np.arange(n_) / (0.13 * SR))
        add(x, tbell + dt, -0.1, 0.16 * amp)

# cảnh 3: diều phần phật + bé chạy (từ khung 150)
for k in range(8):
    t0 = (SCENE_START[2] + 20 + k * 36) / FPS + rng.uniform(-0.1, 0.1)
    n_ = int(0.35 * SR)
    add(bandpass(rng.standard_normal(n_), 500, 1800) * np.hanning(n_) * (0.5 + 0.5 * np.sin(np.arange(n_) / SR * 70)), t0, 0.3, 0.18)
for k in range(24):
    t0 = (SCENE_START[2] + 150 + k * 6.2) / FPS
    step(t0, -0.1 + k * 0.04, 0.55 * max(0.25, 1 - k / 30))
# cảnh 4: bé chạy vào sân (khung 0–100)
for k in range(15):
    t0 = (SCENE_START[3] + 3 + k * 6.6) / FPS
    step(t0, -0.8 + k * 0.08, 0.5, dirt=False)


# quạt nan: "phạch" mỗi 1.15s khi bà cầm quạt (cảnh 4: 0–7s và 11s+, cảnh 5 cả cảnh)
def swish(t0):
    n_ = int(0.16 * SR)
    add(bandpass(rng.standard_normal(n_), 350, 2200) * np.hanning(n_), t0, -0.35, 0.22)


tcur = SCENE_START[3] / FPS + 1.2
while tcur < TOTAL - 1.5:
    rel = tcur - SCENE_START[3] / FPS
    if not (7.0 <= rel < 11.0):
        swish(tcur)
    tcur += 1.15

# mở/tắt dần, chuẩn hóa
fade = np.minimum(1, np.minimum(t / 0.8, (TOTAL - t) / 2.2))
L *= fade
R *= fade
peak = max(np.abs(L).max(), np.abs(R).max())
L, R = L / peak * 0.55, R / peak * 0.55
out = np.stack([L, R], axis=1)
wavfile.write(sys.argv[1] if len(sys.argv) > 1 else "ambience.wav", SR, (out * 32767).astype(np.int16))
print("ok", TOTAL, "giây")
