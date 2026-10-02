import type { HistoryEntry } from "@/lib/types";

/**
 * History is browser-local until user accounts exist.
 * Do not seed History from the public shared feed — that would leak others' jobs
 * and incorrectly hide the viewer's private submissions.
 */
export async function getServerHistory(): Promise<HistoryEntry[]> {
  return [];
}
