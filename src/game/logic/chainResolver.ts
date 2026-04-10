import { COLS, ROWS, COLORS } from '../pieces';
import type { OrbState } from '../types';

export function getChainMultiplier(step: number): number {
  if (step <= 1) return 1;
  if (step === 2) return 1.2;
  return Math.min(1.4, 1 + step * 0.15);
}

export function findBlockMatch(grid: (OrbState | null)[][]): { cells: [number, number][]; color: number } | null {
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const refOrb = grid[r][c];
      if (!refOrb) continue;
      const color = refOrb.color;
      let allMatch = true;
      for (let dr = 0; dr < 4 && allMatch; dr++) {
        for (let dc = 0; dc < 4 && allMatch; dc++) {
          const orb = grid[r + dr][c + dc];
          if (!orb || orb.color !== color) allMatch = false;
        }
      }
      if (allMatch) {
        const cells: [number, number][] = [];
        for (let dr = 0; dr < 4; dr++) {
          for (let dc = 0; dc < 4; dc++) {
            cells.push([r + dr, c + dc]);
          }
        }
        return { cells, color };
      }
    }
  }
  return null;
}

function mode(arr: number[]): number | null {
  const freq: Record<number, number> = {};
  let max = 0; let best: number | null = null;
  for (const v of arr) {
    freq[v] = (freq[v] || 0) + 1;
    if (freq[v] > max) { max = freq[v]; best = v; }
  }
  return best;
}

export function findTriColorMatch(grid: (OrbState | null)[][]): { cells: [number, number][]; dominantColor: number } | null {
  const allColors = COLORS.map(c => c.color);

  // Strategy 1: 3 consecutive full rows with different dominant colors
  const fullRows: number[] = [];
  for (let r = 0; r < ROWS; r++) {
    if (grid[r].every(c => c !== null)) fullRows.push(r);
  }
  for (let i = 0; i < fullRows.length - 2; i++) {
    if (fullRows[i + 1] !== fullRows[i] + 1 || fullRows[i + 2] !== fullRows[i] + 2) continue;
    const rows3 = [fullRows[i], fullRows[i + 1], fullRows[i + 2]];
    const dominants = rows3.map(r => {
      const colors = grid[r].map(c => c!.color);
      return mode(colors)!;
    });
    const uniqueDominants = new Set(dominants);
    if (uniqueDominants.size === 3) {
      const allCellColors = new Set<number>();
      const cells: [number, number][] = [];
      for (const r of rows3) {
        for (let c = 0; c < COLS; c++) {
          cells.push([r, c]);
          allCellColors.add(grid[r][c]!.color);
        }
      }
      if (allCellColors.size >= 4) {
        return { cells, dominantColor: allColors[0] };
      }
    }
  }

  // Strategy 2: connected cluster of 30+ orbs with all 5 colors (6+ each)
  const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (visited[r][c] || !grid[r][c]) continue;
      const queue: [number, number][] = [[r, c]];
      const cluster: [number, number][] = [];
      const colorSet = new Set<number>();
      visited[r][c] = true;
      while (queue.length > 0) {
        const [cr, cc] = queue.shift()!;
        cluster.push([cr, cc]);
        colorSet.add(grid[cr][cc]!.color);
        for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]] as [number,number][]) {
          const nr = cr + dr, nc = cc + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited[nr][nc] && grid[nr][nc]) {
            visited[nr][nc] = true;
            queue.push([nr, nc]);
          }
        }
      }
      const colorCounts = new Map<number, number>();
      for (const [cr2, cc2] of cluster) {
        const clr = grid[cr2][cc2]!.color;
        colorCounts.set(clr, (colorCounts.get(clr) || 0) + 1);
      }
      if (cluster.length >= 30 && colorSet.size >= 5 && allColors.every(clr => (colorCounts.get(clr) || 0) >= 6)) {
        return { cells: cluster, dominantColor: allColors[0] };
      }
    }
  }
  return null;
}

export function findLineMatch(grid: (OrbState | null)[][], combo: number): { rows: number[]; cosmicWipe: boolean } | null {
  const fullRows: number[] = [];
  for (let r = 0; r < ROWS; r++) {
    if (grid[r].every(c => c !== null)) fullRows.push(r);
  }
  if (fullRows.length === 0) return null;

  const rowDominant = (row: number): number => {
    const colors = grid[row].filter(c => c !== null).map(c => c!.color);
    return mode(colors) || 0;
  };

  const rowsToDestroy: number[] = [];
  let i = 0;
  while (i < fullRows.length) {
    let j = i;
    while (j + 1 < fullRows.length && fullRows[j + 1] === fullRows[j] + 1) j++;
    const run = fullRows.slice(i, j + 1);
    let k = 0;
    while (k < run.length) {
      const clr = rowDominant(run[k]);
      let end = k + 1;
      while (end < run.length && rowDominant(run[end]) === clr) end++;
      const sameColorRun = run.slice(k, end);
      if (sameColorRun.length >= 3) rowsToDestroy.push(...sameColorRun);
      k = end;
    }
    i = j + 1;
  }

  if (rowsToDestroy.length === 0) return null;
  const totalCombo = combo + rowsToDestroy.length;
  return { rows: rowsToDestroy, cosmicWipe: totalCombo >= 5 };
}
