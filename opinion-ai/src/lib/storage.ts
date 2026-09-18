"use client";

import type { HistoryEntry, Verdict } from "./types";

export type ServerReview = {
  id: string;
  status: "pending" | "done";
  categoryLabel: string;
  scoreContext: string;
  createdAt: string;
  verdict?: Verdict;
};

const HISTORY_KEY = "opinion-ai-history";
const USAGE_KEY = "opinion-ai-usage";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveVerdict(verdict: Verdict): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`opinion-ai-verdict-${verdict.id}`, JSON.stringify(verdict));
  const entry: HistoryEntry = {
    id: verdict.id,
    score: verdict.score,
    categoryLabel: verdict.categoryLabel,
    scoreContext: verdict.scoreContext,
    verdictPreview: verdict.verdict.slice(0, 100),
    createdAt: verdict.createdAt,
  };
  const history = getHistory().filter((h) => h.id !== verdict.id);
  history.unshift(entry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
}

export function savePendingJob(entry: Omit<HistoryEntry, "pending" | "score" | "verdictPreview"> & Partial<HistoryEntry>): void {
  if (typeof window === "undefined") return;
  const existing = getHistory().find((h) => h.id === entry.id);
  if (existing && !existing.pending) return;
  const next: HistoryEntry = {
    id: entry.id,
    score: 0,
    categoryLabel: entry.categoryLabel,
    scoreContext: entry.scoreContext ?? "",
    verdictPreview: "Waiting for a human…",
    createdAt: entry.createdAt,
    pending: true,
  };
  const history = getHistory().filter((h) => h.id !== entry.id);
  history.unshift(next);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
}

export function mergeServerReviews(reviews: ServerReview[]): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  for (const review of reviews) {
    if (review.status === "done" && review.verdict) {
      saveVerdict(review.verdict);
      continue;
    }
    if (review.status === "pending") {
      savePendingJob({
        id: review.id,
        categoryLabel: review.categoryLabel,
        scoreContext: review.scoreContext,
        createdAt: review.createdAt,
      });
    }
  }
  return getHistory().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getVerdict(id: string): Verdict | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`opinion-ai-verdict-${id}`);
    return raw ? (JSON.parse(raw) as Verdict) : null;
  } catch {
    return null;
  }
}

export function getDailyUsage(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (!raw) return 0;
    const usage = JSON.parse(raw) as Record<string, number>;
    return usage[todayKey()] ?? 0;
  } catch {
    return 0;
  }
}

export function incrementDailyUsage(): void {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(USAGE_KEY);
  const usage: Record<string, number> = raw ? JSON.parse(raw) : {};
  const key = todayKey();
  usage[key] = (usage[key] ?? 0) + 1;
  localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
}

export type PaidTier = "human-ai" | "human-ai-pro";

export type PaidPack = {
  tier: PaidTier;
  credits: number;
};

const PACK_KEY = "opinion-ai-paid-pack";

export function getPaidPack(): PaidPack | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PACK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PaidPack;
    if (parsed.tier !== "human-ai" && parsed.tier !== "human-ai-pro") return null;
    if (!Number.isInteger(parsed.credits) || parsed.credits < 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setPaidPack(pack: PaidPack): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PACK_KEY, JSON.stringify(pack));
}

export function spendPaidCredit(): PaidPack | null {
  const pack = getPaidPack();
  if (!pack || pack.credits < 1) return null;
  const next = { ...pack, credits: pack.credits - 1 };
  setPaidPack(next);
  return next;
}
