import { COLS, ROWS } from '../pieces';
import type { OrbState } from '../types';

/** Reorganize destroyed cells — redistribute orbs into small formations */
export function reorganizeOrbs(
  grid: (OrbState | null)[][],
  destroyedCells: [number, number][],
  color: number,
): [number, number][] {
  for (const [r, c] of destroyedCells) {
    grid[r][c] = null;
  }

  let remaining = 16;
  const smallShapes: [number, number][][] = [
    [[0,0],[0,1]],
    [[0,0],[1,0]],
    [[0,0],[0,1],[1,0]],
    [[0,0],[0,1],[0,2]],
    [[0,0],[1,0],[2,0]],
    [[0,0],[0,1],[1,1]],
  ];

  let minCol = COLS, maxCol = 0;
  for (const [, c] of destroyedCells) {
    if (c < minCol) minCol = c;
    if (c > maxCol) maxCol = c;
  }

  const placedCells: [number, number][] = [];
  let attempts = 0;
  while (remaining > 0 && attempts < 100) {
    attempts++;
    const shape = smallShapes[Math.floor(Math.random() * smallShapes.length)];
    if (shape.length > remaining) continue;

    const tryCol = minCol + Math.floor(Math.random() * (maxCol - minCol + 3)) - 1;
    const tryRow = Math.floor(Math.random() * ROWS);

    let fits = true;
    const positions: [number, number][] = [];
    for (const [dr, dc] of shape) {
      const nr = tryRow + dr;
      const nc = tryCol + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || grid[nr][nc] !== null) {
        fits = false;
        break;
      }
      positions.push([nr, nc]);
    }

    if (fits) {
      for (const [pr, pc] of positions) {
        grid[pr][pc] = {
          color,
          wobblePhase: Math.random() * Math.PI * 2,
          wobbleAmp: 3 + Math.random() * 2,
          glowPulse: Math.random() * Math.PI * 2,
          landBounce: -4 - Math.random() * 3,
          landBounceVel: 0,
        };
        placedCells.push([pr, pc]);
        remaining--;
      }
    }
  }

  return placedCells;
}

/** Pull all orbs down to fill gaps */
export function gravityCollapse(grid: (OrbState | null)[][]) {
  for (let c = 0; c < COLS; c++) {
    let writeRow = ROWS - 1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (grid[r][c] !== null) {
        if (r !== writeRow) {
          grid[writeRow][c] = grid[r][c];
          grid[r][c] = null;
          grid[writeRow][c]!.landBounce = -3 - Math.random() * 2;
          grid[writeRow][c]!.landBounceVel = 0;
        }
        writeRow--;
      }
    }
  }
}
