// Division thresholds and utilities — Gems system
export type Division = 'gem_v' | 'gem_iv' | 'gem_iii' | 'gem_ii' | 'gem_i';

export const DIVISION_THRESHOLDS: { division: Division; minPoints: number }[] = [
  { division: 'gem_i', minPoints: 70001 },
  { division: 'gem_ii', minPoints: 35001 },
  { division: 'gem_iii', minPoints: 15001 },
  { division: 'gem_iv', minPoints: 5001 },
  { division: 'gem_v', minPoints: 0 },
];

export const DIVISION_LABELS: Record<Division, string> = {
  gem_v: 'Gem V',
  gem_iv: 'Gem IV',
  gem_iii: 'Gem III',
  gem_ii: 'Gem II',
  gem_i: 'Gem I',
};

export const DIVISION_COLORS: Record<Division, string> = {
  gem_v: '#ff3344',   // Red
  gem_iv: '#ffdd00',  // Yellow
  gem_iii: '#3388ff', // Blue
  gem_ii: '#aa44ff',  // Purple
  gem_i: '#66ffee',   // White/Cyan
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

// ISO week period string
export function getCurrentPeriod(): string {
  const now = new Date();
  const year = now.getFullYear();
  const oneJan = new Date(year, 0, 1);
  const days = Math.floor((now.getTime() - oneJan.getTime()) / 86400000);
  const week = Math.ceil((days + oneJan.getDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
}
