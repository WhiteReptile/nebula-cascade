
User confirmed: do #1 (wider board) + #2 (no tetrominoes, fresh shapes, extra-long I-replacement) + #3 (kill line clears). Plus HUD spacing pass so the Gravity Compass and other metrics each have their own breathing room — no overlap.

Let me check current HUD layout to plan spacing properly.

## Plan: De-Tetris-ify Nebula Cascade + HUD Breathing Room

### 1. Wider, shorter board — `src/game/pieces.ts`
- `COLS: 10 → 12`, `ROWS: 20 → 18`, `CELL: 30` unchanged.
- Board becomes 360×540 (was 300×600). More horizontal room for gravity drift to matter; breaks the legally-iconic 10×20 fingerprint.
- All other files read `COLS`/`ROWS` from constants — no hardcoded grid numbers to chase.

### 2. New formation lineup — `src/game/pieces.ts`
**Remove (tetromino look-alikes):** Solid Square, Flat Four, Soft L, T-Spine, Compact Cluster (also a 2×2).

**Keep (already non-tetromino):** Triple Line, Curved Trio, Soft Hook, Wide Arc, Gentle Arc 5.

**Add new fresh orb-cluster shapes (5 new):**
- **Cosmic Spear** (6-orb extra-long line — your "longer I"): `[[0,0],[0,1],[0,2],[0,3],[0,4],[0,5]]` + vertical rotation. One block longer than classic I, feels extreme.
- **Crescent** (5-orb arc): `[[0,1],[0,2],[1,0],[2,1],[2,2]]`
- **Diamond** (4-orb rhombus, diagonal-only): `[[0,1],[1,0],[1,2],[2,1]]`
- **Twin Pillars** (4-orb gap shape): `[[0,0],[1,0],[0,2],[1,2]]`
- **Star Spark** (5-orb plus-sign-ish, no center): `[[0,1],[1,0],[1,2],[2,1],[1,1]]`

Result: **10 formations, zero tetrominoes**, one signature 6-long "Cosmic Spear" piece that's distinctly Nebula.

### 3. Kill line-clear identity — `src/game/logic/chainResolver.ts` + `src/game/GameScene.ts`
- **Remove** `findLineMatch()` from the resolution sequence in `GameScene.ts`. Function stays in file (commented as deprecated) for safe rollback, but never called.
- Full rows alone trigger **nothing**. Pure region/color/burst/cluster clearing remains:
  - 4×4 Block Match (implosion)
  - 10+ Proximity Burst (cluster)
  - Tri-Color Fusion (3-row tri-color)
  - Elemental Cascade (chain bonus)
- **Move Cosmic Wipe trigger** from "5+ line combo" → "single proximity burst destroys 20+ orbs". Keeps the spectacle, removes the line-clear dependency.
- Lower proximity burst threshold `10 → 8` to compensate for losing line clears as a primary clearing path on the wider board.

### 4. HUD breathing room — `src/components/game/GameHUD.tsx` + `src/components/game/GravityCompass.tsx`
Audit current placement, then reorganize so each metric has its own space:
- **Top-left**: Score + Combo + Chain multiplier (stacked, own panel)
- **Top-right**: Level + Time + Lines-replaced-with-Bursts counter (stacked, own panel)
- **Bottom-left**: **Gravity Compass** — own dedicated panel, semi-transparent backdrop, no other HUD element within 24px
- **Bottom-right**: Next piece preview + Active Card artifact (vertically stacked with gap)
- **Center-top (above board)**: Hype overlay only — never overlaps side panels
- All panels get `min-width`, consistent padding, and a subtle border-glow so they read as distinct futuristic Tetris-style modules.

I'll verify nothing currently overlaps at 1501×1044 (current viewport) and 1280×720 (smaller desktop), and lock the compass into its own corner with margin guards.

### 5. Memory updates
- `mem://gameplay/pieces` — 12×18 grid, 10 non-tetromino formations, signature 6-orb Cosmic Spear.
- `mem://gameplay/unique-mechanics` — line-clear removed, Cosmic Wipe re-triggered by 20+ proximity burst.
- `mem://style/visual-theme` — HUD panel separation rule (each metric gets its own space, no stacking).

## Files Touched
- `src/game/pieces.ts` — grid dims + formation rewrite
- `src/game/logic/chainResolver.ts` — remove line-match from flow, move Cosmic Wipe trigger, lower burst threshold
- `src/game/GameScene.ts` — drop `findLineMatch` call from resolution loop
- `src/components/game/GameHUD.tsx` — panel reorg + spacing
- `src/components/game/GravityCompass.tsx` — verify own corner, add margin guards
- 3 memory files updated

## Untouched
Gravity bias system, scoring math, energy, cards, leaderboard, anti-cheat, auth, marketplace, rewards, roadmap, menu, VFX, physics — all left alone per your instruction.

## Capacity check
Comfortable. ~5 files, mostly constant + array edits + one HUD reflow. No bridge/Supabase/routing changes. Low crash risk.
