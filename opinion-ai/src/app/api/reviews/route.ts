import { NextResponse } from "next/server";
import { getCategory } from "@/lib/categories";
import { jobToVerdict } from "@/lib/job-verdict";
import { listJobs } from "@/lib/queue";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const jobs = await listJobs();
  const reviews = jobs.map((job) => {
    const framework = getCategory(job.category);
    const verdict = jobToVerdict(job);
    if (verdict) {
      return {
        id: job.id,
        status: "done" as const,
        categoryLabel: framework.label,
        scoreContext: framework.scoreContext,
        createdAt: job.createdAt,
        verdict,
      };
    }
    return {
      id: job.id,
      status: "pending" as const,
      categoryLabel: framework.label,
      scoreContext: framework.scoreContext,
      createdAt: job.createdAt,
    };
  });
  return NextResponse.json({ reviews });
}
