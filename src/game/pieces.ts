// Energy Orb formations — 3 colors only: Yellow, Red, Blue
export interface PieceDef {
  name: string;
  color: number;      // hex tint
  colorCSS: string;   // for HUD
  shapes: [number, number][][]; // rotation states, each is array of [row,col] offsets from pivot
}

const COLORS = [
  { color: 0xffdd00, colorCSS: '#ffdd00' }, // Yellow
  { color: 0xff3344, colorCSS: '#ff3344' }, // Red
  { color: 0x3388ff, colorCSS: '#3388ff' }, // Blue
];

// 7 orb formations
const FORMATIONS: { name: string; shapes: number[][][][] }[] = [
  {
    name: 'Single Orb',
    shapes: [
      [[0,0]],
      [[0,0]],
      [[0,0]],
      [[0,0]],
    ],
  },
  {
    name: 'Double Orb',
    shapes: [
      [[0,0],[0,1]],
      [[0,0],[1,0]],
      [[0,0],[0,1]],
      [[0,0],[1,0]],
    ],
  },
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
      [[0,0],[1,0],[1,1]],
      [[0,0],[1,0],[1,1]],  // mirrored via rotation
      [[0,0],[0,1],[1,0]],
    ],
  },
  {
    name: 'Split Pair',
    shapes: [
      [[0,0],[0,2]],
      [[0,0],[2,0]],
      [[0,0],[0,2]],
      [[0,0],[2,0]],
    ],
  },
  {
    name: 'Mini Cluster',
    shapes: [
      [[0,1],[1,0],[1,2],[2,1]],  // diamond
      [[0,1],[1,0],[1,2],[2,1]],
      [[0,1],[1,0],[1,2],[2,1]],
      [[0,1],[1,0],[1,2],[2,1]],
    ],
  },
  {
    name: 'Broken Cross',
    shapes: [
      [[0,1],[1,0],[1,1],[2,1]],  // missing right
      [[0,0],[0,1],[1,1],[0,2]],  // missing bottom
      [[0,0],[1,0],[1,1],[2,0]],  // missing left
      [[1,0],[1,1],[1,2],[0,1]],  // top
    ],
  },
];

// Generate all piece defs: each formation × each color = 21 possible pieces
// At spawn time we pick a random formation + random color
export const FORMATIONS_LIST = FORMATIONS;
export const COLORS_LIST = COLORS;

// For backward compat, export a flat PIECES array (one per formation, default yellow)
export const PIECES: PieceDef[] = FORMATIONS.map(f => ({
  name: f.name,
  color: COLORS[0].color,
  colorCSS: COLORS[0].colorCSS,
  shapes: f.shapes,
}));

export function randomOrbPiece(): PieceDef {
  const formation = FORMATIONS[Math.floor(Math.random() * FORMATIONS.length)];
  const clr = COLORS[Math.floor(Math.random() * COLORS.length)];
  return {
    name: formation.name,
    color: clr.color,
    colorCSS: clr.colorCSS,
    shapes: formation.shapes,
  };
}

export const COLS = 10;
export const ROWS = 20;
export const CELL = 30;
