import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { opinionFromHumanNotes } from "@/lib/evaluate/pipeline";
import { isJobAwaitingHuman, isJobComplete } from "@/lib/job-lifecycle";
import { recordOpinion } from "@/lib/opinion-count";
import { finalizeJobAndDeleteUpload, getJob, isJobId, transitionJob } from "@/lib/queue";

function parseTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 30);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  if (!isJobId(id)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const job = await getJob(id);
  if (!job) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (isJobComplete(job)) {
    return NextResponse.json({ error: "Job already completed." }, { status: 400 });
  }
  if (!isJobAwaitingHuman(job)) {
    return NextResponse.json(
      { error: `Job is not ready for review (status: ${job.status}).` },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";
    if (!notes) {
      return NextResponse.json({ error: "How do you feel about it?" }, { status: 400 });
    }
    if (notes.length > 20000) {
      return NextResponse.json({ error: "Notes are too long." }, { status: 400 });
    }

    let score: number | undefined;
    if (body.score !== undefined && body.score !== null && body.score !== "") {
      const n = typeof body.score === "number" ? body.score : Number(body.score);
      if (!Number.isFinite(n)) {
        return NextResponse.json({ error: "Score must be 0–100." }, { status: 400 });
      }
      score = Math.min(100, Math.max(0, Math.round(n)));
    }

    const strengths = parseTags(body.strengths);
    const weaknesses = parseTags(body.weaknesses);

    await transitionJob(id, "FINALIZING");

    const written = await opinionFromHumanNotes({
      notes,
      score,
      category: job.category,
      context: job.context,
      filename: job.filename,
      strengths,
      weaknesses,
      model: job.examinerModel ?? "pro-examiner-v2",
    });

    const next = await finalizeJobAndDeleteUpload(id, {
      notes,
      score: written.score,
      opinion: written.opinion,
      strengths: written.strengths,
      weaknesses: written.weaknesses,
      reviewedAt: new Date().toISOString(),
      share: job.share,
    });

    if (!next) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    await recordOpinion(id);
    return NextResponse.json({ job: next });
  } catch (err) {
    await transitionJob(id, "HUMAN_REVIEW", {
      lastError: err instanceof Error ? err.message : "Finalize failed",
    });
    console.error("admin review POST", err);
    return NextResponse.json({ error: "Could not write the opinion." }, { status: 500 });
  }
}
