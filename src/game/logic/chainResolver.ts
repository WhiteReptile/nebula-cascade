import { COLS, ROWS, COLORS } from '../pieces';
import type { OrbState } from '../types';

export function getChainMultiplier(step: number): number {
  if (step <= 1) return 1;
  if (step === 2) return 1.2;
  return Math.min(1.4, 1 + step * 0.15);
}

// ── Proximity Burst: 5+ same-color adjacent cluster (flood-fill) ──
export function findProximityBurst(grid: (OrbState | null)[][]): { cells: [number, number][]; color: number } | null {
  const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (visited[r][c] || !grid[r][c]) continue;
      const color = grid[r][c]!.color;
      const cluster: [number, number][] = [];
      const queue: [number, number][] = [[r, c]];
      visited[r][c] = true;
      while (queue.length > 0) {
        const [cr, cc] = queue.shift()!;
        cluster.push([cr, cc]);
        for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]] as [number, number][]) {
          const nr = cr + dr, nc = cc + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited[nr][nc] && grid[nr][nc]?.color === color) {
            visited[nr][nc] = true;
            queue.push([nr, nc]);
          }
        }
      }
      if (cluster.length >= 10) {
        return { cells: cluster, color };
      }
    }
  }
  return null;
}

// ── Elemental Cascade: on chain 3+, if same element repeats, destroy a column ──
export function findElementalCascade(
  grid: (OrbState | null)[][],
  chainStep: number,
  lastChainElement: string | null,
  currentElement: string,
): { column: number; cells: [number, number][] } | null {
  if (chainStep < 3 || !lastChainElement || lastChainElement !== currentElement) return null;
  // Find the column with the most orbs of this element
  let bestCol = -1, bestCount = 0;
  for (let c = 0; c < COLS; c++) {
    let count = 0;
    for (let r = 0; r < ROWS; r++) {
      if (grid[r][c]) count++;
    }
    if (count > bestCount) { bestCount = count; bestCol = c; }
  }
  if (bestCol < 0 || bestCount === 0) return null;
  const cells: [number, number][] = [];
  for (let r = 0; r < ROWS; r++) {
    if (grid[r][bestCol]) cells.push([r, bestCol]);
  }
  return { column: bestCol, cells };
}

// ── Gravity Crush: push nearby same-color orbs down 1 row after force drop ──
export function applyGravityCrush(
  grid: (OrbState | null)[][],
  placedCells: [number, number][],
  color: number,
): [number, number][] {
  const pushed: [number, number][] = [];
  const visited = new Set<string>();
  for (const [pr, pc] of placedCells) {
    for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]] as [number, number][]) {
      const nr = pr + dr, nc = pc + dc;
      const key = `${nr},${nc}`;
      if (nr >= 0 && nr < ROWS - 1 && nc >= 0 && nc < COLS && !visited.has(key)) {
        visited.add(key);
        const orb = grid[nr][nc];
        if (orb && orb.color === color && nr + 1 < ROWS && !grid[nr + 1][nc]) {
          grid[nr + 1][nc] = orb;
          grid[nr][nc] = null;
          orb.landBounce = -3;
          orb.landBounceVel = 0;
          pushed.push([nr + 1, nc]);
        }
      }
    }
  }
  return pushed;
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
      if (sameColorRun.length >= 4) rowsToDestroy.push(...sameColorRun);
      k = end;
    }
    i = j + 1;
  }

  if (rowsToDestroy.length === 0) return null;
  const totalCombo = combo + rowsToDestroy.length;
  return { rows: rowsToDestroy, cosmicWipe: totalCombo >= 5 };
}

// ── Near-miss detection: find orbs 1 away from a match ──
export function findNearMissOrbs(grid: (OrbState | null)[][]): [number, number][] {
  const hints: [number, number][] = [];
  const added = new Set<string>();

  // Check horizontal runs of 2 same-color with empty neighbor
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 1; c++) {
      const a = grid[r][c], b = grid[r][c + 1];
      if (a && b && a.color === b.color) {
        // Check if extending left or right would make 3+
        for (const nc of [c - 1, c + 2]) {
          if (nc >= 0 && nc < COLS && grid[r][nc] && grid[r][nc]!.color === a.color) {
            for (const col of [c, c + 1, nc]) {
              const key = `${r},${col}`;
              if (!added.has(key)) { added.add(key); hints.push([r, col]); }
            }
          }
        }
      }
    }
  }
  // Check vertical runs of 2
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 1; r++) {
      const a = grid[r][c], b = grid[r + 1][c];
      if (a && b && a.color === b.color) {
        for (const nr of [r - 1, r + 2]) {
          if (nr >= 0 && nr < ROWS && grid[nr][c] && grid[nr][c]!.color === a.color) {
            for (const row of [r, r + 1, nr]) {
              const key = `${row},${c}`;
              if (!added.has(key)) { added.add(key); hints.push([row, c]); }
            }
          }
        }
      }
    }
  }
  return hints;
}
