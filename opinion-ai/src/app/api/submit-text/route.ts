import { hasAcceptedTerms } from "@/lib/accept-terms";
import { isOverWordLimit } from "@/lib/content-limits";
import { resolveTextSubmission } from "@/lib/resolve-text-content";
import { evaluateSubmission, getLlmConfig } from "@/lib/evaluate/pipeline";
import { recordOpinion } from "@/lib/opinion-count";
import { recordLlmUsage } from "@/lib/llm-usage";
import { publicRedirect } from "@/lib/public-origin";
import { isExaminerModel } from "@/lib/queue-shared";
import { queueLongPdfJob } from "@/lib/queue-long-pdf";
import { saveVerdictRecord } from "@/lib/verdict-store";

export const runtime = "nodejs";

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
      const id = await queueLongPdfJob({ file: pdfFile, notes: pasted, model });
      return publicRedirect(request, `/submit?queued=${id}`);
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
        const id = await queueLongPdfJob({ file: pdfFile, notes: pasted, model });
        return publicRedirect(request, `/submit?queued=${id}`);
      }
      return publicRedirect(request, "/submit?error=needpdf");
    }

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

    return publicRedirect(request, `/result/${verdict.id}`);
  } catch {
    return publicRedirect(request, "/submit?error=failed");
  }
}
