export type RankBand = {
  min: number;
  max: number;
  rank: string;
  meaning: string;
  tone: string;
};

export const RANK_BANDS: RankBand[] = [
  { min: 0, max: 19, rank: "Catastrophic", meaning: "Fundamentally broken", tone: "catastrophic" },
  { min: 20, max: 29, rank: "Terrible", meaning: "Major problems; difficult to recommend", tone: "terrible" },
  { min: 30, max: 39, rank: "Very Weak", meaning: "More wrong than right", tone: "bad" },
  { min: 40, max: 49, rank: "Weak", meaning: "Some merit, but clearly below average", tone: "weak" },
  { min: 50, max: 57, rank: "Below Average", meaning: "Functional, but unimpressive", tone: "low" },
  { min: 58, max: 64, rank: "Mediocre", meaning: "Decent foundation, nothing remarkable", tone: "mid" },
  { min: 65, max: 69, rank: "Mediocre+", meaning: "Clearly has merit, still ordinary", tone: "midplus" },
  { min: 70, max: 74, rank: "Good", meaning: "Above average, but not exceptional", tone: "good" },
  { min: 75, max: 79, rank: "Very Good", meaning: "Noticeably strong", tone: "high" },
  { min: 80, max: 84, rank: "Excellent", meaning: "High-quality and compelling", tone: "high" },
  { min: 85, max: 89, rank: "Outstanding", meaning: "Exceptional compared with alternatives", tone: "violet" },
  { min: 90, max: 94, rank: "Exceptional", meaning: "Rare quality", tone: "violet" },
  { min: 95, max: 99, rank: "Extraordinary", meaning: "Extremely difficult to improve", tone: "gold" },
  { min: 100, max: 100, rank: "Near-Perfect", meaning: "Virtually no meaningful weaknesses", tone: "gold" },
];

export function getRank(score: number): RankBand {
  const s = Math.min(100, Math.max(0, Math.round(score)));
  return RANK_BANDS.find((band) => s >= band.min && s <= band.max) ?? RANK_BANDS[0];
}

export function scoreClass(score: number): string {
  return `score-tone-${getRank(score).tone}`;
}

export function rankingGuide(): string {
  return RANK_BANDS.map((band) => {
    const range = band.min === band.max ? `${band.max}` : `${band.min}–${band.max}`;
    return `${range} ${band.rank} — ${band.meaning}`;
  }).join("\n");
}
