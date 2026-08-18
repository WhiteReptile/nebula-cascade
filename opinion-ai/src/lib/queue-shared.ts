export const QUEUE_CATEGORIES = ["music", "documents", "video"] as const;
export type QueueCategory = (typeof QUEUE_CATEGORIES)[number];

export const MAX_QUEUE_FILE_BYTES = 80 * 1024 * 1024;
export const VIDEO_CAP_SECONDS = 120;

export type JobStatus = "pending" | "done";

export type QueueJob = {
  id: string;
  category: QueueCategory;
  filename: string;
  mimeType: string;
  size: number;
  context: string;
  status: JobStatus;
  createdAt: string;
  durationSeconds?: number;
  notes?: string;
  score?: number;
  opinion?: string;
  strengths?: string[];
  weaknesses?: string[];
  reviewedAt?: string;
};

export function isQueueCategory(value: unknown): value is QueueCategory {
  return typeof value === "string" && QUEUE_CATEGORIES.includes(value as QueueCategory);
}

export function isJobId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function longVideoAllowed(): boolean {
  return process.env.PRO_LONG_VIDEO === "1";
}
