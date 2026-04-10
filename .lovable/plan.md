

## Plan: Fix Playability — Slower Moon Gravity & Smooth Loosening

### Problem
The game feels too fast and stiff. Gravity is not slow enough, and the loosening system needs better tuning for a visible but controlled transition from rigid formation to independent orbs.

### Changes (all in `src/game/GameScene.ts`)

**1. Drastically reduce gravity and terminal speed**
- `GRAVITY`: 0.012 → **0.003** (4x slower acceleration)
- `MAX_FALL_SPEED`: 0.55 → **0.18** (3x slower terminal velocity)
- `levelBoost` multiplier: 0.12 → **0.05** per level (gentler scaling)
- Add a **drag factor** (0.992) applied to `fallSpeed` each frame so acceleration feels floaty, not linear

**2. Extend loosening duration and make it visible**
- `LOOSEN_DURATION`: 3.0s → **5.0s** (more time as a tight group before drifting)
- First 1.5s: formation stays fully rigid (looseness effectively 0)
- Use an eased curve (e.g. smoothstep) so loosening accelerates gradually, not linearly
- Increase `maxDrift` range at full looseness: 7px → **10px** for more visible separation

**3. Improve per-orb physics feel**
- Reduce spring strength slightly so orbs feel softer
- Add a subtle downward drift bias that scales with looseness (mimicking individual gravity)
- Increase wobble amplitude slightly at high looseness for more "alive" feel
- Keep damping high enough to prevent chaos

**4. Ensure controls stay responsive**
- No changes to movement/rotation logic — these remain instant grid-snaps
- On move/rotate, reset orb visual offsets partially (lerp toward 0) so the formation "snaps back together" briefly, then loosens again — reinforcing the organic feel

### What stays the same
- All formations (3+ orbs, fully connected)
- 3-color palette (Yellow, Red, Blue)
- Line clearing: only 3+ consecutive same-color full rows
- 5-line cosmic chain effect
- Force drop (Z key), VFX, HUD

