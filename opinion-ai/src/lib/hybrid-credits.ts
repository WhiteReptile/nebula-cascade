import type { PaidTier } from "@/lib/share-policy";

/** 20 credits per human-minute. One 5-minute block = 100 credits. */
export const CREDITS_PER_MINUTE = 20;
export const BILLING_BLOCK_MINUTES = 5;
export const STANDARD_JOB_CREDITS = CREDITS_PER_MINUTE * BILLING_BLOCK_MINUTES;

export const HYBRID_PACK_CREDITS = 500;
export const HYBRID_PRO_PACK_CREDITS = 1000;

export const PACK_SCALE_V2 = "v2" as const;

export function packCreditsForTier(tier: PaidTier): number {
  return tier === "human-ai-pro" ? HYBRID_PRO_PACK_CREDITS : HYBRID_PACK_CREDITS;
}

export function formatClock(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Round duration up to the next 5-minute block (minimum one block). */
export function billedMinutes(durationSeconds: number): number {
  const minutes = Math.max(0, durationSeconds) / 60;
  if (minutes <= 0) return BILLING_BLOCK_MINUTES;
  return Math.ceil(minutes / BILLING_BLOCK_MINUTES) * BILLING_BLOCK_MINUTES;
}

export function creditsForDurationSeconds(durationSeconds: number): number {
  return billedMinutes(durationSeconds) * CREDITS_PER_MINUTE;
}

export type HybridJobKind = "timed" | "standard";

export function creditsForHybridJob(
  kind: HybridJobKind,
  durationSeconds?: number,
): number {
  if (kind === "timed") {
    return creditsForDurationSeconds(durationSeconds ?? 0);
  }
  return STANDARD_JOB_CREDITS;
}

export function hybridJobKindForCategory(
  category: string,
  opts?: { pdf?: boolean },
): HybridJobKind {
  if (category === "music" || category === "video") return "timed";
  if (opts?.pdf || category === "documents" || category === "images" || category === "physical_appearance") {
    return "standard";
  }
  return "standard";
}

export function creditNoun(category: string, opts?: { pdf?: boolean }): string {
  if (opts?.pdf || category === "documents") return "PDF";
  if (category === "video") return "video";
  if (category === "music") return "track";
  if (category === "physical_appearance") return "photo";
  if (category === "images") return "image";
  return "file";
}

export function migrateLegacyCredits(credits: number, scale?: string): number {
  if (scale === PACK_SCALE_V2) return credits;
  if (credits > 0 && credits <= 10) return credits * 100;
  return credits;
}

export type CreditConfirmState = {
  noun: string;
  clock?: string;
  cost: number;
  balance: number;
  billedMinutes?: number;
};

export function creditConfirmCopy(state: CreditConfirmState): string {
  const { noun, clock, cost, balance, billedMinutes: billed } = state;
  const subject = clock ? `Your ${clock} ${noun}` : `This ${noun}`;
  const block =
    billed && clock
      ? ` Time is billed in ${BILLING_BLOCK_MINUTES}-minute blocks (${billed} minutes).`
      : "";
  if (balance <= 0) {
    return `${subject} requires ${cost} Hybrid credits.${block} Hybrid is $15 for ${HYBRID_PACK_CREDITS} credits. Open Pricing to continue.`;
  }
  if (balance < cost) {
    return `${subject} requires ${cost} credits.${block} You have ${balance}. Open Pricing for more Hybrid credits.`;
  }
  return `${subject} requires ${cost} credits.${block} You have ${balance} credits.`;
}
