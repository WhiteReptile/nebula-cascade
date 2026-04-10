// Division thresholds and utilities
export type Division = 'pearl_v' | 'pearl_iv' | 'pearl_iii' | 'pearl_ii' | 'pearl_i';

export const DIVISION_THRESHOLDS: { division: Division; minPoints: number }[] = [
  { division: 'pearl_i', minPoints: 70001 },
  { division: 'pearl_ii', minPoints: 35001 },
  { division: 'pearl_iii', minPoints: 15001 },
  { division: 'pearl_iv', minPoints: 5001 },
  { division: 'pearl_v', minPoints: 0 },
];

export const DIVISION_LABELS: Record<Division, string> = {
  pearl_v: 'Pearl V',
  pearl_iv: 'Pearl IV',
  pearl_iii: 'Pearl III',
  pearl_ii: 'Pearl II',
  pearl_i: 'Pearl I',
};

export const DIVISION_COLORS: Record<Division, string> = {
  pearl_v: '#888899',
  pearl_iv: '#3388ff',
  pearl_iii: '#ffdd00',
  pearl_ii: '#ff3344',
  pearl_i: '#e8c07a',
};

export function getDivisionForPoints(points: number): Division {
  for (const { division, minPoints } of DIVISION_THRESHOLDS) {
    if (points >= minPoints) return division;
  }
  return 'pearl_v';
}

export function getNextDivisionThreshold(currentDivision: Division): number | null {
  const idx = DIVISION_THRESHOLDS.findIndex(d => d.division === currentDivision);
  if (idx <= 0) return null; // already at Pearl I
  return DIVISION_THRESHOLDS[idx - 1].minPoints;
}

// Reward caps per division (cents)
export const REWARD_TIERS: Record<Division, number[]> = {
  pearl_i:   [5000, 3000, 2000, 1500, 1000], // top 5 payouts
  pearl_ii:  [3000, 2000, 1500, 1000, 500],
  pearl_iii: [2000, 1500, 1000, 500, 300],
  pearl_iv:  [1500, 1000, 500, 300, 200],
  pearl_v:   [1000, 500, 300, 200, 100],
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
