import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FONT } from '../../engine';
import { tinNhanChuaGui } from './index';
import timeline from './timeline.json';

// Animatic review cut: the film plus burned-in script lines and a cue tag, because there is no voice yet.
// Lines come from timeline marks (built from KICH-BAN.md), so they move with the estimated timing. Not for release.
type Mark = { shot: string; kind: string; f: number; len: number; text: string };
const MARKS = (timeline as unknown as { marks: Mark[] }).marks;
const SEGS = (timeline as unknown as { segments: { shot: string; a: number; b: number }[] }).segments;

export const TinNhanChuaGuiAnimatic: React.FC = () => {
  const f = useCurrentFrame();
  const m = MARKS.find((x) => f >= x.f && f < x.f + x.len);
  const seg = SEGS.find((s) => f >= s.a && f < s.b);
  const cue = seg ? seg.shot.replace('Sh', '').replace('_', '-') : '';
  const sec = f / 30;
  const clock = `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
  return (
    <AbsoluteFill>
      <tinNhanChuaGui.Main />
      <div style={{ position: 'absolute', top: 18, left: 22, padding: '4px 12px', borderRadius: 6, background: 'rgba(0,0,0,.55)', color: '#F6E6B4', fontFamily: FONT.ui, fontSize: 26 }}>
        ANIMATIC v1 · {cue} · {clock}
      </div>
      {m ? (
        <div style={{ position: 'absolute', left: 160, right: 160, bottom: 92, textAlign: 'center' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '8px 18px',
              borderRadius: 8,
              background: 'rgba(0,0,0,.62)',
              color: m.kind === 'pause' ? '#B9C2CF' : '#FFF8EA',
              fontStyle: m.kind === 'pause' ? 'italic' : 'normal',
              fontFamily: FONT.title,
              fontSize: 36,
              lineHeight: 1.3,
            }}
          >
            {m.kind === 'pause' ? `[nghỉ] ${m.text}` : m.text}
          </span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
