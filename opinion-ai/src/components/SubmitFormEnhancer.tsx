"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loadDraft, persistDraft } from "@/components/HeroDraft";
import { PdfNeedModal } from "@/components/PdfNeedModal";
import { OpinionWorkingModal } from "@/components/OpinionWorkingModal";
import { CreditConfirmModal } from "@/components/CreditConfirmModal";
import {
  billedMinutes,
  creditNoun,
  creditsForHybridJob,
  formatClock,
  hybridJobKindForCategory,
  type CreditConfirmState,
} from "@/lib/hybrid-credits";
import {
  getDailyUsage,
  getPaidPack,
  incrementDailyUsage,
  savePendingJob,
  saveVerdict,
  spendPaidCredits,
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
import { getDailyLimit } from "@/lib/constants";
import type { SubmitCategoryId } from "@/lib/submit-categories";
import { QUEUE_CATEGORY_IDS } from "@/lib/submit-form-slots";

function mediaDuration(file: File, kind: "video" | "audio"): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement(kind);
    el.preload = "metadata";
    const finish = (fn: () => void) => {
      URL.revokeObjectURL(url);
      fn();
    };
    el.onloadedmetadata = () => {
      const duration = el.duration;
      if (!Number.isFinite(duration) || duration <= 0) {
        finish(() => reject(new Error(`Could not read ${kind} length.`)));
        return;
      }
      finish(() => resolve(duration));
    };
    el.onerror = () => finish(() => reject(new Error(`Could not read ${kind} length.`)));
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

function askCredits(
  setConfirm: (state: CreditConfirmState | null) => void,
  resolver: { current: ((ok: boolean) => void) | null },
  state: CreditConfirmState,
): Promise<boolean> {
  return new Promise((resolve) => {
    resolver.current = resolve;
    setConfirm(state);
  });
}

export function SubmitFormEnhancer({
  category,
  revisionOf,
  longVideoAllowed = false,
  pack,
  initialNeedPdf = false,
  hybridQueueOpen = true,
}: {
  category: SubmitCategoryId;
  revisionOf?: string;
  longVideoAllowed?: boolean;
  pack?: string;
  initialNeedPdf?: boolean;
  hybridQueueOpen?: boolean;
}) {
  const router = useRouter();
  const queueSelected = QUEUE_CATEGORY_IDS.includes(category);
  const textSelected = category === "text";
  const [needPdf, setNeedPdf] = useState(initialNeedPdf);
  const [working, setWorking] = useState(false);
  const [creditState, setCreditState] = useState<CreditConfirmState | null>(null);
  const creditResolver = useRef<((ok: boolean) => void) | null>(null);

  function closeCredits(ok: boolean) {
    const resolve = creditResolver.current;
    creditResolver.current = null;
    setCreditState(null);
    resolve?.(ok);
  }

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

    async function confirmHybrid(opts: {
      category: string;
      durationSeconds?: number;
      pdf?: boolean;
    }): Promise<{ cost: number; ok: boolean }> {
      const kind = hybridJobKindForCategory(opts.category, { pdf: opts.pdf });
      const cost = creditsForHybridJob(kind, opts.durationSeconds);
      const paid = getPaidPack();
      const balance = paid?.credits ?? 0;
      const billed = kind === "timed" ? billedMinutes(opts.durationSeconds ?? 0) : undefined;
      const clock =
        kind === "timed" && opts.durationSeconds != null
          ? formatClock(opts.durationSeconds)
          : undefined;
      const ok = await askCredits(setCreditState, creditResolver, {
        noun: creditNoun(opts.category, { pdf: opts.pdf }),
        clock,
        cost,
        balance,
        billedMinutes: billed,
      });
      return { cost, ok };
    }

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

      const resetBtn = () => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit";
        }
      };

      try {
        if (queueSelected) {
          if (!hybridQueueOpen) {
            throw new Error("Hybrid uploads are closed. Use the Text tab for free AI.");
          }
          const file = fileInput?.files?.[0];
          const context = textarea instanceof HTMLTextAreaElement ? textarea.value.trim() : "";
          if (!file) throw new Error("Choose a file first.");
          if (!context) throw new Error("Add context for your file.");

          const paid = getPaidPack();
          const effectivePack = pack || paid?.tier || "";
          const privateForced = isPrivatePack(effectivePack) || isPrivatePack(paid?.tier);
          const shareBox = form.querySelector<HTMLInputElement>('input[name="share"]');
          const shareOn = privateForced ? false : Boolean(shareBox?.checked);

          let duration: number | undefined;
          try {
            if (file.type.startsWith("video/") || category === "video") {
              duration = await mediaDuration(file, "video");
              if (duration > VIDEO_CAP_SECONDS && !longVideoAllowed && !isPrivatePack(effectivePack)) {
                throw new Error("Video over 2 minutes needs Hybrid PRO.");
              }
            } else if (file.type.startsWith("audio/") || category === "music") {
              duration = await mediaDuration(file, "audio");
            }
          } catch (err) {
            if (err instanceof Error && err.message.includes("Hybrid PRO")) throw err;
            duration = 0;
          }

          const { cost, ok } = await confirmHybrid({
            category,
            durationSeconds: duration,
          });
          if (!ok) {
            resetBtn();
            return;
          }
          const packNow = getPaidPack();
          if (!packNow || packNow.credits < cost) {
            throw new Error("Not enough Hybrid credits. Open Pricing.");
          }

          setWorking(true);

          const body = new FormData();
          body.append("category", category);
          body.append("context", context);
          body.append("file", file);
          body.append("acceptTerms", "1");
          body.append("share", shareOn ? "1" : "0");
          if (effectivePack) body.append("pack", effectivePack);
          const model = form.querySelector<HTMLSelectElement>('select[name="model"]')?.value;
          if (model) body.append("model", model);
          if (duration != null) body.append("durationSeconds", String(duration));

          const res = await fetch("/api/queue", { method: "POST", body });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Upload failed");
          if (typeof data.id !== "string" || !isJobId(data.id)) throw new Error("Upload failed");

          spendPaidCredits(cost);

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

        const willQueuePdf = Boolean(pdfFile && isOverWordLimit(content));
        if (!willQueuePdf && getDailyUsage() >= getDailyLimit()) {
          throw new Error(`Free limit is ${getDailyLimit()} AI opinions today. Come back tomorrow.`);
        }
        if (willQueuePdf && !hybridQueueOpen) {
          throw new Error("Long PDFs need Hybrid. Uploads are closed right now.");
        }
        let pdfCost = 0;
        if (willQueuePdf) {
          const { cost, ok } = await confirmHybrid({ category: "documents", pdf: true });
          if (!ok) {
            resetBtn();
            return;
          }
          const packNow = getPaidPack();
          if (!packNow || packNow.credits < cost) {
            throw new Error("Long PDFs need Hybrid credits. Open Pricing.");
          }
          pdfCost = cost;
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
          const cost =
            pdfCost ||
            creditsForHybridJob(hybridJobKindForCategory("documents", { pdf: true }));
          const packNow = getPaidPack();
          if (packNow && packNow.credits >= cost) {
            spendPaidCredits(cost);
          }
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
        resetBtn();
      }
    }

    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [category, hybridQueueOpen, longVideoAllowed, pack, queueSelected, revisionOf, router, textSelected]);

  return (
    <>
      <PdfNeedModal open={needPdf} onClose={() => setNeedPdf(false)} variant="submit" />
      <CreditConfirmModal
        open={Boolean(creditState)}
        state={creditState}
        onCancel={() => closeCredits(false)}
        onConfirm={() => closeCredits(true)}
      />
      <OpinionWorkingModal open={working} />
    </>
  );
}
