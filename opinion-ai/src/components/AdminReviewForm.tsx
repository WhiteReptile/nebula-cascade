"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getRank, scoreClass } from "@/lib/ranking";
import { STRENGTH_TAGS, WEAKNESS_TAGS } from "@/lib/review-tags";
import type { QueueJob } from "@/lib/queue-shared";

function hasTag(list: string[], tag: string): boolean {
  return list.some((item) => item.trim().toLowerCase() === tag.trim().toLowerCase());
}

function TagField({
  label,
  value,
  templates,
  disabled,
  onChange,
}: {
  label: string;
  value: string[];
  templates: readonly string[];
  disabled?: boolean;
  onChange: (next: string[]) => void;
}) {
  const [custom, setCustom] = useState("");

  function add(tag: string) {
    const next = tag.trim();
    if (!next || hasTag(value, next)) return;
    onChange([...value, next]);
  }

  function rename(index: number, next: string) {
    onChange(value.map((item, i) => (i === index ? next : item)));
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="mt-6">
      <p className="label-white text-[10px] mb-3">{label}</p>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {value.map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              className="flex items-center gap-1 border border-[#4ec4ff]/50 px-2 py-1 text-xs text-white"
            >
              <span className="text-[#4ec4ff]">#</span>
              <input
                value={tag}
                onChange={(e) => rename(i, e.target.value)}
                className="bg-transparent min-w-[6rem] w-32 focus:outline-none"
                disabled={disabled}
              />
              <button type="button" onClick={() => remove(i)} disabled={disabled} className="text-white/70">
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {templates.map((tag) => {
          const on = hasTag(value, tag);
          return (
            <button
              key={tag}
              type="button"
              disabled={disabled || on}
              onClick={() => add(tag)}
              className={`text-xs px-2 py-1 border ${
                on ? "border-white/10 text-white/30" : "border-white/25 text-white"
              }`}
            >
              #{tag}
            </button>
          );
        })}
      </div>
      <input
        value={custom}
        onChange={(e) => setCustom(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          e.preventDefault();
          add(custom);
          setCustom("");
        }}
        placeholder="Or type one"
        className="mt-3 w-full bg-transparent border border-white/20 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
        disabled={disabled}
      />
    </div>
  );
}

export function AdminReviewForm({ job }: { job: QueueJob }) {
  const router = useRouter();
  const [notes, setNotes] = useState(job.notes ?? "");
  const [score, setScore] = useState(job.score != null ? String(job.score) : "");
  const [strengths, setStrengths] = useState<string[]>(job.strengths ?? []);
  const [weaknesses, setWeaknesses] = useState<string[]>(job.weaknesses ?? []);
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
          strengths: strengths.map((item) => item.trim()).filter(Boolean),
          weaknesses: weaknesses.map((item) => item.trim()).filter(Boolean),
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
          <p className="text-dynamic text-base leading-relaxed px-1">{job.opinion}</p>
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
        <TagField
          label="Strengths"
          value={strengths}
          templates={STRENGTH_TAGS}
          disabled={loading}
          onChange={setStrengths}
        />
        <TagField
          label="Weaknesses"
          value={weaknesses}
          templates={WEAKNESS_TAGS}
          disabled={loading}
          onChange={setWeaknesses}
        />
        <input
          type="number"
          min={0}
          max={100}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="Score (optional)"
          className="mt-6 w-28 bg-transparent border border-white/20 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
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
