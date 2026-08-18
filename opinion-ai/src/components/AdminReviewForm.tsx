"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getRank, scoreClass } from "@/lib/ranking";
import type { QueueJob } from "@/lib/queue-shared";

export function AdminReviewForm({ job }: { job: QueueJob }) {
  const router = useRouter();
  const [notes, setNotes] = useState(job.notes ?? "");
  const [score, setScore] = useState(job.score != null ? String(job.score) : "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!notes.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/jobs/${job.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: notes.trim(),
          score: score.trim() === "" ? undefined : Number(score),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not write the opinion.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not write the opinion.");
    } finally {
      setLoading(false);
    }
  }

  const rank = job.score != null ? getRank(job.score) : null;

  return (
    <div className="space-y-8">
      {job.status === "done" && job.opinion && (
        <div>
          {job.score != null && rank && (
            <div className="cosmic-glass p-8 mb-8 text-center">
              <div className={`text-8xl font-extralight tabular-nums ${scoreClass(job.score)}`}>
                {job.score}
              </div>
              <p className={`text-[10px] tracking-[0.22em] uppercase mt-4 ${scoreClass(job.score)}`}>
                {rank.rank}
              </p>
              <p className="text-dynamic mt-2 text-sm">{rank.meaning}</p>
            </div>
          )}
          <p className="text-dynamic text-base leading-relaxed mb-8 px-1">{job.opinion}</p>
          {(job.strengths?.length || job.weaknesses?.length) ? (
            <div
              className={`grid gap-6 mb-8 ${job.strengths?.length && job.weaknesses?.length ? "sm:grid-cols-2" : ""}`}
            >
              {!!job.strengths?.length && (
                <div className="cosmic-glass p-5">
                  <h2 className="label-white text-[10px] mb-3">Strengths</h2>
                  <ul className="space-y-2 text-sm">
                    {job.strengths.map((item) => (
                      <li key={item} className="text-dynamic">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {!!job.weaknesses?.length && (
                <div className="cosmic-glass p-5">
                  <h2 className="label-white text-[10px] mb-3">Weaknesses</h2>
                  <ul className="space-y-2 text-sm">
                    {job.weaknesses.map((item) => (
                      <li key={item} className="text-dynamic">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      <form onSubmit={onSubmit}>
        <label htmlFor="admin-notes" className="label-white text-[10px] block mb-3">
          How do you feel about it?
        </label>
        <div className="cosmic-glass p-1">
          <textarea
            id="admin-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={10}
            className="w-full bg-transparent px-5 py-4 text-sm text-white placeholder:text-white/40 focus:outline-none resize-y"
            disabled={loading}
          />
        </div>
        <input
          type="number"
          min={0}
          max={100}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="Score (optional)"
          className="mt-4 w-28 bg-transparent border border-white/20 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
          disabled={loading}
        />
        <div className="mt-6 flex justify-end">
          <button type="submit" disabled={!notes.trim() || loading} className="cosmic-cta text-sm px-8 py-2.5">
            {loading ? "Writing…" : "Write the public opinion"}
          </button>
        </div>
        {error && <p className="mt-4 text-sm text-white">{error}</p>}
      </form>
    </div>
  );
}
