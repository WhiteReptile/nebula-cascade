// Energy Orb formations — 5 elements: Fire(Red), Water(Blue), Electricity(Yellow), Shadow(Grey), Void(Black)
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

// All formations are fully connected (each orb adjacent to at least one other), minimum 3 orbs
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
    name: 'Flat Four',
    shapes: [
      [[0,0],[0,1],[0,2],[0,3]],
      [[0,0],[1,0],[2,0],[3,0]],
      [[0,0],[0,1],[0,2],[0,3]],
      [[0,0],[1,0],[2,0],[3,0]],
    ],
  },
  {
    name: 'Soft L',
    shapes: [
      [[0,0],[1,0],[2,0],[2,1]],
      [[0,0],[0,1],[0,2],[1,0]],
      [[0,0],[0,1],[1,1],[2,1]],
      [[0,0],[0,1],[0,2],[1,2]],
    ],
  },
  {
    name: 'Compact Cluster',
    shapes: [
      [[0,0],[0,1],[1,0],[1,1]],
      [[0,0],[0,1],[1,0],[1,1]],
      [[0,0],[0,1],[1,0],[1,1]],
      [[0,0],[0,1],[1,0],[1,1]],
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

// Color bias: 30% more likely to repeat recent color
let lastColorIndex = -1;

export function randomOrbPiece(): PieceDef {
  const formation = FORMATIONS[Math.floor(Math.random() * FORMATIONS.length)];

  let colorIdx: number;
  if (lastColorIndex >= 0 && Math.random() < 0.35) {
    // 35% chance to repeat last color (reduced from 45% — more variety with 5 colors)
    colorIdx = lastColorIndex;
  } else {
    colorIdx = Math.floor(Math.random() * COLORS.length);
  }
  lastColorIndex = colorIdx;
  const clr = COLORS[colorIdx];

  return {
    name: formation.name,
    color: clr.color,
    colorCSS: clr.colorCSS,
    element: clr.element,
    shapes: formation.shapes,
  };
}

export const COLS = 10;
export const ROWS = 20;
export const CELL = 30;
