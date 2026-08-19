import { NextResponse } from "next/server";
import { getDailyLimit } from "@/lib/constants";
import { evaluateSubmission, getLlmConfig } from "@/lib/evaluate/pipeline";
import { isCategoryId } from "@/lib/categories";
import { recordOpinion } from "@/lib/opinion-count";
import { isExaminerModel, isQueueCategory } from "@/lib/queue-shared";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const context = typeof body.context === "string" ? body.context.trim() : "";
    const revisionOf = typeof body.revisionOf === "string" ? body.revisionOf : undefined;
    const category = isCategoryId(body.category) ? body.category : undefined;
    const model = isExaminerModel(body.model) ? body.model : "pro-examiner-v2";

    if (isQueueCategory(category)) {
      return NextResponse.json({ error: "That slot needs a file and a human." }, { status: 400 });
    }

    const resolved = category ?? "text";
    if (!isCategoryId(resolved)) {
      return NextResponse.json({ error: "Choose a category." }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: "Add the work or a file." }, { status: 400 });
    }
    if (content.length > 50000) {
      return NextResponse.json({ error: "Submission too long (max 50,000 characters)." }, { status: 400 });
    }
    if (context.length > 8000) {
      return NextResponse.json({ error: "Context is too long." }, { status: 400 });
    }

    const verdict = await evaluateSubmission(content, revisionOf, resolved, context, model);
    await recordOpinion(verdict.id);
    return NextResponse.json({
      verdict,
      meta: { dailyLimit: getDailyLimit(), demoMode: !getLlmConfig() },
    });
  } catch {
    return NextResponse.json({ error: "Evaluation failed." }, { status: 500 });
  }
}
