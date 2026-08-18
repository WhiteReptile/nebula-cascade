import { NextResponse } from "next/server";
import { getDailyLimit } from "@/lib/constants";
import { evaluateSubmission } from "@/lib/evaluate/pipeline";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const revisionOf = typeof body.revisionOf === "string" ? body.revisionOf : undefined;

    if (!content || content.length < 20) {
      return NextResponse.json({ error: "Submission must be at least 20 characters." }, { status: 400 });
    }
    if (content.length > 50000) {
      return NextResponse.json({ error: "Submission too long (max 50,000 characters)." }, { status: 400 });
    }

    const verdict = await evaluateSubmission(content, revisionOf);
    return NextResponse.json({
      verdict,
      meta: { dailyLimit: getDailyLimit(), demoMode: !process.env.OPENAI_API_KEY },
    });
  } catch {
    return NextResponse.json({ error: "Evaluation failed." }, { status: 500 });
  }
}
