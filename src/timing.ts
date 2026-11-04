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
    const seconds = (voiced ? voiced.seconds : estimateSeconds(scene.voice)) + (scene.pad ?? DEFAULT_PAD);
    const frames = Math.max(Math.round(seconds * FPS), FPS);
    const timing: SceneTiming = {
      from,
      frames,
      audio: voiced ? `${script.id}/voice/${voiced.file}` : null,
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
  try {
    const res = await fetch(staticFile(`${script.id}/img/credits.json`));
    if (!res.ok) return {};
    return (await res.json()) as ImageCredits;
  } catch {
    return {};
  }
};
