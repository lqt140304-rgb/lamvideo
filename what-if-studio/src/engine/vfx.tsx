import React, { useId } from 'react';
import { clamp, rnd } from './anim';

// t uses the engine's 30 fps clock; nothing depends on wall time or browser animation.
const wrap = (v: number, span: number) => ((v % span) + span) % span;
const uid = (id: string) => `vfx-${id.replace(/[^a-zA-Z0-9]/g, '')}`;

export const windAt = (t: number, seed = 0, strength = 1) =>
  (Math.sin(t * 0.031 + seed) * 0.65 + Math.sin(t * 0.071 + seed * 1.7) * 0.22 + Math.sin(t * 0.013 + 0.8) * 0.13) * strength;

/** Anchor a stem, fabric edge or hanging item; never sway an entire grounded character. */
export const WindSway: React.FC<{ t: number; x: number; y: number; seed?: number; strength?: number; children: React.ReactNode }> =
  ({ t, x, y, seed = 0, strength = 4, children }) => (
    <g transform={`translate(${x} ${y}) rotate(${windAt(t, seed, strength)})`}>{children}</g>
  );

export const lightFlickerAt = (t: number, seed = 0, depth = 0.18) =>
  1 - clamp(depth) * (Math.pow(Math.max(0, Math.sin(t * 0.083 + seed)), 16) * 0.7 + (0.5 + Math.sin(t * 0.037 + seed * 2) * 0.5) * 0.3);

export const CloudBank: React.FC<{ t: number; x?: number; y?: number; w: number; h: number; seed?: number; speed?: number; color?: string; opacity?: number }> =
  ({ t, x = 0, y = 0, w, h, seed = 4, speed = 0.26, color = '#dce7eb', opacity = 0.55 }) => {
    const id = uid(useId());
    return <g opacity={opacity}>
      <defs><clipPath id={id}><rect x={x} y={y} width={w} height={h} /></clipPath>
        <linearGradient id={`${id}-shade`} x2="0" y2="1"><stop stopColor={color} stopOpacity="0.5" /><stop offset="0.7" stopColor={color} /><stop offset="1" stopColor={color} stopOpacity="0.1" /></linearGradient>
        <filter id={`${id}-soft`} x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="0.02" /></filter>
      </defs>
      <g clipPath={`url(#${id})`}>
        {Array.from({ length: 6 }, (_, i) => {
          const r = (30 + rnd(seed, i) * 45) * Math.min(2.5,w/560);
          const cx = x + wrap(rnd(seed + 1, i) * (w + r * 5) + t * speed * (0.5 + i / 6), w + r * 5) - r * 2.5;
          const cy = y + h * (0.2 + rnd(seed + 2, i) * 0.65);
          return <g key={i} opacity={0.35+i*0.09} transform={`translate(${cx} ${cy}) scale(${r})`}>
            <path d="M -2.3 .08 Q -2.15 -.16 -1.7 -.13 Q -1.6 -.47 -1.2 -.32 Q -.85 -.72 -.46 -.41 Q -.08 -.64 .35 -.29 Q .68 -.46 1 -.19 Q 1.55 -.33 2.2 .09 Q 1.35 .29 .4 .24 Q -.8 .32 -2.3 .08 Z" fill={`url(#${id}-shade)`} filter={`url(#${id}-soft)`} />
          </g>;
        })}
      </g>
    </g>;
  };

/** Origin is the actual mouth of a cup/chimney; positive wind drifts to screen right. */
export const SmokePlume: React.FC<{ t: number; x: number; y: number; height?: number; wind?: number; seed?: number; color?: string; opacity?: number }> =
  ({ t, x, y, height = 180, wind = 0.25, seed = 3, color = '#c9d2d5', opacity = 0.5 }) => {
    const id = uid(useId());
    return <g>
      <defs><radialGradient id={id}><stop offset="0" stopColor={color} stopOpacity="0.65" /><stop offset="0.6" stopColor={color} stopOpacity="0.24" /><stop offset="1" stopColor={color} stopOpacity="0" /></radialGradient></defs>
      {Array.from({ length: 14 }, (_, i) => {
        const p = wrap(t * (0.7 + rnd(seed, i) * 0.2) + i * 11, 154) / 154;
        const drift = wind * height * p * p + Math.sin(p * 9 + i) * p * 13;
        const r = 5 + Math.pow(p, 0.85) * 39;
        return <ellipse key={i} cx={x + drift} cy={y - height * p} rx={r} ry={r * 1.35} fill={`url(#${id})`} opacity={opacity * Math.sin(Math.PI * p)} />;
      })}
    </g>;
  };

export const RainSheet: React.FC<{ t: number; x?: number; y?: number; w: number; h: number; seed?: number; count?: number; wind?: number; opacity?: number }> =
  ({ t, x = 0, y = 0, w, h, seed = 7, count = 55, wind = -0.2, opacity = 0.5 }) => {
    const id = uid(useId());
    return <g opacity={opacity}>
      <defs><clipPath id={id}><rect x={x} y={y} width={w} height={h} /></clipPath></defs>
      <g clipPath={`url(#${id})`} stroke="#bdd8ed" strokeLinecap="round">
        {Array.from({ length: count }, (_, i) => {
          const depth = 0.35 + rnd(seed, i) * 0.65;
          const length = 8 + depth * 20;
          const yy = y + wrap(rnd(seed + 1, i) * (h + length * 2) + t * (4 + depth * 6), h + length * 2) - length;
          const xx = x + wrap(rnd(seed + 2, i) * w + t * wind * (4 + depth * 6), w);
          return <path key={i} d={`M ${xx} ${yy} l ${wind * length} ${length}`} strokeWidth={0.6 + depth * 1.2} opacity={0.25 + depth * 0.65} />;
        })}
      </g>
    </g>;
  };

/** A single contact ripple; pass t=frame-contactFrame, or loop deliberately for a dripping tap. */
export const WaterRipple: React.FC<{ t: number; x: number; y: number; radius?: number; life?: number; color?: string }> =
  ({ t, x, y, radius = 100, life = 55, color = '#8cb7c8' }) => {
    if (t < 0 || t >= life) return null;
    const p = t / life;
    return <g fill="none" stroke={color}>
      <ellipse cx={x} cy={y} rx={2 + radius * p} ry={0.6 + radius * p * 0.22} opacity={Math.sin(Math.PI * p) * 0.7} strokeWidth={1.8 - p} />
      <ellipse cx={x} cy={y} rx={radius * p * 0.67} ry={radius * p * 0.147} opacity={Math.sin(Math.PI * p) * 0.35} strokeWidth="0.8" />
    </g>;
  };

/** One grounded impact, never a perpetual burst. x/y must be the surface contact point. */
export const ImpactBurst: React.FC<{ t: number; x: number; y: number; seed?: number; size?: number; life?: number; color?: string }> =
  ({ t, x, y, seed = 2, size = 1, life = 25, color = '#b9a58c' }) => {
    if (t < 0 || t >= life) return null;
    const p = t / life;
    return <g opacity={Math.pow(1 - p, 1.6)}>
      <ellipse cx={x} cy={y} rx={(6 + p * 45) * size} ry={(2 + p * 6) * size} fill={color} opacity="0.25" />
      {Array.from({ length: 13 }, (_, i) => <circle key={i}
        cx={x + (rnd(seed, i) - 0.5) * p * 130 * size}
        cy={y - Math.sin(Math.PI * p) * (10 + rnd(seed + 1, i) * 38) * size}
        r={(1.2 + rnd(seed + 2, i) * 3 + p * 4) * size} fill={color} opacity={0.35 + rnd(seed + 3, i) * 0.5} />)}
    </g>;
  };
