/**
 * gameConfig.ts — Central tunables for core gameplay
 *
 * Edit values here to tune the game. These constants are imported by
 * Phaser scenes and React HUD components. Keep them serializable and
 * free of side effects so they can be safely re-exported anywhere.
 *
 * Grouped by subsystem; do not add runtime logic to this file.
 */

// ── Board geometry ────────────────────────────────────────────────
export const BOARD = {
  COLS: 12,
  ROWS: 18,
  CELL: 30, // px per cell (canvas units)
} as const;

// ── Scoring ───────────────────────────────────────────────────────
export const SCORING = {
  POINTS_PER_ORB: 10,
  CHAIN_MULTIPLIER: 1.5,            // multiplier per additional chain step
  TRI_COLOR_BONUS: 250,
  ELEMENTAL_CASCADE_BONUS: 500,
  REORG_4X4_BONUS: 1000,
} as const;

// ── Pacing / urgency ──────────────────────────────────────────────
// Drives the moon-gravity ramp inside GameScene. Tweak with caution:
// these numbers define how quickly the player loses control of the board.
export const PACING = {
  START_DROP_INTERVAL_MS: 900,
  MIN_DROP_INTERVAL_MS: 220,
  SPEED_RAMP_PER_LEVEL_MS: 40,
  LEVEL_DURATION_SEC: 30,
  URGENCY_THRESHOLDS: { warn: 0.7, danger: 0.9 } as const, // % of board fill

  // GameScene moon-gravity tunables (lifted from inline constants).
  BASE_GRAVITY: 0.005,            // base downward acceleration per ms step
  MAX_FALL_SPEED: 0.09,           // terminal velocity (cells per frame at 60fps)
  LEVEL_BOOST_PER_LEVEL: 0.045,   // +4.5% gravity per level beyond 1
  POINTS_PER_LEVEL: 2000,         // score threshold to advance one level
  URGENCY_START_SEC: 40,          // when time-based gravity panic kicks in
  URGENCY_RAMP_PER_SEC: 0.05,     // +5%/s gravity stacking after URGENCY_START
  URGENCY_FADE_IN_SEC: 60,        // seconds for urgency intensity 0→1
  MATCH_COOLDOWN_SEC: 60,         // edge-fn enforced gap between sessions
} as const;

// ── Piece spawning ────────────────────────────────────────────────
export const SPAWN = {
  LUCKY_PIECE_INTERVAL: 40,    // every N spawns
  LUCKY_PIECE_CHANCE: 0.3,     // probability of biasing color
} as const;

// ── Combo / chain ─────────────────────────────────────────────────
export const COMBO = {
  MIN_GROUP_SIZE: 3,           // min same-color cluster to clear
  CHAIN_WINDOW_MS: 800,
} as const;
