"""Tạo nhạc nền và âm thanh hiệu ứng (SFX) bằng code, không dùng mẫu âm thanh nào của người khác,
nên dùng thoải mái cho video thương mại, không lo bản quyền hay Content ID.

    python tools/make_audio.py          # ghi public/audio/music/*.wav và public/audio/sfx/*.wav

Cần numpy, scipy. Đổi giai điệu, nhịp, hợp âm ở phần cấu hình bên dưới rồi chạy lại.
"""

from __future__ import annotations

import wave
from pathlib import Path

import numpy as np
from scipy import signal

SR = 44100
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "audio"
rng = np.random.default_rng(7)


def save(path: Path, x: np.ndarray, peak: float = 0.89) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    x = np.asarray(x, dtype=np.float64)
    m = np.max(np.abs(x)) or 1.0
    y = np.clip(x / m * peak, -1, 1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((y * 32767).astype("<i2").tobytes())
    print(f"  {path.relative_to(ROOT)}  {len(y) / SR:.2f}s")


def t_axis(sec: float) -> np.ndarray:
    return np.arange(int(sec * SR)) / SR


def midi(n: float) -> float:
    return 440.0 * 2 ** ((n - 69) / 12)


def env(n: int, attack: float, decay: float) -> np.ndarray:
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-t / decay)


def lowpass(x, hz, order=2):
    b, a = signal.butter(order, hz / (SR / 2), "low")
    return signal.lfilter(b, a, x)


def highpass(x, hz, order=2):
    b, a = signal.butter(order, hz / (SR / 2), "high")
    return signal.lfilter(b, a, x)


def bandpass(x, lo, hi, order=2):
    b, a = signal.butter(order, [lo / (SR / 2), hi / (SR / 2)], "band")
    return signal.lfilter(b, a, x)


def reverb(x: np.ndarray, mix: float = 0.22) -> np.ndarray:
    """Vang kiểu Schroeder: 4 comb song song + 2 allpass nối tiếp."""
    out = np.zeros_like(x)
    for d, g in ((1557, 0.80), (1617, 0.79), (1491, 0.78), (1422, 0.77)):
        a = np.zeros(d + 1)
        a[0], a[d] = 1, -g
        out += signal.lfilter([1], a, x)
    out /= 4
    for d, g in ((225, 0.5), (556, 0.5)):
        b = np.zeros(d + 1)
        b[0], b[d] = -g, 1
        a = np.zeros(d + 1)
        a[0], a[d] = 1, -g
        out = signal.lfilter(b, a, out)
    return (1 - mix) * x + mix * lowpass(out, 5000)


# ---- Nhạc nền "Giấy nháp": nhẹ, vui, kiểu lo-fi giải thích ----------------------------------

BPM = 96
BEAT = 60 / BPM
# Hợp âm mỗi ô nhịp (số MIDI của nốt gốc, kiểu): C – G – Am – F, lặp 2 lần = 8 ô nhịp
CHORDS = [(60, "maj"), (55, "maj"), (57, "min"), (53, "maj")] * 2
BARS = len(CHORDS)
LOOP = BARS * 4 * BEAT


def chord_tones(root: int, kind: str) -> list[int]:
    third = 3 if kind == "min" else 4
    return [root, root + third, root + 7, root + 12, root + 12 + third, root + 19]


def marimba(freq: float, dur: float, vel: float) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * freq * 3.93 * t) * np.exp(-t / 0.05)
    tone += 0.12 * np.sin(2 * np.pi * freq * 9.2 * t) * np.exp(-t / 0.015)
    return vel * tone * env(n, 0.002, 0.32)


def pad_note(freq: float, dur: float) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * freq * k * t + rng.uniform(0, 6)) / k**1.6 for k in (1, 2, 3))
    x = x * 0.5 + 0.5 * sum(np.sin(2 * np.pi * freq * 1.003 * k * t) / k**1.6 for k in (1, 2, 3))
    a = np.clip(t / 0.35, 0, 1) * np.clip((dur - t) / 0.45, 0, 1)
    return x * a


def kick() -> np.ndarray:
    n = int(0.22 * SR)
    t = np.arange(n) / SR
    f = 46 + 90 * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.09)


def shaker() -> np.ndarray:
    n = int(0.06 * SR)
    return highpass(rng.standard_normal(n), 6000) * env(n, 0.004, 0.018)


def snap() -> np.ndarray:
    n = int(0.12 * SR)
    return bandpass(rng.standard_normal(n), 900, 3500) * env(n, 0.001, 0.035)


def add(buf: np.ndarray, x: np.ndarray, at: float) -> None:
    i = int(round(at * SR))
    if i >= len(buf):
        return
    j = min(len(buf), i + len(x))
    buf[i:j] += x[: j - i]


def music_giay_nhap() -> np.ndarray:
    # dựng 3 vòng rồi lấy vòng giữa để đuôi vang nối tròn khi phát lặp
    total = 3 * LOOP + 2
    pluck = np.zeros(int(total * SR))
    pads = np.zeros_like(pluck)
    bass = np.zeros_like(pluck)
    drums = np.zeros_like(pluck)
    pattern = [0, 2, 3, 1, 4, 2, 3, 5]  # thứ tự nốt rải trong một ô nhịp (8 móc đơn)
    melody = [None, 76, None, 79, 77, None, 76, 74]  # câu nhạc nhỏ ở các ô nhịp lẻ
    for loop in range(3):
        for bar, (root, kind) in enumerate(CHORDS):
            t0 = loop * LOOP + bar * 4 * BEAT
            tones = chord_tones(root + 12 if root < 57 else root, kind)
            for k, idx in enumerate(pattern):
                swing = 0.03 * BEAT if k % 2 else 0
                vel = 0.55 if k % 2 else 0.75
                add(pluck, marimba(midi(tones[idx]), 0.9, vel), t0 + k * BEAT / 2 + swing)
            for note in tones[:3]:
                add(pads, pad_note(midi(note - 12), 4 * BEAT + 0.4), t0)
            add(bass, marimba(midi(root - 24), 1.6, 1.0) * 0.9, t0)
            add(bass, marimba(midi(root - 24 + 7), 1.0, 0.6) * 0.9, t0 + 2.5 * BEAT)
            if bar % 2 == 1:
                for k, m in enumerate(melody):
                    if m is not None:
                        add(pluck, marimba(midi(m + (0 if kind == "maj" else -1 if m % 12 == 4 else 0)), 1.2, 0.5), t0 + k * BEAT / 2)
            for b in range(4):
                if b in (0, 2):
                    add(drums, kick() * 0.9, t0 + b * BEAT)
                if b in (1, 3):
                    add(drums, snap() * 0.35, t0 + b * BEAT)
                add(drums, shaker() * 0.25, t0 + b * BEAT + BEAT / 2)
                add(drums, shaker() * 0.12, t0 + b * BEAT)
    mix = reverb(pluck * 0.32 + pads * 0.05, 0.28) + lowpass(bass, 400) * 0.30 + drums * 0.30
    mix = np.tanh(mix * 1.4) / 1.4
    a = int(LOOP * SR)
    return mix[a : 2 * a]


# ---- Âm thanh hiệu ứng ------------------------------------------------------------------------


def sweep_noise(sec: float, f0: float, f1: float, f2: float) -> np.ndarray:
    """Tiếng gió vụt: ồn trắng qua bộ lọc thông dải có tần số trượt f0 → f1 → f2."""
    n = int(sec * SR)
    x = rng.standard_normal(n)
    t = np.linspace(0, 1, n)
    fc = np.where(t < 0.5, f0 + (f1 - f0) * (t / 0.5) ** 1.5, f1 + (f2 - f1) * ((t - 0.5) / 0.5))
    # bộ lọc trạng thái biến (SVF) chạy từng mẫu để đổi tần số liên tục
    y = np.zeros(n)
    low = band = 0.0
    q = 0.9
    for i in range(n):
        f = 2 * np.sin(np.pi * fc[i] / SR)
        low += f * band
        high = x[i] - low - q * band
        band += f * high
        y[i] = band
    shape = np.sin(np.pi * t) ** 1.6
    return y * shape


def sfx() -> dict[str, np.ndarray]:
    out: dict[str, np.ndarray] = {}
    out["whoosh"] = sweep_noise(0.38, 300, 2600, 700)

    n = int(0.09 * SR)
    t = np.arange(n) / SR
    f = 320 + 700 * np.exp(-t / 0.018)
    out["pop"] = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.03)

    n = int(1.2 * SR)
    t = np.arange(n) / SR
    base = 1318.5
    bell = sum(a * np.sin(2 * np.pi * base * r * t) * np.exp(-t / d) for r, a, d in ((1, 1, 0.5), (2.0, 0.45, 0.28), (2.76, 0.3, 0.18), (5.4, 0.15, 0.07)))
    out["ding"] = bell * np.clip(t / 0.002, 0, 1)

    n = int(0.32 * SR)
    t = np.arange(n) / SR
    f = 42 + 110 * np.exp(-t / 0.035)
    thump = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.11)
    slap = lowpass(rng.standard_normal(n), 2500) * env(n, 0.0005, 0.02)
    out["stamp"] = thump + 0.6 * slap

    n = int(0.05 * SR)
    t = np.arange(n) / SR
    out["tick"] = np.sin(2 * np.pi * 1900 * t) * env(n, 0.0005, 0.008) + 0.3 * highpass(rng.standard_normal(n), 3000) * env(n, 0.0002, 0.003)

    def click(sec=0.03):
        k = int(sec * SR)
        return bandpass(rng.standard_normal(k), 1500, 7000) * env(k, 0.0003, 0.006)

    sh = np.zeros(int(0.22 * SR))
    add(sh, click(), 0.0)
    add(sh, click() * 0.7, 0.085)
    add(sh, lowpass(rng.standard_normal(int(0.05 * SR)), 900) * env(int(0.05 * SR), 0.001, 0.012) * 0.6, 0.0)
    out["shutter"] = sh

    out["swoosh"] = sweep_noise(0.55, 2400, 900, 250) * 0.8
    return out


def main() -> None:
    print("Nhạc nền:")
    save(OUT / "music" / "giay-nhap.wav", music_giay_nhap(), peak=0.8)
    print("Âm thanh hiệu ứng:")
    for name, x in sfx().items():
        save(OUT / "sfx" / f"{name}.wav", x)


if __name__ == "__main__":
    main()
