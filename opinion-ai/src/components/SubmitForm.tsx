"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDailyLimit } from "@/lib/constants";
import { getDailyUsage, incrementDailyUsage, saveVerdict } from "@/lib/storage";
import type { CategoryId } from "@/lib/types";

const HUD_SLOTS: { id: CategoryId; label: string; fileAccept?: string }[] = [
  { id: "music", label: "Music", fileAccept: "audio/*,.mp3,.wav,.m4a,.flac" },
  { id: "documents", label: "Documents", fileAccept: ".pdf,.doc,.docx" },
  { id: "video", label: "Video", fileAccept: "video/*" },
  { id: "text", label: "Text" },
];

const PAID: CategoryId[] = ["music", "documents", "video"];

const PRICING_COPY = [
  "Music, documents, and video are $2.99.",
  "A human will watch or read your work.",
  "You get a five-sentence opinion.",
  "It is anonymous. They will not know who you are.",
];

export function SubmitForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const revisionOf = searchParams.get("revision") ?? undefined;

  const [category, setCategory] = useState<CategoryId>("text");
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dailyLimit = getDailyLimit();
  const used = getDailyUsage();
  const slot = HUD_SLOTS.find((s) => s.id === category);
  const paidSelected = PAID.includes(category);
  const canSubmit =
    Boolean(content.trim()) && !paidSelected && !fileName && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (paidSelected || fileName) {
      setError("Music, documents, and video are paid. See credits.");
      return;
    }
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
        body: JSON.stringify({
          content: content.trim(),
          category: "text",
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

      <div className="hud-row mb-3" role="listbox" aria-label="Category">
        {HUD_SLOTS.map((s) => {
          const on = category === s.id;
          return (
            <button
              key={s.id}
              type="button"
              role="option"
              aria-selected={on}
              onClick={() => {
                setCategory(s.id);
                setFileName(null);
              }}
              className={`hud-slot ${on ? "hud-slot-on" : ""}`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {slot?.fileAccept && (
        <div className="file-pick">
          <input
            id="submit-file"
            type="file"
            accept={slot.fileAccept}
            className="sr-only"
            disabled={loading}
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
          <label htmlFor="submit-file" className="file-pick-btn">
            Choose file
          </label>
          <span className="file-pick-name">{fileName ?? "No file chosen"}</span>
        </div>
      )}

      <div className="cosmic-glass p-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            category === "text"
              ? "Paste your business idea, landing page copy, or pitch content…"
              : "Context for the AI and human…"
          }
          rows={14}
          className="w-full bg-transparent px-5 py-4 text-sm text-white placeholder:text-white/40 focus:outline-none resize-y"
          disabled={loading}
        />
      </div>

      <div className="mt-6 flex items-start justify-between">
        <div className="flex flex-col items-start gap-2">
          <span className="text-dynamic text-xs tracking-wide">
            {used}/{dailyLimit} free today
          </span>
          <div className="how-wrap relative inline-block">
            <button type="button" className="pricing-btn">
              credits
            </button>
            <div className="how-popout" role="tooltip">
              {PRICING_COPY.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </div>
        <button type="submit" disabled={!canSubmit} className="cosmic-cta text-sm px-8 py-2.5">
          {loading ? "Evaluating…" : "Evaluate"}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-white">{error}</p>}
    </form>
  );
}
