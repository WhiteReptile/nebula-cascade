import { mkdir, readdir, readFile, stat, unlink, writeFile } from "fs/promises";
import path from "path";
import {
  isJobComplete,
  jobHasUploadFile,
  jobSortRank,
  normalizeJobStatus,
  type JobStatus,
} from "./job-lifecycle";
import type { QueueJob } from "./queue-shared";
import { isJobId, isTemporaryUploadCategory } from "./queue-shared";

export type { QueueJob, QueueCategory, JobStatus } from "./queue-shared";
export {
  EXAMINER_MODELS,
  TEMPORARY_UPLOAD_CATEGORIES,
  isTemporaryUploadCategory,
  MAX_QUEUE_FILE_BYTES,
  VIDEO_CAP_SECONDS,
  isExaminerModel,
  isQueueCategory,
  isHumanJobCategory,
  isJobId,
  longVideoAllowed,
  normalizeQueueCategory,
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

function normalizeJob(job: QueueJob): QueueJob {
  return {
    ...job,
    status: normalizeJobStatus(job.status),
  };
}

async function readJobsUnlocked(): Promise<QueueJob[]> {
  await ensureStore();
  try {
    const raw = await readFile(jobsPath(), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    const jobs = Array.isArray(parsed) ? (parsed as QueueJob[]) : [];
    return jobs.map(normalizeJob);
  } catch {
    return [];
  }
}

async function writeJobsUnlocked(jobs: QueueJob[]): Promise<void> {
  await ensureStore();
  await writeFile(jobsPath(), `${JSON.stringify(jobs, null, 2)}\n`, "utf8");
}

async function uploadExists(id: string): Promise<boolean> {
  try {
    await stat(uploadPath(id));
    return true;
  } catch {
    return false;
  }
}

async function deleteUploadFile(id: string): Promise<void> {
  try {
    await unlink(uploadPath(id));
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw err;
  }
}

/** Remove uploads for jobs that already have a persisted result (including legacy done). */
async function cleanupCompletedUploads(jobs: QueueJob[]): Promise<boolean> {
  let changed = false;
  const now = new Date().toISOString();

  for (let index = 0; index < jobs.length; index += 1) {
    const job = jobs[index];
    if (!isJobComplete(job) || !jobHasUploadFile(job)) continue;
    if (!(await uploadExists(job.id))) {
      if (normalizeJobStatus(job.status) !== "FILE_DELETED") {
        jobs[index] = {
          ...job,
          status: "FILE_DELETED",
          fileDeletedAt: job.fileDeletedAt ?? now,
        };
        changed = true;
      }
      continue;
    }

    try {
      await deleteUploadFile(job.id);
      jobs[index] = {
        ...job,
        status: "FILE_DELETED",
        fileDeletedAt: now,
        lastError: undefined,
      };
      changed = true;
    } catch (err) {
      jobs[index] = {
        ...job,
        lastError: err instanceof Error ? err.message : "Failed to delete upload",
      };
      changed = true;
    }
  }

  return changed;
}

/** Remove upload files with no matching job, or left behind after completion. */
async function cleanupOrphanedUploads(jobs: QueueJob[]): Promise<void> {
  await ensureStore();
  let names: string[];
  try {
    names = await readdir(uploadsDir());
  } catch {
    return;
  }

  const jobById = new Map(jobs.map((job) => [job.id, job]));

  for (const name of names) {
    if (!isJobId(name)) continue;
    const job = jobById.get(name);
    if (!job || (isJobComplete(job) && !jobHasUploadFile(job))) {
      try {
        await deleteUploadFile(name);
      } catch {
        /* retry on next read */
      }
    }
  }
}

export function listJobs(): Promise<QueueJob[]> {
  return enqueue(async () => {
    const jobs = await readJobsUnlocked();
    if (await cleanupCompletedUploads(jobs)) {
      await writeJobsUnlocked(jobs);
    }
    await cleanupOrphanedUploads(jobs);
    return [...jobs].sort((a, b) => {
      const rank = jobSortRank(a.status) - jobSortRank(b.status);
      if (rank !== 0) return rank;
      return b.createdAt.localeCompare(a.createdAt);
    });
  });
}

export function getJob(id: string): Promise<QueueJob | null> {
  return enqueue(async () => {
    const jobs = await readJobsUnlocked();
    const index = jobs.findIndex((entry) => entry.id === id);
    if (index < 0) return null;

    if (await cleanupCompletedUploads(jobs)) {
      await writeJobsUnlocked(jobs);
    }
    return jobs[index] ? normalizeJob(jobs[index]) : null;
  });
}

export function addJob(job: Omit<QueueJob, "status"> & Partial<Pick<QueueJob, "status">>, file: Buffer): Promise<QueueJob> {
  return enqueue(async () => {
    if (job.category !== "text" && !isTemporaryUploadCategory(job.category)) {
      throw new Error("Unsupported upload category");
    }
    const now = new Date().toISOString();
    await writeFile(uploadPath(job.id), file);

    const jobs = await readJobsUnlocked();
    const base: QueueJob = {
      ...job,
      status: "UPLOADED",
      uploadedAt: now,
    } as QueueJob;
    jobs.push(base);
    await writeJobsUnlocked(jobs);

    const index = jobs.length - 1;
    jobs[index] = { ...base, status: "PROCESSING", processedAt: now };
    await writeJobsUnlocked(jobs);

    const ready: QueueJob = { ...jobs[index], status: "HUMAN_REVIEW" };
    jobs[index] = ready;
    await writeJobsUnlocked(jobs);
    return ready;
  });
}

export function transitionJob(
  id: string,
  status: JobStatus,
  patch: Partial<QueueJob> = {},
): Promise<QueueJob | null> {
  return enqueue(async () => {
    const jobs = await readJobsUnlocked();
    const index = jobs.findIndex((job) => job.id === id);
    if (index < 0) return null;
    const next = { ...jobs[index], ...patch, status, id: jobs[index].id };
    jobs[index] = next;
    await writeJobsUnlocked(jobs);
    return next;
  });
}

export type JobResultPatch = {
  notes: string;
  score: number;
  opinion: string;
  strengths: string[];
  weaknesses: string[];
  reviewedAt?: string;
  share?: boolean;
};

export function finalizeJobAndDeleteUpload(
  id: string,
  result: JobResultPatch,
): Promise<QueueJob | null> {
  return enqueue(async () => {
    const jobs = await readJobsUnlocked();
    const index = jobs.findIndex((job) => job.id === id);
    if (index < 0) return null;

    const now = new Date().toISOString();
    const completed: QueueJob = {
      ...jobs[index],
      ...result,
      status: "COMPLETED",
      reviewedAt: result.reviewedAt ?? now,
      completedAt: now,
      lastError: undefined,
    };
    jobs[index] = completed;
    await writeJobsUnlocked(jobs);

    try {
      await deleteUploadFile(id);
    } catch (err) {
      jobs[index] = {
        ...completed,
        lastError: err instanceof Error ? err.message : "Failed to delete upload",
      };
      await writeJobsUnlocked(jobs);
      return jobs[index];
    }

    const deleted: QueueJob = {
      ...completed,
      status: "FILE_DELETED",
      fileDeletedAt: now,
      lastError: undefined,
    };
    jobs[index] = deleted;
    await writeJobsUnlocked(jobs);
    return deleted;
  });
}

export function updateJob(id: string, patch: Partial<QueueJob>): Promise<QueueJob | null> {
  return enqueue(async () => {
    const jobs = await readJobsUnlocked();
    const index = jobs.findIndex((job) => job.id === id);
    if (index < 0) return null;
    const next = {
      ...jobs[index],
      ...patch,
      id: jobs[index].id,
      ...(patch.status ? { status: normalizeJobStatus(patch.status) } : {}),
    };
    jobs[index] = next;
    await writeJobsUnlocked(jobs);
    return next;
  });
}

export { readJobsUnlocked };
