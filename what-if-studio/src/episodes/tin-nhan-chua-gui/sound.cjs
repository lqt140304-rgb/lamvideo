// Sound for the whole film: ambience by place, physical sounds on the actions, music by scene, mixed under the voice.
//   node src/episodes/tin-nhan-chua-gui/sound.cjs   →  public/tin-nhan-chua-gui/sound/full-mix.mp3 (timeline.json plays it)
// Everything is placed from timeline.json, so it follows a retime. Sources: Mixkit files in public/tin-nhan-chua-gui/sfx
// (local only, see ASSET.md). A few sounds with no fitting recording (shutter, whiteout swell) are synthesized.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

const here = __dirname;
const studio = path.resolve(here, '../../..');
const tl = JSON.parse(fs.readFileSync(path.join(here, 'timeline.json'), 'utf8'));
const FPS = tl.fps;
const SFX = path.join(studio, 'public/tin-nhan-chua-gui/sfx');
const OUT = path.join(studio, 'out/tin-nhan-chua-gui/sound');
const PUB = path.join(studio, 'public/tin-nhan-chua-gui/sound');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PUB, { recursive: true });

const seg = (shot, n = 0) => {
  const s = tl.segments.filter((x) => x.shot === `Sh${shot}`)[n];
  if (!s) throw new Error(`no segment ${shot}#${n}`);
  return s;
};
const lastSeg = (shot) => tl.segments.filter((x) => x.shot === `Sh${shot}`).pop();
const M = (s, i) => {
  const m = tl.marks.find((x) => x.s === s && x.i === i);
  if (!m) throw new Error(`no mark ${s}.${i}`);
  return m;
};
const end = (m) => m.f + m.len;
const fx = (id) => path.join(SFX, `mixkit-${id}.wav`);
const song = (id) => path.join(SFX, `music-${id}.mp3`);

// ---------------------------------------------------------------- places
const shopIn = seg('C1_A').a;
const white = M(5, 15).f; // the G3 whiteout
const fieldIn = seg('C6_A').a;
const shopBack = seg('C8_A').a;
const exit = seg('C8_E');
const shutter = M(8, 6).f; // the children are out of frame
const homeIn = seg('C8_C').a;
const vaultIn = seg('C9_A').a;
const g2 = M(5, 7);
const FAN = 'lowpass=f=2600,highpass=f=70';
const THRU_DOOR = 'highpass=f=180,lowpass=f=1700';
const OUTSIDE = 'highpass=f=120,lowpass=f=5200';

// Beds: {src, a, b frames, ss, fx, mean dB, fin/fout s}. Looped when the source is short.
const beds = [
  // alley at night from frame 0, then through the door inside the shop, ducked for the subjective G2 warmth
  { src: fx(2678), a: 0, b: shopIn + 12, ss: 8, fx: OUTSIDE, mean: -39, fin: 0.05, fout: 1 },
  { src: fx(2658), a: 0, b: shopIn + 12, ss: 8, fx: 'lowpass=f=1400', mean: -49, fin: 0.05, fout: 1 },
  { src: fx(2678), a: shopIn, b: g2.f, ss: 40, fx: THRU_DOOR, mean: -52, fin: 1, fout: 0.8 },
  { src: fx(2678), a: end(g2) - 6, b: white, ss: 70, fx: THRU_DOOR, mean: -50, fin: 1, fout: 0.3 },
  // the fan: only near the door at first, then the room, thin during the warmth, gone at the white
  { src: fx(1833), a: seg('C0_E').a, b: shopIn, ss: 0.3, fx: `${FAN},lowpass=f=1500`, mean: -54, fin: 2.5, fout: 0.2 },
  { src: fx(1833), a: shopIn, b: g2.f, ss: 4, fx: FAN, mean: -42, fin: 0.3, fout: 0.8 },
  { src: fx(1833), a: g2.f, b: end(g2), ss: 2, fx: FAN, mean: -52, fin: 0.8, fout: 0.8 },
  { src: fx(1833), a: end(g2), b: white + 8, ss: 9, fx: FAN, mean: -42, fin: 0.8, fout: 0.3 },
  // the field: open air, the same wind when she goes
  { src: fx(2658), a: fieldIn, b: shopBack, ss: 2, fx: 'highpass=f=90', mean: -37, fin: 1.4, fout: 1.2 },
  { src: fx(2427), a: fieldIn + 30, b: shopBack, ss: 0, fx: 'highpass=f=300', mean: -46, fin: 2, fout: 1.2 },
  // back in the shop, then the alley; the fan stops with the shutter
  { src: fx(1833), a: shopBack, b: exit.a + 6, ss: 3, fx: FAN, mean: -42, fin: 0.4, fout: 0.3 },
  { src: fx(1833), a: exit.a, b: shutter + 42, ss: 6, fx: `${FAN},lowpass=f=1300`, mean: -50, fin: 0.2, fout: 1 },
  { src: fx(2678), a: shopBack, b: exit.a + 6, ss: 90, fx: THRU_DOOR, mean: -51, fin: 0.6, fout: 0.3 },
  { src: fx(2678), a: exit.a, b: vaultIn + 90, ss: 12, fx: OUTSIDE, mean: -39, fin: 0.2, fout: 0.5 },
  { src: fx(2658), a: exit.a, b: vaultIn + 90, ss: 30, fx: 'lowpass=f=1400', mean: -48, fin: 0.3, fout: 0.5 },
  // Lộc's own place
  { src: fx(1833), a: vaultIn + 96, b: vaultIn + 372, ss: 3, fx: FAN, mean: -46, fin: 0.5, fout: 1.2 },
  { src: fx(3199), a: vaultIn + 360, b: tl.total, ss: 0, fx: 'lowpass=f=4000', mean: -36, fin: 1.6, fout: 1.2 },
  { src: fx(2822), a: seg('C9_D').a, b: tl.total - 18, ss: 0.2, fx: 'areverse', mean: -46, fin: 0.6, fout: 1 }, // the escapement running backward
];

// Music: chosen per scene; faded, never looped to fill time.
const music = [
  { src: song(168), a: 0, b: seg('C0_E').a + 75, ss: 2, mean: -31, fin: 1.2, fout: 3 },
  { src: song(710), a: seg('C6_B').a - 15, b: M(7, 0).f + 20, ss: 4, mean: -28, fin: 2.2, fout: 2.5 },
  { src: song(614), a: M(7, 0).f, b: end(M(7, 10)), ss: 6, mean: -29, fin: 3, fout: 3.2 },
  { src: song(711), a: M(8, 10).f - 45, b: lastSeg('C8_D').b - 3, ss: 5, mean: -29, fin: 1.8, fout: 1.6 },
  { src: song(612), a: vaultIn + 372, b: tl.total, ss: 10, mean: -31, fin: 2, fout: 2.4 },
];

// ---------------------------------------------------------------- physical sounds on the action
const events = [];
const hit = (at, id, peak, f = '', ss, t) => events.push({ src: fx(id), at: Math.round(at), peak, fx: f, ss, t });

// C0: the distant road; Duy's breath at the door; steps over the threshold
hit(180, 717, -36, 'lowpass=f=1800,aecho=0.6:0.5:140:0.35');
hit(430, 2732, -34, 'lowpass=f=1000,afade=t=in:d=1.2', 0.4);
hit(seg('C0_E').a + 60, 2232, -36, 'lowpass=f=2800', 0.4, 1.4);
hit(seg('C0_F').a + 24, 543, -33, 'lowpass=f=2400', 0.3, 2);

// C1: the clock back on the shelf; phone and money on the cloth; the performance beats
hit(seg('C1_A').a + 22, 2182, -26, 'highpass=f=200');
hit(seg('C1_C').a + 30, 1530, -30, 'lowpass=f=3000');
hit(M(1, 4).f + 18, 2380, -29, 'highpass=f=500');
const ask = M(1, 10), scold = M(1, 12), mock = M(1, 13);
[0, 68, 140].forEach((d) => hit(ask.f + d - 18, 1064, -30, 'highpass=f=400'));
hit(ask.f - 6, 2380, -31, 'highpass=f=500'); // she takes the bills out
hit(scold.f - 34, 2182, -19, 'highpass=f=150'); // the screwdriver laid flat in the silence
hit(scold.f + 8, 2237, -30, 'highpass=f=300', 0.2, 0.5); // her caught breath
hit(scold.f + 12, 1898, -27, 'highpass=f=300');
hit(mock.f + 92, 1898, -28, 'highpass=f=300', 0.1);
hit(mock.f + 132, 2380, -28, 'highpass=f=500');
hit(end(mock) + 16, 1131, -30, 'highpass=f=600', 0.08, 0.5);
[52, 70, 88, 106].forEach((d) => hit(end(mock) + d, 543, -38, 'lowpass=f=1500', 0.3, 0.32));
hit(end(mock) + 128, 1016, -30, 'lowpass=f=3500');

// C2–C4: money handed back, the stools, the photo, pen, phone
const c2 = seg('C2_A').a;
hit(c2 + 80, 2380, -29, 'highpass=f=500');
[126, 142, 158, 174].forEach((d) => hit(c2 + d, 543, -38, 'lowpass=f=1800', 0.3, 0.3));
hit(c2 + 190, 1016, -28, 'lowpass=f=4000');
hit(c2 + 200, 1016, -31, 'lowpass=f=4000,asetrate=50000,aresample=44100');
hit(seg('C2_C').a + 10, 1530, -29, 'lowpass=f=3200');
hit(seg('C2_C').a + 125, 1131, -33, 'highpass=f=700', 0.08, 0.4);
hit(M(2, 9).f + 4, 1898, -32, 'highpass=f=400', 0.1); // she tugs his shirt
hit(seg('C3_B').a + 9, 1016, -29, 'lowpass=f=3500');
hit(M(3, 3).f + 62, 1898, -31, 'highpass=f=400', 0.1);
hit(seg('C3_C').a + 6, 2369, -31, 'highpass=f=700', 0.2, 2.9);
hit(M(3, 14).f - 42, 2368, -30, 'highpass=f=700', 0.1, 1.3);
hit(seg('C4_A').a + 170, 2182, -31, 'lowpass=f=2600'); // the phone set back on the cloth, softer
hit(M(4, 5).f - 16, 1131, -34, 'highpass=f=900', 0.08, 0.3);

// C5: his body takes the weight; the white comes once
hit(M(5, 8).f + 8, 1016, -26, 'lowpass=f=3500');
hit(M(5, 8).f + 2, 379, -30, '', 0.2, 1.9);
hit(M(5, 14).f + 4, 1898, -28, 'highpass=f=300'); // Duy lunges to stop her

// C6–C7: run on the path, walking, sitting, cloth in the embrace
const go = M(6, 2).f;
[0, 13, 26, 39, 52, 65].forEach((d) => hit(go + d, 1921, -32, 'highpass=f=250', 0.1, 0.3));
[50, 72, 94, 116].forEach((d) => hit(go + d, 1921, -32, 'lowpass=f=3200', 0.1, 0.34));
[0, 19, 38, 57, 76, 95, 114, 133].forEach((d) => hit(M(6, 3).f + d, 1921, -36, 'highpass=f=250', 0.1, 0.3));
hit(M(6, 4).f + 22, 1898, -30, 'highpass=f=300');
hit(M(7, 3).f + 6, 1898, -33, 'highpass=f=400', 0.1);
hit(end(M(7, 11)) - 150, 1898, -35, 'highpass=f=500', 0.1); // his sleeve as he reaches for her

// C8: papers away; out of the shop; the shutter; the father's bottle behind the wall; last steps
hit(seg('C8_B', 0).a + 110, 2380, -29, 'highpass=f=500');
hit(seg('C8_B', 1).a + 10, 2380, -29, 'highpass=f=500', 0, 0.8);
for (let d = 0; d < 112; d += 16) hit(exit.a + d, 543, -34, 'lowpass=f=2600', 0.3, 0.3);
hit(shutter + 40, 833, -33, 'lowpass=f=1500');
hit(homeIn + 30, 525, -30, 'lowpass=f=1200', 0, 1.8); // bottles behind the partition
for (let d = 0, n = Math.floor((M(8, 10).f + 42 - lastSeg('C8_D').a) / 24); d < n; d++) hit(lastSeg('C8_D').a + 8 + d * 24, 543, -39, 'lowpass=f=2000', 0.3, 0.3);

// C9: the change, one mechanical stage at a time; jars touching their ledge
const v = vaultIn;
hit(v + 236, 2822, -27, '', 0.1, 3.6);
[272, 314, 356].forEach((d) => hit(v + d, 2858, -24));
hit(v + 372, 1177, -30, 'afade=t=in:d=0.5', 0, 3.2);
[0, 1, 2].forEach((i) => {
  hit(seg('C9_C').a + i * 80 + 22, 1049, -36, 'highpass=f=500', 0.1, 0.6);
  hit(seg('C9_C').a + i * 80 + 70, 2936, -24, 'highpass=f=700', 0, 0.9);
});
hit(seg('C9_D').a + 4, 1049, -35, 'areverse', 0, 1.4);

// ---------------------------------------------------------------- render the layers
const sec = (f) => (f / FPS).toFixed(3);
const levels = (f) => {
  const r = spawnSync('ffmpeg', ['-v', 'info', '-i', f, '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' });
  const g = (k) => Number((r.stderr.match(new RegExp(`${k}_volume: (-?[0-9.]+) dB`)) || [])[1]);
  return { mean: g('mean'), peak: g('max') };
};
const FMT = 'aformat=sample_rates=44100:channel_layouts=mono';
const layers = [];

const span = (l, i, tag) => {
  const len = Math.max(0.1, (l.b - l.a) / FPS);
  const raw = path.join(OUT, `${tag}${i}-raw.wav`);
  const filt = [l.fx, FMT].filter(Boolean).join(',');
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-stream_loop', '-1', '-ss', String(l.ss ?? 0), '-t', String(len), '-i', l.src, '-af', filt, raw]);
  const gain = l.mean - levels(raw).mean;
  const wav = path.join(OUT, `${tag}${i}.wav`);
  const fout = Math.min(l.fout, len / 2);
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', raw, '-af', `volume=${gain.toFixed(2)}dB,afade=t=in:d=${Math.min(l.fin, len / 2)},afade=t=out:st=${(len - fout).toFixed(3)}:d=${fout}`, wav]);
  layers.push({ wav, at: l.a });
};
beds.forEach((l, i) => span(l, i, 'bed'));
music.forEach((l, i) => span(l, i, 'mus'));
events.forEach((e, i) => {
  const raw = path.join(OUT, `ev${i}-raw.wav`);
  const filt = [e.fx, FMT].filter(Boolean).join(',');
  execFileSync('ffmpeg', ['-y', '-v', 'error', ...(e.ss ? ['-ss', String(e.ss)] : []), ...(e.t ? ['-t', String(e.t)] : []), '-i', e.src, '-af', filt, raw]);
  const gain = e.peak - levels(raw).peak;
  const wav = path.join(OUT, `ev${i}.wav`);
  const tail = e.t ? `,afade=t=out:st=${Math.max(0, e.t - 0.06).toFixed(3)}:d=0.06` : '';
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', raw, '-af', `volume=${gain.toFixed(2)}dB${tail}`, wav]);
  layers.push({ wav, at: e.at });
});

// The G3 swell and the shutter have no fitting recording.
const synth = (name, graph, at) => {
  const wav = path.join(OUT, `${name}.wav`);
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-filter_complex', `${graph},${FMT}`, wav]);
  layers.push({ wav, at });
};
synth('white', 'anoisesrc=c=brown:a=0.7:d=2.2,lowpass=f=420,afade=t=in:d=0.6,afade=t=out:st=1.1:d=1.1,volume=0.5[n];sine=f=62:d=2.2,afade=t=in:d=0.6,afade=t=out:st=1.1:d=1.1,volume=0.16[s];[n][s]amix=inputs=2', white);
synth('shutter', 'anoisesrc=c=white:a=0.6:d=1.25,bandpass=f=1300:w=1100,tremolo=f=26:d=0.85,afade=t=in:d=0.08,afade=t=out:st=1.05:d=0.2,volume=0.13', shutter + 4);

// ---------------------------------------------------------------- mix: everything under the voice
const list = path.join(OUT, 'bed.txt');
const inputs = [];
const chains = [];
layers.forEach((l, i) => {
  inputs.push('-i', l.wav);
  chains.push(`[${i}:a]adelay=${Math.round((l.at / FPS) * 1000)}:all=1[l${i}]`);
});
chains.push(`${layers.map((_, i) => `[l${i}]`).join('')}amix=inputs=${layers.length}:normalize=0:dropout_transition=0,apad,atrim=0:${sec(tl.total)}[bed]`);
fs.writeFileSync(list, chains.join(';\n'));
const bed = path.join(OUT, 'bed.wav');
execFileSync('ffmpeg', ['-y', '-v', 'error', ...inputs, '-/filter_complex', list, '-map', '[bed]', '-ac', '1', bed]);

const voice = path.join(studio, 'public/tin-nhan-chua-gui/voice/voice-track.mp3');
const out = path.join(PUB, 'full-mix.mp3');
const pre = path.join(OUT, 'pre-master.wav');
// The bed dips while someone speaks, then comes back: the words stay clear without the room going dead.
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', bed, '-i', voice, '-filter_complex',
  `[1:a]aresample=44100,aformat=channel_layouts=mono,asplit=2[v][key];[0:a]aformat=channel_layouts=mono[b];[b][key]sidechaincompress=threshold=0.04:ratio=3:attack=40:release=420:makeup=1[d];[v][d]amix=inputs=2:normalize=0:dropout_transition=0,atrim=0:${sec(tl.total)}[o]`,
  '-map', '[o]', pre]);
// One fixed gain to -16 LUFS. loudnorm's dynamic mode lifted the wordless passages above the dialogue.
const scan = spawnSync('ffmpeg', ['-v', 'info', '-i', pre, '-af', 'ebur128=framelog=quiet', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
const measured = Number([...scan.matchAll(/I:\s+(-?[0-9.]+) LUFS/g)].pop()[1]);
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', pre, '-af', `volume=${(-16 - measured).toFixed(2)}dB,alimiter=limit=0.84:level=false`, '-ac', '2', '-ar', '44100', '-b:a', '192k', out]);
console.log(`wrote ${path.relative(studio, out)}: ${beds.length} beds, ${music.length} music cues, ${events.length} sounds`);
