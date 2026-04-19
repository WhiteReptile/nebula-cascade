
User pivot: drop BGM scoping work. Just add a small UI "tick" SFX on menu navigation, plus the two new pieces.

# Plan: Menu Navigation SFX + Two New Pieces

## 1. Two New Pieces (`src/game/pieces.ts`)
Append to `FORMATIONS` (all 4 rotations identical, no variations, no other gameplay changes):
- **Solid Square**: `[[0,0],[0,1],[1,0],[1,1]]`
- **T-Spine**: `[[0,0],[0,2],[1,1],[2,1]]` (accepted not-fully-connected per user)

Spawn pool grows 8 → 10 formations.

## 2. Menu Navigation SFX

**New `src/lib/sfx.ts`** — tiny WebAudio helper:
- `playTick()` — short synthesized blip (sine/triangle, ~80ms, ~660Hz with quick decay) for moving between menu items.
- `playSelect()` — slightly lower, punchier blip (~120ms, ~440Hz) for confirming a selection (Enter / click).
- Lazy-init `AudioContext` on first call (browser autoplay policy compliant).
- Respects a simple `localStorage.sfxMuted` flag (default off = sound on). No UI toggle yet — user said forget audio controls for now.

**`src/components/menu/MainMenu.tsx`** — wire it up:
- Call `playTick()` whenever `selected` changes via ArrowUp / ArrowDown / wheel / mouse hover.
- Call `playSelect()` inside `handleSelect` (Enter / click on PLAY / OPTIONS / MARKETPLACE / REWARDS & RULES).

Synthesized via WebAudio — zero asset files, zero network, instant.

## Files Touched
- `src/game/pieces.ts` — append 2 formations
- `src/lib/sfx.ts` — new (WebAudio tick/select helpers)
- `src/components/menu/MainMenu.tsx` — call SFX on navigation + selection

No BGM, no mute UI, no route-based music. Just crisp menu blips + the two new pieces.
