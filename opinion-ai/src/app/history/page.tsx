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
      <h1 className="cosmic-title text-xl font-light mb-10">History</h1>

      {entries.length === 0 ? (
        <p className="text-dynamic text-sm">
          No evaluations yet.{" "}
          <Link href="/submit" className="nav-white">
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
                  <p className="text-dynamic text-sm mt-1 line-clamp-1">{entry.verdictPreview}</p>
                  <p className="label-white text-[10px] mt-2">{entry.categoryLabel}</p>
                </div>
                <time className="text-dynamic text-xs shrink-0">
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
