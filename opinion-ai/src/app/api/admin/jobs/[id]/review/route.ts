import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { opinionFromHumanNotes } from "@/lib/evaluate/pipeline";
import { getJob, isJobId, updateJob } from "@/lib/queue";

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

    const written = await opinionFromHumanNotes({
      notes,
      score,
      category: job.category,
      context: job.context,
      filename: job.filename,
      strengths,
      weaknesses,
    });

    const next = await updateJob(id, {
      notes,
      score: written.score,
      opinion: written.opinion,
      strengths: written.strengths,
      weaknesses: written.weaknesses,
      status: "done",
      reviewedAt: new Date().toISOString(),
    });

    return NextResponse.json({ job: next });
  } catch {
    return NextResponse.json({ error: "Could not write the opinion." }, { status: 500 });
  }
}
