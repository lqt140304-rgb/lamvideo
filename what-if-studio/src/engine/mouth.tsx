import React from 'react';
import { clamp, easeInOut } from './anim';

export type MouthShape = 'auto' | 'closed' | 'a' | 'e' | 'o' | 'u' | 'fv' | 'pressed' | 'smile';
export type MouthCue = { from: number; to: number; shape: MouthShape; open?: number; tremble?: number };

/** Authored silent gaps and eased attacks; timings must be aligned to the final voice. */
export const mouthCueAt = (t: number, cues: readonly MouthCue[]) => {
  const cue = cues.find(c => t >= c.from && t < c.to);
  if (!cue) return { mouthShape: 'auto' as MouthShape, talk: 0, lipTremble: 0 };
  const envelope = easeInOut(clamp(Math.min((t - cue.from) / 3, (cue.to - t) / 4)));
  return { mouthShape: cue.shape, talk: (cue.open ?? 0.4) * envelope, lipTremble: Math.sin(t * 0.9) * (cue.tremble ?? 0) * envelope };
};

/** Face-local lips: small articulation, brief teeth, and a real closed pose between syllables. */
export const ArticulatedMouth: React.FC<{ shape: Exclude<MouthShape, 'auto'>; open?: number; y?: number; ink: string; shade?: string; tremble?: number }> =
  ({ shape, open = 0.4, y = 0, ink, shade = '#ba7971', tremble = 0 }) => {
    const a = clamp(open), shift = clamp(tremble, -1, 1) * 0.8;
    const resting = shape === 'closed' || shape === 'pressed' || shape === 'smile' || a < 0.035;
    if (resting) {
      const smile = shape === 'smile' ? 6 : shape === 'pressed' ? -1 : 1.5;
      const w = shape === 'pressed' ? 10.5 : shape === 'smile' ? 13 : 10;
      return <g transform={`translate(${shift} ${y})`}>
        <path d={`M ${-w} 0 C -6 ${smile} 6 ${smile} ${w} 0`} fill="none" stroke={ink} strokeWidth={shape === 'pressed' ? 2.8 : 2.4} strokeLinecap="round" />
        <path d="M -5 4 Q 0 5 5 4" fill="none" stroke={shade} strokeWidth="1.2" opacity="0.28" strokeLinecap="round" />
      </g>;
    }
    const rounded = shape === 'o' || shape === 'u';
    const w = shape === 'u' ? 5.5 : shape === 'o' ? 7.5 : shape === 'e' ? 13 : shape === 'fv' ? 10 : 11.5;
    const h = shape === 'fv' ? 1.5 + a * 2 : shape === 'e' ? 1.5 + a * 5 : 1.5 + a * (rounded ? 13 : 11);
    return <g transform={`translate(${shift} ${y + 1})`}>
      <path d={`M ${-w} 0 C ${-w * 0.6} ${-h * 0.74} ${w * 0.6} ${-h * 0.74} ${w} 0 C ${w * 0.72} ${h * 0.95} ${-w * 0.72} ${h * 0.95} ${-w} 0 Z`} fill={ink} />
      {shape === 'fv' || shape === 'e' && a > 0.55 ? <path d={`M ${-w * 0.57} ${-h * 0.15} Q 0 ${-h * 0.24} ${w * 0.57} ${-h * 0.15}`} fill="none" stroke="#f0e1cd" strokeWidth="1.8" strokeLinecap="round" /> : null}
      {shape === 'a' && a > 0.6 ? <path d={`M -4 ${h * 0.43} Q 0 ${h * 0.22} 4 ${h * 0.43}`} fill="none" stroke="#a96768" strokeWidth="1.7" /> : null}
      <path d={`M ${-w * 0.45} ${h * 0.8 + 2} Q 0 ${h + 3} ${w * 0.45} ${h * 0.8 + 2}`} fill="none" stroke={shade} strokeWidth="1.2" opacity="0.25" strokeLinecap="round" />
    </g>;
  };
