"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDailyLimit } from "@/lib/constants";
import { getDailyUsage, incrementDailyUsage, saveVerdict } from "@/lib/storage";
import { VIDEO_CAP_SECONDS } from "@/lib/queue-shared";
import type { CategoryId } from "@/lib/types";

const HUD_SLOTS: { id: CategoryId; label: string; fileAccept?: string; note: string }[] = [
  {
    id: "music",
    label: "Music",
    fileAccept: "audio/*,.mp3,.wav,.m4a,.flac",
    note: "A person listens to the actual track — the sound, not a write-up. Send the file, and a little context.",
  },
  {
    id: "documents",
    label: "Documents",
    fileAccept: "image/*,.png,.jpg,.jpeg,.webp,.gif,.pdf",
    note: "Bring the picture, not the manuscript. Photographs, stills, posters, ads — work meant to be seen. We judge the image and the sell. Writing belongs in Text.",
  },
  {
    id: "video",
    label: "Video",
    fileAccept: "video/*",
    note: "A person watches it move. Film, clips, anything that lives in time. Send the file, then a little context. Over 2 minutes needs HUMAN + AI PRO.",
  },
  {
    id: "physical_appearance",
    label: "Physical appearance",
    fileAccept: "image/*,video/*,.png,.jpg,.jpeg,.webp,.gif,.mp4,.webm,.mov",
    note: "A person looks at the photo or video. Hair loss, residual baldness, plastic surgery — we say how it actually reads. Send the file, and a little context.",
  },
  {
    id: "text",
    label: "Text",
    note: "Words only. Poems, lyrics, homework, a marketing plan, a screenplay scene — paste it and we tell you what we think. Five times a day, no credits.",
  },
];

const QUEUE: CategoryId[] = ["music", "documents", "video", "physical_appearance"];

function videoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement("video");
    el.preload = "metadata";
    const finish = (fn: () => void) => {
      URL.revokeObjectURL(url);
      fn();
    };
    el.onloadedmetadata = () => {
      const duration = el.duration;
      if (!Number.isFinite(duration) || duration <= 0) {
        finish(() => reject(new Error("Could not read video length.")));
        return;
      }
      finish(() => resolve(duration));
    };
    el.onerror = () => finish(() => reject(new Error("Could not read video length.")));
    el.src = url;
  });
}

export function SubmitForm({ longVideoAllowed = false }: { longVideoAllowed?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const revisionOf = searchParams.get("revision") ?? undefined;
  const fileInput = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<CategoryId>("text");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [used, setUsed] = useState(0);
  const [queued, setQueued] = useState(false);

  useEffect(() => {
    setUsed(getDailyUsage());
  }, []);

  const dailyLimit = getDailyLimit();
  const slot = HUD_SLOTS.find((s) => s.id === category);
  const queueSelected = QUEUE.includes(category);
  const canSubmit = queueSelected
    ? Boolean(file) && Boolean(content.trim()) && !loading
    : Boolean(content.trim()) && !file && !loading;

  function resetFile() {
    setFile(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (queueSelected) {
      if (!file || !content.trim()) return;
      setLoading(true);
      setError(null);
      try {
        const body = new FormData();
        body.append("category", category);
        body.append("context", content.trim());
        body.append("file", file);
        if (file.type.startsWith("video/")) {
          const duration = await videoDuration(file);
          if (duration > VIDEO_CAP_SECONDS && !longVideoAllowed) {
            throw new Error("Video over 2 minutes needs HUMAN + AI PRO.");
          }
          body.append("durationSeconds", String(duration));
        }
        const res = await fetch("/api/queue", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        setQueued(true);
        setContent("");
        resetFile();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
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
      setUsed(getDailyUsage());
      saveVerdict(verdict);
      router.push(`/result/${verdict.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (queued) {
    return (
      <div className="max-w-xl mx-auto w-full text-center">
        <div className="cosmic-glass p-8">
          <p className="text-white text-base leading-relaxed">A human will look at this.</p>
        </div>
      </div>
    );
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
                resetFile();
              }}
              className={`hud-slot ${on ? "hud-slot-on" : ""}`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {queueSelected && (
        <p className="warning-red sentence text-xs sm:text-sm mb-4">
          Music, documents, video, and physical appearance need a human, so a review can take 5 to 10 minutes.
        </p>
      )}

      {slot && (
        <div className="cosmic-glass p-5 mb-4">
          <p className="text-dynamic text-sm leading-relaxed">{slot.note}</p>
        </div>
      )}

      {slot?.fileAccept && (
        <div className="file-pick">
          <input
            id="submit-file"
            ref={fileInput}
            type="file"
            accept={slot.fileAccept}
            className="sr-only"
            disabled={loading}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <label htmlFor="submit-file" className="file-pick-btn">
            Choose file
          </label>
          <span className="file-pick-name">{file?.name ?? "No file chosen"}</span>
        </div>
      )}

      <div className="cosmic-glass p-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            category === "text"
              ? "Paste a poem, lyrics, homework, a marketing plan, a screenplay scene…"
              : category === "physical_appearance"
                ? "Hair loss, a procedure, what you want judged…"
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
          {loading ? "Submitting…" : "Submit"}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-white">{error}</p>}
    </form>
  );
}
