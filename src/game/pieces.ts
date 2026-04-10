// Original geometric shapes — NOT tetrominoes
export interface PieceDef {
  name: string;
  color: number;      // hex tint
  colorCSS: string;   // for HUD
  shapes: number[][][]; // rotation states, each is array of [row,col] offsets from pivot
}

export const PIECES: PieceDef[] = [
  {
    name: 'L-Hook',
    color: 0x00ffff,
    colorCSS: '#00ffff',
    shapes: [
      [[0,0],[1,0],[2,0],[2,1]],
      [[0,0],[0,1],[0,2],[1,0]],
      [[0,0],[0,1],[1,1],[2,1]],
      [[0,2],[1,0],[1,1],[1,2]],
    ],
  },
  {
    name: 'Z-Wave',
    color: 0xff00ff,
    colorCSS: '#ff00ff',
    shapes: [
      [[0,0],[0,1],[1,1],[1,2]],
      [[0,1],[1,0],[1,1],[2,0]],
      [[0,0],[0,1],[1,1],[1,2]],
      [[0,1],[1,0],[1,1],[2,0]],
    ],
  },
  {
    name: 'T-Cross',
    color: 0x00ff88,
    colorCSS: '#00ff88',
    shapes: [
      [[0,1],[1,0],[1,1],[1,2]],
      [[0,0],[1,0],[1,1],[2,0]],
      [[0,0],[0,1],[0,2],[1,1]],
      [[0,1],[1,0],[1,1],[2,1]],
    ],
  },
  {
    name: 'Diamond',
    color: 0xff8800,
    colorCSS: '#ff8800',
    shapes: [
      [[0,1],[1,0],[1,2],[2,1]],
      [[0,1],[1,0],[1,2],[2,1]],
      [[0,1],[1,0],[1,2],[2,1]],
      [[0,1],[1,0],[1,2],[2,1]],
    ],
  },
  {
    name: 'Arrow',
    color: 0xaa55ff,
    colorCSS: '#aa55ff',
    shapes: [
      [[0,1],[1,0],[1,1],[2,1]],
      [[0,1],[1,1],[1,2],[2,1]],
      [[0,0],[1,0],[1,1],[2,0]],
      [[0,1],[1,0],[1,1],[2,1]],
    ],
  },
  {
    name: 'Bar-3',
    color: 0xffdd00,
    colorCSS: '#ffdd00',
    shapes: [
      [[0,0],[0,1],[0,2]],
      [[0,0],[1,0],[2,0]],
      [[0,0],[0,1],[0,2]],
      [[0,0],[1,0],[2,0]],
    ],
  },
];

export const COLS = 10;
export const ROWS = 20;
export const CELL = 30;
