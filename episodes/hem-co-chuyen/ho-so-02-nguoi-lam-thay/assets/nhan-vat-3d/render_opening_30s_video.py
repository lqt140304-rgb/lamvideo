"""Kịch bản kết xuất tự động 30s Opening Full 3D và ghép âm thanh điện ảnh.
Quy chuẩn:
- 30s timeline @ 24fps (720 frames total, render 360 frames @ 12fps step 2)
- Engine: Cycles CPU @ 640x268 (upscaled lanczos to 960x402 Cinemascope 2.39:1)
- Ghép âm thanh hoàn chỉnh: Ambient lightless dawn + chuông reo + tát báo thức + bước chân + tiếng kính ngân
- Hỗ trợ batching (--batch 1, --batch 2, --mux) để không bao giờ bị timeout và lưu cache bền vững
"""

import os
import sys
import time
import argparse
import subprocess
import shutil

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

import bpy
import dung_canh_opening_30s as dco

ARTIFACT_DIR = "/home/antigravity/.gemini/jetski/brain/v1/default/jetski_remote_agents_3p/632588fc-c9c3-43d5-91f0-e936233146ef"
REPO_DIR = "/home/antigravity/lqt140304-rgb/lamvideo"
AUDIO_DIR = os.path.join(REPO_DIR, "what-if-studio/public/ho-so-02-nguoi-lam-thay/opening-audio")
FRAMES_DIR = "/home/antigravity/.cache/opening_30s_frames"
OUTPUT_VIDEO = os.path.join(CURRENT_DIR, "opening_30s_render.mp4")
AUDIO_MIX = "/tmp/opening_30s_audio.aac"

def render_frames(start_idx: int = 0, end_idx: int = 360):
    os.makedirs(FRAMES_DIR, exist_ok=True)
    t_start = time.time()

    print(f"[RENDER] Thiết lập cảnh 3D và animation cho batch {start_idx} -> {end_idx}...")
    bpy.ops.wm.read_homefile(use_empty=True)
    sc_info = dco.setup_opening_30s_scene()
    dco.animate_opening_30s(sc_info)

    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = 2
    sc.render.resolution_x = 640
    sc.render.resolution_y = 268

    total_frames = 720
    step = 2
    all_frames = list(range(0, total_frames, step))
    batch_indices = list(range(start_idx, min(end_idx, len(all_frames))))
    
    print(f"[RENDER] Bắt đầu xử lý {len(batch_indices)} frames...")

    rendered_count = 0
    for idx in batch_indices:
        f = all_frames[idx]
        out_frame = os.path.join(FRAMES_DIR, f"frame_{idx:04d}.png")
        
        # Bỏ qua nếu frame đã render hợp lệ
        if os.path.exists(out_frame) and os.path.getsize(out_frame) > 1000:
            continue

        t0 = time.time()
        sc.frame_set(f)
        
        cam = sc.camera
        for m in sc.timeline_markers:
            if m.frame <= f and m.camera:
                cam = m.camera
        sc.camera = cam

        sc.render.filepath = out_frame
        bpy.ops.render.render(write_still=True)
        dt = time.time() - t0
        rendered_count += 1

        if rendered_count % 15 == 0 or idx == batch_indices[-1]:
            pct = (idx - start_idx + 1) / len(batch_indices) * 100
            elapsed = time.time() - t_start
            print(f"[{pct:5.1f}%] Frame {idx+1}/{len(all_frames)} (Timeline F{f:03d}, {cam.name}) - {dt:.2f}s/f")

    print(f"[RENDER] Batch {start_idx} -> {end_idx} hoàn thành trong {(time.time()-t_start)/60:.1f} phút!")

def mux_video_and_audio():
    print("[MUX] Đang tổng hợp âm thanh đa lớp...")
    os.makedirs(os.path.dirname(OUTPUT_VIDEO), exist_ok=True)

    cmd_audio = [
        "ffmpeg", "-y",
        "-i", os.path.join(AUDIO_DIR, "lightless-dawn-excerpt.mp3"),
        "-i", os.path.join(AUDIO_DIR, "twoTone1.ogg"),
        "-i", os.path.join(AUDIO_DIR, "impactSoft_medium_000.ogg"),
        "-i", os.path.join(AUDIO_DIR, "footstep_concrete_000.ogg"),
        "-i", os.path.join(AUDIO_DIR, "footstep_concrete_001.ogg"),
        "-i", os.path.join(AUDIO_DIR, "impactGlass_medium_000.ogg"),
        "-filter_complex",
        "[0:a]atrim=0:30,afade=t=in:st=0:d=1,afade=t=out:st=27:d=3,volume=0.7[music]; "
        "[1:a]adelay=5833|5833,volume=1.0[alarm1]; "
        "[1:a]adelay=6560|6560,volume=1.0[alarm2]; "
        "[1:a]adelay=7290|7290,volume=1.0[alarm3]; "
        "[1:a]adelay=8020|8020,volume=1.0[alarm4]; "
        "[2:a]adelay=8750|8750,volume=1.2[slap]; "
        "[3:a]adelay=23330|23330,volume=0.9[step1]; "
        "[4:a]adelay=25420|25420,volume=0.9[step2]; "
        "[5:a]adelay=26670|26670,volume=1.1[glance]; "
        "[3:a]adelay=27920|27920,volume=0.9[step3]; "
        "[music][alarm1][alarm2][alarm3][alarm4][slap][step1][step2][glance][step3]amix=inputs=10:duration=first:dropout_transition=0[outa]",
        "-map", "[outa]", "-c:a", "aac", "-b:a", "192k", "-t", "30", AUDIO_MIX
    ]
    subprocess.run(cmd_audio, check=True)

    print("[MUX] Ghép khung hình và âm thanh thành phẩm MP4 @ 24fps...")
    cmd_mux = [
        "ffmpeg", "-y",
        "-framerate", "12",
        "-i", os.path.join(FRAMES_DIR, "frame_%04d.png"),
        "-i", AUDIO_MIX,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-r", "24",
        "-vf", "scale=960:402:flags=lanczos",
        "-c:a", "copy",
        "-shortest",
        OUTPUT_VIDEO
    ]
    subprocess.run(cmd_mux, check=True)
    print(f"Đã xuất video hoàn chỉnh: {OUTPUT_VIDEO} ({os.path.getsize(OUTPUT_VIDEO)/1024/1024:.2f} MB)")

    if os.path.exists(ARTIFACT_DIR):
        artifact_mp4 = os.path.join(ARTIFACT_DIR, "opening_30s_render.mp4")
        shutil.copyfile(OUTPUT_VIDEO, artifact_mp4)
        print(f"Đã sao chép sang artifact: {artifact_mp4}")

        shutil.copyfile(os.path.join(FRAMES_DIR, f"frame_{30:04d}.png"), os.path.join(ARTIFACT_DIR, "shot0_frame60_macro_mirror.png"))
        shutil.copyfile(os.path.join(FRAMES_DIR, f"frame_{100:04d}.png"), os.path.join(ARTIFACT_DIR, "shot1_frame200_alarm_reach.png"))
        shutil.copyfile(os.path.join(FRAMES_DIR, f"frame_{320:04d}.png"), os.path.join(ARTIFACT_DIR, "shot2_frame640_mirror_stare.png"))
        print("Đã sao chép 3 ảnh screenshot đại diện sang thư mục artifact!")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch", type=int, default=0, help="1: frames 0-179, 2: frames 180-359, 0: full")
    parser.add_argument("--mux-only", action="store_true", help="Chỉ mux audio và video từ frames có sẵn")
    args = parser.parse_args()

    if args.mux_only:
        mux_video_and_audio()
        return

    if args.batch == 1:
        render_frames(0, 180)
    elif args.batch == 2:
        render_frames(180, 360)
    else:
        render_frames(0, 180)
        render_frames(180, 360)
        mux_video_and_audio()

if __name__ == "__main__":
    main()
