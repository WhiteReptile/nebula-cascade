"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LAUNCH_CATEGORIES, getCategory } from "@/lib/categories";
import { getDailyLimit } from "@/lib/constants";
import { getDailyUsage, incrementDailyUsage, saveVerdict } from "@/lib/storage";
import type { CategoryId } from "@/lib/types";

export function SubmitForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const revisionOf = searchParams.get("revision") ?? undefined;

  const [category, setCategory] = useState<CategoryId>("text");
  const [content, setContent] = useState("");
  const [context, setContext] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dailyLimit = getDailyLimit();
  const used = getDailyUsage();
  const selected = getCategory(category);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = [fileName ? `Attached file: ${fileName}` : "", content.trim()]
      .filter(Boolean)
      .join("\n\n");
    if (!payload || payload.replace(/\s/g, "").length < 20) {
      setError("Add more of the work itself — a short paste, transcript, or description.");
      return;
    }
    if (used >= dailyLimit) {
      setError(`Free limit reached (${dailyLimit}/day). Try again tomorrow.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: payload,
          context: context.trim(),
          category,
          revisionOf,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Evaluation failed");
      }
      const { verdict } = await res.json();
      incrementDailyUsage();
      saveVerdict(verdict);
      router.push(`/result/${verdict.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto w-full">
      {revisionOf && (
        <p className="text-dynamic text-sm mb-4">Revising a previous submission.</p>
      )}

      <fieldset className="mb-8">
        <legend className="label-white text-[10px] mb-3">What are you submitting?</legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {LAUNCH_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setCategory(cat.id);
                setFileName(null);
              }}
              className={`category-chip ${category === cat.id ? "category-chip-on" : ""}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <p className="text-dynamic text-sm mt-4 leading-relaxed">{selected.blurb}</p>
      </fieldset>

      <label className="block mb-6">
        <span className="label-white text-[10px] mb-2 block">Your work</span>
        <div className="cosmic-glass p-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={selected.placeholder}
            rows={10}
            className="w-full bg-transparent px-5 py-4 text-sm text-white placeholder:text-white/40 focus:outline-none resize-y"
            disabled={loading}
          />
        </div>
        {selected.acceptsFile && (
          <label className="mt-3 flex items-center gap-3 text-sm text-white/80 cursor-pointer">
            <span className="cosmic-cta-ghost inline-block px-3 py-1.5 text-xs">Attach file</span>
            <input
              type="file"
              accept={selected.fileAccept}
              className="sr-only"
              disabled={loading}
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
            <span>{fileName ?? "Optional — we still need a paste, transcript, or description."}</span>
          </label>
        )}
      </label>

      <label className="block mb-8">
        <span className="label-white text-[10px] mb-2 block">Add context</span>
        <p className="text-dynamic text-sm mb-3 leading-relaxed">
          Context is extra information that changes the opinion: the assignment prompt, the audience,
          the genre, what “good” means here. Without it, we guess. With it, the judgment is fairer —
          still subjective, still an opinion.
        </p>
        <div className="cosmic-glass p-1">
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder={selected.contextHint}
            rows={5}
            className="w-full bg-transparent px-5 py-4 text-sm text-white placeholder:text-white/40 focus:outline-none resize-y"
            disabled={loading}
          />
        </div>
      </label>

      <div className="flex items-center justify-between">
        <span className="text-dynamic text-xs tracking-wide">
          {used}/{dailyLimit} free today
        </span>
        <button type="submit" disabled={loading} className="cosmic-cta text-sm px-8 py-2.5">
          {loading ? "Evaluating…" : "Evaluate"}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-white">{error}</p>}
    </form>
  );
}
