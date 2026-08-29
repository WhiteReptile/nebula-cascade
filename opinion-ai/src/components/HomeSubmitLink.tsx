"use client";

import { useState } from "react";
import { loadDraft, persistDraft, useHeroDraft } from "@/components/HeroDraft";
import { saveVerdict } from "@/lib/storage";

export function HomeSubmitLink() {
  const { draft } = useHeroDraft();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    if (loading) return;

    const text = draft.trim() || loadDraft();
    if (!text) {
      window.location.href = "/submit";
      return;
    }

    persistDraft(text);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, category: "text" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Evaluation failed");

      saveVerdict(data.verdict);
      persistDraft("");
      window.location.href = `/result/${data.verdict.id}`;
    } catch (err) {
      persistDraft(text);
      setError(err instanceof Error ? err.message : "Something went wrong");
      window.location.href = "/submit";
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <a
        href="/submit"
        onClick={handleClick}
        className="cosmic-cta inline-block text-sm px-10 py-3"
        aria-busy={loading}
      >
        {loading ? "Submitting…" : "Submit"}
      </a>
      {error && <p className="warning-red sentence text-xs mt-3">{error}</p>}
    </div>
  );
}
