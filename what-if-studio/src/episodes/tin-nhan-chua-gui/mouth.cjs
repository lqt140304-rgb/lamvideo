// Mouth data for every on-screen speaker, measured from the real takes: per-frame opening and a vowel index per syllable.
// Run after build-timeline.cjs:  node src/episodes/tin-nhan-chua-gui/mouth.cjs  →  mouth.json (read by actor.tsx)
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const here = __dirname;
const studio = path.resolve(here, '../../..');
const tl = JSON.parse(fs.readFileSync(path.join(here, 'timeline.json'), 'utf8'));
const FPS = tl.fps;

const decode = (file) => {
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', path.join(studio, 'public', file), '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
  return new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
};
const envelope = (samples) => {
  const per = 16000 / FPS;
  const n = Math.ceil(samples.length / per);
  const rms = [];
  for (let i = 0; i < n; i++) {
    let s = 0;
    const a = Math.floor(i * per), b = Math.min(samples.length, Math.floor((i + 1) * per));
    for (let k = a; k < b; k++) s += samples[k] * samples[k];
    rms.push(Math.sqrt(s / Math.max(1, b - a)));
  }
  const ref = [...rms].sort((x, y) => x - y)[Math.floor(n * 0.92)] || 1;
  const talk = [], shape = [];
  let v = 0, syl = 0;
  for (let i = 0; i < n; i++) {
    const target = Math.min(1, Math.max(0, (rms[i] / ref - 0.12) / 0.75));
    v += (target - v) * (target > v ? 0.75 : 0.45); // opens fast, closes a little slower
    talk.push(Math.round(v * 99));
    if (i > 0 && i < n - 1 && rms[i] > rms[i - 1] && rms[i] >= rms[i + 1] && target > 0.3) syl++;
    shape.push(syl);
  }
  return { talk, shape };
};

// Off-screen voices move no mouth: the narrator, and the mother's recording played from the phone in scene 4.
const cues = tl.voice
  .filter((v) => v.role !== 'narrator' && !(v.role === 'me' && v.id.startsWith('4.')))
  .map((v) => ({ role: v.role, s: Number(v.id.split('.')[0]), f: v.f, ...envelope(decode(v.file)) }));
fs.writeFileSync(path.join(here, 'mouth.json'), JSON.stringify({ cues }) + '\n');
console.log(`mouth.json: ${cues.length} takes, ${cues.reduce((n, c) => n + c.talk.length, 0)} frames`);
