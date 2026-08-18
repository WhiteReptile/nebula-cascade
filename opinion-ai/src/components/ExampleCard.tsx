import Link from "next/link";
import type { Verdict } from "@/lib/types";
import { scoreClass } from "@/lib/score-style";

export function ExampleCard({ verdict }: { verdict: Verdict }) {
  return (
    <Link
      href={`/result/${verdict.id}?example=1`}
      className="cosmic-glass group block p-6 transition-all duration-300"
    >
      <div className="flex items-baseline justify-between gap-4">
        <span className={`text-4xl font-light tabular-nums ${scoreClass(verdict.score)}`}>
          {verdict.score}
        </span>
        <span className="label-white text-[10px]">{verdict.categoryLabel}</span>
      </div>
      <p className="text-dynamic mt-4 text-sm leading-relaxed line-clamp-2">
        {verdict.verdict}
      </p>
    </Link>
  );
}
