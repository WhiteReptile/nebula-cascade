import { PDFParse } from "pdf-parse";

export const MAX_TEXT_PDF_BYTES = 12 * 1024 * 1024;

export function isPdfUpload(file: File | null | undefined): file is File {
  if (!file || file.size === 0) return false;
  const name = file.name.toLowerCase();
  return file.type === "application/pdf" || name.endsWith(".pdf");
}

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return typeof result.text === "string" ? result.text.trim() : "";
  } finally {
    await parser.destroy();
  }
}
