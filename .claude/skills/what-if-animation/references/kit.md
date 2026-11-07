# The kit: building blocks for shots

Everything imports from one place: `import { Study, Hero, poseAt, Marquee, ... } from '../../engine';`. The world is
1920 x 1080 units; a shot draws in world units and frames them with a camera.

## A shot

```tsx
export const S4: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 900, y: 712, yaw: 0.45, look: 0.6, armR: { a: 14, b: -6 } } },
    { f: 6, p: { armR: { a: 70, b: 0 } }, ease: easeOut }, // the reach
    { f: 9, p: { armR: { a: 62, b: -4 } } }, // overshoot, settle
  ]);
  const face = faceAt(t, [[0, 'neutral'], [8, 'smug']]); // swaps through a blink
  return (
    <g transform={camT(kf(t, [[0, 980], [len, 960]]), 580, kf(t, [[0, 1.75], [len, 1.9]]))}>
      {/* offset t so the set's dust and sways don't restart at every cut */}
      <Study t={t + 80} id="s4" />
      <Hero look={LOOKS.pipHood} pose={{ ...pose, ...face }} rimId="rimR" shadow={0} />
      <Desk x0={520} x1={1300} y={700} />
      <Foreground blur={10}>{/* a dark shape near camera */}</Foreground>
    </g>
  );
};
```

- `t` is the shot's own clock in frames, `len` how long it runs, `f` the global frame. Draw only from these, never
  from state or `Math.random` (scatter with `rnd(seed, i)`), so the engine can play a shot backwards or hold it.
- Draw order is depth: the set, things behind the character, the character, things in front, then `Foreground`.
- Camera: `camT(cx, cy, zoom)` centres the world point (cx, cy). Wides about 0.75 to 1.1, mediums 1.6 to 2,
  close-ups 3 to 4.5. Move it with `kf` for a push-in or a follow; shake inside a shot with `shake(t, from)`.

## The engine (`episode.tsx`)

- `defineEpisode(id, { timeline, shots, looks, grain, vignette })` makes the `<Id>` and `<Id>Board` compositions.
- A **look** is a power's visual while it runs: `{ grade: (lv) => cssFilter, jitter, Overlay: ({ f, lv, p, n }) => svg }`.
  `p` runs 0 to 1 through the look's run, `n` counts the runs. The rewind look: desaturate, jitter, tape lines, a
  REWIND chip and a stopwatch counting back (see `episodes/rewind/index.tsx`).
- `fx` in `episode.json`: `flash` (one frame, then 35% the next; `color`, `o`) and `shake` (`len`, `amp`).

## The cast (`rig.tsx` & `hands.tsx`)

One rig, 22 costumes (`LOOKS`):
- Original What-If cast: `pip` (mustard jacket), `pipHood` (hero dark hoodie), `pipInk` (dark head), `mo` (curls, olive jacket, headphones), `sis` (bunches, teal; scale ~0.7), `mom` (bob, rose cardigan), `suit` (combed hair, charcoal suit, red tie).
- Vietnamese everyday & series cast: `worker`, `workerHat`, `student`, `tech`, `chu`, `bac`, `moi`, `an`, `hanh`, `linh` (child scale ~0.62), `baSau` (silver bun, glasses, shawl/apron), `nam`, `duy` (hero of *Hẻm Có Chuyện*), `thao` (sister in *Hẻm Có Chuyện*), `ongLoc` (elderly repair shop owner with glasses & moustache).
Render sheets with `npx remotion still src/index.ts Cast out/cast.png`, `FurnitureSheet`, and `VehicleSheet`.

`<Hero look pose rimId shadow />` (alias `Actor`). The **pose**:

| Field | What |
|---|---|
| `x, y, scale` | the hip point in world units; feet are `LEG_LEN * scale` below it when standing (`standPose` / `sitPose` / `crouchPose` compute `y` from floor/seat automatically) |
| `yaw` | -1 profile facing left, 0 front, 1 profile facing right; `SideHair` and near-ear automatically render so the head is never bald when turned |
| `facing` | 1 or -1: which way legs and shoes point |
| `tilt`, `spin`, `headTilt`, `shoulderLift` | lean at the hips, whole-body rotation about the chest, head tilt, and shoulder shrug/slump (-1..1) |
| `armL, armR, legL, legR` | `{ a, b }`: upper segment angle from straight down, bend of the lower segment (degrees) |
| `handL, handR` | `'open' \| 'point' \| 'fist' \| 'hold' \| 'wave' \| 'palmUp' \| 'pinch' \| 'rest'` |
| `expr` | 21 expressions: `neutral`, `happy`, `smug`, `shock`, `worried`, `oops`, `cool`, `dizzy`, `tired`, `sad`, `cry`, `smile`, `relieved`, `scared`, `determined`, `angry`, `guilty`, `sigh`, `thinking`, `surprised`, `pain` |
| `talk` | 0..1 lip-sync mouth opening with teeth and tongue |
| `blink, look, glasses` | 0..1 eyelids, -1..1 eye direction, 0..1 glasses (`L.glassesDefault` enables them by default on `baSau` and `ongLoc`) |
| `squash`, `sway` | + squashes / - stretches about the feet; `sway` swings drawstrings and hair bunches |
| `glint`, `glintColor` | 0..1 eyes light up in the power's colour |

Error-free acting & placement helpers (`rig.tsx`):
- `standPose(x, groundY, scale, opts)`, `sitPose(x, seatY, scale, facing, opts)`, `crouchPose(x, groundY, scale, facing, opts)` place characters directly on floor or seat `y` with accurate contact shadows tracking the lowest foot.
- `gesturePose(pose, gesture, amount)` applies `'idle' | 'explain' | 'point' | 'think' | 'shrug' | 'crossArms' | 'handOnChest' | 'slump' | 'recoil' | 'determined' | 'wave' | 'holdProp' | 'write'` and automatically picks the **near arm** (`armL` when `yaw < 0`, `armR` when `yaw >= 0`) so gestures never hide behind the body.
- `breatheAt(t, seed)`, `blinkAt(t, seed)`, `handWorld(pose, side)`, `poseAt(t, keys)`, `faceAt(t, keys)`, `walkPose(...)`, `joints(pose)`, `toWorld(pose, pt)`, `reachAngle(pose, target)`.
- Close-up insert hands (`hands.tsx`): `Digits`, `OpenHand`, `ArmHand`, `GripThumb`, `GripHand`, `PointHand`, `PinchHand`.

## Props (`props.tsx`, `props_life.tsx`), Interior Decor (`furnish.tsx`) & Vehicles (`vehicles.tsx`)

- **Core & Story Props (`props.tsx`)**: `Cat`, `Mug`, `Cookie`, `CookieTop`, `CookieStack`, `Plate`, `PlateTop`, `Paper`, `PaperStack`, `AlarmClock`, `WallCalendar` (`calendarDay`), `OpenBook`, `BookFlat`, `BookTower`, `LaptopBack`, `PizzaSlice`, `PizzaBox`, `Phone` (supports `cracked` spiderweb glass overlay and `voiceMemo` waveform UI), `PaperBall`, `PhotoPrint` (family photo of mother and two children), `ReceiptSlip` (repair claim slip), `TeaSet` (teapot & cups on wooden tray), `PhinCoffee` (Vietnamese drip coffee), `Helmet` (half-face motorbike helmet), `ToolBox`.
- **Work, School & Family Props (`props_life.tsx`)**: `ArmIn`, `Boot`, `Backpack`, `CementBag`, `Wheelbarrow`, `BrickStack`, `HardHat`, `Notes`, `NoticeSheet`, `Envelope`, `Lunchbox`, `TapeMeasure`, `BulbBoard`, `Diploma`, `FormSheet`, `Notebook`, `MedBag`, `Tote`, `Bowl`, `ClassPhoto`, `ChatScreen`, `Strap`.
- **Vietnamese Interior Furniture & Home Decor (`furnish.tsx`)**: `AncestralAltar` (bàn thờ gia đình), `WoodenSofa` (bộ bàn ghế salon gỗ + bàn trà), `SewingTable` (bàn máy may cổ điển Bà Sáu), `RepairBench` (quầy gỗ tiệm sửa đồ Ông Lộc + kệ đồng hồ cổ), `StandingFan` (quạt cây quay theo `t`), `CeilingFan` (quạt trần quay theo `t`), `WallAC` (điều hòa), `TVStand` (kệ tivi), `CalendarBlock` (lịch bloc đỏ vàng), `FoldingIronDoor` (cửa xếp sắt), plus `RoomShell`, `BackWindow`, `Pendant`, `WallLight`, `FloorPlant`, `WallFrame`, `WallClock`, `FloorShadow`, `Tabletop`.
- **Vehicles & Street/Alley Architecture (`vehicles.tsx`)**: `Motorbike` (underbone Wave/Dream + `motorbikeSeat` helper), `Scooter` (step-through scooter), `Bicycle`, `SedanCar` (4-door car / taxi), `SmallTruck`, `StreetCart` (xe đẩy hàng rong đầu hẻm), `VnHouseFacade` (mặt tiền nhà ống / tiệm sửa đồ), `ElectricPole` (cột điện đèn đường).

## Sets

Each set is a component taking the shot clock `t` (for dust, sways, flicker) and an `id`. Offset `t` per shot so
idle motion carries across cuts.

| Set | Coordinates and parts | Props |
|---|---|---|
| `Study` (`sets/study.tsx`) | `STUDY = makeRoom({980,500}, back 530-1430 x 335-740)`. `night` puts the moon in the window and turns the pendant off (the `Desk` lamp becomes the light); `shelf` (0..1) empties the bookcase, books flying from `STUDY_SHELF_V`. Window 782-1178 x 380-606 with the sun at (1085, 596); bookcase on the left wall, door and print on the right, pendant at u 0.32 w 0.42, wall light on the left. `Desk x0 x1 y` stands mid-room (the proof clip: x0 560, x1 1360, y 700, Pip behind it at hips (960, 712) scale 1). | `veil` (0.28 for a wide that must show the floor) |
| `Stairwell` (`sets/stairwell.tsx`) | Side-on: 7 steps of 150 x 70 down to the right from a landing at y 420 (`SW`). `stepTop(x)`, `hipGround(x)`. Lit doorway upper left, arched window lower right, lantern, sconces. `Banister` is the near layer, drawn after the characters. Walk at scale 0.9. | |
| `Classroom` (`sets/classroom.tsx`) | `CLS = makeRoom({900,470}, back 300-1500 x 130-720)`. Board 426-1054 x 196-524, windows on the left wall, two rows of desks with `Kid`s from behind. `SchoolDesk x` is the hero's desk (y 750); the proof clip's Pip stood at (1260, 760), yaw -0.35. `Kid` with `turn` and `laugh` works as a blurred foreground figure for over-the-shoulder shots. | `board` (your own chalk), `solved`, `wrong`, `laugh` |
| `Rooftop` (`sets/rooftop.tsx`) | Parapet at y 790, deck below (feet at about y 820). The sun at (`sunX`, `sunY`), r 170, optionally a clock (`clock`, `spin`, `crack`). City in three depths, string lights between poles at x 140 and 1780. | `red` (the turn's red sky), `lightsOut`, `blackout` (city windows go dark in a sweep from the left), `cityLit` (more lit windows: about 2.5 for a blackout), `low` (camera lower: the city and roof drop by `low`, so feet go lower too) |
| `Kitchen` (`sets/kitchen.tsx`) | Built with the room kit: `KITCHEN = makeRoom({960,500}, back 500-1420 x 330-745, 3.4)`. Counter run along the back wall with a sink under the window (sun at 860, 530), hob and kettle, splashback, open shelves with jars, fridge on the right, wall cabinets and a wall light on the left, two pendants. Characters stand behind the island at w 0.4 (`stand(KITCHEN, u, 0.4)`), then draw `KitchenIsland` (with two bar stools) so it hides their legs; `islandTop(u, d)` is a point on its top. | `veil`, `red` |
| `Bedroom` (`sets/bedroom.tsx`) | At night, built with the room kit: `BEDROOM = makeRoom({940,500}, back 480-1440 x 320-742, 3.4)`. Bed in the back left corner (headboard on the back wall, u 0.03-0.4, foot at w 0.47), nightstand with the lamp (`LAMP`) and the clock, `WINDOW` 1070-1330 x 374-600 onto the moon and the lit city, fairy lights and posters over the bed, `CAL` (the wall calendar), a dresser under the window, wardrobe on the right wall, door ajar on the left with the hall light, rug, beanbag, trainers. In bed: draw it with `duvet={false}`, then the character at `bedSit(u)`, then `BedDuvet` (with `knees`) over their legs. `bedTop(u, w)` is a point on the mattress. | `clock`, `lamp` (0..1: flicker it, kill it), `crossed` (the calendar), `veil` |
| `Schematic` (`sets/schematic.tsx`) | The science beat's ground: a dark blueprint grid with registration marks. On it: `DrawOn` (a path drawing on), `Arrow`, `SchLabel` (mono, pops on), `CountUp` (a number counting, with commas), `PlantIcon` (tower, wind, solar, dam, factory; lit orange when `on`). `SCH` holds its colours. | |
| `OngLocShop` (`sets/tin_nhan_chua_gui.tsx`) | `SET-TIEM` (Tiệm sửa đồ cuối hẻm — mysterious, antique & cluttered): back wall shelves of stopped clocks (`x 270..1030, y 175..715`), rear repair bench + warm green-shaded banker's lamp (`x 1355, y 715`), left wall fan (`x 115, y 265`) + west shelves (`kệ tây`), right wall folding iron gate (`CỬA RA HẺM`) with cold night alley light. Place `ongLoc` behind `<OngLocCounter x={890} y={855} />` (`standPose(915, 804, 0.96)`), and `duy` (`x=685`) + `thao` (`x=1105`) on `<CustomerStool y={935} />` (`sitPose(x, 845, 0.94)`), then `<OngLocForeground shiftX={...} />`. Use `<OngLocCounterInsert />` for 38° tabletop close-ups. | `veil`, `phoneState`, `showPhoto`, `receiptStage`, `penOnPaper` |
| `MotherThaoHouse` (`sets/tin_nhan_chua_gui.tsx`) | `SET-NHA` (Nhà của mẹ và hai chị em Thảo – Duy — warm, cozy Vietnamese home): warm ochre-cream walls with wooden wainscot, terracotta tile floor, woven bamboo pendant lamp (`x 980, y 35`), window with curtains & potted pothos (`x 465, y 340`), left sewing corner (`SewingTable` at `x 385, y 815` with pinned cloth, yellow tape measure, switched-off lamp, folded cloth basket, and wall hooks `ThaoToteBag` + `HouseKeys`), center kitchen doorway (`x 760..1280` with `WallSwitch` at `x 718, y 455`, dish cabinet, two `CeramicBowl`s, rice cooker, red thermos), and right-wall `AncestralAltar` (`x 1545, y 765`, warm lamp stays on even when `kitchenLightOn={0}`). Draw `<DiningTableSet x={980} y={915} />` with `duy` (`x=765`) & `thao` (`x=1195`) at `sitPose(x, 822, 0.92)`, then `<MotherHouseForeground />`. | `kitchenLightOn`, `toteHung`, `keysHung`, `bowlsLocation` |

## The room kit (`room.tsx`, `furnish.tsx`)

For a new interior, in this order:

1. `const R = makeRoom(vp, { x0, x1, y0, y1 }, depth)`: the back wall's box on screen, the vanishing point, how deep
   the room is (3.2 to 3.5). A point in the room is `R.P(u, v, w)`: u across 0..1, v down 0..1, w toward camera
   0..1 (0 on the back wall). `R.Q([[u, v, w], ...])` gives polygon points.
2. `<RoomShell r={R} id floor="boards" | "tiles" wall side floorC />`: ceiling, walls, floor, texture, corners, trim.
3. Light sources: `<BackWindow r id t x0 x1 y0 y1 sun cols curtains />`, `<Pendant r u w t />`, `<WallLight r u v w />`.
4. Furniture: `<Box r u={[u0,u1]} v={[v0,v1]} w={[w0,w1]} front top side rim />` draws only the faces this camera
   sees; `<FloorShadow r u w />` under it. Small things go on top of boxes at `R.P(u, v0, w)`.
5. Dressing: `<FloorPlant r u w />`, `<WallFrame x y w h art />`, `<WallClock x y />`, books, jars, rugs.
6. Finish: `<LightVeil id lights={[[x, y, radius], ...]} o={0.42} />` with a hole at each light (`pendantLight(R, u,
   w)` gives a pendant's), then the glows again on top (`Glow`), then `Dust` in the brightest beam.
7. Characters: `stand(R, u, w)` gives the hip point and scale for someone standing at floor point (u, w).

## Light and atmosphere (`light.tsx`, `kit.tsx`)

`Glow` (screen-blended radial light: warm, cool, red), `Cone` (a lamp's soft cone), `LightVeil` (the contrast
pass), `Dust` (specks in a beam), `WallTexture`, `RoomCorners`, `SkyView` (a window onto the dusk: sky, sun, far
city; `night` for a deep blue sky, stars, the moon where the sun was, the city lit; `BackWindow` takes `night` too).
`DuskSky`, `Sun`, `Rays`, `Haze`, `Bokeh`, `Shaft`, `Skyline`, `Foreground` (blur 3, 6, 10 or 16), and for night
`NightSky`, `Moon`, `Stars`. Filters for characters: `rimR`, `rimL`, `rimRed`, and `rimBlue`, `rimBlueL` for
moonlight and screen light.

## UI and marks (`ui.tsx`)

All in the mono face on a dark translucent pill, cream text, orange for the live value.

| Block | Use |
|---|---|
| `TitleCard t lines accent accentT` | the premise over a wide, inside the camera group |
| `HudChip f label icon` | names the power while it runs (rewind, pause, copy, paste, skip, dot) |
| `Dial p readout` | a stopwatch, a countdown, a battery |
| `Gauge x y p label` | a level going up or down (energy, money, risk) |
| `Tag x y t text mark` | a short answer or value, with a cross or a tick drawn on |
| `Marquee x y w h t label` | a selection box with marching ants: picking a thing out of the world |
| `PasteIn x y t` | wraps anything that appears from nowhere: it pops in with an overshoot, a glow and an opening ring |
| `Toast x y t text` | a small notice that pops in and out (COPIED, SAVED) |
| `FloatLabel x y t text` | "x10", "+1" rising and fading |
| `FocusRings`, `DizzyStars`, `Sparkle` | a realisation, a daze, a glint |
| `TapeLines f` | VHS lines for time powers (full frame, in a look's overlay) |
| `FONT.title / ui / hand` | the three faces |

## Adding to the kit

- **A set:** build it with the room kit in `src/engine/sets/<name>.tsx`, export it from `engine/index.ts`, document
  its coordinates in the table above, and copy it into the skill's `studio/src/engine/sets/` so it ships.
- **A character:** a new `Look` in `LOOKS` (colours, plus an `extra` piece if it needs one, drawn in `Hero`), checked
  on the cast sheet for contrast on the dark sets and for resemblance to anything famous.
- **A power look:** in the episode's `index.tsx`; move it to `ui.tsx` once a second episode wants it.
