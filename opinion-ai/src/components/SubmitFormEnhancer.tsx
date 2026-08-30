"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadDraft, persistDraft } from "@/components/HeroDraft";
import {
  getDailyUsage,
  incrementDailyUsage,
  savePendingJob,
  saveVerdict,
} from "@/lib/storage";
import { isJobId, VIDEO_CAP_SECONDS } from "@/lib/queue-shared";
import type { SubmitCategoryId } from "@/lib/submit-categories";
import { QUEUE_CATEGORY_IDS } from "@/lib/submit-form-slots";

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

function showError(message: string) {
  const el = document.getElementById("submit-form-error");
  if (!el) return;
  el.textContent = message;
  el.classList.remove("hidden");
}

export function SubmitFormEnhancer({
  category,
  revisionOf,
  longVideoAllowed = false,
}: {
  category: SubmitCategoryId;
  revisionOf?: string;
  longVideoAllowed?: boolean;
}) {
  const router = useRouter();
  const queueSelected = QUEUE_CATEGORY_IDS.includes(category);
  const textSelected = category === "text";

  useEffect(() => {
    const form = document.getElementById("submit-form") as HTMLFormElement | null;
    if (!form) return;

    const draft = loadDraft();
    const textarea = form.querySelector("textarea");
    if (draft && textarea instanceof HTMLTextAreaElement && !textarea.value) {
      textarea.value = draft;
    }

    const fileInput = form.querySelector<HTMLInputElement>('input[name="file"]');
    const fileName = document.getElementById("submit-file-name");
    fileInput?.addEventListener("change", () => {
      if (fileName) fileName.textContent = fileInput.files?.[0]?.name ?? "No file chosen";
    });

    textarea?.addEventListener("input", () => {
      if (textSelected && textarea instanceof HTMLTextAreaElement) {
        persistDraft(textarea.value);
      }
    });

    async function onSubmit(event: SubmitEvent) {
      event.preventDefault();
      if (!form) return;
      const errorEl = document.getElementById("submit-form-error");
      errorEl?.classList.add("hidden");

      const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting…";
      }

      try {
        if (queueSelected) {
          const file = fileInput?.files?.[0];
          const context = textarea instanceof HTMLTextAreaElement ? textarea.value.trim() : "";
          if (!file) throw new Error("Choose a file first.");
          if (!context) throw new Error("Add context for your file.");

          const body = new FormData();
          body.append("category", category);
          body.append("context", context);
          body.append("file", file);
          const model = form.querySelector<HTMLSelectElement>('select[name="model"]')?.value;
          if (model) body.append("model", model);

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
          if (typeof data.id !== "string" || !isJobId(data.id)) throw new Error("Upload failed");

          savePendingJob({
            id: data.id,
            categoryLabel: category,
            scoreContext: "",
            createdAt: new Date().toISOString(),
          });
          router.push(`/submit?queued=${data.id}`);
          return;
        }

        const content = textarea instanceof HTMLTextAreaElement ? textarea.value.trim() : "";
        if (!content) throw new Error("Paste your text first.");

        const model = form.querySelector<HTMLSelectElement>('select[name="model"]')?.value ?? "pro-examiner-v2";
        const res = await fetch("/api/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, category: "text", revisionOf, model }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Evaluation failed");

        incrementDailyUsage();
        getDailyUsage();
        saveVerdict(data.verdict);
        persistDraft("");
        router.push(`/result/${data.verdict.id}`);
      } catch (err) {
        showError(err instanceof Error ? err.message : "Something went wrong");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit";
        }
      }
    }

    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [category, longVideoAllowed, queueSelected, revisionOf, router, textSelected]);

  return null;
}
