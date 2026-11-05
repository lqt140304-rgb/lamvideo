"""Đọc giọng cho một video bằng VieNeu-TTS chạy trên máy bạn.

Cách dùng:
    python tools/voice.py xe-dien-ha-noi
    python tools/voice.py xe-dien-ha-noi --speaker "Hải Đăng" --force

Ghi ra public/<slug>/voice/scene-01.wav ... và voice.json (độ dài từng câu).
Câu nào không đổi chữ thì giữ file cũ, không đọc lại.

Truyện nhiều giọng (cảnh "dialog"): script.json có "voices": {"MINH": "...", "BOM": "..."}.
Mỗi lượt thoại được đọc bằng giọng của nhân vật, chỉnh về cùng mức to, rồi nối thành scene-XX.wav
kèm mốc bắt đầu từng lượt trong voice.json. Nghe thử giọng trước khi đọc cả truyện:
    python tools/voice.py lon-roi-hen-du-hoi --audition
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def wav_seconds(path: Path) -> float:
    try:
        import soundfile as sf  # có sẵn khi cài vieneu

        return float(sf.info(str(path)).duration)
    except Exception:
        with wave.open(str(path), "rb") as w:
            return w.getnframes() / float(w.getframerate())


def flatten_hf_downloads() -> None:
    """Windows hay lưu model Hugging Face qua symlink, ONNX Runtime báo lỗi
    "External data path ... escapes both model directory ...". Hàm này bọc bước tải model của
    VieNeu: copy các file ra thư mục thường (mặc định ~/.cache/vieneu/flat, đổi bằng VIENEU_FLAT_DIR)
    và dùng thư mục đó. Chỉ copy một lần; lần sau dùng lại. Đặt VIENEU_FLATTEN=0 để tắt."""
    import shutil

    if os.environ.get("VIENEU_FLATTEN", "1") == "0":
        return
    try:
        from vieneu._v3_turbo_engine import onnx_runtime_lite as mod
    except Exception:
        return
    cls = mod.OnnxV3LiteEngine
    raw = cls.__dict__.get("_fetch")
    if raw is None:
        return
    is_static = isinstance(raw, staticmethod)
    orig = raw.__func__ if is_static else raw
    base = Path(os.environ.get("VIENEU_FLAT_DIR") or (Path.home() / ".cache" / "vieneu" / "flat"))

    def fetch(*args, **kwargs):
        src = Path(orig(*args, **kwargs))
        # _fetch(self, repo, files, subfolder): lấy 3 tham số cuối làm tên thư mục đích
        repo, _files, subfolder = args[-3:] if len(args) >= 3 else (None, None, None)
        name = (str(repo).replace("/", "--") if repo else src.parent.name) + "__" + str(subfolder or "root")
        dst = base / name
        dst.mkdir(parents=True, exist_ok=True)
        for f in src.iterdir():
            if not f.is_file():
                continue  # is_file() đi theo symlink tới file thật
            target = dst / f.name
            if not target.exists() or target.stat().st_size != f.stat().st_size:
                print(f"  copy {f.name} → {dst}")
                shutil.copy2(f, target)  # copy2 chép nội dung file thật, không chép symlink
        return dst

    cls._fetch = staticmethod(fetch) if is_static else fetch


def text_hash(text: str, speaker: str) -> str:
    return hashlib.sha1(f"{speaker}|{text}".encode("utf-8")).hexdigest()[:12]


def load_tts():
    try:
        from vieneu import Vieneu
    except ImportError:
        print(
            "Chưa import được vieneu. Hãy chạy bằng Python đã cài VieNeu-TTS,\n"
            "ví dụ: uv run --directory <thư mục VieNeu-TTS> python <đường dẫn>/tools/voice.py <slug>",
            file=sys.stderr,
        )
        return None
    print("Đang nạp VieNeu-TTS...")
    flatten_hf_downloads()
    kwargs = {}
    onnx_dir = os.environ.get("VIENEU_ONNX_DIR")
    if onnx_dir:
        kwargs["onnx_dir"] = onnx_dir
        print(f"Dùng model ONNX tại: {onnx_dir}")
    return Vieneu(**kwargs)


def roster(tts) -> list[str]:
    """Danh sách tên giọng có sẵn; trả [] nếu bản VieNeu này không liệt kê được."""
    try:
        raw = tts.list_preset_voices()
    except Exception:
        return []
    names = []
    for item in raw:
        if isinstance(item, str):
            names.append(item)
        elif isinstance(item, (tuple, list)) and item:
            names.append(str(item[-1] if len(item) > 1 and not isinstance(item[0], str) else item[0]))
        elif isinstance(item, dict):
            names.append(str(item.get("name") or item.get("id") or ""))
    return names


def level_to(audio, target_rms: float = 0.08, peak: float = 0.95):
    """Chỉnh một lượt thoại về cùng mức to để bốn giọng nghe đều nhau."""
    import numpy as np

    a = np.asarray(audio, dtype="float32")
    rms = float(np.sqrt(np.mean(a * a))) if a.size else 0.0
    if rms < 1e-5:
        return a
    a = a * (target_rms / rms)
    m = float(np.max(np.abs(a)))
    return a * (peak / m) if m > peak else a


def dialog_scene(tts, scene, voices, out_dir, name, force, old_entry):
    """Đọc từng lượt, nối thành một file cảnh. Trả (entry, đã_đọc_lại)."""
    import numpy as np
    import soundfile as sf

    lines_dir = out_dir / "lines"
    lines_dir.mkdir(exist_ok=True)
    if not scene.get("lines"):
        sf.write(str(out_dir / name), np.zeros(int(0.1 * 24000), dtype="float32"), 24000)
        return {"file": name, "seconds": 0.1, "hash": "silent", "lines": []}, False
    sr = None
    pieces = []
    meta = []
    t = 0.1
    parts = []
    reread = False
    for k, ln in enumerate(scene["lines"]):
        who = ln["who"]
        voice = voices.get(who)
        if not voice:
            raise SystemExit(f"Nhân vật {who} chưa có giọng trong script.json → voices")
        text = ln["text"].strip()
        h = text_hash(text, voice)
        lp = lines_dir / f"{ln['id']}.wav"
        hp = lines_dir / f"{ln['id']}.hash"
        fresh = lp.exists() and hp.exists() and hp.read_text().strip() == h and not force
        if not fresh:
            if tts is None:
                return None, True
            print(f"      {ln['id']} ({who}/{voice}): {text[:50]}")
            audio = tts.infer(text, voice=voice)
            tts.save(audio, str(lp))
            hp.write_text(h)
            reread = True
        data, rate = sf.read(str(lp), dtype="float32")
        if data.ndim > 1:
            data = data.mean(axis=1)
        sr = sr or rate
        data = level_to(data)
        gap = 0.0 if k == 0 else float(ln.get("gap", 0.3))
        if "at" in ln:
            gap = max(0.0 if k == 0 else 0.1, float(ln["at"]) - t)
        t += gap
        pieces.append(np.zeros(int(gap * sr), dtype="float32"))
        pieces.append(data)
        dur = len(data) / sr
        meta.append({"id": ln["id"], "start": round(t, 3), "seconds": round(dur, 3)})
        t += dur
        parts.append(f"{h}@{gap}")
    lead = np.zeros(int(0.1 * sr), dtype="float32")
    full = np.concatenate([lead] + pieces)
    sf.write(str(out_dir / name), full, sr)
    sh = hashlib.sha1("|".join(parts).encode()).hexdigest()[:12]
    return {"file": name, "seconds": round(len(full) / sr, 3), "hash": sh, "lines": meta}, reread


def audition(script, slug) -> int:
    """Đọc thử 1 câu của mỗi nhân vật + in danh sách giọng có sẵn để chọn lại nếu cần."""
    voices = script.get("voices", {})
    tts = load_tts()
    if tts is None:
        return 1
    names = roster(tts)
    if names:
        print("Giọng có sẵn:", ", ".join(names))
        for who, v in voices.items():
            if v not in names:
                print(f"  ! {who}: không thấy giọng '{v}' trong danh sách")
    out = ROOT / "public" / slug / "voice" / "audition"
    out.mkdir(parents=True, exist_ok=True)
    first = {}
    for sc in script["scenes"]:
        for ln in sc.get("lines", []):
            first.setdefault(ln["who"], ln["text"])
    for who, v in voices.items():
        text = first.get(who, "Chào cả nhà, mình thử giọng một chút nhé.")
        audio = tts.infer(text, voice=v)
        path = out / f"{who}-{v.replace(' ', '_')}.wav"
        tts.save(audio, str(path))
        print(f"  {who:5s} {v:12s} → {path.relative_to(ROOT)}  \"{text[:40]}\"")
    print("Nghe các file trên; muốn đổi giọng thì sửa \"voices\" trong script.json rồi chạy lại.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Đọc giọng VieNeu-TTS cho kịch bản video")
    parser.add_argument("slug", help="tên thư mục trong videos/, ví dụ xe-dien-ha-noi")
    parser.add_argument("--speaker", help="giọng đọc, mặc định lấy trong script.json")
    parser.add_argument("--force", action="store_true", help="đọc lại tất cả các câu")
    parser.add_argument("--audition", action="store_true", help="chỉ đọc thử mỗi nhân vật một câu để nghe giọng")
    args = parser.parse_args()

    script_path = ROOT / "videos" / args.slug / "script.json"
    if not script_path.exists():
        print(f"Không thấy {script_path}", file=sys.stderr)
        return 1
    script = json.loads(script_path.read_text(encoding="utf-8"))
    speaker = args.speaker or script.get("voice", {}).get("speaker", "Hải Đăng")
    voices = script.get("voices", {})
    if args.audition:
        return audition(script, args.slug)

    out_dir = ROOT / "public" / args.slug / "voice"
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = out_dir / "voice.json"
    old = {}
    if manifest_path.exists():
        for item in json.loads(manifest_path.read_text(encoding="utf-8")).get("scenes", []):
            old[item["file"]] = item

    tts = None
    scenes = []
    for i, scene in enumerate(script["scenes"], start=1):
        text = scene["voice"].strip()
        name = f"scene-{i:02d}.wav"
        path = out_dir / name
        if scene.get("type") in ("dialog", "memory"):
            cached = old.get(name)
            print(f"[{i:02d}] hội thoại {scene.get('id', '')}")
            entry, _ = dialog_scene(tts, scene, voices, out_dir, name, args.force, cached)
            if entry is None:  # cần đọc mà chưa nạp model
                tts = load_tts()
                if tts is None:
                    return 1
                entry, _ = dialog_scene(tts, scene, voices, out_dir, name, args.force, cached)
            scenes.append(entry)
            print(f"      → {name} ({entry['seconds']:.2f}s, {len(entry['lines'])} lượt)")
            continue
        h = text_hash(text, speaker)
        cached = old.get(name)
        if not args.force and cached and cached.get("hash") == h and path.exists():
            print(f"[{i:02d}] giữ nguyên ({cached['seconds']:.2f}s)")
            scenes.append(cached)
            continue
        if tts is None:
            tts = load_tts()
            if tts is None:
                return 1
        print(f"[{i:02d}] đọc: {text[:60]}...")
        audio = tts.infer(text, voice=speaker)
        tts.save(audio, str(path))
        seconds = wav_seconds(path)
        scenes.append({"file": name, "seconds": round(seconds, 3), "hash": h})
        print(f"      → {name} ({seconds:.2f}s)")

    manifest = {"speaker": speaker, "scenes": scenes}
    if voices:
        manifest["voices"] = voices
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    total = sum(s["seconds"] for s in scenes)
    print(f"Xong: {len(scenes)} câu, tổng {total:.1f}s giọng đọc → {manifest_path.relative_to(ROOT)}")
    if total > 85:
        print("Lưu ý: giọng đọc dài hơn 85 giây, video có thể vượt 90 giây. Nên rút gọn kịch bản.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
