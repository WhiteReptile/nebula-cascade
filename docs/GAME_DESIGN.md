# Game Design — Nebula Cascade

Cosmic-themed cascade puzzle. **Not** Tetris: 12×18 grid (vs 10×20), no
tetromino formations, region/color/burst destruction only — **no line
clears**.

## Core Loop

1. Player starts a match → `generate-session` edge function issues a seed.
2. Phaser `GameScene` spawns orb formations from `src/game/pieces.ts`.
3. Player rotates and drops formations to build same-color clusters.
4. Clusters of ≥3 same-color orbs explode → trigger chains, combos, reorganizations.
5. Scoring + level + urgency rise over time (`src/config/gameConfig.ts`).
6. Game ends when the board fills → `submit-score` validates + persists.

## Player Actions

| Input              | Effect                              |
|--------------------|-------------------------------------|
| ◀ ▶                | Move active formation               |
| ▼                  | Soft drop                           |
| Space / ▲          | Rotate                              |
| Shift              | Hard drop                           |
| Esc                | Pause                               |

## Pieces

10 unique orb formations (3–6 orbs each). Signature **Cosmic Spear** (6
orbs, one longer than a Tetris I-piece). 4 elements: Electricity (yellow),
Fire (red), Water (blue), Shadow (grey). See `src/game/pieces.ts`.

**Lucky piece bias**: every `SPAWN.LUCKY_PIECE_INTERVAL` spawns there is a
`SPAWN.LUCKY_PIECE_CHANCE` chance the piece matches the dominant board color.

## Scoring

Tunable in `src/config/gameConfig.ts → SCORING`.

- `POINTS_PER_ORB` per cleared orb
- Chain bonus: `× CHAIN_MULTIPLIER` per additional chain step
- `TRI_COLOR_BONUS` when three different elements clear in one cascade
- `ELEMENTAL_CASCADE_BONUS` when all four elements clear in one cascade
- `REORG_4X4_BONUS` for a 4×4 reorganization payout

## Pacing & Urgency

Drop interval starts at `START_DROP_INTERVAL_MS` and ramps down by
`SPEED_RAMP_PER_LEVEL_MS` each `LEVEL_DURATION_SEC`. The Gravity Compass
HUD switches to *warn* / *danger* states based on board fill thresholds.

## Combos

- **Region clear**: any same-color cluster ≥ `COMBO.MIN_GROUP_SIZE`.
- **Chain**: secondary clears triggered by falling orbs within `CHAIN_WINDOW_MS`.
- **Tri-color**: 3 elements clear in a single cascade.
- **Elemental cascade**: all 4 elements clear in a single cascade.
- **4×4 reorganization**: any aligned 4×4 same-color block triggers a payout
  reshuffle (see `src/game/logic/orbReorganizer.ts`).

## Game Over

`GameHUD` overlays high-conversion CTAs: RESTART, LEADERBOARD, SIGN UP.
Match data is emitted via `gameEvents.matchEnd` and submitted by `matchLogger`.
