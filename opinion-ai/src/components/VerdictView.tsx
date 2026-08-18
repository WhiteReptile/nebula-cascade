import type { Verdict } from "@/lib/types";
import { getRank, scoreClass } from "@/lib/ranking";
import { VerdictActions } from "./VerdictActions";

export function VerdictView({ verdict, showActions = true }: { verdict: Verdict; showActions?: boolean }) {
  const hasStrengths = verdict.strengths.length > 0;
  const hasWeaknesses = verdict.weaknesses.length > 0;
  const rank = getRank(verdict.score);

  return (
    <article className="max-w-xl mx-auto w-full">
      <div className="cosmic-glass p-8 mb-8 text-center">
        <p className="label-white text-[10px] mb-4">{verdict.categoryLabel}</p>
        <div className={`text-8xl font-extralight tabular-nums ${scoreClass(verdict.score)}`}>
          {verdict.score}
        </div>
        <p className={`text-[10px] tracking-[0.22em] uppercase mt-4 ${scoreClass(verdict.score)}`}>
          {rank.rank}
        </p>
        <p className="text-dynamic mt-2 text-sm">{rank.meaning}</p>
      </div>

      <p className="text-dynamic text-base leading-relaxed mb-10 px-1">{verdict.verdict}</p>

      {(hasStrengths || hasWeaknesses) && (
        <div className={`grid gap-6 mb-10 ${hasStrengths && hasWeaknesses ? "sm:grid-cols-2" : ""}`}>
          {hasStrengths && <GlassBlock title="Strengths" items={verdict.strengths} />}
          {hasWeaknesses && <GlassBlock title="Weaknesses" items={verdict.weaknesses} />}
        </div>
      )}

      {showActions && (
        <VerdictActions
          verdictId={verdict.id}
          shareText={`Opinion.ai: ${verdict.score}/100 — ${verdict.verdict}`}
        />
      )}
    </article>
  );
}

function GlassBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="cosmic-glass p-5">
      <h2 className="label-white text-[10px] mb-3">{title}</h2>
      <ul className="space-y-2 text-sm">
        {items.map((s, i) => (
          <li key={i} className="text-dynamic">{s}</li>
        ))}
      </ul>
    </div>
  );
}
