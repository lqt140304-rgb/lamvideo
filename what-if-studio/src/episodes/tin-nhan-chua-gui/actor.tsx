import React, { createContext, useContext, useId } from 'react';
import { Hero as RigHero, lerp, clamp, type Pose } from '../../engine';
import data from './mouth.json';
import timeline from './timeline.json';

// Every character in the film is drawn through this Hero. From the film's clock it adds what must be true of every shot:
// only the person speaking moves their mouth, in time with the take; the others look at the speaker and react when a line lands.
// Shots stay in charge of staging: anything a shot sets itself (a laugh's mouth, say) is left alone.

type Cue = { role: string; s: number; f: number; talk: number[]; shape: number[] };
const CUES = (data as { cues: Cue[] }).cues;
const SHAPES = ['a', 'e', 'o', 'a', 'u', 'e', 'o'] as const;
export const ActorClock = createContext(-1); // film frame; -1 outside the film (tests, sheets): no automatic acting

const ROLE_OF: Record<string, string> = { spiky: 'duy', thaoHair: 'thao', locHair: 'loc', lowTie: 'me' };

// Eye direction toward a speaker, from the fixed blocking: Duy left, Thảo right, the adult between them and further back.
const GAZE: Record<string, Record<string, number>> = {
  duy: { thao: 0.6, loc: 0.35, me: 0.4 },
  thao: { duy: -0.6, loc: -0.35, me: -0.4 },
  loc: { duy: -0.4, thao: 0.3 },
  me: { duy: -0.5, thao: 0.5 },
};
const SEED: Record<string, number> = { duy: 0, thao: 5, loc: 3, me: 8 };

const bell = (v: number) => (v <= 0 || v >= 1 ? 0 : Math.sin(v * Math.PI));

export const actOn = (pose: Pose, role: string | undefined, f: number): Pose => {
  if (!role || f < 0) return pose;
  const out: Pose = { ...pose };
  const own = CUES.find((c) => c.role === role && f >= c.f && f < c.f + c.talk.length);
  if (own && out.talk === undefined) {
    const i = f - own.f;
    const v = own.talk[i] / 99;
    if (v > 0.06) {
      out.talk = 0.25 + 0.75 * v;
      out.mouthShape = SHAPES[own.shape[i] % SHAPES.length];
    } else {
      out.talk = 0;
      out.mouthShape = 'closed';
    }
    out.headTilt += (v - 0.35) * 2.6; // the head rides the stressed syllables
  }
  const weeping = out.expr === 'cry' || out.expr === 'tearsHeldBack';
  if (weeping) {
    out.lipTremble = (out.lipTremble ?? 0) + Math.sin(f * 1.6) * 0.6;
    out.shoulderLift = (out.shoulderLift ?? 0) + Math.max(0, Math.sin(f * 0.34)) * 0.2; // uneven catching breath, not a steady shake
  }
  if (own) return out;
  // Listening: look to whoever is talking (or just finished), blink as they begin, give a small nod when the line lands.
  const other = CUES.filter((c) => c.role !== role && c.f - 4 <= f && f < c.f + c.talk.length + 16).pop();
  const target = other ? GAZE[role]?.[other.role] : undefined;
  if (other && target !== undefined) {
    const end = other.f + other.talk.length;
    const w = Math.min(clamp((f - other.f + 4) / 8), clamp((end + 16 - f) / 10));
    out.look = lerp(out.look, target, 0.75 * w);
    const b = f - other.f + (SEED[role] ?? 0) % 3;
    if (b >= 1 && b <= 3) out.blink = Math.max(out.blink, 1);
    out.headTilt += bell((f - end + 2) / 14) * 2.6;
  }
  return out;
};

// Where the light comes from in each place: [x, y, power]. On a body, the side toward the strongest nearby source stays lit and the far side falls away.
type Source = [number, number, number];
const ROOM: Source[] = [[1192, 452, 1], [565, 620, 0.8], [940, 215, 1.2], [1815, 520, 0.5]];
const SEGS = (timeline as unknown as { segments: { shot: string; a: number; b: number }[] }).segments;
const lightsAt = (f: number): { src: Source[]; dark: string; amount: number } | null => {
  const shot = SEGS.find((s) => f >= s.a && f < s.b)?.shot ?? '';
  if (/^ShC[0]_|^ShC8_E/.test(shot)) return { src: [[1620, 560, 1]], dark: '0 0 0 0 .03  0 0 0 0 .04  0 0 0 0 .09  0 0 0 1 0', amount: 0.55 };
  if (/^ShC[67]_/.test(shot)) return { src: [[260, 420, 1]], dark: '0 0 0 0 .26  0 0 0 0 .14  0 0 0 0 .1  0 0 0 1 0', amount: 0.26 };
  if (shot === 'ShC8_C') return { src: [[960, 300, 1]], dark: '0 0 0 0 .04  0 0 0 0 .03  0 0 0 0 .08  0 0 0 1 0', amount: 0.55 };
  if (shot === 'ShC8_D') return { src: [[680, 640, 1]], dark: '0 0 0 0 .03  0 0 0 0 .03  0 0 0 0 .08  0 0 0 1 0', amount: 0.6 };
  if (/^ShC9_[BCD]/.test(shot)) return null; // the creature lights its own vault
  return { src: ROOM, dark: '0 0 0 0 .05  0 0 0 0 .03  0 0 0 0 .07  0 0 0 1 0', amount: 0.55 };
};

export const Hero: React.FC<React.ComponentProps<typeof RigHero>> = (props) => {
  const f = useContext(ActorClock);
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const role = props.look?.extra ? ROLE_OF[props.look.extra] : undefined;
  const pose = actOn(props.pose, role, f);
  const body = <RigHero {...props} pose={pose} />;
  const light = f >= 0 && role ? lightsAt(f) : null;
  if (!light) return body;
  // Same figure again in shadow colour, revealed only on the side away from the light: the falloff follows the body's own shape.
  const c = { x: pose.x, y: pose.y - 100 * pose.scale };
  const [lx, ly] = light.src.reduce((best, s) => (s[2] / (Math.hypot(s[0] - c.x, s[1] - c.y) + 80) > best[2] / (Math.hypot(best[0] - c.x, best[1] - c.y) + 80) ? s : best));
  const d = Math.hypot(lx - c.x, ly - c.y);
  const near = Math.max(0, d - 150 * pose.scale);
  const far = d + 190 * pose.scale;
  const v = Math.round(light.amount * 255);
  return (
    <>
      {body}
      <defs>
        <radialGradient id={`${id}g`} gradientUnits="userSpaceOnUse" cx={lx} cy={ly} r={far}>
          <stop offset={near / far} stopColor="#000" />
          <stop offset={1} stopColor={`rgb(${v},${v},${v})`} />
        </radialGradient>
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" x={-1500} y={-1500} width={5000} height={4500}><rect x={-1500} y={-1500} width={5000} height={4500} fill={`url(#${id}g)`} /></mask>
        <filter id={`${id}f`} x="-20%" y="-20%" width="140%" height="140%"><feColorMatrix type="matrix" values={light.dark} /></filter>
      </defs>
      <g mask={`url(#${id}m)`}><g filter={`url(#${id}f)`}><RigHero {...props} pose={pose} shadow={0} /></g></g>
    </>
  );
};
