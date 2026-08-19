import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { QueueJob } from "./queue-shared";

export type { QueueJob, QueueCategory, JobStatus } from "./queue-shared";
export {
  EXAMINER_MODELS,
  QUEUE_CATEGORIES,
  MAX_QUEUE_FILE_BYTES,
  VIDEO_CAP_SECONDS,
  isExaminerModel,
  isQueueCategory,
  isHumanJobCategory,
  isJobId,
  longVideoAllowed,
} from "./queue-shared";

function dataRoot(): string {
  const cwd = process.cwd();
  return path.basename(cwd) === "opinion-ai" ? cwd : path.join(cwd, "opinion-ai");
}

export function dataDir(): string {
  return path.join(dataRoot(), "data");
}

export function uploadsDir(): string {
  return path.join(dataDir(), "uploads");
}

export function jobsPath(): string {
  return path.join(dataDir(), "jobs.json");
}

export function uploadPath(id: string): string {
  return path.join(uploadsDir(), id);
}

let writeChain: Promise<unknown> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeChain.then(fn, fn);
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function ensureStore(): Promise<void> {
  await mkdir(uploadsDir(), { recursive: true });
}

async function readJobsUnlocked(): Promise<QueueJob[]> {
  await ensureStore();
  try {
    const raw = await readFile(jobsPath(), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as QueueJob[]) : [];
  } catch {
    return [];
  }
}

async function writeJobsUnlocked(jobs: QueueJob[]): Promise<void> {
  await ensureStore();
  await writeFile(jobsPath(), `${JSON.stringify(jobs, null, 2)}\n`, "utf8");
}

export function listJobs(): Promise<QueueJob[]> {
  return enqueue(async () => {
    const jobs = await readJobsUnlocked();
    return [...jobs].sort((a, b) => {
      if (a.status !== b.status) return a.status === "pending" ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  });
}

export function getJob(id: string): Promise<QueueJob | null> {
  return enqueue(async () => {
    const jobs = await readJobsUnlocked();
    return jobs.find((job) => job.id === id) ?? null;
  });
}

export function addJob(job: QueueJob, file: Buffer): Promise<QueueJob> {
  return enqueue(async () => {
    await writeFile(uploadPath(job.id), file);
    const jobs = await readJobsUnlocked();
    jobs.push(job);
    await writeJobsUnlocked(jobs);
    return job;
  });
}

export function updateJob(id: string, patch: Partial<QueueJob>): Promise<QueueJob | null> {
  return enqueue(async () => {
    const jobs = await readJobsUnlocked();
    const index = jobs.findIndex((job) => job.id === id);
    if (index < 0) return null;
    const next = { ...jobs[index], ...patch, id: jobs[index].id };
    jobs[index] = next;
    await writeJobsUnlocked(jobs);
    return next;
  });
}
