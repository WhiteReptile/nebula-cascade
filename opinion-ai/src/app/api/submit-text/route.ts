import { NextResponse } from "next/server";
import { evaluateSubmission, getLlmConfig } from "@/lib/evaluate/pipeline";
import { recordOpinion } from "@/lib/opinion-count";
import { recordLlmUsage } from "@/lib/llm-usage";
import { isExaminerModel } from "@/lib/queue-shared";
import { saveVerdictRecord } from "@/lib/verdict-store";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const content = String(form.get("content") ?? "").trim();
    const revisionOf = String(form.get("revisionOf") ?? "").trim() || undefined;
    const modelRaw = String(form.get("model") ?? "");
    const model = isExaminerModel(modelRaw) ? modelRaw : "pro-examiner-v2";

    if (!content) {
      return NextResponse.redirect(new URL("/submit?error=empty", request.url));
    }
    if (content.length > 50000) {
      return NextResponse.redirect(new URL("/submit?error=long", request.url));
    }

    const demoMode = !getLlmConfig();
    const verdict = await evaluateSubmission(content, revisionOf, "text", "", model);
    await saveVerdictRecord(verdict);
    await recordOpinion(verdict.id);
    await recordLlmUsage(demoMode ? "demo" : "evaluate", demoMode);

    return NextResponse.redirect(new URL(`/result/${verdict.id}`, request.url));
  } catch {
    return NextResponse.redirect(new URL("/submit?error=failed", request.url));
  }
}
