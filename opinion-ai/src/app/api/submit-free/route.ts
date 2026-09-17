import { evaluateSubmission, getLlmConfig } from "@/lib/evaluate/pipeline";
import { isCategoryId } from "@/lib/categories";
import { recordOpinion } from "@/lib/opinion-count";
import { recordLlmUsage } from "@/lib/llm-usage";
import { publicRedirect } from "@/lib/public-origin";
import { resolveTextSubmission } from "@/lib/resolve-text-content";
import { isExaminerModel, isQueueCategory } from "@/lib/queue-shared";
import { isFreeAiCategory } from "@/lib/submit-form-slots";
import { saveVerdictRecord } from "@/lib/verdict-store";
import type { CategoryId } from "@/lib/types";

export const runtime = "nodejs";

function withOptionalFileNote(content: string, file: File | null): string {
  if (!file || file.size === 0) return content;
  return `${content}\n\n[User attached a file: ${file.name}]`;
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const categoryRaw = String(form.get("category") ?? "text").trim();
    const category = (isCategoryId(categoryRaw) ? categoryRaw : "text") as CategoryId;
    if (isQueueCategory(category) || !isFreeAiCategory(category)) {
      return publicRedirect(request, "/submit?error=category");
    }

    const pasted = String(form.get("content") ?? "").trim();
    const revisionOf = String(form.get("revisionOf") ?? "").trim() || undefined;
    const modelRaw = String(form.get("model") ?? "");
    const model = isExaminerModel(modelRaw) ? modelRaw : "pro-examiner-v2";
    const pdfRaw = form.get("pdf");
    const fileRaw = form.get("file");
    const attached = fileRaw instanceof File && fileRaw.size > 0 ? fileRaw : null;

    let content: string;
    let context = "";

    if (category === "text") {
      try {
        const resolved = await resolveTextSubmission({
          pasted,
          pdfFile: pdfRaw instanceof File ? pdfRaw : null,
        });
        content = resolved.content;
        context = resolved.context ?? "";
      } catch {
        return publicRedirect(request, "/submit?error=empty");
      }
    } else {
      if (!pasted) {
        return publicRedirect(request, "/submit?error=empty");
      }
      content = withOptionalFileNote(pasted, attached);
    }

    if (content.length > 50000) {
      return publicRedirect(request, "/submit?error=long");
    }

    const demoMode = !getLlmConfig();
    const verdict = await evaluateSubmission(content, revisionOf, category, context, model);
    await saveVerdictRecord(verdict);
    await recordOpinion(verdict.id);
    await recordLlmUsage(demoMode ? "demo" : "evaluate", demoMode);

    return publicRedirect(request, `/result/${verdict.id}`);
  } catch {
    return publicRedirect(request, "/submit?error=failed");
  }
}
