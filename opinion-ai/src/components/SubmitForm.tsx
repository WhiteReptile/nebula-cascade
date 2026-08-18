"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDailyLimit } from "@/lib/constants";
import { getDailyUsage, incrementDailyUsage, saveVerdict } from "@/lib/storage";

export function SubmitForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const revisionOf = searchParams.get("revision") ?? undefined;

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dailyLimit = getDailyLimit();
  const used = getDailyUsage();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
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
        body: JSON.stringify({ content: content.trim(), revisionOf }),
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

      <div className="cosmic-glass p-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste your business idea, landing page copy, or pitch content…"
          rows={14}
          className="w-full bg-transparent px-5 py-4 text-sm text-white placeholder:text-white/40 focus:outline-none resize-y"
          disabled={loading}
        />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-dynamic text-xs tracking-wide">
          {used}/{dailyLimit} free today
        </span>
        <button type="submit" disabled={loading || !content.trim()} className="cosmic-cta text-sm px-8 py-2.5">
          {loading ? "Evaluating…" : "Evaluate"}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-white">{error}</p>}
    </form>
  );
}
