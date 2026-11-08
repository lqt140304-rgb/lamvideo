// ElevenLabs voice for "Tin nhắn chưa gửi": one request per spoken piece, in the right role's voice.
// The narrator reads the prose; quoted speech goes to the speaker set in voices.json → `speakers`.
//   node src/episodes/tin-nhan-chua-gui/voice.cjs samples          short audition clips, 2 candidates per role
//   node src/episodes/tin-nhan-chua-gui/voice.cjs lines --dry      list pieces + characters, no request
//   node src/episodes/tin-nhan-chua-gui/voice.cjs lines            synthesize missing pieces (cached by text+voice)
// Key: ELEVENLABS_API_KEY in the environment (never printed or written). Credits are read from the account before
// and after each run and appended to out/tin-nhan-chua-gui/costs.json.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const here = __dirname;
const studio = path.resolve(here, '../../..');
const SRC = path.resolve(studio, '../episodes/hem-co-chuyen/tap-01-tin-nhan-chua-gui');
const cfg = JSON.parse(fs.readFileSync(path.join(here, 'voices.json'), 'utf8'));
const scriptHash = () => crypto.createHash('sha256').update(fs.readFileSync(path.join(SRC, 'KICH-BAN.md'), 'utf8').replace(/\r\n/g, '\n')).digest('hex');
const OUT = path.join(studio, 'out/tin-nhan-chua-gui');
const KEY = process.env.ELEVENLABS_API_KEY;
const mode = process.argv[2];
const dry = process.argv.includes('--dry');
const cachedOnly = process.argv.includes('--cached'); // reuse takes already on disk; no API call, no key needed

const api = async (p, body) => {
  if (!KEY) throw new Error('Set ELEVENLABS_API_KEY in the environment.');
  const r = await fetch('https://api.elevenlabs.io' + p, {
    method: body ? 'POST' : 'GET',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', Accept: body ? 'audio/mpeg' : 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(`${p}: HTTP ${r.status} ${(await r.text()).slice(0, 300)}`);
  return body ? Buffer.from(await r.arrayBuffer()) : r.json();
};
const used = async () => (await api('/v1/user/subscription')).character_count;
const tts = (voiceId, text, settings) => api(`/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, { text, model_id: cfg.model, voice_settings: settings ?? cfg.settings });
const seconds = (f) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim());
const logCost = (step, credits, note) => {
  const p = path.join(OUT, 'costs.json');
  const rows = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : [];
  rows.push({ date: new Date().toISOString(), step, model: cfg.model, credits, note });
  fs.writeFileSync(p, JSON.stringify(rows, null, 1));
  console.log(`credits this run: ${credits} · episode total: ${rows.reduce((n, r) => n + r.credits, 0)}`);
};

// Tags ([coldly]…) live only in ELEVENLABS.md; KICH-BAN.md is the source of words. Pair them line by line.
const tagFor = (() => {
  const tags = new Map();
  for (const l of fs.readFileSync(path.join(SRC, 'ELEVENLABS.md'), 'utf8').split(/\r?\n/)) {
    const m = l.match(/^((?:\[[^\]]+\]\s*)+)(.*)$/);
    if (m) tags.set(m[2].trim(), m[1].trim());
  }
  return (text) => tags.get(text.trim()) ?? '';
})();

/** Split one script line into narrator prose and quoted speech, in order. */
const pieces = (line) => {
  const out = [];
  const re = /“([^”]*)”/g;
  let last = 0;
  let m;
  while ((m = re.exec(line))) {
    const before = line.slice(last, m.index).trim();
    if (before) out.push({ kind: 'prose', text: before });
    out.push({ kind: 'quote', text: m[1].trim() });
    last = re.lastIndex;
  }
  const rest = line.slice(last).trim();
  if (rest) out.push({ kind: 'prose', text: rest });
  return out;
};

const scriptItems = () => {
  const items = {};
  let scene = null;
  for (const raw of fs.readFileSync(path.join(SRC, 'KICH-BAN.md'), 'utf8').split(/\r?\n/)) {
    const h = raw.match(/^## Cảnh (\d+)\./);
    if (h) { scene = Number(h[1]); items[scene] = []; continue; }
    if (/^## /.test(raw)) { scene = null; continue; }
    if (scene === null) continue;
    const q = raw.match(/^> (.+)/);
    const p = raw.match(/^\*\*\[(?:NGHỈ|KHÔNG LỜI) /);
    if (q) items[scene].push({ kind: 'line', text: q[1].trim() });
    else if (p) items[scene].push({ kind: 'pause' });
  }
  return items;
};

/** Every spoken piece with its role, keyed scene.item.piece; quotes need an explicit speaker in voices.json. */
const plan = () => {
  if (cfg.scriptSha256 !== scriptHash()) throw new Error('Source changed: update and verify voices.json speakers before planning voices.');
  const items = scriptItems();
  const list = [];
  for (const [s, its] of Object.entries(items)) its.forEach((it, i) => {
    if (it.kind !== 'line') return;
    const tag = tagFor(it.text);
    pieces(it.text).forEach((pc, k) => {
      const id = `${s}.${i}.${k}`;
      const role = pc.kind === 'prose' ? 'narrator' : cfg.speakers[id];
      if (!role) throw new Error(`No speaker for quote ${id}: “${pc.text}”`);
      // The emotion tag belongs to the quote it precedes (or the narrator line when there is no quote).
      const pcTag = tag && (pc.kind === 'quote' ? k === pieces(it.text).findIndex((x) => x.kind === 'quote') : !it.text.includes('“')) ? tag + ' ' : '';
      list.push({ id, s: Number(s), i, k, role, text: pc.text, say: (pcTag + pc.text).replace(/\s+/g, ' ').trim() });
    });
  });
  return list;
};

const main = async () => {
  fs.mkdirSync(OUT, { recursive: true });
  if (mode === 'samples') {
    const dir = path.join(OUT, 'voice-samples');
    fs.mkdirSync(dir, { recursive: true });
    const before = await used();
    for (const [role, c] of Object.entries(cfg.auditions)) for (const v of c.voices) {
      const f = path.join(dir, `${role}-${v.name.replace(/\s+/g, '-')}.mp3`);
      if (fs.existsSync(f)) continue;
      fs.writeFileSync(f, await tts(v.id, c.line));
      console.log(`${role} · ${v.name} · ${seconds(f).toFixed(1)} s`);
    }
    logCost('voice-samples', (await used()) - before, 'audition clips, 2 candidates per role');
    return;
  }
  if (mode === 'lines') {
    const list = plan();
    const chars = list.reduce((n, p) => n + p.say.length, 0);
    const byRole = {};
    for (const p of list) byRole[p.role] = (byRole[p.role] ?? 0) + p.say.length;
    console.log(`${list.length} pieces, ${chars} characters`, byRole);
    const dir = path.join(studio, 'public/tin-nhan-chua-gui/voice');
    fs.mkdirSync(dir, { recursive: true });
    const onDisk = fs.readdirSync(dir);
    const fileFor = (p) => {
      const v = cfg.cast[p.role];
      if (!v) throw new Error(`No voice chosen for role ${p.role}`);
      const hash = crypto.createHash('sha1').update(`${cfg.model}|${v.id}|${JSON.stringify(v.settings ?? cfg.settings)}|${p.say}`).digest('hex').slice(0, 10);
      // IDs move when lines are cut; the hash still includes model, voice, settings and tagged text.
      const cached = onDisk.find((name) => name.endsWith(`-${p.role}-${hash}.mp3`));
      return { file: cached ?? `${p.id}-${p.role}-${hash}.mp3`, cached: Boolean(cached) };
    };
    if (dry || cachedOnly) {
      const miss = list.filter((p) => !fileFor(p).cached);
      const missChars = miss.reduce((n, p) => n + p.say.length, 0);
      const byMiss = {};
      for (const p of miss) byMiss[p.role] = (byMiss[p.role] ?? 0) + p.say.length;
      console.log(`reusable takes: ${list.length - miss.length}/${list.length}; to synthesize: ${miss.length} pieces, ${missChars} characters`, byMiss);
      if (dry) { for (const p of list) console.log(p.id.padEnd(8), p.role.padEnd(9), fileFor(p).cached ? 'reuse' : 'NEW  ', p.say.slice(0, 80)); return; }
    }
    const before = cachedOnly ? 0 : await used();
    const manifest = [];
    const lineKey = (p) => `${p.s}.${p.i}`;
    // --cached keeps a line only when every piece of it has a take, so a half-voiced line is timed by estimate instead.
    const missingLines = new Set(cachedOnly ? list.filter((p) => !fileFor(p).cached).map(lineKey) : []);
    for (const p of list) {
      if (missingLines.has(lineKey(p))) continue;
      const v = cfg.cast[p.role];
      const { file, cached } = fileFor(p);
      const f = path.join(dir, file);
      if (!cached && !cachedOnly) {
        fs.writeFileSync(f, await tts(v.id, p.say, v.settings));
        process.stdout.write('.');
      }
      manifest.push({ ...p, file: `tin-nhan-chua-gui/voice/${file}`, sec: seconds(f) });
    }
    fs.writeFileSync(path.join(here, 'voice-manifest.json'), JSON.stringify({ scriptSha256: scriptHash(), scriptRevision: cfg.scriptRevision, model: cfg.model, cast: cfg.cast, pieces: manifest }, null, 1) + '\n');
    console.log(`\nwrote voice-manifest.json (${manifest.length} pieces, ${manifest.reduce((n, p) => n + p.sec, 0).toFixed(1)} s of speech)`);
    if (cachedOnly) console.log(`${missingLines.size} lines have no take yet and are timed by estimate; no credits used`);
    else logCost('voice-lines', (await used()) - before, `${list.length} pieces`);
    return;
  }
  if (mode === 'laugh') {
    // One long take in Lộc's voice; voice-track.cjs lays it over the exit. Not a script line, so it has its own file.
    const v = cfg.cast.loc;
    const say = '[sinister laugh] Hờ hờ hờ... hờ hờ... [laughs darkly] Hà hà hà hà... hà hà hà... hà hà hà hà hà... [slow evil laugh] hờ hờ hờ... hà hà hà...';
    const before = await used();
    const f = path.join(studio, 'public/tin-nhan-chua-gui/voice/loc-laugh.mp3');
    fs.writeFileSync(f, await tts(v.id, say, { ...cfg.settings, stability: 0.3, style: 0.6 }));
    console.log(`laugh: ${seconds(f).toFixed(1)} s`);
    logCost('voice-laugh', (await used()) - before, 'Lộc laugh over the exit');
    return;
  }
  console.log('usage: voice.cjs samples | lines [--dry | --cached] | laugh');
};
main().catch((e) => { console.error(e.message); process.exit(1); });
