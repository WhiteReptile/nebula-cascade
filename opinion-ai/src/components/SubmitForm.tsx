"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCategory } from "@/lib/categories";
import { getDailyLimit } from "@/lib/constants";
import { getDailyUsage, incrementDailyUsage, saveVerdict } from "@/lib/storage";
import type { CategoryId } from "@/lib/types";

const PAGE_CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "homework", label: "Homework" },
  { id: "documents", label: "Documents" },
  { id: "text", label: "Text" },
  { id: "audio", label: "Audio" },
  { id: "music", label: "Music" },
];

export function SubmitForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const revisionOf = searchParams.get("revision") ?? undefined;

  const [category, setCategory] = useState<CategoryId>("text");
  const [content, setContent] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dailyLimit = getDailyLimit();
  const used = getDailyUsage();
  const selected = getCategory(category);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || content.trim().length < 20) {
      setError("Paste at least 20 characters.");
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
          content: content.trim(),
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
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto w-full">
      {revisionOf && (
        <p className="text-dynamic text-sm mb-4">Revising a previous submission.</p>
      )}

      <div className="mb-8">
        <p className="text-white text-sm mb-3">Categories</p>
        <div className="flex flex-col gap-2">
          {PAGE_CATEGORIES.map((cat) => {
            const on = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`w-full text-left px-4 py-3 text-white text-sm border ${
                  on ? "border-[#4ec4ff] bg-[#4ec4ff]/20" : "border-white/40 bg-transparent"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
        <p className="text-white text-sm mt-3">{selected.blurb}</p>
      </div>

      <label className="block mb-6">
        <span className="text-white text-sm mb-2 block">Paste text</span>
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
      </label>

      <label className="block mb-8">
        <span className="text-white text-sm mb-2 block">Add context</span>
        <p className="text-white text-sm mb-3">
          Explain more so we know what to judge.
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
        <span className="text-white text-xs tracking-wide">
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
