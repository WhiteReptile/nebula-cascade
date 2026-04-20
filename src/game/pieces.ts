/**
 * pieces.ts — Piece definitions, colors, and spawn logic
 *
 * NEBULA CASCADE — De-Tetris-ified board:
 *   - Grid: 12 cols × 18 rows (NOT the classic Tetris 10×20)
 *   - Zero tetromino-shaped formations (no O, I, L, T, S, Z, J equivalents)
 *   - Signature 6-orb "Cosmic Spear" (one orb longer than a classic I-piece)
 *   - All shapes are orb-cluster style: arcs, diamonds, sparks, pillars
 *
 * Defines the 4 elemental orb colors and 10 unique piece formations.
 * Lucky piece bias: every 40 spawns, 30% chance to match board's dominant color.
 *
 * Grid constants: 12 columns × 18 rows × 30px cells (board = 360×540)
 */
export interface PieceDef {
  name: string;
  color: number;      // hex tint
  colorCSS: string;   // for HUD
  element: string;    // element identity
  shapes: [number, number][][]; // rotation states, each is array of [row,col] offsets from pivot
}

export const COLORS = [
  { color: 0xffdd00, colorCSS: '#ffdd00', element: 'electricity' }, // Yellow — Electricity
  { color: 0xff3344, colorCSS: '#ff3344', element: 'fire' },        // Red — Fire
  { color: 0x3388ff, colorCSS: '#3388ff', element: 'water' },       // Blue — Water
  { color: 0x888899, colorCSS: '#888899', element: 'shadow' },      // Grey — Shadow
];

// All formations are orb-cluster style — NO classic tetromino shapes.
// Mix of 3, 4, 5, and 6 orbs across organic / cosmic forms.
const FORMATIONS: { name: string; shapes: [number, number][][] }[] = [
  {
    name: 'Triple Line',
    shapes: [
      [[0,0],[0,1],[0,2]],
      [[0,0],[1,0],[2,0]],
      [[0,0],[0,1],[0,2]],
      [[0,0],[1,0],[2,0]],
    ],
  },
  {
    name: 'Curved Trio',
    shapes: [
      [[0,0],[0,1],[1,1]],
      [[0,0],[1,0],[1,-1]],
      [[0,0],[1,0],[1,1]],
      [[0,0],[0,1],[1,0]],
    ],
  },
  {
    name: 'Soft Hook',
    shapes: [
      [[0,0],[1,0],[1,1]],
      [[0,0],[0,1],[1,0]],
      [[0,0],[0,1],[1,1]],
      [[0,0],[1,0],[1,-1]],
    ],
  },
  {
    name: 'Wide Arc',
    shapes: [
      [[0,0],[0,1],[0,2],[1,2]],
      [[0,0],[1,0],[2,0],[2,-1]],
      [[0,0],[1,0],[1,1],[1,2]],
      [[0,0],[0,1],[0,2],[1,0]],
    ],
  },
  {
    name: 'Gentle Arc 5',
    shapes: [
      [[0,0],[0,1],[0,2],[0,3],[1,3]],
      [[0,0],[1,0],[2,0],[3,0],[3,-1]],
      [[0,0],[1,0],[1,1],[1,2],[1,3]],
      [[0,0],[0,1],[1,0],[2,0],[3,0]],
    ],
  },
  // ── New Nebula-original cluster shapes ──
  {
    // Cosmic Spear — signature 6-orb extra-long line, ONE longer than classic I-piece
    name: 'Cosmic Spear',
    shapes: [
      [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5]],
      [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0]],
      [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5]],
      [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0]],
    ],
  },
  {
    // Crescent — 5-orb open arc
    name: 'Crescent',
    shapes: [
      [[0,1],[0,2],[1,0],[2,1],[2,2]],
      [[0,0],[0,1],[1,2],[2,0],[2,1]],
      [[0,0],[0,1],[1,2],[2,0],[2,1]],
      [[0,1],[0,2],[1,0],[2,1],[2,2]],
    ],
  },
  {
    // Diamond — 4-orb rhombus, diagonal-only adjacency (gap-y center)
    name: 'Diamond',
    shapes: [
      [[0,1],[1,0],[1,2],[2,1]],
      [[0,1],[1,0],[1,2],[2,1]],
      [[0,1],[1,0],[1,2],[2,1]],
      [[0,1],[1,0],[1,2],[2,1]],
    ],
  },
  {
    // Twin Pillars — 4-orb gap shape (two vertical pairs with a column gap)
    name: 'Twin Pillars',
    shapes: [
      [[0,0],[1,0],[0,2],[1,2]],
      [[0,0],[0,1],[2,0],[2,1]],
      [[0,0],[1,0],[0,2],[1,2]],
      [[0,0],[0,1],[2,0],[2,1]],
    ],
  },
  {
    // Star Spark — 5-orb plus-sign (the "+" shape — distinct from any tetromino)
    name: 'Star Spark',
    shapes: [
      [[0,1],[1,0],[1,1],[1,2],[2,1]],
      [[0,1],[1,0],[1,1],[1,2],[2,1]],
      [[0,1],[1,0],[1,1],[1,2],[2,1]],
      [[0,1],[1,0],[1,1],[1,2],[2,1]],
    ],
  },
];

export const FORMATIONS_LIST = FORMATIONS;
export const COLORS_LIST = COLORS;

export const PIECES: PieceDef[] = FORMATIONS.map(f => ({
  name: f.name,
  color: COLORS[0].color,
  colorCSS: COLORS[0].colorCSS,
  element: COLORS[0].element,
  shapes: f.shapes,
}));

let spawnCounter = 0;

export function randomOrbPiece(boardColorBias?: number | null): PieceDef {
  const formation = FORMATIONS[Math.floor(Math.random() * FORMATIONS.length)];
  spawnCounter++;

  let colorIdx: number;
  // Lucky piece: every 40 spawns, 30% chance to match the dominant board color
  if (boardColorBias != null && spawnCounter % 40 === 0 && Math.random() < 0.3) {
    colorIdx = COLORS.findIndex(c => c.color === boardColorBias);
    if (colorIdx < 0) colorIdx = Math.floor(Math.random() * COLORS.length);
  } else {
    colorIdx = Math.floor(Math.random() * COLORS.length);
  }
  const clr = COLORS[colorIdx];

  return {
    name: formation.name,
    color: clr.color,
    colorCSS: clr.colorCSS,
    element: clr.element,
    shapes: formation.shapes,
  };
}

// ── De-Tetris-ified grid: 12 cols × 18 rows (vs Tetris 10×20) ──
export const COLS = 12;
export const ROWS = 18;
export const CELL = 30;
