import Link from "next/link";
import type { Verdict } from "@/lib/types";
import { getRank, scoreClass } from "@/lib/ranking";

export function ExampleCard({ verdict }: { verdict: Verdict }) {
  const rank = getRank(verdict.score);

  return (
    <Link
      href={`/result/${verdict.id}?example=1`}
      className="cosmic-glass group block p-6 transition-all duration-300"
    >
      <span className={`text-4xl font-light tabular-nums ${scoreClass(verdict.score)}`}>
        {verdict.score}
      </span>
      <p className={`text-[10px] tracking-[0.22em] uppercase mt-3 ${scoreClass(verdict.score)}`}>
        {rank.rank}
      </p>
      <p className="text-dynamic text-xs mt-1 leading-relaxed">{rank.meaning}</p>
      <p className="label-white text-[10px] mt-4">{verdict.categoryLabel}</p>
      <p className="text-dynamic mt-3 text-sm leading-relaxed line-clamp-3">{verdict.verdict}</p>
    </Link>
  );
}
