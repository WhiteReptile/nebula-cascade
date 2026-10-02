import { NextResponse } from "next/server";
import { hasAcceptedTerms } from "@/lib/accept-terms";
import { isOverWordLimit } from "@/lib/content-limits";
import { resolveTextSubmission } from "@/lib/resolve-text-content";
import { evaluateSubmission, getLlmConfig } from "@/lib/evaluate/pipeline";
import { recordOpinion } from "@/lib/opinion-count";
import { recordLlmUsage } from "@/lib/llm-usage";
import { publicRedirect } from "@/lib/public-origin";
import { isExaminerModel } from "@/lib/queue-shared";
import { queueLongPdfJob } from "@/lib/queue-long-pdf";
import {
  attachGuestCookie,
  GUEST_COOKIE,
  guardFreeEvaluate,
  guardHybridQueue,
} from "@/lib/rate-limit";
import { saveVerdictRecord } from "@/lib/verdict-store";

export const runtime = "nodejs";

async function blockedRedirect(request: Request, gate: NextResponse | { guestId: string }) {
  if (!(gate instanceof NextResponse)) return null;
  const data = (await gate.clone().json()) as { code?: string };
  const path =
    data.code === "free_limit"
      ? "/submit?error=limit"
      : data.code === "llm_cap"
        ? "/submit?error=llm"
        : data.code === "queue_limit"
          ? "/submit?error=queuelimit"
          : data.code === "hybrid_closed"
            ? "/submit?error=hybrid"
            : "/submit?error=closed";
  const next = publicRedirect(request, path);
  const guest = gate.cookies.get(GUEST_COOKIE)?.value;
  if (guest) attachGuestCookie(next, guest, request);
  return next;
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    if (!hasAcceptedTerms(form.get("acceptTerms"))) {
      return publicRedirect(request, "/submit?error=terms");
    }
    const pasted = String(form.get("content") ?? "").trim();
    const revisionOf = String(form.get("revisionOf") ?? "").trim() || undefined;
    const modelRaw = String(form.get("model") ?? "");
    const model = isExaminerModel(modelRaw) ? modelRaw : "pro-examiner-v2";
    const pdfRaw = form.get("pdf");
    const pdfFile = pdfRaw instanceof File && pdfRaw.size > 0 ? pdfRaw : null;

    if (isOverWordLimit(pasted) && pdfFile) {
      const gate = await guardHybridQueue(request);
      const blocked = await blockedRedirect(request, gate);
      if (blocked) return blocked;
      const id = await queueLongPdfJob({ file: pdfFile, notes: pasted, model });
      const next = publicRedirect(request, `/submit?queued=${id}`);
      if (!(gate instanceof NextResponse)) attachGuestCookie(next, gate.guestId, request);
      return next;
    }
    if (isOverWordLimit(pasted) && !pdfFile) {
      return publicRedirect(request, "/submit?error=needpdf");
    }

    let resolved;
    try {
      resolved = await resolveTextSubmission({
        pasted,
        pdfFile,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Add your text or a PDF.";
      if (message.includes("too large")) {
        return publicRedirect(request, "/submit?error=long");
      }
      return publicRedirect(request, "/submit?error=empty");
    }

    if (isOverWordLimit(resolved.content)) {
      if (pdfFile) {
        const gate = await guardHybridQueue(request);
        const blocked = await blockedRedirect(request, gate);
        if (blocked) return blocked;
        const id = await queueLongPdfJob({ file: pdfFile, notes: pasted, model });
        const next = publicRedirect(request, `/submit?queued=${id}`);
        if (!(gate instanceof NextResponse)) attachGuestCookie(next, gate.guestId, request);
        return next;
      }
      return publicRedirect(request, "/submit?error=needpdf");
    }

    const gate = await guardFreeEvaluate(request);
    const blocked = await blockedRedirect(request, gate);
    if (blocked) return blocked;

    const demoMode = !getLlmConfig();
    const verdict = await evaluateSubmission(
      resolved.content,
      revisionOf,
      "text",
      resolved.context ?? "",
      model,
    );
    await saveVerdictRecord(verdict);
    await recordOpinion(verdict.id);
    await recordLlmUsage(demoMode ? "demo" : "evaluate", demoMode);

    const next = publicRedirect(request, `/result/${verdict.id}`);
    if (!(gate instanceof NextResponse)) attachGuestCookie(next, gate.guestId, request);
    return next;
  } catch {
    return publicRedirect(request, "/submit?error=failed");
  }
}
