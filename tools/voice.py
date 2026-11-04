"""Đọc giọng cho một video bằng VieNeu-TTS chạy trên máy bạn.

Cách dùng:
    python tools/voice.py xe-dien-ha-noi
    python tools/voice.py xe-dien-ha-noi --speaker "Hải Đăng" --force

Ghi ra public/<slug>/voice/scene-01.wav ... và voice.json (độ dài từng câu).
Câu nào không đổi chữ thì giữ file cũ, không đọc lại.
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


def main() -> int:
    parser = argparse.ArgumentParser(description="Đọc giọng VieNeu-TTS cho kịch bản video")
    parser.add_argument("slug", help="tên thư mục trong videos/, ví dụ xe-dien-ha-noi")
    parser.add_argument("--speaker", help="giọng đọc, mặc định lấy trong script.json")
    parser.add_argument("--force", action="store_true", help="đọc lại tất cả các câu")
    args = parser.parse_args()

    script_path = ROOT / "videos" / args.slug / "script.json"
    if not script_path.exists():
        print(f"Không thấy {script_path}", file=sys.stderr)
        return 1
    script = json.loads(script_path.read_text(encoding="utf-8"))
    speaker = args.speaker or script.get("voice", {}).get("speaker", "Hải Đăng")

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
        h = text_hash(text, speaker)
        cached = old.get(name)
        if not args.force and cached and cached.get("hash") == h and path.exists():
            print(f"[{i:02d}] giữ nguyên ({cached['seconds']:.2f}s)")
            scenes.append(cached)
            continue
        if tts is None:
            try:
                from vieneu import Vieneu
            except ImportError:
                print(
                    "Chưa import được vieneu. Hãy chạy bằng Python đã cài VieNeu-TTS,\n"
                    "ví dụ: uv run --directory <thư mục VieNeu-TTS> python <đường dẫn>/tools/voice.py "
                    f"{args.slug}",
                    file=sys.stderr,
                )
                return 1
            print("Đang nạp VieNeu-TTS...")
            flatten_hf_downloads()
            kwargs = {}
            # Windows hay lưu model qua symlink làm ONNX Runtime báo lỗi "External data path ... escapes".
            # Đặt VIENEU_ONNX_DIR trỏ tới thư mục onnx_update đã copy thành file thường để tránh lỗi này.
            onnx_dir = os.environ.get("VIENEU_ONNX_DIR")
            if onnx_dir:
                kwargs["onnx_dir"] = onnx_dir
                print(f"Dùng model ONNX tại: {onnx_dir}")
            tts = Vieneu(**kwargs)
        print(f"[{i:02d}] đọc: {text[:60]}...")
        audio = tts.infer(text, voice=speaker)
        tts.save(audio, str(path))
        seconds = wav_seconds(path)
        scenes.append({"file": name, "seconds": round(seconds, 3), "hash": h})
        print(f"      → {name} ({seconds:.2f}s)")

    manifest = {"speaker": speaker, "scenes": scenes}
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    total = sum(s["seconds"] for s in scenes)
    print(f"Xong: {len(scenes)} câu, tổng {total:.1f}s giọng đọc → {manifest_path.relative_to(ROOT)}")
    if total > 85:
        print("Lưu ý: giọng đọc dài hơn 85 giây, video có thể vượt 90 giây. Nên rút gọn kịch bản.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
