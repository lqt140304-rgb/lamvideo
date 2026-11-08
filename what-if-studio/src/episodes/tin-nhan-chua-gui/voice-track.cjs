// Lays every recorded voice piece at its timeline frame into one track: public/tin-nhan-chua-gui/voice/voice-track.mp3.
// Run after build-timeline.cjs. Mother's recording (scene 4, role me) plays from the phone speaker: band-limited and a bit quieter.
//   node src/episodes/tin-nhan-chua-gui/voice-track.cjs
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const studio = path.resolve(__dirname, '../../..');
const tl = JSON.parse(fs.readFileSync(path.join(__dirname, 'timeline.json'), 'utf8'));
if (!tl.voice?.length) throw new Error('timeline.json has no voice cues — run voice.cjs lines, then build-timeline.cjs');
const source = path.resolve(studio, '../episodes/hem-co-chuyen/tap-01-tin-nhan-chua-gui/KICH-BAN.md');
const sourceHash = crypto.createHash('sha256').update(fs.readFileSync(source, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
if (tl.scriptSha256 !== sourceHash) throw new Error('Timeline is from the previous script; do not overwrite its voice track with new lines. Retime/build the current timeline first.');
// Yuna is a young adult voice: lifting pitch and formants together (duration kept) reads as a child; the highpass takes out the chestiness.
const THAO_LIFT = 1.15;
const THAO_FX = `asetrate=${Math.round(44100 * THAO_LIFT)},aresample=44100,atempo=${(1 / THAO_LIFT).toFixed(5)},highpass=f=190,equalizer=f=3400:t=q:w=1.3:g=3,`;
const inputs = [];
const chains = [];
tl.voice.forEach((v, n) => {
  inputs.push('-i', path.join(studio, 'public', v.file));
  const ms = Math.round((v.f / tl.fps) * 1000);
  const fx = v.role === 'me' && v.id.split('.')[0] === '4' ? 'highpass=f=320,lowpass=f=3400,volume=0.8,' : v.role === 'thao' ? THAO_FX : '';
  chains.push(`[${n}:a]aresample=44100,aformat=channel_layouts=mono,${fx}adelay=${ms}:all=1[v${n}]`);
});
// Lộc's laugh is not a line: it starts in the 3 s pause, runs under the cuts, drops once they are outside and stops as they leave the frame.
const laughFile = path.join(studio, 'public/tin-nhan-chua-gui/voice/loc-laugh.mp3');
const labels = tl.voice.map((_, n) => `[v${n}]`);
if (fs.existsSync(laughFile)) {
  const from = tl.marks.find((m) => m.s === 8 && m.i === 5);
  const to = tl.marks.find((m) => m.s === 8 && m.i === 6);
  const outside = tl.segments.find((s) => s.shot === 'ShC8_E');
  const len = (to.f - from.f) / tl.fps;
  const n = tl.voice.length;
  inputs.push('-stream_loop', '-1', '-i', laughFile);
  const quiet = (outside.a - from.f) / tl.fps;
  chains.push(`[${n}:a]aresample=44100,aformat=channel_layouts=mono,atrim=0:${len.toFixed(3)},volume='if(gte(t,${quiet.toFixed(3)}),0.34,0.68)':eval=frame,afade=t=out:st=${(len - 0.7).toFixed(3)}:d=0.7,adelay=${Math.round((from.f / tl.fps) * 1000)}:all=1[laugh]`);
  labels.push('[laugh]');
}
// The laugh returns, wilder, as the shop turns into the vault: C9-A from its first frame inside the shop to the start of the change.
if (fs.existsSync(laughFile)) {
  const c9 = tl.segments.find((s) => s.shot === 'ShC9_A');
  const n = tl.voice.length + 1;
  inputs.push('-i', laughFile);
  chains.push(`[${n}:a]aresample=44100,aformat=channel_layouts=mono,atrim=5.5:9.6,asetpts=PTS-STARTPTS,volume=0.9,afade=t=in:d=0.25,afade=t=out:st=3.2:d=0.9,adelay=${Math.round(((c9.a + 112) / tl.fps) * 1000)}:all=1[laugh2]`);
  labels.push('[laugh2]');
}
const mix = `${labels.join('')}amix=inputs=${labels.length}:normalize=0:dropout_transition=0,alimiter=limit=0.89:level=false,apad,atrim=0:${(tl.total / tl.fps).toFixed(3)}[out]`;
const script = path.join(studio, 'out/tin-nhan-chua-gui/voice-track.filter');
fs.mkdirSync(path.dirname(script), { recursive: true });
fs.writeFileSync(script, [...chains, mix].join(';\n'));
const out = path.join(studio, 'public/tin-nhan-chua-gui/voice/voice-track.mp3');
execFileSync('ffmpeg', ['-v', 'error', '-y', ...inputs, '-/filter_complex', script, '-map', '[out]', '-ac', '1', '-ar', '44100', '-b:a', '128k', out], { stdio: 'inherit' });
console.log(`wrote ${path.relative(studio, out)} (${tl.voice.length} pieces, ${(tl.total / tl.fps).toFixed(1)} s)`);
