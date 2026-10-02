import { RANK_BANDS } from "@/lib/ranking";

export function ScoreScale() {
  return (
    <section className="w-full mt-16">
      <p className="label-white text-[10px] mb-6 text-center">How do we score</p>
      <div className="cosmic-glass overflow-hidden">
        <div className="hidden sm:grid grid-cols-[5.5rem_9rem_1fr] gap-4 px-5 py-3 border-b border-white/10">
          <span className="label-white text-[10px]">Score</span>
          <span className="label-white text-[10px]">Rank</span>
          <span className="label-white text-[10px]">Meaning</span>
        </div>
        {RANK_BANDS.map((band) => (
          <div
            key={`${band.min}-${band.max}`}
            className="grid sm:grid-cols-[5.5rem_9rem_1fr] gap-1 sm:gap-4 px-5 py-3.5 border-b border-white/10 last:border-b-0"
          >
            <span className={`tabular-nums text-sm ${`score-tone-${band.tone}`}`}>
              {band.min === band.max ? band.max : `${band.min}–${band.max}`}
            </span>
            <span className={`text-sm ${`score-tone-${band.tone}`}`}>{band.rank}</span>
            <span className="text-dynamic text-sm leading-relaxed">{band.meaning}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
