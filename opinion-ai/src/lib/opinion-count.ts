import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { dataDir, listJobs } from "@/lib/queue";

export const OPINION_COUNT_BASE = 110;

type CountStore = {
  extra: number;
  credited: string[];
};

let writeChain: Promise<unknown> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeChain.then(fn, fn);
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function storePath(): string {
  return path.join(dataDir(), "opinions.json");
}

function isStore(value: unknown): value is CountStore {
  if (!value || typeof value !== "object") return false;
  const extra = (value as CountStore).extra;
  const credited = (value as CountStore).credited;
  return Number.isInteger(extra) && extra >= 0 && Array.isArray(credited) && credited.every((id) => typeof id === "string");
}

async function readStoreUnlocked(): Promise<CountStore> {
  await mkdir(dataDir(), { recursive: true });
  try {
    const raw = await readFile(storePath(), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (isStore(parsed)) return { extra: parsed.extra, credited: [...parsed.credited] };
  } catch {
    /* first run */
  }
  return { extra: 0, credited: [] };
}

async function writeStoreUnlocked(store: CountStore): Promise<void> {
  await mkdir(dataDir(), { recursive: true });
  await writeFile(storePath(), `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function credit(store: CountStore, id: string): boolean {
  if (!id || store.credited.includes(id)) return false;
  store.credited.push(id);
  store.extra += 1;
  return true;
}

async function syncDoneJobs(store: CountStore): Promise<boolean> {
  const jobs = await listJobs();
  let changed = false;
  for (const job of jobs) {
    if (job.status !== "done" || !job.opinion?.trim()) continue;
    if (credit(store, job.id)) changed = true;
  }
  return changed;
}

export async function getOpinionTotal(): Promise<number> {
  return enqueue(async () => {
    const store = await readStoreUnlocked();
    if (await syncDoneJobs(store)) await writeStoreUnlocked(store);
    return OPINION_COUNT_BASE + store.extra;
  });
}

export async function recordOpinion(id: string): Promise<number> {
  return enqueue(async () => {
    const store = await readStoreUnlocked();
    const fromJobs = await syncDoneJobs(store);
    const fromId = credit(store, id);
    if (fromJobs || fromId) await writeStoreUnlocked(store);
    return OPINION_COUNT_BASE + store.extra;
  });
}
