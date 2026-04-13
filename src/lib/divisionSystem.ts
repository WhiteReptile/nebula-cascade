/**
 * divisionSystem.ts — Player ranking tiers and rarity structure
 *
 * 5 divisions from lowest to highest:
 *   gem_v  → Division V   (Red)    — Common,     ~60% supply
 *   gem_iv → Division IV  (Yellow) — Uncommon,   ~25% supply
 *   gem_iii→ Division III (Blue)   — Rare,       ~10% supply
 *   gem_ii → Division II  (Purple) — Very Rare,  ~4% supply
 *   gem_i  → Division I   (Cyan)   — Super Rare, ~1% supply
 *
 * Divisions represent rarity only — not skill level.
 * Any player can own any division card.
 * Leaderboard rank must be earned through gameplay.
 * Supply percentages are estimates; the market determines final value.
 *
 * Period format: "YYYY-MM" (seasonal leaderboard cycles)
 */
export type Division = 'gem_v' | 'gem_iv' | 'gem_iii' | 'gem_ii' | 'gem_i';

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
  gem_i: '#66ffee',   // Cyan
};

export const DIVISION_PRIORITY: Record<Division, number> = {
  gem_v: 1,
  gem_iv: 2,
  gem_iii: 3,
  gem_ii: 4,
  gem_i: 5,
};

export const DIVISION_RARITY: Record<Division, { rarity: string; supplyPercent: string }> = {
  gem_i:   { rarity: 'Super Rare', supplyPercent: '~1%' },
  gem_ii:  { rarity: 'Very Rare',  supplyPercent: '~4%' },
  gem_iii: { rarity: 'Rare',       supplyPercent: '~10%' },
  gem_iv:  { rarity: 'Uncommon',   supplyPercent: '~25%' },
  gem_v:   { rarity: 'Common',     supplyPercent: '~60%' },
};

// Monthly period string (YYYY-MM)
export function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
