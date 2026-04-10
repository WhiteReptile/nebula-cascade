

## Plan: 4x4 Reorganization, Chain Reactions, and Combo System

### Overview
Transform the 4x4 block destruction from a simple clear into a dynamic mechanic: orbs burst outward, reorganize into new formations, then the board is re-checked for chain reactions with escalating VFX and scoring.

### Changes

**1. Rework `checkBlockDestruction()` in `GameScene.ts`**
- Instead of nullifying destroyed cells, collect their color and positions
- After implosion VFX, redistribute the 16 orbs into new random compact connected formations nearby (within the same column region)
- Placement algorithm: pick random connected shapes from `FORMATIONS_LIST`, place them in empty cells near the original block area, falling to the lowest available rows
- If no valid placement exists for remaining orbs, they simply disappear (prevents gridlock)

**2. Add chain reaction loop in `lockPiece()`**
- Replace the current single `checkBlockDestruction()` + `checkLines()` with a `resolveChains()` method
- `resolveChains()` runs a loop:
  1. Check for 4x4 blocks → if found, trigger implosion VFX, reorganize orbs, increment chain counter
  2. Check for 3-line same-color clears → if found, trigger line VFX, clear rows, increment chain counter
  3. Apply gravity collapse after each step
  4. Repeat from step 1 until no more matches found
- Use a frame-delayed queue (setTimeout-style or accumulator) so each chain step plays out visibly with a brief pause between explosions

**3. Combo scoring system**
- Track `chainStep` counter (resets each lockPiece)
- Score multipliers: step 1 = 1x, step 2 = 2.5x, step 3+ = exponential (step^1.8)
- Formula: `baseScore * multiplier * level`
- Base scores: 4x4 block = 800pts, 3-line clear = rows² × 100

**4. Escalating VFX per chain step**
- Scale particle count: `baseCount * (1 + chainStep * 0.5)`
- Scale shake: `baseShake * (1 + chainStep * 0.4)`
- Scale flash alpha: `min(baseFlash * (1 + chainStep * 0.3), 0.9)`
- Scale slowMo duration: `baseSlowMo + chainStep * 10` frames

**5. Visible combo counter in HUD (`GameHUD.tsx`)**
- Add `chainCombo` state, listen for new `'chainCombo'` event from GameScene
- Display a prominent animated counter (e.g. "CHAIN x3!") center-screen that fades after 2s
- Style with escalating glow intensity matching the chain step

**6. Orb reorganization algorithm (detail)**
- Collect all destroyed orb colors (all same color for a 4x4)
- Generate 4-5 small connected formations (2-3 orbs each) from a subset of `FORMATIONS_LIST`
- Place them in empty cells near the original block's column range, stacking from bottom up
- Each placed orb gets a fresh `OrbState` with landing bounce
- Run gravity collapse after placement to ensure no floating orbs

### Files Modified
- `src/game/GameScene.ts` — chain loop, reorganization, escalating VFX, combo event emission
- `src/components/GameHUD.tsx` — chain combo counter display

### What stays the same
- All existing rules (3-color, connected formations, 3-line same-color clears, 5-line cosmic wipe)
- Moon gravity and loosening physics
- All controls and existing VFX for line clears

