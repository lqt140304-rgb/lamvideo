import { Easing, interpolate, spring } from "remotion";
import { FPS } from "./brand";

/** Bật lên có nảy nhẹ, 0 → 1, bắt đầu ở `delay` khung hình. */
export const pop = (frame: number, delay = 0, stiffness = 170) =>
  spring({ frame: frame - delay, fps: FPS, config: { damping: 12, stiffness, mass: 0.9 } });

/** Mượt, không nảy, 0 → 1 trong `duration` khung hình. */
export const ease = (frame: number, delay = 0, duration = 12) =>
  interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

/** Lắc nhẹ kiểu nét vẽ tay. */
export const wobble = (frame: number, seed = 0, amount = 1.2) =>
  Math.sin(frame * 0.35 + seed * 1.7) * amount;

/** Số khung hình của mốc `at` (0..1) trong một cảnh dài `frames`. */
export const atFrame = (at: number, frames: number) => Math.round(at * frames);

export const formatVnd = (n: number) =>
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
