import { packCreditsForTier } from "@/lib/hybrid-credits";

export type PaidTier = "hybrid" | "hybrid-pro";

/** Map current and leftover pack ids onto Hybrid / Hybrid PRO. */
export function canonicalizePaidTier(value: string | null | undefined): PaidTier | null {
  if (value === "hybrid" || value === "human-ai") return "hybrid";
  if (value === "hybrid-pro" || value === "human-ai-pro") return "hybrid-pro";
  return null;
}

/** PRO packages are always private — opinion is not shared. */
export function isPrivatePack(tier: string | null | undefined): boolean {
  return canonicalizePaidTier(tier) === "hybrid-pro";
}

/** Parse share intent from form + pack. PRO always false. */
export function resolveShareFlag(input: {
  pack?: string | null;
  shareRaw?: FormDataEntryValue | null;
}): boolean {
  if (isPrivatePack(input.pack ?? undefined)) return false;
  return input.shareRaw === "1" || input.shareRaw === "on" || input.shareRaw === "true";
}

export function packCredits(tier: PaidTier): number {
  return packCreditsForTier(tier);
}

export function parsePackTier(value: string | null | undefined): PaidTier | null {
  return canonicalizePaidTier(value);
}
