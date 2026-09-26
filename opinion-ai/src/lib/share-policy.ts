export type PaidTier = "human-ai" | "human-ai-pro";

/** PRO packages are always private — opinion is not shared. */
export function isPrivatePack(tier: string | null | undefined): boolean {
  return tier === "human-ai-pro";
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
  return tier === "human-ai-pro" ? 10 : 5;
}

export function parsePackTier(value: string | null | undefined): PaidTier | null {
  if (value === "human-ai" || value === "human-ai-pro") return value;
  return null;
}
