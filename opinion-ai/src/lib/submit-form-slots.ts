import type { CategoryId } from "@/lib/types";

export type SubmitSlot = {
  id: CategoryId;
  label: string;
  fileAccept?: string;
  note: string;
  /** Human review queue (paid). Everything else is free instant AI. */
  humanReview?: boolean;
};

export const SUBMIT_SLOTS: SubmitSlot[] = [
  {
    id: "music",
    label: "Music",
    fileAccept: "audio/*,.mp3,.wav,.m4a,.flac",
    humanReview: true,
    note: "A person listens to the actual track — the sound, not a write-up. Send the file, and a little context. Your audio file is deleted after the opinion is saved.",
  },
  {
    id: "images",
    label: "Images",
    fileAccept: "image/*,.png,.jpg,.jpeg,.webp,.gif",
    note: "Posters, ads, artwork, and photos. Describe what we should judge (and optionally attach the image). Instant AI opinion — free.",
  },
  {
    id: "video",
    label: "Video",
    fileAccept: "video/*",
    humanReview: true,
    note: "A person watches it move. Film, clips, anything that lives in time. Send the file, then a little context. Over 2 minutes needs HUMAN + AI PRO.",
  },
  {
    id: "physical_appearance",
    label: "Physical appearance",
    fileAccept: "image/*,.png,.jpg,.jpeg,.webp,.gif",
    note: "Hair loss, a procedure, how it reads. Describe what to judge (and optionally attach a photo). Instant AI opinion — free.",
  },
  {
    id: "text",
    label: "Text",
    note: "Words and PDFs. Paste writing or upload a PDF — poems, essays, homework, reports, screenplays. Instant AI opinion. Free for everyone.",
  },
];

/** Only music and video go to the human review queue. */
export const QUEUE_CATEGORY_IDS: CategoryId[] = ["music", "video"];

export const FREE_AI_CATEGORY_IDS: CategoryId[] = [
  "text",
  "images",
  "physical_appearance",
];

export function isFreeAiCategory(id: CategoryId): boolean {
  return FREE_AI_CATEGORY_IDS.includes(id);
}

export function submitTabHref(tab: CategoryId, revisionOf?: string): string {
  const params = new URLSearchParams();
  params.set("category", tab);
  if (revisionOf) params.set("revision", revisionOf);
  return `/submit?${params.toString()}`;
}
