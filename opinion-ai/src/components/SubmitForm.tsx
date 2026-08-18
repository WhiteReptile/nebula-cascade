"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDailyLimit } from "@/lib/constants";
import { getDailyUsage, incrementDailyUsage, saveVerdict } from "@/lib/storage";
import type { CategoryId } from "@/lib/types";

const HUD_SLOTS: { id: CategoryId; label: string; fileAccept?: string; explain: string[] }[] = [
  {
    id: "music",
    label: "Music",
    fileAccept: "audio/*,.mp3,.wav,.m4a,.flac",
    explain: [
      "A human listens to your music.",
      "That is why this slot is locked unless you have premium credits.",
      "Upload the track when you can pay for that review.",
    ],
  },
  {
    id: "documents",
    label: "Documents",
    fileAccept: "image/*,.png,.jpg,.jpeg,.webp,.gif,.pdf",
    explain: [
      "Documents here means visual work: photographs, imagery, and marketing pieces.",
      "We look at how it looks and how it sells, not the written words as literature.",
      "Paste poems, lyrics, and scripts in Text instead.",
    ],
  },
  {
    id: "video",
    label: "Video",
    fileAccept: "video/*",
    explain: [
      "A human watches your video.",
      "This slot is locked unless you have premium credits.",
      "Use it for film, clips, and moving picture work.",
    ],
  },
  {
    id: "text",
    label: "Text",
    explain: [
      "Text is for the words themselves: poems, lyrics, screenplay scenes, and other writing.",
      "Paste the work you want judged.",
      "The free AI opinion is for this slot.",
    ],
  },
];

const PAID: CategoryId[] = ["music", "documents", "video"];

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

      {slot && (
        <div className="cosmic-glass p-5 mb-4">
          <p className="label-white text-[10px] mb-3">{slot.label}</p>
          <div className="space-y-2">
            {slot.explain.map((line) => (
              <p key={line} className="text-dynamic text-sm leading-relaxed pl-3 border-l border-[#4ec4ff]/30">
                {line}
              </p>
            ))}
          </div>
        </div>
      )}

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
              ? "Paste a poem, lyrics, a screenplay scene, or other writing…"
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
          <span className="text-dynamic text-xs tracking-wide">0 credits</span>
        </div>
        <button type="submit" disabled={!canSubmit} className="cosmic-cta text-sm px-8 py-2.5">
          {loading ? "Evaluating…" : "Evaluate"}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-white">{error}</p>}
    </form>
  );
}
