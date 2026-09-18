import { NextResponse } from "next/server";
import { getDailyLimit } from "@/lib/constants";
import { evaluateSubmission, getLlmConfig } from "@/lib/evaluate/pipeline";
import { isCategoryId } from "@/lib/categories";
import { recordOpinion } from "@/lib/opinion-count";
import { recordLlmUsage } from "@/lib/llm-usage";
import { resolveTextSubmission } from "@/lib/resolve-text-content";
import { isExaminerModel, isQueueCategory, type ExaminerModel } from "@/lib/queue-shared";
import { isFreeAiCategory } from "@/lib/submit-form-slots";
import { saveVerdictRecord } from "@/lib/verdict-store";
import type { CategoryId } from "@/lib/types";

export const runtime = "nodejs";

function withOptionalFileNote(content: string, file: File | null): string {
  if (!file || file.size === 0) return content;
  return `${content}\n\n[User attached a file: ${file.name}]`;
}

async function evaluateFromFields(input: {
  content: string;
  context: string;
  revisionOf?: string;
  category: string;
  model: ExaminerModel;
}) {
  const resolved = isCategoryId(input.category) ? input.category : "text";
  if (!isCategoryId(resolved)) {
    return NextResponse.json({ error: "Choose a category." }, { status: 400 });
  }
  if (isQueueCategory(resolved) || !isFreeAiCategory(resolved)) {
    return NextResponse.json({ error: "That slot needs a file and a human." }, { status: 400 });
  }
  if (!input.content) {
    return NextResponse.json({ error: "Add the work or a description." }, { status: 400 });
  }
  if (input.content.length > 50000) {
    return NextResponse.json({ error: "Submission too long (max 50,000 characters)." }, { status: 400 });
  }
  if (input.context.length > 8000) {
    return NextResponse.json({ error: "Context is too long." }, { status: 400 });
  }

  const demoMode = !getLlmConfig();
  const verdict = await evaluateSubmission(
    input.content,
    input.revisionOf,
    resolved,
    input.context,
    input.model,
  );
  await saveVerdictRecord(verdict);
  await recordOpinion(verdict.id);
  await recordLlmUsage(demoMode ? "demo" : "evaluate", demoMode);
  return NextResponse.json({
    verdict,
    meta: { dailyLimit: getDailyLimit(), demoMode },
  });
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const pasted = typeof form.get("content") === "string" ? String(form.get("content")).trim() : "";
      const revisionOf = typeof form.get("revisionOf") === "string" ? String(form.get("revisionOf")) : undefined;
      const categoryRaw = typeof form.get("category") === "string" ? String(form.get("category")) : "text";
      const category = (isCategoryId(categoryRaw) ? categoryRaw : "text") as CategoryId;
      const modelRaw = form.get("model");
      const model = isExaminerModel(modelRaw) ? modelRaw : "pro-examiner-v2";
      const pdfRaw = form.get("pdf");
      const fileRaw = form.get("file");
      const attached = fileRaw instanceof File && fileRaw.size > 0 ? fileRaw : null;

      if (category === "text") {
        let resolved;
        try {
          resolved = await resolveTextSubmission({
            pasted,
            pdfFile: pdfRaw instanceof File ? pdfRaw : null,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Add your text or a PDF.";
          return NextResponse.json({ error: message }, { status: 400 });
        }

        return evaluateFromFields({
          content: resolved.content,
          context: resolved.context ?? "",
          revisionOf,
          category,
          model,
        });
      }

      if (!pasted) {
        return NextResponse.json({ error: "Describe what you want judged." }, { status: 400 });
      }

      return evaluateFromFields({
        content: withOptionalFileNote(pasted, attached),
        context: "",
        revisionOf,
        category,
        model,
      });
    }

    const body = await request.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const context = typeof body.context === "string" ? body.context.trim() : "";
    const revisionOf = typeof body.revisionOf === "string" ? body.revisionOf : undefined;
    const category = isCategoryId(body.category) ? body.category : undefined;
    const model = isExaminerModel(body.model) ? body.model : "pro-examiner-v2";

    if (category && (isQueueCategory(category) || !isFreeAiCategory(category))) {
      return NextResponse.json({ error: "That slot needs a file and a human." }, { status: 400 });
    }

    return evaluateFromFields({
      content,
      context,
      revisionOf,
      category: category ?? "text",
      model,
    });
  } catch {
    return NextResponse.json({ error: "Evaluation failed." }, { status: 500 });
  }
}
