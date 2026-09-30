/** Estimated human-queue wait shown after submit. Not a hard timer. */
export function isPdfQueueCategory(category: string | undefined): boolean {
  return category === "documents" || category === "text";
}

export function queueWaitLine(category: string | undefined): string {
  if (isPdfQueueCategory(category)) {
    return "A review of this PDF can take about 3 minutes.";
  }
  return "A review of this file can take about 10 minutes.";
}
