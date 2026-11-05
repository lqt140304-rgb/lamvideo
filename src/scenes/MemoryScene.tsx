import React from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { ease } from "../anim";
import { color, font } from "../brand";
import { Captions } from "../components/Captions";
import type { MemoryScene as MemData } from "../types";
import castData from "../../public/tuoi-tho-dong-co/cast/cast.json";

type Leg = { file: string; x: number; y: number; w: number; h: number; px: number; py: number };
type Pose = { w: number; h: number; footX: number; footY: number; split?: { bodyH: number; body: string; legs: Leg[] } };
const CAST = castData as unknown as { chars: Record<string, Record<string, Pose>>; props: Record<string, { w: number; h: number }> };

const TAG: Record<string, { name: string; col: string }> = {
  BE: { name: "Bé", col: "#2F6FE0" },
  BA: { name: "Bà", col: "#B0577A" },
  ONG: { name: "Ông", col: "#6B7F2A" },
};
const GRADE = {
  past: { overlay: "rgba(255,190,110,0.20)", filter: "saturate(1.08) contrast(1.02)" },
  present: { overlay: "rgba(110,140,190,0.08)", filter: "saturate(0.98)" },
  warm: { overlay: "rgba(255,200,130,0.16)", filter: "saturate(1.05)" },
  night: { overlay: "rgba(20,24,60,0.38)", filter: "saturate(0.85) brightness(0.9)" },
} as const;

const BAND_TOP = 280;
const BAND_H = 1050;
const rng = (n: string) => random(n);

/** Ảnh sprite đặt theo điểm neo (ax, ay) trong ảnh gốc, xoay/lật quanh điểm neo. */
const Spr: React.FC<{
  slug: string; src: string; w: number; h: number; ax: number; ay: number; x: number; y: number;
  s?: number; rot?: number; flip?: boolean; opacity?: number; sx?: number; sy?: number; z?: number; filter?: string;
}> = ({ slug, src, w, h, ax, ay, x, y, s = 1, rot = 0, flip, opacity = 1, sx = 1, sy = 1, filter }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, opacity, filter, transformOrigin: "0 0", transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${(flip ? -1 : 1) * s * sx}, ${s * sy}) translate(${-ax}px, ${-ay}px)` }}>
    <Img src={staticFile(`${slug}/cast/${src}`)} style={{ width: w, height: h, display: "block" }} />
  </div>
);

const Shadow: React.FC<{ x: number; y: number; w: number; o?: number }> = ({ x, y, w, o = 0.3 }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - w * 0.07, width: w, height: w * 0.14, borderRadius: "50%", background: `rgba(24,18,8,${o})`, filter: `blur(${Math.max(3, w * 0.03)}px)` }} />
);

/** Bé: thân + hai chân tách riêng để chân đung đưa khi đi. */
const Boy: React.FC<{ slug: string; x: number; y: number; s: number; flip?: boolean; pose?: "up" | "cheer"; walk?: number; tilt?: number; hop?: number }> = ({ slug, x, y, s, flip, pose = "up", walk = 0, tilt = 0, hop = 0 }) => {
  const frame = useCurrentFrame();
  const P = CAST.chars.be[pose];
  const idle = Math.sin(frame / 15) * 1.2;
  if (pose === "cheer" || !P.split) {
    return (
      <>
        <Shadow x={x} y={y} w={230 * s} />
        <Spr slug={slug} src={`be/${pose}.png`} w={P.w} h={P.h} ax={P.footX} ay={P.footY} x={x} y={y - hop + idle} s={s} flip={flip} rot={tilt} />
      </>
    );
  }
  const phase = frame * walk;
  const la = walk ? Math.sin(phase) * 24 : 0;
  const bob = walk ? -Math.abs(Math.sin(phase)) * 7 : idle;
  const sp = P.split;
  return (
    <>
      <Shadow x={x} y={y} w={210 * s} />
      <div style={{ position: "absolute", left: 0, top: 0, width: P.w, height: P.h, transformOrigin: "0 0", transform: `translate(${x}px, ${y + (bob - hop) * s}px) rotate(${tilt}deg) scale(${(flip ? -1 : 1) * s}, ${s}) translate(${-P.footX}px, ${-P.footY}px)` }}>
        {sp.legs.map((lg, i) => (
          <div key={lg.file} style={{ position: "absolute", left: lg.x, top: lg.y, width: lg.w, height: lg.h, transformOrigin: `${lg.px - lg.x}px ${lg.py - lg.y}px`, transform: `rotate(${i === 0 ? la : -la}deg)` }}>
            <Img src={staticFile(`${slug}/cast/${lg.file}`)} style={{ width: lg.w, height: lg.h, display: "block" }} />
          </div>
        ))}
        <Img src={staticFile(`${slug}/cast/${sp.body}`)} style={{ position: "absolute", left: 0, top: 0, width: P.w, height: sp.bodyH, display: "block" }} />
      </div>
    </>
  );
};

/** Xe đạp (nét vẽ gốc) + bánh quay (nan hoa chồng lên) + bóng người đạp (silhouette tối giản, không mặt). */
const Bike: React.FC<{ slug: string; x: number; y: number; s: number; dist: number; haze?: number }> = ({ slug, x, y, s, dist, haze = 0 }) => {
  const rot = (dist / 80) * (180 / Math.PI);
  const hubs = [[91, 192], [324, 188]];
  const crank = (rot * 0.6 * Math.PI) / 180;
  const foot = (a: number) => [195 + Math.cos(a) * 24, 204 + Math.sin(a) * 24];
  const [f1x, f1y] = foot(crank);
  const [f2x, f2y] = foot(crank + Math.PI);
  const hip = [160, 52];
  const knee = (fx: number, fy: number) => [(hip[0] + fx) / 2 + 22, (hip[1] + fy) / 2 - 8];
  const k1 = knee(f1x, f1y);
  const k2 = knee(f2x, f2y);
  const sil = "rgba(86,62,44,0.95)";
  const bob = Math.sin(dist / 22) * 1.5;
  return (
    <>
      <Shadow x={x} y={y} w={470 * s} o={0.28} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 412, height: 289, transformOrigin: "0 0", filter: haze ? `blur(${haze}px)` : undefined, transform: `translate(${x}px, ${y + bob * s}px) scale(${s}) translate(${-206}px, ${-278}px)` }}>
        <svg width="412" height="289" viewBox="0 0 412 289" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <g stroke={sil} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <line x1={hip[0]} y1={hip[1]} x2={f2x} y2={f2y} strokeWidth={0} />
            <polyline points={`${hip[0]},${hip[1]} ${k2[0]},${k2[1]} ${f2x},${f2y}`} strokeWidth={15} opacity={0.8} />
            <line x1={hip[0]} y1={hip[1] - 4} x2={214} y2={-6} strokeWidth={34} />
            <line x1={206} y1={0} x2={252} y2={24} strokeWidth={12} />
          </g>
          <circle cx={224} cy={-34} r={19} fill={sil} />
        </svg>
        <Img src={staticFile(`${slug}/cast/props/bike.png`)} style={{ position: "absolute", left: 0, top: 0, width: 412, height: 289 }} />
        <svg width="412" height="289" viewBox="0 0 412 289" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {hubs.map(([cx, cy], w) => (
            <g key={w} transform={`rotate(${rot} ${cx} ${cy})`} stroke="rgba(235,225,205,0.75)" strokeWidth={1.4}>
              {Array.from({ length: 12 }, (_, i) => {
                const a = (i / 12) * Math.PI * 2;
                return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * 70} y2={cy + Math.sin(a) * 70} />;
              })}
            </g>
          ))}
          <g stroke={sil} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <polyline points={`${hip[0]},${hip[1]} ${k1[0]},${k1[1]} ${f1x},${f1y}`} strokeWidth={17} />
          </g>
        </svg>
      </div>
    </>
  );
};

const Kite: React.FC<{ slug: string; x: number; y: number; s: number; tx: number; ty: number; seed?: number }> = ({ slug, x, y, s, tx, ty, seed = 0 }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 22 + seed) * 7 + Math.sin(frame / 9 + seed) * 1.8;
  const dx = Math.sin(frame / 38 + seed) * 18;
  const dy = Math.cos(frame / 29 + seed) * 10;
  const kx = x + dx;
  const ky = y + dy;
  const mx = (kx + tx) / 2 + Math.sin(frame / 25 + seed) * 22;
  const my = (ky + ty) / 2 - 40;
  return (
    <>
      <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={`M ${kx} ${ky + 20 * s} Q ${mx} ${my} ${tx} ${ty}`} stroke="rgba(250,244,230,0.9)" strokeWidth={2.2} fill="none" />
      </svg>
      <Spr slug={slug} src="props/kite.png" w={272} h={334} ax={150} ay={120} x={kx} y={ky} s={s} rot={sway} />
    </>
  );
};

const Sparrow: React.FC<{ slug: string; x: number; y: number; s: number; flyAt: number; fx?: number; fy?: number; flip?: boolean }> = ({ slug, x, y, s, flyAt, fx = 520, fy = -520, flip }) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - flyAt);
  if (frame < flyAt) {
    const peck = Math.max(0, Math.sin(frame / 7)) > 0.8 ? 4 : 0;
    return (
      <>
        <Shadow x={x} y={y} w={90 * s} o={0.25} />
        <Spr slug={slug} src="props/sparrow.png" w={236} h={207} ax={118} ay={200} x={x} y={y} s={s} flip={flip} rot={peck} />
      </>
    );
  }
  const u = Math.min(1.6, t / 70);
  const flap = 1 + Math.sin(t * 1.6) * 0.14;
  return (
    <Spr slug={slug} src="props/sparrow_fly.png" w={303} h={270} ax={150} ay={135} x={x + fx * u * (flip ? -1 : 1)} y={y + fy * u * u * 0.6 - 40 * u} s={s * (1 - 0.25 * Math.min(1, u))} flip={flip} sy={flap} opacity={Math.max(0, 1 - Math.max(0, u - 1.1) * 2)} />
  );
};

const Grass: React.FC<{ slug: string; kind: "grass" | "flowers"; x: number; y: number; s: number; seed: number; flip?: boolean }> = ({ slug, kind, x, y, s, seed, flip }) => {
  const frame = useCurrentFrame();
  const d = CAST.props[kind];
  const sway = Math.sin(frame / 26 + seed * 2) * 2.2 + Math.sin(frame / 11 + seed) * 0.7;
  return <Spr slug={slug} src={`props/${kind}.png`} w={d.w} h={d.h} ax={d.w / 2} ay={d.h - 4} x={x} y={y} s={s} flip={flip} rot={sway} />;
};

/** Hạt phấn / bụi nắng trôi chậm. */
const Motes: React.FC<{ n?: number }> = ({ n = 16 }) => {
  const frame = useCurrentFrame();
  return (
    <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      {Array.from({ length: n }, (_, i) => {
        const x = (rng(`mx${i}`) * 1200 + frame * (0.3 + rng(`mv${i}`) * 0.6)) % 1200 - 60;
        const y = BAND_TOP + 80 + ((rng(`my${i}`) * 900 - frame * (0.2 + rng(`mu${i}`) * 0.4)) % 900 + 900) % 900;
        return <circle key={i} cx={x} cy={y + Math.sin(frame / 30 + i) * 8} r={2 + rng(`mr${i}`) * 3} fill="rgba(255,246,214,0.55)" />;
      })}
    </svg>
  );
};

export const MemoryScene: React.FC<{ scene: MemData; frames: number; slug: string; lines: { from: number; frames: number }[] }> = ({ scene, frames, slug, lines }) => {
  const frame = useCurrentFrame();
  const g = GRADE[scene.bg.grade ?? "past"];
  const k = frames > 1 ? frame / (frames - 1) : 0;
  const z0 = scene.bg.zoom ?? 1;
  const zoom = z0 + ((scene.bg.zoomTo ?? z0) - z0) * k;
  const pan = (scene.bg.panFrom ?? 0) + ((scene.bg.panTo ?? scene.bg.panFrom ?? 0) - (scene.bg.panFrom ?? 0)) * k;
  const bgSrc = staticFile(`${slug}/img/${scene.bg.file}`);
  let cur = -1;
  lines.forEach((l, i) => { if (frame >= l.from) cur = i; });
  const sec = frame / 30;
  const fadeIn = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  let layers: React.ReactNode = null;
  const FLOOR = BAND_TOP + BAND_H;
  if (scene.kind === "grass") {
    layers = (
      <>
        <Sparrow slug={slug} x={600} y={1215} s={0.7} flyAt={190} fx={380} fy={-420} />
        <Grass slug={slug} kind="grass" x={150} y={FLOOR + 40} s={2.1} seed={1} />
        <Grass slug={slug} kind="flowers" x={560} y={FLOOR + 50} s={1.9} seed={2} />
        <Grass slug={slug} kind="grass" x={930} y={FLOOR + 30} s={1.9} seed={3} flip />
        <Grass slug={slug} kind="grass" x={1090} y={FLOOR + 70} s={2.4} seed={4} />
      </>
    );
  } else if (scene.kind === "road") {
    const bx = -340 + Math.max(0, frame - 95) * 12;
    const walkIn = ease(frame, 0, 60);
    const bx0 = -140 + walkIn * 760;
    const bikeNear = bx > 350 && bx < 950;
    const faceRight = bx > 640; // bé ngoảnh theo xe
    layers = (
      <>
        <Kite slug={slug} x={800} y={520} s={0.6} tx={660} ty={1150} seed={1.3} />
        <Boy slug={slug} x={bx0} y={1292} s={0.85} flip={!faceRight && frame > 80} walk={frame < 60 ? 0.42 : 0} tilt={bikeNear ? (faceRight ? 2 : -2) : 0} />
        <Bike slug={slug} x={bx} y={1318} s={0.72} dist={bx} />
        <Grass slug={slug} kind="grass" x={90} y={FLOOR + 50} s={1.6} seed={5} />
        <Grass slug={slug} kind="grass" x={1010} y={FLOOR + 40} s={1.5} seed={6} flip />
      </>
    );
  } else if (scene.kind === "kite") {
    const run = Math.max(0, frame - 150);
    const x = 620 + run * run * 0.05 + run * 4;
    const cheer = frame >= 70 && frame < 140;
    layers = (
      <>
        <Kite slug={slug} x={760} y={560} s={0.8} tx={640} ty={1150} seed={0.4} />
        <Sparrow slug={slug} x={920} y={1170} s={0.5} flyAt={40} fx={-300} fy={-260} flip />
        <Boy slug={slug} x={x} y={1292} s={cheer ? 0.74 : 0.85} pose={cheer ? "cheer" : "up"} flip={false} walk={run > 0 ? 0.55 : 0} hop={cheer ? Math.abs(Math.sin(frame / 4)) * 12 : 0} />
        <Grass slug={slug} kind="grass" x={110} y={FLOOR + 50} s={1.7} seed={7} />
        <Grass slug={slug} kind="flowers" x={900} y={FLOOR + 60} s={1.6} seed={8} />
      </>
    );
  } else {
    // yard / quiet: ông bà ngồi ở hiên, bé chạy vào
    const quiet = scene.kind === "quiet";
    const arrive = quiet ? 0 : 100;
    const enter = quiet ? 1 : ease(frame, 0, arrive);
    const bx = quiet ? 640 : -160 + enter * 800;
    const bwalk = !quiet && frame < arrive ? 0.5 : 0;
    const t = (s: number) => sec >= s;
    const baPose = quiet ? "fan" : t(7) && sec < 11 ? "greet" : "fan";
    const ongPose = quiet ? "sit" : t(10.5) && sec < 16 ? "smile" : "sit";
    const boyPose = !quiet && frame >= arrive && sec < 9 ? "cheer" : "up";
    const fan = Math.sin(frame / 5.5);
    const baD = CAST.chars.ba[baPose];
    const ongD = CAST.chars.ong[ongPose];
    const sway = Math.sin(frame / 34) * 0.9;
    layers = (
      <>
        <Shadow x={400} y={1040} w={230} o={0.3} />
        <Spr slug={slug} src={`ba/${baPose}.png`} w={baD.w} h={baD.h} ax={baD.footX} ay={baD.footY} x={400} y={1040} s={0.7} rot={sway} />
        {baPose === "fan" ? (
          <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M ${475 + i * 14} ${815 + i * 22} q ${20 + fan * 8} ${10} ${42} ${-6 + fan * 6}`} stroke="rgba(255,255,255,0.45)" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.35 + 0.3 * Math.abs(fan)} />
            ))}
          </svg>
        ) : null}
        <Shadow x={870} y={1050} w={240} o={0.3} />
        <Spr slug={slug} src={`ong/${ongPose}.png`} w={ongD.w} h={ongD.h} ax={ongD.footX} ay={ongD.footY} x={870} y={1050} s={0.7} rot={-sway * 0.6} />
        <Kite slug={slug} x={250} y={470} s={quiet ? 0.5 : 0.0} tx={360} ty={1000} seed={2.2} />
        <Sparrow slug={slug} x={280} y={1210} s={0.55} flyAt={quiet ? 420 : 9999} fx={400} fy={-420} />
        <Boy slug={slug} x={bx} y={quiet ? 1200 : 1190} s={quiet ? 0.78 : 0.85} pose={boyPose} flip={quiet} walk={bwalk} hop={boyPose === "cheer" ? Math.abs(Math.sin(frame / 5)) * 10 : 0} />
        <Grass slug={slug} kind="flowers" x={150} y={FLOOR + 55} s={1.5} seed={9} />
        <Grass slug={slug} kind="grass" x={1000} y={FLOOR + 55} s={1.5} seed={10} flip />
      </>
    );
  }

  return (
    <AbsoluteFill style={{ background: "#2a2622", opacity: fadeIn }}>
      <Img src={bgSrc} style={{ position: "absolute", left: -240, top: -120, width: 1560, height: 2160, objectFit: "cover", filter: "blur(34px) brightness(0.6) saturate(1.1)" }} />
      <div style={{ position: "absolute", left: 0, top: BAND_TOP, width: 1080, height: BAND_H, overflow: "hidden", boxShadow: "0 0 60px rgba(0,0,0,0.35)" }}>
        <Img src={bgSrc} style={{ position: "absolute", left: "50%", top: "50%", height: BAND_H, minWidth: 1080, transform: `translate(calc(-50% + ${pan * 220}px), -50%) scale(${zoom})`, objectFit: "cover", filter: g.filter, transformOrigin: scene.bg.focus ?? "50% 50%" }} />
        <div style={{ position: "absolute", inset: 0, background: g.overlay }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.32) 100%)" }} />
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, clipPath: `inset(${BAND_TOP}px 0 ${1920 - BAND_TOP - BAND_H}px 0)` }}>
        {layers}
        <Motes />
      </div>

      {scene.label ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 292, textAlign: "center", opacity: interpolate(frame, [10, 26, frames - 24, frames - 8], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <span style={{ display: "inline-block", fontFamily: font.display, fontWeight: 900, fontSize: 44, color: "#fff", background: "rgba(29,27,25,0.78)", padding: "10px 30px", borderRadius: 40 }}>{scene.label}</span>
        </div>
      ) : null}

      {scene.lines.map((ln, i) => {
        const l = lines[i];
        if (!l) return null;
        const end = i + 1 < lines.length ? lines[i + 1].from : frames;
        const dur = Math.max(8, Math.min(end - l.from, l.frames + 12));
        if (frame < l.from || frame >= l.from + dur) return null;
        const tag = TAG[ln.who];
        return (
          <div key={ln.id}>
            {tag ? (
              <div style={{ position: "absolute", left: 0, right: 0, top: 1470, textAlign: "center" }}>
                <span style={{ fontFamily: font.body, fontWeight: 800, fontSize: 30, color: "#fff", background: tag.col, padding: "4px 20px", borderRadius: 22 }}>{tag.name}{ln.invented ? " · lời sáng tác" : ""}</span>
              </div>
            ) : null}
            <Captions text={ln.sub ?? ln.text} speechFrames={Math.max(1, l.frames)} />
          </div>
        );
      })}

      {scene.endCard ? (
        <AbsoluteFill style={{ opacity: interpolate(frame, [frames - 100, frames - 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <div style={{ position: "absolute", left: 60, right: 60, top: 1500, textAlign: "center" }}>
            <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 52, color: "#FFE9A8", textShadow: "0 3px 10px rgba(0,0,0,0.6)" }}>{scene.endCard.text}</div>
            {scene.endCard.small ? <div style={{ marginTop: 10, fontFamily: font.body, fontWeight: 700, fontSize: 32, color: "#fff", opacity: 0.92 }}>{scene.endCard.small}</div> : null}
          </div>
        </AbsoluteFill>
      ) : null}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1640, textAlign: "center", fontFamily: font.body, fontWeight: 700, fontSize: 26, color: "rgba(255,255,255,0.78)" }}>{scene.source ?? ""}</div>
    </AbsoluteFill>
  );
};
