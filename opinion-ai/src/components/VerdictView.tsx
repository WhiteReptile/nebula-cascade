import type { Verdict } from "@/lib/types";
import { scoreClass } from "@/lib/score-style";
import { WhyPanel } from "./WhyPanel";
import { VerdictActions } from "./VerdictActions";

export function VerdictView({ verdict, showActions = true }: { verdict: Verdict; showActions?: boolean }) {
  return (
    <article className="max-w-xl mx-auto w-full">
      <div className="cosmic-glass p-8 mb-8 text-center">
        <p className="label-white text-[10px] mb-4">{verdict.categoryLabel}</p>
        <div className={`text-8xl font-extralight tabular-nums ${scoreClass(verdict.score)}`}>
          {verdict.score}
        </div>
        <p className="text-dynamic mt-3 text-sm">{verdict.scoreContext}</p>
        <p className="text-dynamic mt-2 text-xs">Confidence {verdict.confidence}%</p>
      </div>

      <p className="text-dynamic text-base leading-relaxed mb-10 px-1">{verdict.verdict}</p>

      <div className="grid gap-6 sm:grid-cols-2 mb-10">
        <GlassBlock title="Strengths" items={verdict.strengths} />
        <GlassBlock title="Weaknesses" items={verdict.weaknesses} />
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
          <p className="label-white text-[10px] mb-2">Biggest problem</p>
          <p className="text-dynamic leading-relaxed">{verdict.biggestProblem}</p>
        </div>
        <div className="cosmic-glass p-5">
          <p className="label-white text-[10px] mb-2">Biggest opportunity</p>
          <p className="text-dynamic leading-relaxed">{verdict.biggestOpportunity}</p>
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

function DimRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="label-white text-[10px]">{label}</span>
      <p className="text-dynamic mt-1">{value}</p>
    </div>
  );
}
