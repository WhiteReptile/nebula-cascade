import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { dataDir } from "@/lib/queue";

/** Groq free-tier style caps for openai/gpt-oss-20b (org-wide). */
export const GROQ_FREE_LIMITS = {
  requestsPerMinute: 30,
  requestsPerDay: 1000,
  tokensPerMinute: 8000,
} as const;

export type LlmUsageKind = "evaluate" | "human_review" | "demo";

type UsageEvent = {
  at: string;
  kind: LlmUsageKind;
  demo?: boolean;
};

type UsageStore = {
  events: UsageEvent[];
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
  return path.join(dataDir(), "llm-usage.json");
}

async function readStoreUnlocked(): Promise<UsageStore> {
  await mkdir(dataDir(), { recursive: true });
  try {
    const raw = await readFile(storePath(), "utf8");
    const parsed = JSON.parse(raw) as UsageStore;
    if (!parsed || !Array.isArray(parsed.events)) return { events: [] };
    return { events: parsed.events };
  } catch {
    return { events: [] };
  }
}

async function writeStoreUnlocked(store: UsageStore): Promise<void> {
  await mkdir(dataDir(), { recursive: true });
  await writeFile(storePath(), `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function prune(events: UsageEvent[], olderThanMs: number): UsageEvent[] {
  const cutoff = Date.now() - olderThanMs;
  return events.filter((e) => Date.parse(e.at) >= cutoff);
}

export async function recordLlmUsage(kind: LlmUsageKind, demo = false): Promise<void> {
  await enqueue(async () => {
    const store = await readStoreUnlocked();
    store.events.push({ at: new Date().toISOString(), kind, demo: demo || undefined });
    // Keep ~2 days so daily charts stay useful
    store.events = prune(store.events, 48 * 60 * 60 * 1000);
    await writeStoreUnlocked(store);
  });
}

function countSince(events: UsageEvent[], msAgo: number, kinds?: LlmUsageKind[]): number {
  const cutoff = Date.now() - msAgo;
  return events.filter((e) => {
    if (Date.parse(e.at) < cutoff) return false;
    if (kinds && !kinds.includes(e.kind)) return false;
    return true;
  }).length;
}

function hourBuckets(events: UsageEvent[], hours: number): { label: string; count: number }[] {
  const now = Date.now();
  const buckets: { label: string; count: number }[] = [];
  for (let i = hours - 1; i >= 0; i -= 1) {
    const start = now - (i + 1) * 60 * 60 * 1000;
    const end = now - i * 60 * 60 * 1000;
    const count = events.filter((e) => {
      const t = Date.parse(e.at);
      return t >= start && t < end;
    }).length;
    const d = new Date(end);
    const label = `${d.getHours().toString().padStart(2, "0")}:00`;
    buckets.push({ label, count });
  }
  return buckets;
}

export type UsageOutlook = {
  limits: typeof GROQ_FREE_LIMITS;
  lastMinute: number;
  lastHour: number;
  today: number;
  evaluateToday: number;
  humanReviewToday: number;
  demoToday: number;
  minuteFillPct: number;
  dayFillPct: number;
  level: "calm" | "busy" | "hot" | "over";
  peopleEstimate: {
    light: number;
    heavy: number;
  };
  hourChart: { label: string; count: number }[];
  updatedAt: string;
};

function levelFor(dayPct: number, minutePct: number): UsageOutlook["level"] {
  if (dayPct >= 100 || minutePct >= 100) return "over";
  if (dayPct >= 80 || minutePct >= 80) return "hot";
  if (dayPct >= 40 || minutePct >= 40) return "busy";
  return "calm";
}

export async function getUsageOutlook(): Promise<UsageOutlook> {
  return enqueue(async () => {
    const store = await readStoreUnlocked();
    const events = prune(store.events, 48 * 60 * 60 * 1000);
    if (events.length !== store.events.length) {
      store.events = events;
      await writeStoreUnlocked(store);
    }

    const lastMinute = countSince(events, 60 * 1000);
    const lastHour = countSince(events, 60 * 60 * 1000);
    const today = countSince(events, 24 * 60 * 60 * 1000);
    const evaluateToday = countSince(events, 24 * 60 * 60 * 1000, ["evaluate"]);
    const humanReviewToday = countSince(events, 24 * 60 * 60 * 1000, ["human_review"]);
    const demoToday = countSince(events, 24 * 60 * 60 * 1000, ["demo"]);

    const minuteFillPct = Math.min(
      100,
      Math.round((lastMinute / GROQ_FREE_LIMITS.requestsPerMinute) * 100),
    );
    const dayFillPct = Math.min(
      100,
      Math.round((today / GROQ_FREE_LIMITS.requestsPerDay) * 100),
    );

    return {
      limits: GROQ_FREE_LIMITS,
      lastMinute,
      lastHour,
      today,
      evaluateToday,
      humanReviewToday,
      demoToday,
      minuteFillPct,
      dayFillPct,
      level: levelFor(dayFillPct, minuteFillPct),
      peopleEstimate: {
        // ~1 ask/person/day vs ~5 free asks/person/day on current free tier
        light: Math.max(0, GROQ_FREE_LIMITS.requestsPerDay - today),
        heavy: Math.max(0, Math.floor((GROQ_FREE_LIMITS.requestsPerDay - today) / 5)),
      },
      hourChart: hourBuckets(events, 12),
      updatedAt: new Date().toISOString(),
    };
  });
}
