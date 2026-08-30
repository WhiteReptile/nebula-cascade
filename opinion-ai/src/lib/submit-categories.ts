import type { CategoryId } from "@/lib/types";

export const SUBMIT_CATEGORY_IDS = [
  "music",
  "documents",
  "video",
  "physical_appearance",
  "text",
] as const satisfies readonly CategoryId[];

export type SubmitCategoryId = (typeof SUBMIT_CATEGORY_IDS)[number];

export function parseSubmitCategory(value: string | null | undefined): SubmitCategoryId {
  if (value && (SUBMIT_CATEGORY_IDS as readonly string[]).includes(value)) {
    return value as SubmitCategoryId;
  }
  return "text";
}
