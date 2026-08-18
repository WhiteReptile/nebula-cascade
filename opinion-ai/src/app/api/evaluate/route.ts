import { NextResponse } from "next/server";
import { getDailyLimit } from "@/lib/constants";
import { evaluateSubmission } from "@/lib/evaluate/pipeline";
import { isCategoryId } from "@/lib/categories";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const context = typeof body.context === "string" ? body.context.trim() : "";
    const revisionOf = typeof body.revisionOf === "string" ? body.revisionOf : undefined;
    const category = isCategoryId(body.category) ? body.category : undefined;

    if (!category) {
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

    const verdict = await evaluateSubmission(content, revisionOf, category, context);
    return NextResponse.json({
      verdict,
      meta: { dailyLimit: getDailyLimit(), demoMode: !process.env.OPENAI_API_KEY },
    });
  } catch {
    return NextResponse.json({ error: "Evaluation failed." }, { status: 500 });
  }
}
