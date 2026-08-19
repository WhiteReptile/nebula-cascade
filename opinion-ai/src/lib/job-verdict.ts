import { getCategory } from "./categories";
import type { QueueJob } from "./queue-shared";
import type { Verdict } from "./types";

export function jobToVerdict(job: QueueJob): Verdict | null {
  if (job.status !== "done" || job.score == null || !job.opinion?.trim()) return null;
  const framework = getCategory(job.category);
  const strengths = job.strengths ?? [];
  const weaknesses = job.weaknesses ?? [];
  return {
    id: job.id,
    category: job.category,
    categoryLabel: framework.label,
    scoreContext: framework.scoreContext,
    score: job.score,
    strengths,
    weaknesses,
    originality: "",
    execution: "",
    appeal: "",
    competition: "",
    potential: "",
    biggestProblem: weaknesses[0] ?? "",
    biggestOpportunity: strengths[0] ?? "",
    verdict: job.opinion.trim(),
    confidence: 80,
    analyst: {
      observations: ["Human review, then a short public opinion."],
      contradictions: [],
      comparableReferences: [],
    },
    steelman: {
      caseFor: strengths,
      caseAgainst: weaknesses,
    },
    submissionPreview: job.filename,
    createdAt: job.reviewedAt ?? job.createdAt,
    context: job.context,
  };
}
