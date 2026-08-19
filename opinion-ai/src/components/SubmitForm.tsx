"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDailyLimit } from "@/lib/constants";
import {
  getDailyUsage,
  getPaidPack,
  incrementDailyUsage,
  savePendingJob,
  saveVerdict,
  setPaidPack,
  spendPaidCredit,
  type PaidPack,
} from "@/lib/storage";
import { isJobId, VIDEO_CAP_SECONDS, type ExaminerModel } from "@/lib/queue-shared";
import { QueueWait } from "@/components/QueueWait";
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
const EXAMINER_MODELS: { id: ExaminerModel; label: string }[] = [
  { id: "pro-examiner-v1", label: "Pro Examiner V1" },
  { id: "pro-examiner-v2", label: "Pro Examiner V2" },
];

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

function PaySwitch({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="cosmic-glass flex items-center justify-between gap-4 px-4 py-3 mb-3">
      <span className="text-dynamic text-sm">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`pay-switch ${checked ? "pay-switch-on" : ""}`}
      />
    </div>
  );
}

export function SubmitForm({ longVideoAllowed = false }: { longVideoAllowed?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const revisionOf = searchParams.get("revision") ?? undefined;
  const packParam = searchParams.get("pack");
  const fileInput = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<CategoryId>("text");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [used, setUsed] = useState(0);
  const [pack, setPack] = useState<PaidPack | null>(null);
  const [useCredit, setUseCredit] = useState(false);
  const [shareOpinion, setShareOpinion] = useState(false);
  const [model, setModel] = useState<ExaminerModel>("pro-examiner-v2");
  const queuedId = searchParams.get("queued");
  const queued = Boolean(queuedId && isJobId(queuedId));

  useEffect(() => {
    setUsed(getDailyUsage());
  }, []);

  useEffect(() => {
    if (packParam === "human-ai") {
      setPaidPack({ tier: "human-ai", credits: 5 });
    } else if (packParam === "human-ai-pro") {
      setPaidPack({ tier: "human-ai-pro", credits: 10 });
    }
    setPack(getPaidPack());
    if (packParam === "human-ai" || packParam === "human-ai-pro") {
      router.replace("/submit");
    }
  }, [packParam, router]);

  const dailyLimit = getDailyLimit();
  const slot = HUD_SLOTS.find((s) => s.id === category);
  const queueSelected = QUEUE.includes(category);
  const paid = Boolean(pack && pack.credits > 0);
  const canShare = pack?.tier === "human-ai" && paid;
  const canSubmit = queueSelected
    ? Boolean(file) && Boolean(content.trim()) && !loading
    : Boolean(content.trim()) && !file && !loading;

  useEffect(() => {
    if (!paid) {
      setUseCredit(false);
      setShareOpinion(false);
      return;
    }
    setUseCredit(queueSelected);
  }, [paid, queueSelected]);

  function resetFile() {
    setFile(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function queueWork(args: {
    category: CategoryId;
    context: string;
    upload: File;
    model: ExaminerModel;
    durationSeconds?: number;
    share?: boolean;
  }) {
    const body = new FormData();
    body.append("category", args.category);
    body.append("context", args.context);
    body.append("file", args.upload);
    body.append("model", args.model);
    if (args.durationSeconds != null) {
      body.append("durationSeconds", String(args.durationSeconds));
    }
    if (args.share != null) {
      body.append("share", args.share ? "1" : "0");
    }
    const res = await fetch("/api/queue", { method: "POST", body });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Upload failed");
    if (typeof data.id !== "string" || !isJobId(data.id)) {
      throw new Error("Upload failed");
    }
    return data.id as string;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const useHuman = paid && useCredit;

    if (queueSelected) {
      if (!file || !content.trim()) return;
      if (paid && !useCredit) {
        setError("Turn on a Human + AI credit to submit this file.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        let durationSeconds: number | undefined;
        if (file.type.startsWith("video/")) {
          const duration = await videoDuration(file);
          if (duration > VIDEO_CAP_SECONDS && !longVideoAllowed) {
            throw new Error("Video over 2 minutes needs HUMAN + AI PRO.");
          }
          durationSeconds = duration;
        }
        const id = await queueWork({
          category,
          context: content.trim(),
          upload: file,
          model,
          durationSeconds,
          share: pack?.tier === "human-ai-pro" ? false : canShare ? shareOpinion : undefined,
        });
        if (useHuman) {
          const next = spendPaidCredit();
          setPack(next);
        }
        savePendingJob({
          id,
          categoryLabel: slot?.label ?? "Submit",
          scoreContext: "",
          createdAt: new Date().toISOString(),
        });
        setContent("");
        resetFile();
        router.push(`/submit?queued=${id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!content.trim()) return;

    if (useHuman) {
      setLoading(true);
      setError(null);
      try {
        const work = content.trim();
        const upload = new File([work], "text.txt", { type: "text/plain" });
        const id = await queueWork({
          category: "text",
          context: work.slice(0, 8000),
          upload,
          model,
          share: pack?.tier === "human-ai-pro" ? false : canShare ? shareOpinion : undefined,
        });
        const next = spendPaidCredit();
        setPack(next);
        savePendingJob({
          id,
          categoryLabel: "Text",
          scoreContext: "",
          createdAt: new Date().toISOString(),
        });
        setContent("");
        router.push(`/submit?queued=${id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
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
          category: "text",
          revisionOf,
          model,
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

  if (queued && queuedId) {
    return <QueueWait jobId={queuedId} />;
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

      {paid && (
        <div className="mb-4">
          <PaySwitch
            checked={useCredit}
            label="Use a Human + AI credit"
            onChange={setUseCredit}
          />
          {canShare && (
            <PaySwitch
              checked={shareOpinion}
              label="Share this opinion"
              onChange={setShareOpinion}
            />
          )}
        </div>
      )}

      <div className="cosmic-glass p-4 mb-4">
        <label htmlFor="model-select" className="label-white text-[10px] block mb-2">
          Model
        </label>
        <select
          id="model-select"
          value={model}
          onChange={(e) => setModel(e.target.value as ExaminerModel)}
          className="w-full bg-transparent border border-white/20 px-3 py-2 text-sm text-white focus:outline-none"
          disabled={loading}
        >
          {EXAMINER_MODELS.map((item) => (
            <option key={item.id} value={item.id} className="bg-[#060814] text-white">
              {item.label}
            </option>
          ))}
        </select>
      </div>

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
          <span className="text-dynamic text-xs tracking-wide">
            {pack ? `${pack.credits} credits` : "0 credits"}
          </span>
        </div>
        <button type="submit" disabled={!canSubmit} className="cosmic-cta text-sm px-8 py-2.5">
          {loading ? "Submitting…" : "Submit"}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-white">{error}</p>}
    </form>
  );
}
