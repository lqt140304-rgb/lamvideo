import { staticFile } from "remotion";
import { FPS } from "./brand";
import type { ImageCredits, SceneTiming, VideoScript, VoiceManifest } from "./types";

const DEFAULT_PAD = 0.35;
/** Tốc độ đọc ước tính (âm tiết / giây) khi chưa có file giọng. */
const SYLLABLES_PER_SECOND = 4.3;

export const estimateSeconds = (text: string) =>
  text.trim().split(/\s+/).filter(Boolean).length / SYLLABLES_PER_SECOND + 0.4;

/** Dựng mốc thời gian từng cảnh: ưu tiên độ dài file giọng thật, không có thì ước tính. */
export const buildTimings = (
  script: VideoScript,
  manifest: VoiceManifest | null,
): SceneTiming[] => {
  let from = 0;
  return script.scenes.map((scene, i) => {
    const voiced = manifest?.scenes[i];
    let lines: SceneTiming["lines"];
    let speech = voiced ? voiced.seconds : estimateSeconds(scene.voice);
    if (scene.type === "dialog") {
      // lượt thoại: có file giọng thì dùng mốc thật, chưa có thì ước tính nối tiếp nhau
      const real = voiced?.lines && voiced.lines.length === scene.lines.length ? voiced.lines : null;
      let t = 0.1;
      const est = scene.lines.map((l, k) => {
        t += k === 0 ? 0 : l.gap ?? 0.3;
        const start = t;
        const sec = estimateSeconds(l.text);
        t += sec;
        return { start, seconds: sec };
      });
      const src = real ?? est;
      lines = src.map((l) => ({ from: Math.round(l.start * FPS), frames: Math.max(6, Math.round(l.seconds * FPS)) }));
      speech = real ? (voiced as { seconds: number }).seconds : t;
    }
    const seconds = speech + (scene.pad ?? DEFAULT_PAD);
    const frames = Math.max(Math.round(seconds * FPS), FPS);
    const timing: SceneTiming = {
      from,
      frames,
      audio: voiced ? `${script.id}/voice/${voiced.file}` : null,
      ...(lines ? { lines } : {}),
    };
    from += frames;
    return timing;
  });
};

export const loadManifest = async (script: VideoScript): Promise<VoiceManifest | null> => {
  try {
    const res = await fetch(staticFile(`${script.id}/voice/voice.json`));
    if (!res.ok) return null;
    const manifest = (await res.json()) as VoiceManifest;
    // Bỏ qua nếu số cảnh không khớp (kịch bản đã sửa mà chưa đọc lại giọng).
    return manifest.scenes.length === script.scenes.length ? manifest : null;
  } catch {
    return null;
  }
};

export const totalFrames = (timings: SceneTiming[]) =>
  timings.reduce((sum, t) => sum + t.frames, 0);

/** Ảnh thật đã tải về (do `npm run images` ghi). Chưa có thì trả về rỗng: video bỏ qua phần ảnh. */
export const loadCredits = async (script: VideoScript): Promise<ImageCredits> => {
  // Video không dùng ảnh thật thì khỏi tải credits.json (tránh báo 404 vô ích trong console).
  if (!script.scenes.some((s) => s.broll)) return {};
  try {
    const res = await fetch(staticFile(`${script.id}/img/credits.json`));
    if (!res.ok) return {};
    return (await res.json()) as ImageCredits;
  } catch {
    return {};
  }
};
