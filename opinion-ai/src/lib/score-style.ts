export function scoreClass(score: number): string {
  if (score >= 80) return "score-glow-high";
  if (score >= 60) return "score-glow-mid";
  return "score-glow-low";
}
