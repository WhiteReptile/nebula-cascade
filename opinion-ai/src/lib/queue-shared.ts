import type { JobStatus } from "./job-lifecycle";

export type { JobStatus } from "./job-lifecycle";

export const QUEUE_CATEGORIES = ["music", "documents", "video", "physical_appearance"] as const;
export type QueueCategory = (typeof QUEUE_CATEGORIES)[number];
export const EXAMINER_MODELS = ["pro-examiner-v1", "pro-examiner-v2"] as const;
export type ExaminerModel = (typeof EXAMINER_MODELS)[number];

export const MAX_QUEUE_FILE_BYTES = 80 * 1024 * 1024;
export const VIDEO_CAP_SECONDS = 120;

export type QueueJob = {
  id: string;
  category: QueueCategory | "text";
  filename: string;
  mimeType: string;
  size: number;
  context: string;
  status: JobStatus | "pending" | "done";
  createdAt: string;
  uploadedAt?: string;
  processedAt?: string;
  completedAt?: string;
  fileDeletedAt?: string;
  durationSeconds?: number;
  notes?: string;
  score?: number;
  opinion?: string;
  strengths?: string[];
  weaknesses?: string[];
  reviewedAt?: string;
  lastError?: string;
  share?: boolean;
  examinerModel?: ExaminerModel;
};

export function isQueueCategory(value: unknown): value is QueueCategory {
  return typeof value === "string" && QUEUE_CATEGORIES.includes(value as QueueCategory);
}

export function isHumanJobCategory(value: unknown): value is QueueCategory | "text" {
  return isQueueCategory(value) || value === "text";
}

export function isExaminerModel(value: unknown): value is ExaminerModel {
  return typeof value === "string" && EXAMINER_MODELS.includes(value as ExaminerModel);
}

export function isJobId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function longVideoAllowed(): boolean {
  return process.env.PRO_LONG_VIDEO === "1";
}
