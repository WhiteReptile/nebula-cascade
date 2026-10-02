import { addJob, type QueueJob } from "@/lib/queue";
import { isExaminerModel, type ExaminerModel } from "@/lib/queue-shared";
import { MAX_TEXT_PDF_BYTES } from "@/lib/pdf-extract";

export async function queueLongPdfJob(input: {
  file: File;
  notes?: string;
  model?: string;
}): Promise<string> {
  if (input.file.size > MAX_TEXT_PDF_BYTES) {
    throw new Error("PDF is too large (max 12 MB).");
  }
  const examinerModel: ExaminerModel = isExaminerModel(input.model) ? input.model : "pro-examiner-v2";
  const notes = input.notes?.trim() || "Long document (over 8,000 words). Review the attached PDF.";
  const buffer = Buffer.from(await input.file.arrayBuffer());
  const job: QueueJob = {
    id: crypto.randomUUID(),
    category: "documents",
    filename: input.file.name || "document.pdf",
    mimeType: input.file.type || "application/pdf",
    size: input.file.size,
    context: notes.slice(0, 8000),
    status: "UPLOADED",
    createdAt: new Date().toISOString(),
    share: false,
    examinerModel,
  };
  await addJob(job, buffer);
  return job.id;
}
