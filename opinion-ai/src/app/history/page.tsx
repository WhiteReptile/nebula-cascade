"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getHistory } from "@/lib/storage";
import { scoreClass } from "@/lib/score-style";
import type { HistoryEntry } from "@/lib/types";

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setEntries(getHistory());
  }, []);

  return (
    <div className="px-6 py-16 sm:py-20 max-w-xl mx-auto w-full">
      <h1 className="cosmic-title text-xl font-light tracking-wide mb-10">History</h1>

      {entries.length === 0 ? (
        <p className="text-sm text-violet-200/45">
          No evaluations yet.{" "}
          <Link href="/submit" className="text-[#66ffee]/70 hover:text-[#66ffee]">
            Submit something
          </Link>
        </p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.id}>
              <Link
                href={`/result/${entry.id}`}
                className="cosmic-glass flex items-baseline justify-between gap-4 p-5 transition-all duration-300"
              >
                <div>
                  <span className={`text-3xl font-light tabular-nums ${scoreClass(entry.score)}`}>
                    {entry.score}
                  </span>
                  <p className="text-sm text-violet-100/55 mt-1 line-clamp-1">{entry.verdictPreview}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-violet-300/35 mt-2">
                    {entry.categoryLabel}
                  </p>
                </div>
                <time className="text-xs text-violet-300/30 shrink-0">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
