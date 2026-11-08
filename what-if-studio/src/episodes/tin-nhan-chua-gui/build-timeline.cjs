// Builds timeline.json from the source script (KICH-BAN.md) and the cue plan (cues.json).
// The script stays the only copy of the words: cues.json only says which numbered items (lines / [NGHỈ] pauses) of
// each scene play over which cue shot. Durations are estimates until real voice audio exists.
//   node src/episodes/tin-nhan-chua-gui/build-timeline.cjs          write timeline.json
//   node src/episodes/tin-nhan-chua-gui/build-timeline.cjs --items  list numbered items per scene
const fs = require('node:fs');
const path = require('node:path');
const here = __dirname;
const SRC = path.resolve(here, '../../../../episodes/hem-co-chuyen/tap-01-tin-nhan-chua-gui/KICH-BAN.md');
const plan = JSON.parse(fs.readFileSync(path.join(here, 'cues.json'), 'utf8'));
const FPS = 30;

// scene number -> ordered items: {kind:'line', text} | {kind:'pause', sec, text}
const items = {};
let scene = null;
for (const raw of fs.readFileSync(SRC, 'utf8').split(/\r?\n/)) {
  const h = raw.match(/^## Cảnh (\d+)\./);
  if (h) { scene = Number(h[1]); items[scene] = []; continue; }
  if (/^## /.test(raw)) { scene = null; continue; }
  if (scene === null) continue;
  const q = raw.match(/^> (.+)/);
  const p = raw.match(/^\*\*\[(?:NGHỈ|KHÔNG LỜI) (\d+(?:,\d+)?) giây — (.+?)\]\*\*/);
  if (q) items[scene].push({ kind: 'line', text: q[1].trim() });
  else if (p) items[scene].push({ kind: 'pause', sec: Number(p[1].replace(',', '.')), text: p[2] });
}

if (process.argv.includes('--items')) {
  for (const [s, list] of Object.entries(items)) {
    console.log(`\n## Cảnh ${s}`);
    list.forEach((it, i) => console.log(`${String(i).padStart(2)} ${it.kind === 'pause' ? `[${it.sec}s] ` : ''}${it.text.slice(0, 110)}`));
  }
  process.exit(0);
}

const words = (s) => s.replace(/[“”"…—,.!?:;()]/g, ' ').split(/\s+/).filter(Boolean).length;
const lineSec = (t) => words(t) / plan.wordsPerSec + plan.lineGapSec;

// Every scene item must be used exactly once, in order.
const used = {};
const segments = [];
const shots = new Map();
const clock = {};
const allMarks = [];
let a = 0;
for (const seg of plan.segments) {
  let sec = seg.sec ?? 0;
  const said = [];
  const marks = [];
  if (seg.items) {
    const [s, from, to] = seg.items;
    for (let i = from; i <= to; i++) {
      const it = items[s]?.[i];
      if (!it) throw new Error(`${seg.cue}: no item ${i} in scene ${s}`);
      const next = used[s] ?? 0;
      if (i !== next) throw new Error(`${seg.cue}: scene ${s} item ${i} out of order (expected ${next})`);
      used[s] = i + 1;
      const d = it.kind === 'pause' ? it.sec : lineSec(it.text);
      marks.push({ s, i, kind: it.kind, at: sec, len: d });
      sec += d;
      said.push(it.kind === 'pause' ? `[nghỉ ${it.sec}s]` : it.text);
    }
  }
  const len = Math.round(sec * FPS);
  const shot = `Sh${seg.cue.replace('-', '_')}`;
  // t0: where this segment starts on the shot's own clock (seconds); t1 instead pins where it ends (lead-in holds).
  // pauseAt pins the segment's first [NGHỈ]/[KHÔNG LỜI] item to that clock second (e.g. the farewell's 8 s silence).
  const firstPause = marks.find((m) => m.kind === 'pause');
  const t0 = seg.pauseAt !== undefined ? Math.round(seg.pauseAt * FPS - firstPause.at * FPS)
    : seg.t1 !== undefined ? Math.round(seg.t1 * FPS) - len : seg.t0 !== undefined ? Math.round(seg.t0 * FPS) : (clock[shot] ?? 0);
  clock[shot] = t0 + len;
  // Where each line / pause falls on the shot's own clock, so actions can sync to words without hard-coded seconds.
  for (const m of marks) allMarks.push({ shot, s: m.s, i: m.i, kind: m.kind, at: t0 + Math.round(m.at * FPS), len: Math.round(m.len * FPS) });
  segments.push({ shot, a, b: a + len, t0, t1: t0 + len, look: seg.look, line: said.join(' ') || seg.note || '' });
  if (!shots.has(shot)) {
    const c = plan.cues[seg.cue];
    if (!c) throw new Error(`No cue description for ${seg.cue}`);
    shots.set(shot, { id: shot, size: c.size, key: Math.round((c.key ?? 1) * FPS), len: 0, first: a, line: said.join(' ').slice(0, 160), note: `${seg.cue} · ${c.note}` });
  }
  shots.get(shot).len = Math.max(shots.get(shot).len, t0 + len);
  a += len;
}
for (const [s, list] of Object.entries(items)) if ((used[s] ?? 0) !== list.length) throw new Error(`Scene ${s}: items ${used[s] ?? 0}..${list.length - 1} not placed on any cue`);
const missing = Object.keys(plan.cues).filter((c) => !shots.has(`Sh${c.replace('-', '_')}`));
if (missing.length) throw new Error(`Cues without a segment: ${missing.join(', ')}`);

const order = Object.keys(plan.cues).map((c) => shots.get(`Sh${c.replace('-', '_')}`));
const tl = { slug: 'tin-nhan-chua-gui', title: plan.title, fps: FPS, total: a, estimate: plan.estimateNote, segments, shots: order, marks: allMarks, fx: [], audio: {} };
fs.writeFileSync(path.join(here, 'timeline.json'), JSON.stringify(tl, null, 1) + '\n');
const mmss = (f) => `${Math.floor(f / FPS / 60)}:${String(Math.round((f / FPS) % 60)).padStart(2, '0')}`;
console.log(`${order.length} cue shots, ${segments.length} segments, ${a} frames = ${mmss(a)} (estimate)`);
