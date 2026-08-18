import type { Verdict } from "@/lib/types";
import { scoreClass } from "@/lib/score-style";
import { WhyPanel } from "./WhyPanel";
import { VerdictActions } from "./VerdictActions";

export function VerdictView({ verdict, showActions = true }: { verdict: Verdict; showActions?: boolean }) {
  return (
    <article className="max-w-xl mx-auto w-full">
      <div className="cosmic-glass p-8 mb-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-violet-300/50 mb-4">
          {verdict.categoryLabel}
        </p>
        <div className={`text-8xl font-extralight tabular-nums ${scoreClass(verdict.score)}`}>
          {verdict.score}
        </div>
        <p className="mt-3 text-sm text-violet-200/50">{verdict.scoreContext}</p>
        <p className="mt-2 text-xs text-violet-300/35">Confidence {verdict.confidence}%</p>
      </div>

      <p className="text-base leading-relaxed text-violet-50/85 mb-10 px-1">{verdict.verdict}</p>

      <div className="grid gap-6 sm:grid-cols-2 mb-10">
        <GlassBlock title="Strengths" items={verdict.strengths} accent="cyan" />
        <GlassBlock title="Weaknesses" items={verdict.weaknesses} accent="violet" />
      </div>

      <div className="cosmic-glass p-6 space-y-5 text-sm mb-10">
        <DimRow label="Originality" value={verdict.originality} />
        <DimRow label="Execution" value={verdict.execution} />
        <DimRow label="Appeal" value={verdict.appeal} />
        <DimRow label="Competition" value={verdict.competition} />
        <DimRow label="Potential" value={verdict.potential} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mb-10 text-sm">
        <div className="cosmic-glass p-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-fuchsia-300/50 mb-2">Biggest problem</p>
          <p className="text-violet-100/70 leading-relaxed">{verdict.biggestProblem}</p>
        </div>
        <div className="cosmic-glass p-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#66ffee]/50 mb-2">Biggest opportunity</p>
          <p className="text-violet-100/70 leading-relaxed">{verdict.biggestOpportunity}</p>
        </div>
      </div>

      <WhyPanel analyst={verdict.analyst} steelman={verdict.steelman} />

      {showActions && (
        <VerdictActions
          verdictId={verdict.id}
          shareText={`Opinion.ai: ${verdict.score}/100 — ${verdict.verdict}`}
        />
      )}
    </article>
  );
}

function GlassBlock({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent: "cyan" | "violet";
}) {
  const labelColor = accent === "cyan" ? "text-[#66ffee]/50" : "text-violet-300/50";
  return (
    <div className="cosmic-glass p-5">
      <h2 className={`text-[10px] uppercase tracking-[0.25em] ${labelColor} mb-3`}>{title}</h2>
      <ul className="space-y-2 text-sm text-violet-100/65">
        {items.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </div>
  );
}

function DimRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[10px] uppercase tracking-[0.2em] text-violet-300/40">{label}</span>
      <p className="mt-1 text-violet-100/65">{value}</p>
    </div>
  );
}
