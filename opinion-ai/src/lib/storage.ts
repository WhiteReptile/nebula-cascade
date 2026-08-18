"use client";

import type { HistoryEntry, Verdict } from "./types";

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
