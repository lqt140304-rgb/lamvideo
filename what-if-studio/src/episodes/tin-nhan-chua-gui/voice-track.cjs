// Lays every recorded voice piece at its timeline frame into one track: public/tin-nhan-chua-gui/voice/voice-track.mp3.
// Run after build-timeline.cjs. Mother's recording (4.6.0) plays from the phone speaker: band-limited and a bit quieter.
//   node src/episodes/tin-nhan-chua-gui/voice-track.cjs
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const studio = path.resolve(__dirname, '../../..');
const tl = JSON.parse(fs.readFileSync(path.join(__dirname, 'timeline.json'), 'utf8'));
if (!tl.voice?.length) throw new Error('timeline.json has no voice cues — run voice.cjs lines, then build-timeline.cjs');
const PHONE = new Set(['4.6.0']);
const inputs = [];
const chains = [];
tl.voice.forEach((v, n) => {
  inputs.push('-i', path.join(studio, 'public', v.file));
  const ms = Math.round((v.f / tl.fps) * 1000);
  const fx = PHONE.has(v.id) ? 'highpass=f=320,lowpass=f=3400,volume=0.8,' : '';
  chains.push(`[${n}:a]aresample=44100,aformat=channel_layouts=mono,${fx}adelay=${ms}:all=1[v${n}]`);
});
const mix = `${tl.voice.map((_, n) => `[v${n}]`).join('')}amix=inputs=${tl.voice.length}:normalize=0:dropout_transition=0,apad,atrim=0:${(tl.total / tl.fps).toFixed(3)}[out]`;
const script = path.join(studio, 'out/tin-nhan-chua-gui/voice-track.filter');
fs.mkdirSync(path.dirname(script), { recursive: true });
fs.writeFileSync(script, [...chains, mix].join(';\n'));
const out = path.join(studio, 'public/tin-nhan-chua-gui/voice/voice-track.mp3');
execFileSync('ffmpeg', ['-v', 'error', '-y', ...inputs, '-/filter_complex', script, '-map', '[out]', '-ac', '1', '-ar', '44100', '-b:a', '128k', out], { stdio: 'inherit' });
console.log(`wrote ${path.relative(studio, out)} (${tl.voice.length} pieces, ${(tl.total / tl.fps).toFixed(1)} s)`);
