import { getCategory } from "@/lib/categories";
import { isJobComplete } from "@/lib/job-lifecycle";
import { listJobs } from "@/lib/queue";
import { listVerdictRecords } from "@/lib/verdict-store";
import type { HistoryEntry } from "@/lib/types";

export async function getServerHistory(): Promise<HistoryEntry[]> {
  const byId = new Map<string, HistoryEntry>();

  for (const verdict of await listVerdictRecords()) {
    byId.set(verdict.id, {
      id: verdict.id,
      score: verdict.score,
      categoryLabel: verdict.categoryLabel,
      scoreContext: verdict.scoreContext,
      verdictPreview: verdict.verdict.slice(0, 100),
      createdAt: verdict.createdAt,
    });
  }

  const jobs = await listJobs();
  for (const job of jobs) {
    if (job.share === false) continue;
    const framework = getCategory(job.category);
    if (isJobComplete(job) && job.opinion?.trim() && job.score != null) {
      byId.set(job.id, {
        id: job.id,
        score: job.score,
        categoryLabel: framework.label,
        scoreContext: framework.scoreContext,
        verdictPreview: job.opinion.trim().slice(0, 100),
        createdAt: job.reviewedAt ?? job.completedAt ?? job.createdAt,
      });
      continue;
    }
    byId.set(job.id, {
      id: job.id,
      score: 0,
      categoryLabel: framework.label,
      scoreContext: framework.scoreContext,
      verdictPreview: "Waiting for a human…",
      createdAt: job.createdAt,
      pending: true,
    });
  }

  return [...byId.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
