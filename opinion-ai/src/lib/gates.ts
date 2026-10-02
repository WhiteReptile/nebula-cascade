export function envFlag(name: string, defaultOn: boolean): boolean {
  const value = process.env[name]?.trim().toLowerCase();
  if (value === "1" || value === "true" || value === "yes") return true;
  if (value === "0" || value === "false" || value === "no") return false;
  return defaultOn;
}

/** Free text AI. Off = closed except admin. Default on. */
export function publicOpen(): boolean {
  return envFlag("PUBLIC_OPEN", true);
}

/**
 * Music / video / images / long PDFs.
 * Default: open in development, closed in production until you set HYBRID_QUEUE_OPEN=1.
 */
export function hybridQueueOpen(): boolean {
  return envFlag("HYBRID_QUEUE_OPEN", process.env.NODE_ENV !== "production");
}

/** Shared opinions list. Default closed in production. */
export function publicReviewsOpen(): boolean {
  return envFlag("PUBLIC_REVIEWS", process.env.NODE_ENV !== "production");
}

export function llmDailyMaxCalls(): number {
  const raw = process.env.LLM_DAILY_MAX_CALLS?.trim();
  const n = raw ? Number(raw) : 1000;
  if (!Number.isFinite(n) || n < 1) return 1000;
  return Math.floor(n);
}

export function queuePerHourLimit(): number {
  const raw = process.env.QUEUE_PER_HOUR?.trim();
  const n = raw ? Number(raw) : 5;
  if (!Number.isFinite(n) || n < 1) return 5;
  return Math.floor(n);
}
