# Sound for lamvideo

Voice clarity, scene continuity and emotional rhythm come first. Silence, a room tone or a single physical detail
can do more than an effect on every action. Do not fill every gap or announce each twist with a boom.

## Voice and pauses

ElevenLabs is preferred for new episodes. Record the chosen voice, model, source text version and take in the
episode folder. Audio tags are performance hints only on supporting models; they do not switch speakers or
guarantee a precise pause. Listen before generating a full episode.

The inherited ElevenLabs backend joins all script beats into one single-voice request and caches that entire
request. It is not a per-scene, multi-speaker pipeline. Both inherited voice paths can tighten pauses using
`gaps`; defaults designed for short clips will remove long rests. Preserve the original take and place intentional
silence in the actual edit. Imported recordings are also subject to the common backend's processing if passed
through it. See the project workflow before using these scripts for a narrative episode.

## Library and generation

Also consult `docs/ASSET.md` and `what-if-studio/library/sfx-packs/` for imported shared packs. Pack catalogues are tracked, source media stays local; unresolved rights or unreviewed sound is not automatically approved by importing. The inherited selector scans the flat `library/sfx/` directory, so packs remain separate until deliberately chosen.

Check `what-if-studio/library/sfx/` before creating anything. Verify suitability and rights, then reference the
selected file in the episode's asset record. Do not assume that an automatically selected nearest clip fits.

Prefer suitable free music, Foley and ambience before paid generation. Free to download does not automatically
mean cleared for a monetized video. Check each track/file's actual licence, attribution requirements and any
usage restrictions; save the original page, creator, licence reference and date checked in the episode asset
record. An unresolved source is not approved for release. Do not infer media rights from the code's MIT licence.

From the studio, with a configured episode:

```powershell
python ../.claude/skills/what-if-animation/scripts/sfx.py <slug-tap> --dry
python ../.claude/skills/what-if-animation/scripts/sfx.py <slug-tap> --free
```

`--dry` previews planned clips without generating. `--free` uses library files and does not create new paid clips;
it can still report missing/unusable material. Without `--free`, an available key can enable paid generation.
Only generate new material when the requested production scope includes it. Cache and reuse appropriate clips.

## Event syntax in the existing engine

Events are arrays inside `sound.events`: cue, clip key, gain, optional alignment and end cue. Example:

```json
{"events": [["S2+6", "glass_tink", 0.5], ["S3+2", "whoosh", 0.4, "peak"], ["S1", "room_tone", 0.12, "onset", "S6"]]}
```

Use `onset` for an impact starting at a visible contact, `peak` when a whoosh's loudest moment matches a move.
Keep visible impacts in sync with contact. If a hit masks a key word, adjust the mix or the edit/line timing
together; do not simply slide a synchronous hit away from the action. Maintain room ambience across continuous
action and change it with location. Describe a new sound by physical source, material, duration and desired
character; avoid unrelated voices in ambience.

## Music follows the emotional arc

Map music to what changes in the scene: ordinary life, unease, pressure, confrontation, loss or relief, as
appropriate to the story. Record where a cue starts, grows, gives way and ends. A single cue can develop across
several beats; do not switch songs at every emotional label or make every twist a loud sting.

Music must be perceptible when it carries the emotion, and restrained enough for speech and important physical
details. Use local fades, volume automation or frequency shaping where needed instead of one fixed gain for the
whole film. Leave room for silence and ambience. A pause in speech does not automatically require louder music.
Do not use a universal music-to-voice percentage or dB offset as proof of a good balance.

## Physical sounds must have material, force and contact

Distinguish a light ceramic placement from a ceramic break, wood from metal, and paper tearing from fabric
ripping. Describe source, action, material, force, duration, listening distance and story function before
choosing a clip. Use the visible action to place the onset and the continuation: first contact, scrape, tear,
release, fragments or decay where appropriate. A longer tear needs a sustained texture, not just a single hit.

Important gestures should read clearly: grip, cloth movement, footsteps, a latch, a scrape, a rip or an object
being set down. Check that the sound remains audible in the complete mix, not only when its track is soloed.
Choose a better clip or reduce competing music/ambience before blindly raising gain. Layer only complementary
elements when needed; preserve a believable main source and avoid turning every small touch into an explosion.

## Environment has scale and a role

Build a continuous base for the location, then add distinct environmental events. Match near/far, inside/outside,
barriers, room reflections and changes of listening position. Wind, rain or machinery should not have identical
prominence in a sheltered room and beside the source unless a subjective point of view is explicitly intended.

A storm, a nearby crash, a slammed door or a passing vehicle can legitimately dominate a moment. Preserve that
weight and its effect on the characters; do not automatically reduce every environmental sound to a faint bed
under narration. Plan space in the dialogue/edit, have characters pause or react when appropriate, and return
to the previous balance smoothly. Do not make every environment constantly loud either: contrast gives the
large event its force. Loudness is not clipping or a requirement to reproduce dangerous real-world levels.

For each important cue, record: source/action, material/force, perspective, start/end or sync point, emotional
role, foreground/background role, and any needed level change. Use the animatic for major sound beats with
temporary library clips; detailed Foley and the final mix follow approved timing.

## Mixing and checking

The scripts level stems relative to voice through `sfx_lu` and `music_lu`. Lower an event to change balance inside
the effects stem; lower `sfx_lu` to give voice more room overall. Do not treat defaults or an upstream example's
levels as an approved mix for a new scene.

Run `mixcheck.py` on configured material, then listen to the flagged moments and the complete sequence.
`master.py` targets -14 LUFS and peaks below -1 dBTP; report actual output measurements after running it.
Tool output alone cannot confirm that acting, pauses, pronunciation or the emotional ending work.

Listen to the full mix on headphones and an ordinary speaker/phone at a steady, comfortable playback level.
Check speech clarity, perceptible music, material detail, environmental scale, synchronisation, loop/cut joins
and abrupt level changes. Keep dynamic contrast while controlling peaks; turning every sound up or normalising
every clip to the same loudness destroys the intended hierarchy. After stem normalisation or mastering, listen
again to the affected cues in the exported mix. Do not claim these checks passed without actually listening.

## Costs

Keep actual generation costs and retries in the episode's own notes, not the shared experience file. Distinguish
text length, service credits, assistant tokens and render time. Account counters may lag and historical rates
are not current quotes. If attribution to a specific call cannot be established, say that the cost is unconfirmed;
do not report zero merely because a history item has not appeared. Never log keys or account secrets.
