import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FONT } from '../../engine';
import { tinNhanChuaGui } from './index';
import timeline from './timeline.json';

// Review build: the film plus a small cue/clock tag so notes can name the exact moment. Not for release.
const SEGS = (timeline as unknown as { segments: { shot: string; a: number; b: number }[] }).segments;

export const TinNhanChuaGuiAnimatic: React.FC = () => {
  const f = useCurrentFrame();
  const seg = SEGS.find((s) => f >= s.a && f < s.b);
  const cue = seg ? seg.shot.replace('Sh', '').replace('_', '-') : '';
  const sec = f / 30;
  const clock = `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
  return (
    <AbsoluteFill>
      <tinNhanChuaGui.Main />
      <div style={{ position: 'absolute', top: 18, left: 22, padding: '4px 12px', borderRadius: 6, background: 'rgba(0,0,0,.55)', color: '#F6E6B4', fontFamily: FONT.ui, fontSize: 26 }}>
        ANIMATIC · kịch bản {(timeline as { scriptRevision?: number }).scriptRevision ?? "?"} · {cue} · {clock}
      </div>
    </AbsoluteFill>
  );
};
