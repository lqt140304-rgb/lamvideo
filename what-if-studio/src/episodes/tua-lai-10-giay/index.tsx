import React from 'react';
import { defineEpisode, Timeline, LookDef, TapeLines, HudChip, Dial, FONT, ShotMap } from '../../engine';
import timeline from './timeline.json';
import * as A from './shots_a';
import * as B from './shots_b';
import * as C from './shots_c';
import * as D from './shots_d';

// "Nếu ngày đó bạn không bỏ học?": một cú tua ngược ở đầu phim (bụi bay ngược, công trường lùi lại, áo lao động thành đồng phục).
const tuaLook: LookDef = {
  grade: (lv) => `saturate(${1 - 0.45 * lv}) contrast(${1 + 0.1 * lv}) hue-rotate(${-14 * lv}deg)`,
  jitter: 5,
  Overlay: ({ f, p }) => {
    const secs = 10 * (1 - p);
    const read = `-${String(Math.floor(secs)).padStart(2, '0')}.${String(Math.floor((secs % 1) * 100)).padStart(2, '0')}`;
    return (
      <g>
        <TapeLines f={f} />
        <HudChip f={f} label="TUA LẠI" icon="rewind" />
        <Dial p={1 - p} readout={read} />
        <text x={1820} y={1010} textAnchor="end" fontFamily={FONT.ui} fontSize={28} fill="#F6EFE3" opacity={0.6}>
          10 GIÂY
        </text>
      </g>
    );
  },
};

const shots = { ...A, ...B, ...C, ...D } as unknown as ShotMap;

export const tuaLai10Giay = defineEpisode('TuaLai10Giay', {
  timeline: timeline as Timeline,
  shots,
  looks: { tua: tuaLook },
});
