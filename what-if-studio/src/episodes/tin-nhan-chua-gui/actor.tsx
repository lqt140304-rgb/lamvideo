import React, { createContext, useContext } from 'react';
import { Hero as RigHero, lerp, clamp, type Pose } from '../../engine';
import data from './mouth.json';

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

export const Hero: React.FC<React.ComponentProps<typeof RigHero>> = (props) => {
  const f = useContext(ActorClock);
  const role = props.look?.extra ? ROLE_OF[props.look.extra] : undefined;
  return <RigHero {...props} pose={actOn(props.pose, role, f)} />;
};
