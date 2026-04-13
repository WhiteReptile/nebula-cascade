/**
 * divisionSystem.ts — Player ranking tiers and reward structure
 *
 * 5 divisions from lowest to highest:
 *   gem_v  (0+ pts)     → Division V   (Red)
 *   gem_iv (5,001+ pts) → Division IV  (Yellow)
 *   gem_iii(15,001+ pts)→ Division III (Blue)
 *   gem_ii (35,001+ pts)→ Division II  (Purple)
 *   gem_i  (70,001+ pts)→ Division I   (Cyan)
 *
 * Division determines:
 *   - Leaderboard tier grouping
 *   - Reward payout caps (REWARD_TIERS)
 *   - Visual badge color in UI
 *
 * Period format: "YYYY-MM" (monthly leaderboard seasons)
 */
export type Division = 'gem_v' | 'gem_iv' | 'gem_iii' | 'gem_ii' | 'gem_i';

export const DIVISION_THRESHOLDS: { division: Division; minPoints: number }[] = [
  { division: 'gem_i', minPoints: 70001 },
  { division: 'gem_ii', minPoints: 35001 },
  { division: 'gem_iii', minPoints: 15001 },
  { division: 'gem_iv', minPoints: 5001 },
  { division: 'gem_v', minPoints: 0 },
];

export const DIVISION_LABELS: Record<Division, string> = {
  gem_v: 'Division V',
  gem_iv: 'Division IV',
  gem_iii: 'Division III',
  gem_ii: 'Division II',
  gem_i: 'Division I',
};

export const DIVISION_COLORS: Record<Division, string> = {
  gem_v: '#ff3344',   // Red
  gem_iv: '#ffdd00',  // Yellow
  gem_iii: '#3388ff', // Blue
  gem_ii: '#aa44ff',  // Purple
  gem_i: '#66ffee',   // White/Cyan
};

export const DIVISION_PRIORITY: Record<Division, number> = {
  gem_v: 1,
  gem_iv: 2,
  gem_iii: 3,
  gem_ii: 4,
  gem_i: 5,
};

export function getDivisionForPoints(points: number): Division {
  for (const { division, minPoints } of DIVISION_THRESHOLDS) {
    if (points >= minPoints) return division;
  }
  return 'gem_v';
}

export function getNextDivisionThreshold(currentDivision: Division): number | null {
  const idx = DIVISION_THRESHOLDS.findIndex(d => d.division === currentDivision);
  if (idx <= 0) return null;
  return DIVISION_THRESHOLDS[idx - 1].minPoints;
}

// Reward caps per division (cents)
export const REWARD_TIERS: Record<Division, number[]> = {
  gem_i:   [5000, 3000, 2000, 1500, 1000],
  gem_ii:  [3000, 2000, 1500, 1000, 500],
  gem_iii: [2000, 1500, 1000, 500, 300],
  gem_iv:  [1500, 1000, 500, 300, 200],
  gem_v:   [1000, 500, 300, 200, 100],
};

// Monthly period string (YYYY-MM)
export function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
