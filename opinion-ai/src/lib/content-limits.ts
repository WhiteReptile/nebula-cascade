/** Max user text for the AI engine (home chat + Submit text/PDF). */
export const MAX_CONTENT_WORDS = 20_000;
/** Hard character cap (~8 chars/word) so paste cannot explode memory. */
export const MAX_CONTENT_CHARS = MAX_CONTENT_WORDS * 8;

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
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

/** Rough English input tokens for Groq (GPT-style: ~1.3 tokens/word). */
export const GROQ_TOKENS_PER_WORD = 1.3;
export const GROQ_INPUT_TOKENS_AT_MAX_WORDS = Math.round(MAX_CONTENT_WORDS * GROQ_TOKENS_PER_WORD);
