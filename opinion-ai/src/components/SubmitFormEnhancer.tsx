"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadDraft, persistDraft } from "@/components/HeroDraft";
import { PdfNeedModal } from "@/components/PdfNeedModal";
import { OpinionWorkingModal } from "@/components/OpinionWorkingModal";
import {
  getDailyUsage,
  getPaidPack,
  incrementDailyUsage,
  savePendingJob,
  saveVerdict,
  spendPaidCredit,
} from "@/lib/storage";
import { isJobId, VIDEO_CAP_SECONDS } from "@/lib/queue-shared";
import { isPrivatePack } from "@/lib/share-policy";
import {
  countWords,
  dispatchNeedPdf,
  isOverWordLimit,
  MAX_CONTENT_WORDS,
  NEED_PDF_EVENT,
} from "@/lib/content-limits";
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

function updateWordCount(text: string) {
  const el = document.getElementById("submit-word-count");
  if (!el) return;
  const words = countWords(text);
  el.textContent = `${words.toLocaleString()} / ${MAX_CONTENT_WORDS.toLocaleString()} words`;
}

export function SubmitFormEnhancer({
  category,
  revisionOf,
  longVideoAllowed = false,
  pack,
  initialNeedPdf = false,
}: {
  category: SubmitCategoryId;
  revisionOf?: string;
  longVideoAllowed?: boolean;
  pack?: string;
  initialNeedPdf?: boolean;
}) {
  const router = useRouter();
  const queueSelected = QUEUE_CATEGORY_IDS.includes(category);
  const textSelected = category === "text";
  const [needPdf, setNeedPdf] = useState(initialNeedPdf);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    function onNeed() {
      setNeedPdf(true);
    }
    window.addEventListener(NEED_PDF_EVENT, onNeed);
    return () => window.removeEventListener(NEED_PDF_EVENT, onNeed);
  }, []);

  useEffect(() => {
    const form = document.getElementById("submit-form") as HTMLFormElement | null;
    if (!form) return;

    const draft = loadDraft();
    const textarea = form.querySelector("textarea");
    if (draft && textarea instanceof HTMLTextAreaElement && !textarea.value) {
      textarea.value = draft;
    }
    if (textarea instanceof HTMLTextAreaElement) {
      updateWordCount(textarea.value);
      if (textSelected && isOverWordLimit(textarea.value)) {
        dispatchNeedPdf();
      }
    }

    const fileInput = form.querySelector<HTMLInputElement>('input[name="file"]');
    const pdfInput = form.querySelector<HTMLInputElement>('input[name="pdf"]');
    const fileName = document.getElementById("submit-file-name");
    const pdfName = document.getElementById("submit-pdf-name");
    fileInput?.addEventListener("change", () => {
      if (fileName) fileName.textContent = fileInput.files?.[0]?.name ?? "No file chosen";
    });
    pdfInput?.addEventListener("change", () => {
      if (pdfName) pdfName.textContent = pdfInput.files?.[0]?.name ?? "No PDF chosen";
    });

    let wasOver = textarea instanceof HTMLTextAreaElement && isOverWordLimit(textarea.value);
    textarea?.addEventListener("input", () => {
      if (!(textarea instanceof HTMLTextAreaElement)) return;
      if (textSelected) persistDraft(textarea.value);
      updateWordCount(textarea.value);
      const over = isOverWordLimit(textarea.value);
      if (textSelected && over && !wasOver && !pdfInput?.files?.[0]) {
        dispatchNeedPdf();
      }
      wasOver = over;
    });

    async function onSubmit(event: SubmitEvent) {
      event.preventDefault();
      if (!form) return;
      const errorEl = document.getElementById("submit-form-error");
      errorEl?.classList.add("hidden");

      const accept = form.querySelector<HTMLInputElement>('input[name="acceptTerms"]');
      if (!accept?.checked) {
        showError("Accept the Terms and Content Policy to continue.");
        return;
      }

      const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting…";
      }

      let slowTimer: ReturnType<typeof setTimeout> | undefined;
      const stopSlow = () => {
        if (slowTimer) clearTimeout(slowTimer);
      };

      try {
        if (queueSelected) {
          const file = fileInput?.files?.[0];
          const context = textarea instanceof HTMLTextAreaElement ? textarea.value.trim() : "";
          if (!file) throw new Error("Choose a file first.");
          if (!context) throw new Error("Add context for your file.");
          setWorking(true);

          const paid = getPaidPack();
          const effectivePack = pack || paid?.tier || "";
          const privateForced = isPrivatePack(effectivePack) || isPrivatePack(paid?.tier);
          const shareBox = form.querySelector<HTMLInputElement>('input[name="share"]');
          const shareOn = privateForced ? false : Boolean(shareBox?.checked);

          const body = new FormData();
          body.append("category", category);
          body.append("context", context);
          body.append("file", file);
          body.append("acceptTerms", "1");
          body.append("share", shareOn ? "1" : "0");
          if (effectivePack) body.append("pack", effectivePack);
          const model = form.querySelector<HTMLSelectElement>('select[name="model"]')?.value;
          if (model) body.append("model", model);

          if (file.type.startsWith("video/")) {
            const duration = await videoDuration(file);
            if (duration > VIDEO_CAP_SECONDS && !longVideoAllowed && !isPrivatePack(effectivePack)) {
              throw new Error("Video over 2 minutes needs Hybrid PRO.");
            }
            body.append("durationSeconds", String(duration));
          }

          const res = await fetch("/api/queue", { method: "POST", body });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Upload failed");
          if (typeof data.id !== "string" || !isJobId(data.id)) throw new Error("Upload failed");

          if (paid && paid.credits > 0) spendPaidCredit();

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
        const pdfFile = pdfInput?.files?.[0] ?? null;
        if (!content && !pdfFile) throw new Error("Paste your text or upload a PDF.");
        if (isOverWordLimit(content) && !pdfFile) {
          dispatchNeedPdf();
          throw new Error("Over 8,000 words — add a PDF on this Text tab.");
        }

        if (pdfFile) {
          setWorking(true);
        } else {
          slowTimer = setTimeout(() => setWorking(true), 8000);
        }

        const model =
          form.querySelector<HTMLSelectElement>('select[name="model"]')?.value ?? "pro-examiner-v2";
        const body = new FormData();
        body.append("content", content);
        body.append("category", "text");
        body.append("acceptTerms", "1");
        if (revisionOf) body.append("revisionOf", revisionOf);
        body.append("model", model);
        if (pdfFile) body.append("pdf", pdfFile);

        const res = await fetch("/api/evaluate", { method: "POST", body });
        const data = await res.json();
        stopSlow();
        if (!res.ok) {
          if (data.code === "need_pdf") {
            dispatchNeedPdf();
            throw new Error(data.error ?? "Over 8,000 words — add a PDF on this Text tab.");
          }
          throw new Error(data.error ?? "Evaluation failed");
        }

        if (data.queued && typeof data.id === "string" && isJobId(data.id)) {
          persistDraft("");
          savePendingJob({
            id: data.id,
            categoryLabel: "documents",
            scoreContext: "for professional documents",
            createdAt: new Date().toISOString(),
          });
          router.push(`/submit?queued=${data.id}`);
          return;
        }

        incrementDailyUsage();
        getDailyUsage();
        saveVerdict(data.verdict);
        persistDraft("");
        router.push(`/result/${data.verdict.id}`);
      } catch (err) {
        stopSlow();
        setWorking(false);
        showError(err instanceof Error ? err.message : "Something went wrong");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit";
        }
      }
    }

    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [category, longVideoAllowed, pack, queueSelected, revisionOf, router, textSelected]);

  return (
    <>
      <PdfNeedModal open={needPdf} onClose={() => setNeedPdf(false)} variant="submit" />
      <OpinionWorkingModal open={working} />
    </>
  );
}
