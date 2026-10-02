import { extractTextFromPdf, isPdfUpload, MAX_TEXT_PDF_BYTES } from "./pdf-extract";

export type ResolvedTextSubmission = {
  content: string;
  context?: string;
};

export async function resolveTextSubmission(input: {
  pasted: string;
  pdfFile?: File | null;
}): Promise<ResolvedTextSubmission> {
  const pasted = input.pasted.trim();
  const pdfFile = input.pdfFile ?? null;

  if (pdfFile) {
    if (!isPdfUpload(pdfFile)) {
      throw new Error("Only PDF files are supported for upload.");
    }
    if (pdfFile.size > MAX_TEXT_PDF_BYTES) {
      throw new Error("PDF is too large (max 12 MB).");
    }

    const buffer = Buffer.from(await pdfFile.arrayBuffer());
    const extracted = await extractTextFromPdf(buffer);
    if (!extracted) {
      throw new Error(
        "Could not read text from this PDF. It may be scanned or image-only — paste the text instead.",
      );
    }

    if (pasted) {
      return { content: extracted, context: pasted };
    }
    return { content: extracted };
  }

  if (!pasted) {
    throw new Error("Paste your text or upload a PDF.");
  }

  return { content: pasted };
}
