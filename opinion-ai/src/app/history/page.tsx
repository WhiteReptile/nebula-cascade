"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getHistory, mergeServerReviews, type ServerReview } from "@/lib/storage";
import { getRank, scoreClass } from "@/lib/ranking";
import type { HistoryEntry } from "@/lib/types";

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    let stop = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    async function sync() {
      try {
        const res = await fetch("/api/reviews");
        const data = (await res.json()) as { reviews?: ServerReview[] };
        const next = Array.isArray(data.reviews)
          ? mergeServerReviews(data.reviews)
          : getHistory();
        if (!stop) setEntries(next);
        return next;
      } catch {
        const fallback = getHistory();
        if (!stop) setEntries(fallback);
        return fallback;
      }
    }

    sync().then((next) => {
      if (stop || !next.some((entry) => entry.pending)) return;
      timer = setInterval(() => {
        sync().then((latest) => {
          if (stop) return;
          if (!latest.some((entry) => entry.pending) && timer) {
            clearInterval(timer);
          }
        });
      }, 4000);
    });

    return () => {
      stop = true;
      if (timer) clearInterval(timer);
    };
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
                href={entry.pending ? `/submit?queued=${entry.id}` : `/result/${entry.id}`}
                className="cosmic-glass flex items-baseline justify-between gap-4 p-5 transition-all duration-300"
              >
                <div>
                  {entry.pending ? (
                    <>
                      <p className="label-white text-[10px]">Loading</p>
                      <p className="text-dynamic text-sm mt-2">Waiting for a human…</p>
                    </>
                  ) : (
                    <>
                      <span className={`text-3xl font-light tabular-nums ${scoreClass(entry.score)}`}>
                        {entry.score}
                      </span>
                      <p className={`text-[10px] tracking-[0.22em] uppercase mt-2 ${scoreClass(entry.score)}`}>
                        {getRank(entry.score).rank}
                      </p>
                      <p className="text-dynamic text-sm mt-1 line-clamp-1">{entry.verdictPreview}</p>
                    </>
                  )}
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
