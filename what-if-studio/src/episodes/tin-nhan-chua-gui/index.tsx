import React from 'react';
import { defineEpisode, Timeline, LookDef, TapeLines, HudChip, FONT } from '../../engine';
import timeline from './timeline.json';
import * as shots from './shots';

/**
 * Named visual looks & cinematic color grades for Episode 01 ("Tin Nhắn Chưa Gửi"):
 * - `nightAtmosphere`: Deep cool alley night with subtle star glow.
 * - `shopMystery`: Aged warm tungsten lamp grade with darkened unlit corners.
 * - `tension`: Heightened contrast and cool vignette when deals are struck.
 * - `whiteout`: Blinding flash & frequency transition into the memory realm.
 * - `warmMemory`: Dreamy golden-hour rice field warmth with soft pollen glow.
 * - `cozyHome`: Intimate amber-honey domestic warmth.
 */
const nightAtmosphere: LookDef = {
  grade: (lv) => `contrast(${1 + 0.12 * lv}) saturate(${1 - 0.14 * lv}) brightness(${1 - 0.05 * lv}) hue-rotate(${-6 * lv}deg)`,
  Overlay: ({ lv }) => (
    <g opacity={lv * 0.42} style={{ pointerEvents: 'none' }}>
      <defs>
        <radialGradient id="nightCoolVig" cx="50%" cy="50%" r="65%">
          <stop offset="35%" stopColor="#0B132B" stopOpacity={0} />
          <stop offset="100%" stopColor="#04060E" stopOpacity={0.65} />
        </radialGradient>
      </defs>
      <rect width={1920} height={1080} fill="url(#nightCoolVig)" />
    </g>
  ),
};

const shopMystery: LookDef = {
  grade: (lv) => `contrast(${1 + 0.15 * lv}) sepia(${0.22 * lv}) saturate(${1 + 0.12 * lv}) brightness(${1 - 0.03 * lv})`,
  Overlay: ({ lv }) => (
    <g opacity={lv * 0.32} style={{ pointerEvents: 'none' }}>
      <defs>
        <radialGradient id="shopWarmPool" cx="55%" cy="58%" r="55%">
          <stop offset="15%" stopColor="#FFE094" stopOpacity={0.16} />
          <stop offset="65%" stopColor="#C87D2A" stopOpacity={0.06} />
          <stop offset="100%" stopColor="#1A0D08" stopOpacity={0.55} />
        </radialGradient>
      </defs>
      <rect width={1920} height={1080} fill="url(#shopWarmPool)" style={{ mixBlendMode: 'screen' }} />
    </g>
  ),
};

const tension: LookDef = {
  grade: (lv) => `contrast(${1 + 0.28 * lv}) saturate(${1 - 0.35 * lv}) hue-rotate(${-16 * lv}deg) brightness(${1 - 0.07 * lv})`,
  Overlay: ({ lv }) => (
    <g opacity={lv * 0.52} style={{ pointerEvents: 'none' }}>
      <defs>
        <radialGradient id="tensionColdVig" cx="50%" cy="50%" r="58%">
          <stop offset="30%" stopColor="#1E2A38" stopOpacity={0} />
          <stop offset="100%" stopColor="#060A10" stopOpacity={0.72} />
        </radialGradient>
      </defs>
      <rect width={1920} height={1080} fill="url(#tensionColdVig)" />
    </g>
  ),
};

const whiteout: LookDef = {
  grade: (lv) => `brightness(${1 + 0.85 * lv}) contrast(${1 - 0.3 * lv})`,
  Overlay: ({ lv, p }) => (
    <rect width={1920} height={1080} fill="#FFFDF8" opacity={Math.min(1, lv * p * 1.6)} />
  ),
};

const warmMemory: LookDef = {
  grade: (lv) => `saturate(${1 + 0.26 * lv}) contrast(${1 + 0.08 * lv}) brightness(${1 + 0.05 * lv}) sepia(${0.14 * lv})`,
  Overlay: ({ f, lv }) => {
    const pulse = 0.03 * Math.sin(f / 14);
    return (
      <g opacity={lv * 0.42} style={{ pointerEvents: 'none' }}>
        <defs>
          <linearGradient id="warmSunlightBloom" x1="0" y1="0.3" x2="1" y2="0.7">
            <stop offset="0%" stopColor="#FFE08A" stopOpacity={0.28 + pulse} />
            <stop offset="45%" stopColor="#F5B258" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#A65824" stopOpacity={0} />
          </linearGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#warmSunlightBloom)" style={{ mixBlendMode: 'screen' }} />
      </g>
    );
  },
};

/** G2 (C5-B): the subjective warmth only — same room, softer shadows, no flash, no new light source. */
const g2Warm: LookDef = {
  grade: (lv) => `sepia(${0.3 * lv}) saturate(${1 + 0.1 * lv}) brightness(${1 + 0.06 * lv}) contrast(${1 - 0.06 * lv})`,
  Overlay: ({ lv }) => <rect width={1920} height={1080} fill="#C49A68" opacity={0.12 * lv} style={{ mixBlendMode: 'soft-light' }} />,
};

const cozyHome: LookDef = {
  grade: (lv) => `saturate(${1 + 0.14 * lv}) contrast(${1 + 0.06 * lv}) sepia(${0.12 * lv})`,
  Overlay: ({ lv }) => (
    <g opacity={lv * 0.35} style={{ pointerEvents: 'none' }}>
      <defs>
        <radialGradient id="cozyTableSpot" cx="52%" cy="48%" r="48%">
          <stop offset="15%" stopColor="#FFDE9A" stopOpacity={0.18} />
          <stop offset="55%" stopColor="#C4782A" stopOpacity={0.05} />
          <stop offset="100%" stopColor="#0D0704" stopOpacity={0.58} />
        </radialGradient>
      </defs>
      <rect width={1920} height={1080} fill="url(#cozyTableSpot)" style={{ mixBlendMode: 'screen' }} />
    </g>
  ),
};

export const tinNhanChuaGui = defineEpisode('TinNhanChuaGui', {
  timeline: timeline as Timeline,
  shots,
  looks: {
    nightAtmosphere,
    shopMystery,
    tension,
    whiteout,
    warmMemory,
    cozyHome,
    g2Warm,
  },
});
