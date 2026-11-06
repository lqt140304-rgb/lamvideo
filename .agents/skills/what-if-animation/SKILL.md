---
name: what-if-animation
description: Make a "What If" animated episode from one topic line ("What if you could rewind 10 seconds?"), in the dusk-lit stick-figure style of the What If channels that broke out on YouTube in October 2026. Writes the script on the seven-beat What If formula, voices it with ElevenLabs, lays out a shot list at the genre's pace, renders a storyboard of stills and self-checks it before animating, animates every frame in code (Remotion and SVG, with an original cast on one rig, rooms in perspective and light from lamps and windows), generates and syncs the sound, and masters a finished 15-25 s episode to -14 LUFS. Use when someone asks for a What If episode, animation or cartoon, "make a what if video about X", a stick-figure explainer in this style, or to run the free What If skill.
---

# What If animation

> **Cập nhật 05/11/2026: kênh dùng ElevenLabs gói Creator làm mặc định** (giọng đọc có mốc từng chữ, tiếng động tạo mới),
> khung ngang 16:9, tập có thể dài hơn 25 giây (nới mục tiêu độ dài theo kịch bản). Khóa `ELEVENLABS_API_KEY` để trong
> file `.env` ở gốc repo (đã nằm trong .gitignore), không dán vào chat. Chọn giọng bằng `"voice": {"id": "<voice_id>"}`
> trong `episode.json`; nghe thử giọng tiếng Việt trước khi chốt.
> Phần dưới mô tả chế độ miễn phí cũ, vẫn dùng được bằng `"voice": {"engine": "vieneu"}`.
>
> **Chế độ miễn phí, tiếng Việt (bản sửa cho kênh lamvideo).** Không cần ElevenLabs:
> giọng đọc = **VieNeu-TTS** (miễn phí, chạy offline trên máy; hoặc `edge` = giọng Microsoft Edge miễn phí, cần mạng,
> hoặc `file` = tự thu âm), mốc thời gian từng chữ = từng câu tạo riêng + **faster-whisper** đọc lại audio,
> tiếng động = thư viện `library/sfx/` có sẵn (không tạo mới). Chữ trên hình dùng font có dấu tiếng Việt
> (`lang: 'vi'` trong `src/studio.config.ts`). ElevenLabs vẫn dùng được: `"voice": {"engine": "elevenlabs"}`.
> Chỗ nào bên dưới nói "credits" thì ở chế độ miễn phí là 0.
>
> **Trong repo lamvideo:** studio đã có sẵn ở `what-if-studio/` (không cần copy); `<skill>` là
> `.Codex/skills/what-if-animation`. Cài một lần bằng `tools\what-if-setup.bat`. Mọi lệnh bên dưới chạy trong
> `what-if-studio/`, ví dụ `python ../.Codex/skills/what-if-animation/scripts/voice.py <slug>`. Quy trình và phân
> công (ChatGPT viết kịch bản bằng Prompt W, Codex dựng) ở `docs/WHAT-IF-QUY-TRINH.md`. Bản mẫu gốc của
> studio (để cập nhật engine) ở https://github.com/kelano86/what-if-animation.

One topic line in, a finished 15-25 second episode out. Every frame is SVG that Codex writes (rendered by
Remotion); the voice and the sound come from ElevenLabs. Two examples ship in `studio/src/episodes/`, both ready to
render: `rewind` ("What if you could rewind 10 seconds?", the proof clip: shots played backwards as the power) and
`copy-paste` ("What if you could copy and paste anything?", the skill's first full run: a new kitchen set, a
schematic for the science beat, a cliffhanger blackout). Read the one closest to your topic before you start.

| File | What's in it |
|---|---|
| `references/formula.md` | The seven-beat What If formula, the 15-25 s shape, script rules, choosing a topic |
| `references/look.md` | The measured look, pace, shot vocabulary, and the storyboard and motion checklists |
| `references/kit.md` | The building blocks: engine, cast, sets, room kit, light, UI, looks, and how to add each |
| `references/sound.md` | Writing sound events, prompts, levels, costs |
| `references/traps.md` | Everything that cost time on the two example episodes |
| `what-if-studio/` (repo root) | The Remotion project: every episode lives in it |
| `scripts/` | voice, plan, stills, board, sfx, mixcheck, motiongrid, master (Python 3.9+ and Node) |

## Rules

- **Original characters only.** Pip (the hero, look B) and Mo (his friend) are ours, and so are the sister, mum and
  the suit on the rig. Never a channel's own hero, and nothing that resembles a famous cartoon character: check every
  new look on the cast sheet (Mo's first hat was dropped for drifting toward one).
- **Original stories.** The formula is shared; the episode isn't anyone else's. Don't remake a channel's title.
- **Never claim the viral channels are made with Codex** or any other tool. Nobody has said how they're made.
- **Keys by name only.** `ELEVENLABS_API_KEY`, from the environment or a `.env`
  above the studio. Never print, paste or hardcode a key.
- **Report the ElevenLabs credits** of every run (0 in free mode; say which voice engine you used): the scripts log them to `out/<slug>/costs.json` and `master.py`
  totals them in `report.json`. The voice's cost is read from the account's history (exact); sound clips don't show
  there, so their cost comes from the account counter, which can lag: re-read it before you report. Say the number
  when you hand the episode over. The copy-paste run cost 152 credits (78 for the voice, 74 for 12 new clips).
- **Storyboard before animation.** No video render until the stills pass the self-check (step 5) and, when the person
  is in the loop, they've seen the board.
- **Write down what you learn.** Read `docs/WHAT-IF-KINH-NGHIEM.md` (Vietnamese lessons log) before starting, and
  add to it every time you build or fix an episode: errors met, fixes, shortcuts, newest first. Do it before you
  report the work as done.
- **Every fact is real.** A number in the script is worked out and sourced in the episode's `science` field first.

## Setup (once per machine)

Needs Node 18+, ffmpeg and ffprobe on the PATH, Python 3.9+ with `numpy` and `Pillow`. Free voice: `vieneu`
(and `faster-whisper` for exact word timings). An ElevenLabs key is optional.

```bash
cp -r <skill>/studio ./what-if-studio && cd what-if-studio && npm install
pip install numpy Pillow vieneu faster-whisper edge-tts
```

On Windows, `setup-windows.bat` in the skill folder does all of this. List the VieNeu voices with
`python <skill>/scripts/voice.py --voices` and pick one in `episode.json` → `"voice": {"voice": "<name>"}`.

Everything below runs from that studio folder; `<skill>` is this skill's folder. To work offline or in your own
brand face, put a display font in `public/fonts/` and set `titleFont` in `src/studio.config.ts` (the default title
face, Bricolage Grotesque, and the UI faces load from Google Fonts at render time). To update an existing studio to
a newer engine, copy `<skill>/studio/src/engine` over its `src/engine`.

## The pipeline

Work through the steps in order. Each ends on something you look at before the next.

### 1. Script

Read `references/formula.md`. Search YouTube for the premise first: if a What If channel already has that exact
episode, change the power or the rule. From the topic line, decide the power's word, its rule, three escalating
demos and the turn (one real fact with a number). Write `src/episodes/<slug>/episode.json` with `id` (PascalCase,
the composition name), `slug`, `topic`, `title` (two lines), `script` (one entry per beat) and `science` (each fact:
the claim, the working, the source). 45 to 65 words. Read it aloud at pace: every line must be a picture.

### 2. Voice

```bash
python <skill>/scripts/voice.py <slug>
```

Free by default: VieNeu reads each sentence (cached in `public/<slug>/takes/`), the takes are joined, faster-whisper
re-times every word from the audio (without it, words are spread by syllable inside each sentence), then the pauses
are cut to the genre's pace. `"voice": {"speed": 1.1}` speeds a slow read up. (`"engine": "elevenlabs"` runs the
original paid take instead.) Output: `public/<slug>/voice.wav` and `src/episodes/<slug>/words.json`. Check the length (15-25 s)
and the word times it prints. Retune pauses with `gaps` in `episode.json` and re-run: the takes are cached. Change a word and only that sentence
is read again. Listen to `voice.wav` once: if a word lands wrong, check it in `words.json` before cueing cuts on it.

### 3. Shot list

Design one shot per picture in the script (usually 9 to 14), varying the size and angle every cut (wide, insert,
medium, close-up, over the shoulder, high, low; see `references/look.md`). Add to `episode.json`:

- `shots`: `{ "id": "S1", "size": "medium", "set": "kitchen", "key": 14, "note": "what we see" }` (`key` is the
  frame of the shot's own clock the storyboard shows)
- `edit`: `{ "shot": "S1", "at": "cookie" }` per cut, cued on the word it lands on (`plan.py` lists the cue forms;
  `reverse`, `from`, `to` and `look` for powers that bend a shot's clock)
- `fx`: one-frame flashes and shakes, `{ "at": "S3+2", "kind": "flash" }`

```bash
python <skill>/scripts/plan.py <slug>
```

It writes `timeline.json` and `out/<slug>/shotlist.md` and prints the pace. Aim for 27+ cuts a minute in the
opening and no static shot over about 3 s; fix what it flags before drawing anything.

### 4. Storyboard

Read `references/kit.md` for the building blocks. Write `src/episodes/<slug>/shots.tsx`, one component per shot,
each a pure function of its clock `t` (copy the patterns in the two examples' `shots.tsx`), and `index.tsx` (the
episode and its power look), then add the episode to `src/episodes/index.ts`. At this step each shot only needs to
be right at its `key` frame. When a topic needs a place the library lacks, build it with the room kit and add it to
`src/engine/sets/` (and to the skill's copy) so the next episode has it, as the copy-paste run did with the kitchen
and the schematic. A new character or costume: add the look, then check it on the cast sheet
(`npx remotion still src/index.ts Cast out/cast.png`).

```bash
npx tsc --noEmit
node <skill>/scripts/stills.mjs <slug>
python <skill>/scripts/board.py <slug>
```

`out/<slug>/storyboard.jpg`: one captioned still per shot.

### 5. Self-check the stills

Look at the storyboard, then open every still in `out/<slug>/board/` at full size, and run the storyboard checklist
in `references/look.md` honestly, shot by shot. Write down what fails, fix it, re-render just those shots
(`stills.mjs <slug> S3 S7`), rebuild the sheet and look again. Repeat until it passes. Check `references/traps.md`
for the failure you're seeing before inventing a fix. If the person is in the loop, show them the board now and
take their notes before animating.

### 6. Animate

Bring each shot to life from its key pose: `poseAt` keys with anticipation, holds and overshoot, `faceAt` for
expressions, camera moves with `kf`, the power's look, the `fx`. Then render a draft and check the motion:

```bash
python <skill>/scripts/master.py <slug>
python <skill>/scripts/motiongrid.py <slug> S2 S5
node <skill>/scripts/stills.mjs <slug> --frames 120 240
```

Read the grids like a flipbook against the motion checklist in `references/look.md`; fix and re-render until it
reads.

### 7. Sound

Read `references/sound.md`. **Free mode** (no key, or `--free`): no clip is generated; write each clip's prompt as
`"lib:<name>"` to pick one from `library/sfx/` (`ls library/sfx` for the names: whoosh, pop, step, title_boom,
room_tone, music, ...), or let `sfx.py` pick the closest match and check what it printed. Extra free clips (CC0 from
freesound.org or pixabay) go in `library/sfx/<name>-local.mp3`. Add `sound` to `episode.json`: the clips (prompt and length), one event per visible
action cued to its shot, ambiences per location, the music bed and the levels. Check what the library already has,
then generate:

```bash
python <skill>/scripts/sfx.py <slug> --dry
python <skill>/scripts/sfx.py <slug>
```

It prints the credits it used and sets the stem volumes in `timeline.json`. Then check that every word stays clear:

```bash
python <skill>/scripts/mixcheck.py <slug>
```

It lists the moments, while a word is being spoken, where effects or music come within 3 dB of the voice. A hit that
illustrates a word lands in the pause just after it, never on it; a bed (a hum, a drone) under a key line comes down;
if most of the stem crowds the voice, lower `sfx_lu`. Re-run sfx.py and the check until only deliberate overlaps
remain (a title boom, a turn).

### 8. Master and hand over

```bash
python <skill>/scripts/master.py <slug>
```

Renders, brings the mix to -14 LUFS with peaks under -1 dBTP, and writes `out/<slug>/report.json` (length, loudness,
pace, credits). Watch the final file once through with sound, then review it frame by frame:

```bash
python <skill>/scripts/review.py <slug>
```

It writes `out/<slug>/review/review01.jpg ...` (start, middle and end frame of every segment, with the words spoken
over it) and prints the words per segment. Read every page: the board stills only show key frames, and the first full
film of a long episode had 17 faults they hid (early cuts, eyes open in a sleep shot, a phone floating by a head).
Fix, re-render, review again. Hand over `out/<slug>/<slug>-final.mp4` and `out/<slug>/storyboard.jpg`, with the
length, the ElevenLabs credits used, and anything you'd still improve; write the episode's state in
`src/episodes/<slug>/README.md` and the lessons in `docs/WHAT-IF-KINH-NGHIEM.md`, then commit and push.

## Where an episode lives

| Path | What |
|---|---|
| `src/episodes/<slug>/episode.json` | Everything you write: script, science, shots, edit, fx, sound |
| `src/episodes/<slug>/shots.tsx`, `index.tsx` | The drawing: one component per shot, the power's look |
| `src/episodes/<slug>/words.json`, `timeline.json` | Written by voice.py and plan.py (sfx.py adds the volumes) |
| `public/<slug>/` | voice.wav, sfx.wav, music.wav |
| `out/<slug>/` | board stills, storyboard.jpg, shotlist.md, motion grids, renders, costs.json, report.json |
| `library/sfx/` | Every generated sound clip, shared by all episodes |
