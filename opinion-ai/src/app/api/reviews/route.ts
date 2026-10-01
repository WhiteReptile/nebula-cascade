import { NextResponse } from "next/server";
import { getCategory } from "@/lib/categories";
import { isJobComplete } from "@/lib/job-lifecycle";
import { jobToVerdict } from "@/lib/job-verdict";
import { publicReviewsOpen } from "@/lib/gates";
import { listJobs } from "@/lib/queue";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Public shared feed only.
 * Requires explicit share === true and a completed opinion.
 * Private / PRO / opted-out jobs are never listed.
 */
export async function GET() {
  if (!publicReviewsOpen()) {
    return NextResponse.json({ reviews: [] });
  }
  const jobs = await listJobs();
  const reviews = jobs
    .filter((job) => job.share === true && isJobComplete(job))
    .map((job) => {
      const framework = getCategory(job.category);
      const verdict = jobToVerdict(job);
      if (!verdict) return null;
      return {
        id: job.id,
        status: "done" as const,
        categoryLabel: framework.label,
        scoreContext: framework.scoreContext,
        createdAt: job.createdAt,
        verdict,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item != null);
  return NextResponse.json({ reviews });
}
