# The look: technical reference from the short examples

**Scope for lamvideo:** the pace figures and short-hold targets below belong to the inherited 15–25 second
examples. They are optional references when making that format, not requirements for narrative episodes.
Emotional pauses and longer reaction shots are allowed when the story needs them. Use the current project
workflow and script guidance for editorial decisions. The upstream measurements have not been independently
rechecked in this update; do not present them as current audience research or our own test results.

Keep characters, sets and stories original. Do not infer which tools another channel uses from its visual style.

## Narrative episodes: character performance comes first

For current lamvideo story episodes, use **limited 2D animation with character acting**, not a sequence of held illustrations. The inherited “They animate very little” paragraph below describes the short reference examples; it is not the production target for dialogue scenes. A slow push, parallax, dust, blinking and breathing do not by themselves supply character acting. Do not apply the inherited “something always moves” target by adding constant swaying or extra cuts.

- Stage each dramatic beat as intent → preparation → action → another character's reaction → settle. Important movements need readable changes of silhouette and weight, not just translating or scaling a frozen pose. Holds can be expressive when the preceding action and gaze make the intent clear.
- Couple the speaking character's mouth shapes/opening to the actual line and its pauses. Stop mouth motion when the line stops; listeners react with gaze, posture and small gestures. A generic jaw oscillation or every character talking together is not dialogue acting. Existing rig controls must actually be driven by the episode, not merely exist in the library.
- Eyes can lead a head turn; the torso and arms follow with a motivated delay. A frightened child may pull back, tighten a grip, stop breathing briefly and then look to the sibling. Do not repeat the same idle loop for fear, relief and grief.
- Animate the reach, contact, weight/support and release of props and bodies. Keep feet planted during weight shifts and attach props at the grip; do not repair continuity with a camera move or an occluding subtitle.
- Test a short representative interaction using the existing assets and temporary/reused sound before expanding the work. First watch with a fixed camera and minimal background effects: the action, speaker and listener should still read. Then watch the normal shot with sound and at phone size. Still grids support inspection but do not replace moving playback.
- Prioritize story-bearing actions and close dialogue shots. Reuse rigs and gestures where they fit; do not redraw every frame, force continuous full-body motion or assume paid video generation is necessary. Record actual time/usage rather than promising a percentage of quota saved.

## Camera continuity for narrative episodes

Use motivated camera paths and cuts for current story episodes. Establish the space, then choose a listener reaction, gesture or gaze to lead the change of angle. Keep screen direction, eyelines and hand/prop state coherent; preserve ambient sound across a cut within the same space. A clean cut may be the most natural transition, especially at a sharp dramatic beat.

For a continuous move split across timeline segments, carry position, scale, direction and velocity through the boundary rather than restarting an easing curve in each segment. Ease into a move and settle where the story needs a hold; do not force every shot to float. Reserve dissolves and spatial effects for the chosen story transition instead of blending two faces or hands during normal conversation. Focus changes should lead attention without hiding the reaction.

Review the moving sequence, not only endpoints: inspect camera resets, background coverage, footing, occlusion and gaze after a cut, then watch at normal speed and phone size. Test acting with the camera fixed first; add the intended framing/editing second. Keep episode-specific paths, lenses, timings and exceptions in its staging dossier.

## Pace

| | The genre | Our target for 15-25 s |
|---|---|---|
| Cuts per minute, opening | about 27 (first 90 s) | 27 or more; the cold open can run 40-70 with reversals |
| Median shot | 2.7 s in the opening | 0.7 to 3 s |
| Long holds | up to about 12 s, always with action inside | nothing static over about 3 s |

- Cuts come from **changing shot size**, not from motion: wide, then a macro insert, then a medium, then a close-up
  of a hand, then a reaction. No two neighbouring shots share a size and angle.
- The opening runs about twice as fast as the rest. Cut on the word: `plan.py` lands each cut 2 frames before its
  cue word.

## Light does most of the work

- A dusk palette: purple to orange sky, a low sun with soft rays behind the subject.
- **Every light comes from something you can see:** a window with the sun in it, a pendant, a wall light, a desk
  lamp, string lights, a lit doorway, city windows. Pools of light, dark corners.
- Muted, mid-dark walls (`S3` palette), so the practicals read; then `LightVeil` sinks the mid-tones further and
  leaves holes where the light falls.
- A warm rim light on every character edge, on the side facing the light (`rimId="rimR"` or `"rimL"`;
  `"rimRed"` for the turn).
- Haze, dust in the beams (`Dust`), soft bokeh. Depth of field: foreground objects blurred dark (`Foreground`),
  the middle sharp, the background soft on close-ups (`blur16` on a scaled-up set).
- Grain on twos and a soft vignette finish the frame (the engine's `Grade`).

## Shot vocabulary

- **Establishing wide:** the whole lit room, the character small in it.
- **Medium** (waist up, camera zoom about 1.6 to 2) and **close-up** (head; 3 to 4.5 for an extreme close-up).
- **Macro insert:** an object huge in frame, shallow focus (a mug, a cookie, a hand), often a high or top-down angle.
- **Over the shoulder:** a big, dark, blurred foreground figure filling a third of the frame.
- **High angle / top-down** (looking down at a desk, a landing) and **low angle** (looking up at a character against
  the sky: the rooftop's `low` prop).
- **Schematic** for the science beat: a dark grid, line icons, labels in the mono face, numbers counting.
- **Title card:** a wide establishing shot with the title over it, small first line, big second line.

## Characters

- Mostly three-quarter or profile (`yaw`), rarely face-on; the face slides toward the side they face.
- They animate very little: holds are near-still, with small hand changes. Expressions swap instantly through a
  blink (`faceAt`), never morph.
- Life comes from around them: a one-frame flash on an impact, focus rings, a timer, floating labels, dust, steam,
  a swaying lamp, a slow push-in.
- One hero who never changes. Every costume is a `Look` on the one rig, so it can't drift.

## On-screen text

Almost none. The title card, and small UI readouts in the mono face (a timer, a chip naming the power, a short
label). No speech bubbles, no "HA HA", no captions of the voice.

## The storyboard self-check (step 5)

Look at `storyboard.jpg`, then open every still at full size. Fix anything that fails, re-render those shots, look
again. Only a board that passes goes to animation.

1. **One read in a second.** At phone size the subject and the action are clear. If it needs the voice to make
   sense, reframe it.
2. **Sizes change.** No two neighbours share a size and angle; the board has wides, inserts, mediums, close-ups and
   at least one high or low angle.
3. **Light from a source.** Every shot has a visible practical or sunlight, and the subject sits in or against a
   pool of it. Mid-tones are dark; nothing is evenly lit.
4. **The character pops.** The face is the brightest, sharpest thing in its area; the rim light is on the lit side;
   no dark limb on a dark wall.
5. **Depth.** A blurred dark foreground in about a third of the shots; soft backgrounds on close-ups.
6. **The world is full.** Wides show 20 or more designed objects; no empty wall, no floating furniture. Everything
   that stands has legs and a contact shadow.
7. **Perspective holds.** Objects sit on their surfaces, at the right scale for the character, toward the room's
   vanishing point.
8. **Acting matches the line.** The expression and pose say the line without the voice; the hand that moves is the
   near one (with `yaw < 0` the far arm hides behind the body).
9. **Continuity.** Same costume, same set layout, same props in the same places across shots of one place.
10. **Only the title and readouts as text,** spelled right, inside the frame.
11. **Ours.** Nothing resembles a famous character, a channel's hero or a brand.

## The motion check (step 6)

**Current lamvideo review:** approve still storyboards, then watch a moving animatic with temporary
audio before final polish. Run the planned hand/prop contacts, support changes and occlusions;
panning a single still does not test them. Frame grids below are inspection aids, not a replacement
for watching motion and the assembled sequence. Use preview assets and local renders where possible;
paid voice generation is not required for visual approval. See the [current workflow](../../../../docs/WHAT-IF-QUY-TRINH.md).

Pull frame grids of every action shot with `motiongrid.py` and read them like a flipbook.

- Anticipation before a big move (a crouch before a step, a wind-up before a grab), a hold of 2 frames on the beat
  where the character realises, overshoot and settle on landings and catches.
- Nothing static for more than about a second: something always moves (dust, steam, a sway, a push-in).
- The action lands on its word, within about 3 frames.
- Reversals read backwards (every move derives from `t`, so it does).
- No pops: a prop never jumps between frames unless it's meant to (a paste, a flash).
