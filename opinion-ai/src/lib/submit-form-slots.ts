import type { CategoryId } from "@/lib/types";

export type SubmitSlot = {
  id: CategoryId;
  label: string;
  fileAccept?: string;
  note: string;
};

export const SUBMIT_SLOTS: SubmitSlot[] = [
  {
    id: "music",
    label: "Music",
    fileAccept: "audio/*,.mp3,.wav,.m4a,.flac",
    note: "A person listens to the actual track — the sound, not a write-up. Send the file, and a little context. Your audio file is deleted after the opinion is saved.",
  },
  {
    id: "images",
    label: "Images",
    fileAccept: "image/*,.png,.jpg,.jpeg,.webp,.gif",
    note: "Posters, ads, artwork, and photos — work meant to be seen. A person looks at the image and judges composition, clarity, and impact. Send the file and a little context. Your image is deleted after the opinion is saved.",
  },
  {
    id: "video",
    label: "Video",
    fileAccept: "video/*",
    note: "A person watches it move. Film, clips, anything that lives in time. Send the file, then a little context. Over 2 minutes needs HUMAN + AI PRO.",
  },
  {
    id: "physical_appearance",
    label: "Physical appearance",
    fileAccept: "image/*,video/*,.png,.jpg,.jpeg,.webp,.gif,.mp4,.webm,.mov",
    note: "A person looks at the photo or video. Hair loss, residual baldness, plastic surgery — we say how it actually reads. Send the file, and a little context.",
  },
  {
    id: "text",
    label: "Text",
    note: "Words and PDFs. Paste writing or upload a PDF — poems, essays, homework, reports, screenplays. Instant AI opinion. Free for everyone.",
  },
];

export const QUEUE_CATEGORY_IDS: CategoryId[] = [
  "music",
  "images",
  "video",
  "physical_appearance",
];

export function submitTabHref(tab: CategoryId, revisionOf?: string): string {
  const params = new URLSearchParams();
  params.set("category", tab);
  if (revisionOf) params.set("revision", revisionOf);
  return `/submit?${params.toString()}`;
}
