# Remi: Rive rig and motion specification

## File contract

| Item | Name |
|---|---|
| Artboard | `Remi` |
| State machine | `Remi Controller` |
| View model | `RemiModel` |
| Default state | `Idle` |
| Canvas | `512 × 384`, transparent |

Use a single enum property named `emotion` with these cases: `idle`, `thinking`, `explaining`, `happy`, `celebrate`, `confused`, and `sleep`. `Blink` is an independent state-machine layer. `Wave` is a one-shot trigger so it can play over the current emotion and return without resetting it.

View-model properties:

| Property | Type | Default | Purpose |
|---|---|---:|---|
| `emotion` | enum | `idle` | Persistent expression/behavior |
| `blink` | trigger | — | Optional forced blink; automatic blink also runs |
| `wave` | trigger | — | One-shot greeting |
| `celebrate` | trigger | — | One-shot celebration, then returns to `emotion` |
| `lookX` | number | `0` | Eye aim from `-1` to `1` |
| `lookY` | number | `0` | Eye aim from `-1` to `1` |
| `reducedMotion` | boolean | `false` | Disables looping translation/rotation |

## Hierarchy and pivots

- Keep `shadow` outside the character-motion hierarchy.
- `remi_root`: global squash, stretch, and vertical offset; origin `(256, 270)`.
- `body`: origin `(256, 258)`.
- Each leg group: origin at its existing group translation. Add one two-bone chain only if deformation is desired; rigid rotation is enough for the first version.
- `eye_left_iris` and `eye_right_iris`: translate only. Constrain their runtime/look movement to ±7 px X and ±5 px Y.
- `eye_left_lid` and `eye_right_lid`: animate opacity and Y scale. Do not vertically squash the eye whites to blink.
- Mouth variants: use a Solo containing `mouth_smile`, `mouth_open`, `mouth_small_o`, and `mouth_sleep`.
- `fx_left` and `fx_right`: keep hidden except during celebrate, wave, and the explaining accent.

## Timelines

All loops should have matching first and last values but no duplicated last frame. Use smooth cubic easing unless noted.

### Idle — 2.4 s, loop

- `remi_root`: Y `0 → -5 → 0`; rotation `0 → 0.8° → 0`.
- Body: scale Y `100 → 102 → 100%`, scale X `100 → 99 → 100%`.
- Outer legs counter-rotate by about `±2°`.
- Shadow scale X `100 → 94 → 100%`, opacity `17 → 13 → 17%`.

### Blink — 0.16 s, one-shot

- Lid opacity `0 → 100 → 100 → 0%` at `0, 0.055, 0.105, 0.16 s`.
- Lids scale Y `30 → 100 → 100 → 30%`.
- Run automatically every `3.2–5.5 s` on a separate layer; suppress while sleeping.

### Thinking — 2.0 s, loop

- Set mouth to `mouth_small_o`.
- Irises: `lookX=0.55`, `lookY=-0.45`; add a tiny alternating drift.
- Right inner front leg rotates `-16°` toward the cheek.
- Body rotates `-2°`; slow bob of `3 px`.

### Explaining — 1.1 s, loop

- Alternate `mouth_open`/`mouth_smile` every `0.22–0.32 s` without lip-sync precision.
- Left outer front leg rotates from `0 → -32 → -18 → -32°` as a presenting gesture.
- Body leans `1.5°` toward the gesturing side.
- Briefly show the left effect group at the gesture peak.

### Happy — 1.35 s, loop

- Switch to `mouth_open`.
- Raise cheeks `3 px` and scale them to `108%`.
- Body squash/bounce: Y `0 → -8 → 0`, scale `100/100 → 103/96 → 100/100%`.
- Front legs rotate outward `5°`, then settle.

### Celebrate — 1.4 s, one-shot

- Anticipation `0–0.18 s`: body down `5 px`, scale `104/94%`.
- Jump `0.18–0.55 s`: root Y to `-34 px`; front outer legs rotate upward `42°`; mouth open; eyes happy.
- Peak `0.45–0.75 s`: effect groups at `100%`; slight `±5°` alternating tilt.
- Land `0.75–1.05 s`: overshoot down `3 px`, squash `106/91%`.
- Settle by `1.4 s`, then return to the selected persistent emotion.

### Confused — 1.8 s, loop

- Mouth `mouth_small_o`.
- Brows: left rotates `-11°`, right rotates `10°`.
- Head/body tilt `0 → -4° → 3° → 0`.
- Irises move `(-0.25,-0.1) → (0.3,-0.1) → center`.

### Sleep — 3.2 s, loop

- Show lids and `mouth_sleep`; hide the automatic blink layer.
- Root Y `0 → 4 → 0`; body scale Y `100 → 97 → 100%`.
- Irises can remain hidden behind lids.
- Optional `Z` particles should be added in Rive as simple vector paths, not baked into this source.

### Wave — 1.25 s, one-shot overlay

- Use the front-left outer leg as Remi’s waving arm.
- Raise it to `-58°`, wave between `-48°` and `-68°` three times, and return.
- Body counter-tilts `2°`; use `mouth_open` and show the left effect group near the first wave peak.
- Preserve the current persistent emotion after the overlay exits.

## State machine layout

Use three layers:

1. `Emotion`: `Idle`, `Thinking`, `Explaining`, `Happy`, `Confused`, `Sleep`. Transition from Any State when `emotion` changes; cross-fade `120–180 ms`.
2. `Face detail`: automatic `Blink` plus the manual `blink` trigger. Disable it when `emotion == sleep`.
3. `One shots`: `Wave` and `Celebrate`, activated by triggers. Give `Celebrate` priority if both fire together.

When `reducedMotion` is true, hold the current expression but remove looping translation, rotation, squash/stretch, and random blinking. Manual wave/celebrate may use simple pose changes without bounce.

## React API contract

The website-facing component should be declarative:

```jsx
<Remi
  emotion="explaining"
  look={{ x: 0.25, y: 0 }}
  onReady={handleReady}
  ariaLabel="Remi is explaining the next step"
/>
```

The ref should expose one-shot methods:

```js
remiRef.current.wave()
remiRef.current.celebrate()
remiRef.current.blink()
```

Public props:

```ts
type RemiEmotion =
  | 'idle'
  | 'thinking'
  | 'explaining'
  | 'happy'
  | 'confused'
  | 'sleep'

type RemiProps = {
  emotion?: RemiEmotion
  look?: { x: number; y: number }
  className?: string
  fit?: 'contain' | 'cover' | 'fill'
  autoplay?: boolean
  reducedMotion?: boolean
  ariaLabel?: string
  onReady?: () => void
}
```

Implementation should target Rive’s current React component/data-binding API. Avoid basing new code on the legacy `useStateMachineInput` hook; recent Rive runtimes deprecate that input API in favor of data binding.

## Integration map for WebbedSite

- Replace the static image in `src/components/tutorial/RemiGuide.jsx` first.
- Keep `/remi.png` as the loading/error fallback.
- Use `explaining` while the guide types text, `idle` after typing finishes, `thinking` when a hint is revealed, and `celebrate()` on the last completed step.
- Defer the Rive runtime with a dynamic import if Remi is not visible at initial page load.
- Respect `prefers-reduced-motion` and pass it to `reducedMotion`.
