export const JOB_STATUSES = [
  "UPLOADED",
  "PROCESSING",
  "HUMAN_REVIEW",
  "FINALIZING",
  "COMPLETED",
  "FILE_DELETED",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

type LegacyJobStatus = "pending" | "done";

type JobLike = { status: string; fileDeletedAt?: string };

export function normalizeJobStatus(status: string): JobStatus {
  if (status === "pending") return "HUMAN_REVIEW";
  if (status === "done") return "COMPLETED";
  if (JOB_STATUSES.includes(status as JobStatus)) return status as JobStatus;
  return "HUMAN_REVIEW";
}

export function isJobComplete(statusOrJob: string | JobLike): boolean {
  const status = typeof statusOrJob === "string" ? statusOrJob : statusOrJob.status;
  const normalized = normalizeJobStatus(status);
  return normalized === "COMPLETED" || normalized === "FILE_DELETED";
}

export function isJobAwaitingHuman(statusOrJob: string | JobLike): boolean {
  const status = typeof statusOrJob === "string" ? statusOrJob : statusOrJob.status;
  const normalized = normalizeJobStatus(status);
  return (
    normalized === "UPLOADED" ||
    normalized === "PROCESSING" ||
    normalized === "HUMAN_REVIEW"
  );
}

export function jobHasUploadFile(job: JobLike): boolean {
  if (job.fileDeletedAt) return false;
  return normalizeJobStatus(job.status) !== "FILE_DELETED";
}

export function jobSortRank(status: string): number {
  const normalized = normalizeJobStatus(status);
  if (normalized === "HUMAN_REVIEW" || normalized === "PROCESSING" || normalized === "UPLOADED") {
    return 0;
  }
  if (normalized === "FINALIZING") return 1;
  return 2;
}

export function isLegacyStatus(status: string): status is LegacyJobStatus {
  return status === "pending" || status === "done";
}

export function displayJobStatus(status: string): string {
  return normalizeJobStatus(status);
}
