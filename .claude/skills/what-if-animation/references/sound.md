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

Check `what-if-studio/library/sfx/` before creating anything. Verify suitability and rights, then reference the
selected file in the episode's asset record. Do not assume that an automatically selected nearest clip fits.

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
Do not mask a key word: move a hit into an adjacent gap or lower it. Maintain room ambience across continuous
action and change it with location. Describe a new sound by physical source, material, duration and desired
character; avoid unrelated voices in ambience.

## Mixing and checking

The scripts level stems relative to voice through `sfx_lu` and `music_lu`. Lower an event to change balance inside
the effects stem; lower `sfx_lu` to give voice more room overall. Do not treat defaults or an upstream example's
levels as an approved mix for a new scene.

Run `mixcheck.py` on configured material, then listen to the flagged moments and the complete sequence.
`master.py` targets -14 LUFS and peaks below -1 dBTP; report actual output measurements after running it.
Tool output alone cannot confirm that acting, pauses, pronunciation or the emotional ending work.

## Costs

Keep actual generation costs and retries in the episode's own notes, not the shared experience file. Distinguish
text length, service credits, assistant tokens and render time. Account counters may lag and historical rates
are not current quotes. If attribution to a specific call cannot be established, say that the cost is unconfirmed;
do not report zero merely because a history item has not appeared. Never log keys or account secrets.
