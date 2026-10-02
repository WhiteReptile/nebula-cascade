/** Max user text for instant AI (home chat + Submit paste). Over this → PDF + human queue. */
export const MAX_CONTENT_WORDS = 8_000;
/** Hard character cap (~8 chars/word) so paste cannot explode memory. */
export const MAX_CONTENT_CHARS = MAX_CONTENT_WORDS * 8;

export const NEED_PDF_EVENT = "yourtruths:need-pdf";

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function isOverWordLimit(text: string): boolean {
  return countWords(text) > MAX_CONTENT_WORDS || text.length > MAX_CONTENT_CHARS;
}

export function contentLimitError(text: string): string | null {
  if (countWords(text) > MAX_CONTENT_WORDS) {
    return `Submission too long (max ${MAX_CONTENT_WORDS.toLocaleString()} words).`;
  }
  if (text.length > MAX_CONTENT_CHARS) {
    return `Submission too long (max ${MAX_CONTENT_CHARS.toLocaleString()} characters).`;
  }
  return null;
}

export function flashPdfPick(): void {
  if (typeof document === "undefined") return;
  const wrap = document.getElementById("submit-pdf-pick");
  if (!wrap) return;
  wrap.classList.add("file-pick-flash");
  wrap.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => wrap.classList.remove("file-pick-flash"), 2800);
}

export function dispatchNeedPdf(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NEED_PDF_EVENT));
}

/** Rough English input tokens for Groq (GPT-style: ~1.3 tokens/word). */
export const GROQ_TOKENS_PER_WORD = 1.3;
export const GROQ_INPUT_TOKENS_AT_MAX_WORDS = Math.round(MAX_CONTENT_WORDS * GROQ_TOKENS_PER_WORD);
